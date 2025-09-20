# Component Architecture Diagram

## Eraser.io Diagram Code

```eraser
title: PurSight Data Governance Platform - Component Architecture

// Frontend Layer
group frontend-layer [color: lightblue] {
  component react-ui [icon: react] {
    label: "React Frontend"
    description: "User Interface Layer"
  }
  component websocket-client [icon: websocket] {
    label: "WebSocket Client"
    description: "Real-time Communication"
  }
}

// API Gateway Layer
group api-gateway-layer [color: lightgreen] {
  component api-gateway [icon: gateway] {
    label: "FastAPI Gateway"
    description: "Request Routing & Middleware"
  }
  component auth-middleware [icon: shield] {
    label: "Authentication Middleware"
    description: "JWT Token Validation"
  }
  component rate-limiter [icon: throttle] {
    label: "Rate Limiter"
    description: "API Rate Limiting"
  }
  component cors-handler [icon: globe] {
    label: "CORS Handler"
    description: "Cross-Origin Requests"
  }
}

// Racine Main Manager Layer
group racine-layer [color: gold] {
  component orchestration-master [icon: conductor] {
    label: "Orchestration Master"
    description: "Cross-Group Coordination"
  }
  component workspace-manager [icon: workspace] {
    label: "Workspace Manager"
    description: "Multi-Tenant Workspaces"
  }
  component workflow-engine [icon: flow-chart] {
    label: "Workflow Engine"
    description: "Databricks-style Workflows"
  }
  component pipeline-optimizer [icon: pipeline] {
    label: "Pipeline Optimizer"
    description: "AI-Driven Optimization"
  }
  component ai-assistant [icon: brain] {
    label: "AI Assistant"
    description: "Context-Aware Intelligence"
  }
  component activity-tracker [icon: activity] {
    label: "Activity Tracker"
    description: "Comprehensive Audit Trail"
  }
  component dashboard-engine [icon: dashboard] {
    label: "Dashboard Engine"
    description: "Real-time Analytics"
  }
  component collaboration-hub [icon: collaboration] {
    label: "Collaboration Hub"
    description: "Real-time Team Features"
  }
  component integration-manager [icon: integration] {
    label: "Integration Manager"
    description: "External System Integration"
  }
}

// Core Services Layer
group core-services-layer [color: orange] {
  component auth-service [icon: lock] {
    label: "Authentication Service"
    description: "User & Session Management"
  }
  component data-source-service [icon: database-connect] {
    label: "Data Source Service"
    description: "Connection Management"
  }
  component compliance-service [icon: compliance] {
    label: "Compliance Service"
    description: "Regulatory Validation"
  }
  component classification-service [icon: classifier] {
    label: "Classification Service"
    description: "Data Classification & Labeling"
  }
  component catalog-service [icon: catalog] {
    label: "Catalog Service"
    description: "Metadata Management"
  }
  component scan-service [icon: scanner] {
    label: "Scan Service"
    description: "Data Discovery & Scanning"
  }
  component rbac-service [icon: access-control] {
    label: "RBAC Service"
    description: "Role-Based Access Control"
  }
}

// Data Access Layer
group data-access-layer [color: lightcoral] {
  component orm-layer [icon: database-orm] {
    label: "ORM Layer (SQLModel)"
    description: "Object-Relational Mapping"
  }
  component cache-manager [icon: cache] {
    label: "Cache Manager"
    description: "Redis Cache Operations"
  }
  component connection-pool [icon: pool] {
    label: "Connection Pool"
    description: "Database Connection Management"
  }
  component query-optimizer [icon: optimize] {
    label: "Query Optimizer"
    description: "SQL Query Optimization"
  }
}

// Storage Layer
group storage-layer [color: lightgray] {
  database postgres [icon: postgresql] {
    label: "PostgreSQL Database"
    description: "Primary Data Store"
  }
  cache redis [icon: redis] {
    label: "Redis Cache"
    description: "Session & Cache Store"
  }
  storage blob-storage [icon: blob] {
    label: "Blob Storage"
    description: "File & Document Storage"
  }
  storage file-system [icon: filesystem] {
    label: "File System"
    description: "Local File Storage"
  }
}

// External Systems
group external-systems [color: lightyellow] {
  service azure-ad [icon: azure-ad] {
    label: "Azure Active Directory"
    description: "Identity Provider"
  }
  service azure-purview [icon: purview] {
    label: "Azure Purview"
    description: "Data Governance Platform"
  }
  service databricks [icon: databricks] {
    label: "Azure Databricks"
    description: "Analytics Platform"
  }
  service spark [icon: spark] {
    label: "Apache Spark"
    description: "Big Data Processing"
  }
}

// Component Connections
react-ui --> api-gateway
websocket-client --> api-gateway

api-gateway --> auth-middleware
api-gateway --> rate-limiter
api-gateway --> cors-handler
auth-middleware --> orchestration-master

orchestration-master --> workspace-manager
orchestration-master --> workflow-engine
orchestration-master --> pipeline-optimizer
orchestration-master --> ai-assistant
orchestration-master --> activity-tracker
orchestration-master --> dashboard-engine
orchestration-master --> collaboration-hub
orchestration-master --> integration-manager

workspace-manager --> auth-service
workspace-manager --> data-source-service
workspace-manager --> compliance-service
workspace-manager --> classification-service
workspace-manager --> catalog-service
workspace-manager --> scan-service
workspace-manager --> rbac-service

auth-service --> orm-layer
data-source-service --> orm-layer
compliance-service --> orm-layer
classification-service --> orm-layer
catalog-service --> orm-layer
scan-service --> orm-layer
rbac-service --> orm-layer

orchestration-master --> cache-manager
collaboration-hub --> cache-manager

orm-layer --> connection-pool
orm-layer --> query-optimizer
cache-manager --> redis
connection-pool --> postgres
query-optimizer --> postgres

scan-service --> blob-storage
catalog-service --> blob-storage
data-source-service --> file-system

integration-manager --> azure-ad
integration-manager --> azure-purview
integration-manager --> databricks
integration-manager --> spark
```

