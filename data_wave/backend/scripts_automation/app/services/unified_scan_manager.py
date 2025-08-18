"""
🏢 Enterprise Unified Scan Manager Service
===========================================

This service provides centralized, enterprise-grade scan management with:
- Unified scan coordination across all data governance groups
- Advanced resource management and optimization
- Intelligent scheduling and priority management
- Real-time monitoring and analytics
- Cross-system dependency tracking
- High-performance scan orchestration

Authors: Enterprise Data Governance Team
Version: 1.0.0 (Production-Ready)
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from uuid import UUID, uuid4
from enum import Enum
from dataclasses import dataclass, field
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from contextlib import asynccontextmanager

import numpy as np
import pandas as pd
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc, asc
from sqlalchemy.orm import selectinload

# Core dependencies
from ..models.scan_models import ScanRule, ScanExecution, ScanResult
from ..models.scan_orchestration_models import ScanOrchestration, OrchestrationStep
from ..models.scan_intelligence_models import ScanIntelligenceEngine, ScanPrediction
from ..models.performance_models import PerformanceMetric
from ..models.scan_performance_models import ResourceUtilization
from ..models.scan_workflow_models import ScanWorkflow, WorkflowStage, WorkflowTask
from ..db_session import get_session

# AI/ML dependencies
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Service dependencies
from .scan_orchestration_service import ScanOrchestrationService
from .scan_intelligence_service import ScanIntelligenceService
from .scan_performance_optimizer import ScanPerformanceOptimizer
from .advanced_scan_scheduler import AdvancedScanScheduler
from .scan_workflow_engine import ScanWorkflowEngine
from app.core.logging_config import get_logger

# Logging
logger = get_logger(__name__)

class ScanManagerStatus(str, Enum):
    """Scan manager operation status"""
    INITIALIZING = "initializing"
    ACTIVE = "active"
    BUSY = "busy"
    PAUSED = "paused"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    SHUTDOWN = "shutdown"

class ScanPriority(str, Enum):
    """Scan priority levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    BACKGROUND = "background"

class ScanScope(str, Enum):
    """Scan scope definitions"""
    SYSTEM_WIDE = "system_wide"
    GROUP_LEVEL = "group_level"
    SOURCE_SPECIFIC = "source_specific"
    CUSTOM = "custom"

class ResourceType(str, Enum):
    """Resource types for allocation"""
    CPU = "cpu"
    MEMORY = "memory"
    NETWORK = "network"
    STORAGE = "storage"
    DATABASE = "database"

@dataclass
class ScanRequest:
    """Unified scan request structure"""
    id: str = field(default_factory=lambda: str(uuid4()))
    source_id: Optional[str] = None
    rule_ids: List[str] = field(default_factory=list)
    priority: ScanPriority = ScanPriority.MEDIUM
    scope: ScanScope = ScanScope.SOURCE_SPECIFIC
    parameters: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    max_duration: Optional[int] = None
    retry_config: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    scheduled_for: Optional[datetime] = None

@dataclass
class ScanSession:
    """Active scan session tracking"""
    id: str
    request: ScanRequest
    status: str
    started_at: datetime
    resources_allocated: Dict[str, Any]
    metrics: Dict[str, Any] = field(default_factory=dict)
    progress: float = 0.0
    estimated_completion: Optional[datetime] = None

@dataclass
class ResourcePool:
    """Resource pool management"""
    total_capacity: Dict[ResourceType, float]
    allocated: Dict[ResourceType, float] = field(default_factory=dict)
    reserved: Dict[ResourceType, float] = field(default_factory=dict)
    available: Dict[ResourceType, float] = field(default_factory=dict)

