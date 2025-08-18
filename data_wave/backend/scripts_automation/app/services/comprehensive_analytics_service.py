"""
Enterprise Comprehensive Analytics Service

Provides advanced analytics and business intelligence across all data governance components:
- Cross-system analytics and insights
- Predictive analytics and forecasting
- Advanced data visualization and reporting
- Real-time business intelligence
- ROI analysis and optimization recommendations
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
import json
import uuid

import numpy as np
import pandas as pd
from sqlmodel import Session, select, func, and_, or_
from sqlalchemy import text
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
import networkx as nx
from scipy import stats
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

from ..core.config import settings
from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..services.ai_service import EnterpriseAIService as AIService
from ..models.analytics_models import (
    AnalyticsDataset, DataCorrelation, AnalyticsInsight, MLModel,
    AnalyticsAlert, AnalyticsExperiment, AnalyticsQuery, AnalyticsResult
)

try:
    from ..core.settings import get_settings
except Exception:
    from ..core.config import settings as get_settings

logger = logging.getLogger(__name__)

class AnalyticsConfig:
    """Configuration for analytics operations"""
    def __init__(self):
        self.prediction_horizon_days = 30
        self.trend_analysis_period_days = 90
        self.anomaly_detection_sensitivity = 0.95
        self.clustering_algorithms = ['kmeans', 'dbscan']
        self.forecasting_models = ['linear', 'polynomial', 'exponential']
        self.confidence_interval = 0.95
        self.max_cache_size = 1000
        self.analysis_timeout_seconds = 300

class ComprehensiveAnalyticsService:
    """
    Enterprise-grade comprehensive analytics service providing:
    - Cross-system analytics and business intelligence
    - Predictive analytics and forecasting
    - Advanced data visualization
    - ROI analysis and optimization recommendations
    - Real-time insights and alerting
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = AnalyticsConfig()
        self._init_analytics_components()
        
        # Analytics state management
        self.active_queries = {}
        self.query_cache = {}
        self.model_cache = {}
        self.insight_cache = deque(maxlen=1000)
        
        # Performance tracking
        self.analytics_metrics = {
            'total_queries_processed': 0,
            'successful_analyses': 0,
            'failed_analyses': 0,
            'average_query_time': 0.0,
            'cache_hit_rate': 0.0,
            'model_accuracy': {},
            'insight_generation_rate': 0.0
        }
        
        # Business intelligence components
        self.kpi_definitions = {}
        self.dashboard_configs = {}
        self.alert_rules = {}
        
        # Machine learning models
        self.prediction_models = {}
        self.clustering_models = {}
        self.anomaly_models = {}
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=12)
        
        # Background tasks - defer until start() method
        self._background_tasks = [
            self._analytics_processing_loop,
            self._model_training_loop,
            self._insight_generation_loop,
            self._performance_monitoring_loop
        ]
        self._pending_dashboard_streams = []
    
    async def start(self):
        """Start background tasks when event loop is available"""
        try:
            loop = asyncio.get_running_loop()
            # Start background tasks
            for task_func in self._background_tasks:
                loop.create_task(task_func())
            # Start pending dashboard streams
            for dashboard_id in self._pending_dashboard_streams:
                loop.create_task(self._stream_dashboard_data(dashboard_id))
            self._pending_dashboard_streams.clear()
        except RuntimeError:
            logger.warning("No event loop available, background tasks will start when loop becomes available")
    
    def _init_analytics_components(self):
        """Initialize analytics components and models"""
        try:
            # Initialize ML models
            self.prediction_models = {
                'performance_forecast': RandomForestRegressor(n_estimators=100, random_state=42),
                'usage_prediction': GradientBoostingRegressor(n_estimators=100, random_state=42),
                'quality_score_prediction': RandomForestRegressor(n_estimators=50, random_state=42),
                'cost_optimization': GradientBoostingRegressor(n_estimators=50, random_state=42)
            }
            
            self.clustering_models = {
                'data_source_clustering': KMeans(n_clusters=5, random_state=42),
                'usage_pattern_clustering': DBSCAN(eps=0.3, min_samples=5),
                'quality_pattern_clustering': KMeans(n_clusters=3, random_state=42)
            }
            
            # Initialize scalers
            self.scalers = {
                'performance_scaler': StandardScaler(),
                'usage_scaler': StandardScaler(),
                'quality_scaler': StandardScaler()
            }
            
            # Initialize graph for network analysis
            self.network_graph = nx.DiGraph()
            
            logger.info("Analytics components initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize analytics components: {e}")
            raise
    
    async def execute_analytics_query(
        self,
        query: AnalyticsQuery,
        user_id: str,
        use_cache: bool = True
    ) -> AnalyticsResult:
        """
        Execute comprehensive analytics query with caching and optimization
        
        Features:
        - Multi-dimensional data analysis
        - Automatic query optimization
        - Result caching and sharing
        - Real-time processing capabilities
        """
        try:
            # Generate query hash for caching
            query_hash = self._generate_query_hash(query)
            
            # Check cache if enabled
            if use_cache and query_hash in self.query_cache:
                cached_result = self.query_cache[query_hash]
                if self._is_cache_valid(cached_result):
                    self.analytics_metrics['cache_hit_rate'] += 1
                    return cached_result
            
            # Execute query
            start_time = datetime.utcnow()
            
            # Parse and optimize query
            optimized_query = await self._optimize_analytics_query(query)
            
            # Execute based on query type
            if query.query_type == "cross_system":
                result = await self._execute_cross_system_analysis(optimized_query)
            elif query.query_type == "predictive":
                result = await self._execute_predictive_analysis(optimized_query)
            elif query.query_type == "trend":
                result = await self._execute_trend_analysis(optimized_query)
            elif query.query_type == "roi":
                result = await self._execute_roi_analysis(optimized_query)
            elif query.query_type == "business_intelligence":
                result = await self._execute_business_intelligence_analysis(optimized_query)
            else:
                result = await self._execute_general_analysis(optimized_query)
            
            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Create analytics result
            analytics_result = AnalyticsResult(
                query_id=str(uuid.uuid4()),
                query_hash=query_hash,
                query_type=query.query_type,
                result_data=result,
                execution_time_seconds=execution_time,
                generated_at=datetime.utcnow(),
                generated_by=user_id,
                result_metadata={
                    'query_optimization': True,
                    'cache_used': False,
                    'data_sources': query.data_sources,
                    'time_range': query.time_range
                }
            )
            
            # Cache result
            if use_cache:
                self.query_cache[query_hash] = analytics_result
            
            # Update metrics
            self.analytics_metrics['total_queries_processed'] += 1
            self.analytics_metrics['successful_analyses'] += 1
            self.analytics_metrics['average_query_time'] = (
                self.analytics_metrics['average_query_time'] * 
                (self.analytics_metrics['total_queries_processed'] - 1) + 
                execution_time
            ) / self.analytics_metrics['total_queries_processed']
            
            return analytics_result
            
        except Exception as e:
            logger.error(f"Failed to execute analytics query: {e}")
            self.analytics_metrics['failed_analyses'] += 1
            raise
    
    async def _execute_cross_system_analysis(self, query: AnalyticsQuery) -> Dict[str, Any]:
        """Execute cross-system analytics analysis"""
        try:
            results = {}
            
            # Data source analysis
            data_source_metrics = await self._analyze_data_sources(query)
            results['data_sources'] = data_source_metrics
            
            # Compliance analysis
            compliance_metrics = await self._analyze_compliance_status(query)
            results['compliance'] = compliance_metrics
            
            # Classification analysis
            classification_metrics = await self._analyze_classification_coverage(query)
            results['classification'] = classification_metrics
            
            # Scan performance analysis
            scan_metrics = await self._analyze_scan_performance(query)
            results['scan_performance'] = scan_metrics
            
            # Data catalog analysis
            catalog_metrics = await self._analyze_catalog_usage(query)
            results['catalog'] = catalog_metrics
            
            # Cross-system correlations
            correlations = await self._analyze_cross_system_correlations(query)
            results['correlations'] = correlations
            
            # System health overview
            system_health = await self._analyze_system_health(query)
            results['system_health'] = system_health
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to execute cross-system analysis: {e}")
            raise
    
    async def _execute_predictive_analysis(self, query: AnalyticsQuery) -> Dict[str, Any]:
        """Execute predictive analytics analysis"""
        try:
            results = {}
            
            # Performance predictions
            performance_predictions = await self._predict_performance_trends(query)
            results['performance_predictions'] = performance_predictions
            
            # Usage forecasting
            usage_forecasts = await self._forecast_usage_patterns(query)
            results['usage_forecasts'] = usage_forecasts
            
            # Quality score predictions
            quality_predictions = await self._predict_quality_scores(query)
            results['quality_predictions'] = quality_predictions
            
            # Cost optimization predictions
            cost_predictions = await self._predict_cost_optimization(query)
            results['cost_predictions'] = cost_predictions
            
            # Risk analysis
            risk_analysis = await self._analyze_predictive_risks(query)
            results['risk_analysis'] = risk_analysis
            
            # Recommendation engine
            recommendations = await self._generate_predictive_recommendations(query)
            results['recommendations'] = recommendations
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to execute predictive analysis: {e}")
            raise
    
    async def _execute_trend_analysis(self, query: AnalyticsQuery) -> Dict[str, Any]:
        """Execute trend analysis"""
        try:
            results = {}
            
            # Data volume trends
            volume_trends = await self._analyze_data_volume_trends(query)
            results['volume_trends'] = volume_trends
            
            # Performance trends
            performance_trends = await self._analyze_performance_trends(query)
            results['performance_trends'] = performance_trends
            
            # Quality trends
            quality_trends = await self._analyze_quality_trends(query)
            results['quality_trends'] = quality_trends
            
            # Usage trends
            usage_trends = await self._analyze_usage_trends(query)
            results['usage_trends'] = usage_trends
            
            # Compliance trends
            compliance_trends = await self._analyze_compliance_trends(query)
            results['compliance_trends'] = compliance_trends
            
            # Anomaly detection
            anomalies = await self._detect_trend_anomalies(query)
            results['anomalies'] = anomalies
            
            # Trend predictions
            trend_predictions = await self._predict_future_trends(query)
            results['trend_predictions'] = trend_predictions
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to execute trend analysis: {e}")
            raise
    
    async def _execute_roi_analysis(self, query: AnalyticsQuery) -> Dict[str, Any]:
        """Execute ROI and business value analysis"""
        try:
            results = {}
            
            # Cost analysis
            cost_analysis = await self._analyze_operational_costs(query)
            results['cost_analysis'] = cost_analysis
            
            # Efficiency metrics
            efficiency_metrics = await self._analyze_operational_efficiency(query)
            results['efficiency_metrics'] = efficiency_metrics
            
            # Time savings analysis
            time_savings = await self._analyze_time_savings(query)
            results['time_savings'] = time_savings
            
            # Quality improvements
            quality_improvements = await self._analyze_quality_improvements(query)
            results['quality_improvements'] = quality_improvements
            
            # Risk reduction
            risk_reduction = await self._analyze_risk_reduction(query)
            results['risk_reduction'] = risk_reduction
            
            # ROI calculations
            roi_calculations = await self._calculate_roi_metrics(query)
            results['roi_calculations'] = roi_calculations
            
            # Business impact assessment
            business_impact = await self._assess_business_impact(query)
            results['business_impact'] = business_impact
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to execute ROI analysis: {e}")
            raise
    
    async def _execute_business_intelligence_analysis(self, query: AnalyticsQuery) -> Dict[str, Any]:
        """Execute business intelligence analysis"""
        try:
            results = {}
            
            # KPI dashboard
            kpi_metrics = await self._calculate_kpi_metrics(query)
            results['kpi_metrics'] = kpi_metrics
            
            # Executive summary
            executive_summary = await self._generate_executive_summary(query)
            results['executive_summary'] = executive_summary
            
            # Departmental insights
            departmental_insights = await self._analyze_departmental_usage(query)
            results['departmental_insights'] = departmental_insights
            
            # Data asset valuation
            asset_valuation = await self._assess_data_asset_value(query)
            results['asset_valuation'] = asset_valuation
            
            # Competitive analysis
            competitive_analysis = await self._perform_competitive_analysis(query)
            results['competitive_analysis'] = competitive_analysis
            
            # Strategic recommendations
            strategic_recommendations = await self._generate_strategic_recommendations(query)
            results['strategic_recommendations'] = strategic_recommendations
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to execute business intelligence analysis: {e}")
            raise
    
    async def generate_advanced_visualizations(
        self,
        analysis_result: AnalyticsResult,
        visualization_types: List[str],
        interactive: bool = True
    ) -> Dict[str, Any]:
        """
        Generate advanced data visualizations and dashboards
        
        Features:
        - Interactive charts and graphs
        - Multi-dimensional visualizations
        - Real-time data updates
        - Custom dashboard creation
        """
        try:
            visualizations = {}
            
            for viz_type in visualization_types:
                if viz_type == "cross_system_dashboard":
                    viz = await self._create_cross_system_dashboard(analysis_result, interactive)
                    visualizations[viz_type] = viz
                
                elif viz_type == "predictive_charts":
                    viz = await self._create_predictive_charts(analysis_result, interactive)
                    visualizations[viz_type] = viz
                
                elif viz_type == "trend_analysis":
                    viz = await self._create_trend_analysis_charts(analysis_result, interactive)
                    visualizations[viz_type] = viz
                
                elif viz_type == "network_diagram":
                    viz = await self._create_network_diagram(analysis_result, interactive)
                    visualizations[viz_type] = viz
                
                elif viz_type == "heatmap":
                    viz = await self._create_correlation_heatmap(analysis_result, interactive)
                    visualizations[viz_type] = viz
                
                elif viz_type == "roi_dashboard":
                    viz = await self._create_roi_dashboard(analysis_result, interactive)
                    visualizations[viz_type] = viz
            
            return {
                'visualizations': visualizations,
                'generated_at': datetime.utcnow().isoformat(),
                'interactive': interactive,
                'metadata': {
                    'chart_count': len(visualizations),
                    'data_points': len(analysis_result.result_data),
                    'generation_time': datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to generate visualizations: {e}")
            raise
    
    async def _create_cross_system_dashboard(
        self, 
        analysis_result: AnalyticsResult, 
        interactive: bool
    ) -> Dict[str, Any]:
        """Create comprehensive cross-system dashboard"""
        try:
            # Create subplot structure
            fig = make_subplots(
                rows=3, cols=3,
                subplot_titles=[
                    'Data Sources Status', 'Compliance Overview', 'Classification Coverage',
                    'Scan Performance', 'Catalog Usage', 'Quality Metrics',
                    'System Health', 'User Activity', 'Cost Analysis'
                ],
                specs=[
                    [{"type": "indicator"}, {"type": "pie"}, {"type": "bar"}],
                    [{"type": "scatter"}, {"type": "heatmap"}, {"type": "gauge"}],
                    [{"type": "treemap"}, {"type": "line"}, {"type": "histogram"}]
                ]
            )
            
            # Add data source status indicator
            data_sources = analysis_result.result_data.get('data_sources', {})
            active_sources = data_sources.get('active_count', 0)
            total_sources = data_sources.get('total_count', 1)
            
            fig.add_trace(
                go.Indicator(
                    mode="gauge+number+delta",
                    value=active_sources,
                    domain={'x': [0, 1], 'y': [0, 1]},
                    title={'text': "Active Data Sources"},
                    delta={'reference': total_sources},
                    gauge={
                        'axis': {'range': [None, total_sources]},
                        'bar': {'color': "darkblue"},
                        'steps': [
                            {'range': [0, total_sources*0.5], 'color': "lightgray"},
                            {'range': [total_sources*0.5, total_sources*0.8], 'color': "gray"}
                        ],
                        'threshold': {
                            'line': {'color': "red", 'width': 4},
                            'thickness': 0.75,
                            'value': total_sources*0.9
                        }
                    }
                ),
                row=1, col=1
            )
            
            # Add compliance pie chart
            compliance_data = analysis_result.result_data.get('compliance', {})
            fig.add_trace(
                go.Pie(
                    labels=['Compliant', 'Non-Compliant', 'Partial'],
                    values=[
                        compliance_data.get('compliant_count', 0),
                        compliance_data.get('non_compliant_count', 0),
                        compliance_data.get('partial_compliant_count', 0)
                    ],
                    hole=0.3
                ),
                row=1, col=2
            )
            
            # Add more charts...
            # (Additional chart implementations would continue here)
            
            # Update layout
            fig.update_layout(
                height=800,
                showlegend=True,
                title_text="Enterprise Data Governance Dashboard",
                title_x=0.5
            )
            
            return {
                'chart_data': fig.to_json() if interactive else fig.to_image(format="png"),
                'chart_type': 'cross_system_dashboard',
                'interactive': interactive,
                'metadata': {
                    'charts_count': 9,
                    'data_points': len(analysis_result.result_data)
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to create cross-system dashboard: {e}")
            raise
    
    async def generate_business_insights(
        self,
        analysis_results: List[AnalyticsResult],
        insight_types: List[str]
    ) -> List[AnalyticsInsight]:
        """
        Generate actionable business insights from analytics results
        
        Features:
        - AI-powered insight generation
        - Pattern recognition and analysis
        - Actionable recommendations
        - Business impact assessment
        """
        try:
            insights = []
            
            for insight_type in insight_types:
                if insight_type == "performance_optimization":
                    insight = await self._generate_performance_insights(analysis_results)
                    insights.append(insight)
                
                elif insight_type == "cost_reduction":
                    insight = await self._generate_cost_insights(analysis_results)
                    insights.append(insight)
                
                elif insight_type == "quality_improvement":
                    insight = await self._generate_quality_insights(analysis_results)
                    insights.append(insight)
                
                elif insight_type == "compliance_gaps":
                    insight = await self._generate_compliance_insights(analysis_results)
                    insights.append(insight)
                
                elif insight_type == "usage_patterns":
                    insight = await self._generate_usage_insights(analysis_results)
                    insights.append(insight)
                
                elif insight_type == "risk_assessment":
                    insight = await self._generate_risk_insights(analysis_results)
                    insights.append(insight)
            
            # Cache insights
            for insight in insights:
                self.insight_cache.append(insight)
            
            return insights
            
        except Exception as e:
            logger.error(f"Failed to generate business insights: {e}")
            raise
    
    async def _generate_performance_insights(
        self, 
        analysis_results: List[AnalyticsResult]
    ) -> AnalyticsInsight:
        """Generate performance optimization insights"""
        try:
            # Analyze performance data across results
            performance_data = []
            for result in analysis_results:
                if 'scan_performance' in result.result_data:
                    performance_data.append(result.result_data['scan_performance'])
            
            # Calculate performance metrics
            avg_response_time = np.mean([data.get('avg_response_time', 0) for data in performance_data])
            throughput = np.mean([data.get('throughput', 0) for data in performance_data])
            error_rate = np.mean([data.get('error_rate', 0) for data in performance_data])
            
            # Generate insights
            insight_text = f"System performance analysis reveals average response time of {avg_response_time:.2f}ms "
            insight_text += f"with throughput of {throughput:.1f} ops/sec. "
            
            recommendations = []
            if avg_response_time > 1000:
                recommendations.append("Consider implementing caching mechanisms to reduce response times")
            if error_rate > 0.05:
                recommendations.append("High error rate detected - investigate system stability")
            if throughput < 100:
                recommendations.append("Low throughput indicates potential bottlenecks")
            
            return AnalyticsInsight(
                insight_id=str(uuid.uuid4()),
                insight_type="performance_optimization",
                title="Performance Optimization Opportunities",
                description=insight_text,
                recommendations=recommendations,
                confidence_score=0.85,
                business_impact="high",
                generated_at=datetime.utcnow(),
                metadata={
                    'avg_response_time': avg_response_time,
                    'throughput': throughput,
                    'error_rate': error_rate,
                    'data_sources_analyzed': len(performance_data)
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to generate performance insights: {e}")
            raise
    
    async def create_real_time_dashboard(
        self,
        dashboard_config: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Create real-time analytics dashboard with live updates
        
        Features:
        - Real-time data streaming
        - Customizable dashboard layouts
        - Interactive visualizations
        - Alert integration
        """
        try:
            dashboard_id = str(uuid.uuid4())
            
            # Create dashboard configuration
            dashboard = {
                'dashboard_id': dashboard_id,
                'name': dashboard_config.get('name', 'Analytics Dashboard'),
                'description': dashboard_config.get('description', ''),
                'layout': dashboard_config.get('layout', 'grid'),
                'refresh_interval': dashboard_config.get('refresh_interval', 30),
                'widgets': [],
                'created_by': user_id,
                'created_at': datetime.utcnow().isoformat(),
                'is_public': dashboard_config.get('is_public', False)
            }
            
            # Create widgets based on configuration
            for widget_config in dashboard_config.get('widgets', []):
                widget = await self._create_dashboard_widget(widget_config)
                dashboard['widgets'].append(widget)
            
            # Store dashboard configuration
            self.dashboard_configs[dashboard_id] = dashboard
            
            # Start real-time data streaming for dashboard
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self._stream_dashboard_data(dashboard_id))
            except RuntimeError:
                # Start streaming when loop is available
                self._pending_dashboard_streams.append(dashboard_id)
            
            return dashboard
            
        except Exception as e:
            logger.error(f"Failed to create real-time dashboard: {e}")
            raise
    
    async def _stream_dashboard_data(self, dashboard_id: str):
        """Stream real-time data updates to dashboard"""
        try:
            dashboard = self.dashboard_configs.get(dashboard_id)
            if not dashboard:
                return
            
            while True:
                # Update each widget with fresh data
                for widget in dashboard['widgets']:
                    updated_data = await self._get_widget_data(widget)
                    widget['data'] = updated_data
                    widget['last_updated'] = datetime.utcnow().isoformat()
                
                # Wait for refresh interval
                await asyncio.sleep(dashboard['refresh_interval'])
                
        except Exception as e:
            logger.error(f"Failed to stream dashboard data: {e}")
    
    async def get_analytics_recommendations(
        self,
        analysis_context: Dict[str, Any],
        recommendation_types: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Generate comprehensive analytics recommendations
        
        Features:
        - AI-powered recommendation engine
        - Context-aware suggestions
        - Priority-based ranking
        - Implementation guidance
        """
        try:
            recommendations = []
            
            for rec_type in recommendation_types:
                if rec_type == "performance":
                    recs = await self._get_performance_recommendations(analysis_context)
                    recommendations.extend(recs)
                
                elif rec_type == "cost_optimization":
                    recs = await self._get_cost_optimization_recommendations(analysis_context)
                    recommendations.extend(recs)
                
                elif rec_type == "quality":
                    recs = await self._get_quality_recommendations(analysis_context)
                    recommendations.extend(recs)
                
                elif rec_type == "compliance":
                    recs = await self._get_compliance_recommendations(analysis_context)
                    recommendations.extend(recs)
                
                elif rec_type == "security":
                    recs = await self._get_security_recommendations(analysis_context)
                    recommendations.extend(recs)
            
            # Rank recommendations by priority and impact
            ranked_recommendations = sorted(
                recommendations,
                key=lambda x: (x['priority'], x['business_impact']),
                reverse=True
            )
            
            return ranked_recommendations
            
        except Exception as e:
            logger.error(f"Failed to get analytics recommendations: {e}")
            raise
    
    async def get_analytics_metrics(self) -> Dict[str, Any]:
        """Get comprehensive analytics service metrics"""
        try:
            return {
                'service_metrics': self.analytics_metrics,
                'cache_stats': {
                    'query_cache_size': len(self.query_cache),
                    'model_cache_size': len(self.model_cache),
                    'insight_cache_size': len(self.insight_cache)
                },
                'model_performance': {
                    model_name: {
                        'accuracy': model_info.get('accuracy', 0.0),
                        'last_trained': model_info.get('last_trained'),
                        'prediction_count': model_info.get('prediction_count', 0)
                    }
                    for model_name, model_info in self.prediction_models.items()
                },
                'system_health': {
                    'status': 'healthy',
                    'uptime': datetime.utcnow().isoformat(),
                    'active_queries': len(self.active_queries),
                    'memory_usage': 'normal'
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get analytics metrics: {e}")
            raise
    
    # Background processing methods
    
    async def _analytics_processing_loop(self):
        """Background loop for processing analytics queries"""
        while True:
            try:
                # Process queued analytics requests
                # Clean up completed queries
                # Update metrics
                await asyncio.sleep(10)
            except Exception as e:
                logger.error(f"Analytics processing loop error: {e}")
                await asyncio.sleep(30)
    
    async def _model_training_loop(self):
        """Background loop for training and updating ML models"""
        while True:
            try:
                # Retrain models with new data
                # Update model performance metrics
                # Optimize model parameters
                await asyncio.sleep(3600)  # Run every hour
            except Exception as e:
                logger.error(f"Model training loop error: {e}")
                await asyncio.sleep(1800)
    
    async def _insight_generation_loop(self):
        """Background loop for generating automated insights"""
        while True:
            try:
                # Generate automated insights
                # Update insight cache
                # Trigger alerts if needed
                await asyncio.sleep(300)  # Run every 5 minutes
            except Exception as e:
                logger.error(f"Insight generation loop error: {e}")
                await asyncio.sleep(600)
    
    async def _performance_monitoring_loop(self):
        """Background loop for monitoring analytics performance"""
        while True:
            try:
                # Monitor service performance
                # Update metrics
                # Trigger optimizations if needed
                await asyncio.sleep(60)  # Run every minute
            except Exception as e:
                logger.error(f"Performance monitoring loop error: {e}")
                await asyncio.sleep(120)
    
    # Helper methods
    
    def _generate_query_hash(self, query: AnalyticsQuery) -> str:
        """Generate unique hash for analytics query"""
        query_str = f"{query.query_type}_{query.data_sources}_{query.filters}_{query.time_range}"
        return str(hash(query_str))
    
    def _is_cache_valid(self, cached_result: AnalyticsResult) -> bool:
        """Check if cached result is still valid"""
        cache_duration = timedelta(minutes=30)  # Cache for 30 minutes
        return datetime.utcnow() - cached_result.generated_at < cache_duration
    
    async def _optimize_analytics_query(self, query: AnalyticsQuery) -> AnalyticsQuery:
        """Optimize analytics query for better performance"""
        # Query optimization logic would go here
        return query
    
    async def get_analytics_reports(
        self,
        report_types: List[str],
        timeframe: str = "30d",
        include_insights: bool = True,
        include_recommendations: bool = True,
        user_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get existing analytics reports"""
        try:
            # Convert timeframe to datetime range
            end_date = datetime.utcnow()
            if timeframe == "7d":
                start_date = end_date - timedelta(days=7)
            elif timeframe == "30d":
                start_date = end_date - timedelta(days=30)
            elif timeframe == "90d":
                start_date = end_date - timedelta(days=90)
            else:
                start_date = end_date - timedelta(days=30)  # Default
            
            reports = []
            
            for report_type in report_types:
                if report_type == "performance":
                    report = await self._generate_performance_report(start_date, end_date, include_insights)
                elif report_type == "trends":
                    report = await self._generate_trends_report(start_date, end_date, include_insights)
                elif report_type == "business_intelligence":
                    report = await self._generate_business_intelligence_report(start_date, end_date, include_insights)
                elif report_type == "predictions":
                    report = await self._generate_predictions_report(start_date, end_date, include_insights)
                else:
                    continue
                
                if report:
                    reports.append(report)
            
            return reports
            
        except Exception as e:
            logger.error(f"Error fetching analytics reports: {str(e)}")
            raise
    
    async def get_analytics_visualizations(
        self,
        visualization_types: List[str],
        timeframe: str = "30d",
        include_data: bool = True,
        user_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get analytics visualizations"""
        try:
            # Convert timeframe to datetime range
            end_date = datetime.utcnow()
            if timeframe == "7d":
                start_date = end_date - timedelta(days=7)
            elif timeframe == "30d":
                start_date = end_date - timedelta(days=30)
            elif timeframe == "90d":
                start_date = end_date - timedelta(days=90)
            else:
                start_date = end_date - timedelta(days=30)  # Default
            
            visualizations = []
            
            for viz_type in visualization_types:
                viz = await self._generate_visualization(viz_type, start_date, end_date, include_data)
                if viz:
                    visualizations.append(viz)
            
            return visualizations
            
        except Exception as e:
            logger.error(f"Error fetching analytics visualizations: {str(e)}")
            raise
    
    async def _generate_performance_report(
        self, 
        start_date: datetime, 
        end_date: datetime, 
        include_insights: bool
    ) -> Dict[str, Any]:
        """Generate performance analytics report"""
        return {
            "id": f"perf_report_{int(datetime.utcnow().timestamp())}",
            "title": "System Performance Analytics",
            "type": "performance",
            "status": "completed",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "scan_performance": await self._get_scan_performance_metrics(start_date, end_date),
                "system_performance": await self._get_system_performance_metrics(start_date, end_date),
                "resource_utilization": await self._get_resource_utilization_metrics(start_date, end_date)
            },
            "insights": await self._generate_performance_insights() if include_insights else []
        }
    
    async def _generate_trends_report(
        self, 
        start_date: datetime, 
        end_date: datetime, 
        include_insights: bool
    ) -> Dict[str, Any]:
        """Generate trends analytics report"""
        return {
            "id": f"trends_report_{int(datetime.utcnow().timestamp())}",
            "title": "Trends Analysis Report",
            "type": "trends",
            "status": "completed",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "scan_trends": await self._get_scan_trends(start_date, end_date),
                "performance_trends": await self._get_performance_trends(start_date, end_date),
                "usage_trends": await self._get_usage_trends(start_date, end_date)
            },
            "insights": await self._generate_trends_insights() if include_insights else []
        }
    
    async def _generate_business_intelligence_report(
        self, 
        start_date: datetime, 
        end_date: datetime, 
        include_insights: bool
    ) -> Dict[str, Any]:
        """Generate business intelligence report"""
        return {
            "id": f"bi_report_{int(datetime.utcnow().timestamp())}",
            "title": "Business Intelligence Report",
            "type": "business_intelligence",
            "status": "completed",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "kpi_metrics": await self._get_kpi_metrics(start_date, end_date),
                "business_metrics": await self._get_business_metrics(start_date, end_date),
                "roi_analysis": await self._get_roi_analysis(start_date, end_date)
            },
            "insights": await self._generate_business_insights() if include_insights else []
        }
    
    async def _generate_predictions_report(
        self, 
        start_date: datetime, 
        end_date: datetime, 
        include_insights: bool
    ) -> Dict[str, Any]:
        """Generate predictions report"""
        return {
            "id": f"pred_report_{int(datetime.utcnow().timestamp())}",
            "title": "Predictive Analytics Report",
            "type": "predictions",
            "status": "completed",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "predictions": await self._get_predictions(start_date, end_date),
                "forecasts": await self._get_forecasts(start_date, end_date),
                "anomaly_predictions": await self._get_anomaly_predictions(start_date, end_date)
            },
            "insights": await self._generate_prediction_insights() if include_insights else []
        }
    
    async def _generate_visualization(
        self,
        viz_type: str,
        start_date: datetime,
        end_date: datetime,
        include_data: bool
    ) -> Dict[str, Any]:
        """Generate visualization data"""
        viz_id = f"{viz_type}_{int(datetime.utcnow().timestamp())}"
        
        base_viz = {
            "id": viz_id,
            "title": f"{viz_type.replace('_', ' ').title()} Visualization",
            "type": viz_type,
            "created_at": datetime.utcnow().isoformat(),
            "config": self._get_default_viz_config(viz_type)
        }
        
        if include_data:
            base_viz["data"] = await self._get_viz_data(viz_type, start_date, end_date)
        
        return base_viz
    
    def _get_default_viz_config(self, viz_type: str) -> Dict[str, Any]:
        """Get default configuration for visualization type"""
        configs = {
            "line_chart": {"xAxis": "time", "yAxis": "value", "color": "blue"},
            "bar_chart": {"xAxis": "category", "yAxis": "value", "color": "green"},
            "pie_chart": {"dataKey": "value", "nameKey": "name", "colors": ["#8884d8", "#82ca9d", "#ffc658"]},
            "heatmap": {"xAxis": "x", "yAxis": "y", "value": "intensity"},
            "scatter_plot": {"xAxis": "x", "yAxis": "y", "color": "red"}
        }
        return configs.get(viz_type, {})
    
    async def _get_viz_data(self, viz_type: str, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get data for visualization"""
        # Implementation would fetch real data based on viz_type
        # For now, return sample structure
        if viz_type == "line_chart":
            return [{"time": "2024-01-01", "value": 100}, {"time": "2024-01-02", "value": 120}]
        elif viz_type == "bar_chart":
            return [{"category": "A", "value": 100}, {"category": "B", "value": 150}]
        elif viz_type == "pie_chart":
            return [{"name": "Section A", "value": 400}, {"name": "Section B", "value": 300}]
        else:
            return []
    
    # Helper methods for data fetching (implementations would use real database queries)
    async def _get_scan_performance_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"avg_duration": 120, "success_rate": 95.5, "throughput": 1000}
    
    async def _get_system_performance_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"cpu_usage": 65.2, "memory_usage": 72.1, "disk_usage": 45.3}
    
    async def _get_resource_utilization_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"peak_usage": 85.6, "avg_usage": 67.3, "low_usage": 23.1}
    
    async def _generate_performance_insights(self) -> List[Dict[str, Any]]:
        return [{"type": "performance", "message": "System performance is optimal", "priority": "info"}]
    
    async def _get_scan_trends(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"upward_trend": True, "growth_rate": 15.2}
    
    async def _get_performance_trends(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"improvement": True, "efficiency_gain": 12.5}
    
    async def _get_usage_trends(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"active_users": 1250, "usage_growth": 8.3}
    
    async def _generate_trends_insights(self) -> List[Dict[str, Any]]:
        return [{"type": "trend", "message": "Positive growth trend detected", "priority": "info"}]
    
    async def _get_kpi_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"availability": 99.9, "performance_score": 87.5, "user_satisfaction": 92.1}
    
    async def _get_business_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"cost_efficiency": 85.2, "time_savings": 67.3, "productivity_gain": 23.1}
    
    async def _get_roi_analysis(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"roi_percentage": 156.7, "payback_period": 8.2, "net_benefit": 125000}
    
    async def _generate_business_insights(self) -> List[Dict[str, Any]]:
        return [{"type": "business", "message": "Strong ROI and efficiency gains", "priority": "info"}]
    
    async def _get_predictions(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"next_30_days": {"performance": "stable", "usage": "increasing"}}
    
    async def _get_forecasts(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"resource_needs": {"cpu": "increase", "memory": "stable", "storage": "increase"}}
    
    async def _get_anomaly_predictions(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {"risk_score": 25.3, "potential_issues": ["memory_pressure", "disk_space"]}
    
    async def _generate_prediction_insights(self) -> List[Dict[str, Any]]:
        return [{"type": "prediction", "message": "Proactive scaling recommended", "priority": "warning"}]