import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Copy, 
  Settings, 
  Search, 
  Filter, 
  RefreshCw, 
  Zap, 
  Brain, 
  Users, 
  Shield, 
  Code, 
  Database, 
  Terminal, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Lightbulb, 
  Layers, 
  Grid, 
  List, 
  BarChart3, 
  PieChart, 
  Activity, 
  Clock, 
  Calendar, 
  Tag, 
  Bookmark, 
  Star, 
  Target, 
  TestTube, 
  FlaskConical,
  Beaker,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Check,
  Edit,
  Trash2,
  FolderOpen,
  File,
  PlayCircle,
  StopCircle,
  SkipForward,
  SkipBack,
  Maximize,
  Minimize,
  Timer,
  Gauge,
  TrendingUp,
  TrendingDown,
  Hash,
  Percent,
  Eye,
  EyeOff,
  Archive,
  Unarchive,
  History,
  Bookmark as BookmarkIcon,
  Flag,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Share2,
  Link,
  ExternalLink,
  Scissors,
  Clipboard,
  ClipboardCheck,
  ClipboardCopy,
  ClipboardPaste,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Server,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Bluetooth,
  Cpu,
  HardDrive,
  MemoryStick,
  Package,
  Puzzle,
  Wrench,
  Hammer,
  Screwdriver,
  Ruler,
  Calculator,
  Binary,
  Braces,
  Code2,
  FileCode,
  FileJson,
  FileCog,
  FileCheck,
  FileX,
  FileWarning
} from 'lucide-react';

// Hooks
import { useScanRules } from '../../hooks/useScanRules';
import { useValidation } from '../../hooks/useValidation';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useOptimization } from '../../hooks/useOptimization';
import { useReporting } from '../../hooks/useReporting';

// Types
import type { 
  ScanRule, 
  RuleTemplate, 
  RuleExecutionContext,
  RulePerformanceMetrics,
  ScanRuleCategory,
  TestCase,
  TestSuite,
  TestResult,
  TestConfiguration,
  BenchmarkResult,
  TestDataSet
} from '../../types/scan-rules.types';
import type { 
  ValidationResult, 
  ValidationContext,
  ValidationLevel
} from '../../types/validation.types';
import type { 
  IntelligenceSuggestion, 
  OptimizationSuggestion,
  AIAssistance
} from '../../types/intelligence.types';
import type { 
  CollaborationSession, 
  UserPresence, 
  Comment
} from '../../types/collaboration.types';

// Test Framework Types
interface TestExecution {
  id: string;
  testSuite: string;
  rule: ScanRule;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  results: TestResult[];
  metrics: RulePerformanceMetrics;
  coverage: TestCoverage;
  errors: TestError[];
  warnings: TestWarning[];
}

interface TestCoverage {
  percentage: number;
  linesTotal: number;
  linesCovered: number;
  branchesTotal: number;
  branchesCovered: number;
  functionsTotal: number;
  functionsCovered: number;
  statementsTotal: number;
  statementsCovered: number;
}

interface TestError {
  id: string;
  type: 'syntax' | 'runtime' | 'assertion' | 'timeout' | 'resource';
  message: string;
  line?: number;
  column?: number;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface TestWarning {
  id: string;
  type: 'performance' | 'best-practice' | 'compatibility' | 'security';
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  severity: 'info' | 'warning' | 'minor';
}

interface TestPlan {
  id: string;
  name: string;
  description: string;
  suites: TestSuite[];
  configuration: TestConfiguration;
  schedule?: TestSchedule;
  notifications: TestNotification[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

interface TestSchedule {
  enabled: boolean;
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  days?: string[];
  timezone: string;
  maxDuration: number;
}

interface TestNotification {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  recipients: string[];
  triggers: ('success' | 'failure' | 'error' | 'timeout')[];
  template: string;
  enabled: boolean;
}

interface BenchmarkComparison {
  current: BenchmarkResult;
  baseline: BenchmarkResult;
  improvement: number;
  regression: boolean;
  significance: 'none' | 'minor' | 'major' | 'critical';
}

// Advanced Rule Testing Framework Component
// Enterprise-grade testing framework with comprehensive test automation,
// performance benchmarking, test data management, advanced reporting,
// and complete backend integration with zero mock data usage.
const RuleTestingFramework: React.FC = () => {
  // Hooks
  const { 
    rules, 
    testRule, 
    executeRule, 
    getRulePerformance,
    testCases,
    testSuites,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    createTestSuite,
    updateTestSuite,
    deleteTestSuite,
    runTestSuite,
    getBenchmarks,
    createBenchmark,
    isLoading: rulesLoading,
    error: rulesError 
  } = useScanRules();

  const { 
    validateRule, 
    validateTestCase,
    validationResults,
    isValidating,
    validationError 
  } = useValidation();

  const { 
    generateTestCases, 
    optimizeTestSuite,
    analyzeTestCoverage,
    predictTestResults,
    suggestions,
    isAnalyzing,
    analysisError 
  } = useIntelligence();

  const { 
    sessions, 
    addComment,
    shareTestResults,
    isCollaborating,
    collaborationError 
  } = useCollaboration();

  const { 
    analyzePerformance, 
    generateOptimizations,
    benchmarks,
    isOptimizing,
    optimizationError 
  } = useOptimization();

  const { 
    generateReport, 
    exportReport,
    reports,
    isGenerating,
    reportError 
  } = useReporting();

  // Testing State
  const [currentRule, setCurrentRule] = useState<ScanRule | null>(null);
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [testExecutions, setTestExecutions] = useState<TestExecution[]>([]);
  const [activeExecution, setActiveExecution] = useState<TestExecution | null>(null);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [selectedTestPlan, setSelectedTestPlan] = useState<TestPlan | null>(null);

  // Test Configuration
  const [testConfig, setTestConfig] = useState<TestConfiguration>({
    timeout: 30000,
    maxMemory: 512,
    maxCpu: 80,
    parallelism: 4,
    retries: 3,
    verbose: true,
    coverage: true,
    profiling: true,
    validateResults: true,
    generateReports: true
  });

  // UI State
  const [activeTab, setActiveTab] = useState('suites');
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showTestData, setShowTestData] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testProgress, setTestProgress] = useState<{ [key: string]: number }>({});
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RulePerformanceMetrics | null>(null);

