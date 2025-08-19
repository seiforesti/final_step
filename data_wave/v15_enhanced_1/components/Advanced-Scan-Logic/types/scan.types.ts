// Advanced-Scan-Logic/types/scan.types.ts
// Core scan types aligned with scan_models.py

import { BaseModel } from './base.types';

// ==================== CORE ENUMS ====================

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

export enum ScanStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum DiscoveryStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ScanOrchestrationStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  ADAPTIVE = 'adaptive',
  PRIORITY_BASED = 'priority_based',
  RESOURCE_AWARE = 'resource_aware',
  DEPENDENCY_AWARE = 'dependency_aware',
  LOAD_BALANCED = 'load_balanced',
}

export enum ScanOrchestrationStatus {
  PENDING = 'pending',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout',
}

export enum ScanWorkflowStatus {
  QUEUED = 'queued',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  RETRYING = 'retrying',
}

export enum ScanPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  BACKGROUND = 'background',
}

export enum ResourceType {
  CPU = 'cpu',
  MEMORY = 'memory',
  STORAGE = 'storage',
  NETWORK = 'network',
  DATABASE = 'database',
  CUSTOM = 'custom',
}

// ==================== CORE INTERFACES ====================

export interface DataSource extends BaseModel {
  id?: number;
  name: string;
  description?: string;
  source_type: DataSourceType;
  location: DataSourceLocation;
  host: string;
  port: number;
  username: string;
  password_secret: string;
  secret_manager_type?: string;
  use_encryption?: boolean;
  database_name?: string;
  cloud_provider?: CloudProvider;
  cloud_config?: Record<string, any>;
  replica_config?: Record<string, any>;
  ssl_config?: Record<string, string>;
  pool_size?: number;
  max_overflow?: number;
  pool_timeout?: number;
  connection_properties?: Record<string, any>;
  additional_properties?: Record<string, any>;
  status: DataSourceStatus;
  environment?: Environment;
  criticality?: Criticality;
  data_classification?: DataClassification;
  tags?: string[];
  owner?: string;
  team?: string;
  backup_enabled?: boolean;
  monitoring_enabled?: boolean;
  encryption_enabled?: boolean;
  scan_frequency?: ScanFrequency;
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
  last_scan?: string;
  next_scan?: string;
  last_backup?: string;
  created_at: string;
  updated_at: string;
}

export interface ScanRuleSet extends BaseModel {
  id?: number;
  name: string;
  description?: string;
  data_source_id?: number;
  include_schemas?: string[];
  exclude_schemas?: string[];
  include_tables?: string[];
  exclude_tables?: string[];
  include_columns?: string[];
  exclude_columns?: string[];
  sample_data?: boolean;
  sample_size?: number;
  created_at: string;
  updated_at: string;
}

