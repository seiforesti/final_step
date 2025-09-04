// ai-assistant.types.ts
// TypeScript interfaces and types for AI Assistant components

export interface AIAssistantState {
  conversations: AIConversation[];
  activeConversation: AIConversation | null;
  messages: AIMessage[];
  recommendations: AIRecommendation[];
  insights: ProactiveInsight[];
  automationSuggestions: AutomationSuggestion[];
  workflowRecommendations: WorkflowRecommendation[];
  assistantState: {
    isTyping: boolean;
    isListening: boolean;
    contextAware: boolean;
    proactiveMode: boolean;
    learningEnabled: boolean;
    voiceEnabled: boolean;
  };
  loading: {
    conversation: boolean;
    message: boolean;
    recommendations: boolean;
    insights: boolean;
    optimization: boolean;
    troubleshooting: boolean;
  };
  errors: {
    conversation: string | null;
    message: string | null;
    recommendations: string | null;
    insights: string | null;
    optimization: string | null;
  };
  context: AIContext | null;
  learningData: Map<string, any>;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'deleted';
  metadata: Record<string, any>;
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: string;
  summary?: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'assistant' | 'system';
  content: string;
  contentType: 'text' | 'code' | 'data' | 'file' | 'image';
  timestamp: Date;
  metadata: Record<string, any>;
  attachments?: AIAttachment[];
  suggestions?: string[];
  actions?: AIAction[];
  insights?: AIInsight[];
  confidence?: number;
  processingTime?: number;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: string;
  threadId?: string;
}

export interface AIAttachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'code' | 'data' | 'log' | 'config' | 'report';
  url?: string;
  content?: string;
  size?: number;
  metadata?: Record<string, any>;
  uploadedAt: Date;
}

export interface AIAction {
  id: string;
  type: 'navigate' | 'execute' | 'analyze' | 'optimize' | 'configure' | 'monitor' | 'report' | 'alert';
  title: string;
  description: string;
  parameters?: Record<string, any>;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  executable: boolean;
  requiresConfirmation: boolean;
  estimatedDuration?: number;
  resourceRequirements?: {
    cpu: string;
    memory: string;
    network: string;
  };
}

export interface AIInsight {
  id: string;
  type: 'performance' | 'security' | 'optimization' | 'trend' | 'anomaly' | 'compliance' | 'quality' | 'efficiency';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, any>;
  recommendations?: string[];
  timestamp: Date;
  category: string;
  confidence: number;
  actionable: boolean;
  dismissed: boolean;
  dismissedAt?: Date;
  dismissedBy?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  source: RecommendationSource;
  confidence: number;
  relevanceScore: number;
  expectedImpact: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  executable: boolean;
  implementation: Record<string, any>;
  actionItems: string[];
  parameters?: Record<string, any>;
  estimatedValue?: string;
  estimatedEffort?: string;
  estimatedCost?: number;
  estimatedTime?: string;
  dependencies?: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceImpact?: string[];
  securityImplications?: string[];
  performanceMetrics?: Record<string, number>;
  userFeedback: RecommendationFeedback[];
  executionHistory?: Array<{
    executedAt: Date;
    executedBy: string;
    result: 'success' | 'partial' | 'failed';
    notes: string;
  }>;
  dismissed: boolean;
  dismissedAt?: Date;
  dismissedReason?: string;
  tags: string[];
  createdAt: Date;
  expiresAt?: Date;
  executedAt?: Date;
  executedBy?: string;
  feedback?: {
    rating: number;
    comment?: string;
    timestamp: Date;
  };
  timestamp: Date;
  lastUpdated: Date;
  metadata?: Record<string, any>;
}

export interface AIContext {
  userId: string;
  sessionId: string;
  workspaceId?: string;
  currentPage?: string;
  userRole?: string;
  permissions?: string[];
  recentActions?: string[];
  systemState?: Record<string, any>;
  userPreferences?: Record<string, any>;
  deviceContext?: {
    type: string;
    screenSize: string;
    capabilities: string[];
  };
  locationContext?: {
    timezone: string;
    locale: string;
    region: string;
  };
  conversationContext?: {
    topic: string;
    mood: string;
    urgency: string;
  };
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  configurable: boolean;
  configuration?: Record<string, any>;
  dependencies?: string[];
  version: string;
  lastUpdated: Date;
  performance?: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
}

export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  tone: 'formal' | 'casual' | 'technical' | 'creative' | 'analytical';
  style: 'business' | 'conversational' | 'detailed' | 'innovative' | 'data-focused';
  expertise: string[];
  characteristics: string[];
  limitations: string[];
  preferredContexts: string[];
  customizationOptions?: Record<string, any>;
}

export interface AIKnowledgeBase {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'domain-specific' | 'custom';
  sources: string[];
  lastUpdated: Date;
  size: number;
  accuracy: number;
  coverage: Record<string, number>;
  metadata: Record<string, any>;
  version: string;
  status: 'active' | 'updating' | 'archived';
}

export interface AILearningData {
  userId: string;
  sessionData: Record<string, any>;
  interactionPatterns: Record<string, any>;
  preferences: Record<string, any>;
  performanceMetrics: Record<string, any>;
  feedbackHistory: Array<{
    timestamp: Date;
    type: string;
    rating: number;
    comment?: string;
  }>;
  learningProgress: Record<string, number>;
  lastUpdated: Date;
}

export interface ContextAwareResponse {
  message: string;
  context: AIContext;
  suggestions: string[];
  actions: AIAction[];
  insights: AIInsight[];
  confidence: number;
  processingTime: number;
  metadata: Record<string, any>;
}

export interface ProactiveInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  data: Record<string, any>;
  recommendations: string[];
  timestamp: Date;
  expiresAt?: Date;
  dismissed: boolean;
  dismissedAt?: Date;
  dismissedBy?: string;
  actionable: boolean;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AutomationSuggestion {
  id: string;
  name: string;
  description: string;
  type: 'workflow' | 'script' | 'integration' | 'rule';
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTime: string;
  estimatedEffort: string;
  benefits: string[];
  risks: string[];
  prerequisites: string[];
  implementation: {
    steps: string[];
    resources: string[];
    testing: string[];
  };
  roi: {
    timeSaved: string;
    costSaved: number;
    efficiencyGain: number;
  };
  status: 'suggested' | 'approved' | 'implemented' | 'rejected';
  createdAt: Date;
  approvedAt?: Date;
  implementedAt?: Date;
  implementedBy?: string;
}

export interface WorkflowRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  steps: WorkflowStep[];
  involvedSPAs: string[];
  estimatedDuration: string;
  estimatedEffort: string;
  benefits: string[];
  risks: string[];
  prerequisites: string[];
  dependencies: string[];
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'archived';
  createdAt: Date;
  createdBy: string;
  approvedAt?: Date;
  approvedBy?: string;
  implementedAt?: Date;
  implementedBy?: string;
  performance?: {
    executionTime: number;
    successRate: number;
    errorRate: number;
    lastExecuted: Date;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'action' | 'decision' | 'condition' | 'loop' | 'parallel';
  order: number;
  dependencies: string[];
  parameters: Record<string, any>;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: string;
    retryableErrors: string[];
  };
  errorHandling?: {
    onError: string;
    fallbackAction?: string;
    notificationRecipients?: string[];
  };
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

export interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  timestamp: Date;
  processed: boolean;
  result?: any;
  error?: string;
}

export interface AIAnalytics {
  conversations: {
    total: number;
    active: number;
    archived: number;
    averageDuration: number;
    averageMessages: number;
  };
  messages: {
    total: number;
    userMessages: number;
    assistantMessages: number;
    averageResponseTime: number;
    averageLength: number;
  };
  recommendations: {
    total: number;
    executed: number;
    pending: number;
    averageRating: number;
    successRate: number;
  };
  insights: {
    total: number;
    actionable: number;
    dismissed: number;
    averageConfidence: number;
  };
  performance: {
    averageProcessingTime: number;
    accuracy: number;
    userSatisfaction: number;
    systemUptime: number;
  };
  usage: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    peakUsageTime: string;
    averageSessionDuration: number;
  };
}

export interface AINotification {
  id: string;
  type: 'insight' | 'recommendation' | 'alert' | 'update' | 'reminder';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  actionable: boolean;
  actionUrl?: string;
  actionText?: string;
  timestamp: Date;
  expiresAt?: Date;
  read: boolean;
  readAt?: Date;
  dismissed: boolean;
  dismissedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  metadata: Record<string, any>;
}

