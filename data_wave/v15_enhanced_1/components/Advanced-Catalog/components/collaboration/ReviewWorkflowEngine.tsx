'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import { 
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger
} from '@/components/ui/context-menu';
import { 
  HoverCard, HoverCardContent, HoverCardTrigger
} from '@/components/ui/hover-card';

import { 
  GitPullRequest, Workflow, Users, Clock, CheckCircle, XCircle, AlertCircle,
  PlayCircle, PauseCircle, StopCircle, SkipForward, RotateCcw, FastForward,
  Eye, Edit, Trash2, Plus, Search, Filter, MoreHorizontal, Settings,
  AlertTriangle, CheckCircle2, Clock3, Activity, TrendingUp, Target,
  BarChart3, PieChart, LineChart, Zap, Brain, Lightbulb, Star, Flag,
  GitBranch, GitMerge, GitCommit, History, Calendar as CalendarIcon,
  User, UserCheck, Users2, Crown, Award, Shield, Lock, Unlock,
  Mail, Phone, Bell, MessageSquare, Send, Forward, Reply, Archive,
  Download, Upload, ExternalLink, Link, Share2, Copy, Save,
  RefreshCw, ChevronDown, ChevronRight, ChevronLeft, ChevronUp,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Maximize, Minimize,
  Grid, List, Layout, Map, Layers, Network, Database, Table as TableIcon,
  FileText, File, Folder, Tag, Hash, Code, Terminal, Monitor,
  Smartphone, Tablet, Laptop, Server, Cloud, HardDrive, Cpu,
  Memory, Gauge, Signal, Wifi, Bluetooth, Power, Battery
} from 'lucide-react';

import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadialBarChart,
  RadialBar, ComposedChart, ScatterChart, Scatter, TreeMap, Sankey
} from 'recharts';

import { format, subDays, parseISO, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay, addDays, addHours } from 'date-fns';
import { cn } from '@/lib/utils';

// Import backend services
import { collaborationService } from '../../services/collaboration.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { advancedLineageService } from '../../services/advanced-lineage.service';

// Import types
import { CollaborationTeam, TeamMember } from '../../types/collaboration.types';

// ============================================================================
// REVIEW WORKFLOW ENGINE TYPES
// ============================================================================

interface ReviewWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'review' | 'validation' | 'certification' | 'compliance' | 'quality_check';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived' | 'suspended';
  category: 'data_governance' | 'quality_assurance' | 'compliance' | 'security' | 'documentation' | 'metadata';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  version: number;
  configuration: WorkflowConfiguration;
  stages: WorkflowStage[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  notifications: NotificationConfig[];
  escalation_rules: EscalationRule[];
  approval_matrix: ApprovalMatrix;
  sla_settings: SLASettings;
  metrics: WorkflowMetrics;
  permissions: WorkflowPermission[];
  tags: string[];
  metadata: Record<string, any>;
}

interface WorkflowConfiguration {
  auto_start: boolean;
  allow_parallel_execution: boolean;
  require_all_approvals: boolean;
  allow_delegation: boolean;
  enable_escalation: boolean;
  track_time: boolean;
  enable_notifications: boolean;
  allow_comments: boolean;
  require_evidence: boolean;
  version_control: boolean;
  audit_trail: boolean;
  integration_endpoints: string[];
  custom_fields: CustomField[];
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'review' | 'validation' | 'notification' | 'automation' | 'decision' | 'documentation';
  order: number;
  required: boolean;
  parallel_execution: boolean;
  conditions: StageCondition[];
  actions: StageAction[];
  assignees: StageAssignee[];
  time_limit: number; // hours
  escalation_enabled: boolean;
  approval_threshold: number; // percentage
  rejection_threshold: number; // percentage
  auto_approve_conditions: AutoApprovalCondition[];
  dependencies: string[]; // stage IDs
  outputs: StageOutput[];
  validation_rules: ValidationRule[];
  documentation_requirements: DocumentationRequirement[];
}

interface WorkflowTrigger {
  id: string;
  name: string;
  type: 'manual' | 'automatic' | 'scheduled' | 'event' | 'api' | 'webhook';
  event_type: string;
  conditions: TriggerCondition[];
  parameters: Record<string, any>;
  enabled: boolean;
  retry_configuration: RetryConfiguration;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'regex';
  value: any;
  logic_operator: 'and' | 'or';
  group: string;
}

interface WorkflowAction {
  id: string;
  name: string;
  type: 'send_notification' | 'update_status' | 'assign_task' | 'create_record' | 'call_api' | 'run_script';
  stage_id?: string;
  trigger_event: string;
  parameters: Record<string, any>;
  enabled: boolean;
  error_handling: ErrorHandling;
}

