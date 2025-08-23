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
  DropdownMenuSeparator, DropdownMenuLabel
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

import { Shield, UserCheck, Database, FileCheck, AlertTriangle, CheckCircle, XCircle, Clock, Users, Search, Filter, Plus, Edit, Trash2, Eye, Share2, Download, Upload, RefreshCw, MoreHorizontal, Star, Flag, Archive, Bookmark, Tag, Link, GitBranch, Network, Activity, Zap, Target, TrendingUp, BarChart3, PieChart, LineChart, Bell, Mail, Phone, Video, MessageCircle, Send, Paperclip, Image, File, Folder, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, PlayCircle, PauseCircle, StopCircle, SkipForward, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Copy, Save, ExternalLink, Minimize, Maximize, Grid, List, Layout, Layers, Map, Globe, Settings, Calendar as CalendarIcon, Crown, Award, Briefcase, ClipboardCheck, FileText, BookOpen, UserPlus, Users2, Building, Factory, Server, HardDrive, Cpu, MonitorSpeaker, Smartphone, Tablet, Laptop, Desktop, CloudUpload, CloudDownload, Cloud, Gauge, Workflow, BrainCircuit } from 'lucide-react';

import { 
  LineChart as RechartsLineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadialBarChart,
  RadialBar, ComposedChart, ScatterChart, Scatter
} from 'recharts';

import { format, subDays, parseISO, formatDistanceToNow, isWithinInterval, startOfDay, endOfDay, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

// Import backend services
import { collaborationService } from '../../services';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';
import { catalogQualityService } from '../../services/catalog-quality.service';
import { intelligentDiscoveryService } from '../../services/intelligent-discovery.service';
import { dataProfilingService } from '../../services/data-profiling.service';

// Import types
import { 
  DataStewardshipCenter as DataStewardshipCenterType,
  DataSteward,
  StewardshipRole,
  DataAssetOwnership,
  DataQualityReport,
  GovernanceWorkflow,
  StewardshipTask,
  TaskStatus,
  TaskPriority,
  AssetCertification,
  CertificationStatus,
  DataLineageValidation,
  ValidationStatus,
  StewardshipMetrics,
  QualityMetrics,
  ComplianceMetrics,
  AssetMetrics
} from '../../types/collaboration.types';

// ============================================================================
// ADVANCED DATA STEWARDSHIP TYPES
// ============================================================================

interface StewardshipDashboard {
  id: string;
  steward_id: string;
  overview: StewardshipOverview;
  assigned_assets: AssignedAsset[];
  quality_alerts: QualityAlert[];
  pending_tasks: StewardshipTask[];
  certifications: AssetCertification[];
  recommendations: StewardshipRecommendation[];
  performance_metrics: StewardPerformanceMetrics;
  activity_feed: StewardshipActivity[];
}

interface StewardshipOverview {
  total_assets: number;
  certified_assets: number;
  pending_reviews: number;
  quality_issues: number;
  compliance_score: number;
  stewardship_score: number;
  active_workflows: number;
  overdue_tasks: number;
}

interface AssignedAsset {
  id: string;
  name: string;
  type: 'table' | 'view' | 'schema' | 'database' | 'report' | 'dashboard';
  description: string;
  database: string;
  schema: string;
  owner: string;
  steward_id: string;
  assigned_date: string;
  last_reviewed: string;
  next_review: string;
  certification_status: CertificationStatus;
  quality_score: number;
  usage_frequency: 'high' | 'medium' | 'low';
  business_criticality: 'critical' | 'high' | 'medium' | 'low';
  data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
  tags: string[];
  lineage_completeness: number;
  documentation_completeness: number;
  quality_issues_count: number;
  compliance_status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'under_review';
}

interface QualityAlert {
  id: string;
  asset_id: string;
  asset_name: string;
  alert_type: 'data_quality' | 'schema_change' | 'access_anomaly' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detected_at: string;
  resolved_at?: string;
  assigned_to: string;
  status: 'new' | 'investigating' | 'in_progress' | 'resolved' | 'dismissed';
  impact_score: number;
  affected_users: number;
  resolution_time_sla: number;
  escalation_level: number;
}

interface StewardshipRecommendation {
  id: string;
  type: 'quality_improvement' | 'documentation_update' | 'certification_renewal' | 'lineage_validation';
  title: string;
  description: string;
  asset_id: string;
  asset_name: string;
  priority: TaskPriority;
  effort_estimate: string;
  expected_benefit: string;
  implementation_steps: string[];
  resources_required: string[];
  deadline: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
}

interface StewardPerformanceMetrics {
  assets_managed: number;
  certifications_completed: number;
  quality_improvements: number;
  tasks_completed: number;
  average_resolution_time: number;
  user_satisfaction_score: number;
  compliance_adherence: number;
  documentation_quality: number;
  collaboration_score: number;
  efficiency_rating: number;
}

interface StewardshipActivity {
  id: string;
  steward_id: string;
  activity_type: 'asset_reviewed' | 'quality_issue_resolved' | 'certification_granted' | 'documentation_updated' | 'workflow_completed';
  description: string;
  asset_id?: string;
  asset_name?: string;
  metadata: Record<string, any>;
  created_at: string;
  impact_score: number;
}

interface DataCurationWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'asset_onboarding' | 'quality_assessment' | 'certification_review' | 'documentation_review' | 'lineage_validation';
  status: 'draft' | 'active' | 'completed' | 'suspended' | 'archived';
  steps: CurationWorkflowStep[];
  assigned_assets: string[];
  stewards: string[];
  start_date: string;
  due_date: string;
  completion_date?: string;
  priority: TaskPriority;
  automation_level: 'manual' | 'semi_automated' | 'fully_automated';
  success_criteria: string[];
  deliverables: string[];
}

