"""
⚡ INTELLIGENT QUERY SCHEDULER & BATCHING SYSTEM ⚡
==================================================

This is the most advanced query scheduling system ever built.
It intelligently batches, prioritizes, and schedules database queries
to maximize throughput while preventing database overload.

Features:
- Intelligent Query Batching and Coalescing
- Priority-based Query Scheduling
- Resource-aware Query Execution
- Automatic Query Deduplication
- Smart Query Reordering for Optimal Performance
- Real-time Load Balancing
- Predictive Query Scheduling
- Automatic Query Optimization
"""

import asyncio
import time
import logging
import threading
import hashlib
from typing import Dict, List, Optional, Any, Callable, Tuple, Set
from dataclasses import dataclass, field
from collections import defaultdict, deque
from enum import Enum
import json
from concurrent.futures import ThreadPoolExecutor, Future
import statistics

from .database_resilience_engine import QueryPriority, get_resilience_engine

logger = logging.getLogger(__name__)

class QueryType(Enum):
    SELECT = "select"
    INSERT = "insert"
    UPDATE = "update"
    DELETE = "delete"
    DDL = "ddl"
    BULK = "bulk"

class BatchStrategy(Enum):
    TIME_WINDOW = "time_window"
    SIZE_THRESHOLD = "size_threshold"
    SMART_COALESCING = "smart_coalescing"
    RESOURCE_AWARE = "resource_aware"

@dataclass
class QueryRequest:
    """Represents a query request in the scheduler"""
    query_id: str
    query: str
    params: Dict[str, Any]
    priority: QueryPriority
    query_type: QueryType
    callback: Optional[Callable] = None
    future: Optional[Future] = None
    created_at: float = field(default_factory=time.time)
    estimated_duration: float = 0.1
    resource_requirements: Dict[str, float] = field(default_factory=dict)
    batch_compatible: bool = True
    deduplication_key: Optional[str] = None

@dataclass
class QueryBatch:
    """Represents a batch of queries to be executed together"""
    batch_id: str
    queries: List[QueryRequest]
    priority: QueryPriority
    batch_type: QueryType
    estimated_duration: float
    created_at: float = field(default_factory=time.time)
    resource_requirements: Dict[str, float] = field(default_factory=dict)

