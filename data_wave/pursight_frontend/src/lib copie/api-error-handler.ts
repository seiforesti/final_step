/**
 * API Error Handler
 * Provides graceful error handling for API requests
 */

export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class APIErrorHandler {
  private static instance: APIErrorHandler;
  
  public static getInstance(): APIErrorHandler {
    if (!APIErrorHandler.instance) {
      APIErrorHandler.instance = new APIErrorHandler();
    }
    return APIErrorHandler.instance;
  }

  public handleError(error: any): APIError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        code: error.response.data?.code || 'SERVER_ERROR',
        status: error.response.status,
        details: error.response.data
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - no response from server',
        code: 'NETWORK_ERROR',
        status: 0,
        details: error.request
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        status: 0,
        details: error
      };
    }
  }

  public logError(error: APIError, context?: string): void {
    console.error(`[API Error${context ? ` - ${context}` : ''}]:`, {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
  }
}

/**
 * Higher-order function for graceful error handling
 */
export function withGracefulErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const errorHandler = APIErrorHandler.getInstance();
      const apiError = errorHandler.handleError(error);
      errorHandler.logError(apiError, context);
      throw apiError;
    }
  };
}

/**
 * Utility function for handling API responses
 */
export function handleAPIResponse<T>(response: any): T {
  if (response.data) {
    return response.data;
  }
  return response;
}

/**
 * Utility function for creating standardized error responses
 */
export function createErrorResponse(message: string, code?: string, status?: number): APIError {
  return {
    message,
    code: code || 'CUSTOM_ERROR',
    status: status || 500
  };
}

/**
 * Default API responses for graceful fallbacks
 */
export const DefaultApiResponses = {
  workspaceAnalytics: {
    totalWorkspaces: 0,
    activeWorkspaces: 0,
    totalUsers: 0,
    totalProjects: 0,
    recentActivity: [],
    performanceMetrics: {
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0
    },
    trends: {
      workspaceGrowth: [],
      userGrowth: [],
      projectGrowth: []
    }
  },
  workspaceList: [],
  workspaceDetails: {
    id: '',
    name: '',
    description: '',
    createdAt: '',
    updatedAt: '',
    members: [],
    projects: [],
    settings: {}
  },
  userList: [],
  projectList: [],
  integrationStatus: {
    status: 'unknown',
    lastSync: null,
    errors: []
  }
};