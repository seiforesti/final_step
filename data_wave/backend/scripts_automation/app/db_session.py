import os
import time
import logging
from contextlib import contextmanager, asynccontextmanager
from contextvars import ContextVar
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
_current_session: ContextVar[Optional[Session]] = ContextVar("_current_session", default=None)


def _get_database_url() -> str:
    # Prefer DATABASE_URL, fallback to DB_URL; final fallback is local Postgres
    database_url = (
        os.getenv("DATABASE_URL")
        or os.getenv("DB_URL")
        or "postgresql+psycopg2://postgres:postgres@localhost:5432/data_governance"
    )
    return database_url


def _create_engine(database_url: str) -> Engine:
    # Use centralized config for consistency
    try:
        from app.db_config import DB_CONFIG
        pool_kwargs = {
            "pool_pre_ping": DB_CONFIG["pool_pre_ping"],
            "pool_size": max(1, DB_CONFIG["pool_size"]),  # Ensure minimum size of 1
            "max_overflow": max(0, DB_CONFIG["max_overflow"]),  # Ensure non-negative
            "pool_recycle": DB_CONFIG["pool_recycle"],
            "pool_timeout": max(1, DB_CONFIG["pool_timeout"]),  # Ensure minimum timeout of 1
            "pool_reset_on_return": DB_CONFIG["pool_reset_on_return"],
            "echo_pool": DB_CONFIG["echo_pool"],
            "pool_use_lifo": DB_CONFIG["pool_use_lifo"],
        }
    except ImportError:
        # Fallback to environment variables if config not available
        pool_kwargs = {
            "pool_pre_ping": True,
            "pool_size": max(1, min(int(os.getenv("DB_POOL_SIZE", "6")), 8)),
            "max_overflow": max(0, int(os.getenv("DB_MAX_OVERFLOW", "0"))),
            "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "1800")),
            "pool_timeout": max(1, int(os.getenv("DB_POOL_TIMEOUT", "2"))),
            "pool_reset_on_return": "commit",
            "echo_pool": os.getenv("DB_ECHO_POOL", "false").lower() == "true",
            "pool_use_lifo": True,
        }

    # Initialize connect_args for all database types
    connect_args = {}
    
    # Allow SQLITE for tests if provided
    if database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        # SQLite does not support pooling the same way
        pool_kwargs = {"pool_pre_ping": True}

    # Log the pool configuration being used
    logger.info(f"Creating engine with pool config: size={pool_kwargs['pool_size']}, max_overflow={pool_kwargs['max_overflow']}")
    
    try:
        engine = create_engine(database_url, connect_args=connect_args, **pool_kwargs)
        
        # Verify the pool was created correctly
        if hasattr(engine, 'pool'):
            pool = engine.pool
            logger.info(f"Engine created successfully. Pool size: {pool.size()}, Max overflow: {getattr(pool, '_max_overflow', 'N/A')}")
        
        return engine
    except Exception as e:
        logger.error(f"Failed to create engine: {e}")
        # Fallback to minimal configuration
        fallback_kwargs = {
            "pool_pre_ping": True,
            "pool_size": 5,
            "max_overflow": 0,
            "pool_timeout": 5,
        }
        logger.info("Using fallback engine configuration")
        return create_engine(database_url, connect_args=connect_args, **fallback_kwargs)


# Create engine and sessionmaker at import time to satisfy FastAPI dependencies
DATABASE_URL = _get_database_url()
engine = _create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)

def recreate_engine():
    """Recreate the engine with current configuration."""
    global engine, SessionLocal
    try:
        # Dispose old engine completely
        if hasattr(engine, 'dispose'):
            engine.dispose()
        
        # Force garbage collection to clean up any lingering connections
        import gc
        gc.collect()
        
        # Create new engine with current config
        engine = _create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
        
        logger.info("Engine recreated successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to recreate engine: {e}")
        return False

# Remove the problematic import-time check that can corrupt the pool
# The health monitor will handle pool validation instead

# Add connection pool cleanup and recovery
def cleanup_connection_pool():
    """Clean up stale connections and reset pool if needed."""
    try:
        if engine.pool.checkedout() > engine.pool.size() * 0.8:  # If 80% of connections are checked out
            logger.warning("Connection pool usage high, attempting cleanup...")
            engine.pool.dispose()  # Dispose and recreate pool
            logger.info("Connection pool cleaned up successfully")
    except Exception as e:
        logger.error(f"Error during connection pool cleanup: {e}")

# Schedule periodic cleanup
import threading
import time

