// ============================================================================
// ADVANCED SCAN RULE SETS - INTELLIGENCE TYPE DEFINITIONS
// ============================================================================

import { 
  MLModel,
  PatternRecognition,
  PredictiveInsights,
  PerformanceMetrics
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
// INTELLIGENCE ENGINE TYPES
// ============================================================================

export interface IntelligenceEngine {
  id: string;
  name: string;
  version: string;
  engine_type: 'ai_powered' | 'ml_based' | 'rule_based' | 'hybrid' | 'neural_network';
  status: 'active' | 'inactive' | 'training' | 'learning' | 'error';
  capabilities: IntelligenceCapability[];
  ml_models: IntelligenceMLModel[];
  knowledge_base: KnowledgeBase;
  performance_metrics: IntelligenceEngineMetrics;
  configuration: IntelligenceEngineConfig;
}

export interface IntelligenceCapability {
  capability_name: string;
  type: 'pattern_recognition' | 'anomaly_detection' | 'predictive_analysis' | 'semantic_analysis' | 'recommendation' | 'classification';
  enabled: boolean;
  confidence_threshold: number;
  accuracy_score: number;
  supported_data_types: string[];
  processing_modes: string[];
  real_time_capable: boolean;
}

export interface IntelligenceMLModel {
  model_id: string;
  name: string;
  model_type: 'supervised' | 'unsupervised' | 'reinforcement' | 'deep_learning' | 'ensemble';
  algorithm: string;
  version: string;
  training_status: 'untrained' | 'training' | 'trained' | 'deployed' | 'deprecated';
  performance_metrics: ModelPerformanceMetrics;
  training_data: TrainingDataInfo;
  deployment_info: ModelDeploymentInfo;
  model_artifacts: ModelArtifacts;
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  confusion_matrix: number[][];
  cross_validation_score: number;
  training_loss: number;
  validation_loss: number;
  overfitting_score: number;
  feature_importance: FeatureImportance[];
}

export interface FeatureImportance {
  feature_name: string;
  importance_score: number;
  rank: number;
  feature_type: 'numerical' | 'categorical' | 'text' | 'temporal' | 'spatial';
  correlation_with_target: number;
}

export interface TrainingDataInfo {
  dataset_id: string;
  dataset_name: string;
  total_samples: number;
  training_samples: number;
  validation_samples: number;
  test_samples: number;
  feature_count: number;
  data_quality_score: number;
  last_updated: string;
  data_sources: string[];
}

export interface ModelDeploymentInfo {
  deployment_id: string;
  deployment_environment: 'development' | 'staging' | 'production';
  deployment_date: string;
  deployment_status: 'deploying' | 'deployed' | 'failed' | 'rollback';
  endpoint_url?: string;
  resource_allocation: ModelResourceAllocation;
  scaling_config: ModelScalingConfig;
  monitoring_config: ModelMonitoringConfig;
}

export interface ModelResourceAllocation {
  cpu_cores: number;
  memory_gb: number;
  gpu_units?: number;
  storage_gb: number;
  network_bandwidth_mbps: number;
  estimated_cost_per_hour: number;
}

export interface ModelScalingConfig {
  auto_scaling_enabled: boolean;
  min_instances: number;
  max_instances: number;
  target_cpu_utilization: number;
  scale_up_threshold: number;
  scale_down_threshold: number;
  cooldown_period_minutes: number;
}

export interface ModelMonitoringConfig {
  performance_monitoring: boolean;
  drift_detection: boolean;
  bias_monitoring: boolean;
  explainability_tracking: boolean;
  alert_thresholds: ModelAlertThreshold[];
  monitoring_frequency: string;
}

export interface ModelAlertThreshold {
  metric_name: string;
  threshold_value: number;
  comparison_operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  severity: 'info' | 'warning' | 'critical';
  notification_channels: string[];
}

export interface ModelArtifacts {
  model_binary_path: string;
  model_config_path: string;
  feature_schema_path: string;
  preprocessing_pipeline_path: string;
  model_metadata_path: string;
  model_size_mb: number;
  checksum: string;
  creation_timestamp: string;
}

export interface KnowledgeBase {
  knowledge_base_id: string;
  name: string;
  version: string;
  knowledge_domains: KnowledgeDomain[];
  ontologies: Ontology[];
  rules_engine: RulesEngine;
  semantic_network: SemanticNetwork;
  learning_mechanisms: LearningMechanism[];
}

export interface KnowledgeDomain {
  domain_id: string;
  domain_name: string;
  description: string;
  concepts: Concept[];
  relationships: Relationship[];
  expertise_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  confidence_score: number;
  last_updated: string;
}

export interface Concept {
  concept_id: string;
  name: string;
  definition: string;
  synonyms: string[];
  related_concepts: string[];
  concept_type: 'entity' | 'attribute' | 'process' | 'event' | 'rule';
  confidence_level: number;
  usage_frequency: number;
}

export interface Relationship {
  relationship_id: string;
  relationship_type: 'is_a' | 'part_of' | 'causes' | 'enables' | 'requires' | 'similar_to' | 'opposite_of';
  source_concept: string;
  target_concept: string;
  strength: number;
  confidence: number;
  bidirectional: boolean;
  context: string[];
}

export interface Ontology {
  ontology_id: string;
  name: string;
  version: string;
  namespace: string;
  classes: OntologyClass[];
  properties: OntologyProperty[];
  individuals: OntologyIndividual[];
  axioms: OntologyAxiom[];
  import_statements: string[];
}

export interface OntologyClass {
  class_id: string;
  class_name: string;
  parent_classes: string[];
  child_classes: string[];
  properties: string[];
  restrictions: ClassRestriction[];
  annotations: Record<string, any>;
}

export interface ClassRestriction {
  restriction_type: 'cardinality' | 'value' | 'existential' | 'universal';
  property: string;
  constraint: any;
  description: string;
}

export interface OntologyProperty {
  property_id: string;
  property_name: string;
  property_type: 'object_property' | 'data_property' | 'annotation_property';
  domain: string[];
  range: string[];
  characteristics: PropertyCharacteristic[];
  inverse_property?: string;
}

export interface PropertyCharacteristic {
  characteristic: 'functional' | 'inverse_functional' | 'transitive' | 'symmetric' | 'asymmetric' | 'reflexive' | 'irreflexive';
  description: string;
}

export interface OntologyIndividual {
  individual_id: string;
  individual_name: string;
  class_assertions: string[];
  property_assertions: PropertyAssertion[];
  same_as: string[];
  different_from: string[];
}

export interface PropertyAssertion {
  property: string;
  value: any;
  value_type: 'individual' | 'literal' | 'datatype';
}

export interface OntologyAxiom {
  axiom_id: string;
  axiom_type: 'class_axiom' | 'property_axiom' | 'individual_axiom' | 'datatype_axiom';
  axiom_expression: string;
  logical_strength: 'necessary' | 'sufficient' | 'necessary_and_sufficient';
  confidence: number;
}

export interface RulesEngine {
  engine_id: string;
  name: string;
  rule_sets: IntelligenceRuleSet[];
  inference_engine: InferenceEngine;
  conflict_resolution: ConflictResolution;
  execution_strategy: ExecutionStrategy;
  performance_metrics: RulesEngineMetrics;
}

export interface IntelligenceRuleSet {
  rule_set_id: string;
  name: string;
  rules: IntelligenceRule[];
  priority: number;
  enabled: boolean;
  activation_conditions: string[];
  deactivation_conditions: string[];
  execution_count: number;
  success_rate: number;
}

export interface IntelligenceRule {
  rule_id: string;
  rule_name: string;
  rule_type: 'production_rule' | 'inference_rule' | 'constraint_rule' | 'heuristic_rule';
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  confidence: number;
  certainty_factor: number;
  activation_count: number;
  success_rate: number;
}

export interface RuleCondition {
  condition_id: string;
  condition_type: 'fact' | 'pattern' | 'comparison' | 'logical' | 'temporal';
  expression: string;
  variables: RuleVariable[];
  negated: boolean;
  weight: number;
}

export interface RuleVariable {
  variable_name: string;
  variable_type: 'bound' | 'unbound' | 'constant';
  data_type: string;
  constraints: VariableConstraint[];
  default_value?: any;
}

export interface VariableConstraint {
  constraint_type: 'range' | 'enum' | 'pattern' | 'custom';
  constraint_value: any;
  description: string;
}

export interface RuleAction {
  action_id: string;
  action_type: 'assert_fact' | 'retract_fact' | 'modify_fact' | 'execute_function' | 'send_message';
  action_expression: string;
  parameters: Record<string, any>;
  execution_order: number;
  rollback_action?: string;
}

export interface InferenceEngine {
  engine_type: 'forward_chaining' | 'backward_chaining' | 'mixed' | 'probabilistic';
  reasoning_strategy: 'depth_first' | 'breadth_first' | 'best_first' | 'a_star';
  uncertainty_handling: 'certainty_factors' | 'fuzzy_logic' | 'bayesian' | 'dempster_shafer';
  explanation_facility: ExplanationFacility;
  performance_settings: InferencePerformanceSettings;
}

export interface ExplanationFacility {
  enabled: boolean;
  explanation_types: string[];
  trace_execution: boolean;
  generate_justifications: boolean;
  explanation_depth: number;
  natural_language_explanations: boolean;
}

export interface InferencePerformanceSettings {
  max_inference_cycles: number;
  timeout_seconds: number;
  memory_limit_mb: number;
  parallel_processing: boolean;
  caching_enabled: boolean;
  optimization_level: 'none' | 'basic' | 'aggressive';
}

export interface ConflictResolution {
  strategy: 'specificity' | 'priority' | 'recency' | 'lex' | 'mea' | 'custom';
  tie_breaking: 'random' | 'first_match' | 'all_matches';
  conflict_detection: boolean;
  resolution_explanation: boolean;
}

export interface ExecutionStrategy {
  strategy_type: 'sequential' | 'parallel' | 'opportunistic' | 'goal_driven';
  batch_processing: boolean;
  incremental_processing: boolean;
  rollback_capability: boolean;
  transaction_support: boolean;
}

export interface RulesEngineMetrics {
  total_rules: number;
  active_rules: number;
  average_execution_time: number;
  rule_firing_rate: number;
  conflict_resolution_time: number;
  memory_usage: number;
  cache_hit_rate: number;
}

export interface SemanticNetwork {
  network_id: string;
  name: string;
  nodes: SemanticNode[];
  edges: SemanticEdge[];
  network_metrics: NetworkMetrics;
  traversal_algorithms: TraversalAlgorithm[];
  similarity_measures: SimilarityMeasure[];
}

export interface SemanticNode {
  node_id: string;
  node_type: 'concept' | 'instance' | 'property' | 'value';
  label: string;
  attributes: Record<string, any>;
  embeddings: number[];
  centrality_measures: CentralityMeasure[];
  activation_level: number;
}

export interface SemanticEdge {
  edge_id: string;
  source_node: string;
  target_node: string;
  edge_type: string;
  weight: number;
  confidence: number;
  directionality: 'directed' | 'undirected' | 'bidirectional';
  temporal_validity: TemporalValidity;
}

export interface TemporalValidity {
  valid_from: string;
  valid_to?: string;
  temporal_logic: 'always' | 'sometimes' | 'never' | 'eventually' | 'until';
}

export interface NetworkMetrics {
  node_count: number;
  edge_count: number;
  density: number;
  clustering_coefficient: number;
  average_path_length: number;
  diameter: number;
  modularity: number;
}

export interface CentralityMeasure {
  measure_type: 'degree' | 'betweenness' | 'closeness' | 'eigenvector' | 'pagerank';
  value: number;
  rank: number;
  percentile: number;
}

export interface TraversalAlgorithm {
  algorithm_name: string;
  algorithm_type: 'depth_first' | 'breadth_first' | 'dijkstra' | 'a_star' | 'random_walk';
  parameters: Record<string, any>;
  performance_metrics: AlgorithmPerformanceMetrics;
}

export interface AlgorithmPerformanceMetrics {
  average_execution_time: number;
  memory_usage: number;
  accuracy: number;
  completeness: number;
  scalability_factor: number;
}

export interface SimilarityMeasure {
  measure_name: string;
  measure_type: 'cosine' | 'euclidean' | 'jaccard' | 'semantic' | 'structural';
  parameters: Record<string, any>;
  threshold: number;
  performance_metrics: SimilarityPerformanceMetrics;
}

export interface SimilarityPerformanceMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  computation_time: number;
  scalability: number;
}

