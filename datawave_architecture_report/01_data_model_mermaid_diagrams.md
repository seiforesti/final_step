# Data Model Architecture - Mermaid Diagrams

## 1. High-Level Entity Relationship Overview

```mermaid
graph TB
    %% Core Entities
    ORG[Organizations]
    DS[DataSources]
    CAT[CatalogItems]
    USR[Users]
    
    %% Governance Entities
    COMP[ComplianceRequirements]
    SCAN[ScanRules]
    WF[Workflows]
    
    %% Security Entities
    ROLE[Roles]
    PERM[Permissions]
    AUDIT[AuditLogs]
    
    %% AI/ML Entities
    ML[MLModels]
    AI[AIInsights]
    
    %% Relationships
    ORG --> DS
    ORG --> USR
    ORG --> COMP
    
    DS --> CAT
    DS --> SCAN
    
    CAT --> COMP
    CAT --> AI
    
    USR --> ROLE
    ROLE --> PERM
    
    WF --> SCAN
    WF --> COMP
    
    AUDIT --> USR
    AUDIT --> CAT
    AUDIT --> DS
    
    ML --> AI
    AI --> CAT
    
    %% Styling
    classDef coreEntity fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef govEntity fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef secEntity fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef aiEntity fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class ORG,DS,CAT,USR coreEntity
    class COMP,SCAN,WF govEntity
    class ROLE,PERM,AUDIT secEntity
    class ML,AI aiEntity
```

## 2. Catalog Domain Entity Relationship Diagram

```mermaid
erDiagram
    CATALOG_ITEM {
        int id PK
        string name
        enum type
        string description
        string schema_name
        string table_name
        string column_name
        enum classification
        string owner
        string steward
        float quality_score
        float popularity_score
        string data_type
        json metadata
        datetime created_at
        datetime updated_at
        int organization_id FK
        int data_source_id FK
    }
    
    CATALOG_LINEAGE {
        int id PK
        int source_item_id FK
        int target_item_id FK
        enum lineage_type
        json transformation_logic
        string confidence_score
        datetime created_at
        int created_by FK
    }
    
    CATALOG_TAGS {
        int id PK
        string name
        string description
        string color
        int organization_id FK
        datetime created_at
    }
    
    CATALOG_ITEM_TAGS {
        int catalog_item_id FK
        int tag_id FK
        datetime created_at
        int created_by FK
    }
    
    DATA_QUALITY_METRICS {
        int id PK
        int catalog_item_id FK
        float completeness_score
        float accuracy_score
        float consistency_score
        float timeliness_score
        json quality_rules
        datetime measured_at
        int measured_by FK
    }
    
    CATALOG_ITEM ||--o{ CATALOG_LINEAGE : "source"
    CATALOG_ITEM ||--o{ CATALOG_LINEAGE : "target"
    CATALOG_ITEM ||--o{ CATALOG_ITEM_TAGS : "has"
    CATALOG_TAGS ||--o{ CATALOG_ITEM_TAGS : "tagged"
    CATALOG_ITEM ||--o{ DATA_QUALITY_METRICS : "measured"
```

## 3. Compliance Domain Entity Relationship Diagram

```mermaid
erDiagram
    COMPLIANCE_REQUIREMENT {
        int id PK
        int organization_id FK
        int data_source_id FK
        enum framework
        string requirement_id
        string title
        string description
        enum severity
        json control_objectives
        json validation_rules
        enum status
        datetime created_at
        datetime updated_at
        int created_by FK
    }
    
    COMPLIANCE_ASSESSMENT {
        int id PK
        int requirement_id FK
        int data_source_id FK
        enum status
        float compliance_score
        json findings
        json remediation_plan
        datetime assessment_date
        datetime due_date
        int assessed_by FK
    }
    
    COMPLIANCE_RULE {
        int id PK
        int organization_id FK
        string name
        string description
        enum rule_type
        json rule_definition
        enum severity
        bool is_active
        json configuration
        datetime created_at
        datetime updated_at
        int created_by FK
    }
    
    COMPLIANCE_VIOLATION {
        int id PK
        int rule_id FK
        int data_source_id FK
        int catalog_item_id FK
        enum severity
        string description
        json violation_details
        enum status
        json remediation_actions
        datetime detected_at
        datetime resolved_at
        int resolved_by FK
    }
    
    COMPLIANCE_REQUIREMENT ||--o{ COMPLIANCE_ASSESSMENT : "assessed"
    COMPLIANCE_RULE ||--o{ COMPLIANCE_VIOLATION : "violated"
    COMPLIANCE_ASSESSMENT ||--|| COMPLIANCE_REQUIREMENT : "assesses"
    COMPLIANCE_VIOLATION ||--|| CATALOG_ITEM : "affects"
```

