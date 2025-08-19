/**
 * ComplianceRule model representing a compliance rule or policy
 */
export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  ruleType: string; // e.g., 'regulatory', 'internal', 'security', 'privacy', 'quality'
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'draft';
  scope: {
    entityTypes: string[]; // Types of entities this rule applies to
    dataSourceIds?: string[]; // Optional specific data sources
  };
  condition: string; // JSON or expression string representing the condition
  remediation?: string; // Instructions for remediation
  reference?: string; // Reference to external standard or regulation
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  version: number;
  isBuiltIn: boolean; // Whether this is a system-provided rule
  isAutomated: boolean; // Whether compliance is checked automatically
  evaluationFrequency?: string; // How often the rule is evaluated (e.g., 'daily', 'weekly')
  lastEvaluatedAt?: string;
  metadata?: Record<string, any>; // Additional metadata
}

/**
 * Rule template for creating new rules
 */
export interface ComplianceRuleTemplate {
  id: string;
  name: string;
  description: string;
  ruleType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  conditionTemplate: string; // Template with placeholders
  parameterDefinitions: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required: boolean;
    defaultValue?: any;
    options?: any[]; // For enum-like parameters
  }>;
  scope: {
    entityTypes: string[];
  };
  remediationTemplate?: string;
  referenceUrl?: string;
  isBuiltIn: boolean;
}

/**
 * Rule evaluation result
 */
export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  evaluatedAt: string;
  status: 'compliant' | 'non_compliant' | 'error' | 'not_applicable';
  entityCount: {
    total: number;
    compliant: number;
    nonCompliant: number;
    error: number;
    notApplicable: number;
  };
  issues?: string[]; // IDs of compliance issues created
  metadata?: Record<string, any>;
  executionTimeMs?: number;
}

/**
 * Rule evaluation history
 */
export interface RuleEvaluationHistory {
  ruleId: string;
  evaluations: Array<{
    evaluatedAt: string;
    status: 'compliant' | 'non_compliant' | 'error' | 'not_applicable';
    complianceRate: number; // Percentage of compliant entities
    issueCount: number;
  }>;
  trend: {
    direction: 'improving' | 'declining' | 'stable';
    changeRate: number; // Percentage change
  };
}

/**
 * Rule change history
 */
export interface RuleChangeHistory {
  ruleId: string;
  changes: Array<{
    version: number;
    changedAt: string;
    changedBy: string;
    changeType: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted';
    changes?: Record<string, { oldValue: any; newValue: any }>;
    comment?: string;
  }>;
}