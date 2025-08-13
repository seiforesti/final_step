from sqlmodel import Session, select, func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.models.performance_models import (
    PerformanceMetric, PerformanceAlert, PerformanceBaseline,
    PerformanceMetricResponse, PerformanceAlertResponse, PerformanceOverviewResponse,
    PerformanceMetricCreate, PerformanceAlertCreate,
    PerformanceMetricUpdate, PerformanceAlertUpdate,
    MetricType, MetricStatus
)
from app.models.scan_models import DataSource
import logging
import statistics

logger = logging.getLogger(__name__)


class PerformanceService:
    """Service layer for performance management"""
    
    @staticmethod
    def get_performance_metrics(
        session: Session, 
        data_source_id: int, 
        time_range: str = "24h",
        metric_types: Optional[List[MetricType]] = None
    ) -> PerformanceOverviewResponse:
        """Get comprehensive performance metrics for a data source"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, data_source_id)
            if not data_source:
                raise ValueError(f"Data source {data_source_id} not found")
            
            # Calculate time range
            time_delta = PerformanceService._parse_time_range(time_range)
            since_time = datetime.now() - time_delta
            
            # Build query
            query = select(PerformanceMetric).where(
                and_(
                    PerformanceMetric.data_source_id == data_source_id,
                    PerformanceMetric.measurement_time >= since_time
                )
            )
            
            if metric_types:
                query = query.where(PerformanceMetric.metric_type.in_(metric_types))
            
            # Get latest metrics for each type
            metrics = session.exec(query.order_by(PerformanceMetric.measurement_time.desc())).all()
            
            # Group by metric type and get the latest for each
            latest_metrics = {}
            for metric in metrics:
                if metric.metric_type not in latest_metrics:
                    latest_metrics[metric.metric_type] = metric
            
            # Convert to response format
            metric_responses = [
                PerformanceMetricResponse.from_orm(metric) 
                for metric in latest_metrics.values()
            ]
            
            # Get active alerts
            alerts = PerformanceService.get_active_alerts(session, data_source_id)
            
            # Calculate overall score
            overall_score = PerformanceService._calculate_overall_score(list(latest_metrics.values()))
            
            # Generate trends
            trends = PerformanceService._generate_trends(session, data_source_id, time_range)
            
            # Generate recommendations
            recommendations = PerformanceService._generate_recommendations(
                list(latest_metrics.values()), alerts
            )
            
            return PerformanceOverviewResponse(
                overall_score=overall_score,
                metrics=metric_responses,
                alerts=alerts,
                trends=trends,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Error getting performance metrics for data source {data_source_id}: {str(e)}")
            raise
    
    @staticmethod
    def record_metric(
        session: Session, 
        metric_data: PerformanceMetricCreate,
        user_id: str
    ) -> PerformanceMetricResponse:
        """Record a new performance metric"""
        try:
            # Verify data source exists
            data_source = session.get(DataSource, metric_data.data_source_id)
            if not data_source:
                raise ValueError(f"Data source {metric_data.data_source_id} not found")
            
            # Get previous metric for trend calculation
            previous_metric = PerformanceService._get_latest_metric(
                session, metric_data.data_source_id, metric_data.metric_type
            )
            
            # Calculate trend and change percentage
            trend = "stable"
            change_percentage = None
            if previous_metric:
                if metric_data.value > previous_metric.value:
                    trend = "improving" if metric_data.metric_type in [MetricType.THROUGHPUT] else "degrading"
                elif metric_data.value < previous_metric.value:
                    trend = "degrading" if metric_data.metric_type in [MetricType.THROUGHPUT] else "improving"
                
                change_percentage = ((metric_data.value - previous_metric.value) / previous_metric.value) * 100
            
            # Determine status based on thresholds
            status = PerformanceService._determine_status(
                metric_data.value, metric_data.threshold, metric_data.metric_type
            )
            
            # Create metric
            metric = PerformanceMetric(
                data_source_id=metric_data.data_source_id,
                metric_type=metric_data.metric_type,
                value=metric_data.value,
                unit=metric_data.unit,
                threshold=metric_data.threshold,
                status=status,
                trend=trend,
                previous_value=previous_metric.value if previous_metric else None,
                change_percentage=change_percentage,
                time_range=metric_data.time_range,
                metadata=metric_data.metadata
            )
            
            session.add(metric)
            session.commit()
            session.refresh(metric)
            
            # Check for alerts
            PerformanceService._check_and_create_alerts(session, metric, user_id)
            
            return PerformanceMetricResponse.from_orm(metric)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error recording performance metric: {str(e)}")
            raise
    
    @staticmethod
    def get_active_alerts(session: Session, data_source_id: int) -> List[PerformanceAlertResponse]:
        """Get active performance alerts for a data source"""
        try:
            statement = select(PerformanceAlert).where(
                and_(
                    PerformanceAlert.data_source_id == data_source_id,
                    PerformanceAlert.status == "active"
                )
            ).order_by(PerformanceAlert.created_at.desc())
            
            alerts = session.exec(statement).all()
            return [PerformanceAlertResponse.from_orm(alert) for alert in alerts]
            
        except Exception as e:
            logger.error(f"Error getting alerts for data source {data_source_id}: {str(e)}")
            return []
    
    @staticmethod
    def acknowledge_alert(
        session: Session, 
        alert_id: int, 
        user_id: str
    ) -> PerformanceAlertResponse:
        """Acknowledge a performance alert"""
        try:
            alert = session.get(PerformanceAlert, alert_id)
            if not alert:
                raise ValueError(f"Alert {alert_id} not found")
            
            alert.status = "acknowledged"
            alert.acknowledged_by = user_id
            alert.acknowledged_at = datetime.now()
            alert.updated_at = datetime.now()
            
            session.add(alert)
            session.commit()
            session.refresh(alert)
            
            return PerformanceAlertResponse.from_orm(alert)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error acknowledging alert {alert_id}: {str(e)}")
            raise
    
    @staticmethod
    def resolve_alert(
        session: Session, 
        alert_id: int, 
        user_id: str
    ) -> PerformanceAlertResponse:
        """Resolve a performance alert"""
        try:
            alert = session.get(PerformanceAlert, alert_id)
            if not alert:
                raise ValueError(f"Alert {alert_id} not found")
            
            alert.status = "resolved"
            alert.resolved_at = datetime.now()
            alert.updated_at = datetime.now()
            
            session.add(alert)
            session.commit()
            session.refresh(alert)
            
            return PerformanceAlertResponse.from_orm(alert)
            
        except Exception as e:
            session.rollback()
            logger.error(f"Error resolving alert {alert_id}: {str(e)}")
            raise
    
    @staticmethod
    def _parse_time_range(time_range: str) -> timedelta:
        """Parse time range string to timedelta"""
        if time_range.endswith('h'):
            hours = int(time_range[:-1])
            return timedelta(hours=hours)
        elif time_range.endswith('d'):
            days = int(time_range[:-1])
            return timedelta(days=days)
        elif time_range.endswith('w'):
            weeks = int(time_range[:-1])
            return timedelta(weeks=weeks)
        else:
            return timedelta(hours=24)  # Default to 24 hours
    
    @staticmethod
    def _get_latest_metric(
        session: Session, 
        data_source_id: int, 
        metric_type: MetricType
    ) -> Optional[PerformanceMetric]:
        """Get the latest metric of a specific type for a data source"""
        statement = select(PerformanceMetric).where(
            and_(
                PerformanceMetric.data_source_id == data_source_id,
                PerformanceMetric.metric_type == metric_type
            )
        ).order_by(PerformanceMetric.measurement_time.desc()).limit(1)
        
        return session.exec(statement).first()
    
    @staticmethod
    def _determine_status(value: float, threshold: Optional[float], metric_type: MetricType) -> MetricStatus:
        """Determine metric status based on value and threshold"""
        if not threshold:
            return MetricStatus.UNKNOWN
        
        # For error rates, higher is worse
        if metric_type == MetricType.ERROR_RATE:
            if value <= threshold * 0.5:
                return MetricStatus.GOOD
            elif value <= threshold:
                return MetricStatus.WARNING
            else:
                return MetricStatus.CRITICAL
        
        # For response time, higher is worse
        elif metric_type == MetricType.RESPONSE_TIME:
            if value <= threshold * 0.7:
                return MetricStatus.GOOD
            elif value <= threshold:
                return MetricStatus.WARNING
            else:
                return MetricStatus.CRITICAL
        
        # For throughput, higher is better
        elif metric_type == MetricType.THROUGHPUT:
            if value >= threshold:
                return MetricStatus.GOOD
            elif value >= threshold * 0.8:
                return MetricStatus.WARNING
            else:
                return MetricStatus.CRITICAL
        
        # Default logic
        else:
            if value <= threshold:
                return MetricStatus.GOOD
            elif value <= threshold * 1.2:
                return MetricStatus.WARNING
            else:
                return MetricStatus.CRITICAL
    
    @staticmethod
    def _calculate_overall_score(metrics: List[PerformanceMetric]) -> float:
        """Calculate overall performance score"""
        if not metrics:
            return 0.0
        
        status_scores = {
            MetricStatus.GOOD: 100,
            MetricStatus.WARNING: 70,
            MetricStatus.CRITICAL: 30,
            MetricStatus.UNKNOWN: 50
        }
        
        scores = [status_scores.get(metric.status, 50) for metric in metrics]
        return statistics.mean(scores)
    
    @staticmethod
    def _generate_trends(session: Session, data_source_id: int, time_range: str) -> Dict[str, Any]:
        """Generate trend analysis"""
        time_delta = PerformanceService._parse_time_range(time_range)
        since_time = datetime.now() - time_delta
        
        # Get metrics for trend analysis
        statement = select(PerformanceMetric).where(
            and_(
                PerformanceMetric.data_source_id == data_source_id,
                PerformanceMetric.measurement_time >= since_time
            )
        ).order_by(PerformanceMetric.measurement_time.asc())
        
        metrics = session.exec(statement).all()
        
        trends = {}
        for metric_type in MetricType:
            type_metrics = [m for m in metrics if m.metric_type == metric_type]
            if len(type_metrics) >= 2:
                values = [m.value for m in type_metrics]
                first_half = values[:len(values)//2]
                second_half = values[len(values)//2:]
                
                if first_half and second_half:
                    first_avg = statistics.mean(first_half)
                    second_avg = statistics.mean(second_half)
                    
                    if second_avg > first_avg:
                        trend = "improving" if metric_type == MetricType.THROUGHPUT else "degrading"
                    elif second_avg < first_avg:
                        trend = "degrading" if metric_type == MetricType.THROUGHPUT else "improving"
                    else:
                        trend = "stable"
                    
                    trends[metric_type.value] = {
                        "trend": trend,
                        "change": ((second_avg - first_avg) / first_avg) * 100 if first_avg > 0 else 0
                    }
        
        return trends
    
    @staticmethod
    def _generate_recommendations(
        metrics: List[PerformanceMetric], 
        alerts: List[PerformanceAlertResponse]
    ) -> List[str]:
        """Generate performance recommendations"""
        recommendations = []
        
        # Check for critical metrics
        critical_metrics = [m for m in metrics if m.status == MetricStatus.CRITICAL]
        if critical_metrics:
            recommendations.append("Address critical performance issues immediately")
        
        # Check for high error rates
        error_metrics = [m for m in metrics if m.metric_type == MetricType.ERROR_RATE and m.value > 1.0]
        if error_metrics:
            recommendations.append("Investigate and reduce error rates")
        
        # Check for slow response times
        response_metrics = [m for m in metrics if m.metric_type == MetricType.RESPONSE_TIME and m.value > 1000]
        if response_metrics:
            recommendations.append("Optimize queries and database performance")
        
        # Check for low throughput
        throughput_metrics = [m for m in metrics if m.metric_type == MetricType.THROUGHPUT and m.value < 100]
        if throughput_metrics:
            recommendations.append("Consider scaling resources to improve throughput")
        
        # Check for active alerts
        if len(alerts) > 5:
            recommendations.append("Review and resolve active performance alerts")
        
        return recommendations
    
    @staticmethod
    def _check_and_create_alerts(session: Session, metric: PerformanceMetric, user_id: str):
        """Check if metric triggers alerts and create them"""
        try:
            if metric.status == MetricStatus.CRITICAL:
                alert = PerformanceAlert(
                    data_source_id=metric.data_source_id,
                    metric_id=metric.id,
                    alert_type="threshold_exceeded",
                    severity="high",
                    title=f"Critical {metric.metric_type.value} detected",
                    description=f"{metric.metric_type.value} value {metric.value} {metric.unit} exceeds critical threshold"
                )
                session.add(alert)
                session.commit()
                
        except Exception as e:
            logger.error(f"Error creating alert for metric {metric.id}: {str(e)}")