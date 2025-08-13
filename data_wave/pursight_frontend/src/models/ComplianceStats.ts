/**
 * ComplianceStats model representing statistics for compliance management
 */
export interface ComplianceStats {
  // General compliance statistics
  overallComplianceScore: number; // 0-100
  complianceByFramework: Record<string, number>; // Framework ID to compliance score
  complianceByCategory: Record<string, number>; // Category to compliance score
  complianceByDataSource: Record<string, number>; // Data source ID to compliance score
  
  // Rule statistics
  totalRules: number;
  activeRules: number;
  inactiveRules: number;
  rulesByType: Record<string, number>; // Rule type to count
  rulesBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  // Issue statistics
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  waivedIssues: number;
  issuesByStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    waived: number;
  };
  issuesBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  issuesByRule: Record<string, number>; // Rule ID to issue count
  issuesByDataSource: Record<string, number>; // Data source ID to issue count
  issuesByEntityType: Record<string, number>; // Entity type to issue count
  
  // Time-based statistics
  issuesLastDay: number;
  issuesLastWeek: number;
  issuesLastMonth: number;
  resolvedLastDay: number;
  resolvedLastWeek: number;
  resolvedLastMonth: number;
  
  // Resolution statistics
  averageResolutionTimeInDays: number;
  resolutionTimeByPriority: {
    critical: number; // in days
    high: number; // in days
    medium: number; // in days
    low: number; // in days
  };
  oldestOpenIssueInDays: number;
  
  // Regulatory framework statistics
  regulatoryFrameworks: Array<{
    id: string;
    name: string;
    complianceScore: number; // 0-100
    issueCount: number;
    criticalIssueCount: number;
  }>;
  
  // Risk statistics
  riskExposure: {
    overall: number; // 0-100
    byCategory: Record<string, number>; // Category to risk score
    byDataSource: Record<string, number>; // Data source ID to risk score
  };
  
  // Trend statistics
  complianceTrend: Array<{
    period: string; // e.g., '2023-01-01', '2023-W01', '2023-01'
    complianceScore: number;
    openIssues: number;
    resolvedIssues: number;
  }>;
  
  // Time-based information
  lastUpdated: string;
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Compliance posture for a specific regulatory framework
 */
export interface RegulatoryCompliancePosture {
  frameworkId: string;
  frameworkName: string;
  frameworkVersion: string;
  overallComplianceScore: number; // 0-100
  assessmentDate: string;
  nextAssessmentDue?: string;
  
  // Compliance by section
  sections: Array<{
    id: string;
    name: string;
    description: string;
    complianceScore: number; // 0-100
    issueCount: number;
    criticalIssueCount: number;
    controls: Array<{
      id: string;
      name: string;
      description: string;
      status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
      evidence?: string;
      issueIds?: string[];
    }>;
  }>;
  
  // Gap analysis
  gapAnalysis: {
    compliantControls: number;
    nonCompliantControls: number;
    partiallyCompliantControls: number;
    notApplicableControls: number;
    topGaps: Array<{
      controlId: string;
      controlName: string;
      gap: string;
      remediation: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  
  // Trend
  complianceTrend: Array<{
    assessmentDate: string;
    complianceScore: number;
    issueCount: number;
  }>;
}

/**
 * Compliance audit statistics
 */
export interface ComplianceAuditStats {
  totalAudits: number;
  completedAudits: number;
  inProgressAudits: number;
  scheduledAudits: number;
  auditsByType: Record<string, number>; // Audit type to count
  auditsByStatus: {
    completed: number;
    in_progress: number;
    scheduled: number;
    cancelled: number;
  };
  auditsByOutcome: {
    passed: number;
    failed: number;
    partial: number;
  };
  recentAudits: Array<{
    id: string;
    name: string;
    type: string;
    status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled';
    startDate: string;
    endDate?: string;
    outcome?: 'passed' | 'failed' | 'partial';
    findingCount?: number;
    criticalFindingCount?: number;
  }>;
  auditTrend: Array<{
    period: string; // e.g., '2023-01-01', '2023-W01', '2023-01'
    auditCount: number;
    passRate: number; // Percentage
    findingCount: number;
  }>;
}

/**
 * Data subject rights request statistics
 */
export interface DSRStats {
  totalRequests: number;
  openRequests: number;
  completedRequests: number;
  overdueRequests: number;
  requestsByType: {
    access: number;
    rectification: number;
    erasure: number;
    portability: number;
    objection: number;
    restriction: number;
    automated_decision: number;
  };
  requestsByStatus: {
    new: number;
    in_progress: number;
    completed: number;
    rejected: number;
    cancelled: number;
  };
  averageCompletionTimeInDays: number;
  completionTimeByRequestType: Record<string, number>; // Request type to days
  requestTrend: Array<{
    period: string; // e.g., '2023-01-01', '2023-W01', '2023-01'
    requestCount: number;
    completionRate: number; // Percentage
    averageCompletionTime: number; // in days
  }>;
}