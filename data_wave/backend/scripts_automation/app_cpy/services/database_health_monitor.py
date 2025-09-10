"""
PRODUCTION-CRITICAL: Advanced Database Health Monitoring Service
===============================================================

This service provides continuous monitoring and validation of database integrity
in production environments, ensuring the system remains production-ready at all times.

Features:
- Real-time database integrity validation
- Foreign key relationship monitoring
- Constraint validation
- Performance monitoring
- Automated repair capabilities
- Health status reporting
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from sqlalchemy import text, inspect
from sqlalchemy.exc import OperationalError, ProgrammingError
from app.db_session import engine, validate_database_integrity, repair_database_integrity

logger = logging.getLogger(__name__)

class DatabaseHealthMonitor:
    """PRODUCTION-CRITICAL: Advanced database health monitoring and maintenance service"""
    
    def __init__(self):
        self.health_status = "UNKNOWN"
        self.last_check = None
        self.check_interval = 300  # 5 minutes
        self.health_history = []
        self.error_count = 0
        self.repair_count = 0
        self.is_monitoring = False
        self.monitoring_task = None
        
        # Health thresholds
        self.max_errors = 10
        self.max_repair_attempts = 5
        self.health_score = 100.0
        
        logger.info("🔍 PRODUCTION-CRITICAL: Database Health Monitor initialized")
    
    async def start_monitoring(self):
        """Start continuous database health monitoring"""
        if self.is_monitoring:
            logger.warning("⚠️ PRODUCTION-CRITICAL: Database monitoring already active")
            return
        
        self.is_monitoring = True
        logger.info("🚀 PRODUCTION-CRITICAL: Starting continuous database health monitoring...")
        
        # Start monitoring in background
        self.monitoring_task = asyncio.create_task(self._monitoring_loop())
        
    async def stop_monitoring(self):
        """Stop continuous database health monitoring"""
        if not self.is_monitoring:
            return
        
        self.is_monitoring = False
        if self.monitoring_task:
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                pass
        
        logger.info("⏹️ PRODUCTION-CRITICAL: Database health monitoring stopped")
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.is_monitoring:
            try:
                await self._perform_health_check()
                await asyncio.sleep(self.check_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"❌ PRODUCTION-CRITICAL: Monitoring loop error: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying
    
    async def _perform_health_check(self):
        """Perform comprehensive database health check"""
        try:
            start_time = time.time()
            logger.info("🔍 PRODUCTION-CRITICAL: Performing scheduled database health check...")
            
            # Perform integrity validation
            integrity_valid, fk_fixes, constraint_errors = validate_database_integrity()
            
            # Calculate health metrics
            total_issues = len(fk_fixes) + len(constraint_errors)
            check_duration = time.time() - start_time
            
            # Update health status
            if integrity_valid:
                self.health_status = "HEALTHY"
                self.health_score = 100.0
                logger.info("✅ PRODUCTION-CRITICAL: Database health check passed - system is healthy")
            else:
                self.health_status = "DEGRADED"
                self.health_score = max(0.0, 100.0 - (total_issues * 10))
                self.error_count += 1
                
                logger.warning(f"⚠️ PRODUCTION-CRITICAL: Database health check failed - {total_issues} issues found")
                logger.warning(f"⚠️ PRODUCTION-CRITICAL: Health score: {self.health_score:.1f}")
                
                # Attempt automatic repair if within limits
                if self.repair_count < self.max_repair_attempts:
                    await self._attempt_repair(fk_fixes, constraint_errors)
                else:
                    logger.error("🚨 PRODUCTION-CRITICAL: Maximum repair attempts reached - manual intervention required!")
            
            # Record health check
            health_record = {
                'timestamp': datetime.utcnow(),
                'status': self.health_status,
                'health_score': self.health_score,
                'total_issues': total_issues,
                'fk_issues': len(fk_fixes),
                'constraint_issues': len(constraint_errors),
                'check_duration': check_duration,
                'error_count': self.error_count,
                'repair_count': self.repair_count
            }
            
            self.health_history.append(health_record)
            self.last_check = datetime.utcnow()
            
            # Keep only last 100 health records
            if len(self.health_history) > 100:
                self.health_history = self.health_history[-100:]
            
            # Log health summary
            logger.info(f"📊 PRODUCTION-CRITICAL: Health check completed in {check_duration:.2f}s")
            logger.info(f"📊 PRODUCTION-CRITICAL: Current health score: {self.health_score:.1f}")
            logger.info(f"📊 PRODUCTION-CRITICAL: Total errors: {self.error_count}, Repairs: {self.repair_count}")
            
        except Exception as e:
            logger.error(f"❌ PRODUCTION-CRITICAL: Health check failed: {e}")
            self.health_status = "ERROR"
            self.health_score = 0.0
            self.error_count += 1
    
    async def _attempt_repair(self, fk_fixes: List, constraint_errors: List):
        """Attempt to repair database issues automatically"""
        try:
            logger.info("🔧 PRODUCTION-CRITICAL: Attempting automatic database repair...")
            
            repairs_made, repair_errors = repair_database_integrity(fk_fixes, constraint_errors)
            
            if repair_errors:
                logger.error(f"❌ PRODUCTION-CRITICAL: {len(repair_errors)} repair errors occurred")
                for error in repair_errors:
                    logger.error(f"   ❌ {error}")
            else:
                logger.info("✅ PRODUCTION-CRITICAL: Automatic repair completed successfully")
                self.repair_count += 1
                
                # Re-validate after repair
                logger.info("🔍 PRODUCTION-CRITICAL: Re-validating database after repair...")
                integrity_valid, _, _ = validate_database_integrity()
                
                if integrity_valid:
                    logger.info("✅ PRODUCTION-CRITICAL: Database integrity restored after repair!")
                    self.health_status = "HEALTHY"
                    self.health_score = 100.0
                else:
                    logger.warning("⚠️ PRODUCTION-CRITICAL: Database integrity still compromised after repair")
                    
        except Exception as e:
            logger.error(f"❌ PRODUCTION-CRITICAL: Automatic repair failed: {e}")
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get current database health status"""
        return {
            'status': self.health_status,
            'health_score': self.health_score,
            'last_check': self.last_check.isoformat() if self.last_check else None,
            'error_count': self.error_count,
            'repair_count': self.repair_count,
            'is_monitoring': self.is_monitoring,
            'total_checks': len(self.health_history)
        }
    
    def get_health_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get database health history"""
        return self.health_history[-limit:] if self.health_history else []
    
    def get_detailed_health_report(self) -> Dict[str, Any]:
        """Get comprehensive health report"""
        if not self.health_history:
            return {'error': 'No health data available'}
        
        recent_records = self.health_history[-10:]  # Last 10 checks
        
        # Calculate trends
        avg_health_score = sum(r['health_score'] for r in recent_records) / len(recent_records)
        avg_check_duration = sum(r['check_duration'] for r in recent_records) / len(recent_records)
        
        # Status distribution
        status_counts = {}
        for record in recent_records:
            status = record['status']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            'current_status': self.health_status,
            'current_health_score': self.health_score,
            'average_health_score': avg_health_score,
            'average_check_duration': avg_check_duration,
            'status_distribution': status_counts,
            'total_errors': self.error_count,
            'total_repairs': self.repair_count,
            'monitoring_active': self.is_monitoring,
            'last_check': self.last_check.isoformat() if self.last_check else None,
            'recent_checks': len(recent_records)
        }
    
    def reset_health_metrics(self):
        """Reset health monitoring metrics"""
        self.health_status = "UNKNOWN"
        self.health_score = 100.0
        self.error_count = 0
        self.repair_count = 0
        self.health_history.clear()
        self.last_check = None
        
        logger.info("🔄 PRODUCTION-CRITICAL: Health monitoring metrics reset")
    
    async def force_health_check(self):
        """Force immediate health check"""
        logger.info("🔍 PRODUCTION-CRITICAL: Forcing immediate health check...")
        await self._perform_health_check()
    
    async def emergency_repair(self):
        """Perform emergency database repair"""
        logger.warning("🚨 PRODUCTION-CRITICAL: Initiating emergency database repair...")
        
        try:
            # Force integrity validation
            integrity_valid, fk_fixes, constraint_errors = validate_database_integrity()
            
            if not integrity_valid:
                # Attempt comprehensive repair
                repairs_made, repair_errors = repair_database_integrity(fk_fixes, constraint_errors)
                
                if repair_errors:
                    logger.error(f"❌ PRODUCTION-CRITICAL: Emergency repair failed - {len(repair_errors)} errors")
                    return False
                else:
                    logger.info("✅ PRODUCTION-CRITICAL: Emergency repair completed successfully")
                    return True
            else:
                logger.info("✅ PRODUCTION-CRITICAL: No repair needed - database is healthy")
                return True
                
        except Exception as e:
            logger.error(f"❌ PRODUCTION-CRITICAL: Emergency repair failed: {e}")
            return False

# Global instance
db_health_monitor = DatabaseHealthMonitor()

async def start_database_monitoring():
    """Start the database health monitoring service"""
    await db_health_monitor.start_monitoring()

async def stop_database_monitoring():
    """Stop the database health monitoring service"""
    await db_health_monitor.stop_monitoring()

def get_database_health_status():
    """Get current database health status"""
    return db_health_monitor.get_health_status()

def get_database_health_report():
    """Get comprehensive database health report"""
    return db_health_monitor.get_detailed_health_report()

async def perform_emergency_repair():
    """Perform emergency database repair"""
    return await db_health_monitor.emergency_repair()
