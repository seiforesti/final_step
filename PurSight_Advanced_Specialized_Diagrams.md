# PurSight Enterprise Data Governance - Advanced Specialized Diagrams

## 9. Entity Relationship Diagram - Data Model Architecture

```eraser
// PurSight Enterprise - Advanced Entity Relationship Diagram
// Comprehensive data model with all relationships and constraints

entity-style primary {
  fill: #1e40af
  stroke: #1d4ed8
  text-color: white
}

entity-style secondary {
  fill: #059669
  stroke: #047857
  text-color: white
}

entity-style lookup {
  fill: #7c3aed
  stroke: #6d28d9
  text-color: white
}

entity-style junction {
  fill: #ea580c
  stroke: #c2410c
  text-color: white
}

// Core Identity and Organization Entities
entity Organization [icon: organization] {
  style: primary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT
  settings: JSONB
  created_at: TIMESTAMP [DEFAULT NOW()]
  updated_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, created_at]
  constraints: [UNIQUE(name)]
}

entity User [icon: user] {
  style: primary
  
  id: INTEGER [PK]
  username: VARCHAR(100) [NOT NULL, UNIQUE]
  email: VARCHAR(255) [NOT NULL, UNIQUE]
  password_hash: VARCHAR(255) [NOT NULL]
  first_name: VARCHAR(100)
  last_name: VARCHAR(100)
  is_active: BOOLEAN [DEFAULT TRUE]
  is_superuser: BOOLEAN [DEFAULT FALSE]
  organization_id: INTEGER [FK -> Organization.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  last_login: TIMESTAMP
  
  indexes: [username, email, organization_id, is_active]
}

entity Role [icon: role] {
  style: secondary
  
  id: INTEGER [PK]
  name: VARCHAR(100) [NOT NULL]
  description: TEXT
  organization_id: INTEGER [FK -> Organization.id]
  is_system_role: BOOLEAN [DEFAULT FALSE]
  created_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, organization_id]
  constraints: [UNIQUE(name, organization_id)]
}

entity Permission [icon: permission] {
  style: secondary
  
  id: INTEGER [PK]
  name: VARCHAR(100) [NOT NULL, UNIQUE]
  resource: VARCHAR(100) [NOT NULL]
  action: VARCHAR(50) [NOT NULL]
  description: TEXT
  
  indexes: [name, resource, action]
  constraints: [UNIQUE(resource, action)]
}

// Junction Tables for Many-to-Many Relationships
entity UserRole [icon: user-role] {
  style: junction
  
  user_id: INTEGER [PK, FK -> User.id]
  role_id: INTEGER [PK, FK -> Role.id]
  assigned_at: TIMESTAMP [DEFAULT NOW()]
  assigned_by: INTEGER [FK -> User.id]
  
  constraints: [PRIMARY KEY(user_id, role_id)]
}

entity RolePermission [icon: role-permission] {
  style: junction
  
  role_id: INTEGER [PK, FK -> Role.id]
  permission_id: INTEGER [PK, FK -> Permission.id]
  granted_at: TIMESTAMP [DEFAULT NOW()]
  
  constraints: [PRIMARY KEY(role_id, permission_id)]
}

// Data Source Management Entities
entity DataSource [icon: datasource] {
  style: primary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  source_type: VARCHAR(50) [NOT NULL]
  location: VARCHAR(50) [NOT NULL]
  host: VARCHAR(255) [NOT NULL]
  port: INTEGER [NOT NULL]
  database_name: VARCHAR(255)
  username: VARCHAR(255) [NOT NULL]
  password_encrypted: TEXT [NOT NULL]
  status: VARCHAR(50) [DEFAULT 'pending']
  environment: VARCHAR(50) [DEFAULT 'development']
  criticality: VARCHAR(50) [DEFAULT 'medium']
  data_classification: VARCHAR(50) [DEFAULT 'internal']
  connection_properties: JSONB
  health_check_enabled: BOOLEAN [DEFAULT TRUE]
  last_health_check: TIMESTAMP
  organization_id: INTEGER [FK -> Organization.id]
  created_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  updated_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, source_type, status, organization_id, created_by]
  constraints: [UNIQUE(name, organization_id)]
}

// Scan Management Entities
entity ScanRuleSet [icon: scanruleset] {
  style: secondary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT
  rules: JSONB [NOT NULL]
  version: VARCHAR(50) [DEFAULT '1.0.0']
  is_active: BOOLEAN [DEFAULT TRUE]
  organization_id: INTEGER [FK -> Organization.id]
  created_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  updated_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, version, is_active, organization_id]
  constraints: [UNIQUE(name, version, organization_id)]
}

entity Scan [icon: scan] {
  style: primary
  
  id: INTEGER [PK]
  scan_id: UUID [NOT NULL, UNIQUE]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT
  status: VARCHAR(50) [DEFAULT 'pending']
  data_source_id: INTEGER [FK -> DataSource.id]
  scan_rule_set_id: INTEGER [FK -> ScanRuleSet.id]
  configuration: JSONB
  started_at: TIMESTAMP
  completed_at: TIMESTAMP
  progress_percentage: INTEGER [DEFAULT 0]
  total_records_scanned: BIGINT [DEFAULT 0]
  total_issues_found: INTEGER [DEFAULT 0]
  created_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [scan_id, status, data_source_id, scan_rule_set_id, created_by]
}

entity ScanResult [icon: scanresult] {
  style: secondary
  
  id: INTEGER [PK]
  scan_id: INTEGER [FK -> Scan.id]
  table_name: VARCHAR(255) [NOT NULL]
  column_name: VARCHAR(255)
  issue_type: VARCHAR(100) [NOT NULL]
  issue_severity: VARCHAR(50) [NOT NULL]
  issue_description: TEXT [NOT NULL]
  record_count: INTEGER [DEFAULT 0]
  sample_values: JSONB
  recommendation: TEXT
  status: VARCHAR(50) [DEFAULT 'open']
  resolved_at: TIMESTAMP
  resolved_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [scan_id, table_name, issue_type, issue_severity, status]
}

// Compliance Management Entities
entity ComplianceRule [icon: compliancerule] {
  style: primary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT [NOT NULL]
  rule_type: VARCHAR(50) [NOT NULL]
  severity: VARCHAR(50) [NOT NULL]
  status: VARCHAR(50) [DEFAULT 'draft']
  scope: VARCHAR(50) [DEFAULT 'global']
  conditions: JSONB [NOT NULL]
  actions: JSONB [NOT NULL]
  compliance_standard: VARCHAR(100)
  tags: TEXT[]
  organization_id: INTEGER [FK -> Organization.id]
  created_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  updated_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, rule_type, severity, status, organization_id]
  constraints: [UNIQUE(name, organization_id)]
}

entity ComplianceEvaluation [icon: evaluation] {
  style: secondary
  
  id: INTEGER [PK]
  compliance_rule_id: INTEGER [FK -> ComplianceRule.id]
  data_source_id: INTEGER [FK -> DataSource.id]
  evaluation_result: VARCHAR(50) [NOT NULL]
  score: DECIMAL(5,2)
  details: JSONB
  evaluated_at: TIMESTAMP [DEFAULT NOW()]
  evaluated_by: INTEGER [FK -> User.id]
  
  indexes: [compliance_rule_id, data_source_id, evaluation_result, evaluated_at]
}

// Data Catalog Entities
entity CatalogItem [icon: catalogitem] {
  style: primary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  type: VARCHAR(50) [NOT NULL]
  description: TEXT
  schema_name: VARCHAR(255)
  table_name: VARCHAR(255)
  column_name: VARCHAR(255)
  classification: VARCHAR(50) [DEFAULT 'internal']
  quality_score: DECIMAL(3,2) [DEFAULT 0.0]
  popularity_score: DECIMAL(3,2) [DEFAULT 0.0]
  data_type: VARCHAR(100)
  size_bytes: BIGINT
  row_count: BIGINT
  column_count: INTEGER
  parent_id: INTEGER [FK -> CatalogItem.id]
  data_source_id: INTEGER [FK -> DataSource.id]
  organization_id: INTEGER [FK -> Organization.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  updated_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, type, classification, data_source_id, parent_id, organization_id]
}

entity DataLineage [icon: lineage] {
  style: secondary
  
  id: INTEGER [PK]
  source_catalog_item_id: INTEGER [FK -> CatalogItem.id]
  target_catalog_item_id: INTEGER [FK -> CatalogItem.id]
  lineage_type: VARCHAR(50) [NOT NULL]
  transformation_logic: TEXT
  confidence_score: DECIMAL(3,2) [DEFAULT 1.0]
  discovered_at: TIMESTAMP [DEFAULT NOW()]
  discovered_by: VARCHAR(100) [DEFAULT 'system']
  
  indexes: [source_catalog_item_id, target_catalog_item_id, lineage_type]
  constraints: [UNIQUE(source_catalog_item_id, target_catalog_item_id, lineage_type)]
}

// Classification Entities
entity ClassificationRule [icon: classificationrule] {
  style: secondary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT
  rule_type: VARCHAR(50) [NOT NULL]
  pattern: TEXT [NOT NULL]
  classification_label: VARCHAR(100) [NOT NULL]
  confidence_threshold: DECIMAL(3,2) [DEFAULT 0.8]
  is_active: BOOLEAN [DEFAULT TRUE]
  organization_id: INTEGER [FK -> Organization.id]
  created_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, rule_type, classification_label, is_active, organization_id]
}

entity DataClassification [icon: dataclassification] {
  style: secondary
  
  id: INTEGER [PK]
  catalog_item_id: INTEGER [FK -> CatalogItem.id]
  classification_rule_id: INTEGER [FK -> ClassificationRule.id]
  classification_label: VARCHAR(100) [NOT NULL]
  confidence_score: DECIMAL(3,2) [NOT NULL]
  classified_at: TIMESTAMP [DEFAULT NOW()]
  classified_by: VARCHAR(100) [DEFAULT 'system']
  is_validated: BOOLEAN [DEFAULT FALSE]
  validated_by: INTEGER [FK -> User.id]
  validated_at: TIMESTAMP
  
  indexes: [catalog_item_id, classification_label, confidence_score, classified_at]
}

// Racine Orchestration Entities
entity RacineOrchestrationMaster [icon: racine] {
  style: primary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT
  status: VARCHAR(50) [DEFAULT 'idle']
  configuration: JSONB [NOT NULL]
  workspace_id: INTEGER [FK -> RacineWorkspace.id]
  organization_id: INTEGER [FK -> Organization.id]
  created_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  updated_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, status, workspace_id, organization_id]
}

entity RacineWorkspace [icon: workspace] {
  style: secondary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT
  workspace_type: VARCHAR(50) [NOT NULL]
  configuration: JSONB [NOT NULL]
  status: VARCHAR(50) [DEFAULT 'active']
  owner_id: INTEGER [FK -> User.id]
  organization_id: INTEGER [FK -> Organization.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  updated_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, workspace_type, status, owner_id, organization_id]
}

entity RacineJobWorkflow [icon: workflow] {
  style: secondary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT
  workflow_definition: JSONB [NOT NULL]
  status: VARCHAR(50) [DEFAULT 'draft']
  workspace_id: INTEGER [FK -> RacineWorkspace.id]
  created_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  updated_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, status, workspace_id, created_by]
}

entity RacinePipeline [icon: pipeline] {
  style: secondary
  
  id: INTEGER [PK]
  name: VARCHAR(255) [NOT NULL]
  description: TEXT
  pipeline_definition: JSONB [NOT NULL]
  status: VARCHAR(50) [DEFAULT 'inactive']
  workspace_id: INTEGER [FK -> RacineWorkspace.id]
  job_workflow_id: INTEGER [FK -> RacineJobWorkflow.id]
  created_by: INTEGER [FK -> User.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [name, status, workspace_id, job_workflow_id]
}

// Audit and Monitoring Entities
entity AuditLog [icon: audit] {
  style: lookup
  
  id: INTEGER [PK]
  user_id: INTEGER [FK -> User.id]
  action: VARCHAR(100) [NOT NULL]
  resource_type: VARCHAR(100) [NOT NULL]
  resource_id: INTEGER
  details: JSONB
  ip_address: INET
  user_agent: TEXT
  organization_id: INTEGER [FK -> Organization.id]
  created_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [user_id, action, resource_type, organization_id, created_at]
}

entity SystemMetrics [icon: metrics] {
  style: lookup
  
  id: INTEGER [PK]
  metric_name: VARCHAR(100) [NOT NULL]
  metric_value: DECIMAL(15,2) [NOT NULL]
  metric_unit: VARCHAR(50)
  tags: JSONB
  recorded_at: TIMESTAMP [DEFAULT NOW()]
  
  indexes: [metric_name, recorded_at]
}

// Define Relationships
Organization ||--o{ User : "has_users"
Organization ||--o{ DataSource : "owns_data_sources"
Organization ||--o{ ComplianceRule : "defines_rules"
Organization ||--o{ CatalogItem : "contains_catalog_items"
Organization ||--o{ RacineOrchestrationMaster : "orchestrates"

User ||--o{ UserRole : "has_roles"
Role ||--o{ UserRole : "assigned_to_users"
Role ||--o{ RolePermission : "has_permissions"
Permission ||--o{ RolePermission : "granted_to_roles"

DataSource ||--o{ Scan : "scanned_by"
DataSource ||--o{ CatalogItem : "contains_items"
DataSource ||--o{ ComplianceEvaluation : "evaluated_for_compliance"

ScanRuleSet ||--o{ Scan : "used_in_scans"
Scan ||--o{ ScanResult : "produces_results"

ComplianceRule ||--o{ ComplianceEvaluation : "evaluated_by"

CatalogItem ||--o{ CatalogItem : "parent_child"
CatalogItem ||--o{ DataLineage : "source_lineage"
CatalogItem ||--o{ DataLineage : "target_lineage"
CatalogItem ||--o{ DataClassification : "classified_by"

ClassificationRule ||--o{ DataClassification : "applied_to_data"

RacineWorkspace ||--o{ RacineOrchestrationMaster : "managed_by"
RacineWorkspace ||--o{ RacineJobWorkflow : "contains_workflows"
RacineWorkspace ||--o{ RacinePipeline : "executes_pipelines"
RacineJobWorkflow ||--o{ RacinePipeline : "triggers_pipelines"

User ||--o{ AuditLog : "performs_actions"
```

