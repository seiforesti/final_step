// ============================================================================
// ADVANCED CATALOG LINEAGE TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: advanced_lineage_service.py, lineage_service.py, data_lineage_models.py
// ============================================================================

import { 
  EnterpriseDataLineage, 
  DataLineageNode, 
  DataLineageEdge,
  IntelligentDataAsset,
  TimePeriod 
} from './catalog-core.types';

// ============================================================================
// ADVANCED LINEAGE TYPES (advanced_lineage_service.py)
// ============================================================================

export interface LineageVisualization {
  id: string;
  name: string;
  description?: string;
  
  // Visualization Configuration
  config: LineageVisualizationConfig;
  
  // Graph Data
  nodes: LineageVisualizationNode[];
  edges: LineageVisualizationEdge[];
  
  // Layout Configuration
  layout: LineageLayoutConfig;
  
  // Filters & Views
  filters: LineageFilter[];
  views: LineageView[];
  
  // Interactive Features
  interactionConfig: LineageInteractionConfig;
  
  // Performance
  performance: LineageVisualizationPerformance;
  
  // Timestamps
  createdAt: Date;
  lastUpdated: Date;
}

export interface LineageVisualizationNode {
  id: string;
  assetId: string;
  nodeType: LineageNodeType;
  
  // Visual Properties
  position: NodePosition;
  style: NodeStyle;
  
  // Node Data
  data: LineageNodeData;
  
  // Metadata
  metadata: LineageNodeMetadata;
  
  // State
  state: LineageNodeState;
  
  // Interactions
  interactions: NodeInteraction[];
}

export interface LineageVisualizationEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  
  // Edge Properties
  edgeType: LineageEdgeType;
  transformationType: TransformationType;
  
  // Visual Properties
  style: EdgeStyle;
  path?: EdgePath;
  
  // Edge Data
  data: LineageEdgeData;
  
  // Metadata
  metadata: LineageEdgeMetadata;
  
  // State
  state: LineageEdgeState;
  
  // Confidence & Quality
  confidence: number;
  quality: LineageQuality;
}

export interface LineageTraversalEngine {
  id: string;
  name: string;
  
  // Traversal Configuration
  config: TraversalConfig;
  
  // Traversal Algorithms
  algorithms: TraversalAlgorithm[];
  
  // Path Finding
  pathFinder: LineagePathFinder;
  
  // Impact Analysis
  impactAnalyzer: LineageImpactAnalyzer;
  
  // Performance
  performance: TraversalPerformance;
  
  // Cache
  cache: TraversalCache;
}

export interface LineageImpactAnalysis {
  id: string;
  sourceAssetId: string;
  analysisType: ImpactAnalysisType;
  
  // Impact Results
  impactedAssets: ImpactedAsset[];
  impactRadius: number;
  
  // Impact Categories
  directImpacts: DirectImpact[];
  indirectImpacts: IndirectImpact[];
  cascadingImpacts: CascadingImpact[];
  
  // Risk Assessment
  riskAssessment: LineageRiskAssessment;
  
  // Business Impact
  businessImpact: LineageBusinessImpact;
  
  // Technical Impact
  technicalImpact: LineageTechnicalImpact;
  
  // Recommendations
  mitigationRecommendations: MitigationRecommendation[];
  
  // Analysis Metadata
  analysisMetadata: ImpactAnalysisMetadata;
  
  // Timestamps
  analyzedAt: Date;
  validUntil?: Date;
}

// ============================================================================
// MISSING TYPES FOR IMPACT ANALYSIS VIEWER
// ============================================================================

export interface LineageAnalysisResult {
  id: string;
  sourceAssetId: string;
  analysisType: 'IMPACT' | 'DEPENDENCY' | 'COVERAGE' | 'QUALITY';
  
  // Results
  results: LineageImpactAnalysis;
  
  // Metadata
  metadata: {
    executionTime: number;
    confidence: number;
    dataQuality: number;
    lastUpdated: Date;
  };
  
  // Performance
  performance: {
    nodesAnalyzed: number;
    edgesTraversed: number;
    processingTime: number;
  };
}

export interface LineageRiskAssessment {
  id: string;
  sourceAssetId: string;
  
  // Overall Risk
  overallRisk: {
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    factors: RiskFactor[];
  };
  
  // Risk Categories
  riskCategories: RiskCategory[];
  
