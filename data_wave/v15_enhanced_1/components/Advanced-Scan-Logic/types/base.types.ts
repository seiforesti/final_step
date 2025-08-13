// Advanced-Scan-Logic/types/base.types.ts
// Base types and interfaces for the Advanced Scan Logic system

// ==================== CORE BASE INTERFACES ====================

export interface BaseModel {
  id?: string | number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  version?: number;
  metadata?: Record<string, any>;
}

export interface BaseTimestamps {
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface BaseAuditableEntity extends BaseTimestamps {
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
  version: number;
}

// ==================== PAGINATION & FILTERING ====================

export interface PaginationParams {
  page?: number;
  size?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
  date_range?: {
    start: string;
    end: string;
  };
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  request_id?: string;
}

export interface ApiListResponse<T = any> extends PaginationResponse {
  data: T[];
  filters?: FilterParams;
  sort?: SortParams;
}

export interface ApiError {
  error: string;
  message: string;
  code?: string | number;
  details?: Record<string, any>;
  timestamp: string;
}

// ==================== HEALTH & STATUS ====================

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'degraded' | 'critical' | 'unknown';
  lastCheck: Date;
  message?: string;
  details?: Record<string, any>;
  metrics?: Record<string, number>;
}

export interface ComponentStatus {
  component: string;
  status: HealthStatus;
  dependencies?: ComponentStatus[];
  uptime?: number;
  version?: string;
}

// ==================== METRICS & ANALYTICS ====================

export interface MetricValue {
  value: number;
  unit?: string;
  timestamp: string;
  labels?: Record<string, string>;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface MetricSummary {
  current: number;
  previous?: number;
  change?: number;
  change_percentage?: number;
  trend: 'up' | 'down' | 'stable';
}

// ==================== EXECUTION & ORCHESTRATION ====================

export interface ExecutionContext {
  execution_id: string;
  parent_execution_id?: string;
  user_id?: string;
  session_id?: string;
  correlation_id?: string;
  environment: string;
  parameters: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  duration_ms: number;
  resource_usage?: Record<string, number>;
  metrics?: Record<string, MetricValue>;
}

// ==================== CONFIGURATION ====================

export interface Configuration {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  required?: boolean;
  default_value?: any;
  validation_rules?: any[];
}

export interface ConfigurationGroup {
  name: string;
  description?: string;
  configurations: Configuration[];
  environment?: string;
  tags?: string[];
}

// ==================== SCHEDULING ====================

export interface Schedule {
  id: string;
  name: string;
  cron_expression?: string;
  interval_seconds?: number;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  enabled: boolean;
  next_run?: string;
  last_run?: string;
}

export interface ScheduledTask {
  id: string;
  schedule_id: string;
  task_type: string;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  scheduled_time: string;
  started_time?: string;
  completed_time?: string;
  result?: ExecutionResult;
}

// ==================== NOTIFICATIONS & ALERTS ====================

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  source?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  name: string;
  description?: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'suppressed';
  source: string;
  triggered_at: string;
  resolved_at?: string;
  conditions: Record<string, any>;
  actions: string[];
  metadata?: Record<string, any>;
}

// ==================== TAGS & LABELS ====================

export interface Tag {
  key: string;
  value?: string;
  category?: string;
  description?: string;
}

export interface Taggable {
  tags: Tag[];
}

export interface Labeled {
  labels: Record<string, string>;
}

// ==================== VALIDATION ====================

export interface ValidationRule {
  field: string;
  type: 'required' | 'type' | 'range' | 'regex' | 'custom';
  message: string;
  parameters?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

// ==================== RESOURCE MANAGEMENT ====================

export interface ResourceRequirement {
  type: string;
  amount: number;
  unit: string;
  priority?: number;
  constraints?: Record<string, any>;
}

export interface ResourceAllocation {
  id: string;
  resource_type: string;
  allocated_amount: number;
  available_amount: number;
  utilization_percentage: number;
  allocation_time: string;
  release_time?: string;
}

export interface ResourcePool {
  id: string;
  name: string;
  type: string;
  total_capacity: number;
  available_capacity: number;
  allocated_capacity: number;
  utilization_percentage: number;
  resources: ResourceAllocation[];
}

// ==================== DATA LINEAGE ====================

export interface DataLineage {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: 'derives_from' | 'transforms' | 'aggregates' | 'copies';
  transformation_details?: Record<string, any>;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface DataAsset {
  id: string;
  name: string;
  type: string;
  source: string;
  schema?: Record<string, any>;
  lineage: DataLineage[];
  quality_metrics?: Record<string, MetricValue>;
  tags: Tag[];
}

// ==================== SECURITY ====================

export interface SecurityContext {
  user_id: string;
  session_id: string;
  permissions: string[];
  roles: string[];
  groups: string[];
  security_level: string;
  authentication_method: string;
  ip_address?: string;
  user_agent?: string;
}

export interface AccessControl {
  resource_id: string;
  resource_type: string;
  principal_id: string;
  principal_type: 'user' | 'group' | 'service';
  permissions: string[];
  granted_at: string;
  granted_by: string;
  expires_at?: string;
}

// ==================== CACHING ====================

export interface CacheEntry {
  key: string;
  value: any;
  created_at: string;
  expires_at?: string;
  access_count: number;
  last_accessed: string;
  size_bytes?: number;
  tags?: string[];
}

export interface CacheStats {
  total_entries: number;
  hit_ratio: number;
  miss_ratio: number;
  total_size_bytes: number;
  average_entry_size: number;
  eviction_count: number;
}

// ==================== COMMON UTILITY TYPES ====================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = T & Partial<Pick<T, K>>;

export type KeyValuePair<T = any> = {
  key: string;
  value: T;
};

export type AsyncResult<T> = Promise<T>;

export type AsyncResultWithPagination<T> = Promise<ApiListResponse<T>>;

// ==================== EVENT SOURCING ====================

export interface DomainEvent {
  id: string;
  type: string;
  aggregate_id: string;
  aggregate_type: string;
  version: number;
  timestamp: string;
  payload: Record<string, any>;
  metadata?: Record<string, any>;
  correlation_id?: string;
  causation_id?: string;
}

export interface EventStore {
  append(events: DomainEvent[]): Promise<void>;
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
  subscribe(eventType: string, handler: (event: DomainEvent) => void): void;
}

// ==================== AUDIT TRAIL ====================

export interface AuditEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource_id: string;
  actor_id: string;
  actor_type: 'user' | 'system' | 'service';
  action: string;
  timestamp: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  correlation_id?: string;
}

export interface AuditTrail {
  resource_id: string;
  resource_type: string;
  events: AuditEvent[];
  created_at: string;
  updated_at: string;
}

// ==================== EXPORT ALL ====================

export * from './scan.types';
export * from './orchestration.types';
export * from './analytics.types';
export * from './performance.types';
export * from './monitoring.types';
export * from './coordination.types';
export * from './intelligence.types';
export * from './security.types';
export * from './workflow.types';