---

## 10. Cloud Architecture Diagram - Advanced Infrastructure

```eraser
// PurSight Enterprise - Advanced Cloud Architecture
// Multi-region, high-availability, cloud-native deployment

cloud-style primary {
  fill: #0ea5e9
  stroke: #0284c7
  text-color: white
}

cloud-style secondary {
  fill: #059669
  stroke: #047857
  text-color: white
}

cloud-style database {
  fill: #7c3aed
  stroke: #6d28d9
  text-color: white
}

cloud-style security {
  fill: #dc2626
  stroke: #b91c1c
  text-color: white
}

cloud-style monitoring {
  fill: #ea580c
  stroke: #c2410c
  text-color: white
}

// Global Infrastructure
region GlobalInfrastructure [icon: global] {
  style: primary
  
  // DNS and CDN Layer
  zone DNSLayer [icon: dns] {
    style: primary
    
    service Route53 [icon: route53] {
      type: "DNS Service"
      features: ["Health Checks", "Failover", "Geolocation Routing"]
      latency: "< 10ms"
    }
    
    service CloudFront [icon: cloudfront] {
      type: "Global CDN"
      edge_locations: "300+"
      cache_behavior: "Optimized for SPA"
      ssl_termination: "TLS 1.3"
    }
    
    service WAF [icon: waf] {
      type: "Web Application Firewall"
      protection: ["DDoS", "SQL Injection", "XSS", "Rate Limiting"]
      rules: "Custom + Managed"
    }
  }
  
  // Primary Region (US-East-1)
  region PrimaryRegion [icon: region-primary] {
    style: primary
    location: "us-east-1"
    
    // Availability Zones
    zone AZ1 [icon: az] {
      style: secondary
      
      // EKS Cluster - Primary
      cluster EKSPrimary [icon: eks] {
        version: "1.28"
        node_groups: 3
        autoscaling: "enabled"
        
        // Control Plane
        service ControlPlane [icon: control-plane] {
          replicas: 3
          ha_mode: "multi-az"
          backup: "automated"
        }
        
        // Application Tier
        namespace ApplicationTier [icon: app-tier] {
          
          deployment RacineMainManager [icon: racine] {
            replicas: 5
            resources: "4 CPU, 8GB RAM"
            strategy: "rolling_update"
            
            service LoadBalancer [icon: alb] {
              type: "Application Load Balancer"
              target_groups: ["racine-ui", "racine-api"]
              health_checks: "deep"
            }
          }
          
          deployment PurSightAPI [icon: api] {
            replicas: 8
            resources: "6 CPU, 12GB RAM"
            hpa: "enabled (10-50 replicas)"
            
            service APIGateway [icon: api-gateway] {
              type: "Kong Enterprise"
              plugins: ["auth", "rate-limit", "cors", "monitoring"]
              ssl_passthrough: "enabled"
            }
          }
          
          deployment BackgroundWorkers [icon: workers] {
            replicas: 6
            resources: "4 CPU, 8GB RAM"
            job_types: ["scan", "compliance", "notification", "ml"]
          }
        }
        
        // Data Services Tier
        namespace DataServicesTier [icon: data-tier] {
          
          deployment PostgreSQLOperator [icon: postgres-operator] {
            type: "CloudNativePG"
            instances: 3
            storage: "1TB NVMe SSD"
            backup_strategy: "continuous_archiving"
            
            service PrimaryDB [icon: primary-db] {
              role: "read-write"
              connections: "max 2000"
              connection_pooling: "pgbouncer"
            }
            
            service ReadReplicas [icon: read-replicas] {
              count: 2
              role: "read-only"
              replication_lag: "< 5ms"
              load_balancing: "round_robin"
            }
          }
          
          deployment RedisCluster [icon: redis-cluster] {
            mode: "cluster"
            shards: 6
            replicas_per_shard: 2
            memory: "64GB total"
            persistence: "AOF + RDB"
            
            service CacheLayer [icon: cache] {
              use_case: "application_cache"
              eviction_policy: "allkeys-lru"
              ttl: "configurable"
            }
            
            service SessionStore [icon: session] {
              use_case: "user_sessions"
              persistence: "high_durability"
              clustering: "enabled"
            }
          }
          
          deployment MessageQueue [icon: message-queue] {
            type: "RabbitMQ Operator"
            nodes: 3
            ha_mode: "mirrored_queues"
            
            queue ScanJobs [icon: scan-queue] {
              durability: "persistent"
              routing: "topic_exchange"
              dlq: "enabled"
            }
            
            queue NotificationQueue [icon: notification-queue] {
              priority: "high"
              consumers: "multiple"
              retry_policy: "exponential_backoff"
            }
          }
        }
      }
      
      // Managed Services
      service RDS [icon: rds] {
        engine: "PostgreSQL 15"
        instance_class: "db.r6g.2xlarge"
        multi_az: "enabled"
        backup_retention: "30 days"
        encryption: "at_rest_and_in_transit"
      }
      
      service ElastiCache [icon: elasticache] {
        engine: "Redis 7.0"
        node_type: "cache.r6g.xlarge"
        num_nodes: 6
        cluster_mode: "enabled"
        auth_token: "enabled"
      }
      
      service S3 [icon: s3] {
        buckets: ["data-lake", "backups", "logs", "ml-models"]
        versioning: "enabled"
        encryption: "SSE-S3"
        lifecycle_policies: "intelligent_tiering"
      }
    }
    
    zone AZ2 [icon: az] {
      style: secondary
      
      // Disaster Recovery Components
      service StandbyRDS [icon: standby-rds] {
        type: "Read Replica"
        lag: "< 1 second"
        automatic_failover: "enabled"
      }
      
      service BackupElastiCache [icon: backup-cache] {
        type: "Cross-AZ Replica"
        sync_mode: "asynchronous"
      }
    }
    
    zone AZ3 [icon: az] {
      style: secondary
      
      // Additional Redundancy
      service TertiaryReplica [icon: tertiary] {
        purpose: "disaster_recovery"
        rpo: "< 15 minutes"
        rto: "< 5 minutes"
      }
    }
  }
  
  // Secondary Region (EU-West-1)
  region SecondaryRegion [icon: region-secondary] {
    style: secondary
    location: "eu-west-1"
    
    // Cross-Region Replication
    service CrossRegionReplication [icon: replication] {
      source: "us-east-1"
      target: "eu-west-1"
      sync_mode: "asynchronous"
      lag: "< 30 seconds"
    }
    
    // Disaster Recovery Cluster
    cluster DRCluster [icon: dr-cluster] {
      status: "warm_standby"
      activation_time: "< 15 minutes"
      data_sync: "continuous"
    }
  }
  
  // Monitoring and Observability Region
  region MonitoringRegion [icon: monitoring-region] {
    style: monitoring
    location: "us-west-2"
    
    // Observability Stack
    service PrometheusStack [icon: prometheus] {
      components: ["Prometheus", "Alertmanager", "Grafana"]
      retention: "90 days"
      high_availability: "enabled"
      
      dashboard OperationalDashboards [icon: dashboard] {
        count: "50+ custom dashboards"
        real_time: "< 5 second updates"
        alerting: "multi-channel"
      }
    }
    
    service ElasticStack [icon: elastic] {
      components: ["Elasticsearch", "Logstash", "Kibana", "Beats"]
      data_nodes: 9
      master_nodes: 3
      ingest_nodes: 3
      
      index LogIndices [icon: indices] {
        retention: "90 days"
        sharding: "time_based"
        replicas: 2
      }
    }
    
    service JaegerTracing [icon: jaeger] {
      deployment: "all_in_one + collector"
      sampling_rate: "adaptive"
      storage_backend: "elasticsearch"
      ui_access: "sso_integrated"
    }
  }
}

// Security Infrastructure
zone SecurityInfrastructure [icon: security] {
  style: security
  
  service IAMRoles [icon: iam] {
    principle: "least_privilege"
    rotation: "automated"
    mfa: "required"
    
    role ServiceRoles [icon: service-roles] {
      eks_cluster_role: "EKS management"
      node_group_role: "EC2 instances"
      rds_role: "database access"
      s3_role: "storage access"
    }
    
    role UserRoles [icon: user-roles] {
      admin_role: "full_access"
      developer_role: "limited_access"
      readonly_role: "view_only"
    }
  }
  
  service SecretsManager [icon: secrets] {
    secrets: ["db_credentials", "api_keys", "certificates"]
    rotation: "automated_90_days"
    encryption: "KMS_managed"
    access_logging: "cloudtrail"
  }
  
  service KMS [icon: kms] {
    keys: ["database", "s3", "ebs", "application"]
    key_rotation: "annual"
    access_policies: "restrictive"
  }
  
  service VPC [icon: vpc] {
    cidr: "10.0.0.0/16"
    subnets: "public + private + database"
    nat_gateways: 3
    internet_gateway: 1
    
    security_group ApplicationSG [icon: sg-app] {
      ingress: ["443/tcp", "80/tcp"]
      egress: "restricted"
    }
    
    security_group DatabaseSG [icon: sg-db] {
      ingress: ["5432/tcp from app subnets"]
      egress: "none"
    }
  }
}

// External Integrations
zone ExternalIntegrations [icon: external] {
  style: secondary
  
  service CloudProviderIntegrations [icon: cloud-integrations] {
    
    connector AzurePurview [icon: azure] {
      protocol: "OAuth 2.0"
      sync_frequency: "real_time"
      data_flow: "bidirectional"
      rate_limit: "1000 req/min"
    }
    
    connector AWSDataCatalog [icon: aws] {
      protocol: "IAM Cross-Account"
      integration_type: "api_based"
      regions: ["us-east-1", "us-west-2", "eu-west-1"]
    }
    
    connector GCPDataCatalog [icon: gcp] {
      protocol: "Service Account"
      features: ["metadata_sync", "lineage_tracking"]
      encryption: "end_to_end"
    }
  }
  
  service DataSourceConnections [icon: data-connections] {
    
    connector DatabaseConnectors [icon: db-connectors] {
      types: ["MySQL", "PostgreSQL", "MongoDB", "Oracle", "SQL Server"]
      connection_pooling: "enabled"
      ssl_enforcement: "required"
    }
    
    connector CloudStorageConnectors [icon: storage-connectors] {
      types: ["S3", "Azure Blob", "GCS", "HDFS"]
      access_methods: ["IAM", "SAS", "Service Account"]
    }
    
    connector StreamingConnectors [icon: streaming-connectors] {
      types: ["Kafka", "Kinesis", "Pub/Sub", "Event Hubs"]
      processing_mode: "real_time"
    }
  }
}

// Network Flow and Connections
Route53 -> CloudFront [label: "DNS Resolution" style: secure]
CloudFront -> WAF [label: "Traffic Filtering" style: secure]
WAF -> LoadBalancer [label: "Filtered Requests" style: secure]
LoadBalancer -> RacineMainManager [label: "Load Balanced" style: internal]
RacineMainManager -> PurSightAPI [label: "API Calls" style: internal]
PurSightAPI -> PostgreSQLOperator [label: "Database Queries" style: encrypted]
PurSightAPI -> RedisCluster [label: "Cache Operations" style: internal]
BackgroundWorkers -> MessageQueue [label: "Job Processing" style: async]

// Cross-Region Replication
PrimaryRegion -> SecondaryRegion [label: "Async Replication" style: replication]
PrimaryRegion -> MonitoringRegion [label: "Metrics & Logs" style: monitoring]

// Security Flows
IAMRoles -> EKSPrimary [label: "Authentication" style: secure]
SecretsManager -> PurSightAPI [label: "Credential Access" style: secure]
KMS -> RDS [label: "Encryption Keys" style: secure]

// External Integrations
PurSightAPI -> CloudProviderIntegrations [label: "External APIs" style: external]
PurSightAPI -> DataSourceConnections [label: "Data Access" style: external]

// Annotations
note over PrimaryRegion: "Multi-AZ deployment ensures 99.99% availability with automatic failover"
note over SecondaryRegion: "Cross-region DR provides RPO < 30s and RTO < 15min"
note over SecurityInfrastructure: "Zero-trust security model with comprehensive encryption and access controls"
note over MonitoringRegion: "Comprehensive observability with real-time monitoring and alerting"
```

