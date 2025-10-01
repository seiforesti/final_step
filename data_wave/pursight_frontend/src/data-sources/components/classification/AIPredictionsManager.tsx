/**
 * Advanced AI Predictions Manager Component
 * Comprehensive AI prediction management interface
 */

import React, { useState, useMemo } from 'react'
import { AIPrediction } from '../../types/classification'

interface AIPredictionsManagerProps {
  predictions: AIPrediction[]
  selectedPrediction: AIPrediction | null
  onSelectPrediction: (prediction: AIPrediction | null) => void
  onCreatePrediction: (prediction: any) => Promise<void>
  onValidatePrediction: (predictionId: number, validation: any) => Promise<void>
  isLoading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function AIPredictionsManager({
  predictions,
  selectedPrediction,
  onSelectPrediction,
  onCreatePrediction,
  onValidatePrediction,
  isLoading,
  error,
  searchQuery,
  onSearchChange
}: AIPredictionsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [selectedPredictionForValidation, setSelectedPredictionForValidation] = useState<AIPrediction | null>(null)
  const [sortBy, setSortBy] = useState<'created_at' | 'confidence_score' | 'status'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filtered and sorted predictions
  const filteredPredictions = useMemo(() => {
    let filtered = predictions.filter(prediction =>
      prediction.target_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prediction.target_identifier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prediction.prediction_result?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'created_at':
          aValue = a.id // Use ID as proxy for creation order
          bValue = b.id
          break
        case 'confidence_score':
          aValue = a.confidence_score || 0
          bValue = b.confidence_score || 0
          break
        case 'status':
          aValue = a.confidence_level || 'medium'
          bValue = b.confidence_level || 'medium'
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [predictions, searchQuery, sortBy, sortOrder])

  const handleCreatePrediction = async (predictionData: any) => {
    try {
      await onCreatePrediction(predictionData)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create AI prediction:', error)
    }
  }

  const handleValidatePrediction = async (validationData: any) => {
    if (!selectedPredictionForValidation) return
    
    try {
      await onValidatePrediction(selectedPredictionForValidation.id, validationData)
      setShowValidationModal(false)
      setSelectedPredictionForValidation(null)
    } catch (error) {
      console.error('Failed to validate prediction:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-blue-400'
      case 'error': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400'
    if (score >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatPredictionResult = (result: any) => {
    if (typeof result === 'string') {
      return result.length > 100 ? result.substring(0, 100) + '...' : result
    }
    return JSON.stringify(result).substring(0, 100) + '...'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-200">AI Predictions</h2>
          <p className="text-sm text-zinc-400">Manage AI predictions and results</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-9 px-4 text-sm rounded border border-purple-600 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
        >
          Create Prediction
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search predictions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder-zinc-500"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
        >
          <option value="created_at">Sort by Date</option>
          <option value="confidence_score">Sort by Confidence</option>
          <option value="status">Sort by Status</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="h-9 px-3 text-sm rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded border border-red-600 bg-red-600/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Predictions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-400">Loading predictions...</div>
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔮</div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No Predictions Found</h3>
          <p className="text-zinc-400 mb-4">Create your first AI prediction to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 text-sm rounded border border-purple-600 bg-purple-600/20 text-purple-300"
          >
            Create Prediction
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPredictions.map((prediction) => (
            <div
              key={prediction.id}
              onClick={() => onSelectPrediction(prediction)}
              className={`p-4 rounded border cursor-pointer transition-colors ${
                selectedPrediction?.id === prediction.id
                  ? 'border-purple-600 bg-purple-600/20'
                  : 'border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800/70'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-zinc-200">
                      Prediction #{prediction.id}
                    </h3>
                    <span className={`text-xs font-medium ${getStatusColor(prediction.confidence_level || 'medium')}`}>
                      {prediction.confidence_level || 'medium'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {prediction.target_type} • {prediction.target_identifier}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {prediction.confidence_score && (
                    <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidence_score)}`}>
                      {(prediction.confidence_score * 100).toFixed(1)}%
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPredictionForValidation(prediction)
                      setShowValidationModal(true)
                    }}
                    className="text-xs text-green-400 hover:text-green-300"
                  >
                    Validate
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-zinc-300">
                    <span className="text-zinc-500">Result:</span> {formatPredictionResult(prediction.prediction_result)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">AI Model:</span>
                  <span className="text-zinc-300">Model ID {prediction.ai_model_id}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Prediction ID:</span>
                  <span className="text-zinc-300">{prediction.prediction_id}</span>
                </div>
                {prediction.processing_time_ms && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Processing Time:</span>
                    <span className="text-zinc-300">
                      {prediction.processing_time_ms}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Prediction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Create AI Prediction
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">AI Model ID</label>
                  <input
                    id="prediction-model-id"
                    type="number"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter AI model ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Target Type</label>
                  <input
                    id="prediction-target-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="e.g., data_source, table, column"
                  />
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">Input Data</label>
                <textarea
                  id="prediction-input-data"
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  placeholder="Enter input data (JSON format)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Context (Optional)</label>
                <textarea
                  id="prediction-context"
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  placeholder="Enter additional context (JSON format)"
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
                  const formData = {
                    ai_model_id: parseInt((document.getElementById('prediction-model-id') as HTMLInputElement)?.value || '0'),
                    target_type: (document.getElementById('prediction-target-type') as HTMLInputElement)?.value,
                    target_id: (document.getElementById('prediction-target-id') as HTMLInputElement)?.value,
                    target_identifier: (document.getElementById('prediction-target-identifier') as HTMLInputElement)?.value,
                    input_data: (document.getElementById('prediction-input-data') as HTMLTextAreaElement)?.value,
                    context: (document.getElementById('prediction-context') as HTMLTextAreaElement)?.value
                  }
                  handleCreatePrediction(formData)
                }}
                className="h-8 px-3 text-xs rounded border border-purple-600 bg-purple-600/20 text-purple-300"
              >
                Create Prediction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && selectedPredictionForValidation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Validate Prediction #{selectedPredictionForValidation.id}
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Validation Result</label>
                <select
                  id="validation-result"
                  className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                >
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                  <option value="uncertain">Uncertain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Validation Notes</label>
                <textarea
                  id="validation-notes"
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  placeholder="Enter validation notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Confidence Score</label>
                <input
                  id="validation-confidence"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  placeholder="0.0 - 1.0"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowValidationModal(false)
                  setSelectedPredictionForValidation(null)
                }}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const formData = {
                    is_valid: (document.getElementById('validation-result') as HTMLSelectElement)?.value === 'valid',
                    notes: (document.getElementById('validation-notes') as HTMLTextAreaElement)?.value,
                    confidence_score: parseFloat((document.getElementById('validation-confidence') as HTMLInputElement)?.value || '0')
                  }
                  handleValidatePrediction(formData)
                }}
                className="h-8 px-3 text-xs rounded border border-green-600 bg-green-600/20 text-green-300"
              >
                Validate Prediction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
