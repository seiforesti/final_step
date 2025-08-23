// ============================================================================
// ADVANCED SCAN RULE SETS - COLLABORATION TYPE DEFINITIONS
// ============================================================================

import { 
  TeamMember,
  ReviewWorkflow,
  Comment,
  KnowledgeBase
} from './scan-rules.types';

// ============================================================================
// API ERROR TYPE
// ============================================================================

export interface APIError {
  message: string;
  code: string;
  status: number;
  details?: any;
  timestamp: string;
  requestId?: string;
}

// ============================================================================
// COLLABORATION CORE TYPES
// ============================================================================

export interface CollaborationPlatform {
  platform_id: string;
  name: string;
  version: string;
  workspaces: CollaborationWorkspace[];
  teams: CollaborationTeam[];
  projects: CollaborationProject[];
  communication_channels: CommunicationChannel[];
  knowledge_repositories: KnowledgeRepository[];
  collaboration_metrics: CollaborationMetrics;
}

export interface CollaborationWorkspace {
  workspace_id: string;
  name: string;
  description: string;
  workspace_type: 'private' | 'team' | 'organization' | 'public';
  members: WorkspaceMember[];
  permissions: WorkspacePermissions;
  settings: WorkspaceSettings;
  resources: WorkspaceResource[];
  activity_log: ActivityLogEntry[];
  integrations: WorkspaceIntegration[];
}

export interface WorkspaceMember {
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  role: 'owner' | 'admin' | 'moderator' | 'contributor' | 'viewer' | 'guest';
  permissions: MemberPermission[];
  joined_date: string;
  last_active: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_invitation';
  expertise_areas: ExpertiseArea[];
  contribution_metrics: ContributionMetrics;
}

export interface ExpertiseArea {
  area_name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience: number;
  certifications: string[];
  endorsements: Endorsement[];
  skill_tags: string[];
}

export interface Endorsement {
  endorser_id: string;
  endorser_name: string;
  endorsement_text: string;
  endorsement_date: string;
  skill_area: string;
  credibility_score: number;
}

export interface ContributionMetrics {
  total_contributions: number;
  rules_created: number;
  rules_reviewed: number;
  comments_made: number;
  knowledge_articles_authored: number;
  collaboration_score: number;
  quality_rating: number;
  helpfulness_rating: number;
}

export interface MemberPermission {
  permission_name: string;
  permission_type: 'read' | 'write' | 'delete' | 'admin' | 'moderate' | 'share' | 'export';
  resource_scope: string[];
  granted_date: string;
  granted_by: string;
  expiry_date?: string;
  conditions: string[];
}

export interface WorkspacePermissions {
  default_permissions: DefaultPermission[];
  role_based_permissions: RoleBasedPermission[];
  resource_specific_permissions: ResourceSpecificPermission[];
  conditional_permissions: ConditionalPermission[];
  permission_inheritance: PermissionInheritance;
}

export interface DefaultPermission {
  permission_name: string;
  enabled: boolean;
  applies_to_roles: string[];
  resource_types: string[];
  conditions: string[];
}

export interface RoleBasedPermission {
  role_name: string;
  permissions: string[];
  resource_access: ResourceAccess[];
  delegation_rights: string[];
  approval_authority: ApprovalAuthority[];
}

export interface ResourceAccess {
  resource_type: string;
  access_level: 'none' | 'read' | 'write' | 'admin' | 'full';
  resource_filters: ResourceFilter[];
  time_restrictions: TimeRestriction[];
}

export interface ResourceFilter {
  filter_type: 'category' | 'tag' | 'owner' | 'status' | 'priority' | 'custom';
  filter_value: any;
  include_exclude: 'include' | 'exclude';
}

export interface TimeRestriction {
  restriction_type: 'time_of_day' | 'day_of_week' | 'date_range' | 'duration_limit';
  restriction_value: any;
  timezone: string;
}

export interface ApprovalAuthority {
  approval_type: 'rule_creation' | 'rule_modification' | 'rule_deletion' | 'workflow_execution' | 'resource_sharing';
  authority_level: 'none' | 'recommend' | 'approve' | 'veto' | 'delegate';
  scope_limitations: string[];
  escalation_rules: EscalationRule[];
}

export interface EscalationRule {
  trigger_condition: string;
  escalation_target: string;
  escalation_delay: string;
  escalation_message_template: string;
  max_escalations: number;
}

export interface ResourceSpecificPermission {
  resource_id: string;
  resource_type: string;
  user_permissions: UserResourcePermission[];
  group_permissions: GroupResourcePermission[];
  inheritance_settings: InheritanceSettings;
}

export interface UserResourcePermission {
  user_id: string;
  permissions: string[];
  granted_by: string;
  granted_date: string;
  expiry_date?: string;
  permission_source: 'direct' | 'inherited' | 'role_based';
}

export interface GroupResourcePermission {
  group_id: string;
  group_name: string;
  permissions: string[];
  granted_by: string;
  granted_date: string;
  expiry_date?: string;
}

export interface InheritanceSettings {
  inherit_from_parent: boolean;
  inherit_from_workspace: boolean;
  inherit_from_team: boolean;
  override_inheritance: boolean;
  inheritance_priority: string[];
}

export interface ConditionalPermission {
  condition_name: string;
  condition_expression: string;
  permissions_granted: string[];
  permissions_revoked: string[];
  evaluation_frequency: string;
  condition_dependencies: string[];
}

export interface PermissionInheritance {
  inheritance_hierarchy: string[];
  inheritance_rules: InheritanceRule[];
  conflict_resolution: 'most_permissive' | 'most_restrictive' | 'explicit_override' | 'custom';
  inheritance_audit: InheritanceAuditEntry[];
}

export interface InheritanceRule {
  rule_name: string;
  source_level: string;
  target_level: string;
  permissions_inherited: string[];
  permissions_excluded: string[];
  inheritance_conditions: string[];
}

