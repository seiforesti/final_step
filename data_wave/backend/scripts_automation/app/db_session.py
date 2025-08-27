import os
import time
import logging
from contextlib import contextmanager, asynccontextmanager
from typing import Generator, Optional

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)
from sqlalchemy import inspect, text


logger = logging.getLogger(__name__)


def _get_database_url() -> str:
    # Prefer DATABASE_URL, fallback to DB_URL; final fallback is local Postgres
    database_url = (
        os.getenv("DATABASE_URL")
        or os.getenv("DB_URL")
        or "postgresql+psycopg2://postgres:postgres@localhost:5432/data_governance"
    )
    return database_url


def _create_engine(database_url: str) -> Engine:
    # Use sane defaults for production-grade connections
    connect_args = {}
    pool_kwargs = {
        "pool_pre_ping": True,
        "pool_size": int(os.getenv("DB_POOL_SIZE", "5")),
        "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "10")),
        "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "1800")),  # 30 minutes
    }

    # Allow SQLITE for tests if provided
    if database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        # SQLite does not support pooling the same way
        pool_kwargs = {"pool_pre_ping": True}

    engine = create_engine(database_url, connect_args=connect_args, **pool_kwargs)
    return engine


# Create engine and sessionmaker at import time to satisfy FastAPI dependencies
DATABASE_URL = _get_database_url()
engine = _create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)


def _to_async_url(database_url: str) -> str:
    # Convert sync URL to async driver where applicable
    if database_url.startswith("postgresql+psycopg2://"):
        return database_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if database_url.startswith("sqlite:///") and "+aiosqlite" not in database_url:
        return database_url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
    return database_url


ASYNC_DATABASE_URL = _to_async_url(DATABASE_URL)
async_engine: AsyncEngine = create_async_engine(ASYNC_DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, autoflush=False, expire_on_commit=False)


def init_db(max_retries: int = 10, backoff_seconds: float = 1.0) -> None:
    """Initialize the database connection and create tables.

    Retries to handle container start order (e.g., Postgres not ready yet).
    """
    # Import models lazily to avoid circular imports and to register metadata
    try:
        from app import models  # noqa: F401  (ensure model modules are imported)
    except Exception as import_error:
        logger.warning(f"Model import warning during init_db: {import_error}")

    attempt = 0
    while True:
        try:
            # Simple connectivity check
            with engine.connect() as connection:
                connection.execute("SELECT 1")
            # Create tables if metadata is available
            try:
                from app.models.base import Base  # prefer a central Base if available
            except Exception:
                # Fallback: try to get Base from any model module that defines it
                Base = None  # type: ignore
                try:
                    from app.models import base as models_base  # type: ignore
                    Base = getattr(models_base, "Base", None)
                except Exception:
                    Base = None

            if Base is not None:
                Base.metadata.create_all(bind=engine)
                logger.info("Database tables ensured via Base.metadata.create_all")
            else:
                logger.info("Base metadata not found; skipping create_all (models manage migrations)")
            return
        except OperationalError as exc:
            attempt += 1
            if attempt > max_retries:
                logger.error(f"Database initialization failed after {max_retries} retries: {exc}")
                raise
            sleep_for = backoff_seconds * (2 ** (attempt - 1))
            logger.warning(f"Database not ready (attempt {attempt}/{max_retries}). Retrying in {sleep_for:.1f}s...")
            time.sleep(min(sleep_for, 10.0))


