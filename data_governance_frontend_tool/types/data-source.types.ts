// Data Source types aligned with backend models from scan_models.py

export enum DataSourceType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  MONGODB = 'mongodb',
  SNOWFLAKE = 'snowflake',
  S3 = 's3',
  REDIS = 'redis',
}

export enum CloudProvider {
  AWS = 'aws',
  AZURE = 'azure',
  GCP = 'gcp',
}

export enum DataSourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
  SYNCING = 'syncing',
  MAINTENANCE = 'maintenance',
}

export enum Environment {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  TEST = 'test',
}

export enum Criticality {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

export enum ScanFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum DataSourceLocation {
  ON_PREM = 'on_prem',
  CLOUD = 'cloud',
  HYBRID = 'hybrid',
}

// Main DataSource interface based on backend model
export interface DataSource {
  id: string;
  name: string;
  description?: string;
  type: DataSourceType;
  status: DataSourceStatus;
  environment: Environment;
  criticality: Criticality;
  classification: DataClassification;
  location: DataSourceLocation;
  cloud_provider?: CloudProvider;
  region?: string;
  
  // Connection details
  connection_config: ConnectionConfig;
  
  // Metadata and settings
  metadata: DataSourceMetadata;
  scan_settings: ScanSettings;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Statistics
  statistics?: DataSourceStatistics;
  
  // Health and monitoring
  health_status?: HealthStatus;
  last_scan?: string;
  next_scan?: string;
  
  // Relationships
  schemas?: Schema[];
  scans?: DataSourceScan[];
  tags?: DataSourceTag[];
}

export interface ConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  username?: string;
  password_encrypted?: string;
  connection_string?: string;
  ssl_enabled?: boolean;
  ssl_config?: SSLConfig;
  timeout_seconds?: number;
  pool_size?: number;
  additional_params?: Record<string, any>;
}

export interface SSLConfig {
  ssl_mode: 'disable' | 'require' | 'verify-ca' | 'verify-full';
  ssl_cert?: string;
  ssl_key?: string;
  ssl_ca?: string;
}

export interface DataSourceMetadata {
  business_owner?: string;
  technical_owner?: string;
  department?: string;
  cost_center?: string;
  compliance_requirements?: string[];
  retention_policy?: RetentionPolicy;
  backup_policy?: BackupPolicy;
  monitoring_config?: MonitoringConfig;
  custom_fields?: Record<string, any>;
}

export interface RetentionPolicy {
  retention_period_days: number;
  archive_after_days?: number;
  delete_after_days?: number;
  policy_type: 'time_based' | 'version_based' | 'size_based';
}

export interface BackupPolicy {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention_days: number;
  backup_location?: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  alert_thresholds: AlertThresholds;
  notification_channels?: string[];
}

export interface AlertThresholds {
  connection_failures: number;
  response_time_ms: number;
  error_rate_percent: number;
  disk_usage_percent: number;
}

export interface ScanSettings {
  enabled: boolean;
  frequency: ScanFrequency;
  scan_types: ScanType[];
  include_patterns?: string[];
  exclude_patterns?: string[];
  max_depth?: number;
  sample_size?: number;
  parallel_threads?: number;
  schedule_config?: ScheduleConfig;
}

export enum ScanType {
  SCHEMA_DISCOVERY = 'schema_discovery',
  DATA_PROFILING = 'data_profiling',
  SENSITIVITY_DETECTION = 'sensitivity_detection',
  QUALITY_ASSESSMENT = 'quality_assessment',
  LINEAGE_MAPPING = 'lineage_mapping',
}

export interface ScheduleConfig {
  cron_expression?: string;
  timezone?: string;
  enabled_days?: number[];
  start_time?: string;
  end_time?: string;
}

export interface DataSourceStatistics {
  total_tables: number;
  total_columns: number;
  total_rows: number;
  total_size_bytes: number;
  schema_count: number;
  last_updated: string;
  growth_rate_percent?: number;
  quality_score?: number;
}

export interface HealthStatus {
  overall_status: 'healthy' | 'warning' | 'critical' | 'unknown';
  last_check: string;
  response_time_ms: number;
  connection_status: 'connected' | 'disconnected' | 'timeout';
  error_count_24h: number;
  uptime_percent_30d: number;
  issues?: HealthIssue[];
}

export interface HealthIssue {
  type: 'connection' | 'performance' | 'security' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  detected_at: string;
  resolved_at?: string;
}

// Schema and structure interfaces
export interface Schema {
  id: string;
  name: string;
  data_source_id: string;
  description?: string;
  table_count: number;
  created_at: string;
  updated_at: string;
  tables?: Table[];
}

export interface Table {
  id: string;
  name: string;
  schema_id: string;
  type: 'table' | 'view' | 'materialized_view';
  description?: string;
  row_count?: number;
  size_bytes?: number;
  created_at: string;
  updated_at: string;
  columns?: Column[];
  indexes?: TableIndex[];
}

export interface Column {
  id: string;
  name: string;
  table_id: string;
  data_type: string;
  is_nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  default_value?: string;
  description?: string;
  classification?: DataClassification;
  sensitivity_level?: 'low' | 'medium' | 'high' | 'critical';
  quality_score?: number;
  distinct_values?: number;
  null_percentage?: number;
}

