'use client'

import {
  ScanRuleSet,
  ScanRule,
  RuleCategory,
  RuleComplexity,
  RuleStatus,
  RuleCondition,
  RuleAction,
  RuleExecution,
  RuleValidation,
  RuleMetrics,
  PerformanceMetrics
} from '../types/racine-core.types'

/**
 * Scan Rule Set Utility Functions
 * Provides comprehensive utilities for rule management, validation, and optimization
 */

/**
 * Validate rule pattern syntax
 */
export const validateRulePattern = (pattern: string, type: 'regex' | 'glob' | 'keyword' = 'regex'): {
  isValid: boolean
  errors: string[]
  suggestions: string[]
} => {
  const errors: string[] = []
  const suggestions: string[] = []

  if (!pattern || pattern.trim().length === 0) {
    errors.push('Pattern cannot be empty')
    return { isValid: false, errors, suggestions }
  }

  switch (type) {
    case 'regex':
      try {
        new RegExp(pattern)
        
        // Check for common regex issues
        if (pattern.includes('.*.*')) {
          suggestions.push('Consider using .+ instead of .*.* for better performance')
        }
        
        if (pattern.length > 500) {
          suggestions.push('Very long regex patterns may impact performance')
        }
        
        if (!pattern.includes('^') && !pattern.includes('$')) {
          suggestions.push('Consider anchoring your regex with ^ and $ for more precise matching')
        }
        
      } catch (error) {
        errors.push(`Invalid regex pattern: ${(error as Error).message}`)
      }
      break
      
    case 'glob':
      // Basic glob validation
      if (pattern.includes('***')) {
        errors.push('Triple asterisks are not valid in glob patterns')
      }
      
      if (pattern.includes('..')) {
        suggestions.push('Double dots in paths may cause security issues')
      }
      break
      
    case 'keyword':
      if (pattern.length < 3) {
        suggestions.push('Keyword patterns should be at least 3 characters for effective matching')
      }
      
      if (/^\d+$/.test(pattern)) {
        suggestions.push('Numeric-only patterns may produce too many false positives')
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  }
}

/**
 * Calculate rule complexity score
 */
export const calculateRuleComplexity = (rule: ScanRule): {
  score: number
  level: RuleComplexity
  factors: string[]
} => {
  let score = 0
  const factors: string[] = []

  // Pattern complexity
  const patternLength = rule.pattern.length
  if (patternLength > 100) {
    score += 2
    factors.push('Long pattern')
  } else if (patternLength > 50) {
    score += 1
    factors.push('Medium pattern length')
  }

  // Condition complexity
  score += rule.conditions.length * 0.5
  if (rule.conditions.length > 5) {
    factors.push('Many conditions')
  }

  // Action complexity
  score += rule.actions.length * 0.3
  if (rule.actions.some(a => a.type === 'custom')) {
    score += 1
    factors.push('Custom actions')
  }

  // Dependencies
  score += rule.dependencies.length * 0.2
  if (rule.dependencies.length > 3) {
    factors.push('Multiple dependencies')
  }

  // Determine complexity level
  let level: RuleComplexity
  if (score <= 2) {
    level = RuleComplexity.SIMPLE
  } else if (score <= 5) {
    level = RuleComplexity.MODERATE
  } else if (score <= 8) {
    level = RuleComplexity.COMPLEX
  } else {
    level = RuleComplexity.ADVANCED
  }

  return { score: Math.round(score * 10) / 10, level, factors }
}

/**
 * Optimize rule execution order
 */
export const optimizeRuleOrder = (rules: ScanRule[]): {
  optimizedOrder: string[]
  reasoning: string[]
  estimatedImprovement: number
} => {
  const reasoning: string[] = []
  
  // Sort rules by various factors
  const sortedRules = [...rules].sort((a, b) => {
    // 1. Priority first (higher priority first)
    if (a.priority !== b.priority) {
      return b.priority - a.priority
    }
    
    // 2. Dependencies (rules with fewer dependencies first)
    if (a.dependencies.length !== b.dependencies.length) {
      return a.dependencies.length - b.dependencies.length
    }
    
    // 3. Performance (faster rules first)
    if (a.averageExecutionTime !== b.averageExecutionTime) {
      return a.averageExecutionTime - b.averageExecutionTime
    }
    
    // 4. Success rate (higher success rate first)
    return b.successRate - a.successRate
  })

  const optimizedOrder = sortedRules.map(rule => rule.id)
  
  // Calculate estimated improvement
  const originalOrder = rules.map(r => r.id)
  const isOrderChanged = !optimizedOrder.every((id, index) => id === originalOrder[index])
  const estimatedImprovement = isOrderChanged ? 15 : 0 // 15% estimated improvement if order changed

  // Add reasoning
  reasoning.push('Rules ordered by priority (highest first)')
  reasoning.push('Dependencies considered to minimize blocking')
  reasoning.push('Faster rules prioritized for early execution')
  reasoning.push('Higher success rate rules prioritized')

  return {
    optimizedOrder,
    reasoning,
    estimatedImprovement
  }
}

/**
 * Detect rule conflicts
 */
export const detectRuleConflicts = (rules: ScanRule[]): {
  conflicts: RuleConflict[]
  warnings: string[]
} => {
  const conflicts: RuleConflict[] = []
  const warnings: string[] = []

  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const rule1 = rules[i]
      const rule2 = rules[j]

      // Check explicit conflicts
      if (rule1.conflictsWith.includes(rule2.id) || rule2.conflictsWith.includes(rule1.id)) {
        conflicts.push({
          rule1Id: rule1.id,
          rule2Id: rule2.id,
          type: 'explicit',
          severity: 'high',
          description: 'Rules explicitly marked as conflicting',
          suggestion: 'Only enable one of these rules at a time'
        })
      }

      // Check pattern overlaps
      if (rule1.pattern === rule2.pattern && rule1.category === rule2.category) {
        conflicts.push({
          rule1Id: rule1.id,
          rule2Id: rule2.id,
          type: 'pattern_overlap',
          severity: 'medium',
          description: 'Rules have identical patterns and categories',
          suggestion: 'Consider merging these rules or making patterns more specific'
        })
      }

      // Check action conflicts
      const hasConflictingActions = rule1.actions.some(a1 => 
        rule2.actions.some(a2 => 
          a1.type === 'encrypt' && a2.type === 'mask' ||
          a1.type === 'quarantine' && a2.type === 'alert'
        )
      )

      if (hasConflictingActions) {
        warnings.push(`Rules ${rule1.name} and ${rule2.name} have potentially conflicting actions`)
      }
    }
  }

  return { conflicts, warnings }
}

