'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Workflow, 
  Bot, 
  Zap, 
  Play, 
  Pause, 
  Stop, 
  SkipForward, 
  Rewind,
  Settings, 
  RefreshCw, 
  Clock, 
  Calendar, 
  Timer,
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Eye, 
  EyeOff, 
  Edit, 
  Copy, 
  Trash2,
  Plus, 
  Minus, 
  X, 
  Check,
  Search, 
  Filter, 
  Download, 
  Upload, 
  Save, 
  FolderOpen,
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  GitBranch,
  Layers,
  Activity,
  BarChart3,
  TrendingUp,
  Database,
  Users,
  Shield,
  Code,
  FileText,
  Link,
  Unlink,
  Route,
  Map,
  Compass,
  Navigation,
  Flag,
  Bookmark,
  Star,
  Heart,
  MessageSquare,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';

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

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Types
import { 
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  WorkflowTrigger,
  WorkflowCondition,
  WorkflowAction,
  AutomationRule,
  ScheduledWorkflow,
  WorkflowTemplate,
  ExecutionHistory,
  WorkflowMetrics,
  AutomationEngine,
  TriggerEvent,
  ActionResult,
  WorkflowStatus,
  ExecutionContext,
  WorkflowVariable,
  ConditionalLogic,
  ErrorHandling,
  RetryPolicy,
  NotificationSettings,
  ApprovalWorkflow
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utilities
import {
  createWorkflow,
  executeWorkflow,
  validateWorkflow,
  optimizeWorkflow,
  scheduleWorkflow,
  monitorExecution,
  handleWorkflowError,
  calculateMetrics,
  exportWorkflow,
  importWorkflow
} from '../../utils/ai-assistant-utils';

// Constants
import {
  WORKFLOW_TRIGGERS,
  WORKFLOW_ACTIONS,
  WORKFLOW_CONDITIONS,
  EXECUTION_STATES,
  AUTOMATION_TEMPLATES,
  SCHEDULE_PATTERNS
} from '../../constants/ai-assistant-constants';

interface WorkflowAutomationEngineProps {
  className?: string;
  enableAutoExecution?: boolean;
  maxConcurrentWorkflows?: number;
  onWorkflowCreated?: (workflow: WorkflowDefinition) => void;
  onWorkflowExecuted?: (execution: WorkflowExecution) => void;
  onExecutionCompleted?: (execution: WorkflowExecution) => void;
}

interface WorkflowBuilderProps {
  workflow: WorkflowDefinition | null;
  onWorkflowUpdate: (workflow: WorkflowDefinition) => void;
  onWorkflowSave: (workflow: WorkflowDefinition) => void;
  templates: WorkflowTemplate[];
}

interface ExecutionMonitorProps {
  executions: WorkflowExecution[];
  selectedExecution: string | null;
  onExecutionSelect: (executionId: string) => void;
  onExecutionControl: (executionId: string, action: 'pause' | 'resume' | 'stop' | 'retry') => void;
}

interface AutomationRulesProps {
  rules: AutomationRule[];
  onRuleCreate: (rule: AutomationRule) => void;
  onRuleUpdate: (ruleId: string, updates: Partial<AutomationRule>) => void;
  onRuleToggle: (ruleId: string, enabled: boolean) => void;
  onRuleDelete: (ruleId: string) => void;
}

interface ScheduledWorkflowsProps {
  scheduledWorkflows: ScheduledWorkflow[];
  onScheduleCreate: (schedule: ScheduledWorkflow) => void;
  onScheduleUpdate: (scheduleId: string, updates: Partial<ScheduledWorkflow>) => void;
  onScheduleDelete: (scheduleId: string) => void;
}

interface WorkflowMetricsProps {
  metrics: WorkflowMetrics;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onMetricsRefresh: () => void;
}

export const WorkflowAutomationEngine: React.FC<WorkflowAutomationEngineProps> = ({
  className = "",
  enableAutoExecution = true,
  maxConcurrentWorkflows = 10,
  onWorkflowCreated,
  onWorkflowExecuted,
  onExecutionCompleted
}) => {
  // Hooks
  const {
    automationEngine,
    workflows,
    executions,
    automationRules,
    scheduledWorkflows,
    workflowTemplates,
    workflowMetrics,
    createAutomationWorkflow,
    executeAutomationWorkflow,
    scheduleAutomationWorkflow,
    updateAutomationRule,
    monitorWorkflowExecution,
    isExecuting,
    error
  } = useAIAssistant();

  const {
    systemHealth,
    globalMetrics
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus,
    triggerCrossGroupAction
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions
  } = useUserManagement();

  const {
    activeWorkspace
  } = useWorkspaceManagement();

  const {
    trackActivity
  } = useActivityTracker();

  // State
  const [activeTab, setActiveTab] = useState<'builder' | 'executions' | 'rules' | 'scheduled' | 'metrics'>('builder');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [autoExecutionEnabled, setAutoExecutionEnabled] = useState(enableAutoExecution);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [filterStatus, setFilterStatus] = useState<WorkflowStatus | 'all'>('all');
  const [filterTemplate, setFilterTemplate] = useState<string | 'all'>('all');
  const [executionTimeRange, setExecutionTimeRange] = useState('24h');
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowExecution[]>([]);
  const [concurrentExecutions, setConcurrentExecutions] = useState(0);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Refs
  const executionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [currentUser, activeWorkspace, activeSPAContext, systemHealth]);

  const filteredWorkflows = useMemo(() => {
    let filtered = workflows;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === filterStatus);
    }

    if (filterTemplate !== 'all') {
      filtered = filtered.filter(workflow => workflow.templateId === filterTemplate);
    }

    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [workflows, filterStatus, filterTemplate]);

  const activeExecutions = useMemo(() => {
    return executions.filter(execution => 
      execution.status === 'running' || execution.status === 'paused'
    );
  }, [executions]);

  const recentExecutions = useMemo(() => {
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const cutoff = new Date(Date.now() - timeRangeMs[executionTimeRange as keyof typeof timeRangeMs]);
    return executions.filter(execution => 
      new Date(execution.startTime) > cutoff
    ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [executions, executionTimeRange]);

  const enabledRules = useMemo(() => {
    return automationRules.filter(rule => rule.enabled);
  }, [automationRules]);

  const upcomingScheduled = useMemo(() => {
    const next24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return scheduledWorkflows.filter(schedule => 
      schedule.enabled && 
      schedule.nextExecution && 
      new Date(schedule.nextExecution) <= next24Hours
    ).sort((a, b) => 
      new Date(a.nextExecution!).getTime() - new Date(b.nextExecution!).getTime()
    );
  }, [scheduledWorkflows]);

  // Effects
  useEffect(() => {
    setConcurrentExecutions(activeExecutions.length);
  }, [activeExecutions.length]);

  useEffect(() => {
    if (autoExecutionEnabled) {
      executionIntervalRef.current = setInterval(() => {
        monitorActiveExecutions();
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (executionIntervalRef.current) {
        clearInterval(executionIntervalRef.current);
      }
    };
  }, [autoExecutionEnabled]);

  useEffect(() => {
    // Update workflow history
    executions.forEach(execution => {
      if (!workflowHistory.find(h => h.id === execution.id)) {
        setWorkflowHistory(prev => [execution, ...prev.slice(0, 99)]);
        
        if (execution.status === 'completed' && onExecutionCompleted) {
          onExecutionCompleted(execution);
        }
      }
    });
  }, [executions, onExecutionCompleted]);

  useEffect(() => {
    // Track workflow creation
    workflows.forEach(workflow => {
      if (onWorkflowCreated) {
        onWorkflowCreated(workflow);
      }
    });
  }, [workflows, onWorkflowCreated]);

  // Handlers
  const monitorActiveExecutions = useCallback(async () => {
    try {
      await Promise.all(
        activeExecutions.map(execution => 
          monitorWorkflowExecution(execution.id)
        )
      );
    } catch (error) {
      console.error('Failed to monitor active executions:', error);
    }
  }, [activeExecutions, monitorWorkflowExecution]);

  const handleWorkflowCreate = useCallback(async (template?: WorkflowTemplate) => {
    try {
      setIsCreatingWorkflow(true);
      
      const baseWorkflow: Partial<WorkflowDefinition> = template ? {
        name: `${template.name} - Copy`,
        description: template.description,
        steps: template.steps,
        triggers: template.triggers,
        variables: template.variables || {},
        settings: template.settings || {}
      } : {
        name: 'New Workflow',
        description: 'Created with Workflow Automation Engine',
        steps: [],
        triggers: [],
        variables: {},
        settings: {}
      };

      const workflow = await createAutomationWorkflow({
        ...baseWorkflow,
        context: currentContext
      } as WorkflowDefinition);

      setSelectedWorkflow(workflow);
      setActiveTab('builder');
      
      trackActivity({
        type: 'workflow_created',
        details: {
          workflowId: workflow.id,
          templateId: template?.id,
          stepCount: workflow.steps.length
        }
      });
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setIsCreatingWorkflow(false);
    }
  }, [createAutomationWorkflow, currentContext, trackActivity]);

  const handleWorkflowExecute = useCallback(async (workflowId: string) => {
    try {
      if (concurrentExecutions >= maxConcurrentWorkflows) {
        throw new Error(`Maximum concurrent workflows (${maxConcurrentWorkflows}) reached`);
      }

      const execution = await executeAutomationWorkflow(workflowId, {
        context: currentContext,
        variables: {},
        notifications: true
      });

      if (onWorkflowExecuted) {
        onWorkflowExecuted(execution);
      }

      trackActivity({
        type: 'workflow_executed',
        details: {
          workflowId,
          executionId: execution.id
        }
      });
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  }, [
    executeAutomationWorkflow,
    currentContext,
    concurrentExecutions,
    maxConcurrentWorkflows,
    onWorkflowExecuted,
    trackActivity
  ]);

  const handleExecutionControl = useCallback(async (executionId: string, action: 'pause' | 'resume' | 'stop' | 'retry') => {
    try {
      // This would call the appropriate execution control methods
      switch (action) {
        case 'pause':
          // Pause execution
          break;
        case 'resume':
          // Resume execution
          break;
        case 'stop':
          // Stop execution
          break;
        case 'retry':
          // Retry failed execution
          break;
      }

      trackActivity({
        type: 'execution_controlled',
        details: {
          executionId,
          action
        }
      });
    } catch (error) {
      console.error(`Failed to ${action} execution:`, error);
    }
  }, [trackActivity]);

  const handleRuleCreate = useCallback(async (rule: AutomationRule) => {
    try {
      await updateAutomationRule(rule.id, rule);
      
      trackActivity({
        type: 'automation_rule_created',
        details: {
          ruleId: rule.id,
          triggerType: rule.trigger.type
        }
      });
    } catch (error) {
      console.error('Failed to create automation rule:', error);
    }
  }, [updateAutomationRule, trackActivity]);

  const handleScheduleCreate = useCallback(async (schedule: ScheduledWorkflow) => {
    try {
      await scheduleAutomationWorkflow(schedule.workflowId, {
        schedule: schedule.schedule,
        enabled: schedule.enabled,
        variables: schedule.variables || {}
      });

      trackActivity({
        type: 'workflow_scheduled',
        details: {
          workflowId: schedule.workflowId,
          schedulePattern: schedule.schedule.pattern
        }
      });
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  }, [scheduleAutomationWorkflow, trackActivity]);

  const handleWorkflowExport = useCallback((workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const exportData = {
      workflow,
      metadata: {
        exportedAt: new Date(),
        exportedBy: currentUser?.id,
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${workflow.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [workflows, currentUser]);

  const handleWorkflowImport = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.workflow) {
        throw new Error('Invalid workflow file format');
      }

      const workflow = await importWorkflow(importData.workflow);
      setSelectedWorkflow(workflow);
      setActiveTab('builder');

      trackActivity({
        type: 'workflow_imported',
        details: {
          workflowId: workflow.id,
          fileName: file.name
        }
      });
    } catch (error) {
      console.error('Failed to import workflow:', error);
    }
  }, [trackActivity]);

  // Render Methods
  const renderWorkflowOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{filteredWorkflows.length}</div>
              <p className="text-xs text-muted-foreground">Total Workflows</p>
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
              <p className="text-xs text-muted-foreground">Active Executions</p>
            </div>
            <Play className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{enabledRules.length}</div>
              <p className="text-xs text-muted-foreground">Active Rules</p>
            </div>
            <Bot className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">{upcomingScheduled.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled (24h)</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderWorkflowBuilder = () => (
    <WorkflowBuilder
      workflow={selectedWorkflow}
      onWorkflowUpdate={setSelectedWorkflow}
      onWorkflowSave={(workflow) => {
        // Save workflow logic
      }}
      templates={workflowTemplates}
    />
  );

  const renderExecutionMonitor = () => (
    <ExecutionMonitor
      executions={recentExecutions}
      selectedExecution={selectedExecution}
      onExecutionSelect={setSelectedExecution}
      onExecutionControl={handleExecutionControl}
    />
  );

  const renderAutomationRules = () => (
    <AutomationRules
      rules={automationRules}
      onRuleCreate={handleRuleCreate}
      onRuleUpdate={(ruleId, updates) => {
        updateAutomationRule(ruleId, updates);
      }}
      onRuleToggle={(ruleId, enabled) => {
        updateAutomationRule(ruleId, { enabled });
      }}
      onRuleDelete={(ruleId) => {
        // Delete rule logic
      }}
    />
  );

  const renderScheduledWorkflows = () => (
    <ScheduledWorkflows
      scheduledWorkflows={scheduledWorkflows}
      onScheduleCreate={handleScheduleCreate}
      onScheduleUpdate={(scheduleId, updates) => {
        // Update schedule logic
      }}
      onScheduleDelete={(scheduleId) => {
        // Delete schedule logic
      }}
    />
  );

  const renderMetrics = () => (
    <WorkflowMetrics
      metrics={workflowMetrics}
      timeRange={executionTimeRange}
      onTimeRangeChange={setExecutionTimeRange}
      onMetricsRefresh={() => {
        // Refresh metrics logic
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
              <h2 className="text-xl font-semibold">Workflow Automation Engine</h2>
              <p className="text-sm text-muted-foreground">
                Intelligent workflow automation and orchestration across all SPAs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoExecutionEnabled}
                onCheckedChange={setAutoExecutionEnabled}
              />
              <Label className="text-sm">Auto Execution</Label>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>

            <Button
              onClick={() => handleWorkflowCreate()}
              disabled={isCreatingWorkflow}
              size="sm"
            >
              {isCreatingWorkflow ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  New Workflow
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {renderWorkflowOverview()}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Status:</Label>
                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="stopped">Stopped</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Template:</Label>
                  <Select value={filterTemplate} onValueChange={setFilterTemplate}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Templates</SelectItem>
                      {workflowTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Time Range:</Label>
                  <Select value={executionTimeRange} onValueChange={setExecutionTimeRange}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                      <SelectItem value="30d">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {concurrentExecutions}/{maxConcurrentWorkflows} Concurrent
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="executions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Executions
              {activeExecutions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeExecutions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Rules
              {enabledRules.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {enabledRules.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Scheduled
              {upcomingScheduled.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {upcomingScheduled.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-4">
            {renderWorkflowBuilder()}
          </TabsContent>

          <TabsContent value="executions" className="space-y-4">
            {renderExecutionMonitor()}
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            {renderAutomationRules()}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {renderScheduledWorkflows()}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {renderMetrics()}
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
  templates
}) => {
  if (!workflow) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Code className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Workflow Selected</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create a new workflow or select an existing one to start building.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              Browse Workflows
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{workflow.name}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{workflow.status}</Badge>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Execute
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Workflow Name</Label>
                <Input
                  value={workflow.name}
                  onChange={(e) => onWorkflowUpdate({ ...workflow, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Status</Label>
                <Select
                  value={workflow.status}
                  onValueChange={(value: WorkflowStatus) => 
                    onWorkflowUpdate({ ...workflow, status: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                value={workflow.description}
                onChange={(e) => onWorkflowUpdate({ ...workflow, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Workflow Steps</h4>
              <div className="space-y-2">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium">{step.name}</h5>
                      <p className="text-sm text-muted-foreground">{step.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button variant="dashed" className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
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
  onExecutionControl
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'stopped': return <Stop className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'stopped': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {executions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No Executions Found</h3>
            <p className="text-muted-foreground text-sm">
              Execute a workflow to see execution history and monitoring.
            </p>
          </CardContent>
        </Card>
      ) : (
        executions.map((execution) => (
          <Card 
            key={execution.id}
            className={`cursor-pointer transition-colors ${
              selectedExecution === execution.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onExecutionSelect(execution.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(execution.status)}
                  <div>
                    <CardTitle className="text-base">{execution.workflowName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(execution.startTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                  {execution.progress !== undefined && (
                    <Badge variant="outline">
                      {Math.round(execution.progress * 100)}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {execution.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>{Math.round(execution.progress * 100)}%</span>
                    </div>
                    <Progress value={execution.progress * 100} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Duration:</Label>
                    <div>
                      {execution.endTime 
                        ? `${Math.round((new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000)}s`
                        : 'Running...'
                      }
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Steps:</Label>
                    <div>{execution.completedSteps}/{execution.totalSteps}</div>
                  </div>
                </div>

                {execution.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {execution.error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    ID: {execution.id.substring(0, 8)}...
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {execution.status === 'running' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExecutionControl(execution.id, 'pause');
                          }}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExecutionControl(execution.id, 'stop');
                          }}
                        >
                          <Stop className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    
                    {execution.status === 'paused' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExecutionControl(execution.id, 'resume');
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {execution.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onExecutionControl(execution.id, 'retry');
                        }}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// Automation Rules Component
const AutomationRules: React.FC<AutomationRulesProps> = ({
  rules,
  onRuleCreate,
  onRuleUpdate,
  onRuleToggle,
  onRuleDelete
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
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) => onRuleToggle(rule.id, enabled)}
                />
                
                <div className="flex-1">
                  <h4 className="font-medium">{rule.name}</h4>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {rule.trigger.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rule.actions.length} actions
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3" />
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
        </CardContent>
      </Card>
    </div>
  );
};

// Scheduled Workflows Component
const ScheduledWorkflows: React.FC<ScheduledWorkflowsProps> = ({
  scheduledWorkflows,
  onScheduleCreate,
  onScheduleUpdate,
  onScheduleDelete
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Scheduled Workflows</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledWorkflows.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Switch
                  checked={schedule.enabled}
                  onCheckedChange={(enabled) => onScheduleUpdate(schedule.id, { enabled })}
                />
                
                <div className="flex-1">
                  <h4 className="font-medium">{schedule.workflowName}</h4>
                  <p className="text-sm text-muted-foreground">{schedule.schedule.pattern}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Next: {schedule.nextExecution ? 
                        new Date(schedule.nextExecution).toLocaleString() : 
                        'Not scheduled'
                      }
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onScheduleDelete(schedule.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Workflow Metrics Component
const WorkflowMetrics: React.FC<WorkflowMetricsProps> = ({
  metrics,
  timeRange,
  onTimeRangeChange,
  onMetricsRefresh
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Workflow Metrics</CardTitle>
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
              <Button variant="outline" size="sm" onClick={onMetricsRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalExecutions || 0}</div>
              <p className="text-sm text-muted-foreground">Total Executions</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.successfulExecutions || 0}</div>
              <p className="text-sm text-muted-foreground">Successful</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{metrics.failedExecutions || 0}</div>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{metrics.averageExecutionTime || 0}s</div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowAutomationEngine;