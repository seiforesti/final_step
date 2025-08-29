'use client'

import {
  ConnectionConfig,
  ConnectionTestResult,
  ConnectionDiagnostics,
  PerformanceMetrics,
  NetworkLatency,
  DiagnosticResult,
  ConnectionHealth,
  TestSuite,
  ConnectionReport
} from '../types/racine-core.types'

/**
 * Connection Test Utility Functions
 * Provides comprehensive utilities for connection testing, diagnostics, and optimization
 */

/**
 * Calculate connection score based on various metrics
 */
export const calculateConnectionScore = (testResult: ConnectionTestResult, diagnostics?: ConnectionDiagnostics): number => {
  let score = 100

  // Base score from test success
  if (!testResult.success) {
    score -= 50
  }

  // Deduct points based on latency
  if (testResult.latency) {
    if (testResult.latency > 5000) score -= 30
    else if (testResult.latency > 2000) score -= 20
    else if (testResult.latency > 1000) score -= 10
    else if (testResult.latency > 500) score -= 5
  }

  // Deduct points based on diagnostics
  if (diagnostics) {
    // Network latency issues
    if (diagnostics.networkLatency.avg > 1000) score -= 15
    if (diagnostics.networkLatency.jitter > 100) score -= 10
    if (diagnostics.networkLatency.packetLoss > 0.01) score -= 20

    // DNS resolution issues
    if (!diagnostics.dnsResolution.success) score -= 15
    else if (diagnostics.dnsResolution.duration > 1000) score -= 5

    // TLS handshake issues
    if (!diagnostics.tlsHandshake.success) score -= 20
    else if (diagnostics.tlsHandshake.duration > 2000) score -= 10

    // Authentication issues
    if (!diagnostics.authentication.success) score -= 25

    // Query execution issues
    if (!diagnostics.queryExecution.success) score -= 15
    else if (diagnostics.queryExecution.duration > 5000) score -= 10
  }

  return Math.max(0, Math.round(score))
}

/**
 * Analyze performance patterns and detect issues
 */
export const analyzePerformancePattern = (metrics: PerformanceMetrics[]): {
  trends: { metric: string; trend: 'improving' | 'declining' | 'stable'; change: number }[]
  anomalies: { metric: string; severity: 'low' | 'medium' | 'high'; description: string }[]
  recommendations: string[]
} => {
  const trends: { metric: string; trend: 'improving' | 'declining' | 'stable'; change: number }[] = []
  const anomalies: { metric: string; severity: 'low' | 'medium' | 'high'; description: string }[] = []
  const recommendations: string[] = []

  if (metrics.length < 2) {
    return { trends, anomalies, recommendations }
  }

  const latest = metrics[metrics.length - 1]
  const previous = metrics[metrics.length - 2]

  // Analyze latency trend
  const latencyChange = ((latest.latency - previous.latency) / previous.latency) * 100
  if (Math.abs(latencyChange) > 5) {
    trends.push({
      metric: 'latency',
      trend: latencyChange > 0 ? 'declining' : 'improving',
      change: Math.abs(latencyChange)
    })
  }

  // Analyze throughput trend
  const throughputChange = ((latest.throughput - previous.throughput) / previous.throughput) * 100
  if (Math.abs(throughputChange) > 10) {
    trends.push({
      metric: 'throughput',
      trend: throughputChange > 0 ? 'improving' : 'declining',
      change: Math.abs(throughputChange)
    })
  }

  // Detect anomalies
  if (latest.latency > 2000) {
    anomalies.push({
      metric: 'latency',
      severity: latest.latency > 5000 ? 'high' : 'medium',
      description: `High latency detected: ${latest.latency}ms`
    })
    recommendations.push('Consider optimizing connection pool settings or network configuration')
  }

  if (latest.cpuUsage > 80) {
    anomalies.push({
      metric: 'cpu',
      severity: latest.cpuUsage > 95 ? 'high' : 'medium',
      description: `High CPU usage: ${latest.cpuUsage}%`
    })
    recommendations.push('Monitor resource usage and consider scaling resources')
  }

  if (latest.memoryUsage > 85) {
    anomalies.push({
      metric: 'memory',
      severity: latest.memoryUsage > 95 ? 'high' : 'medium',
      description: `High memory usage: ${latest.memoryUsage}%`
    })
    recommendations.push('Review memory allocation and consider increasing available memory')
  }

  if (latest.throughput < 100) {
    anomalies.push({
      metric: 'throughput',
      severity: 'low',
      description: `Low throughput: ${latest.throughput} ops/sec`
    })
    recommendations.push('Investigate potential bottlenecks in query processing')
  }

  return { trends, anomalies, recommendations }
}

