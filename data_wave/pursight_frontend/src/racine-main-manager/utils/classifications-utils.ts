// ============================================================================
// RACINE MAIN MANAGER - CLASSIFICATIONS UTILITIES
// Comprehensive utility functions for classifications management
// ============================================================================

import {
  Classification,
  ClassificationFramework,
  ClassificationRule,
  ClassificationResult,
  ClassificationStatus,
  ClassificationScope,
  ClassificationMetrics,
  ClassificationCreateRequest,
  ClassificationUpdateRequest
} from '../types/racine-core.types'

// ============================================================================
// CLASSIFICATION VALIDATION UTILITIES
// ============================================================================

/**
 * Validate classification data
 */
export function validateClassification(classification: Partial<Classification>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  if (!classification.name?.trim()) {
    errors.push('Classification name is required')
  }

  if (!classification.type) {
    errors.push('Classification type is required')
  }

  if (!classification.scope) {
    errors.push('Classification scope is required')
  }

  // Name format validation
  if (classification.name && classification.name.length < 3) {
    errors.push('Classification name must be at least 3 characters long')
  }

  if (classification.name && classification.name.length > 100) {
    errors.push('Classification name must be less than 100 characters')
  }

  // Description validation
  if (classification.description && classification.description.length > 500) {
    warnings.push('Classification description is quite long. Consider shortening it.')
  }

  // Tags validation
  if (classification.tags && classification.tags.length > 10) {
    warnings.push('Too many tags. Consider using fewer, more specific tags.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate classification framework
 */
export function validateClassificationFramework(framework: Partial<ClassificationFramework>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  if (!framework.name?.trim()) {
    errors.push('Framework name is required')
  }

  if (!framework.version) {
    errors.push('Framework version is required')
  }

  if (!framework.type) {
    errors.push('Framework type is required')
  }

  // Rules validation
  if (framework.rules && framework.rules.length === 0) {
    warnings.push('Framework has no rules. Add rules to make it functional.')
  }

  if (framework.rules && framework.rules.length > 100) {
    warnings.push('Framework has many rules. Consider organizing them into sub-frameworks.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate classification rule
 */
export function validateClassificationRule(rule: Partial<ClassificationRule>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  if (!rule.name?.trim()) {
    errors.push('Rule name is required')
  }

  if (!rule.pattern && !rule.conditions) {
    errors.push('Rule must have either a pattern or conditions')
  }

  if (!rule.classificationId) {
    errors.push('Rule must be associated with a classification')
  }

  // Pattern validation
  if (rule.pattern) {
    try {
      new RegExp(rule.pattern)
    } catch (e) {
      errors.push('Rule pattern is not a valid regular expression')
    }
  }

  // Confidence threshold validation
  if (rule.confidenceThreshold !== undefined) {
    if (rule.confidenceThreshold < 0 || rule.confidenceThreshold > 1) {
      errors.push('Confidence threshold must be between 0 and 1')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// CLASSIFICATION PROCESSING UTILITIES
// ============================================================================

/**
 * Process classification results
 */
export function processClassificationResults(
  results: ClassificationResult[],
  options: {
    minConfidence?: number
    maxResults?: number
    sortBy?: 'confidence' | 'name' | 'timestamp'
    filterBy?: string[]
  } = {}
): ClassificationResult[] {
  let processedResults = [...results]

  // Filter by minimum confidence
  if (options.minConfidence !== undefined) {
    processedResults = processedResults.filter(
      result => result.confidence >= options.minConfidence!
    )
  }

  // Filter by classification types
  if (options.filterBy && options.filterBy.length > 0) {
    processedResults = processedResults.filter(
      result => options.filterBy!.includes(result.classificationId)
    )
  }

  // Sort results
  if (options.sortBy) {
    processedResults.sort((a, b) => {
      switch (options.sortBy) {
        case 'confidence':
          return b.confidence - a.confidence
        case 'name':
          return (a.classificationName || '').localeCompare(b.classificationName || '')
        case 'timestamp':
          return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        default:
          return 0
      }
    })
  }

  // Limit results
  if (options.maxResults) {
    processedResults = processedResults.slice(0, options.maxResults)
  }

  return processedResults
}

/**
 * Merge classification results from multiple sources
 */
export function mergeClassificationResults(
  resultSets: ClassificationResult[][],
  strategy: 'highest_confidence' | 'consensus' | 'weighted_average' = 'highest_confidence'
): ClassificationResult[] {
  const mergedMap = new Map<string, ClassificationResult[]>()

  // Group results by data item
  resultSets.forEach(results => {
    results.forEach(result => {
      const key = result.dataId || result.id || 'unknown'
      if (!mergedMap.has(key)) {
        mergedMap.set(key, [])
      }
      mergedMap.get(key)!.push(result)
    })
  })

  // Merge results based on strategy
  const mergedResults: ClassificationResult[] = []

  mergedMap.forEach((results, dataId) => {
    let mergedResult: ClassificationResult

    switch (strategy) {
      case 'highest_confidence':
        mergedResult = results.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        )
        break

      case 'consensus':
        // Find the most common classification
        const classificationCounts = new Map<string, number>()
        results.forEach(result => {
          const count = classificationCounts.get(result.classificationId) || 0
          classificationCounts.set(result.classificationId, count + 1)
        })
        
        const mostCommon = Array.from(classificationCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]
        
        mergedResult = results.find(r => r.classificationId === mostCommon[0])!
        break

      case 'weighted_average':
        // Calculate weighted average confidence
        const totalWeight = results.reduce((sum, result) => sum + result.confidence, 0)
        const avgConfidence = totalWeight / results.length
        
        mergedResult = {
          ...results[0],
          confidence: avgConfidence,
          metadata: {
            ...results[0].metadata,
            mergedFrom: results.length,
            strategy: 'weighted_average'
          }
        }
        break

      default:
        mergedResult = results[0]
    }

    mergedResults.push(mergedResult)
  })

  return mergedResults
}

// ============================================================================
// CLASSIFICATION METRICS UTILITIES
// ============================================================================

/**
 * Calculate classification accuracy metrics
 */
export function calculateClassificationAccuracy(
  predictions: ClassificationResult[],
  groundTruth: { dataId: string; correctClassificationId: string }[]
): {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  confusionMatrix: Map<string, Map<string, number>>
} {
  const confusionMatrix = new Map<string, Map<string, number>>()
  let correctPredictions = 0

  // Build confusion matrix
  predictions.forEach(prediction => {
    const truth = groundTruth.find(gt => gt.dataId === prediction.dataId)
    if (!truth) return

    const predicted = prediction.classificationId
    const actual = truth.correctClassificationId

    if (!confusionMatrix.has(actual)) {
      confusionMatrix.set(actual, new Map())
    }
    
    const actualMap = confusionMatrix.get(actual)!
    actualMap.set(predicted, (actualMap.get(predicted) || 0) + 1)

    if (predicted === actual) {
      correctPredictions++
    }
  })

  const accuracy = predictions.length > 0 ? correctPredictions / predictions.length : 0

  // Calculate precision, recall, and F1 score
  let totalPrecision = 0
  let totalRecall = 0
  let classCount = 0

  confusionMatrix.forEach((predictedMap, actualClass) => {
    const truePositives = predictedMap.get(actualClass) || 0
    const falsePositives = Array.from(confusionMatrix.values())
      .reduce((sum, map) => sum + (map.get(actualClass) || 0), 0) - truePositives
    const falseNegatives = Array.from(predictedMap.values())
      .reduce((sum, count) => sum + count, 0) - truePositives

    const precision = truePositives / (truePositives + falsePositives) || 0
    const recall = truePositives / (truePositives + falseNegatives) || 0

    totalPrecision += precision
    totalRecall += recall
    classCount++
  })

  const avgPrecision = classCount > 0 ? totalPrecision / classCount : 0
  const avgRecall = classCount > 0 ? totalRecall / classCount : 0
  const f1Score = avgPrecision + avgRecall > 0 ? 2 * (avgPrecision * avgRecall) / (avgPrecision + avgRecall) : 0

  return {
    accuracy,
    precision: avgPrecision,
    recall: avgRecall,
    f1Score,
    confusionMatrix
  }
}

/**
 * Generate classification performance report
 */
export function generateClassificationReport(
  classifications: Classification[],
  results: ClassificationResult[],
  timeRange: { start: Date; end: Date }
): {
  summary: {
    totalClassifications: number
    totalResults: number
    averageConfidence: number
    topClassifications: { name: string; count: number }[]
  }
  performance: {
    accuracy: number
    throughput: number
    averageProcessingTime: number
  }
  trends: {
    dailyResults: { date: string; count: number }[]
    confidenceDistribution: { range: string; count: number }[]
  }
} {
  const filteredResults = results.filter(result => {
    const resultDate = new Date(result.timestamp || 0)
    return resultDate >= timeRange.start && resultDate <= timeRange.end
  })

  // Summary calculations
  const totalResults = filteredResults.length
  const averageConfidence = totalResults > 0 
    ? filteredResults.reduce((sum, result) => sum + result.confidence, 0) / totalResults
    : 0

  const classificationCounts = new Map<string, number>()
  filteredResults.forEach(result => {
    const count = classificationCounts.get(result.classificationId) || 0
    classificationCounts.set(result.classificationId, count + 1)
  })

  const topClassifications = Array.from(classificationCounts.entries())
    .map(([id, count]) => ({
      name: classifications.find(c => c.id === id)?.name || id,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Performance calculations
  const timeRangeMs = timeRange.end.getTime() - timeRange.start.getTime()
  const throughput = totalResults / (timeRangeMs / (1000 * 60 * 60)) // results per hour

  // Trends calculations
  const dailyResults = new Map<string, number>()
  filteredResults.forEach(result => {
    const date = new Date(result.timestamp || 0).toISOString().split('T')[0]
    dailyResults.set(date, (dailyResults.get(date) || 0) + 1)
  })

  const confidenceRanges = [
    { range: '0.0-0.2', min: 0.0, max: 0.2 },
    { range: '0.2-0.4', min: 0.2, max: 0.4 },
    { range: '0.4-0.6', min: 0.4, max: 0.6 },
    { range: '0.6-0.8', min: 0.6, max: 0.8 },
    { range: '0.8-1.0', min: 0.8, max: 1.0 }
  ]

  const confidenceDistribution = confidenceRanges.map(range => ({
    range: range.range,
    count: filteredResults.filter(result => 
      result.confidence >= range.min && result.confidence < range.max
    ).length
  }))

  return {
    summary: {
      totalClassifications: classifications.length,
      totalResults,
      averageConfidence,
      topClassifications
    },
    performance: {
      accuracy: averageConfidence, // Simplified - would need ground truth for real accuracy
      throughput,
      averageProcessingTime: 0 // Would need timing data
    },
    trends: {
      dailyResults: Array.from(dailyResults.entries()).map(([date, count]) => ({ date, count })),
      confidenceDistribution
    }
  }
}

// ============================================================================
// CLASSIFICATION OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Optimize classification framework
 */
export function optimizeClassificationFramework(
  framework: ClassificationFramework,
  performanceData: ClassificationResult[]
): {
  optimizedFramework: ClassificationFramework
  recommendations: string[]
  expectedImprovement: number
} {
  const recommendations: string[] = []
  const optimizedFramework = { ...framework }

  // Analyze rule performance
  const rulePerformance = new Map<string, { accuracy: number; usage: number }>()
  
  performanceData.forEach(result => {
    if (result.ruleId) {
      const perf = rulePerformance.get(result.ruleId) || { accuracy: 0, usage: 0 }
      perf.accuracy += result.confidence
      perf.usage += 1
      rulePerformance.set(result.ruleId, perf)
    }
  })

  // Calculate average accuracy for each rule
  rulePerformance.forEach((perf, ruleId) => {
    perf.accuracy = perf.accuracy / perf.usage
  })

  // Identify underperforming rules
  const underperformingRules = Array.from(rulePerformance.entries())
    .filter(([_, perf]) => perf.accuracy < 0.7)
    .map(([ruleId, _]) => ruleId)

  if (underperformingRules.length > 0) {
    recommendations.push(`Consider reviewing ${underperformingRules.length} underperforming rules`)
    
    // Remove or modify underperforming rules
    optimizedFramework.rules = optimizedFramework.rules?.filter(rule => 
      !underperformingRules.includes(rule.id!)
    )
  }

  // Identify unused rules
  const usedRuleIds = new Set(Array.from(rulePerformance.keys()))
  const unusedRules = optimizedFramework.rules?.filter(rule => !usedRuleIds.has(rule.id!)) || []

  if (unusedRules.length > 0) {
    recommendations.push(`Consider removing ${unusedRules.length} unused rules`)
    
    // Remove unused rules
    optimizedFramework.rules = optimizedFramework.rules?.filter(rule => 
      usedRuleIds.has(rule.id!)
    )
  }

  // Calculate expected improvement
  const currentAccuracy = Array.from(rulePerformance.values())
    .reduce((sum, perf) => sum + perf.accuracy, 0) / rulePerformance.size

  const optimizedAccuracy = Array.from(rulePerformance.entries())
    .filter(([ruleId, _]) => !underperformingRules.includes(ruleId))
    .reduce((sum, [_, perf]) => sum + perf.accuracy, 0) / 
    (rulePerformance.size - underperformingRules.length)

  const expectedImprovement = optimizedAccuracy - currentAccuracy

  return {
    optimizedFramework,
    recommendations,
    expectedImprovement
  }
}

// ============================================================================
// CLASSIFICATION EXPORT/IMPORT UTILITIES
// ============================================================================

/**
 * Export classifications to various formats
 */
export function exportClassifications(
  classifications: Classification[],
  format: 'json' | 'csv' | 'xml'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(classifications, null, 2)

    case 'csv':
      const headers = ['ID', 'Name', 'Type', 'Scope', 'Status', 'Description', 'Tags', 'Created At']
      const rows = classifications.map(c => [
        c.id || '',
        c.name || '',
        c.type || '',
        c.scope || '',
        c.status || '',
        c.description || '',
        c.tags?.join(';') || '',
        c.createdAt || ''
      ])
      
      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

    case 'xml':
      const xmlItems = classifications.map(c => `
        <classification>
          <id>${c.id || ''}</id>
          <name>${c.name || ''}</name>
          <type>${c.type || ''}</type>
          <scope>${c.scope || ''}</scope>
          <status>${c.status || ''}</status>
          <description>${c.description || ''}</description>
          <tags>${c.tags?.join(',') || ''}</tags>
          <createdAt>${c.createdAt || ''}</createdAt>
        </classification>`).join('')

      return `<?xml version="1.0" encoding="UTF-8"?>\n<classifications>${xmlItems}\n</classifications>`

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Import classifications from JSON
 */
export function importClassifications(
  data: string,
  format: 'json' | 'csv'
): Classification[] {
  switch (format) {
    case 'json':
      return JSON.parse(data) as Classification[]

    case 'csv':
      const lines = data.split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
      
      return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, ''))
        const classification: Partial<Classification> = {}
        
        headers.forEach((header, index) => {
          switch (header.toLowerCase()) {
            case 'id':
              classification.id = values[index]
              break
            case 'name':
              classification.name = values[index]
              break
            case 'type':
              classification.type = values[index] as any
              break
            case 'scope':
              classification.scope = values[index] as ClassificationScope
              break
            case 'status':
              classification.status = values[index] as ClassificationStatus
              break
            case 'description':
              classification.description = values[index]
              break
            case 'tags':
              classification.tags = values[index].split(';').filter(t => t.trim())
              break
            case 'created at':
              classification.createdAt = values[index]
              break
          }
        })
        
        return classification as Classification
      })

    default:
      throw new Error(`Unsupported import format: ${format}`)
  }
}

// ============================================================================
// CLASSIFICATION SEARCH AND FILTER UTILITIES
// ============================================================================

/**
 * Search classifications with advanced filtering
 */
export function searchClassifications(
  classifications: Classification[],
  searchTerm: string,
  filters: {
    type?: string[]
    scope?: ClassificationScope[]
    status?: ClassificationStatus[]
    tags?: string[]
    dateRange?: { start: Date; end: Date }
  } = {}
): Classification[] {
  let filtered = [...classifications]

  // Text search
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase()
    filtered = filtered.filter(c => 
      c.name?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.tags?.some(tag => tag.toLowerCase().includes(term))
    )
  }

  // Type filter
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(c => filters.type!.includes(c.type!))
  }

  // Scope filter
  if (filters.scope && filters.scope.length > 0) {
    filtered = filtered.filter(c => filters.scope!.includes(c.scope!))
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(c => filters.status!.includes(c.status!))
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(c => 
      filters.tags!.some(tag => c.tags?.includes(tag))
    )
  }

  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter(c => {
      if (!c.createdAt) return false
      const date = new Date(c.createdAt)
      return date >= filters.dateRange!.start && date <= filters.dateRange!.end
    })
  }

  return filtered
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const classificationUtils = {
  // Validation
  validateClassification,
  validateClassificationFramework,
  validateClassificationRule,
  
  // Processing
  processClassificationResults,
  mergeClassificationResults,
  
  // Metrics
  calculateClassificationAccuracy,
  generateClassificationReport,
  
  // Optimization
  optimizeClassificationFramework,
  
  // Export/Import
  exportClassifications,
  importClassifications,
  
  // Search
  searchClassifications
}

export default classificationUtils
