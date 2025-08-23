import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Clock, AlertTriangle, Users, User, Send, ArrowRight, ArrowLeft, RotateCcw, Pause, Play, Square, Edit, Trash2, Eye, EyeOff, Copy, Download, Upload, Settings, Filter, Search, RefreshCw, Plus, Minus, MoreHorizontal, Calendar, MessageCircle, FileText, Target, Zap, GitBranch, GitCommit, GitMerge, Route, Network, UserCheck, UserX, UserPlus, Mail, Bell, History, TrendingUp, BarChart3, PieChart, Activity, Timer, Flag, Star, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollaboration } from '../../hooks/useCollaboration';
import { collaborationApi } from '../../services/collaboration-apis';

interface ApprovalWorkflowProps {
  className?: string;
  onWorkflowUpdate?: (workflow: ApprovalWorkflow) => void;
  onApprovalComplete?: (approval: ApprovalDecision) => void;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'sequential' | 'parallel' | 'conditional' | 'hybrid';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  contextId: string;
  contextType: string;
  contextTitle: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  version: number;
  stages: ApprovalStage[];
  currentStage: number;
  progress: number;
  metadata: {
    autoAdvance: boolean;
    allowDelegation: boolean;
    requireComments: boolean;
    notifyOnDecision: boolean;
    escalationEnabled: boolean;
    escalationTimeHours: number;
  };
  analytics: {
    totalApprovers: number;
    pendingApprovals: number;
    completedApprovals: number;
    averageResponseTime: number;
    escalations: number;
  };
}

interface ApprovalStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  type: 'approval' | 'review' | 'notification' | 'conditional';
  status: 'pending' | 'active' | 'completed' | 'skipped' | 'failed';
  approvers: ApprovalUser[];
  requiredApprovals: number;
  approvalLogic: 'all' | 'majority' | 'any' | 'custom';
  timeoutHours?: number;
  conditions?: ApprovalCondition[];
  decisions: ApprovalDecision[];
  startedAt?: Date;
  completedAt?: Date;
  deadline?: Date;
}

interface ApprovalUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  isRequired: boolean;
  canDelegate: boolean;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
  backupApprovers: string[];
}

interface ApprovalDecision {
  id: string;
  stageId: string;
  approverId: string;
  approverName: string;
  decision: 'approved' | 'rejected' | 'requested_changes' | 'delegated' | 'abstained';
  comments?: string;
  attachments: string[];
  decidedAt: Date;
  delegatedTo?: string;
  conditions?: string[];
  metadata: {
    ipAddress: string;
    userAgent: string;
    confidence: number;
    reviewTime: number;
  };
}

interface ApprovalCondition {
  id: string;
  type: 'value_threshold' | 'role_required' | 'department_approval' | 'custom_logic';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'custom';
  value: any;
  description: string;
  isActive: boolean;
}

interface ApprovalTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sequential' | 'parallel' | 'conditional' | 'hybrid';
  stages: Omit<ApprovalStage, 'id' | 'status' | 'decisions' | 'startedAt' | 'completedAt'>[];
  category: string;
  tags: string[];
  isDefault: boolean;
  usage: number;
  createdBy: string;
  createdAt: Date;
}

interface WorkflowAnalytics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  averageCompletionTime: number;
  approvalRate: number;
  bottlenecks: Array<{
    stageId: string;
    stageName: string;
    averageTime: number;
    pendingCount: number;
  }>;
  topApprovers: Array<{
    userId: string;
    userName: string;
    decisionsCount: number;
    averageResponseTime: number;
    approvalRate: number;
  }>;
  trends: Array<{
    date: string;
    initiated: number;
    completed: number;
    average_time: number;
  }>;
}

const WORKFLOW_TYPES = [
  { value: 'sequential', label: 'Sequential', description: 'Approvers review one after another' },
  { value: 'parallel', label: 'Parallel', description: 'All approvers review simultaneously' },
  { value: 'conditional', label: 'Conditional', description: 'Flow changes based on conditions' },
  { value: 'hybrid', label: 'Hybrid', description: 'Combination of sequential and parallel' }
];

