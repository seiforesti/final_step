/**
 * 🔄 Workflow Templates Constants - Advanced Scan Logic
 * ====================================================
 * 
 * Enterprise-grade workflow templates for scan orchestration
 * Maps to: backend/models/scan_orchestration_models.py & scan_workflow_models.py
 * 
 * Features:
 * - Comprehensive workflow templates library
 * - Enterprise orchestration patterns
 * - AI-powered workflow configurations
 * - Multi-system coordination templates
 * - Performance-optimized workflows
 * - Compliance-aware templates
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 */

import { 
  WorkflowTemplate, 
  OrchestrationStrategy, 
  ResourceAllocationStrategy,
  WorkflowStepType,
  TriggerType,
  ScheduleType,
  RetryStrategy
} from '../types/workflow.types';

// ==========================================
// CORE WORKFLOW TEMPLATE CATEGORIES
// ==========================================

export const WORKFLOW_CATEGORIES = {
  DATA_DISCOVERY: 'data_discovery',
  COMPLIANCE_SCANNING: 'compliance_scanning',
  QUALITY_ASSESSMENT: 'quality_assessment',
  SECURITY_ANALYSIS: 'security_analysis',
  PERFORMANCE_OPTIMIZATION: 'performance_optimization',
  INTELLIGENT_CLASSIFICATION: 'intelligent_classification',
  ANOMALY_DETECTION: 'anomaly_detection',
  PREDICTIVE_ANALYTICS: 'predictive_analytics',
  CROSS_SYSTEM_SYNC: 'cross_system_sync',
  ENTERPRISE_ORCHESTRATION: 'enterprise_orchestration'
} as const;

// ==========================================
// ORCHESTRATION STRATEGIES
// ==========================================

export const ORCHESTRATION_STRATEGIES = {
  PARALLEL: {
    id: 'parallel',
    name: 'Parallel Execution',
    description: 'Execute multiple scans simultaneously for maximum performance',
    max_concurrent: 50,
    resource_efficiency: 0.85,
    use_cases: ['bulk_scanning', 'performance_critical', 'resource_abundant']
  },
  SEQUENTIAL: {
    id: 'sequential',
    name: 'Sequential Execution',
    description: 'Execute scans one after another for resource conservation',
    max_concurrent: 1,
    resource_efficiency: 0.95,
    use_cases: ['resource_limited', 'dependency_heavy', 'debug_mode']
  },
  ADAPTIVE: {
    id: 'adaptive',
    name: 'Adaptive Orchestration',
    description: 'Intelligently adapt execution strategy based on system conditions',
    max_concurrent: 'dynamic',
    resource_efficiency: 0.92,
    use_cases: ['production', 'mixed_workloads', 'auto_optimization']
  },
  PIPELINE: {
    id: 'pipeline',
    name: 'Pipeline Execution',
    description: 'Execute scans in a pipeline pattern with data flow optimization',
    max_concurrent: 'staged',
    resource_efficiency: 0.88,
    use_cases: ['data_transformation', 'multi_stage', 'streaming']
  },
  GRAPH_BASED: {
    id: 'graph_based',
    name: 'Graph-Based Execution',
    description: 'Execute based on complex dependency graphs and conditions',
    max_concurrent: 'conditional',
    resource_efficiency: 0.90,
    use_cases: ['complex_dependencies', 'conditional_logic', 'enterprise_workflows']
  }
} as const;

// ==========================================
// RESOURCE ALLOCATION STRATEGIES
// ==========================================

export const RESOURCE_ALLOCATION_STRATEGIES = {
  BALANCED: {
    id: 'balanced',
    name: 'Balanced Allocation',
    cpu_weight: 0.4,
    memory_weight: 0.4,
    network_weight: 0.2,
    optimization_target: 'overall_performance'
  },
  PERFORMANCE: {
    id: 'performance',
    name: 'Performance Optimized',
    cpu_weight: 0.5,
    memory_weight: 0.3,
    network_weight: 0.2,
    optimization_target: 'maximum_throughput'
  },
  COST_OPTIMIZED: {
    id: 'cost_optimized',
    name: 'Cost Optimized',
    cpu_weight: 0.2,
    memory_weight: 0.3,
    network_weight: 0.5,
    optimization_target: 'minimum_cost'
  },
  MEMORY_OPTIMIZED: {
    id: 'memory_optimized',
    name: 'Memory Optimized',
    cpu_weight: 0.2,
    memory_weight: 0.7,
    network_weight: 0.1,
    optimization_target: 'memory_efficiency'
  },
  CPU_OPTIMIZED: {
    id: 'cpu_optimized',
    name: 'CPU Optimized',
    cpu_weight: 0.7,
    memory_weight: 0.2,
    network_weight: 0.1,
    optimization_target: 'cpu_efficiency'
  }
} as const;

