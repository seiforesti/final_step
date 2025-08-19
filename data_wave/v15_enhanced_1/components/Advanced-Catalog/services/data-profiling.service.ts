// ============================================================================
// DATA PROFILING SERVICE - ENTERPRISE DATA GOVERNANCE SYSTEM
// ============================================================================
// Maps to: data_profiling_service.py
// Advanced statistical data profiling and analysis capabilities
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { 
  DataProfilingResult,
  ProfilingRequest,
  ProfilingConfig,
  StatisticalMetrics,
  DataDistribution,
  DataQualityProfile,
  ProfilingJob,
  ProfilingJobStatus,
  CatalogApiResponse,
  PaginationRequest
} from '../types';
import { 
  DATA_PROFILING_ENDPOINTS, 
  API_CONFIG,
  buildUrl,
  buildPaginatedUrl 
} from '../constants';

// ============================================================================
// PROFILING REQUEST INTERFACES
// ============================================================================

export interface CreateProfilingJobRequest {
  assetId: string;
  config: ProfilingConfig;
  type: 'BASIC' | 'ADVANCED' | 'COMPREHENSIVE' | 'CUSTOM';
  scheduleConfig?: {
    frequency: 'MANUAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    cronExpression?: string;
  };
  notificationConfig?: {
    onComplete: boolean;
    onFailure: boolean;
    recipients: string[];
  };
  metadata?: Record<string, any>;
}

export interface ProfilingJobUpdateRequest {
  status?: ProfilingJobStatus;
  config?: Partial<ProfilingConfig>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  metadata?: Record<string, any>;
}

export interface ProfilingAnalyticsRequest {
  timeRange?: {
    start: Date;
    end: Date;
  };
  aggregationType?: 'COUNT' | 'AVERAGE' | 'SUM' | 'MIN' | 'MAX';
  groupBy?: string[];
  filters?: Record<string, any>;
}

export interface ColumnProfilingRequest {
  assetId: string;
  columnNames: string[];
  profilingType: 'STATISTICAL' | 'PATTERN' | 'QUALITY' | 'ALL';
  sampleSize?: number;
  includeNulls?: boolean;
}

export interface CustomProfilingRequest {
  assetId: string;
  customRules: ProfilingRule[];
  computeStatistics: boolean;
  generateReport: boolean;
}

export interface ProfilingRule {
  name: string;
  type: 'PATTERN' | 'RANGE' | 'ENUM' | 'CUSTOM';
  column: string;
  condition: string;
  expectedValue?: any;
  tolerance?: number;
}

// ============================================================================
// DATA PROFILING SERVICE CLASS
// ============================================================================

