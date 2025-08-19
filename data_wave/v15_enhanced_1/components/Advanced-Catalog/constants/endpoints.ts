// ============================================================================
// API ENDPOINTS CONSTANTS - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Centralized API endpoint definitions for all Advanced Catalog services
// ============================================================================

// ============================================================================
// BASE ENDPOINTS
// ============================================================================

export const BASE_ENDPOINTS = {
  CATALOG: '/api/v1/catalog',
  DISCOVERY: '/api/v1/discovery',
  ANALYTICS: '/api/v1/analytics',
  LINEAGE: '/api/v1/lineage',
  PROFILING: '/api/v1/profiling',
  QUALITY: '/api/v1/quality',
  SEARCH: '/api/v1/search',
  AI: '/api/v1/ai',
  ML: '/api/v1/ml',
  RECOMMENDATIONS: '/api/v1/recommendations'
} as const;

// ============================================================================
// ENTERPRISE CATALOG ENDPOINTS
// ============================================================================

export const ENTERPRISE_CATALOG_ENDPOINTS = {
  // Asset Management
  CREATE_ASSET: '/assets',
  GET_ASSET: '/assets/{assetId}',
  UPDATE_ASSET: '/assets/{assetId}',
  DELETE_ASSET: '/assets/{assetId}',
  LIST_ASSETS: '/assets',
  SEARCH_ASSETS: '/assets/search',
  
  // Asset Metadata
  GET_METADATA: '/assets/{assetId}/metadata',
  UPDATE_METADATA: '/assets/{assetId}/metadata',
  GET_SCHEMA: '/assets/{assetId}/schema',
  UPDATE_SCHEMA: '/assets/{assetId}/schema',
  
  // Asset Tags and Classifications
  GET_TAGS: '/assets/{assetId}/tags',
  ADD_TAG: '/assets/{assetId}/tags',
  REMOVE_TAG: '/assets/{assetId}/tags/{tagId}',
  GET_CLASSIFICATIONS: '/assets/{assetId}/classifications',
  ADD_CLASSIFICATION: '/assets/{assetId}/classifications',
  
  // Asset Relationships
  GET_RELATIONSHIPS: '/assets/{assetId}/relationships',
  CREATE_RELATIONSHIP: '/assets/{assetId}/relationships',
  DELETE_RELATIONSHIP: '/assets/{assetId}/relationships/{relationshipId}',
  
  // Bulk Operations
  BULK_CREATE: '/assets/bulk',
  BULK_UPDATE: '/assets/bulk',
  BULK_DELETE: '/assets/bulk',
  BULK_IMPORT: '/assets/import',
  BULK_EXPORT: '/assets/export'
} as const;

// ============================================================================
// INTELLIGENT DISCOVERY ENDPOINTS
// ============================================================================

export const INTELLIGENT_DISCOVERY_ENDPOINTS = {
  // Discovery Jobs
  CREATE_JOB: '/jobs',
  GET_JOB: '/jobs/{jobId}',
  UPDATE_JOB: '/jobs/{jobId}',
  DELETE_JOB: '/jobs/{jobId}',
  LIST_JOBS: '/jobs',
  EXECUTE_JOB: '/jobs/{jobId}/execute',
  CANCEL_JOB: '/jobs/{jobId}/cancel',
  
  // Discovery Sources
  CREATE_SOURCE: '/sources',
  GET_SOURCE: '/sources/{sourceId}',
  UPDATE_SOURCE: '/sources/{sourceId}',
  DELETE_SOURCE: '/sources/{sourceId}',
  LIST_SOURCES: '/sources',
  TEST_CONNECTION: '/sources/{sourceId}/test',
  
  // Discovery Configuration
  CREATE_CONFIG: '/configs',
  GET_CONFIG: '/configs/{configId}',
  UPDATE_CONFIG: '/configs/{configId}',
  DELETE_CONFIG: '/configs/{configId}',
  LIST_CONFIGS: '/configs',
  
  // Discovery Analytics
  GET_ANALYTICS: '/analytics',
  GET_TRENDS: '/analytics/trends',
  GET_SUMMARY: '/analytics/summary',
  
  // Incremental Discovery
  START_INCREMENTAL: '/incremental/start',
  GET_INCREMENTAL_STATUS: '/incremental/{jobId}/status',
  GET_INCREMENTAL_RESULTS: '/incremental/{jobId}/results',
  
  // Discovery Search
  SEARCH_JOBS: '/search/jobs',
  SEARCH_SOURCES: '/search/sources',
  SEARCH_RESULTS: '/search/results'
} as const;

