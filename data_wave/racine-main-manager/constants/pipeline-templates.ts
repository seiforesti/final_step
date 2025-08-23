/**
 * Pipeline Template Constants
 * ===========================
 *
 * Comprehensive pipeline template definitions for the Racine Main Manager,
 * including pre-built pipeline templates, common pipeline stages, optimization
 * configurations, and data transformation patterns for cross-group operations.
 */

import { PipelineDefinition, PipelineStage } from '../types/racine-core.types';

// ============================================================================
// PIPELINE TEMPLATES
// ============================================================================

export const PIPELINE_TEMPLATES = {
  DATA_INGESTION_PIPELINE: {
    id: 'data_ingestion_pipeline_template',
    name: 'Multi-Source Data Ingestion Pipeline',
    description: 'Comprehensive data ingestion pipeline supporting multiple data sources with real-time and batch processing',
    category: 'ingestion',
    tags: ['ingestion', 'real-time', 'batch', 'multi-source'],
    estimatedDuration: 1800, // seconds
    complexity: 'high',
    throughputCapacity: '10GB/hour',
    groups: ['data_sources', 'advanced_catalog', 'scan_logic'],
    stages: [
      {
        id: 'source_discovery',
        name: 'Source Discovery',
        type: 'extraction',
        description: 'Discover and validate data sources',
        config: {
          operation: 'multi_source_discovery',
          source_types: ['database', 'file', 'stream', 'api'],
          validation: true,
          parallel_discovery: true
        },
        dependencies: [],
        outputs: ['discovered_sources', 'source_metadata']
      },
      {
        id: 'data_extraction',
        name: 'Data Extraction',
        type: 'extraction',
        description: 'Extract data from discovered sources',
        config: {
          operation: 'parallel_extraction',
          batch_size: 10000,
          streaming_enabled: true,
          compression: 'gzip'
        },
        dependencies: ['source_discovery'],
        inputs: ['discovered_sources', 'source_metadata'],
        outputs: ['raw_data', 'extraction_metrics']
      },
      {
        id: 'data_validation',
        name: 'Data Validation',
        type: 'transformation',
        description: 'Validate extracted data quality and structure',
        config: {
          operation: 'data_validation',
          schema_validation: true,
          quality_checks: true,
          error_threshold: 0.05
        },
        dependencies: ['data_extraction'],
        inputs: ['raw_data'],
        outputs: ['validated_data', 'validation_report']
      },
      {
        id: 'data_transformation',
        name: 'Data Transformation',
        type: 'transformation',
        description: 'Apply transformations and enrichments',
        config: {
          operation: 'transform_data',
          transformations: ['normalize', 'enrich', 'cleanse'],
          parallel_processing: true
        },
        dependencies: ['data_validation'],
        inputs: ['validated_data'],
        outputs: ['transformed_data']
      },
      {
        id: 'data_loading',
        name: 'Data Loading',
        type: 'loading',
        description: 'Load transformed data to target systems',
        config: {
          operation: 'bulk_load',
          target_format: 'parquet',
          partitioning: 'date',
          compression: 'snappy'
        },
        dependencies: ['data_transformation'],
        inputs: ['transformed_data'],
        outputs: ['load_results', 'load_metrics']
      }
    ],
    parameters: {
      source_filters: {
        type: 'array',
        description: 'Filter sources by type or pattern',
        default: []
      },
      batch_size: {
        type: 'number',
        description: 'Batch size for processing',
        default: 10000,
        min: 1000,
        max: 100000
      },
      parallel_workers: {
        type: 'number',
        description: 'Number of parallel workers',
        default: 4,
        min: 1,
        max: 16
      }
    }
  },

  REAL_TIME_ANALYTICS_PIPELINE: {
    id: 'real_time_analytics_pipeline_template',
    name: 'Real-Time Analytics Processing Pipeline',
    description: 'Stream processing pipeline for real-time analytics with windowing and aggregations',
    category: 'analytics',
    tags: ['real-time', 'streaming', 'analytics', 'windowing'],
    estimatedDuration: 0, // continuous
    complexity: 'high',
    throughputCapacity: '1M events/second',
    groups: ['data_sources', 'ai_service', 'analytics'],
    stages: [
      {
        id: 'stream_ingestion',
        name: 'Stream Ingestion',
        type: 'streaming',
        description: 'Ingest data from streaming sources',
        config: {
          operation: 'stream_ingest',
          source_type: 'kafka',
          parallelism: 8,
          checkpointing: true,
          backpressure_handling: true
        },
        dependencies: [],
        outputs: ['event_stream']
      },
      {
        id: 'event_parsing',
        name: 'Event Parsing',
        type: 'transformation',
        description: 'Parse and structure incoming events',
        config: {
          operation: 'parse_events',
          schema_registry: true,
          error_handling: 'dead_letter',
          format: 'json'
        },
        dependencies: ['stream_ingestion'],
        inputs: ['event_stream'],
        outputs: ['parsed_events']
      },
      {
        id: 'windowed_aggregation',
        name: 'Windowed Aggregation',
        type: 'aggregation',
        description: 'Apply windowed aggregations',
        config: {
          operation: 'windowed_aggregation',
          window_type: 'tumbling',
          window_size: '5m',
          aggregation_functions: ['count', 'sum', 'avg', 'max']
        },
        dependencies: ['event_parsing'],
        inputs: ['parsed_events'],
        outputs: ['aggregated_metrics']
      },
      {
        id: 'anomaly_detection',
        name: 'Anomaly Detection',
        type: 'ml_processing',
        description: 'Detect anomalies in real-time',
        config: {
          operation: 'anomaly_detection',
          model_type: 'isolation_forest',
          sensitivity: 0.1,
          learning_rate: 0.01
        },
        dependencies: ['windowed_aggregation'],
        inputs: ['aggregated_metrics'],
        outputs: ['anomaly_alerts']
      },
      {
        id: 'results_publishing',
        name: 'Results Publishing',
        type: 'publishing',
        description: 'Publish results to downstream systems',
        config: {
          operation: 'publish_results',
          targets: ['dashboard', 'alerts', 'storage'],
          format: 'json',
          delivery_guarantee: 'at_least_once'
        },
        dependencies: ['anomaly_detection'],
        inputs: ['aggregated_metrics', 'anomaly_alerts'],
        outputs: ['published_results']
      }
    ],
    parameters: {
      window_size: {
        type: 'string',
        description: 'Window size for aggregations',
        default: '5m',
        options: ['1m', '5m', '15m', '1h']
      },
      parallelism: {
        type: 'number',
        description: 'Stream parallelism',
        default: 8,
        min: 1,
        max: 32
      },
      anomaly_sensitivity: {
        type: 'number',
        description: 'Anomaly detection sensitivity',
        default: 0.1,
        min: 0.01,
        max: 1.0
      }
    }
  },

  DATA_QUALITY_PIPELINE: {
    id: 'data_quality_pipeline_template',
    name: 'Comprehensive Data Quality Pipeline',
    description: 'End-to-end data quality assessment and remediation pipeline',
    category: 'quality',
    tags: ['data-quality', 'profiling', 'cleansing', 'monitoring'],
    estimatedDuration: 3600, // seconds
    complexity: 'medium',
    throughputCapacity: '5GB/hour',
    groups: ['data_sources', 'scan_rule_sets', 'ai_service'],
    stages: [
      {
        id: 'data_profiling',
        name: 'Data Profiling',
        type: 'profiling',
        description: 'Profile data to understand quality characteristics',
        config: {
          operation: 'comprehensive_profiling',
          metrics: ['completeness', 'uniqueness', 'validity', 'consistency'],
          sampling_strategy: 'stratified',
          sample_size: 0.1
        },
        dependencies: [],
        outputs: ['profile_results', 'quality_metrics']
      },
      {
        id: 'quality_assessment',
        name: 'Quality Assessment',
        type: 'assessment',
        description: 'Assess data quality against defined rules',
        config: {
          operation: 'quality_assessment',
          rule_engine: 'custom',
          threshold_checks: true,
          statistical_analysis: true
        },
        dependencies: ['data_profiling'],
        inputs: ['profile_results'],
        outputs: ['quality_scores', 'issue_catalog']
      },
      {
        id: 'anomaly_identification',
        name: 'Anomaly Identification',
        type: 'ml_processing',
        description: 'Use ML to identify data anomalies',
        config: {
          operation: 'ml_anomaly_detection',
          algorithms: ['isolation_forest', 'one_class_svm'],
          ensemble_method: 'voting'
        },
        dependencies: ['quality_assessment'],
        inputs: ['quality_metrics'],
        outputs: ['anomalies', 'anomaly_scores']
      },
      {
        id: 'data_cleansing',
        name: 'Data Cleansing',
        type: 'transformation',
        description: 'Apply automated data cleansing',
        config: {
          operation: 'automated_cleansing',
          cleansing_rules: ['deduplication', 'standardization', 'correction'],
          confidence_threshold: 0.8
        },
        dependencies: ['anomaly_identification'],
        inputs: ['issue_catalog', 'anomalies'],
        outputs: ['cleansed_data', 'cleansing_report']
      },
      {
        id: 'quality_monitoring',
        name: 'Quality Monitoring',
        type: 'monitoring',
        description: 'Set up continuous quality monitoring',
        config: {
          operation: 'setup_monitoring',
          monitoring_frequency: 'daily',
          alerting_enabled: true,
          dashboard_creation: true
        },
        dependencies: ['data_cleansing'],
        inputs: ['quality_scores', 'cleansing_report'],
        outputs: ['monitoring_config', 'quality_dashboard']
      }
    ],
    parameters: {
      quality_threshold: {
        type: 'number',
        description: 'Minimum quality threshold',
        default: 0.8,
        min: 0.5,
        max: 1.0
      },
      cleansing_mode: {
        type: 'string',
        description: 'Data cleansing mode',
        default: 'automated',
        options: ['automated', 'semi_automated', 'manual']
      },
      monitoring_frequency: {
        type: 'string',
        description: 'Quality monitoring frequency',
        default: 'daily',
        options: ['hourly', 'daily', 'weekly']
      }
    }
  },

  COMPLIANCE_VALIDATION_PIPELINE: {
    id: 'compliance_validation_pipeline_template',
    name: 'Regulatory Compliance Validation Pipeline',
    description: 'Automated compliance validation pipeline with remediation workflows',
    category: 'compliance',
    tags: ['compliance', 'validation', 'remediation', 'audit'],
    estimatedDuration: 5400, // seconds
    complexity: 'high',
    throughputCapacity: '1TB/hour',
    groups: ['compliance_rules', 'scan_logic', 'rbac_system'],
    stages: [
      {
        id: 'compliance_scanning',
        name: 'Compliance Scanning',
        type: 'scanning',
        description: 'Scan data for compliance violations',
        config: {
          operation: 'compliance_scan',
          frameworks: ['GDPR', 'CCPA', 'HIPAA', 'SOX'],
          deep_scan: true,
          parallel_scanning: true
        },
        dependencies: [],
        outputs: ['scan_results', 'violation_catalog']
      },
      {
        id: 'risk_assessment',
        name: 'Risk Assessment',
        type: 'assessment',
        description: 'Assess compliance risks and impact',
        config: {
          operation: 'risk_assessment',
          risk_matrix: 'standard',
          impact_analysis: true,
          likelihood_calculation: true
        },
        dependencies: ['compliance_scanning'],
        inputs: ['violation_catalog'],
        outputs: ['risk_scores', 'impact_analysis']
      },
      {
        id: 'remediation_planning',
        name: 'Remediation Planning',
        type: 'planning',
        description: 'Create automated remediation plans',
        config: {
          operation: 'remediation_planning',
          automation_level: 'high',
          priority_scoring: true,
          resource_estimation: true
        },
        dependencies: ['risk_assessment'],
        inputs: ['risk_scores', 'impact_analysis'],
        outputs: ['remediation_plans', 'execution_schedule']
      },
      {
        id: 'automated_remediation',
        name: 'Automated Remediation',
        type: 'remediation',
        description: 'Execute automated remediation actions',
        config: {
          operation: 'execute_remediation',
          auto_approve_threshold: 0.9,
          rollback_enabled: true,
          audit_logging: true
        },
        dependencies: ['remediation_planning'],
        inputs: ['remediation_plans'],
        outputs: ['remediation_results', 'audit_trail']
      },
      {
        id: 'compliance_reporting',
        name: 'Compliance Reporting',
        type: 'reporting',
        description: 'Generate compliance reports and documentation',
        config: {
          operation: 'generate_compliance_reports',
          report_formats: ['pdf', 'html', 'excel'],
          include_evidence: true,
          digital_signatures: true
        },
        dependencies: ['automated_remediation'],
        inputs: ['remediation_results', 'audit_trail'],
        outputs: ['compliance_reports', 'evidence_package']
      }
    ],
    parameters: {
      compliance_frameworks: {
        type: 'array',
        description: 'Compliance frameworks to validate',
        default: ['GDPR', 'CCPA']
      },
      risk_tolerance: {
        type: 'string',
        description: 'Organization risk tolerance',
        default: 'medium',
        options: ['low', 'medium', 'high']
      },
      auto_remediation: {
        type: 'boolean',
        description: 'Enable automatic remediation',
        default: true
      }
    }
  },

  ML_TRAINING_PIPELINE: {
    id: 'ml_training_pipeline_template',
    name: 'Machine Learning Training Pipeline',
    description: 'Comprehensive ML model training pipeline with data preparation and validation',
    category: 'machine_learning',
    tags: ['ml', 'training', 'validation', 'deployment'],
    estimatedDuration: 14400, // seconds (4 hours)
    complexity: 'high',
    throughputCapacity: '100GB/hour',
    groups: ['data_sources', 'ai_service', 'advanced_catalog'],
    stages: [
      {
        id: 'data_preparation',
        name: 'Data Preparation',
        type: 'preparation',
        description: 'Prepare and preprocess training data',
        config: {
          operation: 'data_preparation',
          preprocessing_steps: ['cleaning', 'normalization', 'feature_engineering'],
          train_test_split: 0.8,
          validation_split: 0.1
        },
        dependencies: [],
        outputs: ['training_data', 'validation_data', 'test_data']
      },
      {
        id: 'feature_engineering',
        name: 'Feature Engineering',
        type: 'transformation',
        description: 'Engineer features for model training',
        config: {
          operation: 'feature_engineering',
          techniques: ['encoding', 'scaling', 'selection'],
          automated_feature_selection: true,
          feature_importance: true
        },
        dependencies: ['data_preparation'],
        inputs: ['training_data'],
        outputs: ['engineered_features', 'feature_metadata']
      },
      {
        id: 'model_training',
        name: 'Model Training',
        type: 'training',
        description: 'Train ML models with hyperparameter tuning',
        config: {
          operation: 'model_training',
          algorithms: ['random_forest', 'gradient_boosting', 'neural_network'],
          hyperparameter_tuning: true,
          cross_validation: 5
        },
        dependencies: ['feature_engineering'],
        inputs: ['engineered_features', 'validation_data'],
        outputs: ['trained_models', 'training_metrics']
      },
      {
        id: 'model_validation',
        name: 'Model Validation',
        type: 'validation',
        description: 'Validate model performance and quality',
        config: {
          operation: 'model_validation',
          validation_metrics: ['accuracy', 'precision', 'recall', 'f1'],
          fairness_testing: true,
          explainability_analysis: true
        },
        dependencies: ['model_training'],
        inputs: ['trained_models', 'test_data'],
        outputs: ['validation_results', 'performance_report']
      },
      {
        id: 'model_deployment',
        name: 'Model Deployment',
        type: 'deployment',
        description: 'Deploy validated models to production',
        config: {
          operation: 'model_deployment',
          deployment_strategy: 'blue_green',
          monitoring_enabled: true,
          rollback_threshold: 0.05
        },
        dependencies: ['model_validation'],
        inputs: ['trained_models', 'validation_results'],
        outputs: ['deployment_results', 'monitoring_config']
      }
    ],
    parameters: {
      model_type: {
        type: 'string',
        description: 'Type of ML model to train',
        default: 'classification',
        options: ['classification', 'regression', 'clustering', 'anomaly_detection']
      },
      training_size: {
        type: 'number',
        description: 'Training data size percentage',
        default: 0.8,
        min: 0.5,
        max: 0.9
      },
      performance_threshold: {
        type: 'number',
        description: 'Minimum performance threshold for deployment',
        default: 0.85,
        min: 0.7,
        max: 1.0
      }
    }
  }
} as const;

