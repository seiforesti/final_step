/**
 * Advanced ML Predictions Manager Component
 * Comprehensive management interface for ML predictions
 */

import React, { useCallback, useState } from 'react'
import { MLPrediction } from '../../types/classification'

interface MLPredictionsManagerProps {
  predictions: MLPrediction[]
  selectedPrediction: MLPrediction | null
  onSelectPrediction: (prediction: MLPrediction | null) => void
  onCreatePrediction: (predictionData: {
    model_config_id: number
    target_type: string
    target_id: string
    target_identifier: string
    input_data: any
  }) => Promise<void>
  isLoading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sortBy: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (order: 'asc' | 'desc') => void
  predictionState: {
    isPredicting: boolean
    currentPrediction: MLPrediction | null
    results: any[]
    confidence: number
    error: string | null
  }
}

export default function MLPredictionsManager({
  predictions,
  selectedPrediction,
  onSelectPrediction,
  onCreatePrediction,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  predictionState
}: MLPredictionsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedPredictionDetails, setSelectedPredictionDetails] = useState<MLPrediction | null>(null)

  const handleCreatePrediction = useCallback(async (predictionData: {
    model_config_id: number
    target_type: string
    target_id: string
    target_identifier: string
    input_data: any
  }) => {
    try {
      await onCreatePrediction(predictionData)
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create prediction:', err)
    }
  }, [onCreatePrediction])

  const handleViewDetails = useCallback((prediction: MLPrediction) => {
    setSelectedPredictionDetails(prediction)
    setShowDetailsModal(true)
  }, [])

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-300'
    if (confidence >= 0.6) return 'text-yellow-300'
    return 'text-red-300'
  }

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500/20'
    if (confidence >= 0.6) return 'bg-yellow-500/20'
    return 'bg-red-500/20'
  }

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTargetTypeIcon = (targetType: string) => {
    switch (targetType.toLowerCase()) {
      case 'table': return '📊'
      case 'column': return '📋'
      case 'schema': return '🗂️'
      case 'database': return '🗄️'
      case 'file': return '📁'
      case 'document': return '📄'
      default: return '🎯'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">ML Predictions</h2>
          <p className="text-sm text-zinc-400">Manage machine learning predictions and results</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
          >
            Create Prediction
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search predictions..."
            className="flex-1 h-8 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
          />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
          >
            <option value="created_at">Created Date</option>
            <option value="target_identifier">Target</option>
            <option value="target_type">Type</option>
            <option value="confidence_score">Confidence</option>
            <option value="model_config_id">Model</option>
          </select>
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded border border-zinc-800 bg-zinc-900/50">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Target Type</label>
              <select className="w-full h-8 px-2 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200">
                <option value="all">All Types</option>
                <option value="table">Table</option>
                <option value="column">Column</option>
                <option value="schema">Schema</option>
                <option value="database">Database</option>
                <option value="file">File</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Confidence Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  className="flex-1"
                />
                <span className="text-xs text-zinc-400">0-100%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Model</label>
              <select className="w-full h-8 px-2 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200">
                <option value="all">All Models</option>
                <option value="1">Model 1</option>
                <option value="2">Model 2</option>
                <option value="3">Model 3</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Status */}
      {predictionState.isPredicting && (
        <div className="p-4 rounded border border-blue-500/50 bg-blue-500/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🤖</span>
              <span className="font-medium text-blue-300">Generating Prediction</span>
            </div>
            <span className="text-sm text-blue-300">{formatConfidence(predictionState.confidence)}</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(error || predictionState.error) && (
        <div className="p-3 rounded border border-red-500/50 bg-red-500/10 text-red-300 text-sm">
          {error || predictionState.error}
        </div>
      )}

      {/* Predictions List */}
      <div className="space-y-2">
        {predictions.map((prediction) => (
          <div
            key={prediction.id}
            className={`p-4 rounded border cursor-pointer transition-all ${
              selectedPrediction?.id === prediction.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50'
            }`}
            onClick={() => onSelectPrediction(prediction)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getTargetTypeIcon(prediction.target_type)}</span>
                <div>
                  <h3 className="font-medium text-zinc-200">{prediction.target_identifier}</h3>
                  <p className="text-xs text-zinc-400">{prediction.target_type} • Model #{prediction.model_config_id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded ${getConfidenceBgColor(prediction.confidence_score)} ${getConfidenceColor(prediction.confidence_score)}`}>
                  {formatConfidence(prediction.confidence_score)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-400">
              <div>
                <div className="text-zinc-500">Target ID</div>
                <div className="text-zinc-200 font-mono">{prediction.target_id}</div>
              </div>
              <div>
                <div className="text-zinc-500">Model Config</div>
                <div className="text-zinc-200">#{prediction.model_config_id}</div>
              </div>
              <div>
                <div className="text-zinc-500">Created</div>
                <div className="text-zinc-200">{formatTimestamp(prediction.created_at)}</div>
              </div>
              <div>
                <div className="text-zinc-500">Processing Time</div>
                <div className="text-zinc-200">
                  {prediction.processing_time_ms ? `${prediction.processing_time_ms}ms` : 'N/A'}
                </div>
              </div>
            </div>

            {prediction.prediction_result && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Prediction Result:</div>
                <div className="text-xs text-zinc-300 font-mono bg-zinc-800/50 rounded p-2">
                  {JSON.stringify(prediction.prediction_result, null, 2)}
                </div>
              </div>
            )}

            {prediction.explanation && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 mb-1">Explanation:</div>
                <div className="text-xs text-zinc-300">{prediction.explanation}</div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-zinc-800">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails(prediction)
                }}
                className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Export prediction action
                }}
                className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {predictions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No Predictions Found</h3>
          <p className="text-zinc-400 mb-4">Create your first prediction to start using ML models.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-8 px-4 text-sm rounded border border-blue-600 bg-blue-600/20 text-blue-300"
          >
            Create Prediction
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading predictions...</p>
        </div>
      )}

      {/* Create Prediction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Create Prediction
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Model Config ID</label>
                  <input
                    id="prediction-model-id"
                    type="number"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter model config ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Target Type</label>
                  <select
                    id="prediction-target-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="table">Table</option>
                    <option value="column">Column</option>
                    <option value="schema">Schema</option>
                    <option value="database">Database</option>
                    <option value="file">File</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Target ID</label>
                  <input
                    id="prediction-target-id"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter target ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Target Identifier</label>
                  <input
                    id="prediction-target-identifier"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter target identifier"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Input Data (JSON)</label>
                <textarea
                  id="prediction-input-data"
                  className="w-full h-32 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500 font-mono"
                  placeholder='{"feature1": "value1", "feature2": "value2"}'
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const model_config_id = (document.getElementById('prediction-model-id') as HTMLInputElement)?.value
                  const target_type = (document.getElementById('prediction-target-type') as HTMLSelectElement)?.value
                  const target_id = (document.getElementById('prediction-target-id') as HTMLInputElement)?.value
                  const target_identifier = (document.getElementById('prediction-target-identifier') as HTMLInputElement)?.value
                  const input_data_text = (document.getElementById('prediction-input-data') as HTMLTextAreaElement)?.value
                  
                  if (model_config_id && target_type && target_id && target_identifier && input_data_text) {
                    try {
                      const input_data = JSON.parse(input_data_text)
                      handleCreatePrediction({
                        model_config_id: parseInt(model_config_id),
                        target_type,
                        target_id,
                        target_identifier,
                        input_data
                      })
                    } catch (err) {
                      console.error('Invalid JSON input data:', err)
                    }
                  }
                }}
                className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Details Modal */}
      {showDetailsModal && selectedPredictionDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-4xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Prediction Details
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Target</div>
                  <div className="text-sm text-zinc-200">{selectedPredictionDetails.target_identifier}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Confidence</div>
                  <div className={`text-sm ${getConfidenceColor(selectedPredictionDetails.confidence_score)}`}>
                    {formatConfidence(selectedPredictionDetails.confidence_score)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 mb-1">Prediction Result</div>
                <div className="text-xs text-zinc-300 font-mono bg-zinc-800/50 rounded p-3 max-h-40 overflow-y-auto">
                  {JSON.stringify(selectedPredictionDetails.prediction_result, null, 2)}
                </div>
              </div>
              {selectedPredictionDetails.explanation && (
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Explanation</div>
                  <div className="text-sm text-zinc-300">{selectedPredictionDetails.explanation}</div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
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