export interface Scan extends BaseModel {
  id?: number;
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

export interface ScanResult extends BaseModel {
  id?: number;
  scan_id: number;
  schema_name: string;
  table_name: string;
  column_name?: string;
  object_type?: string;
  classification_labels?: string[];
  sensitivity_level?: string;
  compliance_issues?: Record<string, any>[];
  created_at: string;
  updated_at: string;
  data_type?: string;
  nullable?: boolean;
  scan_metadata?: Record<string, any>;
}

export interface CustomScanRule extends BaseModel {
  id?: number;
  name: string;
  description?: string;
  expression: string;
  is_active?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ScanSchedule extends BaseModel {
  id?: number;
  name: string;
  description?: string;
  data_source_id: number;
  scan_rule_set_id: number;
  cron_expression: string;
  enabled?: boolean;
  created_at: string;
  updated_at: string;
  last_run?: string;
  next_run?: string;
}

export interface EnhancedScanRuleSet extends BaseModel {
  id?: number;
  base_rule_set_id?: number;
  rule_set_uuid: string;
  name: string;
  display_name?: string;
  description?: string;
  rule_engine_version?: string;
  optimization_enabled?: boolean;
  ai_pattern_recognition?: boolean;
  intelligent_sampling?: boolean;
  adaptive_rules?: boolean;
  max_parallel_threads?: number;
  memory_limit_mb?: number;
  timeout_minutes?: number;
  priority_level?: ScanPriority;
  advanced_conditions?: Record<string, any>[];
  pattern_matching_config?: Record<string, any>;
  ml_model_references?: string[];
  semantic_analysis_config?: Record<string, any>;
  validation_rules?: Record<string, any>[];
  quality_thresholds?: Record<string, number>;
  accuracy_requirements?: number;
  business_criticality?: string;
  compliance_requirements?: string[];
  cost_constraints?: Record<string, number>;
  sla_requirements?: Record<string, any>;
  execution_count?: number;
  success_rate?: number;
  average_execution_time?: number;
  total_data_processed?: number;
  data_source_integrations?: Record<string, any>;
  classification_mappings?: Record<string, any>;
  compliance_integrations?: Record<string, any>;
  catalog_enrichment_config?: Record<string, any>;
  audit_trail?: Record<string, any>[];
  compliance_status?: string;
  last_compliance_check?: string;
  version?: string;
  is_active?: boolean;
  deprecation_date?: string;
  replacement_rule_set_id?: string;
  created_at: string;
  updated_at: string;
  last_optimized?: string;
  created_by?: string;
  updated_by?: string;
}

export interface DiscoveryHistory extends BaseModel {
  id?: number;
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

export interface ScanResourceAllocation extends BaseModel {
  id?: number;
  allocation_id: string;
  orchestration_job_id: number;
  resource_type: ResourceType;
  resource_name: string;
  resource_pool: string;
  allocated_amount: number;
  requested_amount: number;
  max_allocation?: number;
  allocation_unit: string;
  allocation_status: string;
  allocated_at?: string;
  released_at?: string;
  duration_minutes?: number;
  actual_usage?: number;
  peak_usage?: number;
  average_usage?: number;
  usage_efficiency?: number;
  cost_per_unit?: number;
  total_cost?: number;
  budget_allocated?: number;
  cost_optimization_score?: number;
  allocation_latency_ms?: number;
  resource_contention_score?: number;
  availability_score?: number;
  reliability_score?: number;
  priority_level?: number;
  resource_constraints?: Record<string, any>;
  scaling_policy?: Record<string, any>;
  monitoring_config?: Record<string, any>;
  alert_thresholds?: Record<string, number>;
  performance_history?: Record<string, any>[];
  environment: string;
  region?: string;
  availability_zone?: string;
  cluster_info?: Record<string, any>;
  requested_by: string;
  approved_by?: string;
  audit_trail?: Record<string, any>[];
  created_at: string;
  updated_at: string;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface CreateDataSourceRequest {
  name: string;
  description?: string;
  source_type: DataSourceType;
  location: DataSourceLocation;
  host: string;
  port: number;
  username: string;
  password_secret: string;
  database_name?: string;
  cloud_provider?: CloudProvider;
  cloud_config?: Record<string, any>;
  ssl_config?: Record<string, string>;
  environment?: Environment;
  criticality?: Criticality;
  data_classification?: DataClassification;
  tags?: string[];
  owner?: string;
  team?: string;
}

export interface UpdateDataSourceRequest extends Partial<CreateDataSourceRequest> {
  status?: DataSourceStatus;
  backup_enabled?: boolean;
  monitoring_enabled?: boolean;
  encryption_enabled?: boolean;
  scan_frequency?: ScanFrequency;
}

export interface CreateScanRequest {
  name: string;
  description?: string;
  data_source_id: number;
  scan_rule_set_id?: number;
  created_by?: string;
}

export interface CreateScanRuleSetRequest {
  name: string;
  description?: string;
  data_source_id?: number;
  include_schemas?: string[];
  exclude_schemas?: string[];
  include_tables?: string[];
  exclude_tables?: string[];
  include_columns?: string[];
  exclude_columns?: string[];
  sample_data?: boolean;
  sample_size?: number;
}

export interface CreateCustomScanRuleRequest {
  name: string;
  description?: string;
  expression: string;
  is_active?: boolean;
  tags?: string[];
}

export interface DataSourceListResponse {
  data_sources: DataSource[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ScanListResponse {
  scans: Scan[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ScanResultsResponse {
  results: ScanResult[];
  total: number;
  scan_id: number;
  summary: {
    total_objects: number;
    classified_objects: number;
    compliance_issues: number;
    sensitive_data_found: number;
  };
}

export interface DataSourceHealthResponse {
  status: string;
  last_checked: string;
  latency_ms?: number;
  error_message?: string;
  recommendations?: string[];
  issues?: Record<string, any>[];
}

export interface DataSourceStatsResponse {
  entity_stats: Record<string, any>;
  size_stats: Record<string, any>;
  last_scan_time?: string;
  classification_stats?: Record<string, any>;
  sensitivity_stats?: Record<string, any>;
  compliance_stats?: Record<string, any>;
  performance_stats?: Record<string, any>;
  quality_stats?: Record<string, any>;
}

// ==================== FILTER AND SORT TYPES ====================

export interface DataSourceFilters {
  status?: DataSourceStatus[];
  source_type?: DataSourceType[];
  environment?: Environment[];
  criticality?: Criticality[];
  data_classification?: DataClassification[];
  tags?: string[];
  owner?: string;
  team?: string;
  search?: string;
}

export interface ScanFilters {
  status?: ScanStatus[];
  data_source_id?: number[];
  created_by?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ScanSort {
  field: 'name' | 'created_at' | 'updated_at' | 'status' | 'priority';
  direction: 'asc' | 'desc';
}

export interface DataSourceSort {
  field: 'name' | 'created_at' | 'updated_at' | 'status' | 'health_score' | 'compliance_score';
  direction: 'asc' | 'desc';
}

// ==================== PAGINATION TYPES ====================

export interface PaginationRequest {
  page?: number;
  size?: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}