// ErrorBoundary.tsx - Enterprise-grade error handling components for RBAC system
// Provides comprehensive error boundaries, logging, recovery, and user-friendly error displays

'use client';

import React, { Component, ErrorInfo, ReactNode, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Shield, 
  Lock, 
  Network, 
  Server, 
  Database, 
  Clock, 
  User, 
  Settings, 
  FileX, 
  AlertCircle, 
  XCircle, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Download,
  Send,
  Home,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../hooks/useAuth';

// Error types and interfaces
export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: number;
  userEmail?: string;
  errorId: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRecovering: boolean;
}

export interface ErrorDisplayProps {
  error: Error;
  errorInfo?: ErrorInfo;
  onRetry?: () => void;
  onReport?: (errorDetails: ErrorDetails) => void;
  className?: string;
  variant?: 'minimal' | 'detailed' | 'full';
}

export interface ErrorRecoveryProps {
  error: Error;
  onRetry: () => void;
  onReset: () => void;
  maxRetries?: number;
  currentRetries: number;
  className?: string;
}

// Error categorization
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  VALIDATION = 'validation',
  RUNTIME = 'runtime',
  RBAC = 'rbac',
  DATA = 'data',
  SYSTEM = 'system'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error classification utility
const classifyError = (error: Error): { category: ErrorCategory; severity: ErrorSeverity } => {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('authentication') || name.includes('auth')) {
    return { category: ErrorCategory.AUTHENTICATION, severity: ErrorSeverity.HIGH };
  }

  // Authorization/Permission errors
  if (message.includes('permission') || message.includes('forbidden') || message.includes('access denied')) {
    return { category: ErrorCategory.AUTHORIZATION, severity: ErrorSeverity.MEDIUM };
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return { category: ErrorCategory.NETWORK, severity: ErrorSeverity.MEDIUM };
  }

  // RBAC-specific errors
  if (message.includes('role') || message.includes('rbac') || message.includes('permission')) {
    return { category: ErrorCategory.RBAC, severity: ErrorSeverity.HIGH };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || name.includes('validation')) {
    return { category: ErrorCategory.VALIDATION, severity: ErrorSeverity.LOW };
  }

  // Data errors
  if (message.includes('database') || message.includes('data') || message.includes('sql')) {
    return { category: ErrorCategory.DATA, severity: ErrorSeverity.HIGH };
  }

  // Default to runtime error
  return { category: ErrorCategory.RUNTIME, severity: ErrorSeverity.MEDIUM };
};

