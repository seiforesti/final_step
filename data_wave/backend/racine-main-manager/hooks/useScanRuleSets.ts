'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import scan rule set APIs
import { scanRuleSetApis } from '../services/racine-orchestration-apis'
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis'

// Import types
import {
  ScanRuleSet,
  ScanRule,
  RuleCategory,
  RuleComplexity,
  RuleStatus,
  RuleExecution,
  RuleValidation,
  RuleMetrics,
  RuleSchedule,
  RuleHistory,
  RuleOptimization,
  RuleTemplate,
  ScanRuleSetCreateRequest,
  ScanRuleSetUpdateRequest,
  ScanRuleSetFilters,
  ScanRuleSetStats,
  OperationStatus
} from '../types/racine-core.types'

interface UseScanRuleSetsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
}

interface ScanRuleSetOperations {
  // Core CRUD operations
  createRuleSet: (request: ScanRuleSetCreateRequest) => Promise<ScanRuleSet>
  updateRuleSet: (id: string, updates: ScanRuleSetUpdateRequest) => Promise<ScanRuleSet>
  deleteRuleSet: (id: string) => Promise<void>
  duplicateRuleSet: (id: string, newName: string) => Promise<ScanRuleSet>
  
  // Rule management
  addRule: (ruleSetId: string, rule: Partial<ScanRule>) => Promise<ScanRule>
  updateRule: (ruleSetId: string, ruleId: string, updates: Partial<ScanRule>) => Promise<ScanRule>
  deleteRule: (ruleSetId: string, ruleId: string) => Promise<void>
  reorderRules: (ruleSetId: string, ruleIds: string[]) => Promise<void>
  
  // Rule validation and testing
  validateRule: (rule: Partial<ScanRule>) => Promise<RuleValidation>
  testRule: (rule: Partial<ScanRule>, testData: any) => Promise<RuleValidation>
  validateRuleSet: (ruleSet: Partial<ScanRuleSet>) => Promise<RuleValidation>
  
  // Execution operations
  executeRuleSet: (id: string, dataSourceId: string) => Promise<RuleExecution>
  scheduleRuleSet: (id: string, schedule: Partial<RuleSchedule>) => Promise<RuleSchedule>
  cancelExecution: (executionId: string) => Promise<void>
  
  // Analytics and metrics
  getRuleSetMetrics: (id: string, timeRange?: string) => Promise<RuleMetrics>
  getExecutionHistory: (id: string, limit?: number) => Promise<RuleExecution[]>
  
  // Templates and optimization
  createFromTemplate: (templateId: string, name: string) => Promise<ScanRuleSet>
  optimizeRuleSet: (id: string) => Promise<RuleOptimization>
  applyOptimization: (id: string, optimization: RuleOptimization) => Promise<ScanRuleSet>
  
  // Import/Export
  exportRuleSet: (id: string, format?: 'json' | 'yaml') => Promise<Blob>
  importRuleSet: (file: File) => Promise<ScanRuleSet>
  
  // Bulk operations
  bulkUpdateRuleSets: (updates: { id: string; updates: ScanRuleSetUpdateRequest }[]) => Promise<ScanRuleSet[]>
  bulkDeleteRuleSets: (ids: string[]) => Promise<void>
  bulkExecuteRuleSets: (ids: string[], dataSourceId: string) => Promise<RuleExecution[]>
}

