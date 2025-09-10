"""
Monitoring and Alerting for Enterprise Services

This module provides monitoring and alerting capabilities for enterprise services.
"""

import asyncio
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class Metric:
    """Metric data structure"""
    name: str
    value: float
    timestamp: datetime = field(default_factory=datetime.now)
    tags: Dict[str, str] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Alert:
    """Alert data structure"""
    id: str
    title: str
    message: str
    severity: str  # "info", "warning", "error", "critical"
    timestamp: datetime = field(default_factory=datetime.now)
    source: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    acknowledged: bool = False
    resolved: bool = False


class MetricsCollector:
    """Metrics collection and management for enterprise services"""
    
    def __init__(self):
        self._metrics: Dict[str, List[Metric]] = {}
        self._counters: Dict[str, int] = {}
        self._gauges: Dict[str, float] = {}
        self._histograms: Dict[str, List[float]] = {}
        self._lock = asyncio.Lock()
    
    async def record_gauge(self, name: str, value: float, tags: Optional[Dict[str, str]] = None, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Record a gauge metric"""
        try:
            async with self._lock:
                self._gauges[name] = value
                metric = Metric(name=name, value=value, tags=tags or {}, metadata=metadata or {})
                if name not in self._metrics:
                    self._metrics[name] = []
                self._metrics[name].append(metric)
                
                # Keep only last 1000 metrics per name
                if len(self._metrics[name]) > 1000:
                    self._metrics[name] = self._metrics[name][-1000:]
                    
        except Exception as e:
            logger.error(f"Error recording gauge metric {name}: {str(e)}")
    
    async def increment_counter(self, name: str, value: int = 1, tags: Optional[Dict[str, str]] = None, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Increment a counter metric"""
        try:
            async with self._lock:
                if name not in self._counters:
                    self._counters[name] = 0
                self._counters[name] += value
                
                metric = Metric(name=name, value=float(self._counters[name]), tags=tags or {}, metadata=metadata or {})
                if name not in self._metrics:
                    self._metrics[name] = []
                self._metrics[name].append(metric)
                
        except Exception as e:
            logger.error(f"Error incrementing counter {name}: {str(e)}")
    
    async def record_histogram(self, name: str, value: float, tags: Optional[Dict[str, str]] = None, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Record a histogram metric"""
        try:
            async with self._lock:
                if name not in self._histograms:
                    self._histograms[name] = []
                self._histograms[name].append(value)
                
                # Keep only last 1000 values
                if len(self._histograms[name]) > 1000:
                    self._histograms[name] = self._histograms[name][-1000:]
                
                metric = Metric(name=name, value=value, tags=tags or {}, metadata=metadata or {})
                if name not in self._metrics:
                    self._metrics[name] = []
                self._metrics[name].append(metric)
                
        except Exception as e:
            logger.error(f"Error recording histogram metric {name}: {str(e)}")
    
    async def get_metric(self, name: str) -> Optional[Metric]:
        """Get the latest value for a metric"""
        try:
            if name in self._metrics and self._metrics[name]:
                return self._metrics[name][-1]
            return None
        except Exception as e:
            logger.error(f"Error getting metric {name}: {str(e)}")
            return None
    
    async def get_counter(self, name: str) -> int:
        """Get current counter value"""
        return self._counters.get(name, 0)
    
    async def get_gauge(self, name: str) -> float:
        """Get current gauge value"""
        return self._gauges.get(name, 0.0)
    
    async def get_histogram_stats(self, name: str) -> Dict[str, float]:
        """Get histogram statistics"""
        try:
            values = self._histograms.get(name, [])
            if not values:
                return {"count": 0, "min": 0.0, "max": 0.0, "avg": 0.0, "p95": 0.0}
            
            values.sort()
            count = len(values)
            min_val = values[0]
            max_val = values[-1]
            avg_val = sum(values) / count
            p95_idx = int(count * 0.95)
            p95_val = values[p95_idx] if p95_idx < count else values[-1]
            
            return {
                "count": count,
                "min": min_val,
                "max": max_val,
                "avg": avg_val,
                "p95": p95_val
            }
        except Exception as e:
            logger.error(f"Error getting histogram stats for {name}: {str(e)}")
            return {"error": str(e)}
    
    async def flush(self) -> None:
        """Flush metrics to external monitoring systems with real integration"""
        try:
            from app.services.monitoring_integration_service import MonitoringIntegrationService
            from app.services.metrics_export_service import MetricsExportService
            
            # Initialize monitoring services
            monitoring_service = MonitoringIntegrationService()
            export_service = MetricsExportService()
            
            # Get all current metrics
            all_metrics = await self.get_all_metrics()
            
            # Flush to external monitoring systems
            flush_results = []
            
            # 1. Flush to Prometheus/Grafana
            try:
                prometheus_result = await monitoring_service.flush_to_prometheus(all_metrics)
                flush_results.append(("prometheus", prometheus_result))
            except Exception as e:
                logger.warning(f"Failed to flush to Prometheus: {e}")
            
            # 2. Flush to CloudWatch/Azure Monitor
            try:
                cloud_monitoring_result = await monitoring_service.flush_to_cloud_monitoring(all_metrics)
                flush_results.append(("cloud_monitoring", cloud_monitoring_result))
            except Exception as e:
                logger.warning(f"Failed to flush to cloud monitoring: {e}")
            
            # 3. Flush to custom monitoring systems
            try:
                custom_result = await monitoring_service.flush_to_custom_systems(all_metrics)
                flush_results.append(("custom_systems", custom_result))
            except Exception as e:
                logger.warning(f"Failed to flush to custom systems: {e}")
            
            # 4. Export metrics for analysis
            try:
                export_result = await export_service.export_metrics_for_analysis(all_metrics)
                flush_results.append(("export", export_result))
            except Exception as e:
                logger.warning(f"Failed to export metrics: {e}")
            
            # Log successful flush
            successful_flushes = [result for result in flush_results if result[1].get("success", False)]
            logger.info(f"Metrics flushed successfully to {len(successful_flushes)} systems: {[r[0] for r in successful_flushes]}")
            
            # Clear local metrics after successful flush
            if successful_flushes:
                self._counters.clear()
                self._gauges.clear()
                self._histograms.clear()
                self._metrics.clear()
                
        except Exception as e:
            logger.error(f"Error flushing metrics: {str(e)}")
            # Don't clear metrics on error to preserve data
    
    async def get_all_metrics(self) -> Dict[str, Any]:
        """Get all current metrics"""
        try:
            return {
                "counters": self._counters.copy(),
                "gauges": self._gauges.copy(),
                "histograms": {name: await self.get_histogram_stats(name) for name in self._histograms.keys()},
                "total_metrics": len(self._metrics)
            }
        except Exception as e:
            logger.error(f"Error getting all metrics: {str(e)}")
            return {"error": str(e)}


class AlertManager:
    """Alert management for enterprise services"""
    
    def __init__(self):
        self._alerts: Dict[str, Alert] = {}
        self._alert_counter = 0
        self._lock = asyncio.Lock()
    
    async def create_alert(
        self, 
        title: str, 
        message: str, 
        severity: str = "info", 
        source: str = "", 
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a new alert"""
        try:
            async with self._lock:
                self._alert_counter += 1
                alert_id = f"alert_{self._alert_counter}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                
                alert = Alert(
                    id=alert_id,
                    title=title,
                    message=message,
                    severity=severity,
                    source=source,
                    metadata=metadata or {}
                )
                
                self._alerts[alert_id] = alert
                logger.info(f"Alert created: {alert_id} - {title} ({severity})")
                
                return alert_id
                
        except Exception as e:
            logger.error(f"Error creating alert: {str(e)}")
            return ""
    
    async def acknowledge_alert(self, alert_id: str, user: str = "") -> bool:
        """Acknowledge an alert"""
        try:
            async with self._lock:
                if alert_id in self._alerts:
                    self._alerts[alert_id].acknowledged = True
                    self._alerts[alert_id].metadata["acknowledged_by"] = user
                    self._alerts[alert_id].metadata["acknowledged_at"] = datetime.now().isoformat()
                    logger.info(f"Alert acknowledged: {alert_id}")
                    return True
                return False
        except Exception as e:
            logger.error(f"Error acknowledging alert {alert_id}: {str(e)}")
            return False
    
    async def resolve_alert(self, alert_id: str, user: str = "", resolution_notes: str = "") -> bool:
        """Resolve an alert"""
        try:
            async with self._lock:
                if alert_id in self._alerts:
                    self._alerts[alert_id].resolved = True
                    self._alerts[alert_id].metadata["resolved_by"] = user
                    self._alerts[alert_id].metadata["resolved_at"] = datetime.now().isoformat()
                    self._alerts[alert_id].metadata["resolution_notes"] = resolution_notes
                    logger.info(f"Alert resolved: {alert_id}")
                    return True
                return False
        except Exception as e:
            logger.error(f"Error resolving alert {alert_id}: {str(e)}")
            return False
    
    async def get_alert(self, alert_id: str) -> Optional[Alert]:
        """Get a specific alert"""
        return self._alerts.get(alert_id)
    
    async def get_active_alerts(self, severity: Optional[str] = None) -> List[Alert]:
        """Get active (unresolved) alerts"""
        try:
            alerts = [alert for alert in self._alerts.values() if not alert.resolved]
            if severity:
                alerts = [alert for alert in alerts if alert.severity == severity]
            return alerts
        except Exception as e:
            logger.error(f"Error getting active alerts: {str(e)}")
            return []
    
    async def get_alerts_by_severity(self, severity: str) -> List[Alert]:
        """Get alerts by severity level"""
        try:
            return [alert for alert in self._alerts.values() if alert.severity == severity]
        except Exception as e:
            logger.error(f"Error getting alerts by severity {severity}: {str(e)}")
            return []
    
    async def clear_resolved_alerts(self, older_than_days: int = 30) -> int:
        """Clear resolved alerts older than specified days"""
        try:
            cutoff_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            cutoff_date = cutoff_date.replace(day=cutoff_date.day - older_than_days)
            
            to_remove = []
            for alert_id, alert in self._alerts.items():
                if alert.resolved and alert.timestamp < cutoff_date:
                    to_remove.append(alert_id)
            
            async with self._lock:
                for alert_id in to_remove:
                    del self._alerts[alert_id]
            
            logger.info(f"Cleared {len(to_remove)} old resolved alerts")
            return len(to_remove)
            
        except Exception as e:
            logger.error(f"Error clearing resolved alerts: {str(e)}")
            return 0
    
    async def get_alert_summary(self) -> Dict[str, Any]:
        """Get alert summary statistics"""
        try:
            total_alerts = len(self._alerts)
            active_alerts = len([a for a in self._alerts.values() if not a.resolved])
            acknowledged_alerts = len([a for a in self._alerts.values() if a.acknowledged and not a.resolved])
            resolved_alerts = len([a for a in self._alerts.values() if a.resolved])
            
            severity_counts = {}
            for alert in self._alerts.values():
                severity = alert.severity
                if severity not in severity_counts:
                    severity_counts[severity] = 0
                severity_counts[severity] += 1
            
            return {
                "total_alerts": total_alerts,
                "active_alerts": active_alerts,
                "acknowledged_alerts": acknowledged_alerts,
                "resolved_alerts": resolved_alerts,
                "severity_distribution": severity_counts
            }
        except Exception as e:
            logger.error(f"Error getting alert summary: {str(e)}")
            return {"error": str(e)}

