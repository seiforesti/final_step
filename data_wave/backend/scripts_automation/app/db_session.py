import os
import time
import logging
from contextlib import contextmanager, asynccontextmanager
from contextvars import ContextVar
from typing import Generator, Optional, Dict, Any
import threading

from sqlalchemy import create_engine, event, text
from sqlalchemy.pool import QueuePool
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)
from sqlalchemy import inspect

# Import the new advanced database system
try:
    from app.core.database_master_controller import (
        initialize_database_master_controller,
        get_database_master_controller,
        get_optimized_session,
        execute_optimized_query,
        QueryPriority
    )
    ADVANCED_SYSTEM_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("🚀 ADVANCED DATABASE SYSTEM LOADED - Ultimate performance enabled!")
except ImportError as e:
    ADVANCED_SYSTEM_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"⚠️ Advanced database system not available, using fallback: {e}")
    QueryPriority = None


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


def _create_engine(database_url: str, *, pool_size_override: int | None = None, max_overflow_override: int | None = None, pool_timeout_override: int | None = None) -> Engine:
    # Centralized pool configuration with DB_CONFIG/env overrides
    try:
        from app.db_config import DB_CONFIG as _DBC
    except Exception:
        # Check if PgBouncer is being used and adjust pool sizes accordingly
        database_url = os.getenv("DATABASE_URL", "")
        is_using_pgbouncer = "pgbouncer" in database_url.lower() or "6432" in database_url
        
        if is_using_pgbouncer:
            # Use smaller pool sizes when PgBouncer is handling connection pooling
            default_pool_size = "5"
            default_max_overflow = "3"
        else:
            # Use normal pool sizes when connecting directly to PostgreSQL
            default_pool_size = "5"
            default_max_overflow = "3"
        
        _DBC = {
            "pool_size": int(os.getenv("DB_POOL_SIZE", default_pool_size)),
            "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", default_max_overflow)),
            "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "120")),
            "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "900")),
            "pool_pre_ping": True,
            "pool_reset_on_return": "commit",
            "pool_use_lifo": True,
            "echo_pool": False,
        }

    # Use configuration values directly (no minimum enforcement to respect env vars)
    cfg_pool_size = int(_DBC.get("pool_size", 15))
    cfg_overflow = int(_DBC.get("max_overflow", 5))
    cfg_timeout = int(_DBC.get("pool_timeout", 60))

    if pool_size_override is not None:
        cfg_pool_size = max(cfg_pool_size, int(pool_size_override))
    if max_overflow_override is not None:
        cfg_overflow = max(cfg_overflow, int(max_overflow_override))
    if pool_timeout_override is not None:
        cfg_timeout = max(cfg_timeout, int(pool_timeout_override))

    # Detect PgBouncer/transaction-pooling environments where psycopg2 autocommit toggles during pre_ping cause errors
    use_pgbouncer = (
        os.getenv("DB_USE_PGBOUNCER", "false").lower() == "true"
        or os.getenv("PGBOUNCER_POOL_MODE", "").lower() in {"transaction", "statement"}
        or "pgbouncer" in database_url.lower()
    )

    # Use NullPool when PgBouncer is detected to avoid double pooling
    if use_pgbouncer:
        from sqlalchemy.pool import NullPool
        pool_kwargs = {
            "pool_pre_ping": False,
            "poolclass": NullPool,  # No pooling - PgBouncer handles it
        }
        logger.info("✅ Using NullPool - PgBouncer handles connection pooling")
    else:
        pool_kwargs = {
            "pool_pre_ping": True,
            "pool_size": cfg_pool_size,
            "max_overflow": cfg_overflow,
            "pool_recycle": int(_DBC.get("pool_recycle", 1800)),
            "pool_timeout": cfg_timeout,
            "pool_reset_on_return": _DBC.get("pool_reset_on_return", "commit"),
            "echo_pool": bool(_DBC.get("echo_pool", False)),
            "pool_use_lifo": bool(_DBC.get("pool_use_lifo", True)),
            "poolclass": QueuePool,
        }
    
    # Log the effective configuration
    if use_pgbouncer:
        logger.info("✅ SQLAlchemy pool config: NullPool (PgBouncer handles pooling)")
    else:
        logger.info(
            f"✅ SQLAlchemy pool config: size={pool_kwargs['pool_size']}, "
            f"overflow={pool_kwargs['max_overflow']}, timeout={pool_kwargs['pool_timeout']}, "
            f"recycle={pool_kwargs['pool_recycle']}"
        )

    # Initialize connect_args for all database types
    connect_args = {}
    # Add conservative Postgres-specific safeguards to avoid stuck connections/transactions
    if database_url.startswith("postgresql"):
        try:
            # Optional config source; fall back to sane defaults
            from app.db_config import DB_CONFIG as _DBC2  # type: ignore
        except Exception:
            _DBC2 = {}
        # Keep timeouts modest to fail fast instead of hanging the API
        statement_timeout_ms = int(str(_DBC2.get("statement_timeout_ms", os.getenv("DB_STATEMENT_TIMEOUT_MS", "15000"))))
        idle_xact_timeout_ms = int(str(_DBC2.get("idle_in_txn_timeout_ms", os.getenv("DB_IDLE_IN_TXN_TIMEOUT_MS", "15000"))))
        connect_timeout_s = int(str(_DBC2.get("connect_timeout", os.getenv("DB_CONNECT_TIMEOUT", "10"))))
        connect_args.update({
            "connect_timeout": connect_timeout_s,
            "application_name": os.getenv("DB_APPLICATION_NAME", "data_governance_backend"),
            # TCP keepalives to detect dead connections fast
            "keepalives": 1,
            "keepalives_idle": int(os.getenv("DB_KEEPALIVES_IDLE", "30")),
            "keepalives_interval": int(os.getenv("DB_KEEPALIVES_INTERVAL", "10")),
            "keepalives_count": int(os.getenv("DB_KEEPALIVES_COUNT", "5")),
        })
        # PgBouncer does not support the startup parameter "options"; only apply when connecting directly to Postgres
        if not use_pgbouncer:
            options_flags = f"-c statement_timeout={statement_timeout_ms} -c idle_in_transaction_session_timeout={idle_xact_timeout_ms}"
            connect_args["options"] = options_flags
    
    # Allow SQLITE for tests if provided
    if database_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        # SQLite does not support pooling the same way
        pool_kwargs = {"pool_pre_ping": True}

    # Log the pool configuration being used
    if use_pgbouncer:
        logger.info(f"Creating engine with NullPool (PgBouncer={use_pgbouncer})")
    else:
        logger.info(
            f"Creating engine with pool config: size={pool_kwargs['pool_size']}, max_overflow={pool_kwargs['max_overflow']}, pre_ping={pool_kwargs['pool_pre_ping']} (PgBouncer={use_pgbouncer})"
        )
    
    try:
        engine = create_engine(database_url, connect_args=connect_args, **pool_kwargs)

        # Apply per-connection server-side timeouts for Postgres when possible
        try:
            if database_url.startswith("postgresql"):
                # Reuse values computed above if available, otherwise fall back to env
                stm_ms = int(os.getenv("DB_STATEMENT_TIMEOUT_MS", "15000"))
                idle_ms = int(os.getenv("DB_IDLE_IN_TXN_TIMEOUT_MS", "15000"))

                @event.listens_for(engine, "connect")
                def _set_pg_timeouts(dbapi_connection, connection_record):
                    try:
                        with dbapi_connection.cursor() as cur:
                            cur.execute(f"SET statement_timeout = {stm_ms}")
                            cur.execute(f"SET idle_in_transaction_session_timeout = {idle_ms}")
                    except Exception:
                        # Non-fatal if PgBouncer/Postgres rejects; we still proceed
                        pass
        except Exception:
            pass
        
        # Verify the pool was created correctly
        if hasattr(engine, 'pool'):
            pool = engine.pool
            if use_pgbouncer:
                logger.info(f"Engine created successfully with NullPool (PgBouncer handles pooling)")
            else:
                logger.info(f"Engine created successfully. Pool size: {pool.size()}, Max overflow: {getattr(pool, '_max_overflow', 'N/A')}")
        
        return engine
    except Exception as e:
        logger.error(f"Failed to create engine: {e}")
        # Fallback to conservative enterprise configuration
        fallback_kwargs = {
            "pool_pre_ping": True,
            "pool_size": 15,
            "max_overflow": 5,
            "pool_timeout": 60,
            "poolclass": QueuePool,
        }
        logger.info("Using fallback engine configuration")
        return create_engine(database_url, connect_args=connect_args, **fallback_kwargs)


