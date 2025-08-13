"""Service for managing scan operations."""

from typing import List, Optional, Dict, Any, Union
from sqlmodel import Session, select
from app.models.scan_models import (
    Scan, ScanStatus, ScanResult, DataSource, ScanRuleSet,
    DiscoveryHistory, DiscoveryStatus
)
from app.services.scan_rule_set_service import ScanRuleSetService
from sqlalchemy.exc import SQLAlchemyError
import logging
from datetime import datetime
import requests
import json
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Setup logging
logger = logging.getLogger(__name__)


class ScanService:
    """Service for managing scan operations."""
    
    # Extraction service endpoint
    EXTRACTION_SERVICE_URL = "http://extractor:8000"
    
    @staticmethod
    def create_scan(
        session: Session,
        name: str,
        data_source_id: int,
        scan_rule_set_id: Optional[int] = None,
        description: Optional[str] = None
    ) -> Scan:
        """Create a new scan."""
        try:
            # Validate data source
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source with ID {data_source_id} not found")
            
            # Validate scan rule set if provided
            if scan_rule_set_id is not None:
                scan_rule_set = session.get(ScanRuleSet, scan_rule_set_id)
                if not scan_rule_set:
                    raise ValueError(f"Scan rule set with ID {scan_rule_set_id} not found")
            
            scan = Scan(
                name=name,
                description=description,
                data_source_id=data_source_id,
                scan_rule_set_id=scan_rule_set_id,
                scan_id=str(uuid.uuid4())
            )
            
            session.add(scan)
            session.commit()
            session.refresh(scan)
            logger.info(f"Created scan: {name} (ID: {scan.id})")
            return scan
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating scan: {str(e)}")
            raise
    
    @staticmethod
    def get_scan(session: Session, scan_id: int) -> Optional[Scan]:
        """Get a scan by ID."""
        return session.get(Scan, scan_id)
    
    @staticmethod
    def get_scan_by_uuid(session: Session, scan_uuid: str) -> Optional[Scan]:
        """Get a scan by UUID."""
        return session.exec(select(Scan).where(Scan.scan_id == scan_uuid)).first()
    
    @staticmethod
    def get_all_scans(session: Session) -> List[Scan]:
        """Get all scans."""
        return list(session.exec(select(Scan)).all())
    
    @staticmethod
    def get_scans_by_data_source(session: Session, data_source_id: int) -> List[Scan]:
        """Get all scans for a specific data source."""
        return list(session.exec(select(Scan).where(Scan.data_source_id == data_source_id)).all())
    
    @staticmethod
    def get_scans_by_status(session: Session, status: Union[ScanStatus, str]) -> List[Scan]:
        """Get all scans with a specific status."""
        if isinstance(status, str):
            status = ScanStatus(status)
        return list(session.exec(select(Scan).where(Scan.status == status)).all())
    
    @staticmethod
    def update_scan_status(
        session: Session,
        scan_id: int,
        status: Union[ScanStatus, str],
        error_message: Optional[str] = None
    ) -> Optional[Scan]:
        """Update a scan's status."""
        scan = session.get(Scan, scan_id)
        if not scan:
            return None
        
        if isinstance(status, str):
            status = ScanStatus(status)
        
        scan.status = status
        scan.updated_at = datetime.utcnow()
        
        if status == ScanStatus.RUNNING and not scan.started_at:
            scan.started_at = datetime.utcnow()
        
        if status in [ScanStatus.COMPLETED, ScanStatus.FAILED, ScanStatus.CANCELLED] and not scan.completed_at:
            scan.completed_at = datetime.utcnow()
        
        if error_message:
            scan.error_message = error_message
        
        session.add(scan)
        session.commit()
        session.refresh(scan)
        logger.info(f"Updated scan status: {scan.name} (ID: {scan_id}) to {status}")
        return scan
    
    @staticmethod
    def delete_scan(session: Session, scan_id: int) -> bool:
        """Delete a scan."""
        scan = session.get(Scan, scan_id)
        if not scan:
            return False
        
        session.delete(scan)
        session.commit()
        logger.info(f"Deleted scan: {scan.name} (ID: {scan_id})")
        return True
    
    @staticmethod
    def execute_scan(session: Session, scan_id: int) -> Dict[str, Any]:
        """Execute a scan."""
        scan = session.get(Scan, scan_id)
        if not scan:
            return {"success": False, "message": f"Scan with ID {scan_id} not found"}
        
        # Check if scan is already running
        if scan.status == ScanStatus.RUNNING:
            return {"success": False, "message": f"Scan {scan.name} is already running"}
        
        # Update scan status to running
        ScanService.update_scan_status(session, scan_id, ScanStatus.RUNNING)
        
        try:
            # Get data source and scan rule set
            data_source = session.get(DataSource, scan.data_source_id)
            if not data_source:
                raise ValueError(f"Data source with ID {scan.data_source_id} not found")
                
            scan_rule_set = None
            if scan.scan_rule_set_id:
                scan_rule_set = session.get(ScanRuleSet, scan.scan_rule_set_id)
            
            # Execute scan asynchronously
            asyncio.create_task(ScanService._execute_scan_async(scan, data_source, scan_rule_set))
            
            return {"success": True, "message": f"Scan {scan.name} started successfully", "scan_id": scan.id}
        except Exception as e:
            logger.error(f"Error starting scan: {str(e)}")
            ScanService.update_scan_status(session, scan_id, ScanStatus.FAILED, str(e))
            return {"success": False, "message": f"Error starting scan: {str(e)}"}
    
    @staticmethod
    async def _execute_scan_async(scan: Scan, data_source: DataSource, scan_rule_set: Optional[ScanRuleSet] = None):
        """Execute a scan asynchronously."""
        if not scan or not scan.id:
            raise ValueError("scan with valid ID is required")
            
        if not data_source or not data_source.id:
            raise ValueError("data_source with valid ID is required")
            
        # Create a new session for this async task
        from app.db_session import get_session
        with get_session() as session:
            try:
                # Extract metadata based on data source type
                if data_source.source_type.value == "mysql":
                    metadata = await ScanService._extract_mysql_metadata(data_source, scan_rule_set)
                elif data_source.source_type.value == "postgresql":
                    metadata = await ScanService._extract_postgresql_metadata(data_source, scan_rule_set)
                elif data_source.source_type.value == "mongodb":
                    metadata = await ScanService._extract_mongodb_metadata(data_source, scan_rule_set)
                else:
                    raise ValueError(f"Unsupported data source type: {data_source.source_type}")
                
                # Apply scan rule set filters if provided
                if scan_rule_set:
                    metadata = ScanRuleSetService.apply_rule_set_filters(scan_rule_set, metadata)
                
                # Store scan results
                await ScanService._store_scan_results(session, scan.id, metadata, data_source.source_type.value)
                
                # Create discovery history entry
                discovery = DiscoveryHistory(
                    discovery_id=str(uuid.uuid4()),  # Generate unique ID
                    data_source_id=data_source.id,
                    status=DiscoveryStatus.COMPLETED,  # Use enum
                    tables_discovered=sum(len(schema.get("tables", [])) for schema in metadata.get("schemas", [])),
                    columns_discovered=sum(
                        len(table.get("columns", []))
                        for schema in metadata.get("schemas", [])
                        for table in schema.get("tables", [])
                    ),
                    duration_seconds=int((datetime.utcnow() - scan.started_at).total_seconds()) if scan.started_at else 0,  # Cast to int
                    triggered_by=scan.created_by if scan.created_by else "system",
                    discovery_details=metadata
                )
                session.add(discovery)
                
                # Update scan status to completed
                ScanService.update_scan_status(session, scan.id, ScanStatus.COMPLETED)
                logger.info(f"Scan completed successfully: {scan.id}")
                
                # Commit all changes
                session.commit()
                
            except Exception as e:
                logger.error(f"Error executing scan: {str(e)}")
                ScanService.update_scan_status(session, scan.id, ScanStatus.FAILED, str(e))
                
                # Create failed discovery history entry
                discovery = DiscoveryHistory(
                    discovery_id=str(uuid.uuid4()),  # Generate unique ID
                    data_source_id=data_source.id,
                    status=DiscoveryStatus.FAILED,  # Use enum
                    tables_discovered=0,
                    columns_discovered=0,
                    duration_seconds=int((datetime.utcnow() - scan.started_at).total_seconds()) if scan.started_at else 0,  # Cast to int
                    triggered_by=scan.created_by if scan.created_by else "system",
                    error_message=str(e)
                )
                session.add(discovery)
                session.commit()
    
    @staticmethod
    async def _extract_mysql_metadata(data_source: DataSource, scan_rule_set: Optional[ScanRuleSet] = None) -> Dict[str, Any]:
        """Extract metadata from MySQL database."""
        # Use ThreadPoolExecutor to run blocking I/O operations
        with ThreadPoolExecutor() as executor:
            return await asyncio.get_event_loop().run_in_executor(
                executor, ScanService._extract_metadata, "mysql", data_source, scan_rule_set
            )
    
    @staticmethod
    async def _extract_postgresql_metadata(data_source: DataSource, scan_rule_set: Optional[ScanRuleSet] = None) -> Dict[str, Any]:
        """Extract metadata from PostgreSQL database."""
        # Use ThreadPoolExecutor to run blocking I/O operations
        with ThreadPoolExecutor() as executor:
            return await asyncio.get_event_loop().run_in_executor(
                executor, ScanService._extract_metadata, "postgresql", data_source, scan_rule_set
            )
    
    @staticmethod
    async def _extract_mongodb_metadata(data_source: DataSource, scan_rule_set: Optional[ScanRuleSet] = None) -> Dict[str, Any]:
        """Extract metadata from MongoDB database."""
        # Use ThreadPoolExecutor to run blocking I/O operations
        with ThreadPoolExecutor() as executor:
            return await asyncio.get_event_loop().run_in_executor(
                executor, ScanService._extract_metadata, "mongodb", data_source, scan_rule_set
            )
    
    @staticmethod
    def _extract_metadata(db_type: str, data_source: DataSource, scan_rule_set: Optional[ScanRuleSet] = None) -> Dict[str, Any]:
        """Extract metadata from a database using the extraction service."""
        # Prepare extraction request payload
        payload = {
            "host": data_source.host,
            "port": data_source.port,
            "username": data_source.username,
            "password": data_source.password_secret,
        }
        
        # Add database name if provided
        if data_source.database_name:
            payload["database"] = data_source.database_name
        
        # Add additional connection properties if provided
        if data_source.connection_properties:
            payload.update(data_source.connection_properties)
        
        # Add scan rule set filters if provided
        if scan_rule_set:
            if scan_rule_set.include_schemas:
                payload["include_schemas"] = scan_rule_set.include_schemas
            if scan_rule_set.exclude_schemas:
                payload["exclude_schemas"] = scan_rule_set.exclude_schemas
            if scan_rule_set.include_tables:
                payload["include_tables"] = scan_rule_set.include_tables
            if scan_rule_set.exclude_tables:
                payload["exclude_tables"] = scan_rule_set.exclude_tables
        
        # Make request to extraction service
        url = f"{ScanService.EXTRACTION_SERVICE_URL}/extract/{db_type}"
        headers = {"Content-Type": "application/json"}
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            raise
    
    @staticmethod
    async def _store_scan_results(session: Session, scan_id: int, metadata: Dict[str, Any], source_type: str):
        """Store scan results in the database."""
        if not scan_id:
            raise ValueError("scan_id is required")
            
        scan_results = []
        
        if source_type in ["mysql", "postgresql"]:
            # Process SQL database metadata
            for schema_name, schema_data in metadata.get("schemas", {}).items():
                for table_name, table_data in schema_data.get("tables", {}).items():
                    # Store table metadata
                    table_result = ScanResult(
                        scan_id=scan_id,
                        schema_name=schema_name,
                        table_name=table_name,
                        scan_metadata=table_data.get("metadata", {})
                    )
                    scan_results.append(table_result)
                    
                    # Store column metadata
                    for column_name, column_data in table_data.get("columns", {}).items():
                        column_result = ScanResult(
                            scan_id=scan_id,
                            schema_name=schema_name,
                            table_name=table_name,
                            column_name=column_name,
                            data_type=column_data.get("data_type"),
                            nullable=column_data.get("nullable"),
                            scan_metadata=column_data
                        )
                        scan_results.append(column_result)
        
        elif source_type == "mongodb":
            # Process MongoDB metadata
            for db_name, db_data in metadata.get("databases", {}).items():
                for collection_name, collection_data in db_data.get("collections", {}).items():
                    # Store collection metadata
                    collection_result = ScanResult(
                        scan_id=scan_id,
                        schema_name=db_name,  # Use database name as schema name
                        table_name=collection_name,  # Use collection name as table name
                        scan_metadata=collection_data.get("metadata", {})
                    )
                    scan_results.append(collection_result)
                    
                    # Store field metadata
                    for field_name, field_data in collection_data.get("fields", {}).items():
                        field_result = ScanResult(
                            scan_id=scan_id,
                            schema_name=db_name,
                            table_name=collection_name,
                            column_name=field_name,  # Use field name as column name
                            data_type=field_data.get("data_type"),
                            scan_metadata=field_data
                        )
                        scan_results.append(field_result)
        
        # Batch insert scan results
        session.add_all(scan_results)
        session.commit()
        logger.info(f"Stored {len(scan_results)} scan results for scan ID {scan_id}")
    
    @staticmethod
    def get_scan_results(session: Session, scan_id: int) -> List[ScanResult]:
        """Get all results for a specific scan."""
        return list(session.exec(select(ScanResult).where(ScanResult.scan_id == scan_id)).all())
    
    @staticmethod
    def get_scan_results_by_schema(session: Session, scan_id: int, schema_name: str) -> List[ScanResult]:
        """Get scan results for a specific schema."""
        return list(session.exec(
            select(ScanResult)
            .where(ScanResult.scan_id == scan_id)
            .where(ScanResult.schema_name == schema_name)
        ).all())
    
    @staticmethod
    def get_scan_results_by_table(session: Session, scan_id: int, schema_name: str, table_name: str) -> List[ScanResult]:
        """Get scan results for a specific table."""
        return list(session.exec(
            select(ScanResult)
            .where(ScanResult.scan_id == scan_id)
            .where(ScanResult.schema_name == schema_name)
            .where(ScanResult.table_name == table_name)
        ).all())
    
    @staticmethod
    def get_scan_summary(session: Session, scan_id: int) -> Dict[str, Any]:
        """Get a summary of scan results."""
        scan = session.get(Scan, scan_id)
        if not scan:
            return {"success": False, "message": f"Scan with ID {scan_id} not found"}
        
        # Get data source
        data_source = session.get(DataSource, scan.data_source_id)
        if not data_source:
            return {"success": False, "message": f"Data source with ID {scan.data_source_id} not found"}
        
        # Get scan results
        results = list(session.exec(select(ScanResult).where(ScanResult.scan_id == scan_id)).all())
        
        # Count schemas, tables, and columns
        schemas = set()
        tables = set()
        columns = 0
        
        for result in results:
            if result.schema_name:
                schemas.add(result.schema_name)
            if result.table_name:
                tables.add(f"{result.schema_name}.{result.table_name}")
            if result.column_name:
                columns += 1
        
        # Get latest discovery history
        discoveries = list(session.exec(
            select(DiscoveryHistory)
            .where(DiscoveryHistory.data_source_id == data_source.id)
        ).all())
        
        # Sort in memory since SQLModel is having issues with order_by
        discoveries.sort(key=lambda x: x.discovery_time, reverse=True)
        discovery = discoveries[0] if discoveries else None
        
        return {
            "scan_id": scan.id,
            "scan_uuid": scan.scan_id,
            "name": scan.name,
            "status": scan.status.value,
            "data_source": {
                "id": data_source.id,
                "name": data_source.name,
                "type": data_source.source_type.value
            },
            "started_at": scan.started_at.isoformat() if scan.started_at else None,
            "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
            "summary": {
                "schema_count": len(schemas),
                "table_count": len(tables),
                "column_count": columns
            },
            "discovery": {
                "id": discovery.id if discovery else None,
                "time": discovery.discovery_time.isoformat() if discovery and discovery.discovery_time else None,
                "status": discovery.status if discovery else None,
                "duration_seconds": discovery.duration_seconds if discovery else None,
                "error_message": discovery.error_message if discovery else None
            } if discovery else None
        }