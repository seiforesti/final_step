from sqlmodel import SQLModel, Field, Relationship, Column, JSON, String, Text, Integer, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import ARRAY, Index, UniqueConstraint, CheckConstraint
from typing import List, Optional, Dict, Any, Union, Set, Tuple, TYPE_CHECKING
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
from pydantic import BaseModel, validator

# Forward references to avoid circular imports
if TYPE_CHECKING:
    from .advanced_scan_rule_models import EnhancedScanRuleSet
    from .catalog_models import CatalogItem
    from .integration_models import Integration
    from .racine_models.racine_orchestration_models import RacineOrchestrationMaster

# Import advanced scan rule models for interconnection
from .advanced_scan_rule_models import IntelligentScanRule, RuleExecutionHistory


class DataSourceType(str, Enum):
    """Supported data source types."""
    MYSQL = "mysql"
    POSTGRESQL = "postgresql"
    MONGODB = "mongodb"
    SNOWFLAKE = "snowflake"
    S3 = "s3"
    REDIS = "redis"


class CloudProvider(str, Enum):
    """Cloud provider types."""
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"


class DataSourceStatus(str, Enum):
    """Status of the data source."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"
    SYNCING = "syncing"
    MAINTENANCE = "maintenance"


class Environment(str, Enum):
    """Environment type for the data source."""
    PRODUCTION = "production"
    STAGING = "staging"
    DEVELOPMENT = "development"
    TEST = "test"


class Criticality(str, Enum):
    """Criticality level of the data source."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class DataClassification(str, Enum):
    """Data classification level."""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"


class ScanFrequency(str, Enum):
    """Frequency of automated scans."""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class DataSourceLocation(str, Enum):
    """Location type for the data source."""
    ON_PREM = "on_prem"
    CLOUD = "cloud"
    HYBRID = "hybrid"


class ScanStatus(str, Enum):
    """Status of a scan operation."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DiscoveryStatus(str, Enum):
    """Status of a discovery operation."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DataSource(SQLModel, table=True):
    """Enhanced model for registered data sources."""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    source_type: DataSourceType
    location: DataSourceLocation
    host: str
    port: int
    username: str
    # Password is stored as a reference to a secret manager
    password_secret: str
    # Secret manager type (local, vault, aws, azure)
    secret_manager_type: Optional[str] = Field(default="local")
    # Whether to use encryption for sensitive data
    use_encryption: bool = Field(default=False)
    database_name: Optional[str] = None
    
    # Enhanced cloud and hybrid configuration
    cloud_provider: Optional[CloudProvider] = None
    cloud_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    replica_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    ssl_config: Optional[Dict[str, str]] = Field(default=None, sa_column=Column(JSON))
    
    # Connection pool settings
    pool_size: Optional[int] = Field(default=5)
    max_overflow: Optional[int] = Field(default=10)
    pool_timeout: Optional[int] = Field(default=30)
    
    # Existing connection properties
    connection_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
        # Additional type-specific properties
    additional_properties: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    class Config:
        schema_extra = {
            "example": {
                "cloud_config": {
                    "azure": {
                        "tenant_id": "your-tenant-id",
                        "client_id": "your-client-id",
                        "client_secret": "your-client-secret",
                        "use_managed_identity": True,
                        "ssl_ca": "path/to/ca.pem",
                        "ssl_cert": "path/to/cert.pem",
                        "ssl_key": "path/to/key.pem"
                    },
                    "aws": {
                        "access_key_id": "your-access-key",
                        "secret_access_key": "your-secret-key",
                        "region": "us-east-1",
                        "use_iam_auth": True
                    }
                },
                "replica_config": {
                    "replica_host": "replica.example.com",
                    "replica_port": 5432,
                    "replica_set": "rs0",
                    "replica_members": [
                        "replica1.example.com:27017",
                        "replica2.example.com:27017"
                    ]
                },
                "ssl_config": {
                    "ssl_ca": "path/to/ca.pem",
                    "ssl_cert": "path/to/cert.pem",
                    "ssl_key": "path/to/key.pem"
                }
            }
        } 
    # Enhanced fields for advanced UI
    status: DataSourceStatus = Field(default=DataSourceStatus.PENDING)
    environment: Optional[Environment] = None
    criticality: Optional[Criticality] = Field(default=Criticality.MEDIUM)
    data_classification: Optional[DataClassification] = Field(default=DataClassification.INTERNAL)
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    owner: Optional[str] = None
    team: Optional[str] = None
    
    # Racine Orchestrator linkage
    racine_orchestrator_id: Optional[str] = Field(default=None, foreign_key="racine_orchestration_master.id", index=True)
    
    # Operational fields
    backup_enabled: bool = Field(default=False)
    monitoring_enabled: bool = Field(default=False)
    encryption_enabled: bool = Field(default=False)
    scan_frequency: Optional[ScanFrequency] = Field(default=ScanFrequency.WEEKLY)
    
    # Performance metrics (updated by background tasks)
    health_score: Optional[int] = Field(default=None, ge=0, le=100)
    compliance_score: Optional[int] = Field(default=None, ge=0, le=100)
    entity_count: Optional[int] = Field(default=0)
    size_gb: Optional[float] = Field(default=0.0)
    avg_response_time: Optional[int] = Field(default=None)  # in ms
    error_rate: Optional[float] = Field(default=0.0)
    uptime_percentage: Optional[float] = Field(default=100.0)
    connection_pool_size: Optional[int] = Field(default=10)
    active_connections: Optional[int] = Field(default=0)
    queries_per_second: Optional[int] = Field(default=0)
    storage_used_percentage: Optional[float] = Field(default=0.0)
    cost_per_month: Optional[float] = Field(default=0.0)
    
    # Timestamp fields
    last_scan: Optional[datetime] = None
    next_scan: Optional[datetime] = None
    last_backup: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # User tracking fields for RBAC
    created_by: Optional[str] = Field(default=None, max_length=255, index=True)
    updated_by: Optional[str] = Field(default=None, max_length=255, index=True)
    
    # Relationships
    scans: List["Scan"] = Relationship(back_populates="data_source")
    scan_rule_sets: List["ScanRuleSet"] = Relationship(back_populates="data_source")
    discovery_history: List["DiscoveryHistory"] = Relationship(back_populates="data_source")
    
    # **INTERCONNECTED: Compliance Relationships**
    compliance_rules: List["ComplianceRule"] = Relationship(
        back_populates="data_sources",
        sa_relationship_kwargs={"secondary": "compliance_rule_data_source_link"}
    )
    
    # **INTERCONNECTED: Catalog Integration**
    catalog_items: List["CatalogItem"] = Relationship(back_populates="data_source")
    
    # **INTERCONNECTED: Integration Management**
    integrations: List["Integration"] = Relationship(back_populates="data_source")
    
    # **INTERCONNECTED: Racine Orchestrator**
    racine_orchestrator: Optional["RacineOrchestrationMaster"] = Relationship(back_populates="managed_data_sources")

    def get_connection_uri(self) -> str:
        """Generate connection URI based on source type and location."""
        base_uri = ""
        if self.source_type == DataSourceType.MYSQL:
            base_uri = f"mysql+pymysql://{self.username}:{self.password_secret}@{self.host}:{self.port}/{self.database_name or ''}"
        elif self.source_type == DataSourceType.POSTGRESQL:
            base_uri = f"postgresql+psycopg2://{self.username}:{self.password_secret}@{self.host}:{self.port}/{self.database_name or ''}"
        elif self.source_type == DataSourceType.MONGODB:
            if self.location == DataSourceLocation.HYBRID and self.replica_config:
                # Handle replica set configuration
                hosts = [f"{self.host}:{self.port}"]
                if replica_members := self.replica_config.get("replica_members"):
                    hosts.extend(replica_members)
                hosts_str = ",".join(hosts)
                replica_set = self.replica_config.get("replica_set")
                base_uri = f"mongodb://{self.username}:{self.password_secret}@{hosts_str}/{self.database_name or ''}?replicaSet={replica_set}"
            else:
                base_uri = f"mongodb://{self.username}:{self.password_secret}@{self.host}:{self.port}/{self.database_name or ''}"
        else:
            raise ValueError(f"Unsupported data source type: {self.source_type}")

        # Add SSL configuration if present
        if self.ssl_config and self.location in [DataSourceLocation.CLOUD, DataSourceLocation.HYBRID]:
            ssl_params = []
            if ca_path := self.ssl_config.get("ssl_ca"):
                ssl_params.append(f"sslca={ca_path}")
            if cert_path := self.ssl_config.get("ssl_cert"):
                ssl_params.append(f"sslcert={cert_path}")
            if key_path := self.ssl_config.get("ssl_key"):
                ssl_params.append(f"sslkey={key_path}")
            
            if ssl_params:
                separator = "?" if "?" not in base_uri else "&"
                base_uri = f"{base_uri}{separator}{'&'.join(ssl_params)}"

        return base_uri


