'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Bug, Home, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableDetailedErrorReporting?: boolean
  enableAutoRecovery?: boolean
  autoRecoveryTimeout?: number
  componentName?: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
  isAutoRecovering: boolean
  showDetails: boolean
}

export class EnterpriseSidebarErrorBoundary extends Component<Props, State> {
  private autoRecoveryTimer: NodeJS.Timeout | null = null
  private maxRetries = 3
  private errorReportingEndpoint = '/api/error-reporting'

  constructor(props: Props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isAutoRecovering: false,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID
    const errorId = `sidebar-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableDetailedErrorReporting, componentName, enableAutoRecovery, autoRecoveryTimeout } = this.props
    
    // Update state with error info
    this.setState({
      errorInfo
    })

    // Call custom error handler
    onError?.(error, errorInfo)

    // Log detailed error information
    console.error(`[${componentName || 'EnterpriseSidebarErrorBoundary'}] Error caught:`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })

    // Send error report if enabled
    if (enableDetailedErrorReporting) {
      this.sendErrorReport(error, errorInfo)
    }

    // Attempt auto-recovery if enabled
    if (enableAutoRecovery && this.state.retryCount < this.maxRetries) {
      const timeout = autoRecoveryTimeout || 3000
      this.setState({ isAutoRecovering: true })
      
      this.autoRecoveryTimer = setTimeout(() => {
        this.handleRetry()
      }, timeout)
    }
  }

  componentWillUnmount() {
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer)
    }
  }

  sendErrorReport = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        errorId: this.state.errorId,
        component: this.props.componentName || 'EnterpriseSidebarErrorBoundary',
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        context: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          retryCount: this.state.retryCount
        },
        performance: {
          memory: 'memory' in performance ? (performance as any).memory : null,
          timing: performance.timing
        }
      }

      await fetch(this.errorReportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      })
    } catch (reportingError) {
      console.error('Failed to send error report:', reportingError)
    }
  }

  handleRetry = () => {
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer)
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isAutoRecovering: false
    }))
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isAutoRecovering: false,
      showDetails: false
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleNavigateHome = () => {
    window.location.href = '/'
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback
    }

    const { error, errorInfo, errorId, retryCount, isAutoRecovering, showDetails } = this.state
    const { componentName, enableAutoRecovery } = this.props
    const canRetry = retryCount < this.maxRetries

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4 bg-background">
        <Card className="w-full max-w-2xl mx-auto border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">
              {componentName ? `${componentName} Error` : 'Sidebar Component Error'}
            </CardTitle>
            <CardDescription>
              An unexpected error occurred while rendering the sidebar component
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Summary */}
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="space-y-2">
                  <p><strong>Type:</strong> {error?.name || 'Unknown Error'}</p>
                  <p><strong>Message:</strong> {error?.message || 'No error message available'}</p>
                  <p><strong>Error ID:</strong> <code className="text-xs">{errorId}</code></p>
                  {retryCount > 0 && (
                    <p><strong>Retry Attempts:</strong> {retryCount} / {this.maxRetries}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Auto-recovery status */}
            {isAutoRecovering && enableAutoRecovery && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>Auto-Recovery in Progress</AlertTitle>
                <AlertDescription>
                  Attempting to recover automatically...
                </AlertDescription>
              </Alert>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                onClick={this.handleRetry} 
                disabled={!canRetry || isAutoRecovering}
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isAutoRecovering ? 'animate-spin' : ''}`} />
                {isAutoRecovering ? 'Recovering...' : 'Retry Component'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleReload}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleNavigateHome}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            {/* Retry status */}
            {!canRetry && !isAutoRecovering && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Maximum Retries Exceeded</AlertTitle>
                <AlertDescription>
                  The component has failed {this.maxRetries} times. Please reload the page or contact support.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Technical details (collapsible) */}
            <Collapsible open={showDetails} onOpenChange={this.toggleDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span>Technical Details</span>
                  <Badge variant="secondary">
                    {showDetails ? 'Hide' : 'Show'}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Error stack trace */}
                {error?.stack && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Stack Trace:</h4>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {/* Component stack trace */}
                {errorInfo?.componentStack && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Component Stack:</h4>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}

                {/* Environment info */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Environment:</h4>
                  <div className="text-xs space-y-1 bg-muted p-3 rounded-md">
                    <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
                    <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                    <p><strong>URL:</strong> {window.location.href}</p>
                    {(performance as any).memory && (
                      <p><strong>Memory:</strong> {Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB used</p>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Support information */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                If this error persists, please contact support with the Error ID above.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button variant="link" size="sm" asChild>
                  <a href="/support" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Contact Support
                  </a>
                </Button>
                <span className="text-muted-foreground">•</span>
                <Button variant="link" size="sm" asChild>
                  <a href="/docs/troubleshooting" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Troubleshooting Guide
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default EnterpriseSidebarErrorBoundary