  // Risk Mitigation
  riskMitigation: RiskMitigation[];
  
  // Contingency Plans
  contingencyPlans: ContingencyPlan[];
  
  // Monitoring Plan
  monitoringPlan: MonitoringPlan;
  
  // Assessment Metadata
  assessedAt: Date;
  validUntil?: Date;
}

export interface LineageCostAnalysis {
  id: string;
  sourceAssetId: string;
  
  // Total Cost
  totalCost: {
    directCosts: number;
    indirectCosts: number;
    opportunityCosts: number;
    riskCosts: number;
    totalCost: number;
    currency: string;
  };
  
  // Cost Breakdown
  costByCategory: CategoryCost[];
  costByPhase: PhaseCost[];
  costByAsset: AssetCost[];
  
  // ROI Analysis
  roi: ROIAnalysis;
  
  // Sensitivity Analysis
  sensitivity: SensitivityAnalysis;
  
  // Cost Scenarios
  scenarios: CostScenario[];
  
  // Analysis Metadata
  analyzedAt: Date;
  currency: string;
}

export interface LineageROIMetrics {
  investment: number;
  benefits: BenefitItem[];
  netBenefit: number;
  roi: number;
  paybackPeriod: number;
  npv: number;
  irr: number;
}

export interface LineageBusinessImpact {
  id: string;
  sourceAssetId: string;
  
  // Business Metrics
  revenueImpact: number;
  customerImpact: number;
  operationalImpact: number;
  strategicImpact: number;
  complianceImpact: number;
  brandImpact: number;
  
  // Impact Categories
  categories: BusinessImpactCategory[];
  
  // Business Processes Affected
  affectedProcesses: BusinessProcess[];
  
  // Stakeholder Impact
  stakeholderImpact: StakeholderImpact[];
  
  // Business Continuity
  businessContinuity: BusinessContinuityAssessment;
}

export interface LineageEfficiencyMetrics {
  processingTime: number;
  resourceUtilization: number;
  throughput: number;
  latency: number;
  errorRate: number;
  availability: number;
}

export interface LineageUsageStatistics {
  totalQueries: number;
  avgQueriesPerDay: number;
  peakUsageTimes: TimeWindow[];
  userDistribution: UserUsageDistribution[];
  queryPatterns: QueryPattern[];
  performanceMetrics: PerformanceMetric[];
}

export interface LineageHealthMetrics {
  overallHealth: number;
  dataQuality: number;
  schemaHealth: number;
  connectivityHealth: number;
  performanceHealth: number;
  governanceHealth: number;
}

export interface LineageReliabilityMetrics {
  uptime: number;
  availability: number;
  errorRate: number;
  meanTimeBetweenFailures: number;
  meanTimeToRecovery: number;
  dataConsistency: number;
}

export interface LineageAvailabilityMetrics {
  currentAvailability: number;
  targetAvailability: number;
  monthlyAvailability: number;
  yearlyAvailability: number;
  downtimeEvents: DowntimeEvent[];
  maintenanceWindows: MaintenanceWindow[];
}

export interface LineageScalabilityMetrics {
  currentScale: ScaleMetrics;
  scalingLimits: ScalingLimits;
  growthTrends: GrowthTrend[];
  capacityPlan: CapacityPlan;
  scalingRecommendations: ScalingRecommendation[];
}

export interface LineagePerformanceMetrics {
  queryPerformance: QueryPerformance;
  indexingPerformance: IndexingPerformance;
  updatePerformance: UpdatePerformance;
  networkPerformance: NetworkPerformance;
  resourceUtilization: ResourceUtilization;
}

export interface LineageQualityContext {
  dataQuality: DataQualityMetrics;
  schemaQuality: SchemaQualityMetrics;
  lineageQuality: LineageQualityMetrics;
  metadataQuality: MetadataQualityMetrics;
}

export interface LineageSecurityContext {
  accessControls: AccessControl[];
  encryptionStatus: EncryptionStatus;
  auditTrail: AuditEvent[];
  securityClassification: SecurityClassification;
  vulnerabilities: SecurityVulnerability[];
}

export interface LineageComplianceContext {
  regulations: ComplianceRegulation[];
  policies: CompliancePolicy[];
  requirements: ComplianceRequirement[];
  violations: ComplianceViolation[];
  certifications: ComplianceCertification[];
}

