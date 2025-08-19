// src/utils/errorHandling.ts
import { AxiosError } from 'axios';

/**
 * Extracts a user-friendly error message from an API error
 * @param error The error object from an API call
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Network errors (server not responding)
    if (error.code === 'ECONNABORTED' || !error.response) {
      return 'The server is not responding. Please check your connection or try again later.';
    }
    
    // Server returned an error response
    if (error.response) {
      // Try to get error message from response data
      const data = error.response.data;
      if (typeof data === 'string') return data;
      if (data?.message) return data.message;
      if (data?.error) return data.error;
      
      // Fallback to status text
      return `Error ${error.response.status}: ${error.response.statusText}`;
    }
  }
  
  // For non-Axios errors or unexpected error formats
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}

/**
 * Handles API errors in a consistent way
 * @param error The error object from an API call
 * @param setError A function to set the error message in the component state
 */
export function handleApiError(error: unknown, setError: (message: string) => void): void {
  const message = getErrorMessage(error);
  console.error('API Error:', error);
  setError(message);
}