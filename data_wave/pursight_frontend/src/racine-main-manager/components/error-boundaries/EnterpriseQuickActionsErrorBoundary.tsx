'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Zap, Settings, ExternalLink, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  enableDetailedErrorReporting?: boolean
  enableAutoRecovery?: boolean
  autoRecoveryTimeout?: number
  componentName?: string
  enableQuickRecovery?: boolean
  maxRetries?: number
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
  isAutoRecovering: boolean
  showDetails: boolean
  recoveryProgress: number
  lastErrorTime: number
  errorFrequency: number
  isQuickRecovering: boolean
}

export class EnterpriseQuickActionsErrorBoundary extends Component<Props, State> {
  private autoRecoveryTimer: NodeJS.Timeout | null = null
  private progressTimer: NodeJS.Timeout | null = null
  private maxRetries: number
  private errorReportingEndpoint = '/api/error-reporting/quick-actions'
  private errorHistory: Array<{ timestamp: number; error: string }> = []

  constructor(props: Props) {
    super(props)
    
    this.maxRetries = props.maxRetries || 3
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isAutoRecovering: false,
      showDetails: false,
      recoveryProgress: 0,
      lastErrorTime: 0,
      errorFrequency: 0,
      isQuickRecovering: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `quick-actions-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    
    return {
      hasError: true,
      error,
      errorId,
      lastErrorTime: now
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { 
      onError, 
      enableDetailedErrorReporting, 
      componentName, 
      enableAutoRecovery, 
      autoRecoveryTimeout,
      enableQuickRecovery 
    } = this.props
    
    // Calculate error frequency
    const now = Date.now()
    this.errorHistory.push({ timestamp: now, error: error.message })
    
    // Keep only errors from the last 5 minutes
    this.errorHistory = this.errorHistory.filter(e => now - e.timestamp < 300000)
    
    const errorFrequency = this.errorHistory.length
    
    // Update state with error info
    this.setState({
      errorInfo,
      errorFrequency
    })

    // Call custom error handler
    onError?.(error, errorInfo)

    // Enhanced logging for Quick Actions
    console.error(`[${componentName || 'EnterpriseQuickActionsErrorBoundary'}] Quick Actions Error:`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      context: {
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount,
        errorFrequency,
        quickRecoveryEnabled: enableQuickRecovery
      },
      performance: {
        memory: 'memory' in performance ? (performance as any).memory : null,
        loadedComponents: this.getLoadedComponentsCount()
      }
    })

    // Send error report if enabled
    if (enableDetailedErrorReporting) {
      this.sendErrorReport(error, errorInfo)
    }

    // Determine recovery strategy based on error frequency and type
    if (this.shouldAttemptRecovery(error, errorFrequency)) {
      if (enableQuickRecovery && this.isQuickRecoverableError(error)) {
        this.attemptQuickRecovery()
      } else if (enableAutoRecovery && this.state.retryCount < this.maxRetries) {
        this.attemptAutoRecovery(autoRecoveryTimeout)
      }
    }
  }

  componentWillUnmount() {
    this.cleanupTimers()
  }

  cleanupTimers = () => {
    if (this.autoRecoveryTimer) {
      clearTimeout(this.autoRecoveryTimer)
    }
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
    }
  }

  getLoadedComponentsCount = (): number => {
    // Try to get loaded components count from localStorage or context
    try {
      const quickActionsState = localStorage.getItem('quick-actions-state')
      if (quickActionsState) {
        const parsed = JSON.parse(quickActionsState)
        return parsed.loadedComponents?.length || 0
      }
    } catch {
      // Ignore parsing errors
    }
    return 0
  }

  shouldAttemptRecovery = (error: Error, frequency: number): boolean => {
    // Don't attempt recovery if errors are too frequent (more than 5 in 5 minutes)
    if (frequency > 5) {
      console.warn('Error frequency too high, skipping automatic recovery')
      return false
    }

    // Don't attempt recovery for certain critical errors
    const criticalErrors = ['ChunkLoadError', 'NetworkError', 'SecurityError']
    if (criticalErrors.some(criticalError => error.name.includes(criticalError))) {
      return false
    }

    return true
  }

  isQuickRecoverableError = (error: Error): boolean => {
    // Errors that can be quickly recovered from
    const quickRecoverableErrors = [
      'ComponentLoadError',
      'StateUpdateError',
      'RenderError',
      'HookError'
    ]
    
    return quickRecoverableErrors.some(recoverableError => 
      error.name.includes(recoverableError) || error.message.includes(recoverableError)
    )
  }

  attemptQuickRecovery = () => {
    this.setState({ isQuickRecovering: true })
    
    // Quick recovery: just reset the error state immediately
    setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isQuickRecovering: false
      }))
    }, 500) // Very short delay for quick recovery
  }

  attemptAutoRecovery = (timeout?: number) => {
    const recoveryTimeout = timeout || 3000
    this.setState({ 
      isAutoRecovering: true,
      recoveryProgress: 0
    })
    
    // Progress animation
    const progressInterval = 100
    const progressStep = (progressInterval / recoveryTimeout) * 100
    
    this.progressTimer = setInterval(() => {
      this.setState(prevState => {
        const newProgress = Math.min(prevState.recoveryProgress + progressStep, 100)
        return { recoveryProgress: newProgress }
      })
    }, progressInterval)
    
    this.autoRecoveryTimer = setTimeout(() => {
      this.cleanupTimers()
      this.handleRetry()
    }, recoveryTimeout)
  }

  sendErrorReport = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        errorId: this.state.errorId,
        component: 'EnterpriseQuickActionsSidebar',
        subComponent: this.props.componentName || 'Unknown',
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
          retryCount: this.state.retryCount,
          errorFrequency: this.state.errorFrequency,
          loadedComponentsCount: this.getLoadedComponentsCount()
        },
        performance: {
          memory: 'memory' in performance ? (performance as any).memory : null,
          timing: performance.timing
        },
        quickActionsSpecific: {
          activeCategory: this.getActiveCategory(),
          loadedComponents: this.getLoadedComponents(),
          sidebarState: this.getSidebarState()
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
      console.error('Failed to send Quick Actions error report:', reportingError)
    }
  }

  getActiveCategory = (): string | null => {
    try {
      const state = localStorage.getItem('quick-actions-state')
      return state ? JSON.parse(state).activeCategory : null
    } catch {
      return null
    }
  }

  getLoadedComponents = (): string[] => {
    try {
      const state = localStorage.getItem('quick-actions-state')
      return state ? JSON.parse(state).loadedComponents || [] : []
    } catch {
      return []
    }
  }

  getSidebarState = (): any => {
    try {
      const state = localStorage.getItem('quick-actions-sidebar-state')
      return state ? JSON.parse(state) : null
    } catch {
      return null
    }
  }

  handleRetry = () => {
    this.cleanupTimers()

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isAutoRecovering: false,
      recoveryProgress: 0,
      isQuickRecovering: false
    }))
  }

  handleReset = () => {
    // Clear Quick Actions specific state
    try {
      localStorage.removeItem('quick-actions-state')
      localStorage.removeItem('quick-actions-sidebar-state')
    } catch {
      // Ignore storage errors
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isAutoRecovering: false,
      showDetails: false,
      recoveryProgress: 0,
      lastErrorTime: 0,
      errorFrequency: 0,
      isQuickRecovering: false
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleOpenSettings = () => {
    // Open Quick Actions settings/configuration
    window.open('/settings/quick-actions', '_blank')
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

    const { 
      error, 
      errorInfo, 
      errorId, 
      retryCount, 
      isAutoRecovering, 
      isQuickRecovering,
      showDetails,
      recoveryProgress,
      errorFrequency
    } = this.state
    
    const { componentName, enableAutoRecovery, enableQuickRecovery } = this.props
    const canRetry = retryCount < this.maxRetries
    const isRecovering = isAutoRecovering || isQuickRecovering

    return (
      <div className="flex items-center justify-center min-h-[300px] p-4 bg-background">
        <Card className="w-full max-w-lg mx-auto border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">
              Quick Actions Error
            </CardTitle>
            <CardDescription>
              {componentName ? `${componentName} component failed to load` : 'A Quick Actions component encountered an error'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Summary */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2 space-y-1">
                <p><strong>Type:</strong> {error?.name || 'Unknown Error'}</p>
                <p><strong>Message:</strong> {error?.message || 'No error message available'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    ID: {errorId.slice(-8)}
                  </Badge>
                  {retryCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Retry: {retryCount}/{this.maxRetries}
                    </Badge>
                  )}
                  {errorFrequency > 1 && (
                    <Badge variant="destructive" className="text-xs">
                      Frequent: {errorFrequency}
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Recovery status */}
            {isRecovering && (
              <Alert>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertTitle>
                  {isQuickRecovering ? 'Quick Recovery' : 'Auto-Recovery'} in Progress
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    {isQuickRecovering 
                      ? 'Attempting quick component recovery...' 
                      : 'Attempting to recover the Quick Actions component...'}
                  </p>
                  {isAutoRecovering && (
                    <Progress value={recoveryProgress} className="h-2" />
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={this.handleRetry} 
                disabled={!canRetry || isRecovering}
                size="sm"
                className="w-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`} />
                {isRecovering ? 'Recovering...' : 'Retry'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleReset}
                size="sm"
                className="w-full"
                disabled={isRecovering}
              >
                <Settings className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={this.handleOpenSettings}
                size="sm"
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              <Button 
                variant="outline" 
                onClick={this.handleReload}
                size="sm"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload
              </Button>
            </div>

