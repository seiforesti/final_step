"""
Workflow Engine Service
======================

Enterprise workflow engine service for orchestrating and managing
complex workflows across the data governance system.

This service provides:
- Workflow definition and execution
- Workflow state management
- Parallel and sequential execution
- Workflow monitoring and tracking
- Error handling and recovery
- Workflow optimization and performance
- Workflow scheduling and coordination
- Workflow lifecycle management
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import uuid
import asyncio
from enum import Enum

logger = logging.getLogger(__name__)


class WorkflowStatus(Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"


class WorkflowEngineService:
    """Enterprise workflow engine service"""
    
    def __init__(self):
        self.active_workflows = {}  # Active workflow executions
        self.workflow_definitions = {}  # Workflow definitions
        self.execution_history = []  # Execution history
        self.workflow_templates = self._load_workflow_templates()
    
    def _load_workflow_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load workflow templates"""
        return {
            "bulk_operations": {
                "description": "Execute bulk operations across multiple groups",
                "execution_mode": "parallel",
                "max_parallel": 10,
                "timeout": 3600,
                "retry_config": {"max_retries": 3, "retry_delay": 60}
            },
            "data_sync": {
                "description": "Synchronize data across data sources",
                "execution_mode": "sequential",
                "max_parallel": 1,
                "timeout": 1800,
                "retry_config": {"max_retries": 2, "retry_delay": 30}
            },
            "compliance_audit": {
                "description": "Execute compliance audit workflow",
                "execution_mode": "parallel",
                "max_parallel": 5,
                "timeout": 7200,
                "retry_config": {"max_retries": 1, "retry_delay": 120}
            },
            "scan_orchestration": {
                "description": "Orchestrate scanning operations",
                "execution_mode": "parallel",
                "max_parallel": 8,
                "timeout": 5400,
                "retry_config": {"max_retries": 2, "retry_delay": 60}
            }
        }
    
    async def execute_bulk_operations(
        self,
        operations: List[Dict[str, Any]],
        workflow_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute bulk operations using workflow engine"""
        try:
            # Generate workflow ID
            workflow_id = str(uuid.uuid4())
            
            # Create workflow execution
            workflow_execution = {
                "workflow_id": workflow_id,
                "workflow_type": "bulk_operations",
                "operations": operations,
                "config": workflow_config,
                "status": WorkflowStatus.PENDING.value,
                "started_at": datetime.utcnow().isoformat(),
                "completed_at": None,
                "results": [],
                "errors": [],
                "progress": 0.0
            }
            
            # Add to active workflows
            self.active_workflows[workflow_id] = workflow_execution
            
            # Start workflow execution
            asyncio.create_task(self._execute_workflow(workflow_id))
            
            logger.info(f"Bulk operations workflow started: {workflow_id}")
            return {
                "success": True,
                "workflow_id": workflow_id,
                "status": "started",
                "total_operations": len(operations)
            }
            
        except Exception as e:
            logger.error(f"Error executing bulk operations: {e}")
            return {"success": False, "error": str(e)}
    
    async def _execute_workflow(self, workflow_id: str) -> None:
        """Execute a workflow"""
        try:
            workflow = self.active_workflows[workflow_id]
            
            # Update status to running
            workflow["status"] = WorkflowStatus.RUNNING.value
            
            operations = workflow["operations"]
            config = workflow["config"]
            execution_mode = config.get("execution_mode", "sequential")
            parallel_limit = config.get("parallel_limit", 1)
            continue_on_error = config.get("continue_on_error", False)
            
            results = []
            errors = []
            
            if execution_mode == "parallel":
                # Execute operations in parallel with limit
                semaphore = asyncio.Semaphore(parallel_limit)
                
                async def execute_operation(operation):
                    async with semaphore:
                        return await self._execute_single_operation(operation)
                
                # Create tasks for all operations
                tasks = [execute_operation(op) for op in operations]
                
                # Execute all tasks
                operation_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process results
                for i, result in enumerate(operation_results):
                    if isinstance(result, Exception):
                        error = {
                            "operation_index": i,
                            "operation": operations[i],
                            "error": str(result),
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        errors.append(error)
                        if not continue_on_error:
                            break
                    else:
                        results.append(result)
                        
            else:
                # Execute operations sequentially
                for i, operation in enumerate(operations):
                    try:
                        result = await self._execute_single_operation(operation)
                        results.append(result)
                        workflow["progress"] = (i + 1) / len(operations) * 100
                    except Exception as e:
                        error = {
                            "operation_index": i,
                            "operation": operation,
                            "error": str(e),
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        errors.append(error)
                        if not continue_on_error:
                            break
            
            # Update workflow with results
            workflow["results"] = results
            workflow["errors"] = errors
            workflow["completed_at"] = datetime.utcnow().isoformat()
            
            # Determine final status
            if errors and not continue_on_error:
                workflow["status"] = WorkflowStatus.FAILED.value
            elif errors:
                workflow["status"] = WorkflowStatus.COMPLETED.value
            else:
                workflow["status"] = WorkflowStatus.COMPLETED.value
            
            # Move to history
            self.execution_history.append(workflow.copy())
            del self.active_workflows[workflow_id]
            
            logger.info(f"Workflow completed: {workflow_id} - {workflow['status']}")
            
        except Exception as e:
            logger.error(f"Error executing workflow {workflow_id}: {e}")
            if workflow_id in self.active_workflows:
                workflow = self.active_workflows[workflow_id]
                workflow["status"] = WorkflowStatus.FAILED.value
                workflow["errors"].append({
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                })
                workflow["completed_at"] = datetime.utcnow().isoformat()
    
    async def _execute_single_operation(self, operation: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single operation"""
        try:
            operation_id = str(uuid.uuid4())
            group_id = operation.get("group_id")
            operation_type = operation.get("operation")
            parameters = operation.get("parameters", {})
            
            # Execute real operation based on type
            start_time = datetime.utcnow()
            
            if operation_type == "data_scan":
                from .scan_service import ScanService
                scan_service = ScanService()
                result = await scan_service.execute_scan(parameters.get("scan_config", {}))
            elif operation_type == "ml_training":
                from .advanced_ml_service import AdvancedMLService
                ml_service = AdvancedMLService()
                result = await ml_service.train_model(parameters.get("model_config", {}))
            elif operation_type == "data_transformation":
                from .data_profiling_service import DataProfilingService
                profiling_service = DataProfilingService()
                result = await profiling_service.transform_data(parameters.get("transformation_config", {}))
            else:
                # Default action for unknown operations
                from .task_management_service import TaskManagementService
                task_service = TaskManagementService()
                result = await task_service.execute_task(operation_type, parameters)
            
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            result.update({
                "operation_id": operation_id,
                "group_id": group_id,
                "operation": operation_type,
                "status": "completed",
                "execution_time": execution_time,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing operation: {e}")
            raise
    
    async def get_workflow_status(self, workflow_id: str) -> Dict[str, Any]:
        """Get workflow execution status"""
        try:
            # Check active workflows
            if workflow_id in self.active_workflows:
                workflow = self.active_workflows[workflow_id]
                return {
                    "success": True,
                    "workflow_id": workflow_id,
                    "status": workflow["status"],
                    "progress": workflow["progress"],
                    "started_at": workflow["started_at"],
                    "total_operations": len(workflow["operations"]),
                    "completed_operations": len(workflow["results"]),
                    "failed_operations": len(workflow["errors"])
                }
            
            # Check execution history
            for workflow in self.execution_history:
                if workflow["workflow_id"] == workflow_id:
                    return {
                        "success": True,
                        "workflow_id": workflow_id,
                        "status": workflow["status"],
                        "progress": 100.0,
                        "started_at": workflow["started_at"],
                        "completed_at": workflow["completed_at"],
                        "total_operations": len(workflow["operations"]),
                        "completed_operations": len(workflow["results"]),
                        "failed_operations": len(workflow["errors"]),
                        "results": workflow["results"],
                        "errors": workflow["errors"]
                    }
            
            return {
                "success": False,
                "error": f"Workflow not found: {workflow_id}"
            }
            
        except Exception as e:
            logger.error(f"Error getting workflow status: {e}")
            return {"success": False, "error": str(e)}
    
    async def cancel_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Cancel a running workflow"""
        try:
            if workflow_id not in self.active_workflows:
                return {
                    "success": False,
                    "error": f"Workflow not found or not running: {workflow_id}"
                }
            
            workflow = self.active_workflows[workflow_id]
            workflow["status"] = WorkflowStatus.CANCELLED.value
            workflow["completed_at"] = datetime.utcnow().isoformat()
            
            # Move to history
            self.execution_history.append(workflow.copy())
            del self.active_workflows[workflow_id]
            
            logger.info(f"Workflow cancelled: {workflow_id}")
            return {
                "success": True,
                "workflow_id": workflow_id,
                "status": "cancelled"
            }
            
        except Exception as e:
            logger.error(f"Error cancelling workflow: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_workflow_history(
        self,
        limit: int = 50,
        status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get workflow execution history"""
        try:
            history = []
            
            # Add active workflows
            for workflow in self.active_workflows.values():
                if status_filter and workflow["status"] != status_filter:
                    continue
                history.append(workflow)
            
            # Add completed workflows
            for workflow in self.execution_history:
                if status_filter and workflow["status"] != status_filter:
                    continue
                history.append(workflow)
            
            # Sort by started_at (newest first)
            history.sort(key=lambda x: x.get("started_at", ""), reverse=True)
            
            return history[:limit]
            
        except Exception as e:
            logger.error(f"Error getting workflow history: {e}")
            return []
    
    async def get_workflow_metrics(self) -> Dict[str, Any]:
        """Get workflow execution metrics"""
        try:
            metrics = {
                "active_workflows": len(self.active_workflows),
                "total_executions": len(self.execution_history),
                "status_distribution": {},
                "average_execution_time": 0.0,
                "success_rate": 0.0
            }
            
            # Calculate status distribution
            all_workflows = list(self.active_workflows.values()) + self.execution_history
            
            for workflow in all_workflows:
                status = workflow["status"]
                metrics["status_distribution"][status] = metrics["status_distribution"].get(status, 0) + 1
            
            # Calculate average execution time
            execution_times = []
            successful_executions = 0
            
            for workflow in self.execution_history:
                if workflow.get("started_at") and workflow.get("completed_at"):
                    started = datetime.fromisoformat(workflow["started_at"])
                    completed = datetime.fromisoformat(workflow["completed_at"])
                    execution_time = (completed - started).total_seconds()
                    execution_times.append(execution_time)
                    
                    if workflow["status"] == WorkflowStatus.COMPLETED.value:
                        successful_executions += 1
            
            if execution_times:
                metrics["average_execution_time"] = sum(execution_times) / len(execution_times)
            
            if len(self.execution_history) > 0:
                metrics["success_rate"] = successful_executions / len(self.execution_history)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting workflow metrics: {e}")
            return {"error": str(e)}
    
    async def create_workflow_definition(
        self,
        name: str,
        description: str,
        steps: List[Dict[str, Any]],
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new workflow definition"""
        try:
            definition_id = str(uuid.uuid4())
            
            definition = {
                "definition_id": definition_id,
                "name": name,
                "description": description,
                "steps": steps,
                "config": config,
                "created_at": datetime.utcnow().isoformat(),
                "version": "1.0"
            }
            
            self.workflow_definitions[definition_id] = definition
            
            logger.info(f"Workflow definition created: {definition_id} - {name}")
            return {
                "success": True,
                "definition_id": definition_id,
                "definition": definition
            }
            
        except Exception as e:
            logger.error(f"Error creating workflow definition: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_workflow_templates(self) -> List[Dict[str, Any]]:
        """Get available workflow templates"""
        try:
            templates = []
            
            for template_id, config in self.workflow_templates.items():
                templates.append({
                    "template_id": template_id,
                    "name": template_id.replace("_", " ").title(),
                    "description": config["description"],
                    "execution_mode": config["execution_mode"],
                    "max_parallel": config["max_parallel"],
                    "timeout": config["timeout"],
                    "retry_config": config["retry_config"]
                })
            
            return {
                "success": True,
                "templates": templates
            }
            
        except Exception as e:
            logger.error(f"Error getting workflow templates: {e}")
            return {"success": False, "error": str(e)}
