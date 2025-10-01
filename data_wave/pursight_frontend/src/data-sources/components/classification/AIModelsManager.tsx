/**
 * Advanced AI Models Manager Component
 * Comprehensive AI model configuration and management interface
 */

import React, { useState, useMemo } from 'react'
import { AIModelConfiguration, AIModelType, AITaskType, AIProviderType, AIModelStatus, ExplainabilityLevel } from '../../types/classification'

interface AIModelsManagerProps {
  models: AIModelConfiguration[]
  selectedModel: AIModelConfiguration | null
  onSelectModel: (model: AIModelConfiguration | null) => void
  onCreateModel: (model: Partial<AIModelConfiguration>) => Promise<void>
  onUpdateModel: (id: number, model: Partial<AIModelConfiguration>) => Promise<void>
  onDeleteModel: (id: number) => Promise<void>
  isLoading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function AIModelsManager({
  models,
  selectedModel,
  onSelectModel,
  onCreateModel,
  onUpdateModel,
  onDeleteModel,
  isLoading,
  error,
  searchQuery,
  onSearchChange
}: AIModelsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingModel, setEditingModel] = useState<AIModelConfiguration | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'status'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filtered and sorted models
  const filteredModels = useMemo(() => {
    let filtered = models.filter(model =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.model_type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = a.id // Use ID as proxy for creation order
          bValue = b.id
          break
        case 'status':
          aValue = a.status
          bValue = b.status
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
  }, [models, searchQuery, sortBy, sortOrder])

  const handleCreateModel = async (modelData: Partial<AIModelConfiguration>) => {
    try {
      await onCreateModel(modelData)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create AI model:', error)
    }
  }

  const handleEditModel = async (modelData: Partial<AIModelConfiguration>) => {
    if (!editingModel) return
    
    try {
      await onUpdateModel(editingModel.id, modelData)
      setShowEditModal(false)
      setEditingModel(null)
    } catch (error) {
      console.error('Failed to update AI model:', error)
    }
  }

  const handleDeleteModel = async (model: AIModelConfiguration) => {
    if (window.confirm(`Are you sure you want to delete "${model.name}"?`)) {
      try {
        await onDeleteModel(model.id)
      } catch (error) {
        console.error('Failed to delete AI model:', error)
      }
    }
  }

  const getStatusColor = (status: AIModelStatus) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'inactive': return 'text-gray-400'
      case 'fine_tuning': return 'text-blue-400'
      case 'testing': return 'text-blue-400'
      case 'validating': return 'text-blue-400'
      case 'deploying': return 'text-blue-400'
      case 'updating': return 'text-blue-400'
      case 'deprecated': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getProviderIcon = (provider: AIProviderType) => {
    switch (provider) {
      case 'openai': return '🤖'
      case 'anthropic': return '🧠'
      case 'google': return '🔍'
      case 'microsoft': return '☁️'
      case 'azure_openai': return '☁️'
      case 'aws': return '⚡'
      case 'huggingface': return '🤗'
      case 'custom': return '⚙️'
      case 'on_premise': return '🏠'
      case 'hybrid': return '🔄'
      default: return '🤖'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-200">AI Models</h2>
          <p className="text-sm text-zinc-400">Manage AI model configurations and deployments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-9 px-4 text-sm rounded border border-blue-600 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30"
        >
          Create AI Model
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search AI models..."
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
          <option value="name">Sort by Name</option>
          <option value="created_at">Sort by Date</option>
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

      {/* Models Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-400">Loading AI models...</div>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No AI Models Found</h3>
          <p className="text-zinc-400 mb-4">Create your first AI model to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 text-sm rounded border border-blue-600 bg-blue-600/20 text-blue-300"
          >
            Create AI Model
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
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
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getProviderIcon(model.provider)}</span>
                  <div>
                    <h3 className="font-medium text-zinc-200">{model.name}</h3>
                    <p className="text-xs text-zinc-500">{model.model_type}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(model.status)}`}>
                  {model.status}
                </span>
              </div>
              
              <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                {model.description || 'No description available'}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Provider:</span>
                  <span className="text-zinc-300">{model.provider}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Task Type:</span>
                  <span className="text-zinc-300">{model.task_type}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Model ID:</span>
                  <span className="text-zinc-300">{model.id}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingModel(model)
                    setShowEditModal(true)
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteModel(model)
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Model Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Create AI Model
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Model Name</label>
                  <input
                    id="ai-model-name"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter model name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Model Type</label>
                  <select
                    id="ai-model-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="llm">Large Language Model</option>
                    <option value="embedding">Embedding Model</option>
                    <option value="classification">Classification Model</option>
                    <option value="generation">Generation Model</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Provider</label>
                  <select
                    id="ai-provider"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                    <option value="azure">Azure</option>
                    <option value="aws">AWS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Task Type</label>
                  <select
                    id="ai-task-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="classification">Classification</option>
                    <option value="generation">Generation</option>
                    <option value="analysis">Analysis</option>
                    <option value="extraction">Extraction</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  id="ai-model-description"
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  placeholder="Enter model description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">API Key</label>
                  <input
                    id="ai-api-key"
                    type="password"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Model Version</label>
                  <input
                    id="ai-model-version"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="e.g., gpt-4, claude-3"
                  />
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
                  const formData = {
                    name: (document.getElementById('ai-model-name') as HTMLInputElement)?.value,
                    model_type: (document.getElementById('ai-model-type') as HTMLSelectElement)?.value as AIModelType,
                    provider: (document.getElementById('ai-provider') as HTMLSelectElement)?.value as AIProviderType,
                    task_type: (document.getElementById('ai-task-type') as HTMLSelectElement)?.value as AITaskType,
                    description: (document.getElementById('ai-model-description') as HTMLTextAreaElement)?.value,
                    api_key: (document.getElementById('ai-api-key') as HTMLInputElement)?.value,
                    model_version: (document.getElementById('ai-model-version') as HTMLInputElement)?.value,
                    status: 'inactive' as AIModelStatus,
                    explainability_level: 'intermediate' as ExplainabilityLevel
                  }
                  handleCreateModel(formData)
                }}
                className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
              >
                Create Model
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {showEditModal && editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Edit AI Model
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Model Name</label>
                  <input
                    id="edit-ai-model-name"
                    defaultValue={editingModel.name}
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                  <select
                    id="edit-ai-model-status"
                    defaultValue={editingModel.status}
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="training">Training</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  id="edit-ai-model-description"
                  defaultValue={editingModel.description || ''}
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingModel(null)
                }}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const formData = {
                    name: (document.getElementById('edit-ai-model-name') as HTMLInputElement)?.value,
                    status: (document.getElementById('edit-ai-model-status') as HTMLSelectElement)?.value as AIModelStatus,
                    description: (document.getElementById('edit-ai-model-description') as HTMLTextAreaElement)?.value
                  }
                  handleEditModel(formData)
                }}
                className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
              >
                Update Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
