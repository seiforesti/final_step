// ai-assistant-constants.ts
// Constants for AI Assistant component in Racine Main Manager

export const AI_ASSISTANT_CONFIG = {
  DEFAULT_MODEL: 'gpt-4',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2000,
  MAX_MESSAGE_LENGTH: 4000,
  MAX_SUGGESTIONS: 5,
  MAX_ACTIONS: 3,
  MAX_INSIGHTS: 3,
  STREAMING_DELAY: 50,
  TYPING_INDICATOR_DELAY: 1000,
  SUGGESTION_TIMEOUT: 5000,
  CONTEXT_WINDOW_SIZE: 10,
  CONFIDENCE_THRESHOLD: 0.7,
  PROCESSING_TIMEOUT: 30000
} as const;

export const AI_ASSISTANT_MODELS = {
  GPT_4: 'gpt-4',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  CLAUDE_3_OPUS: 'claude-3-opus-20240229',
  CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU: 'claude-3-haiku-20240307'
} as const;

export const AI_ASSISTANT_CAPABILITIES = {
  CODE_ANALYSIS: 'code-analysis',
  DATA_INSIGHTS: 'data-insights',
  PERFORMANCE_OPTIMIZATION: 'performance-optimization',
  SECURITY_AUDIT: 'security-audit',
  WORKFLOW_ASSISTANCE: 'workflow-assistance',
  TROUBLESHOOTING: 'troubleshooting',
  DOCUMENTATION: 'documentation',
  TRAINING: 'training'
} as const;

export const AI_ASSISTANT_ACTIONS = {
  NAVIGATE: 'navigate',
  EXECUTE: 'execute',
  ANALYZE: 'analyze',
  OPTIMIZE: 'optimize',
  CONFIGURE: 'configure',
  MONITOR: 'monitor',
  REPORT: 'report',
  ALERT: 'alert'
} as const;

export const AI_ASSISTANT_INSIGHT_TYPES = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  OPTIMIZATION: 'optimization',
  TREND: 'trend',
  ANOMALY: 'anomaly',
  COMPLIANCE: 'compliance',
  QUALITY: 'quality',
  EFFICIENCY: 'efficiency'
} as const;

export const AI_ASSISTANT_SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

export const AI_ASSISTANT_IMPACT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const AI_ASSISTANT_MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success'
} as const;

export const AI_ASSISTANT_ATTACHMENT_TYPES = {
  FILE: 'file',
  IMAGE: 'image',
  CODE: 'code',
  DATA: 'data',
  LOG: 'log',
  CONFIG: 'config',
  REPORT: 'report'
} as const;

export const AI_ASSISTANT_SUGGESTION_CATEGORIES = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  OPTIMIZATION: 'optimization',
  TROUBLESHOOTING: 'troubleshooting',
  CONFIGURATION: 'configuration',
  MONITORING: 'monitoring',
  REPORTING: 'reporting',
  TRAINING: 'training'
} as const;

export const AI_PERSONALITIES = {
  ANALYST: {
    name: 'Data Analyst',
    description: 'Specialized in data analysis, insights, and reporting',
    traits: ['analytical', 'detail-oriented', 'insightful'],
    expertise: ['data-analysis', 'statistics', 'visualization', 'trends']
  },
  ENGINEER: {
    name: 'Systems Engineer',
    description: 'Expert in system architecture, optimization, and technical solutions',
    traits: ['technical', 'problem-solving', 'efficient'],
    expertise: ['architecture', 'optimization', 'troubleshooting', 'performance']
  },
  SECURITY: {
    name: 'Security Specialist',
    description: 'Focused on security, compliance, and risk management',
    traits: ['security-focused', 'compliance-aware', 'risk-conscious'],
    expertise: ['security-audit', 'compliance', 'risk-assessment', 'threat-detection']
  },
  OPERATIONS: {
    name: 'Operations Manager',
    description: 'Specialized in workflow optimization and operational efficiency',
    traits: ['efficient', 'process-oriented', 'results-driven'],
    expertise: ['workflow-optimization', 'process-improvement', 'efficiency', 'automation']
  },
  GENERALIST: {
    name: 'General Assistant',
    description: 'Versatile assistant for general queries and support',
    traits: ['helpful', 'versatile', 'knowledgeable'],
    expertise: ['general-support', 'documentation', 'training', 'guidance']
  }
} as const;

export const AI_ASSISTANT_CONTEXT_KEYS = {
  USER_ID: 'userId',
  SESSION_ID: 'sessionId',
  WORKSPACE_ID: 'workspaceId',
  CURRENT_PAGE: 'currentPage',
  USER_ROLE: 'userRole',
  PERMISSIONS: 'permissions',
  RECENT_ACTIONS: 'recentActions',
  SYSTEM_STATE: 'systemState',
  PREFERENCES: 'preferences',
  HISTORY: 'history'
} as const;

export const AI_ASSISTANT_ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  MODEL_UNAVAILABLE: 'MODEL_UNAVAILABLE',
  CONTEXT_TOO_LARGE: 'CONTEXT_TOO_LARGE',
  PROCESSING_TIMEOUT: 'PROCESSING_TIMEOUT',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export const AI_ASSISTANT_STATUS_CODES = {
  IDLE: 'idle',
  TYPING: 'typing',
  PROCESSING: 'processing',
  STREAMING: 'streaming',
  ERROR: 'error',
  SUCCESS: 'success',
  TIMEOUT: 'timeout'
} as const;