class DiscoveryHistory(SQLModel, table=True):
    """Model for tracking schema discovery operations."""
    id: Optional[int] = Field(default=None, primary_key=True)
    discovery_id: str = Field(index=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    status: DiscoveryStatus = Field(default=DiscoveryStatus.PENDING, index=True)
    discovery_time: datetime = Field(default_factory=datetime.utcnow, index=True)
    completed_time: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    tables_discovered: Optional[int] = None
    columns_discovered: Optional[int] = None
    error_message: Optional[str] = None
    discovery_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    triggered_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    discovery_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    # Relationships
    data_source: DataSource = Relationship(back_populates="discovery_history")


class ScanRuleSet(SQLModel, table=True):
    """Model for scan rule sets that define what to include/exclude during scans."""
    __tablename__ = "scanruleset"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    data_source_id: Optional[int] = Field(default=None, foreign_key="datasource.id")
    include_schemas: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    exclude_schemas: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    include_tables: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    exclude_tables: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    include_columns: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    exclude_columns: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    sample_data: bool = Field(default=False)  # Whether to sample actual data or just metadata
    sample_size: Optional[int] = Field(default=100)  # Number of rows to sample if sample_data is True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    data_source: Optional[DataSource] = Relationship(back_populates="scan_rule_sets")
    scans: List["Scan"] = Relationship(back_populates="scan_rule_set")
    
    # **INTERCONNECTED: Compliance Relationships**
    compliance_rules: List["ComplianceRule"] = Relationship(back_populates="scan_rule_set")
    
    # **INTERCONNECTED: Advanced Features Integration**
    enhanced_extensions: List["EnhancedScanRuleSet"] = Relationship(back_populates="primary_rule_set")


class Scan(SQLModel, table=True):
    """Model for scan operations"""
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_id: str = Field(unique=True)
    name: str
    description: Optional[str] = None
    data_source_id: int = Field(foreign_key="datasource.id")
    scan_rule_set_id: Optional[int] = Field(foreign_key="scanruleset.id")
    status: ScanStatus = Field(default=ScanStatus.PENDING)
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    
    # Relationships
    data_source: DataSource = Relationship(back_populates="scans")
    scan_rule_set: Optional[ScanRuleSet] = Relationship(back_populates="scans")
    scan_results: List["ScanResult"] = Relationship(back_populates="scan")


class ScanResult(SQLModel, table=True):
    """Model for storing scan results."""
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_id: int = Field(foreign_key="scan.id", index=True)
    schema_name: str
    table_name: str
    column_name: Optional[str] = None
    object_type: str = Field(default="table")  # table, view, stored_procedure
    classification_labels: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    sensitivity_level: Optional[str] = None
    compliance_issues: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    data_type: Optional[str] = None
    nullable: Optional[bool] = None
    scan_metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    scan: Scan = Relationship(back_populates="scan_results")


class CustomScanRuleBase(SQLModel):
    """Base model for custom scan rules."""
    name: str = Field(index=True)
    description: Optional[str] = None
    expression: str  # The rule logic/expression
    is_active: bool = Field(default=True)
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class CustomScanRule(CustomScanRuleBase, table=True):
    """DB model for custom scan rules."""
    id: Optional[int] = Field(default=None, primary_key=True)

class CustomScanRuleCreate(CustomScanRuleBase):
    """Schema for creating a custom scan rule."""
    pass

class CustomScanRuleUpdate(SQLModel):
    """Schema for updating a custom scan rule."""
    name: Optional[str] = None
    description: Optional[str] = None
    expression: Optional[str] = None
    is_active: Optional[bool] = None
    tags: Optional[List[str]] = None
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class ScanSchedule(SQLModel, table=True):
    """Model for scheduling recurring scans."""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    data_source_id: int = Field(foreign_key="datasource.id")
    scan_rule_set_id: int = Field(foreign_key="scanruleset.id")
    cron_expression: str  # Cron expression for scheduling
    enabled: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None

    # Enhanced response models
class DataSourceHealthResponse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str  # healthy, warning, critical
    last_checked: datetime
    latency_ms: Optional[int] = None
    error_message: Optional[str] = None
    recommendations: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    issues: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))

