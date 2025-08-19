// ============================================================================
// ADVANCED CATALOG QUALITY TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: catalog_quality_service.py, catalog_quality_models.py
// ============================================================================

import { 
  DataQualityRule, 
  QualityScorecard,
  TimePeriod,
  IntelligentDataAsset 
} from './catalog-core.types';

// ============================================================================
// QUALITY MANAGEMENT TYPES (catalog_quality_service.py)
// ============================================================================

export interface QualityDashboard {
  id: string;
  name: string;
  description?: string;
  
  // Dashboard Configuration
  config: QualityDashboardConfig;
  
  // Quality Metrics
  overallQualityScore: number;
  qualityTrend: QualityTrend;
  
  // Widgets
  widgets: QualityWidget[];
  
  // Filters & Time Range
  filters: QualityFilter[];
  timeRange: TimePeriod;
  
  // Refresh Settings
  autoRefresh: boolean;
  refreshInterval: number;
  lastRefreshed: Date;
  
  // User Preferences
  layout: DashboardLayout;
  personalizations: DashboardPersonalization[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityWidget {
  id: string;
  type: QualityWidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  
  // Configuration
  config: WidgetConfig;
  dataSource: WidgetDataSource;
  
  // Data
  data: QualityWidgetData;
  
  // Visualization
  chartType: ChartType;
  chartConfig: ChartConfig;
  
  // Interactivity
  drillDownEnabled: boolean;
  filterEnabled: boolean;
  
  // Refresh
  autoRefresh: boolean;
  refreshInterval: number;
  lastRefreshed: Date;
}

export interface QualityAssessmentJob {
  id: string;
  name: string;
  status: QualityJobStatus;
  
  // Scope
  scope: QualityAssessmentScope;
  assets: string[];
  
  // Configuration
  rules: DataQualityRule[];
  schedule: QualitySchedule;
  
  // Execution
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: QualityJobProgress;
  
  // Results
  results: QualityAssessmentResult[];
  summary: QualityJobSummary;
  
  // Performance
  performance: QualityJobPerformance;
  
  // Errors
  errors: QualityJobError[];
  warnings: QualityJobWarning[];
}

export interface QualityAssessmentResult {
  id: string;
  assetId: string;
  jobId: string;
  
  // Overall Assessment
  overallScore: number;
  status: QualityAssessmentStatus;
  
  // Dimension Scores
  dimensionScores: QualityDimensionScore[];
  
  // Rule Results
  ruleResults: QualityRuleExecutionResult[];
  
  // Issues Found
  issues: QualityIssue[];
  criticalIssues: QualityIssue[];
  
  // Trends
  scoreTrend: QualityScoreTrend;
  improvement: QualityImprovement;
  
  // Recommendations
  recommendations: QualityRecommendation[];
  actionItems: QualityActionItem[];
  
  // Metadata
  executionMetadata: QualityExecutionMetadata;
  
  // Timestamps
  assessedAt: Date;
  validFrom: Date;
  validTo?: Date;
}

export interface QualityRuleExecutionResult {
  ruleId: string;
  ruleName: string;
  status: RuleExecutionStatus;
  
  // Execution Details
  executionTime: Date;
  duration: number;
  
  // Results
  passed: boolean;
  score: number;
  threshold: number;
  
  // Metrics
  recordsProcessed: number;
  recordsPassed: number;
  recordsFailed: number;
  
  // Issues
  issues: QualityRuleIssue[];
  samples: QualityIssueSample[];
  
  // Performance
  performance: RuleExecutionPerformance;
  
  // Error Handling
  errors: RuleExecutionError[];
  retryCount: number;
}

export interface QualityIssue {
  id: string;
  type: QualityIssueType;
  severity: QualityIssueSeverity;
  title: string;
  description: string;
  
  // Context
  assetId: string;
  columnName?: string;
  ruleId?: string;
  
  // Details
  affectedRecords: number;
  sampleValues: any[];
  pattern?: string;
  
  // Impact
  businessImpact: BusinessImpact;
  technicalImpact: TechnicalImpact;
  
  // Resolution
  status: IssueStatus;
  assignedTo?: string;
  dueDate?: Date;
  
  // Tracking
  firstDetected: Date;
  lastSeen: Date;
  occurrenceCount: number;
  
  // Resolution History
  resolutionHistory: IssueResolution[];
  
  // Related Issues
  relatedIssues: string[];
  rootCause?: RootCause;
}

export interface QualityTrend {
  id: string;
  assetId?: string;
  period: TimePeriod;
  
  // Trend Data
  dataPoints: QualityTrendDataPoint[];
  direction: TrendDirection;
  
  // Analysis
  changeRate: number;
  volatility: number;
  seasonality: SeasonalityInfo;
  
  // Forecasting
  forecast: QualityForecast[];
  
  // Insights
  insights: QualityTrendInsight[];
  
  // Alerts
  alerts: QualityTrendAlert[];
}

export interface QualityRecommendation {
  id: string;
  type: QualityRecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  
  // Context
  assetId?: string;
  ruleId?: string;
  issueId?: string;
  
  // Implementation
  implementation: RecommendationImplementation;
  estimatedEffort: EffortEstimate;
  expectedImpact: ImpactEstimate;
  
  // Actions
  actionItems: RecommendationActionItem[];
  
  // Validation
  successCriteria: SuccessCriteria[];
  
  // Tracking
  status: RecommendationStatus;
  assignedTo?: string;
  dueDate?: Date;
  
  // Feedback
  feedback: RecommendationFeedback[];
  
  // Timestamps
  createdAt: Date;
  implementedAt?: Date;
  validatedAt?: Date;
}

export interface QualityMonitoring {
  id: string;
  name: string;
  description?: string;
  
  // Monitoring Scope
  scope: MonitoringScope;
  assets: string[];
  
  // Monitoring Rules
  rules: QualityMonitoringRule[];
  
  // Alerting
  alerting: QualityAlerting;
  
  // Scheduling
  schedule: MonitoringSchedule;
  
  // Thresholds
  thresholds: QualityThreshold[];
  
  // Status
  status: MonitoringStatus;
  lastRun: Date;
  nextRun: Date;
  
  // Performance
  performance: MonitoringPerformance;
  
  // History
  executionHistory: MonitoringExecution[];
}

export interface QualityReport {
  id: string;
  name: string;
  type: QualityReportType;
  
  // Report Configuration
  config: QualityReportConfig;
  template: ReportTemplate;
  
  // Data
  data: QualityReportData;
  
  // Sections
  sections: QualityReportSection[];
  
  // Visualization
  charts: QualityChart[];
  tables: QualityTable[];
  
  // Metadata
  metadata: QualityReportMetadata;
  
  // Distribution
  recipients: ReportRecipient[];
  distributionSchedule: DistributionSchedule;
  
  // Status
  status: ReportStatus;
  generatedAt: Date;
  
  // Export Options
  exportFormats: ExportFormat[];
  
  // Access Control
  accessControl: ReportAccessControl;
}

// ============================================================================
// QUALITY PROFILING & ANALYSIS TYPES
// ============================================================================

export interface QualityProfile {
  id: string;
  assetId: string;
  profileType: QualityProfileType;
  
  // Profile Data
  profileData: ProfileData;
  
  // Statistical Analysis
  statistics: QualityStatistics;
  
  // Pattern Analysis
  patterns: QualityPattern[];
  
  // Anomaly Detection
  anomalies: QualityAnomaly[];
  
  // Baseline Comparison
  baseline: QualityBaseline;
  deviation: QualityDeviation;
  
  // Timestamps
  profiledAt: Date;
  validFrom: Date;
  validTo?: Date;
}

export interface QualityBaseline {
  id: string;
  assetId: string;
  baselineType: BaselineType;
  
  // Baseline Metrics
  metrics: BaselineMetric[];
  
  // Statistical Baselines
  statisticalBaseline: StatisticalBaseline;
  
  // Behavioral Baselines
  behavioralBaseline: BehavioralBaseline;
  
  // Thresholds
  thresholds: BaselineThreshold[];
  
  // Validity
  validFrom: Date;
  validTo?: Date;
  confidence: number;
  
  // Maintenance
  autoUpdate: boolean;
  updateFrequency: UpdateFrequency;
  lastUpdated: Date;
}

export interface QualityScoreTrend {
  assetId: string;
  period: TimePeriod;
  dataPoints: ScoreTrendDataPoint[];
  
  // Trend Analysis
  overallTrend: TrendDirection;
  changeRate: number;
  volatility: number;
  
  // Forecasting
  forecast: ScoreForecast[];
  confidence: number;
  
  // Insights
  insights: TrendInsight[];
  
  // Anomalies
  anomalies: TrendAnomaly[];
}

// ============================================================================
// QUALITY RULE ENGINE TYPES
// ============================================================================

export interface QualityRuleEngine {
  id: string;
  version: string;
  
  // Engine Configuration
  config: RuleEngineConfig;
  
  // Rule Library
  ruleLibrary: QualityRuleLibrary;
  
  // Execution Engine
  executionEngine: RuleExecutionEngine;
  
  // Performance
  performance: EnginePerformance;
  
  // Status
  status: EngineStatus;
  
  // Monitoring
  monitoring: EngineMonitoring;
}

export interface QualityRuleLibrary {
  id: string;
  name: string;
  version: string;
  
  // Categories
  categories: RuleCategory[];
  
  // Built-in Rules
  builtInRules: BuiltInRule[];
  
  // Custom Rules
  customRules: CustomRule[];
  
  // Rule Templates
  ruleTemplates: RuleTemplate[];
  
  // Dependencies
  dependencies: RuleDependency[];
  
  // Validation
  validation: LibraryValidation;
}

// ============================================================================
// QUALITY AUTOMATION TYPES
// ============================================================================

export interface QualityAutomation {
  id: string;
  name: string;
  type: AutomationType;
  
  // Automation Configuration
  config: AutomationConfig;
  
  // Triggers
  triggers: AutomationTrigger[];
  
  // Actions
  actions: AutomationAction[];
  
  // Conditions
  conditions: AutomationCondition[];
  
  // Execution
  execution: AutomationExecution;
  
  // Status
  status: AutomationStatus;
  enabled: boolean;
  
  // History
  executionHistory: AutomationExecutionHistory[];
  
  // Performance
  performance: AutomationPerformance;
}

export interface QualityGovernance {
  id: string;
  name: string;
  
  // Policies
  policies: QualityPolicy[];
  
  // Standards
  standards: QualityStandard[];
  
  // Compliance
  compliance: QualityCompliance;
  
  // Roles & Responsibilities
  roles: QualityRole[];
  responsibilities: QualityResponsibility[];
  
  // Approval Workflows
  approvalWorkflows: QualityApprovalWorkflow[];
  
  // Audit Trail
  auditTrail: QualityAuditEvent[];
  
  // Metrics
  governanceMetrics: GovernanceMetric[];
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum QualityWidgetType {
  SCORE_CARD = 'SCORE_CARD',
  TREND_CHART = 'TREND_CHART',
  ISSUE_SUMMARY = 'ISSUE_SUMMARY',
  RULE_STATUS = 'RULE_STATUS',
  HEAT_MAP = 'HEAT_MAP',
  DISTRIBUTION_CHART = 'DISTRIBUTION_CHART',
  COMPARISON_CHART = 'COMPARISON_CHART',
  KPI_INDICATOR = 'KPI_INDICATOR'
}

export enum QualityJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED'
}

export enum QualityAssessmentStatus {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL'
}

export enum RuleExecutionStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  WARNING = 'WARNING',
  SKIPPED = 'SKIPPED',
  ERROR = 'ERROR'
}

export enum QualityIssueType {
  COMPLETENESS = 'COMPLETENESS',
  ACCURACY = 'ACCURACY',
  CONSISTENCY = 'CONSISTENCY',
  VALIDITY = 'VALIDITY',
  UNIQUENESS = 'UNIQUENESS',
  TIMELINESS = 'TIMELINESS',
  INTEGRITY = 'INTEGRITY',
  CONFORMITY = 'CONFORMITY'
}

export enum QualityIssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  BLOCKING = 'BLOCKING'
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
  DEFERRED = 'DEFERRED'
}