// ============================================================================
// SEMANTIC SEARCH ENDPOINTS
// ============================================================================

export const SEMANTIC_SEARCH_ENDPOINTS = {
  // Search Operations
  SEARCH: '/search',
  ADVANCED_SEARCH: '/search/advanced',
  FACETED_SEARCH: '/search/faceted',
  AUTOCOMPLETE: '/search/autocomplete',
  SUGGESTIONS: '/search/suggestions',
  
  // Search Analytics
  GET_SEARCH_ANALYTICS: '/analytics',
  GET_POPULAR_SEARCHES: '/analytics/popular',
  GET_SEARCH_TRENDS: '/analytics/trends',
  
  // Search Configuration
  GET_CONFIG: '/config',
  UPDATE_CONFIG: '/config',
  GET_FILTERS: '/config/filters',
  UPDATE_FILTERS: '/config/filters',
  
  // Indexing
  REINDEX_ALL: '/index/rebuild',
  REINDEX_ASSET: '/index/rebuild/{assetId}',
  GET_INDEX_STATUS: '/index/status',
  
  // Semantic Features
  SEMANTIC_SEARCH: '/semantic',
  VECTOR_SEARCH: '/vector',
  SIMILARITY_SEARCH: '/similarity',
  GET_EMBEDDINGS: '/embeddings/{assetId}'
} as const;

// ============================================================================
// CATALOG QUALITY ENDPOINTS
// ============================================================================

export const CATALOG_QUALITY_ENDPOINTS = {
  // Quality Assessment
  ASSESS_QUALITY: '/assess/{assetId}',
  GET_QUALITY_SCORE: '/score/{assetId}',
  GET_QUALITY_REPORT: '/report/{assetId}',
  LIST_QUALITY_ISSUES: '/issues',
  
  // Quality Rules
  CREATE_RULE: '/rules',
  GET_RULE: '/rules/{ruleId}',
  UPDATE_RULE: '/rules/{ruleId}',
  DELETE_RULE: '/rules/{ruleId}',
  LIST_RULES: '/rules',
  EXECUTE_RULE: '/rules/{ruleId}/execute',
  
  // Quality Monitoring
  GET_QUALITY_TRENDS: '/monitoring/trends',
  GET_QUALITY_ALERTS: '/monitoring/alerts',
  CREATE_ALERT: '/monitoring/alerts',
  UPDATE_ALERT: '/monitoring/alerts/{alertId}',
  
  // Quality Remediation
  CREATE_REMEDIATION: '/remediation',
  GET_REMEDIATION: '/remediation/{remediationId}',
  EXECUTE_REMEDIATION: '/remediation/{remediationId}/execute',
  
  // Quality Metrics
  GET_METRICS: '/metrics',
  GET_COMPLETENESS: '/metrics/completeness',
  GET_UNIQUENESS: '/metrics/uniqueness',
  GET_VALIDITY: '/metrics/validity',
  GET_ACCURACY: '/metrics/accuracy',
  GET_CONSISTENCY: '/metrics/consistency'
} as const;

// ============================================================================
// DATA PROFILING ENDPOINTS
// ============================================================================

