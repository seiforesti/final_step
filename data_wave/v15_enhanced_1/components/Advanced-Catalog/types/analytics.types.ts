// ============================================================================
// ADVANCED CATALOG ANALYTICS TYPES - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: catalog_analytics_service.py, comprehensive_analytics_service.py
// ============================================================================

import { 
  IntelligentDataAsset, 
  AssetUsageMetrics,
  TimePeriod,
  BusinessGlossaryTerm 
} from './catalog-core.types';

// ============================================================================
// CATALOG ANALYTICS TYPES (catalog_analytics_service.py)
// ============================================================================

export interface CatalogAnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  
  // Dashboard Configuration
  config: AnalyticsDashboardConfig;
  
  // Analytics Modules
  usageAnalytics: UsageAnalyticsModule;
  popularityAnalytics: PopularityAnalyticsModule;
  businessAnalytics: BusinessAnalyticsModule;
  technicalAnalytics: TechnicalAnalyticsModule;
  
  // Widgets
  widgets: AnalyticsWidget[];
  
  // Time Range & Filters
  timeRange: TimePeriod;
  filters: AnalyticsFilter[];
  
  // Performance
  performance: DashboardPerformance;
  
  // Personalization
  userPreferences: AnalyticsUserPreferences;
  
  // Timestamps
  createdAt: Date;
  lastUpdated: Date;
  lastViewed: Date;
}

export interface UsageAnalyticsModule {
  id: string;
  name: string;
  
  // Usage Metrics
  totalUsage: UsageMetric;
  userEngagement: UserEngagementMetric;
  assetPopularity: AssetPopularityMetric;
  
  // Trends
  usageTrends: UsageTrend[];
  seasonalPatterns: SeasonalPattern[];
  
  // User Behavior
  userBehavior: UserBehaviorAnalysis;
  accessPatterns: AccessPatternAnalysis;
  
  // Recommendations
  usageRecommendations: UsageRecommendation[];
  
  // Performance
  performanceMetrics: UsagePerformanceMetrics;
}

export interface PopularityAnalyticsModule {
  id: string;
  name: string;
  
  // Popularity Metrics
  popularAssets: PopularAssetMetric[];
  trendingAssets: TrendingAssetMetric[];
  emergingAssets: EmergingAssetMetric[];
  
  // Rankings
  assetRankings: AssetRanking[];
  categoryRankings: CategoryRanking[];
  
  // Popularity Factors
  popularityFactors: PopularityFactor[];
  
  // Predictions
  popularityPredictions: PopularityPrediction[];
  
  // Insights
  popularityInsights: PopularityInsight[];
}

export interface BusinessAnalyticsModule {
  id: string;
  name: string;
  
  // Business Value Metrics
  businessValue: BusinessValueMetric;
  roi: ROIMetric;
  costBenefit: CostBenefitAnalysis;
  
  // Business Impact
  businessImpact: BusinessImpactAnalysis;
  processOptimization: ProcessOptimizationMetric;
  
  // Governance Metrics
  governanceMetrics: GovernanceMetric[];
  complianceMetrics: ComplianceMetric[];
  
  // Strategic Insights
  strategicInsights: StrategicInsight[];
  
  // Recommendations
  businessRecommendations: BusinessRecommendation[];
}

export interface TechnicalAnalyticsModule {
  id: string;
  name: string;
  
  // Technical Performance
  performance: TechnicalPerformanceMetric;
  availability: AvailabilityMetric;
  reliability: ReliabilityMetric;
  
  // Data Quality
  qualityMetrics: TechnicalQualityMetric[];
  
  // System Health
  systemHealth: SystemHealthMetric;
  resourceUtilization: ResourceUtilizationMetric;
  
  // Integration Metrics
  integrationMetrics: IntegrationMetric[];
  
  // Technical Insights
  technicalInsights: TechnicalInsight[];
}