interface RuleConflict {
  rule1Id: string
  rule2Id: string
  type: 'explicit' | 'pattern_overlap' | 'action_conflict'
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestion: string
}

/**
 * Generate rule performance report
 */
export const generateRulePerformanceReport = (
  rule: ScanRule,
  executions: RuleExecution[],
  metrics?: RuleMetrics
): RulePerformanceReport => {
  const recentExecutions = executions.slice(-10) // Last 10 executions
  
  const totalExecutions = executions.length
  const successfulExecutions = executions.filter(e => e.status === 'completed').length
  const failedExecutions = executions.filter(e => e.status === 'failed').length
  
  const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
  const failureRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0
  
  const avgExecutionTime = recentExecutions.length > 0
    ? recentExecutions.reduce((sum, e) => sum + (e.duration || 0), 0) / recentExecutions.length
    : rule.averageExecutionTime
  
  const avgMatchesFound = recentExecutions.length > 0
    ? recentExecutions.reduce((sum, e) => sum + e.matchesFound, 0) / recentExecutions.length
    : 0

  // Performance score calculation
  let performanceScore = 100
  
  // Deduct points for poor success rate
  if (successRate < 50) performanceScore -= 30
  else if (successRate < 80) performanceScore -= 15
  else if (successRate < 95) performanceScore -= 5
  
  // Deduct points for slow execution
  if (avgExecutionTime > 10000) performanceScore -= 20 // >10 seconds
  else if (avgExecutionTime > 5000) performanceScore -= 10 // >5 seconds
  else if (avgExecutionTime > 2000) performanceScore -= 5 // >2 seconds
  
  // Performance grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (performanceScore >= 90) grade = 'A'
  else if (performanceScore >= 80) grade = 'B'
  else if (performanceScore >= 70) grade = 'C'
  else if (performanceScore >= 60) grade = 'D'
  else grade = 'F'

  // Generate recommendations
  const recommendations: string[] = []
  
  if (successRate < 80) {
    recommendations.push('Review rule pattern and conditions for accuracy')
  }
  
  if (avgExecutionTime > 5000) {
    recommendations.push('Optimize rule pattern for better performance')
  }
  
  if (avgMatchesFound < 1 && totalExecutions > 5) {
    recommendations.push('Rule rarely finds matches - consider reviewing criteria')
  }
  
  if (failureRate > 10) {
    recommendations.push('High failure rate detected - check rule configuration')
  }

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    successRate: Math.round(successRate * 100) / 100,
    failureRate: Math.round(failureRate * 100) / 100,
    avgExecutionTime: Math.round(avgExecutionTime),
    avgMatchesFound: Math.round(avgMatchesFound * 100) / 100,
    performanceScore: Math.round(performanceScore),
    grade,
    recommendations,
    recentTrend: calculateTrend(recentExecutions),
    lastExecution: executions[executions.length - 1]?.startedAt || null
  }
}