## Component Description

This component architecture diagram shows the detailed internal structure of the PurSight Data Governance Platform, illustrating how different components interact within each layer:

### Layer Breakdown:

#### 1. Frontend Layer (Light Blue)
- **React UI**: Main user interface built with React and TypeScript
- **WebSocket Client**: Handles real-time communication for collaboration features

#### 2. API Gateway Layer (Light Green)
- **FastAPI Gateway**: Central request router and API orchestrator
- **Authentication Middleware**: JWT token validation and user context
- **Rate Limiter**: API throttling and abuse prevention
- **CORS Handler**: Cross-origin request management

#### 3. Racine Main Manager Layer (Gold)
- **Orchestration Master**: Central coordinator for all cross-group operations
- **Workspace Manager**: Multi-tenant workspace isolation and management
- **Workflow Engine**: Databricks-style workflow orchestration
- **Pipeline Optimizer**: AI-driven pipeline performance optimization
- **AI Assistant**: Context-aware intelligent assistance and recommendations
- **Activity Tracker**: Comprehensive audit trail and activity monitoring
- **Dashboard Engine**: Real-time analytics and visualization
- **Collaboration Hub**: Real-time team collaboration features
- **Integration Manager**: External system integration and data synchronization

#### 4. Core Services Layer (Orange)
- **Authentication Service**: User management and session handling
- **Data Source Service**: Database and file system connection management
- **Compliance Service**: Regulatory compliance validation and reporting
- **Classification Service**: Automated data classification and labeling
- **Catalog Service**: Metadata management and data lineage
- **Scan Service**: Data discovery and intelligent scanning
- **RBAC Service**: Role-based access control and permissions

#### 5. Data Access Layer (Light Coral)
- **ORM Layer**: SQLModel-based object-relational mapping
- **Cache Manager**: Redis cache operations and management
- **Connection Pool**: Database connection pooling and optimization
- **Query Optimizer**: SQL query performance optimization

#### 6. Storage Layer (Light Gray)
- **PostgreSQL**: Primary relational database for structured data
- **Redis Cache**: In-memory cache for sessions and frequently accessed data
- **Blob Storage**: Cloud storage for files and documents
- **File System**: Local file storage for temporary and processed files

#### 7. External Systems (Light Yellow)
- **Azure Active Directory**: Enterprise identity and access management
- **Azure Purview**: Microsoft's data governance and catalog platform
- **Azure Databricks**: Cloud-based analytics and machine learning platform
- **Apache Spark**: Distributed big data processing engine

### Key Architectural Patterns:

1. **Layered Architecture**: Clear separation of concerns across layers
2. **Microservices**: Independent, loosely coupled services
3. **Event-Driven**: Asynchronous communication through events
4. **CQRS**: Command Query Responsibility Segregation for scalability
5. **Circuit Breaker**: Fault tolerance and resilience patterns