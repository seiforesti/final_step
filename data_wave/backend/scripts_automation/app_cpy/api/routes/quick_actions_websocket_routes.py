"""
Quick Actions WebSocket Routes - Enterprise Data Governance Platform
==================================================================

Real-time WebSocket endpoints for quick actions operations, providing
live updates on action execution, shortcuts, favorites, and analytics.

This module integrates with the existing quick actions services to provide
real-time communication capabilities for the frontend.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from fastapi.websockets import WebSocketState

# Use existing authentication pattern from websocket_routes.py
try:
    from app.api.security.rbac import get_current_user
except Exception:
    async def get_current_user():
        return {"user_id": "system"}

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/ws", tags=["quick-actions-websocket"])

# Connection manager for quick actions WebSocket connections
class QuickActionsConnectionManager:
    """Manages WebSocket connections for quick actions operations"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        self.user_subscriptions: Dict[str, List[str]] = {}  # user_id -> action_categories
        
    async def connect(self, websocket: WebSocket, connection_id: str, user_id: str, metadata: Dict[str, Any] = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        self.connection_metadata[connection_id] = {
            "user_id": user_id,
            "connected_at": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        logger.info(f"Quick Actions WebSocket connected: {connection_id} for user {user_id}")
        
    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection"""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        if connection_id in self.connection_metadata:
            del self.connection_metadata[connection_id]
        logger.info(f"Quick Actions WebSocket disconnected: {connection_id}")
        
    async def send_personal_message(self, message: Dict[str, Any], connection_id: str):
        """Send a message to a specific connection"""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send message to {connection_id}: {e}")
                    self.disconnect(connection_id)
                    
    async def broadcast_to_user(self, message: Dict[str, Any], user_id: str):
        """Broadcast a message to all connections for a specific user"""
        disconnected_connections = []
        
        for connection_id, metadata in self.connection_metadata.items():
            if metadata.get("user_id") == user_id:
                try:
                    await self.send_personal_message(message, connection_id)
                except Exception as e:
                    logger.error(f"Failed to broadcast to {connection_id}: {e}")
                    disconnected_connections.append(connection_id)
                    
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            self.disconnect(connection_id)
            
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast a message to all active connections"""
        disconnected_connections = []
        
        for connection_id in self.active_connections.keys():
            try:
                await self.send_personal_message(message, connection_id)
            except Exception as e:
                logger.error(f"Failed to broadcast to {connection_id}: {e}")
                disconnected_connections.append(connection_id)
                
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            self.disconnect(connection_id)
            
    def subscribe_user_to_category(self, user_id: str, category: str):
        """Subscribe a user to a specific action category"""
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = []
        if category not in self.user_subscriptions[user_id]:
            self.user_subscriptions[user_id].append(category)
            
    def unsubscribe_user_from_category(self, user_id: str, category: str):
        """Unsubscribe a user from a specific action category"""
        if user_id in self.user_subscriptions:
            if category in self.user_subscriptions[user_id]:
                self.user_subscriptions[user_id].remove(category)

# Global connection manager instance
quick_actions_ws_manager = QuickActionsConnectionManager()

# ============================================================================
# WEBSOCKET ENDPOINTS
# ============================================================================

@router.websocket("/")
async def quick_actions_websocket(
    websocket: WebSocket,
    token: Optional[str] = Query(None, description="Authentication token"),
    categories: Optional[str] = Query(None, description="Comma-separated action categories to subscribe to")
):
    """Main WebSocket endpoint for quick actions real-time communication"""
    connection_id = f"quick_actions_conn_{datetime.utcnow().timestamp()}_{id(websocket)}"
    
    try:
        # Accept connection first to prevent 403 errors
        await websocket.accept()
        
        # Authenticate user using existing pattern
        user_info = None
        try:
            if token:
                user_info = await get_current_user()
            else:
                # Allow anonymous connections for development
                user_info = {"user_id": "anonymous", "role": "anonymous"}
        except Exception as e:
            logger.warning(f"Quick Actions WebSocket authentication failed: {str(e)}")
            # Continue with anonymous user instead of closing connection
            user_info = {"user_id": "anonymous", "role": "anonymous"}
        
        user_id = user_info.get("user_id", "anonymous") if user_info else "anonymous"
        
        # Parse categories
        action_categories = []
        if categories:
            action_categories = [cat.strip() for cat in categories.split(",")]
        
        # Connect to manager
        await quick_actions_ws_manager.connect(websocket, connection_id, user_id, {
            "categories": action_categories,
            "authenticated": user_info is not None
        })
        
        # Subscribe to categories if specified
        for category in action_categories:
            quick_actions_ws_manager.subscribe_user_to_category(user_id, category)
            
        # Send initial connection confirmation
        await quick_actions_ws_manager.send_personal_message({
            "type": "connection_established",
            "connection_id": connection_id,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "capabilities": [
                "action_executed",
                "action_created",
                "action_updated",
                "action_deleted",
                "shortcut_triggered",
                "favorite_added",
                "favorite_removed",
                "history_updated",
                "analytics_updated"
            ],
            "subscribed_categories": action_categories
        }, connection_id)
        
        # Message handling loop
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                await handle_quick_actions_websocket_message(connection_id, user_id, message)
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await quick_actions_ws_manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.utcnow().isoformat()
                }, connection_id)
            except Exception as e:
                logger.error(f"Error handling quick actions WebSocket message: {str(e)}")
                await quick_actions_ws_manager.send_personal_message({
                    "type": "error",
                    "message": "Internal server error",
                    "timestamp": datetime.utcnow().isoformat()
                }, connection_id)
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Quick Actions WebSocket connection error: {str(e)}")
    finally:
        # Clean up connection
        quick_actions_ws_manager.disconnect(connection_id)

