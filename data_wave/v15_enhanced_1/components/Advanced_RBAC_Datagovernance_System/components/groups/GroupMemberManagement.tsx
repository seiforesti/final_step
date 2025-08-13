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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '../shared/DataTable';
import { Calendar } from '@/components/ui/calendar';
import {
  Users,
  User,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Plus,
  Minus,
  X,
  Save,
  ArrowLeft,
  Check,
  ChevronsUpDown,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  MoreVertical,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Key,
  Lock,
  Unlock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Network,
  Database,
  Server,
  FileText,
  Archive,
  BookOpen,
  Layers,
  Workflow,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Star,
  Heart,
  Bookmark,
  Share,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Home,
  Code,
  Terminal,
  Monitor,
  Cpu,
} from 'lucide-react';

// Hooks and Services
import { useGroups } from '../../hooks/useGroups';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';

// Types
import type { Group } from '../../types/group.types';
import type { User as UserType } from '../../types/user.types';
import type { Role } from '../../types/role.types';
import type { GroupMember } from '../../types/group.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate, formatDateTime } from '../../utils/format.utils';

interface GroupMemberManagementProps {
  group: Group;
  onBack: () => void;
  className?: string;
}

interface MemberWithDetails extends GroupMember {
  user: UserType;
  roles: Role[];
  permissions: string[];
  lastActivity?: Date;
  joinedAt: Date;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

interface BulkOperation {
  type: 'add_role' | 'remove_role' | 'remove_member' | 'activate' | 'deactivate' | 'suspend';
  roleId?: number;
  reason?: string;
  expiry?: Date;
}

interface MembershipRequest {
  id: string;
  user: UserType;
  requestedAt: Date;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface MemberAnalytics {
  totalMembers: number;
  activeMembers: number;
  pendingRequests: number;
  recentJoins: number;
  memberGrowth: Array<{
    date: string;
    count: number;
    growth: number;
  }>;
  roleDistribution: Array<{
    role: Role;
    count: number;
    percentage: number;
  }>;
  activityMetrics: {
    dailyActive: number;
    weeklyActive: number;
    monthlyActive: number;
    averageSessionDuration: number;
  };
}

const MEMBER_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800', icon: UserX },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800', icon: UserMinus },
];

const BULK_OPERATIONS = [
  { value: 'add_role', label: 'Add Role', icon: Crown, description: 'Assign a role to selected members' },
  { value: 'remove_role', label: 'Remove Role', icon: UserMinus, description: 'Remove a role from selected members' },
  { value: 'activate', label: 'Activate', icon: UserCheck, description: 'Activate selected members' },
  { value: 'deactivate', label: 'Deactivate', icon: UserX, description: 'Deactivate selected members' },
  { value: 'suspend', label: 'Suspend', icon: UserMinus, description: 'Suspend selected members' },
  { value: 'remove_member', label: 'Remove', icon: Trash2, description: 'Remove selected members from group' },
];

