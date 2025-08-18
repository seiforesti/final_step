from typing import Dict, List, Any, Optional, Union
import re
from app.models.scan_models import DataSource, DataSourceType
from app.services.data_source_service import DataSourceService
import logging

# Setup logging
logger = logging.getLogger(__name__)


class PatternValidationService:
    """Service for validating patterns against data sources."""
    
    @staticmethod
    def get_metadata(data_source: DataSource, app_secret: Optional[str] = None) -> Dict[str, Any]:
        """Get metadata from a data source.
        
        Args:
            data_source: The data source to get metadata from
            app_secret: Optional application secret for decrypting passwords
            
        Returns:
            Metadata dictionary containing schemas, tables, and columns
        """
        try:
            # Get the password
            password = DataSourceService.get_data_source_password(data_source, app_secret)
            
            # Get metadata based on data source type
            if data_source.source_type == DataSourceType.MYSQL:
                return PatternValidationService._get_mysql_metadata(data_source, password)
            elif data_source.source_type == DataSourceType.POSTGRESQL:
                return PatternValidationService._get_postgresql_metadata(data_source, password)
            elif data_source.source_type == DataSourceType.MONGODB:
                return PatternValidationService._get_mongodb_metadata(data_source, password)
            else:
                raise ValueError(f"Unsupported data source type: {data_source.source_type}")
        except Exception as e:
            logger.error(f"Error getting metadata: {str(e)}")
            raise
    
    @staticmethod
    def _get_mysql_metadata(data_source: DataSource, password: str) -> Dict[str, Any]:
        """Get metadata from a MySQL data source."""
        try:
            import pymysql
            
            # Connect to MySQL
            connection = pymysql.connect(
                host=data_source.host,
                user=data_source.username,
                password=password,
                port=data_source.port
            )
            
            cursor = connection.cursor()
            
            # Get all databases
            cursor.execute("SHOW DATABASES")
            databases = [db[0] for db in cursor.fetchall() if db[0] not in ['information_schema', 'mysql', 'performance_schema', 'sys']]
            
            # Initialize metadata
            metadata = {"schemas": {}}
            
            # Get tables and columns for each database
            for db_name in databases:
                cursor.execute(f"USE `{db_name}`")
                cursor.execute("SHOW TABLES")
                tables = [table[0] for table in cursor.fetchall()]
                
                schema_data = {"tables": {}}
                
                for table_name in tables:
                    cursor.execute(f"DESCRIBE `{table_name}`")
                    columns = [col[0] for col in cursor.fetchall()]
                    
                    table_data = {"columns": {}}
                    
                    for column_name in columns:
                        table_data["columns"][column_name] = {"name": column_name}
                    
                    schema_data["tables"][table_name] = table_data
                
                metadata["schemas"][db_name] = schema_data
            
            cursor.close()
            connection.close()
            
            return metadata
        except Exception as e:
            logger.error(f"Error getting MySQL metadata: {str(e)}")
            raise
    
    @staticmethod
    def _get_postgresql_metadata(data_source: DataSource, password: str) -> Dict[str, Any]:
        """Get metadata from a PostgreSQL data source."""
        try:
            import psycopg2
            
            # Connect to PostgreSQL
            connection = psycopg2.connect(
                host=data_source.host,
                user=data_source.username,
                password=password,
                port=data_source.port,
                dbname=data_source.database_name or "postgres"
            )
            
            cursor = connection.cursor()
            
            # Get all schemas
            cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')")
            schemas = [schema[0] for schema in cursor.fetchall()]
            
            # Initialize metadata
            metadata = {"schemas": {}}
            
            # Get tables and columns for each schema
            for schema_name in schemas:
                cursor.execute(f"""SELECT table_name FROM information_schema.tables 
                                WHERE table_schema = '{schema_name}' AND table_type = 'BASE TABLE'""")
                tables = [table[0] for table in cursor.fetchall()]
                
                schema_data = {"tables": {}}
                
                for table_name in tables:
                    cursor.execute(f"""SELECT column_name FROM information_schema.columns 
                                    WHERE table_schema = '{schema_name}' AND table_name = '{table_name}'""")
                    columns = [col[0] for col in cursor.fetchall()]
                    
                    table_data = {"columns": {}}
                    
                    for column_name in columns:
                        table_data["columns"][column_name] = {"name": column_name}
                    
                    schema_data["tables"][table_name] = table_data
                
                metadata["schemas"][schema_name] = schema_data
            
            cursor.close()
            connection.close()
            
            return metadata
        except Exception as e:
            logger.error(f"Error getting PostgreSQL metadata: {str(e)}")
            raise
    
    @staticmethod
    def _get_mongodb_metadata(data_source: DataSource, password: str) -> Dict[str, Any]:
        """Get metadata from a MongoDB data source."""
        try:
            from pymongo import MongoClient
            
            # Connect to MongoDB
            connection_uri = f"mongodb://{data_source.username}:{password}@{data_source.host}:{data_source.port}"
            client = MongoClient(connection_uri)
            
            # Get all databases
            databases = client.list_database_names()
            databases = [db for db in databases if db not in ['admin', 'local', 'config']]
            
            # Initialize metadata
            metadata = {"databases": {}}
            
            # Get collections and fields for each database
            for db_name in databases:
                db = client[db_name]
                collections = db.list_collection_names()
                
                db_data = {"collections": {}}
                
                for collection_name in collections:
                    collection = db[collection_name]
                    # Get a sample document to extract fields
                    sample_doc = collection.find_one()
                    
                    collection_data = {"fields": {}}
                    
                    if sample_doc:
                        for field_name in sample_doc.keys():
                            if field_name != "_id":  # Skip the _id field
                                collection_data["fields"][field_name] = {"name": field_name}
                    
                    db_data["collections"][collection_name] = collection_data
                
                metadata["databases"][db_name] = db_data
            
            client.close()
            
            return metadata
        except Exception as e:
            logger.error(f"Error getting MongoDB metadata: {str(e)}")
            raise
    
    @staticmethod
    def apply_patterns(rule_set: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Apply patterns to metadata.
        
        Args:
            rule_set: Dictionary containing include_patterns and exclude_patterns
            metadata: Metadata dictionary containing schemas, tables, and columns
            
        Returns:
            Dictionary with validation results
        """
        include_patterns = rule_set.get("include_patterns", [])
        exclude_patterns = rule_set.get("exclude_patterns", [])
        scan_level = rule_set.get("scan_level", "column")
        
        # Compile patterns for better performance
        compiled_include_patterns = [re.compile(pattern) for pattern in include_patterns]
        compiled_exclude_patterns = [re.compile(pattern) for pattern in exclude_patterns]
        
        # Initialize counters
        total_entities = 0
        included_entities = 0
        excluded_entities = 0
        entity_types = []
        
        # Process relational databases (schemas, tables, columns)
        if "schemas" in metadata:
            schemas_stats = PatternValidationService._process_schemas(
                metadata["schemas"],
                compiled_include_patterns,
                compiled_exclude_patterns,
                scan_level
            )
            
            total_entities += schemas_stats["total"]
            included_entities += schemas_stats["included"]
            excluded_entities += schemas_stats["excluded"]
            entity_types.extend(schemas_stats["entity_types"])
        
        # Process MongoDB (databases, collections, fields)
        if "databases" in metadata:
            databases_stats = PatternValidationService._process_databases(
                metadata["databases"],
                compiled_include_patterns,
                compiled_exclude_patterns,
                scan_level
            )
            
            total_entities += databases_stats["total"]
            included_entities += databases_stats["included"]
            excluded_entities += databases_stats["excluded"]
            entity_types.extend(databases_stats["entity_types"])
        
        return {
            "total_entities": total_entities,
            "included_entities": included_entities,
            "excluded_entities": excluded_entities,
            "entity_types": entity_types
        }
    
    @staticmethod
    def _process_schemas(schemas: Dict[str, Any], include_patterns: List[re.Pattern], 
                        exclude_patterns: List[re.Pattern], scan_level: str) -> Dict[str, Any]:
        """Process schemas, tables, and columns with patterns."""
        total = 0
        included = 0
        excluded = 0
        entity_types = []
        
        for schema_name, schema_data in schemas.items():
            schema_path = schema_name
            schema_included = PatternValidationService._check_patterns(schema_path, include_patterns, exclude_patterns)
            
            total += 1
            if schema_included:
                included += 1
                entity_types.append({"type": "schema", "name": schema_name, "included": True})
            else:
                excluded += 1
                entity_types.append({"type": "schema", "name": schema_name, "included": False})
            
            # Process tables if scan level is table or column
            if scan_level in ["table", "column"] and "tables" in schema_data:
                for table_name, table_data in schema_data["tables"].items():
                    table_path = f"{schema_name}.{table_name}"
                    table_included = PatternValidationService._check_patterns(table_path, include_patterns, exclude_patterns)
                    
                    total += 1
                    if table_included:
                        included += 1
                        entity_types.append({"type": "table", "name": table_path, "included": True})
                    else:
                        excluded += 1
                        entity_types.append({"type": "table", "name": table_path, "included": False})
                    
                    # Process columns if scan level is column
                    if scan_level == "column" and "columns" in table_data:
                        for column_name in table_data["columns"].keys():
                            column_path = f"{schema_name}.{table_name}.{column_name}"
                            column_included = PatternValidationService._check_patterns(column_path, include_patterns, exclude_patterns)
                            
                            total += 1
                            if column_included:
                                included += 1
                                entity_types.append({"type": "column", "name": column_path, "included": True})
                            else:
                                excluded += 1
                                entity_types.append({"type": "column", "name": column_path, "included": False})
        
        return {"total": total, "included": included, "excluded": excluded, "entity_types": entity_types}
    
    @staticmethod
    def _process_databases(databases: Dict[str, Any], include_patterns: List[re.Pattern], 
                          exclude_patterns: List[re.Pattern], scan_level: str) -> Dict[str, Any]:
        """Process MongoDB databases, collections, and fields with patterns."""
        total = 0
        included = 0
        excluded = 0
        entity_types = []
        
        for db_name, db_data in databases.items():
            db_path = db_name
            db_included = PatternValidationService._check_patterns(db_path, include_patterns, exclude_patterns)
            
            total += 1
            if db_included:
                included += 1
                entity_types.append({"type": "database", "name": db_name, "included": True})
            else:
                excluded += 1
                entity_types.append({"type": "database", "name": db_name, "included": False})
            
            # Process collections if scan level is table or column
            if scan_level in ["table", "column"] and "collections" in db_data:
                for collection_name, collection_data in db_data["collections"].items():
                    collection_path = f"{db_name}.{collection_name}"
                    collection_included = PatternValidationService._check_patterns(collection_path, include_patterns, exclude_patterns)
                    
                    total += 1
                    if collection_included:
                        included += 1
                        entity_types.append({"type": "collection", "name": collection_path, "included": True})
                    else:
                        excluded += 1
                        entity_types.append({"type": "collection", "name": collection_path, "included": False})
                    
                    # Process fields if scan level is column
                    if scan_level == "column" and "fields" in collection_data:
                        for field_name in collection_data["fields"].keys():
                            field_path = f"{db_name}.{collection_name}.{field_name}"
                            field_included = PatternValidationService._check_patterns(field_path, include_patterns, exclude_patterns)
                            
                            total += 1
                            if field_included:
                                included += 1
                                entity_types.append({"type": "field", "name": field_path, "included": True})
                            else:
                                excluded += 1
                                entity_types.append({"type": "field", "name": field_path, "included": False})
        
        return {"total": total, "included": included, "excluded": excluded, "entity_types": entity_types}
    
    @staticmethod
    def _check_patterns(path: str, include_patterns: List[re.Pattern], exclude_patterns: List[re.Pattern]) -> bool:
        """Check if a path matches include patterns and doesn't match exclude patterns.
        
        Args:
            path: The path to check (e.g., schema.table.column)
            include_patterns: List of compiled include patterns
            exclude_patterns: List of compiled exclude patterns
            
        Returns:
            True if the path should be included, False otherwise
        """
        # If no include patterns, include everything by default
        included = len(include_patterns) == 0
        
        # Check include patterns
        for pattern in include_patterns:
            if pattern.search(path):
                included = True
                break
        
        # If not included, no need to check exclude patterns
        if not included:
            return False
        
        # Check exclude patterns
        for pattern in exclude_patterns:
            if pattern.search(path):
                return False
        
        return True