// ============================================================================
// COMPREHENSIVE ANALYTICS TYPES (comprehensive_analytics_service.py)
// ============================================================================

export interface ComprehensiveAnalytics {
  id: string;
  name: string;
  type: ComprehensiveAnalyticsType;
  
  // Cross-System Analytics
  crossSystemMetrics: CrossSystemMetric[];
  
  // Enterprise Metrics
  enterpriseMetrics: EnterpriseMetric[];
  
  // Predictive Analytics
  predictiveAnalytics: PredictiveAnalyticsResults;
  
  // Advanced Insights
  advancedInsights: AdvancedInsight[];
  
  // Benchmarking
  benchmarking: BenchmarkingResults;
  
  // Custom Analytics
  customAnalytics: CustomAnalyticsResults[];
  
  // Timestamps
  generatedAt: Date;
  validFrom: Date;
  validTo?: Date;
}

export interface CrossSystemMetric {
  id: string;
  name: string;
  type: MetricType;
  
  // System Sources
  sources: SystemSource[];
  
  // Metric Data
  value: number;
  previousValue?: number;
  changePercentage: number;
  
  // Aggregation
  aggregationType: AggregationType;
  aggregationPeriod: TimePeriod;
  
  // Context
  context: MetricContext;
  
  // Breakdown
  breakdown: MetricBreakdown[];
  
  // Trends
  trend: MetricTrend;
  forecast: MetricForecast[];
}

export interface EnterpriseMetric {
  id: string;
  category: EnterpriseMetricCategory;
  name: string;
  description: string;
  
  // KPI Information
  isKPI: boolean;
  kpiTarget?: number;
  kpiThreshold?: KPIThreshold;
  
  // Current Value
  currentValue: number;
  unit: string;
  
  // Historical Data
  historicalData: MetricDataPoint[];
  
  // Performance
  performance: MetricPerformance;
  
  // Business Context
  businessContext: BusinessContext;
  
  // Alerts
  alerts: MetricAlert[];
}

export interface PredictiveAnalyticsResults {
  id: string;
  modelType: PredictiveModelType;
  
  // Predictions
  predictions: Prediction[];
  
  // Model Performance
  modelPerformance: ModelPerformance;
  
  // Confidence Intervals
  confidenceIntervals: ConfidenceInterval[];
  
  // Feature Importance
  featureImportance: FeatureImportance[];
  
  // Validation Results
  validationResults: ValidationResults;
  
  // Recommendations
  predictiveRecommendations: PredictiveRecommendation[];
}

export interface AdvancedInsight {
  id: string;
  type: AdvancedInsightType;
  category: InsightCategory;
  title: string;
  description: string;
  
  // Insight Data
  data: InsightData;
  evidence: InsightEvidence[];
  
  // Impact & Priority
  impact: InsightImpact;
  priority: InsightPriority;
  confidence: number;
  
  // Action Items
  actionItems: InsightActionItem[];
  
  // Business Value
  businessValue: InsightBusinessValue;
  
  // Related Insights
  relatedInsights: string[];
  
  // Validation
  validated: boolean;
  validationScore: number;
  
  // Timestamps
  discoveredAt: Date;
  lastValidated?: Date;
}

export interface BenchmarkingResults {
  id: string;
  benchmarkType: BenchmarkType;
  
  // Benchmark Data
  benchmarks: Benchmark[];
  
  // Comparisons
  industryComparison: IndustryComparison;
  peerComparison: PeerComparison;
  
  // Performance Gaps
  performanceGaps: PerformanceGap[];
  
  // Best Practices
  bestPractices: BestPractice[];
  
  // Improvement Opportunities
  improvementOpportunities: ImprovementOpportunity[];
  
  // Recommendations
  benchmarkRecommendations: BenchmarkRecommendation[];
}

// ============================================================================
// USAGE ANALYTICS TYPES
// ============================================================================

