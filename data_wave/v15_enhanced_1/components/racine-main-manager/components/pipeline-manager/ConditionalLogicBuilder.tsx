'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, GitBranch, Code2, Settings, Play, Pause, Square, RotateCcw, CheckCircle, XCircle, AlertCircle, Download, Upload, Save, Eye, EyeOff, Plus, Minus, Copy, Trash2, Edit3, Search, Filter, RefreshCw, Maximize, Minimize, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, MoreHorizontal, Info, HelpCircle, Target, Layers, Workflow, Database, Clock, BarChart3, TrendingUp, Activity, Cpu, HardDrive, Network, Shield, Lock, Unlock, Key, Users, User, Calendar, Hash, Type, ToggleLeft, ToggleRight } from 'lucide-react';

// shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuLabel, 
  ContextMenuSeparator, 
  ContextMenuTrigger 
} from '@/components/ui/context-menu';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Racine System Hooks
import { usePipelineManagement } from '../../hooks/usePipelineManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useUserManagement } from '../hooks/optimized/useOptimizedUserManagement';
import { useWorkspaceManagement } from '../hooks/optimized/useOptimizedWorkspaceManagement';
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Backend Integration Utilities
import {
  executeConditionalLogic,
  validateLogicRules,
  optimizeConditionalFlow,
  orchestrateConditionalExecution
} from '../../utils/conditional-logic-backend-integration';

// Types from racine-core.types
import {
  ConditionalLogic,
  LogicRule,
  LogicCondition,
  LogicOperator,
  ConditionalFlow,
  BranchingLogic,
  DecisionNode,
  LogicExpression,
  RuleSet,
  ConditionalExecution,
  LogicValidation,
  FlowControl,
  BranchConfiguration,
  ConditionalStep,
  LogicEvaluation,
  DecisionTree,
  ConditionalMetrics,
  LogicAnalytics,
  RuleEngine,
  ExpressionBuilder,
  ConditionGroup,
  LogicChain,
  BranchingStrategy,
  ConditionalOptimization
} from '../../types/racine-core.types';

// Component Interface
interface ConditionalLogicBuilderProps {
  pipelineId?: string;
  onLogicChange?: (logic: ConditionalLogic) => void;
  onValidationChange?: (isValid: boolean) => void;
  readonly?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

// Component State Interface
interface ConditionalLogicBuilderState {
  // Core Logic State
  currentLogic: ConditionalLogic | null;
  activeRule: LogicRule | null;
  selectedCondition: LogicCondition | null;
  
  // Builder State
  isBuilding: boolean;
  isValidating: boolean;
  isExecuting: boolean;
  isOptimizing: boolean;
  
  // UI State
  activeTab: string;
  selectedView: 'visual' | 'code' | 'flowchart' | 'tree';
  isPreviewMode: boolean;
  isFullscreen: boolean;
  showAdvanced: boolean;
  
  // Data State
  rules: LogicRule[];
  conditions: LogicCondition[];
  expressions: LogicExpression[];
  validationResults: LogicValidation[];
  executionMetrics: ConditionalMetrics[];
  
