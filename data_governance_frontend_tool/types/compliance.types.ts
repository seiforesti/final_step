// Compliance types aligned with backend compliance models

export enum ComplianceFramework {
  GDPR = 'gdpr',
  CCPA = 'ccpa',
  HIPAA = 'hipaa',
  SOX = 'sox',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  NIST = 'nist',
  CUSTOM = 'custom',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  PENDING = 'pending',
  NOT_APPLICABLE = 'not_applicable',
  UNDER_REVIEW = 'under_review',
}

export enum RuleSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum RuleType {
  DATA_RETENTION = 'data_retention',
  DATA_ENCRYPTION = 'data_encryption',
  ACCESS_CONTROL = 'access_control',
  DATA_MASKING = 'data_masking',
  AUDIT_LOGGING = 'audit_logging',
  DATA_CLASSIFICATION = 'data_classification',
  CONSENT_MANAGEMENT = 'consent_management',
  BREACH_NOTIFICATION = 'breach_notification',
  RIGHT_TO_ERASURE = 'right_to_erasure',
  DATA_PORTABILITY = 'data_portability',
  CUSTOM = 'custom',
}

export enum ValidationMethod {
  AUTOMATED = 'automated',
  MANUAL = 'manual',
  HYBRID = 'hybrid',
}

export enum ExecutionFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  ON_DEMAND = 'on_demand',
}

export enum RemediationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  DEFERRED = 'deferred',
}

// Main ComplianceRule interface
export interface ComplianceRule {
  id: string;
  name: string;
  description?: string;
  framework: ComplianceFramework;
  rule_type: RuleType;
  severity: RuleSeverity;
  enabled: boolean;
  
  // Rule definition
  rule_definition: RuleDefinition;
  
  // Validation settings
  validation_settings: ValidationSettings;
  
  // Remediation configuration
  remediation_config: RemediationConfig;
  
  // Metadata
  metadata: ComplianceRuleMetadata;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Statistics
  statistics?: ComplianceRuleStatistics;
  
  // Relationships
  violations?: ComplianceViolation[];
  reports?: ComplianceReport[];
  workflows?: ComplianceWorkflow[];
  tags?: ComplianceTag[];
}

export interface RuleDefinition {
  conditions: RuleCondition[];
  logic_operator: 'AND' | 'OR';
  scope: RuleScope;
  parameters: Record<string, any>;
  sql_query?: string;
  custom_script?: string;
  threshold_values?: ThresholdValues;
}

export interface RuleCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  data_type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  case_sensitive?: boolean;
  regex_pattern?: string;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  REGEX_MATCH = 'regex_match',
  BETWEEN = 'between',
}

export interface RuleScope {
  data_sources?: string[];
  schemas?: string[];
  tables?: string[];
  columns?: string[];
  include_patterns?: string[];
  exclude_patterns?: string[];
  classification_levels?: string[];
  tags?: string[];
}

export interface ThresholdValues {
  warning_threshold?: number;
  critical_threshold?: number;
  max_violations?: number;
  time_window_hours?: number;
}

export interface ValidationSettings {
  method: ValidationMethod;
  frequency: ExecutionFrequency;
  schedule_config?: ScheduleConfig;
  timeout_minutes: number;
  retry_count: number;
  parallel_execution: boolean;
  sample_size?: number;
  validation_queries?: ValidationQuery[];
}

export interface ScheduleConfig {
  cron_expression?: string;
  timezone?: string;
  enabled_days?: number[];
  start_time?: string;
  end_time?: string;
  blackout_periods?: BlackoutPeriod[];
}

export interface BlackoutPeriod {
  start_date: string;
  end_date: string;
  reason: string;
}

export interface ValidationQuery {
  id: string;
  name: string;
  query: string;
  expected_result?: any;
  result_type: 'count' | 'boolean' | 'value' | 'exists';
}

