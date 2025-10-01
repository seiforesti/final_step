/**
 * Advanced Classification System Types
 * Comprehensive TypeScript interfaces for Manual, ML, and AI classification tiers
 */

// ============================================================================
// BASE CLASSIFICATION TYPES
// ============================================================================

export enum SensitivityLevel {
  PUBLIC = "public",
  INTERNAL = "internal", 
  CONFIDENTIAL = "confidential",
  RESTRICTED = "restricted",
  TOP_SECRET = "top_secret",
  PII = "pii",
  PHI = "phi", 
  PCI = "pci",
  GDPR = "gdpr",
  CCPA = "ccpa",
  HIPAA = "hipaa",
  SOX = "sox",
  FINANCIAL = "financial",
  INTELLECTUAL_PROPERTY = "intellectual_property",
  TRADE_SECRET = "trade_secret",
  CUSTOMER_DATA = "customer_data",
  EMPLOYEE_DATA = "employee_data",
  PARTNER_DATA = "partner_data"
}

export enum ClassificationRuleType {
  REGEX_PATTERN = "regex_pattern",
  DICTIONARY_LOOKUP = "dictionary_lookup",
  COLUMN_NAME_PATTERN = "column_name_pattern",
  TABLE_NAME_PATTERN = "table_name_pattern",
  DATA_TYPE_PATTERN = "data_type_pattern",
  VALUE_RANGE_PATTERN = "value_range_pattern",
  STATISTICAL_PATTERN = "statistical_pattern",
  METADATA_PATTERN = "metadata_pattern",
  COMPOSITE_PATTERN = "composite_pattern",
  ML_INFERENCE = "ml_inference",
  AI_INFERENCE = "ai_inference",
  CUSTOM_FUNCTION = "custom_function"
}

export enum ClassificationScope {
  GLOBAL = "global",
  DATA_SOURCE = "data_source",
  SCHEMA = "schema", 
  TABLE = "table",
  COLUMN = "column",
  CUSTOM = "custom"
}

