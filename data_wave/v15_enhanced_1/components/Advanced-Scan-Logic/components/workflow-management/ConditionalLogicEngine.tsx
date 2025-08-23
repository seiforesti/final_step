"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Split, Merge, Route, Filter, Code, Terminal, Settings, Play, Pause, Square, RotateCcw, Zap, Target, CheckCircle, XCircle, AlertTriangle, Info, Edit, Trash2, Copy, Plus, Minus, Search, Eye, EyeOff, Save, Download, Upload, RefreshCw, Calculator, Hash, Percent, Activity, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Import types and services
import {
  ConditionalRule,
  ConditionalExpression,
  ConditionalOperation,
  ConditionalLogic,
  WorkflowCondition,
  ConditionalBranch,
  ConditionalGate,
  ConditionalFlow,
  ConditionEvaluator,
  RuleEngine,
  ExpressionParser,
  LogicOperator,
  ComparisonOperator,
  ConditionResult,
  ConditionalContext,
  RuleSet,
  DecisionTree,
  ConditionalMetrics,
  RuleValidation,
  ExpressionValidation
} from '../../types/workflow.types'

import {
  useConditionalLogic,
  useRuleEngine,
  useExpressionParser,
  useConditionEvaluator,
  useDecisionTree,
  useRuleValidation,
  useConditionalMetrics
} from '../../hooks/useWorkflowManagement'

import {
  evaluateCondition,
  parseExpression,
  validateRule,
  executeRuleSet,
  buildDecisionTree,
  optimizeRules,
  generateRuleCode,
  testCondition,
  debugExpression,
  analyzeRulePerformance,
  calculateRuleMetrics,
  exportRules,
  importRules,
  cloneRule,
  mergeRuleSets,
  compareRules,
  findRuleConflicts,
  resolveRuleConflicts,
  prioritizeRules,
  categorizeRules,
  tagRules,
  searchRules,
  filterRules,
  sortRules,
  groupRules,
  aggregateRules,
  transformRules,
  normalizeRules,
  validateRuleSet,
  optimizeRuleSet,
  compileRules,
  interpretRules,
  cacheRuleResults,
  memoizeExpressions,
  profileRuleExecution,
  benchmarkRules,
  auditRuleChanges,
  versionRules,
  rollbackRules,
  migrateRules,
  scheduleRuleExecution,
  monitorRulePerformance,
  alertRuleFailures
} from '../../services/scan-workflow-apis'

import {
  RuleBuilder,
  ExpressionEditor,
  ConditionTreeView
} from '../../components/conditional-logic'

import {
  formatCondition,
  formatExpression,
  formatRule,
  formatRuleSet,
  formatDecisionTree,
  parseLogicExpression,
  evaluateLogicExpression,
  optimizeLogicExpression,
  validateLogicExpression,
  convertToDecisionTree,
  convertToRuleSet,
  generateRuleTemplate,
  calculateRuleComplexity,
  analyzeRuleDependencies,
  detectRuleAnomalies,
  suggestRuleOptimizations,
  generateRuleDocumentation,
  createRuleVisualization,
  buildLogicGraph,
  traverseDecisionPath,
  findOptimalPath,
  calculatePathProbability,
  evaluateRuleEfficiency,
  measureRuleAccuracy,
  assessRuleReliability,
  validateRuleConsistency,
  checkRuleCompleteness,
  verifyRuleCorrectness,
  testRuleCoverage,
  simulateRuleExecution,
  predictRuleOutcome,
  optimizeRuleOrder,
  balanceDecisionTree,
  pruneRuleSet,
  compressRules,
  decompressRules,
  encryptRules,
  decryptRules,
  hashRules,
  signRules,
  verifyRuleSignature
} from '../../utils/conditional-logic'

import {
  LOGIC_OPERATORS,
  COMPARISON_OPERATORS,
  CONDITIONAL_FUNCTIONS,
  RULE_TEMPLATES,
  DECISION_PATTERNS,
  CONDITIONAL_CONSTANTS,
  EXPRESSION_SYNTAX,
  RULE_VALIDATION_RULES,
  CONDITIONAL_DEFAULTS
} from '../../constants/conditional-logic'