interface NotificationConfig {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'in_app' | 'sms';
  recipients: NotificationRecipient[];
  template: string;
  trigger_events: string[];
  conditions: NotificationCondition[];
  enabled: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface EscalationRule {
  id: string;
  name: string;
  trigger_condition: 'timeout' | 'rejection' | 'no_response' | 'custom';
  time_threshold: number; // hours
  escalation_levels: EscalationLevel[];
  enabled: boolean;
  auto_escalate: boolean;
}

interface ApprovalMatrix {
  id: string;
  name: string;
  description: string;
  matrix_type: 'hierarchical' | 'parallel' | 'sequential' | 'conditional';
  approval_levels: ApprovalLevel[];
  decision_rules: DecisionRule[];
  fallback_approvers: string[];
}

interface SLASettings {
  enabled: boolean;
  total_time_limit: number; // hours
  stage_time_limits: { [stage_id: string]: number };
  warning_thresholds: number[]; // percentages
  breach_actions: BreachAction[];
  business_hours_only: boolean;
  holidays_excluded: boolean;
  timezone: string;
}

interface WorkflowMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_completion_time: number;
  current_active_instances: number;
  approval_rates: { [stage_id: string]: number };
  rejection_rates: { [stage_id: string]: number };
  escalation_frequency: number;
  sla_compliance_rate: number;
  bottleneck_stages: string[];
  performance_trends: PerformanceTrend[];
}

interface WorkflowPermission {
  user_id?: string;
  role?: string;
  team_id?: string;
  permissions: string[];
  conditions: PermissionCondition[];
}

interface CustomField {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'file';
  required: boolean;
  default_value?: any;
  options?: string[];
  validation?: string;
}

interface StageCondition {
  field: string;
  operator: string;
  value: any;
  required: boolean;
}

interface StageAction {
  type: string;
  parameters: Record<string, any>;
  condition?: string;
}

interface StageAssignee {
  type: 'user' | 'role' | 'team' | 'dynamic';
  value: string;
  is_required: boolean;
  can_delegate: boolean;
  notification_preferences: string[];
}

interface AutoApprovalCondition {
  condition: string;
  enabled: boolean;
  confidence_threshold: number;
}

interface StageOutput {
  name: string;
  type: string;
  required: boolean;
  validation: string;
}

interface ValidationRule {
  name: string;
  type: 'required' | 'format' | 'range' | 'custom';
  parameters: Record<string, any>;
  error_message: string;
}

interface DocumentationRequirement {
  name: string;
  type: 'text' | 'file' | 'link' | 'checklist';
  required: boolean;
  template?: string;
}

interface TriggerCondition {
  field: string;
  operator: string;
  value: any;
}

interface RetryConfiguration {
  max_attempts: number;
  delay_seconds: number;
  exponential_backoff: boolean;
}

interface ErrorHandling {
  on_error: 'stop' | 'continue' | 'retry' | 'escalate';
  max_retries: number;
  error_notification: boolean;
}

interface NotificationRecipient {
  type: 'user' | 'role' | 'team' | 'email';
  value: string;
  conditions?: string[];
}

interface NotificationCondition {
  field: string;
  operator: string;
  value: any;
}

interface EscalationLevel {
  level: number;
  assignee_type: 'user' | 'role' | 'team';
  assignee_value: string;
  time_threshold: number; // hours
  actions: EscalationAction[];
}

interface EscalationAction {
  type: 'notify' | 'reassign' | 'auto_approve' | 'cancel';
  parameters: Record<string, any>;
}

interface ApprovalLevel {
  level: number;
  name: string;
  required_approvals: number;
  approvers: LevelApprover[];
  conditions: ApprovalCondition[];
  timeout_hours: number;
}

interface DecisionRule {
  condition: string;
  action: 'approve' | 'reject' | 'escalate' | 'request_info';
  parameters: Record<string, any>;
}

interface BreachAction {
  type: 'notify' | 'escalate' | 'auto_approve' | 'cancel';
  parameters: Record<string, any>;
}

interface PerformanceTrend {
  date: string;
  metric: string;
  value: number;
  target?: number;
}

interface PermissionCondition {
  field: string;
  operator: string;
  value: any;
}

interface LevelApprover {
  type: 'user' | 'role' | 'team';
  value: string;
  weight: number;
}

interface ApprovalCondition {
  field: string;
  operator: string;
  value: any;
}

