#!/usr/bin/env python3
"""
Enterprise Data Governance System Health Monitor
===============================================

This script provides comprehensive real-time monitoring of the enterprise backend system,
including database health, table status, system resources, and application performance.

Features:
- Real-time database connectivity monitoring
- Table health and integrity checks
- System resource monitoring (CPU, memory, disk)
- Application performance metrics
- Automatic health alerts and notifications
- Comprehensive health reports
"""

import sys
import os
import time
import psutil
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import threading
import signal

# Add the app directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

# Configure enterprise-grade logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('system_health.log')
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """System resource metrics"""
    timestamp: str
    cpu_percent: float
    memory_percent: float
    memory_available_gb: float
    disk_usage_percent: float
    disk_free_gb: float
    network_io: Dict[str, float]
    process_count: int

@dataclass
class DatabaseHealth:
    """Database health metrics"""
    timestamp: str
    connection_status: str
    response_time_ms: float
    active_connections: int
    table_count: int
    missing_tables: List[str]
    corrupted_tables: List[str]
    health_score: float

@dataclass
class ApplicationHealth:
    """Application health metrics"""
    timestamp: str
    status: str
    uptime_seconds: int
    request_count: int
    error_count: int
    response_time_avg_ms: float
    health_score: float

@dataclass
class HealthReport:
    """Comprehensive health report"""
    timestamp: str
    system_metrics: SystemMetrics
    database_health: DatabaseHealth
    application_health: ApplicationHealth
    overall_health_score: float
    alerts: List[str]
    recommendations: List[str]