// ============================================================================
// STAGE TEMPLATES
// ============================================================================

export const STAGE_TEMPLATES = {
  // Extraction Stages
  DATABASE_EXTRACTION: {
    type: 'extraction',
    name: 'Database Extraction',
    description: 'Extract data from relational databases',
    defaultConfig: {
      operation: 'database_extract',
      connection_pooling: true,
      batch_size: 10000,
      parallel_connections: 4
    },
    requiredInputs: [],
    outputs: ['extracted_data', 'extraction_metadata'],
    optimizationOptions: [
      'connection_pooling',
      'parallel_execution',
      'batch_optimization',
      'query_optimization'
    ]
  },

  FILE_EXTRACTION: {
    type: 'extraction',
    name: 'File Extraction',
    description: 'Extract data from various file formats',
    defaultConfig: {
      operation: 'file_extract',
      supported_formats: ['csv', 'json', 'parquet', 'avro'],
      compression_handling: true,
      parallel_processing: true
    },
    requiredInputs: [],
    outputs: ['file_data', 'file_metadata'],
    optimizationOptions: [
      'parallel_processing',
      'compression_optimization',
      'memory_optimization',
      'io_optimization'
    ]
  },

  STREAM_EXTRACTION: {
    type: 'extraction',
    name: 'Stream Extraction',
    description: 'Extract data from streaming sources',
    defaultConfig: {
      operation: 'stream_extract',
      source_type: 'kafka',
      consumer_groups: 1,
      checkpointing: true
    },
    requiredInputs: [],
    outputs: ['stream_data', 'stream_metadata'],
    optimizationOptions: [
      'parallelism_tuning',
      'backpressure_handling',
      'checkpoint_optimization',
      'latency_optimization'
    ]
  },

  // Transformation Stages
  DATA_CLEANING: {
    type: 'transformation',
    name: 'Data Cleaning',
    description: 'Clean and standardize data',
    defaultConfig: {
      operation: 'data_cleaning',
      null_handling: 'impute',
      duplicate_removal: true,
      outlier_detection: true
    },
    requiredInputs: ['raw_data'],
    outputs: ['cleaned_data', 'cleaning_report'],
    optimizationOptions: [
      'vectorization',
      'parallel_processing',
      'memory_optimization',
      'algorithm_optimization'
    ]
  },

  DATA_TRANSFORMATION: {
    type: 'transformation',
    name: 'Data Transformation',
    description: 'Transform data structure and format',
    defaultConfig: {
      operation: 'data_transformation',
      transformation_type: 'schema_mapping',
      validation_enabled: true,
      error_handling: 'strict'
    },
    requiredInputs: ['source_data', 'transformation_rules'],
    outputs: ['transformed_data', 'transformation_log'],
    optimizationOptions: [
      'pushdown_optimization',
      'batch_processing',
      'lazy_evaluation',
      'caching'
    ]
  },

  DATA_ENRICHMENT: {
    type: 'transformation',
    name: 'Data Enrichment',
    description: 'Enrich data with additional information',
    defaultConfig: {
      operation: 'data_enrichment',
      enrichment_sources: ['reference_data', 'external_apis'],
      caching_enabled: true,
      fallback_strategy: 'skip'
    },
    requiredInputs: ['base_data'],
    outputs: ['enriched_data', 'enrichment_metadata'],
    optimizationOptions: [
      'cache_optimization',
      'api_throttling',
      'batch_enrichment',
      'parallel_lookups'
    ]
  },

  // Loading Stages
  DATABASE_LOADING: {
    type: 'loading',
    name: 'Database Loading',
    description: 'Load data into relational databases',
    defaultConfig: {
      operation: 'database_load',
      load_strategy: 'bulk_insert',
      transaction_size: 10000,
      conflict_resolution: 'update'
    },
    requiredInputs: ['processed_data'],
    outputs: ['load_results', 'load_statistics'],
    optimizationOptions: [
      'bulk_loading',
      'transaction_optimization',
      'index_management',
      'parallel_loading'
    ]
  },

  FILE_LOADING: {
    type: 'loading',
    name: 'File Loading',
    description: 'Save data to various file formats',
    defaultConfig: {
      operation: 'file_save',
      output_format: 'parquet',
      compression: 'snappy',
      partitioning: 'date'
    },
    requiredInputs: ['final_data'],
    outputs: ['saved_files', 'file_manifest'],
    optimizationOptions: [
      'compression_optimization',
      'partitioning_strategy',
      'file_size_optimization',
      'parallel_writing'
    ]
  },

  // Aggregation Stages
  BATCH_AGGREGATION: {
    type: 'aggregation',
    name: 'Batch Aggregation',
    description: 'Perform batch aggregations on data',
    defaultConfig: {
      operation: 'batch_aggregation',
      aggregation_functions: ['sum', 'count', 'avg'],
      group_by_columns: [],
      window_functions: false
    },
    requiredInputs: ['input_data'],
    outputs: ['aggregated_data', 'aggregation_metadata'],
    optimizationOptions: [
      'pre_aggregation',
      'index_usage',
      'parallel_aggregation',
      'memory_optimization'
    ]
  },

  STREAMING_AGGREGATION: {
    type: 'aggregation',
    name: 'Streaming Aggregation',
    description: 'Perform real-time streaming aggregations',
    defaultConfig: {
      operation: 'streaming_aggregation',
      window_type: 'tumbling',
      window_size: '5m',
      trigger_policy: 'processing_time'
    },
    requiredInputs: ['event_stream'],
    outputs: ['windowed_results', 'state_snapshots'],
    optimizationOptions: [
      'state_optimization',
      'window_optimization',
      'parallelism_tuning',
      'memory_management'
    ]
  },

  // ML Processing Stages
  FEATURE_EXTRACTION: {
    type: 'ml_processing',
    name: 'Feature Extraction',
    description: 'Extract features for machine learning',
    defaultConfig: {
      operation: 'feature_extraction',
      feature_types: ['numerical', 'categorical', 'text'],
      normalization: true,
      encoding_strategy: 'auto'
    },
    requiredInputs: ['raw_features'],
    outputs: ['feature_vectors', 'feature_metadata'],
    optimizationOptions: [
      'vectorization',
      'sparse_matrix_optimization',
      'parallel_feature_extraction',
      'memory_optimization'
    ]
  },

  MODEL_INFERENCE: {
    type: 'ml_processing',
    name: 'Model Inference',
    description: 'Apply ML model for predictions',
    defaultConfig: {
      operation: 'model_inference',
      model_format: 'sklearn',
      batch_prediction: true,
      confidence_scoring: true
    },
    requiredInputs: ['feature_data', 'trained_model'],
    outputs: ['predictions', 'confidence_scores'],
    optimizationOptions: [
      'batch_optimization',
      'model_optimization',
      'gpu_acceleration',
      'caching'
    ]
  },

  // Monitoring Stages
  DATA_QUALITY_MONITORING: {
    type: 'monitoring',
    name: 'Data Quality Monitoring',
    description: 'Monitor data quality metrics',
    defaultConfig: {
      operation: 'quality_monitoring',
      metrics: ['completeness', 'accuracy', 'consistency'],
      alert_thresholds: {},
      monitoring_frequency: 'realtime'
    },
    requiredInputs: ['monitored_data'],
    outputs: ['quality_metrics', 'quality_alerts'],
    optimizationOptions: [
      'sampling_optimization',
      'metric_caching',
      'alert_deduplication',
      'batch_monitoring'
    ]
  },

  PERFORMANCE_MONITORING: {
    type: 'monitoring',
    name: 'Performance Monitoring',
    description: 'Monitor pipeline performance metrics',
    defaultConfig: {
      operation: 'performance_monitoring',
      metrics: ['throughput', 'latency', 'resource_usage'],
      collection_interval: '30s',
      retention_period: '30d'
    },
    requiredInputs: ['pipeline_metrics'],
    outputs: ['performance_data', 'performance_alerts'],
    optimizationOptions: [
      'metric_aggregation',
      'collection_optimization',
      'storage_optimization',
      'alert_optimization'
    ]
  }
} as const;

