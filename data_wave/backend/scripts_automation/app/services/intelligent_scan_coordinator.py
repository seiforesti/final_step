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
        
        # Background tasks
        asyncio.create_task(self._coordination_loop())
        asyncio.create_task(self._resource_monitoring_loop())
        asyncio.create_task(self._optimization_loop())
        asyncio.create_task(self._cleanup_loop())
    
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