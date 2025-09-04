/**
 * API Client
 * Centralized HTTP client for API requests
 */

import { APIErrorHandler, APIError } from './api-error-handler';

export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export class ApiClient {
  private config: RequestConfig;
  private errorHandler: APIErrorHandler;

  constructor(config: RequestConfig = {}) {
    this.config = {
      baseURL: (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_API_BASE_URL) || 'http://localhost:3000/proxy',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      retries: 3,
      retryDelay: 1000,
      ...config
    };
    this.errorHandler = APIErrorHandler.getInstance();
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data?: any,
    customConfig?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    const config = { ...this.config, ...customConfig };
    const fullUrl = url.startsWith('http') ? url : `${config.baseURL}${url}`;

    const requestConfig: RequestInit = {
      method,
      headers: config.headers,
      signal: AbortSignal.timeout(config.timeout || 10000),
    };

    if (data && method !== 'GET') {
      requestConfig.body = JSON.stringify(data);
    }

    let lastError: any;
    
    for (let attempt = 0; attempt <= (config.retries || 0); attempt++) {
      try {
        const response = await fetch(fullUrl, requestConfig);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json();
        
        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (error) {
        lastError = error;
        
        if (attempt < (config.retries || 0)) {
          await new Promise(resolve => 
            setTimeout(resolve, config.retryDelay || 1000 * Math.pow(2, attempt))
          );
        }
      }
    }

    throw this.errorHandler.handleError(lastError);
  }

  public async get<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, undefined, config);
  }

  public async post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, data, config);
  }

  public async patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', url, data, config);
  }

  public async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, undefined, config);
  }

  public setHeader(key: string, value: string): void {
    this.config.headers = {
      ...this.config.headers,
      [key]: value
    };
  }

  public removeHeader(key: string): void {
    if (this.config.headers) {
      delete this.config.headers[key];
    }
  }

  public updateConfig(newConfig: Partial<RequestConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }
}

// Create a default instance
export const apiClient = new ApiClient();