## 4. Security and RBAC Domain Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        int id PK
        string username UK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum status
        json preferences
        datetime last_login
        datetime created_at
        datetime updated_at
        int organization_id FK
    }
    
    ROLE {
        int id PK
        string name UK
        string description
        json permissions
        bool is_system_role
        datetime created_at
        datetime updated_at
        int organization_id FK
    }
    
    USER_ROLE {
        int user_id FK
        int role_id FK
        datetime assigned_at
        datetime expires_at
        int assigned_by FK
    }
    
    PERMISSION {
        int id PK
        string name UK
        string description
        string resource_type
        json allowed_actions
        datetime created_at
    }
    
    ROLE_PERMISSION {
        int role_id FK
        int permission_id FK
        json constraints
        datetime granted_at
        int granted_by FK
    }
    
    ACCESS_POLICY {
        int id PK
        string name
        string description
        json policy_document
        enum policy_type
        bool is_active
        int priority
        datetime created_at
        datetime updated_at
        int organization_id FK
    }
    
    AUDIT_LOG {
        int id PK
        int user_id FK
        string action
        string resource_type
        string resource_id
        json details
        string ip_address
        string user_agent
        datetime timestamp
        int organization_id FK
    }
    
    USER ||--o{ USER_ROLE : "has"
    ROLE ||--o{ USER_ROLE : "assigned"
    ROLE ||--o{ ROLE_PERMISSION : "has"
    PERMISSION ||--o{ ROLE_PERMISSION : "granted"
    USER ||--o{ AUDIT_LOG : "performed"
```

## 5. Multi-Tenancy Architecture Pattern

```mermaid
graph TB
    subgraph "Organization A"
        A_DS[DataSources A]
        A_CAT[Catalog A]
        A_USR[Users A]
        A_COMP[Compliance A]
    end
    
    subgraph "Organization B"
        B_DS[DataSources B]
        B_CAT[Catalog B]
        B_USR[Users B]
        B_COMP[Compliance B]
    end
    
    subgraph "Shared Resources"
        SHARED_ML[ML Models]
        SHARED_AI[AI Services]
        SHARED_AUDIT[System Audit]
    end
    
    subgraph "Data Isolation Layer"
        ROW_SECURITY[Row Level Security]
        TENANT_FILTER[Tenant Filtering]
        CROSS_TENANT[Cross-Tenant Policies]
    end
    
    A_DS --> ROW_SECURITY
    B_DS --> ROW_SECURITY
    
    ROW_SECURITY --> TENANT_FILTER
    TENANT_FILTER --> SHARED_ML
    TENANT_FILTER --> SHARED_AI
    
    CROSS_TENANT --> SHARED_AUDIT
    
    %% Styling
    classDef tenantA fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef tenantB fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef shared fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef isolation fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class A_DS,A_CAT,A_USR,A_COMP tenantA
    class B_DS,B_CAT,B_USR,B_COMP tenantB
    class SHARED_ML,SHARED_AI,SHARED_AUDIT shared
    class ROW_SECURITY,TENANT_FILTER,CROSS_TENANT isolation
```

## 6. Event Sourcing and CQRS Architecture

```mermaid
graph LR
    subgraph "Command Side"
        CMD[Commands]
        AGG[Aggregates]
        EVENTS[Event Store]
    end
    
    subgraph "Query Side"
        READ_DB[Read Database]
        PROJECTIONS[Projections]
        VIEWS[Materialized Views]
    end
    
    subgraph "Event Processing"
        EVENT_BUS[Event Bus]
        HANDLERS[Event Handlers]
        SNAPSHOTS[Snapshots]
    end
    
    CMD --> AGG
    AGG --> EVENTS
    EVENTS --> EVENT_BUS
    EVENT_BUS --> HANDLERS
    HANDLERS --> PROJECTIONS
    PROJECTIONS --> READ_DB
    PROJECTIONS --> VIEWS
    
    EVENTS --> SNAPSHOTS
    SNAPSHOTS --> AGG
    
    %% Styling
    classDef command fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef query fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef event fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class CMD,AGG,EVENTS command
    class READ_DB,PROJECTIONS,VIEWS query
    class EVENT_BUS,HANDLERS,SNAPSHOTS event
```

## 7. Physical Database Architecture

```mermaid
graph TB
    subgraph "Primary Database Cluster"
        MASTER[Master Node]
        REPLICA1[Read Replica 1]
        REPLICA2[Read Replica 2]
    end
    
    subgraph "Specialized Databases"
        SEARCH[Elasticsearch]
        CACHE[Redis Cache]
        TSDB[Time Series DB]
        GRAPH[Graph Database]
    end
    
    subgraph "Data Partitioning"
        ORG_PART[Organization Partitions]
        TIME_PART[Time-based Partitions]
        FUNC_PART[Functional Partitions]
    end
    
    MASTER --> REPLICA1
    MASTER --> REPLICA2
    
    MASTER --> ORG_PART
    ORG_PART --> TIME_PART
    TIME_PART --> FUNC_PART
    
    FUNC_PART --> SEARCH
    FUNC_PART --> CACHE
    FUNC_PART --> TSDB
    FUNC_PART --> GRAPH
    
    %% Styling
    classDef primary fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef specialized fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef partition fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class MASTER,REPLICA1,REPLICA2 primary
    class SEARCH,CACHE,TSDB,GRAPH specialized
    class ORG_PART,TIME_PART,FUNC_PART partition
```

## 8. Data Quality Framework Architecture

```mermaid
graph TB
    subgraph "Data Quality Dimensions"
        COMPLETENESS[Completeness]
        ACCURACY[Accuracy]
        CONSISTENCY[Consistency]
        TIMELINESS[Timeliness]
        VALIDITY[Validity]
        UNIQUENESS[Uniqueness]
    end
    
    subgraph "Quality Measurement"
        RULES[Quality Rules]
        METRICS[Quality Metrics]
        SCORES[Quality Scores]
    end
    
    subgraph "Quality Monitoring"
        ALERTS[Quality Alerts]
        REPORTS[Quality Reports]
        DASHBOARDS[Quality Dashboards]
    end
    
    COMPLETENESS --> RULES
    ACCURACY --> RULES
    CONSISTENCY --> RULES
    TIMELINESS --> RULES
    VALIDITY --> RULES
    UNIQUENESS --> RULES
    
    RULES --> METRICS
    METRICS --> SCORES
    
    SCORES --> ALERTS
    SCORES --> REPORTS
    SCORES --> DASHBOARDS
    
    %% Styling
    classDef dimension fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef measurement fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef monitoring fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class COMPLETENESS,ACCURACY,CONSISTENCY,TIMELINESS,VALIDITY,UNIQUENESS dimension
    class RULES,METRICS,SCORES measurement
    class ALERTS,REPORTS,DASHBOARDS monitoring
```

## 9. Database Scalability Architecture

```mermaid
graph LR
    subgraph "Horizontal Scaling"
        SHARD1[Shard 1]
        SHARD2[Shard 2]
        SHARD3[Shard 3]
    end
    
    subgraph "Load Distribution"
        ROUTER[Query Router]
        BALANCER[Load Balancer]
    end
    
    subgraph "Caching Layer"
        L1[L1 Cache]
        L2[L2 Cache]
        CDN[CDN Cache]
    end
    
    ROUTER --> SHARD1
    ROUTER --> SHARD2
    ROUTER --> SHARD3
    
    BALANCER --> ROUTER
    
    L1 --> L2
    L2 --> CDN
    CDN --> BALANCER
    
    %% Styling
    classDef shard fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef distribution fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef cache fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class SHARD1,SHARD2,SHARD3 shard
    class ROUTER,BALANCER distribution
    class L1,L2,CDN cache
```

## 10. Schema Evolution and Migration Strategy

```mermaid
graph TB
    subgraph "Version Control"
        V1[Version 1.0]
        V2[Version 2.0]
        V3[Version 3.0]
    end
    
    subgraph "Migration Process"
        BACKUP[Backup Creation]
        VALIDATE[Schema Validation]
        MIGRATE[Migration Execution]
        VERIFY[Migration Verification]
        ROLLBACK[Rollback Capability]
    end
    
    subgraph "Zero-Downtime"
        BLUE[Blue Environment]
        GREEN[Green Environment]
        SWITCH[Traffic Switch]
    end
    
    V1 --> V2
    V2 --> V3
    
    V2 --> BACKUP
    BACKUP --> VALIDATE
    VALIDATE --> MIGRATE
    MIGRATE --> VERIFY
    VERIFY --> ROLLBACK
    
    MIGRATE --> BLUE
    MIGRATE --> GREEN
    BLUE --> SWITCH
    GREEN --> SWITCH
    
    %% Styling
    classDef version fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef migration fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef deployment fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class V1,V2,V3 version
    class BACKUP,VALIDATE,MIGRATE,VERIFY,ROLLBACK migration
    class BLUE,GREEN,SWITCH deployment
```