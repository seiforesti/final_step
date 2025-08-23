'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
  Database,
  Shield,
  FileText,
  BookOpen,
  Scan,
  Users,
  Bot,
  MessageSquare,
  Workflow,
  BarChart3,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Eye,
  Settings,
  Info,
  ExternalLink,
  ChevronRight,
  Loader2,
  Gauge,
  CircleDot,
  Circle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// Import racine foundation layers (already implemented)
import { useRacineOrchestration } from '../../../hooks/useRacineOrchestration'
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration'
import { useActivityTracker } from '../../../hooks/useActivityTracker'
import { useUserManagement } from '../../../hooks/useUserManagement'

// Import types (already implemented)
import {
  SystemHealth,
  HealthStatus,
  SPAStatus,
  ServiceHealth,
  GroupHealth,
  IntegrationHealth,
  PerformanceMetrics,
  SystemAlert,
  HealthMetric
} from '../../../types/racine-core.types'

// Import utils (already implemented)
import { getHealthStatusColor, getHealthStatusIcon, formatHealthMetric } from '../../../utils/health-utils'
import { formatTimeAgo, formatPercentage } from '../../../utils/formatting-utils'

// Import constants (already implemented)
import { HEALTH_REFRESH_INTERVAL, HEALTH_THRESHOLDS } from '../../../constants/health-constants'

interface QuickHealthStatusProps {
  refreshInterval?: number
  showDetails?: boolean
  autoRefresh?: boolean
  compact?: boolean
  className?: string
  onHealthClick?: (health: SystemHealth) => void
}

