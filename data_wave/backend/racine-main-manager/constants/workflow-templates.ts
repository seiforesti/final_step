/**
 * Workflow Template Constants
 * ===========================
 *
 * Comprehensive workflow template definitions for the Racine Main Manager,
 * including pre-built workflow templates, common workflow steps, validation
 * rules, and step configurations for cross-group data governance operations.
 */

import { WorkflowDefinition, WorkflowStep } from '../types/racine-core.types';

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

export const WORKFLOW_TEMPLATES = {
  DATA_DISCOVERY: {
    id: 'data_discovery_template',
    name: 'Comprehensive Data Discovery Workflow',
    description: 'Complete data discovery across all connected data sources with classification and cataloging',
    category: 'discovery',
    tags: ['data-discovery', 'classification', 'cataloging'],
    estimatedDuration: 3600, // seconds
    complexity: 'medium',
    groups: ['data_sources', 'classifications', 'advanced_catalog'],
    steps: [
      {
        id: 'scan_data_sources',
        name: 'Scan Data Sources',
        type: 'data_source',
        description: 'Discover and scan all configured data sources',
        config: {
          operation: 'scan_all',
          parallel: true,
          timeout: 1800
        },
        dependencies: [],
        outputs: ['source_metadata', 'schema_info']
      },
      {
        id: 'classify_data',
        name: 'Classify Discovered Data',
        type: 'classification',
        description: 'Apply ML-based classification to discovered data',
        config: {
          operation: 'auto_classify',
          confidence_threshold: 0.8,
          custom_rules: true
        },
        dependencies: ['scan_data_sources'],
        inputs: ['source_metadata', 'schema_info'],
        outputs: ['classification_results']
      },
      {
        id: 'update_catalog',
        name: 'Update Data Catalog',
        type: 'catalog',
        description: 'Update enterprise catalog with discovery results',
        config: {
          operation: 'bulk_update',
          merge_strategy: 'intelligent',
          versioning: true
        },
        dependencies: ['classify_data'],
        inputs: ['classification_results'],
        outputs: ['catalog_updates']
      }
    ],
    parameters: {
      source_filters: {
        type: 'array',
        description: 'Filter data sources by type or pattern',
        default: []
      },
      classification_sensitivity: {
        type: 'string',
        description: 'Sensitivity level for classification',
        default: 'medium',
        options: ['low', 'medium', 'high']
      },
      catalog_visibility: {
        type: 'string',
        description: 'Catalog entry visibility',
        default: 'organization',
        options: ['private', 'team', 'organization', 'public']
      }
    }
  },

  COMPLIANCE_AUDIT: {
    id: 'compliance_audit_template',
    name: 'Regulatory Compliance Audit Workflow',
    description: 'Comprehensive compliance audit across all data assets with reporting',
    category: 'compliance',
    tags: ['compliance', 'audit', 'reporting'],
    estimatedDuration: 7200, // seconds
    complexity: 'high',
    groups: ['compliance_rules', 'advanced_catalog', 'scan_logic'],
    steps: [
      {
        id: 'gather_compliance_requirements',
        name: 'Gather Compliance Requirements',
        type: 'compliance',
        description: 'Collect all applicable compliance rules and frameworks',
        config: {
          operation: 'get_active_rules',
          frameworks: ['GDPR', 'CCPA', 'HIPAA', 'SOX'],
          include_custom: true
        },
        dependencies: [],
        outputs: ['compliance_rules', 'frameworks']
      },
      {
        id: 'scan_data_assets',
        name: 'Scan Data Assets',
        type: 'scan_logic',
        description: 'Perform comprehensive scan of all data assets',
        config: {
          operation: 'full_scan',
          include_metadata: true,
          deep_analysis: true
        },
        dependencies: ['gather_compliance_requirements'],
        inputs: ['compliance_rules'],
        outputs: ['asset_inventory', 'scan_results']
      },
      {
        id: 'validate_compliance',
        name: 'Validate Compliance',
        type: 'compliance',
        description: 'Validate data assets against compliance requirements',
        config: {
          operation: 'validate_compliance',
          severity_levels: ['critical', 'major', 'minor'],
          auto_remediation: false
        },
        dependencies: ['scan_data_assets'],
        inputs: ['asset_inventory', 'scan_results', 'frameworks'],
        outputs: ['violations', 'compliance_score']
      },
      {
        id: 'generate_report',
        name: 'Generate Compliance Report',
        type: 'analytics',
        description: 'Generate comprehensive compliance audit report',
        config: {
          operation: 'generate_report',
          format: 'pdf',
          include_charts: true,
          detailed_findings: true
        },
        dependencies: ['validate_compliance'],
        inputs: ['violations', 'compliance_score'],
        outputs: ['audit_report']
      }
    ],
    parameters: {
      audit_scope: {
        type: 'string',
        description: 'Scope of the compliance audit',
        default: 'full',
        options: ['full', 'incremental', 'targeted']
      },
      frameworks: {
        type: 'array',
        description: 'Compliance frameworks to audit against',
        default: ['GDPR']
      },
      report_format: {
        type: 'string',
        description: 'Format for the audit report',
        default: 'pdf',
        options: ['pdf', 'html', 'excel', 'json']
      }
    }
  },

  DATA_QUALITY_CHECK: {
    id: 'data_quality_check_template',
    name: 'Data Quality Assessment Workflow',
    description: 'Comprehensive data quality assessment with remediation recommendations',
    category: 'quality',
    tags: ['data-quality', 'validation', 'remediation'],
    estimatedDuration: 2400, // seconds
    complexity: 'medium',
    groups: ['data_sources', 'scan_rule_sets', 'ai_service'],
    steps: [
      {
        id: 'define_quality_rules',
        name: 'Define Quality Rules',
        type: 'scan_rule',
        description: 'Define and validate data quality rules',
        config: {
          operation: 'create_quality_rules',
          rule_types: ['completeness', 'accuracy', 'consistency', 'validity'],
          auto_generation: true
        },
        dependencies: [],
        outputs: ['quality_rules']
      },
      {
        id: 'execute_quality_scan',
        name: 'Execute Quality Scan',
        type: 'scan_logic',
        description: 'Execute quality scan across data sources',
        config: {
          operation: 'quality_scan',
          parallel_execution: true,
          sampling_strategy: 'stratified'
        },
        dependencies: ['define_quality_rules'],
        inputs: ['quality_rules'],
        outputs: ['quality_metrics', 'violations']
      },
      {
        id: 'analyze_results',
        name: 'Analyze Quality Results',
        type: 'ai_service',
        description: 'AI-powered analysis of quality results',
        config: {
          operation: 'analyze_quality',
          generate_insights: true,
          recommend_fixes: true
        },
        dependencies: ['execute_quality_scan'],
        inputs: ['quality_metrics', 'violations'],
        outputs: ['quality_insights', 'remediation_plan']
      }
    ],
    parameters: {
      quality_threshold: {
        type: 'number',
        description: 'Minimum quality score threshold',
        default: 0.8,
        min: 0,
        max: 1
      },
      sampling_rate: {
        type: 'number',
        description: 'Sampling rate for quality checks',
        default: 0.1,
        min: 0.01,
        max: 1
      }
    }
  },

  SECURITY_ASSESSMENT: {
    id: 'security_assessment_template',
    name: 'Data Security Assessment Workflow',
    description: 'Comprehensive security assessment with RBAC validation and vulnerability detection',
    category: 'security',
    tags: ['security', 'rbac', 'vulnerability'],
    estimatedDuration: 5400, // seconds
    complexity: 'high',
    groups: ['rbac_system', 'compliance_rules', 'scan_logic'],
    steps: [
      {
        id: 'audit_rbac',
        name: 'Audit RBAC Configuration',
        type: 'rbac',
        description: 'Comprehensive audit of role-based access controls',
        config: {
          operation: 'audit_rbac',
          check_permissions: true,
          validate_assignments: true,
          detect_anomalies: true
        },
        dependencies: [],
        outputs: ['rbac_audit', 'permission_matrix']
      },
      {
        id: 'scan_vulnerabilities',
        name: 'Scan for Vulnerabilities',
        type: 'scan_logic',
        description: 'Scan for security vulnerabilities and exposures',
        config: {
          operation: 'security_scan',
          vulnerability_db: 'latest',
          deep_scan: true
        },
        dependencies: ['audit_rbac'],
        inputs: ['permission_matrix'],
        outputs: ['vulnerabilities', 'risk_assessment']
      },
      {
        id: 'validate_compliance',
        name: 'Validate Security Compliance',
        type: 'compliance',
        description: 'Validate against security compliance frameworks',
        config: {
          operation: 'security_compliance',
          frameworks: ['SOC2', 'ISO27001', 'NIST'],
          severity_mapping: true
        },
        dependencies: ['scan_vulnerabilities'],
        inputs: ['vulnerabilities', 'risk_assessment'],
        outputs: ['compliance_status', 'security_score']
      }
    ],
    parameters: {
      security_frameworks: {
        type: 'array',
        description: 'Security frameworks to validate against',
        default: ['SOC2', 'ISO27001']
      },
      vulnerability_severity: {
        type: 'string',
        description: 'Minimum vulnerability severity to report',
        default: 'medium',
        options: ['low', 'medium', 'high', 'critical']
      }
    }
  },

  DATA_LINEAGE_MAPPING: {
    id: 'data_lineage_mapping_template',
    name: 'Data Lineage Mapping Workflow',
    description: 'Comprehensive data lineage mapping across all systems with impact analysis',
    category: 'lineage',
    tags: ['lineage', 'impact-analysis', 'traceability'],
    estimatedDuration: 4800, // seconds
    complexity: 'high',
    groups: ['advanced_catalog', 'data_sources', 'ai_service'],
    steps: [
      {
        id: 'discover_data_flows',
        name: 'Discover Data Flows',
        type: 'catalog',
        description: 'Discover and map data flows across systems',
        config: {
          operation: 'discover_lineage',
          depth: 'full',
          include_transformations: true
        },
        dependencies: [],
        outputs: ['data_flows', 'transformation_map']
      },
      {
        id: 'analyze_dependencies',
        name: 'Analyze Dependencies',
        type: 'ai_service',
        description: 'AI-powered analysis of data dependencies',
        config: {
          operation: 'analyze_dependencies',
          detect_circular: true,
          impact_scoring: true
        },
        dependencies: ['discover_data_flows'],
        inputs: ['data_flows', 'transformation_map'],
        outputs: ['dependency_graph', 'impact_scores']
      },
      {
        id: 'generate_lineage_map',
        name: 'Generate Lineage Map',
        type: 'catalog',
        description: 'Generate comprehensive lineage map',
        config: {
          operation: 'generate_lineage_map',
          visualization: 'interactive',
          include_metadata: true
        },
        dependencies: ['analyze_dependencies'],
        inputs: ['dependency_graph', 'impact_scores'],
        outputs: ['lineage_map', 'interactive_graph']
      }
    ],
    parameters: {
      lineage_depth: {
        type: 'number',
        description: 'Maximum depth for lineage tracing',
        default: 10,
        min: 1,
        max: 50
      },
      include_historical: {
        type: 'boolean',
        description: 'Include historical lineage data',
        default: true
      }
    }
  }
} as const;

