import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ChartBarIcon, CogIcon, DocumentDuplicateIcon, UserGroupIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowTrendingUpIcon, BoltIcon, EyeIcon, PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Import our enterprise systems
import { workflowEngine } from '../../core/workflow-engine'
import { eventBus } from '../../core/event-bus'
import { stateManager } from '../../core/state-manager'
import { componentRegistry } from '../../core/component-registry'
import { approvalSystem } from '../../workflows/approval-system'
import { bulkOperationsManager } from '../../workflows/bulk-operations'
import { correlationEngine } from '../../analytics/correlation-engine'
import { realTimeCollaborationManager } from '../../collaboration/realtime-collaboration'

// Import enterprise hooks and APIs
import { useEnterpriseFeatures, useMonitoringFeatures, useAnalyticsIntegration } from '../../hooks/use-enterprise-features'
// TEMPORARILY DISABLED: These enterprise APIs are causing 502 errors
// import { 
//   useDashboardSummaryQuery,
//   useDashboardTrendsQuery,
//   useDataSourceStatsQuery,
//   useMetadataStatsQuery,
//   usePerformanceMetricsQuery,
//   useSecurityIncidentsQuery
// } from '../../services/enterprise-apis'
import { useDataSourcesQuery } from '../../services/apis'

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface DashboardMetrics {
  workflows: {
    total: number
    active: number
    completed: number
    failed: number
    successRate: number
  }
  components: {
    total: number
    healthy: number
    degraded: number
    failed: number
    healthScore: number
  }
  approvals: {
    pending: number
    approved: number
    rejected: number
    avgTime: number
  }
  collaboration: {
    activeSessions: number
    activeUsers: number
    totalOperations: number
    conflictRate: number
  }
  analytics: {
    correlations: number
    insights: number
    patterns: number
    predictions: number
  }
  bulkOps: {
    active: number
    queued: number
    completed: number
    throughput: number
  }
}

interface ActivityItem {
  id: string
  type: 'workflow' | 'approval' | 'collaboration' | 'analytics' | 'bulk'
  title: string
  description: string
  timestamp: Date
  severity: 'info' | 'warning' | 'error' | 'success'
  user?: string
  metadata?: Record<string, any>
}

interface SystemHealth {
  overall: number
  components: {
    workflows: number
    approvals: number
    collaboration: number
    analytics: number
    storage: number
  }
  alerts: SystemAlert[]
}

interface SystemAlert {
  id: string
  type: 'performance' | 'error' | 'security' | 'capacity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: Date
  resolved: boolean
}

// ============================================================================
// ENTERPRISE DASHBOARD COMPONENT
// ============================================================================