export interface InheritanceAuditEntry {
  audit_id: string;
  user_id: string;
  resource_id: string;
  inherited_permissions: string[];
  inheritance_source: string;
  audit_timestamp: string;
  audit_reason: string;
}

export interface WorkspaceSettings {
  visibility: 'private' | 'internal' | 'public';
  collaboration_mode: 'synchronous' | 'asynchronous' | 'hybrid';
  notification_settings: NotificationSettings;
  integration_settings: IntegrationSettings;
  security_settings: SecuritySettings;
  customization_settings: CustomizationSettings;
  workflow_settings: WorkflowSettings;
}

export interface NotificationSettings {
  email_notifications: EmailNotificationConfig;
  in_app_notifications: InAppNotificationConfig;
  push_notifications: PushNotificationConfig;
  webhook_notifications: WebhookNotificationConfig;
  notification_preferences: NotificationPreference[];
}

export interface EmailNotificationConfig {
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  email_template: string;
  digest_format: 'summary' | 'detailed' | 'custom';
  unsubscribe_options: string[];
}

export interface InAppNotificationConfig {
  enabled: boolean;
  notification_types: string[];
  display_duration: number;
  priority_filtering: boolean;
  grouping_enabled: boolean;
}

export interface PushNotificationConfig {
  enabled: boolean;
  device_types: string[];
  notification_categories: string[];
  quiet_hours: QuietHours;
  priority_threshold: string;
}

export interface QuietHours {
  enabled: boolean;
  start_time: string;
  end_time: string;
  timezone: string;
  days_of_week: string[];
  emergency_override: boolean;
}

export interface WebhookNotificationConfig {
  enabled: boolean;
  webhook_urls: WebhookUrl[];
  event_filters: EventFilter[];
  retry_policy: WebhookRetryPolicy;
  security_settings: WebhookSecuritySettings;
}

export interface WebhookUrl {
  url: string;
  name: string;
  event_types: string[];
  authentication: WebhookAuthentication;
  active: boolean;
}

export interface WebhookAuthentication {
  auth_type: 'none' | 'basic' | 'bearer_token' | 'api_key' | 'signature';
  credentials: Record<string, string>;
  signature_algorithm?: string;
}

export interface EventFilter {
  event_type: string;
  filter_criteria: Record<string, any>;
  include_exclude: 'include' | 'exclude';
}

export interface WebhookRetryPolicy {
  max_retries: number;
  retry_delay_seconds: number;
  backoff_strategy: 'linear' | 'exponential' | 'fixed';
  timeout_seconds: number;
}

export interface WebhookSecuritySettings {
  verify_ssl: boolean;
  ip_whitelist: string[];
  rate_limiting: WebhookRateLimit;
  payload_encryption: boolean;
}

export interface WebhookRateLimit {
  requests_per_minute: number;
  burst_capacity: number;
  rate_limit_action: 'queue' | 'drop' | 'throttle';
}

export interface NotificationPreference {
  user_id: string;
  notification_type: string;
  delivery_method: string[];
  frequency: string;
  enabled: boolean;
  custom_filters: CustomNotificationFilter[];
}

export interface CustomNotificationFilter {
  filter_name: string;
  filter_expression: string;
  action: 'include' | 'exclude' | 'prioritize' | 'delay';
  filter_parameters: Record<string, any>;
}

export interface IntegrationSettings {
  external_integrations: ExternalIntegration[];
  api_access: APIAccessConfig;
  data_sync: DataSyncConfig;
  single_sign_on: SSOConfig;
  third_party_tools: ThirdPartyToolConfig[];
}

export interface ExternalIntegration {
  integration_id: string;
  integration_name: string;
  integration_type: 'git' | 'jira' | 'slack' | 'teams' | 'email' | 'custom';
  configuration: IntegrationConfiguration;
  status: 'active' | 'inactive' | 'error' | 'pending';
  sync_settings: SyncSettings;
  mapping_rules: MappingRule[];
}

export interface IntegrationConfiguration {
  endpoint_url: string;
  authentication: IntegrationAuthentication;
  connection_settings: ConnectionSettings;
  feature_flags: Record<string, boolean>;
  custom_parameters: Record<string, any>;
}

export interface IntegrationAuthentication {
  auth_method: 'oauth2' | 'api_key' | 'basic_auth' | 'certificate' | 'token';
  credentials: Record<string, string>;
  token_refresh_settings: TokenRefreshSettings;
  security_settings: AuthSecuritySettings;
}

export interface TokenRefreshSettings {
  auto_refresh: boolean;
  refresh_threshold_minutes: number;
  max_refresh_attempts: number;
  refresh_callback_url?: string;
}

export interface AuthSecuritySettings {
  encryption_enabled: boolean;
  credential_rotation: boolean;
  rotation_frequency_days: number;
  audit_authentication: boolean;
}

export interface ConnectionSettings {
  timeout_seconds: number;
  retry_attempts: number;
  connection_pooling: boolean;
  keep_alive: boolean;
  compression_enabled: boolean;
}

export interface SyncSettings {
  sync_frequency: string;
  sync_direction: 'bidirectional' | 'inbound' | 'outbound';
  conflict_resolution: 'source_wins' | 'target_wins' | 'manual_review' | 'merge';
  data_transformation: DataTransformation[];
  sync_filters: SyncFilter[];
}

export interface DataTransformation {
  transformation_name: string;
  transformation_type: 'field_mapping' | 'data_conversion' | 'filtering' | 'enrichment' | 'validation';
  transformation_rules: TransformationRule[];
  error_handling: TransformationErrorHandling;
}

export interface TransformationRule {
  rule_name: string;
  source_field: string;
  target_field: string;
  transformation_function: string;
  parameters: Record<string, any>;
  validation_rules: string[];
}

