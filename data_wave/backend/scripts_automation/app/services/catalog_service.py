"""
Enhanced Catalog Service with Data Source Integration

This service provides comprehensive data catalog functionality with real-time
integration to data source services, eliminating mock data and providing
production-grade schema discovery, metadata management, and lineage tracking.
"""

from sqlmodel import Session, select
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
import asyncio
import logging
from dataclasses import dataclass
import json

from app.models.catalog_models import (
    CatalogItem, CatalogTag, DataLineage,
    CatalogItemResponse, CatalogTagResponse, DataLineageResponse,
    CatalogItemCreate, CatalogItemUpdate, CatalogStats,
    DataClassification, CatalogItemType
)

from app.models.catalog_quality_models import (
    DataQualityRule, QualityAssessmentResponse
)
from app.models.scan_models import DataSource, DataSourceType
from app.services.data_source_service import DataSourceService
from app.services.data_source_connection_service import DataSourceConnectionService
from app.db_session import get_session
from app.core.config import settings
from app.core.logging_config import get_logger
from app.utils.cache import cache_get, cache_set, cache_delete

logger = get_logger(__name__)

@dataclass
class SchemaDiscoveryResult:
    """Result of schema discovery operation."""
    success: bool
    discovered_items: int
    errors: List[str]
    warnings: List[str]
    processing_time_seconds: float
    data_source_info: Dict[str, Any]

@dataclass
class CatalogSyncResult:
    """Result of catalog synchronization operation."""
    success: bool
    items_created: int
    items_updated: int
    items_deleted: int
    errors: List[str]
    sync_duration_seconds: float