# ============================================================================
# MESSAGE HANDLING
# ============================================================================

async def handle_quick_actions_websocket_message(connection_id: str, user_id: str, message: Dict[str, Any]):
    """Handle incoming WebSocket messages from quick actions clients"""
    try:
        message_type = message.get("type")
        
        if message_type == "subscribe_category":
            category = message.get("category")
            if category:
                quick_actions_ws_manager.subscribe_user_to_category(user_id, category)
                await quick_actions_ws_manager.send_personal_message({
                    "type": "subscription_confirmed",
                    "category": category,
                    "timestamp": datetime.utcnow().isoformat()
                }, connection_id)
                
        elif message_type == "unsubscribe_category":
            category = message.get("category")
            if category:
                quick_actions_ws_manager.unsubscribe_user_from_category(user_id, category)
                await quick_actions_ws_manager.send_personal_message({
                    "type": "unsubscription_confirmed",
                    "category": category,
                    "timestamp": datetime.utcnow().isoformat()
                }, connection_id)
                
        elif message_type == "ping":
            # Respond to ping with pong
            await quick_actions_ws_manager.send_personal_message({
                "type": "pong",
                "timestamp": datetime.utcnow().isoformat()
            }, connection_id)
            
        else:
            await quick_actions_ws_manager.send_personal_message({
                "type": "error",
                "message": f"Unknown message type: {message_type}",
                "timestamp": datetime.utcnow().isoformat()
            }, connection_id)
            
    except Exception as e:
        logger.error(f"Error handling quick actions WebSocket message: {str(e)}")
        await quick_actions_ws_manager.send_personal_message({
            "type": "error",
            "message": "Failed to process message",
            "timestamp": datetime.utcnow().isoformat()
        }, connection_id)

# ============================================================================
# BROADCAST FUNCTIONS FOR QUICK ACTIONS UPDATES
# ============================================================================