export enum TrendDirection {
  IMPROVING = 'IMPROVING',
  DECLINING = 'DECLINING',
  STABLE = 'STABLE',
  VOLATILE = 'VOLATILE',
  UNKNOWN = 'UNKNOWN'
}

export enum QualityRecommendationType {
  RULE_ENHANCEMENT = 'RULE_ENHANCEMENT',
  THRESHOLD_ADJUSTMENT = 'THRESHOLD_ADJUSTMENT',
  DATA_CLEANSING = 'DATA_CLEANSING',
  PROCESS_IMPROVEMENT = 'PROCESS_IMPROVEMENT',
  AUTOMATION = 'AUTOMATION',
  MONITORING = 'MONITORING',
  TRAINING = 'TRAINING'
}

export enum RecommendationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum RecommendationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  IMPLEMENTED = 'IMPLEMENTED',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  DEFERRED = 'DEFERRED'
}

export enum MonitoringStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  MAINTENANCE = 'MAINTENANCE'
}

export enum QualityReportType {
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  DETAILED_ANALYSIS = 'DETAILED_ANALYSIS',
  TREND_REPORT = 'TREND_REPORT',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
  ISSUE_REPORT = 'ISSUE_REPORT',
  SCORECARD = 'SCORECARD',
  BENCHMARK = 'BENCHMARK'
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
  DISTRIBUTED = 'DISTRIBUTED'
}