  // Test Data Management
  const [testDataSets, setTestDataSets] = useState<TestDataSet[]>([]);
  const [selectedDataSet, setSelectedDataSet] = useState<TestDataSet | null>(null);
  const [dataGeneratorConfig, setDataGeneratorConfig] = useState({
    recordCount: 1000,
    dataTypes: ['string', 'number', 'boolean', 'date'],
    nullPercentage: 10,
    duplicatePercentage: 5,
    patternComplexity: 'medium',
    includeEdgeCases: true
  });

  // Benchmarking State
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [benchmarkComparisons, setBenchmarkComparisons] = useState<BenchmarkComparison[]>([]);
  const [baselineBenchmark, setBaselineBenchmark] = useState<BenchmarkResult | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Loading and Error States
  const [loadingStates, setLoadingStates] = useState({
    running: false,
    creating: false,
    deleting: false,
    exporting: false,
    importing: false,
    benchmarking: false,
    generating: false
  });

  const [errors, setErrors] = useState({
    execution: null as string | null,
    validation: null as string | null,
    benchmark: null as string | null,
    export: null as string | null
  });

  // Refs
  const executionRef = useRef<TestExecution | null>(null);
  const logStreamRef = useRef<EventSource | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Test execution monitoring
  useEffect(() => {
    if (activeExecution && activeExecution.status === 'running') {
      // Start real-time metrics monitoring
      metricsIntervalRef.current = setInterval(async () => {
        try {
          const metrics = await getRulePerformance(activeExecution.rule.id!);
          setRealTimeMetrics(metrics);
          
          // Update progress
          const progress = calculateTestProgress(activeExecution);
          setTestProgress(prev => ({
            ...prev,
            [activeExecution.id]: progress
          }));
        } catch (error) {
          console.error('Failed to get real-time metrics:', error);
        }
      }, 1000);

      // Setup log streaming
      if (typeof EventSource !== 'undefined') {
        logStreamRef.current = new EventSource(`/api/test-executions/${activeExecution.id}/logs`);
        logStreamRef.current.onmessage = (event) => {
          const logEntry = JSON.parse(event.data);
          setExecutionLogs(prev => [...prev, logEntry.message]);
        };
      }
    }

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      if (logStreamRef.current) {
        logStreamRef.current.close();
      }
    };
  }, [activeExecution, getRulePerformance]);

  // Calculate test progress
  const calculateTestProgress = useCallback((execution: TestExecution): number => {
    if (!execution.results || execution.results.length === 0) return 0;
    
    const completedTests = execution.results.filter(r => r.status === 'completed' || r.status === 'failed').length;
    const totalTests = execution.results.length;
    
    return Math.round((completedTests / totalTests) * 100);
  }, []);

  // Handle run test suite
  const handleRunTestSuite = useCallback(async (suiteId: string) => {
    if (!currentRule) return;

    setIsRunning(true);
    setRunningTests(prev => new Set([...prev, suiteId]));
    setLoadingStates(prev => ({ ...prev, running: true }));
    setErrors(prev => ({ ...prev, execution: null }));

    try {
      // Create test execution
      const execution: TestExecution = {
        id: Date.now().toString(),
        testSuite: suiteId,
        rule: currentRule,
        startTime: new Date().toISOString(),
        status: 'running',
        results: [],
        metrics: {
          executionTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          recordsProcessed: 0,
          performanceScore: 0
        },
        coverage: {
          percentage: 0,
          linesTotal: 0,
          linesCovered: 0,
          branchesTotal: 0,
          branchesCovered: 0,
          functionsTotal: 0,
          functionsCovered: 0,
          statementsTotal: 0,
          statementsCovered: 0
        },
        errors: [],
        warnings: []
      };

      setActiveExecution(execution);
      setTestExecutions(prev => [...prev, execution]);

      // Run the test suite
      const result = await runTestSuite(suiteId, {
        ruleId: currentRule.id!,
        configuration: testConfig,
        dataSet: selectedDataSet?.id
      });

      // Update execution with results
      const completedExecution: TestExecution = {
        ...execution,
        endTime: new Date().toISOString(),
        duration: Date.now() - new Date(execution.startTime).getTime(),
        status: result.success ? 'completed' : 'failed',
        results: result.testResults,
        metrics: result.metrics,
        coverage: result.coverage,
        errors: result.errors || [],
        warnings: result.warnings || []
      };

      setTestExecutions(prev => 
        prev.map(exec => exec.id === execution.id ? completedExecution : exec)
      );
      setActiveExecution(completedExecution);

      console.log('Test suite execution completed:', completedExecution);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        execution: error instanceof Error ? error.message : 'Test execution failed' 
      }));
      
