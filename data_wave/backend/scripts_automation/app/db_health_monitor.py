"""
Database Health Monitor and Auto-Recovery System
Automatically detects and resolves database connection pool issues.
"""

import time
import threading
import logging
from typing import Dict, Any, Optional
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class DatabaseHealthMonitor:
    """Monitors database health and automatically recovers from issues."""
    
    def __init__(self):
        self.is_running = False
        self.monitor_thread = None
        self.last_health_check = 0
        self.health_check_interval = 30  # seconds
        self.recovery_attempts = 0
        self.max_recovery_attempts = 3
        self.recovery_cooldown = 300  # 5 minutes
        
    def start_monitoring(self):
        """Start the health monitoring in a background thread."""
        if self.is_running:
            logger.warning("Health monitor is already running")
            return
            
        self.is_running = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        logger.info("Database health monitor started")
        
    def stop_monitoring(self):
        """Stop the health monitoring."""
        self.is_running = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        logger.info("Database health monitor stopped")
        
    def _monitor_loop(self):
        """Main monitoring loop."""
        while self.is_running:
            try:
                self._check_health()
                time.sleep(self.health_check_interval)
            except Exception as e:
                logger.error(f"Health monitor error: {e}")
                time.sleep(10)  # Wait before retrying
                
    def _check_health(self):
        """Check database health and trigger recovery if needed."""
        try:
            from app.db_session import get_connection_pool_status, force_connection_cleanup
            from app.db_config import DB_CONFIG
            
            status = get_connection_pool_status()
            if "error" in status:
                logger.warning(f"Health check failed: {status['error']}")
                return
                
            utilization = status.get("utilization_percentage", 0)
            checked_out = status.get("checked_out", 0)
            total_connections = status.get("total_connections", 0)
            
            # Log health status
            logger.debug(f"DB Health: {utilization:.1f}% utilization, {checked_out}/{total_connections} connections")
            
            # Check for critical issues
            if utilization >= 95:
                logger.critical(f"CRITICAL: Database pool at {utilization:.1f}% utilization!")
                self._trigger_emergency_recovery()
            elif utilization >= 80:
                logger.warning(f"WARNING: Database pool at {utilization:.1f}% utilization")
                self._trigger_preventive_recovery()
            elif checked_out >= total_connections * 0.9:
                logger.warning(f"WARNING: {checked_out}/{total_connections} connections in use")
                self._trigger_preventive_recovery()
                
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            
    def _trigger_emergency_recovery(self):
        """Trigger emergency recovery when pool is critically full."""
        if self._can_attempt_recovery():
            logger.critical("🚨 EMERGENCY: Triggering database connection pool recovery")
            try:
                from app.db_session import force_connection_cleanup
                result = force_connection_cleanup()
                logger.info(f"Emergency recovery completed: {result}")
                self.recovery_attempts += 1
                self.last_health_check = time.time()
            except Exception as e:
                logger.error(f"Emergency recovery failed: {e}")
                
    def _trigger_preventive_recovery(self):
        """Trigger preventive recovery when pool is getting full."""
        if self._can_attempt_recovery():
            logger.warning("⚠️  PREVENTIVE: Triggering database connection pool cleanup")
            try:
                from app.db_session import cleanup_connection_pool
                cleanup_connection_pool()
                logger.info("Preventive recovery completed")
                self.recovery_attempts += 1
                self.last_health_check = time.time()
            except Exception as e:
                logger.error(f"Preventive recovery failed: {e}")
                
    def _can_attempt_recovery(self) -> bool:
        """Check if recovery can be attempted."""
        now = time.time()
        
        # Check cooldown period
        if now - self.last_health_check < self.recovery_cooldown:
            return False
            
        # Check max attempts
        if self.recovery_attempts >= self.max_recovery_attempts:
            logger.warning("Max recovery attempts reached, waiting for cooldown")
            return False
            
        return True
        
    def reset_recovery_counters(self):
        """Reset recovery attempt counters."""
        self.recovery_attempts = 0
        self.last_health_check = 0
        logger.info("Recovery counters reset")
        
    def get_health_status(self) -> Dict[str, Any]:
        """Get current health status."""
        try:
            from app.db_session import get_connection_pool_status
            pool_status = get_connection_pool_status()
            
            return {
                "monitor_running": self.is_running,
                "last_health_check": self.last_health_check,
                "recovery_attempts": self.recovery_attempts,
                "max_recovery_attempts": self.max_recovery_attempts,
                "pool_status": pool_status,
                "health_status": "healthy" if pool_status.get("utilization_percentage", 0) < 80 else "warning"
            }
        except Exception as e:
            return {
                "error": str(e),
                "monitor_running": self.is_running
            }

# Global instance
health_monitor = DatabaseHealthMonitor()

# Auto-start monitoring when module is imported
def start_health_monitoring():
    """Start health monitoring if not already running."""
    if not health_monitor.is_running:
        health_monitor.start_monitoring()

# Start monitoring automatically
start_health_monitoring()

# Export the monitor instance
__all__ = ["DatabaseHealthMonitor", "health_monitor", "start_health_monitoring"]
