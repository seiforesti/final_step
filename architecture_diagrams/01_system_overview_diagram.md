# System Overview Architecture Diagram

## Eraser.io Diagram Code

```eraser
title: PurSight Data Governance Platform - System Overview

// Define the cloud environment
cloud Azure {
  // Load Balancer
  load-balancer lb [icon: azure-load-balancer] {
    label: "Azure Load Balancer"
  }
  
  // Kubernetes Cluster
  cluster k8s [icon: kubernetes] {
    label: "AKS Cluster"
    
    // Ingress Layer
    group ingress {
      service nginx [icon: nginx] {
        label: "NGINX Ingress"
      }
    }
    
    // Frontend Layer
    group frontend {
      pod react1 [icon: react] {
        label: "React App 1"
      }
      pod react2 [icon: react] {
        label: "React App 2"
      }
      pod react3 [icon: react] {
        label: "React App 3"
      }
    }
    
    // API Gateway Layer
    group api-gateway {
      pod gateway1 [icon: fastapi] {
        label: "FastAPI Gateway 1"
      }
      pod gateway2 [icon: fastapi] {
        label: "FastAPI Gateway 2"
      }
    }
    
    // Racine Main Manager Layer
    group racine-manager {
      service orchestrator [icon: gear] {
        label: "Orchestration Service"
        color: blue
      }
      service workspace [icon: folder] {
        label: "Workspace Manager"
        color: blue
      }
      service workflow [icon: flow] {
        label: "Workflow Engine"
        color: blue
      }
      service pipeline [icon: pipeline] {
        label: "Pipeline Manager"
        color: blue
      }
      service ai-assistant [icon: brain] {
        label: "AI Assistant"
        color: green
      }
      service activity [icon: chart] {
        label: "Activity Tracker"
        color: blue
      }
      service dashboard [icon: dashboard] {
        label: "Dashboard Service"
        color: blue
      }
      service collaboration [icon: users] {
        label: "Collaboration Hub"
        color: purple
      }
      service integration [icon: plug] {
        label: "Integration Manager"
        color: blue
      }
    }
    
    // Core Services Layer
    group core-services {
      service auth [icon: lock] {
        label: "Authentication"
        color: red
      }
      service data-source [icon: database] {
        label: "Data Sources"
        color: orange
      }
      service compliance [icon: shield] {
        label: "Compliance Rules"
        color: orange
      }
      service classification [icon: tag] {
        label: "Classifications"
        color: orange
      }
      service catalog [icon: book] {
        label: "Data Catalog"
        color: orange
      }
      service scan-logic [icon: search] {
        label: "Scan Logic"
        color: orange
      }
      service rbac [icon: key] {
        label: "RBAC System"
        color: red
      }
    }
    
    // Data Layer
    group data-layer {
      database postgres-primary [icon: postgresql] {
        label: "PostgreSQL Primary"
      }
      database postgres-replica [icon: postgresql] {
        label: "PostgreSQL Replica"
      }
      cache redis-master [icon: redis] {
        label: "Redis Master"
      }
      cache redis-slave [icon: redis] {
        label: "Redis Slave"
      }
    }
    
    // Storage Layer
    group storage {
      volume pvc [icon: disk] {
        label: "Persistent Volumes"
      }
      storage blob [icon: azure-blob] {
        label: "Azure Blob Storage"
      }
    }
  }
  
  // External Services
  group external {
    service ad [icon: azure-ad] {
      label: "Azure Active Directory"
    }
    service purview [icon: azure-purview] {
      label: "Azure Purview"
    }
    service databricks [icon: databricks] {
      label: "Azure Databricks"
    }
    service monitor [icon: azure-monitor] {
      label: "Azure Monitor"
    }
  }
}

// Connections
lb --> nginx
nginx --> react1
nginx --> react2
nginx --> react3
nginx --> gateway1
nginx --> gateway2

gateway1 --> orchestrator
gateway2 --> orchestrator

orchestrator --> workspace
orchestrator --> workflow
orchestrator --> pipeline
orchestrator --> ai-assistant
orchestrator --> activity
orchestrator --> dashboard
orchestrator --> collaboration
orchestrator --> integration

workspace --> auth
workspace --> data-source
workspace --> compliance
workspace --> classification
workspace --> catalog
workspace --> scan-logic
workspace --> rbac

// Data connections
auth --> postgres-primary
data-source --> postgres-primary
compliance --> postgres-primary
classification --> postgres-primary
catalog --> postgres-primary
scan-logic --> postgres-primary
rbac --> postgres-primary
orchestrator --> postgres-primary
workspace --> postgres-primary
workflow --> postgres-primary
pipeline --> postgres-primary
ai-assistant --> postgres-primary
activity --> postgres-primary
dashboard --> postgres-primary
collaboration --> postgres-primary
integration --> postgres-primary

postgres-primary --> postgres-replica
redis-master --> redis-slave

auth --> redis-master
orchestrator --> redis-master
collaboration --> redis-master

data-source --> pvc
scan-logic --> blob
catalog --> blob

integration --> ad
integration --> purview
integration --> databricks
orchestrator --> monitor
```

## Architecture Description

This system overview diagram illustrates the complete PurSight Data Governance Platform architecture deployed on Azure Kubernetes Service (AKS). The architecture follows a layered microservices approach with clear separation of concerns:

### Key Components:

1. **Load Balancer**: Azure Load Balancer for high availability and traffic distribution
2. **Ingress Layer**: NGINX Ingress Controller for routing and SSL termination
3. **Frontend Layer**: Multiple React application pods for scalability
4. **API Gateway**: FastAPI gateways for request routing and middleware
5. **Racine Main Manager**: Advanced orchestration and management services
6. **Core Services**: Seven fundamental data governance services
7. **Data Layer**: PostgreSQL with read replicas and Redis clustering
8. **Storage Layer**: Persistent volumes and Azure Blob Storage
9. **External Integrations**: Azure AD, Purview, Databricks, and Monitor

### Color Coding:
- **Blue**: Orchestration and management services
- **Green**: AI-powered services
- **Purple**: Collaboration services
- **Red**: Security and authentication services
- **Orange**: Core business logic services

This architecture ensures high availability, scalability, and maintainability while providing comprehensive data governance capabilities.