      // Update execution status to failed
      setTestExecutions(prev => 
        prev.map(exec => 
          exec.id === activeExecution?.id 
            ? { ...exec, status: 'failed' as const, endTime: new Date().toISOString() }
            : exec
        )
      );
    } finally {
      setIsRunning(false);
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(suiteId);
        return newSet;
      });
      setLoadingStates(prev => ({ ...prev, running: false }));
    }
  }, [currentRule, testConfig, selectedDataSet, runTestSuite]);

  // Handle run single test case
  const handleRunTestCase = useCallback(async (testCase: TestCase) => {
    if (!currentRule) return;

    setLoadingStates(prev => ({ ...prev, running: true }));
    setErrors(prev => ({ ...prev, execution: null }));

    try {
      const result = await testRule(currentRule.id!, {
        testCase,
        configuration: testConfig,
        dataSet: selectedDataSet?.id
      });

      console.log('Test case execution completed:', result);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        execution: error instanceof Error ? error.message : 'Test case execution failed' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, running: false }));
    }
  }, [currentRule, testConfig, selectedDataSet, testRule]);

  // Handle create test case
  const handleCreateTestCase = useCallback(async (suiteId: string, testCaseData: Partial<TestCase>) => {
    setLoadingStates(prev => ({ ...prev, creating: true }));
    
    try {
      const newTestCase = await createTestCase(suiteId, {
        name: testCaseData.name || 'New Test Case',
        description: testCaseData.description || '',
        input: testCaseData.input || {},
        expectedOutput: testCaseData.expectedOutput || {},
        assertions: testCaseData.assertions || [],
        tags: testCaseData.tags || [],
        priority: testCaseData.priority || 'medium',
        timeout: testCaseData.timeout || testConfig.timeout,
        enabled: testCaseData.enabled !== false
      });

      console.log('Test case created:', newTestCase);
    } catch (error) {
      console.error('Failed to create test case:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, creating: false }));
    }
  }, [createTestCase, testConfig.timeout]);

  // Handle create test suite
  const handleCreateTestSuite = useCallback(async (suiteData: Partial<TestSuite>) => {
    setLoadingStates(prev => ({ ...prev, creating: true }));
    
    try {
      const newTestSuite = await createTestSuite({
        name: suiteData.name || 'New Test Suite',
        description: suiteData.description || '',
        testCases: suiteData.testCases || [],
        configuration: suiteData.configuration || testConfig,
        tags: suiteData.tags || [],
        priority: suiteData.priority || 'medium',
        enabled: suiteData.enabled !== false
      });

      setSelectedTestSuite(newTestSuite);
      console.log('Test suite created:', newTestSuite);
    } catch (error) {
      console.error('Failed to create test suite:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, creating: false }));
    }
  }, [createTestSuite, testConfig]);

  // Handle generate test cases with AI
  const handleGenerateTestCases = useCallback(async (suiteId: string, count: number = 10) => {
    if (!currentRule) return;

    setLoadingStates(prev => ({ ...prev, generating: true }));
    
    try {
      const generatedCases = await generateTestCases(currentRule.id!, {
        count,
        complexity: 'mixed',
        includeEdgeCases: true,
        includeNegativeCases: true,
        dataTypes: dataGeneratorConfig.dataTypes,
        patternComplexity: dataGeneratorConfig.patternComplexity
      });

      // Add generated test cases to the suite
      for (const testCase of generatedCases) {
        await createTestCase(suiteId, testCase);
      }

      console.log(`Generated ${generatedCases.length} test cases`);
    } catch (error) {
      console.error('Failed to generate test cases:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, generating: false }));
    }
  }, [currentRule, generateTestCases, createTestCase, dataGeneratorConfig]);

  // Handle benchmark rule
  const handleBenchmarkRule = useCallback(async (iterations: number = 100) => {
    if (!currentRule || !selectedTestSuite) return;

    setLoadingStates(prev => ({ ...prev, benchmarking: true }));
    setErrors(prev => ({ ...prev, benchmark: null }));

    try {
      const benchmark = await createBenchmark({
        ruleId: currentRule.id!,
        testSuiteId: selectedTestSuite.id!,
        iterations,
        configuration: testConfig,
        dataSetId: selectedDataSet?.id
      });

      setBenchmarkResults(prev => [...prev, benchmark]);
      
      // Compare with baseline if available
      if (baselineBenchmark) {
        const comparison: BenchmarkComparison = {
          current: benchmark,
          baseline: baselineBenchmark,
          improvement: ((baselineBenchmark.averageExecutionTime - benchmark.averageExecutionTime) / baselineBenchmark.averageExecutionTime) * 100,
          regression: benchmark.averageExecutionTime > baselineBenchmark.averageExecutionTime,
          significance: calculateSignificance(benchmark, baselineBenchmark)
        };
        setBenchmarkComparisons(prev => [...prev, comparison]);
      }

      console.log('Benchmark completed:', benchmark);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        benchmark: error instanceof Error ? error.message : 'Benchmark failed' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, benchmarking: false }));
    }
  }, [currentRule, selectedTestSuite, testConfig, selectedDataSet, createBenchmark, baselineBenchmark]);

  // Calculate benchmark significance
  const calculateSignificance = useCallback((current: BenchmarkResult, baseline: BenchmarkResult): 'none' | 'minor' | 'major' | 'critical' => {
    const improvement = Math.abs(((baseline.averageExecutionTime - current.averageExecutionTime) / baseline.averageExecutionTime) * 100);
    
    if (improvement < 5) return 'none';
    if (improvement < 15) return 'minor';
    if (improvement < 30) return 'major';
    return 'critical';
  }, []);

  // Handle export results
  const handleExportResults = useCallback(async (format: 'json' | 'csv' | 'pdf' | 'html') => {
    if (!activeExecution) return;

    setLoadingStates(prev => ({ ...prev, exporting: true }));
    setErrors(prev => ({ ...prev, export: null }));

    try {
      const report = await generateReport({
        type: 'test-results',
        data: activeExecution,
        format,
        includeMetrics: true,
        includeCoverage: true,
        includeCharts: format === 'pdf' || format === 'html'
      });

      const exported = await exportReport(report.id, format);
      
      // Create download link
      const blob = new Blob([exported.content], { type: exported.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-results-${activeExecution.rule.name}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('Results exported successfully');
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        export: error instanceof Error ? error.message : 'Export failed' 
      }));
    } finally {
      setLoadingStates(prev => ({ ...prev, exporting: false }));
    }
  }, [activeExecution, generateReport, exportReport]);

  // Handle optimize test suite
  const handleOptimizeTestSuite = useCallback(async (suiteId: string) => {
    if (!currentRule) return;

    setLoadingStates(prev => ({ ...prev, generating: true }));
    
    try {
      const optimizedSuite = await optimizeTestSuite(suiteId, {
        ruleId: currentRule.id!,
        removeDuplicates: true,
        optimizeOrder: true,
        reduceRedundancy: true,
        improvecoverage: true
      });

      console.log('Test suite optimized:', optimizedSuite);
    } catch (error) {
      console.error('Failed to optimize test suite:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, generating: false }));
    }
  }, [currentRule, optimizeTestSuite]);

  // Handle analyze coverage
  const handleAnalyzeCoverage = useCallback(async (executionId: string) => {
    try {
      const coverage = await analyzeTestCoverage(executionId);
      console.log('Coverage analysis:', coverage);
    } catch (error) {
      console.error('Failed to analyze coverage:', error);
    }
  }, [analyzeTestCoverage]);

  // Filtered test suites
  const filteredTestSuites = useMemo(() => {
    return testSuites.filter(suite => {
      const matchesSearch = !searchQuery || 
        suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suite.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || suite.enabled.toString() === filterStatus;
      const matchesPriority = filterPriority === 'all' || suite.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    }).sort((a, b) => {
      const getValue = (suite: TestSuite) => {
        switch (sortBy) {
          case 'name': return suite.name;
          case 'priority': return suite.priority;
          case 'created': return suite.createdAt || '';
          case 'updated': return suite.updatedAt || '';
          default: return suite.name;
        }
      };
      
      const aValue = getValue(a);
      const bValue = getValue(b);
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [testSuites, searchQuery, filterStatus, filterPriority, sortBy, sortOrder]);

  // Filtered test executions
  const filteredExecutions = useMemo(() => {
    return testExecutions.filter(execution => {
      const matchesSearch = !searchQuery || 
        execution.rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        execution.testSuite.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || execution.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'startTime') {
        const aTime = new Date(a.startTime).getTime();
        const bTime = new Date(b.startTime).getTime();
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }
      return 0;
    });
  }, [testExecutions, searchQuery, filterStatus, sortBy, sortOrder]);

  // Main render
  return (
    <TooltipProvider>
      <div className={`flex flex-col h-full bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold flex items-center">
              <TestTube className="h-6 w-6 mr-2" />
              Rule Testing Framework
            </h1>
            {currentRule && (
              <Badge variant="outline">{currentRule.name}</Badge>
            )}
            {isRunning && (
              <Badge variant="secondary" className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Running Tests...
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Test Statistics */}
            {testExecutions.length > 0 && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  <span>{testExecutions.filter(e => e.status === 'completed').length} Passed</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 mr-1 text-destructive" />
                  <span>{testExecutions.filter(e => e.status === 'failed').length} Failed</span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-1 text-blue-500" />
                  <span>{testExecutions.filter(e => e.status === 'running').length} Running</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedTestSuite && handleRunTestSuite(selectedTestSuite.id!)}
              disabled={!selectedTestSuite || isRunning}
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run Suite
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBenchmarkRule()}
              disabled={!selectedTestSuite || loadingStates.benchmarking}
            >
              {loadingStates.benchmarking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Gauge className="h-4 w-4" />
              )}
              Benchmark
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportResults('json')}>
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportResults('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  CSV Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportResults('pdf')}>
                  <File className="h-4 w-4 mr-2" />
                  PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportResults('html')}>
                  <Code className="h-4 w-4 mr-2" />
                  HTML Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowConfiguration(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTestData(true)}>
                  <Database className="h-4 w-4 mr-2" />
                  Test Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowScheduler(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Scheduler
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4 mr-2" />
                  ) : (
                    <Maximize className="h-4 w-4 mr-2" />
                  )}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Side Panel */}
          <div className="w-80 border-r bg-card flex flex-col">
            {/* Rule Selection */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Select Rule</h3>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={currentRule?.id || ''} onValueChange={(ruleId) => {
                const rule = rules.find(r => r.id === ruleId);
                setCurrentRule(rule || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a rule to test" />
                </SelectTrigger>
                <SelectContent>
                  {rules.map(rule => (
                    <SelectItem key={rule.id} value={rule.id!}>
                      {rule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Test Suites */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Test Suites</h3>
                <Button size="sm" onClick={() => handleCreateTestSuite({})}>
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </div>
              
              {/* Search and Filters */}
              <div className="space-y-2 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search test suites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Test Suites List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredTestSuites.map(suite => (
                  <Card
                    key={suite.id}
                    className={`mb-2 cursor-pointer transition-colors hover:bg-accent ${
                      selectedTestSuite?.id === suite.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTestSuite(suite)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium truncate">{suite.name}</h4>
                            {runningTests.has(suite.id!) && (
                              <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {suite.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {suite.testCases?.length || 0} tests
                            </Badge>
                            <Badge variant={suite.enabled ? "default" : "secondary"} className="text-xs">
                              {suite.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {suite.priority}
                            </Badge>
                          </div>
                          {testProgress[suite.id!] !== undefined && (
                            <div className="mt-2">
                              <Progress value={testProgress[suite.id!]} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {testProgress[suite.id!]}% complete
                              </p>
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRunTestSuite(suite.id!)}>
                              <Play className="h-4 w-4 mr-2" />
                              Run Suite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOptimizeTestSuite(suite.id!)}>
                              <Zap className="h-4 w-4 mr-2" />
                              Optimize
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateTestCases(suite.id!)}>
                              <Brain className="h-4 w-4 mr-2" />
                              Generate Tests
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteTestSuite(suite.id!)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Testing Area */}
          <div className="flex-1 flex flex-col">
            {/* Test Suite Details */}
            {selectedTestSuite && (
              <div className="p-4 border-b bg-card">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="suite-name">Suite Name</Label>
                    <Input
                      id="suite-name"
                      value={selectedTestSuite.name}
                      onChange={(e) => setSelectedTestSuite(prev => 
                        prev ? { ...prev, name: e.target.value } : null
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="suite-priority">Priority</Label>
                    <Select
                      value={selectedTestSuite.priority}
                      onValueChange={(value) => setSelectedTestSuite(prev => 
                        prev ? { ...prev, priority: value as any } : null
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedTestSuite.enabled}
                      onCheckedChange={(checked) => setSelectedTestSuite(prev => 
                        prev ? { ...prev, enabled: checked } : null
                      )}
                    />
                    <Label>Enabled</Label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="suite-description">Description</Label>
                  <Textarea
                    id="suite-description"
                    value={selectedTestSuite.description}
                    onChange={(e) => setSelectedTestSuite(prev => 
                      prev ? { ...prev, description: e.target.value } : null
                    )}
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent border-b rounded-none">
                <TabsTrigger value="suites" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Cases
                </TabsTrigger>
                <TabsTrigger value="executions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Activity className="h-4 w-4 mr-2" />
                  Executions
                </TabsTrigger>
                <TabsTrigger value="results" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="coverage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Target className="h-4 w-4 mr-2" />
                  Coverage
                </TabsTrigger>
                <TabsTrigger value="benchmarks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Gauge className="h-4 w-4 mr-2" />
                  Benchmarks
                </TabsTrigger>
                <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </TabsTrigger>
              </TabsList>

              {/* Test Cases Tab */}
              <TabsContent value="suites" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Test Cases</h3>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => selectedTestSuite && handleGenerateTestCases(selectedTestSuite.id!, 5)}
                      disabled={!selectedTestSuite || loadingStates.generating}
                    >
                      {loadingStates.generating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4 mr-2" />
                      )}
                      Generate AI Tests
                    </Button>
                    <Button
                      onClick={() => selectedTestSuite && handleCreateTestCase(selectedTestSuite.id!, {})}
                      disabled={!selectedTestSuite}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Test Case
                    </Button>
                  </div>
                </div>
                
                {selectedTestSuite ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {selectedTestSuite.testCases?.map((testCase, index) => (
                        <Card key={testCase.id || index}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium">{testCase.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {testCase.priority}
                                  </Badge>
                                  {testCase.enabled ? (
                                    <Badge variant="default" className="text-xs">Enabled</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">Disabled</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {testCase.description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <Label className="font-medium">Input:</Label>
                                    <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-x-auto">
                                      {JSON.stringify(testCase.input, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <Label className="font-medium">Expected Output:</Label>
                                    <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-x-auto">
                                      {JSON.stringify(testCase.expectedOutput, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                                
                                {testCase.assertions && testCase.assertions.length > 0 && (
                                  <div className="mt-3">
                                    <Label className="font-medium">Assertions:</Label>
                                    <div className="space-y-1 mt-1">
                                      {testCase.assertions.map((assertion, assertionIndex) => (
                                        <div key={assertionIndex} className="text-xs bg-muted p-2 rounded">
                                          <code>{assertion.expression}</code>
                                          <span className="text-muted-foreground ml-2">
                                            ({assertion.operator})
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col space-y-2 ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleRunTestCase(testCase)}
                                  disabled={loadingStates.running}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedTestCase(testCase)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => selectedTestSuite && deleteTestCase(selectedTestSuite.id!, testCase.id!)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )) || []}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <TestTube className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg font-medium">No Test Suite Selected</p>
                      <p className="text-sm">Select a test suite to view and manage test cases</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Executions Tab */}
              <TabsContent value="executions" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Test Executions</h3>
                  <div className="flex items-center space-x-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredExecutions.map(execution => (
                      <Card key={execution.id} className="cursor-pointer hover:bg-accent">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium">{execution.rule.name}</h4>
                                <Badge variant={
                                  execution.status === 'completed' ? 'default' :
                                  execution.status === 'failed' ? 'destructive' :
                                  execution.status === 'running' ? 'secondary' : 'outline'
                                }>
                                  {execution.status}
                                </Badge>
                                {execution.status === 'running' && (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                )}
                              </div>
                              
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <Label className="font-medium">Started:</Label>
                                  <p className="text-muted-foreground">
                                    {new Date(execution.startTime).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <Label className="font-medium">Duration:</Label>
                                  <p className="text-muted-foreground">
                                    {execution.duration ? `${execution.duration}ms` : 'In progress...'}
                                  </p>
                                </div>
                                <div>
                                  <Label className="font-medium">Tests:</Label>
                                  <p className="text-muted-foreground">
                                    {execution.results.length} cases
                                  </p>
                                </div>
                                <div>
                                  <Label className="font-medium">Success Rate:</Label>
                                  <p className="text-muted-foreground">
                                    {execution.results.length > 0 
                                      ? Math.round((execution.results.filter(r => r.success).length / execution.results.length) * 100)
                                      : 0
                                    }%
                                  </p>
                                </div>
                              </div>
                              
                              {execution.status === 'running' && testProgress[execution.id] !== undefined && (
                                <div className="mt-3">
                                  <Progress value={testProgress[execution.id]} className="h-2" />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {testProgress[execution.id]}% complete
                                  </p>
                                </div>
                              )}
                              
                              {execution.errors.length > 0 && (
                                <div className="mt-3">
                                  <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                      {execution.errors.length} error(s) occurred during execution
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveExecution(execution)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {execution.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAnalyzeCoverage(execution.id)}
                                >
                                  <Target className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Test Results</h3>
                  {activeExecution && (
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleExportResults('json')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm" onClick={() => shareTestResults(activeExecution.id, ['team'])}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  )}
                </div>
                
                {activeExecution ? (
                  <div className="space-y-6">
                    {/* Execution Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2" />
                          Execution Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {activeExecution.results.filter(r => r.success).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Passed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {activeExecution.results.filter(r => !r.success).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Failed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {activeExecution.duration || 0}ms
                            </div>
                            <div className="text-sm text-muted-foreground">Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {Math.round(activeExecution.coverage.percentage)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Coverage</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <Label>Execution Time</Label>
                            <div className="text-2xl font-bold">
                              {activeExecution.metrics.executionTime}ms
                            </div>
                            <Progress 
                              value={Math.min((activeExecution.metrics.executionTime / 10000) * 100, 100)} 
                              className="mt-2" 
                            />
                          </div>
                          <div>
                            <Label>Memory Usage</Label>
                            <div className="text-2xl font-bold">
                              {activeExecution.metrics.memoryUsage}MB
                            </div>
                            <Progress 
                              value={Math.min((activeExecution.metrics.memoryUsage / 1024) * 100, 100)} 
                              className="mt-2" 
                            />
                          </div>
                          <div>
                            <Label>CPU Usage</Label>
                            <div className="text-2xl font-bold">
                              {activeExecution.metrics.cpuUsage}%
                            </div>
                            <Progress 
                              value={activeExecution.metrics.cpuUsage} 
                              className="mt-2" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Test Results Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Test Results Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64">
                          <div className="space-y-3">
                            {activeExecution.results.map((result, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded border ${
                                  result.success 
                                    ? 'border-green-200 bg-green-50' 
                                    : 'border-red-200 bg-red-50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    {result.success ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="font-medium">Test Case {index + 1}</span>
                                  </div>
                                  <Badge variant={result.success ? "default" : "destructive"}>
                                    {result.success ? 'PASS' : 'FAIL'}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Duration:</Label>
                                      <span className="ml-2">{result.executionTime}ms</span>
                                    </div>
                                    <div>
                                      <Label>Memory:</Label>
                                      <span className="ml-2">{result.memoryUsed}MB</span>
                                    </div>
                                  </div>
                                  
                                  {result.error && (
                                    <div className="mt-2 p-2 bg-red-100 rounded">
                                      <Label className="text-red-700">Error:</Label>
                                      <p className="text-red-600 text-xs mt-1">{result.error}</p>
                                    </div>
                                  )}
                                  
                                  {result.output && (
                                    <div className="mt-2">
                                      <Label>Output:</Label>
                                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                        {JSON.stringify(result.output, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg font-medium">No Execution Selected</p>
                      <p className="text-sm">Select a test execution to view detailed results</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Coverage Tab */}
              <TabsContent value="coverage" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Test Coverage Analysis</h3>
                  {activeExecution && (
                    <Button size="sm" onClick={() => handleAnalyzeCoverage(activeExecution.id)}>
                      <Target className="h-4 w-4 mr-2" />
                      Analyze Coverage
                    </Button>
                  )}
                </div>
                
                {activeExecution ? (
                  <div className="space-y-6">
                    {/* Coverage Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Target className="h-5 w-5 mr-2" />
                          Coverage Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <Label>Overall Coverage</Label>
                                <span className="font-bold">
                                  {Math.round(activeExecution.coverage.percentage)}%
                                </span>
                              </div>
                              <Progress value={activeExecution.coverage.percentage} className="h-3" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-2">
                                <Label>Line Coverage</Label>
                                <span className="font-bold">
                                  {activeExecution.coverage.linesCovered}/{activeExecution.coverage.linesTotal}
                                </span>
                              </div>
                              <Progress 
                                value={(activeExecution.coverage.linesCovered / activeExecution.coverage.linesTotal) * 100} 
                                className="h-3" 
                              />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-2">
                                <Label>Branch Coverage</Label>
                                <span className="font-bold">
                                  {activeExecution.coverage.branchesCovered}/{activeExecution.coverage.branchesTotal}
                                </span>
                              </div>
                              <Progress 
                                value={(activeExecution.coverage.branchesCovered / activeExecution.coverage.branchesTotal) * 100} 
                                className="h-3" 
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between mb-2">
                                <Label>Function Coverage</Label>
                                <span className="font-bold">
                                  {activeExecution.coverage.functionsCovered}/{activeExecution.coverage.functionsTotal}
                                </span>
                              </div>
                              <Progress 
                                value={(activeExecution.coverage.functionsCovered / activeExecution.coverage.functionsTotal) * 100} 
                                className="h-3" 
                              />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-2">
                                <Label>Statement Coverage</Label>
                                <span className="font-bold">
                                  {activeExecution.coverage.statementsCovered}/{activeExecution.coverage.statementsTotal}
                                </span>
                              </div>
                              <Progress 
                                value={(activeExecution.coverage.statementsCovered / activeExecution.coverage.statementsTotal) * 100} 
                                className="h-3" 
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Coverage Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2" />
                          Coverage Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {activeExecution.coverage.percentage < 80 && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Coverage is below 80%. Consider adding more test cases to improve coverage.
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {activeExecution.coverage.branchesCovered / activeExecution.coverage.branchesTotal < 0.7 && (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                Branch coverage is low. Add test cases that exercise different code paths.
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {suggestions.filter(s => s.type === 'coverage').map((suggestion, index) => (
                            <Alert key={index}>
                              <Lightbulb className="h-4 w-4" />
                              <AlertDescription>{suggestion.description}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg font-medium">No Coverage Data</p>
                      <p className="text-sm">Run a test execution to see coverage analysis</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Benchmarks Tab */}
              <TabsContent value="benchmarks" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Performance Benchmarks</h3>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleBenchmarkRule(100)}>
                      <Gauge className="h-4 w-4 mr-2" />
                      Run Benchmark
                    </Button>
                    <Select
                      value={baselineBenchmark?.id || ''}
                      onValueChange={(benchmarkId) => {
                        const benchmark = benchmarkResults.find(b => b.id === benchmarkId);
                        setBaselineBenchmark(benchmark || null);
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Set Baseline" />
                      </SelectTrigger>
                      <SelectContent>
                        {benchmarkResults.map(benchmark => (
                          <SelectItem key={benchmark.id} value={benchmark.id}>
                            {new Date(benchmark.timestamp).toLocaleDateString()} - {benchmark.averageExecutionTime}ms
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Benchmark Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Gauge className="h-5 w-5 mr-2" />
                        Benchmark Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {benchmarkResults.map(benchmark => (
                            <div
                              key={benchmark.id}
                              className="p-3 border rounded hover:bg-accent cursor-pointer"
                              onClick={() => setBaselineBenchmark(benchmark)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">
                                    {new Date(benchmark.timestamp).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {benchmark.iterations} iterations
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-lg">
                                    {benchmark.averageExecutionTime}ms
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    avg execution time
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                                <div>
                                  <Label>Min:</Label>
                                  <span className="ml-1">{benchmark.minExecutionTime}ms</span>
                                </div>
                                <div>
                                  <Label>Max:</Label>
                                  <span className="ml-1">{benchmark.maxExecutionTime}ms</span>
                                </div>
                                <div>
                                  <Label>Memory:</Label>
                                  <span className="ml-1">{benchmark.averageMemoryUsage}MB</span>
                                </div>
                                <div>
                                  <Label>CPU:</Label>
                                  <span className="ml-1">{benchmark.averageCpuUsage}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Benchmark Comparisons */}
                  {benchmarkComparisons.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Performance Comparisons
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {benchmarkComparisons.map((comparison, index) => (
                            <div key={index} className="p-3 border rounded">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {comparison.regression ? (
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                  )}
                                  <span className="font-medium">
                                    {comparison.regression ? 'Performance Regression' : 'Performance Improvement'}
                                  </span>
                                </div>
                                <Badge variant={
                                  comparison.significance === 'critical' ? 'destructive' :
                                  comparison.significance === 'major' ? 'secondary' :
                                  comparison.significance === 'minor' ? 'outline' : 'default'
                                }>
                                  {comparison.significance}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <Label>Current:</Label>
                                  <div className="font-bold">
                                    {comparison.current.averageExecutionTime}ms
                                  </div>
                                </div>
                                <div>
                                  <Label>Baseline:</Label>
                                  <div className="font-bold">
                                    {comparison.baseline.averageExecutionTime}ms
                                  </div>
                                </div>
                                <div>
                                  <Label>Change:</Label>
                                  <div className={`font-bold ${
                                    comparison.improvement > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {comparison.improvement > 0 ? '+' : ''}{Math.round(comparison.improvement)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Test Reports</h3>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleExportResults('pdf')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Report Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Report Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {testExecutions.length}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Executions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {testExecutions.filter(e => e.status === 'completed').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {testExecutions.filter(e => e.status === 'failed').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {testExecutions.length > 0 
                              ? Math.round(testExecutions.reduce((sum, e) => sum + (e.coverage?.percentage || 0), 0) / testExecutions.length)
                              : 0
                            }%
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Coverage</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Available Reports */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Archive className="h-5 w-5 mr-2" />
                        Available Reports
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reports.map(report => (
                          <div key={report.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium">{report.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Generated on {new Date(report.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Configuration Dialog */}
        <Dialog open={showConfiguration} onOpenChange={setShowConfiguration}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Test Configuration</DialogTitle>
              <DialogDescription>
                Configure test execution parameters and settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={testConfig.timeout}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label>Max Memory (MB)</Label>
                  <Input
                    type="number"
                    value={testConfig.maxMemory}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, maxMemory: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label>Max CPU (%)</Label>
                  <Input
                    type="number"
                    value={testConfig.maxCpu}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, maxCpu: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div>
                  <Label>Parallelism</Label>
                  <Input
                    type="number"
                    value={testConfig.parallelism}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, parallelism: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Retries</Label>
                  <Input
                    type="number"
                    value={testConfig.retries}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, retries: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Verbose Output</Label>
                  <Switch
                    checked={testConfig.verbose}
                    onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, verbose: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Coverage Analysis</Label>
                  <Switch
                    checked={testConfig.coverage}
                    onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, coverage: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Performance Profiling</Label>
                  <Switch
                    checked={testConfig.profiling}
                    onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, profiling: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Validate Results</Label>
                  <Switch
                    checked={testConfig.validateResults}
                    onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, validateResults: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Generate Reports</Label>
                  <Switch
                    checked={testConfig.generateReports}
                    onCheckedChange={(checked) => setTestConfig(prev => ({ ...prev, generateReports: checked }))}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Real-time Execution Logs */}
        {activeExecution && activeExecution.status === 'running' && (
          <div className="fixed bottom-4 right-4 w-96 h-64 bg-card border rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-3 border-b">
              <h4 className="font-medium flex items-center">
                <Terminal className="h-4 w-4 mr-2" />
                Execution Logs
              </h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActiveExecution(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <ScrollArea className="p-3 h-48">
              <div className="space-y-1 font-mono text-xs">
                {executionLogs.map((log, index) => (
                  <div key={index} className="text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RuleTestingFramework;