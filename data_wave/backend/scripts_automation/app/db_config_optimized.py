"""
OPTIMIZED DATABASE CONFIGURATION
================================

This module provides optimized database connection pool settings
specifically designed to handle high-frequency API requests without
overwhelming the database.

Key optimizations:
- Conservative pool sizing to prevent exhaustion
- Intelligent connection recycling
- Circuit breaker integration
- Health monitoring and auto-recovery
- Request rate limiting at the database level
"""

import os
import logging
from typing import Dict, Any, Optional
import time
import threading
from contextlib import contextmanager

logger = logging.getLogger(__name__)

def get_env_int(key: str, default: int) -> int:
    """Get integer environment variable with validation."""
    try:
        value = int(os.getenv(key, str(default)))
        return max(1, value)  # Ensure minimum value of 1
    except ValueError:
        logger.warning(f"Invalid {key} value, using default: {default}")
        return default

def get_env_float(key: str, default: float) -> float:
    """Get float environment variable with validation."""
    try:
        value = float(os.getenv(key, str(default)))
        return max(0.1, value)  # Ensure minimum value
    except ValueError:
        logger.warning(f"Invalid {key} value, using default: {default}")
        return default

def get_env_bool(key: str, default: bool) -> bool:
    """Get boolean environment variable."""
    return os.getenv(key, str(default)).lower() in ('true', '1', 'yes', 'on')

# ============================================================================
# OPTIMIZED DATABASE CONFIGURATION
# ============================================================================

# Core connection pool settings - optimized for high-frequency requests
OPTIMIZED_DB_CONFIG = {
    # Connection Pool Settings
    "pool_size": get_env_int("DB_POOL_SIZE", 8),  # Increased from 6 to handle more concurrent requests
    "max_overflow": get_env_int("DB_MAX_OVERFLOW", 12),  # Increased overflow capacity
    "pool_timeout": get_env_float("DB_POOL_TIMEOUT", 5.0),  # Increased timeout for better reliability
    "pool_recycle": get_env_int("DB_POOL_RECYCLE", 1800),  # 30 minutes
    "pool_pre_ping": get_env_bool("DB_POOL_PRE_PING", True),
    "pool_reset_on_return": os.getenv("DB_POOL_RESET_ON_RETURN", "commit"),
    "echo_pool": get_env_bool("DB_ECHO_POOL", False),
    "pool_use_lifo": get_env_bool("DB_POOL_USE_LIFO", True),
    
    # Advanced Pool Management
    "pool_checkout_timeout": get_env_float("DB_CHECKOUT_TIMEOUT", 10.0),
    "pool_heartbeat_interval": get_env_int("DB_HEARTBEAT_INTERVAL", 30),
    "pool_max_age": get_env_int("DB_POOL_MAX_AGE", 3600),  # 1 hour
    
    # Concurrency Control
    "max_concurrent_requests": get_env_int("DB_MAX_CONCURRENT", 16),  # Increased for better throughput
    "semaphore_timeout": get_env_float("DB_SEMAPHORE_TIMEOUT", 0.1),
    "request_queue_size": get_env_int("DB_REQUEST_QUEUE_SIZE", 100),
    
    # Circuit Breaker Settings
    "failure_threshold": get_env_int("DB_FAILURE_THRESHOLD", 5),
    "failure_window_seconds": get_env_int("DB_FAILURE_WINDOW", 30),
    "circuit_open_seconds": get_env_int("DB_CIRCUIT_OPEN_SECONDS", 15),
    "circuit_half_open_max_calls": get_env_int("DB_CIRCUIT_HALF_OPEN_CALLS", 3),
    
    # Health Monitoring
    "health_check_interval": get_env_int("DB_HEALTH_CHECK_INTERVAL", 60),
    "health_check_timeout": get_env_float("DB_HEALTH_CHECK_TIMEOUT", 5.0),
    "auto_recovery_enabled": get_env_bool("DB_AUTO_RECOVERY", True),
    
    # Cleanup and Maintenance
    "auto_force_cleanup": get_env_bool("AUTO_FORCE_DB_CLEANUP", True),
    "cleanup_util_threshold": get_env_float("CLEANUP_UTIL_THRESHOLD", 75.0),  # Reduced threshold
    "cleanup_min_interval_sec": get_env_int("CLEANUP_MIN_INTERVAL_SEC", 30),  # More frequent cleanup
    "maintenance_interval": get_env_int("DB_MAINTENANCE_INTERVAL", 300),  # 5 minutes
    
    # Request Rate Limiting
    "rate_limit_enabled": get_env_bool("DB_RATE_LIMIT_ENABLED", True),
    "rate_limit_requests_per_second": get_env_int("DB_RATE_LIMIT_RPS", 50),
    "rate_limit_burst_size": get_env_int("DB_RATE_LIMIT_BURST", 100),
    "rate_limit_window_seconds": get_env_int("DB_RATE_LIMIT_WINDOW", 60),
    
    # Performance Optimization
    "enable_query_cache": get_env_bool("DB_ENABLE_QUERY_CACHE", True),
    "query_cache_size": get_env_int("DB_QUERY_CACHE_SIZE", 1000),
    "query_cache_ttl": get_env_int("DB_QUERY_CACHE_TTL", 300),  # 5 minutes
    "enable_prepared_statements": get_env_bool("DB_ENABLE_PREPARED_STATEMENTS", True),
    
    # Connection Quality Settings
    "connection_validation_query": os.getenv("DB_VALIDATION_QUERY", "SELECT 1"),
    "validate_on_borrow": get_env_bool("DB_VALIDATE_ON_BORROW", True),
    "validate_on_return": get_env_bool("DB_VALIDATE_ON_RETURN", False),
    "test_on_connect": get_env_bool("DB_TEST_ON_CONNECT", True),
    
    # Logging and Monitoring
    "log_slow_queries": get_env_bool("DB_LOG_SLOW_QUERIES", True),
    "slow_query_threshold": get_env_float("DB_SLOW_QUERY_THRESHOLD", 2.0),
    "enable_metrics": get_env_bool("DB_ENABLE_METRICS", True),
    "metrics_interval": get_env_int("DB_METRICS_INTERVAL", 60),
}