interface CurationWorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'review' | 'validation' | 'approval' | 'documentation' | 'testing';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  assigned_to: string;
  estimated_hours: number;
  actual_hours?: number;
  start_date: string;
  due_date: string;
  completion_date?: string;
  dependencies: string[];
  deliverables: StepDeliverable[];
  comments: WorkflowComment[];
}

interface StepDeliverable {
  id: string;
  name: string;
  type: 'document' | 'report' | 'certification' | 'approval' | 'validation';
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  url?: string;
  created_at: string;
  created_by: string;
}

interface WorkflowComment {
  id: string;
  step_id: string;
  author: string;
  content: string;
  type: 'comment' | 'question' | 'blocker' | 'suggestion';
  created_at: string;
  resolved: boolean;
}

interface AssetOwnershipTransfer {
  id: string;
  asset_id: string;
  asset_name: string;
  current_owner: string;
  new_owner: string;
  current_steward: string;
  new_steward: string;
  transfer_reason: string;
  justification: string;
  requested_by: string;
  requested_at: string;
  approved_by?: string;
  approved_at?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  transition_plan: TransitionPlan;
  knowledge_transfer: KnowledgeTransferPlan;
}

interface TransitionPlan {
  phases: TransitionPhase[];
  risk_mitigation: string[];
  rollback_plan: string;
  success_criteria: string[];
  stakeholder_communication: string[];
}

interface TransitionPhase {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  activities: string[];
  deliverables: string[];
  success_criteria: string[];
}

interface KnowledgeTransferPlan {
  documentation_handover: string[];
  training_sessions: TrainingSession[];
  shadowing_period: number; // days
  knowledge_validation: ValidationCriteria[];
  support_period: number; // days
}

interface TrainingSession {
  id: string;
  topic: string;
  duration: number; // minutes
  scheduled_date: string;
  attendees: string[];
  materials: string[];
  objectives: string[];
}

interface ValidationCriteria {
  id: string;
  description: string;
  validation_method: 'quiz' | 'practical' | 'observation' | 'peer_review';
  pass_criteria: string;
  completed: boolean;
}

interface DataGovernancePolicy {
  id: string;
  name: string;
  description: string;
  category: 'data_quality' | 'data_security' | 'data_privacy' | 'data_retention' | 'data_access';
  scope: PolicyScope;
  rules: PolicyRule[];
  enforcement_level: 'advisory' | 'warning' | 'blocking';
  steward_responsibilities: string[];
  violation_procedures: ViolationProcedure[];
  review_frequency: 'monthly' | 'quarterly' | 'yearly';
  last_reviewed: string;
  next_review: string;
  owner: string;
  approvers: string[];
  status: 'draft' | 'active' | 'deprecated' | 'archived';
}