export class DataProfilingService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // ============================================================================
  // PROFILING JOB MANAGEMENT
  // ============================================================================

  /**
   * Create a new data profiling job
   */
  async createProfilingJob(request: CreateProfilingJobRequest): Promise<CatalogApiResponse<ProfilingJob>> {
    const response = await axios.post<CatalogApiResponse<ProfilingJob>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.CREATE_JOB),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get profiling job by ID
   */
  async getProfilingJob(jobId: string): Promise<CatalogApiResponse<ProfilingJob>> {
    const response = await axios.get<CatalogApiResponse<ProfilingJob>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_JOB, { jobId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update profiling job
   */
  async updateProfilingJob(
    jobId: string, 
    request: ProfilingJobUpdateRequest
  ): Promise<CatalogApiResponse<ProfilingJob>> {
    const response = await axios.put<CatalogApiResponse<ProfilingJob>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.UPDATE_JOB, { jobId }),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Delete profiling job
   */
  async deleteProfilingJob(jobId: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.DELETE_JOB, { jobId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * List profiling jobs with pagination
   */
  async listProfilingJobs(pagination: PaginationRequest): Promise<CatalogApiResponse<ProfilingJob[]>> {
    const response = await axios.get<CatalogApiResponse<ProfilingJob[]>>(
      buildPaginatedUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.LIST_JOBS, pagination),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Execute profiling job
   */
  async executeProfilingJob(jobId: string): Promise<CatalogApiResponse<ProfilingResult>> {
    const response = await axios.post<CatalogApiResponse<ProfilingResult>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.EXECUTE_JOB, { jobId }),
      {},
      { timeout: this.timeout * 3 } // Longer timeout for execution
    );
    return response.data;
  }

  /**
   * Cancel running profiling job
   */
  async cancelProfilingJob(jobId: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.post<CatalogApiResponse<void>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.CANCEL_JOB, { jobId }),
      {},
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // PROFILING RESULTS
  // ============================================================================

  /**
   * Get profiling results for an asset
   */
  async getProfilingResults(assetId: string): Promise<CatalogApiResponse<DataProfilingResult[]>> {
    const response = await axios.get<CatalogApiResponse<DataProfilingResult[]>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_RESULTS, { assetId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get latest profiling result for an asset
   */
  async getLatestProfilingResult(assetId: string): Promise<CatalogApiResponse<DataProfilingResult>> {
    const response = await axios.get<CatalogApiResponse<DataProfilingResult>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_LATEST_RESULT, { assetId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get profiling result by ID
   */
  async getProfilingResultById(resultId: string): Promise<CatalogApiResponse<DataProfilingResult>> {
    const response = await axios.get<CatalogApiResponse<DataProfilingResult>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_RESULT_BY_ID, { resultId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Delete profiling result
   */
  async deleteProfilingResult(resultId: string): Promise<CatalogApiResponse<void>> {
    const response = await axios.delete<CatalogApiResponse<void>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.DELETE_RESULT, { resultId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // STATISTICAL ANALYSIS
  // ============================================================================

  /**
   * Get statistical metrics for columns
   */
  async getStatisticalMetrics(assetId: string, columnNames?: string[]): Promise<CatalogApiResponse<StatisticalMetrics[]>> {
    const response = await axios.post<CatalogApiResponse<StatisticalMetrics[]>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_STATISTICS, { assetId }),
      { columnNames },
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get data distribution for a column
   */
  async getDataDistribution(
    assetId: string, 
    columnName: string, 
    binCount?: number
  ): Promise<CatalogApiResponse<DataDistribution>> {
    const response = await axios.get<CatalogApiResponse<DataDistribution>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_DISTRIBUTION, { assetId, columnName }),
      { 
        params: { binCount },
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Get data quality profile
   */
  async getDataQualityProfile(assetId: string): Promise<CatalogApiResponse<DataQualityProfile>> {
    const response = await axios.get<CatalogApiResponse<DataQualityProfile>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_QUALITY_PROFILE, { assetId }),
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // CUSTOM PROFILING
  // ============================================================================

  /**
   * Perform column-specific profiling
   */
  async profileColumns(request: ColumnProfilingRequest): Promise<CatalogApiResponse<DataProfilingResult>> {
    const response = await axios.post<CatalogApiResponse<DataProfilingResult>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.PROFILE_COLUMNS),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Execute custom profiling rules
   */
  async executeCustomProfiling(request: CustomProfilingRequest): Promise<CatalogApiResponse<DataProfilingResult>> {
    const response = await axios.post<CatalogApiResponse<DataProfilingResult>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.CUSTOM_PROFILING),
      request,
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }

  /**
   * Validate profiling rules
   */
  async validateProfilingRules(rules: ProfilingRule[]): Promise<CatalogApiResponse<{ valid: boolean; errors: string[] }>> {
    const response = await axios.post<CatalogApiResponse<{ valid: boolean; errors: string[] }>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.VALIDATE_RULES),
      { rules },
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // PROFILING ANALYTICS
  // ============================================================================

  /**
   * Get profiling analytics
   */
  async getProfilingAnalytics(request: ProfilingAnalyticsRequest): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_ANALYTICS),
      request,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get profiling trends over time
   */
  async getProfilingTrends(
    assetId: string, 
    timeRange: { start: Date; end: Date }
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.get<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_TRENDS, { assetId }),
      { 
        params: timeRange,
        timeout: this.timeout 
      }
    );
    return response.data;
  }

  /**
   * Compare profiling results
   */
  async compareProfilingResults(
    resultId1: string, 
    resultId2: string
  ): Promise<CatalogApiResponse<any>> {
    const response = await axios.post<CatalogApiResponse<any>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.COMPARE_RESULTS),
      { resultId1, resultId2 },
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Get default profiling configuration
   */
  async getDefaultProfilingConfig(): Promise<CatalogApiResponse<ProfilingConfig>> {
    const response = await axios.get<CatalogApiResponse<ProfilingConfig>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_DEFAULT_CONFIG),
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Update default profiling configuration
   */
  async updateDefaultProfilingConfig(config: ProfilingConfig): Promise<CatalogApiResponse<ProfilingConfig>> {
    const response = await axios.put<CatalogApiResponse<ProfilingConfig>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.UPDATE_DEFAULT_CONFIG),
      config,
      { timeout: this.timeout }
    );
    return response.data;
  }

  /**
   * Get profiling templates
   */
  async getProfilingTemplates(): Promise<CatalogApiResponse<ProfilingConfig[]>> {
    const response = await axios.get<CatalogApiResponse<ProfilingConfig[]>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GET_TEMPLATES),
      { timeout: this.timeout }
    );
    return response.data;
  }

  // ============================================================================
  // EXPORT CAPABILITIES
  // ============================================================================

  /**
   * Export profiling results to various formats
   */
  async exportProfilingResults(
    resultId: string, 
    format: 'JSON' | 'CSV' | 'EXCEL' | 'PDF'
  ): Promise<Blob> {
    const response = await axios.get(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.EXPORT_RESULTS, { resultId }),
      { 
        params: { format },
        responseType: 'blob',
        timeout: this.timeout * 2
      }
    );
    return response.data;
  }

  /**
   * Generate profiling report
   */
  async generateProfilingReport(
    assetId: string, 
    includeCharts: boolean = true
  ): Promise<CatalogApiResponse<string>> {
    const response = await axios.post<CatalogApiResponse<string>>(
      buildUrl(this.baseURL, DATA_PROFILING_ENDPOINTS.GENERATE_REPORT, { assetId }),
      { includeCharts },
      { timeout: this.timeout * 2 }
    );
    return response.data;
  }
}

// Create and export singleton instance
export const dataProfilingService = new DataProfilingService();
export default dataProfilingService;