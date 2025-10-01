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
  DialogTitle 
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
  Progress 
} from '@/components/ui/progress';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause, 
  StopCircle, 
  Settings, 
  Filter, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  FileText, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Shield, 
  Zap, 
  Brain, 
  Target, 
  Workflow, 
  MessageSquare, 
  Bell, 
  RefreshCw, 
  Save, 
  X, 
  Check, 
  Info, 
  AlertCircle, 
  Gauge, 
  Network, 
  Timer, 
  Command, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Cloud, 
  Server, 
  Globe, 
  Lock, 
  Key, 
  UserCheck, 
  Building, 
  Tag, 
  Flag, 
  Star, 
  BookOpen, 
  FileCheck, 
  ClipboardList, 
  Archive, 
  FolderTree 
} from 'lucide-react';
import { toast } from 'sonner';

// Enterprise-grade types for policy orchestration
interface ClassificationPolicy {
  id: string;
  name: string;
  description: string;
  type: 'DATA_CLASSIFICATION' | 'ACCESS_CONTROL' | 'RETENTION' | 'PRIVACY' | 'COMPLIANCE' | 'SECURITY' | 'POLICY';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT';
  complianceFrameworks: string[];
  rules: PolicyRule[];
  workflow: PolicyWorkflow;
  metrics: PolicyMetrics;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  tags: string[];
  scope: string[];
  dataSources: string[];
  sensitivityLevels: string[];
  enforcementLevel: 'ADVISORY' | 'MANDATORY' | 'CRITICAL';
  autoRemediation: boolean;
  notificationSettings: NotificationSettings;
  auditSettings: AuditSettings;
  performanceSettings: PerformanceSettings;
  policyType?: string;
  metadata?: Record<string, any>;
}

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  priority: number;
  enabled: boolean;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface PolicyExecution {
  id: string;
  policyId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'SUCCESS' | 'FAILURE';
  startTime: string;
  endTime?: string;
  duration?: number;
  results: ExecutionResult[];
  metrics: ExecutionMetrics;
  errors: ExecutionError[];
  logs: ExecutionLog[];
  executionTime?: number;
}

interface PolicyWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  metadata: Record<string, any>;
  version: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  createdAt: string;
  updatedAt: string;
}

interface PolicyMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  complianceRate: number;
  violationCount: number;
  lastExecution?: string;
  performanceScore: number;
  resourceUtilization: number;
  costImpact: number;
  executionCount?: number;
  effectivenessScore?: number;
  lastExecutionTime?: string;
  approvalRate?: number;
  policyId?: string;
}

interface PolicyViolation {
  id: string;
  policyId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  dataSource: string;
  resource: string;
  detectedAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE';
  assignedTo?: string;
  resolution?: string;
  metadata: Record<string, any>;
}

interface PolicyApproval {
  id: string;
  policyId: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver?: string;
  approvedAt?: string;
  comments?: string;
  metadata: Record<string, any>;
}

interface PolicyAudit {
  id: string;
  policyId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: string;
  metadata: Record<string, any>;
  timestamp?: string;
  user?: string;
}

interface ComplianceReport {
  id: string;
  name: string;
  type: string;
  framework: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PUBLISHED';
  generatedAt: string;
  data: Record<string, any>;
  findings: ComplianceFinding[];
  recommendations: string[];
  complianceScore?: number;
}

interface ClassificationFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  standards: string[];
  policies: string[];
  metadata: Record<string, any>;
}

interface RuleSet {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  version: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

// Additional interfaces for enterprise features
interface NotificationSettings {
  email: boolean;
  slack: boolean;
  webhook: boolean;
  recipients: string[];
  channels: string[];
  frequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

interface AuditSettings {
  enabled: boolean;
  retentionDays: number;
  logLevel: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
  includeMetadata: boolean;
  realTimeLogging: boolean;
}

interface PerformanceSettings {
  maxConcurrentExecutions: number;
  timeoutSeconds: number;
  retryAttempts: number;
  resourceLimits: ResourceLimits;
  optimizationEnabled: boolean;
}

interface ResourceLimits {
  maxMemoryMB: number;
  maxCpuPercent: number;
  maxNetworkMB: number;
}

interface ExecutionResult {
  id: string;
  resourceId: string;
  classification: string;
  confidence: number;
  metadata: Record<string, any>;
  timestamp: string;
}

interface ExecutionMetrics {
  totalResources: number;
  classifiedResources: number;
  unclassifiedResources: number;
  averageConfidence: number;
  processingTimeMs: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
}

interface ExecutionError {
  id: string;
  type: string;
  message: string;
  stackTrace?: string;
  timestamp: string;
  resourceId?: string;
}

interface ExecutionLog {
  id: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: string;
  metadata: Record<string, any>;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'TRIGGER' | 'CONDITION' | 'ACTION' | 'GATEWAY' | 'TIMER' | 'USER_TASK';
  configuration: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

interface WorkflowTrigger {
  id: string;
  type: 'SCHEDULE' | 'EVENT' | 'MANUAL' | 'API';
  configuration: Record<string, any>;
  enabled: boolean;
}

interface WorkflowCondition {
  id: string;
  name: string;
  expression: string;
  type: 'BOOLEAN' | 'COMPARISON' | 'REGEX' | 'CUSTOM';
  metadata: Record<string, any>;
}

interface WorkflowAction {
  id: string;
  name: string;
  type: 'CLASSIFY' | 'NOTIFY' | 'APPROVE' | 'REJECT' | 'ESCALATE' | 'AUDIT' | 'REMEDIATE';
  configuration: Record<string, any>;
  metadata: Record<string, any>;
}

interface ComplianceFinding {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  recommendation: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  metadata: Record<string, any>;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CLASSIFICATION_API = `${API_BASE_URL}/api/classifications`;
const COMPLIANCE_API = `${API_BASE_URL}/compliance/rules`;

interface PolicyOrchestratorProps {
  frameworkId?: string;
  onPolicyUpdate?: (policy: ClassificationPolicy) => void;
  onWorkflowChange?: (workflow: PolicyWorkflow) => void;
  readonly?: boolean;
  className?: string;
}

interface PolicyOrchestratorState {
  // Core state
  policies: ClassificationPolicy[];
  frameworks: ClassificationFramework[];
  ruleSets: RuleSet[];
  executions: PolicyExecution[];
  
