// ============================================================================
// ADVANCED CATALOG DISCOVERY TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: intelligent_discovery_service.py, data_profiling_service.py
// ============================================================================

import { 
  IntelligentDataAsset, 
  DataAssetType, 
  SensitivityLevel,
  DataColumn,
  TechnicalMetadata,
  TimePeriod 
} from './catalog-core.types';

// ============================================================================
// INTELLIGENT DISCOVERY TYPES (intelligent_discovery_service.py)
// ============================================================================

export interface DiscoveryConfiguration {
  id: string;
  name: string;
  description?: string;
  
  // Discovery Scope
  sources: DiscoverySource[];
  includeTypes: DataAssetType[];
  excludePatterns: string[];
  
  // AI Configuration
  aiEnabled: boolean;
  classificationEnabled: boolean;
  profilingEnabled: boolean;
  lineageDiscoveryEnabled: boolean;
  
  // Scheduling
  schedule: DiscoverySchedule;
  priority: DiscoveryPriority;
  
  // Quality & Performance
  qualityThreshold: number;
  timeout: number;
  parallelism: number;
  
  // Notifications
  notificationConfig: DiscoveryNotificationConfig;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastRun?: Date;
}

export interface DiscoverySource {
  id: string;
  name: string;
  type: DiscoverySourceType;
  connectionString: string;
  
  // Authentication
  credentials: DiscoveryCredentials;
  
  // Configuration
  config: SourceConfig;
  filters: SourceFilter[];
  
  // Status
  status: SourceStatus;
  lastScan: Date;
  
  // Performance
  scanDuration: number;
  assetsDiscovered: number;
  errorCount: number;
}

export interface DiscoveryJob {
  id: string;
  configurationId: string;
  status: DiscoveryJobStatus;
  
  // Execution Details
  startTime: Date;
  endTime?: Date;
  duration?: number;
  
  // Progress
  progress: DiscoveryProgress;
  currentPhase: DiscoveryPhase;
  
  // Results
  results: DiscoveryJobResult;
  
  // Performance
  performance: DiscoveryPerformance;
  
  // Errors & Warnings
  errors: DiscoveryError[];
  warnings: DiscoveryWarning[];
  
  // Logs
  logs: DiscoveryLog[];
}

export interface DiscoveryJobResult {
  totalAssetsFound: number;
  newAssetsDiscovered: number;
  existingAssetsUpdated: number;
  assetsClassified: number;
  assetsProfiled: number;
  
  // Asset Breakdown
  assetsByType: AssetTypeCount[];
  assetsBySensitivity: SensitivityCount[];
  
  // Quality Metrics
  qualityIssuesFound: number;
  averageQualityScore: number;
  
  // Lineage Discovery
  lineageRelationsFound: number;
  newLineageConnections: number;
  
  // Schema Analysis
  schemasAnalyzed: number;
  schemaChangesDetected: number;
  
  // Assets Details
  discoveredAssets: DiscoveredAsset[];
  updatedAssets: UpdatedAsset[];
}

export interface DiscoveredAsset {
  asset: IntelligentDataAsset;
  discoveryMethod: DiscoveryMethod;
  confidence: number;
  
  // Classification Results
  autoClassifications: AutoClassificationResult[];
  sensitivityClassification: SensitivityClassificationResult;
  
  // Profiling Results
  profilingResult?: DataProfilingResult;
  
  // Schema Analysis
  schemaAnalysis: SchemaAnalysisResult;
  
  // Quality Assessment
  qualityAssessment: DiscoveryQualityAssessment;
  
  // Lineage Discovery
  discoveredLineage: DiscoveredLineage[];
  
  // AI Insights
  aiInsights: DiscoveryAIInsight[];
  
  // Metadata Enrichment
  enrichedMetadata: EnrichedMetadata;
}

export interface AutoClassificationResult {
  classificationType: string;
  confidence: number;
  method: ClassificationMethod;
  
  // Rule-Based Classification
  ruleMatches?: RuleMatch[];
  
  // ML-Based Classification
  mlPrediction?: MLPrediction;
  
  // Pattern-Based Classification
  patternMatches?: PatternMatch[];
  
  // Evidence
  evidence: ClassificationEvidence[];
  
  // Validation
  validated: boolean;
  validationMethod?: ValidationMethod;
}

export interface SensitivityClassificationResult {
  sensitivityLevel: SensitivityLevel;
  confidence: number;
  reasons: SensitivityReason[];
  
