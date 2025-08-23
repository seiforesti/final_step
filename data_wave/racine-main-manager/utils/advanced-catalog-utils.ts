// ============================================================================
// RACINE MAIN MANAGER - ADVANCED CATALOG UTILITIES
// Comprehensive utility functions for advanced catalog management
// ============================================================================

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
  CatalogCreateRequest,
  CatalogUpdateRequest,
  CatalogFilters,
  CatalogStats
} from '../types/racine-core.types'

// ============================================================================
// CATALOG ASSET VALIDATION UTILITIES
// ============================================================================

/**
 * Validate catalog asset data
 */
export function validateCatalogAsset(asset: Partial<CatalogAsset>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  if (!asset.name?.trim()) {
    errors.push('Asset name is required')
  }

  if (!asset.type) {
    errors.push('Asset type is required')
  }

  if (!asset.status) {
    errors.push('Asset status is required')
  }

  // Name format validation
  if (asset.name && asset.name.length < 3) {
    errors.push('Asset name must be at least 3 characters long')
  }

  if (asset.name && asset.name.length > 255) {
    errors.push('Asset name must be less than 255 characters')
  }

  // Description validation
  if (asset.description && asset.description.length < 10) {
    warnings.push('Asset description is quite short. Consider adding more details.')
  }

  if (asset.description && asset.description.length > 2000) {
    warnings.push('Asset description is very long. Consider shortening it.')
  }

  // Type-specific validations
  if (asset.type === CatalogAssetType.TABLE || asset.type === CatalogAssetType.VIEW) {
    if (!asset.schema) {
      warnings.push('Table/View assets should include schema information')
    }
  }

  if (asset.type === CatalogAssetType.FILE || asset.type === CatalogAssetType.DATASET) {
    if (!asset.location) {
      warnings.push('File/Dataset assets should include location information')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate catalog metadata
 */
export function validateCatalogMetadata(metadata: Partial<CatalogMetadata>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Size validation
  if (metadata.size !== undefined && metadata.size < 0) {
    errors.push('Size cannot be negative')
  }

  if (metadata.size !== undefined && metadata.size > 1e15) {
    warnings.push('Very large size detected. Please verify.')
  }

  // Row count validation
  if (metadata.rowCount !== undefined && metadata.rowCount < 0) {
    errors.push('Row count cannot be negative')
  }

  // Column count validation
  if (metadata.columnCount !== undefined && metadata.columnCount < 0) {
    errors.push('Column count cannot be negative')
  }

  if (metadata.columnCount !== undefined && metadata.columnCount > 10000) {
    warnings.push('Very high column count detected. Please verify.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// CATALOG PROCESSING UTILITIES
// ============================================================================

/**
 * Process catalog search results
 */
export function processCatalogSearchResults(
  results: any[],
  options: {
    minScore?: number
    maxResults?: number
    sortBy?: 'score' | 'name' | 'type' | 'lastAccessed'
    filterBy?: CatalogAssetType[]
    groupBy?: 'type' | 'status' | 'owner'
  } = {}
): any[] | { [key: string]: any[] } {
  let processedResults = [...results]

  // Filter by minimum score
  if (options.minScore !== undefined) {
    processedResults = processedResults.filter(
      result => result.score >= options.minScore!
    )
  }

  // Filter by asset types
  if (options.filterBy && options.filterBy.length > 0) {
    processedResults = processedResults.filter(
      result => options.filterBy!.includes(result.asset?.type)
    )
  }

  // Sort results
  if (options.sortBy) {
    processedResults.sort((a, b) => {
      switch (options.sortBy) {
        case 'score':
          return b.score - a.score
        case 'name':
          return (a.asset?.name || '').localeCompare(b.asset?.name || '')
        case 'type':
          return (a.asset?.type || '').localeCompare(b.asset?.type || '')
        case 'lastAccessed':
          return new Date(b.asset?.lastAccessed || 0).getTime() - 
                 new Date(a.asset?.lastAccessed || 0).getTime()
        default:
          return 0
      }
    })
  }

  // Group results
  if (options.groupBy) {
    const grouped: { [key: string]: any[] } = {}
    processedResults.forEach(result => {
      let key: string
      switch (options.groupBy) {
        case 'type':
          key = result.asset?.type || 'Unknown Type'
          break
        case 'status':
          key = result.asset?.status || 'Unknown Status'
          break
        case 'owner':
          key = result.asset?.owner || 'Unknown Owner'
          break
        default:
          key = 'All'
      }
      
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(result)
    })
    
    // Limit results per group if specified
    if (options.maxResults) {
      Object.keys(grouped).forEach(key => {
        grouped[key] = grouped[key].slice(0, options.maxResults)
      })
    }
    
    return grouped
  }

  // Limit results
  if (options.maxResults) {
    processedResults = processedResults.slice(0, options.maxResults)
  }

  return processedResults
}

/**
 * Calculate asset quality score
 */
export function calculateAssetQualityScore(
  quality: DataQuality,
  weights: {
    completeness?: number
    accuracy?: number
    consistency?: number
    timeliness?: number
    validity?: number
  } = {}
): {
  overallScore: number
  dimensionScores: { [key: string]: number }
  recommendations: string[]
  issueCount: number
} {
  const defaultWeights = {
    completeness: 0.25,
    accuracy: 0.25,
    consistency: 0.20,
    timeliness: 0.15,
    validity: 0.15,
    ...weights
  }

  const dimensionScores: { [key: string]: number } = {}
  let totalWeightedScore = 0
  let totalWeight = 0

  // Calculate dimension scores
  quality.dimensions?.forEach(dimension => {
    const weight = defaultWeights[dimension.name.toLowerCase() as keyof typeof defaultWeights] || 0.1
    dimensionScores[dimension.name] = dimension.score
    totalWeightedScore += dimension.score * weight
    totalWeight += weight
  })

  const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
  const issueCount = quality.issues?.length || 0

  // Generate recommendations
  const recommendations: string[] = []
  
  if (overallScore < 0.7) {
    recommendations.push('Overall quality score is below acceptable threshold. Review data quality rules.')
  }
  
  quality.dimensions?.forEach(dimension => {
    if (dimension.score < 0.6) {
      recommendations.push(`${dimension.name} score is low (${(dimension.score * 100).toFixed(1)}%). Focus on improving this dimension.`)
    }
  })
  
  if (issueCount > 10) {
    recommendations.push(`High number of quality issues (${issueCount}). Prioritize issue resolution.`)
  }

  quality.issues?.forEach(issue => {
    if (issue.severity === 'critical' || issue.severity === 'high') {
      recommendations.push(`Address ${issue.severity} issue: ${issue.description}`)
    }
  })

  return {
    overallScore,
    dimensionScores,
    recommendations,
    issueCount
  }
}

// ============================================================================
// LINEAGE ANALYSIS UTILITIES
// ============================================================================

/**
 * Analyze data lineage complexity
 */
export function analyzeLineageComplexity(lineage: DataLineage): {
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex'
  upstreamCount: number
  downstreamCount: number
  totalNodes: number
  maxDepth: number
  criticalPaths: string[]
  recommendations: string[]
} {
  const upstreamCount = lineage.upstream?.length || 0
  const downstreamCount = lineage.downstream?.length || 0
  const totalNodes = lineage.graph?.nodes?.length || 0
  
  // Calculate max depth (simplified)
  const maxDepth = Math.max(
    getLineageDepth(lineage.upstream || [], 'upstream'),
    getLineageDepth(lineage.downstream || [], 'downstream')
  )

  // Determine complexity
  let complexity: 'simple' | 'moderate' | 'complex' | 'very_complex'
  if (totalNodes <= 5) {
    complexity = 'simple'
  } else if (totalNodes <= 15) {
    complexity = 'moderate'
  } else if (totalNodes <= 50) {
    complexity = 'complex'
  } else {
    complexity = 'very_complex'
  }

  // Identify critical paths (simplified)
  const criticalPaths = lineage.impact?.criticalPath || []

  // Generate recommendations
  const recommendations: string[] = []
  
  if (complexity === 'very_complex') {
    recommendations.push('Consider breaking down complex lineage into smaller, manageable components')
  }
  
  if (upstreamCount > 10) {
    recommendations.push('High number of upstream dependencies. Review for optimization opportunities.')
  }
  
  if (downstreamCount > 20) {
    recommendations.push('High number of downstream impacts. Changes to this asset may have wide-reaching effects.')
  }
  
  if (maxDepth > 5) {
    recommendations.push('Deep lineage chain detected. Consider intermediate checkpoints or caching.')
  }

  return {
    complexity,
    upstreamCount,
    downstreamCount,
    totalNodes,
    maxDepth,
    criticalPaths,
    recommendations
  }
}

/**
 * Helper function to calculate lineage depth
 */
function getLineageDepth(nodes: any[], direction: 'upstream' | 'downstream', currentDepth = 0): number {
  if (!nodes || nodes.length === 0) {
    return currentDepth
  }

  let maxDepth = currentDepth
  nodes.forEach(node => {
    const childNodes = direction === 'upstream' ? node.upstream : node.downstream
    if (childNodes && childNodes.length > 0) {
      const depth = getLineageDepth(childNodes, direction, currentDepth + 1)
      maxDepth = Math.max(maxDepth, depth)
    }
  })

  return maxDepth
}

// ============================================================================
// USAGE ANALYTICS UTILITIES
// ============================================================================

/**
 * Analyze asset usage patterns
 */
export function analyzeAssetUsage(usage: AssetUsage): {
  usageLevel: 'low' | 'medium' | 'high'
  trend: 'increasing' | 'decreasing' | 'stable'
  peakHours: string[]
  topUsers: string[]
  recommendations: string[]
  insights: string[]
} {
  const totalQueries = usage.totalQueries || 0
  const uniqueUsers = usage.uniqueUsers || 0
  const avgQueriesPerDay = usage.avgQueriesPerDay || 0

  // Determine usage level
  let usageLevel: 'low' | 'medium' | 'high'
  if (totalQueries < 100 || avgQueriesPerDay < 5) {
    usageLevel = 'low'
  } else if (totalQueries < 1000 || avgQueriesPerDay < 50) {
    usageLevel = 'medium'
  } else {
    usageLevel = 'high'
  }

  const trend = usage.usageTrend || 'stable'
  const peakHours = usage.peakUsageTime ? [usage.peakUsageTime] : []
  const topUsers = usage.topConsumers?.slice(0, 5).map(c => c.userName || c.userId) || []

  // Generate recommendations
  const recommendations: string[] = []
  const insights: string[] = []

  if (usageLevel === 'low') {
    recommendations.push('Consider promoting this asset or improving its discoverability')
    insights.push('Asset may be underutilized or difficult to find')
  }

  if (usageLevel === 'high') {
    recommendations.push('Monitor performance and consider optimization')
    insights.push('Popular asset that may benefit from performance tuning')
  }

  if (trend === 'decreasing') {
    recommendations.push('Investigate reasons for declining usage')
    insights.push('Usage trend is declining - may indicate quality or relevance issues')
  }

  if (trend === 'increasing') {
    insights.push('Growing popularity - ensure adequate resources and documentation')
  }

  if (uniqueUsers < 5 && totalQueries > 100) {
    insights.push('High usage concentrated among few users - consider broader adoption strategies')
  }

  if (usage.topConsumers && usage.topConsumers.length > 0) {
    const topConsumer = usage.topConsumers[0]
    if (topConsumer.queryCount > totalQueries * 0.5) {
      insights.push('Single user accounts for majority of usage - potential dependency risk')
    }
  }

  return {
    usageLevel,
    trend,
    peakHours,
    topUsers,
    recommendations,
    insights
  }
}

// ============================================================================
// DISCOVERY AND CLASSIFICATION UTILITIES
// ============================================================================

/**
 * Analyze asset discovery results
 */
export function analyzeAssetDiscovery(discovery: AssetDiscovery): {
  discoveryScore: number
  confidence: number
  recommendations: string[]
  actionItems: string[]
  patterns: string[]
} {
  const totalAssets = discovery.statistics?.totalAssets || 0
  const newAssets = discovery.statistics?.newAssets || 0
  const qualityIssues = discovery.statistics?.qualityIssues || 0
  const missingMetadata = discovery.statistics?.missingMetadata || 0

  // Calculate discovery score
  const discoveryScore = totalAssets > 0 ? 
    ((totalAssets - qualityIssues - missingMetadata) / totalAssets) * 100 : 0

  // Calculate average confidence
  const avgConfidence = discovery.discoveredAssets?.length > 0 ?
    discovery.discoveredAssets.reduce((sum, asset) => sum + asset.confidence, 0) / discovery.discoveredAssets.length : 0

  // Extract patterns
  const patterns = discovery.patterns?.map(p => p.pattern) || []

  // Generate recommendations
  const recommendations: string[] = []
  const actionItems: string[] = []

  if (discoveryScore < 70) {
    recommendations.push('Discovery score is low. Review and improve asset metadata quality.')
  }

  if (avgConfidence < 0.7) {
    recommendations.push('Low average confidence in discovered assets. Manual review recommended.')
  }

  if (newAssets > 0) {
    actionItems.push(`Review and classify ${newAssets} newly discovered assets`)
  }

  if (missingMetadata > 0) {
    actionItems.push(`Add missing metadata for ${missingMetadata} assets`)
  }

  if (qualityIssues > 0) {
    actionItems.push(`Address ${qualityIssues} quality issues in discovered assets`)
  }

  discovery.recommendations?.forEach(rec => {
    if (rec.confidence > 0.8) {
      recommendations.push(`High-confidence recommendation: ${rec.suggestion}`)
    }
  })

  return {
    discoveryScore,
    confidence: avgConfidence,
    recommendations,
    actionItems,
    patterns
  }
}

// ============================================================================
// SEARCH AND FILTERING UTILITIES
// ============================================================================

/**
 * Build advanced search query
 */
export function buildAdvancedSearchQuery(
  searchTerm: string,
  filters: CatalogFilters,
  options: {
    fuzzyMatch?: boolean
    includeMetadata?: boolean
    boostRecent?: boolean
    semanticSearch?: boolean
  } = {}
): CatalogSearch {
  const query: CatalogSearch = {
    query: searchTerm,
    filters,
    facets: [],
    sort: { field: 'score', order: 'desc' },
    pagination: { page: 1, size: 20 }
  }

  // Add facets based on filters
  if (filters.types && filters.types.length > 0) {
    query.facets?.push({
      field: 'type',
      values: filters.types.map(type => ({ value: type, count: 0 }))
    })
  }

  if (filters.statuses && filters.statuses.length > 0) {
    query.facets?.push({
      field: 'status',
      values: filters.statuses.map(status => ({ value: status, count: 0 }))
    })
  }

  if (filters.owners && filters.owners.length > 0) {
    query.facets?.push({
      field: 'owner',
      values: filters.owners.map(owner => ({ value: owner, count: 0 }))
    })
  }

  // Apply options
  if (options.boostRecent) {
    query.sort = { field: 'lastAccessed', order: 'desc' }
  }

  return query
}

/**
 * Filter catalog assets
 */
export function filterCatalogAssets(
  assets: CatalogAsset[],
  filters: CatalogFilters
): CatalogAsset[] {
  let filtered = [...assets]

  // Type filter
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(asset => filters.types!.includes(asset.type))
  }

  // Status filter
  if (filters.statuses && filters.statuses.length > 0) {
    filtered = filtered.filter(asset => filters.statuses!.includes(asset.status))
  }

  // Owner filter
  if (filters.owners && filters.owners.length > 0) {
    filtered = filtered.filter(asset => 
      asset.owner && filters.owners!.includes(asset.owner)
    )
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(asset => 
      asset.tags && asset.tags.some(tag => 
        filters.tags!.includes(tag.key) || filters.tags!.includes(tag.value)
      )
    )
  }

  // Sources filter
  if (filters.sources && filters.sources.length > 0) {
    filtered = filtered.filter(asset => 
      asset.source && filters.sources!.includes(asset.source)
    )
  }

  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter(asset => {
      if (!asset.createdAt) return false
      const date = new Date(asset.createdAt)
      return date >= filters.dateRange!.start && date <= filters.dateRange!.end
    })
  }

  // Quality score filter
  if (filters.qualityScore) {
    filtered = filtered.filter(asset => {
      const score = asset.quality?.overallScore || 0
      return (!filters.qualityScore!.min || score >= filters.qualityScore!.min) &&
             (!filters.qualityScore!.max || score <= filters.qualityScore!.max)
    })
  }

  // Usage level filter
  if (filters.usageLevel) {
    filtered = filtered.filter(asset => {
      const queries = asset.usage?.totalQueries || 0
      switch (filters.usageLevel) {
        case 'high': return queries > 1000
        case 'medium': return queries >= 100 && queries <= 1000
        case 'low': return queries < 100
        default: return true
      }
    })
  }

  return filtered
}

// ============================================================================
// EXPORT/IMPORT UTILITIES
// ============================================================================

/**
 * Export catalog data
 */
export function exportCatalogData(
  assets: CatalogAsset[],
  format: 'json' | 'csv' | 'xml'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(assets, null, 2)

    case 'csv':
      const headers = ['ID', 'Name', 'Type', 'Status', 'Owner', 'Description', 'Created At', 'Last Accessed']
      const rows = assets.map(asset => [
        asset.id || '',
        asset.name || '',
        asset.type || '',
        asset.status || '',
        asset.owner || '',
        asset.description || '',
        asset.createdAt || '',
        asset.lastAccessed || ''
      ])
      
      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

    case 'xml':
      const xmlAssets = assets.map(asset => `
        <asset>
          <id>${asset.id || ''}</id>
          <name>${asset.name || ''}</name>
          <type>${asset.type || ''}</type>
          <status>${asset.status || ''}</status>
          <owner>${asset.owner || ''}</owner>
          <description>${asset.description || ''}</description>
          <createdAt>${asset.createdAt || ''}</createdAt>
          <lastAccessed>${asset.lastAccessed || ''}</lastAccessed>
        </asset>`).join('')

      return `<?xml version="1.0" encoding="UTF-8"?>\n<catalog>${xmlAssets}</catalog>`

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Generate catalog statistics
 */
export function generateCatalogStatistics(assets: CatalogAsset[]): CatalogStats {
  const totalAssets = assets.length
  
  // Assets by type
  const assetsByType: Record<CatalogAssetType, number> = {} as Record<CatalogAssetType, number>
  Object.values(CatalogAssetType).forEach(type => {
    assetsByType[type] = assets.filter(asset => asset.type === type).length
  })

  // Assets by status
  const assetsByStatus: Record<AssetStatus, number> = {} as Record<AssetStatus, number>
  Object.values(AssetStatus).forEach(status => {
    assetsByStatus[status] = assets.filter(asset => asset.status === status).length
  })

  // Quality distribution
  const qualityDistribution = {
    excellent: assets.filter(a => (a.quality?.overallScore || 0) >= 0.9).length,
    good: assets.filter(a => (a.quality?.overallScore || 0) >= 0.7 && (a.quality?.overallScore || 0) < 0.9).length,
    fair: assets.filter(a => (a.quality?.overallScore || 0) >= 0.5 && (a.quality?.overallScore || 0) < 0.7).length,
    poor: assets.filter(a => (a.quality?.overallScore || 0) < 0.5).length
  }

  // Usage statistics
  const totalQueries = assets.reduce((sum, asset) => sum + (asset.usage?.totalQueries || 0), 0)
  const activeUsers = new Set(
    assets.flatMap(asset => asset.usage?.topConsumers?.map(c => c.userId) || [])
  ).size

  const usageStats = {
    totalQueries,
    activeUsers,
    topAssets: assets
      .filter(asset => asset.usage?.totalQueries)
      .sort((a, b) => (b.usage?.totalQueries || 0) - (a.usage?.totalQueries || 0))
      .slice(0, 10)
      .map(asset => ({
        assetId: asset.id || '',
        assetName: asset.name || '',
        queryCount: asset.usage?.totalQueries || 0,
        userCount: asset.usage?.uniqueUsers || 0
      })),
    usageTrends: []
  }

  // Governance statistics
  const governanceStats = {
    governedAssets: assets.filter(asset => asset.governance).length,
    ungoverned: assets.filter(asset => !asset.governance).length,
    pendingApproval: assets.filter(asset => asset.status === AssetStatus.PENDING).length,
    complianceRate: totalAssets > 0 ? 
      (assets.filter(asset => asset.governance?.compliance?.some(c => c.status === 'compliant')).length / totalAssets) * 100 : 0
  }

  return {
    totalAssets,
    assetsByType,
    assetsByStatus,
    qualityDistribution,
    usageStats,
    governanceStats,
    recentActivity: []
  }
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const advancedCatalogUtils = {
  // Validation
  validateCatalogAsset,
  validateCatalogMetadata,
  
  // Processing
  processCatalogSearchResults,
  calculateAssetQualityScore,
  
  // Lineage Analysis
  analyzeLineageComplexity,
  
  // Usage Analytics
  analyzeAssetUsage,
  
  // Discovery
  analyzeAssetDiscovery,
  
  // Search and Filtering
  buildAdvancedSearchQuery,
  filterCatalogAssets,
  
  // Export/Import
  exportCatalogData,
  generateCatalogStatistics
}

export default advancedCatalogUtils