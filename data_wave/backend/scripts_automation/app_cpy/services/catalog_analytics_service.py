"""
Enterprise Catalog Analytics Service
Advanced analytics service for comprehensive data catalog insights including usage patterns,
data discovery analytics, lineage analysis, quality trends, and AI-powered recommendations
for data governance optimization.
"""

import asyncio
import json
import logging
import numpy as np
import pandas as pd
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4

from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler
import networkx as nx

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..core.logging_config import get_logger
from ..core.settings import settings_manager
try:
    from ..core.settings import get_settings
except Exception:
    from ..core.config import settings as get_settings
from ..models.catalog_intelligence_models import *
from ..services.ai_service import EnterpriseAIService as AIService

logger = get_logger(__name__)

class AnalyticsConfig:
    """Configuration for catalog analytics"""
    
    def __init__(self):
        self.analytics_refresh_interval = 3600  # 1 hour
        self.usage_tracking_window_days = 30
        self.trend_analysis_window_days = 90
        self.anomaly_detection_threshold = 2.0
        self.clustering_min_samples = 5
        
        # Analytics types
        self.usage_analytics_enabled = True
        self.quality_analytics_enabled = True
        self.lineage_analytics_enabled = True
        self.discovery_analytics_enabled = True
        self.recommendation_analytics_enabled = True
        
        # Performance settings
        self.max_assets_per_analysis = 10000
        self.cache_ttl_seconds = 1800  # 30 minutes
        self.background_analysis_enabled = True

