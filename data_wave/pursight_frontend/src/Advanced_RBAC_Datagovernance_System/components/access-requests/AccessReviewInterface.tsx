'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Users, User, FileText, MessageSquare,
  History, Settings, Filter, Search, RefreshCw, MoreHorizontal, Eye, ThumbsUp,
  ThumbsDown, Flag, Forward, Reply, Send, Calendar, Timer, Target, TrendingUp,
  TrendingDown, Shield, Key, Database, Workflow, GitBranch, Activity, BarChart3,
  PieChart, Star, StarOff, Bookmark, Bell, Download, Upload, Share, Copy,
  ExternalLink, Maximize2, Minimize2, ChevronDown, ChevronUp, ChevronRight,
  ChevronLeft, Plus, Minus, X, Check, Info, HelpCircle, Lightbulb, Zap,
  Lock, Unlock, Edit, Save, ArrowLeft, ArrowRight, Trash2, Archive, Tag,
  Layers, Grid, List, SortAsc, SortDesc, Cpu, Brain, Gauge, Network,
  Globe, MapPin, Building, Phone, Mail, Smartphone, Tablet, Monitor,
  Server, HardDrive, Wifi, Bluetooth, Fingerprint, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib copie/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useAccessRequests } from '../../hooks/useAccessRequests';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useResources } from '../../hooks/useResources';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useNotifications } from '../../hooks/useNotifications';
import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addDays, differenceInHours, differenceInMinutes, subDays, subHours } from 'date-fns';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import type { AccessRequest, AccessRequestFilters } from '../../types/access-request.types';
import type { User } from '../../types/user.types';
import type { Role } from '../../types/role.types';
import type { Resource } from '../../types/resource.types';

// ===================== INTERFACES & TYPES =====================

interface AccessReviewInterfaceProps {
  className?: string;
  onClose?: () => void;
  onRequestSelect?: (request: AccessRequest) => void;
  initialFilters?: AccessRequestFilters;
  showBulkActions?: boolean;
  showAdvancedFilters?: boolean;
  showAnalytics?: boolean;
  enableRealTimeUpdates?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxRequestsPerBatch?: number;
  enableKeyboardShortcuts?: boolean;
  showDecisionSupport?: boolean;
  enableCollaboration?: boolean;
  enableIntelligentSuggestions?: boolean;
  showRiskAssessment?: boolean;
  enableWorkflowAutomation?: boolean;
}

interface ReviewDecision {
  requestId: number;
  decision: 'approve' | 'deny' | 'request_info' | 'delegate' | 'escalate' | 'conditional_approve' | 'temporary_approve';
  comment?: string;
  conditions?: Record<string, any>;
  delegateToUserId?: number;
  escalateReason?: string;
  expiryDate?: Date;
  reviewDate?: Date;
  partialApproval?: {
    approvedItems: string[];
    deniedItems: string[];
    conditions: Record<string, any>;
  };
  confidenceScore?: number;
  riskMitigation?: string[];
  complianceNotes?: string;
  businessJustification?: string;
  followUpActions?: string[];
  notificationSettings?: {
    notifyRequester: boolean;
    notifyManager: boolean;
    notifySecurityTeam: boolean;
    customNotifications: User[];
  };
}

interface BatchReviewState {
  selectedRequests: AccessRequest[];
  currentIndex: number;
  decisions: Map<number, ReviewDecision>;
  isReviewing: boolean;
  autoAdvance: boolean;
  showDetails: boolean;
  batchMode: 'sequential' | 'parallel' | 'smart';
  reviewCriteria: ReviewCriteria;
  progressMetrics: BatchProgressMetrics;
}

interface ReviewCriteria {
  prioritizeByRisk: boolean;
  prioritizeBySLA: boolean;
  prioritizeByBusinessImpact: boolean;
  autoApproveThreshold?: number;
  autoDenyThreshold?: number;
  requireJustificationMinLength: number;
  enforceComplianceChecks: boolean;
  requiredApprovers?: User[];
  escalationThreshold: number;
}

interface BatchProgressMetrics {
  totalRequests: number;
  completedRequests: number;
  approvedCount: number;
  deniedCount: number;
  delegatedCount: number;
  escalatedCount: number;
  averageReviewTime: number;
  estimatedCompletionTime: number;
  currentEfficiency: number;
  qualityScore: number;
}

interface ReviewMetrics {
  totalPending: number;
  reviewedToday: number;
  averageReviewTime: number;
  approvalRate: number;
  overdueCount: number;
  myPendingCount: number;
  highPriorityCount: number;
  emergencyCount: number;
  slaCompliance: number;
  riskDistribution: Record<string, number>;
  workloadDistribution: Array<{
    reviewer: User;
    pendingCount: number;
    averageTime: number;
    efficiency: number;
    specializations: string[];
  }>;
  performanceMetrics: {
    accuracyScore: number;
    speedScore: number;
    consistencyScore: number;
    learningTrend: number;
  };
  predictiveInsights: {
    expectedApprovals: number;
    expectedDenials: number;
    riskAreas: string[];
    improvementSuggestions: string[];
  };
}

interface DecisionSupport {
  riskScore: number;
  confidenceLevel: number;
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation?: string;
    weight: number;
  }>;
  similarRequests: Array<{
    id: number;
    similarity: number;
    decision: string;
    reviewer: string;
    outcome: string;
    businessContext: string;
    lessons: string[];
  }>;
  complianceChecks: Array<{
    framework: string;
    status: 'pass' | 'fail' | 'warning' | 'review_required';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    remediation?: string;
    autoFixAvailable: boolean;
  }>;
  recommendations: Array<{
    action: string;
    confidence: number;
    reasoning: string;
    expectedOutcome: string;
    riskMitigation: string[];
    implementation: string;
  }>;
  businessImpact: {
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigations: string[];
    benefitAnalysis: string;
    costImplications: string;
    timelineImpact: string;
  };
  technicalAssessment: {
    feasibility: number;
    complexity: number;
    securityImplications: string[];
    performanceImpact: string;
    maintenanceOverhead: string;
  };
  stakeholderAnalysis: {
    primaryStakeholders: User[];
    secondaryStakeholders: User[];
    impactedTeams: string[];
    communicationPlan: string;
  };
}

interface IntelligentSuggestion {
  type: 'auto_approve' | 'auto_deny' | 'request_info' | 'delegate' | 'escalate' | 'conditional_approve';
  confidence: number;
  reasoning: string[];
  conditions?: Record<string, any>;
  suggestedReviewer?: User;
  suggestedTimeline?: string;
  riskMitigation?: string[];
  learningSource: string;
  precedentCases: Array<{
    id: number;
    similarity: number;
    outcome: string;
  }>;
}

interface ReviewComment {
  id: string;
  requestId: number;
  author: User;
  content: string;
  type: 'review_note' | 'question' | 'concern' | 'approval_comment' | 'denial_reason' | 'escalation_note';
  isPrivate: boolean;
  createdAt: string;
  mentions: User[];
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  reactions: Array<{
    emoji: string;
    users: User[];
  }>;
  isEdited?: boolean;
  editedAt?: string;
  parentId?: string;
  threadLevel: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  requiresResponse: boolean;
  responseDeadline?: string;
}