def pool_monitor():
    """Monitor connection pool health and cleanup if needed."""
    try:
        from app.db_config import DB_CONFIG
        auto_force = DB_CONFIG["auto_force_cleanup"]
        util_threshold = DB_CONFIG["cleanup_util_threshold"]
        min_interval = DB_CONFIG["cleanup_min_interval_sec"]
    except ImportError:
        # Fallback values
        auto_force = os.getenv("AUTO_FORCE_DB_CLEANUP", "true").lower() == "true"
        util_threshold = float(os.getenv("CLEANUP_UTIL_THRESHOLD", "80"))
        min_interval = int(os.getenv("CLEANUP_MIN_INTERVAL_SEC", "60"))
    
    last_forced = 0.0
    while True:
        try:
            time.sleep(60)  # Check every minute
            # Lightweight cleanup (dispose pool when high)
            cleanup_connection_pool()

            # Optionally force a full cleanup when severely saturated
            if auto_force:
                try:
                    status = get_connection_pool_status()
                    utilization = float(status.get("utilization_percentage", 0)) if isinstance(status, dict) else 0
                    now = time.time()
                    if utilization >= util_threshold and (now - last_forced) >= min_interval:
                        logger.warning(
                            f"Utilization {utilization:.1f}% >= {util_threshold}%. Forcing DB connection cleanup."
                        )
                        _ = force_connection_cleanup()
                        last_forced = now
                except Exception as e:
                    logger.error(f"Auto force cleanup check failed: {e}")
        except Exception as e:
            logger.error(f"Pool monitor error: {e}")

# Start pool monitor in background thread
pool_monitor_thread = threading.Thread(target=pool_monitor, daemon=True)
pool_monitor_thread.start()

# Concurrency control and circuit breaker with centralized config
try:
    from app.db_config import DB_CONFIG
    _max_concurrent_db_requests = DB_CONFIG["max_concurrent_requests"]
    _db_semaphore = threading.BoundedSemaphore(value=max(1, _max_concurrent_db_requests))
    _failure_window_seconds = DB_CONFIG["failure_window_seconds"]
    _failure_threshold = DB_CONFIG["failure_threshold"]
    _circuit_open_seconds = DB_CONFIG["circuit_open_seconds"]
    _recent_failures = []
    _circuit_open_until = 0.0
except ImportError:
    # Fallback values
    _max_concurrent_db_requests = 6
    _db_semaphore = threading.BoundedSemaphore(value=6)
    _failure_window_seconds = 30
    _failure_threshold = 5
    _circuit_open_seconds = 15
    _recent_failures = []
    _circuit_open_until = 0.0

def _record_failure_and_maybe_open_circuit() -> None:
    global _circuit_open_until
    now = time.time()
    _recent_failures.append(now)
    # Clean old failures outside the window
    _recent_failures[:] = [f for f in _recent_failures if now - f <= _failure_window_seconds]
    
    if len(_recent_failures) >= _failure_threshold:
        _circuit_open_until = now + _circuit_open_seconds
        logger.warning(
            f"DB circuit opened for {_circuit_open_seconds}s after {len(_recent_failures)} failures in {_failure_window_seconds}s"
        )

def _circuit_is_open() -> bool:
    return time.time() < _circuit_open_until


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
                connection.execute(text("SELECT 1"))
            
            # Log connection pool status
            logger.info(f"Database connection pool status: size={engine.pool.size()}, checked_in={engine.pool.checkedin()}, checked_out={engine.pool.checkedout()}, overflow={engine.pool.overflow()}")
            
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
    """FastAPI dependency that yields a per-request database session and ensures close.

    Reuses a single session per request across dependencies via ContextVar to avoid
    multiple concurrent checkouts that saturate the pool.
    """
    # Circuit breaker check
    if _circuit_is_open():
        logger.warning("Circuit breaker is open; rejecting DB request.")
        raise RuntimeError("database_unavailable")

    # Check connection pool health before getting a session
    if engine.pool.checkedout() >= engine.pool.size() + engine.pool.overflow():
        logger.warning("Connection pool is at capacity; rejecting additional work until a slot frees up.")
        raise RuntimeError("database_unavailable")

    # Try to acquire concurrency token quickly
    try:
        from app.db_config import DB_CONFIG
        semaphore_timeout = DB_CONFIG["semaphore_timeout"]
    except ImportError:
        semaphore_timeout = float(os.getenv("DB_SEMAPHORE_TIMEOUT", "0.05"))
    
    acquired = _db_semaphore.acquire(timeout=semaphore_timeout)
    if not acquired:
        logger.warning("DB concurrency gate rejected a request (too many concurrent DB-bound operations).")
        raise RuntimeError("database_unavailable")

    # Reuse existing session if present for this request context
    existing = _current_session.get()
    if existing is not None:
        try:
            yield existing
        finally:
            try:
                _db_semaphore.release()
            except Exception:
                pass
        return

    try:
        db = SessionLocal()
    except OperationalError:
        _record_failure_and_maybe_open_circuit()
        try:
            _db_semaphore.release()
        except Exception:
            pass
        raise RuntimeError("database_unavailable")

    token = _current_session.set(db)
    try:
        yield db
    finally:
        try:
            _current_session.reset(token)
        except Exception:
            pass
        try:
            db.close()
            logger.debug(
                f"Connection returned to pool. Pool status: checked_in={engine.pool.checkedin()}, checked_out={engine.pool.checkedout()}"
            )
        except Exception:
            pass
        try:
            _db_semaphore.release()
        except Exception:
            pass


