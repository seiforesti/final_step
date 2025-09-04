// Advanced-Scan-Logic/constants/index.ts
// Configuration constants for the Advanced Scan Logic system

// ==================== ORCHESTRATION CONFIGURATIONS ====================

export const ORCHESTRATION_CONFIGS = {
  // Default refresh intervals (in milliseconds)
  DEFAULT_REFRESH_INTERVAL: 30000,
  FAST_REFRESH_INTERVAL: 10000,
  SLOW_REFRESH_INTERVAL: 60000,
  
  // Job execution limits
  MAX_CONCURRENT_JOBS: 50,
  MAX_JOB_DURATION_MINUTES: 480, // 8 hours
  DEFAULT_JOB_TIMEOUT_MINUTES: 60,
  
  // Resource allocation
  RESOURCE_ALLOCATION_TIMEOUT: 300000, // 5 minutes
  RESOURCE_CLEANUP_INTERVAL: 600000, // 10 minutes
  
  // Retry configurations
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 5000,
  EXPONENTIAL_BACKOFF_MULTIPLIER: 2,
  
  // Queue configurations
  MAX_QUEUE_SIZE: 1000,
  PRIORITY_QUEUE_LEVELS: 5,
  
  // Status update intervals
  STATUS_UPDATE_INTERVAL: 5000,
  HEARTBEAT_INTERVAL: 30000,
  
  // Cross-system coordination
  COORDINATION_TIMEOUT_MS: 120000, // 2 minutes
  SYNC_INTERVAL_MS: 15000,
  
  // Workflow execution
  WORKFLOW_STEP_TIMEOUT_MS: 300000, // 5 minutes
  MAX_WORKFLOW_STEPS: 100,
  
  // Scheduling
  SCHEDULE_CHECK_INTERVAL_MS: 60000, // 1 minute
  MAX_SCHEDULED_JOBS: 500
} as const;

// ==================== PERFORMANCE THRESHOLDS ====================

export const PERFORMANCE_THRESHOLDS = {
  // CPU utilization thresholds
  CPU_WARNING_THRESHOLD: 70,
  CPU_CRITICAL_THRESHOLD: 90,
  
  // Memory utilization thresholds
  MEMORY_WARNING_THRESHOLD: 75,
  MEMORY_CRITICAL_THRESHOLD: 90,
  
  // Disk utilization thresholds
  DISK_WARNING_THRESHOLD: 80,
  DISK_CRITICAL_THRESHOLD: 95,
  
  // Network thresholds
  NETWORK_LATENCY_WARNING_MS: 100,
  NETWORK_LATENCY_CRITICAL_MS: 500,
  NETWORK_THROUGHPUT_MIN_MBPS: 100,
  
  // Response time thresholds
  API_RESPONSE_WARNING_MS: 1000,
  API_RESPONSE_CRITICAL_MS: 5000,
  DATABASE_QUERY_WARNING_MS: 500,
  DATABASE_QUERY_CRITICAL_MS: 2000,
  
  // Throughput thresholds
  MIN_OPERATIONS_PER_SECOND: 10,
  TARGET_OPERATIONS_PER_SECOND: 100,
  
  // Error rate thresholds
  ERROR_RATE_WARNING_PERCENT: 5,
  ERROR_RATE_CRITICAL_PERCENT: 15,
  
  // Cache performance
  CACHE_HIT_RATIO_WARNING: 70,
  CACHE_HIT_RATIO_TARGET: 85,
  
  // Queue performance
  QUEUE_DEPTH_WARNING: 100,
  QUEUE_DEPTH_CRITICAL: 500,
  QUEUE_PROCESSING_TIME_WARNING_MS: 30000,
  
  // Resource efficiency
  RESOURCE_EFFICIENCY_WARNING: 60,
  RESOURCE_EFFICIENCY_TARGET: 80,
  
  // Optimization intervals
  AUTO_OPTIMIZATION_INTERVAL_MS: 1800000, // 30 minutes
  PERFORMANCE_ANALYSIS_INTERVAL_MS: 300000, // 5 minutes
  
  // Alert thresholds
  PERFORMANCE_DEGRADATION_THRESHOLD: 20, // 20% degradation
  OPTIMIZATION_IMPROVEMENT_THRESHOLD: 10 // 10% improvement required
} as const;

// ==================== SECURITY POLICIES ====================

