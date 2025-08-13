"""
Racine Orchestration Models - Master Orchestration System
=========================================================

This module contains the core orchestration models for the Racine Main Manager system,
providing master orchestration and coordination across ALL 7 data governance groups:

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

All models are designed for seamless integration with existing backend implementations
while providing enterprise-grade scalability, performance, and security.
"""

from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from typing import List, Optional, Dict, Any, Union, Set, Tuple
from datetime import datetime, timedelta, timezone
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator, Field as PydanticField
from sqlalchemy import Index, UniqueConstraint, CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
import asyncio
from dataclasses import dataclass

# CRITICAL: Import ALL existing models for comprehensive integration
# Data Sources Group
from ..scan_models import DataSource, ScanRuleSet, Scan, ScanResult, ScanSchedule
from ..advanced_scan_rule_models import IntelligentScanRule, RuleExecutionHistory

# Classifications Group  
from ..classification_models import ClassificationRule, ClassificationResult
from ..scan_models import DataClassification

# Compliance Rules Group
from ..compliance_rule_models import ComplianceRule
from ..compliance_extended_models import ComplianceReport
# Note: EnterpriseComplianceRule and ComplianceRuleExecution are not defined
from ..compliance_extended_models import ComplianceAuditLog
# Note: ComplianceMetrics is not defined

# Advanced Catalog Group
from ..advanced_catalog_models import IntelligentDataAsset, EnterpriseDataLineage
# Note: CatalogMetadata is not defined
from ..catalog_models import CatalogItem, CatalogTag
from ..catalog_intelligence_models import IntelligenceInsight, AssetRecommendation

# Scan Logic Group
from ..scan_models import ScanOrchestrationJob
from ..scan_workflow_models import ScanWorkflowTemplate
# Note: UnifiedScanExecution is not defined
from ..scan_workflow_models import ScanWorkflow
from ..workflow_models import WorkflowExecution, WorkflowStep

# RBAC System Group
from ..auth_models import User, Role, Permission, UserRole, Group
from ..security_models import SecurityControl, SecurityVulnerability
from ..access_control_models import AccessControlResponse
# Note: AuditLog is not defined

# AI and Analytics Integration
from ..ai_models import AIModelConfiguration, AIInsight
# Note: MLPipeline and IntelligenceRecommendation are not defined
from ..analytics_models import AnalyticsInsight, AnalyticsAlert
# Note: PerformanceMetrics and UsageStatistics are not defined

# Workflow and Task Management
from ..workflow_models import Workflow
from ..scan_workflow_models import WorkflowTask
# Note: WorkflowInstance is not defined
from ..task_models import ScheduledTask, TaskExecution
# Note: TaskDependency is not defined

# Integration and Performance
from ..integration_models import Integration
# Note: IntegrationEndpoint, DataSync, and SystemIntegration are not defined
from ..performance_models import PerformanceMetric
# Note: PerformanceMonitor, ResourceUsage, and SystemMetrics are not defined

# ===================== ENUMS AND CONSTANTS =====================

class OrchestrationStatus(str, Enum):
    """Status of orchestration operations"""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    MAINTENANCE = "maintenance"
    INITIALIZING = "initializing"
    OPTIMIZING = "optimizing"

class OrchestrationPriority(str, Enum):
    """Priority levels for orchestration operations"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    BACKGROUND = "background"

class SystemHealthStatus(str, Enum):
    """Overall system health status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    MAINTENANCE = "maintenance"
    DEGRADED = "degraded"
    OFFLINE = "offline"

class GroupIntegrationStatus(str, Enum):
    """Status of individual group integrations"""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    SYNCING = "syncing"
    ERROR = "error"
    MAINTENANCE = "maintenance"
    INITIALIZING = "initializing"

