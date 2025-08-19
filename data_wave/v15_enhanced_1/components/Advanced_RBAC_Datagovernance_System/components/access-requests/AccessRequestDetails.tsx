'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  MessageCircle,
  History,
  Settings,
  MoreHorizontal,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  PauseCircle,
  RefreshCw,
  Download,
  Share,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Database,
  Users,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  Timer,
  Flag,
  Tag,
  Paperclip,
  Send,
  Reply,
  Forward,
  Star,
  StarOff,
  Bookmark,
  BookmarkCheck,
  Bell,
  BellRing,
  Phone,
  Mail,
  MapPin,
  Building,
  Briefcase,
  Globe,
  Link,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  TrendingRight,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trash2,
  Archive,
  Folder,
  FolderOpen,
  File,
  Image,
  Video,
  Music,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FilePlus,
  FileEdit,
  FileCheck,
  FileX,
  Layers,
  Package,
  Grid,
  List,
  Columns,
  Rows,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem,
  CommandList,
  CommandSeparator 
} from '@/components/ui/command';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAccessRequests } from '../../hooks/useAccessRequests';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { format, formatDistanceToNow, parseISO, isAfter, isBefore, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import type { 
  AccessRequest, 
  AccessRequestUpdate
} from '../../types/access-request.types';
import type { User } from '../../types/user.types';
import type { Role } from '../../types/role.types';
import type { Resource } from '../../types/resource.types';

// ===================== INTERFACES & TYPES =====================

interface AccessRequestDetailsProps {
  requestId: number;
  className?: string;
  onClose?: () => void;
  onEdit?: (request: AccessRequest) => void;
  onDuplicate?: (request: AccessRequest) => void;
  onDelete?: (request: AccessRequest) => void;
  showBackButton?: boolean;
  showActions?: boolean;
  showComments?: boolean;
  showHistory?: boolean;
  showWorkflow?: boolean;
  showRelated?: boolean;
  enableRealTimeUpdates?: boolean;
  mode?: 'view' | 'edit' | 'review';
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'review' | 'notification' | 'automation';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  assignedTo?: User[];
  completedAt?: string;
  completedBy?: User;
  duration?: number;
  comments?: string;
  conditions?: Record<string, any>;
  order: number;
}

interface ActivityLog {
  id: string;
  type: 'status_change' | 'comment_added' | 'assignment_changed' | 'approval' | 'denial' | 'escalation' | 'delegation';
  description: string;
  user: User;
  timestamp: string;
  details?: Record<string, any>;
  metadata?: {
    from?: string;
    to?: string;
    reason?: string;
    attachments?: string[];
  };
}

interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: string;
  isPrivate: boolean;
  parentId?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  mentions?: User[];
  reactions?: Array<{
    emoji: string;
    users: User[];
  }>;
  isEdited?: boolean;
  editedAt?: string;
}

interface RelatedRequest {
  id: number;
  type: string;
  title: string;
  status: string;
  createdAt: string;
  relation: 'duplicate' | 'parent' | 'child' | 'related' | 'blocked_by' | 'blocks';
}

interface RequestMetrics {
  processingTime: number;
  approvalTime?: number;
  escalationCount: number;
  commentCount: number;
  viewCount: number;
  lastActivityAt: string;
  slaStatus: 'on_time' | 'at_risk' | 'overdue';
  slaDeadline?: string;
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
}

interface RequestEditState {
  justification: string;
  priority: string;
  dueDate?: string;
  tags: string[];
  isEmergency: boolean;
  businessJustification?: string;
  expectedDuration?: number;
  requiredApprovers?: User[];
  conditions?: Record<string, any>;
}

// ===================== CONSTANTS =====================

const REQUEST_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  { value: 'denied', label: 'Denied', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: PauseCircle },
  { value: 'expired', label: 'Expired', color: 'bg-orange-100 text-orange-800', icon: Timer },
  { value: 'needs_info', label: 'Needs Information', color: 'bg-blue-100 text-blue-800', icon: Info },
  { value: 'escalated', label: 'Escalated', color: 'bg-purple-100 text-purple-800', icon: TrendingUp }
];

const REQUEST_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-50 text-blue-700', icon: TrendingDown },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700', icon: Target },
  { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700', icon: TrendingUp },
  { value: 'critical', label: 'Critical', color: 'bg-red-50 text-red-700', icon: AlertTriangle }
];

const ACTIVITY_TYPES = {
  status_change: { icon: GitCommit, label: 'Status Changed' },
  comment_added: { icon: MessageCircle, label: 'Comment Added' },
  assignment_changed: { icon: Users, label: 'Assignment Changed' },
  approval: { icon: CheckCircle2, label: 'Approved' },
  denial: { icon: XCircle, label: 'Denied' },
  escalation: { icon: TrendingUp, label: 'Escalated' },
  delegation: { icon: Forward, label: 'Delegated' }
};

