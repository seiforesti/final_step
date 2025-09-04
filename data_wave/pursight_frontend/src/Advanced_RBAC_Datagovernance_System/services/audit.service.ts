// Audit Service - Maps to backend audit logging and compliance tracking
// Provides comprehensive audit trail management, compliance reporting, and forensic analysis

import { rbacApiService, ApiResponse, PaginatedResponse } from './rbac-api.service';
import { RBAC_ENDPOINTS } from '../constants/api.constants';
import type {
  AuditLog,
  AuditLogEntry,
  AuditReport,
  ComplianceReport,
  AuditAnalytics,
  AuditAlert,
  AuditPolicy,
  AuditTemplate,
  AuditExport,
  SecurityEvent,
  PrivacyEvent,
  AccessEvent,
  ChangeEvent,
  SystemEvent
} from '../types/audit.types';
import type { User } from '../types/user.types';

export interface AuditFilters {
  search?: string;
  entityType?: 'user' | 'role' | 'permission' | 'resource' | 'group' | 'policy';
  entityId?: number;
  action?: string;
  actorId?: number;
  outcome?: 'success' | 'failure' | 'warning';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
  tags?: string[];
  hasChanges?: boolean;
  hasNotes?: boolean;
}

export interface AuditPagination {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditReportRequest {
  title: string;
  description?: string;
  filters: AuditFilters;
  timeRange: {
    start: string;
    end: string;
  };
  includeDetails?: boolean;
  includeMetrics?: boolean;
  includeRecommendations?: boolean;
  format?: 'pdf' | 'excel' | 'csv' | 'json';
  recipients?: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time?: string;
    timezone?: string;
  };
}

export class AuditService {
  // === Core Audit Log Operations ===

  /**
   * Get audit logs with advanced filtering and pagination
   */
  async getAuditLogs(
    filters: AuditFilters = {},
    pagination: AuditPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    const params = new URLSearchParams();
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    // Apply pagination
    Object.entries(pagination).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `${RBAC_ENDPOINTS.AUDIT_LOGS}?${queryString}` : RBAC_ENDPOINTS.AUDIT_LOGS;
    
    return rbacApiService.get<PaginatedResponse<AuditLog>>(url);
  }

  /**
   * Get audit log entry by ID
   */
  async getAuditLogEntry(
    logId: number,
    includeDetails = true
  ): Promise<ApiResponse<AuditLogEntry>> {
    const params = includeDetails ? '?include_details=true' : '';
    return rbacApiService.get<AuditLogEntry>(`${RBAC_ENDPOINTS.AUDIT_LOGS}/${logId}${params}`);
  }

  /**
   * Filter audit logs with advanced criteria
   */
  async filterAuditLogs(filterCriteria: {
    conditions: Array<{
      field: string;
      operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startswith' | 'endswith' | 'in' | 'between';
      value: any;
      values?: any[];
    }>;
    logicalOperator?: 'AND' | 'OR';
    groupBy?: string[];
    aggregations?: Array<{
      field: string;
      function: 'count' | 'sum' | 'avg' | 'min' | 'max';
      alias?: string;
    }>;
  }): Promise<ApiResponse<{
    logs: AuditLog[];
    total: number;
    aggregations: Record<string, any>;
    groupedResults: Record<string, any>;
  }>> {
    return rbacApiService.post(RBAC_ENDPOINTS.AUDIT_LOGS_FILTER, filterCriteria);
  }

  /**
   * Get entity audit history
   */
  async getEntityAuditHistory(
    entityType: string,
    entityId: number,
    timeRange?: {
      start: string;
      end: string;
    },
    includeRelated = false
  ): Promise<ApiResponse<{
    timeline: AuditLog[];
    changes: Array<{
      timestamp: string;
      field: string;
      oldValue: any;
      newValue: any;
      actor: User;
      reason?: string;
    }>;
    relatedEvents: AuditLog[];
    summary: {
      totalEvents: number;
      changeCount: number;
      accessCount: number;
      lastModified: string;
      lastAccessed: string;
    };
  }>> {
    const params = new URLSearchParams({
      entity_type: entityType,
      entity_id: entityId.toString(),
      include_related: includeRelated.toString()
    });
    
    if (timeRange) {
      params.append('start_date', timeRange.start);
      params.append('end_date', timeRange.end);
    }
    
    return rbacApiService.get(`${RBAC_ENDPOINTS.AUDIT_LOGS_ENTITY_HISTORY}?${params.toString()}`);
  }

