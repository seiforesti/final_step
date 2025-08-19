'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  PauseCircle,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  FileText,
  Calendar,
  Tag,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  Settings,
  BookmarkPlus,
  Bell,
  MessageSquare,
  ArrowUpRight,
  History,
  BarChart3,
  Zap,
  Shield,
  AlertCircle,
  Info,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Timer,
  Target,
  Workflow,
  GitBranch,
  MapPin,
  Layers,
  Database,
  Key,
  Lock,
  Unlock,
  Flag,
  Star,
  StarOff,
  SendHorizontal,
  Reply,
  Forward,
  Share,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  X,
  HelpCircle,
  Lightbulb,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
import { Calendar } from '@/components/ui/calendar';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { useAccessRequests } from '../../hooks/useAccessRequests';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { formatDistanceToNow, format, parseISO, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import type { 
  AccessRequest, 
  AccessRequestFilters,
  AccessRequestPagination 
} from '../../types/access-request.types';
import type { User } from '../../types/user.types';
import type { Role } from '../../types/role.types';
import type { Resource } from '../../types/resource.types';

// ===================== INTERFACES & TYPES =====================

interface AccessRequestListProps {
  className?: string;
  onRequestSelect?: (request: AccessRequest) => void;
  onRequestCreate?: () => void;
  onRequestEdit?: (request: AccessRequest) => void;
  onRequestView?: (request: AccessRequest) => void;
  onBulkAction?: (action: string, selectedRequests: AccessRequest[]) => void;
  initialFilters?: AccessRequestFilters;
  showCreateButton?: boolean;
  showBulkActions?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  showStats?: boolean;
  showExport?: boolean;
  compactMode?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
  enableKeyboardShortcuts?: boolean;
  enableRealTimeUpdates?: boolean;
}

interface ViewSettings {
  density: 'compact' | 'comfortable' | 'spacious';
  groupBy: 'none' | 'status' | 'priority' | 'type' | 'requester' | 'reviewer';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  visibleColumns: string[];
  showAdvancedFilters: boolean;
  showRequestPreview: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  requestType: string[];
  requester: string[];
  reviewer: string[];
  resourceType: string[];
  createdDateRange: { from: Date | null; to: Date | null };
  dueDateRange: { from: Date | null; to: Date | null };
  tags: string[];
  hasComments: boolean | null;
  requiresApproval: boolean | null;
  isEmergency: boolean | null;
  isExpired: boolean | null;
}

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  filter: Partial<AccessRequestFilters>;
  count?: number;
  color?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (requests: AccessRequest[]) => Promise<void>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  permission?: string;
  disabled?: (requests: AccessRequest[]) => boolean;
  color?: 'default' | 'destructive' | 'secondary';
}

interface ColumnDefinition {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  render: (request: AccessRequest) => React.ReactNode;
  hidden?: boolean;
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

const REQUEST_TYPES = [
  { value: 'role', label: 'Role Assignment', icon: Users },
  { value: 'permission', label: 'Permission Grant', icon: Key },
  { value: 'resource', label: 'Resource Access', icon: Database },
  { value: 'temporary', label: 'Temporary Access', icon: Timer },
  { value: 'emergency', label: 'Emergency Access', icon: AlertTriangle }
];

const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  density: 'comfortable',
  groupBy: 'none',
  sortBy: 'created_at',
  sortOrder: 'desc',
  visibleColumns: ['checkbox', 'id', 'requester', 'type', 'resource', 'status', 'priority', 'created_at', 'actions'],
  showAdvancedFilters: false,
  showRequestPreview: false,
  autoRefresh: true,
  refreshInterval: 30000
};

const DEFAULT_FILTER_STATE: FilterState = {
  search: '',
  status: [],
  priority: [],
  requestType: [],
  requester: [],
  reviewer: [],
  resourceType: [],
  createdDateRange: { from: null, to: null },
  dueDateRange: { from: null, to: null },
  tags: [],
  hasComments: null,
  requiresApproval: null,
  isEmergency: null,
  isExpired: null
};

const PAGE_SIZES = [10, 25, 50, 100, 200];

// ===================== MAIN COMPONENT =====================

