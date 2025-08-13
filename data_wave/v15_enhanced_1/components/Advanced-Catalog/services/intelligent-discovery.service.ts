// ============================================================================
// INTELLIGENT DISCOVERY SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: intelligent_discovery_service.py
// AI-powered data discovery, source scanning, and metadata extraction
// ============================================================================

import axios from 'axios';
import { 
  DiscoveryConfiguration,
  DiscoveryJob,
  DiscoverySource,
  DiscoveredAsset,
  IncrementalDiscoveryConfig,
  DiscoveryDelta,
  DataProfilingResult,
  SchemaAnalysisResult,
  CatalogApiResponse
} from '../types';
import { 
  DISCOVERY_ENDPOINTS, 
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// ============================================================================
// DISCOVERY SERVICE INTERFACES
// ============================================================================

export interface CreateDiscoveryJobRequest {
  name: string;
  description?: string;
  configurationId: string;
  sources?: string[];
  schedule?: DiscoveryScheduleConfig;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notifications?: NotificationConfig[];
  metadata?: Record<string, any>;
}

export interface DiscoveryJobUpdateRequest {
  name?: string;
  description?: string;
  configurationId?: string;
  sources?: string[];
  schedule?: DiscoveryScheduleConfig;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notifications?: NotificationConfig[];
  metadata?: Record<string, any>;
}

export interface DiscoveryScheduleConfig {
  type: 'ONCE' | 'RECURRING';
  cronExpression?: string;
  startTime?: Date;
  endTime?: Date;
  timezone?: string;
  enabled?: boolean;
}

export interface NotificationConfig {
  type: 'EMAIL' | 'WEBHOOK' | 'SLACK';
  recipients: string[];
  events: string[];
  template?: string;
  settings?: Record<string, any>;
}

export interface CreateDiscoveryConfigRequest {
  name: string;
  description?: string;
  sources: string[];
  discoverySettings: DiscoverySettings;
  aiConfiguration?: AIDiscoveryConfig;
  qualitySettings?: QualityDiscoverySettings;
  outputSettings?: OutputSettings;
  metadata?: Record<string, any>;
}

export interface DiscoverySettings {
  includeTypes: string[];
  excludePatterns: string[];
  maxDepth?: number;
  samplingRate?: number;
  timeoutMinutes?: number;
  parallelism?: number;
  enableSchemaDiscovery: boolean;
  enableDataProfiling: boolean;
  enableClassification: boolean;
  enableLineageDiscovery: boolean;
  enableQualityAssessment: boolean;
}

export interface AIDiscoveryConfig {
  enabled: boolean;
  classificationModel?: string;
  embeddingModel?: string;
  confidenceThreshold?: number;
  enableNLP?: boolean;
  enablePatternRecognition?: boolean;
  enableAnomalyDetection?: boolean;
  customModels?: Array<{
    id: string;
    type: string;
    endpoint: string;
    config: any;
  }>;
}

export interface QualityDiscoverySettings {
  enabled: boolean;
  qualityRules: string[];
  customRules?: Array<{
    name: string;
    expression: string;
    severity: string;
  }>;
  scoreThreshold?: number;
  generateRecommendations?: boolean;
}

export interface OutputSettings {
  generateReports: boolean;
  reportFormats: string[];
  exportMetadata: boolean;
  createDataCatalog: boolean;
  updateExistingAssets: boolean;
  notifyStakeholders: boolean;
}

export interface CreateDiscoverySourceRequest {
  name: string;
  type: 'DATABASE' | 'FILE_SYSTEM' | 'CLOUD_STORAGE' | 'API' | 'STREAMING' | 'DATA_WAREHOUSE' | 'DATA_LAKE' | 'NOSQL';
  connectionString: string;
  credentials: CredentialsConfig;
  configuration: SourceConfiguration;
  metadata?: Record<string, any>;
}

export interface CredentialsConfig {
  type: 'USERNAME_PASSWORD' | 'TOKEN' | 'KEY_FILE' | 'IAM_ROLE' | 'SERVICE_PRINCIPAL';
  username?: string;
  password?: string;
  token?: string;
  keyFile?: string;
  properties?: Record<string, string>;
  encryptionKey?: string;
}

export interface SourceConfiguration {
  includePatterns: string[];
  excludePatterns: string[];
  maxConnections?: number;
  timeoutSeconds?: number;
  retryAttempts?: number;
  enableSsl?: boolean;
  customProperties?: Record<string, any>;
}

export interface DiscoveryJobExecutionRequest {
  sources?: string[];
  overrideConfiguration?: Partial<DiscoverySettings>;
  dryRun?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notifications?: NotificationConfig[];
}

export interface DiscoveryAnalyticsRequest {
  startDate: Date;
  endDate: Date;
  jobIds?: string[];
  sources?: string[];
  metrics: string[];
  groupBy?: string[];
}

export interface IncrementalDiscoveryRequest {
  baselineJobId: string;
  compareJobId?: string;
  changeTypes: string[];
  includeSchema?: boolean;
  includeData?: boolean;
  includeLineage?: boolean;
}

// ============================================================================
// INTELLIGENT DISCOVERY SERVICE CLASS
// ============================================================================

export class IntelligentDiscoveryService {

  // ============================================================================
  // DISCOVERY JOB MANAGEMENT
  // ============================================================================

  /**
   * Get list of discovery jobs with filtering and pagination
   */
  async getDiscoveryJobs(
    page: number = 1,
    limit: number = 20,
    status?: string,
    configurationId?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC'
  ): Promise<CatalogApiResponse<{
    jobs: DiscoveryJob[];
    totalCount: number;
    pagination: any;
  }>> {
    const params = {
      page,
      limit,
      status,
      configurationId,
      sortBy,
      sortOrder
    };

    const response = await axios.get<CatalogApiResponse<{
      jobs: DiscoveryJob[];
      totalCount: number;
      pagination: any;
    }>>(
      buildPaginatedUrl(DISCOVERY_ENDPOINTS.JOBS.LIST, page, limit, params)
    );

    return response.data;
  }

  /**
   * Create a new discovery job
   */
  async createDiscoveryJob(
    request: CreateDiscoveryJobRequest
  ): Promise<CatalogApiResponse<DiscoveryJob>> {
    const response = await axios.post<CatalogApiResponse<DiscoveryJob>>(
      DISCOVERY_ENDPOINTS.JOBS.CREATE,
      request
    );

    return response.data;
  }

  /**
   * Get discovery job by ID
   */
  async getDiscoveryJob(
    id: string,
    includeResults: boolean = false,
    includeLogs: boolean = false
  ): Promise<CatalogApiResponse<DiscoveryJob>> {
    const params = {
      includeResults,
      includeLogs
    };

    const response = await axios.get<CatalogApiResponse<DiscoveryJob>>(
      buildUrl(DISCOVERY_ENDPOINTS.JOBS.GET(id), params)
    );

    return response.data;
  }

  /**
   * Update discovery job
   */
  async updateDiscoveryJob(
    id: string,
    updates: DiscoveryJobUpdateRequest
  ): Promise<CatalogApiResponse<DiscoveryJob>> {
    const response = await axios.put<CatalogApiResponse<DiscoveryJob>>(
      DISCOVERY_ENDPOINTS.JOBS.UPDATE(id),
      updates
    );

    return response.data;
  }

  /**
   * Delete discovery job
   */
  async deleteDiscoveryJob(
    id: string,
    force: boolean = false
  ): Promise<CatalogApiResponse<void>> {
    const params = { force };

    const response = await axios.delete<CatalogApiResponse<void>>(
      buildUrl(DISCOVERY_ENDPOINTS.JOBS.DELETE(id), params)
    );

    return response.data;
  }

  /**
   * Start discovery job execution
   */
  async startDiscoveryJob(
    id: string,
    request?: DiscoveryJobExecutionRequest
  ): Promise<CatalogApiResponse<{ executionId: string; estimatedDuration: number }>> {
    const response = await axios.post<CatalogApiResponse<{ executionId: string; estimatedDuration: number }>>(
      DISCOVERY_ENDPOINTS.JOBS.START(id),
      request || {}
    );

    return response.data;
  }

  /**
   * Stop discovery job execution
   */
  async stopDiscoveryJob(
    id: string,
    graceful: boolean = true
  ): Promise<CatalogApiResponse<void>> {
    const params = { graceful };

    const response = await axios.post<CatalogApiResponse<void>>(
      buildUrl(DISCOVERY_ENDPOINTS.JOBS.STOP(id), params)
    );

    return response.data;
  }

  /**
   * Pause discovery job execution
   */
  async pauseDiscoveryJob(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      DISCOVERY_ENDPOINTS.JOBS.PAUSE(id)
    );

    return response.data;
  }

  /**
   * Resume discovery job execution
   */
  async resumeDiscoveryJob(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      DISCOVERY_ENDPOINTS.JOBS.RESUME(id)
    );

    return response.data;
  }

  /**
   * Get discovery job status and progress
   */
  async getDiscoveryJobStatus(id: string): Promise<CatalogApiResponse<{
    status: string;
    progress: any;
    currentPhase: string;
    startTime: Date;
    duration: number;
    estimatedCompletion?: Date;
  }>> {
    const response = await axios.get<CatalogApiResponse<{
      status: string;
      progress: any;
      currentPhase: string;
      startTime: Date;
      duration: number;
      estimatedCompletion?: Date;
    }>>(
      DISCOVERY_ENDPOINTS.JOBS.STATUS(id)
    );

    return response.data;
  }

  /**
   * Get discovery job execution progress
   */
  async getDiscoveryJobProgress(id: string): Promise<CatalogApiResponse<{
    totalSteps: number;
    completedSteps: number;
    currentStep: string;
    percentage: number;
    phaseProgress: any[];
    performance: any;
  }>> {
    const response = await axios.get<CatalogApiResponse<{
      totalSteps: number;
      completedSteps: number;
      currentStep: string;
      percentage: number;
      phaseProgress: any[];
      performance: any;
    }>>(
      DISCOVERY_ENDPOINTS.JOBS.PROGRESS(id)
    );

    return response.data;
  }

  /**
   * Get discovery job results
   */
  async getDiscoveryJobResults(
    id: string,
    includeAssets: boolean = true,
    includeStatistics: boolean = true
  ): Promise<CatalogApiResponse<{
    results: any;
    discoveredAssets: DiscoveredAsset[];
    statistics: any;
    summary: any;
  }>> {
    const params = {
      includeAssets,
      includeStatistics
    };

    const response = await axios.get<CatalogApiResponse<{
      results: any;
      discoveredAssets: DiscoveredAsset[];
      statistics: any;
      summary: any;
    }>>(
      buildUrl(DISCOVERY_ENDPOINTS.JOBS.RESULTS(id), params)
    );

    return response.data;
  }

  /**
   * Get discovery job execution logs
   */
  async getDiscoveryJobLogs(
    id: string,
    level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
    startTime?: Date,
    endTime?: Date,
    limit: number = 1000
  ): Promise<CatalogApiResponse<Array<{
    timestamp: Date;
    level: string;
    message: string;
    phase?: string;
    metadata?: any;
  }>>> {
    const params = {
      level,
      startTime: startTime?.toISOString(),
      endTime: endTime?.toISOString(),
      limit
    };

    const response = await axios.get<CatalogApiResponse<Array<{
      timestamp: Date;
      level: string;
      message: string;
      phase?: string;
      metadata?: any;
    }>>>(
      buildUrl(DISCOVERY_ENDPOINTS.JOBS.LOGS(id), params)
    );

    return response.data;
  }

  /**
   * Cancel discovery job execution
   */
  async cancelDiscoveryJob(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      DISCOVERY_ENDPOINTS.JOBS.CANCEL(id)
    );

    return response.data;
  }

  /**
   * Retry failed discovery job
   */
  async retryDiscoveryJob(
    id: string,
    retryFailedOnly: boolean = true
  ): Promise<CatalogApiResponse<{ newJobId: string }>> {
    const params = { retryFailedOnly };

    const response = await axios.post<CatalogApiResponse<{ newJobId: string }>>(
      buildUrl(DISCOVERY_ENDPOINTS.JOBS.RETRY(id), params)
    );

    return response.data;
  }

  /**
   * Clone discovery job
   */
  async cloneDiscoveryJob(
    id: string,
    newName: string,
    modifications?: Partial<CreateDiscoveryJobRequest>
  ): Promise<CatalogApiResponse<DiscoveryJob>> {
    const request = {
      newName,
      modifications
    };

    const response = await axios.post<CatalogApiResponse<DiscoveryJob>>(
      DISCOVERY_ENDPOINTS.JOBS.CLONE(id),
      request
    );

    return response.data;
  }

  /**
   * Export discovery job results
   */
  async exportDiscoveryJobResults(
    id: string,
    format: 'CSV' | 'EXCEL' | 'JSON' | 'PDF',
    includeAssets: boolean = true,
    includeMetadata: boolean = true
  ): Promise<CatalogApiResponse<{ downloadUrl: string; expiresAt: Date }>> {
    const request = {
      format,
      includeAssets,
      includeMetadata
    };

    const response = await axios.post<CatalogApiResponse<{ downloadUrl: string; expiresAt: Date }>>(
      DISCOVERY_ENDPOINTS.JOBS.EXPORT(id),
      request
    );

    return response.data;
  }

  // ============================================================================
  // DISCOVERY CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Get list of discovery configurations
   */
  async getDiscoveryConfigurations(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<CatalogApiResponse<{
    configurations: DiscoveryConfiguration[];
    totalCount: number;
  }>> {
    const params = { page, limit, search };

    const response = await axios.get<CatalogApiResponse<{
      configurations: DiscoveryConfiguration[];
      totalCount: number;
    }>>(
      buildPaginatedUrl(DISCOVERY_ENDPOINTS.CONFIGURATIONS.LIST, page, limit, params)
    );

    return response.data;
  }

  /**
   * Create new discovery configuration
   */
  async createDiscoveryConfiguration(
    request: CreateDiscoveryConfigRequest
  ): Promise<CatalogApiResponse<DiscoveryConfiguration>> {
    const response = await axios.post<CatalogApiResponse<DiscoveryConfiguration>>(
      DISCOVERY_ENDPOINTS.CONFIGURATIONS.CREATE,
      request
    );

    return response.data;
  }

  /**
   * Get discovery configuration by ID
   */
  async getDiscoveryConfiguration(id: string): Promise<CatalogApiResponse<DiscoveryConfiguration>> {
    const response = await axios.get<CatalogApiResponse<DiscoveryConfiguration>>(
      DISCOVERY_ENDPOINTS.CONFIGURATIONS.GET(id)
    );

    return response.data;
  }

  /**
   * Update discovery configuration
   */
  async updateDiscoveryConfiguration(
    id: string,
    updates: Partial<CreateDiscoveryConfigRequest>
  ): Promise<CatalogApiResponse<DiscoveryConfiguration>> {
    const response = await axios.put<CatalogApiResponse<DiscoveryConfiguration>>(
      DISCOVERY_ENDPOINTS.CONFIGURATIONS.UPDATE(id),
      updates
    );

    return response.data;
  }

  /**
   * Delete discovery configuration
   */
  async deleteDiscoveryConfiguration(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      DISCOVERY_ENDPOINTS.CONFIGURATIONS.DELETE(id)
    );

    return response.data;
  }

  /**
   * Validate discovery configuration
   */
  async validateDiscoveryConfiguration(
    config: CreateDiscoveryConfigRequest
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
      DISCOVERY_ENDPOINTS.CONFIGURATIONS.VALIDATE,
      config
    );

    return response.data;
  }

  /**
   * Get discovery configuration templates
   */
  async getDiscoveryConfigurationTemplates(): Promise<CatalogApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    template: Partial<CreateDiscoveryConfigRequest>;
  }>>> {
    const response = await axios.get<CatalogApiResponse<Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      template: Partial<CreateDiscoveryConfigRequest>;
    }>>>(
      DISCOVERY_ENDPOINTS.CONFIGURATIONS.TEMPLATES
    );

    return response.data;
  }

  /**
   * Duplicate discovery configuration
   */
  async duplicateDiscoveryConfiguration(
    id: string,
    newName: string
  ): Promise<CatalogApiResponse<DiscoveryConfiguration>> {
    const request = { newName };

    const response = await axios.post<CatalogApiResponse<DiscoveryConfiguration>>(
      DISCOVERY_ENDPOINTS.CONFIGURATIONS.DUPLICATE(id),
      request
    );

    return response.data;
  }

  /**
   * Test discovery configuration
   */
  async testDiscoveryConfiguration(
    id: string,
    testSources?: string[]
  ): Promise<CatalogApiResponse<{
    success: boolean;
    results: any[];
    errors: string[];
    performance: any;
  }>> {
    const request = { testSources };

    const response = await axios.post<CatalogApiResponse<{
      success: boolean;
      results: any[];
      errors: string[];
      performance: any;
    }>>(
      DISCOVERY_ENDPOINTS.CONFIGURATIONS.TEST(id),
      request
    );

    return response.data;
  }

  // ============================================================================
  // DISCOVERY SOURCE MANAGEMENT
  // ============================================================================

  /**
   * Get list of discovery sources
   */
  async getDiscoverySources(
    page: number = 1,
    limit: number = 20,
    type?: string,
    status?: string
  ): Promise<CatalogApiResponse<{
    sources: DiscoverySource[];
    totalCount: number;
  }>> {
    const params = { page, limit, type, status };

    const response = await axios.get<CatalogApiResponse<{
      sources: DiscoverySource[];
      totalCount: number;
    }>>(
      buildPaginatedUrl(DISCOVERY_ENDPOINTS.SOURCES.LIST, page, limit, params)
    );

    return response.data;
  }

  /**
   * Create new discovery source
   */
  async createDiscoverySource(
    request: CreateDiscoverySourceRequest
  ): Promise<CatalogApiResponse<DiscoverySource>> {
    const response = await axios.post<CatalogApiResponse<DiscoverySource>>(
      DISCOVERY_ENDPOINTS.SOURCES.CREATE,
      request
    );

    return response.data;
  }

  /**
   * Get discovery source by ID
   */
  async getDiscoverySource(id: string): Promise<CatalogApiResponse<DiscoverySource>> {
    const response = await axios.get<CatalogApiResponse<DiscoverySource>>(
      DISCOVERY_ENDPOINTS.SOURCES.GET(id)
    );

    return response.data;
  }

  /**
   * Update discovery source
   */
  async updateDiscoverySource(
    id: string,
    updates: Partial<CreateDiscoverySourceRequest>
  ): Promise<CatalogApiResponse<DiscoverySource>> {
    const response = await axios.put<CatalogApiResponse<DiscoverySource>>(
      DISCOVERY_ENDPOINTS.SOURCES.UPDATE(id),
      updates
    );

    return response.data;
  }

  /**
   * Delete discovery source
   */
  async deleteDiscoverySource(id: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      DISCOVERY_ENDPOINTS.SOURCES.DELETE(id)
    );

    return response.data;
  }

  /**
   * Test discovery source connection
   */
  async testDiscoverySourceConnection(id: string): Promise<CatalogApiResponse<{
    success: boolean;
    responseTime: number;
    message: string;
    details?: any;
  }>> {
    const response = await axios.post<CatalogApiResponse<{
      success: boolean;
      responseTime: number;
      message: string;
      details?: any;
    }>>(
      DISCOVERY_ENDPOINTS.SOURCES.TEST_CONNECTION(id)
    );

    return response.data;
  }

  /**
   * Scan discovery source for available assets
   */
  async scanDiscoverySource(
    id: string,
    preview: boolean = false,
    maxResults: number = 100
  ): Promise<CatalogApiResponse<{
    assets: any[];
    totalCount: number;
    scanTime: number;
  }>> {
    const params = { preview, maxResults };

    const response = await axios.post<CatalogApiResponse<{
      assets: any[];
      totalCount: number;
      scanTime: number;
    }>>(
      buildUrl(DISCOVERY_ENDPOINTS.SOURCES.SCAN(id), params)
    );

    return response.data;
  }

  /**
   * Preview discovery source data
   */
  async previewDiscoverySource(
    id: string,
    assetPath?: string,
    sampleSize: number = 10
  ): Promise<CatalogApiResponse<{
    schema: any;
    sampleData: any[];
    statistics: any;
  }>> {
    const params = { assetPath, sampleSize };

    const response = await axios.get<CatalogApiResponse<{
      schema: any;
      sampleData: any[];
      statistics: any;
    }>>(
      buildUrl(DISCOVERY_ENDPOINTS.SOURCES.PREVIEW(id), params)
    );

    return response.data;
  }

  /**
   * Get discovery source schema
   */
  async getDiscoverySourceSchema(
    id: string,
    includeColumns: boolean = true
  ): Promise<CatalogApiResponse<any>> {
    const params = { includeColumns };

    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(DISCOVERY_ENDPOINTS.SOURCES.SCHEMA(id), params)
    );

    return response.data;
  }

  /**
   * Get discovery source statistics
   */
  async getDiscoverySourceStatistics(id: string): Promise<CatalogApiResponse<{
    totalAssets: number;
    assetsByType: Record<string, number>;
    dataSize: string;
    lastScanned: Date;
    averageScanTime: number;
    successRate: number;
  }>> {
    const response = await axios.get<CatalogApiResponse<{
      totalAssets: number;
      assetsByType: Record<string, number>;
      dataSize: string;
      lastScanned: Date;
      averageScanTime: number;
      successRate: number;
    }>>(
      DISCOVERY_ENDPOINTS.SOURCES.STATISTICS(id)
    );

    return response.data;
  }

  // ============================================================================
  // INCREMENTAL DISCOVERY
  // ============================================================================

  /**
   * Get incremental discovery configurations
   */
  async getIncrementalDiscoveryConfigs(): Promise<CatalogApiResponse<IncrementalDiscoveryConfig[]>> {
    const response = await axios.get<CatalogApiResponse<IncrementalDiscoveryConfig[]>>(
      DISCOVERY_ENDPOINTS.INCREMENTAL.LIST
    );

    return response.data;
  }

  /**
   * Create incremental discovery configuration
   */
  async createIncrementalDiscoveryConfig(
    config: Omit<IncrementalDiscoveryConfig, 'id'>
  ): Promise<CatalogApiResponse<IncrementalDiscoveryConfig>> {
    const response = await axios.post<CatalogApiResponse<IncrementalDiscoveryConfig>>(
      DISCOVERY_ENDPOINTS.INCREMENTAL.CREATE,
      config
    );

    return response.data;
  }

  /**
   * Get incremental discovery changes
   */
  async getIncrementalDiscoveryChanges(
    id: string,
    request: IncrementalDiscoveryRequest
  ): Promise<CatalogApiResponse<DiscoveryDelta>> {
    const response = await axios.post<CatalogApiResponse<DiscoveryDelta>>(
      DISCOVERY_ENDPOINTS.INCREMENTAL.CHANGES(id),
      request
    );

    return response.data;
  }

  /**
   * Sync incremental discovery changes
   */
  async syncIncrementalDiscovery(
    id: string,
    changes: string[],
    applyAutomatically: boolean = false
  ): Promise<CatalogApiResponse<{
    syncedChanges: number;
    skippedChanges: number;
    errors: string[];
  }>> {
    const request = {
      changes,
      applyAutomatically
    };

    const response = await axios.post<CatalogApiResponse<{
      syncedChanges: number;
      skippedChanges: number;
      errors: string[];
    }>>(
      DISCOVERY_ENDPOINTS.INCREMENTAL.SYNC(id),
      request
    );

    return response.data;
  }

  /**
   * Create baseline for incremental discovery
   */
  async createIncrementalBaseline(
    id: string,
    jobId: string
  ): Promise<CatalogApiResponse<{ baselineId: string }>> {
    const request = { jobId };

    const response = await axios.post<CatalogApiResponse<{ baselineId: string }>>(
      DISCOVERY_ENDPOINTS.INCREMENTAL.BASELINE(id),
      request
    );

    return response.data;
  }

  // ============================================================================
  // DISCOVERY ANALYTICS
  // ============================================================================

  /**
   * Get discovery analytics overview
   */
  async getDiscoveryAnalyticsOverview(
    startDate: Date,
    endDate: Date
  ): Promise<CatalogApiResponse<{
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    averageExecutionTime: number;
    totalAssetsDiscovered: number;
    topSources: any[];
    performanceTrends: any[];
  }>> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };

    const response = await axios.get<CatalogApiResponse<{
      totalJobs: number;
      successfulJobs: number;
      failedJobs: number;
      averageExecutionTime: number;
      totalAssetsDiscovered: number;
      topSources: any[];
      performanceTrends: any[];
    }>>(
      buildUrl(DISCOVERY_ENDPOINTS.ANALYTICS.OVERVIEW, params)
    );

    return response.data;
  }

  /**
   * Get discovery performance analytics
   */
  async getDiscoveryPerformanceAnalytics(
    request: DiscoveryAnalyticsRequest
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      DISCOVERY_ENDPOINTS.ANALYTICS.PERFORMANCE,
      request
    );

    return response.data;
  }

  /**
   * Get discovery trend analytics
   */
  async getDiscoveryTrendAnalytics(
    period: string = '30d',
    granularity: 'HOUR' | 'DAY' | 'WEEK' = 'DAY'
  ): Promise<CatalogApiResponse<any>> {
    const params = { period, granularity };

    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(DISCOVERY_ENDPOINTS.ANALYTICS.TRENDS, params)
    );

    return response.data;
  }

  /**
   * Get discovery success rate analytics
   */
  async getDiscoverySuccessRateAnalytics(
    period: string = '30d'
  ): Promise<CatalogApiResponse<{
    overallSuccessRate: number;
    successRateBySource: any[];
    successRateByConfiguration: any[];
    trendData: any[];
  }>> {
    const params = { period };

    const response = await axios.get<CatalogApiResponse<{
      overallSuccessRate: number;
      successRateBySource: any[];
      successRateByConfiguration: any[];
      trendData: any[];
    }>>(
      buildUrl(DISCOVERY_ENDPOINTS.ANALYTICS.SUCCESS_RATE, params)
    );

    return response.data;
  }

  /**
   * Get discovery error analysis
   */
  async getDiscoveryErrorAnalysis(
    period: string = '30d'
  ): Promise<CatalogApiResponse<{
    totalErrors: number;
    errorsByType: any[];
    errorsBySource: any[];
    commonErrors: any[];
    resolutionSuggestions: any[];
  }>> {
    const params = { period };

    const response = await axios.get<CatalogApiResponse<{
      totalErrors: number;
      errorsByType: any[];
      errorsBySource: any[];
      commonErrors: any[];
      resolutionSuggestions: any[];
    }>>(
      buildUrl(DISCOVERY_ENDPOINTS.ANALYTICS.ERROR_ANALYSIS, params)
    );

    return response.data;
  }

  /**
   * Get discovery optimization recommendations
   */
  async getDiscoveryOptimizationRecommendations(): Promise<CatalogApiResponse<Array<{
    type: string;
    title: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    effort: 'LOW' | 'MEDIUM' | 'HIGH';
    category: string;
    implementation: string;
  }>>> {
    const response = await axios.get<CatalogApiResponse<Array<{
      type: string;
      title: string;
      description: string;
      impact: 'LOW' | 'MEDIUM' | 'HIGH';
      effort: 'LOW' | 'MEDIUM' | 'HIGH';
      category: string;
      implementation: string;
    }>>>(
      DISCOVERY_ENDPOINTS.ANALYTICS.RECOMMENDATIONS
    );

    return response.data;
  }
}

// ============================================================================
// EXPORT SERVICE INSTANCE
// ============================================================================

export const intelligentDiscoveryService = new IntelligentDiscoveryService();
export default intelligentDiscoveryService;