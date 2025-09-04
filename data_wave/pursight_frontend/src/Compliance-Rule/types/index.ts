// Comprehensive TypeScript Types for Compliance-Rule Group
// Enterprise-grade type definitions for all components and features

// Base Types
export interface BaseEntity {
  id: number | string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  version?: number
  metadata?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_previous: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  request_id?: string
}

// Compliance Framework Types
export interface ComplianceFramework extends BaseEntity {
  name: string
  version: string
  description: string
  category: 'security' | 'privacy' | 'financial' | 'healthcare' | 'industry' | 'regional'
  jurisdiction: string
  authority: string
  effective_date: string
  status: 'active' | 'deprecated' | 'draft' | 'retired'
  requirements_count: number
  controls_count: number
  complexity_level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  implementation_guide?: string
  certification_body?: string
  assessment_frequency: string
  penalty_information?: string
  related_frameworks: string[]
  crosswalk_mappings: Record<string, string[]>
}

// Compliance Requirement Types
export interface ComplianceRequirement extends BaseEntity {
  data_source_id: number
  framework: string
  requirement_id: string
  title: string
  description: string
  category: string
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed' | 'in_progress'
  compliance_percentage: number
  last_assessed?: string
  next_assessment?: string
  assessor?: string
  assessment_notes?: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  remediation_plan?: string
  remediation_deadline?: string
  remediation_owner?: string
  evidence_files: string[]
  documentation_links: string[]
  impact_description?: string
  tags: string[]
  controls: ComplianceControl[]
  gaps: ComplianceGap[]
  evidence: ComplianceEvidence[]
}

export interface ComplianceControl extends BaseEntity {
  requirement_id: number
  control_id: string
  title: string
  description: string
  control_type: 'preventive' | 'detective' | 'corrective' | 'directive'
  implementation_status: 'implemented' | 'partially_implemented' | 'not_implemented' | 'not_applicable'
  effectiveness: 'effective' | 'partially_effective' | 'ineffective' | 'not_tested'
  test_frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  last_tested?: string
  next_test?: string
  responsible_party?: string
  automation_level: 'manual' | 'semi_automated' | 'fully_automated'
  evidence_requirements: string[]
  testing_procedures: string[]
}

// Assessment Types
export interface ComplianceAssessment extends BaseEntity {
  data_source_id: number
  framework: string
  assessment_type: 'annual' | 'quarterly' | 'monthly' | 'ad_hoc' | 'continuous'
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired' | 'cancelled'
  scheduled_date?: string
  started_date?: string
  completed_date?: string
  assessor?: string
  assessment_firm?: string
  overall_score?: number
  compliant_requirements: number
  non_compliant_requirements: number
  partially_compliant_requirements: number
  total_requirements: number
  findings: ComplianceFinding[]
  recommendations: string[]
  report_file?: string
  certificate_file?: string
  remediation_plan?: string
  follow_up_date?: string
  scope: AssessmentScope
  methodology: AssessmentMethodology
  evidence_collected: ComplianceEvidence[]
  interviews_conducted: AssessmentInterview[]
}

export interface AssessmentScope {
  systems_included: string[]
  processes_included: string[]
  locations_included: string[]
  time_period: {
    start_date: string
    end_date: string
  }
  exclusions: string[]
  limitations: string[]
}

export interface AssessmentMethodology {
  approach: 'risk_based' | 'comprehensive' | 'sampling' | 'hybrid'
  sampling_method?: 'random' | 'judgmental' | 'statistical'
  sample_size?: number
  testing_procedures: string[]
  documentation_review: boolean
  interviews_required: boolean
  system_testing: boolean
  walkthrough_procedures: boolean
}

export interface AssessmentInterview {
  id: string
  interviewee_name: string
  role: string
  department: string
  date: string
  duration_minutes: number
  topics_covered: string[]
  key_findings: string[]
  follow_up_required: boolean
}

