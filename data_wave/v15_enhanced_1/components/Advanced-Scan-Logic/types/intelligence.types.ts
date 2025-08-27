// Advanced-Scan-Logic/types/intelligence.types.ts
// Comprehensive intelligence types aligned with backend scan_intelligence_models.py

export interface ScanIntelligenceInsight {
  id: string;
  scan_id: string;
  insight_type: IntelligenceInsightType;
  category: IntelligenceCategory;
  severity: IntelligenceSeverity;
  confidence_score: number;
  title: string;
  description: string;
  recommendation: string;
  impact_assessment: ImpactAssessment;
  evidence: IntelligenceEvidence[];
  metadata: IntelligenceMetadata;
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  status: IntelligenceStatus;
  feedback: IntelligenceFeedback[];
  related_insights: string[];
  action_items: IntelligenceActionItem[];
  business_context: BusinessContext;
  technical_context: TechnicalContext;
}

export enum IntelligenceInsightType {
  ANOMALY_DETECTION = 'anomaly_detection',
  PATTERN_RECOGNITION = 'pattern_recognition',
  TREND_ANALYSIS = 'trend_analysis',
  PREDICTIVE_ANALYSIS = 'predictive_analysis',
  CORRELATION_ANALYSIS = 'correlation_analysis',
  BEHAVIORAL_ANALYSIS = 'behavioral_analysis',
  PERFORMANCE_ANALYSIS = 'performance_analysis',
  SECURITY_ANALYSIS = 'security_analysis',
  QUALITY_ANALYSIS = 'quality_analysis',
  COMPLIANCE_ANALYSIS = 'compliance_analysis',
  RISK_ANALYSIS = 'risk_analysis',
  OPTIMIZATION_OPPORTUNITY = 'optimization_opportunity',
  RESOURCE_ANALYSIS = 'resource_analysis',
  COST_ANALYSIS = 'cost_analysis',
  CAPACITY_ANALYSIS = 'capacity_analysis',
  EFFICIENCY_ANALYSIS = 'efficiency_analysis'
}

export enum IntelligenceCategory {
  DATA_QUALITY = 'data_quality',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  COMPLIANCE = 'compliance',
  OPERATIONS = 'operations',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  STRATEGIC = 'strategic',
  TACTICAL = 'tactical'
}

export enum IntelligenceSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

export enum IntelligenceStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  ESCALATED = 'escalated',
  ARCHIVED = 'archived'
}

export interface PatternRecognitionResult {
  id: string;
  scan_id: string;
  pattern_type: PatternType;
  pattern_name: string;
  pattern_description: string;
  confidence_score: number;
  frequency: number;
  first_detected: string;
  last_detected: string;
  occurrences: PatternOccurrence[];
  statistical_significance: number;
  correlation_strength: number;
  related_patterns: RelatedPattern[];
  business_impact: PatternBusinessImpact;
  recommendations: PatternRecommendation[];
  validation_status: PatternValidationStatus;
  metadata: PatternMetadata;
}

export enum PatternType {
  DATA_USAGE = 'data_usage',
  ACCESS_PATTERN = 'access_pattern',
  TEMPORAL_PATTERN = 'temporal_pattern',
  STRUCTURAL_PATTERN = 'structural_pattern',
  BEHAVIORAL_PATTERN = 'behavioral_pattern',
  PERFORMANCE_PATTERN = 'performance_pattern',
  ERROR_PATTERN = 'error_pattern',
  SECURITY_PATTERN = 'security_pattern',
  COMPLIANCE_PATTERN = 'compliance_pattern',
  QUALITY_PATTERN = 'quality_pattern',
  CORRELATION_PATTERN = 'correlation_pattern',
  ANOMALY_PATTERN = 'anomaly_pattern',
  TREND_PATTERN = 'trend_pattern',
  SEASONAL_PATTERN = 'seasonal_pattern',
  CYCLIC_PATTERN = 'cyclic_pattern'
}

export interface AnomalyDetectionResult {
  id: string;
  scan_id: string;
  anomaly_type: AnomalyType;
  severity: AnomalySeverity;
  detection_method: DetectionMethod;
  confidence_score: number;
  anomaly_score: number;
  detected_at: string;
  duration_minutes?: number;
  affected_entities: AffectedEntity[];
  baseline_comparison: BaselineComparison;
  statistical_measures: StatisticalMeasures;
  contextual_information: ContextualInformation;
  root_cause_analysis: RootCauseAnalysis;
  impact_assessment: AnomalyImpactAssessment;
  remediation_suggestions: RemediationSuggestion[];
  false_positive_probability: number;
  investigation_notes: InvestigationNote[];
}