export const DATA_PROFILING_ENDPOINTS = {
  // Profiling Jobs
  CREATE_JOB: '/jobs',
  GET_JOB: '/jobs/{jobId}',
  UPDATE_JOB: '/jobs/{jobId}',
  DELETE_JOB: '/jobs/{jobId}',
  LIST_JOBS: '/jobs',
  EXECUTE_JOB: '/jobs/{jobId}/execute',
  CANCEL_JOB: '/jobs/{jobId}/cancel',
  
  // Profiling Results
  GET_RESULTS: '/results/{assetId}',
  GET_LATEST_RESULT: '/results/{assetId}/latest',
  GET_RESULT_BY_ID: '/results/detail/{resultId}',
  DELETE_RESULT: '/results/{resultId}',
  
  // Statistical Analysis
  GET_STATISTICS: '/statistics/{assetId}',
  GET_DISTRIBUTION: '/distribution/{assetId}/{columnName}',
  GET_QUALITY_PROFILE: '/quality-profile/{assetId}',
  
  // Custom Profiling
  PROFILE_COLUMNS: '/profile/columns',
  CUSTOM_PROFILING: '/profile/custom',
  VALIDATE_RULES: '/profile/validate-rules',
  
  // Profiling Analytics
  GET_ANALYTICS: '/analytics',
  GET_TRENDS: '/analytics/trends/{assetId}',
  COMPARE_RESULTS: '/analytics/compare',
  
  // Configuration
  GET_DEFAULT_CONFIG: '/config/default',
  UPDATE_DEFAULT_CONFIG: '/config/default',
  GET_TEMPLATES: '/config/templates',
  
  // Export & Reporting
  EXPORT_RESULTS: '/export/{resultId}',
  GENERATE_REPORT: '/report/{assetId}'
} as const;

// ============================================================================
// ADVANCED LINEAGE ENDPOINTS
// ============================================================================

export const ADVANCED_LINEAGE_ENDPOINTS = {
  // Lineage Management
  CREATE_LINEAGE: '/lineage',
  GET_LINEAGE: '/lineage/{lineageId}',
  UPDATE_LINEAGE: '/lineage/{lineageId}',
  DELETE_LINEAGE: '/lineage/{lineageId}',
  BULK_UPDATE: '/lineage/bulk',
  
  // Lineage Tracking
  TRACK_LINEAGE: '/track',
  GET_UPSTREAM: '/upstream/{assetId}',
  GET_DOWNSTREAM: '/downstream/{assetId}',
  GET_COLUMN_LINEAGE: '/column/{assetId}/{columnName}',
  DISCOVER_LINEAGE: '/discover/{assetId}',
  
  // Lineage Visualization
  GENERATE_VISUALIZATION: '/visualization',
  GET_GRAPH: '/graph/{assetId}',
  UPDATE_VIZ_CONFIG: '/visualization/config/{assetId}',
  
  // Impact Analysis
  IMPACT_ANALYSIS: '/impact',
  CHANGE_IMPACT: '/impact/change/{assetId}',
  DEPENDENCY_ANALYSIS: '/dependency/{assetId}',
  COVERAGE_ANALYSIS: '/coverage',
  
  // Lineage Search
  SEARCH_LINEAGE: '/search',
  EXECUTE_QUERY: '/query',
  GET_PATH: '/path',
  
  // Lineage Metrics
  GET_METRICS: '/metrics',
  QUALITY_METRICS: '/metrics/quality',
  GET_STATISTICS: '/metrics/statistics',
  
  // Lineage Validation
  VALIDATE_CONSISTENCY: '/validate/consistency',
  VALIDATE_COMPLETENESS: '/validate/completeness/{assetId}',
  GOVERNANCE_POLICIES: '/governance/policies',
  
  // Export & Reporting
  EXPORT_LINEAGE: '/export/{assetId}',
  GENERATE_REPORT: '/report/{assetId}',
  SCHEDULE_TRACKING: '/schedule/{assetId}'
} as const;

// ============================================================================
// CATALOG ANALYTICS ENDPOINTS
// ============================================================================

