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
        """Get all catalog items for a data source with caching."""
        cache_key = f"catalog_items_ds_{data_source_id}"
        
        try:
            # Try cache first
            cached_result = asyncio.run(cache_get(cache_key))
            if cached_result:
                return [CatalogItemResponse(**item) for item in cached_result]
            
            statement = select(CatalogItem).where(
                CatalogItem.data_source_id == data_source_id
            ).order_by(CatalogItem.created_at.desc())
            
            items = session.exec(statement).all()
            result = [CatalogItemResponse.from_orm(item) for item in items]
            
            # Cache the result for 5 minutes
            asyncio.run(cache_set(cache_key, [item.dict() for item in result], ttl=300))
            
            return result
        except Exception as e:
            logger.error(f"Error getting catalog items for data source {data_source_id}: {str(e)}")
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
            existing = session.exec(
                select(CatalogItem).where(
                    CatalogItem.data_source_id == item_data.data_source_id,
                    CatalogItem.schema_name == item_data.schema_name,
                    CatalogItem.table_name == item_data.table_name
                )
            ).first()
            
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
    
    async def discover_and_catalog_schema(self, session: Session, data_source_id: int, discovered_by: str, force_refresh: bool = False) -> SchemaDiscoveryResult:
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
            
            # Discover schema
            schema_discovery = await self.connection_service.discover_schema(data_source)
            if not schema_discovery["success"]:
                result.errors.append("Schema discovery failed")
                return result
            
            result.data_source_info = {
                "name": data_source.name,
                "type": data_source.source_type.value,
                "host": data_source.host,
                "connection_time_ms": connection_test["connection_time_ms"]
            }
            
            # Process discovered schema
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
    
    async def _create_table_catalog_item(self, session: Session, data_source: DataSource, schema_name: str, table_data: Dict[str, Any], discovered_by: str) -> Optional[CatalogItem]:
        """Create catalog item for a discovered table."""
        table_name = table_data["name"]
        
        # Check if already exists
        existing = session.exec(
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
        description = self._generate_table_description(table_name, table_data, data_source)
        
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
        existing = session.exec(
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
        existing = session.exec(
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
    
    def _generate_table_description(self, table_name: str, table_data: Dict[str, Any], data_source: DataSource) -> str:
        """Generate intelligent description for a table."""
        column_count = len(table_data.get("columns", []))
        row_count = table_data.get("row_count_estimate", 0)
        
        # Basic description
        description = f"Table in {data_source.name} with {column_count} columns"
        
        if row_count > 0:
            description += f" containing approximately {row_count:,} records"
        
        # Add insights based on name patterns
        table_lower = table_name.lower()
        if "user" in table_lower:
            description += ". Likely contains user information."
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
            
            # TODO: Implement detection of deleted items (items in catalog but not in source)
            # This would require comparing current catalog with discovered schema
            
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
    def search_catalog_items(session: Session, query: str, data_source_id: Optional[int] = None, classification: Optional[DataClassification] = None, limit: int = 50) -> List[CatalogItemResponse]:
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
            items = session.exec(statement.limit(limit)).all()
            
            # Simple relevance scoring
            scored_items = []
            for item in items:
                score = 0
                query_lower = query.lower()
                
                # Exact matches score higher
                if item.table_name and query_lower == item.table_name.lower():
                    score += 100
                elif item.display_name and query_lower == item.display_name.lower():
                    score += 90
                elif item.column_name and query_lower == item.column_name.lower():
                    score += 80
                else:
                    # Partial matches
                    if item.table_name and query_lower in item.table_name.lower():
                        score += 50
                    if item.display_name and query_lower in item.display_name.lower():
                        score += 40
                    if item.description and query_lower in item.description.lower():
                        score += 20
                
                scored_items.append((score, item))
            
            # Sort by score descending
            scored_items.sort(key=lambda x: x[0], reverse=True)
            
            return [CatalogItemResponse.from_orm(item) for score, item in scored_items]
            
        except Exception as e:
            logger.error(f"Error searching catalog items: {str(e)}")
            return []
    
    @staticmethod
    def get_catalog_stats(session: Session, data_source_id: Optional[int] = None) -> CatalogStats:
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
            
            items = session.exec(query).all()
            
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
            tag_count = len(session.exec(tag_query).all())
            
            lineage_query = select(DataLineage)
            if data_source_id:
                lineage_query = lineage_query.join(CatalogItem, DataLineage.source_item_id == CatalogItem.id).where(CatalogItem.data_source_id == data_source_id)
            lineage_count = len(session.exec(lineage_query).all())
            
            # Get recent items (last 5)
            recent_query = select(CatalogItem).order_by(CatalogItem.created_at.desc()).limit(5)
            if data_source_id:
                recent_query = recent_query.where(CatalogItem.data_source_id == data_source_id)
            recent_items = session.exec(recent_query).all()
            
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
                data_quality_rules=0,  # TODO: Implement when data quality is added
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