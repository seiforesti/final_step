from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from app.models.scan_models import ScanRuleSet, DataSource
from sqlalchemy.exc import SQLAlchemyError
import logging
from datetime import datetime

# Setup logging
logger = logging.getLogger(__name__)


class ScanRuleSetService:
    """Service for managing scan rule sets."""
    
    @staticmethod
    def create_scan_rule_set(
        session: Session,
        name: str,
        data_source_id: Optional[int] = None,
        description: Optional[str] = None,
        include_schemas: Optional[List[str]] = None,
        exclude_schemas: Optional[List[str]] = None,
        include_tables: Optional[List[str]] = None,
        exclude_tables: Optional[List[str]] = None,
        include_columns: Optional[List[str]] = None,
        exclude_columns: Optional[List[str]] = None,
        sample_data: bool = False,
        sample_size: Optional[int] = 100
    ) -> ScanRuleSet:
        """Create a new scan rule set."""
        try:
            # Validate data source if provided
            if data_source_id is not None:
                data_source = session.get(DataSource, data_source_id)
                if not data_source:
                    raise ValueError(f"Data source with ID {data_source_id} not found")
            
            scan_rule_set = ScanRuleSet(
                name=name,
                description=description,
                data_source_id=data_source_id,
                include_schemas=include_schemas,
                exclude_schemas=exclude_schemas,
                include_tables=include_tables,
                exclude_tables=exclude_tables,
                include_columns=include_columns,
                exclude_columns=exclude_columns,
                sample_data=sample_data,
                sample_size=sample_size
            )
            
            session.add(scan_rule_set)
            session.commit()
            session.refresh(scan_rule_set)
            logger.info(f"Created scan rule set: {name}")
            return scan_rule_set
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error creating scan rule set: {str(e)}")
            raise
    
    @staticmethod
    def get_scan_rule_set(session: Session, scan_rule_set_id: int) -> Optional[ScanRuleSet]:
        """Get a scan rule set by ID."""
        return session.get(ScanRuleSet, scan_rule_set_id)
    
    @staticmethod
    def get_scan_rule_set_by_name(session: Session, name: str) -> Optional[ScanRuleSet]:
        """Get a scan rule set by name."""
        return session.execute(select(ScanRuleSet).where(ScanRuleSet.name == name)).first()
    
    @staticmethod
    def get_all_scan_rule_sets(session: Session) -> List[ScanRuleSet]:
        """Get all scan rule sets."""
        return session.execute(select(ScanRuleSet)).all()
    
    @staticmethod
    def get_scan_rule_sets_by_data_source(session: Session, data_source_id: int) -> List[ScanRuleSet]:
        """Get all scan rule sets for a specific data source."""
        return session.execute(select(ScanRuleSet).where(ScanRuleSet.data_source_id == data_source_id)).all()
    
    @staticmethod
    def update_scan_rule_set(
        session: Session,
        scan_rule_set_id: int,
        **kwargs
    ) -> Optional[ScanRuleSet]:
        """Update a scan rule set."""
        scan_rule_set = session.get(ScanRuleSet, scan_rule_set_id)
        if not scan_rule_set:
            return None
        
        # Update fields
        for key, value in kwargs.items():
            if hasattr(scan_rule_set, key):
                setattr(scan_rule_set, key, value)
        
        scan_rule_set.updated_at = datetime.utcnow()
        session.add(scan_rule_set)
        session.commit()
        session.refresh(scan_rule_set)
        logger.info(f"Updated scan rule set: {scan_rule_set.name} (ID: {scan_rule_set_id})")
        return scan_rule_set
    
    @staticmethod
    def delete_scan_rule_set(session: Session, scan_rule_set_id: int) -> bool:
        """Delete a scan rule set."""
        scan_rule_set = session.get(ScanRuleSet, scan_rule_set_id)
        if not scan_rule_set:
            return False
        
        session.delete(scan_rule_set)
        session.commit()
        logger.info(f"Deleted scan rule set: {scan_rule_set.name} (ID: {scan_rule_set_id})")
        return True
    
    @staticmethod
    def apply_rule_set_filters(rule_set: ScanRuleSet, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Apply rule set filters to metadata.
        
        Args:
            rule_set: The scan rule set to apply
            metadata: The metadata to filter (e.g., schemas, tables, columns)
            
        Returns:
            Filtered metadata based on rule set inclusion/exclusion rules
        """
        filtered_metadata = {}
        
        # Filter schemas
        if 'schemas' in metadata:
            filtered_schemas = {}
            for schema_name, schema_data in metadata['schemas'].items():
                # Check schema inclusion/exclusion rules
                if rule_set.include_schemas and schema_name not in rule_set.include_schemas:
                    continue
                if rule_set.exclude_schemas and schema_name in rule_set.exclude_schemas:
                    continue
                
                # Filter tables within schema
                filtered_tables = {}
                for table_name, table_data in schema_data.get('tables', {}).items():
                    # Check table inclusion/exclusion rules
                    if rule_set.include_tables and table_name not in rule_set.include_tables:
                        continue
                    if rule_set.exclude_tables and table_name in rule_set.exclude_tables:
                        continue
                    
                    # Filter columns within table
                    filtered_columns = {}
                    for column_name, column_data in table_data.get('columns', {}).items():
                        # Check column inclusion/exclusion rules
                        if rule_set.include_columns and column_name not in rule_set.include_columns:
                            continue
                        if rule_set.exclude_columns and column_name in rule_set.exclude_columns:
                            continue
                        
                        filtered_columns[column_name] = column_data
                    
                    # Add filtered columns to table
                    table_data_copy = table_data.copy()
                    table_data_copy['columns'] = filtered_columns
                    filtered_tables[table_name] = table_data_copy
                
                # Add filtered tables to schema
                schema_data_copy = schema_data.copy()
                schema_data_copy['tables'] = filtered_tables
                filtered_schemas[schema_name] = schema_data_copy
            
            filtered_metadata['schemas'] = filtered_schemas
        
        # For MongoDB, the structure is different (collections instead of tables)
        if 'databases' in metadata:
            filtered_databases = {}
            for db_name, db_data in metadata['databases'].items():
                # Check database inclusion/exclusion (using schema rules)
                if rule_set.include_schemas and db_name not in rule_set.include_schemas:
                    continue
                if rule_set.exclude_schemas and db_name in rule_set.exclude_schemas:
                    continue
                
                # Filter collections within database
                filtered_collections = {}
                for collection_name, collection_data in db_data.get('collections', {}).items():
                    # Check collection inclusion/exclusion (using table rules)
                    if rule_set.include_tables and collection_name not in rule_set.include_tables:
                        continue
                    if rule_set.exclude_tables and collection_name in rule_set.exclude_tables:
                        continue
                    
                    # Filter fields within collection
                    filtered_fields = {}
                    for field_name, field_data in collection_data.get('fields', {}).items():
                        # Check field inclusion/exclusion (using column rules)
                        if rule_set.include_columns and field_name not in rule_set.include_columns:
                            continue
                        if rule_set.exclude_columns and field_name in rule_set.exclude_columns:
                            continue
                        
                        filtered_fields[field_name] = field_data
                    
                    # Add filtered fields to collection
                    collection_data_copy = collection_data.copy()
                    collection_data_copy['fields'] = filtered_fields
                    filtered_collections[collection_name] = collection_data_copy
                
                # Add filtered collections to database
                db_data_copy = db_data.copy()
                db_data_copy['collections'] = filtered_collections
                filtered_databases[db_name] = db_data_copy
            
            filtered_metadata['databases'] = filtered_databases
        
        return filtered_metadata