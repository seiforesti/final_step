'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

// Icons
import {
  Activity,
  Clock,
  Filter,
  Search,
  Download,
  Upload,
  FileText,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MinusCircle,
  Play,
  Pause,
  Stop,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Calendar as CalendarIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Database,
  Server,
  Globe,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  Settings,
  Bell,
  AlertCircle,
  Info,
  ExternalLink,
  Copy,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Map,
  Target,
  Layers,
  Grid,
  List,
  Hash,
  Tag,
  Bookmark,
  BookmarkCheck,
  Star,
  StarOff,
  Flag,
  FlagOff,
  Archive,
  ArchiveRestore,
  Trash2,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack,
  Timer,
  Stopwatch,
  History,
  MonitorSpeaker,
  Headphones,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
} from 'lucide-react';

// Racine Hooks
import { useActivityTracking } from '@/components/racine-main-manager/hooks/useActivityTracking';
import { useWorkspaceManagement } from '@/components/racine-main-manager/hooks/useWorkspaceManagement';
import { useUserManagement } from '@/components/racine-main-manager/hooks/useUserManagement';
import { useAIAssistant } from '@/components/racine-main-manager/hooks/useAIAssistant';
import { useCrossGroupIntegration } from '@/components/racine-main-manager/hooks/useCrossGroupIntegration';

// SPA Integration Hooks (wired to Racine orchestrator hooks)
import { useDataSources } from '@/components/racine-main-manager/hooks/useDataSources';
import { useScanRuleSets } from '@/components/racine-main-manager/hooks/useScanRuleSets';
import { useClassifications } from '@/components/racine-main-manager/hooks/useClassifications';
import { useComplianceRules as useComplianceRule } from '@/components/racine-main-manager/hooks/useComplianceRules';
import { useAdvancedCatalog } from '@/components/racine-main-manager/hooks/useAdvancedCatalog';
import { useScanLogic } from '@/components/racine-main-manager/hooks/useScanLogic';
import { useRBACSystem } from '@/components/racine-main-manager/hooks/useRBACSystem';

// Types
interface ActivityEvent {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    department?: string;
  };
  action: ActivityAction;
  resource: ActivityResource;
  context: ActivityContext;
  metadata: ActivityMetadata;
  impact: ActivityImpact;
  compliance: ActivityCompliance;
  correlatedEvents?: string[];
  tags: string[];
  status: 'completed' | 'in_progress' | 'failed' | 'cancelled' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'data_access' | 'configuration' | 'security' | 'compliance' | 'workflow' | 'system' | 'collaboration';
  duration?: number;
  location?: {
    ip: string;
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  device?: {
    type: 'desktop' | 'mobile' | 'tablet' | 'api' | 'system';
    os: string;
    browser?: string;
    userAgent: string;
  };
}

interface ActivityAction {
  type: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'reject' | 'assign' | 'unassign' | 'login' | 'logout' | 'export' | 'import' | 'backup' | 'restore';
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'UI' | 'API' | 'SYSTEM' | 'BULK';
  endpoint?: string;
  parameters?: Record<string, any>;
  payload?: any;
  response?: {
    status: number;
    message: string;
    data?: any;
  };
  automation?: {
    triggeredBy: 'user' | 'system' | 'schedule' | 'workflow' | 'ai';
    automationId?: string;
    parentAction?: string;
  };
}

interface ActivityResource {
  type: 'data_source' | 'scan_rule' | 'classification' | 'compliance_rule' | 'catalog_asset' | 'scan_job' | 'user' | 'role' | 'permission' | 'workspace' | 'workflow' | 'pipeline' | 'dashboard' | 'report';
  id: string;
  name: string;
  path?: string;
  version?: string;
  spa: 'data-sources' | 'scan-rule-sets' | 'classifications' | 'compliance-rule' | 'advanced-catalog' | 'scan-logic' | 'rbac-system' | 'racine-features';
  parentResource?: {
    type: string;
    id: string;
    name: string;
  };
  childResources?: Array<{
    type: string;
    id: string;
    name: string;
  }>;
  attributes?: Record<string, any>;
  sensitivity?: 'public' | 'internal' | 'confidential' | 'restricted';
  classification?: string[];
  owner?: string;
  steward?: string;
}

