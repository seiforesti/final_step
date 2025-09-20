# Deployment Architecture Diagram

## Eraser.io Diagram Code

```eraser
title: PurSight Data Governance Platform - Deployment Architecture

// Azure Cloud Environment
cloud azure [icon: azure] {
  label: "Microsoft Azure"
  
  // Resource Group
  group resource-group [color: lightblue] {
    label: "PurSight-DataGovernance-RG"
    
    // Load Balancer & Traffic Management
    load-balancer azure-lb [icon: azure-load-balancer] {
      label: "Azure Load Balancer"
      description: "Standard SKU with HA Ports"
    }
    
    cdn azure-cdn [icon: azure-cdn] {
      label: "Azure CDN"
      description: "Global content delivery"
    }
    
    // Application Gateway
    gateway app-gateway [icon: azure-app-gateway] {
      label: "Azure Application Gateway"
      description: "WAF + SSL Termination"
    }
    
    // Kubernetes Cluster
    cluster aks-cluster [icon: azure-kubernetes] {
      label: "Azure Kubernetes Service (AKS)"
      description: "3-node cluster with auto-scaling"
      
      // Ingress Controller
      group ingress-layer [color: lightgreen] {
        label: "Ingress Layer"
        
        pod nginx-ingress [icon: nginx] {
          label: "NGINX Ingress Controller"
          replicas: 2
          resources: "CPU: 500m, Memory: 512Mi"
        }
      }
      
      // Frontend Tier
      group frontend-tier [color: lightcyan] {
        label: "Frontend Tier"
        
        pod react-app-1 [icon: react] {
          label: "React App Pod 1"
          resources: "CPU: 200m, Memory: 256Mi"
        }
        
        pod react-app-2 [icon: react] {
          label: "React App Pod 2"
          resources: "CPU: 200m, Memory: 256Mi"
        }
        
        pod react-app-3 [icon: react] {
          label: "React App Pod 3"
          resources: "CPU: 200m, Memory: 256Mi"
        }
      }
      
      // API Gateway Tier
      group api-gateway-tier [color: lightgreen] {
        label: "API Gateway Tier"
        
        pod fastapi-gateway-1 [icon: fastapi] {
          label: "FastAPI Gateway 1"
          resources: "CPU: 500m, Memory: 1Gi"
        }
        
        pod fastapi-gateway-2 [icon: fastapi] {
          label: "FastAPI Gateway 2"
          resources: "CPU: 500m, Memory: 1Gi"
        }
      }
      
      // Racine Main Manager Tier
      group racine-tier [color: gold] {
        label: "Racine Main Manager Tier"
        
        pod orchestration-service [icon: conductor] {
          label: "Orchestration Service"
          replicas: 2
          resources: "CPU: 1000m, Memory: 2Gi"
        }
        
        pod workspace-manager [icon: workspace] {
          label: "Workspace Manager"
          replicas: 2
          resources: "CPU: 500m, Memory: 1Gi"
        }
        
        pod workflow-engine [icon: flow-chart] {
          label: "Workflow Engine"
          replicas: 3
          resources: "CPU: 1000m, Memory: 2Gi"
        }
        
        pod pipeline-optimizer [icon: pipeline] {
          label: "Pipeline Optimizer"
          replicas: 2
          resources: "CPU: 1500m, Memory: 3Gi"
        }
        
        pod ai-assistant [icon: brain] {
          label: "AI Assistant"
          replicas: 2
          resources: "CPU: 2000m, Memory: 4Gi"
        }
        
        pod collaboration-hub [icon: collaboration] {
          label: "Collaboration Hub"
          replicas: 2
          resources: "CPU: 500m, Memory: 1Gi"
        }
        
        pod dashboard-service [icon: dashboard] {
          label: "Dashboard Service"
          replicas: 2
          resources: "CPU: 500m, Memory: 1Gi"
        }
        
        pod activity-tracker [icon: activity] {
          label: "Activity Tracker"
          replicas: 2
          resources: "CPU: 300m, Memory: 512Mi"
        }
        
        pod integration-manager [icon: integration] {
          label: "Integration Manager"
          replicas: 2
          resources: "CPU: 500m, Memory: 1Gi"
        }
      }
      
      // Core Services Tier
      group core-services-tier [color: orange] {
        label: "Core Services Tier"
        
        pod auth-service [icon: lock] {
          label: "Authentication Service"
          replicas: 3
          resources: "CPU: 300m, Memory: 512Mi"
        }
        
        pod data-source-service [icon: database-connect] {
          label: "Data Source Service"
          replicas: 2
          resources: "CPU: 500m, Memory: 1Gi"
        }
        
        pod compliance-service [icon: compliance] {
          label: "Compliance Service"
          replicas: 2
          resources: "CPU: 500m, Memory: 1Gi"
        }
        
        pod classification-service [icon: classifier] {
          label: "Classification Service"
          replicas: 2
          resources: "CPU: 1000m, Memory: 2Gi"
        }
        
        pod catalog-service [icon: catalog] {
          label: "Catalog Service"
          replicas: 2
          resources: "CPU: 500m, Memory: 1Gi"
        }
        
        pod scan-service [icon: scanner] {
          label: "Scan Service"
          replicas: 3
          resources: "CPU: 1000m, Memory: 2Gi"
        }
        
        pod rbac-service [icon: key] {
          label: "RBAC Service"
          replicas: 2
          resources: "CPU: 300m, Memory: 512Mi"
        }
      }
      
      // Data Tier
      group data-tier [color: lightcoral] {
        label: "Data Tier"
        
        pod postgres-primary [icon: postgresql] {
          label: "PostgreSQL Primary"
          resources: "CPU: 2000m, Memory: 8Gi"
          storage: "1TB SSD"
        }
        
        pod postgres-replica-1 [icon: postgresql] {
          label: "PostgreSQL Replica 1"
          resources: "CPU: 1000m, Memory: 4Gi"
          storage: "1TB SSD"
        }
        
        pod postgres-replica-2 [icon: postgresql] {
          label: "PostgreSQL Replica 2"
          resources: "CPU: 1000m, Memory: 4Gi"
          storage: "1TB SSD"
        }
        
        pod redis-master [icon: redis] {
          label: "Redis Master"
          resources: "CPU: 500m, Memory: 2Gi"
        }
        
        pod redis-replica-1 [icon: redis] {
          label: "Redis Replica 1"
          resources: "CPU: 300m, Memory: 1Gi"
        }
        
        pod redis-replica-2 [icon: redis] {
          label: "Redis Replica 2"
          resources: "CPU: 300m, Memory: 1Gi"
        }
      }
      
      // Storage
      group storage-tier [color: lightgray] {
        label: "Storage Tier"
        
        volume pvc-postgres [icon: disk] {
          label: "PostgreSQL PVC"
          size: "3TB Premium SSD"
        }
        
        volume pvc-redis [icon: disk] {
          label: "Redis PVC"
          size: "100GB Premium SSD"
        }
        
        volume pvc-logs [icon: disk] {
          label: "Logs PVC"
          size: "500GB Standard SSD"
        }
      }
    }
    
    // Azure Database Services
    database azure-postgres [icon: azure-database-postgresql] {
      label: "Azure Database for PostgreSQL"
      description: "Flexible Server - HA enabled"
      tier: "General Purpose"
      compute: "4 vCores"
      storage: "2TB"
    }
    
    cache azure-redis [icon: azure-cache-redis] {
      label: "Azure Cache for Redis"
      description: "Premium tier with clustering"
      tier: "Premium P2"
      memory: "6GB"
    }
    
    // Storage Services
    storage blob-storage [icon: azure-blob] {
      label: "Azure Blob Storage"
      description: "Hot tier for active data"
      capacity: "10TB"
      redundancy: "GRS"
    }
    
    storage file-storage [icon: azure-files] {
      label: "Azure Files"
      description: "Premium file shares"
      capacity: "1TB"
      performance: "Premium"
    }
    
    // Container Registry
    registry acr [icon: azure-container-registry] {
      label: "Azure Container Registry"
      description: "Premium tier with geo-replication"
    }
    
    // Key Vault
    vault key-vault [icon: azure-key-vault] {
      label: "Azure Key Vault"
      description: "Secrets and certificate management"
    }
    
    // Monitoring & Logging
    monitor azure-monitor [icon: azure-monitor] {
      label: "Azure Monitor"
      description: "Metrics and alerting"
    }
    
    logs log-analytics [icon: azure-log-analytics] {
      label: "Log Analytics Workspace"
      description: "Centralized logging"
    }
    
    insights app-insights [icon: azure-app-insights] {
      label: "Application Insights"
      description: "APM and distributed tracing"
    }
  }
  
  // External Services
  group external-services [color: lightyellow] {
    label: "External Azure Services"
    
    service azure-ad [icon: azure-ad] {
      label: "Azure Active Directory"
      description: "Enterprise identity provider"
    }
    
    service azure-purview [icon: azure-purview] {
      label: "Azure Purview"
      description: "Data governance service"
    }
    
    service databricks [icon: azure-databricks] {
      label: "Azure Databricks"
      description: "Analytics and ML platform"
    }
    
    service synapse [icon: azure-synapse] {
      label: "Azure Synapse Analytics"
      description: "Data warehouse service"
    }
    
    service cognitive-services [icon: azure-cognitive] {
      label: "Azure Cognitive Services"
      description: "AI/ML APIs"
    }
  }
}

// Network Connections
azure-cdn --> app-gateway
app-gateway --> azure-lb
azure-lb --> nginx-ingress

nginx-ingress --> react-app-1
nginx-ingress --> react-app-2
nginx-ingress --> react-app-3
nginx-ingress --> fastapi-gateway-1
nginx-ingress --> fastapi-gateway-2

// Gateway to Racine Services
fastapi-gateway-1 --> orchestration-service
fastapi-gateway-2 --> orchestration-service

// Racine Service Connections
orchestration-service --> workspace-manager
orchestration-service --> workflow-engine
orchestration-service --> pipeline-optimizer
orchestration-service --> ai-assistant
orchestration-service --> collaboration-hub
orchestration-service --> dashboard-service
orchestration-service --> activity-tracker
orchestration-service --> integration-manager

// Workspace Manager to Core Services
workspace-manager --> auth-service
workspace-manager --> data-source-service
workspace-manager --> compliance-service
workspace-manager --> classification-service
workspace-manager --> catalog-service
workspace-manager --> scan-service
workspace-manager --> rbac-service

// Database Connections
auth-service --> postgres-primary
data-source-service --> postgres-primary
compliance-service --> postgres-primary
classification-service --> postgres-primary
catalog-service --> postgres-primary
scan-service --> postgres-primary
rbac-service --> postgres-primary

orchestration-service --> postgres-primary
workspace-manager --> postgres-primary
workflow-engine --> postgres-primary
pipeline-optimizer --> postgres-primary
ai-assistant --> postgres-primary
collaboration-hub --> postgres-primary
dashboard-service --> postgres-primary
activity-tracker --> postgres-primary
integration-manager --> postgres-primary

// Read Replicas
postgres-primary --> postgres-replica-1
postgres-primary --> postgres-replica-2

// Redis Connections
auth-service --> redis-master
orchestration-service --> redis-master
collaboration-hub --> redis-master
redis-master --> redis-replica-1
redis-master --> redis-replica-2

// Storage Connections
postgres-primary --> pvc-postgres
postgres-replica-1 --> pvc-postgres
postgres-replica-2 --> pvc-postgres
redis-master --> pvc-redis
redis-replica-1 --> pvc-redis
redis-replica-2 --> pvc-redis

// Blob Storage Connections
scan-service --> blob-storage
catalog-service --> blob-storage
data-source-service --> file-storage

// External Service Connections
integration-manager --> azure-ad
integration-manager --> azure-purview
integration-manager --> databricks
integration-manager --> synapse
ai-assistant --> cognitive-services

// Monitoring Connections
orchestration-service --> azure-monitor
workflow-engine --> app-insights
postgres-primary --> log-analytics
redis-master --> log-analytics

// Security Connections
auth-service --> key-vault
integration-manager --> key-vault

// Container Registry
aks-cluster --> acr
```