export const AccessRequestList: React.FC<AccessRequestListProps> = ({
  className,
  onRequestSelect,
  onRequestCreate,
  onRequestEdit,
  onRequestView,
  onBulkAction,
  initialFilters = {},
  showCreateButton = true,
  showBulkActions = true,
  showFilters = true,
  showSearch = true,
  showStats = true,
  showExport = true,
  compactMode = false,
  autoRefresh = true,
  refreshInterval = 30000,
  pageSize = 25,
  enableKeyboardShortcuts = true,
  enableRealTimeUpdates = true
}) => {
  // ===================== HOOKS & STATE =====================

  const { currentUser } = useCurrentUser();
  const { checkPermission } = usePermissionCheck();
  
  // Access requests hook with initial filters
  const {
    accessRequests,
    totalCount,
    isLoading,
    isRefreshing,
    error,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    selectedRequests,
    workflows,
    templates,
    automationRules,
    loadAccessRequests,
    refreshAccessRequests,
    searchAccessRequests,
    setFilters,
    clearFilters,
    setSorting,
    setPagination,
    selectRequest,
    deselectRequest,
    selectAllRequests,
    clearSelection,
    toggleRequestSelection,
    createAccessRequest,
    updateAccessRequest,
    cancelAccessRequest,
    approveAccessRequest,
    denyAccessRequest,
    bulkReviewRequests,
    delegateReview,
    escalateAccessRequest,
    getAccessRequestAnalytics,
    pendingRequests,
    approvedRequests,
    deniedRequests,
    emergencyRequests,
    totalPages,
    isAllSelected,
    isPartiallySelected,
    selectedRequestIds,
    hasData,
    isEmpty
  } = useAccessRequests(initialFilters, true);

  // Real-time updates
  const { isConnected, subscribe, unsubscribe } = useRBACWebSocket();

  // Component state
  const [viewSettings, setViewSettings] = useState<ViewSettings>(DEFAULT_VIEW_SETTINGS);
  const [filterState, setFilterState] = useState<FilterState>({
    ...DEFAULT_FILTER_STATE,
    ...initialFilters
  });
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isViewSettingsOpen, setIsViewSettingsOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState<BulkAction | null>(null);
  const [bulkActionComment, setBulkActionComment] = useState('');
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // ===================== COMPUTED VALUES =====================

  const quickFilters: QuickFilter[] = useMemo(() => [
    {
      id: 'all',
      label: 'All Requests',
      icon: <FileText className="h-4 w-4" />,
      filter: {},
      count: totalCount
    },
    {
      id: 'pending',
      label: 'Pending Review',
      icon: <Clock className="h-4 w-4" />,
      filter: { status: 'pending' },
      count: pendingRequests.length,
      color: 'text-yellow-600'
    },
    {
      id: 'approved',
      label: 'Approved',
      icon: <CheckCircle2 className="h-4 w-4" />,
      filter: { status: 'approved' },
      count: approvedRequests.length,
      color: 'text-green-600'
    },
    {
      id: 'denied',
      label: 'Denied',
      icon: <XCircle className="h-4 w-4" />,
      filter: { status: 'denied' },
      count: deniedRequests.length,
      color: 'text-red-600'
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: <AlertTriangle className="h-4 w-4" />,
      filter: { isEmergency: true },
      count: emergencyRequests.length,
      color: 'text-red-600'
    },
    {
      id: 'my_requests',
      label: 'My Requests',
      icon: <Users className="h-4 w-4" />,
      filter: { requesterId: currentUser?.id },
      count: accessRequests.filter(req => req.user_id === currentUser?.id).length,
      color: 'text-blue-600'
    },
    {
      id: 'my_reviews',
      label: 'My Reviews',
      icon: <UserCheck className="h-4 w-4" />,
      filter: { reviewerId: currentUser?.id },
      count: accessRequests.filter(req => req.reviewer?.id === currentUser?.id).length,
      color: 'text-purple-600'
    }
  ], [totalCount, pendingRequests, approvedRequests, deniedRequests, emergencyRequests, accessRequests, currentUser]);

  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'approve',
      label: 'Approve Selected',
      icon: <CheckCircle2 className="h-4 w-4" />,
      action: async (requests) => {
        const reviews = requests.map(req => ({
          requestId: req.id,
          action: 'approve' as const,
          comment: bulkActionComment || undefined
        }));
        await bulkReviewRequests(reviews);
        toast.success(`Approved ${requests.length} requests`);
      },
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to approve the selected requests?',
      permission: 'access_requests.approve',
      disabled: (requests) => requests.some(req => req.status !== 'pending'),
      color: 'default'
    },
    {
      id: 'deny',
      label: 'Deny Selected',
      icon: <XCircle className="h-4 w-4" />,
      action: async (requests) => {
        const reviews = requests.map(req => ({
          requestId: req.id,
          action: 'deny' as const,
          comment: bulkActionComment || 'Bulk denial'
        }));
        await bulkReviewRequests(reviews);
        toast.success(`Denied ${requests.length} requests`);
      },
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to deny the selected requests?',
      permission: 'access_requests.deny',
      disabled: (requests) => requests.some(req => req.status !== 'pending'),
      color: 'destructive'
    },
    {
      id: 'cancel',
      label: 'Cancel Selected',
      icon: <PauseCircle className="h-4 w-4" />,
      action: async (requests) => {
        await Promise.all(requests.map(req => cancelAccessRequest(req.id, bulkActionComment || 'Bulk cancellation')));
        toast.success(`Cancelled ${requests.length} requests`);
      },
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to cancel the selected requests?',
      permission: 'access_requests.cancel',
      disabled: (requests) => requests.some(req => !['draft', 'pending'].includes(req.status)),
      color: 'secondary'
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: <Download className="h-4 w-4" />,
      action: async (requests) => {
        // Export functionality would be implemented here
        toast.success(`Exported ${requests.length} requests`);
      },
      permission: 'access_requests.export',
      color: 'secondary'
    }
  ], [bulkActionComment, bulkReviewRequests, cancelAccessRequest]);

  const columns: ColumnDefinition[] = useMemo(() => [
    {
      id: 'checkbox',
      label: '',
      width: '50px',
      render: (request) => (
        <Checkbox
          checked={selectedRequestIds.includes(request.id)}
          onCheckedChange={() => toggleRequestSelection(request)}
          aria-label={`Select request ${request.id}`}
        />
      )
    },
    {
      id: 'id',
      label: 'Request ID',
      sortable: true,
      width: '120px',
      render: (request) => (
        <div className="font-mono text-sm">
          <Button
            variant="link"
            className="h-auto p-0 text-left"
            onClick={() => onRequestView?.(request)}
          >
            #{request.id}
          </Button>
        </div>
      )
    },
    {
      id: 'requester',
      label: 'Requester',
      sortable: true,
      width: '200px',
      render: (request) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={request.user?.avatar} />
            <AvatarFallback>
              {request.user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {request.user?.email || 'Unknown User'}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {request.user?.role || 'No role'}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'type',
      label: 'Type',
      sortable: true,
      width: '140px',
      render: (request) => {
        const type = REQUEST_TYPES.find(t => t.value === request.requested_role);
        return (
          <div className="flex items-center space-x-2">
            {type?.icon && <type.icon className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm">{type?.label || request.requested_role}</span>
          </div>
        );
      }
    },
    {
      id: 'resource',
      label: 'Resource',
      sortable: true,
      width: '200px',
      render: (request) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {request.resource_type}
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {request.resource_id}
          </div>
        </div>
      )
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      width: '140px',
      render: (request) => {
        const status = REQUEST_STATUSES.find(s => s.value === request.status);
        return (
          <Badge variant="secondary" className={cn("text-xs", status?.color)}>
            {status?.icon && <status.icon className="mr-1 h-3 w-3" />}
            {status?.label || request.status}
          </Badge>
        );
      }
    },
    {
      id: 'priority',
      label: 'Priority',
      sortable: true,
      width: '120px',
      render: (request) => {
        const priority = REQUEST_PRIORITIES.find(p => p.value === request.priority);
        return priority ? (
          <Badge variant="outline" className={cn("text-xs", priority.color)}>
            <priority.icon className="mr-1 h-3 w-3" />
            {priority.label}
          </Badge>
        ) : null;
      }
    },
    {
      id: 'created_at',
      label: 'Created',
      sortable: true,
      width: '140px',
      render: (request) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="text-left">
              <div className="text-sm">
                {formatDistanceToNow(parseISO(request.created_at), { addSuffix: true })}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {format(parseISO(request.created_at), 'PPpp')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    {
      id: 'reviewer',
      label: 'Reviewer',
      sortable: true,
      width: '180px',
      render: (request) => request.reviewer ? (
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={request.reviewer.avatar} />
            <AvatarFallback className="text-xs">
              {request.reviewer.email?.charAt(0).toUpperCase() || 'R'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{request.reviewer.email}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Unassigned</span>
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '120px',
      render: (request) => (
        <RequestActionsDropdown
          request={request}
          onView={() => onRequestView?.(request)}
          onEdit={() => onRequestEdit?.(request)}
          onApprove={() => approveAccessRequest(request.id)}
          onDeny={() => denyAccessRequest(request.id, 'Manual denial')}
          onCancel={() => cancelAccessRequest(request.id)}
          onDelegate={() => {/* Implement delegate dialog */}}
          onEscalate={() => escalateAccessRequest(request.id, 'Manual escalation')}
        />
      )
    }
  ], [selectedRequestIds, toggleRequestSelection, onRequestView, onRequestEdit, approveAccessRequest, denyAccessRequest, cancelAccessRequest, escalateAccessRequest]);

  // Filter columns based on view settings
  const visibleColumns = columns.filter(col => 
    viewSettings.visibleColumns.includes(col.id) && !col.hidden
  );

  // ===================== EFFECTS =====================

  // Auto-refresh effect
  useEffect(() => {
    if (viewSettings.autoRefresh && viewSettings.refreshInterval > 0) {
      autoRefreshRef.current = setInterval(() => {
        refreshAccessRequests();
      }, viewSettings.refreshInterval);

      return () => {
        if (autoRefreshRef.current) {
          clearInterval(autoRefreshRef.current);
        }
      };
    }
  }, [viewSettings.autoRefresh, viewSettings.refreshInterval, refreshAccessRequests]);

  // Real-time updates effect
  useEffect(() => {
    if (enableRealTimeUpdates && isConnected) {
      const subscription = subscribe('access_request_updated', (data: any) => {
        // Handle real-time updates
        refreshAccessRequests();
      });

      return () => {
        unsubscribe(subscription);
      };
    }
  }, [enableRealTimeUpdates, isConnected, subscribe, unsubscribe, refreshAccessRequests]);

  // Keyboard shortcuts effect
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + R: Refresh
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        refreshAccessRequests();
      }
      
      // Ctrl/Cmd + F: Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Ctrl/Cmd + A: Select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && !event.shiftKey) {
        event.preventDefault();
        selectAllRequests();
      }
      
      // Escape: Clear selection
      if (event.key === 'Escape') {
        clearSelection();
        setExpandedRequest(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, refreshAccessRequests, selectAllRequests, clearSelection]);

  // Load analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsAnalyticsLoading(true);
      try {
        const data = await getAccessRequestAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    if (showStats) {
      loadAnalytics();
    }
  }, [showStats, getAccessRequestAnalytics]);

  // ===================== HANDLERS =====================

  const handleSearch = useCallback(
    debounce((query: string) => {
      setFilterState(prev => ({ ...prev, search: query }));
      searchAccessRequests(query);
    }, 300),
    [searchAccessRequests]
  );

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filterState, ...newFilters };
    setFilterState(updatedFilters);
    
    // Convert to API format
    const apiFilters: AccessRequestFilters = {
      search: updatedFilters.search || undefined,
      status: updatedFilters.status.length > 0 ? updatedFilters.status[0] as any : undefined,
      priority: updatedFilters.priority.length > 0 ? updatedFilters.priority[0] as any : undefined,
      requestType: updatedFilters.requestType.length > 0 ? updatedFilters.requestType[0] as any : undefined,
      requesterId: updatedFilters.requester.length > 0 ? parseInt(updatedFilters.requester[0]) : undefined,
      reviewerId: updatedFilters.reviewer.length > 0 ? parseInt(updatedFilters.reviewer[0]) : undefined,
      resourceType: updatedFilters.resourceType.length > 0 ? updatedFilters.resourceType[0] : undefined,
      createdAfter: updatedFilters.createdDateRange.from?.toISOString(),
      createdBefore: updatedFilters.createdDateRange.to?.toISOString(),
      hasComments: updatedFilters.hasComments,
      requiresApproval: updatedFilters.requiresApproval,
      tags: updatedFilters.tags
    };
    
    setFilters(apiFilters);
  }, [filterState, setFilters]);

  const handleQuickFilter = useCallback((filter: QuickFilter) => {
    setFilters(filter.filter);
    setFilterState(prev => ({
      ...prev,
      status: filter.filter.status ? [filter.filter.status as string] : [],
      // Reset other filters when applying quick filter
      priority: [],
      requestType: [],
      requester: [],
      reviewer: []
    }));
  }, [setFilters]);

  const handleSort = useCallback((columnId: string) => {
    const newSortOrder = viewSettings.sortBy === columnId && viewSettings.sortOrder === 'asc' ? 'desc' : 'asc';
    setViewSettings(prev => ({ ...prev, sortBy: columnId, sortOrder: newSortOrder }));
    setSorting(columnId, newSortOrder);
  }, [viewSettings.sortBy, viewSettings.sortOrder, setSorting]);

  const handlePageChange = useCallback((page: number) => {
    setPagination(page, viewSettings.density === 'compact' ? 50 : viewSettings.density === 'spacious' ? 10 : 25);
  }, [setPagination, viewSettings.density]);

  const handleBulkAction = useCallback(async (action: BulkAction) => {
    if (selectedRequests.length === 0) {
      toast.error('No requests selected');
      return;
    }

    if (action.disabled?.(selectedRequests)) {
      toast.error('Action not available for selected requests');
      return;
    }

    try {
      await action.action(selectedRequests);
      clearSelection();
      setIsBulkActionDialogOpen(false);
      setBulkActionComment('');
    } catch (error) {
      toast.error('Failed to perform bulk action');
      console.error('Bulk action error:', error);
    }
  }, [selectedRequests, clearSelection]);

  const handleRequestExpand = useCallback((requestId: number) => {
    setExpandedRequest(prev => prev === requestId ? null : requestId);
  }, []);

  // ===================== RENDER HELPERS =====================

  const renderQuickFilters = () => (
    <div className="flex flex-wrap gap-2 p-4 border-b">
      {quickFilters.map((filter) => (
        <Button
          key={filter.id}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 text-sm",
            filter.color,
            "hover:bg-muted"
          )}
          onClick={() => handleQuickFilter(filter)}
        >
          {filter.icon}
          <span className="ml-2">{filter.label}</span>
          {filter.count !== undefined && (
            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
              {filter.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
      <div className="flex items-center space-x-4">
        {/* Search */}
        {showSearch && (
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search requests by ID, requester, resource..."
              className="pl-10"
              value={filterState.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filters
                {Object.values(filterState).some(v => 
                  Array.isArray(v) ? v.length > 0 : v !== null && v !== ''
                ) && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                    Active
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
                <DialogDescription>
                  Filter access requests by various criteria
                </DialogDescription>
              </DialogHeader>
              <AdvancedFilters
                filters={filterState}
                onChange={handleFilterChange}
                onReset={() => {
                  setFilterState(DEFAULT_FILTER_STATE);
                  clearFilters();
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Refresh */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAccessRequests}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Refresh list (Ctrl+R)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center space-x-2">
        {/* Bulk Actions */}
        {showBulkActions && selectedRequests.length > 0 && (
          <BulkActionsDropdown
            selectedCount={selectedRequests.length}
            actions={bulkActions}
            onActionSelect={(action) => {
              setSelectedBulkAction(action);
              if (action.requiresConfirmation) {
                setIsBulkActionDialogOpen(true);
              } else {
                handleBulkAction(action);
              }
            }}
          />
        )}

        {/* Export */}
        {showExport && (
          <Button variant="outline" size="sm" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}

        {/* Create Request */}
        {showCreateButton && checkPermission('access_requests.create') && (
          <Button size="sm" onClick={onRequestCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        )}

        {/* View Settings */}
        <DropdownMenu open={isViewSettingsOpen} onOpenChange={setIsViewSettingsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <ViewSettingsMenu
              settings={viewSettings}
              onChange={setViewSettings}
              columns={columns}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderStats = () => {
    if (!showStats || isAnalyticsLoading) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b bg-muted/10">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{approvedRequests.length}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold">{emergencyRequests.length}</div>
              <div className="text-sm text-muted-foreground">Emergency</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderTable = () => (
    <div ref={tableRef} className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  "text-left",
                  column.sortable && "cursor-pointer hover:bg-muted/50",
                  column.width && `w-[${column.width}]`,
                  column.minWidth && `min-w-[${column.minWidth}]`
                )}
                style={{
                  width: column.width,
                  minWidth: column.minWidth
                }}
                onClick={() => column.sortable && handleSort(column.id)}
              >
                <div className="flex items-center space-x-2">
                  {column.id === 'checkbox' ? (
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isPartiallySelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectAllRequests();
                        } else {
                          clearSelection();
                        }
                      }}
                      aria-label="Select all requests"
                    />
                  ) : (
                    <>
                      <span>{column.label}</span>
                      {column.sortable && viewSettings.sortBy === column.id && (
                        viewSettings.sortOrder === 'asc' ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortDesc className="h-4 w-4" />
                        )
                      )}
                    </>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {visibleColumns.map((column) => (
                  <TableCell key={column.id}>
                    <div className="h-6 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isEmpty ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length} className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <div className="text-lg font-medium">No access requests found</div>
                    <div className="text-muted-foreground">
                      {Object.values(filterState).some(v => 
                        Array.isArray(v) ? v.length > 0 : v !== null && v !== ''
                      ) ? 'Try adjusting your filters' : 'Create your first access request to get started'}
                    </div>
                  </div>
                  {showCreateButton && checkPermission('access_requests.create') && (
                    <Button onClick={onRequestCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Access Request
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            accessRequests.map((request) => (
              <React.Fragment key={request.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedRequestIds.includes(request.id) && "bg-muted",
                    expandedRequest === request.id && "border-b-0",
                    viewSettings.density === 'compact' && "h-10",
                    viewSettings.density === 'spacious' && "h-16"
                  )}
                  onClick={() => onRequestSelect?.(request)}
                >
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        viewSettings.density === 'compact' && "py-2",
                        viewSettings.density === 'spacious' && "py-4"
                      )}
                    >
                      {column.render(request)}
                    </TableCell>
                  ))}
                </TableRow>
                
                {/* Expanded Request Details */}
                {expandedRequest === request.id && (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length} className="p-0">
                      <RequestExpandedView
                        request={request}
                        onClose={() => setExpandedRequest(null)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} requests
        </span>
        {selectedRequests.length > 0 && (
          <span>
            • {selectedRequests.length} selected
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Label className="text-sm">Rows per page:</Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPagination(1, parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPreviousPage || isLoading}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              );
            })}
            
            {totalPages > 5 && (
              <>
                <span className="px-2">...</span>
                <Button
                  variant={totalPages === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={isLoading}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );

  // ===================== MAIN RENDER =====================

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {/* Header with Stats */}
        {renderStats()}
        
        {/* Quick Filters */}
        {renderQuickFilters()}
        
        {/* Toolbar */}
        {renderToolbar()}
        
        {/* Error State */}
        {error && (
          <div className="p-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
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
        
        {/* Table */}
        <div className="flex-1 overflow-auto">
          {renderTable()}
        </div>
        
        {/* Pagination */}
        {hasData && renderPagination()}
        
        {/* Bulk Action Confirmation Dialog */}
        <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedBulkAction?.label}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedBulkAction?.confirmationMessage}
                <br />
                <strong>{selectedRequests.length} request(s) will be affected.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {selectedBulkAction?.id !== 'export' && (
              <div className="space-y-2">
                <Label htmlFor="bulk-comment">Comment (optional)</Label>
                <Textarea
                  id="bulk-comment"
                  placeholder="Add a comment for this bulk action..."
                  value={bulkActionComment}
                  onChange={(e) => setBulkActionComment(e.target.value)}
                />
              </div>
            )}
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedBulkAction && handleBulkAction(selectedBulkAction)}
                className={cn(
                  selectedBulkAction?.color === 'destructive' && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                )}
              >
                {selectedBulkAction?.label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Export Dialog */}
        <ExportDialog
          open={isExportDialogOpen}
          onOpenChange={setIsExportDialogOpen}
          data={selectedRequests.length > 0 ? selectedRequests : accessRequests}
          totalCount={selectedRequests.length > 0 ? selectedRequests.length : totalCount}
        />
      </div>
    </TooltipProvider>
  );
};

// ===================== SUB-COMPONENTS =====================

interface RequestActionsDropdownProps {
  request: AccessRequest;
  onView: () => void;
  onEdit: () => void;
  onApprove: () => void;
  onDeny: () => void;
  onCancel: () => void;
  onDelegate: () => void;
  onEscalate: () => void;
}

const RequestActionsDropdown: React.FC<RequestActionsDropdownProps> = ({
  request,
  onView,
  onEdit,
  onApprove,
  onDeny,
  onCancel,
  onDelegate,
  onEscalate
}) => {
  const { checkPermission } = usePermissionCheck();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        {checkPermission('access_requests.edit') && request.status === 'draft' && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Request
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {checkPermission('access_requests.approve') && request.status === 'pending' && (
          <DropdownMenuItem onClick={onApprove}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}
        
        {checkPermission('access_requests.deny') && request.status === 'pending' && (
          <DropdownMenuItem onClick={onDeny}>
            <XCircle className="mr-2 h-4 w-4" />
            Deny
          </DropdownMenuItem>
        )}
        
        {checkPermission('access_requests.cancel') && ['draft', 'pending'].includes(request.status) && (
          <DropdownMenuItem onClick={onCancel}>
            <PauseCircle className="mr-2 h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {checkPermission('access_requests.delegate') && request.status === 'pending' && (
          <DropdownMenuItem onClick={onDelegate}>
            <Forward className="mr-2 h-4 w-4" />
            Delegate Review
          </DropdownMenuItem>
        )}
        
        {checkPermission('access_requests.escalate') && request.status === 'pending' && (
          <DropdownMenuItem onClick={onEscalate}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Escalate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface BulkActionsDropdownProps {
  selectedCount: number;
  actions: BulkAction[];
  onActionSelect: (action: BulkAction) => void;
}

const BulkActionsDropdown: React.FC<BulkActionsDropdownProps> = ({
  selectedCount,
  actions,
  onActionSelect
}) => {
  const { checkPermission } = usePermissionCheck();
  
  const availableActions = actions.filter(action => 
    !action.permission || checkPermission(action.permission)
  );
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Bulk Actions ({selectedCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {selectedCount} request(s) selected
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableActions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={() => onActionSelect(action)}
            className={cn(
              action.color === 'destructive' && "text-destructive focus:text-destructive"
            )}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface AdvancedFiltersProps {
  filters: FilterState;
  onChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onChange,
  onReset
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="space-y-2">
            {REQUEST_STATUSES.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.status.includes(status.value)}
                  onCheckedChange={(checked) => {
                    const newStatus = checked
                      ? [...filters.status, status.value]
                      : filters.status.filter(s => s !== status.value);
                    onChange({ status: newStatus });
                  }}
                />
                <Label htmlFor={`status-${status.value}`} className="text-sm">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Priority Filter */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="space-y-2">
            {REQUEST_PRIORITIES.map((priority) => (
              <div key={priority.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority.value}`}
                  checked={filters.priority.includes(priority.value)}
                  onCheckedChange={(checked) => {
                    const newPriority = checked
                      ? [...filters.priority, priority.value]
                      : filters.priority.filter(p => p !== priority.value);
                    onChange({ priority: newPriority });
                  }}
                />
                <Label htmlFor={`priority-${priority.value}`} className="text-sm">
                  {priority.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Request Type Filter */}
        <div className="space-y-2">
          <Label>Request Type</Label>
          <div className="space-y-2">
            {REQUEST_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.requestType.includes(type.value)}
                  onCheckedChange={(checked) => {
                    const newType = checked
                      ? [...filters.requestType, type.value]
                      : filters.requestType.filter(t => t !== type.value);
                    onChange({ requestType: newType });
                  }}
                />
                <Label htmlFor={`type-${type.value}`} className="text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Date Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Created Date Range</Label>
          <DatePickerWithRange
            value={filters.createdDateRange}
            onChange={(range) => onChange({ createdDateRange: range })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Due Date Range</Label>
          <DatePickerWithRange
            value={filters.dueDateRange}
            onChange={(range) => onChange({ dueDateRange: range })}
          />
        </div>
      </div>
      
      {/* Boolean Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has-comments"
            checked={filters.hasComments === true}
            onCheckedChange={(checked) => onChange({ hasComments: checked ? true : null })}
          />
          <Label htmlFor="has-comments">Has Comments</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="requires-approval"
            checked={filters.requiresApproval === true}
            onCheckedChange={(checked) => onChange({ requiresApproval: checked ? true : null })}
          />
          <Label htmlFor="requires-approval">Requires Approval</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-emergency"
            checked={filters.isEmergency === true}
            onCheckedChange={(checked) => onChange({ isEmergency: checked ? true : null })}
          />
          <Label htmlFor="is-emergency">Emergency Request</Label>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onReset}>
          Reset All Filters
        </Button>
        <div className="text-sm text-muted-foreground">
          {Object.values(filters).some(v => 
            Array.isArray(v) ? v.length > 0 : v !== null && v !== ''
          ) ? 'Filters applied' : 'No filters applied'}
        </div>
      </div>
    </div>
  );
};

interface ViewSettingsMenuProps {
  settings: ViewSettings;
  onChange: (settings: Partial<ViewSettings>) => void;
  columns: ColumnDefinition[];
}

const ViewSettingsMenu: React.FC<ViewSettingsMenuProps> = ({
  settings,
  onChange,
  columns
}) => {
  return (
    <>
      <DropdownMenuLabel>View Settings</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      {/* Density */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Layers className="mr-2 h-4 w-4" />
          Density
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={settings.density}
              onValueChange={(value) => onChange({ density: value as any })}
            >
              <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="spacious">Spacious</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
      
      {/* Columns */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Eye className="mr-2 h-4 w-4" />
          Columns
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {columns.filter(col => col.id !== 'checkbox').map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={settings.visibleColumns.includes(column.id)}
                onCheckedChange={(checked) => {
                  const newColumns = checked
                    ? [...settings.visibleColumns, column.id]
                    : settings.visibleColumns.filter(id => id !== column.id);
                  onChange({ visibleColumns: newColumns });
                }}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
      
      <DropdownMenuSeparator />
      
      {/* Auto Refresh */}
      <DropdownMenuItem
        onClick={() => onChange({ autoRefresh: !settings.autoRefresh })}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Auto Refresh
        {settings.autoRefresh && <CheckCircle className="ml-auto h-4 w-4" />}
      </DropdownMenuItem>
    </>
  );
};

interface RequestExpandedViewProps {
  request: AccessRequest;
  onClose: () => void;
}

const RequestExpandedView: React.FC<RequestExpandedViewProps> = ({
  request,
  onClose
}) => {
  return (
    <div className="p-6 border-t bg-muted/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Request Details</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Request Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">ID:</span> #{request.id}
            </div>
            <div>
              <span className="font-medium">Type:</span> {request.requested_role}
            </div>
            <div>
              <span className="font-medium">Resource:</span> {request.resource_type}
            </div>
            <div>
              <span className="font-medium">Created:</span> {format(parseISO(request.created_at), 'PPp')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Justification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {request.justification || 'No justification provided'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Review Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {request.reviewer ? (
              <div>
                <span className="font-medium">Reviewer:</span> {request.reviewer.email}
              </div>
            ) : (
              <div className="text-muted-foreground">No reviewer assigned</div>
            )}
            {request.reviewed_at && (
              <div>
                <span className="font-medium">Reviewed:</span> {format(parseISO(request.reviewed_at), 'PPp')}
              </div>
            )}
            {request.review_note && (
              <div>
                <span className="font-medium">Note:</span> {request.review_note}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AccessRequest[];
  totalCount: number;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  data,
  totalCount
}) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportScope, setExportScope] = useState<'selected' | 'filtered' | 'all'>('selected');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Implement export logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate export
      toast.success(`Exported ${data.length} requests`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Access Requests</DialogTitle>
          <DialogDescription>
            Export access request data in your preferred format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Export Scope</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="selected"
                  name="scope"
                  value="selected"
                  checked={exportScope === 'selected'}
                  onChange={(e) => setExportScope(e.target.value as any)}
                />
                <Label htmlFor="selected">Selected requests ({data.length})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="filtered"
                  name="scope"
                  value="filtered"
                  checked={exportScope === 'filtered'}
                  onChange={(e) => setExportScope(e.target.value as any)}
                />
                <Label htmlFor="filtered">Current filtered results ({totalCount})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="all"
                  name="scope"
                  value="all"
                  checked={exportScope === 'all'}
                  onChange={(e) => setExportScope(e.target.value as any)}
                />
                <Label htmlFor="all">All requests</Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessRequestList;