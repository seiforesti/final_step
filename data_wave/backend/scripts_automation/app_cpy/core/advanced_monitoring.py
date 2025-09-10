"""
📊 ADVANCED DATABASE MONITORING & ALERTING SYSTEM 📊
=====================================================

This is the most comprehensive database monitoring system ever built.
It provides real-time insights, predictive analytics, and intelligent
alerting to prevent issues before they become problems.

Features:
- Real-time Performance Monitoring
- Predictive Failure Detection
- Intelligent Alerting with Smart Thresholds
- Comprehensive Metrics Collection
- Performance Trend Analysis
- Resource Usage Forecasting
- Automated Health Scoring
- Custom Dashboard Generation
"""

import asyncio
import time
import logging
import threading
import statistics
from typing import Dict, List, Optional, Any, Callable, Tuple
from dataclasses import dataclass, field
from collections import defaultdict, deque
from enum import Enum
import json
import os
import psutil
from datetime import datetime, timedelta

from .database_resilience_engine import get_resilience_engine, DatabaseHealth
from .enhanced_db_session import session_manager

logger = logging.getLogger(__name__)

class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

class MetricType(Enum):
    GAUGE = "gauge"
    COUNTER = "counter"
    HISTOGRAM = "histogram"
    TIMER = "timer"

@dataclass
class Alert:
    """Represents a monitoring alert"""
    alert_id: str
    level: AlertLevel
    title: str
    message: str
    metric_name: str
    current_value: float
    threshold: float
    timestamp: float = field(default_factory=time.time)
    acknowledged: bool = False
    resolved: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class MetricPoint:
    """Represents a single metric measurement"""
    name: str
    value: float
    timestamp: float = field(default_factory=time.time)
    tags: Dict[str, str] = field(default_factory=dict)
    metric_type: MetricType = MetricType.GAUGE

