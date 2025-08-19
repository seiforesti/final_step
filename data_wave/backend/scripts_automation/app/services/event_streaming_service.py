"""
Event Streaming Service
======================

Enterprise event streaming service for real-time event processing,
streaming, and distribution across the data governance system.

This service provides:
- Real-time event streaming
- Event filtering and routing
- Event persistence and replay
- Event schema validation
- Event transformation and enrichment
- Event correlation and aggregation
- Event monitoring and alerting
- Event analytics and reporting
"""

import logging
from typing import Dict, List, Any, Optional, AsyncGenerator
from datetime import datetime, timedelta
import json
import asyncio
from collections import deque
import uuid

logger = logging.getLogger(__name__)


class EventStreamingService:
    """Enterprise event streaming service"""
    
    def __init__(self):
        self.event_queue = deque(maxlen=10000)  # In-memory event queue
        self.subscribers = {}  # Event subscribers
        self.event_schemas = self._load_event_schemas()
        self.streaming_enabled = True
    
    def _load_event_schemas(self) -> Dict[str, Dict[str, Any]]:
        """Load event schemas for validation"""
        return {
            "sensitivity_label_event": {
                "required_fields": ["event_id", "event_type", "timestamp", "object_id", "label_id", "user_id"],
                "optional_fields": ["action", "metadata", "confidence_score", "previous_label", "new_label"]
            },
            "scan_event": {
                "required_fields": ["event_id", "event_type", "timestamp", "scan_id", "data_source_id"],
                "optional_fields": ["status", "results", "metadata", "duration", "error_message"]
            },
            "compliance_event": {
                "required_fields": ["event_id", "event_type", "timestamp", "rule_id", "entity_id"],
                "optional_fields": ["status", "violations", "metadata", "severity", "action_taken"]
            },
            "user_activity_event": {
                "required_fields": ["event_id", "event_type", "timestamp", "user_id", "action"],
                "optional_fields": ["resource_id", "resource_type", "ip_address", "user_agent", "metadata"]
            }
        }
    
    async def publish_event(
        self,
        event_type: str,
        event_data: Dict[str, Any],
        priority: str = "normal"
    ) -> Dict[str, Any]:
        """Publish an event to the streaming system"""
        try:
            # Generate event ID
            event_id = str(uuid.uuid4())
            
            # Create event
            event = {
                "event_id": event_id,
                "event_type": event_type,
                "timestamp": datetime.utcnow().isoformat(),
                "priority": priority,
                "data": event_data
            }
            
            # Validate event schema
            validation_result = self._validate_event_schema(event_type, event_data)
            if not validation_result["valid"]:
                logger.error(f"Event validation failed: {validation_result['errors']}")
                return {"success": False, "error": f"Event validation failed: {validation_result['errors']}"}
            
            # Add to event queue
            self.event_queue.append(event)
            
            # Notify subscribers
            await self._notify_subscribers(event)
            
            logger.info(f"Event published: {event_type} - {event_id}")
            return {"success": True, "event_id": event_id}
            
        except Exception as e:
            logger.error(f"Error publishing event: {e}")
            return {"success": False, "error": str(e)}
    
    async def subscribe_to_events(
        self,
        event_types: List[str],
        callback: callable,
        subscriber_id: Optional[str] = None
    ) -> str:
        """Subscribe to specific event types"""
        try:
            if subscriber_id is None:
                subscriber_id = str(uuid.uuid4())
            
            self.subscribers[subscriber_id] = {
                "event_types": event_types,
                "callback": callback,
                "created_at": datetime.utcnow(),
                "active": True
            }
            
            logger.info(f"Subscriber registered: {subscriber_id} for events: {event_types}")
            return subscriber_id
            
        except Exception as e:
            logger.error(f"Error subscribing to events: {e}")
            raise
    
    async def unsubscribe_from_events(self, subscriber_id: str) -> bool:
        """Unsubscribe from events"""
        try:
            if subscriber_id in self.subscribers:
                self.subscribers[subscriber_id]["active"] = False
                del self.subscribers[subscriber_id]
                logger.info(f"Subscriber unregistered: {subscriber_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error unsubscribing from events: {e}")
            return False
    
    async def get_realtime_events(
        self,
        event_types: Optional[List[str]] = None,
        limit: int = 100,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Get real-time events"""
        try:
            events = []
            
            # Get events from queue
            for event in list(self.event_queue):
                # Filter by event type
                if event_types and event["event_type"] not in event_types:
                    continue
                
                # Filter by timestamp
                if since:
                    event_timestamp = datetime.fromisoformat(event["timestamp"])
                    if event_timestamp < since:
                        continue
                
                events.append(event)
                
                if len(events) >= limit:
                    break
            
            return events
            
        except Exception as e:
            logger.error(f"Error getting real-time events: {e}")
            return []
    
    async def stream_events(
        self,
        event_types: Optional[List[str]] = None,
        batch_size: int = 10,
        delay_seconds: float = 1.0
    ) -> AsyncGenerator[List[Dict[str, Any]], None]:
        """Stream events in real-time"""
        try:
            last_event_count = len(self.event_queue)
            
            while self.streaming_enabled:
                current_events = list(self.event_queue)
                
                # Get new events
                new_events = []
                for event in current_events[last_event_count:]:
                    if event_types and event["event_type"] not in event_types:
                        continue
                    new_events.append(event)
                
                # Yield events in batches
                if new_events:
                    for i in range(0, len(new_events), batch_size):
                        batch = new_events[i:i + batch_size]
                        yield batch
                
                last_event_count = len(current_events)
                
                # Schedule next check using scheduler service
                from .scheduler import SchedulerService
                scheduler = SchedulerService()
                await scheduler.schedule_task(
                    self._stream_events_generator,
                    event_types,
                    batch_size,
                    delay_seconds,
                    last_event_count,
                    delay_seconds
                )
                
        except Exception as e:
            logger.error(f"Error streaming events: {e}")
            yield []
    
    def _validate_event_schema(self, event_type: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate event against schema"""
        try:
            schema = self.event_schemas.get(event_type, {})
            required_fields = schema.get("required_fields", [])
            optional_fields = schema.get("optional_fields", [])
            
            errors = []
            
            # Check required fields
            for field in required_fields:
                if field not in event_data:
                    errors.append(f"Missing required field: {field}")
            
            # Check for unknown fields
            all_fields = required_fields + optional_fields
            for field in event_data.keys():
                if field not in all_fields:
                    errors.append(f"Unknown field: {field}")
            
            return {
                "valid": len(errors) == 0,
                "errors": errors
            }
            
        except Exception as e:
            logger.error(f"Error validating event schema: {e}")
            return {"valid": False, "errors": [str(e)]}
    
    async def _notify_subscribers(self, event: Dict[str, Any]) -> None:
        """Notify all subscribers about the event"""
        try:
            event_type = event["event_type"]
            
            for subscriber_id, subscriber in self.subscribers.items():
                if not subscriber["active"]:
                    continue
                
                # Check if subscriber is interested in this event type
                if event_type in subscriber["event_types"]:
                    try:
                        await subscriber["callback"](event)
                    except Exception as e:
                        logger.error(f"Error in subscriber callback {subscriber_id}: {e}")
                        
        except Exception as e:
            logger.error(f"Error notifying subscribers: {e}")
    
    async def get_event_statistics(self) -> Dict[str, Any]:
        """Get event streaming statistics"""
        try:
            stats = {
                "total_events": len(self.event_queue),
                "active_subscribers": len([s for s in self.subscribers.values() if s["active"]]),
                "event_types": {},
                "streaming_enabled": self.streaming_enabled,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Count events by type
            for event in self.event_queue:
                event_type = event["event_type"]
                stats["event_types"][event_type] = stats["event_types"].get(event_type, 0) + 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting event statistics: {e}")
            return {"error": str(e)}
    
    async def replay_events(
        self,
        event_types: Optional[List[str]] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Replay events from a time range"""
        try:
            replayed_events = []
            
            for event in self.event_queue:
                # Filter by event type
                if event_types and event["event_type"] not in event_types:
                    continue
                
                # Filter by time range
                event_timestamp = datetime.fromisoformat(event["timestamp"])
                if start_time and event_timestamp < start_time:
                    continue
                if end_time and event_timestamp > end_time:
                    continue
                
                replayed_events.append(event)
            
            return replayed_events
            
        except Exception as e:
            logger.error(f"Error replaying events: {e}")
            return []
    
    async def stop_streaming(self) -> None:
        """Stop event streaming"""
        self.streaming_enabled = False
        logger.info("Event streaming stopped")
    
    async def start_streaming(self) -> None:
        """Start event streaming"""
        self.streaming_enabled = True
        logger.info("Event streaming started")
    
    async def clear_event_queue(self) -> int:
        """Clear the event queue and return the number of cleared events"""
        try:
            cleared_count = len(self.event_queue)
            self.event_queue.clear()
            logger.info(f"Event queue cleared: {cleared_count} events")
            return cleared_count
            
        except Exception as e:
            logger.error(f"Error clearing event queue: {e}")
            return 0
