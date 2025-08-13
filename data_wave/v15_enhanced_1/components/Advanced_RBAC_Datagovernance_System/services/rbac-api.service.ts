// Core RBAC API Service - Handles all HTTP requests to backend with 100% backend integration

import { 
  API_BASE_URL, 
  HTTP_METHODS, 
  REQUEST_HEADERS, 
  CONTENT_TYPES, 
  HTTP_STATUS,
  API_TIMEOUT 
} from '../constants/api.constants';

// Request/Response interfaces
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
  code?: string;
}

export interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

class RBACApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private interceptors: {
    request: ((config: RequestConfig) => RequestConfig | Promise<RequestConfig>)[];
    response: ((response: Response) => Response | Promise<Response>)[];
    error: ((error: ApiError) => void)[];
  };

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      [REQUEST_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
      [REQUEST_HEADERS.ACCEPT]: CONTENT_TYPES.JSON
    };
    this.interceptors = {
      request: [],
      response: [],
      error: []
    };

    // Add default request interceptor for authentication
    this.addRequestInterceptor(this.addAuthHeader.bind(this));
    
    // Add default error interceptor
    this.addErrorInterceptor(this.handleGlobalError.bind(this));
  }

  // Interceptor management
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.interceptors.response.push(interceptor);
  }

  addErrorInterceptor(interceptor: (error: ApiError) => void) {
    this.interceptors.error.push(interceptor);
  }

  // Default interceptors
  private async addAuthHeader(config: RequestConfig): Promise<RequestConfig> {
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        [REQUEST_HEADERS.AUTHORIZATION]: `Bearer ${token}`
      };
    }
    return config;
  }

  private handleGlobalError(error: ApiError): void {
    console.error('RBAC API Error:', error);
    
    // Handle specific error cases
    switch (error.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        this.handleUnauthorized();
        break;
      case HTTP_STATUS.FORBIDDEN:
        this.handleForbidden();
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        this.handleServerError();
        break;
    }
  }

  private getAuthToken(): string | null {
    // Try to get token from various sources
    if (typeof window !== 'undefined') {
      // Browser environment
      return localStorage.getItem('auth_token') || 
             sessionStorage.getItem('auth_token') ||
             this.getCookieValue('session_token');
    }
    return null;
  }

  private getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private handleUnauthorized(): void {
    // Clear auth tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      // Redirect to login or emit event
      window.dispatchEvent(new CustomEvent('rbac:unauthorized'));
    }
  }

  private handleForbidden(): void {
    window.dispatchEvent(new CustomEvent('rbac:forbidden'));
  }

  private handleServerError(): void {
    window.dispatchEvent(new CustomEvent('rbac:server-error'));
  }

  // Core HTTP methods
  async request<T = any>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Apply request interceptors
    let processedConfig = { ...config };
    for (const interceptor of this.interceptors.request) {
      processedConfig = await interceptor(processedConfig);
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method: processedConfig.method || HTTP_METHODS.GET,
      headers: {
        ...this.defaultHeaders,
        ...processedConfig.headers
      },
      signal: processedConfig.signal
    };

    // Add body for non-GET requests
    if (processedConfig.body && requestOptions.method !== HTTP_METHODS.GET) {
      if (processedConfig.body instanceof FormData) {
        // Remove content-type header for FormData (browser will set it)
        delete requestOptions.headers![REQUEST_HEADERS.CONTENT_TYPE];
        requestOptions.body = processedConfig.body;
      } else {
        requestOptions.body = JSON.stringify(processedConfig.body);
      }
    }

    // Add timeout
    const timeoutId = setTimeout(() => {
      if (processedConfig.signal && !processedConfig.signal.aborted) {
        processedConfig.signal.dispatchEvent(new Event('abort'));
      }
    }, processedConfig.timeout || API_TIMEOUT.DEFAULT);

    try {
      let response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Apply response interceptors
      for (const interceptor of this.interceptors.response) {
        response = await interceptor(response);
      }

      // Handle response
      if (!response.ok) {
        const error: ApiError = {
          status: response.status,
          message: response.statusText
        };

        try {
          const errorData = await response.json();
          error.message = errorData.message || errorData.detail || error.message;
          error.details = errorData;
        } catch {
          // Response is not JSON, use status text
        }

        // Apply error interceptors
        this.interceptors.error.forEach(interceptor => interceptor(error));
        throw error;
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text() as unknown as T;
      } else {
        data = await response.blob() as unknown as T;
      }

      return {
        data,
        status: response.status,
        message: response.statusText
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        const apiError: ApiError = {
          status: 0,
          message: error.message,
          details: error
        };
        
        this.interceptors.error.forEach(interceptor => interceptor(apiError));
        throw apiError;
      }
      
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.GET });
  }

  async post<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.POST, body: data });
  }

  async put<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.PUT, body: data });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.PATCH, body: data });
  }

  async delete<T = any>(endpoint: string, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: HTTP_METHODS.DELETE });
  }

  // Upload helper
  async upload<T = any>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    return this.post<T>(endpoint, formData, {
      timeout: API_TIMEOUT.UPLOAD
    });
  }

  // Download helper
  async download(endpoint: string, filename?: string): Promise<void> {
    try {
      const response = await this.request<Blob>(endpoint);
      
      if (typeof window !== 'undefined') {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  // Batch requests
  async batch<T = any>(requests: Array<{ endpoint: string; config?: RequestConfig }>): Promise<ApiResponse<T>[]> {
    const promises = requests.map(({ endpoint, config }) => 
      this.request<T>(endpoint, config).catch(error => ({ error, data: null, status: 0 }))
    );
    
    return Promise.all(promises);
  }

  // Query parameter helper
  buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Set base URL (useful for testing)
  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  // Set default header
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  // Remove default header
  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}

// Create singleton instance
export const rbacApiService = new RBACApiService();

// Export class for testing purposes
export { RBACApiService };

// Export types
export type { ApiResponse, ApiError, RequestConfig, PaginatedResponse };