export interface AISettings {
  general: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  conversation: {
    maxMessages: number;
    maxMessageLength: number;
    autoSave: boolean;
    autoSaveInterval: number;
    historyRetention: number;
  };
  ai: {
    model: string;
    temperature: number;
    maxTokens: number;
    personality: string;
    capabilities: string[];
    learningEnabled: boolean;
    proactiveMode: boolean;
    contextAwareness: boolean;
  };
  voice: {
    enabled: boolean;
    language: string;
    voice: string;
    speed: number;
    volume: number;
    wakeWord: string;
    autoTranscribe: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    personalization: boolean;
    dataRetention: number;
    dataSharing: boolean;
  };
  performance: {
    streaming: boolean;
    caching: boolean;
    compression: boolean;
    batchProcessing: boolean;
    optimizationLevel: 'low' | 'medium' | 'high';
  };
}

// ============================================================================
// LEARNING ENGINE TYPES
// ============================================================================

export interface LearningModel {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'regression' | 'clustering' | 'recommendation' | 'custom';
  version: string;
  status: 'draft' | 'training' | 'active' | 'inactive' | 'archived';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: TrainingData;
  configuration: ModelConfiguration;
  performance: ModelPerformance;
  createdAt: Date;
  updatedAt: Date;
  lastTrained: Date;
  nextTraining: Date;
  trainingProgress: number;
  isNew: boolean;
  tags: string[];
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  mse: number;
  mae: number;
  rmse: number;
  confusionMatrix: number[][];
  classificationReport: Record<string, any>;
  featureImportance: FeatureImportance[];
  predictions: any[];
  actualValues: any[];
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
  version: string;
  dataset: string;
  crossValidationScore: number;
  holdoutScore: number;
}

export interface TrainingSession {
  id: string;
  modelId: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration: number;
  progress: number;
  epochs: number;
  currentEpoch: number;
  batchSize: number;
  learningRate: number;
  loss: number;
  accuracy: number;
  validationLoss: number;
  validationAccuracy: number;
  hyperparameters: Record<string, any>;
  dataset: string;
  datasetSize: number;
  trainingSplit: number;
  validationSplit: number;
  testSplit: number;
  logs: TrainingLog[];
  metrics: TrainingMetrics;
  artifacts: TrainingArtifact[];
  error?: string;
  createdBy: string;
  metadata: Record<string, any>;
}

export interface LearningInsight {
  id: string;
  type: 'performance' | 'behavior' | 'optimization' | 'anomaly' | 'trend';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  confidence: number;
  actionable: boolean;
  dismissed: boolean;
  dismissedAt?: Date;
  dismissedBy?: string;
  data: Record<string, any>;
  recommendations: string[];
  timestamp: Date;
  expiresAt?: Date;
  isNew: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedModels: string[];
  impact: 'low' | 'medium' | 'high';
}