export enum AnomalyType {
  STATISTICAL_OUTLIER = 'statistical_outlier',
  BEHAVIORAL_ANOMALY = 'behavioral_anomaly',
  PERFORMANCE_ANOMALY = 'performance_anomaly',
  SECURITY_ANOMALY = 'security_anomaly',
  QUALITY_ANOMALY = 'quality_anomaly',
  VOLUME_ANOMALY = 'volume_anomaly',
  PATTERN_DEVIATION = 'pattern_deviation',
  TREND_BREAK = 'trend_break',
  SEASONAL_ANOMALY = 'seasonal_anomaly',
  CORRELATION_ANOMALY = 'correlation_anomaly',
  THRESHOLD_VIOLATION = 'threshold_violation',
  STRUCTURAL_ANOMALY = 'structural_anomaly',
  TEMPORAL_ANOMALY = 'temporal_anomaly',
  CONTEXTUAL_ANOMALY = 'contextual_anomaly'
}

export enum AnomalySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  NEGLIGIBLE = 'negligible'
}

export enum DetectionMethod {
  STATISTICAL_ANALYSIS = 'statistical_analysis',
  MACHINE_LEARNING = 'machine_learning',
  DEEP_LEARNING = 'deep_learning',
  RULE_BASED = 'rule_based',
  HYBRID_APPROACH = 'hybrid_approach',
  TIME_SERIES_ANALYSIS = 'time_series_analysis',
  CLUSTERING_ANALYSIS = 'clustering_analysis',
  ISOLATION_FOREST = 'isolation_forest',
  ONE_CLASS_SVM = 'one_class_svm',
  AUTOENCODER = 'autoencoder',
  LSTM_NETWORKS = 'lstm_networks',
  ENSEMBLE_METHODS = 'ensemble_methods'
}

export interface PredictiveModel {
  id: string;
  name: string;
  model_type: PredictiveModelType;
  algorithm: MLAlgorithm;
  version: string;
  training_data_period: TimePeriod;
  features: ModelFeature[];
  performance_metrics: ModelPerformanceMetrics;
  confidence_intervals: ConfidenceInterval[];
  predictions: Prediction[];
  model_drift_analysis: ModelDriftAnalysis;
  explainability_report: ExplainabilityReport;
  validation_results: ValidationResults;
  deployment_status: DeploymentStatus;
  last_trained: string;
  next_training_scheduled: string;
  business_value_metrics: BusinessValueMetrics;
}

export enum PredictiveModelType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  TIME_SERIES = 'time_series',
  CLUSTERING = 'clustering',
  REINFORCEMENT_LEARNING = 'reinforcement_learning',
  ENSEMBLE = 'ensemble',
  DEEP_LEARNING = 'deep_learning',
  NEURAL_NETWORK = 'neural_network',
  DECISION_TREE = 'decision_tree',
  RANDOM_FOREST = 'random_forest',
  GRADIENT_BOOSTING = 'gradient_boosting',
  SVM = 'svm',
  NAIVE_BAYES = 'naive_bayes',
  LINEAR_MODEL = 'linear_model',
  LOGISTIC_REGRESSION = 'logistic_regression'
}

export enum MLAlgorithm {
  LINEAR_REGRESSION = 'linear_regression',
  LOGISTIC_REGRESSION = 'logistic_regression',
  DECISION_TREE = 'decision_tree',
  RANDOM_FOREST = 'random_forest',
  GRADIENT_BOOSTING = 'gradient_boosting',
  XG_BOOST = 'xg_boost',
  LIGHT_GBM = 'light_gbm',
  CATBOOST = 'catboost',
  SVM = 'svm',
  KNN = 'knn',
  NAIVE_BAYES = 'naive_bayes',
  NEURAL_NETWORK = 'neural_network',
  CNN = 'cnn',
  RNN = 'rnn',
  LSTM = 'lstm',
  GRU = 'gru',
  TRANSFORMER = 'transformer',
  AUTOENCODER = 'autoencoder',
  GAN = 'gan',
  REINFORCEMENT_LEARNING = 'reinforcement_learning'
}

