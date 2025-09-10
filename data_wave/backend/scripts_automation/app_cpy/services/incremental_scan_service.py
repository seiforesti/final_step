from typing import Dict, List, Any, Optional, Union, Set
import logging
from datetime import datetime
from sqlmodel import Session, select
from app.models.scan_models import DataSource, Scan, ScanResult, DataSourceType
from app.services.scan_service import ScanService
import json
import hashlib

# Setup logging
logger = logging.getLogger(__name__)

class IncrementalScanService:
    """Service for managing incremental scans."""
    
    @staticmethod
    def create_incremental_scan(
        session: Session,
        data_source_id: int,
        scan_rule_set_id: Optional[int] = None,
        description: Optional[str] = None,
        base_scan_id: Optional[int] = None,
        app_secret: Optional[str] = None
    ) -> Scan:
        """Create and execute an incremental scan.
        
        Args:
            session: The database session
            data_source_id: The ID of the data source to scan
            scan_rule_set_id: Optional ID of the scan rule set to apply
            description: Optional description of the scan
            base_scan_id: The ID of the base scan to compare against
            app_secret: Optional app secret for decrypting passwords
            
        Returns:
            The created scan
        """
        # Get the base scan if provided, otherwise get the latest successful scan
        base_scan = None
        if base_scan_id:
            base_scan = session.get(Scan, base_scan_id)
            if not base_scan or base_scan.data_source_id != data_source_id:
                raise ValueError(f"Invalid base scan ID: {base_scan_id}")
        else:
            # Get the latest successful scan for this data source
            stmt = select(Scan).where(
                Scan.data_source_id == data_source_id,
                Scan.status == "completed"
            ).order_by(Scan.completed_at.desc()).limit(1)
            result = session.execute(stmt).scalars().first()
            if result:
                base_scan = result
        
        if not base_scan:
            # If no base scan exists, create a full scan
            logger.info(f"No base scan found for data source {data_source_id}, creating full scan")
            return ScanService.create_scan(
                session=session,
                data_source_id=data_source_id,
                scan_rule_set_id=scan_rule_set_id,
                description=description or "Initial full scan",
                app_secret=app_secret
            )
        
        # Create a new scan with incremental flag
        scan = Scan(
            data_source_id=data_source_id,
            scan_rule_set_id=scan_rule_set_id,
            description=description or f"Incremental scan based on scan {base_scan.id}",
            status="pending",
            custom_properties={
                "is_incremental": True,
                "base_scan_id": base_scan.id
            }
        )
        
        session.add(scan)
        session.commit()
        session.refresh(scan)
        
        # Execute the incremental scan
        try:
            # Get the data source
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source not found: {data_source_id}")
            
            # Get the base scan result
            base_scan_result = IncrementalScanService._get_latest_scan_result(session, base_scan.id)
            if not base_scan_result:
                raise ValueError(f"No scan result found for base scan: {base_scan.id}")
            
            # Update scan status
            scan.status = "in_progress"
            scan.started_at = datetime.utcnow()
            session.add(scan)
            session.commit()
            
            # Extract metadata from the data source
            metadata = ScanService._extract_metadata(data_source, app_secret)
            
            # Apply scan rule set filters if provided
            if scan_rule_set_id:
                metadata = ScanService._apply_rule_set_filters(session, scan_rule_set_id, metadata, data_source.source_type)
            
            # Compare with base scan and get only the changes
            incremental_metadata = IncrementalScanService._get_incremental_changes(
                base_metadata=base_scan_result.scan_metadata,
                current_metadata=metadata,
                data_source_type=data_source.source_type
            )
            
            # Create scan result with incremental changes
            scan_result = ScanResult(
                scan_id=scan.id,
                scan_metadata=incremental_metadata,
                custom_properties={
                    "is_incremental": True,
                    "base_scan_id": base_scan.id,
                    "change_summary": IncrementalScanService._generate_change_summary(incremental_metadata, data_source.source_type)
                }
            )
            
            session.add(scan_result)
            
            # Update scan status
            scan.status = "completed"
            scan.completed_at = datetime.utcnow()
            session.add(scan)
            session.commit()
            
            return scan
            
        except Exception as e:
            logger.error(f"Error executing incremental scan: {str(e)}")
            scan.status = "failed"
            scan.error_message = str(e)
            scan.completed_at = datetime.utcnow()
            session.add(scan)
            session.commit()
            raise
    
    @staticmethod
    def _get_latest_scan_result(session: Session, scan_id: int) -> Optional[ScanResult]:
        """Get the latest scan result for a scan."""
        stmt = select(ScanResult).where(ScanResult.scan_id == scan_id).order_by(ScanResult.created_at.desc()).limit(1)
        return session.execute(stmt).scalars().first()
    
    @staticmethod
    def _get_incremental_changes(base_metadata: Dict[str, Any], current_metadata: Dict[str, Any], 
                                data_source_type: Union[DataSourceType, str]) -> Dict[str, Any]:
        """Get the incremental changes between two metadata snapshots.
        
        Args:
            base_metadata: The metadata from the base scan
            current_metadata: The metadata from the current scan
            data_source_type: The type of data source
            
        Returns:
            A metadata dictionary containing only the changes
        """
        if isinstance(data_source_type, str):
            data_source_type = DataSourceType(data_source_type)
        
        if data_source_type in [DataSourceType.MYSQL, DataSourceType.POSTGRESQL, DataSourceType.ORACLE, DataSourceType.SQLSERVER]:
            return IncrementalScanService._get_relational_changes(base_metadata, current_metadata)
        elif data_source_type == DataSourceType.MONGODB:
            return IncrementalScanService._get_mongodb_changes(base_metadata, current_metadata)
        else:
            logger.warning(f"Unsupported data source type for incremental scan: {data_source_type}")
            return current_metadata
    
    @staticmethod
    def _get_relational_changes(base_metadata: Dict[str, Any], current_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Get the incremental changes for relational databases."""
        changes = {"schemas": []}
        
        # Create lookup dictionaries for faster access
        base_schemas = {schema["name"]: schema for schema in base_metadata.get("schemas", [])}
        current_schemas = {schema["name"]: schema for schema in current_metadata.get("schemas", [])}
        
        # Find new and changed schemas
        for schema_name, schema in current_schemas.items():
            if schema_name not in base_schemas:
                # New schema
                changes["schemas"].append(schema)
                continue
            
            base_schema = base_schemas[schema_name]
            schema_changes = {"name": schema_name, "tables": []}
            
            # Create lookup dictionaries for tables
            base_tables = {table["name"]: table for table in base_schema.get("tables", [])}
            current_tables = {table["name"]: table for table in schema.get("tables", [])}
            
            # Find new and changed tables
            for table_name, table in current_tables.items():
                if table_name not in base_tables:
                    # New table
                    schema_changes["tables"].append(table)
                    continue
                
                base_table = base_tables[table_name]
                table_changes = {"name": table_name, "columns": []}
                
                # Check if row count changed significantly
                if "row_count" in table and "row_count" in base_table:
                    base_count = base_table["row_count"] or 0
                    current_count = table["row_count"] or 0
                    if base_count != current_count:
                        table_changes["row_count"] = current_count
                        table_changes["previous_row_count"] = base_count
                
                # Create lookup dictionaries for columns
                base_columns = {col["name"]: col for col in base_table.get("columns", [])}
                current_columns = {col["name"]: col for col in table.get("columns", [])}
                
                # Find new and changed columns
                for col_name, column in current_columns.items():
                    if col_name not in base_columns:
                        # New column
                        table_changes["columns"].append(column)
                        continue
                    
                    base_column = base_columns[col_name]
                    
                    # Check if column definition changed
                    if IncrementalScanService._has_column_changed(base_column, column):
                        column_changes = column.copy()
                        column_changes["change_type"] = "modified"
                        table_changes["columns"].append(column_changes)
                
                # Find deleted columns
                for col_name in base_columns:
                    if col_name not in current_columns:
                        deleted_column = base_columns[col_name].copy()
                        deleted_column["change_type"] = "deleted"
                        table_changes["columns"].append(deleted_column)
                
                if table_changes["columns"] or "row_count" in table_changes:
                    schema_changes["tables"].append(table_changes)
            
            # Find deleted tables
            for table_name in base_tables:
                if table_name not in current_tables:
                    deleted_table = {"name": table_name, "change_type": "deleted"}
                    schema_changes["tables"].append(deleted_table)
            
            if schema_changes["tables"]:
                changes["schemas"].append(schema_changes)
        
        # Find deleted schemas
        for schema_name in base_schemas:
            if schema_name not in current_schemas:
                deleted_schema = {"name": schema_name, "change_type": "deleted"}
                changes["schemas"].append(deleted_schema)
        
        return changes
    
    @staticmethod
    def _get_mongodb_changes(base_metadata: Dict[str, Any], current_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Get the incremental changes for MongoDB databases."""
        changes = {"databases": []}
        
        # Create lookup dictionaries for faster access
        base_dbs = {db["name"]: db for db in base_metadata.get("databases", [])}
        current_dbs = {db["name"]: db for db in current_metadata.get("databases", [])}
        
        # Find new and changed databases
        for db_name, db in current_dbs.items():
            if db_name not in base_dbs:
                # New database
                changes["databases"].append(db)
                continue
            
            base_db = base_dbs[db_name]
            db_changes = {"name": db_name, "collections": []}
            
            # Create lookup dictionaries for collections
            base_collections = {coll["name"]: coll for coll in base_db.get("collections", [])}
            current_collections = {coll["name"]: coll for coll in db.get("collections", [])}
            
            # Find new and changed collections
            for coll_name, collection in current_collections.items():
                if coll_name not in base_collections:
                    # New collection
                    db_changes["collections"].append(collection)
                    continue
                
                base_collection = base_collections[coll_name]
                coll_changes = {"name": coll_name, "fields": []}
                
                # Check if document count changed significantly
                if "document_count" in collection and "document_count" in base_collection:
                    base_count = base_collection["document_count"] or 0
                    current_count = collection["document_count"] or 0
                    if base_count != current_count:
                        coll_changes["document_count"] = current_count
                        coll_changes["previous_document_count"] = base_count
                
                # Create lookup dictionaries for fields
                base_fields = {field["name"]: field for field in base_collection.get("fields", [])}
                current_fields = {field["name"]: field for field in collection.get("fields", [])}
                
                # Find new and changed fields
                for field_name, field in current_fields.items():
                    if field_name not in base_fields:
                        # New field
                        coll_changes["fields"].append(field)
                        continue
                    
                    base_field = base_fields[field_name]
                    
                    # Check if field definition changed
                    if IncrementalScanService._has_field_changed(base_field, field):
                        field_changes = field.copy()
                        field_changes["change_type"] = "modified"
                        coll_changes["fields"].append(field_changes)
                
                # Find deleted fields
                for field_name in base_fields:
                    if field_name not in current_fields:
                        deleted_field = base_fields[field_name].copy()
                        deleted_field["change_type"] = "deleted"
                        coll_changes["fields"].append(deleted_field)
                
                if coll_changes["fields"] or "document_count" in coll_changes:
                    db_changes["collections"].append(coll_changes)
            
            # Find deleted collections
            for coll_name in base_collections:
                if coll_name not in current_collections:
                    deleted_collection = {"name": coll_name, "change_type": "deleted"}
                    db_changes["collections"].append(deleted_collection)
            
            if db_changes["collections"]:
                changes["databases"].append(db_changes)
        
        # Find deleted databases
        for db_name in base_dbs:
            if db_name not in current_dbs:
                deleted_db = {"name": db_name, "change_type": "deleted"}
                changes["databases"].append(deleted_db)
        
        return changes
    
    @staticmethod
    def _has_column_changed(base_column: Dict[str, Any], current_column: Dict[str, Any]) -> bool:
        """Check if a column definition has changed."""
        # Compare important attributes
        attributes_to_compare = [
            "data_type", "is_nullable", "is_primary_key", "is_foreign_key",
            "character_maximum_length", "numeric_precision", "numeric_scale"
        ]
        
        for attr in attributes_to_compare:
            if attr in base_column or attr in current_column:
                base_value = base_column.get(attr)
                current_value = current_column.get(attr)
                if base_value != current_value:
                    return True
        
        return False
    
    @staticmethod
    def _has_field_changed(base_field: Dict[str, Any], current_field: Dict[str, Any]) -> bool:
        """Check if a MongoDB field definition has changed."""
        # Compare important attributes
        attributes_to_compare = [
            "data_type", "is_array", "is_nested", "nested_fields"
        ]
        
        for attr in attributes_to_compare:
            if attr in base_field or attr in current_field:
                base_value = base_field.get(attr)
                current_value = current_field.get(attr)
                
                # Special handling for nested_fields
                if attr == "nested_fields" and base_value and current_value:
                    # Compare nested fields recursively
                    base_nested = {field["name"]: field for field in base_value}
                    current_nested = {field["name"]: field for field in current_value}
                    
                    # Check for new or deleted nested fields
                    if set(base_nested.keys()) != set(current_nested.keys()):
                        return True
                    
                    # Check if any nested field has changed
                    for name, field in current_nested.items():
                        if name in base_nested and IncrementalScanService._has_field_changed(base_nested[name], field):
                            return True
                elif base_value != current_value:
                    return True
        
        return False
    
    @staticmethod
    def _generate_change_summary(incremental_metadata: Dict[str, Any], data_source_type: Union[DataSourceType, str]) -> Dict[str, Any]:
        """Generate a summary of changes in the incremental scan."""
        if isinstance(data_source_type, str):
            data_source_type = DataSourceType(data_source_type)
        
        summary = {
            "added": {"count": 0, "items": []},
            "modified": {"count": 0, "items": []},
            "deleted": {"count": 0, "items": []}
        }
        
        if data_source_type in [DataSourceType.MYSQL, DataSourceType.POSTGRESQL, DataSourceType.ORACLE, DataSourceType.SQLSERVER]:
            # Process relational database changes
            for schema in incremental_metadata.get("schemas", []):
                schema_name = schema.get("name", "")
                
                if schema.get("change_type") == "deleted":
                    summary["deleted"]["count"] += 1
                    summary["deleted"]["items"].append(f"Schema: {schema_name}")
                    continue
                
                for table in schema.get("tables", []):
                    table_name = table.get("name", "")
                    full_table_name = f"{schema_name}.{table_name}"
                    
                    if table.get("change_type") == "deleted":
                        summary["deleted"]["count"] += 1
                        summary["deleted"]["items"].append(f"Table: {full_table_name}")
                        continue
                    
                    # Check if this is a new table
                    if all(col.get("change_type") != "modified" and col.get("change_type") != "deleted" for col in table.get("columns", [])):
                        if table.get("columns", []):
                            summary["added"]["count"] += 1
                            summary["added"]["items"].append(f"Table: {full_table_name}")
                    
                    # Process column changes
                    for column in table.get("columns", []):
                        column_name = column.get("name", "")
                        full_column_name = f"{full_table_name}.{column_name}"
                        
                        if column.get("change_type") == "deleted":
                            summary["deleted"]["count"] += 1
                            summary["deleted"]["items"].append(f"Column: {full_column_name}")
                        elif column.get("change_type") == "modified":
                            summary["modified"]["count"] += 1
                            summary["modified"]["items"].append(f"Column: {full_column_name}")
                        else:
                            # New column
                            summary["added"]["count"] += 1
                            summary["added"]["items"].append(f"Column: {full_column_name}")
        
        elif data_source_type == DataSourceType.MONGODB:
            # Process MongoDB changes
            for db in incremental_metadata.get("databases", []):
                db_name = db.get("name", "")
                
                if db.get("change_type") == "deleted":
                    summary["deleted"]["count"] += 1
                    summary["deleted"]["items"].append(f"Database: {db_name}")
                    continue
                
                for collection in db.get("collections", []):
                    coll_name = collection.get("name", "")
                    full_coll_name = f"{db_name}.{coll_name}"
                    
                    if collection.get("change_type") == "deleted":
                        summary["deleted"]["count"] += 1
                        summary["deleted"]["items"].append(f"Collection: {full_coll_name}")
                        continue
                    
                    # Check if this is a new collection
                    if all(field.get("change_type") != "modified" and field.get("change_type") != "deleted" for field in collection.get("fields", [])):
                        if collection.get("fields", []):
                            summary["added"]["count"] += 1
                            summary["added"]["items"].append(f"Collection: {full_coll_name}")
                    
                    # Process field changes
                    for field in collection.get("fields", []):
                        field_name = field.get("name", "")
                        full_field_name = f"{full_coll_name}.{field_name}"
                        
                        if field.get("change_type") == "deleted":
                            summary["deleted"]["count"] += 1
                            summary["deleted"]["items"].append(f"Field: {full_field_name}")
                        elif field.get("change_type") == "modified":
                            summary["modified"]["count"] += 1
                            summary["modified"]["items"].append(f"Field: {full_field_name}")
                        else:
                            # New field
                            summary["added"]["count"] += 1
                            summary["added"]["items"].append(f"Field: {full_field_name}")
        
        # Limit the number of items in the summary
        max_items = 100
        for change_type in ["added", "modified", "deleted"]:
            if len(summary[change_type]["items"]) > max_items:
                summary[change_type]["items"] = summary[change_type]["items"][:max_items]
                summary[change_type]["items"].append(f"... and {summary[change_type]['count'] - max_items} more")
        
        return summary