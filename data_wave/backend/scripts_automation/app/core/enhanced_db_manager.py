# ============================================================================
# ENHANCED DATABASE CONNECTION MANAGER - FRONTEND-BACKEND INTEGRATION
# ============================================================================

import asyncio
import logging
import time
import threading
from typing import Dict, Any, Optional, Callable
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import OperationalError, DisconnectionError

logger = logging.getLogger(__name__)

class EnhancedDatabaseManager:
    """
    Enhanced database connection manager that integrates with frontend API throttling
    to prevent connection pool exhaustion and provide intelligent connection management.
    """
    
    def __init__(self, database_url: str, config: Dict[str, Any]):
        self.database_url = database_url
        self.config = config
        self.engine: Optional[Engine] = None
        self.session_factory = None
        
        # Connection pool state
        self.connection_pool_healthy = True
        self.last_pool_cleanup = time.time()
        self.connection_errors = []
        self.health_callbacks: list[Callable] = []
        
        # Frontend integration state
        self.frontend_emergency_mode = False
        self.frontend_throttling_level = 'normal'
        self.last_frontend_sync = time.time()
        
        # Initialize the engine
        self._create_engine()
        self._setup_event_handlers()
        
        # Start background monitoring
        self._start_background_monitoring()
        
        logger.info("Enhanced Database Manager initialized")
    
    @classmethod
    def _create_with_existing_engine(cls, engine: Engine, config: Dict[str, Any]) -> 'EnhancedDatabaseManager':
        """Create manager instance using existing engine."""
        instance = cls.__new__(cls)
        instance.database_url = str(engine.url)
        instance.config = config
        instance.engine = engine
        instance.session_factory = None
        
        # Connection pool state
        instance.connection_pool_healthy = True
        instance.last_pool_cleanup = time.time()
        instance.connection_errors = []
        instance.health_callbacks = []
        
        # Frontend integration state
        instance.frontend_emergency_mode = False
        instance.frontend_throttling_level = 'normal'
        instance.last_frontend_sync = time.time()
        
        # Setup event handlers and monitoring
        instance._setup_event_handlers()
        instance._start_background_monitoring()
        
        logger.info("Enhanced Database Manager initialized with existing engine")
        return instance
    
    def _create_engine(self):
        """Create database engine with optimized connection pooling."""
        try:
            # Enhanced pool configuration
            pool_config = {
                'pool_size': self.config.get('pool_size', 20),
                'max_overflow': self.config.get('max_overflow', 10),
                'pool_timeout': self.config.get('pool_timeout', 30),
                'pool_recycle': self.config.get('pool_recycle', 1800),
                'pool_pre_ping': True,
                'pool_reset_on_return': 'commit',
                'pool_use_lifo': True,
                'echo_pool': self.config.get('echo_pool', False),
            }
            
            self.engine = create_engine(
                self.database_url,
                **pool_config,
                connect_args={
                    'connect_timeout': 10,
                    'application_name': 'data_governance_backend'
                }
            )
            
            self.session_factory = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine,
                expire_on_commit=False
            )
            
            logger.info(f"Database engine created with pool config: {pool_config}")
            
        except Exception as e:
            logger.error(f"Failed to create database engine: {e}")
            raise
    
    def _setup_event_handlers(self):
        """Setup SQLAlchemy event handlers for connection monitoring."""
        if not self.engine:
            return
        
        @event.listens_for(self.engine, "connect")
        def receive_connect(dbapi_connection, connection_record):
            logger.debug("New database connection established")
        
        @event.listens_for(self.engine, "checkout")
        def receive_checkout(dbapi_connection, connection_record, connection_proxy):
            logger.debug("Database connection checked out")
        
        @event.listens_for(self.engine, "checkin")
        def receive_checkin(dbapi_connection, connection_record):
            logger.debug("Database connection checked in")
        
        @event.listens_for(self.engine, "disconnect")
        def receive_disconnect(dbapi_connection, connection_record):
            logger.warning("Database connection disconnected")
    
    def _start_background_monitoring(self):
        """Start background monitoring threads."""
        # Connection pool health monitor
        self.pool_monitor_thread = threading.Thread(
            target=self._pool_health_monitor,
            daemon=True,
            name="DB-Pool-Monitor"
        )
        self.pool_monitor_thread.start()
        
        # Frontend sync monitor
        self.frontend_sync_thread = threading.Thread(
            target=self._frontend_sync_monitor,
            daemon=True,
            name="Frontend-Sync-Monitor"
        )
        self.frontend_sync_thread.start()
        
        logger.info("Background monitoring threads started")
    
    def _pool_health_monitor(self):
        """Monitor connection pool health and perform cleanup."""
        while True:
            try:
                time.sleep(30)  # Check every 30 seconds
                self._check_pool_health()
                self._perform_pool_cleanup()
            except Exception as e:
                logger.error(f"Pool health monitor error: {e}")
    
    def _check_pool_health(self):
        """Check connection pool health status."""
        if not self.engine or not hasattr(self.engine, 'pool'):
            return
        
        try:
            pool = self.engine.pool
            checked_out = pool.checkedout()
            pool_size = pool.size()
            overflow = pool.overflow()
            total_capacity = pool_size + overflow
            
            # Calculate usage percentage
            usage_percentage = (checked_out / total_capacity * 100) if total_capacity > 0 else 0
            
            # Determine health status
            if usage_percentage >= 90:
                health_status = 'critical'
                self.connection_pool_healthy = False
                logger.critical(f"🚨 CONNECTION POOL CRITICAL: {usage_percentage:.1f}% usage ({checked_out}/{total_capacity})")
            elif usage_percentage >= 80:
                health_status = 'degraded'
                self.connection_pool_healthy = False
                logger.warning(f"⚠️ CONNECTION POOL DEGRADED: {usage_percentage:.1f}% usage ({checked_out}/{total_capacity})")
            else:
                health_status = 'healthy'
                self.connection_pool_healthy = True
                logger.debug(f"✅ Connection pool healthy: {usage_percentage:.1f}% usage ({checked_out}/{total_capacity})")
            
            # Update frontend throttling based on pool health
            self._update_frontend_throttling(health_status, usage_percentage)
            
        except Exception as e:
            logger.error(f"Error checking pool health: {e}")
    
    def _perform_pool_cleanup(self):
        """Perform connection pool cleanup if needed."""
        if not self.engine or not hasattr(self.engine, 'pool'):
            return
        
        try:
            pool = self.engine.pool
            checked_out = pool.checkedout()
            pool_size = pool.size()
            
            # Force cleanup if usage is very high
            if checked_out >= pool_size * 0.9:
                logger.warning("Forcing connection pool cleanup due to high usage")
                pool.dispose()
                self.last_pool_cleanup = time.time()
                
        except Exception as e:
            logger.error(f"Error during pool cleanup: {e}")
    
    def _update_frontend_throttling(self, health_status: str, usage_percentage: float):
        """Update frontend throttling configuration based on database health."""
        try:
            if health_status == 'critical':
                self.frontend_emergency_mode = True
                self.frontend_throttling_level = 'emergency'
                logger.critical("🚨 FRONTEND EMERGENCY MODE: Database connection pool critical")
            elif health_status == 'degraded':
                self.frontend_emergency_mode = False
                self.frontend_throttling_level = 'aggressive'
                logger.warning("⚠️ FRONTEND AGGRESSIVE THROTTLING: Database connection pool degraded")
            else:
                self.frontend_emergency_mode = False
                self.frontend_throttling_level = 'normal'
                logger.debug("✅ Frontend throttling normal: Database connection pool healthy")
            
            # Notify health callbacks
            self._notify_health_callbacks(health_status, usage_percentage)
            
        except Exception as e:
            logger.error(f"Error updating frontend throttling: {e}")
    
    def _notify_health_callbacks(self, health_status: str, usage_percentage: float):
        """Notify registered health callbacks."""
        for callback in self.health_callbacks:
            try:
                callback(health_status, usage_percentage)
            except Exception as e:
                logger.error(f"Error in health callback: {e}")
    
    def _frontend_sync_monitor(self):
        """Monitor frontend synchronization and health status."""
        while True:
            try:
                time.sleep(60)  # Sync every minute
                self._sync_with_frontend()
            except Exception as e:
                logger.error(f"Frontend sync monitor error: {e}")
    
    def _sync_with_frontend(self):
        """Synchronize database health status with frontend."""
        try:
            # Update frontend configuration endpoint
            self._update_frontend_config()
            self.last_frontend_sync = time.time()
            
        except Exception as e:
            logger.error(f"Error syncing with frontend: {e}")
    
    def _update_frontend_config(self):
        """Update frontend configuration based on current database health."""
        try:
            # This would typically update a shared configuration or endpoint
            # that the frontend can query to adjust its throttling behavior
            logger.debug("Frontend configuration updated based on database health")
            
        except Exception as e:
            logger.error(f"Error updating frontend config: {e}")
    
    def get_session(self) -> Session:
        """Get a database session with health checks."""
        if not self.connection_pool_healthy:
            logger.warning("Database connection pool unhealthy, attempting to get session anyway")
        
        if not self.session_factory:
            raise RuntimeError("Database session factory not initialized")
        
        return self.session_factory()
    
    @asynccontextmanager
    async def get_session_async(self):
        """Get an async database session with health checks."""
        # For now, return a sync session wrapped in async context
        # In a real implementation, you'd use async SQLAlchemy
        session = self.get_session()
        try:
            yield session
        finally:
            session.close()
    
    def get_connection_pool_status(self) -> Dict[str, Any]:
        """Get current connection pool status."""
        if not self.engine or not hasattr(self.engine, 'pool'):
            return {"error": "Engine not available"}
        
        try:
            pool = self.engine.pool
            checked_out = pool.checkedout()
            pool_size = pool.size()
            overflow = pool.overflow()
            total_capacity = pool_size + overflow
            usage_percentage = (checked_out / total_capacity * 100) if total_capacity > 0 else 0
            
            return {
                "pool_size": pool_size,
                "max_overflow": overflow,
                "total_capacity": total_capacity,
                "checked_out": checked_out,
                "checked_in": pool_size - checked_out,
                "usage_percentage": usage_percentage,
                "pool_healthy": self.connection_pool_healthy,
                "frontend_emergency_mode": self.frontend_emergency_mode,
                "frontend_throttling_level": self.frontend_throttling_level,
                "last_cleanup": self.last_pool_cleanup,
                "last_frontend_sync": self.last_frontend_sync
            }
            
        except Exception as e:
            logger.error(f"Error getting pool status: {e}")
            return {"error": str(e)}
    
    def register_health_callback(self, callback: Callable):
        """Register a callback for database health updates."""
        self.health_callbacks.append(callback)
        logger.info(f"Health callback registered: {callback}")
    
    def force_connection_cleanup(self) -> bool:
        """Force immediate connection pool cleanup."""
        try:
            if self.engine and hasattr(self.engine, 'pool'):
                self.engine.pool.dispose()
                self.last_pool_cleanup = time.time()
                logger.info("Forced connection pool cleanup completed")
                return True
        except Exception as e:
            logger.error(f"Error during forced cleanup: {e}")
            return False
        return False
    
    def shutdown(self):
        """Shutdown the database manager."""
        try:
            if self.engine:
                self.engine.dispose()
                logger.info("Database engine disposed")
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

# Global instance
_enhanced_db_manager: Optional[EnhancedDatabaseManager] = None

def get_enhanced_db_manager() -> EnhancedDatabaseManager:
    """Get the global enhanced database manager instance."""
    global _enhanced_db_manager
    if _enhanced_db_manager is None:
        from app.db_config import DB_CONFIG
        from app.db_session import engine  # Use existing engine
        
        # Create manager with existing engine
        _enhanced_db_manager = EnhancedDatabaseManager._create_with_existing_engine(engine, DB_CONFIG)
    
    return _enhanced_db_manager

def shutdown_enhanced_db_manager():
    """Shutdown the global enhanced database manager."""
    global _enhanced_db_manager
    if _enhanced_db_manager:
        _enhanced_db_manager.shutdown()
        _enhanced_db_manager = None