export const CATALOG_ANALYTICS_ENDPOINTS = {
  // Core Analytics
  OVERVIEW: '/overview',
  METRICS: '/metrics',
  ASSET_METRICS_BY_TYPE: '/metrics/assets/{assetType}',
  METRICS_SUMMARY: '/metrics/summary',
  
  // Usage Analytics
  USAGE_ANALYTICS: '/usage',
  ASSET_USAGE: '/usage/assets/{assetId}',
  USER_USAGE: '/usage/users',
  DEPARTMENT_USAGE: '/usage/departments/{department}',
  ACCESS_PATTERNS: '/usage/patterns',
  
  // Trend Analysis
  TREND_ANALYSIS: '/trends',
  GROWTH_TRENDS: '/trends/growth',
  ADOPTION_TRENDS: '/trends/adoption',
  SEASONAL_PATTERNS: '/trends/seasonal',
  
  // Popularity Analysis
  POPULARITY_ANALYSIS: '/popularity',
  TOP_ASSETS: '/popularity/top',
  TRENDING_ASSETS: '/popularity/trending',
  UNDERUTILIZED_ASSETS: '/popularity/underutilized',
  
  // Impact Analysis
  IMPACT_ANALYSIS: '/impact',
  BUSINESS_IMPACT: '/impact/business/{assetId}',
  RISK_ANALYSIS: '/impact/risk',
  
  // Predictive Analytics
  PREDICTIVE_INSIGHTS: '/predictive',
  CAPACITY_FORECASTING: '/predictive/capacity',
  ANOMALY_DETECTION: '/predictive/anomalies',
  
  // Custom Analytics
  CUSTOM_ANALYTICS: '/custom',
  CREATE_DASHBOARD: '/dashboards',
  SAVED_QUERIES: '/queries/saved',
  
  // Comparison & Benchmarking
  COMPARE_METRICS: '/compare',
  BENCHMARK_COMPARISON: '/benchmark',
  
  // Reporting
  GENERATE_REPORT: '/reports',
  SCHEDULE_REPORT: '/reports/schedule',
  EXPORT_DATA: '/export',
  
  // Real-time Analytics
  REALTIME_METRICS: '/realtime',
  LIVE_ACTIVITY: '/realtime/activity'
} as const;

// ============================================================================
// CATALOG RECOMMENDATION ENDPOINTS
// ============================================================================

export const CATALOG_RECOMMENDATION_ENDPOINTS = {
  // Personalized Recommendations
  PERSONALIZED: '/personalized/{userId}',
  CONTEXTUAL: '/contextual',
  UPDATE_PROFILE: '/profile/update',
  GET_PROFILE: '/profile/{userId}',
  
  // Similarity & Related Assets
  SIMILAR_ASSETS: '/similar',
  ASSET_RELATIONSHIPS: '/relationships/{assetId}',
  FREQUENTLY_TOGETHER: '/frequent/{assetId}',
  COMPLEMENTARY_ASSETS: '/complementary/{assetId}',
  
  // Trending & Popular
  TRENDING: '/trending',
  POPULAR_BY_DEPT: '/popular/department/{department}',
  EMERGING: '/emerging',
  SEASONAL: '/seasonal/{userId}',
  
  // Collaborative Recommendations
  COLLABORATIVE: '/collaborative/{userId}',
  TEAM_RECOMMENDATIONS: '/team/{teamId}',
  EXPERT_RECOMMENDATIONS: '/experts/{assetId}',
  PEER_RECOMMENDATIONS: '/peers/{userId}',
  
  // Content-Based Recommendations
  CONTENT_BASED: '/content/{assetId}',
  TAG_BASED: '/tags',
  SCHEMA_BASED: '/schema/{assetId}',
  
  // Usage Pattern Analysis
  USAGE_PATTERNS: '/patterns/{userId}',
  BEHAVIOR_PATTERNS: '/behavior/{userId}',
  WORKFLOW_BASED: '/workflow/{userId}',
  
  // Feedback & Model Training
  SUBMIT_FEEDBACK: '/feedback',
  FEEDBACK_ANALYTICS: '/feedback/analytics',
  TRAIN_MODEL: '/models/train',
  EVALUATE_MODEL: '/models/{modelId}/evaluate',
  
  // Real-time Recommendations
  REALTIME: '/realtime/{userId}',
  UPDATE_CONTEXT: '/context/{userId}',
  
  // Configuration & Insights
  ENGINE_CONFIG: '/config',
  UPDATE_ENGINE_CONFIG: '/config',
  INSIGHTS: '/insights',
  PERFORMANCE_METRICS: '/performance',
  AB_TESTING: '/ab-test/{testId}',
  RESET_USER: '/reset/{userId}'
} as const;

// ============================================================================
// AI SERVICE ENDPOINTS
// ============================================================================

