// ============================================================================
// RACINE MAIN MANAGER - COMPLIANCE RULES UTILITIES
// Comprehensive utility functions for compliance rules management
// ============================================================================

import {
  ComplianceRule,
  ComplianceFramework,
  ComplianceAudit,
  ComplianceResult,
  ComplianceStatus,
  ComplianceRisk,
  ComplianceMetrics,
  ComplianceCreateRequest,
  ComplianceUpdateRequest
} from '../types/racine-core.types'

// ============================================================================
// COMPLIANCE RULE VALIDATION UTILITIES
// ============================================================================

/**
 * Validate compliance rule data
 */
export function validateComplianceRule(rule: Partial<ComplianceRule>): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  if (!rule.name?.trim()) {
    errors.push('Compliance rule name is required')
  }

  if (!rule.type) {
    errors.push('Compliance rule type is required')
  }

  if (!rule.framework) {
    errors.push('Compliance framework is required')
  }

  if (!rule.description?.trim()) {
    errors.push('Compliance rule description is required')
  }

  // Name format validation
  if (rule.name && rule.name.length < 5) {
    errors.push('Compliance rule name must be at least 5 characters long')
  }

  if (rule.name && rule.name.length > 200) {
    errors.push('Compliance rule name must be less than 200 characters')
  }

  // Description validation
  if (rule.description && rule.description.length < 10) {
    warnings.push('Compliance rule description is quite short. Consider adding more details.')
  }

  if (rule.description && rule.description.length > 1000) {
    warnings.push('Compliance rule description is very long. Consider shortening it.')
  }

  // Severity validation
  if (rule.severity && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rule.severity)) {
    errors.push('Invalid severity level. Must be LOW, MEDIUM, HIGH, or CRITICAL')
  }

  // Conditions validation
  if (rule.conditions && rule.conditions.length === 0) {
    warnings.push('Compliance rule has no conditions. Add conditions to make it functional.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate compliance framework
 */
export function validateComplianceFramework(framework: Partial<ComplianceFramework>): {
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

  if (!framework.standard) {
    errors.push('Compliance standard is required')
  }

  // Rules validation
  if (framework.rules && framework.rules.length === 0) {
    warnings.push('Framework has no rules. Add rules to make it functional.')
  }

  if (framework.rules && framework.rules.length > 500) {
    warnings.push('Framework has many rules. Consider organizing them into sub-frameworks.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// COMPLIANCE PROCESSING UTILITIES
// ============================================================================

/**
 * Process compliance results
 */
export function processComplianceResults(
  results: ComplianceResult[],
  options: {
    minScore?: number
    maxResults?: number
    sortBy?: 'score' | 'severity' | 'timestamp' | 'name'
    filterBy?: string[]
    groupBy?: 'framework' | 'severity' | 'status'
  } = {}
): ComplianceResult[] | { [key: string]: ComplianceResult[] } {
  let processedResults = [...results]

  // Filter by minimum score
  if (options.minScore !== undefined) {
    processedResults = processedResults.filter(
      result => result.complianceScore >= options.minScore!
    )
  }

  // Filter by rule types
  if (options.filterBy && options.filterBy.length > 0) {
    processedResults = processedResults.filter(
      result => options.filterBy!.includes(result.ruleType || '')
    )
  }

  // Sort results
  if (options.sortBy) {
    processedResults.sort((a, b) => {
      switch (options.sortBy) {
        case 'score':
          return b.complianceScore - a.complianceScore
        case 'severity':
          const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                 (severityOrder[a.severity as keyof typeof severityOrder] || 0)
        case 'timestamp':
          return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        case 'name':
          return (a.ruleName || '').localeCompare(b.ruleName || '')
        default:
          return 0
      }
    })
  }

  // Group results
  if (options.groupBy) {
    const grouped: { [key: string]: ComplianceResult[] } = {}
    processedResults.forEach(result => {
      let key: string
      switch (options.groupBy) {
        case 'framework':
          key = result.frameworkName || 'Unknown Framework'
          break
        case 'severity':
          key = result.severity || 'Unknown Severity'
          break
        case 'status':
          key = result.status || 'Unknown Status'
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
 * Calculate compliance score
 */
export function calculateComplianceScore(
  results: ComplianceResult[],
  weights: {
    critical?: number
    high?: number
    medium?: number
    low?: number
  } = {}
): {
  overallScore: number
  severityBreakdown: { [key: string]: number }
  passRate: number
  failureCount: number
  recommendations: string[]
} {
  const defaultWeights = {
    critical: 0.4,
    high: 0.3,
    medium: 0.2,
    low: 0.1,
    ...weights
  }

  const severityBreakdown = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  }

  let totalWeightedScore = 0
  let totalWeight = 0
  let passedRules = 0
  let failedRules = 0

  results.forEach(result => {
    const severity = result.severity as keyof typeof severityBreakdown
    if (severity && severityBreakdown.hasOwnProperty(severity)) {
      severityBreakdown[severity]++
    }

    const weight = defaultWeights[severity?.toLowerCase() as keyof typeof defaultWeights] || 0.1
    totalWeightedScore += result.complianceScore * weight
    totalWeight += weight

    if (result.status === 'PASSED' || result.complianceScore >= 0.8) {
      passedRules++
    } else {
      failedRules++
    }
  })

  const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
  const passRate = results.length > 0 ? passedRules / results.length : 0

  // Generate recommendations
  const recommendations: string[] = []
  
  if (overallScore < 0.6) {
    recommendations.push('Overall compliance score is below acceptable threshold. Immediate action required.')
  }
  
  if (severityBreakdown.CRITICAL > 0) {
    recommendations.push(`${severityBreakdown.CRITICAL} critical compliance issues need immediate attention.`)
  }
  
  if (severityBreakdown.HIGH > 5) {
    recommendations.push('High number of high-severity issues. Consider prioritizing remediation efforts.')
  }
  
  if (passRate < 0.8) {
    recommendations.push('Pass rate is below 80%. Review and update compliance rules.')
  }

  return {
    overallScore,
    severityBreakdown,
    passRate,
    failureCount: failedRules,
    recommendations
  }
}

// ============================================================================
// RISK ASSESSMENT UTILITIES
// ============================================================================

/**
 * Assess compliance risks
 */
export function assessComplianceRisks(
  results: ComplianceResult[],
  rules: ComplianceRule[],
  historicalData?: ComplianceResult[]
): {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  riskScore: number
  riskFactors: string[]
  recommendations: string[]
  trends: { improving: boolean; trend: number }
} {
  let riskScore = 0
  const riskFactors: string[] = []
  const recommendations: string[] = []

  // Analyze current results
  const criticalFailures = results.filter(r => r.severity === 'CRITICAL' && r.status === 'FAILED').length
  const highFailures = results.filter(r => r.severity === 'HIGH' && r.status === 'FAILED').length
  const totalFailures = results.filter(r => r.status === 'FAILED').length

  // Calculate base risk score
  riskScore += criticalFailures * 40
  riskScore += highFailures * 20
  riskScore += totalFailures * 5

  // Risk factors analysis
  if (criticalFailures > 0) {
    riskFactors.push(`${criticalFailures} critical compliance failures`)
    recommendations.push('Address critical compliance failures immediately')
  }

  if (highFailures > 3) {
    riskFactors.push(`${highFailures} high-severity compliance failures`)
    recommendations.push('Prioritize high-severity compliance issues')
  }

  const failureRate = results.length > 0 ? totalFailures / results.length : 0
  if (failureRate > 0.3) {
    riskFactors.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`)
    recommendations.push('Review and update compliance framework')
  }

  // Analyze rule coverage
  const activeRules = rules.filter(r => r.status === ComplianceStatus.ACTIVE).length
  const totalRules = rules.length
  const coverageRate = totalRules > 0 ? activeRules / totalRules : 0

  if (coverageRate < 0.8) {
    riskFactors.push('Low rule coverage')
    recommendations.push('Activate more compliance rules for better coverage')
  }

  // Historical trend analysis
  let trends = { improving: false, trend: 0 }
  if (historicalData && historicalData.length > 0) {
    const historicalScore = calculateComplianceScore(historicalData).overallScore
    const currentScore = calculateComplianceScore(results).overallScore
    trends.trend = currentScore - historicalScore
    trends.improving = trends.trend > 0
    
    if (!trends.improving && Math.abs(trends.trend) > 0.1) {
      riskFactors.push('Declining compliance trend')
      recommendations.push('Investigate causes of declining compliance performance')
    }
  }

  // Determine risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  if (riskScore >= 100 || criticalFailures > 0) {
    riskLevel = 'CRITICAL'
  } else if (riskScore >= 50 || highFailures > 5) {
    riskLevel = 'HIGH'
  } else if (riskScore >= 20 || failureRate > 0.2) {
    riskLevel = 'MEDIUM'
  } else {
    riskLevel = 'LOW'
  }

  return {
    riskLevel,
    riskScore: Math.min(riskScore, 100), // Cap at 100
    riskFactors,
    recommendations,
    trends
  }
}

// ============================================================================
// COMPLIANCE REPORTING UTILITIES
// ============================================================================

/**
 * Generate compliance report
 */
export function generateComplianceReport(
  results: ComplianceResult[],
  rules: ComplianceRule[],
  frameworks: ComplianceFramework[],
  timeRange: { start: Date; end: Date }
): {
  summary: {
    totalRules: number
    totalResults: number
    overallScore: number
    passRate: number
    riskLevel: string
  }
  frameworkAnalysis: {
    name: string
    score: number
    passRate: number
    ruleCount: number
    issueCount: number
  }[]
  severityBreakdown: { [key: string]: number }
  trends: {
    dailyResults: { date: string; score: number; count: number }[]
    topIssues: { rule: string; count: number; severity: string }[]
  }
  recommendations: string[]
} {
  const filteredResults = results.filter(result => {
    const resultDate = new Date(result.timestamp || 0)
    return resultDate >= timeRange.start && resultDate <= timeRange.end
  })

  // Summary calculations
  const complianceAnalysis = calculateComplianceScore(filteredResults)
  const riskAssessment = assessComplianceRisks(filteredResults, rules)

  // Framework analysis
  const frameworkAnalysis = frameworks.map(framework => {
    const frameworkResults = filteredResults.filter(r => r.frameworkId === framework.id)
    const frameworkRules = rules.filter(r => r.frameworkId === framework.id)
    const frameworkScore = calculateComplianceScore(frameworkResults)
    
    return {
      name: framework.name || 'Unknown Framework',
      score: frameworkScore.overallScore,
      passRate: frameworkScore.passRate,
      ruleCount: frameworkRules.length,
      issueCount: frameworkScore.failureCount
    }
  })

  // Trends analysis
  const dailyResults = new Map<string, { score: number; count: number; total: number }>()
  filteredResults.forEach(result => {
    const date = new Date(result.timestamp || 0).toISOString().split('T')[0]
    if (!dailyResults.has(date)) {
      dailyResults.set(date, { score: 0, count: 0, total: 0 })
    }
    const dayData = dailyResults.get(date)!
    dayData.score += result.complianceScore
    dayData.count++
    dayData.total += result.complianceScore
  })

  const dailyTrends = Array.from(dailyResults.entries()).map(([date, data]) => ({
    date,
    score: data.count > 0 ? data.total / data.count : 0,
    count: data.count
  }))

  // Top issues analysis
  const issueCount = new Map<string, { count: number; severity: string }>()
  filteredResults.filter(r => r.status === 'FAILED').forEach(result => {
    const key = result.ruleName || 'Unknown Rule'
    if (!issueCount.has(key)) {
      issueCount.set(key, { count: 0, severity: result.severity || 'UNKNOWN' })
    }
    issueCount.get(key)!.count++
  })

  const topIssues = Array.from(issueCount.entries())
    .map(([rule, data]) => ({ rule, count: data.count, severity: data.severity }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    summary: {
      totalRules: rules.length,
      totalResults: filteredResults.length,
      overallScore: complianceAnalysis.overallScore,
      passRate: complianceAnalysis.passRate,
      riskLevel: riskAssessment.riskLevel
    },
    frameworkAnalysis,
    severityBreakdown: complianceAnalysis.severityBreakdown,
    trends: {
      dailyResults: dailyTrends,
      topIssues
    },
    recommendations: [
      ...complianceAnalysis.recommendations,
      ...riskAssessment.recommendations
    ]
  }
}

// ============================================================================
// COMPLIANCE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Optimize compliance framework
 */
export function optimizeComplianceFramework(
  framework: ComplianceFramework,
  results: ComplianceResult[],
  performanceData: any[]
): {
  optimizedFramework: ComplianceFramework
  recommendations: string[]
  expectedImprovement: number
  optimizations: string[]
} {
  const recommendations: string[] = []
  const optimizations: string[] = []
  const optimizedFramework = { ...framework }

  // Analyze rule performance
  const rulePerformance = new Map<string, { accuracy: number; usage: number; avgScore: number }>()
  
  results.forEach(result => {
    if (result.ruleId) {
      const perf = rulePerformance.get(result.ruleId) || { accuracy: 0, usage: 0, avgScore: 0 }
      perf.avgScore += result.complianceScore
      perf.usage += 1
      rulePerformance.set(result.ruleId, perf)
    }
  })

  // Calculate average scores
  rulePerformance.forEach((perf, ruleId) => {
    perf.accuracy = perf.avgScore / perf.usage
  })

  // Identify underperforming rules
  const underperformingRules = Array.from(rulePerformance.entries())
    .filter(([_, perf]) => perf.accuracy < 0.6)
    .map(([ruleId, _]) => ruleId)

  if (underperformingRules.length > 0) {
    recommendations.push(`Consider reviewing ${underperformingRules.length} underperforming rules`)
    optimizations.push('Remove or modify underperforming rules')
    
    // Remove underperforming rules from optimized framework
    if (optimizedFramework.rules) {
      optimizedFramework.rules = optimizedFramework.rules.filter(rule => 
        !underperformingRules.includes(rule.id!)
      )
    }
  }

  // Identify unused rules
  const usedRuleIds = new Set(Array.from(rulePerformance.keys()))
  const unusedRules = optimizedFramework.rules?.filter(rule => !usedRuleIds.has(rule.id!)) || []

  if (unusedRules.length > 0) {
    recommendations.push(`Consider removing ${unusedRules.length} unused rules`)
    optimizations.push('Remove unused rules to improve performance')
    
    // Remove unused rules
    if (optimizedFramework.rules) {
      optimizedFramework.rules = optimizedFramework.rules.filter(rule => 
        usedRuleIds.has(rule.id!)
      )
    }
  }

  // Identify rule gaps
  const severityCoverage = {
    CRITICAL: optimizedFramework.rules?.filter(r => r.severity === 'CRITICAL').length || 0,
    HIGH: optimizedFramework.rules?.filter(r => r.severity === 'HIGH').length || 0,
    MEDIUM: optimizedFramework.rules?.filter(r => r.severity === 'MEDIUM').length || 0,
    LOW: optimizedFramework.rules?.filter(r => r.severity === 'LOW').length || 0
  }

  if (severityCoverage.CRITICAL < 2) {
    recommendations.push('Consider adding more critical severity rules')
    optimizations.push('Increase critical rule coverage')
  }

  // Calculate expected improvement
  const currentScore = calculateComplianceScore(results).overallScore
  const optimizedResults = results.filter(r => !underperformingRules.includes(r.ruleId || ''))
  const optimizedScore = calculateComplianceScore(optimizedResults).overallScore
  const expectedImprovement = optimizedScore - currentScore

  return {
    optimizedFramework,
    recommendations,
    expectedImprovement,
    optimizations
  }
}

// ============================================================================
// EXPORT/IMPORT UTILITIES
// ============================================================================

/**
 * Export compliance data
 */
export function exportComplianceData(
  data: { rules: ComplianceRule[]; results: ComplianceResult[]; frameworks: ComplianceFramework[] },
  format: 'json' | 'csv' | 'xml'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2)

    case 'csv':
      // Export rules as CSV
      const headers = ['Rule ID', 'Name', 'Framework', 'Severity', 'Status', 'Description', 'Created At']
      const rows = data.rules.map(rule => [
        rule.id || '',
        rule.name || '',
        rule.framework || '',
        rule.severity || '',
        rule.status || '',
        rule.description || '',
        rule.createdAt || ''
      ])
      
      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

    case 'xml':
      const xmlRules = data.rules.map(rule => `
        <rule>
          <id>${rule.id || ''}</id>
          <name>${rule.name || ''}</name>
          <framework>${rule.framework || ''}</framework>
          <severity>${rule.severity || ''}</severity>
          <status>${rule.status || ''}</status>
          <description>${rule.description || ''}</description>
          <createdAt>${rule.createdAt || ''}</createdAt>
        </rule>`).join('')

      return `<?xml version="1.0" encoding="UTF-8"?>\n<compliance-data><rules>${xmlRules}</rules></compliance-data>`

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Search compliance rules
 */
export function searchComplianceRules(
  rules: ComplianceRule[],
  searchTerm: string,
  filters: {
    framework?: string[]
    severity?: string[]
    status?: ComplianceStatus[]
    type?: string[]
    dateRange?: { start: Date; end: Date }
  } = {}
): ComplianceRule[] {
  let filtered = [...rules]

  // Text search
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase()
    filtered = filtered.filter(rule => 
      rule.name?.toLowerCase().includes(term) ||
      rule.description?.toLowerCase().includes(term) ||
      rule.framework?.toLowerCase().includes(term)
    )
  }

  // Framework filter
  if (filters.framework && filters.framework.length > 0) {
    filtered = filtered.filter(rule => filters.framework!.includes(rule.framework!))
  }

  // Severity filter
  if (filters.severity && filters.severity.length > 0) {
    filtered = filtered.filter(rule => filters.severity!.includes(rule.severity!))
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(rule => filters.status!.includes(rule.status!))
  }

  // Type filter
  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(rule => filters.type!.includes(rule.type!))
  }

  // Date range filter
  if (filters.dateRange) {
    filtered = filtered.filter(rule => {
      if (!rule.createdAt) return false
      const date = new Date(rule.createdAt)
      return date >= filters.dateRange!.start && date <= filters.dateRange!.end
    })
  }

  return filtered
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const complianceRulesUtils = {
  // Validation
  validateComplianceRule,
  validateComplianceFramework,
  
  // Processing
  processComplianceResults,
  calculateComplianceScore,
  
  // Risk Assessment
  assessComplianceRisks,
  
  // Reporting
  generateComplianceReport,
  
  // Optimization
  optimizeComplianceFramework,
  
  // Export/Import
  exportComplianceData,
  
  // Search
  searchComplianceRules
}

export default complianceRulesUtils
