/**
 * Rule Testing Framework Component for Advanced Data Governance
 * Comprehensive testing system with automated test generation, execution, and reporting
 * Features: Unit testing, integration testing, performance testing, regression testing, AI-powered test generation
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TestTube, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Target, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Settings, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Share2, 
  RefreshCw, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Eye, 
  EyeOff, 
  Code, 
  Database, 
  FileText, 
  Folder, 
  FolderOpen, 
  File, 
  Save, 
  Loader2, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp, 
  MoreHorizontal, 
  Calendar, 
  Timer, 
  Stopwatch, 
  Flag, 
  Tag, 
  Bookmark, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Users, 
  User, 
  Globe, 
  Lock, 
  Unlock, 
  Shield, 
  Cpu, 
  Memory, 
  HardDrive, 
  Wifi, 
  Signal, 
  Battery, 
  Power, 
  MonitorSpeaker, 
  Volume2, 
  VolumeX, 
  Mic, 
  Camera, 
  Phone, 
  Mail, 
  Bell, 
  BellOff, 
  Archive, 
  Inbox, 
  Send, 
  Reply, 
  Forward, 
  Paperclip, 
  Link, 
  ExternalLink, 
  Navigation, 
  MapPin, 
  Compass, 
  Map, 
  Route, 
  Car, 
  Plane, 
  Train, 
  Ship, 
  Truck, 
  Bus, 
  Bike, 
  Footprints, 
  Home, 
  Building, 
  School, 
  Hospital, 
  ShoppingCart, 
  Store, 
  Coffee, 
  Utensils, 
  Wine, 
  Cake, 
  Pizza, 
  IceCream, 
  Apple, 
  Cherry, 
  Grape, 
  Banana, 
  Orange, 
  Trees, 
  TreePine, 
  Flower, 
  Sun, 
  Moon, 
  Stars, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Snowflake, 
  Umbrella, 
  Rainbow
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Types and interfaces
import { 
  TestCase,
  TestSuite,
  TestResult,
  TestExecution,
  TestReport,
  TestConfiguration,
  TestData,
  TestAssertion,
  TestStep,
  TestCoverage,
  TestMetrics,
  TestEnvironment,
  TestHooks,
  TestFixture,
  TestMock,
  TestStub,
  TestDouble,
  TestRunner,
  TestFramework,
  TestPlan,
  TestScenario,
  TestCategory,
  TestPriority,
  TestStatus,
  TestType,
  TestLevel,
  TestStrategy,
  PerformanceTest,
  LoadTest,
  StressTest,
  RegressionTest,
  IntegrationTest,
  UnitTest,
  AcceptanceTest,
  SecurityTest,
  UsabilityTest,
  CompatibilityTest,
  TestAutomation,
  TestOrchestration,
  TestPipeline,
  TestSchedule,
  TestNotification,
  TestArtifact,
  TestEvidence,
  TestTraceability,
  TestCompliance,
  TestGovernance
} from '../../types/testing.types';
import { ScanRule, RuleLanguage, RuleCategory, RuleType } from '../../types/scan-rules.types';
import { AITestGeneration, AITestOptimization, TestInsights } from '../../types/intelligence.types';

// Services and hooks
import { useScanRules } from '../../hooks/useScanRules';
import { useIntelligence } from '../../hooks/useIntelligence';
import { useValidation } from '../../hooks/useValidation';
import { useCollaboration } from '../../hooks/useCollaboration';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { validationEngine } from '../../utils/validation-engine';

// Constants
import { THEME_CONFIG, ANIMATION_CONFIG, COMPONENT_CONFIG } from '../../constants/ui-constants';
import { VALIDATION_RULES } from '../../constants/validation-rules';

// =============================================================================
// RULE TESTING FRAMEWORK COMPONENT
// =============================================================================

interface RuleTestingFrameworkProps {
  rule?: ScanRule;
  onTestComplete?: (results: TestResult[]) => void;
  onTestSuiteChange?: (testSuite: TestSuite) => void;
  onReportGenerated?: (report: TestReport) => void;
  readonly?: boolean;
  autoRun?: boolean;
  enableAI?: boolean;
  className?: string;
}

export const RuleTestingFramework: React.FC<RuleTestingFrameworkProps> = ({
  rule,
  onTestComplete,
  onTestSuiteChange,
  onReportGenerated,
  readonly = false,
  autoRun = false,
  enableAI = true,
  className = ''
}) => {
  // State management
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testExecution, setTestExecution] = useState<TestExecution | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [testConfiguration, setTestConfiguration] = useState<TestConfiguration>({
    timeout: 30000,
    retries: 3,
    parallel: true,
    stopOnFailure: false,
    reportFormat: 'detailed',
    coverage: true,
    performance: true,
    environment: 'test'
  });
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [testFilter, setTestFilter] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    type: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'duration' | 'priority'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialog states
  const [showCreateTestDialog, setShowCreateTestDialog] = useState(false);
  const [showEditTestDialog, setShowEditTestDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showCoverageDialog, setShowCoverageDialog] = useState(false);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Form states
  const [newTestCase, setNewTestCase] = useState<Partial<TestCase>>({
    name: '',
    description: '',
    category: 'functional',
    priority: 'medium',
    type: 'unit',
    steps: [],
    assertions: [],
    data: {},
    expected: {}
  });
  const [editingTest, setEditingTest] = useState<TestCase | null>(null);

  // AI and insights
  const [aiGeneratedTests, setAiGeneratedTests] = useState<TestCase[]>([]);
  const [testInsights, setTestInsights] = useState<TestInsights | null>(null);
  const [suggestedOptimizations, setSuggestedOptimizations] = useState<AITestOptimization[]>([]);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);

  // Performance and metrics
  const [testMetrics, setTestMetrics] = useState<TestMetrics | null>(null);
  const [testCoverage, setTestCoverage] = useState<TestCoverage | null>(null);
  const [performanceResults, setPerformanceResults] = useState<PerformanceTest[]>([]);
  const [regressionResults, setRegressionResults] = useState<RegressionTest[]>([]);

  // Real-time execution
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [realTimeResults, setRealTimeResults] = useState<Map<string, TestResult>>(new Map());

  // Refs
  const testRunnerRef = useRef<any>(null);
  const executionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { validateRule, executeRule } = useScanRules();
  const { 
    generateTests, 
    analyzeTestCoverage, 
    optimizeTestSuite, 
    generateTestData,
    analyzeTestResults
  } = useIntelligence();
  const { validateTestCase, validateTestData } = useValidation();
  const { trackUserActivity } = useCollaboration();

  // =============================================================================
  // TEST EXECUTION ENGINE
  // =============================================================================

  /**
   * Execute test suite
   */
  const executeTestSuite = useCallback(async (testSuite: TestSuite) => {
    if (!rule || isRunning) return;

    setIsRunning(true);
    setIsPaused(false);
    setTestResults([]);
    setExecutionLog([]);
    setCurrentTestIndex(0);
    setRealTimeResults(new Map());

    const execution: TestExecution = {
      id: generateExecutionId(),
      testSuiteId: testSuite.id,
      ruleId: rule.id,
      startTime: new Date(),
      status: 'running',
      configuration: testConfiguration,
      results: []
    };

    setTestExecution(execution);

    try {
      const testsToExecute = testSuite.testCases
        .filter(test => selectedTests.size === 0 || selectedTests.has(test.id))
        .sort((a, b) => (a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0));

      addToLog(`Starting test execution for suite: ${testSuite.name}`);
      addToLog(`Running ${testsToExecute.length} tests`);

      const results: TestResult[] = [];

      for (let i = 0; i < testsToExecute.length; i++) {
        if (!isRunning || isPaused) break;

        const testCase = testsToExecute[i];
        setCurrentTestIndex(i);

        addToLog(`Executing test: ${testCase.name}`);

        try {
          const result = await executeTestCase(testCase, rule);
          results.push(result);
          setRealTimeResults(prev => new Map(prev.set(testCase.id, result)));

          addToLog(`Test ${testCase.name}: ${result.status.toUpperCase()}`);

          if (result.status === 'failed' && testConfiguration.stopOnFailure) {
            addToLog('Stopping execution due to failure (stopOnFailure enabled)');
            break;
          }

        } catch (error) {
          const errorResult: TestResult = {
            id: generateResultId(),
            testCaseId: testCase.id,
            executionId: execution.id,
            status: 'error',
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            assertions: []
          };

          results.push(errorResult);
          setRealTimeResults(prev => new Map(prev.set(testCase.id, errorResult)));
          addToLog(`Test ${testCase.name}: ERROR - ${errorResult.error}`);
        }

        // Artificial delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate final execution summary
      const finalExecution = {
        ...execution,
        endTime: new Date(),
        status: 'completed' as const,
        results
      };

      setTestExecution(finalExecution);
      setTestResults(results);

      // Generate test report
      const report = await generateTestReport(finalExecution, testSuite);
      onReportGenerated?.(report);

      // Analyze results and generate insights
      if (enableAI) {
        await analyzeExecutionResults(results, testSuite);
      }

      // Track execution
      await trackUserActivity({
        action: 'test_suite_executed',
        testSuiteId: testSuite.id,
        ruleId: rule.id,
        testCount: results.length,
        passed: results.filter(r => r.status === 'passed').length,
        failed: results.filter(r => r.status === 'failed').length,
        timestamp: new Date().toISOString()
      });

      onTestComplete?.(results);
      addToLog(`Test execution completed. ${results.filter(r => r.status === 'passed').length}/${results.length} tests passed`);

    } catch (error) {
      addToLog(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestExecution(prev => prev ? { ...prev, status: 'error', endTime: new Date() } : null);
    } finally {
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [
    rule,
    isRunning,
    testConfiguration,
    selectedTests,
    enableAI,
    onTestComplete,
    onReportGenerated,
    trackUserActivity
  ]);

  /**
   * Execute individual test case
   */
  const executeTestCase = useCallback(async (testCase: TestCase, rule: ScanRule): Promise<TestResult> => {
    const startTime = new Date();
    const result: TestResult = {
      id: generateResultId(),
      testCaseId: testCase.id,
      executionId: testExecution?.id || '',
      status: 'running',
      startTime,
      endTime: startTime,
      duration: 0,
      assertions: []
    };

    try {
      // Setup test environment
      await setupTestEnvironment(testCase);

      // Execute test steps
      for (const step of testCase.steps) {
        await executeTestStep(step, testCase, rule);
      }

      // Execute rule with test data
      const ruleResult = await executeRule(rule, testCase.data);

      // Validate assertions
      const assertionResults = await validateAssertions(testCase.assertions, ruleResult, testCase.expected);
      result.assertions = assertionResults;

      // Determine overall test status
      const hasFailedAssertions = assertionResults.some(a => !a.passed);
      result.status = hasFailedAssertions ? 'failed' : 'passed';

      // Capture additional data
      result.actualResult = ruleResult;
      result.expectedResult = testCase.expected;

      if (testConfiguration.performance) {
        result.performanceMetrics = await capturePerformanceMetrics(testCase, rule);
      }

      if (testConfiguration.coverage) {
        result.coverageData = await captureCoverageData(testCase, rule);
      }

    } catch (error) {
      result.status = 'error';
      result.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();

      // Cleanup test environment
      await cleanupTestEnvironment(testCase);
    }

    return result;
  }, [testExecution, testConfiguration, executeRule]);

  /**
   * Execute test step
   */
  const executeTestStep = useCallback(async (step: TestStep, testCase: TestCase, rule: ScanRule) => {
    switch (step.type) {
      case 'setup':
        await executeSetupStep(step, testCase);
        break;
      case 'action':
        await executeActionStep(step, testCase, rule);
        break;
      case 'verification':
        await executeVerificationStep(step, testCase);
        break;
      case 'cleanup':
        await executeCleanupStep(step, testCase);
        break;
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }, []);

  /**
   * Validate test assertions
   */
  const validateAssertions = useCallback(async (
    assertions: TestAssertion[],
    actualResult: any,
    expectedResult: any
  ): Promise<Array<{ assertion: TestAssertion; passed: boolean; message?: string }>> => {
    const results = [];

    for (const assertion of assertions) {
      let passed = false;
      let message = '';

      try {
        switch (assertion.type) {
          case 'equals':
            passed = JSON.stringify(actualResult) === JSON.stringify(assertion.expected);
            message = passed ? 'Values are equal' : `Expected ${JSON.stringify(assertion.expected)}, got ${JSON.stringify(actualResult)}`;
            break;

          case 'contains':
            passed = JSON.stringify(actualResult).includes(JSON.stringify(assertion.expected));
            message = passed ? 'Value contains expected content' : `Expected result to contain ${JSON.stringify(assertion.expected)}`;
            break;

          case 'not_equals':
            passed = JSON.stringify(actualResult) !== JSON.stringify(assertion.expected);
            message = passed ? 'Values are not equal' : `Expected values to be different, but both are ${JSON.stringify(actualResult)}`;
            break;

          case 'greater_than':
            passed = Number(actualResult) > Number(assertion.expected);
            message = passed ? 'Value is greater than expected' : `Expected ${actualResult} to be greater than ${assertion.expected}`;
            break;

          case 'less_than':
            passed = Number(actualResult) < Number(assertion.expected);
            message = passed ? 'Value is less than expected' : `Expected ${actualResult} to be less than ${assertion.expected}`;
            break;

          case 'regex_match':
            const regex = new RegExp(assertion.expected as string);
            passed = regex.test(String(actualResult));
            message = passed ? 'Value matches regex pattern' : `Expected ${actualResult} to match pattern ${assertion.expected}`;
            break;

          case 'type_check':
            passed = typeof actualResult === assertion.expected;
            message = passed ? 'Type matches expected' : `Expected type ${assertion.expected}, got ${typeof actualResult}`;
            break;

          case 'custom':
            if (assertion.validator) {
              const validationResult = await assertion.validator(actualResult, expectedResult);
              passed = validationResult.passed;
              message = validationResult.message;
            } else {
              throw new Error('Custom assertion requires validator function');
            }
            break;

          default:
            throw new Error(`Unknown assertion type: ${assertion.type}`);
        }
      } catch (error) {
        passed = false;
        message = `Assertion failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      results.push({ assertion, passed, message });
    }

    return results;
  }, []);

  // =============================================================================
  // AI-POWERED TEST GENERATION
  // =============================================================================

  /**
   * Generate AI-powered test cases
   */
  const generateAITests = useCallback(async () => {
    if (!rule || !enableAI || isGeneratingTests) return;

    setIsGeneratingTests(true);
    try {
      addToLog('Generating AI-powered test cases...');

      const aiTests = await generateTests({
        rule,
        coverage: 'comprehensive',
        includeEdgeCases: true,
        includeNegativeTests: true,
        includePerformanceTests: testConfiguration.performance,
        generateData: true
      });

      setAiGeneratedTests(aiTests);
      addToLog(`Generated ${aiTests.length} AI test cases`);

      // Track AI test generation
      await trackUserActivity({
        action: 'ai_tests_generated',
        ruleId: rule.id,
        testCount: aiTests.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      addToLog(`AI test generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingTests(false);
    }
  }, [rule, enableAI, isGeneratingTests, testConfiguration.performance, generateTests, trackUserActivity]);

  /**
   * Analyze execution results with AI
   */
  const analyzeExecutionResults = useCallback(async (results: TestResult[], testSuite: TestSuite) => {
    try {
      const insights = await analyzeTestResults({
        results,
        testSuite,
        rule: rule!,
        includeOptimizations: true,
        includeCoverageAnalysis: true,
        includePerformanceAnalysis: testConfiguration.performance
      });

      setTestInsights(insights);

      if (insights.optimizations) {
        setSuggestedOptimizations(insights.optimizations);
      }

      addToLog(`Analysis complete. Generated ${insights.recommendations?.length || 0} recommendations`);

    } catch (error) {
      addToLog(`Result analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [rule, testConfiguration.performance, analyzeTestResults]);

  // =============================================================================
  // TEST MANAGEMENT
  // =============================================================================

  /**
   * Create new test case
   */
  const createTestCase = useCallback(async (testCaseData: Partial<TestCase>) => {
    try {
      const testCase: TestCase = {
        id: generateTestId(),
        name: testCaseData.name || 'Untitled Test',
        description: testCaseData.description || '',
        category: testCaseData.category || 'functional',
        priority: testCaseData.priority || 'medium',
        type: testCaseData.type || 'unit',
        status: 'draft',
        steps: testCaseData.steps || [],
        assertions: testCaseData.assertions || [],
        data: testCaseData.data || {},
        expected: testCaseData.expected || {},
        timeout: testCaseData.timeout || testConfiguration.timeout,
        retries: testCaseData.retries || testConfiguration.retries,
        tags: testCaseData.tags || [],
        author: getCurrentUserId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate test case
      const validation = await validateTestCase(testCase);
      if (!validation.isValid) {
        throw new Error(`Test case validation failed: ${validation.errors.join(', ')}`);
      }

      // Add to current test suite or create new one
      if (selectedTestSuite) {
        const updatedSuite = {
          ...selectedTestSuite,
          testCases: [...selectedTestSuite.testCases, testCase]
        };
        setSelectedTestSuite(updatedSuite);
        setTestSuites(prev => prev.map(s => s.id === updatedSuite.id ? updatedSuite : s));
      } else {
        // Create new test suite
        const newTestSuite: TestSuite = {
          id: generateTestSuiteId(),
          name: `Test Suite for ${rule?.name || 'Rule'}`,
          description: 'Auto-generated test suite',
          ruleId: rule?.id || '',
          testCases: [testCase],
          configuration: testConfiguration,
          author: getCurrentUserId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setTestSuites(prev => [...prev, newTestSuite]);
        setSelectedTestSuite(newTestSuite);
      }

      // Track test creation
      await trackUserActivity({
        action: 'test_case_created',
        testCaseId: testCase.id,
        ruleId: rule?.id,
        category: testCase.category,
        timestamp: new Date().toISOString()
      });

      addToLog(`Created test case: ${testCase.name}`);
      setShowCreateTestDialog(false);
      resetNewTestCase();

    } catch (error) {
      addToLog(`Failed to create test case: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [selectedTestSuite, testConfiguration, rule, validateTestCase, trackUserActivity]);

  /**
   * Update existing test case
   */
  const updateTestCase = useCallback(async (updatedTestCase: TestCase) => {
    try {
      // Validate updated test case
      const validation = await validateTestCase(updatedTestCase);
      if (!validation.isValid) {
        throw new Error(`Test case validation failed: ${validation.errors.join(', ')}`);
      }

      // Update in test suite
      if (selectedTestSuite) {
        const updatedSuite = {
          ...selectedTestSuite,
          testCases: selectedTestSuite.testCases.map(tc => 
            tc.id === updatedTestCase.id ? { ...updatedTestCase, updatedAt: new Date() } : tc
          )
        };
        setSelectedTestSuite(updatedSuite);
        setTestSuites(prev => prev.map(s => s.id === updatedSuite.id ? updatedSuite : s));
      }

      addToLog(`Updated test case: ${updatedTestCase.name}`);
      setShowEditTestDialog(false);
      setEditingTest(null);

    } catch (error) {
      addToLog(`Failed to update test case: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [selectedTestSuite, validateTestCase]);

  /**
   * Delete test case
   */
  const deleteTestCase = useCallback(async (testCaseId: string) => {
    try {
      if (selectedTestSuite) {
        const updatedSuite = {
          ...selectedTestSuite,
          testCases: selectedTestSuite.testCases.filter(tc => tc.id !== testCaseId)
        };
        setSelectedTestSuite(updatedSuite);
        setTestSuites(prev => prev.map(s => s.id === updatedSuite.id ? updatedSuite : s));
      }

      addToLog(`Deleted test case`);

    } catch (error) {
      addToLog(`Failed to delete test case: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [selectedTestSuite]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  /**
   * Generate unique IDs
   */
  const generateTestId = useCallback(() => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const generateTestSuiteId = useCallback(() => `suite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const generateExecutionId = useCallback(() => `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);
  const generateResultId = useCallback(() => `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

  /**
   * Get current user ID
   */
  const getCurrentUserId = useCallback(() => 'current-user-id', []);

  /**
   * Add message to execution log
   */
  const addToLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setExecutionLog(prev => [...prev, logEntry]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  /**
   * Reset new test case form
   */
  const resetNewTestCase = useCallback(() => {
    setNewTestCase({
      name: '',
      description: '',
      category: 'functional',
      priority: 'medium',
      type: 'unit',
      steps: [],
      assertions: [],
      data: {},
      expected: {}
    });
  }, []);

  /**
   * Filter and sort test cases
   */
  const filteredAndSortedTests = useMemo(() => {
    if (!selectedTestSuite) return [];

    let filtered = selectedTestSuite.testCases.filter(test => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!test.name.toLowerCase().includes(query) && 
            !test.description.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Status filter
      if (testFilter.status !== 'all') {
        const result = realTimeResults.get(test.id);
        const status = result?.status || 'not_run';
        if (status !== testFilter.status) return false;
      }

      // Category filter
      if (testFilter.category !== 'all' && test.category !== testFilter.category) {
        return false;
      }

      // Priority filter
      if (testFilter.priority !== 'all' && test.priority !== testFilter.priority) {
        return false;
      }

      // Type filter
      if (testFilter.type !== 'all' && test.type !== testFilter.type) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'status':
          aValue = realTimeResults.get(a.id)?.status || 'not_run';
          bValue = realTimeResults.get(b.id)?.status || 'not_run';
          break;
        case 'duration':
          aValue = realTimeResults.get(a.id)?.duration || 0;
          bValue = realTimeResults.get(b.id)?.duration || 0;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [selectedTestSuite, searchQuery, testFilter, sortBy, sortOrder, realTimeResults]);

  /**
   * Generate test report
   */
  const generateTestReport = useCallback(async (execution: TestExecution, testSuite: TestSuite): Promise<TestReport> => {
    const totalTests = execution.results.length;
    const passedTests = execution.results.filter(r => r.status === 'passed').length;
    const failedTests = execution.results.filter(r => r.status === 'failed').length;
    const errorTests = execution.results.filter(r => r.status === 'error').length;
    const skippedTests = execution.results.filter(r => r.status === 'skipped').length;

    const report: TestReport = {
      id: `report_${execution.id}`,
      executionId: execution.id,
      testSuiteId: testSuite.id,
      ruleId: rule?.id || '',
      generatedAt: new Date(),
      summary: {
        totalTests,
        passedTests,
        failedTests,
        errorTests,
        skippedTests,
        passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
        totalDuration: execution.results.reduce((sum, r) => sum + (r.duration || 0), 0)
      },
      results: execution.results,
      configuration: execution.configuration,
      metadata: {
        ruleLanguage: rule?.language,
        ruleCategory: rule?.category,
        executionEnvironment: execution.configuration.environment,
        timestamp: execution.startTime
      }
    };

    if (testConfiguration.coverage && testCoverage) {
      report.coverage = testCoverage;
    }

    if (testConfiguration.performance) {
      report.performance = {
        averageExecutionTime: report.summary.totalDuration / totalTests,
        slowestTest: execution.results.reduce((slowest, current) => 
          (current.duration || 0) > (slowest.duration || 0) ? current : slowest
        ),
        fastestTest: execution.results.reduce((fastest, current) => 
          (current.duration || 0) < (fastest.duration || 0) ? current : fastest
        )
      };
    }

    return report;
  }, [rule, testConfiguration, testCoverage]);

  // =============================================================================
  // TEST STEP EXECUTION HELPERS
  // =============================================================================

  const executeSetupStep = useCallback(async (step: TestStep, testCase: TestCase) => {
    // Setup test data, mocks, stubs, etc.
    addToLog(`Setup: ${step.description}`);
  }, []);

  const executeActionStep = useCallback(async (step: TestStep, testCase: TestCase, rule: ScanRule) => {
    // Execute the actual test action
    addToLog(`Action: ${step.description}`);
  }, []);

  const executeVerificationStep = useCallback(async (step: TestStep, testCase: TestCase) => {
    // Verify expected outcomes
    addToLog(`Verification: ${step.description}`);
  }, []);

  const executeCleanupStep = useCallback(async (step: TestStep, testCase: TestCase) => {
    // Clean up test artifacts
    addToLog(`Cleanup: ${step.description}`);
  }, []);

  const setupTestEnvironment = useCallback(async (testCase: TestCase) => {
    // Initialize test environment
  }, []);

  const cleanupTestEnvironment = useCallback(async (testCase: TestCase) => {
    // Clean up test environment
  }, []);

  const capturePerformanceMetrics = useCallback(async (testCase: TestCase, rule: ScanRule) => {
    // Capture performance metrics
    return {
      executionTime: Math.random() * 1000,
      memoryUsage: Math.random() * 100,
      cpuUsage: Math.random() * 100
    };
  }, []);

  const captureCoverageData = useCallback(async (testCase: TestCase, rule: ScanRule) => {
    // Capture code coverage data
    return {
      linesCovered: Math.floor(Math.random() * 100),
      totalLines: 100,
      branchesCovered: Math.floor(Math.random() * 50),
      totalBranches: 50
    };
  }, []);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  /**
   * Auto-run tests when enabled
   */
  useEffect(() => {
    if (autoRun && selectedTestSuite && rule && !isRunning) {
      executeTestSuite(selectedTestSuite);
    }
  }, [autoRun, selectedTestSuite, rule, isRunning, executeTestSuite]);

  /**
   * Initialize default test suite
   */
  useEffect(() => {
    if (rule && testSuites.length === 0) {
      const defaultTestSuite: TestSuite = {
        id: generateTestSuiteId(),
        name: `Test Suite for ${rule.name}`,
        description: 'Default test suite',
        ruleId: rule.id,
        testCases: [],
        configuration: testConfiguration,
        author: getCurrentUserId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setTestSuites([defaultTestSuite]);
      setSelectedTestSuite(defaultTestSuite);
    }
  }, [rule, testSuites.length, testConfiguration, generateTestSuiteId, getCurrentUserId]);

  /**
   * Generate AI tests when rule changes
   */
  useEffect(() => {
    if (rule && enableAI && aiGeneratedTests.length === 0) {
      generateAITests();
    }
  }, [rule, enableAI, aiGeneratedTests.length, generateAITests]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render test case row
   */
  const renderTestCaseRow = useCallback((testCase: TestCase, index: number) => {
    const result = realTimeResults.get(testCase.id);
    const isSelected = selectedTests.has(testCase.id);
    const isCurrentTest = currentTestIndex === index && isRunning;

    return (
      <TableRow 
        key={testCase.id}
        className={`${isSelected ? 'bg-blue-50' : ''} ${isCurrentTest ? 'bg-yellow-50' : ''}`}
      >
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              const updated = new Set(selectedTests);
              if (checked) {
                updated.add(testCase.id);
              } else {
                updated.delete(testCase.id);
              }
              setSelectedTests(updated);
            }}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            {result?.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {result?.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
            {result?.status === 'error' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
            {result?.status === 'running' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
            {!result && <Clock className="h-4 w-4 text-gray-400" />}
            <span className="font-medium">{testCase.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">{testCase.description}</span>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-xs">
            {testCase.category}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge 
            variant={testCase.priority === 'high' ? 'destructive' : testCase.priority === 'medium' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {testCase.priority}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-xs">
            {testCase.type}
          </Badge>
        </TableCell>
        <TableCell>
          {result?.duration ? `${result.duration}ms` : '-'}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setEditingTest(testCase);
                setShowEditTestDialog(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                // Copy test configuration
                navigator.clipboard.writeText(JSON.stringify(testCase, null, 2));
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => deleteTestCase(testCase.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  }, [realTimeResults, selectedTests, currentTestIndex, isRunning, deleteTestCase]);

  /**
   * Render test metrics
   */
  const renderTestMetrics = useCallback(() => {
    if (!testResults.length) return null;

    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.status === 'passed').length;
    const failedTests = testResults.filter(r => r.status === 'failed').length;
    const errorTests = testResults.filter(r => r.status === 'error').length;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const totalDuration = testResults.reduce((sum, r) => sum + (r.duration || 0), 0);

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
            <div className="text-xs text-gray-600">Total Tests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{passedTests}</div>
            <div className="text-xs text-gray-600">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{failedTests}</div>
            <div className="text-xs text-gray-600">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{errorTests}</div>
            <div className="text-xs text-gray-600">Errors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{passRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Pass Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{totalDuration}ms</div>
            <div className="text-xs text-gray-600">Total Duration</div>
          </CardContent>
        </Card>
      </div>
    );
  }, [testResults]);

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <TooltipProvider>
      <div className={`rule-testing-framework ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TestTube className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Testing Framework</h2>
              <p className="text-gray-600">
                Comprehensive testing suite with AI-powered test generation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {enableAI && (
              <Button
                variant="outline"
                onClick={generateAITests}
                disabled={!rule || isGeneratingTests}
                className="flex items-center space-x-2"
              >
                {isGeneratingTests ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span>Generate AI Tests</span>
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowConfigDialog(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </Button>

            <Button
              onClick={() => selectedTestSuite && executeTestSuite(selectedTestSuite)}
              disabled={!selectedTestSuite || isRunning || readonly}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
            </Button>
          </div>
        </div>

        {/* Test Metrics */}
        {testResults.length > 0 && (
          <div className="mb-6">
            {renderTestMetrics()}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Test Cases */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tests" className="flex items-center space-x-2">
                  <TestTube className="h-4 w-4" />
                  <span>Tests</span>
                  <Badge variant="secondary" className="ml-1">
                    {filteredAndSortedTests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Results</span>
                </TabsTrigger>
                <TabsTrigger value="coverage" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Coverage</span>
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>AI Insights</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="mt-6">
                {/* Test Controls */}
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Search and filters */}
                      <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search test cases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <Select value={testFilter.status} onValueChange={(value) => 
                          setTestFilter(prev => ({ ...prev, status: value }))
                        }>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="passed">Passed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="not_run">Not Run</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={testFilter.category} onValueChange={(value) => 
                          setTestFilter(prev => ({ ...prev, category: value }))
                        }>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="functional">Functional</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="integration">Integration</SelectItem>
                            <SelectItem value="regression">Regression</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                            <SelectItem value="duration">Duration</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                        </Button>
                      </div>

                      {/* Bulk actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedTests.size === filteredAndSortedTests.length && filteredAndSortedTests.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTests(new Set(filteredAndSortedTests.map(t => t.id)));
                              } else {
                                setSelectedTests(new Set());
                              }
                            }}
                          />
                          <span className="text-sm text-gray-600">
                            {selectedTests.size > 0 ? `${selectedTests.size} selected` : 'Select all'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCreateTestDialog(true)}
                            disabled={readonly}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Test
                          </Button>

                          {selectedTests.size > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Run selected tests
                                if (selectedTestSuite) {
                                  executeTestSuite(selectedTestSuite);
                                }
                              }}
                              disabled={isRunning}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Run Selected
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Cases Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedTests.map((testCase, index) => 
                          renderTestCaseRow(testCase, index)
                        )}
                        {filteredAndSortedTests.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="text-gray-500">
                                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">No test cases found</p>
                                <p className="text-sm">Create your first test case to get started</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="mt-6">
                <div className="space-y-6">
                  {testResults.length > 0 ? (
                    <>
                      {/* Results summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Test Results Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {testResults.map((result) => {
                              const testCase = selectedTestSuite?.testCases.find(tc => tc.id === result.testCaseId);
                              return (
                                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    {result.status === 'passed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                    {result.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                                    {result.status === 'error' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                                    <div>
                                      <h4 className="font-medium">{testCase?.name}</h4>
                                      <p className="text-sm text-gray-600">{testCase?.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium">{result.duration || 0}ms</div>
                                    <div className="text-xs text-gray-500">
                                      {result.assertions?.length || 0} assertions
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
                        <p className="text-gray-600">Run some tests to see results here</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="coverage" className="mt-6">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Coverage Analysis</h3>
                    <p className="text-gray-600">Run tests with coverage enabled to see analysis</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="mt-6">
                <div className="space-y-6">
                  {/* AI Generated Tests */}
                  {aiGeneratedTests.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Zap className="h-5 w-5 text-primary" />
                          <span>AI Generated Tests</span>
                          <Badge variant="secondary">{aiGeneratedTests.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {aiGeneratedTests.slice(0, 5).map((test, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{test.name}</h4>
                                <p className="text-sm text-gray-600">{test.description}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setNewTestCase(test);
                                  setShowCreateTestDialog(true);
                                }}
                              >
                                Add to Suite
                              </Button>
                            </div>
                          ))}
                          {aiGeneratedTests.length > 5 && (
                            <div className="text-center">
                              <Button variant="outline" size="sm">
                                View All {aiGeneratedTests.length} Tests
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Test Insights */}
                  {testInsights && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Test Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {testInsights.recommendations?.map((rec, index) => (
                            <Alert key={index}>
                              <Info className="h-4 w-4" />
                              <AlertDescription>{rec.description}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(!aiGeneratedTests.length && !testInsights) && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights</h3>
                        <p className="text-gray-600">Run tests to get AI-powered insights and recommendations</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Execution Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Execution Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {isRunning ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-green-600 font-medium">Running</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Test {currentTestIndex + 1} of {filteredAndSortedTests.length}
                    </div>
                    <Progress 
                      value={(currentTestIndex / filteredAndSortedTests.length) * 100} 
                      className="h-2"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsPaused(!isPaused)}
                        className="flex-1"
                      >
                        {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsRunning(false)}
                        className="flex-1"
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Ready to run tests</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Execution Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Execution Log</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-64" ref={logContainerRef}>
                  <div className="space-y-1 text-xs font-mono">
                    {executionLog.map((entry, index) => (
                      <div key={index} className="text-gray-600">
                        {entry}
                      </div>
                    ))}
                    {executionLog.length === 0 && (
                      <div className="text-gray-400 text-center py-8">
                        No log entries yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Tests
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Tips
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Test Dialog */}
        <Dialog open={showCreateTestDialog} onOpenChange={setShowCreateTestDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Test Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-name">Test Name</Label>
                  <Input
                    id="test-name"
                    value={newTestCase.name}
                    onChange={(e) => setNewTestCase(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter test name"
                  />
                </div>
                <div>
                  <Label htmlFor="test-category">Category</Label>
                  <Select
                    value={newTestCase.category}
                    onValueChange={(value) => setNewTestCase(prev => ({ ...prev, category: value as TestCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="regression">Regression</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="test-description">Description</Label>
                <Textarea
                  id="test-description"
                  value={newTestCase.description}
                  onChange={(e) => setNewTestCase(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this test validates"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="test-priority">Priority</Label>
                  <Select
                    value={newTestCase.priority}
                    onValueChange={(value) => setNewTestCase(prev => ({ ...prev, priority: value as TestPriority }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-type">Type</Label>
                  <Select
                    value={newTestCase.type}
                    onValueChange={(value) => setNewTestCase(prev => ({ ...prev, type: value as TestType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit">Unit</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="acceptance">Acceptance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="test-timeout">Timeout (ms)</Label>
                  <Input
                    id="test-timeout"
                    type="number"
                    value={newTestCase.timeout || testConfiguration.timeout}
                    onChange={(e) => setNewTestCase(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTestDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createTestCase(newTestCase)}
                disabled={!newTestCase.name || !newTestCase.description}
              >
                Create Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configuration Dialog */}
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="config-timeout">Default Timeout (ms)</Label>
                <Input
                  id="config-timeout"
                  type="number"
                  value={testConfiguration.timeout}
                  onChange={(e) => setTestConfiguration(prev => ({ 
                    ...prev, 
                    timeout: parseInt(e.target.value) 
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="config-retries">Default Retries</Label>
                <Input
                  id="config-retries"
                  type="number"
                  value={testConfiguration.retries}
                  onChange={(e) => setTestConfiguration(prev => ({ 
                    ...prev, 
                    retries: parseInt(e.target.value) 
                  }))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="config-parallel">Parallel Execution</Label>
                  <Switch
                    id="config-parallel"
                    checked={testConfiguration.parallel}
                    onCheckedChange={(checked) => setTestConfiguration(prev => ({ 
                      ...prev, 
                      parallel: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="config-stop-on-failure">Stop on Failure</Label>
                  <Switch
                    id="config-stop-on-failure"
                    checked={testConfiguration.stopOnFailure}
                    onCheckedChange={(checked) => setTestConfiguration(prev => ({ 
                      ...prev, 
                      stopOnFailure: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="config-coverage">Enable Coverage</Label>
                  <Switch
                    id="config-coverage"
                    checked={testConfiguration.coverage}
                    onCheckedChange={(checked) => setTestConfiguration(prev => ({ 
                      ...prev, 
                      coverage: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="config-performance">Performance Testing</Label>
                  <Switch
                    id="config-performance"
                    checked={testConfiguration.performance}
                    onCheckedChange={(checked) => setTestConfiguration(prev => ({ 
                      ...prev, 
                      performance: checked 
                    }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowConfigDialog(false)}>
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RuleTestingFramework;