class DataSourceStatsResponse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    entity_stats: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    size_stats: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    last_scan_time: Optional[datetime] = None
    classification_stats: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    sensitivity_stats: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    compliance_stats: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    performance_stats: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    quality_stats: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

"""Add workspace models"""

class UserWorkspace(SQLModel, table=True):
    """Model for user workspaces"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    data_source_id: int = Field(foreign_key="datasource.id")
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WorkspaceItem(SQLModel, table=True):
    """Model for items in a workspace"""
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="userworkspace.id")
    item_type: str
    item_path: str
    item_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))

class WorkspacePreference(SQLModel, table=True):
    """Model for workspace preferences"""
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="userworkspace.id")
    preference_key: str
    preference_value: str

"""Add discovery history and workspace models"""

class UserFavorite(SQLModel, table=True):
    """Model for user-specific data source favorites."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QualityMetric(SQLModel, table=True):
    """Model for tracking data quality metrics."""
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    metric_type: str = Field(index=True)  # e.g., completeness, accuracy, consistency
    metric_value: float
    sample_size: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

class GrowthMetric(SQLModel, table=True):
    """Model for tracking data source growth over time."""
    id: Optional[int] = Field(default=None, primary_key=True)
    data_source_id: int = Field(foreign_key="datasource.id", index=True)
    size_bytes: int
    record_count: int
    measured_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    growth_rate_bytes: Optional[float] = None  # bytes per day
    growth_rate_records: Optional[float] = None  # records per day


# ===================== ENTERPRISE SCAN ORCHESTRATION MODELS =====================

class ScanOrchestrationStrategy(str, Enum):
    """Orchestration strategies for coordinated scanning"""
    SEQUENTIAL = "sequential"           # Execute scans one after another
    PARALLEL = "parallel"               # Execute scans in parallel  
    ADAPTIVE = "adaptive"               # AI-determined optimal strategy
    PRIORITY_BASED = "priority_based"   # Execute based on priority queues
    RESOURCE_AWARE = "resource_aware"   # Optimize based on available resources
    DEPENDENCY_AWARE = "dependency_aware"  # Handle dependencies between scans
    LOAD_BALANCED = "load_balanced"     # Balance load across systems

class ScanOrchestrationStatus(str, Enum):
    """Status of orchestration jobs"""
    PENDING = "pending"                 # Waiting to start
    PLANNING = "planning"               # Determining execution plan
    EXECUTING = "executing"             # Currently executing
    PAUSED = "paused"                  # Temporarily paused
    COMPLETED = "completed"             # Successfully completed
    FAILED = "failed"                  # Failed with errors
    CANCELLED = "cancelled"             # Manually cancelled
    TIMEOUT = "timeout"                # Exceeded time limits

class ScanWorkflowStatus(str, Enum):
    """Status of individual workflow steps"""
    QUEUED = "queued"                  # Queued for execution
    INITIALIZING = "initializing"       # Starting up
    RUNNING = "running"                # Currently running
    WAITING = "waiting"                # Waiting for dependencies
    COMPLETED = "completed"            # Successfully completed
    FAILED = "failed"                  # Failed with errors
    SKIPPED = "skipped"                # Skipped due to conditions
    RETRYING = "retrying"              # Being retried after failure

class ScanPriority(str, Enum):
    """Priority levels for scan operations"""
    CRITICAL = "critical"              # Immediate execution required
    HIGH = "high"                     # High priority
    NORMAL = "normal"                 # Standard priority
    LOW = "low"                       # Lower priority
    BACKGROUND = "background"          # Background processing only

class ResourceType(str, Enum):
    """Types of computational resources"""
    CPU = "cpu"                       # CPU cores
    MEMORY = "memory"                 # RAM memory
    STORAGE = "storage"               # Disk storage
    NETWORK = "network"               # Network bandwidth
    DATABASE = "database"             # Database connections
    CUSTOM = "custom"                 # Custom resource types


class EnhancedScanRuleSet(SQLModel, table=True):
    """
    Enhanced scan rule set with enterprise orchestration capabilities.
    Extends the basic ScanRuleSet model with advanced features for 
    coordinated multi-system scanning operations.
    """
    __tablename__ = "enhancedscanruleset"
    
    # Primary identification
    id: Optional[int] = Field(default=None, primary_key=True)
    primary_rule_set_id: Optional[int] = Field(foreign_key="scanruleset.id", index=True)
    rule_set_uuid: str = Field(index=True, unique=True, description="Unique identifier for rule set")
    
    # **INTERCONNECTED: Intelligent Rules Integration**
    intelligent_rule_ids: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    name: str = Field(index=True, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(sa_column=Column(Text))
    
    # Advanced Configuration
    rule_engine_version: str = Field(default="v2.0", max_length=20)
    optimization_enabled: bool = Field(default=True)
    ai_pattern_recognition: bool = Field(default=True)
    intelligent_sampling: bool = Field(default=False)
    adaptive_rules: bool = Field(default=False)
    
    # Performance and Resource Configuration
    max_parallel_threads: int = Field(default=4, ge=1, le=32)
    memory_limit_mb: Optional[int] = Field(default=None, ge=512, le=16384)
    timeout_minutes: int = Field(default=60, ge=1, le=1440)
    priority_level: ScanPriority = Field(default=ScanPriority.NORMAL)
    
    # Advanced Rule Logic
    advanced_conditions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    pattern_matching_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    ml_model_references: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    semantic_analysis_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality and Validation
    validation_rules: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    quality_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    accuracy_requirements: float = Field(default=0.85, ge=0.0, le=1.0)
    
    # Business Context
    business_criticality: str = Field(default="medium", max_length=20)
    compliance_requirements: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    cost_constraints: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    sla_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Performance Tracking
    execution_count: int = Field(default=0, ge=0)
    success_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    average_execution_time: float = Field(default=0.0, ge=0.0)
    total_data_processed: float = Field(default=0.0, ge=0.0)
    
    # Integration Points
    data_source_integrations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    classification_mappings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_integrations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    catalog_enrichment_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit and Compliance
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_status: str = Field(default="compliant", max_length=50)
    last_compliance_check: Optional[datetime] = None
    
    # Lifecycle Management
    version: str = Field(default="1.0.0", max_length=20)
    is_active: bool = Field(default=True, index=True)
    deprecation_date: Optional[datetime] = None
    replacement_rule_set_id: Optional[str] = None
    
    # Temporal Fields
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_optimized: Optional[datetime] = None
    created_by: Optional[str] = Field(max_length=255)
    updated_by: Optional[str] = Field(max_length=255)
    
    # Relationships
    primary_rule_set: Optional[ScanRuleSet] = Relationship(back_populates="enhanced_extensions")
    orchestration_jobs: List["ScanOrchestrationJob"] = Relationship(back_populates="enhanced_rule_set")
    intelligent_rules: List["IntelligentScanRule"] = Relationship(back_populates="enhanced_rule_set")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_enhanced_rule_set_performance', 'success_rate', 'average_execution_time'),
        Index('ix_enhanced_rule_set_business', 'business_criticality', 'priority_level'),
        CheckConstraint('accuracy_requirements >= 0.0 AND accuracy_requirements <= 1.0'),
    )


