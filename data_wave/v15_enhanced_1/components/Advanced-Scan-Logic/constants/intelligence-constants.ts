export const ANOMALY_TYPES = ['spike', 'drift', 'outlier', 'trend-break', 'seasonal-shift'] as const;
export const ANOMALY_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const DETECTION_ALGORITHMS = ['isolation-forest', 'lof', 'arima', 'prophet', 'stl'] as const;
export const DEFAULT_ANOMALY_SETTINGS = {
  sensitivity: 'medium',
  windowSize: 100,
  minSupport: 0.02,
};

export const CONTEXT_TYPES = ['user', 'dataset', 'pipeline', 'job', 'workspace'] as const;
export const CONTEXT_CATEGORIES = ['security', 'performance', 'compliance', 'cost', 'quality'] as const;
export const CONTEXT_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const CONTEXT_SCOPES = ['local', 'workspace', 'organization'] as const;
export const CONTEXT_LEVELS = ['info', 'warning', 'error'] as const;
export const CONTEXTUAL_ALGORITHMS = ['bert', 'sentence-transformer', 'tfidf'] as const;
export const SEMANTIC_MODELS = ['mpnet', 'minilm', 'e5-large'] as const;
export const DEFAULT_CONTEXT_SETTINGS = {
  model: 'sentence-transformer',
  vectorDimensions: 512,
};

export const PREDICTION_TYPES = ['regression', 'classification', 'anomaly'] as const;
export const FORECAST_HORIZONS = ['1d', '7d', '30d', '90d'] as const;
export const MODEL_ALGORITHMS = ['lstm', 'xgboost', 'random-forest', 'prophet'] as const;
export const TREND_DIRECTIONS = ['up', 'down', 'flat'] as const;
export const CONFIDENCE_LEVELS = ['low', 'medium', 'high'] as const;
export const PREDICTION_CATEGORIES = ['performance', 'cost', 'accuracy'] as const;
export const DEFAULT_PREDICTION_SETTINGS = {
  horizon: '30d',
  confidence: 'medium',
};
export const VISUALIZATION_CONFIGS = {
  line: { strokeWidth: 2 },
  bar: { barSize: 16 },
};

export const INTELLIGENCE_CATEGORIES = ['pattern', 'behavior', 'context', 'threat'] as const;
export const INTELLIGENCE_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const PATTERN_TYPES = ['regex', 'semantic', 'structural'] as const;
export const DEFAULT_INTELLIGENCE_SETTINGS = {
  enableCaching: true,
  maxItems: 500,
};

export const BEHAVIORAL_PATTERNS = ['sudden-change', 'gradual-drift', 'cyclic', 'burst'] as const;
export const BEHAVIORAL_METRICS = ['latency', 'throughput', 'errorRate'] as const;
export const BEHAVIORAL_CLASSIFICATIONS = ['benign', 'suspicious', 'malicious'] as const;
export const BEHAVIORAL_RISK_LEVELS = ['low', 'medium', 'high'] as const;
export const BEHAVIORAL_THRESHOLDS = { latency: 2000, errorRate: 0.05 };
export const BEHAVIORAL_ALGORITHMS = ['hmm', 'markov', 'lstm'] as const;
export const BEHAVIORAL_MODELS = ['baseline', 'advanced'] as const;
export const DEFAULT_BEHAVIORAL_SETTINGS = { window: 60 };

export const ANALYTICS_METRICS = ['p50', 'p90', 'p99', 'throughput', 'errorRate'] as const;
export const ANALYTICS_DIMENSIONS = ['workspace', 'pipeline', 'rule', 'datasource'] as const;
export const ANALYTICS_AGGREGATIONS = ['avg', 'sum', 'min', 'max'] as const;

export default {
  ANOMALY_TYPES,
  ANOMALY_SEVERITIES,
  DETECTION_ALGORITHMS,
  DEFAULT_ANOMALY_SETTINGS,
  CONTEXT_TYPES,
  CONTEXT_CATEGORIES,
  CONTEXT_PRIORITIES,
  CONTEXT_SCOPES,
  CONTEXT_LEVELS,
  CONTEXTUAL_ALGORITHMS,
  SEMANTIC_MODELS,
  DEFAULT_CONTEXT_SETTINGS,
  PREDICTION_TYPES,
  FORECAST_HORIZONS,
  MODEL_ALGORITHMS,
  TREND_DIRECTIONS,
  CONFIDENCE_LEVELS,
  PREDICTION_CATEGORIES,
  DEFAULT_PREDICTION_SETTINGS,
  VISUALIZATION_CONFIGS,
  INTELLIGENCE_CATEGORIES,
  INTELLIGENCE_SEVERITIES,
  PATTERN_TYPES,
  DEFAULT_INTELLIGENCE_SETTINGS,
  BEHAVIORAL_PATTERNS,
  BEHAVIORAL_METRICS,
  BEHAVIORAL_CLASSIFICATIONS,
  BEHAVIORAL_RISK_LEVELS,
  BEHAVIORAL_THRESHOLDS,
  BEHAVIORAL_ALGORITHMS,
  BEHAVIORAL_MODELS,
  DEFAULT_BEHAVIORAL_SETTINGS,
  ANALYTICS_METRICS,
  ANALYTICS_DIMENSIONS,
  ANALYTICS_AGGREGATIONS,
};



