"""
Enterprise Scan Performance Service
Advanced performance monitoring and optimization service for comprehensive scan performance
management. Provides real-time monitoring, bottleneck detection, AI-powered optimization
recommendations, and performance analytics with predictive insights.
"""

import asyncio
import json
import logging
import numpy as np
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4

import pandas as pd
from sklearn.cluster import DBSCAN, KMeans
from sklearn.ensemble import IsolationForest, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..core.logging_config import get_logger
from ..core.config import settings
from ..models.scan_performance_models import *
from ..services.ai_service import EnterpriseAIService as AIService

logger = get_logger(__name__)

class PerformanceConfig:
    """Configuration for performance monitoring and optimization"""
    
    def __init__(self):
        self.monitoring_interval = 30  # 30 seconds
        self.bottleneck_detection_threshold = 0.8
        self.optimization_frequency = 300  # 5 minutes
        self.alert_thresholds = {
            PerformanceMetricType.CPU_USAGE: 90.0,
            PerformanceMetricType.MEMORY_USAGE: 85.0,
            PerformanceMetricType.DISK_IO: 80.0,
            PerformanceMetricType.NETWORK_IO: 75.0,
            PerformanceMetricType.EXECUTION_TIME: 300.0,  # 5 minutes
            PerformanceMetricType.QUEUE_LENGTH: 100
        }
        
        # ML model parameters
        self.anomaly_detection_contamination = 0.1
        self.clustering_eps = 0.5
        self.clustering_min_samples = 5
        self.prediction_lookback_hours = 24
        
        # Optimization parameters
        self.auto_optimization_enabled = True
        self.optimization_confidence_threshold = 0.8
        self.max_concurrent_optimizations = 3