export enum ClassificationStatus {
  PENDING = "pending",
  ACTIVE = "active",
  INACTIVE = "inactive",
  DEPRECATED = "deprecated",
  FAILED = "failed",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export enum ClassificationConfidenceLevel {
  VERY_LOW = "very_low",
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  VERY_HIGH = "very_high",
  CERTAIN = "certain"
}

export enum ClassificationMethod {
  MANUAL = "manual",
  AUTOMATED_RULE = "automated_rule",
  ML_PREDICTION = "ml_prediction",
  AI_INFERENCE = "ai_inference",
  INHERITED = "inherited",
  POLICY_DRIVEN = "policy_driven",
  EXPERT_REVIEW = "expert_review"
}

// ============================================================================
// MANUAL CLASSIFICATION TYPES
// ============================================================================

export interface ClassificationFramework {
  id: number;
  name: string;
  description?: string;
  version: string;
  is_default: boolean;
  is_active: boolean;
  applies_to_data_sources: boolean;
  applies_to_schemas: boolean;
  applies_to_tables: boolean;
  applies_to_columns: boolean;
  compliance_frameworks?: string[];
  regulatory_requirements?: string[];
  owner?: string;
  steward?: string;
  approval_required: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ClassificationPolicy {
  id: number;
  framework_id: number;
  name: string;
  description?: string;
  priority: number;
  is_mandatory: boolean;
  auto_apply: boolean;
  requires_approval: boolean;
  scope: ClassificationScope;
  scope_filter?: any;
  conditions?: any;
  default_sensitivity: SensitivityLevel;
  inheritance_rules?: any;
  notification_rules?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ClassificationRule {
  id: number;
  framework_id?: number;
  name: string;
  description?: string;
  rule_type: ClassificationRuleType;
  pattern: string;
  sensitivity_level: SensitivityLevel;
  confidence_threshold: number;
  is_active: boolean;
  priority: number;
  scope: ClassificationScope;
  scope_filter?: any;
  case_sensitive: boolean;
  whole_word_only: boolean;
  negate_match: boolean;
  conditions?: any;
  context_requirements?: any;
  applies_to_scan_results: boolean;
  applies_to_catalog_items: boolean;
  compliance_requirement_id?: number;
  racine_orchestrator_id?: string;
  execution_count: number;
  success_count: number;
  false_positive_count: number;
  last_executed?: string;
  avg_execution_time_ms?: number;
  version: string;
  parent_rule_id?: number;
  is_deprecated: boolean;
  deprecation_reason?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ClassificationDictionary {
  id: number;
  name: string;
  description?: string;
  language: string;
  encoding: string;
  is_case_sensitive: boolean;
  entries: any;
  entry_count: number;
  category?: string;
  subcategory?: string;
  tags?: string[];
  source_type: string;
  source_reference?: string;
  imported_from?: string;
  validation_status: string;
  validation_notes?: string;
  quality_score: number;
  usage_count: number;
  last_used?: string;
  version: string;
  parent_dictionary_id?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ClassificationResult {
  id: number;
  uuid: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  entity_path?: string;
  rule_id?: number;
  sensitivity_level: SensitivityLevel;
  classification_method: ClassificationMethod;
  confidence_score: number;
  confidence_level: ClassificationConfidenceLevel;
  data_source_id?: number;
  scan_id?: number;
  scan_result_id?: number;
  catalog_item_id?: number;
  matched_patterns?: any;
  matched_values?: any;
  context_data?: any;
  sample_data?: any;
  sample_size?: number;
  total_records?: number;
  match_percentage?: number;
  is_validated: boolean;
  validation_status: string;
  validation_notes?: string;
  validation_date?: string;
  validated_by?: string;
  inherited_from_id?: number;
  propagated_to?: any;
  inheritance_depth: number;
  is_override: boolean;
  override_reason?: string;
  override_approved_by?: string;
  override_approved_at?: string;
  processing_time_ms?: number;
  memory_usage_mb?: number;
  status: ClassificationStatus;
  effective_date: string;
  expiry_date?: string;
  compliance_checked: boolean;
  compliance_status?: string;
  compliance_notes?: string;
  version: string;
  revision_number: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================================================
// ML CLASSIFICATION TYPES
// ============================================================================

export enum MLModelType {
  RANDOM_FOREST = "random_forest",
  GRADIENT_BOOSTING = "gradient_boosting",
  SVM = "svm",
  LOGISTIC_REGRESSION = "logistic_regression",
  NAIVE_BAYES = "naive_bayes",
  KNN = "knn",
  NEURAL_NETWORK = "neural_network",
  DEEP_NEURAL_NETWORK = "deep_neural_network",
  CONVOLUTIONAL_NN = "convolutional_nn",
  RECURRENT_NN = "recurrent_nn",
  LSTM = "lstm",
  GRU = "gru",
  TRANSFORMER = "transformer",
  BERT = "bert",
  ROBERTA = "roberta",
  DISTILBERT = "distilbert",
  WORD2VEC = "word2vec",
  TFIDF_CLASSIFIER = "tfidf_classifier",
  ENSEMBLE = "ensemble",
  VOTING_CLASSIFIER = "voting_classifier",
  STACKING = "stacking",
  BAGGING = "bagging",
  AUTOML = "automl",
  XGBOOST = "xgboost",
  LIGHTGBM = "lightgbm",
  CATBOOST = "catboost",
  ANOMALY_DETECTION = "anomaly_detection",
  CLUSTERING = "clustering",
  REINFORCEMENT_LEARNING = "reinforcement_learning"
}

export enum MLTaskType {
  BINARY_CLASSIFICATION = "binary_classification",
  MULTICLASS_CLASSIFICATION = "multiclass_classification",
  MULTILABEL_CLASSIFICATION = "multilabel_classification",
  REGRESSION = "regression",
  RANKING = "ranking",
  ANOMALY_DETECTION = "anomaly_detection",
  CLUSTERING = "clustering",
  FEATURE_EXTRACTION = "feature_extraction",
  DIMENSIONALITY_REDUCTION = "dimensionality_reduction"
}

export enum MLModelStatus {
  DRAFT = "draft",
  TRAINING = "training",
  VALIDATING = "validating",
  TRAINED = "trained",
  TESTING = "testing",
  DEPLOYING = "deploying",
  DEPLOYED = "deployed",
  ACTIVE = "active",
  INACTIVE = "inactive",
  DEPRECATED = "deprecated",
  FAILED = "failed",
  ARCHIVED = "archived"
}

export enum MLModelFramework {
  SCIKIT_LEARN = "scikit_learn",
  TENSORFLOW = "tensorflow",
  PYTORCH = "pytorch",
  XGBOOST = "xgboost",
  LIGHTGBM = "lightgbm",
  CATBOOST = "catboost",
  KERAS = "keras",
  HUGGINGFACE = "huggingface",
  SPACY = "spacy",
  NLTK = "nltk",
  CUSTOM = "custom"
}

export interface MLModelConfiguration {
  id: number;
  name: string;
  description?: string;
  model_type: MLModelType;
  task_type: MLTaskType;
  framework: MLModelFramework;
  model_config: any;
  hyperparameters: any;
  architecture_config?: any;
  training_config: any;
  validation_config: any;
  optimization_config?: any;
  feature_config: any;
  preprocessing_pipeline?: any;
  feature_selection?: any;
  model_version: string;
  model_path?: string;
  model_artifacts_path?: string;
  status: MLModelStatus;
  performance_metrics: any;
  validation_metrics?: any;
  benchmark_metrics?: any;
  training_data_hash?: string;
  training_duration_seconds?: number;
  training_samples_count?: number;
  validation_samples_count?: number;
  test_samples_count?: number;
  last_trained?: string;
  next_training_scheduled?: string;
  auto_retrain: boolean;
  retrain_threshold?: number;
  deployment_config?: any;
  scaling_config?: any;
  monitoring_config?: any;
  classification_framework_id?: number;
  target_sensitivity_levels?: string[];
  classification_scope?: ClassificationScope;
}

export interface MLTrainingJob {
  id: number;
  job_name: string;
  description?: string;
  model_config_id: number;
  training_dataset_id: number;
  job_config: any;
  training_parameters: any;
  hyperparameter_tuning?: any;
  optimization_strategy?: any;
  status: MLModelStatus;
  started_at?: string;
  completed_at?: string;
  duration_seconds?: number;
  compute_resources?: any;
  resource_usage_metrics?: any;
  cost_metrics?: any;
  progress_percentage: number;
  current_epoch?: number;
  total_epochs?: number;
  training_metrics?: any;
  validation_metrics?: any;
  model_artifacts?: any;
  model_checkpoints?: string[];
  final_model_path?: string;
  error_messages?: string[];
  debug_logs?: string;
  retry_count: number;
  max_retries: number;
  triggered_by: string;
  trigger_context?: any;
}

export interface MLPrediction {
  id: number;
  prediction_id: string;
  model_config_id: number;
  training_job_id?: number;
  model_version: string;
  target_type: string;
  target_id: string;
  target_identifier: string;
  target_path?: string;
  input_data: any;
  input_features: any;
  preprocessing_applied?: any;
  prediction_result: any;
  predicted_class?: string;
  prediction_probabilities?: Record<string, number>;
  confidence_score: number;
  confidence_level: ClassificationConfidenceLevel;
  sensitivity_prediction?: SensitivityLevel;
  classification_tags?: string[];
  risk_assessment?: any;
  prediction_quality_score?: number;
  uncertainty_metrics?: any;
  explainability_data?: any;
  inference_time_ms?: number;
  processing_timestamp: string;
  batch_id?: string;
  ground_truth_label?: string;
  is_correct?: boolean;
  feedback_score?: number;
  human_validation?: any;
  classification_result_id?: number;
}

// ============================================================================
// AI CLASSIFICATION TYPES
// ============================================================================

export enum AIModelType {
  GPT_3_5 = "gpt_3_5",
  GPT_4 = "gpt_4",
  GPT_4_TURBO = "gpt_4_turbo",
  CLAUDE_OPUS = "claude_opus",
  CLAUDE_SONNET = "claude_sonnet",
  CLAUDE_HAIKU = "claude_haiku",
  PALM_2 = "palm_2",
  GEMINI_PRO = "gemini_pro",
  LLAMA_2 = "llama_2",
  LLAMA_3 = "llama_3",
  CODEX = "codex",
  EMBEDDINGS = "embeddings",
  WHISPER = "whisper",
  DALL_E = "dall_e",
  CUSTOM_LLM = "custom_llm",
  FINE_TUNED_GPT = "fine_tuned_gpt",
  DOMAIN_SPECIFIC = "domain_specific",
  MULTIMODAL = "multimodal",
  VISION_LANGUAGE = "vision_language",
  AUDIO_TEXT = "audio_text",
  REASONING_ENGINE = "reasoning_engine",
  PLANNING_AGENT = "planning_agent",
  DECISION_TREE_AI = "decision_tree_ai",
  ENSEMBLE_AI = "ensemble_ai",
  HYBRID_ML_AI = "hybrid_ml_ai",
  CHAIN_OF_THOUGHT = "chain_of_thought",
  EXPERT_SYSTEM = "expert_system",
  KNOWLEDGE_GRAPH_AI = "knowledge_graph_ai",
  GRAPH_NEURAL_NETWORK = "graph_neural_network",
  REINFORCEMENT_LEARNING_AI = "reinforcement_learning_ai"
}

export enum AITaskType {
  TEXT_CLASSIFICATION = "text_classification",
  SENTIMENT_ANALYSIS = "sentiment_analysis",
  NAMED_ENTITY_RECOGNITION = "named_entity_recognition",
  INFORMATION_EXTRACTION = "information_extraction",
  SUMMARIZATION = "summarization",
  QUESTION_ANSWERING = "question_answering",
  CODE_ANALYSIS = "code_analysis",
  DOCUMENT_UNDERSTANDING = "document_understanding",
  CONVERSATIONAL_AI = "conversational_ai",
  REASONING = "reasoning",
  PLANNING = "planning",
  DECISION_MAKING = "decision_making",
  KNOWLEDGE_SYNTHESIS = "knowledge_synthesis",
  PATTERN_RECOGNITION = "pattern_recognition",
  ANOMALY_DETECTION = "anomaly_detection",
  PREDICTIVE_ANALYSIS = "predictive_analysis"
}

export enum AIProviderType {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
  MICROSOFT = "microsoft",
  AWS = "aws",
  HUGGINGFACE = "huggingface",
  AZURE_OPENAI = "azure_openai",
  CUSTOM = "custom",
  ON_PREMISE = "on_premise",
  HYBRID = "hybrid"
}

export enum AIModelStatus {
  DRAFT = "draft",
  CONFIGURING = "configuring",
  TESTING = "testing",
  VALIDATING = "validating",
  DEPLOYING = "deploying",
  ACTIVE = "active",
  INACTIVE = "inactive",
  FINE_TUNING = "fine_tuning",
  UPDATING = "updating",
  DEPRECATED = "deprecated",
  FAILED = "failed",
  ARCHIVED = "archived"
}

export enum ExplainabilityLevel {
  NONE = "none",
  BASIC = "basic",
  INTERMEDIATE = "intermediate",
  DETAILED = "detailed",
  COMPREHENSIVE = "comprehensive",
  EXPERT_LEVEL = "expert_level",
  REGULATORY_COMPLIANT = "regulatory_compliant"
}

export interface AIModelConfiguration {
  id: number;
  name: string;
  description?: string;
  model_type: AIModelType;
  task_type: AITaskType;
  provider: AIProviderType;
  model_config: any;
  api_config: any;
  model_parameters: any;
  prompt_templates: any;
  system_prompts: any;
  conversation_config?: any;
  reasoning_config: any;
  reasoning_types: string[];
  explainability_config: any;
  explainability_level: ExplainabilityLevel;
  knowledge_base_config?: any;
  domain_expertise?: any;
  context_management?: any;
  multimodal_config?: any;
  supported_modalities?: string[];
  cross_modal_reasoning?: any;
  performance_config: any;
  optimization_strategy?: any;
  caching_strategy?: any;
  rate_limiting: any;
  cost_optimization: any;
  usage_quotas?: any;
  model_version: string;
  status: AIModelStatus;
  deployment_config?: any;
  classification_framework_id?: number;
  target_sensitivity_levels?: string[];
  classification_scope?: ClassificationScope;
  monitoring_config: any;
  governance_config?: any;
  compliance_config?: any;
}

export interface AIConversation {
  id: number;
  conversation_id: string;
  ai_model_id: number;
  conversation_type: string;
  context_type: string;
  context_id?: string;
  conversation_status: string;
  total_messages: number;
  started_at: string;
  last_activity: string;
  completed_at?: string;
  conversation_config: any;
  system_context?: any;
  user_preferences?: any;
  conversation_memory: any;
  learned_preferences?: any;
  conversation_insights?: any;
  conversation_quality_score?: number;
  user_satisfaction?: number;
  effectiveness_metrics?: any;
  classification_results?: number[];
  triggered_actions?: string[];
  recommendations_given?: string[];
}

export interface AIPrediction {
  id: number;
  prediction_id: string;
  ai_model_id: number;
  target_type: string;
  target_id: string;
  target_identifier: string;
  target_path?: string;
  target_metadata?: any;
  input_data: any;
  preprocessed_input?: any;
  context_enrichment?: any;
  prediction_result: any;
  primary_classification: string;
  alternative_classifications?: string[];
  classification_probabilities: Record<string, number>;
  confidence_score: number;
  confidence_level: ClassificationConfidenceLevel;
  uncertainty_quantification?: any;
  confidence_intervals?: any;
  reasoning_chain: any;
  thought_process: string;
  decision_factors: any[];
  supporting_evidence?: string[];
  explanation: string;
  detailed_explanation: any;
  visual_explanations?: any;
  counterfactual_analysis?: any;
  sensitivity_prediction: SensitivityLevel;
  risk_score: number;
  risk_factors: string[];
  compliance_implications?: any;
  processing_time_ms: number;
  token_usage: Record<string, number>;
  api_calls_made: number;
  cost_metrics?: any;
  prediction_quality_score?: number;
  human_validation?: any;
  expert_review?: any;
  classification_result_id?: number;
  ml_prediction_id?: number;
  conversation_id?: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ClassificationCreateRequest {
  name: string;
  display_name: string;
  level: SensitivityLevel;
  description?: string;
  parent_id?: number;
  compliance_frameworks?: string[];
  data_handling_requirements?: string;
  access_restrictions?: string[];
  retention_period_days?: number;
  custom_properties?: Record<string, any>;
}

export interface ClassificationRuleCreateRequest {
  name: string;
  description?: string;
  classification_id: number;
  rule_type: string;
  rule_pattern?: string;
  rule_logic?: Record<string, any>;
  applies_to_schemas?: string[];
  applies_to_tables?: string[];
  applies_to_columns?: string[];
  priority?: number;
  confidence_threshold?: number;
  is_active?: boolean;
}

export interface ClassificationAssignmentCreateRequest {
  asset_type: string;
  asset_id: string;
  asset_name: string;
  classification_id: number;
  rule_id?: string;
  source: ClassificationMethod;
  confidence_score?: number;
  justification?: string;
  evidence?: Record<string, any>;
}

export interface BulkClassificationRequest {
  data_source_ids?: number[];
  catalog_item_ids?: number[];
  scan_result_ids?: number[];
  framework_id?: number;
  force_reclassify?: boolean;
  batch_size?: number;
  parallel_jobs?: number;
}

export interface ClassificationMetrics {
  total_classifications: number;
  successful_classifications: number;
  failed_classifications: number;
  average_confidence: number;
  average_processing_time: number;
  accuracy_rate: number;
  false_positive_rate: number;
  false_negative_rate: number;
  precision: number;
  recall: number;
  f1_score: number;
  coverage_percentage: number;
  compliance_score: number;
  last_updated: string;
}

export interface ClassificationDashboard {
  overview: {
    total_frameworks: number;
    active_frameworks: number;
    total_rules: number;
    active_rules: number;
    total_classifications: number;
    pending_validations: number;
    system_health: string;
  };
  performance: ClassificationMetrics;
  recent_activity: any[];
  alerts: any[];
  trends: {
    classifications_over_time: any[];
    accuracy_trends: any[];
    performance_trends: any[];
  };
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface ClassificationManagerProps {
  dataSourceId?: number;
  frameworkId?: number;
  onClassificationChange?: (result: ClassificationResult) => void;
  onError?: (error: Error) => void;
  className?: string;
  initialConfig?: any;
}

export interface ManualClassificationManagerProps extends ClassificationManagerProps {
  showAdvancedFeatures?: boolean;
  enableBulkOperations?: boolean;
  enableAuditTrail?: boolean;
}

export interface MLClassificationManagerProps extends ClassificationManagerProps {
  showTrainingInterface?: boolean;
  showModelMetrics?: boolean;
  enableAutoRetrain?: boolean;
}

export interface AIClassificationManagerProps extends ClassificationManagerProps {
  showConversationInterface?: boolean;
  showExplainability?: boolean;
  enableMultiModal?: boolean;
}

export interface ClassificationOrchestratorProps {
  dataSourceId?: number;
  onViewChange?: (view: 'manual' | 'ml' | 'ai' | 'overview') => void;
  className?: string;
  initialView?: 'manual' | 'ml' | 'ai' | 'overview';
}
