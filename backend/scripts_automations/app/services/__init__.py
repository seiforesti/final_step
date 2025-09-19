"""
Services Package

This package contains all business logic services for the PurSight Data Governance platform.
Services are organized by domain and provide the core functionality of the system.
"""

# Core Services
from .core_services import (
    BaseService,
    DatabaseService,
    CacheService,
    EventService
)

# Data Catalog Services
from .catalog_services import (
    DataSourceService,
    DataAssetService,
    SchemaDiscoveryService,
    LineageService,
    MetadataService
)

# Governance Services
from .governance_services import (
    PolicyService,
    ComplianceService,
    ClassificationService,
    SensitivityService,
    RetentionService
)

# Access Control Services
from .access_control_services import (
    AuthenticationService,
    AuthorizationService,
    UserService,
    RoleService,
    PermissionService
)

# Workflow Services
from .workflow_services import (
    WorkflowEngine,
    TaskExecutorService,
    ApprovalService,
    NotificationService
)

# Monitoring Services
from .monitoring_services import (
    AuditService,
    MetricsService,
    AlertService,
    HealthCheckService,
    PerformanceService
)

# Integration Services
from .integration_services import (
    ConnectorService,
    SyncService,
    ExternalSystemService,
    DataIngestionService,
    DataExportService
)

# Scan and Discovery Services
from .scan_services import (
    ScanOrchestrator,
    DiscoveryEngine,
    RuleEngineService,
    PatternMatchingService,
    DataProfilingService
)

# Analytics and ML Services
from .analytics_services import (
    AnalyticsService,
    MLService,
    PredictionService,
    RecommendationService,
    InsightsService
)

# Background Processing Services
from .background_services import (
    TaskQueueService,
    SchedulerService,
    BackgroundProcessor,
    JobManagerService
)

# Security Services
from .security_services import (
    EncryptionService,
    TokenService,
    SecurityScanService,
    ThreatDetectionService
)

__all__ = [
    # Core
    "BaseService", "DatabaseService", "CacheService", "EventService",
    
    # Data Catalog
    "DataSourceService", "DataAssetService", "SchemaDiscoveryService", 
    "LineageService", "MetadataService",
    
    # Governance
    "PolicyService", "ComplianceService", "ClassificationService", 
    "SensitivityService", "RetentionService",
    
    # Access Control
    "AuthenticationService", "AuthorizationService", "UserService", 
    "RoleService", "PermissionService",
    
    # Workflow
    "WorkflowEngine", "TaskExecutorService", "ApprovalService", "NotificationService",
    
    # Monitoring
    "AuditService", "MetricsService", "AlertService", "HealthCheckService", "PerformanceService",
    
    # Integration
    "ConnectorService", "SyncService", "ExternalSystemService", 
    "DataIngestionService", "DataExportService",
    
    # Scan and Discovery
    "ScanOrchestrator", "DiscoveryEngine", "RuleEngineService", 
    "PatternMatchingService", "DataProfilingService",
    
    # Analytics and ML
    "AnalyticsService", "MLService", "PredictionService", 
    "RecommendationService", "InsightsService",
    
    # Background Processing
    "TaskQueueService", "SchedulerService", "BackgroundProcessor", "JobManagerService",
    
    # Security
    "EncryptionService", "TokenService", "SecurityScanService", "ThreatDetectionService"
]