interface CollaborationContext {
  activeReviewers: User[];
  reviewerAssignments: Map<number, User[]>;
  collaborativeDecisions: Map<number, {
    reviewers: User[];
    votes: Map<string, string>;
    consensus: number;
    finalDecision?: string;
    decisionRationale: string;
  }>;
  realTimeActivity: Array<{
    userId: number;
    action: string;
    timestamp: string;
    requestId?: number;
  }>;
  expertConsultations: Map<number, {
    expert: User;
    domain: string;
    consultation: string;
    recommendations: string[];
  }>;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (request: AccessRequest) => void;
  condition?: (request: AccessRequest) => boolean;
  shortcut?: string;
  color?: 'default' | 'success' | 'warning' | 'destructive';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  intelligentSuggestion?: boolean;
  learningEnabled?: boolean;
}

interface WorkflowAutomation {
  rules: Array<{
    id: string;
    name: string;
    conditions: Record<string, any>;
    actions: string[];
    isActive: boolean;
    priority: number;
    successRate: number;
  }>;
  triggers: Array<{
    event: string;
    conditions: Record<string, any>;
    actions: string[];
  }>;
  machineLearning: {
    isEnabled: boolean;
    modelVersion: string;
    accuracy: number;
    lastTrainingDate: string;
    improvementSuggestions: string[];
  };
}

// ===================== CONSTANTS =====================

const REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  { value: 'denied', label: 'Denied', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'needs_info', label: 'Needs Information', color: 'bg-blue-100 text-blue-800', icon: Info },
  { value: 'escalated', label: 'Escalated', color: 'bg-purple-100 text-purple-800', icon: TrendingUp }
];

const REQUEST_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-50 text-blue-700', icon: TrendingDown },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700', icon: Target },
  { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700', icon: TrendingUp },
  { value: 'critical', label: 'Critical', color: 'bg-red-50 text-red-700', icon: AlertTriangle }
];

const REVIEW_DECISIONS = [
  { value: 'approve', label: 'Approve', icon: CheckCircle2, color: 'text-green-600', shortcut: 'A' },
  { value: 'deny', label: 'Deny', icon: XCircle, color: 'text-red-600', shortcut: 'D' },
  { value: 'conditional_approve', label: 'Conditional Approve', icon: Check, color: 'text-yellow-600', shortcut: 'C' },
  { value: 'temporary_approve', label: 'Temporary Approve', icon: Timer, color: 'text-blue-600', shortcut: 'T' },
  { value: 'request_info', label: 'Request Info', icon: Info, color: 'text-blue-600', shortcut: 'I' },
  { value: 'delegate', label: 'Delegate', icon: Forward, color: 'text-purple-600', shortcut: 'G' },
  { value: 'escalate', label: 'Escalate', icon: TrendingUp, color: 'text-orange-600', shortcut: 'E' }
];

const SLA_THRESHOLDS = {
  low: { warning: 72, critical: 168 },
  medium: { warning: 48, critical: 96 },
  high: { warning: 24, critical: 48 },
  critical: { warning: 8, critical: 24 }
};

const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', color: 'text-green-600', threshold: 30 },
  { value: 'medium', label: 'Medium Risk', color: 'text-yellow-600', threshold: 60 },
  { value: 'high', label: 'High Risk', color: 'text-orange-600', threshold: 80 },
  { value: 'critical', label: 'Critical Risk', color: 'text-red-600', threshold: 100 }
];

const BATCH_MODES = [
  { value: 'sequential', label: 'Sequential Review', description: 'Review requests one by one in order' },
  { value: 'parallel', label: 'Parallel Review', description: 'Review multiple requests simultaneously' },
  { value: 'smart', label: 'Smart Review', description: 'AI-powered optimal review sequence' }
];

const AUTOMATION_TEMPLATES = [
  {
    name: 'Auto-approve low-risk standard access',
    conditions: { riskScore: { lt: 30 }, requestType: 'standard', priority: 'low' },
    actions: ['approve', 'notify_requester', 'log_decision']
  },
  {
    name: 'Auto-escalate high-risk requests',
    conditions: { riskScore: { gt: 80 }, isEmergency: true },
    actions: ['escalate', 'notify_security_team', 'require_manager_approval']
  },
  {
    name: 'Request additional info for incomplete requests',
    conditions: { justificationLength: { lt: 50 }, businessJustification: { empty: true } },
    actions: ['request_info', 'send_template_questions', 'set_reminder']
  }
];

// ===================== MAIN COMPONENT =====================

