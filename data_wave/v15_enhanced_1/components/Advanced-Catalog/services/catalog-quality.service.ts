// ============================================================================
// CATALOG QUALITY SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: catalog_quality_service.py
// Data quality management, assessment, monitoring, and reporting
// ============================================================================

import axios from 'axios';
import { 
  QualityDashboard,
  QualityAssessmentJob,
  QualityAssessmentResult,
  DataQualityRule,
  QualityIssue,
  QualityTrend,
  QualityRecommendation,
  QualityMonitoring,
  QualityReport,
  QualityProfile,
  QualityBaseline,
  CatalogApiResponse
} from '../types';
import { 
  QUALITY_ENDPOINTS, 
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// ============================================================================
// QUALITY SERVICE INTERFACES
// ============================================================================

export interface CreateQualityAssessmentRequest {
  name: string;
  description?: string;
  assetIds: string[];
  ruleIds: string[];
  schedule?: QualityScheduleConfig;
  notifications?: QualityNotificationConfig[];
  configuration?: QualityAssessmentConfig;
  metadata?: Record<string, any>;
}

export interface QualityScheduleConfig {
  type: 'ONCE' | 'RECURRING';
  cronExpression?: string;
  startTime?: Date;
  enabled?: boolean;
  timezone?: string;
}

export interface QualityNotificationConfig {
  type: 'EMAIL' | 'WEBHOOK' | 'SLACK';
  recipients: string[];
  events: string[];
  threshold?: number;
  template?: string;
}

export interface QualityAssessmentConfig {
  enableTrends: boolean;
  enableRecommendations: boolean;
  scoreThreshold: number;
  failureThreshold: number;
  samplingRate?: number;
  timeoutMinutes?: number;
  parallelExecution?: boolean;
}

export interface CreateQualityRuleRequest {
  name: string;
  description: string;
  ruleType: 'COMPLETENESS' | 'ACCURACY' | 'CONSISTENCY' | 'VALIDITY' | 'UNIQUENESS' | 'TIMELINESS' | 'CUSTOM';
  dimension: string;
  expression: string;
  threshold: QualityThresholdConfig;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'BLOCKING';
  scope: QualityRuleScopeConfig;
  schedule?: QualityScheduleConfig;
  enabled?: boolean;
  metadata?: Record<string, any>;
}

export interface QualityThresholdConfig {
  value: number;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'BETWEEN' | 'NOT_EQUALS';
  upperBound?: number;
  unit?: string;
}

export interface QualityRuleScopeConfig {
  assetTypes: string[];
  assetIds?: string[];
  columns?: string[];
  conditions?: string[];
}

export interface CreateQualityDashboardRequest {
  name: string;
  description?: string;
  widgets: QualityWidgetConfig[];
  filters?: QualityFilterConfig[];
  timeRange?: QualityTimeRangeConfig;
  refreshInterval?: number;
  layout?: QualityDashboardLayoutConfig;
  permissions?: QualityPermissionConfig;
}

export interface QualityWidgetConfig {
  id: string;
  type: 'SCORE_CARD' | 'TREND_CHART' | 'ISSUE_SUMMARY' | 'RULE_STATUS' | 'HEAT_MAP' | 'DISTRIBUTION_CHART';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  dataSource: string;
  configuration: any;
  refreshInterval?: number;
}

export interface QualityFilterConfig {
  field: string;
  operator: string;
  value: any;
  enabled: boolean;
}

export interface QualityTimeRangeConfig {
  type: 'RELATIVE' | 'ABSOLUTE';
  value?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface QualityDashboardLayoutConfig {
  columns: number;
  spacing: number;
  responsive: boolean;
}

export interface QualityPermissionConfig {
  public: boolean;
  users: string[];
  groups: string[];
  roles: string[];
}

export interface CreateQualityMonitoringRequest {
  name: string;
  description?: string;
  scope: QualityMonitoringScopeConfig;
  rules: string[];
  thresholds: QualityThresholdConfig[];
  alerting: QualityAlertingConfig;
  schedule: QualityScheduleConfig;
}

export interface QualityMonitoringScopeConfig {
  assetIds: string[];
  includeChildAssets: boolean;
  filters?: QualityFilterConfig[];
}

export interface QualityAlertingConfig {
  enabled: boolean;
  channels: QualityNotificationConfig[];
  escalation?: QualityEscalationConfig;
  suppressDuplicates?: boolean;
  suppressionWindow?: number;
}

export interface QualityEscalationConfig {
  levels: Array<{
    threshold: number;
    delay: number;
    recipients: string[];
  }>;
}

export interface CreateQualityReportRequest {
  name: string;
  description?: string;
  type: 'EXECUTIVE_SUMMARY' | 'DETAILED_ANALYSIS' | 'TREND_REPORT' | 'COMPLIANCE_REPORT' | 'ISSUE_REPORT';
  scope: QualityReportScopeConfig;
  template?: string;
  schedule?: QualityScheduleConfig;
  distribution?: QualityDistributionConfig;
  format?: string[];
}

export interface QualityReportScopeConfig {
  assetIds?: string[];
  ruleIds?: string[];
  timeRange: QualityTimeRangeConfig;
  includeHistory: boolean;
  includeTrends: boolean;
  includeRecommendations: boolean;
}

export interface QualityDistributionConfig {
  recipients: string[];
  channels: string[];
  schedule: QualityScheduleConfig;
}

export interface QualityAnalyticsRequest {
  startDate: Date;
  endDate: Date;
  assetIds?: string[];
  ruleIds?: string[];
  granularity?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
  metrics: string[];
  groupBy?: string[];
}

export interface QualityIssueUpdateRequest {
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED' | 'DEFERRED';
  assignedTo?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
  dueDate?: Date;
  comments?: string;
  resolution?: QualityIssueResolutionRequest;
}

export interface QualityIssueResolutionRequest {
  type: 'FIXED' | 'ACKNOWLEDGED' | 'FALSE_POSITIVE' | 'WONT_FIX' | 'DUPLICATE';
  description: string;
  actions: string[];
  preventionMeasures?: string[];
}

// ============================================================================
// CATALOG QUALITY SERVICE CLASS
// ============================================================================

export class CatalogQualityService {

  // ============================================================================
  // QUALITY ASSESSMENT OPERATIONS
  // ============================================================================

  /**
   * Get list of quality assessments
   */
  async getQualityAssessments(
    page: number = 1,
    limit: number = 20,
    status?: string,
    assetId?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC'
  ): Promise<CatalogApiResponse<{
    assessments: QualityAssessmentJob[];
    totalCount: number;
  }>> {
    const params = {
      page,
      limit,
      status,
      assetId,
      sortBy,
      sortOrder
    };

    const response = await axios.get<CatalogApiResponse<{
      assessments: QualityAssessmentJob[];
      totalCount: number;
    }>>(
      buildPaginatedUrl(QUALITY_ENDPOINTS.ASSESSMENTS.LIST, page, limit, params)
    );

    return response.data;
  }

  /**
   * Create new quality assessment
   */
  async createQualityAssessment(
    request: CreateQualityAssessmentRequest
  ): Promise<CatalogApiResponse<QualityAssessmentJob>> {
    const response = await axios.post<CatalogApiResponse<QualityAssessmentJob>>(
      QUALITY_ENDPOINTS.ASSESSMENTS.CREATE,
      request
    );

    return response.data;
  }

  /**
   * Get quality assessment by ID
   */
  async getQualityAssessment(
    id: string,
    includeResults: boolean = false
  ): Promise<CatalogApiResponse<QualityAssessmentJob>> {
    const params = { includeResults };

    const response = await axios.get<CatalogApiResponse<QualityAssessmentJob>>(
      buildUrl(QUALITY_ENDPOINTS.ASSESSMENTS.GET(id), params)
    );

    return response.data;
  }

  /**
   * Update quality assessment
   */
  async updateQualityAssessment(
    id: string,
    updates: Partial<CreateQualityAssessmentRequest>
  ): Promise<CatalogApiResponse<QualityAssessmentJob>> {
    const response = await axios.put<CatalogApiResponse<QualityAssessmentJob>>(
      QUALITY_ENDPOINTS.ASSESSMENTS.UPDATE(id),
      updates
    );

    return response.data;
  }

  /**
   * Delete quality assessment
   */
  async deleteQualityAssessment(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.ASSESSMENTS.DELETE(id)
    );

    return response.data;
  }

  /**
   * Run quality assessment
   */
  async runQualityAssessment(
    id: string,
    overrideConfiguration?: Partial<QualityAssessmentConfig>
  ): Promise<CatalogApiResponse<{ executionId: string; estimatedDuration: number }>> {
    const request = { overrideConfiguration };

    const response = await axios.post<CatalogApiResponse<{ executionId: string; estimatedDuration: number }>>(
      QUALITY_ENDPOINTS.ASSESSMENTS.RUN(id),
      request
    );

    return response.data;
  }

  /**
   * Schedule quality assessment
   */
  async scheduleQualityAssessment(
    id: string,
    schedule: QualityScheduleConfig
  ): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.ASSESSMENTS.SCHEDULE(id),
      schedule
    );

    return response.data;
  }

  /**
   * Get quality assessment results
   */
  async getQualityAssessmentResults(
    id: string,
    includeDetails: boolean = true,
    includeIssues: boolean = true
  ): Promise<CatalogApiResponse<QualityAssessmentResult[]>> {
    const params = { includeDetails, includeIssues };

    const response = await axios.get<CatalogApiResponse<QualityAssessmentResult[]>>(
      buildUrl(QUALITY_ENDPOINTS.ASSESSMENTS.RESULTS(id), params)
    );

    return response.data;
  }

  /**
   * Get quality assessment history
   */
  async getQualityAssessmentHistory(
    id: string,
    limit: number = 50
  ): Promise<CatalogApiResponse<Array<{
    executionId: string;
    startTime: Date;
    endTime: Date;
    status: string;
    summary: any;
  }>>> {
    const params = { limit };

    const response = await axios.get<CatalogApiResponse<Array<{
      executionId: string;
      startTime: Date;
      endTime: Date;
      status: string;
      summary: any;
    }>>>(
      buildUrl(QUALITY_ENDPOINTS.ASSESSMENTS.HISTORY(id), params)
    );

    return response.data;
  }

  /**
   * Get quality assessment trends
   */
  async getQualityAssessmentTrends(
    id: string,
    period: string = '30d',
    granularity: 'HOUR' | 'DAY' | 'WEEK' = 'DAY'
  ): Promise<CatalogApiResponse<QualityTrend[]>> {
    const params = { period, granularity };

    const response = await axios.get<CatalogApiResponse<QualityTrend[]>>(
      buildUrl(QUALITY_ENDPOINTS.ASSESSMENTS.TRENDS(id), params)
    );

    return response.data;
  }

  /**
   * Export quality assessment results
   */
  async exportQualityAssessmentResults(
    id: string,
    format: 'CSV' | 'EXCEL' | 'PDF' | 'JSON',
    includeDetails: boolean = true
  ): Promise<CatalogApiResponse<{ downloadUrl: string; expiresAt: Date }>> {
    const request = { format, includeDetails };

    const response = await axios.post<CatalogApiResponse<{ downloadUrl: string; expiresAt: Date }>>(
      QUALITY_ENDPOINTS.ASSESSMENTS.EXPORT(id),
      request
    );

    return response.data;
  }

  // ============================================================================
  // QUALITY RULES MANAGEMENT
  // ============================================================================

  /**
   * Get list of quality rules
   */
  async getQualityRules(
    page: number = 1,
    limit: number = 20,
    ruleType?: string,
    enabled?: boolean,
    category?: string
  ): Promise<CatalogApiResponse<{
    rules: DataQualityRule[];
    totalCount: number;
  }>> {
    const params = {
      page,
      limit,
      ruleType,
      enabled,
      category
    };

    const response = await axios.get<CatalogApiResponse<{
      rules: DataQualityRule[];
      totalCount: number;
    }>>(
      buildPaginatedUrl(QUALITY_ENDPOINTS.RULES.LIST, page, limit, params)
    );

    return response.data;
  }

  /**
   * Create new quality rule
   */
  async createQualityRule(
    request: CreateQualityRuleRequest
  ): Promise<CatalogApiResponse<DataQualityRule>> {
    const response = await axios.post<CatalogApiResponse<DataQualityRule>>(
      QUALITY_ENDPOINTS.RULES.CREATE,
      request
    );

    return response.data;
  }

  /**
   * Get quality rule by ID
   */
  async getQualityRule(id: string): Promise<CatalogApiResponse<DataQualityRule>> {
    const response = await axios.get<CatalogApiResponse<DataQualityRule>>(
      QUALITY_ENDPOINTS.RULES.GET(id)
    );

    return response.data;
  }

  /**
   * Update quality rule
   */
  async updateQualityRule(
    id: string,
    updates: Partial<CreateQualityRuleRequest>
  ): Promise<CatalogApiResponse<DataQualityRule>> {
    const response = await axios.put<CatalogApiResponse<DataQualityRule>>(
      QUALITY_ENDPOINTS.RULES.UPDATE(id),
      updates
    );

    return response.data;
  }

  /**
   * Delete quality rule
   */
  async deleteQualityRule(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.RULES.DELETE(id)
    );

    return response.data;
  }

  /**
   * Validate quality rule
   */
  async validateQualityRule(
    rule: CreateQualityRuleRequest
  ): Promise<CatalogApiResponse<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }>> {
    const response = await axios.post<CatalogApiResponse<{
      valid: boolean;
      errors: string[];
      warnings: string[];
      suggestions: string[];
    }>>(
      QUALITY_ENDPOINTS.RULES.VALIDATE,
      rule
    );

    return response.data;
  }

  /**
   * Get quality rule templates
   */
  async getQualityRuleTemplates(
    category?: string
  ): Promise<CatalogApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    template: Partial<CreateQualityRuleRequest>;
  }>>> {
    const params = category ? { category } : {};

    const response = await axios.get<CatalogApiResponse<Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      template: Partial<CreateQualityRuleRequest>;
    }>>>(
      buildUrl(QUALITY_ENDPOINTS.RULES.TEMPLATES, params)
    );

    return response.data;
  }

  /**
   * Execute quality rule
   */
  async executeQualityRule(
    id: string,
    assetIds: string[],
    dryRun: boolean = false
  ): Promise<CatalogApiResponse<{
    executionId: string;
    results: any[];
    summary: any;
  }>> {
    const request = { assetIds, dryRun };

    const response = await axios.post<CatalogApiResponse<{
      executionId: string;
      results: any[];
      summary: any;
    }>>(
      QUALITY_ENDPOINTS.RULES.EXECUTE(id),
      request
    );

    return response.data;
  }

  /**
   * Test quality rule
   */
  async testQualityRule(
    id: string,
    testData: any,
    sampleSize: number = 100
  ): Promise<CatalogApiResponse<{
    passed: boolean;
    score: number;
    details: any;
    sampleResults: any[];
  }>> {
    const request = { testData, sampleSize };

    const response = await axios.post<CatalogApiResponse<{
      passed: boolean;
      score: number;
      details: any;
      sampleResults: any[];
    }>>(
      QUALITY_ENDPOINTS.RULES.TEST(id),
      request
    );

    return response.data;
  }

  /**
   * Duplicate quality rule
   */
  async duplicateQualityRule(
    id: string,
    newName: string,
    modifications?: Partial<CreateQualityRuleRequest>
  ): Promise<CatalogApiResponse<DataQualityRule>> {
    const request = { newName, modifications };

    const response = await axios.post<CatalogApiResponse<DataQualityRule>>(
      QUALITY_ENDPOINTS.RULES.DUPLICATE(id),
      request
    );

    return response.data;
  }

  /**
   * Get quality rule library
   */
  async getQualityRuleLibrary(): Promise<CatalogApiResponse<{
    categories: string[];
    rules: any[];
    templates: any[];
    customRules: any[];
  }>> {
    const response = await axios.get<CatalogApiResponse<{
      categories: string[];
      rules: any[];
      templates: any[];
      customRules: any[];
    }>>(
      QUALITY_ENDPOINTS.RULES.LIBRARY
    );

    return response.data;
  }

  /**
   * Get quality rule categories
   */
  async getQualityRuleCategories(): Promise<CatalogApiResponse<Array<{
    name: string;
    description: string;
    ruleCount: number;
  }>>> {
    const response = await axios.get<CatalogApiResponse<Array<{
      name: string;
      description: string;
      ruleCount: number;
    }>>>(
      QUALITY_ENDPOINTS.RULES.CATEGORIES
    );

    return response.data;
  }

  // ============================================================================
  // QUALITY DASHBOARD OPERATIONS
  // ============================================================================

  /**
   * Get quality dashboard overview
   */
  async getQualityDashboardOverview(): Promise<CatalogApiResponse<QualityDashboard>> {
    const response = await axios.get<CatalogApiResponse<QualityDashboard>>(
      QUALITY_ENDPOINTS.DASHBOARD.OVERVIEW
    );

    return response.data;
  }

  /**
   * Get quality scorecard
   */
  async getQualityScorecard(
    assetIds?: string[],
    period?: string
  ): Promise<CatalogApiResponse<{
    overallScore: number;
    assetScores: any[];
    dimensionScores: any[];
    trends: any[];
    insights: any[];
  }>> {
    const params = {
      assetIds: assetIds ? assetIds.join(',') : undefined,
      period
    };

    const response = await axios.get<CatalogApiResponse<{
      overallScore: number;
      assetScores: any[];
      dimensionScores: any[];
      trends: any[];
      insights: any[];
    }>>(
      buildUrl(QUALITY_ENDPOINTS.DASHBOARD.SCORECARD, params)
    );

    return response.data;
  }

  /**
   * Get quality trends
   */
  async getQualityTrends(
    period: string = '30d',
    granularity: 'HOUR' | 'DAY' | 'WEEK' = 'DAY',
    assetIds?: string[]
  ): Promise<CatalogApiResponse<QualityTrend[]>> {
    const params = {
      period,
      granularity,
      assetIds: assetIds ? assetIds.join(',') : undefined
    };

    const response = await axios.get<CatalogApiResponse<QualityTrend[]>>(
      buildUrl(QUALITY_ENDPOINTS.DASHBOARD.TRENDS, params)
    );

    return response.data;
  }

  /**
   * Get quality issues summary
   */
  async getQualityIssuesSummary(
    severity?: string,
    status?: string,
    assetIds?: string[]
  ): Promise<CatalogApiResponse<{
    totalIssues: number;
    openIssues: number;
    criticalIssues: number;
    issuesBySeverity: any[];
    issuesByType: any[];
    recentIssues: QualityIssue[];
  }>> {
    const params = {
      severity,
      status,
      assetIds: assetIds ? assetIds.join(',') : undefined
    };

    const response = await axios.get<CatalogApiResponse<{
      totalIssues: number;
      openIssues: number;
      criticalIssues: number;
      issuesBySeverity: any[];
      issuesByType: any[];
      recentIssues: QualityIssue[];
    }>>(
      buildUrl(QUALITY_ENDPOINTS.DASHBOARD.ISSUES, params)
    );

    return response.data;
  }

  /**
   * Get quality alerts
   */
  async getQualityAlerts(
    active: boolean = true,
    limit: number = 20
  ): Promise<CatalogApiResponse<Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    assetId: string;
    ruleId: string;
    triggeredAt: Date;
    acknowledged: boolean;
  }>>> {
    const params = { active, limit };

    const response = await axios.get<CatalogApiResponse<Array<{
      id: string;
      type: string;
      severity: string;
      message: string;
      assetId: string;
      ruleId: string;
      triggeredAt: Date;
      acknowledged: boolean;
    }>>>(
      buildUrl(QUALITY_ENDPOINTS.DASHBOARD.ALERTS, params)
    );

    return response.data;
  }

  /**
   * Get quality reports
   */
  async getQualityReports(
    type?: string,
    status?: string
  ): Promise<CatalogApiResponse<QualityReport[]>> {
    const params = { type, status };

    const response = await axios.get<CatalogApiResponse<QualityReport[]>>(
      buildUrl(QUALITY_ENDPOINTS.DASHBOARD.REPORTS, params)
    );

    return response.data;
  }

  /**
   * Get dashboard widgets configuration
   */
  async getDashboardWidgets(): Promise<CatalogApiResponse<QualityWidgetConfig[]>> {
    const response = await axios.get<CatalogApiResponse<QualityWidgetConfig[]>>(
      QUALITY_ENDPOINTS.DASHBOARD.WIDGETS
    );

    return response.data;
  }

  /**
   * Personalize quality dashboard
   */
  async personalizeQualityDashboard(
    userId: string,
    configuration: CreateQualityDashboardRequest
  ): Promise<CatalogApiResponse<void>> {
    const request = { userId, configuration };

    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.DASHBOARD.PERSONALIZE,
      request
    );

    return response.data;
  }

  // ============================================================================
  // QUALITY ISSUES MANAGEMENT
  // ============================================================================

  /**
   * Get list of quality issues
   */
  async getQualityIssues(
    page: number = 1,
    limit: number = 20,
    severity?: string,
    status?: string,
    assetId?: string,
    ruleId?: string,
    assignedTo?: string
  ): Promise<CatalogApiResponse<{
    issues: QualityIssue[];
    totalCount: number;
  }>> {
    const params = {
      page,
      limit,
      severity,
      status,
      assetId,
      ruleId,
      assignedTo
    };

    const response = await axios.get<CatalogApiResponse<{
      issues: QualityIssue[];
      totalCount: number;
    }>>(
      buildPaginatedUrl(QUALITY_ENDPOINTS.ISSUES.LIST, page, limit, params)
    );

    return response.data;
  }

  /**
   * Get quality issue by ID
   */
  async getQualityIssue(id: string): Promise<CatalogApiResponse<QualityIssue>> {
    const response = await axios.get<CatalogApiResponse<QualityIssue>>(
      QUALITY_ENDPOINTS.ISSUES.GET(id)
    );

    return response.data;
  }

  /**
   * Update quality issue
   */
  async updateQualityIssue(
    id: string,
    updates: QualityIssueUpdateRequest
  ): Promise<CatalogApiResponse<QualityIssue>> {
    const response = await axios.put<CatalogApiResponse<QualityIssue>>(
      QUALITY_ENDPOINTS.ISSUES.UPDATE(id),
      updates
    );

    return response.data;
  }

  /**
   * Resolve quality issue
   */
  async resolveQualityIssue(
    id: string,
    resolution: QualityIssueResolutionRequest
  ): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.ISSUES.RESOLVE(id),
      resolution
    );

    return response.data;
  }

  /**
   * Assign quality issue
   */
  async assignQualityIssue(
    id: string,
    assignedTo: string,
    dueDate?: Date,
    comments?: string
  ): Promise<CatalogApiResponse<void>> {
    const request = { assignedTo, dueDate, comments };

    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.ISSUES.ASSIGN(id),
      request
    );

    return response.data;
  }

  /**
   * Add comment to quality issue
   */
  async addQualityIssueComment(
    id: string,
    comment: string,
    userId: string
  ): Promise<CatalogApiResponse<void>> {
    const request = { comment, userId };

    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.ISSUES.COMMENT(id),
      request
    );

    return response.data;
  }

  /**
   * Track quality issue
   */
  async trackQualityIssue(
    id: string,
    action: string,
    details?: any
  ): Promise<CatalogApiResponse<void>> {
    const request = { action, details };

    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.ISSUES.TRACK(id),
      request
    );

    return response.data;
  }

  /**
   * Bulk update quality issues
   */
  async bulkUpdateQualityIssues(
    issueIds: string[],
    updates: QualityIssueUpdateRequest
  ): Promise<CatalogApiResponse<{
    updated: number;
    failed: number;
    errors: any[];
  }>> {
    const request = { issueIds, updates };

    const response = await axios.post<CatalogApiResponse<{
      updated: number;
      failed: number;
      errors: any[];
    }>>(
      QUALITY_ENDPOINTS.ISSUES.BULK_UPDATE,
      request
    );

    return response.data;
  }

  /**
   * Get quality issues statistics
   */
  async getQualityIssuesStatistics(
    period: string = '30d'
  ): Promise<CatalogApiResponse<{
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    averageResolutionTime: number;
    issuesByType: any[];
    issuesBySeverity: any[];
    issuesByAsset: any[];
    resolutionTrends: any[];
  }>> {
    const params = { period };

    const response = await axios.get<CatalogApiResponse<{
      totalIssues: number;
      openIssues: number;
      resolvedIssues: number;
      averageResolutionTime: number;
      issuesByType: any[];
      issuesBySeverity: any[];
      issuesByAsset: any[];
      resolutionTrends: any[];
    }>>(
      buildUrl(QUALITY_ENDPOINTS.ISSUES.STATISTICS, params)
    );

    return response.data;
  }

  /**
   * Get quality issues trends
   */
  async getQualityIssuesTrends(
    period: string = '30d',
    granularity: 'HOUR' | 'DAY' | 'WEEK' = 'DAY'
  ): Promise<CatalogApiResponse<Array<{
    date: Date;
    openIssues: number;
    newIssues: number;
    resolvedIssues: number;
    criticalIssues: number;
  }>>> {
    const params = { period, granularity };

    const response = await axios.get<CatalogApiResponse<Array<{
      date: Date;
      openIssues: number;
      newIssues: number;
      resolvedIssues: number;
      criticalIssues: number;
    }>>>(
      buildUrl(QUALITY_ENDPOINTS.ISSUES.TRENDS, params)
    );

    return response.data;
  }

  // ============================================================================
  // QUALITY MONITORING OPERATIONS
  // ============================================================================

  /**
   * Get list of quality monitoring configurations
   */
  async getQualityMonitoring(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<CatalogApiResponse<{
    monitors: QualityMonitoring[];
    totalCount: number;
  }>> {
    const params = { page, limit, status };

    const response = await axios.get<CatalogApiResponse<{
      monitors: QualityMonitoring[];
      totalCount: number;
    }>>(
      buildPaginatedUrl(QUALITY_ENDPOINTS.MONITORING.LIST, page, limit, params)
    );

    return response.data;
  }

  /**
   * Create quality monitoring configuration
   */
  async createQualityMonitoring(
    request: CreateQualityMonitoringRequest
  ): Promise<CatalogApiResponse<QualityMonitoring>> {
    const response = await axios.post<CatalogApiResponse<QualityMonitoring>>(
      QUALITY_ENDPOINTS.MONITORING.CREATE,
      request
    );

    return response.data;
  }

  /**
   * Get quality monitoring by ID
   */
  async getQualityMonitoringById(id: string): Promise<CatalogApiResponse<QualityMonitoring>> {
    const response = await axios.get<CatalogApiResponse<QualityMonitoring>>(
      QUALITY_ENDPOINTS.MONITORING.GET(id)
    );

    return response.data;
  }

  /**
   * Update quality monitoring
   */
  async updateQualityMonitoring(
    id: string,
    updates: Partial<CreateQualityMonitoringRequest>
  ): Promise<CatalogApiResponse<QualityMonitoring>> {
    const response = await axios.put<CatalogApiResponse<QualityMonitoring>>(
      QUALITY_ENDPOINTS.MONITORING.UPDATE(id),
      updates
    );

    return response.data;
  }

  /**
   * Delete quality monitoring
   */
  async deleteQualityMonitoring(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.MONITORING.DELETE(id)
    );

    return response.data;
  }

  /**
   * Start quality monitoring
   */
  async startQualityMonitoring(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.MONITORING.START(id)
    );

    return response.data;
  }

  /**
   * Stop quality monitoring
   */
  async stopQualityMonitoring(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.MONITORING.STOP(id)
    );

    return response.data;
  }

  /**
   * Get quality monitoring status
   */
  async getQualityMonitoringStatus(id: string): Promise<CatalogApiResponse<{
    status: string;
    lastRun: Date;
    nextRun: Date;
    alertsTriggered: number;
    issuesDetected: number;
    performance: any;
  }>> {
    const response = await axios.get<CatalogApiResponse<{
      status: string;
      lastRun: Date;
      nextRun: Date;
      alertsTriggered: number;
      issuesDetected: number;
      performance: any;
    }>>(
      QUALITY_ENDPOINTS.MONITORING.STATUS(id)
    );

    return response.data;
  }

  /**
   * Get quality monitoring alerts
   */
  async getQualityMonitoringAlerts(
    id: string,
    limit: number = 50
  ): Promise<CatalogApiResponse<any[]>> {
    const params = { limit };

    const response = await axios.get<CatalogApiResponse<any[]>>(
      buildUrl(QUALITY_ENDPOINTS.MONITORING.ALERTS(id), params)
    );

    return response.data;
  }

  /**
   * Configure quality monitoring
   */
  async configureQualityMonitoring(
    id: string,
    configuration: any
  ): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.MONITORING.CONFIGURE(id),
      configuration
    );

    return response.data;
  }

  // ============================================================================
  // QUALITY REPORTS OPERATIONS
  // ============================================================================

  /**
   * Get list of quality reports
   */
  async getQualityReportsList(
    page: number = 1,
    limit: number = 20,
    type?: string,
    status?: string
  ): Promise<CatalogApiResponse<{
    reports: QualityReport[];
    totalCount: number;
  }>> {
    const params = { page, limit, type, status };

    const response = await axios.get<CatalogApiResponse<{
      reports: QualityReport[];
      totalCount: number;
    }>>(
      buildPaginatedUrl(QUALITY_ENDPOINTS.REPORTS.LIST, page, limit, params)
    );

    return response.data;
  }

  /**
   * Create quality report
   */
  async createQualityReport(
    request: CreateQualityReportRequest
  ): Promise<CatalogApiResponse<QualityReport>> {
    const response = await axios.post<CatalogApiResponse<QualityReport>>(
      QUALITY_ENDPOINTS.REPORTS.CREATE,
      request
    );

    return response.data;
  }

  /**
   * Get quality report by ID
   */
  async getQualityReportById(id: string): Promise<CatalogApiResponse<QualityReport>> {
    const response = await axios.get<CatalogApiResponse<QualityReport>>(
      QUALITY_ENDPOINTS.REPORTS.GET(id)
    );

    return response.data;
  }

  /**
   * Generate quality report
   */
  async generateQualityReport(
    id: string,
    format?: string[]
  ): Promise<CatalogApiResponse<{ reportId: string; estimatedTime: number }>> {
    const request = { format };

    const response = await axios.post<CatalogApiResponse<{ reportId: string; estimatedTime: number }>>(
      QUALITY_ENDPOINTS.REPORTS.GENERATE(id),
      request
    );

    return response.data;
  }

  /**
   * Schedule quality report
   */
  async scheduleQualityReport(
    id: string,
    schedule: QualityScheduleConfig
  ): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.REPORTS.SCHEDULE(id),
      schedule
    );

    return response.data;
  }

  /**
   * Export quality report
   */
  async exportQualityReport(
    id: string,
    format: 'PDF' | 'EXCEL' | 'CSV'
  ): Promise<CatalogApiResponse<{ downloadUrl: string; expiresAt: Date }>> {
    const request = { format };

    const response = await axios.post<CatalogApiResponse<{ downloadUrl: string; expiresAt: Date }>>(
      QUALITY_ENDPOINTS.REPORTS.EXPORT(id),
      request
    );

    return response.data;
  }

  /**
   * Share quality report
   */
  async shareQualityReport(
    id: string,
    recipients: string[],
    message?: string
  ): Promise<CatalogApiResponse<void>> {
    const request = { recipients, message };

    const response = await axios.post<CatalogApiResponse<void>>(
      QUALITY_ENDPOINTS.REPORTS.SHARE(id),
      request
    );

    return response.data;
  }

  /**
   * Get quality report templates
   */
  async getQualityReportTemplates(): Promise<CatalogApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    template: any;
  }>>> {
    const response = await axios.get<CatalogApiResponse<Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      template: any;
    }>>>(
      QUALITY_ENDPOINTS.REPORTS.TEMPLATES
    );

    return response.data;
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const catalogQualityService = new CatalogQualityService();
export default catalogQualityService;