export interface UsageMetric {
  totalViews: number;
  uniqueUsers: number;
  totalDownloads: number;
  totalQueries: number;
  averageSessionDuration: number;
  bounceRate: number;
  
  // Time-based Metrics
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  
  // Engagement Metrics
  averageViewsPerUser: number;
  averageQueriesPerUser: number;
  returnUserRate: number;
  
  // Growth Metrics
  userGrowthRate: number;
  usageGrowthRate: number;
  
  // Quality Metrics
  successRate: number;
  errorRate: number;
}

export interface UserEngagementMetric {
  engagementScore: number;
  
  // Engagement Categories
  highlyEngagedUsers: number;
  moderatelyEngagedUsers: number;
  lowEngagedUsers: number;
  
  // Engagement Activities
  commentCount: number;
  ratingCount: number;
  sharingCount: number;
  collaborationCount: number;
  
  // Engagement Trends
  engagementTrend: EngagementTrend;
  
  // User Segments
  engagementByUserSegment: EngagementSegment[];
}

export interface AssetPopularityMetric {
  popularityScore: number;
  popularityRank: number;
  
  // Popularity Factors
  viewsWeight: number;
  downloadsWeight: number;
  ratingsWeight: number;
  sharesWeight: number;
  
  // Viral Metrics
  viralCoefficient: number;
  sharingRate: number;
  
  // Temporal Popularity
  currentPopularity: number;
  peakPopularity: number;
  averagePopularity: number;
  
  // Category Popularity
  categoryRank: number;
  categoryScore: number;
}

export interface UsageTrend {
  trendType: TrendType;
  period: TimePeriod;
  dataPoints: TrendDataPoint[];
  
  // Trend Analysis
  direction: TrendDirection;
  strength: TrendStrength;
  volatility: number;
  
  // Seasonal Analysis
  seasonality: SeasonalityInfo;
  cyclicalPatterns: CyclicalPattern[];
  
  // Forecasting
  forecast: TrendForecast[];
  
  // Anomalies
  anomalies: TrendAnomaly[];
}

export interface UserBehaviorAnalysis {
  id: string;
  userId?: string;
  
  // Behavior Patterns
  behaviorPatterns: BehaviorPattern[];
  
  // Navigation Patterns
  navigationPatterns: NavigationPattern[];
  
  // Search Behavior
  searchBehavior: SearchBehaviorPattern;
  
  // Interaction Patterns
  interactionPatterns: InteractionPattern[];
  
  // Preferences
  preferenceProfile: UserPreferenceProfile;
  
  // Journey Analysis
  userJourney: UserJourneyAnalysis;
  
  // Segmentation
  userSegment: UserSegment;
  
  // Predictive Behavior
  predictedBehavior: PredictedBehavior[];
}

// ============================================================================
// BUSINESS ANALYTICS TYPES
// ============================================================================

export interface BusinessValueMetric {
  totalBusinessValue: number;
  
  // Value Components
  costSavings: number;
  revenueGeneration: number;
  riskReduction: number;
  efficiencyGains: number;
  
  // Value Categories
  operationalValue: number;
  strategicValue: number;
  complianceValue: number;
  innovationValue: number;
  
  // Value Trends
  valueGrowthRate: number;
  valueVolatility: number;
  
  // ROI Metrics
  returnOnInvestment: number;
  netPresentValue: number;
  paybackPeriod: number;
}

export interface ROIMetric {
  totalROI: number;
  
  // ROI Components
  implementationCost: number;
  operationalCost: number;
  benefits: number;
  savings: number;
  
  // Time-based ROI
  firstYearROI: number;
  threeYearROI: number;
  fiveYearROI: number;
  
  // ROI Categories
  technologyROI: number;
  processROI: number;
  peopleROI: number;
  
  // Risk-adjusted ROI
  riskAdjustedROI: number;
  confidenceLevel: number;
}

export interface CostBenefitAnalysis {
  id: string;
  
