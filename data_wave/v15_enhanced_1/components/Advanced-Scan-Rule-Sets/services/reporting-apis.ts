// ============================================================================
// ADVANCED SCAN RULE SETS - COMPREHENSIVE REPORTING API SERVICE
// Enterprise-Core Implementation with Full Backend Integration
// Maps to: advanced_reporting_service.py (24KB), comprehensive_analytics_service.py (35KB)
//          usage_analytics_service.py (39KB), roi_calculation_service.py (26KB)
// ============================================================================

import { 
  AnalyticsDashboard,
  ReportTemplate,
  ReportInstance,
  MetricsCollection,
  Metric,
  VisualizationConfiguration,
  ChartConfiguration,
  DataVisualizationEngine,
  AnalyticsEngine,
  ReportingMetrics,
  ExportEngine,
  APIResponse
} from '../types/reporting.types';

import { APIError, createAPIError } from '../types/api-error.types';

// Enterprise API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
const REPORTING_ENDPOINT = `${API_BASE_URL}/advanced-reporting`;

/**
 * Enterprise-Grade Reporting API Service
 * Comprehensive integration with backend reporting and analytics services
 * Features: Advanced Analytics, Custom Reports, Real-time Dashboards, ROI Analysis
 */
export class ReportingAPIService {
  private baseURL: string;
  private headers: HeadersInit;
  private wsConnections: Map<string, WebSocket>;
  private reportingCache: Map<string, any>;
  private retryConfig: { attempts: number; delay: number };