export const SECURITY_POLICIES = {
  // Authentication
  SESSION_TIMEOUT_MINUTES: 480, // 8 hours
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_COMPLEXITY_REQUIRED: true,
  
  // Authorization
  ROLE_HIERARCHY: [
    'admin',
    'operator', 
    'analyst',
    'viewer'
  ],
  
  // API security
  API_RATE_LIMIT_PER_MINUTE: 1000,
  API_RATE_LIMIT_BURST: 100,
  MAX_REQUEST_SIZE_MB: 50,
  
  // Data classification
  DATA_CLASSIFICATION_LEVELS: [
    'PUBLIC',
    'INTERNAL',
    'CONFIDENTIAL', 
    'RESTRICTED'
  ],
  
  // Encryption
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_ROTATION_INTERVAL_DAYS: 90,
  
  // Audit requirements
  AUDIT_RETENTION_DAYS: 2555, // 7 years
  AUDIT_LOG_LEVEL: 'INFO',
  
  // Security scanning
  VULNERABILITY_SCAN_INTERVAL_HOURS: 24,
  COMPLIANCE_CHECK_INTERVAL_HOURS: 12,
  THREAT_DETECTION_ENABLED: true,
  
  // Access controls
  DEFAULT_PERMISSIONS: ['read'],
  PERMISSION_INHERITANCE: true,
  ACCESS_REVIEW_INTERVAL_DAYS: 90,
  
  // Network security
  ALLOWED_IP_RANGES: [],
  BLOCKED_IP_RANGES: [],
  REQUIRE_TLS: true,
  MIN_TLS_VERSION: '1.2',
  
  // Compliance frameworks
  SUPPORTED_FRAMEWORKS: [
    'SOC2',
    'GDPR',
    'HIPAA',
    'PCI-DSS',
    'ISO27001'
  ]
} as const;

// ==================== UI CONSTANTS ====================

export const UI_CONSTANTS = {
  // Theme configuration
  DEFAULT_THEME: 'auto',
  AVAILABLE_THEMES: ['light', 'dark', 'auto'],
  
  // Layout
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 32,
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
  
  // Data table
  MAX_SELECTABLE_ROWS: 1000,
  VIRTUAL_SCROLLING_THRESHOLD: 500,
  
  // Notifications
  NOTIFICATION_DURATION_MS: 5000,
  MAX_NOTIFICATIONS: 50,
  
  // Animations
  ANIMATION_DURATION_MS: 200,
  LOADING_ANIMATION_DELAY_MS: 500,
  
  // Charts and visualizations
  CHART_REFRESH_INTERVAL_MS: 30000,
  MAX_CHART_DATA_POINTS: 1000,
  DEFAULT_CHART_COLORS: [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
  ],
  
  // Search and filtering
  SEARCH_DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_FILTER_VALUES: 100,
  
  // Real-time updates
  WEBSOCKET_RECONNECT_INTERVAL_MS: 5000,
  MAX_WEBSOCKET_RECONNECT_ATTEMPTS: 10,
  
  // Progress indicators
  PROGRESS_UPDATE_INTERVAL_MS: 1000,
  MIN_PROGRESS_DISPLAY_TIME_MS: 2000,
  
  // Responsive breakpoints
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },
  
  // Command center
  COMMAND_EXECUTION_TIMEOUT_MS: 300000, // 5 minutes
  MAX_CONCURRENT_COMMANDS: 10,
  
  // Dashboard widgets
  WIDGET_REFRESH_INTERVALS: {
    realtime: 5000,
    fast: 15000,
    normal: 30000,
    slow: 60000
  },
  
  // Error boundaries
  ERROR_DISPLAY_TIMEOUT_MS: 10000,
  AUTO_RETRY_ENABLED: true,
  MAX_AUTO_RETRY_ATTEMPTS: 3
} as const;

// ==================== WORKFLOW TEMPLATES ====================

