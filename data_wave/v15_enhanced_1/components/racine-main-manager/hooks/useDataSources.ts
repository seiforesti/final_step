'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import data source APIs - these integrate with backend
import { dataSourceApis } from '../services/racine-orchestration-apis'
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis'

// Import types from racine core types
import {
  DataSource,
  DataSourceType,
  DataSourceLocation,
  DataSourceStatus,
  Environment,
  Criticality,
  DataClassification,
  ScanFrequency,
  CloudProvider,
  ConnectionConfig,
  ValidationResult,
  SecurityPolicy,
  DataSourceTemplate,
  EncryptionConfig,
  AuthenticationMethod,
  ConnectionPool,
  DataSourceMetrics,
  DataSourceHealth,
  PerformanceMetrics,
  ConnectionTestResult,
  DataSourceCreateRequest,
  DataSourceUpdateRequest,
  DataSourceFilters,
  DataSourceStats
} from '../types/racine-core.types'

interface UseDataSourcesOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  filters?: DataSourceFilters
  includeMetrics?: boolean
  includeHealth?: boolean
}

interface DataSourceOperations {
  // Core CRUD operations
  createDataSource: (config: Partial<DataSource>) => Promise<DataSource>
  updateDataSource: (id: string, updates: Partial<DataSource>) => Promise<DataSource>
  deleteDataSource: (id: string) => Promise<void>
  
  // Data source retrieval
  getDataSourceById: (id: string) => Promise<DataSource | null>
  getDataSourceByName: (name: string) => Promise<DataSource | null>
  getAllDataSources: (filters?: DataSourceFilters) => Promise<DataSource[]>
  
  // Templates and configuration
  getDataSourceTemplates: () => Promise<DataSourceTemplate[]>
  validateDataSourceConfig: (config: ConnectionConfig) => Promise<ValidationResult>
  getConnectionRequirements: (type: DataSourceType) => Promise<any>
  optimizeConnectionSettings: (config: any) => Promise<any>
  
  // Performance and analytics
  estimatePerformance: (config: ConnectionConfig) => Promise<PerformanceMetrics>
  getDataSourceMetrics: (id: string, timeRange?: string) => Promise<DataSourceMetrics>
  getDataSourceHealth: (id: string) => Promise<DataSourceHealth>
  
  // Security and compliance
  validateSecurityCompliance: (config: SecurityPolicy) => Promise<ValidationResult>
  encryptCredentials: (credentials: any) => Promise<any>
  testConnectionSecurity: (id: string) => Promise<ValidationResult>
  
  // Status and monitoring
  refreshDataSourceStatus: (id: string) => Promise<DataSourceStatus>
  enableDataSource: (id: string) => Promise<void>
  disableDataSource: (id: string) => Promise<void>
  
  // Advanced operations
  cloneDataSource: (id: string, newName: string) => Promise<DataSource>
  exportDataSourceConfig: (id: string) => Promise<any>
  importDataSourceConfig: (config: any) => Promise<DataSource>
  
  // Cross-group integration
  linkToScanRuleSets: (dataSourceId: string, ruleSetIds: string[]) => Promise<void>
  linkToClassifications: (dataSourceId: string, classificationIds: string[]) => Promise<void>
  linkToComplianceRules: (dataSourceId: string, ruleIds: string[]) => Promise<void>
  
  // Workspace integration
  addToWorkspace: (dataSourceId: string, workspaceId: string) => Promise<void>
  removeFromWorkspace: (dataSourceId: string, workspaceId: string) => Promise<void>
  getWorkspaceDataSources: (workspaceId: string) => Promise<DataSource[]>
}

// Export the missing hook for data source compliance status
export const useDataSourceComplianceStatusQuery = (dataSourceId: number, options = {}) => {
  return useQuery({
    queryKey: ['data-source-compliance-status', dataSourceId],
    queryFn: async () => {
      // Integrate with backend endpoint in real implementation
      const response = await fetch(`/api/data-sources/${dataSourceId}/compliance-status`);
      if (!response.ok) {
        throw new Error('Failed to fetch compliance status');
      }
      return response.json();
    },
    enabled: !!dataSourceId,
    ...options,
  });
};

