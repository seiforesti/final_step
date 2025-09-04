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
  Code,
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
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Zap,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  Database,
  Network,
  Users,
  User,
  Shield,
  Lock,
  Key,
  Globe,
  MapPin,
  Calendar,
  Loader2,
  Save,
  Share,
  Star,
  Heart,
  Bookmark,
  Tag,
  Bell,
  Mail,
  Phone,
  Home,
  Building,
  Crown,
  Archive,
  BookOpen,
  Terminal,
  Monitor,
  Cpu,
  HelpCircle,
  ArrowLeft,
  GitBranch,
  Layers,
  Workflow,
} from 'lucide-react';

// Sub-components
import { ConditionBuilder } from './ConditionBuilder';
import { ConditionTemplates } from './ConditionTemplates';
import { ConditionValidator } from './ConditionValidator';

// Hooks and Services
import { useConditions } from '../../hooks/useConditions';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissions } from '../../hooks/usePermissions';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';

// Types
import type { 
  Condition,
  ConditionTemplate,
  ConditionValidationResult,
  ConditionStats,
  ConditionFilter
} from '../../types/condition.types';

// Utils
import { hasPermission } from '../../utils/permission.utils';
import { formatDate, formatDuration } from '../../utils/format.utils';

interface ConditionManagementProps {
  className?: string;
}

interface ConditionWithDetails extends Condition {
  template?: ConditionTemplate;
  validation?: ConditionValidationResult;
  usage_count?: number;
  last_tested?: string;
  performance_score?: number;
  security_score?: number;
}

const CONDITION_TYPES = [
  { value: 'time', label: 'Time-based', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'location', label: 'Location-based', icon: MapPin, color: 'bg-green-100 text-green-800' },
  { value: 'attribute', label: 'Attribute-based', icon: Tag, color: 'bg-purple-100 text-purple-800' },
  { value: 'role', label: 'Role-based', icon: Crown, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resource', label: 'Resource-based', icon: Database, color: 'bg-red-100 text-red-800' },
  { value: 'network', label: 'Network-based', icon: Network, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'custom', label: 'Custom', icon: Settings, color: 'bg-gray-100 text-gray-800' },
];

const CONDITION_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'deprecated', label: 'Deprecated', color: 'bg-red-100 text-red-800' },
];

const DEFAULT_FILTERS: ConditionFilter = {
  search: '',
  type: 'all',
  status: 'all',
  complexity: 'all',
  performance: 'all',
  tags: [],
  dateRange: {
    start: null,
    end: null
  }
};

