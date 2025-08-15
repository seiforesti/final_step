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
try:
    from ..core.settings import get_settings as _get_settings
    def get_settings():
        return _get_settings()
except Exception:
    from ..core.config import settings as _settings
    def get_settings():
        return _settings
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
        self.settings = get_settings()
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
        
        # Bottleneck analysis data cache
        self.bottleneck_data_cache = {}
        self.analysis_data_history = deque(maxlen=1000)
        
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
        
        # Background tasks deferred until an event loop is active
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._performance_monitoring_loop())
            loop.create_task(self._bottleneck_detection_loop())
            loop.create_task(self._optimization_loop())
            loop.create_task(self._analytics_loop())
        except RuntimeError:
            pass

    def start(self) -> None:
        """Start background tasks when an event loop exists."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._performance_monitoring_loop())
            loop.create_task(self._bottleneck_detection_loop())
            loop.create_task(self._optimization_loop())
            loop.create_task(self._analytics_loop())
        except RuntimeError:
            pass
    
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
            self.bottleneck_classifier = DBSCAN(
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
    
    # Performance monitoring support methods
    async def _collect_system_metrics(self):
        """Collect comprehensive system performance metrics"""
        try:
            # Collect CPU metrics
            cpu_metrics = await self._collect_cpu_metrics()
            self.performance_metrics["cpu"] = cpu_metrics
            
            # Collect memory metrics
            memory_metrics = await self._collect_memory_metrics()
            self.performance_metrics["memory"] = memory_metrics
            
            # Collect disk metrics
            disk_metrics = await self._collect_disk_metrics()
            self.performance_metrics["disk"] = disk_metrics
            
            # Collect network metrics
            network_metrics = await self._collect_network_metrics()
            self.performance_metrics["network"] = network_metrics
            
            # Collect scan execution metrics
            execution_metrics = await self._collect_execution_metrics()
            self.performance_metrics["execution"] = execution_metrics
            
            # Store in history
            timestamp = datetime.utcnow().isoformat()
            for metric_type, metric_data in self.performance_metrics.items():
                if metric_type not in self.metric_history:
                    self.metric_history[metric_type] = deque(maxlen=1000)
                self.metric_history[metric_type].append({
                    "timestamp": timestamp,
                    "data": metric_data
                })
            
            logger.debug("Collected system performance metrics")
            
        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")
    
    async def _collect_cpu_metrics(self) -> Dict[str, Any]:
        """Collect CPU performance metrics"""
        try:
            # Simulate CPU metrics collection (in real implementation, use psutil or system APIs)
            import random
            current_usage = random.uniform(20.0, 80.0)
            load_average = random.uniform(0.5, 2.5)
            context_switches = random.randint(1000, 10000)
            
            return {
                "current_usage": round(current_usage, 2),
                "load_average": round(load_average, 2),
                "context_switches": context_switches,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error collecting CPU metrics: {e}")
            return {"error": str(e)}
    
    async def _collect_memory_metrics(self) -> Dict[str, Any]:
        """Collect memory performance metrics"""
        try:
            # Simulate memory metrics collection
            import random
            total_memory = 16384  # 16GB
            used_memory = random.uniform(8000, 14000)
            available_memory = total_memory - used_memory
            memory_usage_percent = (used_memory / total_memory) * 100
            
            return {
                "total_mb": total_memory,
                "used_mb": round(used_memory, 2),
                "available_mb": round(available_memory, 2),
                "usage_percent": round(memory_usage_percent, 2),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error collecting memory metrics: {e}")
            return {"error": str(e)}
    
    async def _collect_disk_metrics(self) -> Dict[str, Any]:
        """Collect disk performance metrics"""
        try:
            # Simulate disk metrics collection
            import random
            read_bytes = random.randint(1000000, 10000000)
            write_bytes = random.randint(500000, 5000000)
            read_ops = random.randint(100, 1000)
            write_ops = random.randint(50, 500)
            
            return {
                "read_bytes": read_bytes,
                "write_bytes": write_bytes,
                "read_operations": read_ops,
                "write_operations": write_ops,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error collecting disk metrics: {e}")
            return {"error": str(e)}
    
    async def _collect_network_metrics(self) -> Dict[str, Any]:
        """Collect network performance metrics"""
        try:
            # Simulate network metrics collection
            import random
            bytes_sent = random.randint(1000000, 10000000)
            bytes_recv = random.randint(1000000, 10000000)
            packets_sent = random.randint(1000, 10000)
            packets_recv = random.randint(1000, 10000)
            
            return {
                "bytes_sent": bytes_sent,
                "bytes_recv": bytes_recv,
                "packets_sent": packets_sent,
                "packets_recv": packets_recv,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error collecting network metrics: {e}")
            return {"error": str(e)}
    
    async def _collect_execution_metrics(self) -> Dict[str, Any]:
        """Collect scan execution performance metrics"""
        try:
            # Simulate execution metrics collection
            import random
            active_scans = random.randint(5, 25)
            queued_scans = random.randint(0, 50)
            avg_execution_time = random.uniform(60, 300)
            success_rate = random.uniform(0.85, 0.98)
            
            return {
                "active_scans": active_scans,
                "queued_scans": queued_scans,
                "avg_execution_time_seconds": round(avg_execution_time, 2),
                "success_rate": round(success_rate, 4),
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error collecting execution metrics: {e}")
            return {"error": str(e)}
    
    async def _update_resource_utilization(self):
        """Update resource utilization metrics"""
        try:
            # Calculate current resource utilization
            cpu_usage = self.performance_metrics.get("cpu", {}).get("current_usage", 0)
            memory_usage = self.performance_metrics.get("memory", {}).get("usage_percent", 0)
            
            # Update resource utilization
            self.resource_utilization = {
                "cpu": {
                    "current": cpu_usage,
                    "status": "normal" if cpu_usage < 80 else "high" if cpu_usage < 90 else "critical"
                },
                "memory": {
                    "current": memory_usage,
                    "status": "normal" if memory_usage < 75 else "high" if memory_usage < 85 else "critical"
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error updating resource utilization: {e}")
    
    async def _check_system_health(self):
        """Check overall system health status"""
        try:
            # Check resource thresholds
            cpu_status = self.resource_utilization.get("cpu", {}).get("status", "normal")
            memory_status = self.resource_utilization.get("memory", {}).get("status", "normal")
            
            # Determine overall health
            if cpu_status == "critical" or memory_status == "critical":
                overall_health = "critical"
            elif cpu_status == "high" or memory_status == "high":
                overall_health = "warning"
            else:
                overall_health = "healthy"
            
            # Update system health
            self.system_health = {
                "overall_status": overall_health,
                "cpu_status": cpu_status,
                "memory_status": memory_status,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking system health: {e}")
    
    async def _identify_optimization_opportunities(self):
        """Identify performance optimization opportunities"""
        try:
            # Analyze current performance metrics
            cpu_usage = self.performance_metrics.get("cpu", {}).get("current_usage", 0)
            memory_usage = self.performance_metrics.get("memory", {}).get("usage_percent", 0)
            
            opportunities = []
            
            # CPU optimization opportunities
            if cpu_usage > 80:
                opportunities.append({
                    "type": "cpu_optimization",
                    "priority": "high" if cpu_usage > 90 else "medium",
                    "description": f"High CPU usage detected: {cpu_usage}%",
                    "recommendation": "Consider reducing concurrent scans or optimizing scan algorithms"
                })
            
            # Memory optimization opportunities
            if memory_usage > 75:
                opportunities.append({
                    "type": "memory_optimization",
                    "priority": "high" if memory_usage > 85 else "medium",
                    "description": f"High memory usage detected: {memory_usage}%",
                    "recommendation": "Consider memory cleanup or reducing scan batch sizes"
                })
            
            # Store opportunities
            for opportunity in opportunities:
                self.optimizations.append({
                    "id": str(uuid4()),
                    "opportunity": opportunity,
                    "identified_at": datetime.utcnow().isoformat(),
                    "status": "identified"
                })
            
            logger.info(f"Identified {len(opportunities)} optimization opportunities")
            
        except Exception as e:
            logger.error(f"Error identifying optimization opportunities: {e}")
    
    async def _apply_automatic_optimizations(self):
        """Apply automatic performance optimizations"""
        try:
            # Get identified optimizations
            pending_optimizations = [opt for opt in self.optimizations if opt.get("status") == "identified"]
            
            for optimization in pending_optimizations[:self.config.max_concurrent_optimizations]:
                try:
                    # Apply optimization based on type
                    opportunity = optimization["opportunity"]
                    optimization_type = opportunity["type"]
                    
                    if optimization_type == "cpu_optimization":
                        await self._apply_cpu_optimization(optimization)
                    elif optimization_type == "memory_optimization":
                        await self._apply_memory_optimization(optimization)
                    
                    # Mark as applied
                    optimization["status"] = "applied"
                    optimization["applied_at"] = datetime.utcnow().isoformat()
                    
                except Exception as e:
                    optimization["status"] = "failed"
                    optimization["error"] = str(e)
                    logger.error(f"Failed to apply optimization {optimization['id']}: {e}")
            
        except Exception as e:
            logger.error(f"Error applying automatic optimizations: {e}")
    
    async def _apply_cpu_optimization(self, optimization: Dict[str, Any]):
        """Apply CPU-specific optimization"""
        try:
            # Reduce concurrent scans temporarily
            # In real implementation, this would adjust system configuration
            logger.info(f"Applied CPU optimization: {optimization['opportunity']['description']}")
            
        except Exception as e:
            logger.error(f"Error applying CPU optimization: {e}")
    
    async def _apply_memory_optimization(self, optimization: Dict[str, Any]):
        """Apply memory-specific optimization"""
        try:
            # Trigger memory cleanup
            # In real implementation, this would clear caches and old data
            logger.info(f"Applied memory optimization: {optimization['opportunity']['description']}")
            
        except Exception as e:
            logger.error(f"Error applying memory optimization: {e}")
    
    async def _update_performance_analytics(self):
        """Update performance analytics and insights"""
        try:
            # Update service metrics
            self.service_metrics["total_metrics_collected"] += 1
            self.service_metrics["last_analytics_update"] = datetime.utcnow().isoformat()
            
            logger.debug("Updated performance analytics")
            
        except Exception as e:
            logger.error(f"Error updating performance analytics: {e}")
    
    async def _update_trend_analysis(self):
        """Update performance trend analysis"""
        try:
            # Update trend analysis
            self.service_metrics["last_trend_analysis"] = datetime.utcnow().isoformat()
            
            logger.debug("Updated trend analysis")
            
        except Exception as e:
            logger.error(f"Error updating trend analysis: {e}")
    
    async def _gather_bottleneck_analysis_data(
        self, 
        scope: MonitoringScope, 
        resource_filter: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Gather comprehensive performance data for bottleneck analysis
        
        Args:
            scope: Monitoring scope (system, scan, rule, etc.)
            resource_filter: Optional filter for specific resources
            
        Returns:
            Dictionary containing performance data for analysis
        """
        try:
            analysis_data = {}
            
            # Get current system metrics
            system_metrics = await self._collect_system_metrics()
            analysis_data['system'] = system_metrics
            
            # Get resource utilization data
            resource_data = await self._collect_resource_utilization_data(scope, resource_filter)
            analysis_data['resources'] = resource_data
            
            # Get performance history for trend analysis
            history_data = await self._collect_performance_history(scope)
            analysis_data['history'] = history_data
            
            # Get active scan performance data
            scan_data = await self._collect_scan_performance_data(scope)
            analysis_data['scans'] = scan_data
            
            # Get rule execution performance data
            rule_data = await self._collect_rule_performance_data(scope)
            analysis_data['rules'] = rule_data
            
            # Get queue and workflow performance data
            queue_data = await self._collect_queue_performance_data(scope)
            analysis_data['queues'] = queue_data
            
            # Get network and I/O performance data
            io_data = await self._collect_io_performance_data(scope)
            analysis_data['io'] = io_data
            
            # Cache the analysis data
            cache_key = f"bottleneck_analysis_{scope.value}_{int(time.time())}"
            self.bottleneck_data_cache[cache_key] = analysis_data
            
            # Store in history
            self.analysis_data_history.append({
                'timestamp': datetime.utcnow(),
                'scope': scope.value,
                'data': analysis_data
            })
            
            logger.debug(f"Gathered bottleneck analysis data for scope: {scope.value}")
            return analysis_data
            
        except Exception as e:
            logger.error(f"Error gathering bottleneck analysis data: {e}")
            return {}
    
    async def _collect_resource_utilization_data(
        self, 
        scope: MonitoringScope, 
        resource_filter: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Collect resource utilization data for analysis"""
        try:
            resource_data = {}
            
            # CPU utilization
            cpu_data = await self._collect_cpu_metrics()
            resource_data['cpu'] = cpu_data
            
            # Memory utilization
            memory_data = await self._collect_memory_metrics()
            resource_data['memory'] = memory_data
            
            # Disk utilization
            disk_data = await self._collect_disk_metrics()
            resource_data['disk'] = disk_data
            
            # Network utilization
            network_data = await self._collect_network_metrics()
            resource_data['network'] = network_data
            
            # Apply resource filter if specified
            if resource_filter:
                filtered_data = {}
                for resource_type, data in resource_data.items():
                    if resource_type in resource_filter.get('include_types', []):
                        filtered_data[resource_type] = data
                resource_data = filtered_data
            
            return resource_data
            
        except Exception as e:
            logger.error(f"Error collecting resource utilization data: {e}")
            return {}
    
    async def _collect_performance_history(
        self, 
        scope: MonitoringScope
    ) -> Dict[str, Any]:
        """Collect performance history data for trend analysis"""
        try:
            history_data = {}
            
            # Get recent performance metrics
            recent_metrics = list(self.metric_history.values())
            if recent_metrics:
                history_data['recent'] = recent_metrics[-100:]  # Last 100 entries
            
            # Get historical bottlenecks
            history_data['bottlenecks'] = list(self.bottlenecks)[-50:]  # Last 50 bottlenecks
            
            # Get historical optimizations
            history_data['optimizations'] = list(self.optimizations)[-50:]  # Last 50 optimizations
            
            # Get performance trends
            trends = await self._calculate_performance_trends(scope)
            history_data['trends'] = trends
            
            return history_data
            
        except Exception as e:
            logger.error(f"Error collecting performance history: {e}")
            return {}
    
    async def _collect_scan_performance_data(
        self, 
        scope: MonitoringScope
    ) -> Dict[str, Any]:
        """Collect scan performance data for analysis"""
        try:
            scan_data = {}
            
            # Get active scan metrics
            active_scans = self.active_monitors.get('scans', {})
            scan_data['active'] = active_scans
            
            # Get scan performance history
            scan_history = self.metric_history.get('scan_performance', [])
            scan_data['history'] = scan_history[-100:] if scan_history else []
            
            # Get scan queue metrics
            scan_queue = self.metric_history.get('scan_queue', [])
            scan_data['queue'] = scan_queue[-50:] if scan_queue else []
            
            return scan_data
            
        except Exception as e:
            logger.error(f"Error collecting scan performance data: {e}")
            return {}
    
    async def _collect_rule_performance_data(
        self, 
        scope: MonitoringScope
    ) -> Dict[str, Any]:
        """Collect rule execution performance data for analysis"""
        try:
            rule_data = {}
            
            # Get rule execution metrics
            rule_metrics = self.metric_history.get('rule_execution', [])
            rule_data['execution'] = rule_metrics[-100:] if rule_metrics else []
            
            # Get rule optimization history
            rule_optimizations = self.metric_history.get('rule_optimizations', [])
            rule_data['optimizations'] = rule_optimizations[-50:] if rule_optimizations else []
            
            return rule_data
            
        except Exception as e:
            logger.error(f"Error collecting rule performance data: {e}")
            return {}
    
    async def _collect_queue_performance_data(
        self, 
        scope: MonitoringScope
    ) -> Dict[str, Any]:
        """Collect queue and workflow performance data for analysis"""
        try:
            queue_data = {}
            
            # Get queue length metrics
            queue_lengths = self.metric_history.get('queue_lengths', [])
            queue_data['lengths'] = queue_lengths[-100:] if queue_lengths else []
            
            # Get workflow performance metrics
            workflow_metrics = self.metric_history.get('workflow_performance', [])
            queue_data['workflows'] = workflow_metrics[-100:] if workflow_metrics else []
            
            return queue_data
            
        except Exception as e:
            logger.error(f"Error collecting queue performance data: {e}")
            return {}
    
    async def _collect_io_performance_data(
        self, 
        scope: MonitoringScope
    ) -> Dict[str, Any]:
        """Collect I/O and network performance data for analysis"""
        try:
            io_data = {}
            
            # Get disk I/O metrics
            disk_io = self.metric_history.get('disk_io', [])
            io_data['disk'] = disk_io[-100:] if disk_io else []
            
            # Get network I/O metrics
            network_io = self.metric_history.get('network_io', [])
            io_data['network'] = network_io[-100:] if network_io else []
            
            return io_data
            
        except Exception as e:
            logger.error(f"Error collecting I/O performance data: {e}")
            return {}
    
    async def _calculate_performance_trends(
        self, 
        scope: MonitoringScope
    ) -> Dict[str, Any]:
        """Calculate performance trends for historical analysis"""
        try:
            trends = {}
            
            # Calculate CPU trend
            cpu_history = self.metric_history.get('cpu_usage', [])
            if len(cpu_history) > 10:
                trends['cpu'] = self._calculate_trend_direction(cpu_history[-10:])
            
            # Calculate memory trend
            memory_history = self.metric_history.get('memory_usage', [])
            if len(memory_history) > 10:
                trends['memory'] = self._calculate_trend_direction(memory_history[-10:])
            
            # Calculate execution time trend
            execution_history = self.metric_history.get('execution_time', [])
            if len(execution_history) > 10:
                trends['execution'] = self._calculate_trend_direction(execution_history[-10:])
            
            return trends
            
        except Exception as e:
            logger.error(f"Error calculating performance trends: {e}")
            return {}
    
    async def _calculate_trend_direction(self, values: List[float]) -> str:
        """Calculate trend direction from a list of values"""
        try:
            if len(values) < 2:
                return "stable"
            
            # Simple linear trend calculation
            x = list(range(len(values)))
            y = values
            
            # Calculate slope
            n = len(x)
            sum_x = sum(x)
            sum_y = sum(y)
            sum_xy = sum(x[i] * y[i] for i in range(n))
            sum_x2 = sum(x[i] ** 2 for i in range(n))
            
            if n * sum_x2 - sum_x ** 2 == 0:
                return "stable"
            
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
            
            if slope > 0.1:
                return "increasing"
            elif slope < -0.1:
                return "decreasing"
            else:
                return "stable"
                
        except Exception as e:
            logger.error(f"Error calculating trend direction: {e}")
            return "stable"
    
    async def _prepare_bottleneck_features(self, analysis_data: Dict[str, Any]) -> np.ndarray:
        """
        Prepare features for bottleneck detection ML analysis
        
        Args:
            analysis_data: Raw performance data for analysis
            
        Returns:
            Feature matrix for ML analysis
        """
        try:
            features = []
            
            # Extract resource utilization features
            for resource_id, resource_data in analysis_data.get("resource_utilization", {}).items():
                resource_features = []
                
                # CPU utilization features
                if "cpu_usage" in resource_data:
                    cpu_data = resource_data["cpu_usage"]
                    resource_features.extend([
                        np.mean(cpu_data) if cpu_data else 0.0,
                        np.std(cpu_data) if cpu_data else 0.0,
                        np.max(cpu_data) if cpu_data else 0.0,
                        np.min(cpu_data) if cpu_data else 0.0
                    ])
                else:
                    resource_features.extend([0.0, 0.0, 0.0, 0.0])
                
                # Memory utilization features
                if "memory_usage" in resource_data:
                    mem_data = resource_data["memory_usage"]
                    resource_features.extend([
                        np.mean(mem_data) if mem_data else 0.0,
                        np.std(mem_data) if mem_data else 0.0,
                        np.max(mem_data) if mem_data else 0.0,
                        np.min(mem_data) if mem_data else 0.0
                    ])
                else:
                    resource_features.extend([0.0, 0.0, 0.0, 0.0])
                
                # Disk I/O features
                if "disk_io" in resource_data:
                    disk_data = resource_data["disk_io"]
                    resource_features.extend([
                        np.mean(disk_data) if disk_data else 0.0,
                        np.std(disk_data) if disk_data else 0.0,
                        np.max(disk_data) if disk_data else 0.0,
                        np.min(disk_data) if disk_data else 0.0
                    ])
                else:
                    resource_features.extend([0.0, 0.0, 0.0, 0.0])
                
                # Network I/O features
                if "network_io" in resource_data:
                    net_data = resource_data["network_io"]
                    resource_features.extend([
                        np.mean(net_data) if net_data else 0.0,
                        np.std(net_data) if net_data else 0.0,
                        np.max(net_data) if net_data else 0.0,
                        np.min(net_data) if net_data else 0.0
                    ])
                else:
                    resource_features.extend([0.0, 0.0, 0.0, 0.0])
                
                # Execution time features
                if "execution_time" in resource_data:
                    exec_data = resource_data["execution_time"]
                    resource_features.extend([
                        np.mean(exec_data) if exec_data else 0.0,
                        np.std(exec_data) if exec_data else 0.0,
                        np.max(exec_data) if exec_data else 0.0,
                        np.min(exec_data) if exec_data else 0.0
                    ])
                else:
                    resource_features.extend([0.0, 0.0, 0.0, 0.0])
                
                # Queue length features
                if "queue_length" in resource_data:
                    queue_data = resource_data["queue_length"]
                    resource_features.extend([
                        np.mean(queue_data) if queue_data else 0.0,
                        np.std(queue_data) if queue_data else 0.0,
                        np.max(queue_data) if queue_data else 0.0,
                        np.min(queue_data) if queue_data else 0.0
                    ])
                else:
                    resource_features.extend([0.0, 0.0, 0.0, 0.0])
                
                # Add resource type encoding
                resource_type = resource_data.get("resource_type", "unknown")
                type_encoding = {
                    "cpu": [1, 0, 0, 0, 0],
                    "memory": [0, 1, 0, 0, 0],
                    "disk": [0, 0, 1, 0, 0],
                    "network": [0, 0, 0, 1, 0],
                    "database": [0, 0, 0, 0, 1]
                }
                resource_features.extend(type_encoding.get(resource_type, [0, 0, 0, 0, 0]))
                
                features.append(resource_features)
            
            # Convert to numpy array and normalize
            if features:
                feature_matrix = np.array(features)
                
                # Handle NaN values
                feature_matrix = np.nan_to_num(feature_matrix, nan=0.0)
                
                # Basic normalization
                feature_matrix = (feature_matrix - np.mean(feature_matrix, axis=0)) / (np.std(feature_matrix, axis=0) + 1e-8)
                
                return feature_matrix
            else:
                # Return empty feature matrix if no data
                return np.array([])
                
        except Exception as e:
            logger.error(f"Error preparing bottleneck features: {e}")
            return np.array([])
    
    async def _detect_performance_anomalies(self, features: np.ndarray, analysis_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Detect performance anomalies using ML models
        
        Args:
            features: Feature matrix for analysis
            analysis_data: Raw performance data
            
        Returns:
            List of detected anomalies
        """
        try:
            if features.size == 0:
                return []
            
            anomalies = []
            
            # Initialize anomaly detector if not exists
            if self.anomaly_detector is None:
                self.anomaly_detector = IsolationForest(
                    contamination=self.config.anomaly_detection_contamination,
                    random_state=42
                )
                # Fit the model with available data
                if features.shape[0] > 1:
                    self.anomaly_detector.fit(features)
            
            # Detect anomalies
            if hasattr(self.anomaly_detector, 'predict'):
                anomaly_labels = self.anomaly_detector.predict(features)
                anomaly_scores = self.anomaly_detector.decision_function(features)
                
                # Find anomalous samples (label = -1)
                for i, (label, score) in enumerate(zip(anomaly_labels, anomaly_scores)):
                    if label == -1:  # Anomaly detected
                        resource_id = list(analysis_data.get("resource_utilization", {}).keys())[i] if i < len(analysis_data.get("resource_utilization", {})) else f"resource_{i}"
                        
                        anomaly = {
                            "resource_id": resource_id,
                            "anomaly_score": float(score),
                            "severity": "high" if abs(score) > 0.5 else "medium",
                            "detected_at": datetime.utcnow(),
                            "features": features[i].tolist() if i < features.shape[0] else [],
                            "description": f"Performance anomaly detected for {resource_id} with score {score:.3f}"
                        }
                        anomalies.append(anomaly)
            
            logger.info(f"Detected {len(anomalies)} performance anomalies")
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting performance anomalies: {e}")
            return []
    
    async def _cluster_bottleneck_patterns(self, features: np.ndarray, analysis_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Cluster bottleneck patterns using ML clustering algorithms
        
        Args:
            features: Feature matrix for analysis
            analysis_data: Raw performance data
            
        Returns:
            List of bottleneck pattern clusters
        """
        try:
            if features.size == 0:
                return []
            
            patterns = []
            
            # Initialize bottleneck clusterer if not exists
            if self.bottleneck_classifier is None:
                self.bottleneck_classifier = DBSCAN(
                    eps=self.config.clustering_eps,
                    min_samples=self.config.clustering_min_samples
                )
                # Fit the model with available data
                if features.shape[0] > 1:
                    self.bottleneck_classifier.fit(features)
            
            # Cluster bottleneck patterns
            if hasattr(self.bottleneck_classifier, 'fit_predict'):
                cluster_labels = self.bottleneck_classifier.fit_predict(features)
                
                # Group features by cluster
                unique_clusters = set(cluster_labels)
                for cluster_id in unique_clusters:
                    if cluster_id == -1:  # Noise points
                        continue
                        
                    # Get features for this cluster
                    cluster_indices = np.where(cluster_labels == cluster_id)[0]
                    cluster_features = features[cluster_indices]
                    
                    # Calculate cluster statistics
                    cluster_center = np.mean(cluster_features, axis=0)
                    cluster_size = len(cluster_indices)
                    
                    # Get resource IDs for this cluster
                    resource_ids = []
                    for idx in cluster_indices:
                        if idx < len(analysis_data.get("resource_utilization", {})):
                            resource_id = list(analysis_data.get("resource_utilization", {}).keys())[idx]
                            resource_ids.append(resource_id)
                    
                    pattern = {
                        "cluster_id": int(cluster_id),
                        "cluster_size": cluster_size,
                        "cluster_center": cluster_center.tolist(),
                        "resource_ids": resource_ids,
                        "pattern_type": "bottleneck_cluster",
                        "confidence_score": min(cluster_size / 10.0, 1.0),  # Higher confidence for larger clusters
                        "detected_at": datetime.utcnow(),
                        "description": f"Bottleneck pattern cluster {cluster_id} with {cluster_size} resources"
                    }
                    patterns.append(pattern)
            
            logger.info(f"Identified {len(patterns)} bottleneck pattern clusters")
            return patterns
            
        except Exception as e:
            logger.error(f"Error clustering bottleneck patterns: {e}")
            return []
    
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
                "bottleneck_clusterer": self.bottleneck_classifier is not None
            }
        }