class ScanOrchestrationJob(SQLModel, table=True):
    """
    Master orchestration job that coordinates multiple scan operations
    across different data sources and rule sets with intelligent resource
    management and workflow automation.
    """
    __tablename__ = "scan_orchestration_jobs"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    orchestration_id: str = Field(index=True, unique=True)
    name: str = Field(max_length=255, index=True)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(sa_column=Column(Text))
    
    # Orchestration Configuration
    orchestration_strategy: ScanOrchestrationStrategy = Field(default=ScanOrchestrationStrategy.ADAPTIVE)
    status: ScanOrchestrationStatus = Field(default=ScanOrchestrationStatus.PENDING, index=True)
    priority: ScanPriority = Field(default=ScanPriority.NORMAL, index=True)
    
    # Enhanced Rule Set Association
    enhanced_rule_set_id: Optional[int] = Field(foreign_key="enhancedscanruleset.id", index=True)
    
    # **INTERCONNECTED: Racine Orchestrator Integration**
    racine_orchestrator_id: Optional[str] = Field(default=None, foreign_key="racine_orchestration_master.id", index=True)
    
    # Target Configuration
    target_data_sources: List[int] = Field(default_factory=list, sa_column=Column(JSON))
    target_schemas: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    target_tables: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    exclusion_patterns: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    
    # Execution Configuration
    max_concurrent_scans: int = Field(default=5, ge=1, le=50)
    retry_count: int = Field(default=3, ge=0, le=10)
    timeout_minutes: int = Field(default=120, ge=1, le=2880)
    failure_threshold: float = Field(default=0.1, ge=0.0, le=1.0)
    
    # Resource Management
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    allocated_resources: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    resource_usage_tracking: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Advanced Features
    ai_optimization_enabled: bool = Field(default=True)
    dynamic_scaling: bool = Field(default=False)
    predictive_resource_allocation: bool = Field(default=False)
    intelligent_error_recovery: bool = Field(default=True)
    adaptive_performance_tuning: bool = Field(default=False)
    
    # Workflow Configuration
    workflow_definition: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    conditional_execution: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    dependency_mapping: Dict[str, List[str]] = Field(default_factory=dict, sa_column=Column(JSON))
    approval_workflow: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution Tracking
    execution_plan: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    current_step: Optional[str] = Field(max_length=255)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    estimated_completion: Optional[datetime] = None
    
    # Timing Information
    scheduled_start: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    estimated_end: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    total_duration: Optional[float] = Field(ge=0.0)
    
    # Results and Metrics
    scans_planned: int = Field(default=0, ge=0)
    scans_completed: int = Field(default=0, ge=0)
    scans_failed: int = Field(default=0, ge=0)
    scans_skipped: int = Field(default=0, ge=0)
    total_records_processed: int = Field(default=0, ge=0)
    total_data_size_gb: float = Field(default=0.0, ge=0.0)
    
    # Quality Metrics
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0)
    completeness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    consistency_score: float = Field(default=0.0, ge=0.0, le=1.0)
    error_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Business Impact
    business_value_score: float = Field(default=0.0, ge=0.0, le=10.0)
    cost_actual: Optional[float] = Field(ge=0.0)
    cost_estimated: Optional[float] = Field(ge=0.0)
    roi_calculation: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Integration Results
    classification_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_validations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    catalog_enrichments: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_source_insights: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Error Handling and Recovery
    error_log: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    recovery_actions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    failure_analysis: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Notifications and Alerts
    notification_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    stakeholder_notifications: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Audit and Compliance
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_checks: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    security_validations: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # User and Context Information
    created_by: str = Field(max_length=255, index=True)
    modified_by: Optional[str] = Field(max_length=255)
    execution_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    tags: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    enhanced_rule_set: Optional[EnhancedScanRuleSet] = Relationship(back_populates="orchestration_jobs")
    racine_orchestrator: Optional["RacineOrchestrationMaster"] = Relationship(back_populates="managed_scan_jobs")
    workflow_executions: List["ScanWorkflowExecution"] = Relationship(back_populates="orchestration_job")
    resource_allocations: List["ScanResourceAllocation"] = Relationship(back_populates="orchestration_job")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_orchestration_status_priority', 'status', 'priority'),
        Index('ix_orchestration_performance', 'progress_percentage', 'accuracy_score'),
        Index('ix_orchestration_timing', 'scheduled_start', 'actual_start'),
        CheckConstraint('progress_percentage >= 0.0 AND progress_percentage <= 100.0'),
        CheckConstraint('failure_threshold >= 0.0 AND failure_threshold <= 1.0'),
    )


