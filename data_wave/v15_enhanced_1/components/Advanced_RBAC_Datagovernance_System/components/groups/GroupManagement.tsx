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
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '../shared/DataTable';
import {
  Users,
  User,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Key,
  Lock,
  Unlock,
  Target,
  Zap,
  Network,
  Database,
  Server,
  FileText,
  Archive,
  BookOpen,
  Layers,
  Tag,
  Globe,
  Workflow,
  GitBranch,
  History,
  Bell,
  Mail,
  Phone,
  Building,
  Home,
  Share,
  Copy,
  Star,
  Heart,
  Bookmark,
  Flag,
  MessageSquare,
  ExternalLink,
  Link,
  Compass,
  TreePine,
} from 'lucide-react';

// Hooks and Services
import { useGroups } from '../../hooks/useGroups';
import { useUsers } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';

// Components
import GroupList from './GroupList';
import GroupDetails from './GroupDetails';
import GroupCreateEdit from './GroupCreateEdit';
import GroupMemberManagement from './GroupMemberManagement';

// Types
import type { Group } from '../../types/group.types';
import type { User as UserType } from '../../types/user.types';
import type { Role } from '../../types/role.types';
import type { Permission } from '../../types/permission.types';
import type { AuditLog } from '../../types/audit.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate, formatNumber } from '../../utils/format.utils';

interface GroupManagementProps {
  className?: string;
}

interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  avgGroupSize: number;
  groupsWithRoles: number;
  recentActivity: number;
}

interface GroupFilter {
  search: string;
  status: 'all' | 'active' | 'inactive';
  type: 'all' | 'department' | 'project' | 'security' | 'custom';
  hasMembers: 'all' | 'yes' | 'no';
  hasRoles: 'all' | 'yes' | 'no';
  createdAfter?: Date;
  createdBefore?: Date;
}

const INITIAL_FILTER: GroupFilter = {
  search: '',
  status: 'all',
  type: 'all',
  hasMembers: 'all',
  hasRoles: 'all',
};

const GROUP_TYPES = [
  { value: 'department', label: 'Department', icon: Building, color: 'bg-blue-100 text-blue-800' },
  { value: 'project', label: 'Project', icon: Target, color: 'bg-green-100 text-green-800' },
  { value: 'security', label: 'Security', icon: Shield, color: 'bg-red-100 text-red-800' },
  { value: 'custom', label: 'Custom', icon: Tag, color: 'bg-purple-100 text-purple-800' },
];

