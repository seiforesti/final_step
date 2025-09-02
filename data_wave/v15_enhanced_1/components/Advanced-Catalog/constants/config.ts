// ============================================================================
// CONFIGURATION CONSTANTS - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// System configuration and default settings for Advanced Catalog
// ============================================================================

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/proxy',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  MAX_CONCURRENT_REQUESTS: 10,
  REQUEST_THROTTLE_DELAY: 100, // 100ms
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Client-Type': 'web'
  },
  
  // Authentication
  AUTH_HEADER: 'Authorization',
  TOKEN_PREFIX: 'Bearer',
  REFRESH_TOKEN_THRESHOLD: 300000, // 5 minutes before expiry
  
  // Rate Limiting
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  
  // Cache Settings
  CACHE_TTL: 300000, // 5 minutes
  CACHE_MAX_SIZE: 100,
  CACHE_ENABLED: true
} as const;

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
  DEFAULT_PAGE: 1,
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: true,
  SIZE_OPTIONS: ['10', '20', '50', '100'],
  
  // Virtual Scrolling
  VIRTUAL_SCROLL_THRESHOLD: 1000,
  VIRTUAL_ITEM_HEIGHT: 48,
  VIRTUAL_BUFFER_SIZE: 10
} as const;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  // Theme
  DEFAULT_THEME: 'light',
  AVAILABLE_THEMES: ['light', 'dark', 'system'],
  
  // Layout
  SIDEBAR_WIDTH: 256,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 48,
  
  // Animations
  ANIMATION_DURATION: 200,
  ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  DISABLE_ANIMATIONS: false,
  
  // Notifications
  NOTIFICATION_DURATION: 5000, // 5 seconds
  MAX_NOTIFICATIONS: 5,
  NOTIFICATION_PLACEMENT: 'topRight',
  
  // Modals
  MODAL_ANIMATION_DURATION: 200,
  MODAL_BACKDROP_BLUR: true,
  MODAL_CLOSE_ON_ESCAPE: true,
  MODAL_CLOSE_ON_BACKDROP: true,
  
  // Tables
  TABLE_ROW_HEIGHT: 48,
  TABLE_HEADER_HEIGHT: 56,
  TABLE_SCROLL_THRESHOLD: 100,
  TABLE_VIRTUAL_ENABLED: true,
  
  // Forms
  FORM_VALIDATION_DEBOUNCE: 300,
  FORM_AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  FORM_CONFIRMATION_ON_LEAVE: true,
  
  // Charts
  CHART_ANIMATION_DURATION: 750,
  CHART_RESPONSIVE: true,
  CHART_MAINTAIN_ASPECT_RATIO: false
} as const;

// ============================================================================
// SEARCH CONFIGURATION
// ============================================================================

export const SEARCH_CONFIG = {
  // Search Behavior
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_DELAY: 300,
  MAX_SEARCH_RESULTS: 100,
  HIGHLIGHT_SEARCH_TERMS: true,
  
  // Autocomplete
  AUTOCOMPLETE_MIN_LENGTH: 1,
  AUTOCOMPLETE_MAX_SUGGESTIONS: 10,
  AUTOCOMPLETE_DEBOUNCE: 150,
  
  // Filters
  MAX_FILTER_VALUES: 1000,
  FILTER_SEARCH_ENABLED: true,
  FILTER_MULTI_SELECT: true,
  
  // Semantic Search
  SEMANTIC_SEARCH_ENABLED: true,
  SIMILARITY_THRESHOLD: 0.7,
  MAX_SEMANTIC_RESULTS: 50,
  
  // Search Analytics
  TRACK_SEARCH_ANALYTICS: true,
  SEARCH_ANALYTICS_BATCH_SIZE: 100,
  SEARCH_ANALYTICS_FLUSH_INTERVAL: 60000 // 1 minute
} as const;

// ============================================================================
// DATA DISCOVERY CONFIGURATION
// ============================================================================