export const AI_ASSISTANT_UI_STATES = {
  COLLAPSED: 'collapsed',
  EXPANDED: 'expanded',
  MINIMIZED: 'minimized',
  MAXIMIZED: 'maximized',
  DOCKED: 'docked',
  FLOATING: 'floating'
} as const;

export const AI_ASSISTANT_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
  HIGH_CONTRAST: 'high-contrast'
} as const;

export const AI_ASSISTANT_ANIMATIONS = {
  SLIDE_IN: 'slide-in',
  FADE_IN: 'fade-in',
  SCALE_IN: 'scale-in',
  BOUNCE_IN: 'bounce-in',
  NONE: 'none'
} as const;

export const AI_ASSISTANT_SOUNDS = {
  MESSAGE_RECEIVED: 'message-received',
  MESSAGE_SENT: 'message-sent',
  ERROR: 'error',
  SUCCESS: 'success',
  TYPING: 'typing',
  NONE: 'none'
} as const;

export const AI_ASSISTANT_LOCAL_STORAGE_KEYS = {
  CONVERSATION_HISTORY: 'ai-assistant-conversation-history',
  USER_PREFERENCES: 'ai-assistant-user-preferences',
  CONTEXT_DATA: 'ai-assistant-context-data',
  SESSION_DATA: 'ai-assistant-session-data',
  CUSTOM_PROMPTS: 'ai-assistant-custom-prompts'
} as const;

export const AI_ASSISTANT_SESSION_STORAGE_KEYS = {
  CURRENT_SESSION: 'ai-assistant-current-session',
  TEMP_MESSAGES: 'ai-assistant-temp-messages',
  UPLOAD_PROGRESS: 'ai-assistant-upload-progress',
  STREAMING_STATE: 'ai-assistant-streaming-state'
} as const;

export const AI_ASSISTANT_DEFAULT_PROMPTS = {
  WELCOME: 'Hello! I\'m your AI assistant. How can I help you with your data governance tasks today?',
  HELP: 'I can help you with performance analysis, security audits, data insights, workflow optimization, and more. What would you like to work on?',
  ERROR: 'I encountered an error while processing your request. Please try again or rephrase your question.',
  TIMEOUT: 'The request is taking longer than expected. Please try again or contact support if the issue persists.',
  NO_PERMISSION: 'I don\'t have permission to perform that action. Please contact your administrator.',
  CONTEXT_TOO_LARGE: 'The context is too large to process. Please try a more specific question or break it down into smaller parts.'
} as const;

export const AI_ASSISTANT_VALIDATION_RULES = {
  MIN_MESSAGE_LENGTH: 1,
  MAX_MESSAGE_LENGTH: 4000,
  MIN_TEMPERATURE: 0,
  MAX_TEMPERATURE: 2,
  MIN_MAX_TOKENS: 1,
  MAX_MAX_TOKENS: 10000,
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 1,
  MAX_ATTACHMENTS: 5,
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.txt', '.md', '.json', '.csv', '.log', '.config', '.yaml', '.yml']
} as const;

export const AI_ASSISTANT_PERFORMANCE_METRICS = {
  RESPONSE_TIME_THRESHOLD: 5000,
  STREAMING_SPEED_THRESHOLD: 100,
  MEMORY_USAGE_THRESHOLD: 100 * 1024 * 1024, // 100MB
  CPU_USAGE_THRESHOLD: 80,
  ERROR_RATE_THRESHOLD: 0.05
} as const;

export const AI_ASSISTANT_SECURITY_SETTINGS = {
  ENCRYPT_MESSAGES: true,
  SANITIZE_INPUT: true,
  VALIDATE_ATTACHMENTS: true,
  LOG_INTERACTIONS: true,
  ANONYMIZE_DATA: false,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_SESSIONS_PER_USER: 5
} as const;

export const AI_ASSISTANT_ACCESSIBILITY = {
  SCREEN_READER_SUPPORT: true,
  KEYBOARD_NAVIGATION: true,
  HIGH_CONTRAST_MODE: true,
  FONT_SIZE_ADJUSTMENT: true,
  REDUCED_MOTION: true,
  FOCUS_INDICATORS: true
} as const;

export const AI_ASSISTANT_INTERNATIONALIZATION = {
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
  DEFAULT_LANGUAGE: 'en',
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  NUMBER_FORMAT: 'en-US',
  CURRENCY_FORMAT: 'USD'
} as const;

export const AI_ASSISTANT_INTEGRATION_ENDPOINTS = {
  CHAT_COMPLETION: '/api/ai/chat',
  STREAMING: '/api/ai/stream',
  ANALYSIS: '/api/ai/analyze',
  OPTIMIZATION: '/api/ai/optimize',
  AUDIT: '/api/ai/audit',
  INSIGHTS: '/api/ai/insights',
  ACTIONS: '/api/ai/actions',
  FEEDBACK: '/api/ai/feedback'
} as const;

export const AI_ASSISTANT_WEBHOOK_EVENTS = {
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_PROCESSED: 'message.processed',
  ACTION_EXECUTED: 'action.executed',
  INSIGHT_GENERATED: 'insight.generated',
  ERROR_OCCURRED: 'error.occurred',
  SESSION_STARTED: 'session.started',
  SESSION_ENDED: 'session.ended'
} as const;