class CatalogAnalyticsService:
    """
    Enterprise-grade catalog analytics service providing:
    - Comprehensive usage pattern analysis
    - Data discovery and search analytics
    - Lineage relationship analysis
    - Data quality trend analysis
    - AI-powered recommendations and insights
    - Performance and adoption metrics
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = AnalyticsConfig()
        self._init_analytics_components()
        
        # Analytics state
        self.usage_metrics = defaultdict(lambda: defaultdict(int))
        self.quality_metrics = defaultdict(list)
        self.discovery_metrics = defaultdict(list)
        self.lineage_metrics = {}
        
        # Analytics cache
        self.analytics_cache = {}
        self.trend_cache = {}
        self.recommendation_cache = {}
        
        # ML models for analytics
        self.usage_clusterer = None
        self.quality_predictor = None
        self.anomaly_detector = None
        
        # Background analytics
        self.analytics_queue = deque()
        self.analytics_results = {}
        
        # Service metrics
        self.service_metrics = {
            'total_analytics_generated': 0,
            'usage_reports_created': 0,
            'quality_analyses_performed': 0,
            'lineage_analyses_performed': 0,
            'recommendations_generated': 0,
            'average_analysis_time': 0.0,
            'cache_hit_rate': 0.0
        }
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=6)
        
        # Background tasks
        if self.config.background_analysis_enabled:
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self._analytics_refresh_loop())
                loop.create_task(self._trend_analysis_loop())
                loop.create_task(self._recommendation_update_loop())
            except RuntimeError:
                pass

    def start(self) -> None:
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._analytics_refresh_loop())
            loop.create_task(self._trend_analysis_loop())
            loop.create_task(self._recommendation_update_loop())
        except RuntimeError:
            pass
    
    def _init_analytics_components(self):
        """Initialize analytics components and models"""
        try:
            # Initialize clustering model for usage patterns
            self.usage_clusterer = KMeans(
                n_clusters=5,
                random_state=42,
                n_init=10
            )
            
            # Initialize anomaly detection for quality metrics
            from sklearn.ensemble import IsolationForest
            self.anomaly_detector = IsolationForest(
                contamination=0.1,
                random_state=42
            )
            
            # Initialize scaler for feature normalization
            self.feature_scaler = StandardScaler()
            
            logger.info("Catalog analytics components initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize analytics components: {e}")
            raise
    
    async def generate_usage_analytics(
        self,
        time_range: str = "30d",
        asset_filter: Optional[Dict[str, Any]] = None,
        group_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive usage analytics
        
        Args:
            time_range: Time range for analysis (e.g., '7d', '30d', '90d')
            asset_filter: Optional filter for specific assets
            group_by: Optional grouping dimension
            
        Returns:
            Usage analytics with insights and trends
        """
        analytics_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = f"usage_analytics_{time_range}_{str(asset_filter)}_{group_by}"
            if cache_key in self.analytics_cache:
                cached_result = self.analytics_cache[cache_key]
                self.service_metrics['cache_hit_rate'] += 1
                return cached_result
            
            # Parse time range
            start_date, end_date = self._parse_time_range(time_range)
            
            # Gather usage data
            usage_data = await self._gather_usage_data(start_date, end_date, asset_filter)
            
            if not usage_data:
                return {
                    "analytics_id": analytics_id,
                    "status": "no_data",
                    "message": "No usage data available for the specified time range"
                }
            
            # Generate usage statistics
            usage_stats = await self._calculate_usage_statistics(usage_data, group_by)
            
            # Analyze usage patterns
            usage_patterns = await self._analyze_usage_patterns(usage_data)
            
            # Identify trending assets
            trending_assets = await self._identify_trending_assets(usage_data, start_date, end_date)
            
            # Calculate user engagement metrics
            engagement_metrics = await self._calculate_engagement_metrics(usage_data)
            
            # Generate usage insights
            usage_insights = await self._generate_usage_insights(
                usage_stats, usage_patterns, trending_assets, engagement_metrics
            )
            
            # Create analytics report
            analytics_report = {
                "analytics_id": analytics_id,
                "analytics_type": "usage",
                "time_range": time_range,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "asset_filter": asset_filter,
                "group_by": group_by,
                "usage_statistics": usage_stats,
                "usage_patterns": usage_patterns,
                "trending_assets": trending_assets,
                "engagement_metrics": engagement_metrics,
                "insights": usage_insights,
                "generated_at": datetime.utcnow().isoformat(),
                "processing_time_seconds": time.time() - start_time
            }
            
            # Cache result
            self.analytics_cache[cache_key] = analytics_report
            
            # Update service metrics
            self.service_metrics['usage_reports_created'] += 1
            self.service_metrics['total_analytics_generated'] += 1
            
            logger.info(f"Usage analytics generated: {analytics_id}")
            
            return analytics_report
            
        except Exception as e:
            logger.error(f"Usage analytics generation failed: {e}")
            return {
                "analytics_id": analytics_id,
                "status": "failed",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    async def generate_quality_analytics(
        self,
        time_range: str = "30d",
        quality_dimensions: Optional[List[str]] = None,
        asset_filter: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate data quality analytics and trends
        
        Args:
            time_range: Time range for analysis
            quality_dimensions: Specific quality dimensions to analyze
            asset_filter: Optional filter for specific assets
            
        Returns:
            Quality analytics with trends and recommendations
        """
        analytics_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Parse time range
            start_date, end_date = self._parse_time_range(time_range)
            
            # Gather quality data
            quality_data = await self._gather_quality_data(
                start_date, end_date, quality_dimensions, asset_filter
            )
            
            if not quality_data:
                return {
                    "analytics_id": analytics_id,
                    "status": "no_data",
                    "message": "No quality data available for the specified criteria"
                }
            
            # Calculate quality trends
            quality_trends = await self._calculate_quality_trends(quality_data, start_date, end_date)
            
            # Identify quality anomalies
            quality_anomalies = await self._detect_quality_anomalies(quality_data)
            
            # Generate quality scorecards
            quality_scorecards = await self._generate_quality_scorecards(quality_data)
            
            # Analyze quality patterns
            quality_patterns = await self._analyze_quality_patterns(quality_data)
            
            # Generate quality recommendations
            quality_recommendations = await self._generate_quality_recommendations(
                quality_trends, quality_anomalies, quality_patterns
            )
            
            # Create analytics report
            analytics_report = {
                "analytics_id": analytics_id,
                "analytics_type": "quality",
                "time_range": time_range,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "quality_dimensions": quality_dimensions,
                "asset_filter": asset_filter,
                "quality_trends": quality_trends,
                "quality_anomalies": quality_anomalies,
                "quality_scorecards": quality_scorecards,
                "quality_patterns": quality_patterns,
                "recommendations": quality_recommendations,
                "generated_at": datetime.utcnow().isoformat(),
                "processing_time_seconds": time.time() - start_time
            }
            
            # Update service metrics
            self.service_metrics['quality_analyses_performed'] += 1
            self.service_metrics['total_analytics_generated'] += 1
            
            logger.info(f"Quality analytics generated: {analytics_id}")
            
            return analytics_report
            
        except Exception as e:
            logger.error(f"Quality analytics generation failed: {e}")
            return {
                "analytics_id": analytics_id,
                "status": "failed",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    async def generate_lineage_analytics(
        self,
        asset_id: Optional[str] = None,
        analysis_depth: int = 5,
        include_impact_analysis: bool = True
    ) -> Dict[str, Any]:
        """
        Generate data lineage analytics and insights
        
        Args:
            asset_id: Specific asset to analyze (if None, analyzes all)
            analysis_depth: Maximum depth for lineage analysis
            include_impact_analysis: Whether to include impact analysis
            
        Returns:
            Lineage analytics with graph metrics and insights
        """
        analytics_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Gather lineage data
            lineage_data = await self._gather_lineage_data(asset_id, analysis_depth)
            
            if not lineage_data:
                return {
                    "analytics_id": analytics_id,
                    "status": "no_data",
                    "message": "No lineage data available"
                }
            
            # Build lineage graph
            lineage_graph = await self._build_lineage_graph(lineage_data)
            
            # Calculate graph metrics
            graph_metrics = await self._calculate_graph_metrics(lineage_graph)
            
            # Identify critical paths
            critical_paths = await self._identify_critical_paths(lineage_graph)
            
            # Analyze lineage complexity
            complexity_analysis = await self._analyze_lineage_complexity(lineage_graph)
            
            # Generate impact analysis
            impact_analysis = None
            if include_impact_analysis:
                impact_analysis = await self._generate_impact_analysis(lineage_graph, asset_id)
            
            # Identify lineage bottlenecks
            lineage_bottlenecks = await self._identify_lineage_bottlenecks(lineage_graph)
            
            # Generate lineage recommendations
            lineage_recommendations = await self._generate_lineage_recommendations(
                graph_metrics, complexity_analysis, lineage_bottlenecks
            )
            
            # Create analytics report
            analytics_report = {
                "analytics_id": analytics_id,
                "analytics_type": "lineage",
                "asset_id": asset_id,
                "analysis_depth": analysis_depth,
                "graph_metrics": graph_metrics,
                "critical_paths": critical_paths,
                "complexity_analysis": complexity_analysis,
                "impact_analysis": impact_analysis,
                "lineage_bottlenecks": lineage_bottlenecks,
                "recommendations": lineage_recommendations,
                "generated_at": datetime.utcnow().isoformat(),
                "processing_time_seconds": time.time() - start_time
            }
            
            # Update service metrics
            self.service_metrics['lineage_analyses_performed'] += 1
            self.service_metrics['total_analytics_generated'] += 1
            
            logger.info(f"Lineage analytics generated: {analytics_id}")
            
            return analytics_report
            
        except Exception as e:
            logger.error(f"Lineage analytics generation failed: {e}")
            return {
                "analytics_id": analytics_id,
                "status": "failed",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    async def generate_discovery_analytics(
        self,
        time_range: str = "30d",
        search_patterns: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate data discovery and search analytics
        
        Args:
            time_range: Time range for analysis
            search_patterns: Specific search patterns to analyze
            
        Returns:
            Discovery analytics with search insights and patterns
        """
        analytics_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Parse time range
            start_date, end_date = self._parse_time_range(time_range)
            
            # Gather discovery data
            discovery_data = await self._gather_discovery_data(
                start_date, end_date, search_patterns
            )
            
            if not discovery_data:
                return {
                    "analytics_id": analytics_id,
                    "status": "no_data",
                    "message": "No discovery data available"
                }
            
            # Analyze search patterns
            search_pattern_analysis = await self._analyze_search_patterns(discovery_data)
            
            # Calculate discovery success rates
            discovery_success_rates = await self._calculate_discovery_success_rates(discovery_data)
            
            # Identify popular assets
            popular_assets = await self._identify_popular_assets(discovery_data)
            
            # Analyze search query trends
            query_trends = await self._analyze_query_trends(discovery_data, start_date, end_date)
            
            # Generate discovery insights
            discovery_insights = await self._generate_discovery_insights(
                search_pattern_analysis, discovery_success_rates, popular_assets, query_trends
            )
            
            # Create analytics report
            analytics_report = {
                "analytics_id": analytics_id,
                "analytics_type": "discovery",
                "time_range": time_range,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "search_patterns": search_patterns,
                "search_pattern_analysis": search_pattern_analysis,
                "discovery_success_rates": discovery_success_rates,
                "popular_assets": popular_assets,
                "query_trends": query_trends,
                "insights": discovery_insights,
                "generated_at": datetime.utcnow().isoformat(),
                "processing_time_seconds": time.time() - start_time
            }
            
            # Update service metrics
            self.service_metrics['total_analytics_generated'] += 1
            
            logger.info(f"Discovery analytics generated: {analytics_id}")
            
            return analytics_report
            
        except Exception as e:
            logger.error(f"Discovery analytics generation failed: {e}")
            return {
                "analytics_id": analytics_id,
                "status": "failed",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    async def generate_recommendations(
        self,
        recommendation_type: str = "comprehensive",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate AI-powered recommendations for catalog optimization
        
        Args:
            recommendation_type: Type of recommendations to generate
            context: Optional context for targeted recommendations
            
        Returns:
            AI-powered recommendations with priorities and actions
        """
        recommendation_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = f"recommendations_{recommendation_type}_{str(context)}"
            if cache_key in self.recommendation_cache:
                cached_result = self.recommendation_cache[cache_key]
                return cached_result
            
            # Gather analytics data for recommendations
            analytics_data = await self._gather_recommendation_data(context)
            
            # Generate different types of recommendations
            recommendations = []
            
            if recommendation_type in ["comprehensive", "usage"]:
                usage_recommendations = await self._generate_usage_recommendations(analytics_data)
                recommendations.extend(usage_recommendations)
            
            if recommendation_type in ["comprehensive", "quality"]:
                quality_recommendations = await self._generate_quality_optimization_recommendations(analytics_data)
                recommendations.extend(quality_recommendations)
            
            if recommendation_type in ["comprehensive", "discovery"]:
                discovery_recommendations = await self._generate_discovery_recommendations(analytics_data)
                recommendations.extend(discovery_recommendations)
            
            if recommendation_type in ["comprehensive", "governance"]:
                governance_recommendations = await self._generate_governance_recommendations(analytics_data)
                recommendations.extend(governance_recommendations)
            
            # Prioritize recommendations
            prioritized_recommendations = await self._prioritize_recommendations(recommendations)
            
            # Generate action plans
            action_plans = await self._generate_action_plans(prioritized_recommendations)
            
            # Create recommendation report
            recommendation_report = {
                "recommendation_id": recommendation_id,
                "recommendation_type": recommendation_type,
                "context": context,
                "recommendations": prioritized_recommendations,
                "action_plans": action_plans,
                "total_recommendations": len(prioritized_recommendations),
                "high_priority_count": len([r for r in prioritized_recommendations if r.get("priority") == "high"]),
                "medium_priority_count": len([r for r in prioritized_recommendations if r.get("priority") == "medium"]),
                "low_priority_count": len([r for r in prioritized_recommendations if r.get("priority") == "low"]),
                "generated_at": datetime.utcnow().isoformat(),
                "processing_time_seconds": time.time() - start_time
            }
            
            # Cache result
            self.recommendation_cache[cache_key] = recommendation_report
            
            # Update service metrics
            self.service_metrics['recommendations_generated'] += 1
            
            logger.info(f"Recommendations generated: {recommendation_id}")
            
            return recommendation_report
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return {
                "recommendation_id": recommendation_id,
                "status": "failed",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    async def get_catalog_health_score(self) -> Dict[str, Any]:
        """
        Calculate overall catalog health score based on multiple metrics
        
        Returns:
            Comprehensive catalog health assessment
        """
        try:
            # Gather health metrics
            health_metrics = await self._gather_health_metrics()
            
            # Calculate component scores
            component_scores = {
                "usage_health": await self._calculate_usage_health_score(health_metrics),
                "quality_health": await self._calculate_quality_health_score(health_metrics),
                "discovery_health": await self._calculate_discovery_health_score(health_metrics),
                "lineage_health": await self._calculate_lineage_health_score(health_metrics),
                "governance_health": await self._calculate_governance_health_score(health_metrics)
            }
            
            # Calculate overall health score (weighted average)
            weights = {
                "usage_health": 0.25,
                "quality_health": 0.3,
                "discovery_health": 0.2,
                "lineage_health": 0.15,
                "governance_health": 0.1
            }
            
            overall_score = sum(
                component_scores[component] * weight
                for component, weight in weights.items()
            )
            
            # Determine health status
            if overall_score >= 90:
                health_status = "excellent"
            elif overall_score >= 80:
                health_status = "good"
            elif overall_score >= 70:
                health_status = "fair"
            elif overall_score >= 60:
                health_status = "poor"
            else:
                health_status = "critical"
            
            # Generate health insights
            health_insights = await self._generate_health_insights(
                component_scores, overall_score, health_status
            )
            
            return {
                "overall_score": overall_score,
                "health_status": health_status,
                "component_scores": component_scores,
                "health_insights": health_insights,
                "assessment_timestamp": datetime.utcnow().isoformat(),
                "score_breakdown": weights
            }
            
        except Exception as e:
            logger.error(f"Health score calculation failed: {e}")
            return {
                "overall_score": 0,
                "health_status": "unknown",
                "error": str(e)
            }
    
    # Utility methods for data gathering and analysis
    async def _gather_usage_data(
        self,
        start_date: datetime,
        end_date: datetime,
        asset_filter: Optional[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Gather usage data from various sources"""
        try:
            # Prefer real aggregated usage from asset usage metrics
            from ..models.advanced_catalog_models import AssetUsageMetrics
            from ..db_session import get_session
            from sqlalchemy import select
            with get_session() as s:
                q = s.exec(
                    select(AssetUsageMetrics)
                    .where(AssetUsageMetrics.metric_date >= start_date)
                    .where(AssetUsageMetrics.metric_date <= end_date)
                )
                rows = q.all()
                records: List[Dict[str, Any]] = []
                for r in rows:
                    if asset_filter and r.asset_id not in set(asset_filter.get("asset_ids", [])) and asset_filter.get("asset_ids"):
                        continue
                    records.append({
                        "asset_id": r.asset_id,
                        "user_id": "aggregated",
                        "action": "access",
                        "timestamp": r.metric_date,
                        "duration_seconds": r.avg_response_time or 0,
                        "source": "asset_usage_metrics",
                        "total_accesses": r.total_accesses,
                        "unique_users": r.unique_users,
                    })
                if records:
                    return records
        except Exception:
            pass
        # Fallback synthetic minimal dataset
        return []
    
    async def _calculate_usage_statistics(
        self,
        usage_data: List[Dict[str, Any]],
        group_by: Optional[str]
    ) -> Dict[str, Any]:
        """Calculate comprehensive usage statistics"""
        
        total_actions = len(usage_data)
        unique_users = len(set(record["user_id"] for record in usage_data))
        unique_assets = len(set(record["asset_id"] for record in usage_data))
        
        # Calculate action type distribution
        action_distribution = defaultdict(int)
        for record in usage_data:
            action_distribution[record["action"]] += 1
        
        # Calculate daily usage
        daily_usage = defaultdict(int)
        for record in usage_data:
            date_key = record["timestamp"].date().isoformat()
            daily_usage[date_key] += 1
        
        # Calculate average session duration
        session_durations = [record["duration_seconds"] for record in usage_data]
        avg_session_duration = sum(session_durations) / len(session_durations) if session_durations else 0
        
        return {
            "total_actions": total_actions,
            "unique_users": unique_users,
            "unique_assets": unique_assets,
            "action_distribution": dict(action_distribution),
            "daily_usage": dict(daily_usage),
            "average_session_duration": avg_session_duration,
            "most_active_day": max(daily_usage.items(), key=lambda x: x[1])[0] if daily_usage else None,
            "least_active_day": min(daily_usage.items(), key=lambda x: x[1])[0] if daily_usage else None
        }
    
    async def _analyze_usage_patterns(self, usage_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze usage patterns using ML clustering"""
        
        try:
            # Prepare features for clustering
            user_features = defaultdict(lambda: defaultdict(int))
            
            for record in usage_data:
                user_id = record["user_id"]
                hour = record["timestamp"].hour
                action = record["action"]
                
                user_features[user_id]["total_actions"] += 1
                user_features[user_id][f"hour_{hour}"] += 1
                user_features[user_id][f"action_{action}"] += 1
                user_features[user_id]["avg_duration"] += record["duration_seconds"]
            
            # Convert to feature matrix
            feature_names = set()
            for user_data in user_features.values():
                feature_names.update(user_data.keys())
            
            feature_names = sorted(list(feature_names))
            feature_matrix = []
            user_ids = []
            
            for user_id, user_data in user_features.items():
                features = [user_data.get(feature, 0) for feature in feature_names]
                feature_matrix.append(features)
                user_ids.append(user_id)
            
            if len(feature_matrix) < 5:
                return {"patterns": [], "clusters": 0}
            
            # Normalize features
            feature_matrix = self.feature_scaler.fit_transform(feature_matrix)
            
            # Perform clustering
            clusters = self.usage_clusterer.fit_predict(feature_matrix)
            
            # Analyze clusters
            cluster_analysis = defaultdict(list)
            for i, cluster in enumerate(clusters):
                cluster_analysis[cluster].append(user_ids[i])
            
            # Generate pattern descriptions
            patterns = []
            for cluster_id, users in cluster_analysis.items():
                if len(users) >= self.config.clustering_min_samples:
                    # Calculate cluster characteristics
                    cluster_features = [feature_matrix[i] for i, u in enumerate(user_ids) if u in users]
                    avg_features = np.mean(cluster_features, axis=0)
                    
                    pattern = {
                        "cluster_id": int(cluster_id),
                        "user_count": len(users),
                        "description": self._describe_usage_pattern(avg_features, feature_names),
                        "representative_users": users[:5]  # Sample users
                    }
                    patterns.append(pattern)
            
            return {
                "patterns": patterns,
                "clusters": len(patterns),
                "total_users_analyzed": len(user_ids)
            }
            
        except Exception as e:
            logger.error(f"Usage pattern analysis failed: {e}")
            return {"patterns": [], "clusters": 0, "error": str(e)}
    
    def _describe_usage_pattern(self, avg_features: np.ndarray, feature_names: List[str]) -> str:
        """Generate human-readable description of usage pattern"""
        
        # Find most prominent features
        top_indices = np.argsort(avg_features)[-3:]  # Top 3 features
        top_features = [feature_names[i] for i in top_indices]
        
        descriptions = []
        for feature in top_features:
            if feature.startswith("hour_"):
                hour = feature.split("_")[1]
                descriptions.append(f"active during hour {hour}")
            elif feature.startswith("action_"):
                action = feature.split("_")[1]
                descriptions.append(f"frequently performs {action}")
            elif feature == "total_actions":
                descriptions.append("high activity user")
            elif feature == "avg_duration":
                descriptions.append("long session duration")
        
        return "Users who are " + ", ".join(descriptions)
    
    def _parse_time_range(self, time_range: str) -> Tuple[datetime, datetime]:
        """Parse time range string to datetime objects"""
        
        end_date = datetime.utcnow()
        
        if time_range.endswith('d'):
            days = int(time_range[:-1])
            start_date = end_date - timedelta(days=days)
        elif time_range.endswith('h'):
            hours = int(time_range[:-1])
            start_date = end_date - timedelta(hours=hours)
        elif time_range.endswith('w'):
            weeks = int(time_range[:-1])
            start_date = end_date - timedelta(weeks=weeks)
        else:
            # Default to 30 days
            start_date = end_date - timedelta(days=30)
        
        return start_date, end_date
    
    # Background task loops
    async def _analytics_refresh_loop(self):
        """Refresh analytics periodically"""
        while True:
            try:
                await asyncio.sleep(self.config.analytics_refresh_interval)
                
                # Refresh usage analytics
                if self.config.usage_analytics_enabled:
                    await self.generate_usage_analytics()
                
                # Refresh quality analytics
                if self.config.quality_analytics_enabled:
                    await self.generate_quality_analytics()
                
                # Clean up old cache entries
                await self._cleanup_analytics_cache()
                
            except Exception as e:
                logger.error(f"Analytics refresh loop error: {e}")
    
    async def _trend_analysis_loop(self):
        """Analyze trends periodically"""
        while True:
            try:
                await asyncio.sleep(7200)  # Run every 2 hours
                
                # Update trend analysis
                await self._update_trend_analysis()
                
            except Exception as e:
                logger.error(f"Trend analysis loop error: {e}")
    
    async def _recommendation_update_loop(self):
        """Update recommendations periodically"""
        while True:
            try:
                await asyncio.sleep(21600)  # Run every 6 hours
                
                # Generate fresh recommendations
                await self.generate_recommendations("comprehensive")
                
                # Clean up old recommendation cache
                await self._cleanup_recommendation_cache()
                
            except Exception as e:
                logger.error(f"Recommendation update loop error: {e}")
    
    async def get_analytics_insights(self) -> Dict[str, Any]:
        """Get comprehensive analytics service insights"""
        
        return {
            "service_metrics": self.service_metrics.copy(),
            "analytics_cache_size": len(self.analytics_cache),
            "trend_cache_size": len(self.trend_cache),
            "recommendation_cache_size": len(self.recommendation_cache),
            "analytics_queue_size": len(self.analytics_queue),
            "configuration": {
                "analytics_refresh_interval": self.config.analytics_refresh_interval,
                "usage_tracking_window_days": self.config.usage_tracking_window_days,
                "trend_analysis_window_days": self.config.trend_analysis_window_days,
                "background_analysis_enabled": self.config.background_analysis_enabled,
                "cache_ttl_seconds": self.config.cache_ttl_seconds
            },
            "enabled_analytics": {
                "usage_analytics": self.config.usage_analytics_enabled,
                "quality_analytics": self.config.quality_analytics_enabled,
                "lineage_analytics": self.config.lineage_analytics_enabled,
                "discovery_analytics": self.config.discovery_analytics_enabled,
                "recommendation_analytics": self.config.recommendation_analytics_enabled
            },
            "ml_models_status": {
                "usage_clusterer": self.usage_clusterer is not None,
                "anomaly_detector": self.anomaly_detector is not None,
                "feature_scaler": self.feature_scaler is not None
            }
        }