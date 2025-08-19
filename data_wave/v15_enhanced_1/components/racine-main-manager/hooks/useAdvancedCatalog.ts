'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import advanced catalog APIs
import { racineAdvancedCatalogAPI } from '../services/advanced-catalog-apis'
import { crossGroupIntegrationApis } from '../services/cross-group-integration-apis'

// Import types
import {
  CatalogAsset,
  CatalogAssetType,
  AssetStatus,
  CatalogMetadata,
  DataLineage,
  AssetProfile,
  DataQuality,
  AssetUsage,
  CatalogSearch,
  AssetDiscovery,
  SemanticSearch,
  CatalogCreateRequest,
  CatalogUpdateRequest,
  CatalogFilters,
  CatalogStats,
  OperationStatus
} from '../types/racine-core.types'

interface UseAdvancedCatalogOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealTimeUpdates?: boolean
  enableSemanticSearch?: boolean
  enableAIRecommendations?: boolean
}

interface AdvancedCatalogOperations {
  // Core CRUD operations
  createAsset: (request: CatalogCreateRequest) => Promise<CatalogAsset>
  updateAsset: (id: string, updates: CatalogUpdateRequest) => Promise<CatalogAsset>
  deleteAsset: (id: string) => Promise<void>
  
  // Search operations
  searchAssets: (searchQuery: CatalogSearch) => Promise<any>
  semanticSearch: (query: string, options?: any) => Promise<SemanticSearch>
  getSearchSuggestions: (query: string) => Promise<string[]>
  
  // Discovery operations
  discoverAssets: (sources?: string[]) => Promise<AssetDiscovery>
  getDiscoveryRecommendations: (assetId?: string) => Promise<any[]>
  autoClassifyAssets: (assetIds: string[]) => Promise<any[]>
  
  // Quality operations
  getAssetQuality: (assetId: string) => Promise<DataQuality>
  runQualityAssessment: (assetId: string, rules?: string[]) => Promise<DataQuality>
  getQualityRules: () => Promise<any[]>
  createQualityRule: (rule: any) => Promise<any>
  
  // Profiling operations
  getAssetProfile: (assetId: string) => Promise<AssetProfile>
  runDataProfiling: (assetId: string, options?: any) => Promise<AssetProfile>
  getColumnProfile: (assetId: string, columnName: string) => Promise<any>
  
  // Lineage operations
  getAssetLineage: (assetId: string, depth?: number) => Promise<DataLineage>
  getLineageGraph: (assetId: string, options?: any) => Promise<any>
  getImpactAnalysis: (assetId: string) => Promise<any>
  updateLineage: (assetId: string, lineageData: any) => Promise<DataLineage>
  
  // AI operations
  getAIRecommendations: (assetId: string, type?: string) => Promise<any[]>
  generateAssetDescription: (assetId: string) => Promise<string>
  suggestTags: (assetId: string) => Promise<string[]>
  findSimilarAssets: (assetId: string, limit?: number) => Promise<CatalogAsset[]>
  
  // Analytics operations
  getCatalogAnalytics: (timeRange?: string) => Promise<any>
  getAssetUsageAnalytics: (assetId: string, timeRange?: string) => Promise<AssetUsage>
  getPopularAssets: (limit?: number, timeRange?: string) => Promise<CatalogAsset[]>
  
  // Collaboration operations
  getAssetComments: (assetId: string) => Promise<any[]>
  addAssetComment: (assetId: string, comment: string) => Promise<any>
  getAssetRatings: (assetId: string) => Promise<any>
  rateAsset: (assetId: string, rating: number, review?: string) => Promise<any>
  
  // Bulk operations
  bulkUpdateAssets: (updates: Array<{ id: string; updates: CatalogUpdateRequest }>) => Promise<CatalogAsset[]>
  bulkDeleteAssets: (ids: string[]) => Promise<void>
  bulkTagAssets: (assetIds: string[], tags: any[]) => Promise<void>
  