export const AI_SERVICE_ENDPOINTS = {
  // AI Analysis & Insights
  ANALYZE_ASSET: '/analyze',
  GENERATE_INSIGHTS: '/insights',
  GET_RECOMMENDATIONS: '/recommendations',
  DETECT_ANOMALIES: '/anomalies',
  
  // Semantic Analysis
  SEMANTIC_ANALYSIS: '/semantic',
  GENERATE_EMBEDDINGS: '/embeddings',
  SEMANTIC_SIMILARITY: '/similarity',
  EXTRACT_ENTITIES: '/entities',
  
  // Natural Language Processing
  PROCESS_NL_QUERY: '/nlp/query',
  NLP_PROCESSING: '/nlp/process',
  SENTIMENT_ANALYSIS: '/nlp/sentiment',
  GENERATE_SUMMARY: '/nlp/summary',
  
  // Predictive Analytics
  PREDICTIVE_ANALYSIS: '/predictive',
  FORECAST_TRENDS: '/predictive/trends',
  PREDICT_USAGE: '/predictive/usage/{assetId}',
  PREDICT_QUALITY_ISSUES: '/predictive/quality/{assetId}',
  
  // Machine Learning Models
  TRAIN_MODEL: '/models/train',
  GET_MODEL: '/models/{modelId}',
  DEPLOY_MODEL: '/models/deploy',
  INFERENCE: '/models/inference',
  EVALUATE_MODEL: '/models/{modelId}/evaluate',
  
  // AutoML
  AUTOML_TRAIN: '/automl/train',
  AUTOML_RESULTS: '/automl/{experimentId}',
  FEATURE_IMPORTANCE: '/models/{modelId}/features',
  
  // Behavioral Analysis
  ANALYZE_BEHAVIOR: '/behavior/{userId}',
  BEHAVIORAL_ANOMALIES: '/behavior/{userId}/anomalies',
  CLUSTER_USERS: '/behavior/clusters',
  
  // Threat Detection
  DETECT_THREATS: '/security/threats',
  ANALYZE_ACCESS_PATTERNS: '/security/access-patterns',
  THREAT_INTELLIGENCE: '/security/intelligence',
  
  // Contextual Intelligence
  CONTEXTUAL_INTELLIGENCE: '/intelligence/contextual',
  CONTEXT_PATTERNS: '/intelligence/patterns',
  
  // Reporting & Performance
  GENERATE_REPORT: '/reports',
  PERFORMANCE_METRICS: '/performance',
  MODEL_DRIFT: '/models/{modelId}/drift',
  
  // Experimentation
  CREATE_AB_TEST: '/experiments/ab-test',
  EXPERIMENT_RESULTS: '/experiments/{experimentId}',
  
  // Configuration
  GET_CONFIG: '/config',
  UPDATE_CONFIG: '/config',
  HEALTH_CHECK: '/health'
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build URL with path parameters
 */
export function buildUrl(baseUrl: string, endpoint: string, params?: Record<string, string>): string {
  let url = `${baseUrl}${endpoint}`;
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });
  }
  
  return url;
}

/**
 * Build URL with query parameters
 */
export function buildUrlWithQuery(
  baseUrl: string,
  endpoint: string,
  pathParams?: Record<string, string>,
  queryParams?: Record<string, any>
): string {
  let url = buildUrl(baseUrl, endpoint, pathParams);
  
  if (queryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
}

/**
 * Build URL with pagination parameters
 */
export function buildPaginatedUrl(
  baseUrl: string,
  endpoint: string,
  pagination: { page?: number; size?: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }
): string {
  return buildUrlWithQuery(baseUrl, endpoint, undefined, pagination);
}

// ============================================================================
// EXPORT ALL ENDPOINTS
// ============================================================================

export const ALL_ENDPOINTS = {
  BASE: BASE_ENDPOINTS,
  ENTERPRISE_CATALOG: ENTERPRISE_CATALOG_ENDPOINTS,
  INTELLIGENT_DISCOVERY: INTELLIGENT_DISCOVERY_ENDPOINTS,
  SEMANTIC_SEARCH: SEMANTIC_SEARCH_ENDPOINTS,
  CATALOG_QUALITY: CATALOG_QUALITY_ENDPOINTS,
  DATA_PROFILING: DATA_PROFILING_ENDPOINTS,
  ADVANCED_LINEAGE: ADVANCED_LINEAGE_ENDPOINTS,
  CATALOG_ANALYTICS: CATALOG_ANALYTICS_ENDPOINTS,
  CATALOG_RECOMMENDATION: CATALOG_RECOMMENDATION_ENDPOINTS,
  AI_SERVICE: AI_SERVICE_ENDPOINTS
} as const;

export default ALL_ENDPOINTS;