const GroupMemberManagement: React.FC<GroupMemberManagementProps> = ({
  group,
  onBack,
  className = ''
}) => {
  // State Management
  const [members, setMembers] = useState<MemberWithDetails[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>([]);
  const [analytics, setAnalytics] = useState<MemberAnalytics | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selection and Bulk Operations
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Dialog State
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [showBulkOperationDialog, setShowBulkOperationDialog] = useState(false);
  const [showMemberDetailsDialog, setShowMemberDetailsDialog] = useState(false);
  const [showRemoveConfirmDialog, setShowRemoveConfirmDialog] = useState(false);
  
  // Form State
  const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<UserType[]>([]);
  const [addMemberRoles, setAddMemberRoles] = useState<Role[]>([]);
  const [addMemberReason, setAddMemberReason] = useState('');
  const [addMemberExpiry, setAddMemberExpiry] = useState<Date | undefined>();
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<MemberWithDetails | null>(null);
  
  // Hooks
  const { user: currentUser } = useCurrentUser();
  const {
    getGroupMembers,
    addGroupMembers,
    removeGroupMembers,
    updateGroupMemberRoles,
    getGroupMembershipRequests,
    approveGroupMembershipRequest,
    rejectGroupMembershipRequest,
    getGroupMemberAnalytics,
    exportGroupMembers
  } = useGroups();
  const { getUsers } = useUsers();
  const { getRoles } = useRoles();
  const { checkPermission } = usePermissions();
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Computed Properties
  const canManageMembers = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:manage_members');
  }, [currentUser]);

  const canAddMembers = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:add_members');
  }, [currentUser]);

  const canRemoveMembers = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:remove_members');
  }, [currentUser]);

  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member =>
        member.roles.some(role => role.id.toString() === roleFilter)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = `${a.user.first_name} ${a.user.last_name}`;
          bValue = `${b.user.first_name} ${b.user.last_name}`;
          break;
        case 'email':
          aValue = a.user.email;
          bValue = b.user.email;
          break;
        case 'joinedAt':
          aValue = a.joinedAt;
          bValue = b.joinedAt;
          break;
        case 'lastActivity':
          aValue = a.lastActivity || new Date(0);
          bValue = b.lastActivity || new Date(0);
          break;
        case 'roles':
          aValue = a.roles.length;
          bValue = b.roles.length;
          break;
        default:
          aValue = a.user.first_name;
          bValue = b.user.first_name;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [members, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const selectedMembersData = useMemo(() => {
    return members.filter(member => selectedMembers.has(member.user.id.toString()));
  }, [members, selectedMembers]);

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        membersData,
        usersData,
        rolesData,
        requestsData,
        analyticsData
      ] = await Promise.all([
        getGroupMembers(group.id),
        getUsers(),
        getRoles(),
        getGroupMembershipRequests(group.id),
        getGroupMemberAnalytics(group.id)
      ]);

      setMembers(membersData);
      setAvailableUsers(usersData.items.filter(user => 
        !membersData.some(member => member.user.id === user.id)
      ));
      setAvailableRoles(rolesData.items);
      setMembershipRequests(requestsData);
      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Error loading group member data:', err);
      setError('Failed to load group member data');
    } finally {
      setLoading(false);
    }
  }, [group.id, getGroupMembers, getUsers, getRoles, getGroupMembershipRequests, getGroupMemberAnalytics]);

  // Real-time Updates
  useEffect(() => {
    const handleGroupUpdate = (data: any) => {
      if (data.group_id === group.id) {
        loadData();
      }
    };

    subscribe(`group.${group.id}.members`, handleGroupUpdate);
    
    return () => {
      unsubscribe(`group.${group.id}.members`, handleGroupUpdate);
    };
  }, [group.id, subscribe, unsubscribe, loadData]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Selection Handlers
  const handleSelectMember = useCallback((memberId: string, selected: boolean) => {
    setSelectedMembers(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(memberId);
      } else {
        newSet.delete(memberId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedMembers(new Set(filteredMembers.map(m => m.user.id.toString())));
    } else {
      setSelectedMembers(new Set());
    }
  }, [filteredMembers]);

  // Action Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  const handleAddMembers = useCallback(async () => {
    if (!canAddMembers || selectedUsersToAdd.length === 0) return;

    try {
      const memberData = selectedUsersToAdd.map(user => ({
        user_id: user.id,
        roles: addMemberRoles.map(role => role.id),
        reason: addMemberReason,
        expires_at: addMemberExpiry
      }));

      await addGroupMembers(group.id, memberData);
      
      setShowAddMemberDialog(false);
      setSelectedUsersToAdd([]);
      setAddMemberRoles([]);
      setAddMemberReason('');
      setAddMemberExpiry(undefined);
      
      await loadData();
    } catch (err) {
      console.error('Error adding members:', err);
      setError('Failed to add members');
    }
  }, [group.id, selectedUsersToAdd, addMemberRoles, addMemberReason, addMemberExpiry, canAddMembers, addGroupMembers, loadData]);

  const handleRemoveMembers = useCallback(async (memberIds: string[], reason?: string) => {
    if (!canRemoveMembers) return;

    try {
      await removeGroupMembers(group.id, memberIds, reason);
      setSelectedMembers(new Set());
      setShowRemoveConfirmDialog(false);
      await loadData();
    } catch (err) {
      console.error('Error removing members:', err);
      setError('Failed to remove members');
    }
  }, [group.id, canRemoveMembers, removeGroupMembers, loadData]);

  const handleBulkOperation = useCallback(async () => {
    if (!bulkOperation || selectedMembers.size === 0) return;

    try {
      const memberIds = Array.from(selectedMembers);
      
      switch (bulkOperation.type) {
        case 'add_role':
          if (bulkOperation.roleId) {
            await Promise.all(memberIds.map(memberId =>
              updateGroupMemberRoles(group.id, parseInt(memberId), {
                add_roles: [bulkOperation.roleId!],
                reason: bulkOperation.reason,
                expires_at: bulkOperation.expiry
              })
            ));
          }
          break;
        case 'remove_role':
          if (bulkOperation.roleId) {
            await Promise.all(memberIds.map(memberId =>
              updateGroupMemberRoles(group.id, parseInt(memberId), {
                remove_roles: [bulkOperation.roleId!],
                reason: bulkOperation.reason
              })
            ));
          }
          break;
        case 'remove_member':
          await handleRemoveMembers(memberIds, bulkOperation.reason);
          break;
        // Add other bulk operations as needed
      }

      setShowBulkOperationDialog(false);
      setBulkOperation(null);
      setSelectedMembers(new Set());
      await loadData();
    } catch (err) {
      console.error('Error performing bulk operation:', err);
      setError('Failed to perform bulk operation');
    }
  }, [bulkOperation, selectedMembers, group.id, updateGroupMemberRoles, handleRemoveMembers, loadData]);

  const handleApproveRequest = useCallback(async (requestId: string) => {
    try {
      await approveGroupMembershipRequest(requestId);
      await loadData();
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    }
  }, [approveGroupMembershipRequest, loadData]);

  const handleRejectRequest = useCallback(async (requestId: string, reason?: string) => {
    try {
      await rejectGroupMembershipRequest(requestId, reason);
      await loadData();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request');
    }
  }, [rejectGroupMembershipRequest, loadData]);

  const handleExportMembers = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const data = await exportGroupMembers(group.id, format);
      // Trigger download
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 
              format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `group-${group.name}-members-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting members:', err);
      setError('Failed to export members');
    }
  }, [group.id, group.name, exportGroupMembers]);

  // Effect for bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedMembers.size > 0);
  }, [selectedMembers.size]);

  // Render Methods
  const renderHeader = () => (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Group
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {group.name} Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage group membership, roles, and permissions
          </p>
          {analytics && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{analytics.totalMembers} total members</span>
              <span>{analytics.activeMembers} active</span>
              <span>{analytics.pendingRequests} pending requests</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {canAddMembers && (
          <Button onClick={() => setShowAddMemberDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Members
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExportMembers('csv')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportMembers('json')}>
              <Code className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportMembers('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh data</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  const renderFiltersAndSearch = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {MEMBER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {availableRoles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="joinedAt">Joined Date</SelectItem>
              <SelectItem value="lastActivity">Last Activity</SelectItem>
              <SelectItem value="roles">Role Count</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderMembersTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Members ({filteredMembers.length})</span>
          </CardTitle>
          
          {selectedMembers.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedMembers.size} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBulkOperationDialog(true)}
              >
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          data={filteredMembers}
          columns={[
            {
              id: 'select',
              header: ({ table }) => (
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(value) => handleSelectAll(!!value)}
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  checked={selectedMembers.has(row.original.user.id.toString())}
                  onCheckedChange={(value) => 
                    handleSelectMember(row.original.user.id.toString(), !!value)
                  }
                />
              ),
              enableSorting: false,
              enableHiding: false,
            },
            {
              accessorKey: 'user.first_name',
              header: 'Member',
              cell: ({ row }) => {
                const member = row.original;
                const StatusIcon = MEMBER_STATUSES.find(s => s.value === member.status)?.icon || User;
                
                return (
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.user.first_name} {member.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{member.user.email}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <StatusIcon className="h-3 w-3" />
                        <Badge 
                          className={MEMBER_STATUSES.find(s => s.value === member.status)?.color}
                          variant="secondary"
                        >
                          {MEMBER_STATUSES.find(s => s.value === member.status)?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              accessorKey: 'roles',
              header: 'Roles',
              cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                  {row.original.roles.slice(0, 3).map((role) => (
                    <Badge key={role.id} variant="outline" className="text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      {role.name}
                    </Badge>
                  ))}
                  {row.original.roles.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{row.original.roles.length - 3} more
                    </Badge>
                  )}
                </div>
              ),
            },
            {
              accessorKey: 'joinedAt',
              header: 'Joined',
              cell: ({ row }) => formatDate(row.getValue('joinedAt')),
            },
            {
              accessorKey: 'lastActivity',
              header: 'Last Activity',
              cell: ({ row }) => {
                const date = row.getValue('lastActivity') as Date;
                return date ? formatDate(date) : 'Never';
              },
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedMemberDetails(row.original);
                        setShowMemberDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {canManageMembers && (
                      <>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Roles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMembers(new Set([row.original.user.id.toString()]));
                            setShowRemoveConfirmDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );

  const renderRequestsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Membership Requests ({membershipRequests.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {membershipRequests.length > 0 ? (
            <div className="space-y-4">
              {membershipRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {request.user.first_name} {request.user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{request.user.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Requested {formatDateTime(request.requestedAt)}
                      </div>
                      {request.reason && (
                        <div className="text-sm text-gray-600 mt-1">
                          Reason: {request.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No pending membership requests
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => {
    if (!analytics) return <div>No analytics data available</div>;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.totalMembers}</div>
                  <div className="text-sm text-gray-500">Total Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.activeMembers}</div>
                  <div className="text-sm text-gray-500">Active Members</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.pendingRequests}</div>
                  <div className="text-sm text-gray-500">Pending Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.recentJoins}</div>
                  <div className="text-sm text-gray-500">Recent Joins</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Member Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end space-x-2">
              {analytics.memberGrowth.map((point, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(point.count / Math.max(...analytics.memberGrowth.map(p => p.count))) * 200}px` }}
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(point.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Role Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.roleDistribution.map((item) => (
                <div key={item.role.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{item.role.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Activity Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.activityMetrics.dailyActive}</div>
                <div className="text-sm text-gray-500">Daily Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.activityMetrics.weeklyActive}</div>
                <div className="text-sm text-gray-500">Weekly Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics.activityMetrics.monthlyActive}</div>
                <div className="text-sm text-gray-500">Monthly Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics.activityMetrics.averageSessionDuration}m</div>
                <div className="text-sm text-gray-500">Avg Session</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
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

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {membershipRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {membershipRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          {renderFiltersAndSearch()}
          {renderMembersTable()}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {renderRequestsTab()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {renderAnalyticsTab()}
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Members to {group.name}</DialogTitle>
            <DialogDescription>
              Select users to add to this group and assign initial roles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Users</Label>
              <div className="mt-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      checked={selectedUsersToAdd.some(u => u.id === user.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsersToAdd([...selectedUsersToAdd, user]);
                        } else {
                          setSelectedUsersToAdd(selectedUsersToAdd.filter(u => u.id !== user.id));
                        }
                      }}
                    />
                    <span>{user.first_name} {user.last_name} ({user.email})</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Initial Roles (Optional)</Label>
              <div className="mt-2 border rounded-md p-3 max-h-32 overflow-y-auto">
                {availableRoles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      checked={addMemberRoles.some(r => r.id === role.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAddMemberRoles([...addMemberRoles, role]);
                        } else {
                          setAddMemberRoles(addMemberRoles.filter(r => r.id !== role.id));
                        }
                      }}
                    />
                    <span>{role.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                value={addMemberReason}
                onChange={(e) => setAddMemberReason(e.target.value)}
                placeholder="Reason for adding these members..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMembers}
              disabled={selectedUsersToAdd.length === 0}
            >
              Add {selectedUsersToAdd.length} Member{selectedUsersToAdd.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Operation Dialog */}
      <Dialog open={showBulkOperationDialog} onOpenChange={setShowBulkOperationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Operation</DialogTitle>
            <DialogDescription>
              Perform an action on {selectedMembers.size} selected member{selectedMembers.size !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Operation</Label>
              <Select
                value={bulkOperation?.type}
                onValueChange={(value) => setBulkOperation({ type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose operation" />
                </SelectTrigger>
                <SelectContent>
                  {BULK_OPERATIONS.map((op) => {
                    const IconComponent = op.icon;
                    return (
                      <SelectItem key={op.value} value={op.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <div>
                            <div>{op.label}</div>
                            <div className="text-xs text-gray-500">{op.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {(bulkOperation?.type === 'add_role' || bulkOperation?.type === 'remove_role') && (
              <div>
                <Label>Select Role</Label>
                <Select
                  value={bulkOperation.roleId?.toString()}
                  onValueChange={(value) => setBulkOperation({
                    ...bulkOperation,
                    roleId: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                value={bulkOperation?.reason || ''}
                onChange={(e) => setBulkOperation({
                  ...bulkOperation!,
                  reason: e.target.value
                })}
                placeholder="Reason for this bulk operation..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkOperationDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkOperation}
              disabled={!bulkOperation?.type}
            >
              Apply to {selectedMembers.size} Member{selectedMembers.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Details Dialog */}
      <Dialog open={showMemberDetailsDialog} onOpenChange={setShowMemberDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMemberDetails && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMemberDetails.user.first_name} {selectedMemberDetails.user.last_name}
                  </h3>
                  <p className="text-gray-600">{selectedMemberDetails.user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={MEMBER_STATUSES.find(s => s.value === selectedMemberDetails.status)?.color}>
                      {MEMBER_STATUSES.find(s => s.value === selectedMemberDetails.status)?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMemberDetails.roles.map((role) => (
                    <Badge key={role.id} variant="outline">
                      <Crown className="h-3 w-3 mr-1" />
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Membership Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Joined:</span>
                    <div>{formatDate(selectedMemberDetails.joinedAt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Activity:</span>
                    <div>
                      {selectedMemberDetails.lastActivity 
                        ? formatDate(selectedMemberDetails.lastActivity)
                        : 'Never'
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Permissions</h4>
                <div className="max-h-32 overflow-y-auto">
                  {selectedMemberDetails.permissions.map((permission, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {permission}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMemberDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showRemoveConfirmDialog} onOpenChange={setShowRemoveConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Members</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} from this group?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason (Optional)</Label>
              <Textarea placeholder="Reason for removing these members..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRemoveMembers(Array.from(selectedMembers))}
            >
              Remove Member{selectedMembers.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Bulk Actions */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} selected
                  </span>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    size="sm"
                    onClick={() => setShowBulkOperationDialog(true)}
                  >
                    Bulk Actions
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedMembers(new Set())}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GroupMemberManagement;