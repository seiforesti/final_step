"""
Global WebSocket endpoint for Data Sources SPA
Handles all real-time data updates to prevent API polling
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
import json
import asyncio
import logging
from datetime import datetime
import uuid

from app.db_session import get_session
from app.api.security import get_current_user
from app.services.data_source_service import DataSourceService
from app.services.notification_service import NotificationService
from app.services.websocket_service import WebSocketService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws/data-sources", tags=["websocket"])

# Global WebSocket connection manager
class GlobalWebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_subscriptions: Dict[WebSocket, List[str]] = {}
        self.lock = asyncio.Lock()
        self.data_cache: Dict[str, Any] = {}
        self.cache_timestamps: Dict[str, datetime] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        async with self.lock:
            self.active_connections.append(websocket)
            self.connection_subscriptions[websocket] = []
        logger.info(f"Global WebSocket connected for user {user_id}")
    
    async def disconnect(self, websocket: WebSocket):
        async with self.lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            if websocket in self.connection_subscriptions:
                del self.connection_subscriptions[websocket]
        logger.info("Global WebSocket disconnected")
    
    async def send_to_connection(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.warning(f"Failed to send message to WebSocket: {e}")
            # Remove failed connection
            await self.disconnect(websocket)
    
    async def broadcast_to_all(self, message: dict):
        async with self.lock:
            disconnected = []
            for websocket in self.active_connections:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.warning(f"Failed to broadcast message: {e}")
                    disconnected.append(websocket)
            
            # Remove disconnected websockets
            for ws in disconnected:
                await self.disconnect(ws)
    
    async def send_to_subscribers(self, message_type: str, data: Any):
        message = {
            "type": message_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast_to_all(message)
    
    def cache_data(self, key: str, data: Any):
        self.data_cache[key] = data
        self.cache_timestamps[key] = datetime.now()
    
    def get_cached_data(self, key: str, max_age_seconds: int = 300) -> Optional[Any]:
        if key not in self.data_cache:
            return None
        
        age = (datetime.now() - self.cache_timestamps[key]).total_seconds()
        if age > max_age_seconds:
            del self.data_cache[key]
            del self.cache_timestamps[key]
            return None
        
        return self.data_cache[key]

# Global instance
global_ws_manager = GlobalWebSocketManager()

@router.websocket("/global")
async def global_websocket_endpoint(
    websocket: WebSocket,
    user_id: int = Depends(get_current_user)
):
    """Global WebSocket endpoint for real-time data updates"""
    await global_ws_manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await global_ws_manager.send_to_connection(websocket, {
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    })
                
                elif message.get("type") == "request_data_sources":
                    await handle_data_sources_request(websocket, user_id)
                
                elif message.get("type") == "request_user_data":
                    await handle_user_data_request(websocket, user_id)
                
                elif message.get("type") == "request_notifications":
                    await handle_notifications_request(websocket, user_id)
                
                elif message.get("type") == "request_workspace_data":
                    await handle_workspace_data_request(websocket, user_id)
                
                elif message.get("type") == "request_data_source_metrics":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_data_source_metrics_request(websocket, data_source_id)
                
                elif message.get("type") == "request_data_source_health":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_data_source_health_request(websocket, data_source_id)
                
                elif message.get("type") == "request_discovery_history":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_discovery_history_request(websocket, data_source_id)
                
                elif message.get("type") == "request_scan_results":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_scan_results_request(websocket, data_source_id)
                
                elif message.get("type") == "request_quality_metrics":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_quality_metrics_request(websocket, data_source_id)
                
                elif message.get("type") == "request_growth_metrics":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_growth_metrics_request(websocket, data_source_id)
                
                elif message.get("type") == "request_schema_discovery":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_schema_discovery_request(websocket, data_source_id)
                
                elif message.get("type") == "request_data_lineage":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_data_lineage_request(websocket, data_source_id)
                
                elif message.get("type") == "request_backup_status":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_backup_status_request(websocket, data_source_id)
                
                elif message.get("type") == "request_scheduled_tasks":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_scheduled_tasks_request(websocket, data_source_id)
                
                elif message.get("type") == "request_audit_logs":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_audit_logs_request(websocket, data_source_id)
                
                elif message.get("type") == "request_user_permissions":
                    await handle_user_permissions_request(websocket, user_id)
                
                elif message.get("type") == "request_data_catalog":
                    await handle_data_catalog_request(websocket, user_id)
                
                # Collaboration requests
                elif message.get("type") == "request_collaboration_workspaces":
                    await handle_collaboration_workspaces_request(websocket, user_id)
                
                elif message.get("type") == "request_active_collaboration_sessions":
                    await handle_active_collaboration_sessions_request(websocket, user_id)
                
                elif message.get("type") == "request_shared_documents":
                    data = message.get("data", {})
                    data_source_id = data.get("dataSourceId")
                    document_type = data.get("documentType", "all")
                    if data_source_id:
                        await handle_shared_documents_request(websocket, data_source_id, document_type)
                
                elif message.get("type") == "request_document_comments":
                    document_id = message.get("data", {}).get("documentId")
                    if document_id:
                        await handle_document_comments_request(websocket, document_id)
                
                elif message.get("type") == "request_workspace_activity":
                    data = message.get("data", {})
                    workspace_id = data.get("workspaceId")
                    days = data.get("days", 7)
                    if workspace_id:
                        await handle_workspace_activity_request(websocket, workspace_id, days)
                
                # Workflow requests
                elif message.get("type") == "request_workflow_definitions":
                    await handle_workflow_definitions_request(websocket, user_id)
                
                elif message.get("type") == "request_workflow_executions":
                    days = message.get("data", {}).get("days", 7)
                    await handle_workflow_executions_request(websocket, user_id, days)
                
                elif message.get("type") == "request_pending_approvals":
                    await handle_pending_approvals_request(websocket, user_id)
                
                elif message.get("type") == "request_workflow_templates":
                    await handle_workflow_templates_request(websocket, user_id)
                
                elif message.get("type") == "request_bulk_operation_status":
                    await handle_bulk_operation_status_request(websocket, user_id)
                
                # Performance requests
                elif message.get("type") == "request_system_health":
                    await handle_system_health_request(websocket)
                
                elif message.get("type") == "request_enhanced_performance_metrics":
                    data = message.get("data", {})
                    data_source_id = data.get("dataSourceId")
                    time_range = data.get("timeRange", "24h")
                    metric_types = data.get("metricTypes", ["cpu", "memory", "io", "network"])
                    if data_source_id:
                        await handle_enhanced_performance_metrics_request(websocket, data_source_id, time_range, metric_types)
                
                elif message.get("type") == "request_performance_alerts":
                    data = message.get("data", {})
                    severity = data.get("severity", "all")
                    days = data.get("days", 7)
                    await handle_performance_alerts_request(websocket, severity, days)
                
                elif message.get("type") == "request_performance_trends":
                    data = message.get("data", {})
                    data_source_id = data.get("dataSourceId")
                    period = data.get("period", "30d")
                    if data_source_id:
                        await handle_performance_trends_request(websocket, data_source_id, period)
                
                elif message.get("type") == "request_optimization_recommendations":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_optimization_recommendations_request(websocket, data_source_id)
                
                elif message.get("type") == "request_performance_summary_report":
                    time_range = message.get("data", {}).get("timeRange", "7d")
                    await handle_performance_summary_report_request(websocket, time_range)
                
                elif message.get("type") == "request_performance_thresholds":
                    data_source_id = message.get("data", {}).get("dataSourceId")
                    if data_source_id:
                        await handle_performance_thresholds_request(websocket, data_source_id)
                
                # Security requests
                elif message.get("type") == "request_enhanced_security_audit":
                    data = message.get("data", {})
                    data_source_id = data.get("dataSourceId")
                    include_vulnerabilities = data.get("includeVulnerabilities", True)
                    include_compliance = data.get("includeCompliance", True)
                    if data_source_id:
                        await handle_enhanced_security_audit_request(websocket, data_source_id, include_vulnerabilities, include_compliance)
                
                elif message.get("type") == "request_vulnerability_assessments":
                    severity = message.get("data", {}).get("severity", "all")
                    await handle_vulnerability_assessments_request(websocket, severity)
                
                elif message.get("type") == "request_security_incidents":
                    days = message.get("data", {}).get("days", 30)
                    await handle_security_incidents_request(websocket, days)
                
                elif message.get("type") == "request_compliance_checks":
                    await handle_compliance_checks_request(websocket, user_id)
                
                elif message.get("type") == "request_threat_detection":
                    days = message.get("data", {}).get("days", 7)
                    await handle_threat_detection_request(websocket, days)
                
                elif message.get("type") == "request_security_analytics_dashboard":
                    period = message.get("data", {}).get("period", "7d")
                    await handle_security_analytics_dashboard_request(websocket, period)
                
                elif message.get("type") == "request_risk_assessment_report":
                    await handle_risk_assessment_report_request(websocket, user_id)
                
                elif message.get("type") == "request_security_scans":
                    days = message.get("data", {}).get("days", 30)
                    await handle_security_scans_request(websocket, days)
                
                else:
                    logger.warning(f"Unknown message type: {message.get('type')}")
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
                
    finally:
        await global_ws_manager.disconnect(websocket)

# Request handlers
async def handle_data_sources_request(websocket: WebSocket, user_id: int):
    """Handle data sources request"""
    try:
        # Check cache first
        cache_key = f"data_sources_{user_id}"
        cached_data = global_ws_manager.get_cached_data(cache_key, max_age_seconds=300)
        
        if cached_data:
            await global_ws_manager.send_to_connection(websocket, {
                "type": "data_sources_updated",
                "data": cached_data,
                "timestamp": datetime.now().isoformat()
            })
            return
        
        # Fetch fresh data
        from app.services.data_source_service import DataSourceService
        data_sources = DataSourceService.list_data_sources()
        
        # Cache the data
        global_ws_manager.cache_data(cache_key, data_sources)
        
        await global_ws_manager.send_to_connection(websocket, {
            "type": "data_sources_updated",
            "data": data_sources,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error handling data sources request: {e}")
        await global_ws_manager.send_to_connection(websocket, {
            "type": "error",
            "data": {"message": "Failed to fetch data sources", "error": str(e)},
            "timestamp": datetime.now().isoformat()
        })

async def handle_user_data_request(websocket: WebSocket, user_id: int):
    """Handle user data request"""
    try:
        cache_key = f"user_data_{user_id}"
        cached_data = global_ws_manager.get_cached_data(cache_key, max_age_seconds=300)
        
        if cached_data:
            await global_ws_manager.send_to_connection(websocket, {
                "type": "user_data_updated",
                "data": cached_data,
                "timestamp": datetime.now().isoformat()
            })
            return
        
        # Fetch fresh user data
        from app.models.auth_models import User
        from app.db_session import get_session
        
        with get_session() as db:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user_data = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "permissions": user.permissions
                }
                
                global_ws_manager.cache_data(cache_key, user_data)
                
                await global_ws_manager.send_to_connection(websocket, {
                    "type": "user_data_updated",
                    "data": user_data,
                    "timestamp": datetime.now().isoformat()
                })
        
    except Exception as e:
        logger.error(f"Error handling user data request: {e}")
        await global_ws_manager.send_to_connection(websocket, {
            "type": "error",
            "data": {"message": "Failed to fetch user data", "error": str(e)},
            "timestamp": datetime.now().isoformat()
        })

async def handle_notifications_request(websocket: WebSocket, user_id: int):
    """Handle notifications request"""
    try:
        cache_key = f"notifications_{user_id}"
        cached_data = global_ws_manager.get_cached_data(cache_key, max_age_seconds=60)
        
        if cached_data:
            await global_ws_manager.send_to_connection(websocket, {
                "type": "notifications_updated",
                "data": cached_data,
                "timestamp": datetime.now().isoformat()
            })
            return
        
        # Fetch fresh notifications
        from app.services.notification_service import NotificationService
        notifications = NotificationService.get_user_notifications(user_id)
        
        global_ws_manager.cache_data(cache_key, notifications)
        
        await global_ws_manager.send_to_connection(websocket, {
            "type": "notifications_updated",
            "data": notifications,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error handling notifications request: {e}")
        await global_ws_manager.send_to_connection(websocket, {
            "type": "error",
            "data": {"message": "Failed to fetch notifications", "error": str(e)},
            "timestamp": datetime.now().isoformat()
        })

# Add more request handlers for other data types...
# (Implementation would continue with similar patterns for all data types)

async def handle_workspace_data_request(websocket: WebSocket, user_id: int):
    """Handle workspace data request"""
    # Implementation for workspace data
    pass

async def handle_data_source_metrics_request(websocket: WebSocket, data_source_id: int):
    """Handle data source metrics request"""
    # Implementation for data source metrics
    pass

async def handle_data_source_health_request(websocket: WebSocket, data_source_id: int):
    """Handle data source health request"""
    # Implementation for data source health
    pass

async def handle_discovery_history_request(websocket: WebSocket, data_source_id: int):
    """Handle discovery history request"""
    # Implementation for discovery history
    pass

async def handle_scan_results_request(websocket: WebSocket, data_source_id: int):
    """Handle scan results request"""
    # Implementation for scan results
    pass

async def handle_quality_metrics_request(websocket: WebSocket, data_source_id: int):
    """Handle quality metrics request"""
    # Implementation for quality metrics
    pass

async def handle_growth_metrics_request(websocket: WebSocket, data_source_id: int):
    """Handle growth metrics request"""
    # Implementation for growth metrics
    pass

async def handle_schema_discovery_request(websocket: WebSocket, data_source_id: int):
    """Handle schema discovery request"""
    # Implementation for schema discovery
    pass

async def handle_data_lineage_request(websocket: WebSocket, data_source_id: int):
    """Handle data lineage request"""
    # Implementation for data lineage
    pass

async def handle_backup_status_request(websocket: WebSocket, data_source_id: int):
    """Handle backup status request"""
    # Implementation for backup status
    pass

async def handle_scheduled_tasks_request(websocket: WebSocket, data_source_id: int):
    """Handle scheduled tasks request"""
    # Implementation for scheduled tasks
    pass

async def handle_audit_logs_request(websocket: WebSocket, data_source_id: int):
    """Handle audit logs request"""
    # Implementation for audit logs
    pass

async def handle_user_permissions_request(websocket: WebSocket, user_id: int):
    """Handle user permissions request"""
    # Implementation for user permissions
    pass

async def handle_data_catalog_request(websocket: WebSocket, user_id: int):
    """Handle data catalog request"""
    # Implementation for data catalog
    pass

# Collaboration request handlers
async def handle_collaboration_workspaces_request(websocket: WebSocket, user_id: int):
    """Handle collaboration workspaces request"""
    # Implementation for collaboration workspaces
    pass

async def handle_active_collaboration_sessions_request(websocket: WebSocket, user_id: int):
    """Handle active collaboration sessions request"""
    # Implementation for active collaboration sessions
    pass

async def handle_shared_documents_request(websocket: WebSocket, data_source_id: int, document_type: str):
    """Handle shared documents request"""
    # Implementation for shared documents
    pass

async def handle_document_comments_request(websocket: WebSocket, document_id: str):
    """Handle document comments request"""
    # Implementation for document comments
    pass

async def handle_workspace_activity_request(websocket: WebSocket, workspace_id: str, days: int):
    """Handle workspace activity request"""
    # Implementation for workspace activity
    pass

# Workflow request handlers
async def handle_workflow_definitions_request(websocket: WebSocket, user_id: int):
    """Handle workflow definitions request"""
    # Implementation for workflow definitions
    pass

async def handle_workflow_executions_request(websocket: WebSocket, user_id: int, days: int):
    """Handle workflow executions request"""
    # Implementation for workflow executions
    pass

async def handle_pending_approvals_request(websocket: WebSocket, user_id: int):
    """Handle pending approvals request"""
    # Implementation for pending approvals
    pass

async def handle_workflow_templates_request(websocket: WebSocket, user_id: int):
    """Handle workflow templates request"""
    # Implementation for workflow templates
    pass

async def handle_bulk_operation_status_request(websocket: WebSocket, user_id: int):
    """Handle bulk operation status request"""
    # Implementation for bulk operation status
    pass

# Performance request handlers
async def handle_system_health_request(websocket: WebSocket):
    """Handle system health request"""
    # Implementation for system health
    pass

async def handle_enhanced_performance_metrics_request(websocket: WebSocket, data_source_id: int, time_range: str, metric_types: List[str]):
    """Handle enhanced performance metrics request"""
    # Implementation for enhanced performance metrics
    pass

async def handle_performance_alerts_request(websocket: WebSocket, severity: str, days: int):
    """Handle performance alerts request"""
    # Implementation for performance alerts
    pass

async def handle_performance_trends_request(websocket: WebSocket, data_source_id: int, period: str):
    """Handle performance trends request"""
    # Implementation for performance trends
    pass

async def handle_optimization_recommendations_request(websocket: WebSocket, data_source_id: int):
    """Handle optimization recommendations request"""
    # Implementation for optimization recommendations
    pass

async def handle_performance_summary_report_request(websocket: WebSocket, time_range: str):
    """Handle performance summary report request"""
    # Implementation for performance summary report
    pass

async def handle_performance_thresholds_request(websocket: WebSocket, data_source_id: int):
    """Handle performance thresholds request"""
    # Implementation for performance thresholds
    pass

# Security request handlers
async def handle_enhanced_security_audit_request(websocket: WebSocket, data_source_id: int, include_vulnerabilities: bool, include_compliance: bool):
    """Handle enhanced security audit request"""
    # Implementation for enhanced security audit
    pass

async def handle_vulnerability_assessments_request(websocket: WebSocket, severity: str):
    """Handle vulnerability assessments request"""
    # Implementation for vulnerability assessments
    pass

async def handle_security_incidents_request(websocket: WebSocket, days: int):
    """Handle security incidents request"""
    # Implementation for security incidents
    pass

async def handle_compliance_checks_request(websocket: WebSocket, user_id: int):
    """Handle compliance checks request"""
    # Implementation for compliance checks
    pass

async def handle_threat_detection_request(websocket: WebSocket, days: int):
    """Handle threat detection request"""
    # Implementation for threat detection
    pass

async def handle_security_analytics_dashboard_request(websocket: WebSocket, period: str):
    """Handle security analytics dashboard request"""
    # Implementation for security analytics dashboard
    pass

async def handle_risk_assessment_report_request(websocket: WebSocket, user_id: int):
    """Handle risk assessment report request"""
    # Implementation for risk assessment report
    pass

async def handle_security_scans_request(websocket: WebSocket, days: int):
    """Handle security scans request"""
    # Implementation for security scans
    pass

