// ============================================================================
// ADVANCED CATALOG METADATA & GOVERNANCE TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: Metadata management and governance features across backend services
// ============================================================================

import { 
  IntelligentDataAsset, 
  BusinessGlossaryTerm,
  TimePeriod 
} from './catalog-core.types';

// ============================================================================
// METADATA MANAGEMENT TYPES
// ============================================================================

export interface MetadataManager {
  id: string;
  name: string;
  
  // Metadata Configuration
  config: MetadataManagerConfig;
  
  // Schema Management
  schemaRegistry: MetadataSchemaRegistry;
  
  // Metadata Store
  metadataStore: MetadataStore;
  
  // Enrichment Engine
  enrichmentEngine: MetadataEnrichmentEngine;
  
  // Validation Engine
  validationEngine: MetadataValidationEngine;
  
  // Synchronization
  synchronization: MetadataSynchronization;
  
  // Analytics
  analytics: MetadataAnalytics;
  
  // Quality Control
  qualityControl: MetadataQualityControl;
}

export interface MetadataSchemaRegistry {
  id: string;
  name: string;
  
  // Schema Definitions
  schemas: MetadataSchema[];
  
  // Schema Versions
  versions: SchemaVersion[];
  
  // Schema Relationships
  relationships: SchemaRelationship[];
  
  // Schema Evolution
  evolution: SchemaEvolution[];
  
  // Validation Rules
  validationRules: SchemaValidationRule[];
  
  // Compliance
  compliance: SchemaCompliance;
  
  // Governance
  governance: SchemaGovernance;
}

export interface MetadataSchema {
  id: string;
  name: string;
  version: string;
  description?: string;
  
  // Schema Definition
  definition: SchemaDefinition;
  
  // Fields
  fields: MetadataField[];
  
  // Constraints
  constraints: MetadataConstraint[];
  
  // Validation Rules
  validationRules: FieldValidationRule[];
  
  // Business Rules
  businessRules: MetadataBusinessRule[];
  
  // Inheritance
  parentSchema?: string;
  childSchemas: string[];
  
  // Lifecycle
  status: SchemaStatus;
  lifecycle: SchemaLifecycle;
  
  // Governance
  owner: string;
  stewards: string[];
  approvalStatus: ApprovalStatus;
  
  // Usage
  usage: SchemaUsage;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

export interface MetadataField {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  
  // Field Definition
  dataType: MetadataFieldType;
  required: boolean;
  defaultValue?: any;
  
  // Validation
  validation: FieldValidation;
  
  // Enumeration
  enumeration?: FieldEnumeration;
  
  // Relationships
  relationships: FieldRelationship[];
  
  // Business Context
  businessContext: FieldBusinessContext;
  
  // Classification
  classification: FieldClassification;
  
  // Lineage
  lineage: FieldLineage;
  
  // Governance
  governance: FieldGovernance;
}

export interface MetadataStore {
  id: string;
  name: string;
  
  // Store Configuration
  config: MetadataStoreConfig;
  
  // Storage Backend
  backend: StorageBackend;
  
  // Indexing
  indexing: MetadataIndexing;
  
  // Search
  search: MetadataSearch;
  
  // Caching
  caching: MetadataCaching;
  
  // Backup & Recovery
  backup: MetadataBackup;
  
  // Performance
  performance: StorePerformance;
  
  // Security
  security: StoreSecurity;
}

export interface MetadataEnrichmentEngine {
  id: string;
  name: string;
  
  // Enrichment Configuration
  config: EnrichmentConfig;
  
  // Enrichment Sources
  sources: EnrichmentSource[];
  
  // Enrichment Rules
  rules: EnrichmentRule[];
  
  // AI/ML Models
  models: EnrichmentModel[];
  
  // Processing Pipeline
  pipeline: EnrichmentPipeline;
  
  // Quality Control
  qualityControl: EnrichmentQualityControl;
  
  // Performance
  performance: EnrichmentPerformance;
  
  // Analytics
  analytics: EnrichmentAnalytics;
}

// ============================================================================
// GOVERNANCE TYPES
// ============================================================================

export interface CatalogGovernance {
  id: string;
  name: string;
  
  // Governance Framework
  framework: GovernanceFramework;
  
  // Policies
  policies: GovernancePolicy[];
  
  // Standards
  standards: GovernanceStandard[];
  