export const AI_ASSISTANT_ANALYTICS_EVENTS = {
  MESSAGE_SENT: 'ai_assistant_message_sent',
  MESSAGE_RECEIVED: 'ai_assistant_message_received',
  ACTION_EXECUTED: 'ai_assistant_action_executed',
  INSIGHT_VIEWED: 'ai_assistant_insight_viewed',
  SUGGESTION_CLICKED: 'ai_assistant_suggestion_clicked',
  ATTACHMENT_UPLOADED: 'ai_assistant_attachment_uploaded',
  ERROR_OCCURRED: 'ai_assistant_error_occurred',
  SESSION_STARTED: 'ai_assistant_session_started',
  SESSION_ENDED: 'ai_assistant_session_ended'
} as const;

export const AI_ASSISTANT_FEATURE_FLAGS = {
  ENABLE_STREAMING: true,
  ENABLE_SUGGESTIONS: true,
  ENABLE_ACTIONS: true,
  ENABLE_INSIGHTS: true,
  ENABLE_ATTACHMENTS: true,
  ENABLE_VOICE_INPUT: false,
  ENABLE_VOICE_OUTPUT: false,
  ENABLE_SCREENSHARING: false,
  ENABLE_COLLABORATION: true,
  ENABLE_CUSTOM_PROMPTS: true
} as const;

// ============================================================================
// ANOMALY DETECTION CONSTANTS
// ============================================================================

export const ANOMALY_CATEGORIES = [
  'performance',
  'security',
  'data_quality',
  'system',
  'user_behavior',
  'network',
  'storage',
  'compliance'
] as const;

export const ANOMALY_TYPES = {
  STATISTICAL: 'statistical',
  BEHAVIORAL: 'behavioral',
  TEMPORAL: 'temporal',
  CONTEXTUAL: 'contextual',
  PATTERN: 'pattern',
  THRESHOLD: 'threshold',
  OUTLIER: 'outlier'
} as const;

export const ANOMALY_SEVERITIES = [
  'critical',
  'high',
  'medium',
  'low',
  'info'
] as const;

export const DETECTION_MODELS = {
  STATISTICAL: 'statistical',
  MACHINE_LEARNING: 'machine_learning',
  RULE_BASED: 'rule_based',
  BEHAVIORAL: 'behavioral',
  HYBRID: 'hybrid'
} as const;

export const THREAT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
  EXTREME: 'extreme'
} as const;

export const RESPONSE_ACTIONS = {
  ISOLATE_THREAT: 'isolate_threat',
  THROTTLE_RESOURCES: 'throttle_resources',
  QUARANTINE_DATA: 'quarantine_data',
  SUSPEND_USER: 'suspend_user',
  ALERT_ADMINS: 'alert_admins',
  MITIGATE: 'mitigate',
  INVESTIGATE: 'investigate',
  ESCALATE: 'escalate',
  DISMISS: 'dismiss',
  ADJUST_THRESHOLD: 'adjust_threshold',
  UPDATE_MODEL: 'update_model',
  MODIFY_RULE: 'modify_rule'
} as const;

// ============================================================================
// COMPLIANCE FRAMEWORK CONSTANTS
// ============================================================================

export const COMPLIANCE_FRAMEWORKS = {
  GDPR: 'gdpr',
  HIPAA: 'hipaa',
  SOX: 'sox',
  PCI_DSS: 'pci-dss',
  ISO_27001: 'iso-27001',
  NIST: 'nist',
  FEDRAMP: 'fedramp',
  SOC_2: 'soc-2'
} as const;

// ============================================================================
// INSIGHT CATEGORIES CONSTANTS
// ============================================================================

export const INSIGHT_CATEGORIES = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  OPTIMIZATION: 'optimization',
  TREND: 'trend',
  ANOMALY: 'anomaly',
  COMPLIANCE: 'compliance',
  QUALITY: 'quality',
  EFFICIENCY: 'efficiency',
  COST: 'cost',
  RISK: 'risk'
} as const;

// ============================================================================
// CORRELATION THRESHOLDS CONSTANTS
// ============================================================================

export const CORRELATION_THRESHOLDS = {
  STRONG: 0.8,
  MODERATE: 0.6,
  WEAK: 0.4,
  MINIMUM: 0.2
} as const;

// ============================================================================
// INSIGHT PRIORITIES CONSTANTS
// ============================================================================

export const INSIGHT_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
} as const;

// ============================================================================
// RECOMMENDATION CATEGORIES CONSTANTS
// ============================================================================

export const RECOMMENDATION_CATEGORIES = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  OPTIMIZATION: 'optimization',
  COST: 'cost',
  COMPLIANCE: 'compliance',
  USER_EXPERIENCE: 'user-experience',
  OPERATIONAL: 'operational',
  STRATEGIC: 'strategic'
} as const;

// ============================================================================
// SUPPORTED LANGUAGES CONSTANTS
// ============================================================================

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
] as const;

// ============================================================================
// SUPPORTED VOICE LANGUAGES CONSTANTS
// ============================================================================

export const SUPPORTED_VOICE_LANGUAGES = {
  ENGLISH_US: 'en-US',
  ENGLISH_UK: 'en-GB',
  SPANISH: 'es-ES',
  FRENCH: 'fr-FR',
  GERMAN: 'de-DE',
  ITALIAN: 'it-IT',
  PORTUGUESE: 'pt-PT',
  RUSSIAN: 'ru-RU',
  CHINESE: 'zh-CN',
  JAPANESE: 'ja-JP'
} as const;

