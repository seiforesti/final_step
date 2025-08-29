// Common types used throughout the application

export type Status = 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface FilterOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  status?: Status[];
  date_from?: string;
  date_to?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface MetricValue {
  current: number;
  previous?: number;
  change?: number;
  change_percent?: number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
  format?: 'number' | 'percentage' | 'bytes' | 'duration';
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  overall_score: number;
  components: Record<string, ComponentHealth>;
  last_updated: string;
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  message?: string;
  metrics?: Record<string, number>;
  last_check: string;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'navigate' | 'api_call' | 'dismiss';
  target?: string;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface DataSourceConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'snowflake' | 's3' | 'redis';
  host: string;
  port?: number;
  database?: string;
  username?: string;
  status: Status;
  last_tested: string;
  metadata?: Record<string, any>;
}

export interface ScanRule {
  id: string;
  name: string;
  description?: string;
  type: 'pattern' | 'ml' | 'custom';
  configuration: Record<string, any>;
  enabled: boolean;
  priority: Priority;
  tags: string[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description?: string;
  framework: string;
  severity: Priority;
  enabled: boolean;
  conditions: Record<string, any>;
  actions: Record<string, any>;
}

export interface DataAsset {
  id: string;
  name: string;
  type: 'table' | 'view' | 'file' | 'api' | 'stream';
  data_source_id: string;
  schema?: string;
  description?: string;
  classification: ClassificationLevel;
  tags: string[];
  metadata: Record<string, any>;
  last_scanned?: string;
  quality_score?: number;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: ScanStatus;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  progress_percent: number;
  current_step?: string;
  total_steps: number;
  completed_steps: number;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failure' | 'warning';
  details?: Record<string, any>;
}

// Form and validation types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'date' | 'datetime';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: SelectOption[];
  validation?: ValidationRule[];
  dependencies?: FieldDependency[];
}

export interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FieldDependency {
  field: string;
  condition: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: any;
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

// UI Component types
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableAction<T = any> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  permission?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: MenuItem[];
  permission?: string;
  onClick?: () => void;
}

// API Response types
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface APIValidationError {
  field: string;
  message: string;
  code: string;
}

// Theme and styling types
export type ThemeMode = 'light' | 'dark' | 'system';

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Event types
export interface CustomEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  source?: string;
}

// WebSocket message types
export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
  timestamp: string;
  id?: string;
}

// Search and filtering types
export interface SearchResult<T = any> {
  item: T;
  score: number;
  highlights?: string[];
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  }[];
  highlight?: boolean;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectInterval: number;
  };
  features: {
    analytics: boolean;
    realtime: boolean;
    aiFeatures: boolean;
  };
  ui: {
    theme: ThemeMode;
    language: string;
    timezone: string;
  };
}