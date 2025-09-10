# ============================================================================
# DATABASE HEALTH MONITOR - BACKEND CONNECTION POOL MONITORING
# ============================================================================

import asyncio
import logging
import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.pool import QueuePool

logger = logging.getLogger(__name__)

class DatabaseHealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    CRITICAL = "critical"

@dataclass
class DatabaseHealthMetrics:
    status: DatabaseHealthStatus
    connection_pool_size: int
    active_connections: int
    overflow_connections: int
    checked_out_connections: int
    checked_in_connections: int
    invalid_connections: int
    connection_errors: int
    response_time_avg: float
    response_time_max: float
    last_check: datetime
    error_rate: float
    recommendations: list[str]

class DatabaseHealthMonitor:
    """
    Monitors database connection pool health and provides real-time metrics
    to help prevent connection pool exhaustion.
    """
    
    def __init__(self, engine):
        self.engine = engine
        self.metrics_history: list[DatabaseHealthMetrics] = []
        self.max_history_size = 100
        self.health_thresholds = {
            'critical_connection_usage': 0.9,  # 90% of pool capacity
            'degraded_connection_usage': 0.7,  # 70% of pool capacity
            'critical_error_rate': 0.3,        # 30% error rate
            'degraded_error_rate': 0.1,       # 10% error rate
            'critical_response_time': 5000,    # 5 seconds
            'degraded_response_time': 2000,    # 2 seconds
        }
        
        # Performance tracking
        self.response_times: list[float] = []
        self.error_counts: list[datetime] = []
        self.last_health_check = None
        
        # Health status
        self.current_status = DatabaseHealthStatus.HEALTHY
        self.status_changes: list[tuple[datetime, DatabaseHealthStatus, DatabaseHealthStatus]] = []
        
        logger.info("Database Health Monitor initialized")
    
    async def start_monitoring(self, interval_seconds: int = 30):
        """
        Start continuous database health monitoring.
        """
        logger.info(f"Starting database health monitoring (interval: {interval_seconds}s)")
        
        while True:
            try:
                await self.check_database_health()
                await asyncio.sleep(interval_seconds)
            except Exception as e:
                logger.error(f"Error in database health monitoring: {e}")
                await asyncio.sleep(interval_seconds)
    
    async def check_database_health(self) -> DatabaseHealthMetrics:
        """
        Perform a comprehensive database health check.
        """
        start_time = time.time()
        
        try:
            # Get connection pool metrics
            pool_metrics = self._get_pool_metrics()
            
            # Test database connectivity and performance
            performance_metrics = await self._test_database_performance()
            
            # Calculate error rates
            error_metrics = self._calculate_error_metrics()
            
            # Determine overall health status
            status = self._determine_health_status(pool_metrics, performance_metrics, error_metrics)
            
            # Create health metrics
            metrics = DatabaseHealthMetrics(
                status=status,
                connection_pool_size=pool_metrics['pool_size'],
                active_connections=pool_metrics['active_connections'],
                overflow_connections=pool_metrics['overflow_connections'],
                checked_out_connections=pool_metrics['checked_out_connections'],
                checked_in_connections=pool_metrics['checked_in_connections'],
                invalid_connections=pool_metrics['invalid_connections'],
                connection_errors=len(self.error_counts),
                response_time_avg=performance_metrics['avg_response_time'],
                response_time_max=performance_metrics['max_response_time'],
                last_check=datetime.now(),
                error_rate=error_metrics['error_rate'],
                recommendations=self._generate_recommendations(pool_metrics, performance_metrics, error_metrics)
            )
            
            # Update status if changed
            if status != self.current_status:
                old_status = self.current_status
                self.current_status = status
                self.status_changes.append((datetime.now(), old_status, status))
                
                logger.warning(f"Database health status changed: {old_status.value} -> {status.value}")
                
                # Log detailed status change
                if status == DatabaseHealthStatus.CRITICAL:
                    logger.critical("🚨 DATABASE HEALTH CRITICAL - Immediate attention required!")
                    logger.critical(f"Pool usage: {pool_metrics['usage_percentage']:.1f}%")
                    logger.critical(f"Error rate: {error_metrics['error_rate']:.1f}%")
                    logger.critical(f"Response time: {performance_metrics['avg_response_time']:.0f}ms")
                
                elif status == DatabaseHealthStatus.DEGRADED:
                    logger.warning("⚠️ DATABASE HEALTH DEGRADED - Performance issues detected")
                    logger.warning(f"Pool usage: {pool_metrics['usage_percentage']:.1f}%")
                    logger.warning(f"Error rate: {error_metrics['error_rate']:.1f}%")
            
            # Store metrics
            self.metrics_history.append(metrics)
            if len(self.metrics_history) > self.max_history_size:
                self.metrics_history.pop(0)
            
            self.last_health_check = datetime.now()
            
            # Log health summary
            logger.info(f"Database health check completed: {status.value} "
                       f"(Pool: {pool_metrics['usage_percentage']:.1f}%, "
                       f"Errors: {error_metrics['error_rate']:.1f}%, "
                       f"Response: {performance_metrics['avg_response_time']:.0f}ms)")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            # Return critical status on failure
            return DatabaseHealthMetrics(
                status=DatabaseHealthStatus.CRITICAL,
                connection_pool_size=0,
                active_connections=0,
                overflow_connections=0,
                checked_out_connections=0,
                checked_in_connections=0,
                invalid_connections=0,
                connection_errors=0,
                response_time_avg=0,
                response_time_max=0,
                last_check=datetime.now(),
                error_rate=1.0,
                recommendations=["Database health check failed - investigate immediately"]
            )
    
    def _get_pool_metrics(self) -> Dict[str, Any]:
        """
        Extract metrics from SQLAlchemy connection pool.
        """
        pool = self.engine.pool
        
        if not isinstance(pool, QueuePool):
            return {
                'pool_size': 0,
                'active_connections': 0,
                'overflow_connections': 0,
                'checked_out_connections': 0,
                'checked_in_connections': 0,
                'invalid_connections': 0,
                'usage_percentage': 0.0
            }
        
        # Get pool statistics
        pool_size = pool.size()
        active_connections = pool.checkedout()
        overflow_connections = pool.overflow()
        checked_out_connections = pool.checkedout()
        checked_in_connections = pool.size() - pool.checkedout()
        invalid_connections = pool.invalid()
        
        # Calculate usage percentage
        total_capacity = pool_size + overflow_connections
        usage_percentage = (active_connections / total_capacity * 100) if total_capacity > 0 else 0
        
        return {
            'pool_size': pool_size,
            'active_connections': active_connections,
            'overflow_connections': overflow_connections,
            'checked_out_connections': checked_out_connections,
            'checked_in_connections': checked_in_connections,
            'invalid_connections': invalid_connections,
            'usage_percentage': usage_percentage
        }
    
    async def _test_database_performance(self) -> Dict[str, float]:
        """
        Test database performance with simple queries.
        """
        response_times = []
        
        try:
            # Test 1: Simple SELECT
            start_time = time.time()
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
            response_times.append((time.time() - start_time) * 1000)
            
            # Test 2: Connection pool info
            start_time = time.time()
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT version()"))
                result.fetchone()
            response_times.append((time.time() - start_time) * 1000)
            
            # Test 3: Simple count query (if possible)
            try:
                start_time = time.time()
                with self.engine.connect() as conn:
                    # Try to get a simple count from a system table
                    result = conn.execute(text("SELECT COUNT(*) FROM information_schema.tables"))
                    result.fetchone()
                response_times.append((time.time() - start_time) * 1000)
            except:
                pass  # Skip if this fails
            
        except Exception as e:
            logger.warning(f"Database performance test failed: {e}")
            response_times = [5000]  # Default to 5 seconds on failure
        
        # Calculate metrics
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        max_response_time = max(response_times) if response_times else 0
        
        # Store response times for trend analysis
        self.response_times.append(avg_response_time)
        if len(self.response_times) > 50:  # Keep last 50 measurements
            self.response_times.pop(0)
        
        return {
            'avg_response_time': avg_response_time,
            'max_response_time': max_response_time,
            'test_count': len(response_times)
        }
    
    def _calculate_error_metrics(self) -> Dict[str, float]:
        """
        Calculate error rates and patterns.
        """
        now = datetime.now()
        
        # Clean old error counts (older than 1 hour)
        self.error_counts = [t for t in self.error_counts if now - t < timedelta(hours=1)]
        
        # Calculate error rate based on recent errors
        recent_errors = len([t for t in self.error_counts if now - t < timedelta(minutes=5)])
        total_checks = 12  # Assuming 5-minute intervals, 12 checks per hour
        
        error_rate = (recent_errors / total_checks) if total_checks > 0 else 0
        
        return {
            'error_rate': error_rate,
            'recent_errors': recent_errors,
            'total_checks': total_checks
        }
    
    def _determine_health_status(self, pool_metrics: Dict, performance_metrics: Dict, error_metrics: Dict) -> DatabaseHealthStatus:
        """
        Determine overall database health status based on multiple factors.
        """
        # Check connection pool usage
        pool_usage = pool_metrics['usage_percentage'] / 100
        
        # Check error rate
        error_rate = error_metrics['error_rate']
        
        # Check response time (convert to seconds)
        avg_response_time = performance_metrics['avg_response_time'] / 1000
        
        # Determine status based on thresholds
        if (pool_usage >= self.health_thresholds['critical_connection_usage'] or
            error_rate >= self.health_thresholds['critical_error_rate'] or
            avg_response_time >= self.health_thresholds['critical_response_time'] / 1000):
            return DatabaseHealthStatus.CRITICAL
        
        elif (pool_usage >= self.health_thresholds['degraded_connection_usage'] or
              error_rate >= self.health_thresholds['degraded_error_rate'] or
              avg_response_time >= self.health_thresholds['degraded_response_time'] / 1000):
            return DatabaseHealthStatus.DEGRADED
        
        return DatabaseHealthStatus.HEALTHY
    
    def _generate_recommendations(self, pool_metrics: Dict, performance_metrics: Dict, error_metrics: Dict) -> list[str]:
        """
        Generate actionable recommendations based on current metrics.
        """
        recommendations = []
        
        # Connection pool recommendations
        if pool_metrics['usage_percentage'] > 80:
            recommendations.append("Connection pool usage high - consider increasing pool size")
        
        if pool_metrics['overflow_connections'] > 0:
            recommendations.append("Overflow connections detected - pool size may be insufficient")
        
        if pool_metrics['invalid_connections'] > 0:
            recommendations.append("Invalid connections detected - check connection validation")
        
        # Performance recommendations
        if performance_metrics['avg_response_time'] > 2000:
            recommendations.append("Response time high - optimize queries or increase resources")
        
        if performance_metrics['max_response_time'] > 5000:
            recommendations.append("Maximum response time exceeded - investigate slow queries")
        
        # Error rate recommendations
        if error_metrics['error_rate'] > 0.1:
            recommendations.append("Error rate elevated - check application logs and database status")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Database performance is optimal")
        
        return recommendations
    
    def record_error(self, error_type: str, error_message: str):
        """
        Record a database error for monitoring.
        """
        self.error_counts.append(datetime.now())
        logger.warning(f"Database error recorded: {error_type} - {error_message}")
    
    def get_current_health(self) -> Optional[DatabaseHealthMetrics]:
        """
        Get the most recent health metrics.
        """
        if not self.metrics_history:
            return None
        return self.metrics_history[-1]
    
    def get_health_summary(self) -> Dict[str, Any]:
        """
        Get a summary of current database health.
        """
        current_metrics = self.get_current_health()
        
        if not current_metrics:
            return {
                'status': 'unknown',
                'last_check': None,
                'message': 'No health data available'
            }
        
        return {
            'status': current_metrics.status.value,
            'last_check': current_metrics.last_check.isoformat(),
            'pool_usage': f"{current_metrics.active_connections}/{current_metrics.connection_pool_size}",
            'error_rate': f"{current_metrics.error_rate:.1%}",
            'response_time': f"{current_metrics.response_time_avg:.0f}ms",
            'recommendations': current_metrics.recommendations
        }
    
    def get_health_trends(self, hours: int = 24) -> Dict[str, Any]:
        """
        Get health trends over the specified time period.
        """
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_metrics = [m for m in self.metrics_history if m.last_check > cutoff_time]
        
        if not recent_metrics:
            return {
                'trend': 'insufficient_data',
                'status_changes': 0,
                'avg_response_time': 0,
                'avg_error_rate': 0
            }
        
        # Calculate trends
        status_changes = len([c for c in self.status_changes if c[0] > cutoff_time])
        avg_response_time = sum(m.response_time_avg for m in recent_metrics) / len(recent_metrics)
        avg_error_rate = sum(m.error_rate for m in recent_metrics) / len(recent_metrics)
        
        # Determine trend direction
        if len(recent_metrics) >= 2:
            first_status = recent_metrics[0].status
            last_status = recent_metrics[-1].status
            
            if first_status.value == last_status.value:
                trend = 'stable'
            elif first_status.value == 'healthy' and last_status.value != 'healthy':
                trend = 'deteriorating'
            elif first_status.value != 'healthy' and last_status.value == 'healthy':
                trend = 'improving'
            else:
                trend = 'fluctuating'
        else:
            trend = 'insufficient_data'
        
        return {
            'trend': trend,
            'status_changes': status_changes,
            'avg_response_time': avg_response_time,
            'avg_error_rate': avg_error_rate,
            'data_points': len(recent_metrics)
        }
