// ============================================================================
// ADVANCED CATALOG CORE TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: advanced_catalog_models.py, catalog_intelligence_models.py,
//          catalog_quality_models.py, data_lineage_models.py, catalog_models.py
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// CORE INTELLIGENT DATA ASSET TYPES (advanced_catalog_models.py)
// ============================================================================

export interface IntelligentDataAsset {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  qualifiedName: string;
  assetType: DataAssetType;
  status: AssetStatus;
  
  // Schema Information
  schema: DataAssetSchema;
  columns: DataColumn[];
  
  // Quality & Classification
  qualityScore: number;
  qualityAssessment: DataQualityAssessment;
  classifications: DataClassification[];
  sensitivityLevel: SensitivityLevel;
  
  // Business Context
  businessTerms: BusinessGlossaryTerm[];
  owner: AssetOwner;
  stewards: AssetSteward[];
  
  // Technical Metadata
  technicalMetadata: TechnicalMetadata;
  dataSource: DataSourceInfo;
  
  // Usage & Analytics
  usageMetrics: AssetUsageMetrics;
  popularityScore: number;
  lastAccessed: Date;
  accessFrequency: AccessFrequency;
  
  // AI Features
  semanticEmbedding?: SemanticEmbedding;
  recommendations: AssetRecommendation[];
  insights: IntelligenceInsight[];
  
  // Lineage
  upstreamAssets: LineageConnection[];
  downstreamAssets: LineageConnection[];
  lineageLevel: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  discoveredAt: Date;
  lastModified: Date;
}

export interface DataAssetSchema {
  id: string;
  name: string;
  version: string;
  format: SchemaFormat;
  columns: DataColumn[];
  constraints: SchemaConstraint[];
  evolution: SchemaEvolution[];
  metadata: Record<string, any>;
}

export interface DataColumn {
  id: string;
  name: string;
  displayName?: string;
  dataType: DataType;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: ForeignKeyInfo;
  
  // Quality Information
  qualityRules: DataQualityRule[];
  qualityScore: number;
  nullPercentage: number;
  uniqueness: number;
  
  // Statistical Profile
  profile: ColumnProfile;
  distribution: DataDistribution;
  
  // Classification
  classifications: DataClassification[];
  sensitivityLevel: SensitivityLevel;
  piiType?: PIIType;
  
  // Business Context
  businessTerms: BusinessGlossaryTerm[];
  description?: string;
  businessRules: string[];
  
  // Lineage
  sourceColumns: ColumnLineage[];
  derivedColumns: ColumnLineage[];
  transformations: ColumnTransformation[];
}

// ============================================================================
// ENTERPRISE DATA LINEAGE TYPES (data_lineage_models.py)
// ============================================================================

export interface EnterpriseDataLineage {
  id: string;
  sourceAsset: IntelligentDataAsset;
  targetAsset: IntelligentDataAsset;
  lineageType: LineageType;
  direction: LineageDirection;
  
  // Column-Level Lineage
  columnMappings: ColumnLineageMapping[];
  transformations: DataTransformation[];
  
  // Lineage Graph
  nodes: DataLineageNode[];
  edges: DataLineageEdge[];
  paths: LineagePath[];
  
  // Impact Analysis
  impactAnalysis: LineageImpactAnalysis;
  dependencies: LineageDependency[];
  
  // Visualization
  visualizationConfig: LineageVisualizationConfig;
  layout: LineageLayout;
  
  // Metrics
  metrics: LineageMetrics;
  confidence: number;
  
  // Timestamps
  createdAt: Date;
  lastUpdated: Date;
  validFrom: Date;
  validTo?: Date;
}

export interface DataLineageNode {
  id: string;
  assetId: string;
  nodeType: LineageNodeType;
  position: NodePosition;
  metadata: NodeMetadata;
  properties: Record<string, any>;
}

export interface DataLineageEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: LineageEdgeType;
  transformationType: TransformationType;
  properties: Record<string, any>;
}