// Workflow Instance Types
interface WorkflowInstance {
  id: string;
  workflow_id: string;
  workflow_name: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  started_at: string;
  completed_at?: string;
  current_stage: string;
  next_stages: string[];
  progress_percentage: number;
  target_type: string;
  target_id: string;
  target_name: string;
  context: InstanceContext;
  stage_history: StageExecution[];
  approvals: ApprovalRecord[];
  comments: InstanceComment[];
  attachments: InstanceAttachment[];
  sla_status: SLAStatus;
  escalation_history: EscalationRecord[];
  audit_trail: AuditRecord[];
  custom_data: Record<string, any>;
  tags: string[];
  watchers: string[];
}

interface InstanceContext {
  initiator: string;
  department: string;
  business_justification: string;
  impact_assessment: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  related_requests: string[];
  external_references: string[];
  compliance_requirements: string[];
}

interface StageExecution {
  stage_id: string;
  stage_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  assigned_to: string[];
  actual_assignee?: string;
  decision: 'approved' | 'rejected' | 'escalated' | 'delegated' | null;
  comments: string;
  attachments: string[];
  time_taken: number; // minutes
  sla_breached: boolean;
  escalated: boolean;
  delegation_history: DelegationRecord[];
}

interface ApprovalRecord {
  id: string;
  stage_id: string;
  approver_id: string;
  approver_name: string;
  decision: 'approved' | 'rejected' | 'request_changes' | 'delegated';
  comments: string;
  reasoning: string;
  decision_date: string;
  conditions: string[];
  attachments: string[];
  confidence_score?: number;
  delegation_to?: string;
}

interface InstanceComment {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  type: 'comment' | 'question' | 'clarification' | 'update';
  stage_id?: string;
  visibility: 'public' | 'private' | 'stakeholders';
  created_at: string;
  attachments: string[];
  mentions: string[];
  resolved: boolean;
}

interface InstanceAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
  stage_id?: string;
  description?: string;
}

interface SLAStatus {
  is_breached: boolean;
  time_remaining: number; // minutes
  warning_triggered: boolean;
  breach_date?: string;
  escalation_triggered: boolean;
  current_sla_level: string;
}

interface EscalationRecord {
  id: string;
  escalation_rule_id: string;
  trigger_reason: string;
  triggered_at: string;
  escalated_to: string;
  escalation_level: number;
  resolved: boolean;
  resolved_at?: string;
  resolution_action: string;
}

interface AuditRecord {
  id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  timestamp: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
}

interface DelegationRecord {
  id: string;
  delegated_by: string;
  delegated_to: string;
  reason: string;
  delegated_at: string;
  accepted: boolean;
  accepted_at?: string;
}

// Analytics Types
interface WorkflowAnalytics {
  overview: WorkflowOverview;
  performance: WorkflowPerformance;
  efficiency: EfficiencyMetrics;
  quality: QualityMetrics;
  user_activity: UserActivityMetrics;
  trends: TrendAnalytics;
  bottlenecks: BottleneckAnalysis;
  predictions: PredictiveAnalytics;
}

interface WorkflowOverview {
  total_workflows: number;
  active_workflows: number;
  total_instances: number;
  pending_instances: number;
  completed_instances: number;
  average_completion_time: number;
  success_rate: number;
  escalation_rate: number;
}

interface WorkflowPerformance {
  throughput: { date: string; count: number }[];
  completion_times: { workflow: string; avg_time: number; target_time: number }[];
  sla_compliance: { workflow: string; compliance_rate: number }[];
  stage_performance: { stage: string; avg_time: number; success_rate: number }[];
}

interface EfficiencyMetrics {
  automation_rate: number;
  manual_intervention_rate: number;
  rework_rate: number;
  first_pass_success_rate: number;
  resource_utilization: ResourceUtilization[];
  cost_per_execution: { workflow: string; cost: number }[];
}

interface QualityMetrics {
  error_rate: number;
  decision_accuracy: number;
  stakeholder_satisfaction: number;
  compliance_adherence: number;
  documentation_completeness: number;
  review_quality_score: number;
}

interface UserActivityMetrics {
  most_active_reviewers: { user: string; reviews: number; avg_time: number }[];
  workload_distribution: { user: string; pending: number; completed: number }[];
  response_times: { user: string; avg_response_time: number }[];
  decision_patterns: { user: string; approvals: number; rejections: number }[];
}

interface TrendAnalytics {
  volume_trends: { period: string; volume: number; growth: number }[];
  performance_trends: { period: string; metric: string; value: number }[];
  seasonal_patterns: SeasonalPattern[];
  forecast: ForecastData[];
}

interface BottleneckAnalysis {
  identified_bottlenecks: Bottleneck[];
  impact_analysis: ImpactAnalysis[];
  optimization_suggestions: OptimizationSuggestion[];
  comparative_analysis: ComparativeMetric[];
}