interface PolicyScope {
  asset_types: string[];
  data_classifications: string[];
  business_units: string[];
  geographical_regions: string[];
  exceptions: PolicyException[];
}

interface PolicyRule {
  id: string;
  description: string;
  condition: string;
  action: 'allow' | 'deny' | 'require_approval' | 'log_access' | 'encrypt';
  parameters: Record<string, any>;
  monitoring_enabled: boolean;
}

interface ViolationProcedure {
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  immediate_actions: string[];
  notification_recipients: string[];
  escalation_timeline: string;
  remediation_steps: string[];
}

interface PolicyException {
  id: string;
  description: string;
  justification: string;
  expiry_date: string;
  approved_by: string;
  conditions: string[];
}

interface StewardshipTraining {
  id: string;
  title: string;
  description: string;
  category: 'data_governance' | 'quality_management' | 'compliance' | 'tools_training' | 'domain_knowledge';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // hours
  format: 'online' | 'in_person' | 'hybrid' | 'self_paced';
  prerequisites: string[];
  learning_objectives: string[];
  modules: TrainingModule[];
  assessments: TrainingAssessment[];
  certification_available: boolean;
  certification_validity: number; // months
  instructor: string;
  schedule: TrainingSchedule[];
  enrollment_limit?: number;
  cost?: number;
  materials: TrainingMaterial[];
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  content_type: 'video' | 'document' | 'interactive' | 'quiz' | 'hands_on';
  content_url: string;
  order: number;
  prerequisites: string[];
  learning_outcomes: string[];
}

interface TrainingAssessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'project' | 'practical_exam';
  pass_score: number;
  time_limit?: number; // minutes
  attempts_allowed: number;
  questions: AssessmentQuestion[];
  rubric?: AssessmentRubric;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'practical';
  options?: string[];
  correct_answer?: string;
  points: number;
  explanation?: string;
}

interface AssessmentRubric {
  criteria: RubricCriterion[];
  total_points: number;
  grading_scale: GradingScale[];
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: RubricLevel[];
}

interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

interface GradingScale {
  grade: string;
  min_percentage: number;
  max_percentage: number;
}

interface TrainingSchedule {
  id: string;
  start_date: string;
  end_date: string;
  timezone: string;
  sessions: TrainingSession[];
  location?: string;
  virtual_link?: string;
  capacity: number;
  enrolled_count: number;
}

interface TrainingMaterial {
  id: string;
  title: string;
  type: 'document' | 'video' | 'presentation' | 'tool' | 'template';
  url: string;
  description: string;
  downloadable: boolean;
  access_level: 'public' | 'enrolled' | 'certified';
}

interface DataStewardshipCenterProps {
  className?: string;
  stewardId?: string;
  onAssetAssigned?: (asset: AssignedAsset) => void;
  onTaskCompleted?: (task: StewardshipTask) => void;
  onCertificationGranted?: (certification: AssetCertification) => void;
}

// Color schemes and constants
const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

const QUALITY_COLORS = {
  excellent: '#10b981',
  good: '#84cc16',
  fair: '#f59e0b',
  poor: '#f97316',
  critical: '#ef4444'
};

const CERTIFICATION_STATUS_COLORS = {
  certified: '#10b981',
  pending: '#f59e0b',
  expired: '#ef4444',
  not_certified: '#6b7280'
};

const TASK_PRIORITY_COLORS = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
  urgent: '#dc2626'
};