class EnhancedCatalogService:
    """
    Enhanced service layer for data catalog management with full data source integration.
    
    Features:
    - Real-time schema discovery from data sources
    - Intelligent metadata extraction and classification
    - Automated catalog synchronization
    - Advanced lineage tracking
    - Data quality integration
    - Performance optimization with caching
    """
    
    def __init__(self):
        self.data_source_service = DataSourceService()
        self.connection_service = DataSourceConnectionService()
        self.cache_prefix = "catalog_service"
        self.discovery_batch_size = 100
        
    # ============================================================================
    # CORE CATALOG ITEM MANAGEMENT
    # ============================================================================
    
    @staticmethod
    def get_catalog_items_by_data_source(session: Session, data_source_id: int) -> List[CatalogItemResponse]:
        """Get all catalog items for a specific data source"""
        try:
            # Query catalog items by data source ID
            query = select(CatalogItem).where(CatalogItem.data_source_id == data_source_id)
            catalog_items = session.execute(query).scalars().all()
            
            # Convert to response models with full fields using ORM mapping
            return [CatalogItemResponse.from_orm(item) for item in catalog_items]
        except Exception as e:
            logger.error(f"Error getting catalog items for data source {data_source_id}: {e}")
            return []

    @staticmethod
    def get_all_catalog_items(session: Session) -> List[CatalogItemResponse]:
        """Get all catalog items across all data sources"""
        try:
            # Query all catalog items
            query = select(CatalogItem)
            catalog_items = session.execute(query).scalars().all()
            
            # Convert to response models with full fields using ORM mapping
            return [CatalogItemResponse.from_orm(item) for item in catalog_items]
        except Exception as e:
            logger.error(f"Error getting all catalog items: {e}")
            return []
    
    @staticmethod
    def get_catalog_item_by_id(session: Session, item_id: int) -> Optional[CatalogItemResponse]:
        """Get catalog item by ID with enhanced metadata."""
        cache_key = f"catalog_item_{item_id}"
        
        try:
            # Try cache first
            cached_result = asyncio.run(cache_get(cache_key))
            if cached_result:
                return CatalogItemResponse(**cached_result)
            
            item = session.get(CatalogItem, item_id)
            if item:
                result = CatalogItemResponse.from_orm(item)
                # Cache for 10 minutes
                asyncio.run(cache_set(cache_key, result.dict(), ttl=600))
                return result
            return None
        except Exception as e:
            logger.error(f"Error getting catalog item {item_id}: {str(e)}")
            return None
    
    @staticmethod
    def create_catalog_item(session: Session, item_data: CatalogItemCreate, created_by: str) -> CatalogItemResponse:
        """Create a new catalog item with validation and intelligence."""
        try:
            # Verify data source exists and get connection info
            data_source = session.get(DataSource, item_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {item_data.data_source_id} not found")
            
            # Check if item already exists with same path
            existing_result = session.execute(
                select(CatalogItem).where(
                    CatalogItem.data_source_id == item_data.data_source_id,
                    CatalogItem.schema_name == item_data.schema_name,
                    CatalogItem.table_name == item_data.table_name
                )
            )
            existing = existing_result.scalars().first()
            
            if existing:
                raise ValueError(f"Catalog item already exists for {item_data.schema_name}.{item_data.table_name}")
            
            # Enhance metadata with data source information
            enhanced_metadata = item_data.metadata or {}
            enhanced_metadata.update({
                "data_source_type": data_source.source_type.value,
                "data_source_location": data_source.location.value,
                "created_timestamp": datetime.now().isoformat(),
                "created_by": created_by
            })
            
            # Auto-classify based on naming patterns and data source type
            if not item_data.classification:
                auto_classification = EnhancedCatalogService._auto_classify_item(
                    item_data.table_name, 
                    item_data.column_name, 
                    item_data.data_type,
                    data_source.source_type
                )
                item_data.classification = auto_classification
            
            item = CatalogItem(
                data_source_id=item_data.data_source_id,
                item_type=item_data.item_type,
                schema_name=item_data.schema_name,
                table_name=item_data.table_name,
                column_name=item_data.column_name,
                display_name=item_data.display_name,
                description=item_data.description,
                data_type=item_data.data_type,
                classification=item_data.classification,
                sensitivity_level=item_data.sensitivity_level,
                business_glossary=item_data.business_glossary,
                metadata=enhanced_metadata,
                created_by=created_by
            )
            
            session.add(item)
            session.commit()
            session.refresh(item)
            
            # Clear related caches
            asyncio.run(cache_delete(f"catalog_items_ds_{item_data.data_source_id}"))
            asyncio.run(cache_delete("catalog_stats"))
            
            logger.info(f"Created catalog item {item.id} for {item.schema_name}.{item.table_name} by {created_by}")
            return CatalogItemResponse.from_orm(item)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating catalog item: {str(e)}")
            raise
    
    @staticmethod
    def _auto_classify_item(table_name: str, column_name: Optional[str], data_type: Optional[str], source_type: DataSourceType) -> DataClassification:
        """Automatically classify catalog items based on patterns and heuristics."""
        table_lower = table_name.lower() if table_name else ""
        column_lower = column_name.lower() if column_name else ""
        
        # Restricted patterns
        restricted_patterns = [
            'password', 'passwd', 'secret', 'key', 'token', 'ssn', 'social_security',
            'credit_card', 'cc_number', 'bank_account', 'routing_number', 'salary',
            'medical', 'health', 'diagnosis', 'prescription'
        ]
        
        # Confidential patterns
        confidential_patterns = [
            'user', 'customer', 'client', 'employee', 'person', 'contact',
            'email', 'phone', 'address', 'personal', 'private', 'internal'
        ]
        
        # Public patterns
        public_patterns = [
            'product', 'catalog', 'reference', 'lookup', 'config', 'setting',
            'status', 'type', 'category', 'public', 'general'
        ]
        
        # Check for restricted content
        for pattern in restricted_patterns:
            if pattern in table_lower or pattern in column_lower:
                return DataClassification.RESTRICTED
        
        # Check for confidential content
        for pattern in confidential_patterns:
            if pattern in table_lower or pattern in column_lower:
                return DataClassification.CONFIDENTIAL
        
        # Check for public content
        for pattern in public_patterns:
            if pattern in table_lower or pattern in column_lower:
                return DataClassification.PUBLIC
        
        # Default to internal based on source type
        if source_type in [DataSourceType.PRODUCTION, DataSourceType.STAGING]:
            return DataClassification.CONFIDENTIAL
        else:
            return DataClassification.INTERNAL
    
    # ============================================================================
    # REAL-TIME SCHEMA DISCOVERY AND SYNCHRONIZATION
    # ============================================================================
    
    async def discover_and_catalog_schema(self, session: Session, data_source_id: int, discovered_by: str, force_refresh: bool = False, selected_items: Optional[List[Dict[str, Any]]] = None) -> SchemaDiscoveryResult:
        """
        Discover schema from data source and automatically create catalog entries.
        This replaces the mock discover_schema method with real integration.
        """
        start_time = datetime.now()
        result = SchemaDiscoveryResult(
            success=False,
            discovered_items=0,
            errors=[],
            warnings=[],
            processing_time_seconds=0,
            data_source_info={}
        )
        
        try:
            # Get data source
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                result.errors.append(f"Data source {data_source_id} not found")
                return result
            
            # Check cache unless force refresh
            cache_key = f"schema_discovery_{data_source_id}"
            if not force_refresh:
                cached_result = await cache_get(cache_key)
                if cached_result:
                    logger.info(f"Using cached schema discovery for data source {data_source_id}")
                    return SchemaDiscoveryResult(**cached_result)
            
            logger.info(f"Starting schema discovery for data source {data_source_id} ({data_source.name})")
            
            # Test connection first
            connection_test = await self.connection_service.test_connection(data_source)
            if not connection_test["success"]:
                result.errors.append(f"Connection test failed: {connection_test['message']}")
                return result
            
            # Discover schema using enterprise discovery
            schema_discovery = await self.connection_service.discover_schema(data_source)
            if not schema_discovery["success"]:
                result.errors.append("Schema discovery failed")
                return result
            
            result.data_source_info = {
                "name": data_source.name,
                "type": data_source.source_type.value,
                "host": data_source.host,
                "connection_time_ms": connection_test["connection_time_ms"],
                "discovery_type": schema_discovery.get("discovery_type", "unknown"),
                "total_tables": schema_discovery.get("total_tables", 0)
            }
            
            # Process schema based on whether we have selected items or not
            if selected_items:
                # Process only selected items
                if schema_discovery.get("discovery_type") == "postgresql_enterprise":
                    discovered_count = await self._process_selected_schema_items(
                        session, data_source, schema_discovery["schema_structure"], selected_items, discovered_by, result
                    )
                    result.warnings.append(f"Enterprise discovery completed - processed {len(selected_items)} selected items")
                else:
                    discovered_count = await self._process_selected_schema_items(
                        session, data_source, schema_discovery["schema"], selected_items, discovered_by, result
                    )
            else:
                # Process all discovered schema
                if schema_discovery.get("discovery_type") == "postgresql_enterprise":
                    # Enterprise discovery already handles the schema processing
                    discovered_count = schema_discovery.get("total_tables", 0)
                    result.warnings.append("Enterprise discovery completed - schema data processed by enterprise service")
                else:
                    # Process discovered schema for non-enterprise discovery
                    discovered_count = await self._process_discovered_schema(
                        session, data_source, schema_discovery["schema"], discovered_by, result
                    )
            
            result.discovered_items = discovered_count
            result.success = True
            
            # Cache the result for 1 hour
            cache_data = {
                "success": result.success,
                "discovered_items": result.discovered_items,
                "errors": result.errors,
                "warnings": result.warnings,
                "processing_time_seconds": result.processing_time_seconds,
                "data_source_info": result.data_source_info
            }
            await cache_set(cache_key, cache_data, ttl=3600)
            
            logger.info(f"Successfully discovered and cataloged {discovered_count} items for data source {data_source_id}")
            
        except Exception as e:
            logger.error(f"Schema discovery failed for data source {data_source_id}: {str(e)}")
            result.errors.append(str(e))
        
        finally:
            end_time = datetime.now()
            result.processing_time_seconds = (end_time - start_time).total_seconds()
        
        return result
    
    async def _process_discovered_schema(self, session: Session, data_source: DataSource, schema_data: Dict[str, Any], discovered_by: str, result: SchemaDiscoveryResult) -> int:
        """Process discovered schema data and create catalog entries."""
        discovered_count = 0
        
        try:
            databases = schema_data.get("databases", [])
            
            for database in databases:
                schemas = database.get("schemas", [])
                
                for schema in schemas:
                    schema_name = schema["name"]
                    
                    # Process tables
                    for table in schema.get("tables", []):
                        try:
                            # Create table catalog entry
                            table_item = await self._create_table_catalog_item(
                                session, data_source, schema_name, table, discovered_by
                            )
                            if table_item:
                                discovered_count += 1
                            
                            # Process columns
                            for column in table.get("columns", []):
                                try:
                                    column_item = await self._create_column_catalog_item(
                                        session, data_source, schema_name, table["name"], column, discovered_by
                                    )
                                    if column_item:
                                        discovered_count += 1
                                except Exception as e:
                                    result.warnings.append(f"Failed to catalog column {column['name']}: {str(e)}")
                        
                        except Exception as e:
                            result.warnings.append(f"Failed to catalog table {table['name']}: {str(e)}")
                    
                    # Process views
                    for view in schema.get("views", []):
                        try:
                            view_item = await self._create_view_catalog_item(
                                session, data_source, schema_name, view, discovered_by
                            )
                            if view_item:
                                discovered_count += 1
                        except Exception as e:
                            result.warnings.append(f"Failed to catalog view {view['name']}: {str(e)}")
            
            session.commit()
            
        except Exception as e:
            session.rollback()
            raise e
        
        return discovered_count
    
    async def _process_selected_schema_items(self, session: Session, data_source: DataSource, schema_data: Dict[str, Any], selected_items: List[Dict[str, Any]], discovered_by: str, result: SchemaDiscoveryResult, action: str = 'add_new') -> int:
        """Process only the selected schema items and create catalog entries."""
        discovered_count = 0
        
        try:
            # Build a lookup structure for efficient searching
            schema_lookup = self._build_schema_lookup(schema_data)
            
            for selected_item in selected_items:
                try:
                    database_name = selected_item.get("database", "default")
                    schema_name = selected_item.get("schema", "public")
                    table_name = selected_item.get("table")
                    column_name = selected_item.get("column")
                    
                    # Find the corresponding schema data
                    db_data = schema_lookup.get(database_name, {})
                    schema_data = db_data.get(schema_name, {})
                    
                    if not schema_data:
                        result.warnings.append(f"Schema {database_name}.{schema_name} not found in discovered data")
                        continue
                    
                    if table_name and not column_name:
                        # Process entire table
                        table_data = schema_data.get("tables", {}).get(table_name)
                        if table_data:
                            # Create/update table based on action
                            if action == 'add_new':
                                existing = session.execute(
                                    select(CatalogItem).where(
                                        CatalogItem.data_source_id == data_source.id,
                                        CatalogItem.schema_name == schema_name,
                                        CatalogItem.table_name == table_name,
                                        CatalogItem.item_type == CatalogItemType.TABLE
                                    )
                                ).first()
                                if not existing:
                                    table_item = await self._create_table_catalog_item(
                                        session, data_source, schema_name, table_data, discovered_by
                                    )
                                    if table_item:
                                        discovered_count += 1
                            else:
                                table_item = await self._create_table_catalog_item(
                                    session, data_source, schema_name, table_data, discovered_by
                                )
                                if table_item:
                                    discovered_count += 1
                            
                            # Process all columns in the table
                            for col_data in table_data.get("columns", []):
                                if action == 'add_new':
                                    existing_col = session.execute(
                                        select(CatalogItem).where(
                                            CatalogItem.data_source_id == data_source.id,
                                            CatalogItem.schema_name == schema_name,
                                            CatalogItem.table_name == table_name,
                                            CatalogItem.column_name == col_data.get("name"),
                                            CatalogItem.item_type == CatalogItemType.COLUMN
                                        )
                                    ).first()
                                    if not existing_col:
                                        column_item = await self._create_column_catalog_item(
                                            session, data_source, schema_name, table_name, col_data, discovered_by
                                        )
                                        if column_item:
                                            discovered_count += 1
                                else:
                                    column_item = await self._create_column_catalog_item(
                                        session, data_source, schema_name, table_name, col_data, discovered_by
                                    )
                                    if column_item:
                                        discovered_count += 1
                        else:
                            result.warnings.append(f"Table {schema_name}.{table_name} not found in discovered data")
                    
                    elif table_name and column_name:
                        # Process specific column
                        table_data = schema_data.get("tables", {}).get(table_name)
                        if table_data:
                            # Ensure table is cataloged first
                            if action == 'add_new':
                                existing = session.execute(
                                    select(CatalogItem).where(
                                        CatalogItem.data_source_id == data_source.id,
                                        CatalogItem.schema_name == schema_name,
                                        CatalogItem.table_name == table_name,
                                        CatalogItem.item_type == CatalogItemType.TABLE
                                    )
                                ).first()
                                if not existing:
                                    table_item = await self._create_table_catalog_item(
                                        session, data_source, schema_name, table_data, discovered_by
                                    )
                                    if table_item:
                                        discovered_count += 1
                            else:
                                table_item = await self._create_table_catalog_item(
                                    session, data_source, schema_name, table_data, discovered_by
                                )
                                if table_item:
                                    discovered_count += 1
                            
                            # Find and process the specific column
                            column_data = next((col for col in table_data.get("columns", []) if col["name"] == column_name), None)
                            if column_data:
                                if action == 'add_new':
                                    existing_col = session.execute(
                                        select(CatalogItem).where(
                                            CatalogItem.data_source_id == data_source.id,
                                            CatalogItem.schema_name == schema_name,
                                            CatalogItem.table_name == table_name,
                                            CatalogItem.column_name == column_name,
                                            CatalogItem.item_type == CatalogItemType.COLUMN
                                        )
                                    ).first()
                                    if not existing_col:
                                        column_item = await self._create_column_catalog_item(
                                            session, data_source, schema_name, table_name, column_data, discovered_by
                                        )
                                        if column_item:
                                            discovered_count += 1
                                else:
                                    column_item = await self._create_column_catalog_item(
                                        session, data_source, schema_name, table_name, column_data, discovered_by
                                    )
                                    if column_item:
                                        discovered_count += 1
                            else:
                                result.warnings.append(f"Column {schema_name}.{table_name}.{column_name} not found in discovered data")
                        else:
                            result.warnings.append(f"Table {schema_name}.{table_name} not found in discovered data")
                    
                    elif not table_name and not column_name:
                        # Process entire schema
                        for table_name, table_data in schema_data.get("tables", {}).items():
                            # Create table catalog entry
                            table_item = await self._create_table_catalog_item(
                                session, data_source, schema_name, table_data, discovered_by
                            )
                            if table_item:
                                discovered_count += 1
                            
                            # Process all columns in the table
                            for col_data in table_data.get("columns", []):
                                column_item = await self._create_column_catalog_item(
                                    session, data_source, schema_name, table_name, col_data, discovered_by
                                )
                                if column_item:
                                    discovered_count += 1
                        
                        # Process views in the schema
                        for view_name, view_data in schema_data.get("views", {}).items():
                            if action == 'add_new':
                                existing_view = session.execute(
                                    select(CatalogItem).where(
                                        CatalogItem.data_source_id == data_source.id,
                                        CatalogItem.schema_name == schema_name,
                                        CatalogItem.table_name == view_name,
                                        CatalogItem.item_type == CatalogItemType.VIEW
                                    )
                                ).first()
                                if not existing_view:
                                    view_item = await self._create_view_catalog_item(
                                        session, data_source, schema_name, view_data, discovered_by
                                    )
                                    if view_item:
                                        discovered_count += 1
                            else:
                                view_item = await self._create_view_catalog_item(
                                    session, data_source, schema_name, view_data, discovered_by
                                )
                                if view_item:
                                    discovered_count += 1
                
                except Exception as e:
                    result.warnings.append(f"Failed to process selected item {selected_item}: {str(e)}")
            
            session.commit()
            logger.info(f"Successfully processed {len(selected_items)} selected items, created {discovered_count} catalog entries")
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error processing selected schema items: {e}")
            raise e
        
        return discovered_count
    
    def _build_schema_lookup(self, schema_data: Dict[str, Any]) -> Dict[str, Dict[str, Dict[str, Any]]]:
        """Build a lookup structure for efficient schema data access."""
        lookup = {}
        
        for database in schema_data.get("databases", []):
            db_name = database["name"]
            lookup[db_name] = {}
            
            for schema in database.get("schemas", []):
                schema_name = schema["name"]
                lookup[db_name][schema_name] = {
                    "tables": {table["name"]: table for table in schema.get("tables", [])},
                    "views": {view["name"]: view for view in schema.get("views", [])}
                }
        
        return lookup
    
    async def validate_selected_items(self, session: Session, data_source_id: int, selected_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate selected items against existing catalog entries and generate recommendations."""
        try:
            # Get existing catalog items for this data source
            existing_items = self.get_catalog_items_by_data_source(session, data_source_id)
            
            # Build lookup for existing items
            existing_lookup = {}
            for item in existing_items:
                key = f"{item.schema_name}.{item.table_name}"
                if item.column_name:
                    key += f".{item.column_name}"
                existing_lookup[key] = item
            
            # Analyze selected items
            validation_result = {
                "total_selected": len(selected_items),
                "existing_items": [],
                "new_items": [],
                "conflicts": [],
                "recommendations": [],
                "critical_items": [],
                "business_value_score": 0,
                "validation_summary": {}
            }
            
            for item in selected_items:
                database_name = item.get("database", "default")
                schema_name = item.get("schema", "public")
                table_name = item.get("table")
                column_name = item.get("column")
                
                # Build lookup key
                if column_name:
                    lookup_key = f"{schema_name}.{table_name}.{column_name}"
                    item_type = "column"
                elif table_name:
                    lookup_key = f"{schema_name}.{table_name}"
                    item_type = "table"
                else:
                    lookup_key = f"{schema_name}"
                    item_type = "schema"
                
                # Check if item exists
                existing_item = existing_lookup.get(lookup_key)
                
                if existing_item:
                    # Item already exists
                    validation_result["existing_items"].append({
                        "item": item,
                        "existing_catalog_item": {
                            "id": existing_item.id,
                            "name": existing_item.name,
                            "type": existing_item.type,
                            "created_at": existing_item.created_at.isoformat(),
                            "updated_at": existing_item.updated_at.isoformat(),
                            "metadata": existing_item.metadata
                        },
                        "conflict_type": "exists"
                    })
                else:
                    # New item
                    validation_result["new_items"].append({
                        "item": item,
                        "item_type": item_type,
                        "priority": self._calculate_item_priority(item, item_type)
                    })
            
            # Generate AI recommendations for critical items
            validation_result["recommendations"] = await self._generate_ai_recommendations(
                validation_result["new_items"], existing_items
            )
            
            # Identify critical items
            validation_result["critical_items"] = [
                item for item in validation_result["new_items"] 
                if item["priority"] >= 8  # High priority items
            ]
            
            # Calculate business value score
            validation_result["business_value_score"] = self._calculate_business_value_score(
                validation_result["new_items"], validation_result["existing_items"]
            )
            
            # Generate validation summary
            validation_result["validation_summary"] = {
                "existing_count": len(validation_result["existing_items"]),
                "new_count": len(validation_result["new_items"]),
                "critical_count": len(validation_result["critical_items"]),
                "recommendation_count": len(validation_result["recommendations"]),
                "business_value": validation_result["business_value_score"],
                "requires_user_decision": len(validation_result["existing_items"]) > 0
            }
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating selected items: {e}")
            raise e
    
    def _calculate_item_priority(self, item: Dict[str, Any], item_type: str) -> int:
        """Calculate priority score for an item (1-10, higher is more critical)."""
        priority = 5  # Base priority
        
        # Check for critical keywords
        critical_keywords = [
            "user", "customer", "client", "account", "payment", "transaction",
            "order", "product", "inventory", "financial", "security", "auth",
            "login", "password", "email", "phone", "address", "personal"
        ]
        
        table_name = item.get("table", "").lower()
        column_name = item.get("column", "").lower()
        
        # Check table name for critical keywords
        for keyword in critical_keywords:
            if keyword in table_name:
                priority += 2
                break
        
        # Check column name for critical keywords
        for keyword in critical_keywords:
            if keyword in column_name:
                priority += 3
                break
        
        # Higher priority for tables vs columns
        if item_type == "table":
            priority += 1
        elif item_type == "column":
            priority += 0.5
        
        # Check for data types that suggest sensitive information
        if any(dt in column_name for dt in ["id", "key", "token", "hash", "secret"]):
            priority += 2
        
        return min(10, max(1, int(priority)))
    
    def _calculate_business_value_score(self, new_items: List[Dict], existing_items: List[Dict]) -> int:
        """Calculate overall business value score (0-100)."""
        if not new_items:
            return 0
        
        total_priority = sum(item["priority"] for item in new_items)
        max_possible_priority = len(new_items) * 10
        return int((total_priority / max_possible_priority) * 100)
    
    async def _generate_ai_recommendations(self, new_items: List[Dict], existing_items: List) -> List[Dict]:
        """Generate diverse, sensitivity-aware recommendations.
        Strategy:
        - Base on priority, but enforce diversity across schemas/tables.
        - Boost items with sensitive/PII indicators or business-critical keywords.
        - Mix of tables and columns; cap per-schema to avoid clustering.
        """
        if not new_items:
            return []

        # Sensitivity and business keywords
        sensitive_terms = {
            "email", "phone", "address", "ssn", "social", "credit", "card", "token", "secret", "passwd",
            "password", "amount", "price", "medical", "health"
        }
        business_terms = {"user", "customer", "client", "account", "order", "transaction", "product", "inventory"}

        def boost_score(item: Dict) -> float:
            base = float(item.get("priority", 5))
            subject = (item.get("item", {}) or {})
            table_name = str(subject.get("table", "")).lower()
            column_name = str(subject.get("column", "")).lower()
            # sensitivity boosts
            if any(k in column_name for k in sensitive_terms):
                base += 2.5
            if any(k in table_name for k in sensitive_terms):
                base += 1.5
            # business boosts
            if any(k in table_name for k in business_terms):
                base += 1.0
            if subject.get("column") and any(k in column_name for k in business_terms):
                base += 0.5
            # prefer tables slightly for coverage
            if subject.get("table") and not subject.get("column"):
                base += 0.5
            return base

        # Score with boosts
        scored = [(boost_score(it), it) for it in new_items]
        scored.sort(key=lambda x: x[0], reverse=True)

        # Enforce diversity: max 2 per schema, and mix tables/columns
        seen_per_schema: Dict[str, int] = {}
        out: List[Dict] = []
        for score, item in scored:
            subj = item.get("item", {}) or {}
            schema = subj.get("schema", "") or "public"
            if seen_per_schema.get(schema, 0) >= 2:
                continue
            seen_per_schema[schema] = seen_per_schema.get(schema, 0) + 1

            action = "catalog_immediately" if score >= 8 else ("catalog_soon" if score >= 6 else "catalog_when_free")
            confidence = int(min(97, max(60, 65 + (score - 6) * 10)))
            out.append({
                "item": subj,
                "priority": int(min(10, round(score))),
                "reason": self._get_recommendation_reason(item),
                "action": action,
                "confidence": confidence
            })
            if len(out) >= 10:
                break

        # Ensure at least one column if available
        if not any(o["item"].get("column") for o in out):
            for score, item in scored:
                if item.get("item", {}).get("column"):
                    subj = item.get("item")
                    out.append({
                        "item": subj,
                        "priority": int(min(10, round(score))),
                        "reason": self._get_recommendation_reason(item),
                        "action": "catalog_soon",
                        "confidence": 70
                    })
                    break

        return out
    
    def _get_recommendation_reason(self, item: Dict) -> str:
        """Generate human-readable reason for recommendation."""
        priority = item["priority"]
        item_type = item["item_type"]
        table_name = item["item"].get("table", "")
        column_name = item["item"].get("column", "")
        
        if priority >= 8:
            return f"Critical {item_type} '{table_name}' contains sensitive business data requiring immediate cataloging"
        elif priority >= 6:
            return f"High-value {item_type} '{table_name}' should be prioritized for data governance"
        elif priority >= 4:
            return f"Standard {item_type} '{table_name}' recommended for complete data catalog"
        else:
            return f"Optional {item_type} '{table_name}' for comprehensive data coverage"
    
    async def _create_table_catalog_item(self, session: Session, data_source: DataSource, schema_name: str, table_data: Dict[str, Any], discovered_by: str) -> Optional[CatalogItem]:
        """Create catalog item for a discovered table."""
        table_name = table_data["name"]
        
        # Check if already exists
        existing = session.execute(
            select(CatalogItem).where(
                CatalogItem.data_source_id == data_source.id,
                CatalogItem.schema_name == schema_name,
                CatalogItem.table_name == table_name,
                CatalogItem.item_type == CatalogItemType.TABLE
            )
        ).first()
        
        if existing:
            # Update existing item with new metadata
            existing.metadata = self._build_table_metadata(table_data, data_source)
            existing.updated_at = datetime.now()
            session.add(existing)
            return existing
        
        # Auto-classify the table
        classification = self._auto_classify_item(table_name, None, None, data_source.source_type)
        
        # Generate intelligent description
        description = await self._generate_table_description(table_name, table_data, data_source)
        
        item = CatalogItem(
            data_source_id=data_source.id,
            item_type=CatalogItemType.TABLE,
            schema_name=schema_name,
            table_name=table_name,
            display_name=self._format_display_name(table_name),
            description=description,
            classification=classification,
            sensitivity_level=self._determine_sensitivity_level(classification),
            metadata=self._build_table_metadata(table_data, data_source),
            created_by=discovered_by
        )
        
        session.add(item)
        return item
    
    async def _create_column_catalog_item(self, session: Session, data_source: DataSource, schema_name: str, table_name: str, column_data: Dict[str, Any], discovered_by: str) -> Optional[CatalogItem]:
        """Create catalog item for a discovered column."""
        column_name = column_data["name"]
        
        # Check if already exists
        existing = session.execute(
            select(CatalogItem).where(
                CatalogItem.data_source_id == data_source.id,
                CatalogItem.schema_name == schema_name,
                CatalogItem.table_name == table_name,
                CatalogItem.column_name == column_name,
                CatalogItem.item_type == CatalogItemType.COLUMN
            )
        ).first()
        
        if existing:
            # Update existing item
            existing.data_type = column_data.get("data_type")
            existing.metadata = self._build_column_metadata(column_data, data_source)
            existing.updated_at = datetime.now()
            session.add(existing)
            return existing
        
        # Auto-classify the column
        classification = self._auto_classify_item(table_name, column_name, column_data.get("data_type"), data_source.source_type)
        
        # Generate intelligent description
        description = self._generate_column_description(column_name, column_data)
        
        item = CatalogItem(
            data_source_id=data_source.id,
            item_type=CatalogItemType.COLUMN,
            schema_name=schema_name,
            table_name=table_name,
            column_name=column_name,
            display_name=self._format_display_name(column_name),
            description=description,
            data_type=column_data.get("data_type"),
            classification=classification,
            sensitivity_level=self._determine_sensitivity_level(classification),
            metadata=self._build_column_metadata(column_data, data_source),
            created_by=discovered_by
        )
        
        session.add(item)
        return item
    
    async def _create_view_catalog_item(self, session: Session, data_source: DataSource, schema_name: str, view_data: Dict[str, Any], discovered_by: str) -> Optional[CatalogItem]:
        """Create catalog item for a discovered view."""
        view_name = view_data["name"]
        
        # Check if already exists
        existing = session.execute(
            select(CatalogItem).where(
                CatalogItem.data_source_id == data_source.id,
                CatalogItem.schema_name == schema_name,
                CatalogItem.table_name == view_name,
                CatalogItem.item_type == CatalogItemType.VIEW
            )
        ).first()
        
        if existing:
            # Update existing item
            existing.metadata = self._build_view_metadata(view_data, data_source)
            existing.updated_at = datetime.now()
            session.add(existing)
            return existing
        
        # Auto-classify the view
        classification = self._auto_classify_item(view_name, None, None, data_source.source_type)
        
        item = CatalogItem(
            data_source_id=data_source.id,
            item_type=CatalogItemType.VIEW,
            schema_name=schema_name,
            table_name=view_name,
            display_name=self._format_display_name(view_name),
            description=f"Database view: {view_name}",
            classification=classification,
            sensitivity_level=self._determine_sensitivity_level(classification),
            metadata=self._build_view_metadata(view_data, data_source),
            created_by=discovered_by
        )
        
        session.add(item)
        return item
    
    # ============================================================================
    # METADATA BUILDING AND INTELLIGENCE
    # ============================================================================
    
    def _build_table_metadata(self, table_data: Dict[str, Any], data_source: DataSource) -> Dict[str, Any]:
        """Build comprehensive metadata for a table."""
        metadata = {
            "discovery_timestamp": datetime.now().isoformat(),
            "data_source_type": data_source.source_type.value,
            "data_source_name": data_source.name,
            "column_count": len(table_data.get("columns", [])),
            "has_primary_key": table_data.get("has_primary_key", False),
            "estimated_row_count": table_data.get("row_count_estimate", 0),
            "size_bytes": table_data.get("size_bytes", 0),
            "indexes": table_data.get("indexes", []),
            "foreign_keys": table_data.get("foreign_keys", [])
        }
        
        # Add size information in human-readable format
        if metadata["size_bytes"] > 0:
            metadata["size_human"] = self._format_bytes(metadata["size_bytes"])
        
        return metadata
    
    def _build_column_metadata(self, column_data: Dict[str, Any], data_source: DataSource) -> Dict[str, Any]:
        """Build comprehensive metadata for a column."""
        return {
            "discovery_timestamp": datetime.now().isoformat(),
            "data_source_type": data_source.source_type.value,
            "data_source_name": data_source.name,
            "nullable": column_data.get("nullable", True),
            "default_value": column_data.get("default"),
            "is_primary_key": column_data.get("primary_key", False),
            "data_type_raw": column_data.get("data_type"),
            "max_length": self._extract_max_length(column_data.get("data_type"))
        }
    
    def _build_view_metadata(self, view_data: Dict[str, Any], data_source: DataSource) -> Dict[str, Any]:
        """Build comprehensive metadata for a view."""
        return {
            "discovery_timestamp": datetime.now().isoformat(),
            "data_source_type": data_source.source_type.value,
            "data_source_name": data_source.name,
            "column_count": len(view_data.get("columns", [])),
            "view_definition": view_data.get("definition", "")
        }
    
    async def _generate_table_description(self, table_name: str, table_data: Dict[str, Any], data_source: DataSource) -> str:
        """Generate enterprise-level intelligent description for a table with comprehensive analysis."""
        try:
            from app.services.advanced_ai_service import AdvancedAIService
            from app.services.advanced_analytics_service import AdvancedAnalyticsService
            from app.services.compliance_rule_service import ComplianceRuleService
            from app.services.data_quality_service import DataQualityService
            
            # Initialize enterprise services
            ai_service = AdvancedAIService()
            analytics_service = AdvancedAnalyticsService()
            compliance_service = ComplianceRuleService()
            quality_service = DataQualityService()
            
            column_count = len(table_data.get("columns", []))
            row_count = table_data.get("row_count_estimate", 0)
            
            # Enterprise-level intelligent description generation
            
            # 1. Get AI-powered table analysis
            ai_analysis = await ai_service.analyze_table_structure(
                table_name=table_name,
                columns=table_data.get("columns", []),
                data_source_name=data_source.name
            )
            
            # 2. Get compliance and regulatory context
            compliance_context = await compliance_service.get_table_compliance_context(
                table_name=table_name,
                data_source_id=data_source.id
            )
            
            # 3. Get data quality insights
            quality_insights = await quality_service.get_table_quality_insights(
                table_name=table_name,
                data_source_id=data_source.id
            )
            
            # 4. Get business context analysis
            business_context = await analytics_service.get_table_business_context(
                table_name=table_name,
                columns=table_data.get("columns", [])
            )
            
            # 5. Get data lineage insights
            lineage_insights = await analytics_service.get_table_lineage_insights(
                table_name=table_name,
                data_source_id=data_source.id
            )
            
            # Build comprehensive enterprise description
            description_parts = []
            
            # Base description
            description_parts.append(f"Enterprise table in {data_source.name} with {column_count} columns")
            
            if row_count > 0:
                description_parts.append(f"containing approximately {row_count:,} records")
            
            # Add AI-powered insights
            if ai_analysis:
                ai_purpose = ai_analysis.get('purpose', '')
                ai_domain = ai_analysis.get('domain', '')
                if ai_purpose:
                    description_parts.append(f"Purpose: {ai_purpose}")
                if ai_domain:
                    description_parts.append(f"Domain: {ai_domain}")
            
            # Add compliance context
            if compliance_context:
                frameworks = compliance_context.get('applicable_frameworks', [])
                if frameworks:
                    description_parts.append(f"Compliance: {', '.join(frameworks)}")
            
            # Add data quality insights
            if quality_insights:
                quality_score = quality_insights.get('overall_score', 0)
                if quality_score > 0:
                    description_parts.append(f"Data quality score: {quality_score:.1f}/10")
            
            # Add business context
            if business_context:
                business_domain = business_context.get('business_domain', '')
                if business_domain:
                    description_parts.append(f"Business domain: {business_domain}")
            
            # Add lineage insights
            if lineage_insights:
                upstream_count = lineage_insights.get('upstream_tables', 0)
                downstream_count = lineage_insights.get('downstream_tables', 0)
                if upstream_count > 0 or downstream_count > 0:
                    description_parts.append(f"Data lineage: {upstream_count} upstream, {downstream_count} downstream tables")
            
            # Add pattern-based insights (enhanced)
            table_lower = table_name.lower()
            pattern_insights = []
            
            if "user" in table_lower or "customer" in table_lower:
                pattern_insights.append("User/customer information")
            elif "order" in table_lower or "transaction" in table_lower:
                pattern_insights.append("Order/transaction data")
            elif "product" in table_lower or "catalog" in table_lower:
                pattern_insights.append("Product/catalog information")
            elif "log" in table_lower or "audit" in table_lower:
                pattern_insights.append("Logging/audit data")
            elif table_lower.endswith("_history") or table_lower.endswith("_archive"):
                pattern_insights.append("Historical/archived data")
            elif "config" in table_lower or "setting" in table_lower:
                pattern_insights.append("Configuration/settings data")
            elif "metric" in table_lower or "kpi" in table_lower:
                pattern_insights.append("Metrics/KPI data")
            
            if pattern_insights:
                description_parts.append(f"Pattern analysis: {', '.join(pattern_insights)}")
            
            # Combine all parts
            description = ". ".join(description_parts) + "."
            
            return description
            
        except Exception as e:
            logger.error(f"Enterprise table description generation failed: {e}")
            # Resilient fallback: concise, structured description with key metadata
            column_count = len(table_data.get("columns", []))
            row_count = table_data.get("row_count_estimate", 0)
            domain_tags = ", ".join(table_data.get("domain_tags", [])[:5]) if isinstance(table_data.get("domain_tags"), list) else ""
            pii = any(str(col.get('is_pii', False)).lower() == 'true' for col in table_data.get("columns", []))
            description = f"Table `{table_name}` in data source `{data_source.name}` with {column_count} columns"
            if row_count:
                description += f", approx. {row_count:,} rows"
            if domain_tags:
                description += f"; domains: {domain_tags}"
            if pii:
                description += "; contains PII indicators"
            elif "order" in table_lower:
                description += ". Appears to be related to orders or transactions."
            elif "product" in table_lower:
                description += ". Contains product or catalog information."
            elif "log" in table_lower or "audit" in table_lower:
                description += ". Used for logging or audit purposes."
            elif table_lower.endswith("_history") or table_lower.endswith("_archive"):
                description += ". Historical or archived data."
            
            return description
    
    def _generate_column_description(self, column_name: str, column_data: Dict[str, Any]) -> str:
        """Generate intelligent description for a column."""
        data_type = column_data.get("data_type", "unknown")
        nullable = column_data.get("nullable", True)
        is_pk = column_data.get("primary_key", False)
        
        description = f"Column of type {data_type}"
        
        if is_pk:
            description = f"Primary key {description.lower()}"
        elif not nullable:
            description += " (required)"
        
        # Add insights based on name patterns
        column_lower = column_name.lower()
        if column_lower in ["id", "uuid", "guid"]:
            description += ". Unique identifier."
        elif "email" in column_lower:
            description += ". Email address field."
        elif "phone" in column_lower:
            description += ". Phone number field."
        elif "address" in column_lower:
            description += ". Address information."
        elif "created" in column_lower or "updated" in column_lower:
            description += ". Timestamp field."
        elif "password" in column_lower:
            description += ". Password or credential field."
        elif "amount" in column_lower or "price" in column_lower:
            description += ". Monetary value."
        
        return description
    
    # ============================================================================
    # UTILITY METHODS
    # ============================================================================
    
    def _format_display_name(self, name: str) -> str:
        """Format technical names into human-readable display names."""
        # Replace underscores with spaces and title case
        formatted = name.replace("_", " ").replace("-", " ")
        return " ".join(word.capitalize() for word in formatted.split())
    
    def _determine_sensitivity_level(self, classification: DataClassification) -> str:
        """Determine sensitivity level based on classification."""
        if classification == DataClassification.RESTRICTED:
            return "HIGH"
        elif classification == DataClassification.CONFIDENTIAL:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _format_bytes(self, bytes_value: int) -> str:
        """Format bytes into human-readable format."""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if bytes_value < 1024.0:
                return f"{bytes_value:.1f} {unit}"
            bytes_value /= 1024.0
        return f"{bytes_value:.1f} PB"
    
    def _extract_max_length(self, data_type: Optional[str]) -> Optional[int]:
        """Extract max length from data type string."""
        if not data_type:
            return None
        
        import re
        match = re.search(r'\((\d+)\)', data_type)
        if match:
            return int(match.group(1))
        return None
    
    # ============================================================================
    # SYNCHRONIZATION AND MAINTENANCE
    # ============================================================================
    
    async def sync_catalog_with_data_source(self, session: Session, data_source_id: int, sync_by: str) -> CatalogSyncResult:
        """Synchronize catalog with current state of data source."""
        start_time = datetime.now()
        result = CatalogSyncResult(
            success=False,
            items_created=0,
            items_updated=0,
            items_deleted=0,
            errors=[],
            sync_duration_seconds=0
        )
        
        try:
            # Force fresh discovery
            discovery_result = await self.discover_and_catalog_schema(
                session, data_source_id, sync_by, force_refresh=True
            )
            
            if not discovery_result.success:
                result.errors.extend(discovery_result.errors)
                return result
            
            result.items_created = discovery_result.discovered_items
            
            # Implement detection of deleted items (items in catalog but not in source)
            try:
                from app.services.catalog_cleanup_service import CatalogCleanupService
                from app.services.data_source_service import DataSourceService
                
                # Initialize services
                cleanup_service = CatalogCleanupService()
                data_source_service = DataSourceService()
                
                # Get current catalog items for this data source
                current_catalog_items = session.query(CatalogItem).filter(
                    CatalogItem.data_source_id == data_source_id,
                    CatalogItem.is_active == True
                ).all()
                
                # Get discovered items from the discovery result
                discovered_item_names = set()
                for item in discovery_result.discovered_items:
                    if hasattr(item, 'table_name') and hasattr(item, 'column_name'):
                        item_key = f"{item.table_name}.{item.column_name}"
                        discovered_item_names.add(item_key)
                
                # Find items that exist in catalog but not in discovered items
                deleted_items = []
                for catalog_item in current_catalog_items:
                    catalog_item_key = f"{catalog_item.table_name}.{catalog_item.column_name}"
                    if catalog_item_key not in discovered_item_names:
                        deleted_items.append(catalog_item)
                
                # Process deleted items
                if deleted_items:
                    deletion_result = await cleanup_service.process_deleted_items(
                        deleted_items=deleted_items,
                        data_source_id=data_source_id,
                        session=session
                    )
                    
                    result.items_deleted = len(deleted_items)
                    result.deletion_details = {
                        "deleted_items": [item.id for item in deleted_items],
                        "deletion_strategy": deletion_result.get("strategy", "mark_inactive"),
                        "archived_count": deletion_result.get("archived_count", 0),
                        "permanently_deleted_count": deletion_result.get("permanently_deleted_count", 0)
                    }
                    
                    logger.info(f"Detected and processed {len(deleted_items)} deleted items for data source {data_source_id}")
                
            except Exception as e:
                logger.warning(f"Failed to detect deleted items for data source {data_source_id}: {e}")
                # Continue with sync even if deletion detection fails
                result.errors.append(f"Deletion detection failed: {str(e)}")
            
            result.success = True
            
            logger.info(f"Successfully synchronized catalog for data source {data_source_id}")
            
        except Exception as e:
            logger.error(f"Catalog synchronization failed for data source {data_source_id}: {str(e)}")
            result.errors.append(str(e))
        
        finally:
            end_time = datetime.now()
            result.sync_duration_seconds = (end_time - start_time).total_seconds()
        
        return result
    
    # ============================================================================
    # LEGACY COMPATIBILITY METHODS (Enhanced versions)
    # ============================================================================
    
    @staticmethod
    def update_catalog_item(session: Session, item_id: int, item_data: CatalogItemUpdate, updated_by: str) -> Optional[CatalogItemResponse]:
        """Update an existing catalog item with enhanced validation."""
        try:
            item = session.get(CatalogItem, item_id)
            if not item:
                return None
            
            # Update fields with validation
            if item_data.display_name is not None:
                item.display_name = item_data.display_name
            if item_data.description is not None:
                item.description = item_data.description
            if item_data.data_type is not None:
                item.data_type = item_data.data_type
            if item_data.classification is not None:
                item.classification = item_data.classification
                # Update sensitivity level based on new classification
                item.sensitivity_level = EnhancedCatalogService._determine_sensitivity_level(
                    EnhancedCatalogService(), item_data.classification
                )
            if item_data.sensitivity_level is not None:
                item.sensitivity_level = item_data.sensitivity_level
            if item_data.business_glossary is not None:
                item.business_glossary = item_data.business_glossary
            if item_data.metadata is not None:
                # Merge with existing metadata
                existing_metadata = item.metadata or {}
                existing_metadata.update(item_data.metadata)
                existing_metadata["last_updated"] = datetime.now().isoformat()
                existing_metadata["updated_by"] = updated_by
                item.metadata = existing_metadata
            if item_data.is_active is not None:
                item.is_active = item_data.is_active
            
            item.updated_at = datetime.now()
            
            session.add(item)
            session.commit()
            session.refresh(item)
            
            # Clear related caches
            asyncio.run(cache_delete(f"catalog_item_{item_id}"))
            asyncio.run(cache_delete(f"catalog_items_ds_{item.data_source_id}"))
            
            logger.info(f"Updated catalog item {item_id} by {updated_by}")
            return CatalogItemResponse.from_orm(item)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error updating catalog item {item_id}: {str(e)}")
            raise
    
    @staticmethod
    async def search_catalog_items(session: Session, query: str, data_source_id: Optional[int] = None, classification: Optional[DataClassification] = None, limit: int = 50) -> List[CatalogItemResponse]:
        """Enhanced search with better indexing and relevance."""
        try:
            # Build search query with better text matching
            statement = select(CatalogItem).where(
                CatalogItem.is_active == True,
                (CatalogItem.table_name.ilike(f"%{query}%")) |
                (CatalogItem.column_name.ilike(f"%{query}%")) |
                (CatalogItem.display_name.ilike(f"%{query}%")) |
                (CatalogItem.description.ilike(f"%{query}%")) |
                (CatalogItem.business_glossary.ilike(f"%{query}%"))
            )
            
            if data_source_id:
                statement = statement.where(CatalogItem.data_source_id == data_source_id)
            
            if classification:
                statement = statement.where(CatalogItem.classification == classification)
            
            # Order by relevance (exact matches first, then partial)
            items = session.execute(statement.limit(limit)).all()
            
            # Enterprise-level relevance scoring with comprehensive analysis
            scored_items = []
            for item in items:
                try:
                    from app.services.advanced_ai_service import AdvancedAIService
                    from app.services.advanced_analytics_service import AdvancedAnalyticsService
                    from app.services.semantic_search_service import SemanticSearchService
                    from app.services.usage_analytics_service import UsageAnalyticsService
                    
                    # Initialize enterprise services
                    ai_service = AdvancedAIService()
                    analytics_service = AdvancedAnalyticsService()
                    semantic_service = SemanticSearchService()
                    usage_service = UsageAnalyticsService()
                    
                    # Enterprise-level relevance scoring
                    score = 0
                    query_lower = query.lower()
                    
                    # 1. Exact matches (highest priority)
                    if item.table_name and query_lower == item.table_name.lower():
                        score += 100
                    elif item.display_name and query_lower == item.display_name.lower():
                        score += 90
                    elif item.column_name and query_lower == item.column_name.lower():
                        score += 80
                    
                    # 2. Semantic similarity analysis
                    semantic_score = await semantic_service.calculate_semantic_similarity(
                        query=query,
                        item_name=item.display_name or item.table_name or item.column_name or '',
                        item_description=item.description or ''
                    )
                    score += semantic_score * 30  # Weight semantic similarity
                    
                    # 3. Usage-based relevance
                    usage_score = await usage_service.get_item_usage_score(
                        item_id=item.id,
                        item_type=item.item_type
                    )
                    score += usage_score * 20  # Weight usage relevance
                    
                    # 4. Business context relevance
                    business_relevance = await analytics_service.get_business_context_relevance(
                        query=query,
                        item_classification=item.classification,
                        item_business_glossary=item.business_glossary
                    )
                    score += business_relevance * 15  # Weight business context
                    
                    # 5. Data quality relevance
                    quality_relevance = await analytics_service.get_data_quality_relevance(
                        item_id=item.id,
                        query_context=query
                    )
                    score += quality_relevance * 10  # Weight data quality
                    
                    # 6. Partial matches with enhanced scoring
                    if item.table_name and query_lower in item.table_name.lower():
                        # Enhanced partial matching with position weighting
                        position = item.table_name.lower().find(query_lower)
                        position_score = max(0, 50 - (position * 2))  # Higher score for earlier matches
                        score += position_score
                    
                    if item.display_name and query_lower in item.display_name.lower():
                        position = item.display_name.lower().find(query_lower)
                        position_score = max(0, 40 - (position * 2))
                        score += position_score
                    
                    if item.description and query_lower in item.description.lower():
                        position = item.description.lower().find(query_lower)
                        position_score = max(0, 20 - (position * 1))
                        score += position_score
                    
                    # 7. Classification relevance
                    if item.classification:
                        classification_boost = {
                            DataClassification.RESTRICTED: 10,
                            DataClassification.CONFIDENTIAL: 5,
                            DataClassification.PUBLIC: 0
                        }.get(item.classification, 0)
                        score += classification_boost
                    
                    # 8. Recency boost
                    if item.updated_at:
                        days_since_update = (datetime.now() - item.updated_at).days
                        recency_boost = max(0, 10 - (days_since_update // 30))  # Boost for recent updates
                        score += recency_boost
                    
                    # 9. Popularity boost
                    popularity_score = await usage_service.get_item_popularity_score(item.id)
                    score += popularity_score * 5
                    
                    # 10. Tag relevance
                    if item.tags:
                        tag_relevance = await semantic_service.calculate_tag_relevance(
                            query=query,
                            tags=item.tags
                        )
                        score += tag_relevance * 8
                    
                    scored_items.append((score, item))
                    
                except Exception as scoring_error:
                    logger.warning(f"Enterprise relevance scoring failed for item {item.id}: {scoring_error}")
                    # Structured fallback scoring: exact/partial + recency + usage
                    fallback_score = 0
                    query_lower = query.lower()
                    exacts = [
                        (item.table_name, 100),
                        (item.display_name, 95),
                        (item.column_name, 90),
                    ]
                    matched_exact = False
                    for val, pts in exacts:
                        if val and query_lower == str(val).lower():
                            fallback_score += pts
                            matched_exact = True
                            break
                    if not matched_exact:
                        partials = [
                            (item.table_name, 60),
                            (item.display_name, 55),
                            (item.column_name, 50),
                            (item.description, 30),
                        ]
                        for val, pts in partials:
                            if val and query_lower in str(val).lower():
                                fallback_score += pts
                                break
                    # Usage boost
                    try:
                        usage_score = await usage_analytics_service.get_item_usage_score(item.id, item_type)
                        fallback_score += min(30, int(usage_score * 10))
                    except Exception:
                        pass
                        if item.display_name and query_lower in item.display_name.lower():
                            fallback_score += 40
                        if item.description and query_lower in item.description.lower():
                            fallback_score += 20
                    
                    scored_items.append((fallback_score, item))
            
            # Sort by score descending
            scored_items.sort(key=lambda x: x[0], reverse=True)
            
            return [CatalogItemResponse.from_orm(item) for score, item in scored_items]
            
        except Exception as e:
            logger.error(f"Error searching catalog items: {str(e)}")
            return []
    
    @staticmethod
    async def get_catalog_stats(session: Session, data_source_id: Optional[int] = None) -> CatalogStats:
        """Get enhanced catalog statistics with real-time data."""
        cache_key = f"catalog_stats_{data_source_id or 'all'}"
        
        try:
            # Try cache first
            cached_result = asyncio.run(cache_get(cache_key))
            if cached_result:
                return CatalogStats(**cached_result)
            
            # Base query
            query = select(CatalogItem)
            if data_source_id:
                query = query.where(CatalogItem.data_source_id == data_source_id)
            
            items = session.execute(query).scalars().all()
            
            total_items = len(items)
            active_items = len([i for i in items if i.is_active])
            
            # Count by type
            type_counts = {}
            for item in items:
                type_counts[item.item_type] = type_counts.get(item.item_type, 0) + 1
            
            # Count by classification
            classified_items = len([i for i in items if i.classification])
            public_items = len([i for i in items if i.classification == DataClassification.PUBLIC])
            confidential_items = len([i for i in items if i.classification == DataClassification.CONFIDENTIAL])
            restricted_items = len([i for i in items if i.classification == DataClassification.RESTRICTED])
            
            # Get tag and lineage counts
            tag_query = select(CatalogTag)
            if data_source_id:
                tag_query = tag_query.join(CatalogItem).where(CatalogItem.data_source_id == data_source_id)
            tag_count = len(session.execute(tag_query).scalars().all())
            
            lineage_query = select(DataLineage)
            if data_source_id:
                lineage_query = lineage_query.join(CatalogItem, DataLineage.source_item_id == CatalogItem.id).where(CatalogItem.data_source_id == data_source_id)
            lineage_count = len(session.execute(lineage_query).scalars().all())
            
            # Get recent items (last 5)
            recent_query = select(CatalogItem).order_by(CatalogItem.created_at.desc()).limit(5)
            if data_source_id:
                recent_query = recent_query.where(CatalogItem.data_source_id == data_source_id)
            recent_items = session.execute(recent_query).scalars().all()
            
            # Get data quality rules count
            data_quality_rules_count = 0
            try:
                from app.services.catalog_quality_service import CatalogQualityService
                from app.services.data_quality_rule_service import DataQualityRuleService
                
                # Initialize quality services
                quality_service = CatalogQualityService()
                rule_service = DataQualityRuleService()
                
                # Get data quality rules for this data source
                if data_source_id:
                    data_quality_rules_count = await rule_service.count_rules_for_data_source(
                        data_source_id=data_source_id,
                        session=session
                    )
                else:
                    # Get total rules across all data sources
                    data_quality_rules_count = await rule_service.count_total_rules(session=session)
                    
            except Exception as e:
                logger.warning(f"Failed to get data quality rules count: {e}")
                # Fallback: try to get from catalog quality service
                try:
                    if data_source_id:
                        data_quality_rules_count = await quality_service.count_quality_rules(
                            data_source_id=data_source_id,
                            session=session
                        )
                except Exception:
                    data_quality_rules_count = 0
            
            stats = CatalogStats(
                total_items=total_items,
                active_items=active_items,
                tables=type_counts.get(CatalogItemType.TABLE, 0),
                columns=type_counts.get(CatalogItemType.COLUMN, 0),
                views=type_counts.get(CatalogItemType.VIEW, 0),
                classified_items=classified_items,
                public_items=public_items,
                confidential_items=confidential_items,
                restricted_items=restricted_items,
                total_tags=tag_count,
                total_lineage=lineage_count,
                data_quality_rules=data_quality_rules_count,
                recent_items=[CatalogItemResponse.from_orm(item) for item in recent_items]
            )
            
            # Cache for 5 minutes
            asyncio.run(cache_set(cache_key, stats.dict(), ttl=300))
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting catalog stats: {str(e)}")
            return CatalogStats(
                total_items=0,
                active_items=0,
                tables=0,
                columns=0,
                views=0,
                classified_items=0,
                public_items=0,
                confidential_items=0,
                restricted_items=0,
                total_tags=0,
                total_lineage=0,
                data_quality_rules=0,
                recent_items=[]
            )

# Maintain backward compatibility
CatalogService = EnhancedCatalogService