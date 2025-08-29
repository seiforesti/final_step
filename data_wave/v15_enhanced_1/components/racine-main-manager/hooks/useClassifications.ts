'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import classifications APIs
import { racineClassificationsAPI } from '../services/classifications-apis'
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis'

// Import types
import {
  Classification,
  ClassificationFramework,
  ClassificationRule,
  ClassificationResult,
  ClassificationMetrics,
  ClassificationStatus,
  ClassificationScope,
  ClassificationCreateRequest,
  ClassificationUpdateRequest,
  ClassificationFilters,
  ClassificationStats,
  OperationStatus
} from '../types/racine-core.types'

interface UseClassificationsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
}

interface ClassificationOperations {
  // Core CRUD operations
  createClassification: (request: ClassificationCreateRequest) => Promise<Classification>
  updateClassification: (id: string, updates: ClassificationUpdateRequest) => Promise<Classification>
  deleteClassification: (id: string) => Promise<void>
  
  // Framework operations
  createFramework: (framework: Partial<ClassificationFramework>) => Promise<ClassificationFramework>
  updateFramework: (id: string, updates: Partial<ClassificationFramework>) => Promise<ClassificationFramework>
  deleteFramework: (id: string) => Promise<void>
  activateFramework: (id: string) => Promise<ClassificationFramework>
  deactivateFramework: (id: string) => Promise<ClassificationFramework>
  
  // Rule operations
  createRule: (frameworkId: string, rule: Partial<ClassificationRule>) => Promise<ClassificationRule>
  updateRule: (frameworkId: string, ruleId: string, updates: Partial<ClassificationRule>) => Promise<ClassificationRule>
  deleteRule: (frameworkId: string, ruleId: string) => Promise<void>
  validateRule: (rule: Partial<ClassificationRule>) => Promise<any>
  testRule: (rule: Partial<ClassificationRule>, testData: any) => Promise<any>
  
  // Execution operations
  executeClassification: (data: any, frameworkId?: string) => Promise<ClassificationResult[]>
  getClassificationResults: (filters?: any) => Promise<ClassificationResult[]>
  
  // AI/ML operations
  getAIClassificationSuggestions: (data: any) => Promise<any[]>
  trainAIModel: (trainingData: any) => Promise<any>
  applyAIClassification: (data: any, modelId?: string) => Promise<ClassificationResult[]>
  trainMLModel: (config: any) => Promise<any>
  applyMLClassification: (data: any, modelId: string) => Promise<ClassificationResult[]>
  
  // Bulk operations
  bulkClassifyData: (data: any[], frameworkId?: string) => Promise<ClassificationResult[]>
  bulkUpdateClassifications: (updates: Array<{ id: string; updates: ClassificationUpdateRequest }>) => Promise<Classification[]>
  bulkDeleteClassifications: (ids: string[]) => Promise<void>
  
  // Cross-SPA integration
  linkToDataSources: (classificationId: string, dataSourceIds: string[]) => Promise<void>
  linkToScanRuleSets: (classificationId: string, ruleSetIds: string[]) => Promise<void>
  linkToComplianceRules: (classificationId: string, complianceRuleIds: string[]) => Promise<void>
  getCrossSPADependencies: (classificationId: string) => Promise<any>
  getCrossSPAUsage: (classificationId: string) => Promise<any>
}