/**
 * Generate comprehensive test report
 */
export const generateTestReport = (
  config: ConnectionConfig,
  testResult: ConnectionTestResult,
  diagnostics?: ConnectionDiagnostics,
  metrics?: PerformanceMetrics
): ConnectionReport => {
  const score = calculateConnectionScore(testResult, diagnostics)
  const recommendations: string[] = []
  
  // Generate recommendations based on results
  if (!testResult.success) {
    recommendations.push('Connection failed - verify host, port, and credentials')
  }

  if (testResult.latency > 1000) {
    recommendations.push('High latency detected - consider optimizing network connection')
  }

  if (diagnostics?.networkLatency.packetLoss > 0) {
    recommendations.push('Packet loss detected - check network stability')
  }

  if (!config.ssl && config.type !== 'api') {
    recommendations.push('Consider enabling SSL/TLS for enhanced security')
  }

  // Performance recommendations
  if (metrics) {
    if (metrics.cpuUsage > 80) {
      recommendations.push('High CPU usage - consider optimizing queries or scaling resources')
    }
    if (metrics.memoryUsage > 80) {
      recommendations.push('High memory usage - review connection pool settings')
    }
  }

  const report: ConnectionReport = {
    timestamp: Date.now(),
    config,
    testResult,
    diagnostics: diagnostics || null,
    performance: metrics || null,
    security: null, // Would be populated by security validation
    recommendations,
    summary: {
      overallStatus: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'warning' : 'critical',
      score,
      criticalIssues: recommendations.filter(r => r.includes('failed') || r.includes('critical')).length,
      warnings: recommendations.filter(r => r.includes('High') || r.includes('Consider')).length,
      suggestions: recommendations.length
    }
  }

  return report
}

/**
 * Classify connection issues based on error patterns
 */