  // PII Detection
  piiElements: PIIElement[];
  
  // Regulatory Classification
  regulatoryClassifications: RegulatoryClassification[];
  
  // Risk Assessment
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  
  // Recommendations
  recommendations: SensitivityRecommendation[];
}

// ============================================================================
// DATA PROFILING TYPES (data_profiling_service.py)
// ============================================================================

export interface DataProfilingResult {
  id: string;
  assetId: string;
  profiledAt: Date;
  
  // Overall Statistics
  rowCount: number;
  columnCount: number;
  sizeInBytes: number;
  
  // Column Profiles
  columnProfiles: ColumnProfile[];
  
  // Quality Metrics
  qualityMetrics: ProfilingQualityMetrics;
  
  // Data Patterns
  dataPatterns: DataPattern[];
  
  // Anomalies
  anomalies: DataAnomaly[];
  
  // Relationships
  relationships: DataRelationship[];
  
  // Statistical Summary
  statisticalSummary: StatisticalSummary;
  
  // Performance
  profilingDuration: number;
  samplingStrategy: SamplingStrategy;
}

export interface ColumnProfile {
  columnName: string;
  dataType: string;
  
  // Basic Statistics
  nullCount: number;
  nullPercentage: number;
  distinctCount: number;
  uniqueness: number;
  
  // String Statistics
  minLength?: number;
  maxLength?: number;
  averageLength?: number;
  
  // Numeric Statistics
  minValue?: number;
  maxValue?: number;
  averageValue?: number;
  medianValue?: number;
  standardDeviation?: number;
  
  // Distribution
  distribution: ValueDistribution;
  histogram: HistogramBin[];
  
  // Patterns
  patterns: ColumnPattern[];
  
  // Quality Issues
  qualityIssues: ColumnQualityIssue[];
  
  // Sample Values
  sampleValues: any[];
  topValues: ValueFrequency[];
}

export interface ProfilingQualityMetrics {
  overallScore: number;
  
  // Completeness
  completenessScore: number;
  missingDataPercentage: number;
  
  // Validity
  validityScore: number;
  invalidRecords: number;
  
  // Consistency
  consistencyScore: number;
  inconsistentFormats: number;
  
  // Uniqueness
  uniquenessScore: number;
  duplicateRecords: number;
  
  // Accuracy
  accuracyScore: number;
  suspiciousValues: number;
}

export interface SchemaAnalysisResult {
  id: string;
  assetId: string;
  analyzedAt: Date;
  
  // Schema Structure
  schemaStructure: SchemaStructure;
  
  // Evolution Analysis
  schemaEvolution: SchemaEvolution[];
  compatibilityStatus: CompatibilityStatus;
  
  // Relationships
  foreignKeyRelationships: ForeignKeyRelationship[];
  
  // Constraints
  constraints: SchemaConstraint[];
  constraintViolations: ConstraintViolation[];
  
  // Recommendations
  schemaRecommendations: SchemaRecommendation[];
  
  // Quality Assessment
  schemaQuality: SchemaQuality;
}

export interface DiscoveryQualityAssessment {
  overallScore: number;
  
  // Discovery Quality
  discoveryAccuracy: number;
  discoveryCompleteness: number;
  
  // Classification Quality
  classificationAccuracy: number;
  classificationCoverage: number;
  
  // Profiling Quality
  profilingCompleteness: number;
  profilingAccuracy: number;
  
  // Lineage Quality
  lineageAccuracy: number;
  lineageCoverage: number;
  
  // Issues
  qualityIssues: DiscoveryQualityIssue[];
  
  // Recommendations
  improvementRecommendations: QualityImprovement[];
}

export interface DiscoveredLineage {
  sourceAssetId: string;
  targetAssetId: string;
  lineageType: string;
  confidence: number;
  
  // Discovery Method
  discoveryMethod: LineageDiscoveryMethod;
  
  // Evidence
  evidence: LineageEvidence[];
  
  // Transformation Details
  transformation?: LineageTransformation;
  
  // Validation
  validated: boolean;
  validationScore: number;
}

export interface DiscoveryAIInsight {
  id: string;
  type: AIInsightType;
  title: string;
  description: string;
  confidence: number;
  
  // Impact & Priority
  impact: InsightImpact;
  priority: InsightPriority;
  
  // Data
  data: AIInsightData;
  
  // Recommendations
  recommendations: AIRecommendation[];
  
