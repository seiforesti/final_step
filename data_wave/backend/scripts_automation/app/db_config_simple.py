"""
Database Configuration Fix
Simplified configuration to avoid SQLAlchemy compatibility issues.
"""

import os

# Simple database URL configuration
def get_database_url() -> str:
    """Get database URL with fallbacks."""
    return (
        os.getenv("DATABASE_URL") or
        os.getenv("DB_URL") or
        "postgresql://postgres:postgres@localhost:5432/data_governance"
    )

# Simple connection pool configuration
DB_CONFIG = {
    "pool_size": int(os.getenv("DB_POOL_SIZE", "10")),
    "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "5")),
    "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
    "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "1800")),
    "pool_pre_ping": True,
    "echo_pool": False,
}

print(f"Database URL: {get_database_url()}")
print(f"Pool config: {DB_CONFIG}")