export const classifyConnectionIssue = (error: string, config: ConnectionConfig): {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  possibleCauses: string[]
  suggestedFixes: string[]
} => {
  const errorLower = error.toLowerCase()
  
  // Network connectivity issues
  if (errorLower.includes('timeout') || errorLower.includes('connection refused') || errorLower.includes('unreachable')) {
    return {
      category: 'Network Connectivity',
      severity: 'high',
      possibleCauses: [
        'Host is unreachable',
        'Port is blocked by firewall',
        'Service is not running',
        'Network timeout configuration too low'
      ],
      suggestedFixes: [
        'Verify host and port are correct',
        'Check firewall settings',
        'Confirm service is running on target host',
        'Increase timeout configuration',
        'Test network connectivity with ping/telnet'
      ]
    }
  }

  // Authentication issues
  if (errorLower.includes('authentication') || errorLower.includes('login') || errorLower.includes('password') || errorLower.includes('unauthorized')) {
    return {
      category: 'Authentication',
      severity: 'high',
      possibleCauses: [
        'Invalid username or password',
        'Account locked or disabled',
        'Authentication method not supported',
        'Insufficient privileges'
      ],
      suggestedFixes: [
        'Verify username and password are correct',
        'Check if account is active and unlocked',
        'Confirm authentication method is supported',
        'Ensure user has necessary privileges',
        'Test with a known working account'
      ]
    }
  }

  // SSL/TLS issues
  if (errorLower.includes('ssl') || errorLower.includes('tls') || errorLower.includes('certificate')) {
    return {
      category: 'SSL/TLS',
      severity: 'medium',
      possibleCauses: [
        'Invalid or expired certificate',
        'Certificate hostname mismatch',
        'Unsupported SSL/TLS version',
        'Certificate chain issues'
      ],
      suggestedFixes: [
        'Verify certificate is valid and not expired',
        'Check certificate hostname matches connection host',
        'Update SSL/TLS configuration',
        'Install intermediate certificates if needed',
        'Consider disabling SSL verification for testing (not recommended for production)'
      ]
    }
  }

  // Database-specific issues
  if (errorLower.includes('database') || errorLower.includes('schema') || errorLower.includes('table')) {
    return {
      category: 'Database',
      severity: 'medium',
      possibleCauses: [
        'Database does not exist',
        'Schema not found',
        'Insufficient database privileges',
        'Database server overloaded'
      ],
      suggestedFixes: [
        'Verify database name is correct',
        'Check if schema exists and is accessible',
        'Ensure user has necessary database privileges',
        'Monitor database server performance',
        'Try connecting to a different database'
      ]
    }
  }

  // Performance issues
  if (errorLower.includes('slow') || errorLower.includes('performance') || errorLower.includes('overload')) {
    return {
      category: 'Performance',
      severity: 'medium',
      possibleCauses: [
        'Server overloaded',
        'Network congestion',
        'Inefficient queries',
        'Resource constraints'
      ],
      suggestedFixes: [
        'Monitor server resource usage',
        'Optimize connection pool settings',
        'Review and optimize queries',
        'Consider scaling resources',
        'Implement connection pooling'
      ]
    }
  }

  // Configuration issues
  if (errorLower.includes('configuration') || errorLower.includes('parameter') || errorLower.includes('setting')) {
    return {
      category: 'Configuration',
      severity: 'medium',
      possibleCauses: [
        'Invalid configuration parameters',
        'Missing required settings',
        'Incompatible driver version',
        'Protocol version mismatch'
      ],
      suggestedFixes: [
        'Review all configuration parameters',
        'Check for missing required settings',
        'Update driver to latest version',
        'Verify protocol compatibility',
        'Consult documentation for correct configuration'
      ]
    }
  }

  // Generic/unknown issues
  return {
    category: 'Unknown',
    severity: 'medium',
    possibleCauses: [
      'Unspecified connection error',
      'Service unavailable',
      'Temporary network issue'
    ],
    suggestedFixes: [
      'Retry the connection',
      'Check service status',
      'Review error logs for more details',
      'Test with a simpler configuration',
      'Contact support with full error details'
    ]
  }
}

/**
 * Generate optimization suggestions based on connection analysis
 */
export const generateOptimizationSuggestions = (
  config: ConnectionConfig,
  metrics?: PerformanceMetrics,
  diagnostics?: ConnectionDiagnostics
): string[] => {
  const suggestions: string[] = []

  // Connection pool optimization
  if (config.poolSize && config.poolSize < 5) {
    suggestions.push('Consider increasing connection pool size for better performance')
  } else if (config.poolSize && config.poolSize > 50) {
    suggestions.push('Consider reducing connection pool size to avoid resource exhaustion')
  }

  // Timeout optimization
  if (config.timeout && config.timeout < 10000) {
    suggestions.push('Consider increasing timeout for better reliability with slow networks')
  } else if (config.timeout && config.timeout > 60000) {
    suggestions.push('Consider reducing timeout to fail fast on connection issues')
  }

  // Security optimization
  if (!config.ssl && config.type !== 'api') {
    suggestions.push('Enable SSL/TLS encryption for enhanced security')
  }

  if (!config.encryption) {
    suggestions.push('Enable data encryption for sensitive data protection')
  }

  // Performance-based suggestions
  if (metrics) {
    if (metrics.latency > 1000) {
      suggestions.push('High latency detected - consider using connection pooling or caching')
    }

    if (metrics.cpuUsage > 80) {
      suggestions.push('High CPU usage - optimize queries or consider read replicas')
    }

    if (metrics.memoryUsage > 80) {
      suggestions.push('High memory usage - review query complexity and result set sizes')
    }

    if (metrics.throughput < 100) {
      suggestions.push('Low throughput - consider query optimization or index tuning')
    }
  }

  // Network-based suggestions
  if (diagnostics) {
    if (diagnostics.networkLatency.avg > 500) {
      suggestions.push('High network latency - consider using a closer data center or CDN')
    }

    if (diagnostics.networkLatency.jitter > 50) {
      suggestions.push('High network jitter - consider QoS configuration or network optimization')
    }

    if (diagnostics.networkLatency.packetLoss > 0.01) {
      suggestions.push('Packet loss detected - investigate network infrastructure')
    }

    if (diagnostics.dnsResolution.duration > 500) {
      suggestions.push('Slow DNS resolution - consider using DNS caching or faster DNS servers')
    }

    if (diagnostics.tlsHandshake.duration > 1000) {
      suggestions.push('Slow TLS handshake - consider TLS session resumption or HTTP/2')
    }
  }

  // Type-specific suggestions
  switch (config.type) {
    case 'postgresql':
    case 'mysql':
      suggestions.push('Consider using prepared statements for better performance')
      suggestions.push('Enable query caching if available')
      break
    case 'mongodb':
      suggestions.push('Consider using indexes for frequently queried fields')
      suggestions.push('Use read preferences for read scalability')
      break
    case 'snowflake':
      suggestions.push('Consider using warehouse auto-suspend for cost optimization')
      suggestions.push('Use clustering keys for large tables')
      break
    case 's3':
      suggestions.push('Use multipart uploads for large files')
      suggestions.push('Consider using S3 Transfer Acceleration for global access')
      break
    case 'redis':
      suggestions.push('Consider using Redis Cluster for scalability')
      suggestions.push('Configure appropriate memory policies for your use case')
      break
    case 'api':
      suggestions.push('Implement request rate limiting and retry logic')
      suggestions.push('Consider using HTTP/2 for improved performance')
      break
  }

  return suggestions
}

