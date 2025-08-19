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
  Users,
  User,
  Crown,
  Shield,
  Building,
  Target,
  Tag,
  Calendar,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Edit,
  Trash2,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Settings,
  Eye,
  EyeOff,
  Star,
  Heart,
  Bookmark,
  Share,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Bell,
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
  GitBranch,
  History,
  Zap,
  Key,
  Lock,
  Unlock,
  ExternalLink,
  Link,
  Copy,
  Flag,
  MessageSquare,
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
import type { Permission } from '../../types/permission.types';
import type { AuditLog } from '../../types/audit.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate, formatNumber, formatDuration } from '../../utils/format.utils';

interface GroupDetailsProps {
  group: Group;
  onEdit: () => void;
  onDelete: () => void;
  onManageMembers: () => void;
  onBack: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  className?: string;
}

interface GroupAnalytics {
  memberGrowth: Array<{
    date: string;
    count: number;
    growth: number;
  }>;
  activityMetrics: {
    totalActions: number;
    activeMembers: number;
    avgSessionDuration: number;
    lastActivityDate: Date;
  };
  roleDistribution: Array<{
    role: Role;
    memberCount: number;
    percentage: number;
  }>;
  permissionUsage: Array<{
    permission: string;
    usageCount: number;
    lastUsed: Date;
  }>;
  complianceMetrics: {
    score: number;
    violations: number;
    lastAudit: Date;
    nextReview: Date;
  };
}

interface GroupHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  score: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendation?: string;
    timestamp: Date;
  }>;
  recommendations: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    action?: string;
  }>;
}

