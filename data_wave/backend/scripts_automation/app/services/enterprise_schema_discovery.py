"""
Enterprise-Grade Schema Discovery Service
Advanced schema discovery for production environments with intelligent resource management
"""

import asyncio
import json
import logging
import time
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import traceback
import threading
from collections import defaultdict, deque
import weakref

from sqlalchemy import create_engine, inspect, text, MetaData
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool, StaticPool
from sqlalchemy.exc import SQLAlchemyError, DisconnectionError
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger(__name__)

class DiscoveryStrategy(Enum):
    """Discovery strategy based on database load and complexity"""
    CONSERVATIVE = "conservative"  # For high-load production systems
    BALANCED = "balanced"         # For moderate load systems
    AGGRESSIVE = "aggressive"     # For low-load or dedicated systems

class ResourceLevel(Enum):
    """Current resource utilization level"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class DiscoveryMetrics:
    """Metrics for monitoring discovery performance"""
    start_time: float
    end_time: Optional[float] = None
    tables_discovered: int = 0
    schemas_discovered: int = 0
    queries_executed: int = 0
    connection_errors: int = 0
    retry_attempts: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    
    @property
    def duration(self) -> float:
        return (self.end_time or time.time()) - self.start_time
    
    @property
    def queries_per_second(self) -> float:
        return self.queries_executed / max(self.duration, 0.001)
    
    @property
    def tables_per_second(self) -> float:
        return self.tables_discovered / max(self.duration, 0.001)

@dataclass
class ConnectionConfig:
    """Advanced connection configuration"""
    pool_size: int = 2
    max_overflow: int = 3
    pool_timeout: int = 60
    pool_recycle: int = 300
    connect_timeout: int = 10
    query_timeout: int = 30
    batch_size: int = 5
    delay_between_batches: float = 0.5
    max_retries: int = 3
    retry_delay: float = 1.0

class IntelligentCache:
    """Intelligent caching system for schema metadata"""
    
    def __init__(self, max_size: int = 1000, ttl_seconds: int = 3600):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._access_times: Dict[str, float] = {}
        self._lock = threading.RLock()
    
    def _is_expired(self, key: str) -> bool:
        return time.time() - self._access_times.get(key, 0) > self.ttl_seconds
    
    def _evict_lru(self):
        """Evict least recently used items"""
        if len(self._cache) >= self.max_size:
            lru_key = min(self._access_times.keys(), key=lambda k: self._access_times[k])
            self._cache.pop(lru_key, None)
            self._access_times.pop(lru_key, None)
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            if key in self._cache and not self._is_expired(key):
                self._access_times[key] = time.time()
                return self._cache[key]
            return None
    
    def set(self, key: str, value: Dict[str, Any]):
        with self._lock:
            if self._is_expired(key) or key not in self._cache:
                self._evict_lru()
            self._cache[key] = value
            self._access_times[key] = time.time()
    
    def invalidate(self, pattern: str = None):
        """Invalidate cache entries matching pattern"""
        with self._lock:
            if pattern:
                keys_to_remove = [k for k in self._cache.keys() if pattern in k]
                for key in keys_to_remove:
                    self._cache.pop(key, None)
                    self._access_times.pop(key, None)
            else:
                self._cache.clear()
                self._access_times.clear()

class ResourceMonitor:
    """Monitor database resource utilization and adjust strategy"""
    
    def __init__(self):
        self._query_times: deque = deque(maxlen=100)
        self._error_counts: deque = deque(maxlen=50)
        self._connection_counts: Dict[str, int] = defaultdict(int)
        self._last_check = time.time()
    
    def record_query_time(self, duration: float):
        self._query_times.append(duration)
    
    def record_error(self, error_type: str):
        self._error_counts.append((time.time(), error_type))
    
    def record_connection(self, data_source_id: str):
        self._connection_counts[data_source_id] += 1
    
    def get_resource_level(self) -> ResourceLevel:
        """Determine current resource utilization level"""
        now = time.time()
        
        # Check recent error rate
        recent_errors = sum(1 for t, _ in self._error_counts if now - t < 60)
        if recent_errors > 10:
            return ResourceLevel.CRITICAL
        
        # Check average query time
        if self._query_times:
            avg_query_time = sum(self._query_times) / len(self._query_times)
            if avg_query_time > 5.0:
                return ResourceLevel.HIGH
            elif avg_query_time > 2.0:
                return ResourceLevel.MEDIUM
        
        return ResourceLevel.LOW
    
    def get_optimal_strategy(self) -> DiscoveryStrategy:
        """Get optimal discovery strategy based on current resources"""
        resource_level = self.get_resource_level()
        
        if resource_level == ResourceLevel.CRITICAL:
            return DiscoveryStrategy.CONSERVATIVE
        elif resource_level == ResourceLevel.HIGH:
            return DiscoveryStrategy.CONSERVATIVE
        elif resource_level == ResourceLevel.MEDIUM:
            return DiscoveryStrategy.BALANCED
        else:
            return DiscoveryStrategy.AGGRESSIVE

class AdaptiveQueryEngine:
    """Adaptive query engine that optimizes based on database response"""
    
    def __init__(self, connection_string: str, data_source_id: str):
        self.connection_string = connection_string
        self.data_source_id = data_source_id
        self.resource_monitor = ResourceMonitor()
        self.cache = IntelligentCache()
        self._engines: Dict[DiscoveryStrategy, Engine] = {}
        self._strategy_configs = self._create_strategy_configs()
    
    def _create_strategy_configs(self) -> Dict[DiscoveryStrategy, ConnectionConfig]:
        """Create connection configurations for each strategy"""
        return {
            DiscoveryStrategy.CONSERVATIVE: ConnectionConfig(
                pool_size=1,
                max_overflow=1,
                pool_timeout=120,
                batch_size=1,  # Process only 1 table at a time to prevent exhaustion
                delay_between_batches=3.0,  # Longer delay between batches
                max_retries=5,
                retry_delay=2.0
            ),
            DiscoveryStrategy.BALANCED: ConnectionConfig(
                pool_size=1,
                max_overflow=1,
                pool_timeout=90,
                batch_size=2,  # Process only 2 tables at a time
                delay_between_batches=1.5,  # Longer delay between batches
                max_retries=3,
                retry_delay=1.0
            ),
            DiscoveryStrategy.AGGRESSIVE: ConnectionConfig(
                pool_size=2,
                max_overflow=2,
                pool_timeout=60,
                batch_size=3,  # Process only 3 tables at a time
                delay_between_batches=0.5,  # Longer delay between batches
                max_retries=2,
                retry_delay=0.5
            )
        }
    
    def _get_engine(self, strategy: DiscoveryStrategy) -> Engine:
        """Get or create engine for specific strategy"""
        if strategy not in self._engines:
            config = self._strategy_configs[strategy]
            self._engines[strategy] = create_engine(
                self.connection_string,
                poolclass=QueuePool,
                pool_size=config.pool_size,
                max_overflow=config.max_overflow,
                pool_timeout=config.pool_timeout,
                pool_recycle=config.pool_recycle,
                pool_pre_ping=True,
                connect_args={
                    "connect_timeout": config.connect_timeout,
                    "application_name": f"enterprise_discovery_{self.data_source_id}"
                }
            )
        return self._engines[strategy]
    
    async def execute_with_retry(self, query_func, *args, **kwargs) -> Any:
        """Execute query with intelligent retry logic"""
        strategy = self.resource_monitor.get_optimal_strategy()
        config = self._strategy_configs[strategy]
        
        for attempt in range(config.max_retries):
            try:
                start_time = time.time()
                result = await query_func(*args, **kwargs)
                duration = time.time() - start_time
                
                self.resource_monitor.record_query_time(duration)
                return result
                
            except (DisconnectionError, SQLAlchemyError) as e:
                self.resource_monitor.record_error(type(e).__name__)
                
                if attempt < config.max_retries - 1:
                    await asyncio.sleep(config.retry_delay * (2 ** attempt))
                    # Recreate engine on connection errors
                    if strategy in self._engines:
                        del self._engines[strategy]
                else:
                    logger.error(f"Query failed after {config.max_retries} attempts: {e}")
                    raise
        
        return None

class EnterpriseSchemaDiscovery:
    """Enterprise-grade schema discovery with advanced resource management"""
    
    def __init__(self, data_source_id: str, connection_string: str):
        self.data_source_id = data_source_id
        self.connection_string = connection_string
        self.query_engine = AdaptiveQueryEngine(connection_string, data_source_id)
        self.metrics = DiscoveryMetrics(start_time=time.time())
        self._discovery_lock = asyncio.Lock()
    
    async def discover_schemas(self) -> Dict[str, Any]:
        """Main discovery method with enterprise-grade resource management"""
        async with self._discovery_lock:
            try:
                logger.info(f"Starting enterprise schema discovery for data source {self.data_source_id}")
                
                # Get optimal strategy based on current resources
                strategy = self.query_engine.resource_monitor.get_optimal_strategy()
                logger.info(f"Using discovery strategy: {strategy.value}")
                
                # Execute discovery with adaptive strategy
                result = await self._execute_discovery(strategy)
                
                self.metrics.end_time = time.time()
                logger.info(f"Discovery completed in {self.metrics.duration:.2f}s. "
                          f"Discovered {self.metrics.schemas_discovered} schemas, "
                          f"{self.metrics.tables_discovered} tables")
                
                # Ensure all connections are properly closed
                await self._cleanup_connections()
                
                return result
                
            except Exception as e:
                logger.error(f"Enterprise schema discovery failed: {e}")
                self.metrics.end_time = time.time()
                raise
    
    async def _execute_discovery(self, strategy: DiscoveryStrategy) -> Dict[str, Any]:
        """Execute discovery with specific strategy"""
        config = self.query_engine._strategy_configs[strategy]
        engine = self.query_engine._get_engine(strategy)
        inspector = inspect(engine)
        
        # Get database information
        databases = []
        current_db = {
            "name": "default",
            "schemas": []
        }
        
        # Get schemas with caching
        cache_key = f"schemas_{self.data_source_id}"
        schemas_info = self.query_engine.cache.get(cache_key)
        
        if schemas_info is None:
            schemas_info = await self._discover_schemas_optimized(inspector, config)
            self.query_engine.cache.set(cache_key, schemas_info)
            self.metrics.cache_misses += 1
        else:
            self.metrics.cache_hits += 1
        
        current_db["schemas"] = schemas_info
        databases.append(current_db)
        
        self.metrics.schemas_discovered = len(schemas_info)
        
        return {
            "databases": databases,
            "discovery_metrics": {
                "duration": self.metrics.duration,
                "strategy_used": strategy.value,
                "tables_discovered": self.metrics.tables_discovered,
                "schemas_discovered": self.metrics.schemas_discovered,
                "queries_executed": self.metrics.queries_executed,
                "cache_hit_rate": self.metrics.cache_hits / max(self.metrics.cache_hits + self.metrics.cache_misses, 1)
            }
        }
    
    async def _discover_schemas_optimized(self, inspector, config: ConnectionConfig) -> List[Dict[str, Any]]:
        """Optimized schema discovery with intelligent batching"""
        schemas = []
        
        # Get schema names
        schema_names = inspector.get_schema_names()
        
        for schema_name in schema_names:
            schema_info = {
                "name": schema_name,
                "tables": [],
                "views": [],
                "functions": [],
                "procedures": []
            }
            
            # Discover tables with adaptive batching
            tables = await self._discover_tables_adaptive(inspector, schema_name, config)
            schema_info["tables"] = tables
            self.metrics.tables_discovered += len(tables)
            
            # Discover views
            views = await self._discover_views_adaptive(inspector, schema_name, config)
            schema_info["views"] = views
            
            schemas.append(schema_info)
        
        return schemas
    
    async def _discover_tables_adaptive(self, inspector, schema_name: str, config: ConnectionConfig) -> List[Dict[str, Any]]:
        """Adaptive table discovery with intelligent batching"""
        try:
            table_names = inspector.get_table_names(schema=schema_name)
        except Exception as e:
            logger.warning(f"Failed to get table names for schema {schema_name}: {e}")
            return []
        
        tables = []
        
        # Process tables in adaptive batches
        for batch_start in range(0, len(table_names), config.batch_size):
            batch_end = min(batch_start + config.batch_size, len(table_names))
            batch_tables = table_names[batch_start:batch_end]
            
            # Get batch table info with single optimized query
            batch_info = await self._get_batch_table_info_enterprise(
                inspector, schema_name, batch_tables, config
            )
            
            tables.extend(batch_info)
            
            # Adaptive delay based on resource utilization
            resource_level = self.query_engine.resource_monitor.get_resource_level()
            if resource_level in [ResourceLevel.HIGH, ResourceLevel.CRITICAL]:
                await asyncio.sleep(config.delay_between_batches * 2)
            else:
                await asyncio.sleep(config.delay_between_batches)
        
        return tables
    
    async def _get_batch_table_info_enterprise(self, inspector, schema_name: str, 
                                            table_names: List[str], config: ConnectionConfig) -> List[Dict[str, Any]]:
        """Enterprise-grade batch table info retrieval with single optimized query"""
        if not table_names:
            return []
        
        # Use single connection for entire batch
        engine = self.query_engine._get_engine(self.query_engine.resource_monitor.get_optimal_strategy())
        
        try:
            with engine.connect() as conn:
                # Single optimized query for all table metadata
                table_list = "', '".join(table_names)
                
                metadata_query = text(f"""
                    SELECT 
                        c.relname as table_name,
                        c.reltuples::bigint as row_count,
                        pg_total_relation_size(c.oid) as size_bytes,
                        obj_description(c.oid, 'pg_class') as comment
                    FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE n.nspname = :schema_name 
                    AND c.relname IN ('{table_list}')
                    AND c.relkind = 'r'
                    ORDER BY c.relname
                """)
                
                metadata_result = conn.execute(metadata_query, {"schema_name": schema_name}).fetchall()
                metadata_dict = {row.table_name: {
                    "row_count": row.row_count,
                    "size_bytes": row.size_bytes,
                    "comment": row.comment
                } for row in metadata_result}
                
                self.metrics.queries_executed += 1
                
                # Get all column information in a single optimized query to prevent connection exhaustion
                try:
                    # Single query to get all column information for all tables
                    columns_query = text(f"""
                        SELECT 
                            c.relname as table_name,
                            a.attname as column_name,
                            pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
                            NOT a.attnotnull as nullable,
                            pg_get_expr(d.adbin, d.adrelid) as default_value,
                            a.attnum as column_position,
                            pg_catalog.col_description(a.attrelid, a.attnum) as comment,
                            CASE WHEN pk.attname IS NOT NULL THEN true ELSE false END as is_primary_key
                        FROM pg_class c
                        JOIN pg_namespace n ON n.oid = c.relnamespace
                        JOIN pg_attribute a ON a.attrelid = c.oid
                        LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
                        LEFT JOIN (
                            SELECT k.attname, k.attrelid
                            FROM pg_index i
                            JOIN pg_attribute k ON k.attrelid = i.indrelid AND k.attnum = ANY(i.indkey)
                            WHERE i.indisprimary
                        ) pk ON pk.attrelid = c.oid AND pk.attname = a.attname
                        WHERE n.nspname = :schema_name 
                        AND c.relname IN ('{table_list}')
                        AND c.relkind = 'r'
                        AND a.attnum > 0
                        AND NOT a.attisdropped
                        ORDER BY c.relname, a.attnum
                    """)
                    
                    columns_result = conn.execute(columns_query, {"schema_name": schema_name}).fetchall()
                    
                    # Group columns by table
                    columns_by_table = {}
                    for row in columns_result:
                        table_name = row.table_name
                        if table_name not in columns_by_table:
                            columns_by_table[table_name] = []
                        
                        columns_by_table[table_name].append({
                            "name": row.column_name,
                            "data_type": row.data_type,
                            "nullable": row.nullable,
                            "default": row.default_value or "",
                            "primary_key": row.is_primary_key,
                            "comment": row.comment or "",
                            "position": row.column_position
                        })
                    
                    self.metrics.queries_executed += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to get column information in batch: {e}")
                    columns_by_table = {}
                
                # Build table information with batched column data
                tables = []
                for table_name in table_names:
                    try:
                        # Get columns from our batch query
                        columns = columns_by_table.get(table_name, [])
                        
                        # Get metadata from our batch query
                        metadata = metadata_dict.get(table_name, {
                            "row_count": 0,
                            "size_bytes": 0,
                            "comment": None
                        })
                        
                        tables.append({
                            "name": table_name,
                            "columns": columns,
                            "indexes": [],  # Skip for performance
                            "foreign_keys": [],  # Skip for performance
                            "row_count": metadata["row_count"],
                            "size_bytes": metadata["size_bytes"],
                            "comment": metadata["comment"]
                        })
                        
                    except Exception as e:
                        logger.warning(f"Failed to get info for table {table_name}: {e}")
                        tables.append({
                            "name": table_name,
                            "columns": [],
                            "indexes": [],
                            "foreign_keys": [],
                            "row_count": 0,
                            "size_bytes": 0,
                            "error": str(e)
                        })
                
                return tables
                
        except Exception as e:
            logger.error(f"Batch table info query failed: {e}")
            self.metrics.connection_errors += 1
            return []
    
    async def _discover_views_adaptive(self, inspector, schema_name: str, config: ConnectionConfig) -> List[Dict[str, Any]]:
        """Adaptive view discovery"""
        try:
            view_names = inspector.get_view_names(schema=schema_name)
            views = []
            
            for view_name in view_names:
                try:
                    view_columns = []
                    for column in inspector.get_columns(view_name, schema=schema_name):
                        view_columns.append({
                            "name": column["name"],
                            "data_type": str(column["type"]),
                            "nullable": column.get("nullable", True)
                        })
                    
                    views.append({
                        "name": view_name,
                        "columns": view_columns
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to get view info for {view_name}: {e}")
                    views.append({
                        "name": view_name,
                        "columns": [],
                        "error": str(e)
                    })
            
            return views
            
        except Exception as e:
            logger.warning(f"Failed to discover views in schema {schema_name}: {e}")
            return []
    
    def get_discovery_metrics(self) -> Dict[str, Any]:
        """Get current discovery metrics"""
        return {
            "duration": self.metrics.duration,
            "tables_discovered": self.metrics.tables_discovered,
            "schemas_discovered": self.metrics.schemas_discovered,
            "queries_executed": self.metrics.queries_executed,
            "connection_errors": self.metrics.connection_errors,
            "retry_attempts": self.metrics.retry_attempts,
            "cache_hit_rate": self.metrics.cache_hits / max(self.metrics.cache_hits + self.metrics.cache_misses, 1),
            "queries_per_second": self.metrics.queries_per_second,
            "tables_per_second": self.metrics.tables_per_second,
            "current_strategy": self.query_engine.resource_monitor.get_optimal_strategy().value,
            "resource_level": self.query_engine.resource_monitor.get_resource_level().value
        }
    
    async def _cleanup_connections(self):
        """Cleanup database connections to prevent connection issues"""
        try:
            # Close all engines and dispose of connections
            for strategy, engine in self.query_engine._engines.items():
                try:
                    engine.dispose()
                    logger.debug(f"Disposed engine for strategy {strategy.value}")
                except Exception as e:
                    logger.warning(f"Error disposing engine for strategy {strategy.value}: {e}")
            
            # Clear engines
            self.query_engine._engines.clear()
            
            # Wait a moment for connections to close
            await asyncio.sleep(0.1)
            
            logger.debug("Connection cleanup completed")
        except Exception as e:
            logger.warning(f"Error during connection cleanup: {e}")
    
    def cleanup(self):
        """Cleanup resources"""
        for engine in self.query_engine._engines.values():
            engine.dispose()
        self.query_engine.cache.invalidate()