export const QuickHealthStatus: React.FC<QuickHealthStatusProps> = ({
  refreshInterval = HEALTH_REFRESH_INTERVAL,
  showDetails = true,
  autoRefresh = true,
  compact = false,
  className,
  onHealthClick
}) => {
  // State management
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [spaStatuses, setSpaStatuses] = useState<Record<string, SPAStatus>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [healthTrend, setHealthTrend] = useState<'up' | 'down' | 'stable'>('stable')
  const [criticalAlerts, setCriticalAlerts] = useState<SystemAlert[]>([])

  // Custom hooks (already implemented)
  const { 
    getSystemHealth, 
    getPerformanceMetrics,
    getSystemAlerts,
    subscribeToHealthUpdates
  } = useRacineOrchestration()
  
  const { 
    getAllSPAStatuses,
    getIntegrationHealth 
  } = useCrossGroupIntegration()
  
  const { trackEvent } = useActivityTracker()
  const { getCurrentUser } = useUserManagement()

  // Get current user
  const currentUser = getCurrentUser()

  // Load system health
  const loadSystemHealth = useCallback(async () => {
    setIsLoading(true)
    try {
      const [health, spaStatuses, alerts] = await Promise.all([
        getSystemHealth(),
        getAllSPAStatuses(),
        getSystemAlerts({ severity: ['critical', 'high'], limit: 5 })
      ])

      setSystemHealth(health)
      setSpaStatuses(spaStatuses)
      setCriticalAlerts(alerts)
      setLastUpdate(new Date())

      // Determine health trend (simplified)
      if (health.overall === 'healthy') {
        setHealthTrend('up')
      } else if (health.overall === 'failed') {
        setHealthTrend('down')
      } else {
        setHealthTrend('stable')
      }

    } catch (error) {
      console.error('Failed to load system health:', error)
    } finally {
      setIsLoading(false)
    }
  }, [getSystemHealth, getAllSPAStatuses, getSystemAlerts])

  // Auto-refresh health data
  useEffect(() => {
    loadSystemHealth()

    if (autoRefresh) {
      const interval = setInterval(loadSystemHealth, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [loadSystemHealth, autoRefresh, refreshInterval])

  // Subscribe to real-time health updates
  useEffect(() => {
    if (autoRefresh) {
      const unsubscribe = subscribeToHealthUpdates((healthUpdate) => {
        setSystemHealth(prev => prev ? { ...prev, ...healthUpdate } : null)
        setLastUpdate(new Date())
      })

      return unsubscribe
    }
  }, [autoRefresh, subscribeToHealthUpdates])

  // Handle health click
  const handleHealthClick = useCallback(() => {
    if (systemHealth) {
      trackEvent('health_status_clicked', {
        overallStatus: systemHealth.overall,
        criticalAlerts: criticalAlerts.length,
        degradedServices: Object.values(systemHealth.services).filter(s => s.status === 'degraded').length
      })

      onHealthClick?.(systemHealth)
    }
  }, [systemHealth, criticalAlerts.length, trackEvent, onHealthClick])

  // Get overall status display
  const getOverallStatusDisplay = useCallback(() => {
    if (!systemHealth) {
      return {
        status: 'unknown' as HealthStatus,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/30',
        Icon: Clock
      }
    }

    const status = systemHealth.overall
    const color = getHealthStatusColor(status)
    const Icon = getHealthStatusIcon(status)

    let bgColor = 'bg-muted/30'
    switch (status) {
      case 'healthy':
        bgColor = 'bg-green-50 dark:bg-green-950/30'
        break
      case 'degraded':
        bgColor = 'bg-yellow-50 dark:bg-yellow-950/30'
        break
      case 'failed':
        bgColor = 'bg-red-50 dark:bg-red-950/30'
        break
      case 'maintenance':
        bgColor = 'bg-blue-50 dark:bg-blue-950/30'
        break
    }

    return { status, color, bgColor, Icon }
  }, [systemHealth])

  // Get SPA status summary
  const spaStatusSummary = useMemo(() => {
    const statuses = Object.values(spaStatuses)
    return {
      total: statuses.length,
      healthy: statuses.filter(s => s.status === 'healthy').length,
      degraded: statuses.filter(s => s.status === 'degraded').length,
      failed: statuses.filter(s => s.status === 'failed').length
    }
  }, [spaStatuses])

  // Render SPA status indicators
  const renderSPAStatuses = () => {
    const spaList = [
      { id: 'data-sources', name: 'Data Sources', icon: Database },
      { id: 'scan-rule-sets', name: 'Scan Rules', icon: Shield },
      { id: 'classifications', name: 'Classifications', icon: FileText },
      { id: 'compliance-rule', name: 'Compliance', icon: BookOpen },
      { id: 'advanced-catalog', name: 'Catalog', icon: Scan },
      { id: 'scan-logic', name: 'Scan Logic', icon: Activity },
      { id: 'rbac-system', name: 'RBAC', icon: Users }
    ]

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">SPA Status</h4>
        <div className="grid grid-cols-1 gap-1">
          {spaList.map(spa => {
            const status = spaStatuses[spa.id]
            const { color, Icon: StatusIcon } = status 
              ? { color: getHealthStatusColor(status.status), Icon: getHealthStatusIcon(status.status) }
              : { color: 'text-muted-foreground', Icon: Clock }

            return (
              <div key={spa.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted/50">
                <spa.icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs truncate flex-1">{spa.name}</span>
                <StatusIcon className={cn("w-3 h-3", color)} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render performance metrics
  const renderPerformanceMetrics = () => {
    if (!systemHealth?.performance) return null

    const metrics = systemHealth.performance
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Performance</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">CPU Usage</span>
            <span className="text-xs font-medium">{formatPercentage(metrics.cpuUsage)}</span>
          </div>
          <Progress value={metrics.cpuUsage} className="h-1" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Memory Usage</span>
            <span className="text-xs font-medium">{formatPercentage(metrics.memoryUsage)}</span>
          </div>
          <Progress value={metrics.memoryUsage} className="h-1" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Response Time</span>
            <span className="text-xs font-medium">{metrics.responseTime}ms</span>
          </div>
        </div>
      </div>
    )
  }

  // Render critical alerts
  const renderCriticalAlerts = () => {
    if (criticalAlerts.length === 0) return null

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-red-600">Critical Alerts</h4>
        <div className="space-y-1">
          {criticalAlerts.slice(0, 3).map(alert => (
            <div key={alert.id} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded">
              <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-red-800 dark:text-red-200 truncate">
                  {alert.title}
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 truncate">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const { status, color, bgColor, Icon } = getOverallStatusDisplay()

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0 relative", className)}
              onClick={handleHealthClick}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className={cn("w-4 h-4", color)} />
              )}
              {criticalAlerts.length > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">System Status: {status}</p>
              <p className="text-xs text-muted-foreground">
                {spaStatusSummary.healthy}/{spaStatusSummary.total} SPAs healthy
              </p>
              {criticalAlerts.length > 0 && (
                <p className="text-xs text-red-500">
                  {criticalAlerts.length} critical alert{criticalAlerts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)} onClick={handleHealthClick}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Icon className={cn("w-4 h-4", color)} />
          )}
          <span className="text-sm font-medium capitalize">{status}</span>
          {healthTrend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
          {healthTrend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
          {healthTrend === 'stable' && <Minus className="w-3 h-3 text-muted-foreground" />}
          {criticalAlerts.length > 0 && (
            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
              {criticalAlerts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      {showDetails && (
        <PopoverContent align="end" className="w-80 p-0">
          <div className={cn("p-4 border-b", bgColor)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn("w-5 h-5", color)} />
                <div>
                  <h3 className="text-sm font-semibold capitalize">System {status}</h3>
                  <p className="text-xs text-muted-foreground">
                    Last updated {formatTimeAgo(lastUpdate.toISOString())}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={loadSystemHealth}
                        disabled={isLoading}
                      >
                        <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh health status</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View detailed health dashboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">{spaStatusSummary.healthy}</p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-yellow-600">{spaStatusSummary.degraded}</p>
                <p className="text-xs text-muted-foreground">Degraded</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600">{spaStatusSummary.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-96">
            <div className="p-4 space-y-4">
              {/* Critical Alerts */}
              {renderCriticalAlerts()}
              
              {criticalAlerts.length > 0 && <Separator />}
              
              {/* SPA Statuses */}
              {renderSPAStatuses()}
              
              <Separator />
              
              {/* Performance Metrics */}
              {renderPerformanceMetrics()}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between p-3 border-t bg-muted/30 text-xs text-muted-foreground">
            <span>Auto-refresh: {autoRefresh ? 'On' : 'Off'}</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              View Details
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}

export default QuickHealthStatus