// ==========================================
// ENTERPRISE WORKFLOW TEMPLATES
// ==========================================

export const ENTERPRISE_WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  // Data Discovery Workflows
  COMPREHENSIVE_DATA_DISCOVERY: {
    id: 'comprehensive_data_discovery',
    name: 'Comprehensive Data Discovery',
    category: WORKFLOW_CATEGORIES.DATA_DISCOVERY,
    description: 'Full-spectrum data discovery across all connected systems',
    version: '2.1.0',
    orchestration_strategy: ORCHESTRATION_STRATEGIES.ADAPTIVE.id,
    resource_allocation: RESOURCE_ALLOCATION_STRATEGIES.BALANCED.id,
    estimated_duration: 3600, // 1 hour
    complexity_level: 'high',
    steps: [
      {
        id: 'initialize_discovery',
        name: 'Initialize Discovery Process',
        type: 'initialization',
        order: 1,
        parallel: false,
        timeout_seconds: 300,
        retry_config: { max_attempts: 3, backoff_strategy: 'exponential' },
        resource_requirements: { cpu: 0.5, memory_mb: 512, storage_mb: 100 }
      },
      {
        id: 'scan_data_sources',
        name: 'Scan All Data Sources',
        type: 'scan',
        order: 2,
        parallel: true,
        timeout_seconds: 1800,
        retry_config: { max_attempts: 2, backoff_strategy: 'linear' },
        resource_requirements: { cpu: 2.0, memory_mb: 2048, storage_mb: 1000 }
      },
      {
        id: 'analyze_metadata',
        name: 'Analyze Metadata Patterns',
        type: 'analysis',
        order: 3,
        parallel: false,
        timeout_seconds: 900,
        dependencies: ['scan_data_sources'],
        resource_requirements: { cpu: 1.0, memory_mb: 1024, storage_mb: 500 }
      },
      {
        id: 'classify_assets',
        name: 'Classify Data Assets',
        type: 'classification',
        order: 4,
        parallel: true,
        timeout_seconds: 1200,
        dependencies: ['analyze_metadata'],
        resource_requirements: { cpu: 1.5, memory_mb: 1536, storage_mb: 300 }
      },
      {
        id: 'generate_catalog',
        name: 'Generate Data Catalog',
        type: 'generation',
        order: 5,
        parallel: false,
        timeout_seconds: 600,
        dependencies: ['classify_assets'],
        resource_requirements: { cpu: 0.8, memory_mb: 768, storage_mb: 200 }
      }
    ],
    triggers: [
      {
        type: 'schedule',
        config: { cron: '0 2 * * *', timezone: 'UTC' }
      },
      {
        type: 'event',
        config: { event_type: 'new_data_source_added' }
      }
    ],
    success_criteria: {
      min_assets_discovered: 100,
      classification_accuracy: 0.95,
      completion_time_sla: 3600
    }
  },

  // Compliance Scanning Workflows
  REGULATORY_COMPLIANCE_SCAN: {
    id: 'regulatory_compliance_scan',
    name: 'Regulatory Compliance Scan',
    category: WORKFLOW_CATEGORIES.COMPLIANCE_SCANNING,
    description: 'Comprehensive compliance scanning for regulatory requirements',
    version: '1.8.0',
    orchestration_strategy: ORCHESTRATION_STRATEGIES.SEQUENTIAL.id,
    resource_allocation: RESOURCE_ALLOCATION_STRATEGIES.BALANCED.id,
    estimated_duration: 2400, // 40 minutes
    complexity_level: 'high',
    compliance_frameworks: ['GDPR', 'CCPA', 'HIPAA', 'SOX', 'PCI-DSS'],
    steps: [
      {
        id: 'compliance_init',
        name: 'Initialize Compliance Scan',
        type: 'initialization',
        order: 1,
        parallel: false,
        timeout_seconds: 180,
        resource_requirements: { cpu: 0.3, memory_mb: 256, storage_mb: 50 }
      },
      {
        id: 'pii_detection',
        name: 'Detect Personal Information',
        type: 'scan',
        order: 2,
        parallel: true,
        timeout_seconds: 900,
        dependencies: ['compliance_init'],
        resource_requirements: { cpu: 1.8, memory_mb: 1800, storage_mb: 400 }
      },
      {
        id: 'sensitive_data_scan',
        name: 'Scan Sensitive Data',
        type: 'scan',
        order: 3,
        parallel: true,
        timeout_seconds: 1200,
        dependencies: ['compliance_init'],
        resource_requirements: { cpu: 2.2, memory_mb: 2200, storage_mb: 600 }
      },
      {
        id: 'access_control_audit',
        name: 'Audit Access Controls',
        type: 'audit',
        order: 4,
        parallel: false,
        timeout_seconds: 600,
        dependencies: ['pii_detection', 'sensitive_data_scan'],
        resource_requirements: { cpu: 1.0, memory_mb: 1000, storage_mb: 200 }
      },
      {
        id: 'compliance_report',
        name: 'Generate Compliance Report',
        type: 'reporting',
        order: 5,
        parallel: false,
        timeout_seconds: 300,
        dependencies: ['access_control_audit'],
        resource_requirements: { cpu: 0.5, memory_mb: 512, storage_mb: 100 }
      }
    ],
    triggers: [
      {
        type: 'schedule',
        config: { cron: '0 1 * * 1', timezone: 'UTC' } // Weekly on Monday
      },
      {
        type: 'manual',
        config: { require_approval: true }
      }
    ],
    success_criteria: {
      compliance_score: 0.98,
      violations_detected: true,
      report_generated: true
    }
  },

  // AI-Powered Intelligent Classification
  AI_INTELLIGENT_CLASSIFICATION: {
    id: 'ai_intelligent_classification',
    name: 'AI-Powered Intelligent Classification',
    category: WORKFLOW_CATEGORIES.INTELLIGENT_CLASSIFICATION,
    description: 'Advanced AI-driven data classification and tagging',
    version: '3.0.0',
    orchestration_strategy: ORCHESTRATION_STRATEGIES.PIPELINE.id,
    resource_allocation: RESOURCE_ALLOCATION_STRATEGIES.PERFORMANCE.id,
    estimated_duration: 1800, // 30 minutes
    complexity_level: 'expert',
    ai_models: ['bert_classifier', 'data_profiler', 'semantic_analyzer'],
    steps: [
      {
        id: 'ai_model_init',
        name: 'Initialize AI Models',
        type: 'initialization',
        order: 1,
        parallel: false,
        timeout_seconds: 240,
        resource_requirements: { cpu: 2.0, memory_mb: 4096, storage_mb: 1000 }
      },
      {
        id: 'data_profiling',
        name: 'Profile Data Characteristics',
        type: 'analysis',
        order: 2,
        parallel: true,
        timeout_seconds: 600,
        dependencies: ['ai_model_init'],
        resource_requirements: { cpu: 3.0, memory_mb: 3072, storage_mb: 500 }
      },
      {
        id: 'semantic_analysis',
        name: 'Semantic Content Analysis',
        type: 'analysis',
        order: 3,
        parallel: true,
        timeout_seconds: 800,
        dependencies: ['ai_model_init'],
        resource_requirements: { cpu: 2.5, memory_mb: 2560, storage_mb: 300 }
      },
      {
        id: 'ml_classification',
        name: 'Machine Learning Classification',
        type: 'classification',
        order: 4,
        parallel: false,
        timeout_seconds: 900,
        dependencies: ['data_profiling', 'semantic_analysis'],
        resource_requirements: { cpu: 4.0, memory_mb: 6144, storage_mb: 800 }
      },
      {
        id: 'confidence_scoring',
        name: 'Calculate Confidence Scores',
        type: 'scoring',
        order: 5,
        parallel: false,
        timeout_seconds: 300,
        dependencies: ['ml_classification'],
        resource_requirements: { cpu: 1.0, memory_mb: 1024, storage_mb: 100 }
      }
    ],
    triggers: [
      {
        type: 'event',
        config: { event_type: 'new_data_ingested' }
      },
      {
        type: 'schedule',
        config: { cron: '0 */4 * * *', timezone: 'UTC' } // Every 4 hours
      }
    ],
    success_criteria: {
      classification_accuracy: 0.97,
      confidence_threshold: 0.85,
      processing_time_sla: 1800
    }
  },

  // Performance Optimization Workflow
  PERFORMANCE_OPTIMIZATION: {
    id: 'performance_optimization',
    name: 'Performance Optimization Workflow',
    category: WORKFLOW_CATEGORIES.PERFORMANCE_OPTIMIZATION,
    description: 'Intelligent performance analysis and optimization',
    version: '2.3.0',
    orchestration_strategy: ORCHESTRATION_STRATEGIES.GRAPH_BASED.id,
    resource_allocation: RESOURCE_ALLOCATION_STRATEGIES.PERFORMANCE.id,
    estimated_duration: 2700, // 45 minutes
    complexity_level: 'expert',
    steps: [
      {
        id: 'baseline_measurement',
        name: 'Establish Performance Baseline',
        type: 'measurement',
        order: 1,
        parallel: false,
        timeout_seconds: 600,
        resource_requirements: { cpu: 1.5, memory_mb: 1536, storage_mb: 300 }
      },
      {
        id: 'bottleneck_analysis',
        name: 'Analyze Performance Bottlenecks',
        type: 'analysis',
        order: 2,
        parallel: true,
        timeout_seconds: 900,
        dependencies: ['baseline_measurement'],
        resource_requirements: { cpu: 2.5, memory_mb: 2560, storage_mb: 500 }
      },
      {
        id: 'resource_optimization',
        name: 'Optimize Resource Allocation',
        type: 'optimization',
        order: 3,
        parallel: false,
        timeout_seconds: 800,
        dependencies: ['bottleneck_analysis'],
        resource_requirements: { cpu: 2.0, memory_mb: 2048, storage_mb: 200 }
      },
      {
        id: 'algorithm_tuning',
        name: 'Tune Scanning Algorithms',
        type: 'tuning',
        order: 4,
        parallel: true,
        timeout_seconds: 1200,
        dependencies: ['bottleneck_analysis'],
        resource_requirements: { cpu: 3.0, memory_mb: 3072, storage_mb: 400 }
      },
      {
        id: 'validation_testing',
        name: 'Validate Optimizations',
        type: 'validation',
        order: 5,
        parallel: false,
        timeout_seconds: 600,
        dependencies: ['resource_optimization', 'algorithm_tuning'],
        resource_requirements: { cpu: 1.8, memory_mb: 1800, storage_mb: 250 }
      }
    ],
    triggers: [
      {
        type: 'performance_threshold',
        config: { metric: 'scan_duration', threshold: 3600, operator: 'greater_than' }
      },
      {
        type: 'schedule',
        config: { cron: '0 3 * * 0', timezone: 'UTC' } // Weekly on Sunday
      }
    ],
    success_criteria: {
      performance_improvement: 0.20, // 20% improvement
      resource_efficiency: 0.15, // 15% better efficiency
      stability_score: 0.95
    }
  },

  // Enterprise Cross-System Orchestration
  ENTERPRISE_CROSS_SYSTEM_SYNC: {
    id: 'enterprise_cross_system_sync',
    name: 'Enterprise Cross-System Synchronization',
    category: WORKFLOW_CATEGORIES.CROSS_SYSTEM_SYNC,
    description: 'Orchestrate data governance across multiple enterprise systems',
    version: '1.5.0',
    orchestration_strategy: ORCHESTRATION_STRATEGIES.GRAPH_BASED.id,
    resource_allocation: RESOURCE_ALLOCATION_STRATEGIES.BALANCED.id,
    estimated_duration: 5400, // 90 minutes
    complexity_level: 'expert',
    target_systems: ['databricks', 'snowflake', 'azure_synapse', 'aws_glue', 'google_cloud'],
    steps: [
      {
        id: 'system_health_check',
        name: 'Check System Health',
        type: 'health_check',
        order: 1,
        parallel: true,
        timeout_seconds: 300,
        resource_requirements: { cpu: 0.5, memory_mb: 512, storage_mb: 50 }
      },
      {
        id: 'schema_synchronization',
        name: 'Synchronize Schema Definitions',
        type: 'synchronization',
        order: 2,
        parallel: false,
        timeout_seconds: 1200,
        dependencies: ['system_health_check'],
        resource_requirements: { cpu: 1.5, memory_mb: 1536, storage_mb: 400 }
      },
      {
        id: 'metadata_sync',
        name: 'Synchronize Metadata',
        type: 'synchronization',
        order: 3,
        parallel: true,
        timeout_seconds: 1800,
        dependencies: ['schema_synchronization'],
        resource_requirements: { cpu: 2.0, memory_mb: 2048, storage_mb: 800 }
      },
      {
        id: 'lineage_mapping',
        name: 'Map Data Lineage',
        type: 'mapping',
        order: 4,
        parallel: false,
        timeout_seconds: 2400,
        dependencies: ['metadata_sync'],
        resource_requirements: { cpu: 2.5, memory_mb: 2560, storage_mb: 600 }
      },
      {
        id: 'consistency_validation',
        name: 'Validate Cross-System Consistency',
        type: 'validation',
        order: 5,
        parallel: false,
        timeout_seconds: 900,
        dependencies: ['lineage_mapping'],
        resource_requirements: { cpu: 1.8, memory_mb: 1800, storage_mb: 300 }
      }
    ],
    triggers: [
      {
        type: 'schedule',
        config: { cron: '0 0 * * *', timezone: 'UTC' } // Daily at midnight
      },
      {
        type: 'event',
        config: { event_type: 'schema_change_detected' }
      }
    ],
    success_criteria: {
      systems_synchronized: 0.98,
      data_consistency: 0.99,
      lineage_completeness: 0.95
    }
  }
};

