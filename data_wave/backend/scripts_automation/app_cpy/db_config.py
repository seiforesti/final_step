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
# Optimized settings to handle enterprise load while preventing exhaustion

# Check if PgBouncer is being used and set appropriate defaults
database_url = os.getenv("DATABASE_URL", "")
is_using_pgbouncer = "pgbouncer" in database_url.lower() or "6432" in database_url

if is_using_pgbouncer:

    # DISABLE SQLAlchemy connection pooling when PgBouncer is used
    # PgBouncer handles all connection pooling, backend should not pool at all
    os.environ["DB_POOL_SIZE"] = "0"
    os.environ["DB_MAX_OVERFLOW"] = "0"
    default_pool_size = 0
    default_max_overflow = 0
else:
    # Use normal pool sizes when connecting directly to PostgreSQL
    default_pool_size = 8
    default_max_overflow = 3

DB_CONFIG: Dict[str, Any] = {
    # Pool Settings - OPTIMIZED FOR PGBOUNCER when detected
    "pool_size": get_env_int("DB_POOL_SIZE", default_pool_size),
    "max_overflow": get_env_int("DB_MAX_OVERFLOW", default_max_overflow),
    "pool_timeout": get_env_int("DB_POOL_TIMEOUT", 60),  # Increased from 30
    "pool_recycle": get_env_int("DB_POOL_RECYCLE", 900),  # Reduced from 1800 (15 min)
    "pool_pre_ping": get_env_bool("DB_POOL_PRE_PING", True),
    "pool_reset_on_return": "commit",
    "pool_use_lifo": True,
    "echo_pool": get_env_bool("DB_ECHO_POOL", False),
    
    # Concurrency Control - FURTHER REDUCED to prevent pool exhaustion during health check loops
    "max_concurrent_requests": get_env_int("MAX_CONCURRENT_DB_REQUESTS", 8),  # Further reduced from 15
    "semaphore_timeout": get_env_int("DB_SEMAPHORE_TIMEOUT", 5),  # Increased from 0.1 to 5 seconds
    
    # Circuit Breaker Settings - More aggressive for enterprise
    "failure_window_seconds": get_env_int("DB_FAILURE_WINDOW_SECONDS", 30),  # Reduced from 60
    "failure_threshold": get_env_int("DB_FAILURE_THRESHOLD", 5),  # Reduced from 10
    "circuit_open_seconds": get_env_int("DB_CIRCUIT_OPEN_SECONDS", 60),  # Increased from 30
    
    # Auto Cleanup Settings - More aggressive cleanup
    "auto_force_cleanup": get_env_bool("AUTO_FORCE_DB_CLEANUP", True),
    "cleanup_util_threshold": get_env_int("CLEANUP_UTIL_THRESHOLD", 60),  # Reduced from 70
    "cleanup_min_interval_sec": get_env_int("CLEANUP_MIN_INTERVAL_SEC", 15),  # Reduced from 30
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
    
    # PostgreSQL typically has max_connections = 100, keep under 60 for safety
    if total_connections > 60:
        print(f"⚠️  WARNING: Total connections ({total_connections}) may be too high")
        return False
    
    if pool_size > 20:
        print(f"⚠️  WARNING: Pool size ({pool_size}) may be too high")
        return False
    
    if max_overflow > 10:
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