export const AccessReviewInterface: React.FC<AccessReviewInterfaceProps> = ({
  className,
  onClose,
  onRequestSelect,
  initialFilters = { status: 'pending' },
  showBulkActions = true,
  showAdvancedFilters = true,
  showAnalytics = true,
  enableRealTimeUpdates = true,
  autoRefresh = true,
  refreshInterval = 30000,
  maxRequestsPerBatch = 25,
  enableKeyboardShortcuts = true,
  showDecisionSupport = true,
  enableCollaboration = true,
  enableIntelligentSuggestions = true,
  showRiskAssessment = true,
  enableWorkflowAutomation = true
}) => {
  // ===================== HOOKS & STATE =====================

  const { currentUser } = useCurrentUser();
  const { checkPermission } = usePermissionCheck();
  const { isConnected, subscribe, unsubscribe } = useRBACWebSocket();
  const { users, loadUsers, searchUsers } = useUsers();
  const { roles, loadRoles } = useRoles();
  const { resources, loadResources } = useResources();
  const { createAuditLog } = useAuditLogs();
  const { sendNotification, getNotifications } = useNotifications();
  
  const {
    accessRequests,
    totalCount,
    isLoading,
    isRefreshing,
    error,
    currentPage,
    totalPages,
    selectedRequests,
    loadAccessRequests,
    refreshAccessRequests,
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    selectRequest,
    deselectRequest,
    selectAllRequests,
    clearSelection,
    toggleRequestSelection,
    approveAccessRequest,
    denyAccessRequest,
    requestMoreInformation,
    delegateReview,
    escalateAccessRequest,
    bulkReviewRequests,
    getPendingReviews,
    addComment,
    getComments,
    getAccessRequestAnalytics,
    getDecisionSupport,
    getIntelligentSuggestions,
    executeWorkflowAutomation
  } = useAccessRequests(initialFilters, true);

  // Component state
  const [viewMode, setViewMode] = useState<'list' | 'cards' | 'batch' | 'kanban'>('list');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFiltersState] = useState<AccessRequestFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Batch review state
  const [batchReview, setBatchReview] = useState<BatchReviewState>({
    selectedRequests: [],
    currentIndex: 0,
    decisions: new Map(),
    isReviewing: false,
    autoAdvance: true,
    showDetails: true,
    batchMode: 'sequential',
    reviewCriteria: {
      prioritizeByRisk: true,
      prioritizeBySLA: true,
      prioritizeByBusinessImpact: false,
      requireJustificationMinLength: 50,
      enforceComplianceChecks: true,
      escalationThreshold: 80
    },
    progressMetrics: {
      totalRequests: 0,
      completedRequests: 0,
      approvedCount: 0,
      deniedCount: 0,
      delegatedCount: 0,
      escalatedCount: 0,
      averageReviewTime: 0,
      estimatedCompletionTime: 0,
      currentEfficiency: 0,
      qualityScore: 0
    }
  });
  
  // Review state
  const [reviewMetrics, setReviewMetrics] = useState<ReviewMetrics | null>(null);
  const [decisionSupport, setDecisionSupport] = useState<Map<number, DecisionSupport>>(new Map());
  const [intelligentSuggestions, setIntelligentSuggestions] = useState<Map<number, IntelligentSuggestion[]>>(new Map());
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [reviewComments, setReviewComments] = useState<Map<number, ReviewComment[]>>(new Map());
  const [collaborationContext, setCollaborationContext] = useState<CollaborationContext>({
    activeReviewers: [],
    reviewerAssignments: new Map(),
    collaborativeDecisions: new Map(),
    realTimeActivity: [],
    expertConsultations: new Map()
  });
  
  // UI state
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Decision state
  const [currentDecision, setCurrentDecision] = useState<Partial<ReviewDecision>>({});
  const [decisionComment, setDecisionComment] = useState('');
  const [delegateToUser, setDelegateToUser] = useState<User | null>(null);
  const [escalationReason, setEscalationReason] = useState('');
  const [requestInfoQuestions, setRequestInfoQuestions] = useState<string[]>(['']);
  const [conditionalApprovalConditions, setConditionalApprovalConditions] = useState<Record<string, any>>({});
  const [temporaryApprovalExpiry, setTemporaryApprovalExpiry] = useState<Date | null>(null);
  
  // Automation state
  const [workflowAutomation, setWorkflowAutomation] = useState<WorkflowAutomation>({
    rules: [],
    triggers: [],
    machineLearning: {
      isEnabled: false,
      modelVersion: '1.0.0',
      accuracy: 0,
      lastTrainingDate: '',
      improvementSuggestions: []
    }
  });
  
  // Performance and UX
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [reviewStartTime, setReviewStartTime] = useState<Date | null>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const keyboardShortcutsRef = useRef<Map<string, () => void>>(new Map());
  const performanceMetricsRef = useRef<{
    reviewTimes: number[];
    decisionAccuracy: number[];
    userSatisfaction: number[];
  }>({
    reviewTimes: [],
    decisionAccuracy: [],
    userSatisfaction: []
  });

  // ===================== COMPUTED VALUES =====================

  const filteredRequests = useMemo(() => {
    let filtered = accessRequests;

    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.id.toString().includes(searchQuery) ||
        request.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.justification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.resource_type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.priority) {
      filtered = filtered.filter(request => request.priority === filters.priority);
    }

    if (filters.resourceType) {
      filtered = filtered.filter(request => request.resource_type === filters.resourceType);
    }

    if (filters.isEmergency) {
      filtered = filtered.filter(request => request.is_emergency);
    }

    return filtered;
  }, [accessRequests, searchQuery, filters]);

  const prioritizedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      // Smart prioritization based on review criteria
      if (batchReview.reviewCriteria.prioritizeByRisk) {
        const aRisk = decisionSupport.get(a.id)?.riskScore || 0;
        const bRisk = decisionSupport.get(b.id)?.riskScore || 0;
        if (aRisk !== bRisk) return bRisk - aRisk; // Higher risk first
      }

      if (batchReview.reviewCriteria.prioritizeBySLA) {
        const now = new Date();
        const aHours = differenceInHours(now, parseISO(a.created_at));
        const bHours = differenceInHours(now, parseISO(b.created_at));
        const aThreshold = SLA_THRESHOLDS[a.priority as keyof typeof SLA_THRESHOLDS]?.warning || 48;
        const bThreshold = SLA_THRESHOLDS[b.priority as keyof typeof SLA_THRESHOLDS]?.warning || 48;
        
        const aOverdue = aHours > aThreshold;
        const bOverdue = bHours > bThreshold;
        
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      }

      // Emergency requests first
      if (a.is_emergency !== b.is_emergency) {
        return a.is_emergency ? -1 : 1;
      }

      // Priority order
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Age (oldest first for same priority)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredRequests, batchReview.reviewCriteria, decisionSupport]);

  const overdueRequests = useMemo(() => {
    return prioritizedRequests.filter(request => {
      const hoursElapsed = differenceInHours(new Date(), parseISO(request.created_at));
      const threshold = SLA_THRESHOLDS[request.priority as keyof typeof SLA_THRESHOLDS]?.critical || 168;
      return hoursElapsed > threshold;
    });
  }, [prioritizedRequests]);

  const riskDistribution = useMemo(() => {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    
    prioritizedRequests.forEach(request => {
      const support = decisionSupport.get(request.id);
      if (support) {
        const riskLevel = RISK_LEVELS.find(level => support.riskScore <= level.threshold);
        if (riskLevel) {
          distribution[riskLevel.value as keyof typeof distribution]++;
        }
      }
    });
    
    return distribution;
  }, [prioritizedRequests, decisionSupport]);

  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'intelligent_approve',
      label: 'Smart Approve',
      icon: <Brain className="h-4 w-4" />,
      action: (request) => handleIntelligentAction(request, 'approve'),
      condition: (request) => {
        const suggestions = intelligentSuggestions.get(request.id);
        return suggestions?.some(s => s.type === 'auto_approve' && s.confidence > 0.8) || false;
      },
      shortcut: 'S',
      color: 'success',
      intelligentSuggestion: true,
      learningEnabled: true
    },
    {
      id: 'quick_approve',
      label: 'Quick Approve',
      icon: <CheckCircle2 className="h-4 w-4" />,
      action: (request) => handleQuickDecision(request, 'approve'),
      condition: (request) => request.status === 'pending',
      shortcut: 'A',
      color: 'success'
    },
    {
      id: 'quick_deny',
      label: 'Quick Deny',
      icon: <XCircle className="h-4 w-4" />,
      action: (request) => handleQuickDecision(request, 'deny'),
      condition: (request) => request.status === 'pending',
      shortcut: 'D',
      color: 'destructive',
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to deny this request?'
    },
    {
      id: 'conditional_approve',
      label: 'Conditional Approve',
      icon: <Check className="h-4 w-4" />,
      action: (request) => handleQuickDecision(request, 'conditional_approve'),
      condition: (request) => request.status === 'pending',
      shortcut: 'C',
      color: 'warning'
    },
    {
      id: 'request_info',
      label: 'Request Info',
      icon: <Info className="h-4 w-4" />,
      action: (request) => handleQuickDecision(request, 'request_info'),
      condition: (request) => request.status === 'pending',
      shortcut: 'I',
      color: 'default'
    },
    {
      id: 'view_details',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      action: (request) => setSelectedRequest(request),
      shortcut: 'V',
      color: 'default'
    },
    {
      id: 'collaborate',
      label: 'Collaborate',
      icon: <Users className="h-4 w-4" />,
      action: (request) => initiateCollaboration(request),
      condition: (request) => enableCollaboration,
      shortcut: 'O',
      color: 'default'
    }
  ], [intelligentSuggestions, enableCollaboration]);

  // ===================== EFFECTS =====================

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      autoRefreshRef.current = setInterval(() => {
        refreshAccessRequests();
        setLastRefresh(new Date());
        updateCollaborationContext();
      }, refreshInterval);

      return () => {
        if (autoRefreshRef.current) {
          clearInterval(autoRefreshRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refreshAccessRequests]);

  useEffect(() => {
    if (enableRealTimeUpdates && isConnected) {
      const subscription = subscribe('access_request_review', (data: any) => {
        if (data.type === 'request_updated' || data.type === 'new_review_required') {
          refreshAccessRequests();
          toast.info('New reviews available');
        } else if (data.type === 'reviewer_activity') {
          updateCollaborationActivity(data);
        } else if (data.type === 'expert_consultation') {
          updateExpertConsultation(data);
        }
      });

      return () => unsubscribe(subscription);
    }
  }, [enableRealTimeUpdates, isConnected, subscribe, unsubscribe, refreshAccessRequests]);

  useEffect(() => {
    if (enableKeyboardShortcuts) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return;
        }

        const key = event.key.toLowerCase();
        const action = keyboardShortcutsRef.current.get(key);
        
        if (action && selectedRequest) {
          event.preventDefault();
          action();
        }

        switch (key) {
          case 'r':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              refreshAccessRequests();
            }
            break;
          case 'escape':
            setSelectedRequest(null);
            clearSelection();
            break;
          case 'arrowup':
            if (selectedRequest) {
              event.preventDefault();
              navigateToAdjacentRequest(-1);
            }
            break;
          case 'arrowdown':
            if (selectedRequest) {
              event.preventDefault();
              navigateToAdjacentRequest(1);
            }
            break;
          case 'b':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              if (selectedRequests.length > 0) {
                startBatchReview(selectedRequests);
              }
            }
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableKeyboardShortcuts, selectedRequest, selectedRequests, refreshAccessRequests]);

  useEffect(() => {
    if (showAnalytics) {
      loadReviewMetrics();
    }
  }, [showAnalytics, currentUser]);

  useEffect(() => {
    if (showDecisionSupport && selectedRequest) {
      loadDecisionSupport(selectedRequest);
    }
  }, [showDecisionSupport, selectedRequest]);

  useEffect(() => {
    if (enableIntelligentSuggestions) {
      loadIntelligentSuggestions();
    }
  }, [enableIntelligentSuggestions, prioritizedRequests]);

  useEffect(() => {
    if (enableWorkflowAutomation) {
      loadWorkflowAutomation();
    }
  }, [enableWorkflowAutomation]);

  // ===================== HANDLERS =====================

  const loadReviewMetrics = async () => {
    try {
      const analytics = await getAccessRequestAnalytics();
      if (analytics.success && analytics.data) {
        const metricsData: ReviewMetrics = {
          totalPending: filteredRequests.filter(r => r.status === 'pending').length,
          reviewedToday: analytics.data.reviewedToday || 0,
          averageReviewTime: analytics.data.averageReviewTime || 0,
          approvalRate: analytics.data.approvalRate || 0,
          overdueCount: overdueRequests.length,
          myPendingCount: filteredRequests.filter(r => r.reviewer?.id === currentUser?.id && r.status === 'pending').length,
          highPriorityCount: filteredRequests.filter(r => ['high', 'critical'].includes(r.priority || 'medium')).length,
          emergencyCount: filteredRequests.filter(r => r.is_emergency).length,
          slaCompliance: analytics.data.slaCompliance || 0,
          riskDistribution,
          workloadDistribution: analytics.data.workloadDistribution || [],
          performanceMetrics: analytics.data.performanceMetrics || {
            accuracyScore: 0,
            speedScore: 0,
            consistencyScore: 0,
            learningTrend: 0
          },
          predictiveInsights: analytics.data.predictiveInsights || {
            expectedApprovals: 0,
            expectedDenials: 0,
            riskAreas: [],
            improvementSuggestions: []
          }
        };
        setReviewMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to load review metrics:', error);
    }
  };

  const loadDecisionSupport = async (request: AccessRequest) => {
    if (decisionSupport.has(request.id)) return;

    try {
      const support = await getDecisionSupport(request.id);
      if (support.success && support.data) {
        setDecisionSupport(prev => new Map(prev).set(request.id, support.data));
      }
    } catch (error) {
      console.error('Failed to load decision support:', error);
    }
  };

  const loadIntelligentSuggestions = async () => {
    if (prioritizedRequests.length === 0) return;

    try {
      const requestIds = prioritizedRequests.slice(0, 10).map(r => r.id);
      const suggestions = await getIntelligentSuggestions(requestIds);
      
      if (suggestions.success && suggestions.data) {
        const suggestionsMap = new Map<number, IntelligentSuggestion[]>();
        
        Object.entries(suggestions.data).forEach(([requestId, requestSuggestions]) => {
          suggestionsMap.set(parseInt(requestId), requestSuggestions as IntelligentSuggestion[]);
        });
        
        setIntelligentSuggestions(suggestionsMap);
      }
    } catch (error) {
      console.error('Failed to load intelligent suggestions:', error);
    }
  };

  const loadWorkflowAutomation = async () => {
    try {
      // Load automation rules and ML model status
      const automation: WorkflowAutomation = {
        rules: AUTOMATION_TEMPLATES.map((template, index) => ({
          id: `rule_${index}`,
          name: template.name,
          conditions: template.conditions,
          actions: template.actions,
          isActive: true,
          priority: index + 1,
          successRate: 0.85 + Math.random() * 0.1 // Simulated success rate
        })),
        triggers: [],
        machineLearning: {
          isEnabled: true,
          modelVersion: '2.1.0',
          accuracy: 0.89,
          lastTrainingDate: subDays(new Date(), 7).toISOString(),
          improvementSuggestions: [
            'Increase training data for emergency requests',
            'Refine risk scoring algorithm',
            'Add contextual business rules'
          ]
        }
      };
      
      setWorkflowAutomation(automation);
    } catch (error) {
      console.error('Failed to load workflow automation:', error);
    }
  };

  const handleQuickDecision = async (request: AccessRequest, decision: string) => {
    setCurrentDecision({ 
      requestId: request.id, 
      decision: decision as any,
      confidenceScore: 0.8 // Default confidence for manual decisions
    });
    setSelectedRequest(request);
    
    if (decision === 'approve' || decision === 'deny') {
      setShowDecisionDialog(true);
    } else {
      await executeDecision({
        requestId: request.id,
        decision: decision as any,
        comment: `Quick ${decision} action`,
        confidenceScore: 0.8
      });
    }
  };

  const handleIntelligentAction = async (request: AccessRequest, suggestedAction: string) => {
    const suggestions = intelligentSuggestions.get(request.id);
    const suggestion = suggestions?.find(s => s.type === `auto_${suggestedAction}`);
    
    if (suggestion && suggestion.confidence > 0.8) {
      await executeDecision({
        requestId: request.id,
        decision: suggestedAction as any,
        comment: `AI-suggested ${suggestedAction}: ${suggestion.reasoning.join(', ')}`,
        confidenceScore: suggestion.confidence,
        conditions: suggestion.conditions
      });
      
      // Record learning feedback
      recordLearningFeedback(request.id, suggestion, 'accepted');
    }
  };

  const executeDecision = async (decision: ReviewDecision) => {
    try {
      setIsSubmittingDecision(true);
      const startTime = Date.now();

      // Create audit log entry
      await createAuditLog({
        eventType: 'access_request_review',
        category: 'authorization',
        action: `review_decision_${decision.decision}`,
        resourceType: 'access_request',
        resourceId: decision.requestId.toString(),
        details: {
          decision: decision.decision,
          comment: decision.comment,
          confidenceScore: decision.confidenceScore,
          conditions: decision.conditions
        },
        metadata: {
          source: 'access_review_interface',
          version: '1.0.0',
          reviewerId: currentUser?.id
        }
      });

      switch (decision.decision) {
        case 'approve':
          await approveAccessRequest(decision.requestId, {
            comment: decision.comment,
            conditions: decision.conditions,
            expiresAt: decision.expiryDate?.toISOString(),
            businessJustification: decision.businessJustification,
            riskMitigation: decision.riskMitigation
          });
          break;

        case 'conditional_approve':
          await approveAccessRequest(decision.requestId, {
            comment: decision.comment,
            conditions: {
              ...decision.conditions,
              conditional: true,
              conditionDetails: conditionalApprovalConditions
            },
            expiresAt: decision.expiryDate?.toISOString(),
            requiresFollowUp: true
          });
          break;

        case 'temporary_approve':
          await approveAccessRequest(decision.requestId, {
            comment: decision.comment,
            conditions: decision.conditions,
            expiresAt: temporaryApprovalExpiry?.toISOString(),
            temporary: true,
            autoRevoke: true
          });
          break;

        case 'deny':
          await denyAccessRequest(decision.requestId, {
            reason: decision.comment || 'Request denied',
            comment: decision.comment,
            businessJustification: decision.businessJustification,
            alternativeSuggestions: decision.followUpActions
          });
          break;

        case 'request_info':
          await requestMoreInformation(decision.requestId, {
            questions: requestInfoQuestions.filter(q => q.trim()),
            comment: decision.comment,
            deadline: decision.reviewDate?.toISOString()
          });
          break;

        case 'delegate':
          if (decision.delegateToUserId) {
            await delegateReview(decision.requestId, decision.delegateToUserId, decision.comment);
          }
          break;

        case 'escalate':
          await escalateAccessRequest(decision.requestId, {
            reason: decision.escalateReason || 'Escalated for review',
            comment: decision.comment,
            urgency: 'high',
            requiresExpertise: true
          });
          break;
      }

      // Record performance metrics
      const reviewTime = Date.now() - startTime;
      performanceMetricsRef.current.reviewTimes.push(reviewTime);

      // Send notifications if configured
      if (decision.notificationSettings?.notifyRequester) {
        await sendNotification({
          userId: selectedRequest?.user_id || 0,
          type: 'access_request_update',
          title: `Access Request ${decision.decision.replace('_', ' ')}`,
          message: decision.comment || `Your access request has been ${decision.decision.replace('_', ' ')}.`,
          metadata: { requestId: decision.requestId }
        });
      }

      toast.success(`Request ${decision.decision.replace('_', ' ')}ed successfully`);
      
      // Update batch review state if applicable
      if (batchReview.isReviewing) {
        updateBatchProgress(decision);
        
        if (batchReview.autoAdvance) {
          advanceToNextRequest();
        }
      }

      setShowDecisionDialog(false);
      resetDecisionState();
      
    } catch (error) {
      console.error('Failed to execute decision:', error);
      toast.error('Failed to execute decision');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const updateBatchProgress = (decision: ReviewDecision) => {
    setBatchReview(prev => {
      const newDecisions = new Map(prev.decisions).set(decision.requestId, decision);
      const completed = newDecisions.size;
      const total = prev.selectedRequests.length;
      
      let approvedCount = 0;
      let deniedCount = 0;
      let delegatedCount = 0;
      let escalatedCount = 0;
      
      newDecisions.forEach(d => {
        switch (d.decision) {
          case 'approve':
          case 'conditional_approve':
          case 'temporary_approve':
            approvedCount++;
            break;
          case 'deny':
            deniedCount++;
            break;
          case 'delegate':
            delegatedCount++;
            break;
          case 'escalate':
            escalatedCount++;
            break;
        }
      });
      
      const averageTime = performanceMetricsRef.current.reviewTimes.length > 0
        ? performanceMetricsRef.current.reviewTimes.reduce((a, b) => a + b, 0) / performanceMetricsRef.current.reviewTimes.length
        : 0;
      
      const estimatedCompletion = (total - completed) * averageTime;
      const efficiency = completed > 0 ? (completed / total) * 100 : 0;
      
      return {
        ...prev,
        decisions: newDecisions,
        progressMetrics: {
          ...prev.progressMetrics,
          totalRequests: total,
          completedRequests: completed,
          approvedCount,
          deniedCount,
          delegatedCount,
          escalatedCount,
          averageReviewTime: averageTime,
          estimatedCompletionTime: estimatedCompletion,
          currentEfficiency: efficiency,
          qualityScore: calculateQualityScore(newDecisions)
        }
      };
    });
  };

  const calculateQualityScore = (decisions: Map<number, ReviewDecision>): number => {
    let totalScore = 0;
    let count = 0;
    
    decisions.forEach(decision => {
      if (decision.confidenceScore) {
        totalScore += decision.confidenceScore;
        count++;
      }
    });
    
    return count > 0 ? (totalScore / count) * 100 : 0;
  };

  const resetDecisionState = () => {
    setCurrentDecision({});
    setDecisionComment('');
    setDelegateToUser(null);
    setEscalationReason('');
    setRequestInfoQuestions(['']);
    setConditionalApprovalConditions({});
    setTemporaryApprovalExpiry(null);
  };

  const startBatchReview = (requests: AccessRequest[]) => {
    setBatchReview(prev => ({
      ...prev,
      selectedRequests: requests,
      currentIndex: 0,
      decisions: new Map(),
      isReviewing: true,
      progressMetrics: {
        ...prev.progressMetrics,
        totalRequests: requests.length,
        completedRequests: 0,
        approvedCount: 0,
        deniedCount: 0,
        delegatedCount: 0,
        escalatedCount: 0
      }
    }));
    setViewMode('batch');
    setReviewStartTime(new Date());
  };

  const advanceToNextRequest = () => {
    setBatchReview(prev => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.selectedRequests.length - 1)
    }));
  };

  const goToPreviousRequest = () => {
    setBatchReview(prev => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0)
    }));
  };

  const navigateToAdjacentRequest = (direction: 1 | -1) => {
    if (!selectedRequest) return;
    
    const currentIndex = prioritizedRequests.findIndex(r => r.id === selectedRequest.id);
    if (currentIndex === -1) return;
    
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < prioritizedRequests.length) {
      setSelectedRequest(prioritizedRequests[newIndex]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRequests.length === 0) {
      toast.error('No requests selected');
      return;
    }

    try {
      switch (action) {
        case 'bulk_approve':
          const approvals = selectedRequests.map(req => ({
            requestId: req.id,
            action: 'approve' as const,
            comment: 'Bulk approval'
          }));
          await bulkReviewRequests(approvals);
          break;
          
        case 'bulk_deny':
          const denials = selectedRequests.map(req => ({
            requestId: req.id,
            action: 'deny' as const,
            comment: 'Bulk denial'
          }));
          await bulkReviewRequests(denials);
          break;
          
        case 'start_batch_review':
          startBatchReview(selectedRequests);
          break;
          
        case 'intelligent_batch':
          await executeIntelligentBatch(selectedRequests);
          break;
      }
      
      clearSelection();
      toast.success(`Bulk action completed for ${selectedRequests.length} requests`);
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Bulk action failed');
    }
  };

  const executeIntelligentBatch = async (requests: AccessRequest[]) => {
    try {
      const decisions: ReviewDecision[] = [];
      
      for (const request of requests) {
        const suggestions = intelligentSuggestions.get(request.id);
        const highConfidenceSuggestion = suggestions?.find(s => s.confidence > 0.9);
        
        if (highConfidenceSuggestion) {
          decisions.push({
            requestId: request.id,
            decision: highConfidenceSuggestion.type.replace('auto_', '') as any,
            comment: `AI Batch Decision: ${highConfidenceSuggestion.reasoning.join(', ')}`,
            confidenceScore: highConfidenceSuggestion.confidence,
            conditions: highConfidenceSuggestion.conditions
          });
        }
      }
      
      if (decisions.length > 0) {
        for (const decision of decisions) {
          await executeDecision(decision);
        }
        toast.success(`Intelligent batch processing completed for ${decisions.length} requests`);
      } else {
        toast.warning('No high-confidence suggestions available for batch processing');
      }
    } catch (error) {
      console.error('Intelligent batch processing failed:', error);
      toast.error('Intelligent batch processing failed');
    }
  };

  const initiateCollaboration = async (request: AccessRequest) => {
    try {
      // Find relevant experts based on request type and resource
      const experts = users.filter(user => 
        user.roles?.some(role => 
          role.permissions?.some(perm => 
            perm.resource_type === request.resource_type
          )
        )
      );
      
      if (experts.length > 0) {
        const collaboration = {
          requestId: request.id,
          initiator: currentUser!,
          experts: experts.slice(0, 3), // Limit to top 3 experts
          consultationType: 'review_assistance',
          urgency: request.is_emergency ? 'high' : 'normal',
          expertise_required: [request.resource_type, request.requested_role]
        };
        
        // Update collaboration context
        setCollaborationContext(prev => ({
          ...prev,
          expertConsultations: new Map(prev.expertConsultations).set(request.id, {
            expert: experts[0],
            domain: request.resource_type,
            consultation: 'Expert review requested',
            recommendations: []
          })
        }));
        
        // Send notifications to experts
        for (const expert of experts.slice(0, 2)) {
          await sendNotification({
            userId: expert.id,
            type: 'collaboration_request',
            title: 'Expert Consultation Requested',
            message: `Your expertise is requested for access request #${request.id}`,
            metadata: { requestId: request.id, urgency: collaboration.urgency }
          });
        }
        
        toast.success('Expert consultation initiated');
      } else {
        toast.warning('No suitable experts found for this request type');
      }
    } catch (error) {
      console.error('Failed to initiate collaboration:', error);
      toast.error('Failed to initiate collaboration');
    }
  };

  const updateCollaborationContext = async () => {
    try {
      // Update active reviewers and recent activity
      setCollaborationContext(prev => ({
        ...prev,
        realTimeActivity: [
          ...prev.realTimeActivity.slice(-20), // Keep last 20 activities
          {
            userId: currentUser?.id || 0,
            action: 'reviewing_requests',
            timestamp: new Date().toISOString()
          }
        ]
      }));
    } catch (error) {
      console.error('Failed to update collaboration context:', error);
    }
  };

  const updateCollaborationActivity = (data: any) => {
    setCollaborationContext(prev => ({
      ...prev,
      realTimeActivity: [
        ...prev.realTimeActivity.slice(-19),
        {
          userId: data.userId,
          action: data.action,
          timestamp: data.timestamp,
          requestId: data.requestId
        }
      ]
    }));
  };

  const updateExpertConsultation = (data: any) => {
    setCollaborationContext(prev => ({
      ...prev,
      expertConsultations: new Map(prev.expertConsultations).set(data.requestId, {
        expert: data.expert,
        domain: data.domain,
        consultation: data.consultation,
        recommendations: data.recommendations
      })
    }));
  };

  const recordLearningFeedback = async (requestId: number, suggestion: IntelligentSuggestion, feedback: 'accepted' | 'rejected' | 'modified') => {
    try {
      // Record feedback for ML model improvement
      await createAuditLog({
        eventType: 'ml_feedback',
        category: 'system',
        action: `suggestion_${feedback}`,
        resourceType: 'access_request',
        resourceId: requestId.toString(),
        details: {
          suggestion,
          feedback,
          confidence: suggestion.confidence,
          reviewerId: currentUser?.id
        },
        metadata: {
          source: 'intelligent_suggestions',
          version: workflowAutomation.machineLearning.modelVersion
        }
      });
    } catch (error) {
      console.error('Failed to record learning feedback:', error);
    }
  };

  // ===================== RENDER HELPERS =====================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center space-x-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Intelligent Review Dashboard
              </h1>
            </div>
            
            {reviewMetrics && (
              <div className="flex space-x-2">
                <Badge variant="outline" className="text-sm bg-white/50">
                  <Clock className="h-3 w-3 mr-1" />
                  {reviewMetrics.myPendingCount} pending reviews
                </Badge>
                {reviewMetrics.highPriorityCount > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {reviewMetrics.highPriorityCount} high priority
                  </Badge>
                )}
                {workflowAutomation.machineLearning.isEnabled && (
                  <Badge variant="secondary" className="text-sm bg-green-100 text-green-800">
                    <Brain className="h-3 w-3 mr-1" />
                    AI: {Math.round(workflowAutomation.machineLearning.accuracy * 100)}%
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{currentUser?.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatDistanceToNow(lastRefresh, { addSuffix: true })}</span>
            </div>
            {enableRealTimeUpdates && (
              <div className="flex items-center space-x-1 text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Live</span>
              </div>
            )}
            {overdueRequests.length > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{overdueRequests.length} overdue</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Performance Metrics */}
        {reviewMetrics && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-white/70 rounded-lg">
            <Gauge className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              Efficiency: {Math.round(reviewMetrics.performanceMetrics.speedScore)}%
            </span>
          </div>
        )}

        {/* View Mode Toggle */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="bg-white/70">
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="cards">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="batch">
              <Layers className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="kanban">
              <GitBranch className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Analytics */}
        {showAnalytics && (
          <Button variant="outline" size="sm" onClick={() => setShowMetricsDialog(true)} className="bg-white/70">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        )}

        {/* Automation */}
        {enableWorkflowAutomation && (
          <Button variant="outline" size="sm" onClick={() => setShowAutomationDialog(true)} className="bg-white/70">
            <Zap className="h-4 w-4 mr-2" />
            Automation
          </Button>
        )}

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refreshAccessRequests();
            setLastRefresh(new Date());
          }}
          disabled={isRefreshing}
          className="bg-white/70"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="flex items-center justify-between p-4 border-b bg-muted/20">
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search requests by ID, requester, resource, or content..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex space-x-2">
          <Button
            variant={filters.priority === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltersState(prev => ({
              ...prev,
              priority: prev.priority === 'critical' ? undefined : 'critical'
            }))}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            Critical
          </Button>
          
          <Button
            variant={filters.isEmergency ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltersState(prev => ({
              ...prev,
              isEmergency: !prev.isEmergency
            }))}
          >
            <Flag className="h-4 w-4 mr-1" />
            Emergency
          </Button>

          {enableIntelligentSuggestions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const intelligentRequestIds = Array.from(intelligentSuggestions.keys());
                setFiltersState(prev => ({
                  ...prev,
                  hasIntelligentSuggestions: true
                }));
              }}
            >
              <Brain className="h-4 w-4 mr-1" />
              AI Suggestions
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersState(prev => ({
              ...prev,
              overdueOnly: true
            }))}
          >
            <Timer className="h-4 w-4 mr-1" />
            Overdue ({overdueRequests.length})
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Button variant="outline" size="sm" onClick={() => setShowFiltersDialog(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Advanced
            {Object.values(filters).some(v => 
              Array.isArray(v) ? v.length > 0 : v !== undefined && v !== '' && v !== false
            ) && (
              <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                Active
              </Badge>
            )}
          </Button>
        )}

        {/* Clear Filters */}
        {Object.values(filters).some(v => 
          Array.isArray(v) ? v.length > 0 : v !== undefined && v !== '' && v !== false
        ) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Collaboration Indicator */}
        {enableCollaboration && collaborationContext.activeReviewers.length > 0 && (
          <div className="flex items-center space-x-2 px-2 py-1 bg-blue-50 rounded">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600">
              {collaborationContext.activeReviewers.length} active reviewer{collaborationContext.activeReviewers.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <DropdownMenuRadioItem value="smart_priority">Smart Priority</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="risk_score">Risk Score</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="sla_deadline">SLA Deadline</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="created_at">Created Date</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="requester">Requester</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
              {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bulk Actions */}
        {showBulkActions && selectedRequests.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Bulk Actions ({selectedRequests.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleBulkAction('intelligent_batch')}>
                <Brain className="mr-2 h-4 w-4" />
                Intelligent Batch Process
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAction('bulk_approve')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('bulk_deny')}>
                <XCircle className="mr-2 h-4 w-4" />
                Deny All
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleBulkAction('start_batch_review')}>
                <Layers className="mr-2 h-4 w-4" />
                Start Batch Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Selection Info */}
        {selectedRequests.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedRequests.length} selected
            </span>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Results Count */}
        <span className="text-sm text-muted-foreground">
          {filteredRequests.length} of {totalCount} requests
        </span>
      </div>
    </div>
  );

  // ===================== LOADING STATE =====================

  if (isLoading && !accessRequests.length) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="flex items-center justify-center flex-1">
          <div className="space-y-4 text-center">
            <div className="relative">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <Brain className="h-4 w-4 absolute top-0 right-0 text-blue-600" />
            </div>
            <div className="text-lg font-medium">Loading intelligent review dashboard...</div>
            <div className="text-sm text-muted-foreground">
              Preparing AI-powered decision support
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN RENDER =====================

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {renderHeader()}
        {renderFilters()}
        
        {/* Error State */}
        {error && (
          <div className="p-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Error: {error}</span>
              <Button
                variant="link"
                size="sm"
                onClick={refreshAccessRequests}
                className="text-red-800 underline"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Content based on view mode */}
              {viewMode === 'list' && (
                <div className="flex-1 overflow-auto">
                  <IntelligentRequestList
                    requests={prioritizedRequests}
                    selectedRequests={selectedRequests}
                    decisionSupport={decisionSupport}
                    intelligentSuggestions={intelligentSuggestions}
                    quickActions={quickActions}
                    onRequestSelect={setSelectedRequest}
                    onRequestToggle={toggleRequestSelection}
                    onQuickAction={(request, action) => action.action(request)}
                    showRiskAssessment={showRiskAssessment}
                    enableIntelligentSuggestions={enableIntelligentSuggestions}
                  />
                </div>
              )}
              
              {viewMode === 'batch' && (
                <BatchReviewInterface
                  batchReview={batchReview}
                  setBatchReview={setBatchReview}
                  onDecision={executeDecision}
                  onAdvance={advanceToNextRequest}
                  onPrevious={goToPreviousRequest}
                  decisionSupport={decisionSupport}
                  intelligentSuggestions={intelligentSuggestions}
                />
              )}
            </div>

            {/* Side Panel for Decision Support */}
            {selectedRequest && showDecisionSupport && (
              <div className="w-96 border-l bg-muted/10 overflow-auto">
                <DecisionSupportPanel
                  request={selectedRequest}
                  decisionSupport={decisionSupport.get(selectedRequest.id)}
                  intelligentSuggestions={intelligentSuggestions.get(selectedRequest.id)}
                  collaborationContext={collaborationContext}
                  onDecision={executeDecision}
                  onCollaborate={() => initiateCollaboration(selectedRequest)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Decision Dialog */}
        <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {currentDecision.decision === 'approve' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {currentDecision.decision === 'deny' && <XCircle className="h-5 w-5 text-red-600" />}
                {currentDecision.decision === 'conditional_approve' && <Check className="h-5 w-5 text-yellow-600" />}
                {currentDecision.decision === 'temporary_approve' && <Timer className="h-5 w-5 text-blue-600" />}
                <span>
                  {currentDecision.decision?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Request
                </span>
              </DialogTitle>
              <DialogDescription>
                Provide details and conditions for this decision
              </DialogDescription>
            </DialogHeader>

            <DecisionDialog
              decision={currentDecision}
              onDecisionChange={setCurrentDecision}
              comment={decisionComment}
              onCommentChange={setDecisionComment}
              delegateToUser={delegateToUser}
              onDelegateUserChange={setDelegateToUser}
              escalationReason={escalationReason}
              onEscalationReasonChange={setEscalationReason}
              requestInfoQuestions={requestInfoQuestions}
              onRequestInfoQuestionsChange={setRequestInfoQuestions}
              conditionalApprovalConditions={conditionalApprovalConditions}
              onConditionalApprovalConditionsChange={setConditionalApprovalConditions}
              temporaryApprovalExpiry={temporaryApprovalExpiry}
              onTemporaryApprovalExpiryChange={setTemporaryApprovalExpiry}
              users={users}
              isSubmitting={isSubmittingDecision}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => executeDecision(currentDecision as ReviewDecision)}
                disabled={isSubmittingDecision}
                className={cn(
                  currentDecision.decision === 'approve' && "bg-green-600 hover:bg-green-700",
                  currentDecision.decision === 'deny' && "bg-red-600 hover:bg-red-700",
                  currentDecision.decision === 'conditional_approve' && "bg-yellow-600 hover:bg-yellow-700",
                  currentDecision.decision === 'temporary_approve' && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isSubmittingDecision ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {currentDecision.decision === 'approve' && <CheckCircle2 className="mr-2 h-4 w-4" />}
                    {currentDecision.decision === 'deny' && <XCircle className="mr-2 h-4 w-4" />}
                    {currentDecision.decision === 'conditional_approve' && <Check className="mr-2 h-4 w-4" />}
                    {currentDecision.decision === 'temporary_approve' && <Timer className="mr-2 h-4 w-4" />}
                  </>
                )}
                Execute Decision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Additional dialogs would be rendered here (Metrics, Automation, etc.) */}
      </div>
    </TooltipProvider>
  );
};

// ===================== SUB-COMPONENTS =====================

interface IntelligentRequestListProps {
  requests: AccessRequest[];
  selectedRequests: AccessRequest[];
  decisionSupport: Map<number, DecisionSupport>;
  intelligentSuggestions: Map<number, IntelligentSuggestion[]>;
  quickActions: QuickAction[];
  onRequestSelect: (request: AccessRequest) => void;
  onRequestToggle: (request: AccessRequest) => void;
  onQuickAction: (request: AccessRequest, action: QuickAction) => void;
  showRiskAssessment: boolean;
  enableIntelligentSuggestions: boolean;
}

const IntelligentRequestList: React.FC<IntelligentRequestListProps> = ({
  requests,
  selectedRequests,
  decisionSupport,
  intelligentSuggestions,
  quickActions,
  onRequestSelect,
  onRequestToggle,
  onQuickAction,
  showRiskAssessment,
  enableIntelligentSuggestions
}) => {
  return (
    <div className="p-4 space-y-2">
      {requests.map((request) => {
        const support = decisionSupport.get(request.id);
        const suggestions = intelligentSuggestions.get(request.id);
        const isSelected = selectedRequests.some(r => r.id === request.id);
        const highConfidenceSuggestion = suggestions?.find(s => s.confidence > 0.8);

        return (
          <Card 
            key={request.id} 
            className={cn(
              "transition-all duration-200 hover:shadow-md cursor-pointer",
              isSelected && "ring-2 ring-primary ring-offset-2",
              request.is_emergency && "border-red-200 bg-red-50/30",
              support?.riskScore && support.riskScore > 70 && "border-orange-200 bg-orange-50/30",
              highConfidenceSuggestion && "border-blue-200 bg-blue-50/30"
            )}
            onClick={() => onRequestSelect(request)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between space-x-4">
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onRequestToggle(request)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-sm">#{request.id}</span>
                      
                      {request.is_emergency && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Emergency
                        </Badge>
                      )}

                      {/* Priority Badge */}
                      <PriorityBadge priority={request.priority} />

                      {/* Risk Score */}
                      {showRiskAssessment && support?.riskScore && (
                        <Badge 
                          variant={support.riskScore > 70 ? "destructive" : support.riskScore > 40 ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          Risk: {support.riskScore}
                        </Badge>
                      )}

                      {/* AI Suggestion */}
                      {enableIntelligentSuggestions && highConfidenceSuggestion && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          <Brain className="mr-1 h-3 w-3" />
                          AI: {Math.round(highConfidenceSuggestion.confidence * 100)}%
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={request.user?.avatar} />
                            <AvatarFallback className="text-xs">
                              {request.user?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{request.user?.email}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(parseISO(request.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Database className="h-3 w-3" />
                          <span>{request.resource_type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Key className="h-3 w-3" />
                          <span>{request.requested_role}</span>
                        </div>
                      </div>

                      {/* AI Suggestion Preview */}
                      {enableIntelligentSuggestions && highConfidenceSuggestion && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <div className="flex items-center space-x-1 mb-1">
                            <Brain className="h-3 w-3 text-blue-600" />
                            <span className="font-medium text-blue-800">AI Suggestion:</span>
                            <span className="capitalize text-blue-700">
                              {highConfidenceSuggestion.type.replace('auto_', '')}
                            </span>
                          </div>
                          <div className="text-blue-600">
                            {highConfidenceSuggestion.reasoning[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-1">
                  {/* Smart Action Button */}
                  {enableIntelligentSuggestions && highConfidenceSuggestion && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        const smartAction = quickActions.find(a => a.intelligentSuggestion);
                        if (smartAction) onQuickAction(request, smartAction);
                      }}
                      className="bg-blue-50 border-blue-200 hover:bg-blue-100"
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      Smart
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {quickActions
                        .filter(action => !action.condition || action.condition(request))
                        .map((action) => (
                          <DropdownMenuItem
                            key={action.id}
                            onClick={() => onQuickAction(request, action)}
                            className={cn(
                              action.color === 'success' && "text-green-600",
                              action.color === 'destructive' && "text-red-600",
                              action.color === 'warning' && "text-yellow-600",
                              action.intelligentSuggestion && "bg-blue-50"
                            )}
                          >
                            {action.icon}
                            <span className="ml-2">{action.label}</span>
                            {action.shortcut && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                {action.shortcut}
                              </span>
                            )}
                            {action.intelligentSuggestion && (
                              <Brain className="ml-2 h-3 w-3 text-blue-600" />
                            )}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const PriorityBadge: React.FC<{ priority?: string }> = ({ priority }) => {
  const config = REQUEST_PRIORITIES.find(p => p.value === priority);
  if (!config) return null;

  return (
    <Badge variant="outline" className={cn("text-xs", config.color)}>
      <config.icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Additional sub-components for BatchReviewInterface, DecisionSupportPanel, and DecisionDialog would go here
// Due to length constraints, I'm providing the core structure and key components

export default AccessReviewInterface;