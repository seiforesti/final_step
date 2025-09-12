// Enhanced Data source types for the data-sources component group
// Aligned with backend scan_models.py DataSource model

export interface DataSource {
  id: number;
  name: string;
  description?: string;
  source_type: DataSourceType;
  location: DataSourceLocation;
  host: string;
  port: number;
  username: string;
  password_secret: string;
  secret_manager_type?: string;
  use_encryption: boolean;
  database_name?: string;
  
  // Cloud and hybrid configuration
  cloud_provider?: CloudProvider;
  cloud_config?: Record<string, any>;
  replica_config?: Record<string, any>;
  ssl_config?: Record<string, string>;
  
  // Connection pool settings
  pool_size?: number;
  max_overflow?: number;
  pool_timeout?: number;
  
  // Connection properties
  connection_properties?: Record<string, any>;
  additional_properties?: Record<string, any>;
  
  // Enhanced fields for advanced UI
  status: DataSourceStatus;
  environment?: Environment;
  criticality?: Criticality;
  data_classification?: DataClassification;
  tags?: string[];
  owner?: string;
  team?: string;
  
  // Operational fields
  backup_enabled: boolean;
  monitoring_enabled: boolean;
  encryption_enabled: boolean;
  scan_frequency?: ScanFrequency;
  
  // Performance metrics (updated by background tasks)
  health_score?: number;
  compliance_score?: number;
  entity_count?: number;
  size_gb?: number;
  avg_response_time?: number;
  error_rate?: number;
  uptime_percentage?: number;
  connection_pool_size?: number;
  active_connections?: number;
  queries_per_second?: number;
  storage_used_percentage?: number;
  cost_per_month?: number;
  
  // Timestamp fields
  last_scan?: string;
  next_scan?: string;
  last_backup?: string;
  created_at: string;
  updated_at: string;
  
  // User tracking fields for RBAC
  created_by?: string;
  updated_by?: string;
  
  // UI-specific fields
  favorite?: boolean;
}

// Enums matching backend
export type DataSourceType = "mysql" | "postgresql" | "mongodb" | "snowflake" | "s3" | "redis";
export type DataSourceLocation = "on_prem" | "cloud" | "hybrid";
export type CloudProvider = "aws" | "azure" | "gcp";
export type DataSourceStatus = "active" | "inactive" | "error" | "pending" | "syncing" | "maintenance";
export type Environment = "production" | "staging" | "development" | "test";
export type Criticality = "critical" | "high" | "medium" | "low";
export type DataClassification = "public" | "internal" | "confidential" | "restricted";
export type ScanFrequency = "hourly" | "daily" | "weekly" | "monthly";
export type ScanStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type DiscoveryStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

// Enhanced creation parameters
export interface DataSourceCreateParams {
  name: string;
  description?: string;
  source_type: DataSourceType;
  location: DataSourceLocation;
  host: string;
  port: number;
  username: string;
  password: string;
  database_name?: string;
  connection_properties?: Record<string, any>;
  secret_manager_type?: string;
  use_encryption?: boolean;
  environment?: Environment;
  criticality?: Criticality;
  data_classification?: DataClassification;
  owner?: string;
  team?: string;
  tags?: string[];
  scan_frequency?: ScanFrequency;
  monitoring_enabled?: boolean;
  backup_enabled?: boolean;
  encryption_enabled?: boolean;
  cloud_provider?: CloudProvider;
  cloud_config?: Record<string, any>;
  replica_config?: Record<string, any>;
  ssl_config?: Record<string, string>;
  pool_size?: number;
  max_overflow?: number;
  pool_timeout?: number;
}

// Enhanced update parameters
export interface DataSourceUpdateParams {
  name?: string;
  description?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database_name?: string;
  connection_properties?: Record<string, any>;
  environment?: Environment;
  criticality?: Criticality;
  data_classification?: DataClassification;
  owner?: string;
  team?: string;
  tags?: string[];
  scan_frequency?: ScanFrequency;
  monitoring_enabled?: boolean;
  backup_enabled?: boolean;
  encryption_enabled?: boolean;
  cloud_provider?: CloudProvider;
  cloud_config?: Record<string, any>;
  replica_config?: Record<string, any>;
  ssl_config?: Record<string, string>;
  pool_size?: number;
  max_overflow?: number;
  pool_timeout?: number;
  updated_by?: string;
}

