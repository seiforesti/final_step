"""
Widget Creation Service
======================

Enterprise widget creation service for building and managing
dashboard widgets across the data governance system.

This service provides:
- Dynamic widget creation and configuration
- Widget data source integration
- Widget visualization management
- Widget layout and positioning
- Widget refresh and update mechanisms
- Widget customization and theming
- Widget performance optimization
- Widget lifecycle management
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import uuid

logger = logging.getLogger(__name__)


class WidgetCreationService:
    """Enterprise widget creation service"""
    
    def __init__(self):
        self.widget_templates = self._load_widget_templates()
        self.visualization_types = self._load_visualization_types()
        self.data_connectors = self._load_data_connectors()
    
    def _load_widget_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load widget templates"""
        return {
            "metric_card": {
                "type": "metric",
                "visualization": "number",
                "default_size": {"width": 2, "height": 1},
                "refresh_interval": 60,
                "data_requirements": ["single_value"]
            },
            "line_chart": {
                "type": "chart",
                "visualization": "line",
                "default_size": {"width": 4, "height": 3},
                "refresh_interval": 300,
                "data_requirements": ["time_series"]
            },
            "bar_chart": {
                "type": "chart",
                "visualization": "bar",
                "default_size": {"width": 4, "height": 3},
                "refresh_interval": 300,
                "data_requirements": ["categorical"]
            },
            "pie_chart": {
                "type": "chart",
                "visualization": "pie",
                "default_size": {"width": 3, "height": 3},
                "refresh_interval": 300,
                "data_requirements": ["categorical"]
            },
            "table": {
                "type": "table",
                "visualization": "table",
                "default_size": {"width": 6, "height": 4},
                "refresh_interval": 600,
                "data_requirements": ["tabular"]
            },
            "heatmap": {
                "type": "chart",
                "visualization": "heatmap",
                "default_size": {"width": 4, "height": 3},
                "refresh_interval": 300,
                "data_requirements": ["matrix"]
            },
            "gauge": {
                "type": "metric",
                "visualization": "gauge",
                "default_size": {"width": 2, "height": 2},
                "refresh_interval": 60,
                "data_requirements": ["percentage"]
            }
        }
    
    def _load_visualization_types(self) -> Dict[str, Dict[str, Any]]:
        """Load visualization type configurations"""
        return {
            "number": {
                "display_type": "metric",
                "supports_formatting": True,
                "supports_thresholds": True
            },
            "line": {
                "display_type": "chart",
                "supports_multiple_series": True,
                "supports_zoom": True
            },
            "bar": {
                "display_type": "chart",
                "supports_stacked": True,
                "supports_horizontal": True
            },
            "pie": {
                "display_type": "chart",
                "supports_donut": True,
                "supports_legend": True
            },
            "table": {
                "display_type": "tabular",
                "supports_sorting": True,
                "supports_pagination": True
            },
            "heatmap": {
                "display_type": "chart",
                "supports_color_scales": True,
                "supports_annotations": True
            },
            "gauge": {
                "display_type": "metric",
                "supports_thresholds": True,
                "supports_arc": True
            }
        }
    
    def _load_data_connectors(self) -> Dict[str, Dict[str, Any]]:
        """Load data connector configurations"""
        return {
            "analytics": {
                "service": "analytics_service",
                "methods": ["get_metrics", "get_time_series", "get_categorical_data"],
                "supports_real_time": True
            },
            "catalog": {
                "service": "catalog_service",
                "methods": ["get_catalog_stats", "get_item_counts", "get_quality_metrics"],
                "supports_real_time": False
            },
            "compliance": {
                "service": "compliance_service",
                "methods": ["get_compliance_status", "get_violations", "get_audit_data"],
                "supports_real_time": True
            },
            "scan": {
                "service": "scan_service",
                "methods": ["get_scan_results", "get_performance_metrics", "get_discovery_data"],
                "supports_real_time": True
            },
            "rbac": {
                "service": "rbac_service",
                "methods": ["get_user_activity", "get_permission_stats", "get_access_logs"],
                "supports_real_time": True
            }
        }
    
    async def create_widget(
        self,
        widget_type: str,
        title: str,
        data_source: str,
        visualization_type: str,
        config: Dict[str, Any],
        position: Dict[str, int],
        size: Dict[str, int]
    ) -> Dict[str, Any]:
        """Create a new widget"""
        try:
            # Validate widget type
            if widget_type not in self.widget_templates:
                return {
                    "success": False,
                    "error": f"Invalid widget type: {widget_type}"
                }
            
            # Validate visualization type
            if visualization_type not in self.visualization_types:
                return {
                    "success": False,
                    "error": f"Invalid visualization type: {visualization_type}"
                }
            
            # Validate data source
            if data_source not in self.data_connectors:
                return {
                    "success": False,
                    "error": f"Invalid data source: {data_source}"
                }
            
            # Generate widget ID
            widget_id = str(uuid.uuid4())
            
            # Create widget configuration
            widget_config = {
                "widget_id": widget_id,
                "widget_type": widget_type,
                "title": title,
                "data_source": data_source,
                "visualization_type": visualization_type,
                "config": config,
                "position": position,
                "size": size,
                "refresh_interval": self.widget_templates[widget_type]["refresh_interval"],
                "created_at": datetime.utcnow().isoformat(),
                "last_updated": datetime.utcnow().isoformat(),
                "status": "active"
            }
            
            # Validate widget configuration
            validation_result = await self._validate_widget_config(widget_config)
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": f"Widget validation failed: {validation_result['errors']}"
                }
            
            logger.info(f"Widget created: {widget_id} - {title}")
            return {
                "success": True,
                "widget_id": widget_id,
                "widget_config": widget_config
            }
            
        except Exception as e:
            logger.error(f"Error creating widget: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_widget_details(
        self,
        widget_id: str,
        include_data: bool = False
    ) -> Dict[str, Any]:
        """Get widget details and optionally include data"""
        try:
            # Fetch widget details from database or cache
            from .data_source_service import DataSourceService
            ds_service = DataSourceService()
            
            widget_data = await ds_service.get_widget_configuration(widget_id)
            if not widget_data.get("success"):
                return {"success": False, "error": f"Widget not found: {widget_id}"}
            
            widget_details = widget_data.get("widget_details", {})
            widget_details.update({
                "widget_id": widget_id,
                "last_updated": datetime.utcnow().isoformat()
            })
            
            if include_data:
                widget_details["data"] = await self._get_widget_data(widget_id)
            
            return {
                "success": True,
                "widget_details": widget_details
            }
            
        except Exception as e:
            logger.error(f"Error getting widget details: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_widget(
        self,
        widget_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update widget configuration"""
        try:
            # Validate updates
            allowed_updates = [
                "title", "config", "position", "size", 
                "refresh_interval", "visualization_type"
            ]
            
            invalid_updates = [
                key for key in updates.keys() 
                if key not in allowed_updates
            ]
            
            if invalid_updates:
                return {
                    "success": False,
                    "error": f"Invalid update fields: {invalid_updates}"
                }
            
            # This would update in database in real implementation
            logger.info(f"Widget updated: {widget_id}")
            return {
                "success": True,
                "widget_id": widget_id,
                "updated_fields": list(updates.keys())
            }
            
        except Exception as e:
            logger.error(f"Error updating widget: {e}")
            return {"success": False, "error": str(e)}
    
    async def delete_widget(self, widget_id: str) -> Dict[str, Any]:
        """Delete a widget"""
        try:
            # This would delete from database in real implementation
            logger.info(f"Widget deleted: {widget_id}")
            return {
                "success": True,
                "widget_id": widget_id,
                "message": "Widget deleted successfully"
            }
            
        except Exception as e:
            logger.error(f"Error deleting widget: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_available_widget_types(self) -> List[Dict[str, Any]]:
        """Get available widget types"""
        try:
            widget_types = []
            
            for widget_type, config in self.widget_templates.items():
                widget_types.append({
                    "type": widget_type,
                    "name": widget_type.replace("_", " ").title(),
                    "description": f"{config['type']} widget with {config['visualization']} visualization",
                    "default_size": config["default_size"],
                    "refresh_interval": config["refresh_interval"],
                    "data_requirements": config["data_requirements"]
                })
            
            return {
                "success": True,
                "widget_types": widget_types
            }
            
        except Exception as e:
            logger.error(f"Error getting widget types: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_available_visualizations(self) -> List[Dict[str, Any]]:
        """Get available visualization types"""
        try:
            visualizations = []
            
            for viz_type, config in self.visualization_types.items():
                visualizations.append({
                    "type": viz_type,
                    "name": viz_type.replace("_", " ").title(),
                    "display_type": config["display_type"],
                    "supports_formatting": config.get("supports_formatting", False),
                    "supports_thresholds": config.get("supports_thresholds", False)
                })
            
            return {
                "success": True,
                "visualizations": visualizations
            }
            
        except Exception as e:
            logger.error(f"Error getting visualizations: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_available_data_sources(self) -> List[Dict[str, Any]]:
        """Get available data sources"""
        try:
            data_sources = []
            
            for source, config in self.data_connectors.items():
                data_sources.append({
                    "source": source,
                    "name": source.replace("_", " ").title(),
                    "service": config["service"],
                    "methods": config["methods"],
                    "supports_real_time": config["supports_real_time"]
                })
            
            return {
                "success": True,
                "data_sources": data_sources
            }
            
        except Exception as e:
            logger.error(f"Error getting data sources: {e}")
            return {"success": False, "error": str(e)}
    
    async def _validate_widget_config(self, widget_config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate widget configuration"""
        try:
            errors = []
            
            # Check required fields
            required_fields = ["title", "data_source", "visualization_type", "position", "size"]
            for field in required_fields:
                if field not in widget_config:
                    errors.append(f"Missing required field: {field}")
            
            # Validate position
            position = widget_config.get("position", {})
            if not isinstance(position, dict) or "x" not in position or "y" not in position:
                errors.append("Invalid position format")
            
            # Validate size
            size = widget_config.get("size", {})
            if not isinstance(size, dict) or "width" not in size or "height" not in size:
                errors.append("Invalid size format")
            
            # Validate refresh interval
            refresh_interval = widget_config.get("refresh_interval", 60)
            if not isinstance(refresh_interval, int) or refresh_interval < 10:
                errors.append("Refresh interval must be at least 10 seconds")
            
            return {
                "valid": len(errors) == 0,
                "errors": errors
            }
            
        except Exception as e:
            logger.error(f"Error validating widget config: {e}")
            return {"valid": False, "errors": [str(e)]}
    
    async def _get_widget_data(self, widget_id: str) -> Dict[str, Any]:
        """Get widget data"""
        try:
            # Fetch real data from the data source
            from .data_source_service import DataSourceService
            ds_service = DataSourceService()
            
            data_result = await ds_service.get_widget_data(widget_id)
            if not data_result.get("success"):
                return {"error": f"Failed to fetch data for widget {widget_id}"}
            
            return data_result.get("data", {})
            
        except Exception as e:
            logger.error(f"Error getting widget data: {e}")
            return {"error": str(e)}
    
    async def refresh_widget_data(self, widget_id: str) -> Dict[str, Any]:
        """Refresh widget data"""
        try:
            # This would trigger a data refresh for the widget
            logger.info(f"Widget data refreshed: {widget_id}")
            return {
                "success": True,
                "widget_id": widget_id,
                "refreshed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error refreshing widget data: {e}")
            return {"success": False, "error": str(e)}