export interface BehavioralAnalysis {
  id: string;
  entity_id: string;
  entity_type: EntityType;
  analysis_period: TimePeriod;
  behavior_patterns: BehaviorPattern[];
  baseline_behavior: BaselineBehavior;
  deviation_analysis: DeviationAnalysis;
  trend_analysis: BehaviorTrendAnalysis;
  segmentation_analysis: SegmentationAnalysis;
  interaction_patterns: InteractionPattern[];
  risk_indicators: RiskIndicator[];
  compliance_indicators: ComplianceIndicator[];
  performance_indicators: PerformanceIndicator[];
  recommendations: BehavioralRecommendation[];
  insights: BehavioralInsight[];
}

export enum EntityType {
  USER = 'user',
  SYSTEM = 'system',
  APPLICATION = 'application',
  DATA_SOURCE = 'data_source',
  PROCESS = 'process',
  WORKFLOW = 'workflow',
  RESOURCE = 'resource',
  TRANSACTION = 'transaction',
  SESSION = 'session',
  REQUEST = 'request'
}

export interface ThreatDetection {
  id: string;
  threat_type: ThreatType;
  severity: ThreatSeverity;
  confidence_score: number;
  detection_time: string;
  detection_method: ThreatDetectionMethod;
  affected_assets: AffectedAsset[];
  attack_vector: AttackVector;
  threat_indicators: ThreatIndicator[];
  intelligence_sources: IntelligenceSource[];
  mitigation_strategies: MitigationStrategy[];
  response_actions: ResponseAction[];
  forensic_evidence: ForensicEvidence[];
  attribution_analysis: AttributionAnalysis;
  impact_assessment: ThreatImpactAssessment;
  containment_status: ContainmentStatus;
  investigation_status: InvestigationStatus;
}

export enum ThreatType {
  MALWARE = 'malware',
  PHISHING = 'phishing',
  RANSOMWARE = 'ransomware',
  DATA_BREACH = 'data_breach',
  INSIDER_THREAT = 'insider_threat',
  APT = 'apt',
  DDoS = 'ddos',
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_EXFILTRATION = 'data_exfiltration',
  SOCIAL_ENGINEERING = 'social_engineering',
  SUPPLY_CHAIN_ATTACK = 'supply_chain_attack',
  ZERO_DAY = 'zero_day',
  BOTNET = 'botnet',
  CRYPTOJACKING = 'cryptojacking'
}

export enum ThreatSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

export enum ThreatDetectionMethod {
  SIGNATURE_BASED = 'signature_based',
  BEHAVIOR_BASED = 'behavior_based',
  ANOMALY_DETECTION = 'anomaly_detection',
  MACHINE_LEARNING = 'machine_learning',
  THREAT_INTELLIGENCE = 'threat_intelligence',
  HEURISTIC_ANALYSIS = 'heuristic_analysis',
  SANDBOXING = 'sandboxing',
  NETWORK_ANALYSIS = 'network_analysis',
  FILE_ANALYSIS = 'file_analysis',
  REPUTATION_ANALYSIS = 'reputation_analysis',
  CORRELATION_ANALYSIS = 'correlation_analysis'
}

export interface ContextualIntelligence {
  id: string;
  context_type: ContextType;
  context_scope: ContextScope;
  context_data: ContextData;
  relevance_score: number;
  temporal_context: TemporalContext;
  spatial_context: SpatialContext;
  business_context: BusinessContext;
  technical_context: TechnicalContext;
  environmental_context: EnvironmentalContext;
  user_context: UserContext;
  system_context: SystemContext;
  relationships: ContextualRelationship[];
  inferences: ContextualInference[];
  recommendations: ContextualRecommendation[];
}

export enum ContextType {
  TEMPORAL = 'temporal',
  SPATIAL = 'spatial',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  ENVIRONMENTAL = 'environmental',
  USER = 'user',
  SYSTEM = 'system',
  OPERATIONAL = 'operational',
  REGULATORY = 'regulatory',
  ORGANIZATIONAL = 'organizational'
}