export interface UserFeedback {
  id: string;
  userId: string;
  modelId: string;
  type: 'accuracy' | 'performance' | 'usability' | 'relevance' | 'general';
  rating: number;
  comment?: string;
  timestamp: Date;
  context: Record<string, any>;
  actionable: boolean;
  processed: boolean;
  processedAt?: Date;
  processedBy?: string;
  response?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

export interface BehaviorPattern {
  id: string;
  userId: string;
  pattern: string;
  description: string;
  frequency: number;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  context: Record<string, any>;
  category: string;
  actionable: boolean;
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface AdaptationStrategy {
  id: string;
  name: string;
  description: string;
  type: 'automatic' | 'manual' | 'hybrid';
  target: 'model' | 'interface' | 'workflow' | 'system';
  conditions: AdaptationCondition[];
  actions: AdaptationAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastExecuted?: Date;
  successRate: number;
  executionCount: number;
  metadata: Record<string, any>;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'domain-specific' | 'custom';
  sources: string[];
  lastUpdated: Date;
  size: number;
  accuracy: number;
  coverage: Record<string, number>;
  metadata: Record<string, any>;
  version: string;
  status: 'active' | 'updating' | 'archived';
  contributors: string[];
  accessLevel: 'public' | 'private' | 'restricted';
}

export interface LearningMetrics {
  totalModels: number;
  activeModels: number;
  trainingSessions: number;
  averageAccuracy: number;
  averageTrainingTime: number;
  successRate: number;
  errorRate: number;
  improvementRate: number;
  userSatisfaction: number;
  systemPerformance: number;
  lastUpdated: Date;
  trends: Record<string, number[]>;
  comparisons: ModelComparison[];
}

export interface ModelConfiguration {
  algorithm: string;
  hyperparameters: Record<string, any>;
  architecture: Record<string, any>;
  preprocessing: Record<string, any>;
  postprocessing: Record<string, any>;
  validation: Record<string, any>;
  optimization: Record<string, any>;
  deployment: Record<string, any>;
  monitoring: Record<string, any>;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ExperimentResult {
  id: string;
  name: string;
  description: string;
  modelId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration: number;
  parameters: Record<string, any>;
  results: Record<string, any>;
  metrics: Record<string, number>;
  comparison: ModelComparison;
  insights: string[];
  recommendations: string[];
  artifacts: string[];
  metadata: Record<string, any>;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
  category: string;
  description?: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  metadata: Record<string, any>;
}

export interface PredictionAccuracy {
  modelId: string;
  dataset: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
  classificationReport: Record<string, any>;
  timestamp: Date;
  version: string;
  metadata: Record<string, any>;
}

export interface LearningGoal {
  id: string;
  name: string;
  description: string;
  type: 'accuracy' | 'performance' | 'efficiency' | 'custom';
  target: number;
  current: number;
  progress: number;
  deadline?: Date;
  status: 'active' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'critical';
  metrics: string[];
  milestones: LearningMilestone[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ModelComparison {
  id: string;
  name: string;
  models: string[];
  metrics: Record<string, number[]>;
  winner: string;
  confidence: number;
  timestamp: Date;
  dataset: string;
  methodology: string;
  insights: string[];
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface TrainingData {
  id: string;
  name: string;
  description: string;
  type: 'structured' | 'unstructured' | 'semi-structured';
  format: string;
  size: number;
  records: number;
  features: number;
  quality: number;
  source: string;
  lastUpdated: Date;
  version: string;
  metadata: Record<string, any>;
  schema: Record<string, any>;
  statistics: Record<string, any>;
}

export interface ValidationResult {
  id: string;
  modelId: string;
  dataset: string;
  metrics: Record<string, number>;
  predictions: any[];
  actualValues: any[];
  errors: any[];
  timestamp: Date;
  version: string;
  status: 'passed' | 'failed' | 'warning';
  confidence: number;
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface LearningProgress {
  userId: string;
  modelId: string;
  progress: number;
  accuracy: number;
  confidence: number;
  lastInteraction: Date;
  interactionCount: number;
  improvementRate: number;
  challenges: string[];
  achievements: string[];
  goals: LearningGoal[];
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface PersonalizationProfile {
  id: string;
  userId: string;
  preferences: Record<string, any>;
  behavior: Record<string, any>;
  performance: Record<string, any>;
  recommendations: string[];
  lastUpdated: Date;
  version: string;
  accuracy: number;
  confidence: number;
  metadata: Record<string, any>;
}

export interface ContextualLearning {
  id: string;
  context: string;
  learning: Record<string, any>;
  patterns: BehaviorPattern[];
  insights: LearningInsight[];
  adaptations: AdaptationStrategy[];
  timestamp: Date;
  version: string;
  metadata: Record<string, any>;
}

export interface ContinuousLearning {
  id: string;
  modelId: string;
  enabled: boolean;
  strategy: string;
  frequency: string;
  lastUpdate: Date;
  nextUpdate: Date;
  performance: Record<string, any>;
  adaptations: AdaptationStrategy[];
  insights: LearningInsight[];
  metadata: Record<string, any>;
}

// ============================================================================
// TRAINING TYPES
// ============================================================================

export interface TrainingLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  data?: Record<string, any>;
}

export interface TrainingMetrics {
  loss: number[];
  accuracy: number[];
  validationLoss: number[];
  validationAccuracy: number[];
  learningRate: number[];
  epoch: number[];
  timestamp: Date[];
}

export interface TrainingArtifact {
  id: string;
  name: string;
  type: 'model' | 'checkpoint' | 'log' | 'config' | 'data';
  path: string;
  size: number;
  checksum: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface AdaptationCondition {
  type: 'threshold' | 'trend' | 'pattern' | 'time' | 'custom';
  parameter: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'regex';
  value: any;
  duration?: number;
  confidence?: number;
}

export interface AdaptationAction {
  type: 'retrain' | 'reconfigure' | 'optimize' | 'notify' | 'custom';
  target: string;
  parameters: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout?: number;
  rollback?: boolean;
}

export interface LearningMilestone {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  progress: number;
  deadline?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  metadata: Record<string, any>;
}

// ============================================================================
// CROSS-GROUP INSIGHTS TYPES
// ============================================================================

export interface CrossGroupInsights {
  id: string;
  title: string;
  description: string;
  type: InsightType;
  category: InsightCategory;
  severity: InsightSeverity;
  confidence: number;
  actionable: boolean;
  dismissed: boolean;
  dismissedAt?: Date;
  dismissedBy?: string;
  data: Record<string, any>;
  recommendations: string[];
  timestamp: Date;
  expiresAt?: Date;
  isNew: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedSPAs: string[];
  impact: 'low' | 'medium' | 'high';
  correlations: SPACorrelation[];
  patterns: CrossGroupPattern[];
  metrics: InsightMetrics;
  trends: TrendAnalysis[];
  anomalies: AnomalyDetection[];
  performance: PerformanceInsight[];
  security: SecurityInsight[];
  compliance: ComplianceInsight[];
  dataQuality: DataQualityInsight[];
  userBehavior: UserBehaviorInsight[];
  systemHealth: SystemHealthInsight[];
  predictive: PredictiveInsight[];
  strategic: StrategicRecommendation[];
  visualization: InsightVisualization;
  dependencies: CrossGroupDependency[];
  history: InsightHistory[];
  alerts: InsightAlert[];
}

export enum InsightType {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  DATA_QUALITY = 'data_quality',
  USER_BEHAVIOR = 'user_behavior',
  SYSTEM_HEALTH = 'system_health',
  PREDICTIVE = 'predictive',
  STRATEGIC = 'strategic',
  ANOMALY = 'anomaly',
  TREND = 'trend',
  CORRELATION = 'correlation',
  OPTIMIZATION = 'optimization',
  RISK = 'risk',
  OPPORTUNITY = 'opportunity',
  BOTTLENECK = 'bottleneck',
  EFFICIENCY = 'efficiency'
}

export enum InsightCategory {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  DATA_QUALITY = 'data_quality',
  USER_BEHAVIOR = 'user_behavior',
  SYSTEM_HEALTH = 'system_health',
  BUSINESS = 'business',
  OPERATIONAL = 'operational',
  TECHNICAL = 'technical',
  STRATEGIC = 'strategic',
  TACTICAL = 'tactical',
  FINANCIAL = 'financial',
  RISK = 'risk',
  OPPORTUNITY = 'opportunity',
  EFFICIENCY = 'efficiency',
  INNOVATION = 'innovation'
}

export enum InsightSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

export interface SPACorrelation {
  spaId: string;
  spaName: string;
  correlationStrength: number;
  correlationType: 'positive' | 'negative' | 'neutral';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface CrossGroupPattern {
  id: string;
  name: string;
  description: string;
  type: 'behavioral' | 'performance' | 'security' | 'operational';
  frequency: number;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  spas: string[];
  indicators: string[];
  triggers: string[];
  consequences: string[];
  recommendations: string[];
  metadata: Record<string, any>;
}

export interface InsightMetrics {
  totalInsights: number;
  criticalInsights: number;
  highInsights: number;
  mediumInsights: number;
  lowInsights: number;
  actionableInsights: number;
  dismissedInsights: number;
  averageConfidence: number;
  averageImpact: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
  categories: Record<InsightCategory, number>;
  severities: Record<InsightSeverity, number>;
  spas: Record<string, number>;
}

export interface TrendAnalysis {
  id: string;
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number;
  confidence: number;
  timeRange: {
    start: Date;
    end: Date;
  };
  dataPoints: Array<{
    timestamp: Date;
    value: number;
  }>;
  prediction: {
    nextValue: number;
    confidence: number;
    timeframe: string;
  };
  significance: 'high' | 'medium' | 'low';
  description: string;
  recommendations: string[];
}

export interface AnomalyDetection {
  id: string;
  title: string;
  description: string;
  type: 'statistical' | 'behavioral' | 'temporal' | 'contextual';
  category: AnomalyCategory;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: InsightSeverity;
  confidence: number;
  timestamp: Date;
  duration: number;
  spas: string[];
  context: Record<string, any>;
  causes: string[];
  impact: 'high' | 'medium' | 'low';
  recommendations: string[];
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  source: string;
  location: string;
  affectedComponents: string[];
  relatedAnomalies: string[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'mitigating' | 'resolved' | 'false_positive';
  assignee?: string;
  escalationLevel: number;
  slaDeadline?: Date;
  lastUpdated: Date;
}

export interface PerformanceInsight {
  id: string;
  metric: string;
  currentValue: number;
  baselineValue: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  impact: 'high' | 'medium' | 'low';
  spas: string[];
  bottlenecks: string[];
  optimizations: string[];
  recommendations: string[];
  timestamp: Date;
  lastUpdated: Date;
}

export interface SecurityInsight {
  id: string;
  threatType: string;
  severity: InsightSeverity;
  confidence: number;
  affectedSPAs: string[];
  vulnerabilities: string[];
  attackVectors: string[];
  riskScore: number;
  mitigationSteps: string[];
  recommendations: string[];
  timestamp: Date;
  lastUpdated: Date;
  status: 'active' | 'mitigated' | 'resolved';
}

export interface ComplianceInsight {
  id: string;
  framework: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'at-risk';
  severity: InsightSeverity;
  spas: string[];
  violations: string[];
  risks: string[];
  remediationSteps: string[];
  recommendations: string[];
  dueDate?: Date;
  timestamp: Date;
  lastUpdated: Date;
}

export interface DataQualityInsight {
  id: string;
  dimension: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  status: 'good' | 'warning' | 'poor';
  issues: string[];
  affectedData: string[];
  spas: string[];
  impact: 'high' | 'medium' | 'low';
  remediationSteps: string[];
  recommendations: string[];
  timestamp: Date;
  lastUpdated: Date;
}

export interface UserBehaviorInsight {
  id: string;
  behaviorType: string;
  pattern: string;
  frequency: number;
  confidence: number;
  users: string[];
  spas: string[];
  context: Record<string, any>;
  implications: string[];
  opportunities: string[];
  recommendations: string[];
  timestamp: Date;
  lastUpdated: Date;
}

export interface SystemHealthInsight {
  id: string;
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  metrics: Record<string, number>;
  thresholds: Record<string, number>;
  trends: Record<string, string>;
  spas: string[];
  issues: string[];
  recommendations: string[];
  timestamp: Date;
  lastUpdated: Date;
}

export interface PredictiveInsight {
  id: string;
  prediction: string;
  probability: number;
  confidence: number;
  timeframe: string;
  factors: string[];
  impact: 'high' | 'medium' | 'low';
  spas: string[];
  scenarios: string[];
  recommendations: string[];
  timestamp: Date;
  lastUpdated: Date;
}

export interface StrategicRecommendation {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  roi: number;
  timeframe: string;
  spas: string[];
  dependencies: string[];
  risks: string[];
  benefits: string[];
  implementation: string[];
  metrics: string[];
  timestamp: Date;
  lastUpdated: Date;
  status: 'proposed' | 'approved' | 'implemented' | 'rejected';
}

export interface InsightVisualization {
  id: string;
  type: 'chart' | 'graph' | 'dashboard' | 'report';
  title: string;
  description: string;
  data: any;
  config: Record<string, any>;
  interactive: boolean;
  exportable: boolean;
  timestamp: Date;
  lastUpdated: Date;
}

export interface CrossGroupDependency {
  id: string;
  sourceSPA: string;
  targetSPA: string;
  type: 'data' | 'service' | 'workflow' | 'integration';
  strength: number;
  direction: 'bidirectional' | 'unidirectional';
  criticality: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  recommendations: string[];
  timestamp: Date;
  lastUpdated: Date;
}

export interface InsightHistory {
  id: string;
  insightId: string;
  action: 'created' | 'updated' | 'dismissed' | 'resolved' | 'escalated';
  timestamp: Date;
  userId: string;
  details: Record<string, any>;
  comments?: string;
}

export interface InsightAlert {
  id: string;
  insightId: string;
  type: 'notification' | 'email' | 'sms' | 'webhook';
  status: 'pending' | 'sent' | 'failed';
  recipients: string[];
  message: string;
  timestamp: Date;
  sentAt?: Date;
  failedAt?: Date;
  retryCount: number;
  maxRetries: number;
}

// ============================================================================
// ANOMALY DETECTION TYPES
// ============================================================================

export type AnomalyType = 'statistical' | 'behavioral' | 'temporal' | 'contextual' | 'pattern' | 'threshold' | 'outlier';
export type AnomalyCategory = 'security' | 'performance' | 'data_quality' | 'user_behavior' | 'system' | 'network' | 'storage' | 'compliance';
export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical' | 'extreme';

// AnomalyDetection interface already exists above, will be extended

export interface SecurityAnomaly extends AnomalyDetection {
  threatType: string;
  threatLevel: ThreatLevel;
  attackVector: string;
  vulnerability: string;
  riskScore: number;
  mitigationSteps: string[];
  iocIndicators: string[];
  affectedUsers: string[];
  dataExposure: boolean;
  complianceImpact: string[];
}

export interface PerformanceAnomaly extends AnomalyDetection {
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  threshold: number;
  baseline: number;
  trend: 'improving' | 'stable' | 'declining';
  bottleneck: string;
  optimization: string[];
  performanceImpact: number;
}

export interface DataQualityAnomaly extends AnomalyDetection {
  dataSource: string;
  qualityDimension: string;
  expectedQuality: number;
  actualQuality: number;
  affectedRecords: number;
  dataType: string;
  validationRules: string[];
  dataLineage: string[];
  qualityMetrics: Record<string, number>;
}

export interface UserBehaviorAnomaly extends AnomalyDetection {
  userId: string;
  behaviorType: string;
  pattern: string;
  frequency: number;
  deviation: number;
  userContext: Record<string, any>;
  riskScore: number;
  behavioralBaseline: Record<string, any>;
  anomalyScore: number;
}

export interface SystemAnomaly extends AnomalyDetection {
  component: string;
  systemMetrics: Record<string, number>;
  baselineMetrics: Record<string, number>;
  thresholdViolations: Record<string, number>;
  systemHealth: 'healthy' | 'warning' | 'critical';
  resourceUsage: Record<string, number>;
  errorLogs: string[];
  performanceMetrics: Record<string, number>;
}

export interface DetectionModel {
  id: string;
  name: string;
  description: string;
  type: 'statistical' | 'machine_learning' | 'rule_based' | 'behavioral' | 'hybrid';
  status: 'training' | 'trained' | 'active' | 'inactive' | 'error';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingDataSize: number;
  lastTrained: Date;
  version: string;
  configuration: ModelConfiguration;
  isActive: boolean;
  performanceMetrics: Record<string, number>;
  trainingHistory: TrainingSession[];
  validationResults: ValidationResult[];
}

export interface ModelConfiguration {
  algorithm: string;
  parameters: Record<string, any>;
  thresholds: Record<string, number>;
  features: string[];
  trainingSplit: number;
  validationSplit: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  regularization: Record<string, any>;
  earlyStopping: boolean;
  patience: number;
}

// TrainingSession and ValidationResult interfaces already exist above

export interface AnomalyPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  confidence: number;
  frequency: number;
  severity: AnomalySeverity;
  category: AnomalyCategory;
  indicators: string[];
  triggers: string[];
  conditions: Record<string, any>;
  actions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnomalyMetrics {
  totalDetections: number;
  falsePositives: number;
  truePositives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  responseTime: number;
  resolutionTime: number;
  detectionRate: number;
  falsePositiveRate: number;
  categoryBreakdown: Record<AnomalyCategory, number>;
  severityBreakdown: Record<AnomalySeverity, number>;
  timeSeriesData: Array<{ timestamp: Date; count: number }>;
}

export interface AnomalyAlert {
  id: string;
  anomalyId: string;
  type: 'notification' | 'email' | 'sms' | 'webhook' | 'escalation';
  status: 'pending' | 'sent' | 'failed' | 'acknowledged';
  recipients: string[];
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  sentAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  retryCount: number;
  maxRetries: number;
  escalationLevel: number;
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  conditions: Record<string, any>;
  thresholds: Record<string, number>;
  actions: string[];
  isActive: boolean;
  priority: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface ThresholdConfiguration {
  performance: { warning: number; critical: number };
  security: { warning: number; critical: number };
  dataQuality: { warning: number; critical: number };
  userBehavior: { warning: number; critical: number };
  system: { warning: number; critical: number };
  network: { warning: number; critical: number };
  storage: { warning: number; critical: number };
  compliance: { warning: number; critical: number };
}

export interface AnomalyHistory {
  id: string;
  anomalyId: string;
  action: 'detected' | 'investigated' | 'mitigated' | 'resolved' | 'escalated' | 'dismissed';
  timestamp: Date;
  userId: string;
  details: Record<string, any>;
  comments?: string;
  attachments?: string[];
  duration?: number;
  outcome?: string;
}

export interface BaselineProfile {
  id: string;
  name: string;
  description: string;
  scope: string;
  type: AnomalyCategory;
  metrics: Record<string, number>;
  thresholds: Record<string, number>;
  patterns: Record<string, any>;
  isActive: boolean;
  trainingPeriod: string;
  lastUpdated: Date;
  createdBy: string;
  validationMetrics: Record<string, number>;
  confidence: number;
  adaptiveThresholds: boolean;
  updateFrequency: string;
}

export interface AnomalyVisualization {
  id: string;
  type: 'chart' | 'graph' | 'dashboard' | 'report';
  title: string;
  description: string;
  data: any;
  config: Record<string, any>;
  interactive: boolean;
  exportable: boolean;
  timestamp: Date;
  lastUpdated: Date;
}

export interface AnomalyResponse {
  id: string;
  anomalyId: string;
  action: string;
  automated: boolean;
  context: Record<string, any>;
  timestamp: Date;
  userId?: string;
  details: Record<string, any>;
  outcome: string;
  duration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  nextSteps: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface AnomalyClassification {
  id: string;
  anomalyId: string;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  confidence: number;
  classifier: string;
  features: string[];
  scores: Record<string, number>;
  timestamp: Date;
  validated: boolean;
  validatedBy?: string;
  validationDate?: Date;
  notes?: string;
}

export interface ModelTraining {
  id: string;
  modelId: string;
  trainingData: any[];
  validationData: any[];
  hyperparameters: Record<string, any>;
  startTime: Date;
  endTime?: Date;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentEpoch: number;
  totalEpochs: number;
  metrics: Record<string, number>;
  logs: string[];
  error?: string;
  artifacts: string[];
}

export interface FalsePositiveTracker {
  id: string;
  anomalyId: string;
  reportedBy: string;
  reason: string;
  category: 'false_positive' | 'duplicate' | 'non_actionable' | 'test_data' | 'other';
  confidence: number;
  timestamp: Date;
  reviewed: boolean;
  reviewedBy?: string;
  reviewDate?: Date;
  reviewNotes?: string;
  action: 'dismiss' | 'adjust_threshold' | 'update_model' | 'modify_rule' | 'none';
  impact: 'low' | 'medium' | 'high';
  followUpRequired: boolean;
  followUpDate?: Date;
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending' | 'review' | 'at_risk' | 'exempt';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'extreme';
export type ControlType = 'preventive' | 'detective' | 'corrective' | 'deterrent' | 'recovery';
export type AuditFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'on_demand';

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'regulatory' | 'industry' | 'internal' | 'international';
  jurisdiction: string;
  effectiveDate: Date;
  expiryDate?: Date;
  status: 'active' | 'draft' | 'archived' | 'superseded';
  requirements: RegulatoryRequirement[];
  controls: ControlFramework[];
  certifications: CertificationStatus[];
  lastUpdated: Date;
  createdBy: string;
  metadata: Record<string, any>;
}

export interface RegulatoryRequirement {
  id: string;
  frameworkId: string;
  code: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: RiskLevel;
  impact: 'low' | 'medium' | 'high';
  deadline?: Date;
  frequency: AuditFrequency;
  controls: string[];
  dependencies: string[];
  exemptions: string[];
  penalties: string[];
  lastUpdated: Date;
  version: string;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  framework: string;
  requirement: string;
  ruleType: 'validation' | 'enforcement' | 'monitoring' | 'reporting';
  conditions: Record<string, any>;
  actions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  enabled: boolean;
  lastEvaluated: Date;
  evaluationCount: number;
  successRate: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceAssessment {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  status: ComplianceStatus;
  riskLevel: RiskLevel;
  complianceScore: number;
  assessmentDate: Date;
  nextAssessmentDate: Date;
  assessor: string;
  findings: string[];
  recommendations: string[];
  violations: string[];
  evidence: string[];
  attachments: string[];
  metadata: Record<string, any>;
  timestamp: Date;
  lastUpdated: Date;
}

export interface ComplianceReport {
  id: string;
  title: string;
  description: string;
  framework: string;
  scope: string;
  period: {
    start: Date;
    end: Date;
  };
  executiveSummary: string;
  findings: ComplianceFinding[];
  recommendations: string[];
  violations: ComplianceViolation[];
  metrics: ComplianceMetrics;
  attachments: string[];
  generatedBy: string;
  generatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'draft' | 'review' | 'approved' | 'final';
  version: string;
}

export interface ComplianceFinding {
  id: string;
  requirement: string;
  finding: string;
  severity: RiskLevel;
  impact: 'low' | 'medium' | 'high';
  evidence: string[];
  recommendations: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  resolution: string;
}

export interface ComplianceViolation {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  severity: RiskLevel;
  detectedAt: Date;
  dueDate?: Date;
  status: 'open' | 'acknowledged' | 'in_remediation' | 'resolved' | 'closed';
  assignedTo?: string;
  remediation: string;
  recommendedRemediation: string;
  remediationDeadline?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  automated: boolean;
  metadata: Record<string, any>;
  resolved: boolean;
}

export interface ComplianceRemediation {
  id: string;
  violationId: string;
  action: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'verified' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  startDate: Date;
  dueDate: Date;
  completedAt?: Date;
  verificationDate?: Date;
  verifiedBy?: string;
  cost: number;
  effort: string;
  dependencies: string[];
  risks: string[];
  successCriteria: string[];
  notes: string[];
}

export interface ComplianceMetrics {
  totalRequirements: number;
  compliantRequirements: number;
  nonCompliantRequirements: number;
  pendingRequirements: number;
  overallScore: number;
  frameworkScores: Record<string, number>;
  riskDistribution: Record<RiskLevel, number>;
  violationTrends: Array<{ date: Date; count: number }>;
  remediationEfficiency: number;
  averageResolutionTime: number;
  lastUpdated: Date;
}

export interface AuditTrail {
  id: string;
  action: string;
  type: 'assessment' | 'violation' | 'remediation' | 'policy' | 'audit';
  user: string;
  timestamp: Date;
  details: Record<string, any>;
  resource: string;
  resourceType: string;
  beforeState?: any;
  afterState?: any;
  metadata: Record<string, any>;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'data_governance' | 'access_control' | 'privacy' | 'security' | 'retention' | 'quality';
  framework: string;
  content: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastReviewed: Date;
  reviewFrequency: AuditFrequency;
  approvers: string[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface ControlFramework {
  id: string;
  name: string;
  description: string;
  type: ControlType;
  category: string;
  framework: string;
  requirements: string[];
  controls: Control[];
  effectiveness: number;
  lastEvaluated: Date;
  nextEvaluation: Date;
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  metadata: Record<string, any>;
}

export interface Control {
  id: string;
  name: string;
  description: string;
  type: ControlType;
  category: string;
  framework: string;
  requirements: string[];
  implementation: string;
  testing: string;
  monitoring: string;
  effectiveness: number;
  lastTested: Date;
  nextTest: Date;
  status: 'active' | 'inactive' | 'deprecated';
  owner: string;
  metadata: Record<string, any>;
}

export interface RiskAssessment {
  id: string;
  title: string;
  description: string;
  framework: string;
  riskLevel: RiskLevel;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  riskScore: number;
  riskDescription: string;
  riskFactors: string[];
  mitigationStrategies: string[];
  controls: string[];
  residualRisk: RiskLevel;
  assessmentDate: Date;
  nextAssessment: Date;
  assessor: string;
  status: 'open' | 'mitigated' | 'accepted' | 'transferred';
  metadata: Record<string, any>;
}

export interface ComplianceGap {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  gapType: 'missing_control' | 'ineffective_control' | 'unimplemented_requirement' | 'process_gap';
  severity: RiskLevel;
  impact: 'low' | 'medium' | 'high';
  businessImpact: string;
  technicalImpact: string;
  remediation: string;
  effort: 'low' | 'medium' | 'high';
  cost: number;
  timeline: string;
  dependencies: string[];
  assignedTo?: string;
  dueDate?: Date;
  status: 'identified' | 'in_remediation' | 'resolved' | 'verified';
  identifiedAt: Date;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

export interface ComplianceMonitoring {
  id: string;
  framework: string;
  requirement: string;
  monitoringType: 'continuous' | 'periodic' | 'event_based';
  frequency: AuditFrequency;
  enabled: boolean;
  lastCheck: Date;
  nextCheck: Date;
  status: 'healthy' | 'warning' | 'critical' | 'error';
  metrics: Record<string, number>;
  alerts: ComplianceAlert[];
  configuration: Record<string, any>;
  metadata: Record<string, any>;
}

export interface CertificationStatus {
  id: string;
  framework: string;
  certification: string;
  status: 'certified' | 'in_progress' | 'expired' | 'suspended' | 'revoked';
  issueDate: Date;
  expiryDate: Date;
  renewalDate?: Date;
  certifyingBody: string;
  scope: string;
  conditions: string[];
  restrictions: string[];
  auditHistory: AuditTrail[];
  documents: string[];
  metadata: Record<string, any>;
}

export interface ComplianceSchedule {
  id: string;
  type: 'assessment' | 'audit' | 'review' | 'certification' | 'training';
  title: string;
  description: string;
  framework: string;
  dueDate: Date;
  startDate?: Date;
  endDate?: Date;
  frequency: AuditFrequency;
  assignedTo: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  resources: string[];
  estimatedEffort: string;
  actualEffort?: string;
  notes: string[];
  metadata: Record<string, any>;
}

export interface ComplianceWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'assessment' | 'remediation' | 'audit' | 'certification' | 'review';
  framework: string;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignees: string[];
  startDate: Date;
  dueDate: Date;
  completedAt?: Date;
  progress: number;
  metadata: Record<string, any>;
}

export interface ComplianceAlert {
  id: string;
  type: 'violation' | 'deadline' | 'risk' | 'control_failure' | 'certification_expiry';
  title: string;
  message: string;
  severity: RiskLevel;
  framework: string;
  requirement?: string;
  resource?: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  escalationLevel: number;
  recipients: string[];
  metadata: Record<string, any>;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  type: 'data_governance' | 'access_control' | 'privacy' | 'security' | 'retention' | 'quality';
  category: string;
  framework: string;
  version: string;
  status: 'draft' | 'active' | 'archived' | 'superseded';
  content: string;
  objectives: string[];
  scope: string;
  responsibilities: string[];
  complianceRequirements: string[];
  controls: string[];
  exceptions: string[];
  enforcement: string;
  monitoring: string;
  reviewFrequency: AuditFrequency;
  lastReviewed: Date;
  nextReview: Date;
  approvers: string[];
  stakeholders: string[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metadata: Record<string, any>;
}

// ============================================================================
// CONTEXT-AWARE ASSISTANT TYPES
// ============================================================================

export interface ContextualResponse {
  id: string;
  message: string;
  context: AIContext;
  suggestions: string[];
  actions: AIAction[];
  insights: AIInsight[];
  confidence: number;
  processingTime: number;
  metadata: Record<string, any>;
  timestamp: Date;
  relevanceScore: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ContextualRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  relevanceScore: number;
  context: AIContext;
  implementation: Record<string, any>;
  estimatedEffort: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  dependencies: string[];
  tags: string[];
  generatedAt: Date;
  executed: boolean;
  executedAt?: Date;
  executedBy?: string;
  dismissed: boolean;
  dismissedAt?: Date;
  dismissedBy?: string;
  feedback?: {
    rating: number;
    comment?: string;
    timestamp: Date;
  };
}

export interface ContextAnalysis {
  id: string;
  userId: string;
  analysisType: 'user_behavior' | 'system_performance' | 'workflow_optimization' | 'security' | 'comprehensive';
  insights: Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    data: Record<string, any>;
    category: string;
    actionable: boolean;
    recommendations: string[];
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    implementation: Record<string, any>;
    estimatedEffort: string;
    estimatedImpact: 'low' | 'medium' | 'high';
  }>;
  userExperienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  userActivityLevel: number; // 0-1
  workspaceComplexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  workspaceUsage: number; // 0-1
  spaIntegrationLevel: number; // 0-1
  spaUtilization: number; // 0-1
  systemPerformance: number; // 0-1
  domainKnowledge: Record<string, any>;
  conceptRelationships: Record<string, any>;
  ontologyMappings: Record<string, any>;
  semanticSimilarity: Record<string, any>;
  knowledgeGraph: Record<string, any>;
  timestamp: Date;
  lastUpdated: Date;
  version: string;
}

export interface UserBehaviorPattern {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'adaptive';
  pattern: string;
  confidence: number;
  frequency: number;
  significance: number;
  duration: string;
  detectedAt: Date;
  lastSeen: Date;
  context: Record<string, any>;
  triggers: string[];
  consequences: string[];
  recommendations: string[];
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface WorkspaceContext {
  id: string;
  name: string;
  type: string;
  configuration: Record<string, any>;
  metrics: Record<string, number>;
  usage: Record<string, any>;
  members: string[];
  permissions: Record<string, any>;
  lastUpdated: Date;
}

export interface SPAContext {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  integration: Record<string, any>;
  utilization: Record<string, any>;
  performance: Record<string, any>;
  lastUpdated: Date;
}

export interface EnvironmentalContext {
  systemLoad: number; // 0-1
  memoryUsage: number; // 0-1
  networkLatency: number;
  activeConnections: number;
  concurrentUsers: number;
  systemVersion: string;
  deployment: string;
  temperature?: number;
  humidity?: number;
  location?: string;
  timezone: string;
  locale: string;
}

export interface TemporalContext {
  currentTime: Date;
  timezone: string;
  workingHours: {
    start: number;
    end: number;
    timezone: string;
  };
  sessionDuration: number; // milliseconds
  lastActivity: Date;
  activityFrequency: Record<string, number>;
  peakUsageTime?: string;
  seasonalPatterns?: Record<string, any>;
  businessHours: boolean;
}

export interface CollaborativeContext {
  activeCollaborators: string[];
  sharedWorkspaces: string[];
  teamDynamics: Record<string, any>;
  communicationPatterns: Record<string, any>;
  expertiseNetwork: Record<string, any>;
  collaborationHistory: Array<{
    type: string;
    participants: string[];
    duration: number;
    outcome: string;
    timestamp: Date;
  }>;
  teamPerformance: Record<string, number>;
}

export interface SemanticContext {
  domainKnowledge: Record<string, any>;
  conceptRelationships: Record<string, any>;
  ontologyMappings: Record<string, any>;
  semanticSimilarity: Record<string, any>;
  knowledgeGraph: Record<string, any>;
  vocabulary: string[];
  contextRules: Array<{
    condition: string;
    action: string;
    priority: number;
  }>;
  semanticModels: Array<{
    name: string;
    type: string;
    confidence: number;
    lastUpdated: Date;
  }>;
}

// ============================================================================
// PROACTIVE RECOMMENDATION TYPES
// ============================================================================

export interface RecommendationEngine {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  configuration: Record<string, any>;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    lastUpdated: Date;
  };
  learningModels: string[];
  activeRecommendations: number;
  totalRecommendations: number;
  lastTraining: Date;
  nextTraining: Date;
  metadata: Record<string, any>;
}

// AIRecommendation interface already exists above, will be extended

export type RecommendationType = 'proactive' | 'reactive' | 'predictive' | 'prescriptive' | 'diagnostic';
export type RecommendationCategory = 'performance' | 'security' | 'compliance' | 'data_quality' | 'workflow' | 'cost' | 'user_experience' | 'operational' | 'strategic';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecommendationSource = 'ai_analysis' | 'user_behavior' | 'system_monitoring' | 'compliance_audit' | 'performance_metrics' | 'security_scan' | 'cost_analysis' | 'user_feedback';

export interface RecommendationContext {
  user: any;
  workspace: any;
  activeSPA: string | null;
  systemHealth: any;
  userBehavior: any;
  recentActivities: any[];
  spaStatus: any;
  workspaceMetrics: any;
  timestamp: Date;
  sessionId: string;
}

export interface RecommendationMetrics {
  totalRecommendations: number;
  executedRecommendations: number;
  dismissedRecommendations: number;
  pendingRecommendations: number;
  executionRate: number;
  averageAccuracy: number;
  userSatisfaction: number;
  averageExecutionTime: number;
  categoryDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  trendAnalysis: Array<{
    date: Date;
    generated: number;
    executed: number;
    accuracy: number;
  }>;
  lastUpdated: Date;
}

export interface SystemAnalysis {
  id: string;
  type: 'performance' | 'security' | 'compliance' | 'data_quality' | 'workflow' | 'cost';
  findings: Array<{
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    recommendations: string[];
    evidence: any[];
  }>;
  metrics: Record<string, number>;
  thresholds: Record<string, number>;
  violations: Array<{
    rule: string;
    currentValue: number;
    threshold: number;
    severity: string;
  }>;
  timestamp: Date;
  analyst: string;
  status: 'active' | 'resolved' | 'monitoring';
}

export interface PerformanceOptimization {
  id: string;
  target: string;
  currentPerformance: number;
  targetPerformance: number;
  optimizationType: 'cpu' | 'memory' | 'network' | 'storage' | 'response_time' | 'throughput';
  recommendations: string[];
  expectedImprovement: number;
  implementationSteps: string[];
  rollbackPlan: string[];
  estimatedEffort: string;
  estimatedCost: number;
  riskAssessment: string;
  successMetrics: Record<string, number>;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  startDate?: Date;
  completionDate?: Date;
  results?: Record<string, any>;
}

export interface SecurityRecommendation {
  id: string;
  threat: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerability: string;
  affectedComponents: string[];
  impact: string;
  remediation: string;
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  complianceRequirements: string[];
  securityControls: string[];
  testingRequirements: string[];
  validationCriteria: string[];
  estimatedEffort: string;
  estimatedCost: number;
  dependencies: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'verified';
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  verificationDate?: Date;
}

export interface ComplianceRecommendation {
  id: string;
  framework: string;
  requirement: string;
  gap: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  businessImpact: string;
  technicalImpact: string;
  remediation: string;
  controls: string[];
  evidence: string[];
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  cost: number;
  dependencies: string[];
  status: 'identified' | 'in_remediation' | 'resolved' | 'verified';
  assignedTo?: string;
  resolvedAt?: Date;
  verificationDate?: Date;
}

export interface DataQualityRecommendation {
  id: string;
  dataSource: string;
  qualityIssue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  rootCause: string;
  remediation: string;
  dataProfiling: Record<string, any>;
  qualityMetrics: Record<string, number>;
  validationRules: string[];
  monitoringRequirements: string[];
  estimatedEffort: string;
  estimatedCost: number;
  dependencies: string[];
  status: 'identified' | 'in_progress' | 'resolved' | 'verified';
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
}

export interface WorkflowOptimization {
  id: string;
  workflow: string;
  currentEfficiency: number;
  targetEfficiency: number;
  bottlenecks: string[];
  optimizationAreas: string[];
  recommendations: string[];
  expectedImprovement: number;
  implementationSteps: string[];
  processChanges: string[];
  trainingRequirements: string[];
  estimatedEffort: string;
  estimatedCost: number;
  successMetrics: Record<string, number>;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  startDate?: Date;
  completionDate?: Date;
  results?: Record<string, any>;
}

export interface CostOptimization {
  id: string;
  area: string;
  currentCost: number;
  targetCost: number;
  costDrivers: string[];
  optimizationStrategies: string[];
  recommendations: string[];
  expectedSavings: number;
  implementationCost: number;
  paybackPeriod: string;
  riskFactors: string[];
  dependencies: string[];
  successMetrics: Record<string, number>;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  startDate?: Date;
  completionDate?: Date;
  actualSavings?: number;
}

export interface RecommendationFeedback {
  type: 'helpful' | 'not_helpful' | 'inaccurate' | 'irrelevant' | 'dismissed' | 'executed';
  useful: boolean;
  rating: number;
  userId: string;
  timestamp: Date;
  comment?: string;
  context?: any;
  metadata?: Record<string, any>;
}

export interface RecommendationHistory {
  id: string;
  recommendationId: string;
  action: 'generated' | 'viewed' | 'executed' | 'dismissed' | 'feedback_submitted';
  userId: string;
  timestamp: Date;
  context: any;
  metadata: Record<string, any>;
}

// ============================================================================
// WORKFLOW AUTOMATION TYPES
// ============================================================================

export interface WorkflowAutomationEngine {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  configuration: Record<string, any>;
  capabilities: string[];
  supportedWorkflowTypes: string[];
  maxConcurrentWorkflows: number;
  currentLoad: number;
  performance: {
    averageExecutionTime: number;
    successRate: number;
    errorRate: number;
    throughput: number;
    lastUpdated: Date;
  };
  metadata: Record<string, any>;
}

export interface AutomatedWorkflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  type: 'sequential' | 'parallel' | 'conditional' | 'loop' | 'hybrid';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  schedule?: WorkflowSchedule;
  variables: Record<string, any>;
  dependencies: WorkflowDependency[];
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  tags: string[];
  isTemplate: boolean;
  templateId?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedExecutionTime: string;
  estimatedEffort: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  variables: Record<string, any>;
  dependencies: WorkflowDependency[];
  useCount: number;
  rating: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  metadata: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  context: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  successCount: number;
  failureCount: number;
  metadata: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: number;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  logs: string[];
  metadata: Record<string, any>;
  executedBy: string;
  retryCount: number;
  maxRetries: number;
  nextRetry?: Date;
  dependencies: string[];
  tags: string[];
}

export interface WorkflowTrigger {
  id: string;
  type: 'schedule' | 'event' | 'condition' | 'manual' | 'webhook' | 'api';
  name: string;
  description: string;
  configuration: Record<string, any>;
  isActive: boolean;
  lastTriggered?: Date;
  triggerCount: number;
  metadata: Record<string, any>;
}

export interface WorkflowAction {
  id: string;
  type: 'api_call' | 'data_operation' | 'notification' | 'file_operation' | 'system_action' | 'custom';
  name: string;
  description: string;
  configuration: Record<string, any>;
  parameters: Record<string, any>;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: string;
    retryableErrors: string[];
  };
  errorHandling: {
    onError: string;
    fallbackAction?: string;
    notificationRecipients?: string[];
  };
  metadata: Record<string, any>;
}

export interface WorkflowCondition {
  id: string;
  type: 'comparison' | 'logical' | 'temporal' | 'data' | 'custom';
  name: string;
  description: string;
  expression: string;
  parameters: Record<string, any>;
  evaluationOrder: number;
  isRequired: boolean;
  metadata: Record<string, any>;
}

export interface WorkflowSchedule {
  id: string;
  type: 'one_time' | 'recurring' | 'cron' | 'event_based';
  name: string;
  description: string;
  configuration: Record<string, any>;
  timezone: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  lastScheduled?: Date;
  nextScheduled?: Date;
  metadata: Record<string, any>;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped' | 'cancelled' | 'retrying';

export interface AutomationMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  pendingExecutions: number;
  runningExecutions: number;
  averageExecutionTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  lastUpdated: Date;
  timeSeriesData: Array<{
    timestamp: Date;
    executions: number;
    successRate: number;
    averageTime: number;
  }>;
}

export interface AIWorkflowSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  estimatedImpact: 'low' | 'medium' | 'high';
  estimatedEffort: 'low' | 'medium' | 'high';
  benefits: string[];
  risks: string[];
  template?: WorkflowTemplate;
  context: Record<string, any>;
  generatedAt: Date;
  metadata: Record<string, any>;
}

export interface WorkflowAnalytics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  successRate: number;
  errorRate: number;
  throughput: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<ExecutionStatus, number>;
  timeSeriesData: Array<{
    timestamp: Date;
    executions: number;
    successRate: number;
    averageTime: number;
  }>;
  performanceTrends: Array<{
    metric: string;
    trend: 'improving' | 'stable' | 'declining';
    change: number;
  }>;
  lastUpdated: Date;
}

export interface ExecutionHistory {
  id: string;
  executionId: string;
  action: 'started' | 'completed' | 'failed' | 'stopped' | 'retried';
  timestamp: Date;
  details: Record<string, any>;
  userId?: string;
  metadata: Record<string, any>;
}

export interface WorkflowDependency {
  id: string;
  sourceWorkflow: string;
  targetWorkflow: string;
  type: 'data' | 'execution' | 'resource' | 'temporal';
  strength: number;
  description: string;
  isRequired: boolean;
  metadata: Record<string, any>;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  value: any;
  defaultValue?: any;
  isRequired: boolean;
  description: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
  metadata: Record<string, any>;
}

export interface WorkflowValidator {
  id: string;
  name: string;
  type: 'syntax' | 'semantic' | 'business_logic' | 'performance' | 'security';
  rules: string[];
  isActive: boolean;
  lastValidated?: Date;
  validationResults: Array<{
    rule: string;
    passed: boolean;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
  metadata: Record<string, any>;
}

export interface AutomationInsight {
  id: string;
  type: 'performance' | 'cost' | 'reliability' | 'efficiency' | 'optimization';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: Record<string, any>;
  timestamp: Date;
  metadata: Record<string, any>;
}

// ============================================================================
// VOICE CONTROL TYPES
// ============================================================================

export interface VoiceControlConfig {
  enabled: boolean;
  language: string;
  voiceProfile: string;
  audioQuality: AudioQuality;
  noiseFilter: NoiseFilter;
  accessibilityMode: boolean;
  trainingMode: boolean;
  autoCalibration: boolean;
  speechEngine: string;
  deviceId: string;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  latency: number;
  volume: number;
  speed: number;
  pitch: number;
  metadata: Record<string, any>;
}

export interface SpeechRecognitionResult {
  id: string;
  text: string;
  confidence: number;
  language: string;
  timestamp: Date;
  duration: number;
  audioData?: ArrayBuffer;
  metadata: {
    noiseLevel: number;
    clarity: number;
    backgroundNoise: number;
    userDistance: number;
    deviceQuality: number;
  };
  alternatives: Array<{
    text: string;
    confidence: number;
  }>;
  isFinal: boolean;
  error?: string;
}

export interface VoiceSynthesisConfig {
  voice: string;
  language: string;
  speed: number;
  pitch: number;
  volume: number;
  quality: AudioQuality;
  format: 'mp3' | 'wav' | 'ogg' | 'aac';
  sampleRate: number;
  channels: number;
  bitDepth: number;
  compression: number;
  metadata: Record<string, any>;
}

export interface VoiceProfile {
  id: string;
  name: string;
  userId: string;
  language: string;
  accent: string;
  gender: 'male' | 'female' | 'neutral';
  age: number;
  speakingStyle: string;
  vocabulary: string[];
  pronunciation: Record<string, string>;
  speed: number;
  pitch: number;
  volume: number;
  clarity: number;
  trainingData: VoiceTraining[];
  personalization: VoicePersonalization;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioDevice {
  id: string;
  name: string;
  type: 'input' | 'output' | 'both';
  manufacturer: string;
  model: string;
  capabilities: {
    sampleRates: number[];
    channels: number[];
    bitDepths: number[];
    formats: string[];
    latency: number;
    quality: AudioQuality;
  };
  status: 'connected' | 'disconnected' | 'error';
  isDefault: boolean;
  metadata: Record<string, any>;
}

export interface VoiceMetrics {
  accuracy: number;
  responseTime: number;
  recognitionRate: number;
  synthesisQuality: number;
  noiseReduction: number;
  latency: number;
  throughput: number;
  errorRate: number;
  userSatisfaction: number;
  trainingProgress: number;
  personalizationScore: number;
  accessibilityScore: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface SpeechPattern {
  id: string;
  userId: string;
  pattern: string;
  frequency: number;
  context: string;
  confidence: number;
  language: string;
  accent: string;
  speed: number;
  clarity: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface LanguageModel {
  id: string;
  name: string;
  language: string;
  version: string;
  accuracy: number;
  vocabulary: string[];
  grammar: Record<string, any>;
  pronunciation: Record<string, string>;
  context: Record<string, any>;
  trainingData: any[];
  performance: {
    recognitionSpeed: number;
    accuracy: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  metadata: Record<string, any>;
}

export interface VoiceControlStatus {
  isListening: boolean;
  isSpeaking: boolean;
  isTraining: boolean;
  isCalibrating: boolean;
  currentLanguage: string;
  currentVoice: string;
  audioLevel: number;
  noiseLevel: number;
  confidence: number;
  error?: string;
  warnings: string[];
  metadata: Record<string, any>;
}

export interface AudioQuality {
  level: 'low' | 'medium' | 'high' | 'ultra';
  sampleRate: number;
  channels: number;
  bitDepth: number;
  compression: number;
  format: string;
  metadata: Record<string, any>;
}

export interface NoiseFilter {
  id: string;
  name: string;
  type: 'adaptive' | 'static' | 'ai_enhanced';
  algorithm: string;
  parameters: Record<string, any>;
  effectiveness: number;
  latency: number;
  resourceUsage: number;
  metadata: Record<string, any>;
}

export interface VoicePersonalization {
  userId: string;
  preferences: {
    voiceType: string;
    speed: number;
    pitch: number;
    volume: number;
    language: string;
    accent: string;
  };
  learningData: {
    commonPhrases: string[];
    pronunciation: Record<string, string>;
    context: Record<string, any>;
    feedback: Array<{
      rating: number;
      comment: string;
      timestamp: Date;
    }>;
  };
  adaptiveFeatures: {
    autoSpeed: boolean;
    contextAwareness: boolean;
    accentAdaptation: boolean;
    vocabularyLearning: boolean;
  };
  metadata: Record<string, any>;
}

export interface CommandHistory {
  id: string;
  userId: string;
  command: VoiceCommand;
  result: any;
  timestamp: Date;
  duration: number;
  success: boolean;
  error?: string;
  metadata: Record<string, any>;
}

export interface VoiceTraining {
  id: string;
  userId: string;
  type: 'pronunciation' | 'accent' | 'vocabulary' | 'context';
  data: any;
  progress: number;
  accuracy: number;
  completedAt?: Date;
  metadata: Record<string, any>;
}

export interface SpeechEngineConfig {
  id: string;
  name: string;
  type: 'recognition' | 'synthesis' | 'both';
  provider: string;
  version: string;
  capabilities: string[];
  configuration: Record<string, any>;
  performance: {
    accuracy: number;
    speed: number;
    resourceUsage: number;
    reliability: number;
  };
  metadata: Record<string, any>;
}

export interface VoiceAnalytics {
  userId: string;
  timeRange: string;
  metrics: VoiceMetrics;
  patterns: SpeechPattern[];
  commands: CommandHistory[];
  training: VoiceTraining[];
  personalization: VoicePersonalization;
  deviceUsage: AudioDevice[];
  languageUsage: Record<string, number>;
  accessibilityUsage: Record<string, number>;
  metadata: Record<string, any>;
}

export interface AccessibilityFeatures {
  id: string;
  name: string;
  type: 'visual' | 'auditory' | 'motor' | 'cognitive';
  description: string;
  enabled: boolean;
  configuration: Record<string, any>;
  effectiveness: number;
  userRating: number;
  metadata: Record<string, any>;
}

// ============================================================================
// NATURAL LANGUAGE PROCESSING TYPES
// ============================================================================

export interface NLPProcessor {
  id: string;
  name: string;
  version: string;
  capabilities: NLPCapability[];
  supportedLanguages: LanguageSupport[];
  processingModes: ProcessingMode[];
  configuration: ModelConfiguration;
  performance: NLPMetrics;
  status: 'active' | 'inactive' | 'training' | 'error';
  lastUpdated: Date;
  metadata: Record<string, any>;
}

export interface IntentRecognition {
  id: string;
  text: string;
  intent: IntentClassification;
  confidence: ConfidenceScore;
  entities: EntityExtraction[];
  context: AIContext;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface EntityExtraction {
  id: string;
  text: string;
  type: EntityType;
  value: string;
  confidence: ConfidenceScore;
  startIndex: number;
  endIndex: number;
  metadata: Record<string, any>;
}

export interface SentimentAnalysis {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: ConfidenceScore;
  scores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  aspects: Array<{
    aspect: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }>;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface LanguageDetection {
  id: string;
  text: string;
  detectedLanguage: string;
  confidence: ConfidenceScore;
  alternativeLanguages: Array<{
    language: string;
    confidence: number;
  }>;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface SemanticAnalysis {
  id: string;
  text: string;
  topics: string[];
  keywords: string[];
  concepts: Array<{
    concept: string;
    relevance: number;
    confidence: number;
  }>;
  semanticSimilarity: Record<string, number>;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ContextualUnderstanding {
  id: string;
  text: string;
  context: AIContext;
  userIntent: string;
  conversationHistory: any[];
  relevantEntities: EntityExtraction[];
  contextualClues: string[];
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface QueryProcessing {
  id: string;
  query: string;
  processedQuery: string;
  intent: IntentRecognition;
  entities: EntityExtraction[];
  context: AIContext;
  processingSteps: string[];
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ResponseGeneration {
  id: string;
  query: QueryProcessing;
  response: string;
  confidence: ConfidenceScore;
  alternatives: string[];
  reasoning: string;
  sources: string[];
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ConversationFlow {
  id: string;
  sessionId: string;
  messages: Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata: Record<string, any>;
  }>;
  context: AIContext;
  flowState: 'active' | 'paused' | 'completed' | 'error';
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface NLPModel {
  id: string;
  name: string;
  type: 'intent' | 'entity' | 'sentiment' | 'language' | 'semantic' | 'multimodal';
  version: string;
  architecture: string;
  trainingData: TrainingData;
  performance: NLPMetrics;
  configuration: ModelConfiguration;
  status: 'active' | 'inactive' | 'training' | 'error';
  lastUpdated: Date;
  metadata: Record<string, any>;
}

export interface ProcessingPipeline {
  id: string;
  name: string;
  steps: Array<{
    id: string;
    name: string;
    type: string;
    order: number;
    configuration: Record<string, any>;
    status: 'active' | 'inactive' | 'error';
  }>;
  inputType: string;
  outputType: string;
  performance: NLPMetrics;
  status: 'active' | 'inactive' | 'error';
  lastUpdated: Date;
  metadata: Record<string, any>;
}

export interface NLPMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
  errorRate: number;
  confidence: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface IntentClassification {
  category: string;
  subcategory?: string;
  confidence: number;
  alternatives: Array<{
    category: string;
    confidence: number;
  }>;
}

export type EntityType = 
  | 'person' | 'organization' | 'location' | 'date' | 'time' 
  | 'money' | 'percentage' | 'email' | 'url' | 'phone'
  | 'product' | 'event' | 'concept' | 'custom';

export type ConfidenceScore = number; // 0.0 to 1.0

export type ProcessingMode = 
  | 'real-time' | 'batch' | 'streaming' | 'interactive' | 'offline';

export interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  supportLevel: 'full' | 'partial' | 'basic';
  features: string[];
}

export interface NLPCapability {
  name: string;
  description: string;
  supportedLanguages: string[];
  accuracy: number;
  latency: number;
  status: 'available' | 'unavailable' | 'deprecated';
}

// Additional types needed for NaturalLanguageProcessor
export interface ProcessingResult {
  id: string;
  query: string;
  intents: IntentRecognition[];
  entities: EntityExtraction[];
  semanticAnalysis: SemanticAnalysis | null;
  sentimentAnalysis: SentimentAnalysis | null;
  languageDetection: LanguageDetection | null;
  processingTime: number;
  confidence: number;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface NLPTrainingData {
  id: string;
  text: string;
  intent: string;
  entities: EntityExtraction[];
  sentiment: 'positive' | 'negative' | 'neutral';
  language: string;
  context: Record<string, any>;
  quality: number;
  createdAt: string;
  examples: Array<{
    text: string;
    intent: string;
    entities: EntityExtraction[];
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
}