// ============================================================================
// AI CAPABILITIES CONSTANTS
// ============================================================================

export const AI_CAPABILITIES = {
  NATURAL_LANGUAGE_PROCESSING: 'natural-language-processing',
  CONTEXT_AWARENESS: 'context-awareness',
  PROACTIVE_GUIDANCE: 'proactive-guidance',
  WORKFLOW_AUTOMATION: 'workflow-automation',
  ANOMALY_DETECTION: 'anomaly-detection',
  PREDICTIVE_ANALYTICS: 'predictive-analytics',
  CROSS_GROUP_INSIGHTS: 'cross-group-insights',
  SMART_RECOMMENDATIONS: 'smart-recommendations',
  CONVERSATION_HISTORY: 'conversation-history',
  NOTIFICATIONS: 'notifications',
  VOICE_CONTROL: 'voice-control',
  CODE_ANALYSIS: 'code-analysis',
  DATA_INSIGHTS: 'data-insights',
  PERFORMANCE_OPTIMIZATION: 'performance-optimization',
  SECURITY_AUDIT: 'security-audit',
  TROUBLESHOOTING: 'troubleshooting',
  DOCUMENTATION: 'documentation',
  TRAINING: 'training'
} as const;



// ============================================================================
// CONVERSATION SETTINGS CONSTANTS
// ============================================================================

export const CONVERSATION_SETTINGS = {
  MAX_MESSAGES: 100,
  MAX_MESSAGE_LENGTH: 4000,
  MAX_ATTACHMENTS: 5,
  MAX_SUGGESTIONS: 5,
  MAX_ACTIONS: 3,
  MAX_INSIGHTS: 3,
  STREAMING_DELAY: 50,
  TYPING_INDICATOR_DELAY: 1000,
  SUGGESTION_TIMEOUT: 5000,
  CONTEXT_WINDOW_SIZE: 10,
  CONFIDENCE_THRESHOLD: 0.7,
  PROCESSING_TIMEOUT: 30000,
  AUTO_SAVE_INTERVAL: 30000,
  HISTORY_RETENTION_DAYS: 30,
  MAX_CONVERSATIONS: 50
} as const;

// ============================================================================
// PROACTIVE INSIGHTS CONFIG CONSTANTS
// ============================================================================

export const PROACTIVE_INSIGHTS_CONFIG = {
  ENABLED: true,
  CHECK_INTERVAL: 60000, // 1 minute
  MAX_INSIGHTS_PER_CHECK: 5,
  INSIGHT_PRIORITIES: ['critical', 'high', 'medium', 'low'],
  AUTO_DISMISS_AFTER: 300000, // 5 minutes
  NOTIFICATION_ENABLED: true,
  SOUND_ENABLED: false,
  VIBRATION_ENABLED: false,
  INSIGHT_CATEGORIES: ['performance', 'security', 'optimization', 'anomaly'],
  CORRELATION_THRESHOLD: 0.7,
  MIN_CONFIDENCE: 0.6,
  MAX_HISTORY_SIZE: 100,
  CLEANUP_INTERVAL: 3600000 // 1 hour
} as const;

// ============================================================================
// LEARNING ENGINE CONSTANTS
// ============================================================================

export const LEARNING_MODELS = {
  CLASSIFICATION: 'classification',
  REGRESSION: 'regression',
  CLUSTERING: 'clustering',
  RECOMMENDATION: 'recommendation',
  CUSTOM: 'custom'
} as const;

export const TRAINING_ALGORITHMS = {
  RANDOM_FOREST: 'random_forest',
  GRADIENT_BOOSTING: 'gradient_boosting',
  NEURAL_NETWORK: 'neural_network',
  SUPPORT_VECTOR_MACHINE: 'svm',
  LOGISTIC_REGRESSION: 'logistic_regression',
  LINEAR_REGRESSION: 'linear_regression',
  K_MEANS: 'k_means',
  HIERARCHICAL_CLUSTERING: 'hierarchical_clustering',
  COLLABORATIVE_FILTERING: 'collaborative_filtering',
  CONTENT_BASED: 'content_based'
} as const;

export const EVALUATION_METRICS = {
  ACCURACY: 'accuracy',
  PRECISION: 'precision',
  RECALL: 'recall',
  F1_SCORE: 'f1_score',
  AUC: 'auc',
  MSE: 'mse',
  MAE: 'mae',
  RMSE: 'rmse',
  SILHOUETTE_SCORE: 'silhouette_score',
  CALINSKI_HARABASZ_SCORE: 'calinski_harabasz_score'
} as const;

export const ADAPTATION_STRATEGIES = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
  HYBRID: 'hybrid',
  REINFORCEMENT: 'reinforcement',
  TRANSFER_LEARNING: 'transfer_learning',
  ACTIVE_LEARNING: 'active_learning',
  ONLINE_LEARNING: 'online_learning',
  BATCH_LEARNING: 'batch_learning'
} as const;

export const FEEDBACK_TYPES = {
  ACCURACY: 'accuracy',
  PERFORMANCE: 'performance',
  USABILITY: 'usability',
  RELEVANCE: 'relevance',
  GENERAL: 'general',
  TECHNICAL: 'technical',
  FUNCTIONAL: 'functional',
  USER_EXPERIENCE: 'user_experience'
} as const;