  // Filter and Search
  searchTerm: string;
  filterCriteria: any;
  sortOrder: 'asc' | 'desc';
  sortBy: string;
}

// Advanced Logic Operators
const LOGIC_OPERATORS: LogicOperator[] = [
  { id: 'and', name: 'AND', symbol: '&&', description: 'All conditions must be true' },
  { id: 'or', name: 'OR', symbol: '||', description: 'At least one condition must be true' },
  { id: 'not', name: 'NOT', symbol: '!', description: 'Negates the condition' },
  { id: 'xor', name: 'XOR', symbol: '^', description: 'Exactly one condition must be true' },
  { id: 'nand', name: 'NAND', symbol: '!&', description: 'Not all conditions are true' },
  { id: 'nor', name: 'NOR', symbol: '!|', description: 'None of the conditions are true' }
];

// Conditional Flow Templates
const FLOW_TEMPLATES = [
  {
    id: 'data-validation',
    name: 'Data Validation Flow',
    description: 'Validate data quality before processing',
    category: 'Data Quality',
    conditions: ['schema_valid', 'not_empty', 'data_type_correct'],
    actions: ['process_data', 'log_error', 'send_notification']
  },
  {
    id: 'compliance-check',
    name: 'Compliance Verification',
    description: 'Check regulatory compliance requirements',
    category: 'Governance',
    conditions: ['gdpr_compliant', 'data_encrypted', 'access_authorized'],
    actions: ['proceed_processing', 'apply_masking', 'audit_log']
  },
  {
    id: 'resource-allocation',
    name: 'Dynamic Resource Allocation',
    description: 'Allocate resources based on workload',
    category: 'Performance',
    conditions: ['cpu_usage_high', 'memory_available', 'queue_length'],
    actions: ['scale_up', 'optimize_query', 'defer_execution']
  }
];

// Main Component
export const ConditionalLogicBuilder: React.FC<ConditionalLogicBuilderProps> = ({
  pipelineId,
  onLogicChange,
  onValidationChange,
  readonly = false,
  theme = 'light',
  className = ''
}) => {
  // Racine System Hooks
  const {
    currentPipeline,
    conditionalLogics,
    executeConditionalPipeline,
    validatePipelineLogic,
    optimizePipelineFlow,
    getConditionalMetrics,
    updatePipelineLogic,
    createConditionalRule,
    deleteConditionalRule
  } = usePipelineManagement();

  const {
    orchestrateConditionalWorkflow,
    getOrchestrationRules,
    optimizeWorkflowExecution,
    monitorConditionalExecution
  } = useRacineOrchestration();

  const {
    integrateCrossGroupLogic,
    validateCrossGroupConditions,
    synchronizeConditionalStates,
    getCrossGroupConditionalMetrics
  } = useCrossGroupIntegration();

  const { currentUser, hasPermission } = useUserManagement();
  const { currentWorkspace, getWorkspaceResources } = useWorkspaceManagement();
  const { trackActivity, getActivityMetrics } = useActivityTracker();
  const { 
    getAIRecommendations, 
    optimizeWithAI, 
    validateWithAI,
    generateLogicSuggestions
  } = useAIAssistant();

  // Component State
  const [state, setState] = useState<ConditionalLogicBuilderState>({
    currentLogic: null,
    activeRule: null,
    selectedCondition: null,
    isBuilding: false,
    isValidating: false,
    isExecuting: false,
    isOptimizing: false,
    activeTab: 'builder',
    selectedView: 'visual',
    isPreviewMode: false,
    isFullscreen: false,
    showAdvanced: false,
    rules: [],
    conditions: [],
    expressions: [],
    validationResults: [],
    executionMetrics: [],
    searchTerm: '',
    filterCriteria: {},
    sortOrder: 'asc',
    sortBy: 'name'
  });

  // Computed Values
  const filteredRules = useMemo(() => {
    let filtered = state.rules;
    
    if (state.searchTerm) {
      filtered = filtered.filter(rule =>
        rule.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[state.sortBy as keyof LogicRule] || '';
      const bValue = b[state.sortBy as keyof LogicRule] || '';
      
      if (state.sortOrder === 'asc') {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [state.rules, state.searchTerm, state.sortBy, state.sortOrder]);

  const validationStatus = useMemo(() => {
    const results = state.validationResults;
    const totalRules = state.rules.length;
    const validRules = results.filter(r => r.isValid).length;
    const errorRules = results.filter(r => r.hasErrors).length;
    const warningRules = results.filter(r => r.hasWarnings).length;
    
    return {
      totalRules,
      validRules,
      errorRules,
      warningRules,
      validationRate: totalRules > 0 ? (validRules / totalRules) * 100 : 0
    };
  }, [state.validationResults, state.rules]);

  const executionMetrics = useMemo(() => {
    const metrics = state.executionMetrics;
    
    return {
      totalExecutions: metrics.length,
      successfulExecutions: metrics.filter(m => m.status === 'success').length,
      failedExecutions: metrics.filter(m => m.status === 'failed').length,
      averageExecutionTime: metrics.length > 0 
        ? metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length 
        : 0,
      successRate: metrics.length > 0 
        ? (metrics.filter(m => m.status === 'success').length / metrics.length) * 100 
        : 0
    };
  }, [state.executionMetrics]);

  // Data Fetching
  useEffect(() => {
    const fetchConditionalLogicData = async () => {
      try {
        if (pipelineId) {
          const [logic, rules, conditions, validations, metrics] = await Promise.all([
            getCurrentConditionalLogic(pipelineId),
            getConditionalRules(pipelineId),
            getLogicConditions(pipelineId),
            getValidationResults(pipelineId),
            getConditionalMetrics(pipelineId)
          ]);

          setState(prev => ({
            ...prev,
            currentLogic: logic,
            rules: rules || [],
            conditions: conditions || [],
            validationResults: validations || [],
            executionMetrics: metrics || []
          }));
        }
      } catch (error) {
        console.error('Error fetching conditional logic data:', error);
      }
    };

    fetchConditionalLogicData();
  }, [pipelineId]);

  // Backend Integration Functions
  const getCurrentConditionalLogic = async (pipelineId: string): Promise<ConditionalLogic | null> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/conditional-logic`);
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Error fetching conditional logic:', error);
      return null;
    }
  };

  const getConditionalRules = async (pipelineId: string): Promise<LogicRule[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/logic-rules`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching logic rules:', error);
      return [];
    }
  };

  const getLogicConditions = async (pipelineId: string): Promise<LogicCondition[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/logic-conditions`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching logic conditions:', error);
      return [];
    }
  };

  const getValidationResults = async (pipelineId: string): Promise<LogicValidation[]> => {
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/logic-validation`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching validation results:', error);
      return [];
    }
  };

  // Logic Building Functions
  const handleCreateRule = useCallback(async (ruleData: Partial<LogicRule>) => {
    try {
      setState(prev => ({ ...prev, isBuilding: true }));
      
      const newRule = await createConditionalRule({
        ...ruleData,
        pipelineId: pipelineId!,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString()
      });

      setState(prev => ({
        ...prev,
        rules: [...prev.rules, newRule],
        activeRule: newRule,
        isBuilding: false
      }));

      trackActivity({
        action: 'create_conditional_rule',
        resource: 'pipeline',
        details: { ruleId: newRule.id, pipelineId }
      });

      if (onLogicChange) {
        onLogicChange(state.currentLogic!);
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      setState(prev => ({ ...prev, isBuilding: false }));
    }
  }, [pipelineId, currentUser, createConditionalRule, trackActivity, onLogicChange, state.currentLogic]);

  const handleUpdateRule = useCallback(async (ruleId: string, updates: Partial<LogicRule>) => {
    try {
      setState(prev => ({ ...prev, isBuilding: true }));
      
      const updatedRule = await updateConditionalRule(ruleId, updates);

      setState(prev => ({
        ...prev,
        rules: prev.rules.map(rule => 
          rule.id === ruleId ? updatedRule : rule
        ),
        activeRule: updatedRule,
        isBuilding: false
      }));

      trackActivity({
        action: 'update_conditional_rule',
        resource: 'pipeline',
        details: { ruleId, pipelineId }
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      setState(prev => ({ ...prev, isBuilding: false }));
    }
  }, [updateConditionalRule, trackActivity, pipelineId]);

  const handleDeleteRule = useCallback(async (ruleId: string) => {
    try {
      await deleteConditionalRule(ruleId);

      setState(prev => ({
        ...prev,
        rules: prev.rules.filter(rule => rule.id !== ruleId),
        activeRule: prev.activeRule?.id === ruleId ? null : prev.activeRule
      }));

      trackActivity({
        action: 'delete_conditional_rule',
        resource: 'pipeline',
        details: { ruleId, pipelineId }
      });
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  }, [deleteConditionalRule, trackActivity, pipelineId]);

  const handleValidateLogic = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isValidating: true }));
      
      const validationResults = await validateLogicRules({
        pipelineId: pipelineId!,
        rules: state.rules,
        conditions: state.conditions
      });

      setState(prev => ({
        ...prev,
        validationResults,
        isValidating: false
      }));

      if (onValidationChange) {
        onValidationChange(validationResults.every(r => r.isValid));
      }

      trackActivity({
        action: 'validate_conditional_logic',
        resource: 'pipeline',
        details: { pipelineId, validationCount: validationResults.length }
      });
    } catch (error) {
      console.error('Error validating logic:', error);
      setState(prev => ({ ...prev, isValidating: false }));
    }
  }, [pipelineId, state.rules, state.conditions, validateLogicRules, onValidationChange, trackActivity]);

  const handleExecuteLogic = useCallback(async (testData?: any) => {
    try {
      setState(prev => ({ ...prev, isExecuting: true }));
      
      const executionResult = await executeConditionalLogic({
        logic: state.currentLogic!,
        testData,
        pipelineId: pipelineId!
      });

      const newMetric: ConditionalMetrics = {
        id: `exec_${Date.now()}`,
        pipelineId: pipelineId!,
        executionTime: executionResult.executionTime,
        status: executionResult.success ? 'success' : 'failed',
        rulesEvaluated: executionResult.rulesEvaluated,
        conditionsChecked: executionResult.conditionsChecked,
        timestamp: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        executionMetrics: [...prev.executionMetrics, newMetric],
        isExecuting: false
      }));

      trackActivity({
        action: 'execute_conditional_logic',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          success: executionResult.success,
          executionTime: executionResult.executionTime
        }
      });
    } catch (error) {
      console.error('Error executing logic:', error);
      setState(prev => ({ ...prev, isExecuting: false }));
    }
  }, [state.currentLogic, pipelineId, executeConditionalLogic, trackActivity]);

  const handleOptimizeLogic = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isOptimizing: true }));
      
      const optimization = await optimizeConditionalFlow({
        logic: state.currentLogic!,
        metrics: state.executionMetrics,
        pipelineId: pipelineId!
      });

      setState(prev => ({
        ...prev,
        currentLogic: optimization.optimizedLogic,
        rules: optimization.optimizedRules,
        isOptimizing: false
      }));

      trackActivity({
        action: 'optimize_conditional_logic',
        resource: 'pipeline',
        details: { 
          pipelineId, 
          improvementPercentage: optimization.improvementPercentage
        }
      });
    } catch (error) {
      console.error('Error optimizing logic:', error);
      setState(prev => ({ ...prev, isOptimizing: false }));
    }
  }, [state.currentLogic, state.executionMetrics, pipelineId, optimizeConditionalFlow, trackActivity]);

  // Helper Functions
  const updateConditionalRule = async (ruleId: string, updates: Partial<LogicRule>): Promise<LogicRule> => {
    const response = await fetch(`/api/conditional-rules/${ruleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update rule');
    }
    
    return response.json();
  };

  // Render Functions
  const renderRuleBuilder = () => (
    <div className="space-y-6">
      {/* Rule Builder Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Logic Rule Builder</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage conditional logic rules for your pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleCreateRule({})}
            disabled={readonly || state.isBuilding}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
          <Button 
            variant="outline" 
            onClick={handleValidateLogic}
            disabled={state.isValidating || state.rules.length === 0}
            size="sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Validate All
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Active Rules</div>
              <div className="text-2xl font-bold">{state.rules.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Validation Rate</div>
              <div className="text-2xl font-bold">{validationStatus.validationRate.toFixed(1)}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium">Success Rate</div>
              <div className="text-2xl font-bold">{executionMetrics.successRate.toFixed(1)}%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Conditional Rules</h4>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search rules..."
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-64"
            />
            <Select 
              value={state.sortBy} 
              onValueChange={(value) => setState(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="createdAt">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredRules.map((rule) => (
            <Card key={rule.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Code2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">{rule.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.isActive ? "default" : "secondary"}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{rule.type}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, activeRule: rule }))}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Rule
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExecuteLogic({ ruleId: rule.id })}>
                        <Play className="h-4 w-4 mr-2" />
                        Test Rule
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Rule Details */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <span>Conditions: {rule.conditions?.length || 0}</span>
                  <span>Actions: {rule.actions?.length || 0}</span>
                  <span>Priority: {rule.priority}</span>
                </div>
                
                {rule.conditions && rule.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rule.conditions.slice(0, 3).map((condition, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {condition.field} {condition.operator} {condition.value}
                      </Badge>
                    ))}
                    {rule.conditions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{rule.conditions.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogicFlow = () => (
    <div className="space-y-6">
      {/* Flow Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Logic Flow Visualization</h3>
          <p className="text-sm text-muted-foreground">
            Visual representation of conditional logic flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={state.selectedView} 
            onValueChange={(value: any) => setState(prev => ({ ...prev, selectedView: value }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">Visual Flow</SelectItem>
              <SelectItem value="code">Code View</SelectItem>
              <SelectItem value="flowchart">Flowchart</SelectItem>
              <SelectItem value="tree">Decision Tree</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
          >
            {state.isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Flow Visualization */}
      <Card className="p-6 min-h-[400px]">
        {state.selectedView === 'visual' && (
          <div className="space-y-4">
            {/* Flow Canvas */}
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <div className="text-muted-foreground">
                <Workflow className="h-12 w-12 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">Visual Flow Builder</h4>
                <p>Drag and drop logic components to build your conditional flow</p>
              </div>
            </div>
            
            {/* Flow Components Palette */}
            <div className="border rounded-lg p-4">
              <h5 className="font-medium mb-3">Logic Components</h5>
              <div className="grid grid-cols-4 gap-2">
                {LOGIC_OPERATORS.map((operator) => (
                  <div 
                    key={operator.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  >
                    <div className="text-center">
                      <div className="font-mono text-sm font-bold">{operator.symbol}</div>
                      <div className="text-xs text-muted-foreground">{operator.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.selectedView === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Generated Logic Code</h5>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
              <pre className="whitespace-pre-wrap">
{`// Generated Conditional Logic
const conditionalLogic = {
  rules: [
    {
      name: "Data Quality Check",
      conditions: [
        { field: "data.quality", operator: ">=", value: 0.8 },
        { field: "data.completeness", operator: ">", value: 0.9 }
      ],
      operator: "AND",
      actions: [
        { type: "proceed", target: "next_stage" },
        { type: "log", message: "Data quality passed" }
      ]
    },
    {
      name: "Error Handling",
      conditions: [
        { field: "errors.count", operator: ">", value: 0 }
      ],
      actions: [
        { type: "retry", maxAttempts: 3 },
        { type: "notify", recipients: ["admin@company.com"] }
      ]
    }
  ],
  defaultAction: { type: "fail", reason: "No matching conditions" }
};`}
              </pre>
            </div>
          </div>
        )}

        {state.selectedView === 'flowchart' && (
          <div className="space-y-4">
            <h5 className="font-medium">Decision Flowchart</h5>
            <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Interactive flowchart visualization will be rendered here</p>
                <p className="text-sm">Using D3.js for dynamic flow representation</p>
              </div>
            </div>
          </div>
        )}

        {state.selectedView === 'tree' && (
          <div className="space-y-4">
            <h5 className="font-medium">Decision Tree</h5>
            <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-4" />
                <p>Hierarchical decision tree visualization</p>
                <p className="text-sm">Interactive tree structure with branch conditions</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      {/* Templates Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Logic Templates</h3>
          <p className="text-sm text-muted-foreground">
            Pre-built conditional logic templates for common scenarios
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Template Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FLOW_TEMPLATES.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{template.category}</Badge>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">CONDITIONS</div>
                <div className="flex flex-wrap gap-1">
                  {template.conditions.slice(0, 2).map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                  {template.conditions.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.conditions.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">ACTIONS</div>
                <div className="flex flex-wrap gap-1">
                  {template.actions.slice(0, 2).map((action, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {action}
                    </Badge>
                  ))}
                  {template.actions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.actions.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Logic Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Performance metrics and insights for conditional logic execution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Total Executions</div>
            <div className="text-2xl font-bold">{executionMetrics.totalExecutions}</div>
            <div className="text-xs text-green-600">+12% from last week</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Success Rate</div>
            <div className="text-2xl font-bold">{executionMetrics.successRate.toFixed(1)}%</div>
            <div className="text-xs text-green-600">+5.2% improvement</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Avg Execution Time</div>
            <div className="text-2xl font-bold">{executionMetrics.averageExecutionTime.toFixed(0)}ms</div>
            <div className="text-xs text-red-600">+8ms from baseline</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Failed Executions</div>
            <div className="text-2xl font-bold">{executionMetrics.failedExecutions}</div>
            <div className="text-xs text-green-600">-3 from yesterday</div>
          </div>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-medium mb-4">Execution Timeline</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>Timeline chart will be rendered here</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="font-medium mb-4">Rule Performance</h4>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p>Performance comparison chart</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Rule Performance Details</h4>
        <div className="space-y-4">
          {state.rules.slice(0, 5).map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-sm text-muted-foreground">{rule.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-medium">96%</div>
                  <div className="text-muted-foreground">Success</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">245ms</div>
                  <div className="text-muted-foreground">Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">1,247</div>
                  <div className="text-muted-foreground">Executions</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`conditional-logic-builder ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Conditional Logic Builder</h2>
            <p className="text-muted-foreground">
              Design and manage intelligent branching logic for your data governance pipelines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleOptimizeLogic}
              disabled={state.isOptimizing || !state.currentLogic}
            >
              {state.isOptimizing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Optimize
            </Button>
            <Button 
              onClick={handleExecuteLogic}
              disabled={state.isExecuting || state.rules.length === 0}
            >
              {state.isExecuting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute Test
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Rule Builder</TabsTrigger>
            <TabsTrigger value="flow">Logic Flow</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="builder" className="space-y-6">
              {renderRuleBuilder()}
            </TabsContent>

            <TabsContent value="flow" className="space-y-6">
              {renderLogicFlow()}
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              {renderTemplates()}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {renderAnalytics()}
            </TabsContent>
          </div>
        </Tabs>

        {/* Loading States */}
        {(state.isBuilding || state.isValidating || state.isExecuting || state.isOptimizing) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <div>
                  <div className="font-medium">
                    {state.isBuilding && "Building logic rules..."}
                    {state.isValidating && "Validating conditional logic..."}
                    {state.isExecuting && "Executing logic test..."}
                    {state.isOptimizing && "Optimizing logic flow..."}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Please wait while we process your request
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ConditionalLogicBuilder;