---

## 11. BPMN Process Flow - Advanced Business Process Model

```eraser
// PurSight Enterprise - Advanced BPMN Process Flow
// Comprehensive business process modeling for data governance workflows

bpmn-style start {
  fill: #059669
  stroke: #047857
  text-color: white
}

bpmn-style task {
  fill: #1e40af
  stroke: #1d4ed8
  text-color: white
}

bpmn-style gateway {
  fill: #dc2626
  stroke: #b91c1c
  text-color: white
}

bpmn-style event {
  fill: #7c3aed
  stroke: #6d28d9
  text-color: white
}

bpmn-style subprocess {
  fill: #ea580c
  stroke: #c2410c
  text-color: white
}

// Data Governance Master Process
pool DataGovernanceProcess [icon: governance] {
  
  lane DataGovernanceManager [icon: manager] {
    
    start StartGovernance [icon: start] {
      style: start
      type: "Start Event"
      trigger: "Scheduled/Manual"
    }
    
    task InitializeRacineOrchestrator [icon: init] {
      style: task
      type: "Service Task"
      implementation: "RacineOrchestrationService"
      duration: "30 seconds"
    }
    
    gateway DecisionWorkspaceType [icon: decision] {
      style: gateway
      type: "Exclusive Gateway"
      condition: "Workspace Type Selection"
    }
    
    task CreateEnterpriseWorkspace [icon: enterprise-workspace] {
      style: task
      type: "User Task"
      assignee: "Data Governance Manager"
      form: "workspace_configuration_form"
    }
    
    task CreateDepartmentalWorkspace [icon: dept-workspace] {
      style: task
      type: "User Task"
      assignee: "Department Manager"
      form: "dept_workspace_form"
    }
    
    subprocess CrossGroupOrchestration [icon: cross-group] {
      style: subprocess
      type: "Sub Process"
      expanded: true
      
      // Parallel Gateway for simultaneous group processing
      gateway ParallelStart [icon: parallel-start] {
        style: gateway
        type: "Parallel Gateway"
        direction: "diverging"
      }
      
      // Data Sources Sub-Process
      task ProcessDataSources [icon: datasources] {
        style: task
        type: "Service Task"
        implementation: "DataSourceService"
        
        subprocess DataSourceSubProcess [icon: ds-subprocess] {
          style: subprocess
          
          task ConnectDataSources [icon: connect] {
            style: task
            type: "Service Task"
            retry_cycle: "3 attempts"
          }
          
          task ValidateConnections [icon: validate] {
            style: task
            type: "Business Rule Task"
            rule_set: "connection_validation_rules"
          }
          
          event ConnectionError [icon: error] {
            style: event
            type: "Error Boundary Event"
            error_code: "CONNECTION_FAILED"
          }
          
          task HandleConnectionError [icon: handle-error] {
            style: task
            type: "Manual Task"
            assignee: "System Administrator"
          }
        }
      }
      
      // Compliance Rules Sub-Process
      task ProcessComplianceRules [icon: compliance] {
        style: task
        type: "Service Task"
        implementation: "ComplianceRuleService"
        
        subprocess ComplianceSubProcess [icon: compliance-subprocess] {
          style: subprocess
          
          task LoadComplianceRules [icon: load-rules] {
            style: task
            type: "Service Task"
            data_input: "compliance_rule_repository"
          }
          
          task EvaluateCompliance [icon: evaluate] {
            style: task
            type: "Business Rule Task"
            rule_engine: "Drools"
            parallel_execution: true
          }
          
          gateway ComplianceDecision [icon: compliance-decision] {
            style: gateway
            type: "Exclusive Gateway"
            condition: "Compliance Status"
          }
          
          task GenerateComplianceReport [icon: generate-report] {
            style: task
            type: "Service Task"
            output: "compliance_report.pdf"
          }
          
          task TriggerRemediation [icon: remediation] {
            style: task
            type: "Send Task"
            message: "remediation_required"
          }
        }
      }
      
      // Classification Sub-Process
      task ProcessClassification [icon: classify] {
        style: task
        type: "Service Task"
        implementation: "ClassificationService"
        
        subprocess ClassificationSubProcess [icon: classify-subprocess] {
          style: subprocess
          
          task InitializeAIModels [icon: ai-init] {
            style: task
            type: "Service Task"
            model_loading: "parallel"
          }
          
          task ExecuteClassification [icon: execute-classify] {
            style: task
            type: "Service Task"
            ai_engine: "TensorFlow/PyTorch"
            batch_processing: true
          }
          
          task ValidateClassifications [icon: validate-classify] {
            style: task
            type: "User Task"
            assignee: "Data Steward"
            confidence_threshold: "0.8"
          }
          
          event ClassificationTimer [icon: timer] {
            style: event
            type: "Timer Boundary Event"
            duration: "PT30M"
          }
          
          task HandleTimeout [icon: timeout] {
            style: task
            type: "Service Task"
            action: "save_partial_results"
          }
        }
      }
      
      // Scan-Rule-Sets Sub-Process
      task ProcessScanRuleSets [icon: scanrules] {
        style: task
        type: "Service Task"
        implementation: "ScanRuleSetService"
        
        subprocess ScanRuleSetSubProcess [icon: scanrules-subprocess] {
          style: subprocess
          
          task LoadScanRuleSets [icon: load-scanrules] {
            style: task
            type: "Service Task"
            rule_repository: "scan_rule_repository"
          }
          
          task OptimizeScanRules [icon: optimize] {
            style: task
            type: "Business Rule Task"
            optimization_engine: "custom"
          }
          
          task ExecuteScans [icon: execute-scans] {
            style: task
            type: "Service Task"
            parallel_workers: "configurable"
          }
          
          event ScanProgress [icon: progress] {
            style: event
            type: "Message Intermediate Event"
            message: "scan_progress_update"
          }
        }
      }
      
      // Data Catalog Sub-Process
      task ProcessDataCatalog [icon: catalog] {
        style: task
        type: "Service Task"
        implementation: "CatalogService"
        
        subprocess DataCatalogSubProcess [icon: catalog-subprocess] {
          style: subprocess
          
          task DiscoverDataAssets [icon: discover] {
            style: task
            type: "Service Task"
            discovery_method: "automated"
          }
          
          task EnrichMetadata [icon: enrich] {
            style: task
            type: "Service Task"
            ai_enhancement: true
          }
          
          task BuildLineage [icon: lineage] {
            style: task
            type: "Service Task"
            lineage_engine: "Apache Atlas"
          }
          
          task UpdateSearchIndex [icon: search-index] {
            style: task
            type: "Service Task"
            search_engine: "Elasticsearch"
          }
        }
      }
      
      // Scan Logic Sub-Process
      task ProcessScanLogic [icon: scanlogic] {
        style: task
        type: "Service Task"
        implementation: "ScanService"
        
        subprocess ScanLogicSubProcess [icon: scanlogic-subprocess] {
          style: subprocess
          
          task InitializeScanEngine [icon: scan-init] {
            style: task
            type: "Service Task"
            engine_type: "distributed"
          }
          
          task ExecuteIntelligentScans [icon: intelligent-scan] {
            style: task
            type: "Service Task"
            ai_optimization: true
          }
          
          task AnalyzeScanResults [icon: analyze] {
            style: task
            type: "Business Rule Task"
            analysis_engine: "custom_ml"
          }
          
          task GenerateScanReport [icon: scan-report] {
            style: task
            type: "Service Task"
            report_formats: ["PDF", "JSON", "Excel"]
          }
        }
      }
      
      // RBAC Sub-Process
      task ProcessRBAC [icon: rbac] {
        style: task
        type: "Service Task"
        implementation: "RBACService"
        
        subprocess RBACSubProcess [icon: rbac-subprocess] {
          style: subprocess
          
          task ValidatePermissions [icon: validate-perms] {
            style: task
            type: "Business Rule Task"
            permission_engine: "ABAC"
          }
          
          task EnforceAccessControl [icon: enforce] {
            style: task
            type: "Service Task"
            enforcement_points: "all_endpoints"
          }
          
          task AuditAccess [icon: audit] {
            style: task
            type: "Service Task"
            audit_logging: "comprehensive"
          }
        }
      }
      
      // Parallel Join
      gateway ParallelJoin [icon: parallel-join] {
        style: gateway
        type: "Parallel Gateway"
        direction: "converging"
      }
    }
    
    task ConsolidateResults [icon: consolidate] {
      style: task
      type: "Service Task"
      implementation: "ResultConsolidationService"
      aggregation: "intelligent"
    }
    
    gateway QualityGate [icon: quality-gate] {
      style: gateway
      type: "Inclusive Gateway"
      conditions: ["data_quality_score >= 0.8", "compliance_score >= 0.9"]
    }
    
    task GenerateGovernanceDashboard [icon: dashboard] {
      style: task
      type: "Service Task"
      implementation: "DashboardService"
      real_time_updates: true
    }
    
    task SendNotifications [icon: notifications] {
      style: task
      type: "Send Task"
      recipients: ["stakeholders", "data_stewards", "compliance_officers"]
      channels: ["email", "slack", "teams"]
    }
    
    event GovernanceCycleComplete [icon: complete] {
      style: event
      type: "End Event"
      result: "governance_cycle_completed"
    }
    
    // Error Handling
    event SystemError [icon: system-error] {
      style: event
      type: "Error Boundary Event"
      error_codes: ["SYSTEM_FAILURE", "TIMEOUT", "RESOURCE_EXHAUSTION"]
    }
    
    task HandleSystemError [icon: handle-system-error] {
      style: task
      type: "Manual Task"
      assignee: "System Administrator"
      escalation: "immediate"
    }
    
    // Compensation Handling
    event CompensationTrigger [icon: compensation] {
      style: event
      type: "Compensation Intermediate Event"
      trigger_condition: "partial_failure"
    }
    
    task RollbackChanges [icon: rollback] {
      style: task
      type: "Service Task"
      compensation_logic: "transactional_rollback"
    }
  }
  
  // External Systems Lane
  lane ExternalSystems [icon: external] {
    
    task AzurePurviewSync [icon: azure-sync] {
      style: task
      type: "Service Task"
      sync_frequency: "real_time"
      protocol: "OAuth 2.0"
    }
    
    task AWSIntegration [icon: aws-integration] {
      style: task
      type: "Service Task"
      services: ["Data Catalog", "Glue", "Lake Formation"]
    }
    
    task GCPIntegration [icon: gcp-integration] {
      style: task
      type: "Service Task"
      services: ["Data Catalog", "Cloud DLP"]
    }
  }
  
  // Monitoring and Alerting Lane
  lane MonitoringSystem [icon: monitoring] {
    
    event MonitoringStart [icon: monitor-start] {
      style: event
      type: "Message Start Event"
      message: "monitoring_enabled"
    }
    
    task CollectMetrics [icon: collect-metrics] {
      style: task
      type: "Service Task"
      metrics: ["performance", "quality", "compliance", "usage"]
      frequency: "every_5_seconds"
    }
    
    gateway AlertThreshold [icon: alert-threshold] {
      style: gateway
      type: "Event-based Gateway"
      events: ["performance_degradation", "compliance_violation", "error_spike"]
    }
    
    task TriggerAlert [icon: trigger-alert] {
      style: task
      type: "Send Task"
      alert_channels: ["PagerDuty", "Slack", "Email"]
      severity_levels: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    }
    
    event AlertResolved [icon: alert-resolved] {
      style: event
      type: "Message Intermediate Event"
      message: "alert_acknowledged"
    }
  }
}

// Message Flows between lanes
DataGovernanceManager -> ExternalSystems [label: "Integration Requests" style: message]
ExternalSystems -> DataGovernanceManager [label: "Sync Responses" style: message]
DataGovernanceManager -> MonitoringSystem [label: "Process Events" style: message]
MonitoringSystem -> DataGovernanceManager [label: "Alerts & Metrics" style: message]

// Sequence Flows within Data Governance Manager lane
StartGovernance -> InitializeRacineOrchestrator
InitializeRacineOrchestrator -> DecisionWorkspaceType
DecisionWorkspaceType -> CreateEnterpriseWorkspace [condition: "Enterprise"]
DecisionWorkspaceType -> CreateDepartmentalWorkspace [condition: "Departmental"]
CreateEnterpriseWorkspace -> CrossGroupOrchestration
CreateDepartmentalWorkspace -> CrossGroupOrchestration

// Cross-Group Orchestration flows
CrossGroupOrchestration.ParallelStart -> ProcessDataSources
CrossGroupOrchestration.ParallelStart -> ProcessComplianceRules
CrossGroupOrchestration.ParallelStart -> ProcessClassification
CrossGroupOrchestration.ParallelStart -> ProcessScanRuleSets
CrossGroupOrchestration.ParallelStart -> ProcessDataCatalog
CrossGroupOrchestration.ParallelStart -> ProcessScanLogic
CrossGroupOrchestration.ParallelStart -> ProcessRBAC

ProcessDataSources -> CrossGroupOrchestration.ParallelJoin
ProcessComplianceRules -> CrossGroupOrchestration.ParallelJoin
ProcessClassification -> CrossGroupOrchestration.ParallelJoin
ProcessScanRuleSets -> CrossGroupOrchestration.ParallelJoin
ProcessDataCatalog -> CrossGroupOrchestration.ParallelJoin
ProcessScanLogic -> CrossGroupOrchestration.ParallelJoin
ProcessRBAC -> CrossGroupOrchestration.ParallelJoin

CrossGroupOrchestration -> ConsolidateResults
ConsolidateResults -> QualityGate
QualityGate -> GenerateGovernanceDashboard [condition: "Quality Passed"]
QualityGate -> HandleSystemError [condition: "Quality Failed"]
GenerateGovernanceDashboard -> SendNotifications
SendNotifications -> GovernanceCycleComplete

// Error handling flows
SystemError -> HandleSystemError
HandleSystemError -> CompensationTrigger
CompensationTrigger -> RollbackChanges
RollbackChanges -> InitializeRacineOrchestrator

// Monitoring flows
MonitoringStart -> CollectMetrics
CollectMetrics -> AlertThreshold
AlertThreshold -> TriggerAlert [event: "threshold_exceeded"]
TriggerAlert -> AlertResolved
AlertResolved -> CollectMetrics

// Annotations
note over CrossGroupOrchestration: "Revolutionary parallel processing of all 7 core groups enables unprecedented governance efficiency"
note over QualityGate: "Intelligent quality gates ensure only high-quality results proceed to stakeholder notification"
note over MonitoringSystem: "Real-time monitoring provides immediate visibility into all governance operations"
```

This comprehensive set of advanced software architecture diagrams provides:

1. **Component Diagram** - Shows the complete system architecture with all major components and their relationships
2. **Package Diagram** - Illustrates the detailed package structure and dependencies
3. **Class Diagram** - Presents core classes and their relationships with proper inheritance
4. **Sequence Diagrams** - Demonstrates interaction flows for key business processes
5. **Deployment Diagram** - Shows the cloud-native infrastructure deployment
6. **Use Case Diagram** - Covers all user interactions and system capabilities
7. **State Diagram** - Illustrates system state transitions across all components
8. **Activity Diagram** - Shows comprehensive business process flows
9. **Entity Relationship Diagram** - Complete data model with all relationships
10. **Cloud Architecture Diagram** - Advanced multi-region cloud deployment
11. **BPMN Process Flow** - Detailed business process modeling

All diagrams are designed in eraser.io format with:
- **Advanced animations and flow connections**
- **Professional icons and styling**
- **Comprehensive coverage of the PurSight system**
- **Production-ready architecture details**
- **Enterprise-level complexity and sophistication**

These diagrams collectively represent the revolutionary PurSight Enterprise Data Governance Platform that surpasses industry competitors through its advanced Racine orchestration system and comprehensive integration capabilities.