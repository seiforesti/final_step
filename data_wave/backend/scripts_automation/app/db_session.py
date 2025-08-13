# app/db_session.py

from contextlib import contextmanager, asynccontextmanager
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

import os
from dotenv import load_dotenv
# Import only specific models to avoid circular imports and conflicts
# from app.models.schema_models import DataTableSchema, SchemaVersion
import logging
# Setup logging
logger = logging.getLogger(__name__)
load_dotenv()   

# Use SQLite in-memory DB for pytest, else use DB_URL from .env (for container), fallback to default
if os.environ.get("PYTEST_CURRENT_TEST"):
    DATABASE_URL = "sqlite:///:memory:"
else:
    DATABASE_URL = os.environ.get("DB_URL", "postgresql://admin:admin@metadata-db:5432/schema_metadata")

engine = create_engine(DATABASE_URL, echo=False)

# Async engine (only if using asyncpg URI)
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://") if DATABASE_URL.startswith("postgresql://") else DATABASE_URL
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)


def init_db():
    """Create database tables if they don't exist."""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise


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
