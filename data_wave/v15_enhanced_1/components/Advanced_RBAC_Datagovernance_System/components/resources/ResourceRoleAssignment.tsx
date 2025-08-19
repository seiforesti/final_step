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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Crown,
  Shield,
  Key,
  Lock,
  Unlock,
  Plus,
  Minus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  ChevronsUpDown,
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
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
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
import { useResources } from '../../hooks/useResources';
import { useRoles } from '../../hooks/useRoles';
import { useUsers } from '../../hooks/useUsers';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';

// Types
import type {
  Resource,
  ResourceRole,
  ResourcePermissions,
} from '../../types/resource.types';
import type { Role } from '../../types/role.types';
import type { User as UserType } from '../../types/user.types';
import type { Permission } from '../../types/permission.types';
import type { AuditLog } from '../../types/audit.types';

// Utils
import { validateResourceAccess, hasPermission } from '../../utils/permission.utils';
import { formatDate, formatDuration } from '../../utils/format.utils';

interface ResourceRoleAssignmentProps {
  resource: Resource;
  onClose?: () => void;
  className?: string;
}

interface RoleAssignment {
  id: number;
  user: UserType;
  role: Role;
  assignedAt: Date;
  assignedBy: UserType;
  expiresAt?: Date;
  isActive: boolean;
  conditions?: string[];
  source: 'direct' | 'inherited' | 'group';
  inheritedFrom?: string;
}

interface AssignmentRequest {
  userId: number;
  roleId: number;
  expiresAt?: Date;
  conditions?: string[];
  reason?: string;
}

interface BulkAssignmentRequest {
  userIds: number[];
  roleId: number;
  expiresAt?: Date;
  conditions?: string[];
  reason?: string;
}

interface AccessMatrix {
  users: UserType[];
  roles: Role[];
  permissions: Permission[];
  assignments: Map<string, RoleAssignment>;
}