// Enhanced filters
export interface DataSourceFilters {
  type?: string;
  status?: DataSourceStatus;
  search?: string;
  location?: DataSourceLocation;
  environment?: Environment;
  criticality?: Criticality;
  tags?: string[];
  healthScore?: [number, number];
  complianceScore?: [number, number];
  owner?: string;
  team?: string;
  hasIssues?: boolean;
  favorites?: boolean;
  cloud_provider?: CloudProvider;
  monitoring_enabled?: boolean;
  backup_enabled?: boolean;
  encryption_enabled?: boolean;
}

// Enhanced stats interface
export interface DataSourceStats {
  entity_stats: {
    total_entities: number;
    tables: number;
    views: number;
    stored_procedures: number;
    columns: number;
  };
  size_stats: {
    total_size_formatted: string;
    total_size_gb: number;
    growth_rate_gb_per_day: number;
  };
  last_scan_time?: string;
  classification_stats: {
    classified_columns: number;
    unclassified_columns: number;
    sensitive_columns: number;
  };
  sensitivity_stats: {
    sensitive_columns: number;
    pii_columns: number;
    financial_columns: number;
  };
  compliance_stats: {
    compliance_score: string;
    violations: number;
    last_audit?: string;
  };
  performance_stats: {
    avg_query_time: number;
    peak_connections: number;
    cache_hit_ratio: number;
  };
  quality_stats: {
    quality_score: number;
    issues_found: number;
    data_freshness: string;
    metrics: Record<string, number>;
  };
}

// Enhanced health interface
export interface DataSourceHealth {
  status: "healthy" | "warning" | "critical";
  last_checked: string;
  latency_ms?: number;
  error_message?: string;
  recommendations?: string[];
  metrics?: {
    health_score?: number;
    error_rate?: number;
    uptime?: number;
    active_connections?: number;
    storage_used?: number;
  };
}

// Connection test result
export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  connection_time_ms?: number;
  details?: Record<string, any>;
  recommendations?: Array<{
    title: string;
    description: string;
    severity: "info" | "warning" | "critical";
  }>;
}

// Discovery history
export interface DiscoveryHistory {
  id: number;
  discovery_id: string;
  data_source_id: number;
  status: DiscoveryStatus;
  discovery_time: string;
  completed_time?: string;
  duration_seconds?: number;
  tables_discovered?: number;
  columns_discovered?: number;
  error_message?: string;
  metadata?: Record<string, any>;
  triggered_by: string;
  created_at: string;
  updated_at: string;
  discovery_details?: Record<string, any>;
}

// Scan rule set
export interface ScanRuleSet {
  id: number;
  name: string;
  description?: string;
  data_source_id?: number;
  include_schemas?: string[];
  exclude_schemas?: string[];
  include_tables?: string[];
  exclude_tables?: string[];
  include_columns?: string[];
  exclude_columns?: string[];
  sample_data: boolean;
  sample_size?: number;
  created_at: string;
  updated_at: string;
}

