'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import compliance rule APIs
import { racineComplianceRuleAPI } from '../services/compliance-rule-apis'
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis'

// Import types
import {
  ComplianceRule,
  ComplianceFramework,
  ComplianceAudit,
  ComplianceResult,
  ComplianceMetrics,
  ComplianceStatus,
  ComplianceRisk,
  ComplianceCreateRequest,
  ComplianceUpdateRequest,
  ComplianceFilters,
  ComplianceStats,
  OperationStatus
} from '../types/racine-core.types'

interface UseComplianceRulesOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
}

interface ComplianceRuleOperations {
  // Core CRUD operations
  createComplianceRule: (request: ComplianceCreateRequest) => Promise<ComplianceRule>
  updateComplianceRule: (id: string, updates: ComplianceUpdateRequest) => Promise<ComplianceRule>
  deleteComplianceRule: (id: string) => Promise<void>
  activateComplianceRule: (id: string) => Promise<ComplianceRule>
  deactivateComplianceRule: (id: string) => Promise<ComplianceRule>
  
  // Framework operations
  createComplianceFramework: (framework: Partial<ComplianceFramework>) => Promise<ComplianceFramework>
  updateComplianceFramework: (id: string, updates: Partial<ComplianceFramework>) => Promise<ComplianceFramework>
  deleteComplianceFramework: (id: string) => Promise<void>
  
  // Validation and testing
  validateComplianceRule: (rule: Partial<ComplianceRule>) => Promise<any>
  testComplianceRule: (rule: Partial<ComplianceRule>, testData: any) => Promise<any>
  validateComplianceFramework: (framework: Partial<ComplianceFramework>) => Promise<any>
  
  // Execution and auditing
  executeComplianceCheck: (ruleId: string, targetData: any) => Promise<ComplianceResult[]>
  runComplianceAudit: (frameworkId: string, scope: any) => Promise<ComplianceAudit>
  getComplianceAuditResults: (auditId: string) => Promise<ComplianceAudit>
  getComplianceResults: (filters?: any) => Promise<ComplianceResult[]>
  
  // Risk assessment
  assessComplianceRisks: (data: any) => Promise<ComplianceRisk[]>
  getRiskAssessmentResults: (assessmentId: string) => Promise<ComplianceRisk[]>
  updateRiskMitigation: (riskId: string, mitigationData: any) => Promise<ComplianceRisk>
  getComplianceRiskDashboard: (filters?: any) => Promise<any>
  
  // Reporting
  generateComplianceReport: (config: any) => Promise<any>
  exportComplianceData: (format: 'json' | 'csv' | 'pdf', filters?: any) => Promise<Blob>
  
  // Bulk operations
  bulkExecuteComplianceChecks: (ruleIds: string[], targetData: any) => Promise<ComplianceResult[]>
  bulkUpdateComplianceRules: (updates: Array<{ id: string; updates: ComplianceUpdateRequest }>) => Promise<ComplianceRule[]>
  bulkDeleteComplianceRules: (ids: string[]) => Promise<void>
  bulkActivateComplianceRules: (ids: string[]) => Promise<ComplianceRule[]>
  bulkDeactivateComplianceRules: (ids: string[]) => Promise<ComplianceRule[]>
  
  // Cross-SPA integration
  linkToDataSources: (complianceRuleId: string, dataSourceIds: string[]) => Promise<void>
  linkToScanRuleSets: (complianceRuleId: string, ruleSetIds: string[]) => Promise<void>
  linkToClassifications: (complianceRuleId: string, classificationIds: string[]) => Promise<void>
  getCrossSPADependencies: (complianceRuleId: string) => Promise<any>
  getCrossSPAUsage: (complianceRuleId: string) => Promise<any>
  getComplianceImpactAnalysis: (ruleId: string) => Promise<any>
  
  // Monitoring and alerting
  setupComplianceMonitoring: (config: any) => Promise<any>
  getComplianceAlerts: (filters?: any) => Promise<any[]>
  acknowledgeComplianceAlert: (alertId: string, acknowledgment: any) => Promise<any>
  configureComplianceNotifications: (config: any) => Promise<any>
  
  // AI and analytics
  getAIComplianceRecommendations: (data: any) => Promise<any[]>
  analyzeCompliancePatterns: (timeRange?: string) => Promise<any>
  predictComplianceRisks: (data: any) => Promise<any[]>
  getComplianceOptimizationSuggestions: (frameworkId: string) => Promise<any[]>
}