  // Cross-SPA integration
  linkToDataSources: (assetId: string, dataSourceIds: string[]) => Promise<void>
  linkToClassifications: (assetId: string, classificationIds: string[]) => Promise<void>
  linkToComplianceRules: (assetId: string, complianceRuleIds: string[]) => Promise<void>
  getCrossSPADependencies: (assetId: string) => Promise<any>
  getCrossSPAUsage: (assetId: string) => Promise<any>
  
  // Export operations
  generateCatalogReport: (config: any) => Promise<any>
  exportCatalogData: (format: 'json' | 'csv' | 'excel', filters?: CatalogFilters) => Promise<Blob>
}

export function useAdvancedCatalog(options: UseAdvancedCatalogOptions = {}) {
  const { 
    autoRefresh = true, 
    refreshInterval = 30000, 
    enableRealTimeUpdates = true,
    enableSemanticSearch = true,
    enableAIRecommendations = true
  } = options
  
  const queryClient = useQueryClient()
  
  // Local state
  const [operationStatus, setOperationStatus] = useState<OperationStatus>('idle')
  const [realTimeUpdates, setRealTimeUpdates] = useState<any[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // ============================================================================
  // CORE QUERIES
  // ============================================================================

  // Get all catalog assets
  const { 
    data: catalogAssets, 
    isLoading: isLoadingAssets, 
    error: assetsError,
    refetch: refetchAssets
  } = useQuery({
    queryKey: ['racine-catalog-assets'],
    queryFn: () => racineAdvancedCatalogAPI.getAllAssets(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get catalog statistics
  const { 
    data: catalogStats, 
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ['racine-catalog-stats'],
    queryFn: () => racineAdvancedCatalogAPI.getCatalogStats(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get catalog analytics
  const { 
    data: catalogAnalytics, 
    isLoading: isLoadingAnalytics 
  } = useQuery({
    queryKey: ['racine-catalog-analytics'],
    queryFn: () => racineAdvancedCatalogAPI.getCatalogAnalytics(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get popular assets
  const { 
    data: popularAssets, 
    isLoading: isLoadingPopular 
  } = useQuery({
    queryKey: ['racine-catalog-popular'],
    queryFn: () => racineAdvancedCatalogAPI.getPopularAssets(10),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Get quality rules
  const { 
    data: qualityRules, 
    isLoading: isLoadingQualityRules,
    refetch: refetchQualityRules
  } = useQuery({
    queryKey: ['racine-catalog-quality-rules'],
    queryFn: () => racineAdvancedCatalogAPI.getQualityRules(),
    enabled: autoRefresh,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: (request: CatalogCreateRequest) => racineAdvancedCatalogAPI.createAsset(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-catalog-assets'] })
      queryClient.invalidateQueries({ queryKey: ['racine-catalog-stats'] })
    },
    onError: (error) => {
      console.error('Error creating catalog asset:', error)
    }
  })

  // Update asset mutation
  const updateAssetMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CatalogUpdateRequest }) => 
      racineAdvancedCatalogAPI.updateAsset(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-catalog-assets'] })
    },
    onError: (error) => {
      console.error('Error updating catalog asset:', error)
    }
  })

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => racineAdvancedCatalogAPI.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['racine-catalog-assets'] })
      queryClient.invalidateQueries({ queryKey: ['racine-catalog-stats'] })
    },
    onError: (error) => {
      console.error('Error deleting catalog asset:', error)
    }
  })

  // ============================================================================
  // OPERATION HANDLERS
  // ============================================================================

  const createAsset = useCallback(async (request: CatalogCreateRequest): Promise<CatalogAsset> => {
    setOperationStatus('loading')
    try {
      const result = await createAssetMutation.mutateAsync(request)
      setOperationStatus('success')
      return result
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [createAssetMutation])

  const updateAsset = useCallback(async (id: string, updates: CatalogUpdateRequest): Promise<CatalogAsset> => {
    setOperationStatus('loading')
    try {
      const result = await updateAssetMutation.mutateAsync({ id, updates })
      setOperationStatus('success')
      return result
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [updateAssetMutation])

  const deleteAsset = useCallback(async (id: string): Promise<void> => {
    setOperationStatus('loading')
    try {
      await deleteAssetMutation.mutateAsync(id)
      setOperationStatus('success')
    } catch (error) {
      setOperationStatus('error')
      throw error
    }
  }, [deleteAssetMutation])

  // Search operations
  const searchAssets = useCallback(async (searchQuery: CatalogSearch): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.searchAssets(searchQuery)
    
    // Update search history
    if (searchQuery.query && !searchHistory.includes(searchQuery.query)) {
      setSearchHistory(prev => [searchQuery.query, ...prev.slice(0, 9)])
    }
    
    return result
  }, [searchHistory])

  const semanticSearch = useCallback(async (query: string, options?: any): Promise<SemanticSearch> => {
    if (!enableSemanticSearch) {
      throw new Error('Semantic search is disabled')
    }
    return await racineAdvancedCatalogAPI.semanticSearch(query, options)
  }, [enableSemanticSearch])

  const getSearchSuggestions = useCallback(async (query: string): Promise<string[]> => {
    const result = await racineAdvancedCatalogAPI.getSearchSuggestions(query)
    return result.data || []
  }, [])

  // Discovery operations
  const discoverAssets = useCallback(async (sources?: string[]): Promise<AssetDiscovery> => {
    const result = await racineAdvancedCatalogAPI.discoverAssets(sources)
    return result.data!
  }, [])

  const getDiscoveryRecommendations = useCallback(async (assetId?: string): Promise<any[]> => {
    const result = await racineAdvancedCatalogAPI.getDiscoveryRecommendations(assetId)
    return result.data || []
  }, [])

  const autoClassifyAssets = useCallback(async (assetIds: string[]): Promise<any[]> => {
    const result = await racineAdvancedCatalogAPI.autoClassifyAssets(assetIds)
    return result.data || []
  }, [])

  // Quality operations
  const getAssetQuality = useCallback(async (assetId: string): Promise<DataQuality> => {
    const result = await racineAdvancedCatalogAPI.getAssetQuality(assetId)
    return result.data!
  }, [])

  const runQualityAssessment = useCallback(async (assetId: string, rules?: string[]): Promise<DataQuality> => {
    const result = await racineAdvancedCatalogAPI.runQualityAssessment(assetId, rules)
    return result.data!
  }, [])

  const getQualityRules = useCallback(async (): Promise<any[]> => {
    const result = await racineAdvancedCatalogAPI.getQualityRules()
    return result.data || []
  }, [])

  const createQualityRule = useCallback(async (rule: any): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.createQualityRule(rule)
    await refetchQualityRules()
    return result.data
  }, [refetchQualityRules])

  // Profiling operations
  const getAssetProfile = useCallback(async (assetId: string): Promise<AssetProfile> => {
    const result = await racineAdvancedCatalogAPI.getAssetProfile(assetId)
    return result.data!
  }, [])

  const runDataProfiling = useCallback(async (assetId: string, options?: any): Promise<AssetProfile> => {
    const result = await racineAdvancedCatalogAPI.runDataProfiling(assetId, options)
    return result.data!
  }, [])

  const getColumnProfile = useCallback(async (assetId: string, columnName: string): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.getColumnProfile(assetId, columnName)
    return result.data
  }, [])

  // Lineage operations
  const getAssetLineage = useCallback(async (assetId: string, depth?: number): Promise<DataLineage> => {
    const result = await racineAdvancedCatalogAPI.getAssetLineage(assetId, depth)
    return result.data!
  }, [])

  const getLineageGraph = useCallback(async (assetId: string, options?: any): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.getLineageGraph(assetId, options)
    return result.data
  }, [])

  const getImpactAnalysis = useCallback(async (assetId: string): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.getImpactAnalysis(assetId)
    return result.data
  }, [])

  const updateLineage = useCallback(async (assetId: string, lineageData: any): Promise<DataLineage> => {
    const result = await racineAdvancedCatalogAPI.updateLineage(assetId, lineageData)
    return result.data!
  }, [])

  // AI operations
  const getAIRecommendations = useCallback(async (assetId: string, type?: string): Promise<any[]> => {
    if (!enableAIRecommendations) {
      throw new Error('AI recommendations are disabled')
    }
    const result = await racineAdvancedCatalogAPI.getAIRecommendations(assetId, type)
    return result.data || []
  }, [enableAIRecommendations])

  const generateAssetDescription = useCallback(async (assetId: string): Promise<string> => {
    const result = await racineAdvancedCatalogAPI.generateAssetDescription(assetId)
    return result.data || ''
  }, [])

  const suggestTags = useCallback(async (assetId: string): Promise<string[]> => {
    const result = await racineAdvancedCatalogAPI.suggestTags(assetId)
    return result.data || []
  }, [])

  const findSimilarAssets = useCallback(async (assetId: string, limit?: number): Promise<CatalogAsset[]> => {
    const result = await racineAdvancedCatalogAPI.findSimilarAssets(assetId, limit)
    return result.data || []
  }, [])

  // Analytics operations
  const getCatalogAnalytics = useCallback(async (timeRange?: string): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.getCatalogAnalytics(timeRange)
    return result.data
  }, [])

  const getAssetUsageAnalytics = useCallback(async (assetId: string, timeRange?: string): Promise<AssetUsage> => {
    const result = await racineAdvancedCatalogAPI.getAssetUsageAnalytics(assetId, timeRange)
    return result.data!
  }, [])

  const getPopularAssets = useCallback(async (limit?: number, timeRange?: string): Promise<CatalogAsset[]> => {
    const result = await racineAdvancedCatalogAPI.getPopularAssets(limit, timeRange)
    return result.data || []
  }, [])

  // Collaboration operations
  const getAssetComments = useCallback(async (assetId: string): Promise<any[]> => {
    const result = await racineAdvancedCatalogAPI.getAssetComments(assetId)
    return result.data || []
  }, [])

  const addAssetComment = useCallback(async (assetId: string, comment: string): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.addAssetComment(assetId, comment)
    return result.data
  }, [])

  const getAssetRatings = useCallback(async (assetId: string): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.getAssetRatings(assetId)
    return result.data
  }, [])

  const rateAsset = useCallback(async (assetId: string, rating: number, review?: string): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.rateAsset(assetId, rating, review)
    return result.data
  }, [])

  // Bulk operations
  const bulkUpdateAssets = useCallback(async (updates: Array<{ id: string; updates: CatalogUpdateRequest }>): Promise<CatalogAsset[]> => {
    const result = await racineAdvancedCatalogAPI.bulkUpdateAssets(updates)
    await refetchAssets()
    return result.data || []
  }, [refetchAssets])

  const bulkDeleteAssets = useCallback(async (ids: string[]): Promise<void> => {
    await racineAdvancedCatalogAPI.bulkDeleteAssets(ids)
    await refetchAssets()
  }, [refetchAssets])

  const bulkTagAssets = useCallback(async (assetIds: string[], tags: any[]): Promise<void> => {
    await racineAdvancedCatalogAPI.bulkTagAssets(assetIds, tags)
    await refetchAssets()
  }, [refetchAssets])

  // Cross-SPA integration
  const linkToDataSources = useCallback(async (assetId: string, dataSourceIds: string[]): Promise<void> => {
    try {
      await racineAdvancedCatalogAPI.linkToDataSources(assetId, dataSourceIds)
      await crossGroupIntegrationApis.syncCatalogAssetWithDataSources(assetId, dataSourceIds)
    } catch (error) {
      console.error('Error linking to data sources:', error)
      throw error
    }
  }, [])

  const linkToClassifications = useCallback(async (assetId: string, classificationIds: string[]): Promise<void> => {
    try {
      await racineAdvancedCatalogAPI.linkToClassifications(assetId, classificationIds)
      await crossGroupIntegrationApis.syncCatalogAssetWithClassifications(assetId, classificationIds)
    } catch (error) {
      console.error('Error linking to classifications:', error)
      throw error
    }
  }, [])

  const linkToComplianceRules = useCallback(async (assetId: string, complianceRuleIds: string[]): Promise<void> => {
    try {
      await racineAdvancedCatalogAPI.linkToComplianceRules(assetId, complianceRuleIds)
      await crossGroupIntegrationApis.syncCatalogAssetWithComplianceRules(assetId, complianceRuleIds)
    } catch (error) {
      console.error('Error linking to compliance rules:', error)
      throw error
    }
  }, [])

  const getCrossSPADependencies = useCallback(async (assetId: string): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.getCrossSPADependencies(assetId)
    return result.data
  }, [])

  const getCrossSPAUsage = useCallback(async (assetId: string): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.getCrossSPAUsage(assetId)
    return result.data
  }, [])

  // Export operations
  const generateCatalogReport = useCallback(async (config: any): Promise<any> => {
    const result = await racineAdvancedCatalogAPI.generateCatalogReport(config)
    return result.data
  }, [])

  const exportCatalogData = useCallback(async (format: 'json' | 'csv' | 'excel', filters?: CatalogFilters): Promise<Blob> => {
    const result = await racineAdvancedCatalogAPI.exportCatalogData(format, filters)
    return result.data!
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const computedValues = useMemo(() => {
    const assetsData = catalogAssets?.data?.items || []
    const statsData = catalogStats?.data || {}
    const analyticsData = catalogAnalytics?.data || {}
    const popularData = popularAssets?.data || []

    return {
      totalAssets: assetsData.length,
      assetsByType: statsData.assetsByType || {},
      assetsByStatus: statsData.assetsByStatus || {},
      qualityDistribution: statsData.qualityDistribution || {},
      usageStats: statsData.usageStats || {},
      governanceStats: statsData.governanceStats || {},
      topAssets: popularData.slice(0, 5),
      searchSuggestions: searchHistory,
      catalogHealth: analyticsData.health || 'unknown',
      totalQualityRules: qualityRules?.data?.length || 0,
      recentActivity: statsData.recentActivity || []
    }
  }, [catalogAssets, catalogStats, catalogAnalytics, popularAssets, qualityRules, searchHistory])

  // ============================================================================
  // OPERATIONS OBJECT
  // ============================================================================

  const operations: AdvancedCatalogOperations = {
    createAsset,
    updateAsset,
    deleteAsset,
    searchAssets,
    semanticSearch,
    getSearchSuggestions,
    discoverAssets,
    getDiscoveryRecommendations,
    autoClassifyAssets,
    getAssetQuality,
    runQualityAssessment,
    getQualityRules,
    createQualityRule,
    getAssetProfile,
    runDataProfiling,
    getColumnProfile,
    getAssetLineage,
    getLineageGraph,
    getImpactAnalysis,
    updateLineage,
    getAIRecommendations,
    generateAssetDescription,
    suggestTags,
    findSimilarAssets,
    getCatalogAnalytics,
    getAssetUsageAnalytics,
    getPopularAssets,
    getAssetComments,
    addAssetComment,
    getAssetRatings,
    rateAsset,
    bulkUpdateAssets,
    bulkDeleteAssets,
    bulkTagAssets,
    linkToDataSources,
    linkToClassifications,
    linkToComplianceRules,
    getCrossSPADependencies,
    getCrossSPAUsage,
    generateCatalogReport,
    exportCatalogData
  }

  return {
    // Data
    catalogAssets: catalogAssets?.data?.items || [],
    catalogStats: catalogStats?.data,
    catalogAnalytics: catalogAnalytics?.data,
    popularAssets: popularAssets?.data || [],
    qualityRules: qualityRules?.data || [],
    
    // Loading states
    isLoading: isLoadingAssets || isLoadingStats || isLoadingAnalytics || isLoadingPopular || isLoadingQualityRules,
    isLoadingAssets,
    isLoadingStats,
    isLoadingAnalytics,
    isLoadingPopular,
    isLoadingQualityRules,
    
    // Error states
    error: assetsError,
    
    // Operation status
    operationStatus,
    
    // Real-time updates
    realTimeUpdates,
    
    // Search history
    searchHistory,
    
    // Computed values
    ...computedValues,
    
    // Operations
    ...operations,
    
    // Utility functions
    refetch: () => {
      refetchAssets()
      refetchQualityRules()
    },
    
    // Health check
    getServiceHealth: () => racineAdvancedCatalogAPI.getServiceHealth(),
    getSystemStatus: () => racineAdvancedCatalogAPI.getSystemStatus()
  }
}

export default useAdvancedCatalog