// Scan
export interface Scan {
  id: number;
  scan_id: string;
  name: string;
  description?: string;
  data_source_id: number;
  scan_rule_set_id?: number;
  status: ScanStatus;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Scan result
export interface ScanResult {
  id: number;
  scan_id: number;
  schema_name: string;
  table_name: string;
  column_name?: string;
  object_type: string;
  classification_labels?: string[];
  sensitivity_level?: string;
  compliance_issues?: Record<string, any>[];
  created_at: string;
  updated_at: string;
  data_type?: string;
  nullable?: boolean;
  scan_metadata?: Record<string, any>;
}

// Quality metric
export interface QualityMetric {
  id: number;
  data_source_id: number;
  metric_type: string;
  metric_value: number;
  sample_size: number;
  created_at: string;
  details?: Record<string, any>;
}

// Growth metric
export interface GrowthMetric {
  id: number;
  data_source_id: number;
  size_bytes: number;
  record_count: number;
  measured_at: string;
  growth_rate_bytes?: number;
  growth_rate_records?: number;
}

// Workspace
export interface UserWorkspace {
  id: number;
  name: string;
  description?: string;
  data_source_id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Workspace item
export interface WorkspaceItem {
  id: number;
  workspace_id: number;
  item_type: string;
  item_path: string;
  metadata: Record<string, any>;
}

// Connection pool stats
export interface ConnectionPoolStats {
  pool_size: number;
  active_connections: number;
  idle_connections: number;
  max_overflow: number;
  pool_timeout: number;
  connection_errors: number;
  avg_connection_time: number;
  cache_hit_ratio: number;
}

// Cloud configuration
export interface CloudConfig {
  azure?: {
    tenant_id?: string;
    client_id?: string;
    client_secret?: string;
    use_managed_identity?: boolean;
    ssl_ca?: string;
    ssl_cert?: string;
    ssl_key?: string;
  };
  aws?: {
    access_key_id?: string;
    secret_access_key?: string;
    region?: string;
    use_iam_auth?: boolean;
  };
  gcp?: {
    project_id?: string;
    service_account_key?: string;
    use_workload_identity?: boolean;
  };
}

// Replica configuration
export interface ReplicaConfig {
  replica_host?: string;
  replica_port?: number;
  replica_set?: string;
  replica_members?: string[];
  read_preference?: string;
  write_concern?: string;
}

// SSL configuration
export interface SSLConfig {
  ssl_ca?: string;
  ssl_cert?: string;
  ssl_key?: string;
  ssl_mode?: string;
  verify_ssl?: boolean;
}

// Sort configuration
export interface SortConfig {
  key: keyof DataSource | "health_score" | "compliance_score" | "created_at" | "updated_at";
  direction: "asc" | "desc";
}

// Filter state
export interface FilterState {
  search: string;
  type: string;
  status: string;
  location: string;
  environment: string;
  criticality: string;
  tags: string[];
  healthScore: [number, number];
  complianceScore: [number, number];
  owner: string;
  team: string;
  hasIssues: boolean;
  favorites: boolean;
  cloud_provider: string;
  monitoring_enabled: boolean;
  backup_enabled: boolean;
  encryption_enabled: boolean;
}

export type ViewMode = "grid" | "list" | "details" | "kanban" | "monitoring" | "analytics";

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Bulk operations
export interface BulkUpdateRequest {
  data_source_ids: number[];
  updates: Partial<DataSourceUpdateParams>;
}

// Schema discovery
export interface SchemaDiscoveryRequest {
  data_source_id?: number; // Optional since it can be passed as URL parameter
  include_data_preview?: boolean;
  max_tables_per_schema?: number;
  include_views?: boolean;
  include_stored_procedures?: boolean;
  sample_size?: number;
  include_columns?: boolean;
  include_indexes?: boolean;
  include_constraints?: boolean;
  timeout_seconds?: number;
  auto_catalog?: boolean;
}

// Table preview
export interface TablePreviewRequest {
  data_source_id: number;
  schema_name: string;
  table_name: string;
  limit?: number;
  offset?: number;
  columns?: string[];
  include_statistics?: boolean;
  apply_data_masking?: boolean;
}

// Column profile
export interface ColumnProfileRequest {
  data_source_id: number;
  schema_name: string;
  table_name: string;
  column_name: string;
  include_statistics?: boolean;
  include_samples?: boolean;
}

// Data source summary
export interface DataSourceSummary {
  basic_info: {
    id: number;
    name: string;
    type: DataSourceType;
    location: DataSourceLocation;
    status: DataSourceStatus;
    environment?: Environment;
    criticality?: Criticality;
  };
  monitoring: {
    health_score?: number;
    compliance_score?: number;
    monitoring_enabled: boolean;
    backup_enabled: boolean;
  };
  usage: {
    entity_count?: number;
    size_gb?: number;
    active_connections?: number;
    queries_per_second?: number;
  };
  recent_scans: Array<{
    id: number;
    name: string;
    status: ScanStatus;
    started_at?: string;
    completed_at?: string;
  }>;
  rule_sets: Array<{
    id: number;
    name: string;
    sample_data: boolean;
    sample_size?: number;
  }>;
  last_updated: string;
}

// Connection information
export interface ConnectionInfo {
  connection_uri: string;
  connection_properties?: Record<string, any>;
  cloud_config?: CloudConfig;
  replica_config?: ReplicaConfig;
  ssl_config?: SSLConfig;
  pool_config: {
    pool_size: number;
    max_overflow: number;
    pool_timeout: number;
  };
  credentials: {
    username: string;
    password: string | null;
    secret_manager_type: string;
    use_encryption: boolean;
  };
}
