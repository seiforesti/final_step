'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Zap,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Settings,
  Code,
  Eye,
  EyeOff,
  Download,
  Upload,
  Save,
  FileText,
  Database,
  Network,
  Users,
  User,
  Shield,
  Lock,
  Key,
  Globe,
  MapPin,
  Calendar,
  Loader2,
  Search,
  Filter,
  Copy,
  Share,
  Edit,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Star,
  Heart,
  Bookmark,
  Tag,
  Bell,
  Mail,
  Phone,
  Home,
  Building,
  Crown,
  Archive,
  BookOpen,
  Terminal,
  Monitor,
  Cpu,
  HelpCircle,
} from 'lucide-react';

// Hooks and Services
import { useConditions } from '../../hooks/useConditions';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';

// Types
import type { 
  Condition,
  ConditionValidationResult,
  ConditionTestCase,
  ConditionPerformanceMetrics,
  ValidationSeverity
} from '../../types/condition.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate, formatDuration } from '../../utils/format.utils';

interface ConditionValidatorProps {
  condition?: Condition;
  expression?: string;
  onValidationComplete?: (result: ConditionValidationResult) => void;
  className?: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  context: Record<string, any>;
  expectedResult: boolean;
  category: 'basic' | 'edge' | 'performance' | 'security' | 'custom';
  tags: string[];
}

interface ValidationError {
  type: 'syntax' | 'semantic' | 'runtime' | 'performance' | 'security';
  severity: ValidationSeverity;
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  code?: string;
}

interface PerformanceResult {
  executionTime: number;
  memoryUsage: number;
  complexity: number;
  optimizationSuggestions: string[];
  bottlenecks: string[];
}

interface SecurityAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: Array<{
    type: string;
    description: string;
    impact: string;
    mitigation: string;
  }>;
  recommendations: string[];
}

const DEFAULT_TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'admin-access',
    name: 'Administrator Access',
    description: 'Test administrator role access',
    context: {
      user: {
        id: 'admin-123',
        roles: ['administrator', 'user'],
        department: 'IT',
        clearance_level: 5,
        mfa_verified: true,
        active: true
      },
      resource: {
        type: 'database',
        classification: 'confidential',
        department: 'IT',
        required_level: 3
      },
      time: {
        hour: 14,
        dayOfWeek: 2,
        current: new Date().toISOString()
      },
      location: {
        country: 'US',
        ip: '192.168.1.100'
      },
      environment: {
        trusted_network: true,
        emergency_mode: false
      }
    },
    expectedResult: true,
    category: 'basic',
    tags: ['admin', 'role', 'access']
  },
  {
    id: 'business-hours',
    name: 'Business Hours Access',
    description: 'Test access during business hours',
    context: {
      user: {
        id: 'user-456',
        roles: ['user'],
        department: 'Sales',
        active: true
      },
      time: {
        hour: 10,
        dayOfWeek: 3,
        current: new Date().toISOString()
      },
      location: {
        country: 'US',
        ip: '10.0.0.50'
      }
    },
    expectedResult: true,
    category: 'basic',
    tags: ['time', 'business-hours']
  },
  {
    id: 'after-hours-denied',
    name: 'After Hours Denial',
    description: 'Test access denial after business hours',
    context: {
      user: {
        id: 'user-789',
        roles: ['user'],
        department: 'Marketing',
        active: true
      },
      time: {
        hour: 22,
        dayOfWeek: 3,
        current: new Date().toISOString()
      },
      location: {
        country: 'US',
        ip: '10.0.0.75'
      }
    },
    expectedResult: false,
    category: 'basic',
    tags: ['time', 'after-hours', 'denial']
  },
  {
    id: 'weekend-access',
    name: 'Weekend Access',
    description: 'Test access on weekends',
    context: {
      user: {
        id: 'user-weekend',
        roles: ['user'],
        department: 'Support',
        active: true
      },
      time: {
        hour: 14,
        dayOfWeek: 6,
        current: new Date().toISOString()
      }
    },
    expectedResult: false,
    category: 'edge',
    tags: ['time', 'weekend', 'edge-case']
  },
  {
    id: 'geo-restriction',
    name: 'Geographic Restriction',
    description: 'Test geographic access restrictions',
    context: {
      user: {
        id: 'user-geo',
        roles: ['user'],
        active: true
      },
      location: {
        country: 'CN',
        ip: '202.108.22.5'
      }
    },
    expectedResult: false,
    category: 'security',
    tags: ['location', 'geo', 'security']
  },
  {
    id: 'high-load-test',
    name: 'High Load Performance',
    description: 'Test condition under high load',
    context: {
      user: {
        id: 'load-test-user',
        roles: ['user'],
        department: 'Engineering',
        active: true
      },
      performance: {
        concurrent_users: 10000,
        system_load: 0.85
      }
    },
    expectedResult: true,
    category: 'performance',
    tags: ['performance', 'load', 'scalability']
  }
];

