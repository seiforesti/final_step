'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Import connection APIs - these integrate with backend
import { dataSourceApis } from '../services/racine-orchestration-apis'
import { crossGroupIntegrationAPI } from '../services/cross-group-integration-apis'

// Import types from racine core types
import {
  DataSource,
  ConnectionConfig,
  ValidationResult,
  ConnectionTestResult,
  ConnectionDiagnostics,
  PerformanceMetrics,
  TestConfiguration,
  ConnectionHealth,
  NetworkLatency,
  TestSuite,
  DiagnosticLog,
  ConnectionOptimization,
  SecurityValidation,
  ConnectionReport
} from '../types/racine-core.types'

interface UseConnectionValidatorOptions {
  autoRetry?: boolean
  maxRetries?: number
  timeout?: number
  enableRealTimeValidation?: boolean
}

interface ConnectionValidatorOperations {
  // Core validation operations
  validateConnection: (config: ConnectionConfig) => Promise<ValidationResult>
  testConnectivity: (config: ConnectionConfig) => Promise<ConnectionTestResult>
  validateCredentials: (config: ConnectionConfig) => Promise<ValidationResult>
  checkConnectivity: (dataSourceId: string) => Promise<ConnectionHealth>
  
  // Advanced testing operations
  runTestSuite: (config: ConnectionConfig, suite: TestSuite) => Promise<ConnectionTestResult>
  performDiagnostics: (config: ConnectionConfig) => Promise<ConnectionDiagnostics>
  analyzePerformance: (config: ConnectionConfig) => Promise<PerformanceMetrics>
  testSecurity: (config: ConnectionConfig) => Promise<SecurityValidation>
  
  // Optimization operations
  optimizeConnection: (config: ConnectionConfig) => Promise<ConnectionOptimization>
  generateConnectionReport: (config: ConnectionConfig) => Promise<ConnectionReport>
  getBestPractices: (dataSourceType: string) => Promise<string[]>
  
  // Real-time monitoring
  startRealTimeMonitoring: (dataSourceId: string) => Promise<void>
  stopRealTimeMonitoring: (dataSourceId: string) => Promise<void>
  getRealTimeStatus: (dataSourceId: string) => Promise<ConnectionHealth>
  
  // Batch operations
  validateMultipleConnections: (configs: ConnectionConfig[]) => Promise<ValidationResult[]>
  testMultipleConnections: (configs: ConnectionConfig[]) => Promise<ConnectionTestResult[]>
  
  // Historical data
  getConnectionHistory: (dataSourceId: string, timeRange?: string) => Promise<ConnectionTestResult[]>
  getPerformanceHistory: (dataSourceId: string, timeRange?: string) => Promise<PerformanceMetrics[]>
  
  // Troubleshooting
  troubleshootConnection: (config: ConnectionConfig, error?: string) => Promise<DiagnosticLog[]>
  getSuggestedFixes: (error: string, dataSourceType: string) => Promise<string[]>
  runConnectionHealth: (dataSourceId: string) => Promise<ConnectionHealth>
}

