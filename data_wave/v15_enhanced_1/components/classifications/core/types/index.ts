// ============================================================================
// CLASSIFICATION SYSTEM TYPES
// ============================================================================

// Base API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams {
  query: string;
  fields?: string[];
  filters?: FilterParams;
  pagination?: PaginationParams;
}

// ============================================================================
// CLASSIFICATION TYPES
// ============================================================================

export interface ClassificationFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  rules: ClassificationRule[];
  policies: ClassificationPolicy[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    tags: string[];
  };
}

export interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  type: 'regex' | 'keyword' | 'ml' | 'ai' | 'custom';
  pattern?: string;
  keywords?: string[];
  confidence: number;
  priority: number;
  enabled: boolean;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: string;
  };
}

export interface ClassificationPolicy {
  id: string;
  name: string;
  description: string;
  rules: string[];
  priority: number;
  enabled: boolean;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface ClassificationResult {
  id: string;
  input: string;
  classifications: Array<{
    ruleId: string;
    ruleName: string;
    confidence: number;
    category: string;
    tags: string[];
  }>;
  metadata: {
    processedAt: string;
    processingTime: number;
    modelVersion?: string;
  };
}

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================

export interface BulkOperation {
  id: string;
  type: 'classification' | 'training' | 'validation' | 'deployment';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  metadata: {
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    createdBy: string;
  };
}

export interface BulkOperationResult {
  operationId: string;
  results: ClassificationResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    averageConfidence: number;
  };
}

// ============================================================================
// ML TYPES
// ============================================================================

export interface MLModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering' | 'custom';
  status: 'training' | 'ready' | 'deployed' | 'archived' | 'failed';
  accuracy: number;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    framework: string;
    algorithm: string;
  };
}

export interface TrainingJob {
  id: string;
  modelId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: string;
  endTime?: string;
  metrics: {
    accuracy: number;
    loss: number;
    validationAccuracy: number;
  };
}

export interface TrainingConfiguration {
  modelType: string;
  hyperparameters: HyperparameterConfig;
  dataset: DatasetInfo;
  validation: ValidationConfig;
  deployment: DeploymentConfig;
}

export interface HyperparameterConfig {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: string;
  lossFunction: string;
  [key: string]: any;
}

export interface DatasetInfo {
  id: string;
  name: string;
  size: number;
  features: string[];
  targetColumn: string;
}

export interface ValidationConfig {
  validationSplit: number;
  crossValidation: boolean;
  metrics: string[];
}

export interface DeploymentConfig {
  environment: string;
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  scaling: {
    minReplicas: number;
    maxReplicas: number;
  };
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'data_preparation' | 'training' | 'validation' | 'deployment';
  status: 'pending' | 'running' | 'completed' | 'failed';
  dependencies: string[];
}

export interface TrainingPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  metadata: {
    createdAt: string;
    createdBy: string;
    tags: string[];
  };
}

export interface PipelineMetrics {
  totalPipelines: number;
  runningPipelines: number;
  completedPipelines: number;
  failedPipelines: number;
  averageExecutionTime: number;
}

// ============================================================================
// AI TYPES
// ============================================================================