  // Costs
  costs: CostComponent[];
  totalCosts: number;
  
  // Benefits
  benefits: BenefitComponent[];
  totalBenefits: number;
  
  // Net Analysis
  netBenefit: number;
  benefitCostRatio: number;
  
  // Time Analysis
  timeToBreakEven: number;
  
  // Sensitivity Analysis
  sensitivityAnalysis: SensitivityResult[];
  
  // Risk Analysis
  riskAnalysis: RiskAnalysisResult;
}

export interface ProcessOptimizationMetric {
  id: string;
  processName: string;
  
  // Efficiency Metrics
  processEfficiency: number;
  timeReduction: number;
  resourceReduction: number;
  errorReduction: number;
  
  // Quality Metrics
  processQuality: number;
  outputQuality: number;
  
  // Automation Metrics
  automationLevel: number;
  manualStepsReduced: number;
  
  // Compliance Metrics
  complianceImprovement: number;
  auditReadiness: number;
}

// ============================================================================
// PREDICTIVE ANALYTICS TYPES
// ============================================================================

export interface Prediction {
  id: string;
  predictionType: PredictionType;
  targetVariable: string;
  
  // Prediction Values
  predictedValue: number;
  confidenceInterval: ConfidenceInterval;
  
  // Time Horizon
  predictionHorizon: TimePeriod;
  predictionDate: Date;
  
  // Model Information
  modelId: string;
  modelVersion: string;
  
  // Input Features
  inputFeatures: PredictionFeature[];
  
  // Explanation
  explanation: PredictionExplanation;
  
  // Validation
  validationScore: number;
  accuracy: number;
}

export interface ModelPerformance {
  modelId: string;
  
  // Accuracy Metrics
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  
  // Error Metrics
  meanAbsoluteError: number;
  meanSquaredError: number;
  rootMeanSquaredError: number;
  
  // Validation Metrics
  crossValidationScore: number;
  holdoutValidationScore: number;
  
  // Model Stability
  stabilityScore: number;
  driftScore: number;
  
  // Feature Performance
  featureStability: FeatureStabilityMetric[];
}

// ============================================================================
// ENUM DEFINITIONS
// ============================================================================

export enum ComprehensiveAnalyticsType {
  ENTERPRISE_OVERVIEW = 'ENTERPRISE_OVERVIEW',
  CROSS_SYSTEM = 'CROSS_SYSTEM',
  PREDICTIVE = 'PREDICTIVE',
  BENCHMARKING = 'BENCHMARKING',
  CUSTOM = 'CUSTOM'
}

export enum MetricType {
  USAGE = 'USAGE',
  PERFORMANCE = 'PERFORMANCE',
  QUALITY = 'QUALITY',
  BUSINESS = 'BUSINESS',
  TECHNICAL = 'TECHNICAL',
  COMPLIANCE = 'COMPLIANCE'
}

export enum AggregationType {
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  MEDIAN = 'MEDIAN',
  PERCENTILE = 'PERCENTILE'
}

export enum EnterpriseMetricCategory {
  OPERATIONAL = 'OPERATIONAL',
  FINANCIAL = 'FINANCIAL',
  STRATEGIC = 'STRATEGIC',
  COMPLIANCE = 'COMPLIANCE',
  INNOVATION = 'INNOVATION',
  CUSTOMER = 'CUSTOMER'
}

export enum PredictiveModelType {
  REGRESSION = 'REGRESSION',
  CLASSIFICATION = 'CLASSIFICATION',
  TIME_SERIES = 'TIME_SERIES',
  CLUSTERING = 'CLUSTERING',
  ANOMALY_DETECTION = 'ANOMALY_DETECTION',
  RECOMMENDATION = 'RECOMMENDATION'
}

