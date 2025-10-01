# Backend Scripts Automation App - Complete Class Diagram

This document contains a comprehensive Mermaid class diagram for the `backend/scripts_automation/app/` directory, showing all major classes, their relationships, and the overall architecture of the Enterprise Data Governance Platform with Racine Main Manager.

## Architecture Overview

The application follows a layered architecture with:

- **Models Layer**: SQLModel/SQLAlchemy models for data persistence
- **Services Layer**: Business logic and orchestration services
- **API Layer**: FastAPI routes and controllers
- **Core Layer**: Configuration, security, and infrastructure
- **Racine Main Manager**: Advanced orchestration system

## Complete Class Diagram

```mermaid
    classDiagram
        %% ========================================
        %% CORE INFRASTRUCTURE LAYER
        %% ========================================

        class FastAPI {
            +title: str
            +version: str
            +description: str
            +include_router()
            +add_middleware()
            +on_event()
        }

        class DatabaseEngine {
            +create_engine()
            +get_connection_pool_status()
            +ensure_pool_capacity()
            +scale_up_engine()
        }

        class SessionLocal {
            +__call__()
            +close()
        }

        class SecurityManager {
            +get_auth()
            +verify_password()
            +create_access_token()
            +get_password_hash()
        }

        class ConfigManager {
            +settings: Settings
            +load_config()
            +get_database_url()
        }

        %% ========================================
        %% AUTHENTICATION & AUTHORIZATION MODELS
        %% ========================================

        class User {
            +id: int
            +email: str
            +hashed_password: str
            +is_active: bool
            +is_verified: bool
            +role: str
            +first_name: str
            +last_name: str
            +display_name: str
            +created_at: datetime
            +mfa_enabled: bool
            +organization_id: int
        }

        class Role {
            +id: int
            +name: str
            +description: str
            +permissions: List[Permission]
            +created_at: datetime
        }

        class Permission {
            +id: int
            +name: str
            +resource: str
            +action: str
            +created_at: datetime
        }

        class UserRole {
            +id: int
            +user_id: int
            +role_id: int
        }

        class UserGroup {
            +id: int
            +user_id: int
            +group_id: int
        }

        class Session {
            +id: int
            +user_id: int
            +token: str
            +expires_at: datetime
            +created_at: datetime
        }

        class EmailVerificationCode {
            +id: int
            +user_id: int
            +code: str
            +expires_at: datetime
            +created_at: datetime
        }

        %% ========================================
        %% DATA SOURCE MODELS
        %% ========================================

        class DataSource {
            +id: int
            +name: str
            +type: DataSourceType
            +connection_string: str
            +status: DataSourceStatus
            +environment: Environment
            +cloud_provider: CloudProvider
            +organization_id: int
            +created_at: datetime
            +updated_at: datetime
        }

        class DataSourceType {
            <<enumeration>>
            MYSQL
            POSTGRESQL
            MONGODB
            SNOWFLAKE
            S3
            REDIS
        }

        class DataSourceStatus {
            <<enumeration>>
            ACTIVE
            INACTIVE
            ERROR
            PENDING
            SYNCING
            MAINTENANCE
        }

        %% ========================================
        %% SCAN MODELS
        %% ========================================

        class Scan {
            +id: int
            +name: str
            +data_source_id: int
            +scan_type: str
            +status: ScanStatus
            +started_at: datetime
            +completed_at: datetime
            +created_by: int
            +organization_id: int
        }

        class ScanResult {
            +id: int
            +scan_id: int
            +table_name: str
            +column_name: str
            +data_type: str
            +classification: str
            +confidence_score: float
            +created_at: datetime
        }

        class ScanOrchestrationJob {
            +id: int
            +name: str
            +workflow_id: int
            +status: JobStatus
            +priority: int
            +scheduled_at: datetime
            +started_at: datetime
            +completed_at: datetime
            +created_by: int
        }

        class ScanWorkflowExecution {
            +id: int
            +job_id: int
            +step_id: int
            +status: ExecutionStatus
            +started_at: datetime
            +completed_at: datetime
            +error_message: str
            +metrics: Dict
        }

        %% ========================================
        %% COMPLIANCE MODELS
        %% ========================================

        class ComplianceRequirement {
            +id: int
            +organization_id: int
            +data_source_id: int
            +framework: ComplianceFramework
            +requirement_id: str
            +title: str
            +description: str
            +status: ComplianceStatus
            +created_at: datetime
        }

        class ComplianceValidation {
            +id: int
            +requirement_id: int
            +scan_id: int
            +status: ComplianceStatus
            +evidence: Dict
            +validated_at: datetime
            +validated_by: int
        }

        class ComplianceFramework {
            <<enumeration>>
            SOC2
            GDPR
            HIPAA
            PCI_DSS
            ISO27001
            NIST
            CCPA
            SOX
            CUSTOM
        }

        class ComplianceStatus {
            <<enumeration>>
            COMPLIANT
            NON_COMPLIANT
            PARTIALLY_COMPLIANT
            NOT_ASSESSED
            IN_PROGRESS
        }

        %% ========================================
        %% CLASSIFICATION MODELS
        %% ========================================

        class ClassificationRule {
            +id: int
            +name: str
            +type: ClassificationRuleType
            +pattern: str
            +sensitivity_level: SensitivityLevel
            +confidence_threshold: float
            +is_active: bool
            +created_by: int
            +organization_id: int
        }

        class DataClassification {
            +id: int
            +data_source_id: int
            +table_name: str
            +column_name: str
            +classification: SensitivityLevel
            +confidence_score: float
            +rule_id: int
            +created_at: datetime
        }

        class SensitivityLevel {
            <<enumeration>>
            PUBLIC
            INTERNAL
            CONFIDENTIAL
            RESTRICTED
            TOP_SECRET
            PII
            PHI
            PCI
            GDPR
            CCPA
            HIPAA
            SOX
            FINANCIAL
            INTELLECTUAL_PROPERTY
            TRADE_SECRET
            CUSTOMER_DATA
            EMPLOYEE_DATA
            PARTNER_DATA
        }

        class ClassificationRuleType {
            <<enumeration>>
            REGEX_PATTERN
            DICTIONARY_LOOKUP
            COLUMN_NAME_PATTERN
            TABLE_NAME_PATTERN
            DATA_TYPE_PATTERN
            VALUE_RANGE_PATTERN
            STATISTICAL_PATTERN
            METADATA_PATTERN
            COMPOSITE_PATTERN
            ML_INFERENCE
            AI_INFERENCE
        }

        %% ========================================
        %% CATALOG MODELS
        %% ========================================

        class CatalogItem {
            +id: int
            +name: str
            +type: CatalogItemType
            +description: str
            +schema_name: str
            +table_name: str
            +column_name: str
            +classification: DataClassification
            +owner: str
            +steward: str
            +quality_score: float
            +popularity_score: float
            +data_source_id: int
            +created_at: datetime
        }

        class CatalogItemType {
            <<enumeration>>
            DATABASE
            SCHEMA
            TABLE
            VIEW
            COLUMN
            INDEX
            PROCEDURE
            FUNCTION
        }

        class CatalogTag {
            +id: int
            +name: str
            +description: str
            +color: str
            +created_by: int
            +organization_id: int
        }

        class CatalogItemTag {
            +id: int
            +catalog_item_id: int
            +tag_id: int
            +created_at: datetime
        }

        %% ========================================
        %% ORGANIZATION MODELS
        %% ========================================

        class Organization {
            +id: int
            +name: str
            +description: str
            +domain: str
            +settings: Dict
            +created_at: datetime
            +updated_at: datetime
        }

        class OrganizationSetting {
            +id: int
            +organization_id: int
            +key: str
            +value: str
            +created_at: datetime
            +updated_at: datetime
        }

        %% ========================================
        %% RACINE MAIN MANAGER MODELS
        %% ========================================

        class RacineOrchestrationMaster {
            +id: int
            +name: str
            +description: str
            +status: OrchestrationStatus
            +workspace_id: int
            +created_by: int
            +created_at: datetime
            +updated_at: datetime
        }

        class RacineWorkspace {
            +id: int
            +name: str
            +description: str
            +owner_id: int
            +settings: Dict
            +created_at: datetime
            +updated_at: datetime
        }

        class RacineJobWorkflow {
            +id: int
            +name: str
            +description: str
            +workspace_id: int
            +template_id: int
            +status: WorkflowStatus
            +created_by: int
            +created_at: datetime
        }

        class RacinePipeline {
            +id: int
            +name: str
            +description: str
            +workspace_id: int
            +workflow_id: int
            +status: PipelineStatus
            +created_by: int
            +created_at: datetime
        }

        class RacineAIConversation {
            +id: int
            +workspace_id: int
            +user_id: int
            +title: str
            +context: Dict
            +created_at: datetime
            +updated_at: datetime
        }

        class RacineActivity {
            +id: int
            +workspace_id: int
            +user_id: int
            +action: str
            +resource_type: str
            +resource_id: int
            +details: Dict
            +created_at: datetime
        }

        class RacineDashboard {
            +id: int
            +name: str
            +workspace_id: int
            +layout: Dict
            +widgets: List[Dict]
            +created_by: int
            +created_at: datetime
        }

        class RacineCollaboration {
            +id: int
            +workspace_id: int
            +name: str
            +type: CollaborationType
            +participants: List[int]
            +created_by: int
            +created_at: datetime
        }

        class RacineCrossGroupIntegration {
            +id: int
            +name: str
            +source_group: str
            +target_group: str
            +integration_type: str
            +status: IntegrationStatus
            +config: Dict
            +created_at: datetime
        }

        %% ========================================
        %% SERVICE LAYER
        %% ========================================

        class AuthService {
            +create_user()
            +authenticate_user()
            +verify_token()
            +create_access_token()
            +get_current_user()
            +hash_password()
        }

        class DataSourceService {
            +create_data_source()
            +get_data_source()
            +update_data_source()
            +delete_data_source()
            +test_connection()
            +list_data_sources()
        }

        class ScanService {
            +create_scan()
            +execute_scan()
            +get_scan_results()
            +schedule_scan()
            +cancel_scan()
        }

        class ComplianceService {
            +create_requirement()
            +validate_compliance()
            +get_compliance_status()
            +generate_report()
            +update_requirement()
        }

        class ClassificationService {
            +create_rule()
            +classify_data()
            +get_classifications()
            +update_rule()
            +delete_rule()
        }

        class CatalogService {
            +create_catalog_item()
            +search_catalog()
            +update_catalog_item()
            +delete_catalog_item()
            +get_lineage()
        }

        class RacineOrchestrationService {
            +create_workspace()
            +create_workflow()
            +execute_workflow()
            +monitor_execution()
            +get_workspace_analytics()
        }

        class RacineWorkspaceService {
            +create_workspace()
            +add_member()
            +remove_member()
            +update_settings()
            +get_workspace_resources()
        }

        class RacineWorkflowService {
            +create_workflow()
            +execute_workflow()
            +schedule_workflow()
            +get_workflow_status()
            +cancel_workflow()
        }

        class RacinePipelineService {
            +create_pipeline()
            +execute_pipeline()
            +optimize_pipeline()
            +get_pipeline_metrics()
            +update_pipeline()
        }

        class RacineAIService {
            +create_conversation()
            +send_message()
            +get_recommendations()
            +learn_from_feedback()
            +get_insights()
        }

        class RacineActivityService {
            +log_activity()
            +get_activity_stream()
            +get_analytics()
            +create_alert()
            +get_audit_trail()
        }

        class RacineDashboardService {
            +create_dashboard()
            +add_widget()
            +update_layout()
            +get_dashboard_data()
            +share_dashboard()
        }

        class RacineCollaborationService {
            +create_session()
            +add_participant()
            +send_message()
            +share_document()
            +get_analytics()
        }

        class RacineIntegrationService {
            +create_integration()
            +test_connection()
            +sync_data()
            +monitor_health()
            +get_integration_status()
        }

        %% ========================================
        %% API ROUTES LAYER
        %% ========================================

        class AuthRoutes {
            +login()
            +logout()
            +register()
            +verify_email()
            +reset_password()
            +refresh_token()
        }

        class DataSourceRoutes {
            +create_data_source()
            +get_data_sources()
            +update_data_source()
            +delete_data_source()
            +test_connection()
        }

        class ScanRoutes {
            +create_scan()
            +execute_scan()
            +get_scan_results()
            +schedule_scan()
            +cancel_scan()
        }

        class ComplianceRoutes {
            +create_requirement()
            +validate_compliance()
            +get_compliance_status()
            +generate_report()
        }

        class ClassificationRoutes {
            +create_rule()
            +classify_data()
            +get_classifications()
            +update_rule()
        }

        class CatalogRoutes {
            +create_catalog_item()
            +search_catalog()
            +update_catalog_item()
            +get_lineage()
        }

        class RacineRoutes {
            +create_workspace()
            +create_workflow()
            +execute_workflow()
            +get_analytics()
            +collaborate()
        }

        %% ========================================
        %% MIDDLEWARE LAYER
        %% ========================================

        class CORSMiddleware {
            +process_request()
            +process_response()
        }

        class DatabaseCircuitBreakerMiddleware {
            +process_request()
            +handle_failure()
            +check_health()
        }

        class RateLimitingMiddleware {
            +process_request()
            +check_rate_limit()
            +update_usage()
        }

        class ErrorHandlingMiddleware {
            +process_request()
            +handle_error()
            +log_error()
        }

        class AuthenticationMiddleware {
            +process_request()
            +verify_token()
            +get_current_user()
        }

        %% ========================================
        %% RELATIONSHIPS
        %% ========================================

        %% Core Infrastructure
        FastAPI --> DatabaseEngine : uses
        FastAPI --> SecurityManager : uses
        FastAPI --> ConfigManager : uses
        DatabaseEngine --> SessionLocal : creates

        %% Authentication & Authorization
        User o-- UserRole : has
        User o-- UserGroup : belongs to
        User o-- Session : has
        User o-- EmailVerificationCode : has
        Role o-- UserRole : assigned to
        Role o-- Permission : has

        %% Data Sources
        User o-- DataSource : owns
        Organization o-- DataSource : contains
        DataSource o-- Scan : scanned by

        %% Scans
        DataSource o-- Scan : source for
        Scan o-- ScanResult : produces
        User o-- Scan : created by
        ScanOrchestrationJob o-- ScanWorkflowExecution : executes

        %% Compliance
        Organization o-- ComplianceRequirement : has
        DataSource o-- ComplianceRequirement : subject to
        ComplianceRequirement o-- ComplianceValidation : validated by
        Scan o-- ComplianceValidation : evidence for

        %% Classification
        User o-- ClassificationRule : created by
        Organization o-- ClassificationRule : contains
        ClassificationRule o-- DataClassification : produces
        DataSource o-- DataClassification : classified as

        %% Catalog
        DataSource o-- CatalogItem : contains
        CatalogItem o-- CatalogItemTag : tagged with
        CatalogTag o-- CatalogItemTag : applied to

        %% Organization
        Organization o-- OrganizationSetting : has
        User o-- Organization : belongs to

        %% Racine Main Manager
        User o-- RacineWorkspace : owns
        RacineWorkspace o-- RacineOrchestrationMaster : managed by
        RacineWorkspace o-- RacineJobWorkflow : contains
        RacineWorkspace o-- RacinePipeline : contains
        RacineWorkspace o-- RacineAIConversation : hosts
        RacineWorkspace o-- RacineActivity : tracks
        RacineWorkspace o-- RacineDashboard : displays
        RacineWorkspace o-- RacineCollaboration : enables
        RacineWorkspace o-- RacineCrossGroupIntegration : coordinates

        %% Service Layer Dependencies
        AuthService --> User : manages
        AuthService --> Role : manages
        AuthService --> Permission : manages
        DataSourceService --> DataSource : manages
        ScanService --> Scan : manages
        ScanService --> ScanResult : manages
        ComplianceService --> ComplianceRequirement : manages
        ComplianceService --> ComplianceValidation : manages
        ClassificationService --> ClassificationRule : manages
        ClassificationService --> DataClassification : manages
        CatalogService --> CatalogItem : manages
        CatalogService --> CatalogTag : manages

        %% Racine Services
        RacineOrchestrationService --> RacineOrchestrationMaster : manages
        RacineWorkspaceService --> RacineWorkspace : manages
        RacineWorkflowService --> RacineJobWorkflow : manages
        RacinePipelineService --> RacinePipeline : manages
        RacineAIService --> RacineAIConversation : manages
        RacineActivityService --> RacineActivity : manages
        RacineDashboardService --> RacineDashboard : manages
        RacineCollaborationService --> RacineCollaboration : manages
        RacineIntegrationService --> RacineCrossGroupIntegration : manages

        %% API Layer
        AuthRoutes --> AuthService : uses
        DataSourceRoutes --> DataSourceService : uses
        ScanRoutes --> ScanService : uses
        ComplianceRoutes --> ComplianceService : uses
        ClassificationRoutes --> ClassificationService : uses
        CatalogRoutes --> CatalogService : uses
        RacineRoutes --> RacineOrchestrationService : uses
        RacineRoutes --> RacineWorkspaceService : uses
        RacineRoutes --> RacineWorkflowService : uses
        RacineRoutes --> RacinePipelineService : uses
        RacineRoutes --> RacineAIService : uses
        RacineRoutes --> RacineActivityService : uses
        RacineRoutes --> RacineDashboardService : uses
        RacineRoutes --> RacineCollaborationService : uses
        RacineRoutes --> RacineIntegrationService : uses

        %% Middleware
        FastAPI --> CORSMiddleware : uses
        FastAPI --> DatabaseCircuitBreakerMiddleware : uses
        FastAPI --> RateLimitingMiddleware : uses
        FastAPI --> ErrorHandlingMiddleware : uses
        FastAPI --> AuthenticationMiddleware : uses
```

