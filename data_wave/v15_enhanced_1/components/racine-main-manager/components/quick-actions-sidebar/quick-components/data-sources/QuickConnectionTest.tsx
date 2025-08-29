'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TestTube, Play, Pause, RotateCcw, CheckCircle2, AlertCircle, Loader2, Activity, Zap, Clock, Network, Server, Database, Wifi, Signal, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Timer, Target, Gauge, FileText, Download, RefreshCw, Settings, Info, Eye, EyeOff, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'

// Import foundation layers (100% backend integration)
import { useDataSources } from '../../../../hooks/useDataSources'
import { useConnectionValidator } from '../../../../hooks/useConnectionValidator'
import { useUserManagement } from '../../../../hooks/useUserManagement'
import { useActivityTracker } from '../../../../hooks/useActivityTracker'
import { useNotificationManager } from '../../../../hooks/useNotificationManager'
import { useRacineOrchestration } from '../../../../hooks/useRacineOrchestration'

// Import types (already implemented and validated)
import {
  DataSource,
  ConnectionTestResult,
  ConnectionDiagnostics,
  PerformanceMetrics,
  TestConfiguration,
  ConnectionHealth,
  NetworkLatency,
  TestSuite,
  DiagnosticLog
} from '../../../../types/racine-core.types'

// Import utilities (already implemented and validated)
import { 
  formatTimestamp,
  formatDuration,
  formatFileSize,
  formatLatency,
  formatThroughput
} from '../../../../utils/formatting-utils'
import {
  calculateConnectionScore,
  analyzePerformancePattern,
  generateTestReport,
  classifyConnectionIssue,
  generateOptimizationSuggestions
} from '../../../../utils/connection-test-utils'

// Test suite configurations
const TEST_SUITES = {
  quick: {
    id: 'quick',
    name: 'Quick Test',
    description: 'Basic connectivity and response time',
    duration: '~10 seconds',
    tests: ['connectivity', 'authentication', 'basic_query'],
    parallel: true,
    timeout: 10000
  },
  standard: {
    id: 'standard',
    name: 'Standard Test',
    description: 'Comprehensive connection analysis',
    duration: '~30 seconds',
    tests: ['connectivity', 'authentication', 'basic_query', 'performance', 'security'],
    parallel: true,
    timeout: 30000
  },
  comprehensive: {
    id: 'comprehensive',
    name: 'Comprehensive Test',
    description: 'Full diagnostic suite with stress testing',
    duration: '~2 minutes',
    tests: ['connectivity', 'authentication', 'basic_query', 'performance', 'security', 'stress', 'failover'],
    parallel: false,
    timeout: 120000
  },
  custom: {
    id: 'custom',
    name: 'Custom Test',
    description: 'User-defined test configuration',
    duration: 'Variable',
    tests: [],
    parallel: true,
    timeout: 60000
  }
} as const

