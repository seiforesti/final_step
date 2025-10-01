/**
 * Advanced ML Model Monitoring Manager Component
 * Comprehensive monitoring interface for ML model performance and health
 */

import React, { useCallback, useState } from 'react'

interface MLModelMonitoringManagerProps {
  monitoringState: {
    performance: any
    drift: any
    alerts: any[]
    healthScore: number
    lastUpdated: string | null
  }
  onLoadModelMonitoring: (modelId: number) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function MLModelMonitoringManager({
  monitoringState,
  onLoadModelMonitoring,
  isLoading,
  error
}: MLModelMonitoringManagerProps) {
  const [showAlertsModal, setShowAlertsModal] = useState(false)
  const [showDriftModal, setShowDriftModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-300'
    if (score >= 60) return 'text-yellow-300'
    if (score >= 40) return 'text-orange-300'
    return 'text-red-300'
  }

  const getHealthScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20'
    if (score >= 60) return 'bg-yellow-500/20'
    if (score >= 40) return 'bg-orange-500/20'
    return 'bg-red-500/20'
  }

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-300 bg-red-500/20'
      case 'high': return 'text-orange-300 bg-orange-500/20'
      case 'medium': return 'text-yellow-300 bg-yellow-500/20'
      case 'low': return 'text-blue-300 bg-blue-500/20'
      default: return 'text-zinc-300 bg-zinc-500/20'
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'drift': return '📊'
      case 'performance': return '📈'
      case 'error': return '❌'
      case 'latency': return '⏱️'
      case 'accuracy': return '🎯'
      case 'memory': return '💾'
      default: return '⚠️'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatMetric = (value: number, type: string) => {
    switch (type) {
      case 'percentage':
        return `${Math.round(value * 100)}%`
      case 'latency':
        return `${value.toFixed(2)}ms`
      case 'score':
        return value.toFixed(3)
      default:
        return value.toFixed(2)
    }
  }

  const getDriftStatus = (driftScore: number, threshold: number) => {
    if (driftScore > threshold) return { status: 'High Drift', color: 'text-red-300' }
    if (driftScore > threshold * 0.7) return { status: 'Medium Drift', color: 'text-yellow-300' }
    return { status: 'Low Drift', color: 'text-green-300' }
  }

  const handleViewAlert = useCallback((alert: any) => {
    setSelectedAlert(alert)
  }, [])