// ============================================================================
// OPTIMIZATION CONFIGURATIONS
// ============================================================================

export const OPTIMIZATION_CONFIGS = {
  PERFORMANCE_OPTIMIZATION: {
    throughput: {
      strategies: [
        'parallel_processing',
        'batch_optimization',
        'resource_scaling',
        'connection_pooling'
      ],
      parameters: {
        max_parallelism: 16,
        batch_size: 10000,
        connection_pool_size: 20,
        buffer_size: 1000000
      }
    },
    latency: {
      strategies: [
        'stream_processing',
        'cache_optimization',
        'index_usage',
        'query_optimization'
      ],
      parameters: {
        cache_size: '1GB',
        cache_ttl: 3600,
        index_threshold: 1000,
        query_timeout: 30
      }
    },
    resource_efficiency: {
      strategies: [
        'memory_optimization',
        'cpu_optimization',
        'io_optimization',
        'compression'
      ],
      parameters: {
        memory_limit: '8GB',
        cpu_limit: '4cores',
        compression_level: 6,
        spill_threshold: 0.8
      }
    }
  },

  COST_OPTIMIZATION: {
    compute_cost: {
      strategies: [
        'spot_instances',
        'auto_scaling',
        'resource_rightsizing',
        'workload_scheduling'
      ],
      parameters: {
        spot_instance_ratio: 0.7,
        scale_down_threshold: 0.3,
        min_instances: 1,
        max_instances: 10
      }
    },
    storage_cost: {
      strategies: [
        'data_compression',
        'lifecycle_management',
        'storage_tiering',
        'deduplication'
      ],
      parameters: {
        compression_ratio: 0.3,
        cold_storage_days: 90,
        archive_days: 365,
        deduplication_threshold: 0.9
      }
    },
    network_cost: {
      strategies: [
        'data_locality',
        'compression',
        'caching',
        'batch_transfers'
      ],
      parameters: {
        locality_preference: 'same_region',
        transfer_compression: true,
        cache_hit_ratio: 0.8,
        batch_size: 1000000
      }
    }
  },

  RELIABILITY_OPTIMIZATION: {
    fault_tolerance: {
      strategies: [
        'redundancy',
        'checkpointing',
        'graceful_degradation',
        'circuit_breaker'
      ],
      parameters: {
        replication_factor: 3,
        checkpoint_interval: 300,
        degradation_threshold: 0.7,
        circuit_breaker_threshold: 0.5
      }
    },
    data_consistency: {
      strategies: [
        'transaction_management',
        'data_validation',
        'conflict_resolution',
        'audit_logging'
      ],
      parameters: {
        transaction_isolation: 'read_committed',
        validation_level: 'strict',
        conflict_strategy: 'last_write_wins',
        audit_retention: 365
      }
    },
    recovery: {
      strategies: [
        'backup_strategy',
        'disaster_recovery',
        'rollback_capability',
        'health_monitoring'
      ],
      parameters: {
        backup_frequency: 'daily',
        recovery_time_objective: 3600,
        recovery_point_objective: 300,
        health_check_interval: 60
      }
    }
  }
} as const;

