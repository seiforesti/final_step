"use client";

/**
 * 🛡️ ADVANCED ERROR BOUNDARY SYSTEM
 * ===================================
 * 
 * Enterprise-grade error boundary that handles import errors, module
 * resolution issues, and provides intelligent fallbacks for the
 * Racine platform.
 */

import React, { Component, ErrorInfo, ReactNode, useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Bug, Shield, Zap } from 'lucide-react';

// Error types for advanced handling
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'import' | 'runtime' | 'module' | 'unknown';
  recoveryAttempts: number;
  lastRecoveryTime: number | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRecoveryAttempts?: number;
  recoveryDelay?: number;
  enableAutoRecovery?: boolean;
}

// Advanced error boundary component (Class Component for Error Boundary functionality)
export class AdvancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private recoveryTimeout: NodeJS.Timeout | null = null;
  private errorCount = 0;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      recoveryAttempts: 0,
      lastRecoveryTime: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Analyze error type for advanced handling
    const errorType = AdvancedErrorBoundary.analyzeErrorType(error);
    
    return {
      hasError: true,
      error,
      errorType,
      recoveryAttempts: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('Advanced Error Boundary caught an error:', error, errorInfo);
    
    // Update state
    this.setState({
      error,
      errorInfo,
      lastRecoveryTime: Date.now()
    });

    // Call error handler if provided
    this.props.onError?.(error, errorInfo);

    // Track error count for analytics
    this.errorCount++;

    // Attempt auto-recovery if enabled
    if (this.props.enableAutoRecovery && this.state.recoveryAttempts < (this.props.maxRecoveryAttempts || 3)) {
      this.attemptRecovery();
    }
  }

  // Analyze error type for intelligent handling
  private static analyzeErrorType(error: Error): 'import' | 'runtime' | 'module' | 'unknown' {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('import') || message.includes('export') || message.includes('module')) {
      return 'import';
    }
    
    if (message.includes('dependency') || message.includes('resolve') || message.includes('path')) {
      return 'module';
    }
    
    if (message.includes('runtime') || message.includes('execution') || message.includes('function')) {
      return 'runtime';
    }
    
    return 'unknown';
  }

  // Attempt automatic recovery
  private attemptRecovery = () => {
    const { maxRecoveryAttempts = 3, recoveryDelay = 5000 } = this.props;
    
    if (this.state.recoveryAttempts >= maxRecoveryAttempts) {
      console.warn('Max recovery attempts reached');
      return;
    }

    this.setState(prevState => ({
      recoveryAttempts: prevState.recoveryAttempts + 1
    }));

    // Schedule recovery attempt
    this.recoveryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }, recoveryDelay);
  };

  // Manual recovery trigger
  private handleManualRecovery = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      recoveryAttempts: 0
    });
  };

  // Component cleanup
  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Advanced error UI with recovery options
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-red-200">
            {/* Error Header */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  System Error Detected
                </h1>
                <p className="text-gray-600">
                  Error Type: {this.state.errorType.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Error Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
              <p className="text-red-700 font-mono text-sm break-words">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
            </div>

            {/* Recovery Options */}
            <div className="space-y-4">
              <button
                onClick={this.handleManualRecovery}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Attempt Recovery</span>
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Reload Application</span>
              </button>
            </div>

            {/* Error Info */}
            {(typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' && this.state.errorInfo && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  Show Error Stack (Development)
                </summary>
                <pre className="mt-2 text-xs text-gray-700 bg-gray-100 p-4 rounded overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Recovery Status */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Recovery Attempts: {this.state.recoveryAttempts} / {this.props.maxRecoveryAttempts || 3}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional Error Boundary Component for modern React patterns
export const FunctionalErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  maxRecoveryAttempts = 3,
  recoveryDelay = 5000,
  enableAutoRecovery = true
}) => {
  const [errorState, setErrorState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null,
    errorType: 'unknown',
    recoveryAttempts: 0,
    lastRecoveryTime: null
  });

  const [errorCount, setErrorCount] = useState(0);

  // Analyze error type for intelligent handling
  const analyzeErrorType = useCallback((error: Error): 'import' | 'runtime' | 'module' | 'unknown' => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('import') || message.includes('export') || message.includes('module')) {
      return 'import';
    }
    
    if (message.includes('dependency') || message.includes('resolve') || message.includes('path')) {
      return 'module';
    }
    
    if (message.includes('runtime') || message.includes('execution') || message.includes('function')) {
      return 'runtime';
    }
    
    return 'unknown';
  }, []);

  // Handle error
  const handleError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    console.error('Functional Error Boundary caught an error:', error, errorInfo);
    
    const errorType = analyzeErrorType(error);
    
    setErrorState({
      hasError: true,
      error,
      errorInfo,
      errorType,
      recoveryAttempts: 0,
      lastRecoveryTime: Date.now()
    });

    // Call custom error handler if provided, otherwise use default
    if (onError) {
      onError(error, errorInfo);
    } else {
      // Default error handling for production
      console.error('Root layout error:', error, errorInfo);
    }
    
    setErrorCount(prev => prev + 1);
  }, [analyzeErrorType, onError]);

  // Attempt automatic recovery
  const attemptRecovery = useCallback(() => {
    if (errorState.recoveryAttempts >= maxRecoveryAttempts) {
      console.warn('Max recovery attempts reached');
      return;
    }

    setErrorState(prev => ({
      ...prev,
      recoveryAttempts: prev.recoveryAttempts + 1
    }));

    // Schedule recovery attempt
    setTimeout(() => {
      setErrorState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorType: 'unknown',
        recoveryAttempts: 0,
        lastRecoveryTime: null
      });
    }, recoveryDelay);
  }, [errorState.recoveryAttempts, maxRecoveryAttempts, recoveryDelay]);

  // Manual recovery trigger
  const handleManualRecovery = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      recoveryAttempts: 0,
      lastRecoveryTime: null
    });
  }, []);

  // Auto-recovery effect
  useEffect(() => {
    if (enableAutoRecovery && errorState.hasError && errorState.recoveryAttempts < maxRecoveryAttempts) {
      attemptRecovery();
    }
  }, [enableAutoRecovery, errorState.hasError, errorState.recoveryAttempts, maxRecoveryAttempts, attemptRecovery]);

  // Error boundary effect - catch React errors
  useEffect(() => {
    const handleReactError = (error: Error, errorInfo: ErrorInfo) => {
      handleError(error, errorInfo);
    };

    // This is a simplified error boundary - in a real implementation,
    // you would use React's error boundary hooks or a library
    // For now, we'll rely on the global error handlers below
  }, [handleError]);

  // Error boundary effect
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason?.message || 'Unhandled Promise Rejection');
      handleError(error, { componentStack: 'Unknown' } as ErrorInfo);
    };

    const handleGlobalError = (event: ErrorEvent) => {
      // Handle timeout errors more gracefully
      if (event.message && event.message.includes('timeout')) {
        console.warn('Request timeout detected, handling gracefully:', event.message);
        // Don't create a new error for timeouts - let the application handle them
        return;
      }
      
      const error = new Error(event.message || 'Runtime Error');
      handleError(error, { componentStack: 'Unknown' } as ErrorInfo);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [handleError]);

  if (errorState.hasError) {
    // Custom fallback UI
    if (fallback) {
      return fallback;
    }

    // Advanced error UI with recovery options
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border border-red-200">
          {/* Error Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                System Error Detected
              </h1>
              <p className="text-gray-600">
                Error Type: {errorState.errorType.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Error Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
            <p className="text-red-700 font-mono text-sm break-words">
              {errorState.error?.message || 'Unknown error occurred'}
            </p>
          </div>

          {/* Recovery Options */}
          <div className="space-y-4">
            <button
              onClick={handleManualRecovery}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Attempt Recovery</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>Reload Application</span>
            </button>
          </div>

          {/* Error Info */}
          {(typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === 'development' && errorState.errorInfo && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                Show Error Stack (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-700 bg-gray-100 p-4 rounded overflow-auto max-h-64">
                {errorState.errorInfo.componentStack}
              </pre>
            </details>
          )}

          {/* Recovery Status */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Recovery Attempts: {errorState.recoveryAttempts} / {maxRecoveryAttempts}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Higher-order component for error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <FunctionalErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </FunctionalErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Default export for backward compatibility (using functional component)
export default FunctionalErrorBoundary;