// ==========================================
// WORKFLOW STEP TYPES
// ==========================================

export const WORKFLOW_STEP_TYPES = {
  INITIALIZATION: {
    id: 'initialization',
    name: 'Initialization',
    description: 'Initialize workflow components and resources',
    typical_duration: 180,
    resource_profile: 'light'
  },
  SCAN: {
    id: 'scan',
    name: 'Data Scan',
    description: 'Scan data sources for content and metadata',
    typical_duration: 1200,
    resource_profile: 'heavy'
  },
  ANALYSIS: {
    id: 'analysis',
    name: 'Data Analysis',
    description: 'Analyze scanned data for patterns and insights',
    typical_duration: 900,
    resource_profile: 'medium'
  },
  CLASSIFICATION: {
    id: 'classification',
    name: 'Data Classification',
    description: 'Classify data based on content and metadata',
    typical_duration: 600,
    resource_profile: 'medium'
  },
  VALIDATION: {
    id: 'validation',
    name: 'Data Validation',
    description: 'Validate data quality and compliance',
    typical_duration: 450,
    resource_profile: 'light'
  },
  REPORTING: {
    id: 'reporting',
    name: 'Report Generation',
    description: 'Generate reports and documentation',
    typical_duration: 300,
    resource_profile: 'light'
  },
  OPTIMIZATION: {
    id: 'optimization',
    name: 'Performance Optimization',
    description: 'Optimize system performance and resource usage',
    typical_duration: 800,
    resource_profile: 'medium'
  },
  SYNCHRONIZATION: {
    id: 'synchronization',
    name: 'Data Synchronization',
    description: 'Synchronize data across systems',
    typical_duration: 1500,
    resource_profile: 'heavy'
  }
} as const;