class SessionProvider:
    """Provider that works as:
    - callable → returns sync Session
    - sync context manager → yields sync Session
    - async context manager → yields AsyncSession
    """

    def __call__(self) -> Session:
        # Reuse current request session if available
        existing = _current_session.get()
        if existing is not None:
            return existing
        return SessionLocal()

    # Sync CM
    def __enter__(self) -> Session:
        existing = _current_session.get()
        if existing is not None:
            self._sync_session = existing
            return self._sync_session
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
            # Only close if this context created it (avoid closing shared request session)
            try:
                existing = _current_session.get()
                if existing is None or existing is not self._sync_session:
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


def cleanup_connection_pool():
    """Clean up connection pool to free up connections."""
    try:
        # Dispose of the engine to close all connections
        engine.dispose()
        logger.info("Database connection pool cleaned up")
    except Exception as e:
        logger.error(f"Error cleaning up connection pool: {e}")


def get_connection_pool_status():
    """Get current connection pool status for monitoring."""
    try:
        pool = engine.pool
        status = {
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "total_connections": pool.size() + pool.overflow(),
            "available_connections": pool.checkedin(),
        }
        
        # Calculate utilization percentage safely
        total_conn = status["total_connections"]
        if total_conn > 0:
            status["utilization_percentage"] = ((pool.checkedout() + pool.overflow()) / total_conn) * 100
        else:
            status["utilization_percentage"] = 0
        
        # Log warning if pool is getting full
        if status["utilization_percentage"] > 80:
            logger.warning(f"Connection pool utilization high: {status['utilization_percentage']:.1f}%")
        if status["utilization_percentage"] > 95:
            logger.error(f"Connection pool nearly exhausted: {status['utilization_percentage']:.1f}%")
            
        return status
    except Exception as e:
        logger.error(f"Error getting pool status: {e}")
        return {"error": str(e)}


def force_connection_cleanup():
    """Force cleanup of all connections in the pool."""
    try:
        # Get current status
        status = get_connection_pool_status()
        logger.info(f"Before cleanup - Pool status: {status}")
        
        # Dispose of the engine to close all connections
        engine.dispose()
        
        # Get status after cleanup
        status_after = get_connection_pool_status()
        logger.info(f"After cleanup - Pool status: {status_after}")
        
        return {"before": status, "after": status_after}
    except Exception as e:
        logger.error(f"Error during force cleanup: {e}")
        return {"error": str(e)}


def force_engine_recreation():
    """Force complete engine recreation by disposing and recreating."""
    global engine, SessionLocal
    try:
        # Dispose old engine completely
        if hasattr(engine, 'dispose'):
            engine.dispose()
        
        # Force garbage collection
        # Force garbage collection multiple times
        import gc
        for _ in range(3):
            gc.collect()

        # Wait a moment for cleanup
        import time
        time.sleep(0.1)

        # Create completely new engine
        new_engine = _create_engine(DATABASE_URL)
        
        # Verify the new engine is valid
        if hasattr(new_engine, 'pool'):
            try:
                # Test a simple connection to verify pool health
                with new_engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                
                # If we get here, the pool is working
                engine = new_engine
                SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
                logger.info("Engine force recreated successfully")
                return True
            except Exception as pool_error:
                logger.error(f"New engine pool test failed: {pool_error}")
                return False
        else:
            logger.error("New engine has no pool")
            return False
            
    except Exception as e:
        logger.error(f"Failed to force recreate engine: {e}")
        return False


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
    "cleanup_connection_pool",
    "get_connection_pool_status",
    "force_connection_cleanup",
    "force_engine_recreation",
]