// ============================================================================
// STEP TEMPLATES
// ============================================================================

export const STEP_TEMPLATES = {
  // Data Source Steps
  DATA_SOURCE_SCAN: {
    type: 'data_source',
    name: 'Data Source Scan',
    description: 'Scan a data source for schema and metadata',
    defaultConfig: {
      operation: 'scan',
      include_schema: true,
      include_stats: true,
      timeout: 300
    },
    requiredInputs: [],
    outputs: ['schema', 'metadata', 'statistics'],
    validationRules: [
      {
        field: 'config.timeout',
        rule: 'min:10,max:3600',
        message: 'Timeout must be between 10 and 3600 seconds'
      }
    ]
  },

  DATA_SOURCE_TEST: {
    type: 'data_source',
    name: 'Data Source Test',
    description: 'Test connectivity to a data source',
    defaultConfig: {
      operation: 'test_connection',
      retry_count: 3,
      timeout: 30
    },
    requiredInputs: [],
    outputs: ['connection_status', 'response_time'],
    validationRules: [
      {
        field: 'config.retry_count',
        rule: 'min:1,max:10',
        message: 'Retry count must be between 1 and 10'
      }
    ]
  },

  // Scan Rule Steps
  RULE_VALIDATION: {
    type: 'scan_rule',
    name: 'Rule Validation',
    description: 'Validate scan rules against data patterns',
    defaultConfig: {
      operation: 'validate_rules',
      pattern_matching: 'regex',
      case_sensitive: false
    },
    requiredInputs: ['data_sample'],
    outputs: ['validation_results', 'match_statistics'],
    validationRules: [
      {
        field: 'inputs.data_sample',
        rule: 'required',
        message: 'Data sample is required for rule validation'
      }
    ]
  },

  PATTERN_MATCHING: {
    type: 'scan_rule',
    name: 'Pattern Matching',
    description: 'Execute pattern matching against data',
    defaultConfig: {
      operation: 'pattern_match',
      algorithm: 'advanced',
      threshold: 0.8
    },
    requiredInputs: ['patterns', 'target_data'],
    outputs: ['matches', 'confidence_scores'],
    validationRules: [
      {
        field: 'config.threshold',
        rule: 'min:0,max:1',
        message: 'Threshold must be between 0 and 1'
      }
    ]
  },

  // Classification Steps
  AUTO_CLASSIFICATION: {
    type: 'classification',
    name: 'Auto Classification',
    description: 'Automatically classify data using ML models',
    defaultConfig: {
      operation: 'auto_classify',
      model: 'latest',
      confidence_threshold: 0.8
    },
    requiredInputs: ['data_metadata'],
    outputs: ['classifications', 'confidence_scores'],
    validationRules: [
      {
        field: 'config.confidence_threshold',
        rule: 'min:0,max:1',
        message: 'Confidence threshold must be between 0 and 1'
      }
    ]
  },

  CUSTOM_CLASSIFICATION: {
    type: 'classification',
    name: 'Custom Classification',
    description: 'Apply custom classification rules',
    defaultConfig: {
      operation: 'custom_classify',
      rule_priority: 'high',
      override_existing: false
    },
    requiredInputs: ['classification_rules', 'target_data'],
    outputs: ['custom_classifications'],
    validationRules: [
      {
        field: 'inputs.classification_rules',
        rule: 'required',
        message: 'Classification rules are required'
      }
    ]
  },

  // Compliance Steps
  COMPLIANCE_CHECK: {
    type: 'compliance',
    name: 'Compliance Check',
    description: 'Check data against compliance rules',
    defaultConfig: {
      operation: 'compliance_check',
      frameworks: ['GDPR'],
      severity_threshold: 'medium'
    },
    requiredInputs: ['compliance_rules', 'data_assets'],
    outputs: ['violations', 'compliance_score'],
    validationRules: [
      {
        field: 'inputs.compliance_rules',
        rule: 'required',
        message: 'Compliance rules are required'
      }
    ]
  },

  AUDIT_TRAIL: {
    type: 'compliance',
    name: 'Audit Trail',
    description: 'Generate audit trail for compliance',
    defaultConfig: {
      operation: 'generate_audit_trail',
      retention_period: 2555, // 7 years in days
      encryption: true
    },
    requiredInputs: ['activities'],
    outputs: ['audit_trail', 'trail_metadata'],
    validationRules: [
      {
        field: 'config.retention_period',
        rule: 'min:1',
        message: 'Retention period must be at least 1 day'
      }
    ]
  },

  // Catalog Steps
  CATALOG_UPDATE: {
    type: 'catalog',
    name: 'Catalog Update',
    description: 'Update data catalog with new information',
    defaultConfig: {
      operation: 'update_catalog',
      merge_strategy: 'smart_merge',
      versioning: true
    },
    requiredInputs: ['catalog_entries'],
    outputs: ['update_results', 'version_info'],
    validationRules: [
      {
        field: 'inputs.catalog_entries',
        rule: 'required',
        message: 'Catalog entries are required for update'
      }
    ]
  },

  LINEAGE_TRACE: {
    type: 'catalog',
    name: 'Lineage Trace',
    description: 'Trace data lineage for catalog entries',
    defaultConfig: {
      operation: 'trace_lineage',
      direction: 'both',
      max_depth: 10
    },
    requiredInputs: ['source_entities'],
    outputs: ['lineage_graph', 'dependency_map'],
    validationRules: [
      {
        field: 'config.max_depth',
        rule: 'min:1,max:50',
        message: 'Max depth must be between 1 and 50'
      }
    ]
  },

  // Scan Logic Steps
  UNIFIED_SCAN: {
    type: 'scan_logic',
    name: 'Unified Scan',
    description: 'Execute unified scan across multiple systems',
    defaultConfig: {
      operation: 'unified_scan',
      parallel_execution: true,
      aggregation_strategy: 'intelligent'
    },
    requiredInputs: ['scan_targets'],
    outputs: ['scan_results', 'aggregated_data'],
    validationRules: [
      {
        field: 'inputs.scan_targets',
        rule: 'required',
        message: 'Scan targets are required'
      }
    ]
  },

  INCREMENTAL_SCAN: {
    type: 'scan_logic',
    name: 'Incremental Scan',
    description: 'Execute incremental scan for changed data',
    defaultConfig: {
      operation: 'incremental_scan',
      change_detection: 'timestamp',
      baseline_required: true
    },
    requiredInputs: ['baseline_data'],
    outputs: ['changes_detected', 'delta_results'],
    validationRules: [
      {
        field: 'inputs.baseline_data',
        rule: 'required',
        message: 'Baseline data is required for incremental scan'
      }
    ]
  },

  // RBAC Steps
  PERMISSION_CHECK: {
    type: 'rbac',
    name: 'Permission Check',
    description: 'Check user permissions for resources',
    defaultConfig: {
      operation: 'check_permissions',
      include_inherited: true,
      cache_results: true
    },
    requiredInputs: ['user_context', 'resource_list'],
    outputs: ['permission_matrix', 'access_summary'],
    validationRules: [
      {
        field: 'inputs.user_context',
        rule: 'required',
        message: 'User context is required for permission check'
      }
    ]
  },

  ROLE_ASSIGNMENT: {
    type: 'rbac',
    name: 'Role Assignment',
    description: 'Assign roles to users or groups',
    defaultConfig: {
      operation: 'assign_roles',
      validate_conflicts: true,
      audit_assignment: true
    },
    requiredInputs: ['assignments'],
    outputs: ['assignment_results', 'audit_log'],
    validationRules: [
      {
        field: 'inputs.assignments',
        rule: 'required',
        message: 'Role assignments are required'
      }
    ]
  },

  // AI Service Steps
  AI_ANALYSIS: {
    type: 'ai_service',
    name: 'AI Analysis',
    description: 'Perform AI-powered analysis on data',
    defaultConfig: {
      operation: 'analyze',
      model_type: 'classification',
      confidence_threshold: 0.7
    },
    requiredInputs: ['analysis_data'],
    outputs: ['ai_insights', 'recommendations'],
    validationRules: [
      {
        field: 'config.confidence_threshold',
        rule: 'min:0,max:1',
        message: 'Confidence threshold must be between 0 and 1'
      }
    ]
  },

  ANOMALY_DETECTION: {
    type: 'ai_service',
    name: 'Anomaly Detection',
    description: 'Detect anomalies using AI models',
    defaultConfig: {
      operation: 'detect_anomalies',
      sensitivity: 'medium',
      time_window: '24h'
    },
    requiredInputs: ['time_series_data'],
    outputs: ['anomalies', 'anomaly_scores'],
    validationRules: [
      {
        field: 'inputs.time_series_data',
        rule: 'required',
        message: 'Time series data is required for anomaly detection'
      }
    ]
  },

  // Analytics Steps
  REPORT_GENERATION: {
    type: 'analytics',
    name: 'Report Generation',
    description: 'Generate analytical reports',
    defaultConfig: {
      operation: 'generate_report',
      format: 'pdf',
      include_visualizations: true
    },
    requiredInputs: ['report_data'],
    outputs: ['generated_report', 'report_metadata'],
    validationRules: [
      {
        field: 'inputs.report_data',
        rule: 'required',
        message: 'Report data is required for generation'
      }
    ]
  },

  METRIC_CALCULATION: {
    type: 'analytics',
    name: 'Metric Calculation',
    description: 'Calculate business and technical metrics',
    defaultConfig: {
      operation: 'calculate_metrics',
      aggregation_period: '1d',
      include_trends: true
    },
    requiredInputs: ['raw_data'],
    outputs: ['calculated_metrics', 'trend_analysis'],
    validationRules: [
      {
        field: 'inputs.raw_data',
        rule: 'required',
        message: 'Raw data is required for metric calculation'
      }
    ]
  }
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  WORKFLOW_STRUCTURE: [
    {
      rule: 'required_fields',
      fields: ['name', 'steps'],
      message: 'Workflow must have a name and at least one step'
    },
    {
      rule: 'unique_step_ids',
      message: 'All step IDs must be unique within the workflow'
    },
    {
      rule: 'valid_dependencies',
      message: 'All step dependencies must reference existing steps'
    },
    {
      rule: 'no_circular_dependencies',
      message: 'Workflow cannot contain circular dependencies'
    }
  ],

  STEP_CONFIGURATION: [
    {
      rule: 'required_step_fields',
      fields: ['id', 'name', 'type'],
      message: 'Step must have id, name, and type'
    },
    {
      rule: 'valid_step_type',
      validTypes: [
        'data_source', 'scan_rule', 'classification', 'compliance',
        'catalog', 'scan_logic', 'rbac', 'ai_service', 'analytics', 'custom'
      ],
      message: 'Step type must be one of the supported types'
    },
    {
      rule: 'input_output_consistency',
      message: 'Step inputs must match outputs from dependency steps'
    }
  ],

  PARAMETER_VALIDATION: [
    {
      rule: 'required_parameters',
      message: 'All required parameters must be provided'
    },
    {
      rule: 'parameter_types',
      message: 'Parameters must match expected types'
    },
    {
      rule: 'parameter_ranges',
      message: 'Numeric parameters must be within valid ranges'
    }
  ],

  PERFORMANCE_CONSTRAINTS: [
    {
      rule: 'max_execution_time',
      limit: 86400, // 24 hours
      message: 'Workflow execution time cannot exceed 24 hours'
    },
    {
      rule: 'max_parallel_steps',
      limit: 50,
      message: 'Cannot execute more than 50 steps in parallel'
    },
    {
      rule: 'resource_limits',
      message: 'Workflow must not exceed system resource limits'
    }
  ]
} as const;