export interface TransformationErrorHandling {
  error_action: 'skip' | 'fail' | 'default_value' | 'log_and_continue';
  default_value?: any;
  error_notification: boolean;
  error_logging: boolean;
}

export interface SyncFilter {
  filter_name: string;
  filter_expression: string;
  filter_scope: 'inbound' | 'outbound' | 'both';
  active: boolean;
}

export interface MappingRule {
  rule_id: string;
  source_system: string;
  target_system: string;
  field_mappings: FieldMapping[];
  transformation_logic: string;
  validation_rules: string[];
}

export interface FieldMapping {
  source_field: string;
  target_field: string;
  data_type_conversion: string;
  required: boolean;
  default_value?: any;
}

export interface APIAccessConfig {
  api_enabled: boolean;
  api_version: string;
  rate_limiting: APIRateLimit;
  authentication_methods: string[];
  api_documentation_url: string;
  webhook_support: boolean;
}

export interface APIRateLimit {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  burst_capacity: number;
  rate_limit_headers: boolean;
}

export interface DataSyncConfig {
  real_time_sync: boolean;
  batch_sync_schedule: string;
  conflict_resolution_strategy: string;
  data_validation: boolean;
  sync_audit_logging: boolean;
  backup_before_sync: boolean;
}

export interface SSOConfig {
  sso_enabled: boolean;
  identity_provider: string;
  sso_protocol: 'saml' | 'oauth2' | 'openid_connect' | 'ldap';
  configuration: SSOConfiguration;
  user_provisioning: UserProvisioningConfig;
}

export interface SSOConfiguration {
  entity_id: string;
  login_url: string;
  logout_url: string;
  certificate_path: string;
  attribute_mapping: AttributeMapping[];
  session_settings: SSOSessionSettings;
}

export interface AttributeMapping {
  sso_attribute: string;
  local_attribute: string;
  required: boolean;
  transformation: string;
}

export interface SSOSessionSettings {
  session_timeout_minutes: number;
  remember_me_enabled: boolean;
  force_authentication: boolean;
  single_logout_enabled: boolean;
}

export interface UserProvisioningConfig {
  auto_provisioning: boolean;
  provisioning_rules: ProvisioningRule[];
  deprovisioning_policy: DeprovisioningPolicy;
  group_sync: boolean;
}

export interface ProvisioningRule {
  rule_name: string;
  condition: string;
  action: 'create_user' | 'update_user' | 'assign_role' | 'add_to_group';
  parameters: Record<string, any>;
}

export interface DeprovisioningPolicy {
  auto_deprovision: boolean;
  deprovision_delay_days: number;
  archive_user_data: boolean;
  transfer_ownership: boolean;
}