# Create engine and sessionmaker at import time to satisfy FastAPI dependencies
DATABASE_URL = _get_database_url()
# Engine state & hot-swap primitives for zero-downtime scaling
_engine_swap_lock = threading.Lock()
_engine_swap_in_progress = False

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

def scale_up_engine(new_pool_size: int, new_overflow: int, *, new_timeout: int | None = None) -> bool:
    """Hot-scale the engine pool by recreating engine with larger capacity and swapping globals atomically."""
    global engine, SessionLocal, _engine_swap_in_progress, _db_semaphore
    try:
        with _engine_swap_lock:
            _engine_swap_in_progress = True
            old_engine = engine
            # Build a larger engine
            enlarged = _create_engine(DATABASE_URL, pool_size_override=new_pool_size, max_overflow_override=new_overflow, pool_timeout_override=new_timeout)
            # Swap session factory
            new_session_local = sessionmaker(autocommit=False, autoflush=False, bind=enlarged, expire_on_commit=False)
            engine = enlarged
            SessionLocal = new_session_local
            # Resize semaphore to new capacity (pool_size + overflow or MAX_CONCURRENT_DB_REQUESTS whichever lower)
            try:
                target_cap = enlarged.pool.size() + enlarged.pool.overflow()
                from app.db_config import DB_CONFIG as _DBC
                max_req = int(_DBC.get("max_concurrent_requests", target_cap))
            except Exception:
                max_req = target_cap
            _db_semaphore = threading.BoundedSemaphore(value=max(1, min(max_req, target_cap)))
            # Dispose old engine after swap
            try:
                if hasattr(old_engine, 'dispose'):
                    old_engine.dispose()
            except Exception:
                pass
            logger.info(f"Engine scaled up successfully to size={enlarged.pool.size()}, overflow={enlarged.pool.overflow()}")
            return True
    except Exception as e:
        logger.error(f"Failed to scale up engine: {e}")
        return False
    finally:
        _engine_swap_in_progress = False