  // UI state
  selectedPolicy: ClassificationPolicy | null;
  selectedWorkflow: PolicyWorkflow | null;
  activeTab: string;
  searchQuery: string;
  filterStatus: string;
  filterType: string;
  filterCompliance: string;
  showInactivePolicies: boolean;
  
  // Editing state
  editingPolicy: ClassificationPolicy | null;
  executingPolicy: ClassificationPolicy | null;
  isCreatingPolicy: boolean;
  isBulkExecuting: boolean;
  selectedPolicyIds: Set<string>;
  
  // Data collections
  policyMetrics: Map<string, PolicyMetrics>;
  violations: PolicyViolation[];
  approvals: PolicyApproval[];
  auditLogs: PolicyAudit[];
  complianceReports: ComplianceReport[];
  
  // Workflow builder
  workflowBuilder: {
    steps: WorkflowStep[];
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
    metadata: Record<string, any>;
  };
  
  // Performance metrics
  performanceMetrics: {
    executionTimes: number[];
    complianceRates: number[];
    violationCounts: number[];
    approvalRates: number[];
  };
  
  // Real-time status
  realTimeStatus: {
    activePolicies: number;
    pendingApprovals: number;
    activeViolations: number;
    complianceScore: number;
  };
  
  // Orchestration engine
  orchestrationEngine: {
    isRunning: boolean;
    queueSize: number;
    processingRate: number;
    errorRate: number;
  };
  
  // Governance framework
  governanceFramework: {
    regulations: string[];
    standards: string[];
    controls: string[];
    assessments: any[];
  };
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

const POLICY_TYPES = ['DATA_CLASSIFICATION', 'ACCESS_CONTROL', 'RETENTION', 'PRIVACY', 'COMPLIANCE', 'SECURITY'] as const;
const POLICY_STATUSES = ['ACTIVE', 'INACTIVE', 'DRAFT', 'PENDING_APPROVAL', 'SUSPENDED', 'ARCHIVED'] as const;
const COMPLIANCE_FRAMEWORKS = ['GDPR', 'CCPA', 'HIPAA', 'SOX', 'PCI_DSS', 'ISO_27001', 'NIST'] as const;

// Enterprise API Service
class PolicyOrchestrationService {
  constructor() {
    // Initialize service
  }

  // Policy Management
  async getPolicies(filters?: {
    status?: string;
    type?: string;
    compliance?: string;
    search?: string;
  }): Promise<ClassificationPolicy[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.compliance) params.append('compliance', filters.compliance);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`${CLASSIFICATION_API}/policies?${params}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.policies || [];
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  }

  async getPolicy(id: string): Promise<ClassificationPolicy> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/policies/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching policy:', error);
      throw error;
    }
  }

  async createPolicy(policy: Partial<ClassificationPolicy>): Promise<ClassificationPolicy> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }

  async updatePolicy(id: string, policy: Partial<ClassificationPolicy>): Promise<ClassificationPolicy> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/policies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  }

  async deletePolicy(id: string): Promise<void> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/policies/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  }

  // Policy Execution
  async executePolicy(id: string): Promise<PolicyExecution> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/policies/${id}/execute`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error executing policy:', error);
      throw error;
    }
  }

  async getPolicyExecutions(policyId?: string): Promise<PolicyExecution[]> {
    try {
      const url = policyId 
        ? `${CLASSIFICATION_API}/policies/${policyId}/executions`
        : `${CLASSIFICATION_API}/executions`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.executions || [];
    } catch (error) {
      console.error('Error fetching executions:', error);
      throw error;
    }
  }

  // Compliance Management
  async getComplianceRules(): Promise<any[]> {
    try {
      const response = await fetch(`${COMPLIANCE_API}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.rules || [];
    } catch (error) {
      console.error('Error fetching compliance rules:', error);
      throw error;
    }
  }

  // Violations and Approvals
  async getViolations(): Promise<PolicyViolation[]> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/violations`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.violations || [];
    } catch (error) {
      console.error('Error fetching violations:', error);
      throw error;
    }
  }

  async getApprovals(): Promise<PolicyApproval[]> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/approvals`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.approvals || [];
    } catch (error) {
      console.error('Error fetching approvals:', error);
      throw error;
    }
  }

  // Audit and Reports
  async getAuditLogs(policyId?: string): Promise<PolicyAudit[]> {
    try {
      const url = policyId 
        ? `${CLASSIFICATION_API}/policies/${policyId}/audit`
        : `${CLASSIFICATION_API}/audit`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.audit_logs || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  async getComplianceReports(): Promise<ComplianceReport[]> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/compliance-reports`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.reports || [];
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
      throw error;
    }
  }