export interface LineageImpactAnalysis {
  id: string;
  changeOrigin: string;
  impactedAssets: ImpactedAsset[];
  riskLevel: RiskLevel;
  impactScope: ImpactScope;
  recommendations: ImpactRecommendation[];
  analysisMetrics: ImpactMetrics;
}

// ============================================================================
// DATA QUALITY ASSESSMENT TYPES (catalog_quality_models.py)
// ============================================================================

export interface DataQualityAssessment {
  id: string;
  assetId: string;
  assessmentType: QualityAssessmentType;
  overallScore: number;
  
  // Quality Dimensions
  completeness: QualityDimension;
  accuracy: QualityDimension;
  consistency: QualityDimension;
  validity: QualityDimension;
  uniqueness: QualityDimension;
  timeliness: QualityDimension;
  
  // Quality Rules
  rules: DataQualityRule[];
  ruleResults: QualityRuleResult[];
  
  // Quality Score Card
  scorecard: QualityScorecard;
  trends: QualityTrend[];
  
  // Monitoring
  monitoringConfig: QualityMonitoringConfig;
  alerts: QualityMonitoringAlert[];
  
  // Reports
  reports: QualityReport[];
  
  // AI Insights
  aiInsights: QualityInsight[];
  recommendations: QualityRecommendation[];
  
  // Timestamps
  assessedAt: Date;
  validFrom: Date;
  validTo?: Date;
}

export interface DataQualityRule {
  id: string;
  name: string;
  description: string;
  ruleType: QualityRuleType;
  dimension: QualityDimension;
  
  // Rule Definition
  expression: string;
  threshold: QualityThreshold;
  severity: QualitySeverity;
  
  // Configuration
  enabled: boolean;
  schedule: RuleSchedule;
  scope: RuleScope;
  
  // Results
  lastResult: QualityRuleResult;
  successRate: number;
  
  // Metadata
  owner: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityScorecard {
  id: string;
  assetId: string;
  period: TimePeriod;
  
  // Scores
  overallScore: number;
  dimensionScores: DimensionScore[];
  
  // Trends
  scoreTrend: ScoreTrend;
  improvement: QualityImprovement;
  
  // Benchmarks
  industryBenchmark: number;
  targetScore: number;
  
  // Insights
  keyInsights: QualityInsight[];
  actionItems: QualityActionItem[];
}

// ============================================================================
// BUSINESS GLOSSARY TYPES (advanced_catalog_models.py)
// ============================================================================

export interface BusinessGlossaryTerm {
  id: string;
  name: string;
  displayName: string;
  definition: string;
  longDescription?: string;
  
  // Hierarchy
  parentTerm?: BusinessGlossaryTerm;
  childTerms: BusinessGlossaryTerm[];
  category: GlossaryCategory;
  
  // Relationships
  synonyms: string[];
  antonyms: string[];
  relatedTerms: BusinessGlossaryTerm[];
  
  // Associations
  associations: BusinessGlossaryAssociation[];
  assets: IntelligentDataAsset[];
  
  // Governance
  owner: TermOwner;
  stewards: TermSteward[];
  approvalStatus: ApprovalStatus;
  
  // Usage
  usageCount: number;
  lastUsed: Date;
  