export interface ComplianceFinding extends BaseEntity {
  assessment_id: number
  requirement_id?: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  title: string
  description: string
  condition: string
  criteria: string
  cause: string
  effect: string
  evidence?: string
  recommendation: string
  management_response?: string
  remediation_effort: 'low' | 'medium' | 'high'
  remediation_timeline: string
  responsible_party?: string
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk'
  due_date?: string
  resolution_date?: string
  verification_required: boolean
  repeat_finding: boolean
  related_findings: string[]
}

// Gap Analysis Types
export interface ComplianceGap extends BaseEntity {
  data_source_id: number
  requirement_id: number
  gap_title: string
  gap_description: string
  current_state: string
  desired_state: string
  gap_analysis: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk' | 'deferred'
  remediation_plan?: string
  remediation_steps: RemediationStep[]
  assigned_to?: string
  due_date?: string
  progress_percentage: number
  last_updated_by?: string
  business_impact?: string
  technical_impact?: string
  cost_estimate?: number
  effort_estimate?: string
  priority: number
  dependencies: string[]
  related_gaps: number[]
  approval_required: boolean
  budget_approved: boolean
  resources_allocated: boolean
}

export interface RemediationStep {
  id: string
  step_number: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  assigned_to?: string
  estimated_effort: string
  due_date?: string
  completion_date?: string
  dependencies: string[]
  deliverables: string[]
  acceptance_criteria: string[]
}

// Evidence Management Types
export interface ComplianceEvidence extends BaseEntity {
  data_source_id: number
  requirement_id: number
  title: string
  description?: string
  evidence_type: 'document' | 'screenshot' | 'log' | 'certificate' | 'report' | 'configuration' | 'code' | 'video' | 'audio'
  file_path?: string
  file_name?: string
  file_size?: number
  file_hash?: string
  file_mime_type?: string
  valid_from?: string
  valid_until?: string
  is_current: boolean
  collected_by?: string
  collection_method?: string
  collection_date: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired'
  verified_by?: string
  verification_date?: string
  verification_notes?: string
  retention_period?: number
  access_level: 'public' | 'internal' | 'confidential' | 'restricted'
  tags: string[]
  related_evidence: number[]
  chain_of_custody: CustodyRecord[]
}

export interface CustodyRecord {
  id: string
  action: 'created' | 'accessed' | 'modified' | 'transferred' | 'deleted'
  user: string
  timestamp: string
  location?: string
  reason?: string
  hash_before?: string
  hash_after?: string
}

// Risk Assessment Types
export interface RiskAssessment extends BaseEntity {
  entity_id: string
  entity_type: 'data_source' | 'system' | 'process' | 'control'
  overall_risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  assessment_date: string
  assessor: string
  methodology: string
  risk_factors: RiskFactor[]
  risk_scenarios: RiskScenario[]
  mitigation_strategies: MitigationStrategy[]
  residual_risk_score: number
  risk_appetite_alignment: boolean
  review_date: string
  approval_status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approval_date?: string
}

export interface RiskFactor {
  id: string
  name: string
  category: 'technical' | 'operational' | 'financial' | 'regulatory' | 'reputational'
  weight: number
  score: number
  rationale: string
  evidence: string[]
  last_updated: string
}

export interface RiskScenario {
  id: string
  title: string
  description: string
  threat_source: string
  vulnerability: string
  likelihood: number
  impact: number
  risk_score: number
  existing_controls: string[]
  control_effectiveness: number
}

export interface MitigationStrategy {
  id: string
  title: string
  description: string
  strategy_type: 'avoid' | 'mitigate' | 'transfer' | 'accept'
  implementation_cost: number
  implementation_timeline: string
  effectiveness_rating: number
  responsible_party: string
  status: 'proposed' | 'approved' | 'implemented' | 'rejected'
}