interface ActivityContext {
  workspace?: {
    id: string;
    name: string;
    environment: 'development' | 'staging' | 'production';
  };
  project?: {
    id: string;
    name: string;
    phase: string;
  };
  session?: {
    id: string;
    startTime: string;
    duration: number;
  };
  workflow?: {
    id: string;
    name: string;
    step: string;
    execution: string;
  };
  collaboration?: {
    type: 'individual' | 'team' | 'cross_group' | 'external';
    participants: string[];
    channel?: string;
  };
  integration?: {
    sourceSystem: string;
    destinationSystem: string;
    protocol: string;
    version: string;
  };
}

interface ActivityMetadata {
  requestId?: string;
  traceId?: string;
  spanId?: string;
  operationId?: string;
  correlationId?: string;
  businessId?: string;
  transactionId?: string;
  batchId?: string;
  jobId?: string;
  workflowId?: string;
  processId?: string;
  threadId?: string;
  version: string;
  checksum?: string;
  signature?: string;
  encryption?: {
    algorithm: string;
    keyId: string;
    encrypted: boolean;
  };
  compression?: {
    algorithm: string;
    ratio: number;
    originalSize: number;
    compressedSize: number;
  };
}

interface ActivityImpact {
  scope: 'local' | 'group' | 'cross_group' | 'system_wide' | 'external';
  affectedUsers: number;
  affectedResources: number;
  dataVolume?: {
    records: number;
    size: number;
    unit: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB';
  };
  performance?: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  business?: {
    cost: number;
    revenue: number;
    risk: 'low' | 'medium' | 'high' | 'critical';
    opportunity: 'low' | 'medium' | 'high' | 'strategic';
  };
  technical?: {
    complexity: 'simple' | 'moderate' | 'complex' | 'critical';
    dependencies: string[];
    reversibility: boolean;
    rollbackTime?: number;
  };
}

interface ActivityCompliance {
  frameworks: string[];
  requirements: string[];
  violations?: Array<{
    framework: string;
    requirement: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    remediation?: string;
  }>;
  approvals?: Array<{
    approver: string;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
  }>;
  retention?: {
    period: number;
    unit: 'days' | 'months' | 'years';
    reason: string;
    autoDelete: boolean;
  };
  auditability?: {
    level: 'basic' | 'enhanced' | 'comprehensive';
    evidence: string[];
    witnesses: string[];
  };
}

interface ActivityFilter {
  dateRange?: DateRange;
  users?: string[];
  actions?: string[];
  resources?: string[];
  categories?: string[];
  severity?: string[];
  status?: string[];
  spas?: string[];
  tags?: string[];
  locations?: string[];
  devices?: string[];
  compliance?: string[];
  searchQuery?: string;
  correlationGroups?: boolean;
  realTimeOnly?: boolean;
  anomaliesOnly?: boolean;
  complianceViolations?: boolean;
  highImpactOnly?: boolean;
}

interface ActivityAnalytics {
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    activeWorkspaces: number;
    crossGroupOperations: number;
    complianceViolations: number;
    securityIncidents: number;
    averageResponseTime: number;
    systemAvailability: number;
  };
  trends: {
    daily: Array<{
      date: string;
      events: number;
      users: number;
      violations: number;
    }>;
    hourly: Array<{
      hour: number;
      events: number;
      users: number;
      performance: number;
    }>;
    patterns: Array<{
      pattern: string;
      frequency: number;
      significance: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
  };
  distribution: {
    byCategory: Record<string, number>;
    bySPA: Record<string, number>;
    byUser: Record<string, number>;
    bySeverity: Record<string, number>;
    byLocation: Record<string, number>;
    byDevice: Record<string, number>;
  };
  correlations: Array<{
    events: string[];
    strength: number;
    type: 'temporal' | 'causal' | 'user_based' | 'resource_based';
    description: string;
  }>;
  anomalies: Array<{
    id: string;
    type: 'volume' | 'pattern' | 'performance' | 'security' | 'compliance';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    timeline: string[];
    recommendations: string[];
  }>;
  predictions: Array<{
    metric: string;
    prediction: number;
    confidence: number;
    timeframe: string;
    factors: string[];
  }>;
}

