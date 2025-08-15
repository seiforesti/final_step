# app/db_session.py

from contextlib import contextmanager, asynccontextmanager
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

import os
from app.models.schema_models import DataTableSchema, SchemaVersion
from dotenv import load_dotenv
import logging
# Setup logging
logger = logging.getLogger(__name__)
load_dotenv()   

# Use SQLite in-memory DB for pytest, else use DB_URL from .env (for container), fallback to default
if os.environ.get("PYTEST_CURRENT_TEST"):
    DATABASE_URL = "sqlite:///:memory:"
else:
    DATABASE_URL = os.environ.get("DB_URL", "postgresql://admin:admin@metadata-db:5432/schema_metadata")

# Configure engine with increased pool size and timeout to handle high connection demand
engine = create_engine(
    DATABASE_URL, 
    echo=False,
    pool_size=20,  # Increased from default 5
    max_overflow=30,  # Increased from default 10
    pool_timeout=60,  # Increased from default 30
    pool_recycle=3600  # Recycle connections after 1 hour
)

# Async engine (only if using asyncpg URI)
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://") if DATABASE_URL.startswith("postgresql://") else DATABASE_URL
async_engine = create_async_engine(
    ASYNC_DATABASE_URL, 
    echo=False, 
    future=True,
    pool_size=20,  # Increased from default 5
    max_overflow=30,  # Increased from default 10
    pool_timeout=60,  # Increased from default 30
    pool_recycle=3600  # Recycle connections after 1 hour
)
AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)


def init_db():
    """Create database tables if they don't exist.
    
    This advanced implementation handles table creation with enterprise-grade error handling:
    1. Creates tables in a specific order to handle dependencies
    2. Intelligently skips tables that already exist
    3. Handles duplicate constraint errors gracefully
    """
    from sqlalchemy.exc import ProgrammingError, IntegrityError
    from sqlalchemy import inspect
    
    # Get all tables from metadata
    all_tables = SQLModel.metadata.sorted_tables
    tables_by_name = {table.name: table for table in all_tables}
    inspector = inspect(engine)
    
    # Define the order of table creation to handle dependencies
    # Base tables first, then tables with foreign keys
    table_creation_order = [
        # Base tables without dependencies
        "users", "groups", "roles", "permissions", "organizations",
        "datasource", "scan", "catalog_items", "scan_orchestration_jobs",
        "performance_bottlenecks", "scan_performance_metrics", "scan_intelligence_engines", "rule_pattern_library",
        "classification_frameworks", "classification_dictionaries",
        "ml_models", "ai_model_configurations", "ml_experiments", "ai_experiments",
        "racine_cross_group_integration", "ai_conversations", "asset_reviews",
        "scan_workflows", "racine_workspace", "reports",
        "performance_metrics", "ml_model_configurations",
        "workflows", "racine_workspace_audit", "performance_history",
        "compliance_requirements", "domain_experts", "integrations", "merge_requests",
        "team_collaboration_hubs", "rule_discussions", "knowledge_items",
        "rule_team_members",
        "compliance_rules", "compliance_rule_data_source_link",
        
        # First level dependencies
        "user_roles", "user_groups", "role_permissions", "role_inheritance",
        "classification_rules", "ml_predictions", "ai_predictions",
        "classification_results", "scan_workflow_executions", "scanexecution",
        "ml_experiment_runs", "racine_integration_status", "ai_experiment_runs", "ai_messages",
        "review_comments", "workflow_stages", "racine_workspace_settings", "report_generations",
        "review_assignments", "workflow_dependencies", "ml_model_monitoring", "ml_training_jobs",
        
        # Second level dependencies
        "classification_tags", "scan_result_classifications",
        "ml_feedback", "ai_feedback", "catalog_item_classifications",
        "classification_audit_logs", "classification_rule_dictionaries",
        "racine_workspace_member", "racine_workspace_notification", "racine_workspace_resource",
        "performance_alerts", "racine_workflow_execution", "racine_workspace_analytics",
        
        # All other tables
        "*"
    ]
    
    tables_created = 0
    tables_skipped = 0
    processed_tables = set()
    
    # Create tables in the specified order
    for table_pattern in table_creation_order:
        if table_pattern == "*":
            # Process all remaining tables
            remaining_tables = [t for t in all_tables if t.name not in processed_tables]
            for table in remaining_tables:
                process_table(table, inspector, processed_tables, tables_created, tables_skipped)
        else:
            # Process specific table
            if table_pattern in tables_by_name:
                table = tables_by_name[table_pattern]
                process_table(table, inspector, processed_tables, tables_created, tables_skipped)
    
    logger.info(f"Database initialization completed: {tables_created} tables created, {tables_skipped} tables skipped")


def process_table(table, inspector, processed_tables, tables_created, tables_skipped):
    """Process a single table creation with error handling"""
    from sqlalchemy.exc import ProgrammingError, IntegrityError
    
    if table.name in processed_tables:
        return
    
    try:
        if not inspector.has_table(table.name):
            table.create(engine)
            tables_created += 1
            logger.info(f"Created table: {table.name}")
        else:
            tables_skipped += 1
            logger.debug(f"Table already exists, skipping: {table.name}")
    except ProgrammingError as e:
        # Handle specific errors for existing tables/constraints
        if 'already exists' in str(e) or 'duplicate' in str(e).lower():
            tables_skipped += 1
            logger.debug(f"Table or constraint already exists, skipping: {table.name}")
        else:
            logger.error(f"Error creating table {table.name}: {str(e)}")
    except IntegrityError as e:
        if 'already exists' in str(e) or 'duplicate' in str(e).lower():
            tables_skipped += 1
            logger.debug(f"Table or constraint already exists, skipping: {table.name}")
        else:
            logger.error(f"Integrity error creating table {table.name}: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error creating table {table.name}: {str(e)}")
    
    processed_tables.add(table.name)


# def get_session():
#     return Session(engine)

@contextmanager
def get_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

def get_db():
    with get_session() as session:
        yield session

# Async session dependency
async def get_async_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

@asynccontextmanager
async def get_db_session():
    """Async context manager for database sessions used by services."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