export interface TableIndex {
  id: string;
  name: string;
  table_id: string;
  type: 'primary' | 'unique' | 'index' | 'foreign';
  columns: string[];
  is_unique: boolean;
}

// Scan and discovery interfaces
export interface DataSourceScan {
  id: string;
  data_source_id: string;
  type: ScanType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  progress_percent: number;
  results?: ScanResults;
  error_message?: string;
  triggered_by?: string;
  configuration?: Record<string, any>;
}

export interface ScanResults {
  schemas_discovered: number;
  tables_discovered: number;
  columns_discovered: number;
  sensitive_data_found: number;
  quality_issues: number;
  lineage_connections: number;
  summary: Record<string, any>;
  details?: ScanResultDetails[];
}

export interface ScanResultDetails {
  type: 'schema' | 'table' | 'column' | 'issue' | 'lineage';
  name: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

// Tags and categorization
export interface DataSourceTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: 'business' | 'technical' | 'compliance' | 'security';
  created_at: string;
}

// Connection testing and validation
export interface ConnectionTest {
  success: boolean;
  response_time_ms: number;
  error_message?: string;
  details: ConnectionTestDetails;
  timestamp: string;
}

export interface ConnectionTestDetails {
  host_reachable: boolean;
  port_open: boolean;
  authentication_success: boolean;
  database_accessible: boolean;
  permissions_verified: boolean;
  ssl_verified?: boolean;
}

// Data source discovery and auto-detection
export interface DataSourceDiscovery {
  id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  discovered_sources: DiscoveredSource[];
  configuration: DiscoveryConfiguration;
}

export interface DiscoveredSource {
  type: DataSourceType;
  host: string;
  port: number;
  database?: string;
  confidence_score: number;
  metadata: Record<string, any>;
  suggested_name: string;
}

export interface DiscoveryConfiguration {
  network_ranges: string[];
  port_ranges: PortRange[];
  authentication_methods: string[];
  timeout_seconds: number;
  max_concurrent_scans: number;
}

export interface PortRange {
  start: number;
  end: number;
}

// Performance and monitoring
export interface DataSourcePerformance {
  data_source_id: string;
  timestamp: string;
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert[];
}

export interface PerformanceMetrics {
  connection_count: number;
  active_queries: number;
  avg_response_time_ms: number;
  throughput_queries_per_second: number;
  error_rate_percent: number;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  network_io_mbps: number;
}

export interface PerformanceAlert {
  type: 'threshold_exceeded' | 'anomaly_detected' | 'connection_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  threshold: number;
  actual_value: number;
  timestamp: string;
}

// Data lineage and relationships
export interface DataLineage {
  source_id: string;
  target_id: string;
  type: 'direct' | 'transformation' | 'aggregation' | 'join';
  confidence_score: number;
  metadata: LineageMetadata;
  discovered_at: string;
}

export interface LineageMetadata {
  transformation_type?: string;
  sql_query?: string;
  job_name?: string;
  frequency?: string;
  last_execution?: string;
}

// Forms and UI specific types
export interface DataSourceFormData {
  name: string;
  description?: string;
  type: DataSourceType;
  environment: Environment;
  criticality: Criticality;
  classification: DataClassification;
  location: DataSourceLocation;
  cloud_provider?: CloudProvider;
  region?: string;
  connection_config: Partial<ConnectionConfig>;
  metadata: Partial<DataSourceMetadata>;
  scan_settings: Partial<ScanSettings>;
  tags: string[];
}

export interface DataSourceFilters {
  types?: DataSourceType[];
  statuses?: DataSourceStatus[];
  environments?: Environment[];
  criticalities?: Criticality[];
  classifications?: DataClassification[];
  cloud_providers?: CloudProvider[];
  tags?: string[];
  search?: string;
  created_after?: string;
  created_before?: string;
  last_scan_after?: string;
  last_scan_before?: string;
}

// API response types
export interface DataSourcesResponse {
  data_sources: DataSource[];
  total: number;
  page: number;
  limit: number;
  filters_applied: DataSourceFilters;
}

export interface DataSourceDetailsResponse extends DataSource {
  recent_scans: DataSourceScan[];
  performance_history: DataSourcePerformance[];
  lineage_connections: DataLineage[];
  related_assets: RelatedAsset[];
}

export interface RelatedAsset {
  id: string;
  name: string;
  type: 'table' | 'view' | 'report' | 'dashboard';
  relationship: 'source' | 'target' | 'reference';
  confidence_score: number;
}

// Bulk operations
export interface BulkOperation {
  id: string;
  type: 'scan' | 'update' | 'delete' | 'export';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  data_source_ids: string[];
  started_at: string;
  completed_at?: string;
  progress: BulkOperationProgress;
  results?: BulkOperationResults;
}

export interface BulkOperationProgress {
  total: number;
  completed: number;
  failed: number;
  current_item?: string;
  estimated_completion?: string;
}

export interface BulkOperationResults {
  successful_ids: string[];
  failed_items: FailedBulkItem[];
  summary: Record<string, any>;
}

export interface FailedBulkItem {
  id: string;
  name: string;
  error_message: string;
  error_code?: string;
}