export default function DataStewardshipCenter({ 
  className, 
  stewardId, 
  onAssetAssigned, 
  onTaskCompleted,
  onCertificationGranted 
}: DataStewardshipCenterProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [stewardshipCenter, setStewardshipCenter] = useState<DataStewardshipCenterType | null>(null);
  const [dashboard, setDashboard] = useState<StewardshipDashboard | null>(null);
  const [stewards, setStewards] = useState<DataSteward[]>([]);
  const [assignedAssets, setAssignedAssets] = useState<AssignedAsset[]>([]);
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  const [tasks, setTasks] = useState<StewardshipTask[]>([]);
  const [certifications, setCertifications] = useState<AssetCertification[]>([]);
  const [workflows, setWorkflows] = useState<DataCurationWorkflow[]>([]);
  const [recommendations, setRecommendations] = useState<StewardshipRecommendation[]>([]);
  const [ownershipTransfers, setOwnershipTransfers] = useState<AssetOwnershipTransfer[]>([]);
  const [policies, setPolicies] = useState<DataGovernancePolicy[]>([]);
  const [trainings, setTrainings] = useState<StewardshipTraining[]>([]);
  const [metrics, setMetrics] = useState<StewardshipMetrics | null>(null);
  
  // UI States
  const [selectedAsset, setSelectedAsset] = useState<AssignedAsset | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<QualityAlert | null>(null);
  const [selectedTask, setSelectedTask] = useState<StewardshipTask | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<DataCurationWorkflow | null>(null);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showCertificationDialog, setShowCertificationDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showTrainingDialog, setShowTrainingDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  // Form States
  const [newAsset, setNewAsset] = useState<Partial<AssignedAsset>>({});
  const [newTask, setNewTask] = useState<Partial<StewardshipTask>>({});
  const [newCertification, setNewCertification] = useState<Partial<AssetCertification>>({});
  const [newWorkflow, setNewWorkflow] = useState<Partial<DataCurationWorkflow>>({});
  const [newTransfer, setNewTransfer] = useState<Partial<AssetOwnershipTransfer>>({});
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadStewardshipData();
    setupRealTimeUpdates();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [stewardId]);

  const loadStewardshipData = async () => {
    setLoading(true);
    try {
      // Load stewardship center data from backend
      const centerResponse = stewardId 
        ? await collaborationService.getDataStewardshipCenter(stewardId)
        : await collaborationService.getDefaultStewardshipCenter();
      const centerData = centerResponse.data;
      
      // Load stewardship dashboard data from backend
      const dashboardResponse = await collaborationService.getStewardshipDashboard(centerData.id);
      const dashboardData = dashboardResponse.data;
      
      // Load data stewards from backend
      const stewardsResponse = await collaborationService.getDataStewards({
        limit: 100,
        includeMetrics: true
      });
      const stewardsData = stewardsResponse.data || [];
      
      // Load assigned assets from backend
      const assetsResponse = await collaborationService.getAssignedAssets(centerData.id, {
        stewardId: stewardId,
        includeMetrics: true,
        includeQualityData: true
      });
      const assetsData = assetsResponse.data || [];
      
      // Load quality alerts from backend
      const alertsResponse = await catalogQualityService.getQualityAlerts({
        stewardId: stewardId,
        status: ['new', 'investigating', 'in_progress'],
        limit: 50
      });
      const alertsData = alertsResponse.data || [];
      
      // Load stewardship tasks from backend
      const tasksResponse = await collaborationService.getStewardshipTasks({
        stewardId: stewardId,
        status: ['pending', 'in_progress'],
        includeOverdue: true,
        limit: 100
      });
      const tasksData = tasksResponse.data || [];
      
      // Load asset certifications from backend
      const certificationsResponse = await enterpriseCatalogService.getAssetCertifications({
        stewardId: stewardId,
        includeExpiring: true,
        limit: 100
      });
      const certificationsData = certificationsResponse.data || [];
      
      // Load curation workflows from backend
      const workflowsResponse = await collaborationService.getCurationWorkflows({
        stewardId: stewardId,
        status: ['active', 'pending'],
        limit: 50
      });
      const workflowsData = workflowsResponse.data || [];
      
      // Load stewardship recommendations from backend
      const recommendationsResponse = await intelligentDiscoveryService.getStewardshipRecommendations({
        stewardId: stewardId,
        types: ['quality_improvement', 'documentation_update', 'certification_renewal'],
        limit: 20
      });
      const recommendationsData = recommendationsResponse.data || [];
      
      // Load ownership transfer requests from backend
      const transfersResponse = await collaborationService.getOwnershipTransfers({
        stewardId: stewardId,
        status: ['pending', 'approved'],
        limit: 30
      });
      const transfersData = transfersResponse.data || [];
      
      // Load governance policies from backend
      const policiesResponse = await enterpriseCatalogService.getGovernancePolicies({
        scope: 'stewardship',
        status: 'active',
        limit: 50
      });
      const policiesData = policiesResponse.data || [];
      
      // Load stewardship training programs from backend
      const trainingsResponse = await collaborationService.getStewardshipTrainings({
        categories: ['data_governance', 'quality_management', 'compliance'],
        enrollmentOpen: true,
        limit: 20
      });
      const trainingsData = trainingsResponse.data || [];
      
      // Load stewardship metrics from backend
      const metricsResponse = await collaborationService.getStewardshipMetrics({
        stewardId: stewardId,
        timeRange: dateRange,
        includeComparisons: true
      });
      const metricsData = metricsResponse.data;
      
      setStewardshipCenter(centerData);
      setDashboard(dashboardData);
      setStewards(stewardsData);
      setAssignedAssets(assetsData);
      setQualityAlerts(alertsData);
      setTasks(tasksData);
      setCertifications(certificationsData);
      setWorkflows(workflowsData);
      setRecommendations(recommendationsData);
      setOwnershipTransfers(transfersData);
      setPolicies(policiesData);
      setTrainings(trainingsData);
      setMetrics(metricsData);
      
    } catch (err) {
      setError('Failed to load stewardship data from backend');
      console.error('Error loading stewardship data:', err);
      
      // Fallback to empty states
      setStewardshipCenter(null);
      setDashboard(null);
      setStewards([]);
      setAssignedAssets([]);
      setQualityAlerts([]);
      setTasks([]);
      setCertifications([]);
      setWorkflows([]);
      setRecommendations([]);
      setOwnershipTransfers([]);
      setPolicies([]);
      setTrainings([]);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadStewardshipData();
    }, 30000);
    
    // WebSocket connection for real-time stewardship updates
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/stewardship/${stewardId || 'default'}`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      };
      
      ws.current.onopen = () => {
        console.log('Stewardship WebSocket connected');
      };
      
      ws.current.onerror = (error) => {
        console.error('Stewardship WebSocket error:', error);
      };
    } catch (err) {
      console.warn('WebSocket connection failed:', err);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    switch (data.type) {
      case 'quality_alert':
        setQualityAlerts(prev => [data.alert, ...prev]);
        break;
      case 'task_assigned':
        setTasks(prev => [data.task, ...prev]);
        break;
      case 'asset_certified':
        setCertifications(prev => prev.map(cert => 
          cert.asset_id === data.certification.asset_id ? data.certification : cert
        ));
        break;
      case 'workflow_updated':
        setWorkflows(prev => prev.map(workflow => 
          workflow.id === data.workflow.id ? { ...workflow, ...data.workflow } : workflow
        ));
        break;
      case 'ownership_transfer':
        setOwnershipTransfers(prev => [data.transfer, ...prev]);
        break;
      case 'recommendation_generated':
        setRecommendations(prev => [data.recommendation, ...prev]);
        break;
    }
  };

  // Asset Management Functions
  const assignAsset = async (assetData: Partial<AssignedAsset>) => {
    try {
      setLoading(true);
      
      const assignRequest = {
        assetId: assetData.id || '',
        stewardId: stewardId || '',
        assignmentReason: 'Manual assignment',
        reviewFrequency: 'quarterly',
        businessCriticality: assetData.business_criticality || 'medium',
        dataClassification: assetData.data_classification || 'internal'
      };
      
      const response = await collaborationService.assignAssetToSteward(assignRequest);
      const assignedAsset = response.data;
      
      setAssignedAssets(prev => [...prev, assignedAsset]);
      setShowAssetDialog(false);
      setNewAsset({});
      
      onAssetAssigned?.(assignedAsset);
    } catch (err) {
      setError('Failed to assign asset via backend');
      console.error('Asset assignment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const certifyAsset = async (assetId: string, certificationData: Partial<AssetCertification>) => {
    try {
      const certifyRequest = {
        assetId,
        stewardId: stewardId || '',
        certificationType: certificationData.certification_type || 'quality_approved',
        validityPeriod: certificationData.validity_period || 365,
        criteria: certificationData.criteria || [],
        notes: certificationData.notes || '',
        requiredReviews: certificationData.required_reviews || 1
      };
      
      const response = await enterpriseCatalogService.certifyAsset(certifyRequest);
      const certification = response.data;
      
      setCertifications(prev => [...prev, certification]);
      
      // Update asset certification status
      setAssignedAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, certification_status: 'certified' as CertificationStatus }
          : asset
      ));
      
      onCertificationGranted?.(certification);
    } catch (err) {
      setError('Failed to certify asset via backend');
      console.error('Asset certification error:', err);
    }
  };

  // Task Management Functions
  const createTask = async (taskData: Partial<StewardshipTask>) => {
    try {
      const createRequest = {
        title: taskData.title || '',
        description: taskData.description || '',
        type: taskData.type || 'review',
        priority: taskData.priority || 'medium',
        assigneeId: taskData.assignee_id || stewardId || '',
        assetId: taskData.asset_id,
        dueDate: taskData.due_date || addDays(new Date(), 7).toISOString(),
        estimatedHours: taskData.estimated_hours || 1,
        tags: taskData.tags || []
      };
      
      const response = await collaborationService.createStewardshipTask(createRequest);
      const newTask = response.data;
      
      setTasks(prev => [...prev, newTask]);
      setShowTaskDialog(false);
      setNewTask({});
    } catch (err) {
      setError('Failed to create task via backend');
      console.error('Task creation error:', err);
    }
  };

  const completeTask = async (taskId: string, completionData?: any) => {
    try {
      const completeRequest = {
        taskId,
        status: 'completed' as TaskStatus,
        completionNotes: completionData?.notes || '',
        actualHours: completionData?.actualHours,
        deliverables: completionData?.deliverables || []
      };
      
      const response = await collaborationService.updateTaskStatus(completeRequest);
      const updatedTask = response.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      
      onTaskCompleted?.(updatedTask);
    } catch (err) {
      setError('Failed to complete task via backend');
      console.error('Task completion error:', err);
    }
  };

  // Quality Alert Management Functions
  const resolveAlert = async (alertId: string, resolutionData: any) => {
    try {
      const resolveRequest = {
        alertId,
        resolution: resolutionData.resolution || '',
        actions_taken: resolutionData.actionsTaken || [],
        preventive_measures: resolutionData.preventiveMeasures || [],
        resolver_id: stewardId || ''
      };
      
      const response = await catalogQualityService.resolveQualityAlert(resolveRequest);
      const resolvedAlert = response.data;
      
      setQualityAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved', resolved_at: new Date().toISOString() } : alert
      ));
    } catch (err) {
      setError('Failed to resolve alert via backend');
      console.error('Alert resolution error:', err);
    }
  };

  // Workflow Management Functions
  const createWorkflow = async (workflowData: Partial<DataCurationWorkflow>) => {
    try {
      const createRequest = {
        name: workflowData.name || '',
        description: workflowData.description || '',
        type: workflowData.type || 'asset_onboarding',
        priority: workflowData.priority || 'medium',
        assignedAssets: workflowData.assigned_assets || [],
        stewards: workflowData.stewards || [stewardId || ''],
        dueDate: workflowData.due_date || addDays(new Date(), 30).toISOString(),
        automationLevel: workflowData.automation_level || 'semi_automated',
        successCriteria: workflowData.success_criteria || []
      };
      
      const response = await collaborationService.createCurationWorkflow(createRequest);
      const newWorkflow = response.data;
      
      setWorkflows(prev => [...prev, newWorkflow]);
      setShowWorkflowDialog(false);
      setNewWorkflow({});
    } catch (err) {
      setError('Failed to create workflow via backend');
      console.error('Workflow creation error:', err);
    }
  };

  // Ownership Transfer Functions
  const requestOwnershipTransfer = async (transferData: Partial<AssetOwnershipTransfer>) => {
    try {
      const transferRequest = {
        assetId: transferData.asset_id || '',
        newOwner: transferData.new_owner || '',
        newSteward: transferData.new_steward || '',
        reason: transferData.transfer_reason || '',
        justification: transferData.justification || '',
        transitionPlan: transferData.transition_plan || { phases: [], risk_mitigation: [], rollback_plan: '', success_criteria: [], stakeholder_communication: [] },
        knowledgeTransferPlan: transferData.knowledge_transfer || { documentation_handover: [], training_sessions: [], shadowing_period: 7, knowledge_validation: [], support_period: 14 }
      };
      
      const response = await collaborationService.requestOwnershipTransfer(transferRequest);
      const newTransfer = response.data;
      
      setOwnershipTransfers(prev => [...prev, newTransfer]);
      setShowTransferDialog(false);
      setNewTransfer({});
    } catch (err) {
      setError('Failed to request ownership transfer via backend');
      console.error('Transfer request error:', err);
    }
  };

  // Filter and Search Functions
  const filteredAssets = useMemo(() => {
    return assignedAssets.filter(asset => {
      const matchesType = filterType === 'all' || asset.type === filterType;
      const matchesStatus = filterStatus === 'all' || asset.certification_status === filterStatus;
      const matchesSearch = !searchTerm || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [assignedAssets, filterType, filterStatus, searchTerm]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesPriority && matchesStatus && matchesSearch;
    });
  }, [tasks, filterPriority, filterStatus, searchTerm]);

  const filteredAlerts = useMemo(() => {
    return qualityAlerts.filter(alert => {
      const matchesType = filterType === 'all' || alert.alert_type === filterType;
      const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
      const matchesSearch = !searchTerm || 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.asset_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [qualityAlerts, filterType, filterStatus, searchTerm]);

  // Utility Functions
  const getQualityColor = (score: number) => {
    if (score >= 90) return QUALITY_COLORS.excellent;
    if (score >= 80) return QUALITY_COLORS.good;
    if (score >= 70) return QUALITY_COLORS.fair;
    if (score >= 60) return QUALITY_COLORS.poor;
    return QUALITY_COLORS.critical;
  };

  const getCertificationStatusColor = (status: CertificationStatus) => {
    return CERTIFICATION_STATUS_COLORS[status] || '#6b7280';
  };

  const getTaskPriorityColor = (priority: TaskPriority) => {
    return TASK_PRIORITY_COLORS[priority] || '#6b7280';
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'certified':
      case 'completed':
      case 'resolved':
        return 'default';
      case 'pending':
      case 'in_progress':
      case 'investigating':
        return 'secondary';
      case 'expired':
      case 'failed':
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Render Functions
  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Assets</p>
                <p className="text-2xl font-bold">{dashboard?.overview.total_assets || 0}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certified Assets</p>
                <p className="text-2xl font-bold">{dashboard?.overview.certified_assets || 0}</p>
              </div>
              <Crown className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quality Issues</p>
                <p className="text-2xl font-bold">{dashboard?.overview.quality_issues || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stewardship Score</p>
                <p className="text-2xl font-bold">{dashboard?.overview.stewardship_score || 0}%</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stewardship Metrics Charts */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Quality Trends</CardTitle>
              <CardDescription>Quality scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={metrics.quality_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="average_score" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="certified_assets" stroke="#10b981" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certification Status Distribution</CardTitle>
              <CardDescription>Current certification status of all assets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={metrics.certification_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.certification_distribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Priority Alerts and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Priority Quality Alerts
            </CardTitle>
            <CardDescription>High and critical quality issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {filteredAlerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical').slice(0, 10).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                       onClick={() => setSelectedAlert(alert)}>
                    <div className="flex-shrink-0">
                      <AlertTriangle className={cn(
                        "w-4 h-4",
                        alert.severity === 'critical' ? "text-red-500" : "text-orange-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.asset_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusBadgeVariant(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(alert.detected_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Upcoming and overdue stewardship tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {filteredTasks.filter(task => task.status === 'pending' || task.status === 'in_progress').slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                       onClick={() => setSelectedTask(task)}>
                    <div className="flex-shrink-0">
                      <ClipboardCheck className={cn(
                        "w-4 h-4",
                        task.priority === 'high' || task.priority === 'critical' ? "text-red-500" : "text-blue-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusBadgeVariant(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Due {format(parseISO(task.due_date), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-500" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Intelligent suggestions for improving data stewardship</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 6).map((recommendation) => (
              <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {recommendation.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(recommendation.priority)} className="text-xs">
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {recommendation.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{recommendation.asset_name}</span>
                    <span>{recommendation.effort_estimate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAssetsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="table">Tables</SelectItem>
              <SelectItem value="view">Views</SelectItem>
              <SelectItem value="schema">Schemas</SelectItem>
              <SelectItem value="database">Databases</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
              <SelectItem value="dashboard">Dashboards</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by certification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="certified">Certified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="not_certified">Not Certified</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadStewardshipData} disabled={loading}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button onClick={() => setShowAssetDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Assign Asset
          </Button>
        </div>
      </div>

      {/* Assets Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{asset.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {asset.database}.{asset.schema}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => certifyAsset(asset.id, {})}>
                        <Crown className="w-4 h-4 mr-2" />
                        Certify Asset
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Asset
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{asset.type}</Badge>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCertificationStatusColor(asset.certification_status) }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quality Score</span>
                      <span className="font-medium" style={{ color: getQualityColor(asset.quality_score) }}>
                        {asset.quality_score}%
                      </span>
                    </div>
                    <Progress value={asset.quality_score} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Criticality</p>
                      <Badge variant="outline" className="text-xs">
                        {asset.business_criticality}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Classification</p>
                      <Badge variant="outline" className="text-xs">
                        {asset.data_classification}
                      </Badge>
                    </div>
                  </div>
                  
                  {asset.quality_issues_count > 0 && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription className="text-sm">
                        {asset.quality_issues_count} quality issues need attention
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Last reviewed {formatTimeAgo(asset.last_reviewed)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Last Reviewed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">{asset.database}.{asset.schema}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={asset.quality_score} className="w-16 h-2" />
                        <span className="text-sm" style={{ color: getQualityColor(asset.quality_score) }}>
                          {asset.quality_score}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(asset.certification_status)}>
                        {asset.certification_status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {asset.quality_issues_count > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {asset.quality_issues_count}
                        </Badge>
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatTimeAgo(asset.last_reviewed)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedAsset(asset)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => certifyAsset(asset.id, {})}
                        >
                          <Crown className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Assets Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'No assets match your current filters' 
              : 'No assets have been assigned for stewardship'}
          </p>
          <Button onClick={() => setShowAssetDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Assign Asset
          </Button>
        </div>
      )}
    </div>
  );

  if (loading && !stewardshipCenter) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading stewardship center...</p>
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
              <Shield className="w-8 h-8 text-blue-500" />
              Data Stewardship Center
            </h1>
            <p className="text-muted-foreground">
              Advanced data stewardship with asset ownership management, quality monitoring, and governance workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              {stewards.filter(s => s.status === 'active').length} active stewards
            </Badge>
            <Button variant="outline" onClick={loadStewardshipData} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            {renderDashboardTab()}
          </TabsContent>

          <TabsContent value="assets" className="mt-6">
            {renderAssetsTab()}
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div className="text-center py-12">
              <ClipboardCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Task Management</h3>
              <p className="text-muted-foreground">Stewardship task management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Quality Alerts</h3>
              <p className="text-muted-foreground">Quality alert management features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="mt-6">
            <div className="text-center py-12">
              <Workflow className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Curation Workflows</h3>
              <p className="text-muted-foreground">Data curation workflow features coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="training" className="mt-6">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Stewardship Training</h3>
              <p className="text-muted-foreground">Training and certification features coming soon</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Asset Assignment Dialog */}
        <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Asset for Stewardship</DialogTitle>
              <DialogDescription>
                Assign a data asset to a steward for quality monitoring and governance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-name">Asset Name</Label>
                  <Input
                    id="asset-name"
                    value={newAsset.name || ''}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter asset name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asset-type">Asset Type</Label>
                  <Select 
                    value={newAsset.type || ''} 
                    onValueChange={(value) => setNewAsset(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="schema">Schema</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-description">Description</Label>
                <Textarea
                  id="asset-description"
                  value={newAsset.description || ''}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the asset and its business purpose"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-criticality">Business Criticality</Label>
                  <Select 
                    value={newAsset.business_criticality || ''} 
                    onValueChange={(value) => setNewAsset(prev => ({ ...prev, business_criticality: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select criticality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-classification">Data Classification</Label>
                  <Select 
                    value={newAsset.data_classification || ''} 
                    onValueChange={(value) => setNewAsset(prev => ({ ...prev, data_classification: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssetDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => assignAsset(newAsset)} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Asset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}