"""
⚙️ ADVANCED DATABASE SYSTEM CONFIGURATION ⚙️
==============================================

This configuration file contains all settings for the Advanced Database
Management System. Adjust these settings based on your environment and
performance requirements.

Configuration Categories:
- Connection Pool Settings
- Circuit Breaker Configuration
- Query Scheduler Settings
- Monitoring and Alerting
- Performance Targets
- Emergency Protocols
"""

import os
from typing import Dict, Any

class AdvancedDatabaseConfig:
    """
    🎛️ ADVANCED DATABASE CONFIGURATION
    
    Centralized configuration for all advanced database features.
    Environment variables take precedence over default values.
    """
    
    # =================================================================
    # CONNECTION POOL CONFIGURATION
    # =================================================================
    
    # Basic pool settings
    INITIAL_POOL_SIZE = int(os.getenv("ADVANCED_DB_INITIAL_POOL_SIZE", "10"))
    MAX_POOL_SIZE = int(os.getenv("ADVANCED_DB_MAX_POOL_SIZE", "100"))
    POOL_TIMEOUT = int(os.getenv("ADVANCED_DB_POOL_TIMEOUT", "30"))
    POOL_RECYCLE_TIME = int(os.getenv("ADVANCED_DB_POOL_RECYCLE", "3600"))
    
    # Auto-scaling settings
    ENABLE_AUTO_SCALING = os.getenv("ADVANCED_DB_AUTO_SCALING", "true").lower() == "true"
    SCALE_UP_THRESHOLD = float(os.getenv("ADVANCED_DB_SCALE_UP_THRESHOLD", "80.0"))
    SCALE_DOWN_THRESHOLD = float(os.getenv("ADVANCED_DB_SCALE_DOWN_THRESHOLD", "30.0"))
    MAX_ENGINES = int(os.getenv("ADVANCED_DB_MAX_ENGINES", "5"))
    
    # Connection optimization
    CONNECTION_KEEPALIVE = int(os.getenv("ADVANCED_DB_KEEPALIVE", "30"))
    CONNECTION_TIMEOUT = int(os.getenv("ADVANCED_DB_CONNECT_TIMEOUT", "10"))
    STATEMENT_TIMEOUT = int(os.getenv("ADVANCED_DB_STATEMENT_TIMEOUT", "30000"))
    
    # =================================================================
    # CIRCUIT BREAKER CONFIGURATION
    # =================================================================
    
    # Basic circuit breaker settings
    CIRCUIT_BREAKER_ENABLED = os.getenv("ADVANCED_DB_CIRCUIT_BREAKER", "true").lower() == "true"
    FAILURE_THRESHOLD = int(os.getenv("ADVANCED_DB_FAILURE_THRESHOLD", "5"))
    RECOVERY_TIMEOUT = int(os.getenv("ADVANCED_DB_RECOVERY_TIMEOUT", "60"))
    
    # Adaptive thresholds
    ENABLE_ADAPTIVE_THRESHOLDS = os.getenv("ADVANCED_DB_ADAPTIVE_THRESHOLDS", "true").lower() == "true"
    MIN_FAILURE_THRESHOLD = int(os.getenv("ADVANCED_DB_MIN_FAILURE_THRESHOLD", "2"))
    MAX_FAILURE_THRESHOLD = int(os.getenv("ADVANCED_DB_MAX_FAILURE_THRESHOLD", "10"))
    
    # =================================================================
    # QUERY SCHEDULER CONFIGURATION
    # =================================================================
    
    # Scheduler settings
    QUERY_SCHEDULER_ENABLED = os.getenv("ADVANCED_DB_QUERY_SCHEDULER", "true").lower() == "true"
    MAX_CONCURRENT_QUERIES = int(os.getenv("ADVANCED_DB_MAX_CONCURRENT_QUERIES", "50"))
    BATCH_WINDOW_MS = int(os.getenv("ADVANCED_DB_BATCH_WINDOW_MS", "100"))
    
    # Query optimization
    ENABLE_QUERY_OPTIMIZATION = os.getenv("ADVANCED_DB_QUERY_OPTIMIZATION", "true").lower() == "true"
    ENABLE_QUERY_CACHING = os.getenv("ADVANCED_DB_QUERY_CACHING", "true").lower() == "true"
    CACHE_TTL_SECONDS = int(os.getenv("ADVANCED_DB_CACHE_TTL", "300"))
    
    # Query batching
    ENABLE_QUERY_BATCHING = os.getenv("ADVANCED_DB_QUERY_BATCHING", "true").lower() == "true"
    MAX_BATCH_SIZE = int(os.getenv("ADVANCED_DB_MAX_BATCH_SIZE", "10"))
    
    # =================================================================
    # MONITORING CONFIGURATION
    # =================================================================
    
    # Basic monitoring
    MONITORING_ENABLED = os.getenv("ADVANCED_DB_MONITORING", "true").lower() == "true"
    MONITORING_INTERVAL = int(os.getenv("ADVANCED_DB_MONITORING_INTERVAL", "10"))
    METRICS_RETENTION = int(os.getenv("ADVANCED_DB_METRICS_RETENTION", "3600"))
    
    # Health scoring
    ENABLE_HEALTH_SCORING = os.getenv("ADVANCED_DB_HEALTH_SCORING", "true").lower() == "true"
    HEALTH_CHECK_INTERVAL = int(os.getenv("ADVANCED_DB_HEALTH_CHECK_INTERVAL", "15"))
    
    # Alerting
    ALERTING_ENABLED = os.getenv("ADVANCED_DB_ALERTING", "true").lower() == "true"
    ALERT_CHECK_INTERVAL = int(os.getenv("ADVANCED_DB_ALERT_CHECK_INTERVAL", "5"))
    
    # =================================================================
    # PERFORMANCE TARGETS
    # =================================================================
    
    # Response time targets
    MAX_RESPONSE_TIME_MS = float(os.getenv("ADVANCED_DB_MAX_RESPONSE_TIME", "500"))
    TARGET_RESPONSE_TIME_MS = float(os.getenv("ADVANCED_DB_TARGET_RESPONSE_TIME", "100"))
    
    # Throughput targets
    MIN_QUERIES_PER_SECOND = float(os.getenv("ADVANCED_DB_MIN_QPS", "10"))
    TARGET_QUERIES_PER_SECOND = float(os.getenv("ADVANCED_DB_TARGET_QPS", "100"))
    
    # Success rate targets
    MIN_SUCCESS_RATE = float(os.getenv("ADVANCED_DB_MIN_SUCCESS_RATE", "95.0"))
    TARGET_SUCCESS_RATE = float(os.getenv("ADVANCED_DB_TARGET_SUCCESS_RATE", "99.0"))
    
    # Cache performance
    MIN_CACHE_HIT_RATE = float(os.getenv("ADVANCED_DB_MIN_CACHE_HIT_RATE", "70.0"))
    TARGET_CACHE_HIT_RATE = float(os.getenv("ADVANCED_DB_TARGET_CACHE_HIT_RATE", "90.0"))
    
    # =================================================================
    # RESOURCE LIMITS
    # =================================================================
    
    # CPU limits
    MAX_CPU_USAGE = float(os.getenv("ADVANCED_DB_MAX_CPU", "85.0"))
    CRITICAL_CPU_USAGE = float(os.getenv("ADVANCED_DB_CRITICAL_CPU", "95.0"))
    
    # Memory limits
    MAX_MEMORY_USAGE = float(os.getenv("ADVANCED_DB_MAX_MEMORY", "85.0"))
    CRITICAL_MEMORY_USAGE = float(os.getenv("ADVANCED_DB_CRITICAL_MEMORY", "95.0"))
    
    # Connection limits
    MAX_CONNECTION_UTILIZATION = float(os.getenv("ADVANCED_DB_MAX_CONN_UTIL", "80.0"))
    CRITICAL_CONNECTION_UTILIZATION = float(os.getenv("ADVANCED_DB_CRITICAL_CONN_UTIL", "95.0"))
    
    # =================================================================
    # EMERGENCY PROTOCOLS
    # =================================================================
    
    # Emergency mode triggers
    ENABLE_EMERGENCY_MODE = os.getenv("ADVANCED_DB_EMERGENCY_MODE", "true").lower() == "true"
    EMERGENCY_HEALTH_THRESHOLD = float(os.getenv("ADVANCED_DB_EMERGENCY_HEALTH", "30.0"))
    EMERGENCY_ERROR_RATE_THRESHOLD = float(os.getenv("ADVANCED_DB_EMERGENCY_ERROR_RATE", "50.0"))
    
    # Emergency actions
    EMERGENCY_REDUCE_CONCURRENCY = os.getenv("ADVANCED_DB_EMERGENCY_REDUCE_CONCURRENCY", "true").lower() == "true"
    EMERGENCY_ENABLE_AGGRESSIVE_CACHING = os.getenv("ADVANCED_DB_EMERGENCY_AGGRESSIVE_CACHE", "true").lower() == "true"
    EMERGENCY_FORCE_CLEANUP = os.getenv("ADVANCED_DB_EMERGENCY_CLEANUP", "true").lower() == "true"
    
    # Recovery settings
    AUTO_RECOVERY_ENABLED = os.getenv("ADVANCED_DB_AUTO_RECOVERY", "true").lower() == "true"
    RECOVERY_CHECK_INTERVAL = int(os.getenv("ADVANCED_DB_RECOVERY_CHECK_INTERVAL", "30"))
    
    # =================================================================
    # OPTIMIZATION SETTINGS
    # =================================================================
    
    # Performance optimization
    ENABLE_PERFORMANCE_OPTIMIZATION = os.getenv("ADVANCED_DB_PERFORMANCE_OPT", "true").lower() == "true"
    OPTIMIZATION_INTERVAL = int(os.getenv("ADVANCED_DB_OPT_INTERVAL", "60"))
    
    # Resource optimization
    ENABLE_RESOURCE_OPTIMIZATION = os.getenv("ADVANCED_DB_RESOURCE_OPT", "true").lower() == "true"
    RESOURCE_CHECK_INTERVAL = int(os.getenv("ADVANCED_DB_RESOURCE_CHECK_INTERVAL", "30"))
    
    # Query optimization
    ENABLE_SLOW_QUERY_OPTIMIZATION = os.getenv("ADVANCED_DB_SLOW_QUERY_OPT", "true").lower() == "true"
    SLOW_QUERY_THRESHOLD_MS = float(os.getenv("ADVANCED_DB_SLOW_QUERY_THRESHOLD", "1000"))
    
    # =================================================================
    # LOGGING AND DEBUGGING
    # =================================================================
    
    # Logging levels
    LOG_LEVEL = os.getenv("ADVANCED_DB_LOG_LEVEL", "INFO")
    ENABLE_DEBUG_LOGGING = os.getenv("ADVANCED_DB_DEBUG_LOGGING", "false").lower() == "true"
    
    # Performance logging
    LOG_SLOW_QUERIES = os.getenv("ADVANCED_DB_LOG_SLOW_QUERIES", "true").lower() == "true"
    LOG_PERFORMANCE_METRICS = os.getenv("ADVANCED_DB_LOG_PERFORMANCE", "true").lower() == "true"
    
    # Debug settings
    ENABLE_QUERY_TRACING = os.getenv("ADVANCED_DB_QUERY_TRACING", "false").lower() == "true"
    ENABLE_CONNECTION_TRACING = os.getenv("ADVANCED_DB_CONNECTION_TRACING", "false").lower() == "true"
    
    @classmethod
    def get_all_settings(cls) -> Dict[str, Any]:
        """Get all configuration settings as a dictionary"""
        settings = {}
        
        for attr_name in dir(cls):
            if not attr_name.startswith('_') and not callable(getattr(cls, attr_name)):
                if attr_name.isupper():  # Only get constants
                    settings[attr_name] = getattr(cls, attr_name)
                    
        return settings
    
    @classmethod
    def get_connection_pool_config(cls) -> Dict[str, Any]:
        """Get connection pool specific configuration"""
        return {
            'initial_pool_size': cls.INITIAL_POOL_SIZE,
            'max_pool_size': cls.MAX_POOL_SIZE,
            'pool_timeout': cls.POOL_TIMEOUT,
            'pool_recycle': cls.POOL_RECYCLE_TIME,
            'enable_auto_scaling': cls.ENABLE_AUTO_SCALING,
            'scale_up_threshold': cls.SCALE_UP_THRESHOLD,
            'scale_down_threshold': cls.SCALE_DOWN_THRESHOLD,
            'max_engines': cls.MAX_ENGINES,
            'connection_keepalive': cls.CONNECTION_KEEPALIVE,
            'connection_timeout': cls.CONNECTION_TIMEOUT,
            'statement_timeout': cls.STATEMENT_TIMEOUT
        }
    
    @classmethod
    def get_circuit_breaker_config(cls) -> Dict[str, Any]:
        """Get circuit breaker specific configuration"""
        return {
            'enabled': cls.CIRCUIT_BREAKER_ENABLED,
            'failure_threshold': cls.FAILURE_THRESHOLD,
            'recovery_timeout': cls.RECOVERY_TIMEOUT,
            'enable_adaptive_thresholds': cls.ENABLE_ADAPTIVE_THRESHOLDS,
            'min_failure_threshold': cls.MIN_FAILURE_THRESHOLD,
            'max_failure_threshold': cls.MAX_FAILURE_THRESHOLD
        }
    
    @classmethod
    def get_scheduler_config(cls) -> Dict[str, Any]:
        """Get query scheduler specific configuration"""
        return {
            'enabled': cls.QUERY_SCHEDULER_ENABLED,
            'max_concurrent_queries': cls.MAX_CONCURRENT_QUERIES,
            'batch_window_ms': cls.BATCH_WINDOW_MS,
            'enable_optimization': cls.ENABLE_QUERY_OPTIMIZATION,
            'enable_caching': cls.ENABLE_QUERY_CACHING,
            'cache_ttl': cls.CACHE_TTL_SECONDS,
            'enable_batching': cls.ENABLE_QUERY_BATCHING,
            'max_batch_size': cls.MAX_BATCH_SIZE
        }
    
    @classmethod
    def get_monitoring_config(cls) -> Dict[str, Any]:
        """Get monitoring specific configuration"""
        return {
            'enabled': cls.MONITORING_ENABLED,
            'monitoring_interval': cls.MONITORING_INTERVAL,
            'metrics_retention': cls.METRICS_RETENTION,
            'enable_health_scoring': cls.ENABLE_HEALTH_SCORING,
            'health_check_interval': cls.HEALTH_CHECK_INTERVAL,
            'alerting_enabled': cls.ALERTING_ENABLED,
            'alert_check_interval': cls.ALERT_CHECK_INTERVAL
        }
    
    @classmethod
    def get_performance_targets(cls) -> Dict[str, Any]:
        """Get performance target configuration"""
        return {
            'max_response_time_ms': cls.MAX_RESPONSE_TIME_MS,
            'target_response_time_ms': cls.TARGET_RESPONSE_TIME_MS,
            'min_queries_per_second': cls.MIN_QUERIES_PER_SECOND,
            'target_queries_per_second': cls.TARGET_QUERIES_PER_SECOND,
            'min_success_rate': cls.MIN_SUCCESS_RATE,
            'target_success_rate': cls.TARGET_SUCCESS_RATE,
            'min_cache_hit_rate': cls.MIN_CACHE_HIT_RATE,
            'target_cache_hit_rate': cls.TARGET_CACHE_HIT_RATE
        }
    
    @classmethod
    def validate_config(cls) -> List[str]:
        """Validate configuration and return any warnings"""
        warnings = []
        
        # Validate pool settings
        if cls.INITIAL_POOL_SIZE > cls.MAX_POOL_SIZE:
            warnings.append("INITIAL_POOL_SIZE cannot be greater than MAX_POOL_SIZE")
            
        if cls.MAX_CONCURRENT_QUERIES > cls.MAX_POOL_SIZE * 2:
            warnings.append("MAX_CONCURRENT_QUERIES is very high compared to MAX_POOL_SIZE")
            
        # Validate thresholds
        if cls.SCALE_UP_THRESHOLD <= cls.SCALE_DOWN_THRESHOLD:
            warnings.append("SCALE_UP_THRESHOLD should be greater than SCALE_DOWN_THRESHOLD")
            
        # Validate timeouts
        if cls.CONNECTION_TIMEOUT > cls.POOL_TIMEOUT:
            warnings.append("CONNECTION_TIMEOUT should be less than POOL_TIMEOUT")
            
        # Validate performance targets
        if cls.TARGET_RESPONSE_TIME_MS > cls.MAX_RESPONSE_TIME_MS:
            warnings.append("TARGET_RESPONSE_TIME_MS should be less than MAX_RESPONSE_TIME_MS")
            
        return warnings


# Global configuration instance
config = AdvancedDatabaseConfig()

# Convenience functions for getting specific configurations
def get_connection_pool_config() -> Dict[str, Any]:
    """Get connection pool configuration"""
    return config.get_connection_pool_config()

def get_circuit_breaker_config() -> Dict[str, Any]:
    """Get circuit breaker configuration"""
    return config.get_circuit_breaker_config()

def get_scheduler_config() -> Dict[str, Any]:
    """Get query scheduler configuration"""
    return config.get_scheduler_config()

def get_monitoring_config() -> Dict[str, Any]:
    """Get monitoring configuration"""
    return config.get_monitoring_config()

def get_performance_targets() -> Dict[str, Any]:
    """Get performance targets"""
    return config.get_performance_targets()

def validate_configuration() -> List[str]:
    """Validate all configuration settings"""
    return config.validate_config()

# Export configuration
__all__ = [
    'AdvancedDatabaseConfig',
    'config',
    'get_connection_pool_config',
    'get_circuit_breaker_config',
    'get_scheduler_config',
    'get_monitoring_config',
    'get_performance_targets',
    'validate_configuration'
]