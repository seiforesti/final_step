# DataWave Architecture - Eraser.io Diagram Specifications

## 1. System Architecture Overview Diagram

```
// DataWave Enterprise System Architecture
cloud "External Users" {
  actor "Data Scientists" as ds
  actor "Data Engineers" as de
  actor "Compliance Officers" as co
}

// Presentation Layer
rectangle "Frontend Layer" as frontend {
  component "Next.js App" as nextjs
  component "React Components" as react
  component "Ant Design UI" as antd
}

// API Gateway Layer
rectangle "API Gateway" as gateway {
  component "FastAPI Gateway" as fastapi
  component "Authentication" as auth
  component "Rate Limiting" as rate
}

// Business Logic Layer
rectangle "Microservices" as services {
  // Catalog Domain
  package "Catalog Domain" {
    component "Catalog Service" as catalog
    component "Lineage Service" as lineage
    component "Quality Service" as quality
  }

  // Scan Domain
  package "Scan Domain" {
    component "Scan Coordinator" as scan_coord
    component "Scan Intelligence" as scan_intel
    component "Performance Optimizer" as perf_opt
  }

  // AI/ML Domain
  package "AI/ML Domain" {
    component "AI Service" as ai
    component "ML Service" as ml
    component "Pattern Recognition" as pattern
  }
}

// Data Layer
rectangle "Data Layer" as data {
  database "PostgreSQL" as postgres
  database "Redis Cache" as redis
  storage "File Storage" as files
}

// Connections
ds --> nextjs
de --> nextjs
co --> nextjs
nextjs --> fastapi
fastapi --> catalog
fastapi --> scan_coord
fastapi --> ai
catalog --> postgres
scan_coord --> postgres
ai --> postgres
catalog --> redis
```

## 2. Microservices Topology Diagram

```
// DataWave Microservices Architecture
title "DataWave Microservices Topology"

// Core Services Cluster
cluster "Core Services" {
  service "Catalog Service" as cat_svc
  service "Classification Service" as class_svc
  service "Security Service" as sec_svc
  service "Data Source Service" as ds_svc
}

// AI/ML Services Cluster
cluster "AI/ML Services" {
  service "Advanced AI Service" as ai_svc
  service "Advanced ML Service" as ml_svc
  service "Pattern Matching" as pattern_svc
  service "Intelligence Service" as intel_svc
}

// Scan Services Cluster
cluster "Scan Services" {
  service "Scan Coordinator" as scan_coord
  service "Scan Orchestrator" as scan_orch
  service "Scan Intelligence" as scan_intel
  service "Performance Optimizer" as perf_opt
}

// Communication Patterns
cat_svc --> class_svc : "classification requests"
scan_coord --> ai_svc : "AI processing"
ai_svc --> ml_svc : "ML operations"
scan_coord --> perf_opt : "optimization"

// External Integration
cloud "External Systems" {
  service "Azure Purview" as purview
  service "AWS Glue" as glue
  service "Databricks" as databricks
}

ds_svc --> purview : "metadata sync"
ds_svc --> glue : "catalog sync"
ai_svc --> databricks : "ML model sync"
```

## 3. Data Flow Architecture Diagram

```
// DataWave Data Processing Pipeline
title "DataWave Data Flow Architecture"

// Data Sources
cloud "Data Sources" {
  database "PostgreSQL" as pg_src
  database "MySQL" as mysql_src
  storage "File Systems" as file_src
  stream "Real-time Data" as stream_src
}

// Processing Pipeline
rectangle "Data Pipeline" {
  process "Data Ingestion" as ingestion
  process "Schema Discovery" as discovery
  process "AI Classification" as classification
  process "Quality Assessment" as quality
  process "Cataloging" as cataloging
}

// Storage Layer
rectangle "Storage" {
  database "Metadata Store" as metadata
  database "Data Catalog" as catalog_db
  database "Lineage Store" as lineage_db
}

// Output Layer
rectangle "Outputs" {
  api "REST APIs" as rest_api
  stream "Real-time Updates" as realtime
  dashboard "Analytics Dashboard" as dashboard
}

// Flow Connections
pg_src --> ingestion
mysql_src --> ingestion
file_src --> ingestion
stream_src --> ingestion

ingestion --> discovery
discovery --> classification
classification --> quality
quality --> cataloging

cataloging --> metadata
cataloging --> catalog_db
cataloging --> lineage_db

metadata --> rest_api
catalog_db --> dashboard
realtime --> dashboard
```