export const ConditionManagement: React.FC<ConditionManagementProps> = ({
  className = ''
}) => {
  // State Management
  const [conditions, setConditions] = useState<ConditionWithDetails[]>([]);
  const [templates, setTemplates] = useState<ConditionTemplate[]>([]);
  const [selectedCondition, setSelectedCondition] = useState<ConditionWithDetails | null>(null);
  const [conditionStats, setConditionStats] = useState<ConditionStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'builder' | 'templates' | 'validator'>('list');
  const [activeTab, setActiveTab] = useState('conditions');
  
  // Filters and Search
  const [filters, setFilters] = useState<ConditionFilter>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<string>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Dialog State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Builder State
  const [builderCondition, setBuilderCondition] = useState<Condition | null>(null);
  const [validatorExpression, setValidatorExpression] = useState<string>('');

  // Hooks
  const { user: currentUser } = useCurrentUser();
  const { 
    getConditions, 
    getConditionTemplates,
    getConditionStats,
    createCondition,
    updateCondition,
    deleteCondition,
    exportConditions,
    importConditions,
    validateCondition
  } = useConditions();
  const { checkPermission } = usePermissions();
  const { subscribe, unsubscribe } = useRBACWebSocket();

  // Computed Properties
  const canManageConditions = currentUser && hasPermission(currentUser, 'condition:manage');
  const canCreateConditions = currentUser && hasPermission(currentUser, 'condition:create');
  const canDeleteConditions = currentUser && hasPermission(currentUser, 'condition:delete');

  // Filtered and Sorted Conditions
  const filteredConditions = useMemo(() => {
    let filtered = conditions;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(condition =>
        condition.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        condition.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        condition.expression.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(condition => condition.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(condition => condition.status === filters.status);
    }

    // Complexity filter
    if (filters.complexity !== 'all') {
      const complexity = parseInt(filters.complexity);
      filtered = filtered.filter(condition => 
        Math.floor((condition.metadata?.complexity || 0) / 2) === Math.floor(complexity / 2)
      );
    }

    // Performance filter
    if (filters.performance !== 'all') {
      const performance = parseInt(filters.performance);
      filtered = filtered.filter(condition => 
        (condition.performance_score || 0) >= performance
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(condition =>
        filters.tags.some(tag => condition.metadata?.tags?.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(condition => {
        const date = new Date(condition.updated_at || condition.created_at);
        const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'complexity':
          aValue = a.metadata?.complexity || 0;
          bValue = b.metadata?.complexity || 0;
          break;
        case 'performance':
          aValue = a.performance_score || 0;
          bValue = b.performance_score || 0;
          break;
        case 'usage':
          aValue = a.usage_count || 0;
          bValue = b.usage_count || 0;
          break;
        case 'updated_at':
        default:
          aValue = a.updated_at || a.created_at;
          bValue = b.updated_at || b.created_at;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [conditions, filters, sortBy, sortOrder]);

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [conditionsData, templatesData, statsData] = await Promise.all([
        getConditions(),
        getConditionTemplates(),
        getConditionStats()
      ]);

      setConditions(conditionsData.items);
      setTemplates(templatesData.items);
      setConditionStats(statsData);
    } catch (err) {
      console.error('Error loading conditions:', err);
      setError('Failed to load conditions data');
    } finally {
      setLoading(false);
    }
  }, [getConditions, getConditionTemplates, getConditionStats]);

  // Real-time Updates
  useEffect(() => {
    const handleConditionUpdate = (data: any) => {
      if (data.type === 'condition_updated') {
        loadData();
      }
    };

    subscribe('conditions', handleConditionUpdate);

    return () => {
      unsubscribe('conditions', handleConditionUpdate);
    };
  }, [subscribe, unsubscribe, loadData]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Event Handlers
  const handleCreateCondition = useCallback(async (conditionData: Partial<Condition>) => {
    if (!canCreateConditions) return;

    try {
      const newCondition = await createCondition(conditionData);
      setConditions(prev => [newCondition, ...prev]);
      setActiveView('list');
    } catch (err) {
      console.error('Error creating condition:', err);
      setError('Failed to create condition');
    }
  }, [canCreateConditions, createCondition]);

  const handleUpdateCondition = useCallback(async (id: string, conditionData: Partial<Condition>) => {
    if (!canManageConditions) return;

    try {
      const updatedCondition = await updateCondition(id, conditionData);
      setConditions(prev => prev.map(c => c.id === id ? updatedCondition : c));
      setActiveView('list');
    } catch (err) {
      console.error('Error updating condition:', err);
      setError('Failed to update condition');
    }
  }, [canManageConditions, updateCondition]);

  const handleDeleteCondition = useCallback(async (condition: ConditionWithDetails) => {
    if (!canDeleteConditions) return;

    try {
      await deleteCondition(condition.id);
      setConditions(prev => prev.filter(c => c.id !== condition.id));
      setShowDeleteConfirm(false);
      setSelectedCondition(null);
    } catch (err) {
      console.error('Error deleting condition:', err);
      setError('Failed to delete condition');
    }
  }, [canDeleteConditions, deleteCondition]);

  const handleDuplicateCondition = useCallback(async (condition: ConditionWithDetails) => {
    if (!canCreateConditions) return;

    try {
      const duplicateData = {
        ...condition,
        name: `${condition.name} (Copy)`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
      
      await handleCreateCondition(duplicateData);
    } catch (err) {
      console.error('Error duplicating condition:', err);
    }
  }, [canCreateConditions, handleCreateCondition]);

  const handleValidateCondition = useCallback(async (condition: ConditionWithDetails) => {
    try {
      const result = await validateCondition({
        expression: condition.expression,
        type: condition.type,
        metadata: condition.metadata
      });

      setConditions(prev => prev.map(c => 
        c.id === condition.id ? { ...c, validation: result } : c
      ));
    } catch (err) {
      console.error('Error validating condition:', err);
    }
  }, [validateCondition]);

  const handleExportConditions = useCallback(async (format: 'json' | 'csv' | 'yaml') => {
    try {
      const data = await exportConditions({
        conditions: filteredConditions.map(c => c.id),
        format,
        includeTemplates: true
      });

      // Trigger download
      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' :
              format === 'csv' ? 'text/csv' : 'text/yaml'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conditions-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportDialog(false);
    } catch (err) {
      console.error('Error exporting conditions:', err);
      setError('Failed to export conditions');
    }
  }, [filteredConditions, exportConditions]);

  const handleImportConditions = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await importConditions(formData);
      
      setConditions(prev => [...result.conditions, ...prev]);
      setTemplates(prev => [...result.templates, ...prev]);
      setShowImportDialog(false);
    } catch (err) {
      console.error('Error importing conditions:', err);
      setError('Failed to import conditions');
    }
  }, [importConditions]);

  // Render Methods
  const renderHeader = () => (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Condition Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create, manage, and validate ABAC conditions for access control policies
        </p>
        {conditionStats && (
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
            <span>{conditionStats.total} total conditions</span>
            <span>{conditionStats.active} active</span>
            <span>{conditionStats.templates} templates</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {canCreateConditions && activeView === 'list' && (
          <>
            <Button
              variant="outline"
              onClick={() => setActiveView('templates')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
            
            <Button onClick={() => setActiveView('builder')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Condition
            </Button>
          </>
        )}
        
        {activeView !== 'list' && (
          <Button
            variant="outline"
            onClick={() => setActiveView('list')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        )}
      </div>
    </div>
  );

  const renderStatsCards = () => {
    if (!conditionStats) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{conditionStats.total}</div>
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
                <div className="text-2xl font-bold">{conditionStats.active}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{conditionStats.templates}</div>
                <div className="text-sm text-gray-500">Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{conditionStats.usage_count}</div>
                <div className="text-sm text-gray-500">Executions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{conditionStats.avg_performance?.toFixed(1)}ms</div>
                <div className="text-sm text-gray-500">Avg Performance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFilters = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conditions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CONDITION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {CONDITION_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={sortBy} 
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at">Updated</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="complexity">Complexity</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
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

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {filteredConditions.length} of {conditions.length} conditions
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportDialog(true)}
                disabled={filteredConditions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('validator')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Validator
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderConditionsTable = () => {
    const columns = [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }: any) => {
          const condition = row.original;
          const typeConfig = CONDITION_TYPES.find(t => t.value === condition.type);
          const TypeIcon = typeConfig?.icon || Settings;
          
          return (
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${typeConfig?.color || 'bg-gray-100'}`}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">{condition.name}</div>
                <div className="text-sm text-gray-500 max-w-md truncate">
                  {condition.description}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }: any) => {
          const typeConfig = CONDITION_TYPES.find(t => t.value === row.getValue('type'));
          return (
            <Badge className={typeConfig?.color}>
              {typeConfig?.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: any) => {
          const statusConfig = CONDITION_STATUSES.find(s => s.value === row.getValue('status'));
          return (
            <Badge className={statusConfig?.color}>
              {statusConfig?.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'complexity',
        header: 'Complexity',
        cell: ({ row }: any) => {
          const complexity = row.original.metadata?.complexity || 0;
          const level = complexity <= 2 ? 'Low' : complexity <= 4 ? 'Medium' : complexity <= 6 ? 'High' : 'Very High';
          const color = complexity <= 2 ? 'bg-green-100 text-green-800' : 
                      complexity <= 4 ? 'bg-yellow-100 text-yellow-800' : 
                      complexity <= 6 ? 'bg-orange-100 text-orange-800' : 
                      'bg-red-100 text-red-800';
          
          return <Badge className={color}>{level}</Badge>;
        },
      },
      {
        accessorKey: 'usage_count',
        header: 'Usage',
        cell: ({ row }: any) => (
          <div className="text-sm">
            {row.getValue('usage_count') || 0} executions
          </div>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated',
        cell: ({ row }: any) => (
          <div className="text-sm text-gray-500">
            {formatDate(row.getValue('updated_at'))}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: any) => {
          const condition = row.original;
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => {
                    setValidatorExpression(condition.expression);
                    setActiveView('validator');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate
                </DropdownMenuItem>
                
                {canManageConditions && (
                  <DropdownMenuItem 
                    onClick={() => {
                      setBuilderCondition(condition);
                      setActiveView('builder');
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => handleDuplicateCondition(condition)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {canDeleteConditions && (
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedCondition(condition);
                      setShowDeleteConfirm(true);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];

    return (
      <Card>
        <CardContent className="p-0">
          <DataTable 
            data={filteredConditions} 
            columns={columns}
            searchable={false}
          />
        </CardContent>
      </Card>
    );
  };

  const renderConditionsList = () => (
    <div className="space-y-6">
      {renderStatsCards()}
      {renderFilters()}
      
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading conditions...</p>
          </CardContent>
        </Card>
      ) : filteredConditions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No conditions found
            </h3>
            <p className="text-gray-600 mb-4">
              {conditions.length === 0 
                ? "Get started by creating your first condition or using a template."
                : "Try adjusting your search criteria or filters."
              }
            </p>
            {canCreateConditions && (
              <div className="flex items-center justify-center space-x-3">
                <Button onClick={() => setActiveView('builder')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Condition
                </Button>
                <Button variant="outline" onClick={() => setActiveView('templates')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Templates
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        renderConditionsTable()
      )}
    </div>
  );

  const renderBuilder = () => (
    <ConditionBuilder
      condition={builderCondition}
      templates={templates}
      onSave={builderCondition ? 
        (data) => handleUpdateCondition(builderCondition.id, data) :
        handleCreateCondition
      }
      onCancel={() => {
        setActiveView('list');
        setBuilderCondition(null);
      }}
    />
  );

  const renderTemplates = () => (
    <ConditionTemplates
      templates={templates}
      onUseTemplate={(template) => {
        setBuilderCondition({
          id: '',
          name: template.name,
          description: template.description,
          type: template.type,
          expression: template.expression,
          status: 'draft',
          metadata: template.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setActiveView('builder');
      }}
      onEditTemplate={(template) => {
        // Convert template to condition for editing
        setBuilderCondition({
          id: template.id,
          name: template.name,
          description: template.description,
          type: template.type,
          expression: template.expression,
          status: 'draft',
          metadata: template.metadata,
          created_at: template.created_at,
          updated_at: template.updated_at || template.created_at
        });
        setActiveView('builder');
      }}
    />
  );

  const renderValidator = () => (
    <ConditionValidator
      expression={validatorExpression}
      onValidationComplete={(result) => {
        console.log('Validation completed:', result);
      }}
    />
  );

  if (!canManageConditions) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don't have permission to manage conditions.
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
        {activeView === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {renderConditionsList()}
          </motion.div>
        )}

        {activeView === 'builder' && (
          <motion.div
            key="builder"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderBuilder()}
          </motion.div>
        )}

        {activeView === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTemplates()}
          </motion.div>
        )}

        {activeView === 'validator' && (
          <motion.div
            key="validator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderValidator()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Condition</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCondition?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedCondition && handleDeleteCondition(selectedCondition)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Conditions</DialogTitle>
            <DialogDescription>
              Choose the format to export your conditions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExportConditions('json')}
            >
              <FileText className="h-6 w-6 mb-2" />
              JSON
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExportConditions('csv')}
            >
              <FileText className="h-6 w-6 mb-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
              onClick={() => handleExportConditions('yaml')}
            >
              <FileText className="h-6 w-6 mb-2" />
              YAML
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