  // === Event-Specific Audit Operations ===

  /**
   * Get access events
   */
  async getAccessEvents(
    filters: {
      userId?: number;
      resourceType?: string;
      resourceId?: string;
      action?: string;
      outcome?: 'granted' | 'denied';
      timeRange?: {
        start: string;
        end: string;
      };
    } = {},
    pagination: AuditPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<AccessEvent>>> {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'start' in value) {
          params.append('start_date', value.start);
          params.append('end_date', value.end);
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return rbacApiService.get<PaginatedResponse<AccessEvent>>(`${RBAC_ENDPOINTS.AUDIT_LOGS}/access?${params.toString()}`);
  }

  /**
   * Get change events
   */
  async getChangeEvents(
    filters: {
      entityType?: string;
      entityId?: number;
      changeType?: 'create' | 'update' | 'delete';
      field?: string;
      actorId?: number;
      timeRange?: {
        start: string;
        end: string;
      };
    } = {},
    pagination: AuditPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<ChangeEvent>>> {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'start' in value) {
          params.append('start_date', value.start);
          params.append('end_date', value.end);
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return rbacApiService.get<PaginatedResponse<ChangeEvent>>(`${RBAC_ENDPOINTS.AUDIT_LOGS}/changes?${params.toString()}`);
  }

  /**
   * Get security events
   */
  async getSecurityEvents(
    filters: {
      eventType?: 'login_failure' | 'privilege_escalation' | 'suspicious_access' | 'policy_violation';
      severity?: 'low' | 'medium' | 'high' | 'critical';
      userId?: number;
      ipAddress?: string;
      timeRange?: {
        start: string;
        end: string;
      };
    } = {},
    pagination: AuditPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<SecurityEvent>>> {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'start' in value) {
          params.append('start_date', value.start);
          params.append('end_date', value.end);
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return rbacApiService.get<PaginatedResponse<SecurityEvent>>(`${RBAC_ENDPOINTS.AUDIT_LOGS}/security?${params.toString()}`);
  }

  /**
   * Get privacy events (GDPR, CCPA compliance)
   */
  async getPrivacyEvents(
    filters: {
      dataSubjectId?: number;
      eventType?: 'data_access' | 'data_export' | 'data_deletion' | 'consent_change';
      legalBasis?: string;
      timeRange?: {
        start: string;
        end: string;
      };
    } = {},
    pagination: AuditPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<PrivacyEvent>>> {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'start' in value) {
          params.append('start_date', value.start);
          params.append('end_date', value.end);
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return rbacApiService.get<PaginatedResponse<PrivacyEvent>>(`${RBAC_ENDPOINTS.AUDIT_LOGS}/privacy?${params.toString()}`);
  }

  // === Audit Analytics and Reporting ===

  /**
   * Get audit analytics dashboard data
   */
  async getAuditAnalytics(
    timeRange: {
      start: string;
      end: string;
    },
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<AuditAnalytics>> {
    const params = new URLSearchParams({
      start_date: timeRange.start,
      end_date: timeRange.end,
      granularity
    });
    
    return rbacApiService.get<AuditAnalytics>(`${RBAC_ENDPOINTS.AUDIT_LOGS}/analytics?${params.toString()}`);
  }

  /**
   * Generate audit report
   */
  async generateAuditReport(request: AuditReportRequest): Promise<ApiResponse<{
    reportId: string;
    status: 'generating' | 'completed' | 'failed';
    downloadUrl?: string;
    estimatedCompletion?: string;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/reports`, request);
  }

  /**
   * Get audit report status
   */
  async getAuditReportStatus(reportId: string): Promise<ApiResponse<{
    reportId: string;
    status: 'generating' | 'completed' | 'failed';
    progress: number;
    downloadUrl?: string;
    error?: string;
    metadata: {
      title: string;
      generatedAt: string;
      size?: number;
      recordCount?: number;
    };
  }>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.AUDIT_LOGS}/reports/${reportId}/status`);
  }

  /**
   * Download audit report
   */
  async downloadAuditReport(reportId: string): Promise<ApiResponse<Blob>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.AUDIT_LOGS}/reports/${reportId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    framework: 'SOX' | 'GDPR' | 'HIPAA' | 'SOC2' | 'ISO27001' | 'NIST',
    timeRange: {
      start: string;
      end: string;
    },
    includeRemediation = true
  ): Promise<ApiResponse<ComplianceReport>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/compliance`, {
      framework,
      time_range: timeRange,
      include_remediation: includeRemediation
    });
  }

  // === Audit Alerts and Monitoring ===

  /**
   * Get audit alerts
   */
  async getAuditAlerts(
    filters: {
      severity?: 'low' | 'medium' | 'high' | 'critical';
      status?: 'active' | 'acknowledged' | 'resolved';
      alertType?: string;
      timeRange?: {
        start: string;
        end: string;
      };
    } = {},
    pagination: AuditPagination = {}
  ): Promise<ApiResponse<PaginatedResponse<AuditAlert>>> {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...pagination }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && 'start' in value) {
          params.append('start_date', value.start);
          params.append('end_date', value.end);
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return rbacApiService.get<PaginatedResponse<AuditAlert>>(`${RBAC_ENDPOINTS.AUDIT_LOGS}/alerts?${params.toString()}`);
  }

  /**
   * Create audit alert rule
   */
  async createAuditAlert(alert: {
    name: string;
    description?: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    actions: Array<{
      type: 'email' | 'webhook' | 'slack';
      config: Record<string, any>;
    }>;
    isEnabled: boolean;
  }): Promise<ApiResponse<AuditAlert>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/alerts`, alert);
  }

  /**
   * Update audit alert
   */
  async updateAuditAlert(alertId: number, updates: Partial<AuditAlert>): Promise<ApiResponse<AuditAlert>> {
    return rbacApiService.put(`${RBAC_ENDPOINTS.AUDIT_LOGS}/alerts/${alertId}`, updates);
  }

  /**
   * Acknowledge audit alert
   */
  async acknowledgeAuditAlert(
    alertId: number,
    note?: string
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/alerts/${alertId}/acknowledge`, {
      note: note || null
    });
  }

  /**
   * Resolve audit alert
   */
  async resolveAuditAlert(
    alertId: number,
    resolution: string
  ): Promise<ApiResponse<void>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/alerts/${alertId}/resolve`, {
      resolution
    });
  }