export interface LearningMechanism {
  mechanism_id: string;
  mechanism_type: 'supervised' | 'unsupervised' | 'reinforcement' | 'transfer' | 'meta' | 'continual';
  learning_algorithm: string;
  learning_rate: number;
  adaptation_strategy: AdaptationStrategy;
  knowledge_acquisition: KnowledgeAcquisition;
  forgetting_mechanism: ForgettingMechanism;
}

export interface AdaptationStrategy {
  strategy_type: 'incremental' | 'batch' | 'online' | 'active' | 'passive';
  adaptation_frequency: string;
  trigger_conditions: string[];
  adaptation_scope: 'local' | 'global' | 'selective';
  validation_method: string;
}

export interface KnowledgeAcquisition {
  acquisition_sources: string[];
  acquisition_methods: string[];
  quality_filters: QualityFilter[];
  integration_strategies: string[];
  validation_procedures: string[];
}

export interface QualityFilter {
  filter_name: string;
  filter_type: 'relevance' | 'accuracy' | 'completeness' | 'consistency' | 'timeliness';
  threshold: number;
  weight: number;
  enabled: boolean;
}

export interface ForgettingMechanism {
  forgetting_enabled: boolean;
  forgetting_strategy: 'decay' | 'interference' | 'capacity_based' | 'relevance_based';
  forgetting_rate: number;
  retention_criteria: string[];
  memory_consolidation: boolean;
}