export interface RemediationConfig {
  auto_remediation_enabled: boolean;
  remediation_actions: RemediationAction[];
  approval_required: boolean;
  approvers?: string[];
  notification_config: NotificationConfig;
  escalation_config?: EscalationConfig;
}

export interface RemediationAction {
  id: string;
  name: string;
  type: RemediationActionType;
  parameters: Record<string, any>;
  order: number;
  condition?: string;
  rollback_action?: RemediationAction;
}

export enum RemediationActionType {
  MASK_DATA = 'mask_data',
  DELETE_DATA = 'delete_data',
  ENCRYPT_DATA = 'encrypt_data',
  MOVE_DATA = 'move_data',
  QUARANTINE_DATA = 'quarantine_data',
  NOTIFY_OWNER = 'notify_owner',
  CREATE_TICKET = 'create_ticket',
  DISABLE_ACCESS = 'disable_access',
  CUSTOM_SCRIPT = 'custom_script',
}

export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  templates: NotificationTemplate[];
  recipients: NotificationRecipient[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface NotificationTemplate {
  event_type: 'violation_detected' | 'remediation_started' | 'remediation_completed' | 'rule_disabled';
  subject: string;
  body: string;
  format: 'text' | 'html' | 'markdown';
}

export interface NotificationRecipient {
  type: 'user' | 'group' | 'role' | 'external';
  identifier: string;
  events: string[];
}

export interface EscalationConfig {
  enabled: boolean;
  levels: EscalationLevel[];
}

export interface EscalationLevel {
  level: number;
  delay_minutes: number;
  recipients: string[];
  actions: string[];
}

export interface ComplianceRuleMetadata {
  business_owner?: string;
  technical_owner?: string;
  department?: string;
  cost_center?: string;
  regulatory_references?: RegulatoryReference[];
  documentation_links?: string[];
  last_reviewed_date?: string;
  next_review_date?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  business_impact?: string;
  custom_fields?: Record<string, any>;
}

export interface RegulatoryReference {
  framework: ComplianceFramework;
  article: string;
  section?: string;
  description: string;
  url?: string;
}

export interface ComplianceRuleStatistics {
  total_validations: number;
  successful_validations: number;
  failed_validations: number;
  total_violations: number;
  resolved_violations: number;
  pending_violations: number;
  average_resolution_time_hours: number;
  compliance_score: number;
  last_validation: string;
  next_validation: string;
}

// Compliance Violations
export interface ComplianceViolation {
  id: string;
  rule_id: string;
  rule: ComplianceRule;
  status: ComplianceStatus;
  severity: RuleSeverity;
  
  // Violation details
  violation_details: ViolationDetails;
  
  // Affected resources
  affected_resources: AffectedResource[];
  
  // Remediation
  remediation_status: RemediationStatus;
  remediation_actions: RemediationExecution[];
  
  // Audit trail
  detected_at: string;
  resolved_at?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  
  // Metadata
  metadata: ViolationMetadata;
}

export interface ViolationDetails {
  description: string;
  evidence: Evidence[];
  root_cause?: string;
  impact_assessment: ImpactAssessment;
  confidence_score: number;
  false_positive_likelihood: number;
}

export interface Evidence {
  type: 'query_result' | 'file_sample' | 'log_entry' | 'screenshot' | 'document';
  description: string;
  data?: any;
  file_path?: string;
  timestamp: string;
}

export interface ImpactAssessment {
  affected_records: number;
  potential_fine_amount?: number;
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  reputational_risk: 'low' | 'medium' | 'high' | 'critical';
  data_subjects_affected?: number;
  geographic_scope?: string[];
}

export interface AffectedResource {
  type: 'data_source' | 'table' | 'column' | 'file' | 'application';
  identifier: string;
  name: string;
  location: string;
  details: Record<string, any>;
}

export interface RemediationExecution {
  action_id: string;
  action_name: string;
  status: RemediationStatus;
  started_at: string;
  completed_at?: string;
  executed_by?: string;
  result: RemediationResult;
  error_message?: string;
}

export interface RemediationResult {
  success: boolean;
  records_affected: number;
  details: Record<string, any>;
  rollback_available: boolean;
}

export interface ViolationMetadata {
  detection_method: 'automated' | 'manual' | 'reported';
  data_classification: string[];
  geographic_location?: string;
  time_zone?: string;
  related_incidents?: string[];
  external_references?: string[];
}

// Compliance Reports
export interface ComplianceReport {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  framework: ComplianceFramework;
  
  // Report configuration
  configuration: ReportConfiguration;
  
  // Report data
  data: ReportData;
  
  // Generation info
  generated_at: string;
  generated_by?: string;
  status: ReportStatus;
  
  // Metadata
  metadata: ReportMetadata;
}

export enum ReportType {
  COMPLIANCE_SUMMARY = 'compliance_summary',
  VIOLATION_DETAILS = 'violation_details',
  REMEDIATION_STATUS = 'remediation_status',
  TREND_ANALYSIS = 'trend_analysis',
  RISK_ASSESSMENT = 'risk_assessment',
  AUDIT_TRAIL = 'audit_trail',
  CUSTOM = 'custom',
}

export enum ReportStatus {
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

export interface ReportConfiguration {
  date_range: DateRange;
  scope: ReportScope;
  filters: ReportFilters;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  template?: string;
  schedule?: ReportSchedule;
}

export interface DateRange {
  start_date: string;
  end_date: string;
  timezone?: string;
}

export interface ReportScope {
  frameworks?: ComplianceFramework[];
  rule_ids?: string[];
  data_sources?: string[];
  departments?: string[];
  severity_levels?: RuleSeverity[];
}

export interface ReportFilters {
  status?: ComplianceStatus[];
  violation_types?: RuleType[];
  remediation_status?: RemediationStatus[];
  risk_levels?: string[];
  include_resolved?: boolean;
  minimum_confidence?: number;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  timezone: string;
  recipients: string[];
}

export interface ReportData {
  summary: ReportSummary;
  sections: ReportSection[];
  charts: ChartData[];
  tables: TableData[];
  appendices?: Appendix[];
}

export interface ReportSummary {
  total_rules: number;
  compliant_rules: number;
  non_compliant_rules: number;
  total_violations: number;
  resolved_violations: number;
  pending_violations: number;
  overall_compliance_score: number;
  trend_direction: 'improving' | 'declining' | 'stable';
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
  charts?: string[];
  tables?: string[];
}

export interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  data: any[];
  configuration: Record<string, any>;
}

export interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: any[][];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  page_size: number;
  total_records: number;
}

