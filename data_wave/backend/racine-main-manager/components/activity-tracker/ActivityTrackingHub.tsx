/**
 * ActivityTrackingHub.tsx
 * ========================
 * 
 * Main Activity Tracking Controller - The central orchestrator for comprehensive
 * activity tracking, monitoring, and analytics across all data governance SPAs.
 * 
 * Features:
 * - Real-time activity monitoring and logging
 * - Cross-SPA activity correlation and analysis
 * - Advanced filtering, search, and analytics
 * - Audit trail management with compliance reporting
 * - Interactive visualizations and dashboards
 * - Role-based access control and permissions
 * - Export capabilities and automated reporting
 * 
 * Design: Modern glass morphism design with adaptive layouts, smooth animations,
 * and enterprise-grade UI/UX using shadcn/ui, Next.js, and Tailwind CSS.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Activity, Search, Filter, BarChart3, Clock, Shield, Download, Settings, Eye, AlertTriangle, Users, Database, Workflow, FileText, Zap, TrendingUp, Calendar as CalendarIcon, RefreshCcw, ChevronDown, ChevronRight, Play, Pause, Square, MoreHorizontal, Bell, CheckCircle, XCircle, AlertCircle, Info, Hash, Globe, MapPin, Clock3, User, Building, Lock, Unlock, Target, Layers, GitBranch, Network, Radar, Cpu, HardDrive, Gauge, PieChart, LineChart, BarChart, TreePine, Grid3X3, List, Table as TableIcon, Kanban, Archive, Trash2, Star, Bookmark, Share, ExternalLink, Copy, Edit, Save, Undo, Redo } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// Custom Components
import { RealTimeActivityStream } from './RealTimeActivityStream';
import { CrossGroupActivityAnalyzer } from './CrossGroupActivityAnalyzer';
import { ActivityVisualizationSuite } from './ActivityVisualizationSuite';
import { AuditTrailManager } from './AuditTrailManager';
import { ActivitySearchEngine } from './ActivitySearchEngine';
import { ComplianceActivityMonitor } from './ComplianceActivityMonitor';
import { ActivityReportingEngine } from './ActivityReportingEngine';

// Hooks and Services
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';

// Types
import {
  ActivityRecord,
  ActivityFilter,
  ActivityType,
  ActivitySeverity,
  AuditTrail,
  UUID,
  UserRole
} from '../../types/racine-core.types';
import {
  ActivityReportRequest,
  PaginationRequest,
  FilterRequest
} from '../../types/api.types';

// Utils
import { formatDateTime, formatDuration, formatBytes } from '../../utils/formatting-utils';
import { validatePermissions, checkAccess } from '../../utils/security-utils';
import { cn } from '@/lib/utils';

/**
 * Activity tracking view modes
 */
export enum ActivityViewMode {
  DASHBOARD = 'dashboard',
  REAL_TIME = 'real_time',
  ANALYTICS = 'analytics',
  SEARCH = 'search',
  AUDIT = 'audit',
  COMPLIANCE = 'compliance',
  REPORTS = 'reports'
}

/**
 * Activity tracking layout types
 */
export enum ActivityLayoutType {
  GRID = 'grid',
  LIST = 'list',
  TIMELINE = 'timeline',
  HEATMAP = 'heatmap',
  NETWORK = 'network'
}

/**
 * Filter panel modes
 */
export enum FilterPanelMode {
  QUICK = 'quick',
  ADVANCED = 'advanced',
  SAVED = 'saved',
  CUSTOM = 'custom'
}

/**
 * Activity tracking hub props interface
 */
interface ActivityTrackingHubProps {
  mode?: 'full-tracker' | 'basic-tracker' | 'audit-only' | 'analytics-only';
  enableRealTimeTracking?: boolean;
  enableAdvancedFiltering?: boolean;
  enableCrossGroupCorrelation?: boolean;
  enableVisualAnalytics?: boolean;
  enableAuditTrails?: boolean;
  enableExportCapabilities?: boolean;
  enableAlertSystem?: boolean;
  enableComplianceReporting?: boolean;
  enableUserBehaviorAnalysis?: boolean;
  enableNotifications?: boolean;
  showActivityTimeline?: boolean;
  showHeatmaps?: boolean;
  showAnomalyDetection?: boolean;
  showQuickActions?: boolean;
  showStatistics?: boolean;
}