export const useScanRuleSets = (options: UseScanRuleSetsOptions = {}) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRuleSet, setSelectedRuleSet] = useState<ScanRuleSet | null>(null)
  const [activeExecutions, setActiveExecutions] = useState<RuleExecution[]>([])

  // Query for all rule sets
  const {
    data: ruleSets = [],
    isLoading: ruleSetsLoading,
    refetch: refetchRuleSets
  } = useQuery({
    queryKey: ['scanRuleSets'],
    queryFn: () => scanRuleSetApis.getAllRuleSets(),
    enabled: true,
    refetchInterval: options.autoRefresh ? (options.refreshInterval || 30000) : false,
    staleTime: 10000
  })

  // Query for rule set statistics
  const {
    data: ruleSetStats,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['scanRuleSetStats'],
    queryFn: () => scanRuleSetApis.getRuleSetStats(),
    enabled: true,
    refetchInterval: options.autoRefresh ? (options.refreshInterval || 60000) : false,
    staleTime: 30000
  })

  // Query for rule templates
  const {
    data: ruleTemplates = [],
    isLoading: templatesLoading
  } = useQuery({
    queryKey: ['ruleTemplates'],
    queryFn: () => scanRuleSetApis.getRuleTemplates(),
    enabled: true,
    staleTime: 300000 // 5 minutes
  })

  // Query for active executions
  const {
    data: executions = [],
    isLoading: executionsLoading,
    refetch: refetchExecutions
  } = useQuery({
    queryKey: ['activeRuleExecutions'],
    queryFn: () => scanRuleSetApis.getActiveExecutions(),
    enabled: true,
    refetchInterval: 5000, // Frequent updates for active executions
    staleTime: 2000
  })

  // Create rule set mutation
  const createRuleSetMutation = useMutation({
    mutationFn: (request: ScanRuleSetCreateRequest) => scanRuleSetApis.createRuleSet(request),
    onSuccess: (newRuleSet) => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      queryClient.invalidateQueries({ queryKey: ['scanRuleSetStats'] })
      
      // Track creation event
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_created', {
        ruleSetId: newRuleSet.id,
        category: newRuleSet.category,
        complexity: newRuleSet.complexity,
        rulesCount: newRuleSet.rules.length
      })
    },
    onError: (error: any) => {
      setError(`Failed to create rule set: ${error.message}`)
    }
  })

  // Update rule set mutation
  const updateRuleSetMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ScanRuleSetUpdateRequest }) =>
      scanRuleSetApis.updateRuleSet(id, updates),
    onSuccess: (updatedRuleSet) => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      queryClient.invalidateQueries({ queryKey: ['scanRuleSetStats'] })
      
      // Update selected rule set if it's the one being updated
      if (selectedRuleSet && selectedRuleSet.id === updatedRuleSet.id) {
        setSelectedRuleSet(updatedRuleSet)
      }
      
      // Track update event
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_updated', {
        ruleSetId: updatedRuleSet.id,
        category: updatedRuleSet.category,
        complexity: updatedRuleSet.complexity
      })
    },
    onError: (error: any) => {
      setError(`Failed to update rule set: ${error.message}`)
    }
  })

  // Delete rule set mutation
  const deleteRuleSetMutation = useMutation({
    mutationFn: (id: string) => scanRuleSetApis.deleteRuleSet(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      queryClient.invalidateQueries({ queryKey: ['scanRuleSetStats'] })
      
      // Clear selected rule set if it was deleted
      if (selectedRuleSet && selectedRuleSet.id === deletedId) {
        setSelectedRuleSet(null)
      }
      
      // Track deletion event
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_deleted', {
        ruleSetId: deletedId
      })
    },
    onError: (error: any) => {
      setError(`Failed to delete rule set: ${error.message}`)
    }
  })

  // Execute rule set mutation
  const executeRuleSetMutation = useMutation({
    mutationFn: ({ id, dataSourceId }: { id: string; dataSourceId: string }) =>
      scanRuleSetApis.executeRuleSet(id, dataSourceId),
    onSuccess: (execution) => {
      queryClient.invalidateQueries({ queryKey: ['activeRuleExecutions'] })
      
      // Add to active executions
      setActiveExecutions(prev => [...prev, execution])
      
      // Track execution event
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_executed', {
        ruleSetId: execution.ruleSetId,
        executionId: execution.id,
        dataSourceId: execution.dataSourceId,
        executionMode: execution.executionMode
      })
    },
    onError: (error: any) => {
      setError(`Failed to execute rule set: ${error.message}`)
    }
  })

  // Rule validation mutation
  const validateRuleMutation = useMutation({
    mutationFn: (rule: Partial<ScanRule>) => scanRuleSetApis.validateRule(rule),
    onError: (error: any) => {
      setError(`Rule validation failed: ${error.message}`)
    }
  })

  // Create rule set
  const createRuleSet = useCallback(async (request: ScanRuleSetCreateRequest): Promise<ScanRuleSet> => {
    return await createRuleSetMutation.mutateAsync(request)
  }, [createRuleSetMutation])

  // Update rule set
  const updateRuleSet = useCallback(async (id: string, updates: ScanRuleSetUpdateRequest): Promise<ScanRuleSet> => {
    return await updateRuleSetMutation.mutateAsync({ id, updates })
  }, [updateRuleSetMutation])

  // Delete rule set
  const deleteRuleSet = useCallback(async (id: string): Promise<void> => {
    await deleteRuleSetMutation.mutateAsync(id)
  }, [deleteRuleSetMutation])

  // Duplicate rule set
  const duplicateRuleSet = useCallback(async (id: string, newName: string): Promise<ScanRuleSet> => {
    try {
      const result = await scanRuleSetApis.duplicateRuleSet(id, newName)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track duplication event
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_duplicated', {
        originalId: id,
        newId: result.id,
        newName
      })
      
      return result
    } catch (error) {
      console.error('Error duplicating rule set:', error)
      throw error
    }
  }, [queryClient])

  // Add rule to rule set
  const addRule = useCallback(async (ruleSetId: string, rule: Partial<ScanRule>): Promise<ScanRule> => {
    try {
      const result = await scanRuleSetApis.addRule(ruleSetId, rule)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track rule addition
      crossGroupIntegrationAPI.trackEvent('scan_rule_added', {
        ruleSetId,
        ruleId: result.id,
        category: result.category,
        complexity: result.complexity
      })
      
      return result
    } catch (error) {
      console.error('Error adding rule:', error)
      throw error
    }
  }, [queryClient])

  // Update rule
  const updateRule = useCallback(async (ruleSetId: string, ruleId: string, updates: Partial<ScanRule>): Promise<ScanRule> => {
    try {
      const result = await scanRuleSetApis.updateRule(ruleSetId, ruleId, updates)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track rule update
      crossGroupIntegrationAPI.trackEvent('scan_rule_updated', {
        ruleSetId,
        ruleId,
        changes: Object.keys(updates)
      })
      
      return result
    } catch (error) {
      console.error('Error updating rule:', error)
      throw error
    }
  }, [queryClient])

  // Delete rule
  const deleteRule = useCallback(async (ruleSetId: string, ruleId: string): Promise<void> => {
    try {
      await scanRuleSetApis.deleteRule(ruleSetId, ruleId)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track rule deletion
      crossGroupIntegrationAPI.trackEvent('scan_rule_deleted', {
        ruleSetId,
        ruleId
      })
    } catch (error) {
      console.error('Error deleting rule:', error)
      throw error
    }
  }, [queryClient])

  // Validate rule
  const validateRule = useCallback(async (rule: Partial<ScanRule>): Promise<RuleValidation> => {
    return await validateRuleMutation.mutateAsync(rule)
  }, [validateRuleMutation])

  // Test rule
  const testRule = useCallback(async (rule: Partial<ScanRule>, testData: any): Promise<RuleValidation> => {
    try {
      return await scanRuleSetApis.testRule(rule, testData)
    } catch (error) {
      console.error('Error testing rule:', error)
      throw error
    }
  }, [])

  // Execute rule set
  const executeRuleSet = useCallback(async (id: string, dataSourceId: string): Promise<RuleExecution> => {
    return await executeRuleSetMutation.mutateAsync({ id, dataSourceId })
  }, [executeRuleSetMutation])

  // Schedule rule set
  const scheduleRuleSet = useCallback(async (id: string, schedule: Partial<RuleSchedule>): Promise<RuleSchedule> => {
    try {
      const result = await scanRuleSetApis.scheduleRuleSet(id, schedule)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track scheduling event
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_scheduled', {
        ruleSetId: id,
        frequency: schedule.frequency,
        enabled: schedule.enabled
      })
      
      return result
    } catch (error) {
      console.error('Error scheduling rule set:', error)
      throw error
    }
  }, [queryClient])

  // Get rule set metrics
  const getRuleSetMetrics = useCallback(async (id: string, timeRange?: string): Promise<RuleMetrics> => {
    try {
      return await scanRuleSetApis.getRuleSetMetrics(id, timeRange)
    } catch (error) {
      console.error('Error getting rule set metrics:', error)
      throw error
    }
  }, [])

  // Get execution history
  const getExecutionHistory = useCallback(async (id: string, limit?: number): Promise<RuleExecution[]> => {
    try {
      return await scanRuleSetApis.getExecutionHistory(id, limit)
    } catch (error) {
      console.error('Error getting execution history:', error)
      throw error
    }
  }, [])

  // Create from template
  const createFromTemplate = useCallback(async (templateId: string, name: string): Promise<ScanRuleSet> => {
    try {
      const result = await scanRuleSetApis.createFromTemplate(templateId, name)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track template usage
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_created_from_template', {
        templateId,
        ruleSetId: result.id,
        name
      })
      
      return result
    } catch (error) {
      console.error('Error creating from template:', error)
      throw error
    }
  }, [queryClient])

  // Optimize rule set
  const optimizeRuleSet = useCallback(async (id: string): Promise<RuleOptimization> => {
    try {
      return await scanRuleSetApis.optimizeRuleSet(id)
    } catch (error) {
      console.error('Error optimizing rule set:', error)
      throw error
    }
  }, [])

  // Apply optimization
  const applyOptimization = useCallback(async (id: string, optimization: RuleOptimization): Promise<ScanRuleSet> => {
    try {
      const result = await scanRuleSetApis.applyOptimization(id, optimization)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track optimization application
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_optimization_applied', {
        ruleSetId: id,
        estimatedImprovement: optimization.estimatedImprovement,
        complexity: optimization.implementationComplexity
      })
      
      return result
    } catch (error) {
      console.error('Error applying optimization:', error)
      throw error
    }
  }, [queryClient])

  // Export rule set
  const exportRuleSet = useCallback(async (id: string, format: 'json' | 'yaml' = 'json'): Promise<Blob> => {
    try {
      return await scanRuleSetApis.exportRuleSet(id, format)
    } catch (error) {
      console.error('Error exporting rule set:', error)
      throw error
    }
  }, [])

  // Import rule set
  const importRuleSet = useCallback(async (file: File): Promise<ScanRuleSet> => {
    try {
      const result = await scanRuleSetApis.importRuleSet(file)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track import event
      crossGroupIntegrationAPI.trackEvent('scan_rule_set_imported', {
        ruleSetId: result.id,
        fileName: file.name,
        fileSize: file.size
      })
      
      return result
    } catch (error) {
      console.error('Error importing rule set:', error)
      throw error
    }
  }, [queryClient])

  // Bulk operations
  const bulkUpdateRuleSets = useCallback(async (updates: { id: string; updates: ScanRuleSetUpdateRequest }[]): Promise<ScanRuleSet[]> => {
    try {
      const result = await scanRuleSetApis.bulkUpdateRuleSets(updates)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track bulk update
      crossGroupIntegrationAPI.trackEvent('scan_rule_sets_bulk_updated', {
        count: updates.length,
        ruleSetIds: updates.map(u => u.id)
      })
      
      return result
    } catch (error) {
      console.error('Error bulk updating rule sets:', error)
      throw error
    }
  }, [queryClient])

  const bulkDeleteRuleSets = useCallback(async (ids: string[]): Promise<void> => {
    try {
      await scanRuleSetApis.bulkDeleteRuleSets(ids)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
      
      // Track bulk deletion
      crossGroupIntegrationAPI.trackEvent('scan_rule_sets_bulk_deleted', {
        count: ids.length,
        ruleSetIds: ids
      })
    } catch (error) {
      console.error('Error bulk deleting rule sets:', error)
      throw error
    }
  }, [queryClient])

  // Update active executions when execution data changes
  useEffect(() => {
    setActiveExecutions(executions.filter(exec => 
      exec.status === OperationStatus.PENDING || exec.status === OperationStatus.RUNNING
    ))
  }, [executions])

  // Clear error when operations succeed
  useEffect(() => {
    if (
      createRuleSetMutation.isSuccess || 
      updateRuleSetMutation.isSuccess || 
      deleteRuleSetMutation.isSuccess ||
      executeRuleSetMutation.isSuccess
    ) {
      setError(null)
    }
  }, [
    createRuleSetMutation.isSuccess,
    updateRuleSetMutation.isSuccess,
    deleteRuleSetMutation.isSuccess,
    executeRuleSetMutation.isSuccess
  ])

  // Scan rule set operations object
  const operations: ScanRuleSetOperations = useMemo(() => ({
    // Core CRUD operations
    createRuleSet,
    updateRuleSet,
    deleteRuleSet,
    duplicateRuleSet,
    
    // Rule management
    addRule,
    updateRule,
    deleteRule,
    reorderRules: async (ruleSetId: string, ruleIds: string[]) => {
      await scanRuleSetApis.reorderRules(ruleSetId, ruleIds)
      queryClient.invalidateQueries({ queryKey: ['scanRuleSets'] })
    },
    
    // Rule validation and testing
    validateRule,
    testRule,
    validateRuleSet: async (ruleSet: Partial<ScanRuleSet>) => scanRuleSetApis.validateRuleSet(ruleSet),
    
    // Execution operations
    executeRuleSet,
    scheduleRuleSet,
    cancelExecution: async (executionId: string) => {
      await scanRuleSetApis.cancelExecution(executionId)
      queryClient.invalidateQueries({ queryKey: ['activeRuleExecutions'] })
    },
    
    // Analytics and metrics
    getRuleSetMetrics,
    getExecutionHistory,
    
    // Templates and optimization
    createFromTemplate,
    optimizeRuleSet,
    applyOptimization,
    
    // Import/Export
    exportRuleSet,
    importRuleSet,
    
    // Bulk operations
    bulkUpdateRuleSets,
    bulkDeleteRuleSets,
    bulkExecuteRuleSets: async (ids: string[], dataSourceId: string) => {
      const result = await scanRuleSetApis.bulkExecuteRuleSets(ids, dataSourceId)
      queryClient.invalidateQueries({ queryKey: ['activeRuleExecutions'] })
      return result
    }
  }), [
    createRuleSet, updateRuleSet, deleteRuleSet, duplicateRuleSet,
    addRule, updateRule, deleteRule,
    validateRule, testRule,
    executeRuleSet, scheduleRuleSet,
    getRuleSetMetrics, getExecutionHistory,
    createFromTemplate, optimizeRuleSet, applyOptimization,
    exportRuleSet, importRuleSet,
    bulkUpdateRuleSets, bulkDeleteRuleSets,
    queryClient
  ])

  // Computed values
  const totalRuleSets = useMemo(() => ruleSets.length, [ruleSets])
  const activeRuleSets = useMemo(() => ruleSets.filter(rs => rs.status === RuleStatus.ACTIVE).length, [ruleSets])
  const runningExecutions = useMemo(() => activeExecutions.length, [activeExecutions])

  return {
    // Data
    ruleSets,
    ruleSetStats,
    ruleTemplates,
    activeExecutions,
    selectedRuleSet,
    
    // Computed values
    totalRuleSets,
    activeRuleSets,
    runningExecutions,
    
    // Loading states
    loading: loading || ruleSetsLoading || statsLoading,
    isCreating: createRuleSetMutation.isPending,
    isUpdating: updateRuleSetMutation.isPending,
    isDeleting: deleteRuleSetMutation.isPending,
    isExecuting: executeRuleSetMutation.isPending,
    isValidating: validateRuleMutation.isPending,
    
    // Error states
    error,
    
    // Operations
    ...operations,
    
    // State management
    setSelectedRuleSet,
    
    // Utility functions
    refetchRuleSets,
    refetchStats,
    refetchExecutions,
    clearError: () => setError(null)
  }
}

export default useScanRuleSets