def _desired_pool_targets() -> tuple[int, int]:
    """Read desired (pool_size, max_overflow) from DB_CONFIG/env with sane defaults."""
    try:
        from app.db_config import DB_CONFIG as _DBC
        return int(_DBC.get("pool_size", 2)), int(_DBC.get("max_overflow", 1))
    except Exception:
        # Check if PgBouncer is being used and adjust pool sizes accordingly
        database_url = os.getenv("DATABASE_URL", "")
        is_using_pgbouncer = "pgbouncer" in database_url.lower() or "6432" in database_url
        
        if is_using_pgbouncer:
            # Use smaller pool sizes when PgBouncer is handling connection pooling
            default_pool_size = "5"
            default_max_overflow = "3"
        else:
            # Use normal pool sizes when connecting directly to PostgreSQL
            default_pool_size = "5"
            default_max_overflow = "3"
        
        return int(os.getenv("DB_POOL_SIZE", default_pool_size)), int(os.getenv("DB_MAX_OVERFLOW", default_max_overflow))

def ensure_pool_capacity() -> None:
    """Ensure current engine pool capacity matches desired targets; recreate if not."""
    try:
        # Check if PgBouncer is being used - skip pool capacity checks
        database_url = os.getenv("DATABASE_URL", "")
        is_using_pgbouncer = "pgbouncer" in database_url.lower() or "6432" in database_url
        
        if is_using_pgbouncer:
            logger.debug("PgBouncer detected - skipping pool capacity checks")
            return
            
        desired_size, desired_overflow = _desired_pool_targets()
        current_size = engine.pool.size() if hasattr(engine, 'pool') else 0
        current_overflow = engine.pool.overflow() if hasattr(engine, 'pool') else 0
        if current_size < desired_size or current_overflow < desired_overflow:
            logger.warning(
                f"Engine pool below desired capacity (have size={current_size}/overflow={current_overflow}, "
                f"want size={desired_size}/overflow={desired_overflow}). Recreating engine."
            )
            recreate_engine()
    except Exception as e:
        logger.error(f"ensure_pool_capacity failed: {e}")