  constructor() {
    this.baseURL = REPORTING_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': '2.0.0',
      'X-Feature-Flags': 'advanced-analytics,custom-reports,real-time-dashboards,roi-analysis'
    };
    this.wsConnections = new Map();
    this.reportingCache = new Map();
    this.retryConfig = { attempts: 3, delay: 1000 };
  }

  // ============================================================================
  // AUTHENTICATION & REQUEST HANDLING
  // ============================================================================

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const orgId = localStorage.getItem('organization_id');
    const userId = localStorage.getItem('user_id');
    
    return {
      ...this.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(orgId && { 'X-Organization-ID': orgId }),
      ...(userId && { 'X-User-ID': userId }),
      'X-Request-ID': this.generateRequestId(),
      'X-Timestamp': new Date().toISOString(),
      'X-Reporting-Context': this.getReportingContext(),
      'X-Analytics-Preferences': this.getAnalyticsPreferences()
    };
  }

  private generateRequestId(): string {
    return `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getReportingContext(): string {
    return JSON.stringify({
      userRole: this.getUserRole(),
      accessLevel: this.getAccessLevel(),
      reportingPreferences: this.getUserReportingPreferences(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language
    });
  }

  private getUserRole(): string {
    return localStorage.getItem('user_role') || 'analyst';
  }

  private getAccessLevel(): string {
    return localStorage.getItem('access_level') || 'standard';
  }

  private getUserReportingPreferences(): any {
    return {
      defaultTimeRange: '30d',
      preferredChartTypes: ['line', 'bar', 'pie', 'heatmap'],
      dataRefreshFrequency: 'hourly',
      exportFormats: ['pdf', 'excel', 'csv'],
      dashboardLayout: 'grid',
      alertThresholds: {
        performance: 0.8,
        compliance: 0.95,
        cost: 1000
      }
    };
  }

  private getAnalyticsPreferences(): string {
    return JSON.stringify({
      aggregationLevel: 'detailed',
      includeForecasting: true,
      includeComparisons: true,
      includeTrends: true,
      includeAnomalies: true,
      confidenceLevel: 0.95
    });
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const requestId = response.headers.get('X-Request-ID');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Enhanced error handling with reporting-specific context
      if (response.status >= 500 && this.retryConfig.attempts > 0) {
        await this.delay(this.retryConfig.delay);
        // Retry logic with exponential backoff
      }
      
      throw createAPIError(
        errorData.message || response.statusText,
        response.status.toString(),
        response.status,
        {
          ...errorData.details,
          requestId,
          reportingContext: errorData.reportingContext,
          dataAvailability: errorData.dataAvailability,
          suggestedActions: errorData.suggestedActions,
          endpoint: response.url
        }
      );
    }

    const data = await response.json();
    
    // Add reporting-specific metadata
    if (data && typeof data === 'object') {
      data._metadata = {
        requestId,
        responseTime: response.headers.get('X-Response-Time'),
        reportingVersion: response.headers.get('X-Reporting-Version'),
        dataFreshness: response.headers.get('X-Data-Freshness'),
        analyticsVersion: response.headers.get('X-Analytics-Version'),
        cached: response.headers.get('X-Cache-Status') === 'HIT',
        generationTime: response.headers.get('X-Generation-Time')
      };
    }

    return data;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // ANALYTICS DASHBOARD MANAGEMENT
  // Maps to comprehensive_analytics_service.py
  // ============================================================================

  /**
   * Get analytics dashboards with widgets and data
   * Endpoint: GET /advanced-reporting/dashboards
   */
  async getAnalyticsDashboards(options: {
    includeWidgets?: boolean;
    includeData?: boolean;
    includeMetrics?: boolean;
    filterByCategory?: string[];
    sortBy?: 'name' | 'created_date' | 'usage' | 'performance';
    accessLevel?: 'personal' | 'team' | 'organization';
  } = {}): Promise<APIResponse<AnalyticsDashboard[]>> {
    const params = new URLSearchParams();
    
    if (options.includeWidgets) params.append('include_widgets', 'true');
    if (options.includeData) params.append('include_data', 'true');
    if (options.includeMetrics) params.append('include_metrics', 'true');
    if (options.filterByCategory) params.append('filter_by_category', options.filterByCategory.join(','));
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.accessLevel) params.append('access_level', options.accessLevel);

    const response = await fetch(`${this.baseURL}/dashboards?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<AnalyticsDashboard[]>>(response);
  }

  /**
   * Create analytics dashboard with advanced configuration
   * Endpoint: POST /advanced-reporting/dashboards
   */
  async createAnalyticsDashboard(
    dashboard: Omit<AnalyticsDashboard, 'dashboard_id'>,
    options: {
      generateDefaultWidgets?: boolean;
      enableRealTimeUpdates?: boolean;
      setupAlerts?: boolean;
      configureSharing?: boolean;
    } = {}
  ): Promise<APIResponse<AnalyticsDashboard & {
    defaultWidgets?: any[];
    realTimeConfig?: any;
    alertConfig?: any;
    sharingConfig?: any;
  }>> {
    const requestBody = {
      ...dashboard,
      options: {
        generate_default_widgets: options.generateDefaultWidgets,
        enable_real_time_updates: options.enableRealTimeUpdates,
        setup_alerts: options.setupAlerts,
        configure_sharing: options.configureSharing
      },
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id'),
        userPreferences: this.getUserReportingPreferences()
      }
    };

    const response = await fetch(`${this.baseURL}/dashboards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<AnalyticsDashboard & {
      defaultWidgets?: any[];
      realTimeConfig?: any;
      alertConfig?: any;
      sharingConfig?: any;
    }>>(response);
  }

  /**
   * Get dashboard data with real-time updates
   * Endpoint: GET /advanced-reporting/dashboards/{id}/data
   */
  async getDashboardData(
    dashboardId: string,
    options: {
      timeRange?: { start: string; end: string };
      refreshMode?: 'cached' | 'fresh' | 'real_time';
      includeForecasting?: boolean;
      includeBenchmarks?: boolean;
      includeAnomalies?: boolean;
      aggregationLevel?: 'minute' | 'hour' | 'day' | 'week' | 'month';
    } = {}
  ): Promise<APIResponse<{
    dashboardData: any;
    widgets: any[];
    metrics: MetricsCollection;
    forecasts?: any[];
    benchmarks?: any[];
    anomalies?: any[];
    lastUpdated: string;
  }>> {
    const params = new URLSearchParams();
    
    if (options.timeRange) {
      params.append('start_date', options.timeRange.start);
      params.append('end_date', options.timeRange.end);
    }
    if (options.refreshMode) params.append('refresh_mode', options.refreshMode);
    if (options.includeForecasting) params.append('include_forecasting', 'true');
    if (options.includeBenchmarks) params.append('include_benchmarks', 'true');
    if (options.includeAnomalies) params.append('include_anomalies', 'true');
    if (options.aggregationLevel) params.append('aggregation_level', options.aggregationLevel);

    const response = await fetch(`${this.baseURL}/dashboards/${dashboardId}/data?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      dashboardData: any;
      widgets: any[];
      metrics: MetricsCollection;
      forecasts?: any[];
      benchmarks?: any[];
      anomalies?: any[];
      lastUpdated: string;
    }>>(response);
  }

  // ============================================================================
  // REPORT TEMPLATE MANAGEMENT
  // Maps to advanced_reporting_service.py
  // ============================================================================

  /**
   * Get report templates with categories and usage stats
   * Endpoint: GET /advanced-reporting/templates
   */
  async getReportTemplates(options: {
    category?: string;
    reportType?: 'operational' | 'executive' | 'compliance' | 'financial' | 'technical';
    includeUsageStats?: boolean;
    includePreview?: boolean;
    sortBy?: 'name' | 'usage' | 'created_date' | 'rating';
    filterByAccess?: boolean;
  } = {}): Promise<APIResponse<ReportTemplate[]>> {
    const params = new URLSearchParams();
    
    if (options.category) params.append('category', options.category);
    if (options.reportType) params.append('report_type', options.reportType);
    if (options.includeUsageStats) params.append('include_usage_stats', 'true');
    if (options.includePreview) params.append('include_preview', 'true');
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.filterByAccess) params.append('filter_by_access', 'true');

    const response = await fetch(`${this.baseURL}/templates?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<ReportTemplate[]>>(response);
  }

  /**
   * Create custom report template
   * Endpoint: POST /advanced-reporting/templates
   */
  async createReportTemplate(
    template: Omit<ReportTemplate, 'template_id'>,
    options: {
      validateTemplate?: boolean;
      generatePreview?: boolean;
      setupScheduling?: boolean;
      enableSharing?: boolean;
    } = {}
  ): Promise<APIResponse<ReportTemplate & {
    validationResults?: any;
    previewUrl?: string;
    schedulingConfig?: any;
    sharingConfig?: any;
  }>> {
    const requestBody = {
      ...template,
      options: {
        validate_template: options.validateTemplate,
        generate_preview: options.generatePreview,
        setup_scheduling: options.setupScheduling,
        enable_sharing: options.enableSharing
      },
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        templateVersion: '1.0.0'
      }
    };

    const response = await fetch(`${this.baseURL}/templates`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<ReportTemplate & {
      validationResults?: any;
      previewUrl?: string;
      schedulingConfig?: any;
      sharingConfig?: any;
    }>>(response);
  }

  // ============================================================================
  // REPORT GENERATION & MANAGEMENT
  // ============================================================================

  /**
   * Generate report from template with custom parameters
   * Endpoint: POST /advanced-reporting/reports/generate
   */
  async generateReport(
    reportConfig: {
      templateId: string;
      reportName: string;
      parameters: Record<string, any>;
      timeRange?: { start: string; end: string };
      outputFormat: 'pdf' | 'excel' | 'html' | 'json' | 'csv' | 'dashboard';
      deliveryMethod?: 'download' | 'email' | 'shared_link' | 'webhook';
      recipients?: string[];
      schedulingConfig?: {
        frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
        startDate?: string;
        endDate?: string;
        timezone?: string;
      };
      customizations?: {
        branding?: any;
        styling?: any;
        additionalSections?: any[];
        excludeSections?: string[];
      };
    }
  ): Promise<APIResponse<{
    reportId: string;
    generationJobId: string;
    estimatedDuration: number;
    downloadUrl?: string;
    previewUrl?: string;
    schedulingId?: string;
    deliveryStatus?: any;
  }>> {
    const requestBody = {
      ...reportConfig,
      metadata: {
        generatedBy: localStorage.getItem('user_id'),
        generationTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id'),
        userPreferences: this.getUserReportingPreferences()
      }
    };

    const response = await fetch(`${this.baseURL}/reports/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      reportId: string;
      generationJobId: string;
      estimatedDuration: number;
      downloadUrl?: string;
      previewUrl?: string;
      schedulingId?: string;
      deliveryStatus?: any;
    }>>(response);
  }

  /**
   * Get report generation status and progress
   * Endpoint: GET /advanced-reporting/reports/{id}/status
   */
  async getReportStatus(
    reportId: string,
    options: {
      includeProgress?: boolean;
      includeLogs?: boolean;
      includePreview?: boolean;
    } = {}
  ): Promise<APIResponse<{
    status: 'generating' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    estimatedCompletion?: string;
    downloadUrl?: string;
    previewUrl?: string;
    logs?: string[];
    error?: any;
    metrics?: any;
  }>> {
    const params = new URLSearchParams();
    
    if (options.includeProgress) params.append('include_progress', 'true');
    if (options.includeLogs) params.append('include_logs', 'true');
    if (options.includePreview) params.append('include_preview', 'true');

    const response = await fetch(`${this.baseURL}/reports/${reportId}/status?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      status: 'generating' | 'completed' | 'failed' | 'cancelled';
      progress: number;
      estimatedCompletion?: string;
      downloadUrl?: string;
      previewUrl?: string;
      logs?: string[];
      error?: any;
      metrics?: any;
    }>>(response);
  }

  /**
   * Get generated reports with filtering and search
   * Endpoint: GET /advanced-reporting/reports
   */
  async getReports(options: {
    status?: string;
    templateId?: string;
    generatedBy?: string;
    dateRange?: { start: string; end: string };
    outputFormat?: string;
    includeMetrics?: boolean;
    sortBy?: 'created_date' | 'name' | 'size' | 'generation_time';
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<ReportInstance[]> & {
    pagination: any;
    summary: any;
  }> {
    const params = new URLSearchParams();
    
    if (options.status) params.append('status', options.status);
    if (options.templateId) params.append('template_id', options.templateId);
    if (options.generatedBy) params.append('generated_by', options.generatedBy);
    if (options.dateRange) {
      params.append('start_date', options.dateRange.start);
      params.append('end_date', options.dateRange.end);
    }
    if (options.outputFormat) params.append('output_format', options.outputFormat);
    if (options.includeMetrics) params.append('include_metrics', 'true');
    if (options.sortBy) params.append('sort_by', options.sortBy);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`${this.baseURL}/reports?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<ReportInstance[]> & {
      pagination: any;
      summary: any;
    }>(response);
  }

  // ============================================================================
  // METRICS & ANALYTICS ENGINE
  // Maps to usage_analytics_service.py
  // ============================================================================

  /**
   * Get comprehensive metrics collection
   * Endpoint: GET /advanced-reporting/metrics
   */
  async getMetrics(options: {
    metricTypes?: string[];
    timeRange?: { start: string; end: string };
    aggregationLevel?: 'minute' | 'hour' | 'day' | 'week' | 'month';
    includeForecasting?: boolean;
    includeTrends?: boolean;
    includeComparisons?: boolean;
    filterBy?: Record<string, any>;
    groupBy?: string[];
  } = {}): Promise<APIResponse<MetricsCollection & {
    forecasts?: any[];
    trends?: any[];
    comparisons?: any[];
    insights?: any[];
  }>> {
    const params = new URLSearchParams();
    
    if (options.metricTypes) params.append('metric_types', options.metricTypes.join(','));
    if (options.timeRange) {
      params.append('start_date', options.timeRange.start);
      params.append('end_date', options.timeRange.end);
    }
    if (options.aggregationLevel) params.append('aggregation_level', options.aggregationLevel);
    if (options.includeForecasting) params.append('include_forecasting', 'true');
    if (options.includeTrends) params.append('include_trends', 'true');
    if (options.includeComparisons) params.append('include_comparisons', 'true');
    if (options.filterBy) params.append('filter_by', JSON.stringify(options.filterBy));
    if (options.groupBy) params.append('group_by', options.groupBy.join(','));

    const response = await fetch(`${this.baseURL}/metrics?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<MetricsCollection & {
      forecasts?: any[];
      trends?: any[];
      comparisons?: any[];
      insights?: any[];
    }>>(response);
  }

  /**
   * Create custom metric with advanced configuration
   * Endpoint: POST /advanced-reporting/metrics/custom
   */
  async createCustomMetric(
    metricConfig: {
      name: string;
      description: string;
      metricType: 'counter' | 'gauge' | 'histogram' | 'summary' | 'calculated';
      dataSource: string;
      calculation: {
        formula?: string;
        aggregationType?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'percentile';
        groupBy?: string[];
        filters?: Record<string, any>;
      };
      visualization: {
        chartType: 'line' | 'bar' | 'pie' | 'gauge' | 'heatmap' | 'scatter';
        colorScheme?: string;
        thresholds?: { value: number; color: string; label: string }[];
      };
      alerts?: {
        threshold: number;
        operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
        recipients: string[];
        frequency: 'immediate' | 'hourly' | 'daily';
      }[];
    }
  ): Promise<APIResponse<Metric & {
    validationResults?: any;
    previewData?: any;
    alertConfig?: any;
  }>> {
    const requestBody = {
      ...metricConfig,
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    const response = await fetch(`${this.baseURL}/metrics/custom`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<Metric & {
      validationResults?: any;
      previewData?: any;
      alertConfig?: any;
    }>>(response);
  }

  // ============================================================================
  // ROI & FINANCIAL ANALYTICS
  // Maps to roi_calculation_service.py
  // ============================================================================

  /**
   * Calculate ROI analysis with comprehensive metrics
   * Endpoint: POST /advanced-reporting/roi/calculate
   */
  async calculateROI(
    roiConfig: {
      analysisScope: 'project' | 'department' | 'organization' | 'initiative';
      scopeId: string;
      timeRange: { start: string; end: string };
      costCategories: string[];
      benefitCategories: string[];
      calculationMethod: 'simple' | 'discounted' | 'net_present_value' | 'internal_rate_return';
      customParameters?: {
        discountRate?: number;
        inflationRate?: number;
        riskAdjustment?: number;
        currencyCode?: string;
      };
      includeProjections?: boolean;
      projectionPeriod?: number; // months
    }
  ): Promise<APIResponse<{
    roiAnalysisId: string;
    roiValue: number;
    paybackPeriod: number;
    netPresentValue?: number;
    internalRateOfReturn?: number;
    costBreakdown: Record<string, number>;
    benefitBreakdown: Record<string, number>;
    projections?: any[];
    riskAssessment: any;
    recommendations: string[];
    benchmarks?: any[];
  }>> {
    const requestBody = {
      ...roiConfig,
      metadata: {
        calculatedBy: localStorage.getItem('user_id'),
        calculationTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id')
      }
    };

    const response = await fetch(`${this.baseURL}/roi/calculate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      roiAnalysisId: string;
      roiValue: number;
      paybackPeriod: number;
      netPresentValue?: number;
      internalRateOfReturn?: number;
      costBreakdown: Record<string, number>;
      benefitBreakdown: Record<string, number>;
      projections?: any[];
      riskAssessment: any;
      recommendations: string[];
      benchmarks?: any[];
    }>>(response);
  }

  /**
   * Get ROI trend analysis and comparisons
   * Endpoint: GET /advanced-reporting/roi/trends
   */
  async getROITrends(options: {
    analysisIds?: string[];
    timeRange?: { start: string; end: string };
    groupBy?: 'month' | 'quarter' | 'year' | 'category' | 'department';
    includeForecasting?: boolean;
    includeBenchmarks?: boolean;
    comparisonType?: 'period_over_period' | 'year_over_year' | 'baseline';
  } = {}): Promise<APIResponse<{
    trends: any[];
    comparisons: any[];
    forecasts?: any[];
    benchmarks?: any[];
    insights: any[];
    summary: {
      averageROI: number;
      totalInvestment: number;
      totalReturns: number;
      trendDirection: 'up' | 'down' | 'stable';
    };
  }>> {
    const params = new URLSearchParams();
    
    if (options.analysisIds) params.append('analysis_ids', options.analysisIds.join(','));
    if (options.timeRange) {
      params.append('start_date', options.timeRange.start);
      params.append('end_date', options.timeRange.end);
    }
    if (options.groupBy) params.append('group_by', options.groupBy);
    if (options.includeForecasting) params.append('include_forecasting', 'true');
    if (options.includeBenchmarks) params.append('include_benchmarks', 'true');
    if (options.comparisonType) params.append('comparison_type', options.comparisonType);

    const response = await fetch(`${this.baseURL}/roi/trends?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<APIResponse<{
      trends: any[];
      comparisons: any[];
      forecasts?: any[];
      benchmarks?: any[];
      insights: any[];
      summary: {
        averageROI: number;
        totalInvestment: number;
        totalReturns: number;
        trendDirection: 'up' | 'down' | 'stable';
      };
    }>>(response);
  }

  // ============================================================================
  // DATA VISUALIZATION & CHARTS
  // ============================================================================

  /**
   * Generate data visualization with advanced configuration
   * Endpoint: POST /advanced-reporting/visualizations/generate
   */
  async generateVisualization(
    visualizationConfig: {
      chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'treemap' | 'sankey' | 'gantt';
      dataSource: any;
      configuration: ChartConfiguration;
      styling?: {
        theme?: 'light' | 'dark' | 'custom';
        colorPalette?: string[];
        fontSize?: number;
        dimensions?: { width: number; height: number };
      };
      interactivity?: {
        enableZoom?: boolean;
        enablePan?: boolean;
        enableTooltips?: boolean;
        enableLegend?: boolean;
        enableExport?: boolean;
      };
      annotations?: {
        title?: string;
        subtitle?: string;
        footnotes?: string[];
        watermark?: string;
      };
    }
  ): Promise<APIResponse<{
    visualizationId: string;
    chartUrl: string;
    embedCode: string;
    downloadUrls: Record<string, string>;
    configuration: any;
    metadata: any;
  }>> {
    const requestBody = {
      ...visualizationConfig,
      metadata: {
        createdBy: localStorage.getItem('user_id'),
        creationTimestamp: new Date().toISOString(),
        generationEngine: 'advanced-viz-engine-v2'
      }
    };

    const response = await fetch(`${this.baseURL}/visualizations/generate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      visualizationId: string;
      chartUrl: string;
      embedCode: string;
      downloadUrls: Record<string, string>;
      configuration: any;
      metadata: any;
    }>>(response);
  }

  // ============================================================================
  // EXPORT & SHARING
  // ============================================================================

  /**
   * Export data with multiple format support
   * Endpoint: POST /advanced-reporting/export
   */
  async exportData(
    exportConfig: {
      dataSource: any;
      format: 'excel' | 'csv' | 'json' | 'pdf' | 'xml' | 'parquet';
      options: {
        includeHeaders?: boolean;
        includeMetadata?: boolean;
        compression?: 'none' | 'gzip' | 'zip';
        encryption?: boolean;
        password?: string;
      };
      customization?: {
        columns?: string[];
        filters?: Record<string, any>;
        sorting?: { field: string; direction: 'asc' | 'desc' }[];
        formatting?: Record<string, any>;
      };
      delivery?: {
        method: 'download' | 'email' | 'sftp' | 'webhook';
        recipients?: string[];
        schedule?: any;
      };
    }
  ): Promise<APIResponse<{
    exportId: string;
    downloadUrl?: string;
    deliveryStatus?: any;
    fileSize: number;
    recordCount: number;
    exportMetadata: any;
  }>> {
    const requestBody = {
      ...exportConfig,
      metadata: {
        exportedBy: localStorage.getItem('user_id'),
        exportTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id')
      }
    };

    const response = await fetch(`${this.baseURL}/export`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      exportId: string;
      downloadUrl?: string;
      deliveryStatus?: any;
      fileSize: number;
      recordCount: number;
      exportMetadata: any;
    }>>(response);
  }

  /**
   * Share report or dashboard with advanced permissions
   * Endpoint: POST /advanced-reporting/share
   */
  async shareReport(
    shareConfig: {
      resourceId: string;
      resourceType: 'report' | 'dashboard' | 'visualization' | 'metric';
      shareType: 'public_link' | 'private_link' | 'embed' | 'email' | 'workspace';
      permissions: {
        view: boolean;
        edit?: boolean;
        share?: boolean;
        download?: boolean;
      };
      recipients?: {
        email?: string;
        userId?: string;
        role?: string;
        permissions?: any;
      }[];
      settings: {
        expirationDate?: string;
        passwordProtected?: boolean;
        password?: string;
        allowAnonymous?: boolean;
        trackViews?: boolean;
        watermark?: boolean;
      };
    }
  ): Promise<APIResponse<{
    shareId: string;
    shareUrl?: string;
    embedCode?: string;
    accessToken?: string;
    invitationResults?: any[];
    sharingMetadata: any;
  }>> {
    const requestBody = {
      ...shareConfig,
      metadata: {
        sharedBy: localStorage.getItem('user_id'),
        shareTimestamp: new Date().toISOString(),
        organizationId: localStorage.getItem('organization_id')
      }
    };

    const response = await fetch(`${this.baseURL}/share`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    return this.handleResponse<APIResponse<{
      shareId: string;
      shareUrl?: string;
      embedCode?: string;
      accessToken?: string;
      invitationResults?: any[];
      sharingMetadata: any;
    }>>(response);
  }

  // ============================================================================
  // REAL-TIME REPORTING & MONITORING
  // ============================================================================

  /**
   * Subscribe to real-time dashboard updates
   */
  subscribeToRealtimeDashboard(
    dashboardId: string,
    callback: (update: any) => void
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/dashboards/${dashboardId}/realtime`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        dashboardId,
        userId: localStorage.getItem('user_id'),
        subscriptionTimestamp: new Date().toISOString()
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onerror = (error) => {
      console.error('Dashboard realtime WebSocket error:', error);
    };

    const connectionId = `dashboard-${dashboardId}`;
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  /**
   * Subscribe to report generation progress
   */
  subscribeToReportProgress(
    reportId: string,
    callback: (progress: any) => void
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/reports/${reportId}/progress`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        reportId,
        includeProgress: true,
        includeLogs: true
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    const connectionId = `report-${reportId}`;
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  /**
   * Subscribe to metric alerts and threshold notifications
   */
  subscribeToMetricAlerts(
    subscriptionConfig: {
      metricIds?: string[];
      alertTypes: string[];
      callback: (alert: any) => void;
    }
  ): () => void {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/metrics/alerts`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        config: subscriptionConfig,
        userId: localStorage.getItem('user_id')
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      subscriptionConfig.callback(data);
    };

    const connectionId = this.generateRequestId();
    this.wsConnections.set(connectionId, ws);

    return () => {
      ws.close();
      this.wsConnections.delete(connectionId);
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Close all WebSocket connections
   */
  closeAllConnections(): void {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
  }

  /**
   * Clear reporting cache
   */
  clearCache(): void {
    this.reportingCache.clear();
  }

  /**
   * Get cached reporting data
   */
  getCachedData(key: string): any {
    const cached = this.reportingCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached reporting data
   */
  setCachedData(key: string, data: any, ttl: number = 300000): void {
    this.reportingCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
}

// ============================================================================
// SINGLETON INSTANCE & UTILITIES
// ============================================================================

export const reportingAPI = new ReportingAPIService();

/**
 * Enterprise utilities for reporting management
 */
export const ReportingAPIUtils = {
  /**
   * Validate reporting configuration
   */
  validateReportingConfig: (config: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.name?.trim()) {
      errors.push('Report name is required');
    }

    if (!config.templateId && !config.dataSource) {
      errors.push('Either template ID or data source is required');
    }

    if (config.timeRange) {
      const start = new Date(config.timeRange.start);
      const end = new Date(config.timeRange.end);
      if (start >= end) {
        errors.push('Start date must be before end date');
      }
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Format metrics for display
   */
  formatMetricsForDisplay: (metrics: any[]) => {
    return metrics.map(metric => ({
      ...metric,
      formattedValue: this.formatMetricValue(metric.value, metric.unit),
      trendDirection: this.getTrendDirection(metric.trend),
      statusColor: this.getMetricStatusColor(metric.status),
      changePercentage: this.calculateChangePercentage(metric.current, metric.previous)
    }));
  },

  /**
   * Format metric value with appropriate units
   */
  formatMetricValue: (value: number, unit?: string): string => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    
    if (unit === 'percentage') {
      return `${(value * 100).toFixed(2)}%`;
    }
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    
    return value.toLocaleString();
  },

  /**
   * Get trend direction from trend data
   */
  getTrendDirection: (trend?: number): 'up' | 'down' | 'stable' => {
    if (!trend) return 'stable';
    if (trend > 0.05) return 'up';
    if (trend < -0.05) return 'down';
    return 'stable';
  },

  /**
   * Get metric status color
   */
  getMetricStatusColor: (status?: string): string => {
    const statusColors = {
      'excellent': 'green',
      'good': 'blue',
      'warning': 'yellow',
      'critical': 'red',
      'unknown': 'gray'
    };
    return statusColors[status as keyof typeof statusColors] || 'gray';
  },

  /**
   * Calculate percentage change
   */
  calculateChangePercentage: (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },

  /**
   * Generate reporting summary
   */
  generateReportingSummary: (reports: any[], dashboards: any[], metrics: any[]) => ({
    totalReports: reports.length,
    activeReports: reports.filter(r => r.status === 'active').length,
    totalDashboards: dashboards.length,
    activeDashboards: dashboards.filter(d => d.status === 'active').length,
    totalMetrics: metrics.length,
    alertingMetrics: metrics.filter(m => m.hasAlerts).length,
    avgGenerationTime: reports.reduce((acc, r) => acc + (r.generationTime || 0), 0) / reports.length,
    usageScore: this.calculateUsageScore(reports, dashboards, metrics)
  }),

  /**
   * Calculate usage score
   */
  calculateUsageScore: (reports: any[], dashboards: any[], metrics: any[]): number => {
    const reportScore = Math.min(reports.length * 5, 30);
    const dashboardScore = Math.min(dashboards.length * 10, 40);
    const metricScore = Math.min(metrics.length * 3, 30);
    
    return Math.round(reportScore + dashboardScore + metricScore);
  }
};

// Export service instance
export const reportingAPIService = new ReportingAPIService();

export default reportingAPI;