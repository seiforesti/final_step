// ============================================================================
// ADVANCED CATALOG CONSTANTS - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// General constants, enums, and configuration values for the catalog system
// ============================================================================

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export const CATALOG_CONFIG = {
  // Version Information
  VERSION: '2.0.0',
  BUILD: '2024.12.28',
  API_VERSION: 'v1',
  
  // Performance Settings
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
  DEFAULT_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TTL: 300000, // 5 minutes
  
  // Search Configuration
  MAX_SEARCH_RESULTS: 1000,
  DEFAULT_SEARCH_LIMIT: 50,
  AUTOCOMPLETE_DELAY: 300,
  SUGGESTION_COUNT: 5,
  FACET_COUNT: 10,
  
  // Asset Limits
  MAX_ASSET_NAME_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 2048,
  MAX_TAG_COUNT: 20,
  MAX_COLUMN_COUNT: 1000,
  MAX_FILE_SIZE: 104857600, // 100MB
  
  // Quality Thresholds
  MIN_QUALITY_SCORE: 0.0,
  MAX_QUALITY_SCORE: 1.0,
  DEFAULT_QUALITY_THRESHOLD: 0.8,
  HIGH_QUALITY_THRESHOLD: 0.9,
  LOW_QUALITY_THRESHOLD: 0.6,
  
  // Lineage Configuration
  MAX_LINEAGE_DEPTH: 10,
  DEFAULT_LINEAGE_DEPTH: 3,
  MAX_LINEAGE_NODES: 500,
  LINEAGE_BATCH_SIZE: 50,
  
  // Analytics Configuration
  DEFAULT_ANALYTICS_PERIOD: 30, // days
  MAX_ANALYTICS_PERIOD: 365, // days
  MIN_ANALYTICS_PERIOD: 1, // day
  ANALYTICS_REFRESH_INTERVAL: 3600000, // 1 hour
  
  // UI Configuration
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOOLTIP_DELAY: 1000,
  NOTIFICATION_DURATION: 5000,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  
  // Security Settings
  SESSION_TIMEOUT: 7200000, // 2 hours
  MAX_LOGIN_ATTEMPTS: 3,
  PASSWORD_MIN_LENGTH: 8,
  TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutes
  
  // File Upload
  ALLOWED_FILE_TYPES: [
    'application/json',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/parquet',
    'application/avro'
  ],
  
  // Export Formats
  EXPORT_FORMATS: ['JSON', 'CSV', 'EXCEL', 'PDF', 'XML'] as const,
  
  // Date Formats
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
  DISPLAY_DATETIME_FORMAT: 'MMM DD, YYYY HH:mm',
  
  // Localization
  DEFAULT_LOCALE: 'en-US',
  SUPPORTED_LOCALES: ['en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'ja-JP', 'zh-CN'] as const,
  DEFAULT_TIMEZONE: 'UTC',
  
  // Feature Flags
  FEATURES: {
    AI_ENABLED: true,
    ML_ENABLED: true,
    REAL_TIME_UPDATES: true,
    ADVANCED_ANALYTICS: true,
    COLLABORATION: true,
    NOTIFICATIONS: true,
    DARK_MODE: true,
    ACCESSIBILITY: true,
    MOBILE_SUPPORT: true,
    OFFLINE_MODE: false
  }
} as const;

// ============================================================================
// ASSET CONSTANTS
// ============================================================================

export const ASSET_CONSTANTS = {
  // Asset Status Options
  STATUS_OPTIONS: [
    { value: 'ACTIVE', label: 'Active', color: 'green' },
    { value: 'INACTIVE', label: 'Inactive', color: 'gray' },
    { value: 'DEPRECATED', label: 'Deprecated', color: 'orange' },
    { value: 'DRAFT', label: 'Draft', color: 'blue' },
    { value: 'ARCHIVED', label: 'Archived', color: 'red' },
    { value: 'UNDER_REVIEW', label: 'Under Review', color: 'yellow' }
  ],

  // Data Asset Types
  ASSET_TYPES: [
    { value: 'TABLE', label: 'Table', icon: 'table', description: 'Database table' },
    { value: 'VIEW', label: 'View', icon: 'eye', description: 'Database view' },
    { value: 'COLUMN', label: 'Column', icon: 'columns', description: 'Table column' },
    { value: 'DATABASE', label: 'Database', icon: 'database', description: 'Database instance' },
    { value: 'SCHEMA', label: 'Schema', icon: 'folder', description: 'Database schema' },
    { value: 'FILE', label: 'File', icon: 'file', description: 'Data file' },
    { value: 'API', label: 'API', icon: 'globe', description: 'API endpoint' },
    { value: 'STREAM', label: 'Stream', icon: 'zap', description: 'Data stream' },
    { value: 'DASHBOARD', label: 'Dashboard', icon: 'bar-chart', description: 'Analytics dashboard' },
    { value: 'REPORT', label: 'Report', icon: 'file-text', description: 'Business report' },
    { value: 'MODEL', label: 'Model', icon: 'cpu', description: 'ML/AI model' }
  ],

  // Sensitivity Levels
  SENSITIVITY_LEVELS: [
    { value: 'PUBLIC', label: 'Public', color: 'green', description: 'Publicly available data' },
    { value: 'INTERNAL', label: 'Internal', color: 'blue', description: 'Internal use only' },
    { value: 'CONFIDENTIAL', label: 'Confidential', color: 'orange', description: 'Confidential data' },
    { value: 'RESTRICTED', label: 'Restricted', color: 'red', description: 'Highly restricted data' },
    { value: 'TOP_SECRET', label: 'Top Secret', color: 'purple', description: 'Top secret classification' }
  ],

  // PII Types
  PII_TYPES: [
    { value: 'NONE', label: 'None', color: 'gray' },
    { value: 'NAME', label: 'Name', color: 'blue' },
    { value: 'EMAIL', label: 'Email', color: 'green' },
    { value: 'PHONE', label: 'Phone', color: 'orange' },
    { value: 'SSN', label: 'SSN', color: 'red' },
    { value: 'CREDIT_CARD', label: 'Credit Card', color: 'purple' },
    { value: 'ADDRESS', label: 'Address', color: 'yellow' }
  ],

  // Schema Formats
  SCHEMA_FORMATS: [
    { value: 'PARQUET', label: 'Parquet', description: 'Apache Parquet format' },
    { value: 'AVRO', label: 'Avro', description: 'Apache Avro format' },
    { value: 'JSON', label: 'JSON', description: 'JavaScript Object Notation' },
    { value: 'CSV', label: 'CSV', description: 'Comma-separated values' },
    { value: 'ORC', label: 'ORC', description: 'Optimized Row Columnar' },
    { value: 'DELTA', label: 'Delta', description: 'Delta Lake format' },
    { value: 'ICEBERG', label: 'Iceberg', description: 'Apache Iceberg format' }
  ],

  // Data Types
  DATA_TYPES: [
    { value: 'STRING', label: 'String', category: 'Text' },
    { value: 'INTEGER', label: 'Integer', category: 'Numeric' },
    { value: 'LONG', label: 'Long', category: 'Numeric' },
    { value: 'FLOAT', label: 'Float', category: 'Numeric' },
    { value: 'DOUBLE', label: 'Double', category: 'Numeric' },
    { value: 'BOOLEAN', label: 'Boolean', category: 'Logical' },
    { value: 'DATE', label: 'Date', category: 'DateTime' },
    { value: 'DATETIME', label: 'DateTime', category: 'DateTime' },
    { value: 'TIMESTAMP', label: 'Timestamp', category: 'DateTime' },
    { value: 'DECIMAL', label: 'Decimal', category: 'Numeric' },
    { value: 'ARRAY', label: 'Array', category: 'Complex' },
    { value: 'STRUCT', label: 'Struct', category: 'Complex' },
    { value: 'MAP', label: 'Map', category: 'Complex' },
    { value: 'BINARY', label: 'Binary', category: 'Binary' }
  ]
} as const;

// ============================================================================
// QUALITY CONSTANTS
// ============================================================================

export const QUALITY_CONSTANTS = {
  // Quality Dimensions
  DIMENSIONS: [
    { id: 'completeness', name: 'Completeness', description: 'Data completeness and coverage', weight: 0.2 },
    { id: 'accuracy', name: 'Accuracy', description: 'Data accuracy and correctness', weight: 0.25 },
    { id: 'consistency', name: 'Consistency', description: 'Data consistency across sources', weight: 0.2 },
    { id: 'validity', name: 'Validity', description: 'Data format and business rule validity', weight: 0.15 },
    { id: 'uniqueness', name: 'Uniqueness', description: 'Data uniqueness and duplication', weight: 0.1 },
    { id: 'timeliness', name: 'Timeliness', description: 'Data freshness and currency', weight: 0.1 }
  ],

  // Quality Scores
  SCORE_RANGES: [
    { min: 0.9, max: 1.0, grade: 'EXCELLENT', color: 'green', label: 'Excellent' },
    { min: 0.8, max: 0.89, grade: 'GOOD', color: 'lime', label: 'Good' },
    { min: 0.7, max: 0.79, grade: 'FAIR', color: 'yellow', label: 'Fair' },
    { min: 0.6, max: 0.69, grade: 'POOR', color: 'orange', label: 'Poor' },
    { min: 0.0, max: 0.59, grade: 'CRITICAL', color: 'red', label: 'Critical' }
  ],

  // Quality Rule Types
  RULE_TYPES: [
    { value: 'COMPLETENESS', label: 'Completeness', category: 'Basic' },
    { value: 'ACCURACY', label: 'Accuracy', category: 'Basic' },
    { value: 'CONSISTENCY', label: 'Consistency', category: 'Basic' },
    { value: 'VALIDITY', label: 'Validity', category: 'Basic' },
    { value: 'UNIQUENESS', label: 'Uniqueness', category: 'Basic' },
    { value: 'TIMELINESS', label: 'Timeliness', category: 'Basic' },
    { value: 'CUSTOM', label: 'Custom', category: 'Advanced' }
  ],

  // Issue Severities
  SEVERITIES: [
    { value: 'LOW', label: 'Low', color: 'blue', priority: 1 },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow', priority: 2 },
    { value: 'HIGH', label: 'High', color: 'orange', priority: 3 },
    { value: 'CRITICAL', label: 'Critical', color: 'red', priority: 4 },
    { value: 'BLOCKING', label: 'Blocking', color: 'purple', priority: 5 }
  ],

  // Monitoring Frequencies
  MONITORING_FREQUENCIES: [
    { value: 'REAL_TIME', label: 'Real-time', interval: 0 },
    { value: 'EVERY_MINUTE', label: 'Every minute', interval: 60 },
    { value: 'EVERY_5_MINUTES', label: 'Every 5 minutes', interval: 300 },
    { value: 'EVERY_15_MINUTES', label: 'Every 15 minutes', interval: 900 },
    { value: 'EVERY_HOUR', label: 'Every hour', interval: 3600 },
    { value: 'DAILY', label: 'Daily', interval: 86400 },
    { value: 'WEEKLY', label: 'Weekly', interval: 604800 },
    { value: 'MONTHLY', label: 'Monthly', interval: 2592000 }
  ]
} as const;

// ============================================================================
// LINEAGE CONSTANTS
// ============================================================================

export const LINEAGE_CONSTANTS = {
  // Lineage Types
  TYPES: [
    { value: 'DIRECT', label: 'Direct', description: 'Direct data flow relationship' },
    { value: 'INDIRECT', label: 'Indirect', description: 'Indirect data flow through intermediary' },
    { value: 'DERIVED', label: 'Derived', description: 'Data derived through calculation' },
    { value: 'AGGREGATED', label: 'Aggregated', description: 'Data aggregated from sources' },
    { value: 'TRANSFORMED', label: 'Transformed', description: 'Data transformed via ETL process' }
  ],

  // Lineage Directions
  DIRECTIONS: [
    { value: 'UPSTREAM', label: 'Upstream', icon: 'arrow-left', description: 'Data sources' },
    { value: 'DOWNSTREAM', label: 'Downstream', icon: 'arrow-right', description: 'Data consumers' },
    { value: 'BIDIRECTIONAL', label: 'Bidirectional', icon: 'arrow-left-right', description: 'Both directions' }
  ],

  // Transformation Types
  TRANSFORMATION_TYPES: [
    { value: 'COPY', label: 'Copy', icon: 'copy', description: 'Direct copy operation' },
    { value: 'FILTER', label: 'Filter', icon: 'filter', description: 'Data filtering' },
    { value: 'AGGREGATE', label: 'Aggregate', icon: 'layers', description: 'Data aggregation' },
    { value: 'JOIN', label: 'Join', icon: 'git-merge', description: 'Data join operation' },
    { value: 'UNION', label: 'Union', icon: 'git-branch', description: 'Data union operation' },
    { value: 'TRANSFORM', label: 'Transform', icon: 'shuffle', description: 'Data transformation' },
    { value: 'CALCULATE', label: 'Calculate', icon: 'calculator', description: 'Calculated field' },
    { value: 'CLEANSE', label: 'Cleanse', icon: 'soap', description: 'Data cleansing' }
  ],

  // Visualization Layouts
  VISUALIZATION_LAYOUTS: [
    { value: 'HIERARCHICAL', label: 'Hierarchical', description: 'Tree-like hierarchy' },
    { value: 'FORCE_DIRECTED', label: 'Force Directed', description: 'Physics-based layout' },
    { value: 'CIRCULAR', label: 'Circular', description: 'Circular arrangement' },
    { value: 'DAGRE', label: 'Dagre', description: 'Directed acyclic graph' },
    { value: 'GRID', label: 'Grid', description: 'Grid-based layout' },
    { value: 'CUSTOM', label: 'Custom', description: 'Custom positioning' }
  ],

  // Impact Levels
  IMPACT_LEVELS: [
    { value: 'MINIMAL', label: 'Minimal', color: 'green', score: 1 },
    { value: 'LOW', label: 'Low', color: 'blue', score: 2 },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow', score: 3 },
    { value: 'HIGH', label: 'High', color: 'orange', score: 4 },
    { value: 'CRITICAL', label: 'Critical', color: 'red', score: 5 }
  ]
} as const;

// ============================================================================
// SEARCH CONSTANTS
// ============================================================================

export const SEARCH_CONSTANTS = {
  // Search Types
  SEARCH_TYPES: [
    { value: 'KEYWORD', label: 'Keyword', description: 'Traditional keyword search' },
    { value: 'SEMANTIC', label: 'Semantic', description: 'AI-powered semantic search' },
    { value: 'NATURAL_LANGUAGE', label: 'Natural Language', description: 'Natural language queries' },
    { value: 'FACETED', label: 'Faceted', description: 'Filtered faceted search' },
    { value: 'FUZZY', label: 'Fuzzy', description: 'Fuzzy matching search' },
    { value: 'BOOLEAN', label: 'Boolean', description: 'Boolean logic search' },
    { value: 'PHRASE', label: 'Phrase', description: 'Exact phrase matching' },
    { value: 'WILDCARD', label: 'Wildcard', description: 'Wildcard pattern search' }
  ],

  // Search Scopes
  SEARCH_SCOPES: [
    { value: 'ALL', label: 'All', description: 'Search everything' },
    { value: 'ASSETS', label: 'Assets', description: 'Data assets only' },
    { value: 'GLOSSARY', label: 'Glossary', description: 'Business glossary terms' },
    { value: 'LINEAGE', label: 'Lineage', description: 'Data lineage information' },
    { value: 'QUALITY', label: 'Quality', description: 'Quality information' },
    { value: 'DOCUMENTATION', label: 'Documentation', description: 'Documentation content' }
  ],

  // Sort Options
  SORT_OPTIONS: [
    { value: 'RELEVANCE', label: 'Relevance', field: '_score' },
    { value: 'POPULARITY', label: 'Popularity', field: 'popularityScore' },
    { value: 'RECENCY', label: 'Most Recent', field: 'updatedAt' },
    { value: 'ALPHABETICAL', label: 'Alphabetical', field: 'name' },
    { value: 'QUALITY', label: 'Quality Score', field: 'qualityScore' },
    { value: 'USAGE', label: 'Usage Count', field: 'usageCount' }
  ],

  // Filter Operators
  FILTER_OPERATORS: [
    { value: 'EQUALS', label: 'Equals', symbol: '=' },
    { value: 'NOT_EQUALS', label: 'Not Equals', symbol: '!=' },
    { value: 'CONTAINS', label: 'Contains', symbol: '~' },
    { value: 'NOT_CONTAINS', label: 'Not Contains', symbol: '!~' },
    { value: 'STARTS_WITH', label: 'Starts With', symbol: '^' },
    { value: 'ENDS_WITH', label: 'Ends With', symbol: '$' },
    { value: 'GREATER_THAN', label: 'Greater Than', symbol: '>' },
    { value: 'LESS_THAN', label: 'Less Than', symbol: '<' },
    { value: 'BETWEEN', label: 'Between', symbol: '<>' },
    { value: 'IN', label: 'In', symbol: 'in' },
    { value: 'NOT_IN', label: 'Not In', symbol: 'not in' }
  ]
} as const;

// ============================================================================
// ANALYTICS CONSTANTS
// ============================================================================

export const ANALYTICS_CONSTANTS = {
  // Time Periods
  TIME_PERIODS: [
    { value: 'HOUR', label: 'Last Hour', days: 0, hours: 1 },
    { value: 'DAY', label: 'Last 24 Hours', days: 1 },
    { value: 'WEEK', label: 'Last Week', days: 7 },
    { value: 'MONTH', label: 'Last Month', days: 30 },
    { value: 'QUARTER', label: 'Last Quarter', days: 90 },
    { value: 'YEAR', label: 'Last Year', days: 365 },
    { value: 'CUSTOM', label: 'Custom Range', days: 0 }
  ],

  // Metric Categories
  METRIC_CATEGORIES: [
    { value: 'USAGE', label: 'Usage', icon: 'activity', description: 'Usage analytics' },
    { value: 'PERFORMANCE', label: 'Performance', icon: 'zap', description: 'Performance metrics' },
    { value: 'QUALITY', label: 'Quality', icon: 'shield', description: 'Data quality metrics' },
    { value: 'BUSINESS', label: 'Business', icon: 'trending-up', description: 'Business value metrics' },
    { value: 'TECHNICAL', label: 'Technical', icon: 'cpu', description: 'Technical metrics' },
    { value: 'COMPLIANCE', label: 'Compliance', icon: 'check-circle', description: 'Compliance metrics' }
  ],

  // Chart Types
  CHART_TYPES: [
    { value: 'LINE', label: 'Line Chart', icon: 'trending-up', description: 'Time series data' },
    { value: 'BAR', label: 'Bar Chart', icon: 'bar-chart', description: 'Categorical comparison' },
    { value: 'PIE', label: 'Pie Chart', icon: 'pie-chart', description: 'Proportional data' },
    { value: 'AREA', label: 'Area Chart', icon: 'activity', description: 'Cumulative data' },
    { value: 'SCATTER', label: 'Scatter Plot', icon: 'circle', description: 'Correlation analysis' },
    { value: 'HEATMAP', label: 'Heatmap', icon: 'grid', description: 'Matrix visualization' },
    { value: 'GAUGE', label: 'Gauge', icon: 'gauge', description: 'Single metric' },
    { value: 'TABLE', label: 'Table', icon: 'table', description: 'Tabular data' }
  ],

  // Aggregation Types
  AGGREGATION_TYPES: [
    { value: 'SUM', label: 'Sum', description: 'Total sum' },
    { value: 'AVERAGE', label: 'Average', description: 'Mean value' },
    { value: 'COUNT', label: 'Count', description: 'Count of items' },
    { value: 'MIN', label: 'Minimum', description: 'Minimum value' },
    { value: 'MAX', label: 'Maximum', description: 'Maximum value' },
    { value: 'MEDIAN', label: 'Median', description: 'Middle value' },
    { value: 'PERCENTILE', label: 'Percentile', description: 'Percentile value' },
    { value: 'DISTINCT', label: 'Distinct', description: 'Unique count' }
  ]
} as const;

// ============================================================================
// DISCOVERY CONSTANTS
// ============================================================================

export const DISCOVERY_CONSTANTS = {
  // Discovery Sources
  SOURCE_TYPES: [
    { value: 'DATABASE', label: 'Database', icon: 'database', description: 'Database systems' },
    { value: 'FILE_SYSTEM', label: 'File System', icon: 'folder', description: 'File system sources' },
    { value: 'CLOUD_STORAGE', label: 'Cloud Storage', icon: 'cloud', description: 'Cloud storage services' },
    { value: 'API', label: 'API', icon: 'globe', description: 'REST/GraphQL APIs' },
    { value: 'STREAMING', label: 'Streaming', icon: 'zap', description: 'Streaming data sources' },
    { value: 'DATA_WAREHOUSE', label: 'Data Warehouse', icon: 'layers', description: 'Data warehouse systems' },
    { value: 'DATA_LAKE', label: 'Data Lake', icon: 'database', description: 'Data lake storage' },
    { value: 'NOSQL', label: 'NoSQL', icon: 'hard-drive', description: 'NoSQL databases' }
  ],

  // Discovery Phases
  DISCOVERY_PHASES: [
    { value: 'INITIALIZATION', label: 'Initialization', description: 'Setting up discovery job' },
    { value: 'SCHEMA_DISCOVERY', label: 'Schema Discovery', description: 'Discovering data schemas' },
    { value: 'DATA_PROFILING', label: 'Data Profiling', description: 'Profiling data content' },
    { value: 'CLASSIFICATION', label: 'Classification', description: 'Classifying data types' },
    { value: 'LINEAGE_DISCOVERY', label: 'Lineage Discovery', description: 'Discovering data lineage' },
    { value: 'QUALITY_ASSESSMENT', label: 'Quality Assessment', description: 'Assessing data quality' },
    { value: 'METADATA_ENRICHMENT', label: 'Metadata Enrichment', description: 'Enriching metadata' },
    { value: 'FINALIZATION', label: 'Finalization', description: 'Finalizing discovery results' }
  ],

  // Discovery Priorities
  PRIORITIES: [
    { value: 'LOW', label: 'Low', color: 'blue', weight: 1 },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow', weight: 2 },
    { value: 'HIGH', label: 'High', color: 'orange', weight: 3 },
    { value: 'URGENT', label: 'Urgent', color: 'red', weight: 4 }
  ],

  // Discovery Methods
  DISCOVERY_METHODS: [
    { value: 'SCHEMA_ANALYSIS', label: 'Schema Analysis', description: 'Analyze database schemas' },
    { value: 'DATA_SAMPLING', label: 'Data Sampling', description: 'Sample data content' },
    { value: 'PATTERN_MATCHING', label: 'Pattern Matching', description: 'Match data patterns' },
    { value: 'ML_CLASSIFICATION', label: 'ML Classification', description: 'Machine learning classification' },
    { value: 'RULE_BASED', label: 'Rule Based', description: 'Rule-based discovery' },
    { value: 'METADATA_INSPECTION', label: 'Metadata Inspection', description: 'Inspect existing metadata' },
    { value: 'LINEAGE_TRACING', label: 'Lineage Tracing', description: 'Trace data lineage' }
  ]
} as const;

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const UI_CONSTANTS = {
  // Theme Colors
  COLORS: {
    PRIMARY: '#0066cc',
    SECONDARY: '#6c757d',
    SUCCESS: '#28a745',
    WARNING: '#ffc107',
    DANGER: '#dc3545',
    INFO: '#17a2b8',
    LIGHT: '#f8f9fa',
    DARK: '#343a40'
  },

  // Status Colors
  STATUS_COLORS: {
    ACTIVE: '#28a745',
    INACTIVE: '#6c757d',
    DEPRECATED: '#ffc107',
    DRAFT: '#17a2b8',
    ARCHIVED: '#dc3545',
    UNDER_REVIEW: '#fd7e14'
  },

  // Quality Colors
  QUALITY_COLORS: {
    EXCELLENT: '#28a745',
    GOOD: '#7cb342',
    FAIR: '#ffc107',
    POOR: '#ff9800',
    CRITICAL: '#dc3545'
  },

  // Icon Sizes
  ICON_SIZES: {
    XS: 12,
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32
  },

  // Border Radius
  BORDER_RADIUS: {
    SM: '0.25rem',
    MD: '0.375rem',
    LG: '0.5rem',
    XL: '0.75rem',
    FULL: '9999px'
  },

  // Spacing
  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '3rem'
  },

  // Z-Index
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070
  }
} as const;

