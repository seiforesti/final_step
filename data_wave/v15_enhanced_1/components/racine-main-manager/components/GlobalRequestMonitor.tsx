// ============================================================================
// GLOBAL REQUEST MONITOR - REAL-TIME API REQUEST STATUS AND CONTROL
// ============================================================================

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  RotateCcw,
  Shield,
  Zap,
  Database,
  Clock,
  BarChart3
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { useGlobalAPIInterceptor } from '../hooks/useGlobalAPIInterceptor'
import { RequestPriority } from '../hooks/useGlobalAPIOrchestrator'

interface GlobalRequestMonitorProps {
  isVisible?: boolean
  onToggle?: (visible: boolean) => void
}

export const GlobalRequestMonitor: React.FC<GlobalRequestMonitorProps> = ({
  isVisible = false,
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  const {
    globalState,
    enableEmergencyMode,
    disableEmergencyMode,
    clearQueue,
    getQueueStatus,
    isHealthy,
    config
  } = useGlobalAPIInterceptor()

  // Auto-refresh queue status
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      // Force re-render by getting queue status
      getQueueStatus()
    }, 1000)
    
    return () => clearInterval(interval)
  }, [autoRefresh, getQueueStatus])

  // Get status color based on health
  const getStatusColor = () => {
    if (globalState.isEmergencyMode) return 'text-red-500'
    if (globalState.circuitBreakerOpen) return 'text-yellow-500'
    if (globalState.databaseHealth === 'critical') return 'text-red-500'
    if (globalState.databaseHealth === 'degraded') return 'text-yellow-500'
    return 'text-green-500'
  }

  // Get status icon
  const getStatusIcon = () => {
    if (globalState.isEmergencyMode) return <AlertTriangle className="h-4 w-4" />
    if (globalState.circuitBreakerOpen) return <Pause className="h-4 w-4" />
    if (globalState.databaseHealth === 'critical') return <XCircle className="h-4 w-4" />
    if (globalState.databaseHealth === 'degraded') return <AlertTriangle className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  // Get status text
  const getStatusText = () => {
    if (globalState.isEmergencyMode) return 'Emergency Mode'
    if (globalState.circuitBreakerOpen) return 'Circuit Breaker Open'
    if (globalState.databaseHealth === 'critical') return 'Database Critical'
    if (globalState.databaseHealth === 'degraded') return 'Database Degraded'
    return 'Healthy'
  }

  // Get queue status for display
  const queueStatus = getQueueStatus()
  const totalQueued = Object.values(queueStatus).reduce((sum, count) => sum + count, 0)

  // Calculate system load percentage
  const systemLoad = Math.min(100, (globalState.activeRequests / config.maxConcurrentRequests) * 100)

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      {/* Compact Status Bar */}
      <Card className="w-80 bg-background/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              API Request Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? '−' : '+'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle?.(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-full ${getStatusColor()}`}>
                {getStatusIcon()}
              </div>
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
            <Badge variant={isHealthy() ? "default" : "destructive"}>
              {isHealthy() ? 'OK' : 'ISSUE'}
            </Badge>
          </div>

          {/* System Load */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>System Load</span>
              <span>{globalState.activeRequests}/{config.maxConcurrentRequests}</span>
            </div>
            <Progress value={systemLoad} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Queued: {totalQueued}</span>
              <span>Total: {globalState.totalRequests}</span>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Queue Status by Priority */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Queue Status</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(queueStatus).map(([priority, count]) => (
                      <div key={priority} className="flex justify-between">
                        <span className="capitalize">{priority}</span>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Database Health */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Database Health</h4>
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    <span className="text-xs capitalize">{globalState.databaseHealth}</span>
                    <Badge 
                      variant={globalState.databaseHealth === 'healthy' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {globalState.databaseHealth === 'healthy' ? 'OK' : 'WARNING'}
                    </Badge>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Controls</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={enableEmergencyMode}
                      disabled={globalState.isEmergencyMode}
                      className="text-xs h-8"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Emergency
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disableEmergencyMode}
                      disabled={!globalState.isEmergencyMode}
                      className="text-xs h-8"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Resume
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearQueue()}
                      className="text-xs h-8"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear Queue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className="text-xs h-8"
                    >
                      {autoRefresh ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                      {autoRefresh ? 'Pause' : 'Resume'}
                    </Button>
                  </div>
                </div>

                {/* Configuration Info */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">Configuration</h4>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Max Concurrent:</span>
                      <span>{config.maxConcurrentRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max/Minute:</span>
                      <span>{config.maxRequestsPerMinute}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Batch Size:</span>
                      <span>{config.batchSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Batch Delay:</span>
                      <span>{config.batchDelay}ms</span>
                    </div>
                  </div>
                </div>

                {/* Last Request Info */}
                {globalState.lastRequestTime > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Last Request</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(globalState.lastRequestTime).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
