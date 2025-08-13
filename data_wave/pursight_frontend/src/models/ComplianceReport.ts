/**
 * ComplianceReport model representing a compliance report
 */
export interface ComplianceReport {
  id: string;
  name: string;
  description?: string;
  reportType: string; // e.g., 'regulatory', 'audit', 'executive', 'operational'
  format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
  generatedAt: string;
  generatedBy: string;
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  url?: string; // URL to download the report
  expiresAt?: string; // When the report URL expires
  parameters: {
    timeRange: {
      startDate: string;
      endDate: string;
    };
    dataSourceIds?: string[];
    entityTypes?: string[];
    ruleTypes?: string[];
    includeResolvedIssues?: boolean;
    includeWaivedIssues?: boolean;
    [key: string]: any; // Additional parameters
  };
  metadata?: Record<string, any>; // Additional metadata
  tags?: string[];
  scheduleId?: string; // ID of the schedule if this is a scheduled report
}

/**
 * Report schedule configuration
 */
export interface ReportSchedule {
  id: string;
  name: string;
  description?: string;
  reportType: string;
  format: 'pdf' | 'excel' | 'csv' | 'html' | 'json';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  cronExpression?: string; // For custom schedules
  parameters: Record<string, any>; // Report-specific parameters
  recipients: Array<{
    type: 'email' | 'slack' | 'teams' | 'webhook';
    value: string;
  }>;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'failure' | 'partial_success';
  nextRunAt?: string;
}

/**
 * Compliance summary for dashboards
 */
export interface ComplianceSummary {
  overallComplianceRate: number; // Percentage
  criticalIssuesCount: number;
  highIssuesCount: number;
  totalOpenIssues: number;
  totalResolvedIssues: number;
  issuesByRuleType: Record<string, number>;
  issuesByDataSource: Record<string, number>;
  issuesByEntityType: Record<string, number>;
  topRulesWithIssues: Array<{
    ruleId: string;
    ruleName: string;
    issueCount: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  complianceTrend: Array<{
    period: string; // e.g., '2023-01', '2023-Q1', etc.
    complianceRate: number;
    issueCount: number;
  }>;
  averageResolutionTimeInDays: number;
  riskScore: number; // Calculated risk score based on issues
}

/**
 * Regulatory framework compliance status
 */
export interface RegulatoryCompliance {
  frameworkId: string;
  frameworkName: string; // e.g., 'GDPR', 'HIPAA', 'SOX', 'PCI DSS'
  version: string;
  complianceRate: number; // Percentage
  lastAssessedAt: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed';
  sections: Array<{
    id: string;
    name: string; // e.g., 'Article 5', 'Section 164.308'
    complianceRate: number;
    issueCount: number;
    status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed';
  }>;
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  nextAssessmentDue?: string;
  assignedTo?: string;
}

/**
 * Compliance audit log
 */
export interface ComplianceAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  actionType: string; // e.g., 'rule_created', 'issue_resolved', 'report_generated'
  entityType: string; // e.g., 'rule', 'issue', 'report'
  entityId: string;
  details: Record<string, any>; // Action-specific details
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Compliance dashboard widget configuration
 */
export interface ComplianceDashboardWidget {
  id: string;
  type: 'compliance_rate' | 'issues_by_severity' | 'issues_by_data_source' | 
        'issues_trend' | 'top_rules' | 'regulatory_compliance' | 'resolution_time' | 
        'custom';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: {
    timeRange?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
    customStartDate?: string;
    customEndDate?: string;
    dataSourceIds?: string[];
    ruleTypes?: string[];
    entityTypes?: string[];
    limit?: number; // For top N widgets
    showLabels?: boolean;
    showLegend?: boolean;
    chartType?: 'bar' | 'line' | 'pie' | 'table' | 'card';
    [key: string]: any; // Additional configuration
  };
  refreshInterval?: number; // In seconds
}