export interface AIModel {
  id: string;
  name: string;
  type: 'gpt' | 'bert' | 'custom';
  version: string;
  status: 'active' | 'inactive' | 'training';
  capabilities: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

export interface Conversation {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    userId: string;
  };
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
  };
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface MLNotification {
  id: string;
  type: 'training_complete' | 'model_deployed' | 'error' | 'warning';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  read: boolean;
  metadata: {
    createdAt: string;
    userId: string;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AuditTrailEntry {
  id: string;
  action: string;
  resource: string;
  userId: string;
  timestamp: string;
  details: any;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  webhook: boolean;
  channels: string[];
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  gpu?: number;
  storage: number;
  network: number;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface MLModelCreate {
  name: string;
  type: string;
  configuration: TrainingConfiguration;
}

export interface MLModelUpdate {
  name?: string;
  status?: string;
  configuration?: Partial<TrainingConfiguration>;
}

export interface TrainingJobCreate {
  modelId: string;
  configuration: TrainingConfiguration;
}

export interface Prediction {
  id: string;
  modelId: string;
  input: any;
  output: any;
  confidence: number;
  metadata: {
    timestamp: string;
    processingTime: number;
  };
}

export interface PredictionRequest {
  modelId: string;
  input: any;
  options?: {
    includeConfidence?: boolean;
    includeMetadata?: boolean;
  };
}

export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  metadata: {
    timestamp: string;
    dataset: string;
  };
}

export interface MLDriftDetection {
  id: string;
  modelId: string;
  driftDetected: boolean;
  driftScore: number;
  features: Array<{
    name: string;
    driftScore: number;
  }>;
  metadata: {
    timestamp: string;
    threshold: number;
  };
}

export interface FeatureEngineering {
  id: string;
  name: string;
  description: string;
  features: string[];
  transformations: Array<{
    type: string;
    parameters: any;
  }>;
  metadata: {
    createdAt: string;
    createdBy: string;
  };
}

export interface ModelEnsemble {
  id: string;
  name: string;
  models: string[];
  weights: number[];
  metadata: {
    createdAt: string;
    createdBy: string;
  };
}

export interface MLAnalytics {
  modelPerformance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  resourceUsage: ResourceUsage;
  predictions: {
    total: number;
    successful: number;
    failed: number;
    averageLatency: number;
  };
}

export interface MLBulkOperation {
  id: string;
  type: 'training' | 'prediction' | 'validation';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: any[];
  metadata: {
    createdAt: string;
    completedAt?: string;
  };
}

export interface MLOptimizationRequest {
  modelId: string;
  optimizationType: 'hyperparameters' | 'architecture' | 'features';
  constraints: {
    maxTime?: number;
    maxResources?: ResourceUsage;
    targetAccuracy?: number;
  };
}

export interface MLModelComparison {
  models: Array<{
    id: string;
    name: string;
    metrics: MLMetrics;
  }>;
  comparison: {
    bestModel: string;
    improvements: Array<{
      metric: string;
      improvement: number;
    }>;
  };
}

export interface MLDeploymentConfig {
  environment: string;
  resources: ResourceUsage;
  scaling: {
    minReplicas: number;
    maxReplicas: number;
    targetCPUUtilization: number;
  };
  monitoring: {
    enabled: boolean;
    metrics: string[];
    alerts: Array<{
      metric: string;
      threshold: number;
      action: string;
    }>;
  };
}

export interface MLMonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: Array<{
    metric: string;
    threshold: number;
    action: string;
  }>;
  retention: {
    logs: number;
    metrics: number;
  };
}

export interface MLFeatureImportance {
  modelId: string;
  features: Array<{
    name: string;
    importance: number;
    rank: number;
  }>;
  metadata: {
    timestamp: string;
    method: string;
  };
}

export interface MLModelValidation {
  modelId: string;
  dataset: string;
  metrics: MLMetrics;
  validation: {
    passed: boolean;
    issues: string[];
  };
  metadata: {
    timestamp: string;
    validator: string;
  };
}

export interface MLResourceUsage {
  cpu: number;
  memory: number;
  gpu?: number;
  storage: number;
  network: number;
  timestamp: string;
}

// ============================================================================
// AI TYPES (Extended)
// ============================================================================

export interface AIMetrics {
  accuracy: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  metadata: {
    timestamp: string;
    modelVersion: string;
  };
}

export interface ExplainableReasoning {
  id: string;
  modelId: string;
  input: any;
  reasoning: Array<{
    step: number;
    description: string;
    confidence: number;
    evidence: any;
  }>;
  metadata: {
    timestamp: string;
    method: string;
  };
}

export interface ConversationContext {
  id: string;
  conversationId: string;
  context: any;
  metadata: {
    timestamp: string;
    userId: string;
  };
}

export interface AIIntelligenceRequest {
  modelId: string;
  input: any;
  options: {
    includeReasoning?: boolean;
    includeConfidence?: boolean;
    maxTokens?: number;
    temperature?: number;
  };
}

export interface AIIntelligenceResponse {
  id: string;
  output: any;
  confidence: number;
  reasoning?: ExplainableReasoning;
  metadata: {
    timestamp: string;
    processingTime: number;
    modelVersion: string;
  };
}

export interface KnowledgeGraph {
  id: string;
  nodes: Array<{
    id: string;
    type: string;
    properties: any;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
    properties: any;
  }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface MultiAgentOrchestration {
  id: string;
  agents: Array<{
    id: string;
    role: string;
    capabilities: string[];
    status: 'active' | 'inactive';
  }>;
  workflow: Array<{
    step: number;
    agentId: string;
    action: string;
    dependencies: number[];
  }>;
  metadata: {
    createdAt: string;
    status: 'running' | 'completed' | 'failed';
  };
}

export interface CognitiveProcessing {
  id: string;
  type: 'reasoning' | 'memory' | 'planning' | 'reflection';
  input: any;
  output: any;
  metadata: {
    timestamp: string;
    modelId: string;
  };
}

export interface AutoTaggingConfig {
  enabled: boolean;
  confidence: number;
  categories: string[];
  rules: Array<{
    pattern: string;
    category: string;
    priority: number;
  }>;
}

export interface WorkloadOptimization {
  id: string;
  type: 'resource' | 'performance' | 'cost';
  recommendations: Array<{
    action: string;
    impact: string;
    effort: string;
    priority: number;
  }>;
  metadata: {
    timestamp: string;
    optimizer: string;
  };
}

export interface RealTimeIntelligence {
  id: string;
  type: 'stream' | 'batch' | 'hybrid';
  data: any;
  insights: Array<{
    type: string;
    value: any;
    confidence: number;
  }>;
  metadata: {
    timestamp: string;
    source: string;
  };
}

export interface AIAnalytics {
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
  performance: {
    accuracy: number;
    throughput: number;
    resourceUsage: ResourceUsage;
  };
  metadata: {
    timestamp: string;
    period: string;
  };
}

export interface AIBulkOperation {
  id: string;
  type: 'classification' | 'generation' | 'analysis';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  results: any[];
  metadata: {
    createdAt: string;
    completedAt?: string;
  };
}

export interface ConversationFlow {
  id: string;
  conversationId: string;
  flow: Array<{
    step: number;
    action: string;
    agent: string;
    result: any;
  }>;
  metadata: {
    timestamp: string;
    duration: number;
  };
}

export interface ReasoningPath {
  id: string;
  modelId: string;
  path: Array<{
    step: number;
    reasoning: string;
    confidence: number;
    evidence: any;
  }>;
  metadata: {
    timestamp: string;
    method: string;
  };
}

export interface IntelligenceInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'correlation';
  description: string;
  confidence: number;
  evidence: any;
  metadata: {
    timestamp: string;
    source: string;
  };
}

export interface ContextualEmbedding {
  id: string;
  text: string;
  embedding: number[];
  context: any;
  metadata: {
    timestamp: string;
    model: string;
  };
}

export interface SemanticSearch {
  id: string;
  query: string;
  results: Array<{
    id: string;
    content: string;
    similarity: number;
    metadata: any;
  }>;
  metadata: {
    timestamp: string;
    model: string;
  };
}

export interface KnowledgeSynthesis {
  id: string;
  sources: string[];
  synthesis: string;
  confidence: number;
  metadata: {
    timestamp: string;
    model: string;
  };
}

export interface AIModelCreate {
  name: string;
  type: string;
  configuration: any;
}

export interface AIModelUpdate {
  name?: string;
  configuration?: any;
}

export interface ConversationCreate {
  userId: string;
  initialMessage?: string;
}

export interface KnowledgeEntryCreate {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

