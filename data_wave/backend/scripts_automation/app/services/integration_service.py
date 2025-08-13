from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.integration_models import (
    Integration, IntegrationLog, IntegrationTemplate,
    IntegrationResponse, IntegrationCreate, IntegrationUpdate,
    IntegrationStats, IntegrationType, IntegrationStatus
)
from app.models.scan_models import DataSource
import logging

logger = logging.getLogger(__name__)


class IntegrationService:
    """Service layer for integration management"""
    
    @staticmethod
    def get_integrations_by_data_source(session: Session, data_source_id: int) -> List[IntegrationResponse]:
        """Get all integrations for a data source"""
        try:
            statement = select(Integration).where(Integration.data_source_id == data_source_id)
            integrations = session.exec(statement).all()
            
            return [IntegrationResponse.from_orm(integration) for integration in integrations]
        except Exception as e:
            logger.error(f"Error getting integrations for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_integration_by_id(session: Session, integration_id: int) -> Optional[IntegrationResponse]:
        """Get integration by ID"""
        try:
            statement = select(Integration).where(Integration.id == integration_id)
            integration = session.exec(statement).first()
            
            if integration:
                return IntegrationResponse.from_orm(integration)
            return None
        except Exception as e:
            logger.error(f"Error getting integration {integration_id}: {str(e)}")
            return None
    
    @staticmethod
    def create_integration(session: Session, integration_data: IntegrationCreate, user_id: str) -> IntegrationResponse:
        """Create a new integration"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, integration_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {integration_data.data_source_id} not found")
            
            # Create integration
            integration = Integration(
                name=integration_data.name,
                type=integration_data.type,
                provider=integration_data.provider,
                description=integration_data.description,
                config=integration_data.config,
                sync_frequency=integration_data.sync_frequency,
                data_source_id=integration_data.data_source_id,
                status=IntegrationStatus.INACTIVE,
                created_by=user_id,
                updated_by=user_id
            )
            
            session.add(integration)
            session.commit()
            session.refresh(integration)
            
            logger.info(f"Created integration {integration.id} for data source {integration_data.data_source_id}")
            return IntegrationResponse.from_orm(integration)
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating integration: {str(e)}")
            raise
    
    @staticmethod
    def update_integration(session: Session, integration_id: int, update_data: IntegrationUpdate, user_id: str) -> Optional[IntegrationResponse]:
        """Update an existing integration"""
        try:
            integration = session.get(Integration, integration_id)
            if not integration:
                return None
            
            # Update fields
            update_dict = update_data.dict(exclude_unset=True)
            for field, value in update_dict.items():
                setattr(integration, field, value)
            
            integration.updated_at = datetime.utcnow()
            integration.updated_by = user_id
            
            session.add(integration)
            session.commit()
            session.refresh(integration)
            
            logger.info(f"Updated integration {integration_id}")
            return IntegrationResponse.from_orm(integration)
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating integration {integration_id}: {str(e)}")
            raise
    
    @staticmethod
    def delete_integration(session: Session, integration_id: int) -> bool:
        """Delete an integration"""
        try:
            integration = session.get(Integration, integration_id)
            if not integration:
                return False
            
            # Delete related logs first
            log_statement = select(IntegrationLog).where(IntegrationLog.integration_id == integration_id)
            logs = session.exec(log_statement).all()
            for log in logs:
                session.delete(log)
            
            # Delete integration
            session.delete(integration)
            session.commit()
            
            logger.info(f"Deleted integration {integration_id}")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error deleting integration {integration_id}: {str(e)}")
            return False
    
    @staticmethod
    def trigger_sync(session: Session, integration_id: int, user_id: str) -> bool:
        """Trigger manual sync for an integration"""
        try:
            integration = session.get(Integration, integration_id)
            if not integration:
                return False
            
            # Update sync status
            integration.status = IntegrationStatus.CONNECTING
            integration.updated_by = user_id
            session.add(integration)
            
            # Log sync trigger
            log = IntegrationLog(
                integration_id=integration_id,
                status="triggered",
                message=f"Manual sync triggered by {user_id}"
            )
            session.add(log)
            
            session.commit()
            
            # Implement actual sync logic based on integration type
            await self._execute_integration_sync(integration_id, integration)
            logger.info(f"Triggered sync for integration {integration_id}")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error triggering sync for integration {integration_id}: {str(e)}")
            return False
    
    @staticmethod
    def get_integration_stats(session: Session, data_source_id: int) -> IntegrationStats:
        """Get integration statistics for a data source"""
        try:
            statement = select(Integration).where(Integration.data_source_id == data_source_id)
            integrations = session.exec(statement).all()
            
            total_integrations = len(integrations)
            active_integrations = len([i for i in integrations if i.status == IntegrationStatus.ACTIVE])
            error_integrations = len([i for i in integrations if i.status == IntegrationStatus.ERROR])
            
            total_data_volume = sum(i.data_volume for i in integrations)
            avg_success_rate = sum(i.success_rate for i in integrations) / total_integrations if total_integrations > 0 else 0
            
            # Get last sync time
            last_sync_time = None
            if integrations:
                last_syncs = [i.last_sync for i in integrations if i.last_sync]
                if last_syncs:
                    last_sync_time = max(last_syncs)
            
            return IntegrationStats(
                total_integrations=total_integrations,
                active_integrations=active_integrations,
                error_integrations=error_integrations,
                total_data_volume=total_data_volume,
                avg_success_rate=avg_success_rate,
                last_sync_time=last_sync_time
            )
        except Exception as e:
            logger.error(f"Error getting integration stats for data source {data_source_id}: {str(e)}")
            return IntegrationStats(
                total_integrations=0,
                active_integrations=0,
                error_integrations=0,
                total_data_volume=0,
                avg_success_rate=0.0
            )
    
    @staticmethod
    def get_integration_templates(session: Session) -> List[IntegrationTemplate]:
        """Get all available integration templates"""
        try:
            statement = select(IntegrationTemplate).where(IntegrationTemplate.is_active == True)
            templates = session.exec(statement).all()
            return templates
        except Exception as e:
            logger.error(f"Error getting integration templates: {str(e)}")
            return []
    
    @staticmethod
    def update_integration_metrics(session: Session, integration_id: int, success: bool, duration_ms: int, records_processed: int = 0):
        """Update integration metrics after sync"""
        try:
            integration = session.get(Integration, integration_id)
            if not integration:
                return
            
            # Update sync time
            integration.last_sync = datetime.utcnow()
            
            # Calculate next sync time based on frequency
            if integration.sync_frequency == "1h":
                integration.next_sync = datetime.utcnow() + timedelta(hours=1)
            elif integration.sync_frequency == "4h":
                integration.next_sync = datetime.utcnow() + timedelta(hours=4)
            elif integration.sync_frequency == "24h":
                integration.next_sync = datetime.utcnow() + timedelta(days=1)
            
            # Update error count and success rate
            if not success:
                integration.error_count += 1
                integration.status = IntegrationStatus.ERROR
            else:
                integration.status = IntegrationStatus.ACTIVE
                integration.data_volume += records_processed
            
            # Recalculate success rate (simplified)
            total_runs = integration.error_count + (integration.data_volume / max(records_processed, 1))
            integration.success_rate = ((total_runs - integration.error_count) / total_runs) * 100 if total_runs > 0 else 0
            
            session.add(integration)
            
            # Log the sync result
            log = IntegrationLog(
                integration_id=integration_id,
                status="success" if success else "error",
                duration_ms=duration_ms,
                records_processed=records_processed,
                message=f"Sync completed - {'Success' if success else 'Failed'}"
            )
            session.add(log)
            
            session.commit()
            logger.info(f"Updated metrics for integration {integration_id}")
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating integration metrics: {str(e)}")
    
    @staticmethod
    def get_integration_logs(session: Session, integration_id: int, limit: int = 100) -> List[IntegrationLog]:
        """Get integration execution logs"""
        try:
            statement = (
                select(IntegrationLog)
                .where(IntegrationLog.integration_id == integration_id)
                .order_by(IntegrationLog.execution_time.desc())
                .limit(limit)
            )
            logs = session.exec(statement).all()
            return logs
        except Exception as e:
            logger.error(f"Error getting integration logs for {integration_id}: {str(e)}")
            raise
    
    async def _execute_integration_sync(self, integration_id: str, integration: Integration):
        """Execute actual integration synchronization based on integration type"""
        try:
            integration_type = integration.integration_type
            
            if integration_type == "azure_purview":
                await self._sync_azure_purview(integration_id, integration)
            elif integration_type == "databricks":
                await self._sync_databricks(integration_id, integration)
            elif integration_type == "snowflake":
                await self._sync_snowflake(integration_id, integration)
            elif integration_type == "aws_glue":
                await self._sync_aws_glue(integration_id, integration)
            elif integration_type == "apache_atlas":
                await self._sync_apache_atlas(integration_id, integration)
            else:
                logger.warning(f"Unknown integration type: {integration_type}")
                
        except Exception as e:
            logger.error(f"Error executing integration sync: {str(e)}")
            await self._log_integration_error(integration_id, str(e))
    
    async def _sync_azure_purview(self, integration_id: str, integration: Integration):
        """Synchronize with Azure Purview"""
        try:
            from azure.identity import DefaultAzureCredential
            from azure.purview.catalog import PurviewCatalogClient
            
            config = integration.config
            credential = DefaultAzureCredential()
            client = PurviewCatalogClient(
                endpoint=config.get("endpoint"),
                credential=credential
            )
            
            # Sync assets from Purview
            assets = await self._fetch_purview_assets(client)
            await self._update_local_catalog(integration_id, assets)
            
        except Exception as e:
            logger.error(f"Error syncing with Azure Purview: {str(e)}")
            raise
    
    async def _sync_databricks(self, integration_id: str, integration: Integration):
        """Synchronize with Databricks"""
        try:
            import requests
            
            config = integration.config
            headers = {
                "Authorization": f"Bearer {config.get('access_token')}",
                "Content-Type": "application/json"
            }
            
            # Get workspace information
            workspace_url = config.get("workspace_url")
            response = requests.get(
                f"{workspace_url}/api/2.0/workspace/list",
                headers=headers
            )
            
            if response.status_code == 200:
                workspace_data = response.json()
                await self._update_local_catalog(integration_id, workspace_data)
            
        except Exception as e:
            logger.error(f"Error syncing with Databricks: {str(e)}")
            raise
    
    async def _sync_snowflake(self, integration_id: str, integration: Integration):
        """Synchronize with Snowflake"""
        try:
            import snowflake.connector
            
            config = integration.config
            conn = snowflake.connector.connect(
                user=config.get("username"),
                password=config.get("password"),
                account=config.get("account"),
                warehouse=config.get("warehouse"),
                database=config.get("database"),
                schema=config.get("schema")
            )
            
            # Query metadata from Snowflake
            cursor = conn.cursor()
            cursor.execute("SHOW DATABASES")
            databases = cursor.fetchall()
            
            await self._update_local_catalog(integration_id, databases)
            
        except Exception as e:
            logger.error(f"Error syncing with Snowflake: {str(e)}")
            raise
    
    async def _sync_aws_glue(self, integration_id: str, integration: Integration):
        """Synchronize with AWS Glue"""
        try:
            import boto3
            
            config = integration.config
            glue_client = boto3.client(
                'glue',
                aws_access_key_id=config.get("access_key"),
                aws_secret_access_key=config.get("secret_key"),
                region_name=config.get("region")
            )
            
            # Get databases and tables from Glue
            databases = glue_client.get_databases()
            await self._update_local_catalog(integration_id, databases)
            
        except Exception as e:
            logger.error(f"Error syncing with AWS Glue: {str(e)}")
            raise
    
    async def _sync_apache_atlas(self, integration_id: str, integration: Integration):
        """Synchronize with Apache Atlas"""
        try:
            import requests
            
            config = integration.config
            atlas_url = config.get("atlas_url")
            username = config.get("username")
            password = config.get("password")
            
            # Authenticate and get entities
            auth = (username, password)
            response = requests.get(
                f"{atlas_url}/api/atlas/v2/search/basic",
                auth=auth,
                params={"type": "DataSet"}
            )
            
            if response.status_code == 200:
                entities = response.json()
                await self._update_local_catalog(integration_id, entities)
            
        except Exception as e:
            logger.error(f"Error syncing with Apache Atlas: {str(e)}")
            raise
    
    async def _fetch_purview_assets(self, client):
        """Fetch assets from Purview catalog"""
        # Implement Purview asset fetching logic
        return []
    
    async def _update_local_catalog(self, integration_id: str, data):
        """Update local catalog with synchronized data"""
        try:
            from app.models.catalog_models import CatalogEntry
            from app.db_session import get_session
            
            with get_session() as session:
                # Process and store synchronized data
                logger.info(f"Updating local catalog for integration {integration_id}")
                # Implement catalog update logic based on data format
                
        except Exception as e:
            logger.error(f"Error updating local catalog: {str(e)}")
            raise
    
    async def _log_integration_error(self, integration_id: str, error_message: str):
        """Log integration error"""
        try:
            from app.models.integration_models import IntegrationLog
            from app.db_session import get_session
            
            with get_session() as session:
                log_entry = IntegrationLog(
                    integration_id=integration_id,
                    level="ERROR",
                    message=error_message,
                    timestamp=datetime.utcnow()
                )
                session.add(log_entry)
                session.commit()
                
        except Exception as e:
            logger.error(f"Error logging integration error: {str(e)}")