export enum AutomationType {
  QUALITY_MONITORING = 'QUALITY_MONITORING',
  ISSUE_RESOLUTION = 'ISSUE_RESOLUTION',
  ALERTING = 'ALERTING',
  REPORTING = 'REPORTING',
  DATA_CLEANSING = 'DATA_CLEANSING',
  RULE_OPTIMIZATION = 'RULE_OPTIMIZATION'
}

export enum AutomationStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface QualityDimensionScore {
  dimension: string;
  score: number;
  weight: number;
  contribution: number;
  trend: TrendDirection;
  issues: number;
}

export interface QualityJobProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  percentage: number;
  estimatedTimeRemaining: number;
}

export interface QualityJobSummary {
  totalAssets: number;
  assessedAssets: number;
  passedAssets: number;
  failedAssets: number;
  averageScore: number;
  totalIssues: number;
  criticalIssues: number;
}

export interface QualityThreshold {
  name: string;
  value: number;
  operator: ThresholdOperator;
  severity: QualityIssueSeverity;
  enabled: boolean;
}

export interface BusinessImpact {
  level: ImpactLevel;
  description: string;
  affectedProcesses: string[];
  estimatedCost: number;
  riskLevel: RiskLevel;
}

export interface TechnicalImpact {
  level: ImpactLevel;
  description: string;
  affectedSystems: string[];
  performanceImpact: PerformanceImpact;
  scalabilityImpact: ScalabilityImpact;
}

export interface QualityForecast {
  date: Date;
  predictedScore: number;
  confidence: number;
  factors: ForecastFactor[];
}

export interface EffortEstimate {
  timeEstimate: number;
  resourcesRequired: string[];
  complexity: ComplexityLevel;
  dependencies: string[];
}

export interface ImpactEstimate {
  qualityImprovement: number;
  costSavings: number;
  riskReduction: number;
  businessValue: number;
}

export enum ThresholdOperator {
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  BETWEEN = 'BETWEEN'
}

export enum ImpactLevel {
  MINIMAL = 'MINIMAL',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  SEVERE = 'SEVERE'
}

export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ComplexityLevel {
  SIMPLE = 'SIMPLE',
  MODERATE = 'MODERATE',
  COMPLEX = 'COMPLEX',
  VERY_COMPLEX = 'VERY_COMPLEX'
}