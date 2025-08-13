"""
Enterprise Scan Workflow Engine
Advanced workflow engine for complex, multi-stage scan orchestration with conditional logic,
approval processes, automated workflow management, and intelligent workflow optimization.
Provides enterprise-grade workflow automation for data governance scanning operations.
"""

import asyncio
import json
import logging
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4
from enum import Enum

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..core.logging_config import get_logger
from ..core.config import settings
from ..models.scan_workflow_models import *
from ..services.ai_service import EnterpriseAIService as AIService
from ..services.enterprise_scan_orchestrator import EnterpriseScanOrchestrator
from ..services.scan_intelligence_service import ScanIntelligenceService

logger = get_logger(__name__)

class WorkflowEngineConfig:
    """Configuration for workflow engine"""
    
    def __init__(self):
        self.max_concurrent_workflows = 50
        self.workflow_timeout_hours = 24
        self.stage_timeout_minutes = 60
        self.task_timeout_minutes = 30
        self.retry_max_attempts = 3
        self.retry_delay_seconds = 30
        
        # Workflow optimization
        self.performance_optimization_enabled = True
        self.intelligent_routing_enabled = True
        self.dynamic_prioritization_enabled = True
        self.predictive_scheduling_enabled = True
        
        # Approval settings
        self.approval_timeout_hours = 72
        self.escalation_enabled = True
        self.auto_approval_threshold = 0.9
        
        # Monitoring and alerts
        self.health_check_interval = 300  # 5 minutes
        self.metrics_collection_interval = 60  # 1 minute
        self.alert_threshold_failure_rate = 0.1

