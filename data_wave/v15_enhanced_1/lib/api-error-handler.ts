/**
 * API Error Handler Utility
 * ========================
 * 
 * Provides consistent error handling for API calls when the backend is not available.
 * This ensures the frontend continues to function gracefully even when the backend
 * is still starting up or experiencing issues.
 */

export interface ApiErrorHandlerOptions {
  /** Default value to return when backend is not available */
  defaultValue?: any;
  /** Whether to log warnings when backend is not available */
  logWarnings?: boolean;
  /** Custom error message prefix */
  errorPrefix?: string;
}

/**
 * Wraps an API call with graceful error handling for backend unavailability
 */
export async function withGracefulErrorHandling<T>(
  apiCall: () => Promise<T>,
  options: ApiErrorHandlerOptions = {}
): Promise<T> {
  const {
    defaultValue = null,
    logWarnings = true,
    errorPrefix = 'Backend not available'
  } = options;

  try {
    return await apiCall();
  } catch (error) {
    // Check if it's a network error (backend not available)
    const isNetworkError = error instanceof TypeError && 
      (error.message.includes('Failed to fetch') || 
       error.message.includes('NetworkError') ||
       error.message.includes('fetch'));

    if (isNetworkError) {
      if (logWarnings) {
        console.warn(`${errorPrefix}, returning default value:`, error);
      }
      return defaultValue;
    }

    // Re-throw other errors (like HTTP errors)
    throw error;
  }
}

/**
 * Creates a wrapper function for API methods that handles backend unavailability
 */
export function createApiWrapper<T extends any[], R>(
  apiMethod: (...args: T) => Promise<R>,
  options: ApiErrorHandlerOptions = {}
) {
  return async (...args: T): Promise<R> => {
    return withGracefulErrorHandling(
      () => apiMethod(...args),
      options
    );
  };
}

/**
 * Common default values for different API response types
 */
export const DefaultApiResponses = {
  array: [],
  object: {},
  string: '',
  number: 0,
  boolean: false,
  null: null,
  workspaceList: { workspaces: [], total: 0, page: 1, limit: 10 },
  collaborationHubs: [],
  collaborationSessions: [],
  collaborationParticipants: [],
  workspaceResources: [],
  workspaceMembers: [],
  workspaceTemplates: [],
  workspaceAnalytics: { metrics: {}, trends: [], insights: [] },
  workspaceSecurity: { permissions: [], roles: [], policies: [] },
  workspaceActivity: { activities: [], total: 0, page: 1, limit: 10 }
} as const;
