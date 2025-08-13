"""
Database Models Base
===================

This module provides the SQLAlchemy Base class for models that use SQLAlchemy directly
instead of SQLModel. This is needed for compatibility with existing workflow and pipeline models.

The Base class is used by:
- racine_workflow_models.py
- racine_pipeline_models.py
- Other models that use SQLAlchemy directly

This maintains compatibility while allowing the system to run with all advanced logic intact.
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData

# Create the base class for SQLAlchemy models
Base = declarative_base()

# Metadata for database operations
metadata = MetaData()