// ==========================================
// TRIGGER CONFIGURATIONS
// ==========================================

export const TRIGGER_CONFIGURATIONS = {
  SCHEDULE_PATTERNS: {
    HOURLY: '0 * * * *',
    DAILY: '0 2 * * *',
    WEEKLY: '0 1 * * 1',
    MONTHLY: '0 1 1 * *',
    BUSINESS_HOURS: '0 9-17 * * 1-5',
    OFF_HOURS: '0 18-8 * * *'
  },
  EVENT_TYPES: {
    DATA_SOURCE_ADDED: 'new_data_source_added',
    SCHEMA_CHANGED: 'schema_change_detected',
    COMPLIANCE_VIOLATION: 'compliance_violation_detected',
    PERFORMANCE_DEGRADATION: 'performance_degradation_detected',
    SECURITY_INCIDENT: 'security_incident_detected',
    DATA_QUALITY_ISSUE: 'data_quality_issue_detected'
  },
  THRESHOLD_TYPES: {
    PERFORMANCE: 'performance_threshold',
    RESOURCE_USAGE: 'resource_usage_threshold',
    ERROR_RATE: 'error_rate_threshold',
    DATA_VOLUME: 'data_volume_threshold',
    COMPLIANCE_SCORE: 'compliance_score_threshold'
  }
} as const;

