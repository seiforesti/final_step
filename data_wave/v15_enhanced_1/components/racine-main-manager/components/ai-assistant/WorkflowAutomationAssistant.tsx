'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, Zap, Play, Pause, Square, RotateCcw, FastForward, Rewind, Settings, Brain, Bot, Cpu, Activity, CheckCircle, XCircle, AlertTriangle, Clock, Calendar, Timer, Users, Database, Shield, Search, Filter, Upload, Download, Save, Copy, Edit, Trash2, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, Target, Flag, BookOpen, FileText, Code, GitBranch, Layers, Route, MapPin, Compass, Navigation, Globe, Link, ExternalLink, Eye, EyeOff, Maximize, Minimize, RefreshCw, HelpCircle, Info, Star, Bookmark, Tag, Hash } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useJobWorkflow } from '../../hooks/useJobWorkflow';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Types
import { 
  WorkflowAutomationEngine,
  AutomatedWorkflow,
  WorkflowTemplate,
  AutomationRule,
  WorkflowExecution,
  WorkflowTrigger,
  WorkflowAction,
  WorkflowCondition,
  WorkflowSchedule,
  ExecutionStatus,
  AutomationMetrics,
  WorkflowOptimization,
  AIWorkflowSuggestion,
  WorkflowAnalytics,
  ExecutionHistory,
  WorkflowDependency,
  WorkflowVariable,
  WorkflowValidator,
  AutomationInsight
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utilities
import {
  createAutomatedWorkflow,
  executeWorkflow,
  optimizeWorkflowPerformance,
  analyzeWorkflowExecution,
  generateWorkflowSuggestions,
  validateWorkflowConfiguration,
  scheduleWorkflowExecution,
  monitorWorkflowHealth,
  extractWorkflowMetrics,
  predictWorkflowOutcome,
  cloneWorkflow,
  shareWorkflow
} from '../../utils/ai-assistant-utils';

// Constants
import {
  WORKFLOW_TYPES,
  AUTOMATION_TRIGGERS,
  WORKFLOW_ACTIONS,
  EXECUTION_STATUSES,
  OPTIMIZATION_STRATEGIES,
  WORKFLOW_PRIORITIES
} from '../../constants/ai-assistant-constants';

interface WorkflowAutomationAssistantProps {
  className?: string;
  enableAutoExecution?: boolean;
  maxConcurrentWorkflows?: number;
  onWorkflowCreated?: (workflow: AutomatedWorkflow) => void;
  onWorkflowExecuted?: (execution: WorkflowExecution) => void;
  onExecutionCompleted?: (result: any) => void;
}

interface WorkflowBuilderProps {
  workflow: AutomatedWorkflow | null;
  onWorkflowUpdate: (workflow: AutomatedWorkflow) => void;
  onWorkflowSave: () => void;
  templates: WorkflowTemplate[];
  isBuilding: boolean;
}

interface ExecutionMonitorProps {
  executions: WorkflowExecution[];
  selectedExecution: string | null;
  onExecutionSelect: (executionId: string) => void;
  onExecutionStop: (executionId: string) => void;
  onExecutionRetry: (executionId: string) => void;
  realTimeUpdates: boolean;
}

interface AutomationRulesProps {
  rules: AutomationRule[];
  onRuleCreate: (rule: AutomationRule) => void;
  onRuleUpdate: (ruleId: string, updates: Partial<AutomationRule>) => void;
  onRuleDelete: (ruleId: string) => void;
  onRuleTest: (ruleId: string) => void;
}

interface WorkflowAnalyticsProps {
  analytics: WorkflowAnalytics;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onAnalyticsRefresh: () => void;
}

export const WorkflowAutomationAssistant: React.FC<WorkflowAutomationAssistantProps> = ({
  className = "",
  enableAutoExecution = true,
  maxConcurrentWorkflows = 10,
  onWorkflowCreated,
  onWorkflowExecuted,
  onExecutionCompleted
}) => {
  // Hooks
  const {
    workflowAutomationEngine,
    automatedWorkflows,
    workflowTemplates,
    automationRules,
    workflowExecutions,
    workflowAnalytics,
    automationMetrics,
    createAutomationWorkflow,
    executeAutomationWorkflow,
    updateWorkflowConfiguration,
    deleteWorkflow,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    getWorkflowSuggestions,
    optimizeWorkflow,
    scheduleWorkflow,
    monitorWorkflowExecution,
    getWorkflowAnalytics,
    isCreatingWorkflow,
    isExecutingWorkflow,
    error
  } = useAIAssistant();

  const {
    createJobWorkflow,
    executeJobWorkflow,
    getWorkflowTemplates,
    monitorJobExecution
  } = useJobWorkflow();

  const {
    systemHealth,
    globalMetrics,
    performanceMetrics
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus,
    crossGroupMetrics,
    coordinateWorkflow
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    userPreferences
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceMetrics,
    workspaceConfiguration
  } = useWorkspaceManagement();

  const {
    trackActivity,
    recentActivities,
    activityPatterns
  } = useActivityTracker();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'builder' | 'monitor' | 'rules' | 'analytics'>('overview');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [builderWorkflow, setBuilderWorkflow] = useState<AutomatedWorkflow | null>(null);
  const [executionFilter, setExecutionFilter] = useState<ExecutionStatus | 'all'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [optimizationMode, setOptimizationMode] = useState<'performance' | 'cost' | 'reliability'>('performance');
  const [currentExecutions, setCurrentExecutions] = useState<WorkflowExecution[]>([]);
  const [workflowSuggestions, setWorkflowSuggestions] = useState<AIWorkflowSuggestion[]>([]);
  const [scheduledWorkflows, setScheduledWorkflows] = useState<AutomatedWorkflow[]>([]);

  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const executionMonitor = useRef<Map<string, WorkflowExecution>>(new Map());

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    recentActivities: (recentActivities || []).slice(0, 10),
    userPermissions,
    workspaceContext: {
      id: activeWorkspace?.id || '',
      configuration: workspaceConfiguration,
      metrics: workspaceMetrics
    },
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [
    currentUser,
    activeWorkspace,
    activeSPAContext,
    systemHealth,
    recentActivities,
    userPermissions,
    workspaceConfiguration,
    workspaceMetrics
  ]);

  const activeExecutions = useMemo(() => {
    return workflowExecutions.filter(exec => 
      exec.status === 'running' || exec.status === 'pending'
    );
  }, [workflowExecutions]);

  const filteredExecutions = useMemo(() => {
    if (executionFilter === 'all') return workflowExecutions;
    return workflowExecutions.filter(exec => exec.status === executionFilter);
  }, [workflowExecutions, executionFilter]);

  const automationInsights = useMemo(() => {
    const insights: AutomationInsight[] = [];
    
    // Performance insights
    const avgExecutionTime = automationMetrics?.averageExecutionTime || 0;
    if (avgExecutionTime > 300000) { // 5 minutes
      insights.push({
        type: 'performance',
        severity: 'warning',
        title: 'Long Execution Times',
        description: 'Some workflows are taking longer than expected to execute.',
        suggestion: 'Consider optimizing workflow steps or adding parallel execution.',
        impact: 'medium'
      });
    }

    // Cost insights
    const totalExecutions = automationMetrics?.totalExecutions || 0;
    if (totalExecutions > 1000) {
      insights.push({
        type: 'cost',
        severity: 'info',
        title: 'High Execution Volume',
        description: 'You have a high number of workflow executions.',
        suggestion: 'Consider batching similar operations or using scheduled workflows.',
        impact: 'low'
      });
    }

    // Reliability insights
    const errorRate = (automationMetrics?.failedExecutions || 0) / Math.max(totalExecutions, 1);
    if (errorRate > 0.1) { // 10% error rate
      insights.push({
        type: 'reliability',
        severity: 'error',
        title: 'High Error Rate',
        description: 'More than 10% of workflow executions are failing.',
        suggestion: 'Review workflow configurations and add error handling.',
        impact: 'high'
      });
    }

    return insights;
  }, [automationMetrics]);

  // Effects
  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        refreshExecutionStatus();
      }, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh]);

  useEffect(() => {
    // Generate workflow suggestions based on context
    generateWorkflowSuggestions();
  }, [currentContext]);

  useEffect(() => {
    // Monitor active executions
    activeExecutions.forEach(execution => {
      executionMonitor.current.set(execution.id, execution);
    });
  }, [activeExecutions]);

  // Handlers
  const refreshExecutionStatus = useCallback(async () => {
    try {
      // Refresh execution statuses from backend
      for (const execution of activeExecutions) {
        const updatedExecution = await monitorWorkflowExecution(execution.id);
        if (updatedExecution.status !== execution.status) {
          // Status changed, track activity
          trackActivity({
            type: 'workflow_execution_status_changed',
            details: {
              executionId: execution.id,
              workflowId: execution.workflowId,
              oldStatus: execution.status,
              newStatus: updatedExecution.status
            }
          });

          if (updatedExecution.status === 'completed' || updatedExecution.status === 'failed') {
            if (onExecutionCompleted) {
              onExecutionCompleted(updatedExecution);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh execution status:', error);
    }
  }, [activeExecutions, monitorWorkflowExecution, trackActivity, onExecutionCompleted]);

  const generateWorkflowSuggestions = useCallback(async () => {
    try {
      const suggestions = await getWorkflowSuggestions({
        context: currentContext,
        userBehavior: recentActivities,
        systemState: systemHealth,
        maxSuggestions: 5
      });

      setWorkflowSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate workflow suggestions:', error);
    }
  }, [getWorkflowSuggestions, currentContext, recentActivities, systemHealth]);

  const handleWorkflowCreate = useCallback(async (template?: WorkflowTemplate) => {
    try {
      const workflow = await createAutomationWorkflow({
        name: template?.name || 'New Workflow',
        description: template?.description || 'Automated workflow',
        template: template?.id,
        context: currentContext,
        triggers: template?.triggers || [],
        actions: template?.actions || [],
        conditions: template?.conditions || [],
        schedule: template?.schedule,
        variables: template?.variables || {}
      });

      setBuilderWorkflow(workflow);
      setIsBuilderMode(true);
      setActiveTab('builder');

      if (onWorkflowCreated) {
        onWorkflowCreated(workflow);
      }

      trackActivity({
        type: 'workflow_created',
        details: {
          workflowId: workflow.id,
          templateUsed: template?.id,
          context: currentContext.activeSPA
        }
      });
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  }, [createAutomationWorkflow, currentContext, onWorkflowCreated, trackActivity]);

  const handleWorkflowExecute = useCallback(async (workflowId: string, parameters?: Record<string, any>) => {
    try {
      if (activeExecutions.length >= maxConcurrentWorkflows) {
        throw new Error(`Maximum concurrent workflows (${maxConcurrentWorkflows}) reached`);
      }

      const execution = await executeAutomationWorkflow(workflowId, {
        parameters: parameters || {},
        context: currentContext,
        priority: 'normal',
        autoRetry: true,
        maxRetries: 3
      });

      if (onWorkflowExecuted) {
        onWorkflowExecuted(execution);
      }

      trackActivity({
        type: 'workflow_executed',
        details: {
          workflowId,
          executionId: execution.id,
          parameters,
          context: currentContext.activeSPA
        }
      });

      // Switch to monitor tab to show execution
      setActiveTab('monitor');
      setSelectedExecution(execution.id);

    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  }, [
    activeExecutions.length,
    maxConcurrentWorkflows,
    executeAutomationWorkflow,
    currentContext,
    onWorkflowExecuted,
    trackActivity
  ]);

  const handleWorkflowStop = useCallback(async (executionId: string) => {
    try {
      // Square workflow execution
      await monitorWorkflowExecution(executionId, { action: 'stop' });

      trackActivity({
        type: 'workflow_execution_stopped',
        details: { executionId }
      });
    } catch (error) {
      console.error('Failed to stop workflow execution:', error);
    }
  }, [monitorWorkflowExecution, trackActivity]);

  const handleWorkflowOptimize = useCallback(async (workflowId: string) => {
    try {
      const optimization = await optimizeWorkflow(workflowId, {
        strategy: optimizationMode,
        analysisDepth: 'comprehensive',
        considerHistory: true,
        suggestImprovements: true
      });

      trackActivity({
        type: 'workflow_optimized',
        details: {
          workflowId,
          strategy: optimizationMode,
          improvements: optimization.suggestions.length
        }
      });

      // Show optimization results
      // This would typically open a modal or navigate to optimization view
    } catch (error) {
      console.error('Failed to optimize workflow:', error);
    }
  }, [optimizeWorkflow, optimizationMode, trackActivity]);

  const handleRuleCreate = useCallback(async (rule: Omit<AutomationRule, 'id'>) => {
    try {
      const newRule = await createAutomationRule({
        ...rule,
        context: currentContext,
        createdBy: currentUser?.id || 'system',
        isActive: true
      });

      trackActivity({
        type: 'automation_rule_created',
        details: {
          ruleId: newRule.id,
          trigger: rule.trigger.type,
          actions: rule.actions.length
        }
      });
    } catch (error) {
      console.error('Failed to create automation rule:', error);
    }
  }, [createAutomationRule, currentContext, currentUser, trackActivity]);

  const handleScheduleWorkflow = useCallback(async (workflowId: string, schedule: WorkflowSchedule) => {
    try {
      await scheduleWorkflow(workflowId, {
        ...schedule,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        context: currentContext
      });

      trackActivity({
        type: 'workflow_scheduled',
        details: {
          workflowId,
          schedule: schedule.type,
          interval: schedule.interval
        }
      });
    } catch (error) {
      console.error('Failed to schedule workflow:', error);
    }
  }, [scheduleWorkflow, currentContext, trackActivity]);

  // Render Methods
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{automatedWorkflows.length}</div>
                <p className="text-xs text-muted-foreground">Active Workflows</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{activeExecutions.length}</div>
                <p className="text-xs text-muted-foreground">Running Now</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{automationMetrics?.totalExecutions || 0}</div>
                <p className="text-xs text-muted-foreground">Total Executions</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(((automationMetrics?.successfulExecutions || 0) / Math.max(automationMetrics?.totalExecutions || 1, 1)) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Insights */}
      {automationInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Automation Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {automationInsights.map((insight, index) => (
              <Alert key={index} variant={insight.severity === 'error' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{insight.title}</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{insight.description}</p>
                  <p className="text-sm font-medium">Suggestion: {insight.suggestion}</p>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={() => handleWorkflowCreate()}
              className="h-20 flex flex-col gap-2"
            >
              <Plus className="h-6 w-6" />
              Create Workflow
            </Button>

            <Button 
              variant="outline"
              onClick={() => setActiveTab('builder')}
              className="h-20 flex flex-col gap-2"
            >
              <Settings className="h-6 w-6" />
              Workflow Builder
            </Button>

            <Button 
              variant="outline"
              onClick={() => setActiveTab('monitor')}
              className="h-20 flex flex-col gap-2"
            >
              <Activity className="h-6 w-6" />
              Execution Monitor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {workflowSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Workflow Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflowSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  <Badge variant="outline" className="mt-1">
                    {suggestion.category}
                  </Badge>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleWorkflowCreate(suggestion.template)}
                >
                  Create
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderWorkflowBuilder = () => (
    <WorkflowBuilder
      workflow={builderWorkflow}
      onWorkflowUpdate={setBuilderWorkflow}
      onWorkflowSave={async () => {
        if (builderWorkflow) {
          await updateWorkflowConfiguration(builderWorkflow.id, builderWorkflow);
          setIsBuilderMode(false);
        }
      }}
      templates={workflowTemplates}
      isBuilding={isCreatingWorkflow}
    />
  );

  const renderExecutionMonitor = () => (
    <ExecutionMonitor
      executions={filteredExecutions}
      selectedExecution={selectedExecution}
      onExecutionSelect={setSelectedExecution}
      onExecutionStop={handleWorkflowStop}
      onExecutionRetry={(executionId) => {
        const execution = workflowExecutions.find(e => e.id === executionId);
        if (execution) {
          handleWorkflowExecute(execution.workflowId, execution.parameters);
        }
      }}
      realTimeUpdates={autoRefresh}
    />
  );

  const renderAutomationRules = () => (
    <AutomationRules
      rules={automationRules}
      onRuleCreate={handleRuleCreate}
      onRuleUpdate={async (ruleId, updates) => {
        await updateAutomationRule(ruleId, updates);
      }}
      onRuleDelete={async (ruleId) => {
        await deleteAutomationRule(ruleId);
      }}
      onRuleTest={async (ruleId) => {
        // Test automation rule
        trackActivity({
          type: 'automation_rule_tested',
          details: { ruleId }
        });
      }}
    />
  );

  const renderAnalytics = () => (
    <WorkflowAnalytics
      analytics={workflowAnalytics}
      timeRange="24h"
      onTimeRangeChange={() => {}}
      onAnalyticsRefresh={async () => {
        await getWorkflowAnalytics();
      }}
    />
  );

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Workflow Automation Assistant</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered workflow automation across all data governance operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label className="text-sm">Auto Refresh</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={enableAutoExecution}
                onCheckedChange={() => {}}
                disabled
              />
              <Label className="text-sm">Auto Execute</Label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>
        </div>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvancedOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Optimization Mode</Label>
                      <Select value={optimizationMode} onValueChange={(value: any) => setOptimizationMode(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="cost">Cost</SelectItem>
                          <SelectItem value="reliability">Reliability</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Max Concurrent Workflows</Label>
                      <Input
                        type="number"
                        value={maxConcurrentWorkflows}
                        onChange={(e) => {
                          // Would update max concurrent workflows
                        }}
                        min={1}
                        max={50}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Execution Filter</Label>
                      <Select value={executionFilter} onValueChange={(value: any) => setExecutionFilter(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="running">Running</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Monitor
              {activeExecutions.length > 0 && (
                <Badge variant="default" className="ml-1">
                  {activeExecutions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="builder" className="space-y-4">
            {renderWorkflowBuilder()}
          </TabsContent>

          <TabsContent value="monitor" className="space-y-4">
            {renderExecutionMonitor()}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            {renderAutomationRules()}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {renderAnalytics()}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Workflow Automation Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Workflow Builder Component
const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflow,
  onWorkflowUpdate,
  onWorkflowSave,
  templates,
  isBuilding
}) => {
  if (!workflow) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Workflow Selected</h3>
          <p className="text-muted-foreground text-sm">
            Create a new workflow or select an existing one to start building.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Workflow Builder</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={onWorkflowSave}
                disabled={isBuilding}
                size="sm"
              >
                {isBuilding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={workflow.name}
                  onChange={(e) => onWorkflowUpdate({ ...workflow, name: e.target.value })}
                  placeholder="Enter workflow name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={workflow.description}
                  onChange={(e) => onWorkflowUpdate({ ...workflow, description: e.target.value })}
                  placeholder="Enter workflow description"
                />
              </div>
            </div>

            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              Workflow builder interface coming soon...
              <p className="text-sm mt-2">This will include a visual drag-and-drop interface for building workflows.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Execution Monitor Component
const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  executions,
  selectedExecution,
  onExecutionSelect,
  onExecutionStop,
  onExecutionRetry,
  realTimeUpdates
}) => {
  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-green-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'stopped': return <Square className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case 'running': return 'border-green-500 bg-green-50';
      case 'completed': return 'border-green-500 bg-green-50';
      case 'failed': return 'border-red-500 bg-red-50';
      case 'pending': return 'border-yellow-500 bg-yellow-50';
      case 'stopped': return 'border-gray-500 bg-gray-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  if (executions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Executions Found</h3>
          <p className="text-muted-foreground text-sm">
            No workflow executions match the current filter criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {executions.map((execution) => (
        <Card 
          key={execution.id}
          className={`cursor-pointer transition-all duration-200 ${getStatusColor(execution.status)} ${
            selectedExecution === execution.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onExecutionSelect(execution.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(execution.status)}
                <div className="flex-1">
                  <h4 className="font-medium">{execution.workflowName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Started: {new Date(execution.startTime).toLocaleString()}
                  </p>
                  {execution.progress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{Math.round(execution.progress * 100)}%</span>
                      </div>
                      <Progress value={execution.progress * 100} className="h-2" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {execution.status}
                </Badge>
                
                {execution.status === 'running' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExecutionStop(execution.id);
                    }}
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                )}
                
                {(execution.status === 'failed' || execution.status === 'stopped') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExecutionRetry(execution.id);
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Automation Rules Component
const AutomationRules: React.FC<AutomationRulesProps> = ({
  rules,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  onRuleTest
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Automation Rules</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Automation Rules</h3>
              <p className="text-sm">
                Create rules to automatically trigger workflows based on conditions.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {rule.trigger.type}
                      </Badge>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'} className="text-xs">
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRuleTest(rule.id)}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Edit rule
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRuleDelete(rule.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Workflow Analytics Component
const WorkflowAnalytics: React.FC<WorkflowAnalyticsProps> = ({
  analytics,
  timeRange,
  onTimeRangeChange,
  onAnalyticsRefresh
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Workflow Analytics</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={onAnalyticsRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics?.totalExecutions || 0}</div>
              <p className="text-sm text-muted-foreground">Total Executions</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((analytics?.successfulExecutions || 0) / Math.max(analytics?.totalExecutions || 1, 1)) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((analytics?.averageExecutionTime || 0) / 1000)}s
              </div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowAutomationAssistant;