# Remove the problematic import-time check that can corrupt the pool
# The health monitor will handle pool validation instead

# Add connection pool cleanup and recovery
def cleanup_connection_pool():
    """Clean up stale connections and reset pool if needed."""
    try:
        # Check if PgBouncer is being used - skip pool cleanup
        database_url = os.getenv("DATABASE_URL", "")
        is_using_pgbouncer = "pgbouncer" in database_url.lower() or "6432" in database_url
        
        if is_using_pgbouncer:
            logger.debug("PgBouncer detected - skipping connection pool cleanup")
            return
            
        if engine.pool.checkedout() > engine.pool.size() * 0.8:  # If 80% of connections are checked out
            logger.warning("Connection pool usage high, attempting cleanup...")
            engine.pool.dispose()  # Dispose and recreate pool
            logger.info("Connection pool cleaned up successfully")
    except Exception as e:
        logger.error(f"Error during connection pool cleanup: {e}")

def force_connection_cleanup():
    """Force cleanup of all connections and recreate the pool."""
    global engine, SessionLocal
    try:
        logger.warning("Forcing connection pool cleanup...")
        
        # Dispose the entire engine to close all connections
        if hasattr(engine, 'dispose'):
            engine.dispose()
        
        # Force garbage collection
        import gc
        gc.collect()
        
        # Recreate the engine
        engine = _create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
        
        logger.info("Connection pool force cleanup completed successfully")
        return True
    except Exception as e:
        logger.error(f"Error during force connection cleanup: {e}")
        return False

def get_connection_pool_status():
    """Get detailed connection pool status."""
    try:
        # Check if we're using PgBouncer
        database_url = os.getenv("DATABASE_URL", "")
        is_using_pgbouncer = "pgbouncer" in database_url.lower() or "6432" in database_url
        
        if is_using_pgbouncer:
            # With PgBouncer, return simplified status since PgBouncer handles pooling
            return {
                "pool_size": "managed_by_pgbouncer",
                "max_overflow": "managed_by_pgbouncer", 
                "total_capacity": "managed_by_pgbouncer",
                "checked_in": "managed_by_pgbouncer",
                "checked_out": "managed_by_pgbouncer",
                "utilization_percentage": "managed_by_pgbouncer",
                "available": "managed_by_pgbouncer",
                "pgbouncer_enabled": True
            }
        
        if not hasattr(engine, 'pool'):
            return {"error": "No pool available"}
        
        pool = engine.pool
        checked_in = pool.checkedin()
        checked_out = pool.checkedout()
        pool_size = pool.size()
        overflow = pool.overflow()
        total_capacity = pool_size + overflow
        utilization = (checked_out / total_capacity * 100) if total_capacity > 0 else 0
        
        return {
            "pool_size": pool_size,
            "max_overflow": overflow,
            "total_capacity": total_capacity,
            "checked_in": checked_in,
            "checked_out": checked_out,
            "utilization_percentage": round(utilization, 1),
            "available": total_capacity - checked_out,
            "pgbouncer_enabled": False
        }
    except Exception as e:
        return {"error": str(e)}

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
                    
                    # Check if PgBouncer is managing the pool
                    if status.get("pgbouncer_enabled", False):
                        logger.debug("PgBouncer is managing pooling - skipping auto cleanup")
                        return
                    
                    utilization_raw = status.get("utilization_percentage", 0)
                    
                    # Skip if utilization is a string (PgBouncer managed)
                    if isinstance(utilization_raw, str):
                        logger.debug("Pool status contains string values - skipping auto cleanup")
                        return
                    
                    utilization = float(utilization_raw) if isinstance(status, dict) else 0
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
    # Align semaphore ceiling to pool capacity + overflow to avoid hard saturation
    try:
        pool_cap = int(DB_CONFIG.get("pool_size", 2)) + int(DB_CONFIG.get("max_overflow", 1))
    except Exception:
        pool_cap = 20
    _db_semaphore = threading.BoundedSemaphore(value=max(1, min(_max_concurrent_db_requests, pool_cap)))
    _failure_window_seconds = DB_CONFIG["failure_window_seconds"]
    _failure_threshold = DB_CONFIG["failure_threshold"]
    _circuit_open_seconds = DB_CONFIG["circuit_open_seconds"]
    _recent_failures = []
    _circuit_open_until = 0.0