## Deployment Architecture Description

This deployment architecture diagram illustrates the comprehensive cloud-native deployment of the PurSight Data Governance Platform on Microsoft Azure, showcasing enterprise-grade scalability, reliability, and security:

### Infrastructure Components:

#### 1. **Traffic Management Layer**
- **Azure CDN**: Global content delivery network for static assets
- **Application Gateway**: Web Application Firewall (WAF) and SSL termination
- **Azure Load Balancer**: Layer 4 load balancing with high availability

#### 2. **Container Orchestration (AKS)**
- **Cluster Configuration**: 3-node cluster with auto-scaling (Standard_D4s_v3 VMs)
- **Ingress Controller**: NGINX for traffic routing and SSL management
- **Pod Deployment**: Multi-replica deployments for high availability
- **Resource Management**: CPU and memory limits for optimal resource utilization

#### 3. **Application Tiers**

##### Frontend Tier (Light Cyan):
- **React Applications**: 3 replicas for load distribution
- **Resource Allocation**: 200m CPU, 256Mi memory per pod
- **Horizontal Pod Autoscaling**: Based on CPU/memory utilization

##### API Gateway Tier (Light Green):
- **FastAPI Gateways**: 2 replicas for redundancy
- **Resource Allocation**: 500m CPU, 1Gi memory per pod
- **Rate Limiting**: Built-in throttling and request management