  // Actions
  suggestedActions: DiscoveryAction[];
  
  // Context
  context: DiscoveryContext;
}

export interface EnrichedMetadata {
  businessTerms: EnrichedBusinessTerm[];
  technicalTags: EnrichedTag[];
  descriptions: EnrichedDescription[];
  
  // External Enrichment
  externalSources: ExternalMetadataSource[];
  
  // AI Enrichment
  aiGeneratedMetadata: AIGeneratedMetadata[];
  
  // User Contributions
  userContributions: UserMetadataContribution[];
  
  // Quality Score
  enrichmentQuality: number;
  completenessScore: number;
}

// ============================================================================
// INCREMENTAL DISCOVERY TYPES
// ============================================================================

export interface IncrementalDiscoveryConfig {
  id: string;
  baselineVersion: string;
  
  // Change Detection
  changeDetectionStrategy: ChangeDetectionStrategy;
  changeThreshold: number;
  
  // Optimization
  optimizationLevel: OptimizationLevel;
  
  // Scheduling
  incrementalSchedule: IncrementalSchedule;
  
  // Performance
  maxChangesToProcess: number;
  batchSize: number;
}

export interface DiscoveryDelta {
  id: string;
  fromVersion: string;
  toVersion: string;
  
  // Changes
  addedAssets: string[];
  modifiedAssets: AssetModification[];
  removedAssets: string[];
  
  // Schema Changes
  schemaChanges: SchemaChange[];
  
  // Lineage Changes
  lineageChanges: LineageChange[];
  
  // Impact Analysis
  impactAnalysis: DiscoveryImpactAnalysis;
  
  // Timestamps
  detectedAt: Date;
  processedAt?: Date;
}

// ============================================================================
// SCHEMA EVOLUTION & COMPATIBILITY
// ============================================================================

export interface SchemaEvolution {
  id: string;
  version: string;
  previousVersion?: string;
  
  // Changes
  changes: SchemaChange[];
  changeType: SchemaChangeType;
  
  // Compatibility
  compatibilityLevel: CompatibilityLevel;
  breakingChanges: BreakingChange[];
  
  // Impact
  impactedAssets: string[];
  riskLevel: RiskLevel;
  
  // Migration
  migrationRequired: boolean;
  migrationStrategy?: MigrationStrategy;
  
  // Timestamps
  evolutionDate: Date;
  detectedAt: Date;
}

export interface SchemaChange {
  changeType: SchemaChangeType;
  elementType: SchemaElementType;
  elementName: string;
  
  // Change Details
  oldValue?: any;
  newValue?: any;
  
  // Impact
  impactLevel: ImpactLevel;
  affectedComponents: string[];
  
  // Compatibility
  compatibilityImpact: CompatibilityImpact;
  
  // Recommendations
  recommendations: ChangeRecommendation[];
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum DiscoverySourceType {
  DATABASE = 'DATABASE',
  FILE_SYSTEM = 'FILE_SYSTEM',
  CLOUD_STORAGE = 'CLOUD_STORAGE',
  API = 'API',
  STREAMING = 'STREAMING',
  DATA_WAREHOUSE = 'DATA_WAREHOUSE',
  DATA_LAKE = 'DATA_LAKE',
  NOSQL = 'NOSQL'
}

export enum DiscoveryJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED'
}

export enum DiscoveryPhase {
  INITIALIZATION = 'INITIALIZATION',
  SCHEMA_DISCOVERY = 'SCHEMA_DISCOVERY',
  DATA_PROFILING = 'DATA_PROFILING',
  CLASSIFICATION = 'CLASSIFICATION',
  LINEAGE_DISCOVERY = 'LINEAGE_DISCOVERY',
  QUALITY_ASSESSMENT = 'QUALITY_ASSESSMENT',
  METADATA_ENRICHMENT = 'METADATA_ENRICHMENT',
  FINALIZATION = 'FINALIZATION'
}

export enum DiscoveryMethod {
  SCHEMA_ANALYSIS = 'SCHEMA_ANALYSIS',
  DATA_SAMPLING = 'DATA_SAMPLING',
  PATTERN_MATCHING = 'PATTERN_MATCHING',
  ML_CLASSIFICATION = 'ML_CLASSIFICATION',
  RULE_BASED = 'RULE_BASED',
  METADATA_INSPECTION = 'METADATA_INSPECTION',
  LINEAGE_TRACING = 'LINEAGE_TRACING'
}

