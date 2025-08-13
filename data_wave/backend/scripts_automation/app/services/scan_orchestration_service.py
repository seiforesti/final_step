"""
Scan Orchestration Service - Enterprise Production Implementation
===============================================================

This service provides enterprise-grade scan orchestration capabilities with
advanced coordination, resource management, intelligent scheduling, and
seamless integration across all data governance systems.

Key Features:
- Multi-source scan coordination and orchestration
- Intelligent resource allocation and load balancing
- Priority-based scheduling with business rules
- Real-time monitoring and performance optimization
- Advanced failure recovery and retry mechanisms
- Cross-system integration and workflow management

Production Requirements:
- 99.9% uptime with intelligent failover
- Sub-second orchestration decisions
- Handle 10,000+ concurrent scans
- Real-time monitoring with predictive analytics
- Zero-data-loss with comprehensive audit trails
"""

from typing import List, Dict, Any, Optional, Union, Set, Tuple, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import uuid
import json
import logging
import time
import threading
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from enum import Enum
import traceback
from collections import defaultdict, deque
import heapq

# FastAPI and Database imports
from fastapi import HTTPException, BackgroundTasks
from sqlalchemy import select, update, delete, and_, or_, func, text, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlmodel import Session

# AI/ML imports
import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

# Core framework imports
from ..core.config import settings
from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..db_session import get_session

# Model imports
from ..models.scan_models import *
from ..models.advanced_scan_rule_models import *
# from ..models.scan_orchestration_models import *  # File deleted, no models needed
from ..models.scan_intelligence_models import *

# Service imports
from .ai_service import EnterpriseAIService as AIService
from .enterprise_scan_rule_service import EnterpriseScanRuleService
from .scan_intelligence_service import ScanIntelligenceService
from .data_source_connection_service import DataSourceConnectionService

logger = logging.getLogger(__name__)

class OrchestrationStrategy(str, Enum):
    """Orchestration strategies for scan coordination"""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel" 
    ADAPTIVE = "adaptive"
    PRIORITY_BASED = "priority_based"
    RESOURCE_OPTIMIZED = "resource_optimized"
    INTELLIGENT = "intelligent"

class OrchestrationStatus(str, Enum):
    """Status of orchestration operations"""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RECOVERING = "recovering"

class ResourceType(str, Enum):
    """Types of resources managed by orchestrator"""
    CPU = "cpu"
    MEMORY = "memory"
    STORAGE = "storage"
    NETWORK = "network"
    DATABASE_CONNECTIONS = "database_connections"
    API_RATE_LIMITS = "api_rate_limits"

@dataclass
class OrchestrationConfig:
    """Configuration for scan orchestration"""
    max_concurrent_scans: int = 100
    max_scans_per_source: int = 5
    default_timeout_minutes: int = 60
    retry_attempts: int = 3
    resource_monitoring_interval: int = 30
    performance_optimization_enabled: bool = True
    intelligent_scheduling_enabled: bool = True
    cross_system_coordination_enabled: bool = True
    predictive_analytics_enabled: bool = True

@dataclass
class ResourceAllocation:
    """Resource allocation for scan operations"""
    scan_id: str
    cpu_percentage: float
    memory_mb: int
    storage_mb: int
    network_bandwidth_mbps: float
    database_connections: int
    api_rate_limit: int
    priority: int = 5
    allocated_at: datetime = field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

@dataclass
class OrchestrationMetrics:
    """Orchestration performance and health metrics"""
    total_orchestrations: int = 0
    active_orchestrations: int = 0
    completed_orchestrations: int = 0
    failed_orchestrations: int = 0
    average_orchestration_time: float = 0.0
    resource_utilization: Dict[str, float] = field(default_factory=dict)
    throughput_per_minute: float = 0.0
    success_rate: float = 100.0
    average_queue_time: float = 0.0
    optimization_efficiency: float = 100.0