  // === Audit Policies and Configuration ===

  /**
   * Get audit policies
   */
  async getAuditPolicies(): Promise<ApiResponse<AuditPolicy[]>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.AUDIT_LOGS}/policies`);
  }

  /**
   * Create audit policy
   */
  async createAuditPolicy(policy: {
    name: string;
    description?: string;
    entityTypes: string[];
    actions: string[];
    conditions?: Record<string, any>;
    retentionDays: number;
    isEnabled: boolean;
    priority: number;
  }): Promise<ApiResponse<AuditPolicy>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/policies`, policy);
  }

  /**
   * Update audit policy
   */
  async updateAuditPolicy(policyId: number, updates: Partial<AuditPolicy>): Promise<ApiResponse<AuditPolicy>> {
    return rbacApiService.put(`${RBAC_ENDPOINTS.AUDIT_LOGS}/policies/${policyId}`, updates);
  }

  /**
   * Test audit policy
   */
  async testAuditPolicy(
    policyId: number,
    testEvents: Array<{
      entityType: string;
      action: string;
      context: Record<string, any>;
    }>
  ): Promise<ApiResponse<Array<{
    event: any;
    matched: boolean;
    capturedData: Record<string, any>;
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/policies/${policyId}/test`, {
      test_events: testEvents
    });
  }

  // === Forensic Analysis ===

  /**
   * Perform forensic analysis
   */
  async performForensicAnalysis(
    incidentId: string,
    analysisType: 'access_pattern' | 'privilege_escalation' | 'data_breach' | 'policy_violation',
    timeRange: {
      start: string;
      end: string;
    },
    entities?: Array<{
      type: string;
      id: number;
    }>
  ): Promise<ApiResponse<{
    analysisId: string;
    findings: Array<{
      type: 'anomaly' | 'violation' | 'risk' | 'evidence';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      evidence: AuditLog[];
      recommendations: string[];
    }>;
    timeline: Array<{
      timestamp: string;
      event: AuditLog;
      significance: 'low' | 'medium' | 'high';
      relatedEvents: AuditLog[];
    }>;
    riskScore: number;
    summary: string;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/forensics`, {
      incident_id: incidentId,
      analysis_type: analysisType,
      time_range: timeRange,
      entities: entities || []
    });
  }

  /**
   * Get anomaly detection results
   */
  async getAnomalyDetection(
    timeRange: {
      start: string;
      end: string;
    },
    sensitivity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ApiResponse<Array<{
    type: 'unusual_access' | 'time_anomaly' | 'volume_anomaly' | 'pattern_deviation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    confidence: number;
    affectedEntities: Array<{
      type: string;
      id: number;
      name: string;
    }>;
    evidence: AuditLog[];
    baselineData: Record<string, any>;
    currentData: Record<string, any>;
  }>>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/anomalies`, {
      time_range: timeRange,
      sensitivity
    });
  }

  // === Data Retention and Archival ===

  /**
   * Get retention policies
   */
  async getRetentionPolicies(): Promise<ApiResponse<Array<{
    id: number;
    name: string;
    entityTypes: string[];
    retentionDays: number;
    archivalStrategy: 'delete' | 'archive' | 'compress';
    isActive: boolean;
    lastApplied: string;
  }>>> {
    return rbacApiService.get(`${RBAC_ENDPOINTS.AUDIT_LOGS}/retention`);
  }

  /**
   * Apply retention policy
   */
  async applyRetentionPolicy(
    policyId: number,
    dryRun = false
  ): Promise<ApiResponse<{
    affected: number;
    deleted: number;
    archived: number;
    errors: string[];
    preview?: AuditLog[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/retention/${policyId}/apply`, {
      dry_run: dryRun
    });
  }

  /**
   * Export audit data for archival
   */
  async exportForArchival(
    criteria: {
      entityTypes?: string[];
      olderThan: string;
      format: 'json' | 'parquet' | 'csv';
      compression?: 'gzip' | 'zip';
    }
  ): Promise<ApiResponse<{
    exportId: string;
    status: 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    recordCount?: number;
    size?: number;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/export`, criteria);
  }

  // === Search and Query ===

  /**
   * Search audit logs with natural language
   */
  async searchAuditLogs(
    query: string,
    timeRange?: {
      start: string;
      end: string;
    },
    limit = 100
  ): Promise<ApiResponse<{
    logs: AuditLog[];
    total: number;
    queryInterpretation: string;
    suggestedFilters: Record<string, any>;
    relatedQueries: string[];
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/search`, {
      query,
      time_range: timeRange,
      limit
    });
  }

  /**
   * Build complex audit query
   */
  async buildAuditQuery(queryBuilder: {
    select: string[];
    where: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    groupBy?: string[];
    orderBy?: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{
    query: string;
    results: any[];
    executionTime: number;
    totalCount: number;
  }>> {
    return rbacApiService.post(`${RBAC_ENDPOINTS.AUDIT_LOGS}/query`, queryBuilder);
  }
}

// Export singleton instance
export const auditService = new AuditService();
export default auditService;