const GroupManagement: React.FC<GroupManagementProps> = ({
  className = ''
}) => {
  // State Management
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [stats, setStats] = useState<GroupStats>({
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0,
    avgGroupSize: 0,
    groupsWithRoles: 0,
    recentActivity: 0
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // View State
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'create' | 'edit' | 'members'>('list');
  const [filter, setFilter] = useState<GroupFilter>(INITIAL_FILTER);
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Dialog State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'activate' | 'deactivate' | null>(null);

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const {
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkDeleteGroups,
    bulkUpdateGroups,
    getGroupStats,
    getGroupMembers,
    addGroupMember,
    removeGroupMember,
    assignGroupRole,
    removeGroupRole
  } = useGroups();
  const { getUsers } = useUsers();
  const { getRoles } = useRoles();
  const { checkPermission } = usePermissions();
  const { getAuditLogs } = useAuditLogs();
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Computed Properties
  const canManageGroups = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:manage');
  }, [currentUser]);

  const canCreateGroups = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:create');
  }, [currentUser]);

  const canDeleteGroups = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:delete');
  }, [currentUser]);

  const canManageMembers = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'group:manage_members');
  }, [currentUser]);

  const filteredGroups = useMemo(() => {
    let filtered = groups;

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchLower) ||
        group.description?.toLowerCase().includes(searchLower) ||
        group.type?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filter.status !== 'all') {
      filtered = filtered.filter(group => {
        if (filter.status === 'active') return group.is_active;
        if (filter.status === 'inactive') return !group.is_active;
        return true;
      });
    }

    // Type filter
    if (filter.type !== 'all') {
      filtered = filtered.filter(group => group.type === filter.type);
    }

    // Members filter
    if (filter.hasMembers !== 'all') {
      filtered = filtered.filter(group => {
        const hasMembers = (group.member_count || 0) > 0;
        return filter.hasMembers === 'yes' ? hasMembers : !hasMembers;
      });
    }

    // Roles filter
    if (filter.hasRoles !== 'all') {
      filtered = filtered.filter(group => {
        const hasRoles = (group.role_count || 0) > 0;
        return filter.hasRoles === 'yes' ? hasRoles : !hasRoles;
      });
    }

    // Date filters
    if (filter.createdAfter) {
      filtered = filtered.filter(group => 
        new Date(group.created_at) >= filter.createdAfter!
      );
    }
    if (filter.createdBefore) {
      filtered = filtered.filter(group => 
        new Date(group.created_at) <= filter.createdBefore!
      );
    }

    return filtered;
  }, [groups, filter]);

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [groupsData, statsData, auditData] = await Promise.all([
        getGroups({ include_stats: true }),
        getGroupStats(),
        getAuditLogs({
          entity_type: 'group',
          limit: 100
        })
      ]);

      setGroups(groupsData.items);
      setStats(statsData);
      setAuditLogs(auditData.items);
    } catch (err) {
      console.error('Error loading group data:', err);
      setError('Failed to load group data');
    } finally {
      setLoading(false);
    }
  }, [getGroups, getGroupStats, getAuditLogs]);

  // Real-time Updates
  useEffect(() => {
    const handleGroupUpdate = (data: any) => {
      loadData();
    };

    subscribe('groups', handleGroupUpdate);
    
    return () => {
      unsubscribe('groups', handleGroupUpdate);
    };
  }, [subscribe, unsubscribe, loadData]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Event Handlers
  const handleCreateGroup = useCallback(() => {
    setCurrentView('create');
    setSelectedGroup(null);
  }, []);

  const handleEditGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
    setCurrentView('edit');
  }, []);

  const handleViewGroup = useCallback((group: Group) => {
    setSelectedGroup(group);
    setCurrentView('details');
  }, []);

  const handleManageMembers = useCallback((group: Group) => {
    setSelectedGroup(group);
    setCurrentView('members');
  }, []);

  const handleDeleteGroup = useCallback(async (group: Group) => {
    if (!canDeleteGroups) return;

    setSaving(true);
    try {
      await deleteGroup(group.id);
      await loadData();
      if (selectedGroup?.id === group.id) {
        setSelectedGroup(null);
        setCurrentView('list');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
    } finally {
      setSaving(false);
    }
  }, [canDeleteGroups, deleteGroup, loadData, selectedGroup]);

  const handleBulkAction = useCallback(async () => {
    if (selectedGroups.size === 0 || !bulkAction) return;

    setSaving(true);
    try {
      const groupIds = Array.from(selectedGroups);
      
      switch (bulkAction) {
        case 'delete':
          if (canDeleteGroups) {
            await bulkDeleteGroups(groupIds);
          }
          break;
        case 'activate':
          if (canManageGroups) {
            await bulkUpdateGroups(groupIds, { is_active: true });
          }
          break;
        case 'deactivate':
          if (canManageGroups) {
            await bulkUpdateGroups(groupIds, { is_active: false });
          }
          break;
      }

      setSelectedGroups(new Set());
      setBulkAction(null);
      setShowBulkActionDialog(false);
      await loadData();
    } catch (err) {
      console.error('Error performing bulk action:', err);
    } finally {
      setSaving(false);
    }
  }, [selectedGroups, bulkAction, canDeleteGroups, canManageGroups, bulkDeleteGroups, bulkUpdateGroups, loadData]);

  const handleGroupSave = useCallback(async (groupData: Partial<Group>) => {
    setSaving(true);
    try {
      if (selectedGroup) {
        await updateGroup(selectedGroup.id, groupData);
      } else {
        await createGroup(groupData);
      }
      await loadData();
      setCurrentView('list');
      setSelectedGroup(null);
    } catch (err) {
      console.error('Error saving group:', err);
    } finally {
      setSaving(false);
    }
  }, [selectedGroup, updateGroup, createGroup, loadData]);

  const handleFilterChange = useCallback((newFilter: Partial<GroupFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const handleSelectGroup = useCallback((groupId: number, selected: boolean) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(groupId);
      } else {
        newSet.delete(groupId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAllGroups = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedGroups(new Set(filteredGroups.map(g => g.id)));
    } else {
      setSelectedGroups(new Set());
    }
  }, [filteredGroups]);

  // Render Methods
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Group Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage user groups, memberships, and permissions
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          onClick={() => setCurrentView('list')}
          className={currentView === 'list' ? 'bg-blue-50 border-blue-200' : ''}
        >
          <Users className="h-4 w-4 mr-2" />
          All Groups
        </Button>
        {canCreateGroups && (
          <Button onClick={handleCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        )}
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{stats.totalGroups}</div>
              <div className="text-sm text-gray-500">Total Groups</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{stats.activeGroups}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">{formatNumber(stats.totalMembers)}</div>
              <div className="text-sm text-gray-500">Total Members</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">{stats.avgGroupSize.toFixed(1)}</div>
              <div className="text-sm text-gray-500">Avg Size</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">{stats.groupsWithRoles}</div>
              <div className="text-sm text-gray-500">With Roles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <div className="text-sm text-gray-500">Recent Activity</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return (
          <GroupList
            groups={filteredGroups}
            selectedGroups={selectedGroups}
            filter={filter}
            loading={loading}
            onGroupSelect={handleViewGroup}
            onGroupEdit={handleEditGroup}
            onGroupDelete={handleDeleteGroup}
            onManageMembers={handleManageMembers}
            onFilterChange={handleFilterChange}
            onSelectGroup={handleSelectGroup}
            onSelectAll={handleSelectAllGroups}
            canManage={canManageGroups}
            canDelete={canDeleteGroups}
            canManageMembers={canManageMembers}
          />
        );
      case 'details':
        return selectedGroup ? (
          <GroupDetails
            group={selectedGroup}
            onEdit={() => handleEditGroup(selectedGroup)}
            onDelete={() => handleDeleteGroup(selectedGroup)}
            onManageMembers={() => handleManageMembers(selectedGroup)}
            onBack={() => setCurrentView('list')}
            canEdit={canManageGroups}
            canDelete={canDeleteGroups}
            canManageMembers={canManageMembers}
          />
        ) : null;
      case 'create':
      case 'edit':
        return (
          <GroupCreateEdit
            group={currentView === 'edit' ? selectedGroup : undefined}
            onSave={handleGroupSave}
            onCancel={() => setCurrentView('list')}
            saving={saving}
          />
        );
      case 'members':
        return selectedGroup ? (
          <GroupMemberManagement
            group={selectedGroup}
            onBack={() => setCurrentView('details')}
            canManageMembers={canManageMembers}
          />
        ) : null;
      default:
        return null;
    }
  };

  if (loading && currentView === 'list') {
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
      {currentView === 'list' && renderStatsCards()}
      {renderContent()}

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedGroups.size > 0 && currentView === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 flex items-center space-x-4 z-50"
          >
            <span className="text-sm font-medium">
              {selectedGroups.size} group{selectedGroups.size > 1 ? 's' : ''} selected
            </span>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              {canManageGroups && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBulkAction('activate');
                      setShowBulkActionDialog(true);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBulkAction('deactivate');
                      setShowBulkActionDialog(true);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                </>
              )}
              {canDeleteGroups && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkActionDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedGroups(new Set())}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={showBulkActionDialog} onOpenChange={setShowBulkActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedGroups.size} group{selectedGroups.size > 1 ? 's' : ''}?
              {bulkAction === 'delete' && ' This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkActionDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              onClick={handleBulkAction}
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${bulkAction}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default GroupManagement;