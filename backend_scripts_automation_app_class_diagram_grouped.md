# Backend Scripts Automation App — Grouped Class Architecture (High Cohesion, Low Coupling)

This file provides two complementary visualizations:
- Flowchart with subgraphs to clearly group the seven domains and enforce low coupling via a central orchestrator.
- Per-group class diagrams with valid Mermaid class diagram syntax and multiplicities (no loops), showing high cohesion inside each group.

---

## A) System Grouping and Interactions (Subgraphs, No Loops)

```mermaid
flowchart TB
  %% Styling
  classDef hub fill:#1a237e,stroke:#0d133f,stroke-width:2px,color:#ffffff
  classDef core fill:#e6f7ff,stroke:#1565c0,color:#000000
  classDef auth fill:#fff3cd,stroke:#6c5ce7,color:#000000
  classDef ds fill:#e8f5e9,stroke:#2e7d32,color:#000000
  classDef scans fill:#ffebee,stroke:#d32f2f,color:#000000
  classDef classif fill:#fff8e1,stroke:#ff6f00,color:#000000
  classDef catalog fill:#e3f2fd,stroke:#1565c0,color:#000000
  classDef comp fill:#fce4ec,stroke:#ad1457,color:#000000
  classDef racine fill:#ede7f6,stroke:#512da8,color:#000000

  %% Central orchestrator hub to avoid tight coupling and loops
  subgraph HUB[Central Orchestrator Hub]
    direction TB
    racine_os[RacineOrchestrationService]
    racine_ws[RacineWorkspaceService]
    racine_wf[RacineWorkflowService]
    racine_pl[RacinePipelineService]
    racine_ai[RacineAIService]
    racine_act[RacineActivityService]
    racine_dash[RacineDashboardService]
    racine_collab[RacineCollaborationService]
    racine_int[RacineIntegrationService]
  end
  class HUB hub

  %% Core Infrastructure
  subgraph CORE[Core Infrastructure]
    direction TB
    FastAPI
    DatabaseEngine
    SessionLocal
    SecurityManager
    ConfigManager
    CORSMW[CORSMiddleware]
    DBCB[DatabaseCircuitBreakerMiddleware]
    RateLMW[RateLimitingMiddleware]
    ErrMW[ErrorHandlingMiddleware]
    AuthMW[AuthenticationMiddleware]
  end
  class CORE core

  %% Auth / RBAC
  subgraph AUTH[Authentication & RBAC]
    direction TB
    User
    Role
    Permission
    UserRole
    UserGroup
    Session
    EmailVerificationCode
    AuthService
  end
  class AUTH auth

  %% Data Sources
  subgraph DS[Data Sources]
    direction TB
    DataSource
    DataSourceService
    DataSourceType
    DataSourceStatus
  end
  class DS ds

  %% Scans
  subgraph SCAN[Scans]
    direction TB
    Scan
    ScanResult
    ScanService
    ScanOrchestrationJob
    ScanWorkflowExecution
  end
  class SCAN scans

  %% Classification
  subgraph CLASSIF[Classification]
    direction TB
    ClassificationRule
    DataClassification
    SensitivityLevel
    ClassificationRuleType
    ClassificationService
  end
  class CLASSIF classif

  %% Catalog
  subgraph CATALOG[Catalog]
    direction TB
    CatalogItem
    CatalogItemType
    CatalogTag
    CatalogItemTag
    CatalogService
  end
  class CATALOG catalog

  %% Compliance
  subgraph COMP[Compliance]
    direction TB
    ComplianceRequirement
    ComplianceValidation
    ComplianceFramework
    ComplianceStatus
    ComplianceService
  end
  class COMP comp

  %% Racine Domain Models
  subgraph RACINE[Racine Domain Models]
    direction TB
    RacineOrchestrationMaster
    RacineWorkspace
    RacineJobWorkflow
    RacinePipeline
    RacineAIConversation
    RacineActivity
    RacineDashboard
    RacineCollaboration
    RacineCrossGroupIntegration
  end
  class RACINE racine

  %% Hub routes all cross-domain communications (low coupling, no loops)
  FastAPI --> racine_os
  FastAPI --> AuthService
  FastAPI --> CatalogService
  FastAPI --> ClassificationService
  FastAPI --> ComplianceService
  FastAPI --> ScanService
  FastAPI --> DataSourceService

  %% Core dependencies
  FastAPI --> DatabaseEngine
  FastAPI --> SecurityManager
  FastAPI --> ConfigManager
  FastAPI --> CORSMW
  FastAPI --> DBCB
  FastAPI --> RateLMW
  FastAPI --> ErrMW
  FastAPI --> AuthMW

  %% Cross-group flows via HUB only
  DataSourceService --> racine_int
  ScanService --> racine_wf
  ClassificationService --> racine_ai
  CatalogService --> racine_os
  ComplianceService --> racine_os
  AuthService --> racine_ws

  %% Domain-to-domain allowed path through HUB (unidirectional)
  DataSourceService --> CATALOG
  CATALOG --> CLASSIF
  CLASSIF --> SCAN
  SCAN --> COMP
  COMP --> AUTH
  AUTH --> HUB
```

Notes:
- All cross-domain edges flow through the HUB or follow the documented unidirectional chain, eliminating loops.
- Subgraphs visually establish cohesion; HUB ensures low coupling.

---

## B) Per-Group Class Diagrams (Valid Multiplicities, No Loops)

