/**
 * Advanced Scan Rule Sets - Application Constants
 * Comprehensive constants, configuration values, enums, and default settings
 */

// Application Metadata
export const APP_CONFIG = {
  name: 'Advanced Scan Rule Sets',
  version: '2.0.0',
  description: 'Enterprise-grade scan rule optimization platform',
  author: 'Enterprise Security Team',
  license: 'Proprietary',
  environment: process.env.NODE_ENV || 'development',
  buildDate: new Date().toISOString(),
  features: {
    AI_OPTIMIZATION: true,
    PERFORMANCE_ANALYTICS: true,
    BENCHMARKING: true,
    WORKFLOW_ENGINE: true,
    ENTERPRISE_REPORTING: true,
    REAL_TIME_MONITORING: true,
    COLLABORATION: true,
    VERSION_CONTROL: true,
  }
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 1000,
    BURST_LIMIT: 100,
  },
  ENDPOINTS: {
    RULES: '/rules',
    OPTIMIZATION: '/optimization',
    ANALYTICS: '/analytics',
    BENCHMARKS: '/benchmarks',
    WORKFLOWS: '/workflows',
    AI_MODELS: '/ai/models',
    PREDICTIONS: '/ai/predictions',
    REPORTS: '/reports',
    COLLABORATION: '/collaboration',
    VERSION_CONTROL: '/version-control',
  }
} as const;

// Rule Types and Categories
export const RULE_TYPES = {
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  COMPLIANCE: 'compliance',
  BUSINESS: 'business',
  OPERATIONAL: 'operational',
  CUSTOM: 'custom',
} as const;

export const RULE_CATEGORIES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATA_VALIDATION: 'data_validation',
  INPUT_SANITIZATION: 'input_sanitization',
  OUTPUT_ENCODING: 'output_encoding',
  CRYPTOGRAPHY: 'cryptography',
  SESSION_MANAGEMENT: 'session_management',
  ERROR_HANDLING: 'error_handling',
  LOGGING: 'logging',
  MONITORING: 'monitoring',
  RATE_LIMITING: 'rate_limiting',
  CACHING: 'caching',
} as const;

export const RULE_COMPLEXITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EXTREME: 'extreme',
} as const;

export const RULE_STATUS = {
  DRAFT: 'draft',
  TESTING: 'testing',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DEPRECATED: 'deprecated',
  ARCHIVED: 'archived',
} as const;

export const RULE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Optimization Constants
export const OPTIMIZATION_TYPES = {
  PERFORMANCE: 'performance',
  COST: 'cost',
  ACCURACY: 'accuracy',
  SECURITY: 'security',
  SCALABILITY: 'scalability',
  RELIABILITY: 'reliability',
} as const;

export const OPTIMIZATION_STRATEGIES = {
  GENETIC_ALGORITHM: 'genetic_algorithm',
  SIMULATED_ANNEALING: 'simulated_annealing',
  PARTICLE_SWARM: 'particle_swarm',
  GRADIENT_DESCENT: 'gradient_descent',
  BAYESIAN_OPTIMIZATION: 'bayesian_optimization',
  RANDOM_SEARCH: 'random_search',
  GRID_SEARCH: 'grid_search',
} as const;

export const OPTIMIZATION_METRICS = {
  EXECUTION_TIME: 'execution_time',
  MEMORY_USAGE: 'memory_usage',
  CPU_UTILIZATION: 'cpu_utilization',
  THROUGHPUT: 'throughput',
  ERROR_RATE: 'error_rate',
  ACCURACY: 'accuracy',
  PRECISION: 'precision',
  RECALL: 'recall',
  F1_SCORE: 'f1_score',
  ROI: 'roi',
  COST_PER_OPERATION: 'cost_per_operation',
} as const;

// AI and ML Constants
export const AI_MODEL_TYPES = {
  CLASSIFICATION: 'classification',
  REGRESSION: 'regression',
  CLUSTERING: 'clustering',
  ANOMALY_DETECTION: 'anomaly_detection',
  FORECASTING: 'forecasting',
  OPTIMIZATION: 'optimization',
} as const;