const VALIDATION_CATEGORIES = [
  { id: 'syntax', name: 'Syntax', icon: Code, color: 'bg-blue-100 text-blue-800' },
  { id: 'semantic', name: 'Semantic', icon: Target, color: 'bg-green-100 text-green-800' },
  { id: 'runtime', name: 'Runtime', icon: Play, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'performance', name: 'Performance', icon: Zap, color: 'bg-purple-100 text-purple-800' },
  { id: 'security', name: 'Security', icon: Shield, color: 'bg-red-100 text-red-800' },
];

const SEVERITY_CONFIG = {
  error: { color: 'bg-red-100 text-red-800', icon: XCircle },
  warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  info: { color: 'bg-blue-100 text-blue-800', icon: Info },
  suggestion: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

const ConditionValidator: React.FC<ConditionValidatorProps> = ({
  condition,
  expression: propExpression,
  onValidationComplete,
  className = ''
}) => {
  // State Management
  const [expression, setExpression] = useState(propExpression || condition?.expression || '');
  const [validationResult, setValidationResult] = useState<ConditionValidationResult | null>(null);
  const [testScenarios, setTestScenarios] = useState<TestScenario[]>(DEFAULT_TEST_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [customContext, setCustomContext] = useState<string>('{}');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceResult | null>(null);
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityAnalysis | null>(null);
  
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('validation');
  
  // Real-time validation
  const [realTimeValidation, setRealTimeValidation] = useState(true);
  const [validationDelay, setValidationDelay] = useState(500);
  
  // Test Results
  const [testResults, setTestResults] = useState<Map<string, { result: boolean; error?: string; duration: number }>>(new Map());
  const [batchTestRunning, setBatchTestRunning] = useState(false);

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const { 
    validateCondition, 
    testCondition, 
    analyzePerformance, 
    analyzeSecurity,
    parseExpression 
  } = useConditions();
  const { checkPermission } = usePermissions();

  // Computed Properties
  const canValidate = currentUser && hasPermission(currentUser, 'condition:validate');
  const canTest = currentUser && hasPermission(currentUser, 'condition:test');

  const validationSummary = useMemo(() => {
    if (!validationResult) return null;

    const summary = {
      isValid: validationResult.isValid,
      totalIssues: validationResult.errors.length + validationResult.warnings.length,
      errors: validationResult.errors.length,
      warnings: validationResult.warnings.length,
      suggestions: validationResult.suggestions?.length || 0,
      complexity: validationResult.metadata?.complexity || 0,
      performance: performanceMetrics?.executionTime || 0,
      securityScore: securityAnalysis ? (100 - (securityAnalysis.vulnerabilities.length * 20)) : 100
    };

    return summary;
  }, [validationResult, performanceMetrics, securityAnalysis]);

  // Real-time validation with debounce
  useEffect(() => {
    if (!realTimeValidation || !expression.trim()) return;

    const timeoutId = setTimeout(() => {
      handleValidation();
    }, validationDelay);

    return () => clearTimeout(timeoutId);
  }, [expression, realTimeValidation, validationDelay]);

  // Event Handlers
  const handleValidation = useCallback(async () => {
    if (!canValidate || !expression.trim()) return;

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateCondition({
        expression,
        type: condition?.type || 'custom',
        metadata: condition?.metadata
      });

      setValidationResult(result);
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate condition');
    } finally {
      setIsValidating(false);
    }
  }, [canValidate, expression, condition, validateCondition, onValidationComplete]);

  const handleTestScenario = useCallback(async (scenario: TestScenario) => {
    if (!canTest || !expression.trim()) return;

    setIsTesting(true);
    const startTime = performance.now();

    try {
      const result = await testCondition({
        expression,
        context: scenario.context
      });

      const duration = performance.now() - startTime;
      
      setTestResults(prev => new Map(prev).set(scenario.id, {
        result: result.result,
        error: result.error,
        duration
      }));

    } catch (err) {
      console.error('Test error:', err);
      setTestResults(prev => new Map(prev).set(scenario.id, {
        result: false,
        error: 'Test execution failed',
        duration: performance.now() - startTime
      }));
    } finally {
      setIsTesting(false);
    }
  }, [canTest, expression, testCondition]);

  const handleBatchTest = useCallback(async () => {
    if (!canTest || !expression.trim()) return;

    setBatchTestRunning(true);
    setTestResults(new Map());

    for (const scenario of testScenarios) {
      await handleTestScenario(scenario);
      // Small delay between tests to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setBatchTestRunning(false);
  }, [canTest, expression, testScenarios, handleTestScenario]);

  const handlePerformanceAnalysis = useCallback(async () => {
    if (!expression.trim()) return;

    setIsAnalyzing(true);

    try {
      const metrics = await analyzePerformance({
        expression,
        testCases: testScenarios.map(s => s.context),
        iterations: 1000
      });

      setPerformanceMetrics(metrics);
    } catch (err) {
      console.error('Performance analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [expression, testScenarios, analyzePerformance]);

  const handleSecurityAnalysis = useCallback(async () => {
    if (!expression.trim()) return;

    setIsAnalyzing(true);

    try {
      const analysis = await analyzeSecurity({
        expression,
        context: condition?.metadata || {}
      });

      setSecurityAnalysis(analysis);
    } catch (err) {
      console.error('Security analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [expression, condition, analyzeSecurity]);

  const handleAddCustomScenario = useCallback(() => {
    try {
      const context = JSON.parse(customContext);
      const newScenario: TestScenario = {
        id: `custom-${Date.now()}`,
        name: 'Custom Test',
        description: 'User-defined test scenario',
        context,
        expectedResult: true,
        category: 'custom',
        tags: ['custom']
      };

      setTestScenarios(prev => [...prev, newScenario]);
      setCustomContext('{}');
    } catch (err) {
      setError('Invalid JSON context');
    }
  }, [customContext]);

  // Render Methods
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Condition Validator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Validate, test, and analyze condition expressions for correctness and performance
        </p>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Label className="text-sm">Real-time</Label>
          <Button
            variant={realTimeValidation ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRealTimeValidation(!realTimeValidation)}
          >
            {realTimeValidation ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
        
        {!realTimeValidation && (
          <Button onClick={handleValidation} disabled={isValidating || !expression.trim()}>
            {isValidating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Validate
          </Button>
        )}
      </div>
    </div>
  );

  const renderExpressionEditor = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Code className="h-5 w-5" />
          <span>Expression</span>
          {validationSummary && (
            <Badge variant={validationSummary.isValid ? 'default' : 'destructive'}>
              {validationSummary.isValid ? 'Valid' : 'Invalid'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="Enter your condition expression..."
            className="min-h-32 font-mono text-sm"
          />
          
          {validationSummary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${validationSummary.isValid ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  {validationSummary.isValid ? 'Valid' : 'Invalid'}
                </span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">Issues: </span>
                <span className={validationSummary.totalIssues > 0 ? 'text-red-600' : 'text-green-600'}>
                  {validationSummary.totalIssues}
                </span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">Complexity: </span>
                <span>{validationSummary.complexity}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">Security: </span>
                <span className={validationSummary.securityScore >= 80 ? 'text-green-600' : 'text-yellow-600'}>
                  {validationSummary.securityScore}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderValidationResults = () => {
    if (!validationResult) return null;

    const groupedIssues = [
      ...validationResult.errors.map(e => ({ ...e, severity: 'error' as ValidationSeverity })),
      ...validationResult.warnings.map(w => ({ ...w, severity: 'warning' as ValidationSeverity })),
      ...(validationResult.suggestions || []).map(s => ({ message: s, severity: 'suggestion' as ValidationSeverity }))
    ];

    return (
      <div className="space-y-4">
        {groupedIssues.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                Expression is Valid!
              </h3>
              <p className="text-gray-600">
                No issues found. Your condition is ready to use.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {groupedIssues.map((issue, index) => {
              const severityConfig = SEVERITY_CONFIG[issue.severity];
              const SeverityIcon = severityConfig.icon;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Alert>
                    <SeverityIcon className="h-4 w-4" />
                    <AlertTitle className="flex items-center space-x-2">
                      <span className="capitalize">{issue.severity}</span>
                      <Badge className={severityConfig.color}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>{issue.message}</p>
                        {(issue as any).suggestion && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">Suggestion:</p>
                            <p className="text-sm text-blue-700">{(issue as any).suggestion}</p>
                          </div>
                        )}
                        {(issue as any).line && (
                          <p className="text-xs text-gray-500">
                            Line {(issue as any).line}
                            {(issue as any).column && `, Column ${(issue as any).column}`}
                          </p>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderTestScenarios = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Test Scenarios</h3>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleBatchTest} 
            disabled={batchTestRunning || !expression.trim()}
          >
            {batchTestRunning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run All Tests
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {testScenarios.map((scenario) => {
          const testResult = testResults.get(scenario.id);
          const isRunning = isTesting && selectedScenario?.id === scenario.id;
          
          return (
            <motion.div
              key={scenario.id}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className={`cursor-pointer transition-all ${
                testResult 
                  ? testResult.result === scenario.expectedResult 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                  : 'hover:shadow-md'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{scenario.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {scenario.category}
                        </Badge>
                        {testResult && (
                          <Badge variant={testResult.result === scenario.expectedResult ? 'default' : 'destructive'}>
                            {testResult.result === scenario.expectedResult ? 'Pass' : 'Fail'}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {scenario.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {scenario.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {testResult && (
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Expected: {scenario.expectedResult ? 'Allow' : 'Deny'}</div>
                          <div>Actual: {testResult.result ? 'Allow' : 'Deny'}</div>
                          <div>Duration: {testResult.duration.toFixed(2)}ms</div>
                          {testResult.error && (
                            <div className="text-red-600">Error: {testResult.error}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestScenario(scenario)}
                        disabled={isRunning || !expression.trim()}
                      >
                        {isRunning ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      
                      {testResult && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          testResult.result === scenario.expectedResult 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {testResult.result === scenario.expectedResult ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Custom Test Scenario */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Test Scenario</CardTitle>
          <CardDescription>
            Create a custom test with your own context data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Context (JSON)</Label>
            <Textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder='{"user": {"roles": ["user"]}, "time": {"hour": 14}}'
              className="mt-2 font-mono text-sm"
              rows={4}
            />
          </div>
          
          <Button onClick={handleAddCustomScenario} disabled={!customContext.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Test
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Performance Analysis</h3>
        <Button 
          onClick={handlePerformanceAnalysis} 
          disabled={isAnalyzing || !expression.trim()}
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Analyze Performance
        </Button>
      </div>

      {performanceMetrics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Execution Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Avg Execution Time</Label>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.executionTime.toFixed(2)}ms
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Memory Usage</Label>
                  <div className="text-2xl font-bold">
                    {(performanceMetrics.memoryUsage / 1024).toFixed(1)}KB
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Complexity Score</Label>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.complexity}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">Performance Grade</Label>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.executionTime < 1 ? 'A' :
                     performanceMetrics.executionTime < 5 ? 'B' :
                     performanceMetrics.executionTime < 10 ? 'C' : 'D'}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-500 mb-2 block">Performance Score</Label>
                <Progress 
                  value={Math.max(0, 100 - performanceMetrics.executionTime * 10)} 
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceMetrics.optimizationSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {performanceMetrics.optimizationSuggestions.map((suggestion, index) => (
                    <Alert key={index}>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>{suggestion}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No optimization suggestions - performance looks good!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {performanceMetrics.bottlenecks.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Performance Bottlenecks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performanceMetrics.bottlenecks.map((bottleneck, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{bottleneck}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Performance Analysis
            </h3>
            <p className="text-gray-600">
              Run performance analysis to get detailed metrics about your condition's execution characteristics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSecurityAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Security Analysis</h3>
        <Button 
          onClick={handleSecurityAnalysis} 
          disabled={isAnalyzing || !expression.trim()}
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          Analyze Security
        </Button>
      </div>

      {securityAnalysis ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Overview</span>
                <Badge className={
                  securityAnalysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  securityAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  securityAnalysis.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }>
                  {securityAnalysis.riskLevel.toUpperCase()} RISK
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    securityAnalysis.riskLevel === 'low' ? 'text-green-600' :
                    securityAnalysis.riskLevel === 'medium' ? 'text-yellow-600' :
                    securityAnalysis.riskLevel === 'high' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {securityAnalysis.riskLevel === 'low' ? '✓' :
                     securityAnalysis.riskLevel === 'medium' ? '!' :
                     securityAnalysis.riskLevel === 'high' ? '⚠' : '⛔'}
                  </div>
                  <div className="text-sm text-gray-500">Risk Level</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {securityAnalysis.vulnerabilities.length}
                  </div>
                  <div className="text-sm text-gray-500">Vulnerabilities</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {securityAnalysis.recommendations.length}
                  </div>
                  <div className="text-sm text-gray-500">Recommendations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {securityAnalysis.vulnerabilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Security Vulnerabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAnalysis.vulnerabilities.map((vuln, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{vuln.type}</AlertTitle>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p><strong>Description:</strong> {vuln.description}</p>
                          <p><strong>Impact:</strong> {vuln.impact}</p>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-1">Mitigation:</p>
                            <p className="text-sm text-blue-700">{vuln.mitigation}</p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {securityAnalysis.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {securityAnalysis.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No security recommendations - your condition looks secure!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Security Analysis
            </h3>
            <p className="text-gray-600">
              Run security analysis to identify potential vulnerabilities and get security recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (!canValidate) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to validate conditions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {renderHeader()}
      {renderExpressionEditor()}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="mt-6">
          {renderValidationResults()}
        </TabsContent>

        <TabsContent value="testing" className="mt-6">
          {renderTestScenarios()}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          {renderPerformanceAnalysis()}
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          {renderSecurityAnalysis()}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ConditionValidator;