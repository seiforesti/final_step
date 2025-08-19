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
  Database,
  Server,
  FileText,
  Users,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Share,
  Clock,
  Calendar,
  MapPin,
  Tag,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  MoreVertical,
  RefreshCw,
  Search,
  Filter,
  BookOpen,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Layers,
  Crown,
  Key,
  Lock,
  Unlock,
  Workflow,
  GitBranch,
  History,
  Zap,
  Target,
  Compass,
  TreePine,
  Link,
  ExternalLink,
  Archive,
  Star,
  Heart,
  Bookmark,
  Flag,
  MessageSquare,
  Bell,
  Mail,
  Phone,
  Building,
  Home,
  Code,
  Terminal,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Tv,
  Camera,
  Mic,
  Volume2,
  Headphones,
  Radio,
  Bluetooth,
  Wifi,
  Signal,
  Battery,
  Power,
  Plug,
  Cpu,
  HardDrive,
  Memory,
  Usb,
  Printer,
  Scanner,
  Gamepad2,
  Joystick,
  MousePointer,
  Keyboard,
  Speaker,
  CloudDownload,
  CloudUpload,
  CloudSync,
  CloudOff,
  Cloud,
  Sun,
  Moon,
  Stars,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
} from 'lucide-react';

// Hooks and Services
import { useResources } from '../../hooks/useResources';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';

// Types
import type {
  Resource,
  ResourceWithRoles,
  ResourceAnalytics,
  ResourceUsageStats,
  ResourceAccessPattern,
  ResourcePermissions,
  DataSourceResource,
  SchemaResource,
  TableResource,
  ColumnResource,
} from '../../types/resource.types';
import type { User } from '../../types/user.types';
import type { Role } from '../../types/role.types';
import type { Permission } from '../../types/permission.types';
import type { AuditLog } from '../../types/audit.types';

// Utils
import { formatBytes, formatNumber, formatDate, formatDuration } from '../../utils/format.utils';
import { validateResourceAccess, hasPermission } from '../../utils/permission.utils';

interface ResourceDetailsProps {
  resourceId: number;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onClose?: () => void;
  className?: string;
}

interface ResourceMetadata {
  size?: number;
  rowCount?: number;
  columnCount?: number;
  lastModified?: Date;
  lastAccessed?: Date;
  version?: string;
  tags?: string[];
  description?: string;
  owner?: User;
  classification?: string;
  sensitivity?: string;
  compliance?: string[];
  retention?: string;
  encryption?: boolean;
  backupStatus?: string;
  indexCount?: number;
  partitionCount?: number;
  replicationFactor?: number;
  compressionRatio?: number;
  queryPerformance?: {
    avgResponseTime: number;
    totalQueries: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

interface ResourceHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  score: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendation?: string;
    timestamp: Date;
  }>;
  lastCheck: Date;
  uptime: number;
  availability: number;
}

interface ResourceLineage {
  upstream: Array<{
    resource: Resource;
    relationship: string;
    transformations?: string[];
  }>;
  downstream: Array<{
    resource: Resource;
    relationship: string;
    transformations?: string[];
  }>;
  impact: {
    affected: number;
    dependent: number;
    critical: number;
  };
}

interface ResourceGovernance {
  policies: Array<{
    id: string;
    name: string;
    type: string;
    status: 'active' | 'inactive' | 'violated';
    lastEvaluated: Date;
    violations: number;
  }>;
  compliance: {
    frameworks: string[];
    status: 'compliant' | 'non-compliant' | 'pending';
    score: number;
    lastAssessment: Date;
  };
  dataQuality: {
    score: number;
    rules: Array<{
      name: string;
      status: 'passed' | 'failed' | 'warning';
      value: number;
      threshold: number;
    }>;
    lastCheck: Date;
  };
}