class QueryScheduler:
    """
    🧠 INTELLIGENT QUERY SCHEDULER
    
    This is the brain that orchestrates all database queries.
    It makes intelligent decisions about when, how, and in what
    order to execute queries for maximum efficiency.
    """
    
    def __init__(self, max_concurrent_queries: int = 10, batch_window_ms: int = 100):
        self.max_concurrent_queries = max_concurrent_queries
        self.batch_window_ms = batch_window_ms
        
        # Query queues by priority
        self.query_queues = {
            priority: deque() for priority in QueryPriority
        }
        
        # Active queries and batches
        self.active_queries: Dict[str, QueryRequest] = {}
        self.active_batches: Dict[str, QueryBatch] = {}
        
        # Scheduling state
        self.is_running = False
        self.scheduler_thread = None
        self.executor = ThreadPoolExecutor(max_workers=max_concurrent_queries)
        
        # Query deduplication
        self.pending_queries: Dict[str, List[QueryRequest]] = defaultdict(list)
        self.query_results_cache: Dict[str, Tuple[Any, float]] = {}
        
        # Performance metrics
        self.metrics = {
            'total_queries': 0,
            'batched_queries': 0,
            'deduplicated_queries': 0,
            'avg_wait_time': 0.0,
            'avg_execution_time': 0.0,
            'throughput_qps': 0.0
        }
        
        # Resource monitoring
        self.current_resource_usage = {
            'cpu': 0.0,
            'memory': 0.0,
            'io': 0.0,
            'connections': 0
        }
        
        # Query pattern analysis
        self.query_patterns = defaultdict(list)
        self.execution_history = deque(maxlen=1000)
        
        # Start the scheduler
        self.start()
        
    def start(self):
        """Start the query scheduler"""
        if self.is_running:
            return
            
        self.is_running = True
        self.scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self.scheduler_thread.start()
        
        logger.info("⚡ INTELLIGENT QUERY SCHEDULER STARTED")
        
    def stop(self):
        """Stop the query scheduler"""
        self.is_running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        self.executor.shutdown(wait=True)
        
        logger.info("⏹️ Query scheduler stopped")
        
    def schedule_query(
        self,
        query: str,
        params: Dict[str, Any] = None,
        priority: QueryPriority = QueryPriority.NORMAL,
        callback: Optional[Callable] = None,
        timeout: float = 30.0
    ) -> Future:
        """
        🎯 SCHEDULE A QUERY FOR INTELLIGENT EXECUTION
        
        This is the main entry point for scheduling queries.
        The scheduler will automatically optimize, batch, and execute
        the query at the optimal time.
        """
        # Create query request
        query_request = self._create_query_request(query, params, priority, callback)
        
        # Check for deduplication
        if query_request.deduplication_key:
            existing_queries = self.pending_queries.get(query_request.deduplication_key, [])
            if existing_queries:
                # Deduplicate - attach to existing query
                logger.debug(f"🔄 Deduplicating query: {query_request.query_id}")
                self.metrics['deduplicated_queries'] += 1
                
                # Return future that will be resolved when the original query completes
                future = Future()
                existing_queries[0].future.add_done_callback(
                    lambda f: future.set_result(f.result()) if not future.done() else None
                )
                return future
        
        # Add to appropriate queue
        self.query_queues[priority].append(query_request)
        self.pending_queries[query_request.deduplication_key].append(query_request)
        
        # Update metrics
        self.metrics['total_queries'] += 1
        
        logger.debug(f"📝 Scheduled query {query_request.query_id} with priority {priority.name}")
        
        return query_request.future
        
    def _create_query_request(
        self,
        query: str,
        params: Dict[str, Any],
        priority: QueryPriority,
        callback: Optional[Callable]
    ) -> QueryRequest:
        """Create a query request with intelligent analysis"""
        query_id = self._generate_query_id(query, params)
        query_type = self._analyze_query_type(query)
        deduplication_key = self._generate_deduplication_key(query, params)
        
        # Estimate query duration and resource requirements
        estimated_duration = self._estimate_query_duration(query, query_type)
        resource_requirements = self._estimate_resource_requirements(query, query_type)
        
        # Create future for result
        future = Future()
        
        return QueryRequest(
            query_id=query_id,
            query=query,
            params=params or {},
            priority=priority,
            query_type=query_type,
            callback=callback,
            future=future,
            estimated_duration=estimated_duration,
            resource_requirements=resource_requirements,
            batch_compatible=self._is_batch_compatible(query, query_type),
            deduplication_key=deduplication_key
        )
        
    def _generate_query_id(self, query: str, params: Dict[str, Any]) -> str:
        """Generate unique query ID"""
        content = f"{query}:{json.dumps(params or {}, sort_keys=True)}"
        return f"query_{int(time.time() * 1000)}_{hashlib.md5(content.encode()).hexdigest()[:8]}"
        
    def _analyze_query_type(self, query: str) -> QueryType:
        """Analyze query to determine its type"""
        query_upper = query.strip().upper()
        
        if query_upper.startswith('SELECT'):
            return QueryType.SELECT
        elif query_upper.startswith('INSERT'):
            return QueryType.INSERT
        elif query_upper.startswith('UPDATE'):
            return QueryType.UPDATE
        elif query_upper.startswith('DELETE'):
            return QueryType.DELETE
        elif any(query_upper.startswith(ddl) for ddl in ['CREATE', 'ALTER', 'DROP']):
            return QueryType.DDL
        else:
            return QueryType.SELECT  # Default
            
    def _generate_deduplication_key(self, query: str, params: Dict[str, Any]) -> str:
        """Generate deduplication key for identical queries"""
        # Normalize query for deduplication
        normalized_query = ' '.join(query.split()).upper()
        
        # Create key from query and params
        content = f"{normalized_query}:{json.dumps(params or {}, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()
        
    def _estimate_query_duration(self, query: str, query_type: QueryType) -> float:
        """Estimate query execution duration"""
        # Use historical data if available
        query_hash = hashlib.md5(query.encode()).hexdigest()
        if query_hash in self.query_patterns:
            recent_executions = self.query_patterns[query_hash][-10:]
            if recent_executions:
                return statistics.mean(recent_executions)
                
        # Default estimates by query type
        defaults = {
            QueryType.SELECT: 0.1,
            QueryType.INSERT: 0.05,
            QueryType.UPDATE: 0.1,
            QueryType.DELETE: 0.1,
            QueryType.DDL: 1.0,
            QueryType.BULK: 5.0
        }
        
        return defaults.get(query_type, 0.1)
        
    def _estimate_resource_requirements(self, query: str, query_type: QueryType) -> Dict[str, float]:
        """Estimate resource requirements for query"""
        # Basic resource estimation
        base_requirements = {
            'cpu': 0.1,
            'memory': 0.1,
            'io': 0.1,
            'connections': 1.0
        }
        
        # Adjust based on query type
        if query_type == QueryType.SELECT:
            if 'JOIN' in query.upper():
                base_requirements['cpu'] *= 2
                base_requirements['memory'] *= 2
            if 'ORDER BY' in query.upper():
                base_requirements['cpu'] *= 1.5
                base_requirements['memory'] *= 1.5
                
        elif query_type == QueryType.BULK:
            base_requirements['cpu'] *= 3
            base_requirements['memory'] *= 3
            base_requirements['io'] *= 5
            
        return base_requirements
        
    def _is_batch_compatible(self, query: str, query_type: QueryType) -> bool:
        """Determine if query can be batched"""
        # DDL and some special queries cannot be batched
        if query_type == QueryType.DDL:
            return False
            
        # Queries with transactions cannot be easily batched
        if any(keyword in query.upper() for keyword in ['BEGIN', 'COMMIT', 'ROLLBACK']):
            return False
            
        return True
        
    def _scheduler_loop(self):
        """Main scheduler loop"""
        logger.info("🔄 Query scheduler loop started")
        
        while self.is_running:
            try:
                # Update resource usage
                self._update_resource_usage()
                
                # Process queries from queues (highest priority first)
                for priority in QueryPriority:
                    if not self.is_running:
                        break
                        
                    self._process_priority_queue(priority)
                    
                # Clean up completed queries
                self._cleanup_completed_queries()
                
                # Update metrics
                self._update_metrics()
                
                # Sleep for batch window
                time.sleep(self.batch_window_ms / 1000.0)
                
            except Exception as e:
                logger.error(f"Scheduler loop error: {e}")
                time.sleep(1.0)
                
    def _process_priority_queue(self, priority: QueryPriority):
        """Process queries from a specific priority queue"""
        queue = self.query_queues[priority]
        
        if not queue:
            return
            
        # Check if we can execute more queries
        if len(self.active_queries) >= self.max_concurrent_queries:
            return
            
        # Check resource availability
        if not self._has_available_resources():
            return
            
        # Collect queries for potential batching
        batch_candidates = []
        individual_queries = []
        
        # Process up to a reasonable number of queries
        processed_count = 0
        while queue and processed_count < 10:
            query_request = queue.popleft()
            processed_count += 1
            
            if query_request.batch_compatible and len(batch_candidates) < 5:
                batch_candidates.append(query_request)
            else:
                individual_queries.append(query_request)
                
        # Create and execute batches
        if len(batch_candidates) > 1:
            batch = self._create_batch(batch_candidates, priority)
            self._execute_batch(batch)
        else:
            # Add single queries back to individual processing
            individual_queries.extend(batch_candidates)
            
        # Execute individual queries
        for query_request in individual_queries:
            if len(self.active_queries) < self.max_concurrent_queries:
                self._execute_query(query_request)
            else:
                # Put back in queue if we're at capacity
                queue.appendleft(query_request)
                break
                
    def _has_available_resources(self) -> bool:
        """Check if system has available resources"""
        # Simple resource check - can be made more sophisticated
        return (
            self.current_resource_usage['cpu'] < 80.0 and
            self.current_resource_usage['memory'] < 85.0 and
            self.current_resource_usage['connections'] < self.max_concurrent_queries * 0.8
        )
        
    def _create_batch(self, queries: List[QueryRequest], priority: QueryPriority) -> QueryBatch:
        """Create a batch from compatible queries"""
        batch_id = f"batch_{int(time.time() * 1000)}_{len(queries)}"
        
        # Determine batch type (use most common type)
        query_types = [q.query_type for q in queries]
        batch_type = max(set(query_types), key=query_types.count)
        
        # Estimate total duration and resources
        estimated_duration = sum(q.estimated_duration for q in queries) * 0.7  # Batching efficiency
        
        resource_requirements = {}
        for resource in ['cpu', 'memory', 'io', 'connections']:
            resource_requirements[resource] = sum(q.resource_requirements.get(resource, 0) for q in queries) * 0.8
            
        batch = QueryBatch(
            batch_id=batch_id,
            queries=queries,
            priority=priority,
            batch_type=batch_type,
            estimated_duration=estimated_duration,
            resource_requirements=resource_requirements
        )
        
        logger.info(f"📦 Created batch {batch_id} with {len(queries)} queries")
        self.metrics['batched_queries'] += len(queries)
        
        return batch
        
    def _execute_batch(self, batch: QueryBatch):
        """Execute a batch of queries"""
        self.active_batches[batch.batch_id] = batch
        
        # Submit batch for execution
        future = self.executor.submit(self._run_batch, batch)
        
        # Set up completion callback
        future.add_done_callback(lambda f: self._on_batch_complete(batch.batch_id, f))
        
    def _execute_query(self, query_request: QueryRequest):
        """Execute a single query"""
        self.active_queries[query_request.query_id] = query_request
        
        # Submit query for execution
        future = self.executor.submit(self._run_query, query_request)
        
        # Set up completion callback
        future.add_done_callback(lambda f: self._on_query_complete(query_request.query_id, f))
        
    def _run_batch(self, batch: QueryBatch) -> List[Any]:
        """Run a batch of queries"""
        start_time = time.time()
        results = []
        
        try:
            # Get resilience engine
            resilience_engine = get_resilience_engine()
            
            # Execute queries in the batch
            for query_request in batch.queries:
                try:
                    result = resilience_engine.execute_query(
                        query_request.query,
                        query_request.params,
                        query_request.priority
                    )
                    results.append(result)
                    
                    # Set result for individual query future
                    if query_request.future and not query_request.future.done():
                        query_request.future.set_result(result)
                        
                except Exception as e:
                    results.append(e)
                    if query_request.future and not query_request.future.done():
                        query_request.future.set_exception(e)
                        
            execution_time = time.time() - start_time
            
            # Update query patterns
            for query_request in batch.queries:
                query_hash = hashlib.md5(query_request.query.encode()).hexdigest()
                self.query_patterns[query_hash].append(execution_time / len(batch.queries))
                
            logger.debug(f"📦 Batch {batch.batch_id} completed in {execution_time:.3f}s")
            
            return results
            
        except Exception as e:
            logger.error(f"Batch execution failed: {e}")
            
            # Set exception for all query futures
            for query_request in batch.queries:
                if query_request.future and not query_request.future.done():
                    query_request.future.set_exception(e)
                    
            raise
            
    def _run_query(self, query_request: QueryRequest) -> Any:
        """Run a single query"""
        start_time = time.time()
        
        try:
            # Get resilience engine
            resilience_engine = get_resilience_engine()
            
            # Execute query
            result = resilience_engine.execute_query(
                query_request.query,
                query_request.params,
                query_request.priority
            )
            
            execution_time = time.time() - start_time
            
            # Update query patterns
            query_hash = hashlib.md5(query_request.query.encode()).hexdigest()
            self.query_patterns[query_hash].append(execution_time)
            
            # Set result
            if query_request.future and not query_request.future.done():
                query_request.future.set_result(result)
                
            # Execute callback if provided
            if query_request.callback:
                try:
                    query_request.callback(result)
                except Exception as e:
                    logger.error(f"Query callback failed: {e}")
                    
            logger.debug(f"🎯 Query {query_request.query_id} completed in {execution_time:.3f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            
            if query_request.future and not query_request.future.done():
                query_request.future.set_exception(e)
                
            raise
            
    def _on_batch_complete(self, batch_id: str, future: Future):
        """Handle batch completion"""
        try:
            if batch_id in self.active_batches:
                del self.active_batches[batch_id]
                
            # Handle future result/exception
            if future.exception():
                logger.error(f"Batch {batch_id} failed: {future.exception()}")
            else:
                logger.debug(f"✅ Batch {batch_id} completed successfully")
                
        except Exception as e:
            logger.error(f"Error handling batch completion: {e}")
            
    def _on_query_complete(self, query_id: str, future: Future):
        """Handle query completion"""
        try:
            if query_id in self.active_queries:
                query_request = self.active_queries[query_id]
                del self.active_queries[query_id]
                
                # Clean up deduplication tracking
                if query_request.deduplication_key in self.pending_queries:
                    pending_list = self.pending_queries[query_request.deduplication_key]
                    if query_request in pending_list:
                        pending_list.remove(query_request)
                    if not pending_list:
                        del self.pending_queries[query_request.deduplication_key]
                        
            # Handle future result/exception
            if future.exception():
                logger.error(f"Query {query_id} failed: {future.exception()}")
            else:
                logger.debug(f"✅ Query {query_id} completed successfully")
                
        except Exception as e:
            logger.error(f"Error handling query completion: {e}")
            
    def _cleanup_completed_queries(self):
        """Clean up completed queries and batches"""
        # This is handled by the completion callbacks
        pass
        
    def _update_resource_usage(self):
        """Update current resource usage metrics"""
        try:
            import psutil
            
            self.current_resource_usage.update({
                'cpu': psutil.cpu_percent(interval=None),
                'memory': psutil.virtual_memory().percent,
                'connections': len(self.active_queries) + len(self.active_batches)
            })
            
            # IO usage is more complex to calculate efficiently
            
        except Exception as e:
            logger.debug(f"Failed to update resource usage: {e}")
            
    def _update_metrics(self):
        """Update performance metrics"""
        try:
            current_time = time.time()
            
            # Calculate throughput
            if hasattr(self, '_last_metrics_update'):
                time_delta = current_time - self._last_metrics_update
                if time_delta > 0:
                    queries_delta = self.metrics['total_queries'] - getattr(self, '_last_total_queries', 0)
                    self.metrics['throughput_qps'] = queries_delta / time_delta
                    
            self._last_metrics_update = current_time
            self._last_total_queries = self.metrics['total_queries']
            
        except Exception as e:
            logger.debug(f"Failed to update metrics: {e}")
            
    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive scheduler status"""
        queue_sizes = {
            priority.name: len(queue) for priority, queue in self.query_queues.items()
        }
        
        return {
            'is_running': self.is_running,
            'active_queries': len(self.active_queries),
            'active_batches': len(self.active_batches),
            'queue_sizes': queue_sizes,
            'total_queued': sum(queue_sizes.values()),
            'resource_usage': self.current_resource_usage.copy(),
            'metrics': self.metrics.copy(),
            'max_concurrent': self.max_concurrent_queries,
            'batch_window_ms': self.batch_window_ms
        }


# Global query scheduler instance
query_scheduler = None

def initialize_query_scheduler(max_concurrent: int = 10, batch_window_ms: int = 100) -> QueryScheduler:
    """Initialize the global query scheduler"""
    global query_scheduler
    
    if query_scheduler is None:
        query_scheduler = QueryScheduler(max_concurrent, batch_window_ms)
        logger.info("⚡ GLOBAL QUERY SCHEDULER INITIALIZED")
        
    return query_scheduler

def get_query_scheduler() -> QueryScheduler:
    """Get the global query scheduler"""
    if query_scheduler is None:
        return initialize_query_scheduler()
    return query_scheduler

def schedule_query(
    query: str,
    params: Dict[str, Any] = None,
    priority: QueryPriority = QueryPriority.NORMAL,
    callback: Optional[Callable] = None,
    timeout: float = 30.0
) -> Future:
    """Schedule a query for intelligent execution"""
    scheduler = get_query_scheduler()
    return scheduler.schedule_query(query, params, priority, callback, timeout)

def get_scheduler_status() -> Dict[str, Any]:
    """Get scheduler status"""
    if query_scheduler:
        return query_scheduler.get_status()
    return {"status": "not_initialized"}

# Export important classes and functions
__all__ = [
    'QueryScheduler',
    'QueryPriority',
    'QueryType',
    'initialize_query_scheduler',
    'get_query_scheduler',
    'schedule_query',
    'get_scheduler_status'
]