export interface ThirdPartyToolConfig {
  tool_name: string;
  tool_type: 'productivity' | 'communication' | 'development' | 'analytics' | 'security';
  integration_method: 'api' | 'webhook' | 'plugin' | 'embed';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface SecuritySettings {
  access_control: AccessControlSettings;
  data_protection: DataProtectionSettings;
  audit_logging: AuditLoggingSettings;
  compliance: ComplianceSettings;
  threat_protection: ThreatProtectionSettings;
}

export interface AccessControlSettings {
  multi_factor_authentication: MFASettings;
  password_policy: PasswordPolicy;
  session_management: SessionManagementSettings;
  ip_restrictions: IPRestrictionSettings;
  device_management: DeviceManagementSettings;
}

export interface MFASettings {
  required: boolean;
  methods: MFAMethod[];
  backup_codes: boolean;
  remember_device: boolean;
  remember_duration_days: number;
}

export interface MFAMethod {
  method_type: 'totp' | 'sms' | 'email' | 'push' | 'hardware_token' | 'biometric';
  enabled: boolean;
  priority: number;
  configuration: Record<string, any>;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_history: number;
  expiration_days: number;
  complexity_requirements: string[];
}

export interface SessionManagementSettings {
  session_timeout_minutes: number;
  idle_timeout_minutes: number;
  concurrent_sessions_limit: number;
  session_fixation_protection: boolean;
  secure_cookies: boolean;
}

export interface IPRestrictionSettings {
  ip_whitelist_enabled: boolean;
  allowed_ip_ranges: string[];
  geo_restrictions: GeoRestriction[];
  vpn_detection: boolean;
  tor_blocking: boolean;
}

export interface GeoRestriction {
  restriction_type: 'allow' | 'block';
  countries: string[];
  regions: string[];
  cities: string[];
}

export interface DeviceManagementSettings {
  device_registration_required: boolean;
  trusted_devices: TrustedDevice[];
  device_fingerprinting: boolean;
  mobile_device_management: MDMSettings;
}

export interface TrustedDevice {
  device_id: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  user_id: string;
  registered_date: string;
  last_used: string;
  trust_level: 'low' | 'medium' | 'high';
}

export interface MDMSettings {
  mdm_enabled: boolean;
  required_compliance_policies: string[];
  app_protection_policies: string[];
  device_encryption_required: boolean;
  jailbreak_detection: boolean;
}

export interface DataProtectionSettings {
  encryption_at_rest: EncryptionSettings;
  encryption_in_transit: EncryptionSettings;
  data_classification: DataClassificationSettings;
  data_loss_prevention: DLPSettings;
  backup_encryption: boolean;
}

export interface EncryptionSettings {
  enabled: boolean;
  algorithm: string;
  key_length: number;
  key_management: KeyManagementSettings;
  certificate_management: CertificateManagementSettings;
}

export interface KeyManagementSettings {
  key_rotation_enabled: boolean;
  rotation_frequency_days: number;
  key_escrow: boolean;
  hardware_security_module: boolean;
  key_derivation_function: string;
}

export interface CertificateManagementSettings {
  auto_renewal: boolean;
  certificate_authority: string;
  certificate_validation: boolean;
  revocation_checking: boolean;
}

export interface DataClassificationSettings {
  auto_classification: boolean;
  classification_levels: ClassificationLevel[];
  labeling_required: boolean;
  retention_policies: RetentionPolicy[];
}

export interface ClassificationLevel {
  level_name: string;
  level_value: number;
  description: string;
  handling_requirements: string[];
  access_restrictions: string[];
}

export interface RetentionPolicy {
  policy_name: string;
  classification_levels: string[];
  retention_period_days: number;
  disposal_method: 'secure_delete' | 'archive' | 'anonymize';
  legal_hold_support: boolean;
}

export interface DLPSettings {
  dlp_enabled: boolean;
  content_inspection: ContentInspectionSettings;
  policy_enforcement: PolicyEnforcementSettings;
  incident_response: IncidentResponseSettings;
}

export interface ContentInspectionSettings {
  file_type_scanning: boolean;
  content_analysis: boolean;
  pattern_matching: boolean;
  machine_learning_detection: boolean;
  custom_rules: CustomDLPRule[];
}

export interface CustomDLPRule {
  rule_name: string;
  rule_description: string;
  detection_pattern: string;
  sensitivity_level: string;
  action: 'block' | 'warn' | 'log' | 'quarantine';
}

export interface PolicyEnforcementSettings {
  enforcement_mode: 'monitor' | 'enforce' | 'test';
  policy_exceptions: PolicyException[];
  escalation_rules: DLPEscalationRule[];
}

export interface PolicyException {
  exception_name: string;
  users: string[];
  groups: string[];
  conditions: string[];
  expiry_date?: string;
}

export interface DLPEscalationRule {
  trigger_condition: string;
  escalation_target: string;
  escalation_action: string;
  notification_template: string;
}

export interface IncidentResponseSettings {
  auto_incident_creation: boolean;
  incident_classification: IncidentClassification[];
  response_workflows: ResponseWorkflow[];
  forensic_collection: boolean;
}

export interface IncidentClassification {
  classification_name: string;
  severity_level: string;
  response_time_sla: string;
  escalation_criteria: string[];
}

export interface ResponseWorkflow {
  workflow_name: string;
  trigger_conditions: string[];
  workflow_steps: WorkflowStep[];
  success_criteria: string[];
}

export interface WorkflowStep {
  step_name: string;
  step_type: 'automated' | 'manual' | 'approval';
  action: string;
  parameters: Record<string, any>;
  timeout_minutes: number;
}

export interface AuditLoggingSettings {
  audit_enabled: boolean;
  log_retention_days: number;
  log_storage_location: string;
  log_encryption: boolean;
  audit_events: AuditEventConfig[];
  log_integrity_protection: boolean;
}

export interface AuditEventConfig {
  event_type: string;
  log_level: 'info' | 'warning' | 'error' | 'critical';
  include_details: boolean;
  custom_fields: string[];
  retention_override?: number;
}

export interface ComplianceSettings {
  compliance_frameworks: ComplianceFramework[];
  compliance_monitoring: ComplianceMonitoringSettings;
  reporting: ComplianceReportingSettings;
  attestation: AttestationSettings;
}

export interface ComplianceFramework {
  framework_name: string;
  framework_version: string;
  applicable_controls: ApplicableControl[];
  assessment_schedule: string;
  compliance_officer: string;
}

export interface ApplicableControl {
  control_id: string;
  control_name: string;
  control_description: string;
  implementation_status: 'not_implemented' | 'partially_implemented' | 'implemented' | 'not_applicable';
  evidence_required: string[];
  testing_frequency: string;
}

export interface ComplianceMonitoringSettings {
  continuous_monitoring: boolean;
  monitoring_frequency: string;
  automated_assessments: boolean;
  compliance_dashboards: boolean;
  alert_thresholds: ComplianceThreshold[];
}

export interface ComplianceThreshold {
  metric_name: string;
  threshold_value: number;
  comparison_operator: string;
  alert_severity: string;
  notification_recipients: string[];
}

export interface ComplianceReportingSettings {
  automated_reporting: boolean;
  report_templates: ReportTemplate[];
  distribution_lists: DistributionList[];
  report_scheduling: ReportSchedule[];
}

export interface ReportTemplate {
  template_name: string;
  template_description: string;
  report_format: 'pdf' | 'excel' | 'html' | 'json';
  included_sections: string[];
  data_sources: string[];
}

export interface DistributionList {
  list_name: string;
  recipients: Recipient[];
  delivery_method: 'email' | 'portal' | 'api' | 'sftp';
  encryption_required: boolean;
}

export interface Recipient {
  recipient_type: 'user' | 'group' | 'external';
  recipient_id: string;
  recipient_name: string;
  contact_info: string;
  delivery_preferences: Record<string, any>;
}

export interface ReportSchedule {
  schedule_name: string;
  report_template: string;
  distribution_list: string;
  frequency: string;
  next_execution: string;
  timezone: string;
}

export interface AttestationSettings {
  attestation_required: boolean;
  attestation_frequency: string;
  attestation_scope: string[];
  attestation_workflow: AttestationWorkflow;
  digital_signatures: boolean;
}

export interface AttestationWorkflow {
  workflow_steps: AttestationStep[];
  approval_requirements: AttestationApproval[];
  reminder_settings: ReminderSettings;
  escalation_rules: AttestationEscalation[];
}

export interface AttestationStep {
  step_name: string;
  step_description: string;
  responsible_party: string;
  due_date_offset_days: number;
  required_evidence: string[];
}

export interface AttestationApproval {
  approval_level: string;
  required_approvers: number;
  approver_roles: string[];
  approval_criteria: string[];
}

export interface ReminderSettings {
  reminder_enabled: boolean;
  reminder_frequency: string;
  reminder_recipients: string[];
  escalation_after_reminders: number;
}

export interface AttestationEscalation {
  escalation_trigger: string;
  escalation_target: string;
  escalation_message: string;
  escalation_delay_days: number;
}

export interface ThreatProtectionSettings {
  threat_detection: ThreatDetectionSettings;
  incident_response: ThreatIncidentResponse;
  threat_intelligence: ThreatIntelligenceSettings;
  security_monitoring: SecurityMonitoringSettings;
}

export interface ThreatDetectionSettings {
  behavioral_analysis: boolean;
  anomaly_detection: boolean;
  signature_based_detection: boolean;
  machine_learning_detection: boolean;
  threat_feeds: ThreatFeed[];
}

export interface ThreatFeed {
  feed_name: string;
  feed_url: string;
  feed_type: 'ioc' | 'reputation' | 'vulnerability' | 'malware';
  update_frequency: string;
  feed_credibility: number;
}

export interface ThreatIncidentResponse {
  auto_response: boolean;
  response_playbooks: ResponsePlaybook[];
  containment_actions: ContainmentAction[];
  notification_procedures: NotificationProcedure[];
}

export interface ResponsePlaybook {
  playbook_name: string;
  threat_types: string[];
  response_steps: ResponseStep[];
  success_criteria: string[];
  rollback_procedures: string[];
}

export interface ResponseStep {
  step_name: string;
  step_type: 'automated' | 'manual' | 'decision';
  action_description: string;
  execution_timeout: number;
  success_criteria: string[];
}

export interface ContainmentAction {
  action_name: string;
  action_type: 'isolate' | 'block' | 'quarantine' | 'disable' | 'monitor';
  scope: string[];
  automation_level: 'manual' | 'semi_automated' | 'fully_automated';
}

export interface NotificationProcedure {
  procedure_name: string;
  trigger_conditions: string[];
  notification_recipients: NotificationRecipient[];
  message_templates: MessageTemplate[];
}

export interface NotificationRecipient {
  recipient_type: 'user' | 'group' | 'external' | 'system';
  recipient_identifier: string;
  notification_methods: string[];
  escalation_delay_minutes: number;
}

export interface MessageTemplate {
  template_name: string;
  template_content: string;
  template_variables: string[];
  localization_support: boolean;
}

export interface ThreatIntelligenceSettings {
  threat_intel_enabled: boolean;
  intel_sources: IntelSource[];
  analysis_engines: AnalysisEngine[];
  sharing_settings: SharingSettings;
}

export interface IntelSource {
  source_name: string;
  source_type: 'commercial' | 'open_source' | 'government' | 'community';
  api_endpoint: string;
  authentication: Record<string, any>;
  data_types: string[];
}

export interface AnalysisEngine {
  engine_name: string;
  analysis_type: 'static' | 'dynamic' | 'behavioral' | 'heuristic';
  confidence_threshold: number;
  processing_priority: number;
}

export interface SharingSettings {
  sharing_enabled: boolean;
  sharing_partners: SharingPartner[];
  data_sanitization: boolean;
  sharing_protocols: string[];
}

export interface SharingPartner {
  partner_name: string;
  partner_type: 'government' | 'industry' | 'academic' | 'vendor';
  trust_level: number;
  data_sharing_agreement: string;
}

export interface SecurityMonitoringSettings {
  monitoring_enabled: boolean;
  monitoring_scope: string[];
  alert_correlation: boolean;
  dashboard_configuration: SecurityDashboardConfig;
  reporting_configuration: SecurityReportingConfig;
}

export interface SecurityDashboardConfig {
  dashboard_layout: string;
  widget_configuration: DashboardWidget[];
  refresh_interval_seconds: number;
  alert_display_settings: AlertDisplaySettings;
}

export interface DashboardWidget {
  widget_id: string;
  widget_type: 'chart' | 'table' | 'metric' | 'alert_list' | 'map';
  widget_title: string;
  data_source: string;
  configuration: Record<string, any>;
  position: WidgetPosition;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AlertDisplaySettings {
  max_alerts_displayed: number;
  alert_grouping: boolean;
  severity_filtering: boolean;
  auto_refresh: boolean;
}

export interface SecurityReportingConfig {
  automated_reports: boolean;
  report_frequency: string;
  report_recipients: string[];
  report_format: string;
  custom_metrics: string[];
}

export interface CustomizationSettings {
  ui_customization: UICustomizationSettings;
  workflow_customization: WorkflowCustomizationSettings;
  branding: BrandingSettings;
  localization: LocalizationSettings;
}

export interface UICustomizationSettings {
  custom_themes: CustomTheme[];
  layout_options: LayoutOption[];
  widget_customization: WidgetCustomization[];
  navigation_customization: NavigationCustomization;
}

export interface CustomTheme {
  theme_name: string;
  theme_description: string;
  color_palette: ColorPalette;
  typography: TypographySettings;
  spacing: SpacingSettings;
  component_styles: ComponentStyle[];
}

export interface ColorPalette {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  error_color: string;
  warning_color: string;
  success_color: string;
}

export interface TypographySettings {
  font_family: string;
  font_sizes: Record<string, string>;
  font_weights: Record<string, string>;
  line_heights: Record<string, string>;
}

export interface SpacingSettings {
  base_unit: string;
  spacing_scale: number[];
  margin_defaults: Record<string, string>;
  padding_defaults: Record<string, string>;
}

export interface ComponentStyle {
  component_name: string;
  style_overrides: Record<string, any>;
  responsive_settings: ResponsiveSettings;
}

export interface ResponsiveSettings {
  breakpoints: Record<string, string>;
  responsive_overrides: Record<string, Record<string, any>>;
}

export interface LayoutOption {
  layout_name: string;
  layout_description: string;
  layout_configuration: LayoutConfiguration;
  supported_components: string[];
}

export interface LayoutConfiguration {
  layout_type: 'grid' | 'flex' | 'absolute' | 'flow';
  columns: number;
  rows?: number;
  gap: string;
  alignment: string;
  responsive_behavior: string;
}

export interface WidgetCustomization {
  widget_type: string;
  customization_options: CustomizationOption[];
  default_settings: Record<string, any>;
  validation_rules: string[];
}

export interface CustomizationOption {
  option_name: string;
  option_type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'file';
  option_description: string;
  possible_values?: any[];
  default_value: any;
  validation_rules: string[];
}

export interface NavigationCustomization {
  navigation_style: 'sidebar' | 'top_bar' | 'breadcrumb' | 'tabs';
  menu_structure: MenuStructure;
  navigation_preferences: NavigationPreference[];
}

export interface MenuStructure {
  menu_items: MenuItem[];
  max_depth: number;
  collapsible: boolean;
  search_enabled: boolean;
}

export interface MenuItem {
  item_id: string;
  item_label: string;
  item_url: string;
  item_icon?: string;
  parent_id?: string;
  order: number;
  permissions_required: string[];
  children?: MenuItem[];
}

export interface NavigationPreference {
  user_id: string;
  preferred_navigation_style: string;
  pinned_items: string[];
  hidden_items: string[];
  custom_shortcuts: CustomShortcut[];
}

export interface CustomShortcut {
  shortcut_name: string;
  shortcut_url: string;
  shortcut_icon: string;
  keyboard_shortcut?: string;
}

export interface WorkflowCustomizationSettings {
  custom_workflows: CustomWorkflow[];
  workflow_templates: WorkflowTemplate[];
  approval_processes: ApprovalProcess[];
  automation_rules: AutomationRule[];
}

export interface CustomWorkflow {
  workflow_id: string;
  workflow_name: string;
  workflow_description: string;
  workflow_steps: CustomWorkflowStep[];
  trigger_conditions: TriggerCondition[];
  success_criteria: string[];
}

export interface CustomWorkflowStep {
  step_id: string;
  step_name: string;
  step_type: 'task' | 'decision' | 'approval' | 'notification' | 'integration';
  step_configuration: Record<string, any>;
  dependencies: string[];
  timeout_settings: TimeoutSettings;
}

export interface TriggerCondition {
  condition_name: string;
  condition_type: 'event' | 'schedule' | 'manual' | 'api' | 'data_change';
  condition_parameters: Record<string, any>;
  condition_logic: string;
}

export interface TimeoutSettings {
  timeout_enabled: boolean;
  timeout_duration: string;
  timeout_action: 'fail' | 'skip' | 'escalate' | 'retry';
  escalation_target?: string;
}

export interface WorkflowTemplate {
  template_id: string;
  template_name: string;
  template_description: string;
  template_category: string;
  template_steps: TemplateStep[];
  customization_points: CustomizationPoint[];
}

export interface TemplateStep {
  step_template_id: string;
  step_name: string;
  step_description: string;
  step_type: string;
  required_parameters: Parameter[];
  optional_parameters: Parameter[];
}

export interface Parameter {
  parameter_name: string;
  parameter_type: string;
  parameter_description: string;
  default_value?: any;
  validation_rules: string[];
}

export interface CustomizationPoint {
  customization_name: string;
  customization_type: 'parameter' | 'step' | 'flow' | 'condition';
  customization_description: string;
  customization_options: string[];
}

export interface ApprovalProcess {
  process_id: string;
  process_name: string;
  process_description: string;
  approval_stages: ApprovalStage[];
  escalation_rules: ProcessEscalationRule[];
  bypass_conditions: BypassCondition[];
}

export interface ApprovalStage {
  stage_id: string;
  stage_name: string;
  required_approvers: number;
  approver_roles: string[];
  stage_timeout: string;
  parallel_approval: boolean;
}

export interface ProcessEscalationRule {
  escalation_trigger: string;
  escalation_delay: string;
  escalation_target: string;
  escalation_action: string;
}

export interface BypassCondition {
  condition_name: string;
  condition_logic: string;
  bypass_stages: string[];
  audit_requirement: boolean;
}

export interface AutomationRule {
  rule_id: string;
  rule_name: string;
  rule_description: string;
  trigger_events: string[];
  rule_conditions: RuleCondition[];
  rule_actions: RuleAction[];
  rule_schedule?: RuleSchedule;
}

export interface RuleCondition {
  condition_id: string;
  condition_expression: string;
  condition_parameters: Record<string, any>;
  evaluation_order: number;
}

export interface RuleAction {
  action_id: string;
  action_type: string;
  action_parameters: Record<string, any>;
  execution_order: number;
  rollback_action?: string;
}

export interface RuleSchedule {
  schedule_type: 'cron' | 'interval' | 'event_driven';
  schedule_expression: string;
  timezone: string;
  max_executions?: number;
}

export interface BrandingSettings {
  organization_branding: OrganizationBranding;
  custom_logos: CustomLogo[];
  color_schemes: ColorScheme[];
  custom_css: string;
  favicon_settings: FaviconSettings;
}

export interface OrganizationBranding {
  organization_name: string;
  organization_logo_url: string;
  organization_colors: OrganizationColors;
  copyright_text: string;
  terms_of_service_url: string;
  privacy_policy_url: string;
}

export interface OrganizationColors {
  primary_brand_color: string;
  secondary_brand_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
}

export interface CustomLogo {
  logo_name: string;
  logo_url: string;
  logo_type: 'header' | 'footer' | 'favicon' | 'loading' | 'email';
  dimensions: LogoDimensions;
  usage_contexts: string[];
}

export interface LogoDimensions {
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'svg' | 'gif';
  max_file_size_kb: number;
}

export interface ColorScheme {
  scheme_name: string;
  scheme_description: string;
  colors: Record<string, string>;
  usage_context: string[];
}

export interface FaviconSettings {
  favicon_url: string;
  favicon_sizes: string[];
  apple_touch_icon_url: string;
  manifest_url: string;
}

export interface LocalizationSettings {
  supported_languages: SupportedLanguage[];
  default_language: string;
  translation_management: TranslationManagement;
  date_time_formats: DateTimeFormats;
  number_formats: NumberFormats;
}

export interface SupportedLanguage {
  language_code: string;
  language_name: string;
  region_code: string;
  rtl_support: boolean;
  translation_completeness: number;
}

export interface TranslationManagement {
  translation_source: 'internal' | 'external' | 'crowdsourced';
  translation_workflow: TranslationWorkflow;
  quality_assurance: TranslationQA;
  update_frequency: string;
}

export interface TranslationWorkflow {
  workflow_steps: TranslationStep[];
  reviewer_assignments: ReviewerAssignment[];
  approval_process: TranslationApproval;
}

export interface TranslationStep {
  step_name: string;
  step_type: 'translate' | 'review' | 'approve' | 'publish';
  responsible_role: string;
  step_duration_days: number;
}

export interface ReviewerAssignment {
  language_code: string;
  reviewer_id: string;
  reviewer_expertise: string[];
  assignment_date: string;
}

export interface TranslationApproval {
  approval_required: boolean;
  approver_roles: string[];
  approval_criteria: string[];
  quality_threshold: number;
}

export interface TranslationQA {
  automated_checks: AutomatedCheck[];
  manual_review: boolean;
  quality_metrics: QualityMetric[];
  feedback_collection: boolean;
}

export interface AutomatedCheck {
  check_name: string;
  check_type: 'grammar' | 'terminology' | 'consistency' | 'completeness';
  check_parameters: Record<string, any>;
  error_threshold: number;
}

export interface QualityMetric {
  metric_name: string;
  measurement_method: string;
  target_value: number;
  current_value: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface DateTimeFormats {
  date_formats: Record<string, string>;
  time_formats: Record<string, string>;
  datetime_formats: Record<string, string>;
  timezone_handling: TimezoneHandling;
}

export interface TimezoneHandling {
  default_timezone: string;
  user_timezone_detection: boolean;
  timezone_conversion: boolean;
  daylight_saving_support: boolean;
}

export interface NumberFormats {
  decimal_separator: string;
  thousands_separator: string;
  currency_formats: Record<string, CurrencyFormat>;
  percentage_format: string;
}

export interface CurrencyFormat {
  currency_code: string;
  currency_symbol: string;
  symbol_position: 'before' | 'after';
  decimal_places: number;
}

export interface WorkflowSettings {
  default_workflows: DefaultWorkflow[];
  workflow_permissions: WorkflowPermissions;
  workflow_monitoring: WorkflowMonitoring;
  workflow_optimization: WorkflowOptimization;
}

export interface DefaultWorkflow {
  workflow_name: string;
  workflow_description: string;
  trigger_events: string[];
  workflow_definition: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowPermissions {
  create_workflow: string[];
  modify_workflow: string[];
  execute_workflow: string[];
  delete_workflow: string[];
  approve_workflow_changes: string[];
}

export interface WorkflowMonitoring {
  monitoring_enabled: boolean;
  performance_tracking: boolean;
  error_tracking: boolean;
  audit_logging: boolean;
  dashboard_configuration: WorkflowDashboardConfig;
}

export interface WorkflowDashboardConfig {
  dashboard_widgets: WorkflowWidget[];
  refresh_interval: number;
  alert_configuration: WorkflowAlertConfig[];
}

export interface WorkflowWidget {
  widget_type: 'execution_status' | 'performance_metrics' | 'error_rates' | 'throughput';
  widget_configuration: Record<string, any>;
  display_order: number;
}

export interface WorkflowAlertConfig {
  alert_name: string;
  alert_condition: string;
  alert_threshold: number;
  notification_channels: string[];
  escalation_rules: string[];
}

export interface WorkflowOptimization {
  optimization_enabled: boolean;
  optimization_rules: OptimizationRule[];
  performance_baselines: PerformanceBaseline[];
  improvement_suggestions: ImprovementSuggestion[];
}

export interface OptimizationRule {
  rule_name: string;
  optimization_target: string;
  optimization_logic: string;
  success_criteria: string[];
  rollback_conditions: string[];
}

export interface PerformanceBaseline {
  baseline_name: string;
  baseline_metrics: Record<string, number>;
  baseline_date: string;
  measurement_period: string;
}

export interface ImprovementSuggestion {
  suggestion_id: string;
  suggestion_type: 'performance' | 'efficiency' | 'cost' | 'quality';
  suggestion_description: string;
  expected_impact: string;
  implementation_effort: 'low' | 'medium' | 'high';
  priority: number;
}

// ============================================================================
// COLLABORATION METRICS AND ANALYTICS
// ============================================================================

export interface CollaborationMetrics {
  engagement_metrics: EngagementMetrics;
  productivity_metrics: ProductivityMetrics;
  quality_metrics: CollaborationQualityMetrics;
  communication_metrics: CommunicationMetrics;
  knowledge_sharing_metrics: KnowledgeSharingMetrics;
}

export interface EngagementMetrics {
  active_users: ActiveUserMetrics;
  session_metrics: SessionMetrics;
  feature_usage: FeatureUsageMetrics;
  collaboration_frequency: CollaborationFrequencyMetrics;
}

export interface ActiveUserMetrics {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  user_retention_rate: number;
  new_user_onboarding_rate: number;
  user_churn_rate: number;
}

export interface SessionMetrics {
  average_session_duration: number;
  sessions_per_user: number;
  bounce_rate: number;
  page_views_per_session: number;
  time_to_first_action: number;
}

export interface FeatureUsageMetrics {
  feature_adoption_rates: Record<string, number>;
  feature_usage_frequency: Record<string, number>;
  feature_abandonment_rates: Record<string, number>;
  power_user_features: string[];
}

export interface CollaborationFrequencyMetrics {
  comments_per_user: number;
  reviews_per_user: number;
  shared_resources_per_user: number;
  team_interactions_per_user: number;
  cross_team_collaborations: number;
}

export interface ProductivityMetrics {
  task_completion_metrics: TaskCompletionMetrics;
  workflow_efficiency: WorkflowEfficiencyMetrics;
  time_savings: TimeSavingsMetrics;
  automation_impact: AutomationImpactMetrics;
}

export interface TaskCompletionMetrics {
  average_task_completion_time: number;
  task_completion_rate: number;
  overdue_task_percentage: number;
  task_quality_score: number;
  rework_rate: number;
}

export interface WorkflowEfficiencyMetrics {
  workflow_completion_time: Record<string, number>;
  workflow_success_rate: Record<string, number>;
  bottleneck_identification: BottleneckAnalysis[];
  process_optimization_opportunities: string[];
}

export interface BottleneckAnalysis {
  bottleneck_location: string;
  bottleneck_type: 'resource' | 'process' | 'approval' | 'technical';
  impact_severity: 'low' | 'medium' | 'high' | 'critical';
  suggested_solutions: string[];
}

export interface TimeSavingsMetrics {
  total_time_saved: number;
  time_saved_per_user: number;
  time_saved_by_feature: Record<string, number>;
  efficiency_improvement_percentage: number;
}

export interface AutomationImpactMetrics {
  automated_tasks_percentage: number;
  manual_effort_reduction: number;
  error_reduction_from_automation: number;
  automation_roi: number;
}

export interface CollaborationQualityMetrics {
  content_quality: ContentQualityMetrics;
  collaboration_effectiveness: CollaborationEffectivenessMetrics;
  knowledge_quality: KnowledgeQualityMetrics;
  user_satisfaction: UserSatisfactionMetrics;
}

export interface ContentQualityMetrics {
  average_content_rating: number;
  content_accuracy_score: number;
  content_completeness_score: number;
  content_freshness_score: number;
  peer_review_scores: number;
}

export interface CollaborationEffectivenessMetrics {
  successful_collaborations_percentage: number;
  collaboration_outcome_quality: number;
  team_synergy_score: number;
  conflict_resolution_efficiency: number;
}

export interface KnowledgeQualityMetrics {
  knowledge_accuracy: number;
  knowledge_relevance: number;
  knowledge_accessibility: number;
  knowledge_reusability: number;
  expert_validation_rate: number;
}

export interface UserSatisfactionMetrics {
  overall_satisfaction_score: number;
  feature_satisfaction_scores: Record<string, number>;
  user_feedback_sentiment: SentimentAnalysis;
  recommendation_likelihood: number;
}

export interface SentimentAnalysis {
  positive_sentiment_percentage: number;
  negative_sentiment_percentage: number;
  neutral_sentiment_percentage: number;
  sentiment_trends: SentimentTrend[];
}

export interface SentimentTrend {
  time_period: string;
  sentiment_score: number;
  sentiment_change: number;
  key_topics: string[];
}

export interface CommunicationMetrics {
  message_volume: MessageVolumeMetrics;
  response_times: ResponseTimeMetrics;
  communication_effectiveness: CommunicationEffectivenessMetrics;
  channel_usage: ChannelUsageMetrics;
}

export interface MessageVolumeMetrics {
  total_messages: number;
  messages_per_user: number;
  messages_per_channel: Record<string, number>;
  peak_communication_times: PeakTime[];
}

export interface PeakTime {
  time_period: string;
  message_count: number;
  user_activity_level: number;
}

export interface ResponseTimeMetrics {
  average_response_time: number;
  median_response_time: number;
  response_time_by_priority: Record<string, number>;
  first_response_time: number;
}

export interface CommunicationEffectivenessMetrics {
  message_clarity_score: number;
  information_completeness: number;
  follow_up_required_rate: number;
  misunderstanding_rate: number;
}

export interface ChannelUsageMetrics {
  channel_activity: Record<string, ChannelActivity>;
  preferred_communication_methods: Record<string, number>;
  cross_channel_usage: CrossChannelUsage[];
}

export interface ChannelActivity {
  message_count: number;
  active_users: number;
  engagement_rate: number;
  average_message_length: number;
}

export interface CrossChannelUsage {
  channel_combination: string[];
  usage_frequency: number;
  effectiveness_score: number;
}

export interface KnowledgeSharingMetrics {
  knowledge_creation: KnowledgeCreationMetrics;
  knowledge_consumption: KnowledgeConsumptionMetrics;
  knowledge_transfer: KnowledgeTransferMetrics;
  expertise_distribution: ExpertiseDistributionMetrics;
}

export interface KnowledgeCreationMetrics {
  articles_created: number;
  documentation_updates: number;
  best_practices_shared: number;
  knowledge_creation_rate: number;
  content_creator_diversity: number;
}

export interface KnowledgeConsumptionMetrics {
  knowledge_access_frequency: number;
  search_success_rate: number;
  content_utilization_rate: number;
  user_engagement_with_content: number;
}

export interface KnowledgeTransferMetrics {
  successful_knowledge_transfers: number;
  knowledge_application_rate: number;
  learning_outcome_improvements: number;
  skill_development_tracking: SkillDevelopmentMetric[];
}

export interface SkillDevelopmentMetric {
  skill_area: string;
  skill_improvement_rate: number;
  learning_completion_rate: number;
  skill_application_success: number;
}

export interface ExpertiseDistributionMetrics {
  expertise_coverage: Record<string, number>;
  knowledge_gaps: string[];
  expert_availability: ExpertAvailability[];
  knowledge_concentration_risk: number;
}

export interface ExpertAvailability {
  expertise_area: string;
  available_experts: number;
  expert_utilization_rate: number;
  knowledge_transfer_capacity: number;
}

// =============================================================================
// API ERROR TYPES
// =============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
  method?: string;
  statusCode?: number;
}