class ScanPerformanceService:
    """
    Enterprise-grade scan performance service providing:
    - Real-time performance monitoring and metrics collection
    - Intelligent bottleneck detection and analysis
    - AI-powered optimization recommendations
    - Predictive performance analytics
    - Automated performance tuning
    - Comprehensive performance reporting
    """
    
    def __init__(self):
        self.settings = settings
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = PerformanceConfig()
        self._init_performance_models()
        
        # Performance tracking
        self.performance_metrics = {}
        self.metric_history = defaultdict(deque)
        self.bottlenecks = deque(maxlen=100)
        self.optimizations = deque(maxlen=100)
        
        # Real-time monitoring
        self.active_monitors = {}
        self.resource_utilization = {}
        self.system_health = {}
        
        # ML models for optimization
        self.anomaly_detector = None
        self.performance_predictor = None
        self.bottleneck_classifier = None
        
        # Performance benchmarks
        self.performance_baselines = {}
        self.optimization_history = deque(maxlen=1000)
        
        # Analytics and reporting
        self.performance_reports = {}
        self.trend_analysis = {}
        
        # Performance metrics
        self.service_metrics = {
            'total_metrics_collected': 0,
            'bottlenecks_detected': 0,
            'optimizations_applied': 0,
            'alerts_generated': 0,
            'prediction_accuracy': 0.0,
            'average_response_time': 0.0,
            'system_uptime': 0.0
        }
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=10)
        
        # Background tasks
        asyncio.create_task(self._performance_monitoring_loop())
        asyncio.create_task(self._bottleneck_detection_loop())
        asyncio.create_task(self._optimization_loop())
        asyncio.create_task(self._analytics_loop())
    
    def _init_performance_models(self):
        """Initialize ML models for performance analysis"""
        try:
            # Anomaly detection for performance outliers
            self.anomaly_detector = IsolationForest(
                contamination=self.config.anomaly_detection_contamination,
                random_state=42
            )
            
            # Performance prediction model
            self.performance_predictor = RandomForestRegressor(
                n_estimators=100,
                random_state=42
            )
            
            # Clustering for bottleneck patterns
            self.bottleneck_clusterer = DBSCAN(
                eps=self.config.clustering_eps,
                min_samples=self.config.clustering_min_samples
            )
            
            # Scaler for feature normalization
            self.feature_scaler = StandardScaler()
            
            logger.info("Performance models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize performance models: {e}")
            raise
    
    async def collect_performance_metrics(
        self,
        resource_id: str,
        resource_type: ResourceType,
        metrics_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Collect and store performance metrics
        
        Args:
            resource_id: Unique identifier for the resource
            resource_type: Type of resource being monitored
            metrics_data: Dictionary containing metric values
            
        Returns:
            Collection result with analysis insights
        """
        metric_id = str(uuid4())
        collection_time = datetime.utcnow()
        
        try:
            # Process each metric type
            processed_metrics = []
            
            for metric_name, metric_value in metrics_data.items():
                try:
                    # Map metric name to type
                    metric_type = self._map_metric_name_to_type(metric_name)
                    
                    # Create performance metric
                    performance_metric = PerformanceMetric(
                        metric_id=f"{metric_id}_{metric_name}",
                        metric_name=metric_name,
                        metric_type=metric_type,
                        scope=MonitoringScope.RESOURCE,
                        resource_id=resource_id,
                        resource_type=resource_type,
                        component=f"{resource_type.value}_component",
                        current_value=float(metric_value),
                        warning_threshold=self.config.alert_thresholds.get(metric_type),
                        critical_threshold=self.config.alert_thresholds.get(metric_type, 0) * 1.2,
                        unit=self._get_metric_unit(metric_type),
                        measured_at=collection_time
                    )
                    
                    # Calculate trend and status
                    await self._calculate_metric_trends(performance_metric, resource_id, metric_name)
                    
                    # Store metric
                    self.performance_metrics[performance_metric.metric_id] = performance_metric
                    self.metric_history[f"{resource_id}_{metric_name}"].append({
                        'timestamp': collection_time,
                        'value': metric_value,
                        'status': performance_metric.status.value
                    })
                    
                    processed_metrics.append(performance_metric)
                    
                except Exception as e:
                    logger.warning(f"Failed to process metric {metric_name}: {e}")
                    continue
            
            # Analyze for bottlenecks
            bottleneck_analysis = await self._analyze_bottlenecks(resource_id, processed_metrics)
            
            # Generate alerts if needed
            alerts = await self._check_performance_alerts(processed_metrics)
            
            # Update service metrics
            self.service_metrics['total_metrics_collected'] += len(processed_metrics)
            
            logger.info(f"Collected {len(processed_metrics)} performance metrics for {resource_id}")
            
            return {
                "metric_id": metric_id,
                "status": "collected",
                "resource_id": resource_id,
                "metrics_processed": len(processed_metrics),
                "bottleneck_analysis": bottleneck_analysis,
                "alerts_generated": len(alerts),
                "collection_time": collection_time.isoformat(),
                "insights": await self._generate_performance_insights(processed_metrics)
            }
            
        except Exception as e:
            logger.error(f"Performance metrics collection failed: {e}")
            return {
                "metric_id": metric_id,
                "status": "failed",
                "error": str(e),
                "resource_id": resource_id
            }
    
    async def detect_bottlenecks(
        self,
        scope: MonitoringScope = MonitoringScope.SYSTEM,
        resource_filter: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Detect performance bottlenecks using AI analysis
        
        Args:
            scope: Monitoring scope for bottleneck detection
            resource_filter: Optional list of resource IDs to analyze
            
        Returns:
            Bottleneck detection results with recommendations
        """
        detection_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Gather performance data for analysis
            analysis_data = await self._gather_bottleneck_analysis_data(
                scope, resource_filter
            )
            
            if not analysis_data:
                return {
                    "detection_id": detection_id,
                    "status": "no_data",
                    "message": "Insufficient data for bottleneck detection"
                }
            
            # Prepare features for ML analysis
            features = await self._prepare_bottleneck_features(analysis_data)
            
            # Apply anomaly detection
            anomalies = await self._detect_performance_anomalies(features, analysis_data)
            
            # Cluster bottleneck patterns
            bottleneck_patterns = await self._cluster_bottleneck_patterns(features, analysis_data)
            
            # Analyze resource utilization
            resource_analysis = await self._analyze_resource_utilization(analysis_data)
            
            # Generate bottleneck insights
            bottleneck_insights = await self._generate_bottleneck_insights(
                anomalies, bottleneck_patterns, resource_analysis
            )
            
            # Create bottleneck records
            detected_bottlenecks = []
            for insight in bottleneck_insights:
                bottleneck = PerformanceBottleneck(
                    bottleneck_id=str(uuid4()),
                    resource_id=insight["resource_id"],
                    resource_type=ResourceType(insight["resource_type"]),
                    bottleneck_type=BottleneckType(insight["bottleneck_type"]),
                    severity=insight["severity"],
                    description=insight["description"],
                    metrics_affected=insight["metrics_affected"],
                    impact_score=insight["impact_score"],
                    root_cause_analysis=insight["root_cause"],
                    recommended_actions=insight["recommendations"],
                    detection_confidence=insight["confidence"],
                    detected_at=datetime.utcnow()
                )
                
                detected_bottlenecks.append(bottleneck)
                self.bottlenecks.append(bottleneck)
            
            # Update service metrics
            self.service_metrics['bottlenecks_detected'] += len(detected_bottlenecks)
            
            processing_time = time.time() - start_time
            
            logger.info(f"Bottleneck detection completed: {detection_id} - {len(detected_bottlenecks)} bottlenecks found")
            
            return {
                "detection_id": detection_id,
                "status": "completed",
                "scope": scope.value,
                "bottlenecks_detected": len(detected_bottlenecks),
                "bottlenecks": [
                    {
                        "bottleneck_id": b.bottleneck_id,
                        "resource_id": b.resource_id,
                        "resource_type": b.resource_type.value,
                        "bottleneck_type": b.bottleneck_type.value,
                        "severity": b.severity.value,
                        "description": b.description,
                        "impact_score": b.impact_score,
                        "confidence": b.detection_confidence,
                        "recommendations": b.recommended_actions
                    }
                    for b in detected_bottlenecks
                ],
                "analysis_summary": {
                    "anomalies_detected": len(anomalies),
                    "bottleneck_patterns": len(bottleneck_patterns),
                    "resources_analyzed": len(analysis_data),
                    "processing_time_seconds": processing_time
                }
            }
            
        except Exception as e:
            logger.error(f"Bottleneck detection failed: {e}")
            return {
                "detection_id": detection_id,
                "status": "failed",
                "error": str(e),
                "processing_time_seconds": time.time() - start_time
            }
    
    async def optimize_performance(
        self,
        resource_id: str,
        optimization_type: OptimizationType,
        target_metrics: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Apply AI-powered performance optimization
        
        Args:
            resource_id: Resource to optimize
            optimization_type: Type of optimization to apply
            target_metrics: Specific metrics to optimize
            
        Returns:
            Optimization results and recommendations
        """
        optimization_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Analyze current performance
            current_performance = await self._analyze_current_performance(resource_id, target_metrics)
            
            # Generate optimization strategy
            optimization_strategy = await self._generate_optimization_strategy(
                resource_id, optimization_type, current_performance
            )
            
            # Validate optimization strategy
            validation_result = await self._validate_optimization_strategy(
                resource_id, optimization_strategy
            )
            
            if not validation_result["valid"]:
                return {
                    "optimization_id": optimization_id,
                    "status": "validation_failed",
                    "error": validation_result["error"],
                    "resource_id": resource_id
                }
            
            # Apply optimization
            application_result = await self._apply_performance_optimization(
                resource_id, optimization_strategy
            )
            
            # Monitor optimization impact
            impact_analysis = await self._monitor_optimization_impact(
                resource_id, optimization_strategy, current_performance
            )
            
            # Create optimization record
            optimization_record = PerformanceOptimization(
                optimization_id=optimization_id,
                resource_id=resource_id,
                optimization_type=optimization_type,
                strategy_applied=optimization_strategy,
                baseline_metrics=current_performance,
                target_improvements=optimization_strategy.get("target_improvements", {}),
                actual_improvements=impact_analysis.get("improvements", {}),
                confidence_score=optimization_strategy.get("confidence", 0.0),
                applied_at=datetime.utcnow(),
                applied_by="system",
                status="applied" if application_result["success"] else "failed"
            )
            
            self.optimizations.append(optimization_record)
            
            # Update service metrics
            if application_result["success"]:
                self.service_metrics['optimizations_applied'] += 1
            
            processing_time = time.time() - start_time
            
            logger.info(f"Performance optimization completed: {optimization_id} for {resource_id}")
            
            return {
                "optimization_id": optimization_id,
                "status": "completed" if application_result["success"] else "failed",
                "resource_id": resource_id,
                "optimization_type": optimization_type.value,
                "strategy_applied": optimization_strategy,
                "baseline_metrics": current_performance,
                "predicted_improvements": optimization_strategy.get("target_improvements", {}),
                "actual_improvements": impact_analysis.get("improvements", {}),
                "confidence_score": optimization_strategy.get("confidence", 0.0),
                "application_details": application_result,
                "processing_time_seconds": processing_time
            }
            
        except Exception as e:
            logger.error(f"Performance optimization failed: {e}")
            return {
                "optimization_id": optimization_id,
                "status": "failed",
                "error": str(e),
                "resource_id": resource_id,
                "processing_time_seconds": time.time() - start_time
            }
    
    async def predict_performance(
        self,
        resource_id: str,
        prediction_horizon_hours: int = 24,
        metrics_to_predict: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Predict future performance using ML models
        
        Args:
            resource_id: Resource to predict performance for
            prediction_horizon_hours: Hours to predict into the future
            metrics_to_predict: Specific metrics to predict
            
        Returns:
            Performance predictions with confidence intervals
        """
        prediction_id = str(uuid4())
        
        try:
            # Gather historical data
            historical_data = await self._gather_historical_performance_data(
                resource_id, self.config.prediction_lookback_hours
            )
            
            if not historical_data:
                return {
                    "prediction_id": prediction_id,
                    "status": "insufficient_data",
                    "error": "Not enough historical data for prediction"
                }
            
            # Prepare features for prediction
            features, targets = await self._prepare_prediction_features(
                historical_data, metrics_to_predict
            )
            
            # Train/update prediction model
            await self._update_prediction_model(features, targets)
            
            # Generate predictions
            predictions = await self._generate_performance_predictions(
                resource_id, prediction_horizon_hours, features
            )
            
            # Calculate confidence intervals
            confidence_intervals = await self._calculate_prediction_confidence(
                predictions, historical_data
            )
            
            # Generate insights
            prediction_insights = await self._generate_prediction_insights(
                predictions, confidence_intervals, historical_data
            )
            
            return {
                "prediction_id": prediction_id,
                "status": "completed",
                "resource_id": resource_id,
                "prediction_horizon_hours": prediction_horizon_hours,
                "predictions": predictions,
                "confidence_intervals": confidence_intervals,
                "insights": prediction_insights,
                "model_accuracy": getattr(self.performance_predictor, 'score_', 0.0),
                "predicted_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Performance prediction failed: {e}")
            return {
                "prediction_id": prediction_id,
                "status": "failed",
                "error": str(e),
                "resource_id": resource_id
            }
    
    async def generate_performance_report(
        self,
        report_type: str,
        time_range: str,
        resource_filter: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive performance report
        
        Args:
            report_type: Type of report to generate
            time_range: Time range for the report
            resource_filter: Optional resource filter
            
        Returns:
            Generated performance report
        """
        report_id = str(uuid4())
        
        try:
            # Parse time range
            start_time, end_time = self._parse_time_range(time_range)
            
            # Gather report data
            report_data = await self._gather_report_data(
                report_type, start_time, end_time, resource_filter
            )
            
            # Generate report sections
            report_sections = {}
            
            if report_type in ["comprehensive", "summary"]:
                report_sections["executive_summary"] = await self._generate_executive_summary(report_data)
                report_sections["performance_overview"] = await self._generate_performance_overview(report_data)
                report_sections["trend_analysis"] = await self._generate_trend_analysis(report_data)
            
            if report_type in ["comprehensive", "bottlenecks"]:
                report_sections["bottleneck_analysis"] = await self._generate_bottleneck_report(report_data)
                
            if report_type in ["comprehensive", "optimizations"]:
                report_sections["optimization_analysis"] = await self._generate_optimization_report(report_data)
            
            if report_type in ["comprehensive", "predictions"]:
                report_sections["performance_predictions"] = await self._generate_prediction_report(report_data)
            
            # Create report record
            performance_report = PerformanceReport(
                report_id=report_id,
                report_type=report_type,
                time_range_start=start_time,
                time_range_end=end_time,
                resource_filter=resource_filter,
                report_data=report_sections,
                generated_at=datetime.utcnow(),
                generated_by="system"
            )
            
            self.performance_reports[report_id] = performance_report
            
            return {
                "report_id": report_id,
                "status": "generated",
                "report_type": report_type,
                "time_range": time_range,
                "sections": list(report_sections.keys()),
                "report_data": report_sections,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Performance report generation failed: {e}")
            return {
                "report_id": report_id,
                "status": "failed",
                "error": str(e)
            }
    
    # Utility methods
    def _map_metric_name_to_type(self, metric_name: str) -> PerformanceMetricType:
        """Map metric name to performance metric type"""
        name_lower = metric_name.lower()
        
        if "cpu" in name_lower:
            return PerformanceMetricType.CPU_USAGE
        elif "memory" in name_lower or "ram" in name_lower:
            return PerformanceMetricType.MEMORY_USAGE
        elif "disk" in name_lower or "storage" in name_lower:
            return PerformanceMetricType.DISK_IO
        elif "network" in name_lower or "bandwidth" in name_lower:
            return PerformanceMetricType.NETWORK_IO
        elif "time" in name_lower or "duration" in name_lower:
            return PerformanceMetricType.EXECUTION_TIME
        elif "queue" in name_lower:
            return PerformanceMetricType.QUEUE_LENGTH
        elif "throughput" in name_lower:
            return PerformanceMetricType.THROUGHPUT
        elif "error" in name_lower:
            return PerformanceMetricType.ERROR_RATE
        else:
            return PerformanceMetricType.CUSTOM
    
    def _get_metric_unit(self, metric_type: PerformanceMetricType) -> str:
        """Get unit for metric type"""
        unit_map = {
            PerformanceMetricType.CPU_USAGE: "%",
            PerformanceMetricType.MEMORY_USAGE: "MB",
            PerformanceMetricType.DISK_IO: "MB/s",
            PerformanceMetricType.NETWORK_IO: "Mbps",
            PerformanceMetricType.EXECUTION_TIME: "ms",
            PerformanceMetricType.QUEUE_LENGTH: "items",
            PerformanceMetricType.THROUGHPUT: "ops/sec",
            PerformanceMetricType.ERROR_RATE: "%",
            PerformanceMetricType.RESPONSE_TIME: "ms",
            PerformanceMetricType.CUSTOM: "units"
        }
        return unit_map.get(metric_type, "units")
    
    async def _calculate_metric_trends(
        self,
        metric: Dict[str, Any],
        resource_id: str,
        metric_name: str
    ):
        """Calculate metric trends and status"""
        
        # Get historical values
        history_key = f"{resource_id}_{metric_name}"
        history = list(self.metric_history[history_key])
        
        if len(history) >= 2:
            previous_value = history[-1]["value"]
            metric.previous_value = previous_value
            
            # Calculate change percentage
            if previous_value > 0:
                metric.change_percentage = ((metric.current_value - previous_value) / previous_value) * 100
            
            # Determine trend
            if metric.current_value > previous_value:
                metric.trend = TrendDirection.INCREASING
            elif metric.current_value < previous_value:
                metric.trend = TrendDirection.DECREASING
            else:
                metric.trend = TrendDirection.STABLE
        
        # Calculate statistics if enough history
        if len(history) >= 5:
            values = [h["value"] for h in history[-10:]]  # Last 10 values
            metric.min_value = min(values)
            metric.max_value = max(values)
            metric.average_value = sum(values) / len(values)
        
        # Determine status based on thresholds
        if metric.critical_threshold and metric.current_value >= metric.critical_threshold:
            metric.status = PerformanceStatus.CRITICAL
        elif metric.warning_threshold and metric.current_value >= metric.warning_threshold:
            metric.status = PerformanceStatus.WARNING
        else:
            metric.status = PerformanceStatus.NORMAL
    
    # Background task loops
    async def _performance_monitoring_loop(self):
        """Main performance monitoring loop"""
        while True:
            try:
                await asyncio.sleep(self.config.monitoring_interval)
                
                # Collect system metrics
                await self._collect_system_metrics()
                
                # Update resource utilization
                await self._update_resource_utilization()
                
                # Check system health
                await self._check_system_health()
                
            except Exception as e:
                logger.error(f"Performance monitoring loop error: {e}")
    
    async def _bottleneck_detection_loop(self):
        """Bottleneck detection loop"""
        while True:
            try:
                await asyncio.sleep(120)  # Run every 2 minutes
                
                # Run automated bottleneck detection
                await self.detect_bottlenecks(MonitoringScope.SYSTEM)
                
            except Exception as e:
                logger.error(f"Bottleneck detection loop error: {e}")
    
    async def _optimization_loop(self):
        """Performance optimization loop"""
        while True:
            try:
                await asyncio.sleep(self.config.optimization_frequency)
                
                if self.config.auto_optimization_enabled:
                    # Identify optimization opportunities
                    await self._identify_optimization_opportunities()
                    
                    # Apply automatic optimizations
                    await self._apply_automatic_optimizations()
                
            except Exception as e:
                logger.error(f"Optimization loop error: {e}")
    
    async def _analytics_loop(self):
        """Performance analytics and reporting loop"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                
                # Update performance analytics
                await self._update_performance_analytics()
                
                # Generate trend analysis
                await self._update_trend_analysis()
                
            except Exception as e:
                logger.error(f"Analytics loop error: {e}")
    
    async def get_performance_insights(self) -> Dict[str, Any]:
        """Get comprehensive performance service insights"""
        
        return {
            "service_metrics": self.service_metrics.copy(),
            "active_monitors": len(self.active_monitors),
            "performance_metrics_count": len(self.performance_metrics),
            "bottlenecks_detected": len(self.bottlenecks),
            "optimizations_applied": len(self.optimizations),
            "reports_generated": len(self.performance_reports),
            "system_health": self.system_health.copy(),
            "resource_utilization": self.resource_utilization.copy(),
            "configuration": {
                "monitoring_interval": self.config.monitoring_interval,
                "auto_optimization_enabled": self.config.auto_optimization_enabled,
                "alert_thresholds": {k.value: v for k, v in self.config.alert_thresholds.items()},
                "optimization_frequency": self.config.optimization_frequency
            },
            "model_status": {
                "anomaly_detector": self.anomaly_detector is not None,
                "performance_predictor": self.performance_predictor is not None,
                "bottleneck_clusterer": self.bottleneck_clusterer is not None
            }
        }