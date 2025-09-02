"""
Database Configuration Module
Centralized configuration for database connection pooling and concurrency control.
This ensures all parts of the application use the same conservative settings.
"""

import os
from typing import Dict, Any

# Load environment variables early
try:
    from dotenv import load_dotenv
    # Try multiple .env locations
    load_dotenv()  # Current directory
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))  # App directory
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))  # Parent directory
except ImportError:
    pass

def get_env_int(key: str, default: int) -> int:
    """Get environment variable as integer with fallback."""
    try:
        return int(os.getenv(key, str(default)))
    except (ValueError, TypeError):
        return default

def get_env_bool(key: str, default: bool) -> bool:
    """Get environment variable as boolean with fallback."""
    val = os.getenv(key, str(default)).lower()
    return val in ('true', '1', 'yes', 'on')

# Database Connection Pool Configuration
# Conservative settings to prevent PostgreSQL connection exhaustion
DB_CONFIG: Dict[str, Any] = {
    # Pool Settings
    "pool_size": get_env_int("DB_POOL_SIZE", 6),
    "max_overflow": get_env_int("DB_MAX_OVERFLOW", 0),
    "pool_timeout": get_env_int("DB_POOL_TIMEOUT", 2),
    "pool_recycle": get_env_int("DB_POOL_RECYCLE", 1800),
    "pool_pre_ping": get_env_bool("DB_POOL_PRE_PING", True),
    "pool_reset_on_return": "commit",
    "pool_use_lifo": True,
    "echo_pool": get_env_bool("DB_ECHO_POOL", False),
    
    # Concurrency Control
    "max_concurrent_requests": get_env_int("MAX_CONCURRENT_DB_REQUESTS", 6),
    "semaphore_timeout": get_env_int("DB_SEMAPHORE_TIMEOUT", 0.05),
    
    # Circuit Breaker Settings
    "failure_window_seconds": get_env_int("DB_FAILURE_WINDOW_SECONDS", 30),
    "failure_threshold": get_env_int("DB_FAILURE_THRESHOLD", 5),
    "circuit_open_seconds": get_env_int("DB_CIRCUIT_OPEN_SECONDS", 15),
    
    # Auto Cleanup Settings
    "auto_force_cleanup": get_env_bool("AUTO_FORCE_DB_CLEANUP", True),
    "cleanup_util_threshold": get_env_int("CLEANUP_UTIL_THRESHOLD", 80),
    "cleanup_min_interval_sec": get_env_int("CLEANUP_MIN_INTERVAL_SEC", 60),
}

# Database URL Configuration
def get_database_url() -> str:
    """Get database URL with fallbacks."""
    return (
        os.getenv("DATABASE_URL") or
        os.getenv("DB_URL") or
        "postgresql://postgres:postgres@data_governance_postgres:5432/data_governance"
    )

# Validation
def validate_config() -> bool:
    """Validate that the configuration is safe and won't exhaust connections."""
    pool_size = DB_CONFIG["pool_size"]
    max_overflow = DB_CONFIG["max_overflow"]
    total_connections = pool_size + max_overflow
    
    # PostgreSQL typically has max_connections = 100
    if total_connections > 50:
        print(f"⚠️  WARNING: Total connections ({total_connections}) may be too high")
        return False
    
    if pool_size > 10:
        print(f"⚠️  WARNING: Pool size ({pool_size}) may be too high")
        return False
    
    if max_overflow > 5:
        print(f"⚠️  WARNING: Max overflow ({max_overflow}) may be too high")
        return False
    
    print(f"✅ Database config validated: pool_size={pool_size}, max_overflow={max_overflow}, total={total_connections}")
    return True

# Export configuration
__all__ = ["DB_CONFIG", "get_database_url", "validate_config"]

if __name__ == "__main__":
    print("Database Configuration:")
    for key, value in DB_CONFIG.items():
        print(f"  {key}: {value}")
    print()
    validate_config()
