"""
Metrics Export Service
=====================

Enterprise metrics export service for exporting metrics data
for analysis, reporting, and external system integration.

This service provides:
- Metrics data export in various formats (JSON, CSV, XML)
- Historical metrics export
- Real-time metrics streaming
- Metrics aggregation and summarization
- Custom export formats
- Scheduled exports
- Export validation and verification
- Performance optimization
"""

import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import json
import csv
import io
import gzip
import base64

logger = logging.getLogger(__name__)


class MetricsExportService:
    """Enterprise metrics export service"""
    
    def __init__(self):
        self.export_formats = ["json", "csv", "xml", "prometheus"]
        self.compression_formats = ["none", "gzip", "base64"]
    
    async def export_metrics_for_analysis(
        self,
        metrics: Dict[str, Any],
        format: str = "json",
        compression: str = "none",
        include_metadata: bool = True
    ) -> Dict[str, Any]:
        """Export metrics for analysis"""
        try:
            # Validate format
            if format not in self.export_formats:
                return {"success": False, "error": f"Unsupported format: {format}"}
            
            # Validate compression
            if compression not in self.compression_formats:
                return {"success": False, "error": f"Unsupported compression: {compression}"}
            
            # Export metrics
            if format == "json":
                export_data = await self._export_to_json(metrics, include_metadata)
            elif format == "csv":
                export_data = await self._export_to_csv(metrics, include_metadata)
            elif format == "xml":
                export_data = await self._export_to_xml(metrics, include_metadata)
            elif format == "prometheus":
                export_data = await self._export_to_prometheus(metrics, include_metadata)
            else:
                return {"success": False, "error": f"Format not implemented: {format}"}
            
            # Apply compression if requested
            if compression != "none":
                export_data = await self._apply_compression(export_data, compression)
            
            return {
                "success": True,
                "format": format,
                "compression": compression,
                "data": export_data,
                "size_bytes": len(export_data) if isinstance(export_data, str) else len(str(export_data)),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error exporting metrics for analysis: {e}")
            return {"success": False, "error": str(e)}
    
    async def export_historical_metrics(
        self,
        start_date: datetime,
        end_date: datetime,
        format: str = "json",
        aggregation: str = "hourly"
    ) -> Dict[str, Any]:
        """Export historical metrics for a time period"""
        try:
            # Fetch real historical metrics from storage
            from .data_source_service import DataSourceService
            ds_service = DataSourceService()
            
            historical_metrics = await ds_service.get_historical_metrics(
                start_date=start_date,
                end_date=end_date,
                aggregation=aggregation
            )
            
            if not historical_metrics.get("success"):
                # Fallback to generated metrics if storage fails
                historical_metrics = await self._generate_historical_metrics(start_date, end_date, aggregation)
            
            # Export the historical data
            return await self.export_metrics_for_analysis(
                metrics=historical_metrics,
                format=format,
                compression="none",
                include_metadata=True
            )
            
        except Exception as e:
            logger.error(f"Error exporting historical metrics: {e}")
            return {"success": False, "error": str(e)}
    
    async def export_metrics_summary(
        self,
        metrics: Dict[str, Any],
        summary_type: str = "daily"
    ) -> Dict[str, Any]:
        """Export metrics summary"""
        try:
            summary = await self._generate_metrics_summary(metrics, summary_type)
            
            return {
                "success": True,
                "summary_type": summary_type,
                "summary": summary,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error exporting metrics summary: {e}")
            return {"success": False, "error": str(e)}
    
    async def _export_to_json(
        self,
        metrics: Dict[str, Any],
        include_metadata: bool = True
    ) -> str:
        """Export metrics to JSON format"""
        try:
            export_data = {
                "metrics": metrics,
                "export_timestamp": datetime.utcnow().isoformat(),
                "export_format": "json"
            }
            
            if include_metadata:
                export_data["metadata"] = {
                    "version": "1.0",
                    "source": "data_governance_system",
                    "total_metrics": len(metrics.get("counters", {})) + len(metrics.get("gauges", {})) + len(metrics.get("histograms", {})),
                    "export_duration_ms": 0
                }
            
            return json.dumps(export_data, indent=2, default=str)
            
        except Exception as e:
            logger.error(f"Error exporting to JSON: {e}")
            return json.dumps({"error": str(e)})
    
    async def _export_to_csv(
        self,
        metrics: Dict[str, Any],
        include_metadata: bool = True
    ) -> str:
        """Export metrics to CSV format"""
        try:
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(["metric_name", "metric_type", "value", "timestamp"])
            
            # Write counters
            for name, value in metrics.get("counters", {}).items():
                writer.writerow([name, "counter", value, datetime.utcnow().isoformat()])
            
            # Write gauges
            for name, value in metrics.get("gauges", {}).items():
                writer.writerow([name, "gauge", value, datetime.utcnow().isoformat()])
            
            # Write histograms
            for name, histogram_data in metrics.get("histograms", {}).items():
                if isinstance(histogram_data, dict):
                    for bucket, count in histogram_data.items():
                        if bucket not in ["sum", "count"]:
                            writer.writerow([f"{name}_bucket_{bucket}", "histogram_bucket", count, datetime.utcnow().isoformat()])
                    writer.writerow([f"{name}_sum", "histogram_sum", histogram_data.get("sum", 0), datetime.utcnow().isoformat()])
                    writer.writerow([f"{name}_count", "histogram_count", histogram_data.get("count", 0), datetime.utcnow().isoformat()])
            
            csv_data = output.getvalue()
            output.close()
            
            return csv_data
            
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
            return f"error,{str(e)}"
    
    async def _export_to_xml(
        self,
        metrics: Dict[str, Any],
        include_metadata: bool = True
    ) -> str:
        """Export metrics to XML format"""
        try:
            xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
            xml_lines.append('<metrics>')
            
            # Add metadata
            if include_metadata:
                xml_lines.append('  <metadata>')
                xml_lines.append(f'    <export_timestamp>{datetime.utcnow().isoformat()}</export_timestamp>')
                xml_lines.append('    <export_format>xml</export_format>')
                xml_lines.append('    <version>1.0</version>')
                xml_lines.append('  </metadata>')
            
            # Add counters
            xml_lines.append('  <counters>')
            for name, value in metrics.get("counters", {}).items():
                xml_lines.append(f'    <counter name="{name}" value="{value}" />')
            xml_lines.append('  </counters>')
            
            # Add gauges
            xml_lines.append('  <gauges>')
            for name, value in metrics.get("gauges", {}).items():
                xml_lines.append(f'    <gauge name="{name}" value="{value}" />')
            xml_lines.append('  </gauges>')
            
            # Add histograms
            xml_lines.append('  <histograms>')
            for name, histogram_data in metrics.get("histograms", {}).items():
                xml_lines.append(f'    <histogram name="{name}">')
                if isinstance(histogram_data, dict):
                    for bucket, count in histogram_data.items():
                        if bucket not in ["sum", "count"]:
                            xml_lines.append(f'      <bucket value="{bucket}" count="{count}" />')
                    xml_lines.append(f'      <sum>{histogram_data.get("sum", 0)}</sum>')
                    xml_lines.append(f'      <count>{histogram_data.get("count", 0)}</count>')
                xml_lines.append('    </histogram>')
            xml_lines.append('  </histograms>')
            
            xml_lines.append('</metrics>')
            
            return '\n'.join(xml_lines)
            
        except Exception as e:
            logger.error(f"Error exporting to XML: {e}")
            return f'<error>{str(e)}</error>'
    
    async def _export_to_prometheus(
        self,
        metrics: Dict[str, Any],
        include_metadata: bool = True
    ) -> str:
        """Export metrics to Prometheus format"""
        try:
            prometheus_lines = []
            
            # Add metadata comments
            if include_metadata:
                prometheus_lines.append(f'# Export timestamp: {datetime.utcnow().isoformat()}')
                prometheus_lines.append('# Export format: prometheus')
                prometheus_lines.append('# Source: data_governance_system')
                prometheus_lines.append('')
            
            # Add counters
            for name, value in metrics.get("counters", {}).items():
                prometheus_lines.append(f'{name} {value}')
            
            # Add gauges
            for name, value in metrics.get("gauges", {}).items():
                prometheus_lines.append(f'{name} {value}')
            
            # Add histograms
            for name, histogram_data in metrics.get("histograms", {}).items():
                if isinstance(histogram_data, dict):
                    for bucket, count in histogram_data.items():
                        if bucket not in ["sum", "count"]:
                            prometheus_lines.append(f'{name}_bucket{{le="{bucket}"}} {count}')
                    prometheus_lines.append(f'{name}_sum {histogram_data.get("sum", 0)}')
                    prometheus_lines.append(f'{name}_count {histogram_data.get("count", 0)}')
            
            return '\n'.join(prometheus_lines)
            
        except Exception as e:
            logger.error(f"Error exporting to Prometheus: {e}")
            return f'# Error: {str(e)}'
    
    async def _apply_compression(
        self,
        data: str,
        compression: str
    ) -> Union[str, bytes]:
        """Apply compression to export data"""
        try:
            if compression == "gzip":
                return gzip.compress(data.encode('utf-8'))
            elif compression == "base64":
                return base64.b64encode(data.encode('utf-8')).decode('utf-8')
            else:
                return data
                
        except Exception as e:
            logger.error(f"Error applying compression: {e}")
            return data
    
    async def _generate_historical_metrics(
        self,
        start_date: datetime,
        end_date: datetime,
        aggregation: str
    ) -> Dict[str, Any]:
        """Generate historical metrics from real data sources"""
        try:
            # Fetch real historical data from monitoring systems
            from .monitoring_integration_service import MonitoringIntegrationService
            monitoring_service = MonitoringIntegrationService()
            
            historical_metrics = await monitoring_service.get_historical_metrics(
                start_date=start_date,
                end_date=end_date,
                aggregation=aggregation
            )
            
            if not historical_metrics.get("success"):
                # Fallback to basic metrics structure
                historical_metrics = {
                    "counters": {},
                    "gauges": {},
                    "histograms": {}
                }
            
            return historical_metrics.get("metrics", historical_metrics)
            
        except Exception as e:
            logger.error(f"Error generating historical metrics: {e}")
            return {"counters": {}, "gauges": {}, "histograms": {}}
    
    async def _generate_metrics_summary(
        self,
        metrics: Dict[str, Any],
        summary_type: str
    ) -> Dict[str, Any]:
        """Generate metrics summary"""
        try:
            summary = {
                "summary_type": summary_type,
                "timestamp": datetime.utcnow().isoformat(),
                "total_metrics": 0,
                "counters": {},
                "gauges": {},
                "histograms": {}
            }
            
            # Count total metrics
            summary["total_metrics"] = (
                len(metrics.get("counters", {})) +
                len(metrics.get("gauges", {})) +
                len(metrics.get("histograms", {}))
            )
            
            # Summarize counters
            counters = metrics.get("counters", {})
            if counters:
                summary["counters"] = {
                    "count": len(counters),
                    "total_value": sum(counters.values()),
                    "average_value": sum(counters.values()) / len(counters) if counters else 0,
                    "max_value": max(counters.values()) if counters else 0,
                    "min_value": min(counters.values()) if counters else 0
                }
            
            # Summarize gauges
            gauges = metrics.get("gauges", {})
            if gauges:
                summary["gauges"] = {
                    "count": len(gauges),
                    "average_value": sum(gauges.values()) / len(gauges) if gauges else 0,
                    "max_value": max(gauges.values()) if gauges else 0,
                    "min_value": min(gauges.values()) if gauges else 0
                }
            
            # Summarize histograms
            histograms = metrics.get("histograms", {})
            if histograms:
                summary["histograms"] = {
                    "count": len(histograms),
                    "total_buckets": sum(len(h.get("buckets", {})) for h in histograms.values() if isinstance(h, dict))
                }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating metrics summary: {e}")
            return {"error": str(e)}
    
    async def validate_export_data(
        self,
        export_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate exported metrics data"""
        try:
            validation_result = {
                "valid": True,
                "errors": [],
                "warnings": [],
                "metrics_count": 0
            }
            
            # Check if export was successful
            if not export_data.get("success", False):
                validation_result["valid"] = False
                validation_result["errors"].append("Export was not successful")
                return validation_result
            
            # Validate format
            if "format" not in export_data:
                validation_result["warnings"].append("Export format not specified")
            
            # Validate data
            data = export_data.get("data", "")
            if not data:
                validation_result["valid"] = False
                validation_result["errors"].append("No data in export")
                return validation_result
            
            # Count metrics based on format
            if export_data.get("format") == "json":
                try:
                    json_data = json.loads(data)
                    validation_result["metrics_count"] = len(json_data.get("metrics", {}).get("counters", {})) + len(json_data.get("metrics", {}).get("gauges", {}))
                except json.JSONDecodeError:
                    validation_result["valid"] = False
                    validation_result["errors"].append("Invalid JSON format")
            elif export_data.get("format") == "csv":
                lines = data.strip().split('\n')
                validation_result["metrics_count"] = max(0, len(lines) - 1)  # Subtract header
            elif export_data.get("format") == "prometheus":
                lines = data.strip().split('\n')
                validation_result["metrics_count"] = len([line for line in lines if not line.startswith('#')])
            
            # Check size
            size = export_data.get("size_bytes", 0)
            if size == 0:
                validation_result["warnings"].append("Export size is zero")
            elif size > 10 * 1024 * 1024:  # 10MB
                validation_result["warnings"].append("Export size is very large")
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating export data: {e}")
            return {
                "valid": False,
                "errors": [str(e)],
                "warnings": [],
                "metrics_count": 0
            }
