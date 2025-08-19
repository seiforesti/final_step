"""
Sensitivity Event Service
========================

Enterprise sensitivity event service for managing and processing
sensitivity labeling events and related activities.

This service provides:
- Sensitivity labeling event management
- Event tracking and monitoring
- Event correlation and analysis
- Event notification and alerting
- Event persistence and retrieval
- Event validation and enrichment
- Event reporting and analytics
- Event workflow management
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import uuid

logger = logging.getLogger(__name__)


class SensitivityEventService:
    """Enterprise sensitivity event service"""
    
    def __init__(self):
        self.events = []  # In-memory event storage
        self.event_types = self._load_event_types()
        self.event_handlers = self._load_event_handlers()
    
    def _load_event_types(self) -> Dict[str, Dict[str, Any]]:
        """Load sensitivity event types"""
        return {
            "label_created": {
                "description": "A new sensitivity label was created",
                "severity": "info",
                "requires_action": False
            },
            "label_updated": {
                "description": "An existing sensitivity label was updated",
                "severity": "info",
                "requires_action": False
            },
            "label_deleted": {
                "description": "A sensitivity label was deleted",
                "severity": "warning",
                "requires_action": True
            },
            "label_applied": {
                "description": "A sensitivity label was applied to an object",
                "severity": "info",
                "requires_action": False
            },
            "label_removed": {
                "description": "A sensitivity label was removed from an object",
                "severity": "info",
                "requires_action": False
            },
            "label_conflict": {
                "description": "A conflict was detected between sensitivity labels",
                "severity": "error",
                "requires_action": True
            },
            "label_expired": {
                "description": "A sensitivity label has expired",
                "severity": "warning",
                "requires_action": True
            },
            "label_violation": {
                "description": "A sensitivity label violation was detected",
                "severity": "error",
                "requires_action": True
            }
        }
    
    def _load_event_handlers(self) -> Dict[str, callable]:
        """Load event handlers for different event types"""
        return {
            "label_created": self._handle_label_created,
            "label_updated": self._handle_label_updated,
            "label_deleted": self._handle_label_deleted,
            "label_applied": self._handle_label_applied,
            "label_removed": self._handle_label_removed,
            "label_conflict": self._handle_label_conflict,
            "label_expired": self._handle_label_expired,
            "label_violation": self._handle_label_violation
        }
    
    async def create_sensitivity_event(
        self,
        event_type: str,
        object_id: str,
        label_id: str,
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new sensitivity event"""
        try:
            # Validate event type
            if event_type not in self.event_types:
                return {"success": False, "error": f"Invalid event type: {event_type}"}
            
            # Create event
            event = {
                "id": str(uuid.uuid4()),
                "event_type": event_type,
                "timestamp": datetime.utcnow().isoformat(),
                "object_id": object_id,
                "label_id": label_id,
                "user_id": user_id,
                "metadata": metadata or {},
                "severity": self.event_types[event_type]["severity"],
                "requires_action": self.event_types[event_type]["requires_action"],
                "processed": False
            }
            
            # Add to events list
            self.events.append(event)
            
            # Handle event
            await self._handle_event(event)
            
            logger.info(f"Sensitivity event created: {event_type} - {event['id']}")
            return {"success": True, "event_id": event["id"], "event": event}
            
        except Exception as e:
            logger.error(f"Error creating sensitivity event: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_realtime_events(
        self,
        event_types: Optional[List[str]] = None,
        object_id: Optional[str] = None,
        label_id: Optional[str] = None,
        user_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get real-time sensitivity events"""
        try:
            filtered_events = []
            
            for event in self.events:
                # Filter by event type
                if event_types and event["event_type"] not in event_types:
                    continue
                
                # Filter by object ID
                if object_id and event["object_id"] != object_id:
                    continue
                
                # Filter by label ID
                if label_id and event["label_id"] != label_id:
                    continue
                
                # Filter by user ID
                if user_id and event["user_id"] != user_id:
                    continue
                
                filtered_events.append(event)
                
                if len(filtered_events) >= limit:
                    break
            
            return filtered_events
            
        except Exception as e:
            logger.error(f"Error getting real-time events: {e}")
            return []
    
    async def get_event_statistics(
        self,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get sensitivity event statistics"""
        try:
            stats = {
                "total_events": 0,
                "events_by_type": {},
                "events_by_severity": {},
                "events_requiring_action": 0,
                "processed_events": 0,
                "unprocessed_events": 0,
                "time_range": {
                    "start": start_time.isoformat() if start_time else None,
                    "end": end_time.isoformat() if end_time else None
                }
            }
            
            for event in self.events:
                # Filter by time range
                event_timestamp = datetime.fromisoformat(event["timestamp"])
                if start_time and event_timestamp < start_time:
                    continue
                if end_time and event_timestamp > end_time:
                    continue
                
                stats["total_events"] += 1
                
                # Count by event type
                event_type = event["event_type"]
                stats["events_by_type"][event_type] = stats["events_by_type"].get(event_type, 0) + 1
                
                # Count by severity
                severity = event["severity"]
                stats["events_by_severity"][severity] = stats["events_by_severity"].get(severity, 0) + 1
                
                # Count events requiring action
                if event["requires_action"]:
                    stats["events_requiring_action"] += 1
                
                # Count processed vs unprocessed
                if event["processed"]:
                    stats["processed_events"] += 1
                else:
                    stats["unprocessed_events"] += 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting event statistics: {e}")
            return {"error": str(e)}
    
    async def process_event(self, event_id: str, action_taken: str, notes: Optional[str] = None) -> Dict[str, Any]:
        """Process a sensitivity event"""
        try:
            # Find event
            event = None
            for e in self.events:
                if e["id"] == event_id:
                    event = e
                    break
            
            if not event:
                return {"success": False, "error": f"Event not found: {event_id}"}
            
            # Update event
            event["processed"] = True
            event["processed_at"] = datetime.utcnow().isoformat()
            event["action_taken"] = action_taken
            if notes:
                event["notes"] = notes
            
            logger.info(f"Event processed: {event_id} - {action_taken}")
            return {"success": True, "event": event}
            
        except Exception as e:
            logger.error(f"Error processing event: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_events_requiring_action(self) -> List[Dict[str, Any]]:
        """Get events that require action"""
        try:
            return [
                event for event in self.events
                if event["requires_action"] and not event["processed"]
            ]
            
        except Exception as e:
            logger.error(f"Error getting events requiring action: {e}")
            return []
    
    async def _handle_event(self, event: Dict[str, Any]) -> None:
        """Handle a sensitivity event"""
        try:
            event_type = event["event_type"]
            handler = self.event_handlers.get(event_type)
            
            if handler:
                await handler(event)
            else:
                logger.warning(f"No handler found for event type: {event_type}")
                
        except Exception as e:
            logger.error(f"Error handling event: {e}")
    
    async def _handle_label_created(self, event: Dict[str, Any]) -> None:
        """Handle label created event"""
        try:
            logger.info(f"Label created: {event['label_id']} by {event['user_id']}")
            # Additional processing logic here
        except Exception as e:
            logger.error(f"Error handling label created event: {e}")
    
    async def _handle_label_updated(self, event: Dict[str, Any]) -> None:
        """Handle label updated event"""
        try:
            logger.info(f"Label updated: {event['label_id']} by {event['user_id']}")
            # Additional processing logic here
        except Exception as e:
            logger.error(f"Error handling label updated event: {e}")
    
    async def _handle_label_deleted(self, event: Dict[str, Any]) -> None:
        """Handle label deleted event"""
        try:
            logger.warning(f"Label deleted: {event['label_id']} by {event['user_id']}")
            # Additional processing logic here
        except Exception as e:
            logger.error(f"Error handling label deleted event: {e}")
    
    async def _handle_label_applied(self, event: Dict[str, Any]) -> None:
        """Handle label applied event"""
        try:
            logger.info(f"Label applied: {event['label_id']} to {event['object_id']} by {event['user_id']}")
            # Additional processing logic here
        except Exception as e:
            logger.error(f"Error handling label applied event: {e}")
    
    async def _handle_label_removed(self, event: Dict[str, Any]) -> None:
        """Handle label removed event"""
        try:
            logger.info(f"Label removed: {event['label_id']} from {event['object_id']} by {event['user_id']}")
            # Additional processing logic here
        except Exception as e:
            logger.error(f"Error handling label removed event: {e}")
    
    async def _handle_label_conflict(self, event: Dict[str, Any]) -> None:
        """Handle label conflict event"""
        try:
            logger.error(f"Label conflict detected: {event['label_id']} on {event['object_id']}")
            # Additional processing logic here
        except Exception as e:
            logger.error(f"Error handling label conflict event: {e}")
    
    async def _handle_label_expired(self, event: Dict[str, Any]) -> None:
        """Handle label expired event"""
        try:
            logger.warning(f"Label expired: {event['label_id']} on {event['object_id']}")
            # Additional processing logic here
        except Exception as e:
            logger.error(f"Error handling label expired event: {e}")
    
    async def _handle_label_violation(self, event: Dict[str, Any]) -> None:
        """Handle label violation event"""
        try:
            logger.error(f"Label violation detected: {event['label_id']} on {event['object_id']}")
            # Additional processing logic here
        except Exception as e:
            logger.error(f"Error handling label violation event: {e}")
    
    async def clear_old_events(self, days_to_keep: int = 30) -> int:
        """Clear old events"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            original_count = len(self.events)
            
            self.events = [
                event for event in self.events
                if datetime.fromisoformat(event["timestamp"]) > cutoff_date
            ]
            
            cleared_count = original_count - len(self.events)
            logger.info(f"Cleared {cleared_count} old events")
            return cleared_count
            
        except Exception as e:
            logger.error(f"Error clearing old events: {e}")
            return 0
    
    async def export_events(
        self,
        format: str = "json",
        event_types: Optional[List[str]] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Export sensitivity events"""
        try:
            # Filter events
            filtered_events = []
            for event in self.events:
                # Filter by event type
                if event_types and event["event_type"] not in event_types:
                    continue
                
                # Filter by time range
                event_timestamp = datetime.fromisoformat(event["timestamp"])
                if start_time and event_timestamp < start_time:
                    continue
                if end_time and event_timestamp > end_time:
                    continue
                
                filtered_events.append(event)
            
            # Export based on format
            if format == "json":
                export_data = json.dumps(filtered_events, indent=2, default=str)
            else:
                return {"success": False, "error": f"Unsupported format: {format}"}
            
            return {
                "success": True,
                "format": format,
                "data": export_data,
                "event_count": len(filtered_events),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error exporting events: {e}")
            return {"success": False, "error": str(e)}