  const handleRefresh = useCallback(() => {
    // Simulate refresh
    onLoadModelMonitoring(1)
  }, [onLoadModelMonitoring])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">Model Monitoring</h2>
          <p className="text-sm text-zinc-400">Monitor ML model performance and health</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
          >
            Refresh
          </button>
          <label className="flex items-center space-x-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto Refresh
          </label>
        </div>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Health Score</span>
            <span className="text-lg">🏥</span>
          </div>
          <div className={`text-2xl font-bold ${getHealthScoreColor(monitoringState.healthScore)}`}>
            {monitoringState.healthScore.toFixed(0)}
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getHealthScoreBgColor(monitoringState.healthScore).replace('/20', '')}`}
              style={{ width: `${monitoringState.healthScore}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Active Alerts</span>
            <span className="text-lg">⚠️</span>
          </div>
          <div className="text-2xl font-bold text-zinc-200">
            {monitoringState.alerts.length}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {monitoringState.alerts.filter(alert => alert.severity === 'critical').length} critical
          </div>
        </div>

        <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Drift Score</span>
            <span className="text-lg">📊</span>
          </div>
          <div className={`text-2xl font-bold ${monitoringState.drift ? getDriftStatus(monitoringState.drift.score, monitoringState.drift.threshold).color : 'text-zinc-200'}`}>
            {monitoringState.drift ? formatMetric(monitoringState.drift.score, 'score') : 'N/A'}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {monitoringState.drift ? getDriftStatus(monitoringState.drift.score, monitoringState.drift.threshold).status : 'No data'}
          </div>
        </div>

        <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Last Updated</span>
            <span className="text-lg">🕒</span>
          </div>
          <div className="text-sm text-zinc-200">
            {monitoringState.lastUpdated ? formatTimestamp(monitoringState.lastUpdated) : 'Never'}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {monitoringState.lastUpdated ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {monitoringState.performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
            <div className="text-sm text-zinc-400 mb-2">Accuracy</div>
            <div className="text-xl font-bold text-zinc-200">
              {formatMetric(monitoringState.performance.accuracy, 'percentage')}
            </div>
            <div className="text-xs text-zinc-400">Model accuracy</div>
          </div>
          <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
            <div className="text-sm text-zinc-400 mb-2">Precision</div>
            <div className="text-xl font-bold text-zinc-200">
              {formatMetric(monitoringState.performance.precision, 'percentage')}
            </div>
            <div className="text-xs text-zinc-400">Model precision</div>
          </div>
          <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
            <div className="text-sm text-zinc-400 mb-2">Recall</div>
            <div className="text-xl font-bold text-zinc-200">
              {formatMetric(monitoringState.performance.recall, 'percentage')}
            </div>
            <div className="text-xs text-zinc-400">Model recall</div>
          </div>
          <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
            <div className="text-sm text-zinc-400 mb-2">F1 Score</div>
            <div className="text-xl font-bold text-zinc-200">
              {formatMetric(monitoringState.performance.f1_score, 'percentage')}
            </div>
            <div className="text-xs text-zinc-400">Model F1 score</div>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">Recent Alerts</h3>
          <button
            onClick={() => setShowAlertsModal(true)}
            className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          {monitoringState.alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer"
              onClick={() => handleViewAlert(alert)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getAlertTypeIcon(alert.type)}</span>
                  <div>
                    <div className="text-sm text-zinc-200">{alert.message}</div>
                    <div className="text-xs text-zinc-400">{formatTimestamp(alert.timestamp)}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getAlertSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drift Analysis */}
      {monitoringState.drift && (
        <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-200">Data Drift Analysis</h3>
            <button
              onClick={() => setShowDriftModal(true)}
              className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
            >
              View Details
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Drift Score</div>
              <div className={`text-lg font-bold ${getDriftStatus(monitoringState.drift.score, monitoringState.drift.threshold).color}`}>
                {formatMetric(monitoringState.drift.score, 'score')}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">Threshold</div>
              <div className="text-lg font-bold text-zinc-200">
                {formatMetric(monitoringState.drift.threshold, 'score')}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-1">Status</div>
              <div className={`text-lg font-bold ${getDriftStatus(monitoringState.drift.score, monitoringState.drift.threshold).color}`}>
                {getDriftStatus(monitoringState.drift.score, monitoringState.drift.threshold).status}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded border border-red-500/50 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading monitoring data...</p>
        </div>
      )}

      {/* Alerts Modal */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-4xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              All Alerts
            </div>
            <div className="p-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {monitoringState.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all cursor-pointer"
                    onClick={() => handleViewAlert(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getAlertTypeIcon(alert.type)}</span>
                        <div>
                          <div className="text-sm text-zinc-200">{alert.message}</div>
                          <div className="text-xs text-zinc-400">{formatTimestamp(alert.timestamp)}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${getAlertSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end">
              <button
                onClick={() => setShowAlertsModal(false)}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drift Details Modal */}
      {showDriftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-4xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Drift Analysis Details
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200 mb-3">Drift Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-400">Current Score:</span>
                      <span className="text-sm text-zinc-200">{formatMetric(monitoringState.drift.score, 'score')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-400">Threshold:</span>
                      <span className="text-sm text-zinc-200">{formatMetric(monitoringState.drift.threshold, 'score')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-400">Status:</span>
                      <span className={`text-sm ${getDriftStatus(monitoringState.drift.score, monitoringState.drift.threshold).color}`}>
                        {getDriftStatus(monitoringState.drift.score, monitoringState.drift.threshold).status}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200 mb-3">Recommendations</h4>
                  <div className="text-sm text-zinc-300 space-y-1">
                    {monitoringState.drift.score > monitoringState.drift.threshold ? (
                      <>
                        <p>• Consider retraining the model</p>
                        <p>• Investigate data quality issues</p>
                        <p>• Update feature engineering</p>
                      </>
                    ) : (
                      <>
                        <p>• Model is performing well</p>
                        <p>• Continue monitoring</p>
                        <p>• No immediate action needed</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end">
              <button
                onClick={() => setShowDriftModal(false)}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