export const useDataSources = (options: UseDataSourcesOptions = {}) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Query for all data sources
  const {
    data: dataSources = [],
    isLoading: dataSourcesLoading,
    error: dataSourcesError,
    refetch: refetchDataSources
  } = useQuery({
    queryKey: ['dataSources', options.filters],
    queryFn: () => dataSourceApis.getAllDataSources(options.filters),
    enabled: true,
    refetchInterval: options.autoRefresh ? (options.refreshInterval || 30000) : false,
    staleTime: 5000
  })

  // Query for data source templates
  const {
    data: templates = [],
    isLoading: templatesLoading
  } = useQuery({
    queryKey: ['dataSourceTemplates'],
    queryFn: () => dataSourceApis.getDataSourceTemplates(),
    staleTime: 300000 // 5 minutes
  })

  // Query for data source stats
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['dataSourceStats', options.filters],
    queryFn: () => dataSourceApis.getDataSourceStats(options.filters),
    enabled: true,
    staleTime: 10000
  })

  // Create data source mutation
  const createDataSourceMutation = useMutation({
    mutationFn: (config: Partial<DataSource>) => dataSourceApis.createDataSource(config),
    onSuccess: (newDataSource) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] })
      queryClient.invalidateQueries({ queryKey: ['dataSourceStats'] })
      
      // Track creation in activity system
      crossGroupIntegrationAPI.trackEvent('data_source_created', {
        dataSourceId: newDataSource.id,
        type: newDataSource.type,
        name: newDataSource.name
      })
    },
    onError: (error: any) => {
      setError(`Failed to create data source: ${error.message}`)
    }
  })

  // Update data source mutation
  const updateDataSourceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DataSource> }) => 
      dataSourceApis.updateDataSource(id, updates),
    onSuccess: (updatedDataSource) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] })
      queryClient.setQueryData(['dataSource', updatedDataSource.id], updatedDataSource)
      
      // Track update in activity system
      crossGroupIntegrationAPI.trackEvent('data_source_updated', {
        dataSourceId: updatedDataSource.id,
        type: updatedDataSource.type,
        name: updatedDataSource.name
      })
    },
    onError: (error: any) => {
      setError(`Failed to update data source: ${error.message}`)
    }
  })

  // Delete data source mutation
  const deleteDataSourceMutation = useMutation({
    mutationFn: (id: string) => dataSourceApis.deleteDataSource(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] })
      queryClient.removeQueries({ queryKey: ['dataSource', deletedId] })
      queryClient.invalidateQueries({ queryKey: ['dataSourceStats'] })
      
      // Track deletion in activity system
      crossGroupIntegrationAPI.trackEvent('data_source_deleted', {
        dataSourceId: deletedId
      })
    },
    onError: (error: any) => {
      setError(`Failed to delete data source: ${error.message}`)
    }
  })

  // Get data source by ID with caching
  const getDataSourceById = useCallback(async (id: string): Promise<DataSource | null> => {
    const cached = queryClient.getQueryData(['dataSource', id]) as DataSource
    if (cached) return cached

    try {
      const dataSource = await dataSourceApis.getDataSourceById(id)
      if (dataSource) {
        queryClient.setQueryData(['dataSource', id], dataSource)
      }
      return dataSource
    } catch (error) {
      console.error('Error fetching data source:', error)
      return null
    }
  }, [queryClient])

  // Get data source by name
  const getDataSourceByName = useCallback(async (name: string): Promise<DataSource | null> => {
    try {
      return await dataSourceApis.getDataSourceByName(name)
    } catch (error) {
      console.error('Error fetching data source by name:', error)
      return null
    }
  }, [])

  // Validate data source configuration
  const validateDataSourceConfig = useCallback(async (config: ConnectionConfig): Promise<ValidationResult> => {
    try {
      return await dataSourceApis.validateDataSourceConfig(config)
    } catch (error) {
      console.error('Error validating data source config:', error)
      return {
        isValid: false,
        errors: [`Validation failed: ${(error as Error).message}`],
        warnings: [],
        suggestions: []
      }
    }
  }, [])

  // Get connection requirements for data source type
  const getConnectionRequirements = useCallback(async (type: DataSourceType) => {
    try {
      return await dataSourceApis.getConnectionRequirements(type)
    } catch (error) {
      console.error('Error fetching connection requirements:', error)
      return {}
    }
  }, [])

  // Optimize connection settings
  const optimizeConnectionSettings = useCallback(async (config: any) => {
    try {
      return await dataSourceApis.optimizeConnectionSettings(config)
    } catch (error) {
      console.error('Error optimizing connection settings:', error)
      return config
    }
  }, [])

  // Estimate performance
  const estimatePerformance = useCallback(async (config: ConnectionConfig): Promise<PerformanceMetrics> => {
    try {
      return await dataSourceApis.estimatePerformance(config)
    } catch (error) {
      console.error('Error estimating performance:', error)
      return {
        latency: 0,
        throughput: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        score: 0
      }
    }
  }, [])

  // Get data source metrics
  const getDataSourceMetrics = useCallback(async (id: string, timeRange?: string): Promise<DataSourceMetrics> => {
    try {
      return await dataSourceApis.getDataSourceMetrics(id, timeRange)
    } catch (error) {
      console.error('Error fetching data source metrics:', error)
      throw error
    }
  }, [])

  // Get data source health
  const getDataSourceHealth = useCallback(async (id: string): Promise<DataSourceHealth> => {
    try {
      return await dataSourceApis.getDataSourceHealth(id)
    } catch (error) {
      console.error('Error fetching data source health:', error)
      throw error
    }
  }, [])

  // Cross-group integration operations
  const linkToScanRuleSets = useCallback(async (dataSourceId: string, ruleSetIds: string[]) => {
    try {
      await crossGroupIntegrationAPI.linkDataSourceToScanRuleSets(dataSourceId, ruleSetIds)
      queryClient.invalidateQueries({ queryKey: ['dataSource', dataSourceId] })
    } catch (error) {
      console.error('Error linking to scan rule sets:', error)
      throw error
    }
  }, [queryClient])

  const linkToClassifications = useCallback(async (dataSourceId: string, classificationIds: string[]) => {
    try {
      await crossGroupIntegrationAPI.linkDataSourceToClassifications(dataSourceId, classificationIds)
      queryClient.invalidateQueries({ queryKey: ['dataSource', dataSourceId] })
    } catch (error) {
      console.error('Error linking to classifications:', error)
      throw error
    }
  }, [queryClient])

  const linkToComplianceRules = useCallback(async (dataSourceId: string, ruleIds: string[]) => {
    try {
      await crossGroupIntegrationAPI.linkDataSourceToComplianceRules(dataSourceId, ruleIds)
      queryClient.invalidateQueries({ queryKey: ['dataSource', dataSourceId] })
    } catch (error) {
      console.error('Error linking to compliance rules:', error)
      throw error
    }
  }, [queryClient])

  // Data source operations object
  const operations: DataSourceOperations = useMemo(() => ({
    // Core CRUD operations
    createDataSource: (config: Partial<DataSource>) => createDataSourceMutation.mutateAsync(config),
    updateDataSource: (id: string, updates: Partial<DataSource>) => 
      updateDataSourceMutation.mutateAsync({ id, updates }),
    deleteDataSource: (id: string) => deleteDataSourceMutation.mutateAsync(id),
    
    // Data source retrieval
    getDataSourceById,
    getDataSourceByName,
    getAllDataSources: (filters?: DataSourceFilters) => dataSourceApis.getAllDataSources(filters),
    
    // Templates and configuration
    getDataSourceTemplates: () => dataSourceApis.getDataSourceTemplates(),
    validateDataSourceConfig,
    getConnectionRequirements,
    optimizeConnectionSettings,
    
    // Performance and analytics
    estimatePerformance,
    getDataSourceMetrics,
    getDataSourceHealth,
    
    // Security and compliance
    validateSecurityCompliance: (config: SecurityPolicy) => 
      dataSourceApis.validateSecurityCompliance(config),
    encryptCredentials: (credentials: any) => dataSourceApis.encryptCredentials(credentials),
    testConnectionSecurity: (id: string) => dataSourceApis.testConnectionSecurity(id),
    
    // Status and monitoring
    refreshDataSourceStatus: (id: string) => dataSourceApis.refreshDataSourceStatus(id),
    enableDataSource: async (id: string) => {
      await dataSourceApis.updateDataSource(id, { isActive: true })
      queryClient.invalidateQueries({ queryKey: ['dataSources'] })
    },
    disableDataSource: async (id: string) => {
      await dataSourceApis.updateDataSource(id, { isActive: false })
      queryClient.invalidateQueries({ queryKey: ['dataSources'] })
    },
    
    // Advanced operations
    cloneDataSource: (id: string, newName: string) => dataSourceApis.cloneDataSource(id, newName),
    exportDataSourceConfig: (id: string) => dataSourceApis.exportDataSourceConfig(id),
    importDataSourceConfig: (config: any) => dataSourceApis.importDataSourceConfig(config),
    
    // Cross-group integration
    linkToScanRuleSets,
    linkToClassifications,
    linkToComplianceRules,
    
    // Workspace integration
    addToWorkspace: (dataSourceId: string, workspaceId: string) => 
      crossGroupIntegrationAPI.addDataSourceToWorkspace(dataSourceId, workspaceId),
    removeFromWorkspace: (dataSourceId: string, workspaceId: string) => 
      crossGroupIntegrationAPI.removeDataSourceFromWorkspace(dataSourceId, workspaceId),
    getWorkspaceDataSources: (workspaceId: string) => 
      crossGroupIntegrationAPI.getWorkspaceDataSources(workspaceId)
  }), [
    createDataSourceMutation,
    updateDataSourceMutation,
    deleteDataSourceMutation,
    getDataSourceById,
    getDataSourceByName,
    validateDataSourceConfig,
    getConnectionRequirements,
    optimizeConnectionSettings,
    estimatePerformance,
    getDataSourceMetrics,
    getDataSourceHealth,
    linkToScanRuleSets,
    linkToClassifications,
    linkToComplianceRules,
    queryClient
  ])

  // Clear error when operations succeed
  useEffect(() => {
    if (createDataSourceMutation.isSuccess || updateDataSourceMutation.isSuccess || deleteDataSourceMutation.isSuccess) {
      setError(null)
    }
  }, [createDataSourceMutation.isSuccess, updateDataSourceMutation.isSuccess, deleteDataSourceMutation.isSuccess])

  return {
    // Data
    dataSources,
    templates,
    stats,
    
    // Loading states
    loading: dataSourcesLoading || templatesLoading || statsLoading || loading,
    isCreating: createDataSourceMutation.isPending,
    isUpdating: updateDataSourceMutation.isPending,
    isDeleting: deleteDataSourceMutation.isPending,
    
    // Error states
    error: error || dataSourcesError?.message || null,
    
    // Operations
    ...operations,
    
    // Utility functions
    refetch: refetchDataSources,
    clearError: () => setError(null)
  }
}

export default useDataSources
