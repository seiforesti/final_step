# ============================================================================
# ADVANCED CIRCUIT BREAKER MIDDLEWARE - DATABASE CONNECTION PROTECTION
# ============================================================================

import time
import logging
from typing import Dict, Any, Optional, Callable
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import asyncio
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

class CircuitBreaker:
    """
    Advanced circuit breaker pattern implementation for database connection protection.
    Prevents cascading failures by temporarily blocking requests when database is overwhelmed.
    """
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        expected_exception: type = Exception,
        monitor_interval: float = 10.0
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        self.monitor_interval = monitor_interval
        
        # Circuit state
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        
        # Performance tracking
        self.total_requests = 0
        self.failed_requests = 0
        self.successful_requests = 0
        self.circuit_open_time = 0.0
        
        logger.info(f"Circuit breaker initialized: threshold={failure_threshold}, timeout={recovery_timeout}s")
    
    def call(self, func: Callable, *args, **kwargs):
        """Execute function with circuit breaker protection."""
        if self.state == "OPEN":
            if time.time() - self.last_failure_time >= self.recovery_timeout:
                self.state = "HALF_OPEN"
                logger.info("Circuit breaker transitioning to HALF_OPEN state")
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise e
    
    async def call_async(self, func: Callable, *args, **kwargs):
        """Execute async function with circuit breaker protection."""
        if self.state == "OPEN":
            if time.time() - self.last_failure_time >= self.recovery_timeout:
                self.state = "HALF_OPEN"
                logger.info("Circuit breaker transitioning to HALF_OPEN state")
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise e
    
    def _on_success(self):
        """Handle successful request."""
        self.failure_count = 0
        self.state = "CLOSED"
        self.successful_requests += 1
        self.total_requests += 1
    
    def _on_failure(self):
        """Handle failed request."""
        self.failure_count += 1
        self.failed_requests += 1
        self.total_requests += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            self.circuit_open_time = time.time()
            logger.warning(f"Circuit breaker OPENED after {self.failure_count} failures")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current circuit breaker status."""
        return {
            "state": self.state,
            "failure_count": self.failure_count,
            "failure_threshold": self.failure_threshold,
            "last_failure_time": self.last_failure_time,
            "recovery_timeout": self.recovery_timeout,
            "total_requests": self.total_requests,
            "failed_requests": self.failed_requests,
            "successful_requests": self.successful_requests,
            "success_rate": (self.successful_requests / self.total_requests * 100) if self.total_requests > 0 else 0,
            "circuit_open_time": self.circuit_open_time,
            "time_since_last_failure": time.time() - self.last_failure_time if self.last_failure_time > 0 else 0
        }

class DatabaseCircuitBreakerMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware that implements circuit breaker pattern for database operations.
    Automatically detects database connection pool exhaustion and prevents cascading failures.
    """
    
    def __init__(
        self,
        app: ASGIApp,
        failure_threshold: int = 3,
        recovery_timeout: float = 30.0,
        monitor_interval: float = 10.0
    ):
        super().__init__(app)
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=failure_threshold,
            recovery_timeout=recovery_timeout,
            expected_exception=Exception,
            monitor_interval=monitor_interval
        )
        
        # Database-specific error patterns
        self.db_error_patterns = [
            "database_unavailable",
            "Connection pool is at capacity",
            "psycopg2.OperationalError",
            "sqlalchemy.exc.OperationalError",
            "connection pool exhausted",
            "too many connections"
        ]
        
        logger.info("Database Circuit Breaker Middleware initialized")
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with circuit breaker protection."""
        
        # Skip circuit breaker for health checks and static files
        if self._should_skip_circuit_breaker(request):
            return await call_next(request)
        
        # Check if circuit breaker is open
        if self.circuit_breaker.state == "OPEN":
            return self._handle_circuit_open_response(request)
        
        try:
            # Execute request with circuit breaker protection
            response = await self.circuit_breaker.call_async(call_next, request)
            return response
            
        except Exception as e:
            # Check if this is a database-related error
            if self._is_database_error(str(e)):
                logger.warning(f"Database error detected: {e}")
                return self._handle_database_error_response(request, e)
            else:
                # Non-database error, let it pass through
                raise e
    
    def _should_skip_circuit_breaker(self, request: Request) -> bool:
        """Determine if circuit breaker should be skipped for this request."""
        skip_paths = [
            "/health",
            "/ping",
            "/api/v1/health",
            "/docs",
            "/openapi.json",
            "/static",
            "/favicon.ico"
        ]
        
        return any(request.url.path.startswith(path) for path in skip_paths)
    
    def _is_database_error(self, error_message: str) -> bool:
        """Check if error message indicates a database connection issue."""
        error_lower = error_message.lower()
        return any(pattern.lower() in error_lower for pattern in self.db_error_patterns)
    
    def _handle_circuit_open_response(self, request: Request) -> Response:
        """Handle response when circuit breaker is open."""
        status = self.circuit_breaker.get_status()
        
        return JSONResponse(
            status_code=503,  # Service Unavailable
            content={
                "error": "Service temporarily unavailable",
                "message": "Database connection pool is exhausted. Please try again later.",
                "circuit_breaker_state": "OPEN",
                "retry_after": int(self.circuit_breaker.recovery_timeout),
                "timestamp": time.time(),
                "request_path": request.url.path
            },
            headers={
                "Retry-After": str(int(self.circuit_breaker.recovery_timeout)),
                "X-Circuit-Breaker-State": "OPEN"
            }
        )
    
    def _handle_database_error_response(self, request: Request, error: Exception) -> Response:
        """Handle database-specific error responses."""
        return JSONResponse(
            status_code=503,  # Service Unavailable
            content={
                "error": "Database connection error",
                "message": "Unable to connect to database. Please try again later.",
                "circuit_breaker_state": self.circuit_breaker.state,
                "timestamp": time.time(),
                "request_path": request.url.path,
                "error_type": type(error).__name__
            },
            headers={
                "X-Circuit-Breaker-State": self.circuit_breaker.state,
                "X-Database-Error": "true"
            }
        )

class ConnectionPoolMonitor:
    """
    Real-time connection pool monitoring and health tracking.
    Provides metrics for circuit breaker decision making.
    """
    
    def __init__(self, engine):
        self.engine = engine
        self.metrics = {
            "total_connections": 0,
            "active_connections": 0,
            "idle_connections": 0,
            "connection_errors": 0,
            "last_check": 0,
            "health_score": 100
        }
        
        logger.info("Connection Pool Monitor initialized")
    
    def get_pool_metrics(self) -> Dict[str, Any]:
        """Get current connection pool metrics."""
        try:
            if hasattr(self.engine, 'pool'):
                pool = self.engine.pool
                checked_out = pool.checkedout()
                pool_size = pool.size()
                overflow = pool.overflow()
                total_capacity = pool_size + overflow
                
                self.metrics.update({
                    "total_connections": total_capacity,
                    "active_connections": checked_out,
                    "idle_connections": total_capacity - checked_out,
                    "pool_size": pool_size,
                    "max_overflow": overflow,
                    "usage_percentage": (checked_out / total_capacity * 100) if total_capacity > 0 else 0,
                    "last_check": time.time()
                })
                
                # Calculate health score
                usage = self.metrics["usage_percentage"]
                if usage < 70:
                    self.metrics["health_score"] = 100
                elif usage < 85:
                    self.metrics["health_score"] = 75
                elif usage < 95:
                    self.metrics["health_score"] = 50
                else:
                    self.metrics["health_score"] = 25
                
        except Exception as e:
            logger.error(f"Error getting pool metrics: {e}")
            self.metrics["connection_errors"] += 1
        
        return self.metrics
    
    def is_healthy(self) -> bool:
        """Check if connection pool is healthy."""
        metrics = self.get_pool_metrics()
        return metrics["health_score"] >= 50

# Global instances
_database_circuit_breaker: Optional[CircuitBreaker] = None
_connection_pool_monitor: Optional[ConnectionPoolMonitor] = None

def get_database_circuit_breaker() -> CircuitBreaker:
    """Get global database circuit breaker instance."""
    global _database_circuit_breaker
    if _database_circuit_breaker is None:
        _database_circuit_breaker = CircuitBreaker(
            failure_threshold=3,
            recovery_timeout=30.0
        )
    return _database_circuit_breaker

def get_connection_pool_monitor(engine) -> ConnectionPoolMonitor:
    """Get global connection pool monitor instance."""
    global _connection_pool_monitor
    if _connection_pool_monitor is None:
        _connection_pool_monitor = ConnectionPoolMonitor(engine)
    return _connection_pool_monitor