const APPROVAL_LOGIC = [
  { value: 'all', label: 'All Required', description: 'All approvers must approve' },
  { value: 'majority', label: 'Majority', description: 'More than 50% must approve' },
  { value: 'any', label: 'Any One', description: 'At least one approval required' },
  { value: 'custom', label: 'Custom Logic', description: 'Define custom approval rules' }
];

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  className,
  onWorkflowUpdate,
  onApprovalComplete
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'workflows' | 'pending' | 'templates' | 'analytics'>('workflows');
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [templates, setTemplates] = useState<ApprovalTemplate[]>([]);
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  
  // Workflow creation and editing
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showWorkflowDetails, setShowWorkflowDetails] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Partial<ApprovalWorkflow> | null>(null);
  
  // Form states
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    type: 'sequential' as 'sequential' | 'parallel' | 'conditional' | 'hybrid',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    dueDate: '',
    autoAdvance: true,
    allowDelegation: true,
    requireComments: false,
    notifyOnDecision: true,
    escalationEnabled: false,
    escalationTimeHours: 24
  });
  
  const [approvalDecision, setApprovalDecision] = useState({
    decision: 'approved' as 'approved' | 'rejected' | 'requested_changes' | 'delegated' | 'abstained',
    comments: '',
    delegatedTo: '',
    conditions: [] as string[]
  });
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStage, setSelectedStage] = useState<ApprovalStage | null>(null);
  
  // Hooks
  const {
    getApprovalWorkflows,
    createApprovalWorkflow,
    updateApprovalWorkflow,
    submitApprovalDecision,
    getApprovalTemplates,
    getWorkflowAnalytics,
    loading: collaborationLoading,
    error: collaborationError
  } = useCollaboration();

  // Initialize data
  useEffect(() => {
    loadWorkflows();
    loadTemplates();
    loadAnalytics();
  }, []);

  // Auto-refresh workflows
  useEffect(() => {
    const interval = setInterval(loadWorkflows, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  // Data loading functions
  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const workflowsData = await getApprovalWorkflows();
      setWorkflows(workflowsData);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  }, [getApprovalWorkflows]);

  const loadTemplates = useCallback(async () => {
    try {
      const templatesData = await getApprovalTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, [getApprovalTemplates]);

  const loadAnalytics = useCallback(async () => {
    try {
      const analyticsData = await getWorkflowAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [getWorkflowAnalytics]);

  // Workflow operations
  const handleCreateWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      const workflow = await createApprovalWorkflow({
        name: workflowForm.name,
        description: workflowForm.description,
        type: workflowForm.type,
        priority: workflowForm.priority,
        dueDate: workflowForm.dueDate ? new Date(workflowForm.dueDate) : undefined,
        metadata: {
          autoAdvance: workflowForm.autoAdvance,
          allowDelegation: workflowForm.allowDelegation,
          requireComments: workflowForm.requireComments,
          notifyOnDecision: workflowForm.notifyOnDecision,
          escalationEnabled: workflowForm.escalationEnabled,
          escalationTimeHours: workflowForm.escalationTimeHours
        }
      });
      
      setWorkflows(prev => [...prev, workflow]);
      setShowCreateWorkflow(false);
      setWorkflowForm({
        name: '',
        description: '',
        type: 'sequential',
        priority: 'normal',
        dueDate: '',
        autoAdvance: true,
        allowDelegation: true,
        requireComments: false,
        notifyOnDecision: true,
        escalationEnabled: false,
        escalationTimeHours: 24
      });
      
      if (onWorkflowUpdate) {
        onWorkflowUpdate(workflow);
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setLoading(false);
    }
  }, [workflowForm, createApprovalWorkflow, onWorkflowUpdate]);

  const handleSubmitApproval = useCallback(async (workflowId: string, stageId: string) => {
    try {
      setLoading(true);
      const decision = await submitApprovalDecision(workflowId, stageId, {
        decision: approvalDecision.decision,
        comments: approvalDecision.comments,
        delegatedTo: approvalDecision.delegatedTo || undefined,
        conditions: approvalDecision.conditions
      });
      
      // Update workflow state
      setWorkflows(prev => prev.map(workflow => {
        if (workflow.id === workflowId) {
          const updatedStages = workflow.stages.map(stage => {
            if (stage.id === stageId) {
              return {
                ...stage,
                decisions: [...stage.decisions, decision],
                status: determineStageStatus(stage, [...stage.decisions, decision])
              };
            }
            return stage;
          });
          
          return {
            ...workflow,
            stages: updatedStages,
            progress: calculateWorkflowProgress(updatedStages)
          };
        }
        return workflow;
      }));
      
      setShowApprovalDialog(false);
      setApprovalDecision({
        decision: 'approved',
        comments: '',
        delegatedTo: '',
        conditions: []
      });
      
      if (onApprovalComplete) {
        onApprovalComplete(decision);
      }
    } catch (error) {
      console.error('Failed to submit approval:', error);
    } finally {
      setLoading(false);
    }
  }, [approvalDecision, submitApprovalDecision, onApprovalComplete]);

  const handleWorkflowAction = useCallback(async (workflowId: string, action: 'start' | 'pause' | 'resume' | 'cancel') => {
    try {
      setLoading(true);
      await collaborationApi.updateWorkflowStatus(workflowId, action);
      await loadWorkflows();
    } catch (error) {
      console.error(`Failed to ${action} workflow:`, error);
    } finally {
      setLoading(false);
    }
  }, [loadWorkflows]);

  // Utility functions
  const determineStageStatus = (stage: ApprovalStage, decisions: ApprovalDecision[]): ApprovalStage['status'] => {
    const approvals = decisions.filter(d => d.decision === 'approved').length;
    const rejections = decisions.filter(d => d.decision === 'rejected').length;
    
    switch (stage.approvalLogic) {
      case 'all':
        if (rejections > 0) return 'failed';
        if (approvals >= stage.requiredApprovals) return 'completed';
        break;
      case 'majority':
        const majority = Math.ceil(stage.approvers.length / 2);
        if (rejections >= majority) return 'failed';
        if (approvals >= majority) return 'completed';
        break;
      case 'any':
        if (approvals > 0) return 'completed';
        if (rejections >= stage.approvers.length) return 'failed';
        break;
    }
    
    return 'active';
  };

  const calculateWorkflowProgress = (stages: ApprovalStage[]): number => {
    const completedStages = stages.filter(s => s.status === 'completed').length;
    return (completedStages / stages.length) * 100;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'active': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': case 'cancelled': return 'text-red-600';
      case 'paused': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'active': return Clock;
      case 'pending': return Timer;
      case 'failed': case 'cancelled': return XCircle;
      case 'paused': return Pause;
      default: return Clock;
    }
  };

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      if (searchQuery && !workflow.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && workflow.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'all' && workflow.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  }, [workflows, searchQuery, statusFilter, priorityFilter]);

  const pendingWorkflows = useMemo(() => {
    return workflows.filter(workflow => 
      workflow.status === 'active' && 
      workflow.stages.some(stage => 
        stage.status === 'active' && 
        stage.approvers.some(approver => approver.id === 'current-user')
      )
    );
  }, [workflows]);

  // Render functions
  const renderWorkflowCard = (workflow: ApprovalWorkflow) => {
    const StatusIcon = getStatusIcon(workflow.status);
    
    return (
      <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{workflow.name}</CardTitle>
              <CardDescription className="mt-1">{workflow.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={
                workflow.priority === 'urgent' ? 'destructive' :
                workflow.priority === 'high' ? 'secondary' : 'outline'
              }>
                {workflow.priority}
              </Badge>
              <Badge variant={workflow.status === 'completed' ? 'default' : 'outline'}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {workflow.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">{workflow.progress.toFixed(0)}%</span>
              </div>
              <Progress value={workflow.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Stages:</span>
                <span className="ml-2 font-medium">{workflow.currentStage + 1}/{workflow.stages.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Approvers:</span>
                <span className="ml-2 font-medium">{workflow.analytics.totalApprovers}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2 font-medium">{workflow.createdAt.toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Due:</span>
                <span className="ml-2 font-medium">
                  {workflow.dueDate ? workflow.dueDate.toLocaleDateString() : 'No deadline'}
                </span>
              </div>
            </div>
            
            {workflow.stages[workflow.currentStage] && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium mb-1">Current Stage</div>
                <div className="text-sm text-muted-foreground">
                  {workflow.stages[workflow.currentStage].name}
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex -space-x-2">
                    {workflow.stages[workflow.currentStage].approvers.slice(0, 3).map((approver, index) => (
                      <Avatar key={index} className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={approver.avatar} />
                        <AvatarFallback className="text-xs">{approver.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {workflow.stages[workflow.currentStage].approvers.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs">+{workflow.stages[workflow.currentStage].approvers.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 text-xs text-muted-foreground">
                    {workflow.analytics.pendingApprovals} pending
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSelectedWorkflow(workflow);
                  setShowWorkflowDetails(true);
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              
              {workflow.status === 'active' && (
                <Button 
                  size="sm"
                  onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              
              {workflow.status === 'paused' && (
                <Button 
                  size="sm"
                  onClick={() => handleWorkflowAction(workflow.id, 'resume')}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWorkflowStages = (workflow: ApprovalWorkflow) => (
    <div className="space-y-4">
      {workflow.stages.map((stage, index) => {
        const StageIcon = getStatusIcon(stage.status);
        const isCurrentStage = index === workflow.currentStage;
        
        return (
          <div key={stage.id} className={cn(
            "border rounded-lg p-4",
            isCurrentStage && "border-blue-200 bg-blue-50"
          )}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "rounded-full p-2",
                  stage.status === 'completed' && "bg-green-100 text-green-600",
                  stage.status === 'active' && "bg-blue-100 text-blue-600",
                  stage.status === 'pending' && "bg-gray-100 text-gray-600",
                  stage.status === 'failed' && "bg-red-100 text-red-600"
                )}>
                  <StageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">{stage.name}</h4>
                  {stage.description && (
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {stage.type}
                </Badge>
                <Badge variant={stage.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                  {stage.status}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm text-muted-foreground">Approval Logic:</span>
                <span className="ml-2 text-sm font-medium">{stage.approvalLogic}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Required:</span>
                <span className="ml-2 text-sm font-medium">{stage.requiredApprovals}/{stage.approvers.length}</span>
              </div>
              {stage.timeoutHours && (
                <div>
                  <span className="text-sm text-muted-foreground">Timeout:</span>
                  <span className="ml-2 text-sm font-medium">{stage.timeoutHours}h</span>
                </div>
              )}
              {stage.deadline && (
                <div>
                  <span className="text-sm text-muted-foreground">Deadline:</span>
                  <span className="ml-2 text-sm font-medium">{stage.deadline.toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Approvers:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stage.approvers.map(approver => {
                    const decision = stage.decisions.find(d => d.approverId === approver.id);
                    
                    return (
                      <div key={approver.id} className="flex items-center space-x-2 p-2 border rounded bg-white">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={approver.avatar} />
                          <AvatarFallback className="text-xs">{approver.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{approver.name}</div>
                          <div className="text-xs text-muted-foreground">{approver.role}</div>
                        </div>
                        {decision ? (
                          <Badge variant={
                            decision.decision === 'approved' ? 'default' :
                            decision.decision === 'rejected' ? 'destructive' : 'secondary'
                          } className="text-xs">
                            {decision.decision}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            pending
                          </Badge>
                        )}
                        {approver.isRequired && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {stage.decisions.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Decisions:</span>
                  <div className="space-y-2 mt-2">
                    {stage.decisions.map(decision => (
                      <div key={decision.id} className="p-2 border rounded bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{decision.approverName}</span>
                            <Badge variant={
                              decision.decision === 'approved' ? 'default' :
                              decision.decision === 'rejected' ? 'destructive' : 'secondary'
                            } className="text-xs">
                              {decision.decision}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {decision.decidedAt.toLocaleDateString()}
                          </span>
                        </div>
                        {decision.comments && (
                          <p className="text-sm text-muted-foreground mt-1">{decision.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {stage.status === 'active' && stage.approvers.some(a => a.id === 'current-user') && (
              <div className="mt-3 pt-3 border-t">
                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedStage(stage);
                    setShowApprovalDialog(true);
                  }}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Submit Decision
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Approval Workflows</h2>
          <p className="text-muted-foreground">
            Manage approval processes and track decisions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadWorkflows}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateWorkflow(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">All Workflows</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingWorkflows.length})
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflows" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredWorkflows.map(renderWorkflowCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-6">
          <div className="space-y-4">
            {pendingWorkflows.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No pending approvals</h3>
                  <p className="text-muted-foreground">
                    You're all caught up! No workflows require your attention.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingWorkflows.map(renderWorkflowCard)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Workflow Templates</h3>
            <Button onClick={() => setShowTemplateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Type:</span>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Stages:</span>
                      <span className="font-medium">{template.stages.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Usage:</span>
                      <span className="font-medium">{template.usage} times</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Button size="sm" className="flex-1">
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalWorkflows}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.activeWorkflows}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.approvalRate.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.averageCompletionTime.toFixed(1)}h</div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottlenecks */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Bottlenecks</CardTitle>
                  <CardDescription>Stages with the longest approval times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{bottleneck.stageName}</div>
                          <div className="text-sm text-muted-foreground">
                            {bottleneck.pendingCount} pending approvals
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{bottleneck.averageTime.toFixed(1)}h</div>
                          <div className="text-sm text-muted-foreground">avg time</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Workflow Details Dialog */}
      <Dialog open={showWorkflowDetails} onOpenChange={setShowWorkflowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>{selectedWorkflow?.description}</DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="font-medium">{selectedWorkflow.status}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <div className="font-medium">{selectedWorkflow.priority}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <div className="font-medium">{selectedWorkflow.progress.toFixed(0)}%</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <div className="font-medium">{selectedWorkflow.type}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-lg font-medium mb-4">Workflow Stages</h4>
                {renderWorkflowStages(selectedWorkflow)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateWorkflow} onOpenChange={setShowCreateWorkflow}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Set up a new approval workflow for your process
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <Label htmlFor="workflow-type">Workflow Type</Label>
                <Select value={workflowForm.type} onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflowForm.description}
                onChange={(e) => setWorkflowForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the approval workflow"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workflow-priority">Priority</Label>
                <Select value={workflowForm.priority} onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workflow-due">Due Date (Optional)</Label>
                <Input
                  id="workflow-due"
                  type="date"
                  value={workflowForm.dueDate}
                  onChange={(e) => setWorkflowForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Workflow Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={workflowForm.autoAdvance}
                    onCheckedChange={(checked) => setWorkflowForm(prev => ({ ...prev, autoAdvance: checked }))}
                  />
                  <Label className="text-sm">Auto-advance stages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={workflowForm.allowDelegation}
                    onCheckedChange={(checked) => setWorkflowForm(prev => ({ ...prev, allowDelegation: checked }))}
                  />
                  <Label className="text-sm">Allow delegation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={workflowForm.requireComments}
                    onCheckedChange={(checked) => setWorkflowForm(prev => ({ ...prev, requireComments: checked }))}
                  />
                  <Label className="text-sm">Require comments</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={workflowForm.notifyOnDecision}
                    onCheckedChange={(checked) => setWorkflowForm(prev => ({ ...prev, notifyOnDecision: checked }))}
                  />
                  <Label className="text-sm">Notify on decisions</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateWorkflow(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={loading || !workflowForm.name}>
              Create Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Decision Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Approval Decision</DialogTitle>
            <DialogDescription>
              Review and provide your decision for this approval stage
            </DialogDescription>
          </DialogHeader>
          {selectedStage && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Stage: {selectedStage.name}</Label>
                {selectedStage.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedStage.description}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="decision">Decision</Label>
                <Select value={approvalDecision.decision} onValueChange={(value) => setApprovalDecision(prev => ({ ...prev, decision: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="requested_changes">Request Changes</SelectItem>
                    <SelectItem value="delegated">Delegate</SelectItem>
                    <SelectItem value="abstained">Abstain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="comments">Comments {selectedWorkflow?.metadata.requireComments && <span className="text-red-500">*</span>}</Label>
                <Textarea
                  id="comments"
                  value={approvalDecision.comments}
                  onChange={(e) => setApprovalDecision(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Provide your feedback or reasoning..."
                  className="min-h-20"
                />
              </div>
              
              {approvalDecision.decision === 'delegated' && (
                <div>
                  <Label htmlFor="delegated-to">Delegate To</Label>
                  <Input
                    id="delegated-to"
                    value={approvalDecision.delegatedTo}
                    onChange={(e) => setApprovalDecision(prev => ({ ...prev, delegatedTo: e.target.value }))}
                    placeholder="Enter user email or name"
                  />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedWorkflow && selectedStage && handleSubmitApproval(selectedWorkflow.id, selectedStage.id)}
              disabled={loading || (selectedWorkflow?.metadata.requireComments && !approvalDecision.comments.trim())}
            >
              Submit Decision
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalWorkflow;