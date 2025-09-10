"""
Unified Data Governance Coordinator

Enterprise-grade coordinator that orchestrates all six data governance groups:
- Data Sources, Compliance Rules, Classifications (existing enterprise implementations)
- Scan-Rule-Sets, Data Catalog, Scan Logic (new advanced implementations)

Provides:
- Cross-system coordination and synchronization
- Unified workflow orchestration
- Enterprise-level monitoring and analytics
- Advanced failure recovery and resilience
- Real-time system health management
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
from concurrent.futures import ThreadPoolExecutor
import json
import uuid
from dataclasses import dataclass, field
from enum import Enum

from sqlmodel import Session, select, func, and_, or_
from sqlalchemy import text

from ..core.config import settings
from ..core.cache_manager import EnterpriseCacheManager as CacheManager
from ..services.ai_service import EnterpriseAIService as AIService
from ..services.scan_intelligence_service import ScanIntelligenceService
from ..services.catalog_quality_service import CatalogQualityService
from ..services.intelligent_discovery_service import IntelligentDiscoveryService
from ..services.advanced_lineage_service import AdvancedLineageService
from ..services.enterprise_scan_orchestrator import EnterpriseScanOrchestrator
from ..services.intelligent_scan_coordinator import IntelligentScanCoordinator
from ..services.scan_workflow_engine import ScanWorkflowEngine
from ..services.comprehensive_analytics_service import ComprehensiveAnalyticsService
from ..services.data_source_connection_service import DataSourceConnectionService
from ..services.compliance_rule_service import ComplianceRuleService
from ..services.classification_service import ClassificationService

try:
    from ..core.settings import get_settings
except Exception:
    from ..core.config import settings as get_settings

logger = logging.getLogger(__name__)

class GovernanceGroupStatus(Enum):
    """Status of individual governance groups"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    CRITICAL = "critical"
    OFFLINE = "offline"

