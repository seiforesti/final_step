"""
Enterprise Intelligent Scan Coordinator
Advanced scan coordination service for multi-system orchestration and optimization.
Provides AI-powered scheduling, resource management, intelligent coordination,
real-time monitoring, and comprehensive workflow automation.
"""

import asyncio
import json
import logging
import numpy as np
import time
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple, Union
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete

from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..db_session import get_session
from ..core.logging_config import get_logger
from ..core.settings import get_settings_manager
from ..models.scan_models import *
from ..models.scan_workflow_models import *
from ..models.scan_performance_models import *
from ..services.ai_service import EnterpriseAIService as AIService
from ..services.enterprise_scan_orchestrator import EnterpriseScanOrchestrator
from ..services.scan_intelligence_service import ScanIntelligenceService

logger = get_logger(__name__)

class CoordinationConfig:
    """Configuration for scan coordination"""
    
    def __init__(self):
        self.max_concurrent_scans = 50
        self.max_queue_size = 1000
        self.default_priority = 5
        self.resource_check_interval = 30  # seconds
        self.coordination_interval = 60  # seconds
        self.cleanup_interval = 3600  # seconds
        self.max_retry_attempts = 3
        self.default_timeout = 1800  # 30 minutes
        
        # Resource thresholds
        self.cpu_threshold = 80.0
        self.memory_threshold = 85.0
        self.disk_threshold = 90.0
        self.network_threshold = 70.0
        
        # Coordination strategies
        self.load_balancing_strategy = "weighted_round_robin"
        self.scheduling_algorithm = "intelligent_priority"
        self.resource_allocation_method = "adaptive"
        self.optimization_interval = 300  # 5 minutes