interface ActivityAlert {
  id: string;
  type: 'real_time' | 'threshold' | 'pattern' | 'anomaly' | 'compliance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'muted';
  createdAt: string;
  updatedAt: string;
  triggeredBy: ActivityEvent;
  conditions: {
    metric: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches';
    value: any;
    timeWindow?: number;
  }[];
  actions: Array<{
    type: 'notification' | 'webhook' | 'email' | 'automation' | 'escalation';
    target: string;
    executed: boolean;
    timestamp?: string;
  }>;
  escalation?: {
    level: number;
    nextLevel?: string;
    timeout: number;
  };
}

interface ActivitySearchQuery {
  query: string;
  filters: ActivityFilter;
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    size: number;
  };
  aggregations: {
    groupBy: string[];
    metrics: string[];
  };
  highlight: {
    fields: string[];
    fragments: number;
  };
}

interface ActivityExport {
  id: string;
  format: 'csv' | 'json' | 'xlsx' | 'pdf' | 'xml' | 'parquet';
  filters: ActivityFilter;
  fields: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  url?: string;
  expiresAt?: string;
  size?: number;
  rows?: number;
  checksum?: string;
}

interface ActivityVisualization {
  id: string;
  type: 'timeline' | 'heatmap' | 'network' | 'flow' | 'geographic' | 'treemap' | 'sankey' | 'gantt';
  title: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: string;
    timeWindow?: string;
    colorScheme?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    interactive?: boolean;
  };
  data: any[];
  filters: ActivityFilter;
  refreshInterval?: number;
  lastUpdated: string;
}

