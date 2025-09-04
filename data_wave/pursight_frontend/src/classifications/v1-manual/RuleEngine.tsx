'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  Separator 
} from '@/components/ui/separator';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, XCircle, Play, Pause, RotateCcw, Settings, Filter, Search, Download, Upload, Copy, Edit, Trash2, Plus, ChevronDown, ChevronRight, Eye, Code, Database, FileText, Activity, BarChart3, TrendingUp, Clock, Users, Shield, Zap, Brain, Target, Layers, GitBranch, History, TestTube, Workflow, MessageSquare, Bell, Calendar, MapPin, Link, ExternalLink, RefreshCw, Save, X, Check, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { 
  ClassificationRule, 
  RuleCondition, 
  RuleAction, 
  RuleExecutionResult, 
  RuleTemplate, 
  RuleSet, 
  RuleTestCase, 
  RuleMetrics, 
  RuleValidationResult, 
  RuleConflict, 
  RuleOptimization,
  Classification,
  ClassificationFramework
} from '../core/types';

interface RuleEngineProps {
  frameworkId?: string;
  onRuleUpdate?: (rule: ClassificationRule) => void;
  onRulesetChange?: (ruleset: RuleSet) => void;
  readonly?: boolean;
  className?: string;
}

interface RuleEngineState {
  selectedRule: ClassificationRule | null;
  selectedRuleset: RuleSet | null;
  activeTab: string;
  searchQuery: string;
  filterStatus: string;
  filterPriority: string;
  filterFramework: string;
  showInactiveRules: boolean;
  editingRule: ClassificationRule | null;
  testingRule: ClassificationRule | null;
  validationResults: RuleValidationResult[];
  conflictAnalysis: RuleConflict[];
  optimizationSuggestions: RuleOptimization[];
  executionHistory: RuleExecutionResult[];
  ruleMetrics: Map<string, RuleMetrics>;
  isCreatingRule: boolean;
  isBulkEditing: boolean;
  selectedRuleIds: Set<string>;
  ruleBuilder: {
    conditions: RuleCondition[];
    actions: RuleAction[];
    metadata: any;
  };
  performanceMonitor: {
    executionTimes: number[];
    memoryUsage: number[];
    errorRates: number[];
    throughput: number[];
  };
  realTimeStatus: {
    activeExecutions: number;
    queuedRules: number;
    failedRules: number;
    successRate: number;
  };
}

const RULE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const RULE_STATUSES = ['ACTIVE', 'INACTIVE', 'TESTING', 'DEPRECATED'] as const;
const CONDITION_OPERATORS = ['EQUALS', 'CONTAINS', 'MATCHES', 'GREATER_THAN', 'LESS_THAN', 'IN', 'NOT_IN'] as const;
const ACTION_TYPES = ['CLASSIFY', 'TAG', 'ROUTE', 'NOTIFY', 'ESCALATE', 'REJECT'] as const;