interface RulePerformanceReport {
  ruleId: string
  ruleName: string
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  successRate: number
  failureRate: number
  avgExecutionTime: number
  avgMatchesFound: number
  performanceScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  recommendations: string[]
  recentTrend: 'improving' | 'declining' | 'stable'
  lastExecution: string | null
}

/**
 * Calculate trend from recent executions
 */
export const calculateTrend = (executions: RuleExecution[]): 'improving' | 'declining' | 'stable' => {
  if (executions.length < 3) return 'stable'
  
  const recent = executions.slice(-3)
  const older = executions.slice(-6, -3)
  
  if (older.length === 0) return 'stable'
  
  const recentAvgTime = recent.reduce((sum, e) => sum + (e.duration || 0), 0) / recent.length
  const olderAvgTime = older.reduce((sum, e) => sum + (e.duration || 0), 0) / older.length
  
  const recentSuccessRate = recent.filter(e => e.status === 'completed').length / recent.length
  const olderSuccessRate = older.filter(e => e.status === 'completed').length / older.length
  
  // Consider both execution time and success rate
  const timeImprovement = olderAvgTime > recentAvgTime
  const successImprovement = recentSuccessRate > olderSuccessRate
  
  if ((timeImprovement && successImprovement) || 
      (timeImprovement && recentSuccessRate >= olderSuccessRate) ||
      (successImprovement && recentAvgTime <= olderAvgTime)) {
    return 'improving'
  } else if ((!timeImprovement && !successImprovement) ||
             (recentAvgTime > olderAvgTime * 1.2) ||
             (recentSuccessRate < olderSuccessRate * 0.8)) {
    return 'declining'
  }
  
  return 'stable'
}

/**
 * Suggest rule improvements
 */
export const suggestRuleImprovements = (rule: ScanRule, performanceReport: RulePerformanceReport): {
  suggestions: RuleImprovement[]
  priority: 'low' | 'medium' | 'high'
} => {
  const suggestions: RuleImprovement[] = []
  
  // Pattern optimization suggestions
  if (rule.pattern.length > 100) {
    suggestions.push({
      type: 'pattern_optimization',
      description: 'Consider simplifying the pattern for better performance',
      implementation: 'Break down complex pattern into multiple simpler rules',
      estimatedImpact: 15,
      effort: 'medium'
    })
  }
  
  // Condition optimization
  if (rule.conditions.length > 5) {
    suggestions.push({
      type: 'condition_optimization',
      description: 'Too many conditions may impact performance',
      implementation: 'Combine similar conditions or split into multiple rules',
      estimatedImpact: 10,
      effort: 'low'
    })
  }
  
  // Success rate improvement
  if (performanceReport.successRate < 80) {
    suggestions.push({
      type: 'accuracy_improvement',
      description: 'Low success rate indicates pattern may be too broad or conditions too strict',
      implementation: 'Review and refine pattern matching criteria',
      estimatedImpact: 25,
      effort: 'high'
    })
  }
  
  // Performance improvement
  if (performanceReport.avgExecutionTime > 5000) {
    suggestions.push({
      type: 'performance_optimization',
      description: 'Execution time is higher than recommended',
      implementation: 'Optimize pattern regex or add early exit conditions',
      estimatedImpact: 30,
      effort: 'medium'
    })
  }
  
  // Action optimization
  if (rule.actions.length > 3) {
    suggestions.push({
      type: 'action_optimization',
      description: 'Multiple actions may increase processing overhead',
      implementation: 'Consolidate actions or use action chains',
      estimatedImpact: 5,
      effort: 'low'
    })
  }

  // Determine overall priority
  let priority: 'low' | 'medium' | 'high' = 'low'
  
  if (performanceReport.grade === 'F' || performanceReport.successRate < 50) {
    priority = 'high'
  } else if (performanceReport.grade === 'D' || performanceReport.avgExecutionTime > 10000) {
    priority = 'medium'
  }

  return { suggestions, priority }
}

interface RuleImprovement {
  type: 'pattern_optimization' | 'condition_optimization' | 'accuracy_improvement' | 'performance_optimization' | 'action_optimization'
  description: string
  implementation: string
  estimatedImpact: number // Percentage improvement
  effort: 'low' | 'medium' | 'high'
}

/**
 * Export rule set configuration
 */