const QuickActivityView: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<'live' | 'analytics' | 'search' | 'alerts' | 'audit'>('live');
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'graph' | 'heatmap'>('list');
  const [isRealTime, setIsRealTime] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [filters, setFilters] = useState<ActivityFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedEvent, setSelectedEvent] = useState<ActivityEvent | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx' | 'pdf'>('csv');
  const [selectedVisualization, setSelectedVisualization] = useState<'timeline' | 'heatmap' | 'network'>('timeline');
  const [alertsFilter, setAlertsFilter] = useState<'all' | 'active' | 'critical'>('all');

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Hooks
  const {
    activities,
    realtimeActivities,
    analytics,
    alerts,
    loading: activityLoading,
    error: activityError,
    startRealtimeTracking,
    stopRealtimeTracking,
    getActivities,
    getActivityAnalytics,
    searchActivities,
    getActivityCorrelations,
    getActivityPatterns,
    getActivityAnomalies,
    exportActivities,
    createActivityAlert,
    updateActivityAlert,
    deleteActivityAlert,
    acknowledgeAlert,
    resolveAlert,
    muteAlert,
    getAuditTrail,
    validateCompliance,
    getComplianceReport,
    getSecurityInsights,
    getPerformanceMetrics,
    getCollaborationMetrics,
    getCrossGroupActivity,
    getWorkflowActivity,
    getPipelineActivity,
    getUserActivity,
    getSystemActivity,
    subscribeToActivityStream,
    unsubscribeFromActivityStream
  } = useActivityTracking();

  const {
    currentWorkspace,
    workspaces,
    getWorkspaceActivity,
    getWorkspaceMetrics
  } = useWorkspaceManagement();

  const {
    currentUser,
    users,
    getUserProfile,
    getUserActivity: getUserActivityProfile
  } = useUserManagement();

  const {
    getAIRecommendations,
    analyzeActivityPatterns,
    detectAnomalies,
    predictTrends,
    generateInsights,
    optimizePerformance
  } = useAIAssistant();

  const {
    getCrossGroupMetrics,
    getCrossGroupActivity: getCrossGroupActivityFromIntegration,
    getIntegrationHealth
  } = useCrossGroupIntegration();

  // SPA Integration Hooks
  const { getDataSourceActivity } = useDataSources();
  const { getScanRuleActivity } = useScanRuleSets();
  const { getClassificationActivity } = useClassifications();
  const { getComplianceActivity } = useComplianceRule();
  const { getCatalogActivity } = useAdvancedCatalog();
  const { getScanLogicActivity } = useScanLogic();
  const { getRBACActivity } = useRBACSystem();

  // Effects
  useEffect(() => {
    if (isRealTime && autoRefresh) {
      startRealtimeTracking();
      const interval = setInterval(() => {
        getActivities(filters);
      }, refreshInterval);
      return () => {
        clearInterval(interval);
        stopRealtimeTracking();
      };
    }
  }, [isRealTime, autoRefresh, refreshInterval, filters]);

  useEffect(() => {
    if (autoScrollRef.current && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [realtimeActivities]);

  // Event Handlers
  const handleEventSelect = useCallback((eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  }, []);

  const handleEventDetails = useCallback((event: ActivityEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await exportActivities({
        format: exportFormat,
        filters,
        fields: ['timestamp', 'user', 'action', 'resource', 'status', 'severity']
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportFormat, filters]);

  const handleCreateAlert = useCallback(async (alertConfig: Partial<ActivityAlert>) => {
    try {
      await createActivityAlert(alertConfig);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<ActivityFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchActivities({
        query,
        filters,
        sort: { field: 'timestamp', direction: 'desc' },
        pagination: { page: 1, size: 100 },
        aggregations: { groupBy: ['category', 'spa'], metrics: ['count'] },
        highlight: { fields: ['action.description', 'resource.name'], fragments: 3 }
      });
    }
  }, [filters]);

  // Computed Values
  const filteredActivities = useMemo(() => {
    let events = isRealTime ? realtimeActivities : activities;
    
    if (searchQuery) {
      events = events.filter(event =>
        event.action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.severity?.length) {
      events = events.filter(event => filters.severity!.includes(event.severity));
    }

    if (filters.categories?.length) {
      events = events.filter(event => filters.categories!.includes(event.category));
    }

    if (filters.status?.length) {
      events = events.filter(event => filters.status!.includes(event.status));
    }

    if (filters.spas?.length) {
      events = events.filter(event => filters.spas!.includes(event.resource.spa));
    }

    if (filters.users?.length) {
      events = events.filter(event => filters.users!.includes(event.user.id));
    }

    if (filters.dateRange?.from && filters.dateRange?.to) {
      events = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= filters.dateRange!.from! && eventDate <= filters.dateRange!.to!;
      });
    }

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [realtimeActivities, activities, isRealTime, searchQuery, filters]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Play className="h-4 w-4 text-blue-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <MinusCircle className="h-4 w-4 text-gray-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data_access': return <Database className="h-4 w-4" />;
      case 'configuration': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'compliance': return <FileCheck className="h-4 w-4" />;
      case 'workflow': return <Zap className="h-4 w-4" />;
      case 'system': return <Server className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    if (duration < 3600000) return `${(duration / 60000).toFixed(1)}m`;
    return `${(duration / 3600000).toFixed(1)}h`;
  };

  const renderActivityList = () => (
    <ScrollArea className="h-[600px]" ref={scrollAreaRef}>
      <div className="space-y-2 p-2">
        <AnimatePresence>
          {filteredActivities.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedEvents.includes(event.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleEventDetails(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Checkbox
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => handleEventSelect(event.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-shrink-0">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(event.category)}
                            <span className="text-sm font-medium text-gray-900">
                              {event.action.description}
                            </span>
                          </div>
                          <Badge className={getSeverityColor(event.severity)} variant="outline">
                            {event.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.resource.spa}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{event.user.name}</span>
                          {' '}
                          <span className="text-gray-400">•</span>
                          {' '}
                          <span>{event.resource.name}</span>
                          {event.duration && (
                            <>
                              {' '}
                              <span className="text-gray-400">•</span>
                              {' '}
                              <span>{formatDuration(event.duration)}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center space-x-1">
                                <Globe className="h-3 w-3" />
                                <span>{event.location.city}, {event.location.country}</span>
                              </div>
                            )}
                            {event.device && (
                              <div className="flex items-center space-x-1">
                                <MonitorSpeaker className="h-3 w-3" />
                                <span>{event.device.type}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {event.compliance.violations && event.compliance.violations.length > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{event.compliance.violations.length} compliance violation(s)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {event.correlatedEvents && event.correlatedEvents.length > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Link className="h-4 w-4 text-blue-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{event.correlatedEvents.length} correlated event(s)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEventDetails(event)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Event ID
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View in SPA
                                </DropdownMenuItem>
                                {event.correlatedEvents && event.correlatedEvents.length > 0 && (
                                  <DropdownMenuItem>
                                    <Link className="h-4 w-4 mr-2" />
                                    View Correlations
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Flag className="h-4 w-4 mr-2" />
                                  Flag Event
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
            <p className="text-sm text-gray-500">
              No activities match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  const renderTimeline = () => (
    <div className="h-[600px] relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline View</h3>
          <p className="text-sm text-gray-500">
            Timeline visualization coming soon...
          </p>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.summary.totalEvents.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.summary.uniqueUsers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Violations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.summary.complianceViolations.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Availability</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(analytics.summary.systemAvailability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Activity by Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.distribution.byCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category)}
                        <span className="text-sm font-medium capitalize">{category.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(analytics.distribution.byCategory))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>Activity by SPA</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.distribution.bySPA).map(([spa, count]) => (
                    <div key={spa} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{spa}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(analytics.distribution.bySPA))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Anomalies */}
          {analytics.anomalies && analytics.anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Detected Anomalies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(anomaly.severity)} variant="outline">
                            {anomaly.severity}
                          </Badge>
                          <span className="font-medium">{anomaly.type}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {(anomaly.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{anomaly.description}</p>
                      {anomaly.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Recommendations:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {anomaly.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-1">
                                <span>•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Alerts</h3>
        <div className="flex items-center space-x-2">
          <Select value={alertsFilter} onValueChange={setAlertsFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm">
            <Bell className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {alerts
          .filter(alert => 
            alertsFilter === 'all' || 
            (alertsFilter === 'active' && alert.status === 'active') ||
            (alertsFilter === 'critical' && alert.severity === 'critical')
          )
          .map((alert) => (
            <Card key={alert.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-5 w-5 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'high' ? 'text-orange-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={alert.status === 'active' ? 'destructive' : 'secondary'}
                    >
                      {alert.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => acknowledgeAlert(alert.id)}>
                          Acknowledge
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resolveAlert(alert.id)}>
                          Resolve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => muteAlert(alert.id)}>
                          Mute
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteActivityAlert(alert.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Activity Tracker</h1>
                  <p className="text-sm text-gray-600">
                    Cross-system activity monitoring and analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium text-green-800">
                    {isRealTime ? 'Live' : 'Paused'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRealTime(!isRealTime)}
                >
                  {isRealTime ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">
                        <div className="flex items-center space-x-2">
                          <List className="h-4 w-4" />
                          <span>List</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="timeline">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>Timeline</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                  <span className="text-sm text-gray-600">Auto-refresh</span>
                  <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1s</SelectItem>
                      <SelectItem value="5000">5s</SelectItem>
                      <SelectItem value="10000">10s</SelectItem>
                      <SelectItem value="30000">30s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Expanded Filters */}
              <AnimatePresence>
                {isFilterExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Severity</Label>
                        <div className="space-y-2 mt-1">
                          {['critical', 'high', 'medium', 'low'].map((severity) => (
                            <div key={severity} className="flex items-center space-x-2">
                              <Checkbox
                                id={`severity-${severity}`}
                                checked={filters.severity?.includes(severity)}
                                onCheckedChange={(checked) => {
                                  const newSeverity = checked
                                    ? [...(filters.severity || []), severity]
                                    : (filters.severity || []).filter(s => s !== severity);
                                  handleFilterChange({ severity: newSeverity });
                                }}
                              />
                              <Label htmlFor={`severity-${severity}`} className="text-sm capitalize">
                                {severity}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Category</Label>
                        <div className="space-y-2 mt-1">
                          {['data_access', 'security', 'compliance', 'workflow'].map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category}`}
                                checked={filters.categories?.includes(category)}
                                onCheckedChange={(checked) => {
                                  const newCategories = checked
                                    ? [...(filters.categories || []), category]
                                    : (filters.categories || []).filter(c => c !== category);
                                  handleFilterChange({ categories: newCategories });
                                }}
                              />
                              <Label htmlFor={`category-${category}`} className="text-sm">
                                {category.replace('_', ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="space-y-2 mt-1">
                          {['completed', 'in_progress', 'failed', 'warning'].map((status) => (
                            <div key={status} className="flex items-center space-x-2">
                              <Checkbox
                                id={`status-${status}`}
                                checked={filters.status?.includes(status)}
                                onCheckedChange={(checked) => {
                                  const newStatus = checked
                                    ? [...(filters.status || []), status]
                                    : (filters.status || []).filter(s => s !== status);
                                  handleFilterChange({ status: newStatus });
                                }}
                              />
                              <Label htmlFor={`status-${status}`} className="text-sm">
                                {status.replace('_', ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date Range</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal mt-1">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDateRange?.from ? (
                                selectedDateRange.to ? (
                                  <>
                                    {selectedDateRange.from.toLocaleDateString()} -{' '}
                                    {selectedDateRange.to.toLocaleDateString()}
                                  </>
                                ) : (
                                  selectedDateRange.from.toLocaleDateString()
                                )
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={selectedDateRange?.from}
                              selected={selectedDateRange}
                              onSelect={(range) => {
                                setSelectedDateRange(range);
                                handleFilterChange({ dateRange: range });
                              }}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="live" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Live Activity</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Audit</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Real-time Activity Stream</span>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{filteredActivities.length} events</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {viewMode === 'list' ? renderActivityList() : renderTimeline()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              {renderAnalytics()}
            </TabsContent>

            <TabsContent value="search">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Search</h3>
                    <p className="text-sm text-gray-500">
                      Advanced search capabilities coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              {renderAlerts()}
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Trail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Trail</h3>
                    <p className="text-sm text-gray-500">
                      Comprehensive audit trail functionality coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Event Details Dialog */}
          <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Activity Event Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected activity event
                </DialogDescription>
              </DialogHeader>
              {selectedEvent && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium">Event Information</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">ID:</span>
                          <span className="text-sm font-mono">{selectedEvent.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Timestamp:</span>
                          <span className="text-sm">{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Status:</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(selectedEvent.status)}
                            <span className="text-sm">{selectedEvent.status}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Severity:</span>
                          <Badge className={getSeverityColor(selectedEvent.severity)} variant="outline">
                            {selectedEvent.severity}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Category:</span>
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(selectedEvent.category)}
                            <span className="text-sm">{selectedEvent.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">User Information</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={selectedEvent.user.avatar} />
                            <AvatarFallback>
                              {selectedEvent.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{selectedEvent.user.name}</p>
                            <p className="text-xs text-gray-500">{selectedEvent.user.email}</p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Role:</span>
                          <span className="text-sm">{selectedEvent.user.role}</span>
                        </div>
                        {selectedEvent.user.department && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Department:</span>
                            <span className="text-sm">{selectedEvent.user.department}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Action Details</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="text-sm">{selectedEvent.action.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Method:</span>
                        <span className="text-sm">{selectedEvent.action.method}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Description:</span>
                        <p className="text-sm mt-1">{selectedEvent.action.description}</p>
                      </div>
                      {selectedEvent.action.endpoint && (
                        <div>
                          <span className="text-sm text-gray-500">Endpoint:</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                            {selectedEvent.action.endpoint}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Resource Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Type:</span>
                        <span className="text-sm">{selectedEvent.resource.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Name:</span>
                        <span className="text-sm">{selectedEvent.resource.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">SPA:</span>
                        <Badge variant="outline">{selectedEvent.resource.spa}</Badge>
                      </div>
                      {selectedEvent.resource.path && (
                        <div>
                          <span className="text-sm text-gray-500">Path:</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                            {selectedEvent.resource.path}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedEvent.compliance.violations && selectedEvent.compliance.violations.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium">Compliance Violations</Label>
                        <div className="mt-2 space-y-2">
                          {selectedEvent.compliance.violations.map((violation, index) => (
                            <div key={index} className="border border-red-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{violation.framework}</span>
                                <Badge className={getSeverityColor(violation.severity)} variant="outline">
                                  {violation.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">{violation.description}</p>
                              {violation.remediation && (
                                <div className="mt-2">
                                  <span className="text-xs font-medium text-gray-600">Remediation:</span>
                                  <p className="text-xs text-gray-600 mt-1">{violation.remediation}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedEvent.correlatedEvents && selectedEvent.correlatedEvents.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium">Correlated Events</Label>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            This event is correlated with {selectedEvent.correlatedEvents.length} other events.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedEvent.correlatedEvents.slice(0, 5).map((eventId) => (
                              <Badge key={eventId} variant="outline" className="text-xs">
                                {eventId.slice(-8)}
                              </Badge>
                            ))}
                            {selectedEvent.correlatedEvents.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{selectedEvent.correlatedEvents.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default QuickActivityView;