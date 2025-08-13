import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitPullRequest, 
  Users, 
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Eye,
  FileText,
  AlertTriangle,
  Info,
  Workflow,
  UserCheck,
  UserX,
  UserPlus,
  Activity,
  Target,
  Calendar,
  Bell,
  Search,
  Filter,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  Copy,
  MoreHorizontal,
  ExternalLink,
  EyeOff,
  Star,
  Heart,
  Share,
  Tag,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  TrendingUp,
  Gauge,
  Network,
  Database,
  Cpu,
  Memory,
  Shield,
  Key,
  Lock,
  Unlock
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom Hooks
import { useCollaboration } from '../../hooks/useCollaboration';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// API Services
import { collaborationAPI } from '../../services/collaboration-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';

// Types
import type { 
  ReviewWorkflow,
  WorkflowStep,
  ReviewRequest,
  ReviewComment,
  ReviewApproval,
  WorkflowTemplate,
  ReviewMetrics,
  Reviewer,
  ReviewCriteria,
  WorkflowAutomation,
  ReviewHistory,
  ApprovalProcess,
  WorkflowRule,
  ReviewStatus,
  Priority,
  ReviewType,
  WorkflowStage,
  ReviewOutcome,
  TeamMember,
  ReviewAssignment,
  WorkflowNotification,
  EscalationRule,
  ReviewDeadline,
  ComplianceCheck
} from '../../types/collaboration.types';

import type { 
  ScanRule,
  RuleSet,
  RulePattern
} from '../../types/scan-rules.types';

// Utilities
import { collaborationHelpers } from '../../utils/collaboration-helpers';
import { workflowEngine } from '../../utils/workflow-engine';

interface RuleReviewWorkflowProps {
  className?: string;
  onReviewRequested?: (review: ReviewRequest) => void;
  onApprovalGranted?: (approval: ReviewApproval) => void;
  onWorkflowCompleted?: (workflow: ReviewWorkflow) => void;
}

interface WorkflowState {
  workflows: ReviewWorkflow[];
  reviewRequests: ReviewRequest[];
  approvals: ReviewApproval[];
  comments: ReviewComment[];
  templates: WorkflowTemplate[];
  reviewers: Reviewer[];
  metrics: ReviewMetrics;
  assignments: ReviewAssignment[];
  notifications: WorkflowNotification[];
  escalations: EscalationRule[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  pendingReviews: number;
  overdueReviews: number;
  averageReviewTime: number;
  approvalRate: number;
  escalationRate: number;
  automationLevel: number;
  teamProductivity: number;
}

interface WorkflowViewState {
  currentView: 'overview' | 'workflows' | 'reviews' | 'approvals' | 'templates' | 'analytics';
  selectedWorkflow?: ReviewWorkflow;
  selectedReview?: ReviewRequest;
  selectedTemplate?: WorkflowTemplate;
  workflowType: ReviewType;
  statusFilter: string;
  priorityFilter: string;
  reviewerFilter: string;
  autoAssignment: boolean;
  realTimeUpdates: boolean;
  showNotifications: boolean;
  enableEscalation: boolean;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTimeRange: 'day' | 'week' | 'month' | 'quarter';
  showCompleted: boolean;
  groupByStatus: boolean;
}

const DEFAULT_VIEW_STATE: WorkflowViewState = {
  currentView: 'overview',
  workflowType: 'rule_review',
  statusFilter: 'all',
  priorityFilter: 'all',
  reviewerFilter: 'all',
  autoAssignment: true,
  realTimeUpdates: true,
  showNotifications: true,
  enableEscalation: true,
  searchQuery: '',
  sortBy: 'created_date',
  sortOrder: 'desc',
  selectedTimeRange: 'week',
  showCompleted: false,
  groupByStatus: true
};

const WORKFLOW_TYPES = [
  { value: 'rule_review', label: 'Rule Review', icon: FileText, description: 'Review scan rules' },
  { value: 'compliance_check', label: 'Compliance Check', icon: Shield, description: 'Compliance validation' },
  { value: 'performance_review', label: 'Performance Review', icon: Gauge, description: 'Performance assessment' },
  { value: 'security_audit', label: 'Security Audit', icon: Lock, description: 'Security evaluation' },
  { value: 'change_approval', label: 'Change Approval', icon: GitPullRequest, description: 'Change management' }
];

const REVIEW_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  { value: 'in_review', label: 'In Review', color: 'text-blue-600 bg-blue-100', icon: Eye },
  { value: 'approved', label: 'Approved', color: 'text-green-600 bg-green-100', icon: CheckCircle2 },
  { value: 'rejected', label: 'Rejected', color: 'text-red-600 bg-red-100', icon: XCircle },
  { value: 'on_hold', label: 'On Hold', color: 'text-gray-600 bg-gray-100', icon: Pause },
  { value: 'escalated', label: 'Escalated', color: 'text-orange-600 bg-orange-100', icon: AlertTriangle }
];