export interface LineageOperationalContext {
  environment: string;
  deployment: DeploymentInfo;
  monitoring: MonitoringConfiguration;
  alerts: AlertConfiguration[];
  maintenance: MaintenanceSchedule[];
}

export interface LineageBusinessContext {
  businessFunction: string;
  businessProcess: string;
  businessOwner: string;
  stakeholders: Stakeholder[];
  businessRules: BusinessRule[];
  kpis: KPI[];
}

export interface LineageDataContext {
  dataTypes: DataTypeInfo[];
  dataVolume: DataVolumeMetrics;
  dataFlow: DataFlowMetrics;
  dataRetention: DataRetentionPolicy;
  dataArchival: DataArchivalPolicy;
}

export interface LineageTechnicalContext {
  platform: string;
  technology: string;
  version: string;
  configuration: TechnicalConfiguration;
  dependencies: TechnicalDependency[];
  integrations: TechnicalIntegration[];
}

export interface LineageGovernanceContext {
  policies: GovernancePolicy[];
  standards: GovernanceStandard[];
  procedures: GovernanceProcedure[];
  roles: GovernanceRole[];
  responsibilities: GovernanceResponsibility[];
}

export interface LineageMetadata {
  id: string;
  version: string;
  lastUpdated: Date;
  createdBy: string;
  updatedBy: string;
  source: string;
  confidence: number;
  tags: string[];
  annotations: Annotation[];
}

export interface LineageValidationResult {
  id: string;
  lineageId: string;
  validationRuleId: string;
  
  // Validation Outcome
  passed: boolean;
  score: number;
  confidence: number;
  
  // Details
  details: ValidationDetails;
  evidence: ValidationEvidence[];
  
  // Issues Found
  issues: ValidationIssue[];
  
  // Recommendations
  recommendations: ValidationRecommendation[];
  
  // Performance
  validationDuration: number;
  
  // Timestamps
  validatedAt: Date;
}

export interface LineageOptimizationSuggestion {
  id: string;
  type: 'PERFORMANCE' | 'COST' | 'QUALITY' | 'GOVERNANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Suggestion Details
  title: string;
  description: string;
  rationale: string;
  
  // Impact Assessment
  expectedBenefit: string;
  estimatedEffort: number;
  riskLevel: string;
  
  // Implementation
  implementationSteps: string[];
  resources: string[];
  timeline: number;
  
  // Metrics
  successMetrics: string[];
  validationCriteria: string[];
}

export interface LineageComplianceStatus {
  id: string;
  assetId: string;
  
  // Overall Compliance
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'UNKNOWN';
  complianceScore: number;
  
  // Regulation Compliance
  regulationCompliance: RegulationCompliance[];
  
  // Policy Compliance
  policyCompliance: PolicyCompliance[];
  
  // Violations
  violations: ComplianceViolation[];
  
  // Remediation
  remediationPlan: RemediationAction[];
  
  // Assessment Details
  lastAssessed: Date;
  nextAssessment: Date;
  assessedBy: string;
}

export interface LineageSecurityClassification {
  id: string;
  assetId: string;
  
  // Classification Level
  classificationLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'SECRET';
  
  // Data Categories
  dataCategories: DataCategory[];
  
  // Sensitivity Indicators
  sensitivityIndicators: SensitivityIndicator[];
  
  // Access Requirements
  accessRequirements: AccessRequirement[];
  
  // Handling Instructions
  handlingInstructions: HandlingInstruction[];
  
  // Classification Metadata
  classifiedBy: string;
  classifiedAt: Date;
  reviewDate: Date;
  declassificationDate?: Date;
}

// ============================================================================
// LINEAGE DISCOVERY & TRACKING TYPES
// ============================================================================

export interface LineageDiscoveryJob {
  id: string;
  name: string;
  status: LineageDiscoveryStatus;
  
  // Discovery Configuration
  config: LineageDiscoveryConfig;
  
  // Scope
  scope: LineageDiscoveryScope;
  
  // Execution
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: LineageDiscoveryProgress;
  
  // Results
  results: LineageDiscoveryResults;
  
  // Performance
  performance: LineageDiscoveryPerformance;
  
  // Errors & Warnings
  errors: LineageDiscoveryError[];
  warnings: LineageDiscoveryWarning[];
}

export interface LineageDiscoveryResults {
  totalLineagesDiscovered: number;
  newLineagesFound: number;
  existingLineagesUpdated: number;
  invalidLineagesRemoved: number;
  