// ============================================================================
// PATTERN RECOGNITION TYPES
// ============================================================================

export interface PatternRecognitionEngine {
  engine_id: string;
  name: string;
  recognition_algorithms: RecognitionAlgorithm[];
  pattern_libraries: PatternLibrary[];
  detection_results: PatternDetectionResult[];
  performance_metrics: PatternRecognitionMetrics;
  configuration: PatternRecognitionConfig;
}

export interface RecognitionAlgorithm {
  algorithm_id: string;
  algorithm_name: string;
  algorithm_type: 'statistical' | 'neural_network' | 'template_matching' | 'feature_based' | 'hybrid';
  input_types: string[];
  output_types: string[];
  accuracy_metrics: AlgorithmAccuracyMetrics;
  computational_complexity: ComputationalComplexity;
  training_requirements: TrainingRequirements;
}

export interface AlgorithmAccuracyMetrics {
  true_positive_rate: number;
  false_positive_rate: number;
  true_negative_rate: number;
  false_negative_rate: number;
  precision: number;
  recall: number;
  f1_score: number;
  matthews_correlation_coefficient: number;
}

export interface ComputationalComplexity {
  time_complexity: string;
  space_complexity: string;
  scalability_factor: number;
  parallel_processing_capability: boolean;
  hardware_requirements: HardwareRequirements;
}

export interface HardwareRequirements {
  min_cpu_cores: number;
  min_memory_gb: number;
  gpu_required: boolean;
  min_gpu_memory_gb?: number;
  storage_requirements_gb: number;
  network_bandwidth_mbps: number;
}