export const AI_ALGORITHMS = {
  RANDOM_FOREST: 'random_forest',
  GRADIENT_BOOSTING: 'gradient_boosting',
  NEURAL_NETWORK: 'neural_network',
  SVM: 'svm',
  LOGISTIC_REGRESSION: 'logistic_regression',
  LINEAR_REGRESSION: 'linear_regression',
  K_MEANS: 'k_means',
  DBSCAN: 'dbscan',
  ISOLATION_FOREST: 'isolation_forest',
  ARIMA: 'arima',
  LSTM: 'lstm',
} as const;

export const AI_MODEL_STATUS = {
  TRAINING: 'training',
  READY: 'ready',
  DEPLOYED: 'deployed',
  DEPRECATED: 'deprecated',
  FAILED: 'failed',
} as const;

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXECUTION_TIME: {
    EXCELLENT: 100, // ms
    GOOD: 500,
    ACCEPTABLE: 1000,
    POOR: 5000,
  },
  THROUGHPUT: {
    EXCELLENT: 1000, // records/sec
    GOOD: 500,
    ACCEPTABLE: 100,
    POOR: 10,
  },
  ACCURACY: {
    EXCELLENT: 0.95,
    GOOD: 0.90,
    ACCEPTABLE: 0.80,
    POOR: 0.70,
  },
  RESOURCE_UTILIZATION: {
    EXCELLENT: 0.60,
    GOOD: 0.75,
    ACCEPTABLE: 0.85,
    POOR: 0.95,
  },
} as const;

// Color Schemes and Themes
export const COLOR_SCHEMES = {
  PRIMARY: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  SECONDARY: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export const CHART_COLORS = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
  '#10b981', '#f43f5e', '#8b5a2b', '#059669', '#dc2626',
] as const;

export const STATUS_COLORS = {
  [RULE_STATUS.DRAFT]: COLOR_SCHEMES.GRAY[500],
  [RULE_STATUS.TESTING]: COLOR_SCHEMES.WARNING[500],
  [RULE_STATUS.ACTIVE]: COLOR_SCHEMES.SUCCESS[500],
  [RULE_STATUS.INACTIVE]: COLOR_SCHEMES.GRAY[400],
  [RULE_STATUS.DEPRECATED]: COLOR_SCHEMES.WARNING[600],
  [RULE_STATUS.ARCHIVED]: COLOR_SCHEMES.GRAY[600],
} as const;

export const PRIORITY_COLORS = {
  [RULE_PRIORITY.LOW]: COLOR_SCHEMES.GRAY[500],
  [RULE_PRIORITY.MEDIUM]: COLOR_SCHEMES.WARNING[500],
  [RULE_PRIORITY.HIGH]: COLOR_SCHEMES.ERROR[500],
  [RULE_PRIORITY.CRITICAL]: COLOR_SCHEMES.ERROR[700],
} as const;

// Default Configurations
export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

export const DEFAULT_CACHE_SETTINGS = {
  TTL: 300000, // 5 minutes
  MAX_SIZE: 1000,
  CLEANUP_INTERVAL: 60000, // 1 minute
} as const;

export const DEFAULT_CHART_CONFIG = {
  HEIGHT: 400,
  ANIMATION_DURATION: 300,
  SHOW_GRID: true,
  SHOW_LEGEND: true,
  RESPONSIVE: true,
  MAINTAIN_ASPECT_RATIO: false,
} as const;

export const DEFAULT_TABLE_CONFIG = {
  ROWS_PER_PAGE: [10, 25, 50, 100],
  DEFAULT_ROWS: 25,
  SORTABLE: true,
  FILTERABLE: true,
  SEARCHABLE: true,
  EXPORTABLE: true,
} as const;

// Workflow Constants
export const WORKFLOW_NODE_TYPES = {
  START: 'start',
  END: 'end',
  ACTION: 'action',
  DECISION: 'decision',
  PARALLEL: 'parallel',
  MERGE: 'merge',
  LOOP: 'loop',
  DELAY: 'delay',
  CONDITION: 'condition',
} as const;

export const WORKFLOW_EDGE_TYPES = {
  DEFAULT: 'default',
  CONDITIONAL: 'conditional',
  ERROR: 'error',
  TIMEOUT: 'timeout',
} as const;