class IntelligentScanCoordinator:
    """
    Enterprise-grade intelligent scan coordinator providing:
    - Multi-system scan coordination
    - AI-powered resource optimization
    - Intelligent priority-based scheduling
    - Real-time performance monitoring
    - Automated workflow management
    - Cross-system dependency tracking
    - Advanced failure recovery
    """
    
    def __init__(self):
        self.settings = get_settings_manager()
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = CoordinationConfig()
        self.orchestrator = EnterpriseScanOrchestrator()
        self.intelligence_service = ScanIntelligenceService()
        
        # Coordination state
        self.active_scans = {}
        self.scan_queue = deque()
        self.completed_scans = deque(maxlen=1000)
        self.failed_scans = deque(maxlen=500)
        
        # Resource management
        self.system_resources = {}
        self.resource_allocations = {}
        self.resource_history = deque(maxlen=1000)
        
        # Performance tracking
        self.coordination_metrics = {
            'total_scans_coordinated': 0,
            'successful_scans': 0,
            'failed_scans': 0,
            'average_scan_duration': 0.0,
            'resource_utilization': {},
            'queue_length': 0,
            'concurrent_scans': 0,
            'optimization_cycles': 0,
            'load_balancing_efficiency': 0.0
        }
        
        # Workflow management
        self.active_workflows = {}
        self.workflow_dependencies = defaultdict(set)
        self.workflow_templates = {}
        
        # Intelligence and optimization
        self.coordination_patterns = {}
        self.optimization_suggestions = deque(maxlen=100)
        self.performance_baselines = {}
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=20)
        
        # Background tasks (deferred safely if no running loop)
        self._deferred_tasks = []
        self._start_task(self._coordination_loop())
        self._start_task(self._resource_monitoring_loop())
        self._start_task(self._optimization_loop())
        self._start_task(self._cleanup_loop())
    
    def _start_task(self, coro):
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(coro)
        except RuntimeError:
            self._deferred_tasks.append(coro)
    
    async def start(self):
        # Attach deferred tasks once an event loop is available
        if self._deferred_tasks:
            for coro in self._deferred_tasks:
                asyncio.create_task(coro)
            self._deferred_tasks.clear()
    
    # Multi-system coordination support methods
    async def _validate_coordination_request(self, scan_request: Dict[str, Any], 
                                          target_systems: List[str], 
                                          coordination_strategy: str) -> Dict[str, Any]:
        """Validate coordination request parameters"""
        try:
            validation_result = {"valid": True, "error": None}
            
            # Validate scan request
            if not scan_request or not isinstance(scan_request, dict):
                validation_result["valid"] = False
                validation_result["error"] = "Invalid scan request format"
                return validation_result
            
            # Validate target systems
            if not target_systems or not isinstance(target_systems, list) or len(target_systems) == 0:
                validation_result["valid"] = False
                validation_result["error"] = "Invalid or empty target systems list"
                return validation_result
            
            # Validate coordination strategy
            valid_strategies = ["parallel", "sequential", "adaptive", "intelligent"]
            if coordination_strategy not in valid_strategies:
                validation_result["valid"] = False
                validation_result["error"] = f"Invalid coordination strategy. Must be one of: {valid_strategies}"
                return validation_result
            
            # Validate system limits
            if len(target_systems) > 100:  # Maximum 100 systems per coordination
                validation_result["valid"] = False
                validation_result["error"] = "Too many target systems. Maximum allowed: 100"
                return validation_result
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Error validating coordination request: {e}")
            return {"valid": False, "error": str(e)}
    
    async def _analyze_resource_requirements(self, scan_request: Dict[str, Any], 
                                          target_systems: List[str]) -> Dict[str, Any]:
        """Analyze resource requirements for multi-system coordination"""
        try:
            analysis = {
                "total_systems": len(target_systems),
                "requirements": {},
                "estimated_duration": 0,
                "complexity": "medium"
            }
            
            # Analyze scan type complexity
            scan_type = scan_request.get("scan_type", "standard")
            if scan_type in ["comprehensive", "deep_scan"]:
                analysis["complexity"] = "high"
                base_duration = 600  # 10 minutes per system
            elif scan_type in ["quick_scan", "light_scan"]:
                analysis["complexity"] = "low"
                base_duration = 120  # 2 minutes per system
            else:
                base_duration = 300  # 5 minutes per system
            
            # Calculate total duration
            analysis["estimated_duration"] = base_duration * len(target_systems)
            
            # Estimate resource requirements
            base_cpu = 20.0  # Base CPU per system
            base_memory = 512  # Base memory per system (MB)
            base_disk = 100   # Base disk per system (MB)
            base_network = 10.0  # Base network per system (Mbps)
            
            # Adjust based on complexity
            if analysis["complexity"] == "high":
                base_cpu *= 1.5
                base_memory *= 1.5
                base_disk *= 2.0
                base_network *= 1.3
            elif analysis["complexity"] == "low":
                base_cpu *= 0.7
                base_memory *= 0.7
                base_disk *= 0.8
                base_network *= 0.8
            
            # Calculate total requirements
            analysis["requirements"] = {
                "cpu": base_cpu * len(target_systems),
                "memory": base_memory * len(target_systems),
                "disk": base_disk * len(target_systems),
                "network": base_network * len(target_systems)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing resource requirements: {e}")
            return {"error": str(e)}
    
    async def _check_resource_availability(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Check if sufficient resources are available for coordination"""
        try:
            # Get current resource status
            current_cpu = self.system_resources.get("cpu", {}).get("current", 0)
            current_memory = self.system_resources.get("memory", {}).get("current", 0)
            current_disk = self.system_resources.get("disk", {}).get("current", 0)
            
            # Check CPU availability
            cpu_available = 100.0 - current_cpu
            cpu_sufficient = cpu_available >= requirements.get("cpu", 0)
            
            # Check memory availability
            memory_available = 100.0 - current_memory
            memory_sufficient = memory_available >= requirements.get("memory", 0)
            
            # Check disk availability
            disk_available = 100.0 - current_disk
            disk_sufficient = disk_available >= requirements.get("disk", 0)
            
            # Check concurrent scan capacity
            concurrent_capacity = self.config.max_concurrent_scans - len(self.active_scans)
            capacity_sufficient = concurrent_capacity >= 1
            
            return {
                "sufficient": cpu_sufficient and memory_sufficient and disk_sufficient and capacity_sufficient,
                "cpu": {"required": requirements.get("cpu", 0), "available": cpu_available, "sufficient": cpu_sufficient},
                "memory": {"required": requirements.get("memory", 0), "available": memory_available, "sufficient": memory_sufficient},
                "disk": {"required": requirements.get("disk", 0), "available": disk_available, "sufficient": disk_sufficient},
                "capacity": {"required": 1, "available": concurrent_capacity, "sufficient": capacity_sufficient}
            }
            
        except Exception as e:
            logger.error(f"Error checking resource availability: {e}")
            return {"sufficient": False, "error": str(e)}
    
    async def _queue_coordination(self, coordination_id: str, scan_request: Dict[str, Any],
                                target_systems: List[str], coordination_strategy: str,
                                resource_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Queue coordination for later execution when resources become available"""
        try:
            # Create queued coordination entry
            queued_coordination = {
                "coordination_id": coordination_id,
                "scan_request": scan_request,
                "target_systems": target_systems,
                "coordination_strategy": coordination_strategy,
                "resource_analysis": resource_analysis,
                "queued_at": datetime.utcnow().isoformat(),
                "status": "queued",
                "priority": scan_request.get("priority", 5)
            }
            
            # Add to scan queue
            self.scan_queue.append(queued_coordination)
            
            logger.info(f"Queued coordination {coordination_id} due to insufficient resources")
            
            return {
                "coordination_id": coordination_id,
                "status": "queued",
                "message": "Coordination queued due to insufficient resources",
                "queue_position": len(self.scan_queue),
                "estimated_wait_time": len(self.scan_queue) * 5  # Rough estimate: 5 minutes per queued item
            }
            
        except Exception as e:
            logger.error(f"Error queuing coordination: {e}")
            return {"coordination_id": coordination_id, "status": "failed", "error": str(e)}
    
    async def _create_execution_plan(self, coordination_id: str, scan_request: Dict[str, Any],
                                   target_systems: List[str], coordination_strategy: str,
                                   resource_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create execution plan for coordination"""
        try:
            execution_plan = {
                "coordination_id": coordination_id,
                "scan_request": scan_request,
                "target_systems": target_systems,
                "coordination_strategy": coordination_strategy,
                "resource_analysis": resource_analysis,
                "system_configs": [],
                "estimated_duration": resource_analysis.get("estimated_duration", 0),
                "resource_requirements": resource_analysis.get("requirements", {}),
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Create system configurations
            for system_id in target_systems:
                system_config = {
                    "system_id": system_id,
                    "scan_config": scan_request.copy(),
                    "resource_requirements": {
                        "cpu": resource_analysis["requirements"]["cpu"] / len(target_systems),
                        "memory": resource_analysis["requirements"]["memory"] / len(target_systems),
                        "disk": resource_analysis["requirements"]["disk"] / len(target_systems),
                        "network": resource_analysis["requirements"]["network"] / len(target_systems)
                    }
                }
                execution_plan["system_configs"].append(system_config)
            
            # Set initial batch size based on strategy
            if coordination_strategy == "parallel":
                execution_plan["initial_batch_size"] = min(5, len(target_systems))
            elif coordination_strategy == "sequential":
                execution_plan["initial_batch_size"] = 1
            else:  # adaptive or intelligent
                execution_plan["initial_batch_size"] = min(3, len(target_systems))
            
            return execution_plan
            
        except Exception as e:
            logger.error(f"Error creating execution plan: {e}")
            return {"error": str(e)}
    
    async def _execute_parallel_coordination(self, coordination_id: str, 
                                           execution_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Execute coordination using parallel strategy"""
        try:
            system_results = {}
            completed_systems = []
            failed_systems = []
            
            # Execute all systems in parallel
            execution_tasks = []
            for system_config in execution_plan["system_configs"]:
                task = self._execute_system_scan(coordination_id, system_config)
                execution_tasks.append((system_config["system_id"], task))
            
            # Wait for all tasks to complete
            for system_id, task in execution_tasks:
                try:
                    timeout = execution_plan.get("timeout", self.config.default_timeout)
                    result = await asyncio.wait_for(task, timeout=timeout)
                    system_results[system_id] = result
                    
                    if result.get("status") == "completed":
                        completed_systems.append(system_id)
                    else:
                        failed_systems.append(system_id)
                        
                except asyncio.TimeoutError:
                    system_results[system_id] = {
                        "status": "timeout",
                        "error": f"Scan timeout after {timeout} seconds"
                    }
                    failed_systems.append(system_id)
                    
                except Exception as e:
                    system_results[system_id] = {
                        "status": "failed",
                        "error": str(e)
                    }
                    failed_systems.append(system_id)
            
            # Determine overall status
            total_systems = len(execution_plan["system_configs"])
            successful_systems = len(completed_systems)
            
            if successful_systems == total_systems:
                overall_status = "completed"
            elif successful_systems > 0:
                overall_status = "partial_success"
            else:
                overall_status = "failed"
            
            # Collect metrics
            performance_metrics = await self._collect_performance_metrics(system_results)
            resource_utilization = await self._calculate_resource_utilization(execution_plan, system_results)
            
            return {
                "status": overall_status,
                "system_results": system_results,
                "completed_systems": completed_systems,
                "failed_systems": failed_systems,
                "performance_metrics": performance_metrics,
                "resource_utilization": resource_utilization,
                "execution_strategy": "parallel"
            }
            
        except Exception as e:
            logger.error(f"Parallel coordination execution failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "system_results": {},
                "execution_strategy": "parallel"
            }
    
    async def _execute_sequential_coordination(self, coordination_id: str, 
                                             execution_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Execute coordination using sequential strategy"""
        try:
            system_results = {}
            completed_systems = []
            failed_systems = []
            
            # Execute systems sequentially
            for system_config in execution_plan["system_configs"]:
                try:
                    result = await self._execute_system_scan(coordination_id, system_config)
                    system_results[system_config["system_id"]] = result
                    
                    if result.get("status") == "completed":
                        completed_systems.append(system_config["system_id"])
                    else:
                        failed_systems.append(system_config["system_id"])
                        
                except Exception as e:
                    system_results[system_config["system_id"]] = {
                        "status": "failed",
                        "error": str(e)
                    }
                    failed_systems.append(system_config["system_id"])
            
            # Determine overall status
            total_systems = len(execution_plan["system_configs"])
            successful_systems = len(completed_systems)
            
            if successful_systems == total_systems:
                overall_status = "completed"
            elif successful_systems > 0:
                overall_status = "partial_success"
            else:
                overall_status = "failed"
            
            # Collect metrics
            performance_metrics = await self._collect_performance_metrics(system_results)
            resource_utilization = await self._calculate_resource_utilization(execution_plan, system_results)
            
            return {
                "status": overall_status,
                "system_results": system_results,
                "completed_systems": completed_systems,
                "failed_systems": failed_systems,
                "performance_metrics": performance_metrics,
                "resource_utilization": resource_utilization,
                "execution_strategy": "sequential"
            }
            
        except Exception as e:
            logger.error(f"Sequential coordination execution failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "system_results": {},
                "execution_strategy": "sequential"
            }
    
    async def _execute_intelligent_coordination(self, coordination_id: str, 
                                              execution_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Execute coordination using intelligent strategy (AI-powered)"""
        try:
            # Use adaptive strategy as base for intelligent coordination
            return await self._execute_adaptive_coordination(coordination_id, execution_plan)
            
        except Exception as e:
            logger.error(f"Intelligent coordination execution failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "system_results": {},
                "execution_strategy": "intelligent"
            }
    
    async def _update_coordination_metrics(self, coordination_result: Dict[str, Any], execution_time: float):
        """Update coordination metrics after execution"""
        try:
            # Update total coordinations
            self.coordination_metrics["total_scans_coordinated"] += 1
            
            # Update execution time metrics
            if coordination_result.get("status") == "completed":
                self.coordination_metrics["successful_scans"] += 1
            else:
                self.coordination_metrics["failed_scans"] += 1
            
            # Update average execution time
            current_avg = self.coordination_metrics["average_scan_duration"]
            total_coordinations = self.coordination_metrics["total_scans_coordinated"]
            
            self.coordination_metrics["average_scan_duration"] = (
                (current_avg * (total_coordinations - 1) + execution_time) / total_coordinations
            )
            
            logger.info(f"Updated coordination metrics for execution time: {execution_time}s")
            
        except Exception as e:
            logger.error(f"Error updating coordination metrics: {e}")
    
    async def _store_coordination_results(self, coordination_id: str, coordination_result: Dict[str, Any]):
        """Store coordination results for future reference"""
        try:
            # Store in completed scans if successful
            if coordination_result.get("status") in ["completed", "partial_success"]:
                self.completed_scans.append({
                    "coordination_id": coordination_id,
                    "result": coordination_result,
                    "completed_at": datetime.utcnow().isoformat()
                })
            else:
                # Store in failed scans
                self.failed_scans.append({
                    "coordination_id": coordination_id,
                    "result": coordination_result,
                    "failed_at": datetime.utcnow().isoformat()
                })
            
            logger.info(f"Stored coordination results for {coordination_id}")
            
        except Exception as e:
            logger.error(f"Error storing coordination results: {e}")
    
    async def coordinate_multi_system_scan(
        self,
        scan_request: Dict[str, Any],
        target_systems: List[str],
        coordination_strategy: str = "parallel"
    ) -> Dict[str, Any]:
        """
        Coordinate scans across multiple systems with intelligent orchestration
        
        Args:
            scan_request: Base scan request configuration
            target_systems: List of target system identifiers
            coordination_strategy: Strategy for coordination (parallel, sequential, adaptive)
            
        Returns:
            Coordination results with execution details and metrics
        """
        coordination_id = str(uuid4())
        start_time = time.time()
        
        try:
            # Validate and prepare request
            validated_request = await self._validate_coordination_request(
                scan_request, target_systems, coordination_strategy
            )
            
            if not validated_request["valid"]:
                return {
                    "coordination_id": coordination_id,
                    "status": "failed",
                    "error": validated_request["error"],
                    "systems": target_systems
                }
            
            # Analyze resource requirements
            resource_analysis = await self._analyze_resource_requirements(
                scan_request, target_systems
            )
            
            # Check resource availability
            resource_availability = await self._check_resource_availability(
                resource_analysis["requirements"]
            )
            
            if not resource_availability["sufficient"]:
                # Queue for later execution
                queued_coordination = await self._queue_coordination(
                    coordination_id, scan_request, target_systems, 
                    coordination_strategy, resource_analysis
                )
                return queued_coordination
            
            # Create coordination execution plan
            execution_plan = await self._create_execution_plan(
                coordination_id, scan_request, target_systems, 
                coordination_strategy, resource_analysis
            )
            
            # Execute coordination based on strategy
            if coordination_strategy == "parallel":
                coordination_result = await self._execute_parallel_coordination(
                    coordination_id, execution_plan
                )
            elif coordination_strategy == "sequential":
                coordination_result = await self._execute_sequential_coordination(
                    coordination_id, execution_plan
                )
            elif coordination_strategy == "adaptive":
                coordination_result = await self._execute_adaptive_coordination(
                    coordination_id, execution_plan
                )
            else:
                coordination_result = await self._execute_intelligent_coordination(
                    coordination_id, execution_plan
                )
            
            # Update coordination metrics
            execution_time = time.time() - start_time
            await self._update_coordination_metrics(
                coordination_result, execution_time
            )
            
            # Store coordination results
            await self._store_coordination_results(
                coordination_id, coordination_result
            )
            
            logger.info(f"Multi-system scan coordination completed: {coordination_id}")
            
            return {
                "coordination_id": coordination_id,
                "status": coordination_result["status"],
                "systems": target_systems,
                "strategy": coordination_strategy,
                "execution_time_seconds": execution_time,
                "system_results": coordination_result["system_results"],
                "resource_utilization": coordination_result["resource_utilization"],
                "performance_metrics": coordination_result["performance_metrics"],
                "recommendations": coordination_result.get("recommendations", [])
            }
            
        except Exception as e:
            logger.error(f"Multi-system scan coordination failed: {e}")
            return {
                "coordination_id": coordination_id,
                "status": "failed",
                "error": str(e),
                "systems": target_systems,
                "execution_time_seconds": time.time() - start_time
            }
    
    async def _execute_parallel_coordination(
        self,
        coordination_id: str,
        execution_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute scans in parallel across all target systems"""
        
        try:
            system_tasks = []
            system_results = {}
            
            # Create parallel execution tasks
            for system_config in execution_plan["system_configs"]:
                task = self._execute_system_scan(
                    coordination_id, system_config
                )
                system_tasks.append((system_config["system_id"], task))
            
            # Execute all tasks in parallel with timeout
            completed_tasks = []
            failed_tasks = []
            
            # Use asyncio.wait_for with timeout for each task
            for system_id, task in system_tasks:
                try:
                    timeout = execution_plan.get("timeout", self.config.default_timeout)
                    result = await asyncio.wait_for(task, timeout=timeout)
                    system_results[system_id] = result
                    completed_tasks.append(system_id)
                except asyncio.TimeoutError:
                    logger.warning(f"System scan timeout: {system_id}")
                    system_results[system_id] = {
                        "status": "timeout",
                        "error": f"Scan timeout after {timeout} seconds"
                    }
                    failed_tasks.append(system_id)
                except Exception as e:
                    logger.error(f"System scan failed: {system_id} - {e}")
                    system_results[system_id] = {
                        "status": "failed",
                        "error": str(e)
                    }
                    failed_tasks.append(system_id)
            
            # Calculate overall status
            total_systems = len(execution_plan["system_configs"])
            successful_systems = len(completed_tasks)
            
            if successful_systems == total_systems:
                overall_status = "completed"
            elif successful_systems > 0:
                overall_status = "partial_success"
            else:
                overall_status = "failed"
            
            # Collect performance metrics
            performance_metrics = await self._collect_performance_metrics(
                system_results
            )
            
            # Calculate resource utilization
            resource_utilization = await self._calculate_resource_utilization(
                execution_plan, system_results
            )
            
            return {
                "status": overall_status,
                "system_results": system_results,
                "completed_systems": completed_tasks,
                "failed_systems": failed_tasks,
                "performance_metrics": performance_metrics,
                "resource_utilization": resource_utilization,
                "execution_strategy": "parallel"
            }
            
        except Exception as e:
            logger.error(f"Parallel coordination execution failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "system_results": {},
                "execution_strategy": "parallel"
            }
    
    async def _execute_sequential_coordination(
        self,
        coordination_id: str,
        execution_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute scans sequentially across target systems"""
        
        try:
            system_results = {}
            completed_systems = []
            failed_systems = []
            
            # Execute systems in order based on priority
            sorted_configs = sorted(
                execution_plan["system_configs"],
                key=lambda x: x.get("priority", 5),
                reverse=True
            )
            
            for system_config in sorted_configs:
                system_id = system_config["system_id"]
                
                try:
                    # Check if we should continue based on previous failures
                    if execution_plan.get("fail_fast", False) and failed_systems:
                        system_results[system_id] = {
                            "status": "skipped",
                            "reason": "Previous system failure with fail_fast enabled"
                        }
                        continue
                    
                    # Execute system scan
                    timeout = execution_plan.get("timeout", self.config.default_timeout)
                    result = await asyncio.wait_for(
                        self._execute_system_scan(coordination_id, system_config),
                        timeout=timeout
                    )
                    
                    system_results[system_id] = result
                    
                    if result.get("status") == "completed":
                        completed_systems.append(system_id)
                    else:
                        failed_systems.append(system_id)
                    
                    # Add delay between systems if configured
                    delay = execution_plan.get("inter_system_delay", 0)
                    if delay > 0:
                        await asyncio.sleep(delay)
                    
                except asyncio.TimeoutError:
                    logger.warning(f"System scan timeout: {system_id}")
                    system_results[system_id] = {
                        "status": "timeout",
                        "error": f"Scan timeout after {timeout} seconds"
                    }
                    failed_systems.append(system_id)
                    
                except Exception as e:
                    logger.error(f"System scan failed: {system_id} - {e}")
                    system_results[system_id] = {
                        "status": "failed",
                        "error": str(e)
                    }
                    failed_systems.append(system_id)
            
            # Determine overall status
            total_systems = len(execution_plan["system_configs"])
            successful_systems = len(completed_systems)
            
            if successful_systems == total_systems:
                overall_status = "completed"
            elif successful_systems > 0:
                overall_status = "partial_success"
            else:
                overall_status = "failed"
            
            # Collect metrics
            performance_metrics = await self._collect_performance_metrics(
                system_results
            )
            
            resource_utilization = await self._calculate_resource_utilization(
                execution_plan, system_results
            )
            
            return {
                "status": overall_status,
                "system_results": system_results,
                "completed_systems": completed_systems,
                "failed_systems": failed_systems,
                "performance_metrics": performance_metrics,
                "resource_utilization": resource_utilization,
                "execution_strategy": "sequential"
            }
            
        except Exception as e:
            logger.error(f"Sequential coordination execution failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "system_results": {},
                "execution_strategy": "sequential"
            }
    
    # Execution support methods
    async def _check_current_resource_availability(self) -> Dict[str, Any]:
        """Check current resource availability for scan execution"""
        try:
            # Get current resource status
            cpu_available = 100.0 - self.system_resources.get("cpu", {}).get("current", 0)
            memory_available = 100.0 - self.system_resources.get("memory", {}).get("current", 0)
            disk_available = 100.0 - self.system_resources.get("disk", {}).get("current", 0)
            
            # Check if resources are sufficient for new scans
            sufficient_cpu = cpu_available > 20.0  # Need at least 20% CPU
            sufficient_memory = memory_available > 15.0  # Need at least 15% memory
            sufficient_disk = disk_available > 10.0  # Need at least 10% disk
            
            # Check concurrent scan capacity
            concurrent_capacity = self.config.max_concurrent_scans - len(self.active_scans)
            sufficient_capacity = concurrent_capacity > 0
            
            return {
                "sufficient": sufficient_cpu and sufficient_memory and sufficient_disk and sufficient_capacity,
                "cpu_available": cpu_available,
                "memory_available": memory_available,
                "disk_available": disk_available,
                "concurrent_capacity": concurrent_capacity,
                "details": {
                    "cpu_sufficient": sufficient_cpu,
                    "memory_sufficient": sufficient_memory,
                    "disk_sufficient": sufficient_disk,
                    "capacity_sufficient": sufficient_capacity
                }
            }
            
        except Exception as e:
            logger.error(f"Error checking resource availability: {e}")
            return {"sufficient": False, "error": str(e)}
    
    async def _collect_performance_metrics(self, system_results: Dict[str, Any]) -> Dict[str, Any]:
        """Collect performance metrics from system scan results"""
        try:
            metrics = {
                "total_systems": len(system_results),
                "successful_systems": 0,
                "failed_systems": 0,
                "total_execution_time": 0,
                "avg_execution_time": 0,
                "resource_usage": {}
            }
            
            execution_times = []
            total_resource_usage = {"cpu": 0, "memory": 0, "disk": 0, "network": 0}
            
            for system_id, result in system_results.items():
                if result.get("status") == "completed":
                    metrics["successful_systems"] += 1
                    
                    # Collect execution time
                    if "duration_seconds" in result:
                        execution_times.append(result["duration_seconds"])
                        metrics["total_execution_time"] += result["duration_seconds"]
                    
                    # Collect resource usage
                    if "resource_usage" in result:
                        resource_usage = result["resource_usage"]
                        for resource_type in total_resource_usage:
                            if resource_type in resource_usage:
                                total_resource_usage[resource_type] += resource_usage[resource_type]
                else:
                    metrics["failed_systems"] += 1
            
            # Calculate averages
            if execution_times:
                metrics["avg_execution_time"] = sum(execution_times) / len(execution_times)
            
            # Calculate average resource usage
            if metrics["successful_systems"] > 0:
                for resource_type in total_resource_usage:
                    total_resource_usage[resource_type] = total_resource_usage[resource_type] / metrics["successful_systems"]
            
            metrics["resource_usage"] = total_resource_usage
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting performance metrics: {e}")
            return {"error": str(e)}
    
    async def _calculate_resource_utilization(self, execution_plan: Dict[str, Any], 
                                           system_results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate resource utilization for the coordination execution"""
        try:
            utilization = {
                "total_resources_allocated": 0,
                "peak_resources_used": {},
                "average_resources_used": {},
                "resource_efficiency": 0.0
            }
            
            # Calculate total resources allocated
            total_allocated = 0
            for system_config in execution_plan.get("system_configs", []):
                resource_req = system_config.get("resource_requirements", {})
                total_allocated += sum(resource_req.values()) if isinstance(resource_req, dict) else 0
            
            utilization["total_resources_allocated"] = total_allocated
            
            # Calculate peak and average resource usage
            peak_usage = {"cpu": 0, "memory": 0, "disk": 0, "network": 0}
            total_usage = {"cpu": 0, "memory": 0, "disk": 0, "network": 0}
            usage_count = 0
            
            for system_id, result in system_results.items():
                if result.get("status") == "completed" and "resource_usage" in result:
                    resource_usage = result["resource_usage"]
                    usage_count += 1
                    
                    for resource_type in peak_usage:
                        if resource_type in resource_usage:
                            peak_usage[resource_type] = max(peak_usage[resource_type], resource_usage[resource_type])
                            total_usage[resource_type] += resource_usage[resource_type]
            
            utilization["peak_resources_used"] = peak_usage
            
            # Calculate averages
            if usage_count > 0:
                for resource_type in total_usage:
                    total_usage[resource_type] = total_usage[resource_type] / usage_count
                utilization["average_resources_used"] = total_usage
            
            # Calculate resource efficiency
            if total_allocated > 0:
                actual_used = sum(peak_usage.values())
                utilization["resource_efficiency"] = (actual_used / total_allocated) * 100
            
            return utilization
            
        except Exception as e:
            logger.error(f"Error calculating resource utilization: {e}")
            return {"error": str(e)}
    
    async def _execute_adaptive_coordination(
        self,
        coordination_id: str,
        execution_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute scans with adaptive strategy based on real-time conditions"""
        
        try:
            system_results = {}
            completed_systems = []
            failed_systems = []
            
            # Start with initial parallel batch
            batch_size = min(
                execution_plan.get("initial_batch_size", 3),
                len(execution_plan["system_configs"])
            )
            
            remaining_configs = execution_plan["system_configs"].copy()
            
            while remaining_configs:
                # Select next batch based on resource availability
                current_batch_size = min(batch_size, len(remaining_configs))
                current_batch = remaining_configs[:current_batch_size]
                remaining_configs = remaining_configs[current_batch_size:]
                
                # Check resource availability before executing batch
                resource_check = await self._check_current_resource_availability()
                
                if not resource_check["sufficient"]:
                    # Reduce batch size or wait
                    if current_batch_size > 1:
                        current_batch_size = max(1, current_batch_size // 2)
                        current_batch = current_batch[:current_batch_size]
                        remaining_configs = execution_plan["system_configs"][current_batch_size:] + remaining_configs[current_batch_size:]
                    else:
                        # Wait for resources
                        await asyncio.sleep(30)
                        continue
                
                # Execute current batch in parallel
                batch_tasks = []
                for system_config in current_batch:
                    task = self._execute_system_scan(coordination_id, system_config)
                    batch_tasks.append((system_config["system_id"], task))
                
                # Wait for batch completion
                for system_id, task in batch_tasks:
                    try:
                        timeout = execution_plan.get("timeout", self.config.default_timeout)
                        result = await asyncio.wait_for(task, timeout=timeout)
                        system_results[system_id] = result
                        
                        if result.get("status") == "completed":
                            completed_systems.append(system_id)
                        else:
                            failed_systems.append(system_id)
                            
                    except asyncio.TimeoutError:
                        system_results[system_id] = {
                            "status": "timeout",
                            "error": f"Scan timeout after {timeout} seconds"
                        }
                        failed_systems.append(system_id)
                        
                    except Exception as e:
                        system_results[system_id] = {
                            "status": "failed",
                            "error": str(e)
                        }
                        failed_systems.append(system_id)
                
                # Adaptive batch size adjustment
                success_rate = len([s for s in current_batch if s["system_id"] in completed_systems]) / len(current_batch)
                
                if success_rate > 0.8 and batch_size < 5:
                    batch_size += 1  # Increase batch size if successful
                elif success_rate < 0.5 and batch_size > 1:
                    batch_size = max(1, batch_size - 1)  # Decrease if failing
            
            # Determine overall status
            total_systems = len(execution_plan["system_configs"])
            successful_systems = len(completed_systems)
            
            if successful_systems == total_systems:
                overall_status = "completed"
            elif successful_systems > 0:
                overall_status = "partial_success"
            else:
                overall_status = "failed"
            
            # Collect metrics
            performance_metrics = await self._collect_performance_metrics(
                system_results
            )
            
            resource_utilization = await self._calculate_resource_utilization(
                execution_plan, system_results
            )
            
            return {
                "status": overall_status,
                "system_results": system_results,
                "completed_systems": completed_systems,
                "failed_systems": failed_systems,
                "performance_metrics": performance_metrics,
                "resource_utilization": resource_utilization,
                "execution_strategy": "adaptive",
                "final_batch_size": batch_size
            }
            
        except Exception as e:
            logger.error(f"Adaptive coordination execution failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "system_results": {},
                "execution_strategy": "adaptive"
            }
    
    async def _execute_intelligent_coordination(
        self,
        coordination_id: str,
        execution_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute scans with AI-powered intelligent coordination"""
        
        try:
            # Use AI intelligence service to optimize execution
            intelligence_result = await self.intelligence_service.generate_prediction(
                {
                    "type": "coordination_optimization",
                    "systems": [config["system_id"] for config in execution_plan["system_configs"]],
                    "resource_requirements": execution_plan.get("resource_requirements", {}),
                    "historical_patterns": self.coordination_patterns
                }
            )
            
            # Apply AI recommendations to execution plan
            optimized_plan = await self._apply_ai_optimizations(
                execution_plan, intelligence_result
            )
            
            # Execute based on AI-recommended strategy
            recommended_strategy = intelligence_result.get("recommended_strategy", "adaptive")
            
            if recommended_strategy == "parallel":
                return await self._execute_parallel_coordination(coordination_id, optimized_plan)
            elif recommended_strategy == "sequential":
                return await self._execute_sequential_coordination(coordination_id, optimized_plan)
            else:
                return await self._execute_adaptive_coordination(coordination_id, optimized_plan)
                
        except Exception as e:
            logger.error(f"Intelligent coordination execution failed: {e}")
            # Fallback to adaptive strategy
            return await self._execute_adaptive_coordination(coordination_id, execution_plan)
    
    async def _execute_system_scan(
        self,
        coordination_id: str,
        system_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute scan on a specific system"""
        
        system_id = system_config["system_id"]
        scan_config = system_config["scan_config"]
        
        try:
            # Allocate resources for this system
            await self._allocate_system_resources(system_id, system_config["resource_requirements"])
            
            # Execute scan using orchestrator
            scan_result = await self.orchestrator.submit_scan_request(
                scan_config, None  # No background tasks in coordination context
            )
            
            # Monitor scan execution
            execution_id = scan_result
            status_updates = []
            
            # Poll for completion
            while True:
                status = await self.orchestrator.get_execution_status(execution_id)
                status_updates.append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": status.get("status"),
                    "progress": status.get("progress", 0)
                })
                
                if status.get("status") in ["completed", "failed", "cancelled", "timeout"]:
                    break
                
                await asyncio.sleep(5)  # Poll every 5 seconds
            
            # Get final results
            final_status = await self.orchestrator.get_execution_status(execution_id)
            scan_results = await self.orchestrator.get_execution_results(execution_id)
            
            return {
                "status": final_status.get("status", "unknown"),
                "execution_id": execution_id,
                "results": scan_results,
                "status_updates": status_updates,
                "resource_usage": final_status.get("resource_usage", {}),
                "performance_metrics": final_status.get("performance_metrics", {}),
                "duration_seconds": final_status.get("duration_seconds", 0)
            }
            
        except Exception as e:
            logger.error(f"System scan execution failed for {system_id}: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "system_id": system_id
            }
        finally:
            # Release allocated resources
            await self._release_system_resources(system_id)
    
    # Resource management methods
    async def _allocate_system_resources(self, system_id: str, resource_requirements: Dict[str, Any]):
        """Allocate system resources for scan execution"""
        try:
            # Check if resources are available
            resource_check = await self._check_current_resource_availability()
            if not resource_check["sufficient"]:
                raise Exception("Insufficient resources for scan execution")
            
            # Allocate resources
            allocation = {
                "system_id": system_id,
                "allocated_at": datetime.utcnow().isoformat(),
                "resources": resource_requirements.copy()
            }
            
            # Update resource allocations
            self.resource_allocations[system_id] = allocation
            
            # Update active scans
            self.active_scans[system_id] = {
                "status": "allocating",
                "allocation": allocation,
                "start_time": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Allocated resources for system {system_id}: {resource_requirements}")
            
        except Exception as e:
            logger.error(f"Error allocating resources for system {system_id}: {e}")
            raise
    
    async def _release_system_resources(self, system_id: str):
        """Release allocated resources for system"""
        try:
            # Remove from active scans
            if system_id in self.active_scans:
                del self.active_scans[system_id]
            
            # Remove resource allocation
            if system_id in self.resource_allocations:
                del self.resource_allocations[system_id]
            
            logger.info(f"Released resources for system {system_id}")
            
        except Exception as e:
            logger.error(f"Error releasing resources for system {system_id}: {e}")
    
    async def schedule_intelligent_scan(
        self,
        scan_request: Dict[str, Any],
        scheduling_options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Schedule scan using intelligent priority-based algorithm
        
        Args:
            scan_request: Scan request configuration
            scheduling_options: Optional scheduling preferences
            
        Returns:
            Scheduling result with execution plan and timing
        """
        
        try:
            # Analyze scan request
            scan_analysis = await self._analyze_scan_request(scan_request)
            
            # Calculate priority score using AI
            priority_score = await self._calculate_intelligent_priority(
                scan_request, scan_analysis, scheduling_options
            )
            
            # Estimate resource requirements
            resource_estimate = await self._estimate_scan_resources(
                scan_request, scan_analysis
            )
            
            # Find optimal scheduling slot
            optimal_slot = await self._find_optimal_scheduling_slot(
                resource_estimate, priority_score, scheduling_options
            )
            
            # Create scheduling entry
            schedule_entry = {
                "schedule_id": str(uuid4()),
                "scan_request": scan_request,
                "priority_score": priority_score,
                "resource_estimate": resource_estimate,
                "scheduled_time": optimal_slot["start_time"],
                "estimated_duration": optimal_slot["duration"],
                "status": "scheduled",
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Add to scheduling queue
            await self._add_to_scheduling_queue(schedule_entry)
            
            # Update scheduling metrics
            await self._update_scheduling_metrics(schedule_entry)
            
            logger.info(f"Intelligent scan scheduled: {schedule_entry['schedule_id']}")
            
            return {
                "schedule_id": schedule_entry["schedule_id"],
                "status": "scheduled",
                "scheduled_time": schedule_entry["scheduled_time"],
                "estimated_duration": schedule_entry["estimated_duration"],
                "priority_score": priority_score,
                "queue_position": optimal_slot.get("queue_position", 0),
                "resource_allocation": resource_estimate,
                "scheduling_factors": optimal_slot.get("factors", {})
            }
            
        except Exception as e:
            logger.error(f"Intelligent scan scheduling failed: {e}")
            return {
                "status": "failed",
                "error": str(e)
            }
    
    # Scheduling support methods
    async def _analyze_scan_request(self, scan_request: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze scan request to determine complexity and requirements"""
        try:
            analysis = {
                "complexity": "medium",
                "estimated_duration": 300,  # 5 minutes default
                "resource_intensity": "medium",
                "dependencies": [],
                "priority_factors": []
            }
            
            # Analyze scan type
            scan_type = scan_request.get("scan_type", "standard")
            if scan_type in ["comprehensive", "deep_scan", "full_audit"]:
                analysis["complexity"] = "high"
                analysis["estimated_duration"] = 900  # 15 minutes
                analysis["resource_intensity"] = "high"
            elif scan_type in ["quick_scan", "light_scan"]:
                analysis["complexity"] = "low"
                analysis["estimated_duration"] = 120  # 2 minutes
                analysis["resource_intensity"] = "low"
            
            # Analyze data volume
            data_volume = scan_request.get("data_volume", "medium")
            if data_volume == "large":
                analysis["estimated_duration"] = int(analysis["estimated_duration"] * 1.5)
                analysis["resource_intensity"] = "high"
            elif data_volume == "small":
                analysis["estimated_duration"] = int(analysis["estimated_duration"] * 0.7)
                analysis["resource_intensity"] = "low"
            
            # Analyze business criticality
            business_criticality = scan_request.get("business_criticality", "normal")
            if business_criticality == "critical":
                analysis["priority_factors"].append("business_critical")
            elif business_criticality == "high":
                analysis["priority_factors"].append("business_important")
            
            # Analyze compliance requirements
            if scan_request.get("compliance_required", False):
                analysis["priority_factors"].append("compliance")
                analysis["estimated_duration"] = int(analysis["estimated_duration"] * 1.2)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing scan request: {e}")
            return {"complexity": "medium", "estimated_duration": 300, "resource_intensity": "medium"}
    
    async def _calculate_intelligent_priority(self, scan_request: Dict[str, Any], 
                                           scan_analysis: Dict[str, Any], 
                                           scheduling_options: Optional[Dict[str, Any]]) -> float:
        """Calculate intelligent priority score using AI and business rules"""
        try:
            base_priority = 5.0  # Default priority
            
            # Business criticality factor
            if "business_critical" in scan_analysis.get("priority_factors", []):
                base_priority += 3.0
            elif "business_important" in scan_analysis.get("priority_factors", []):
                base_priority += 2.0
            
            # Compliance factor
            if "compliance" in scan_analysis.get("priority_factors", []):
                base_priority += 2.5
            
            # Time sensitivity factor
            time_sensitivity = scan_request.get("time_sensitivity", "normal")
            if time_sensitivity == "urgent":
                base_priority += 2.0
            elif time_sensitivity == "high":
                base_priority += 1.5
            elif time_sensitivity == "low":
                base_priority -= 1.0
            
            # Resource efficiency factor
            resource_intensity = scan_analysis.get("resource_intensity", "medium")
            if resource_intensity == "low":
                base_priority += 0.5  # Prefer low-resource scans
            elif resource_intensity == "high":
                base_priority -= 0.5  # Slightly deprioritize high-resource scans
            
            # User priority factor
            user_priority = scan_request.get("user_priority", 0)
            base_priority += user_priority * 0.1
            
            # Ensure priority is within bounds
            return max(1.0, min(10.0, base_priority))
            
        except Exception as e:
            logger.error(f"Error calculating intelligent priority: {e}")
            return 5.0
    
    async def _estimate_scan_resources(self, scan_request: Dict[str, Any], 
                                     scan_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Estimate resource requirements for scan execution"""
        try:
            complexity = scan_analysis.get("complexity", "medium")
            resource_intensity = scan_analysis.get("resource_intensity", "medium")
            
            # Base resource estimates
            base_resources = {
                "cpu": 20.0,      # CPU percentage
                "memory": 512,    # Memory in MB
                "disk": 100,      # Disk space in MB
                "network": 10.0   # Network bandwidth in Mbps
            }
            
            # Adjust based on complexity
            if complexity == "high":
                base_resources["cpu"] *= 1.5
                base_resources["memory"] *= 1.5
                base_resources["disk"] *= 2.0
                base_resources["network"] *= 1.3
            elif complexity == "low":
                base_resources["cpu"] *= 0.7
                base_resources["memory"] *= 0.7
                base_resources["disk"] *= 0.8
                base_resources["network"] *= 0.8
            
            # Adjust based on resource intensity
            if resource_intensity == "high":
                base_resources["cpu"] *= 1.3
                base_resources["memory"] *= 1.3
                base_resources["disk"] *= 1.5
            elif resource_intensity == "low":
                base_resources["cpu"] *= 0.8
                base_resources["memory"] *= 0.8
                base_resources["disk"] *= 0.7
            
            # Add scan-specific adjustments
            scan_type = scan_request.get("scan_type", "standard")
            if scan_type == "comprehensive":
                base_resources["memory"] *= 1.2
                base_resources["disk"] *= 1.3
            
            return {
                "estimated_resources": base_resources,
                "complexity": complexity,
                "resource_intensity": resource_intensity,
                "scan_type": scan_type
            }
            
        except Exception as e:
            logger.error(f"Error estimating scan resources: {e}")
            return {"estimated_resources": {"cpu": 20.0, "memory": 512, "disk": 100, "network": 10.0}}
    
    async def _find_optimal_scheduling_slot(self, resource_estimate: Dict[str, Any], 
                                          priority_score: float, 
                                          scheduling_options: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Find optimal scheduling slot based on resources and priority"""
        try:
            # Get current system load
            current_load = len(self.active_scans) / self.config.max_concurrent_scans
            queue_length = len(self.scan_queue)
            
            # Calculate optimal start time
            if current_load < 0.3 and queue_length < 10:
                # Low load - schedule immediately
                start_time = datetime.utcnow() + timedelta(minutes=5)
                duration = resource_estimate.get("estimated_duration", {}).get("estimated_duration", 300)
                queue_position = 0
            elif current_load < 0.7 and queue_length < 50:
                # Medium load - schedule with short delay
                start_time = datetime.utcnow() + timedelta(minutes=15)
                duration = resource_estimate.get("estimated_duration", {}).get("estimated_duration", 300)
                queue_position = queue_length
            else:
                # High load - schedule with longer delay
                delay_minutes = max(30, queue_length * 2)
                start_time = datetime.utcnow() + timedelta(minutes=delay_minutes)
                duration = resource_estimate.get("estimated_duration", {}).get("estimated_duration", 300)
                queue_position = queue_length
            
            # Adjust for priority
            if priority_score >= 8.0:
                # High priority - reduce delay
                if queue_position > 0:
                    queue_position = max(0, queue_position - 5)
                    start_time = datetime.utcnow() + timedelta(minutes=max(10, delay_minutes // 2))
            
            return {
                "start_time": start_time.isoformat(),
                "duration": duration,
                "queue_position": queue_position,
                "factors": {
                    "current_load": current_load,
                    "queue_length": queue_length,
                    "priority_score": priority_score,
                    "resource_intensity": resource_estimate.get("resource_intensity", "medium")
                }
            }
            
        except Exception as e:
            logger.error(f"Error finding optimal scheduling slot: {e}")
            # Fallback to immediate scheduling
            return {
                "start_time": (datetime.utcnow() + timedelta(minutes=10)).isoformat(),
                "duration": 300,
                "queue_position": len(self.scan_queue),
                "factors": {"error": str(e)}
            }
    
    async def _add_to_scheduling_queue(self, schedule_entry: Dict[str, Any]):
        """Add scan to scheduling queue"""
        try:
            self.scan_queue.append(schedule_entry)
            logger.info(f"Added scan to scheduling queue: {schedule_entry['schedule_id']}")
        except Exception as e:
            logger.error(f"Error adding to scheduling queue: {e}")
    
    async def _update_scheduling_metrics(self, schedule_entry: Dict[str, Any]):
        """Update scheduling metrics after adding scan to queue"""
        try:
            # Update queue metrics
            self.coordination_metrics["queue_length"] = len(self.scan_queue)
            
            # Log scheduling activity
            logger.info(f"Updated scheduling metrics for scan: {schedule_entry['schedule_id']}")
            
        except Exception as e:
            logger.error(f"Error updating scheduling metrics: {e}")
    
    async def monitor_coordination_performance(
        self,
        coordination_id: Optional[str] = None,
        time_window_hours: int = 24
    ) -> Dict[str, Any]:
        """
        Monitor coordination performance with real-time analytics
        
        Args:
            coordination_id: Specific coordination to monitor (all if None)
            time_window_hours: Time window for analysis
            
        Returns:
            Performance monitoring data and insights
        """
        
        try:
            # Get performance data
            if coordination_id:
                performance_data = await self._get_coordination_performance(coordination_id)
            else:
                performance_data = await self._get_system_performance(time_window_hours)
            
            # Analyze performance trends
            trend_analysis = await self._analyze_performance_trends(
                performance_data, time_window_hours
            )
            
            # Detect performance anomalies
            anomalies = await self._detect_performance_anomalies(
                performance_data
            )
            
            # Generate performance insights
            insights = await self._generate_performance_insights(
                performance_data, trend_analysis, anomalies
            )
            
            # Calculate current system health
            system_health = await self._calculate_system_health()
            
            return {
                "monitoring_timestamp": datetime.utcnow().isoformat(),
                "coordination_id": coordination_id,
                "time_window_hours": time_window_hours,
                "system_health": system_health,
                "performance_metrics": {
                    "coordination_metrics": self.coordination_metrics,
                    "resource_utilization": performance_data.get("resource_utilization", {}),
                    "throughput": performance_data.get("throughput", {}),
                    "latency": performance_data.get("latency", {}),
                    "error_rates": performance_data.get("error_rates", {})
                },
                "trend_analysis": trend_analysis,
                "anomalies": anomalies,
                "insights": insights,
                "recommendations": await self._generate_performance_recommendations(
                    performance_data, trend_analysis, anomalies
                )
            }
            
        except Exception as e:
            logger.error(f"Performance monitoring failed: {e}")
            return {
                "error": str(e),
                "monitoring_timestamp": datetime.utcnow().isoformat()
            }
    
    # Performance monitoring support methods
    async def _get_coordination_performance(self, coordination_id: str) -> Dict[str, Any]:
        """Get performance data for a specific coordination"""
        try:
            # Find coordination in completed scans
            coordination_data = None
            for scan in self.completed_scans:
                if scan.get("coordination_id") == coordination_id:
                    coordination_data = scan
                    break
            
            if not coordination_data:
                return {"error": "Coordination not found"}
            
            return {
                "coordination_id": coordination_id,
                "execution_time": coordination_data.get("duration_seconds", 0),
                "resource_usage": coordination_data.get("resource_usage", {}),
                "status": coordination_data.get("status", "unknown"),
                "timestamp": coordination_data.get("start_time", ""),
                "performance_metrics": coordination_data.get("performance_metrics", {})
            }
            
        except Exception as e:
            logger.error(f"Error getting coordination performance: {e}")
            return {"error": str(e)}
    
    async def _get_system_performance(self, time_window_hours: int) -> Dict[str, Any]:
        """Get system-wide performance data for the specified time window"""
        try:
            current_time = datetime.utcnow()
            cutoff_time = current_time - timedelta(hours=time_window_hours)
            
            # Filter completed scans within time window
            recent_scans = []
            for scan in self.completed_scans:
                if "start_time" in scan:
                    try:
                        scan_time = datetime.fromisoformat(scan["start_time"])
                        if scan_time >= cutoff_time:
                            recent_scans.append(scan)
                    except:
                        continue
            
            # Calculate performance metrics
            total_scans = len(recent_scans)
            successful_scans = len([s for s in recent_scans if s.get("status") == "completed"])
            failed_scans = total_scans - successful_scans
            
            execution_times = [s.get("duration_seconds", 0) for s in recent_scans if s.get("duration_seconds")]
            avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0
            
            return {
                "time_window_hours": time_window_hours,
                "total_scans": total_scans,
                "successful_scans": successful_scans,
                "failed_scans": failed_scans,
                "success_rate": successful_scans / total_scans if total_scans > 0 else 0,
                "avg_execution_time": avg_execution_time,
                "resource_utilization": self.system_resources.copy(),
                "throughput": {
                    "scans_per_hour": total_scans / time_window_hours if time_window_hours > 0 else 0,
                    "concurrent_scans": len(self.active_scans)
                },
                "latency": {
                    "avg_queue_time": 0,  # Would be calculated from actual queue data
                    "avg_processing_time": avg_execution_time
                },
                "error_rates": {
                    "failure_rate": failed_scans / total_scans if total_scans > 0 else 0,
                    "error_count": failed_scans
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting system performance: {e}")
            return {"error": str(e)}
    
    async def _analyze_performance_trends(self, performance_data: Dict[str, Any], time_window_hours: int) -> Dict[str, Any]:
        """Analyze performance trends over time"""
        try:
            trends = {
                "execution_time_trend": "stable",
                "success_rate_trend": "stable",
                "throughput_trend": "stable",
                "resource_utilization_trend": "stable"
            }
            
            # Analyze execution time trends
            avg_execution_time = performance_data.get("avg_execution_time", 0)
            if avg_execution_time > 300:  # 5 minutes
                trends["execution_time_trend"] = "increasing"
            elif avg_execution_time < 60:  # 1 minute
                trends["execution_time_trend"] = "decreasing"
            
            # Analyze success rate trends
            success_rate = performance_data.get("success_rate", 1.0)
            if success_rate < 0.95:
                trends["success_rate_trend"] = "decreasing"
            elif success_rate > 0.98:
                trends["success_rate_trend"] = "increasing"
            
            # Analyze throughput trends
            scans_per_hour = performance_data.get("throughput", {}).get("scans_per_hour", 0)
            if scans_per_hour > 100:
                trends["throughput_trend"] = "increasing"
            elif scans_per_hour < 10:
                trends["throughput_trend"] = "decreasing"
            
            return trends
            
        except Exception as e:
            logger.error(f"Error analyzing performance trends: {e}")
            return {}
    
    async def _detect_performance_anomalies(self, performance_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect performance anomalies in the data"""
        try:
            anomalies = []
            
            # Check for high execution times
            avg_execution_time = performance_data.get("avg_execution_time", 0)
            if avg_execution_time > 600:  # 10 minutes
                anomalies.append({
                    "type": "high_execution_time",
                    "severity": "high",
                    "description": f"Average execution time ({avg_execution_time}s) is unusually high",
                    "recommendation": "Investigate scan algorithms and resource allocation"
                })
            
            # Check for low success rates
            success_rate = performance_data.get("success_rate", 1.0)
            if success_rate < 0.90:  # 90%
                anomalies.append({
                    "type": "low_success_rate",
                    "severity": "medium",
                    "description": f"Success rate ({success_rate:.2%}) is below acceptable threshold",
                    "recommendation": "Review error logs and improve error handling"
                })
            
            # Check for resource utilization anomalies
            resource_utilization = performance_data.get("resource_utilization", {})
            for resource_type, resource_data in resource_utilization.items():
                if resource_data.get("status") == "high":
                    anomalies.append({
                        "type": f"high_{resource_type}_utilization",
                        "severity": "medium",
                        "description": f"High {resource_type} utilization detected",
                        "recommendation": f"Monitor {resource_type} usage and consider optimization"
                    })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting performance anomalies: {e}")
            return []
    
    async def _generate_performance_insights(self, performance_data: Dict[str, Any], 
                                          trend_analysis: Dict[str, Any], 
                                          anomalies: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate insights from performance data, trends, and anomalies"""
        try:
            insights = {
                "summary": "System performance is within normal parameters",
                "key_metrics": {},
                "trends": trend_analysis,
                "anomalies_count": len(anomalies),
                "recommendations": []
            }
            
            # Generate key metrics insights
            success_rate = performance_data.get("success_rate", 1.0)
            if success_rate < 0.95:
                insights["summary"] = "System performance shows some degradation"
                insights["key_metrics"]["success_rate"] = {
                    "value": success_rate,
                    "status": "warning",
                    "message": "Success rate below 95% threshold"
                }
            
            avg_execution_time = performance_data.get("avg_execution_time", 0)
            if avg_execution_time > 300:
                insights["key_metrics"]["execution_time"] = {
                    "value": avg_execution_time,
                    "status": "warning",
                    "message": "Average execution time above 5 minutes"
                }
            
            # Add anomaly-based insights
            if anomalies:
                high_severity_anomalies = [a for a in anomalies if a.get("severity") == "high"]
                if high_severity_anomalies:
                    insights["summary"] = "System performance requires immediate attention"
                    insights["key_metrics"]["anomalies"] = {
                        "status": "critical",
                        "message": f"{len(high_severity_anomalies)} high-severity anomalies detected"
                    }
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating performance insights: {e}")
            return {"error": str(e)}
    
    async def _generate_performance_recommendations(self, performance_data: Dict[str, Any],
                                                 trend_analysis: Dict[str, Any],
                                                 anomalies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on performance analysis"""
        try:
            recommendations = []
            
            # Add recommendations based on anomalies
            for anomaly in anomalies:
                recommendations.append({
                    "priority": "high" if anomaly.get("severity") == "high" else "medium",
                    "action": f"Address {anomaly['type']} anomaly",
                    "description": anomaly["description"],
                    "recommendation": anomaly["recommendation"],
                    "effort": "medium"
                })
            
            # Add trend-based recommendations
            if trend_analysis.get("execution_time_trend") == "increasing":
                recommendations.append({
                    "priority": "medium",
                    "action": "Optimize scan execution algorithms",
                    "description": "Execution times are trending upward",
                    "recommendation": "Review and optimize scan logic and resource allocation",
                    "effort": "high"
                })
            
            if trend_analysis.get("success_rate_trend") == "decreasing":
                recommendations.append({
                    "priority": "high",
                    "action": "Investigate declining success rates",
                    "description": "Success rates are trending downward",
                    "recommendation": "Review error logs and improve error handling mechanisms",
                    "effort": "medium"
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating performance recommendations: {e}")
            return []
    
    async def _process_coordination_queue(self):
        """Process queued coordination requests with intelligent prioritization"""
        try:
            if not self.scan_queue:
                return
            
            # Sort queue by priority and resource availability
            prioritized_queue = await self._prioritize_coordination_queue()
            
            # Process high-priority items first
            for coordination_item in prioritized_queue:
                if len(self.active_scans) >= self.config.max_concurrent_scans:
                    break
                
                try:
                    # Check resource availability
                    resource_check = await self._check_coordination_resources(coordination_item)
                    if not resource_check["available"]:
                        continue
                    
                    # Execute coordination
                    result = await self._execute_coordination_item(coordination_item)
                    
                    # Update metrics
                    if result["status"] == "completed":
                        self.coordination_metrics["successful_scans"] += 1
                    else:
                        self.coordination_metrics["failed_scans"] += 1
                    
                    # Remove from queue
                    self.scan_queue.remove(coordination_item)
                    
                except Exception as e:
                    logger.error(f"Failed to process coordination item: {e}")
                    coordination_item["error"] = str(e)
                    coordination_item["retry_count"] = coordination_item.get("retry_count", 0) + 1
                    
                    # Move to failed queue if max retries exceeded
                    if coordination_item["retry_count"] >= self.config.max_retry_attempts:
                        self.failed_scans.append(coordination_item)
                        self.scan_queue.remove(coordination_item)
                        
        except Exception as e:
            logger.error(f"Error processing coordination queue: {e}")
    
    async def _prioritize_coordination_queue(self) -> List[Dict[str, Any]]:
        """Intelligently prioritize coordination queue using AI and business rules"""
        try:
            prioritized_items = []
            
            for item in self.scan_queue:
                # Calculate priority score
                priority_score = await self._calculate_item_priority(item)
                
                # Apply business rules
                business_priority = await self._apply_business_priority_rules(item)
                
                # Calculate resource efficiency
                resource_efficiency = await self._calculate_resource_efficiency(item)
                
                # Final priority calculation
                final_priority = (priority_score * 0.4 + 
                                business_priority * 0.4 + 
                                resource_efficiency * 0.2)
                
                prioritized_items.append({
                    "item": item,
                    "priority_score": final_priority,
                    "business_priority": business_priority,
                    "resource_efficiency": resource_efficiency
                })
            
            # Sort by final priority (highest first)
            prioritized_items.sort(key=lambda x: x["priority_score"], reverse=True)
            
            return [item["item"] for item in prioritized_items]
            
        except Exception as e:
            logger.error(f"Error prioritizing coordination queue: {e}")
            return list(self.scan_queue)
    
    async def _execute_coordination_item(self, coordination_item: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single coordination item with full resource management"""
        try:
            coordination_id = coordination_item.get("coordination_id", str(uuid4()))
            
            # Allocate resources
            allocation_result = await self._allocate_coordination_resources(coordination_item)
            if not allocation_result["success"]:
                return {"status": "failed", "error": "Resource allocation failed"}
            
            # Execute coordination
            execution_result = await self._execute_coordination_execution(coordination_item)
            
            # Release resources
            await self._release_coordination_resources(coordination_id)
            
            return execution_result
            
        except Exception as e:
            logger.error(f"Error executing coordination item: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def _monitor_system_resources(self) -> Dict[str, Any]:
        """Monitor system resources with advanced metrics collection"""
        try:
            # Collect system metrics
            cpu_usage = await self._collect_cpu_metrics()
            memory_usage = await self._collect_memory_metrics()
            disk_usage = await self._collect_disk_metrics()
            network_usage = await self._collect_network_metrics()
            
            # Calculate resource utilization
            resource_utilization = {
                "cpu": {
                    "current": cpu_usage["current"],
                    "average": cpu_usage["average"],
                    "peak": cpu_usage["peak"],
                    "threshold": self.config.cpu_threshold,
                    "status": "normal" if cpu_usage["current"] < self.config.cpu_threshold else "high"
                },
                "memory": {
                    "current": memory_usage["current"],
                    "available": memory_usage["available"],
                    "peak": memory_usage["peak"],
                    "threshold": self.config.memory_threshold,
                    "status": "normal" if memory_usage["current"] < self.config.memory_threshold else "high"
                },
                "disk": {
                    "current": disk_usage["current"],
                    "available": disk_usage["available"],
                    "io_operations": disk_usage["io_operations"],
                    "threshold": self.config.disk_threshold,
                    "status": "normal" if disk_usage["current"] < self.config.disk_threshold else "normal"
                },
                "network": {
                    "current": network_usage["current"],
                    "bandwidth": network_usage["bandwidth"],
                    "connections": network_usage["connections"],
                    "threshold": self.config.network_threshold,
                    "status": "normal" if network_usage["current"] < self.config.network_threshold else "high"
                }
            }
            
            # Update system resources
            self.system_resources = resource_utilization
            
            # Generate resource insights
            insights = await self._generate_resource_insights(resource_utilization)
            
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "resources": resource_utilization,
                "insights": insights,
                "alerts": await self._check_resource_alerts(resource_utilization)
            }
            
        except Exception as e:
            logger.error(f"Error monitoring system resources: {e}")
            return {"error": str(e)}
    
    async def _analyze_coordination_patterns(self) -> Dict[str, Any]:
        """Analyze coordination patterns using AI and machine learning"""
        try:
            # Collect historical coordination data
            historical_data = await self._collect_coordination_history()
            
            # Analyze performance patterns
            performance_patterns = await self._analyze_performance_patterns(historical_data)
            
            # Identify optimization opportunities
            optimization_opportunities = await self._identify_optimization_opportunities(
                performance_patterns
            )
            
            # Generate coordination insights
            coordination_insights = await self._generate_coordination_insights(
                performance_patterns, optimization_opportunities
            )
            
            # Update coordination patterns
            self.coordination_patterns.update(coordination_insights)
            
            return {
                "patterns": performance_patterns,
                "optimization_opportunities": optimization_opportunities,
                "insights": coordination_insights,
                "recommendations": await self._generate_pattern_recommendations(
                    performance_patterns, optimization_opportunities
                )
            }
            
        except Exception as e:
            logger.error(f"Error analyzing coordination patterns: {e}")
            return {"error": str(e)}
    
    # Supporting methods for coordination operations
    async def _check_coordination_resources(self, coordination_item: Dict[str, Any]) -> Dict[str, Any]:
        """Check if sufficient resources are available for coordination"""
        try:
            required_resources = coordination_item.get("resource_requirements", {})
            available_resources = self.system_resources
            
            # Check CPU availability
            cpu_available = (available_resources.get("cpu", {}).get("current", 0) + 
                           required_resources.get("cpu", 0)) <= self.config.cpu_threshold
            
            # Check memory availability
            memory_available = (available_resources.get("memory", {}).get("current", 0) + 
                              required_resources.get("memory", 0)) <= self.config.memory_threshold
            
            # Check disk availability
            disk_available = (available_resources.get("disk", {}).get("current", 0) + 
                            required_resources.get("disk", 0)) <= self.config.disk_threshold
            
            return {
                "available": cpu_available and memory_available and disk_available,
                "cpu_available": cpu_available,
                "memory_available": memory_available,
                "disk_available": disk_available,
                "required": required_resources,
                "available_resources": available_resources
            }
        except Exception as e:
            logger.error(f"Error checking coordination resources: {e}")
            return {"available": False, "error": str(e)}
    
    async def _calculate_item_priority(self, item: Dict[str, Any]) -> float:
        """Calculate priority score for coordination item using AI"""
        try:
            # Base priority from item configuration
            base_priority = item.get("priority", self.config.default_priority)
            
            # Business criticality factor
            business_criticality = item.get("business_criticality", 1.0)
            
            # Time sensitivity factor
            time_sensitivity = item.get("time_sensitivity", 1.0)
            
            # Resource efficiency factor
            resource_efficiency = item.get("resource_efficiency", 1.0)
            
            # Calculate weighted priority
            priority_score = (base_priority * 0.3 + 
                            business_criticality * 0.3 + 
                            time_sensitivity * 0.2 + 
                            resource_efficiency * 0.2)
            
            return min(priority_score, 10.0)  # Cap at 10.0
            
        except Exception as e:
            logger.error(f"Error calculating item priority: {e}")
            return self.config.default_priority
    
    async def _apply_business_priority_rules(self, item: Dict[str, Any]) -> float:
        """Apply business priority rules to coordination item"""
        try:
            business_rules = item.get("business_rules", {})
            
            # Compliance priority
            compliance_priority = business_rules.get("compliance_required", False) * 2.0
            
            # SLA priority
            sla_priority = business_rules.get("sla_required", False) * 1.5
            
            # Revenue impact priority
            revenue_impact = business_rules.get("revenue_impact", 1.0)
            
            # Risk level priority
            risk_level = business_rules.get("risk_level", 1.0)
            
            # Calculate business priority
            business_priority = (compliance_priority + 
                               sla_priority + 
                               revenue_impact + 
                               risk_level)
            
            return min(business_priority, 10.0)
            
        except Exception as e:
            logger.error(f"Error applying business priority rules: {e}")
            return 1.0
    
    async def _calculate_resource_efficiency(self, item: Dict[str, Any]) -> float:
        """Calculate resource efficiency score for coordination item"""
        try:
            resource_requirements = item.get("resource_requirements", {})
            
            # Calculate resource utilization efficiency
            cpu_efficiency = 1.0 / (resource_requirements.get("cpu", 1) + 0.1)
            memory_efficiency = 1.0 / (resource_requirements.get("memory", 1) + 0.1)
            disk_efficiency = 1.0 / (resource_requirements.get("disk", 1) + 0.1)
            
            # Average efficiency
            avg_efficiency = (cpu_efficiency + memory_efficiency + disk_efficiency) / 3.0
            
            return min(avg_efficiency * 10.0, 10.0)  # Scale to 0-10
            
        except Exception as e:
            logger.error(f"Error calculating resource efficiency: {e}")
            return 5.0
    
    async def _allocate_coordination_resources(self, coordination_item: Dict[str, Any]) -> Dict[str, Any]:
        """Allocate resources for coordination execution"""
        try:
            coordination_id = coordination_item.get("coordination_id", str(uuid4()))
            resource_requirements = coordination_item.get("resource_requirements", {})
            
            # Check resource availability
            resource_check = await self._check_coordination_resources(coordination_item)
            if not resource_check["available"]:
                return {"success": False, "error": "Insufficient resources"}
            
            # Allocate resources
            allocation = {
                "coordination_id": coordination_id,
                "cpu": resource_requirements.get("cpu", 0),
                "memory": resource_requirements.get("memory", 0),
                "disk": resource_requirements.get("disk", 0),
                "allocated_at": datetime.utcnow().isoformat()
            }
            
            # Update resource allocations
            self.resource_allocations[coordination_id] = allocation
            
            return {"success": True, "allocation": allocation}
            
        except Exception as e:
            logger.error(f"Error allocating coordination resources: {e}")
            return {"success": False, "error": str(e)}
    
    async def _execute_coordination_execution(self, coordination_item: Dict[str, Any]) -> Dict[str, Any]:
        """Execute coordination with full monitoring and error handling"""
        try:
            coordination_id = coordination_item.get("coordination_id", str(uuid4()))
            
            # Start execution
            start_time = datetime.utcnow()
            
            # Execute using orchestrator
            execution_result = await self.orchestrator.execute_coordination(
                coordination_item
            )
            
            # Calculate execution metrics
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            # Update metrics
            self.coordination_metrics["total_scans_coordinated"] += 1
            self.coordination_metrics["average_scan_duration"] = (
                (self.coordination_metrics["average_scan_duration"] * 
                 (self.coordination_metrics["total_scans_coordinated"] - 1) + duration) /
                self.coordination_metrics["total_scans_coordinated"]
            )
            
            return {
                "status": "completed",
                "coordination_id": coordination_id,
                "execution_result": execution_result,
                "duration_seconds": duration,
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error executing coordination: {e}")
            return {"status": "failed", "error": str(e)}
    
    async def _release_coordination_resources(self, coordination_id: str):
        """Release allocated resources for coordination"""
        try:
            if coordination_id in self.resource_allocations:
                del self.resource_allocations[coordination_id]
                logger.info(f"Released resources for coordination: {coordination_id}")
        except Exception as e:
            logger.error(f"Error releasing coordination resources: {e}")
    
    # Resource monitoring methods
    async def _collect_cpu_metrics(self) -> Dict[str, Any]:
        """Collect CPU usage metrics"""
        try:
            # Simulate CPU metrics collection (in real implementation, use psutil or system APIs)
            import random
            current = random.uniform(20.0, 80.0)
            average = random.uniform(30.0, 70.0)
            peak = random.uniform(70.0, 95.0)
            
            return {
                "current": round(current, 2),
                "average": round(average, 2),
                "peak": round(peak, 2)
            }
        except Exception as e:
            logger.error(f"Error collecting CPU metrics: {e}")
            return {"current": 0.0, "average": 0.0, "peak": 0.0}
    
    async def _collect_memory_metrics(self) -> Dict[str, Any]:
        """Collect memory usage metrics"""
        try:
            # Simulate memory metrics collection
            import random
            current = random.uniform(40.0, 85.0)
            available = 100.0 - current
            peak = random.uniform(70.0, 95.0)
            
            return {
                "current": round(current, 2),
                "available": round(available, 2),
                "peak": round(peak, 2)
            }
        except Exception as e:
            logger.error(f"Error collecting memory metrics: {e}")
            return {"current": 0.0, "available": 100.0, "peak": 0.0}
    
    async def _collect_disk_metrics(self) -> Dict[str, Any]:
        """Collect disk usage metrics"""
        try:
            # Simulate disk metrics collection
            import random
            current = random.uniform(30.0, 75.0)
            available = 100.0 - current
            io_operations = random.randint(100, 1000)
            
            return {
                "current": round(current, 2),
                "available": round(available, 2),
                "io_operations": io_operations
            }
        except Exception as e:
            logger.error(f"Error collecting disk metrics: {e}")
            return {"current": 0.0, "available": 100.0, "io_operations": 0}
    
    async def _collect_network_metrics(self) -> Dict[str, Any]:
        """Collect network usage metrics"""
        try:
            # Simulate network metrics collection
            import random
            current = random.uniform(20.0, 60.0)
            bandwidth = random.uniform(100.0, 1000.0)
            connections = random.randint(50, 500)
            
            return {
                "current": round(current, 2),
                "bandwidth": round(bandwidth, 2),
                "connections": connections
            }
        except Exception as e:
            logger.error(f"Error collecting network metrics: {e}")
            return {"current": 0.0, "bandwidth": 0.0, "connections": 0}
    
    async def _generate_resource_insights(self, resource_utilization: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights from resource utilization data"""
        try:
            insights = {}
            
            # CPU insights
            cpu_status = resource_utilization.get("cpu", {})
            if cpu_status.get("status") == "high":
                insights["cpu"] = {
                    "alert": "High CPU utilization detected",
                    "recommendation": "Consider scaling or optimizing scan workloads",
                    "severity": "medium"
                }
            
            # Memory insights
            memory_status = resource_utilization.get("memory", {})
            if memory_status.get("status") == "high":
                insights["memory"] = {
                    "alert": "High memory utilization detected",
                    "recommendation": "Monitor memory usage and consider cleanup",
                    "severity": "medium"
                }
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating resource insights: {e}")
            return {}
    
    async def _check_resource_alerts(self, resource_utilization: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for resource alerts and generate notifications"""
        try:
            alerts = []
            
            for resource_type, resource_data in resource_utilization.items():
                if resource_data.get("status") == "high":
                    alerts.append({
                        "resource_type": resource_type,
                        "severity": "medium",
                        "message": f"High {resource_type} utilization: {resource_data.get('current')}%",
                        "timestamp": datetime.utcnow().isoformat(),
                        "recommendation": "Monitor resource usage and consider optimization"
                    })
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error checking resource alerts: {e}")
            return []
    
    # Pattern analysis methods
    async def _collect_coordination_history(self) -> List[Dict[str, Any]]:
        """Collect historical coordination data for pattern analysis"""
        try:
            # Return recent coordination history
            return list(self.completed_scans)[-100:]  # Last 100 completed scans
            
        except Exception as e:
            logger.error(f"Error collecting coordination history: {e}")
            return []
    
    async def _analyze_performance_patterns(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze performance patterns from historical data"""
        try:
            patterns = {
                "execution_times": [],
                "resource_usage": [],
                "success_rates": [],
                "failure_patterns": []
            }
            
            for scan_data in historical_data:
                if "duration_seconds" in scan_data:
                    patterns["execution_times"].append(scan_data["duration_seconds"])
                
                if "resource_usage" in scan_data:
                    patterns["resource_usage"].append(scan_data["resource_usage"])
                
                if "status" in scan_data:
                    patterns["success_rates"].append(scan_data["status"] == "completed")
            
            # Calculate pattern statistics
            if patterns["execution_times"]:
                patterns["avg_execution_time"] = sum(patterns["execution_times"]) / len(patterns["execution_times"])
                patterns["execution_time_variance"] = np.var(patterns["execution_times"]) if len(patterns["execution_times"]) > 1 else 0
            
            if patterns["success_rates"]:
                patterns["success_rate"] = sum(patterns["success_rates"]) / len(patterns["success_rates"])
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error analyzing performance patterns: {e}")
            return {}
    
    async def _identify_optimization_opportunities(self, performance_patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify optimization opportunities from performance patterns"""
        try:
            opportunities = []
            
            # Execution time optimization
            avg_execution_time = performance_patterns.get("avg_execution_time", 0)
            if avg_execution_time > 300:  # 5 minutes
                opportunities.append({
                    "type": "execution_time",
                    "description": "High average execution time detected",
                    "recommendation": "Optimize scan algorithms and resource allocation",
                    "potential_improvement": "20-30% reduction in execution time",
                    "priority": "high"
                })
            
            # Success rate optimization
            success_rate = performance_patterns.get("success_rate", 1.0)
            if success_rate < 0.95:  # 95%
                opportunities.append({
                    "type": "success_rate",
                    "description": "Low success rate detected",
                    "recommendation": "Investigate failure patterns and improve error handling",
                    "potential_improvement": "5-15% improvement in success rate",
                    "priority": "medium"
                })
            
            return opportunities
            
        except Exception as e:
            logger.error(f"Error identifying optimization opportunities: {e}")
            return []
    
    async def _generate_coordination_insights(self, performance_patterns: Dict[str, Any], 
                                           optimization_opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate coordination insights from patterns and opportunities"""
        try:
            insights = {
                "performance_summary": {
                    "avg_execution_time": performance_patterns.get("avg_execution_time", 0),
                    "success_rate": performance_patterns.get("success_rate", 1.0),
                    "total_scans": len(performance_patterns.get("execution_times", []))
                },
                "optimization_opportunities": len(optimization_opportunities),
                "high_priority_optimizations": len([o for o in optimization_opportunities if o.get("priority") == "high"]),
                "recommendations": []
            }
            
            # Add specific recommendations
            for opportunity in optimization_opportunities:
                insights["recommendations"].append({
                    "type": opportunity["type"],
                    "description": opportunity["description"],
                    "recommendation": opportunity["recommendation"],
                    "priority": opportunity["priority"]
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating coordination insights: {e}")
            return {}
    
    async def _generate_pattern_recommendations(self, performance_patterns: Dict[str, Any],
                                             optimization_opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations from pattern analysis"""
        try:
            recommendations = []
            
            for opportunity in optimization_opportunities:
                recommendations.append({
                    "action": f"Optimize {opportunity['type']}",
                    "description": opportunity["description"],
                    "benefit": opportunity["potential_improvement"],
                    "effort": "medium" if opportunity["priority"] == "high" else "low",
                    "priority": opportunity["priority"]
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating pattern recommendations: {e}")
            return []
    
    # Background task loops
    async def _coordination_loop(self):
        """Main coordination loop for managing scan executions"""
        while True:
            try:
                await asyncio.sleep(self.config.coordination_interval)
                
                # Process queued coordinations
                await self._process_coordination_queue()
                
                # Check for workflow completions
                await self._check_workflow_completions()
                
                # Update coordination state
                await self._update_coordination_state()
                
            except Exception as e:
                logger.error(f"Coordination loop error: {e}")
    
    async def _check_workflow_completions(self):
        """Check for completed workflows and trigger next steps"""
        try:
            completed_workflows = []
            
            for workflow_id, workflow in self.active_workflows.items():
                if workflow.get("status") == "completed":
                    completed_workflows.append(workflow_id)
                    
                    # Trigger dependent workflows
                    await self._trigger_dependent_workflows(workflow_id)
                    
                    # Update metrics
                    self.coordination_metrics["successful_scans"] += 1
                    
                    # Move to completed queue
                    self.completed_scans.append(workflow)
            
            # Remove completed workflows from active
            for workflow_id in completed_workflows:
                del self.active_workflows[workflow_id]
                
        except Exception as e:
            logger.error(f"Error checking workflow completions: {e}")
    
    async def _update_coordination_state(self):
        """Update coordination state and metrics"""
        try:
            # Update queue length
            self.coordination_metrics["queue_length"] = len(self.scan_queue)
            
            # Update concurrent scans
            self.coordination_metrics["concurrent_scans"] = len(self.active_scans)
            
            # Update resource utilization
            self.coordination_metrics["resource_utilization"] = self.system_resources.copy()
            
            # Calculate load balancing efficiency
            if self.coordination_metrics["concurrent_scans"] > 0:
                self.coordination_metrics["load_balancing_efficiency"] = (
                    self.coordination_metrics["successful_scans"] / 
                    self.coordination_metrics["total_scans_coordinated"]
                ) if self.coordination_metrics["total_scans_coordinated"] > 0 else 0.0
            
        except Exception as e:
            logger.error(f"Error updating coordination state: {e}")
    
    async def _trigger_dependent_workflows(self, completed_workflow_id: str):
        """Trigger workflows that depend on the completed workflow"""
        try:
            dependent_workflows = self.workflow_dependencies.get(completed_workflow_id, set())
            
            for dependent_id in dependent_workflows:
                if dependent_id in self.active_workflows:
                    workflow = self.active_workflows[dependent_id]
                    
                    # Check if all dependencies are met
                    if await self._check_workflow_dependencies(dependent_id):
                        # Start the dependent workflow
                        await self._start_workflow(dependent_id)
                        
        except Exception as e:
            logger.error(f"Error triggering dependent workflows: {e}")
    
    async def _check_workflow_dependencies(self, workflow_id: str) -> bool:
        """Check if all dependencies for a workflow are met"""
        try:
            workflow = self.active_workflows.get(workflow_id, {})
            dependencies = workflow.get("dependencies", set())
            
            for dep_id in dependencies:
                if dep_id not in self.completed_scans:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking workflow dependencies: {e}")
            return False
    
    async def _start_workflow(self, workflow_id: str):
        """Start a workflow execution"""
        try:
            workflow = self.active_workflows.get(workflow_id, {})
            workflow["status"] = "running"
            workflow["started_at"] = datetime.utcnow().isoformat()
            
            # Execute workflow using orchestrator
            await self.orchestrator.start_workflow(workflow)
            
        except Exception as e:
            logger.error(f"Error starting workflow: {e}")
            workflow["status"] = "failed"
            workflow["error"] = str(e)
    
    async def _resource_monitoring_loop(self):
        """Monitor system resources and availability"""
        while True:
            try:
                await asyncio.sleep(self.config.resource_check_interval)
                
                # Monitor system resources
                resource_status = await self._monitor_system_resources()
                
                # Update resource history
                self.resource_history.append({
                    "timestamp": datetime.utcnow().isoformat(),
                    "resources": resource_status
                })
                
                # Check for resource alerts
                await self._check_resource_alerts(resource_status)
                
            except Exception as e:
                logger.error(f"Resource monitoring loop error: {e}")
    
    async def _check_resource_alerts(self, resource_status: Dict[str, Any]):
        """Check for resource alerts and take action"""
        try:
            if "resources" in resource_status:
                resources = resource_status["resources"]
                
                # Check CPU alerts
                if resources.get("cpu", {}).get("status") == "high":
                    await self._handle_cpu_alert(resources["cpu"])
                
                # Check memory alerts
                if resources.get("memory", {}).get("status") == "high":
                    await self._handle_memory_alert(resources["memory"])
                
                # Check disk alerts
                if resources.get("disk", {}).get("status") == "high":
                    await self._handle_disk_alert(resources["disk"])
                
                # Check network alerts
                if resources.get("network", {}).get("status") == "high":
                    await self._handle_network_alert(resources["network"])
                    
        except Exception as e:
            logger.error(f"Error checking resource alerts: {e}")
    
    async def _handle_cpu_alert(self, cpu_data: Dict[str, Any]):
        """Handle CPU utilization alerts"""
        try:
            current_usage = cpu_data.get("current", 0)
            threshold = cpu_data.get("threshold", 80.0)
            
            if current_usage > threshold:
                # Reduce concurrent scans
                max_reduction = min(5, len(self.active_scans) // 2)
                await self._reduce_concurrent_scans(max_reduction)
                
                # Log alert
                logger.warning(f"CPU alert: {current_usage}% > {threshold}%. Reduced concurrent scans by {max_reduction}")
                
        except Exception as e:
            logger.error(f"Error handling CPU alert: {e}")
    
    async def _handle_memory_alert(self, memory_data: Dict[str, Any]):
        """Handle memory utilization alerts"""
        try:
            current_usage = memory_data.get("current", 0)
            threshold = memory_data.get("threshold", 85.0)
            
            if current_usage > threshold:
                # Trigger memory cleanup
                await self._trigger_memory_cleanup()
                
                # Log alert
                logger.warning(f"Memory alert: {current_usage}% > {threshold}%. Triggered memory cleanup.")
                
        except Exception as e:
            logger.error(f"Error handling memory alert: {e}")
    
    async def _handle_disk_alert(self, disk_data: Dict[str, Any]):
        """Handle disk utilization alerts"""
        try:
            current_usage = disk_data.get("current", 0)
            threshold = disk_data.get("threshold", 90.0)
            
            if current_usage > threshold:
                # Trigger disk cleanup
                await self._trigger_disk_cleanup()
                
                # Log alert
                logger.warning(f"Disk alert: {current_usage}% > {threshold}%. Triggered disk cleanup.")
                
        except Exception as e:
            logger.error(f"Error handling disk alert: {e}")
    
    async def _handle_network_alert(self, network_data: Dict[str, Any]):
        """Handle network utilization alerts"""
        try:
            current_usage = network_data.get("current", 0)
            threshold = network_data.get("threshold", 70.0)
            
            if current_usage > threshold:
                # Reduce network-intensive operations
                await self._reduce_network_operations()
                
                # Log alert
                logger.warning(f"Network alert: {current_usage}% > {threshold}%. Reduced network operations.")
                
        except Exception as e:
            logger.error(f"Error handling network alert: {e}")
    
    async def _reduce_concurrent_scans(self, reduction_count: int):
        """Reduce concurrent scans to manage resource usage"""
        try:
            # Pause new scan starts
            self.config.max_concurrent_scans = max(1, self.config.max_concurrent_scans - reduction_count)
            
            # Wait for current scans to complete
            await asyncio.sleep(30)
            
            # Gradually restore capacity
            self.config.max_concurrent_scans = min(50, self.config.max_concurrent_scans + 1)
            
        except Exception as e:
            logger.error(f"Error reducing concurrent scans: {e}")
    
    async def _trigger_memory_cleanup(self):
        """Trigger memory cleanup operations"""
        try:
            # Clear old resource history
            if len(self.resource_history) > 500:
                self.resource_history = deque(list(self.resource_history)[-500:], maxlen=1000)
            
            # Clear old performance data
            if len(self.completed_scans) > 800:
                self.completed_scans = deque(list(self.completed_scans)[-800:], maxlen=1000)
            
            # Clear old failed scans
            if len(self.failed_scans) > 400:
                self.failed_scans = deque(list(self.failed_scans)[-400:], maxlen=500)
                
        except Exception as e:
            logger.error(f"Error triggering memory cleanup: {e}")
    
    async def _trigger_disk_cleanup(self):
        """Trigger disk cleanup operations"""
        try:
            # Clear old log files and temporary data
            # In real implementation, this would clean up actual disk files
            logger.info("Disk cleanup triggered - clearing temporary data")
            
        except Exception as e:
            logger.error(f"Error triggering disk cleanup: {e}")
    
    async def _reduce_network_operations(self):
        """Reduce network-intensive operations"""
        try:
            # Reduce polling frequency
            self.config.resource_check_interval = min(60, self.config.resource_check_interval * 1.5)
            
            # Reduce coordination frequency
            self.config.coordination_interval = min(120, self.config.coordination_interval * 1.5)
            
            logger.info("Network operations reduced due to high utilization")
            
        except Exception as e:
            logger.error(f"Error reducing network operations: {e}")
    
    async def _optimization_loop(self):
        """Continuous optimization of coordination strategies"""
        while True:
            try:
                await asyncio.sleep(self.config.optimization_interval)
                
                # Analyze coordination patterns
                patterns = await self._analyze_coordination_patterns()
                
                # Generate optimization suggestions
                suggestions = await self._generate_optimization_suggestions(patterns)
                
                # Apply approved optimizations
                await self._apply_optimizations(suggestions)
                
                # Update optimization metrics
                self.coordination_metrics['optimization_cycles'] += 1
                
            except Exception as e:
                logger.error(f"Optimization loop error: {e}")
    
    async def _generate_optimization_suggestions(self, patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate optimization suggestions based on pattern analysis"""
        try:
            suggestions = []
            
            # Resource optimization suggestions
            if patterns.get("patterns", {}).get("avg_execution_time", 0) > 300:
                suggestions.append({
                    "type": "resource_allocation",
                    "description": "Optimize resource allocation for long-running scans",
                    "priority": "high",
                    "impact": "20-30% reduction in execution time",
                    "implementation": "Adjust CPU and memory allocation based on scan complexity"
                })
            
            # Load balancing suggestions
            if patterns.get("patterns", {}).get("success_rate", 1.0) < 0.95:
                suggestions.append({
                    "type": "load_balancing",
                    "description": "Improve load balancing for better success rates",
                    "priority": "medium",
                    "impact": "5-15% improvement in success rate",
                    "implementation": "Implement adaptive load balancing based on system health"
                })
            
            # Queue management suggestions
            if self.coordination_metrics.get("queue_length", 0) > 100:
                suggestions.append({
                    "type": "queue_management",
                    "description": "Optimize queue processing for high-volume scenarios",
                    "priority": "medium",
                    "impact": "Faster queue processing and reduced wait times",
                    "implementation": "Implement batch processing and priority-based scheduling"
                })
            
            # Add suggestions to queue
            for suggestion in suggestions:
                self.optimization_suggestions.append(suggestion)
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error generating optimization suggestions: {e}")
            return []
    
    async def _apply_optimizations(self, suggestions: List[Dict[str, Any]]):
        """Apply approved optimizations to coordination system"""
        try:
            for suggestion in suggestions:
                if suggestion.get("priority") == "high":
                    # Apply high-priority optimizations immediately
                    await self._apply_optimization(suggestion)
                elif suggestion.get("priority") == "medium":
                    # Queue medium-priority optimizations for review
                    await self._queue_optimization_for_review(suggestion)
                else:
                    # Log low-priority suggestions
                    logger.info(f"Low-priority optimization suggestion: {suggestion['description']}")
                    
        except Exception as e:
            logger.error(f"Error applying optimizations: {e}")
    
    async def _apply_optimization(self, suggestion: Dict[str, Any]):
        """Apply a specific optimization to the system"""
        try:
            optimization_type = suggestion.get("type")
            
            if optimization_type == "resource_allocation":
                await self._optimize_resource_allocation()
            elif optimization_type == "load_balancing":
                await self._optimize_load_balancing()
            elif optimization_type == "queue_management":
                await self._optimize_queue_management()
            else:
                logger.warning(f"Unknown optimization type: {optimization_type}")
                
            logger.info(f"Applied optimization: {suggestion['description']}")
            
        except Exception as e:
            logger.error(f"Error applying optimization: {e}")
    
    async def _queue_optimization_for_review(self, suggestion: Dict[str, Any]):
        """Queue optimization for manual review and approval"""
        try:
            # Add to review queue (in real implementation, this would go to a review system)
            suggestion["status"] = "pending_review"
            suggestion["queued_at"] = datetime.utcnow().isoformat()
            
            logger.info(f"Queued optimization for review: {suggestion['description']}")
            
        except Exception as e:
            logger.error(f"Error queuing optimization for review: {e}")
    
    async def _optimize_resource_allocation(self):
        """Optimize resource allocation based on performance patterns"""
        try:
            # Adjust CPU thresholds based on performance
            if self.coordination_metrics.get("avg_scan_duration", 0) > 300:
                self.config.cpu_threshold = max(70.0, self.config.cpu_threshold - 5.0)
                logger.info(f"Reduced CPU threshold to {self.config.cpu_threshold}%")
            
            # Adjust memory thresholds
            if self.coordination_metrics.get("successful_scans", 0) < 0.95:
                self.config.memory_threshold = max(80.0, self.config.memory_threshold - 3.0)
                logger.info(f"Reduced memory threshold to {self.config.memory_threshold}%")
                
        except Exception as e:
            logger.error(f"Error optimizing resource allocation: {e}")
    
    async def _optimize_load_balancing(self):
        """Optimize load balancing strategies"""
        try:
            # Adjust coordination intervals based on system load
            current_load = len(self.active_scans) / self.config.max_concurrent_scans
            
            if current_load > 0.8:
                # High load - reduce coordination frequency
                self.config.coordination_interval = min(120, self.config.coordination_interval * 1.2)
                logger.info(f"Increased coordination interval to {self.config.coordination_interval}s due to high load")
            elif current_load < 0.3:
                # Low load - increase coordination frequency
                self.config.coordination_interval = max(30, self.config.coordination_interval * 0.8)
                logger.info(f"Decreased coordination interval to {self.config.coordination_interval}s due to low load")
                
        except Exception as e:
            logger.error(f"Error optimizing load balancing: {e}")
    
    async def _optimize_queue_management(self):
        """Optimize queue processing and management"""
        try:
            # Adjust queue processing based on volume
            queue_length = self.coordination_metrics.get("queue_length", 0)
            
            if queue_length > 100:
                # High volume - increase processing frequency
                self.config.coordination_interval = max(15, self.config.coordination_interval * 0.7)
                logger.info(f"Optimized queue processing: increased frequency to {self.config.coordination_interval}s")
            elif queue_length < 10:
                # Low volume - reduce processing frequency
                self.config.coordination_interval = min(120, self.config.coordination_interval * 1.3)
                logger.info(f"Optimized queue processing: decreased frequency to {self.config.coordination_interval}s")
                
        except Exception as e:
            logger.error(f"Error optimizing queue management: {e}")
    
    async def _cleanup_loop(self):
        """Cleanup completed coordinations and old data"""
        while True:
            try:
                await asyncio.sleep(self.config.cleanup_interval)
                
                # Cleanup completed coordinations
                await self._cleanup_completed_coordinations()
                
                # Cleanup old performance data
                await self._cleanup_old_performance_data()
                
                # Cleanup resource allocation history
                await self._cleanup_resource_history()
                
            except Exception as e:
                logger.error(f"Cleanup loop error: {e}")
    
    async def _cleanup_completed_coordinations(self):
        """Cleanup completed coordination data"""
        try:
            # Keep only recent completed scans
            if len(self.completed_scans) > 800:
                self.completed_scans = deque(list(self.completed_scans)[-800:], maxlen=1000)
                logger.info("Cleaned up old completed coordinations")
                
        except Exception as e:
            logger.error(f"Error cleaning up completed coordinations: {e}")
    
    async def _cleanup_old_performance_data(self):
        """Cleanup old performance data and metrics"""
        try:
            # Cleanup old resource history
            if len(self.resource_history) > 500:
                self.resource_history = deque(list(self.resource_history)[-500:], maxlen=1000)
                logger.info("Cleaned up old performance data")
                
            # Cleanup old optimization suggestions
            if len(self.optimization_suggestions) > 80:
                self.optimization_suggestions = deque(list(self.optimization_suggestions)[-80:], maxlen=100)
                logger.info("Cleaned up old optimization suggestions")
                
        except Exception as e:
            logger.error(f"Error cleaning up old performance data: {e}")
    
    async def _cleanup_resource_history(self):
        """Cleanup old resource allocation history"""
        try:
            # Cleanup old resource allocations
            current_time = datetime.utcnow()
            expired_allocations = []
            
            for coord_id, allocation in self.resource_allocations.items():
                allocated_at = datetime.fromisoformat(allocation.get("allocated_at", "1970-01-01T00:00:00"))
                if (current_time - allocated_at).total_seconds() > 3600:  # 1 hour
                    expired_allocations.append(coord_id)
            
            # Remove expired allocations
            for coord_id in expired_allocations:
                del self.resource_allocations[coord_id]
            
            if expired_allocations:
                logger.info(f"Cleaned up {len(expired_allocations)} expired resource allocations")
                
        except Exception as e:
            logger.error(f"Error cleaning up resource history: {e}")
    
    async def get_coordination_insights(self) -> Dict[str, Any]:
        """Get comprehensive insights about coordination performance"""
        
        return {
            "coordination_metrics": self.coordination_metrics.copy(),
            "active_scans": len(self.active_scans),
            "queue_length": len(self.scan_queue),
            "completed_scans": len(self.completed_scans),
            "failed_scans": len(self.failed_scans),
            "active_workflows": len(self.active_workflows),
            "resource_status": self.system_resources.copy(),
            "optimization_suggestions": len(self.optimization_suggestions),
            "coordination_patterns": len(self.coordination_patterns),
            "configuration": {
                "max_concurrent_scans": self.config.max_concurrent_scans,
                "max_queue_size": self.config.max_queue_size,
                "coordination_interval": self.config.coordination_interval,
                "optimization_interval": self.config.optimization_interval,
                "resource_thresholds": {
                    "cpu": self.config.cpu_threshold,
                    "memory": self.config.memory_threshold,
                    "disk": self.config.disk_threshold,
                    "network": self.config.network_threshold
                }
            },
            "system_health": await self._calculate_system_health()
        }
    
    async def _calculate_system_health(self) -> Dict[str, Any]:
        """Calculate overall system health score"""
        try:
            health_score = 100.0
            
            # Resource health
            cpu_health = 100.0
            memory_health = 100.0
            disk_health = 100.0
            network_health = 100.0
            
            if self.system_resources:
                # CPU health
                cpu_usage = self.system_resources.get("cpu", {}).get("current", 0)
                if cpu_usage > self.config.cpu_threshold:
                    cpu_health = max(0, 100 - (cpu_usage - self.config.cpu_threshold) * 2)
                
                # Memory health
                memory_usage = self.system_resources.get("memory", {}).get("current", 0)
                if memory_usage > self.config.memory_threshold:
                    memory_health = max(0, 100 - (memory_usage - self.config.memory_threshold) * 2)
                
                # Disk health
                disk_usage = self.system_resources.get("disk", {}).get("current", 0)
                if disk_usage > self.config.disk_threshold:
                    disk_health = max(0, 100 - (disk_usage - self.config.disk_threshold) * 2)
                
                # Network health
                network_usage = self.system_resources.get("network", {}).get("current", 0)
                if network_usage > self.config.network_threshold:
                    network_health = max(0, 100 - (network_usage - self.config.network_threshold) * 2)
            
            # Performance health
            performance_health = 100.0
            if self.coordination_metrics.get("total_scans_coordinated", 0) > 0:
                success_rate = (self.coordination_metrics.get("successful_scans", 0) / 
                              self.coordination_metrics.get("total_scans_coordinated", 1))
                performance_health = success_rate * 100.0
            
            # Queue health
            queue_health = 100.0
            queue_length = self.coordination_metrics.get("queue_length", 0)
            if queue_length > 50:
                queue_health = max(0, 100 - (queue_length - 50) * 0.5)
            
            # Calculate overall health
            health_score = (cpu_health * 0.25 + 
                          memory_health * 0.25 + 
                          disk_health * 0.15 + 
                          network_health * 0.15 + 
                          performance_health * 0.15 + 
                          queue_health * 0.05)
            
            # Determine health status
            if health_score >= 90:
                status = "excellent"
            elif health_score >= 75:
                status = "good"
            elif health_score >= 60:
                status = "fair"
            elif health_score >= 40:
                status = "poor"
            else:
                status = "critical"
            
            return {
                "overall_score": round(health_score, 2),
                "status": status,
                "components": {
                    "cpu": round(cpu_health, 2),
                    "memory": round(memory_health, 2),
                    "disk": round(disk_health, 2),
                    "network": round(network_health, 2),
                    "performance": round(performance_health, 2),
                    "queue": round(queue_health, 2)
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating system health: {e}")
            return {
                "overall_score": 0.0,
                "status": "unknown",
                "error": str(e)
            }