export interface Appendix {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'table' | 'chart' | 'raw_data';
}

export interface ReportMetadata {
  file_size_bytes?: number;
  page_count?: number;
  generation_time_seconds: number;
  data_freshness: string;
  quality_score?: number;
  export_paths?: string[];
}

// Compliance Workflows
export interface ComplianceWorkflow {
  id: string;
  name: string;
  description?: string;
  type: WorkflowType;
  status: WorkflowStatus;
  
  // Workflow definition
  definition: WorkflowDefinition;
  
  // Execution info
  executions?: WorkflowExecution[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export enum WorkflowType {
  VIOLATION_RESPONSE = 'violation_response',
  COMPLIANCE_ASSESSMENT = 'compliance_assessment',
  REMEDIATION_APPROVAL = 'remediation_approval',
  PERIODIC_REVIEW = 'periodic_review',
  INCIDENT_MANAGEMENT = 'incident_management',
  CUSTOM = 'custom',
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
}

export interface WorkflowDefinition {
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  error_handling: ErrorHandling;
}

export interface WorkflowTrigger {
  type: 'violation_detected' | 'schedule' | 'manual' | 'api_call';
  conditions?: TriggerCondition[];
  schedule?: ScheduleConfig;
}

export interface TriggerCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  configuration: StepConfiguration;
  dependencies?: string[];
  timeout_minutes?: number;
  retry_config?: RetryConfig;
}

export enum StepType {
  APPROVAL = 'approval',
  NOTIFICATION = 'notification',
  VALIDATION = 'validation',
  REMEDIATION = 'remediation',
  ESCALATION = 'escalation',
  WAIT = 'wait',
  CONDITION = 'condition',
  SCRIPT = 'script',
  API_CALL = 'api_call',
}

export interface StepConfiguration {
  parameters: Record<string, any>;
  input_mapping?: Record<string, string>;
  output_mapping?: Record<string, string>;
}

export interface RetryConfig {
  max_attempts: number;
  delay_seconds: number;
  backoff_multiplier: number;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  default_value?: any;
  description?: string;
}

export interface ErrorHandling {
  on_error: 'stop' | 'continue' | 'retry' | 'escalate';
  error_notification?: NotificationConfig;
  fallback_actions?: RemediationAction[];
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  triggered_by?: string;
  context: ExecutionContext;
  steps: StepExecution[];
  error_message?: string;
}

export enum ExecutionStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export interface ExecutionContext {
  violation_id?: string;
  rule_id?: string;
  user_id?: string;
  variables: Record<string, any>;
  metadata: Record<string, any>;
}

export interface StepExecution {
  step_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  input_data?: any;
  output_data?: any;
  error_message?: string;
  retry_count: number;
}

// Tags and categorization
export interface ComplianceTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: 'framework' | 'severity' | 'department' | 'custom';
  created_at: string;
}

// Forms and UI types
export interface ComplianceRuleFormData {
  name: string;
  description?: string;
  framework: ComplianceFramework;
  rule_type: RuleType;
  severity: RuleSeverity;
  enabled: boolean;
  rule_definition: Partial<RuleDefinition>;
  validation_settings: Partial<ValidationSettings>;
  remediation_config: Partial<RemediationConfig>;
  metadata: Partial<ComplianceRuleMetadata>;
  tags: string[];
}

export interface ComplianceFilters {
  frameworks?: ComplianceFramework[];
  statuses?: ComplianceStatus[];
  severities?: RuleSeverity[];
  rule_types?: RuleType[];
  tags?: string[];
  search?: string;
  date_from?: string;
  date_to?: string;
  enabled?: boolean;
}

// API response types
export interface ComplianceRulesResponse {
  rules: ComplianceRule[];
  total: number;
  page: number;
  limit: number;
  filters_applied: ComplianceFilters;
}

export interface ComplianceViolationsResponse {
  violations: ComplianceViolation[];
  total: number;
  page: number;
  limit: number;
  summary: ViolationsSummary;
}

export interface ViolationsSummary {
  total_violations: number;
  by_severity: Record<RuleSeverity, number>;
  by_status: Record<ComplianceStatus, number>;
  by_framework: Record<ComplianceFramework, number>;
  trend_data: TrendDataPoint[];
}

export interface TrendDataPoint {
  date: string;
  violations: number;
  resolved: number;
  compliance_score: number;
}

export interface ComplianceDashboardData {
  overview: ComplianceOverview;
  recent_violations: ComplianceViolation[];
  compliance_trends: TrendDataPoint[];
  framework_compliance: FrameworkCompliance[];
  risk_assessment: RiskAssessment;
}

export interface ComplianceOverview {
  total_rules: number;
  active_rules: number;
  total_violations: number;
  resolved_violations: number;
  overall_compliance_score: number;
  frameworks_count: number;
}

export interface FrameworkCompliance {
  framework: ComplianceFramework;
  compliance_score: number;
  total_rules: number;
  violations: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface RiskAssessment {
  overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  recommendations: Recommendation[];
}

export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  description: string;
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimated_effort: string;
  expected_impact: string;
}