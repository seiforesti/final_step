/**
 * ComplianceIssue model representing a compliance violation or issue
 */
export interface ComplianceIssue {
  id: string;
  ruleId: string;
  ruleName: string;
  entityId: string;
  entityType: string;
  entityName: string;
  dataSourceId?: string;
  dataSourceName?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'resolved' | 'in_progress' | 'waived';
  description: string;
  detectedAt: string;
  detectedBy: string; // User ID or system ID
  detectionMethod: 'automated' | 'manual';
  remediation?: string; // Suggested remediation steps
  assignedTo?: string; // User ID
  dueDate?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  waivedAt?: string;
  waivedBy?: string;
  waiverJustification?: string;
  waiverExpiresAt?: string;
  tags?: string[];
  metadata?: Record<string, any>; // Additional metadata
  evidence?: Array<{
    type: string; // e.g., 'screenshot', 'log', 'report'
    url: string;
    description?: string;
    timestamp: string;
  }>;
  relatedIssues?: string[]; // IDs of related issues
}

/**
 * Issue resolution details
 */
export interface IssueResolution {
  issueId: string;
  resolvedAt: string;
  resolvedBy: string;
  resolutionType: 'fixed' | 'false_positive' | 'accepted_risk' | 'waived';
  notes: string;
  evidence?: Array<{
    type: string;
    url: string;
    description?: string;
  }>;
  verification?: {
    verifiedAt?: string;
    verifiedBy?: string;
    status: 'verified' | 'rejected' | 'pending';
    notes?: string;
  };
}

/**
 * Issue comment for collaboration
 */
export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
  isInternal: boolean; // Whether visible only to internal users
}

/**
 * Issue activity log
 */
export interface IssueActivity {
  id: string;
  issueId: string;
  activityType: string; // e.g., 'status_change', 'assignment', 'comment', 'resolution'
  performedBy: string;
  performedAt: string;
  details: Record<string, any>; // Activity-specific details
}

/**
 * Issue statistics
 */
export interface IssueStatistics {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    waived: number;
  };
  byDataSource?: Record<string, number>;
  byEntityType?: Record<string, number>;
  byRule?: Record<string, number>;
  trend: {
    periods: string[]; // Time periods (e.g., dates)
    values: number[]; // Issue counts for each period
  };
  averageResolutionTimeInDays?: number;
  oldestOpenIssueInDays?: number;
}

/**
 * Issue filter criteria
 */
export interface IssueFilterCriteria {
  ruleIds?: string[];
  entityTypes?: string[];
  dataSourceIds?: string[];
  severities?: Array<'critical' | 'high' | 'medium' | 'low'>;
  statuses?: Array<'open' | 'resolved' | 'in_progress' | 'waived'>;
  assignedTo?: string[];
  detectedAfter?: string;
  detectedBefore?: string;
  resolvedAfter?: string;
  resolvedBefore?: string;
  tags?: string[];
  searchText?: string;
}