const SLA_THRESHOLDS = {
  low: { warning: 48, critical: 72 }, // hours
  medium: { warning: 24, critical: 48 },
  high: { warning: 8, critical: 24 },
  critical: { warning: 4, critical: 8 }
};

// ===================== MAIN COMPONENT =====================

export const AccessRequestDetails: React.FC<AccessRequestDetailsProps> = ({
  requestId,
  className,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  showBackButton = true,
  showActions = true,
  showComments = true,
  showHistory = true,
  showWorkflow = true,
  showRelated = true,
  enableRealTimeUpdates = true,
  mode = 'view'
}) => {
  // ===================== HOOKS & STATE =====================

  const { currentUser } = useCurrentUser();
  const { checkPermission } = usePermissionCheck();
  const { isConnected, subscribe, unsubscribe } = useRBACWebSocket();
  
  const {
    getAccessRequest,
    updateAccessRequest,
    approveAccessRequest,
    denyAccessRequest,
    cancelAccessRequest,
    escalateAccessRequest,
    delegateReview,
    addComment,
    getComments
  } = useAccessRequests({}, false);

  // Component state
  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [editState, setEditState] = useState<RequestEditState | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [relatedRequests, setRelatedRequests] = useState<RelatedRequest[]>([]);
  const [metrics, setMetrics] = useState<RequestMetrics | null>(null);
  
  // UI state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [showPrivateComments, setShowPrivateComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);
  const [isCommentPrivate, setIsCommentPrivate] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState<User[]>([]);
  
  // Dialog states
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDenyDialogOpen, setIsDenyDialogOpen] = useState(false);
  const [isEscalateDialogOpen, setIsEscalateDialogOpen] = useState(false);
  const [isDelegateDialogOpen, setIsDelegateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Action states
  const [approvalComment, setApprovalComment] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [delegateToUser, setDelegateToUser] = useState<User | null>(null);
  const [delegateMessage, setDelegateMessage] = useState('');

  // Refs
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ===================== COMPUTED VALUES =====================

  const requestStatus = useMemo(() => {
    return REQUEST_STATUSES.find(s => s.value === request?.status);
  }, [request?.status]);

  const requestPriority = useMemo(() => {
    return REQUEST_PRIORITIES.find(p => p.value === request?.priority);
  }, [request?.priority]);

  const workflowProgress = useMemo(() => {
    if (!workflowSteps.length) return 0;
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflowSteps.length) * 100;
  }, [workflowSteps]);

  const currentWorkflowStep = useMemo(() => {
    return workflowSteps.find(step => step.status === 'in_progress') || 
           workflowSteps.find(step => step.status === 'pending');
  }, [workflowSteps]);

  const slaStatus = useMemo(() => {
    if (!request || !metrics) return null;
    
    const priority = request.priority || 'medium';
    const thresholds = SLA_THRESHOLDS[priority as keyof typeof SLA_THRESHOLDS];
    const hoursElapsed = differenceInHours(new Date(), parseISO(request.created_at));
    
    if (hoursElapsed >= thresholds.critical) return 'overdue';
    if (hoursElapsed >= thresholds.warning) return 'at_risk';
    return 'on_time';
  }, [request, metrics]);

  const canEdit = useMemo(() => {
    if (!request || !currentUser) return false;
    return (
      (request.user_id === currentUser.id && ['draft', 'needs_info'].includes(request.status)) ||
      checkPermission('access_requests.edit')
    );
  }, [request, currentUser, checkPermission]);

  const canApprove = useMemo(() => {
    return request?.status === 'pending' && checkPermission('access_requests.approve');
  }, [request?.status, checkPermission]);

  const canDeny = useMemo(() => {
    return request?.status === 'pending' && checkPermission('access_requests.deny');
  }, [request?.status, checkPermission]);

  const canCancel = useMemo(() => {
    if (!request || !currentUser) return false;
    return (
      (request.user_id === currentUser.id && ['draft', 'pending'].includes(request.status)) ||
      checkPermission('access_requests.cancel')
    );
  }, [request, currentUser, checkPermission]);

  const canEscalate = useMemo(() => {
    return request?.status === 'pending' && checkPermission('access_requests.escalate');
  }, [request?.status, checkPermission]);

  const canDelegate = useMemo(() => {
    return request?.status === 'pending' && checkPermission('access_requests.delegate');
  }, [request?.status, checkPermission]);

  // ===================== EFFECTS =====================

  // Load request data
  useEffect(() => {
    const loadRequestData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [requestResponse, commentsResponse] = await Promise.all([
          getAccessRequest(requestId, true, true),
          showComments ? getComments(requestId) : Promise.resolve({ data: [] })
        ]);

        if (requestResponse.success && requestResponse.data) {
          setRequest(requestResponse.data);
          setEditState({
            justification: requestResponse.data.justification || '',
            priority: requestResponse.data.priority || 'medium',
            dueDate: requestResponse.data.due_date,
            tags: requestResponse.data.tags || [],
            isEmergency: requestResponse.data.is_emergency || false,
            businessJustification: requestResponse.data.business_justification,
            expectedDuration: requestResponse.data.expected_duration,
            requiredApprovers: requestResponse.data.required_approvers || [],
            conditions: requestResponse.data.conditions || {}
          });

          // Load related data
          await Promise.all([
            loadWorkflowSteps(requestId),
            loadActivityLog(requestId),
            loadRelatedRequests(requestId),
            loadMetrics(requestId)
          ]);
        } else {
          setError('Failed to load request details');
        }

        if (commentsResponse.success) {
          setComments(commentsResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to load request:', error);
        setError('Failed to load request details');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequestData();
  }, [requestId, getAccessRequest, getComments, showComments]);

  // Real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !isConnected) return;

    const subscription = subscribe(`access_request_${requestId}`, (data: any) => {
      if (data.type === 'request_updated') {
        setRequest(prev => prev ? { ...prev, ...data.updates } : null);
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
      } else if (data.type === 'comment_added') {
        setComments(prev => [data.comment, ...prev]);
      } else if (data.type === 'workflow_updated') {
        setWorkflowSteps(prev => prev.map(step => 
          step.id === data.stepId ? { ...step, ...data.updates } : step
        ));
      }
    });

    return () => unsubscribe(subscription);
  }, [enableRealTimeUpdates, isConnected, requestId, subscribe, unsubscribe]);

  // Auto-save for edit mode
  useEffect(() => {
    if (!isEditing || !editState || !request) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const updates: AccessRequestUpdate = {
          justification: editState.justification,
          priority: editState.priority,
          due_date: editState.dueDate,
          tags: editState.tags,
          is_emergency: editState.isEmergency,
          business_justification: editState.businessJustification,
          expected_duration: editState.expectedDuration,
          conditions: editState.conditions
        };

        await updateAccessRequest(request.id, updates);
        toast.success('Changes auto-saved', { duration: 2000 });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [editState, isEditing, request, updateAccessRequest]);

  // ===================== HANDLERS =====================

  const loadWorkflowSteps = async (requestId: number) => {
    try {
      // Mock workflow steps - replace with actual API call
      const mockSteps: WorkflowStep[] = [
        {
          id: '1',
          name: 'Initial Review',
          type: 'review',
          status: 'completed',
          assignedTo: [],
          completedAt: '2024-01-15T10:00:00Z',
          order: 1
        },
        {
          id: '2',
          name: 'Manager Approval',
          type: 'approval',
          status: 'in_progress',
          assignedTo: [],
          order: 2
        },
        {
          id: '3',
          name: 'Security Review',
          type: 'approval',
          status: 'pending',
          assignedTo: [],
          order: 3
        }
      ];
      setWorkflowSteps(mockSteps);
    } catch (error) {
      console.error('Failed to load workflow steps:', error);
    }
  };

  const loadActivityLog = async (requestId: number) => {
    try {
      // Mock activity log - replace with actual API call
      const mockActivity: ActivityLog[] = [
        {
          id: '1',
          type: 'status_change',
          description: 'Request status changed from Draft to Pending Review',
          user: currentUser!,
          timestamp: '2024-01-15T09:00:00Z',
          metadata: { from: 'draft', to: 'pending' }
        }
      ];
      setActivityLog(mockActivity);
    } catch (error) {
      console.error('Failed to load activity log:', error);
    }
  };

  const loadRelatedRequests = async (requestId: number) => {
    try {
      // Mock related requests - replace with actual API call
      const mockRelated: RelatedRequest[] = [];
      setRelatedRequests(mockRelated);
    } catch (error) {
      console.error('Failed to load related requests:', error);
    }
  };

  const loadMetrics = async (requestId: number) => {
    try {
      // Mock metrics - replace with actual API call
      const mockMetrics: RequestMetrics = {
        processingTime: 24, // hours
        escalationCount: 0,
        commentCount: comments.length,
        viewCount: 15,
        lastActivityAt: '2024-01-15T14:30:00Z',
        slaStatus: 'on_time',
        businessImpact: 'medium',
        complianceFlags: []
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await getAccessRequest(requestId, true, true);
      if (response.success && response.data) {
        setRequest(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh request:', error);
      toast.error('Failed to refresh request');
    } finally {
      setIsRefreshing(false);
    }
  }, [requestId, getAccessRequest]);

  const handleSaveEdit = useCallback(async () => {
    if (!editState || !request) return;

    try {
      const updates: AccessRequestUpdate = {
        justification: editState.justification,
        priority: editState.priority,
        due_date: editState.dueDate,
        tags: editState.tags,
        is_emergency: editState.isEmergency,
        business_justification: editState.businessJustification,
        expected_duration: editState.expectedDuration,
        conditions: editState.conditions
      };

      const response = await updateAccessRequest(request.id, updates);
      if (response.success) {
        setRequest(response.data);
        setIsEditing(false);
        toast.success('Request updated successfully');
      }
    } catch (error) {
      console.error('Failed to save request:', error);
      toast.error('Failed to save changes');
    }
  }, [editState, request, updateAccessRequest]);

  const handleCancelEdit = useCallback(() => {
    if (!request) return;
    
    setEditState({
      justification: request.justification || '',
      priority: request.priority || 'medium',
      dueDate: request.due_date,
      tags: request.tags || [],
      isEmergency: request.is_emergency || false,
      businessJustification: request.business_justification,
      expectedDuration: request.expected_duration,
      requiredApprovers: request.required_approvers || [],
      conditions: request.conditions || {}
    });
    setIsEditing(false);
  }, [request]);

  const handleApprove = useCallback(async () => {
    if (!request) return;

    try {
      await approveAccessRequest(request.id, approvalComment);
      setIsApproveDialogOpen(false);
      setApprovalComment('');
      await handleRefresh();
      toast.success('Request approved successfully');
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('Failed to approve request');
    }
  }, [request, approvalComment, approveAccessRequest, handleRefresh]);

  const handleDeny = useCallback(async () => {
    if (!request) return;

    try {
      await denyAccessRequest(request.id, denialReason);
      setIsDenyDialogOpen(false);
      setDenialReason('');
      await handleRefresh();
      toast.success('Request denied');
    } catch (error) {
      console.error('Failed to deny request:', error);
      toast.error('Failed to deny request');
    }
  }, [request, denialReason, denyAccessRequest, handleRefresh]);

  const handleCancel = useCallback(async () => {
    if (!request) return;

    try {
      await cancelAccessRequest(request.id, 'Cancelled by user');
      await handleRefresh();
      toast.success('Request cancelled');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      toast.error('Failed to cancel request');
    }
  }, [request, cancelAccessRequest, handleRefresh]);

  const handleEscalate = useCallback(async () => {
    if (!request) return;

    try {
      await escalateAccessRequest(request.id, escalationReason);
      setIsEscalateDialogOpen(false);
      setEscalationReason('');
      await handleRefresh();
      toast.success('Request escalated');
    } catch (error) {
      console.error('Failed to escalate request:', error);
      toast.error('Failed to escalate request');
    }
  }, [request, escalationReason, escalateAccessRequest, handleRefresh]);

  const handleDelegate = useCallback(async () => {
    if (!request || !delegateToUser) return;

    try {
      await delegateReview(request.id, delegateToUser.id, delegateMessage);
      setIsDelegateDialogOpen(false);
      setDelegateToUser(null);
      setDelegateMessage('');
      await handleRefresh();
      toast.success('Request delegated successfully');
    } catch (error) {
      console.error('Failed to delegate request:', error);
      toast.error('Failed to delegate request');
    }
  }, [request, delegateToUser, delegateMessage, delegateReview, handleRefresh]);

  const handleAddComment = useCallback(async () => {
    if (!request || !newComment.trim()) return;

    try {
      setIsAddingComment(true);
      await addComment(request.id, {
        text: newComment,
        isPrivate: isCommentPrivate,
        mentionedUsers: mentionedUsers.map(u => u.id),
        attachments: selectedAttachments.map(file => ({
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type
        }))
      });

      setNewComment('');
      setIsCommentPrivate(false);
      setMentionedUsers([]);
      setSelectedAttachments([]);
      
      // Refresh comments
      const commentsResponse = await getComments(request.id);
      if (commentsResponse.success) {
        setComments(commentsResponse.data || []);
      }
      
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  }, [request, newComment, isCommentPrivate, mentionedUsers, selectedAttachments, addComment, getComments]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Request bookmarked');
  }, [isBookmarked]);

  const handleWatch = useCallback(() => {
    setIsWatching(!isWatching);
    toast.success(isWatching ? 'Stopped watching' : 'Now watching this request');
  }, [isWatching]);

  // ===================== RENDER HELPERS =====================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b bg-muted/30">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">
              Access Request #{request?.id}
            </h1>
            {requestStatus && (
              <Badge variant="secondary" className={cn("text-sm", requestStatus.color)}>
                <requestStatus.icon className="mr-1 h-4 w-4" />
                {requestStatus.label}
              </Badge>
            )}
            {requestPriority && (
              <Badge variant="outline" className={cn("text-sm", requestPriority.color)}>
                <requestPriority.icon className="mr-1 h-4 w-4" />
                {requestPriority.label}
              </Badge>
            )}
            {request?.is_emergency && (
              <Badge variant="destructive" className="text-sm">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Emergency
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Created by {request?.user?.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{request && format(parseISO(request.created_at), 'PPp')}</span>
            </div>
            {metrics && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Processing for {Math.round(metrics.processingTime)}h</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Refresh */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Bookmark */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-blue-600" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isBookmarked ? 'Remove bookmark' : 'Bookmark request'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Watch */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWatch}
              >
                {isWatching ? (
                  <BellRing className="h-4 w-4 text-blue-600" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isWatching ? 'Stop watching' : 'Watch for updates'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Actions */}
        {showActions && (
          <RequestActionsDropdown
            request={request}
            canEdit={canEdit}
            canApprove={canApprove}
            canDeny={canDeny}
            canCancel={canCancel}
            canEscalate={canEscalate}
            canDelegate={canDelegate}
            onEdit={() => setIsEditing(true)}
            onApprove={() => setIsApproveDialogOpen(true)}
            onDeny={() => setIsDenyDialogOpen(true)}
            onCancel={handleCancel}
            onEscalate={() => setIsEscalateDialogOpen(true)}
            onDelegate={() => setIsDelegateDialogOpen(true)}
            onDuplicate={() => onDuplicate?.(request!)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        )}
      </div>
    </div>
  );

  const renderSLAIndicator = () => {
    if (!metrics || !slaStatus) return null;

    const statusConfig = {
      on_time: { color: 'bg-green-500', label: 'On Time', icon: CheckCircle2 },
      at_risk: { color: 'bg-yellow-500', label: 'At Risk', icon: AlertTriangle },
      overdue: { color: 'bg-red-500', label: 'Overdue', icon: AlertCircle }
    };

    const config = statusConfig[slaStatus];

    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("w-3 h-3 rounded-full", config.color)} />
              <div>
                <div className="font-medium">SLA Status: {config.label}</div>
                <div className="text-sm text-muted-foreground">
                  Processing for {Math.round(metrics.processingTime)} hours
                </div>
              </div>
            </div>
            {metrics.slaDeadline && (
              <div className="text-right">
                <div className="font-medium">Deadline</div>
                <div className="text-sm text-muted-foreground">
                  {format(parseISO(metrics.slaDeadline), 'PPp')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* SLA Indicator */}
      {renderSLAIndicator()}

      {/* Request Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Request Details</CardTitle>
          {canEdit && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Resource Type</Label>
                <div className="mt-1 text-sm">{request?.resource_type}</div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Resource ID</Label>
                <div className="mt-1 text-sm font-mono">{request?.resource_id}</div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Requested Role</Label>
                <div className="mt-1 text-sm">{request?.requested_role}</div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                <div className="mt-1">
                  {isEditing ? (
                    <Select
                      value={editState?.priority}
                      onValueChange={(value) => setEditState(prev => prev ? { ...prev, priority: value } : null)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REQUEST_PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <priority.icon className="h-4 w-4" />
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    requestPriority && (
                      <Badge variant="outline" className={cn("text-sm", requestPriority.color)}>
                        <requestPriority.icon className="mr-1 h-4 w-4" />
                        {requestPriority.label}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Requester</Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={request?.user?.avatar} />
                    <AvatarFallback className="text-xs">
                      {request?.user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{request?.user?.email}</span>
                </div>
              </div>

              {request?.reviewer && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reviewer</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={request.reviewer.avatar} />
                      <AvatarFallback className="text-xs">
                        {request.reviewer.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{request.reviewer.email}</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                <div className="mt-1 text-sm">
                  {request && format(parseISO(request.created_at), 'PPpp')}
                </div>
              </div>

              {request?.reviewed_at && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reviewed At</Label>
                  <div className="mt-1 text-sm">
                    {format(parseISO(request.reviewed_at), 'PPpp')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Justification */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Justification</Label>
            <div className="mt-1">
              {isEditing ? (
                <Textarea
                  value={editState?.justification || ''}
                  onChange={(e) => setEditState(prev => prev ? { ...prev, justification: e.target.value } : null)}
                  rows={4}
                  placeholder="Provide justification for this access request..."
                />
              ) : (
                <div className="p-3 bg-muted/50 rounded-md text-sm">
                  {request?.justification || 'No justification provided'}
                </div>
              )}
            </div>
          </div>

          {/* Business Justification */}
          {(isEditing || editState?.businessJustification) && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Business Justification</Label>
              <div className="mt-1">
                {isEditing ? (
                  <Textarea
                    value={editState?.businessJustification || ''}
                    onChange={(e) => setEditState(prev => prev ? { ...prev, businessJustification: e.target.value } : null)}
                    rows={3}
                    placeholder="Provide business justification..."
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-md text-sm">
                    {editState?.businessJustification || 'No business justification provided'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Flag */}
          {(isEditing || request?.is_emergency) && (
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Switch
                    checked={editState?.isEmergency || false}
                    onCheckedChange={(checked) => setEditState(prev => prev ? { ...prev, isEmergency: checked } : null)}
                  />
                  <Label>Emergency Request</Label>
                </>
              ) : (
                request?.is_emergency && (
                  <Badge variant="destructive">
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    Emergency Request
                  </Badge>
                )
              )}
            </div>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex space-x-2 pt-4 border-t">
              <Button onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Note */}
      {request?.review_note && (
        <Card>
          <CardHeader>
            <CardTitle>Review Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted/50 rounded-md text-sm">
              {request.review_note}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Request Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(metrics.processingTime)}h</div>
                <div className="text-sm text-muted-foreground">Processing Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.commentCount}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.viewCount}</div>
                <div className="text-sm text-muted-foreground">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.escalationCount}</div>
                <div className="text-sm text-muted-foreground">Escalations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderWorkflowTab = () => (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Workflow className="h-5 w-5" />
            <span>Workflow Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(workflowProgress)}%</span>
            </div>
            <Progress value={workflowProgress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step.status === 'completed' && "bg-green-100 text-green-800",
                    step.status === 'in_progress' && "bg-blue-100 text-blue-800",
                    step.status === 'pending' && "bg-gray-100 text-gray-600",
                    step.status === 'failed' && "bg-red-100 text-red-800"
                  )}>
                    {step.status === 'completed' && <Check className="h-4 w-4" />}
                    {step.status === 'in_progress' && <Clock className="h-4 w-4" />}
                    {step.status === 'pending' && <span>{index + 1}</span>}
                    {step.status === 'failed' && <X className="h-4 w-4" />}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {step.type}
                    </Badge>
                  </div>
                  
                  {step.assignedTo && step.assignedTo.length > 0 && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      Assigned to: {step.assignedTo.map(user => user.email).join(', ')}
                    </div>
                  )}
                  
                  {step.completedAt && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      Completed: {format(parseISO(step.completedAt), 'PPp')}
                      {step.completedBy && ` by ${step.completedBy.email}`}
                    </div>
                  )}
                  
                  {step.comments && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                      {step.comments}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Details */}
      {currentWorkflowStep && (
        <Card>
          <CardHeader>
            <CardTitle>Current Step: {currentWorkflowStep.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant={currentWorkflowStep.status === 'in_progress' ? 'default' : 'secondary'}>
                  {currentWorkflowStep.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </Badge>
                <Badge variant="outline">{currentWorkflowStep.type}</Badge>
              </div>
              
              {currentWorkflowStep.assignedTo && currentWorkflowStep.assignedTo.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {currentWorkflowStep.assignedTo.map((user, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentWorkflowStep.conditions && Object.keys(currentWorkflowStep.conditions).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Conditions</Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {Object.entries(currentWorkflowStep.conditions).map(([key, value]) => (
                      <div key={key}>{key}: {String(value)}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCommentsTab = () => (
    <div className="space-y-6">
      {/* Add Comment */}
      <Card>
        <CardHeader>
          <CardTitle>Add Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isCommentPrivate}
                    onCheckedChange={setIsCommentPrivate}
                  />
                  <Label className="text-sm">Private comment</Label>
                </div>
                
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach Files
                </Button>
              </div>
              
              <Button 
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
              >
                {isAddingComment ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Comments ({comments.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              checked={showPrivateComments}
              onCheckedChange={setShowPrivateComments}
            />
            <Label className="text-sm">Show private comments</Label>
          </div>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to add a comment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments
                .filter(comment => showPrivateComments || !comment.isPrivate)
                .map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Activity History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity recorded</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityLog.map((activity, index) => (
                <ActivityLogItem key={activity.id} activity={activity} isLast={index === activityLog.length - 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderRelatedTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitBranch className="h-5 w-5" />
            <span>Related Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No related requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatedRequests.map((related) => (
                <RelatedRequestCard key={related.id} request={related} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // ===================== LOADING & ERROR STATES =====================

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="flex items-center justify-center flex-1">
          <div className="space-y-4 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <div className="text-lg font-medium">Loading request details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="flex items-center justify-center flex-1">
          <div className="space-y-4 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <div className="text-lg font-medium">Failed to load request</div>
            <div className="text-muted-foreground">{error || 'Request not found'}</div>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN RENDER =====================

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header */}
        {renderHeader()}

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b px-6">
              <TabsList className="h-12">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                {showWorkflow && (
                  <TabsTrigger value="workflow" className="flex items-center space-x-2">
                    <Workflow className="h-4 w-4" />
                    <span>Workflow</span>
                  </TabsTrigger>
                )}
                {showComments && (
                  <TabsTrigger value="comments" className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Comments</span>
                    {comments.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {comments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                {showHistory && (
                  <TabsTrigger value="activity" className="flex items-center space-x-2">
                    <History className="h-4 w-4" />
                    <span>Activity</span>
                  </TabsTrigger>
                )}
                {showRelated && (
                  <TabsTrigger value="related" className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4" />
                    <span>Related</span>
                    {relatedRequests.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {relatedRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                {renderOverviewTab()}
              </TabsContent>
              
              {showWorkflow && (
                <TabsContent value="workflow" className="mt-0">
                  {renderWorkflowTab()}
                </TabsContent>
              )}
              
              {showComments && (
                <TabsContent value="comments" className="mt-0">
                  {renderCommentsTab()}
                </TabsContent>
              )}
              
              {showHistory && (
                <TabsContent value="activity" className="mt-0">
                  {renderActivityTab()}
                </TabsContent>
              )}
              
              {showRelated && (
                <TabsContent value="related" className="mt-0">
                  {renderRelatedTab()}
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>

        {/* Action Dialogs */}
        <ActionDialogs
          request={request}
          isApproveDialogOpen={isApproveDialogOpen}
          setIsApproveDialogOpen={setIsApproveDialogOpen}
          isDenyDialogOpen={isDenyDialogOpen}
          setIsDenyDialogOpen={setIsDenyDialogOpen}
          isEscalateDialogOpen={isEscalateDialogOpen}
          setIsEscalateDialogOpen={setIsEscalateDialogOpen}
          isDelegateDialogOpen={isDelegateDialogOpen}
          setIsDelegateDialogOpen={setIsDelegateDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          approvalComment={approvalComment}
          setApprovalComment={setApprovalComment}
          denialReason={denialReason}
          setDenialReason={setDenialReason}
          escalationReason={escalationReason}
          setEscalationReason={setEscalationReason}
          delegateToUser={delegateToUser}
          setDelegateToUser={setDelegateToUser}
          delegateMessage={delegateMessage}
          setDelegateMessage={setDelegateMessage}
          onApprove={handleApprove}
          onDeny={handleDeny}
          onEscalate={handleEscalate}
          onDelegate={handleDelegate}
          onDelete={() => onDelete?.(request)}
        />
      </div>
    </TooltipProvider>
  );
};

// ===================== SUB-COMPONENTS =====================

interface RequestActionsDropdownProps {
  request: AccessRequest | null;
  canEdit: boolean;
  canApprove: boolean;
  canDeny: boolean;
  canCancel: boolean;
  canEscalate: boolean;
  canDelegate: boolean;
  onEdit: () => void;
  onApprove: () => void;
  onDeny: () => void;
  onCancel: () => void;
  onEscalate: () => void;
  onDelegate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const RequestActionsDropdown: React.FC<RequestActionsDropdownProps> = ({
  request,
  canEdit,
  canApprove,
  canDeny,
  canCancel,
  canEscalate,
  canDelegate,
  onEdit,
  onApprove,
  onDeny,
  onCancel,
  onEscalate,
  onDelegate,
  onDuplicate,
  onDelete
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Request Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {canEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Request
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate Request
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {canApprove && (
          <DropdownMenuItem onClick={onApprove}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}
        
        {canDeny && (
          <DropdownMenuItem onClick={onDeny}>
            <XCircle className="mr-2 h-4 w-4" />
            Deny
          </DropdownMenuItem>
        )}
        
        {canCancel && (
          <DropdownMenuItem onClick={onCancel}>
            <PauseCircle className="mr-2 h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {canEscalate && (
          <DropdownMenuItem onClick={onEscalate}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Escalate
          </DropdownMenuItem>
        )}
        
        {canDelegate && (
          <DropdownMenuItem onClick={onDelegate}>
            <Forward className="mr-2 h-4 w-4" />
            Delegate Review
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Share className="mr-2 h-4 w-4" />
          Share Request
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          Export
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Request
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface CommentCardProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  return (
    <div className="flex space-x-3 p-4 border rounded-lg">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback>
          {comment.author.email?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{comment.author.email}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
          </span>
          {comment.isPrivate && (
            <Badge variant="outline" className="text-xs">
              <Lock className="mr-1 h-3 w-3" />
              Private
            </Badge>
          )}
          {comment.isEdited && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>
        
        <div className="mt-1 text-sm">{comment.text}</div>
        
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {comment.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                <span>{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
        
        {comment.reactions && comment.reactions.length > 0 && (
          <div className="mt-2 flex space-x-2">
            {comment.reactions.map((reaction, index) => (
              <div key={index} className="flex items-center space-x-1 text-xs">
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.users.length}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ActivityLogItemProps {
  activity: ActivityLog;
  isLast: boolean;
}

const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ activity, isLast }) => {
  const activityType = ACTIVITY_TYPES[activity.type] || { icon: Activity, label: activity.type };
  
  return (
    <div className="flex space-x-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <activityType.icon className="h-4 w-4" />
        </div>
        {!isLast && <div className="w-0.5 h-8 bg-muted mt-2" />}
      </div>
      
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{activity.user.email}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
          </span>
        </div>
        
        <div className="mt-1 text-sm text-muted-foreground">
          {activity.description}
        </div>
        
        {activity.metadata && (
          <div className="mt-2 text-xs text-muted-foreground">
            {Object.entries(activity.metadata).map(([key, value]) => (
              <div key={key}>{key}: {String(value)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface RelatedRequestCardProps {
  request: RelatedRequest;
}

const RelatedRequestCard: React.FC<RelatedRequestCardProps> = ({ request }) => {
  const relationLabels = {
    duplicate: 'Duplicate of',
    parent: 'Parent request',
    child: 'Child request',
    related: 'Related to',
    blocked_by: 'Blocked by',
    blocks: 'Blocks'
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center space-x-3">
        <Badge variant="outline" className="text-xs">
          {relationLabels[request.relation]}
        </Badge>
        <div>
          <div className="font-medium text-sm">#{request.id} - {request.title}</div>
          <div className="text-xs text-muted-foreground">
            {request.type} • {format(parseISO(request.createdAt), 'PP')}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="text-xs">
          {request.status}
        </Badge>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface ActionDialogsProps {
  request: AccessRequest | null;
  isApproveDialogOpen: boolean;
  setIsApproveDialogOpen: (open: boolean) => void;
  isDenyDialogOpen: boolean;
  setIsDenyDialogOpen: (open: boolean) => void;
  isEscalateDialogOpen: boolean;
  setIsEscalateDialogOpen: (open: boolean) => void;
  isDelegateDialogOpen: boolean;
  setIsDelegateDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  approvalComment: string;
  setApprovalComment: (comment: string) => void;
  denialReason: string;
  setDenialReason: (reason: string) => void;
  escalationReason: string;
  setEscalationReason: (reason: string) => void;
  delegateToUser: User | null;
  setDelegateToUser: (user: User | null) => void;
  delegateMessage: string;
  setDelegateMessage: (message: string) => void;
  onApprove: () => void;
  onDeny: () => void;
  onEscalate: () => void;
  onDelegate: () => void;
  onDelete: () => void;
}

const ActionDialogs: React.FC<ActionDialogsProps> = ({
  request,
  isApproveDialogOpen,
  setIsApproveDialogOpen,
  isDenyDialogOpen,
  setIsDenyDialogOpen,
  isEscalateDialogOpen,
  setIsEscalateDialogOpen,
  isDelegateDialogOpen,
  setIsDelegateDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  approvalComment,
  setApprovalComment,
  denialReason,
  setDenialReason,
  escalationReason,
  setEscalationReason,
  delegateToUser,
  setDelegateToUser,
  delegateMessage,
  setDelegateMessage,
  onApprove,
  onDeny,
  onEscalate,
  onDelegate,
  onDelete
}) => {
  return (
    <>
      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Access Request</DialogTitle>
            <DialogDescription>
              Approve request #{request?.id} for {request?.user?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-comment">Comment (optional)</Label>
              <Textarea
                id="approval-comment"
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="Add an approval comment..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onApprove}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog open={isDenyDialogOpen} onOpenChange={setIsDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Access Request</DialogTitle>
            <DialogDescription>
              Deny request #{request?.id} for {request?.user?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="denial-reason">Reason for denial *</Label>
              <Textarea
                id="denial-reason"
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Provide a reason for denying this request..."
                rows={3}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDenyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeny}
              disabled={!denialReason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Dialog */}
      <Dialog open={isEscalateDialogOpen} onOpenChange={setIsEscalateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Access Request</DialogTitle>
            <DialogDescription>
              Escalate request #{request?.id} to higher authority
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalation-reason">Reason for escalation *</Label>
              <Textarea
                id="escalation-reason"
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Provide a reason for escalating this request..."
                rows={3}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEscalateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onEscalate}
              disabled={!escalationReason.trim()}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Escalate Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delegate Dialog */}
      <Dialog open={isDelegateDialogOpen} onOpenChange={setIsDelegateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delegate Review</DialogTitle>
            <DialogDescription>
              Delegate the review of request #{request?.id} to another user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Delegate to user</Label>
              <Select 
                value={delegateToUser?.id.toString() || ''} 
                onValueChange={(value) => {
                  // Mock user selection - replace with actual user search
                  setDelegateToUser({ id: parseInt(value), email: 'user@example.com' } as User);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">manager@example.com</SelectItem>
                  <SelectItem value="2">admin@example.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="delegate-message">Message (optional)</Label>
              <Textarea
                id="delegate-message"
                value={delegateMessage}
                onChange={(e) => setDelegateMessage(e.target.value)}
                placeholder="Add a message for the delegate..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDelegateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onDelegate}
              disabled={!delegateToUser}
            >
              <Forward className="mr-2 h-4 w-4" />
              Delegate Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Access Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete request #{request?.id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccessRequestDetails;