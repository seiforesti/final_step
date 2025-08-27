/**
 * Base API Service Class
 * =====================
 * 
 * Provides common functionality and error handling for all API services.
 * This ensures consistent behavior across the application when the backend
 * is not available or experiencing issues.
 */

import { withGracefulErrorHandling, DefaultApiResponses } from './api-error-handler';

export interface BaseAPIConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableWebSocket?: boolean;
  websocketURL?: string;
}

export abstract class BaseAPIService {
  protected config: BaseAPIConfig;

  constructor(config: BaseAPIConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableWebSocket: false,
      ...config
    };
  }

  /**
   * Get authentication headers
   */
  protected getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Add any authentication tokens here if needed
    };
  }

  /**
   * Make a GET request with error handling
   */
  protected async get<T>(endpoint: string, defaultValue?: T): Promise<T> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}${endpoint}`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`GET request failed: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: defaultValue || null,
        errorPrefix: `Backend not available for GET ${endpoint}`
      }
    );
  }

  /**
   * Make a POST request with error handling
   */
  protected async post<T>(endpoint: string, data?: any, defaultValue?: T): Promise<T> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}${endpoint}`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
          throw new Error(`POST request failed: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: defaultValue || null,
        errorPrefix: `Backend not available for POST ${endpoint}`
      }
    );
  }

  /**
   * Make a PUT request with error handling
   */
  protected async put<T>(endpoint: string, data?: any, defaultValue?: T): Promise<T> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}${endpoint}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: data ? JSON.stringify(data) : undefined
        });

        if (!response.ok) {
          throw new Error(`PUT request failed: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: defaultValue || null,
        errorPrefix: `Backend not available for PUT ${endpoint}`
      }
    );
  }

  /**
   * Make a DELETE request with error handling
   */
  protected async delete<T>(endpoint: string, defaultValue?: T): Promise<T> {
    return withGracefulErrorHandling(
      async () => {
        const response = await fetch(`${this.config.baseURL}${endpoint}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`DELETE request failed: ${response.statusText}`);
        }

        return response.json();
      },
      {
        defaultValue: defaultValue || null,
        errorPrefix: `Backend not available for DELETE ${endpoint}`
      }
    );
  }

  /**
   * Check if the backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get backend status
   */
  async getBackendStatus(): Promise<{ available: boolean; status?: string }> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        return { available: true, status: data.status };
      } else {
        return { available: false, status: response.statusText };
      }
    } catch (error) {
      return { available: false, status: 'Connection failed' };
    }
  }
}

// Export default values for common use cases
export { DefaultApiResponses };
