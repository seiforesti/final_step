'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { 
  ChevronDown,
  ChevronRight,
  Settings,
  Shield,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Database,
  Network,
  Zap,
  Brain,
  Activity,
  BarChart3,
  TrendingUp,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Plus,
  Minus,
  Copy,
  Share,
  Star,
  Flag,
  Mail,
  Bell,
  Calendar,
  MapPin,
  Tag,
  Link,
  ExternalLink,
  GitBranch,
  GitMerge,
  GitCommit,
  Workflow,
  Layers,
  TreePine,
  Gauge,
  Target,
  Award,
  Crown,
  Sparkles,
  Lightbulb,
  Rocket,
  Globe,
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  UserCheck,
  UserX,
  Users2,
  Building,
  Factory,
  Server,
  HardDrive,
  Cpu,
  Memory,
  MonitorSpeaker,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  CloudUpload,
  CloudDownload,
  Cloud
} from 'lucide-react';

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  RadialBarChart, 
  RadialBar, 
  ComposedChart 
} from 'recharts';

import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Import backend services
import { advancedLineageService } from '../../services/advanced-lineage.service';
import { collaborationService } from '../../services/collaboration.service';
import { enterpriseCatalogService } from '../../services/enterprise-catalog.service';

// Advanced Types for Lineage Governance
interface LineageGovernancePolicy {
  id: string;
  name: string;
  description: string;
  category: 'data_quality' | 'compliance' | 'security' | 'access_control' | 'retention' | 'classification';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  rules: LineageRule[];
  enforcement: 'automatic' | 'manual' | 'hybrid';
  scope: LineageScope;
  created_at: string;
  updated_at: string;
  created_by: string;
  approvers: string[];
  violations: number;
  compliance_score: number;
}

interface LineageRule {
  id: string;
  type: 'validation' | 'transformation' | 'access' | 'retention' | 'audit';
  condition: string;
  action: 'allow' | 'deny' | 'flag' | 'transform' | 'audit';
  parameters: Record<string, any>;
  enabled: boolean;
}

interface LineageScope {
  data_sources: string[];
  schemas: string[];
  tables: string[];
  columns: string[];
  transformations: string[];
  users: string[];
  roles: string[];
}

interface GovernanceWorkflow {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'review' | 'certification' | 'remediation' | 'audit';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  reviewer: string;
  approver: string;
  due_date: string;
  steps: WorkflowStep[];
  lineage_items: string[];
  progress: number;
  created_at: string;
  updated_at: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automatic' | 'review' | 'approval';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  assignee: string;
  due_date: string;
  dependencies: string[];
  conditions: string[];
  actions: StepAction[];
  comments: Comment[];
  attachments: Attachment[];
}