# ============================================================================
# ADVANCED RATE LIMITER
# ============================================================================

class DatabaseRateLimiter:
    """Advanced rate limiter for database requests."""
    
    def __init__(self, config: Dict[str, Any]):
        self.enabled = config.get("rate_limit_enabled", True)
        self.requests_per_second = config.get("rate_limit_requests_per_second", 50)
        self.burst_size = config.get("rate_limit_burst_size", 100)
        self.window_seconds = config.get("rate_limit_window_seconds", 60)
        
        self.request_times = []
        self.lock = threading.Lock()
        
    def can_proceed(self) -> bool:
        """Check if request can proceed based on rate limits."""
        if not self.enabled:
            return True
            
        now = time.time()
        
        with self.lock:
            # Remove old requests outside the window
            self.request_times = [t for t in self.request_times if now - t < self.window_seconds]
            
            # Check burst limit
            if len(self.request_times) >= self.burst_size:
                return False
                
            # Check rate limit
            recent_requests = [t for t in self.request_times if now - t < 1.0]  # Last second
            if len(recent_requests) >= self.requests_per_second:
                return False
                
            # Record this request
            self.request_times.append(now)
            return True
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current rate limiter statistics."""
        now = time.time()
        with self.lock:
            recent_requests = [t for t in self.request_times if now - t < self.window_seconds]
            return {
                "enabled": self.enabled,
                "requests_in_window": len(recent_requests),
                "requests_per_second_limit": self.requests_per_second,
                "burst_limit": self.burst_size,
                "window_seconds": self.window_seconds,
            }

# ============================================================================
# CONNECTION POOL HEALTH MONITOR
# ============================================================================

class ConnectionPoolHealthMonitor:
    """Advanced health monitoring for connection pools."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.last_health_check = 0
        self.health_status = "unknown"
        self.consecutive_failures = 0
        self.lock = threading.Lock()
        
    def check_pool_health(self, engine) -> Dict[str, Any]:
        """Perform comprehensive pool health check."""
        now = time.time()
        
        # Skip if checked recently
        if now - self.last_health_check < self.config.get("health_check_interval", 60):
            return {"status": self.health_status, "last_check": self.last_health_check}
        
        try:
            with self.lock:
                self.last_health_check = now
                
                # Get pool statistics
                pool = engine.pool
                pool_size = pool.size()
                checked_out = pool.checkedout()
                checked_in = pool.checkedin()
                overflow = pool.overflow()
                
                # Calculate utilization
                total_connections = pool_size + overflow
                utilization = (checked_out / total_connections * 100) if total_connections > 0 else 0
                
                # Determine health status
                if utilization > 90:
                    status = "critical"
                elif utilization > 75:
                    status = "warning"
                elif utilization > 50:
                    status = "healthy"
                else:
                    status = "optimal"
                
                self.health_status = status
                self.consecutive_failures = 0
                
                return {
                    "status": status,
                    "pool_size": pool_size,
                    "checked_out": checked_out,
                    "checked_in": checked_in,
                    "overflow": overflow,
                    "utilization_percent": round(utilization, 2),
                    "last_check": now,
                    "consecutive_failures": self.consecutive_failures,
                }
                
        except Exception as e:
            with self.lock:
                self.consecutive_failures += 1
                self.health_status = "error"
                
            logger.error(f"Pool health check failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "consecutive_failures": self.consecutive_failures,
                "last_check": now,
            }
    
    def should_trigger_maintenance(self, health_data: Dict[str, Any]) -> bool:
        """Determine if pool maintenance should be triggered."""
        if health_data["status"] == "error" and self.consecutive_failures >= 3:
            return True
        if health_data.get("utilization_percent", 0) > 85:
            return True
        return False

# ============================================================================
# CONFIGURATION VALIDATOR
# ============================================================================

def validate_optimized_config() -> tuple[bool, list[str]]:
    """Validate the optimized database configuration."""
    issues = []
    
    # Check pool sizing
    pool_size = OPTIMIZED_DB_CONFIG["pool_size"]
    max_overflow = OPTIMIZED_DB_CONFIG["max_overflow"]
    total_connections = pool_size + max_overflow
    
    if pool_size < 4:
        issues.append(f"Pool size ({pool_size}) may be too small for high-frequency requests")
    
    if pool_size > 20:
        issues.append(f"Pool size ({pool_size}) may be too large and waste resources")
    
    if max_overflow > pool_size * 2:
        issues.append(f"Max overflow ({max_overflow}) is too high relative to pool size")
    
    if total_connections > 50:
        issues.append(f"Total connections ({total_connections}) may overwhelm the database")
    
    # Check timeouts
    pool_timeout = OPTIMIZED_DB_CONFIG["pool_timeout"]
    if pool_timeout < 2.0:
        issues.append(f"Pool timeout ({pool_timeout}s) may be too short")
    
    if pool_timeout > 30.0:
        issues.append(f"Pool timeout ({pool_timeout}s) may be too long")
    
    # Check concurrency settings
    max_concurrent = OPTIMIZED_DB_CONFIG["max_concurrent_requests"]
    if max_concurrent > total_connections:
        issues.append(f"Max concurrent requests ({max_concurrent}) exceeds total connections")
    
    # Check rate limiting
    if OPTIMIZED_DB_CONFIG["rate_limit_enabled"]:
        rps = OPTIMIZED_DB_CONFIG["rate_limit_requests_per_second"]
        if rps > 100:
            issues.append(f"Rate limit ({rps} RPS) may be too high")
    
    is_valid = len(issues) == 0
    
    if is_valid:
        logger.info("✅ Optimized database configuration validated successfully")
    else:
        logger.warning(f"⚠️ Configuration issues found: {len(issues)}")
        for issue in issues:
            logger.warning(f"  - {issue}")
    
    return is_valid, issues

# ============================================================================
# CONFIGURATION EXPORT
# ============================================================================

# Create global instances
rate_limiter = DatabaseRateLimiter(OPTIMIZED_DB_CONFIG)
health_monitor = ConnectionPoolHealthMonitor(OPTIMIZED_DB_CONFIG)

# Validate configuration on import
config_valid, config_issues = validate_optimized_config()

# Export the optimized configuration
DB_CONFIG = OPTIMIZED_DB_CONFIG

# Export utilities
__all__ = [
    "DB_CONFIG",
    "OPTIMIZED_DB_CONFIG", 
    "DatabaseRateLimiter",
    "ConnectionPoolHealthMonitor",
    "rate_limiter",
    "health_monitor",
    "validate_optimized_config",
    "config_valid",
    "config_issues",
]

# Log configuration summary
logger.info(f"Database configuration loaded:")
logger.info(f"  Pool size: {DB_CONFIG['pool_size']}")
logger.info(f"  Max overflow: {DB_CONFIG['max_overflow']}")
logger.info(f"  Total connections: {DB_CONFIG['pool_size'] + DB_CONFIG['max_overflow']}")
logger.info(f"  Max concurrent requests: {DB_CONFIG['max_concurrent_requests']}")
logger.info(f"  Rate limiting: {'enabled' if DB_CONFIG['rate_limit_enabled'] else 'disabled'}")
logger.info(f"  Configuration valid: {config_valid}")