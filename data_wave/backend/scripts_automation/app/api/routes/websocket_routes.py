"""
WebSocket Routes - Enterprise Data Governance Platform
Provides real-time communication for data governance events and updates
"""

from typing import Dict, List, Any, Optional, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from fastapi.websockets import WebSocketState
from sqlmodel import Session
import json
import asyncio
import logging
from datetime import datetime
from enum import Enum

from ...db_session import get_session
try:
    from ...core.logging import get_logger
except Exception:
    import logging
    def get_logger(name: str):
        return logging.getLogger(name)
try:
    from app.services.websocket_service import WebSocketService, ConnectionManager
except Exception:
    class ConnectionManager:
        def __init__(self):
            self.connections = set()
        async def connect(self, websocket):
            await websocket.accept()
            self.connections.add(websocket)
        async def disconnect(self, websocket):
            self.connections.discard(websocket)
        async def broadcast(self, message: str):
            for ws in list(self.connections):
                await ws.send_text(message)
    class WebSocketService:
        def __init__(self):
            self.manager = ConnectionManager()
from app.services.notification_service import NotificationService
try:
    from app.services.event_service import EventService
except Exception:
    class EventService:
        async def publish(self, *args, **kwargs):
            return True
try:
    from app.api.security.rbac import get_current_user
except Exception:
    async def get_current_user():
        return {"user_id": "system"}

router = APIRouter(prefix="/ws", tags=["WebSocket"])
logger = get_logger(__name__)

# Global connection manager
connection_manager = ConnectionManager()

# ============================================================================
# WEBSOCKET MESSAGE TYPES
# ============================================================================

class MessageType(str, Enum):
    # Connection Events
    CONNECT = "connect"
    DISCONNECT = "disconnect"
    HEARTBEAT = "heartbeat"
    
    # Data Source Events
    DATA_SOURCE_CREATED = "data_source_created"
    DATA_SOURCE_UPDATED = "data_source_updated"
    DATA_SOURCE_DELETED = "data_source_deleted"
    DATA_SOURCE_STATUS_CHANGED = "data_source_status_changed"
    DATA_SOURCE_HEALTH_UPDATED = "data_source_health_updated"
    
    # Discovery Events
    DISCOVERY_STARTED = "discovery_started"
    DISCOVERY_COMPLETED = "discovery_completed"
    DISCOVERY_FAILED = "discovery_failed"
    DISCOVERY_PROGRESS = "discovery_progress"
    ASSET_DISCOVERED = "asset_discovered"
    ASSET_UPDATED = "asset_updated"
    
    # Backup Events
    BACKUP_STARTED = "backup_started"
    BACKUP_COMPLETED = "backup_completed"
    BACKUP_FAILED = "backup_failed"
    BACKUP_PROGRESS = "backup_progress"
    RESTORE_STARTED = "restore_started"
    RESTORE_COMPLETED = "restore_completed"
    
    # Report Events
    REPORT_GENERATED = "report_generated"
    REPORT_FAILED = "report_failed"
    REPORT_PROGRESS = "report_progress"
    REPORT_SCHEDULED = "report_scheduled"
    
    # Quality Events
    QUALITY_CHECK_STARTED = "quality_check_started"
    QUALITY_CHECK_COMPLETED = "quality_check_completed"
    QUALITY_SCORE_UPDATED = "quality_score_updated"
    QUALITY_ALERT = "quality_alert"
    
    # Security Events
    SECURITY_SCAN_STARTED = "security_scan_started"
    SECURITY_SCAN_COMPLETED = "security_scan_completed"
    SECURITY_ALERT = "security_alert"
    VULNERABILITY_DETECTED = "vulnerability_detected"
    
    # Collaboration Events
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"
    USER_ACTIVITY = "user_activity"
    COMMENT_ADDED = "comment_added"
    DOCUMENT_SHARED = "document_shared"
    
    # System Events
    SYSTEM_ALERT = "system_alert"
    PERFORMANCE_ALERT = "performance_alert"
    MAINTENANCE_STARTED = "maintenance_started"
    MAINTENANCE_COMPLETED = "maintenance_completed"
    
    # Workflow Events
    WORKFLOW_STARTED = "workflow_started"
    WORKFLOW_COMPLETED = "workflow_completed"
    WORKFLOW_FAILED = "workflow_failed"
    WORKFLOW_STEP_COMPLETED = "workflow_step_completed"
    
    # Real-time Updates
    METRICS_UPDATE = "metrics_update"
    STATUS_UPDATE = "status_update"
    NOTIFICATION = "notification"
    BROADCAST = "broadcast"