export const WORKFLOW_TEMPLATES = {
  // Standard scan workflow
  STANDARD_SCAN: {
    id: 'standard-scan',
    name: 'Standard Data Scan',
    description: 'Standard workflow for comprehensive data scanning',
    steps: [
      {
        id: 'initialization',
        name: 'Initialize Scan',
        type: 'system',
        timeout_ms: 30000
      },
      {
        id: 'discovery',
        name: 'Data Discovery',
        type: 'scan',
        timeout_ms: 300000
      },
      {
        id: 'classification',
        name: 'Data Classification',
        type: 'classification',
        timeout_ms: 600000
      },
      {
        id: 'compliance_check',
        name: 'Compliance Validation',
        type: 'compliance',
        timeout_ms: 180000
      },
      {
        id: 'reporting',
        name: 'Generate Reports',
        type: 'reporting',
        timeout_ms: 120000
      },
      {
        id: 'cleanup',
        name: 'Cleanup Resources',
        type: 'system',
        timeout_ms: 60000
      }
    ]
  },
  
  // Security scan workflow
  SECURITY_SCAN: {
    id: 'security-scan',
    name: 'Security Assessment Scan',
    description: 'Comprehensive security assessment workflow',
    steps: [
      {
        id: 'preparation',
        name: 'Security Scan Preparation',
        type: 'security',
        timeout_ms: 60000
      },
      {
        id: 'vulnerability_scan',
        name: 'Vulnerability Assessment',
        type: 'security',
        timeout_ms: 900000
      },
      {
        id: 'threat_detection',
        name: 'Threat Detection',
        type: 'security',
        timeout_ms: 600000
      },
      {
        id: 'access_review',
        name: 'Access Control Review',
        type: 'security',
        timeout_ms: 300000
      },
      {
        id: 'security_reporting',
        name: 'Security Report Generation',
        type: 'reporting',
        timeout_ms: 180000
      }
    ]
  },
  
  // Performance optimization workflow
  PERFORMANCE_OPTIMIZATION: {
    id: 'performance-optimization',
    name: 'System Performance Optimization',
    description: 'Automated performance optimization workflow',
    steps: [
      {
        id: 'baseline_measurement',
        name: 'Baseline Performance Measurement',
        type: 'performance',
        timeout_ms: 300000
      },
      {
        id: 'bottleneck_analysis',
        name: 'Bottleneck Analysis',
        type: 'analysis',
        timeout_ms: 600000
      },
      {
        id: 'optimization_planning',
        name: 'Optimization Strategy Planning',
        type: 'planning',
        timeout_ms: 180000
      },
      {
        id: 'optimization_execution',
        name: 'Execute Optimizations',
        type: 'optimization',
        timeout_ms: 900000
      },
      {
        id: 'validation',
        name: 'Performance Validation',
        type: 'validation',
        timeout_ms: 300000
      },
      {
        id: 'optimization_reporting',
        name: 'Optimization Report',
        type: 'reporting',
        timeout_ms: 120000
      }
    ]
  },
  
  // Data quality assessment workflow
  DATA_QUALITY: {
    id: 'data-quality',
    name: 'Data Quality Assessment',
    description: 'Comprehensive data quality evaluation workflow',
    steps: [
      {
        id: 'quality_profiling',
        name: 'Data Quality Profiling',
        type: 'profiling',
        timeout_ms: 600000
      },
      {
        id: 'completeness_check',
        name: 'Completeness Analysis',
        type: 'quality',
        timeout_ms: 300000
      },
      {
        id: 'accuracy_validation',
        name: 'Accuracy Validation',
        type: 'quality',
        timeout_ms: 450000
      },
      {
        id: 'consistency_analysis',
        name: 'Consistency Analysis',
        type: 'quality',
        timeout_ms: 300000
      },
      {
        id: 'quality_scoring',
        name: 'Quality Score Calculation',
        type: 'analysis',
        timeout_ms: 120000
      },
      {
        id: 'quality_reporting',
        name: 'Quality Report Generation',
        type: 'reporting',
        timeout_ms: 180000
      }
    ]
  }
} as const;

// ==================== API ENDPOINTS ====================