export function useClassifications(options: UseClassificationsOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000, enableRealTimeUpdates = true } = options
  const queryClient = useQueryClient()
  
  // Local state for real-time updates
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([])
  const [operationStatus, setOperationStatus] = useState<OperationStatus>('idle')

  // ============================================================================
  // CORE QUERIES
  // ============================================================================

  // Get all classifications
  const { 
    data: classifications, 
    isLoading: isLoadingClassifications, 
    error: classificationsError,
    refetch: refetchClassifications
  } = useQuery({
    queryKey: ['racine-classifications'],
    queryFn: () => racineClassificationsAPI.getAllClassifications(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get classification statistics
  const { 
    data: classificationStats, 
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['racine-classification-stats'],
    queryFn: () => racineClassificationsAPI.getClassificationStats(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get classification frameworks
  const { 
    data: frameworks, 
    isLoading: isLoadingFrameworks,
    refetch: refetchFrameworks
  } = useQuery({
    queryKey: ['racine-classification-frameworks'],
    queryFn: () => racineClassificationsAPI.getAllFrameworks(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get ML models
  const { 
    data: mlModels, 
    isLoading: isLoadingMLModels 
  } = useQuery({
    queryKey: ['racine-classification-ml-models'],
    queryFn: () => racineClassificationsAPI.getMLModels(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create classification mutation
  const createClassificationMutation = useMutation({
    mutationFn: (request: ClassificationCreateRequest) => racineClassificationsAPI.createClassification(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-classifications'] })
      queryClient.invalidateQueries({ queryKey: ['racine-classification-stats'] })
    },
    onError: (error) => {
      console.error('Error creating classification:', error)
    }
  })

  // Update classification mutation
  const updateClassificationMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ClassificationUpdateRequest }) => 
      racineClassificationsAPI.updateClassification(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-classifications'] })
    },
    onError: (error) => {
      console.error('Error updating classification:', error)
    }
  })

  // Delete classification mutation
  const deleteClassificationMutation = useMutation({
    mutationFn: (id: string) => racineClassificationsAPI.deleteClassification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-classifications'] })
      queryClient.invalidateQueries({ queryKey: ['racine-classification-stats'] })
    },
    onError: (error) => {
      console.error('Error deleting classification:', error)
    }
  })

  // Execute classification mutation
  const executeClassificationMutation = useMutation({
    mutationFn: ({ data, frameworkId }: { data: any; frameworkId?: string }) => 
      racineClassificationsAPI.executeClassification(data, frameworkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-classification-results'] })
    },
    onError: (error) => {
      console.error('Error executing classification:', error)
    }
  })

  // ============================================================================
  // OPERATION HANDLERS
  // ============================================================================

  const createClassification = useCallback(async (request: ClassificationCreateRequest): Promise<Classification> => {
    setOperationStatus('loading')
    try {
      const result = await createClassificationMutation.mutateAsync(request)
      setOperationStatus('success')
      return result
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [createClassificationMutation])

  const updateClassification = useCallback(async (id: string, updates: ClassificationUpdateRequest): Promise<Classification> => {
    setOperationStatus('loading')
    try {
      const result = await updateClassificationMutation.mutateAsync({ id, updates })
      setOperationStatus('success')
      return result
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [updateClassificationMutation])

  const deleteClassification = useCallback(async (id: string): Promise<void> => {
    setOperationStatus('loading')
    try {
      await deleteClassificationMutation.mutateAsync(id)
      setOperationStatus('success')
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [deleteClassificationMutation])

  // Framework operations
  const createFramework = useCallback(async (framework: Partial<ClassificationFramework>): Promise<ClassificationFramework> => {
    const result = await racineClassificationsAPI.createFramework(framework)
    await refetchFrameworks()
    return result
  }, [refetchFrameworks])

  const updateFramework = useCallback(async (id: string, updates: Partial<ClassificationFramework>): Promise<ClassificationFramework> => {
    const result = await racineClassificationsAPI.updateFramework(id, updates)
    await refetchFrameworks()
    return result
  }, [refetchFrameworks])

  const deleteFramework = useCallback(async (id: string): Promise<void> => {
    await racineClassificationsAPI.deleteFramework(id)
    await refetchFrameworks()
  }, [refetchFrameworks])

  const activateFramework = useCallback(async (id: string): Promise<ClassificationFramework> => {
    const result = await racineClassificationsAPI.activateFramework(id)
    await refetchFrameworks()
    return result
  }, [refetchFrameworks])

  const deactivateFramework = useCallback(async (id: string): Promise<ClassificationFramework> => {
    const result = await racineClassificationsAPI.deactivateFramework(id)
    await refetchFrameworks()
    return result
  }, [refetchFrameworks])

  // Rule operations
  const createRule = useCallback(async (frameworkId: string, rule: Partial<ClassificationRule>): Promise<ClassificationRule> => {
    const result = await racineClassificationsAPI.createRule(frameworkId, rule)
    await refetchFrameworks()
    return result
  }, [refetchFrameworks])

  const updateRule = useCallback(async (frameworkId: string, ruleId: string, updates: Partial<ClassificationRule>): Promise<ClassificationRule> => {
    const result = await racineClassificationsAPI.updateRule(frameworkId, ruleId, updates)
    await refetchFrameworks()
    return result
  }, [refetchFrameworks])

  const deleteRule = useCallback(async (frameworkId: string, ruleId: string): Promise<void> => {
    await racineClassificationsAPI.deleteRule(frameworkId, ruleId)
    await refetchFrameworks()
  }, [refetchFrameworks])

  const validateRule = useCallback(async (rule: Partial<ClassificationRule>): Promise<any> => {
    return await racineClassificationsAPI.validateRule(rule)
  }, [])

  const testRule = useCallback(async (rule: Partial<ClassificationRule>, testData: any): Promise<any> => {
    return await racineClassificationsAPI.testRule(rule, testData)
  }, [])

  // Execution operations
  const executeClassification = useCallback(async (data: any, frameworkId?: string): Promise<ClassificationResult[]> => {
    const result = await executeClassificationMutation.mutateAsync({ data, frameworkId })
    return result
  }, [executeClassificationMutation])

  const getClassificationResults = useCallback(async (filters?: any): Promise<ClassificationResult[]> => {
    const response = await racineClassificationsAPI.getClassificationResults(filters)
    return response.data?.items || []
  }, [])

  // AI/ML operations
  const getAIClassificationSuggestions = useCallback(async (data: any): Promise<any[]> => {
    const response = await racineClassificationsAPI.getAIClassificationSuggestions(data)
    return response.data || []
  }, [])

  const trainAIModel = useCallback(async (trainingData: any): Promise<any> => {
    return await racineClassificationsAPI.trainAIModel(trainingData)
  }, [])

  const applyAIClassification = useCallback(async (data: any, modelId?: string): Promise<ClassificationResult[]> => {
    const response = await racineClassificationsAPI.applyAIClassification(data, modelId)
    return response.data || []
  }, [])

  const trainMLModel = useCallback(async (config: any): Promise<any> => {
    const result = await racineClassificationsAPI.trainMLModel(config)
    queryClient.invalidateQueries({ queryKey: ['racine-classification-ml-models'] })
    return result
  }, [queryClient])

  const applyMLClassification = useCallback(async (data: any, modelId: string): Promise<ClassificationResult[]> => {
    const response = await racineClassificationsAPI.applyMLClassification(data, modelId)
    return response.data || []
  }, [])

  // Bulk operations
  const bulkClassifyData = useCallback(async (data: any[], frameworkId?: string): Promise<ClassificationResult[]> => {
    const response = await racineClassificationsAPI.bulkClassifyData(data, frameworkId)
    return response.data || []
  }, [])

  const bulkUpdateClassifications = useCallback(async (updates: Array<{ id: string; updates: ClassificationUpdateRequest }>): Promise<Classification[]> => {
    const response = await racineClassificationsAPI.bulkUpdateClassifications(updates)
    await refetchClassifications()
    return response.data || []
  }, [refetchClassifications])

  const bulkDeleteClassifications = useCallback(async (ids: string[]): Promise<void> => {
    await racineClassificationsAPI.bulkDeleteClassifications(ids)
    await refetchClassifications()
  }, [refetchClassifications])

  // Cross-SPA integration
  const linkToDataSources = useCallback(async (classificationId: string, dataSourceIds: string[]): Promise<void> => {
    try {
      await racineClassificationsAPI.linkToDataSources(classificationId, dataSourceIds)
      await crossGroupIntegrationAPI.syncClassificationWithDataSources(classificationId, dataSourceIds)
    } catch (error) {
      console.error('Error linking to data sources:', error)
      throw error
    }
  }, [])

  const linkToScanRuleSets = useCallback(async (classificationId: string, ruleSetIds: string[]): Promise<void> => {
    try {
      await racineClassificationsAPI.linkToScanRuleSets(classificationId, ruleSetIds)
      await crossGroupIntegrationAPI.syncClassificationWithScanRuleSets(classificationId, ruleSetIds)
    } catch (error) {
      console.error('Error linking to scan rule sets:', error)
      throw error
    }
  }, [])

  const linkToComplianceRules = useCallback(async (classificationId: string, complianceRuleIds: string[]): Promise<void> => {
    try {
      await racineClassificationsAPI.linkToComplianceRules(classificationId, complianceRuleIds)
      await crossGroupIntegrationAPI.syncClassificationWithComplianceRules(classificationId, complianceRuleIds)
    } catch (error) {
      console.error('Error linking to compliance rules:', error)
      throw error
    }
  }, [])

  const getCrossSPADependencies = useCallback(async (classificationId: string): Promise<any> => {
    const response = await racineClassificationsAPI.getCrossSPADependencies(classificationId)
    return response.data
  }, [])

  const getCrossSPAUsage = useCallback(async (classificationId: string): Promise<any> => {
    const response = await racineClassificationsAPI.getCrossSPAUsage(classificationId)
    return response.data
  }, [])

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  useEffect(() => {
    if (enableRealTimeUpdates) {
      // Subscribe to classification updates
      racineClassificationsAPI.subscribeToClassificationUpdates((data) => {
        setRealTimeUpdates(prev => [...prev, { type: 'classification', data, timestamp: Date.now() }])
        queryClient.invalidateQueries({ queryKey: ['racine-classifications'] })
      })

      // Subscribe to framework updates
      racineClassificationsAPI.subscribeToFrameworkUpdates((data) => {
        setRealTimeUpdates(prev => [...prev, { type: 'framework', data, timestamp: Date.now() }])
        queryClient.invalidateQueries({ queryKey: ['racine-classification-frameworks'] })
      })

      // Subscribe to execution updates
      racineClassificationsAPI.subscribeToExecutionUpdates((data) => {
        setRealTimeUpdates(prev => [...prev, { type: 'execution', data, timestamp: Date.now() }])
        queryClient.invalidateQueries({ queryKey: ['racine-classification-results'] })
      })

      // Cleanup subscriptions
      return () => {
        racineClassificationsAPI.unsubscribeFromUpdates('classification_updates')
        racineClassificationsAPI.unsubscribeFromUpdates('framework_updates')
        racineClassificationsAPI.unsubscribeFromUpdates('execution_updates')
      }
    }
  }, [enableRealTimeUpdates, queryClient])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const computedValues = useMemo(() => {
    const classificationData = classifications?.data?.items || []
    const frameworkData = frameworks?.data?.items || []
    const statsData = classificationStats?.data || {}

    return {
      totalClassifications: classificationData.length,
      activeFrameworks: frameworkData.filter(f => f.status === ClassificationStatus.ACTIVE).length,
      totalFrameworks: frameworkData.length,
      classificationAccuracy: statsData.accuracy || 0,
      averageProcessingTime: statsData.averageProcessingTime || 0,
      classificationsToday: statsData.classificationsToday || 0,
      topFrameworks: frameworkData
        .sort((a, b) => (b.usage || 0) - (a.usage || 0))
        .slice(0, 5),
      recentClassifications: classificationData
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 10)
    }
  }, [classifications, frameworks, classificationStats])

  // ============================================================================
  // OPERATIONS OBJECT
  // ============================================================================

  const operations: ClassificationOperations = {
    createClassification,
    updateClassification,
    deleteClassification,
    createFramework,
    updateFramework,
    deleteFramework,
    activateFramework,
    deactivateFramework,
    createRule,
    updateRule,
    deleteRule,
    validateRule,
    testRule,
    executeClassification,
    getClassificationResults,
    getAIClassificationSuggestions,
    trainAIModel,
    applyAIClassification,
    trainMLModel,
    applyMLClassification,
    bulkClassifyData,
    bulkUpdateClassifications,
    bulkDeleteClassifications,
    linkToDataSources,
    linkToScanRuleSets,
    linkToComplianceRules,
    getCrossSPADependencies,
    getCrossSPAUsage
  }

  return {
    // Data
    classifications: classifications?.data?.items || [],
    frameworks: frameworks?.data?.items || [],
    mlModels: mlModels?.data || [],
    classificationStats: classificationStats?.data,
    
    // Loading states
    isLoading: isLoadingClassifications || isLoadingFrameworks || isLoadingStats || isLoadingMLModels,
    isLoadingClassifications,
    isLoadingFrameworks,
    isLoadingStats,
    isLoadingMLModels,
    
    // Error states
    error: classificationsError,
    
    // Operation status
    operationStatus,
    
    // Real-time updates
    realTimeUpdates,
    
    // Computed values
    ...computedValues,
    
    // Operations
    ...operations,
    
    // Utility functions
    refetch: () => {
      refetchClassifications()
      refetchFrameworks()
    },
    
    // Health check
    getServiceHealth: () => racineClassificationsAPI.getServiceHealth(),
    getSystemStatus: () => racineClassificationsAPI.getSystemStatus()
  }
}

export default useClassifications