## Key Architecture Components

### 1. **Core Infrastructure Layer**

- **FastAPI**: Main application framework
- **DatabaseEngine**: Connection pooling and database management
- **SecurityManager**: Authentication and authorization
- **ConfigManager**: Configuration management

### 2. **Data Models Layer**

- **Authentication Models**: User, Role, Permission, Session management
- **Data Source Models**: DataSource with support for multiple database types
- **Scan Models**: Scan execution and result tracking
- **Compliance Models**: Regulatory compliance tracking
- **Classification Models**: Data sensitivity classification
- **Catalog Models**: Data asset cataloging
- **Organization Models**: Multi-tenant organization support
- **Racine Models**: Advanced orchestration and workspace management

### 3. **Service Layer**

- **Core Services**: AuthService, DataSourceService, ScanService, etc.
- **Racine Services**: Advanced orchestration services for workspace management, workflows, pipelines, AI, and collaboration

### 4. **API Layer**

- **Route Controllers**: RESTful API endpoints for all functionality
- **Racine Routes**: Advanced orchestration API endpoints

### 5. **Middleware Layer**

- **Security Middleware**: CORS, authentication, rate limiting
- **Infrastructure Middleware**: Circuit breakers, error handling, database health monitoring

## Racine Main Manager System

The Racine Main Manager is the revolutionary orchestration system that provides:

- **Workspace Management**: Multi-workspace environments with resource isolation
- **Workflow Orchestration**: Databricks-style workflow management
- **Pipeline Management**: Advanced data pipeline orchestration
- **AI Integration**: Context-aware AI assistant and recommendations
- **Activity Tracking**: Comprehensive audit trails and analytics
- **Dashboard System**: Intelligent dashboards with real-time data
- **Collaboration Hub**: Real-time collaboration and document sharing
- **Cross-Group Integration**: Seamless integration across all 7 core groups

## Enterprise Features

- **Multi-tenant Architecture**: Organization-based isolation
- **Advanced Security**: RBAC, MFA, OAuth integration
- **Scalable Infrastructure**: Connection pooling, circuit breakers, health monitoring
- **AI/ML Integration**: Intelligent classification and recommendations
- **Real-time Capabilities**: WebSocket support, live collaboration
- **Comprehensive Monitoring**: Performance metrics, health checks, audit trails

This architecture provides a robust, scalable, and enterprise-ready data governance platform that surpasses competitors like Databricks, Azure Purview, and other market leaders.