export enum AdvancedInsightType {
  TREND_ANALYSIS = 'TREND_ANALYSIS',
  PATTERN_DETECTION = 'PATTERN_DETECTION',
  ANOMALY_DETECTION = 'ANOMALY_DETECTION',
  CORRELATION_ANALYSIS = 'CORRELATION_ANALYSIS',
  CAUSAL_ANALYSIS = 'CAUSAL_ANALYSIS',
  OPTIMIZATION = 'OPTIMIZATION',
  FORECASTING = 'FORECASTING'
}

export enum BenchmarkType {
  INDUSTRY = 'INDUSTRY',
  PEER = 'PEER',
  INTERNAL = 'INTERNAL',
  BEST_PRACTICE = 'BEST_PRACTICE',
  HISTORICAL = 'HISTORICAL'
}

export enum TrendType {
  USAGE = 'USAGE',
  PERFORMANCE = 'PERFORMANCE',
  QUALITY = 'QUALITY',
  ENGAGEMENT = 'ENGAGEMENT',
  BUSINESS_VALUE = 'BUSINESS_VALUE'
}

export enum TrendDirection {
  INCREASING = 'INCREASING',
  DECREASING = 'DECREASING',
  STABLE = 'STABLE',
  VOLATILE = 'VOLATILE',
  CYCLICAL = 'CYCLICAL'
}

export enum TrendStrength {
  WEAK = 'WEAK',
  MODERATE = 'MODERATE',
  STRONG = 'STRONG',
  VERY_STRONG = 'VERY_STRONG'
}

export enum PredictionType {
  USAGE_FORECAST = 'USAGE_FORECAST',
  QUALITY_FORECAST = 'QUALITY_FORECAST',
  DEMAND_FORECAST = 'DEMAND_FORECAST',
  RISK_PREDICTION = 'RISK_PREDICTION',
  PERFORMANCE_PREDICTION = 'PERFORMANCE_PREDICTION',
  BEHAVIOR_PREDICTION = 'BEHAVIOR_PREDICTION'
}

export enum InsightCategory {
  OPERATIONAL = 'OPERATIONAL',
  STRATEGIC = 'STRATEGIC',
  TACTICAL = 'TACTICAL',
  DIAGNOSTIC = 'DIAGNOSTIC',
  PRESCRIPTIVE = 'PRESCRIPTIVE',
  PREDICTIVE = 'PREDICTIVE'
}

export enum InsightPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum InsightImpact {
  MINIMAL = 'MINIMAL',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  TRANSFORMATIONAL = 'TRANSFORMATIONAL'
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface AnalyticsWidget {
  id: string;
  type: AnalyticsWidgetType;
  title: string;
  configuration: WidgetConfiguration;
  data: WidgetData;
  position: WidgetPosition;
  size: WidgetSize;
}

export interface AnalyticsFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  enabled: boolean;
}

export interface TrendDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  context?: Record<string, any>;
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  confidence: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  description?: string;
}

export interface SystemSource {
  systemId: string;
  systemName: string;
  weight: number;
}

export interface MetricBreakdown {
  category: string;
  value: number;
  percentage: number;
}

export interface KPIThreshold {
  warningThreshold: number;
  criticalThreshold: number;
  targetThreshold: number;
}

export interface BusinessContext {
  department: string;
  businessUnit: string;
  strategic: boolean;
  priority: number;
}

export interface MetricAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  triggeredAt: Date;
}

export enum AnalyticsWidgetType {
  LINE_CHART = 'LINE_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  METRIC_CARD = 'METRIC_CARD',
  TABLE = 'TABLE',
  HEATMAP = 'HEATMAP',
  GAUGE = 'GAUGE',
  PROGRESS_BAR = 'PROGRESS_BAR'
}

export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  IN = 'IN',
  BETWEEN = 'BETWEEN'
}

export enum AlertType {
  THRESHOLD = 'THRESHOLD',
  ANOMALY = 'ANOMALY',
  TREND = 'TREND',
  PERFORMANCE = 'PERFORMANCE'
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}