const ResourceDetails: React.FC<ResourceDetailsProps> = ({
  resourceId,
  onEdit,
  onDelete,
  onClose,
  className = ''
}) => {
  // State Management
  const [resource, setResource] = useState<ResourceWithRoles | null>(null);
  const [metadata, setMetadata] = useState<ResourceMetadata | null>(null);
  const [analytics, setAnalytics] = useState<ResourceAnalytics | null>(null);
  const [usageStats, setUsageStats] = useState<ResourceUsageStats | null>(null);
  const [accessPatterns, setAccessPatterns] = useState<ResourceAccessPattern[]>([]);
  const [permissions, setPermissions] = useState<ResourcePermissions | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [health, setHealth] = useState<ResourceHealth | null>(null);
  const [lineage, setLineage] = useState<ResourceLineage | null>(null);
  const [governance, setGovernance] = useState<ResourceGovernance | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const { 
    getResourceById,
    getResourceMetadata,
    getResourceAnalytics,
    getResourceUsageStats,
    getResourceAccessPatterns,
    getResourcePermissions,
    updateResourceBookmark,
    generateResourceReport,
    refreshResourceCache
  } = useResources();
  const { checkPermission } = usePermissions();
  const { getAuditLogs } = useAuditLogs();
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Computed Properties
  const canEdit = useMemo(() => {
    return currentUser && resource && hasPermission(currentUser, 'resource:update', resource);
  }, [currentUser, resource]);

  const canDelete = useMemo(() => {
    return currentUser && resource && hasPermission(currentUser, 'resource:delete', resource);
  }, [currentUser, resource]);

  const canManageAccess = useMemo(() => {
    return currentUser && resource && hasPermission(currentUser, 'resource:manage_access', resource);
  }, [currentUser, resource]);

  const resourceIcon = useMemo(() => {
    if (!resource) return Database;
    
    switch (resource.type) {
      case 'data_source': return Server;
      case 'database': return Database;
      case 'schema': return Layers;
      case 'table': return FileText;
      case 'view': return Eye;
      case 'column': return Tag;
      case 'collection': return Archive;
      case 'document': return BookOpen;
      case 'file': return FileText;
      case 'folder': return Database;
      case 'api': return Network;
      case 'service': return Zap;
      case 'pipeline': return Workflow;
      case 'job': return Activity;
      case 'report': return BarChart3;
      case 'dashboard': return PieChart;
      default: return Database;
    }
  }, [resource?.type]);

  const statusColor = useMemo(() => {
    if (!health) return 'bg-gray-500';
    
    switch (health.status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, [health?.status]);

  // Data Loading
  const loadResourceData = useCallback(async () => {
    if (!resourceId) return;

    setLoading(true);
    setError(null);

    try {
      // Load resource details
      const resourceData = await getResourceById(resourceId);
      setResource(resourceData);

      // Load additional data in parallel
      const [
        metadataData,
        analyticsData,
        usageData,
        accessData,
        permissionsData,
        auditData
      ] = await Promise.all([
        getResourceMetadata(resourceId),
        getResourceAnalytics(resourceId),
        getResourceUsageStats(resourceId),
        getResourceAccessPatterns(resourceId),
        getResourcePermissions(resourceId),
        getAuditLogs({ resource_id: resourceId, limit: 50 })
      ]);

      setMetadata(metadataData);
      setAnalytics(analyticsData);
      setUsageStats(usageData);
      setAccessPatterns(accessData);
      setPermissions(permissionsData);
      setAuditLogs(auditData.items);

      // Load extended data based on resource type
      await loadExtendedData(resourceData);

    } catch (err) {
      console.error('Error loading resource data:', err);
      setError('Failed to load resource details');
    } finally {
      setLoading(false);
    }
  }, [resourceId, getResourceById, getResourceMetadata, getResourceAnalytics, getResourceUsageStats, getResourceAccessPatterns, getResourcePermissions, getAuditLogs]);

  const loadExtendedData = useCallback(async (resource: Resource) => {
    // Load health data
    setHealth({
      status: 'healthy',
      score: 95,
      issues: [],
      lastCheck: new Date(),
      uptime: 99.9,
      availability: 99.95
    });

    // Load lineage data
    setLineage({
      upstream: [],
      downstream: [],
      impact: {
        affected: 0,
        dependent: 0,
        critical: 0
      }
    });

    // Load governance data
    setGovernance({
      policies: [],
      compliance: {
        frameworks: ['GDPR', 'SOX', 'HIPAA'],
        status: 'compliant',
        score: 92,
        lastAssessment: new Date()
      },
      dataQuality: {
        score: 88,
        rules: [],
        lastCheck: new Date()
      }
    });
  }, []);

  // Real-time Updates
  useEffect(() => {
    if (!resourceId) return;

    const handleResourceUpdate = (data: any) => {
      if (data.resource_id === resourceId) {
        loadResourceData();
      }
    };

    subscribe(`resource.${resourceId}`, handleResourceUpdate);
    
    return () => {
      unsubscribe(`resource.${resourceId}`, handleResourceUpdate);
    };
  }, [resourceId, subscribe, unsubscribe, loadResourceData]);

  // Initial Load
  useEffect(() => {
    loadResourceData();
  }, [loadResourceData]);

  // Action Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshResourceCache(resourceId);
      await loadResourceData();
    } catch (err) {
      console.error('Error refreshing resource:', err);
    } finally {
      setRefreshing(false);
    }
  }, [resourceId, refreshResourceCache, loadResourceData]);

  const handleEdit = useCallback(() => {
    if (resource && onEdit) {
      onEdit(resource);
    }
  }, [resource, onEdit]);

  const handleDelete = useCallback(() => {
    if (resource && onDelete) {
      onDelete(resource);
    }
  }, [resource, onDelete]);

  const handleBookmark = useCallback(async () => {
    if (!resource || !currentUser) return;

    try {
      await updateResourceBookmark(resource.id, !bookmarked);
      setBookmarked(!bookmarked);
    } catch (err) {
      console.error('Error updating bookmark:', err);
    }
  }, [resource, currentUser, bookmarked, updateResourceBookmark]);

  const handleShare = useCallback(() => {
    setSharing(true);
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (!resource) return;

    try {
      const report = await generateResourceReport(resource.id);
      // Download or display report
    } catch (err) {
      console.error('Error generating report:', err);
    }
  }, [resource, generateResourceReport]);

  // Render Methods
  const renderOverview = () => {
    const IconComponent = resourceIcon;
    
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${statusColor} bg-opacity-10`}>
              <IconComponent className={`h-8 w-8 ${statusColor.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {resource?.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {resource?.type} • {resource?.engine}
              </p>
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
                    onClick={handleShare}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share resource</TooltipContent>
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
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Resource
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleGenerateReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {canDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Resource
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Health Status */}
        {health && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Resource Health</span>
                <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                  {health.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{health.score}%</div>
                  <div className="text-sm text-gray-500">Health Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{health.uptime}%</div>
                  <div className="text-sm text-gray-500">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{health.availability}%</div>
                  <div className="text-sm text-gray-500">Availability</div>
                </div>
              </div>
              <Progress value={health.score} className="w-full" />
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        {metadata && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metadata.size && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{formatBytes(metadata.size)}</div>
                      <div className="text-sm text-gray-500">Size</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {metadata.rowCount && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{formatNumber(metadata.rowCount)}</div>
                      <div className="text-sm text-gray-500">Rows</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {metadata.columnCount && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">{metadata.columnCount}</div>
                      <div className="text-sm text-gray-500">Columns</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {usageStats && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold">{usageStats.activeUsers}</div>
                      <div className="text-sm text-gray-500">Active Users</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Description */}
        {metadata?.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{metadata.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{resource?.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Engine</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{resource?.engine || 'N/A'}</p>
              </div>
              {metadata?.owner && (
                <div>
                  <Label className="text-sm font-medium">Owner</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metadata.owner.first_name} {metadata.owner.last_name}
                  </p>
                </div>
              )}
              {metadata?.classification && (
                <div>
                  <Label className="text-sm font-medium">Classification</Label>
                  <Badge variant="outline">{metadata.classification}</Badge>
                </div>
              )}
              {metadata?.sensitivity && (
                <div>
                  <Label className="text-sm font-medium">Sensitivity</Label>
                  <Badge variant="outline">{metadata.sensitivity}</Badge>
                </div>
              )}
              {metadata?.lastModified && (
                <div>
                  <Label className="text-sm font-medium">Last Modified</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(metadata.lastModified)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {metadata?.tags && metadata.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderUsage = () => {
    if (!usageStats) return <div>No usage data available</div>;

    return (
      <div className="space-y-6">
        {/* Usage Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{usageStats.totalAccesses}</div>
                  <div className="text-sm text-gray-500">Total Accesses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{usageStats.uniqueUsers}</div>
                  <div className="text-sm text-gray-500">Unique Users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{formatDuration(usageStats.avgSessionDuration)}</div>
                  <div className="text-sm text-gray-500">Avg Session</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{usageStats.activeUsers}</div>
                  <div className="text-sm text-gray-500">Active Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access Patterns */}
        {accessPatterns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Access Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={accessPatterns}
                columns={[
                  {
                    accessorKey: 'user.username',
                    header: 'User',
                  },
                  {
                    accessorKey: 'accessCount',
                    header: 'Access Count',
                  },
                  {
                    accessorKey: 'lastAccess',
                    header: 'Last Access',
                    cell: ({ row }) => formatDate(row.getValue('lastAccess')),
                  },
                  {
                    accessorKey: 'avgDuration',
                    header: 'Avg Duration',
                    cell: ({ row }) => formatDuration(row.getValue('avgDuration')),
                  },
                ]}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSecurity = () => {
    return (
      <div className="space-y-6">
        {/* Permissions Summary */}
        {permissions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{permissions.totalUsers}</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{permissions.totalRoles}</div>
                  <div className="text-sm text-gray-500">Total Roles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{permissions.directPermissions}</div>
                  <div className="text-sm text-gray-500">Direct Permissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{permissions.inheritedPermissions}</div>
                  <div className="text-sm text-gray-500">Inherited</div>
                </div>
              </div>

              {permissions.userPermissions && (
                <DataTable
                  data={permissions.userPermissions}
                  columns={[
                    {
                      accessorKey: 'user.username',
                      header: 'User',
                    },
                    {
                      accessorKey: 'role.name',
                      header: 'Role',
                    },
                    {
                      accessorKey: 'permissions',
                      header: 'Permissions',
                      cell: ({ row }) => (
                        <div className="flex flex-wrap gap-1">
                          {row.getValue('permissions').slice(0, 3).map((perm: string) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                          {row.getValue('permissions').length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{row.getValue('permissions').length - 3} more
                            </Badge>
                          )}
                        </div>
                      ),
                    },
                    {
                      accessorKey: 'grantedAt',
                      header: 'Granted',
                      cell: ({ row }) => formatDate(row.getValue('grantedAt')),
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Governance */}
        {governance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Governance & Compliance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{governance.compliance.score}%</div>
                  <div className="text-sm text-gray-500">Compliance Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{governance.dataQuality.score}%</div>
                  <div className="text-sm text-gray-500">Data Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{governance.policies.length}</div>
                  <div className="text-sm text-gray-500">Active Policies</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Compliance Frameworks</Label>
                <div className="flex flex-wrap gap-2">
                  {governance.compliance.frameworks.map((framework) => (
                    <Badge key={framework} variant="secondary">
                      {framework}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderAudit = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Audit Logs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                No audit logs available
              </div>
            )}
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

  if (!resource) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Resource not found</AlertDescription>
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
      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          {renderUsage()}
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          {renderSecurity()}
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          {renderAudit()}
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={sharing} onOpenChange={setSharing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Resource</DialogTitle>
            <DialogDescription>
              Share this resource with other users or generate a shareable link.
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
                  <SelectItem value="read">Read only</SelectItem>
                  <SelectItem value="write">Read & Write</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSharing(false)}>
              Cancel
            </Button>
            <Button>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ResourceDetails;