##### Racine Main Manager Tier (Gold):
- **Orchestration Service**: 2 replicas, 1000m CPU, 2Gi memory
- **Workflow Engine**: 3 replicas for high-throughput processing
- **AI Assistant**: 2 replicas with enhanced resources (2000m CPU, 4Gi memory)
- **Pipeline Optimizer**: 2 replicas with ML workload optimization
- **Other Services**: Balanced resource allocation for optimal performance

##### Core Services Tier (Orange):
- **Authentication Service**: 3 replicas for high availability
- **Scan Service**: 3 replicas for parallel processing
- **Classification Service**: Enhanced resources for ML operations
- **Other Services**: 2 replicas each with appropriate resource allocation

#### 4. **Data Layer**

##### In-Cluster Database (Light Coral):
- **PostgreSQL**: Primary with 2 read replicas
- **Redis**: Master-replica setup for caching
- **Resource Allocation**: Optimized for database workloads
- **Storage**: Premium SSD with 3TB capacity

##### Managed Azure Services:
- **Azure Database for PostgreSQL**: Flexible Server with HA
- **Azure Cache for Redis**: Premium tier with clustering
- **Automatic Backups**: Point-in-time recovery enabled

#### 5. **Storage Services**
- **Azure Blob Storage**: 10TB hot tier with geo-redundant storage
- **Azure Files**: 1TB premium file shares for shared storage
- **Persistent Volume Claims**: Premium SSD for database storage

