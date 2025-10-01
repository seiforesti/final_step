/**
 * Advanced AI Model Monitoring Manager Component
 * Comprehensive AI model performance monitoring interface
 */

import React, { useState, useMemo } from 'react'
import { AIModelConfiguration } from '../../types/classification'

interface AIModelMonitoringManagerProps {
  models: AIModelConfiguration[]
  selectedModel: AIModelConfiguration | null
  onSelectModel: (model: AIModelConfiguration | null) => void
  modelPerformance: any
  modelMetrics: any
  onLoadPerformance: (modelId: number) => Promise<void>
  onLoadMetrics: (modelId: number, timeRange?: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function AIModelMonitoringManager({
  models,
  selectedModel,
  onSelectModel,
  modelPerformance,
  modelMetrics,
  onLoadPerformance,
  onLoadMetrics,
  isLoading,
  error
}: AIModelMonitoringManagerProps) {
  const [timeRange, setTimeRange] = useState('24h')
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [showMetricsModal, setShowMetricsModal] = useState(false)

  // Filter active models for monitoring
  const activeModels = useMemo(() => {
    return models.filter(model => model.status === 'active')
  }, [models])

  const handleLoadPerformance = async (modelId: number) => {
    try {
      await onLoadPerformance(modelId)
      setShowPerformanceModal(true)
    } catch (error) {
      console.error('Failed to load model performance:', error)
    }
  }

  const handleLoadMetrics = async (modelId: number) => {
    try {
      await onLoadMetrics(modelId, timeRange)
      setShowMetricsModal(true)
    } catch (error) {
      console.error('Failed to load model metrics:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'inactive': return 'text-gray-400'
      case 'training': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖'
      case 'anthropic': return '🧠'
      case 'google': return '🔍'
      case 'azure': return '☁️'
      case 'aws': return '⚡'
      default: return '🤖'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-200">AI Model Monitoring</h2>
          <p className="text-sm text-zinc-400">Monitor AI model performance and health</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded border border-red-600 bg-red-600/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Monitoring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded border border-zinc-700 bg-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Total Models</span>
            <span className="text-lg">🤖</span>
          </div>
          <div className="text-2xl font-semibold text-zinc-200">{models.length}</div>
          <div className="text-xs text-zinc-500">
            {activeModels.length} active
          </div>
        </div>
        
        <div className="p-4 rounded border border-zinc-700 bg-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Active Models</span>
            <span className="text-lg">✅</span>
          </div>
          <div className="text-2xl font-semibold text-green-400">{activeModels.length}</div>
          <div className="text-xs text-zinc-500">
            {models.length > 0 ? ((activeModels.length / models.length) * 100).toFixed(1) : 0}% of total
          </div>
        </div>
        
        <div className="p-4 rounded border border-zinc-700 bg-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Providers</span>
            <span className="text-lg">☁️</span>
          </div>
          <div className="text-2xl font-semibold text-blue-400">
            {new Set(models.map(m => m.provider)).size}
          </div>
          <div className="text-xs text-zinc-500">
            Unique providers
          </div>
        </div>
        
        <div className="p-4 rounded border border-zinc-700 bg-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Health Score</span>
            <span className="text-lg">📊</span>
          </div>
          <div className="text-2xl font-semibold text-green-400">
            {models.length > 0 ? ((activeModels.length / models.length) * 100).toFixed(0) : 0}%
          </div>
          <div className="text-xs text-zinc-500">
            System health
          </div>
        </div>
      </div>

      {/* Models List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-400">Loading model monitoring data...</div>
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No Models to Monitor</h3>
          <p className="text-zinc-400 mb-4">Create AI models to start monitoring their performance</p>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((model) => (
            <div
              key={model.id}
              onClick={() => onSelectModel(model)}
              className={`p-4 rounded border cursor-pointer transition-colors ${
                selectedModel?.id === model.id
                  ? 'border-blue-600 bg-blue-600/20'
                  : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getProviderIcon(model.provider)}</span>
                  <div>
                    <h3 className="font-medium text-zinc-200">{model.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {model.provider} • {model.model_type} • {model.task_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${getStatusColor(model.status)}`}>
                    {model.status}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLoadPerformance(model.id)
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Performance
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLoadMetrics(model.id)
                      }}
                      className="text-xs text-green-400 hover:text-green-300"
                    >
                      Metrics
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500">Model ID:</span>
                  <div className="text-zinc-300">{model.id}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Version:</span>
                  <div className="text-zinc-300">{model.model_version}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Explainability:</span>
                  <div className="text-zinc-300">
                    {model.explainability_level || 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-4xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Model Performance - {selectedModel?.name || 'Unknown Model'}
            </div>
            <div className="p-4">
              {modelPerformance ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded bg-zinc-800/50">
                      <div className="text-sm text-zinc-400 mb-1">Response Time</div>
                      <div className="text-lg font-semibold text-zinc-200">
                        {modelPerformance.response_time || 'N/A'}ms
                      </div>
                    </div>
                    <div className="p-3 rounded bg-zinc-800/50">
                      <div className="text-sm text-zinc-400 mb-1">Accuracy</div>
                      <div className="text-lg font-semibold text-zinc-200">
                        {modelPerformance.accuracy ? (modelPerformance.accuracy * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 rounded bg-zinc-800/50">
                      <div className="text-sm text-zinc-400 mb-1">Throughput</div>
                      <div className="text-lg font-semibold text-zinc-200">
                        {modelPerformance.throughput || 'N/A'} req/min
                      </div>
                    </div>
                    <div className="p-3 rounded bg-zinc-800/50">
                      <div className="text-sm text-zinc-400 mb-1">Error Rate</div>
                      <div className="text-lg font-semibold text-zinc-200">
                        {modelPerformance.error_rate ? (modelPerformance.error_rate * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded bg-zinc-800/50">
                    <div className="text-sm text-zinc-400 mb-2">Performance Details</div>
                    <pre className="text-xs text-zinc-300 overflow-auto">
                      {JSON.stringify(modelPerformance, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-zinc-400">No performance data available</div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end">
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-4xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Model Metrics - {selectedModel?.name || 'Unknown Model'} ({timeRange})
            </div>
            <div className="p-4">
              {modelMetrics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded bg-zinc-800/50">
                      <div className="text-sm text-zinc-400 mb-1">Total Requests</div>
                      <div className="text-lg font-semibold text-zinc-200">
                        {modelMetrics.total_requests || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 rounded bg-zinc-800/50">
                      <div className="text-sm text-zinc-400 mb-1">Success Rate</div>
                      <div className="text-lg font-semibold text-zinc-200">
                        {modelMetrics.success_rate ? (modelMetrics.success_rate * 100).toFixed(1) + '%' : 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 rounded bg-zinc-800/50">
                      <div className="text-sm text-zinc-400 mb-1">Avg Response Time</div>
                      <div className="text-lg font-semibold text-zinc-200">
                        {modelMetrics.avg_response_time || 'N/A'}ms
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded bg-zinc-800/50">
                    <div className="text-sm text-zinc-400 mb-2">Detailed Metrics</div>
                    <pre className="text-xs text-zinc-300 overflow-auto">
                      {JSON.stringify(modelMetrics, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-zinc-400">No metrics data available</div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end">
              <button
                onClick={() => setShowMetricsModal(false)}
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