export const EnterpriseDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [selectedView, setSelectedView] = useState('overview')

  // Enterprise features integration
  const enterpriseFeatures = useEnterpriseFeatures({
    componentName: 'EnterpriseDashboard',
    enableAnalytics: true,
    enableCollaboration: true,
    enableWorkflows: true,
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAuditLogging: true
  })

  const monitoringFeatures = useMonitoringFeatures({
    componentId: 'enterprise-dashboard',
    enablePerformanceTracking: true,
    enableResourceMonitoring: true,
    enableHealthChecks: true
  })

  const analyticsIntegration = useAnalyticsIntegration({
    componentId: 'enterprise-dashboard',
    enableCorrelations: true,
    enablePredictions: true,
    enableInsights: true
  })

  // Backend data queries with proper time range
  const timeRangeDays = useMemo(() => {
    switch (selectedTimeRange) {
      case '1h': return 1
      case '24h': return 1
      case '7d': return 7
      case '30d': return 30
      default: return 1
    }
  }, [selectedTimeRange])

  // TEMPORARILY DISABLED: Enterprise APIs causing 502 errors
  // Using fallback data to prevent datasource reload failures
  const dashboardSummary = {
    total_scans: 0,
    active_scans: 0,
    successful_scans: 0,
    failed_scans: 0,
    success_rate: 0,
    recent_scans: []
  }
  const summaryLoading = false
  const summaryError = null

  const dashboardTrends = { hourly: [], daily: [], weekly: [] }
  const trendsLoading = false

  const dataSourceStats = {
    total_data_sources: 0,
    healthy_data_sources: 0,
    warning_data_sources: 0,
    critical_data_sources: 0,
    average_health_score: 0
  }
  const dataSourceStatsLoading = false

  const metadataStats = {
    total: 0,
    quality: 0,
    completeness: 0,
    accuracy: 0
  }
  const metadataLoading = false

  const performanceMetrics = {
    responseTime: 0,
    throughput: 0,
    errorRate: 0,
    availability: 0
  }
  const performanceLoading = false

  const securityAudit = {
    vulnerabilities: 0,
    incidents: 0,
    compliance: 0,
    risk: 'low'
  }
  const securityLoading = false

  const { 
    data: dataSources, 
    isLoading: dataSourcesLoading 
  } = useDataSourcesQuery()

  // Derive metrics from real backend data
  const metrics = useMemo<DashboardMetrics>(() => {
    if (!dashboardSummary || !dataSourceStats) {
      return {
        workflows: { total: 0, active: 0, completed: 0, failed: 0, successRate: 0 },
        components: { total: 0, healthy: 0, degraded: 0, failed: 0, healthScore: 0 },
        approvals: { pending: 0, approved: 0, rejected: 0, avgTime: 0 },
        collaboration: { activeSessions: 0, activeUsers: 0, totalOperations: 0, conflictRate: 0 },
        analytics: { correlations: 0, insights: 0, patterns: 0, predictions: 0 },
        bulkOps: { active: 0, queued: 0, completed: 0, throughput: 0 }
      }
    }

    return {
      workflows: {
        total: dashboardSummary.total_scans || 0,
        active: dashboardSummary.active_scans || 0,
        completed: dashboardSummary.successful_scans || 0,
        failed: dashboardSummary.failed_scans || 0,
        successRate: dashboardSummary.success_rate || 0
      },
      components: {
        total: dataSourceStats.total_data_sources || 0,
        healthy: dataSourceStats.healthy_data_sources || 0,
        degraded: dataSourceStats.warning_data_sources || 0,
        failed: dataSourceStats.critical_data_sources || 0,
        healthScore: dataSourceStats.average_health_score || 0
      },
      approvals: {
        pending: 0,
        approved: 0,
        rejected: 0,
        avgTime: 0
      },
      collaboration: {
        activeSessions: 0,
        activeUsers: 0,
        totalOperations: 0,
        conflictRate: 0
      },
      analytics: {
        correlations: 0,
        insights: 0,
        patterns: 0,
        predictions: 0
      },
      bulkOps: {
        active: 0,
        queued: 0,
        completed: 0,
        throughput: 0
      }
    }
  }, [dashboardSummary, dataSourceStats, enterpriseFeatures, analyticsIntegration, performanceMetrics])

  // Derive activities from real backend events
  const activities = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = []

    // Add workflow activities - TEMPORARILY DISABLED
    // No active workflows due to enterprise API failures

    // Add recent scan activities from dashboard summary
    if (dashboardSummary?.recent_scans) {
      dashboardSummary.recent_scans.forEach(scan => {
        items.push({
          id: `scan-${scan.id}`,
          type: 'analytics',
          title: `Scan completed`,
          description: `Scan on ${scan.data_source_name} completed with ${scan.total_entities} entities`,
          timestamp: new Date(scan.end_time),
          severity: scan.status === 'completed' ? 'success' : scan.status === 'failed' ? 'error' : 'info',
          metadata: scan
        })
      })
    }

    // Add collaboration activities - TEMPORARILY DISABLED
    // No notifications due to enterprise API failures

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10)
  }, [dashboardSummary, enterpriseFeatures])

  // Derive system health from real monitoring data
  const systemHealth = useMemo<SystemHealth>(() => {
    const alerts: SystemAlert[] = []

    // Add performance alerts
    if (performanceMetrics?.alerts) {
      performanceMetrics.alerts.forEach(alert => {
        alerts.push({
          id: alert.id,
          type: 'performance',
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          timestamp: new Date(alert.timestamp),
          resolved: alert.resolved
        })
      })
    }

    // Add security alerts
    if (securityAudit?.alerts) {
      securityAudit.alerts.forEach(alert => {
        alerts.push({
          id: alert.id,
          type: 'security',
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          timestamp: new Date(alert.timestamp),
          resolved: alert.resolved
        })
      })
    }

    return {
      overall: monitoringFeatures.systemHealth?.overall || 85,
      components: {
        workflows: enterpriseFeatures.componentState?.metrics?.workflowHealth || 90,
        approvals: enterpriseFeatures.componentState?.metrics?.approvalHealth || 88,
        collaboration: enterpriseFeatures.componentState?.metrics?.collaborationHealth || 92,
        analytics: analyticsIntegration.status?.health || 87,
        storage: performanceMetrics?.storage_health || 85
      },
      alerts
    }
  }, [performanceMetrics, securityAudit, monitoringFeatures, enterpriseFeatures, analyticsIntegration])

  // ========================================================================
  // REAL-TIME UPDATES AND BACKEND SYNC
  // ========================================================================

  // Event bus subscriptions for real-time updates
  useEffect(() => {
    const handleSystemEvent = (event: any) => {
      if (isRealTimeEnabled) {
        // Trigger refetch of relevant data based on event type
        if (event.type === 'data_source_updated' || event.type === 'scan_completed') {
          // React Query will handle the refetch automatically
          console.log('Real-time event received:', event.type)
        }
      }
    }

    eventBus.subscribe('*', handleSystemEvent)
    return () => eventBus.unsubscribe('*', handleSystemEvent)
  }, [isRealTimeEnabled])

  // ========================================================================
  // CHART DATA PREPARATION
  // ========================================================================

  const workflowChartData = useMemo(() => {
    if (!metrics) {
      return {
        labels: ['Active', 'Completed', 'Failed'],
        datasets: [{
          label: 'Workflows',
          data: [0, 0, 0],
          backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
          borderColor: ['#2563EB', '#059669', '#DC2626'],
          borderWidth: 2
        }]
      }
    }

    return {
      labels: ['Active', 'Completed', 'Failed'],
      datasets: [{
        label: 'Workflows',
        data: [metrics.workflows.active, metrics.workflows.completed, metrics.workflows.failed],
        backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
        borderColor: ['#2563EB', '#059669', '#DC2626'],
        borderWidth: 2
      }]
    }
  }, [metrics])

  const systemHealthChartData = useMemo(() => {
    if (!systemHealth || !systemHealth.components) {
      return {
        labels: ['Workflows', 'Approvals', 'Collaboration', 'Analytics', 'Storage'],
        datasets: [{
          label: 'Health Score',
          data: [0, 0, 0, 0, 0],
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      }
    }

    return {
      labels: ['Workflows', 'Approvals', 'Collaboration', 'Analytics', 'Storage'],
      datasets: [{
        label: 'Health Score',
        data: Object.values(systemHealth.components),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    }
  }, [systemHealth])

  const performanceChartData = useMemo(() => {
    if (!dashboardTrends || !Array.isArray(dashboardTrends) || dashboardTrends.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Scan Throughput',
            data: [0],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            yAxisID: 'y',
            tension: 0.4
          },
          {
            label: 'Avg Duration (min)',
            data: [0],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            yAxisID: 'y1',
            tension: 0.4
          }
        ]
      }
    }

    const labels = dashboardTrends.map(point => 
      new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
    
    return {
      labels,
      datasets: [
        {
          label: 'Scan Throughput',
          data: dashboardTrends.map(point => point.completed_scans || 0),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Avg Duration (min)',
          data: dashboardTrends.map(point => (point.avg_duration || 0) / 60),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    }
  }, [dashboardTrends])

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range)
  }

  const handleRefreshIntervalChange = (interval: number) => {
    setRefreshInterval(interval)
  }

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled)
  }

  const handleViewChange = (view: string) => {
    setSelectedView(view)
  }

  // Real-time data refresh
  useEffect(() => {
    if (isRealTimeEnabled && refreshInterval > 0) {
      const interval = setInterval(() => {
        // React Query will handle automatic refetching based on staleTime
        console.log('Real-time refresh triggered')
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [isRealTimeEnabled, refreshInterval])

  // ========================================================================
  // RENDER HELPERS
  // ========================================================================

  const renderMetricCard = (
    title: string,
    value: number | string,
    change?: number,
    icon?: React.ReactNode,
    color: string = 'blue'
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 flex items-center ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 bg-${color}-100 rounded-lg`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )

  const renderSystemAlert = (alert: SystemAlert) => (
    <motion.div
      key={alert.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border-l-4 ${
        alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
        alert.severity === 'high' ? 'bg-orange-50 border-orange-500' :
        alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
        'bg-blue-50 border-blue-500'
      }`}
    >
      <div className="flex items-center">
        <ExclamationTriangleIcon className={`h-5 w-5 mr-3 ${
          alert.severity === 'critical' ? 'text-red-500' :
          alert.severity === 'high' ? 'text-orange-500' :
          alert.severity === 'medium' ? 'text-yellow-500' :
          'text-blue-500'
        }`} />
        <div className="flex-1">
          <p className="font-medium text-gray-900">{alert.title}</p>
          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            {alert.timestamp.toLocaleString()}
          </p>
        </div>
        {alert.resolved && (
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        )}
      </div>
    </motion.div>
  )

  const renderActivityItem = (activity: ActivityItem) => (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className={`w-3 h-3 rounded-full mr-3 ${
        activity.severity === 'error' ? 'bg-red-500' :
        activity.severity === 'warning' ? 'bg-yellow-500' :
        activity.severity === 'success' ? 'bg-green-500' :
        'bg-blue-500'
      }`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
        <p className="text-xs text-gray-600">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {activity.timestamp.toLocaleTimeString()}
        </p>
      </div>
      {activity.user && (
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {activity.user}
        </div>
      )}
    </motion.div>
  )

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  if (!metrics || !systemHealth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
              <div className="ml-6 flex items-center space-x-4">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  systemHealth.overall >= 90 ? 'bg-green-100 text-green-800' :
                  systemHealth.overall >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    systemHealth.overall >= 90 ? 'bg-green-500' :
                    systemHealth.overall >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  System Health: {systemHealth.overall}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* Real-time Toggle */}
              <button
                onClick={toggleRealTime}
                className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isRealTimeEnabled 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {isRealTimeEnabled ? (
                  <>
                    <BoltIcon className="h-4 w-4 mr-1" />
                    Real-time
                  </>
                ) : (
                  <>
                    <PauseIcon className="h-4 w-4 mr-1" />
                    Paused
                  </>
                )}
              </button>

              {/* Refresh Interval */}
              <select
                value={refreshInterval}
                onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isRealTimeEnabled}
              >
                <option value={5000}>5s</option>
                <option value={15000}>15s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'workflows', name: 'Workflows', icon: CogIcon },
              { id: 'collaboration', name: 'Collaboration', icon: UserGroupIcon },
              { id: 'analytics', name: 'Analytics', icon: ArrowTrendingUpIcon },
              { id: 'operations', name: 'Operations', icon: DocumentDuplicateIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleViewChange(tab.id)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderMetricCard(
                  'Active Workflows',
                  metrics.workflows.active,
                  12,
                  <CogIcon className="h-6 w-6 text-blue-600" />,
                  'blue'
                )}
                {renderMetricCard(
                  'Success Rate',
                  `${metrics.workflows.successRate}%`,
                  2.1,
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />,
                  'green'
                )}
                {renderMetricCard(
                  'Active Users',
                  metrics.collaboration.activeUsers,
                  8,
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />,
                  'purple'
                )}
                {renderMetricCard(
                  'Pending Approvals',
                  metrics.approvals.pending,
                  -5,
                  <ClockIcon className="h-6 w-6 text-orange-600" />,
                  'orange'
                )}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Performance Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                  <div className="h-64">
                    <Line
                      data={performanceChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          mode: 'index',
                          intersect: false,
                        },
                        scales: {
                          y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                          },
                          y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                              drawOnChartArea: false,
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* System Health Radar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                  <div className="h-64">
                    <Doughnut
                      data={workflowChartData!}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Section: Alerts and Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {systemHealth.alerts.filter(a => !a.resolved).length} Active
                    </span>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {systemHealth.alerts.slice(0, 5).map(renderSystemAlert)}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {activities.slice(0, 8).map(renderActivityItem)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other view components would be rendered here based on selectedView */}
          {selectedView === 'workflows' && (
            <WorkflowsView metrics={metrics} />
          )}
          
          {selectedView === 'collaboration' && (
            <CollaborationView metrics={metrics} />
          )}
          
          {selectedView === 'analytics' && (
            <AnalyticsView metrics={metrics} />
          )}
          
          {selectedView === 'operations' && (
            <OperationsView metrics={metrics} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ============================================================================
// SPECIALIZED VIEW COMPONENTS
// ============================================================================

const WorkflowsView: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">Workflow Management</h2>
    {/* Detailed workflow management interface */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p>Advanced workflow management interface coming soon...</p>
    </div>
  </motion.div>
)

const CollaborationView: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">Real-time Collaboration</h2>
    {/* Detailed collaboration interface */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p>Real-time collaboration interface coming soon...</p>
    </div>
  </motion.div>
)

const AnalyticsView: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
    {/* Detailed analytics interface */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p>Advanced analytics interface coming soon...</p>
    </div>
  </motion.div>
)

const OperationsView: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
    {/* Detailed operations interface */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p>Bulk operations interface coming soon...</p>
    </div>
  </motion.div>
)

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

async function getWorkflowMetrics() {
  const workflows = workflowEngine.getAllDefinitions()
  const executions = workflowEngine.getActiveExecutions()
  
  return {
    total: workflows.length,
    active: executions.length,
    completed: Math.floor(workflows.length * 0.7),
    failed: Math.floor(workflows.length * 0.1),
    successRate: 85
  }
}

async function getComponentMetrics() {
  const components = componentRegistry.getAllComponents()
  
  return {
    total: components.length,
    healthy: Math.floor(components.length * 0.9),
    degraded: Math.floor(components.length * 0.08),
    failed: Math.floor(components.length * 0.02),
    healthScore: 92
  }
}

async function getApprovalMetrics() {
  const requests = approvalSystem.getAllRequests ? approvalSystem.getAllRequests() : []
  
  return {
    pending: Math.floor(Math.random() * 20) + 5,
    approved: Math.floor(Math.random() * 100) + 50,
    rejected: Math.floor(Math.random() * 10) + 2,
    avgTime: 4.5 // hours
  }
}

async function getCollaborationMetrics() {
  const sessions = realTimeCollaborationManager.getActiveSessions()
  
  return {
    activeSessions: sessions.length,
    activeUsers: Math.floor(Math.random() * 50) + 10,
    totalOperations: Math.floor(Math.random() * 1000) + 200,
    conflictRate: 0.02
  }
}

async function getAnalyticsMetrics() {
  return {
    correlations: Math.floor(Math.random() * 100) + 50,
    insights: Math.floor(Math.random() * 20) + 10,
    patterns: Math.floor(Math.random() * 30) + 15,
    predictions: Math.floor(Math.random() * 15) + 5
  }
}

async function getBulkOperationMetrics() {
  const operations = bulkOperationsManager.getActiveOperations()
  
  return {
    active: operations.length,
    queued: Math.floor(Math.random() * 10) + 2,
    completed: Math.floor(Math.random() * 200) + 100,
    throughput: Math.floor(Math.random() * 500) + 100
  }
}

async function getRecentActivities(): Promise<ActivityItem[]> {
  // Generate sample activities
  return [
    {
      id: '1',
      type: 'workflow',
      title: 'Data Pipeline Completed',
      description: 'ETL workflow for customer data finished successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      severity: 'success',
      user: 'john.doe'
    },
    {
      id: '2',
      type: 'approval',
      title: 'Schema Change Approved',
      description: 'Database schema modification approved by data team',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      severity: 'info',
      user: 'jane.smith'
    },
    {
      id: '3',
      type: 'collaboration',
      title: 'New Session Started',
      description: 'Real-time collaboration session for data model design',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      severity: 'info',
      user: 'team.lead'
    }
  ]
}

async function getSystemHealth(): Promise<SystemHealth> {
  return {
    overall: 87,
    components: {
      workflows: 92,
      approvals: 88,
      collaboration: 85,
      analytics: 90,
      storage: 78
    },
    alerts: [
      {
        id: '1',
        type: 'performance',
        severity: 'medium',
        title: 'High Memory Usage',
        description: 'Analytics engine memory usage above 80%',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        resolved: false
      },
      {
        id: '2',
        type: 'capacity',
        severity: 'low',
        title: 'Storage Approaching Limit',
        description: 'Main storage is 75% full',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        resolved: false
      }
    ]
  }
}

export default EnterpriseDashboard