export const LEARNING_OBJECTIVES = {
  ACCURACY: 'accuracy',
  PERFORMANCE: 'performance',
  EFFICIENCY: 'efficiency',
  SCALABILITY: 'scalability',
  INTERPRETABILITY: 'interpretability',
  ROBUSTNESS: 'robustness',
  GENERALIZATION: 'generalization',
  ADAPTABILITY: 'adaptability'
} as const;

// ============================================================================
// CROSS-GROUP INSIGHTS CONSTANTS
// ============================================================================

export const INSIGHT_TYPES = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  COMPLIANCE: 'compliance',
  DATA_QUALITY: 'data_quality',
  USER_BEHAVIOR: 'user_behavior',
  SYSTEM_HEALTH: 'system_health',
  PREDICTIVE: 'predictive',
  STRATEGIC: 'strategic',
  ANOMALY: 'anomaly',
  TREND: 'trend',
  CORRELATION: 'correlation',
  OPTIMIZATION: 'optimization',
  RISK: 'risk',
  OPPORTUNITY: 'opportunity',
  BOTTLENECK: 'bottleneck',
  EFFICIENCY: 'efficiency'
} as const;

export const INSIGHT_SEVERITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
} as const;

export const SPA_GROUPS = {
  SCAN: 'scan',
  RBAC: 'rbac',
  CATALOG: 'catalog',
  WORKFLOW: 'workflow',
  ANALYTICS: 'analytics',
  MONITORING: 'monitoring',
  INTEGRATION: 'integration'
} as const;

export const TREND_INDICATORS = {
  INCREASING: 'increasing',
  DECREASING: 'decreasing',
  STABLE: 'stable',
  VOLATILE: 'volatile',
  CYCLICAL: 'cyclical',
  SEASONAL: 'seasonal'
} as const;

// ============================================================================
// COMPLIANCE CONSTANTS
// ============================================================================

// COMPLIANCE_FRAMEWORKS already exists above as an object

export const REGULATORY_REQUIREMENTS = [
  'data_protection',
  'privacy_rights',
  'data_retention',
  'access_control',
  'audit_logging',
  'incident_response',
  'business_continuity',
  'risk_management',
  'vendor_management',
  'training_awareness'
] as const;

export const COMPLIANCE_STATUSES = [
  'compliant',
  'non_compliant',
  'pending',
  'review',
  'at_risk',
  'exempt'
] as const;

export const CONTROL_TYPES = [
  'preventive',
  'detective',
  'corrective',
  'deterrent',
  'recovery'
] as const;

export const RISK_LEVELS = [
  'low',
  'medium',
  'high',
  'critical',
  'extreme'
] as const;

export const AUDIT_FREQUENCIES = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'annually',
  'on_demand'
] as const;

// ============================================================================
// CONTEXT-AWARE ASSISTANT CONSTANTS
// ============================================================================

export const CONTEXT_ANALYSIS_CONFIG = {
  DEFAULT_FREQUENCY: 5000, // milliseconds
  MIN_FREQUENCY: 1000,
  MAX_FREQUENCY: 60000,
  CONTEXT_DEPTH_LEVELS: ['basic', 'intermediate', 'advanced', 'comprehensive'] as const,
  ANALYSIS_TYPES: ['user_behavior', 'system_performance', 'workflow_optimization', 'security', 'comprehensive'] as const,
  RELEVANCE_THRESHOLDS: {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8,
    CRITICAL: 0.9
  },
  CONFIDENCE_THRESHOLDS: {
    LOW: 0.4,
    MEDIUM: 0.7,
    HIGH: 0.9
  }
} as const;

export const CONTEXTUAL_PATTERNS = {
  USER_BEHAVIOR: {
    FREQUENT_ACTIONS: 'frequent_actions',
    RARE_ACTIONS: 'rare_actions',
    SEQUENTIAL_PATTERNS: 'sequential_patterns',
    TIME_BASED_PATTERNS: 'time_based_patterns',
    CONTEXT_SWITCHING: 'context_switching',
    WORKFLOW_PREFERENCES: 'workflow_preferences'
  },
  SYSTEM_USAGE: {
    PEAK_HOURS: 'peak_hours',
    IDLE_PERIODS: 'idle_periods',
    RESOURCE_CONSUMPTION: 'resource_consumption',
    ERROR_PATTERNS: 'error_patterns',
    PERFORMANCE_TRENDS: 'performance_trends'
  },
  COLLABORATION: {
    TEAM_INTERACTIONS: 'team_interactions',
    SHARING_PATTERNS: 'sharing_patterns',
    COMMUNICATION_STYLES: 'communication_styles',
    EXPERTISE_UTILIZATION: 'expertise_utilization'
  }
} as const;

export const BEHAVIORAL_MODELS = {
  LEARNING_RATE: 0.1,
  ADAPTATION_THRESHOLD: 0.7,
  PATTERN_MEMORY_SIZE: 100,
  CONFIDENCE_DECAY: 0.95,
  SIGNIFICANCE_THRESHOLD: 0.6,
  FREQUENCY_WEIGHT: 0.4,
  RECENCY_WEIGHT: 0.3,
  CONTEXT_WEIGHT: 0.3
} as const;