except ImportError:
    # Fallback values
    # Align default concurrency with pool capacity to avoid overloads
    try:
        # Attempt to read effective pool capacity
        from sqlalchemy import inspect as _insp  # noqa: F401
        # If engine not yet created, fallback below
        pool_capacity = 0
        try:
            pool_capacity = (engine.pool.size() if hasattr(engine, 'pool') else 0) + (engine.pool.overflow() if hasattr(engine, 'pool') else 0)
        except Exception:
            pool_capacity = 0
        default_cap = pool_capacity if pool_capacity > 0 else 10
    except Exception:
        default_cap = 10
    _max_concurrent_db_requests = int(os.getenv("MAX_CONCURRENT_DB_REQUESTS", str(default_cap)))
    _db_semaphore = threading.BoundedSemaphore(value=max(1, _max_concurrent_db_requests))
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
# Respect PgBouncer for async engine too (use NullPool to avoid double pooling)
_async_use_pgbouncer = (
    os.getenv("DB_USE_PGBOUNCER", "false").lower() == "true"
    or os.getenv("PGBOUNCER_POOL_MODE", "").lower() in {"transaction", "statement"}
    or "pgbouncer" in ASYNC_DATABASE_URL.lower()
)
if _async_use_pgbouncer:
    from sqlalchemy.pool import NullPool
    async_engine: AsyncEngine = create_async_engine(ASYNC_DATABASE_URL, poolclass=NullPool, pool_pre_ping=False)
else:
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



# Initialize connection pool properly
def initialize_connection_pool():
    """Initialize the connection pool with proper error handling."""
    global engine, SessionLocal
    
    try:
        # Test the connection pool
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Log pool status
        if hasattr(engine, 'pool'):
            pool = engine.pool
            # Check if PgBouncer is being used
            database_url = os.getenv("DATABASE_URL", "")
            is_using_pgbouncer = "pgbouncer" in database_url.lower() or "6432" in database_url
            
            if is_using_pgbouncer:
                logger.info(f"Connection pool initialized with NullPool (PgBouncer handles pooling)")
            else:
                logger.info(f"Connection pool initialized: size={pool.size()}, checked_in={pool.checkedin()}, checked_out={pool.checkedout()}")
        
        return True
    except Exception as e:
        logger.error(f"Connection pool initialization failed: {e}")
        return False

# Call initialization after engine creation
if 'engine' in globals():
    initialize_connection_pool()


