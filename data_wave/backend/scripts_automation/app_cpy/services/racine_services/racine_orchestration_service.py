"""
Racine Orchestration Service - Master Orchestration System
==========================================================

This service serves as the master orchestration controller for the Racine Main Manager system,
providing comprehensive coordination and management across ALL 7 data governance groups:

1. Data Sources - Connection and discovery orchestration
2. Scan Rule Sets - Rule execution and management orchestration  
3. Classifications - Classification workflow orchestration
4. Compliance Rules - Compliance validation orchestration
5. Advanced Catalog - Catalog management orchestration
6. Scan Logic - Scan execution orchestration
7. RBAC System - Security and access orchestration

Features:
- Master orchestration controller for cross-group operations
- Real-time system health monitoring across all groups
- Advanced workflow execution with cross-group coordination
- Performance metrics aggregation and optimization
- Resource allocation and management
- Error tracking and recovery mechanisms
- Integration status monitoring and management
- Enterprise-grade audit trails and compliance tracking

All functionality is designed for seamless integration with existing backend implementations
while providing enterprise-grade scalability, performance, and security.
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import logging
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from enum import Enum
import traceback
import copy
from collections import defaultdict, deque
import networkx as nx

# FastAPI and Database imports
from fastapi import HTTPException, BackgroundTasks
from sqlmodel import Session, select, func, desc, or_, and_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, validator

# CRITICAL: Import ALL existing services for comprehensive integration
# Data Sources Group
from ..data_source_service import DataSourceService
from ..data_source_connection_service import DataSourceConnectionService

# Scan Rule Sets Group  
from ..scan_rule_set_service import ScanRuleSetService
from ..enterprise_scan_rule_service import EnterpriseScanRuleService
from ..custom_scan_rule_service import CustomScanRuleService

# Classifications Group
from ..classification_service import ClassificationService
from ..intelligent_discovery_service import IntelligentDiscoveryService

# Compliance Rules Group
from ..compliance_rule_service import ComplianceRuleService
from ..compliance_service import ComplianceService
from ..compliance_production_services import ComplianceReportService as ComplianceProductionService

# Advanced Catalog Group
from ..enterprise_catalog_service import EnterpriseIntelligentCatalogService as EnterpriseCatalogService
from ..catalog_service import EnhancedCatalogService as CatalogService
from ..catalog_analytics_service import CatalogAnalyticsService
from ..catalog_collaboration_service import CatalogCollaborationService

# Scan Logic Group
from ..unified_scan_orchestrator import UnifiedScanOrchestrator
from ..scan_orchestration_service import ScanOrchestrationService
from ..scan_intelligence_service import ScanIntelligenceService
from ..scan_performance_optimizer import ScanPerformanceOptimizer

# RBAC System Group (lazy-imported inside registry to avoid circular imports)

# AI and Analytics Services
from ..advanced_ai_service import AdvancedAIService
from ..ai_service import EnterpriseAIService as AIService
from ..comprehensive_analytics_service import ComprehensiveAnalyticsService
from ..advanced_analytics_service import AdvancedAnalyticsService

# Workflow and Task Management
from ..advanced_workflow_service import AdvancedWorkflowService
from ..task_service import TaskService
from ..scan_workflow_engine import ScanWorkflowEngine

# Integration and Performance
from ..enterprise_integration_service import EnterpriseIntegrationService
from ..integration_service import IntegrationService
from ..performance_service import PerformanceService
from ..unified_governance_coordinator import UnifiedGovernanceCoordinator

# Import Racine models
from ...models.racine_models.racine_orchestration_models import (
    RacineOrchestrationMaster,
    RacineWorkflowExecution,
    RacineSystemHealth,
    RacineCrossGroupIntegration,
    RacinePerformanceMetrics,
    RacineResourceAllocation,
    RacineErrorLog,
    RacineIntegrationStatus,
    OrchestrationStatus,
    OrchestrationPriority,
    SystemHealthStatus,
    GroupIntegrationStatus,
    WorkflowExecutionStatus,
    ResourceType
)

# Import existing models for integration
from ...models.scan_models import DataSource, ScanRuleSet, Scan, ScanResult
from ...models.classification_models import ClassificationRule, ClassificationResult
from ...models.compliance_models import ComplianceRequirement as ComplianceRule, ComplianceValidation
from ...models.advanced_catalog_models import IntelligentDataAsset, EnterpriseDataLineage
from ...models.scan_models import ScanOrchestrationJob
from ...models.scan_orchestration_models import OrchestrationStageExecution as UnifiedScanExecution
from ...models.auth_models import User, Role, Permission

# Setup logging
logger = logging.getLogger(__name__)

@dataclass
class ServiceRegistryEntry:
    """Registry entry for tracking service instances and their health."""
    service_instance: Any
    service_name: str
    group_id: str
    last_health_check: datetime
    health_status: str
    error_count: int = 0
    last_error: Optional[str] = None
    performance_metrics: Dict[str, Any] = field(default_factory=dict)

@dataclass
class WorkflowStepResult:
    """Result of a workflow step execution."""
    step_id: str
    step_name: str
    group_id: str
    operation: str
    status: str
    result: Dict[str, Any]
    error: Optional[str] = None
    duration_seconds: float = 0.0
    resource_usage: Dict[str, Any] = field(default_factory=dict)

class RacineOrchestrationService:
    """
    Master Orchestration Service for Racine Main Manager
    
    This service orchestrates ALL existing services across the 7 groups:
    1. Data Sources
    2. Scan Rule Sets  
    3. Classifications
    4. Compliance Rules
    5. Advanced Catalog
    6. Scan Logic
    7. RBAC System
    
    Features:
    - Cross-group workflow execution
    - Real-time system health monitoring
    - Performance optimization
    - Resource coordination
    - Error handling and recovery
    - Integration management
    """
    
    def __init__(self, db_session: Session):
        self.db = db_session
        self.logger = logging.getLogger(__name__)
        
        # CRITICAL: Initialize ALL existing services - FULL INTEGRATION
        self._initialize_service_registry()
        
        # Performance tracking
        self.performance_metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'average_response_time': 0.0,
            'last_health_check': datetime.utcnow(),
            'system_start_time': datetime.utcnow()
        }
        
        # Workflow execution tracking
        self.active_workflows: Dict[str, RacineWorkflowExecution] = {}
        self.workflow_queue = deque()
        self.resource_pool = {}
        
        # Health monitoring
        self.health_check_interval = 30  # seconds
        self.last_health_check = datetime.utcnow()
        
        # Start background tasks
        self._start_background_tasks()
    
    def _initialize_service_registry(self):
        """Initialize comprehensive service registry with ALL existing services."""
        try:
            self.service_registry: Dict[str, ServiceRegistryEntry] = {}
            
            # Data Sources Group Services
            self._register_service('data_sources', 'DataSourceService', DataSourceService(self.db))
            self._register_service('data_sources', 'DataSourceConnectionService', DataSourceConnectionService(self.db))
            
            # Scan Rule Sets Group Services
            self._register_service('scan_rule_sets', 'ScanRuleSetService', ScanRuleSetService(self.db))
            self._register_service('scan_rule_sets', 'EnterpriseScanRuleService', EnterpriseScanRuleService(self.db))
            self._register_service('scan_rule_sets', 'CustomScanRuleService', CustomScanRuleService(self.db))
            
            # Classifications Group Services
            self._register_service('classifications', 'ClassificationService', ClassificationService(self.db))
            self._register_service('classifications', 'IntelligentDiscoveryService', IntelligentDiscoveryService(self.db))
            
            # Compliance Rules Group Services
            self._register_service('compliance_rules', 'ComplianceRuleService', ComplianceRuleService(self.db))
            self._register_service('compliance_rules', 'ComplianceService', ComplianceService(self.db))
            self._register_service('compliance_rules', 'ComplianceProductionService', ComplianceProductionService(self.db))
            
            # Advanced Catalog Group Services
            self._register_service('advanced_catalog', 'EnterpriseCatalogService', EnterpriseCatalogService(self.db))
            self._register_service('advanced_catalog', 'CatalogService', CatalogService(self.db))
            self._register_service('advanced_catalog', 'CatalogAnalyticsService', CatalogAnalyticsService(self.db))
            self._register_service('advanced_catalog', 'CatalogCollaborationService', CatalogCollaborationService(self.db))
            
            # Scan Logic Group Services
            self._register_service('scan_logic', 'UnifiedScanOrchestrator', UnifiedScanOrchestrator(self.db))
            self._register_service('scan_logic', 'ScanOrchestrationService', ScanOrchestrationService(self.db))
            self._register_service('scan_logic', 'ScanIntelligenceService', ScanIntelligenceService(self.db))
            self._register_service('scan_logic', 'ScanPerformanceOptimizer', ScanPerformanceOptimizer(self.db))
            
            # RBAC System Group Services (lazy import to avoid circulars)
            from ..rbac_service import RBACService
            from ..auth_service import AuthService
            from ..role_service import RoleService
            from ..security_service import SecurityService
            self._register_service('rbac_system', 'RBACService', RBACService(self.db))
            self._register_service('rbac_system', 'AuthService', AuthService(self.db))
            self._register_service('rbac_system', 'RoleService', RoleService(self.db))
            self._register_service('rbac_system', 'SecurityService', SecurityService(self.db))
            
            # AI and Analytics Services (Cross-cutting)
            self._register_service('ai_analytics', 'AdvancedAIService', AdvancedAIService(self.db))
            self._register_service('ai_analytics', 'AIService', AIService(self.db))
            from ..ml_service import EnterpriseMLService
            self._register_service('ai_analytics', 'MLService', EnterpriseMLService())
            self._register_service('ai_analytics', 'ComprehensiveAnalyticsService', ComprehensiveAnalyticsService(self.db))
            self._register_service('ai_analytics', 'AdvancedAnalyticsService', AdvancedAnalyticsService(self.db))
            
            # Workflow and Task Management Services
            self._register_service('workflow_management', 'AdvancedWorkflowService', AdvancedWorkflowService(self.db))
            self._register_service('workflow_management', 'TaskService', TaskService(self.db))
            self._register_service('workflow_management', 'ScanWorkflowEngine', ScanWorkflowEngine(self.db))
            
            # Integration and Performance Services
            self._register_service('integration', 'EnterpriseIntegrationService', EnterpriseIntegrationService(self.db))
            self._register_service('integration', 'IntegrationService', IntegrationService(self.db))
            self._register_service('integration', 'PerformanceService', PerformanceService(self.db))
            self._register_service('integration', 'UnifiedGovernanceCoordinator', UnifiedGovernanceCoordinator(self.db))
            
            self.logger.info(f"Initialized service registry with {len(self.service_registry)} services across all groups")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize service registry: {str(e)}")
            raise
    
    def _register_service(self, group_id: str, service_name: str, service_instance: Any):
        """Register a service in the service registry."""
        try:
            registry_key = f"{group_id}.{service_name}"
            self.service_registry[registry_key] = ServiceRegistryEntry(
                service_instance=service_instance,
                service_name=service_name,
                group_id=group_id,
                last_health_check=datetime.utcnow(),
                health_status='healthy'
            )
            self.logger.debug(f"Registered service: {registry_key}")
        except Exception as e:
            self.logger.error(f"Failed to register service {service_name}: {str(e)}")
    
    def _start_background_tasks(self):
        """Start background monitoring and maintenance tasks."""
        try:
            # Start health monitoring in background thread
            self.health_monitor_thread = threading.Thread(
                target=self._health_monitor_loop,
                daemon=True
            )
            self.health_monitor_thread.start()
            
            # Start workflow processor in background thread
            self.workflow_processor_thread = threading.Thread(
                target=self._workflow_processor_loop,
                daemon=True
            )
            self.workflow_processor_thread.start()
            
            self.logger.info("Started background monitoring tasks")
            
        except Exception as e:
            self.logger.error(f"Failed to start background tasks: {str(e)}")
    
    def _health_monitor_loop(self):
        """Background loop for monitoring system health."""
        while True:
            try:
                time.sleep(self.health_check_interval)
                asyncio.run(self._perform_health_check())
            except Exception as e:
                self.logger.error(f"Health monitor error: {str(e)}")
    
    def _workflow_processor_loop(self):
        """Background loop for processing workflow queue."""
        while True:
            try:
                if self.workflow_queue:
                    workflow_id = self.workflow_queue.popleft()
                    if workflow_id in self.active_workflows:
                        asyncio.run(self._process_workflow_step(workflow_id))
                time.sleep(1)  # Process every second
            except Exception as e:
                self.logger.error(f"Workflow processor error: {str(e)}")
    
    async def create_orchestration_master(
        self, 
        name: str, 
        description: str, 
        orchestration_type: str,
        connected_groups: List[str],
        configurations: Dict[str, Any],
        created_by: str
    ) -> RacineOrchestrationMaster:
        """
        Create a new master orchestration instance.
        Validates and connects to all specified groups.
        """
        try:
            self.performance_metrics['total_requests'] += 1
            start_time = time.time()
            
            # Validate connected groups
            valid_groups = ['data_sources', 'scan_rule_sets', 'classifications', 
                          'compliance_rules', 'advanced_catalog', 'scan_logic', 'rbac_system']
            invalid_groups = [g for g in connected_groups if g not in valid_groups]
            
            if invalid_groups:
                raise ValueError(f"Invalid groups specified: {invalid_groups}")
            
            # Create orchestration master
            orchestration = RacineOrchestrationMaster(
                name=name,
                description=description,
                orchestration_type=orchestration_type,
                connected_groups=connected_groups,
                group_configurations=configurations,
                created_by=created_by,
                status=OrchestrationStatus.INITIALIZING,
                health_status=SystemHealthStatus.HEALTHY
            )
            
            self.db.add(orchestration)
            self.db.commit()
            self.db.refresh(orchestration)
            
            # Initialize connections to all specified groups
            await self._initialize_group_connections(orchestration.id, connected_groups, configurations)
            
            # Update status to active
            orchestration.status = OrchestrationStatus.ACTIVE
            orchestration.health_status = SystemHealthStatus.HEALTHY
            self.db.commit()
            
            # Track performance
            duration = time.time() - start_time
            self.performance_metrics['successful_requests'] += 1
            self._update_average_response_time(duration)
            
            self.logger.info(f"Created orchestration master: {orchestration.id}")
            return orchestration
            
        except Exception as e:
            self.performance_metrics['failed_requests'] += 1
            self.logger.error(f"Failed to create orchestration master: {str(e)}")
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    
    async def execute_cross_group_workflow(
        self,
        orchestration_id: str,
        workflow_definition: Dict[str, Any],
        parameters: Dict[str, Any] = None
    ) -> RacineWorkflowExecution:
        """
        Execute a cross-group workflow.
        Coordinates execution across multiple existing services.
        """
        try:
            self.performance_metrics['total_requests'] += 1
            start_time = time.time()
            
            # Validate orchestration exists
            orchestration = self.db.query(RacineOrchestrationMaster).filter(
                RacineOrchestrationMaster.id == orchestration_id
            ).first()
            
            if not orchestration:
                raise ValueError(f"Orchestration not found: {orchestration_id}")
            
            # Create workflow execution record
            execution = RacineWorkflowExecution(
                orchestration_id=orchestration_id,
                workflow_name=workflow_definition.get('name', 'Unnamed Workflow'),
                workflow_definition=workflow_definition,
                status=WorkflowExecutionStatus.RUNNING,
                total_steps=len(workflow_definition.get('steps', [])),
                start_time=datetime.utcnow(),
                parameters=parameters or {},
                involved_groups=self._extract_involved_groups(workflow_definition),
                triggered_by=parameters.get('triggered_by', 'system') if parameters else 'system'
            )
            
            self.db.add(execution)
            self.db.commit()
            self.db.refresh(execution)
            
            # Add to active workflows
            self.active_workflows[execution.id] = execution
            
            # Execute workflow steps
            await self._execute_workflow_steps(execution, workflow_definition, parameters or {})
            
            # Track performance
            duration = time.time() - start_time
            self.performance_metrics['successful_requests'] += 1
            self._update_average_response_time(duration)
            
            return execution
            
        except Exception as e:
            self.performance_metrics['failed_requests'] += 1
            self.logger.error(f"Failed to execute cross-group workflow: {str(e)}")
            if 'execution' in locals():
                execution.status = WorkflowExecutionStatus.FAILED
                execution.end_time = datetime.utcnow()
                execution.errors = [{'error': str(e), 'timestamp': datetime.utcnow().isoformat()}]
                self.db.commit()
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _execute_workflow_steps(
        self,
        execution: RacineWorkflowExecution,
        workflow_definition: Dict[str, Any],
        parameters: Dict[str, Any]
    ):
        """
        Execute individual workflow steps.
        Coordinates with ALL existing group services.
        """
        steps = workflow_definition.get('steps', [])
        results = {}
        step_results = []
        
        try:
            for i, step in enumerate(steps):
                step_start_time = time.time()
                
                # Update execution progress
                execution.current_step = i
                execution.progress_percentage = int((i / len(steps)) * 100) if steps else 100
                
                # Log step start
                log_entry = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'level': 'INFO',
                    'message': f"Starting step {i + 1}: {step.get('name', 'Unnamed Step')}",
                    'step_id': step.get('id'),
                    'step_type': step.get('type'),
                    'group_id': step.get('group_id')
                }
                
                execution_logs = execution.execution_logs or []
                execution_logs.append(log_entry)
                execution.execution_logs = execution_logs
                self.db.commit()
                
                # Execute step based on group
                step_result = await self._execute_single_step(step, parameters, results)
                results[step.get('id', f'step_{i}')] = step_result
                step_results.append(step_result)
                
                # Update step results in execution record based on group
                self._update_execution_results_by_group(execution, step, step_result)
                
                # Calculate step duration
                step_duration = time.time() - step_start_time
                
                # Log step completion
                log_entry = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'level': 'INFO' if step_result.status == 'success' else 'ERROR',
                    'message': f"{'Completed' if step_result.status == 'success' else 'Failed'} step {i + 1}: {step.get('name')}",
                    'step_id': step.get('id'),
                    'duration': step_duration,
                    'result': step_result.status
                }
                execution_logs.append(log_entry)
                execution.execution_logs = execution_logs
                
                self.db.commit()
                
                # Handle step failure
                if step_result.status != 'success':
                    if not step.get('continue_on_error', False):
                        execution.status = WorkflowExecutionStatus.FAILED
                        execution.end_time = datetime.utcnow()
                        execution.errors = execution.errors or []
                        execution.errors.append({
                            'step': i,
                            'error': step_result.error,
                            'timestamp': datetime.utcnow().isoformat()
                        })
                        self.db.commit()
                        raise Exception(f"Step {i + 1} failed: {step_result.error}")
            
            # Mark workflow as completed
            execution.status = WorkflowExecutionStatus.COMPLETED
            execution.end_time = datetime.utcnow()
            execution.progress_percentage = 100
            execution.current_step = len(steps)
            execution.step_executions = [result.__dict__ for result in step_results]
            
            # Calculate total duration
            if execution.start_time:
                duration = (execution.end_time - execution.start_time).total_seconds()
                execution.duration_seconds = duration
            
            self.db.commit()
            
            # Remove from active workflows
            if execution.id in self.active_workflows:
                del self.active_workflows[execution.id]
                
        except Exception as e:
            execution.status = WorkflowExecutionStatus.FAILED
            execution.end_time = datetime.utcnow()
            execution.errors = execution.errors or []
            execution.errors.append({
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            })
            self.db.commit()
            
            # Remove from active workflows
            if execution.id in self.active_workflows:
                del self.active_workflows[execution.id]
            
            raise
    
    async def _execute_single_step(
        self,
        step: Dict[str, Any],
        parameters: Dict[str, Any],
        previous_results: Dict[str, Any]
    ) -> WorkflowStepResult:
        """
        Execute a single workflow step.
        Routes to appropriate existing service based on group_id.
        """
        step_start_time = time.time()
        group_id = step.get('group_id')
        operation = step.get('operation')
        step_params = step.get('parameters', {})
        
        # Merge parameters
        merged_params = {**parameters, **step_params}
        
        # Add previous results if referenced
        if step.get('depends_on'):
            for dep in step.get('depends_on', []):
                if dep in previous_results:
                    merged_params[f'input_from_{dep}'] = previous_results[dep]
        
        try:
            # Route to appropriate service - FULL INTEGRATION WITH EXISTING SERVICES
            if group_id == 'data_sources':
                result = await self._execute_data_source_operation(operation, merged_params)
            elif group_id == 'scan_rule_sets':
                result = await self._execute_scan_rule_operation(operation, merged_params)
            elif group_id == 'classifications':
                result = await self._execute_classification_operation(operation, merged_params)
            elif group_id == 'compliance_rules':
                result = await self._execute_compliance_operation(operation, merged_params)
            elif group_id == 'advanced_catalog':
                result = await self._execute_catalog_operation(operation, merged_params)
            elif group_id == 'scan_logic':
                result = await self._execute_scan_logic_operation(operation, merged_params)
            elif group_id == 'rbac_system':
                result = await self._execute_rbac_operation(operation, merged_params)
            else:
                raise ValueError(f"Unknown group_id: {group_id}")
            
            duration = time.time() - step_start_time
            
            return WorkflowStepResult(
                step_id=step.get('id', ''),
                step_name=step.get('name', ''),
                group_id=group_id,
                operation=operation,
                status='success',
                result=result,
                duration_seconds=duration
            )
            
        except Exception as e:
            duration = time.time() - step_start_time
            error_msg = str(e)
            
            self.logger.error(f"Step execution failed: {error_msg}")
            
            return WorkflowStepResult(
                step_id=step.get('id', ''),
                step_name=step.get('name', ''),
                group_id=group_id,
                operation=operation,
                status='failed',
                result={},
                error=error_msg,
                duration_seconds=duration
            )
    
    async def _execute_data_source_operation(self, operation: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute data source operations using existing DataSourceService."""
        try:
            data_source_service = self.service_registry.get('data_sources.DataSourceService')
            if not data_source_service:
                raise ValueError("DataSourceService not available")
            
            service = data_source_service.service_instance
            
            if operation == 'discover_sources':
                result = await self._call_service_method(service, 'discover_data_sources', parameters)
            elif operation == 'connect_source':
                result = await self._call_service_method(service, 'create_data_source', parameters)
            elif operation == 'test_connection':
                result = await self._call_service_method(service, 'test_connection', parameters)
            elif operation == 'scan_source':
                result = await self._call_service_method(service, 'scan_data_source', parameters)
            elif operation == 'get_health':
                result = await self._call_service_method(service, 'get_health_status', parameters)
            else:
                raise ValueError(f"Unknown data source operation: {operation}")
            
            return {'status': 'success', 'result': result, 'operation': operation}
            
        except Exception as e:
            self.logger.error(f"Data source operation failed: {str(e)}")
            return {'status': 'failed', 'error': str(e), 'operation': operation}
    
    async def _execute_classification_operation(self, operation: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute classification operations using existing ClassificationService."""
        try:
            classification_service = self.service_registry.get('classifications.ClassificationService')
            if not classification_service:
                raise ValueError("ClassificationService not available")
            
            service = classification_service.service_instance
            
            if operation == 'auto_classify':
                result = await self._call_service_method(service, 'auto_classify_data', parameters)
            elif operation == 'apply_rules':
                result = await self._call_service_method(service, 'apply_classification_rules', parameters)
            elif operation == 'validate_classifications':
                result = await self._call_service_method(service, 'validate_classifications', parameters)
            elif operation == 'get_health':
                result = await self._call_service_method(service, 'get_health_status', parameters)
            else:
                raise ValueError(f"Unknown classification operation: {operation}")
            
            return {'status': 'success', 'result': result, 'operation': operation}
            
        except Exception as e:
            self.logger.error(f"Classification operation failed: {str(e)}")
            return {'status': 'failed', 'error': str(e), 'operation': operation}
    
    async def _execute_compliance_operation(self, operation: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute compliance operations using existing ComplianceService."""
        try:
            compliance_service = self.service_registry.get('compliance_rules.ComplianceRuleService')
            if not compliance_service:
                raise ValueError("ComplianceRuleService not available")
            
            service = compliance_service.service_instance
            
            if operation == 'audit_scan':
                result = await self._call_service_method(service, 'perform_compliance_audit', parameters)
            elif operation == 'validate_compliance':
                result = await self._call_service_method(service, 'validate_compliance_rules', parameters)
            elif operation == 'generate_report':
                result = await self._call_service_method(service, 'generate_compliance_report', parameters)
            elif operation == 'get_health':
                result = await self._call_service_method(service, 'get_health_status', parameters)
            else:
                raise ValueError(f"Unknown compliance operation: {operation}")
            
            return {'status': 'success', 'result': result, 'operation': operation}
            
        except Exception as e:
            self.logger.error(f"Compliance operation failed: {str(e)}")
            return {'status': 'failed', 'error': str(e), 'operation': operation}
    
    async def _execute_catalog_operation(self, operation: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute catalog operations using existing CatalogService."""
        try:
            catalog_service = self.service_registry.get('advanced_catalog.EnterpriseCatalogService')
            if not catalog_service:
                raise ValueError("EnterpriseCatalogService not available")
            
            service = catalog_service.service_instance
            
            if operation == 'discover_assets':
                result = await self._call_service_method(service, 'discover_data_assets', parameters)
            elif operation == 'enrich_metadata':
                result = await self._call_service_method(service, 'enrich_metadata', parameters)
            elif operation == 'update_catalog':
                result = await self._call_service_method(service, 'update_catalog_items', parameters)
            elif operation == 'get_health':
                result = await self._call_service_method(service, 'get_health_status', parameters)
            else:
                raise ValueError(f"Unknown catalog operation: {operation}")
            
            return {'status': 'success', 'result': result, 'operation': operation}
            
        except Exception as e:
            self.logger.error(f"Catalog operation failed: {str(e)}")
            return {'status': 'failed', 'error': str(e), 'operation': operation}
    
    async def _execute_scan_logic_operation(self, operation: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute scan logic operations using existing ScanOrchestrator."""
        try:
            scan_orchestrator = self.service_registry.get('scan_logic.UnifiedScanOrchestrator')
            if not scan_orchestrator:
                raise ValueError("UnifiedScanOrchestrator not available")
            
            service = scan_orchestrator.service_instance
            
            if operation == 'orchestrate_scan':
                result = await self._call_service_method(service, 'orchestrate_unified_scan', parameters)
            elif operation == 'optimize_performance':
                result = await self._call_service_method(service, 'optimize_scan_performance', parameters)
            elif operation == 'monitor_health':
                result = await self._call_service_method(service, 'monitor_scan_health', parameters)
            elif operation == 'get_health':
                result = await self._call_service_method(service, 'get_health_status', parameters)
            else:
                raise ValueError(f"Unknown scan logic operation: {operation}")
            
            return {'status': 'success', 'result': result, 'operation': operation}
            
        except Exception as e:
            self.logger.error(f"Scan logic operation failed: {str(e)}")
            return {'status': 'failed', 'error': str(e), 'operation': operation}
    
    async def _execute_scan_rule_operation(self, operation: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute scan rule operations using existing ScanRuleSetService."""
        try:
            scan_rule_service = self.service_registry.get('scan_rule_sets.ScanRuleSetService')
            if not scan_rule_service:
                raise ValueError("ScanRuleSetService not available")
            
            service = scan_rule_service.service_instance
            
            if operation == 'create_rule_set':
                result = await self._call_service_method(service, 'create_scan_rule_set', parameters)
            elif operation == 'execute_rules':
                result = await self._call_service_method(service, 'execute_scan_rules', parameters)
            elif operation == 'validate_rules':
                result = await self._call_service_method(service, 'validate_scan_rules', parameters)
            elif operation == 'get_health':
                result = await self._call_service_method(service, 'get_health_status', parameters)
            else:
                raise ValueError(f"Unknown scan rule operation: {operation}")
            
            return {'status': 'success', 'result': result, 'operation': operation}
            
        except Exception as e:
            self.logger.error(f"Scan rule operation failed: {str(e)}")
            return {'status': 'failed', 'error': str(e), 'operation': operation}
    
    async def _execute_rbac_operation(self, operation: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute RBAC operations using existing RBACService."""
        try:
            rbac_service = self.service_registry.get('rbac_system.RBACService')
            if not rbac_service:
                raise ValueError("RBACService not available")
            
            service = rbac_service.service_instance
            
            if operation == 'assign_role':
                result = await self._call_service_method(service, 'assign_role', parameters)
            elif operation == 'check_permission':
                result = await self._call_service_method(service, 'check_permission', parameters)
            elif operation == 'audit_access':
                result = await self._call_service_method(service, 'audit_access', parameters)
            elif operation == 'get_health':
                result = await self._call_service_method(service, 'get_health_status', parameters)
            else:
                raise ValueError(f"Unknown RBAC operation: {operation}")
            
            return {'status': 'success', 'result': result, 'operation': operation}
            
        except Exception as e:
            self.logger.error(f"RBAC operation failed: {str(e)}")
            return {'status': 'failed', 'error': str(e), 'operation': operation}
    
    async def _call_service_method(self, service: Any, method_name: str, parameters: Dict[str, Any]) -> Any:
        """Call a method on a service instance with proper error handling."""
        try:
            if hasattr(service, method_name):
                method = getattr(service, method_name)
                if asyncio.iscoroutinefunction(method):
                    return await method(**parameters)
                else:
                    return method(**parameters)
            else:
                # Try with session parameter if method doesn't exist
                method_with_session = f"{method_name}_with_session"
                if hasattr(service, method_with_session):
                    method = getattr(service, method_with_session)
                    return method(self.db, **parameters)
                else:
                    raise AttributeError(f"Method {method_name} not found on service")
        except Exception as e:
            self.logger.error(f"Service method call failed: {method_name} - {str(e)}")
            raise
    
    async def monitor_system_health(self) -> RacineSystemHealth:
        """
        Monitor health across ALL integrated systems.
        Aggregates health from all existing services.
        """
        try:
            health_data = {
                'timestamp': datetime.utcnow(),
                'overall_status': SystemHealthStatus.HEALTHY,
                'system_metrics': {},
                'performance_metrics': self.performance_metrics.copy(),
                'resource_usage': {},
                'active_alerts': [],
                'recommendations': []
            }
            
            # Check health of all integrated services
            group_health = {}
            overall_healthy = True
            
            # Data Sources Health
            try:
                ds_health = await self._check_group_health('data_sources')
                group_health['data_sources_health'] = ds_health
                if ds_health.get('status') != 'healthy':
                    overall_healthy = False
            except Exception as e:
                group_health['data_sources_health'] = {'status': 'error', 'error': str(e)}
                overall_healthy = False
            
            # Scan Rule Sets Health
            try:
                srs_health = await self._check_group_health('scan_rule_sets')
                group_health['scan_rule_sets_health'] = srs_health
                if srs_health.get('status') != 'healthy':
                    overall_healthy = False
            except Exception as e:
                group_health['scan_rule_sets_health'] = {'status': 'error', 'error': str(e)}
                overall_healthy = False
            
            # Classifications Health
            try:
                cls_health = await self._check_group_health('classifications')
                group_health['classifications_health'] = cls_health
                if cls_health.get('status') != 'healthy':
                    overall_healthy = False
            except Exception as e:
                group_health['classifications_health'] = {'status': 'error', 'error': str(e)}
                overall_healthy = False
            
            # Compliance Health
            try:
                comp_health = await self._check_group_health('compliance_rules')
                group_health['compliance_rules_health'] = comp_health
                if comp_health.get('status') != 'healthy':
                    overall_healthy = False
            except Exception as e:
                group_health['compliance_rules_health'] = {'status': 'error', 'error': str(e)}
                overall_healthy = False
            
            # Catalog Health
            try:
                cat_health = await self._check_group_health('advanced_catalog')
                group_health['advanced_catalog_health'] = cat_health
                if cat_health.get('status') != 'healthy':
                    overall_healthy = False
            except Exception as e:
                group_health['advanced_catalog_health'] = {'status': 'error', 'error': str(e)}
                overall_healthy = False
            
            # Scan Logic Health
            try:
                scan_health = await self._check_group_health('scan_logic')
                group_health['scan_logic_health'] = scan_health
                if scan_health.get('status') != 'healthy':
                    overall_healthy = False
            except Exception as e:
                group_health['scan_logic_health'] = {'status': 'error', 'error': str(e)}
                overall_healthy = False
            
            # RBAC Health
            try:
                rbac_health = await self._check_group_health('rbac_system')
                group_health['rbac_system_health'] = rbac_health
                if rbac_health.get('status') != 'healthy':
                    overall_healthy = False
            except Exception as e:
                group_health['rbac_system_health'] = {'status': 'error', 'error': str(e)}
                overall_healthy = False
            
            # Set overall status
            health_data['overall_status'] = SystemHealthStatus.HEALTHY if overall_healthy else SystemHealthStatus.WARNING
            
            # Calculate health score
            healthy_services = sum(1 for h in group_health.values() if h.get('status') == 'healthy')
            total_services = len(group_health)
            health_score = (healthy_services / total_services * 100) if total_services > 0 else 0
            
            # Create health record
            health_record = RacineSystemHealth(
                overall_status=health_data['overall_status'],
                health_score=health_score,
                **group_health,
                system_metrics=health_data['system_metrics'],
                performance_metrics=health_data['performance_metrics'],
                resource_usage=health_data['resource_usage'],
                active_alerts=health_data['active_alerts'],
                recommendations=health_data['recommendations'],
                check_duration_ms=(datetime.utcnow() - health_data['timestamp']).total_seconds() * 1000
            )
            
            self.db.add(health_record)
            self.db.commit()
            self.db.refresh(health_record)
            
            self.last_health_check = datetime.utcnow()
            return health_record
            
        except Exception as e:
            self.logger.error(f"Failed to monitor system health: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _check_group_health(self, group_id: str) -> Dict[str, Any]:
        """Check health of services in a specific group."""
        group_services = {k: v for k, v in self.service_registry.items() if v.group_id == group_id}
        
        if not group_services:
            return {'status': 'error', 'error': f'No services found for group {group_id}'}
        
        healthy_services = 0
        total_services = len(group_services)
        service_details = {}
        
        for service_key, service_entry in group_services.items():
            try:
                # Try to call health check method if available
                if hasattr(service_entry.service_instance, 'get_health_status'):
                    health_result = await self._call_service_method(
                        service_entry.service_instance, 
                        'get_health_status', 
                        {}
                    )
                    service_details[service_entry.service_name] = health_result
                    if health_result.get('status') == 'healthy':
                        healthy_services += 1
                else:
                    # Basic health check - service is available
                    service_details[service_entry.service_name] = {'status': 'healthy', 'message': 'Service available'}
                    healthy_services += 1
                    
                service_entry.health_status = 'healthy'
                service_entry.last_health_check = datetime.utcnow()
                
            except Exception as e:
                service_details[service_entry.service_name] = {'status': 'error', 'error': str(e)}
                service_entry.health_status = 'error'
                service_entry.last_error = str(e)
                service_entry.error_count += 1
        
        health_percentage = (healthy_services / total_services * 100) if total_services > 0 else 0
        
        return {
            'status': 'healthy' if health_percentage >= 80 else 'warning' if health_percentage >= 50 else 'error',
            'health_percentage': health_percentage,
            'healthy_services': healthy_services,
            'total_services': total_services,
            'service_details': service_details,
            'last_check': datetime.utcnow().isoformat()
        }
    
    async def _perform_health_check(self):
        """Perform comprehensive health check of all services."""
        try:
            await self.monitor_system_health()
        except Exception as e:
            self.logger.error(f"Health check failed: {str(e)}")
    
    async def optimize_performance(self) -> Dict[str, Any]:
        """
        Optimize performance across all integrated systems.
        Provides recommendations and automatic optimizations.
        """
        try:
            optimization_results = {
                'timestamp': datetime.utcnow().isoformat(),
                'optimizations_applied': [],
                'recommendations': [],
                'performance_improvements': {},
                'resource_savings': {}
            }
            
            # Optimize each service group
            for group_id in ['data_sources', 'scan_rule_sets', 'classifications', 
                           'compliance_rules', 'advanced_catalog', 'scan_logic', 'rbac_system']:
                try:
                    group_services = {k: v for k, v in self.service_registry.items() if v.group_id == group_id}
                    
                    for service_key, service_entry in group_services.items():
                        if hasattr(service_entry.service_instance, 'optimize_performance'):
                            result = await self._call_service_method(
                                service_entry.service_instance,
                                'optimize_performance',
                                {}
                            )
                            optimization_results['optimizations_applied'].append({
                                'group': group_id,
                                'service': service_entry.service_name,
                                'result': result
                            })
                except Exception as e:
                    self.logger.warning(f"Failed to optimize {group_id}: {str(e)}")
                    optimization_results['recommendations'].append({
                        'group': group_id,
                        'issue': str(e),
                        'recommendation': f"Manual optimization needed for {group_id}"
                    })
            
            return optimization_results
            
        except Exception as e:
            self.logger.error(f"Failed to optimize performance: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def get_cross_group_metrics(self) -> Dict[str, Any]:
        """
        Get comprehensive metrics across all integrated groups.
        Aggregates metrics from all existing services.
        """
        try:
            metrics = {
                'timestamp': datetime.utcnow().isoformat(),
                'overall_metrics': {},
                'group_metrics': {},
                'integration_metrics': {},
                'performance_metrics': self.performance_metrics.copy()
            }
            
            # Collect metrics from each service group
            for group_id in ['data_sources', 'scan_rule_sets', 'classifications', 
                           'compliance_rules', 'advanced_catalog', 'scan_logic', 'rbac_system']:
                try:
                    group_services = {k: v for k, v in self.service_registry.items() if v.group_id == group_id}
                    group_metrics = {}
                    
                    for service_key, service_entry in group_services.items():
                        if hasattr(service_entry.service_instance, 'get_metrics'):
                            service_metrics = await self._call_service_method(
                                service_entry.service_instance,
                                'get_metrics',
                                {}
                            )
                            group_metrics[service_entry.service_name] = service_metrics
                    
                    metrics['group_metrics'][group_id] = group_metrics
                    
                except Exception as e:
                    self.logger.warning(f"Failed to get metrics from {group_id}: {str(e)}")
                    metrics['group_metrics'][group_id] = {'error': str(e)}
            
            # Calculate overall metrics
            total_operations = 0
            active_services = 0
            
            for group_metrics in metrics['group_metrics'].values():
                if isinstance(group_metrics, dict) and 'error' not in group_metrics:
                    for service_metrics in group_metrics.values():
                        if isinstance(service_metrics, dict):
                            total_operations += service_metrics.get('total_operations', 0)
                            if service_metrics.get('status') == 'active':
                                active_services += 1
            
            metrics['overall_metrics'] = {
                'total_operations': total_operations,
                'connected_groups': len([g for g in metrics['group_metrics'].values() if 'error' not in g]),
                'active_services': active_services,
                'active_workflows': len(self.active_workflows),
                'system_uptime_seconds': (datetime.utcnow() - self.performance_metrics['system_start_time']).total_seconds()
            }
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Failed to get cross-group metrics: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def _extract_involved_groups(self, workflow_definition: Dict[str, Any]) -> List[str]:
        """Extract the list of groups involved in a workflow."""
        involved_groups = set()
        
        for step in workflow_definition.get('steps', []):
            group_id = step.get('group_id')
            if group_id:
                involved_groups.add(group_id)
        
        return list(involved_groups)
    
    def _update_execution_results_by_group(
        self, 
        execution: RacineWorkflowExecution, 
        step: Dict[str, Any], 
        step_result: WorkflowStepResult
    ):
        """Update execution results based on the group that executed the step."""
        group_id = step.get('group_id')
        step_id = step.get('id', 'unknown')
        
        if group_id == 'data_sources':
            execution.data_source_results = execution.data_source_results or {}
            execution.data_source_results[step_id] = step_result.__dict__
        elif group_id == 'scan_rule_sets':
            execution.scan_rule_results = execution.scan_rule_results or {}
            execution.scan_rule_results[step_id] = step_result.__dict__
        elif group_id == 'classifications':
            execution.classification_results = execution.classification_results or {}
            execution.classification_results[step_id] = step_result.__dict__
        elif group_id == 'compliance_rules':
            execution.compliance_results = execution.compliance_results or {}
            execution.compliance_results[step_id] = step_result.__dict__
        elif group_id == 'advanced_catalog':
            execution.catalog_results = execution.catalog_results or {}
            execution.catalog_results[step_id] = step_result.__dict__
        elif group_id == 'scan_logic':
            execution.scan_logic_results = execution.scan_logic_results or {}
            execution.scan_logic_results[step_id] = step_result.__dict__
        elif group_id == 'rbac_system':
            execution.rbac_results = execution.rbac_results or {}
            execution.rbac_results[step_id] = step_result.__dict__
    
    def _update_average_response_time(self, duration: float):
        """Update the average response time metric."""
        current_avg = self.performance_metrics['average_response_time']
        total_requests = self.performance_metrics['total_requests']
        
        if total_requests > 1:
            # Calculate new average
            self.performance_metrics['average_response_time'] = (
                (current_avg * (total_requests - 1) + duration) / total_requests
            )
        else:
            self.performance_metrics['average_response_time'] = duration
    
    async def _initialize_group_connections(
        self, 
        orchestration_id: str, 
        groups: List[str], 
        configurations: Dict[str, Any]
    ):
        """
        Initialize connections to all specified groups.
        Ensures all services are properly connected and configured.
        """
        try:
            for group_id in groups:
                group_services = {k: v for k, v in self.service_registry.items() if v.group_id == group_id}
                
                if group_services:
                    group_config = configurations.get(group_id, {})
                    
                    for service_key, service_entry in group_services.items():
                        # Initialize service with configuration if method exists
                        if hasattr(service_entry.service_instance, 'initialize_for_orchestration'):
                            await self._call_service_method(
                                service_entry.service_instance,
                                'initialize_for_orchestration',
                                {'orchestration_id': orchestration_id, 'config': group_config}
                            )
                        
                        self.logger.info(f"Initialized connection to {service_key}")
                else:
                    self.logger.warning(f"No services found for group: {group_id}")
                    
        except Exception as e:
            self.logger.error(f"Failed to initialize group connections: {str(e)}")
            raise
    
    async def _process_workflow_step(self, workflow_id: str):
        """Process a single workflow step (used by background processor)."""
        try:
            if workflow_id in self.active_workflows:
                execution = self.active_workflows[workflow_id]
                # Additional workflow step processing logic can be added here
                pass
        except Exception as e:
            self.logger.error(f"Workflow step processing error: {str(e)}")
    
    def get_service_registry_status(self) -> Dict[str, Any]:
        """Get the current status of all registered services."""
        status = {
            'total_services': len(self.service_registry),
            'services_by_group': {},
            'health_summary': {
                'healthy': 0,
                'warning': 0,
                'error': 0
            }
        }
        
        for service_key, service_entry in self.service_registry.items():
            group_id = service_entry.group_id
            
            if group_id not in status['services_by_group']:
                status['services_by_group'][group_id] = []
            
            service_status = {
                'name': service_entry.service_name,
                'health_status': service_entry.health_status,
                'last_health_check': service_entry.last_health_check.isoformat(),
                'error_count': service_entry.error_count,
                'last_error': service_entry.last_error
            }
            
            status['services_by_group'][group_id].append(service_status)
            
            # Update health summary
            if service_entry.health_status == 'healthy':
                status['health_summary']['healthy'] += 1
            elif service_entry.health_status == 'warning':
                status['health_summary']['warning'] += 1
            else:
                status['health_summary']['error'] += 1
        
        return status