#### 6. **Security & Compliance**
- **Azure Key Vault**: Centralized secrets management
- **Azure Active Directory**: Enterprise identity integration
- **Network Security Groups**: Micro-segmentation and firewall rules
- **Pod Security Policies**: Container-level security enforcement

#### 7. **Monitoring & Observability**
- **Azure Monitor**: Infrastructure and application metrics
- **Application Insights**: Distributed tracing and APM
- **Log Analytics**: Centralized log aggregation and analysis
- **Alerting**: Proactive monitoring and incident response

#### 8. **External Integrations**
- **Azure Purview**: Native data governance integration
- **Azure Databricks**: Analytics and machine learning workloads
- **Azure Synapse**: Data warehouse integration
- **Cognitive Services**: AI/ML API integration

### Deployment Specifications:

#### **Resource Requirements:**
- **Total CPU**: 24-32 vCPUs across all pods
- **Total Memory**: 64-96 GB RAM
- **Storage**: 5TB+ across all storage tiers
- **Network**: 10 Gbps bandwidth with Azure backbone

#### **High Availability Features:**
- **Multi-AZ Deployment**: Pods distributed across availability zones
- **Database Replication**: Primary-replica setup with automatic failover
- **Load Balancing**: Multiple layers of load distribution
- **Auto-scaling**: Horizontal and vertical scaling capabilities

#### **Security Features:**
- **Zero-Trust Network**: Micro-segmentation and least privilege access
- **Encryption**: End-to-end encryption in transit and at rest
- **Identity Integration**: Azure AD with multi-factor authentication
- **Compliance**: SOC 2, ISO 27001, GDPR compliance capabilities

#### **Performance Optimization:**
- **Caching Strategy**: Multi-tier caching with Redis
- **Connection Pooling**: Optimized database connections
- **CDN Integration**: Global content delivery
- **Resource Optimization**: Right-sized pods with auto-scaling

This deployment architecture ensures enterprise-grade reliability, scalability, and security while providing optimal performance for the PurSight Data Governance Platform.