class ScanWorkflowExecution(SQLModel, table=True):
    """
    Individual workflow step execution within an orchestration job.
    Tracks detailed execution of each step in the scanning workflow.
    """
    __tablename__ = "scan_workflow_executions"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(index=True, unique=True)
    orchestration_job_id: int = Field(foreign_key="scan_orchestration_jobs.id", index=True)
    
    # Workflow Step Information
    step_name: str = Field(max_length=255, index=True)
    step_type: str = Field(max_length=100)  # scan, validation, enrichment, notification
    step_order: int = Field(ge=1, index=True)
    parent_step_id: Optional[int] = Field(foreign_key="scan_workflow_executions.id")
    
    # Execution Configuration
    step_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    input_parameters: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    expected_outputs: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    
    # Status and Progress
    status: ScanWorkflowStatus = Field(default=ScanWorkflowStatus.QUEUED, index=True)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    retry_attempt: int = Field(default=0, ge=0)
    max_retries: int = Field(default=3, ge=0)
    
    # Timing Information
    queued_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = Field(ge=0.0)
    
    # Resource Usage
    cpu_usage_percent: Optional[float] = Field(ge=0.0, le=100.0)
    memory_usage_mb: Optional[float] = Field(ge=0.0)
    network_io_mb: Optional[float] = Field(ge=0.0)
    storage_io_mb: Optional[float] = Field(ge=0.0)
    
    # Execution Results
    exit_code: Optional[int] = None
    output_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    generated_artifacts: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    performance_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Quality and Validation
    quality_score: float = Field(default=0.0, ge=0.0, le=1.0)
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    data_quality_checks: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Error Handling
    error_message: Optional[str] = Field(max_length=2000)
    error_details: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    warning_messages: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    recovery_actions_taken: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    
    # Dependencies and Conditions
    dependency_requirements: List[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    execution_conditions: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    conditional_skip_reason: Optional[str] = Field(max_length=500)
    
    # Business Context
    business_impact: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    cost_tracking: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    sla_compliance: bool = Field(default=True)
    
    # Integration Tracking
    data_source_interactions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    external_system_calls: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    api_interactions: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Audit Information
    execution_log: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    security_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    compliance_validations: Dict[str, bool] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Relationships
    orchestration_job: Optional[ScanOrchestrationJob] = Relationship(back_populates="workflow_executions")
    parent_step: Optional["ScanWorkflowExecution"] = Relationship()
    child_steps: List["ScanWorkflowExecution"] = Relationship()
    
    # Table Constraints
    __table_args__ = (
        Index('ix_workflow_execution_status', 'status', 'step_order'),
        Index('ix_workflow_execution_timing', 'started_at', 'completed_at'),
        Index('ix_workflow_execution_performance', 'duration_seconds', 'quality_score'),
    )


class ScanResourceAllocation(SQLModel, table=True):
    """
    Resource allocation tracking for scan orchestration jobs.
    Manages computational resources across different scan operations.
    """
    __tablename__ = "scan_resource_allocations"
    
    # Primary Identification
    id: Optional[int] = Field(default=None, primary_key=True)
    allocation_id: str = Field(index=True, unique=True)
    orchestration_job_id: int = Field(foreign_key="scan_orchestration_jobs.id", index=True)
    
    # Resource Identification
    resource_type: ResourceType = Field(index=True)
    resource_name: str = Field(max_length=255)
    resource_pool: str = Field(max_length=255, index=True)
    
    # Allocation Details
    allocated_amount: float = Field(ge=0.0)
    requested_amount: float = Field(ge=0.0)
    max_allocation: Optional[float] = Field(ge=0.0)
    allocation_unit: str = Field(max_length=50)  # cores, MB, GB, connections, etc.
    
    # Status and Timing
    allocation_status: str = Field(max_length=50, index=True)  # requested, allocated, active, released
    allocated_at: Optional[datetime] = None
    released_at: Optional[datetime] = None
    duration_minutes: Optional[float] = Field(ge=0.0)
    
    # Usage Tracking
    actual_usage: float = Field(default=0.0, ge=0.0)
    peak_usage: float = Field(default=0.0, ge=0.0)
    average_usage: float = Field(default=0.0, ge=0.0)
    usage_efficiency: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Cost Tracking
    cost_per_unit: Optional[float] = Field(ge=0.0)
    total_cost: Optional[float] = Field(ge=0.0)
    budget_allocated: Optional[float] = Field(ge=0.0)
    cost_optimization_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # Performance Metrics
    allocation_latency_ms: Optional[float] = Field(ge=0.0)
    resource_contention_score: float = Field(default=0.0, ge=0.0, le=1.0)
    availability_score: float = Field(default=1.0, ge=0.0, le=1.0)
    reliability_score: float = Field(default=1.0, ge=0.0, le=1.0)
    
    # Configuration and Constraints
    priority_level: int = Field(default=5, ge=1, le=10)
    resource_constraints: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    scaling_policy: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Monitoring and Alerting
    monitoring_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    alert_thresholds: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    performance_history: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Environment Context
    environment: str = Field(max_length=50)  # production, staging, development
    region: Optional[str] = Field(max_length=50)
    availability_zone: Optional[str] = Field(max_length=50)
    cluster_info: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Audit and Tracking
    requested_by: str = Field(max_length=255)
    approved_by: Optional[str] = Field(max_length=255)
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Temporal Management
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships
    orchestration_job: Optional[ScanOrchestrationJob] = Relationship(back_populates="resource_allocations")
    
    # Table Constraints
    __table_args__ = (
        Index('ix_resource_allocation_type_status', 'resource_type', 'allocation_status'),
        Index('ix_resource_allocation_usage', 'usage_efficiency', 'cost_optimization_score'),
        Index('ix_resource_allocation_performance', 'availability_score', 'reliability_score'),
        CheckConstraint('allocated_amount >= 0.0'),
        CheckConstraint('usage_efficiency >= 0.0 AND usage_efficiency <= 1.0'),
    )


# ===================== ENTERPRISE INTEGRATION MODELS =====================

class ScanClassificationIntegration(SQLModel, table=True):
    """
    Integration model linking scan results with classification outcomes.
    Bridges scan operations with the classification system.
    """
    __tablename__ = "scan_classification_integrations"
    
    # Primary Keys
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_result_id: int = Field(foreign_key="scanresult.id", index=True)
    classification_result_id: int = Field(index=True)  # Reference to classification system
    
    # Integration Configuration
    integration_type: str = Field(max_length=100)  # automatic, manual, ai_assisted
    confidence_score: float = Field(ge=0.0, le=1.0)
    integration_status: str = Field(max_length=50, index=True)
    
    # Results and Mappings
    classification_mappings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    sensitivity_labels: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    compliance_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    
    # Quality Metrics
    accuracy_score: float = Field(default=0.0, ge=0.0, le=1.0)
    validation_status: str = Field(default="pending", max_length=50)
    human_reviewed: bool = Field(default=False)
    
    # Temporal Tracking
    integrated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    # Table Constraints
    __table_args__ = (
        Index('ix_scan_classification_confidence', 'confidence_score', 'accuracy_score'),
        UniqueConstraint('scan_result_id', 'classification_result_id'),
    )


class ScanComplianceIntegration(SQLModel, table=True):
    """
    Integration model linking scan results with compliance validations.
    Ensures scan operations contribute to compliance monitoring.
    """
    __tablename__ = "scan_compliance_integrations"
    
    # Primary Keys
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_result_id: int = Field(foreign_key="scanresult.id", index=True)
    compliance_rule_id: int = Field(index=True)  # Reference to compliance system
    
    # Compliance Assessment
    compliance_status: str = Field(max_length=50, index=True)  # compliant, non_compliant, needs_review
    violation_severity: str = Field(max_length=50)  # low, medium, high, critical
    risk_score: float = Field(default=0.0, ge=0.0, le=10.0)
    
    # Validation Details
    validation_results: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    remediation_actions: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    exception_granted: bool = Field(default=False)
    exception_reason: Optional[str] = Field(max_length=1000)
    
    # Tracking Information
    assessed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    assessed_by: Optional[str] = Field(max_length=255)
    review_required: bool = Field(default=False)
    
    # Table Constraints
    __table_args__ = (
        Index('ix_scan_compliance_status_severity', 'compliance_status', 'violation_severity'),
        Index('ix_scan_compliance_risk', 'risk_score', 'review_required'),
    )


class ScanCatalogEnrichment(SQLModel, table=True):
    """
    Model for tracking catalog enrichments generated from scan results.
    Links scan discoveries with catalog entries for comprehensive data governance.
    """
    __tablename__ = "scan_catalog_enrichments"
    
    # Primary Keys
    id: Optional[int] = Field(default=None, primary_key=True)
    scan_result_id: int = Field(foreign_key="scanresult.id", index=True)
    catalog_entry_id: int = Field(index=True)  # Reference to data catalog system
    
    # Enrichment Details
    enrichment_type: str = Field(max_length=100)  # metadata, lineage, quality, usage
    enrichment_data: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    confidence_level: float = Field(ge=0.0, le=1.0)
    
    # Data Quality Contributions
    quality_metrics: Dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    completeness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    accuracy_indicators: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Business Value
    business_glossary_terms: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    usage_patterns: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    relationship_mappings: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Status and Validation
    enrichment_status: str = Field(default="active", max_length=50)
    validation_required: bool = Field(default=False)
    human_validated: bool = Field(default=False)
    
    # Temporal Management
    enriched_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_validated: Optional[datetime] = None
    
    # Table Constraints
    __table_args__ = (
        Index('ix_scan_catalog_type_confidence', 'enrichment_type', 'confidence_level'),
        Index('ix_scan_catalog_quality', 'completeness_score', 'validation_required'),
    )


# ===================== RESPONSE AND REQUEST MODELS =====================

class EnhancedScanRuleSetResponse(BaseModel):
    """Response model for enhanced scan rule sets"""
    id: int
    rule_set_uuid: str
    name: str
    display_name: Optional[str]
    description: Optional[str]
    rule_engine_version: str
    optimization_enabled: bool
    ai_pattern_recognition: bool
    priority_level: ScanPriority
    success_rate: float
    average_execution_time: float
    execution_count: int
    is_active: bool
    version: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ScanOrchestrationJobResponse(BaseModel):
    """Response model for orchestration jobs"""
    id: int
    orchestration_id: str
    name: str
    display_name: Optional[str]
    orchestration_strategy: ScanOrchestrationStrategy
    status: ScanOrchestrationStatus
    priority: ScanPriority
    progress_percentage: float
    scans_planned: int
    scans_completed: int
    scans_failed: int
    accuracy_score: float
    business_value_score: float
    created_at: datetime
    actual_start: Optional[datetime]
    estimated_completion: Optional[datetime]
    created_by: str
    
    class Config:
        from_attributes = True


class ScanOrchestrationJobCreate(BaseModel):
    """Request model for creating orchestration jobs"""
    name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = None
    orchestration_strategy: ScanOrchestrationStrategy = ScanOrchestrationStrategy.ADAPTIVE
    priority: ScanPriority = ScanPriority.NORMAL
    enhanced_rule_set_id: Optional[int] = None
    target_data_sources: List[int] = Field(min_items=1)
    max_concurrent_scans: Optional[int] = Field(default=5, ge=1, le=50)
    timeout_minutes: Optional[int] = Field(default=120, ge=1, le=2880)
    ai_optimization_enabled: Optional[bool] = True
    notification_config: Optional[Dict[str, Any]] = {}


class ScanWorkflowExecutionResponse(BaseModel):
    """Response model for workflow executions"""
    id: int
    execution_id: str
    step_name: str
    step_type: str
    step_order: int
    status: ScanWorkflowStatus
    progress_percentage: float
    retry_attempt: int
    duration_seconds: Optional[float]
    quality_score: float
    sla_compliance: bool
    queued_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# ===================== UTILITY MODELS AND FUNCTIONS =====================

class ScanPerformanceAnalytics(BaseModel):
    """Analytics model for scan performance metrics"""
    orchestration_id: str
    total_scans: int
    success_rate: float
    average_duration: float
    resource_efficiency: float
    cost_effectiveness: float
    quality_score: float
    business_value: float
    performance_trends: Dict[str, List[float]]
    bottleneck_analysis: Dict[str, Any]
    optimization_recommendations: List[str]


class ScanResourceOptimization(BaseModel):
    """Model for resource optimization recommendations"""
    resource_type: ResourceType
    current_allocation: float
    recommended_allocation: float
    optimization_potential: float
    cost_impact: float
    performance_impact: float
    confidence_score: float
    implementation_effort: str
    expected_roi: float


# ===================== ENTERPRISE SCAN RULE MODELS =====================

class ScanRule(SQLModel, table=True):
    """
    Enterprise-grade scan rule model for advanced data governance.
    
    This model represents a comprehensive scan rule that can be applied
    across multiple data sources and orchestration strategies.
    """
    __tablename__ = "scanrule"
    id: Optional[int] = Field(default=None, primary_key=True)
    rule_id: str = Field(unique=True, index=True, default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(index=True, max_length=255)
    display_name: Optional[str] = Field(max_length=255)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    rule_type: str = Field(index=True, max_length=100)  # classification, compliance, quality, security
    category: str = Field(index=True, max_length=100)
    subcategory: Optional[str] = Field(max_length=100)
    severity: str = Field(index=True, max_length=50)  # critical, high, medium, low, info
    priority: int = Field(default=5, ge=1, le=10)
    
    # Rule logic and configuration
    rule_expression: str = Field(sa_column=Column(Text))  # The actual rule logic
    rule_config: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    validation_rules: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    dependencies: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Advanced features
    ai_enhanced: bool = Field(default=False)
    machine_learning_enabled: bool = Field(default=False)
    adaptive_thresholds: bool = Field(default=False)
    real_time_monitoring: bool = Field(default=False)
    
    # Performance and resource management
    estimated_execution_time: Optional[int] = Field(default=None)  # seconds
    resource_requirements: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    concurrency_limit: Optional[int] = Field(default=None)
    timeout_seconds: Optional[int] = Field(default=None)
    
    # Compliance and governance
    compliance_frameworks: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    regulatory_requirements: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    audit_trail_required: bool = Field(default=True)
    data_retention_policy: Optional[str] = Field(max_length=255)
    
    # Integration capabilities
    supported_data_sources: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    supported_formats: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    api_endpoints: Optional[Dict[str, str]] = Field(default=None, sa_column=Column(JSON))
    webhook_config: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Status and lifecycle
    is_active: bool = Field(default=True, index=True)
    version: str = Field(default="1.0.0", max_length=20)
    status: str = Field(default="draft", index=True, max_length=50)  # draft, active, deprecated, archived
    approval_status: str = Field(default="pending", max_length=50)  # pending, approved, rejected
    
    # Metadata and tracking
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    rule_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    created_by: str = Field(index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_by: Optional[str] = Field(max_length=255)
    updated_at: Optional[datetime] = Field(default=None)
    last_executed: Optional[datetime] = Field(default=None)
    execution_count: int = Field(default=0)
    
    # Quality and performance metrics
    success_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    average_execution_time: Optional[float] = Field(default=None)
    false_positive_rate: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    accuracy_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Relationships
    rule_set_id: Optional[int] = Field(default=None, foreign_key="enhancedscanruleset.id")
    parent_rule_id: Optional[int] = Field(default=None, foreign_key="scanrule.id")
    
    class Config:
        arbitrary_types_allowed = True


class ScanExecution(SQLModel, table=True):
    """
    Enterprise-grade scan execution tracking model.
    
    This model tracks the execution of individual scan rules and provides
    comprehensive monitoring, analytics, and audit capabilities.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: str = Field(unique=True, index=True, default_factory=lambda: str(uuid.uuid4()))
    
    # Execution identification
    scan_id: Optional[str] = Field(index=True, max_length=255)
    rule_id: int = Field(foreign_key="scanrule.id", index=True)
    rule_set_id: Optional[int] = Field(foreign_key="enhancedscanruleset.id", index=True)
    orchestration_job_id: Optional[int] = Field(foreign_key="scan_orchestration_jobs.id", index=True)
    
    # Execution context
    data_source_id: Optional[int] = Field(foreign_key="datasource.id", index=True)
    environment: str = Field(index=True, max_length=50)  # production, staging, development, test
    execution_context: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution status and lifecycle
    status: str = Field(index=True, max_length=50)  # pending, running, completed, failed, cancelled, timeout
    phase: str = Field(index=True, max_length=50)  # initialization, execution, validation, cleanup
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    
    # Timing and performance
    scheduled_at: Optional[datetime] = Field(default=None)
    queued_at: Optional[datetime] = Field(default=None)
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[float] = Field(default=None)
    timeout_seconds: Optional[int] = Field(default=None)
    
    # Resource utilization
    cpu_usage: Optional[float] = Field(default=None)
    memory_usage: Optional[float] = Field(default=None)
    network_io: Optional[float] = Field(default=None)
    storage_io: Optional[float] = Field(default=None)
    resource_metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    
    # Execution results and output
    result_status: str = Field(default="unknown", max_length=50)  # success, failure, warning, error
    result_summary: Optional[str] = Field(sa_column=Column(Text))
    result_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    output_files: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    artifacts: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    # Error handling and retry logic
    error_message: Optional[str] = Field(sa_column=Column(Text))
    error_code: Optional[str] = Field(max_length=100)
    error_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    retry_count: int = Field(default=0)
    max_retries: int = Field(default=3)
    retry_delay_seconds: Optional[int] = Field(default=None)
    
    # Quality and validation
    quality_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    validation_results: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    compliance_status: Optional[str] = Field(max_length=50)
    sla_compliance: Optional[bool] = Field(default=None)
    
    # Monitoring and alerting
    alerts_triggered: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    notification_sent: bool = Field(default=False)
    escalation_level: Optional[str] = Field(max_length=50)
    
    # Audit and compliance
    audit_trail: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    compliance_frameworks: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    regulatory_requirements: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    
    # Metadata and tracking
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    execution_metadata: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSONB))
    created_by: str = Field(index=True, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: Optional[datetime] = Field(default=None)
    
    # Performance analytics
    performance_metrics: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    bottleneck_analysis: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSONB))
    optimization_recommendations: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    
    class Config:
        arbitrary_types_allowed = True


# ===================== MODEL REGISTRATION AND EXPORTS =====================

# Additional exports for enterprise scan orchestration
__all__ = [
    # Existing models (maintained for backward compatibility)
    "DataSourceType", "CloudProvider", "DataSourceStatus", "Environment",
    "Criticality", "DataClassification", "ScanFrequency", "DataSourceLocation",
    "ScanStatus", "DiscoveryStatus", "DataSource", "DiscoveryHistory",
    "ScanRuleSet", "Scan", "ScanResult", "CustomScanRuleBase", "CustomScanRule",
    "CustomScanRuleCreate", "CustomScanRuleUpdate", "ScanSchedule",
    "DataSourceHealthResponse", "DataSourceStatsResponse", "UserWorkspace",
    "WorkspaceItem", "WorkspacePreference", "UserFavorite", "QualityMetric",
    "GrowthMetric",
    
    # New enterprise models
    "ScanOrchestrationStrategy", "ScanOrchestrationStatus", "ScanWorkflowStatus",
    "ScanPriority", "ResourceType", "EnhancedScanRuleSet", "ScanOrchestrationJob",
    "ScanWorkflowExecution", "ScanResourceAllocation", "ScanClassificationIntegration",
    "ScanComplianceIntegration", "ScanCatalogEnrichment",
    
    # Enterprise scan rule models
    "ScanRule", "ScanExecution",
    
    # Response and request models
    "EnhancedScanRuleSetResponse", "ScanOrchestrationJobResponse",
    "ScanOrchestrationJobCreate", "ScanWorkflowExecutionResponse",
    
    # Utility models
    "ScanPerformanceAnalytics", "ScanResourceOptimization",
]