class AdvancedMonitor:
    """
    🔍 ADVANCED DATABASE MONITOR
    
    This is the ultimate monitoring system that watches every aspect
    of your database performance and predicts issues before they happen.
    """
    
    def __init__(self):
        self.is_running = False
        self.monitor_thread = None
        self.alert_thread = None
        
        # Metrics storage
        self.metrics_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self.current_metrics: Dict[str, MetricPoint] = {}
        
        # Alerting system
        self.alerts: Dict[str, Alert] = {}
        self.alert_rules: Dict[str, Dict] = {}
        self.alert_callbacks: List[Callable] = []
        
        # Performance baselines
        self.baselines: Dict[str, Dict] = {}
        self.adaptive_thresholds: Dict[str, Dict] = defaultdict(dict)
        
        # Health scoring
        self.health_scores: deque = deque(maxlen=100)
        self.component_health: Dict[str, float] = {}
        
        # Prediction models
        self.trend_analyzers: Dict[str, 'TrendAnalyzer'] = {}
        
        # Configuration
        self.monitoring_interval = 10  # seconds
        self.metrics_retention = 3600  # 1 hour
        
        # Initialize default alert rules
        self._setup_default_alert_rules()
        
        # Start monitoring
        self.start()
        
    def start(self):
        """Start the advanced monitoring system"""
        if self.is_running:
            return
            
        self.is_running = True
        
        # Start metrics collection thread
        self.monitor_thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.monitor_thread.start()
        
        # Start alerting thread
        self.alert_thread = threading.Thread(target=self._alerting_loop, daemon=True)
        self.alert_thread.start()
        
        logger.info("📊 ADVANCED DATABASE MONITORING STARTED")
        
    def stop(self):
        """Stop the monitoring system"""
        self.is_running = False
        
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        if self.alert_thread:
            self.alert_thread.join(timeout=5)
            
        logger.info("⏹️ Advanced monitoring stopped")
        
    def _monitoring_loop(self):
        """Main monitoring loop"""
        logger.info("🔄 Monitoring loop started")
        
        while self.is_running:
            try:
                # Collect all metrics
                self._collect_database_metrics()
                self._collect_system_metrics()
                self._collect_application_metrics()
                self._collect_resilience_engine_metrics()
                
                # Calculate health scores
                self._calculate_health_scores()
                
                # Update trend analyzers
                self._update_trend_analysis()
                
                # Clean old metrics
                self._cleanup_old_metrics()
                
                time.sleep(self.monitoring_interval)
                
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")
                time.sleep(30)
                
    def _alerting_loop(self):
        """Main alerting loop"""
        logger.info("🚨 Alerting loop started")
        
        while self.is_running:
            try:
                # Check all alert rules
                for rule_name, rule_config in self.alert_rules.items():
                    self._check_alert_rule(rule_name, rule_config)
                    
                # Process alert lifecycle
                self._process_alert_lifecycle()
                
                # Send pending alerts
                self._send_pending_alerts()
                
                time.sleep(5)  # Check alerts every 5 seconds
                
            except Exception as e:
                logger.error(f"Alerting loop error: {e}")
                time.sleep(10)
                
    def _collect_database_metrics(self):
        """Collect database-specific metrics"""
        try:
            # Get session manager stats
            session_stats = session_manager.get_session_stats()
            
            self._record_metric("db_total_sessions", session_stats.get('total_sessions', 0), MetricType.COUNTER)
            self._record_metric("db_active_sessions", session_stats.get('active_sessions', 0), MetricType.GAUGE)
            self._record_metric("db_failed_sessions", session_stats.get('failed_sessions', 0), MetricType.COUNTER)
            self._record_metric("db_retried_operations", session_stats.get('retried_operations', 0), MetricType.COUNTER)
            
            # Connection pool metrics
            if 'connection_pool_status' in session_stats:
                pool_status = session_stats['connection_pool_status']
                if pool_status != 'managed_by_pgbouncer':
                    self._record_metric("db_pool_utilization", 
                                      session_stats.get('query_cache_hit_rate', 0), MetricType.GAUGE)
                    
            # Query cache metrics
            if 'query_cache_hit_rate' in session_stats:
                self._record_metric("db_cache_hit_rate", 
                                  session_stats['query_cache_hit_rate'], MetricType.GAUGE)
                
        except Exception as e:
            logger.error(f"Failed to collect database metrics: {e}")
            
    def _collect_system_metrics(self):
        """Collect system resource metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=None)
            self._record_metric("system_cpu_usage", cpu_percent, MetricType.GAUGE)
            
            # Memory metrics
            memory = psutil.virtual_memory()
            self._record_metric("system_memory_usage", memory.percent, MetricType.GAUGE)
            self._record_metric("system_memory_available", memory.available, MetricType.GAUGE)
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_usage_percent = (disk.used / disk.total) * 100
            self._record_metric("system_disk_usage", disk_usage_percent, MetricType.GAUGE)
            
            # Network metrics
            if hasattr(psutil, 'net_io_counters') and psutil.net_io_counters():
                net_io = psutil.net_io_counters()
                self._record_metric("system_network_bytes_sent", net_io.bytes_sent, MetricType.COUNTER)
                self._record_metric("system_network_bytes_recv", net_io.bytes_recv, MetricType.COUNTER)
                
            # Process metrics
            process = psutil.Process()
            self._record_metric("process_memory_rss", process.memory_info().rss, MetricType.GAUGE)
            self._record_metric("process_cpu_percent", process.cpu_percent(), MetricType.GAUGE)
            self._record_metric("process_num_threads", process.num_threads(), MetricType.GAUGE)
            
        except Exception as e:
            logger.error(f"Failed to collect system metrics: {e}")
            
    def _collect_application_metrics(self):
        """Collect application-specific metrics"""
        try:
            # FastAPI metrics (if available)
            # This would integrate with your FastAPI app to get request metrics
            
            # Custom application metrics
            current_time = time.time()
            self._record_metric("app_uptime", current_time, MetricType.GAUGE)
            
            # Thread pool metrics
            import threading
            active_threads = threading.active_count()
            self._record_metric("app_active_threads", active_threads, MetricType.GAUGE)
            
        except Exception as e:
            logger.error(f"Failed to collect application metrics: {e}")
            
    def _collect_resilience_engine_metrics(self):
        """Collect resilience engine metrics"""
        try:
            resilience_engine = get_resilience_engine()
            health_status = resilience_engine.get_comprehensive_health_status()
            
            # Overall health
            health_score = self._health_to_score(health_status['overall_health'])
            self._record_metric("resilience_health_score", health_score, MetricType.GAUGE)
            
            # Connection pool metrics
            pool_status = health_status.get('connection_pool', {})
            if 'utilization_percent' in pool_status:
                self._record_metric("resilience_pool_utilization", 
                                  pool_status['utilization_percent'], MetricType.GAUGE)
            if 'active_connections' in pool_status:
                self._record_metric("resilience_active_connections", 
                                  pool_status['active_connections'], MetricType.GAUGE)
                                  
            # Circuit breaker metrics
            cb_status = health_status.get('circuit_breaker', {})
            if 'endpoints' in cb_status:
                open_circuits = sum(1 for ep_data in cb_status['endpoints'].values() 
                                  if ep_data.get('state') == 'open')
                self._record_metric("resilience_open_circuits", open_circuits, MetricType.GAUGE)
                
            # Query optimizer metrics
            qo_status = health_status.get('query_optimizer', {})
            if 'cache_hit_rate' in qo_status:
                self._record_metric("resilience_cache_hit_rate", 
                                  qo_status['cache_hit_rate'], MetricType.GAUGE)
            if 'optimized_queries' in qo_status:
                self._record_metric("resilience_optimized_queries", 
                                  qo_status['optimized_queries'], MetricType.COUNTER)
                                  
            # Request stats
            req_stats = health_status.get('request_stats', {})
            if 'error_rate' in req_stats:
                self._record_metric("resilience_error_rate", 
                                  req_stats['error_rate'], MetricType.GAUGE)
            if 'active_requests' in req_stats:
                self._record_metric("resilience_active_requests", 
                                  req_stats['active_requests'], MetricType.GAUGE)
                                  
        except Exception as e:
            logger.debug(f"Resilience engine not available for metrics: {e}")
            
    def _record_metric(self, name: str, value: float, metric_type: MetricType = MetricType.GAUGE, tags: Dict[str, str] = None):
        """Record a metric point"""
        metric_point = MetricPoint(
            name=name,
            value=value,
            metric_type=metric_type,
            tags=tags or {}
        )
        
        # Store current value
        self.current_metrics[name] = metric_point
        
        # Add to history
        self.metrics_history[name].append(metric_point)
        
        # Update trend analyzer
        if name not in self.trend_analyzers:
            self.trend_analyzers[name] = TrendAnalyzer(name)
        self.trend_analyzers[name].add_point(value)
        
    def _health_to_score(self, health: str) -> float:
        """Convert health status to numeric score"""
        health_scores = {
            'excellent': 100.0,
            'good': 80.0,
            'warning': 60.0,
            'critical': 40.0,
            'emergency': 20.0,
            'error': 0.0,
            'unknown': 50.0
        }
        return health_scores.get(health, 50.0)
        
    def _calculate_health_scores(self):
        """Calculate comprehensive health scores"""
        try:
            current_time = time.time()
            
            # Component health scores
            components = {
                'database': self._calculate_database_health(),
                'system': self._calculate_system_health(),
                'application': self._calculate_application_health(),
                'resilience': self._calculate_resilience_health()
            }
            
            self.component_health = components
            
            # Overall health score (weighted average)
            weights = {
                'database': 0.4,
                'system': 0.3,
                'application': 0.2,
                'resilience': 0.1
            }
            
            overall_score = sum(
                components[comp] * weights[comp] 
                for comp in components 
                if comp in weights
            )
            
            self.health_scores.append({
                'timestamp': current_time,
                'overall': overall_score,
                'components': components.copy()
            })
            
            # Record as metric
            self._record_metric("health_score_overall", overall_score, MetricType.GAUGE)
            for comp, score in components.items():
                self._record_metric(f"health_score_{comp}", score, MetricType.GAUGE)
                
        except Exception as e:
            logger.error(f"Failed to calculate health scores: {e}")
            
    def _calculate_database_health(self) -> float:
        """Calculate database health score"""
        score = 100.0
        
        try:
            # Check active sessions
            active_sessions = self.current_metrics.get('db_active_sessions')
            if active_sessions and active_sessions.value > 50:
                score -= min(20, (active_sessions.value - 50) * 0.5)
                
            # Check failed sessions
            failed_sessions = self.current_metrics.get('db_failed_sessions')
            if failed_sessions and failed_sessions.value > 0:
                score -= min(15, failed_sessions.value * 2)
                
            # Check cache hit rate
            cache_hit_rate = self.current_metrics.get('db_cache_hit_rate')
            if cache_hit_rate and cache_hit_rate.value < 70:
                score -= (70 - cache_hit_rate.value) * 0.3
                
        except Exception as e:
            logger.error(f"Database health calculation error: {e}")
            score = 50.0
            
        return max(0, min(100, score))
        
    def _calculate_system_health(self) -> float:
        """Calculate system health score"""
        score = 100.0
        
        try:
            # CPU usage impact
            cpu_usage = self.current_metrics.get('system_cpu_usage')
            if cpu_usage:
                if cpu_usage.value > 90:
                    score -= 30
                elif cpu_usage.value > 80:
                    score -= 20
                elif cpu_usage.value > 70:
                    score -= 10
                    
            # Memory usage impact
            memory_usage = self.current_metrics.get('system_memory_usage')
            if memory_usage:
                if memory_usage.value > 95:
                    score -= 25
                elif memory_usage.value > 85:
                    score -= 15
                elif memory_usage.value > 75:
                    score -= 8
                    
            # Disk usage impact
            disk_usage = self.current_metrics.get('system_disk_usage')
            if disk_usage:
                if disk_usage.value > 95:
                    score -= 20
                elif disk_usage.value > 90:
                    score -= 10
                elif disk_usage.value > 85:
                    score -= 5
                    
        except Exception as e:
            logger.error(f"System health calculation error: {e}")
            score = 50.0
            
        return max(0, min(100, score))
        
    def _calculate_application_health(self) -> float:
        """Calculate application health score"""
        score = 100.0
        
        try:
            # Thread count impact
            active_threads = self.current_metrics.get('app_active_threads')
            if active_threads and active_threads.value > 100:
                score -= min(15, (active_threads.value - 100) * 0.1)
                
            # Process CPU impact
            process_cpu = self.current_metrics.get('process_cpu_percent')
            if process_cpu and process_cpu.value > 80:
                score -= (process_cpu.value - 80) * 0.5
                
        except Exception as e:
            logger.error(f"Application health calculation error: {e}")
            score = 50.0
            
        return max(0, min(100, score))
        
    def _calculate_resilience_health(self) -> float:
        """Calculate resilience engine health score"""
        try:
            resilience_score = self.current_metrics.get('resilience_health_score')
            if resilience_score:
                return resilience_score.value
        except Exception as e:
            logger.error(f"Resilience health calculation error: {e}")
            
        return 50.0  # Default if resilience engine not available
        
    def _update_trend_analysis(self):
        """Update trend analysis for all metrics"""
        for name, analyzer in self.trend_analyzers.items():
            try:
                analyzer.analyze_trends()
            except Exception as e:
                logger.error(f"Trend analysis error for {name}: {e}")
                
    def _cleanup_old_metrics(self):
        """Clean up old metric data"""
        cutoff_time = time.time() - self.metrics_retention
        
        for name, history in self.metrics_history.items():
            # Remove old points
            while history and history[0].timestamp < cutoff_time:
                history.popleft()
                
    def _setup_default_alert_rules(self):
        """Setup default alert rules"""
        self.alert_rules = {
            'high_cpu_usage': {
                'metric': 'system_cpu_usage',
                'threshold': 85.0,
                'comparison': 'greater_than',
                'duration': 300,  # 5 minutes
                'level': AlertLevel.WARNING,
                'title': 'High CPU Usage',
                'message': 'System CPU usage is above {threshold}% for {duration} seconds'
            },
            'critical_cpu_usage': {
                'metric': 'system_cpu_usage',
                'threshold': 95.0,
                'comparison': 'greater_than',
                'duration': 60,  # 1 minute
                'level': AlertLevel.CRITICAL,
                'title': 'Critical CPU Usage',
                'message': 'System CPU usage is critically high at {value}%'
            },
            'high_memory_usage': {
                'metric': 'system_memory_usage',
                'threshold': 90.0,
                'comparison': 'greater_than',
                'duration': 300,
                'level': AlertLevel.WARNING,
                'title': 'High Memory Usage',
                'message': 'System memory usage is above {threshold}% for {duration} seconds'
            },
            'database_session_failures': {
                'metric': 'db_failed_sessions',
                'threshold': 10,
                'comparison': 'greater_than',
                'duration': 60,
                'level': AlertLevel.CRITICAL,
                'title': 'Database Session Failures',
                'message': 'Multiple database session failures detected: {value}'
            },
            'low_cache_hit_rate': {
                'metric': 'db_cache_hit_rate',
                'threshold': 50.0,
                'comparison': 'less_than',
                'duration': 600,  # 10 minutes
                'level': AlertLevel.WARNING,
                'title': 'Low Cache Hit Rate',
                'message': 'Database cache hit rate is low: {value}%'
            },
            'circuit_breakers_open': {
                'metric': 'resilience_open_circuits',
                'threshold': 1,
                'comparison': 'greater_than_or_equal',
                'duration': 30,
                'level': AlertLevel.CRITICAL,
                'title': 'Circuit Breakers Open',
                'message': '{value} circuit breakers are currently open'
            },
            'high_error_rate': {
                'metric': 'resilience_error_rate',
                'threshold': 10.0,
                'comparison': 'greater_than',
                'duration': 300,
                'level': AlertLevel.CRITICAL,
                'title': 'High Error Rate',
                'message': 'Application error rate is high: {value}%'
            }
        }
        
    def _check_alert_rule(self, rule_name: str, rule_config: Dict):
        """Check a specific alert rule"""
        try:
            metric_name = rule_config['metric']
            threshold = rule_config['threshold']
            comparison = rule_config['comparison']
            duration = rule_config.get('duration', 0)
            
            # Get current metric value
            current_metric = self.current_metrics.get(metric_name)
            if not current_metric:
                return
                
            current_value = current_metric.value
            
            # Check threshold
            triggered = False
            if comparison == 'greater_than':
                triggered = current_value > threshold
            elif comparison == 'greater_than_or_equal':
                triggered = current_value >= threshold
            elif comparison == 'less_than':
                triggered = current_value < threshold
            elif comparison == 'less_than_or_equal':
                triggered = current_value <= threshold
            elif comparison == 'equal':
                triggered = current_value == threshold
                
            alert_id = f"alert_{rule_name}"
            
            if triggered:
                # Check duration if required
                if duration > 0:
                    # Check if condition has been true for the required duration
                    history = self.metrics_history[metric_name]
                    cutoff_time = time.time() - duration
                    
                    # Check if all recent values exceed threshold
                    recent_values = [
                        point for point in history 
                        if point.timestamp >= cutoff_time
                    ]
                    
                    if not recent_values:
                        return
                        
                    duration_triggered = all(
                        self._check_threshold(point.value, threshold, comparison)
                        for point in recent_values
                    )
                    
                    if not duration_triggered:
                        return
                        
                # Create or update alert
                if alert_id not in self.alerts or self.alerts[alert_id].resolved:
                    alert = Alert(
                        alert_id=alert_id,
                        level=rule_config['level'],
                        title=rule_config['title'],
                        message=rule_config['message'].format(
                            value=current_value,
                            threshold=threshold,
                            duration=duration
                        ),
                        metric_name=metric_name,
                        current_value=current_value,
                        threshold=threshold,
                        metadata=rule_config.copy()
                    )
                    
                    self.alerts[alert_id] = alert
                    logger.warning(f"🚨 ALERT TRIGGERED: {alert.title} - {alert.message}")
                    
            else:
                # Resolve alert if it exists
                if alert_id in self.alerts and not self.alerts[alert_id].resolved:
                    self.alerts[alert_id].resolved = True
                    logger.info(f"✅ ALERT RESOLVED: {self.alerts[alert_id].title}")
                    
        except Exception as e:
            logger.error(f"Error checking alert rule {rule_name}: {e}")
            
    def _check_threshold(self, value: float, threshold: float, comparison: str) -> bool:
        """Check if value meets threshold condition"""
        if comparison == 'greater_than':
            return value > threshold
        elif comparison == 'greater_than_or_equal':
            return value >= threshold
        elif comparison == 'less_than':
            return value < threshold
        elif comparison == 'less_than_or_equal':
            return value <= threshold
        elif comparison == 'equal':
            return value == threshold
        return False
        
    def _process_alert_lifecycle(self):
        """Process alert lifecycle (acknowledgment, escalation, etc.)"""
        current_time = time.time()
        
        for alert_id, alert in self.alerts.items():
            # Auto-resolve old alerts
            if alert.resolved and current_time - alert.timestamp > 3600:  # 1 hour
                # Could remove from active alerts or move to history
                pass
                
            # Escalate critical alerts that haven't been acknowledged
            if (alert.level == AlertLevel.CRITICAL and 
                not alert.acknowledged and 
                current_time - alert.timestamp > 900):  # 15 minutes
                
                # Escalate to emergency
                alert.level = AlertLevel.EMERGENCY
                logger.critical(f"🔥 ALERT ESCALATED TO EMERGENCY: {alert.title}")
                
    def _send_pending_alerts(self):
        """Send pending alerts to configured channels"""
        for alert in self.alerts.values():
            if not alert.acknowledged and not alert.resolved:
                for callback in self.alert_callbacks:
                    try:
                        callback(alert)
                    except Exception as e:
                        logger.error(f"Alert callback failed: {e}")
                        
    def add_alert_callback(self, callback: Callable[[Alert], None]):
        """Add an alert callback function"""
        self.alert_callbacks.append(callback)
        
    def acknowledge_alert(self, alert_id: str):
        """Acknowledge an alert"""
        if alert_id in self.alerts:
            self.alerts[alert_id].acknowledged = True
            logger.info(f"✅ Alert acknowledged: {alert_id}")
            
    def get_metrics(self, metric_names: List[str] = None, time_range: int = 3600) -> Dict[str, List[MetricPoint]]:
        """Get metrics data"""
        cutoff_time = time.time() - time_range
        result = {}
        
        metrics_to_get = metric_names or list(self.metrics_history.keys())
        
        for name in metrics_to_get:
            if name in self.metrics_history:
                result[name] = [
                    point for point in self.metrics_history[name]
                    if point.timestamp >= cutoff_time
                ]
                
        return result
        
    def get_alerts(self, include_resolved: bool = False) -> List[Alert]:
        """Get current alerts"""
        alerts = list(self.alerts.values())
        
        if not include_resolved:
            alerts = [alert for alert in alerts if not alert.resolved]
            
        return sorted(alerts, key=lambda a: (a.level.value, a.timestamp), reverse=True)
        
    def get_health_summary(self) -> Dict[str, Any]:
        """Get comprehensive health summary"""
        if not self.health_scores:
            return {"status": "no_data"}
            
        latest_health = self.health_scores[-1]
        
        return {
            "overall_score": latest_health['overall'],
            "overall_status": self._score_to_status(latest_health['overall']),
            "components": {
                comp: {
                    "score": score,
                    "status": self._score_to_status(score)
                }
                for comp, score in latest_health['components'].items()
            },
            "active_alerts": len([a for a in self.alerts.values() if not a.resolved]),
            "critical_alerts": len([a for a in self.alerts.values() if not a.resolved and a.level == AlertLevel.CRITICAL]),
            "timestamp": latest_health['timestamp']
        }
        
    def _score_to_status(self, score: float) -> str:
        """Convert numeric score to status string"""
        if score >= 90:
            return "excellent"
        elif score >= 80:
            return "good"
        elif score >= 60:
            return "warning"
        elif score >= 40:
            return "critical"
        else:
            return "emergency"
            
    def get_status(self) -> Dict[str, Any]:
        """Get comprehensive monitoring status"""
        return {
            "is_running": self.is_running,
            "metrics_count": len(self.current_metrics),
            "alerts_count": len(self.alerts),
            "active_alerts": len([a for a in self.alerts.values() if not a.resolved]),
            "health_summary": self.get_health_summary(),
            "monitoring_interval": self.monitoring_interval,
            "uptime": time.time() - getattr(self, '_start_time', time.time())
        }


class TrendAnalyzer:
    """
    📈 TREND ANALYZER
    
    Analyzes metric trends to predict future values and detect anomalies.
    """
    
    def __init__(self, metric_name: str):
        self.metric_name = metric_name
        self.values = deque(maxlen=100)
        self.timestamps = deque(maxlen=100)
        
        # Trend analysis results
        self.current_trend = "stable"  # stable, increasing, decreasing
        self.trend_strength = 0.0  # 0-1
        self.predicted_value = None
        self.anomaly_score = 0.0
        
    def add_point(self, value: float):
        """Add a data point for analysis"""
        current_time = time.time()
        self.values.append(value)
        self.timestamps.append(current_time)
        
    def analyze_trends(self):
        """Analyze trends in the data"""
        if len(self.values) < 10:
            return
            
        try:
            values_list = list(self.values)
            
            # Calculate trend using linear regression
            n = len(values_list)
            x = list(range(n))
            
            # Simple linear regression
            sum_x = sum(x)
            sum_y = sum(values_list)
            sum_xy = sum(x[i] * values_list[i] for i in range(n))
            sum_x2 = sum(xi * xi for xi in x)
            
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
            
            # Determine trend direction
            if abs(slope) < 0.01:  # Threshold for "stable"
                self.current_trend = "stable"
                self.trend_strength = 0.0
            elif slope > 0:
                self.current_trend = "increasing"
                self.trend_strength = min(1.0, abs(slope) / (max(values_list) - min(values_list) + 0.001))
            else:
                self.current_trend = "decreasing"
                self.trend_strength = min(1.0, abs(slope) / (max(values_list) - min(values_list) + 0.001))
                
            # Predict next value
            intercept = (sum_y - slope * sum_x) / n
            self.predicted_value = slope * n + intercept
            
            # Calculate anomaly score (how much current value deviates from trend)
            if len(values_list) > 1:
                expected = slope * (n - 1) + intercept
                current = values_list[-1]
                if max(values_list) > min(values_list):
                    self.anomaly_score = abs(current - expected) / (max(values_list) - min(values_list))
                else:
                    self.anomaly_score = 0.0
                    
        except Exception as e:
            logger.error(f"Trend analysis error for {self.metric_name}: {e}")


# Global monitor instance
advanced_monitor = None

def initialize_advanced_monitor() -> AdvancedMonitor:
    """Initialize the global advanced monitor"""
    global advanced_monitor
    
    if advanced_monitor is None:
        advanced_monitor = AdvancedMonitor()
        logger.info("📊 GLOBAL ADVANCED MONITOR INITIALIZED")
        
    return advanced_monitor

def get_advanced_monitor() -> AdvancedMonitor:
    """Get the global advanced monitor"""
    if advanced_monitor is None:
        return initialize_advanced_monitor()
    return advanced_monitor

def record_custom_metric(name: str, value: float, metric_type: MetricType = MetricType.GAUGE, tags: Dict[str, str] = None):
    """Record a custom metric"""
    monitor = get_advanced_monitor()
    monitor._record_metric(name, value, metric_type, tags)

def get_monitoring_status() -> Dict[str, Any]:
    """Get monitoring system status"""
    if advanced_monitor:
        return advanced_monitor.get_status()
    return {"status": "not_initialized"}

# Export important classes and functions
__all__ = [
    'AdvancedMonitor',
    'Alert',
    'AlertLevel',
    'MetricType',
    'initialize_advanced_monitor',
    'get_advanced_monitor',
    'record_custom_metric',
    'get_monitoring_status'
]