interface PredictiveAnalytics {
  completion_predictions: CompletionPrediction[];
  resource_demand_forecast: ResourceForecast[];
  risk_assessments: RiskAssessment[];
  optimization_opportunities: OptimizationOpportunity[];
}

interface ResourceUtilization {
  resource: string;
  utilization_rate: number;
  capacity: number;
  demand: number;
}

interface SeasonalPattern {
  period: string;
  pattern_type: string;
  impact_factor: number;
  confidence: number;
}

interface ForecastData {
  date: string;
  predicted_value: number;
  confidence_interval: [number, number];
  factors: string[];
}

interface Bottleneck {
  stage_id: string;
  stage_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  avg_delay: number;
  impact_score: number;
  frequency: number;
  root_causes: string[];
}

interface ImpactAnalysis {
  bottleneck_id: string;
  affected_workflows: number;
  time_impact: number;
  cost_impact: number;
  quality_impact: number;
}

interface OptimizationSuggestion {
  type: 'automation' | 'parallel_processing' | 'resource_allocation' | 'process_redesign';
  description: string;
  potential_improvement: number;
  implementation_effort: 'low' | 'medium' | 'high';
  estimated_cost: number;
  roi_projection: number;
}

interface ComparativeMetric {
  metric: string;
  current_value: number;
  benchmark_value: number;
  industry_average: number;
  performance_ranking: string;
}

interface CompletionPrediction {
  instance_id: string;
  predicted_completion: string;
  confidence: number;
  risk_factors: string[];
}

interface ResourceForecast {
  period: string;
  resource_type: string;
  predicted_demand: number;
  current_capacity: number;
  gap_analysis: number;
}

interface RiskAssessment {
  instance_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  mitigation_suggestions: string[];
}

interface OptimizationOpportunity {
  opportunity_type: string;
  description: string;
  potential_value: number;
  implementation_complexity: string;
  priority_score: number;
}

interface RiskFactor {
  factor: string;
  impact: number;
  probability: number;
  mitigation_available: boolean;
}

interface ReviewWorkflowEngineProps {
  className?: string;
  teamId?: string;
  mode?: 'admin' | 'user' | 'readonly';
  onWorkflowCreated?: (workflow: ReviewWorkflow) => void;
  onInstanceCompleted?: (instance: WorkflowInstance) => void;
  onEscalationTriggered?: (instance: WorkflowInstance, escalation: EscalationRecord) => void;
}

// Color schemes and constants
const WORKFLOW_STATUS_COLORS = {
  draft: '#6b7280',
  active: '#10b981',
  paused: '#f59e0b',
  completed: '#3b82f6',
  archived: '#64748b',
  suspended: '#ef4444'
};

const INSTANCE_STATUS_COLORS = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  approved: '#10b981',
  rejected: '#ef4444',
  cancelled: '#6b7280',
  escalated: '#f97316'
};

const PRIORITY_COLORS = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
  urgent: '#dc2626'
};

const DECISION_COLORS = {
  approved: '#10b981',
  rejected: '#ef4444',
  request_changes: '#f59e0b',
  delegated: '#8b5cf6',
  escalated: '#f97316'
};