/**
 * Create a test suite for comprehensive connection testing
 */
export const createTestSuite = (config: ConnectionConfig, level: 'basic' | 'standard' | 'comprehensive' = 'standard'): TestSuite => {
  const tests: string[] = []

  // Basic tests (always included)
  tests.push('connectivity', 'authentication')

  if (level === 'standard' || level === 'comprehensive') {
    tests.push('basic_query', 'performance_check', 'security_validation')
  }

  if (level === 'comprehensive') {
    tests.push('stress_test', 'failover_test', 'resource_monitoring', 'network_diagnostics')
  }

  const timeout = level === 'basic' ? 30000 : level === 'standard' ? 60000 : 120000

  return {
    id: `${config.type}_${level}_test_${Date.now()}`,
    name: `${config.type.toUpperCase()} ${level.charAt(0).toUpperCase() + level.slice(1)} Test Suite`,
    description: `${level.charAt(0).toUpperCase() + level.slice(1)} test suite for ${config.type} connections`,
    tests,
    timeout,
    parallel: level !== 'comprehensive'
  }
}

/**
 * Validate connection configuration before testing
 */
export const validateConnectionConfig = (config: ConnectionConfig): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields validation
  if (!config.type) {
    errors.push('Connection type is required')
  }

  // Type-specific validation
  switch (config.type) {
    case 'postgresql':
    case 'mysql':
    case 'mongodb':
      if (!config.host) errors.push('Host is required')
      if (!config.database) errors.push('Database name is required')
      if (!config.username) warnings.push('Username is recommended for authentication')
      break

    case 'snowflake':
      if (!config.account) errors.push('Snowflake account is required')
      if (!config.database) errors.push('Database name is required')
      break

    case 's3':
      if (!config.bucket) errors.push('S3 bucket name is required')
      break

    case 'api':
      if (!config.baseUrl && !config.host) errors.push('Base URL or host is required')
      break

    case 'redis':
      if (!config.host) errors.push('Host is required')
      break
  }

  // Security warnings
  if (!config.ssl && config.type !== 'api') {
    warnings.push('SSL is not enabled - consider enabling for production use')
  }

  if (!config.encryption) {
    warnings.push('Data encryption is not enabled')
  }

  // Performance warnings
  if (config.timeout && config.timeout < 5000) {
    warnings.push('Timeout is very low - may cause false negatives')
  }

  if (config.poolSize && config.poolSize > 100) {
    warnings.push('Pool size is very high - may cause resource exhaustion')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Export all utility functions
 */
export default {
  calculateConnectionScore,
  analyzePerformancePattern,
  generateTestReport,
  classifyConnectionIssue,
  generateOptimizationSuggestions,
  createTestSuite,
  validateConnectionConfig
}
