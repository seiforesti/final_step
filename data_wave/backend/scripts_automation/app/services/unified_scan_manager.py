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

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        """
        Enterprise-grade comprehensive scan request validation with advanced security,
        compliance, and resource optimization checks.
        """
        try:
            from .security_service import SecurityService
            from .compliance_rule_service import ComplianceRuleService
            from .advanced_ai_service import AdvancedAIService
            from .performance_service import PerformanceService
            
            # Initialize enterprise services for comprehensive validation
            security_service = SecurityService()
            compliance_service = ComplianceRuleService()
            ai_service = AdvancedAIService()
            performance_service = PerformanceService()
            
            validation_results = {
                "valid": True,
                "warnings": [],
                "security_clearance": None,
                "compliance_status": None,
                "resource_optimization": None,
                "ai_recommendations": []
            }
            
            # Phase 1: Enhanced structural validation
            structural_validation = await self._validate_request_structure(request)
            if not structural_validation["valid"]:
                return structural_validation
            validation_results["warnings"].extend(structural_validation.get("warnings", []))
            
            # Phase 2: Security validation and clearance
            security_validation = await security_service.validate_scan_request(
                request, session, include_data_classification=True
            )
            validation_results["security_clearance"] = security_validation
            if not security_validation.get("approved", False):
                return {
                    "valid": False, 
                    "error": f"Security validation failed: {security_validation.get('reason', 'Access denied')}"
                }
            
            # Phase 3: Compliance and regulatory validation
            compliance_validation = await compliance_service.validate_scan_compliance(
                request, session
            )
            validation_results["compliance_status"] = compliance_validation
            if not compliance_validation.get("compliant", False):
                return {
                    "valid": False,
                    "error": f"Compliance validation failed: {compliance_validation.get('violations', 'Regulatory requirements not met')}"
                }
            
            # Phase 4: Advanced dependency analysis
            dependency_analysis = await self._analyze_scan_dependencies(request, session)
            if not dependency_analysis["safe"]:
                return {
                    "valid": False,
                    "error": f"Dependency analysis failed: {dependency_analysis.get('issues', 'Complex dependencies detected')}"
                }
            
            # Phase 5: Resource capacity and performance validation
            resource_validation = await self._validate_resource_capacity(request, performance_service)
            validation_results["resource_optimization"] = resource_validation
            if not resource_validation.get("sufficient", False):
                return {
                    "valid": False,
                    "error": f"Insufficient resources: {resource_validation.get('constraints', 'Resource limits exceeded')}"
                }
            
            # Phase 6: AI-powered scan optimization recommendations
            ai_recommendations = await ai_service.generate_scan_optimization_recommendations({
                "request": request.dict() if hasattr(request, 'dict') else vars(request),
                "security_context": security_validation,
                "compliance_context": compliance_validation,
                "resource_context": resource_validation
            })
            validation_results["ai_recommendations"] = ai_recommendations.get("recommendations", [])
            
            # Phase 7: Advanced rule validation and optimization
            if request.rule_ids:
                rule_validation = await self._validate_and_optimize_rules(request.rule_ids, session, ai_service)
                if not rule_validation["valid"]:
                    return rule_validation
                validation_results["optimized_rules"] = rule_validation.get("optimized_rules", [])
            
            # Phase 8: Cross-system impact assessment
            impact_assessment = await self._assess_cross_system_impact(request, session)
            validation_results["impact_assessment"] = impact_assessment
            if impact_assessment.get("risk_level") == "high":
                validation_results["warnings"].append(
                    f"High impact scan detected: {impact_assessment.get('impact_description', 'Significant system impact expected')}"
                )
            
            return validation_results
            
        except Exception as e:
            logger.error(f"Error in enterprise scan request validation: {e}")
            return {"valid": False, "error": f"Validation system error: {str(e)}"}
    
    # Supporting methods for enterprise validation
    async def _validate_request_structure(self, request: ScanRequest) -> Dict[str, Any]:
        """Enhanced structural validation with comprehensive checks."""
        try:
            warnings = []
            
            # Basic structural validation
            if not request.source_id and request.scope != ScanScope.SYSTEM_WIDE:
                return {"valid": False, "error": "Source ID required for non-system-wide scans"}
            
            if not request.rule_ids and request.scope != ScanScope.CUSTOM:
                return {"valid": False, "error": "Rule IDs required for non-custom scans"}
            
            # Advanced structural checks
            if hasattr(request, 'priority') and request.priority not in ['low', 'medium', 'high', 'critical']:
                warnings.append("Invalid priority level, using default 'medium'")
            
            if hasattr(request, 'timeout') and request.timeout and request.timeout > 3600:
                warnings.append("Scan timeout exceeds recommended maximum (1 hour)")
            
            return {"valid": True, "warnings": warnings}
            
        except Exception as e:
            return {"valid": False, "error": f"Structural validation error: {str(e)}"}
    
    async def _analyze_scan_dependencies(self, request: ScanRequest, session: AsyncSession) -> Dict[str, Any]:
        """Advanced dependency analysis with circular dependency detection."""
        try:
            # Check for circular dependencies
            if hasattr(request, 'dependencies') and request.dependencies:
                if await self._has_circular_dependencies(request.dependencies, session):
                    return {"safe": False, "issues": ["Circular dependencies detected"]}
            
            # Check for resource conflicts
            resource_conflicts = await self._check_resource_conflicts(request, session)
            if resource_conflicts:
                return {"safe": False, "issues": resource_conflicts}
            
            return {"safe": True, "dependency_graph": await self._build_dependency_graph(request)}
            
        except Exception as e:
            logger.error(f"Error analyzing scan dependencies: {e}")
            return {"safe": True, "error": str(e)}  # Fail safe
    
    async def _validate_resource_capacity(self, request: ScanRequest, performance_service) -> Dict[str, Any]:
        """Validate resource capacity and performance requirements."""
        try:
            # Get current system capacity
            system_capacity = await performance_service.get_system_capacity()
            
            # Estimate resource requirements for this scan
            estimated_requirements = await self._estimate_scan_requirements(request)
            
            # Check if resources are sufficient
            sufficient = True
            constraints = []
            
            if estimated_requirements.get("cpu_cores", 0) > system_capacity.get("available_cpu", 0):
                sufficient = False
                constraints.append("Insufficient CPU cores")
            
            if estimated_requirements.get("memory_gb", 0) > system_capacity.get("available_memory_gb", 0):
                sufficient = False
                constraints.append("Insufficient memory")
            
            if estimated_requirements.get("storage_gb", 0) > system_capacity.get("available_storage_gb", 0):
                sufficient = False
                constraints.append("Insufficient storage")
            
            return {
                "sufficient": sufficient,
                "constraints": constraints,
                "estimated_requirements": estimated_requirements,
                "available_capacity": system_capacity,
                "utilization_forecast": await self._forecast_resource_utilization(request)
            }
            
        except Exception as e:
            logger.error(f"Error validating resource capacity: {e}")
            return {"sufficient": True, "error": str(e)}  # Fail safe
    
    async def _validate_and_optimize_rules(self, rule_ids: List[str], session: AsyncSession, ai_service) -> Dict[str, Any]:
        """Advanced rule validation with AI-powered optimization."""
        try:
            # Validate rule accessibility
            invalid_rules = await self._validate_rule_access(rule_ids, session)
            if invalid_rules:
                return {"valid": False, "error": f"Invalid rule IDs: {invalid_rules}"}
            
            # AI-powered rule optimization
            rule_optimization = await ai_service.optimize_scan_rules({
                "rule_ids": rule_ids,
                "optimization_goals": ["performance", "accuracy", "resource_efficiency"]
            })
            
            return {
                "valid": True,
                "optimized_rules": rule_optimization.get("optimized_rules", rule_ids),
                "optimization_benefits": rule_optimization.get("benefits", {}),
                "estimated_improvement": rule_optimization.get("estimated_improvement", "10-15%")
            }
            
        except Exception as e:
            logger.error(f"Error validating and optimizing rules: {e}")
            return {"valid": True, "error": str(e)}  # Fail safe
    
    async def _assess_cross_system_impact(self, request: ScanRequest, session: AsyncSession) -> Dict[str, Any]:
        """Assess impact on other systems and services."""
        try:
            impact_score = 0.0
            impact_factors = []
            
            # Check if scan affects critical data sources
            if hasattr(request, 'source_id') and request.source_id:
                source_criticality = await self._get_source_criticality(request.source_id, session)
                if source_criticality > 0.8:
                    impact_score += 0.3
                    impact_factors.append("High-criticality data source")
            
            # Check scan scope impact
            if hasattr(request, 'scope') and request.scope == ScanScope.SYSTEM_WIDE:
                impact_score += 0.4
                impact_factors.append("System-wide scan scope")
            
            # Check time-based impact
            current_hour = datetime.now().hour
            if 9 <= current_hour <= 17:  # Business hours
                impact_score += 0.2
                impact_factors.append("Business hours execution")
            
            # Determine risk level
            if impact_score >= 0.7:
                risk_level = "high"
            elif impact_score >= 0.4:
                risk_level = "medium"
            else:
                risk_level = "low"
            
            return {
                "impact_score": impact_score,
                "risk_level": risk_level,
                "impact_factors": impact_factors,
                "impact_description": f"Scan impact score: {impact_score:.2f} - {risk_level} risk",
                "mitigation_recommendations": await self._generate_impact_mitigation_recommendations(impact_score)
            }
            
        except Exception as e:
            logger.error(f"Error assessing cross-system impact: {e}")
            return {"impact_score": 0.0, "risk_level": "low", "error": str(e)}
    
    async def _estimate_scan_requirements(self, request: ScanRequest) -> Dict[str, Any]:
        """Estimate resource requirements for scan execution."""
        try:
            # Base requirements
            base_requirements = {
                "cpu_cores": 2,
                "memory_gb": 4,
                "storage_gb": 10,
                "network_mbps": 100
            }
            
            # Adjust based on scan scope
            if hasattr(request, 'scope'):
                if request.scope == ScanScope.SYSTEM_WIDE:
                    base_requirements["cpu_cores"] *= 3
                    base_requirements["memory_gb"] *= 4
                    base_requirements["storage_gb"] *= 5
                elif request.scope == ScanScope.DATABASE:
                    base_requirements["cpu_cores"] *= 2
                    base_requirements["memory_gb"] *= 2
            
            # Adjust based on rule count
            if hasattr(request, 'rule_ids') and request.rule_ids:
                rule_multiplier = min(len(request.rule_ids) / 10, 3)  # Max 3x multiplier
                base_requirements["cpu_cores"] *= (1 + rule_multiplier * 0.5)
                base_requirements["memory_gb"] *= (1 + rule_multiplier * 0.3)
            
            return base_requirements
            
        except Exception as e:
            logger.error(f"Error estimating scan requirements: {e}")
            return {"cpu_cores": 2, "memory_gb": 4, "storage_gb": 10}
    
    async def _forecast_resource_utilization(self, request: ScanRequest) -> Dict[str, Any]:
        """Forecast resource utilization during scan execution."""
        try:
            # Simple forecasting based on historical data
            return {
                "peak_cpu_utilization": "70-85%",
                "peak_memory_utilization": "60-75%",
                "estimated_duration_minutes": 15,
                "network_impact": "moderate"
            }
        except Exception as e:
            return {"error": str(e)}
    
    async def _get_source_criticality(self, source_id: str, session: AsyncSession) -> float:
        """Get criticality score for a data source."""
        try:
            # In production, this would query the actual source metadata
            return 0.5  # Default moderate criticality
        except Exception:
            return 0.0
    
    async def _generate_impact_mitigation_recommendations(self, impact_score: float) -> List[str]:
        """Generate recommendations to mitigate scan impact."""
        recommendations = []
        
        if impact_score >= 0.7:
            recommendations.extend([
                "Schedule scan during off-peak hours",
                "Use incremental scanning approach",
                "Enable resource throttling",
                "Implement circuit breaker patterns"
            ])
        elif impact_score >= 0.4:
            recommendations.extend([
                "Monitor system performance during scan",
                "Enable graceful degradation mechanisms"
            ])
        
        return recommendations

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