export const ADAPTATION_THRESHOLDS = {
  CONSERVATIVE: 0.3,
  MODERATE: 0.5,
  AGGRESSIVE: 0.7,
  MAXIMUM: 1.0,
  LEARNING_RATE: 0.05,
  STABILITY_THRESHOLD: 0.8,
  CHANGE_DETECTION_SENSITIVITY: 0.2
} as const;

// ============================================================================
// PROACTIVE RECOMMENDATION CONSTANTS
// ============================================================================

export const RECOMMENDATION_TYPES = {
  PROACTIVE: 'proactive',
  REACTIVE: 'reactive',
  PREDICTIVE: 'predictive',
  PRESCRIPTIVE: 'prescriptive',
  DIAGNOSTIC: 'diagnostic'
} as const;

export const RECOMMENDATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const RECOMMENDATION_SOURCES = {
  AI_ANALYSIS: 'ai_analysis',
  USER_BEHAVIOR: 'user_behavior',
  SYSTEM_MONITORING: 'system_monitoring',
  COMPLIANCE_AUDIT: 'compliance_audit',
  PERFORMANCE_METRICS: 'performance_metrics',
  SECURITY_SCAN: 'security_scan',
  COST_ANALYSIS: 'cost_analysis',
  USER_FEEDBACK: 'user_feedback'
} as const;

export const LEARNING_ALGORITHMS = {
  SUPERVISED: 'supervised',
  UNSUPERVISED: 'unsupervised',
  REINFORCEMENT: 'reinforcement',
  DEEP_LEARNING: 'deep_learning',
  TRANSFER_LEARNING: 'transfer_learning',
  ENSEMBLE: 'ensemble',
  BAYESIAN: 'bayesian',
  NEURAL_NETWORK: 'neural_network'
} as const;

export const PERSONALIZATION_FACTORS = {
  USER_PREFERENCES: 'user_preferences',
  BEHAVIOR_PATTERNS: 'behavior_patterns',
  EXPERTISE_LEVEL: 'expertise_level',
  ROLE: 'role',
  WORKFLOW: 'workflow',
  CONTEXT: 'context',
  FEEDBACK_HISTORY: 'feedback_history',
  SUCCESS_RATE: 'success_rate'
} as const;

// ============================================================================
// WORKFLOW AUTOMATION CONSTANTS
// ============================================================================

export const WORKFLOW_TYPES = {
  SEQUENTIAL: 'sequential',
  PARALLEL: 'parallel',
  CONDITIONAL: 'conditional',
  LOOP: 'loop',
  HYBRID: 'hybrid'
} as const;

export const AUTOMATION_TRIGGERS = {
  SCHEDULE: 'schedule',
  EVENT: 'event',
  CONDITION: 'condition',
  MANUAL: 'manual',
  WEBHOOK: 'webhook',
  API: 'api'
} as const;

export const WORKFLOW_ACTIONS = {
  API_CALL: 'api_call',
  DATA_OPERATION: 'data_operation',
  NOTIFICATION: 'notification',
  FILE_OPERATION: 'file_operation',
  SYSTEM_ACTION: 'system_action',
  CUSTOM: 'custom'
} as const;

export const EXECUTION_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  STOPPED: 'stopped',
  CANCELLED: 'cancelled',
  RETRYING: 'retrying'
} as const;

export const OPTIMIZATION_STRATEGIES = {
  PERFORMANCE: 'performance',
  COST: 'cost',
  RELIABILITY: 'reliability',
  EFFICIENCY: 'efficiency',
  SCALABILITY: 'scalability',
  SECURITY: 'security'
} as const;

export const WORKFLOW_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// ============================================================================
// WORKFLOW AUTOMATION ENGINE CONSTANTS
// ============================================================================

export const WORKFLOW_TRIGGERS = {
  SCHEDULE: 'schedule',
  EVENT: 'event',
  MANUAL: 'manual',
  API_CALL: 'api_call',
  WEBHOOK: 'webhook',
  CONDITION: 'condition',
  TIME_BASED: 'time_based',
  DATA_CHANGE: 'data_change',
  USER_ACTION: 'user_action',
  SYSTEM_EVENT: 'system_event'
} as const;

export const WORKFLOW_CONDITIONS = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  REGEX_MATCH: 'regex_match',
  IS_NULL: 'is_null',
  IS_NOT_NULL: 'is_not_null',
  BETWEEN: 'between',
  IN_LIST: 'in_list',
  NOT_IN_LIST: 'not_in_list'
} as const;

export const EXECUTION_STATES = {
  PENDING: 'pending',
  QUEUED: 'queued',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
  RETRYING: 'retrying',
  APPROVAL_PENDING: 'approval_pending'
} as const;

export const AUTOMATION_TEMPLATES = {
  DATA_PROCESSING: 'data_processing',
  NOTIFICATION: 'notification',
  APPROVAL: 'approval',
  INTEGRATION: 'integration',
  REPORTING: 'reporting',
  MAINTENANCE: 'maintenance',
  BACKUP: 'backup',
  SYNC: 'sync',
  VALIDATION: 'validation',
  TRANSFORMATION: 'transformation'
} as const;

export const SCHEDULE_PATTERNS = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM_CRON: 'custom_cron',
  BUSINESS_HOURS: 'business_hours',
  WEEKDAYS: 'weekdays',
  WEEKENDS: 'weekends',
  HOURLY: 'hourly',
  MINUTELY: 'minutely'
} as const;

// ============================================================================
// PROACTIVE INSIGHTS ENGINE CONSTANTS
// ============================================================================