export const API_ENDPOINTS = {
  BASE_URL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/api/v1',
  
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  
  // Orchestration
  ORCHESTRATION: {
    JOBS: '/scan-orchestration/jobs',
    TEMPLATES: '/scan-orchestration/templates',
    PIPELINES: '/scan-orchestration/pipelines',
    RESOURCES: '/scan-orchestration/resources',
    ANALYTICS: '/scan-orchestration/analytics'
  },
  
  // Analytics
  ANALYTICS: {
    METRICS: '/analytics/metrics',
    INSIGHTS: '/analytics/insights',
    REPORTS: '/analytics/reports',
    PREDICTIONS: '/analytics/predictions',
    MODELS: '/analytics/models'
  },
  
  // Performance
  PERFORMANCE: {
    METRICS: '/performance/metrics',
    OPTIMIZATIONS: '/performance/optimizations',
    BENCHMARKS: '/performance/benchmarks',
    RECOMMENDATIONS: '/performance/recommendations'
  },
  
  // Monitoring
  MONITORING: {
    ALERTS: '/monitoring/alerts',
    METRICS: '/monitoring/metrics',
    HEALTH: '/monitoring/health',
    EVENTS: '/monitoring/events',
    TELEMETRY: '/monitoring/telemetry'
  },
  
  // Intelligence
  INTELLIGENCE: {
    ENGINES: '/intelligence/engines',
    PREDICTIONS: '/intelligence/predictions',
    ANOMALIES: '/intelligence/anomalies',
    PATTERNS: '/intelligence/patterns',
    MODELS: '/intelligence/models'
  },
  
  // Security
  SECURITY: {
    SCANS: '/security/scans',
    VULNERABILITIES: '/security/vulnerabilities',
    THREATS: '/security/threats',
    COMPLIANCE: '/security/compliance',
    ACCESS_CONTROL: '/security/access-control'
  },
  
  // Workflow
  WORKFLOW: {
    EXECUTIONS: '/workflow/executions',
    TEMPLATES: '/workflow/templates',
    APPROVALS: '/workflow/approvals',
    DEPENDENCIES: '/workflow/dependencies'
  }
} as const;

// ==================== ERROR CODES ====================

export const ERROR_CODES = {
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_LIMIT_EXCEEDED: 'RESOURCE_LIMIT_EXCEEDED',
  
  // Orchestration errors
  JOB_EXECUTION_FAILED: 'JOB_EXECUTION_FAILED',
  JOB_TIMEOUT: 'JOB_TIMEOUT',
  RESOURCE_ALLOCATION_FAILED: 'RESOURCE_ALLOCATION_FAILED',
  COORDINATION_FAILED: 'COORDINATION_FAILED',
  
  // Performance errors
  PERFORMANCE_DEGRADED: 'PERFORMANCE_DEGRADED',
  OPTIMIZATION_FAILED: 'OPTIMIZATION_FAILED',
  THRESHOLD_EXCEEDED: 'THRESHOLD_EXCEEDED',
  
  // Security errors
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  COMPLIANCE_VIOLATION: 'COMPLIANCE_VIOLATION',
  THREAT_DETECTED: 'THREAT_DETECTED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Data errors
  DATA_CORRUPTION: 'DATA_CORRUPTION',
  DATA_QUALITY_ISSUE: 'DATA_QUALITY_ISSUE',
  SCHEMA_MISMATCH: 'SCHEMA_MISMATCH'
} as const;

// ==================== FEATURE FLAGS ====================

export const FEATURE_FLAGS = {
  // Advanced features
  ENABLE_AI_FEATURES: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
  ENABLE_PREDICTIVE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_PREDICTIVE_ANALYTICS === 'true',
  ENABLE_AUTO_OPTIMIZATION: process.env.NEXT_PUBLIC_ENABLE_AUTO_OPTIMIZATION === 'true',
  
  // Real-time features
  ENABLE_REAL_TIME_UPDATES: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES !== 'false',
  ENABLE_WEBSOCKETS: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS !== 'false',
  
  // Security features
  ENABLE_ADVANCED_SECURITY: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_SECURITY === 'true',
  ENABLE_THREAT_DETECTION: process.env.NEXT_PUBLIC_ENABLE_THREAT_DETECTION === 'true',
  
  // Performance features
  ENABLE_PERFORMANCE_MONITORING: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING !== 'false',
  ENABLE_AUTO_SCALING: process.env.NEXT_PUBLIC_ENABLE_AUTO_SCALING === 'true',
  
  // UI features
  ENABLE_ADVANCED_UI: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_UI !== 'false',
  ENABLE_CUSTOMIZABLE_DASHBOARD: process.env.NEXT_PUBLIC_ENABLE_CUSTOMIZABLE_DASHBOARD === 'true',
  
  // Integration features
  ENABLE_EXTERNAL_INTEGRATIONS: process.env.NEXT_PUBLIC_ENABLE_EXTERNAL_INTEGRATIONS === 'true',
  ENABLE_API_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_API_ANALYTICS === 'true'
} as const;

// Export all constants
export default {
  ORCHESTRATION_CONFIGS,
  PERFORMANCE_THRESHOLDS,
  SECURITY_POLICIES,
  UI_CONSTANTS,
  WORKFLOW_TEMPLATES,
  API_ENDPOINTS,
  ERROR_CODES,
  FEATURE_FLAGS
};