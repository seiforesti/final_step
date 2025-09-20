# Package Structure Diagram

## Eraser.io Diagram Code

```eraser
title: PurSight Data Governance Platform - Package Structure & Dependencies

// Root Application Package
package app [color: lightblue] {
  label: "app/"
  description: "Root Application Package"
  
  // Models Package
  package models [color: lightgreen] {
    label: "models/"
    description: "Data Models & Entities"
    
    file auth-models [icon: file] {
      label: "auth_models.py"
      description: "User, Role, Permission"
    }
    file scan-models [icon: file] {
      label: "scan_models.py" 
      description: "Scan, DataSource, ScanResult"
    }
    file compliance-models [icon: file] {
      label: "compliance_models.py"
      description: "ComplianceRule, Validation"
    }
    file classification-models [icon: file] {
      label: "classification_models.py"
      description: "ClassificationRule, Result"
    }
    file catalog-models [icon: file] {
      label: "catalog_models.py"
      description: "CatalogItem, Metadata"
    }
    file workflow-models [icon: file] {
      label: "workflow_models.py"
      description: "Workflow, Task, Execution"
    }
    
    // Racine Models Subpackage
    package racine-models [color: gold] {
      label: "racine_models/"
      description: "Racine Main Manager Models"
      
      file racine-orchestration [icon: file] {
        label: "racine_orchestration_models.py"
        description: "Master Orchestration"
      }
      file racine-workspace [icon: file] {
        label: "racine_workspace_models.py"
        description: "Workspace Management"
      }
      file racine-workflow [icon: file] {
        label: "racine_workflow_models.py"
        description: "Workflow Engine"
      }
      file racine-pipeline [icon: file] {
        label: "racine_pipeline_models.py"
        description: "Pipeline Management"
      }
      file racine-ai [icon: file] {
        label: "racine_ai_models.py"
        description: "AI Assistant"
      }
      file racine-activity [icon: file] {
        label: "racine_activity_models.py"
        description: "Activity Tracking"
      }
      file racine-dashboard [icon: file] {
        label: "racine_dashboard_models.py"
        description: "Dashboard System"
      }
      file racine-collaboration [icon: file] {
        label: "racine_collaboration_models.py"
        description: "Collaboration Hub"
      }
      file racine-integration [icon: file] {
        label: "racine_integration_models.py"
        description: "Integration Manager"
      }
    }
  }
  
  // Services Package
  package services [color: orange] {
    label: "services/"
    description: "Business Logic Services"
    
    file auth-service [icon: service] {
      label: "auth_service.py"
      description: "Authentication Logic"
    }
    file data-source-service [icon: service] {
      label: "data_source_service.py"
      description: "Data Source Management"
    }
    file compliance-service [icon: service] {
      label: "compliance_service.py"
      description: "Compliance Validation"
    }
    file classification-service [icon: service] {
      label: "classification_service.py"
      description: "Data Classification"
    }
    file catalog-service [icon: service] {
      label: "catalog_service.py"
      description: "Catalog Management"
    }
    file scan-service [icon: service] {
      label: "scan_service.py"
      description: "Scanning Logic"
    }
    file rbac-service [icon: service] {
      label: "rbac_service.py"
      description: "Access Control"
    }
    
    // Racine Services Subpackage
    package racine-services [color: gold] {
      label: "racine_services/"
      description: "Racine Advanced Services"
      
      file racine-orchestration-service [icon: service] {
        label: "racine_orchestration_service.py"
        description: "Master Orchestration Service"
      }
      file racine-workspace-service [icon: service] {
        label: "racine_workspace_service.py"
        description: "Workspace Service"
      }
      file racine-workflow-service [icon: service] {
        label: "racine_workflow_service.py"
        description: "Workflow Service"
      }
      file racine-pipeline-service [icon: service] {
        label: "racine_pipeline_service.py"
        description: "Pipeline Service"
      }
      file racine-ai-service [icon: service] {
        label: "racine_ai_service.py"
        description: "AI Assistant Service"
      }
      file racine-activity-service [icon: service] {
        label: "racine_activity_service.py"
        description: "Activity Service"
      }
      file racine-dashboard-service [icon: service] {
        label: "racine_dashboard_service.py"
        description: "Dashboard Service"
      }
      file racine-collaboration-service [icon: service] {
        label: "racine_collaboration_service.py"
        description: "Collaboration Service"
      }
      file racine-integration-service [icon: service] {
        label: "racine_integration_service.py"
        description: "Integration Service"
      }
    }
  }
  
  // API Package
  package api [color: lightcoral] {
    label: "api/"
    description: "API Layer & Routes"
    
    package routes [color: lightcoral] {
      label: "routes/"
      description: "API Route Definitions"
      
      file auth-routes [icon: api] {
        label: "auth.py"
        description: "Authentication Endpoints"
      }
      file scan-routes [icon: api] {
        label: "scan_routes.py"
        description: "Scanning Endpoints"
      }
      file compliance-routes [icon: api] {
        label: "compliance_routes.py"
        description: "Compliance Endpoints"
      }
      file classification-routes [icon: api] {
        label: "classification_routes.py"
        description: "Classification Endpoints"
      }
      file catalog-routes [icon: api] {
        label: "catalog_routes.py"
        description: "Catalog Endpoints"
      }
      
      // RBAC Routes Subpackage
      package rbac-routes [color: red] {
        label: "rbac/"
        description: "RBAC API Routes"
        
        file rbac-routes-file [icon: api] {
          label: "rbac_routes.py"
          description: "Access Control Endpoints"
        }
      }
      
      // Racine Routes Subpackage
      package racine-routes [color: gold] {
        label: "racine_routes/"
        description: "Racine API Routes"
        
        file racine-orchestration-routes [icon: api] {
          label: "racine_orchestration_routes.py"
          description: "Orchestration Endpoints"
        }
        file racine-workspace-routes [icon: api] {
          label: "racine_workspace_routes.py"
          description: "Workspace Endpoints"
        }
        file racine-workflow-routes [icon: api] {
          label: "racine_workflow_routes.py"
          description: "Workflow Endpoints"
        }
        file racine-pipeline-routes [icon: api] {
          label: "racine_pipeline_routes.py"
          description: "Pipeline Endpoints"
        }
        file racine-ai-routes [icon: api] {
          label: "racine_ai_routes.py"
          description: "AI Assistant Endpoints"
        }
        file racine-activity-routes [icon: api] {
          label: "racine_activity_routes.py"
          description: "Activity Endpoints"
        }
        file racine-dashboard-routes [icon: api] {
          label: "racine_dashboard_routes.py"
          description: "Dashboard Endpoints"
        }
        file racine-collaboration-routes [icon: api] {
          label: "racine_collaboration_routes.py"
          description: "Collaboration Endpoints"
        }
        file racine-integration-routes [icon: api] {
          label: "racine_integration_routes.py"
          description: "Integration Endpoints"
        }
      }
    }
    
    package security [color: red] {
      label: "security/"
      description: "Security Middleware"
      
      file rbac-middleware [icon: shield] {
        label: "rbac.py"
        description: "RBAC Enforcement"
      }
      file auth-middleware [icon: shield] {
        label: "auth_middleware.py"
        description: "Authentication Middleware"
      }
    }
  }
  
  // Core Package
  package core [color: lightgray] {
    label: "core/"
    description: "Core Infrastructure"
    
    file config [icon: config] {
      label: "config.py"
      description: "Configuration Management"
    }
    file database [icon: database] {
      label: "database.py"
      description: "Database Connection"
    }
    file security-core [icon: security] {
      label: "security.py"
      description: "Security Utilities"
    }
    file logging [icon: log] {
      label: "logging.py"
      description: "Logging Configuration"
    }
  }
  
  // Utils Package
  package utils [color: lightyellow] {
    label: "utils/"
    description: "Utility Functions"
    
    file validators [icon: check] {
      label: "validators.py"
      description: "Input Validation"
    }
    file serializers [icon: transform] {
      label: "serializers.py"
      description: "Data Serialization"
    }
    file helpers [icon: tool] {
      label: "helpers.py"
      description: "Helper Functions"
    }
  }
}

// Frontend Package Structure
package frontend [color: lightblue] {
  label: "frontend/src/"
  description: "React Frontend Package"
  
  package components [color: lightgreen] {
    label: "components/"
    description: "UI Components"
    
    package racine-components [color: gold] {
      label: "racine-main-manager/"
      description: "Racine UI Components"
      
      folder orchestration-ui [icon: folder] {
        label: "orchestration/"
      }
      folder workspaces-ui [icon: folder] {
        label: "workspaces/"
      }
      folder workflows-ui [icon: folder] {
        label: "workflows/"
      }
      folder pipelines-ui [icon: folder] {
        label: "pipelines/"
      }
      folder ai-assistant-ui [icon: folder] {
        label: "ai-assistant/"
      }
    }
  }
  
  package frontend-services [color: orange] {
    label: "services/"
    description: "API Services"
    
    file api-base [icon: api] {
      label: "api.ts"
      description: "Base API Configuration"
    }
    
    package racine-frontend-services [color: gold] {
      label: "racine/"
      description: "Racine API Services"
      
      file orchestration-api [icon: api] {
        label: "orchestration.service.ts"
      }
      file workspace-api [icon: api] {
        label: "workspace.service.ts"
      }
      file workflow-api [icon: api] {
        label: "workflow.service.ts"
      }
      file pipeline-api [icon: api] {
        label: "pipeline.service.ts"
      }
      file ai-api [icon: api] {
        label: "ai.service.ts"
      }
    }
  }
}

// Dependency Arrows
// Services depend on Models
auth-service --> auth-models
data-source-service --> scan-models
compliance-service --> compliance-models
classification-service --> classification-models
catalog-service --> catalog-models
scan-service --> scan-models
rbac-service --> auth-models

// Racine Services depend on Racine Models
racine-orchestration-service --> racine-orchestration
racine-workspace-service --> racine-workspace
racine-workflow-service --> racine-workflow
racine-pipeline-service --> racine-pipeline
racine-ai-service --> racine-ai
racine-activity-service --> racine-activity
racine-dashboard-service --> racine-dashboard
racine-collaboration-service --> racine-collaboration
racine-integration-service --> racine-integration

// Routes depend on Services
auth-routes --> auth-service
scan-routes --> scan-service
compliance-routes --> compliance-service
classification-routes --> classification-service
catalog-routes --> catalog-service
rbac-routes-file --> rbac-service

// Racine Routes depend on Racine Services
racine-orchestration-routes --> racine-orchestration-service
racine-workspace-routes --> racine-workspace-service
racine-workflow-routes --> racine-workflow-service
racine-pipeline-routes --> racine-pipeline-service
racine-ai-routes --> racine-ai-service
racine-activity-routes --> racine-activity-service
racine-dashboard-routes --> racine-dashboard-service
racine-collaboration-routes --> racine-collaboration-service
racine-integration-routes --> racine-integration-service

// Core dependencies
auth-service --> database
data-source-service --> database
compliance-service --> database
classification-service --> database
catalog-service --> database
scan-service --> database
rbac-service --> database

// Security middleware dependencies
rbac-middleware --> rbac-service
auth-middleware --> auth-service

// Frontend API services
orchestration-api --> racine-orchestration-routes
workspace-api --> racine-workspace-routes
workflow-api --> racine-workflow-routes
pipeline-api --> racine-pipeline-routes
ai-api --> racine-ai-routes

// Utils dependencies
auth-service --> validators
compliance-service --> validators
classification-service --> validators
catalog-service --> serializers
scan-service --> helpers
```