// ==========================================
// RETRY STRATEGIES
// ==========================================

export const RETRY_STRATEGIES = {
  EXPONENTIAL: {
    strategy: 'exponential',
    base_delay: 1000,
    max_delay: 60000,
    multiplier: 2,
    jitter: true
  },
  LINEAR: {
    strategy: 'linear',
    base_delay: 5000,
    max_delay: 30000,
    increment: 5000,
    jitter: false
  },
  FIXED: {
    strategy: 'fixed',
    delay: 10000,
    jitter: true
  },
  IMMEDIATE: {
    strategy: 'immediate',
    delay: 0,
    jitter: false
  }
} as const;

// ==========================================
// WORKFLOW TEMPLATES REGISTRY
// ==========================================

export const WORKFLOW_TEMPLATES_REGISTRY = {
  templates: ENTERPRISE_WORKFLOW_TEMPLATES,
  categories: WORKFLOW_CATEGORIES,
  strategies: ORCHESTRATION_STRATEGIES,
  step_types: WORKFLOW_STEP_TYPES,
  triggers: TRIGGER_CONFIGURATIONS,
  retry_strategies: RETRY_STRATEGIES,
  
  // Helper methods
  getTemplatesByCategory: (category: string) => {
    return Object.values(ENTERPRISE_WORKFLOW_TEMPLATES).filter(
      template => template.category === category
    );
  },
  
  getTemplateById: (id: string) => {
    return ENTERPRISE_WORKFLOW_TEMPLATES[id];
  },
  
  getCompatibleStrategies: (complexity: string) => {
    const strategies = Object.values(ORCHESTRATION_STRATEGIES);
    if (complexity === 'expert') {
      return strategies;
    } else if (complexity === 'high') {
      return strategies.filter(s => s.id !== 'graph_based');
    } else {
      return strategies.filter(s => ['parallel', 'sequential', 'adaptive'].includes(s.id));
    }
  }
};