// Connection test statuses
const TEST_STATUS = {
  idle: { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Idle' },
  running: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Running' },
  success: { color: 'text-green-600', bg: 'bg-green-100', label: 'Success' },
  warning: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Warning' },
  error: { color: 'text-red-600', bg: 'bg-red-100', label: 'Error' },
  timeout: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Timeout' }
} as const

interface QuickConnectionTestProps {
  dataSourceId?: string
  defaultDataSource?: DataSource
  onTestComplete?: (result: ConnectionTestResult) => void
  autoStartTest?: boolean
  testSuite?: keyof typeof TEST_SUITES
  className?: string
}

export const QuickConnectionTest: React.FC<QuickConnectionTestProps> = ({
  dataSourceId,
  defaultDataSource,
  onTestComplete,
  autoStartTest = false,
  testSuite = 'standard',
  className
}) => {
  // Core state management
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(defaultDataSource || null)
  const [availableDataSources, setAvailableDataSources] = useState<DataSource[]>([])
  const [selectedTestSuite, setSelectedTestSuite] = useState<keyof typeof TEST_SUITES>(testSuite)
  const [customTests, setCustomTests] = useState<string[]>([])

  const [testState, setTestState] = useState<{
    isRunning: boolean
    currentTest: string
    progress: number
    status: keyof typeof TEST_STATUS
    startTime: number | null
    endTime: number | null
    results: ConnectionTestResult | null
    diagnostics: ConnectionDiagnostics | null
    logs: DiagnosticLog[]
  }>({
    isRunning: false,
    currentTest: '',
    progress: 0,
    status: 'idle',
    startTime: null,
    endTime: null,
    results: null,
    diagnostics: null,
    logs: []
  })

  const [testHistory, setTestHistory] = useState<Array<{
    timestamp: number
    dataSourceId: string
    suite: string
    result: ConnectionTestResult
    duration: number
  }>>([])

  const [realTimeMetrics, setRealTimeMetrics] = useState<{
    latency: number[]
    throughput: number[]
    errorRate: number[]
    timestamps: number[]
  }>({
    latency: [],
    throughput: [],
    errorRate: [],
    timestamps: []
  })

  // UI state
  const [activeTab, setActiveTab] = useState<'test' | 'diagnostics' | 'history' | 'settings'>('test')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showLiveLogs, setShowLiveLogs] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [enableNotifications, setEnableNotifications] = useState(true)

  // Custom hooks for comprehensive functionality
  const {
    getDataSources,
    getDataSourceById,
    getDataSourceHealth,
    getConnectionMetrics
  } = useDataSources()

  const {
    testConnection,
    runDiagnostics,
    validateConnectionPool,
    testQueryPerformance,
    checkSecurityCompliance,
    runStressTest,
    testFailoverCapability,
    generateConnectionReport
  } = useConnectionValidator()

  const {
    getCurrentUser,
    checkUserAccess
  } = useUserManagement()

  const {
    trackEvent,
    trackConnectionTest,
    logTestExecution
  } = useActivityTracker()

  const {
    showNotification
  } = useNotificationManager()

  const {
    getSystemMetrics,
    optimizePerformance
  } = useRacineOrchestration()

  // Load available data sources
  useEffect(() => {
    const loadDataSources = async () => {
      try {
        const dataSources = await getDataSources()
        setAvailableDataSources(dataSources.filter(ds => ds.isActive))

        // Auto-select data source if provided
        if (dataSourceId && !selectedDataSource) {
          const dataSource = await getDataSourceById(dataSourceId)
          if (dataSource) {
            setSelectedDataSource(dataSource)
          }
        }
      } catch (error) {
        console.error('Failed to load data sources:', error)
        showNotification({
          type: 'error',
          title: 'Loading Error',
          message: 'Failed to load available data sources.',
          duration: 3000
        })
      }
    }

    loadDataSources()
  }, [dataSourceId, selectedDataSource])

  // Auto-start test if requested
  useEffect(() => {
    if (autoStartTest && selectedDataSource && !testState.isRunning) {
      handleStartTest()
    }
  }, [autoStartTest, selectedDataSource])

  // Current test suite configuration
  const currentSuite = useMemo(() => {
    return TEST_SUITES[selectedTestSuite]
  }, [selectedTestSuite])

  // Run connection test suite
  const handleStartTest = useCallback(async () => {
    if (!selectedDataSource) {
      showNotification({
        type: 'error',
        title: 'No Data Source Selected',
        message: 'Please select a data source to test.',
        duration: 3000
      })
      return
    }

    const startTime = Date.now()
    setTestState({
      isRunning: true,
      currentTest: 'Initializing...',
      progress: 0,
      status: 'running',
      startTime,
      endTime: null,
      results: null,
      diagnostics: null,
      logs: []
    })

    setRealTimeMetrics({
      latency: [],
      throughput: [],
      errorRate: [],
      timestamps: []
    })

    try {
      const tests = selectedTestSuite === 'custom' ? customTests : currentSuite.tests
      const testResults: Record<string, any> = {}
      let overallScore = 0
      let totalTests = tests.length

      // Execute tests based on suite configuration
      for (let i = 0; i < tests.length; i++) {
        const testName = tests[i]
        const progress = ((i + 1) / totalTests) * 100

        setTestState(prev => ({
          ...prev,
          currentTest: `Running ${testName.replace('_', ' ')} test...`,
          progress
        }))

        try {
          let testResult: any = null

          switch (testName) {
            case 'connectivity':
              testResult = await testConnection(selectedDataSource.id)
              break
            case 'authentication':
              testResult = await validateConnectionPool(selectedDataSource.id)
              break
            case 'basic_query':
              testResult = await testQueryPerformance(selectedDataSource.id, 'SELECT 1')
              break
            case 'performance':
              testResult = await testQueryPerformance(selectedDataSource.id, 'PERFORMANCE_TEST')
              break
            case 'security':
              testResult = await checkSecurityCompliance(selectedDataSource.id)
              break
            case 'stress':
              testResult = await runStressTest(selectedDataSource.id, { concurrent: 10, duration: 30000 })
              break
            case 'failover':
              testResult = await testFailoverCapability(selectedDataSource.id)
              break
          }

          testResults[testName] = testResult

          // Update real-time metrics
          if (testResult.latency) {
            setRealTimeMetrics(prev => ({
              latency: [...prev.latency.slice(-19), testResult.latency],
              throughput: [...prev.throughput.slice(-19), testResult.throughput || 0],
              errorRate: [...prev.errorRate.slice(-19), testResult.errors ? testResult.errors.length : 0],
              timestamps: [...prev.timestamps.slice(-19), Date.now()]
            }))
          }

          // Calculate test score
          if (testResult.success) {
            overallScore += (1 / totalTests) * 100
          }

          // Add diagnostic log
          setTestState(prev => ({
            ...prev,
            logs: [...prev.logs, {
              timestamp: Date.now(),
              level: testResult.success ? 'info' : 'error',
              test: testName,
              message: testResult.message || (testResult.success ? 'Test passed' : 'Test failed'),
              details: testResult
            }]
          }))

        } catch (testError) {
          console.error(`Test ${testName} failed:`, testError)
          testResults[testName] = {
            success: false,
            error: (testError as Error).message,
            timestamp: Date.now()
          }

          setTestState(prev => ({
            ...prev,
            logs: [...prev.logs, {
              timestamp: Date.now(),
              level: 'error',
              test: testName,
              message: `Test failed: ${(testError as Error).message}`,
              details: { error: testError }
            }]
          }))
        }

        // Short delay between tests for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Run comprehensive diagnostics
      setTestState(prev => ({
        ...prev,
        currentTest: 'Running diagnostics...',
        progress: 95
      }))

      const diagnostics = await runDiagnostics(selectedDataSource.id)

      // Generate final results
      const connectionScore = calculateConnectionScore(testResults)
      const performanceAnalysis = analyzePerformancePattern(realTimeMetrics)
      const optimization = await generateOptimizationSuggestions(testResults, diagnostics)

      const finalResults: ConnectionTestResult = {
        dataSourceId: selectedDataSource.id,
        timestamp: endTime,
        duration,
        suite: selectedTestSuite,
        overallScore: Math.round(overallScore),
        connectionScore,
        tests: testResults,
        diagnostics,
        performance: performanceAnalysis,
        optimization,
        passed: overallScore >= 70,
        warnings: diagnostics.warnings || [],
        errors: diagnostics.errors || []
      }

      // Determine final status
      const finalStatus = overallScore >= 70 ? 'success' : 
                         overallScore >= 50 ? 'warning' : 'error'

      setTestState({
        isRunning: false,
        currentTest: '',
        progress: 100,
        status: finalStatus,
        startTime,
        endTime,
        results: finalResults,
        diagnostics,
        logs: testState.logs
      })

      // Add to history
      setTestHistory(prev => [{
        timestamp: endTime,
        dataSourceId: selectedDataSource.id,
        suite: selectedTestSuite,
        result: finalResults,
        duration
      }, ...prev.slice(0, 9)]) // Keep last 10 results

      // Track test execution
      await trackConnectionTest(selectedDataSource.id, {
        suite: selectedTestSuite,
        duration,
        score: overallScore,
        passed: finalResults.passed,
        tests: tests.length
      })

      await logTestExecution('connection_test', {
        dataSourceId: selectedDataSource.id,
        suite: selectedTestSuite,
        result: finalResults
      })

      // Show notification
      if (enableNotifications) {
        showNotification({
          type: finalResults.passed ? 'success' : 'warning',
          title: `Connection Test ${finalResults.passed ? 'Passed' : 'Issues Found'}`,
          message: `Score: ${Math.round(overallScore)}% • Duration: ${formatDuration(duration)}`,
          duration: 5000
        })
      }

      // Call callback
      onTestComplete?.(finalResults)

    } catch (error) {
      console.error('Test execution failed:', error)
      
      setTestState({
        isRunning: false,
        currentTest: '',
        progress: 0,
        status: 'error',
        startTime,
        endTime: Date.now(),
        results: null,
        diagnostics: null,
        logs: [
          ...testState.logs,
          {
            timestamp: Date.now(),
            level: 'error',
            test: 'general',
            message: `Test execution failed: ${(error as Error).message}`,
            details: { error }
          }
        ]
      })

      showNotification({
        type: 'error',
        title: 'Test Failed',
        message: 'An error occurred during test execution.',
        duration: 5000
      })
    }
  }, [selectedDataSource, selectedTestSuite, customTests, currentSuite, enableNotifications, onTestComplete])

  // Stop running test
  const handleStopTest = useCallback(() => {
    setTestState(prev => ({
      ...prev,
      isRunning: false,
      status: 'idle',
      currentTest: 'Test stopped by user'
    }))

    showNotification({
      type: 'info',
      title: 'Test Stopped',
      message: 'Connection test has been stopped.',
      duration: 2000
    })
  }, [])

  // Reset test state
  const handleResetTest = useCallback(() => {
    setTestState({
      isRunning: false,
      currentTest: '',
      progress: 0,
      status: 'idle',
      startTime: null,
      endTime: null,
      results: null,
      diagnostics: null,
      logs: []
    })

    setRealTimeMetrics({
      latency: [],
      throughput: [],
      errorRate: [],
      timestamps: []
    })
  }, [])

  // ArrowDownTrayIcon test report
  const handleDownloadReport = useCallback(async () => {
    if (!testState.results) return

    try {
      const report = await generateTestReport(testState.results)
      const blob = new Blob([report], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `connection-test-${selectedDataSource?.name}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showNotification({
        type: 'success',
        title: 'Report Downloaded',
        message: 'Test report has been downloaded successfully.',
        duration: 3000
      })
    } catch (error) {
      console.error('Failed to download report:', error)
      showNotification({
        type: 'error',
        title: 'ArrowDownTrayIcon Failed',
        message: 'Failed to generate test report.',
        duration: 3000
      })
    }
  }, [testState.results, selectedDataSource])

  // Render test status badge
  const renderStatusBadge = (status: keyof typeof TEST_STATUS) => {
    const statusConfig = TEST_STATUS[status]
    return (
      <Badge 
        variant="secondary" 
        className={cn("gap-1", statusConfig.bg, statusConfig.color)}
      >
        <div className={cn("w-2 h-2 rounded-full", statusConfig.bg.replace('bg-', 'bg-'))} />
        {statusConfig.label}
      </Badge>
    )
  }

  // Render metrics chart (simplified visualization)
  const renderMetricsChart = () => {
    if (realTimeMetrics.latency.length === 0) return null

    const maxLatency = Math.max(...realTimeMetrics.latency)
    const avgLatency = realTimeMetrics.latency.reduce((a, b) => a + b, 0) / realTimeMetrics.latency.length

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Real-time Metrics</h4>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Avg: {Math.round(avgLatency)}ms</span>
            <span>Max: {Math.round(maxLatency)}ms</span>
          </div>
        </div>
        <div className="h-20 bg-muted/50 rounded-lg p-3 relative overflow-hidden">
          <div className="flex items-end justify-between h-full gap-1">
            {realTimeMetrics.latency.map((latency, index) => {
              const height = (latency / maxLatency) * 100
              return (
                <div
                  key={index}
                  className="bg-blue-500 rounded-sm flex-1 transition-all duration-300"
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">
              Latency Pattern
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("space-y-6 max-w-2xl mx-auto", className)}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <TestTube className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Connection Test</h3>
              <p className="text-sm text-muted-foreground">
                Diagnose and validate data source connectivity
              </p>
            </div>
          </div>
          {renderStatusBadge(testState.status)}
        </div>

        {/* Data Source Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Source</Label>
                <Select
                  value={selectedDataSource?.id || ''}
                  onValueChange={(value) => {
                    const ds = availableDataSources.find(ds => ds.id === value)
                    setSelectedDataSource(ds || null)
                  }}
                  disabled={testState.isRunning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDataSources.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          <span>{ds.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {ds.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Test Suite</Label>
                <Select
                  value={selectedTestSuite}
                  onValueChange={setSelectedTestSuite as any}
                  disabled={testState.isRunning}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEST_SUITES).map(([key, suite]) => (
                      <SelectItem key={key} value={key}>
                        <div className="space-y-1">
                          <div className="font-medium">{suite.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {suite.description} • {suite.duration}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Test Suite Details */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Test Suite: {currentSuite.name}</h4>
                <Badge variant="outline">{currentSuite.tests.length} tests</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{currentSuite.description}</p>
              <div className="flex flex-wrap gap-1">
                {currentSuite.tests.map((test) => (
                  <Badge key={test} variant="secondary" className="text-xs">
                    {test.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Execution */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleStartTest}
                    disabled={!selectedDataSource || testState.isRunning}
                    className="gap-2"
                  >
                    {testState.isRunning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {testState.isRunning ? 'Running...' : 'Start Test'}
                  </Button>
                  
                  {testState.isRunning && (
                    <Button variant="outline" onClick={handleStopTest}>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={handleResetTest}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {testState.results && (
                  <Button variant="outline" onClick={handleDownloadReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                )}
              </div>

              {/* Progress Indicator */}
              <AnimatePresence>
                {testState.isRunning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span>{testState.currentTest}</span>
                      <span>{Math.round(testState.progress)}%</span>
                    </div>
                    <Progress value={testState.progress} className="h-2" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Real-time Metrics */}
              {testState.isRunning && renderMetricsChart()}

              {/* Test Results Summary */}
              <AnimatePresence>
                {testState.results && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <Separator />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {testState.results.overallScore}%
                        </div>
                        <div className="text-sm text-muted-foreground">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatDuration(testState.results.duration)}
                        </div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Object.keys(testState.results.tests).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Tests Run</div>
                      </div>
                    </div>

                    {/* Issues Summary */}
                    {(testState.results.errors.length > 0 || testState.results.warnings.length > 0) && (
                      <Alert variant={testState.results.errors.length > 0 ? 'destructive' : 'default'}>
                        {testState.results.errors.length > 0 ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        <AlertTitle>Issues Detected</AlertTitle>
                        <AlertDescription>
                          {testState.results.errors.length > 0 && (
                            <div>Errors: {testState.results.errors.length}</div>
                          )}
                          {testState.results.warnings.length > 0 && (
                            <div>Warnings: {testState.results.warnings.length}</div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results Tabs */}
        {(testState.results || testState.logs.length > 0) && (
          <Tabs value={activeTab} onValueChange={setActiveTab as any}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="test">Results</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="test" className="space-y-4">
              {testState.results && (
                <Card>
                  <CardContent className="pt-6">
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {Object.entries(testState.results.tests).map(([testName, result]) => (
                          <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {result.success ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                              )}
                              <div>
                                <div className="font-medium text-sm capitalize">
                                  {testName.replace('_', ' ')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {result.message || (result.success ? 'Passed' : 'Failed')}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {result.latency && (
                                <div className="text-sm font-medium">
                                  {formatLatency(result.latency)}
                                </div>
                              )}
                              {result.timestamp && (
                                <div className="text-xs text-muted-foreground">
                                  {formatTimestamp(result.timestamp)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {testState.logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 text-sm">
                          <div className="text-xs text-muted-foreground min-w-[60px]">
                            {formatTimestamp(log.timestamp, true)}
                          </div>
                          <Badge 
                            variant={log.level === 'error' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {log.level}
                          </Badge>
                          <div className="flex-1">
                            <div className="font-medium">{log.test}</div>
                            <div className="text-muted-foreground">{log.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {testHistory.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-3 h-3 rounded-full",
                              entry.result.passed ? "bg-green-500" : "bg-red-500"
                            )} />
                            <div>
                              <div className="font-medium text-sm">{entry.suite}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatTimestamp(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {entry.result.overallScore}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDuration(entry.duration)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Notifications</Label>
                    <Switch
                      checked={enableNotifications}
                      onCheckedChange={setEnableNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Live Logs</Label>
                    <Switch
                      checked={showLiveLogs}
                      onCheckedChange={setShowLiveLogs}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Refresh</Label>
                    <Switch
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Advanced Options</Label>
                    <Switch
                      checked={showAdvancedOptions}
                      onCheckedChange={setShowAdvancedOptions}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </motion.div>
    </TooltipProvider>
  )
}

export default QuickConnectionTest