export default function ReviewWorkflowEngine({ 
  className, 
  teamId, 
  mode = 'user',
  onWorkflowCreated, 
  onInstanceCompleted,
  onEscalationTriggered 
}: ReviewWorkflowEngineProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('instances');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [workflows, setWorkflows] = useState<ReviewWorkflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [analytics, setAnalytics] = useState<WorkflowAnalytics | null>(null);
  const [teams, setTeams] = useState<CollaborationTeam[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  
  // UI States
  const [selectedWorkflow, setSelectedWorkflow] = useState<ReviewWorkflow | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInstanceDialog, setShowInstanceDialog] = useState(false);
  const [showWorkflowDesigner, setShowWorkflowDesigner] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban' | 'timeline'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterWorkflow, setFilterWorkflow] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'priority' | 'status'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedInstances, setExpandedInstances] = useState<Set<string>>(new Set());
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  // Form States
  const [newWorkflow, setNewWorkflow] = useState<Partial<ReviewWorkflow>>({
    type: 'approval',
    status: 'draft',
    category: 'data_governance',
    priority: 'medium',
    configuration: {
      auto_start: false,
      allow_parallel_execution: false,
      require_all_approvals: true,
      allow_delegation: true,
      enable_escalation: true,
      track_time: true,
      enable_notifications: true,
      allow_comments: true,
      require_evidence: false,
      version_control: true,
      audit_trail: true,
      integration_endpoints: [],
      custom_fields: []
    },
    stages: [],
    triggers: [],
    conditions: [],
    actions: [],
    notifications: [],
    escalation_rules: [],
    tags: []
  });
  const [newInstance, setNewInstance] = useState<Partial<WorkflowInstance>>({
    priority: 'medium',
    tags: []
  });
  const [approvalComment, setApprovalComment] = useState('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'request_changes' | 'delegate' | null>(null);
  
  // Real-time States
  const [liveInstances, setLiveInstances] = useState<Map<string, boolean>>(new Map());
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadWorkflowData();
    setupRealTimeUpdates();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [teamId]);

  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      // Load review workflows from backend
      const workflowsResponse = await collaborationService.getReviewWorkflows({
        teamId: teamId,
        includeMetrics: true,
        includeStages: true,
        limit: 100
      });
      const workflowsData = workflowsResponse.data || [];
      
      // Load workflow instances from backend
      const instancesResponse = await collaborationService.getWorkflowInstances({
        teamId: teamId,
        includeHistory: true,
        includeApprovals: true,
        includeComments: true,
        limit: 200
      });
      const instancesData = instancesResponse.data || [];
      
      // Load workflow analytics from backend
      const analyticsResponse = await collaborationService.getWorkflowAnalytics({
        teamId: teamId,
        timeRange: { from: subDays(new Date(), 30), to: new Date() },
        includeDetailedMetrics: true,
        includePredictions: true
      });
      const analyticsData = analyticsResponse.data;
      
      // Load collaboration teams from backend
      const teamsResponse = await collaborationService.getCollaborationTeams({
        includeMembers: true,
        limit: 20
      });
      const teamsData = teamsResponse.data || [];
      
      // Load current user from backend
      const userResponse = await collaborationService.getCurrentUser();
      const userData = userResponse.data;
      
      setWorkflows(workflowsData);
      setInstances(instancesData);
      setAnalytics(analyticsData);
      setTeams(teamsData);
      setCurrentUser(userData);
      
    } catch (err) {
      setError('Failed to load workflow data from backend');
      console.error('Error loading workflow data:', err);
      
      // Fallback to empty states
      setWorkflows([]);
      setInstances([]);
      setAnalytics(null);
      setTeams([]);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadWorkflowData();
    }, 30000);
    
    // WebSocket connection for real-time workflow updates
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/workflows/${teamId || 'default'}`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };
      
      ws.current.onopen = () => {
        console.log('Workflow WebSocket connected');
        // Join workflow room
        ws.current?.send(JSON.stringify({
          type: 'join_room',
          teamId: teamId,
          userId: currentUser?.id
        }));
      };
      
      ws.current.onerror = (error) => {
        console.error('Workflow WebSocket error:', error);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'workflow_created':
        setWorkflows(prev => [data.workflow, ...prev]);
        break;
      case 'workflow_updated':
        setWorkflows(prev => prev.map(wf => 
          wf.id === data.workflow.id ? { ...wf, ...data.workflow } : wf
        ));
        break;
      case 'instance_created':
        setInstances(prev => [data.instance, ...prev]);
        setLiveInstances(prev => new Map(prev.set(data.instance.id, true)));
        break;
      case 'instance_updated':
        setInstances(prev => prev.map(inst => 
          inst.id === data.instance.id ? { ...inst, ...data.instance } : inst
        ));
        break;
      case 'approval_submitted':
        setInstances(prev => prev.map(inst => 
          inst.id === data.instanceId 
            ? { ...inst, approvals: [...inst.approvals, data.approval] }
            : inst
        ));
        break;
      case 'escalation_triggered':
        setInstances(prev => prev.map(inst => 
          inst.id === data.instanceId 
            ? { ...inst, status: 'escalated', escalation_history: [...inst.escalation_history, data.escalation] }
            : inst
        ));
        onEscalationTriggered?.(
          instances.find(i => i.id === data.instanceId)!,
          data.escalation
        );
        break;
      case 'notification_received':
        setNotifications(prev => [data.notification, ...prev]);
        break;
    }
  };

  // Workflow Management Functions
  const createWorkflow = async (workflowData: Partial<ReviewWorkflow>) => {
    try {
      setIsCreatingWorkflow(true);
      
      const createRequest = {
        name: workflowData.name || '',
        description: workflowData.description || '',
        type: workflowData.type || 'approval',
        category: workflowData.category || 'data_governance',
        priority: workflowData.priority || 'medium',
        configuration: workflowData.configuration || {},
        stages: workflowData.stages || [],
        triggers: workflowData.triggers || [],
        conditions: workflowData.conditions || [],
        actions: workflowData.actions || [],
        notifications: workflowData.notifications || [],
        escalationRules: workflowData.escalation_rules || [],
        approvalMatrix: workflowData.approval_matrix || {},
        slaSettings: workflowData.sla_settings || {},
        permissions: workflowData.permissions || [],
        tags: workflowData.tags || [],
        teamId: teamId
      };
      
      const response = await collaborationService.createReviewWorkflow(createRequest);
      const newWorkflow = response.data;
      
      setWorkflows(prev => [newWorkflow, ...prev]);
      setShowCreateDialog(false);
      setNewWorkflow({
        type: 'approval',
        status: 'draft',
        category: 'data_governance',
        priority: 'medium',
        configuration: {
          auto_start: false,
          allow_parallel_execution: false,
          require_all_approvals: true,
          allow_delegation: true,
          enable_escalation: true,
          track_time: true,
          enable_notifications: true,
          allow_comments: true,
          require_evidence: false,
          version_control: true,
          audit_trail: true,
          integration_endpoints: [],
          custom_fields: []
        },
        stages: [],
        triggers: [],
        conditions: [],
        actions: [],
        notifications: [],
        escalation_rules: [],
        tags: []
      });
      
      onWorkflowCreated?.(newWorkflow);
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'workflow_created',
        workflow: newWorkflow
      }));
      
    } catch (err) {
      setError('Failed to create workflow via backend');
      console.error('Workflow creation error:', err);
    } finally {
      setIsCreatingWorkflow(false);
    }
  };

  const startWorkflowInstance = async (workflowId: string, instanceData: Partial<WorkflowInstance>) => {
    try {
      setIsProcessingAction(true);
      
      const startRequest = {
        workflowId,
        title: instanceData.title || '',
        description: instanceData.description || '',
        priority: instanceData.priority || 'medium',
        targetType: instanceData.target_type || '',
        targetId: instanceData.target_id || '',
        targetName: instanceData.target_name || '',
        context: instanceData.context || {},
        customData: instanceData.custom_data || {},
        tags: instanceData.tags || [],
        initiatorId: currentUser?.id || ''
      };
      
      const response = await collaborationService.startWorkflowInstance(startRequest);
      const newInstance = response.data;
      
      setInstances(prev => [newInstance, ...prev]);
      setShowInstanceDialog(false);
      setNewInstance({
        priority: 'medium',
        tags: []
      });
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'instance_created',
        instance: newInstance
      }));
      
    } catch (err) {
      setError('Failed to start workflow instance via backend');
      console.error('Instance start error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Approval Management Functions
  const submitApproval = async (instanceId: string, stageId: string, decision: string, comments: string, attachments: string[] = []) => {
    try {
      setIsProcessingAction(true);
      
      const approvalRequest = {
        instanceId,
        stageId,
        decision,
        comments,
        reasoning: comments,
        attachments,
        approverId: currentUser?.id || '',
        conditions: [],
        confidenceScore: decision === 'approved' ? 0.95 : 0.90
      };
      
      const response = await collaborationService.submitApproval(approvalRequest);
      const approval = response.data;
      
      setInstances(prev => prev.map(inst => 
        inst.id === instanceId 
          ? { ...inst, approvals: [...inst.approvals, approval] }
          : inst
      ));
      
      setApprovalComment('');
      setSelectedAction(null);
      
      // Send real-time update
      ws.current?.send(JSON.stringify({
        type: 'approval_submitted',
        instanceId,
        approval
      }));
      
    } catch (err) {
      setError('Failed to submit approval via backend');
      console.error('Approval submission error:', err);
    } finally {
      setIsProcessingAction(false);
    }
  };

  const delegateApproval = async (instanceId: string, stageId: string, delegateToId: string, reason: string) => {
    try {
      const delegateRequest = {
        instanceId,
        stageId,
        delegatedBy: currentUser?.id || '',
        delegatedTo: delegateToId,
        reason,
        comments: reason
      };
      
      const response = await collaborationService.delegateApproval(delegateRequest);
      const delegationRecord = response.data;
      
      setInstances(prev => prev.map(inst => 
        inst.id === instanceId 
          ? { 
              ...inst, 
              stage_history: inst.stage_history.map(stage => 
                stage.stage_id === stageId 
                  ? { ...stage, delegation_history: [...stage.delegation_history, delegationRecord] }
                  : stage
              )
            }
          : inst
      ));
      
    } catch (err) {
      setError('Failed to delegate approval via backend');
      console.error('Delegation error:', err);
    }
  };

  // Utility Functions
  const filteredInstances = useMemo(() => {
    return instances.filter(instance => {
      const matchesStatus = filterStatus === 'all' || instance.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || instance.priority === filterPriority;
      const matchesWorkflow = filterWorkflow === 'all' || instance.workflow_id === filterWorkflow;
      const matchesAssignee = filterAssignee === 'all' || 
        instance.stage_history.some(stage => stage.assigned_to.includes(filterAssignee));
      const matchesSearch = !searchTerm || 
        instance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.target_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesWorkflow && matchesAssignee && matchesSearch;
    }).sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [instances, filterStatus, filterPriority, filterWorkflow, filterAssignee, searchTerm, sortBy, sortOrder]);

  const getStatusColor = (status: string, type: 'workflow' | 'instance') => {
    if (type === 'workflow') {
      return WORKFLOW_STATUS_COLORS[status as keyof typeof WORKFLOW_STATUS_COLORS] || '#6b7280';
    } else {
      return INSTANCE_STATUS_COLORS[status as keyof typeof INSTANCE_STATUS_COLORS] || '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || '#6b7280';
  };

  const getDecisionColor = (decision: string) => {
    return DECISION_COLORS[decision as keyof typeof DECISION_COLORS] || '#6b7280';
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'active':
        return 'default';
      case 'pending':
      case 'in_progress':
      case 'draft':
        return 'secondary';
      case 'rejected':
      case 'cancelled':
      case 'suspended':
        return 'destructive';
      case 'escalated':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const isUserAssignedToStage = (instance: WorkflowInstance, stageId: string): boolean => {
    const stage = instance.stage_history.find(s => s.stage_id === stageId);
    return stage ? stage.assigned_to.includes(currentUser?.id || '') : false;
  };

  const getCurrentStageForUser = (instance: WorkflowInstance): StageExecution | null => {
    return instance.stage_history.find(stage => 
      stage.status === 'pending' && stage.assigned_to.includes(currentUser?.id || '')
    ) || null;
  };

  // Render Functions
  const renderInstanceCard = (instance: WorkflowInstance) => {
    const currentStage = getCurrentStageForUser(instance);
    const canTakeAction = currentStage && isUserAssignedToStage(instance, currentStage.stage_id);
    
    return (
      <Card key={instance.id} className={cn(
        "mb-4 transition-all duration-200 hover:shadow-md",
        selectedInstances.has(instance.id) && "ring-2 ring-blue-500",
        liveInstances.get(instance.id) && "ring-2 ring-green-500 animate-pulse"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedInstances.has(instance.id)}
                onCheckedChange={(checked) => {
                  const updated = new Set(selectedInstances);
                  if (checked) {
                    updated.add(instance.id);
                  } else {
                    updated.delete(instance.id);
                  }
                  setSelectedInstances(updated);
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant={getStatusBadgeVariant(instance.status)}
                    style={{ backgroundColor: getStatusColor(instance.status, 'instance') }}
                  >
                    {instance.status.replace('_', ' ')}
                  </Badge>
                  <Badge 
                    variant="outline"
                    style={{ borderColor: getPriorityColor(instance.priority), color: getPriorityColor(instance.priority) }}
                  >
                    {instance.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {instance.workflow_name}
                  </Badge>
                  {instance.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-base mb-1">
                  {instance.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {instance.target_name} • Created {formatTimeAgo(instance.created_at)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canTakeAction && (
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => submitApproval(instance.id, currentStage.stage_id, 'approved', approvalComment)}
                    disabled={isProcessingAction}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => submitApproval(instance.id, currentStage.stage_id, 'rejected', approvalComment)}
                    disabled={isProcessingAction}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedInstance(instance)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {canTakeAction && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Forward className="w-4 h-4 mr-2" />
                        Delegate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <History className="w-4 h-4 mr-2" />
                    View History
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm">
              {instance.description}
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(instance.progress_percentage)}%</span>
              </div>
              <Progress value={instance.progress_percentage} className="h-2" />
            </div>
            
            {/* Current Stage */}
            {currentStage && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Current Stage: {currentStage.stage_name}</span>
                </div>
                <p className="text-xs text-blue-700">
                  Assigned {formatTimeAgo(currentStage.started_at)}
                  {currentStage.sla_breached && (
                    <Badge variant="destructive" className="ml-2 text-xs">SLA Breached</Badge>
                  )}
                </p>
              </div>
            )}
            
            {/* SLA Status */}
            {instance.sla_status.time_remaining > 0 && (
              <div className={cn(
                "p-3 border rounded-md",
                instance.sla_status.is_breached 
                  ? "bg-red-50 border-red-200" 
                  : instance.sla_status.warning_triggered 
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-green-50 border-green-200"
              )}>
                <div className="flex items-center gap-2">
                  <Clock3 className={cn(
                    "w-4 h-4",
                    instance.sla_status.is_breached 
                      ? "text-red-600" 
                      : instance.sla_status.warning_triggered 
                        ? "text-yellow-600"
                        : "text-green-600"
                  )} />
                  <span className="text-sm font-medium">
                    {instance.sla_status.is_breached 
                      ? 'SLA Breached' 
                      : `${Math.floor(instance.sla_status.time_remaining / 60)} hours remaining`}
                  </span>
                </div>
              </div>
            )}
            
            {/* Recent Approvals */}
            {instance.approvals.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Recent Approvals</span>
                <div className="space-y-1">
                  {instance.approvals.slice(-3).map((approval) => (
                    <div key={approval.id} className="flex items-center gap-2 text-xs">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getDecisionColor(approval.decision) }}
                      />
                      <span className="font-medium">{approval.approver_name}</span>
                      <span className="text-muted-foreground">{approval.decision}</span>
                      <span className="text-muted-foreground">
                        {formatTimeAgo(approval.decision_date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Comments */}
            {instance.comments.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Recent Comments</span>
                <div className="space-y-2">
                  {instance.comments.slice(-2).map((comment) => (
                    <div key={comment.id} className="p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-xs">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Required Notice */}
            {canTakeAction && (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  This workflow is awaiting your approval on the {currentStage.stage_name} stage.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderInstancesTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search instances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterWorkflow} onValueChange={setFilterWorkflow}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <Layout className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedInstances.size > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(true)}
            >
              Actions ({selectedInstances.size})
            </Button>
          )}
          <Button variant="outline" onClick={loadWorkflowData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setShowInstanceDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Start Workflow
          </Button>
        </div>
      </div>

      {/* Instances List */}
      <div className="space-y-4">
        {filteredInstances.length === 0 ? (
          <div className="text-center py-12">
            <GitPullRequest className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Workflow Instances Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                ? 'No instances match your current filters' 
                : 'Start your first workflow instance to begin the review process'}
            </p>
            <Button onClick={() => setShowInstanceDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Start Workflow
            </Button>
          </div>
        ) : (
          filteredInstances.map(renderInstanceCard)
        )}
      </div>
    </div>
  );

  if (loading && workflows.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading workflow engine...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("h-full flex flex-col space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Workflow className="w-8 h-8 text-blue-500" />
              Review Workflow Engine
            </h1>
            <p className="text-muted-foreground">
              Advanced review workflow automation with approval processes, escalation management, and intelligent routing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <GitPullRequest className="w-3 h-3" />
              {instances.filter(i => i.status === 'pending' || i.status === 'in_progress').length} active
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {instances.filter(i => i.status === 'approved').length} approved
            </Badge>
            <Button variant="outline" onClick={loadWorkflowData} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            {mode === 'admin' && (
              <Button variant="outline">
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="instances">Instances</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="instances" className="mt-6">
            {renderInstancesTab()}
          </TabsContent>

          <TabsContent value="workflows" className="mt-6">
            <div className="text-center py-12">
              <Workflow className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Workflow Management</h3>
              <p className="text-muted-foreground">Workflow design and configuration features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Workflow Analytics</h3>
              <p className="text-muted-foreground">Advanced analytics and reporting features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Workflow Settings</h3>
              <p className="text-muted-foreground">Configuration and administration features coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Start Workflow Instance Dialog */}
        <Dialog open={showInstanceDialog} onOpenChange={setShowInstanceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start Workflow Instance</DialogTitle>
              <DialogDescription>
                Initiate a new workflow instance for review and approval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Workflow</Label>
                <Select 
                  value={newInstance.workflow_id || ''} 
                  onValueChange={(value) => setNewInstance(prev => ({ ...prev, workflow_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.filter(w => w.status === 'active').map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        {workflow.name} - {workflow.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newInstance.title || ''}
                    onChange={(e) => setNewInstance(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter instance title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={newInstance.priority || ''} 
                    onValueChange={(value) => setNewInstance(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newInstance.description || ''}
                  onChange={(e) => setNewInstance(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this workflow instance is for..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Type</Label>
                  <Select 
                    value={newInstance.target_type || ''} 
                    onValueChange={(value) => setNewInstance(prev => ({ ...prev, target_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Data Asset</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="change_request">Change Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Name</Label>
                  <Input
                    value={newInstance.target_name || ''}
                    onChange={(e) => setNewInstance(prev => ({ ...prev, target_name: e.target.value }))}
                    placeholder="Enter target name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="Enter tags separated by commas"
                  value={newInstance.tags?.join(', ') || ''}
                  onChange={(e) => setNewInstance(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInstanceDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => startWorkflowInstance(newInstance.workflow_id!, newInstance)} 
                disabled={isProcessingAction || !newInstance.workflow_id || !newInstance.title}
              >
                {isProcessingAction ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                Start Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}