export enum ClassificationMethod {
  RULE_BASED = 'RULE_BASED',
  PATTERN_MATCHING = 'PATTERN_MATCHING',
  MACHINE_LEARNING = 'MACHINE_LEARNING',
  STATISTICAL_ANALYSIS = 'STATISTICAL_ANALYSIS',
  SEMANTIC_ANALYSIS = 'SEMANTIC_ANALYSIS',
  HYBRID = 'HYBRID'
}

export enum ChangeDetectionStrategy {
  TIMESTAMP_BASED = 'TIMESTAMP_BASED',
  CHECKSUM_BASED = 'CHECKSUM_BASED',
  LOG_BASED = 'LOG_BASED',
  HYBRID = 'HYBRID'
}

export enum SchemaChangeType {
  COLUMN_ADDED = 'COLUMN_ADDED',
  COLUMN_REMOVED = 'COLUMN_REMOVED',
  COLUMN_RENAMED = 'COLUMN_RENAMED',
  COLUMN_TYPE_CHANGED = 'COLUMN_TYPE_CHANGED',
  COLUMN_CONSTRAINT_CHANGED = 'COLUMN_CONSTRAINT_CHANGED',
  TABLE_ADDED = 'TABLE_ADDED',
  TABLE_REMOVED = 'TABLE_REMOVED',
  TABLE_RENAMED = 'TABLE_RENAMED',
  INDEX_ADDED = 'INDEX_ADDED',
  INDEX_REMOVED = 'INDEX_REMOVED'
}

export enum CompatibilityLevel {
  FULLY_COMPATIBLE = 'FULLY_COMPATIBLE',
  BACKWARD_COMPATIBLE = 'BACKWARD_COMPATIBLE',
  FORWARD_COMPATIBLE = 'FORWARD_COMPATIBLE',
  BREAKING_CHANGE = 'BREAKING_CHANGE'
}

export enum AIInsightType {
  ANOMALY_DETECTION = 'ANOMALY_DETECTION',
  PATTERN_RECOGNITION = 'PATTERN_RECOGNITION',
  QUALITY_ASSESSMENT = 'QUALITY_ASSESSMENT',
  OPTIMIZATION_OPPORTUNITY = 'OPTIMIZATION_OPPORTUNITY',
  COMPLIANCE_RISK = 'COMPLIANCE_RISK',
  USAGE_RECOMMENDATION = 'USAGE_RECOMMENDATION'
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface DiscoveryProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  percentage: number;
  
  // Phase Progress
  phaseProgress: PhaseProgress[];
  
  // Estimates
  estimatedTimeRemaining: number;
  estimatedCompletion: Date;
}

export interface DiscoveryPerformance {
  throughput: number;
  averageProcessingTime: number;
  memoryUsage: number;
  cpuUsage: number;
  
  // Bottlenecks
  bottlenecks: PerformanceBottleneck[];
  
  // Optimization Suggestions
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface DataPattern {
  patternType: string;
  pattern: string;
  frequency: number;
  examples: string[];
  confidence: number;
}

export interface DataAnomaly {
  anomalyType: string;
  description: string;
  severity: string;
  affectedRows: number;
  examples: any[];
  recommendations: string[];
}

export interface ValueDistribution {
  distributionType: string;
  parameters: Record<string, number>;
  goodnesOfFit: number;
  outliers: OutlierInfo[];
}

export interface HistogramBin {
  lowerBound: number;
  upperBound: number;
  count: number;
  percentage: number;
}

export interface ValueFrequency {
  value: any;
  count: number;
  percentage: number;
}

export interface DiscoveryCredentials {
  type: CredentialType;
  username?: string;
  password?: string;
  token?: string;
  keyFile?: string;
  connectionProperties?: Record<string, string>;
}

export interface SourceConfig {
  includePatterns: string[];
  excludePatterns: string[];
  maxDepth: number;
  samplingRate: number;
  customProperties: Record<string, any>;
}

export enum CredentialType {
  USERNAME_PASSWORD = 'USERNAME_PASSWORD',
  TOKEN = 'TOKEN',
  KEY_FILE = 'KEY_FILE',
  IAM_ROLE = 'IAM_ROLE',
  SERVICE_PRINCIPAL = 'SERVICE_PRINCIPAL'
}

export enum DiscoveryPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum SourceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  SCANNING = 'SCANNING'
}