export interface TrainingRequirements {
  training_data_size: number;
  training_time_estimate: string;
  retraining_frequency: string;
  transfer_learning_capable: boolean;
  incremental_learning_capable: boolean;
}

export interface PatternLibrary {
  library_id: string;
  library_name: string;
  pattern_categories: PatternCategory[];
  total_patterns: number;
  usage_statistics: LibraryUsageStatistics;
  maintenance_info: LibraryMaintenanceInfo;
}

export interface PatternCategory {
  category_id: string;
  category_name: string;
  description: string;
  patterns: Pattern[];
  category_metrics: CategoryMetrics;
  subcategories: string[];
}

export interface Pattern {
  pattern_id: string;
  pattern_name: string;
  pattern_type: 'sequence' | 'spatial' | 'temporal' | 'behavioral' | 'anomaly' | 'trend';
  description: string;
  pattern_definition: PatternDefinition;
  examples: PatternExample[];
  variations: PatternVariation[];
  detection_rules: DetectionRule[];
  confidence_threshold: number;
  usage_count: number;
  effectiveness_score: number;
}

export interface PatternDefinition {
  definition_type: 'rule_based' | 'template_based' | 'statistical' | 'ml_based';
  definition_content: any;
  parameters: PatternParameter[];
  constraints: PatternConstraint[];
  invariants: string[];
}

export interface PatternParameter {
  parameter_name: string;
  parameter_type: string;
  default_value: any;
  value_range: [any, any];
  description: string;
  sensitivity: number;
}

export interface PatternConstraint {
  constraint_name: string;
  constraint_type: 'hard' | 'soft' | 'preference';
  constraint_expression: string;
  violation_penalty: number;
  description: string;
}

export interface PatternExample {
  example_id: string;
  example_data: any;
  example_type: 'positive' | 'negative' | 'boundary';
  annotation: string;
  quality_score: number;
}

export interface PatternVariation {
  variation_id: string;
  variation_name: string;
  base_pattern: string;
  modifications: Modification[];
  occurrence_frequency: number;
  detection_difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
}

export interface Modification {
  modification_type: 'parameter_change' | 'structure_change' | 'noise_addition' | 'scaling' | 'rotation';
  modification_details: Record<string, any>;
  impact_on_detection: number;
}

export interface DetectionRule {
  rule_id: string;
  rule_expression: string;
  rule_type: 'threshold' | 'logical' | 'statistical' | 'ml_based';
  confidence_contribution: number;
  computational_cost: number;
  false_positive_rate: number;
}

export interface CategoryMetrics {
  pattern_count: number;
  average_detection_accuracy: number;
  usage_frequency: number;
  maintenance_cost: number;
  evolution_rate: number;
}

export interface LibraryUsageStatistics {
  total_queries: number;
  successful_matches: number;
  average_query_time: number;
  most_used_patterns: string[];
  pattern_effectiveness_ranking: PatternEffectivenessRanking[];
}

export interface PatternEffectivenessRanking {
  pattern_id: string;
  pattern_name: string;
  effectiveness_score: number;
  usage_count: number;
  accuracy: number;
  efficiency: number;
}

export interface LibraryMaintenanceInfo {
  last_updated: string;
  update_frequency: string;
  maintenance_schedule: MaintenanceSchedule[];
  quality_metrics: LibraryQualityMetrics;
  improvement_suggestions: string[];
}

export interface MaintenanceSchedule {
  maintenance_type: 'pattern_update' | 'library_cleanup' | 'performance_optimization' | 'quality_review';
  scheduled_date: string;
  estimated_duration: string;
  responsible_team: string;
  dependencies: string[];
}

export interface LibraryQualityMetrics {
  pattern_coverage: number;
  pattern_accuracy: number;
  pattern_consistency: number;
  documentation_completeness: number;
  test_coverage: number;
}

export interface PatternDetectionResult {
  detection_id: string;
  input_data_id: string;
  detected_patterns: DetectedPattern[];
  detection_timestamp: string;
  processing_time_ms: number;
  confidence_distribution: ConfidenceDistribution;
  anomalies_detected: AnomalyDetection[];
}

export interface DetectedPattern {
  pattern_id: string;
  pattern_name: string;
  confidence_score: number;
  location_info: LocationInfo;
  pattern_attributes: Record<string, any>;
  supporting_evidence: Evidence[];
  alternative_interpretations: AlternativeInterpretation[];
}

export interface LocationInfo {
  start_position: number;
  end_position: number;
  spatial_coordinates?: SpatialCoordinates;
  temporal_range?: TemporalRange;
  context_information: Record<string, any>;
}

export interface SpatialCoordinates {
  x: number;
  y: number;
  z?: number;
  coordinate_system: string;
  precision: number;
}

export interface TemporalRange {
  start_time: string;
  end_time: string;
  duration: number;
  time_zone: string;
  precision: string;
}

export interface Evidence {
  evidence_type: 'statistical' | 'structural' | 'contextual' | 'historical';
  evidence_strength: number;
  description: string;
  supporting_data: any;
  reliability_score: number;
}

export interface AlternativeInterpretation {
  interpretation_id: string;
  description: string;
  confidence_score: number;
  supporting_patterns: string[];
  likelihood_ratio: number;
}

