/**
 * Advanced ML Training Jobs Manager Component
 * Comprehensive management interface for ML training jobs
 */

import React, { useCallback, useState } from 'react'
import { MLTrainingJob, MLModelStatus } from '../../types/classification'

interface MLTrainingJobsManagerProps {
  trainingJobs: MLTrainingJob[]
  selectedTrainingJob: MLTrainingJob | null
  onSelectTrainingJob: (job: MLTrainingJob | null) => void
  onCreateTrainingJob: (jobData: Partial<MLTrainingJob>) => Promise<void>
  onStartTraining: (jobId: number) => Promise<void>
  onStopTraining: (jobId: number) => Promise<void>
  isLoading: boolean
  error: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sortBy: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (order: 'asc' | 'desc') => void
  filterByStatus: MLModelStatus | 'all'
  onFilterByStatusChange: (status: MLModelStatus | 'all') => void
  trainingState: {
    isTraining: boolean
    currentJob: MLTrainingJob | null
    progress: number
    logs: string[]
    error: string | null
  }
}

export default function MLTrainingJobsManager({
  trainingJobs,
  selectedTrainingJob,
  onSelectTrainingJob,
  onCreateTrainingJob,
  onStartTraining,
  onStopTraining,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  filterByStatus,
  onFilterByStatusChange,
  trainingState
}: MLTrainingJobsManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleStartTraining = useCallback(async (jobId: number) => {
    try {
      await onStartTraining(jobId)
    } catch (err) {
      console.error('Failed to start training:', err)
    }
  }, [onStartTraining])

  const handleStopTraining = useCallback(async (jobId: number) => {
    try {
      await onStopTraining(jobId)
    } catch (err) {
      console.error('Failed to stop training:', err)
    }
  }, [onStopTraining])

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

  const getStatusIcon = (status: MLModelStatus) => {
    switch (status) {
      case 'active': return '✅'
      case 'training': return '🔄'
      case 'deployed': return '🚀'
      case 'failed': return '❌'
      case 'paused': return '⏸️'
      default: return '❓'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours}h ${minutes}m ${secs}s`
  }

  const formatProgress = (progress: number) => {
    return `${Math.round(progress)}%`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">Training Jobs</h2>
          <p className="text-sm text-zinc-400">Manage machine learning training jobs</p>
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
            Create Job
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
            placeholder="Search training jobs..."
            className="flex-1 h-8 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
          />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
          >
            <option value="created_at">Created Date</option>
            <option value="job_name">Name</option>
            <option value="status">Status</option>
            <option value="progress_percentage">Progress</option>
            <option value="duration_seconds">Duration</option>
          </select>
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded border border-zinc-800 bg-zinc-900/50">
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">Progress Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="flex-1"
                />
                <span className="text-xs text-zinc-400">0-100%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Training Status */}
      {trainingState.isTraining && trainingState.currentJob && (
        <div className="p-4 rounded border border-blue-500/50 bg-blue-500/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔄</span>
              <span className="font-medium text-blue-300">Training in Progress</span>
            </div>
            <span className="text-sm text-blue-300">{formatProgress(trainingState.progress)}</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${trainingState.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-blue-200">
            Job: {trainingState.currentJob.job_name}
          </div>
        </div>
      )}

      {/* Error Display */}
      {(error || trainingState.error) && (
        <div className="p-3 rounded border border-red-500/50 bg-red-500/10 text-red-300 text-sm">
          {error || trainingState.error}
        </div>
      )}

      {/* Training Jobs List */}
      <div className="space-y-2">
        {trainingJobs.map((job) => (
          <div
            key={job.id}
            className={`p-4 rounded border cursor-pointer transition-all ${
              selectedTrainingJob?.id === job.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50'
            }`}
            onClick={() => onSelectTrainingJob(job)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(job.status)}</span>
                <div>
                  <h3 className="font-medium text-zinc-200">{job.job_name}</h3>
                  <p className="text-xs text-zinc-400">Job #{job.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
                {job.status === 'training' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStopTraining(job.id)
                    }}
                    className="h-6 px-2 text-xs rounded border border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  >
                    Stop
                  </button>
                )}
                {job.status === 'paused' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartTraining(job.id)
                    }}
                    className="h-6 px-2 text-xs rounded border border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20"
                  >
                    Start
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-400">
              <div>
                <div className="text-zinc-500">Progress</div>
                <div className="text-zinc-200">{formatProgress(job.progress_percentage)}</div>
              </div>
              <div>
                <div className="text-zinc-500">Duration</div>
                <div className="text-zinc-200">{formatDuration(job.duration_seconds)}</div>
              </div>
              <div>
                <div className="text-zinc-500">Epochs</div>
                <div className="text-zinc-200">
                  {job.current_epoch && job.total_epochs 
                    ? `${job.current_epoch}/${job.total_epochs}`
                    : 'N/A'
                  }
                </div>
              </div>
              <div>
                <div className="text-zinc-500">Created</div>
                <div className="text-zinc-200">
                  {job.started_at 
                    ? new Date(job.started_at).toLocaleDateString()
                    : 'Not started'
                  }
                </div>
              </div>
            </div>

            {job.status === 'training' && (
              <div className="mt-3">
                <div className="w-full bg-zinc-700 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {job.description && (
              <div className="mt-3 pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-300 line-clamp-2">{job.description}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-zinc-800">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLogsModal(true)
                }}
                className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                View Logs
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // View details action
                }}
                className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {trainingJobs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No Training Jobs Found</h3>
          <p className="text-zinc-400 mb-4">Create your first training job to start training ML models.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-8 px-4 text-sm rounded border border-blue-600 bg-blue-600/20 text-blue-300"
          >
            Create Training Job
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading training jobs...</p>
        </div>
      )}

      {/* Create Training Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Create Training Job
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Job Name</label>
                  <input
                    id="job-name"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter job name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Model Config ID</label>
                  <input
                    id="model-config-id"
                    type="number"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter model config ID"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  id="job-description"
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
                  placeholder="Enter job description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Training Dataset ID</label>
                  <input
                    id="dataset-id"
                    type="number"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter dataset ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                  <select
                    id="job-status"
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
                  const job_name = (document.getElementById('job-name') as HTMLInputElement)?.value
                  const model_config_id = (document.getElementById('model-config-id') as HTMLInputElement)?.value
                  const description = (document.getElementById('job-description') as HTMLTextAreaElement)?.value
                  const training_dataset_id = (document.getElementById('dataset-id') as HTMLInputElement)?.value
                  const status = (document.getElementById('job-status') as HTMLSelectElement)?.value
                  
                  if (job_name && model_config_id && training_dataset_id && status) {
                    handleCreateTrainingJob({
                      job_name,
                      model_config_id: parseInt(model_config_id),
                      training_dataset_id: parseInt(training_dataset_id),
                      description,
                      status: status as MLModelStatus,
                      progress_percentage: 0,
                      job_config: {},
                      training_parameters: {},
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

      {/* Training Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-4xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Training Logs
            </div>
            <div className="p-4">
              <div className="h-96 overflow-y-auto bg-zinc-950 rounded border border-zinc-800 p-3 font-mono text-xs">
                {trainingState.logs.length > 0 ? (
                  trainingState.logs.map((log, index) => (
                    <div key={index} className="text-zinc-300 mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-500">No logs available</div>
                )}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end">
              <button
                onClick={() => setShowLogsModal(false)}
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