## Package Structure Description

This package structure diagram illustrates the comprehensive organization of the PurSight Data Governance Platform, showing clear separation of concerns and dependency relationships:

### Backend Package Structure:

#### 1. Models Package (Light Green)
- **Core Models**: Authentication, scanning, compliance, classification, catalog, and workflow models
- **Racine Models**: Advanced models for the Racine Main Manager system
- **Relationships**: Clear entity relationships and foreign key constraints

#### 2. Services Package (Orange)
- **Core Services**: Business logic for each functional domain
- **Racine Services**: Advanced orchestration and management services
- **Dependency Injection**: Services depend on models and core infrastructure

#### 3. API Package (Light Coral)
- **Routes**: RESTful API endpoints organized by domain
- **Security**: Authentication and RBAC middleware
- **Racine Routes**: Advanced API endpoints for orchestration features

#### 4. Core Package (Light Gray)
- **Configuration**: Environment and application settings
- **Database**: Connection management and ORM setup
- **Security**: Cryptographic utilities and security helpers
- **Logging**: Structured logging configuration

#### 5. Utils Package (Light Yellow)
- **Validators**: Input validation and sanitization
- **Serializers**: Data transformation and serialization
- **Helpers**: Common utility functions

### Frontend Package Structure:

#### 1. Components Package (Light Green)
- **Common Components**: Reusable UI components
- **Domain Components**: Feature-specific components
- **Racine Components**: Advanced UI for orchestration features

#### 2. Services Package (Orange)
- **API Services**: HTTP client services for backend communication
- **State Management**: Redux store and actions
- **Utilities**: Frontend helper functions

### Key Architectural Patterns:

1. **Layered Architecture**: Clear separation between models, services, and API layers
2. **Domain-Driven Design**: Packages organized around business domains
3. **Dependency Inversion**: Higher-level modules don't depend on lower-level modules
4. **Single Responsibility**: Each package has a single, well-defined purpose
5. **Modularity**: Loose coupling between packages with clear interfaces

### Dependency Flow:
- **API Routes** → **Services** → **Models** → **Database**
- **Frontend Services** → **Backend API Routes**
- **All Layers** → **Core Infrastructure** and **Utils**

This structure ensures maintainability, testability, and scalability while providing clear boundaries between different aspects of the system.