export const WORKFLOW_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused',
} as const;

// Notification Constants
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const NOTIFICATION_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  TOP_CENTER: 'top-center',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_CENTER: 'bottom-center',
} as const;

// File and Data Constants
export const FILE_TYPES = {
  RULE_EXPORT: 'application/json',
  CSV: 'text/csv',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PDF: 'application/pdf',
  XML: 'application/xml',
  YAML: 'application/x-yaml',
} as const;

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  EXCEL: 'xlsx',
  PDF: 'pdf',
  XML: 'xml',
  YAML: 'yaml',
} as const;

export const MAX_FILE_SIZES = {
  RULE_IMPORT: 10 * 1024 * 1024, // 10MB
  REPORT_EXPORT: 50 * 1024 * 1024, // 50MB
  ATTACHMENT: 5 * 1024 * 1024, // 5MB
} as const;

// Time Constants
export const TIME_INTERVALS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

export const TIME_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  RELATIVE: 'relative',
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  RULE_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z0-9_\-\s]+$/,
  },
  RULE_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  URL: {
    PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  },
} as const;

// Security Constants
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * TIME_INTERVALS.MINUTE,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * TIME_INTERVALS.MINUTE,
  PASSWORD_RESET_EXPIRY: 24 * TIME_INTERVALS.HOUR,
  JWT_EXPIRY: 24 * TIME_INTERVALS.HOUR,
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  HASH_ALGORITHM: 'SHA-256',
  SALT_ROUNDS: 12,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_OPTIMIZATION: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_REAL_TIME_MONITORING: true,
  ENABLE_COLLABORATION: true,
  ENABLE_VERSION_CONTROL: true,
  ENABLE_WORKFLOW_ENGINE: true,
  ENABLE_BENCHMARKING: true,
  ENABLE_EXPORT_IMPORT: true,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_AUDIT_LOGS: true,
  ENABLE_ROLE_BASED_ACCESS: true,
} as const;

// Industry Standards and Benchmarks
export const INDUSTRY_BENCHMARKS = {
  FINANCIAL_SERVICES: {
    ACCURACY_THRESHOLD: 0.99,
    RESPONSE_TIME_MAX: 100,
    AVAILABILITY_MIN: 0.9999,
  },
  HEALTHCARE: {
    ACCURACY_THRESHOLD: 0.98,
    RESPONSE_TIME_MAX: 200,
    AVAILABILITY_MIN: 0.999,
  },
  ECOMMERCE: {
    ACCURACY_THRESHOLD: 0.95,
    RESPONSE_TIME_MAX: 300,
    AVAILABILITY_MIN: 0.995,
  },
  MANUFACTURING: {
    ACCURACY_THRESHOLD: 0.97,
    RESPONSE_TIME_MAX: 500,
    AVAILABILITY_MIN: 0.99,
  },
} as const;

// Compliance Frameworks
export const COMPLIANCE_FRAMEWORKS = {
  SOX: 'sox',
  HIPAA: 'hipaa',
  GDPR: 'gdpr',
  PCI_DSS: 'pci_dss',
  ISO_27001: 'iso_27001',
  NIST: 'nist',
  SOC2: 'soc2',
  FERPA: 'ferpa',
  CCPA: 'ccpa',
} as const;

// Resource Limits
export const RESOURCE_LIMITS = {
  MAX_RULES_PER_SET: 1000,
  MAX_CONCURRENT_OPTIMIZATIONS: 10,
  MAX_WORKFLOW_NODES: 100,
  MAX_BATCH_SIZE: 10000,
  MAX_EXPORT_RECORDS: 100000,
  MAX_SEARCH_RESULTS: 1000,
  MAX_DASHBOARD_WIDGETS: 20,
  MAX_SAVED_FILTERS: 50,
} as const;