// Generate unique error ID
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Error logging service
class ErrorLogger {
  static async logError(errorDetails: ErrorDetails): Promise<void> {
    try {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 Error ${errorDetails.errorId}`);
        console.error('Error:', errorDetails.name);
        console.error('Message:', errorDetails.message);
        console.error('Stack:', errorDetails.stack);
        console.error('Timestamp:', errorDetails.timestamp);
        console.error('User:', errorDetails.userEmail);
        console.error('URL:', errorDetails.url);
        console.groupEnd();
      }

      // Send to error reporting service
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails),
      });

      if (!response.ok) {
        console.warn('Failed to report error to server:', response.statusText);
      }
    } catch (reportingError) {
      console.warn('Error reporting failed:', reportingError);
    }
  }

  static async getErrorHistory(userId?: number): Promise<ErrorDetails[]> {
    try {
      const url = userId ? `/api/errors/history?userId=${userId}` : '/api/errors/history';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch error history');
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch error history:', error);
      return [];
    }
  }
}

// Main Error Boundary Component
export class ErrorBoundary extends Component<
  {
    children: ReactNode;
    fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    maxRetries?: number;
    resetOnPropsChange?: boolean;
    category?: ErrorCategory;
  },
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails: ErrorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId,
    };

    // Log error
    ErrorLogger.logError(errorDetails);

    // Update state with error info
    this.setState({ errorInfo });

    // Call onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: any) {
    const { resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isRecovering: false,
    });
  };

  retryRender = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState({ 
      isRecovering: true,
      retryCount: retryCount + 1 
    });

    // Delayed retry to allow time for potential fixes
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRecovering: false,
      });
    }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback(error, errorInfo!, this.retryRender);
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo!}
          onRetry={this.retryRender}
          onReset={this.resetErrorBoundary}
          maxRetries={this.props.maxRetries || 3}
          currentRetries={this.state.retryCount}
        />
      );
    }

    return children;
  }
}

// Default Error Fallback Component
const DefaultErrorFallback: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onReset,
  maxRetries = 3,
  currentRetries,
  className
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const { user } = useCurrentUser();
  const { logout } = useAuth();

  const { category, severity } = classifyError(error);
  const canRetry = currentRetries < maxRetries;

  const handleReport = async () => {
    setIsReporting(true);
    try {
      const errorDetails: ErrorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: user?.id,
        userEmail: user?.email,
        errorId: generateErrorId(),
      };

      await ErrorLogger.logError(errorDetails);
    } catch (reportError) {
      console.warn('Failed to report error:', reportError);
    } finally {
      setIsReporting(false);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getErrorIcon = () => {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        return <Lock className="w-8 h-8 text-red-600" />;
      case ErrorCategory.AUTHORIZATION:
        return <Shield className="w-8 h-8 text-orange-600" />;
      case ErrorCategory.NETWORK:
        return <Network className="w-8 h-8 text-blue-600" />;
      case ErrorCategory.RBAC:
        return <User className="w-8 h-8 text-purple-600" />;
      case ErrorCategory.DATA:
        return <Database className="w-8 h-8 text-green-600" />;
      case ErrorCategory.SYSTEM:
        return <Server className="w-8 h-8 text-gray-600" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'border-red-500 bg-red-50';
      case ErrorSeverity.HIGH:
        return 'border-orange-500 bg-orange-50';
      case ErrorSeverity.MEDIUM:
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className={cn('min-h-screen flex items-center justify-center p-4 bg-gray-50', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'max-w-2xl w-full bg-white rounded-lg shadow-lg border-l-4 p-6',
          getSeverityColor()
        )}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              {getErrorIcon()}
            </motion.div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category === ErrorCategory.AUTHENTICATION && 'Authentication Error'}
                {category === ErrorCategory.AUTHORIZATION && 'Access Denied'}
                {category === ErrorCategory.NETWORK && 'Connection Error'}
                {category === ErrorCategory.RBAC && 'Permission Error'}
                {category === ErrorCategory.DATA && 'Data Error'}
                {category === ErrorCategory.SYSTEM && 'System Error'}
                {category === ErrorCategory.RUNTIME && 'Application Error'}
                {category === ErrorCategory.VALIDATION && 'Validation Error'}
              </h1>
              
              <p className="text-gray-600 mt-2">
                {category === ErrorCategory.AUTHENTICATION && 'There was a problem with your authentication. Please try logging in again.'}
                {category === ErrorCategory.AUTHORIZATION && 'You don\'t have permission to access this resource.'}
                {category === ErrorCategory.NETWORK && 'Unable to connect to the server. Please check your connection.'}
                {category === ErrorCategory.RBAC && 'There was an issue with role-based access control.'}
                {category === ErrorCategory.DATA && 'There was a problem accessing or processing data.'}
                {category === ErrorCategory.SYSTEM && 'A system error occurred. Our team has been notified.'}
                {category === ErrorCategory.RUNTIME && 'An unexpected error occurred while running the application.'}
                {category === ErrorCategory.VALIDATION && 'The provided data failed validation checks.'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Error Details</h3>
            <p className="text-sm text-gray-600 font-mono break-words">
              {error.message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {canRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry ({maxRetries - currentRetries} left)
              </button>
            )}

            <button
              onClick={onReset}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Reset
            </button>

            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>

            {category === ErrorCategory.AUTHENTICATION && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Lock className="w-4 h-4 mr-2" />
                Logout
              </button>
            )}
          </div>

          {/* Advanced Options */}
          <div className="border-t pt-4 space-y-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showDetails ? (
                <ChevronUp className="w-4 h-4 mr-1" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-1" />
              )}
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono overflow-auto max-h-64">
                    <div className="space-y-2">
                      <div><strong>Error:</strong> {error.name}</div>
                      <div><strong>Message:</strong> {error.message}</div>
                      <div><strong>Category:</strong> {category}</div>
                      <div><strong>Severity:</strong> {severity}</div>
                      <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                      {user && (
                        <>
                          <div><strong>User:</strong> {user.email}</div>
                          <div><strong>User ID:</strong> {user.id}</div>
                        </>
                      )}
                      <div><strong>URL:</strong> {window.location.href}</div>
                      {error.stack && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="mt-2 text-xs whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify({
                        error: error.name,
                        message: error.message,
                        stack: error.stack,
                        url: window.location.href,
                        timestamp: new Date().toISOString(),
                        user: user?.email,
                      }, null, 2))}
                      className="inline-flex items-center px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Error
                    </button>

                    <button
                      onClick={handleReport}
                      disabled={isReporting}
                      className="inline-flex items-center px-3 py-2 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      {isReporting ? 'Reporting...' : 'Report Error'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            If this error persists, please contact your system administrator.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Specific Error Components
export const NetworkErrorDisplay: React.FC<{ 
  onRetry: () => void; 
  className?: string 
}> = ({ onRetry, className }) => (
  <div className={cn('text-center p-8', className)}>
    <Network className="w-16 h-16 text-blue-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Problem</h3>
    <p className="text-gray-600 mb-4">
      Unable to connect to the server. Please check your internet connection.
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Retry Connection
    </button>
  </div>
);

export const PermissionErrorDisplay: React.FC<{ 
  requiredPermission?: string;
  onRequestAccess?: () => void;
  className?: string 
}> = ({ requiredPermission, onRequestAccess, className }) => (
  <div className={cn('text-center p-8', className)}>
    <Shield className="w-16 h-16 text-orange-600 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
    <p className="text-gray-600 mb-4">
      You don't have permission to access this resource.
      {requiredPermission && (
        <span className="block mt-2 text-sm">
          Required permission: <code className="bg-gray-100 px-2 py-1 rounded">{requiredPermission}</code>
        </span>
      )}
    </p>
    <div className="space-x-3">
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back
      </button>
      {onRequestAccess && (
        <button
          onClick={onRequestAccess}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Send className="w-4 h-4 mr-2" />
          Request Access
        </button>
      )}
    </div>
  </div>
);

export const ValidationErrorDisplay: React.FC<{ 
  errors: string[];
  onDismiss?: () => void;
  className?: string 
}> = ({ errors, onDismiss, className }) => (
  <div className={cn('bg-red-50 border border-red-200 rounded-lg p-4', className)}>
    <div className="flex items-start">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-800 mb-2">
          Validation Error{errors.length > 1 ? 's' : ''}
        </h3>
        <ul className="text-sm text-red-700 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 ml-3"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

// Error Context Hook
export const useErrorHandler = () => {
  const [errors, setErrors] = useState<Array<{ id: string; error: Error; timestamp: Date }>>([]);

  const reportError = useCallback((error: Error) => {
    const errorEntry = {
      id: generateErrorId(),
      error,
      timestamp: new Date(),
    };
    
    setErrors(prev => [...prev, errorEntry]);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== errorEntry.id));
    }, 10000);
  }, []);

  const dismissError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    reportError,
    dismissError,
    clearAllErrors,
  };
};

// Error Toast Component
export const ErrorToast: React.FC<{
  error: Error;
  onDismiss: () => void;
  className?: string;
}> = ({ error, onDismiss, className }) => {
  const { category } = classifyError(error);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={cn(
        'fixed bottom-4 right-4 bg-red-600 text-white rounded-lg shadow-lg p-4 max-w-md z-50',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium">Error Occurred</h4>
            <p className="text-sm opacity-90 mt-1">{error.message}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-white hover:text-red-200 ml-4"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Export all components
export default {
  ErrorBoundary,
  DefaultErrorFallback,
  NetworkErrorDisplay,
  PermissionErrorDisplay,
  ValidationErrorDisplay,
  ErrorToast,
  useErrorHandler,
  ErrorLogger,
  classifyError,
  generateErrorId,
};