export function useComplianceRules(options: UseComplianceRulesOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000, enableRealTimeUpdates = true } = options
  const queryClient = useQueryClient()
  
  // Local state
  const [operationStatus, setOperationStatus] = useState<OperationStatus>('idle')
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([])

  // ============================================================================
  // CORE QUERIES
  // ============================================================================

  // Get all compliance rules
  const { 
    data: complianceRules, 
    isLoading: isLoadingRules, 
    error: rulesError,
    refetch: refetchRules
  } = useQuery({
    queryKey: ['racine-compliance-rules'],
    queryFn: () => racineComplianceRuleAPI.getAllComplianceRules(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get compliance statistics
  const { 
    data: complianceStats, 
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['racine-compliance-stats'],
    queryFn: () => racineComplianceRuleAPI.getComplianceStats(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get compliance frameworks
  const { 
    data: frameworks, 
    isLoading: isLoadingFrameworks,
    refetch: refetchFrameworks
  } = useQuery({
    queryKey: ['racine-compliance-frameworks'],
    queryFn: () => racineComplianceRuleAPI.getAllComplianceFrameworks(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get compliance metrics
  const { 
    data: complianceMetrics, 
    isLoading: isLoadingMetrics 
  } = useQuery({
    queryKey: ['racine-compliance-metrics'],
    queryFn: () => racineComplianceRuleAPI.getComplianceMetrics(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get compliance alerts
  const { 
    data: complianceAlerts, 
    isLoading: isLoadingAlerts 
  } = useQuery({
    queryKey: ['racine-compliance-alerts'],
    queryFn: () => racineComplianceRuleAPI.getComplianceAlerts(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create compliance rule mutation
  const createComplianceRuleMutation = useMutation({
    mutationFn: (request: ComplianceCreateRequest) => racineComplianceRuleAPI.createComplianceRule(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-compliance-rules'] })
      queryClient.invalidateQueries({ queryKey: ['racine-compliance-stats'] })
    },
    onError: (error) => {
      console.error('Error creating compliance rule:', error)
    }
  })

  // Update compliance rule mutation
  const updateComplianceRuleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ComplianceUpdateRequest }) => 
      racineComplianceRuleAPI.updateComplianceRule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-compliance-rules'] })
    },
    onError: (error) => {
      console.error('Error updating compliance rule:', error)
    }
  })

  // Delete compliance rule mutation
  const deleteComplianceRuleMutation = useMutation({
    mutationFn: (id: string) => racineComplianceRuleAPI.deleteComplianceRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-compliance-rules'] })
      queryClient.invalidateQueries({ queryKey: ['racine-compliance-stats'] })
    },
    onError: (error) => {
      console.error('Error deleting compliance rule:', error)
    }
  })

  // Execute compliance check mutation
  const executeComplianceCheckMutation = useMutation({
    mutationFn: ({ ruleId, targetData }: { ruleId: string; targetData: any }) => 
      racineComplianceRuleAPI.executeComplianceCheck(ruleId, targetData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-compliance-results'] })
    },
    onError: (error) => {
      console.error('Error executing compliance check:', error)
    }
  })

  // ============================================================================
  // OPERATION HANDLERS
  // ============================================================================

  const createComplianceRule = useCallback(async (request: ComplianceCreateRequest): Promise<ComplianceRule> => {
    setOperationStatus('loading')
    try {
      const result = await createComplianceRuleMutation.mutateAsync(request)
      setOperationStatus('success')
      return result
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [createComplianceRuleMutation])

  const updateComplianceRule = useCallback(async (id: string, updates: ComplianceUpdateRequest): Promise<ComplianceRule> => {
    setOperationStatus('loading')
    try {
      const result = await updateComplianceRuleMutation.mutateAsync({ id, updates })
      setOperationStatus('success')
      return result
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [updateComplianceRuleMutation])

  const deleteComplianceRule = useCallback(async (id: string): Promise<void> => {
    setOperationStatus('loading')
    try {
      await deleteComplianceRuleMutation.mutateAsync(id)
      setOperationStatus('success')
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [deleteComplianceRuleMutation])

  const activateComplianceRule = useCallback(async (id: string): Promise<ComplianceRule> => {
    const result = await racineComplianceRuleAPI.activateComplianceRule(id)
    await refetchRules()
    return result
  }, [refetchRules])

  const deactivateComplianceRule = useCallback(async (id: string): Promise<ComplianceRule> => {
    const result = await racineComplianceRuleAPI.deactivateComplianceRule(id)
    await refetchRules()
    return result
  }, [refetchRules])

  // Framework operations
  const createComplianceFramework = useCallback(async (framework: Partial<ComplianceFramework>): Promise<ComplianceFramework> => {
    const result = await racineComplianceRuleAPI.createComplianceFramework(framework)
    await refetchFrameworks()
    return result
  }, [refetchFrameworks])

  const updateComplianceFramework = useCallback(async (id: string, updates: Partial<ComplianceFramework>): Promise<ComplianceFramework> => {
    const result = await racineComplianceRuleAPI.updateComplianceFramework(id, updates)
    await refetchFrameworks()
    return result
  }, [refetchFrameworks])

  const deleteComplianceFramework = useCallback(async (id: string): Promise<void> => {
    await racineComplianceRuleAPI.deleteComplianceFramework(id)
    await refetchFrameworks()
  }, [refetchFrameworks])

  // Validation and testing
  const validateComplianceRule = useCallback(async (rule: Partial<ComplianceRule>): Promise<any> => {
    return await racineComplianceRuleAPI.validateComplianceRule(rule)
  }, [])

  const testComplianceRule = useCallback(async (rule: Partial<ComplianceRule>, testData: any): Promise<any> => {
    return await racineComplianceRuleAPI.testComplianceRule(rule, testData)
  }, [])

  const validateComplianceFramework = useCallback(async (framework: Partial<ComplianceFramework>): Promise<any> => {
    return await racineComplianceRuleAPI.validateComplianceFramework(framework)
  }, [])

  // Execution and auditing
  const executeComplianceCheck = useCallback(async (ruleId: string, targetData: any): Promise<ComplianceResult[]> => {
    const result = await executeComplianceCheckMutation.mutateAsync({ ruleId, targetData })
    return result
  }, [executeComplianceCheckMutation])

  const runComplianceAudit = useCallback(async (frameworkId: string, scope: any): Promise<ComplianceAudit> => {
    return await racineComplianceRuleAPI.runComplianceAudit(frameworkId, scope)
  }, [])

  const getComplianceAuditResults = useCallback(async (auditId: string): Promise<ComplianceAudit> => {
    return await racineComplianceRuleAPI.getComplianceAuditResults(auditId)
  }, [])

  const getComplianceResults = useCallback(async (filters?: any): Promise<ComplianceResult[]> => {
    const response = await racineComplianceRuleAPI.getComplianceResults(filters)
    return response.data?.items || []
  }, [])

  // Risk assessment
  const assessComplianceRisks = useCallback(async (data: any): Promise<ComplianceRisk[]> => {
    const response = await racineComplianceRuleAPI.assessComplianceRisks(data)
    return response.data || []
  }, [])

  const getRiskAssessmentResults = useCallback(async (assessmentId: string): Promise<ComplianceRisk[]> => {
    const response = await racineComplianceRuleAPI.getRiskAssessmentResults(assessmentId)
    return response.data || []
  }, [])

  const updateRiskMitigation = useCallback(async (riskId: string, mitigationData: any): Promise<ComplianceRisk> => {
    return await racineComplianceRuleAPI.updateRiskMitigation(riskId, mitigationData)
  }, [])

  const getComplianceRiskDashboard = useCallback(async (filters?: any): Promise<any> => {
    const response = await racineComplianceRuleAPI.getComplianceRiskDashboard(filters)
    return response.data
  }, [])

  // Reporting
  const generateComplianceReport = useCallback(async (config: any): Promise<any> => {
    return await racineComplianceRuleAPI.generateComplianceReport(config)
  }, [])

  const exportComplianceData = useCallback(async (format: 'json' | 'csv' | 'pdf', filters?: any): Promise<Blob> => {
    const response = await racineComplianceRuleAPI.exportComplianceData(format, filters)
    return response.data!
  }, [])

  // Bulk operations
  const bulkExecuteComplianceChecks = useCallback(async (ruleIds: string[], targetData: any): Promise<ComplianceResult[]> => {
    const response = await racineComplianceRuleAPI.bulkExecuteComplianceChecks(ruleIds, targetData)
    return response.data || []
  }, [])

  const bulkUpdateComplianceRules = useCallback(async (updates: Array<{ id: string; updates: ComplianceUpdateRequest }>): Promise<ComplianceRule[]> => {
    const response = await racineComplianceRuleAPI.bulkUpdateComplianceRules(updates)
    await refetchRules()
    return response.data || []
  }, [refetchRules])

  const bulkDeleteComplianceRules = useCallback(async (ids: string[]): Promise<void> => {
    await racineComplianceRuleAPI.bulkDeleteComplianceRules(ids)
    await refetchRules()
  }, [refetchRules])

  const bulkActivateComplianceRules = useCallback(async (ids: string[]): Promise<ComplianceRule[]> => {
    const response = await racineComplianceRuleAPI.bulkActivateComplianceRules(ids)
    await refetchRules()
    return response.data || []
  }, [refetchRules])

  const bulkDeactivateComplianceRules = useCallback(async (ids: string[]): Promise<ComplianceRule[]> => {
    const response = await racineComplianceRuleAPI.bulkDeactivateComplianceRules(ids)
    await refetchRules()
    return response.data || []
  }, [refetchRules])

  // Cross-SPA integration
  const linkToDataSources = useCallback(async (complianceRuleId: string, dataSourceIds: string[]): Promise<void> => {
    try {
      await racineComplianceRuleAPI.linkToDataSources(complianceRuleId, dataSourceIds)
      await crossGroupIntegrationAPI.syncComplianceRuleWithDataSources(complianceRuleId, dataSourceIds)
    } catch (error) {
      console.error('Error linking to data sources:', error)
      throw error
    }
  }, [])

  const linkToScanRuleSets = useCallback(async (complianceRuleId: string, ruleSetIds: string[]): Promise<void> => {
    try {
      await racineComplianceRuleAPI.linkToScanRuleSets(complianceRuleId, ruleSetIds)
      await crossGroupIntegrationAPI.syncComplianceRuleWithScanRuleSets(complianceRuleId, ruleSetIds)
    } catch (error) {
      console.error('Error linking to scan rule sets:', error)
      throw error
    }
  }, [])

  const linkToClassifications = useCallback(async (complianceRuleId: string, classificationIds: string[]): Promise<void> => {
    try {
      await racineComplianceRuleAPI.linkToClassifications(complianceRuleId, classificationIds)
      await crossGroupIntegrationAPI.syncComplianceRuleWithClassifications(complianceRuleId, classificationIds)
    } catch (error) {
      console.error('Error linking to classifications:', error)
      throw error
    }
  }, [])

  const getCrossSPADependencies = useCallback(async (complianceRuleId: string): Promise<any> => {
    const response = await racineComplianceRuleAPI.getCrossSPADependencies(complianceRuleId)
    return response.data
  }, [])

  const getCrossSPAUsage = useCallback(async (complianceRuleId: string): Promise<any> => {
    const response = await racineComplianceRuleAPI.getCrossSPAUsage(complianceRuleId)
    return response.data
  }, [])

  const getComplianceImpactAnalysis = useCallback(async (ruleId: string): Promise<any> => {
    const response = await racineComplianceRuleAPI.getComplianceImpactAnalysis(ruleId)
    return response.data
  }, [])

  // Monitoring and alerting
  const setupComplianceMonitoring = useCallback(async (config: any): Promise<any> => {
    return await racineComplianceRuleAPI.setupComplianceMonitoring(config)
  }, [])

  const getComplianceAlerts = useCallback(async (filters?: any): Promise<any[]> => {
    const response = await racineComplianceRuleAPI.getComplianceAlerts(filters)
    return response.data || []
  }, [])

  const acknowledgeComplianceAlert = useCallback(async (alertId: string, acknowledgment: any): Promise<any> => {
    return await racineComplianceRuleAPI.acknowledgeComplianceAlert(alertId, acknowledgment)
  }, [])

  const configureComplianceNotifications = useCallback(async (config: any): Promise<any> => {
    return await racineComplianceRuleAPI.configureComplianceNotifications(config)
  }, [])

  // AI and analytics
  const getAIComplianceRecommendations = useCallback(async (data: any): Promise<any[]> => {
    const response = await racineComplianceRuleAPI.getAIComplianceRecommendations(data)
    return response.data || []
  }, [])

  const analyzeCompliancePatterns = useCallback(async (timeRange?: string): Promise<any> => {
    const response = await racineComplianceRuleAPI.analyzeCompliancePatterns(timeRange)
    return response.data
  }, [])

  const predictComplianceRisks = useCallback(async (data: any): Promise<any[]> => {
    const response = await racineComplianceRuleAPI.predictComplianceRisks(data)
    return response.data || []
  }, [])

  const getComplianceOptimizationSuggestions = useCallback(async (frameworkId: string): Promise<any[]> => {
    const response = await racineComplianceRuleAPI.getComplianceOptimizationSuggestions(frameworkId)
    return response.data || []
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const computedValues = useMemo(() => {
    const rulesData = complianceRules?.data?.items || []
    const frameworksData = frameworks?.data?.items || []
    const statsData = complianceStats?.data || {}
    const metricsData = complianceMetrics?.data || {}
    const alertsData = complianceAlerts?.data || []

    return {
      totalComplianceRules: rulesData.length,
      activeRules: rulesData.filter(r => r.status === ComplianceStatus.ACTIVE).length,
      totalFrameworks: frameworksData.length,
      complianceScore: metricsData.overallComplianceScore || 0,
      riskLevel: metricsData.riskLevel || 'LOW',
      pendingAlerts: alertsData.filter(a => !a.acknowledged).length,
      recentAudits: statsData.recentAudits || [],
      topRisks: metricsData.topRisks || [],
      complianceTrends: metricsData.trends || [],
      frameworkScores: frameworksData.map(f => ({
        name: f.name,
        score: f.complianceScore || 0,
        status: f.status
      }))
    }
  }, [complianceRules, frameworks, complianceStats, complianceMetrics, complianceAlerts])

  // ============================================================================
  // OPERATIONS OBJECT
  // ============================================================================

  const operations: ComplianceRuleOperations = {
    createComplianceRule,
    updateComplianceRule,
    deleteComplianceRule,
    activateComplianceRule,
    deactivateComplianceRule,
    createComplianceFramework,
    updateComplianceFramework,
    deleteComplianceFramework,
    validateComplianceRule,
    testComplianceRule,
    validateComplianceFramework,
    executeComplianceCheck,
    runComplianceAudit,
    getComplianceAuditResults,
    getComplianceResults,
    assessComplianceRisks,
    getRiskAssessmentResults,
    updateRiskMitigation,
    getComplianceRiskDashboard,
    generateComplianceReport,
    exportComplianceData,
    bulkExecuteComplianceChecks,
    bulkUpdateComplianceRules,
    bulkDeleteComplianceRules,
    bulkActivateComplianceRules,
    bulkDeactivateComplianceRules,
    linkToDataSources,
    linkToScanRuleSets,
    linkToClassifications,
    getCrossSPADependencies,
    getCrossSPAUsage,
    getComplianceImpactAnalysis,
    setupComplianceMonitoring,
    getComplianceAlerts,
    acknowledgeComplianceAlert,
    configureComplianceNotifications,
    getAIComplianceRecommendations,
    analyzeCompliancePatterns,
    predictComplianceRisks,
    getComplianceOptimizationSuggestions
  }

  return {
    // Data
    complianceRules: complianceRules?.data?.items || [],
    frameworks: frameworks?.data?.items || [],
    complianceStats: complianceStats?.data,
    complianceMetrics: complianceMetrics?.data,
    complianceAlerts: complianceAlerts?.data || [],
    
    // Loading states
    isLoading: isLoadingRules || isLoadingFrameworks || isLoadingStats || isLoadingMetrics || isLoadingAlerts,
    isLoadingRules,
    isLoadingFrameworks,
    isLoadingStats,
    isLoadingMetrics,
    isLoadingAlerts,
    
    // Error states
    error: rulesError,
    
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
      refetchRules()
      refetchFrameworks()
    },
    
    // Health check
    getServiceHealth: () => racineComplianceRuleAPI.getServiceHealth(),
    getSystemStatus: () => racineComplianceRuleAPI.getSystemStatus(),
    getComplianceEngineStatus: () => racineComplianceRuleAPI.getComplianceEngineStatus()
  }
}

export default useComplianceRules