// ============================================================================
// PIPELINE CATEGORIES
// ============================================================================

export const PIPELINE_CATEGORIES = {
  INGESTION: {
    id: 'ingestion',
    name: 'Data Ingestion',
    description: 'Pipelines for ingesting data from various sources',
    icon: 'Download',
    color: '#3B82F6'
  },
  TRANSFORMATION: {
    id: 'transformation',
    name: 'Data Transformation',
    description: 'Pipelines for transforming and processing data',
    icon: 'RefreshCw',
    color: '#10B981'
  },
  ANALYTICS: {
    id: 'analytics',
    name: 'Analytics Processing',
    description: 'Pipelines for analytical data processing',
    icon: 'BarChart',
    color: '#8B5CF6'
  },
  MACHINE_LEARNING: {
    id: 'machine_learning',
    name: 'Machine Learning',
    description: 'Pipelines for ML training and inference',
    icon: 'Brain',
    color: '#F59E0B'
  },
  QUALITY: {
    id: 'quality',
    name: 'Data Quality',
    description: 'Pipelines for data quality management',
    icon: 'CheckCircle',
    color: '#EF4444'
  },
  COMPLIANCE: {
    id: 'compliance',
    name: 'Compliance & Governance',
    description: 'Pipelines for compliance and governance',
    icon: 'Shield',
    color: '#06B6D4'
  },
  MONITORING: {
    id: 'monitoring',
    name: 'Monitoring & Observability',
    description: 'Pipelines for monitoring and observability',
    icon: 'Eye',
    color: '#84CC16'
  },
  CUSTOM: {
    id: 'custom',
    name: 'Custom Pipelines',
    description: 'User-defined custom pipelines',
    icon: 'Settings',
    color: '#6B7280'
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getPipelineTemplate(templateId: string) {
  return Object.values(PIPELINE_TEMPLATES).find(template => template.id === templateId);
}

export function getStageTemplate(stageType: string, templateName?: string) {
  if (templateName) {
    return STAGE_TEMPLATES[templateName as keyof typeof STAGE_TEMPLATES];
  }
  
  return Object.values(STAGE_TEMPLATES).find(template => template.type === stageType);
}

export function getPipelinesByCategory(categoryId: string) {
  return Object.values(PIPELINE_TEMPLATES).filter(template => template.category === categoryId);
}

export function getPipelinesByGroup(groupId: string) {
  return Object.values(PIPELINE_TEMPLATES).filter(template => 
    template.groups.includes(groupId)
  );
}

export function getOptimizationConfig(strategy: string, objective: string) {
  const configs = OPTIMIZATION_CONFIGS[strategy as keyof typeof OPTIMIZATION_CONFIGS];
  return configs?.[objective as keyof typeof configs];
}

export function estimatePipelineComplexity(stages: PipelineStage[]): 'low' | 'medium' | 'high' {
  const stageCount = stages.length;
  const dependencyCount = stages.reduce((count, stage) => 
    count + (stage.dependencies?.length || 0), 0
  );
  const uniqueTypes = new Set(stages.map(stage => stage.type)).size;
  const parallelStages = stages.filter(stage => 
    stage.config?.parallel_processing || stage.config?.parallelism
  ).length;
  
  const complexityScore = 
    stageCount + 
    (dependencyCount * 2) + 
    (uniqueTypes * 3) - 
    (parallelStages * 0.5);
  
  if (complexityScore <= 8) return 'low';
  if (complexityScore <= 20) return 'medium';
  return 'high';
}

export function calculateThroughputCapacity(stages: PipelineStage[]): string {
  // Simplified throughput calculation based on stage types
  let baseCapacity = 1000; // MB/hour
  
  stages.forEach(stage => {
    switch (stage.type) {
      case 'extraction':
        baseCapacity *= 0.8; // Extraction is often the bottleneck
        break;
      case 'transformation':
        baseCapacity *= 0.9;
        break;
      case 'ml_processing':
        baseCapacity *= 0.6; // ML processing is compute-intensive
        break;
      case 'aggregation':
        baseCapacity *= 0.7;
        break;
      case 'loading':
        baseCapacity *= 0.85;
        break;
    }
  });
  
  // Apply parallelism boost
  const parallelStages = stages.filter(stage => 
    stage.config?.parallel_processing || stage.config?.parallelism
  ).length;
  
  if (parallelStages > 0) {
    baseCapacity *= (1 + parallelStages * 0.3);
  }
  
  if (baseCapacity >= 1000000) {
    return `${Math.round(baseCapacity / 1000000)}TB/hour`;
  } else if (baseCapacity >= 1000) {
    return `${Math.round(baseCapacity / 1000)}GB/hour`;
  } else {
    return `${Math.round(baseCapacity)}MB/hour`;
  }
}

export function validatePipelineStage(stage: PipelineStage): string[] {
  const errors: string[] = [];
  
  // Check required fields
  if (!stage.id) errors.push('Stage ID is required');
  if (!stage.name) errors.push('Stage name is required');
  if (!stage.type) errors.push('Stage type is required');
  
  // Check stage type validity
  const validTypes = Object.values(STAGE_TEMPLATES).map(template => template.type);
  if (!validTypes.includes(stage.type)) {
    errors.push(`Invalid stage type: ${stage.type}`);
  }
  
  // Check dependencies
  if (stage.dependencies) {
    stage.dependencies.forEach(dep => {
      if (!dep || typeof dep !== 'string') {
        errors.push('Invalid dependency reference');
      }
    });
  }
  
  return errors;
}

export function getOptimizationRecommendations(
  pipeline: PipelineDefinition,
  objective: 'performance' | 'cost' | 'reliability'
): string[] {
  const recommendations: string[] = [];
  
  pipeline.stages.forEach(stage => {
    const stageTemplate = getStageTemplate(stage.type);
    if (stageTemplate?.optimizationOptions) {
      const relevantOptions = stageTemplate.optimizationOptions.filter(option => {
        switch (objective) {
          case 'performance':
            return option.includes('optimization') || option.includes('parallel');
          case 'cost':
            return option.includes('resource') || option.includes('memory');
          case 'reliability':
            return option.includes('fault') || option.includes('backup');
          default:
            return true;
        }
      });
      
      if (relevantOptions.length > 0) {
        recommendations.push(
          `Consider ${relevantOptions.join(', ')} for stage ${stage.name}`
        );
      }
    }
  });
  
  return recommendations;
}