  // Discovery Breakdown
  discoveryByMethod: DiscoveryMethodBreakdown[];
  discoveryByType: LineageTypeBreakdown[];
  
  // Quality Metrics
  averageConfidence: number;
  highConfidenceLineages: number;
  
  // Detailed Results
  discoveredLineages: DiscoveredLineageRelation[];
  updatedLineages: UpdatedLineageRelation[];
  
  // Performance
  discoveryRate: number;
  processingTime: number;
}

export interface LineageTracking {
  id: string;
  assetId: string;
  
  // Tracking Configuration
  config: LineageTrackingConfig;
  
  // Change Detection
  changeDetection: LineageChangeDetection;
  
  // Evolution History
  evolutionHistory: LineageEvolution[];
  
  // Monitoring
  monitoring: LineageMonitoring;
  
  // Alerts
  alerts: LineageAlert[];
  
  // Performance
  performance: LineageTrackingPerformance;
}

export interface LineageEvolution {
  id: string;
  lineageId: string;
  evolutionType: LineageEvolutionType;
  
  // Change Details
  changes: LineageChange[];
  changeReason: LineageChangeReason;
  
  // Impact
  impact: LineageEvolutionImpact;
  
  // Validation
  validated: boolean;
  validationResults: LineageValidationResult[];
  
  // Timestamps
  evolvedAt: Date;
  detectedAt: Date;
  validatedAt?: Date;
}

// ============================================================================
// LINEAGE QUALITY & VALIDATION TYPES
// ============================================================================

export interface LineageQualityAssessment {
  id: string;
  lineageId: string;
  assessmentType: LineageQualityAssessmentType;
  
  // Quality Dimensions
  completeness: LineageCompleteness;
  accuracy: LineageAccuracy;
  consistency: LineageConsistency;
  freshness: LineageFreshness;
  
  // Overall Quality
  overallScore: number;
  qualityGrade: LineageQualityGrade;
  
  // Quality Issues
  issues: LineageQualityIssue[];
  
  // Improvements
  improvements: LineageQualityImprovement[];
  
  // Recommendations
  recommendations: LineageQualityRecommendation[];
  
  // Timestamps
  assessedAt: Date;
  validFrom: Date;
  validTo?: Date;
}

export interface LineageValidationEngine {
  id: string;
  name: string;
  version: string;
  
  // Validation Rules
  rules: LineageValidationRule[];
  
  // Validation Methods
  methods: LineageValidationMethod[];
  
  // Configuration
  config: ValidationEngineConfig;
  
  // Performance
  performance: ValidationEnginePerformance;
  
  // Metrics
  metrics: ValidationEngineMetric[];
}

export interface LineageValidationResult {
  id: string;
  lineageId: string;
  validationRuleId: string;
  
  // Validation Outcome
  passed: boolean;
  score: number;
  confidence: number;
  
  // Details
  details: ValidationDetails;
  evidence: ValidationEvidence[];
  
  // Issues Found
  issues: ValidationIssue[];
  
  // Recommendations
  recommendations: ValidationRecommendation[];
  
  // Performance
  validationDuration: number;
  
  // Timestamps
  validatedAt: Date;
}

// ============================================================================
// LINEAGE ANALYTICS & INSIGHTS TYPES
// ============================================================================

export interface LineageAnalytics {
  id: string;
  name: string;
  
  // Analytics Configuration
  config: LineageAnalyticsConfig;
  
  // Network Analytics
  networkAnalytics: LineageNetworkAnalytics;
  
  // Flow Analytics
  flowAnalytics: LineageFlowAnalytics;
  
  // Pattern Analytics
  patternAnalytics: LineagePatternAnalytics;
  
  // Impact Analytics
  impactAnalytics: LineageImpactAnalytics;
  
  // Trend Analytics
  trendAnalytics: LineageTrendAnalytics;
  
  // Insights
  insights: LineageAnalyticsInsight[];
  
  // Performance
  performance: LineageAnalyticsPerformance;
}

export interface LineageNetworkAnalytics {
  id: string;
  
  // Network Metrics
  totalNodes: number;
  totalEdges: number;
  networkDensity: number;
  
  // Centrality Metrics
  centralityMetrics: CentralityMetric[];
  
  // Clustering
  clusteringCoefficient: number;
  clusters: LineageCluster[];
  
