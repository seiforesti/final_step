/**
 * Advanced ML Models Manager Component
 * Comprehensive management interface for ML model configurations
 */

import React, { useCallback, useState } from 'react'
import { MLModelConfiguration, MLModelType, MLModelStatus, MLModelFramework } from '../../types/classification'

interface MLModelsManagerProps {
  models: MLModelConfiguration[]
  selectedModel: MLModelConfiguration | null
  onSelectModel: (model: MLModelConfiguration | null) => void
  onCreateModel: (modelData: Partial<MLModelConfiguration>) => Promise<void>
  onUpdateModel: (id: number, modelData: Partial<MLModelConfiguration>) => Promise<void>
  onDeleteModel: (id: number) => Promise<void>
  isLoading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sortBy: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (order: 'asc' | 'desc') => void
  filterByType: MLModelType | 'all'
  onFilterByTypeChange: (type: MLModelType | 'all') => void
  filterByStatus: MLModelStatus | 'all'
  onFilterByStatusChange: (status: MLModelStatus | 'all') => void
  filterByFramework: MLModelFramework | 'all'
  onFilterByFrameworkChange: (framework: MLModelFramework | 'all') => void
}

export default function MLModelsManager({
  models,
  selectedModel,
  onSelectModel,
  onCreateModel,
  onUpdateModel,
  onDeleteModel,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filterByType,
  onFilterByTypeChange,
  filterByStatus,
  onFilterByStatusChange,
  filterByFramework,
  onFilterByFrameworkChange
}: MLModelsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modelToDelete, setModelToDelete] = useState<MLModelConfiguration | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleCreateModel = useCallback(async (modelData: Partial<MLModelConfiguration>) => {
    try {
      await onCreateModel(modelData)
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create model:', err)
    }
  }, [onCreateModel])

  const handleUpdateModel = useCallback(async (id: number, modelData: Partial<MLModelConfiguration>) => {
    try {
      await onUpdateModel(id, modelData)
      setShowEditModal(false)
    } catch (err) {
      console.error('Failed to update model:', err)
    }
  }, [onUpdateModel])

  const handleDeleteModel = useCallback(async (model: MLModelConfiguration) => {
    setModelToDelete(model)
    setShowDeleteModal(true)
  }, [])

  const confirmDeleteModel = useCallback(async () => {
    if (modelToDelete) {
      try {
        await onDeleteModel(modelToDelete.id)
        setShowDeleteModal(false)
        setModelToDelete(null)
        if (selectedModel?.id === modelToDelete.id) {
          onSelectModel(null)
        }
      } catch (err) {
        console.error('Failed to delete model:', err)
      }
    }
  }, [modelToDelete, onDeleteModel, selectedModel, onSelectModel])

  const getStatusColor = (status: MLModelStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300'
      case 'training': return 'bg-blue-500/20 text-blue-300'
      case 'deployed': return 'bg-purple-500/20 text-purple-300'
      case 'failed': return 'bg-red-500/20 text-red-300'
      case 'paused': return 'bg-yellow-500/20 text-yellow-300'
      default: return 'bg-zinc-500/20 text-zinc-300'
    }
  }

  const getTypeIcon = (type: MLModelType) => {
    switch (type) {
      case 'classification': return '🎯'
      case 'regression': return '📈'
      case 'clustering': return '🔍'
      case 'anomaly_detection': return '⚠️'
      case 'recommendation': return '💡'
      case 'nlp': return '📝'
      case 'computer_vision': return '👁️'
      case 'time_series': return '⏰'
      default: return '🤖'
    }
  }

  const getFrameworkIcon = (framework: MLModelFramework) => {
    switch (framework) {
      case 'tensorflow': return '🧠'
      case 'pytorch': return '🔥'
      case 'scikit_learn': return '🔬'
      case 'xgboost': return '⚡'
      case 'lightgbm': return '💡'
      case 'catboost': return '🐱'
      case 'hugging_face': return '🤗'
      case 'spark_ml': return '⚡'
      default: return '🔧'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">ML Models</h2>
          <p className="text-sm text-zinc-400">Manage machine learning model configurations</p>
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
            Create Model
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
            placeholder="Search models..."
            className="flex-1 h-8 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
          />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
          >
            <option value="created_at">Created Date</option>
            <option value="name">Name</option>
            <option value="model_type">Type</option>
            <option value="status">Status</option>
            <option value="framework">Framework</option>
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
              <select
                value={filterByType}
                onChange={(e) => onFilterByTypeChange(e.target.value as MLModelType | 'all')}
                className="w-full h-8 px-2 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
              >
                <option value="all">All Types</option>
                {Object.values(MLModelType).map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Status</label>
              <select
                value={filterByStatus}
                onChange={(e) => onFilterByStatusChange(e.target.value as MLModelStatus | 'all')}
                className="w-full h-8 px-2 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
              >
                <option value="all">All Status</option>
                {Object.values(MLModelStatus).map(status => (
                  <option key={status} value={status}>{status.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Framework</label>
              <select
                value={filterByFramework}
                onChange={(e) => onFilterByFrameworkChange(e.target.value as MLModelFramework | 'all')}
                className="w-full h-8 px-2 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
              >
                <option value="all">All Frameworks</option>
                {Object.values(MLModelFramework).map(framework => (
                  <option key={framework} value={framework}>{framework.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded border border-red-500/50 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className={`p-4 rounded border cursor-pointer transition-all ${
              selectedModel?.id === model.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50'
            }`}
            onClick={() => onSelectModel(model)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeIcon(model.model_type)}</span>
                <div>
                  <h3 className="font-medium text-zinc-200">{model.name}</h3>
                  <p className="text-xs text-zinc-400">{model.model_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm">{getFrameworkIcon(model.framework)}</span>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(model.status)}`}>
                  {model.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Framework:</span>
                <span className="text-zinc-200">{model.framework}</span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-zinc-200">{model.version}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-zinc-200">
                  {new Date(model.created_at).toLocaleDateString()}
                </span>
              </div>
              {model.description && (
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-zinc-300 line-clamp-2">{model.description}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-zinc-800">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowEditModal(true)
                }}
                className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteModel(model)
                }}
                className="h-6 px-2 text-xs rounded border border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {models.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No ML Models Found</h3>
          <p className="text-zinc-400 mb-4">Create your first machine learning model to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-8 px-4 text-sm rounded border border-blue-600 bg-blue-600/20 text-blue-300"
          >
            Create Model
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading models...</p>
        </div>
      )}

      {/* Create Model Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Create ML Model
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                  <input
                    id="model-name"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter model name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Version</label>
                  <input
                    id="model-version"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="1.0.0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  id="model-description"
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
                  placeholder="Enter model description"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Type</label>
                  <select
                    id="model-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    {Object.values(MLModelType).map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Framework</label>
                  <select
                    id="model-framework"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    {Object.values(MLModelFramework).map(framework => (
                      <option key={framework} value={framework}>{framework.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                  <select
                    id="model-status"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    {Object.values(MLModelStatus).map(status => (
                      <option key={status} value={status}>{status.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
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
                  const name = (document.getElementById('model-name') as HTMLInputElement)?.value
                  const version = (document.getElementById('model-version') as HTMLInputElement)?.value
                  const description = (document.getElementById('model-description') as HTMLTextAreaElement)?.value
                  const model_type = (document.getElementById('model-type') as HTMLSelectElement)?.value
                  const framework = (document.getElementById('model-framework') as HTMLSelectElement)?.value
                  const status = (document.getElementById('model-status') as HTMLSelectElement)?.value
                  
                  if (name && version && model_type && framework && status) {
                    handleCreateModel({
                      name,
                      version,
                      description,
                      model_type: model_type as MLModelType,
                      framework: framework as MLModelFramework,
                      status: status as MLModelStatus,
                      is_active: true,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    })
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && modelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Delete Model
            </div>
            <div className="p-4">
              <p className="text-sm text-zinc-300 mb-4">
                Are you sure you want to delete the model "{modelToDelete.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteModel}
                className="h-8 px-3 text-xs rounded border border-red-500 bg-red-500/20 text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