// Enhanced interfaces for advanced conditional logic
interface ConditionalLogicEngineState {
  // Core logic state
  rules: ConditionalRule[]
  expressions: ConditionalExpression[]
  conditions: WorkflowCondition[]
  branches: ConditionalBranch[]
  gates: ConditionalGate[]
  flows: ConditionalFlow[]
  ruleSets: RuleSet[]
  decisionTrees: DecisionTree[]
  
  // Selected items
  selectedRule: ConditionalRule | null
  selectedExpression: ConditionalExpression | null
  selectedBranch: ConditionalBranch | null
  selectedRuleSet: RuleSet | null
  
  // Engine state
  ruleEngine: RuleEngine | null
  expressionParser: ExpressionParser | null
  conditionEvaluator: ConditionEvaluator | null
  
  // Execution state
  isExecuting: boolean
  isEvaluating: boolean
  isTesting: boolean
  isValidating: boolean
  isOptimizing: boolean
  
  // Metrics and analytics
  metrics: ConditionalMetrics | null
  validationResults: RuleValidation[]
  testResults: any[]
  performanceData: any[]
  
  // UI state
  view: 'builder' | 'editor' | 'tester' | 'debugger' | 'metrics' | 'library'
  mode: 'visual' | 'code' | 'table'
  showAdvanced: boolean
  autoValidate: boolean
  realTimeEvaluation: boolean
  
  // Search and filters
  searchQuery: string
  filters: any[]
  sortBy: string
  groupBy: string
  
  // Editor state
  currentCode: string
  syntaxErrors: any[]
  isDirty: boolean
  lastSaved: Date | null
  
  // Testing state
  testCases: any[]
  testContext: ConditionalContext
  testResults: any[]
  
  // Performance state
  executionTime: number
  memoryUsage: number
  cacheHitRate: number
  optimizationSuggestions: any[]
}

/**
 * ConditionalLogicEngine Component
 * 
 * Enterprise-grade conditional logic engine component that provides comprehensive
 * rule management and conditional execution capabilities including:
 * - Visual rule builder and editor
 * - Advanced expression parsing and evaluation
 * - Decision tree and flow chart visualization
 * - Rule testing and debugging tools
 * - Performance monitoring and optimization
 * - Rule validation and conflict resolution
 * - Import/export and version control
 * - Template library and wizards
 * 
 * This component integrates with the backend conditional logic engine and provides
 * a sophisticated user interface for complex business rule management.
 */