export default WORKFLOW_TEMPLATES_REGISTRY;

// Export alias for backward compatibility
export const WORKFLOW_TEMPLATES = ENTERPRISE_WORKFLOW_TEMPLATES;

// ==========================================
// FAILURE AND RECOVERY CONFIGURATIONS
// ==========================================

export const FAILURE_DEFAULT_CONFIGURATION = {
  detection: {
    enabled: true,
    timeout_seconds: 300,
    retry_attempts: 3,
    retry_delay_seconds: 30,
    escalation_threshold: 2
  },
  recovery: {
    auto_recovery: true,
    recovery_strategies: ['retry', 'fallback', 'circuit_breaker'],
    max_recovery_time_seconds: 600,
    rollback_on_failure: true
  },
  monitoring: {
    alert_on_failure: true,
    log_failures: true,
    track_recovery_metrics: true,
    notify_stakeholders: true
  },
  circuit_breaker: {
    failure_threshold: 5,
    recovery_timeout_seconds: 60,
    half_open_state: true
  }
} as const;

export const RECOVERY_DEFAULT_CONFIGURATION = {
  strategies: {
    retry: {
      max_attempts: 3,
      backoff_strategy: 'exponential',
      base_delay_ms: 1000,
      max_delay_ms: 30000
    },
    fallback: {
      enabled: true,
      fallback_actions: ['use_cached_data', 'skip_step', 'use_alternative_service'],
      preserve_context: true
    },
    circuit_breaker: {
      enabled: true,
      failure_threshold: 5,
      recovery_timeout_ms: 60000,
      half_open_requests: 3
    },
    compensation: {
      enabled: true,
      compensation_actions: ['rollback_changes', 'restore_state', 'notify_admin'],
      preserve_audit_trail: true
    }
  },
  monitoring: {
    track_recovery_success_rate: true,
    alert_on_recovery_failure: true,
    log_recovery_actions: true,
    metrics_collection: true
  },
  notification: {
    notify_on_recovery_start: true,
    notify_on_recovery_success: true,
    notify_on_recovery_failure: true,
    escalation_channels: ['email', 'slack', 'pagerduty']
  }
} as const;

