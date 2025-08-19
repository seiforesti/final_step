"""
Task Management Service
======================

Enterprise task management service for managing and coordinating
tasks across the data governance system.

This service provides:
- Task creation and management
- Task scheduling and execution
- Task status tracking
- Task prioritization
- Task dependencies management
- Task performance monitoring
- Task resource allocation
- Task lifecycle management
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import uuid
import asyncio
from enum import Enum

logger = logging.getLogger(__name__)


class TaskStatus(Enum):
    """Task status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"


class TaskPriority(Enum):
    """Task priority enumeration"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class TaskType(Enum):
    """Task type enumeration"""
    DATA_PROCESSING = "data_processing"
    SCAN_EXECUTION = "scan_execution"
    COMPLIANCE_CHECK = "compliance_check"
    CATALOG_SYNC = "catalog_sync"
    CLASSIFICATION = "classification"
    ANALYTICS = "analytics"
    NOTIFICATION = "notification"
    CLEANUP = "cleanup"


class TaskManagementService:
    """Enterprise task management service"""
    
    def __init__(self):
        self.tasks = {}  # Active tasks
        self.task_history = []  # Task history
        self.task_queue = asyncio.Queue()  # Task queue
        self.running = False
        self.max_concurrent_tasks = 10
        self.active_task_count = 0
    
    async def create_task(
        self,
        task_type: str,
        task_data: Dict[str, Any],
        priority: str = "normal",
        dependencies: List[str] = None,
        timeout: int = 3600
    ) -> Dict[str, Any]:
        """Create a new task"""
        try:
            task_id = str(uuid.uuid4())
            
            task = {
                "task_id": task_id,
                "task_type": task_type,
                "task_data": task_data,
                "priority": priority,
                "dependencies": dependencies or [],
                "timeout": timeout,
                "status": TaskStatus.PENDING.value,
                "created_at": datetime.utcnow().isoformat(),
                "started_at": None,
                "completed_at": None,
                "result": None,
                "error": None,
                "execution_time": 0.0,
                "retry_count": 0,
                "max_retries": 3
            }
            
            self.tasks[task_id] = task
            
            # Add to queue
            await self.task_queue.put((priority, task_id))
            
            logger.info(f"Created task: {task_id} - {task_type}")
            return {
                "success": True,
                "task_id": task_id,
                "status": "created"
            }
            
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            return {"success": False, "error": str(e)}
    
    async def start_task_processor(self):
        """Start the task processor"""
        if self.running:
            return
        
        self.running = True
        logger.info("Task processor started")
        
        # Start task processing loop
        asyncio.create_task(self._process_tasks())
    
    async def stop_task_processor(self):
        """Stop the task processor"""
        self.running = False
        logger.info("Task processor stopped")
    
    async def _process_tasks(self):
        """Process tasks from the queue"""
        while self.running:
            try:
                if self.active_task_count < self.max_concurrent_tasks:
                    # Get next task from queue
                    try:
                        priority, task_id = await asyncio.wait_for(
                            self.task_queue.get(), timeout=1.0
                        )
                    except asyncio.TimeoutError:
                        continue
                    
                    # Check if task still exists
                    if task_id not in self.tasks:
                        continue
                    
                    # Check dependencies
                    task = self.tasks[task_id]
                    if not await self._check_dependencies(task):
                        # Re-queue task for later
                        await self.task_queue.put((priority, task_id))
                        continue
                    
                    # Execute task
                    asyncio.create_task(self._execute_task(task_id))
                    
            except Exception as e:
                logger.error(f"Error in task processor: {e}")
                await self._handle_task_processor_error(e)
    
    async def _check_dependencies(self, task: Dict[str, Any]) -> bool:
        """Check if task dependencies are satisfied"""
        try:
            dependencies = task.get("dependencies", [])
            
            for dep_id in dependencies:
                # Check if dependency exists in history
                dep_completed = False
                for hist_task in self.task_history:
                    if hist_task["task_id"] == dep_id and hist_task["status"] == TaskStatus.COMPLETED.value:
                        dep_completed = True
                        break
                
                if not dep_completed:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking dependencies: {e}")
            return False
    
    async def _execute_task(self, task_id: str):
        """Execute a single task"""
        try:
            task = self.tasks[task_id]
            
            # Update status
            task["status"] = TaskStatus.RUNNING.value
            task["started_at"] = datetime.utcnow().isoformat()
            self.active_task_count += 1
            
            start_time = datetime.utcnow()
            
            # Execute based on task type
            result = await self._execute_task_by_type(task)
            
            # Calculate execution time
            end_time = datetime.utcnow()
            execution_time = (end_time - start_time).total_seconds()
            
            # Update task with result
            task["status"] = TaskStatus.COMPLETED.value
            task["completed_at"] = end_time.isoformat()
            task["result"] = result
            task["execution_time"] = execution_time
            
            # Move to history
            self.task_history.append(task.copy())
            del self.tasks[task_id]
            self.active_task_count -= 1
            
            logger.info(f"Task completed: {task_id} - {execution_time:.2f}s")
            
        except Exception as e:
            logger.error(f"Error executing task {task_id}: {e}")
            
            if task_id in self.tasks:
                task = self.tasks[task_id]
                task["status"] = TaskStatus.FAILED.value
                task["error"] = str(e)
                task["completed_at"] = datetime.utcnow().isoformat()
                
                # Check retry configuration
                if task["retry_count"] < task["max_retries"]:
                    # Retry task
                    task["retry_count"] += 1
                    task["status"] = TaskStatus.PENDING.value
                    task["error"] = None
                    task["completed_at"] = None
                    task["started_at"] = None
                    
                    # Re-queue task
                    await self.task_queue.put((task["priority"], task_id))
                else:
                    # Move to history
                    self.task_history.append(task.copy())
                    del self.tasks[task_id]
                
                self.active_task_count -= 1
    
    async def _execute_task_by_type(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute task based on type"""
        try:
            task_type = task["task_type"]
            task_data = task["task_data"]
            
            if task_type == TaskType.DATA_PROCESSING.value:
                return await self._execute_data_processing_task(task_data)
            elif task_type == TaskType.SCAN_EXECUTION.value:
                return await self._execute_scan_execution_task(task_data)
            elif task_type == TaskType.COMPLIANCE_CHECK.value:
                return await self._execute_compliance_check_task(task_data)
            elif task_type == TaskType.CATALOG_SYNC.value:
                return await self._execute_catalog_sync_task(task_data)
            elif task_type == TaskType.CLASSIFICATION.value:
                return await self._execute_classification_task(task_data)
            elif task_type == TaskType.ANALYTICS.value:
                return await self._execute_analytics_task(task_data)
            elif task_type == TaskType.NOTIFICATION.value:
                return await self._execute_notification_task(task_data)
            elif task_type == TaskType.CLEANUP.value:
                return await self._execute_cleanup_task(task_data)
            else:
                raise ValueError(f"Unknown task type: {task_type}")
                
        except Exception as e:
            logger.error(f"Error executing task type {task_type}: {e}")
            raise
    
    async def _execute_data_processing_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute data processing task"""
        try:
            # Real data processing logic
            from app.services.data_profiling_service import DataProfilingService
            from app.services.classification_service import ClassificationService
            from app.services.advanced_analytics_service import AdvancedAnalyticsService
            
            profiling_service = DataProfilingService()
            classification_service = ClassificationService()
            analytics_service = AdvancedAnalyticsService()
            
            start_time = datetime.utcnow()
            
            # Get task configuration
            data_source_id = task_data.get("data_source_id")
            processing_type = task_data.get("processing_type", "full")
            filters = task_data.get("filters", {})
            
            # Perform actual data processing
            if processing_type == "profiling":
                result = await profiling_service.profile_data_source(data_source_id, filters)
            elif processing_type == "classification":
                result = await classification_service.classify_data_source(data_source_id, filters)
            elif processing_type == "analytics":
                result = await analytics_service.analyze_data_source(data_source_id, filters)
            else:
                # Full processing pipeline
                profiling_result = await profiling_service.profile_data_source(data_source_id, filters)
                classification_result = await classification_service.classify_data_source(data_source_id, filters)
                analytics_result = await analytics_service.analyze_data_source(data_source_id, filters)
                
                result = {
                    "success": True,
                    "profiling": profiling_result,
                    "classification": classification_result,
                    "analytics": analytics_result
                }
            
            end_time = datetime.utcnow()
            processing_time = (end_time - start_time).total_seconds()
            
            if result.get("success", False):
                return {
                    "task_type": "data_processing",
                    "status": "completed",
                    "records_processed": result.get("records_processed", 0),
                    "processing_time": processing_time,
                    "data_size_mb": result.get("data_size_mb", 0),
                    "details": result.get("details", {})
                }
            else:
                raise Exception(result.get("error", "Data processing failed"))
            
        except Exception as e:
            logger.error(f"Error executing data processing task: {e}")
            raise
    
    async def _execute_scan_execution_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute scan execution task"""
        try:
            # Real scan execution logic
            from app.services.scan_service import ScanService
            from app.services.scan_orchestration_service import ScanOrchestrationService
            
            scan_service = ScanService()
            orchestration_service = ScanOrchestrationService()
            
            start_time = datetime.utcnow()
            
            # Get task configuration
            data_source_id = task_data.get("data_source_id")
            scan_rules = task_data.get("scan_rules", [])
            scan_type = task_data.get("scan_type", "comprehensive")
            
            # Perform actual scan execution
            if scan_type == "targeted" and scan_rules:
                scan_result = await scan_service.execute_scan_rules(
                    data_source_id=data_source_id,
                    rule_ids=scan_rules
                )
            else:
                scan_result = await orchestration_service.execute_comprehensive_scan(
                    data_source_id=data_source_id
                )
            
            end_time = datetime.utcnow()
            execution_time = (end_time - start_time).total_seconds()
            
            if scan_result.get("success", False):
                return {
                    "task_type": "scan_execution",
                    "status": "completed",
                    "scans_executed": scan_result.get("scans_executed", 0),
                    "rules_matched": scan_result.get("rules_matched", 0),
                    "execution_time": execution_time,
                    "details": scan_result.get("details", {})
                }
            else:
                raise Exception(scan_result.get("error", "Scan execution failed"))
            
        except Exception as e:
            logger.error(f"Error executing scan execution task: {e}")
            raise
    
    async def _execute_compliance_check_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute compliance check task"""
        try:
            # Real compliance check logic
            from app.services.compliance_rule_service import ComplianceRuleService
            from app.services.compliance_production_services import ComplianceProductionServices
            
            compliance_service = ComplianceRuleService()
            production_service = ComplianceProductionServices()
            
            start_time = datetime.utcnow()
            
            # Get task configuration
            data_source_id = task_data.get("data_source_id")
            compliance_framework = task_data.get("compliance_framework", "general")
            check_type = task_data.get("check_type", "comprehensive")
            
            # Perform actual compliance check
            if check_type == "framework_specific":
                check_result = await production_service.check_compliance_framework(
                    data_source_id=data_source_id,
                    framework=compliance_framework
                )
            else:
                check_result = await compliance_service.perform_compliance_audit(
                    data_source_id=data_source_id,
                    audit_type=check_type
                )
            
            end_time = datetime.utcnow()
            check_time = (end_time - start_time).total_seconds()
            
            if check_result.get("success", False):
                return {
                    "task_type": "compliance_check",
                    "status": "completed",
                    "items_checked": check_result.get("total_items", 0),
                    "compliant_items": check_result.get("compliant_items", 0),
                    "violations": check_result.get("violations", 0),
                    "check_time": check_time,
                    "details": check_result.get("details", {})
                }
            else:
                raise Exception(check_result.get("error", "Compliance check failed"))
            
        except Exception as e:
            logger.error(f"Error executing compliance check task: {e}")
            raise
    
    async def _execute_catalog_sync_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute catalog sync task"""
        try:
            # Real catalog sync logic
            from app.services.catalog_service import EnhancedCatalogService
            from app.services.data_source_service import DataSourceService
            
            catalog_service = EnhancedCatalogService()
            data_source_service = DataSourceService()
            
            start_time = datetime.utcnow()
            
            # Get task configuration
            data_source_id = task_data.get("data_source_id")
            sync_type = task_data.get("sync_type", "full")
            sync_options = task_data.get("sync_options", {})
            
            # Perform actual catalog synchronization
            sync_result = await catalog_service.sync_catalog_items(
                data_source_id=data_source_id,
                sync_type=sync_type,
                **sync_options
            )
            
            end_time = datetime.utcnow()
            sync_time = (end_time - start_time).total_seconds()
            
            if sync_result.get("success", False):
                return {
                    "task_type": "catalog_sync",
                    "status": "completed",
                    "items_synced": sync_result.get("items_synced", 0),
                    "new_items": sync_result.get("new_items", 0),
                    "updated_items": sync_result.get("updated_items", 0),
                    "sync_time": sync_time,
                    "details": sync_result.get("details", {})
                }
            else:
                raise Exception(sync_result.get("error", "Catalog sync failed"))
            
        except Exception as e:
            logger.error(f"Error executing catalog sync task: {e}")
            raise
    
    async def _execute_classification_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute classification task"""
        try:
            # Real classification logic
            from app.services.classification_service import ClassificationService
            from app.services.ml_model_service import MLModelService
            
            classification_service = ClassificationService()
            ml_model_service = MLModelService()
            
            start_time = datetime.utcnow()
            
            # Get task configuration
            data_source_id = task_data.get("data_source_id")
            classification_type = task_data.get("classification_type", "auto")
            model_id = task_data.get("model_id")
            
            # Perform actual classification
            classification_result = await classification_service.classify_data_source(
                data_source_id=data_source_id,
                classification_type=classification_type,
                model_id=model_id
            )
            
            end_time = datetime.utcnow()
            classification_time = (end_time - start_time).total_seconds()
            
            if classification_result.get("success", False):
                return {
                    "task_type": "classification",
                    "status": "completed",
                    "items_classified": classification_result.get("items_classified", 0),
                    "confidence_score": classification_result.get("confidence_score", 0.0),
                    "classification_time": classification_time,
                    "details": classification_result.get("details", {})
                }
            else:
                raise Exception(classification_result.get("error", "Classification failed"))
            
        except Exception as e:
            logger.error(f"Error executing classification task: {e}")
            raise
    
    async def _execute_analytics_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute analytics task"""
        try:
            # Real analytics logic
            from app.services.advanced_analytics_service import AdvancedAnalyticsService
            from app.services.insights_service import InsightsService
            
            analytics_service = AdvancedAnalyticsService()
            insights_service = InsightsService()
            
            start_time = datetime.utcnow()
            
            # Get task configuration
            data_source_id = task_data.get("data_source_id")
            analytics_type = task_data.get("analytics_type", "comprehensive")
            metrics_config = task_data.get("metrics_config", {})
            
            # Perform actual analytics
            analytics_result = await analytics_service.analyze_data_source(
                data_source_id=data_source_id,
                analytics_type=analytics_type,
                metrics_config=metrics_config
            )
            
            end_time = datetime.utcnow()
            analytics_time = (end_time - start_time).total_seconds()
            
            if analytics_result.get("success", False):
                return {
                    "task_type": "analytics",
                    "status": "completed",
                    "metrics_calculated": analytics_result.get("metrics_calculated", 0),
                    "insights_generated": analytics_result.get("insights_generated", 0),
                    "analytics_time": analytics_time,
                    "details": analytics_result.get("details", {})
                }
            else:
                raise Exception(analytics_result.get("error", "Analytics failed"))
            
        except Exception as e:
            logger.error(f"Error executing analytics task: {e}")
            raise
    
    async def _execute_notification_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute notification task"""
        try:
            # Real notification logic
            from app.services.notification_service import NotificationService
            from app.services.user_preference_service import UserPreferenceService
            
            notification_service = NotificationService()
            preference_service = UserPreferenceService()
            
            start_time = datetime.utcnow()
            
            # Get task configuration
            notification_type = task_data.get("notification_type", "alert")
            recipients = task_data.get("recipients", [])
            message = task_data.get("message", "")
            channels = task_data.get("channels", ["email"])
            
            # Perform actual notification
            notification_result = await notification_service.send_notifications(
                notification_type=notification_type,
                recipients=recipients,
                message=message,
                channels=channels
            )
            
            end_time = datetime.utcnow()
            notification_time = (end_time - start_time).total_seconds()
            
            if notification_result.get("success", False):
                return {
                    "task_type": "notification",
                    "status": "completed",
                    "notifications_sent": notification_result.get("notifications_sent", 0),
                    "delivery_rate": notification_result.get("delivery_rate", 0.0),
                    "notification_time": notification_time,
                    "details": notification_result.get("details", {})
                }
            else:
                raise Exception(notification_result.get("error", "Notification failed"))
            
        except Exception as e:
            logger.error(f"Error executing notification task: {e}")
            raise
    
    async def _execute_cleanup_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute cleanup task"""
        try:
            # Real cleanup logic
            from app.services.cleanup_service import CleanupService
            from app.services.storage_service import StorageService
            
            cleanup_service = CleanupService()
            storage_service = StorageService()
            
            start_time = datetime.utcnow()
            
            # Get task configuration
            cleanup_type = task_data.get("cleanup_type", "general")
            retention_policy = task_data.get("retention_policy", {})
            cleanup_targets = task_data.get("cleanup_targets", [])
            
            # Perform actual cleanup
            cleanup_result = await cleanup_service.perform_cleanup(
                cleanup_type=cleanup_type,
                retention_policy=retention_policy,
                cleanup_targets=cleanup_targets
            )
            
            end_time = datetime.utcnow()
            cleanup_time = (end_time - start_time).total_seconds()
            
            if cleanup_result.get("success", False):
                return {
                    "task_type": "cleanup",
                    "status": "completed",
                    "items_cleaned": cleanup_result.get("items_cleaned", 0),
                    "space_freed_mb": cleanup_result.get("space_freed_mb", 0.0),
                    "cleanup_time": cleanup_time,
                    "details": cleanup_result.get("details", {})
                }
            else:
                raise Exception(cleanup_result.get("error", "Cleanup failed"))
            
        except Exception as e:
            logger.error(f"Error executing cleanup task: {e}")
            raise
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get task status"""
        try:
            # Check active tasks
            if task_id in self.tasks:
                task = self.tasks[task_id]
                return {
                    "success": True,
                    "task_id": task_id,
                    "status": task["status"],
                    "created_at": task["created_at"],
                    "started_at": task["started_at"],
                    "execution_time": task.get("execution_time", 0.0),
                    "retry_count": task.get("retry_count", 0)
                }
            
            # Check task history
            for task in self.task_history:
                if task["task_id"] == task_id:
                    return {
                        "success": True,
                        "task_id": task_id,
                        "status": task["status"],
                        "created_at": task["created_at"],
                        "started_at": task["started_at"],
                        "completed_at": task["completed_at"],
                        "execution_time": task["execution_time"],
                        "result": task["result"],
                        "error": task["error"]
                    }
            
            return {
                "success": False,
                "error": f"Task not found: {task_id}"
            }
            
        except Exception as e:
            logger.error(f"Error getting task status: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_task_history(
        self,
        task_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get task history"""
        try:
            history = []
            
            # Add active tasks
            for task in self.tasks.values():
                if task_type and task["task_type"] != task_type:
                    continue
                if status and task["status"] != status:
                    continue
                history.append(task)
            
            # Add completed tasks
            for task in self.task_history:
                if task_type and task["task_type"] != task_type:
                    continue
                if status and task["status"] != status:
                    continue
                history.append(task)
            
            # Sort by created_at (newest first)
            history.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            
            return history[:limit]
            
        except Exception as e:
            logger.error(f"Error getting task history: {e}")
            return []
    
    async def cancel_task(self, task_id: str) -> Dict[str, Any]:
        """Cancel a task"""
        try:
            if task_id in self.tasks:
                task = self.tasks[task_id]
                task["status"] = TaskStatus.CANCELLED.value
                task["completed_at"] = datetime.utcnow().isoformat()
                
                # Move to history
                self.task_history.append(task.copy())
                del self.tasks[task_id]
                
                logger.info(f"Task cancelled: {task_id}")
                return {"success": True, "task_id": task_id, "status": "cancelled"}
            
            return {
                "success": False,
                "error": f"Task not found: {task_id}"
            }
            
        except Exception as e:
            logger.error(f"Error cancelling task: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_task_metrics(self) -> Dict[str, Any]:
        """Get task metrics"""
        try:
            metrics = {
                "total_tasks": len(self.tasks) + len(self.task_history),
                "active_tasks": len(self.tasks),
                "completed_tasks": 0,
                "failed_tasks": 0,
                "cancelled_tasks": 0,
                "average_execution_time": 0.0,
                "tasks_by_type": {},
                "tasks_by_status": {}
            }
            
            all_tasks = list(self.tasks.values()) + self.task_history
            execution_times = []
            
            for task in all_tasks:
                status = task["status"]
                task_type = task["task_type"]
                
                if status == TaskStatus.COMPLETED.value:
                    metrics["completed_tasks"] += 1
                elif status == TaskStatus.FAILED.value:
                    metrics["failed_tasks"] += 1
                elif status == TaskStatus.CANCELLED.value:
                    metrics["cancelled_tasks"] += 1
                
                # Count by type
                metrics["tasks_by_type"][task_type] = metrics["tasks_by_type"].get(task_type, 0) + 1
                
                # Count by status
                metrics["tasks_by_status"][status] = metrics["tasks_by_status"].get(status, 0) + 1
                
                # Collect execution times
                if task.get("execution_time"):
                    execution_times.append(task["execution_time"])
            
            # Calculate average execution time
            if execution_times:
                metrics["average_execution_time"] = sum(execution_times) / len(execution_times)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting task metrics: {e}")
            return {"error": str(e)}
    
    async def _handle_task_processor_error(self, error: Exception):
        """Handle task processor errors with exponential backoff"""
        try:
            from ..services.notification_service import NotificationService
            notification_service = NotificationService()
            
            # Log error and send notification
            error_message = f"Task processor error: {str(error)}"
            logger.error(error_message)
            
            # Send alert to administrators
            await notification_service.send_alert(
                level="error",
                message=error_message,
                service="task_management"
            )
            
            # Use exponential backoff for retry
            retry_delay = min(60, 2 ** min(self.error_count, 6))  # Max 1 minute
            
            # Schedule retry using scheduler service
            from .scheduler import SchedulerService
            scheduler = SchedulerService()
            await scheduler.schedule_task(
                self._process_tasks,
                delay_seconds=retry_delay
            )
            
        except Exception as e:
            logger.error(f"Error in task processor error handler: {e}")
            
            # Schedule fallback retry
            from .scheduler import SchedulerService
            scheduler = SchedulerService()
            await scheduler.schedule_task(
                self._process_tasks,
                delay_seconds=60
            )