  // Metadata
  domain: BusinessDomain;
  tags: string[];
  attributes: TermAttribute[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

export interface BusinessGlossaryAssociation {
  id: string;
  termId: string;
  assetId: string;
  associationType: AssociationType;
  confidence: number;
  
  // Context
  context: AssociationContext;
  justification: string;
  
  // Validation
  validated: boolean;
  validatedBy?: string;
  validatedAt?: Date;
  
  // AI Generated
  aiGenerated: boolean;
  aiConfidence: number;
}

// ============================================================================
// SEMANTIC INTELLIGENCE TYPES (catalog_intelligence_models.py)
// ============================================================================

export interface SemanticEmbedding {
  id: string;
  assetId: string;
  embeddingType: EmbeddingType;
  vector: number[];
  dimension: number;
  
  // Similarity
  similarAssets: SimilarAsset[];
  similarityThreshold: number;
  
  // Metadata
  model: EmbeddingModel;
  version: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface SemanticRelationship {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  relationshipType: RelationshipType;
  confidence: number;
  
  // Semantic Analysis
  semanticSimilarity: number;
  contextualRelevance: number;
  
  // Evidence
  evidence: RelationshipEvidence[];
  
  // Validation
  validated: boolean;
  validatedBy?: string;
  
  // Timestamps
  discoveredAt: Date;
  lastValidated?: Date;
}

export interface RecommendationEngine {
  id: string;
  userId: string;
  context: RecommendationContext;
  
  // Recommendations
  assetRecommendations: AssetRecommendation[];
  termRecommendations: TermRecommendation[];
  actionRecommendations: ActionRecommendation[];
  
  // Configuration
  preferences: UserPreferences;
  filters: RecommendationFilter[];
  
  // Performance
  metrics: RecommendationMetrics;
  feedback: RecommendationFeedback[];
}

export interface AssetRecommendation {
  id: string;
  recommendedAsset: IntelligentDataAsset;
  recommendationType: RecommendationType;
  score: number;
  confidence: number;
  
  // Context
  reason: RecommendationReason;
  context: RecommendationContext;
  
  // Personalization
  userRelevance: number;
  roleRelevance: number;
  
  // Actions
  suggestedActions: SuggestedAction[];
  
  // Feedback
  feedback?: RecommendationFeedback;
  
  // Timestamps
  generatedAt: Date;
  expiresAt?: Date;
}

// ============================================================================
// USAGE PATTERNS & ANALYTICS TYPES
// ============================================================================

export interface AssetUsageMetrics {
  id: string;
  assetId: string;
  period: TimePeriod;
  
  // Basic Metrics
  totalViews: number;
  uniqueUsers: number;
  downloadCount: number;
  queryCount: number;
  
  // Engagement
  averageSessionDuration: number;
  bounceRate: number;
  returnUsers: number;
  
  // Access Patterns
  accessPatterns: AccessPattern[];
  peakUsageTimes: TimeSlot[];
  userSegments: UserSegment[];
  
  // Geographic Distribution
  geographicDistribution: GeographicUsage[];
  
  // Trends
  usageTrend: UsageTrend;
  seasonality: SeasonalityPattern[];
  
  // Collaboration
  sharingCount: number;
  collaborationMetrics: CollaborationMetrics;
}

export interface AssetUsagePattern {
  id: string;
  patternType: UsagePatternType;
  pattern: PatternData;
  frequency: PatternFrequency;
  
  // Analysis
  insights: PatternInsight[];
  anomalies: PatternAnomaly[];
  
  // Predictions
  predictions: UsagePrediction[];
  trends: PatternTrend[];
}

export interface IntelligenceInsight {
  id: string;
  insightType: InsightType;
  category: InsightCategory;
  title: string;
  description: string;
  
  // Priority & Impact
  priority: InsightPriority;
  impact: InsightImpact;
  confidence: number;
  
  // Data
  data: InsightData;
  metrics: InsightMetrics;
  
  // Actions
  recommendations: InsightRecommendation[];
  suggestedActions: SuggestedAction[];
  
  // Context
  context: InsightContext;
  relatedInsights: string[];
  
  // Timestamps
  generatedAt: Date;
  validFrom: Date;
  validTo?: Date;
}

export interface CollaborationInsight {
  id: string;
  collaborationType: CollaborationType;
  participants: CollaborationParticipant[];
  
  // Metrics
  collaborationLevel: number;
  effectivenessScore: number;
  
  // Analysis
  communicationPatterns: CommunicationPattern[];
  workflowEfficiency: WorkflowEfficiency;
  
  // Recommendations
  improvementSuggestions: ImprovementSuggestion[];
  
  // Timestamps
  periodStart: Date;
  periodEnd: Date;
}

// ============================================================================
// CATALOG ITEMS & MANAGEMENT TYPES (catalog_models.py)
// ============================================================================

export interface CatalogItem {
  id: string;
  name: string;
  type: CatalogItemType;
  status: CatalogItemStatus;
  
  // Metadata
  metadata: CatalogMetadata;
  properties: Record<string, any>;
  
  // Tags & Classification
  tags: CatalogTag[];
  categories: string[];
  
  // Ownership & Governance
  owner: string;
  stewards: string[];
  
  // Usage Tracking
  usageLog: CatalogUsageLog[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface CatalogTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: TagCategory;
  
  // Usage
  usageCount: number;
  assets: string[];
  
  // Governance
  owner: string;
  approved: boolean;
  
  // Timestamps
  createdAt: Date;
  lastUsed: Date;
}

export interface CatalogItemTag {
  id: string;
  catalogItemId: string;
  tagId: string;
  confidence: number;
  source: TagSource;
  
  // AI Generated
  aiGenerated: boolean;
  aiConfidence: number;
  
  // Validation
  validated: boolean;
  validatedBy?: string;
  validatedAt?: Date;
}

export interface DataLineage {
  id: string;
  sourceId: string;
  targetId: string;
  lineageType: string;
  
  // Transformation
  transformation?: string;
  confidence: number;
  
  // Metadata
  metadata: LineageMetadata;
  
  // Timestamps
  createdAt: Date;
  lastValidated: Date;
}

export interface CatalogUsageLog {
  id: string;
  catalogItemId: string;
  userId: string;
  action: CatalogAction;
  
  // Context
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  
  // Details
  details: UsageDetails;
  
  // Timestamps
  timestamp: Date;
  duration?: number;
}

export interface CatalogQualityRule {
  id: string;
  name: string;
  description: string;
  ruleType: string;
  
  // Configuration
  config: QualityRuleConfig;
  enabled: boolean;
  
  // Scope
  scope: QualityRuleScope;
  
  // Results
  lastResult?: QualityRuleResult;
  successRate: number;
  
  // Timestamps
  createdAt: Date;
  lastRun?: Date;
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum DataAssetType {
  TABLE = 'TABLE',
  VIEW = 'VIEW',
  COLUMN = 'COLUMN',
  DATABASE = 'DATABASE',
  SCHEMA = 'SCHEMA',
  FILE = 'FILE',
  API = 'API',
  STREAM = 'STREAM',
  DASHBOARD = 'DASHBOARD',
  REPORT = 'REPORT',
  MODEL = 'MODEL'
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

export enum SchemaFormat {
  PARQUET = 'PARQUET',
  AVRO = 'AVRO',
  JSON = 'JSON',
  CSV = 'CSV',
  ORC = 'ORC',
  DELTA = 'DELTA',
  ICEBERG = 'ICEBERG'
}

export enum DataType {
  STRING = 'STRING',
  INTEGER = 'INTEGER',
  LONG = 'LONG',
  FLOAT = 'FLOAT',
  DOUBLE = 'DOUBLE',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  TIMESTAMP = 'TIMESTAMP',
  DECIMAL = 'DECIMAL',
  ARRAY = 'ARRAY',
  STRUCT = 'STRUCT',
  MAP = 'MAP',
  BINARY = 'BINARY'
}

export enum SensitivityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  TOP_SECRET = 'TOP_SECRET'
}

export enum PIIType {
  NAME = 'NAME',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SSN = 'SSN',
  CREDIT_CARD = 'CREDIT_CARD',
  ADDRESS = 'ADDRESS',
  NONE = 'NONE'
}

export enum LineageType {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
  DERIVED = 'DERIVED',
  AGGREGATED = 'AGGREGATED',
  TRANSFORMED = 'TRANSFORMED'
}

export enum LineageDirection {
  UPSTREAM = 'UPSTREAM',
  DOWNSTREAM = 'DOWNSTREAM',
  BIDIRECTIONAL = 'BIDIRECTIONAL'
}

export enum TransformationType {
  COPY = 'COPY',
  FILTER = 'FILTER',
  AGGREGATE = 'AGGREGATE',
  JOIN = 'JOIN',
  UNION = 'UNION',
  TRANSFORM = 'TRANSFORM',
  CALCULATE = 'CALCULATE',
  CLEANSE = 'CLEANSE'
}

export enum QualityAssessmentType {
  AUTOMATED = 'AUTOMATED',
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  ON_DEMAND = 'ON_DEMAND',
  CONTINUOUS = 'CONTINUOUS'
}

export enum QualityRuleType {
  COMPLETENESS = 'COMPLETENESS',
  ACCURACY = 'ACCURACY',
  CONSISTENCY = 'CONSISTENCY',
  VALIDITY = 'VALIDITY',
  UNIQUENESS = 'UNIQUENESS',
  TIMELINESS = 'TIMELINESS',
  CUSTOM = 'CUSTOM'
}

export enum QualitySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum RecommendationType {
  SIMILAR_ASSETS = 'SIMILAR_ASSETS',
  FREQUENTLY_USED_TOGETHER = 'FREQUENTLY_USED_TOGETHER',
  USER_BASED = 'USER_BASED',
  CONTENT_BASED = 'CONTENT_BASED',
  HYBRID = 'HYBRID',
  TRENDING = 'TRENDING',
  QUALITY_IMPROVEMENT = 'QUALITY_IMPROVEMENT'
}

export enum InsightType {
  USAGE_ANOMALY = 'USAGE_ANOMALY',
  QUALITY_DECLINE = 'QUALITY_DECLINE',
  PERFORMANCE_ISSUE = 'PERFORMANCE_ISSUE',
  OPTIMIZATION_OPPORTUNITY = 'OPTIMIZATION_OPPORTUNITY',
  COMPLIANCE_RISK = 'COMPLIANCE_RISK',
  COST_OPTIMIZATION = 'COST_OPTIMIZATION',
  SECURITY_CONCERN = 'SECURITY_CONCERN'
}

export enum CatalogItemType {
  DATASET = 'DATASET',
  TABLE = 'TABLE',
  VIEW = 'VIEW',
  DASHBOARD = 'DASHBOARD',
  REPORT = 'REPORT',
  MODEL = 'MODEL',
  PIPELINE = 'PIPELINE',
  WORKFLOW = 'WORKFLOW'
}

export enum CatalogAction {
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  QUERY = 'QUERY',
  SHARE = 'SHARE',
  FAVORITE = 'FAVORITE',
  COMMENT = 'COMMENT',
  RATE = 'RATE',
  TAG = 'TAG',
  EDIT = 'EDIT'
}

// ============================================================================
// ADDITIONAL SUPPORTING TYPES
// ============================================================================

export interface TimePeriod {
  start: Date;
  end: Date;
  granularity: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}

export interface NodePosition {
  x: number;
  y: number;
  z?: number;
}

export interface AccessFrequency {
  daily: number;
  weekly: number;
  monthly: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
}

export interface TechnicalMetadata {
  format: string;
  compression?: string;
  partitioning?: PartitionInfo[];
  indexes?: IndexInfo[];
  constraints?: ConstraintInfo[];
  statistics?: StatisticsInfo;
}

export interface DataSourceInfo {
  id: string;
  name: string;
  type: string;
  connectionString?: string;
  location: string;
  lastScan: Date;
}

export interface AssetOwner {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface AssetSteward {
  id: string;
  name: string;
  email: string;
  role: string;
  responsibilities: string[];
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface CatalogApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  metadata?: ResponseMetadata;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ResponseMetadata {
  timestamp: Date;
  version: string;
  requestId: string;
  executionTime: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface CatalogSearchRequest {
  query: string;
  filters: SearchFilter[];
  sort: SortOption[];
  pagination: PaginationRequest;
  includeMetadata: boolean;
  facets: string[];
}

export interface SearchFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  values?: any[];
}

export interface SortOption {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface PaginationRequest {
  page: number;
  pageSize: number;
}

export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  BETWEEN = 'BETWEEN',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL'
}