class WorkflowExecutionStatus(str, Enum):
    """Status of workflow executions"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    RETRYING = "retrying"
    TIMEOUT = "timeout"

class ResourceType(str, Enum):
    """Types of system resources"""
    CPU = "cpu"
    MEMORY = "memory"
    STORAGE = "storage"
    NETWORK = "network"
    DATABASE = "database"
    CACHE = "cache"
    QUEUE = "queue"
    WORKER = "worker"

# ===================== CORE ORCHESTRATION MODELS =====================

class RacineOrchestrationMaster(SQLModel, table=True):
    """
    Master orchestration controller for all cross-group operations.
    
    This is the central hub that coordinates and manages all operations across
    the 7 data governance groups, providing unified control, monitoring, and
    optimization capabilities.
    
    Integration Points:
    - Connects to ALL existing group services and models
    - Manages cross-group workflows and dependencies
    - Monitors system health across all groups
    - Coordinates resource allocation and optimization
    - Provides unified audit trails and compliance tracking
    """
    __tablename__ = "racine_orchestration_master"

    # Primary identification
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="Unique identifier for orchestration master"
    )
    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        index=True,
        description="Human-readable name for orchestration instance"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Detailed description of orchestration purpose and scope"
    )
    
    # Orchestration configuration
    orchestration_type: str = Field(
        ...,
        index=True,
        description="Type of orchestration: workflow, pipeline, cross_group, maintenance"
    )
    status: OrchestrationStatus = Field(
        default=OrchestrationStatus.INITIALIZING,
        index=True,
        description="Current status of orchestration master"
    )
    priority: OrchestrationPriority = Field(
        default=OrchestrationPriority.MEDIUM,
        index=True,
        description="Priority level for resource allocation and scheduling"
    )
    
    # CRITICAL: Cross-group integration configuration
    connected_groups: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of connected group IDs (data_sources, scan_rule_sets, etc.)"
    )
    group_configurations: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Group-specific configuration settings and parameters"
    )
    cross_group_dependencies: Dict[str, List[str]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Inter-group dependencies and execution order"
    )
    integration_mappings: Dict[str, Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Mappings between different group resources and operations"
    )
    
    # Performance and monitoring
    performance_metrics: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Real-time performance metrics and KPIs"
    )
    health_status: SystemHealthStatus = Field(
        default=SystemHealthStatus.HEALTHY,
        index=True,
        description="Overall system health status"
    )
    last_health_check: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        description="Timestamp of last health check"
    )
    resource_allocation: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Current resource allocation across groups"
    )
    optimization_settings: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="AI-driven optimization settings and parameters"
    )
    
    # Execution tracking
    total_executions: int = Field(
        default=0,
        description="Total number of executions managed"
    )
    successful_executions: int = Field(
        default=0,
        description="Number of successful executions"
    )
    failed_executions: int = Field(
        default=0,
        description="Number of failed executions"
    )
    average_execution_time: float = Field(
        default=0.0,
        description="Average execution time in seconds"
    )
    
    # Error tracking and recovery
    error_count: int = Field(
        default=0,
        description="Total number of errors encountered"
    )
    last_error: Optional[str] = Field(
        default=None,
        description="Last error message encountered"
    )
    recovery_attempts: int = Field(
        default=0,
        description="Number of automatic recovery attempts"
    )
    recovery_settings: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Automatic recovery configuration"
    )
    
    # Security and compliance
    security_context: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Security context and access controls"
    )
    compliance_requirements: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of compliance requirements to enforce"
    )
    audit_settings: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Audit trail configuration and settings"
    )
    
    # Metadata and lifecycle
    tags: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Tags for categorization and search"
    )
    orchestration_metadata: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Additional metadata and custom properties"
    )
    
    # Audit fields
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Last update timestamp"
    )
    created_by: str = Field(
        ...,
        foreign_key="users.id",
        index=True,
        description="User who created this orchestration master"
    )
    last_modified_by: Optional[str] = Field(
        default=None,
        foreign_key="users.id",
        description="User who last modified this orchestration master"
    )
    
    # CRITICAL: Relationships with existing models across ALL groups
    
    # Data Sources relationships
    managed_data_sources: List["DataSource"] = Relationship(
        back_populates="racine_orchestrator",
        sa_relationship_kwargs={"lazy": "select"}
    )
    
    # Scan Rule Sets relationships  
    managed_scan_rules: List["IntelligentScanRule"] = Relationship(
        back_populates="racine_orchestrator",
        sa_relationship_kwargs={"lazy": "select"}
    )
    
    # Classifications relationships
    managed_classifications: List["ClassificationRule"] = Relationship(
        back_populates="racine_orchestrator", 
        sa_relationship_kwargs={"lazy": "select"}
    )
    
    # Compliance relationships
    managed_compliance_rules: List["EnterpriseComplianceRule"] = Relationship(
        back_populates="racine_orchestrator",
        sa_relationship_kwargs={"lazy": "select"}
    )
    
    # Catalog relationships
    managed_catalog_assets: List["IntelligentDataAsset"] = Relationship(
        back_populates="racine_orchestrator",
        sa_relationship_kwargs={"lazy": "select"}
    )
    
    # Scan Logic relationships
    managed_scan_jobs: List["ScanOrchestrationJob"] = Relationship(
        back_populates="racine_orchestrator",
        sa_relationship_kwargs={"lazy": "select"}
    )
    
    # User and RBAC relationships
    creator: "User" = Relationship(
        back_populates="created_orchestrations",
        sa_relationship_kwargs={"foreign_keys": "[RacineOrchestrationMaster.created_by]"}
    )
    modifier: Optional["User"] = Relationship(
        back_populates="modified_orchestrations",
        sa_relationship_kwargs={"foreign_keys": "[RacineOrchestrationMaster.last_modified_by]"}
    )
    
    # Racine-specific relationships
    workflow_executions: List["RacineWorkflowExecution"] = Relationship(
        back_populates="orchestration_master"
    )
    system_health_records: List["RacineSystemHealth"] = Relationship(
        back_populates="orchestration_master"
    )
    integration_records: List["RacineCrossGroupIntegration"] = Relationship(
        back_populates="orchestration_master"
    )
    performance_records: List["RacinePerformanceMetrics"] = Relationship(
        back_populates="orchestration_master"
    )
    error_logs: List["RacineErrorLog"] = Relationship(
        back_populates="orchestration_master"
    )

    # Database constraints and indexes
    __table_args__ = (
        Index("idx_orchestration_status_priority", "status", "priority"),
        Index("idx_orchestration_health_updated", "health_status", "updated_at"),
        Index("idx_orchestration_created_by", "created_by"),
        Index("idx_orchestration_type_status", "orchestration_type", "status"),
        CheckConstraint("total_executions >= 0", name="check_total_executions_positive"),
        CheckConstraint("successful_executions >= 0", name="check_successful_executions_positive"),
        CheckConstraint("failed_executions >= 0", name="check_failed_executions_positive"),
        CheckConstraint("error_count >= 0", name="check_error_count_positive"),
        UniqueConstraint("name", "created_by", name="unique_orchestration_name_per_user")
    )

class RacineWorkflowExecution(SQLModel, table=True):
    """
    Cross-group workflow execution tracking and management.
    
    Tracks the execution of complex workflows that span multiple groups,
    providing real-time monitoring, progress tracking, and result aggregation.
    """
    __tablename__ = "racine_workflow_execution"

    # Primary identification
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="Unique identifier for workflow execution"
    )
    orchestration_id: str = Field(
        foreign_key="racine_orchestration_master.id",
        index=True,
        description="Reference to parent orchestration master"
    )
    workflow_name: str = Field(
        ...,
        max_length=255,
        index=True,
        description="Name of the workflow being executed"
    )
    workflow_definition: Dict[str, Any] = Field(
        ...,
        sa_column=Column(JSONB),
        description="Complete workflow definition including steps and dependencies"
    )
    
    # Execution status and progress
    status: WorkflowExecutionStatus = Field(
        default=WorkflowExecutionStatus.PENDING,
        index=True,
        description="Current execution status"
    )
    current_step: int = Field(
        default=0,
        description="Current step being executed (0-based index)"
    )
    total_steps: int = Field(
        default=0,
        description="Total number of steps in workflow"
    )
    progress_percentage: float = Field(
        default=0.0,
        description="Execution progress as percentage (0-100)"
    )
    
    # Timing information
    start_time: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Workflow execution start time"
    )
    end_time: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Workflow execution end time"
    )
    estimated_completion: Optional[datetime] = Field(
        default=None,
        description="Estimated completion time based on current progress"
    )
    duration_seconds: Optional[float] = Field(
        default=None,
        description="Total execution duration in seconds"
    )
    
    # CRITICAL: Cross-group execution tracking
    involved_groups: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of groups involved in this workflow execution"
    )
    group_operations: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Operations executed per group with results"
    )
    step_executions: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Detailed execution information for each step"
    )
    
    # Integration results from ALL groups
    data_source_results: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Results from data source operations"
    )
    scan_rule_results: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Results from scan rule operations"
    )
    classification_results: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Results from classification operations"
    )
    compliance_results: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Results from compliance validation operations"
    )
    catalog_results: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Results from catalog management operations"
    )
    scan_logic_results: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Results from scan orchestration operations"
    )
    rbac_results: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Results from RBAC operations"
    )
    
    # Execution configuration and parameters
    parameters: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Execution parameters and configuration"
    )
    environment: str = Field(
        default="production",
        description="Execution environment (development, staging, production)"
    )
    resource_requirements: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Resource requirements for execution"
    )
    resource_usage: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Actual resource usage during execution"
    )
    
    # Error handling and recovery
    errors: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of errors encountered during execution"
    )
    warnings: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of warnings generated during execution"
    )
    retry_attempts: int = Field(
        default=0,
        description="Number of retry attempts made"
    )
    max_retries: int = Field(
        default=3,
        description="Maximum number of retry attempts allowed"
    )
    recovery_actions: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Recovery actions taken during execution"
    )
    
    # Monitoring and logging
    execution_logs: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Detailed execution logs and events"
    )
    performance_metrics: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Performance metrics collected during execution"
    )
    system_metrics: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="System-level metrics during execution"
    )
    
    # Output and results
    output_data: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Output data generated by workflow execution"
    )
    generated_artifacts: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of artifacts generated during execution"
    )
    execution_summary: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Human-readable summary of execution results"
    )
    
    # Trigger information
    triggered_by: str = Field(
        ...,
        foreign_key="users.id",
        index=True,
        description="User or system that triggered this execution"
    )
    trigger_type: str = Field(
        default="manual",
        description="Type of trigger: manual, scheduled, event, api"
    )
    trigger_context: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Additional context about the trigger"
    )
    
    # Audit fields
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        description="Last update timestamp"
    )
    
    # Relationships
    orchestration_master: "RacineOrchestrationMaster" = Relationship(
        back_populates="workflow_executions"
    )
    triggered_by_user: "User" = Relationship(
        back_populates="triggered_workflow_executions",
        sa_relationship_kwargs={"foreign_keys": "[RacineWorkflowExecution.triggered_by]"}
    )
    
    # Database constraints and indexes
    __table_args__ = (
        Index("idx_workflow_execution_status_created", "status", "created_at"),
        Index("idx_workflow_execution_orchestration_status", "orchestration_id", "status"),
        Index("idx_workflow_execution_triggered_by", "triggered_by"),
        Index("idx_workflow_execution_start_end", "start_time", "end_time"),
        CheckConstraint("current_step >= 0", name="check_current_step_positive"),
        CheckConstraint("total_steps >= 0", name="check_total_steps_positive"),
        CheckConstraint("progress_percentage >= 0 AND progress_percentage <= 100", name="check_progress_percentage_range"),
        CheckConstraint("retry_attempts >= 0", name="check_retry_attempts_positive"),
        CheckConstraint("max_retries >= 0", name="check_max_retries_positive")
    )

class RacineSystemHealth(SQLModel, table=True):
    """
    System-wide health monitoring and status tracking.
    
    Aggregates health information from all 7 groups and provides
    comprehensive system health monitoring, alerting, and reporting.
    """
    __tablename__ = "racine_system_health"

    # Primary identification
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="Unique identifier for health record"
    )
    orchestration_id: Optional[str] = Field(
        default=None,
        foreign_key="racine_orchestration_master.id",
        index=True,
        description="Reference to orchestration master (optional for global health)"
    )
    
    # Health status information
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
        description="Timestamp of health check"
    )
    overall_status: SystemHealthStatus = Field(
        default=SystemHealthStatus.HEALTHY,
        index=True,
        description="Overall system health status"
    )
    health_score: float = Field(
        default=100.0,
        description="Overall health score (0-100)"
    )
    
    # CRITICAL: Group-specific health status for ALL 7 groups
    data_sources_health: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Health status of data sources group"
    )
    scan_rule_sets_health: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Health status of scan rule sets group"
    )
    classifications_health: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Health status of classifications group"
    )
    compliance_rules_health: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Health status of compliance rules group"
    )
    advanced_catalog_health: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Health status of advanced catalog group"
    )
    scan_logic_health: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Health status of scan logic group"
    )
    rbac_system_health: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Health status of RBAC system group"
    )
    
    # System-wide metrics
    system_metrics: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="System-wide performance and resource metrics"
    )
    performance_metrics: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Performance metrics across all groups"
    )
    resource_usage: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Resource usage statistics"
    )
    
    # Alerts and recommendations
    active_alerts: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of active system alerts"
    )
    resolved_alerts: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of recently resolved alerts"
    )
    recommendations: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="AI-generated recommendations for system optimization"
    )
    
    # Health check details
    check_duration_ms: float = Field(
        default=0.0,
        description="Duration of health check in milliseconds"
    )
    checks_performed: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of health checks performed"
    )
    failed_checks: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="List of failed health checks"
    )
    
    # Trends and historical data
    health_trend: str = Field(
        default="stable",
        description="Health trend: improving, stable, degrading"
    )
    previous_status: Optional[SystemHealthStatus] = Field(
        default=None,
        description="Previous health status for comparison"
    )
    status_change_count: int = Field(
        default=0,
        description="Number of status changes in recent period"
    )
    
    # Audit fields
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Creation timestamp"
    )
    
    # Relationships
    orchestration_master: Optional["RacineOrchestrationMaster"] = Relationship(
        back_populates="system_health_records"
    )
    
    # Database constraints and indexes
    __table_args__ = (
        Index("idx_system_health_timestamp_status", "timestamp", "overall_status"),
        Index("idx_system_health_orchestration_timestamp", "orchestration_id", "timestamp"),
        Index("idx_system_health_score", "health_score"),
        CheckConstraint("health_score >= 0 AND health_score <= 100", name="check_health_score_range"),
        CheckConstraint("check_duration_ms >= 0", name="check_duration_positive"),
        CheckConstraint("status_change_count >= 0", name="check_status_change_count_positive")
    )

class RacineCrossGroupIntegration(SQLModel, table=True):
    """
    Cross-group integration management and coordination.
    
    Manages relationships, data flows, and synchronization between
    all 7 data governance groups, ensuring seamless integration
    and consistent operation across the entire system.
    """
    __tablename__ = "racine_cross_group_integration"

    # Primary identification
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="Unique identifier for integration record"
    )
    orchestration_id: str = Field(
        foreign_key="racine_orchestration_master.id",
        index=True,
        description="Reference to parent orchestration master"
    )
    integration_name: str = Field(
        ...,
        max_length=255,
        index=True,
        description="Human-readable name for integration"
    )
    
    # Integration configuration
    source_group: str = Field(
        ...,
        index=True,
        description="Source group for integration (data_sources, scan_rule_sets, etc.)"
    )
    target_group: str = Field(
        ...,
        index=True,
        description="Target group for integration"
    )
    integration_type: str = Field(
        ...,
        index=True,
        description="Type of integration: data_flow, event_trigger, api_call, workflow"
    )
    bidirectional: bool = Field(
        default=False,
        description="Whether integration is bidirectional"
    )
    
    # Configuration and mapping
    configuration: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Integration configuration settings"
    )
    mapping_rules: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Data mapping rules between groups"
    )
    transformation_rules: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Data transformation rules"
    )
    validation_rules: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Data validation rules"
    )
    
    # Status and monitoring
    status: GroupIntegrationStatus = Field(
        default=GroupIntegrationStatus.INITIALIZING,
        index=True,
        description="Current integration status"
    )
    last_sync: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Timestamp of last successful synchronization"
    )
    sync_frequency: str = Field(
        default="realtime",
        description="Synchronization frequency: realtime, hourly, daily, weekly"
    )
    next_sync: Optional[datetime] = Field(
        default=None,
        index=True,
        description="Timestamp of next scheduled synchronization"
    )
    
    # Performance and reliability metrics
    total_operations: int = Field(
        default=0,
        description="Total number of integration operations performed"
    )
    successful_operations: int = Field(
        default=0,
        description="Number of successful operations"
    )
    failed_operations: int = Field(
        default=0,
        description="Number of failed operations"
    )
    error_count: int = Field(
        default=0,
        description="Total number of errors encountered"
    )
    success_rate: float = Field(
        default=100.0,
        description="Success rate percentage"
    )
    average_response_time: float = Field(
        default=0.0,
        description="Average response time in milliseconds"
    )
    
    # Error tracking and recovery
    last_error: Optional[str] = Field(
        default=None,
        description="Last error message encountered"
    )
    error_history: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="History of errors and their resolutions"
    )
    recovery_attempts: int = Field(
        default=0,
        description="Number of automatic recovery attempts"
    )
    recovery_settings: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Automatic recovery configuration"
    )
    
    # Data flow tracking
    data_volume: int = Field(
        default=0,
        description="Total volume of data processed"
    )
    data_flow_metrics: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Detailed data flow metrics"
    )
    throughput_metrics: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Throughput and performance metrics"
    )
    
    # Security and compliance
    security_settings: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Security configuration for integration"
    )
    compliance_requirements: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Compliance requirements for this integration"
    )
    audit_trail: List[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Audit trail of integration activities"
    )
    
    # Metadata and configuration
    tags: List[str] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Tags for categorization and search"
    )
    integration_metadata: Dict[str, Any] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Additional metadata and custom properties"
    )
    
    # Audit fields
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Last update timestamp"
    )
    created_by: str = Field(
        ...,
        foreign_key="users.id",
        index=True,
        description="User who created this integration"
    )
    
    # Relationships
    orchestration_master: "RacineOrchestrationMaster" = Relationship(
        back_populates="integration_records"
    )
    creator: "User" = Relationship(
        back_populates="created_integrations",
        sa_relationship_kwargs={"foreign_keys": "[RacineCrossGroupIntegration.created_by]"}
    )
    
    # Database constraints and indexes
    __table_args__ = (
        Index("idx_integration_source_target", "source_group", "target_group"),
        Index("idx_integration_status_updated", "status", "updated_at"),
        Index("idx_integration_type_status", "integration_type", "status"),
        Index("idx_integration_sync_schedule", "last_sync", "next_sync"),
        CheckConstraint("total_operations >= 0", name="check_total_operations_positive"),
        CheckConstraint("successful_operations >= 0", name="check_successful_operations_positive"),
        CheckConstraint("failed_operations >= 0", name="check_failed_operations_positive"),
        CheckConstraint("success_rate >= 0 AND success_rate <= 100", name="check_success_rate_range"),
        CheckConstraint("average_response_time >= 0", name="check_response_time_positive"),
        UniqueConstraint("source_group", "target_group", "integration_name", name="unique_integration_per_groups")
    )

# ===================== SUPPORTING MODELS =====================

class RacinePerformanceMetrics(SQLModel, table=True):
    """Performance metrics collection and analysis."""
    __tablename__ = "racine_performance_metrics"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    orchestration_id: str = Field(foreign_key="racine_orchestration_master.id", index=True)
    metric_name: str = Field(..., index=True)
    metric_value: float = Field(...)
    metric_unit: str = Field(...)
    metric_category: str = Field(..., index=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)
    tags: Dict[str, str] = Field(default=None, sa_column=Column(JSONB))
    
    orchestration_master: "RacineOrchestrationMaster" = Relationship(back_populates="performance_records")

class RacineResourceAllocation(SQLModel, table=True):
    """Resource allocation and management tracking."""
    __tablename__ = "racine_resource_allocation"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    orchestration_id: str = Field(foreign_key="racine_orchestration_master.id", index=True)
    resource_type: ResourceType = Field(..., index=True)
    resource_name: str = Field(..., index=True)
    allocated_amount: float = Field(...)
    used_amount: float = Field(default=0.0)
    utilization_percentage: float = Field(default=0.0)
    allocation_time: datetime = Field(default_factory=datetime.utcnow, index=True)
    status: str = Field(default="active", index=True)

class RacineErrorLog(SQLModel, table=True):
    """Comprehensive error logging and tracking."""
    __tablename__ = "racine_error_log"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    orchestration_id: str = Field(foreign_key="racine_orchestration_master.id", index=True)
    error_code: str = Field(..., index=True)
    error_message: str = Field(...)
    error_category: str = Field(..., index=True)
    severity: str = Field(..., index=True)
    source_group: Optional[str] = Field(default=None, index=True)
    stack_trace: Optional[str] = Field(default=None)
    context: Dict[str, Any] = Field(default=None, sa_column=Column(JSONB))
    resolved: bool = Field(default=False, index=True)
    resolution_notes: Optional[str] = Field(default=None)
    occurred_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    resolved_at: Optional[datetime] = Field(default=None, index=True)
    
    orchestration_master: "RacineOrchestrationMaster" = Relationship(back_populates="error_logs")

class RacineIntegrationStatus(SQLModel, table=True):
    """Real-time integration status monitoring."""
    __tablename__ = "racine_integration_status"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    integration_id: str = Field(foreign_key="racine_cross_group_integration.id", index=True)
    status_check_time: datetime = Field(default_factory=datetime.utcnow, index=True)
    status: GroupIntegrationStatus = Field(..., index=True)
    response_time_ms: float = Field(...)
    error_message: Optional[str] = Field(default=None)
    health_score: float = Field(default=100.0)
    status_metadata: Dict[str, Any] = Field(default=None, sa_column=Column(JSONB))