const PRIORITY_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' }
];

const WORKFLOW_STAGES = [
  { id: 'initiation', name: 'Initiation', icon: Play },
  { id: 'assignment', name: 'Assignment', icon: UserPlus },
  { id: 'review', name: 'Review', icon: Eye },
  { id: 'approval', name: 'Approval', icon: CheckCircle2 },
  { id: 'completion', name: 'Completion', icon: Target }
];

export const RuleReviewWorkflow: React.FC<RuleReviewWorkflowProps> = ({
  className,
  onReviewRequested,
  onApprovalGranted,
  onWorkflowCompleted
}) => {
  // State Management
  const [viewState, setViewState] = useState<WorkflowViewState>(DEFAULT_VIEW_STATE);
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    workflows: [],
    reviewRequests: [],
    approvals: [],
    comments: [],
    templates: [],
    reviewers: [],
    metrics: {} as ReviewMetrics,
    assignments: [],
    notifications: [],
    escalations: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalWorkflows: 0,
    activeWorkflows: 0,
    completedWorkflows: 0,
    pendingReviews: 0,
    overdueReviews: 0,
    averageReviewTime: 0,
    approvalRate: 0,
    escalationRate: 0,
    automationLevel: 0,
    teamProductivity: 0
  });

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

  // Form States
  const [reviewForm, setReviewForm] = useState({
    ruleId: '',
    reviewType: 'rule_review' as ReviewType,
    priority: 'medium' as Priority,
    assignedReviewers: [] as string[],
    deadline: '',
    description: '',
    criteria: [] as string[],
    autoApprove: false
  });

  const [approvalForm, setApprovalForm] = useState({
    reviewId: '',
    decision: 'approved' as ReviewOutcome,
    comments: '',
    conditions: [] as string[],
    nextSteps: ''
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);

  // Custom Hooks
  const {
    getTeamMembers,
    getWorkflowTemplates,
    createReviewRequest,
    loading: collaborationLoading
  } = useCollaboration();

  const {
    scanRules,
    ruleSets,
    getRules,
    loading: rulesLoading
  } = useScanRules();

  const {
    generateReport,
    getAnalytics,
    loading: reportingLoading
  } = useReporting();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeUpdates) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/review-workflow`);
      
      wsRef.current.onopen = () => {
        console.log('Review Workflow WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Review Workflow WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('Review Workflow WebSocket disconnected');
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [viewState.realTimeUpdates]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'review_requested':
        setWorkflowState(prev => ({
          ...prev,
          reviewRequests: [...prev.reviewRequests, data.review],
          pendingReviews: prev.pendingReviews + 1
        }));
        if (onReviewRequested) onReviewRequested(data.review);
        break;
      case 'approval_granted':
        setWorkflowState(prev => ({
          ...prev,
          approvals: [...prev.approvals, data.approval]
        }));
        if (onApprovalGranted) onApprovalGranted(data.approval);
        break;
      case 'workflow_completed':
        setWorkflowState(prev => ({
          ...prev,
          workflows: prev.workflows.map(w => 
            w.id === data.workflow.id ? data.workflow : w
          ),
          completedWorkflows: prev.completedWorkflows + 1,
          activeWorkflows: prev.activeWorkflows - 1
        }));
        if (onWorkflowCompleted) onWorkflowCompleted(data.workflow);
        break;
      case 'comment_added':
        setWorkflowState(prev => ({
          ...prev,
          comments: [...prev.comments, data.comment]
        }));
        break;
      case 'assignment_updated':
        setWorkflowState(prev => ({
          ...prev,
          assignments: prev.assignments.map(a => 
            a.id === data.assignment.id ? data.assignment : a
          )
        }));
        break;
      case 'metrics_updated':
        setWorkflowState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [onReviewRequested, onApprovalGranted, onWorkflowCompleted]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setWorkflowState(prev => ({ ...prev, loading: true, error: null }));

      const [workflowsData, reviewsData, approvalsData, templatesData, metricsData] = await Promise.all([
        collaborationAPI.getReviewWorkflows({ 
          type: viewState.workflowType,
          status: viewState.statusFilter,
          timeRange: viewState.selectedTimeRange
        }),
        collaborationAPI.getReviewRequests({ 
          status: viewState.statusFilter,
          priority: viewState.priorityFilter
        }),
        collaborationAPI.getApprovals(),
        collaborationAPI.getWorkflowTemplates(),
        collaborationAPI.getReviewMetrics()
      ]);

      setWorkflowState(prev => ({
        ...prev,
        workflows: workflowsData.workflows,
        reviewRequests: reviewsData.reviews,
        approvals: approvalsData.approvals,
        templates: templatesData.templates,
        metrics: metricsData,
        totalWorkflows: workflowsData.total,
        activeWorkflows: workflowsData.workflows.filter(w => w.status === 'active').length,
        completedWorkflows: workflowsData.workflows.filter(w => w.status === 'completed').length,
        pendingReviews: reviewsData.reviews.filter(r => r.status === 'pending').length,
        overdueReviews: reviewsData.reviews.filter(r => r.isOverdue).length,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate derived metrics
      const avgReviewTime = metricsData.averageReviewTime || 0;
      const approvalRate = metricsData.approvalRate || 0;
      const escalationRate = metricsData.escalationRate || 0;
      const automationLevel = metricsData.automationLevel || 0;
      const teamProductivity = metricsData.teamProductivity || 0;

      setWorkflowState(prev => ({
        ...prev,
        averageReviewTime: avgReviewTime,
        approvalRate: approvalRate,
        escalationRate: escalationRate,
        automationLevel: automationLevel,
        teamProductivity: teamProductivity
      }));

    } catch (error) {
      console.error('Failed to refresh workflow data:', error);
      setWorkflowState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.workflowType, viewState.statusFilter, viewState.priorityFilter, viewState.selectedTimeRange]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Workflow Functions
  const createReviewWorkflow = useCallback(async () => {
    try {
      const workflow = await collaborationAPI.createReviewWorkflow({
        ruleId: reviewForm.ruleId,
        reviewType: reviewForm.reviewType,
        priority: reviewForm.priority,
        assignedReviewers: reviewForm.assignedReviewers,
        deadline: reviewForm.deadline,
        description: reviewForm.description,
        criteria: reviewForm.criteria,
        autoApprove: reviewForm.autoApprove,
        autoAssignment: viewState.autoAssignment
      });

      setWorkflowState(prev => ({
        ...prev,
        workflows: [...prev.workflows, workflow],
        totalWorkflows: prev.totalWorkflows + 1,
        activeWorkflows: prev.activeWorkflows + 1
      }));

      setReviewDialogOpen(false);

    } catch (error) {
      console.error('Failed to create review workflow:', error);
    }
  }, [reviewForm, viewState.autoAssignment]);

  const submitApproval = useCallback(async () => {
    try {
      const approval = await collaborationAPI.submitApproval({
        reviewId: approvalForm.reviewId,
        decision: approvalForm.decision,
        comments: approvalForm.comments,
        conditions: approvalForm.conditions,
        nextSteps: approvalForm.nextSteps
      });

      setWorkflowState(prev => ({
        ...prev,
        approvals: [...prev.approvals, approval]
      }));

      if (onApprovalGranted) onApprovalGranted(approval);
      setApprovalDialogOpen(false);

    } catch (error) {
      console.error('Failed to submit approval:', error);
    }
  }, [approvalForm, onApprovalGranted]);

  const assignReviewer = useCallback(async (reviewId: string, reviewerId: string) => {
    try {
      await collaborationAPI.assignReviewer({
        reviewId: reviewId,
        reviewerId: reviewerId,
        autoNotify: viewState.showNotifications
      });

      setWorkflowState(prev => ({
        ...prev,
        assignments: [...prev.assignments, {
          id: Date.now().toString(),
          reviewId,
          reviewerId,
          assignedAt: new Date(),
          status: 'assigned'
        }]
      }));

    } catch (error) {
      console.error('Failed to assign reviewer:', error);
    }
  }, [viewState.showNotifications]);

  const escalateReview = useCallback(async (reviewId: string, reason: string) => {
    try {
      await collaborationAPI.escalateReview({
        reviewId: reviewId,
        reason: reason,
        escalationLevel: 'manager',
        autoNotify: true
      });

      setWorkflowState(prev => ({
        ...prev,
        escalationRate: prev.escalationRate + 0.01
      }));

    } catch (error) {
      console.error('Failed to escalate review:', error);
    }
  }, []);

  const addComment = useCallback(async (reviewId: string, comment: string) => {
    try {
      const newComment = await collaborationAPI.addComment({
        reviewId: reviewId,
        comment: comment,
        type: 'review_comment'
      });

      setWorkflowState(prev => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }));

    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }, []);

  // Utility Functions
  const getStatusColor = useCallback((status: string) => {
    const statusConfig = REVIEW_STATUSES.find(s => s.value === status);
    return statusConfig ? statusConfig.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const statusConfig = REVIEW_STATUSES.find(s => s.value === status);
    if (statusConfig) {
      const IconComponent = statusConfig.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getWorkflowTypeIcon = useCallback((type: string) => {
    const typeConfig = WORKFLOW_TYPES.find(t => t.value === type);
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Workflow className="h-4 w-4" />;
  }, []);

  const formatDuration = useCallback((hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours.toFixed(0)}h`;
  }, []);

  // Filter Functions
  const filteredWorkflows = useMemo(() => {
    let filtered = workflowState.workflows;

    if (viewState.searchQuery) {
      filtered = filtered.filter(workflow => 
        workflow.title?.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        workflow.description?.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.statusFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === viewState.statusFilter);
    }

    if (viewState.priorityFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.priority === viewState.priorityFilter);
    }

    if (!viewState.showCompleted) {
      filtered = filtered.filter(workflow => workflow.status !== 'completed');
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'priority':
          aValue = PRIORITY_LEVELS.findIndex(p => p.value === a.priority);
          bValue = PRIORITY_LEVELS.findIndex(p => p.value === b.priority);
          break;
        case 'created_date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
          bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [workflowState.workflows, viewState.searchQuery, viewState.statusFilter, viewState.priorityFilter, viewState.showCompleted, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Workflow Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowState.totalWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              {workflowState.activeWorkflows} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{workflowState.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              {workflowState.overdueReviews} overdue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(workflowState.approvalRate * 100).toFixed(1)}%
            </div>
            <Progress value={workflowState.approvalRate * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(workflowState.averageReviewTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              average completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Workflow Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {REVIEW_STATUSES.map(status => {
              const count = filteredWorkflows.filter(w => w.status === status.value).length;
              const percentage = workflowState.totalWorkflows > 0 
                ? (count / workflowState.totalWorkflows) * 100 
                : 0;
              
              return (
                <div key={status.value} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <status.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  <div className="text-lg font-bold">{count}</div>
                  <Progress value={percentage} className="mt-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Stages Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Workflow Stages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {WORKFLOW_STAGES.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <stage.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs mt-2">{stage.name}</span>
                </div>
                {index < WORKFLOW_STAGES.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredWorkflows.slice(0, 5).map(workflow => (
              <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getWorkflowTypeIcon(workflow.type)}
                  <div>
                    <div className="font-medium">{workflow.title}</div>
                    <div className="text-sm text-gray-500">
                      {workflow.assignedReviewers?.length || 0} reviewers assigned
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(workflow.status)}
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(workflow.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Team Productivity</span>
                <span className="text-lg font-bold text-green-600">
                  {(workflowState.teamProductivity * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={workflowState.teamProductivity * 100} />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Automation Level</span>
                <span className="text-lg font-bold text-blue-600">
                  {(workflowState.automationLevel * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={workflowState.automationLevel * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Issue Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Escalation Rate</span>
                <span className="text-lg font-bold text-orange-600">
                  {(workflowState.escalationRate * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={workflowState.escalationRate * 100} />
              
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <div className="text-lg font-bold text-red-600">{workflowState.overdueReviews}</div>
                  <div className="text-gray-500">Overdue</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">{workflowState.pendingReviews}</div>
                  <div className="text-gray-500">Pending</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GitPullRequest className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Rule Review Workflow</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  workflowState.approvalRate >= 0.8 ? 'bg-green-500' :
                  workflowState.approvalRate >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  Approval Rate: {(workflowState.approvalRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.workflowType}
                onValueChange={(value) => setViewState(prev => ({ ...prev, workflowType: value as ReviewType }))}
              >
                <SelectTrigger className="w-48">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Review
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={workflowState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${workflowState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Switch
                checked={viewState.realTimeUpdates}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, realTimeUpdates: checked }))}
              />
              <span className="text-sm text-gray-600">Real-time</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="workflows" className="flex items-center gap-2">
                  <Workflow className="h-4 w-4" />
                  Workflows
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="approvals" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approvals
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="workflows">
                <div>Workflow Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="reviews">
                <div>Review Dashboard (To be implemented)</div>
              </TabsContent>
              <TabsContent value="approvals">
                <div>Approval Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="templates">
                <div>Template Library (To be implemented)</div>
              </TabsContent>
              <TabsContent value="analytics">
                <div>Workflow Analytics (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Review Workflow</DialogTitle>
              <DialogDescription>
                Set up a new review workflow for rule validation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="review-type">Review Type</Label>
                <Select 
                  value={reviewForm.reviewType}
                  onValueChange={(value) => setReviewForm(prev => ({ ...prev, reviewType: value as ReviewType }))}
                >
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
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={reviewForm.priority}
                  onValueChange={(value) => setReviewForm(prev => ({ ...prev, priority: value as Priority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  value={reviewForm.description}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the review requirements..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createReviewWorkflow}>
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RuleReviewWorkflow;