  // Metrics and Analytics
  async getPolicyMetrics(policyId?: string): Promise<Map<string, PolicyMetrics>> {
    try {
      const url = policyId 
        ? `${CLASSIFICATION_API}/policies/${policyId}/metrics`
        : `${CLASSIFICATION_API}/metrics`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return new Map(Object.entries(data.metrics || {}));
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }

  // Real-time status
  async getRealTimeStatus(): Promise<{
    activePolicies: number;
    pendingApprovals: number;
    activeViolations: number;
    complianceScore: number;
  }> {
    try {
      const response = await fetch(`${CLASSIFICATION_API}/status`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching real-time status:', error);
      throw error;
    }
  }
}

export const PolicyOrchestrator: React.FC<PolicyOrchestratorProps> = ({
  frameworkId,
  onPolicyUpdate,
  onWorkflowChange,
  readonly = false,
  className = ''
}) => {
  const apiService = useMemo(() => new PolicyOrchestrationService(), []);

  // Component state
  const [state, setState] = useState<PolicyOrchestratorState>({
    // Core state
    policies: [],
    frameworks: [],
    ruleSets: [],
    executions: [],
    
    // UI state
    selectedPolicy: null,
    selectedWorkflow: null,
    activeTab: 'policies',
    searchQuery: '',
    filterStatus: 'ALL',
    filterType: 'ALL',
    filterCompliance: 'ALL',
    showInactivePolicies: false,
    
    // Editing state
    editingPolicy: null,
    executingPolicy: null,
    isCreatingPolicy: false,
    isBulkExecuting: false,
    selectedPolicyIds: new Set(),
    
    // Data collections
    policyMetrics: new Map(),
    violations: [],
    approvals: [],
    auditLogs: [],
    complianceReports: [],
    
    // Workflow builder
    workflowBuilder: {
      steps: [],
      conditions: [],
      actions: [],
      metadata: {}
    },
    
    // Performance metrics
    performanceMetrics: {
      executionTimes: [],
      complianceRates: [],
      violationCounts: [],
      approvalRates: []
    },
    
    // Real-time status
    realTimeStatus: {
      activePolicies: 0,
      pendingApprovals: 0,
      activeViolations: 0,
      complianceScore: 0
    },
    
    // Orchestration engine
    orchestrationEngine: {
      isRunning: false,
      queueSize: 0,
      processingRate: 0,
      errorRate: 0
    },
    
    // Governance framework
    governanceFramework: {
      regulations: [],
      standards: [],
      controls: [],
      assessments: []
    },
    
    // Loading and error states
    isLoading: false,
    error: null,
    lastUpdated: new Date().toISOString()
  });

  // Refs for real-time updates
  const wsRef = useRef<WebSocket | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const orchestrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Data loading functions
  const loadPolicies = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const policies = await apiService.getPolicies({
        status: state.filterStatus !== 'ALL' ? state.filterStatus : undefined,
        type: state.filterType !== 'ALL' ? state.filterType : undefined,
        compliance: state.filterCompliance !== 'ALL' ? state.filterCompliance : undefined,
        search: state.searchQuery || undefined
      });
      
      setState(prev => ({ 
        ...prev, 
        policies,
        isLoading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error loading policies:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load policies',
        isLoading: false
      }));
      toast.error('Failed to load policies');
    }
  }, [apiService, state.filterStatus, state.filterType, state.filterCompliance, state.searchQuery]);

  const loadExecutions = useCallback(async () => {
    try {
      const executions = await apiService.getPolicyExecutions();
      setState(prev => ({ ...prev, executions }));
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  }, [apiService]);

  const loadViolations = useCallback(async () => {
    try {
      const violations = await apiService.getViolations();
      setState(prev => ({ ...prev, violations }));
    } catch (error) {
      console.error('Error loading violations:', error);
    }
  }, [apiService]);

  const loadApprovals = useCallback(async () => {
    try {
      const approvals = await apiService.getApprovals();
      setState(prev => ({ ...prev, approvals }));
    } catch (error) {
      console.error('Error loading approvals:', error);
    }
  }, [apiService]);

  const loadAuditLogs = useCallback(async () => {
    try {
      const auditLogs = await apiService.getAuditLogs();
      setState(prev => ({ ...prev, auditLogs }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  }, [apiService]);

  const loadComplianceReports = useCallback(async () => {
    try {
      const complianceReports = await apiService.getComplianceReports();
      setState(prev => ({ ...prev, complianceReports }));
    } catch (error) {
      console.error('Error loading compliance reports:', error);
    }
  }, [apiService]);

  const loadMetrics = useCallback(async () => {
    try {
      const metrics = await apiService.getPolicyMetrics();
      setState(prev => ({ ...prev, policyMetrics: metrics }));
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }, [apiService]);

  const loadRealTimeStatus = useCallback(async () => {
    try {
      const realTimeStatus = await apiService.getRealTimeStatus();
      setState(prev => ({ ...prev, realTimeStatus }));
    } catch (error) {
      console.error('Error loading real-time status:', error);
    }
  }, [apiService]);

  // Policy management functions
  const createPolicy = useCallback(async (policyData: Partial<ClassificationPolicy>) => {
    try {
      setState(prev => ({ ...prev, isCreatingPolicy: true }));
      
      const newPolicy = await apiService.createPolicy(policyData);
      
      setState(prev => ({
        ...prev,
        policies: [...prev.policies, newPolicy],
        isCreatingPolicy: false
      }));
      
      toast.success('Policy created successfully');
      onPolicyUpdate?.(newPolicy);
    } catch (error) {
      console.error('Error creating policy:', error);
      setState(prev => ({ ...prev, isCreatingPolicy: false }));
      toast.error('Failed to create policy');
    }
  }, [apiService, onPolicyUpdate]);

  const updatePolicy = useCallback(async (id: string, policyData: Partial<ClassificationPolicy>) => {
    try {
      const updatedPolicy = await apiService.updatePolicy(id, policyData);
      
      setState(prev => ({
        ...prev,
        policies: prev.policies.map(p => p.id === id ? updatedPolicy : p),
        selectedPolicy: prev.selectedPolicy?.id === id ? updatedPolicy : prev.selectedPolicy
      }));
      
      toast.success('Policy updated successfully');
      onPolicyUpdate?.(updatedPolicy);
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error('Failed to update policy');
    }
  }, [apiService, onPolicyUpdate]);

  const deletePolicy = useCallback(async (id: string) => {
    try {
      await apiService.deletePolicy(id);
      
      setState(prev => ({
        ...prev,
        policies: prev.policies.filter(p => p.id !== id),
        selectedPolicy: prev.selectedPolicy?.id === id ? null : prev.selectedPolicy
      }));
      
      toast.success('Policy deleted successfully');
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy');
    }
  }, [apiService]);

  const executePolicy = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, executingPolicy: prev.policies.find(p => p.id === id) || null }));
      
      const execution = await apiService.executePolicy(id);
      
      setState(prev => ({
        ...prev,
        executions: [execution, ...prev.executions],
        executingPolicy: null
      }));
      
      toast.success('Policy execution started');
      await loadExecutions();
    } catch (error) {
      console.error('Error executing policy:', error);
      setState(prev => ({ ...prev, executingPolicy: null }));
      toast.error('Failed to execute policy');
    }
  }, [apiService, loadExecutions]);