// Workflow Types
export interface ComplianceWorkflow extends BaseEntity {
  name: string
  description: string
  workflow_type: 'assessment' | 'remediation' | 'approval' | 'review' | 'notification' | 'escalation'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed'
  steps: ComplianceWorkflowStep[]
  current_step: number
  assigned_to?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  triggers: ComplianceWorkflowTrigger[]
  conditions: Record<string, any>
  variables: Record<string, any>
  execution_history: ComplianceWorkflowExecution[]
  approval_chain: ApprovalStep[]
  escalation_rules: EscalationRule[]
  sla_requirements: SLARequirement[]
}

export interface ComplianceWorkflowStep {
  id: string
  name: string
  type: 'manual' | 'automated' | 'approval' | 'notification' | 'condition' | 'integration'
  description?: string
  assignee?: string
  due_date_offset?: number
  required: boolean
  conditions?: Record<string, any>
  actions: WorkflowAction[]
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed'
  started_at?: string
  completed_at?: string
  notes?: string
  attachments: string[]
  sub_steps: ComplianceWorkflowStep[]
}

export interface WorkflowAction {
  type: 'email' | 'api_call' | 'create_task' | 'update_record' | 'generate_report' | 'webhook'
  config: Record<string, any>
  retry_policy?: RetryPolicy
}

export interface RetryPolicy {
  max_attempts: number
  retry_delay: number
  backoff_strategy: 'fixed' | 'exponential' | 'linear'
}

export interface ApprovalStep {
  id: string
  step_name: string
  approver: string
  approval_type: 'single' | 'unanimous' | 'majority'
  required: boolean
  due_date_offset: number
  escalation_rules: EscalationRule[]
}

export interface EscalationRule {
  id: string
  trigger_condition: string
  escalation_delay: number
  escalation_target: string
  escalation_action: string
  notification_template: string
}

export interface SLARequirement {
  metric: string
  target_value: number
  unit: string
  measurement_method: string
  penalty_action?: string
}

export interface ComplianceWorkflowTrigger {
  id: string
  type: 'manual' | 'scheduled' | 'event' | 'condition'
  config: Record<string, any>
  enabled: boolean
}

export interface ComplianceWorkflowExecution extends BaseEntity {
  workflow_id: number
  instance_id: string
  started_at: string
  completed_at?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  trigger: string
  steps_completed: number
  total_steps: number
  error_message?: string
  execution_log: ExecutionLogEntry[]
  performance_metrics: WorkflowPerformanceMetrics
}

export interface ExecutionLogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  step_id?: string
  context?: Record<string, any>
}

export interface WorkflowPerformanceMetrics {
  total_duration: number
  step_durations: Record<string, number>
  resource_usage: Record<string, number>
  throughput: number
  error_rate: number
}

// Reporting Types
export interface ComplianceReport extends BaseEntity {
  name: string
  description: string
  report_type: 'compliance_status' | 'gap_analysis' | 'risk_assessment' | 'audit_trail' | 'executive_summary' | 'detailed_findings' | 'trend_analysis' | 'benchmark'
  framework?: string
  data_source_id?: number
  status: 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled'
  generated_by?: string
  generated_at?: string
  file_url?: string
  file_format: 'pdf' | 'excel' | 'csv' | 'json' | 'html' | 'word'
  parameters: ReportParameters
  filters: ReportFilters
  schedule?: ComplianceReportSchedule
  recipients: ReportRecipient[]
  distribution_method: 'email' | 'download' | 'api' | 'ftp' | 'sharepoint'
  retention_period?: number
  access_level: 'public' | 'internal' | 'confidential' | 'restricted'
  watermark?: string
  digital_signature?: boolean
  encryption_required?: boolean
  sections: ReportSection[]
  charts: ReportChart[]
  appendices: ReportAppendix[]
}

export interface ReportParameters {
  date_range: {
    start_date: string
    end_date: string
  }
  include_charts: boolean
  include_recommendations: boolean
  include_evidence: boolean
  detail_level: 'summary' | 'standard' | 'detailed'
  language: string
  currency?: string
  timezone: string
  custom_fields: Record<string, any>
}

export interface ReportFilters {
  frameworks?: string[]
  risk_levels?: string[]
  statuses?: string[]
  categories?: string[]
  assignees?: string[]
  tags?: string[]
  date_filters?: Record<string, string>
}