class ScanOrchestrationService:
    """
    Enterprise-grade scan orchestration service providing comprehensive
    coordination, resource management, and intelligent scheduling.
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        # Configuration
        self.config = OrchestrationConfig()
        
        # Core services
        self.scan_rule_service = EnterpriseScanRuleService()
        self.intelligence_service = ScanIntelligenceService()
        self.data_source_service = DataSourceConnectionService()
        
        # Orchestration state
        self.active_orchestrations: Dict[str, Dict[str, Any]] = {}
        self.orchestration_queue = deque()
        self.completed_orchestrations = deque(maxlen=1000)
        self.failed_orchestrations = deque(maxlen=500)
        
        # Resource management
        self.resource_pool = {
            ResourceType.CPU: 100.0,
            ResourceType.MEMORY: 32768,  # MB
            ResourceType.STORAGE: 1048576,  # MB (1TB)
            ResourceType.NETWORK: 10000,  # Mbps
            ResourceType.DATABASE_CONNECTIONS: 1000,
            ResourceType.API_RATE_LIMITS: 10000
        }
        self.allocated_resources: Dict[str, ResourceAllocation] = {}
        self.resource_history = deque(maxlen=1000)
        
        # Performance tracking
        self.metrics = OrchestrationMetrics()
        self.performance_history = deque(maxlen=1000)
        
        # ML models for optimization
        self.optimization_models = {}
        self.performance_predictors = {}
        self._init_ml_models()
        
        # Scheduling and coordination
        self.scan_schedules = {}
        self.dependency_graph = {}
        self.priority_queue = []
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=20)
        
        # Background tasks
        asyncio.create_task(self._orchestration_loop())
        asyncio.create_task(self._resource_monitoring_loop())
        asyncio.create_task(self._performance_optimization_loop())
        asyncio.create_task(self._metrics_collection_loop())
        
        logger.info("Scan Orchestration Service initialized successfully")
    
    def _init_ml_models(self):
        """Initialize ML models for orchestration optimization"""
        try:
            # Resource allocation optimization model
            self.optimization_models['resource_allocation'] = RandomForestRegressor(
                n_estimators=100,
                random_state=42
            )
            
            # Performance prediction model
            self.performance_predictors['scan_duration'] = RandomForestRegressor(
                n_estimators=50,
                random_state=42
            )
            
            # Resource usage prediction model
            self.performance_predictors['resource_usage'] = RandomForestRegressor(
                n_estimators=50,
                random_state=42
            )
            
            # Scalers for feature normalization
            self.feature_scalers = {
                'resource_features': StandardScaler(),
                'performance_features': StandardScaler()
            }
            
            logger.info("ML models for orchestration optimization initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize ML models: {e}")
    
    async def orchestrate_scan_execution(
        self,
        scan_request: Dict[str, Any],
        strategy: OrchestrationStrategy = OrchestrationStrategy.INTELLIGENT,
        priority: int = 5
    ) -> Dict[str, Any]:
        """
        Orchestrate the execution of a scan operation with intelligent coordination
        """
        try:
            orchestration_id = str(uuid.uuid4())
            start_time = time.time()
            
            logger.info(f"Starting scan orchestration {orchestration_id} with strategy {strategy}")
            
            # Create orchestration context
            orchestration_context = {
                "orchestration_id": orchestration_id,
                "scan_request": scan_request,
                "strategy": strategy,
                "priority": priority,
                "status": OrchestrationStatus.PENDING,
                "created_at": datetime.utcnow(),
                "start_time": start_time,
                "metadata": {}
            }
            
            # Validate scan request
            validation_result = await self._validate_scan_request(scan_request)
            if not validation_result["valid"]:
                raise ValueError(f"Invalid scan request: {validation_result['errors']}")
            
            # Analyze resource requirements
            resource_requirements = await self._analyze_resource_requirements(scan_request)
            orchestration_context["resource_requirements"] = resource_requirements
            
            # Check resource availability
            resource_availability = await self._check_resource_availability(resource_requirements)
            if not resource_availability["available"]:
                return await self._queue_orchestration(orchestration_context)
            
            # Allocate resources
            resource_allocation = await self._allocate_resources(
                orchestration_id, resource_requirements, priority
            )
            orchestration_context["resource_allocation"] = resource_allocation
            
            # Generate execution plan
            execution_plan = await self._generate_execution_plan(
                scan_request, strategy, resource_allocation
            )
            orchestration_context["execution_plan"] = execution_plan
            
            # Add to active orchestrations
            self.active_orchestrations[orchestration_id] = orchestration_context
            
            # Execute orchestration based on strategy
            orchestration_result = await self._execute_orchestration_strategy(
                orchestration_context
            )
            
            # Update metrics
            execution_time = time.time() - start_time
            orchestration_result["execution_time_seconds"] = execution_time
            
            self.metrics.total_orchestrations += 1
            self.metrics.average_orchestration_time = (
                self.metrics.average_orchestration_time + execution_time
            ) / 2
            
            if orchestration_result["status"] == "completed":
                self.metrics.completed_orchestrations += 1
                self.completed_orchestrations.append(orchestration_result)
            else:
                self.metrics.failed_orchestrations += 1
                self.failed_orchestrations.append(orchestration_result)
            
            # Release resources
            await self._release_resources(orchestration_id)
            
            # Remove from active orchestrations
            self.active_orchestrations.pop(orchestration_id, None)
            
            logger.info(f"Orchestration {orchestration_id} completed in {execution_time:.2f}s")
            
            return orchestration_result
            
        except Exception as e:
            logger.error(f"Orchestration failed: {e}")
            self.metrics.failed_orchestrations += 1
            raise
    
    async def _validate_scan_request(self, scan_request: Dict[str, Any]) -> Dict[str, Any]:
        """Validate scan request parameters and requirements"""
        try:
            errors = []
            
            # Required fields validation
            required_fields = ["data_source_id", "scan_type", "scan_rules"]
            for field in required_fields:
                if field not in scan_request:
                    errors.append(f"Missing required field: {field}")
            
            # Data source validation
            if "data_source_id" in scan_request:
                data_source_id = scan_request["data_source_id"]
                data_source_valid = await self.data_source_service.validate_data_source(
                    data_source_id
                )
                if not data_source_valid:
                    errors.append(f"Invalid data source: {data_source_id}")
            
            # Scan rules validation
            if "scan_rules" in scan_request:
                rules_validation = await self.scan_rule_service.validate_scan_rules(
                    scan_request["scan_rules"]
                )
                if not rules_validation["valid"]:
                    errors.extend(rules_validation["errors"])
            
            return {
                "valid": len(errors) == 0,
                "errors": errors,
                "validated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Scan request validation failed: {e}")
            return {
                "valid": False,
                "errors": [f"Validation error: {str(e)}"],
                "validated_at": datetime.utcnow().isoformat()
            }
    
    async def _analyze_resource_requirements(
        self, 
        scan_request: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze resource requirements for scan execution"""
        try:
            # Extract scan characteristics
            data_source_id = scan_request.get("data_source_id")
            scan_type = scan_request.get("scan_type", "full")
            scan_rules = scan_request.get("scan_rules", [])
            
            # Get data source metadata for sizing
            data_source_metadata = await self.data_source_service.get_data_source_metadata(
                data_source_id
            )
            
            # Estimate resource requirements based on scan characteristics
            estimated_rows = data_source_metadata.get("estimated_rows", 1000000)
            table_count = len(data_source_metadata.get("tables", []))
            column_count = sum(
                len(table.get("columns", [])) 
                for table in data_source_metadata.get("tables", [])
            )
            
            # Base resource calculation
            base_cpu = min(50.0, max(5.0, (estimated_rows / 100000) * 2))
            base_memory = min(8192, max(512, (estimated_rows / 10000) * 100))
            base_storage = min(10240, max(100, (estimated_rows / 1000) * 10))
            base_network = min(1000, max(10, table_count * 5))
            
            # Adjust based on scan complexity
            complexity_multiplier = 1.0
            if len(scan_rules) > 10:
                complexity_multiplier += 0.5
            if scan_type == "deep":
                complexity_multiplier += 1.0
            if column_count > 100:
                complexity_multiplier += 0.3
            
            requirements = {
                "cpu_percentage": base_cpu * complexity_multiplier,
                "memory_mb": base_memory * complexity_multiplier,
                "storage_mb": base_storage * complexity_multiplier,
                "network_bandwidth_mbps": base_network * complexity_multiplier,
                "database_connections": min(10, max(1, table_count // 10)),
                "api_rate_limit": min(1000, max(10, len(scan_rules) * 5)),
                "estimated_duration_minutes": self._estimate_scan_duration(
                    estimated_rows, len(scan_rules), complexity_multiplier
                ),
                "complexity_score": complexity_multiplier,
                "analyzed_at": datetime.utcnow().isoformat()
            }
            
            return requirements
            
        except Exception as e:
            logger.error(f"Resource requirements analysis failed: {e}")
            return {
                "cpu_percentage": 10.0,
                "memory_mb": 1024,
                "storage_mb": 1024,
                "network_bandwidth_mbps": 100,
                "database_connections": 2,
                "api_rate_limit": 100,
                "estimated_duration_minutes": 30,
                "complexity_score": 1.0,
                "error": str(e)
            }
    
    def _estimate_scan_duration(
        self, 
        estimated_rows: int, 
        rule_count: int, 
        complexity_multiplier: float
    ) -> int:
        """Estimate scan duration based on data size and complexity"""
        try:
            # Base duration calculation (minutes)
            base_duration = max(5, (estimated_rows / 100000) * 10)
            
            # Rule complexity factor
            rule_factor = max(1.0, rule_count / 10)
            
            # Apply complexity multiplier
            total_duration = base_duration * rule_factor * complexity_multiplier
            
            return min(480, max(5, int(total_duration)))  # 5 min to 8 hours
            
        except Exception as e:
            logger.error(f"Duration estimation failed: {e}")
            return 30  # Default 30 minutes
    
    async def _check_resource_availability(
        self, 
        requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Check if required resources are available"""
        try:
            # Calculate currently allocated resources
            current_allocations = self._calculate_current_allocations()
            
            # Check each resource type
            availability_checks = {}
            
            for resource_type, total_capacity in self.resource_pool.items():
                required_amount = self._get_required_amount(requirements, resource_type)
                allocated_amount = current_allocations.get(resource_type.value, 0)
                available_amount = total_capacity - allocated_amount
                
                availability_checks[resource_type.value] = {
                    "required": required_amount,
                    "available": available_amount,
                    "sufficient": available_amount >= required_amount,
                    "utilization_percentage": (allocated_amount / total_capacity) * 100
                }
            
            # Overall availability
            all_sufficient = all(
                check["sufficient"] for check in availability_checks.values()
            )
            
            return {
                "available": all_sufficient,
                "resource_checks": availability_checks,
                "checked_at": datetime.utcnow().isoformat(),
                "wait_time_estimate": self._estimate_wait_time() if not all_sufficient else 0
            }
            
        except Exception as e:
            logger.error(f"Resource availability check failed: {e}")
            return {
                "available": False,
                "error": str(e),
                "checked_at": datetime.utcnow().isoformat()
            }
    
    def _calculate_current_allocations(self) -> Dict[str, float]:
        """Calculate currently allocated resources"""
        allocations = defaultdict(float)
        
        for allocation in self.allocated_resources.values():
            allocations["cpu"] += allocation.cpu_percentage
            allocations["memory"] += allocation.memory_mb
            allocations["storage"] += allocation.storage_mb
            allocations["network"] += allocation.network_bandwidth_mbps
            allocations["database_connections"] += allocation.database_connections
            allocations["api_rate_limits"] += allocation.api_rate_limit
        
        return dict(allocations)
    
    def _get_required_amount(self, requirements: Dict[str, Any], resource_type: ResourceType) -> float:
        """Get required amount for specific resource type"""
        mapping = {
            ResourceType.CPU: "cpu_percentage",
            ResourceType.MEMORY: "memory_mb",
            ResourceType.STORAGE: "storage_mb",
            ResourceType.NETWORK: "network_bandwidth_mbps",
            ResourceType.DATABASE_CONNECTIONS: "database_connections",
            ResourceType.API_RATE_LIMITS: "api_rate_limit"
        }
        
        return requirements.get(mapping[resource_type], 0)
    
    def _estimate_wait_time(self) -> int:
        """Estimate wait time for resource availability"""
        # Simple estimation based on active orchestrations
        active_count = len(self.active_orchestrations)
        if active_count == 0:
            return 0
        
        # Average remaining time for active orchestrations
        avg_remaining = 15  # Default 15 minutes
        return min(120, max(5, avg_remaining))  # 5 min to 2 hours
    
    async def _queue_orchestration(self, orchestration_context: Dict[str, Any]) -> Dict[str, Any]:
        """Queue orchestration for later execution when resources become available"""
        try:
            orchestration_id = orchestration_context["orchestration_id"]
            
            # Add to queue with priority
            priority = orchestration_context.get("priority", 5)
            queue_entry = (priority, time.time(), orchestration_context)
            heapq.heappush(self.orchestration_queue, queue_entry)
            
            logger.info(f"Orchestration {orchestration_id} queued with priority {priority}")
            
            return {
                "orchestration_id": orchestration_id,
                "status": "queued",
                "message": "Orchestration queued due to resource constraints",
                "queue_position": len(self.orchestration_queue),
                "estimated_wait_time": self._estimate_wait_time(),
                "queued_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to queue orchestration: {e}")
            raise
    
    async def _allocate_resources(
        self,
        orchestration_id: str,
        requirements: Dict[str, Any],
        priority: int
    ) -> ResourceAllocation:
        """Allocate resources for orchestration execution"""
        try:
            allocation = ResourceAllocation(
                scan_id=orchestration_id,
                cpu_percentage=requirements.get("cpu_percentage", 5.0),
                memory_mb=requirements.get("memory_mb", 512),
                storage_mb=requirements.get("storage_mb", 1024),
                network_bandwidth_mbps=requirements.get("network_bandwidth_mbps", 100),
                database_connections=requirements.get("database_connections", 2),
                api_rate_limit=requirements.get("api_rate_limit", 100),
                priority=priority,
                expires_at=datetime.utcnow() + timedelta(
                    minutes=requirements.get("estimated_duration_minutes", 30) + 15
                )
            )
            
            # Store allocation
            self.allocated_resources[orchestration_id] = allocation
            
            # Update resource utilization metrics
            self._update_resource_utilization_metrics()
            
            logger.info(f"Resources allocated for orchestration {orchestration_id}")
            
            return allocation
            
        except Exception as e:
            logger.error(f"Resource allocation failed: {e}")
            raise
    
    async def _generate_execution_plan(
        self,
        scan_request: Dict[str, Any],
        strategy: OrchestrationStrategy,
        resource_allocation: ResourceAllocation
    ) -> Dict[str, Any]:
        """Generate execution plan for scan orchestration"""
        try:
            data_source_id = scan_request["data_source_id"]
            scan_rules = scan_request.get("scan_rules", [])
            
            # Create execution stages based on strategy
            if strategy == OrchestrationStrategy.SEQUENTIAL:
                stages = self._create_sequential_stages(scan_rules)
            elif strategy == OrchestrationStrategy.PARALLEL:
                stages = self._create_parallel_stages(scan_rules, resource_allocation)
            elif strategy == OrchestrationStrategy.INTELLIGENT:
                stages = await self._create_intelligent_stages(scan_request, resource_allocation)
            else:
                stages = self._create_adaptive_stages(scan_rules, resource_allocation)
            
            execution_plan = {
                "strategy": strategy,
                "total_stages": len(stages),
                "stages": stages,
                "estimated_duration": sum(stage.get("estimated_duration", 0) for stage in stages),
                "resource_allocation": {
                    "cpu_percentage": resource_allocation.cpu_percentage,
                    "memory_mb": resource_allocation.memory_mb,
                    "storage_mb": resource_allocation.storage_mb,
                    "network_bandwidth_mbps": resource_allocation.network_bandwidth_mbps
                },
                "optimization_hints": await self._generate_optimization_hints(scan_request),
                "created_at": datetime.utcnow().isoformat()
            }
            
            return execution_plan
            
        except Exception as e:
            logger.error(f"Execution plan generation failed: {e}")
            return {
                "strategy": strategy,
                "stages": [],
                "error": str(e),
                "created_at": datetime.utcnow().isoformat()
            }
    
    def _create_sequential_stages(self, scan_rules: List[Dict]) -> List[Dict]:
        """Create sequential execution stages"""
        stages = []
        
        for i, rule in enumerate(scan_rules):
            stage = {
                "stage_id": f"sequential_stage_{i+1}",
                "stage_type": "rule_execution",
                "rules": [rule],
                "execution_mode": "sequential",
                "estimated_duration": 5,  # 5 minutes per rule
                "dependencies": [f"sequential_stage_{i}"] if i > 0 else [],
                "parallelizable": False
            }
            stages.append(stage)
        
        return stages
    
    def _create_parallel_stages(
        self, 
        scan_rules: List[Dict], 
        resource_allocation: ResourceAllocation
    ) -> List[Dict]:
        """Create parallel execution stages based on available resources"""
        # Determine optimal parallelization based on resources
        max_parallel = min(
            len(scan_rules),
            int(resource_allocation.cpu_percentage / 5),  # 5% CPU per rule
            resource_allocation.database_connections
        )
        
        stages = []
        rule_batches = [
            scan_rules[i:i + max_parallel] 
            for i in range(0, len(scan_rules), max_parallel)
        ]
        
        for i, batch in enumerate(rule_batches):
            stage = {
                "stage_id": f"parallel_stage_{i+1}",
                "stage_type": "rule_execution",
                "rules": batch,
                "execution_mode": "parallel",
                "estimated_duration": 5,  # 5 minutes per batch
                "dependencies": [f"parallel_stage_{i}"] if i > 0 else [],
                "parallelizable": True,
                "max_concurrency": len(batch)
            }
            stages.append(stage)
        
        return stages
    
    async def _create_intelligent_stages(
        self,
        scan_request: Dict[str, Any],
        resource_allocation: ResourceAllocation
    ) -> List[Dict]:
        """Create intelligent execution stages using AI optimization"""
        try:
            # Use intelligence service to optimize stage creation
            optimization_result = await self.intelligence_service.optimize_scan_execution(
                scan_request, resource_allocation.__dict__
            )
            
            if optimization_result and "stages" in optimization_result:
                return optimization_result["stages"]
            else:
                # Fallback to adaptive stages
                return self._create_adaptive_stages(
                    scan_request.get("scan_rules", []), resource_allocation
                )
                
        except Exception as e:
            logger.error(f"Intelligent stage creation failed: {e}")
            return self._create_adaptive_stages(
                scan_request.get("scan_rules", []), resource_allocation
            )
    
    def _create_adaptive_stages(
        self, 
        scan_rules: List[Dict], 
        resource_allocation: ResourceAllocation
    ) -> List[Dict]:
        """Create adaptive execution stages that balance performance and resources"""
        # Group rules by complexity and type
        rule_groups = self._group_rules_by_characteristics(scan_rules)
        
        stages = []
        stage_counter = 1
        
        for group_name, rules in rule_groups.items():
            # Determine optimal execution mode for this group
            if len(rules) <= 3 or group_name == "complex":
                execution_mode = "sequential"
                estimated_duration = len(rules) * 5
            else:
                execution_mode = "parallel"
                estimated_duration = max(5, len(rules) * 2)
            
            stage = {
                "stage_id": f"adaptive_stage_{stage_counter}",
                "stage_type": "rule_group_execution",
                "rule_group": group_name,
                "rules": rules,
                "execution_mode": execution_mode,
                "estimated_duration": estimated_duration,
                "dependencies": [f"adaptive_stage_{stage_counter-1}"] if stage_counter > 1 else [],
                "parallelizable": execution_mode == "parallel",
                "optimization_level": "adaptive"
            }
            stages.append(stage)
            stage_counter += 1
        
        return stages
    
    def _group_rules_by_characteristics(self, scan_rules: List[Dict]) -> Dict[str, List[Dict]]:
        """Group scan rules by their characteristics for optimized execution"""
        groups = {
            "simple": [],
            "medium": [],
            "complex": [],
            "data_quality": [],
            "compliance": [],
            "classification": []
        }
        
        for rule in scan_rules:
            rule_type = rule.get("type", "unknown")
            complexity = rule.get("complexity", "medium")
            
            if rule_type in ["data_quality", "quality"]:
                groups["data_quality"].append(rule)
            elif rule_type in ["compliance", "regulatory"]:
                groups["compliance"].append(rule)
            elif rule_type in ["classification", "sensitivity"]:
                groups["classification"].append(rule)
            elif complexity == "simple":
                groups["simple"].append(rule)
            elif complexity == "complex":
                groups["complex"].append(rule)
            else:
                groups["medium"].append(rule)
        
        # Remove empty groups
        return {k: v for k, v in groups.items() if v}
    
    async def _generate_optimization_hints(self, scan_request: Dict[str, Any]) -> List[str]:
        """Generate optimization hints for scan execution"""
        hints = []
        
        try:
            # Analyze scan request for optimization opportunities
            scan_rules = scan_request.get("scan_rules", [])
            data_source_id = scan_request.get("data_source_id")
            
            # Rule-based hints
            if len(scan_rules) > 20:
                hints.append("Consider splitting large rule sets into smaller batches")
            
            # Data source specific hints
            data_source_metadata = await self.data_source_service.get_data_source_metadata(
                data_source_id
            )
            
            if data_source_metadata.get("estimated_rows", 0) > 1000000:
                hints.append("Large dataset detected - enable incremental scanning")
            
            if len(data_source_metadata.get("tables", [])) > 50:
                hints.append("Many tables detected - consider parallel table scanning")
            
            # Performance hints
            hints.append("Enable caching for repeated rule evaluations")
            hints.append("Use column-level filtering to reduce data transfer")
            
            return hints
            
        except Exception as e:
            logger.error(f"Optimization hints generation failed: {e}")
            return ["Enable basic performance optimizations"]
    
    async def _execute_orchestration_strategy(
        self, 
        orchestration_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute orchestration based on the selected strategy"""
        try:
            orchestration_id = orchestration_context["orchestration_id"]
            strategy = orchestration_context["strategy"]
            execution_plan = orchestration_context["execution_plan"]
            
            logger.info(f"Executing orchestration {orchestration_id} with strategy {strategy}")
            
            # Update status
            orchestration_context["status"] = OrchestrationStatus.RUNNING
            orchestration_context["execution_started_at"] = datetime.utcnow()
            
            # Execute stages according to plan
            stage_results = []
            total_stages = len(execution_plan["stages"])
            
            for i, stage in enumerate(execution_plan["stages"]):
                logger.info(f"Executing stage {i+1}/{total_stages}: {stage['stage_id']}")
                
                stage_result = await self._execute_stage(stage, orchestration_context)
                stage_results.append(stage_result)
                
                # Check for stage failure
                if stage_result["status"] == "failed":
                    logger.error(f"Stage {stage['stage_id']} failed: {stage_result.get('error')}")
                    
                    # Attempt recovery if enabled
                    if self.config.retry_attempts > 0:
                        recovery_result = await self._attempt_stage_recovery(
                            stage, orchestration_context
                        )
                        if recovery_result["status"] == "completed":
                            stage_result = recovery_result
                        else:
                            break
                    else:
                        break
                
                # Update progress
                progress = ((i + 1) / total_stages) * 100
                orchestration_context["progress_percentage"] = progress
            
            # Determine overall result
            failed_stages = [r for r in stage_results if r["status"] == "failed"]
            
            if failed_stages:
                overall_status = "failed"
                orchestration_context["status"] = OrchestrationStatus.FAILED
            else:
                overall_status = "completed"
                orchestration_context["status"] = OrchestrationStatus.COMPLETED
            
            orchestration_result = {
                "orchestration_id": orchestration_id,
                "status": overall_status,
                "strategy": strategy,
                "total_stages": total_stages,
                "completed_stages": len([r for r in stage_results if r["status"] == "completed"]),
                "failed_stages": len(failed_stages),
                "stage_results": stage_results,
                "execution_time_seconds": (
                    datetime.utcnow() - orchestration_context["execution_started_at"]
                ).total_seconds(),
                "progress_percentage": orchestration_context.get("progress_percentage", 0),
                "completed_at": datetime.utcnow().isoformat()
            }
            
            return orchestration_result
            
        except Exception as e:
            logger.error(f"Orchestration execution failed: {e}")
            return {
                "orchestration_id": orchestration_context.get("orchestration_id"),
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.utcnow().isoformat()
            }
    
    async def _execute_stage(
        self, 
        stage: Dict[str, Any], 
        orchestration_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a single orchestration stage"""
        try:
            stage_id = stage["stage_id"]
            execution_mode = stage.get("execution_mode", "sequential")
            rules = stage.get("rules", [])
            
            logger.info(f"Executing stage {stage_id} with {len(rules)} rules in {execution_mode} mode")
            
            stage_start_time = time.time()
            
            if execution_mode == "parallel":
                # Execute rules in parallel
                tasks = []
                for rule in rules:
                    task = asyncio.create_task(self._execute_rule(rule, orchestration_context))
                    tasks.append(task)
                
                rule_results = await asyncio.gather(*tasks, return_exceptions=True)
            else:
                # Execute rules sequentially
                rule_results = []
                for rule in rules:
                    result = await self._execute_rule(rule, orchestration_context)
                    rule_results.append(result)
            
            # Analyze stage results
            successful_rules = len([r for r in rule_results if isinstance(r, dict) and r.get("status") == "completed"])
            failed_rules = len([r for r in rule_results if isinstance(r, Exception) or (isinstance(r, dict) and r.get("status") == "failed")])
            
            stage_duration = time.time() - stage_start_time
            
            stage_result = {
                "stage_id": stage_id,
                "status": "completed" if failed_rules == 0 else "failed",
                "execution_mode": execution_mode,
                "total_rules": len(rules),
                "successful_rules": successful_rules,
                "failed_rules": failed_rules,
                "execution_time_seconds": stage_duration,
                "rule_results": [
                    r if isinstance(r, dict) else {"status": "failed", "error": str(r)}
                    for r in rule_results
                ],
                "completed_at": datetime.utcnow().isoformat()
            }
            
            return stage_result
            
        except Exception as e:
            logger.error(f"Stage execution failed: {e}")
            return {
                "stage_id": stage.get("stage_id", "unknown"),
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.utcnow().isoformat()
            }
    
    async def _execute_rule(
        self, 
        rule: Dict[str, Any], 
        orchestration_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute a single scan rule"""
        try:
            rule_id = rule.get("id", str(uuid.uuid4()))
            scan_request = orchestration_context["scan_request"]
            
            # Use scan rule service to execute the rule
            rule_result = await self.scan_rule_service.execute_scan_rule(
                rule, scan_request
            )
            
            return {
                "rule_id": rule_id,
                "status": "completed",
                "result": rule_result,
                "executed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Rule execution failed: {e}")
            return {
                "rule_id": rule.get("id", "unknown"),
                "status": "failed",
                "error": str(e),
                "executed_at": datetime.utcnow().isoformat()
            }
    
    async def _attempt_stage_recovery(
        self, 
        stage: Dict[str, Any], 
        orchestration_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Attempt to recover from stage failure"""
        try:
            stage_id = stage["stage_id"]
            logger.info(f"Attempting recovery for stage {stage_id}")
            
            # Wait before retry
            await asyncio.sleep(5)
            
            # Retry the stage with modified parameters
            recovery_stage = stage.copy()
            recovery_stage["execution_mode"] = "sequential"  # Use sequential for recovery
            recovery_stage["stage_id"] = f"{stage_id}_recovery"
            
            recovery_result = await self._execute_stage(recovery_stage, orchestration_context)
            
            if recovery_result["status"] == "completed":
                logger.info(f"Stage {stage_id} recovered successfully")
            else:
                logger.error(f"Stage {stage_id} recovery failed")
            
            return recovery_result
            
        except Exception as e:
            logger.error(f"Stage recovery failed: {e}")
            return {
                "stage_id": stage.get("stage_id", "unknown"),
                "status": "failed",
                "error": f"Recovery failed: {str(e)}",
                "completed_at": datetime.utcnow().isoformat()
            }
    
    async def _release_resources(self, orchestration_id: str):
        """Release allocated resources for completed orchestration"""
        try:
            if orchestration_id in self.allocated_resources:
                allocation = self.allocated_resources.pop(orchestration_id)
                
                # Add to resource history
                self.resource_history.append({
                    "orchestration_id": orchestration_id,
                    "allocation": allocation.__dict__,
                    "released_at": datetime.utcnow().isoformat()
                })
                
                # Update resource utilization metrics
                self._update_resource_utilization_metrics()
                
                logger.info(f"Resources released for orchestration {orchestration_id}")
            
        except Exception as e:
            logger.error(f"Resource release failed: {e}")
    
    def _update_resource_utilization_metrics(self):
        """Update resource utilization metrics"""
        try:
            current_allocations = self._calculate_current_allocations()
            
            for resource_type, total_capacity in self.resource_pool.items():
                allocated = current_allocations.get(resource_type.value, 0)
                utilization = (allocated / total_capacity) * 100 if total_capacity > 0 else 0
                self.metrics.resource_utilization[resource_type.value] = utilization
            
        except Exception as e:
            logger.error(f"Resource utilization metrics update failed: {e}")
    
    async def _orchestration_loop(self):
        """Background loop for processing queued orchestrations"""
        while True:
            try:
                # Process queued orchestrations when resources become available
                if self.orchestration_queue:
                    priority, queued_time, orchestration_context = heapq.heappop(self.orchestration_queue)
                    
                    # Check if resources are now available
                    requirements = orchestration_context.get("resource_requirements", {})
                    availability = await self._check_resource_availability(requirements)
                    
                    if availability["available"]:
                        # Execute the queued orchestration
                        logger.info(f"Executing queued orchestration {orchestration_context['orchestration_id']}")
                        asyncio.create_task(
                            self.orchestrate_scan_execution(
                                orchestration_context["scan_request"],
                                orchestration_context["strategy"],
                                orchestration_context["priority"]
                            )
                        )
                    else:
                        # Put back in queue
                        heapq.heappush(self.orchestration_queue, (priority, queued_time, orchestration_context))
                
                # Clean up expired resource allocations
                await self._cleanup_expired_allocations()
                
                await asyncio.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"Error in orchestration loop: {e}")
                await asyncio.sleep(30)
    
    async def _cleanup_expired_allocations(self):
        """Clean up expired resource allocations"""
        try:
            current_time = datetime.utcnow()
            expired_allocations = []
            
            for orchestration_id, allocation in self.allocated_resources.items():
                if allocation.expires_at and current_time > allocation.expires_at:
                    expired_allocations.append(orchestration_id)
            
            for orchestration_id in expired_allocations:
                logger.warning(f"Cleaning up expired allocation for {orchestration_id}")
                await self._release_resources(orchestration_id)
                
                # Cancel the orchestration if still active
                if orchestration_id in self.active_orchestrations:
                    self.active_orchestrations[orchestration_id]["status"] = OrchestrationStatus.CANCELLED
            
        except Exception as e:
            logger.error(f"Cleanup of expired allocations failed: {e}")
    
    async def _resource_monitoring_loop(self):
        """Background loop for monitoring resource usage"""
        while True:
            try:
                # Update resource utilization metrics
                self._update_resource_utilization_metrics()
                
                # Check for resource bottlenecks
                bottlenecks = self._detect_resource_bottlenecks()
                if bottlenecks:
                    logger.warning(f"Resource bottlenecks detected: {bottlenecks}")
                
                # Update active orchestrations count
                self.metrics.active_orchestrations = len(self.active_orchestrations)
                
                await asyncio.sleep(self.config.resource_monitoring_interval)
                
            except Exception as e:
                logger.error(f"Error in resource monitoring loop: {e}")
                await asyncio.sleep(60)
    
    def _detect_resource_bottlenecks(self) -> List[str]:
        """Detect resource bottlenecks that may affect performance"""
        bottlenecks = []
        
        for resource_type, utilization in self.metrics.resource_utilization.items():
            if utilization > 90:
                bottlenecks.append(f"{resource_type}: {utilization:.1f}% utilization")
            elif utilization > 80:
                bottlenecks.append(f"{resource_type}: {utilization:.1f}% utilization (warning)")
        
        return bottlenecks
    
    async def _performance_optimization_loop(self):
        """Background loop for performance optimization"""
        while True:
            try:
                if self.config.performance_optimization_enabled:
                    # Analyze performance patterns
                    await self._analyze_performance_patterns()
                    
                    # Optimize resource allocation strategies
                    await self._optimize_resource_allocation()
                    
                    # Update ML models with recent performance data
                    await self._update_optimization_models()
                
                await asyncio.sleep(300)  # Optimize every 5 minutes
                
            except Exception as e:
                logger.error(f"Error in performance optimization loop: {e}")
                await asyncio.sleep(600)
    
    async def _analyze_performance_patterns(self):
        """Analyze performance patterns for optimization"""
        try:
            # Analyze completed orchestrations for patterns
            recent_completions = list(self.completed_orchestrations)[-100:]  # Last 100
            
            if len(recent_completions) < 10:
                return
            
            # Extract performance metrics
            execution_times = [o.get("execution_time_seconds", 0) for o in recent_completions]
            stage_counts = [o.get("total_stages", 0) for o in recent_completions]
            
            # Calculate performance statistics
            avg_execution_time = np.mean(execution_times) if execution_times else 0
            avg_stage_count = np.mean(stage_counts) if stage_counts else 0
            
            # Update metrics
            self.metrics.average_orchestration_time = avg_execution_time
            
            # Identify optimization opportunities
            if avg_execution_time > 300:  # 5 minutes
                logger.info("Long execution times detected - analyzing optimization opportunities")
            
            if avg_stage_count > 10:
                logger.info("High stage counts detected - consider stage consolidation")
            
        except Exception as e:
            logger.error(f"Performance pattern analysis failed: {e}")
    
    async def _optimize_resource_allocation(self):
        """Optimize resource allocation strategies"""
        try:
            # Analyze resource usage patterns
            if len(self.resource_history) < 10:
                return
            
            recent_history = list(self.resource_history)[-50:]  # Last 50 allocations
            
            # Extract resource usage data
            cpu_usage = [h["allocation"]["cpu_percentage"] for h in recent_history]
            memory_usage = [h["allocation"]["memory_mb"] for h in recent_history]
            
            # Calculate optimal allocation ranges
            optimal_cpu = {
                "min": np.percentile(cpu_usage, 25),
                "max": np.percentile(cpu_usage, 75),
                "avg": np.mean(cpu_usage)
            }
            
            optimal_memory = {
                "min": np.percentile(memory_usage, 25),
                "max": np.percentile(memory_usage, 75),
                "avg": np.mean(memory_usage)
            }
            
            # Store optimization insights
            self.optimization_insights = {
                "cpu_allocation": optimal_cpu,
                "memory_allocation": optimal_memory,
                "analyzed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Resource allocation optimization failed: {e}")
    
    async def _update_optimization_models(self):
        """Update ML models with recent performance data"""
        try:
            # Collect training data from recent orchestrations
            training_data = self._prepare_training_data()
            
            if len(training_data) < 20:  # Need minimum data points
                return
            
            # Update resource allocation model
            await self._retrain_resource_allocation_model(training_data)
            
            # Update performance prediction models
            await self._retrain_performance_models(training_data)
            
            logger.info("Optimization models updated with recent performance data")
            
        except Exception as e:
            logger.error(f"Model update failed: {e}")
    
    def _prepare_training_data(self) -> List[Dict[str, Any]]:
        """Prepare training data from orchestration history"""
        training_data = []
        
        # Combine completed and failed orchestrations for learning
        all_orchestrations = list(self.completed_orchestrations) + list(self.failed_orchestrations)
        
        for orchestration in all_orchestrations[-100:]:  # Last 100 orchestrations
            if "resource_allocation" in orchestration and "execution_time_seconds" in orchestration:
                data_point = {
                    "features": {
                        "cpu_percentage": orchestration["resource_allocation"]["cpu_percentage"],
                        "memory_mb": orchestration["resource_allocation"]["memory_mb"],
                        "storage_mb": orchestration["resource_allocation"]["storage_mb"],
                        "total_stages": orchestration.get("total_stages", 0),
                        "strategy": orchestration.get("strategy", "sequential")
                    },
                    "target": {
                        "execution_time": orchestration["execution_time_seconds"],
                        "success": orchestration["status"] == "completed"
                    }
                }
                training_data.append(data_point)
        
        return training_data
    
    async def _retrain_resource_allocation_model(self, training_data: List[Dict[str, Any]]):
        """Retrain the resource allocation optimization model"""
        try:
            if len(training_data) < 10:
                return
            
            # Extract features and targets
            features = []
            targets = []
            
            for data_point in training_data:
                feature_vector = [
                    data_point["features"]["cpu_percentage"],
                    data_point["features"]["memory_mb"] / 1000,  # Scale to GB
                    data_point["features"]["storage_mb"] / 1000,  # Scale to GB
                    data_point["features"]["total_stages"]
                ]
                features.append(feature_vector)
                targets.append(data_point["target"]["execution_time"])
            
            # Train the model
            X = np.array(features)
            y = np.array(targets)
            
            # Normalize features
            X_scaled = self.feature_scalers["resource_features"].fit_transform(X)
            
            # Retrain the model
            self.optimization_models["resource_allocation"].fit(X_scaled, y)
            
            logger.info("Resource allocation model retrained successfully")
            
        except Exception as e:
            logger.error(f"Resource allocation model retraining failed: {e}")
    
    async def _retrain_performance_models(self, training_data: List[Dict[str, Any]]):
        """Retrain performance prediction models"""
        try:
            if len(training_data) < 10:
                return
            
            # Prepare data for duration prediction
            features = []
            durations = []
            
            for data_point in training_data:
                feature_vector = [
                    data_point["features"]["cpu_percentage"],
                    data_point["features"]["memory_mb"] / 1000,
                    data_point["features"]["total_stages"],
                    1 if data_point["features"]["strategy"] == "parallel" else 0
                ]
                features.append(feature_vector)
                durations.append(data_point["target"]["execution_time"])
            
            # Train duration prediction model
            X = np.array(features)
            y = np.array(durations)
            
            X_scaled = self.feature_scalers["performance_features"].fit_transform(X)
            self.performance_predictors["scan_duration"].fit(X_scaled, y)
            
            logger.info("Performance prediction models retrained successfully")
            
        except Exception as e:
            logger.error(f"Performance model retraining failed: {e}")
    
    async def _metrics_collection_loop(self):
        """Background loop for collecting and updating metrics"""
        while True:
            try:
                # Update orchestration metrics
                self._update_orchestration_metrics()
                
                # Calculate success rate
                total_orchestrations = self.metrics.completed_orchestrations + self.metrics.failed_orchestrations
                if total_orchestrations > 0:
                    self.metrics.success_rate = (
                        self.metrics.completed_orchestrations / total_orchestrations
                    ) * 100
                
                # Calculate throughput
                self.metrics.throughput_per_minute = self._calculate_throughput()
                
                # Store metrics history
                self.performance_history.append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "metrics": self.metrics.__dict__.copy()
                })
                
                await asyncio.sleep(60)  # Update every minute
                
            except Exception as e:
                logger.error(f"Error in metrics collection loop: {e}")
                await asyncio.sleep(120)
    
    def _update_orchestration_metrics(self):
        """Update orchestration-specific metrics"""
        try:
            # Update active orchestrations count
            self.metrics.active_orchestrations = len(self.active_orchestrations)
            
            # Update total orchestrations (from history)
            self.metrics.total_orchestrations = (
                len(self.completed_orchestrations) + 
                len(self.failed_orchestrations) + 
                self.metrics.active_orchestrations
            )
            
            # Calculate queue metrics
            queue_times = []
            current_time = time.time()
            
            for _, queued_time, _ in self.orchestration_queue:
                queue_times.append(current_time - queued_time)
            
            self.metrics.average_queue_time = np.mean(queue_times) if queue_times else 0
            
        except Exception as e:
            logger.error(f"Orchestration metrics update failed: {e}")
    
    def _calculate_throughput(self) -> float:
        """Calculate orchestration throughput per minute"""
        try:
            # Get completions from the last hour
            one_hour_ago = datetime.utcnow() - timedelta(hours=1)
            
            recent_completions = 0
            for orchestration in self.completed_orchestrations:
                completed_at_str = orchestration.get("completed_at")
                if completed_at_str:
                    try:
                        completed_at = datetime.fromisoformat(completed_at_str.replace('Z', '+00:00'))
                        if completed_at > one_hour_ago:
                            recent_completions += 1
                    except:
                        continue
            
            # Convert to per-minute rate
            return recent_completions / 60.0 if recent_completions > 0 else 0.0
            
        except Exception as e:
            logger.error(f"Throughput calculation failed: {e}")
            return 0.0
    
    async def get_orchestration_status(self) -> Dict[str, Any]:
        """Get comprehensive orchestration status and metrics"""
        return {
            "service_status": "active",
            "active_orchestrations": len(self.active_orchestrations),
            "queued_orchestrations": len(self.orchestration_queue),
            "metrics": self.metrics.__dict__,
            "resource_utilization": self.metrics.resource_utilization,
            "recent_completions": list(self.completed_orchestrations)[-10:],
            "recent_failures": list(self.failed_orchestrations)[-5:],
            "optimization_insights": getattr(self, "optimization_insights", {}),
            "configuration": self.config.__dict__
        }
    
    async def cancel_orchestration(self, orchestration_id: str) -> Dict[str, Any]:
        """Cancel an active or queued orchestration"""
        try:
            # Check if orchestration is active
            if orchestration_id in self.active_orchestrations:
                self.active_orchestrations[orchestration_id]["status"] = OrchestrationStatus.CANCELLED
                await self._release_resources(orchestration_id)
                
                return {
                    "orchestration_id": orchestration_id,
                    "status": "cancelled",
                    "message": "Active orchestration cancelled successfully",
                    "cancelled_at": datetime.utcnow().isoformat()
                }
            
            # Check if orchestration is queued
            new_queue = []
            found = False
            
            while self.orchestration_queue:
                priority, queued_time, context = heapq.heappop(self.orchestration_queue)
                if context["orchestration_id"] == orchestration_id:
                    found = True
                    break
                else:
                    new_queue.append((priority, queued_time, context))
            
            # Rebuild queue without the cancelled orchestration
            self.orchestration_queue = new_queue
            heapq.heapify(self.orchestration_queue)
            
            if found:
                return {
                    "orchestration_id": orchestration_id,
                    "status": "cancelled",
                    "message": "Queued orchestration cancelled successfully",
                    "cancelled_at": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "orchestration_id": orchestration_id,
                    "status": "not_found",
                    "message": "Orchestration not found in active or queued list",
                    "checked_at": datetime.utcnow().isoformat()
                }
            
        except Exception as e:
            logger.error(f"Orchestration cancellation failed: {e}")
            raise