export interface ConfidenceDistribution {
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
  average_confidence: number;
  confidence_variance: number;
  confidence_histogram: ConfidenceBin[];
}

export interface ConfidenceBin {
  bin_range: [number, number];
  count: number;
  percentage: number;
}

export interface AnomalyDetection {
  anomaly_id: string;
  anomaly_type: 'point' | 'contextual' | 'collective' | 'trend' | 'seasonal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  anomaly_score: number;
  location_info: LocationInfo;
  potential_causes: string[];
  recommended_actions: string[];
}

// ============================================================================
// PREDICTIVE ANALYTICS TYPES
// ============================================================================

export interface PredictiveAnalyticsEngine {
  engine_id: string;
  name: string;
  prediction_models: PredictionModel[];
  forecasting_algorithms: ForecastingAlgorithm[];
  prediction_results: PredictionResult[];
  performance_metrics: PredictiveAnalyticsMetrics;
  configuration: PredictiveAnalyticsConfig;
}

export interface PredictionModel {
  model_id: string;
  model_name: string;
  model_type: 'time_series' | 'regression' | 'classification' | 'clustering' | 'ensemble';
  prediction_horizon: string;
  target_variables: TargetVariable[];
  feature_variables: FeatureVariable[];
  model_performance: PredictionModelPerformance;
  training_info: ModelTrainingInfo;
  deployment_status: ModelDeploymentStatus;
}

export interface TargetVariable {
  variable_name: string;
  variable_type: 'continuous' | 'discrete' | 'categorical' | 'binary';
  prediction_type: 'point_prediction' | 'interval_prediction' | 'distribution_prediction';
  measurement_unit: string;
  value_range: [number, number];
  transformation_applied: string[];
}

export interface FeatureVariable {
  variable_name: string;
  variable_type: 'numerical' | 'categorical' | 'text' | 'temporal' | 'spatial';
  importance_score: number;
  correlation_with_target: number;
  missing_value_rate: number;
  feature_engineering: FeatureEngineering[];
}

export interface FeatureEngineering {
  transformation_type: 'scaling' | 'encoding' | 'binning' | 'polynomial' | 'interaction' | 'temporal';
  transformation_parameters: Record<string, any>;
  impact_on_model: number;
  computational_cost: number;
}

export interface PredictionModelPerformance {
  overall_accuracy: number;
  mean_absolute_error: number;
  mean_squared_error: number;
  root_mean_squared_error: number;
  mean_absolute_percentage_error: number;
  r_squared: number;
  cross_validation_scores: number[];
  prediction_intervals: PredictionInterval[];
  residual_analysis: ResidualAnalysis;
}

export interface PredictionInterval {
  confidence_level: number;
  lower_bound: number;
  upper_bound: number;
  interval_width: number;
  coverage_probability: number;
}

export interface ResidualAnalysis {
  residual_mean: number;
  residual_variance: number;
  residual_skewness: number;
  residual_kurtosis: number;
  autocorrelation_coefficients: number[];
  heteroscedasticity_test: HeteroscedasticityTest;
  normality_test: NormalityTest;
}

export interface HeteroscedasticityTest {
  test_name: string;
  test_statistic: number;
  p_value: number;
  critical_value: number;
  conclusion: 'homoscedastic' | 'heteroscedastic';
}

export interface NormalityTest {
  test_name: string;
  test_statistic: number;
  p_value: number;
  critical_value: number;
  conclusion: 'normal' | 'non_normal';
}

export interface ModelTrainingInfo {
  training_start_date: string;
  training_end_date: string;
  training_duration: string;
  training_data_size: number;
  validation_strategy: 'holdout' | 'k_fold' | 'time_series_split' | 'walk_forward';
  hyperparameter_tuning: HyperparameterTuning;
  feature_selection: FeatureSelection;
  model_selection: ModelSelection;
}

export interface HyperparameterTuning {
  tuning_method: 'grid_search' | 'random_search' | 'bayesian_optimization' | 'genetic_algorithm';
  parameter_space: ParameterSpace[];
  optimization_metric: string;
  cross_validation_folds: number;
  tuning_iterations: number;
  best_parameters: Record<string, any>;
  tuning_history: TuningIteration[];
}

export interface ParameterSpace {
  parameter_name: string;
  parameter_type: 'continuous' | 'discrete' | 'categorical';
  value_range: any[];
  distribution: string;
  scaling: string;
}

export interface TuningIteration {
  iteration_number: number;
  parameters: Record<string, any>;
  performance_score: number;
  validation_score: number;
  training_time: number;
}

export interface FeatureSelection {
  selection_method: 'filter' | 'wrapper' | 'embedded' | 'hybrid';
  selection_criteria: string[];
  initial_feature_count: number;
  selected_feature_count: number;
  feature_importance_scores: Record<string, number>;
  selection_performance_impact: number;
}

export interface ModelSelection {
  candidate_models: string[];
  selection_criteria: string[];
  cross_validation_results: ModelComparisonResult[];
  selected_model: string;
  selection_justification: string;
}

export interface ModelComparisonResult {
  model_name: string;
  performance_metrics: Record<string, number>;
  training_time: number;
  prediction_time: number;
  model_complexity: number;
  interpretability_score: number;
}