export const RuleEngine: React.FC<RuleEngineProps> = ({
  frameworkId,
  onRuleUpdate,
  onRulesetChange,
  readonly = false,
  className = ''
}) => {
  const { toast } = useToast();
  const { 
    manualClassifications,
    frameworks,
    loadManualClassifications,
    updateClassification,
    deleteClassification,
    isLoading,
    error,
    realTimeEvents
  } = useClassificationState();

  // Component state
  const [state, setState] = useState<RuleEngineState>({
    selectedRule: null,
    selectedRuleset: null,
    activeTab: 'rules',
    searchQuery: '',
    filterStatus: 'ALL',
    filterPriority: 'ALL',
    filterFramework: frameworkId || 'ALL',
    showInactiveRules: false,
    editingRule: null,
    testingRule: null,
    validationResults: [],
    conflictAnalysis: [],
    optimizationSuggestions: [],
    executionHistory: [],
    ruleMetrics: new Map(),
    isCreatingRule: false,
    isBulkEditing: false,
    selectedRuleIds: new Set(),
    ruleBuilder: {
      conditions: [],
      actions: [],
      metadata: {}
    },
    performanceMonitor: {
      executionTimes: [],
      memoryUsage: [],
      errorRates: [],
      throughput: []
    },
    realTimeStatus: {
      activeExecutions: 0,
      queuedRules: 0,
      failedRules: 0,
      successRate: 0
    }
  });

  // Refs for real-time updates
  const wsRef = useRef<WebSocket | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const performanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized computed values
  const filteredRules = useMemo(() => {
    const rules = manualClassifications.filter(c => c.type === 'RULE') as ClassificationRule[];
    
    return rules.filter(rule => {
      const matchesSearch = !state.searchQuery || 
        rule.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        rule.description?.toLowerCase().includes(state.searchQuery.toLowerCase());
      
      const matchesStatus = state.filterStatus === 'ALL' || rule.status === state.filterStatus;
      const matchesPriority = state.filterPriority === 'ALL' || rule.priority === state.filterPriority;
      const matchesFramework = state.filterFramework === 'ALL' || rule.frameworkId === state.filterFramework;
      const matchesActive = state.showInactiveRules || rule.status === 'ACTIVE';

      return matchesSearch && matchesStatus && matchesPriority && matchesFramework && matchesActive;
    });
  }, [manualClassifications, state.searchQuery, state.filterStatus, state.filterPriority, state.filterFramework, state.showInactiveRules]);

  const ruleMetricsAggregated = useMemo(() => {
    const metrics = Array.from(state.ruleMetrics.values());
    if (metrics.length === 0) return null;

    return {
      totalExecutions: metrics.reduce((sum, m) => sum + m.executionCount, 0),
      averageExecutionTime: metrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) / metrics.length,
      successRate: metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length,
      errorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length,
      resourceUsage: metrics.reduce((sum, m) => sum + m.resourceUsage, 0) / metrics.length
    };
  }, [state.ruleMetrics]);

  const conflictCount = useMemo(() => {
    return state.conflictAnalysis.length;
  }, [state.conflictAnalysis]);

  const optimizationCount = useMemo(() => {
    return state.optimizationSuggestions.length;
  }, [state.optimizationSuggestions]);

  // Lifecycle hooks
  useEffect(() => {
    initializeRuleEngine();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (frameworkId) {
      setState(prev => ({ ...prev, filterFramework: frameworkId }));
    }
  }, [frameworkId]);

  useEffect(() => {
    handleRealTimeUpdate();
  }, [realTimeEvents]);

  // Core initialization and cleanup
  const initializeRuleEngine = useCallback(async () => {
    try {
      await loadManualClassifications();
      await initializeWebSocket();
      await startMetricsCollection();
      await performInitialValidation();
      await loadRuleTemplates();
      await analyzeRuleConflicts();
      await generateOptimizationSuggestions();
    } catch (error) {
      console.error('Failed to initialize rule engine:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize rule engine",
        variant: "destructive",
      });
    }
  }, [loadManualClassifications]);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }
    if (performanceIntervalRef.current) {
      clearInterval(performanceIntervalRef.current);
    }
  }, []);

  // WebSocket and real-time updates
  const initializeWebSocket = useCallback(async () => {
    try {
      const wsUrl = `ws://localhost:8000/ws/rules/${frameworkId || 'all'}`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Rule engine WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      wsRef.current.onclose = () => {
        console.log('Rule engine WebSocket disconnected');
        // Attempt reconnection after 5 seconds
        setTimeout(initializeWebSocket, 5000);
      };
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  }, [frameworkId]);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'RULE_EXECUTION':
        handleRuleExecutionUpdate(data.payload);
        break;
      case 'RULE_METRICS':
        handleRuleMetricsUpdate(data.payload);
        break;
      case 'RULE_CONFLICT':
        handleRuleConflictUpdate(data.payload);
        break;
      case 'PERFORMANCE_UPDATE':
        handlePerformanceUpdate(data.payload);
        break;
      case 'STATUS_UPDATE':
        handleStatusUpdate(data.payload);
        break;
    }
  }, []);

  const handleRealTimeUpdate = useCallback(() => {
    // Process real-time events from the global state
    realTimeEvents.forEach(event => {
      if (event.type === 'RULE_UPDATE') {
        // Handle rule updates
        loadManualClassifications();
      }
    });
  }, [realTimeEvents, loadManualClassifications]);

  // Metrics and monitoring
  const startMetricsCollection = useCallback(async () => {
    metricsIntervalRef.current = setInterval(async () => {
      await collectRuleMetrics();
      await updatePerformanceMetrics();
      await updateRealTimeStatus();
    }, 5000);
  }, []);

  const collectRuleMetrics = useCallback(async () => {
    try {
      // Simulate API call to collect rule metrics
      const mockMetrics: Record<string, RuleMetrics> = {};
      
      filteredRules.forEach(rule => {
        mockMetrics[rule.id] = {
          ruleId: rule.id,
          executionCount: Math.floor(Math.random() * 1000),
          successCount: Math.floor(Math.random() * 900),
          errorCount: Math.floor(Math.random() * 100),
          averageExecutionTime: Math.random() * 100,
          lastExecutionTime: new Date().toISOString(),
          resourceUsage: Math.random() * 100,
          successRate: 0.9 + Math.random() * 0.1,
          errorRate: Math.random() * 0.1,
          throughput: Math.random() * 1000,
          memoryUsage: Math.random() * 512,
          cpuUsage: Math.random() * 100
        };
      });

      setState(prev => ({
        ...prev,
        ruleMetrics: new Map(Object.entries(mockMetrics))
      }));
    } catch (error) {
      console.error('Failed to collect rule metrics:', error);
    }
  }, [filteredRules]);

  const updatePerformanceMetrics = useCallback(async () => {
    setState(prev => ({
      ...prev,
      performanceMonitor: {
        executionTimes: [...prev.performanceMonitor.executionTimes.slice(-19), Math.random() * 100],
        memoryUsage: [...prev.performanceMonitor.memoryUsage.slice(-19), Math.random() * 512],
        errorRates: [...prev.performanceMonitor.errorRates.slice(-19), Math.random() * 0.1],
        throughput: [...prev.performanceMonitor.throughput.slice(-19), Math.random() * 1000]
      }
    }));
  }, []);

  const updateRealTimeStatus = useCallback(async () => {
    setState(prev => ({
      ...prev,
      realTimeStatus: {
        activeExecutions: Math.floor(Math.random() * 50),
        queuedRules: Math.floor(Math.random() * 100),
        failedRules: Math.floor(Math.random() * 10),
        successRate: 0.9 + Math.random() * 0.1
      }
    }));
  }, []);

  // Rule validation and conflict detection
  const performInitialValidation = useCallback(async () => {
    try {
      const validationResults: RuleValidationResult[] = [];
      
      for (const rule of filteredRules) {
        const result = await validateRule(rule);
        validationResults.push(result);
      }

      setState(prev => ({ ...prev, validationResults }));
    } catch (error) {
      console.error('Failed to perform initial validation:', error);
    }
  }, [filteredRules]);

  const validateRule = useCallback(async (rule: ClassificationRule): Promise<RuleValidationResult> => {
    // Simulate rule validation logic
    const isValid = Math.random() > 0.2; // 80% success rate
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!isValid) {
      errors.push('Invalid condition syntax');
      errors.push('Missing required action');
    }

    if (Math.random() > 0.7) {
      warnings.push('Rule may have performance impact');
      warnings.push('Consider optimizing conditions');
    }

    return {
      ruleId: rule.id,
      isValid,
      errors,
      warnings,
      suggestions: isValid ? ['Rule is well-formed'] : ['Fix syntax errors', 'Add missing actions'],
      validatedAt: new Date().toISOString()
    };
  }, []);

  const analyzeRuleConflicts = useCallback(async () => {
    try {
      const conflicts: RuleConflict[] = [];
      
      // Simulate conflict detection
      for (let i = 0; i < filteredRules.length; i++) {
        for (let j = i + 1; j < filteredRules.length; j++) {
          if (Math.random() > 0.9) { // 10% chance of conflict
            conflicts.push({
              id: `conflict_${i}_${j}`,
              ruleIds: [filteredRules[i].id, filteredRules[j].id],
              type: 'OVERLAPPING_CONDITIONS',
              severity: 'MEDIUM',
              description: 'Rules have overlapping conditions that may cause conflicts',
              resolution: 'Consider merging rules or adjusting conditions',
              detectedAt: new Date().toISOString()
            });
          }
        }
      }

      setState(prev => ({ ...prev, conflictAnalysis: conflicts }));
    } catch (error) {
      console.error('Failed to analyze rule conflicts:', error);
    }
  }, [filteredRules]);

  const generateOptimizationSuggestions = useCallback(async () => {
    try {
      const suggestions: RuleOptimization[] = [];
      
      filteredRules.forEach((rule, index) => {
        if (Math.random() > 0.7) { // 30% chance of optimization suggestion
          suggestions.push({
            id: `opt_${rule.id}`,
            ruleId: rule.id,
            type: 'PERFORMANCE',
            suggestion: 'Reorder conditions for better performance',
            impact: 'MEDIUM',
            estimatedImprovement: '15-25% execution time reduction',
            implementationEffort: 'LOW',
            createdAt: new Date().toISOString()
          });
        }
      });

      setState(prev => ({ ...prev, optimizationSuggestions: suggestions }));
    } catch (error) {
      console.error('Failed to generate optimization suggestions:', error);
    }
  }, [filteredRules]);

  // Rule templates and creation
  const loadRuleTemplates = useCallback(async () => {
    // This would load rule templates from the backend
    // For now, we'll simulate this
    console.log('Loading rule templates...');
  }, []);

  // Rule CRUD operations
  const handleCreateRule = useCallback(async (ruleData: Partial<ClassificationRule>) => {
    try {
      setState(prev => ({ ...prev, isCreatingRule: true }));
      
      const newRule: ClassificationRule = {
        id: `rule_${Date.now()}`,
        name: ruleData.name || 'New Rule',
        description: ruleData.description || '',
        frameworkId: frameworkId || '',
        type: 'RULE',
        status: 'TESTING',
        priority: ruleData.priority || 'MEDIUM',
        conditions: ruleData.conditions || [],
        actions: ruleData.actions || [],
        metadata: ruleData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user', // This would come from auth context
        tags: ruleData.tags || [],
        version: '1.0'
      };

      // This would be an API call
      // await createRule(newRule);
      
      onRuleUpdate?.(newRule);
      
      toast({
        title: "Rule Created",
        description: `Rule "${newRule.name}" has been created successfully`,
      });

      setState(prev => ({ 
        ...prev, 
        isCreatingRule: false,
        selectedRule: newRule,
        activeTab: 'details'
      }));
    } catch (error) {
      console.error('Failed to create rule:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create the rule",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isCreatingRule: false }));
    }
  }, [frameworkId, onRuleUpdate]);

  const handleUpdateRule = useCallback(async (ruleId: string, updates: Partial<ClassificationRule>) => {
    try {
      const rule = filteredRules.find(r => r.id === ruleId);
      if (!rule) return;

      const updatedRule = { ...rule, ...updates, updatedAt: new Date().toISOString() };
      
      // This would be an API call
      // await updateRule(ruleId, updates);
      
      onRuleUpdate?.(updatedRule);
      
      toast({
        title: "Rule Updated",
        description: `Rule "${updatedRule.name}" has been updated successfully`,
      });

      setState(prev => ({ ...prev, editingRule: null }));
    } catch (error) {
      console.error('Failed to update rule:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the rule",
        variant: "destructive",
      });
    }
  }, [filteredRules, onRuleUpdate]);

  const handleDeleteRule = useCallback(async (ruleId: string) => {
    try {
      const rule = filteredRules.find(r => r.id === ruleId);
      if (!rule) return;

      // This would be an API call
      // await deleteRule(ruleId);
      
      toast({
        title: "Rule Deleted",
        description: `Rule "${rule.name}" has been deleted successfully`,
      });

      setState(prev => ({ 
        ...prev, 
        selectedRule: prev.selectedRule?.id === ruleId ? null : prev.selectedRule
      }));
    } catch (error) {
      console.error('Failed to delete rule:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete the rule",
        variant: "destructive",
      });
    }
  }, [filteredRules]);

  // Rule testing and execution
  const handleTestRule = useCallback(async (rule: ClassificationRule, testData?: any) => {
    try {
      setState(prev => ({ ...prev, testingRule: rule }));
      
      // Simulate rule testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const testResult: RuleExecutionResult = {
        id: `test_${Date.now()}`,
        ruleId: rule.id,
        status: Math.random() > 0.2 ? 'SUCCESS' : 'FAILURE',
        executionTime: Math.random() * 100,
        result: {
          matched: Math.random() > 0.3,
          confidence: Math.random(),
          actions: rule.actions,
          metadata: {}
        },
        error: Math.random() > 0.8 ? 'Test error occurred' : undefined,
        executedAt: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        testingRule: null,
        executionHistory: [testResult, ...prev.executionHistory.slice(0, 49)]
      }));

      toast({
        title: "Rule Test Completed",
        description: `Test ${testResult.status.toLowerCase()} - ${testResult.executionTime.toFixed(2)}ms`,
        variant: testResult.status === 'SUCCESS' ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Failed to test rule:', error);
      setState(prev => ({ ...prev, testingRule: null }));
      toast({
        title: "Test Failed",
        description: "Failed to execute rule test",
        variant: "destructive",
      });
    }
  }, []);

  // Bulk operations
  const handleBulkOperation = useCallback(async (operation: string, ruleIds: string[]) => {
    try {
      setState(prev => ({ ...prev, isBulkEditing: true }));
      
      switch (operation) {
        case 'ACTIVATE':
          for (const ruleId of ruleIds) {
            await handleUpdateRule(ruleId, { status: 'ACTIVE' });
          }
          break;
        case 'DEACTIVATE':
          for (const ruleId of ruleIds) {
            await handleUpdateRule(ruleId, { status: 'INACTIVE' });
          }
          break;
        case 'DELETE':
          for (const ruleId of ruleIds) {
            await handleDeleteRule(ruleId);
          }
          break;
      }

      setState(prev => ({ 
        ...prev, 
        isBulkEditing: false,
        selectedRuleIds: new Set()
      }));

      toast({
        title: "Bulk Operation Completed",
        description: `${operation} applied to ${ruleIds.length} rules`,
      });
    } catch (error) {
      console.error('Bulk operation failed:', error);
      setState(prev => ({ ...prev, isBulkEditing: false }));
      toast({
        title: "Bulk Operation Failed",
        description: "Failed to complete bulk operation",
        variant: "destructive",
      });
    }
  }, [handleUpdateRule, handleDeleteRule]);

  // Event handlers
  const handleRuleExecutionUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      executionHistory: [data, ...prev.executionHistory.slice(0, 49)]
    }));
  }, []);

  const handleRuleMetricsUpdate = useCallback((data: any) => {
    setState(prev => {
      const newMetrics = new Map(prev.ruleMetrics);
      newMetrics.set(data.ruleId, data);
      return { ...prev, ruleMetrics: newMetrics };
    });
  }, []);

  const handleRuleConflictUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      conflictAnalysis: [data, ...prev.conflictAnalysis.filter(c => c.id !== data.id)]
    }));
  }, []);

  const handlePerformanceUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      performanceMonitor: {
        ...prev.performanceMonitor,
        ...data
      }
    }));
  }, []);

  const handleStatusUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      realTimeStatus: {
        ...prev.realTimeStatus,
        ...data
      }
    }));
  }, []);

  const handleRuleSelection = useCallback((rule: ClassificationRule) => {
    setState(prev => ({ ...prev, selectedRule: rule }));
  }, []);

  const handleRuleEdit = useCallback((rule: ClassificationRule) => {
    setState(prev => ({ ...prev, editingRule: rule }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleFilterChange = useCallback((type: string, value: string) => {
    setState(prev => ({ ...prev, [`filter${type}`]: value }));
  }, []);

  // Rule Builder Components
  const RuleBuilderDialog = () => (
    <Dialog open={state.isCreatingRule} onOpenChange={(open) => setState(prev => ({ ...prev, isCreatingRule: open }))}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Classification Rule</DialogTitle>
          <DialogDescription>
            Build a new rule with conditions and actions for automated classification
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rule Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                placeholder="Enter rule name"
                value={state.ruleBuilder.metadata.name || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  ruleBuilder: {
                    ...prev.ruleBuilder,
                    metadata: { ...prev.ruleBuilder.metadata, name: e.target.value }
                  }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rule-priority">Priority</Label>
              <Select
                value={state.ruleBuilder.metadata.priority || 'MEDIUM'}
                onValueChange={(value) => setState(prev => ({
                  ...prev,
                  ruleBuilder: {
                    ...prev.ruleBuilder,
                    metadata: { ...prev.ruleBuilder.metadata, priority: value }
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_PRIORITIES.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rule-description">Description</Label>
            <Textarea
              id="rule-description"
              placeholder="Describe what this rule does"
              value={state.ruleBuilder.metadata.description || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                ruleBuilder: {
                  ...prev.ruleBuilder,
                  metadata: { ...prev.ruleBuilder.metadata, description: e.target.value }
                }
              }))}
            />
          </div>

          {/* Conditions Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Conditions</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({
                  ...prev,
                  ruleBuilder: {
                    ...prev.ruleBuilder,
                    conditions: [...prev.ruleBuilder.conditions, {
                      id: `condition_${Date.now()}`,
                      field: '',
                      operator: 'EQUALS',
                      value: '',
                      type: 'STRING'
                    }]
                  }
                }))}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Condition
              </Button>
            </div>
            
            {state.ruleBuilder.conditions.map((condition, index) => (
              <Card key={condition.id} className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Field name"
                    value={condition.field}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      ruleBuilder: {
                        ...prev.ruleBuilder,
                        conditions: prev.ruleBuilder.conditions.map((c, i) =>
                          i === index ? { ...c, field: e.target.value } : c
                        )
                      }
                    }))}
                  />
                  
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => setState(prev => ({
                      ...prev,
                      ruleBuilder: {
                        ...prev.ruleBuilder,
                        conditions: prev.ruleBuilder.conditions.map((c, i) =>
                          i === index ? { ...c, operator: value } : c
                        )
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_OPERATORS.map(op => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      ruleBuilder: {
                        ...prev.ruleBuilder,
                        conditions: prev.ruleBuilder.conditions.map((c, i) =>
                          i === index ? { ...c, value: e.target.value } : c
                        )
                      }
                    }))}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({
                      ...prev,
                      ruleBuilder: {
                        ...prev.ruleBuilder,
                        conditions: prev.ruleBuilder.conditions.filter((_, i) => i !== index)
                      }
                    }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Actions Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Actions</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({
                  ...prev,
                  ruleBuilder: {
                    ...prev.ruleBuilder,
                    actions: [...prev.ruleBuilder.actions, {
                      id: `action_${Date.now()}`,
                      type: 'CLASSIFY',
                      parameters: {},
                      order: prev.ruleBuilder.actions.length
                    }]
                  }
                }))}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Action
              </Button>
            </div>
            
            {state.ruleBuilder.actions.map((action, index) => (
              <Card key={action.id} className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={action.type}
                    onValueChange={(value) => setState(prev => ({
                      ...prev,
                      ruleBuilder: {
                        ...prev.ruleBuilder,
                        actions: prev.ruleBuilder.actions.map((a, i) =>
                          i === index ? { ...a, type: value } : a
                        )
                      }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Parameters (JSON)"
                    value={JSON.stringify(action.parameters)}
                    onChange={(e) => {
                      try {
                        const params = JSON.parse(e.target.value);
                        setState(prev => ({
                          ...prev,
                          ruleBuilder: {
                            ...prev.ruleBuilder,
                            actions: prev.ruleBuilder.actions.map((a, i) =>
                              i === index ? { ...a, parameters: params } : a
                            )
                          }
                        }));
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({
                      ...prev,
                      ruleBuilder: {
                        ...prev.ruleBuilder,
                        actions: prev.ruleBuilder.actions.filter((_, i) => i !== index)
                      }
                    }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setState(prev => ({ ...prev, isCreatingRule: false }))}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleCreateRule({
              name: state.ruleBuilder.metadata.name,
              description: state.ruleBuilder.metadata.description,
              priority: state.ruleBuilder.metadata.priority,
              conditions: state.ruleBuilder.conditions,
              actions: state.ruleBuilder.actions
            })}
            disabled={!state.ruleBuilder.metadata.name || state.ruleBuilder.conditions.length === 0}
          >
            Create Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render main component
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading rule engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with real-time status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rule Engine</h2>
          <p className="text-muted-foreground">
            Manage and orchestrate classification rules with advanced workflow automation
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Real-time status indicators */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600">{state.realTimeStatus.activeExecutions} Active</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm text-yellow-600">{state.realTimeStatus.queuedRules} Queued</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-sm text-red-600">{state.realTimeStatus.failedRules} Failed</span>
            </div>
          </div>
          
          {!readonly && (
            <Button onClick={() => setState(prev => ({ ...prev, isCreatingRule: true }))}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          )}
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredRules.filter(r => r.status === 'ACTIVE').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(state.realTimeStatus.successRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ruleMetricsAggregated?.averageExecutionTime.toFixed(1) || '0'}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Across all rules
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts Detected</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conflictCount}</div>
            <p className="text-xs text-muted-foreground">
              {optimizationCount} optimizations available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules" className="space-y-4">
          {/* Search and filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search rules..."
                value={state.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={state.filterStatus} onValueChange={(value) => handleFilterChange('Status', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {RULE_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={state.filterPriority} onValueChange={(value) => handleFilterChange('Priority', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                {RULE_PRIORITIES.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={state.showInactiveRules}
                onCheckedChange={(checked) => setState(prev => ({ ...prev, showInactiveRules: checked }))}
              />
              <Label>Show Inactive</Label>
            </div>
          </div>

          {/* Rules table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Classification Rules</CardTitle>
                <div className="flex items-center space-x-2">
                  {state.selectedRuleIds.size > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Bulk Actions ({state.selectedRuleIds.size})
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleBulkOperation('ACTIVATE', Array.from(state.selectedRuleIds))}>
                          <Play className="h-4 w-4 mr-2" />
                          Activate Rules
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkOperation('DEACTIVATE', Array.from(state.selectedRuleIds))}>
                          <Pause className="h-4 w-4 mr-2" />
                          Deactivate Rules
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleBulkOperation('DELETE', Array.from(state.selectedRuleIds))}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Rules
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={state.selectedRuleIds.size === filteredRules.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setState(prev => ({ ...prev, selectedRuleIds: new Set(filteredRules.map(r => r.id)) }));
                          } else {
                            setState(prev => ({ ...prev, selectedRuleIds: new Set() }));
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Last Execution</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => {
                    const metrics = state.ruleMetrics.get(rule.id);
                    return (
                      <TableRow 
                        key={rule.id}
                        className={state.selectedRule?.id === rule.id ? 'bg-muted' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={state.selectedRuleIds.has(rule.id)}
                            onCheckedChange={(checked) => {
                              setState(prev => {
                                const newSelected = new Set(prev.selectedRuleIds);
                                if (checked) {
                                  newSelected.add(rule.id);
                                } else {
                                  newSelected.delete(rule.id);
                                }
                                return { ...prev, selectedRuleIds: newSelected };
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-48">
                            {rule.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            rule.status === 'ACTIVE' ? 'default' :
                            rule.status === 'TESTING' ? 'secondary' :
                            rule.status === 'INACTIVE' ? 'outline' : 'destructive'
                          }>
                            {rule.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            rule.priority === 'CRITICAL' ? 'destructive' :
                            rule.priority === 'HIGH' ? 'default' :
                            rule.priority === 'MEDIUM' ? 'secondary' : 'outline'
                          }>
                            {rule.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{rule.conditions?.length || 0}</TableCell>
                        <TableCell>{rule.actions?.length || 0}</TableCell>
                        <TableCell>
                          {metrics ? (
                            <div className="flex items-center space-x-2">
                              <span>{(metrics.successRate * 100).toFixed(1)}%</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{ width: `${metrics.successRate * 100}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {metrics ? (
                            <span className="text-sm">
                              {new Date(metrics.lastExecutionTime).toLocaleTimeString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRuleSelection(rule)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!readonly && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRuleEdit(rule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleTestRule(rule)}
                                  disabled={state.testingRule?.id === rule.id}
                                >
                                  {state.testingRule?.id === rule.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <TestTube className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredRules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No rules found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {state.selectedRule ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rule Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Rule Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground">{state.selectedRule.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{state.selectedRule.description || 'No description'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge variant={
                          state.selectedRule.status === 'ACTIVE' ? 'default' :
                          state.selectedRule.status === 'TESTING' ? 'secondary' :
                          state.selectedRule.status === 'INACTIVE' ? 'outline' : 'destructive'
                        }>
                          {state.selectedRule.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <div className="mt-1">
                        <Badge variant={
                          state.selectedRule.priority === 'CRITICAL' ? 'destructive' :
                          state.selectedRule.priority === 'HIGH' ? 'default' :
                          state.selectedRule.priority === 'MEDIUM' ? 'secondary' : 'outline'
                        }>
                          {state.selectedRule.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(state.selectedRule.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(state.selectedRule.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {state.selectedRule.tags && state.selectedRule.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {state.selectedRule.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Rule Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const metrics = state.ruleMetrics.get(state.selectedRule.id);
                    if (!metrics) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          No metrics available for this rule
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Executions</Label>
                            <p className="text-2xl font-bold">{metrics.executionCount}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Success Rate</Label>
                            <p className="text-2xl font-bold text-green-600">
                              {(metrics.successRate * 100).toFixed(1)}%
                            </p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Avg Time</Label>
                            <p className="text-2xl font-bold">{metrics.averageExecutionTime.toFixed(1)}ms</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Throughput</Label>
                            <p className="text-2xl font-bold">{metrics.throughput.toFixed(0)}/min</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Resource Usage</Label>
                          <div className="mt-2 space-y-2">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>Memory</span>
                                <span>{metrics.memoryUsage.toFixed(0)}MB</span>
                              </div>
                              <Progress value={metrics.memoryUsage / 512 * 100} className="h-2" />
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm">
                                <span>CPU</span>
                                <span>{metrics.cpuUsage.toFixed(1)}%</span>
                              </div>
                              <Progress value={metrics.cpuUsage} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
              
              {/* Rule Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  {state.selectedRule.conditions && state.selectedRule.conditions.length > 0 ? (
                    <div className="space-y-2">
                      {state.selectedRule.conditions.map((condition, index) => (
                        <div key={condition.id || index} className="p-3 border rounded-lg">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Field</Label>
                              <p className="font-mono">{condition.field}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Operator</Label>
                              <p className="font-mono">{condition.operator}</p>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Value</Label>
                              <p className="font-mono">{String(condition.value)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No conditions defined
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Rule Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  {state.selectedRule.actions && state.selectedRule.actions.length > 0 ? (
                    <div className="space-y-2">
                      {state.selectedRule.actions.map((action, index) => (
                        <div key={action.id || index} className="p-3 border rounded-lg">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{action.type}</Badge>
                              <span className="text-xs text-muted-foreground">Order: {action.order}</span>
                            </div>
                            {action.parameters && Object.keys(action.parameters).length > 0 && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Parameters</Label>
                                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                                  {JSON.stringify(action.parameters, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No actions defined
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rule Selected</h3>
                <p className="text-muted-foreground">
                  Select a rule from the rules tab to view its details
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rule Testing & Validation</CardTitle>
              <CardDescription>
                Test rules against sample data and validate their behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.executionHistory.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Recent Test Results</h4>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Results
                    </Button>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Execution Time</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Executed At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.executionHistory.slice(0, 10).map((result) => {
                        const rule = filteredRules.find(r => r.id === result.ruleId);
                        return (
                          <TableRow key={result.id}>
                            <TableCell>{rule?.name || 'Unknown Rule'}</TableCell>
                            <TableCell>
                              <Badge variant={result.status === 'SUCCESS' ? 'default' : 'destructive'}>
                                {result.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{result.executionTime.toFixed(2)}ms</TableCell>
                            <TableCell>
                              {result.result.matched ? (
                                <Badge variant="default">Matched</Badge>
                              ) : (
                                <Badge variant="outline">No Match</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(result.executedAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Test Results</h3>
                  <p className="text-muted-foreground mb-4">
                    Start testing rules to see results here
                  </p>
                  <Button onClick={() => setState(prev => ({ ...prev, activeTab: 'rules' }))}>
                    Go to Rules
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Execution Times (Last 20 runs)</Label>
                    <div className="h-32 flex items-end justify-between mt-2">
                      {state.performanceMonitor.executionTimes.map((time, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 w-2"
                          style={{ height: `${(time / 100) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Memory Usage (MB)</Label>
                    <div className="h-32 flex items-end justify-between mt-2">
                      {state.performanceMonitor.memoryUsage.map((usage, index) => (
                        <div
                          key={index}
                          className="bg-green-500 w-2"
                          style={{ height: `${(usage / 512) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Real-time Status */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {state.realTimeStatus.activeExecutions}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Executions</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {state.realTimeStatus.queuedRules}
                      </div>
                      <div className="text-sm text-muted-foreground">Queued Rules</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {state.realTimeStatus.failedRules}
                      </div>
                      <div className="text-sm text-muted-foreground">Failed Rules</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(state.realTimeStatus.successRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">System Health</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Rule Engine</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Database</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cache</span>
                        <Badge variant="default">Healthy</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rule Conflicts</CardTitle>
              <CardDescription>
                Detected conflicts between rules that may cause unexpected behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.conflictAnalysis.length > 0 ? (
                <div className="space-y-4">
                  {state.conflictAnalysis.map((conflict) => (
                    <div key={conflict.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              conflict.severity === 'HIGH' ? 'destructive' :
                              conflict.severity === 'MEDIUM' ? 'default' : 'secondary'
                            }>
                              {conflict.severity}
                            </Badge>
                            <span className="font-medium">{conflict.type}</span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {conflict.description}
                          </p>
                          
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-muted-foreground">Affected Rules:</span>
                            {conflict.ruleIds.map((ruleId) => {
                              const rule = filteredRules.find(r => r.id === ruleId);
                              return (
                                <Badge key={ruleId} variant="outline">
                                  {rule?.name || ruleId}
                                </Badge>
                              );
                            })}
                          </div>
                          
                          {conflict.resolution && (
                            <div className="text-sm">
                              <span className="font-medium">Resolution: </span>
                              <span className="text-muted-foreground">{conflict.resolution}</span>
                            </div>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm">
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Conflicts Detected</h3>
                  <p className="text-muted-foreground">
                    All rules are working harmoniously without conflicts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Suggestions</CardTitle>
              <CardDescription>
                AI-powered recommendations to improve rule performance and effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.optimizationSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {state.optimizationSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              suggestion.impact === 'HIGH' ? 'default' :
                              suggestion.impact === 'MEDIUM' ? 'secondary' : 'outline'
                            }>
                              {suggestion.impact} Impact
                            </Badge>
                            <Badge variant="outline">{suggestion.type}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {suggestion.suggestion}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Estimated Improvement: </span>
                              <span className="text-green-600">{suggestion.estimatedImprovement}</span>
                            </div>
                            <div>
                              <span className="font-medium">Implementation Effort: </span>
                              <span className={
                                suggestion.implementationEffort === 'LOW' ? 'text-green-600' :
                                suggestion.implementationEffort === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                              }>
                                {suggestion.implementationEffort}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Rule: {(() => {
                              const rule = filteredRules.find(r => r.id === suggestion.ruleId);
                              return rule?.name || suggestion.ruleId;
                            })()}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Info className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button size="sm">
                            <Zap className="h-4 w-4 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Optimizations Available</h3>
                  <p className="text-muted-foreground">
                    Your rules are already well-optimized
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Builder Dialog */}
      <RuleBuilderDialog />
    </div>
  );
};