interface GroupActivity {
  id: string;
  type: 'member_added' | 'member_removed' | 'role_assigned' | 'role_revoked' | 'settings_changed' | 'policy_applied';
  user: UserType;
  target?: UserType | Role;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const GROUP_TYPE_CONFIG = {
  department: { icon: Building, color: 'bg-blue-100 text-blue-800' },
  project: { icon: Target, color: 'bg-green-100 text-green-800' },
  security: { icon: Shield, color: 'bg-red-100 text-red-800' },
  custom: { icon: Tag, color: 'bg-purple-100 text-purple-800' },
};

const ACTIVITY_ICONS = {
  member_added: UserPlus,
  member_removed: UserMinus,
  role_assigned: Crown,
  role_revoked: XCircle,
  settings_changed: Settings,
  policy_applied: Shield,
};

const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  onEdit,
  onDelete,
  onManageMembers,
  onBack,
  canEdit,
  canDelete,
  canManageMembers,
  className = ''
}) => {
  // State Management
  const [members, setMembers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [analytics, setAnalytics] = useState<GroupAnalytics | null>(null);
  const [health, setHealth] = useState<GroupHealth | null>(null);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Dialog State
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const {
    getGroupMembers,
    getGroupRoles,
    getGroupAnalytics,
    getGroupHealth,
    getGroupActivities,
    updateGroupBookmark,
    exportGroupData,
    shareGroup
  } = useGroups();
  const { checkPermission } = usePermissions();
  const { getAuditLogs } = useAuditLogs();
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Computed Properties
  const groupTypeConfig = useMemo(() => {
    return GROUP_TYPE_CONFIG[group.type as keyof typeof GROUP_TYPE_CONFIG] || GROUP_TYPE_CONFIG.custom;
  }, [group.type]);

  const memberStats = useMemo(() => {
    if (!members) return { total: 0, active: 0, pending: 0 };
    
    return {
      total: members.length,
      active: members.filter(m => m.is_active).length,
      pending: members.filter(m => !m.is_active).length,
    };
  }, [members]);

  const roleStats = useMemo(() => {
    if (!roles || !analytics) return { total: 0, mostUsed: null, distribution: [] };
    
    return {
      total: roles.length,
      mostUsed: analytics.roleDistribution[0]?.role,
      distribution: analytics.roleDistribution.slice(0, 5),
    };
  }, [roles, analytics]);

  // Data Loading
  const loadGroupData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        membersData,
        rolesData,
        analyticsData,
        healthData,
        activitiesData,
        auditData
      ] = await Promise.all([
        getGroupMembers(group.id),
        getGroupRoles(group.id),
        getGroupAnalytics(group.id),
        getGroupHealth(group.id),
        getGroupActivities(group.id),
        getAuditLogs({
          entity_type: 'group',
          entity_id: group.id,
          limit: 100
        })
      ]);

      setMembers(membersData);
      setRoles(rolesData);
      setAnalytics(analyticsData);
      setHealth(healthData);
      setActivities(activitiesData);
      setAuditLogs(auditData.items);

    } catch (err) {
      console.error('Error loading group data:', err);
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [group.id, getGroupMembers, getGroupRoles, getGroupAnalytics, getGroupHealth, getGroupActivities, getAuditLogs]);

  // Real-time Updates
  useEffect(() => {
    const handleGroupUpdate = (data: any) => {
      if (data.group_id === group.id) {
        loadGroupData();
      }
    };

    subscribe(`group.${group.id}`, handleGroupUpdate);
    
    return () => {
      unsubscribe(`group.${group.id}`, handleGroupUpdate);
    };
  }, [group.id, subscribe, unsubscribe, loadGroupData]);

  // Initial Load
  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  // Action Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadGroupData();
    } catch (err) {
      console.error('Error refreshing group data:', err);
    } finally {
      setRefreshing(false);
    }
  }, [loadGroupData]);

  const handleBookmark = useCallback(async () => {
    if (!currentUser) return;

    try {
      await updateGroupBookmark(group.id, !bookmarked);
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Error updating bookmark:', err);
    }
  }, [group.id, bookmarked, updateGroupBookmark, currentUser]);

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const data = await exportGroupData(group.id, format);
      // Trigger download
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 
              format === 'csv' ? 'text/csv' : 'application/pdf' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `group-${group.name}-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportDialog(false);
    } catch (err) {
      console.error('Error exporting group data:', err);
    }
  }, [group.id, group.name, exportGroupData]);

  // Render Methods
  const renderHeader = () => {
    const TypeIcon = groupTypeConfig.icon;
    
    return (
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mt-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-lg ${health?.status === 'healthy' ? 'bg-green-100' : health?.status === 'warning' ? 'bg-yellow-100' : health?.status === 'critical' ? 'bg-red-100' : 'bg-gray-100'}`}>
              <TypeIcon className={`h-8 w-8 ${health?.status === 'healthy' ? 'text-green-600' : health?.status === 'warning' ? 'text-yellow-600' : health?.status === 'critical' ? 'text-red-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {group.name}
                </h1>
                <Badge className={groupTypeConfig.color}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {group.type || 'Custom'}
                </Badge>
                <Badge variant={group.is_active ? 'default' : 'secondary'}>
                  {group.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                {group.description || 'No description provided'}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(group.created_at)}</span>
                </div>
                {group.updated_at && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Updated {formatDate(group.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={bookmarked ? 'text-yellow-500' : ''}
                >
                  <Star className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share group</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export data</TooltipContent>
            </Tooltip>
          </TooltipProvider>

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Group
                </DropdownMenuItem>
              )}
              {canManageMembers && (
                <DropdownMenuItem onClick={onManageMembers}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Members
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Health Status */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Group Health</span>
              <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                {health.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{health.score}%</div>
                <div className="text-sm text-gray-500">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{health.issues.length}</div>
                <div className="text-sm text-gray-500">Active Issues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{health.recommendations.length}</div>
                <div className="text-sm text-gray-500">Recommendations</div>
              </div>
            </div>
            <Progress value={health.score} className="w-full" />
            
            {health.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Current Issues</h4>
                {health.issues.slice(0, 3).map((issue, index) => (
                  <Alert key={index} variant={issue.severity === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{issue.type}</AlertTitle>
                    <AlertDescription>{issue.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{memberStats.total}</div>
                <div className="text-sm text-gray-500">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{memberStats.active}</div>
                <div className="text-sm text-gray-500">Active Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{roleStats.total}</div>
                <div className="text-sm text-gray-500">Assigned Roles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{activities.length}</div>
                <div className="text-sm text-gray-500">Recent Activities</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Members</span>
            </CardTitle>
            {canManageMembers && (
              <Button size="sm" onClick={onManageMembers}>
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.slice(0, 6).map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {member.first_name} {member.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                  <Badge variant={member.is_active ? 'default' : 'secondary'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              {members.length > 6 && (
                <div className="text-center pt-3">
                  <Button variant="outline" size="sm" onClick={onManageMembers}>
                    View All {members.length} Members
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No members in this group
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Distribution */}
      {roleStats.distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>Role Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleStats.distribution.map((item) => (
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
                      {item.memberCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalytics = () => {
    if (!analytics) return <div>No analytics data available</div>;

    return (
      <div className="space-y-6">
        {/* Activity Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Activity Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(analytics.activityMetrics.totalActions)}
                </div>
                <div className="text-sm text-gray-500">Total Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.activityMetrics.activeMembers}
                </div>
                <div className="text-sm text-gray-500">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatDuration(analytics.activityMetrics.avgSessionDuration)}
                </div>
                <div className="text-sm text-gray-500">Avg Session</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatDate(analytics.activityMetrics.lastActivityDate)}
                </div>
                <div className="text-sm text-gray-500">Last Activity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
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

        {/* Permission Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Permission Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.permissionUsage.slice(0, 10).map((perm, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{perm.permission}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{perm.usageCount} uses</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(perm.lastUsed)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderActivity = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const ActivityIcon = ACTIVITY_ICONS[activity.type] || Activity;
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="p-2 rounded-full bg-blue-100">
                      <ActivityIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        by {activity.user.first_name} {activity.user.last_name} • {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Audit Logs</span>
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
                header: 'User',
              },
              {
                accessorKey: 'action',
                header: 'Action',
              },
              {
                accessorKey: 'details',
                header: 'Details',
                cell: ({ row }) => (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {JSON.stringify(row.getValue('details')).substring(0, 50)}...
                  </span>
                ),
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
      {renderHeader()}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {renderAnalytics()}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          {renderActivity()}
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          {renderAudit()}
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Group</DialogTitle>
            <DialogDescription>
              Share this group information with other users or generate a shareable link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Share with users</Label>
              <Input placeholder="Enter email addresses..." />
            </div>
            <div>
              <Label>Access level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="manage">Manage members</SelectItem>
                  <SelectItem value="admin">Full admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Group Data</DialogTitle>
            <DialogDescription>
              Choose the format to export group information and analytics.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExport('csv')}
            >
              <FileText className="h-6 w-6 mb-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExport('json')}
            >
              <Code className="h-6 w-6 mb-2" />
              JSON
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-6 w-6 mb-2" />
              PDF
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default GroupDetails;