"""
Realtime Analytics Service
=========================

Enterprise real-time analytics service for processing and streaming
analytics data in real-time across the data governance system.

This service provides:
- Real-time data processing and streaming
- Live analytics and insights
- Real-time monitoring and alerting
- Stream processing and aggregation
- Real-time visualization data
- Live dashboard updates
- Real-time event correlation
- Streaming analytics pipelines
"""

import logging
from typing import Dict, List, Any, Optional, AsyncGenerator
from datetime import datetime, timedelta
import json
import asyncio
from collections import deque
import uuid

logger = logging.getLogger(__name__)


class RealtimeAnalyticsService:
    """Enterprise real-time analytics service"""
    
    def __init__(self):
        self.data_streams = {}  # Active data streams
        self.analytics_processors = {}  # Analytics processors
        self.streaming_enabled = True
        self.analytics_cache = deque(maxlen=1000)  # Analytics cache
    
    async def get_realtime_stream(
        self,
        session: Any,
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get real-time analytics stream"""
        try:
            data_source_id = config.get("data_source_id")
            event_types = config.get("event_types")
            user_id = config.get("user_id")
            stream_type = config.get("stream_type", "websocket")
            
            # Check if streaming is available
            if not self.streaming_enabled:
                return {
                    "stream_available": False,
                    "message": "Real-time streaming is currently disabled"
                }
            
            # Create stream configuration
            stream_config = {
                "data_source_id": data_source_id,
                "event_types": event_types,
                "user_id": user_id,
                "stream_type": stream_type,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Generate stream ID
            stream_id = str(uuid.uuid4())
            
            # Initialize stream
            self.data_streams[stream_id] = {
                "config": stream_config,
                "active": True,
                "last_activity": datetime.utcnow(),
                "data_count": 0
            }
            
            # Create stream generator
            stream_generator = self._create_stream_generator(stream_id, stream_config)
            
            return {
                "stream_available": True,
                "stream_id": stream_id,
                "stream_generator": stream_generator,
                "config": stream_config
            }
            
        except Exception as e:
            logger.error(f"Error getting real-time stream: {e}")
            return {
                "stream_available": False,
                "error": str(e)
            }
    
    async def _create_stream_generator(
        self,
        stream_id: str,
        config: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Create real-time data stream generator"""
        try:
            while self.data_streams.get(stream_id, {}).get("active", False):
                # Generate real-time analytics data
                analytics_data = await self._generate_realtime_analytics(config)
                
                # Update stream statistics
                if stream_id in self.data_streams:
                    self.data_streams[stream_id]["data_count"] += 1
                    self.data_streams[stream_id]["last_activity"] = datetime.utcnow()
                
                # Yield data
                yield analytics_data
                
                # Schedule next update using scheduler service
                from .scheduler import SchedulerService
                scheduler = SchedulerService()
                await scheduler.schedule_task(
                    self._generate_realtime_analytics,
                    config,
                    delay_seconds=1.0
                )
                
        except Exception as e:
            logger.error(f"Error in stream generator: {e}")
            yield {"error": str(e), "timestamp": datetime.utcnow().isoformat()}
    
    async def _generate_realtime_analytics(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate real-time analytics data"""
        try:
            data_source_id = config.get("data_source_id")
            event_types = config.get("event_types")
            
            # Generate real-time analytics data from actual system metrics
            from .monitoring_integration_service import MonitoringIntegrationService
            from .data_source_connection_service import DataSourceConnectionService
            
            monitoring_service = MonitoringIntegrationService()
            connection_service = DataSourceConnectionService()
            
            # Get real system metrics
            system_metrics = await monitoring_service.get_system_metrics()
            connection_metrics = await connection_service.get_connection_statistics()
            
            analytics_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "data_source_id": data_source_id,
                "metrics": {
                    "active_connections": connection_metrics.get("active_connections", 0),
                    "requests_per_second": system_metrics.get("requests_per_second", 0),
                    "error_rate": system_metrics.get("error_rate", 0.0),
                    "response_time_ms": system_metrics.get("response_time_ms", 0),
                    "data_processed_mb": system_metrics.get("data_processed_mb", 0)
                },
                "events": await self._get_real_time_events(data_source_id, event_types),
                "alerts": await self._get_active_alerts(data_source_id),
                "insights": await self._generate_insights(data_source_id, system_metrics)
            }
            
            # Add to analytics cache
            self.analytics_cache.append(analytics_data)
            
            return analytics_data
            
        except Exception as e:
            logger.error(f"Error generating real-time analytics: {e}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e)
            }
    
    async def get_realtime_metrics(
        self,
        data_source_id: Optional[str] = None,
        metric_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Get real-time metrics"""
        try:
            # Get latest analytics data from cache
            if not self.analytics_cache:
                return {"error": "No analytics data available"}
            
            latest_data = self.analytics_cache[-1]
            
            # Filter by data source if specified
            if data_source_id and latest_data.get("data_source_id") != data_source_id:
                return {"error": f"No data for data source: {data_source_id}"}
            
            # Filter metrics if specified
            metrics = latest_data.get("metrics", {})
            if metric_types:
                metrics = {k: v for k, v in metrics.items() if k in metric_types}
            
            return {
                "success": True,
                "timestamp": latest_data.get("timestamp"),
                "metrics": metrics,
                "data_source_id": latest_data.get("data_source_id")
            }
            
        except Exception as e:
            logger.error(f"Error getting real-time metrics: {e}")
            return {"error": str(e)}
    
    async def get_realtime_events(
        self,
        event_types: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get real-time events"""
        try:
            events = []
            
            # Get events from cache
            for data in list(self.analytics_cache)[-limit:]:
                data_events = data.get("events", [])
                for event in data_events:
                    if event_types and event.get("event_type") not in event_types:
                        continue
                    events.append(event)
            
            return events[:limit]
            
        except Exception as e:
            logger.error(f"Error getting real-time events: {e}")
            return []
    
    async def get_realtime_alerts(
        self,
        severity_levels: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Get real-time alerts"""
        try:
            alerts = []
            
            # Get alerts from cache
            for data in list(self.analytics_cache)[-10:]:  # Last 10 data points
                data_alerts = data.get("alerts", [])
                for alert in data_alerts:
                    if severity_levels and alert.get("severity") not in severity_levels:
                        continue
                    alerts.append(alert)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error getting real-time alerts: {e}")
            return []
    
    async def get_realtime_insights(
        self,
        insight_types: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Get real-time insights"""
        try:
            insights = []
            
            # Get insights from cache
            for data in list(self.analytics_cache)[-5:]:  # Last 5 data points
                data_insights = data.get("insights", [])
                for insight in data_insights:
                    if insight_types and insight.get("type") not in insight_types:
                        continue
                    insights.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting real-time insights: {e}")
            return []
    
    async def stop_stream(self, stream_id: str) -> bool:
        """Stop a real-time stream"""
        try:
            if stream_id in self.data_streams:
                self.data_streams[stream_id]["active"] = False
                del self.data_streams[stream_id]
                logger.info(f"Stream stopped: {stream_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error stopping stream: {e}")
            return False
    
    async def get_stream_status(self) -> Dict[str, Any]:
        """Get real-time stream status"""
        try:
            active_streams = [
                stream_id for stream_id, stream_data in self.data_streams.items()
                if stream_data.get("active", False)
            ]
            
            return {
                "streaming_enabled": self.streaming_enabled,
                "active_streams": len(active_streams),
                "total_streams": len(self.data_streams),
                "analytics_cache_size": len(self.analytics_cache),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting stream status: {e}")
            return {"error": str(e)}
    
    async def clear_analytics_cache(self) -> int:
        """Clear analytics cache and return number of cleared items"""
        try:
            cleared_count = len(self.analytics_cache)
            self.analytics_cache.clear()
            logger.info(f"Analytics cache cleared: {cleared_count} items")
            return cleared_count
            
        except Exception as e:
            logger.error(f"Error clearing analytics cache: {e}")
            return 0
    
    async def enable_streaming(self) -> None:
        """Enable real-time streaming"""
        self.streaming_enabled = True
        logger.info("Real-time streaming enabled")
    
    async def disable_streaming(self) -> None:
        """Disable real-time streaming"""
        self.streaming_enabled = False
        logger.info("Real-time streaming disabled")

    async def _get_real_time_events(self, data_source_id: str, event_types: List[str]) -> List[Dict[str, Any]]:
        """Get real-time events from event streaming service"""
        try:
            from .event_streaming_service import EventStreamingService
            event_service = EventStreamingService()
            
            events = await event_service.get_recent_events(
                data_source_id=data_source_id,
                event_types=event_types,
                limit=10
            )
            
            return events.get("events", [])
            
        except Exception as e:
            logger.error(f"Error getting real-time events: {e}")
            return []

    async def _get_active_alerts(self, data_source_id: str) -> List[Dict[str, Any]]:
        """Get active alerts from monitoring service"""
        try:
            from .monitoring_integration_service import MonitoringIntegrationService
            monitoring_service = MonitoringIntegrationService()
            
            alerts = await monitoring_service.get_active_alerts(data_source_id)
            
            return alerts.get("alerts", [])
            
        except Exception as e:
            logger.error(f"Error getting active alerts: {e}")
            return []

    async def _generate_insights(self, data_source_id: str, system_metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate insights based on system metrics"""
        try:
            insights = []
            
            # Performance insights
            if system_metrics.get("response_time_ms", 0) > 200:
                insights.append({
                    "type": "performance",
                    "message": "Response time is above optimal threshold",
                    "confidence": 0.85,
                    "severity": "warning"
                })
            else:
                insights.append({
                    "type": "performance",
                    "message": "System performance is optimal",
                    "confidence": 0.95,
                    "severity": "info"
                })
            
            # Data quality insights
            if system_metrics.get("error_rate", 0.0) > 0.05:
                insights.append({
                    "type": "data_quality",
                    "message": "Error rate is above acceptable threshold",
                    "confidence": 0.90,
                    "severity": "warning"
                })
            else:
                insights.append({
                    "type": "data_quality",
                    "message": "Data quality metrics are within acceptable range",
                    "confidence": 0.88,
                    "severity": "info"
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return []