export interface ModelDeploymentStatus {
  deployment_date: string;
  deployment_environment: string;
  model_version: string;
  deployment_method: 'batch' | 'real_time' | 'streaming' | 'edge';
  monitoring_status: 'active' | 'inactive' | 'degraded';
  performance_drift: PerformanceDrift;
  data_drift: DataDrift;
}

export interface PerformanceDrift {
  drift_detected: boolean;
  drift_magnitude: number;
  drift_direction: 'improvement' | 'degradation';
  drift_start_date: string;
  affected_metrics: string[];
  potential_causes: string[];
}

export interface DataDrift {
  drift_detected: boolean;
  drift_type: 'covariate_shift' | 'prior_probability_shift' | 'concept_drift';
  drift_magnitude: number;
  drift_start_date: string;
  affected_features: string[];
  statistical_tests: DriftTest[];
}

export interface DriftTest {
  test_name: string;
  test_statistic: number;
  p_value: number;
  critical_value: number;
  drift_conclusion: boolean;
}

export interface ForecastingAlgorithm {
  algorithm_id: string;
  algorithm_name: string;
  algorithm_type: 'arima' | 'exponential_smoothing' | 'prophet' | 'lstm' | 'transformer' | 'ensemble';
  time_series_components: TimeSeriesComponent[];
  seasonality_handling: SeasonalityHandling;
  trend_handling: TrendHandling;
  outlier_handling: OutlierHandling;
  uncertainty_quantification: UncertaintyQuantification;
}

export interface TimeSeriesComponent {
  component_type: 'trend' | 'seasonality' | 'cyclical' | 'irregular' | 'level';
  component_strength: number;
  detection_method: string;
  modeling_approach: string;
  parameters: Record<string, any>;
}

export interface SeasonalityHandling {
  seasonal_periods: number[];
  seasonality_type: 'additive' | 'multiplicative' | 'mixed';
  seasonal_decomposition: string;
  seasonal_adjustment: boolean;
  fourier_terms: number;
}

export interface TrendHandling {
  trend_type: 'linear' | 'exponential' | 'polynomial' | 'piecewise' | 'stochastic';
  trend_detection_method: string;
  trend_extrapolation: string;
  changepoint_detection: ChangepointDetection;
}

export interface ChangepointDetection {
  detection_enabled: boolean;
  detection_method: string;
  sensitivity: number;
  minimum_changepoint_distance: number;
  changepoint_prior_scale: number;
}

export interface OutlierHandling {
  outlier_detection_method: string;
  outlier_threshold: number;
  outlier_treatment: 'remove' | 'cap' | 'transform' | 'model';
  robust_estimation: boolean;
}

export interface UncertaintyQuantification {
  uncertainty_method: 'parametric' | 'bootstrap' | 'bayesian' | 'conformal';
  confidence_levels: number[];
  prediction_intervals: boolean;
  monte_carlo_samples: number;
  uncertainty_propagation: boolean;
}

export interface PredictionResult {
  prediction_id: string;
  model_id: string;
  prediction_timestamp: string;
  prediction_horizon: string;
  predictions: Prediction[];
  prediction_metadata: PredictionMetadata;
  quality_assessment: PredictionQualityAssessment;
}

export interface Prediction {
  target_variable: string;
  predicted_value: number;
  prediction_interval: PredictionInterval;
  confidence_score: number;
  prediction_timestamp: string;
  feature_contributions: FeatureContribution[];
  explanation: PredictionExplanation;
}

export interface FeatureContribution {
  feature_name: string;
  contribution_value: number;
  contribution_percentage: number;
  contribution_direction: 'positive' | 'negative' | 'neutral';
  importance_rank: number;
}

export interface PredictionExplanation {
  explanation_method: 'shap' | 'lime' | 'permutation' | 'integrated_gradients';
  global_explanation: GlobalExplanation;
  local_explanation: LocalExplanation;
  counterfactual_explanation: CounterfactualExplanation;
}

export interface GlobalExplanation {
  feature_importance: Record<string, number>;
  model_behavior_summary: string;
  decision_boundaries: DecisionBoundary[];
  model_assumptions: string[];
}

export interface DecisionBoundary {
  feature_combination: string[];
  boundary_equation: string;
  boundary_confidence: number;
  examples: any[];
}

export interface LocalExplanation {
  instance_id: string;
  feature_contributions: FeatureContribution[];
  prediction_confidence: number;
  similar_instances: SimilarInstance[];
  decision_path: DecisionPath[];
}

export interface SimilarInstance {
  instance_id: string;
  similarity_score: number;
  prediction_value: number;
  feature_differences: Record<string, number>;
}

export interface DecisionPath {
  step_number: number;
  feature_name: string;
  feature_value: any;
  decision_rule: string;
  contribution_to_prediction: number;
}

export interface CounterfactualExplanation {
  counterfactual_instances: CounterfactualInstance[];
  minimum_changes_required: FeatureChange[];
  feasibility_score: number;
  actionability_score: number;
}

export interface CounterfactualInstance {
  instance_id: string;
  modified_features: Record<string, any>;
  predicted_outcome: number;
  distance_from_original: number;
  plausibility_score: number;
}