export enum ContextScope {
  GLOBAL = 'global',
  REGIONAL = 'regional',
  ORGANIZATIONAL = 'organizational',
  DEPARTMENTAL = 'departmental',
  PROJECT = 'project',
  SYSTEM = 'system',
  APPLICATION = 'application',
  USER = 'user',
  SESSION = 'session',
  TRANSACTION = 'transaction'
}

export interface IntelligenceReport {
  id: string;
  report_type: IntelligenceReportType;
  title: string;
  description: string;
  generated_at: string;
  generated_by: string;
  report_period: TimePeriod;
  executive_summary: ExecutiveSummary;
  key_findings: KeyFinding[];
  insights: ReportInsight[];
  recommendations: ReportRecommendation[];
  risk_assessment: RiskAssessment;
  trend_analysis: TrendAnalysis;
  comparative_analysis: ComparativeAnalysis;
  predictive_analysis: PredictiveAnalysis;
  impact_analysis: ImpactAnalysis;
  action_plan: ActionPlan;
  appendices: ReportAppendix[];
  metadata: ReportMetadata;
  distribution_list: string[];
  classification: ReportClassification;
}

export enum IntelligenceReportType {
  OPERATIONAL = 'operational',
  STRATEGIC = 'strategic',
  TACTICAL = 'tactical',
  TECHNICAL = 'technical',
  EXECUTIVE = 'executive',
  INCIDENT = 'incident',
  THREAT = 'threat',
  VULNERABILITY = 'vulnerability',
  COMPLIANCE = 'compliance',
  PERFORMANCE = 'performance',
  QUALITY = 'quality',
  RISK = 'risk',
  TREND = 'trend',
  FORECAST = 'forecast',
  COMPARATIVE = 'comparative'
}

// API Request/Response types
export interface IntelligenceAnalysisRequest {
  scan_ids?: string[];
  analysis_types: IntelligenceInsightType[];
  time_period?: TimePeriod;
  confidence_threshold?: number;
  include_predictions?: boolean;
  include_recommendations?: boolean;
  custom_parameters?: Record<string, any>;
}

export interface IntelligenceAnalysisResponse {
  insights: ScanIntelligenceInsight[];
  patterns: PatternRecognitionResult[];
  anomalies: AnomalyDetectionResult[];
  predictions: PredictiveModel[];
  behavioral_analysis: BehavioralAnalysis[];
  threats: ThreatDetection[];
  contextual_intelligence: ContextualIntelligence[];
  summary: AnalysisSummary;
  recommendations: IntelligenceRecommendation[];
  metadata: ResponseMetadata;
}

export interface IntelligenceMetrics {
  total_insights_generated: number;
  critical_insights_count: number;
  patterns_detected: number;
  anomalies_detected: number;
  threats_identified: number;
  predictions_made: number;
  accuracy_metrics: AccuracyMetrics;
  performance_metrics: IntelligencePerformanceMetrics;
  business_impact_metrics: BusinessImpactMetrics;
  user_engagement_metrics: UserEngagementMetrics;
}

export interface IntelligenceConfiguration {
  enabled_analysis_types: IntelligenceInsightType[];
  confidence_thresholds: Record<IntelligenceInsightType, number>;
  real_time_analysis: boolean;
  batch_analysis_schedule: string;
  model_update_frequency: string;
  data_retention_days: number;
  privacy_settings: PrivacySettings;
  notification_settings: IntelligenceNotificationSettings;
  integration_settings: IntegrationSettings;
  advanced_settings: AdvancedIntelligenceSettings;
}

// Supporting interfaces
export interface ImpactAssessment {
  business_impact: BusinessImpact;
  technical_impact: TechnicalImpact;
  financial_impact: FinancialImpact;
  operational_impact: OperationalImpact;
  compliance_impact: ComplianceImpact;
  security_impact: SecurityImpact;
  overall_impact_score: number;
}

export interface IntelligenceEvidence {
  evidence_type: EvidenceType;
  source: string;
  data: any;
  weight: number;
  reliability_score: number;
  timestamp: string;
}

export enum EvidenceType {
  STATISTICAL = 'statistical',
  OBSERVATIONAL = 'observational',
  COMPARATIVE = 'comparative',
  HISTORICAL = 'historical',
  PREDICTIVE = 'predictive',
  EXPERT_OPINION = 'expert_opinion',
  AUTOMATED_ANALYSIS = 'automated_analysis',
  MANUAL_ANALYSIS = 'manual_analysis'
}