class SystemHealthMonitor:
    """Enterprise system health monitoring system"""
    
    def __init__(self, monitoring_interval: int = 30):
        self.monitoring_interval = monitoring_interval
        self.running = False
        self.health_history: List[HealthReport] = []
        self.alert_thresholds = {
            'cpu_percent': 80.0,
            'memory_percent': 85.0,
            'disk_usage_percent': 90.0,
            'database_response_time_ms': 1000.0,
            'application_error_rate': 0.05
        }
        
        # Signal handling for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}, shutting down gracefully...")
        self.stop_monitoring()
        sys.exit(0)
    
    def start_monitoring(self):
        """Start the health monitoring system"""
        try:
            logger.info("🚀 Starting Enterprise System Health Monitor...")
            self.running = True
            
            # Start monitoring in a separate thread
            monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
            monitor_thread.start()
            
            logger.info(f"✅ Health monitoring started (interval: {self.monitoring_interval}s)")
            
            # Keep main thread alive
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("⏹️ Monitoring interrupted by user")
            self.stop_monitoring()
        except Exception as e:
            logger.error(f"❌ Error in health monitoring: {e}")
            self.stop_monitoring()
    
    def stop_monitoring(self):
        """Stop the health monitoring system"""
        logger.info("🛑 Stopping health monitoring...")
        self.running = False
        
        # Generate final health report
        if self.health_history:
            self._generate_final_report()
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                # Collect health metrics
                health_report = self._collect_health_metrics()
                
                # Store in history
                self.health_history.append(health_report)
                
                # Keep only last 100 reports
                if len(self.health_history) > 100:
                    self.health_history = self.health_history[-100:]
                
                # Log health status
                self._log_health_status(health_report)
                
                # Check for alerts
                alerts = self._check_alerts(health_report)
                if alerts:
                    self._log_alerts(alerts)
                
                # Wait for next monitoring cycle
                time.sleep(self.monitoring_interval)
                
            except Exception as e:
                logger.error(f"❌ Error in monitoring loop: {e}")
                time.sleep(self.monitoring_interval)
    
    def _collect_health_metrics(self) -> HealthReport:
        """Collect comprehensive health metrics"""
        try:
            timestamp = datetime.now().isoformat()
            
            # System metrics
            system_metrics = self._collect_system_metrics(timestamp)
            
            # Database health
            database_health = self._collect_database_health(timestamp)
            
            # Application health
            application_health = self._collect_application_health(timestamp)
            
            # Calculate overall health score
            overall_score = self._calculate_overall_health_score(
                system_metrics, database_health, application_health
            )
            
            # Generate alerts and recommendations
            alerts = self._generate_alerts(system_metrics, database_health, application_health)
            recommendations = self._generate_recommendations(
                system_metrics, database_health, application_health
            )
            
            return HealthReport(
                timestamp=timestamp,
                system_metrics=system_metrics,
                database_health=database_health,
                application_health=application_health,
                overall_health_score=overall_score,
                alerts=alerts,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"❌ Error collecting health metrics: {e}")
            # Return minimal health report
            return self._create_minimal_health_report()
    
    def _collect_system_metrics(self, timestamp: str) -> SystemMetrics:
        """Collect system resource metrics"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available_gb = memory.available / (1024**3)
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_usage_percent = disk.percent
            disk_free_gb = disk.free / (1024**3)
            
            # Network I/O
            network = psutil.net_io_counters()
            network_io = {
                'bytes_sent': network.bytes_sent,
                'bytes_recv': network.bytes_recv,
                'packets_sent': network.packets_sent,
                'packets_recv': network.packets_recv
            }
            
            # Process count
            process_count = len(psutil.pids())
            
            return SystemMetrics(
                timestamp=timestamp,
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                memory_available_gb=memory_available_gb,
                disk_usage_percent=disk_usage_percent,
                disk_free_gb=disk_free_gb,
                network_io=network_io,
                process_count=process_count
            )
            
        except Exception as e:
            logger.error(f"❌ Error collecting system metrics: {e}")
            return SystemMetrics(
                timestamp=timestamp,
                cpu_percent=0.0,
                memory_percent=0.0,
                memory_available_gb=0.0,
                disk_usage_percent=0.0,
                disk_free_gb=0.0,
                network_io={},
                process_count=0
            )
    
    def _collect_database_health(self, timestamp: str) -> DatabaseHealth:
        """Collect database health metrics"""
        try:
            # Test database connection
            start_time = time.time()
            connection_status = "unknown"
            response_time_ms = 0.0
            table_count = 0
            missing_tables = []
            corrupted_tables = []
            
            try:
                # Import database components
                from sqlalchemy import create_engine, inspect, text
                
                # Get database URL
                database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@postgres:5432/data_governance')
                
                # Create engine
                engine = create_engine(database_url)
                
                # Test connection
                with engine.connect() as conn:
                    # Test query
                    result = conn.execute(text("SELECT 1"))
                    result.fetchone()
                    
                    # Get table count
                    inspector = inspect(engine)
                    table_count = len(inspector.get_table_names())
                    
                    connection_status = "healthy"
                    
            except Exception as e:
                connection_status = f"error: {str(e)}"
            
            response_time_ms = (time.time() - start_time) * 1000
            
            # Calculate health score
            health_score = self._calculate_database_health_score(
                connection_status, response_time_ms, table_count
            )
            
            return DatabaseHealth(
                timestamp=timestamp,
                connection_status=connection_status,
                response_time_ms=response_time_ms,
                active_connections=0,  # Would need more sophisticated monitoring
                table_count=table_count,
                missing_tables=missing_tables,
                corrupted_tables=corrupted_tables,
                health_score=health_score
            )
            
        except Exception as e:
            logger.error(f"❌ Error collecting database health: {e}")
            return DatabaseHealth(
                timestamp=timestamp,
                connection_status="error",
                response_time_ms=0.0,
                active_connections=0,
                table_count=0,
                missing_tables=[],
                corrupted_tables=[],
                health_score=0.0
            )
    
    def _collect_application_health(self, timestamp: str) -> ApplicationHealth:
        """Collect application health metrics"""
        try:
            # Check if application is running
            status = "unknown"
            uptime_seconds = 0
            request_count = 0
            error_count = 0
            response_time_avg_ms = 0.0
            
            # Try to connect to the application
            try:
                import requests
                response = requests.get("http://localhost:8000/health", timeout=5)
                if response.status_code == 200:
                    status = "healthy"
                    # Parse response for metrics if available
                    try:
                        data = response.json()
                        uptime_seconds = data.get('uptime', 0)
                        request_count = data.get('request_count', 0)
                        error_count = data.get('error_count', 0)
                        response_time_avg_ms = data.get('response_time_avg_ms', 0.0)
                    except:
                        pass
                else:
                    status = f"unhealthy: {response.status_code}"
            except Exception as e:
                status = f"error: {str(e)}"
            
            # Calculate health score
            health_score = self._calculate_application_health_score(
                status, error_count, response_time_avg_ms
            )
            
            return ApplicationHealth(
                timestamp=timestamp,
                status=status,
                uptime_seconds=uptime_seconds,
                request_count=request_count,
                error_count=error_count,
                response_time_avg_ms=response_time_avg_ms,
                health_score=health_score
            )
            
        except Exception as e:
            logger.error(f"❌ Error collecting application health: {e}")
            return ApplicationHealth(
                timestamp=timestamp,
                status="error",
                uptime_seconds=0,
                request_count=0,
                error_count=0,
                response_time_avg_ms=0.0,
                health_score=0.0
            )
    
    def _calculate_database_health_score(self, connection_status: str, response_time_ms: float, table_count: int) -> float:
        """Calculate database health score (0-100)"""
        score = 100.0
        
        # Connection status penalty
        if "error" in connection_status.lower():
            score -= 50.0
        elif "unhealthy" in connection_status.lower():
            score -= 25.0
        
        # Response time penalty
        if response_time_ms > 1000:
            score -= 20.0
        elif response_time_ms > 500:
            score -= 10.0
        
        # Table count penalty (if no tables)
        if table_count == 0:
            score -= 30.0
        
        return max(0.0, score)
    
    def _calculate_application_health_score(self, status: str, error_count: int, response_time_avg_ms: float) -> float:
        """Calculate application health score (0-100)"""
        score = 100.0
        
        # Status penalty
        if "error" in status.lower():
            score -= 50.0
        elif "unhealthy" in status.lower():
            score -= 25.0
        
        # Error count penalty
        if error_count > 100:
            score -= 20.0
        elif error_count > 50:
            score -= 10.0
        
        # Response time penalty
        if response_time_avg_ms > 1000:
            score -= 20.0
        elif response_time_avg_ms > 500:
            score -= 10.0
        
        return max(0.0, score)
    
    def _calculate_overall_health_score(self, system_metrics: SystemMetrics, 
                                      database_health: DatabaseHealth, 
                                      application_health: ApplicationHealth) -> float:
        """Calculate overall system health score (0-100)"""
        # Weighted average of all components
        weights = {
            'system': 0.3,
            'database': 0.4,
            'application': 0.3
        }
        
        system_score = 100.0
        if system_metrics.cpu_percent > self.alert_thresholds['cpu_percent']:
            system_score -= 20.0
        if system_metrics.memory_percent > self.alert_thresholds['memory_percent']:
            system_score -= 20.0
        if system_metrics.disk_usage_percent > self.alert_thresholds['disk_usage_percent']:
            system_score -= 20.0
        
        overall_score = (
            system_score * weights['system'] +
            database_health.health_score * weights['database'] +
            application_health.health_score * weights['application']
        )
        
        return max(0.0, min(100.0, overall_score))
    
    def _check_alerts(self, health_report: HealthReport) -> List[str]:
        """Check for health alerts"""
        alerts = []
        
        # System alerts
        if health_report.system_metrics.cpu_percent > self.alert_thresholds['cpu_percent']:
            alerts.append(f"High CPU usage: {health_report.system_metrics.cpu_percent:.1f}%")
        
        if health_report.system_metrics.memory_percent > self.alert_thresholds['memory_percent']:
            alerts.append(f"High memory usage: {health_report.system_metrics.memory_percent:.1f}%")
        
        if health_report.system_metrics.disk_usage_percent > self.alert_thresholds['disk_usage_percent']:
            alerts.append(f"High disk usage: {health_report.system_metrics.disk_usage_percent:.1f}%")
        
        # Database alerts
        if health_report.database_health.health_score < 50:
            alerts.append(f"Database health critical: {health_report.database_health.health_score:.1f}")
        
        if health_report.database_health.response_time_ms > self.alert_thresholds['database_response_time_ms']:
            alerts.append(f"Database slow response: {health_report.database_health.response_time_ms:.1f}ms")
        
        # Application alerts
        if health_report.application_health.health_score < 50:
            alerts.append(f"Application health critical: {health_report.application_health.health_score:.1f}")
        
        return alerts
    
    def _generate_alerts(self, system_metrics: SystemMetrics, 
                        database_health: DatabaseHealth, 
                        application_health: ApplicationHealth) -> List[str]:
        """Generate health alerts"""
        alerts = []
        
        # System alerts
        if system_metrics.cpu_percent > self.alert_thresholds['cpu_percent']:
            alerts.append(f"High CPU usage: {system_metrics.cpu_percent:.1f}%")
        
        if system_metrics.memory_percent > self.alert_thresholds['memory_percent']:
            alerts.append(f"High memory usage: {system_metrics.memory_percent:.1f}%")
        
        if system_metrics.disk_usage_percent > self.alert_thresholds['disk_usage_percent']:
            alerts.append(f"High disk usage: {system_metrics.disk_usage_percent:.1f}%")
        
        # Database alerts
        if database_health.health_score < 50:
            alerts.append(f"Database health critical: {database_health.health_score:.1f}")
        
        if database_health.response_time_ms > self.alert_thresholds['database_response_time_ms']:
            alerts.append(f"Database slow response: {database_health.response_time_ms:.1f}ms")
        
        # Application alerts
        if application_health.health_score < 50:
            alerts.append(f"Application health critical: {application_health.health_score:.1f}")
        
        return alerts
    
    def _generate_recommendations(self, system_metrics: SystemMetrics, 
                                database_health: DatabaseHealth, 
                                application_health: ApplicationHealth) -> List[str]:
        """Generate health recommendations"""
        recommendations = []
        
        # System recommendations
        if system_metrics.cpu_percent > 70:
            recommendations.append("Consider scaling CPU resources or optimizing processes")
        
        if system_metrics.memory_percent > 80:
            recommendations.append("Consider increasing memory or optimizing memory usage")
        
        if system_metrics.disk_usage_percent > 85:
            recommendations.append("Consider cleaning up disk space or expanding storage")
        
        # Database recommendations
        if database_health.health_score < 70:
            recommendations.append("Review database configuration and connection settings")
        
        if database_health.response_time_ms > 500:
            recommendations.append("Optimize database queries and consider indexing")
        
        # Application recommendations
        if application_health.health_score < 70:
            recommendations.append("Review application logs and error handling")
        
        if application_health.error_count > 50:
            recommendations.append("Investigate and fix application errors")
        
        return recommendations
    
    def _create_minimal_health_report(self) -> HealthReport:
        """Create minimal health report when collection fails"""
        timestamp = datetime.now().isoformat()
        
        minimal_system = SystemMetrics(
            timestamp=timestamp,
            cpu_percent=0.0,
            memory_percent=0.0,
            memory_available_gb=0.0,
            disk_usage_percent=0.0,
            disk_free_gb=0.0,
            network_io={},
            process_count=0
        )
        
        minimal_database = DatabaseHealth(
            timestamp=timestamp,
            connection_status="unknown",
            response_time_ms=0.0,
            active_connections=0,
            table_count=0,
            missing_tables=[],
            corrupted_tables=[],
            health_score=0.0
        )
        
        minimal_application = ApplicationHealth(
            timestamp=timestamp,
            status="unknown",
            uptime_seconds=0,
            request_count=0,
            error_count=0,
            response_time_avg_ms=0.0,
            health_score=0.0
        )
        
        return HealthReport(
            timestamp=timestamp,
            system_metrics=minimal_system,
            database_health=minimal_database,
            application_health=minimal_application,
            overall_health_score=0.0,
            alerts=["Health monitoring system error"],
            recommendations=["Restart health monitoring system"]
        )
    
    def _log_health_status(self, health_report: HealthReport):
        """Log current health status"""
        logger.info(f"📊 Health Status - Overall: {health_report.overall_health_score:.1f}/100")
        logger.info(f"   System: CPU {health_report.system_metrics.cpu_percent:.1f}%, "
                   f"Memory {health_report.system_metrics.memory_percent:.1f}%, "
                   f"Disk {health_report.system_metrics.disk_usage_percent:.1f}%")
        logger.info(f"   Database: {health_report.database_health.health_score:.1f}/100 "
                   f"({health_report.database_health.connection_status})")
        logger.info(f"   Application: {health_report.application_health.health_score:.1f}/100 "
                   f"({health_report.application_health.status})")
    
    def _log_alerts(self, alerts: List[str]):
        """Log health alerts"""
        if alerts:
            logger.warning("🚨 Health Alerts:")
            for alert in alerts:
                logger.warning(f"   ⚠️ {alert}")
    
    def _generate_final_report(self):
        """Generate final health report when monitoring stops"""
        try:
            if not self.health_history:
                return
            
            # Get latest report
            latest_report = self.health_history[-1]
            
            # Calculate statistics
            total_reports = len(self.health_history)
            avg_health_score = sum(r.overall_health_score for r in self.health_history) / total_reports
            min_health_score = min(r.overall_health_score for r in self.health_history)
            max_health_score = max(r.overall_health_score for r in self.health_history)
            
            # Generate summary
            summary = {
                'monitoring_duration_seconds': total_reports * self.monitoring_interval,
                'total_reports': total_reports,
                'average_health_score': avg_health_score,
                'min_health_score': min_health_score,
                'max_health_score': max_health_score,
                'final_health_score': latest_report.overall_health_score,
                'final_status': self._get_health_status(latest_report.overall_health_score),
                'timestamp': datetime.now().isoformat()
            }
            
            # Save to file
            with open('health_monitoring_summary.json', 'w') as f:
                json.dump(summary, f, indent=2)
            
            logger.info("📋 Final health monitoring summary generated")
            logger.info(f"   Duration: {summary['monitoring_duration_seconds']}s")
            logger.info(f"   Reports: {summary['total_reports']}")
            logger.info(f"   Average Health: {summary['average_health_score']:.1f}/100")
            logger.info(f"   Final Status: {summary['final_status']}")
            
        except Exception as e:
            logger.error(f"❌ Error generating final report: {e}")
    
    def _get_health_status(self, health_score: float) -> str:
        """Get health status based on score"""
        if health_score >= 90:
            return "Excellent"
        elif health_score >= 80:
            return "Good"
        elif health_score >= 70:
            return "Fair"
        elif health_score >= 50:
            return "Poor"
        else:
            return "Critical"
    
    def get_current_health(self) -> Optional[HealthReport]:
        """Get current health status"""
        if self.health_history:
            return self.health_history[-1]
        return None
    
    def get_health_history(self, hours: int = 24) -> List[HealthReport]:
        """Get health history for specified hours"""
        if not self.health_history:
            return []
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        cutoff_iso = cutoff_time.isoformat()
        
        return [report for report in self.health_history if report.timestamp >= cutoff_iso]

def main():
    """Main entry point for health monitoring"""
    try:
        # Get monitoring interval from command line or use default
        monitoring_interval = int(sys.argv[1]) if len(sys.argv) > 1 else 30
        
        logger.info("🚀 Enterprise Data Governance System Health Monitor")
        logger.info(f"📊 Monitoring interval: {monitoring_interval} seconds")
        
        # Create and start monitor
        monitor = SystemHealthMonitor(monitoring_interval)
        monitor.start_monitoring()
        
    except KeyboardInterrupt:
        logger.info("⏹️ Health monitoring interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