export const ConditionalLogicEngine: React.FC<{
  workflowId?: string
  context?: Partial<ConditionalContext>
  onRuleExecuted?: (rule: ConditionalRule, result: ConditionResult) => void
  onConditionEvaluated?: (condition: WorkflowCondition, result: boolean) => void
  allowCodeEditing?: boolean
  enableRealTimeEvaluation?: boolean
  showAdvancedFeatures?: boolean
}> = ({
  workflowId,
  context = {},
  onRuleExecuted,
  onConditionEvaluated,
  allowCodeEditing = true,
  enableRealTimeEvaluation = false,
  showAdvancedFeatures = true
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, setState] = useState<ConditionalLogicEngineState>({
    // Core logic state
    rules: [],
    expressions: [],
    conditions: [],
    branches: [],
    gates: [],
    flows: [],
    ruleSets: [],
    decisionTrees: [],
    
    // Selected items
    selectedRule: null,
    selectedExpression: null,
    selectedBranch: null,
    selectedRuleSet: null,
    
    // Engine state
    ruleEngine: null,
    expressionParser: null,
    conditionEvaluator: null,
    
    // Execution state
    isExecuting: false,
    isEvaluating: false,
    isTesting: false,
    isValidating: false,
    isOptimizing: false,
    
    // Metrics and analytics
    metrics: null,
    validationResults: [],
    testResults: [],
    performanceData: [],
    
    // UI state
    view: 'builder',
    mode: 'visual',
    showAdvanced: showAdvancedFeatures,
    autoValidate: true,
    realTimeEvaluation: enableRealTimeEvaluation,
    
    // Search and filters
    searchQuery: '',
    filters: [],
    sortBy: 'name',
    groupBy: 'category',
    
    // Editor state
    currentCode: '',
    syntaxErrors: [],
    isDirty: false,
    lastSaved: null,
    
    // Testing state
    testCases: [],
    testContext: { ...CONDITIONAL_DEFAULTS.context, ...context },
    testResults: [],
    
    // Performance state
    executionTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    optimizationSuggestions: []
  })

  // Refs for advanced functionality
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const builderRef = useRef<any>(null)
  const testerRef = useRef<any>(null)

  // Hook integrations
  const {
    rules,
    loading: rulesLoading,
    error: rulesError,
    refreshRules,
    createRule,
    updateRule,
    deleteRule,
    executeRule
  } = useConditionalLogic(workflowId)

  const {
    engine,
    executeRuleSet: executeRuleSetHook,
    validateRuleSet: validateRuleSetHook,
    optimizeRuleSet: optimizeRuleSetHook
  } = useRuleEngine()

  const {
    parser,
    parseExpression: parseExpressionHook,
    evaluateExpression,
    validateExpression
  } = useExpressionParser()

  const {
    evaluator,
    evaluateCondition: evaluateConditionHook,
    batchEvaluate,
    evaluateWithContext
  } = useConditionEvaluator()

  const {
    decisionTree,
    buildTree,
    traverseTree,
    optimizeTree
  } = useDecisionTree()

  const {
    validation,
    validateRule: validateRuleHook,
    validateRuleSet: validateRuleSetValidation,
    checkConflicts,
    resolveConflicts
  } = useRuleValidation()

  const {
    metrics,
    calculateMetrics,
    analyzePerformance,
    generateReport
  } = useConditionalMetrics()

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  const filteredRules = useMemo(() => {
    let result = state.rules

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      result = result.filter(rule =>
        rule.name?.toLowerCase().includes(query) ||
        rule.description?.toLowerCase().includes(query) ||
        rule.expression?.toLowerCase().includes(query)
      )
    }

    // Apply filters
    state.filters.forEach(filter => {
      result = result.filter(rule => {
        // Apply specific filter logic based on filter type
        return true // Simplified for brevity
      })
    })

    // Apply sorting
    result.sort((a, b) => {
      switch (state.sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'priority':
          return (b.priority || 0) - (a.priority || 0)
        case 'created':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        default:
          return 0
      }
    })

    return result
  }, [state.rules, state.searchQuery, state.filters, state.sortBy])

  const ruleStatistics = useMemo(() => {
    return {
      totalRules: state.rules.length,
      activeRules: state.rules.filter(r => r.enabled).length,
      validRules: state.validationResults.filter(v => v.isValid).length,
      errorRules: state.validationResults.filter(v => !v.isValid).length,
      complexRules: state.rules.filter(r => calculateRuleComplexity(r) > 5).length,
      optimizedRules: state.rules.filter(r => r.optimized).length
    }
  }, [state.rules, state.validationResults])

  const canExecuteRule = useMemo(() => {
    return state.selectedRule && !state.isExecuting
  }, [state.selectedRule, state.isExecuting])

  const canSaveChanges = useMemo(() => {
    return state.isDirty && !state.isExecuting
  }, [state.isDirty, state.isExecuting])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleViewChange = useCallback((view: typeof state.view) => {
    setState(prev => ({ ...prev, view }))
  }, [])

  const handleModeChange = useCallback((mode: typeof state.mode) => {
    setState(prev => ({ ...prev, mode }))
  }, [])

  const handleRuleSelect = useCallback((rule: ConditionalRule) => {
    setState(prev => ({
      ...prev,
      selectedRule: rule,
      currentCode: rule.expression || ''
    }))
  }, [])

  const handleRuleCreate = useCallback(async (ruleData: Partial<ConditionalRule>) => {
    try {
      setState(prev => ({ ...prev, isExecuting: true }))
      const newRule = await createRule(ruleData)
      setState(prev => ({
        ...prev,
        rules: [...prev.rules, newRule],
        selectedRule: newRule
      }))
    } catch (error) {
      console.error('Failed to create rule:', error)
    } finally {
      setState(prev => ({ ...prev, isExecuting: false }))
    }
  }, [createRule])

  const handleRuleUpdate = useCallback(async (ruleId: string, updates: Partial<ConditionalRule>) => {
    try {
      setState(prev => ({ ...prev, isExecuting: true }))
      const updatedRule = await updateRule(ruleId, updates)
      setState(prev => ({
        ...prev,
        rules: prev.rules.map(r => r.id === ruleId ? updatedRule : r),
        selectedRule: updatedRule,
        isDirty: false,
        lastSaved: new Date()
      }))
    } catch (error) {
      console.error('Failed to update rule:', error)
    } finally {
      setState(prev => ({ ...prev, isExecuting: false }))
    }
  }, [updateRule])

  const handleRuleDelete = useCallback(async (ruleId: string) => {
    try {
      setState(prev => ({ ...prev, isExecuting: true }))
      await deleteRule(ruleId)
      setState(prev => ({
        ...prev,
        rules: prev.rules.filter(r => r.id !== ruleId),
        selectedRule: prev.selectedRule?.id === ruleId ? null : prev.selectedRule
      }))
    } catch (error) {
      console.error('Failed to delete rule:', error)
    } finally {
      setState(prev => ({ ...prev, isExecuting: false }))
    }
  }, [deleteRule])

  const handleRuleExecute = useCallback(async (rule: ConditionalRule) => {
    if (!canExecuteRule) return

    try {
      setState(prev => ({ ...prev, isExecuting: true }))
      const startTime = Date.now()
      
      const result = await executeRule(rule.id, state.testContext)
      
      const executionTime = Date.now() - startTime
      setState(prev => ({
        ...prev,
        executionTime,
        testResults: [...prev.testResults, { rule, result, timestamp: new Date() }]
      }))
      
      onRuleExecuted?.(rule, result)
      
    } catch (error) {
      console.error('Failed to execute rule:', error)
    } finally {
      setState(prev => ({ ...prev, isExecuting: false }))
    }
  }, [canExecuteRule, executeRule, state.testContext, onRuleExecuted])

  const handleExpressionChange = useCallback((expression: string) => {
    setState(prev => ({
      ...prev,
      currentCode: expression,
      isDirty: true
    }))

    // Real-time validation if enabled
    if (state.autoValidate) {
      validateExpressionSyntax(expression)
    }
  }, [state.autoValidate])

  const validateExpressionSyntax = useCallback(async (expression: string) => {
    try {
      setState(prev => ({ ...prev, isValidating: true }))
      const validation = await validateExpression(expression)
      setState(prev => ({
        ...prev,
        syntaxErrors: validation.errors || []
      }))
    } catch (error) {
      console.error('Failed to validate expression:', error)
    } finally {
      setState(prev => ({ ...prev, isValidating: false }))
    }
  }, [validateExpression])

  const handleTestRule = useCallback(async (rule: ConditionalRule, testContext: ConditionalContext) => {
    try {
      setState(prev => ({ ...prev, isTesting: true }))
      
      const result = await evaluateConditionHook(rule.condition, testContext)
      
      setState(prev => ({
        ...prev,
        testResults: [...prev.testResults, {
          rule,
          context: testContext,
          result,
          timestamp: new Date()
        }]
      }))
      
    } catch (error) {
      console.error('Failed to test rule:', error)
    } finally {
      setState(prev => ({ ...prev, isTesting: false }))
    }
  }, [evaluateConditionHook])

  const handleOptimizeRules = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }))
      
      const optimizedRules = await optimizeRules(state.rules)
      const suggestions = await suggestRuleOptimizations(state.rules)
      
      setState(prev => ({
        ...prev,
        rules: optimizedRules,
        optimizationSuggestions: suggestions
      }))
      
    } catch (error) {
      console.error('Failed to optimize rules:', error)
    } finally {
      setState(prev => ({ ...prev, isOptimizing: false }))
    }
  }, [state.rules])

  const handleExportRules = useCallback(async (format: string) => {
    try {
      const exportData = await exportRules(filteredRules, format)
      // Handle download
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rules.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export rules:', error)
    }
  }, [filteredRules])

  const handleImportRules = useCallback(async (file: File) => {
    try {
      const content = await file.text()
      const importedRules = await importRules(content)
      setState(prev => ({
        ...prev,
        rules: [...prev.rules, ...importedRules]
      }))
    } catch (error) {
      console.error('Failed to import rules:', error)
    }
  }, [])

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initialize data
    refreshRules()
  }, [workflowId])

  useEffect(() => {
    // Update state from hooks
    setState(prev => ({
      ...prev,
      rules: rules || [],
      ruleEngine: engine || null,
      expressionParser: parser || null,
      conditionEvaluator: evaluator || null,
      metrics: metrics || null
    }))
  }, [rules, engine, parser, evaluator, metrics])

  useEffect(() => {
    // Auto-validation when rules change
    if (state.autoValidate && state.rules.length > 0) {
      validateAllRules()
    }
  }, [state.rules, state.autoValidate])

  const validateAllRules = useCallback(async () => {
    try {
      const validations = await Promise.all(
        state.rules.map(rule => validateRuleHook(rule))
      )
      setState(prev => ({ ...prev, validationResults: validations }))
    } catch (error) {
      console.error('Failed to validate rules:', error)
    }
  }, [state.rules, validateRuleHook])

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Conditional Logic Engine</h1>
        <Separator orientation="vertical" className="h-6" />
        <Tabs value={state.view} onValueChange={handleViewChange}>
          <TabsList>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="tester">Tester</TabsTrigger>
            <TabsTrigger value="debugger">Debugger</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center space-x-2">
        <Select value={state.mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visual">Visual</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="table">Table</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={state.autoValidate ? 'default' : 'outline'}
                size="sm"
                onClick={() => setState(prev => ({ ...prev, autoValidate: !prev.autoValidate }))}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {state.autoValidate ? 'Disable auto-validation' : 'Enable auto-validation'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button variant="outline" size="sm" onClick={handleOptimizeRules} disabled={state.isOptimizing}>
          <Zap className={`h-4 w-4 ${state.isOptimizing ? 'animate-spin' : ''}`} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExportRules('json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportRules('xml')}>
              Export as XML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportRules('yaml')}>
              Export as YAML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Total Rules</p>
              <p className="text-2xl font-bold">{ruleStatistics.totalRules}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-2xl font-bold">{ruleStatistics.activeRules}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">Valid</p>
              <p className="text-2xl font-bold">{ruleStatistics.validRules}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium">Errors</p>
              <p className="text-2xl font-bold">{ruleStatistics.errorRules}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Complex</p>
              <p className="text-2xl font-bold">{ruleStatistics.complexRules}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium">Optimized</p>
              <p className="text-2xl font-bold">{ruleStatistics.optimizedRules}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRuleCard = (rule: ConditionalRule) => (
    <Card 
      key={rule.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        state.selectedRule?.id === rule.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleRuleSelect(rule)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{rule.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={rule.enabled ? 'default' : 'secondary'}>
              {rule.enabled ? 'Active' : 'Inactive'}
            </Badge>
            {rule.priority && (
              <Badge variant="outline">P{rule.priority}</Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-sm">
          {rule.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="bg-muted/50 p-2 rounded text-sm font-mono">
            {rule.expression}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Complexity: {calculateRuleComplexity(rule)}</span>
            <span>Modified: {formatTimestamp(rule.updatedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleRuleExecute(rule)
              }}
              disabled={!canExecuteRule}
            >
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                // Handle edit
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                // Handle copy
              }}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-background" ref={containerRef}>
      {renderToolbar()}
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={state.view} className="h-full flex flex-col">
          {/* Builder View */}
          <TabsContent value="builder" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              {renderStatisticsCards()}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rule Builder</CardTitle>
                      <CardDescription>
                        Create and manage conditional rules visually
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RuleBuilder
                        rules={filteredRules}
                        selectedRule={state.selectedRule}
                        onRuleSelect={handleRuleSelect}
                        onRuleCreate={handleRuleCreate}
                        onRuleUpdate={handleRuleUpdate}
                        onRuleDelete={handleRuleDelete}
                        mode={state.mode}
                        ref={builderRef}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rule Library</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RuleLibrary
                        templates={RULE_TEMPLATES}
                        onTemplateSelect={(template) => {
                          handleRuleCreate(template)
                        }}
                      />
                    </CardContent>
                  </Card>
                  
                  {state.selectedRule && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Rule Properties</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="rule-name">Name</Label>
                            <Input
                              id="rule-name"
                              value={state.selectedRule.name || ''}
                              onChange={(e) => {
                                if (state.selectedRule) {
                                  handleRuleUpdate(state.selectedRule.id, {
                                    name: e.target.value
                                  })
                                }
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="rule-description">Description</Label>
                            <Textarea
                              id="rule-description"
                              value={state.selectedRule.description || ''}
                              onChange={(e) => {
                                if (state.selectedRule) {
                                  handleRuleUpdate(state.selectedRule.id, {
                                    description: e.target.value
                                  })
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={state.selectedRule.enabled || false}
                              onCheckedChange={(enabled) => {
                                if (state.selectedRule) {
                                  handleRuleUpdate(state.selectedRule.id, { enabled })
                                }
                              }}
                            />
                            <Label>Enabled</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Editor View */}
          <TabsContent value="editor" className="flex-1 overflow-hidden">
            <div className="h-full">
              <ExpressionEditor
                expression={state.currentCode}
                onChange={handleExpressionChange}
                syntaxErrors={state.syntaxErrors}
                allowCodeEditing={allowCodeEditing}
                autoValidate={state.autoValidate}
                ref={editorRef}
              />
            </div>
          </TabsContent>

          {/* Tester View */}
          <TabsContent value="tester" className="flex-1 overflow-hidden">
            <div className="h-full">
              <RuleTestRunner
                rules={filteredRules}
                testCases={state.testCases}
                testResults={state.testResults}
                onTestRule={handleTestRule}
                context={state.testContext}
                onContextChange={(context) =>
                  setState(prev => ({ ...prev, testContext: context }))
                }
                ref={testerRef}
              />
            </div>
          </TabsContent>

          {/* Debugger View */}
          <TabsContent value="debugger" className="flex-1 overflow-hidden">
            <div className="h-full">
              <RuleDebugger
                selectedRule={state.selectedRule}
                executionTrace={state.testResults}
                syntaxErrors={state.syntaxErrors}
                validationResults={state.validationResults}
              />
            </div>
          </TabsContent>

          {/* Metrics View */}
          <TabsContent value="metrics" className="flex-1 overflow-hidden">
            <div className="h-full">
              <RuleMetricsPanel
                metrics={state.metrics}
                performanceData={state.performanceData}
                optimizationSuggestions={state.optimizationSuggestions}
                onOptimize={handleOptimizeRules}
              />
            </div>
          </TabsContent>

          {/* Library View */}
          <TabsContent value="library" className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Rule Library</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search rules..."
                      value={state.searchQuery}
                      onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                      className="w-64"
                    />
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRules.map(renderRuleCard)}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Loading States */}
      {(state.isExecuting || state.isEvaluating || state.isTesting || state.isValidating || state.isOptimizing) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>
              {state.isExecuting ? 'Executing rule...' :
               state.isEvaluating ? 'Evaluating expression...' :
               state.isTesting ? 'Running tests...' :
               state.isValidating ? 'Validating rules...' :
               'Optimizing rules...'}
            </span>
          </div>
        </div>
      )}

      {/* Save Indicator */}
      {state.isDirty && (
        <div className="fixed bottom-4 left-4 bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm">
          Unsaved changes
        </div>
      )}

      {/* Performance Indicator */}
      {state.executionTime > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
          Last execution: {state.executionTime}ms
        </div>
      )}
    </div>
  )
}

// Helper function to format timestamps
const formatTimestamp = (date: string | Date | undefined): string => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString()
}

export default ConditionalLogicEngine