import type {
  ScanRuleSet,
  CustomScanRule,
  ScanExecution,
  ScanRuleSetFilter,
  ScanRuleSetSort,
  PaginationParams,
  ApiResponse,
  BulkOperation,
  ValidationResult,
  PerformanceMetrics,
} from "../types"

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
const API_TIMEOUT = 30000

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// HTTP client with error handling
const httpClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status, errorData.code)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(error instanceof Error ? error.message : "Network error", 0)
    }
  },

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, API_BASE_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    return this.request<T>(url.pathname + url.search)
  },

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  },
}

// API service for scan rule sets
export const scanRuleSetApi = {
  // Get scan rule sets with filtering, sorting, and pagination
  getScanRuleSets: (
    filter?: ScanRuleSetFilter,
    sort?: ScanRuleSetSort,
    pagination?: PaginationParams,
  ): Promise<ApiResponse<ScanRuleSet[]>> => {
    return httpClient.get("/scan-rule-sets", {
      ...filter,
      sort_field: sort?.field,
      sort_direction: sort?.direction,
      page: pagination?.page,
      page_size: pagination?.pageSize,
    })
  },

  // Get single scan rule set by ID
  getScanRuleSet: (id: number): Promise<ScanRuleSet> => {
    return httpClient.get(`/scan-rule-sets/${id}`)
  },

  // Create new scan rule set
  createScanRuleSet: (data: Partial<ScanRuleSet>): Promise<ScanRuleSet> => {
    return httpClient.post("/scan-rule-sets", data)
  },

  // Update existing scan rule set
  updateScanRuleSet: (id: number, data: Partial<ScanRuleSet>): Promise<ScanRuleSet> => {
    return httpClient.put(`/scan-rule-sets/${id}`, data)
  },

  // Delete scan rule set
  deleteScanRuleSet: (id: number): Promise<void> => {
    return httpClient.delete(`/scan-rule-sets/${id}`)
  },

  // Duplicate scan rule set
  duplicateScanRuleSet: (id: number, name?: string): Promise<ScanRuleSet> => {
    return httpClient.post(`/scan-rule-sets/${id}/duplicate`, { name })
  },

  // Validate scan rule set
  validateScanRuleSet: (data: Partial<ScanRuleSet>): Promise<ValidationResult> => {
    return httpClient.post("/scan-rule-sets/validate", data)
  },

  // Bulk operations
  bulkOperation: (operation: BulkOperation): Promise<void> => {
    return httpClient.post("/scan-rule-sets/bulk", operation)
  },

  // Get performance metrics
  getPerformanceMetrics: (id: number, timeRange?: string): Promise<PerformanceMetrics> => {
    return httpClient.get(`/scan-rule-sets/${id}/metrics`, { time_range: timeRange })
  },

  // Execute scan rule set
  executeScanRuleSet: (id: number, dataSourceId?: number): Promise<ScanExecution> => {
    return httpClient.post(`/scan-rule-sets/${id}/execute`, { data_source_id: dataSourceId })
  },

  // Get execution history
  getExecutionHistory: (id: number, pagination?: PaginationParams): Promise<ApiResponse<ScanExecution[]>> => {
    return httpClient.get(`/scan-rule-sets/${id}/executions`, {
      page: pagination?.page,
      page_size: pagination?.pageSize,
    })
  },

  // Export scan rule set
  exportScanRuleSet: (id: number, format: "json" | "yaml"): Promise<Blob> => {
    return httpClient.request(`/scan-rule-sets/${id}/export?format=${format}`, {
      headers: {
        Accept: format === "json" ? "application/json" : "application/yaml",
      },
    })
  },

  // Import scan rule set
  importScanRuleSet: (file: File): Promise<ScanRuleSet> => {
    const formData = new FormData()
    formData.append("file", file)

    return httpClient.request("/scan-rule-sets/import", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  },
}

// API service for custom scan rules
export const customScanRuleApi = {
  // Get custom scan rules
  getCustomScanRules: (pagination?: PaginationParams): Promise<ApiResponse<CustomScanRule[]>> => {
    return httpClient.get("/custom-scan-rules", {
      page: pagination?.page,
      page_size: pagination?.pageSize,
    })
  },

  // Get single custom scan rule
  getCustomScanRule: (id: number): Promise<CustomScanRule> => {
    return httpClient.get(`/custom-scan-rules/${id}`)
  },

  // Create custom scan rule
  createCustomScanRule: (data: Partial<CustomScanRule>): Promise<CustomScanRule> => {
    return httpClient.post("/custom-scan-rules", data)
  },

  // Update custom scan rule
  updateCustomScanRule: (id: number, data: Partial<CustomScanRule>): Promise<CustomScanRule> => {
    return httpClient.put(`/custom-scan-rules/${id}`, data)
  },

  // Delete custom scan rule
  deleteCustomScanRule: (id: number): Promise<void> => {
    return httpClient.delete(`/custom-scan-rules/${id}`)
  },

  // Test custom scan rule
  testCustomScanRule: (id: number, testData: any): Promise<any> => {
    return httpClient.post(`/custom-scan-rules/${id}/test`, { test_data: testData })
  },

  // Validate custom scan rule code
  validateCustomScanRule: (code: string, language: string): Promise<ValidationResult> => {
    return httpClient.post("/custom-scan-rules/validate", { code, language })
  },
}

// Export the API error class for use in components
export { ApiError }