## 4. Security Architecture Diagram

```
// DataWave Security Architecture
title "DataWave Zero-Trust Security Model"

// Security Zones
rectangle "DMZ Zone" {
  component "Load Balancer" as lb
  component "WAF" as waf
  component "DDoS Protection" as ddos
}

rectangle "Auth Zone" {
  component "OAuth 2.0" as oauth
  component "SAML Provider" as saml
  component "MFA Service" as mfa
  component "JWT Service" as jwt
}

rectangle "Application Zone" {
  component "API Gateway" as api_gw
  component "RBAC Engine" as rbac
  component "Audit Logger" as audit
}

rectangle "Data Zone" {
  component "Encryption Service" as encrypt
  component "Key Management" as keys
  component "Data Masking" as mask
}

// Security Flow
actor "User" as user
user --> lb
lb --> waf
waf --> oauth
oauth --> mfa
mfa --> jwt
jwt --> api_gw
api_gw --> rbac
rbac --> encrypt
encrypt --> keys
```

## 5. Deployment Architecture Diagram

```
// DataWave Kubernetes Deployment
title "DataWave Deployment Architecture"

cloud "Cloud Infrastructure" {
  cluster "Kubernetes Cluster" {
    // Frontend Tier
    pod "Next.js Pod 1" as fe1
    pod "Next.js Pod 2" as fe2
    pod "Next.js Pod 3" as fe3

    // API Tier
    pod "FastAPI Pod 1" as api1
    pod "FastAPI Pod 2" as api2
    pod "FastAPI Pod 3" as api3

    // Service Tier
    pod "Catalog Service Pod" as cat_pod
    pod "Scan Service Pod" as scan_pod
    pod "AI Service Pod" as ai_pod

    // Data Tier
    pod "PostgreSQL Primary" as pg_primary
    pod "PostgreSQL Replica" as pg_replica
    pod "Redis Master" as redis_master
  }

  // Load Balancers
  loadbalancer "Frontend LB" as fe_lb
  loadbalancer "API LB" as api_lb

  // Connections
  fe_lb --> fe1
  fe_lb --> fe2
  fe_lb --> fe3

  api_lb --> api1
  api_lb --> api2
  api_lb --> api3

  api1 --> cat_pod
  api1 --> scan_pod
  api1 --> ai_pod

  cat_pod --> pg_primary
  scan_pod --> pg_primary
  ai_pod --> pg_primary
}

// External Services
service "CDN" as cdn
service "DNS" as dns
service "Certificate Manager" as cert

dns --> fe_lb
cdn --> fe_lb
cert --> fe_lb
```

## Usage Instructions for Eraser.io

1. **Import Specifications**: Copy each diagram specification into Eraser.io
2. **Customize Styling**: Apply enterprise color schemes and themes
3. **Add Annotations**: Include performance metrics and scaling information
4. **Export Options**: Generate high-resolution images for documentation
5. **Interactive Features**: Enable clickable components for detailed views

## Diagram Customization Options

- **Color Coding**: Use domain-specific colors for different service types
- **Animation**: Add flow animations for data processing pipelines
- **Metrics Overlay**: Display real-time performance metrics
- **Zoom Levels**: Support macro and micro architecture views
- **Interactive Elements**: Enable drill-down capabilities for detailed analysis