const ResourceRoleAssignment: React.FC<ResourceRoleAssignmentProps> = ({
  resource,
  onClose,
  className = ''
}) => {
  // State Management
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [accessMatrix, setAccessMatrix] = useState<AccessMatrix | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('assignments');
  
  // Assignment State
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [assignmentExpiry, setAssignmentExpiry] = useState<string>('');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  
  // Search and Filter State
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  
  // Matrix View State
  const [showMatrix, setShowMatrix] = useState(false);
  const [matrixMode, setMatrixMode] = useState<'users' | 'roles'>('users');
  
  // Selection State
  const [selectedAssignments, setSelectedAssignments] = useState<Set<number>>(new Set());

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const {
    getResourcePermissions,
    assignResourceRole,
    removeResourceRole,
    bulkAssignResourceRoles,
    bulkRemoveResourceRoles,
    getResourceRoleAssignments,
    updateResourceRoleAssignment
  } = useResources();
  const { getRoles, getRolePermissions } = useRoles();
  const { getUsers, searchUsers } = useUsers();
  const { checkPermission } = usePermissions();
  const { getAuditLogs } = useAuditLogs();
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Computed Properties
  const canManageRoles = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'resource:manage_access', resource);
  }, [currentUser, resource]);

  const canAssignRoles = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'role:assign', resource);
  }, [currentUser, resource]);

  const canRevokeRoles = useMemo(() => {
    return currentUser && hasPermission(currentUser, 'role:revoke', resource);
  }, [currentUser, resource]);

  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    if (filterRole !== 'all') {
      filtered = filtered.filter(a => a.role.id.toString() === filterRole);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => {
        if (filterStatus === 'active') return a.isActive;
        if (filterStatus === 'expired') return !a.isActive;
        return true;
      });
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(a => a.source === filterSource);
    }

    if (userSearch) {
      filtered = filtered.filter(a => 
        a.user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        a.user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        `${a.user.first_name} ${a.user.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
      );
    }

    return filtered;
  }, [assignments, filterRole, filterStatus, filterSource, userSearch]);

  const assignmentStats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter(a => a.isActive).length;
    const direct = assignments.filter(a => a.source === 'direct').length;
    const inherited = assignments.filter(a => a.source === 'inherited').length;
    const expiring = assignments.filter(a => 
      a.expiresAt && new Date(a.expiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;

    return { total, active, direct, inherited, expiring };
  }, [assignments]);

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        assignmentsData,
        rolesData,
        usersData,
        permissionsData,
        auditData
      ] = await Promise.all([
        getResourceRoleAssignments(resource.id),
        getRoles(),
        getUsers(),
        getResourcePermissions(resource.id),
        getAuditLogs({
          resource_id: resource.id,
          action_type: 'role_assignment',
          limit: 100
        })
      ]);

      setAssignments(assignmentsData);
      setAvailableRoles(rolesData.items);
      setAvailableUsers(usersData.items);
      setPermissions(permissionsData.permissions || []);
      setAuditLogs(auditData.items);

      // Build access matrix
      buildAccessMatrix(assignmentsData, usersData.items, rolesData.items, permissionsData.permissions || []);

    } catch (err) {
      console.error('Error loading role assignments:', err);
      setError('Failed to load role assignments');
    } finally {
      setLoading(false);
    }
  }, [resource.id, getResourceRoleAssignments, getRoles, getUsers, getResourcePermissions, getAuditLogs]);

  const buildAccessMatrix = useCallback((
    assignments: RoleAssignment[],
    users: UserType[],
    roles: Role[],
    permissions: Permission[]
  ) => {
    const assignmentMap = new Map<string, RoleAssignment>();
    
    assignments.forEach(assignment => {
      const key = `${assignment.user.id}-${assignment.role.id}`;
      assignmentMap.set(key, assignment);
    });

    setAccessMatrix({
      users,
      roles,
      permissions,
      assignments: assignmentMap
    });
  }, []);

  // Real-time Updates
  useEffect(() => {
    const handleRoleAssignmentUpdate = (data: any) => {
      if (data.resource_id === resource.id) {
        loadData();
      }
    };

    subscribe(`resource.${resource.id}.roles`, handleRoleAssignmentUpdate);
    
    return () => {
      unsubscribe(`resource.${resource.id}.roles`, handleRoleAssignmentUpdate);
    };
  }, [resource.id, subscribe, unsubscribe, loadData]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Assignment Handlers
  const handleAssignRole = useCallback(async () => {
    if (!selectedRole || selectedUsers.length === 0 || !canAssignRoles) return;

    setSaving(true);
    try {
      if (bulkMode && selectedUsers.length > 1) {
        const request: BulkAssignmentRequest = {
          userIds: selectedUsers.map(u => u.id),
          roleId: selectedRole.id,
          expiresAt: assignmentExpiry ? new Date(assignmentExpiry) : undefined,
          reason: assignmentReason || undefined
        };
        await bulkAssignResourceRoles(resource.id, request);
      } else {
        for (const user of selectedUsers) {
          const request: AssignmentRequest = {
            userId: user.id,
            roleId: selectedRole.id,
            expiresAt: assignmentExpiry ? new Date(assignmentExpiry) : undefined,
            reason: assignmentReason || undefined
          };
          await assignResourceRole(resource.id, request);
        }
      }

      setShowAssignDialog(false);
      setSelectedUsers([]);
      setSelectedRole(null);
      setAssignmentExpiry('');
      setAssignmentReason('');
      await loadData();
    } catch (err) {
      console.error('Error assigning role:', err);
    } finally {
      setSaving(false);
    }
  }, [selectedRole, selectedUsers, canAssignRoles, bulkMode, assignmentExpiry, assignmentReason, resource.id, bulkAssignResourceRoles, assignResourceRole, loadData]);

  const handleRevokeRole = useCallback(async (assignment: RoleAssignment) => {
    if (!canRevokeRoles) return;

    setSaving(true);
    try {
      await removeResourceRole(resource.id, assignment.id);
      await loadData();
    } catch (err) {
      console.error('Error revoking role:', err);
    } finally {
      setSaving(false);
    }
  }, [canRevokeRoles, resource.id, removeResourceRole, loadData]);

  const handleBulkRevoke = useCallback(async () => {
    if (selectedAssignments.size === 0 || !canRevokeRoles) return;

    setSaving(true);
    try {
      await bulkRemoveResourceRoles(resource.id, Array.from(selectedAssignments));
      setSelectedAssignments(new Set());
      await loadData();
    } catch (err) {
      console.error('Error bulk revoking roles:', err);
    } finally {
      setSaving(false);
    }
  }, [selectedAssignments, canRevokeRoles, resource.id, bulkRemoveResourceRoles, loadData]);

  const handleUpdateAssignment = useCallback(async (
    assignmentId: number,
    updates: Partial<RoleAssignment>
  ) => {
    if (!canManageRoles) return;

    setSaving(true);
    try {
      await updateResourceRoleAssignment(resource.id, assignmentId, updates);
      await loadData();
    } catch (err) {
      console.error('Error updating assignment:', err);
    } finally {
      setSaving(false);
    }
  }, [canManageRoles, resource.id, updateResourceRoleAssignment, loadData]);

  // User Selection Handlers
  const handleUserSelect = useCallback((user: UserType) => {
    if (bulkMode) {
      setSelectedUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (exists) {
          return prev.filter(u => u.id !== user.id);
        } else {
          return [...prev, user];
        }
      });
    } else {
      setSelectedUsers([user]);
    }
  }, [bulkMode]);

  const handleSelectAllAssignments = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedAssignments(new Set(filteredAssignments.map(a => a.id)));
    } else {
      setSelectedAssignments(new Set());
    }
  }, [filteredAssignments]);

  const handleSelectAssignment = useCallback((assignmentId: number, checked: boolean) => {
    setSelectedAssignments(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(assignmentId);
      } else {
        newSet.delete(assignmentId);
      }
      return newSet;
    });
  }, []);

  // Render Methods
  const renderAssignmentsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{assignmentStats.total}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{assignmentStats.active}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{assignmentStats.direct}</div>
                <div className="text-sm text-gray-500">Direct</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{assignmentStats.inherited}</div>
                <div className="text-sm text-gray-500">Inherited</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{assignmentStats.expiring}</div>
                <div className="text-sm text-gray-500">Expiring</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-64"
            />
            <Search className="h-4 w-4 text-gray-400" />
          </div>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {availableRoles.map(role => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="inherited">Inherited</SelectItem>
              <SelectItem value="group">Group</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          {selectedAssignments.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkRevoke}
              disabled={saving || !canRevokeRoles}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Revoke Selected ({selectedAssignments.size})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMatrix(!showMatrix)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showMatrix ? 'List View' : 'Matrix View'}
          </Button>

          {canAssignRoles && (
            <Button
              onClick={() => setShowAssignDialog(true)}
              disabled={saving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      {!showMatrix ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAssignments.size === filteredAssignments.length && filteredAssignments.length > 0}
                      onCheckedChange={handleSelectAllAssignments}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAssignments.has(assignment.id)}
                        onCheckedChange={(checked) => handleSelectAssignment(assignment.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {assignment.user.first_name} {assignment.user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{assignment.role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={assignment.source === 'direct' ? 'default' : 'secondary'}
                      >
                        {assignment.source}
                      </Badge>
                      {assignment.inheritedFrom && (
                        <div className="text-xs text-gray-500 mt-1">
                          from {assignment.inheritedFrom}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(assignment.assignedAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {assignment.assignedBy.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.expiresAt ? (
                        <div className="text-sm">
                          {formatDate(assignment.expiresAt)}
                        </div>
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={assignment.isActive ? 'default' : 'destructive'}
                      >
                        {assignment.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assignment.source === 'direct' && canRevokeRoles && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRevokeRole(assignment)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Revoke
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        renderAccessMatrix()
      )}
    </div>
  );

  const renderAccessMatrix = () => {
    if (!accessMatrix) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Access Matrix</CardTitle>
            <div className="flex items-center space-x-2">
              <Label>View by:</Label>
              <Select value={matrixMode} onValueChange={(value: 'users' | 'roles') => setMatrixMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="roles">Roles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">
                    {matrixMode === 'users' ? 'User' : 'Role'}
                  </TableHead>
                  {(matrixMode === 'users' ? accessMatrix.roles : accessMatrix.users).map((item) => (
                    <TableHead key={item.id} className="text-center min-w-[100px]">
                      <div className="transform -rotate-45 origin-left">
                        {matrixMode === 'users' ? item.name : `${item.first_name} ${item.last_name}`}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(matrixMode === 'users' ? accessMatrix.users : accessMatrix.roles).map((primaryItem) => (
                  <TableRow key={primaryItem.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {matrixMode === 'users' ? (
                          <>
                            <User className="h-4 w-4" />
                            <span>{primaryItem.first_name} {primaryItem.last_name}</span>
                          </>
                        ) : (
                          <>
                            <Crown className="h-4 w-4" />
                            <span>{primaryItem.name}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    {(matrixMode === 'users' ? accessMatrix.roles : accessMatrix.users).map((secondaryItem) => {
                      const key = matrixMode === 'users' 
                        ? `${primaryItem.id}-${secondaryItem.id}`
                        : `${secondaryItem.id}-${primaryItem.id}`;
                      const assignment = accessMatrix.assignments.get(key);
                      
                      return (
                        <TableCell key={secondaryItem.id} className="text-center">
                          {assignment ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge
                                    variant={assignment.isActive ? 'default' : 'secondary'}
                                    className="cursor-pointer"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm">
                                    <div>Source: {assignment.source}</div>
                                    <div>Assigned: {formatDate(assignment.assignedAt)}</div>
                                    {assignment.expiresAt && (
                                      <div>Expires: {formatDate(assignment.expiresAt)}</div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div className="h-6 w-6 mx-auto rounded border-2 border-dashed border-gray-300"></div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Effective Permissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {permissions.map((permission) => (
              <div key={permission.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{permission.name}</h4>
                  <Badge variant="outline">{permission.action}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                <div className="space-y-2">
                  {assignments
                    .filter(a => a.isActive)
                    .map(assignment => {
                      // This would check if the role has this permission
                      return (
                        <div key={assignment.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-3 w-3" />
                            <span>{assignment.user.username}</span>
                            <span className="text-gray-400">via</span>
                            <Crown className="h-3 w-3" />
                            <span>{assignment.role.name}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {assignment.source}
                          </Badge>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Role Assignment History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={auditLogs}
            columns={[
              {
                accessorKey: 'timestamp',
                header: 'Timestamp',
                cell: ({ row }) => formatDate(row.getValue('timestamp')),
              },
              {
                accessorKey: 'user.username',
                header: 'Performed By',
              },
              {
                accessorKey: 'action',
                header: 'Action',
              },
              {
                accessorKey: 'details',
                header: 'Details',
                cell: ({ row }) => {
                  const details = row.getValue('details') as any;
                  return (
                    <div className="text-sm">
                      {details.user && (
                        <div>User: {details.user}</div>
                      )}
                      {details.role && (
                        <div>Role: {details.role}</div>
                      )}
                    </div>
                  );
                },
              },
              {
                accessorKey: 'ip_address',
                header: 'IP Address',
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Role Assignments
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage role assignments for {resource.name}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-6">
          {renderAssignmentsTab()}
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          {renderPermissionsTab()}
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          {renderAuditTab()}
        </TabsContent>
      </Tabs>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Role to Users</DialogTitle>
            <DialogDescription>
              Select users and a role to assign to this resource
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bulk-mode"
                checked={bulkMode}
                onCheckedChange={setBulkMode}
              />
              <Label htmlFor="bulk-mode">Bulk assignment mode</Label>
            </div>

            <div>
              <Label className="text-sm font-medium">Select Users</Label>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedUsers.find(u => u.id === user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={!!selectedUsers.find(u => u.id === user.id)}
                        onChange={() => {}}
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Select Role</Label>
              <Select onValueChange={(value) => {
                const role = availableRoles.find(r => r.id.toString() === value);
                setSelectedRole(role || null);
              }}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Crown className="h-4 w-4" />
                        <span>{role.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Expiry Date (Optional)</Label>
              <Input
                type="datetime-local"
                value={assignmentExpiry}
                onChange={(e) => setAssignmentExpiry(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Reason (Optional)</Label>
              <Textarea
                placeholder="Reason for this assignment..."
                value={assignmentReason}
                onChange={(e) => setAssignmentReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={saving || !selectedRole || selectedUsers.length === 0}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Assign Role{selectedUsers.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ResourceRoleAssignment;