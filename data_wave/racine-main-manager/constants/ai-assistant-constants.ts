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