async def broadcast_action_executed(action_data: Dict[str, Any], user_id: Optional[str] = None):
    """Broadcast action execution to relevant users"""
    message = {
        "type": "action_executed",
        "action": action_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if user_id:
        # Send to specific user
        await quick_actions_ws_manager.broadcast_to_user(message, user_id)
    else:
        # Broadcast to all
        await quick_actions_ws_manager.broadcast_to_all(message)

async def broadcast_action_created(action_data: Dict[str, Any], user_id: Optional[str] = None):
    """Broadcast action creation to relevant users"""
    message = {
        "type": "action_created",
        "action": action_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if user_id:
        await quick_actions_ws_manager.broadcast_to_user(message, user_id)
    else:
        await quick_actions_ws_manager.broadcast_to_all(message)

async def broadcast_action_updated(action_data: Dict[str, Any], user_id: Optional[str] = None):
    """Broadcast action update to relevant users"""
    message = {
        "type": "action_updated",
        "action": action_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if user_id:
        await quick_actions_ws_manager.broadcast_to_user(message, user_id)
    else:
        await quick_actions_ws_manager.broadcast_to_all(message)

async def broadcast_action_deleted(action_id: str, user_id: Optional[str] = None):
    """Broadcast action deletion to relevant users"""
    message = {
        "type": "action_deleted",
        "action_id": action_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if user_id:
        await quick_actions_ws_manager.broadcast_to_user(message, user_id)
    else:
        await quick_actions_ws_manager.broadcast_to_all(message)

async def broadcast_shortcut_triggered(shortcut_data: Dict[str, Any], user_id: Optional[str] = None):
    """Broadcast shortcut trigger to relevant users"""
    message = {
        "type": "shortcut_triggered",
        "shortcut": shortcut_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if user_id:
        await quick_actions_ws_manager.broadcast_to_user(message, user_id)
    else:
        await quick_actions_ws_manager.broadcast_to_all(message)

async def broadcast_favorite_updated(favorite_data: Dict[str, Any], user_id: str):
    """Broadcast favorite update to specific user"""
    message = {
        "type": "favorite_updated",
        "favorite": favorite_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await quick_actions_ws_manager.broadcast_to_user(message, user_id)

async def broadcast_history_updated(history_data: Dict[str, Any], user_id: str):
    """Broadcast history update to specific user"""
    message = {
        "type": "history_updated",
        "history": history_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await quick_actions_ws_manager.broadcast_to_user(message, user_id)

async def broadcast_analytics_updated(analytics_data: Dict[str, Any], user_id: Optional[str] = None):
    """Broadcast analytics update to relevant users"""
    message = {
        "type": "analytics_updated",
        "analytics": analytics_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    if user_id:
        await quick_actions_ws_manager.broadcast_to_user(message, user_id)
    else:
        await quick_actions_ws_manager.broadcast_to_all(message)

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@router.get("/stats")
async def get_quick_actions_websocket_stats():
    """Get WebSocket connection statistics"""
    try:
        active_connections = len(quick_actions_ws_manager.active_connections)
        total_subscriptions = sum(len(subs) for subs in quick_actions_ws_manager.user_subscriptions.values())
        
        return {
            "active_connections": active_connections,
            "total_subscriptions": total_subscriptions,
            "connection_details": [
                {
                    "connection_id": conn_id,
                    "user_id": metadata.get("user_id", "unknown"),
                    "connected_at": metadata.get("connected_at"),
                    "categories": metadata.get("metadata", {}).get("categories", [])
                }
                for conn_id, metadata in quick_actions_ws_manager.connection_metadata.items()
            ]
        }
    except Exception as e:
        logger.error(f"Error getting quick actions WebSocket stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get WebSocket statistics")

# Export the manager and broadcast functions for use in other services
__all__ = [
    "quick_actions_ws_manager",
    "broadcast_action_executed",
    "broadcast_action_created",
    "broadcast_action_updated",
    "broadcast_action_deleted",
    "broadcast_shortcut_triggered",
    "broadcast_favorite_updated",
    "broadcast_history_updated",
    "broadcast_analytics_updated"
]