  // Procedures
  procedures: GovernanceProcedure[];
  
  // Roles & Responsibilities
  roles: GovernanceRole[];
  responsibilities: GovernanceResponsibility[];
  
  // Compliance
  compliance: GovernanceCompliance;
  
  // Monitoring
  monitoring: GovernanceMonitoring;
  
  // Reporting
  reporting: GovernanceReporting;
  
  // Metrics
  metrics: GovernanceMetric[];
}

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  
  // Policy Definition
  definition: PolicyDefinition;
  
  // Scope
  scope: PolicyScope;
  
  // Rules
  rules: PolicyRule[];
  
  // Enforcement
  enforcement: PolicyEnforcement;
  
  // Compliance
  compliance: PolicyCompliance;
  
  // Exceptions
  exceptions: PolicyException[];
  
  // Lifecycle
  status: PolicyStatus;
  version: string;
  lifecycle: PolicyLifecycle;
  
  // Governance
  owner: string;
  approvers: string[];
  
  // Implementation
  implementation: PolicyImplementation;
  
  // Monitoring
  monitoring: PolicyMonitoring;
  
  // Timestamps
  createdAt: Date;
  effectiveFrom: Date;
  expiresAt?: Date;
}

export interface GovernanceStandard {
  id: string;
  name: string;
  description: string;
  
  // Standard Definition
  definition: StandardDefinition;
  
  // Categories
  category: StandardCategory;
  subCategory?: string;
  
  // Requirements
  requirements: StandardRequirement[];
  
  // Compliance Criteria
  complianceCriteria: ComplianceCriteria[];
  
  // Assessment
  assessment: StandardAssessment;
  
  // Implementation
  implementation: StandardImplementation;
  
  // Monitoring
  monitoring: StandardMonitoring;
  
  // Certification
  certification: StandardCertification;
  
  // Status
  status: StandardStatus;
  
  // Governance
  owner: string;
  stewards: string[];
}

export interface AccessControlMatrix {
  id: string;
  name: string;
  
  // Matrix Configuration
  config: AccessControlConfig;
  
  // Subjects
  subjects: AccessSubject[];
  
  // Objects
  objects: AccessObject[];
  
  // Permissions
  permissions: AccessPermission[];
  
  // Rules
  rules: AccessRule[];
  
  // Policies
  policies: AccessPolicy[];
  
  // Context
  context: AccessContext;
  
  // Evaluation
  evaluation: AccessEvaluation;
  
  // Audit
  audit: AccessAudit;
}

export interface DataClassificationSystem {
  id: string;
  name: string;
  
  // Classification Framework
  framework: ClassificationFramework;
  
  // Classification Schemes
  schemes: ClassificationScheme[];
  
  // Classification Rules
  rules: ClassificationRule[];
  
  // Automated Classification
  automation: AutomatedClassification;
  
  // Manual Classification
  manual: ManualClassification;
  
  // Validation
  validation: ClassificationValidation;
  
  // Governance
  governance: ClassificationGovernance;
  
  // Analytics
  analytics: ClassificationAnalytics;
}

export interface DataPrivacyManager {
  id: string;
  name: string;
  
  // Privacy Configuration
  config: PrivacyConfig;
  
  // Privacy Policies
  policies: PrivacyPolicy[];
  
  // PII Detection
  piiDetection: PIIDetection;
  
  // Data Masking
  dataMasking: DataMasking;
  
  // Consent Management
  consentManagement: ConsentManagement;
  
  // Rights Management
  rightsManagement: RightsManagement;
  
  // Compliance
  compliance: PrivacyCompliance;
  
  // Monitoring
  monitoring: PrivacyMonitoring;
}

// ============================================================================
// AUDIT & COMPLIANCE TYPES
// ============================================================================

export interface AuditTrailManager {
  id: string;
  name: string;
  
  // Audit Configuration
  config: AuditConfig;
  
  // Audit Events
  events: AuditEvent[];
  
  // Audit Trails
  trails: AuditTrail[];
  
  // Retention Policies
  retentionPolicies: AuditRetentionPolicy[];
  
  // Search & Query
  search: AuditSearch;
  
  // Reporting
  reporting: AuditReporting;
  
  // Compliance
  compliance: AuditCompliance;
  
  // Security
  security: AuditSecurity;
}

export interface AuditEvent {
  id: string;
  
