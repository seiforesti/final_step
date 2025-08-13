'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTable } from '../shared/DataTable';
import {
  Plus,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Users,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Key,
  Lock,
  Unlock,
  FileText,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Square,
  Send,
  Mail,
  Bell,
  Calendar,
  MapPin,
  Building,
  Target,
  Tag,
  Star,
  Heart,
  Bookmark,
  Share,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Link,
  History,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Loader2,
  Save,
  Database,
  Network,
  Globe,
  Phone,
  Home,
  Archive,
  BookOpen,
  Terminal,
  Monitor,
  Cpu,
  HelpCircle,
  Code,
  GitBranch,
  Layers,
  Workflow,
  Zap,
} from 'lucide-react';

// Sub-components
import AccessRequestList from './AccessRequestList';
import AccessRequestDetails from './AccessRequestDetails';
import AccessRequestCreate from './AccessRequestCreate';
import AccessReviewInterface from './AccessReviewInterface';

// Hooks and Services
import { useAccessRequests } from '../../hooks/useAccessRequests';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';

// Types
import type { 
  AccessRequest,
  AccessRequestStats,
  AccessRequestFilter,
  AccessRequestWorkflow,
  ApprovalRule
} from '../../types/access-request.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate, formatDateTime } from '../../utils/format.utils';

interface AccessRequestManagementProps {
  className?: string;
}

interface AccessRequestWithDetails extends AccessRequest {
  approval_chain?: Array<{
    step: number;
    approver: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    status: 'pending' | 'approved' | 'rejected' | 'skipped';
    decision_date?: string;
    comments?: string;
  }>;
  risk_score?: number;
  compliance_status?: 'compliant' | 'non_compliant' | 'needs_review';
  sla_status?: 'on_time' | 'at_risk' | 'overdue';
  business_justification_score?: number;
}

const REQUEST_TYPES = [
  { value: 'role_assignment', label: 'Role Assignment', icon: Crown, color: 'bg-blue-100 text-blue-800' },
  { value: 'resource_access', label: 'Resource Access', icon: Database, color: 'bg-green-100 text-green-800' },
  { value: 'permission_grant', label: 'Permission Grant', icon: Key, color: 'bg-purple-100 text-purple-800' },
  { value: 'group_membership', label: 'Group Membership', icon: Users, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'system_access', label: 'System Access', icon: Monitor, color: 'bg-red-100 text-red-800' },
  { value: 'data_access', label: 'Data Access', icon: FileText, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'elevated_privileges', label: 'Elevated Privileges', icon: Shield, color: 'bg-orange-100 text-orange-800' },
];

const REQUEST_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: Send },
  { value: 'under_review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  { value: 'pending_approval', label: 'Pending Approval', color: 'bg-orange-100 text-orange-800', icon: Clock },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-800', icon: Clock },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: Square },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-200 text-red-900' },
];

