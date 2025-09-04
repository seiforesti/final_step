"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Bug, Shield, Activity } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  level?: "critical" | "high" | "medium" | "low"
  context?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  errorId: string
}

export class EnterpriseErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: "",
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { level = "medium", context = "Unknown", onError } = this.props

    this.setState({ errorInfo })

    // Log error with context
    console.error(`[EnterpriseErrorBoundary] ${level.toUpperCase()} Error in ${context}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    })

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }

    // Report to error tracking service (placeholder)
    this.reportError(error, errorInfo, level, context)
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, level: string, context: string) => {
    // In production, this would send to error tracking service
    if ((typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === "production") {
      // Example: Sentry, LogRocket, etc.
      console.log("Reporting error to tracking service:", {
        error: error.message,
        level,
        context,
        errorId: this.state.errorId,
      })
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state

    if (retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))

      // Add delay before retry to prevent rapid failures
      this.retryTimeout = setTimeout(
        () => {
          // Force re-render
          this.forceUpdate()
        },
        1000 * (retryCount + 1),
      )
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: "",
    })
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  render() {
    const { hasError, error, retryCount, errorId } = this.state
    const { children, fallback, level = "medium", context = "Component" } = this.props

    if (hasError && error) {
      if (fallback) {
        return fallback
      }

      const canRetry = retryCount < this.maxRetries
      const levelColors = {
        critical: "destructive",
        high: "destructive",
        medium: "secondary",
        low: "outline",
      } as const

      const levelIcons = {
        critical: Shield,
        high: AlertTriangle,
        medium: Bug,
        low: Activity,
      }

      const IconComponent = levelIcons[level]

      return (
        <Card className="w-full max-w-2xl mx-auto my-4 border-destructive/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <IconComponent className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">System Error Detected</CardTitle>
                <CardDescription>An error occurred in {context}</CardDescription>
              </div>
              <Badge variant={levelColors[level]} className="capitalize">
                {level} Priority
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">Error Details:</p>
              <p className="text-sm font-mono break-all">{error.message}</p>
              <p className="text-xs text-muted-foreground mt-2">Error ID: {errorId}</p>
            </div>

            {retryCount > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Retry attempt {retryCount} of {this.maxRetries}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {canRetry && (
                <Button onClick={this.handleRetry} variant="default" size="sm" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - retryCount} left)
                </Button>
              )}

              <Button onClick={this.handleReset} variant="outline" size="sm">
                Reset Component
              </Button>

              <Button onClick={() => window.location.reload()} variant="ghost" size="sm">
                Reload Page
              </Button>
            </div>

            {(typeof window !== 'undefined' && (window as any).ENV?.NODE_ENV) === "development" && (
              <details className="mt-4">
                <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                  Development Details
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">{error.stack}</pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return children
  }
}
