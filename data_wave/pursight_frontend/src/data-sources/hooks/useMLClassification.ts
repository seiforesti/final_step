/**
 * Advanced ML Classification Hook
 * Comprehensive state management for ML classification operations
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MLModelConfiguration,
  MLTrainingJob,
  MLPrediction,
  MLModelType,
  MLTaskType,
  MLModelStatus,
  MLModelFramework
} from '../types/classification'
import {
  useMLModelsQuery,
  useMLModelQuery,
  useMLTrainingJobsQuery,
  useMLTrainingJobQuery,
  useMLPredictionsQuery,
  useMLModelPerformanceQuery,
  useCreateMLModelMutation,
  useCreateMLTrainingJobMutation,
  useStartMLTrainingJobMutation,
  useCreateMLPredictionMutation,
  getMLTrainingJobLogs,
  getMLModelMetrics,
  stopMLTrainingJob
} from '../services/classification-apis'

interface UseMLClassificationOptions {
  modelId?: number
  dataSourceId?: number
  modelType?: MLModelType
  taskType?: MLTaskType
  status?: MLModelStatus
  framework?: MLModelFramework
  timeRange?: string
  limit?: number
  offset?: number
}

interface MLTrainingState {
  isTraining: boolean
  currentJob: MLTrainingJob | null
  progress: number
  logs: string[]
  error: string | null
}

interface MLPredictionState {
  isPredicting: boolean
  currentPrediction: MLPrediction | null
  results: any[]
  confidence: number
  error: string | null
}

interface MLExperimentState {
  isRunning: boolean
  experimentId: string | null
  parameters: Record<string, any>
  metrics: Record<string, number>
  status: 'pending' | 'running' | 'completed' | 'failed'
}

interface MLFeatureStoreState {
  features: any[]
  selectedFeatures: string[]
  featureImportance: Record<string, number>
  featureCorrelations: Record<string, Record<string, number>>
}

interface MLModelMonitoringState {
  performance: any
  drift: any
  alerts: any[]
  healthScore: number
  lastUpdated: string | null
}

export function useMLClassification(options: UseMLClassificationOptions = {}) {
  const {
    modelId,
    dataSourceId,
    modelType,
    taskType,
    status,
    framework,
    timeRange = '24h',
    limit = 50,
    offset = 0
  } = options

  // Core state
  const [selectedModel, setSelectedModel] = useState<MLModelConfiguration | null>(null)
  const [selectedTrainingJob, setSelectedTrainingJob] = useState<MLTrainingJob | null>(null)
  const [selectedPrediction, setSelectedPrediction] = useState<MLPrediction | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterByStatus, setFilterByStatus] = useState<MLModelStatus | 'all'>('all')
  const [filterByType, setFilterByType] = useState<MLModelType | 'all'>('all')
  const [filterByFramework, setFilterByFramework] = useState<MLModelFramework | 'all'>('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Training state
  const [trainingState, setTrainingState] = useState<MLTrainingState>({
    isTraining: false,
    currentJob: null,
    progress: 0,
    logs: [],
    error: null
  })

  // Prediction state
  const [predictionState, setPredictionState] = useState<MLPredictionState>({
    isPredicting: false,
    currentPrediction: null,
    results: [],
    confidence: 0,
    error: null
  })

  // Experiment state
  const [experimentState, setExperimentState] = useState<MLExperimentState>({
    isRunning: false,
    experimentId: null,
    parameters: {},
    metrics: {},
    status: 'pending'
  })

  // Feature store state
  const [featureStoreState, setFeatureStoreState] = useState<MLFeatureStoreState>({
    features: [],
    selectedFeatures: [],
    featureImportance: {},
    featureCorrelations: {}
  })

  // Model monitoring state
  const [monitoringState, setMonitoringState] = useState<MLModelMonitoringState>({
    performance: null,
    drift: null,
    alerts: [],
    healthScore: 0,
    lastUpdated: null
  })

  // API queries
  const modelsQuery = useMLModelsQuery({
    model_type: filterByType !== 'all' ? filterByType : undefined,
    status: filterByStatus !== 'all' ? filterByStatus : undefined,
    framework: filterByFramework !== 'all' ? filterByFramework : undefined,
    limit,
    offset
  })

  const modelQuery = useMLModelQuery(modelId!, { enabled: !!modelId })
  const trainingJobsQuery = useMLTrainingJobsQuery({
    model_config_id: modelId,
    status: filterByStatus !== 'all' ? filterByStatus : undefined,
    limit,
    offset
  })
  const trainingJobQuery = useMLTrainingJobQuery(selectedTrainingJob?.id!, { enabled: !!selectedTrainingJob?.id })
  const predictionsQuery = useMLPredictionsQuery({
    model_config_id: modelId,
    limit,
    offset
  })
  const performanceQuery = useMLModelPerformanceQuery(modelId!, { enabled: !!modelId })

  // Mutations
  const createModelMutation = useCreateMLModelMutation()
  const createTrainingJobMutation = useCreateMLTrainingJobMutation()
  const startTrainingJobMutation = useStartMLTrainingJobMutation()
  // Note: stopMLTrainingJob is a direct API call, not a mutation
  const createPredictionMutation = useCreateMLPredictionMutation()

  // Computed values
  const models = useMemo(() => modelsQuery.data?.models || [], [modelsQuery.data])
  const trainingJobs = useMemo(() => trainingJobsQuery.data?.jobs || [], [trainingJobsQuery.data])
  const predictions = useMemo(() => predictionsQuery.data?.predictions || [], [predictionsQuery.data])
  const performance = useMemo(() => performanceQuery.data, [performanceQuery.data])

  const filteredModels = useMemo(() => {
    let filtered = models

    if (searchQuery) {
      filtered = filtered.filter((model: MLModelConfiguration) =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a: MLModelConfiguration, b: MLModelConfiguration) => {
      const aValue = a[sortBy as keyof MLModelConfiguration]
      const bValue = b[sortBy as keyof MLModelConfiguration]
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [models, searchQuery, sortBy, sortOrder])

  const filteredTrainingJobs = useMemo(() => {
    let filtered = trainingJobs

    if (searchQuery) {
      filtered = filtered.filter((job: MLTrainingJob) =>
        job.job_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a: MLTrainingJob, b: MLTrainingJob) => {
      const aValue = a[sortBy as keyof MLTrainingJob]
      const bValue = b[sortBy as keyof MLTrainingJob]
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [trainingJobs, searchQuery, sortBy, sortOrder])

  const filteredPredictions = useMemo(() => {
    let filtered = predictions

    if (searchQuery) {
      filtered = filtered.filter((prediction: MLPrediction) =>
        prediction.target_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prediction.target_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a: MLPrediction, b: MLPrediction) => {
      const aValue = a[sortBy as keyof MLPrediction]
      const bValue = b[sortBy as keyof MLPrediction]
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [predictions, searchQuery, sortBy, sortOrder])

  // Actions
  const createModel = useCallback(async (modelData: Partial<MLModelConfiguration>) => {
    setIsLoading(true)
    try {
      const result = await createModelMutation.mutateAsync(modelData)
      setSelectedModel(result)
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to create model')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [createModelMutation])

  // Note: Update and delete model mutations not available in current API
  const updateModel = useCallback(async (id: number, modelData: Partial<MLModelConfiguration>) => {
    setError('Update model functionality not available')
    throw new Error('Update model functionality not available')
  }, [])

  const deleteModel = useCallback(async (id: number) => {
    setError('Delete model functionality not available')
    throw new Error('Delete model functionality not available')
  }, [])

  const createTrainingJob = useCallback(async (jobData: Partial<MLTrainingJob>) => {
    setIsLoading(true)
    try {
      const result = await createTrainingJobMutation.mutateAsync(jobData)
      setSelectedTrainingJob(result)
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to create training job')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [createTrainingJobMutation])

  const startTraining = useCallback(async (jobId: number) => {
    setIsLoading(true)
    setTrainingState(prev => ({ ...prev, isTraining: true, error: null }))
    try {
      const result = await startTrainingJobMutation.mutateAsync(jobId)
      setSelectedTrainingJob(result)
      setTrainingState(prev => ({ ...prev, currentJob: result }))
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to start training')
      setTrainingState(prev => ({ ...prev, error: err.message, isTraining: false }))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [startTrainingJobMutation])

  const stopTraining = useCallback(async (jobId: number) => {
    setIsLoading(true)
    try {
      const result = await stopMLTrainingJob(jobId)
      setSelectedTrainingJob(result)
      setTrainingState(prev => ({ ...prev, isTraining: false, currentJob: result }))
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to stop training')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createPrediction = useCallback(async (predictionData: {
    model_config_id: number
    target_type: string
    target_id: string
    target_identifier: string
    input_data: any
  }) => {
    setIsLoading(true)
    setPredictionState(prev => ({ ...prev, isPredicting: true, error: null }))
    try {
      const result = await createPredictionMutation.mutateAsync(predictionData)
      setSelectedPrediction(result)
      setPredictionState(prev => ({ 
        ...prev, 
        currentPrediction: result,
        results: [...prev.results, result],
        confidence: result.confidence_score || 0
      }))
      return result
    } catch (err: any) {
      setError(err.message || 'Failed to create prediction')
      setPredictionState(prev => ({ ...prev, error: err.message, isPredicting: false }))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [createPredictionMutation])

  const loadTrainingLogs = useCallback(async (jobId: number) => {
    try {
      const logs = await getMLTrainingJobLogs(jobId)
      setTrainingState(prev => ({ ...prev, logs }))
      return logs
    } catch (err: any) {
      setError(err.message || 'Failed to load training logs')
      throw err
    }
  }, [])

  const loadModelMetrics = useCallback(async (modelId: number, timeRange?: string) => {
    try {
      const metrics = await getMLModelMetrics(modelId, timeRange)
      setMonitoringState(prev => ({ ...prev, performance: metrics, lastUpdated: new Date().toISOString() }))
      return metrics
    } catch (err: any) {
      setError(err.message || 'Failed to load model metrics')
      throw err
    }
  }, [])

  const runExperiment = useCallback(async (experimentData: {
    name: string
    description: string
    parameters: Record<string, any>
    model_config_id: number
  }) => {
    setIsLoading(true)
    setExperimentState(prev => ({ 
      ...prev, 
      isRunning: true, 
      status: 'running',
      parameters: experimentData.parameters,
      experimentId: `exp_${Date.now()}`
    }))
    try {
      // Simulate experiment running
      await new Promise(resolve => setTimeout(resolve, 2000))
      setExperimentState(prev => ({ 
        ...prev, 
        isRunning: false, 
        status: 'completed',
        metrics: {
          accuracy: Math.random() * 0.3 + 0.7,
          precision: Math.random() * 0.3 + 0.7,
          recall: Math.random() * 0.3 + 0.7,
          f1_score: Math.random() * 0.3 + 0.7
        }
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to run experiment')
      setExperimentState(prev => ({ ...prev, isRunning: false, status: 'failed' }))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadFeatureStore = useCallback(async () => {
    try {
      // Simulate feature store loading
      const mockFeatures = Array.from({ length: 20 }, (_, i) => ({
        id: `feature_${i}`,
        name: `Feature ${i + 1}`,
        type: ['numerical', 'categorical', 'text', 'datetime'][i % 4],
        importance: Math.random(),
        correlation: Math.random() * 2 - 1
      }))
      
      setFeatureStoreState(prev => ({ 
        ...prev, 
        features: mockFeatures,
        featureImportance: mockFeatures.reduce((acc, feature) => ({
          ...acc,
          [feature.name]: feature.importance
        }), {}),
        featureCorrelations: mockFeatures.reduce((acc, feature) => ({
          ...acc,
          [feature.name]: mockFeatures.reduce((innerAcc, otherFeature) => ({
            ...innerAcc,
            [otherFeature.name]: Math.random() * 2 - 1
          }), {})
        }), {})
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to load feature store')
      throw err
    }
  }, [])

  const loadModelMonitoring = useCallback(async (modelId: number) => {
    try {
      // Simulate model monitoring data
      const mockPerformance = {
        accuracy: Math.random() * 0.3 + 0.7,
        precision: Math.random() * 0.3 + 0.7,
        recall: Math.random() * 0.3 + 0.7,
        f1_score: Math.random() * 0.3 + 0.7,
        drift_score: Math.random() * 0.5,
        latency: Math.random() * 100 + 50
      }

      const mockAlerts = Array.from({ length: 5 }, (_, i) => ({
        id: `alert_${i}`,
        type: ['drift', 'performance', 'error', 'latency'][i % 4],
        severity: ['low', 'medium', 'high', 'critical'][i % 4],
        message: `Alert ${i + 1}: Model performance degraded`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
      }))

      setMonitoringState(prev => ({
        ...prev,
        performance: mockPerformance,
        drift: { score: mockPerformance.drift_score, threshold: 0.3 },
        alerts: mockAlerts,
        healthScore: Math.random() * 40 + 60,
        lastUpdated: new Date().toISOString()
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to load model monitoring')
      throw err
    }
  }, [])

  // Effects
  useEffect(() => {
    if (modelId) {
      loadModelMetrics(modelId, timeRange)
      loadModelMonitoring(modelId)
    }
  }, [modelId, timeRange, loadModelMetrics, loadModelMonitoring])

  useEffect(() => {
    loadFeatureStore()
  }, [loadFeatureStore])

  useEffect(() => {
    if (selectedTrainingJob?.id) {
      loadTrainingLogs(selectedTrainingJob.id)
    }
  }, [selectedTrainingJob?.id, loadTrainingLogs])

  return {
    // Data
    models: filteredModels,
    model: modelQuery.data,
    trainingJobs: filteredTrainingJobs,
    trainingJob: trainingJobQuery.data,
    predictions: filteredPredictions,
    prediction: selectedPrediction,
    performance,
    
    // State
    selectedModel,
    selectedTrainingJob,
    selectedPrediction,
    trainingState,
    predictionState,
    experimentState,
    featureStoreState,
    monitoringState,
    
    // Filters and search
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterByStatus,
    setFilterByStatus,
    filterByType,
    setFilterByType,
    filterByFramework,
    setFilterByFramework,
    showAdvancedFilters,
    setShowAdvancedFilters,
    
    // Loading and error states
    isLoading,
    error,
    setError,
    
    // Actions
    createModel,
    updateModel,
    deleteModel,
    createTrainingJob,
    startTraining,
    stopTraining,
    createPrediction,
    loadTrainingLogs,
    loadModelMetrics,
    runExperiment,
    loadFeatureStore,
    loadModelMonitoring,
    
    // Setters
    setSelectedModel,
    setSelectedTrainingJob,
    setSelectedPrediction,
    
    // Query states
    isModelsLoading: modelsQuery.isLoading,
    isModelLoading: modelQuery.isLoading,
    isTrainingJobsLoading: trainingJobsQuery.isLoading,
    isTrainingJobLoading: trainingJobQuery.isLoading,
    isPredictionsLoading: predictionsQuery.isLoading,
    isPerformanceLoading: performanceQuery.isLoading,
    
    // Mutation states
    isCreatingModel: createModelMutation.isPending,
    isCreatingTrainingJob: createTrainingJobMutation.isPending,
    isStartingTraining: startTrainingJobMutation.isPending,
    isCreatingPrediction: createPredictionMutation.isPending
  }
}

export default useMLClassification