  // Connectivity
  connectivity: NetworkConnectivity;
  
  // Path Analytics
  pathAnalytics: NetworkPathAnalytics;
  
  // Robustness
  robustness: NetworkRobustness;
}

export interface LineageFlowAnalytics {
  id: string;
  
  // Flow Metrics
  totalFlows: number;
  activeFlows: number;
  flowVelocity: number;
  
  // Flow Patterns
  flowPatterns: FlowPattern[];
  
  // Bottlenecks
  bottlenecks: FlowBottleneck[];
  
  // Flow Quality
  flowQuality: FlowQualityMetric[];
  
  // Throughput
  throughput: FlowThroughput;
  
  // Performance
  flowPerformance: FlowPerformanceMetric[];
}

export interface LineagePatternAnalytics {
  id: string;
  
  // Common Patterns
  commonPatterns: LineagePattern[];
  
  // Anti-patterns
  antiPatterns: LineageAntiPattern[];
  
  // Pattern Frequency
  patternFrequency: PatternFrequencyAnalysis;
  
  // Pattern Evolution
  patternEvolution: PatternEvolutionAnalysis;
  
  // Best Practices
  bestPractices: LineageBestPractice[];
  
  // Recommendations
  patternRecommendations: PatternRecommendation[];
}

// ============================================================================
// LINEAGE REPORTING TYPES
// ============================================================================

export interface LineageReport {
  id: string;
  name: string;
  type: LineageReportType;
  
  // Report Configuration
  config: LineageReportConfig;
  
  // Content
  content: LineageReportContent;
  
  // Visualizations
  visualizations: LineageVisualization[];
  
  // Metadata
  metadata: LineageReportMetadata;
  
  // Distribution
  distribution: LineageReportDistribution;
  
  // Status
  status: LineageReportStatus;
  
  // Timestamps
  generatedAt: Date;
  lastUpdated: Date;
}

export interface LineageDocumentation {
  id: string;
  lineageId: string;
  
  // Documentation Content
  description: string;
  businessContext: string;
  technicalDetails: string;
  
  // Transformation Logic
  transformationLogic: TransformationDocumentation[];
  
  // Data Flow
  dataFlow: DataFlowDocumentation;
  
  // Dependencies
  dependencies: DependencyDocumentation[];
  
  // Quality Notes
  qualityNotes: QualityDocumentation[];
  
  // Maintenance
  maintenanceNotes: MaintenanceDocumentation[];
  
  // Version Control
  version: string;
  changeLog: DocumentationChangeLog[];
  
  // Approval
  approvalStatus: DocumentationApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum LineageNodeType {
  SOURCE = 'SOURCE',
  TARGET = 'TARGET',
  TRANSFORMATION = 'TRANSFORMATION',
  AGGREGATION = 'AGGREGATION',
  FILTER = 'FILTER',
  JOIN = 'JOIN',
  UNION = 'UNION',
  SPLIT = 'SPLIT'
}

export enum LineageEdgeType {
  DATA_FLOW = 'DATA_FLOW',
  TRANSFORMATION = 'TRANSFORMATION',
  DEPENDENCY = 'DEPENDENCY',
  TRIGGER = 'TRIGGER',
  CONTROL_FLOW = 'CONTROL_FLOW'
}

export enum TransformationType {
  COPY = 'COPY',
  FILTER = 'FILTER',
  AGGREGATE = 'AGGREGATE',
  JOIN = 'JOIN',
  UNION = 'UNION',
  TRANSFORM = 'TRANSFORM',
  CALCULATE = 'CALCULATE',
  SPLIT = 'SPLIT',
  MERGE = 'MERGE',
  CLEANSE = 'CLEANSE'
}

export enum LineageDiscoveryStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED'
}

export enum ImpactAnalysisType {
  DOWNSTREAM = 'DOWNSTREAM',
  UPSTREAM = 'UPSTREAM',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
  COMPREHENSIVE = 'COMPREHENSIVE'
}

export enum LineageEvolutionType {
  CREATION = 'CREATION',
  MODIFICATION = 'MODIFICATION',
  DELETION = 'DELETION',
  SCHEMA_CHANGE = 'SCHEMA_CHANGE',
  TRANSFORMATION_CHANGE = 'TRANSFORMATION_CHANGE',
  DEPENDENCY_CHANGE = 'DEPENDENCY_CHANGE'
}