/**
 * Activity tracking hub state interface
 */
interface ActivityTrackingHubState {
  // View Management
  currentView: ActivityViewMode;
  layoutType: ActivityLayoutType;
  isFullscreen: boolean;
  splitPaneLayout: boolean;
  
  // Filter Management
  filterPanelOpen: boolean;
  filterPanelMode: FilterPanelMode;
  activeFilters: ActivityFilter[];
  quickFilters: ActivityFilter[];
  savedFilters: ActivityFilter[];
  
  // Selection and Interaction
  selectedActivities: Set<UUID>;
  selectedTimeRange: {
    start: Date;
    end: Date;
  };
  hoverActivity: UUID | null;
  
  // UI State
  sidebarCollapsed: boolean;
  showSettings: boolean;
  showExportDialog: boolean;
  showFilterDialog: boolean;
  showComparisonView: boolean;
  
  // Real-time State
  isRealTimeEnabled: boolean;
  autoRefreshInterval: number;
  streamingActive: boolean;
  
  // Performance State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date;
  performanceMetrics: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
  };
}

/**
 * Initial state
 */
const initialState: ActivityTrackingHubState = {
  currentView: ActivityViewMode.DASHBOARD,
  layoutType: ActivityLayoutType.GRID,
  isFullscreen: false,
  splitPaneLayout: false,
  filterPanelOpen: false,
  filterPanelMode: FilterPanelMode.QUICK,
  activeFilters: [],
  quickFilters: [],
  savedFilters: [],
  selectedActivities: new Set(),
  selectedTimeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date()
  },
  hoverActivity: null,
  sidebarCollapsed: false,
  showSettings: false,
  showExportDialog: false,
  showFilterDialog: false,
  showComparisonView: false,
  isRealTimeEnabled: true,
  autoRefreshInterval: 30000, // 30 seconds
  streamingActive: false,
  isLoading: false,
  error: null,
  lastUpdated: new Date(),
  performanceMetrics: {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  }
};

/**
 * Activity severity color mapping
 */
const severityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

/**
 * Activity type icon mapping
 */
const activityTypeIcons = {
  user_action: User,
  system_event: Cpu,
  workflow_execution: Workflow,
  resource_access: Database,
  security_event: Shield,
  compliance_check: CheckCircle,
  error_event: XCircle,
  warning_event: AlertTriangle,
  info_event: Info,
  audit_event: FileText,
  performance_metric: Gauge,
  data_operation: HardDrive,
  notification: Bell,
  integration: GitBranch,
  automation: Zap
};

/**
 * Main ActivityTrackingHub Component
 */
