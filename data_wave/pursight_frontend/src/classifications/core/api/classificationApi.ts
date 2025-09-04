/**
 * Advanced Classification API Integration Layer - Version 1 (Manual & Rule-Based)
 * Enterprise-grade API client for manual classification operations
 * Comprehensive integration with backend classification services
 */

import {
  ApiResponse,
  ClassificationFramework,
  ClassificationRule,
  ClassificationPolicy,
  BulkOperation,
  ClassificationResult,
  PaginationParams,
  SortParams,
  FilterParams,
  SearchParams,
  ValidationResult,
  BulkOperationResult,
  AuditTrailEntry,
  NotificationSettings,
  ResourceUsage
} from '../types'

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

interface ApiClientConfig {
  baseURL: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  enableCaching: boolean
  cacheTimeout: number
  enableInterceptors: boolean
  enableMetrics: boolean
}

interface RequestOptions {
  timeout?: number
  retries?: number
  cache?: boolean
  signal?: AbortSignal
  metadata?: Record<string, any>
}

interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  requestId: string
  statusCode: number
}

// ============================================================================
// BASE API CLIENT CLASS
// ============================================================================

class BaseApiClient {
  private config: ApiClientConfig
  private requestInterceptors: Array<(config: any) => any> = []
  private responseInterceptors: Array<(response: any) => any> = []
  private cache: Map<string, any> = new Map()
  private metrics: Map<string, any> = new Map()

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || '/api/proxy',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableInterceptors: true,
      enableMetrics: true,
      ...config
    }

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    if (this.config.enableInterceptors) {
      // Request interceptor for authentication and metrics
      this.addRequestInterceptor((config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId()
        
        // Start metrics tracking
        if (this.config.enableMetrics) {
          this.startRequestMetrics(config.url, config.method)
        }

        return config
      })

      // Response interceptor for error handling and metrics
      this.addResponseInterceptor((response) => {
        // Complete metrics tracking
        if (this.config.enableMetrics) {
          this.completeRequestMetrics(response.config.url, response.status, response.data)
        }

        return response
      })
    }
  }

  private getAuthToken(): string | null {
    // Implementation would get token from secure storage
    return localStorage.getItem('auth_token')
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private startRequestMetrics(url: string, method: string): void {
    if (this.config.enableMetrics) {
      const key = `${method}:${url}`
      this.metrics.set(key, {
        startTime: Date.now(),
        method,
        url
      })
    }
  }

  private completeRequestMetrics(url: string, status: number, data: any): void {
    if (this.config.enableMetrics) {
      const key = `${url}`
      const startMetrics = this.metrics.get(key)
      if (startMetrics) {
        const duration = Date.now() - startMetrics.startTime
        const metrics = {
          ...startMetrics,
          duration,
          status,
          responseSize: JSON.stringify(data).length,
          endTime: Date.now()
        }
        
        // Store metrics for analytics
        this.storeMetrics(metrics)
        this.metrics.delete(key)
      }
    }
  }

  private storeMetrics(metrics: any): void {
    // Implementation would send metrics to analytics service
    console.debug('API Metrics:', metrics)
  }

  private addRequestInterceptor(interceptor: (config: any) => any): void {
    this.requestInterceptors.push(interceptor)
  }

  private addResponseInterceptor(interceptor: (response: any) => any): void {
    this.responseInterceptors.push(interceptor)
  }

  private getCacheKey(url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : ''
    return `${url}:${paramsStr}`
  }

  private getFromCache(key: string): any | null {
    if (!this.config.enableCaching) return null
    
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.data
    }
    
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    if (this.config.enableCaching) {
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      })
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected async request<T>(
    method: string,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.config.baseURL}${url}`
    const cacheKey = this.getCacheKey(fullUrl, { method, data })

    // Check cache for GET requests
    if (method === 'GET') {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    let lastError: ApiError | null = null
    const maxRetries = options.retries ?? this.config.retryAttempts

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Apply request interceptors
        let requestConfig: any = {
          method,
          url: fullUrl,
          data,
          timeout: options.timeout ?? this.config.timeout,
          signal: options.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }

        for (const interceptor of this.requestInterceptors) {
          requestConfig = interceptor(requestConfig)
        }

        // Make the actual request
        const response = await this.performRequest(requestConfig)

        // Apply response interceptors
        let processedResponse = response
        for (const interceptor of this.responseInterceptors) {
          processedResponse = interceptor(processedResponse)
        }

        // Cache successful GET requests
        if (method === 'GET' && processedResponse.status >= 200 && processedResponse.status < 300) {
          this.setCache(cacheKey, processedResponse.data)
        }

        return processedResponse.data

      } catch (error: any) {
        lastError = this.createApiError(error, attempt, maxRetries)

        // Don't retry for certain errors
        if (this.shouldNotRetry(error)) {
          throw lastError
        }

        // Wait before retrying
        if (attempt < maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt)
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  private async performRequest(config: any): Promise<any> {
    // Implementation would use fetch or axios
    // This is a simplified version
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.data ? JSON.stringify(config.data) : undefined,
      signal: config.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return { data, status: response.status, config }
  }

  private createApiError(error: any, attempt: number, maxRetries: number): ApiError {
    return {
      code: error.code || 'API_ERROR',
      message: error.message || 'An error occurred',
      details: error.response?.data || error,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      statusCode: error.response?.status || 500
    }
  }

  private shouldNotRetry(error: any): boolean {
    // Don't retry for 4xx errors (except 429)
    const status = error.response?.status
    return status >= 400 && status < 500 && status !== 429
  }

  // Public methods for cache management
  public clearCache(): void {
    this.cache.clear()
  }

  public getCacheSize(): number {
    return this.cache.size
  }

  public getMetrics(): any[] {
    return Array.from(this.metrics.values())
  }
}

// ============================================================================
// CLASSIFICATION FRAMEWORK API
// ============================================================================

export class ClassificationFrameworkApi extends BaseApiClient {
  private readonly endpoint = '/api/classifications/frameworks'

  /**
   * Create a new classification framework
   */
  async createFramework(
    framework: Omit<ClassificationFramework, 'id' | 'created_at' | 'updated_at'>,
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationFramework>> {
    return this.request('POST', this.endpoint, framework, options)
  }

  /**
   * Get all classification frameworks with advanced filtering and pagination
   */
  async getFrameworks(
    params?: {
      pagination?: PaginationParams
      sort?: SortParams[]
      filters?: FilterParams[]
      search?: SearchParams
      include_inactive?: boolean
      domain?: string
      category?: string
    },
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationFramework[]>> {
    const queryParams = new URLSearchParams()
    
    if (params?.pagination) {
      queryParams.append('page', params.pagination.page.toString())
      queryParams.append('limit', params.pagination.limit.toString())
    }
    
    if (params?.sort) {
      params.sort.forEach(sort => {
        queryParams.append('sort', `${sort.field}:${sort.direction}`)
      })
    }
    
    if (params?.filters) {
      params.filters.forEach(filter => {
        queryParams.append('filter', `${filter.field}:${filter.operator}:${filter.value}`)
      })
    }
    
    if (params?.search) {
      queryParams.append('search', params.search.query)
      if (params.search.fields) {
        queryParams.append('search_fields', params.search.fields.join(','))
      }
    }

    if (params?.include_inactive) {
      queryParams.append('include_inactive', 'true')
    }

    if (params?.domain) {
      queryParams.append('domain', params.domain)
    }

    if (params?.category) {
      queryParams.append('category', params.category)
    }

    const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint
    return this.request('GET', url, undefined, options)
  }

  /**
   * Get a specific framework by ID with detailed information
   */
  async getFramework(
    id: number,
    options?: RequestOptions & { include_rules?: boolean; include_policies?: boolean }
  ): Promise<ApiResponse<ClassificationFramework>> {
    const queryParams = new URLSearchParams()
    
    if (options?.include_rules) {
      queryParams.append('include_rules', 'true')
    }
    
    if (options?.include_policies) {
      queryParams.append('include_policies', 'true')
    }

    const url = queryParams.toString() 
      ? `${this.endpoint}/${id}?${queryParams}` 
      : `${this.endpoint}/${id}`
    
    return this.request('GET', url, undefined, options)
  }

  /**
   * Update an existing framework
   */
  async updateFramework(
    id: number,
    updates: Partial<ClassificationFramework>,
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationFramework>> {
    return this.request('PUT', `${this.endpoint}/${id}`, updates, options)
  }

  /**
   * Delete a framework
   */
  async deleteFramework(
    id: number,
    options?: RequestOptions & { force?: boolean }
  ): Promise<ApiResponse<void>> {
    const queryParams = new URLSearchParams()
    if (options?.force) {
      queryParams.append('force', 'true')
    }

    const url = queryParams.toString() 
      ? `${this.endpoint}/${id}?${queryParams}` 
      : `${this.endpoint}/${id}`
    
    return this.request('DELETE', url, undefined, options)
  }

  /**
   * Activate/Deactivate a framework
   */
  async toggleFrameworkStatus(
    id: number,
    active: boolean,
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationFramework>> {
    return this.request('PATCH', `${this.endpoint}/${id}/status`, { active }, options)
  }

  /**
   * Duplicate a framework
   */
  async duplicateFramework(
    id: number,
    newName: string,
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationFramework>> {
    return this.request('POST', `${this.endpoint}/${id}/duplicate`, { name: newName }, options)
  }

  /**
   * Export framework configuration
   */
  async exportFramework(
    id: number,
    format: 'json' | 'yaml' | 'csv' = 'json',
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams({ format })
    return this.request('GET', `${this.endpoint}/${id}/export?${queryParams}`, undefined, options)
  }

  /**
   * Import framework configuration
   */
  async importFramework(
    file: File,
    options?: RequestOptions & { validate_only?: boolean }
  ): Promise<ApiResponse<ClassificationFramework | ValidationResult>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (options?.validate_only) {
      formData.append('validate_only', 'true')
    }

    return this.request('POST', `${this.endpoint}/import`, formData, options)
  }

  /**
   * Get framework analytics and metrics
   */
  async getFrameworkAnalytics(
    id: number,
    timeRange?: { start: string; end: string },
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    
    if (timeRange) {
      queryParams.append('start_date', timeRange.start)
      queryParams.append('end_date', timeRange.end)
    }

    const url = queryParams.toString() 
      ? `${this.endpoint}/${id}/analytics?${queryParams}` 
      : `${this.endpoint}/${id}/analytics`
    
    return this.request('GET', url, undefined, options)
  }

  /**
   * Validate framework configuration
   */
  async validateFramework(
    framework: Partial<ClassificationFramework>,
    options?: RequestOptions
  ): Promise<ApiResponse<ValidationResult>> {
    return this.request('POST', `${this.endpoint}/validate`, framework, options)
  }
}

// ============================================================================
// CLASSIFICATION RULES API
// ============================================================================

export class ClassificationRulesApi extends BaseApiClient {
  private readonly endpoint = '/api/classifications/rules'

  /**
   * Create a new classification rule
   */
  async createRule(
    rule: Omit<ClassificationRule, 'id' | 'created_at' | 'updated_at'>,
    options?: RequestOptions & { validate_only?: boolean }
  ): Promise<ApiResponse<ClassificationRule | ValidationResult>> {
    const data = { ...rule }
    if (options?.validate_only) {
      data.validate_only = true
    }

    return this.request('POST', this.endpoint, data, options)
  }

  /**
   * Get rules with advanced filtering and performance metrics
   */
  async getRules(
    params?: {
      framework_id?: number
      pagination?: PaginationParams
      sort?: SortParams[]
      filters?: FilterParams[]
      search?: SearchParams
      include_performance?: boolean
      rule_type?: string
      sensitivity_level?: string
    },
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationRule[]>> {
    const queryParams = new URLSearchParams()

    if (params?.framework_id) {
      queryParams.append('framework_id', params.framework_id.toString())
    }
    
    if (params?.pagination) {
      queryParams.append('page', params.pagination.page.toString())
      queryParams.append('limit', params.pagination.limit.toString())
    }
    
    if (params?.sort) {
      params.sort.forEach(sort => {
        queryParams.append('sort', `${sort.field}:${sort.direction}`)
      })
    }
    
    if (params?.filters) {
      params.filters.forEach(filter => {
        queryParams.append('filter', `${filter.field}:${filter.operator}:${filter.value}`)
      })
    }
    
    if (params?.search) {
      queryParams.append('search', params.search.query)
    }

    if (params?.include_performance) {
      queryParams.append('include_performance', 'true')
    }

    if (params?.rule_type) {
      queryParams.append('rule_type', params.rule_type)
    }

    if (params?.sensitivity_level) {
      queryParams.append('sensitivity_level', params.sensitivity_level)
    }

    const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint
    return this.request('GET', url, undefined, options)
  }

  /**
   * Get a specific rule by ID
   */
  async getRule(
    id: number,
    options?: RequestOptions & { include_performance?: boolean }
  ): Promise<ApiResponse<ClassificationRule>> {
    const queryParams = new URLSearchParams()
    
    if (options?.include_performance) {
      queryParams.append('include_performance', 'true')
    }

    const url = queryParams.toString() 
      ? `${this.endpoint}/${id}?${queryParams}` 
      : `${this.endpoint}/${id}`
    
    return this.request('GET', url, undefined, options)
  }

  /**
   * Update an existing rule
   */
  async updateRule(
    id: number,
    updates: Partial<ClassificationRule>,
    options?: RequestOptions & { validate_only?: boolean }
  ): Promise<ApiResponse<ClassificationRule | ValidationResult>> {
    const data = { ...updates }
    if (options?.validate_only) {
      data.validate_only = true
    }

    return this.request('PUT', `${this.endpoint}/${id}`, data, options)
  }

  /**
   * Delete a rule
   */
  async deleteRule(
    id: number,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.request('DELETE', `${this.endpoint}/${id}`, undefined, options)
  }

  /**
   * Test a rule against sample data
   */
  async testRule(
    ruleId: number,
    testData: any[],
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    return this.request('POST', `${this.endpoint}/${ruleId}/test`, { test_data: testData }, options)
  }

  /**
   * Bulk create rules
   */
  async bulkCreateRules(
    rules: Omit<ClassificationRule, 'id' | 'created_at' | 'updated_at'>[],
    options?: RequestOptions & { 
      validate_only?: boolean
      error_handling?: 'continue' | 'stop_on_error' | 'rollback'
    }
  ): Promise<ApiResponse<BulkOperationResult>> {
    const data = {
      rules,
      validate_only: options?.validate_only || false,
      error_handling: options?.error_handling || 'continue'
    }

    return this.request('POST', `${this.endpoint}/bulk`, data, options)
  }

  /**
   * Get rule performance analytics
   */
  async getRulePerformance(
    ruleId: number,
    timeRange?: { start: string; end: string },
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    
    if (timeRange) {
      queryParams.append('start_date', timeRange.start)
      queryParams.append('end_date', timeRange.end)
    }

    const url = queryParams.toString() 
      ? `${this.endpoint}/${ruleId}/performance?${queryParams}` 
      : `${this.endpoint}/${ruleId}/performance`
    
    return this.request('GET', url, undefined, options)
  }

  /**
   * Optimize rule performance
   */
  async optimizeRule(
    ruleId: number,
    optimizationConfig?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationRule>> {
    return this.request('POST', `${this.endpoint}/${ruleId}/optimize`, optimizationConfig, options)
  }
}

// ============================================================================
// BULK OPERATIONS API
// ============================================================================

export class BulkOperationsApi extends BaseApiClient {
  private readonly endpoint = '/api/classifications/bulk-upload'

  /**
   * Upload files for bulk classification
   */
  async uploadBulkFile(
    file: File,
    frameworkId?: number,
    options?: RequestOptions & {
      file_type?: string
      encoding?: string
      delimiter?: string
      batch_size?: number
      parallel_processing?: boolean
    }
  ): Promise<ApiResponse<BulkOperation>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (frameworkId) {
      formData.append('framework_id', frameworkId.toString())
    }
    
    if (options?.file_type) {
      formData.append('file_type', options.file_type)
    }
    
    if (options?.encoding) {
      formData.append('encoding', options.encoding)
    }
    
    if (options?.delimiter) {
      formData.append('delimiter', options.delimiter)
    }
    
    if (options?.batch_size) {
      formData.append('batch_size', options.batch_size.toString())
    }
    
    if (options?.parallel_processing) {
      formData.append('parallel_processing', 'true')
    }

    return this.request('POST', this.endpoint, formData, options)
  }

  /**
   * Get bulk operation status
   */
  async getBulkOperation(
    operationId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<BulkOperation>> {
    return this.request('GET', `${this.endpoint}/${operationId}`, undefined, options)
  }

  /**
   * Get all bulk operations
   */
  async getBulkOperations(
    params?: {
      pagination?: PaginationParams
      sort?: SortParams[]
      filters?: FilterParams[]
      status?: string
      operation_type?: string
    },
    options?: RequestOptions
  ): Promise<ApiResponse<BulkOperation[]>> {
    const queryParams = new URLSearchParams()
    
    if (params?.pagination) {
      queryParams.append('page', params.pagination.page.toString())
      queryParams.append('limit', params.pagination.limit.toString())
    }
    
    if (params?.sort) {
      params.sort.forEach(sort => {
        queryParams.append('sort', `${sort.field}:${sort.direction}`)
      })
    }
    
    if (params?.filters) {
      params.filters.forEach(filter => {
        queryParams.append('filter', `${filter.field}:${filter.operator}:${filter.value}`)
      })
    }
    
    if (params?.status) {
      queryParams.append('status', params.status)
    }
    
    if (params?.operation_type) {
      queryParams.append('operation_type', params.operation_type)
    }

    const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint
    return this.request('GET', url, undefined, options)
  }

  /**
   * Cancel a bulk operation
   */
  async cancelBulkOperation(
    operationId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<BulkOperation>> {
    return this.request('POST', `${this.endpoint}/${operationId}/cancel`, undefined, options)
  }

  /**
   * Download bulk operation results
   */
  async downloadBulkResults(
    operationId: string,
    format: 'json' | 'csv' | 'xlsx' = 'csv',
    options?: RequestOptions
  ): Promise<ApiResponse<Blob>> {
    const queryParams = new URLSearchParams({ format })
    return this.request('GET', `${this.endpoint}/${operationId}/download?${queryParams}`, undefined, options)
  }

  /**
   * Retry failed items in bulk operation
   */
  async retryBulkOperation(
    operationId: string,
    failedItemIds?: string[],
    options?: RequestOptions
  ): Promise<ApiResponse<BulkOperation>> {
    const data = failedItemIds ? { failed_item_ids: failedItemIds } : undefined
    return this.request('POST', `${this.endpoint}/${operationId}/retry`, data, options)
  }
}

// ============================================================================
// CLASSIFICATION RESULTS API
// ============================================================================

export class ClassificationResultsApi extends BaseApiClient {
  private readonly endpoint = '/api/classifications/results'

  /**
   * Get classification results with advanced filtering
   */
  async getResults(
    params?: {
      pagination?: PaginationParams
      sort?: SortParams[]
      filters?: FilterParams[]
      search?: SearchParams
      classification_type?: string
      confidence_threshold?: number
      date_range?: { start: string; end: string }
    },
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationResult[]>> {
    const queryParams = new URLSearchParams()
    
    if (params?.pagination) {
      queryParams.append('page', params.pagination.page.toString())
      queryParams.append('limit', params.pagination.limit.toString())
    }
    
    if (params?.sort) {
      params.sort.forEach(sort => {
        queryParams.append('sort', `${sort.field}:${sort.direction}`)
      })
    }
    
    if (params?.filters) {
      params.filters.forEach(filter => {
        queryParams.append('filter', `${filter.field}:${filter.operator}:${filter.value}`)
      })
    }
    
    if (params?.search) {
      queryParams.append('search', params.search.query)
    }
    
    if (params?.classification_type) {
      queryParams.append('classification_type', params.classification_type)
    }
    
    if (params?.confidence_threshold) {
      queryParams.append('confidence_threshold', params.confidence_threshold.toString())
    }
    
    if (params?.date_range) {
      queryParams.append('start_date', params.date_range.start)
      queryParams.append('end_date', params.date_range.end)
    }

    const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint
    return this.request('GET', url, undefined, options)
  }

  /**
   * Get a specific classification result
   */
  async getResult(
    id: number,
    options?: RequestOptions & { include_audit_trail?: boolean }
  ): Promise<ApiResponse<ClassificationResult>> {
    const queryParams = new URLSearchParams()
    
    if (options?.include_audit_trail) {
      queryParams.append('include_audit_trail', 'true')
    }

    const url = queryParams.toString() 
      ? `${this.endpoint}/${id}?${queryParams}` 
      : `${this.endpoint}/${id}`
    
    return this.request('GET', url, undefined, options)
  }

  /**
   * Validate a classification result
   */
  async validateResult(
    id: number,
    validation: {
      status: 'validated' | 'rejected' | 'requires_review'
      comments?: string
      validator_notes?: string
    },
    options?: RequestOptions
  ): Promise<ApiResponse<ClassificationResult>> {
    return this.request('PATCH', `${this.endpoint}/${id}/validate`, validation, options)
  }

  /**
   * Export classification results
   */
  async exportResults(
    filters?: FilterParams[],
    format: 'json' | 'csv' | 'xlsx' = 'csv',
    options?: RequestOptions
  ): Promise<ApiResponse<Blob>> {
    const queryParams = new URLSearchParams({ format })
    
    if (filters) {
      filters.forEach(filter => {
        queryParams.append('filter', `${filter.field}:${filter.operator}:${filter.value}`)
      })
    }

    return this.request('GET', `${this.endpoint}/export?${queryParams}`, undefined, options)
  }

  /**
   * Get classification analytics
   */
  async getAnalytics(
    timeRange?: { start: string; end: string },
    groupBy?: string[],
    options?: RequestOptions
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    
    if (timeRange) {
      queryParams.append('start_date', timeRange.start)
      queryParams.append('end_date', timeRange.end)
    }
    
    if (groupBy) {
      queryParams.append('group_by', groupBy.join(','))
    }

    const url = queryParams.toString() 
      ? `${this.endpoint}/analytics?${queryParams}` 
      : `${this.endpoint}/analytics`
    
    return this.request('GET', url, undefined, options)
  }
}

// ============================================================================
// AUDIT TRAIL API
// ============================================================================

export class AuditTrailApi extends BaseApiClient {
  private readonly endpoint = '/api/classifications/audit'

  /**
   * Get audit trail entries
   */
  async getAuditTrail(
    params?: {
      pagination?: PaginationParams
      sort?: SortParams[]
      filters?: FilterParams[]
      entity_type?: string
      entity_id?: number
      action_type?: string
      user_id?: string
      date_range?: { start: string; end: string }
    },
    options?: RequestOptions
  ): Promise<ApiResponse<AuditTrailEntry[]>> {
    const queryParams = new URLSearchParams()
    
    if (params?.pagination) {
      queryParams.append('page', params.pagination.page.toString())
      queryParams.append('limit', params.pagination.limit.toString())
    }
    
    if (params?.sort) {
      params.sort.forEach(sort => {
        queryParams.append('sort', `${sort.field}:${sort.direction}`)
      })
    }
    
    if (params?.filters) {
      params.filters.forEach(filter => {
        queryParams.append('filter', `${filter.field}:${filter.operator}:${filter.value}`)
      })
    }
    
    if (params?.entity_type) {
      queryParams.append('entity_type', params.entity_type)
    }
    
    if (params?.entity_id) {
      queryParams.append('entity_id', params.entity_id.toString())
    }
    
    if (params?.action_type) {
      queryParams.append('action_type', params.action_type)
    }
    
    if (params?.user_id) {
      queryParams.append('user_id', params.user_id)
    }
    
    if (params?.date_range) {
      queryParams.append('start_date', params.date_range.start)
      queryParams.append('end_date', params.date_range.end)
    }

    const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint
    return this.request('GET', url, undefined, options)
  }

  /**
   * Export audit trail
   */
  async exportAuditTrail(
    filters?: FilterParams[],
    format: 'json' | 'csv' | 'xlsx' = 'csv',
    options?: RequestOptions
  ): Promise<ApiResponse<Blob>> {
    const queryParams = new URLSearchParams({ format })
    
    if (filters) {
      filters.forEach(filter => {
        queryParams.append('filter', `${filter.field}:${filter.operator}:${filter.value}`)
      })
    }

    return this.request('GET', `${this.endpoint}/export?${queryParams}`, undefined, options)
  }
}

// ============================================================================
// MAIN CLASSIFICATION API CLIENT
// ============================================================================

export class ClassificationApi {
  public frameworks: ClassificationFrameworkApi
  public rules: ClassificationRulesApi
  public bulkOperations: BulkOperationsApi
  public results: ClassificationResultsApi
  public auditTrail: AuditTrailApi

  constructor(config?: Partial<ApiClientConfig>) {
    this.frameworks = new ClassificationFrameworkApi(config)
    this.rules = new ClassificationRulesApi(config)
    this.bulkOperations = new BulkOperationsApi(config)
    this.results = new ClassificationResultsApi(config)
    this.auditTrail = new AuditTrailApi(config)
  }

  /**
   * Health check for the classification service
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.frameworks.request('GET', '/api/classifications/health')
      return true
    } catch {
      return false
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<any> {
    return this.frameworks.request('GET', '/api/classifications/metrics')
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.frameworks.clearCache()
    this.rules.clearCache()
    this.bulkOperations.clearCache()
    this.results.clearCache()
    this.auditTrail.clearCache()
  }

  // ============================================================================
  // MISSING API METHODS - ADVANCED IMPLEMENTATIONS
  // ============================================================================

  // Framework Validation and Management
  async validateFrameworks(frameworkIds: string[]): Promise<ApiResponse<{isValid: boolean, message: string}>> {
    return this.request<{isValid: boolean, message: string}>({
      method: 'POST',
      endpoint: '/frameworks/validate',
      data: { frameworkIds },
      timeout: 15000
    });
  }

  async checkFrameworkConflicts(frameworkIds: string[]): Promise<ApiResponse<{hasConflicts: boolean, conflicts: string[]}>> {
    return this.request<{hasConflicts: boolean, conflicts: string[]}>({
      method: 'POST',
      endpoint: '/frameworks/check-conflicts',
      data: { frameworkIds }
    });
  }

  async getFrameworkCapabilities(frameworkId: string): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: `/frameworks/${frameworkId}/capabilities`
    });
  }

  async validateFrameworkSecurity(frameworkId: string): Promise<ApiResponse<{isSecure: boolean, hasVulnerabilities: boolean}>> {
    return this.request<{isSecure: boolean, hasVulnerabilities: boolean}>({
      method: 'GET',
      endpoint: `/frameworks/${frameworkId}/security-validation`
    });
  }

  async getFallbackFramework(frameworkId: string): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: `/frameworks/${frameworkId}/fallback`
    });
  }

  // Rule Validation and Management
  async validateRules(ruleIds: string[]): Promise<ApiResponse<{isValid: boolean, message: string}>> {
    return this.request<{isValid: boolean, message: string}>({
      method: 'POST',
      endpoint: '/rules/validate',
      data: { ruleIds }
    });
  }

  async analyzeRulePerformance(ruleIds: string[]): Promise<ApiResponse<{estimatedLatency: number}>> {
    return this.request<{estimatedLatency: number}>({
      method: 'POST',
      endpoint: '/rules/analyze-performance',
      data: { ruleIds }
    });
  }

  async optimizeRules(config: any): Promise<ApiResponse<{optimizedRules: any[]}>> {
    return this.request<{optimizedRules: any[]}>({
      method: 'POST',
      endpoint: '/rules/optimize',
      data: config
    });
  }

  async validateRulesSecurity(ruleIds: string[]): Promise<ApiResponse<{hasSecurityRisks: boolean}>> {
    return this.request<{hasSecurityRisks: boolean}>({
      method: 'POST',
      endpoint: '/rules/security-validation',
      data: { ruleIds }
    });
  }

  // Data Source Management
  async getDataSourceMetadata(dataSource: string): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: `/data-sources/${encodeURIComponent(dataSource)}/metadata`
    });
  }

  async validateDataSourceAccess(dataSource: string): Promise<ApiResponse<{isAccessible: boolean, message: string}>> {
    return this.request<{isAccessible: boolean, message: string}>({
      method: 'POST',
      endpoint: '/data-sources/validate-access',
      data: { dataSource }
    });
  }

  async validateDataSourceSchema(dataSource: string): Promise<ApiResponse<{isValid: boolean, message: string}>> {
    return this.request<{isValid: boolean, message: string}>({
      method: 'POST',
      endpoint: '/data-sources/validate-schema',
      data: { dataSource }
    });
  }

  async validateDataSourceSecurity(dataSource: string): Promise<ApiResponse<{isSecure: boolean}>> {
    return this.request<{isSecure: boolean}>({
      method: 'POST',
      endpoint: '/data-sources/security-validation',
      data: { dataSource }
    });
  }

  async checkDataSensitivity(dataSource: string): Promise<ApiResponse<{requiresAudit: boolean}>> {
    return this.request<{requiresAudit: boolean}>({
      method: 'GET',
      endpoint: `/data-sources/${encodeURIComponent(dataSource)}/sensitivity`
    });
  }

  async preprocessData(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/data-sources/preprocess',
      data: config,
      timeout: 60000
    });
  }

  async assessDataQuality(data: any): Promise<ApiResponse<{overallScore: number}>> {
    return this.request<{overallScore: number}>({
      method: 'POST',
      endpoint: '/data-sources/assess-quality',
      data: { data },
      timeout: 30000
    });
  }

  async enrichData(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/data-sources/enrich',
      data: config,
      timeout: 45000
    });
  }

  async sampleData(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/data-sources/sample',
      data: config
    });
  }

  // Data Preparation Methods
  async prepareTextData(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/data-preparation/text',
      data: config,
      timeout: 30000
    });
  }

  async prepareStructuredData(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/data-preparation/structured',
      data: config,
      timeout: 30000
    });
  }

  async prepareImageData(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/data-preparation/image',
      data: config,
      timeout: 60000
    });
  }

  // Classification Execution
  async executeClassification(config: any): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'POST',
      endpoint: '/classification/execute',
      data: config,
      timeout: config.timeoutMs || 300000
    });
  }

  async executeSimpleClassification(config: any): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'POST',
      endpoint: '/classification/execute-simple',
      data: config,
      timeout: 60000
    });
  }

  async getConfidenceCalibration(frameworkId: string): Promise<ApiResponse<{calibrationFunction: Function}>> {
    return this.request<{calibrationFunction: Function}>({
      method: 'GET',
      endpoint: `/frameworks/${frameworkId}/confidence-calibration`
    });
  }

  async recordFrameworkMetrics(metrics: any): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      endpoint: '/frameworks/metrics',
      data: metrics
    });
  }

  // Performance and Historical Data
  async getHistoricalPerformance(): Promise<ApiResponse<{averageAccuracy: number}>> {
    return this.request<{averageAccuracy: number}>({
      method: 'GET',
      endpoint: '/analytics/historical-performance'
    });
  }

  async estimateResourceRequirements(config: any): Promise<ApiResponse<{cpu: number, memory: number}>> {
    return this.request<{cpu: number, memory: number}>({
      method: 'POST',
      endpoint: '/resources/estimate',
      data: config
    });
  }

  async getAvailableResources(): Promise<ApiResponse<{cpu: number, memory: number}>> {
    return this.request<{cpu: number, memory: number}>({
      method: 'GET',
      endpoint: '/resources/available'
    });
  }

  async getCurrentSystemLoad(): Promise<ApiResponse<{load: number}>> {
    return this.request<{load: number}>({
      method: 'GET',
      endpoint: '/system/load'
    });
  }

  // System Health and Monitoring
  async getSystemHealth(): Promise<ApiResponse<{overall: string, services: any[]}>> {
    return this.request<{overall: string, services: any[]}>({
      method: 'GET',
      endpoint: '/system/health'
    });
  }

  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: '/system/performance'
    });
  }

  async getCapacityMetrics(): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: '/system/capacity'
    });
  }

  async getComplianceMetrics(): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: '/system/compliance'
    });
  }

  async getResourceAllocation(): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: '/resources/allocation'
    });
  }

  async getUtilizationPatterns(): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: '/resources/utilization-patterns'
    });
  }

  // Security and Compliance
  async getCurrentUser(): Promise<ApiResponse<{id: string, name: string}>> {
    return this.request<{id: string, name: string}>({
      method: 'GET',
      endpoint: '/auth/current-user'
    });
  }

  async validateUserPermissions(config: any): Promise<ApiResponse<{hasPermission: boolean}>> {
    return this.request<{hasPermission: boolean}>({
      method: 'POST',
      endpoint: '/auth/validate-permissions',
      data: config
    });
  }

  async validateAPIEndpointsSecurity(): Promise<ApiResponse<{hasInsecureEndpoints: boolean}>> {
    return this.request<{hasInsecureEndpoints: boolean}>({
      method: 'GET',
      endpoint: '/security/api-endpoints'
    });
  }

  async getCurrentThreatAssessment(): Promise<ApiResponse<{overallLevel: string, activeThreatCount: number}>> {
    return this.request<{overallLevel: string, activeThreatCount: number}>({
      method: 'GET',
      endpoint: '/security/threat-assessment'
    });
  }

  async getLatestVulnerabilityReport(): Promise<ApiResponse<{totalVulnerabilities: number, scanTimestamp: string}>> {
    return this.request<{totalVulnerabilities: number, scanTimestamp: string}>({
      method: 'GET',
      endpoint: '/security/vulnerability-report'
    });
  }

  async getAccessLogAnalysis(config: any): Promise<ApiResponse<{successful: number, failed: number, blocked: number, suspicious: number}>> {
    return this.request<{successful: number, failed: number, blocked: number, suspicious: number}>({
      method: 'POST',
      endpoint: '/security/access-log-analysis',
      data: config
    });
  }

  async getComplianceReport(): Promise<ApiResponse<{overallScore: number}>> {
    return this.request<{overallScore: number}>({
      method: 'GET',
      endpoint: '/compliance/report'
    });
  }

  // Data Import/Export
  async getSupportedDataFormats(): Promise<ApiResponse<{extension: string}[]>> {
    return this.request<{extension: string}[]>({
      method: 'GET',
      endpoint: '/data/supported-formats'
    });
  }

  async importData(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/data/import',
      data: config,
      timeout: 120000
    });
  }

  async exportResults(config: any): Promise<ApiResponse<{content: any, mimeType: string, filename: string}>> {
    return this.request<{content: any, mimeType: string, filename: string}>({
      method: 'POST',
      endpoint: '/data/export',
      data: config,
      timeout: 60000
    });
  }

  // Task Scheduling
  async scheduleTask(config: any): Promise<ApiResponse<{id: string}>> {
    return this.request<{id: string}>({
      method: 'POST',
      endpoint: '/tasks/schedule',
      data: config
    });
  }

  async getLowUsagePeriods(): Promise<ApiResponse<{nextOptimal: Date}>> {
    return this.request<{nextOptimal: Date}>({
      method: 'GET',
      endpoint: '/system/low-usage-periods'
    });
  }

  // Reporting
  async generateReports(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/reports/generate',
      data: config,
      timeout: 120000
    });
  }

  // Emergency Response
  async triggerEmergencyResponse(): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      endpoint: '/system/emergency-response'
    });
  }

  // Search and Analytics
  async searchClassifications(config: any): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'POST',
      endpoint: '/search/classifications',
      data: config
    });
  }

  async searchWorkflows(config: any): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'POST',
      endpoint: '/search/workflows',
      data: config
    });
  }

  async searchFrameworks(config: any): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'POST',
      endpoint: '/search/frameworks',
      data: config
    });
  }

  async searchRules(config: any): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'POST',
      endpoint: '/search/rules',
      data: config
    });
  }

  async searchUsers(config: any): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'POST',
      endpoint: '/search/users',
      data: config
    });
  }

  async searchReports(config: any): Promise<ApiResponse<any[]>> {
    return this.request<any[]>({
      method: 'POST',
      endpoint: '/search/reports',
      data: config
    });
  }

  async getSearchSuggestions(config: any): Promise<ApiResponse<string[]>> {
    return this.request<string[]>({
      method: 'POST',
      endpoint: '/search/suggestions',
      data: config
    });
  }

  async getRelatedQueries(config: any): Promise<ApiResponse<string[]>> {
    return this.request<string[]>({
      method: 'POST',
      endpoint: '/search/related-queries',
      data: config
    });
  }

  async rankSearchResults(config: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/search/rank-results',
      data: config
    });
  }

  async trackSearchAnalytics(data: any): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      endpoint: '/search/track-analytics',
      data: data
    });
  }

  async trackSearchInteraction(data: any): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      endpoint: '/search/track-interaction',
      data: data
    });
  }

  // Output Validation
  async validateOutputSchema(data: any, format: string): Promise<ApiResponse<{isValid: boolean, errors: string[]}>> {
    return this.request<{isValid: boolean, errors: string[]}>({
      method: 'POST',
      endpoint: '/validation/output-schema',
      data: { data, format }
    });
  }

  // Audit Trail
  async createAuditEntry(entry: any): Promise<ApiResponse<void>> {
    return this.request<void>({
      method: 'POST',
      endpoint: '/audit/create-entry',
      data: entry
    });
  }

  // Workflow Management
  async getWorkflowMetrics(): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: '/workflows/metrics'
    });
  }

  async getActiveWorkflows(): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'GET',
      endpoint: '/workflows/active'
    });
  }

  async executeWorkflow(execution: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: '/workflows/execute',
      data: execution
    });
  }

  async executeManualStep(stepId: string, config?: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: `/workflows/steps/${stepId}/execute`,
      data: { type: 'manual', config }
    });
  }

  async executeValidationStep(stepId: string, config?: any): Promise<ApiResponse<any>> {
    return this.request<any>({
      method: 'POST',
      endpoint: `/workflows/steps/${stepId}/execute`,
      data: { type: 'validation', config }
    });
  }
}

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

// Export default
export default ClassificationApi;

// Export the singleton instance
export const classificationApi = new ClassificationApi();

// Export types for advanced usage
export type {
  ApiResponse,
  ClassificationFramework,
  ClassificationRule,
  ClassificationPolicy,
  BulkOperation,
  ClassificationResult,
  PaginationParams,
  SortParams,
  FilterParams,
  SearchParams,
  ValidationResult,
  BulkOperationResult,
  AuditTrailEntry,
  NotificationSettings,
  ResourceUsage
};