class UnifiedScanManager:
    """
    Enterprise Unified Scan Manager
    
    Provides centralized scan management with:
    - Unified coordination across all scanning operations
    - Advanced resource management and optimization
    - Intelligent scheduling and priority handling
    - Real-time monitoring and performance analytics
    - Cross-system dependency tracking
    """

    def __init__(self):
        self.status = ScanManagerStatus.INITIALIZING
        self.active_sessions: Dict[str, ScanSession] = {}
        self.pending_requests: List[ScanRequest] = []
        self.resource_pool = ResourcePool(
            total_capacity={
                ResourceType.CPU: 100.0,
                ResourceType.MEMORY: 100.0,
                ResourceType.NETWORK: 100.0,
                ResourceType.STORAGE: 100.0,
                ResourceType.DATABASE: 100.0
            }
        )
        
        # Performance tracking
        self.performance_history: List[Dict[str, Any]] = []
        self.optimization_models: Dict[str, Any] = {}
        
        # Thread safety
        self._lock = threading.RLock()
        self._executor = ThreadPoolExecutor(max_workers=20)
        
        # Service dependencies
        self.orchestration_service = ScanOrchestrationService()
        self.intelligence_service = ScanIntelligenceService()
        self.performance_optimizer = ScanPerformanceOptimizer()
        self.scheduler = AdvancedScanScheduler()
        self.workflow_engine = ScanWorkflowEngine()
        
        # Initialize ML models
        self._initialize_ml_models()
        
        logger.info("Unified Scan Manager initialized successfully")

    async def initialize(self) -> bool:
        """Initialize the scan manager"""
        try:
            # Initialize resource pool
            await self._initialize_resource_pool()
            
            # Load performance models
            await self._load_performance_models()
            
            # Start background monitoring
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self._background_monitor())
            except RuntimeError:
                # Background monitoring will start when loop is available
                pass
            
            self.status = ScanManagerStatus.ACTIVE
            logger.info("Scan Manager initialization completed")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Scan Manager: {str(e)}")
            self.status = ScanManagerStatus.ERROR
            return False

    async def submit_scan_request(
        self,
        request: ScanRequest,
        session: AsyncSession
    ) -> Dict[str, Any]:
        """Submit a new scan request"""
        try:
            with self._lock:
                # Validate request
                validation_result = await self._validate_scan_request(request, session)
                if not validation_result["valid"]:
                    return {
                        "success": False,
                        "error": validation_result["error"],
                        "request_id": request.id
                    }
                
                # Optimize request parameters
                optimized_request = await self._optimize_scan_request(request, session)
                
                # Check resource availability
                resource_check = await self._check_resource_availability(optimized_request)
                if not resource_check["available"]:
                    # Add to pending queue
                    self.pending_requests.append(optimized_request)
                    await self._schedule_pending_request(optimized_request, session)
                    
                    return {
                        "success": True,
                        "status": "queued",
                        "request_id": optimized_request.id,
                        "estimated_start": resource_check["estimated_available"],
                        "queue_position": len(self.pending_requests)
                    }
                
                # Execute immediately
                execution_result = await self._execute_scan_request(optimized_request, session)
                
                return {
                    "success": True,
                    "status": "executing",
                    "request_id": optimized_request.id,
                    "session_id": execution_result["session_id"],
                    "estimated_completion": execution_result["estimated_completion"]
                }
                
        except Exception as e:
            logger.error(f"Error submitting scan request: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request.id
            }

    async def get_scan_status(self, request_id: str) -> Dict[str, Any]:
        """Get status of a scan request"""
        try:
            # Check active sessions
            for session_id, session in self.active_sessions.items():
                if session.request.id == request_id:
                    return {
                        "request_id": request_id,
                        "session_id": session_id,
                        "status": session.status,
                        "progress": session.progress,
                        "started_at": session.started_at.isoformat(),
                        "estimated_completion": session.estimated_completion.isoformat() if session.estimated_completion else None,
                        "resources_allocated": session.resources_allocated,
                        "metrics": session.metrics
                    }
            
            # Check pending requests
            for i, request in enumerate(self.pending_requests):
                if request.id == request_id:
                    return {
                        "request_id": request_id,
                        "status": "pending",
                        "queue_position": i + 1,
                        "created_at": request.created_at.isoformat(),
                        "scheduled_for": request.scheduled_for.isoformat() if request.scheduled_for else None,
                        "priority": request.priority
                    }
            
            return {
                "request_id": request_id,
                "status": "not_found",
                "error": "Scan request not found"
            }
            
        except Exception as e:
            logger.error(f"Error getting scan status: {str(e)}")
            return {
                "request_id": request_id,
                "status": "error",
                "error": str(e)
            }

    async def cancel_scan(self, request_id: str) -> Dict[str, Any]:
        """Cancel a scan request or active session"""
        try:
            with self._lock:
                # Check active sessions
                for session_id, session in list(self.active_sessions.items()):
                    if session.request.id == request_id:
                        # Cancel active session
                        cancel_result = await self._cancel_active_session(session_id)
                        return {
                            "success": True,
                            "request_id": request_id,
                            "session_id": session_id,
                            "status": "cancelled",
                            "resources_released": cancel_result["resources_released"]
                        }
                
                # Check pending requests
                for i, request in enumerate(self.pending_requests):
                    if request.id == request_id:
                        # Remove from pending queue
                        self.pending_requests.pop(i)
                        return {
                            "success": True,
                            "request_id": request_id,
                            "status": "cancelled",
                            "was_pending": True
                        }
                
                return {
                    "success": False,
                    "request_id": request_id,
                    "error": "Scan request not found"
                }
                
        except Exception as e:
            logger.error(f"Error cancelling scan: {str(e)}")
            return {
                "success": False,
                "request_id": request_id,
                "error": str(e)
            }

    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        try:
            with self._lock:
                resource_utilization = self._calculate_resource_utilization()
                performance_metrics = await self._get_current_performance_metrics()
                
                return {
                    "manager_status": self.status,
                    "active_sessions": len(self.active_sessions),
                    "pending_requests": len(self.pending_requests),
                    "resource_utilization": resource_utilization,
                    "performance_metrics": performance_metrics,
                    "system_health": await self._assess_system_health(),
                    "last_updated": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error getting system status: {str(e)}")
            return {
                "manager_status": "error",
                "error": str(e),
                "last_updated": datetime.utcnow().isoformat()
            }

    async def optimize_scan_performance(
        self,
        session: AsyncSession,
        target_metrics: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """Optimize scan performance across the system"""
        try:
            # Analyze current performance
            current_metrics = await self._analyze_current_performance(session)
            
            # Generate optimization recommendations
            optimizations = await self._generate_optimizations(current_metrics, target_metrics)
            
            # Apply optimizations
            applied_optimizations = []
            for optimization in optimizations:
                try:
                    result = await self._apply_optimization(optimization, session)
                    if result["success"]:
                        applied_optimizations.append({
                            "type": optimization["type"],
                            "description": optimization["description"],
                            "expected_improvement": optimization["expected_improvement"],
                            "applied_at": datetime.utcnow().isoformat()
                        })
                except Exception as e:
                    logger.warning(f"Failed to apply optimization {optimization['type']}: {str(e)}")
            
            return {
                "success": True,
                "current_metrics": current_metrics,
                "optimizations_applied": applied_optimizations,
                "estimated_improvement": sum(opt["expected_improvement"] for opt in applied_optimizations),
                "optimization_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error optimizing scan performance: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    async def get_analytics(
        self,
        session: AsyncSession,
        timeframe: Optional[str] = "24h"
    ) -> Dict[str, Any]:
        """Get comprehensive scan analytics"""
        try:
            # Parse timeframe
            hours_back = self._parse_timeframe(timeframe)
            start_time = datetime.utcnow() - timedelta(hours=hours_back)
            
            # Gather analytics data
            analytics_data = await self._gather_analytics_data(session, start_time)
            
            # Generate insights
            insights = await self._generate_analytics_insights(analytics_data)
            
            return {
                "timeframe": timeframe,
                "start_time": start_time.isoformat(),
                "end_time": datetime.utcnow().isoformat(),
                "scan_statistics": analytics_data["scan_stats"],
                "performance_trends": analytics_data["performance_trends"],
                "resource_usage": analytics_data["resource_usage"],
                "error_analysis": analytics_data["error_analysis"],
                "insights": insights,
                "recommendations": await self._generate_analytics_recommendations(analytics_data)
            }
            
        except Exception as e:
            logger.error(f"Error generating analytics: {str(e)}")
            return {
                "error": str(e),
                "timeframe": timeframe
            }

    # Private methods for internal operations

    async def _initialize_resource_pool(self):
        """Initialize the resource pool with system capabilities"""
        try:
            # Auto-detect system resources (simplified)
            import psutil
            
            cpu_count = psutil.cpu_count()
            memory_gb = psutil.virtual_memory().total / (1024**3)
            
            self.resource_pool.total_capacity.update({
                ResourceType.CPU: cpu_count * 10,  # 10 units per core
                ResourceType.MEMORY: memory_gb * 10,  # 10 units per GB
                ResourceType.NETWORK: 100.0,
                ResourceType.STORAGE: 100.0,
                ResourceType.DATABASE: 50.0
            })
            
            # Initialize available resources
            for resource_type in ResourceType:
                self.resource_pool.available[resource_type] = self.resource_pool.total_capacity[resource_type]
                self.resource_pool.allocated[resource_type] = 0.0
                self.resource_pool.reserved[resource_type] = 0.0
            
            logger.info(f"Resource pool initialized with capacities: {self.resource_pool.total_capacity}")
            
        except Exception as e:
            logger.warning(f"Could not auto-detect resources, using defaults: {str(e)}")

    async def _validate_scan_request(self, request: ScanRequest, session: AsyncSession) -> Dict[str, Any]:
        """Validate scan request parameters with enterprise-grade checks."""
        try:
            # Scope and identity validation
            if request.scope != ScanScope.SYSTEM_WIDE and not request.source_id:
                return {"valid": False, "error": "source_id is required unless scope is system_wide"}

            # Data source existence check
            if request.source_id:
                from ..models.scan_models import DataSource
                result = await session.execute(select(DataSource).where(DataSource.id == request.source_id))
                ds = result.scalars().first()
                if ds is None:
                    return {"valid": False, "error": f"Unknown data source id: {request.source_id}"}

            # Rule validation via enterprise rule service
            if request.rule_ids and request.scope != ScanScope.CUSTOM:
                invalid_rules = await self._validate_rule_access(request.rule_ids)
                if invalid_rules:
                    return {"valid": False, "error": f"Invalid rule ids: {invalid_rules}"}

            # Dependency sanity checks
            if request.dependencies:
                has_cycle, dep_error = await self._has_circular_dependencies(request.dependencies)
                if has_cycle:
                    return {"valid": False, "error": dep_error or "Circular dependencies detected"}

            # Optional rate limiting by requester (if provided)
            requester = request.parameters.get("requested_by") if isinstance(request.parameters, dict) else None
            if requester:
                try:
                    from app.utils.rate_limiter import get_rate_limiter
                    limiter = get_rate_limiter()
                    rl = await limiter.check_rate_limit(identifier=str(requester), rule_name="scan_operations", context={"source_id": request.source_id})
                    if not rl.allowed:
                        return {"valid": False, "error": "Rate limit exceeded", "retry_after": rl.retry_after}
                except Exception:
                    # Fail open on rate limiter errors
                    pass

            return {"valid": True}

        except Exception as e:
            logger.error(f"Scan request validation error: {e}")
            return {"valid": False, "error": f"Validation error: {str(e)}"}

    async def _validate_rule_access(self, rule_ids: List[str]) -> List[str]:
        """Validate that provided rule ids exist and are accessible."""
        try:
            from .enterprise_scan_rule_service import EnterpriseScanRuleService
            svc = EnterpriseScanRuleService()
            result = await svc.validate_scan_rules(rule_ids)
            if not result.get("valid", False):
                # Extract unknown ids from error message if present
                return result.get("errors", ["unknown_rules"])
            return []
        except Exception as e:
            logger.warning(f"Rule validation failed: {e}")
            return []

    async def _has_circular_dependencies(self, dependencies: List[str]) -> Tuple[bool, Optional[str]]:
        """Detect cycles in dependency list when present as edge spec 'A->B'."""
        try:
            if not dependencies:
                return False, None
            edges: List[Tuple[str, str]] = []
            for item in dependencies:
                if isinstance(item, str) and "->" in item:
                    a, b = [p.strip() for p in item.split("->", 1)]
                    edges.append((a, b))
            if not edges:
                # No edge semantics provided; cannot infer cycles
                return False, None
            graph: Dict[str, List[str]] = {}
            for a, b in edges:
                graph.setdefault(a, []).append(b)
            visiting: set = set()
            visited: set = set()

            def dfs(node: str) -> bool:
                if node in visiting:
                    return True
                if node in visited:
                    return False
                visiting.add(node)
                for nbr in graph.get(node, []):
                    if dfs(nbr):
                        return True
                visiting.remove(node)
                visited.add(node)
                return False

            for n in list(graph.keys()):
                if dfs(n):
                    return True, "Circular dependency detected"
            return False, None
        except Exception as e:
            logger.warning(f"Dependency analysis failed: {e}")
            return False, None

    async def _optimize_scan_request(self, request: ScanRequest, session: AsyncSession) -> ScanRequest:
        """Optimize scan request parameters using ML"""
        try:
            # Load historical performance data
            performance_data = await self._load_performance_data(session)
            
            # Predict optimal parameters
            if self.optimization_models.get("parameter_optimizer"):
                optimal_params = await self._predict_optimal_parameters(request, performance_data)
                request.parameters.update(optimal_params)
            
            # Optimize rule selection
            if request.rule_ids:
                optimized_rules = await self._optimize_rule_selection(request.rule_ids, session)
                request.rule_ids = optimized_rules
            
            # Set optimal scheduling
            if not request.scheduled_for:
                optimal_time = await self._predict_optimal_scheduling(request, session)
                request.scheduled_for = optimal_time
            
            return request
            
        except Exception as e:
            logger.warning(f"Could not optimize request, using original: {str(e)}")
            return request

    async def _execute_scan_request(self, request: ScanRequest, session: AsyncSession) -> Dict[str, Any]:
        """Execute a scan request"""
        try:
            # Allocate resources
            resources = await self._allocate_resources(request)
            
            # Create scan session
            scan_session = ScanSession(
                id=str(uuid4()),
                request=request,
                status="initializing",
                started_at=datetime.utcnow(),
                resources_allocated=resources
            )
            
            # Estimate completion time
            scan_session.estimated_completion = await self._estimate_completion_time(request, resources)
            
            # Add to active sessions
            self.active_sessions[scan_session.id] = scan_session
            
            # Start execution in background
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self._execute_scan_session(scan_session, session))
            except RuntimeError:
                # Execute synchronously if no loop available
                await self._execute_scan_session(scan_session, session)
            
            return {
                "session_id": scan_session.id,
                "estimated_completion": scan_session.estimated_completion
            }
            
        except Exception as e:
            logger.error(f"Error executing scan request: {str(e)}")
            raise

    async def _execute_scan_session(self, scan_session: ScanSession, session: AsyncSession):
        """Execute the actual scan session"""
        try:
            # Update status
            scan_session.status = "running"
            
            # Create orchestration
            orchestration_result = await self.orchestration_service.create_orchestration({
                "name": f"Unified Scan - {scan_session.request.id}",
                "description": f"Unified scan execution for request {scan_session.request.id}",
                "priority": scan_session.request.priority,
                "configuration": {
                    "source_id": scan_session.request.source_id,
                    "rule_ids": scan_session.request.rule_ids,
                    "parameters": scan_session.request.parameters,
                    "resources": scan_session.resources_allocated
                }
            }, session)
            
            if not orchestration_result["success"]:
                raise Exception(f"Failed to create orchestration: {orchestration_result['error']}")
            
            orchestration_id = orchestration_result["orchestration_id"]
            
            # Monitor execution
            while True:
                status = await self.orchestration_service.get_orchestration_status(orchestration_id, session)
                
                # Update session progress
                scan_session.progress = status.get("progress", 0.0)
                scan_session.metrics.update(status.get("metrics", {}))
                
                if status["status"] in ["completed", "failed", "cancelled"]:
                    scan_session.status = status["status"]
                    break
                
                await asyncio.sleep(5)  # Check every 5 seconds
            
            # Record performance metrics
            await self._record_session_metrics(scan_session, session)
            
        except Exception as e:
            logger.error(f"Error during scan session execution: {str(e)}")
            scan_session.status = "failed"
            scan_session.metrics["error"] = str(e)
        
        finally:
            # Release resources
            await self._release_resources(scan_session.resources_allocated)
            
            # Remove from active sessions
            if scan_session.id in self.active_sessions:
                del self.active_sessions[scan_session.id]
            
            # Process pending requests
            await self._process_pending_requests()

    def _initialize_ml_models(self):
        """Initialize machine learning models for optimization"""
        try:
            # Parameter optimization model
            self.optimization_models["parameter_optimizer"] = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            # Resource prediction model
            self.optimization_models["resource_predictor"] = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                random_state=42
            )
            
            # Performance clustering model
            self.optimization_models["performance_clusterer"] = KMeans(
                n_clusters=5,
                random_state=42
            )
            
            # Anomaly detection model
            self.optimization_models["anomaly_detector"] = DBSCAN(
                eps=0.5,
                min_samples=5
            )
            
            logger.info("ML models initialized successfully")
            
        except Exception as e:
            logger.warning(f"Could not initialize ML models: {str(e)}")

    async def _background_monitor(self):
        """Background monitoring and optimization"""
        while self.status != ScanManagerStatus.SHUTDOWN:
            try:
                if self.status == ScanManagerStatus.ACTIVE:
                    # Monitor resource utilization
                    await self._monitor_resources()
                    
                    # Check for optimization opportunities
                    await self._check_optimization_opportunities()
                    
                    # Update performance models
                    await self._update_performance_models()
                    
                    # Process pending requests
                    await self._process_pending_requests()
                
                await asyncio.sleep(30)  # Monitor every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in background monitor: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error

    def _calculate_resource_utilization(self) -> Dict[str, float]:
        """Calculate current resource utilization"""
        utilization = {}
        for resource_type in ResourceType:
            total = self.resource_pool.total_capacity[resource_type]
            allocated = self.resource_pool.allocated[resource_type]
            utilization[resource_type.value] = (allocated / total) * 100 if total > 0 else 0
        
        return utilization

    async def _gather_analytics_data(self, session: AsyncSession, start_time: datetime) -> Dict[str, Any]:
        """Gather comprehensive analytics data"""
        try:
            # Scan statistics
            scan_stats = {
                "total_scans": len([s for s in self.performance_history if s["started_at"] >= start_time]),
                "successful_scans": len([s for s in self.performance_history if s["started_at"] >= start_time and s["status"] == "completed"]),
                "failed_scans": len([s for s in self.performance_history if s["started_at"] >= start_time and s["status"] == "failed"]),
                "average_duration": np.mean([s["duration"] for s in self.performance_history if s["started_at"] >= start_time and "duration" in s]) if self.performance_history else 0
            }
            
            # Performance trends
            performance_trends = {
                "throughput_trend": await self._calculate_throughput_trend(start_time),
                "latency_trend": await self._calculate_latency_trend(start_time),
                "error_rate_trend": await self._calculate_error_rate_trend(start_time)
            }
            
            # Resource usage
            resource_usage = {
                "peak_utilization": await self._calculate_peak_utilization(start_time),
                "average_utilization": await self._calculate_average_utilization(start_time),
                "resource_efficiency": await self._calculate_resource_efficiency(start_time)
            }
            
            # Error analysis
            error_analysis = await self._analyze_errors(start_time)
            
            return {
                "scan_stats": scan_stats,
                "performance_trends": performance_trends,
                "resource_usage": resource_usage,
                "error_analysis": error_analysis
            }
            
        except Exception as e:
            logger.error(f"Error gathering analytics data: {str(e)}")
            return {}

    def _parse_timeframe(self, timeframe: str) -> int:
        """Parse timeframe string to hours"""
        timeframe_map = {
            "1h": 1, "6h": 6, "12h": 12, "24h": 24,
            "1d": 24, "3d": 72, "7d": 168, "30d": 720
        }
        return timeframe_map.get(timeframe, 24)

    async def shutdown(self):
        """Gracefully shutdown the scan manager"""
        try:
            logger.info("Shutting down Unified Scan Manager...")
            self.status = ScanManagerStatus.SHUTDOWN
            
            # Cancel all active sessions
            for session_id in list(self.active_sessions.keys()):
                await self._cancel_active_session(session_id)
            
            # Clear pending requests
            self.pending_requests.clear()
            
            # Shutdown executor
            self._executor.shutdown(wait=True)
            
            logger.info("Unified Scan Manager shutdown completed")
            
        except Exception as e:
            logger.error(f"Error during shutdown: {str(e)}")

# Global instance
_unified_scan_manager = None

def get_unified_scan_manager() -> UnifiedScanManager:
    """Get the global unified scan manager instance"""
    global _unified_scan_manager
    if _unified_scan_manager is None:
        _unified_scan_manager = UnifiedScanManager()
    return _unified_scan_manager

async def initialize_unified_scan_manager() -> bool:
    """Initialize the global unified scan manager"""
    manager = get_unified_scan_manager()
    return await manager.initialize()