export const ActivityTrackingHub: React.FC<ActivityTrackingHubProps> = ({
  mode = 'full-tracker',
  enableRealTimeTracking = true,
  enableAdvancedFiltering = true,
  enableCrossGroupCorrelation = true,
  enableVisualAnalytics = true,
  enableAuditTrails = true,
  enableExportCapabilities = true,
  enableAlertSystem = true,
  enableComplianceReporting = true,
  enableUserBehaviorAnalysis = true,
  enableNotifications = true,
  showActivityTimeline = true,
  showHeatmaps = true,
  showAnomalyDetection = true,
  showQuickActions = true,
  showStatistics = true
}) => {
  // State Management
  const [state, setState] = useState<ActivityTrackingHubState>(initialState);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<[Date, Date]>([
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    new Date()
  ]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const performanceRef = useRef<{ start: number; render: number }>({ start: 0, render: 0 });

  // Animation Controls
  const mainAnimationControls = useAnimation();
  const sidebarAnimationControls = useAnimation();

  // Hooks
  const {
    activities,
    filteredActivities,
    analytics,
    auditTrails,
    anomalies,
    correlations,
    loading,
    errors,
    pagination,
    logActivity,
    searchActivities,
    getAnalytics,
    getAuditTrail,
    exportActivities,
    startStreaming,
    stopStreaming,
    isStreaming,
    applyFilters,
    clearFilters,
    refreshData
  } = useActivityTracker();

  const { currentUser, userPermissions, checkPermission } = useUserManagement();
  const { currentWorkspace, workspacePermissions } = useWorkspaceManagement();
  const { getSystemHealth, getPerformanceMetrics } = useRacineOrchestration();
  const { getAllSPAStatus, coordinateActivities } = useCrossGroupIntegration();

  // Performance Monitoring
  useEffect(() => {
    performanceRef.current.start = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - performanceRef.current.start;
      
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          loadTime,
          renderTime: endTime - performanceRef.current.render
        }
      }));
    };
  }, []);

  useEffect(() => {
    performanceRef.current.render = performance.now();
  });

  // Auto-refresh Setup
  useEffect(() => {
    if (state.isRealTimeEnabled && state.autoRefreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
        setState(prev => ({ ...prev, lastUpdated: new Date() }));
      }, state.autoRefreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.isRealTimeEnabled, state.autoRefreshInterval, refreshData]);

  // Streaming Management
  useEffect(() => {
    if (state.streamingActive && !isStreaming) {
      startStreaming();
    } else if (!state.streamingActive && isStreaming) {
      stopStreaming();
    }
  }, [state.streamingActive, isStreaming, startStreaming, stopStreaming]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'f':
            event.preventDefault();
            setState(prev => ({ ...prev, filterPanelOpen: !prev.filterPanelOpen }));
            break;
          case 'r':
            event.preventDefault();
            refreshData();
            break;
          case 's':
            event.preventDefault();
            setState(prev => ({ ...prev, showSettings: true }));
            break;
          case 'e':
            event.preventDefault();
            setState(prev => ({ ...prev, showExportDialog: true }));
            break;
          case '1':
            event.preventDefault();
            handleViewChange(ActivityViewMode.DASHBOARD);
            break;
          case '2':
            event.preventDefault();
            handleViewChange(ActivityViewMode.REAL_TIME);
            break;
          case '3':
            event.preventDefault();
            handleViewChange(ActivityViewMode.ANALYTICS);
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setState(prev => ({
          ...prev,
          showSettings: false,
          showExportDialog: false,
          showFilterDialog: false,
          filterPanelOpen: false
        }));
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [refreshData]);

  // Event Handlers
  const handleViewChange = useCallback((view: ActivityViewMode) => {
    setState(prev => ({ ...prev, currentView: view }));
    mainAnimationControls.start({
      opacity: [0, 1],
      y: [10, 0],
      transition: { duration: 0.3 }
    });
  }, [mainAnimationControls]);

  const handleLayoutChange = useCallback((layout: ActivityLayoutType) => {
    setState(prev => ({ ...prev, layoutType: layout }));
  }, []);

  const handleFilterToggle = useCallback(() => {
    setState(prev => ({ ...prev, filterPanelOpen: !prev.filterPanelOpen }));
    sidebarAnimationControls.start({
      width: state.filterPanelOpen ? 0 : 320,
      transition: { duration: 0.3, ease: 'easeInOut' }
    });
  }, [state.filterPanelOpen, sidebarAnimationControls]);

  const handleActivitySelect = useCallback((activityId: UUID, multiSelect: boolean = false) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedActivities);
      
      if (multiSelect) {
        if (newSelected.has(activityId)) {
          newSelected.delete(activityId);
        } else {
          newSelected.add(activityId);
        }
      } else {
        newSelected.clear();
        newSelected.add(activityId);
      }
      
      return { ...prev, selectedActivities: newSelected };
    });
  }, []);

  const handleBulkActions = useCallback(async (action: string) => {
    const selectedIds = Array.from(state.selectedActivities);
    
    try {
      switch (action) {
        case 'export':
          await exportActivities({ activityIds: selectedIds });
          break;
        case 'archive':
          // Archive selected activities
          break;
        case 'delete':
          // Delete selected activities (if permitted)
          break;
        case 'audit':
          // Create audit trail for selected activities
          break;
      }
      
      setState(prev => ({ ...prev, selectedActivities: new Set() }));
    } catch (error) {
      console.error('Bulk action failed:', error);
      setState(prev => ({ ...prev, error: `Bulk action failed: ${error}` }));
    }
  }, [state.selectedActivities, exportActivities]);

  const handleFilterApply = useCallback((filters: ActivityFilter[]) => {
    applyFilters(filters);
    setState(prev => ({ ...prev, activeFilters: filters }));
  }, [applyFilters]);

  const handleQuickFilter = useCallback((filter: ActivityFilter) => {
    const newFilters = [...state.activeFilters, filter];
    handleFilterApply(newFilters);
  }, [state.activeFilters, handleFilterApply]);

  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf' = 'csv') => {
    try {
      const exportData = {
        activities: state.selectedActivities.size > 0 
          ? filteredActivities.filter(a => state.selectedActivities.has(a.id))
          : filteredActivities,
        format,
        filters: state.activeFilters,
        dateRange: state.selectedTimeRange,
        includeAnalytics: true
      };
      
      await exportActivities(exportData);
      setState(prev => ({ ...prev, showExportDialog: false }));
    } catch (error) {
      console.error('Export failed:', error);
      setState(prev => ({ ...prev, error: `Export failed: ${error}` }));
    }
  }, [state.selectedActivities, state.activeFilters, state.selectedTimeRange, filteredActivities, exportActivities]);

  // Memoized Computations
  const activityStats = useMemo(() => {
    const total = filteredActivities.length;
    const byType = filteredActivities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {} as Record<ActivityType, number>);
    
    const bySeverity = filteredActivities.reduce((acc, activity) => {
      acc[activity.severity] = (acc[activity.severity] || 0) + 1;
      return acc;
    }, {} as Record<ActivitySeverity, number>);
    
    const recentActivities = filteredActivities
      .filter(a => new Date(a.timestamp) > new Date(Date.now() - 60 * 60 * 1000))
      .length;
    
    return {
      total,
      byType,
      bySeverity,
      recentActivities,
      averagePerHour: total / 24, // Assuming 24-hour window
      errorRate: (bySeverity.high || 0) + (bySeverity.critical || 0),
      successRate: total - ((bySeverity.high || 0) + (bySeverity.critical || 0))
    };
  }, [filteredActivities]);

  const recentAnomalies = useMemo(() => {
    return anomalies
      .filter(anomaly => new Date(anomaly.detectedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
      .slice(0, 5);
  }, [anomalies]);

  const topCorrelations = useMemo(() => {
    return correlations
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10);
  }, [correlations]);

  // Render Functions
  const renderHeaderControls = () => (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Activity Tracking Hub
          </h1>
        </div>
        
        {state.isRealTimeEnabled && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live</span>
          </Badge>
        )}
        
        {state.selectedActivities.size > 0 && (
          <Badge variant="outline">
            {state.selectedActivities.size} selected
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* View Mode Selector */}
        <Tabs value={state.currentView} onValueChange={(value) => handleViewChange(value as ActivityViewMode)}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value={ActivityViewMode.DASHBOARD} className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value={ActivityViewMode.REAL_TIME} className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Real-time
            </TabsTrigger>
            <TabsTrigger value={ActivityViewMode.ANALYTICS} className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value={ActivityViewMode.SEARCH} className="text-xs">
              <Search className="h-3 w-3 mr-1" />
              Search
            </TabsTrigger>
            <TabsTrigger value={ActivityViewMode.AUDIT} className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Audit
            </TabsTrigger>
            <TabsTrigger value={ActivityViewMode.COMPLIANCE} className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value={ActivityViewMode.REPORTS} className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Reports
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Layout Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Layout
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>View Layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup 
              value={state.layoutType} 
              onValueChange={(value) => handleLayoutChange(value as ActivityLayoutType)}
            >
              <DropdownMenuRadioItem value={ActivityLayoutType.GRID}>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid View
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={ActivityLayoutType.LIST}>
                <List className="h-4 w-4 mr-2" />
                List View
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={ActivityLayoutType.TIMELINE}>
                <Clock className="h-4 w-4 mr-2" />
                Timeline View
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={ActivityLayoutType.HEATMAP}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Heatmap View
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={ActivityLayoutType.NETWORK}>
                <Network className="h-4 w-4 mr-2" />
                Network View
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Action Controls */}
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleFilterToggle}
                  className={cn(state.filterPanelOpen && "bg-blue-50 border-blue-300")}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Filters (Ctrl+F)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refreshData()}
                  disabled={loading.activities}
                >
                  <RefreshCcw className={cn("h-4 w-4", loading.activities && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Data (Ctrl+R)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showExportDialog: true }))}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Data (Ctrl+E)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, showSettings: true }))}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))}>
                <Eye className="h-4 w-4 mr-2" />
                {state.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, streamingActive: !prev.streamingActive }))}>
                {state.streamingActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {state.streamingActive ? 'Pause Streaming' : 'Start Streaming'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {state.selectedActivities.size > 0 && (
                <>
                  <DropdownMenuItem onClick={() => handleBulkActions('export')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkActions('archive')}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Selected
                  </DropdownMenuItem>
                  {checkPermission('activity:delete') && (
                    <DropdownMenuItem 
                      onClick={() => handleBulkActions('delete')}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );

  const renderStatCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Total Activities
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {activityStats.total.toLocaleString()}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {activityStats.averagePerHour.toFixed(1)}/hour avg
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Recent Activities
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {activityStats.recentActivities}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Last hour
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Anomalies Detected
              </p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {recentAnomalies.length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              Last 24h
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {activityStats.total > 0 ? ((activityStats.successRate / activityStats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2">
            <Progress 
              value={activityStats.total > 0 ? (activityStats.successRate / activityStats.total) * 100 : 0} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMainContent = () => {
    return (
      <motion.div
        animate={mainAnimationControls}
        className="flex-1 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {state.currentView === ActivityViewMode.DASHBOARD && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderStatCards()}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Activity Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ActivityVisualizationSuite 
                        activities={filteredActivities}
                        analytics={analytics}
                        viewMode="overview"
                        height={300}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Real-time Feed</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RealTimeActivityStream 
                        maxItems={10}
                        showFilters={false}
                        compact={true}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
          
          {state.currentView === ActivityViewMode.REAL_TIME && (
            <motion.div
              key="real-time"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <RealTimeActivityStream />
            </motion.div>
          )}
          
          {state.currentView === ActivityViewMode.ANALYTICS && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <CrossGroupActivityAnalyzer />
            </motion.div>
          )}
          
          {state.currentView === ActivityViewMode.SEARCH && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ActivitySearchEngine />
            </motion.div>
          )}
          
          {state.currentView === ActivityViewMode.AUDIT && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <AuditTrailManager />
            </motion.div>
          )}
          
          {state.currentView === ActivityViewMode.COMPLIANCE && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ComplianceActivityMonitor />
            </motion.div>
          )}
          
          {state.currentView === ActivityViewMode.REPORTS && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ActivityReportingEngine />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderFilterPanel = () => (
    <AnimatePresence>
      {state.filterPanelOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleFilterToggle}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Quick Filters */}
              <div>
                <Label className="text-sm font-medium">Quick Filters</Label>
                <div className="mt-2 space-y-2">
                  {state.quickFilters.map((filter) => (
                    <Button
                      key={filter.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleQuickFilter(filter)}
                    >
                      {filter.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {formatDateTime(selectedDateRange[0])} - {formatDateTime(selectedDateRange[1])}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: selectedDateRange[0],
                          to: selectedDateRange[1]
                        }}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            setSelectedDateRange([range.from, range.to]);
                            setState(prev => ({
                              ...prev,
                              selectedTimeRange: { start: range.from!, end: range.to! }
                            }));
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Activity Types */}
              <div>
                <Label className="text-sm font-medium">Activity Types</Label>
                <div className="mt-2 space-y-2">
                  {Object.values(ActivityType).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type}
                        checked={state.activeFilters.some(f => f.activityTypes?.includes(type))}
                        onCheckedChange={(checked) => {
                          // Handle type filter change
                        }}
                      />
                      <Label htmlFor={type} className="text-sm capitalize">
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Severity Levels */}
              <div>
                <Label className="text-sm font-medium">Severity Levels</Label>
                <div className="mt-2 space-y-2">
                  {Object.values(ActivitySeverity).map((severity) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Checkbox 
                        id={severity}
                        checked={state.activeFilters.some(f => f.severity?.includes(severity))}
                        onCheckedChange={(checked) => {
                          // Handle severity filter change
                        }}
                      />
                      <Label htmlFor={severity} className="text-sm capitalize">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", severityColors[severity])}
                        >
                          {severity}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Active Filters */}
              {state.activeFilters.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Active Filters</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        clearFilters();
                        setState(prev => ({ ...prev, activeFilters: [] }));
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {state.activeFilters.map((filter, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800"
                      >
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          {filter.name}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newFilters = state.activeFilters.filter((_, i) => i !== index);
                            handleFilterApply(newFilters);
                          }}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Error Boundary
  if (state.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setState(prev => ({ ...prev, error: null }))}
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // Main Render
  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col h-full bg-gray-50 dark:bg-gray-900",
        state.isFullscreen && "fixed inset-0 z-50"
      )}
    >
      {/* Header */}
      {renderHeaderControls()}
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        {renderMainContent()}
        
        {/* Filter Panel */}
        {renderFilterPanel()}
      </div>
      
      {/* Export Dialog */}
      <Dialog open={state.showExportDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showExportDialog: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Activity Data</DialogTitle>
            <DialogDescription>
              Choose the format and options for exporting activity data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="json">JSON (Raw Data)</SelectItem>
                  <SelectItem value="pdf">PDF (Report)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="include-analytics" defaultChecked />
              <Label htmlFor="include-analytics">Include Analytics Data</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="include-correlations" />
              <Label htmlFor="include-correlations">Include Correlations</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showExportDialog: false }))}>
              Cancel
            </Button>
            <Button onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={state.showSettings} onOpenChange={(open) => setState(prev => ({ ...prev, showSettings: open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity Tracking Settings</DialogTitle>
            <DialogDescription>
              Configure activity tracking preferences and behavior.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="streaming">Real-time</TabsTrigger>
              <TabsTrigger value="notifications">Alerts</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Real-time Updates</Label>
                  <Switch 
                    checked={state.isRealTimeEnabled}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, isRealTimeEnabled: checked }))}
                  />
                </div>
                
                <div>
                  <Label>Auto-refresh Interval (seconds)</Label>
                  <Slider
                    value={[state.autoRefreshInterval / 1000]}
                    onValueChange={([value]) => setState(prev => ({ ...prev, autoRefreshInterval: value * 1000 }))}
                    min={5}
                    max={300}
                    step={5}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Current: {state.autoRefreshInterval / 1000} seconds
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="streaming" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Activity Streaming</Label>
                  <Switch 
                    checked={state.streamingActive}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, streamingActive: checked }))}
                  />
                </div>
                
                <div>
                  <Label>Buffer Size</Label>
                  <Select defaultValue="100">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 activities</SelectItem>
                      <SelectItem value="100">100 activities</SelectItem>
                      <SelectItem value="200">200 activities</SelectItem>
                      <SelectItem value="500">500 activities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Anomaly Alerts</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Error Notifications</Label>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Performance Alerts</Label>
                  <Switch />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {state.performanceMetrics.loadTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-500">Load Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {state.performanceMetrics.renderTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-500">Render Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {(state.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                    </div>
                    <div className="text-sm text-gray-500">Memory Usage</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showSettings: false }))}>
              Close
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Performance Monitor (Dev Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Load: {state.performanceMetrics.loadTime.toFixed(0)}ms</div>
          <div>Render: {state.performanceMetrics.renderTime.toFixed(0)}ms</div>
          <div>Activities: {filteredActivities.length}</div>
          <div>Selected: {state.selectedActivities.size}</div>
          <div>Updated: {formatDateTime(state.lastUpdated)}</div>
        </div>
      )}
    </div>
  );
};

export default ActivityTrackingHub;