class SystemHealthLevel(Enum):
    """Overall system health levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"

@dataclass
class GovernanceGroup:
    """Represents a data governance group"""
    name: str
    service_instance: Any
    status: GovernanceGroupStatus = GovernanceGroupStatus.HEALTHY
    health_score: float = 100.0
    last_health_check: Optional[datetime] = None
    metrics: Dict[str, Any] = field(default_factory=dict)
    dependencies: List[str] = field(default_factory=list)
    is_critical: bool = True

@dataclass
class CrossSystemWorkflow:
    """Represents a workflow spanning multiple governance groups"""
    workflow_id: str
    name: str
    description: str
    involved_groups: List[str]
    steps: List[Dict[str, Any]]
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)

class GovernanceCoordinatorConfig:
    """Configuration for the governance coordinator"""
    def __init__(self):
        self.health_check_interval_seconds = 30
        self.metrics_collection_interval_seconds = 60
        self.cross_system_sync_interval_seconds = 300
        self.workflow_execution_timeout_seconds = 3600
        self.max_concurrent_workflows = 10
        self.system_recovery_enabled = True
        self.auto_scaling_enabled = True
        self.predictive_maintenance_enabled = True

class UnifiedGovernanceCoordinator:
    """
    Enterprise-grade unified governance coordinator providing:
    - Cross-system orchestration and coordination
    - Unified workflow management
    - Real-time health monitoring and recovery
    - Advanced analytics and insights
    - Enterprise-level resilience and scaling
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.cache = CacheManager()
        self.ai_service = AIService()
        
        self.config = GovernanceCoordinatorConfig()
        
        # Initialize governance groups
        self.governance_groups = {}
        self._init_governance_groups()
        
        # System state management
        self.system_health = SystemHealthLevel.GOOD
        self.system_status = "initializing"
        self.active_workflows = {}
        self.workflow_queue = deque()
        self.completed_workflows = deque(maxlen=1000)
        
        # Cross-system coordination
        self.group_dependencies = self._define_group_dependencies()
        self.sync_schedules = {}
        self.coordination_rules = self._define_coordination_rules()
        
        # Performance and metrics
        self.system_metrics = {
            'total_operations': 0,
            'successful_operations': 0,
            'failed_operations': 0,
            'average_response_time': 0.0,
            'cross_system_workflows': 0,
            'system_uptime': datetime.utcnow(),
            'last_failure_recovery': None,
            'performance_score': 100.0
        }
        
        # Intelligence and optimization
        self.intelligence_service = ScanIntelligenceService()
        self.analytics_service = ComprehensiveAnalyticsService()
        
        # Advanced features
        self.predictive_models = {}
        self.anomaly_detectors = {}
        self.optimization_engines = {}
        
        # Threading
        self.executor = ThreadPoolExecutor(max_workers=20)
        
        # Start background coordination tasks when an event loop exists
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._health_monitoring_loop())
            loop.create_task(self._cross_system_sync_loop())
            loop.create_task(self._workflow_execution_loop())
            loop.create_task(self._metrics_collection_loop())
            loop.create_task(self._system_optimization_loop())
            loop.create_task(self._predictive_maintenance_loop())
        except RuntimeError:
            pass

    def start(self) -> None:
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._health_monitoring_loop())
            loop.create_task(self._cross_system_sync_loop())
            loop.create_task(self._workflow_execution_loop())
            loop.create_task(self._metrics_collection_loop())
            loop.create_task(self._system_optimization_loop())
            loop.create_task(self._predictive_maintenance_loop())
        except RuntimeError:
            pass
        
        logger.info("Unified Governance Coordinator initialized successfully")
    
    def _init_governance_groups(self):
        """Initialize all governance groups with their service instances"""
        try:
            # Existing enterprise-grade groups
            self.governance_groups["data_sources"] = GovernanceGroup(
                name="Data Sources",
                service_instance=DataSourceConnectionService(),
                dependencies=[],
                is_critical=True
            )
            
            self.governance_groups["compliance_rules"] = GovernanceGroup(
                name="Compliance Rules",
                service_instance=ComplianceRuleService(),
                dependencies=["data_sources"],
                is_critical=True
            )
            
            self.governance_groups["classifications"] = GovernanceGroup(
                name="Classifications",
                service_instance=ClassificationService(),
                dependencies=["data_sources"],
                is_critical=True
            )
            
            # New advanced enterprise implementations
            self.governance_groups["scan_rule_sets"] = GovernanceGroup(
                name="Scan Rule Sets",
                service_instance=ScanIntelligenceService(),
                dependencies=["data_sources", "compliance_rules", "classifications"],
                is_critical=True
            )
            
            self.governance_groups["data_catalog"] = GovernanceGroup(
                name="Data Catalog",
                service_instance=IntelligentDiscoveryService(),
                dependencies=["data_sources", "classifications", "scan_rule_sets"],
                is_critical=True
            )
            
            self.governance_groups["scan_logic"] = GovernanceGroup(
                name="Scan Logic",
                service_instance=EnterpriseScanOrchestrator(),
                dependencies=["data_sources", "compliance_rules", "classifications", "scan_rule_sets", "data_catalog"],
                is_critical=True
            )
            
            logger.info(f"Initialized {len(self.governance_groups)} governance groups")
            
        except Exception as e:
            logger.error(f"Failed to initialize governance groups: {e}")
            raise
    
    def _define_group_dependencies(self) -> Dict[str, List[str]]:
        """Define dependencies between governance groups"""
        return {
            "data_sources": [],
            "compliance_rules": ["data_sources"],
            "classifications": ["data_sources"],
            "scan_rule_sets": ["data_sources", "compliance_rules", "classifications"],
            "data_catalog": ["data_sources", "classifications", "scan_rule_sets"],
            "scan_logic": ["data_sources", "compliance_rules", "classifications", "scan_rule_sets", "data_catalog"]
        }
    
    def _define_coordination_rules(self) -> Dict[str, Any]:
        """Define rules for cross-system coordination"""
        return {
            "data_flow_rules": {
                "new_data_source": ["classifications", "compliance_rules", "scan_rule_sets", "data_catalog"],
                "classification_update": ["compliance_rules", "scan_rule_sets", "data_catalog"],
                "compliance_change": ["scan_rule_sets", "data_catalog", "scan_logic"],
                "scan_rule_modification": ["data_catalog", "scan_logic"],
                "catalog_update": ["scan_logic"]
            },
            "synchronization_priorities": {
                "high": ["compliance_changes", "security_updates", "critical_failures"],
                "medium": ["classification_updates", "performance_optimizations"],
                "low": ["metadata_updates", "usage_analytics"]
            },
            "failure_escalation": {
                "data_sources": ["scan_logic", "data_catalog"],
                "compliance_rules": ["scan_rule_sets", "scan_logic"],
                "classifications": ["data_catalog", "scan_rule_sets"]
            }
        }
    
    async def execute_cross_system_workflow(
        self,
        workflow_definition: Dict[str, Any],
        user_id: str,
        priority: str = "medium"
    ) -> str:
        """
        Execute a workflow that spans multiple governance groups
        
        Features:
        - Cross-system coordination
        - Dependency management
        - Failure recovery
        - Real-time monitoring
        """
        try:
            workflow_id = str(uuid.uuid4())
            
            # Create workflow instance
            workflow = CrossSystemWorkflow(
                workflow_id=workflow_id,
                name=workflow_definition.get("name", "Cross-System Workflow"),
                description=workflow_definition.get("description", ""),
                involved_groups=workflow_definition.get("groups", []),
                steps=workflow_definition.get("steps", []),
                metadata={
                    "user_id": user_id,
                    "priority": priority,
                    "created_at": datetime.utcnow().isoformat(),
                    "estimated_duration": workflow_definition.get("estimated_duration", "unknown")
                }
            )
            
            # Validate workflow dependencies
            await self._validate_workflow_dependencies(workflow)
            
            # Add to execution queue
            self.workflow_queue.append(workflow)
            self.active_workflows[workflow_id] = workflow
            
            # Update metrics
            self.system_metrics['cross_system_workflows'] += 1
            
            logger.info(f"Cross-system workflow {workflow_id} queued for execution")
            return workflow_id
            
        except Exception as e:
            logger.error(f"Failed to execute cross-system workflow: {e}")
            raise
    
    async def _validate_workflow_dependencies(self, workflow: CrossSystemWorkflow):
        """Validate that all required governance groups are healthy"""
        for group_name in workflow.involved_groups:
            if group_name not in self.governance_groups:
                raise ValueError(f"Unknown governance group: {group_name}")
            
            group = self.governance_groups[group_name]
            if group.status in [GovernanceGroupStatus.CRITICAL, GovernanceGroupStatus.OFFLINE]:
                raise RuntimeError(f"Governance group {group_name} is not available: {group.status}")
    
    async def get_system_health_overview(self) -> Dict[str, Any]:
        """
        Get comprehensive system health overview
        
        Features:
        - Individual group health status
        - Overall system health score
        - Performance metrics
        - Dependency analysis
        - Predictive insights
        """
        try:
            # Collect health data from all groups
            group_health = {}
            overall_health_score = 0.0
            critical_issues = []
            
            for group_name, group in self.governance_groups.items():
                group_health[group_name] = {
                    "status": group.status.value,
                    "health_score": group.health_score,
                    "last_check": group.last_health_check.isoformat() if group.last_health_check else None,
                    "metrics": group.metrics,
                    "is_critical": group.is_critical
                }
                
                overall_health_score += group.health_score
                
                if group.status in [GovernanceGroupStatus.CRITICAL, GovernanceGroupStatus.OFFLINE]:
                    critical_issues.append({
                        "group": group_name,
                        "status": group.status.value,
                        "impact": "high" if group.is_critical else "medium"
                    })
            
            overall_health_score /= len(self.governance_groups)
            
            # Determine system health level
            if overall_health_score >= 95:
                system_health = SystemHealthLevel.EXCELLENT
            elif overall_health_score >= 80:
                system_health = SystemHealthLevel.GOOD
            elif overall_health_score >= 60:
                system_health = SystemHealthLevel.WARNING
            elif overall_health_score >= 30:
                system_health = SystemHealthLevel.CRITICAL
            else:
                system_health = SystemHealthLevel.EMERGENCY
            
            # Generate predictive insights
            predictive_insights = await self._generate_predictive_health_insights()
            
            return {
                "system_health": {
                    "level": system_health.value,
                    "score": round(overall_health_score, 2),
                    "status": self.system_status,
                    "uptime": self._calculate_uptime(),
                    "last_updated": datetime.utcnow().isoformat()
                },
                "governance_groups": group_health,
                "critical_issues": critical_issues,
                "system_metrics": self.system_metrics,
                "predictive_insights": predictive_insights,
                "recommendations": await self._get_health_recommendations(overall_health_score, critical_issues)
            }
            
        except Exception as e:
            logger.error(f"Failed to get system health overview: {e}")
            raise
    
    async def _generate_predictive_health_insights(self) -> List[Dict[str, Any]]:
        """Generate predictive insights about system health"""
        try:
            insights = []
            
            # Analyze trends in group performance
            for group_name, group in self.governance_groups.items():
                if len(group.metrics.get('health_history', [])) > 10:
                    # Predict future health based on trends
                    health_trend = self._analyze_health_trend(group.metrics['health_history'])
                    
                    if health_trend['direction'] == 'declining' and health_trend['confidence'] > 0.7:
                        insights.append({
                            "type": "predictive_warning",
                            "group": group_name,
                            "message": f"Health declining trend detected for {group_name}",
                            "confidence": health_trend['confidence'],
                            "estimated_impact_time": health_trend['estimated_critical_time'],
                            "recommended_actions": [
                                "Investigate recent configuration changes",
                                "Check resource utilization",
                                "Review error logs"
                            ]
                        })
            
            # System-wide predictions
            if self.system_metrics['failed_operations'] / max(self.system_metrics['total_operations'], 1) > 0.05:
                insights.append({
                    "type": "system_warning",
                    "message": "Elevated failure rate detected across system",
                    "confidence": 0.9,
                    "recommended_actions": [
                        "Review system logs for common error patterns",
                        "Check network connectivity between services",
                        "Validate system resource availability"
                    ]
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"Failed to generate predictive health insights: {e}")
            return []
    
    async def coordinate_system_update(
        self,
        update_type: str,
        update_data: Dict[str, Any],
        user_id: str,
        rollback_enabled: bool = True
    ) -> Dict[str, Any]:
        """
        Coordinate a system-wide update across all governance groups
        
        Features:
        - Dependency-aware update sequencing
        - Rollback capabilities
        - Health monitoring during updates
        - Zero-downtime updates where possible
        """
        try:
            update_id = str(uuid.uuid4())
            
            # Plan update sequence based on dependencies
            update_sequence = self._plan_update_sequence(update_type, update_data)
            
            # Create update workflow
            update_workflow = {
                "name": f"System Update - {update_type}",
                "description": f"Coordinated system update: {update_type}",
                "groups": [step["group"] for step in update_sequence],
                "steps": update_sequence,
                "metadata": {
                    "update_id": update_id,
                    "update_type": update_type,
                    "rollback_enabled": rollback_enabled,
                    "user_id": user_id
                }
            }
            
            # Execute update workflow
            workflow_id = await self.execute_cross_system_workflow(
                update_workflow,
                user_id,
                priority="high"
            )
            
            return {
                "update_id": update_id,
                "workflow_id": workflow_id,
                "status": "initiated",
                "sequence": update_sequence,
                "estimated_completion": self._estimate_update_completion(update_sequence),
                "rollback_enabled": rollback_enabled
            }
            
        except Exception as e:
            logger.error(f"Failed to coordinate system update: {e}")
            raise
    
    async def get_cross_system_analytics(
        self,
        analytics_type: str = "comprehensive",
        time_range: str = "24h",
        include_predictions: bool = True
    ) -> Dict[str, Any]:
        """
        Get comprehensive analytics across all governance groups
        
        Features:
        - Cross-system performance analysis
        - Usage patterns and trends
        - Efficiency metrics
        - Predictive analytics
        - ROI analysis
        """
        try:
            analytics_query = {
                "query_type": "cross_system",
                "data_sources": list(self.governance_groups.keys()),
                "time_range": time_range,
                "filters": {"analytics_type": analytics_type},
                "include_predictions": include_predictions
            }
            
            # Execute analytics through the comprehensive analytics service
            analytics_result = await self.analytics_service.execute_analytics_query(
                analytics_query,
                "system",
                use_cache=True
            )
            
            # Add coordination-specific insights
            coordination_insights = await self._generate_coordination_insights()
            
            return {
                "analytics_result": analytics_result.result_data,
                "coordination_insights": coordination_insights,
                "system_performance": await self._calculate_system_performance_metrics(),
                "efficiency_scores": await self._calculate_efficiency_scores(),
                "recommendations": await self._get_optimization_recommendations(),
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get cross-system analytics: {e}")
            raise
    
    async def optimize_system_performance(
        self,
        optimization_targets: List[str],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Execute system-wide performance optimization
        
        Features:
        - AI-powered optimization strategies
        - Resource reallocation
        - Workflow optimization
        - Predictive scaling
        """
        try:
            optimization_id = str(uuid.uuid4())
            
            # Analyze current performance
            current_performance = await self._analyze_current_performance()
            
            # Generate optimization strategies
            optimization_strategies = await self._generate_optimization_strategies(
                optimization_targets,
                current_performance
            )
            
            # Create optimization workflow
            optimization_workflow = {
                "name": "System Performance Optimization",
                "description": f"AI-powered optimization targeting: {', '.join(optimization_targets)}",
                "groups": list(self.governance_groups.keys()),
                "steps": optimization_strategies,
                "metadata": {
                    "optimization_id": optimization_id,
                    "targets": optimization_targets,
                    "user_id": user_id,
                    "baseline_performance": current_performance
                }
            }
            
            # Execute optimization
            workflow_id = await self.execute_cross_system_workflow(
                optimization_workflow,
                user_id,
                priority="medium"
            )
            
            return {
                "optimization_id": optimization_id,
                "workflow_id": workflow_id,
                "status": "started",
                "targets": optimization_targets,
                "strategies": optimization_strategies,
                "baseline_performance": current_performance,
                "estimated_improvement": await self._estimate_optimization_improvement(optimization_strategies)
            }
            
        except Exception as e:
            logger.error(f"Failed to optimize system performance: {e}")
            raise
    
    # Background processing loops
    
    async def _health_monitoring_loop(self):
        """Background loop for continuous health monitoring"""
        while True:
            try:
                # Check health of all governance groups
                for group_name, group in self.governance_groups.items():
                    await self._check_group_health(group_name, group)
                
                # Update overall system health
                await self._update_system_health()
                
                # Trigger recovery actions if needed
                await self._trigger_recovery_actions()
                
                await asyncio.sleep(self.config.health_check_interval_seconds)
                
            except Exception as e:
                logger.error(f"Health monitoring loop error: {e}")
                await asyncio.sleep(60)
    
    async def _cross_system_sync_loop(self):
        """Background loop for cross-system synchronization"""
        while True:
            try:
                # Synchronize data between governance groups
                await self._execute_cross_system_sync()
                
                # Update dependency mappings
                await self._update_dependency_mappings()
                
                # Validate data consistency
                await self._validate_cross_system_consistency()
                
                await asyncio.sleep(self.config.cross_system_sync_interval_seconds)
                
            except Exception as e:
                logger.error(f"Cross-system sync loop error: {e}")
                await asyncio.sleep(300)
    
    async def _workflow_execution_loop(self):
        """Background loop for executing cross-system workflows"""
        while True:
            try:
                # Process workflows from queue
                while self.workflow_queue and len(self.active_workflows) < self.config.max_concurrent_workflows:
                    workflow = self.workflow_queue.popleft()
                    asyncio.create_task(self._execute_workflow(workflow))
                
                # Clean up completed workflows
                await self._cleanup_completed_workflows()
                
                await asyncio.sleep(10)
                
            except Exception as e:
                logger.error(f"Workflow execution loop error: {e}")
                await asyncio.sleep(30)
    
    async def _metrics_collection_loop(self):
        """Background loop for collecting system metrics"""
        while True:
            try:
                # Collect metrics from all governance groups
                await self._collect_system_metrics()
                
                # Update performance indicators
                await self._update_performance_indicators()
                
                # Generate alerts if needed
                await self._check_metric_thresholds()
                
                await asyncio.sleep(self.config.metrics_collection_interval_seconds)
                
            except Exception as e:
                logger.error(f"Metrics collection loop error: {e}")
                await asyncio.sleep(120)
    
    async def _system_optimization_loop(self):
        """Background loop for continuous system optimization"""
        while True:
            try:
                # Analyze system performance patterns
                await self._analyze_performance_patterns()
                
                # Apply automatic optimizations
                await self._apply_automatic_optimizations()
                
                # Update optimization models
                await self._update_optimization_models()
                
                await asyncio.sleep(1800)  # Run every 30 minutes
                
            except Exception as e:
                logger.error(f"System optimization loop error: {e}")
                await asyncio.sleep(900)
    
    async def _predictive_maintenance_loop(self):
        """Background loop for predictive maintenance"""
        while True:
            try:
                if self.config.predictive_maintenance_enabled:
                    # Run predictive analysis
                    await self._run_predictive_analysis()
                    
                    # Schedule maintenance if needed
                    await self._schedule_predictive_maintenance()
                
                await asyncio.sleep(3600)  # Run every hour
                
            except Exception as e:
                logger.error(f"Predictive maintenance loop error: {e}")
                await asyncio.sleep(1800)
    
    # Helper methods
    
    def _calculate_uptime(self) -> str:
        """Calculate system uptime"""
        uptime_delta = datetime.utcnow() - self.system_metrics['system_uptime']
        days = uptime_delta.days
        hours, remainder = divmod(uptime_delta.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        return f"{days}d {hours}h {minutes}m"
    
    def _analyze_health_trend(self, health_history: List[float]) -> Dict[str, Any]:
        """Analyze health trend from historical data"""
        if len(health_history) < 5:
            return {"direction": "unknown", "confidence": 0.0}
        
        # Enterprise trend: robust slope via last-k window with noise reduction
        recent_values = health_history[-10:]
        try:
            import numpy as np
            y = np.array(recent_values, dtype=float)
            x = np.arange(len(y))
            # Simple moving average smoothing
            if len(y) >= 5:
                kernel = np.ones(3) / 3.0
                y_smooth = np.convolve(y, kernel, mode='valid')
                x_smooth = np.arange(len(y_smooth))
            else:
                y_smooth = y
                x_smooth = x
            # Least squares slope
            A = np.vstack([x_smooth, np.ones(len(x_smooth))]).T
            slope, _ = np.linalg.lstsq(A, y_smooth, rcond=None)[0]
            trend_slope = float(slope)
        except Exception:
            trend_slope = (recent_values[-1] - recent_values[0]) / max(1, len(recent_values))
        
        if trend_slope < -2:
            direction = "declining"
            confidence = min(abs(trend_slope) / 10, 1.0)
        elif trend_slope > 2:
            direction = "improving"
            confidence = min(trend_slope / 10, 1.0)
        else:
            direction = "stable"
            confidence = 1.0 - abs(trend_slope) / 10
        
        return {
            "direction": direction,
            "confidence": confidence,
            "trend_slope": trend_slope,
            "estimated_critical_time": self._estimate_critical_time(trend_slope, recent_values[-1])
        }
    
    def _estimate_critical_time(self, trend_slope: float, current_value: float) -> Optional[str]:
        """Estimate when health might reach critical levels"""
        if trend_slope >= 0:
            return None
        
        critical_threshold = 30.0
        time_to_critical = (current_value - critical_threshold) / abs(trend_slope)
        
        if time_to_critical > 0:
            estimated_time = datetime.utcnow() + timedelta(hours=time_to_critical)
            return estimated_time.isoformat()
        
        return None
    
    async def get_coordination_metrics(self) -> Dict[str, Any]:
        """Get comprehensive coordination metrics"""
        try:
            return {
                "system_metrics": self.system_metrics,
                "governance_groups": {
                    name: {
                        "status": group.status.value,
                        "health_score": group.health_score,
                        "metrics": group.metrics
                    }
                    for name, group in self.governance_groups.items()
                },
                "workflow_stats": {
                    "active_workflows": len(self.active_workflows),
                    "queued_workflows": len(self.workflow_queue),
                    "completed_workflows": len(self.completed_workflows)
                },
                "system_health": {
                    "level": self.system_health.value,
                    "uptime": self._calculate_uptime(),
                    "status": self.system_status
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get coordination metrics: {e}")
            raise