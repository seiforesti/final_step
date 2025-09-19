"""
Data Models Package

This package contains all SQLAlchemy ORM models and Pydantic schemas
for the PurSight Data Governance platform.
"""

# Core Models
from .core_models import (
    BaseModel,
    TimestampMixin,
    SoftDeleteMixin,
    AuditMixin
)

# Entity Models
from .data_catalog_models import (
    DataAsset,
    DataSource,
    Schema,
    Table,
    Column,
    DataLineage
)

from .governance_models import (
    GovernancePolicy,
    ComplianceRule,
    DataClassification,
    SensitivityLabel,
    RetentionPolicy
)

from .access_control_models import (
    User,
    Role,
    Permission,
    UserRole,
    RolePermission,
    AccessRequest
)

from .workflow_models import (
    Workflow,
    WorkflowStep,
    WorkflowExecution,
    Task,
    TaskExecution
)

from .monitoring_models import (
    AuditLog,
    SystemMetric,
    PerformanceMetric,
    AlertRule,
    Alert
)

from .integration_models import (
    DataConnector,
    IntegrationConfig,
    SyncJob,
    ExternalSystem
)

# Scan and Discovery Models
from .scan_models import (
    ScanJob,
    ScanResult,
    ScanRule,
    ScanRuleSet,
    DiscoveryResult
)

# Analytics and ML Models
from .analytics_models import (
    DataProfile,
    QualityMetric,
    UsageStatistic,
    MLModel,
    Prediction
)

__all__ = [
    # Core
    "BaseModel", "TimestampMixin", "SoftDeleteMixin", "AuditMixin",
    
    # Data Catalog
    "DataAsset", "DataSource", "Schema", "Table", "Column", "DataLineage",
    
    # Governance
    "GovernancePolicy", "ComplianceRule", "DataClassification", 
    "SensitivityLabel", "RetentionPolicy",
    
    # Access Control
    "User", "Role", "Permission", "UserRole", "RolePermission", "AccessRequest",
    
    # Workflow
    "Workflow", "WorkflowStep", "WorkflowExecution", "Task", "TaskExecution",
    
    # Monitoring
    "AuditLog", "SystemMetric", "PerformanceMetric", "AlertRule", "Alert",
    
    # Integration
    "DataConnector", "IntegrationConfig", "SyncJob", "ExternalSystem",
    
    # Scan and Discovery
    "ScanJob", "ScanResult", "ScanRule", "ScanRuleSet", "DiscoveryResult",
    
    # Analytics and ML
    "DataProfile", "QualityMetric", "UsageStatistic", "MLModel", "Prediction"
]