async def init_async_db(max_retries: int = 10, backoff_seconds: float = 1.0) -> None:
    """Initialize the database for async engine, retrying until available."""
    try:
        from app import models  # noqa: F401
    except Exception as import_error:
        logger.warning(f"Model import warning during init_async_db: {import_error}")

    attempt = 0
    while True:
        try:
            async with async_engine.begin() as conn:
                await conn.run_sync(lambda sync_conn: sync_conn.execute("SELECT 1"))
            try:
                from app.models.base import Base  # type: ignore
            except Exception:
                Base = None  # type: ignore
                try:
                    from app.models import base as models_base  # type: ignore
                    Base = getattr(models_base, "Base", None)
                except Exception:
                    Base = None
            if Base is not None:
                async with async_engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                logger.info("Async database tables ensured via Base.metadata.create_all")
            else:
                logger.info("Async Base metadata not found; skipping create_all")
            return
        except OperationalError as exc:
            attempt += 1
            if attempt > max_retries:
                logger.error(f"Async database initialization failed after {max_retries} retries: {exc}")
                raise
            sleep_for = backoff_seconds * (2 ** (attempt - 1))
            logger.warning(f"Async database not ready (attempt {attempt}/{max_retries}). Retrying in {sleep_for:.1f}s...")
            time.sleep(min(sleep_for, 10.0))


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and ensures close."""
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            # Ensure no exception escapes the dependency teardown
            pass


class SessionProvider:
    """Provider that works as:
    - callable → returns sync Session
    - sync context manager → yields sync Session
    - async context manager → yields AsyncSession
    """

    def __call__(self) -> Session:
        return SessionLocal()

    # Sync CM
    def __enter__(self) -> Session:
        self._sync_session = SessionLocal()
        return self._sync_session

    def __exit__(self, exc_type, exc, tb) -> Optional[bool]:
        try:
            if exc_type is None:
                try:
                    self._sync_session.commit()
                except Exception:
                    self._sync_session.rollback()
                    raise
        finally:
            try:
                self._sync_session.close()
            except Exception:
                pass
        return False

    # Async CM
    async def __aenter__(self) -> AsyncSession:
        self._async_session = AsyncSessionLocal()
        return self._async_session

    async def __aexit__(self, exc_type, exc, tb) -> Optional[bool]:
        try:
            if exc_type is None:
                try:
                    await self._async_session.commit()
                except Exception:
                    await self._async_session.rollback()
                    raise
        finally:
            try:
                await self._async_session.close()
            except Exception:
                pass
        return False


# Expose a single provider under the legacy name
get_session = SessionProvider()


async def get_async_session() -> Generator[AsyncSession, None, None]:
    """FastAPI async dependency yielding an AsyncSession."""
    async_db: AsyncSession = AsyncSessionLocal()
    try:
        yield async_db
    finally:
        try:
            await async_db.close()
        except Exception:
            pass


def validate_database_integrity() -> tuple[bool, list[str], list[str]]:
    """Perform lightweight, safe integrity validation.

    Returns a tuple of (integrity_valid, fk_issues, constraint_issues).
    This function avoids destructive operations and heavy scans. It verifies:
      - Connectivity and basic query execution
      - Metadata accessibility (tables, foreign keys)
    Detailed orphan checks should be implemented per-domain to avoid full scans.
    """
    fk_issues: list[str] = []
    constraint_issues: list[str] = []
    try:
        with engine.connect() as connection:
            # Connectivity check
            connection.execute(text("SELECT 1"))

            inspector = inspect(connection)
            tables = inspector.get_table_names()

            # Ensure tables are enumerable and basic access works
            for table_name in tables:
                try:
                    # Probe minimal read access without scanning the whole table
                    connection.execute(text(f"SELECT 1 FROM \"{table_name}\" LIMIT 1"))
                except Exception as table_err:
                    constraint_issues.append(
                        f"Table access failed for {table_name}: {table_err}"
                    )

                # Enumerate foreign keys for visibility; deep validation is domain-specific
                try:
                    _ = inspector.get_foreign_keys(table_name)
                except Exception as fk_err:
                    fk_issues.append(f"Failed to read foreign keys for {table_name}: {fk_err}")

        integrity_valid = len(fk_issues) == 0 and len(constraint_issues) == 0
        return integrity_valid, fk_issues, constraint_issues
    except Exception as e:
        # Any unexpected exception is treated as integrity failure
        return False, fk_issues, constraint_issues + [f"Integrity validation error: {e}"]


def repair_database_integrity(fk_fixes: list, constraint_errors: list) -> tuple[list[str], list[str]]:
    """Attempt non-destructive repairs.

    In this foundational implementation, we only report and log issues; actual
    domain-specific repairs should be implemented via migrations or targeted
    services to avoid unintended data changes.
    Returns (repairs_made, repair_errors).
    """
    repairs_made: list[str] = []
    repair_errors: list[str] = []
    # Intentionally non-destructive: log and return without making schema/data changes
    try:
        if fk_fixes or constraint_errors:
            logger.warning(
                f"Repair requested. fk_fixes={len(fk_fixes)}, constraint_errors={len(constraint_errors)}"
            )
        return repairs_made, repair_errors
    except Exception as e:
        repair_errors.append(str(e))
        return repairs_made, repair_errors


@contextmanager
def get_sync_db_session() -> Generator[Session, None, None]:
    """Synchronous context manager variant used by scripts/tests."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        try:
            db.close()
        except Exception:
            pass


@asynccontextmanager
async def get_db_session() -> Generator[AsyncSession, None, None]:
    """Async context manager yielding an AsyncSession for 'async with' usage."""
    db: AsyncSession = AsyncSessionLocal()
    try:
        yield db
        try:
            await db.commit()
        except Exception:
            await db.rollback()
            raise
    finally:
        try:
            await db.close()
        except Exception:
            pass


__all__ = [
    "engine",
    "SessionLocal",
    "init_db",
    "get_db",
    "get_db_session",
    "get_session",
    "get_sync_db_session",
    "async_engine",
    "AsyncSessionLocal",
    "init_async_db",
    "get_async_session",
    "validate_database_integrity",
    "repair_database_integrity",
]