export const useConnectionValidator = (options: UseConnectionValidatorOptions = {}) => {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [realTimeStatus, setRealTimeStatus] = useState<Map<string, ConnectionHealth>>(new Map())

  // Test connection mutation with retry logic
  const testConnectionMutation = useMutation({
    mutationFn: async (config: ConnectionConfig) => {
      let attempts = 0
      const maxAttempts = options.maxRetries || 3
      
      while (attempts < maxAttempts) {
        try {
          const result = await dataSourceApis.testConnection(config)
          
          // Track successful test
          crossGroupIntegrationAPI.trackEvent('connection_test_success', {
            dataSourceType: config.type,
            attempt: attempts + 1,
            latency: result.latency
          })
          
          return result
        } catch (error) {
          attempts++
          if (attempts >= maxAttempts) {
            // Track failed test
            crossGroupIntegrationAPI.trackEvent('connection_test_failed', {
              dataSourceType: config.type,
              attempts: attempts,
              error: (error as Error).message
            })
            throw error
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
        }
      }
    },
    onError: (error: any) => {
      setError(`Connection test failed: ${error.message}`)
    }
  })

  // Validate connection configuration mutation
  const validateConnectionMutation = useMutation({
    mutationFn: (config: ConnectionConfig) => dataSourceApis.validateConnection(config),
    onError: (error: any) => {
      setError(`Connection validation failed: ${error.message}`)
    }
  })

  // Run diagnostic suite mutation
  const runDiagnosticsMutation = useMutation({
    mutationFn: (config: ConnectionConfig) => dataSourceApis.performDiagnostics(config),
    onError: (error: any) => {
      setError(`Diagnostics failed: ${error.message}`)
    }
  })

  // Performance analysis mutation
  const analyzePerformanceMutation = useMutation({
    mutationFn: (config: ConnectionConfig) => dataSourceApis.analyzePerformance(config),
    onError: (error: any) => {
      setError(`Performance analysis failed: ${error.message}`)
    }
  })

  // Security validation mutation
  const testSecurityMutation = useMutation({
    mutationFn: (config: ConnectionConfig) => dataSourceApis.testSecurity(config),
    onError: (error: any) => {
      setError(`Security test failed: ${error.message}`)
    }
  })

  // Connection optimization mutation
  const optimizeConnectionMutation = useMutation({
    mutationFn: (config: ConnectionConfig) => dataSourceApis.optimizeConnection(config),
    onSuccess: (optimization) => {
      // Track optimization event
      crossGroupIntegrationAPI.trackEvent('connection_optimized', {
        dataSourceType: config.type,
        improvements: optimization.improvements,
        performanceGain: optimization.performanceGain
      })
    },
    onError: (error: any) => {
      setError(`Connection optimization failed: ${error.message}`)
    }
  })

  // Validate connection configuration
  const validateConnection = useCallback(async (config: ConnectionConfig): Promise<ValidationResult> => {
    try {
      return await validateConnectionMutation.mutateAsync(config)
    } catch (error) {
      console.error('Error validating connection:', error)
      return {
        isValid: false,
        errors: [`Validation failed: ${(error as Error).message}`],
        warnings: [],
        suggestions: []
      }
    }
  }, [validateConnectionMutation])

  // Test connectivity
  const testConnectivity = useCallback(async (config: ConnectionConfig): Promise<ConnectionTestResult> => {
    try {
      const startTime = performance.now()
      const result = await testConnectionMutation.mutateAsync(config)
      const endTime = performance.now()
      
      return {
        ...result,
        latency: endTime - startTime,
        timestamp: Date.now()
      }
    } catch (error) {
      console.error('Error testing connectivity:', error)
      return {
        success: false,
        message: `Connection test failed: ${(error as Error).message}`,
        error: (error as Error).message,
        latency: 0,
        timestamp: Date.now()
      }
    }
  }, [testConnectionMutation])

  // Validate credentials
  const validateCredentials = useCallback(async (config: ConnectionConfig): Promise<ValidationResult> => {
    try {
      return await dataSourceApis.validateCredentials(config)
    } catch (error) {
      console.error('Error validating credentials:', error)
      return {
        isValid: false,
        errors: [`Credential validation failed: ${(error as Error).message}`],
        warnings: [],
        suggestions: []
      }
    }
  }, [])

  // Check connectivity for existing data source
  const checkConnectivity = useCallback(async (dataSourceId: string): Promise<ConnectionHealth> => {
    try {
      const health = await dataSourceApis.checkConnectivity(dataSourceId)
      setRealTimeStatus(prev => new Map(prev.set(dataSourceId, health)))
      return health
    } catch (error) {
      console.error('Error checking connectivity:', error)
      const errorHealth: ConnectionHealth = {
        status: 'error',
        lastCheck: Date.now(),
        latency: 0,
        uptime: 0,
        errorRate: 100,
        message: (error as Error).message
      }
      setRealTimeStatus(prev => new Map(prev.set(dataSourceId, errorHealth)))
      return errorHealth
    }
  }, [])

  // Run test suite
  const runTestSuite = useCallback(async (config: ConnectionConfig, suite: TestSuite): Promise<ConnectionTestResult> => {
    try {
      setLoading(true)
      const result = await dataSourceApis.runTestSuite(config, suite)
      
      // Track test suite completion
      crossGroupIntegrationAPI.trackEvent('test_suite_completed', {
        dataSourceType: config.type,
        suite: suite.id,
        success: result.success,
        duration: result.duration
      })
      
      return result
    } catch (error) {
      console.error('Error running test suite:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Perform diagnostics
  const performDiagnostics = useCallback(async (config: ConnectionConfig): Promise<ConnectionDiagnostics> => {
    try {
      return await runDiagnosticsMutation.mutateAsync(config)
    } catch (error) {
      console.error('Error performing diagnostics:', error)
      throw error
    }
  }, [runDiagnosticsMutation])

  // Analyze performance
  const analyzePerformance = useCallback(async (config: ConnectionConfig): Promise<PerformanceMetrics> => {
    try {
      return await analyzePerformanceMutation.mutateAsync(config)
    } catch (error) {
      console.error('Error analyzing performance:', error)
      throw error
    }
  }, [analyzePerformanceMutation])

  // Test security
  const testSecurity = useCallback(async (config: ConnectionConfig): Promise<SecurityValidation> => {
    try {
      return await testSecurityMutation.mutateAsync(config)
    } catch (error) {
      console.error('Error testing security:', error)
      throw error
    }
  }, [testSecurityMutation])

  // Optimize connection
  const optimizeConnection = useCallback(async (config: ConnectionConfig): Promise<ConnectionOptimization> => {
    try {
      return await optimizeConnectionMutation.mutateAsync(config)
    } catch (error) {
      console.error('Error optimizing connection:', error)
      throw error
    }
  }, [optimizeConnectionMutation])

  // Generate connection report
  const generateConnectionReport = useCallback(async (config: ConnectionConfig): Promise<ConnectionReport> => {
    try {
      setLoading(true)
      
      // Run comprehensive analysis
      const [testResult, diagnostics, performance, security] = await Promise.allSettled([
        testConnectivity(config),
        performDiagnostics(config),
        analyzePerformance(config),
        testSecurity(config)
      ])
      
      const report: ConnectionReport = {
        timestamp: Date.now(),
        config: config,
        testResult: testResult.status === 'fulfilled' ? testResult.value : null,
        diagnostics: diagnostics.status === 'fulfilled' ? diagnostics.value : null,
        performance: performance.status === 'fulfilled' ? performance.value : null,
        security: security.status === 'fulfilled' ? security.value : null,
        recommendations: []
      }
      
      // Generate recommendations based on results
      if (report.performance && report.performance.latency > 1000) {
        report.recommendations.push('Consider optimizing connection pool settings')
      }
      
      if (report.security && !report.security.sslEnabled) {
        report.recommendations.push('Enable SSL/TLS encryption for enhanced security')
      }
      
      return report
    } catch (error) {
      console.error('Error generating connection report:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [testConnectivity, performDiagnostics, analyzePerformance, testSecurity])

  // Get best practices
  const getBestPractices = useCallback(async (dataSourceType: string): Promise<string[]> => {
    try {
      return await dataSourceApis.getBestPractices(dataSourceType)
    } catch (error) {
      console.error('Error fetching best practices:', error)
      return []
    }
  }, [])

  // Real-time monitoring
  const startRealTimeMonitoring = useCallback(async (dataSourceId: string): Promise<void> => {
    try {
      await dataSourceApis.startRealTimeMonitoring(dataSourceId)
      
      // Start periodic health checks
      const interval = setInterval(async () => {
        try {
          const health = await dataSourceApis.getRealTimeStatus(dataSourceId)
          setRealTimeStatus(prev => new Map(prev.set(dataSourceId, health)))
        } catch (error) {
          console.error('Error updating real-time status:', error)
        }
      }, 30000) // Check every 30 seconds
      
      // Store interval ID for cleanup
      ;(window as any)[`monitoring_${dataSourceId}`] = interval
    } catch (error) {
      console.error('Error starting real-time monitoring:', error)
      throw error
    }
  }, [])

  const stopRealTimeMonitoring = useCallback(async (dataSourceId: string): Promise<void> => {
    try {
      await dataSourceApis.stopRealTimeMonitoring(dataSourceId)
      
      // Clear interval
      const interval = (window as any)[`monitoring_${dataSourceId}`]
      if (interval) {
        clearInterval(interval)
        delete (window as any)[`monitoring_${dataSourceId}`]
      }
      
      // Remove from real-time status
      setRealTimeStatus(prev => {
        const newMap = new Map(prev)
        newMap.delete(dataSourceId)
        return newMap
      })
    } catch (error) {
      console.error('Error stopping real-time monitoring:', error)
      throw error
    }
  }, [])

  // Batch operations
  const validateMultipleConnections = useCallback(async (configs: ConnectionConfig[]): Promise<ValidationResult[]> => {
    try {
      setLoading(true)
      const results = await Promise.allSettled(
        configs.map(config => validateConnection(config))
      )
      
      return results.map((result, index) => 
        result.status === 'fulfilled' 
          ? result.value 
          : {
              isValid: false,
              errors: [`Validation failed for config ${index + 1}`],
              warnings: [],
              suggestions: []
            }
      )
    } catch (error) {
      console.error('Error validating multiple connections:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [validateConnection])

  const testMultipleConnections = useCallback(async (configs: ConnectionConfig[]): Promise<ConnectionTestResult[]> => {
    try {
      setLoading(true)
      const results = await Promise.allSettled(
        configs.map(config => testConnectivity(config))
      )
      
      return results.map((result, index) => 
        result.status === 'fulfilled' 
          ? result.value 
          : {
              success: false,
              message: `Test failed for config ${index + 1}`,
              error: result.reason?.message || 'Unknown error',
              latency: 0,
              timestamp: Date.now()
            }
      )
    } catch (error) {
      console.error('Error testing multiple connections:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [testConnectivity])

  // Historical data queries
  const {
    data: connectionHistory,
    isLoading: historyLoading,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['connectionHistory'],
    queryFn: () => dataSourceApis.getConnectionHistory(),
    enabled: false, // Only fetch when explicitly requested
    staleTime: 60000 // 1 minute
  })

  // Troubleshooting
  const troubleshootConnection = useCallback(async (config: ConnectionConfig, error?: string): Promise<DiagnosticLog[]> => {
    try {
      return await dataSourceApis.troubleshootConnection(config, error)
    } catch (err) {
      console.error('Error troubleshooting connection:', err)
      return []
    }
  }, [])

  const getSuggestedFixes = useCallback(async (error: string, dataSourceType: string): Promise<string[]> => {
    try {
      return await dataSourceApis.getSuggestedFixes(error, dataSourceType)
    } catch (err) {
      console.error('Error getting suggested fixes:', err)
      return []
    }
  }, [])

  // Connection validator operations object
  const operations: ConnectionValidatorOperations = useMemo(() => ({
    // Core validation operations
    validateConnection,
    testConnectivity,
    validateCredentials,
    checkConnectivity,
    
    // Advanced testing operations
    runTestSuite,
    performDiagnostics,
    analyzePerformance,
    testSecurity,
    
    // Optimization operations
    optimizeConnection,
    generateConnectionReport,
    getBestPractices,
    
    // Real-time monitoring
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    getRealTimeStatus: async (dataSourceId: string) => {
      const status = realTimeStatus.get(dataSourceId)
      if (status) return status
      return await checkConnectivity(dataSourceId)
    },
    
    // Batch operations
    validateMultipleConnections,
    testMultipleConnections,
    
    // Historical data
    getConnectionHistory: async (dataSourceId: string, timeRange?: string) => {
      return await dataSourceApis.getConnectionHistory(dataSourceId, timeRange)
    },
    getPerformanceHistory: async (dataSourceId: string, timeRange?: string) => {
      return await dataSourceApis.getPerformanceHistory(dataSourceId, timeRange)
    },
    
    // Troubleshooting
    troubleshootConnection,
    getSuggestedFixes,
    runConnectionHealth: checkConnectivity
  }), [
    validateConnection,
    testConnectivity,
    validateCredentials,
    checkConnectivity,
    runTestSuite,
    performDiagnostics,
    analyzePerformance,
    testSecurity,
    optimizeConnection,
    generateConnectionReport,
    getBestPractices,
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    validateMultipleConnections,
    testMultipleConnections,
    troubleshootConnection,
    getSuggestedFixes,
    realTimeStatus
  ])

  // Clear error when operations succeed
  useEffect(() => {
    if (
      testConnectionMutation.isSuccess || 
      validateConnectionMutation.isSuccess || 
      runDiagnosticsMutation.isSuccess ||
      analyzePerformanceMutation.isSuccess ||
      testSecurityMutation.isSuccess ||
      optimizeConnectionMutation.isSuccess
    ) {
      setError(null)
    }
  }, [
    testConnectionMutation.isSuccess,
    validateConnectionMutation.isSuccess,
    runDiagnosticsMutation.isSuccess,
    analyzePerformanceMutation.isSuccess,
    testSecurityMutation.isSuccess,
    optimizeConnectionMutation.isSuccess
  ])

  // Cleanup real-time monitoring on unmount
  useEffect(() => {
    return () => {
      // Clear all monitoring intervals
      Object.keys(window as any).forEach(key => {
        if (key.startsWith('monitoring_')) {
          const interval = (window as any)[key]
          if (interval) {
            clearInterval(interval)
            delete (window as any)[key]
          }
        }
      })
    }
  }, [])

  return {
    // Data
    connectionHistory,
    realTimeStatus: Object.fromEntries(realTimeStatus),
    
    // Loading states
    loading: loading || historyLoading,
    isTesting: testConnectionMutation.isPending,
    isValidating: validateConnectionMutation.isPending,
    isRunningDiagnostics: runDiagnosticsMutation.isPending,
    isAnalyzingPerformance: analyzePerformanceMutation.isPending,
    isTestingSecurity: testSecurityMutation.isPending,
    isOptimizing: optimizeConnectionMutation.isPending,
    
    // Error states
    error,
    
    // Operations
    ...operations,
    
    // Utility functions
    refetchHistory,
    clearError: () => setError(null)
  }
}

export default useConnectionValidator