def get_db() -> Generator[Session, None, None]:
    """
    🚀 ENHANCED FastAPI dependency that yields a per-request database session.
    
    Now powered by the Advanced Database Master Controller for ultimate performance!
    Provides intelligent connection pooling, circuit breaking, query optimization,
    and real-time monitoring.
    """
    # Use advanced system if available
    if ADVANCED_SYSTEM_AVAILABLE:
        try:
            controller = get_database_master_controller()
            priority = QueryPriority.NORMAL  # Default priority for web requests
            
            with controller.get_session(priority=priority) as session:
                yield session
            return
            
        except Exception as e:
            logger.error(f"Advanced system failed, falling back to legacy: {e}")
            # Fall through to legacy system
    
    # Legacy circuit breaker check
    if _circuit_is_open():
        logger.warning("Circuit breaker is open; rejecting DB request.")
        raise RuntimeError("database_unavailable")

    # Check if we're using PgBouncer (connection pooling is handled by PgBouncer)
    try:
        # Check if we're connecting through PgBouncer
        database_url = os.getenv("DATABASE_URL", "")
        is_using_pgbouncer = "pgbouncer" in database_url.lower() or "6432" in database_url
        
        if is_using_pgbouncer:
            # With PgBouncer, we don't need to check SQLAlchemy pool status
            # PgBouncer handles connection pooling for us
            logger.debug("Using PgBouncer - skipping SQLAlchemy pool status check")
        else:
            # Only check pool status when not using PgBouncer
            pool_size = engine.pool.size()
            overflow_cap = engine.pool.overflow()
            max_allowed = pool_size + overflow_cap
            current_usage = engine.pool.checkedout()
            
            # If pool is completely exhausted, try aggressive recovery
            if current_usage >= max_allowed:
                logger.warning(f"Connection pool exhausted: {current_usage}/{max_allowed}; attempting recovery...")
                
                # Try to force cleanup of stale connections
                try:
                    cleanup_connection_pool()
                    # Wait a bit for cleanup to take effect
                    time.sleep(0.1)
                    current_usage = engine.pool.checkedout()
                    logger.info(f"After cleanup: {current_usage}/{max_allowed}")
                except Exception as e:
                    logger.error(f"Cleanup failed: {e}")
                
                # If still exhausted, try to recreate engine
                if current_usage >= max_allowed:
                    logger.warning("Pool still exhausted after cleanup, attempting engine recreation...")
                    try:
                        if recreate_engine():
                            # Recalculate after recreation
                            pool_size = engine.pool.size()
                            overflow_cap = engine.pool.overflow()
                            max_allowed = pool_size + overflow_cap
                            current_usage = engine.pool.checkedout()
                            logger.info(f"After engine recreation: {current_usage}/{max_allowed}")
                        else:
                            logger.error("Engine recreation failed")
                    except Exception as e:
                        logger.error(f"Engine recreation error: {e}")
            
            # If we are slightly above pool_size but within overflow, sleep briefly to smooth bursts
            if current_usage >= pool_size and current_usage < max_allowed:
                time.sleep(0.05)  # 50ms backoff to reduce contention
            
            # Hard cap only when exceeding full capacity after recovery attempts
            if current_usage >= max_allowed:
                logger.warning(f"Connection pool at capacity: {current_usage}/{max_allowed}; applying backpressure.")
                # Short backoff and retry once before giving up
                time.sleep(0.1)
                current_usage = engine.pool.checkedout()
                if current_usage >= max_allowed:
                    raise RuntimeError("database_unavailable")
    
    except Exception as e:
        logger.error(f"Error checking pool status: {e}")
        # Continue with request if we can't check pool status

    # Try to acquire concurrency token with reasonable timeout
    try:
        from app.db_config import DB_CONFIG
        semaphore_timeout = DB_CONFIG["semaphore_timeout"]
    except ImportError:
        semaphore_timeout = float(os.getenv("DB_SEMAPHORE_TIMEOUT", "5.0"))  # Increased default
    
    acquired = _db_semaphore.acquire(timeout=semaphore_timeout)
    if not acquired:
        logger.warning(f"DB concurrency gate rejected a request after {semaphore_timeout}s timeout (too many concurrent DB-bound operations).")
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











def force_engine_recreation():
    """Force complete engine recreation by disposing and recreating."""
    global engine, SessionLocal
    try:
        # Dispose old engine completely
        if hasattr(engine, 'dispose'):
            engine.dispose()
        
        # Force garbage collection multiple times
        import gc
        for _ in range(3):
            gc.collect()

        # Wait a moment for cleanup
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