export interface FeatureChange {
  feature_name: string;
  original_value: any;
  required_value: any;
  change_difficulty: 'easy' | 'medium' | 'hard' | 'impossible';
  change_cost: number;
}

export interface PredictionMetadata {
  model_version: string;
  prediction_method: string;
  computational_resources_used: ComputationalResources;
  prediction_latency: number;
  data_freshness: DataFreshness;
  prediction_context: PredictionContext;
}

export interface ComputationalResources {
  cpu_time_ms: number;
  memory_usage_mb: number;
  gpu_time_ms?: number;
  network_calls: number;
  storage_reads: number;
}

export interface DataFreshness {
  latest_data_timestamp: string;
  data_lag_minutes: number;
  data_completeness: number;
  data_quality_score: number;
}

export interface PredictionContext {
  business_context: string;
  environmental_factors: Record<string, any>;
  temporal_context: TemporalContext;
  spatial_context?: SpatialContext;
}

export interface TemporalContext {
  time_of_day: string;
  day_of_week: string;
  month: string;
  season: string;
  business_calendar_events: string[];
}

export interface SpatialContext {
  location: SpatialCoordinates;
  region: string;
  climate_zone: string;
  population_density: number;
}

export interface PredictionQualityAssessment {
  overall_quality_score: number;
  quality_dimensions: QualityDimension[];
  risk_factors: PredictionRiskFactor[];
  reliability_indicators: ReliabilityIndicator[];
  validation_results: PredictionValidationResult[];
}

export interface QualityDimension {
  dimension_name: 'accuracy' | 'precision' | 'completeness' | 'consistency' | 'timeliness' | 'relevance';
  dimension_score: number;
  measurement_method: string;
  benchmark_comparison: number;
  improvement_suggestions: string[];
}

export interface PredictionRiskFactor {
  risk_type: 'model_drift' | 'data_quality' | 'extrapolation' | 'uncertainty' | 'bias';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_description: string;
  mitigation_strategies: string[];
  monitoring_requirements: string[];
}

export interface ReliabilityIndicator {
  indicator_name: string;
  indicator_value: number;
  indicator_interpretation: string;
  historical_trend: 'improving' | 'stable' | 'degrading';
  benchmark_comparison: number;
}

export interface PredictionValidationResult {
  validation_method: string;
  validation_score: number;
  validation_details: Record<string, any>;
  validation_timestamp: string;
  validation_conclusion: string;
}

// ============================================================================
// INTELLIGENCE ENGINE CONFIGURATION TYPES
// ============================================================================

export interface IntelligenceEngineConfig {
  processing_mode: 'batch' | 'real_time' | 'streaming' | 'hybrid';
  parallel_processing: boolean;
  max_concurrent_tasks: number;
  memory_allocation_gb: number;
  cache_configuration: CacheConfiguration;
  logging_configuration: LoggingConfiguration;
  security_configuration: SecurityConfiguration;
  integration_settings: IntegrationSettings;
}

export interface CacheConfiguration {
  cache_enabled: boolean;
  cache_type: 'memory' | 'redis' | 'memcached' | 'hybrid';
  cache_size_mb: number;
  cache_ttl_seconds: number;
  cache_eviction_policy: 'lru' | 'lfu' | 'fifo' | 'random';
  cache_hit_rate_threshold: number;
}

export interface LoggingConfiguration {
  log_level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  log_format: 'json' | 'text' | 'structured';
  log_destinations: string[];
  log_retention_days: number;
  sensitive_data_masking: boolean;
  performance_logging: boolean;
}

export interface SecurityConfiguration {
  encryption_at_rest: boolean;
  encryption_in_transit: boolean;
  access_control: AccessControl;
  audit_logging: boolean;
  data_privacy_settings: DataPrivacySettings;
  threat_detection: ThreatDetection;
}

export interface AccessControl {
  authentication_method: 'oauth' | 'jwt' | 'api_key' | 'certificate' | 'ldap';
  authorization_model: 'rbac' | 'abac' | 'acl' | 'custom';
  session_management: SessionManagement;
  multi_factor_authentication: boolean;
}

export interface SessionManagement {
  session_timeout_minutes: number;
  max_concurrent_sessions: number;
  session_tracking: boolean;
  session_encryption: boolean;
}

export interface DataPrivacySettings {
  pii_detection: boolean;
  data_anonymization: boolean;
  gdpr_compliance: boolean;
  data_retention_policy: DataRetentionPolicy;
  consent_management: boolean;
}

export interface DataRetentionPolicy {
  default_retention_days: number;
  category_specific_retention: Record<string, number>;
  automatic_deletion: boolean;
  retention_exceptions: string[];
}

export interface ThreatDetection {
  anomaly_detection: boolean;
  intrusion_detection: boolean;
  malware_scanning: boolean;
  behavioral_analysis: boolean;
  threat_intelligence_feeds: string[];
}

export interface IntegrationSettings {
  api_endpoints: APIEndpointConfig[];
  message_queues: MessageQueueConfig[];
  databases: DatabaseConfig[];
  external_services: ExternalServiceConfig[];
  webhook_configurations: WebhookConfig[];
}

export interface APIEndpointConfig {
  endpoint_name: string;
  endpoint_url: string;
  authentication: AuthenticationConfig;
  rate_limiting: RateLimitingConfig;
  timeout_settings: TimeoutConfig;
  retry_policy: RetryPolicyConfig;
}