export const PATTERN_TYPES = {
  // User Behavior Patterns
  USER_NAVIGATION: 'user_navigation',
  USER_INTERACTION: 'user_interaction',
  USER_PREFERENCE: 'user_preference',
  USER_SESSION: 'user_session',
  USER_WORKFLOW: 'user_workflow',
  
  // System Patterns
  SYSTEM_PERFORMANCE: 'system_performance',
  SYSTEM_RESOURCE: 'system_resource',
  SYSTEM_ERROR: 'system_error',
  SYSTEM_SECURITY: 'system_security',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  
  // Data Patterns
  DATA_ACCESS: 'data_access',
  DATA_USAGE: 'data_usage',
  DATA_QUALITY: 'data_quality',
  DATA_FLOW: 'data_flow',
  DATA_ANOMALY: 'data_anomaly',
  
  // Workflow Patterns
  WORKFLOW_EXECUTION: 'workflow_execution',
  WORKFLOW_EFFICIENCY: 'workflow_efficiency',
  WORKFLOW_BOTTLENECK: 'workflow_bottleneck',
  WORKFLOW_OPTIMIZATION: 'workflow_optimization',
  WORKFLOW_ERROR: 'workflow_error',
  
  // AI Patterns
  AI_LEARNING: 'ai_learning',
  AI_PREDICTION: 'ai_prediction',
  AI_ACCURACY: 'ai_accuracy',
  AI_PERFORMANCE: 'ai_performance',
  AI_ADAPTATION: 'ai_adaptation'
} as const;

export const ANOMALY_THRESHOLDS = {
  // Performance Thresholds
  CPU_USAGE: { warning: 70, critical: 90 },
  MEMORY_USAGE: { warning: 80, critical: 95 },
  DISK_USAGE: { warning: 85, critical: 95 },
  NETWORK_LATENCY: { warning: 100, critical: 200 },
  RESPONSE_TIME: { warning: 1000, critical: 3000 },
  
  // Security Thresholds
  FAILED_LOGINS: { warning: 5, critical: 10 },
  SUSPICIOUS_ACTIVITY: { warning: 3, critical: 7 },
  ACCESS_VIOLATIONS: { warning: 2, critical: 5 },
  DATA_BREACH_ATTEMPTS: { warning: 1, critical: 3 },
  
  // Quality Thresholds
  DATA_ACCURACY: { warning: 95, critical: 90 },
  SYSTEM_AVAILABILITY: { warning: 99.5, critical: 99.0 },
  ERROR_RATE: { warning: 1.0, critical: 5.0 },
  SUCCESS_RATE: { warning: 95, critical: 90 }
} as const;

export const LEARNING_CONFIG = {
  // Model Training
  TRAINING_INTERVAL: 3600000, // 1 hour
  BATCH_SIZE: 1000,
  LEARNING_RATE: 0.001,
  EPOCHS: 100,
  VALIDATION_SPLIT: 0.2,
  
  // Feature Engineering
  FEATURE_SELECTION: true,
  DIMENSIONALITY_REDUCTION: true,
  NORMALIZATION: true,
  AUGMENTATION: true,
  
  // Performance Metrics
  ACCURACY_THRESHOLD: 0.85,
  PRECISION_THRESHOLD: 0.80,
  RECALL_THRESHOLD: 0.80,
  F1_THRESHOLD: 0.80,
  
  // Adaptive Learning
  ONLINE_LEARNING: true,
  INCREMENTAL_UPDATE: true,
  CONCEPT_DRIFT_DETECTION: true,
  ACTIVE_LEARNING: true
} as const;

export const NOTIFICATION_CHANNELS = {
  // In-App Notifications
  IN_APP: 'in_app',
  TOAST: 'toast',
  MODAL: 'modal',
  SIDEBAR: 'sidebar',
  
  // External Notifications
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WEBHOOK: 'webhook',
  
  // System Notifications
  SYSTEM_TRAY: 'system_tray',
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  WATCH: 'watch',
  
  // Integration Notifications
  SLACK: 'slack',
  TEAMS: 'teams',
  DISCORD: 'discord',
  JIRA: 'jira',
  
  // Priority-Based Channels
  URGENT: 'urgent',
  HIGH_PRIORITY: 'high_priority',
  NORMAL: 'normal',
  LOW_PRIORITY: 'low_priority'
} as const;

// ============================================================================
// NATURAL LANGUAGE PROCESSING CONSTANTS
// ============================================================================

export const NLP_MODELS = {
  // Intent Recognition Models
  INTENT_BERT: 'intent_bert',
  INTENT_TRANSFORMER: 'intent_transformer',
  INTENT_LSTM: 'intent_lstm',
  INTENT_CNN: 'intent_cnn',
  
  // Entity Extraction Models
  ENTITY_SPACY: 'entity_spacy',
  ENTITY_STANZA: 'entity_stanza',
  ENTITY_FLAIR: 'entity_flair',
  ENTITY_BERT: 'entity_bert',
  
  // Sentiment Analysis Models
  SENTIMENT_VADER: 'sentiment_vader',
  SENTIMENT_TEXTBLOB: 'sentiment_textblob',
  SENTIMENT_BERT: 'sentiment_bert',
  SENTIMENT_ROBERTA: 'sentiment_roberta',
  
  // Language Detection Models
  LANG_DETECT: 'lang_detect',
  LANG_LANGID: 'lang_langid',
  LANG_FASTTEXT: 'lang_fasttext',
  LANG_BERT: 'lang_bert',
  
  // Semantic Analysis Models
  SEMANTIC_SENTENCE_TRANSFORMERS: 'semantic_sentence_transformers',
  SEMANTIC_USE: 'semantic_use',
  SEMANTIC_BERT: 'semantic_bert',
  SEMANTIC_GLOVE: 'semantic_glove',
  
  // Multimodal Models
  MULTIMODAL_CLIP: 'multimodal_clip',
  MULTIMODAL_VILBERT: 'multimodal_vilbert',
  MULTIMODAL_LXMERT: 'multimodal_lxmert'
} as const;