export interface ReportRecipient {
  email: string
  name: string
  role: string
  delivery_method: 'email' | 'portal' | 'api'
  access_level: 'view' | 'download' | 'edit'
}

export interface ComplianceReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  day_of_week?: number
  day_of_month?: number
  time: string
  timezone: string
  enabled: boolean
  next_run?: string
  last_run?: string
  retry_policy?: RetryPolicy
}

export interface ReportSection {
  id: string
  title: string
  type: 'text' | 'table' | 'chart' | 'list' | 'matrix'
  content: any
  order: number
  page_break_before: boolean
  conditional_display?: string
}

export interface ReportChart {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'gauge'
  data_source: string
  config: Record<string, any>
  position: {
    page: number
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ReportAppendix {
  id: string
  title: string
  content_type: 'evidence' | 'raw_data' | 'methodology' | 'glossary'
  content: any
  include_in_toc: boolean
}

// Integration Types
export interface ComplianceIntegration extends BaseEntity {
  name: string
  integration_type: 'grc_tool' | 'security_scanner' | 'audit_platform' | 'risk_management' | 'documentation' | 'ticketing' | 'monitoring'
  provider: string
  status: 'active' | 'inactive' | 'error' | 'pending' | 'testing'
  config: IntegrationConfig
  credentials: IntegrationCredentials
  sync_frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual'
  last_synced_at?: string
  last_sync_status?: 'success' | 'failed' | 'partial'
  sync_statistics: ComplianceSyncStatistics
  error_message?: string
  error_count: number
  supported_frameworks: string[]
  data_mapping: DataMapping
  webhook_url?: string
  api_version?: string
  rate_limit?: number
  timeout?: number
  retry_config: RetryPolicy
  health_check: HealthCheckConfig
  monitoring: IntegrationMonitoring
}

export interface IntegrationConfig {
  endpoint_url: string
  authentication_method: 'api_key' | 'oauth2' | 'basic_auth' | 'certificate'
  connection_pool_size?: number
  ssl_verification: boolean
  proxy_settings?: ProxySettings
  custom_headers: Record<string, string>
  request_timeout: number
  response_format: 'json' | 'xml' | 'csv'
  pagination_method?: 'offset' | 'cursor' | 'page'
  batch_size?: number
}

export interface IntegrationCredentials {
  encrypted: boolean
  api_key?: string
  client_id?: string
  client_secret?: string
  access_token?: string
  refresh_token?: string
  certificate_path?: string
  username?: string
  password?: string
  token_expiry?: string
}

export interface ProxySettings {
  host: string
  port: number
  username?: string
  password?: string
  protocol: 'http' | 'https' | 'socks5'
}

export interface DataMapping {
  field_mappings: FieldMapping[]
  transformation_rules: TransformationRule[]
  validation_rules: ValidationRule[]
  default_values: Record<string, any>
}

export interface FieldMapping {
  source_field: string
  target_field: string
  data_type: string
  required: boolean
  transformation?: string
}

export interface TransformationRule {
  id: string
  name: string
  rule_type: 'format' | 'calculate' | 'lookup' | 'conditional'
  expression: string
  applies_to: string[]
}

export interface ValidationRule {
  id: string
  field: string
  rule_type: 'required' | 'format' | 'range' | 'custom'
  parameters: Record<string, any>
  error_message: string
}

export interface ComplianceSyncStatistics {
  total_records: number
  records_created: number
  records_updated: number
  records_failed: number
  last_sync_duration: number
  average_sync_duration: number
  success_rate: number
  data_quality_score: number
  sync_history: SyncHistoryEntry[]
}

export interface SyncHistoryEntry {
  sync_id: string
  started_at: string
  completed_at: string
  status: string
  records_processed: number
  errors: SyncError[]
}

export interface SyncError {
  record_id?: string
  error_code: string
  error_message: string
  field?: string
  severity: 'warning' | 'error' | 'critical'
}

export interface HealthCheckConfig {
  enabled: boolean
  interval_minutes: number
  timeout_seconds: number
  failure_threshold: number
  recovery_threshold: number
  endpoints: string[]
}

export interface IntegrationMonitoring {
  metrics_enabled: boolean
  logging_level: 'debug' | 'info' | 'warn' | 'error'
  alert_thresholds: AlertThreshold[]
  dashboard_url?: string
}

export interface AlertThreshold {
  metric: string
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
  value: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  notification_channels: string[]
}

// Analytics and Insights Types
export interface ComplianceInsight extends BaseEntity {
  title: string
  description: string
  insight_type: 'trend' | 'anomaly' | 'prediction' | 'recommendation' | 'benchmark'
  category: 'risk' | 'compliance' | 'performance' | 'cost' | 'efficiency'
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  confidence_score: number
  data_sources: string[]
  affected_entities: string[]
  generated_at: string
  expires_at?: string
  status: 'active' | 'dismissed' | 'acted_upon' | 'expired'
  tags: string[]
  related_insights: string[]
  actions_taken: InsightAction[]
  impact_assessment: ImpactAssessment
  supporting_data: any
}

export interface InsightAction {
  id: string
  action_type: 'remediate' | 'investigate' | 'monitor' | 'escalate' | 'dismiss'
  description: string
  taken_by: string
  taken_at: string
  result?: string
  follow_up_required: boolean
}

export interface ImpactAssessment {
  business_impact: 'low' | 'medium' | 'high' | 'critical'
  financial_impact?: number
  operational_impact?: string
  reputation_impact?: string
  regulatory_impact?: string
  timeline_to_impact?: string
}

export interface ComplianceMetrics {
  overall_compliance_score: number
  framework_scores: Record<string, number>
  risk_distribution: Record<string, number>
  trend_analysis: TrendData[]
  benchmark_comparison: BenchmarkData
  key_performance_indicators: KPI[]
  compliance_velocity: number
  remediation_effectiveness: number
  cost_of_compliance: number
  return_on_compliance_investment: number
}

export interface TrendData {
  date: string
  metric: string
  value: number
  change_from_previous: number
  trend_direction: 'up' | 'down' | 'stable'
}

export interface BenchmarkData {
  industry: string
  peer_group: string
  percentile_ranking: number
  best_practices: string[]
  improvement_opportunities: string[]
}

export interface KPI {
  id: string
  name: string
  description: string
  current_value: number
  target_value: number
  unit: string
  trend: 'improving' | 'declining' | 'stable'
  status: 'on_track' | 'at_risk' | 'off_track'
  last_updated: string
}

// User and Permission Types
export interface ComplianceUser extends BaseEntity {
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  department: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  last_login?: string
  permissions: Permission[]
  preferences: UserPreferences
  certifications: UserCertification[]
  activity_log: UserActivity[]
}

export interface UserRole {
  id: string
  name: string
  description: string
  level: 'admin' | 'manager' | 'analyst' | 'auditor' | 'viewer'
  permissions: string[]
  data_access_scope: 'global' | 'department' | 'team' | 'personal'
}

export interface Permission {
  resource: string
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute' | 'approve')[]
  conditions?: Record<string, any>
}

export interface UserPreferences {
  language: string
  timezone: string
  date_format: string
  notification_preferences: NotificationPreference[]
  dashboard_layout: DashboardLayout
  theme: 'light' | 'dark' | 'auto'
}

export interface NotificationPreference {
  type: string
  channel: 'email' | 'sms' | 'push' | 'in_app'
  enabled: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
}

export interface DashboardLayout {
  widgets: DashboardWidget[]
  layout_type: 'grid' | 'list' | 'custom'
  refresh_interval: number
}

export interface DashboardWidget {
  id: string
  type: string
  title: string
  position: { x: number; y: number; width: number; height: number }
  config: Record<string, any>
  data_source: string
}

export interface UserCertification {
  id: string
  name: string
  issuing_body: string
  issue_date: string
  expiry_date?: string
  certificate_number: string
  verification_url?: string
  status: 'valid' | 'expired' | 'revoked'
}

export interface UserActivity {
  id: string
  action: string
  resource: string
  timestamp: string
  ip_address?: string
  user_agent?: string
  result: 'success' | 'failure'
  details?: Record<string, any>
}

// Configuration Types
export interface SystemConfiguration {
  general: GeneralSettings
  security: SecuritySettings
  compliance: ComplianceSettings
  integrations: IntegrationSettings
  notifications: NotificationSettings
  audit: AuditSettings
  performance: PerformanceSettings
  backup: BackupSettings
}

export interface GeneralSettings {
  organization_name: string
  organization_id: string
  default_timezone: string
  default_language: string
  date_format: string
  currency: string
  business_hours: BusinessHours
  contact_information: ContactInformation
}

export interface BusinessHours {
  timezone: string
  monday: TimeRange
  tuesday: TimeRange
  wednesday: TimeRange
  thursday: TimeRange
  friday: TimeRange
  saturday?: TimeRange
  sunday?: TimeRange
  holidays: Holiday[]
}

export interface TimeRange {
  start: string
  end: string
  enabled: boolean
}

export interface Holiday {
  name: string
  date: string
  recurring: boolean
  type: 'national' | 'regional' | 'company'
}

export interface ContactInformation {
  primary_email: string
  support_email: string
  phone: string
  address: Address
  website?: string
}

export interface Address {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface SecuritySettings {
  password_policy: PasswordPolicy
  session_management: SessionManagement
  encryption: EncryptionSettings
  access_control: AccessControlSettings
  audit_logging: boolean
  two_factor_authentication: TwoFactorSettings
}

export interface PasswordPolicy {
  min_length: number
  require_uppercase: boolean
  require_lowercase: boolean
  require_numbers: boolean
  require_special_chars: boolean
  password_history: number
  expiry_days: number
  lockout_attempts: number
  lockout_duration: number
}

export interface SessionManagement {
  session_timeout: number
  concurrent_sessions: number
  remember_me_duration: number
  secure_cookies: boolean
}

export interface EncryptionSettings {
  data_at_rest: boolean
  data_in_transit: boolean
  algorithm: string
  key_rotation_days: number
}

export interface AccessControlSettings {
  role_based_access: boolean
  attribute_based_access: boolean
  default_permissions: string[]
  permission_inheritance: boolean
}

export interface TwoFactorSettings {
  enabled: boolean
  required_for_admin: boolean
  methods: ('sms' | 'email' | 'totp' | 'hardware_token')[]
  backup_codes: boolean
}

export interface ComplianceSettings {
  default_frameworks: string[]
  assessment_frequency: string
  risk_appetite: RiskAppetite
  remediation_sla: RemediationSLA
  evidence_retention: number
  auto_remediation: boolean
  compliance_thresholds: ComplianceThresholds
}

export interface RiskAppetite {
  overall_tolerance: 'low' | 'medium' | 'high'
  category_tolerances: Record<string, string>
  monetary_thresholds: Record<string, number>
  qualitative_statements: string[]
}

export interface RemediationSLA {
  critical: number
  high: number
  medium: number
  low: number
  unit: 'hours' | 'days' | 'weeks'
}

export interface ComplianceThresholds {
  minimum_compliance_score: number
  risk_score_alert_threshold: number
  gap_count_alert_threshold: number
  evidence_expiry_warning_days: number
}

// Event and Notification Types
export interface ComplianceEvent {
  id: string
  type: string
  category: 'compliance' | 'risk' | 'workflow' | 'integration' | 'system'
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  entity_type?: string
  entity_id?: string
  source: string
  timestamp: string
  user_id?: string
  metadata: Record<string, any>
  correlation_id?: string
  parent_event_id?: string
  tags: string[]
  status: 'new' | 'acknowledged' | 'resolved' | 'ignored'
  resolution_notes?: string
  resolved_by?: string
  resolved_at?: string
}

export interface ComplianceNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  recipient: string
  channel: 'email' | 'sms' | 'push' | 'in_app'
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  scheduled_at?: string
  sent_at?: string
  delivered_at?: string
  read: boolean
  read_at?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  related_entity?: {
    type: string
    id: string
  }
  actions: NotificationAction[]
  expiry_date?: string
  metadata: Record<string, any>
}

export interface NotificationAction {
  id: string
  label: string
  action_type: 'link' | 'api_call' | 'dismiss'
  config: Record<string, any>
  enabled: boolean
}

// API Response Types
export interface ComplianceApiError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
  timestamp: string
  request_id: string
  trace_id?: string
}

export interface ComplianceApiSuccess<T> {
  data: T
  message?: string
  timestamp: string
  request_id: string
  pagination?: {
    page: number
    limit: number
    total: number
    has_next: boolean
    has_previous: boolean
  }
}

// Component Props Types
export interface ComplianceComponentProps {
  dataSourceId?: number
  complianceId?: number
  searchQuery?: string
  filters?: Record<string, any>
  onRefresh?: () => void
  onError?: (error: string) => void
  className?: string
}

export interface ComplianceDashboardProps extends ComplianceComponentProps {
  insights?: ComplianceInsight[]
  alerts?: ComplianceEvent[]
  metrics?: ComplianceMetrics
}

export interface ComplianceListProps extends ComplianceComponentProps {
  items?: any[]
  loading?: boolean
  onItemSelect?: (item: any) => void
  onItemEdit?: (item: any) => void
  onItemDelete?: (item: any) => void
  columns?: TableColumn[]
}

export interface TableColumn {
  key: string
  title: string
  type: 'text' | 'number' | 'date' | 'badge' | 'progress' | 'actions'
  sortable?: boolean
  filterable?: boolean
  width?: string
  render?: (value: any, item: any) => React.ReactNode
}

// Hook Return Types
export interface UseComplianceReturn {
  data: any[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (data: any) => Promise<any>
  update: (id: string | number, data: any) => Promise<any>
  delete: (id: string | number) => Promise<void>
  search: (query: string) => void
  filter: (filters: Record<string, any>) => void
}

export interface UseWorkflowReturn {
  workflows: ComplianceWorkflow[]
  activeWorkflows: ComplianceWorkflowExecution[]
  loading: boolean
  error: string | null
  startWorkflow: (id: number, params?: any) => Promise<string>
  pauseWorkflow: (instanceId: string) => Promise<void>
  resumeWorkflow: (instanceId: string) => Promise<void>
  cancelWorkflow: (instanceId: string) => Promise<void>
  approveStep: (instanceId: string, stepId: string, decision: 'approve' | 'reject', notes?: string) => Promise<void>
}

export interface UseAnalyticsReturn {
  metrics: ComplianceMetrics | null
  insights: ComplianceInsight[]
  trends: TrendData[]
  loading: boolean
  error: string | null
  generateInsight: (type: string, params: any) => Promise<ComplianceInsight>
  dismissInsight: (id: string) => Promise<void>
  exportData: (format: string, filters?: any) => Promise<Blob>
}

// Export all types
export type {
  // Re-export commonly used types
  ComplianceRequirement as Requirement,
  ComplianceAssessment as Assessment,
  ComplianceGap as Gap,
  ComplianceEvidence as Evidence,
  ComplianceWorkflow as Workflow,
  ComplianceReport as Report,
  ComplianceIntegration as Integration,
  ComplianceInsight as Insight,
  ComplianceEvent as Event,
  ComplianceNotification as Notification,
  ComplianceUser as User,
  ComplianceMetrics as Metrics
}

// Default export for convenience
export default {
  ComplianceRequirement,
  ComplianceAssessment,
  ComplianceGap,
  ComplianceEvidence,
  ComplianceWorkflow,
  ComplianceReport,
  ComplianceIntegration,
  ComplianceInsight,
  ComplianceEvent,
  ComplianceNotification,
  ComplianceUser,
  ComplianceMetrics
}