export interface AuthenticationConfig {
  auth_type: 'none' | 'basic' | 'bearer' | 'oauth2' | 'api_key';
  credentials: Record<string, string>;
  token_refresh: boolean;
  token_expiry_handling: string;
}

export interface RateLimitingConfig {
  requests_per_second: number;
  burst_capacity: number;
  rate_limiting_algorithm: string;
  backoff_strategy: string;
}

export interface TimeoutConfig {
  connection_timeout_ms: number;
  read_timeout_ms: number;
  total_timeout_ms: number;
}

export interface RetryPolicyConfig {
  max_retries: number;
  retry_delay_ms: number;
  exponential_backoff: boolean;
  retry_conditions: string[];
}

export interface MessageQueueConfig {
  queue_name: string;
  queue_type: 'rabbitmq' | 'kafka' | 'sqs' | 'azure_service_bus';
  connection_string: string;
  message_format: 'json' | 'avro' | 'protobuf';
  batch_processing: boolean;
  error_handling: ErrorHandlingConfig;
}

export interface ErrorHandlingConfig {
  dead_letter_queue: boolean;
  max_retry_attempts: number;
  retry_delay_seconds: number;
  error_notification: boolean;
}

export interface DatabaseConfig {
  database_name: string;
  database_type: 'postgresql' | 'mysql' | 'mongodb' | 'cassandra' | 'elasticsearch';
  connection_string: string;
  connection_pooling: ConnectionPoolingConfig;
  query_optimization: boolean;
  caching_enabled: boolean;
}

export interface ConnectionPoolingConfig {
  min_connections: number;
  max_connections: number;
  connection_timeout_ms: number;
  idle_timeout_ms: number;
  validation_query: string;
}

export interface ExternalServiceConfig {
  service_name: string;
  service_url: string;
  service_type: 'rest_api' | 'soap' | 'graphql' | 'grpc';
  authentication: AuthenticationConfig;
  circuit_breaker: CircuitBreakerConfig;
  health_check: HealthCheckConfig;
}

export interface CircuitBreakerConfig {
  failure_threshold: number;
  recovery_timeout_ms: number;
  half_open_max_calls: number;
  success_threshold: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  check_interval_seconds: number;
  timeout_seconds: number;
  health_endpoint: string;
  expected_response: any;
}

export interface WebhookConfig {
  webhook_name: string;
  webhook_url: string;
  event_types: string[];
  authentication: AuthenticationConfig;
  payload_format: 'json' | 'xml' | 'form_data';
  retry_policy: RetryPolicyConfig;
}

// ============================================================================
// INTELLIGENCE ENGINE METRICS
// ============================================================================

export interface IntelligenceEngineMetrics {
  overall_performance: OverallPerformance;
  processing_metrics: ProcessingMetrics;
  accuracy_metrics: AccuracyMetrics;
  efficiency_metrics: EfficiencyMetrics;
  reliability_metrics: ReliabilityMetrics;
  scalability_metrics: ScalabilityMetrics;
}

export interface OverallPerformance {
  performance_score: number;
  throughput_requests_per_second: number;
  average_response_time_ms: number;
  success_rate: number;
  availability_percentage: number;
  user_satisfaction_score: number;
}

export interface ProcessingMetrics {
  total_requests_processed: number;
  average_processing_time_ms: number;
  peak_processing_time_ms: number;
  processing_time_percentiles: Record<string, number>;
  queue_depth: number;
  processing_backlog: number;
}

export interface AccuracyMetrics {
  overall_accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  false_negative_rate: number;
  accuracy_by_category: Record<string, number>;
}

export interface EfficiencyMetrics {
  resource_utilization: ResourceUtilizationMetrics;
  cost_efficiency: number;
  energy_efficiency: number;
  cache_hit_rate: number;
  data_transfer_efficiency: number;
  algorithm_efficiency: number;
}

export interface ResourceUtilizationMetrics {
  cpu_utilization_percentage: number;
  memory_utilization_percentage: number;
  disk_utilization_percentage: number;
  network_utilization_percentage: number;
  gpu_utilization_percentage?: number;
}

export interface ReliabilityMetrics {
  uptime_percentage: number;
  mean_time_between_failures_hours: number;
  mean_time_to_recovery_minutes: number;
  error_rate: number;
  data_consistency_score: number;
  fault_tolerance_score: number;
}

export interface ScalabilityMetrics {
  horizontal_scalability_factor: number;
  vertical_scalability_factor: number;
  load_handling_capacity: number;
  performance_degradation_rate: number;
  scalability_efficiency: number;
  auto_scaling_effectiveness: number;
}

export interface PatternRecognitionMetrics {
  pattern_detection_accuracy: number;
  pattern_classification_accuracy: number;
  false_pattern_rate: number;
  pattern_coverage: number;
  detection_latency_ms: number;
  pattern_library_utilization: number;
}

export interface PredictiveAnalyticsMetrics {
  prediction_accuracy: number;
  forecast_error_rate: number;
  prediction_confidence: number;
  model_drift_rate: number;
  prediction_latency_ms: number;
  model_update_frequency: number;
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