  // Event Information
  eventType: AuditEventType;
  eventCategory: AuditEventCategory;
  
  // Actor Information
  actorId: string;
  actorType: ActorType;
  actorDetails: ActorDetails;
  
  // Target Information
  targetId: string;
  targetType: TargetType;
  targetDetails: TargetDetails;
  
  // Action Information
  action: AuditAction;
  actionDetails: ActionDetails;
  
  // Context
  context: AuditContext;
  
  // Results
  result: AuditResult;
  
  // Risk Assessment
  riskLevel: RiskLevel;
  
  // Compliance
  complianceImpact: ComplianceImpact;
  
  // Timestamps
  timestamp: Date;
  duration?: number;
}

export interface ComplianceManager {
  id: string;
  name: string;
  
  // Compliance Framework
  framework: ComplianceFramework;
  
  // Regulations
  regulations: Regulation[];
  
  // Compliance Requirements
  requirements: ComplianceRequirement[];
  
  // Controls
  controls: ComplianceControl[];
  
  // Assessments
  assessments: ComplianceAssessment[];
  
  // Monitoring
  monitoring: ComplianceMonitoring;
  
  // Reporting
  reporting: ComplianceReporting;
  
  // Remediation
  remediation: ComplianceRemediation;
}

export interface Regulation {
  id: string;
  name: string;
  description: string;
  
  // Regulation Details
  jurisdiction: string;
  authority: string;
  effectiveDate: Date;
  
  // Requirements
  requirements: RegulatoryRequirement[];
  
  // Compliance Mapping
  mapping: ComplianceMapping;
  
  // Implementation
  implementation: RegulationImplementation;
  
  // Monitoring
  monitoring: RegulationMonitoring;
  
  // Status
  status: RegulationStatus;
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum MetadataFieldType {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  JSON = 'JSON',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  REFERENCE = 'REFERENCE',
  ENUM = 'ENUM'
}

export enum SchemaStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  RETIRED = 'RETIRED'
}

export enum PolicyStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  RETIRED = 'RETIRED'
}

export enum StandardCategory {
  DATA_QUALITY = 'DATA_QUALITY',
  DATA_SECURITY = 'DATA_SECURITY',
  DATA_PRIVACY = 'DATA_PRIVACY',
  DATA_GOVERNANCE = 'DATA_GOVERNANCE',
  METADATA = 'METADATA',
  LINEAGE = 'LINEAGE',
  CLASSIFICATION = 'CLASSIFICATION',
  COMPLIANCE = 'COMPLIANCE'
}

export enum StandardStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  RETIRED = 'RETIRED'
}

export enum AuditEventType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACCESS = 'ACCESS',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  EXPORT = 'EXPORT',
  SHARE = 'SHARE',
  CLASSIFY = 'CLASSIFY'
}

export enum AuditEventCategory {
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  DATA = 'DATA',
  SECURITY = 'SECURITY',
  COMPLIANCE = 'COMPLIANCE',
  GOVERNANCE = 'GOVERNANCE',
  ADMINISTRATIVE = 'ADMINISTRATIVE'
}

export enum ActorType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  SERVICE = 'SERVICE',
  APPLICATION = 'APPLICATION',
  API = 'API',
  PROCESS = 'PROCESS'
}

export enum TargetType {
  ASSET = 'ASSET',
  SCHEMA = 'SCHEMA',
  FIELD = 'FIELD',
  POLICY = 'POLICY',
  RULE = 'RULE',
  USER = 'USER',
  ROLE = 'ROLE',
  PERMISSION = 'PERMISSION'
}