const SLA_STATUSES = [
  { value: 'on_time', label: 'On Time', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'at_risk', label: 'At Risk', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800', icon: XCircle },
];

const DEFAULT_FILTERS: AccessRequestFilter = {
  search: '',
  type: 'all',
  status: 'all',
  priority: 'all',
  requester: 'all',
  approver: 'all',
  dateRange: {
    start: null,
    end: null
  },
  tags: []
};

const AccessRequestManagement: React.FC<AccessRequestManagementProps> = ({
  className = ''
}) => {
  // State Management
  const [requests, setRequests] = useState<AccessRequestWithDetails[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequestWithDetails | null>(null);
  const [requestStats, setRequestStats] = useState<AccessRequestStats | null>(null);
  const [workflows, setWorkflows] = useState<AccessRequestWorkflow[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'list' | 'create' | 'details' | 'review'>('dashboard');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filters and Search
  const [filters, setFilters] = useState<AccessRequestFilter>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'kanban'>('table');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Dialog State
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showWorkflowConfig, setShowWorkflowConfig] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  // Bulk Operations
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  
  // Review State
  const [reviewMode, setReviewMode] = useState<'single' | 'batch' | 'workflow'>('single');
  const [reviewQueue, setReviewQueue] = useState<AccessRequestWithDetails[]>([]);

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const { 
    getAccessRequests,
    getAccessRequestStats,
    getAccessRequestWorkflows,
    getApprovalRules,
    createAccessRequest,
    updateAccessRequest,
    submitAccessRequest,
    approveAccessRequest,
    rejectAccessRequest,
    cancelAccessRequest,
    bulkProcessRequests,
    exportAccessRequests
  } = useAccessRequests();
  const { checkPermission } = usePermissions();
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Computed Properties
  const canManageRequests = currentUser && hasPermission(currentUser, 'access_request:manage');
  const canCreateRequests = currentUser && hasPermission(currentUser, 'access_request:create');
  const canApproveRequests = currentUser && hasPermission(currentUser, 'access_request:approve');
  const canReviewRequests = currentUser && hasPermission(currentUser, 'access_request:review');

  // Filtered and Grouped Requests
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(request =>
        request.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        request.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        request.requester.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(request => request.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(request => request.priority === filters.priority);
    }

    // Requester filter
    if (filters.requester !== 'all') {
      filtered = filtered.filter(request => request.requester.id === filters.requester);
    }

    // Approver filter
    if (filters.approver !== 'all') {
      filtered = filtered.filter(request => 
        request.approval_chain?.some(approval => approval.approver.id === filters.approver)
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(request => {
        const date = new Date(request.created_at);
        const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
      });
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(request =>
        filters.tags.some(tag => request.tags?.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'requester':
          aValue = a.requester.name;
          bValue = b.requester.name;
          break;
        case 'priority':
          const priorityOrder = { 'emergency': 5, 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created_at':
        default:
          aValue = a.created_at;
          bValue = b.created_at;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [requests, filters, sortBy, sortOrder]);

  // Grouped requests by status for kanban view
  const groupedRequests = useMemo(() => {
    const groups: { [key: string]: AccessRequestWithDetails[] } = {};
    
    REQUEST_STATUSES.forEach(status => {
      groups[status.value] = filteredRequests.filter(request => request.status === status.value);
    });

    return groups;
  }, [filteredRequests]);

  // Requests requiring user's attention
  const myActionItems = useMemo(() => {
    if (!currentUser) return [];

    return filteredRequests.filter(request => {
      // Requests I need to approve
      const needsMyApproval = request.approval_chain?.some(approval => 
        approval.approver.id === currentUser.id && approval.status === 'pending'
      );

      // Requests I created that need action
      const myRequestNeedsAction = request.requester.id === currentUser.id && 
        ['rejected', 'needs_info'].includes(request.status);

      return needsMyApproval || myRequestNeedsAction;
    });
  }, [filteredRequests, currentUser]);

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [requestsData, statsData, workflowsData, rulesData] = await Promise.all([
        getAccessRequests(),
        getAccessRequestStats(),
        getAccessRequestWorkflows(),
        getApprovalRules()
      ]);

      setRequests(requestsData.items);
      setRequestStats(statsData);
      setWorkflows(workflowsData.items);
      setApprovalRules(rulesData.items);
    } catch (err) {
      console.error('Error loading access requests:', err);
      setError('Failed to load access requests data');
    } finally {
      setLoading(false);
    }
  }, [getAccessRequests, getAccessRequestStats, getAccessRequestWorkflows, getApprovalRules]);

  // Real-time Updates
  useEffect(() => {
    const handleRequestUpdate = (data: any) => {
      if (data.type === 'access_request_updated') {
        loadData();
      }
    };

    subscribe('access_requests', handleRequestUpdate);

    return () => {
      unsubscribe('access_requests', handleRequestUpdate);
    };
  }, [subscribe, unsubscribe, loadData]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Event Handlers
  const handleCreateRequest = useCallback(async (requestData: Partial<AccessRequest>) => {
    if (!canCreateRequests) return;

    try {
      const newRequest = await createAccessRequest(requestData);
      setRequests(prev => [newRequest, ...prev]);
      setActiveView('details');
      setSelectedRequest(newRequest);
    } catch (err) {
      console.error('Error creating access request:', err);
      setError('Failed to create access request');
    }
  }, [canCreateRequests, createAccessRequest]);

  const handleUpdateRequest = useCallback(async (id: string, requestData: Partial<AccessRequest>) => {
    try {
      const updatedRequest = await updateAccessRequest(id, requestData);
      setRequests(prev => prev.map(r => r.id === id ? updatedRequest : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(updatedRequest);
      }
    } catch (err) {
      console.error('Error updating access request:', err);
      setError('Failed to update access request');
    }
  }, [updateAccessRequest, selectedRequest]);

  const handleSubmitRequest = useCallback(async (request: AccessRequestWithDetails) => {
    try {
      const submittedRequest = await submitAccessRequest(request.id);
      setRequests(prev => prev.map(r => r.id === request.id ? submittedRequest : r));
      if (selectedRequest?.id === request.id) {
        setSelectedRequest(submittedRequest);
      }
    } catch (err) {
      console.error('Error submitting access request:', err);
      setError('Failed to submit access request');
    }
  }, [submitAccessRequest, selectedRequest]);

  const handleApproveRequest = useCallback(async (request: AccessRequestWithDetails, comments?: string) => {
    if (!canApproveRequests) return;

    try {
      const approvedRequest = await approveAccessRequest(request.id, { comments });
      setRequests(prev => prev.map(r => r.id === request.id ? approvedRequest : r));
      if (selectedRequest?.id === request.id) {
        setSelectedRequest(approvedRequest);
      }
    } catch (err) {
      console.error('Error approving access request:', err);
      setError('Failed to approve access request');
    }
  }, [canApproveRequests, approveAccessRequest, selectedRequest]);

  const handleRejectRequest = useCallback(async (request: AccessRequestWithDetails, reason: string) => {
    if (!canApproveRequests) return;

    try {
      const rejectedRequest = await rejectAccessRequest(request.id, { reason });
      setRequests(prev => prev.map(r => r.id === request.id ? rejectedRequest : r));
      if (selectedRequest?.id === request.id) {
        setSelectedRequest(rejectedRequest);
      }
    } catch (err) {
      console.error('Error rejecting access request:', err);
      setError('Failed to reject access request');
    }
  }, [canApproveRequests, rejectAccessRequest, selectedRequest]);

  const handleBulkAction = useCallback(async (action: string, requestIds: string[], data?: any) => {
    if (!canManageRequests) return;

    try {
      await bulkProcessRequests({
        action,
        request_ids: requestIds,
        data
      });
      await loadData();
      setSelectedRequests(new Set());
    } catch (err) {
      console.error('Error processing bulk action:', err);
      setError('Failed to process bulk action');
    }
  }, [canManageRequests, bulkProcessRequests, loadData]);

  const handleExportRequests = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const data = await exportAccessRequests({
        request_ids: Array.from(selectedRequests),
        format,
        include_details: true
      });

      // Trigger download
      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv' : 
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
              'application/pdf'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access-requests-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting access requests:', err);
      setError('Failed to export access requests');
    }
  }, [selectedRequests, exportAccessRequests]);

  // Render Methods
  const renderHeader = () => (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Access Request Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage access requests, approvals, and workflow automation
        </p>
        {requestStats && (
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>{requestStats.total} total requests</span>
            <span>{requestStats.pending_approval} pending approval</span>
            <span>{myActionItems.length} requiring your attention</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {canCreateRequests && activeView !== 'create' && (
          <Button onClick={() => setActiveView('create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        )}
        
        {canReviewRequests && (
          <Button
            variant="outline"
            onClick={() => setActiveView('review')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Review Queue ({myActionItems.length})
          </Button>
        )}
        
        {activeView !== 'dashboard' && (
          <Button
            variant="outline"
            onClick={() => setActiveView('dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );

  const renderStatsCards = () => {
    if (!requestStats) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{requestStats.total}</div>
                <div className="text-sm text-gray-500">Total Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{requestStats.pending_approval}</div>
                <div className="text-sm text-gray-500">Pending Approval</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{requestStats.approved}</div>
                <div className="text-sm text-gray-500">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{requestStats.rejected}</div>
                <div className="text-sm text-gray-500">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{requestStats.avg_approval_time?.toFixed(1)}h</div>
                <div className="text-sm text-gray-500">Avg Approval Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuickActions = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('create')}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Create New Request</h3>
              <p className="text-sm text-gray-600">Submit a new access request</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('review')}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">Review Queue</h3>
              <p className="text-sm text-gray-600">{myActionItems.length} items need your attention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveView('list')}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">View All Requests</h3>
              <p className="text-sm text-gray-600">Browse and manage all requests</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecentActivity = () => {
    const recentRequests = requests
      .filter(request => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(request.updated_at || request.created_at) > dayAgo;
      })
      .slice(0, 5);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => {
                const typeConfig = REQUEST_TYPES.find(t => t.value === request.type);
                const statusConfig = REQUEST_STATUSES.find(s => s.value === request.status);
                const TypeIcon = typeConfig?.icon || FileText;
                const StatusIcon = statusConfig?.icon || Info;

                return (
                  <div 
                    key={request.id} 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      setSelectedRequest(request);
                      setActiveView('details');
                    }}
                  >
                    <div className={`p-2 rounded-lg ${typeConfig?.color || 'bg-gray-100'}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{request.title}</div>
                      <div className="text-sm text-gray-500">
                        by {request.requester.name} • {formatDate(request.created_at)}
                      </div>
                    </div>
                    <Badge className={statusConfig?.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig?.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {renderStatsCards()}
      {renderQuickActions()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderRecentActivity()}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Request Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requestStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {((requestStats.approved / requestStats.total) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">Approval Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {requestStats.avg_approval_time?.toFixed(1)}h
                    </div>
                    <div className="text-sm text-gray-500">Avg Processing Time</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Request Types</Label>
                  {REQUEST_TYPES.slice(0, 3).map((type) => {
                    const count = requests.filter(r => r.type === type.value).length;
                    const percentage = requests.length > 0 ? (count / requests.length) * 100 : 0;
                    
                    return (
                      <div key={type.value} className="flex items-center justify-between">
                        <span className="text-sm">{type.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Loading analytics...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRequestList = () => (
    <AccessRequestList
      requests={filteredRequests}
      onRequestSelect={(request) => {
        setSelectedRequest(request);
        setActiveView('details');
      }}
      onRequestUpdate={handleUpdateRequest}
      onBulkAction={handleBulkAction}
      filters={filters}
      onFiltersChange={setFilters}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      selectedRequests={selectedRequests}
      onSelectionChange={setSelectedRequests}
      loading={loading}
    />
  );

  const renderRequestDetails = () => (
    selectedRequest && (
      <AccessRequestDetails
        request={selectedRequest}
        onRequestUpdate={handleUpdateRequest}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        onBack={() => setActiveView('dashboard')}
        canApprove={canApproveRequests}
        canEdit={canManageRequests || selectedRequest.requester.id === currentUser?.id}
      />
    )
  );

  const renderRequestCreate = () => (
    <AccessRequestCreate
      onRequestCreate={handleCreateRequest}
      onCancel={() => setActiveView('dashboard')}
      workflows={workflows}
    />
  );

  const renderReviewInterface = () => (
    <AccessReviewInterface
      requests={myActionItems}
      onApprove={handleApproveRequest}
      onReject={handleRejectRequest}
      onBulkAction={handleBulkAction}
      reviewMode={reviewMode}
      onReviewModeChange={setReviewMode}
    />
  );

  if (!canManageRequests && !canCreateRequests && !canApproveRequests) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to access the request management system.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-6 ${className}`}
    >
      {renderHeader()}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderDashboard()}
          </motion.div>
        )}

        {activeView === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderRequestList()}
          </motion.div>
        )}

        {activeView === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderRequestCreate()}
          </motion.div>
        )}

        {activeView === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderRequestDetails()}
          </motion.div>
        )}

        {activeView === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderReviewInterface()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Items */}
      {myActionItems.length > 0 && activeView === 'dashboard' && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full shadow-lg"
                  onClick={() => setActiveView('review')}
                >
                  <Bell className="h-5 w-5 mr-2" />
                  {myActionItems.length}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {myActionItems.length} request{myActionItems.length !== 1 ? 's' : ''} require your attention
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AccessRequestManagement;