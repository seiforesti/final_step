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
from sqlalchemy import func

logger = logging.getLogger(__name__)


class IntegrationService:
    """Service layer for integration management"""
    
    @staticmethod
    def get_integrations_by_data_source(session: Session, data_source_id: int) -> List[IntegrationResponse]:
        """Get all integrations for a data source"""
        try:
            statement = select(Integration).where(Integration.data_source_id == data_source_id)
            integrations = session.execute(statement).scalars().all()
            
            return [IntegrationResponse.from_orm(integration) for integration in integrations]
        except Exception as e:
            logger.error(f"Error getting integrations for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def get_integration_by_id(session: Session, integration_id: int) -> Optional[IntegrationResponse]:
        """Get integration by ID"""
        try:
            statement = select(Integration).where(Integration.id == integration_id)
            integration = session.execute(statement).scalars().first()
            
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
            logs = session.execute(log_statement).scalars().all()
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
            
            # Actual sync logic: delegate to provider-specific adapter via registry
            try:
                from app.services.integration_providers import IntegrationProviderRegistry  # type: ignore
                provider = IntegrationProviderRegistry.get(integration.provider)
                if not provider:
                    raise RuntimeError(f"No provider registered for {integration.provider}")

                started_at = datetime.utcnow()
                records = provider.sync(integration.config)
                duration_ms = int((datetime.utcnow() - started_at).total_seconds() * 1000)

                IntegrationService.update_integration_metrics(
                    session=session,
                    integration_id=integration_id,
                    success=True,
                    duration_ms=duration_ms,
                    records_processed=len(records) if isinstance(records, list) else int(records or 0),
                )
                logger.info(f"Sync completed for integration {integration_id} in {duration_ms} ms")
            except Exception as sync_err:
                IntegrationService.update_integration_metrics(
                    session=session,
                    integration_id=integration_id,
                    success=False,
                    duration_ms=0,
                    records_processed=0,
                )
                logger.error(f"Integration sync failed for {integration_id}: {sync_err}")
            return True
        except Exception as e:
            session.rollback()
            logger.error(f"Error triggering sync for integration {integration_id}: {str(e)}")
            return False
    
    @staticmethod
    def get_integration_stats(session: Session, data_source_id: Optional[int] = None) -> IntegrationStats:
        """Get integration statistics for a data source or all integrations if data_source_id is None"""
        try:
            if data_source_id is not None:
                statement = select(Integration).where(Integration.data_source_id == data_source_id)
            else:
                statement = select(Integration)
            
            integrations = session.execute(statement).scalars().all()
            
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
            scope = f"data source {data_source_id}" if data_source_id is not None else "all integrations"
            logger.error(f"Error getting integration stats for {scope}: {str(e)}")
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
            templates = session.execute(statement).scalars().all()
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
            result = session.execute(statement)
            logs = result.scalars().all()
            return logs
        except Exception as e:
            logger.error(f"Error getting integration logs for {integration_id}: {str(e)}")
            return []

    @staticmethod
    def get_all_integrations(
        session: Session, 
        user_id: str = None,
        status: Optional[IntegrationStatus] = None,
        type: Optional[IntegrationType] = None,
        provider: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get all integrations with filtering and pagination"""
        try:
            # Build query with filters
            query = select(Integration)
            
            # Apply filters
            if status:
                query = query.where(Integration.status == status)
            if type:
                query = query.where(Integration.type == type)
            if provider:
                query = query.where(Integration.provider == provider)
            
            # Get total count for pagination
            count_query = select(func.count(Integration.id))
            if status:
                count_query = count_query.where(Integration.status == status)
            if type:
                count_query = count_query.where(Integration.type == type)
            if provider:
                count_query = count_query.where(Integration.provider == provider)
            
            total_count_result = session.execute(count_query)
            total_count = total_count_result.scalar() or 0
            
            # Apply pagination and ordering
            query = query.order_by(Integration.created_at.desc()).offset(offset).limit(limit)
            integrations_result = session.execute(query)
            integrations = integrations_result.scalars().all()
            
            # Convert to response models
            integration_responses = [IntegrationResponse.from_orm(integration) for integration in integrations]
            
            # Get integration stats
            stats = IntegrationService.get_integration_stats(session, None)  # None for all data sources
            
            return {
                "integrations": integration_responses,
                "total": total_count,
                "page": (offset // limit) + 1,
                "limit": limit,
                "has_more": (offset + limit) < total_count,
                "stats": {
                    "total_integrations": stats.total_integrations,
                    "active_integrations": stats.active_integrations,
                    "error_integrations": stats.error_integrations,
                    "avg_success_rate": stats.avg_success_rate
                }
            }
        except Exception as e:
            logger.error(f"Error getting all integrations: {str(e)}")
            return {
                "integrations": [],
                "total": 0,
                "page": 1,
                "limit": limit,
                "has_more": False,
                "stats": {
                    "total_integrations": 0,
                    "active_integrations": 0,
                    "error_integrations": 0,
                    "avg_success_rate": 0.0
                }
            }