export const INTENT_CATEGORIES = {
  // System Intents
  SYSTEM_HELP: 'system_help',
  SYSTEM_STATUS: 'system_status',
  SYSTEM_SETTINGS: 'system_settings',
  SYSTEM_NAVIGATION: 'system_navigation',
  
  // Information Intents
  INFO_QUERY: 'info_query',
  INFO_SEARCH: 'info_search',
  INFO_EXPLANATION: 'info_explanation',
  INFO_COMPARISON: 'info_comparison',
  
  // Action Intents
  ACTION_CREATE: 'action_create',
  ACTION_UPDATE: 'action_update',
  ACTION_DELETE: 'action_delete',
  ACTION_EXECUTE: 'action_execute',
  
  // Analysis Intents
  ANALYSIS_PERFORMANCE: 'analysis_performance',
  ANALYSIS_TREND: 'analysis_trend',
  ANALYSIS_PATTERN: 'analysis_pattern',
  ANALYSIS_REPORT: 'analysis_report',
  
  // Communication Intents
  COMM_SEND: 'comm_send',
  COMM_RECEIVE: 'comm_receive',
  COMM_SHARE: 'comm_share',
  COMM_COLLABORATE: 'comm_collaborate',
  
  // Learning Intents
  LEARNING_TRAIN: 'learning_train',
  LEARNING_OPTIMIZE: 'learning_optimize',
  LEARNING_EVALUATE: 'learning_evaluate',
  LEARNING_ADAPT: 'learning_adapt'
} as const;

export const ENTITY_TYPES = {
  // Person Entities
  PERSON_NAME: 'person_name',
  PERSON_ROLE: 'person_role',
  PERSON_TITLE: 'person_title',
  PERSON_CONTACT: 'person_contact',
  
  // Organization Entities
  ORG_NAME: 'org_name',
  ORG_TYPE: 'org_type',
  ORG_DEPARTMENT: 'org_department',
  ORG_LOCATION: 'org_location',
  
  // Location Entities
  LOC_COUNTRY: 'loc_country',
  LOC_CITY: 'loc_city',
  LOC_ADDRESS: 'loc_address',
  LOC_COORDINATES: 'loc_coordinates',
  
  // Temporal Entities
  TEMP_DATE: 'temp_date',
  TEMP_TIME: 'temp_time',
  TEMP_DURATION: 'temp_duration',
  TEMP_FREQUENCY: 'temp_frequency',
  
  // Financial Entities
  FIN_AMOUNT: 'fin_amount',
  FIN_CURRENCY: 'fin_currency',
  FIN_PERCENTAGE: 'fin_percentage',
  FIN_RATIO: 'fin_ratio',
  
  // Technical Entities
  TECH_SYSTEM: 'tech_system',
  TECH_PLATFORM: 'tech_platform',
  TECH_VERSION: 'tech_version',
  TECH_CONFIG: 'tech_config',
  
  // Custom Entities
  CUSTOM_DOMAIN: 'custom_domain',
  CUSTOM_METRIC: 'custom_metric',
  CUSTOM_THRESHOLD: 'custom_threshold',
  CUSTOM_RULE: 'custom_rule'
} as const;

export const PROCESSING_MODES = {
  // Real-time Processing
  REAL_TIME: 'real-time',
  STREAMING: 'streaming',
  INTERACTIVE: 'interactive',
  
  // Batch Processing
  BATCH: 'batch',
  SCHEDULED: 'scheduled',
  OFFLINE: 'offline',
  
  // Hybrid Processing
  HYBRID: 'hybrid',
  ADAPTIVE: 'adaptive',
  INTELLIGENT: 'intelligent'
} as const;

export const NLP_CONFIG = {
  // Model Configuration
  MODEL_UPDATE_INTERVAL: 86400000, // 24 hours
  CONFIDENCE_THRESHOLD: 0.7,
  MAX_ALTERNATIVES: 5,
  CACHE_SIZE: 1000,
  
  // Processing Configuration
  MAX_TEXT_LENGTH: 10000,
  BATCH_SIZE: 100,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  
  // Language Configuration
  DEFAULT_LANGUAGE: 'en',
  FALLBACK_LANGUAGE: 'en',
  AUTO_DETECTION: true,
  MULTILINGUAL_SUPPORT: true,
  
  // Performance Configuration
  ENABLE_CACHING: true,
  ENABLE_PARALLEL_PROCESSING: true,
  ENABLE_OPTIMIZATION: true,
  ENABLE_MONITORING: true,
  
  // Quality Configuration
  MIN_CONFIDENCE: 0.5,
  VALIDATION_ENABLED: true,
  FEEDBACK_LOOP: true,
  CONTINUOUS_LEARNING: true
} as const;