export enum LineageQualityGrade {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL'
}

export enum LineageQualityAssessmentType {
  AUTOMATED = 'AUTOMATED',
  MANUAL = 'MANUAL',
  HYBRID = 'HYBRID',
  CONTINUOUS = 'CONTINUOUS'
}

export enum LineageReportType {
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  IMPACT_ANALYSIS = 'IMPACT_ANALYSIS',
  QUALITY_REPORT = 'QUALITY_REPORT',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
  PERFORMANCE_REPORT = 'PERFORMANCE_REPORT'
}

export enum LineageReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED'
}

export enum DocumentationApprovalStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_UPDATE = 'NEEDS_UPDATE'
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface NodePosition {
  x: number;
  y: number;
  z?: number;
}

export interface NodeStyle {
  color: string;
  size: number;
  shape: NodeShape;
  icon?: string;
  label?: NodeLabel;
  border?: NodeBorder;
}

export interface EdgeStyle {
  color: string;
  width: number;
  style: EdgeLineStyle;
  arrow?: EdgeArrow;
  label?: EdgeLabel;
}

export interface LineageNodeData {
  asset: IntelligentDataAsset;
  transformations: any[];
  metadata: Record<string, any>;
  metrics: Record<string, number>;
}

export interface LineageEdgeData {
  transformation: any;
  metadata: Record<string, any>;
  metrics: Record<string, number>;
  confidence: number;
}

export interface LineageFilter {
  id: string;
  name: string;
  type: FilterType;
  criteria: FilterCriteria;
  enabled: boolean;
}

export interface LineageView {
  id: string;
  name: string;
  description?: string;
  filters: LineageFilter[];
  layout: LineageLayoutConfig;
  customizations: ViewCustomization[];
}

export interface ImpactedAsset {
  assetId: string;
  asset: IntelligentDataAsset;
  impactLevel: ImpactLevel;
  impactType: ImpactType;
  distance: number;
  pathCount: number;
  riskLevel: RiskLevel;
}

export interface LineageCluster {
  id: string;
  name: string;
  nodes: string[];
  density: number;
  cohesion: number;
  purpose: ClusterPurpose;
}

export interface FlowPattern {
  id: string;
  type: FlowPatternType;
  frequency: number;
  strength: number;
  examples: FlowPatternExample[];
}

export interface LineagePattern {
  id: string;
  name: string;
  type: PatternType;
  description: string;
  frequency: number;
  examples: PatternExample[];
  bestPractice: boolean;
}

export enum NodeShape {
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE',
  DIAMOND = 'DIAMOND',
  TRIANGLE = 'TRIANGLE',
  HEXAGON = 'HEXAGON'
}

export enum EdgeLineStyle {
  SOLID = 'SOLID',
  DASHED = 'DASHED',
  DOTTED = 'DOTTED',
  CURVED = 'CURVED'
}

export enum FilterType {
  ASSET_TYPE = 'ASSET_TYPE',
  TRANSFORMATION_TYPE = 'TRANSFORMATION_TYPE',
  CONFIDENCE_LEVEL = 'CONFIDENCE_LEVEL',
  TIME_RANGE = 'TIME_RANGE',
  BUSINESS_DOMAIN = 'BUSINESS_DOMAIN'
}

export enum ImpactLevel {
  MINIMAL = 'MINIMAL',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ImpactType {
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT',
  CASCADING = 'CASCADING',
  SYSTEMIC = 'SYSTEMIC'
}

export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ClusterPurpose {
  DATA_PROCESSING = 'DATA_PROCESSING',
  ANALYTICS = 'ANALYTICS',
  REPORTING = 'REPORTING',
  INTEGRATION = 'INTEGRATION',
  ARCHIVE = 'ARCHIVE'
}

export enum FlowPatternType {
  SEQUENTIAL = 'SEQUENTIAL',
  PARALLEL = 'PARALLEL',
  BRANCHING = 'BRANCHING',
  MERGING = 'MERGING',
  CIRCULAR = 'CIRCULAR'
}

export enum PatternType {
  ARCHITECTURAL = 'ARCHITECTURAL',
  PROCESSING = 'PROCESSING',
  INTEGRATION = 'INTEGRATION',
  QUALITY = 'QUALITY',
  GOVERNANCE = 'GOVERNANCE'
}