// ============================================================================
// WORKFLOW CATEGORIES
// ============================================================================

export const WORKFLOW_CATEGORIES = {
  DISCOVERY: {
    id: 'discovery',
    name: 'Data Discovery',
    description: 'Workflows for discovering and cataloging data assets',
    icon: 'Search',
    color: '#3B82F6'
  },
  COMPLIANCE: {
    id: 'compliance',
    name: 'Compliance & Audit',
    description: 'Workflows for compliance validation and auditing',
    icon: 'Shield',
    color: '#F59E0B'
  },
  QUALITY: {
    id: 'quality',
    name: 'Data Quality',
    description: 'Workflows for data quality assessment and improvement',
    icon: 'CheckCircle',
    color: '#10B981'
  },
  SECURITY: {
    id: 'security',
    name: 'Security Assessment',
    description: 'Workflows for security validation and vulnerability assessment',
    icon: 'Lock',
    color: '#EF4444'
  },
  LINEAGE: {
    id: 'lineage',
    name: 'Data Lineage',
    description: 'Workflows for mapping and analyzing data lineage',
    icon: 'GitBranch',
    color: '#8B5CF6'
  },
  ANALYTICS: {
    id: 'analytics',
    name: 'Analytics & Reporting',
    description: 'Workflows for generating insights and reports',
    icon: 'BarChart',
    color: '#06B6D4'
  },
  MAINTENANCE: {
    id: 'maintenance',
    name: 'System Maintenance',
    description: 'Workflows for system maintenance and optimization',
    icon: 'Settings',
    color: '#6B7280'
  },
  CUSTOM: {
    id: 'custom',
    name: 'Custom Workflows',
    description: 'User-defined custom workflows',
    icon: 'Puzzle',
    color: '#84CC16'
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getWorkflowTemplate(templateId: string) {
  return Object.values(WORKFLOW_TEMPLATES).find(template => template.id === templateId);
}

export function getStepTemplate(stepType: string, templateName?: string) {
  if (templateName) {
    return STEP_TEMPLATES[templateName as keyof typeof STEP_TEMPLATES];
  }
  
  return Object.values(STEP_TEMPLATES).find(template => template.type === stepType);
}

export function getWorkflowsByCategory(categoryId: string) {
  return Object.values(WORKFLOW_TEMPLATES).filter(template => template.category === categoryId);
}

export function getWorkflowsByGroup(groupId: string) {
  return Object.values(WORKFLOW_TEMPLATES).filter(template => 
    template.groups.includes(groupId)
  );
}

export function validateWorkflowStep(step: WorkflowStep): string[] {
  const errors: string[] = [];
  
  // Check required fields
  if (!step.id) errors.push('Step ID is required');
  if (!step.name) errors.push('Step name is required');
  if (!step.type) errors.push('Step type is required');
  
  // Check step type validity
  const validTypes = VALIDATION_RULES.STEP_CONFIGURATION.find(rule => rule.rule === 'valid_step_type')?.validTypes;
  if (validTypes && !validTypes.includes(step.type)) {
    errors.push(`Invalid step type: ${step.type}`);
  }
  
  return errors;
}

export function estimateWorkflowDuration(steps: WorkflowStep[]): number {
  // Simple estimation based on step types and dependencies
  let totalDuration = 0;
  const stepDurations = new Map<string, number>();
  
  steps.forEach(step => {
    // Base duration by step type
    let baseDuration = 60; // 1 minute default
    
    switch (step.type) {
      case 'data_source':
        baseDuration = step.config?.timeout || 300;
        break;
      case 'scan_logic':
        baseDuration = 600; // 10 minutes
        break;
      case 'ai_service':
        baseDuration = 180; // 3 minutes
        break;
      case 'compliance':
        baseDuration = 300; // 5 minutes
        break;
      case 'analytics':
        baseDuration = 120; // 2 minutes
        break;
    }
    
    stepDurations.set(step.id, baseDuration);
  });
  
  // Calculate critical path (simplified)
  const visited = new Set<string>();
  const calculatePath = (stepId: string): number => {
    if (visited.has(stepId)) return 0;
    visited.add(stepId);
    
    const step = steps.find(s => s.id === stepId);
    if (!step) return 0;
    
    const stepDuration = stepDurations.get(stepId) || 60;
    
    if (!step.dependencies || step.dependencies.length === 0) {
      return stepDuration;
    }
    
    const maxDependencyDuration = Math.max(
      ...step.dependencies.map(depId => calculatePath(depId))
    );
    
    return maxDependencyDuration + stepDuration;
  };
  
  // Find end steps (steps with no dependents)
  const dependentSteps = new Set(
    steps.flatMap(step => step.dependencies || [])
  );
  const endSteps = steps.filter(step => !dependentSteps.has(step.id));
  
  totalDuration = Math.max(
    ...endSteps.map(step => calculatePath(step.id))
  );
  
  return totalDuration;
}

export function getWorkflowComplexity(steps: WorkflowStep[]): 'low' | 'medium' | 'high' {
  const stepCount = steps.length;
  const dependencyCount = steps.reduce((count, step) => 
    count + (step.dependencies?.length || 0), 0
  );
  const uniqueTypes = new Set(steps.map(step => step.type)).size;
  
  const complexityScore = stepCount + (dependencyCount * 2) + (uniqueTypes * 3);
  
  if (complexityScore <= 10) return 'low';
  if (complexityScore <= 25) return 'medium';
  return 'high';
}