### 1) Authentication & RBAC
```mermaid
classDiagram
  class User {+id:int +email:str +hashed_password:str +is_active:bool +organization_id:int}
  class Role {+id:int +name:str +description:str}
  class Permission {+id:int +name:str +resource:str +action:str}
  class UserRole {+id:int +user_id:int +role_id:int}
  class UserGroup {+id:int +user_id:int +group_id:int}
  class Session {+id:int +user_id:int +token:str +expires_at:datetime}
  class EmailVerificationCode {+id:int +user_id:int +code:str +expires_at:datetime}
  class AuthService

  AuthService "1" --> "0..*" User
  AuthService "1" --> "0..*" Role
  AuthService "1" --> "0..*" Permission
  User "0..*" --> "0..*" Role : has
  Role "0..*" --> "0..*" Permission : grants
  User "1" --> "0..*" Session : sessions
  User "1" --> "0..*" EmailVerificationCode : codes
```

### 2) Data Sources
```mermaid
classDiagram
  class DataSource {+id:int +name:str +type:DataSourceType +status:DataSourceStatus}
  class DataSourceType <<enumeration>>
  class DataSourceStatus <<enumeration>>
  class DataSourceService

  DataSourceService "1" --> "0..*" DataSource
  DataSource "1" --> "1" DataSourceType
  DataSource "1" --> "1" DataSourceStatus
```

### 3) Scans
```mermaid
classDiagram
  class Scan {+id:int +data_source_id:int +status:ScanStatus}
  class ScanResult {+id:int +scan_id:int +column_name:str +classification:str}
  class ScanService
  class ScanOrchestrationJob {+id:int +workflow_id:int +status:JobStatus}
  class ScanWorkflowExecution {+id:int +job_id:int +status:ExecutionStatus}

  ScanService "1" --> "0..*" Scan
  Scan "1" --> "0..*" ScanResult
  ScanOrchestrationJob "1" --> "0..*" ScanWorkflowExecution
```

### 4) Classification
```mermaid
classDiagram
  class ClassificationRule {+id:int +name:str +type:ClassificationRuleType}
  class DataClassification {+id:int +data_source_id:int +column_name:str +classification:SensitivityLevel}
  class SensitivityLevel <<enumeration>>
  class ClassificationRuleType <<enumeration>>
  class ClassificationService

  ClassificationService "1" --> "0..*" ClassificationRule
  ClassificationService "1" --> "0..*" DataClassification
  DataClassification "1" --> "1" SensitivityLevel
  ClassificationRule "1" --> "1" ClassificationRuleType
```

### 5) Catalog
```mermaid
classDiagram
  class CatalogItem {+id:int +type:CatalogItemType +data_source_id:int}
  class CatalogItemType <<enumeration>>
  class CatalogTag {+id:int +name:str}
  class CatalogItemTag {+id:int +catalog_item_id:int +tag_id:int}
  class CatalogService

  CatalogService "1" --> "0..*" CatalogItem
  CatalogItem "1" --> "1" CatalogItemType
  CatalogItem "1" --> "0..*" CatalogItemTag
  CatalogTag "1" --> "0..*" CatalogItemTag
```

### 6) Compliance
```mermaid
classDiagram
  class ComplianceRequirement {+id:int +framework:ComplianceFramework}
  class ComplianceValidation {+id:int +requirement_id:int +scan_id:int}
  class ComplianceFramework <<enumeration>>
  class ComplianceStatus <<enumeration>>
  class ComplianceService

  ComplianceService "1" --> "0..*" ComplianceRequirement
  ComplianceService "1" --> "0..*" ComplianceValidation
  ComplianceRequirement "1" --> "1" ComplianceFramework
  ComplianceValidation "1" --> "1" ComplianceStatus
```

### 7) Racine (Workspace/Orchestration)
```mermaid
classDiagram
  class RacineWorkspace {+id:int +name:str}
  class RacineOrchestrationMaster {+id:int +status:OrchestrationStatus}
  class RacineJobWorkflow {+id:int +workspace_id:int}
  class RacinePipeline {+id:int +workflow_id:int}
  class RacineAIConversation {+id:int +workspace_id:int}
  class RacineActivity {+id:int +workspace_id:int}
  class RacineDashboard {+id:int +workspace_id:int}
  class RacineCollaboration {+id:int +workspace_id:int}
  class RacineCrossGroupIntegration {+id:int +name:str}

  RacineWorkspace "1" --> "0..*" RacineJobWorkflow
  RacineWorkspace "1" --> "0..*" RacinePipeline
  RacineWorkspace "1" --> "0..*" RacineAIConversation
  RacineWorkspace "1" --> "0..*" RacineActivity
  RacineWorkspace "1" --> "0..*" RacineDashboard
  RacineWorkspace "1" --> "0..*" RacineCollaboration
  RacineWorkspace "1" --> "0..*" RacineCrossGroupIntegration
  RacineOrchestrationMaster "1" --> "0..*" RacineWorkspace
```

---

### Design Rules Enforced
- High cohesion: Subgraphs and per-group diagrams keep related classes together.
- Low coupling: Cross-domain communication goes via HUB; per-group class diagrams avoid cross edges.
- No loops: Flowchart edges are unidirectional; class diagrams only show intra-group relations.
- Correct multiplicities: Mermaid-compliant syntax with quotes (e.g., "1", "0..*").