  // Memoized computed values
  const filteredPolicies = useMemo(() => {
    let policies = state.policies;
    
    return policies.filter(policy => {
      const matchesSearch = !state.searchQuery || 
        policy.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        policy.description?.toLowerCase().includes(state.searchQuery.toLowerCase());
      
      const matchesStatus = state.filterStatus === 'ALL' || policy.status === state.filterStatus;
      const matchesType = state.filterType === 'ALL' || policy.type === state.filterType;
      const matchesCompliance = state.filterCompliance === 'ALL' || 
        policy.complianceFrameworks?.includes(state.filterCompliance);
      const matchesActive = state.showInactivePolicies || policy.status === 'ACTIVE';

      return matchesSearch && matchesStatus && matchesType && matchesCompliance && matchesActive;
    });
  }, [state.policies, state.searchQuery, state.filterStatus, state.filterType, state.filterCompliance, state.showInactivePolicies]);

  const complianceOverview = useMemo(() => {
    const frameworks = new Map<string, { total: number; compliant: number; violations: number }>();
    
    COMPLIANCE_FRAMEWORKS.forEach(framework => {
      const policiesInFramework = filteredPolicies.filter(p => 
        p.complianceFrameworks?.includes(framework)
      );
      const violations = state.violations.filter(v => 
        policiesInFramework.some(p => p.id === v.policyId)
      );
      
      frameworks.set(framework, {
        total: policiesInFramework.length,
        compliant: policiesInFramework.length - violations.length,
        violations: violations.length
      });
    });
    
    return frameworks;
  }, [filteredPolicies, state.violations]);