export interface IntelligenceMetadata {
  data_sources: string[];
  analysis_methods: string[];
  processing_time_ms: number;
  data_quality_score: number;
  model_versions: Record<string, string>;
  feature_importance: Record<string, number>;
  uncertainty_measures: UncertaintyMeasures;
}

export interface IntelligenceFeedback {
  id: string;
  user_id: string;
  feedback_type: FeedbackType;
  rating: number;
  comments?: string;
  accuracy_rating?: number;
  usefulness_rating?: number;
  actionability_rating?: number;
  provided_at: string;
}

export enum FeedbackType {
  ACCURACY = 'accuracy',
  USEFULNESS = 'usefulness',
  ACTIONABILITY = 'actionability',
  RELEVANCE = 'relevance',
  CLARITY = 'clarity',
  COMPLETENESS = 'completeness',
  TIMELINESS = 'timeliness',
  GENERAL = 'general'
}

export interface IntelligenceActionItem {
  id: string;
  title: string;
  description: string;
  priority: ActionItemPriority;
  category: ActionItemCategory;
  assigned_to?: string;
  due_date?: string;
  status: ActionItemStatus;
  estimated_effort: number;
  dependencies: string[];
  resources_required: string[];
  success_criteria: string[];
}

export enum ActionItemPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ActionItemCategory {
  IMMEDIATE_ACTION = 'immediate_action',
  INVESTIGATION = 'investigation',
  REMEDIATION = 'remediation',
  OPTIMIZATION = 'optimization',
  MONITORING = 'monitoring',
  REPORTING = 'reporting',
  TRAINING = 'training',
  PROCESS_IMPROVEMENT = 'process_improvement'
}

export enum ActionItemStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export interface TimePeriod {
  start_date: string;
  end_date: string;
  timezone: string;
  granularity: TimeGranularity;
}

export enum TimeGranularity {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

// Type aliases for component compatibility
export type InsightCategory = IntelligenceCategory;
export type InsightPriority = ActionItemPriority;
export type InsightType = IntelligenceInsightType;
export type InsightStatus = IntelligenceStatus;
export type PredictionType = PredictiveModelType;
export type ModelType = PredictiveModelType;

// Enum definitions for component compatibility
export enum InsightCategory {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  OPERATIONAL = 'operational',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  COMPLIANCE = 'compliance',
  QUALITY = 'quality',
  EFFICIENCY = 'efficiency',
  INNOVATION = 'innovation',
  RISK = 'risk'
}

export enum InsightPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum InsightType {
  ANOMALY = 'anomaly',
  TREND = 'trend',
  PATTERN = 'pattern',
  CORRELATION = 'correlation',
  PREDICTION = 'prediction',
  RECOMMENDATION = 'recommendation',
  ALERT = 'alert',
  INSIGHT = 'insight',
  FORECAST = 'forecast',
  OPTIMIZATION = 'optimization'
}

export enum InsightStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum PredictionType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  CLUSTERING = 'clustering',
  ANOMALY_DETECTION = 'anomaly_detection',
  FORECASTING = 'forecasting',
  RECOMMENDATION = 'recommendation',
  OPTIMIZATION = 'optimization',
  PATTERN_RECOGNITION = 'pattern_recognition'
}

export enum ModelType {
  SUPERVISED = 'supervised',
  UNSUPERVISED = 'unsupervised',
  REINFORCEMENT = 'reinforcement',
  DEEP_LEARNING = 'deep_learning',
  ENSEMBLE = 'ensemble',
  TRANSFER_LEARNING = 'transfer_learning',
  FEDERATED = 'federated',
  ONLINE_LEARNING = 'online_learning'
}

// Missing enum types
export enum TimeHorizon {
  SHORT_TERM = 'short_term',
  MEDIUM_TERM = 'medium_term',
  LONG_TERM = 'long_term',
  IMMEDIATE = 'immediate',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum ModelStatus {
  DRAFT = 'draft',
  TRAINING = 'training',
  VALIDATION = 'validation',
  DEPLOYED = 'deployed',
  DEPRECATED = 'deprecated',
  FAILED = 'failed',
  ARCHIVED = 'archived',
  UPDATING = 'updating',
  TESTING = 'testing',
  PRODUCTION = 'production'
}

// API Error type for service compatibility
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  request_id?: string;
}