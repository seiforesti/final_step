"""
Model Performance Service
========================

Enterprise model performance service for tracking, analyzing, and
optimizing machine learning model performance across the data governance system.

This service provides:
- Model performance metrics tracking
- Performance trend analysis
- Model comparison and benchmarking
- Performance alerting and monitoring
- Model optimization recommendations
- Performance reporting and visualization
- A/B testing support
- Model lifecycle management
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import statistics

logger = logging.getLogger(__name__)


class ModelPerformanceService:
    """Enterprise model performance service"""
    
    def __init__(self):
        self.performance_data = {}  # In-memory performance storage
        self.model_configs = self._load_model_configs()
        self.performance_thresholds = self._load_performance_thresholds()
    
    def _load_model_configs(self) -> Dict[str, Dict[str, Any]]:
        """Load model configurations"""
        return {
            "sensitivity_classifier": {
                "model_type": "classification",
                "target_metric": "f1_score",
                "min_threshold": 0.8,
                "version": "1.0"
            },
            "compliance_detector": {
                "model_type": "classification",
                "target_metric": "precision",
                "min_threshold": 0.9,
                "version": "1.0"
            },
            "anomaly_detector": {
                "model_type": "anomaly_detection",
                "target_metric": "auc",
                "min_threshold": 0.85,
                "version": "1.0"
            },
            "data_quality_assessor": {
                "model_type": "regression",
                "target_metric": "r2_score",
                "min_threshold": 0.7,
                "version": "1.0"
            }
        }
    
    def _load_performance_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Load performance thresholds for different metrics"""
        return {
            "accuracy": {"warning": 0.8, "critical": 0.7},
            "precision": {"warning": 0.8, "critical": 0.7},
            "recall": {"warning": 0.8, "critical": 0.7},
            "f1_score": {"warning": 0.8, "critical": 0.7},
            "auc": {"warning": 0.85, "critical": 0.75},
            "r2_score": {"warning": 0.7, "critical": 0.6}
        }
    
    async def record_model_performance(
        self,
        model_name: str,
        metrics: Dict[str, float],
        dataset_info: Optional[Dict[str, Any]] = None,
        training_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Record model performance metrics"""
        try:
            # Validate model name
            if model_name not in self.model_configs:
                return {"success": False, "error": f"Unknown model: {model_name}"}
            
            # Create performance record
            performance_record = {
                "model_name": model_name,
                "timestamp": datetime.utcnow().isoformat(),
                "metrics": metrics,
                "dataset_info": dataset_info or {},
                "training_info": training_info or {},
                "model_version": self.model_configs[model_name]["version"]
            }
            
            # Initialize model performance data if not exists
            if model_name not in self.performance_data:
                self.performance_data[model_name] = []
            
            # Add performance record
            self.performance_data[model_name].append(performance_record)
            
            # Check for performance alerts
            alerts = self._check_performance_alerts(model_name, metrics)
            
            logger.info(f"Model performance recorded: {model_name} - {metrics}")
            return {
                "success": True,
                "performance_id": len(self.performance_data[model_name]),
                "alerts": alerts
            }
            
        except Exception as e:
            logger.error(f"Error recording model performance: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_model_performance_metrics(
        self,
        model_name: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get model performance metrics"""
        try:
            if model_name:
                models_to_analyze = [model_name]
            else:
                models_to_analyze = list(self.model_configs.keys())
            
            results = {}
            
            for model in models_to_analyze:
                if model not in self.performance_data:
                    results[model] = {"error": "No performance data available"}
                    continue
                
                # Filter by date range
                filtered_data = self._filter_performance_data(
                    self.performance_data[model],
                    start_date,
                    end_date
                )
                
                if not filtered_data:
                    results[model] = {"error": "No data in specified date range"}
                    continue
                
                # Calculate aggregated metrics
                aggregated_metrics = self._calculate_aggregated_metrics(filtered_data)
                
                # Get performance trends
                trends = self._calculate_performance_trends(filtered_data)
                
                # Get latest performance
                latest_performance = filtered_data[-1] if filtered_data else None
                
                results[model] = {
                    "aggregated_metrics": aggregated_metrics,
                    "performance_trends": trends,
                    "latest_performance": latest_performance,
                    "data_points": len(filtered_data)
                }
            
            return {
                "success": True,
                "models": results,
                "total_models": len(models_to_analyze)
            }
            
        except Exception as e:
            logger.error(f"Error getting model performance metrics: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_performance_comparison(
        self,
        model_names: List[str],
        metric: str = "f1_score",
        time_range: Optional[Dict[str, datetime]] = None
    ) -> Dict[str, Any]:
        """Compare performance between models"""
        try:
            comparison_data = {}
            
            for model_name in model_names:
                if model_name not in self.performance_data:
                    comparison_data[model_name] = {"error": "No data available"}
                    continue
                
                # Filter data by time range
                filtered_data = self._filter_performance_data(
                    self.performance_data[model_name],
                    time_range.get("start") if time_range else None,
                    time_range.get("end") if time_range else None
                )
                
                if not filtered_data:
                    comparison_data[model_name] = {"error": "No data in time range"}
                    continue
                
                # Extract metric values
                metric_values = [
                    record["metrics"].get(metric, 0.0)
                    for record in filtered_data
                    if metric in record["metrics"]
                ]
                
                if not metric_values:
                    comparison_data[model_name] = {"error": f"Metric {metric} not available"}
                    continue
                
                # Calculate statistics
                comparison_data[model_name] = {
                    "mean": statistics.mean(metric_values),
                    "median": statistics.median(metric_values),
                    "std": statistics.stdev(metric_values) if len(metric_values) > 1 else 0,
                    "min": min(metric_values),
                    "max": max(metric_values),
                    "count": len(metric_values),
                    "latest": metric_values[-1] if metric_values else 0
                }
            
            return {
                "success": True,
                "comparison_metric": metric,
                "models": comparison_data,
                "time_range": time_range
            }
            
        except Exception as e:
            logger.error(f"Error comparing model performance: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_performance_recommendations(
        self,
        model_name: str
    ) -> Dict[str, Any]:
        """Get performance optimization recommendations"""
        try:
            if model_name not in self.performance_data:
                return {"success": False, "error": f"No performance data for model: {model_name}"}
            
            model_config = self.model_configs.get(model_name, {})
            target_metric = model_config.get("target_metric", "f1_score")
            min_threshold = model_config.get("min_threshold", 0.8)
            
            # Get recent performance
            recent_data = self.performance_data[model_name][-10:]  # Last 10 records
            if not recent_data:
                return {"success": False, "error": "No recent performance data"}
            
            # Calculate average performance
            metric_values = [
                record["metrics"].get(target_metric, 0.0)
                for record in recent_data
                if target_metric in record["metrics"]
            ]
            
            if not metric_values:
                return {"success": False, "error": f"Target metric {target_metric} not available"}
            
            avg_performance = statistics.mean(metric_values)
            
            # Generate recommendations
            recommendations = []
            
            if avg_performance < min_threshold:
                recommendations.append({
                    "type": "critical",
                    "title": "Performance below threshold",
                    "description": f"Average {target_metric} ({avg_performance:.3f}) is below minimum threshold ({min_threshold})",
                    "action": "Consider retraining model with more data or hyperparameter tuning"
                })
            
            # Check for performance degradation
            if len(metric_values) >= 2:
                recent_avg = statistics.mean(metric_values[-5:])  # Last 5 records
                older_avg = statistics.mean(metric_values[:-5])  # Previous 5 records
                
                if recent_avg < older_avg * 0.95:  # 5% degradation
                    recommendations.append({
                        "type": "warning",
                        "title": "Performance degradation detected",
                        "description": f"Recent performance ({recent_avg:.3f}) is lower than previous ({older_avg:.3f})",
                        "action": "Investigate data drift and consider model retraining"
                    })
            
            # Check for high variance
            if len(metric_values) >= 3:
                variance = statistics.variance(metric_values)
                if variance > 0.01:  # High variance threshold
                    recommendations.append({
                        "type": "info",
                        "title": "High performance variance",
                        "description": f"Performance variance is high ({variance:.3f})",
                        "action": "Consider model stability improvements and ensemble methods"
                    })
            
            return {
                "success": True,
                "model_name": model_name,
                "target_metric": target_metric,
                "current_performance": avg_performance,
                "min_threshold": min_threshold,
                "recommendations": recommendations,
                "data_points": len(metric_values)
            }
            
        except Exception as e:
            logger.error(f"Error getting performance recommendations: {e}")
            return {"success": False, "error": str(e)}
    
    def _filter_performance_data(
        self,
        data: List[Dict[str, Any]],
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> List[Dict[str, Any]]:
        """Filter performance data by date range"""
        try:
            filtered_data = []
            
            for record in data:
                record_timestamp = datetime.fromisoformat(record["timestamp"])
                
                if start_date and record_timestamp < start_date:
                    continue
                if end_date and record_timestamp > end_date:
                    continue
                
                filtered_data.append(record)
            
            return filtered_data
            
        except Exception as e:
            logger.error(f"Error filtering performance data: {e}")
            return []
    
    def _calculate_aggregated_metrics(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate aggregated metrics from performance data"""
        try:
            if not data:
                return {}
            
            # Collect all metrics
            all_metrics = {}
            for record in data:
                for metric_name, metric_value in record["metrics"].items():
                    if metric_name not in all_metrics:
                        all_metrics[metric_name] = []
                    all_metrics[metric_name].append(metric_value)
            
            # Calculate statistics for each metric
            aggregated = {}
            for metric_name, values in all_metrics.items():
                aggregated[metric_name] = {
                    "mean": statistics.mean(values),
                    "median": statistics.median(values),
                    "std": statistics.stdev(values) if len(values) > 1 else 0,
                    "min": min(values),
                    "max": max(values),
                    "count": len(values)
                }
            
            return aggregated
            
        except Exception as e:
            logger.error(f"Error calculating aggregated metrics: {e}")
            return {}
    
    def _calculate_performance_trends(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate performance trends"""
        try:
            if len(data) < 2:
                return {"trend": "insufficient_data"}
            
            # Get the target metric from the first record
            target_metric = None
            for metric_name in data[0]["metrics"].keys():
                if metric_name in ["f1_score", "accuracy", "precision", "recall", "auc"]:
                    target_metric = metric_name
                    break
            
            if not target_metric:
                return {"trend": "no_target_metric"}
            
            # Extract metric values over time
            metric_values = [
                record["metrics"].get(target_metric, 0.0)
                for record in data
            ]
            
            # Calculate trend
            if len(metric_values) >= 2:
                first_half = metric_values[:len(metric_values)//2]
                second_half = metric_values[len(metric_values)//2:]
                
                first_avg = statistics.mean(first_half)
                second_avg = statistics.mean(second_half)
                
                if second_avg > first_avg * 1.05:
                    trend = "improving"
                elif second_avg < first_avg * 0.95:
                    trend = "degrading"
                else:
                    trend = "stable"
                
                return {
                    "trend": trend,
                    "target_metric": target_metric,
                    "first_half_avg": first_avg,
                    "second_half_avg": second_avg,
                    "change_percentage": ((second_avg - first_avg) / first_avg) * 100
                }
            
            return {"trend": "insufficient_data"}
            
        except Exception as e:
            logger.error(f"Error calculating performance trends: {e}")
            return {"trend": "error"}
    
    def _check_performance_alerts(
        self,
        model_name: str,
        metrics: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """Check for performance alerts"""
        try:
            alerts = []
            
            for metric_name, metric_value in metrics.items():
                thresholds = self.performance_thresholds.get(metric_name, {})
                
                if metric_value < thresholds.get("critical", 0):
                    alerts.append({
                        "level": "critical",
                        "metric": metric_name,
                        "value": metric_value,
                        "threshold": thresholds.get("critical", 0),
                        "message": f"Critical: {metric_name} ({metric_value:.3f}) below critical threshold"
                    })
                elif metric_value < thresholds.get("warning", 0):
                    alerts.append({
                        "level": "warning",
                        "metric": metric_name,
                        "value": metric_value,
                        "threshold": thresholds.get("warning", 0),
                        "message": f"Warning: {metric_name} ({metric_value:.3f}) below warning threshold"
                    })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error checking performance alerts: {e}")
            return []
    
    async def export_performance_data(
        self,
        model_name: str,
        format: str = "json",
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Export performance data"""
        try:
            if model_name not in self.performance_data:
                return {"success": False, "error": f"No data for model: {model_name}"}
            
            # Filter data
            filtered_data = self._filter_performance_data(
                self.performance_data[model_name],
                start_date,
                end_date
            )
            
            if format == "json":
                export_data = json.dumps(filtered_data, indent=2, default=str)
            else:
                return {"success": False, "error": f"Unsupported format: {format}"}
            
            return {
                "success": True,
                "model_name": model_name,
                "format": format,
                "data": export_data,
                "record_count": len(filtered_data),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error exporting performance data: {e}")
            return {"success": False, "error": str(e)}