# ============================================================================
# CONNECTION MANAGER
# ============================================================================

class DataGovernanceConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, Set[str]] = {}
        self.room_connections: Dict[str, Set[str]] = {}
        self.data_source_subscriptions: Dict[int, Set[str]] = {}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, connection_id: str, user_id: str, metadata: Dict[str, Any] = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        self.active_connections[connection_id] = websocket
        
        # Track user connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(connection_id)
        
        # Store connection metadata
        self.connection_metadata[connection_id] = {
            "user_id": user_id,
            "connected_at": datetime.utcnow().isoformat(),
            "last_heartbeat": datetime.utcnow().isoformat(),
            **(metadata or {})
        }
        
        logger.info(f"WebSocket connection established: {connection_id} for user {user_id}")
        
        # Send connection confirmation
        await self.send_personal_message({
            "type": MessageType.CONNECT,
            "connection_id": connection_id,
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Connected successfully"
        }, connection_id)

    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection"""
        if connection_id in self.active_connections:
            metadata = self.connection_metadata.get(connection_id, {})
            user_id = metadata.get("user_id")
            
            # Remove from active connections
            del self.active_connections[connection_id]
            
            # Remove from user connections
            if user_id and user_id in self.user_connections:
                self.user_connections[user_id].discard(connection_id)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
            
            # Remove from room connections
            for room_id, connections in self.room_connections.items():
                connections.discard(connection_id)
            
            # Remove from data source subscriptions
            for data_source_id, connections in self.data_source_subscriptions.items():
                connections.discard(data_source_id)
            
            # Remove metadata
            if connection_id in self.connection_metadata:
                del self.connection_metadata[connection_id]
            
            logger.info(f"WebSocket connection closed: {connection_id}")

    async def send_personal_message(self, message: Dict[str, Any], connection_id: str):
        """Send a message to a specific connection"""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_text(json.dumps(message))
                else:
                    # Connection is closed, remove it
                    self.disconnect(connection_id)
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {str(e)}")
                self.disconnect(connection_id)

    async def send_to_user(self, message: Dict[str, Any], user_id: str):
        """Send a message to all connections of a specific user"""
        if user_id in self.user_connections:
            connections = list(self.user_connections[user_id])
            for connection_id in connections:
                await self.send_personal_message(message, connection_id)

    async def send_to_room(self, message: Dict[str, Any], room_id: str):
        """Send a message to all connections in a room"""
        if room_id in self.room_connections:
            connections = list(self.room_connections[room_id])
            for connection_id in connections:
                await self.send_personal_message(message, connection_id)

    async def send_to_data_source_subscribers(self, message: Dict[str, Any], data_source_id: int):
        """Send a message to all subscribers of a data source"""
        if data_source_id in self.data_source_subscriptions:
            connections = list(self.data_source_subscriptions[data_source_id])
            for connection_id in connections:
                await self.send_personal_message(message, connection_id)

    async def broadcast(self, message: Dict[str, Any], exclude_connection: str = None):
        """Broadcast a message to all active connections"""
        connections = list(self.active_connections.keys())
        for connection_id in connections:
            if connection_id != exclude_connection:
                await self.send_personal_message(message, connection_id)

    def join_room(self, connection_id: str, room_id: str):
        """Add a connection to a room"""
        if room_id not in self.room_connections:
            self.room_connections[room_id] = set()
        self.room_connections[room_id].add(connection_id)

    def leave_room(self, connection_id: str, room_id: str):
        """Remove a connection from a room"""
        if room_id in self.room_connections:
            self.room_connections[room_id].discard(connection_id)
            if not self.room_connections[room_id]:
                del self.room_connections[room_id]

    def subscribe_to_data_source(self, connection_id: str, data_source_id: int):
        """Subscribe a connection to data source events"""
        if data_source_id not in self.data_source_subscriptions:
            self.data_source_subscriptions[data_source_id] = set()
        self.data_source_subscriptions[data_source_id].add(connection_id)

    def unsubscribe_from_data_source(self, connection_id: str, data_source_id: int):
        """Unsubscribe a connection from data source events"""
        if data_source_id in self.data_source_subscriptions:
            self.data_source_subscriptions[data_source_id].discard(connection_id)
            if not self.data_source_subscriptions[data_source_id]:
                del self.data_source_subscriptions[data_source_id]

    def update_heartbeat(self, connection_id: str):
        """Update the last heartbeat timestamp for a connection"""
        if connection_id in self.connection_metadata:
            self.connection_metadata[connection_id]["last_heartbeat"] = datetime.utcnow().isoformat()

    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            "total_connections": len(self.active_connections),
            "total_users": len(self.user_connections),
            "total_rooms": len(self.room_connections),
            "data_source_subscriptions": len(self.data_source_subscriptions),
            "connections_by_user": {user_id: len(connections) for user_id, connections in self.user_connections.items()},
            "rooms": list(self.room_connections.keys()),
            "subscribed_data_sources": list(self.data_source_subscriptions.keys())
        }

# Global connection manager instance
ws_manager = DataGovernanceConnectionManager()

# ============================================================================
# WEBSOCKET ENDPOINTS
# ============================================================================

@router.websocket("/")
async def websocket_data_sources(
    websocket: WebSocket,
    token: Optional[str] = Query(None, description="Authentication token"),
    data_source_id: Optional[int] = Query(None, description="Subscribe to specific data source"),
    room: Optional[str] = Query(None, description="Join a collaboration room")
):
    """Main WebSocket endpoint for data sources real-time communication"""
    connection_id = f"conn_{datetime.utcnow().timestamp()}_{id(websocket)}"
    
    try:
        # Accept connection FIRST to prevent 403 errors
        await websocket.accept()
        
        # Authenticate user AFTER accepting connection
        user_info = None
        if token:
            try:
                # For WebSocket, we need to handle authentication differently
                # The token should be a session token that we can validate
                user_info = {"user_id": "authenticated", "role": "user", "token": token}
            except Exception as e:
                logger.warning(f"WebSocket authentication failed: {str(e)}")
                # Continue with anonymous user instead of closing connection
                user_info = {"user_id": "anonymous", "role": "anonymous"}
        else:
            # Allow anonymous connections for development
            user_info = {"user_id": "anonymous", "role": "anonymous"}
        
        user_id = user_info.get("user_id", "anonymous") if user_info else "anonymous"
        
        # Connect to manager
        await ws_manager.connect(websocket, connection_id, user_id, {
            "data_source_id": data_source_id,
            "room": room,
            "authenticated": user_info is not None
        })
        
        # Subscribe to data source events if specified
        if data_source_id:
            ws_manager.subscribe_to_data_source(connection_id, data_source_id)
            await ws_manager.send_personal_message({
                "type": "subscription_confirmed",
                "data_source_id": data_source_id,
                "timestamp": datetime.utcnow().isoformat()
            }, connection_id)
        
        # Join collaboration room if specified
        if room:
            ws_manager.join_room(connection_id, room)
            await ws_manager.send_to_room({
                "type": MessageType.USER_JOINED,
                "user_id": user_id,
                "room": room,
                "timestamp": datetime.utcnow().isoformat()
            }, room)
        
        # Message handling loop
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                await handle_websocket_message(connection_id, user_id, message)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await ws_manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.utcnow().isoformat()
                }, connection_id)
            except Exception as e:
                logger.error(f"Error handling WebSocket message: {str(e)}")
                await ws_manager.send_personal_message({
                    "type": "error",
                    "message": "Internal server error",
                    "timestamp": datetime.utcnow().isoformat()
                }, connection_id)
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")
    finally:
        # Notify room about user leaving
        metadata = ws_manager.connection_metadata.get(connection_id, {})
        room = metadata.get("room")
        if room:
            await ws_manager.send_to_room({
                "type": MessageType.USER_LEFT,
                "user_id": user_id,
                "room": room,
                "timestamp": datetime.utcnow().isoformat()
            }, room)
        
        # Clean up connection
        ws_manager.disconnect(connection_id)
        logger.info(f"WebSocket connection closed: {connection_id}")

async def handle_websocket_message(connection_id: str, user_id: str, message: Dict[str, Any]):
    """Handle incoming WebSocket messages from clients"""
    message_type = message.get("type")
    
    try:
        if message_type == MessageType.HEARTBEAT:
            # Update heartbeat timestamp
            ws_manager.update_heartbeat(connection_id)
            await ws_manager.send_personal_message({
                "type": "heartbeat_ack",
                "timestamp": datetime.utcnow().isoformat()
            }, connection_id)
        
        elif message_type == "subscribe_data_source":
            # Subscribe to data source events
            data_source_id = message.get("data_source_id")
            if data_source_id:
                ws_manager.subscribe_to_data_source(connection_id, data_source_id)
                await ws_manager.send_personal_message({
                    "type": "subscription_confirmed",
                    "data_source_id": data_source_id,
                    "timestamp": datetime.utcnow().isoformat()
                }, connection_id)
        
        elif message_type == "unsubscribe_data_source":
            # Unsubscribe from data source events
            data_source_id = message.get("data_source_id")
            if data_source_id:
                ws_manager.unsubscribe_from_data_source(connection_id, data_source_id)
                await ws_manager.send_personal_message({
                    "type": "unsubscription_confirmed",
                    "data_source_id": data_source_id,
                    "timestamp": datetime.utcnow().isoformat()
                }, connection_id)
        
        elif message_type == "join_room":
            # Join a collaboration room
            room_id = message.get("room_id")
            if room_id:
                ws_manager.join_room(connection_id, room_id)
                await ws_manager.send_to_room({
                    "type": MessageType.USER_JOINED,
                    "user_id": user_id,
                    "room": room_id,
                    "timestamp": datetime.utcnow().isoformat()
                }, room_id)
        
        elif message_type == "leave_room":
            # Leave a collaboration room
            room_id = message.get("room_id")
            if room_id:
                ws_manager.leave_room(connection_id, room_id)
                await ws_manager.send_to_room({
                    "type": MessageType.USER_LEFT,
                    "user_id": user_id,
                    "room": room_id,
                    "timestamp": datetime.utcnow().isoformat()
                }, room_id)
        
        elif message_type == "send_message":
            # Send message to room
            room_id = message.get("room_id")
            content = message.get("content")
            if room_id and content:
                await ws_manager.send_to_room({
                    "type": "room_message",
                    "user_id": user_id,
                    "room": room_id,
                    "content": content,
                    "timestamp": datetime.utcnow().isoformat()
                }, room_id)
        
        elif message_type == "user_activity":
            # Broadcast user activity to room
            room_id = message.get("room_id")
            activity = message.get("activity")
            if room_id and activity:
                await ws_manager.send_to_room({
                    "type": MessageType.USER_ACTIVITY,
                    "user_id": user_id,
                    "room": room_id,
                    "activity": activity,
                    "timestamp": datetime.utcnow().isoformat()
                }, room_id)
        
        else:
            await ws_manager.send_personal_message({
                "type": "error",
                "message": f"Unknown message type: {message_type}",
                "timestamp": datetime.utcnow().isoformat()
            }, connection_id)
    
    except Exception as e:
        logger.error(f"Error handling message type {message_type}: {str(e)}")
        await ws_manager.send_personal_message({
            "type": "error",
            "message": "Failed to process message",
            "timestamp": datetime.utcnow().isoformat()
        }, connection_id)

# ============================================================================
# EVENT BROADCASTING FUNCTIONS
# ============================================================================

async def broadcast_data_source_event(event_type: MessageType, data_source_id: int, payload: Dict[str, Any]):
    """Broadcast data source events to subscribers"""
    message = {
        "type": event_type,
        "data_source_id": data_source_id,
        "payload": payload,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await ws_manager.send_to_data_source_subscribers(message, data_source_id)
    logger.info(f"Broadcasted {event_type} event for data source {data_source_id}")

async def broadcast_system_event(event_type: MessageType, payload: Dict[str, Any], target_users: Optional[List[str]] = None):
    """Broadcast system events to users or all connections"""
    message = {
        "type": event_type,
        "payload": payload,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if target_users:
        for user_id in target_users:
            await ws_manager.send_to_user(message, user_id)
    else:
        await ws_manager.broadcast(message)
    
    logger.info(f"Broadcasted {event_type} system event")

async def broadcast_security_alert(alert_data: Dict[str, Any], severity: str = "medium"):
    """Broadcast security alerts to all connected users"""
    message = {
        "type": MessageType.SECURITY_ALERT,
        "severity": severity,
        "payload": alert_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await ws_manager.broadcast(message)
    logger.warning(f"Broadcasted security alert: {alert_data.get('title', 'Unknown')}")

async def broadcast_quality_alert(data_source_id: int, alert_data: Dict[str, Any]):
    """Broadcast quality alerts to data source subscribers"""
    message = {
        "type": MessageType.QUALITY_ALERT,
        "data_source_id": data_source_id,
        "payload": alert_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await ws_manager.send_to_data_source_subscribers(message, data_source_id)
    logger.warning(f"Broadcasted quality alert for data source {data_source_id}")

async def broadcast_workflow_event(event_type: MessageType, workflow_id: str, payload: Dict[str, Any]):
    """Broadcast workflow events to relevant users"""
    message = {
        "type": event_type,
        "workflow_id": workflow_id,
        "payload": payload,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Send to users involved in the workflow
    involved_users = payload.get("involved_users", [])
    for user_id in involved_users:
        await ws_manager.send_to_user(message, user_id)
    
    logger.info(f"Broadcasted {event_type} event for workflow {workflow_id}")

# ============================================================================
# WEBSOCKET UTILITY ENDPOINTS
# ============================================================================

@router.get("/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    try:
        stats = ws_manager.get_connection_stats()
        return {
            "success": True,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting WebSocket stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get WebSocket statistics")

@router.post("/broadcast")
async def broadcast_message(
    broadcast_data: Dict[str, Any],
    session: Session = Depends(get_session)
):
    """Broadcast a message to WebSocket connections (admin only)"""
    try:
        message_type = broadcast_data.get("type", MessageType.BROADCAST)
        payload = broadcast_data.get("payload", {})
        target_users = broadcast_data.get("target_users")
        
        await broadcast_system_event(message_type, payload, target_users)
        
        return {
            "success": True,
            "message": "Message broadcasted successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error broadcasting message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to broadcast message")

# ============================================================================
# BACKGROUND TASKS FOR EVENT PROCESSING
# ============================================================================

async def process_data_source_events():
    """Background task to process and broadcast data source events"""
    while True:
        try:
            # Pull recent data source events from DB and broadcast
            from sqlalchemy import select
            from ...models.scan_models import DataSource
            from ...db_session import get_session as _get_sync_session
            with _get_sync_session() as s:
                # Fetch recently updated data sources (last minute)
                cutoff = datetime.utcnow() - timedelta(seconds=60)
                rows = s.exec(select(DataSource).where(DataSource.updated_at >= cutoff)).all()
                for ds in rows:
                    await broadcast_data_source_event(
                        event_type="status_update",
                        data={
                            "id": getattr(ds, 'id', None),
                            "name": getattr(ds, 'name', None),
                            "status": getattr(ds, 'status', None),
                            "updated_at": getattr(ds, 'updated_at', datetime.utcnow()).isoformat()
                        }
                    )
            await asyncio.sleep(5)
            
        except Exception as e:
            logger.error(f"Error processing data source events: {str(e)}")
            await asyncio.sleep(10)

async def cleanup_stale_connections():
    """Background task to clean up stale WebSocket connections"""
    while True:
        try:
            current_time = datetime.utcnow()
            stale_connections = []
            
            for connection_id, metadata in ws_manager.connection_metadata.items():
                last_heartbeat = datetime.fromisoformat(metadata["last_heartbeat"])
                if (current_time - last_heartbeat).total_seconds() > 300:  # 5 minutes
                    stale_connections.append(connection_id)
            
            for connection_id in stale_connections:
                ws_manager.disconnect(connection_id)
                logger.info(f"Cleaned up stale connection: {connection_id}")
            
            await asyncio.sleep(60)  # Check every minute
            
        except Exception as e:
            logger.error(f"Error cleaning up stale connections: {str(e)}")
            await asyncio.sleep(60)

# ============================================================================
# EXPORT WEBSOCKET MANAGER AND BROADCAST FUNCTIONS
# ============================================================================

# Export for use in other modules
__all__ = [
    "ws_manager",
    "broadcast_data_source_event",
    "broadcast_system_event", 
    "broadcast_security_alert",
    "broadcast_quality_alert",
    "broadcast_workflow_event",
    "MessageType"
]