  const policyMetricsAggregated = useMemo(() => {
    const metrics = Array.from(state.policyMetrics.values());
    if (metrics.length === 0) return null;

    return {
      totalExecutions: metrics.reduce((sum, m) => sum + m.totalExecutions, 0),
      averageComplianceRate: metrics.reduce((sum, m) => sum + m.complianceRate, 0) / metrics.length,
      totalViolations: metrics.reduce((sum, m) => sum + m.violationCount, 0),
      averageExecutionTime: metrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) / metrics.length
    };
  }, [state.policyMetrics]);

  // Lifecycle hooks
  useEffect(() => {
    initializePolicyOrchestrator();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (frameworkId) {
      setState(prev => ({ ...prev, filterCompliance: frameworkId }));
    }
  }, [frameworkId]);

  // useEffect(() => {
  //   handleRealTimeUpdate();
  // }, [realTimeEvents]);

  // Core initialization and cleanup
  const initializePolicyOrchestrator = useCallback(async () => {
    try {
      await loadManualClassifications();
      await initializeWebSocket();
      await startOrchestrationEngine();
      await loadGovernanceFramework();
      await collectPolicyMetrics();
      await loadViolations();
      await loadApprovals();
      await loadAuditLogs();
      await generateComplianceReports();
    } catch (error) {
      console.error('Failed to initialize policy orchestrator:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize policy orchestrator",
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
    if (orchestrationIntervalRef.current) {
      clearInterval(orchestrationIntervalRef.current);
    }
  }, []);

  // WebSocket and real-time updates
  const initializeWebSocket = useCallback(async () => {
    try {
      const wsUrl = `ws://localhost:8000/ws/policies/${frameworkId || 'all'}`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Policy orchestrator WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      wsRef.current.onclose = () => {
        console.log('Policy orchestrator WebSocket disconnected');
        setTimeout(initializeWebSocket, 5000);
      };
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  }, [frameworkId]);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'POLICY_EXECUTION':
        handlePolicyExecutionUpdate(data.payload);
        break;
      case 'POLICY_VIOLATION':
        handleViolationUpdate(data.payload);
        break;
      case 'POLICY_APPROVAL':
        handleApprovalUpdate(data.payload);
        break;
      case 'COMPLIANCE_UPDATE':
        handleComplianceUpdate(data.payload);
        break;
      case 'ORCHESTRATION_STATUS':
        handleOrchestrationUpdate(data.payload);
        break;
    }
  }, []);

  const handleRealTimeUpdate = useCallback(() => {
    realTimeEvents.forEach(event => {
      if (event.type === 'POLICY_UPDATE') {
        loadManualClassifications();
      }
    });
  }, [realTimeEvents, loadManualClassifications]);

  // Orchestration engine management
  const startOrchestrationEngine = useCallback(async () => {
    setState(prev => ({
      ...prev,
      orchestrationEngine: { ...prev.orchestrationEngine, isRunning: true }
    }));

    orchestrationIntervalRef.current = setInterval(async () => {
      await updateOrchestrationMetrics();
      await processWorkflowQueue();
      await monitorCompliance();
    }, 3000);

    toast({
      title: "Orchestration Engine Started",
      description: "Policy orchestration engine is now running",
    });
  }, []);

  const stopOrchestrationEngine = useCallback(async () => {
    setState(prev => ({
      ...prev,
      orchestrationEngine: { ...prev.orchestrationEngine, isRunning: false }
    }));

    if (orchestrationIntervalRef.current) {
      clearInterval(orchestrationIntervalRef.current);
    }

    toast({
      title: "Orchestration Engine Stopped",
      description: "Policy orchestration engine has been stopped",
      variant: "destructive"
    });
  }, []);

  const updateOrchestrationMetrics = useCallback(async () => {
    setState(prev => ({
      ...prev,
      orchestrationEngine: {
        ...prev.orchestrationEngine,
        queueSize: Math.floor(Math.random() * 100),
        processingRate: Math.random() * 1000,
        errorRate: Math.random() * 0.05
      },
      realTimeStatus: {
        activePolicies: filteredPolicies.filter(p => p.status === 'ACTIVE').length,
        pendingApprovals: Math.floor(Math.random() * 20),
        activeViolations: Math.floor(Math.random() * 10),
        complianceScore: 0.85 + Math.random() * 0.15
      },
      performanceMetrics: {
        executionTimes: [...prev.performanceMetrics.executionTimes.slice(-19), Math.random() * 200],
        complianceRates: [...prev.performanceMetrics.complianceRates.slice(-19), 0.8 + Math.random() * 0.2],
        violationCounts: [...prev.performanceMetrics.violationCounts.slice(-19), Math.floor(Math.random() * 20)],
        approvalRates: [...prev.performanceMetrics.approvalRates.slice(-19), 0.7 + Math.random() * 0.3]
      }
    }));
  }, [filteredPolicies]);

  const processWorkflowQueue = useCallback(async () => {
    // Simulate workflow processing
    if (Math.random() > 0.8) {
      const mockExecution: PolicyExecution = {
        id: `exec_${Date.now()}`,
        policyId: filteredPolicies[Math.floor(Math.random() * filteredPolicies.length)]?.id || 'unknown',
        status: Math.random() > 0.2 ? 'SUCCESS' : 'FAILURE',
        executionTime: Math.random() * 150,
        result: {
          compliant: Math.random() > 0.3,
          confidence: Math.random(),
          actions: [],
          metadata: {}
        },
        executedAt: new Date().toISOString(),
        executedBy: 'orchestration_engine'
      };

      // Add to audit logs
      setState(prev => ({
        ...prev,
        auditLogs: [{
          id: `audit_${Date.now()}`,
          policyId: mockExecution.policyId,
          action: 'EXECUTION',
          timestamp: new Date().toISOString(),
          user: 'system',
          details: `Policy executed with status: ${mockExecution.status}`,
          metadata: mockExecution
        }, ...prev.auditLogs.slice(0, 99)]
      }));
    }
  }, [filteredPolicies]);

  const monitorCompliance = useCallback(async () => {
    // Generate compliance violations
    if (Math.random() > 0.95) {
      const mockViolation: PolicyViolation = {
        id: `violation_${Date.now()}`,
        policyId: filteredPolicies[Math.floor(Math.random() * filteredPolicies.length)]?.id || 'unknown',
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
        description: 'Automated compliance check detected a policy violation',
        detectedAt: new Date().toISOString(),
        status: 'OPEN',
        assignedTo: 'compliance_team',
        resolution: null,
        metadata: {}
      };

      setState(prev => ({
        ...prev,
        violations: [mockViolation, ...prev.violations.slice(0, 49)]
      }));
    }
  }, [filteredPolicies]);

  // Data loading functions
  const loadGovernanceFramework = useCallback(async () => {
    setState(prev => ({
      ...prev,
      governanceFramework: {
        regulations: ['GDPR', 'CCPA', 'HIPAA', 'SOX'],
        standards: ['ISO 27001', 'NIST', 'SOC 2', 'PCI DSS'],
        controls: ['Access Control', 'Data Encryption', 'Audit Logging', 'Incident Response'],
        assessments: []
      }
    }));
  }, []);

  const collectPolicyMetrics = useCallback(async () => {
    const mockMetrics: Record<string, PolicyMetrics> = {};
    
    filteredPolicies.forEach(policy => {
      mockMetrics[policy.id] = {
        policyId: policy.id,
        executionCount: Math.floor(Math.random() * 1000),
        complianceRate: 0.8 + Math.random() * 0.2,
        violationCount: Math.floor(Math.random() * 50),
        averageExecutionTime: Math.random() * 100,
        lastExecutionTime: new Date().toISOString(),
        approvalRate: 0.7 + Math.random() * 0.3,
        effectivenessScore: 0.75 + Math.random() * 0.25
      };
    });

    setState(prev => ({
      ...prev,
      policyMetrics: new Map(Object.entries(mockMetrics))
    }));
  }, [filteredPolicies]);

  const loadViolations = useCallback(async () => {
    const mockViolations: PolicyViolation[] = [];
    
    for (let i = 0; i < 10; i++) {
      mockViolations.push({
        id: `violation_${i}`,
        policyId: filteredPolicies[Math.floor(Math.random() * filteredPolicies.length)]?.id || 'unknown',
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
        description: `Policy violation #${i + 1} detected by automated monitoring`,
        detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: ['OPEN', 'IN_PROGRESS', 'RESOLVED'][Math.floor(Math.random() * 3)] as any,
        assignedTo: ['compliance_team', 'data_steward', 'security_team'][Math.floor(Math.random() * 3)],
        resolution: Math.random() > 0.5 ? `Violation resolved through corrective action #${i}` : null,
        metadata: {}
      });
    }

    setState(prev => ({ ...prev, violations: mockViolations }));
  }, [filteredPolicies]);

  const loadApprovals = useCallback(async () => {
    const mockApprovals: PolicyApproval[] = [];
    
    for (let i = 0; i < 15; i++) {
      mockApprovals.push({
        id: `approval_${i}`,
        policyId: filteredPolicies[Math.floor(Math.random() * filteredPolicies.length)]?.id || 'unknown',
        requestedBy: `user_${Math.floor(Math.random() * 100)}`,
        approver: `approver_${Math.floor(Math.random() * 10)}`,
        status: ['PENDING', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 3)] as any,
        requestedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
        comments: `Approval request #${i + 1} for policy modification`,
        metadata: {}
      });
    }

    setState(prev => ({ ...prev, approvals: mockApprovals }));
  }, [filteredPolicies]);

  const loadAuditLogs = useCallback(async () => {
    const mockAuditLogs: PolicyAudit[] = [];
    
    for (let i = 0; i < 50; i++) {
      mockAuditLogs.push({
        id: `audit_${i}`,
        policyId: filteredPolicies[Math.floor(Math.random() * filteredPolicies.length)]?.id || 'unknown',
        action: ['CREATE', 'UPDATE', 'DELETE', 'EXECUTE', 'APPROVE', 'REJECT'][Math.floor(Math.random() * 6)] as any,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        user: `user_${Math.floor(Math.random() * 100)}`,
        details: `Audit log entry #${i + 1}`,
        metadata: {}
      });
    }

    setState(prev => ({ ...prev, auditLogs: mockAuditLogs }));
  }, [filteredPolicies]);

  const generateComplianceReports = useCallback(async () => {
    const mockReports: ComplianceReport[] = COMPLIANCE_FRAMEWORKS.map(framework => ({
      id: `report_${framework}`,
      framework,
      generatedAt: new Date().toISOString(),
      complianceScore: 0.8 + Math.random() * 0.2,
      totalPolicies: filteredPolicies.filter(p => p.complianceFrameworks?.includes(framework)).length,
      compliantPolicies: Math.floor(Math.random() * 10),
      violations: Math.floor(Math.random() * 5),
      recommendations: [`Improve ${framework} compliance`, `Update policy documentation`, `Enhance monitoring`],
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {}
    }));

    setState(prev => ({ ...prev, complianceReports: mockReports }));
  }, [filteredPolicies]);

  // Policy CRUD operations
  const handleCreatePolicy = useCallback(async (policyData: Partial<ClassificationPolicy>) => {
    try {
      setState(prev => ({ ...prev, isCreatingPolicy: true }));
      
      const newPolicy: ClassificationPolicy = {
        id: `policy_${Date.now()}`,
        name: policyData.name || 'New Policy',
        description: policyData.description || '',
        frameworkId: frameworkId || '',
        type: 'POLICY',
        status: 'DRAFT',
        policyType: policyData.policyType || 'DATA_CLASSIFICATION',
        rules: policyData.rules || [],
        workflow: policyData.workflow || null,
        complianceFrameworks: policyData.complianceFrameworks || [],
        metadata: policyData.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user',
        tags: policyData.tags || [],
        version: '1.0'
      };

      onPolicyUpdate?.(newPolicy);
      
      toast({
        title: "Policy Created",
        description: `Policy "${newPolicy.name}" has been created successfully`,
      });

      setState(prev => ({ 
        ...prev, 
        isCreatingPolicy: false,
        selectedPolicy: newPolicy,
        activeTab: 'details'
      }));
    } catch (error) {
      console.error('Failed to create policy:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create the policy",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isCreatingPolicy: false }));
    }
  }, [frameworkId, onPolicyUpdate]);

  const handleUpdatePolicy = useCallback(async (policyId: string, updates: Partial<ClassificationPolicy>) => {
    try {
      const policy = filteredPolicies.find(p => p.id === policyId);
      if (!policy) return;

      const updatedPolicy = { ...policy, ...updates, updatedAt: new Date().toISOString() };
      
      onPolicyUpdate?.(updatedPolicy);
      
      toast({
        title: "Policy Updated",
        description: `Policy "${updatedPolicy.name}" has been updated successfully`,
      });

      setState(prev => ({ ...prev, editingPolicy: null }));
    } catch (error) {
      console.error('Failed to update policy:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the policy",
        variant: "destructive",
      });
    }
  }, [filteredPolicies, onPolicyUpdate]);

  const handleExecutePolicy = useCallback(async (policy: ClassificationPolicy) => {
    try {
      setState(prev => ({ ...prev, executingPolicy: policy }));
      
      // Simulate policy execution
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const execution: PolicyExecution = {
        id: `exec_${Date.now()}`,
        policyId: policy.id,
        status: Math.random() > 0.2 ? 'SUCCESS' : 'FAILURE',
        executionTime: Math.random() * 150,
        result: {
          compliant: Math.random() > 0.3,
          confidence: Math.random(),
          actions: [],
          metadata: {}
        },
        executedAt: new Date().toISOString(),
        executedBy: 'current_user'
      };

      setState(prev => ({
        ...prev,
        executingPolicy: null,
        auditLogs: [{
          id: `audit_${Date.now()}`,
          policyId: policy.id,
          action: 'EXECUTE',
          timestamp: new Date().toISOString(),
          user: 'current_user',
          details: `Policy executed manually with status: ${execution.status}`,
          metadata: execution
        }, ...prev.auditLogs.slice(0, 99)]
      }));

      toast({
        title: "Policy Execution Completed",
        description: `Execution ${execution.status.toLowerCase()} - ${execution.executionTime.toFixed(2)}ms`,
        variant: execution.status === 'SUCCESS' ? 'default' : 'destructive'
      });
    } catch (error) {
      console.error('Failed to execute policy:', error);
      setState(prev => ({ ...prev, executingPolicy: null }));
      toast({
        title: "Execution Failed",
        description: "Failed to execute policy",
        variant: "destructive",
      });
    }
  }, []);

  // Event handlers
  const handlePolicyExecutionUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      auditLogs: [data, ...prev.auditLogs.slice(0, 99)]
    }));
  }, []);

  const handleViolationUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      violations: [data, ...prev.violations.slice(0, 49)]
    }));
  }, []);

  const handleApprovalUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      approvals: [data, ...prev.approvals.slice(0, 49)]
    }));
  }, []);

  const handleComplianceUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      realTimeStatus: {
        ...prev.realTimeStatus,
        complianceScore: data.complianceScore
      }
    }));
  }, []);

  const handleOrchestrationUpdate = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      orchestrationEngine: {
        ...prev.orchestrationEngine,
        ...data
      }
    }));
  }, []);

  // UI event handlers
  const handlePolicySelection = useCallback((policy: ClassificationPolicy) => {
    setState(prev => ({ ...prev, selectedPolicy: policy }));
  }, []);

  const handlePolicyEdit = useCallback((policy: ClassificationPolicy) => {
    setState(prev => ({ ...prev, editingPolicy: policy }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const handleFilterChange = useCallback((type: string, value: string) => {
    setState(prev => ({ ...prev, [`filter${type}`]: value }));
  }, []);

  // Policy Builder Dialog Component
  const PolicyBuilderDialog = () => (
    <Dialog open={state.isCreatingPolicy} onOpenChange={(open) => setState(prev => ({ ...prev, isCreatingPolicy: open }))}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Classification Policy</DialogTitle>
          <DialogDescription>
            Build a comprehensive policy with workflow orchestration for automated governance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy-name">Policy Name</Label>
              <Input
                id="policy-name"
                placeholder="Enter policy name"
                value={state.workflowBuilder.metadata.name || ''}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  workflowBuilder: {
                    ...prev.workflowBuilder,
                    metadata: { ...prev.workflowBuilder.metadata, name: e.target.value }
                  }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policy-type">Policy Type</Label>
              <Select
                value={state.workflowBuilder.metadata.policyType || 'DATA_CLASSIFICATION'}
                onValueChange={(value) => setState(prev => ({
                  ...prev,
                  workflowBuilder: {
                    ...prev.workflowBuilder,
                    metadata: { ...prev.workflowBuilder.metadata, policyType: value }
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="policy-description">Description</Label>
            <Textarea
              id="policy-description"
              placeholder="Describe the policy purpose and scope"
              value={state.workflowBuilder.metadata.description || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                workflowBuilder: {
                  ...prev.workflowBuilder,
                  metadata: { ...prev.workflowBuilder.metadata, description: e.target.value }
                }
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Compliance Frameworks</Label>
            <div className="grid grid-cols-3 gap-2">
              {COMPLIANCE_FRAMEWORKS.map(framework => (
                <div key={framework} className="flex items-center space-x-2">
                  <Checkbox
                    id={framework}
                    checked={state.workflowBuilder.metadata.complianceFrameworks?.includes(framework) || false}
                    onCheckedChange={(checked) => {
                      setState(prev => {
                        const frameworks = prev.workflowBuilder.metadata.complianceFrameworks || [];
                        const newFrameworks = checked 
                          ? [...frameworks, framework]
                          : frameworks.filter(f => f !== framework);
                        
                        return {
                          ...prev,
                          workflowBuilder: {
                            ...prev.workflowBuilder,
                            metadata: { 
                              ...prev.workflowBuilder.metadata, 
                              complianceFrameworks: newFrameworks 
                            }
                          }
                        };
                      });
                    }}
                  />
                  <Label htmlFor={framework} className="text-sm">{framework}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setState(prev => ({ ...prev, isCreatingPolicy: false }))}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleCreatePolicy({
              name: state.workflowBuilder.metadata.name,
              description: state.workflowBuilder.metadata.description,
              policyType: state.workflowBuilder.metadata.policyType,
              complianceFrameworks: state.workflowBuilder.metadata.complianceFrameworks
            })}
            disabled={!state.workflowBuilder.metadata.name}
          >
            Create Policy
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
          <p>Loading policy orchestrator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with orchestration controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Policy Orchestrator</h2>
          <p className="text-muted-foreground">
            Advanced governance and compliance management with automated workflow orchestration
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Orchestration Engine Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${state.orchestrationEngine.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              Engine {state.orchestrationEngine.isRunning ? 'Running' : 'Stopped'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={state.orchestrationEngine.isRunning ? stopOrchestrationEngine : startOrchestrationEngine}
            >
              {state.orchestrationEngine.isRunning ? (
                <StopCircle className="h-4 w-4 mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              {state.orchestrationEngine.isRunning ? 'Stop' : 'Start'}
            </Button>
          </div>
          
          {!readonly && (
            <Button onClick={() => setState(prev => ({ ...prev, isCreatingPolicy: true }))}>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          )}
        </div>
      </div>

      {/* Key metrics dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.realTimeStatus.activePolicies}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPolicies.length} total policies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(state.realTimeStatus.complianceScore * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all frameworks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {state.realTimeStatus.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {state.realTimeStatus.activeViolations}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orchestration engine status */}
      <Card>
        <CardHeader>
          <CardTitle>Orchestration Engine Status</CardTitle>
          <CardDescription>Real-time monitoring of the policy execution engine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Queue Size</Label>
                <span className="text-lg font-bold">{state.orchestrationEngine.queueSize}</span>
              </div>
              <Progress value={(state.orchestrationEngine.queueSize / 100) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Processing Rate</Label>
                <span className="text-lg font-bold">{state.orchestrationEngine.processingRate.toFixed(0)}/min</span>
              </div>
              <Progress value={(state.orchestrationEngine.processingRate / 1000) * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Error Rate</Label>
                <span className="text-lg font-bold text-red-600">
                  {(state.orchestrationEngine.errorRate * 100).toFixed(2)}%
                </span>
              </div>
              <Progress value={state.orchestrationEngine.errorRate * 100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Engine Status</Label>
                <Badge variant={state.orchestrationEngine.isRunning ? 'default' : 'destructive'}>
                  {state.orchestrationEngine.isRunning ? 'RUNNING' : 'STOPPED'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="policies" className="space-y-4">
          {/* Search and filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search policies..."
                value={state.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={state.filterStatus} onValueChange={(value) => handleFilterChange('Status', value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {POLICY_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={state.filterType} onValueChange={(value) => handleFilterChange('Type', value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {POLICY_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={state.filterCompliance} onValueChange={(value) => handleFilterChange('Compliance', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Frameworks</SelectItem>
                {COMPLIANCE_FRAMEWORKS.map(framework => (
                  <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Policies table */}
          <Card>
            <CardHeader>
              <CardTitle>Classification Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Last Execution</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => {
                    const metrics = state.policyMetrics.get(policy.id);
                    return (
                      <TableRow 
                        key={policy.id}
                        className={state.selectedPolicy?.id === policy.id ? 'bg-muted' : ''}
                      >
                        <TableCell>
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-48">
                            {policy.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {policy.policyType?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            policy.status === 'ACTIVE' ? 'default' :
                            policy.status === 'DRAFT' ? 'secondary' :
                            policy.status === 'PENDING_APPROVAL' ? 'outline' : 'destructive'
                          }>
                            {policy.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {policy.complianceFrameworks?.slice(0, 2).map(framework => (
                              <Badge key={framework} variant="outline" className="text-xs">
                                {framework}
                              </Badge>
                            ))}
                            {(policy.complianceFrameworks?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(policy.complianceFrameworks?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {metrics ? (
                            <div className="flex items-center space-x-2">
                              <span>{(metrics.effectivenessScore * 100).toFixed(0)}%</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div 
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{ width: `${metrics.effectivenessScore * 100}%` }}
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
                              {new Date(metrics.lastExecutionTime).toLocaleDateString()}
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
                              onClick={() => handlePolicySelection(policy)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!readonly && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePolicyEdit(policy)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExecutePolicy(policy)}
                                  disabled={state.executingPolicy?.id === policy.id}
                                >
                                  {state.executingPolicy?.id === policy.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Play className="h-4 w-4" />
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
              
              {filteredPolicies.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No policies found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {state.selectedPolicy ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Policy Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Policy Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-muted-foreground">{state.selectedPolicy.name}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">{state.selectedPolicy.description || 'No description'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {state.selectedPolicy.policyType?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge variant={
                          state.selectedPolicy.status === 'ACTIVE' ? 'default' :
                          state.selectedPolicy.status === 'DRAFT' ? 'secondary' :
                          state.selectedPolicy.status === 'PENDING_APPROVAL' ? 'outline' : 'destructive'
                        }>
                          {state.selectedPolicy.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {state.selectedPolicy.complianceFrameworks && state.selectedPolicy.complianceFrameworks.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Compliance Frameworks</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {state.selectedPolicy.complianceFrameworks.map((framework, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Policy Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const metrics = state.policyMetrics.get(state.selectedPolicy.id);
                    if (!metrics) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          No metrics available for this policy
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
                            <Label className="text-sm font-medium">Compliance Rate</Label>
                            <p className="text-2xl font-bold text-green-600">
                              {(metrics.complianceRate * 100).toFixed(1)}%
                            </p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Violations</Label>
                            <p className="text-2xl font-bold text-red-600">{metrics.violationCount}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Effectiveness</Label>
                            <p className="text-2xl font-bold">{(metrics.effectivenessScore * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Approval Rate</Label>
                          <div className="mt-2">
                            <Progress value={metrics.approvalRate * 100} className="h-3" />
                            <p className="text-sm text-muted-foreground mt-1">
                              {(metrics.approvalRate * 100).toFixed(1)}% approval rate
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Policy Selected</h3>
                <p className="text-muted-foreground">
                  Select a policy from the policies tab to view its details
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Orchestration</CardTitle>
              <CardDescription>
                Manage and monitor automated policy workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Workflow Management</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced workflow orchestration features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(complianceOverview.entries()).map(([framework, data]) => (
                    <div key={framework} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{framework}</span>
                        <span className="text-sm text-muted-foreground">
                          {data.compliant}/{data.total} compliant
                        </span>
                      </div>
                      <Progress value={(data.compliant / data.total) * 100} className="h-2" />
                      {data.violations > 0 && (
                        <p className="text-xs text-red-600">{data.violations} violations</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Compliance Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.complianceReports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{report.framework} Report</div>
                        <div className="text-sm text-muted-foreground">
                          Score: {(report.complianceScore * 100).toFixed(1)}%
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Violations</CardTitle>
              <CardDescription>Monitor and manage compliance violations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.violations.slice(0, 10).map((violation) => {
                    const policy = filteredPolicies.find(p => p.id === violation.policyId);
                    return (
                      <TableRow key={violation.id}>
                        <TableCell>{policy?.name || 'Unknown Policy'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            violation.severity === 'CRITICAL' ? 'destructive' :
                            violation.severity === 'HIGH' ? 'default' :
                            violation.severity === 'MEDIUM' ? 'secondary' : 'outline'
                          }>
                            {violation.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            violation.status === 'RESOLVED' ? 'default' :
                            violation.status === 'IN_PROGRESS' ? 'secondary' : 'destructive'
                          }>
                            {violation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(violation.detectedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{violation.assignedTo}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Policy Approvals</CardTitle>
              <CardDescription>Manage policy approval workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Approver</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.approvals.slice(0, 10).map((approval) => {
                    const policy = filteredPolicies.find(p => p.id === approval.policyId);
                    return (
                      <TableRow key={approval.id}>
                        <TableCell>{policy?.name || 'Unknown Policy'}</TableCell>
                        <TableCell>{approval.requestedBy}</TableCell>
                        <TableCell>
                          <Badge variant={
                            approval.status === 'APPROVED' ? 'default' :
                            approval.status === 'REJECTED' ? 'destructive' : 'secondary'
                          }>
                            {approval.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(approval.requestedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{approval.approver}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {approval.status === 'PENDING' && (
                              <>
                                <Button variant="outline" size="sm">
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Complete audit log of policy activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.auditLogs.slice(0, 20).map((log) => {
                    const policy = filteredPolicies.find(p => p.id === log.policyId);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{policy?.name || 'Unknown Policy'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Policy Builder Dialog */}
      <PolicyBuilderDialog />
    </div>
  );
};