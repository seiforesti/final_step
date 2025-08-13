"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isExpanded: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isExpanded: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isExpanded: false,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  toggleExpanded = () => {
    this.setState((prev) => ({ isExpanded: !prev.isExpanded }))
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  An unexpected error occurred while rendering this component. This might be a temporary issue.
                </AlertDescription>
              </Alert>

              {/* Error details for development */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <Collapsible open={this.state.isExpanded} onOpenChange={this.toggleExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      {this.state.isExpanded ? "Hide" : "Show"} Error Details
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Error Message:</h4>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto">{this.state.error.message}</pre>
                      </div>

                      {this.state.error.stack && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Stack Trace:</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}

                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Component Stack:</h4>
                          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button variant="outline" onClick={this.handleReload} className="flex-1 bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>

                <Button variant="outline" onClick={this.handleGoHome} className="flex-1 bg-transparent">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Help text */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                If this problem persists, please contact support with the error details above.
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by useErrorHandler:", error, errorInfo)
    }

    // In production, send to error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })

    // Re-throw the error to trigger error boundary
    throw error
  }, [])

  return { handleError }
}
