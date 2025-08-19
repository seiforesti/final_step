"""
Discovery Tracking Service
=========================

Enterprise discovery tracking service for monitoring and managing
data discovery operations across the data governance system.

This service provides:
- Discovery operation tracking
- Progress monitoring and reporting
- Discovery status management
- Discovery history and audit trails
- Discovery performance metrics
- Discovery scheduling and coordination
- Discovery result aggregation
- Discovery workflow management
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import uuid

logger = logging.getLogger(__name__)


class DiscoveryTrackingService:
    """Enterprise discovery tracking service"""
    
    def __init__(self):
        self.discovery_operations = {}  # Active discovery operations
        self.discovery_history = []  # Discovery history
        self.operation_statuses = self._load_operation_statuses()
    
    def _load_operation_statuses(self) -> Dict[str, str]:
        """Load discovery operation status definitions"""
        return {
            "pending": "Discovery operation is pending",
            "running": "Discovery operation is currently running",
            "completed": "Discovery operation completed successfully",
            "failed": "Discovery operation failed",
            "cancelled": "Discovery operation was cancelled",
            "paused": "Discovery operation is paused"
        }
    
    async def get_discovery_status(
        self,
        discovery_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Get discovery operation status"""
        try:
            # Check if discovery operation exists
            if discovery_id not in self.discovery_operations:
                return {
                    "success": False,
                    "error": f"Discovery operation not found: {discovery_id}"
                }
            
            operation = self.discovery_operations[discovery_id]
            
            # Check user access
            if operation.get("user_id") != user_id:
                return {
                    "success": False,
                    "error": "Access denied to discovery operation"
                }
            
            # Calculate progress
            progress = self._calculate_progress(operation)
            
            return {
                "success": True,
                "discovery_id": discovery_id,
                "status": operation.get("status", "unknown"),
                "progress": progress,
                "started_at": operation.get("started_at"),
                "completed_at": operation.get("completed_at"),
                "total_items": operation.get("total_items", 0),
                "processed_items": operation.get("processed_items", 0),
                "errors": operation.get("errors", []),
                "warnings": operation.get("warnings", [])
            }
            
        except Exception as e:
            logger.error(f"Error getting discovery status: {e}")
            return {"success": False, "error": str(e)}
    
    async def create_discovery_operation(
        self,
        user_id: str,
        data_source_id: str,
        discovery_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new discovery operation"""
        try:
            discovery_id = str(uuid.uuid4())
            
            operation = {
                "discovery_id": discovery_id,
                "user_id": user_id,
                "data_source_id": data_source_id,
                "config": discovery_config,
                "status": "pending",
                "progress": 0.0,
                "started_at": datetime.utcnow().isoformat(),
                "completed_at": None,
                "total_items": 0,
                "processed_items": 0,
                "errors": [],
                "warnings": [],
                "results": {}
            }
            
            self.discovery_operations[discovery_id] = operation
            
            logger.info(f"Discovery operation created: {discovery_id}")
            return {
                "success": True,
                "discovery_id": discovery_id,
                "operation": operation
            }
            
        except Exception as e:
            logger.error(f"Error creating discovery operation: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_discovery_progress(
        self,
        discovery_id: str,
        progress: float,
        processed_items: int,
        total_items: int,
        status: str = "running"
    ) -> Dict[str, Any]:
        """Update discovery operation progress"""
        try:
            if discovery_id not in self.discovery_operations:
                return {
                    "success": False,
                    "error": f"Discovery operation not found: {discovery_id}"
                }
            
            operation = self.discovery_operations[discovery_id]
            
            # Update operation
            operation["progress"] = min(100.0, max(0.0, progress))
            operation["processed_items"] = processed_items
            operation["total_items"] = total_items
            operation["status"] = status
            
            # Update completion time if completed
            if status in ["completed", "failed", "cancelled"]:
                operation["completed_at"] = datetime.utcnow().isoformat()
                
                # Move to history
                self.discovery_history.append(operation.copy())
                del self.discovery_operations[discovery_id]
            
            logger.info(f"Discovery progress updated: {discovery_id} - {progress}%")
            return {"success": True, "operation": operation}
            
        except Exception as e:
            logger.error(f"Error updating discovery progress: {e}")
            return {"success": False, "error": str(e)}
    
    async def add_discovery_error(
        self,
        discovery_id: str,
        error_message: str,
        error_type: str = "general"
    ) -> Dict[str, Any]:
        """Add error to discovery operation"""
        try:
            if discovery_id not in self.discovery_operations:
                return {
                    "success": False,
                    "error": f"Discovery operation not found: {discovery_id}"
                }
            
            operation = self.discovery_operations[discovery_id]
            
            error = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": error_message,
                "type": error_type
            }
            
            operation["errors"].append(error)
            
            logger.warning(f"Discovery error added: {discovery_id} - {error_message}")
            return {"success": True, "error": error}
            
        except Exception as e:
            logger.error(f"Error adding discovery error: {e}")
            return {"success": False, "error": str(e)}
    
    async def add_discovery_warning(
        self,
        discovery_id: str,
        warning_message: str,
        warning_type: str = "general"
    ) -> Dict[str, Any]:
        """Add warning to discovery operation"""
        try:
            if discovery_id not in self.discovery_operations:
                return {
                    "success": False,
                    "error": f"Discovery operation not found: {discovery_id}"
                }
            
            operation = self.discovery_operations[discovery_id]
            
            warning = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": warning_message,
                "type": warning_type
            }
            
            operation["warnings"].append(warning)
            
            logger.info(f"Discovery warning added: {discovery_id} - {warning_message}")
            return {"success": True, "warning": warning}
            
        except Exception as e:
            logger.error(f"Error adding discovery warning: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_discovery_history(
        self,
        user_id: str,
        limit: int = 50,
        status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get discovery operation history"""
        try:
            history = []
            
            # Get from active operations
            for operation in self.discovery_operations.values():
                if operation.get("user_id") == user_id:
                    if status_filter and operation.get("status") != status_filter:
                        continue
                    history.append(operation)
            
            # Get from completed operations
            for operation in self.discovery_history:
                if operation.get("user_id") == user_id:
                    if status_filter and operation.get("status") != status_filter:
                        continue
                    history.append(operation)
            
            # Sort by started_at (newest first)
            history.sort(key=lambda x: x.get("started_at", ""), reverse=True)
            
            return history[:limit]
            
        except Exception as e:
            logger.error(f"Error getting discovery history: {e}")
            return []
    
    async def get_discovery_metrics(
        self,
        user_id: str,
        time_range: Optional[Dict[str, datetime]] = None
    ) -> Dict[str, Any]:
        """Get discovery operation metrics"""
        try:
            metrics = {
                "total_operations": 0,
                "completed_operations": 0,
                "failed_operations": 0,
                "running_operations": 0,
                "average_duration_minutes": 0,
                "total_items_discovered": 0,
                "success_rate": 0.0
            }
            
            all_operations = []
            
            # Collect active operations
            for operation in self.discovery_operations.values():
                if operation.get("user_id") == user_id:
                    all_operations.append(operation)
            
            # Collect completed operations
            for operation in self.discovery_history:
                if operation.get("user_id") == user_id:
                    all_operations.append(operation)
            
            # Filter by time range
            if time_range:
                filtered_operations = []
                for operation in all_operations:
                    started_at = datetime.fromisoformat(operation.get("started_at", ""))
                    if time_range.get("start") and started_at < time_range["start"]:
                        continue
                    if time_range.get("end") and started_at > time_range["end"]:
                        continue
                    filtered_operations.append(operation)
                all_operations = filtered_operations
            
            if not all_operations:
                return metrics
            
            # Calculate metrics
            metrics["total_operations"] = len(all_operations)
            
            for operation in all_operations:
                status = operation.get("status", "unknown")
                
                if status == "completed":
                    metrics["completed_operations"] += 1
                elif status == "failed":
                    metrics["failed_operations"] += 1
                elif status == "running":
                    metrics["running_operations"] += 1
                
                metrics["total_items_discovered"] += operation.get("processed_items", 0)
            
            # Calculate success rate
            if metrics["total_operations"] > 0:
                metrics["success_rate"] = metrics["completed_operations"] / metrics["total_operations"]
            
            # Calculate average duration
            durations = []
            for operation in all_operations:
                if operation.get("completed_at") and operation.get("started_at"):
                    started = datetime.fromisoformat(operation["started_at"])
                    completed = datetime.fromisoformat(operation["completed_at"])
                    duration = (completed - started).total_seconds() / 60  # minutes
                    durations.append(duration)
            
            if durations:
                metrics["average_duration_minutes"] = sum(durations) / len(durations)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting discovery metrics: {e}")
            return {"error": str(e)}
    
    def _calculate_progress(self, operation: Dict[str, Any]) -> float:
        """Calculate discovery progress percentage"""
        try:
            total_items = operation.get("total_items", 0)
            processed_items = operation.get("processed_items", 0)
            
            if total_items == 0:
                return 0.0
            
            progress = (processed_items / total_items) * 100
            return min(100.0, max(0.0, progress))
            
        except Exception as e:
            logger.error(f"Error calculating progress: {e}")
            return 0.0
    
    async def cancel_discovery_operation(
        self,
        discovery_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Cancel a discovery operation"""
        try:
            if discovery_id not in self.discovery_operations:
                return {
                    "success": False,
                    "error": f"Discovery operation not found: {discovery_id}"
                }
            
            operation = self.discovery_operations[discovery_id]
            
            # Check user access
            if operation.get("user_id") != user_id:
                return {
                    "success": False,
                    "error": "Access denied to discovery operation"
                }
            
            # Update status
            operation["status"] = "cancelled"
            operation["completed_at"] = datetime.utcnow().isoformat()
            
            # Move to history
            self.discovery_history.append(operation.copy())
            del self.discovery_operations[discovery_id]
            
            logger.info(f"Discovery operation cancelled: {discovery_id}")
            return {"success": True, "operation": operation}
            
        except Exception as e:
            logger.error(f"Error cancelling discovery operation: {e}")
            return {"success": False, "error": str(e)}
    
    async def clear_old_history(self, days_to_keep: int = 30) -> int:
        """Clear old discovery history"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            original_count = len(self.discovery_history)
            
            self.discovery_history = [
                operation for operation in self.discovery_history
                if datetime.fromisoformat(operation.get("started_at", "")) > cutoff_date
            ]
            
            cleared_count = original_count - len(self.discovery_history)
            logger.info(f"Cleared {cleared_count} old discovery history records")
            return cleared_count
            
        except Exception as e:
            logger.error(f"Error clearing old history: {e}")
            return 0

