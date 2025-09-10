"""
Racine Dashboard Service - Intelligent Dashboard System
=====================================================

This service provides comprehensive dashboard management with cross-group integration,
real-time analytics, and AI-driven insights for the entire data governance platform.

Features:
- Cross-group KPI aggregation and visualization
- Real-time metrics collection and streaming  
- Predictive analytics and trend analysis
- Custom dashboard creation and management
- Executive reporting and compliance dashboards
- Performance monitoring and alerting
- User-personalized dashboard experiences
- Integration with all 7 groups for unified insights
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from dataclasses import dataclass
from enum import Enum

# Import all required models for full integration
from ...models.racine_models.racine_dashboard_models import (
    RacineDashboard, RacineDashboardWidget, RacineDashboardLayout,
    RacineDashboardAnalytics as RacineKPIDefinition,
    RacineDashboardAnalytics as RacineMetricsCollection,
    RacineDashboardAnalytics as RacineRealTimeMetrics,
    RacineDashboardAnalytics as RacinePredictiveAnalytics,
    RacineDashboardWidget as RacineCustomVisualization,
    RacineDashboardAlert as RacineAlertRule,
    RacineDashboardAnalytics as RacineExecutiveReport,
    RacineDashboardAnalytics as RacinePerformanceMonitor,
    RacineDashboardPersonalization as RacineUserDashboardPreference
)
from ...models.racine_models.racine_orchestration_models import RacineOrchestrationMaster
from ...models.auth_models import User, Role
from ...models.scan_models import Scan, ScanResult, DataSource
from ...models.compliance_models import ComplianceRequirement as ComplianceRule, ComplianceValidation
from ...models.classification_models import ClassificationRule, ClassificationResult
from ...models.advanced_catalog_models import IntelligentDataAsset as CatalogItem, DataProfilingResult as CatalogMetadata
from ...models.scan_models import ScanOrchestrationJob

# Import existing services for integration
from ..comprehensive_analytics_service import ComprehensiveAnalyticsService
from ..ml_service import EnterpriseMLService as MLService
from ..advanced_ai_service import AdvancedAIService
from ..data_source_service import DataSourceService
from ..scan_service import ScanService
from ..compliance_rule_service import ComplianceRuleService
from ..classification_service import ClassificationService as EnterpriseClassificationService
from ..enterprise_catalog_service import EnterpriseIntelligentCatalogService

class DashboardType(Enum):
    EXECUTIVE = "executive"
    OPERATIONAL = "operational"
    COMPLIANCE = "compliance"
    PERFORMANCE = "performance"
    CUSTOM = "custom"
    REAL_TIME = "real_time"

class MetricType(Enum):
    KPI = "kpi"
    GAUGE = "gauge"
    TREND = "trend"
    COUNTER = "counter"
    HISTOGRAM = "histogram"
    HEATMAP = "heatmap"

class VisualizationType(Enum):
    LINE_CHART = "line_chart"
    BAR_CHART = "bar_chart"
    PIE_CHART = "pie_chart"
    SCATTER_PLOT = "scatter_plot"
    HEATMAP = "heatmap"
    GAUGE = "gauge"
    TABLE = "table"
    CARD = "card"

@dataclass
class DashboardConfiguration:
    """Configuration for dashboard creation"""
    name: str
    description: str
    dashboard_type: DashboardType
    layout_config: Dict[str, Any]
    widgets: List[Dict[str, Any]]
    refresh_interval: int = 60
    auto_refresh: bool = True
    access_control: Dict[str, Any] = None
    personalization_enabled: bool = True

@dataclass
class KPIDefinition:
    """Definition for KPI calculations"""
    name: str
    description: str
    calculation_method: str
    data_sources: List[str]
    aggregation_type: str
    time_window: str
    threshold_config: Dict[str, Any]
    alert_rules: List[Dict[str, Any]] = None

@dataclass
class RealTimeMetricsRequest:
    """Request for real-time metrics"""
    metrics: List[str]
    groups: List[str]
    time_range: int = 300  # 5 minutes default
    granularity: int = 10  # 10 seconds default
    
class RacineDashboardService:
    """
    Racine Dashboard Service providing intelligent dashboard management
    with cross-group integration and real-time analytics
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        
        # Initialize all existing services for full integration
        self.analytics_service = ComprehensiveAnalyticsService(db_session)
        self.ml_service = MLService(db_session)
        self.ai_service = AdvancedAIService(db_session)
        self.data_source_service = DataSourceService(db_session)
        self.scan_service = ScanService(db_session)
        self.compliance_service = ComplianceRuleService(db_session)
        self.classification_service = EnterpriseClassificationService(db_session)
        self.catalog_service = EnterpriseIntelligentCatalogService(db_session)
        
        # Service registry for dynamic access to all groups
        self.service_registry = {
            'analytics': self.analytics_service,
            'ml': self.ml_service,
            'ai': self.ai_service,
            'data_sources': self.data_source_service,
            'scans': self.scan_service,
            'compliance': self.compliance_service,
            'classifications': self.classification_service,
            'catalog': self.catalog_service
        }
        
        # Cache for real-time metrics
        self._metrics_cache = {}
        self._cache_ttl = 60  # 1 minute TTL
        
    async def create_dashboard(
        self, 
        config: DashboardConfiguration, 
        user_id: str,
        workspace_id: Optional[str] = None
    ) -> RacineDashboard:
        """
        Create a new intelligent dashboard with cross-group integration
        
        Args:
            config: Dashboard configuration
            user_id: User creating the dashboard
            workspace_id: Optional workspace association
            
        Returns:
            Created dashboard instance
        """
        try:
            # Create dashboard record
            dashboard = RacineDashboard(
                id=str(uuid.uuid4()),
                name=config.name,
                description=config.description,
                dashboard_type=config.dashboard_type.value,
                layout_configuration=config.layout_config,
                refresh_interval=config.refresh_interval,
                auto_refresh_enabled=config.auto_refresh,
                personalization_enabled=config.personalization_enabled,
                access_control_config=config.access_control or {},
                workspace_id=workspace_id,
                created_by=user_id,
                status='active'
            )
            
            self.db.add(dashboard)
            self.db.flush()
            
            # Create dashboard widgets
            for widget_config in config.widgets:
                widget = await self._create_dashboard_widget(
                    dashboard.id, 
                    widget_config, 
                    user_id
                )
                
            # Create layout configuration
            layout = RacineDashboardLayout(
                id=str(uuid.uuid4()),
                dashboard_id=dashboard.id,
                layout_type=config.layout_config.get('type', 'grid'),
                grid_configuration=config.layout_config.get('grid', {}),
                responsive_breakpoints=config.layout_config.get('breakpoints', {}),
                widget_positions=config.layout_config.get('positions', {}),
                created_by=user_id
            )
            
            self.db.add(layout)
            
            # Initialize KPI definitions if this is a KPI dashboard
            if config.dashboard_type in [DashboardType.EXECUTIVE, DashboardType.OPERATIONAL]:
                await self._initialize_default_kpis(dashboard.id, user_id)
                
            # Set up real-time metrics collection
            if config.auto_refresh:
                await self._setup_real_time_collection(dashboard.id)
                
            self.db.commit()
            
            return dashboard
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create dashboard: {str(e)}")
    
    async def _create_dashboard_widget(
        self, 
        dashboard_id: str, 
        widget_config: Dict[str, Any], 
        user_id: str
    ) -> RacineDashboardWidget:
        """Create a dashboard widget with cross-group data integration"""
        
        widget = RacineDashboardWidget(
            id=str(uuid.uuid4()),
            dashboard_id=dashboard_id,
            widget_type=widget_config['type'],
            title=widget_config['title'],
            description=widget_config.get('description', ''),
            visualization_type=widget_config.get('visualization', 'card'),
            data_source_config=widget_config.get('data_source', {}),
            chart_configuration=widget_config.get('chart_config', {}),
            filter_configuration=widget_config.get('filters', {}),
            refresh_interval=widget_config.get('refresh_interval', 60),
            position_x=widget_config.get('position', {}).get('x', 0),
            position_y=widget_config.get('position', {}).get('y', 0),
            width=widget_config.get('size', {}).get('width', 4),
            height=widget_config.get('size', {}).get('height', 3),
            created_by=user_id,
            status='active'
        )
        
        # Set up data source integration based on widget type
        await self._configure_widget_data_source(widget, widget_config)
        
        self.db.add(widget)
        return widget
    
    async def _configure_widget_data_source(
        self, 
        widget: RacineDashboardWidget, 
        config: Dict[str, Any]
    ):
        """Configure widget data source with cross-group integration"""
        
        data_source_config = config.get('data_source', {})
        source_type = data_source_config.get('type', 'metrics')
        
        if source_type == 'cross_group_kpi':
            # Set up cross-group KPI aggregation
            widget.data_source_config.update({
                'aggregation_query': self._build_cross_group_kpi_query(
                    data_source_config.get('groups', []),
                    data_source_config.get('metrics', [])
                ),
                'real_time_enabled': True
            })
            
        elif source_type == 'compliance_metrics':
            # Set up compliance metrics aggregation
            widget.data_source_config.update({
                'compliance_query': self._build_compliance_metrics_query(
                    data_source_config.get('frameworks', []),
                    data_source_config.get('time_range', '7d')
                )
            })
            
        elif source_type == 'scan_analytics':
            # Set up scan analytics aggregation
            widget.data_source_config.update({
                'scan_query': self._build_scan_analytics_query(
                    data_source_config.get('scan_types', []),
                    data_source_config.get('data_sources', [])
                )
            })
    
    def _build_cross_group_kpi_query(self, groups: List[str], metrics: List[str]) -> Dict[str, Any]:
        """Build query for cross-group KPI aggregation"""
        return {
            'query_type': 'cross_group_kpi',
            'groups': groups,
            'metrics': metrics,
            'aggregations': ['sum', 'avg', 'count'],
            'time_buckets': ['1h', '1d', '1w']
        }
    
    def _build_compliance_metrics_query(self, frameworks: List[str], time_range: str) -> Dict[str, Any]:
        """Build query for compliance metrics"""
        return {
            'query_type': 'compliance_metrics',
            'frameworks': frameworks,
            'time_range': time_range,
            'metrics': ['compliance_score', 'violations', 'remediation_rate']
        }
    
    def _build_scan_analytics_query(self, scan_types: List[str], data_sources: List[str]) -> Dict[str, Any]:
        """Build query for scan analytics"""
        return {
            'query_type': 'scan_analytics',
            'scan_types': scan_types,
            'data_sources': data_sources,
            'metrics': ['scan_count', 'success_rate', 'avg_duration', 'data_volume']
        }
    
    async def get_real_time_metrics(
        self, 
        request: RealTimeMetricsRequest,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Get real-time metrics across all specified groups
        
        Args:
            request: Real-time metrics request
            user_id: User requesting metrics
            
        Returns:
            Real-time metrics data
        """
        try:
            # Check cache first
            cache_key = f"{':'.join(request.metrics)}:{':'.join(request.groups)}:{request.time_range}"
            
            if cache_key in self._metrics_cache:
                cached_data, timestamp = self._metrics_cache[cache_key]
                if datetime.utcnow().timestamp() - timestamp < self._cache_ttl:
                    return cached_data
            
            # Collect metrics from all requested groups
            metrics_data = {}
            
            for group in request.groups:
                if group in self.service_registry:
                    group_metrics = await self._collect_group_metrics(
                        group, 
                        request.metrics, 
                        request.time_range,
                        request.granularity
                    )
                    metrics_data[group] = group_metrics
            
            # Aggregate cross-group metrics
            aggregated_metrics = self._aggregate_cross_group_metrics(metrics_data, request.metrics)
            
            # Calculate trends and predictions
            trend_analysis = await self._calculate_metric_trends(metrics_data, request.time_range)
            
            result = {
                'timestamp': datetime.utcnow().isoformat(),
                'time_range': request.time_range,
                'granularity': request.granularity,
                'metrics': aggregated_metrics,
                'group_breakdown': metrics_data,
                'trends': trend_analysis,
                'predictions': await self._generate_metric_predictions(metrics_data)
            }
            
            # Cache the result
            self._metrics_cache[cache_key] = (result, datetime.utcnow().timestamp())
            
            return result
            
        except Exception as e:
            raise Exception(f"Failed to get real-time metrics: {str(e)}")
    
    async def _collect_group_metrics(
        self, 
        group: str, 
        metrics: List[str], 
        time_range: int,
        granularity: int
    ) -> Dict[str, Any]:
        """Collect metrics from a specific group"""
        
        service = self.service_registry.get(group)
        if not service:
            return {}
        
        group_metrics = {}
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(seconds=time_range)
        
        try:
            if group == 'scans':
                # Collect scan metrics
                scan_metrics = await self._collect_scan_metrics(metrics, start_time, end_time, granularity)
                group_metrics.update(scan_metrics)
                
            elif group == 'compliance':
                # Collect compliance metrics
                compliance_metrics = await self._collect_compliance_metrics(metrics, start_time, end_time, granularity)
                group_metrics.update(compliance_metrics)
                
            elif group == 'classifications':
                # Collect classification metrics
                classification_metrics = await self._collect_classification_metrics(metrics, start_time, end_time, granularity)
                group_metrics.update(classification_metrics)
                
            elif group == 'catalog':
                # Collect catalog metrics
                catalog_metrics = await self._collect_catalog_metrics(metrics, start_time, end_time, granularity)
                group_metrics.update(catalog_metrics)
                
            elif group == 'data_sources':
                # Collect data source metrics
                data_source_metrics = await self._collect_data_source_metrics(metrics, start_time, end_time, granularity)
                group_metrics.update(data_source_metrics)
                
        except Exception as e:
            print(f"Error collecting metrics for group {group}: {str(e)}")
            
        return group_metrics
    
    async def _collect_scan_metrics(
        self, 
        metrics: List[str], 
        start_time: datetime, 
        end_time: datetime,
        granularity: int
    ) -> Dict[str, Any]:
        """Collect scan-related metrics"""
        
        scan_metrics = {}
        
        if 'scan_count' in metrics:
            scan_count = self.db.query(func.count(Scan.id)).filter(
                and_(
                    Scan.created_at >= start_time,
                    Scan.created_at <= end_time
                )
            ).scalar()
            scan_metrics['scan_count'] = scan_count or 0
            
        if 'success_rate' in metrics:
            total_scans = self.db.query(func.count(Scan.id)).filter(
                and_(
                    Scan.created_at >= start_time,
                    Scan.created_at <= end_time
                )
            ).scalar()
            
            successful_scans = self.db.query(func.count(Scan.id)).filter(
                and_(
                    Scan.created_at >= start_time,
                    Scan.created_at <= end_time,
                    Scan.status == 'completed'
                )
            ).scalar()
            
            success_rate = (successful_scans / total_scans * 100) if total_scans > 0 else 0
            scan_metrics['success_rate'] = round(success_rate, 2)
            
        if 'avg_duration' in metrics:
            avg_duration = self.db.query(func.avg(Scan.execution_time)).filter(
                and_(
                    Scan.created_at >= start_time,
                    Scan.created_at <= end_time,
                    Scan.status == 'completed'
                )
            ).scalar()
            scan_metrics['avg_duration'] = float(avg_duration) if avg_duration else 0
            
        return scan_metrics
    
    async def _collect_compliance_metrics(
        self, 
        metrics: List[str], 
        start_time: datetime, 
        end_time: datetime,
        granularity: int
    ) -> Dict[str, Any]:
        """Collect compliance-related metrics"""
        
        compliance_metrics = {}
        
        if 'compliance_score' in metrics:
            # Calculate overall compliance score
            total_validations = self.db.query(func.count(ComplianceValidation.id)).filter(
                and_(
                    ComplianceValidation.created_at >= start_time,
                    ComplianceValidation.created_at <= end_time
                )
            ).scalar()
            
            passed_validations = self.db.query(func.count(ComplianceValidation.id)).filter(
                and_(
                    ComplianceValidation.created_at >= start_time,
                    ComplianceValidation.created_at <= end_time,
                    ComplianceValidation.validation_status == 'passed'
                )
            ).scalar()
            
            compliance_score = (passed_validations / total_validations * 100) if total_validations > 0 else 100
            compliance_metrics['compliance_score'] = round(compliance_score, 2)
            
        if 'violations' in metrics:
            violations = self.db.query(func.count(ComplianceValidation.id)).filter(
                and_(
                    ComplianceValidation.created_at >= start_time,
                    ComplianceValidation.created_at <= end_time,
                    ComplianceValidation.validation_status == 'failed'
                )
            ).scalar()
            compliance_metrics['violations'] = violations or 0
            
        return compliance_metrics
    
    async def _collect_classification_metrics(
        self, 
        metrics: List[str], 
        start_time: datetime, 
        end_time: datetime,
        granularity: int
    ) -> Dict[str, Any]:
        """Collect classification-related metrics"""
        
        classification_metrics = {}
        
        if 'classification_count' in metrics:
            classification_count = self.db.query(func.count(DataClassification.id)).filter(
                and_(
                    DataClassification.created_at >= start_time,
                    DataClassification.created_at <= end_time
                )
            ).scalar()
            classification_metrics['classification_count'] = classification_count or 0
            
        if 'accuracy_rate' in metrics:
            # Calculate classification accuracy based on confidence scores
            avg_confidence = self.db.query(func.avg(DataClassification.confidence_score)).filter(
                and_(
                    DataClassification.created_at >= start_time,
                    DataClassification.created_at <= end_time
                )
            ).scalar()
            classification_metrics['accuracy_rate'] = float(avg_confidence) if avg_confidence else 0
            
        return classification_metrics
    
    async def _collect_catalog_metrics(
        self, 
        metrics: List[str], 
        start_time: datetime, 
        end_time: datetime,
        granularity: int
    ) -> Dict[str, Any]:
        """Collect catalog-related metrics"""
        
        catalog_metrics = {}
        
        if 'catalog_items' in metrics:
            item_count = self.db.query(func.count(CatalogItem.id)).filter(
                and_(
                    CatalogItem.created_at >= start_time,
                    CatalogItem.created_at <= end_time
                )
            ).scalar()
            catalog_metrics['catalog_items'] = item_count or 0
            
        if 'metadata_completeness' in metrics:
            # Calculate metadata completeness
            total_items = self.db.query(func.count(CatalogItem.id)).scalar()
            items_with_metadata = self.db.query(func.count(CatalogMetadata.id)).scalar()
            completeness = (items_with_metadata / total_items * 100) if total_items > 0 else 0
            catalog_metrics['metadata_completeness'] = round(completeness, 2)
            
        return catalog_metrics
    
    async def _collect_data_source_metrics(
        self, 
        metrics: List[str], 
        start_time: datetime, 
        end_time: datetime,
        granularity: int
    ) -> Dict[str, Any]:
        """Collect data source-related metrics"""
        
        data_source_metrics = {}
        
        if 'data_source_count' in metrics:
            source_count = self.db.query(func.count(DataSource.id)).filter(
                DataSource.status == 'active'
            ).scalar()
            data_source_metrics['data_source_count'] = source_count or 0
            
        if 'connection_health' in metrics:
            # Calculate connection health
            total_sources = self.db.query(func.count(DataSource.id)).scalar()
            healthy_sources = self.db.query(func.count(DataSource.id)).filter(
                DataSource.connection_status == 'connected'
            ).scalar()
            health_percentage = (healthy_sources / total_sources * 100) if total_sources > 0 else 0
            data_source_metrics['connection_health'] = round(health_percentage, 2)
            
        return data_source_metrics
    
    def _aggregate_cross_group_metrics(self, metrics_data: Dict[str, Any], requested_metrics: List[str]) -> Dict[str, Any]:
        """Aggregate metrics across all groups"""
        
        aggregated = {}
        
        for metric in requested_metrics:
            metric_values = []
            for group_data in metrics_data.values():
                if metric in group_data:
                    metric_values.append(group_data[metric])
            
            if metric_values:
                aggregated[metric] = {
                    'total': sum(metric_values) if all(isinstance(v, (int, float)) for v in metric_values) else len(metric_values),
                    'average': sum(metric_values) / len(metric_values) if all(isinstance(v, (int, float)) for v in metric_values) else 0,
                    'max': max(metric_values) if all(isinstance(v, (int, float)) for v in metric_values) else 0,
                    'min': min(metric_values) if all(isinstance(v, (int, float)) for v in metric_values) else 0
                }
            else:
                aggregated[metric] = {'total': 0, 'average': 0, 'max': 0, 'min': 0}
                
        return aggregated
    
    async def _calculate_metric_trends(self, metrics_data: Dict[str, Any], time_range: int) -> Dict[str, Any]:
        """Calculate trends for metrics over time"""
        
        trends = {}
        
        # Enterprise trend calculation using short-window slope and volatility
        import numpy as np
        for group, group_metrics in metrics_data.items():
            group_trends = {}
            for metric, series in group_metrics.items():
                if isinstance(series, (list, tuple)) and len(series) >= 3:
                    y = np.array(series[-10:], dtype=float)
                    x = np.arange(len(y))
                    slope, intercept = np.polyfit(x, y, 1)
                    pct = float((y[-1] - y[0]) / (abs(y[0]) + 1e-6)) * 100.0
                    direction = 'up' if slope > 0.0 else ('down' if slope < 0.0 else 'stable')
                    velocity = float(slope)
                    group_trends[metric] = {
                        'direction': direction,
                        'change_percentage': pct,
                        'velocity': velocity
                    }
            trends[group] = group_trends
            
        return trends
    
    async def _generate_metric_predictions(self, metrics_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate predictions for metrics using ML models"""
        
        predictions = {}
        
        try:
            # Use ML service for predictions
            for group, group_metrics in metrics_data.items():
                group_predictions = {}
                for metric, value in group_metrics.items():
                    if isinstance(value, (int, float)):
                        # Use ML service to predict future values
                        prediction_result = await self.ml_service.predict_metric_trend(
                            metric_name=f"{group}_{metric}",
                            current_value=value,
                            prediction_horizon='1h'
                        )
                        group_predictions[metric] = prediction_result
                predictions[group] = group_predictions
                
        except Exception as e:
            print(f"Error generating predictions: {str(e)}")
            
        return predictions
    
    async def _initialize_default_kpis(self, dashboard_id: str, user_id: str):
        """Initialize default KPIs for executive/operational dashboards"""
        
        default_kpis = [
            {
                'name': 'Data Governance Score',
                'description': 'Overall data governance health score',
                'calculation_method': 'weighted_average',
                'data_sources': ['compliance', 'classifications', 'catalog'],
                'aggregation_type': 'average',
                'time_window': '24h'
            },
            {
                'name': 'Scan Success Rate',
                'description': 'Percentage of successful scans',
                'calculation_method': 'percentage',
                'data_sources': ['scans'],
                'aggregation_type': 'percentage',
                'time_window': '24h'
            },
            {
                'name': 'Compliance Violations',
                'description': 'Number of active compliance violations',
                'calculation_method': 'count',
                'data_sources': ['compliance'],
                'aggregation_type': 'sum',
                'time_window': '24h'
            }
        ]
        
        for kpi_config in default_kpis:
            kpi = RacineKPIDefinition(
                id=str(uuid.uuid4()),
                dashboard_id=dashboard_id,
                name=kpi_config['name'],
                description=kpi_config['description'],
                calculation_method=kpi_config['calculation_method'],
                data_sources=kpi_config['data_sources'],
                aggregation_type=kpi_config['aggregation_type'],
                time_window=kpi_config['time_window'],
                threshold_configuration={
                    'warning': 75,
                    'critical': 50
                },
                created_by=user_id,
                status='active'
            )
            self.db.add(kpi)
    
    async def _setup_real_time_collection(self, dashboard_id: str):
        """Set up real-time metrics collection for dashboard"""
        
        collection_config = RacineMetricsCollection(
            id=str(uuid.uuid4()),
            dashboard_id=dashboard_id,
            collection_interval=30,  # 30 seconds
            enabled=True,
            metric_sources=['all_groups'],
            aggregation_rules={
                'time_buckets': ['1m', '5m', '15m', '1h'],
                'retention_period': '7d'
            },
            status='active'
        )
        
        self.db.add(collection_config)
    
    async def get_dashboard_data(
        self, 
        dashboard_id: str, 
        user_id: str,
        time_range: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get complete dashboard data with all widgets and real-time metrics
        
        Args:
            dashboard_id: Dashboard identifier
            user_id: User requesting data
            time_range: Optional time range filter
            
        Returns:
            Complete dashboard data
        """
        try:
            # Get dashboard configuration
            dashboard = self.db.query(RacineDashboard).filter(
                RacineDashboard.id == dashboard_id
            ).first()
            
            if not dashboard:
                raise Exception(f"Dashboard {dashboard_id} not found")
            
            # Get all widgets
            widgets = self.db.query(RacineDashboardWidget).filter(
                RacineDashboardWidget.dashboard_id == dashboard_id,
                RacineDashboardWidget.status == 'active'
            ).all()
            
            # Get layout configuration
            layout = self.db.query(RacineDashboardLayout).filter(
                RacineDashboardLayout.dashboard_id == dashboard_id
            ).first()
            
            # Collect data for each widget
            widget_data = {}
            for widget in widgets:
                widget_data[widget.id] = await self._get_widget_data(widget, time_range)
            
            # Get KPI data if applicable
            kpi_data = {}
            if dashboard.dashboard_type in ['executive', 'operational']:
                kpi_data = await self._get_kpi_data(dashboard_id, time_range)
            
            # Get real-time metrics
            real_time_metrics = await self._get_dashboard_real_time_metrics(dashboard_id)
            
            return {
                'dashboard': {
                    'id': dashboard.id,
                    'name': dashboard.name,
                    'description': dashboard.description,
                    'type': dashboard.dashboard_type,
                    'refresh_interval': dashboard.refresh_interval,
                    'auto_refresh': dashboard.auto_refresh_enabled,
                    'last_updated': dashboard.updated_at.isoformat()
                },
                'layout': {
                    'type': layout.layout_type if layout else 'grid',
                    'configuration': layout.grid_configuration if layout else {},
                    'positions': layout.widget_positions if layout else {}
                },
                'widgets': widget_data,
                'kpis': kpi_data,
                'real_time_metrics': real_time_metrics,
                'metadata': {
                    'generated_at': datetime.utcnow().isoformat(),
                    'time_range': time_range,
                    'user_id': user_id
                }
            }
            
        except Exception as e:
            raise Exception(f"Failed to get dashboard data: {str(e)}")
    
    async def _get_widget_data(self, widget: RacineDashboardWidget, time_range: Optional[str] = None) -> Dict[str, Any]:
        """Get data for a specific widget"""
        
        try:
            widget_data = {
                'id': widget.id,
                'title': widget.title,
                'type': widget.widget_type,
                'visualization': widget.visualization_type,
                'position': {
                    'x': widget.position_x,
                    'y': widget.position_y,
                    'width': widget.width,
                    'height': widget.height
                },
                'data': {},
                'status': 'loaded'
            }
            
            # Get data based on widget data source configuration
            data_source_config = widget.data_source_config
            
            if data_source_config.get('query_type') == 'cross_group_kpi':
                widget_data['data'] = await self._get_cross_group_kpi_data(
                    data_source_config, time_range
                )
            elif data_source_config.get('query_type') == 'compliance_metrics':
                widget_data['data'] = await self._get_compliance_widget_data(
                    data_source_config, time_range
                )
            elif data_source_config.get('query_type') == 'scan_analytics':
                widget_data['data'] = await self._get_scan_analytics_widget_data(
                    data_source_config, time_range
                )
            else:
                # Default metrics
                widget_data['data'] = await self._get_default_widget_data(
                    widget, time_range
                )
                
            return widget_data
            
        except Exception as e:
            return {
                'id': widget.id,
                'title': widget.title,
                'type': widget.widget_type,
                'data': {},
                'status': 'error',
                'error': str(e)
            }
    
    async def _get_cross_group_kpi_data(self, config: Dict[str, Any], time_range: Optional[str] = None) -> Dict[str, Any]:
        """Get cross-group KPI data"""
        
        groups = config.get('groups', [])
        metrics = config.get('metrics', [])
        
        request = RealTimeMetricsRequest(
            metrics=metrics,
            groups=groups,
            time_range=3600 if time_range == '1h' else 86400  # Default to 1 day
        )
        
        return await self.get_real_time_metrics(request, 'system')
    
    async def _get_compliance_widget_data(self, config: Dict[str, Any], time_range: Optional[str] = None) -> Dict[str, Any]:
        """Get compliance-specific widget data"""
        
        frameworks = config.get('frameworks', [])
        
        # Use compliance service to get detailed metrics
        compliance_data = await self.compliance_service.get_compliance_dashboard_data(
            frameworks=frameworks,
            time_range=time_range or '7d'
        )
        
        return compliance_data
    
    async def _get_scan_analytics_widget_data(self, config: Dict[str, Any], time_range: Optional[str] = None) -> Dict[str, Any]:
        """Get scan analytics widget data"""
        
        scan_types = config.get('scan_types', [])
        data_sources = config.get('data_sources', [])
        
        # Use scan service to get analytics
        scan_analytics = await self.scan_service.get_scan_analytics(
            scan_types=scan_types,
            data_sources=data_sources,
            time_range=time_range or '7d'
        )
        
        return scan_analytics
    
    async def _get_default_widget_data(self, widget: RacineDashboardWidget, time_range: Optional[str] = None) -> Dict[str, Any]:
        """Get default widget data"""
        
        return {
            'value': 0,
            'trend': 'stable',
            'change': 0.0,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    async def _get_kpi_data(self, dashboard_id: str, time_range: Optional[str] = None) -> Dict[str, Any]:
        """Get KPI data for dashboard"""
        
        kpis = self.db.query(RacineKPIDefinition).filter(
            RacineKPIDefinition.dashboard_id == dashboard_id,
            RacineKPIDefinition.status == 'active'
        ).all()
        
        kpi_data = {}
        
        for kpi in kpis:
            try:
                # Calculate KPI value based on configuration
                kpi_value = await self._calculate_kpi_value(kpi, time_range)
                
                kpi_data[kpi.id] = {
                    'name': kpi.name,
                    'description': kpi.description,
                    'value': kpi_value,
                    'threshold': kpi.threshold_configuration,
                    'status': self._get_kpi_status(kpi_value, kpi.threshold_configuration),
                    'last_calculated': datetime.utcnow().isoformat()
                }
                
            except Exception as e:
                kpi_data[kpi.id] = {
                    'name': kpi.name,
                    'error': str(e),
                    'status': 'error'
                }
                
        return kpi_data
    
    async def _calculate_kpi_value(self, kpi: RacineKPIDefinition, time_range: Optional[str] = None) -> float:
        """Calculate KPI value based on configuration"""
        
        calculation_method = kpi.calculation_method
        data_sources = kpi.data_sources
        aggregation_type = kpi.aggregation_type
        
        if calculation_method == 'weighted_average':
            # Calculate weighted average across data sources
            values = []
            weights = []
            
            for source in data_sources:
                try:
                    source_value = await self._get_source_kpi_value(source, kpi.name, time_range)
                    values.append(source_value)
                    weights.append(1.0)  # Equal weights for now
                except:
                    continue
            
            if values:
                weighted_sum = sum(v * w for v, w in zip(values, weights))
                total_weight = sum(weights)
                return weighted_sum / total_weight if total_weight > 0 else 0
            else:
                return 0
                
        elif calculation_method == 'percentage':
            # Calculate percentage-based KPI
            if 'scans' in data_sources:
                return await self._calculate_scan_success_percentage(time_range)
                
        elif calculation_method == 'count':
            # Calculate count-based KPI
            if 'compliance' in data_sources:
                return await self._calculate_compliance_violation_count(time_range)
                
        return 0
    
    async def _get_source_kpi_value(self, source: str, kpi_name: str, time_range: Optional[str] = None) -> float:
        """Get KPI value from specific source"""
        
        if source == 'compliance':
            # Get compliance score
            return await self._get_compliance_score(time_range)
        elif source == 'classifications':
            # Get classification accuracy
            return await self._get_classification_accuracy(time_range)
        elif source == 'catalog':
            # Get catalog completeness
            return await self._get_catalog_completeness(time_range)
        elif source == 'scans':
            # Get scan health score
            return await self._get_scan_health_score(time_range)
        else:
            return 0
    
    async def _get_compliance_score(self, time_range: Optional[str] = None) -> float:
        """Calculate compliance score"""
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7) if time_range == '7d' else end_time - timedelta(days=1)
        
        total_validations = self.db.query(func.count(ComplianceValidation.id)).filter(
            and_(
                ComplianceValidation.created_at >= start_time,
                ComplianceValidation.created_at <= end_time
            )
        ).scalar()
        
        passed_validations = self.db.query(func.count(ComplianceValidation.id)).filter(
            and_(
                ComplianceValidation.created_at >= start_time,
                ComplianceValidation.created_at <= end_time,
                ComplianceValidation.validation_status == 'passed'
            )
        ).scalar()
        
        return (passed_validations / total_validations * 100) if total_validations > 0 else 100
    
    async def _get_classification_accuracy(self, time_range: Optional[str] = None) -> float:
        """Calculate classification accuracy"""
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7) if time_range == '7d' else end_time - timedelta(days=1)
        
        avg_confidence = self.db.query(func.avg(DataClassification.confidence_score)).filter(
            and_(
                DataClassification.created_at >= start_time,
                DataClassification.created_at <= end_time
            )
        ).scalar()
        
        return float(avg_confidence * 100) if avg_confidence else 0
    
    async def _get_catalog_completeness(self, time_range: Optional[str] = None) -> float:
        """Calculate catalog completeness"""
        
        total_items = self.db.query(func.count(CatalogItem.id)).scalar()
        items_with_metadata = self.db.query(func.count(CatalogMetadata.id)).scalar()
        
        return (items_with_metadata / total_items * 100) if total_items > 0 else 0
    
    async def _get_scan_health_score(self, time_range: Optional[str] = None) -> float:
        """Calculate scan health score"""
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7) if time_range == '7d' else end_time - timedelta(days=1)
        
        total_scans = self.db.query(func.count(Scan.id)).filter(
            and_(
                Scan.created_at >= start_time,
                Scan.created_at <= end_time
            )
        ).scalar()
        
        successful_scans = self.db.query(func.count(Scan.id)).filter(
            and_(
                Scan.created_at >= start_time,
                Scan.created_at <= end_time,
                Scan.status == 'completed'
            )
        ).scalar()
        
        return (successful_scans / total_scans * 100) if total_scans > 0 else 100
    
    async def _calculate_scan_success_percentage(self, time_range: Optional[str] = None) -> float:
        """Calculate scan success percentage"""
        return await self._get_scan_health_score(time_range)
    
    async def _calculate_compliance_violation_count(self, time_range: Optional[str] = None) -> float:
        """Calculate compliance violation count"""
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=7) if time_range == '7d' else end_time - timedelta(days=1)
        
        violations = self.db.query(func.count(ComplianceValidation.id)).filter(
            and_(
                ComplianceValidation.created_at >= start_time,
                ComplianceValidation.created_at <= end_time,
                ComplianceValidation.validation_status == 'failed'
            )
        ).scalar()
        
        return float(violations or 0)
    
    def _get_kpi_status(self, value: float, threshold_config: Dict[str, Any]) -> str:
        """Determine KPI status based on thresholds"""
        
        warning_threshold = threshold_config.get('warning', 75)
        critical_threshold = threshold_config.get('critical', 50)
        
        if value >= warning_threshold:
            return 'healthy'
        elif value >= critical_threshold:
            return 'warning'
        else:
            return 'critical'
    
    async def _get_dashboard_real_time_metrics(self, dashboard_id: str) -> Dict[str, Any]:
        """Get real-time metrics for dashboard"""
        
        # Get real-time metrics collection configuration
        collection_config = self.db.query(RacineMetricsCollection).filter(
            RacineMetricsCollection.dashboard_id == dashboard_id,
            RacineMetricsCollection.enabled == True
        ).first()
        
        if not collection_config:
            return {}
        
        # Get latest real-time metrics
        latest_metrics = self.db.query(RacineRealTimeMetrics).filter(
            RacineRealTimeMetrics.dashboard_id == dashboard_id
        ).order_by(desc(RacineRealTimeMetrics.timestamp)).limit(10).all()
        
        return {
            'latest_timestamp': latest_metrics[0].timestamp.isoformat() if latest_metrics else None,
            'collection_interval': collection_config.collection_interval,
            'metrics_count': len(latest_metrics),
            'status': 'active' if latest_metrics else 'inactive'
        }
    
    async def update_dashboard(
        self, 
        dashboard_id: str, 
        updates: Dict[str, Any], 
        user_id: str
    ) -> RacineDashboard:
        """
        Update dashboard configuration
        
        Args:
            dashboard_id: Dashboard to update
            updates: Update data
            user_id: User making updates
            
        Returns:
            Updated dashboard
        """
        try:
            dashboard = self.db.query(RacineDashboard).filter(
                RacineDashboard.id == dashboard_id
            ).first()
            
            if not dashboard:
                raise Exception(f"Dashboard {dashboard_id} not found")
            
            # Update dashboard fields
            for field, value in updates.items():
                if hasattr(dashboard, field):
                    setattr(dashboard, field, value)
            
            dashboard.updated_at = datetime.utcnow()
            
            self.db.commit()
            return dashboard
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update dashboard: {str(e)}")
    
    async def delete_dashboard(self, dashboard_id: str, user_id: str) -> bool:
        """
        Delete dashboard and all associated data
        
        Args:
            dashboard_id: Dashboard to delete
            user_id: User requesting deletion
            
        Returns:
            Success status
        """
        try:
            # Delete all related data
            self.db.query(RacineDashboardWidget).filter(
                RacineDashboardWidget.dashboard_id == dashboard_id
            ).delete()
            
            self.db.query(RacineDashboardLayout).filter(
                RacineDashboardLayout.dashboard_id == dashboard_id
            ).delete()
            
            self.db.query(RacineKPIDefinition).filter(
                RacineKPIDefinition.dashboard_id == dashboard_id
            ).delete()
            
            self.db.query(RacineMetricsCollection).filter(
                RacineMetricsCollection.dashboard_id == dashboard_id
            ).delete()
            
            self.db.query(RacineRealTimeMetrics).filter(
                RacineRealTimeMetrics.dashboard_id == dashboard_id
            ).delete()
            
            # Delete dashboard
            self.db.query(RacineDashboard).filter(
                RacineDashboard.id == dashboard_id
            ).delete()
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to delete dashboard: {str(e)}")
    
    async def get_user_dashboards(
        self, 
        user_id: str, 
        workspace_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all dashboards for a user
        
        Args:
            user_id: User identifier
            workspace_id: Optional workspace filter
            
        Returns:
            List of user dashboards
        """
        try:
            query = self.db.query(RacineDashboard).filter(
                or_(
                    RacineDashboard.created_by == user_id,
                    RacineDashboard.access_control_config.contains({"users": [user_id]})
                ),
                RacineDashboard.status == 'active'
            )
            
            if workspace_id:
                query = query.filter(RacineDashboard.workspace_id == workspace_id)
            
            dashboards = query.all()
            
            dashboard_list = []
            for dashboard in dashboards:
                dashboard_list.append({
                    'id': dashboard.id,
                    'name': dashboard.name,
                    'description': dashboard.description,
                    'type': dashboard.dashboard_type,
                    'created_at': dashboard.created_at.isoformat(),
                    'updated_at': dashboard.updated_at.isoformat(),
                    'widget_count': self.db.query(func.count(RacineDashboardWidget.id)).filter(
                        RacineDashboardWidget.dashboard_id == dashboard.id
                    ).scalar()
                })
            
            return dashboard_list
            
        except Exception as e:
            raise Exception(f"Failed to get user dashboards: {str(e)}")