// ==========================================
// DEPENDENCY DEFAULT CONFIGURATION
// ==========================================

export const DEPENDENCY_DEFAULT_CONFIGURATION = {
  // Dependency resolution settings
  resolution_strategy: 'topological_sort',
  max_dependency_depth: 10,
  circular_dependency_handling: 'error',
  dependency_timeout: 30000,
  
  // Dependency analysis settings
  analysis_depth: 'full',
  include_transitive: true,
  validate_dependencies: true,
  cache_dependency_graph: true,
  
  // Dependency optimization settings
  optimize_execution_order: true,
  parallel_dependency_groups: true,
  resource_allocation_strategy: 'balanced',
  
  // Dependency monitoring settings
  monitor_dependency_health: true,
  alert_on_dependency_failure: true,
  track_dependency_metrics: true,
  
  // Dependency conflict resolution
  conflict_resolution_strategy: 'priority_based',
  auto_resolve_conflicts: false,
  require_manual_approval: true,
  
  // Dependency impact analysis
  impact_analysis_enabled: true,
  risk_assessment_threshold: 'medium',
  compliance_check_enabled: true,
  
  // Dependency security settings
  security_scan_dependencies: true,
  vulnerability_check_enabled: true,
  license_compliance_check: true,
  
  // Dependency governance
  governance_policy_enforcement: true,
  audit_dependency_changes: true,
  version_control_enabled: true
} as const;

// ==========================================
// FAILURE RECOVERY CONSTANTS
// ==========================================

export const TEMPLATE_CATEGORIES = {
  DATA_QUALITY: 'data_quality',
  SECURITY_COMPLIANCE: 'security_compliance',
  PERFORMANCE_OPTIMIZATION: 'performance_optimization',
  SYSTEM_INTEGRATION: 'system_integration',
  BUSINESS_PROCESS: 'business_process',
  INFRASTRUCTURE: 'infrastructure',
  MONITORING_ALERTING: 'monitoring_alerting',
  DISASTER_RECOVERY: 'disaster_recovery',
  COMPLIANCE_AUDIT: 'compliance_audit',
  OPERATIONAL_EXCELLENCE: 'operational_excellence'
} as const;

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
} as const;

export const FAILURE_TYPES = {
  SYSTEM_FAILURE: 'system_failure',
  DATA_CORRUPTION: 'data_corruption',
  NETWORK_TIMEOUT: 'network_timeout',
  AUTHENTICATION_ERROR: 'authentication_error',
  AUTHORIZATION_ERROR: 'authorization_error',
  RESOURCE_EXHAUSTION: 'resource_exhaustion',
  CONFIGURATION_ERROR: 'configuration_error',
  INTEGRATION_FAILURE: 'integration_failure',
  PERFORMANCE_DEGRADATION: 'performance_degradation',
  COMPLIANCE_VIOLATION: 'compliance_violation'
} as const;

export const RECOVERY_STRATEGIES = {
  RETRY: 'retry',
  FALLBACK: 'fallback',
  CIRCUIT_BREAKER: 'circuit_breaker',
  COMPENSATION: 'compensation',
  ROLLBACK: 'rollback',
  ESCALATION: 'escalation',
  AUTOMATIC_RECOVERY: 'automatic_recovery',
  MANUAL_INTERVENTION: 'manual_intervention'
} as const;