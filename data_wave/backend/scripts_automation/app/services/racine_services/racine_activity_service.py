import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import uuid
import json

# Import existing services for integration
from ..data_source_service import DataSourceService
from ..scan_rule_set_service import ScanRuleSetService
from ..classification_service import EnterpriseClassificationService
from ..compliance_rule_service import ComplianceRuleService
from ..enterprise_catalog_service import EnterpriseIntelligentCatalogService
from ..unified_scan_orchestrator import UnifiedScanOrchestrator
from ..rbac_service import RBACService
from ..advanced_ai_service import AdvancedAIService
from ..comprehensive_analytics_service import ComprehensiveAnalyticsService

# Import racine models
from ...models.racine_models.racine_activity_models import (
    RacineActivity,
    RacineActivityLog,
    RacineActivityStream,
    RacineActivityStreamEvent,
    RacineActivityCorrelation,
    RacineActivityAnalytics,
    RacineActivityMetrics,
    RacineActivityAlert,
    RacineActivityAudit,
    ActivityType,
    ActivityStatus,
    ActivityCategory,
    StreamType,
    AlertSeverity
)
from ...models.auth_models import User

logger = logging.getLogger(__name__)


class RacineActivityService:
    """
    Advanced activity tracking service with real-time monitoring, correlation analysis,
    and comprehensive historic activities management across all system components.
    """

    def __init__(self, db_session: Session):
        """Initialize the activity service with database session and integrated services."""
        self.db = db_session

        # CRITICAL: Initialize ALL existing services for full integration
        self.data_source_service = DataSourceService(db_session)
        self.scan_rule_service = ScanRuleSetService(db_session)
        self.classification_service = EnterpriseClassificationService(db_session)
        self.compliance_service = ComplianceRuleService(db_session)
        self.catalog_service = EnterpriseIntelligentCatalogService(db_session)
        self.scan_orchestrator = UnifiedScanOrchestrator(db_session)
        self.rbac_service = RBACService(db_session)
        self.advanced_ai_service = AdvancedAIService(db_session)
        self.analytics_service = ComprehensiveAnalyticsService(db_session)

        # Service registry for dynamic access
        self.service_registry = {
            'data_sources': self.data_source_service,
            'scan_rule_sets': self.scan_rule_service,
            'classifications': self.classification_service,
            'compliance_rules': self.compliance_service,
            'advanced_catalog': self.catalog_service,
            'scan_logic': self.scan_orchestrator,
            'rbac_system': self.rbac_service,
            'ai_service': self.advanced_ai_service,
            'analytics': self.analytics_service
        }

        logger.info("RacineActivityService initialized with full cross-group integration")

    async def track_activity(
        self,
        activity_type: ActivityType,
        activity_category: ActivityCategory,
        user_id: str,
        resource_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        workspace_id: Optional[str] = None,
        group_name: Optional[str] = None
    ) -> RacineActivity:
        """
        Track a new activity with comprehensive metadata and cross-group context.

        Args:
            activity_type: Type of activity
            activity_category: Category of activity
            user_id: User performing the activity
            resource_id: Optional resource ID involved
            resource_type: Optional resource type
            details: Activity details and metadata
            workspace_id: Optional workspace context
            group_name: Optional group context

        Returns:
            Created activity record
        """
        try:
            logger.info(f"Tracking activity {activity_type.value} by user {user_id}")

            # Enrich activity with contextual data
            enriched_details = await self._enrich_activity_details(
                activity_type, details or {}, user_id, resource_id, resource_type, group_name
            )

            # Create activity record
            activity = RacineActivity(
                activity_type=activity_type,
                activity_category=activity_category,
                user_id=user_id,
                resource_id=resource_id,
                resource_type=resource_type,
                activity_data=enriched_details,
                workspace_id=workspace_id,
                group_name=group_name,
                status=ActivityStatus.COMPLETED,
                metadata={
                    "tracking_source": "api",
                    "session_id": enriched_details.get("session_id"),
                    "ip_address": enriched_details.get("ip_address"),
                    "user_agent": enriched_details.get("user_agent"),
                    "enriched": True
                }
            )

            self.db.add(activity)
            self.db.flush()

            # Create detailed activity log
            await self._create_activity_log(activity, enriched_details)

            # Trigger real-time stream events
            await self._trigger_stream_events(activity)

            # Analyze for correlations
            await self._analyze_activity_correlations(activity)

            # Check for alert conditions
            await self._check_activity_alerts(activity)

            # Update activity metrics
            await self._update_activity_metrics(activity)

            self.db.commit()
            logger.info(f"Successfully tracked activity {activity.id}")

            return activity

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error tracking activity: {str(e)}")
            raise

    async def get_activity_history(
        self,
        user_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        group_name: Optional[str] = None,
        activity_type: Optional[ActivityType] = None,
        time_range: Optional[Dict[str, datetime]] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get comprehensive activity history with filtering and analytics.

        Args:
            user_id: Optional filter by user
            resource_id: Optional filter by resource
            workspace_id: Optional filter by workspace
            group_name: Optional filter by group
            activity_type: Optional filter by activity type
            time_range: Optional time range filter
            limit: Number of results to return
            offset: Offset for pagination

        Returns:
            Activity history with analytics
        """
        try:
            # Build query with filters
            query = self.db.query(RacineActivity)

            if user_id:
                query = query.filter(RacineActivity.user_id == user_id)
            if resource_id:
                query = query.filter(RacineActivity.resource_id == resource_id)
            if workspace_id:
                query = query.filter(RacineActivity.workspace_id == workspace_id)
            if group_name:
                query = query.filter(RacineActivity.group_name == group_name)
            if activity_type:
                query = query.filter(RacineActivity.activity_type == activity_type)

            if time_range:
                if "start" in time_range:
                    query = query.filter(RacineActivity.created_at >= time_range["start"])
                if "end" in time_range:
                    query = query.filter(RacineActivity.created_at <= time_range["end"])

            # Get total count
            total_count = query.count()

            # Get activities with pagination
            activities = query.order_by(RacineActivity.created_at.desc()).offset(offset).limit(limit).all()

            # Enrich activities with related data
            enriched_activities = await self._enrich_activities_with_logs(activities)

            # Get activity analytics
            analytics = await self._get_activity_analytics(
                user_id, resource_id, workspace_id, group_name, time_range
            )

            return {
                "activities": enriched_activities,
                "total_count": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": offset + limit < total_count,
                "analytics": analytics,
                "time_range": time_range,
                "generated_at": datetime.utcnow()
            }

        except Exception as e:
            logger.error(f"Error getting activity history: {str(e)}")
            raise

    async def create_activity_stream(
        self,
        stream_name: str,
        stream_type: StreamType,
        user_id: str,
        configuration: Dict[str, Any],
        workspace_id: Optional[str] = None
    ) -> RacineActivityStream:
        """
        Create a real-time activity stream with custom configuration.

        Args:
            stream_name: Name of the stream
            stream_type: Type of stream
            user_id: User creating the stream
            configuration: Stream configuration
            workspace_id: Optional workspace context

        Returns:
            Created activity stream
        """
        try:
            logger.info(f"Creating activity stream '{stream_name}' of type {stream_type.value}")

            # Validate and enhance configuration
            enhanced_config = await self._enhance_stream_configuration(
                stream_type, configuration, user_id, workspace_id
            )

            # Create stream
            stream = RacineActivityStream(
                stream_name=stream_name,
                stream_type=stream_type,
                user_id=user_id,
                workspace_id=workspace_id,
                configuration=enhanced_config,
                filter_criteria=configuration.get("filters", {}),
                is_active=True,
                metadata={
                    "creation_source": "api",
                    "enhanced": True,
                    "real_time": stream_type in [StreamType.REAL_TIME, StreamType.DASHBOARD]
                }
            )

            self.db.add(stream)
            self.db.flush()

            # Initialize stream with current activities
            await self._initialize_stream_events(stream)

            self.db.commit()
            logger.info(f"Successfully created activity stream {stream.id}")

            return stream

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating activity stream: {str(e)}")
            raise

    async def get_stream_events(
        self,
        stream_id: str,
        user_id: str,
        limit: int = 50,
        since_timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get events for an activity stream.

        Args:
            stream_id: Stream ID
            user_id: User requesting events
            limit: Number of events to return
            since_timestamp: Optional timestamp filter

        Returns:
            Stream events and metadata
        """
        try:
            # Verify stream access
            stream = await self._get_stream_with_access_check(stream_id, user_id)
            if not stream:
                raise ValueError(f"Stream {stream_id} not found or not accessible")

            # Build query
            query = self.db.query(RacineActivityStreamEvent).filter(
                RacineActivityStreamEvent.stream_id == stream_id
            )

            if since_timestamp:
                query = query.filter(RacineActivityStreamEvent.created_at >= since_timestamp)

            # Get events
            events = query.order_by(RacineActivityStreamEvent.created_at.desc()).limit(limit).all()

            # Get stream statistics
            stream_stats = await self._get_stream_statistics(stream_id)

            return {
                "stream": stream,
                "events": events,
                "event_count": len(events),
                "stream_statistics": stream_stats,
                "has_more": len(events) == limit,
                "latest_timestamp": events[0].created_at if events else None,
                "retrieved_at": datetime.utcnow()
            }

        except Exception as e:
            logger.error(f"Error getting stream events: {str(e)}")
            raise

    async def analyze_activity_correlations(
        self,
        activity_id: str,
        correlation_window_minutes: int = 60,
        include_cross_group: bool = True
    ) -> List[RacineActivityCorrelation]:
        """
        Analyze correlations for a specific activity.

        Args:
            activity_id: Activity ID to analyze
            correlation_window_minutes: Time window for correlation analysis
            include_cross_group: Whether to include cross-group correlations

        Returns:
            List of discovered correlations
        """
        try:
            logger.info(f"Analyzing correlations for activity {activity_id}")

            # Get the target activity
            activity = self.db.query(RacineActivity).filter(
                RacineActivity.id == activity_id
            ).first()

            if not activity:
                raise ValueError(f"Activity {activity_id} not found")

            # Define correlation time window
            time_start = activity.created_at - timedelta(minutes=correlation_window_minutes)
            time_end = activity.created_at + timedelta(minutes=correlation_window_minutes)

            # Find related activities
            related_activities = await self._find_related_activities(
                activity, time_start, time_end, include_cross_group
            )

            # Analyze correlations
            correlations = []
            for related_activity in related_activities:
                correlation = await self._analyze_activity_pair_correlation(activity, related_activity)
                if correlation and correlation.correlation_strength > 0.5:  # Threshold for significance
                    correlations.append(correlation)

            # Save correlations
            for correlation in correlations:
                self.db.add(correlation)

            self.db.commit()
            logger.info(f"Found {len(correlations)} significant correlations for activity {activity_id}")

            return correlations

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error analyzing activity correlations: {str(e)}")
            raise

    async def get_activity_analytics(
        self,
        analytics_type: str = "comprehensive",
        time_range: Optional[Dict[str, datetime]] = None,
        workspace_id: Optional[str] = None,
        group_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive activity analytics and insights.

        Args:
            analytics_type: Type of analytics to generate
            time_range: Optional time range
            workspace_id: Optional workspace filter
            group_name: Optional group filter

        Returns:
            Comprehensive activity analytics
        """
        try:
            # Get activity volume analytics
            volume_analytics = await self._get_activity_volume_analytics(time_range, workspace_id, group_name)

            # Get user activity patterns
            user_patterns = await self._get_user_activity_patterns(time_range, workspace_id, group_name)

            # Get resource usage analytics
            resource_analytics = await self._get_resource_activity_analytics(time_range, workspace_id, group_name)

            # Get cross-group activity correlation
            cross_group_analytics = await self._get_cross_group_activity_analytics(time_range, workspace_id)

            # Get performance and trend analytics
            performance_analytics = await self._get_activity_performance_analytics(time_range, workspace_id, group_name)

            # Get alert and anomaly analytics
            alert_analytics = await self._get_activity_alert_analytics(time_range, workspace_id, group_name)

            return {
                "analytics_type": analytics_type,
                "volume_analytics": volume_analytics,
                "user_patterns": user_patterns,
                "resource_analytics": resource_analytics,
                "cross_group_analytics": cross_group_analytics,
                "performance_analytics": performance_analytics,
                "alert_analytics": alert_analytics,
                "generated_at": datetime.utcnow(),
                "time_range": time_range
            }

        except Exception as e:
            logger.error(f"Error getting activity analytics: {str(e)}")
            raise

    async def create_activity_alert(
        self,
        alert_name: str,
        alert_criteria: Dict[str, Any],
        user_id: str,
        severity: AlertSeverity = AlertSeverity.MEDIUM,
        workspace_id: Optional[str] = None
    ) -> RacineActivityAlert:
        """
        Create an activity-based alert with custom criteria.

        Args:
            alert_name: Name of the alert
            alert_criteria: Alert criteria and conditions
            user_id: User creating the alert
            severity: Alert severity level
            workspace_id: Optional workspace context

        Returns:
            Created activity alert
        """
        try:
            logger.info(f"Creating activity alert '{alert_name}' with severity {severity.value}")

            # Validate and enhance alert criteria
            enhanced_criteria = await self._enhance_alert_criteria(alert_criteria, user_id, workspace_id)

            # Create alert
            alert = RacineActivityAlert(
                alert_name=alert_name,
                alert_criteria=enhanced_criteria,
                user_id=user_id,
                workspace_id=workspace_id,
                severity=severity,
                is_active=True,
                notification_config={
                    "email_enabled": True,
                    "dashboard_enabled": True,
                    "webhook_enabled": False
                },
                metadata={
                    "creation_source": "api",
                    "enhanced": True,
                    "auto_generated": False
                }
            )

            self.db.add(alert)
            self.db.commit()

            logger.info(f"Successfully created activity alert {alert.id}")
            return alert

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating activity alert: {str(e)}")
            raise

    # Private helper methods

    async def _enrich_activity_details(
        self,
        activity_type: ActivityType,
        details: Dict[str, Any],
        user_id: str,
        resource_id: Optional[str],
        resource_type: Optional[str],
        group_name: Optional[str]
    ) -> Dict[str, Any]:
        """Enrich activity details with contextual information."""
        try:
            enriched = details.copy()

            # Add user context
            user_context = await self._get_user_context(user_id)
            enriched["user_context"] = user_context

            # Add resource context if available
            if resource_id and resource_type and group_name:
                resource_context = await self._get_resource_context(resource_id, resource_type, group_name)
                enriched["resource_context"] = resource_context

            # Add system context
            enriched["system_context"] = {
                "timestamp": datetime.utcnow().isoformat(),
                "activity_id": str(uuid.uuid4()),
                "system_version": "1.0.0"
            }

            # Add cross-group context
            if group_name:
                cross_group_context = await self._get_cross_group_context(group_name, activity_type)
                enriched["cross_group_context"] = cross_group_context

            return enriched

        except Exception as e:
            logger.error(f"Error enriching activity details: {str(e)}")
            return details

    async def _create_activity_log(self, activity: RacineActivity, details: Dict[str, Any]):
        """Create detailed activity log entry."""
        try:
            log_entry = RacineActivityLog(
                activity_id=activity.id,
                log_level="INFO",
                log_message=f"Activity {activity.activity_type.value} performed by user {activity.user_id}",
                log_data=details,
                source_component="activity_tracker",
                metadata={
                    "activity_type": activity.activity_type.value,
                    "activity_category": activity.activity_category.value,
                    "has_resource": activity.resource_id is not None
                }
            )

            self.db.add(log_entry)

        except Exception as e:
            logger.error(f"Error creating activity log: {str(e)}")

    async def _trigger_stream_events(self, activity: RacineActivity):
        """Trigger real-time stream events for the activity."""
        try:
            # Find active streams that match this activity
            streams = await self._find_matching_streams(activity)

            for stream in streams:
                # Create stream event
                event = RacineActivityStreamEvent(
                    stream_id=stream.id,
                    activity_id=activity.id,
                    event_data={
                        "activity_type": activity.activity_type.value,
                        "user_id": activity.user_id,
                        "resource_id": activity.resource_id,
                        "timestamp": activity.created_at.isoformat()
                    },
                    metadata={
                        "stream_type": stream.stream_type.value,
                        "real_time": True,
                        "auto_generated": True
                    }
                )

                self.db.add(event)

        except Exception as e:
            logger.error(f"Error triggering stream events: {str(e)}")

    async def _analyze_activity_correlations(self, activity: RacineActivity):
        """Analyze correlations for the activity."""
        try:
            # Look for activities within correlation window
            correlation_window = timedelta(minutes=30)
            time_start = activity.created_at - correlation_window
            time_end = activity.created_at + correlation_window

            # Find potentially related activities
            related_activities = self.db.query(RacineActivity).filter(
                and_(
                    RacineActivity.created_at >= time_start,
                    RacineActivity.created_at <= time_end,
                    RacineActivity.id != activity.id
                )
            ).limit(20).all()

            # Analyze each potential correlation
            for related_activity in related_activities:
                correlation_strength = await self._calculate_correlation_strength(activity, related_activity)
                
                if correlation_strength > 0.7:  # High correlation threshold
                    correlation = RacineActivityCorrelation(
                        primary_activity_id=activity.id,
                        related_activity_id=related_activity.id,
                        correlation_type="temporal",
                        correlation_strength=correlation_strength,
                        correlation_data={
                            "time_diff_seconds": abs((activity.created_at - related_activity.created_at).total_seconds()),
                            "same_user": activity.user_id == related_activity.user_id,
                            "same_resource": activity.resource_id == related_activity.resource_id
                        }
                    )
                    self.db.add(correlation)

        except Exception as e:
            logger.error(f"Error analyzing activity correlations: {str(e)}")

    async def _check_activity_alerts(self, activity: RacineActivity):
        """Check if activity triggers any alerts."""
        try:
            # Get active alerts
            active_alerts = self.db.query(RacineActivityAlert).filter(
                RacineActivityAlert.is_active == True
            ).all()

            for alert in active_alerts:
                if await self._activity_matches_alert_criteria(activity, alert):
                    # Trigger alert
                    await self._trigger_activity_alert(alert, activity)

        except Exception as e:
            logger.error(f"Error checking activity alerts: {str(e)}")

    async def _update_activity_metrics(self, activity: RacineActivity):
        """Update activity metrics."""
        try:
            # Update or create metrics for this activity type
            metrics = self.db.query(RacineActivityMetrics).filter(
                and_(
                    RacineActivityMetrics.metric_name == f"activity_{activity.activity_type.value}",
                    RacineActivityMetrics.workspace_id == activity.workspace_id
                )
            ).first()

            if metrics:
                metrics.metric_value += 1
                metrics.last_updated = datetime.utcnow()
            else:
                metrics = RacineActivityMetrics(
                    metric_name=f"activity_{activity.activity_type.value}",
                    metric_value=1.0,
                    metric_unit="count",
                    workspace_id=activity.workspace_id,
                    metrics_data={
                        "activity_type": activity.activity_type.value,
                        "first_recorded": datetime.utcnow().isoformat()
                    }
                )
                self.db.add(metrics)

        except Exception as e:
            logger.error(f"Error updating activity metrics: {str(e)}")

    # Placeholder methods for various operations

    async def _get_user_context(self, user_id: str) -> Dict[str, Any]:
        """Get user context information."""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            return {
                "user_id": user_id,
                "username": getattr(user, 'username', 'Unknown') if user else 'Unknown',
                "role": getattr(user, 'role', 'user') if user else 'user'
            }
        except Exception as e:
            logger.error(f"Error getting user context: {str(e)}")
            return {"user_id": user_id}

    async def _get_resource_context(self, resource_id: str, resource_type: str, group_name: str) -> Dict[str, Any]:
        """Get resource context information."""
        return {
            "resource_id": resource_id,
            "resource_type": resource_type,
            "group_name": group_name,
            "context_retrieved": datetime.utcnow().isoformat()
        }

    async def _get_cross_group_context(self, group_name: str, activity_type: ActivityType) -> Dict[str, Any]:
        """Get cross-group context for the activity."""
        return {
            "group_name": group_name,
            "activity_type": activity_type.value,
            "cross_group_services": list(self.service_registry.keys())
        }

    async def _find_matching_streams(self, activity: RacineActivity) -> List[RacineActivityStream]:
        """Find streams that match the activity."""
        try:
            streams = self.db.query(RacineActivityStream).filter(
                RacineActivityStream.is_active == True
            ).all()

            matching_streams = []
            for stream in streams:
                if await self._activity_matches_stream_filter(activity, stream):
                    matching_streams.append(stream)

            return matching_streams

        except Exception as e:
            logger.error(f"Error finding matching streams: {str(e)}")
            return []

    async def _activity_matches_stream_filter(self, activity: RacineActivity, stream: RacineActivityStream) -> bool:
        """Check if activity matches stream filter criteria."""
        try:
            filter_criteria = stream.filter_criteria or {}
            
            # Check activity type filter
            if "activity_types" in filter_criteria:
                if activity.activity_type.value not in filter_criteria["activity_types"]:
                    return False

            # Check user filter
            if "user_ids" in filter_criteria:
                if activity.user_id not in filter_criteria["user_ids"]:
                    return False

            # Check workspace filter
            if "workspace_ids" in filter_criteria:
                if activity.workspace_id not in filter_criteria["workspace_ids"]:
                    return False

            return True

        except Exception as e:
            logger.error(f"Error checking stream filter match: {str(e)}")
            return False

    async def _calculate_correlation_strength(self, activity1: RacineActivity, activity2: RacineActivity) -> float:
        """Calculate correlation strength between two activities."""
        try:
            strength = 0.0

            # Time proximity factor
            time_diff = abs((activity1.created_at - activity2.created_at).total_seconds())
            if time_diff < 300:  # 5 minutes
                strength += 0.3

            # Same user factor
            if activity1.user_id == activity2.user_id:
                strength += 0.3

            # Same resource factor
            if activity1.resource_id == activity2.resource_id and activity1.resource_id is not None:
                strength += 0.4

            # Same workspace factor
            if activity1.workspace_id == activity2.workspace_id and activity1.workspace_id is not None:
                strength += 0.2

            return min(strength, 1.0)

        except Exception as e:
            logger.error(f"Error calculating correlation strength: {str(e)}")
            return 0.0

    async def _activity_matches_alert_criteria(self, activity: RacineActivity, alert: RacineActivityAlert) -> bool:
        """Check if activity matches alert criteria."""
        try:
            criteria = alert.alert_criteria or {}

            # Check activity type
            if "activity_types" in criteria:
                if activity.activity_type.value not in criteria["activity_types"]:
                    return False

            # Check frequency threshold
            if "frequency_threshold" in criteria:
                # Check if this activity type exceeds frequency threshold
                threshold = criteria["frequency_threshold"]
                time_window = criteria.get("time_window_minutes", 60)
                
                recent_count = await self._count_recent_activities(
                    activity.activity_type, activity.user_id, time_window
                )
                
                if recent_count >= threshold:
                    return True

            return False

        except Exception as e:
            logger.error(f"Error checking alert criteria: {str(e)}")
            return False

    async def _trigger_activity_alert(self, alert: RacineActivityAlert, activity: RacineActivity):
        """Trigger an activity alert."""
        try:
            logger.warning(f"Activity alert triggered: {alert.alert_name} for activity {activity.id}")
            
            # Update alert trigger count
            alert.trigger_count = (alert.trigger_count or 0) + 1
            alert.last_triggered = datetime.utcnow()

        except Exception as e:
            logger.error(f"Error triggering activity alert: {str(e)}")

    async def _count_recent_activities(self, activity_type: ActivityType, user_id: str, time_window_minutes: int) -> int:
        """Count recent activities of a specific type for a user."""
        try:
            time_threshold = datetime.utcnow() - timedelta(minutes=time_window_minutes)
            
            count = self.db.query(RacineActivity).filter(
                and_(
                    RacineActivity.activity_type == activity_type,
                    RacineActivity.user_id == user_id,
                    RacineActivity.created_at >= time_threshold
                )
            ).count()

            return count

        except Exception as e:
            logger.error(f"Error counting recent activities: {str(e)}")
            return 0

    # Additional placeholder methods for comprehensive functionality

    async def _enrich_activities_with_logs(self, activities: List[RacineActivity]) -> List[Dict[str, Any]]:
        """Enrich activities with log data."""
        enriched = []
        for activity in activities:
            logs = self.db.query(RacineActivityLog).filter(
                RacineActivityLog.activity_id == activity.id
            ).limit(5).all()
            
            enriched.append({
                "activity": activity,
                "logs": logs,
                "log_count": len(logs)
            })
        
        return enriched

    async def _get_activity_analytics(self, user_id, resource_id, workspace_id, group_name, time_range) -> Dict[str, Any]:
        """Get analytics for activities."""
        return {
            "total_activities": 0,
            "unique_users": 0,
            "top_activity_types": [],
            "activity_distribution": {}
        }

    async def _enhance_stream_configuration(self, stream_type, configuration, user_id, workspace_id) -> Dict[str, Any]:
        """Enhance stream configuration with defaults."""
        enhanced = configuration.copy()
        enhanced["stream_type"] = stream_type.value
        enhanced["real_time_enabled"] = stream_type in [StreamType.REAL_TIME, StreamType.DASHBOARD]
        enhanced["buffer_size"] = configuration.get("buffer_size", 100)
        return enhanced

    async def _initialize_stream_events(self, stream: RacineActivityStream):
        """Initialize stream with current activities."""
        pass

    async def _get_stream_with_access_check(self, stream_id: str, user_id: str) -> Optional[RacineActivityStream]:
        """Get stream with access control."""
        return self.db.query(RacineActivityStream).filter(
            and_(
                RacineActivityStream.id == stream_id,
                RacineActivityStream.user_id == user_id
            )
        ).first()

    async def _get_stream_statistics(self, stream_id: str) -> Dict[str, Any]:
        """Get statistics for a stream."""
        return {
            "total_events": 0,
            "events_per_hour": 0,
            "active_since": datetime.utcnow().isoformat()
        }

    async def _find_related_activities(self, activity, time_start, time_end, include_cross_group) -> List[RacineActivity]:
        """Find related activities within time window."""
        query = self.db.query(RacineActivity).filter(
            and_(
                RacineActivity.created_at >= time_start,
                RacineActivity.created_at <= time_end,
                RacineActivity.id != activity.id
            )
        )
        
        return query.limit(50).all()

    async def _analyze_activity_pair_correlation(self, activity1, activity2) -> Optional[RacineActivityCorrelation]:
        """Analyze correlation between two activities."""
        strength = await self._calculate_correlation_strength(activity1, activity2)
        
        if strength > 0.5:
            return RacineActivityCorrelation(
                primary_activity_id=activity1.id,
                related_activity_id=activity2.id,
                correlation_type="temporal",
                correlation_strength=strength,
                correlation_data={}
            )
        
        return None

    async def _enhance_alert_criteria(self, criteria, user_id, workspace_id) -> Dict[str, Any]:
        """Enhance alert criteria with defaults."""
        enhanced = criteria.copy()
        enhanced["user_id"] = user_id
        enhanced["workspace_id"] = workspace_id
        enhanced["enhanced_at"] = datetime.utcnow().isoformat()
        return enhanced

    # Analytics methods (placeholder implementations)
    async def _get_activity_volume_analytics(self, time_range, workspace_id, group_name) -> Dict[str, Any]:
        return {"volume_trend": "increasing", "peak_hours": [9, 14, 16]}

    async def _get_user_activity_patterns(self, time_range, workspace_id, group_name) -> Dict[str, Any]:
        return {"most_active_users": [], "activity_patterns": {}}

    async def _get_resource_activity_analytics(self, time_range, workspace_id, group_name) -> Dict[str, Any]:
        return {"most_accessed_resources": [], "resource_activity_trends": {}}

    async def _get_cross_group_activity_analytics(self, time_range, workspace_id) -> Dict[str, Any]:
        return {"cross_group_correlations": [], "group_activity_distribution": {}}

    async def _get_activity_performance_analytics(self, time_range, workspace_id, group_name) -> Dict[str, Any]:
        return {"performance_trends": "stable", "bottlenecks": []}

    async def _get_activity_alert_analytics(self, time_range, workspace_id, group_name) -> Dict[str, Any]:
        return {"total_alerts": 0, "alert_trends": "stable", "top_alert_types": []}