// ============================================================================
// NOTIFICATION CONSTANTS
// ============================================================================

export const NOTIFICATION_CONSTANTS = {
  // Notification Types
  TYPES: [
    { value: 'SUCCESS', label: 'Success', icon: 'check-circle', color: 'green' },
    { value: 'INFO', label: 'Information', icon: 'info', color: 'blue' },
    { value: 'WARNING', label: 'Warning', icon: 'alert-triangle', color: 'yellow' },
    { value: 'ERROR', label: 'Error', icon: 'x-circle', color: 'red' }
  ],

  // Notification Positions
  POSITIONS: [
    { value: 'TOP_RIGHT', label: 'Top Right' },
    { value: 'TOP_LEFT', label: 'Top Left' },
    { value: 'TOP_CENTER', label: 'Top Center' },
    { value: 'BOTTOM_RIGHT', label: 'Bottom Right' },
    { value: 'BOTTOM_LEFT', label: 'Bottom Left' },
    { value: 'BOTTOM_CENTER', label: 'Bottom Center' }
  ],

  // Auto Dismiss Times (in milliseconds)
  AUTO_DISMISS: {
    SUCCESS: 3000,
    INFO: 5000,
    WARNING: 8000,
    ERROR: 0 // No auto dismiss for errors
  }
} as const;

// ============================================================================
// ERROR CONSTANTS
// ============================================================================

export const ERROR_CONSTANTS = {
  // Error Categories
  CATEGORIES: {
    NETWORK: 'NETWORK',
    VALIDATION: 'VALIDATION',
    AUTHENTICATION: 'AUTHENTICATION',
    AUTHORIZATION: 'AUTHORIZATION',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    CLIENT_ERROR: 'CLIENT_ERROR',
    TIMEOUT: 'TIMEOUT',
    UNKNOWN: 'UNKNOWN'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
  },

  // Error Messages
  MESSAGES: {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access to this resource is forbidden.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'An internal server error occurred. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
  }
} as const;

// ============================================================================
// EXPORT ALL CONSTANTS
// ============================================================================

export const ALL_CONSTANTS = {
  CATALOG_CONFIG,
  ASSET_CONSTANTS,
  QUALITY_CONSTANTS,
  LINEAGE_CONSTANTS,
  SEARCH_CONSTANTS,
  ANALYTICS_CONSTANTS,
  DISCOVERY_CONSTANTS,
  UI_CONSTANTS,
  NOTIFICATION_CONSTANTS,
  ERROR_CONSTANTS
} as const;

export default ALL_CONSTANTS;