            {/* Retry exhausted warning */}
            {!canRetry && !isRecovering && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Recovery Failed</AlertTitle>
                <AlertDescription>
                  Quick Actions failed to recover after {this.maxRetries} attempts. 
                  Please try resetting or reloading the page.
                </AlertDescription>
              </Alert>
            )}

            {/* Technical details (collapsible) */}
            <Collapsible open={showDetails} onOpenChange={this.toggleDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>Technical Details</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-3 pt-3">
                {/* Quick summary */}
                <div className="text-xs space-y-1 bg-muted p-2 rounded">
                  <p><strong>Component:</strong> {componentName || 'Quick Actions'}</p>
                  <p><strong>Error ID:</strong> {errorId}</p>
                  <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                  <p><strong>Error Frequency:</strong> {errorFrequency} in last 5 minutes</p>
                  <p><strong>Loaded Components:</strong> {this.getLoadedComponentsCount()}</p>
                  <p><strong>Active Category:</strong> {this.getActiveCategory() || 'None'}</p>
                </div>

                {/* Error stack (truncated) */}
                {error?.stack && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium">Stack Trace (First 3 lines):</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20 whitespace-pre-wrap">
                      {error.stack.split('\n').slice(0, 3).join('\n')}
                    </pre>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Support info */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Need help? Reference Error ID: <code>{errorId.slice(-8)}</code>
              </p>
              <Button variant="link" size="sm" asChild>
                <a href="/docs/quick-actions/troubleshooting" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Quick Actions Guide
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default EnterpriseQuickActionsErrorBoundary