class ScanWorkflowEngine:
    """
    Enterprise-grade scan workflow engine providing:
    - Complex multi-stage workflow orchestration
    - Conditional logic and branching
    - Approval workflows and governance
    - Automated workflow management
    - Intelligent workflow optimization
    - Real-time monitoring and analytics
    - Error handling and recovery
    """
    
    def __init__(self):
        self.settings = settings
        self.cache = CacheManager()
        self.ai_service = AIService()
        self.orchestrator = EnterpriseScanOrchestrator()
        self.intelligence_service = ScanIntelligenceService()
        
        self.config = WorkflowEngineConfig()
        self._init_workflow_engine()
        
        # Workflow state management
        self.active_workflows = {}
        self.workflow_queue = deque()
        self.completed_workflows = deque(maxlen=1000)
        self.failed_workflows = deque(maxlen=500)
        
        # Template management
        self.workflow_templates = {}
        self.template_usage_stats = defaultdict(int)
        
        # Stage and task executors
        self.stage_executors = {}
        self.task_handlers = {}
        self.condition_evaluators = {}
        
        # Approval management
        self.pending_approvals = {}
        self.approval_handlers = {}
        self.escalation_queue = deque()
        
        # Workflow metrics
        self.workflow_metrics = {
            'total_workflows_executed': 0,
            'successful_workflows': 0,
            'failed_workflows': 0,
            'average_execution_time': 0.0,
            'workflow_throughput': 0.0,
            'stage_success_rate': {},
            'approval_stats': {
                'pending': 0,
                'approved': 0,
                'rejected': 0,
                'timeout': 0
            },
            'performance_metrics': {
                'cpu_utilization': 0.0,
                'memory_utilization': 0.0,
                'queue_length': 0
            }
        }
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=20)
        
        # Background tasks
        asyncio.create_task(self._workflow_execution_loop())
        asyncio.create_task(self._workflow_monitoring_loop())
        asyncio.create_task(self._approval_management_loop())
        asyncio.create_task(self._performance_optimization_loop())
    
    def _init_workflow_engine(self):
        """Initialize workflow engine components"""
        try:
            # Initialize stage executors
            self.stage_executors = {
                StageType.INITIALIZATION: self._execute_initialization_stage,
                StageType.VALIDATION: self._execute_validation_stage,
                StageType.PROCESSING: self._execute_processing_stage,
                StageType.ANALYSIS: self._execute_analysis_stage,
                StageType.REPORTING: self._execute_reporting_stage,
                StageType.CLEANUP: self._execute_cleanup_stage,
                StageType.NOTIFICATION: self._execute_notification_stage,
                StageType.APPROVAL: self._execute_approval_stage,
                StageType.CUSTOM: self._execute_custom_stage
            }
            
            # Initialize task handlers
            self.task_handlers = {
                TaskType.SCAN_EXECUTION: self._handle_scan_execution_task,
                TaskType.DATA_COLLECTION: self._handle_data_collection_task,
                TaskType.QUALITY_ASSESSMENT: self._handle_quality_assessment_task,
                TaskType.COMPLIANCE_CHECK: self._handle_compliance_check_task,
                TaskType.CLASSIFICATION: self._handle_classification_task,
                TaskType.LINEAGE_TRACKING: self._handle_lineage_tracking_task,
                TaskType.NOTIFICATION: self._handle_notification_task,
                TaskType.APPROVAL_REQUEST: self._handle_approval_request_task,
                TaskType.DATA_EXPORT: self._handle_data_export_task,
                TaskType.CUSTOM_SCRIPT: self._handle_custom_script_task
            }
            
            # Initialize condition evaluators
            self.condition_evaluators = {
                ConditionOperator.EQUALS: lambda a, b: a == b,
                ConditionOperator.NOT_EQUALS: lambda a, b: a != b,
                ConditionOperator.GREATER_THAN: lambda a, b: float(a) > float(b),
                ConditionOperator.LESS_THAN: lambda a, b: float(a) < float(b),
                ConditionOperator.GREATER_THAN_OR_EQUAL: lambda a, b: float(a) >= float(b),
                ConditionOperator.LESS_THAN_OR_EQUAL: lambda a, b: float(a) <= float(b),
                ConditionOperator.CONTAINS: lambda a, b: str(b) in str(a),
                ConditionOperator.NOT_CONTAINS: lambda a, b: str(b) not in str(a),
                ConditionOperator.STARTS_WITH: lambda a, b: str(a).startswith(str(b)),
                ConditionOperator.ENDS_WITH: lambda a, b: str(a).endswith(str(b)),
                ConditionOperator.REGEX_MATCH: self._regex_match,
                ConditionOperator.IN_LIST: lambda a, b: a in (b if isinstance(b, list) else [b])
            }
            
            logger.info("Workflow engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize workflow engine: {e}")
            raise
    
    async def create_workflow_template(
        self,
        template_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create a new workflow template
        
        Args:
            template_data: Template configuration data
            
        Returns:
            Created template information
        """
        template_id = str(uuid4())
        
        try:
            # Validate template structure
            validation_result = await self._validate_template_structure(template_data)
            if not validation_result["valid"]:
                return {
                    "template_id": template_id,
                    "status": "validation_failed",
                    "errors": validation_result["errors"]
                }
            
            # Create template object
            template = ScanWorkflowTemplate(
                template_id=template_id,
                template_name=template_data["name"],
                workflow_type=WorkflowType(template_data["type"]),
                description=template_data.get("description"),
                version=template_data.get("version", "1.0"),
                configuration=template_data.get("configuration", {}),
                stage_definitions=template_data.get("stages", []),
                default_parameters=template_data.get("default_parameters", {}),
                is_active=template_data.get("is_active", True),
                created_by=template_data.get("created_by", "system")
            )
            
            # Store template
            self.workflow_templates[template_id] = template
            
            # Generate workflow optimization suggestions
            optimization_suggestions = await self._analyze_template_performance(template)
            
            logger.info(f"Workflow template created: {template_id}")
            
            return {
                "template_id": template_id,
                "status": "created",
                "template": template.__dict__,
                "validation_result": validation_result,
                "optimization_suggestions": optimization_suggestions
            }
            
        except Exception as e:
            logger.error(f"Failed to create workflow template: {e}")
            return {
                "template_id": template_id,
                "status": "failed",
                "error": str(e)
            }
    
    async def execute_workflow(
        self,
        template_id: str,
        workflow_data: Dict[str, Any],
        execution_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Execute a workflow based on template
        
        Args:
            template_id: Template identifier
            workflow_data: Workflow execution data
            execution_context: Optional execution context
            
        Returns:
            Workflow execution information
        """
        workflow_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Get template
            template = self.workflow_templates.get(template_id)
            if not template:
                return {
                    "workflow_id": workflow_id,
                    "status": "failed",
                    "error": f"Template not found: {template_id}"
                }
            
            # Create workflow instance
            workflow = ScanWorkflow(
                workflow_id=workflow_id,
                workflow_name=workflow_data.get("name", template.template_name),
                template_id=template_id,
                workflow_type=template.workflow_type,
                priority=WorkflowPriority(workflow_data.get("priority", "normal")),
                description=workflow_data.get("description"),
                parameters=workflow_data.get("parameters", {}),
                variables=workflow_data.get("variables", {}),
                context=execution_context or {},
                created_by=workflow_data.get("created_by", "system")
            )
            
            # Merge template default parameters
            workflow.parameters.update(template.default_parameters)
            
            # Initialize workflow stages
            await self._initialize_workflow_stages(workflow, template)
            
            # Add to active workflows
            self.active_workflows[workflow_id] = workflow
            
            # Queue for execution
            self.workflow_queue.append(workflow_id)
            
            # Update metrics
            self.workflow_metrics['total_workflows_executed'] += 1
            self.template_usage_stats[template_id] += 1
            
            logger.info(f"Workflow queued for execution: {workflow_id}")
            
            return {
                "workflow_id": workflow_id,
                "status": "queued",
                "template_id": template_id,
                "workflow": workflow.__dict__,
                "estimated_duration": await self._estimate_workflow_duration(workflow, template),
                "queue_position": len(self.workflow_queue)
            }
            
        except Exception as e:
            logger.error(f"Failed to execute workflow: {e}")
            return {
                "workflow_id": workflow_id,
                "status": "failed",
                "error": str(e),
                "execution_time": time.time() - start_time
            }
    
    async def _initialize_workflow_stages(
        self,
        workflow: ScanWorkflow,
        template: ScanWorkflowTemplate
    ):
        """Initialize workflow stages from template"""
        
        try:
            stages = []
            
            for stage_def in template.stage_definitions:
                stage = WorkflowStage(
                    stage_id=str(uuid4()),
                    stage_name=stage_def["name"],
                    workflow_id=workflow.workflow_id,
                    stage_type=StageType(stage_def["type"]),
                    stage_order=stage_def["order"],
                    description=stage_def.get("description"),
                    configuration=stage_def.get("configuration", {}),
                    dependencies=stage_def.get("dependencies", []),
                    timeout_seconds=stage_def.get("timeout_seconds", self.config.stage_timeout_minutes * 60),
                    retry_attempts=stage_def.get("retry_attempts", self.config.retry_max_attempts),
                    is_optional=stage_def.get("is_optional", False),
                    is_parallel=stage_def.get("is_parallel", False)
                )
                
                # Initialize stage tasks
                tasks = []
                for task_def in stage_def.get("tasks", []):
                    task = WorkflowTask(
                        task_id=str(uuid4()),
                        task_name=task_def["name"],
                        stage_id=stage.stage_id,
                        task_type=TaskType(task_def["type"]),
                        task_order=task_def["order"],
                        description=task_def.get("description"),
                        configuration=task_def.get("configuration", {}),
                        timeout_seconds=task_def.get("timeout_seconds", self.config.task_timeout_minutes * 60),
                        retry_strategy=RetryStrategy(task_def.get("retry_strategy", "exponential_backoff")),
                        is_critical=task_def.get("is_critical", True)
                    )
                    tasks.append(task)
                
                stage.tasks = tasks
                
                # Initialize stage conditions
                conditions = []
                for condition_def in stage_def.get("conditions", []):
                    condition = WorkflowCondition(
                        condition_id=str(uuid4()),
                        stage_id=stage.stage_id,
                        condition_name=condition_def["name"],
                        condition_type=condition_def["type"],
                        left_operand=condition_def["left_operand"],
                        operator=ConditionOperator(condition_def["operator"]),
                        right_operand=condition_def["right_operand"],
                        description=condition_def.get("description")
                    )
                    conditions.append(condition)
                
                stage.conditions = conditions
                stages.append(stage)
            
            workflow.stages = stages
            
        except Exception as e:
            logger.error(f"Failed to initialize workflow stages: {e}")
            raise
    
    async def _execute_workflow_instance(self, workflow_id: str):
        """Execute a workflow instance"""
        
        try:
            workflow = self.active_workflows.get(workflow_id)
            if not workflow:
                logger.error(f"Workflow not found: {workflow_id}")
                return
            
            # Update workflow status
            workflow.status = WorkflowStatus.RUNNING
            workflow.started_at = datetime.utcnow()
            
            logger.info(f"Starting workflow execution: {workflow_id}")
            
            # Execute stages in order
            for stage in sorted(workflow.stages, key=lambda s: s.stage_order):
                try:
                    # Check if stage should be executed
                    if not await self._should_execute_stage(stage, workflow):
                        logger.info(f"Skipping stage {stage.stage_id} - conditions not met")
                        stage.status = StageStatus.SKIPPED
                        continue
                    
                    # Check stage dependencies
                    if not await self._check_stage_dependencies(stage, workflow):
                        logger.warning(f"Stage dependencies not met: {stage.stage_id}")
                        stage.status = StageStatus.FAILED
                        stage.error_message = "Stage dependencies not satisfied"
                        
                        if not stage.is_optional:
                            workflow.status = WorkflowStatus.FAILED
                            workflow.error_message = f"Critical stage failed: {stage.stage_name}"
                            break
                        continue
                    
                    # Execute stage
                    stage_result = await self._execute_stage(stage, workflow)
                    
                    if stage_result["status"] == "failed" and not stage.is_optional:
                        workflow.status = WorkflowStatus.FAILED
                        workflow.error_message = f"Critical stage failed: {stage.stage_name}"
                        break
                    
                    # Update workflow progress
                    workflow.progress_percentage = self._calculate_workflow_progress(workflow)
                    
                except Exception as e:
                    logger.error(f"Stage execution failed: {stage.stage_id} - {e}")
                    stage.status = StageStatus.FAILED
                    stage.error_message = str(e)
                    
                    if not stage.is_optional:
                        workflow.status = WorkflowStatus.FAILED
                        workflow.error_message = f"Stage execution error: {str(e)}"
                        break
            
            # Finalize workflow
            if workflow.status == WorkflowStatus.RUNNING:
                workflow.status = WorkflowStatus.COMPLETED
                workflow.progress_percentage = 100.0
            
            workflow.completed_at = datetime.utcnow()
            
            # Move to completed workflows
            if workflow.status == WorkflowStatus.COMPLETED:
                self.completed_workflows.append(workflow)
                self.workflow_metrics['successful_workflows'] += 1
            else:
                self.failed_workflows.append(workflow)
                self.workflow_metrics['failed_workflows'] += 1
            
            # Remove from active workflows
            del self.active_workflows[workflow_id]
            
            # Generate workflow report
            workflow_report = await self._generate_workflow_report(workflow)
            
            logger.info(f"Workflow execution completed: {workflow_id} - Status: {workflow.status.value}")
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {workflow_id} - {e}")
            if workflow_id in self.active_workflows:
                workflow = self.active_workflows[workflow_id]
                workflow.status = WorkflowStatus.FAILED
                workflow.error_message = str(e)
                workflow.completed_at = datetime.utcnow()
                
                self.failed_workflows.append(workflow)
                self.workflow_metrics['failed_workflows'] += 1
                del self.active_workflows[workflow_id]
    
    async def _execute_stage(
        self,
        stage: WorkflowStage,
        workflow: ScanWorkflow
    ) -> Dict[str, Any]:
        """Execute a workflow stage"""
        
        stage_start_time = time.time()
        
        try:
            stage.status = StageStatus.RUNNING
            stage.started_at = datetime.utcnow()
            
            logger.info(f"Executing stage: {stage.stage_id} - {stage.stage_name}")
            
            # Get stage executor
            executor = self.stage_executors.get(stage.stage_type)
            if not executor:
                return {
                    "status": "failed",
                    "error": f"No executor found for stage type: {stage.stage_type.value}"
                }
            
            # Execute stage with timeout
            try:
                stage_result = await asyncio.wait_for(
                    executor(stage, workflow),
                    timeout=stage.timeout_seconds
                )
            except asyncio.TimeoutError:
                return {
                    "status": "failed",
                    "error": f"Stage execution timeout: {stage.timeout_seconds} seconds"
                }
            
            # Update stage status
            if stage_result.get("status") == "completed":
                stage.status = StageStatus.COMPLETED
                stage.output = stage_result.get("output", {})
            else:
                stage.status = StageStatus.FAILED
                stage.error_message = stage_result.get("error", "Unknown error")
            
            stage.completed_at = datetime.utcnow()
            stage.execution_time_seconds = time.time() - stage_start_time
            
            return stage_result
            
        except Exception as e:
            logger.error(f"Stage execution error: {stage.stage_id} - {e}")
            stage.status = StageStatus.FAILED
            stage.error_message = str(e)
            stage.completed_at = datetime.utcnow()
            stage.execution_time_seconds = time.time() - stage_start_time
            
            return {
                "status": "failed",
                "error": str(e)
            }
    
    async def _execute_initialization_stage(
        self,
        stage: WorkflowStage,
        workflow: ScanWorkflow
    ) -> Dict[str, Any]:
        """Execute initialization stage"""
        
        try:
            # Initialize workflow variables
            workflow.variables.update(stage.configuration.get("initial_variables", {}))
            
            # Validate workflow parameters
            required_params = stage.configuration.get("required_parameters", [])
            missing_params = [param for param in required_params if param not in workflow.parameters]
            
            if missing_params:
                return {
                    "status": "failed",
                    "error": f"Missing required parameters: {missing_params}"
                }
            
            # Setup workflow context
            workflow.context.update({
                "initialized_at": datetime.utcnow().isoformat(),
                "initialization_stage_id": stage.stage_id
            })
            
            return {
                "status": "completed",
                "output": {
                    "initialized_variables": len(workflow.variables),
                    "validated_parameters": len(workflow.parameters)
                }
            }
            
        except Exception as e:
            return {"status": "failed", "error": str(e)}
    
    async def _execute_validation_stage(
        self,
        stage: WorkflowStage,
        workflow: ScanWorkflow
    ) -> Dict[str, Any]:
        """Execute validation stage"""
        
        try:
            validation_results = {}
            
            # Validate data sources
            if "data_source_validation" in stage.configuration:
                data_source_validation = await self._validate_data_sources(
                    stage.configuration["data_source_validation"],
                    workflow
                )
                validation_results["data_sources"] = data_source_validation
            
            # Validate scan rules
            if "scan_rule_validation" in stage.configuration:
                rule_validation = await self._validate_scan_rules(
                    stage.configuration["scan_rule_validation"],
                    workflow
                )
                validation_results["scan_rules"] = rule_validation
            
            # Validate permissions
            if "permission_validation" in stage.configuration:
                permission_validation = await self._validate_permissions(
                    stage.configuration["permission_validation"],
                    workflow
                )
                validation_results["permissions"] = permission_validation
            
            # Check if all validations passed
            all_passed = all(
                result.get("valid", False) for result in validation_results.values()
            )
            
            if not all_passed:
                failed_validations = [
                    name for name, result in validation_results.items()
                    if not result.get("valid", False)
                ]
                return {
                    "status": "failed",
                    "error": f"Validation failed: {failed_validations}",
                    "validation_results": validation_results
                }
            
            return {
                "status": "completed",
                "output": {
                    "validation_results": validation_results,
                    "all_validations_passed": True
                }
            }
            
        except Exception as e:
            return {"status": "failed", "error": str(e)}
    
    async def _execute_processing_stage(
        self,
        stage: WorkflowStage,
        workflow: ScanWorkflow
    ) -> Dict[str, Any]:
        """Execute processing stage"""
        
        try:
            processing_results = []
            
            # Execute stage tasks
            for task in sorted(stage.tasks, key=lambda t: t.task_order):
                task_result = await self._execute_task(task, stage, workflow)
                processing_results.append(task_result)
                
                # Check if critical task failed
                if task.is_critical and task_result.get("status") == "failed":
                    return {
                        "status": "failed",
                        "error": f"Critical task failed: {task.task_name}",
                        "task_results": processing_results
                    }
            
            return {
                "status": "completed",
                "output": {
                    "task_results": processing_results,
                    "total_tasks": len(stage.tasks),
                    "successful_tasks": len([r for r in processing_results if r.get("status") == "completed"])
                }
            }
            
        except Exception as e:
            return {"status": "failed", "error": str(e)}
    
    async def _execute_task(
        self,
        task: WorkflowTask,
        stage: WorkflowStage,
        workflow: ScanWorkflow
    ) -> Dict[str, Any]:
        """Execute a workflow task"""
        
        task_start_time = time.time()
        
        try:
            task.status = TaskStatus.RUNNING
            task.started_at = datetime.utcnow()
            
            # Get task handler
            handler = self.task_handlers.get(task.task_type)
            if not handler:
                return {
                    "task_id": task.task_id,
                    "status": "failed",
                    "error": f"No handler found for task type: {task.task_type.value}"
                }
            
            # Execute task with retry logic
            result = await self._execute_task_with_retry(
                handler, task, stage, workflow
            )
            
            # Update task status
            if result.get("status") == "completed":
                task.status = TaskStatus.COMPLETED
                task.output = result.get("output", {})
            else:
                task.status = TaskStatus.FAILED
                task.error_message = result.get("error", "Unknown error")
            
            task.completed_at = datetime.utcnow()
            task.execution_time_seconds = time.time() - task_start_time
            
            return result
            
        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            task.completed_at = datetime.utcnow()
            task.execution_time_seconds = time.time() - task_start_time
            
            return {
                "task_id": task.task_id,
                "status": "failed",
                "error": str(e)
            }
    
    # Task handlers
    async def _handle_scan_execution_task(
        self,
        task: WorkflowTask,
        stage: WorkflowStage,
        workflow: ScanWorkflow
    ) -> Dict[str, Any]:
        """Handle scan execution task"""
        
        try:
            scan_config = task.configuration.get("scan_configuration", {})
            
            # Submit scan to orchestrator
            scan_result = await self.orchestrator.submit_scan_request(
                scan_config, None  # No background tasks in workflow context
            )
            
            # Wait for scan completion
            execution_id = scan_result.get("execution_id")
            if execution_id:
                # Monitor scan progress
                scan_status = await self._monitor_scan_execution(execution_id, task.timeout_seconds)
                
                return {
                    "task_id": task.task_id,
                    "status": "completed" if scan_status.get("status") == "completed" else "failed",
                    "output": scan_status,
                    "execution_id": execution_id
                }
            
            return {
                "task_id": task.task_id,
                "status": "failed",
                "error": "Failed to submit scan request"
            }
            
        except Exception as e:
            return {
                "task_id": task.task_id,
                "status": "failed",
                "error": str(e)
            }
    
    # Background task loops
    async def _workflow_execution_loop(self):
        """Main workflow execution loop"""
        while True:
            try:
                # Process workflow queue
                if self.workflow_queue and len(self.active_workflows) < self.config.max_concurrent_workflows:
                    workflow_id = self.workflow_queue.popleft()
                    
                    # Execute workflow in background
                    asyncio.create_task(self._execute_workflow_instance(workflow_id))
                
                await asyncio.sleep(1)  # Check every second
                
            except Exception as e:
                logger.error(f"Workflow execution loop error: {e}")
    
    async def _workflow_monitoring_loop(self):
        """Monitor workflow health and performance"""
        while True:
            try:
                await asyncio.sleep(self.config.health_check_interval)
                
                # Check for timed out workflows
                await self._check_workflow_timeouts()
                
                # Update workflow metrics
                await self._update_workflow_metrics()
                
                # Check workflow health
                await self._check_workflow_health()
                
            except Exception as e:
                logger.error(f"Workflow monitoring loop error: {e}")
    
    async def _approval_management_loop(self):
        """Manage workflow approvals"""
        while True:
            try:
                await asyncio.sleep(300)  # Check every 5 minutes
                
                # Check for approval timeouts
                await self._check_approval_timeouts()
                
                # Process escalations
                await self._process_approval_escalations()
                
                # Auto-approve eligible workflows
                await self._process_auto_approvals()
                
            except Exception as e:
                logger.error(f"Approval management loop error: {e}")
    
    async def _performance_optimization_loop(self):
        """Optimize workflow performance"""
        while True:
            try:
                await asyncio.sleep(3600)  # Run every hour
                
                # Analyze workflow performance
                await self._analyze_workflow_performance()
                
                # Optimize workflow templates
                await self._optimize_workflow_templates()
                
                # Update performance baselines
                await self._update_performance_baselines()
                
            except Exception as e:
                logger.error(f"Performance optimization loop error: {e}")
    
    async def get_workflow_insights(self) -> Dict[str, Any]:
        """Get comprehensive workflow engine insights"""
        
        return {
            "workflow_metrics": self.workflow_metrics.copy(),
            "active_workflows": len(self.active_workflows),
            "workflow_queue_size": len(self.workflow_queue),
            "workflow_templates": len(self.workflow_templates),
            "pending_approvals": len(self.pending_approvals),
            "template_usage_stats": dict(self.template_usage_stats),
            "engine_status": {
                "max_concurrent_workflows": self.config.max_concurrent_workflows,
                "workflow_timeout_hours": self.config.workflow_timeout_hours,
                "performance_optimization_enabled": self.config.performance_optimization_enabled,
                "intelligent_routing_enabled": self.config.intelligent_routing_enabled
            },
            "recent_completions": len(self.completed_workflows),
            "recent_failures": len(self.failed_workflows)
        }