export const DISCOVERY_CONFIG = {
  // Job Settings
  DEFAULT_SCAN_DEPTH: 3,
  MAX_SCAN_DEPTH: 10,
  DEFAULT_SAMPLE_SIZE: 1000,
  MAX_SAMPLE_SIZE: 100000,
  
  // Scheduling
  DEFAULT_SCHEDULE_FREQUENCY: 'WEEKLY',
  AVAILABLE_FREQUENCIES: ['MANUAL', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'],
  MAX_CONCURRENT_JOBS: 5,
  JOB_TIMEOUT: 3600000, // 1 hour
  
  // Data Source Types
  SUPPORTED_DATA_SOURCES: [
    'POSTGRESQL',
    'MYSQL',
    'MONGODB',
    'SNOWFLAKE',
    'DATABRICKS',
    'S3',
    'AZURE_BLOB',
    'GCS',
    'REDSHIFT',
    'BIGQUERY',
    'ORACLE',
    'SQL_SERVER',
    'API',
    'FILE_SYSTEM'
  ],
  
  // Discovery Rules
  DEFAULT_INCLUDE_SYSTEM_TABLES: false,
  DEFAULT_INCLUDE_VIEWS: true,
  DEFAULT_INCLUDE_PROCEDURES: false,
  MAX_EXCLUDE_PATTERNS: 50,
  
  // Quality Thresholds
  MIN_QUALITY_SCORE: 0.6,
  COMPLETENESS_THRESHOLD: 0.8,
  UNIQUENESS_THRESHOLD: 0.95,
  VALIDITY_THRESHOLD: 0.9
} as const;

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

export const ANALYTICS_CONFIG = {
  // Refresh Intervals
  REAL_TIME_REFRESH_INTERVAL: 30000, // 30 seconds
  METRICS_REFRESH_INTERVAL: 300000, // 5 minutes
  REPORTS_REFRESH_INTERVAL: 3600000, // 1 hour
  
  // Data Retention
  METRICS_RETENTION_DAYS: 90,
  DETAILED_ANALYTICS_RETENTION_DAYS: 30,
  AGGREGATED_ANALYTICS_RETENTION_DAYS: 365,
  
  // Aggregation
  DEFAULT_AGGREGATION_INTERVAL: 'DAILY',
  AVAILABLE_AGGREGATIONS: ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'],
  MAX_DATA_POINTS: 1000,
  
  // Trending
  TRENDING_WINDOW_DAYS: 7,
  TRENDING_MIN_ACTIVITY: 10,
  GROWTH_RATE_THRESHOLD: 0.1, // 10%
  
  // Alerts
  DEFAULT_ALERT_THRESHOLD: 0.8,
  MAX_ALERTS_PER_USER: 50,
  ALERT_COOLDOWN_PERIOD: 3600000, // 1 hour
  
  // Export
  MAX_EXPORT_RECORDS: 50000,
  EXPORT_TIMEOUT: 300000, // 5 minutes
  AVAILABLE_EXPORT_FORMATS: ['CSV', 'EXCEL', 'JSON', 'PDF']
} as const;

// ============================================================================
// LINEAGE CONFIGURATION
// ============================================================================

export const LINEAGE_CONFIG = {
  // Visualization
  DEFAULT_LINEAGE_DEPTH: 5,
  MAX_LINEAGE_DEPTH: 20,
  MAX_NODES_DISPLAY: 500,
  DEFAULT_LAYOUT: 'HIERARCHICAL',
  AVAILABLE_LAYOUTS: ['HIERARCHICAL', 'FORCE_DIRECTED', 'CIRCULAR', 'TREE'],
  
  // Tracking
  AUTO_LINEAGE_DISCOVERY: true,
  LINEAGE_CONFIDENCE_THRESHOLD: 0.8,
  MAX_LINEAGE_PATHS: 100,
  
  // Impact Analysis
  IMPACT_ANALYSIS_DEPTH: 10,
  CHANGE_PROPAGATION_ENABLED: true,
  BUSINESS_IMPACT_SCORING: true,
  
  // Performance
  LINEAGE_CACHE_TTL: 1800000, // 30 minutes
  LAZY_LOADING_ENABLED: true,
  PROGRESSIVE_RENDERING: true,
  
  // Validation
  LINEAGE_VALIDATION_ENABLED: true,
  VALIDATION_SCHEDULE: 'DAILY',
  CONSISTENCY_CHECK_THRESHOLD: 0.95
} as const;

// ============================================================================
// AI & ML CONFIGURATION
// ============================================================================

export const AI_CONFIG = {
  // Model Settings
  DEFAULT_CONFIDENCE_THRESHOLD: 0.8,
  MIN_TRAINING_SAMPLES: 100,
  MAX_TRAINING_SAMPLES: 1000000,
  MODEL_RETRAINING_INTERVAL: 604800000, // 1 week
  
  // Recommendations
  MAX_RECOMMENDATIONS: 50,
  RECOMMENDATION_REFRESH_INTERVAL: 3600000, // 1 hour
  PERSONALIZATION_ENABLED: true,
  COLLABORATIVE_FILTERING_ENABLED: true,
  
  // NLP Settings
  MAX_TEXT_LENGTH: 10000,
  SENTIMENT_ANALYSIS_ENABLED: true,
  ENTITY_EXTRACTION_ENABLED: true,
  LANGUAGE_DETECTION_ENABLED: true,
  
  // Anomaly Detection
  ANOMALY_DETECTION_SENSITIVITY: 'MEDIUM',
  ANOMALY_DETECTION_WINDOW: 86400000, // 24 hours
  MAX_ANOMALIES_PER_ASSET: 10,
  
  // AutoML
  AUTOML_ENABLED: true,
  AUTOML_MAX_TRAINING_TIME: 3600000, // 1 hour
  AUTOML_MAX_MODELS: 10,
  FEATURE_SELECTION_ENABLED: true,
  
  // Performance
  AI_REQUEST_TIMEOUT: 60000, // 1 minute
  AI_BATCH_SIZE: 100,
  AI_CACHE_ENABLED: true,
  AI_CACHE_TTL: 1800000 // 30 minutes
} as const;

// ============================================================================
// QUALITY MANAGEMENT CONFIGURATION
// ============================================================================

export const QUALITY_CONFIG = {
  // Quality Rules
  MAX_QUALITY_RULES: 1000,
  DEFAULT_RULE_THRESHOLD: 0.8,
  RULE_EXECUTION_TIMEOUT: 300000, // 5 minutes
  
  // Quality Scoring
  QUALITY_SCORE_WEIGHTS: {
    COMPLETENESS: 0.25,
    UNIQUENESS: 0.2,
    VALIDITY: 0.2,
    ACCURACY: 0.2,
    CONSISTENCY: 0.15
  },
  
  // Monitoring
  QUALITY_MONITORING_ENABLED: true,
  MONITORING_FREQUENCY: 'DAILY',
  QUALITY_ALERTS_ENABLED: true,
  ALERT_THRESHOLD: 0.7,
  
  // Remediation
  AUTO_REMEDIATION_ENABLED: false,
  MAX_REMEDIATION_ATTEMPTS: 3,
  REMEDIATION_TIMEOUT: 1800000, // 30 minutes
  
  // Data Profiling
  PROFILING_SAMPLE_SIZE: 10000,
  STATISTICAL_ANALYSIS_ENABLED: true,
  PATTERN_DETECTION_ENABLED: true,
  OUTLIER_DETECTION_ENABLED: true,
  
  // Quality Trends
  QUALITY_TREND_WINDOW: 30, // 30 days
  TREND_ANALYSIS_ENABLED: true,
  PREDICTIVE_QUALITY_ENABLED: true
} as const;

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export const SECURITY_CONFIG = {
  // Authentication
  SESSION_TIMEOUT: 3600000, // 1 hour
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  
  // Authorization
  RBAC_ENABLED: true,
  PERMISSION_CACHE_TTL: 300000, // 5 minutes
  FINE_GRAINED_PERMISSIONS: true,
  
  // Data Protection
  FIELD_LEVEL_ENCRYPTION: true,
  PII_DETECTION_ENABLED: true,
  DATA_MASKING_ENABLED: true,
  AUDIT_LOG_RETENTION: 2555000000, // 1 year
  
  // API Security
  RATE_LIMITING_ENABLED: true,
  CORS_ENABLED: true,
  CSRF_PROTECTION_ENABLED: true,
  XSS_PROTECTION_ENABLED: true,
  
  // Monitoring
  SECURITY_MONITORING_ENABLED: true,
  THREAT_DETECTION_ENABLED: true,
  SUSPICIOUS_ACTIVITY_THRESHOLD: 10,
  SECURITY_ALERT_COOLDOWN: 300000 // 5 minutes
} as const;

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================

export const PERFORMANCE_CONFIG = {
  // Caching
  BROWSER_CACHE_ENABLED: true,
  SERVICE_WORKER_ENABLED: true,
  CDN_ENABLED: true,
  CACHE_STRATEGY: 'CACHE_FIRST',
  
  // Optimization
  LAZY_LOADING_ENABLED: true,
  CODE_SPLITTING_ENABLED: true,
  IMAGE_OPTIMIZATION_ENABLED: true,
  COMPRESSION_ENABLED: true,
  
  // Monitoring
  PERFORMANCE_MONITORING_ENABLED: true,
  REAL_USER_MONITORING: true,
  SYNTHETIC_MONITORING: true,
  ERROR_TRACKING_ENABLED: true,
  
  // Thresholds
  FIRST_CONTENTFUL_PAINT_THRESHOLD: 2000, // 2 seconds
  LARGEST_CONTENTFUL_PAINT_THRESHOLD: 4000, // 4 seconds
  CUMULATIVE_LAYOUT_SHIFT_THRESHOLD: 0.1,
  FIRST_INPUT_DELAY_THRESHOLD: 100, // 100ms
  
  // Resource Loading
  RESOURCE_HINTS_ENABLED: true,
  PRELOAD_CRITICAL_RESOURCES: true,
  PREFETCH_NEXT_PAGE: true,
  BUNDLE_SIZE_THRESHOLD: 244000 // 244KB
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  // Core Features
  ADVANCED_SEARCH_ENABLED: true,
  SEMANTIC_SEARCH_ENABLED: true,
  AI_RECOMMENDATIONS_ENABLED: true,
  REAL_TIME_ANALYTICS_ENABLED: true,
  
  // Advanced Features
  COLUMN_LEVEL_LINEAGE_ENABLED: true,
  AUTOMATED_DISCOVERY_ENABLED: true,
  PREDICTIVE_ANALYTICS_ENABLED: true,
  ANOMALY_DETECTION_ENABLED: true,
  
  // Experimental Features
  NATURAL_LANGUAGE_QUERIES_ENABLED: false,
  AUTOMATED_REMEDIATION_ENABLED: false,
  BLOCKCHAIN_LINEAGE_ENABLED: false,
  QUANTUM_SEARCH_ENABLED: false,
  
  // Integration Features
  EXTERNAL_CATALOG_SYNC_ENABLED: true,
  API_GATEWAY_INTEGRATION_ENABLED: true,
  WEBHOOK_NOTIFICATIONS_ENABLED: true,
  SLACK_INTEGRATION_ENABLED: true,
  
  // UI Features
  DARK_MODE_ENABLED: true,
  ACCESSIBILITY_FEATURES_ENABLED: true,
  MOBILE_RESPONSIVE_ENABLED: true,
  KEYBOARD_SHORTCUTS_ENABLED: true
} as const;

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export const ENVIRONMENT_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV !== 'production',
  LOG_TO_CONSOLE: true,
  LOG_TO_FILE: false,
  
  // Monitoring
  SENTRY_ENABLED: process.env.SENTRY_DSN ? true : false,
  ANALYTICS_ENABLED: process.env.ANALYTICS_ID ? true : false,
  ERROR_REPORTING_ENABLED: true,
  PERFORMANCE_MONITORING_ENABLED: true
} as const;

// ============================================================================
// EXPORT ALL CONFIGURATIONS
// ============================================================================

export const ALL_CONFIG = {
  API: API_CONFIG,
  PAGINATION: PAGINATION_CONFIG,
  UI: UI_CONFIG,
  SEARCH: SEARCH_CONFIG,
  DISCOVERY: DISCOVERY_CONFIG,
  ANALYTICS: ANALYTICS_CONFIG,
  LINEAGE: LINEAGE_CONFIG,
  AI: AI_CONFIG,
  QUALITY: QUALITY_CONFIG,
  SECURITY: SECURITY_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  FEATURES: FEATURE_FLAGS,
  ENVIRONMENT: ENVIRONMENT_CONFIG
} as const;

export default ALL_CONFIG;