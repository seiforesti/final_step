"""
Core Package for Enterprise Data Governance Platform
===================================================

This package contains core configuration, security, and utility modules for the enterprise data governance platform.
"""

# Import core modules
from . import (
    config,
    # cors,  # Temporarily disabled due to Python 3.13 compatibility issues
    db,
    logging_config,
    security,
    settings,
    cache_manager
)

__all__ = [
    "config",
    # "cors",  # Temporarily disabled due to Python 3.13 compatibility issues
    "db",
    "logging_config",
    "security",
    "settings",
    "cache_manager"
]
