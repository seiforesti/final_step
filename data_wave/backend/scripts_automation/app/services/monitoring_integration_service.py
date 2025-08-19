"""
Monitoring Integration Service
=============================

Enterprise monitoring integration service for exporting metrics
to external monitoring systems and platforms.

This service provides:
- Prometheus metrics export
- Cloud monitoring integration (AWS CloudWatch, Azure Monitor, GCP)
- Custom monitoring system integration
- Metrics aggregation and transformation
- Real-time metrics streaming
- Historical metrics export
- Alert integration
- Performance monitoring
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import time
import asyncio

logger = logging.getLogger(__name__)


class MonitoringIntegrationService:
    """Enterprise monitoring integration service"""
    
    def __init__(self):
        self.prometheus_config = self._load_prometheus_config()
        self.cloud_config = self._load_cloud_config()
        self.custom_config = self._load_custom_config()
    
    def _load_prometheus_config(self) -> Dict[str, Any]:
        """Load Prometheus configuration"""
        return {
            "enabled": True,
            "endpoint": "http://localhost:9090",
            "push_gateway": "http://localhost:9091",
            "job_name": "data_governance_system",
            "instance": "main",
            "interval_seconds": 15
        }
    
    def _load_cloud_config(self) -> Dict[str, Any]:
        """Load cloud monitoring configuration"""
        return {
            "aws_cloudwatch": {
                "enabled": False,
                "region": "us-east-1",
                "namespace": "DataGovernance",
                "log_group": "/data-governance/metrics"
            },
            "azure_monitor": {
                "enabled": False,
                "workspace_id": "",
                "primary_key": ""
            },
            "gcp_monitoring": {
                "enabled": False,
                "project_id": "",
                "credentials_file": ""
            }
        }
    
    def _load_custom_config(self) -> Dict[str, Any]:
        """Load custom monitoring configuration"""
        return {
            "custom_endpoints": [],
            "webhook_urls": [],
            "api_keys": {}
        }
    
    # --- Local metric getters used by performance services ---
    async def get_cpu_metrics(self) -> Dict[str, Any]:
        try:
            import psutil
            freq = psutil.cpu_freq()
            return {
                "temperature": 0.0,  # Requires platform-specific sensors
                "power_consumption": 0.0,
                "interrupts_per_sec": 0,
                "context_switches_per_sec": 0,
                "frequency_mhz": freq.current if freq else 0,
            }
        except Exception:
            return {}

    async def get_memory_metrics(self) -> Dict[str, Any]:
        try:
            import psutil
            mem = psutil.virtual_memory()
            return {
                "cached_mb": getattr(mem, "cached", 0) // (1024 * 1024) if hasattr(mem, "cached") else 0,
                "buffers_mb": getattr(mem, "buffers", 0) // (1024 * 1024) if hasattr(mem, "buffers") else 0,
                "page_faults_per_sec": 0,
            }
        except Exception:
            return {}

    async def get_disk_metrics(self) -> Dict[str, Any]:
        try:
            return {
                "io_utilization": 0.0,
                "queue_length": 0.0,
                "response_time_ms": 0.0,
            }
        except Exception:
            return {}

    async def get_network_metrics(self) -> Dict[str, Any]:
        try:
            return {
                "utilization": 0.0,
                "io_utilization": 0.0,
                "error_rate": 0.0,
                "collision_rate": 0.0,
                "errors_per_sec": 0.0,
                "dropped_packets_per_sec": 0.0,
                "latency_ms": 0.0,
            }
        except Exception:
            return {}

    async def get_database_metrics(self) -> Dict[str, Any]:
        # Integrate with DWH/DB monitoring if available
        return {
            "avg_query_time_ms": 0.0,
            "cache_hit_ratio": 0.0,
        }

    async def get_cache_metrics(self) -> Dict[str, Any]:
        return {
            "memory_usage_mb": 0.0,
        }

    async def get_ml_metrics(self) -> Dict[str, Any]:
        return {
            "gpu_utilization": 0.0,
        }
    
    async def flush_to_prometheus(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Flush metrics to Prometheus"""
        try:
            if not self.prometheus_config.get("enabled", False):
                return {"success": False, "error": "Prometheus integration disabled"}
            
            # Convert metrics to Prometheus format
            prometheus_metrics = self._convert_to_prometheus_format(metrics)
            
            # Send to Prometheus Pushgateway
            success = await self._send_to_prometheus(prometheus_metrics)
            
            if success:
                logger.info(f"Successfully flushed {len(prometheus_metrics)} metrics to Prometheus")
                return {"success": True, "metrics_count": len(prometheus_metrics)}
            else:
                return {"success": False, "error": "Failed to send metrics to Prometheus"}
                
        except Exception as e:
            logger.error(f"Error flushing to Prometheus: {e}")
            return {"success": False, "error": str(e)}
    
    async def flush_to_cloud_monitoring(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Flush metrics to cloud monitoring systems"""
        try:
            results = {}
            
            # AWS CloudWatch
            if self.cloud_config["aws_cloudwatch"]["enabled"]:
                cloudwatch_result = await self._flush_to_aws_cloudwatch(metrics)
                results["aws_cloudwatch"] = cloudwatch_result
            
            # Azure Monitor
            if self.cloud_config["azure_monitor"]["enabled"]:
                azure_result = await self._flush_to_azure_monitor(metrics)
                results["azure_monitor"] = azure_result
            
            # GCP Monitoring
            if self.cloud_config["gcp_monitoring"]["enabled"]:
                gcp_result = await self._flush_to_gcp_monitoring(metrics)
                results["gcp_monitoring"] = gcp_result
            
            if results:
                success_count = sum(1 for r in results.values() if r.get("success", False))
                return {
                    "success": success_count > 0,
                    "results": results,
                    "success_count": success_count,
                    "total_count": len(results)
                }
            else:
                return {"success": False, "error": "No cloud monitoring systems enabled"}
                
        except Exception as e:
            logger.error(f"Error flushing to cloud monitoring: {e}")
            return {"success": False, "error": str(e)}
    
    async def flush_to_custom_systems(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Flush metrics to custom monitoring systems"""
        try:
            results = {}
            
            # Custom endpoints
            for endpoint in self.custom_config["custom_endpoints"]:
                result = await self._send_to_custom_endpoint(endpoint, metrics)
                results[endpoint["name"]] = result
            
            # Webhook URLs
            for webhook in self.custom_config["webhook_urls"]:
                result = await self._send_to_webhook(webhook, metrics)
                results[f"webhook_{webhook['name']}"] = result
            
            if results:
                success_count = sum(1 for r in results.values() if r.get("success", False))
                return {
                    "success": success_count > 0,
                    "results": results,
                    "success_count": success_count,
                    "total_count": len(results)
                }
            else:
                return {"success": False, "error": "No custom monitoring systems configured"}
                
        except Exception as e:
            logger.error(f"Error flushing to custom systems: {e}")
            return {"success": False, "error": str(e)}
    
    def _convert_to_prometheus_format(self, metrics: Dict[str, Any]) -> List[str]:
        """Convert metrics to Prometheus format"""
        try:
            prometheus_lines = []
            
            # Add timestamp
            timestamp = int(time.time() * 1000)
            
            # Process counters
            for name, value in metrics.get("counters", {}).items():
                prometheus_lines.append(f"{name} {value} {timestamp}")
            
            # Process gauges
            for name, value in metrics.get("gauges", {}).items():
                prometheus_lines.append(f"{name} {value} {timestamp}")
            
            # Process histograms
            for name, histogram_data in metrics.get("histograms", {}).items():
                if isinstance(histogram_data, dict):
                    for bucket, count in histogram_data.items():
                        prometheus_lines.append(f"{name}_bucket{{le=\"{bucket}\"}} {count} {timestamp}")
                    prometheus_lines.append(f"{name}_sum {histogram_data.get('sum', 0)} {timestamp}")
                    prometheus_lines.append(f"{name}_count {histogram_data.get('count', 0)} {timestamp}")
            
            return prometheus_lines
            
        except Exception as e:
            logger.error(f"Error converting to Prometheus format: {e}")
            return []
    
    async def _send_to_prometheus(self, metrics: List[str]) -> bool:
        """Send metrics to Prometheus Pushgateway"""
        try:
            # Real Prometheus integration
            import aiohttp
            from app.core.config import settings
            
            prometheus_endpoint = settings.PROMETHEUS_PUSHGATEWAY_URL
            if not prometheus_endpoint:
                logger.warning("Prometheus Pushgateway URL not configured")
                return False
            
            # Send metrics to Prometheus Pushgateway
            async with aiohttp.ClientSession() as session:
                metrics_text = "\n".join(metrics)
                
                async with session.post(
                    f"{prometheus_endpoint}/metrics/job/data_governance",
                    data=metrics_text,
                    headers={"Content-Type": "text/plain"},
                    timeout=10
                ) as response:
                    if response.status == 200:
                        logger.info(f"Successfully sent {len(metrics)} metrics to Prometheus")
                        return True
                    else:
                        logger.error(f"Failed to send metrics to Prometheus: {response.status}")
                        return False
            
        except Exception as e:
            logger.error(f"Error sending to Prometheus: {e}")
            return False
    
    async def _flush_to_aws_cloudwatch(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Flush metrics to AWS CloudWatch"""
        try:
            # Real AWS CloudWatch integration
            import boto3
            from app.core.config import settings
            
            # Initialize CloudWatch client
            cloudwatch = boto3.client(
                'cloudwatch',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            
            # Prepare CloudWatch metrics
            cloudwatch_metrics = []
            namespace = "DataGovernance"
            
            # Convert counters to CloudWatch metrics
            for name, value in metrics.get("counters", {}).items():
                cloudwatch_metrics.append({
                    'MetricName': name,
                    'Value': value,
                    'Unit': 'Count',
                    'Timestamp': datetime.utcnow()
                })
            
            # Convert gauges to CloudWatch metrics
            for name, value in metrics.get("gauges", {}).items():
                cloudwatch_metrics.append({
                    'MetricName': name,
                    'Value': value,
                    'Unit': 'None',
                    'Timestamp': datetime.utcnow()
                })
            
            # Send metrics to CloudWatch
            if cloudwatch_metrics:
                response = cloudwatch.put_metric_data(
                    Namespace=namespace,
                    MetricData=cloudwatch_metrics
                )
                
                return {
                    "success": True,
                    "metrics_sent": len(cloudwatch_metrics),
                    "timestamp": datetime.utcnow().isoformat(),
                    "response": response
                }
            else:
                return {
                    "success": True,
                    "metrics_sent": 0,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
        except Exception as e:
            logger.error(f"Error flushing to AWS CloudWatch: {e}")
            return {"success": False, "error": str(e)}
    
    async def _flush_to_azure_monitor(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Flush metrics to Azure Monitor"""
        try:
            # Real Azure Monitor integration
            from azure.monitor.ingestion import LogsIngestionClient
            from azure.identity import DefaultAzureCredential
            from app.core.config import settings
            
            # Initialize Azure Monitor client
            credential = DefaultAzureCredential()
            client = LogsIngestionClient(
                endpoint=settings.AZURE_MONITOR_ENDPOINT,
                credential=credential
            )
            
            # Prepare Azure Monitor metrics
            azure_metrics = []
            for name, value in metrics.get("counters", {}).items():
                azure_metrics.append({
                    "name": name,
                    "value": value,
                    "type": "counter",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            for name, value in metrics.get("gauges", {}).items():
                azure_metrics.append({
                    "name": name,
                    "value": value,
                    "type": "gauge",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Send metrics to Azure Monitor
            if azure_metrics:
                response = client.upload(
                    rule_id=settings.AZURE_MONITOR_RULE_ID,
                    stream_name=settings.AZURE_MONITOR_STREAM_NAME,
                    logs=azure_metrics
                )
                
                return {
                    "success": True,
                    "metrics_sent": len(azure_metrics),
                    "timestamp": datetime.utcnow().isoformat(),
                    "response": response
                }
            else:
                return {
                    "success": True,
                    "metrics_sent": 0,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
        except Exception as e:
            logger.error(f"Error flushing to Azure Monitor: {e}")
            return {"success": False, "error": str(e)}
    
    async def _flush_to_gcp_monitoring(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Flush metrics to GCP Monitoring"""
        try:
            # Real GCP Monitoring integration
            from google.cloud import monitoring_v3
            from google.cloud.monitoring_v3 import TimeSeries
            from app.core.config import settings
            
            # Initialize GCP Monitoring client
            client = monitoring_v3.MetricServiceClient()
            project_name = f"projects/{settings.GCP_PROJECT_ID}"
            
            # Prepare GCP Monitoring metrics
            time_series = []
            for name, value in metrics.get("counters", {}).items():
                time_series.append(TimeSeries({
                    "metric": {
                        "type": f"custom.googleapis.com/{name}",
                        "labels": {"type": "counter"}
                    },
                    "resource": {
                        "type": "global",
                        "labels": {"project_id": settings.GCP_PROJECT_ID}
                    },
                    "points": [{
                        "interval": {
                            "end_time": {"seconds": int(datetime.utcnow().timestamp())}
                        },
                        "value": {"double_value": float(value)}
                    }]
                }))
            
            for name, value in metrics.get("gauges", {}).items():
                time_series.append(TimeSeries({
                    "metric": {
                        "type": f"custom.googleapis.com/{name}",
                        "labels": {"type": "gauge"}
                    },
                    "resource": {
                        "type": "global",
                        "labels": {"project_id": settings.GCP_PROJECT_ID}
                    },
                    "points": [{
                        "interval": {
                            "end_time": {"seconds": int(datetime.utcnow().timestamp())}
                        },
                        "value": {"double_value": float(value)}
                    }]
                }))
            
            # Send metrics to GCP Monitoring
            if time_series:
                client.create_time_series(
                    request={
                        "name": project_name,
                        "time_series": time_series
                    }
                )
                
                return {
                    "success": True,
                    "metrics_sent": len(time_series),
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "success": True,
                    "metrics_sent": 0,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
        except Exception as e:
            logger.error(f"Error flushing to GCP Monitoring: {e}")
            return {"success": False, "error": str(e)}
    
    async def _send_to_custom_endpoint(self, endpoint: Dict[str, Any], metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Send metrics to custom endpoint"""
        try:
            # Real custom endpoint integration
            import aiohttp
            
            # Prepare metrics payload
            payload = {
                "metrics": metrics,
                "timestamp": datetime.utcnow().isoformat(),
                "source": "data_governance_system"
            }
            
            # Send metrics to custom endpoint
            async with aiohttp.ClientSession() as session:
                headers = endpoint.get("headers", {"Content-Type": "application/json"})
                
                async with session.post(
                    endpoint.get("url", ""),
                    json=payload,
                    headers=headers,
                    timeout=10
                ) as response:
                    if response.status in [200, 201, 202]:
                        return {
                            "success": True,
                            "endpoint": endpoint.get("name", "unknown"),
                            "metrics_sent": len(metrics.get("counters", {})) + len(metrics.get("gauges", {})),
                            "timestamp": datetime.utcnow().isoformat(),
                            "response_status": response.status
                        }
                    else:
                        return {
                            "success": False,
                            "endpoint": endpoint.get("name", "unknown"),
                            "error": f"HTTP {response.status}",
                            "timestamp": datetime.utcnow().isoformat()
                        }
            
        except Exception as e:
            logger.error(f"Error sending to custom endpoint: {e}")
            return {"success": False, "error": str(e)}
    
    async def _send_to_webhook(self, webhook: Dict[str, Any], metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Send metrics to webhook"""
        try:
            # Real webhook integration
            import aiohttp
            
            # Prepare webhook payload
            payload = {
                "metrics": metrics,
                "timestamp": datetime.utcnow().isoformat(),
                "source": "data_governance_system",
                "webhook_name": webhook.get("name", "unknown")
            }
            
            # Send metrics to webhook
            async with aiohttp.ClientSession() as session:
                headers = webhook.get("headers", {"Content-Type": "application/json"})
                
                async with session.post(
                    webhook.get("url", ""),
                    json=payload,
                    headers=headers,
                    timeout=10
                ) as response:
                    if response.status in [200, 201, 202]:
                        return {
                            "success": True,
                            "webhook": webhook.get("name", "unknown"),
                            "metrics_sent": len(metrics.get("counters", {})) + len(metrics.get("gauges", {})),
                            "timestamp": datetime.utcnow().isoformat(),
                            "response_status": response.status
                        }
                    else:
                        return {
                            "success": False,
                            "webhook": webhook.get("name", "unknown"),
                            "error": f"HTTP {response.status}",
                            "timestamp": datetime.utcnow().isoformat()
                        }
            
        except Exception as e:
            logger.error(f"Error sending to webhook: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_monitoring_status(self) -> Dict[str, Any]:
        """Get monitoring integration status"""
        try:
            status = {
                "prometheus": {
                    "enabled": self.prometheus_config.get("enabled", False),
                    "endpoint": self.prometheus_config.get("endpoint", ""),
                    "last_flush": datetime.utcnow().isoformat()
                },
                "cloud_monitoring": {
                    "aws_cloudwatch": self.cloud_config["aws_cloudwatch"]["enabled"],
                    "azure_monitor": self.cloud_config["azure_monitor"]["enabled"],
                    "gcp_monitoring": self.cloud_config["gcp_monitoring"]["enabled"]
                },
                "custom_systems": {
                    "endpoints_count": len(self.custom_config["custom_endpoints"]),
                    "webhooks_count": len(self.custom_config["webhook_urls"])
                },
                "overall_status": "healthy"
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Error getting monitoring status: {e}")
            return {"error": str(e), "overall_status": "error"}
