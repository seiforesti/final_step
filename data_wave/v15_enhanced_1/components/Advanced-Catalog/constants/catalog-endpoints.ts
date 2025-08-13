// ============================================================================
// ADVANCED CATALOG API ENDPOINTS - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// API endpoint constants mapping to backend routes from CORRECTED_BACKEND_MAPPING_CATALOG.md
// ============================================================================

// ============================================================================
// BASE API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  VERSION: 'v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

// Construct base API URL
export const API_BASE = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}`;

// ============================================================================
// ENTERPRISE CATALOG ENDPOINTS (enterprise_catalog_routes.py)
// ============================================================================

export const ENTERPRISE_CATALOG_ENDPOINTS = {
  // Asset Management
  ASSETS: {
    LIST: `${API_BASE}/catalog/assets`,
    CREATE: `${API_BASE}/catalog/assets`,
    GET: (id: string) => `${API_BASE}/catalog/assets/${id}`,
    UPDATE: (id: string) => `${API_BASE}/catalog/assets/${id}`,
    DELETE: (id: string) => `${API_BASE}/catalog/assets/${id}`,
    BULK_UPDATE: `${API_BASE}/catalog/assets/bulk`,
    BULK_DELETE: `${API_BASE}/catalog/assets/bulk/delete`,
    EXPORT: `${API_BASE}/catalog/assets/export`,
    IMPORT: `${API_BASE}/catalog/assets/import`,
    VALIDATE: `${API_BASE}/catalog/assets/validate`,
    SCHEMA: (id: string) => `${API_BASE}/catalog/assets/${id}/schema`,
    COLUMNS: (id: string) => `${API_BASE}/catalog/assets/${id}/columns`,
    METADATA: (id: string) => `${API_BASE}/catalog/assets/${id}/metadata`,
    RELATIONSHIPS: (id: string) => `${API_BASE}/catalog/assets/${id}/relationships`,
    TAGS: (id: string) => `${API_BASE}/catalog/assets/${id}/tags`,
    CLASSIFICATIONS: (id: string) => `${API_BASE}/catalog/assets/${id}/classifications`,
    QUALITY_SCORE: (id: string) => `${API_BASE}/catalog/assets/${id}/quality`,
    USAGE_METRICS: (id: string) => `${API_BASE}/catalog/assets/${id}/usage`,
    LINEAGE: (id: string) => `${API_BASE}/catalog/assets/${id}/lineage`,
    RECOMMENDATIONS: (id: string) => `${API_BASE}/catalog/assets/${id}/recommendations`,
    SIMILAR: (id: string) => `${API_BASE}/catalog/assets/${id}/similar`,
    FAVORITES: (id: string) => `${API_BASE}/catalog/assets/${id}/favorites`,
    WATCH: (id: string) => `${API_BASE}/catalog/assets/${id}/watch`,
    COMMENTS: (id: string) => `${API_BASE}/catalog/assets/${id}/comments`,
    RATINGS: (id: string) => `${API_BASE}/catalog/assets/${id}/ratings`,
    VERSIONS: (id: string) => `${API_BASE}/catalog/assets/${id}/versions`,
    CLONE: (id: string) => `${API_BASE}/catalog/assets/${id}/clone`
  },

  // Enterprise Features
  ENTERPRISE: {
    DASHBOARD: `${API_BASE}/catalog/enterprise/dashboard`,
    HEALTH: `${API_BASE}/catalog/enterprise/health`,
    METRICS: `${API_BASE}/catalog/enterprise/metrics`,
    REPORTS: `${API_BASE}/catalog/enterprise/reports`,
    AUDIT: `${API_BASE}/catalog/enterprise/audit`,
    GOVERNANCE: `${API_BASE}/catalog/enterprise/governance`,
    COMPLIANCE: `${API_BASE}/catalog/enterprise/compliance`,
    SECURITY: `${API_BASE}/catalog/enterprise/security`,
    PERFORMANCE: `${API_BASE}/catalog/enterprise/performance`,
    CONFIGURATION: `${API_BASE}/catalog/enterprise/configuration`,
    BACKUP: `${API_BASE}/catalog/enterprise/backup`,
    RESTORE: `${API_BASE}/catalog/enterprise/restore`,
    MIGRATION: `${API_BASE}/catalog/enterprise/migration`,
    INTEGRATION: `${API_BASE}/catalog/enterprise/integration`
  },

  // Catalog Management
  CATALOG: {
    OVERVIEW: `${API_BASE}/catalog/overview`,
    STATISTICS: `${API_BASE}/catalog/statistics`,
    CATEGORIES: `${API_BASE}/catalog/categories`,
    COLLECTIONS: `${API_BASE}/catalog/collections`,
    BOOKMARKS: `${API_BASE}/catalog/bookmarks`,
    RECENT: `${API_BASE}/catalog/recent`,
    TRENDING: `${API_BASE}/catalog/trending`,
    POPULAR: `${API_BASE}/catalog/popular`,
    FEATURED: `${API_BASE}/catalog/featured`,
    RECOMMENDATIONS: `${API_BASE}/catalog/recommendations`,
    PERSONALIZED: `${API_BASE}/catalog/personalized`
  }
} as const;

// ============================================================================
// INTELLIGENT DISCOVERY ENDPOINTS (intelligent_discovery_routes.py)
// ============================================================================

export const DISCOVERY_ENDPOINTS = {
  // Discovery Jobs
  JOBS: {
    LIST: `${API_BASE}/discovery/jobs`,
    CREATE: `${API_BASE}/discovery/jobs`,
    GET: (id: string) => `${API_BASE}/discovery/jobs/${id}`,
    UPDATE: (id: string) => `${API_BASE}/discovery/jobs/${id}`,
    DELETE: (id: string) => `${API_BASE}/discovery/jobs/${id}`,
    START: (id: string) => `${API_BASE}/discovery/jobs/${id}/start`,
    STOP: (id: string) => `${API_BASE}/discovery/jobs/${id}/stop`,
    PAUSE: (id: string) => `${API_BASE}/discovery/jobs/${id}/pause`,
    RESUME: (id: string) => `${API_BASE}/discovery/jobs/${id}/resume`,
    STATUS: (id: string) => `${API_BASE}/discovery/jobs/${id}/status`,
    PROGRESS: (id: string) => `${API_BASE}/discovery/jobs/${id}/progress`,
    RESULTS: (id: string) => `${API_BASE}/discovery/jobs/${id}/results`,
    LOGS: (id: string) => `${API_BASE}/discovery/jobs/${id}/logs`,
    CANCEL: (id: string) => `${API_BASE}/discovery/jobs/${id}/cancel`,
    RETRY: (id: string) => `${API_BASE}/discovery/jobs/${id}/retry`,
    CLONE: (id: string) => `${API_BASE}/discovery/jobs/${id}/clone`,
    EXPORT: (id: string) => `${API_BASE}/discovery/jobs/${id}/export`
  },

  // Discovery Configuration
  CONFIGURATIONS: {
    LIST: `${API_BASE}/discovery/configurations`,
    CREATE: `${API_BASE}/discovery/configurations`,
    GET: (id: string) => `${API_BASE}/discovery/configurations/${id}`,
    UPDATE: (id: string) => `${API_BASE}/discovery/configurations/${id}`,
    DELETE: (id: string) => `${API_BASE}/discovery/configurations/${id}`,
    VALIDATE: `${API_BASE}/discovery/configurations/validate`,
    TEMPLATES: `${API_BASE}/discovery/configurations/templates`,
    DUPLICATE: (id: string) => `${API_BASE}/discovery/configurations/${id}/duplicate`,
    TEST: (id: string) => `${API_BASE}/discovery/configurations/${id}/test`
  },

  // Discovery Sources
  SOURCES: {
    LIST: `${API_BASE}/discovery/sources`,
    CREATE: `${API_BASE}/discovery/sources`,
    GET: (id: string) => `${API_BASE}/discovery/sources/${id}`,
    UPDATE: (id: string) => `${API_BASE}/discovery/sources/${id}`,
    DELETE: (id: string) => `${API_BASE}/discovery/sources/${id}`,
    TEST_CONNECTION: (id: string) => `${API_BASE}/discovery/sources/${id}/test`,
    SCAN: (id: string) => `${API_BASE}/discovery/sources/${id}/scan`,
    PREVIEW: (id: string) => `${API_BASE}/discovery/sources/${id}/preview`,
    SCHEMA: (id: string) => `${API_BASE}/discovery/sources/${id}/schema`,
    STATISTICS: (id: string) => `${API_BASE}/discovery/sources/${id}/statistics`
  },

  // Incremental Discovery
  INCREMENTAL: {
    LIST: `${API_BASE}/discovery/incremental`,
    CREATE: `${API_BASE}/discovery/incremental`,
    GET: (id: string) => `${API_BASE}/discovery/incremental/${id}`,
    UPDATE: (id: string) => `${API_BASE}/discovery/incremental/${id}`,
    DELETE: (id: string) => `${API_BASE}/discovery/incremental/${id}`,
    CHANGES: (id: string) => `${API_BASE}/discovery/incremental/${id}/changes`,
    SYNC: (id: string) => `${API_BASE}/discovery/incremental/${id}/sync`,
    BASELINE: (id: string) => `${API_BASE}/discovery/incremental/${id}/baseline`
  },

  // Discovery Analytics
  ANALYTICS: {
    OVERVIEW: `${API_BASE}/discovery/analytics/overview`,
    PERFORMANCE: `${API_BASE}/discovery/analytics/performance`,
    TRENDS: `${API_BASE}/discovery/analytics/trends`,
    SUCCESS_RATE: `${API_BASE}/discovery/analytics/success-rate`,
    ERROR_ANALYSIS: `${API_BASE}/discovery/analytics/errors`,
    RECOMMENDATIONS: `${API_BASE}/discovery/analytics/recommendations`
  }
} as const;

// ============================================================================
// SEMANTIC SEARCH ENDPOINTS (semantic_search_routes.py)
// ============================================================================

export const SEARCH_ENDPOINTS = {
  // Search Operations
  SEARCH: {
    QUERY: `${API_BASE}/search`,
    SEMANTIC: `${API_BASE}/search/semantic`,
    ADVANCED: `${API_BASE}/search/advanced`,
    FACETED: `${API_BASE}/search/faceted`,
    NATURAL_LANGUAGE: `${API_BASE}/search/nl`,
    SIMILARITY: `${API_BASE}/search/similarity`,
    FUZZY: `${API_BASE}/search/fuzzy`,
    BOOLEAN: `${API_BASE}/search/boolean`,
    SUGGEST: `${API_BASE}/search/suggest`,
    AUTOCOMPLETE: `${API_BASE}/search/autocomplete`,
    CORRECTIONS: `${API_BASE}/search/corrections`,
    RELATED: `${API_BASE}/search/related`,
    TRENDING: `${API_BASE}/search/trending`,
    POPULAR: `${API_BASE}/search/popular`,
    RECENT: `${API_BASE}/search/recent`,
    SAVED: `${API_BASE}/search/saved`,
    EXPORT: `${API_BASE}/search/export`
  },

  // Search Configuration
  CONFIGURATION: {
    GET: `${API_BASE}/search/configuration`,
    UPDATE: `${API_BASE}/search/configuration`,
    RESET: `${API_BASE}/search/configuration/reset`,
    VALIDATE: `${API_BASE}/search/configuration/validate`,
    BACKUP: `${API_BASE}/search/configuration/backup`,
    RESTORE: `${API_BASE}/search/configuration/restore`
  },

  // Search Index Management
  INDEX: {
    STATUS: `${API_BASE}/search/index/status`,
    REBUILD: `${API_BASE}/search/index/rebuild`,
    OPTIMIZE: `${API_BASE}/search/index/optimize`,
    STATISTICS: `${API_BASE}/search/index/statistics`,
    HEALTH: `${API_BASE}/search/index/health`,
    SETTINGS: `${API_BASE}/search/index/settings`,
    MAPPINGS: `${API_BASE}/search/index/mappings`,
    ALIASES: `${API_BASE}/search/index/aliases`
  },

  // Search Analytics
  ANALYTICS: {
    OVERVIEW: `${API_BASE}/search/analytics/overview`,
    QUERIES: `${API_BASE}/search/analytics/queries`,
    PERFORMANCE: `${API_BASE}/search/analytics/performance`,
    USER_BEHAVIOR: `${API_BASE}/search/analytics/behavior`,
    CLICK_THROUGH: `${API_BASE}/search/analytics/clicks`,
    CONVERSION: `${API_BASE}/search/analytics/conversion`,
    A_B_TESTS: `${API_BASE}/search/analytics/ab-tests`,
    RECOMMENDATIONS: `${API_BASE}/search/analytics/recommendations`
  },

  // Personalization
  PERSONALIZATION: {
    PROFILE: (userId: string) => `${API_BASE}/search/personalization/${userId}`,
    PREFERENCES: (userId: string) => `${API_BASE}/search/personalization/${userId}/preferences`,
    HISTORY: (userId: string) => `${API_BASE}/search/personalization/${userId}/history`,
    RECOMMENDATIONS: (userId: string) => `${API_BASE}/search/personalization/${userId}/recommendations`,
    FEEDBACK: (userId: string) => `${API_BASE}/search/personalization/${userId}/feedback`
  }
} as const;

// ============================================================================
// CATALOG QUALITY ENDPOINTS (catalog_quality_routes.py)
// ============================================================================

export const QUALITY_ENDPOINTS = {
  // Quality Assessments
  ASSESSMENTS: {
    LIST: `${API_BASE}/quality/assessments`,
    CREATE: `${API_BASE}/quality/assessments`,
    GET: (id: string) => `${API_BASE}/quality/assessments/${id}`,
    UPDATE: (id: string) => `${API_BASE}/quality/assessments/${id}`,
    DELETE: (id: string) => `${API_BASE}/quality/assessments/${id}`,
    RUN: (id: string) => `${API_BASE}/quality/assessments/${id}/run`,
    SCHEDULE: (id: string) => `${API_BASE}/quality/assessments/${id}/schedule`,
    RESULTS: (id: string) => `${API_BASE}/quality/assessments/${id}/results`,
    HISTORY: (id: string) => `${API_BASE}/quality/assessments/${id}/history`,
    TRENDS: (id: string) => `${API_BASE}/quality/assessments/${id}/trends`,
    EXPORT: (id: string) => `${API_BASE}/quality/assessments/${id}/export`
  },

  // Quality Rules
  RULES: {
    LIST: `${API_BASE}/quality/rules`,
    CREATE: `${API_BASE}/quality/rules`,
    GET: (id: string) => `${API_BASE}/quality/rules/${id}`,
    UPDATE: (id: string) => `${API_BASE}/quality/rules/${id}`,
    DELETE: (id: string) => `${API_BASE}/quality/rules/${id}`,
    VALIDATE: `${API_BASE}/quality/rules/validate`,
    TEMPLATES: `${API_BASE}/quality/rules/templates`,
    EXECUTE: (id: string) => `${API_BASE}/quality/rules/${id}/execute`,
    TEST: (id: string) => `${API_BASE}/quality/rules/${id}/test`,
    DUPLICATE: (id: string) => `${API_BASE}/quality/rules/${id}/duplicate`,
    LIBRARY: `${API_BASE}/quality/rules/library`,
    CATEGORIES: `${API_BASE}/quality/rules/categories`
  },

  // Quality Dashboard
  DASHBOARD: {
    OVERVIEW: `${API_BASE}/quality/dashboard`,
    SCORECARD: `${API_BASE}/quality/dashboard/scorecard`,
    TRENDS: `${API_BASE}/quality/dashboard/trends`,
    ISSUES: `${API_BASE}/quality/dashboard/issues`,
    ALERTS: `${API_BASE}/quality/dashboard/alerts`,
    REPORTS: `${API_BASE}/quality/dashboard/reports`,
    WIDGETS: `${API_BASE}/quality/dashboard/widgets`,
    PERSONALIZE: `${API_BASE}/quality/dashboard/personalize`
  },

  // Quality Issues
  ISSUES: {
    LIST: `${API_BASE}/quality/issues`,
    GET: (id: string) => `${API_BASE}/quality/issues/${id}`,
    UPDATE: (id: string) => `${API_BASE}/quality/issues/${id}`,
    RESOLVE: (id: string) => `${API_BASE}/quality/issues/${id}/resolve`,
    ASSIGN: (id: string) => `${API_BASE}/quality/issues/${id}/assign`,
    COMMENT: (id: string) => `${API_BASE}/quality/issues/${id}/comments`,
    TRACK: (id: string) => `${API_BASE}/quality/issues/${id}/track`,
    BULK_UPDATE: `${API_BASE}/quality/issues/bulk`,
    STATISTICS: `${API_BASE}/quality/issues/statistics`,
    TRENDS: `${API_BASE}/quality/issues/trends`
  },

  // Quality Monitoring
  MONITORING: {
    LIST: `${API_BASE}/quality/monitoring`,
    CREATE: `${API_BASE}/quality/monitoring`,
    GET: (id: string) => `${API_BASE}/quality/monitoring/${id}`,
    UPDATE: (id: string) => `${API_BASE}/quality/monitoring/${id}`,
    DELETE: (id: string) => `${API_BASE}/quality/monitoring/${id}`,
    START: (id: string) => `${API_BASE}/quality/monitoring/${id}/start`,
    STOP: (id: string) => `${API_BASE}/quality/monitoring/${id}/stop`,
    STATUS: (id: string) => `${API_BASE}/quality/monitoring/${id}/status`,
    ALERTS: (id: string) => `${API_BASE}/quality/monitoring/${id}/alerts`,
    CONFIGURE: (id: string) => `${API_BASE}/quality/monitoring/${id}/configure`
  },

  // Quality Reports
  REPORTS: {
    LIST: `${API_BASE}/quality/reports`,
    CREATE: `${API_BASE}/quality/reports`,
    GET: (id: string) => `${API_BASE}/quality/reports/${id}`,
    UPDATE: (id: string) => `${API_BASE}/quality/reports/${id}`,
    DELETE: (id: string) => `${API_BASE}/quality/reports/${id}`,
    GENERATE: (id: string) => `${API_BASE}/quality/reports/${id}/generate`,
    SCHEDULE: (id: string) => `${API_BASE}/quality/reports/${id}/schedule`,
    EXPORT: (id: string) => `${API_BASE}/quality/reports/${id}/export`,
    SHARE: (id: string) => `${API_BASE}/quality/reports/${id}/share`,
    TEMPLATES: `${API_BASE}/quality/reports/templates`
  }
} as const;

// ============================================================================
// DATA PROFILING ENDPOINTS (data_profiling.py)
// ============================================================================

export const PROFILING_ENDPOINTS = {
  // Profiling Jobs
  JOBS: {
    LIST: `${API_BASE}/profiling/jobs`,
    CREATE: `${API_BASE}/profiling/jobs`,
    GET: (id: string) => `${API_BASE}/profiling/jobs/${id}`,
    UPDATE: (id: string) => `${API_BASE}/profiling/jobs/${id}`,
    DELETE: (id: string) => `${API_BASE}/profiling/jobs/${id}`,
    START: (id: string) => `${API_BASE}/profiling/jobs/${id}/start`,
    STOP: (id: string) => `${API_BASE}/profiling/jobs/${id}/stop`,
    STATUS: (id: string) => `${API_BASE}/profiling/jobs/${id}/status`,
    RESULTS: (id: string) => `${API_BASE}/profiling/jobs/${id}/results`,
    STATISTICS: (id: string) => `${API_BASE}/profiling/jobs/${id}/statistics`,
    EXPORT: (id: string) => `${API_BASE}/profiling/jobs/${id}/export`
  },

  // Profiling Results
  RESULTS: {
    LIST: `${API_BASE}/profiling/results`,
    GET: (id: string) => `${API_BASE}/profiling/results/${id}`,
    COMPARE: `${API_BASE}/profiling/results/compare`,
    TRENDS: `${API_BASE}/profiling/results/trends`,
    SUMMARY: `${API_BASE}/profiling/results/summary`,
    ANOMALIES: `${API_BASE}/profiling/results/anomalies`,
    PATTERNS: `${API_BASE}/profiling/results/patterns`,
    EXPORT: `${API_BASE}/profiling/results/export`,
    ARCHIVE: (id: string) => `${API_BASE}/profiling/results/${id}/archive`
  },

  // Column Profiling
  COLUMNS: {
    PROFILE: (assetId: string, columnName: string) => 
      `${API_BASE}/profiling/assets/${assetId}/columns/${columnName}/profile`,
    STATISTICS: (assetId: string, columnName: string) => 
      `${API_BASE}/profiling/assets/${assetId}/columns/${columnName}/statistics`,
    DISTRIBUTION: (assetId: string, columnName: string) => 
      `${API_BASE}/profiling/assets/${assetId}/columns/${columnName}/distribution`,
    PATTERNS: (assetId: string, columnName: string) => 
      `${API_BASE}/profiling/assets/${assetId}/columns/${columnName}/patterns`,
    ANOMALIES: (assetId: string, columnName: string) => 
      `${API_BASE}/profiling/assets/${assetId}/columns/${columnName}/anomalies`,
    SAMPLES: (assetId: string, columnName: string) => 
      `${API_BASE}/profiling/assets/${assetId}/columns/${columnName}/samples`
  },

  // Asset Profiling
  ASSETS: {
    PROFILE: (id: string) => `${API_BASE}/profiling/assets/${id}/profile`,
    QUICK_PROFILE: (id: string) => `${API_BASE}/profiling/assets/${id}/quick-profile`,
    FULL_PROFILE: (id: string) => `${API_BASE}/profiling/assets/${id}/full-profile`,
    INCREMENTAL: (id: string) => `${API_BASE}/profiling/assets/${id}/incremental`,
    SCHEDULE: (id: string) => `${API_BASE}/profiling/assets/${id}/schedule`,
    HISTORY: (id: string) => `${API_BASE}/profiling/assets/${id}/history`
  }
} as const;

// ============================================================================
// ADVANCED LINEAGE ENDPOINTS (advanced_lineage_routes.py)
// ============================================================================

export const LINEAGE_ENDPOINTS = {
  // Lineage Management
  LINEAGE: {
    LIST: `${API_BASE}/lineage`,
    CREATE: `${API_BASE}/lineage`,
    GET: (id: string) => `${API_BASE}/lineage/${id}`,
    UPDATE: (id: string) => `${API_BASE}/lineage/${id}`,
    DELETE: (id: string) => `${API_BASE}/lineage/${id}`,
    VALIDATE: `${API_BASE}/lineage/validate`,
    BULK_CREATE: `${API_BASE}/lineage/bulk`,
    BULK_UPDATE: `${API_BASE}/lineage/bulk/update`,
    BULK_DELETE: `${API_BASE}/lineage/bulk/delete`,
    EXPORT: `${API_BASE}/lineage/export`,
    IMPORT: `${API_BASE}/lineage/import`
  },

  // Asset Lineage
  ASSETS: {
    UPSTREAM: (id: string) => `${API_BASE}/lineage/assets/${id}/upstream`,
    DOWNSTREAM: (id: string) => `${API_BASE}/lineage/assets/${id}/downstream`,
    FULL: (id: string) => `${API_BASE}/lineage/assets/${id}/full`,
    COLUMN_LEVEL: (id: string) => `${API_BASE}/lineage/assets/${id}/column-level`,
    IMPACT_ANALYSIS: (id: string) => `${API_BASE}/lineage/assets/${id}/impact`,
    DEPENDENCIES: (id: string) => `${API_BASE}/lineage/assets/${id}/dependencies`,
    RELATIONSHIPS: (id: string) => `${API_BASE}/lineage/assets/${id}/relationships`,
    PATHS: (id: string) => `${API_BASE}/lineage/assets/${id}/paths`,
    GRAPH: (id: string) => `${API_BASE}/lineage/assets/${id}/graph`,
    VISUALIZATION: (id: string) => `${API_BASE}/lineage/assets/${id}/visualization`
  },

  // Lineage Discovery
  DISCOVERY: {
    JOBS: `${API_BASE}/lineage/discovery/jobs`,
    CREATE_JOB: `${API_BASE}/lineage/discovery/jobs`,
    GET_JOB: (id: string) => `${API_BASE}/lineage/discovery/jobs/${id}`,
    START_JOB: (id: string) => `${API_BASE}/lineage/discovery/jobs/${id}/start`,
    STOP_JOB: (id: string) => `${API_BASE}/lineage/discovery/jobs/${id}/stop`,
    RESULTS: (id: string) => `${API_BASE}/lineage/discovery/jobs/${id}/results`,
    AUTO_DISCOVER: `${API_BASE}/lineage/discovery/auto`,
    MANUAL_CREATE: `${API_BASE}/lineage/discovery/manual`,
    SUGGESTIONS: `${API_BASE}/lineage/discovery/suggestions`,
    VALIDATE_DISCOVERY: `${API_BASE}/lineage/discovery/validate`
  },

  // Lineage Quality
  QUALITY: {
    ASSESS: `${API_BASE}/lineage/quality/assess`,
    ISSUES: `${API_BASE}/lineage/quality/issues`,
    VALIDATE: `${API_BASE}/lineage/quality/validate`,
    SCORE: (id: string) => `${API_BASE}/lineage/quality/${id}/score`,
    RECOMMENDATIONS: `${API_BASE}/lineage/quality/recommendations`,
    RULES: `${API_BASE}/lineage/quality/rules`,
    MONITORING: `${API_BASE}/lineage/quality/monitoring`
  },

  // Lineage Visualization
  VISUALIZATION: {
    GRAPH: `${API_BASE}/lineage/visualization/graph`,
    HIERARCHICAL: `${API_BASE}/lineage/visualization/hierarchical`,
    FORCE_DIRECTED: `${API_BASE}/lineage/visualization/force-directed`,
    MATRIX: `${API_BASE}/lineage/visualization/matrix`,
    SANKEY: `${API_BASE}/lineage/visualization/sankey`,
    CUSTOM: `${API_BASE}/lineage/visualization/custom`,
    EXPORT_SVG: `${API_BASE}/lineage/visualization/export/svg`,
    EXPORT_PNG: `${API_BASE}/lineage/visualization/export/png`,
    EXPORT_PDF: `${API_BASE}/lineage/visualization/export/pdf`
  },

  // Lineage Analytics
  ANALYTICS: {
    OVERVIEW: `${API_BASE}/lineage/analytics/overview`,
    METRICS: `${API_BASE}/lineage/analytics/metrics`,
    PATTERNS: `${API_BASE}/lineage/analytics/patterns`,
    COMPLEXITY: `${API_BASE}/lineage/analytics/complexity`,
    COVERAGE: `${API_BASE}/lineage/analytics/coverage`,
    TRENDS: `${API_BASE}/lineage/analytics/trends`,
    REPORTS: `${API_BASE}/lineage/analytics/reports`
  }
} as const;

// ============================================================================
// CATALOG ANALYTICS ENDPOINTS (catalog_analytics_routes.py)
// ============================================================================

export const ANALYTICS_ENDPOINTS = {
  // General Analytics
  OVERVIEW: `${API_BASE}/analytics/overview`,
  DASHBOARD: `${API_BASE}/analytics/dashboard`,
  METRICS: `${API_BASE}/analytics/metrics`,
  KPI: `${API_BASE}/analytics/kpi`,
  TRENDS: `${API_BASE}/analytics/trends`,
  INSIGHTS: `${API_BASE}/analytics/insights`,
  REPORTS: `${API_BASE}/analytics/reports`,
  EXPORT: `${API_BASE}/analytics/export`,

  // Usage Analytics
  USAGE: {
    OVERVIEW: `${API_BASE}/analytics/usage/overview`,
    ASSETS: `${API_BASE}/analytics/usage/assets`,
    USERS: `${API_BASE}/analytics/usage/users`,
    PATTERNS: `${API_BASE}/analytics/usage/patterns`,
    TRENDS: `${API_BASE}/analytics/usage/trends`,
    POPULAR: `${API_BASE}/analytics/usage/popular`,
    ENGAGEMENT: `${API_BASE}/analytics/usage/engagement`,
    SESSIONS: `${API_BASE}/analytics/usage/sessions`,
    GEOGRAPHY: `${API_BASE}/analytics/usage/geography`,
    DEVICES: `${API_BASE}/analytics/usage/devices`,
    REFERRERS: `${API_BASE}/analytics/usage/referrers`
  },

  // Business Analytics
  BUSINESS: {
    VALUE: `${API_BASE}/analytics/business/value`,
    ROI: `${API_BASE}/analytics/business/roi`,
    COST_BENEFIT: `${API_BASE}/analytics/business/cost-benefit`,
    EFFICIENCY: `${API_BASE}/analytics/business/efficiency`,
    PRODUCTIVITY: `${API_BASE}/analytics/business/productivity`,
    COMPLIANCE: `${API_BASE}/analytics/business/compliance`,
    RISK: `${API_BASE}/analytics/business/risk`,
    STRATEGIC: `${API_BASE}/analytics/business/strategic`
  },

  // Technical Analytics
  TECHNICAL: {
    PERFORMANCE: `${API_BASE}/analytics/technical/performance`,
    AVAILABILITY: `${API_BASE}/analytics/technical/availability`,
    RELIABILITY: `${API_BASE}/analytics/technical/reliability`,
    SCALABILITY: `${API_BASE}/analytics/technical/scalability`,
    SECURITY: `${API_BASE}/analytics/technical/security`,
    INTEGRATION: `${API_BASE}/analytics/technical/integration`,
    ERRORS: `${API_BASE}/analytics/technical/errors`,
    CAPACITY: `${API_BASE}/analytics/technical/capacity`
  },

  // Predictive Analytics
  PREDICTIVE: {
    MODELS: `${API_BASE}/analytics/predictive/models`,
    FORECASTS: `${API_BASE}/analytics/predictive/forecasts`,
    PREDICTIONS: `${API_BASE}/analytics/predictive/predictions`,
    SCENARIOS: `${API_BASE}/analytics/predictive/scenarios`,
    RECOMMENDATIONS: `${API_BASE}/analytics/predictive/recommendations`,
    TRAINING: `${API_BASE}/analytics/predictive/training`,
    VALIDATION: `${API_BASE}/analytics/predictive/validation`,
    DEPLOYMENT: `${API_BASE}/analytics/predictive/deployment`
  }
} as const;

// ============================================================================
// ENTERPRISE ANALYTICS ENDPOINTS (enterprise_analytics.py)
// ============================================================================

export const ENTERPRISE_ANALYTICS_ENDPOINTS = {
  // Cross-System Analytics
  CROSS_SYSTEM: {
    OVERVIEW: `${API_BASE}/enterprise/analytics/cross-system/overview`,
    METRICS: `${API_BASE}/enterprise/analytics/cross-system/metrics`,
    INTEGRATION: `${API_BASE}/enterprise/analytics/cross-system/integration`,
    DATA_FLOW: `${API_BASE}/enterprise/analytics/cross-system/data-flow`,
    DEPENDENCIES: `${API_BASE}/enterprise/analytics/cross-system/dependencies`,
    HEALTH: `${API_BASE}/enterprise/analytics/cross-system/health`,
    PERFORMANCE: `${API_BASE}/enterprise/analytics/cross-system/performance`
  },

  // Enterprise Metrics
  ENTERPRISE: {
    DASHBOARD: `${API_BASE}/enterprise/analytics/dashboard`,
    SCORECARD: `${API_BASE}/enterprise/analytics/scorecard`,
    KPI: `${API_BASE}/enterprise/analytics/kpi`,
    BENCHMARKS: `${API_BASE}/enterprise/analytics/benchmarks`,
    COMPARISON: `${API_BASE}/enterprise/analytics/comparison`,
    MATURITY: `${API_BASE}/enterprise/analytics/maturity`,
    GOVERNANCE: `${API_BASE}/enterprise/analytics/governance`,
    COMPLIANCE: `${API_BASE}/enterprise/analytics/compliance`
  },

  // Advanced Analytics
  ADVANCED: {
    AI_INSIGHTS: `${API_BASE}/enterprise/analytics/ai/insights`,
    ML_MODELS: `${API_BASE}/enterprise/analytics/ml/models`,
    ANOMALY_DETECTION: `${API_BASE}/enterprise/analytics/anomaly-detection`,
    PATTERN_RECOGNITION: `${API_BASE}/enterprise/analytics/pattern-recognition`,
    CORRELATION_ANALYSIS: `${API_BASE}/enterprise/analytics/correlation`,
    CAUSAL_ANALYSIS: `${API_BASE}/enterprise/analytics/causal`,
    OPTIMIZATION: `${API_BASE}/enterprise/analytics/optimization`,
    SIMULATION: `${API_BASE}/enterprise/analytics/simulation`
  },

  // Real-time Analytics
  REAL_TIME: {
    STREAMING: `${API_BASE}/enterprise/analytics/real-time/streaming`,
    EVENTS: `${API_BASE}/enterprise/analytics/real-time/events`,
    ALERTS: `${API_BASE}/enterprise/analytics/real-time/alerts`,
    MONITORING: `${API_BASE}/enterprise/analytics/real-time/monitoring`,
    DASHBOARDS: `${API_BASE}/enterprise/analytics/real-time/dashboards`,
    NOTIFICATIONS: `${API_BASE}/enterprise/analytics/real-time/notifications`
  }
} as const;

// ============================================================================
// DATA DISCOVERY ENDPOINTS (data_discovery_routes.py)
// ============================================================================

export const DATA_DISCOVERY_ENDPOINTS = {
  // Asset Discovery
  ASSETS: {
    DISCOVER: `${API_BASE}/data-discovery/assets/discover`,
    EXPLORE: `${API_BASE}/data-discovery/assets/explore`,
    BROWSE: `${API_BASE}/data-discovery/assets/browse`,
    RECOMMENDATIONS: `${API_BASE}/data-discovery/assets/recommendations`,
    SIMILAR: `${API_BASE}/data-discovery/assets/similar`,
    RELATED: `${API_BASE}/data-discovery/assets/related`,
    TRENDING: `${API_BASE}/data-discovery/assets/trending`,
    POPULAR: `${API_BASE}/data-discovery/assets/popular`,
    RECENT: `${API_BASE}/data-discovery/assets/recent`,
    BOOKMARKED: `${API_BASE}/data-discovery/assets/bookmarked`
  },

  // Discovery Workflows
  WORKFLOWS: {
    LIST: `${API_BASE}/data-discovery/workflows`,
    CREATE: `${API_BASE}/data-discovery/workflows`,
    GET: (id: string) => `${API_BASE}/data-discovery/workflows/${id}`,
    UPDATE: (id: string) => `${API_BASE}/data-discovery/workflows/${id}`,
    DELETE: (id: string) => `${API_BASE}/data-discovery/workflows/${id}`,
    EXECUTE: (id: string) => `${API_BASE}/data-discovery/workflows/${id}/execute`,
    SCHEDULE: (id: string) => `${API_BASE}/data-discovery/workflows/${id}/schedule`,
    HISTORY: (id: string) => `${API_BASE}/data-discovery/workflows/${id}/history`
  },

  // Discovery Intelligence
  INTELLIGENCE: {
    INSIGHTS: `${API_BASE}/data-discovery/intelligence/insights`,
    PATTERNS: `${API_BASE}/data-discovery/intelligence/patterns`,
    ANOMALIES: `${API_BASE}/data-discovery/intelligence/anomalies`,
    RELATIONSHIPS: `${API_BASE}/data-discovery/intelligence/relationships`,
    CLUSTERING: `${API_BASE}/data-discovery/intelligence/clustering`,
    CLASSIFICATION: `${API_BASE}/data-discovery/intelligence/classification`,
    RECOMMENDATIONS: `${API_BASE}/data-discovery/intelligence/recommendations`,
    AUTOMATION: `${API_BASE}/data-discovery/intelligence/automation`
  }
} as const;

// ============================================================================
// AI & ML ENDPOINTS (ai_routes.py, ml_routes.py)
// ============================================================================

export const AI_ENDPOINTS = {
  // AI Services
  AI: {
    CHAT: `${API_BASE}/ai/chat`,
    QUERY: `${API_BASE}/ai/query`,
    ANALYZE: `${API_BASE}/ai/analyze`,
    SUGGEST: `${API_BASE}/ai/suggest`,
    CLASSIFY: `${API_BASE}/ai/classify`,
    EXTRACT: `${API_BASE}/ai/extract`,
    SUMMARIZE: `${API_BASE}/ai/summarize`,
    TRANSLATE: `${API_BASE}/ai/translate`,
    GENERATE: `${API_BASE}/ai/generate`,
    EXPLAIN: `${API_BASE}/ai/explain`
  },

  // ML Services
  ML: {
    MODELS: `${API_BASE}/ml/models`,
    TRAIN: `${API_BASE}/ml/train`,
    PREDICT: `${API_BASE}/ml/predict`,
    EVALUATE: `${API_BASE}/ml/evaluate`,
    DEPLOY: `${API_BASE}/ml/deploy`,
    MONITOR: `${API_BASE}/ml/monitor`,
    FEATURES: `${API_BASE}/ml/features`,
    PIPELINES: `${API_BASE}/ml/pipelines`,
    EXPERIMENTS: `${API_BASE}/ml/experiments`,
    REGISTRY: `${API_BASE}/ml/registry`
  },

  // Advanced AI
  ADVANCED: {
    NLP: `${API_BASE}/ai/advanced/nlp`,
    COMPUTER_VISION: `${API_BASE}/ai/advanced/cv`,
    DEEP_LEARNING: `${API_BASE}/ai/advanced/dl`,
    REINFORCEMENT_LEARNING: `${API_BASE}/ai/advanced/rl`,
    GENERATIVE_AI: `${API_BASE}/ai/advanced/gen`,
    KNOWLEDGE_GRAPH: `${API_BASE}/ai/advanced/kg`,
    REASONING: `${API_BASE}/ai/advanced/reasoning`,
    PLANNING: `${API_BASE}/ai/advanced/planning`
  }
} as const;

// ============================================================================
// SHARED ENDPOINTS (Shared across multiple groups)
// ============================================================================

export const SHARED_ENDPOINTS = {
  // Classification Services
  CLASSIFICATION: {
    CLASSIFY: `${API_BASE}/classification/classify`,
    BATCH_CLASSIFY: `${API_BASE}/classification/batch`,
    RULES: `${API_BASE}/classification/rules`,
    MODELS: `${API_BASE}/classification/models`,
    TRAIN: `${API_BASE}/classification/train`,
    EVALUATE: `${API_BASE}/classification/evaluate`,
    DEPLOY: `${API_BASE}/classification/deploy`,
    PREDICT: `${API_BASE}/classification/predict`
  },

  // Enterprise Integration
  INTEGRATION: {
    CONNECTORS: `${API_BASE}/integration/connectors`,
    APIS: `${API_BASE}/integration/apis`,
    WEBHOOKS: `${API_BASE}/integration/webhooks`,
    SYNC: `${API_BASE}/integration/sync`,
    MAPPING: `${API_BASE}/integration/mapping`,
    TRANSFORMATION: `${API_BASE}/integration/transformation`,
    MONITORING: `${API_BASE}/integration/monitoring`,
    HEALTH: `${API_BASE}/integration/health`
  },

  // Glossary Management
  GLOSSARY: {
    TERMS: `${API_BASE}/glossary/terms`,
    CATEGORIES: `${API_BASE}/glossary/categories`,
    RELATIONSHIPS: `${API_BASE}/glossary/relationships`,
    ASSOCIATIONS: `${API_BASE}/glossary/associations`,
    APPROVAL: `${API_BASE}/glossary/approval`,
    WORKFLOW: `${API_BASE}/glossary/workflow`,
    IMPORT: `${API_BASE}/glossary/import`,
    EXPORT: `${API_BASE}/glossary/export`,
    VALIDATE: `${API_BASE}/glossary/validate`,
    SEARCH: `${API_BASE}/glossary/search`
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;
  
  const url = new URL(endpoint);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
};

export const buildPaginatedUrl = (
  endpoint: string,
  page: number = 1,
  limit: number = 20,
  params?: Record<string, any>
): string => {
  const paginationParams = { page, limit, ...params };
  return buildUrl(endpoint, paginationParams);
};

export const isValidEndpoint = (endpoint: string): boolean => {
  try {
    new URL(endpoint);
    return true;
  } catch {
    return false;
  }
};

// Export all endpoint groups
export const ALL_ENDPOINTS = {
  ...ENTERPRISE_CATALOG_ENDPOINTS,
  ...DISCOVERY_ENDPOINTS,
  ...SEARCH_ENDPOINTS,
  ...QUALITY_ENDPOINTS,
  ...PROFILING_ENDPOINTS,
  ...LINEAGE_ENDPOINTS,
  ...ANALYTICS_ENDPOINTS,
  ...ENTERPRISE_ANALYTICS_ENDPOINTS,
  ...DATA_DISCOVERY_ENDPOINTS,
  ...AI_ENDPOINTS,
  ...SHARED_ENDPOINTS
} as const;