export const exportRuleSetConfig = (ruleSet: ScanRuleSet, format: 'json' | 'yaml' = 'json'): string => {
  const config = {
    name: ruleSet.name,
    description: ruleSet.description,
    category: ruleSet.category,
    complexity: ruleSet.complexity,
    version: ruleSet.version,
    optimizationLevel: ruleSet.optimizationLevel,
    parallelExecution: ruleSet.parallelExecution,
    rules: ruleSet.rules.map(rule => ({
      name: rule.name,
      description: rule.description,
      category: rule.category,
      pattern: rule.pattern,
      conditions: rule.conditions,
      actions: rule.actions,
      priority: rule.priority,
      timeout: rule.timeout,
      retryAttempts: rule.retryAttempts,
      tags: rule.tags
    })),
    tags: ruleSet.tags
  }

  if (format === 'yaml') {
    // Simple YAML conversion (you might want to use a proper YAML library)
    return convertToYAML(config)
  }

  return JSON.stringify(config, null, 2)
}

/**
 * Simple YAML converter (basic implementation)
 */
const convertToYAML = (obj: any, indent = 0): string => {
  const spaces = '  '.repeat(indent)
  let yaml = ''

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`
      for (const item of value) {
        if (typeof item === 'object') {
          yaml += `${spaces}- \n${convertToYAML(item, indent + 1)}`
        } else {
          yaml += `${spaces}- ${item}\n`
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`
    } else {
      yaml += `${spaces}${key}: ${value}\n`
    }
  }

  return yaml
}

/**
 * Validate rule set consistency
 */
export const validateRuleSetConsistency = (ruleSet: ScanRuleSet): {
  isConsistent: boolean
  issues: string[]
  warnings: string[]
} => {
  const issues: string[] = []
  const warnings: string[] = []

  // Check for duplicate rule names
  const ruleNames = ruleSet.rules.map(r => r.name)
  const duplicateNames = ruleNames.filter((name, index) => ruleNames.indexOf(name) !== index)
  if (duplicateNames.length > 0) {
    issues.push(`Duplicate rule names found: ${duplicateNames.join(', ')}`)
  }

  // Check dependency cycles
  const { hasCycles, cycles } = detectDependencyCycles(ruleSet.rules)
  if (hasCycles) {
    issues.push(`Dependency cycles detected: ${cycles.join(', ')}`)
  }

  // Check for orphaned dependencies
  const ruleIds = new Set(ruleSet.rules.map(r => r.id))
  for (const rule of ruleSet.rules) {
    const invalidDeps = rule.dependencies.filter(dep => !ruleIds.has(dep))
    if (invalidDeps.length > 0) {
      issues.push(`Rule ${rule.name} has invalid dependencies: ${invalidDeps.join(', ')}`)
    }
  }

  // Check execution order consistency
  const orderRuleIds = new Set(ruleSet.executionOrder)
  const missingFromOrder = ruleSet.rules.filter(r => !orderRuleIds.has(r.id))
  if (missingFromOrder.length > 0) {
    warnings.push(`Rules not in execution order: ${missingFromOrder.map(r => r.name).join(', ')}`)
  }

  // Check for inconsistent categories
  const categoryCount = ruleSet.rules.reduce((acc, rule) => {
    acc[rule.category] = (acc[rule.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (Object.keys(categoryCount).length > 3) {
    warnings.push('Rule set contains many different categories - consider splitting')
  }

  return {
    isConsistent: issues.length === 0,
    issues,
    warnings
  }
}

/**
 * Detect dependency cycles in rules
 */
const detectDependencyCycles = (rules: ScanRule[]): { hasCycles: boolean; cycles: string[] } => {
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const cycles: string[] = []

  const dfs = (ruleId: string, path: string[]): boolean => {
    if (recursionStack.has(ruleId)) {
      const cycleStart = path.indexOf(ruleId)
      cycles.push(path.slice(cycleStart).concat(ruleId).join(' -> '))
      return true
    }

    if (visited.has(ruleId)) {
      return false
    }

    visited.add(ruleId)
    recursionStack.add(ruleId)
    
    const rule = rules.find(r => r.id === ruleId)
    if (rule) {
      for (const dep of rule.dependencies) {
        if (dfs(dep, [...path, ruleId])) {
          return true
        }
      }
    }

    recursionStack.delete(ruleId)
    return false
  }

  let hasCycles = false
  for (const rule of rules) {
    if (!visited.has(rule.id)) {
      if (dfs(rule.id, [])) {
        hasCycles = true
      }
    }
  }

  return { hasCycles, cycles }
}

/**
 * Export all utility functions
 */
export default {
  validateRulePattern,
  calculateRuleComplexity,
  optimizeRuleOrder,
  detectRuleConflicts,
  generateRulePerformanceReport,
  calculateTrend,
  suggestRuleImprovements,
  exportRuleSetConfig,
  validateRuleSetConsistency
}