export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RegulationStatus {
  PROPOSED = 'PROPOSED',
  ENACTED = 'ENACTED',
  EFFECTIVE = 'EFFECTIVE',
  AMENDED = 'AMENDED',
  SUPERSEDED = 'SUPERSEDED',
  REPEALED = 'REPEALED'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION',
  CANCELLED = 'CANCELLED'
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface MetadataConstraint {
  id: string;
  name: string;
  type: ConstraintType;
  definition: ConstraintDefinition;
  validation: ConstraintValidation;
  enforcement: ConstraintEnforcement;
}

export interface SchemaValidationRule {
  id: string;
  name: string;
  type: ValidationRuleType;
  condition: ValidationCondition;
  action: ValidationAction;
  severity: ValidationSeverity;
}

export interface FieldValidation {
  required: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  customValidators: CustomValidator[];
}

export interface EnrichmentSource {
  id: string;
  name: string;
  type: EnrichmentSourceType;
  config: SourceConfig;
  priority: number;
  reliability: number;
}

export interface GovernanceRole {
  id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  responsibilities: RoleResponsibility[];
  requirements: RoleRequirement[];
}

export interface PolicyRule {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  priority: number;
  enabled: boolean;
}

export interface AccessSubject {
  id: string;
  type: SubjectType;
  identifier: string;
  attributes: SubjectAttribute[];
  roles: string[];
  groups: string[];
}

export interface AccessObject {
  id: string;
  type: ObjectType;
  identifier: string;
  attributes: ObjectAttribute[];
  classification: ObjectClassification;
  sensitivity: SensitivityLevel;
}

export interface AccessPermission {
  id: string;
  name: string;
  description: string;
  operations: Operation[];
  constraints: PermissionConstraint[];
}

export interface ComplianceRequirement {
  id: string;
  regulationId: string;
  name: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  controls: string[];
  evidence: RequirementEvidence[];
  status: RequirementStatus;
}

export interface AuditContext {
  sessionId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: GeographicLocation;
  businessContext?: BusinessContext;
  technicalContext?: TechnicalContext;
}

export interface AuditResult {
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  details?: Record<string, any>;
  changes?: ChangeRecord[];
}

export enum ConstraintType {
  NOT_NULL = 'NOT_NULL',
  UNIQUE = 'UNIQUE',
  PRIMARY_KEY = 'PRIMARY_KEY',
  FOREIGN_KEY = 'FOREIGN_KEY',
  CHECK = 'CHECK',
  DEFAULT = 'DEFAULT',
  RANGE = 'RANGE',
  PATTERN = 'PATTERN'
}

export enum ValidationRuleType {
  FIELD_VALIDATION = 'FIELD_VALIDATION',
  CROSS_FIELD_VALIDATION = 'CROSS_FIELD_VALIDATION',
  BUSINESS_RULE = 'BUSINESS_RULE',
  COMPLIANCE_RULE = 'COMPLIANCE_RULE',
  QUALITY_RULE = 'QUALITY_RULE'
}

export enum ValidationSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum EnrichmentSourceType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  AI_MODEL = 'AI_MODEL',
  MANUAL = 'MANUAL',
  CROWDSOURCED = 'CROWDSOURCED'
}

export enum SubjectType {
  USER = 'USER',
  ROLE = 'ROLE',
  GROUP = 'GROUP',
  SERVICE = 'SERVICE',
  APPLICATION = 'APPLICATION'
}

export enum ObjectType {
  ASSET = 'ASSET',
  FIELD = 'FIELD',
  SCHEMA = 'SCHEMA',
  CATALOG = 'CATALOG',
  WORKSPACE = 'WORKSPACE',
  REPORT = 'REPORT'
}

export enum RequirementType {
  FUNCTIONAL = 'FUNCTIONAL',
  NON_FUNCTIONAL = 'NON_FUNCTIONAL',
  SECURITY = 'SECURITY',
  PRIVACY = 'PRIVACY',
  AUDIT = 'AUDIT',
  REPORTING = 'REPORTING'
}

export enum RequirementPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RequirementStatus {
  IDENTIFIED = 'IDENTIFIED',
  ANALYZED = 'ANALYZED',
  IMPLEMENTED = 'IMPLEMENTED',
  TESTED = 'TESTED',
  VERIFIED = 'VERIFIED',
  NON_COMPLIANT = 'NON_COMPLIANT'
}

export enum SensitivityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  TOP_SECRET = 'TOP_SECRET'
}

// ============================================================================
// COMPLEX SUPPORTING TYPES
// ============================================================================

export interface GeographicLocation {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface BusinessContext {
  department?: string;
  businessUnit?: string;
  project?: string;
  initiative?: string;
  process?: string;
}

export interface TechnicalContext {
  system?: string;
  application?: string;
  service?: string;
  environment?: string;
  version?: string;
}

export interface ChangeRecord {
  field: string;
  oldValue?: any;
  newValue?: any;
  changeType: ChangeType;
  timestamp: Date;
}

export enum ChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MOVE = 'MOVE',
  RENAME = 'RENAME'
}