interface StepAction {
  id: string;
  type: 'validate' | 'transform' | 'notify' | 'approve' | 'reject' | 'escalate';
  parameters: Record<string, any>;
  result?: any;
  executed_at?: string;
  executed_by?: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  created_at: string;
  type: 'comment' | 'question' | 'suggestion' | 'concern';
  resolved: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface ComplianceReport {
  id: string;
  name: string;
  framework: string;
  score: number;
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'under_review';
  violations: ComplianceViolation[];
  recommendations: string[];
  last_assessment: string;
  next_assessment: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceViolation {
  id: string;
  policy_id: string;
  rule_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  lineage_path: string[];
  detected_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  impact_score: number;
}

interface LineageAuditLog {
  id: string;
  event_type: 'access' | 'modification' | 'deletion' | 'creation' | 'policy_violation' | 'workflow_action';
  user_id: string;
  resource_id: string;
  resource_type: string;
  action: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  risk_score: number;
}

interface GovernanceDashboard {
  overview: {
    total_policies: number;
    active_workflows: number;
    compliance_score: number;
    violations_count: number;
    risk_level: string;
  };
  trends: {
    compliance_trends: Array<{ date: string; score: number; violations: number }>;
    workflow_trends: Array<{ date: string; completed: number; pending: number; failed: number }>;
    policy_effectiveness: Array<{ policy: string; effectiveness: number; violations: number }>;
  };
  alerts: Array<{
    id: string;
    type: 'violation' | 'workflow' | 'policy' | 'audit';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

interface LineageGovernanceProps {
  className?: string;
  onPolicyChange?: (policy: LineageGovernancePolicy) => void;
  onWorkflowAction?: (workflowId: string, action: string) => void;
  onComplianceCheck?: (scope: LineageScope) => void;
}

// Color schemes for different data types
const SEVERITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444'
};

const STATUS_COLORS = {
  active: '#10b981',
  inactive: '#6b7280',
  draft: '#3b82f6',
  deprecated: '#ef4444',
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#10b981',
  failed: '#ef4444',
  cancelled: '#6b7280'
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export default function LineageGovernance({ 
  className, 
  onPolicyChange, 
  onWorkflowAction, 
  onComplianceCheck 
}: LineageGovernanceProps) {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [policies, setPolicies] = useState<LineageGovernancePolicy[]>([]);
  const [workflows, setWorkflows] = useState<GovernanceWorkflow[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<LineageAuditLog[]>([]);
  const [dashboard, setDashboard] = useState<GovernanceDashboard | null>(null);
  
  // UI States
  const [selectedPolicy, setSelectedPolicy] = useState<LineageGovernancePolicy | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<GovernanceWorkflow | null>(null);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form States
  const [newPolicy, setNewPolicy] = useState<Partial<LineageGovernancePolicy>>({});
  const [newWorkflow, setNewWorkflow] = useState<Partial<GovernanceWorkflow>>({});
  
  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Data Loading and Real-time Updates
  useEffect(() => {
    loadGovernanceData();
    setupRealTimeUpdates();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const loadGovernanceData = async () => {
    setLoading(true);
    try {
      // Load governance policies from backend
      const policiesResponse = await advancedLineageService.getLineageGovernancePolicies();
      const policiesData = policiesResponse.data || [];
      
      // Transform backend data to frontend format
      const transformedPolicies: LineageGovernancePolicy[] = policiesData.map((policy: any) => ({
        id: policy.id,
        name: policy.name,
        description: policy.description,
        category: policy.category || 'data_quality',
        severity: policy.severity || 'medium',
        status: policy.status || 'active',
        rules: policy.rules || [],
        enforcement: policy.enforcement || 'automatic',
        scope: policy.scope || { data_sources: [], schemas: [], tables: [], columns: [], transformations: [], users: [], roles: [] },
        created_at: policy.created_at,
        updated_at: policy.updated_at,
        created_by: policy.created_by,
        approvers: policy.approvers || [],
        violations: policy.violations_count || 0,
        compliance_score: policy.compliance_score || 100
      }));

      // Load collaboration workflows from backend
      const workflowsResponse = await collaborationService.getActiveWorkflows();
      const workflowsData = workflowsResponse.data || [];
      
      const transformedWorkflows: GovernanceWorkflow[] = workflowsData.map((workflow: any) => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        type: workflow.workflow_type || 'approval',
        status: workflow.status,
        priority: workflow.priority || 'medium',
        assignee: workflow.assignee_id,
        reviewer: workflow.reviewer_id,
        approver: workflow.approver_id,
        due_date: workflow.due_date,
        steps: workflow.steps || [],
        lineage_items: workflow.lineage_items || [],
        progress: workflow.progress_percentage || 0,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at
      }));

      // Load dashboard metrics from backend
      const metricsResponse = await advancedLineageService.getLineageMetrics();
      const metrics = metricsResponse.data || {};
      
      // Load compliance status from backend
      const complianceResponse = await advancedLineageService.getComplianceStatus('all');
      const compliance = complianceResponse.data || {};
      
      // Load lineage statistics for trends
      const timeRange = {
        start: subDays(new Date(), 7),
        end: new Date()
      };
      const statsResponse = await advancedLineageService.getLineageStatistics(timeRange);
      const stats = statsResponse.data || {};

      const transformedDashboard: GovernanceDashboard = {
        overview: {
          total_policies: transformedPolicies.length,
          active_workflows: transformedWorkflows.filter(w => w.status === 'in_progress').length,
          compliance_score: compliance.overallStatus?.complianceScore || 0,
          violations_count: compliance.violations?.length || 0,
          risk_level: compliance.overallStatus?.level?.toLowerCase() || 'low'
        },
        trends: {
          compliance_trends: stats.compliance_trends || [],
          workflow_trends: stats.workflow_trends || [],
          policy_effectiveness: stats.policy_effectiveness || []
        },
        alerts: compliance.violations?.slice(0, 5).map((violation: any) => ({
          id: violation.id,
          type: 'violation' as const,
          severity: violation.severity,
          message: violation.description,
          timestamp: violation.detected_at,
          resolved: !!violation.resolved_at
        })) || []
      };
      
      // Load compliance reports from backend
      const reportsResponse = await enterpriseCatalogService.getComplianceReports();
      const reports = reportsResponse.data || [];
      
      // Load audit logs from backend
      const auditResponse = await enterpriseCatalogService.getAuditLogs({
        limit: 100,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });
      const audits = auditResponse.data || [];
      
      setPolicies(transformedPolicies);
      setWorkflows(transformedWorkflows);
      setDashboard(transformedDashboard);
      setComplianceReports(reports);
      setAuditLogs(audits);
    } catch (err) {
      setError('Failed to load governance data from backend');
      console.error('Error loading governance data:', err);
      
      // Fallback to minimal data structure
      setPolicies([]);
      setWorkflows([]);
      setDashboard({
        overview: { total_policies: 0, active_workflows: 0, compliance_score: 0, violations_count: 0, risk_level: 'unknown' },
        trends: { compliance_trends: [], workflow_trends: [], policy_effectiveness: [] },
        alerts: []
      });
      setComplianceReports([]);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Auto-refresh every 30 seconds
    refreshInterval.current = setInterval(() => {
      loadGovernanceData();
    }, 30000);
  };

  // Policy Management Functions
  const createPolicy = async (policyData: Partial<LineageGovernancePolicy>) => {
    try {
      // Create policy via backend API
      const createRequest = {
        name: policyData.name || '',
        description: policyData.description || '',
        category: policyData.category || 'data_quality',
        severity: policyData.severity || 'medium',
        enforcement: policyData.enforcement || 'automatic',
        rules: policyData.rules || [],
        scope: policyData.scope || { data_sources: [], schemas: [], tables: [], columns: [], transformations: [], users: [], roles: [] }
      };
      
      const response = await enterpriseCatalogService.createGovernancePolicy(createRequest);
      const newPolicy = response.data;
      
      const newPolicyItem: LineageGovernancePolicy = {
        ...newPolicy,
        violations: 0,
        compliance_score: 100
      };
      
      setPolicies(prev => [...prev, newPolicyItem]);
      setShowPolicyDialog(false);
      setNewPolicy({});
      onPolicyChange?.(newPolicyItem);
    } catch (err) {
      setError('Failed to create policy via backend');
      console.error('Policy creation error:', err);
    }
  };

  const updatePolicy = async (policyId: string, updates: Partial<LineageGovernancePolicy>) => {
    try {
      // Update policy via backend API
      const updateRequest = {
        name: updates.name,
        description: updates.description,
        category: updates.category,
        severity: updates.severity,
        status: updates.status,
        enforcement: updates.enforcement,
        rules: updates.rules,
        scope: updates.scope
      };
      
      const response = await enterpriseCatalogService.updateGovernancePolicy(policyId, updateRequest);
      const updatedPolicy = response.data;
      
      setPolicies(prev => prev.map(p => 
        p.id === policyId ? { ...p, ...updatedPolicy, updated_at: new Date().toISOString() } : p
      ));
    } catch (err) {
      setError('Failed to update policy via backend');
      console.error('Policy update error:', err);
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      // Delete policy via backend API
      await enterpriseCatalogService.deleteGovernancePolicy(policyId);
      setPolicies(prev => prev.filter(p => p.id !== policyId));
    } catch (err) {
      setError('Failed to delete policy via backend');
      console.error('Policy deletion error:', err);
    }
  };

  // Workflow Management Functions
  const createWorkflow = async (workflowData: Partial<GovernanceWorkflow>) => {
    try {
      // Create workflow via backend API
      const createRequest = {
        name: workflowData.name || '',
        description: workflowData.description || '',
        workflow_type: workflowData.type || 'approval',
        priority: workflowData.priority || 'medium',
        assignee_id: workflowData.assignee || '',
        reviewer_id: workflowData.reviewer || '',
        approver_id: workflowData.approver || '',
        due_date: workflowData.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lineage_items: workflowData.lineage_items || []
      };
      
      const response = await collaborationService.createWorkflow(createRequest);
      const newWorkflow = response.data;
      
      const newWorkflowItem: GovernanceWorkflow = {
        id: newWorkflow.id,
        name: newWorkflow.name,
        description: newWorkflow.description,
        type: newWorkflow.workflow_type,
        status: newWorkflow.status,
        priority: newWorkflow.priority,
        assignee: newWorkflow.assignee_id,
        reviewer: newWorkflow.reviewer_id,
        approver: newWorkflow.approver_id,
        due_date: newWorkflow.due_date,
        steps: newWorkflow.steps || [],
        lineage_items: newWorkflow.lineage_items || [],
        progress: newWorkflow.progress_percentage || 0,
        created_at: newWorkflow.created_at,
        updated_at: newWorkflow.updated_at
      };
      
      setWorkflows(prev => [...prev, newWorkflowItem]);
      setShowWorkflowDialog(false);
      setNewWorkflow({});
    } catch (err) {
      setError('Failed to create workflow via backend');
      console.error('Workflow creation error:', err);
    }
  };

  const executeWorkflowAction = async (workflowId: string, action: string, data?: any) => {
    try {
      // Execute workflow action via backend API
      const actionRequest = {
        action,
        data: data || {},
        notes: data?.notes || ''
      };
      
      const response = await collaborationService.executeWorkflowAction(workflowId, actionRequest);
      const updatedWorkflow = response.data;
      
      setWorkflows(prev => prev.map(w => {
        if (w.id === workflowId) {
          return {
            ...w,
            status: updatedWorkflow.status,
            progress: updatedWorkflow.progress_percentage || w.progress,
            updated_at: updatedWorkflow.updated_at
          };
        }
        return w;
      }));
      
      onWorkflowAction?.(workflowId, action);
    } catch (err) {
      setError('Failed to execute workflow action via backend');
      console.error('Workflow action error:', err);
    }
  };

  // Data Processing and Filtering
  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const matchesCategory = filterCategory === 'all' || policy.category === filterCategory;
      const matchesSeverity = filterSeverity === 'all' || policy.severity === filterSeverity;
      const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
      const matchesSearch = !searchTerm || 
        policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSeverity && matchesStatus && matchesSearch;
    });
  }, [policies, filterCategory, filterSeverity, filterStatus, searchTerm]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
      const matchesSearch = !searchTerm || 
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [workflows, filterStatus, searchTerm]);

  // Chart data preparation
  const complianceTrendData = useMemo(() => {
    return dashboard?.trends.compliance_trends.map(item => ({
      ...item,
      date: format(parseISO(item.date), 'MMM dd')
    })) || [];
  }, [dashboard]);

  const workflowTrendData = useMemo(() => {
    return dashboard?.trends.workflow_trends.map(item => ({
      ...item,
      date: format(parseISO(item.date), 'MMM dd')
    })) || [];
  }, [dashboard]);

  const policyEffectivenessData = useMemo(() => {
    return dashboard?.trends.policy_effectiveness || [];
  }, [dashboard]);

  // Utility Functions
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed': case 'non_compliant': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'inactive': case 'cancelled': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Policies</p>
                <p className="text-2xl font-bold">{dashboard?.overview.total_policies || 0}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{dashboard?.overview.active_workflows || 0}</p>
              </div>
              <Workflow className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold">{dashboard?.overview.compliance_score || 0}%</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Violations</p>
                <p className="text-2xl font-bold">{dashboard?.overview.violations_count || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Trends</CardTitle>
            <CardDescription>Compliance score and violations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={complianceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="score" domain={[0, 100]} />
                <YAxis yAxisId="violations" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Area 
                  yAxisId="score"
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  name="Compliance Score (%)"
                />
                <Bar 
                  yAxisId="violations"
                  dataKey="violations" 
                  fill="#ef4444" 
                  name="Violations"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workflow Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Status</CardTitle>
            <CardDescription>Distribution of workflow statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: workflowTrendData.reduce((sum, item) => sum + item.completed, 0), fill: '#10b981' },
                    { name: 'Pending', value: workflowTrendData.reduce((sum, item) => sum + item.pending, 0), fill: '#f59e0b' },
                    { name: 'Failed', value: workflowTrendData.reduce((sum, item) => sum + item.failed, 0), fill: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard?.alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} className={cn(
                alert.severity === 'critical' && 'border-red-500',
                alert.severity === 'high' && 'border-orange-500',
                alert.severity === 'medium' && 'border-yellow-500'
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <AlertTitle className="text-sm font-medium">
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                      </AlertTitle>
                      <AlertDescription className="text-sm text-muted-foreground">
                        {alert.message}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={alert.resolved ? 'outline' : 'destructive'}>
                    {alert.resolved ? 'Resolved' : 'Active'}
                  </Badge>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render Policies Tab
  const renderPolicies = () => (
    <div className="space-y-6">
      {/* Policies Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Governance Policies</h2>
          <p className="text-muted-foreground">Manage data lineage governance policies and rules</p>
        </div>
        <Button onClick={() => setShowPolicyDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Policy
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="data_quality">Data Quality</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="access_control">Access Control</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
                <SelectItem value="classification">Classification</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies List */}
      <div className="grid gap-4">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{policy.name}</h3>
                    <Badge variant="outline" style={{ backgroundColor: STATUS_COLORS[policy.status] + '20', color: STATUS_COLORS[policy.status] }}>
                      {policy.status}
                    </Badge>
                    <Badge variant="outline" style={{ backgroundColor: SEVERITY_COLORS[policy.severity] + '20', color: SEVERITY_COLORS[policy.severity] }}>
                      {policy.severity}
                    </Badge>
                    <Badge variant="outline">
                      {policy.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{policy.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Enforcement</p>
                      <p className="text-muted-foreground">{policy.enforcement}</p>
                    </div>
                    <div>
                      <p className="font-medium">Rules</p>
                      <p className="text-muted-foreground">{policy.rules.length} rules</p>
                    </div>
                    <div>
                      <p className="font-medium">Violations</p>
                      <p className="text-muted-foreground">{policy.violations}</p>
                    </div>
                    <div>
                      <p className="font-medium">Compliance Score</p>
                      <p className="text-muted-foreground">{policy.compliance_score}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPolicy(policy)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setNewPolicy(policy);
                    setShowPolicyDialog(true);
                  }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => updatePolicy(policy.id, { status: policy.status === 'active' ? 'inactive' : 'active' })}>
                        {policy.status === 'active' ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(policy.id)}>
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => deletePolicy(policy.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading governance data...</p>
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
              Lineage Governance
            </h1>
            <p className="text-muted-foreground">
              Advanced data lineage governance with policy management, workflows, and compliance monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadGovernanceData} disabled={loading}>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="policies" className="mt-6">
            {renderPolicies()}
          </TabsContent>

          <TabsContent value="workflows" className="mt-6">
            <div className="text-center py-12">
              <Workflow className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Workflows Coming Soon</h3>
              <p className="text-muted-foreground">Advanced workflow management features will be available in the next update</p>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <div className="text-center py-12">
              <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Compliance Reports Coming Soon</h3>
              <p className="text-muted-foreground">Comprehensive compliance monitoring and reporting features will be available soon</p>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Audit Logs Coming Soon</h3>
              <p className="text-muted-foreground">Detailed audit logging and tracking features will be available in the next release</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Policy Creation Dialog */}
        <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {newPolicy.id ? 'Edit Policy' : 'Create New Policy'}
              </DialogTitle>
              <DialogDescription>
                Configure governance policy settings and rules
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-name">Policy Name</Label>
                  <Input
                    id="policy-name"
                    value={newPolicy.name || ''}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter policy name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy-category">Category</Label>
                  <Select 
                    value={newPolicy.category || ''} 
                    onValueChange={(value) => setNewPolicy(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_quality">Data Quality</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="access_control">Access Control</SelectItem>
                      <SelectItem value="retention">Retention</SelectItem>
                      <SelectItem value="classification">Classification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy-description">Description</Label>
                <Textarea
                  id="policy-description"
                  value={newPolicy.description || ''}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the policy purpose and scope"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy-severity">Severity</Label>
                  <Select 
                    value={newPolicy.severity || ''} 
                    onValueChange={(value) => setNewPolicy(prev => ({ ...prev, severity: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
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
                  <Label htmlFor="policy-enforcement">Enforcement</Label>
                  <Select 
                    value={newPolicy.enforcement || ''} 
                    onValueChange={(value) => setNewPolicy(prev => ({ ...prev, enforcement: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select enforcement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPolicyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => createPolicy(newPolicy)}>
                {newPolicy.id ? 'Update' : 'Create'} Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}