// Error Codes
export const ERROR_CODES = {
  // General
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  
  // Rules
  RULE_NOT_FOUND: 'RULE_NOT_FOUND',
  RULE_VALIDATION_FAILED: 'RULE_VALIDATION_FAILED',
  RULE_COMPILATION_FAILED: 'RULE_COMPILATION_FAILED',
  RULE_EXECUTION_FAILED: 'RULE_EXECUTION_FAILED',
  
  // Optimization
  OPTIMIZATION_FAILED: 'OPTIMIZATION_FAILED',
  MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
  PREDICTION_FAILED: 'PREDICTION_FAILED',
  
  // Workflow
  WORKFLOW_EXECUTION_FAILED: 'WORKFLOW_EXECUTION_FAILED',
  INVALID_WORKFLOW_DEFINITION: 'INVALID_WORKFLOW_DEFINITION',
  
  // System
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  RULE_CREATED: 'Rule created successfully',
  RULE_UPDATED: 'Rule updated successfully',
  RULE_DELETED: 'Rule deleted successfully',
  OPTIMIZATION_COMPLETED: 'Optimization completed successfully',
  WORKFLOW_EXECUTED: 'Workflow executed successfully',
  REPORT_GENERATED: 'Report generated successfully',
  DATA_EXPORTED: 'Data exported successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  RULE_NAME: /^[a-zA-Z0-9_\-\s]+$/,
  IDENTIFIER: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  VERSION: /^\d+\.\d+\.\d+$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
} as const;

// Animation Constants
export const ANIMATIONS = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  TRANSITIONS: {
    FADE: 'opacity',
    SLIDE: 'transform',
    SCALE: 'transform',
  },
} as const;

// Layout Constants
export const LAYOUT = {
  SIDEBAR_WIDTH: 280,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  CONTENT_PADDING: 24,
  CARD_BORDER_RADIUS: 8,
  BUTTON_BORDER_RADIUS: 6,
  INPUT_BORDER_RADIUS: 6,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1010,
  FIXED: 1020,
  MODAL_BACKDROP: 1030,
  MODAL: 1040,
  POPOVER: 1050,
  TOOLTIP: 1060,
  NOTIFICATION: 1070,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
  TABLE_SETTINGS: 'table_settings',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  SAVED_FILTERS: 'saved_filters',
  RECENT_SEARCHES: 'recent_searches',
  TOUR_COMPLETED: 'tour_completed',
} as const;

// Event Names
export const EVENTS = {
  RULE_CREATED: 'rule:created',
  RULE_UPDATED: 'rule:updated',
  RULE_DELETED: 'rule:deleted',
  OPTIMIZATION_STARTED: 'optimization:started',
  OPTIMIZATION_COMPLETED: 'optimization:completed',
  WORKFLOW_EXECUTED: 'workflow:executed',
  USER_ACTION: 'user:action',
  SYSTEM_ERROR: 'system:error',
  PERFORMANCE_ALERT: 'performance:alert',
} as const;

// Type Helpers
export type RuleType = typeof RULE_TYPES[keyof typeof RULE_TYPES];
export type RuleCategory = typeof RULE_CATEGORIES[keyof typeof RULE_CATEGORIES];
export type RuleStatus = typeof RULE_STATUS[keyof typeof RULE_STATUS];
export type RulePriority = typeof RULE_PRIORITY[keyof typeof RULE_PRIORITY];
export type OptimizationType = typeof OPTIMIZATION_TYPES[keyof typeof OPTIMIZATION_TYPES];
export type AIModelType = typeof AI_MODEL_TYPES[keyof typeof AI_MODEL_TYPES];
export type WorkflowStatus = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type ExportFormat = typeof EXPORT_FORMATS[keyof typeof EXPORT_FORMATS];
export type ComplianceFramework = typeof COMPLIANCE_FRAMEWORKS[keyof typeof COMPLIANCE_FRAMEWORKS];

// Default Export
export default {
  APP_CONFIG,
  API_CONFIG,
  RULE_TYPES,
  RULE_CATEGORIES,
  OPTIMIZATION_TYPES,
  AI_MODEL_TYPES,
  COLOR_SCHEMES,
  PERFORMANCE_THRESHOLDS,
  DEFAULT_PAGINATION,
  FEATURE_FLAGS,
  VALIDATION_RULES,
  ERROR_CODES,
  SUCCESS_MESSAGES,
} as const;