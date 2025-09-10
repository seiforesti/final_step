// ============================================================================
// GRACEFUL ERROR BOUNDARY - ENTERPRISE-GRADE ERROR HANDLING
// ============================================================================

"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, Shield, Database, Activity } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showReloadButton?: boolean
  showRetryButton?: boolean
  errorType?: 'api' | 'component' | 'system' | 'network'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  lastRetry: number
}

export class GracefulErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastRetry: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0,
      lastRetry: Date.now()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GracefulErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
      lastRetry: Date.now()
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Emit error event for telemetry
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('error:boundary:caught', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date(),
        retryCount: this.state.retryCount
      })
    }
  }

  handleRetry = () => {
    const now = Date.now()
    const timeSinceLastRetry = now - this.state.lastRetry
    
    // Implement exponential backoff
    const backoffDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 30000)
    
    if (timeSinceLastRetry < backoffDelay) {
      console.warn(`Retry too soon. Please wait ${Math.ceil((backoffDelay - timeSinceLastRetry) / 1000)} seconds`)
      return
    }

    console.log(`Attempting retry #${this.state.retryCount + 1}`)
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      lastRetry: now
    }))
  }

  handleReload = () => {
    console.log('Reloading page due to error...')
    window.location.reload()
  }

  handleGracefulRecovery = () => {
    // Attempt to recover gracefully without full reload
    console.log('Attempting graceful recovery...')
    
    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    // Emit recovery event
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('error:boundary:recovered', {
        timestamp: new Date(),
        retryCount: this.state.retryCount
      })
    }
  }

  getErrorIcon = () => {
    switch (this.props.errorType) {
      case 'api':
        return <Database className="h-4 w-4" />
      case 'component':
        return <Activity className="h-4 w-4" />
      case 'system':
        return <Shield className="h-4 w-4" />
      case 'network':
        return <Activity className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  getErrorTitle = () => {
    switch (this.props.errorType) {
      case 'api':
        return 'API Connection Issue'
      case 'component':
        return 'Component Error'
      case 'system':
        return 'System Error'
      case 'network':
        return 'Network Issue'
      default:
        return 'Unexpected Error'
    }
  }

  getErrorDescription = () => {
    const { error, retryCount } = this.state
    
    if (retryCount > 0) {
      return `The system has attempted to recover ${retryCount} time(s). You can try to reload the page or contact support if the issue persists.`
    }
    
    return error?.message || 'An unexpected error occurred. The system will attempt to recover automatically.'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const Icon = this.getErrorIcon()
      const title = this.getErrorTitle()
      const description = this.getErrorDescription()
      const canRetry = this.state.retryCount < 3 // Max 3 retries

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Alert className="max-w-md">
            {Icon}
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>{description}</p>
              
              {this.state.error && (
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div className="space-y-2">
                {canRetry && this.props.showRetryButton && (
                  <Button 
                    onClick={this.handleRetry} 
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Operation
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGracefulRecovery} 
                  className="w-full"
                  variant="outline"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Attempt Recovery
                </Button>
                
                {this.props.showReloadButton && (
                  <Button 
                    onClick={this.handleReload} 
                    className="w-full"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors gracefully
export const useGracefulErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error)
    
    // Emit error event for telemetry
    if (window.enterpriseEventBus) {
      window.enterpriseEventBus.emit('error:component:caught', {
        error: error.message,
        context,
        timestamp: new Date()
      })
    }
    
    // Return graceful error object
    return {
      isGraceful: true,
      message: error.message,
      context,
      timestamp: new Date(),
      canRetry: true
    }
  }, [])

  const handleApiError = React.useCallback((error: any, retryFn?: () => void) => {
    const isGraceful = error?.isGraceful
    const canRetry = error?.canRetry !== false
    
    if (isGraceful && canRetry && retryFn) {
      // Implement retry logic with exponential backoff
      setTimeout(() => {
        console.log('Retrying API call...')
        retryFn()
      }, error.retryAfter || 1000)
    }
    
    return {
      isGraceful: true,
      message: error.message || 'API request failed',
      canRetry,
      retryAfter: error.retryAfter || 1000
    }
  }, [])

  return {
    handleError,
    handleApiError
  }
}

export default GracefulErrorBoundary
