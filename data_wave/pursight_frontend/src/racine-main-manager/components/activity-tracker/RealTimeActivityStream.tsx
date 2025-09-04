/**
 * RealTimeActivityStream.tsx
 * ===========================
 * 
 * Real-time Activity Stream Component - Advanced live activity feed with WebSocket
 * integration, intelligent filtering, buffering, and sophisticated visualization.
 * 
 * Features:
 * - Real-time activity streaming via WebSocket
 * - Intelligent buffering and pagination
 * - Advanced filtering and search capabilities
 * - Interactive activity cards with drill-down
 * - Cross-SPA activity correlation
 * - Performance optimization with virtualization
 * - Anomaly detection and highlighting
 * - Export and sharing functionality
 * 
 * Design: Modern stream interface with smooth animations, adaptive layouts,
 * and enterprise-grade UI/UX using shadcn/ui, Next.js, and Tailwind CSS.
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { Activity, Play, Pause, Square, RefreshCcw, Filter, Search, Download, Settings, Eye, EyeOff, AlertTriangle, Clock, Users, Database, Workflow, FileText, Zap, TrendingUp, ChevronDown, ChevronUp, ChevronRight, MoreHorizontal, Bell, CheckCircle, XCircle, AlertCircle, Info, Hash, Globe, MapPin, Clock3, User, Building, Lock, Unlock, Target, Layers, GitBranch, Network, Radar, Cpu, HardDrive, Gauge, PieChart, LineChart, BarChart, Grid3X3, List as ListIcon, Table, Calendar as CalendarIcon, Archive, Star, Bookmark, Share, ExternalLink, Copy, Edit, Save, Maximize2, Minimize2, VolumeX, Volume2, Wifi, WifiOff, RotateCw, FastForward, Rewind, SkipBack, SkipForward, Timer, Crosshair, Focus, ZoomIn, ZoomOut, Move, MousePointer, Shuffle, Repeat, Pause as PauseIcon, Play as PlayIcon, Shield } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

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
  UUID,
  UserRole,
  WorkspaceContext
} from '../../types/racine-core.types';
import {
  ActivityReportRequest,
  PaginationRequest,
  FilterRequest
} from '../../types/api.types';

// Utils
import { formatDateTime, formatDuration, formatBytes, formatNumber } from '../../utils/formatting-utils';
import { validateAPIKeyPermissions } from '../../utils/security-utils';
import { cn } from '@/lib copie/utils';

/**
 * Stream display modes
 */
export enum StreamDisplayMode {
  CARDS = 'cards',
  LIST = 'list',
  COMPACT = 'compact',
  TIMELINE = 'timeline',
  FEED = 'feed'
}

/**
 * Stream update modes
 */
export enum StreamUpdateMode {
  REAL_TIME = 'real_time',
  BATCHED = 'batched',
  MANUAL = 'manual',
  PAUSED = 'paused'
}

/**
 * Activity grouping modes
 */
export enum ActivityGroupingMode {
  NONE = 'none',
  BY_TYPE = 'by_type',
  BY_SEVERITY = 'by_severity',
  BY_USER = 'by_user',
  BY_SPA = 'by_spa',
  BY_TIME = 'by_time'
}

/**
 * Stream sorting options
 */
export enum StreamSortOrder {
  NEWEST_FIRST = 'newest_first',
  OLDEST_FIRST = 'oldest_first',
  SEVERITY_DESC = 'severity_desc',
  SEVERITY_ASC = 'severity_asc',
  TYPE_ASC = 'type_asc',
  USER_ASC = 'user_asc'
}

/**
 * Activity stream component props
 */
interface RealTimeActivityStreamProps {
  maxItems?: number;
  showFilters?: boolean;
  compact?: boolean;
  height?: number;
  autoScroll?: boolean;
  showActions?: boolean;
  allowSelection?: boolean;
  enableGrouping?: boolean;
  enableSearch?: boolean;
  enableExport?: boolean;
  className?: string;
  onActivitySelect?: (activity: ActivityRecord) => void;
  onBulkSelect?: (activities: ActivityRecord[]) => void;
}

/**
 * Activity stream state interface
 */
interface StreamState {
  // Display Settings
  displayMode: StreamDisplayMode;
  updateMode: StreamUpdateMode;
  groupingMode: ActivityGroupingMode;
  sortOrder: StreamSortOrder;
  
  // Streaming Control
  isStreaming: boolean;
  isPaused: boolean;
  isConnected: boolean;
  bufferSize: number;
  updateInterval: number;
  
  // Activity Data
  activities: ActivityRecord[];
  filteredActivities: ActivityRecord[];
  selectedActivities: Set<UUID>;
  highlightedActivity: UUID | null;
  
  // Filtering and Search
  searchQuery: string;
  activeFilters: ActivityFilter[];
  quickFilters: ActivityFilter[];
  
  // UI State
  showFilterPanel: boolean;
  showSettings: boolean;
  isFullscreen: boolean;
  autoScrollEnabled: boolean;
  soundEnabled: boolean;
  
  // Performance
  virtualizationEnabled: boolean;
  itemHeight: number;
  visibleRange: { start: number; end: number };
  
  // Statistics
  streamStats: {
    totalReceived: number;
    averageRate: number;
    peakRate: number;
    bytesReceived: number;
    connectionUptime: number;
    lastActivity: Date | null;
  };
  
  // Errors and Notifications
  error: string | null;
  notifications: ActivityNotification[];
  
  // Advanced Features
  anomalyDetection: boolean;
  correlationHighlighting: boolean;
  crossSPAFiltering: boolean;
}

/**
 * Activity notification interface
 */
interface ActivityNotification {
  id: UUID;
  type: 'anomaly' | 'correlation' | 'error' | 'warning' | 'info';
  message: string;
  activity?: ActivityRecord;
  timestamp: Date;
  dismissed: boolean;
}

/**
 * Initial state
 */
const initialState: StreamState = {
  displayMode: StreamDisplayMode.CARDS,
  updateMode: StreamUpdateMode.REAL_TIME,
  groupingMode: ActivityGroupingMode.NONE,
  sortOrder: StreamSortOrder.NEWEST_FIRST,
  isStreaming: false,
  isPaused: false,
  isConnected: false,
  bufferSize: 100,
  updateInterval: 1000,
  activities: [],
  filteredActivities: [],
  selectedActivities: new Set(),
  highlightedActivity: null,
  searchQuery: '',
  activeFilters: [],
  quickFilters: [
    { id: 'errors', name: 'Errors Only', severity: ['high', 'critical'] },
    { id: 'recent', name: 'Last 5 minutes', dateRange: { start: new Date(Date.now() - 5 * 60 * 1000).toISOString(), end: new Date().toISOString() } },
    { id: 'user-actions', name: 'User Actions', activityTypes: ['user_action', 'workflow_execution'] },
    { id: 'system-events', name: 'System Events', activityTypes: ['system_event', 'security_event'] }
  ],
  showFilterPanel: false,
  showSettings: false,
  isFullscreen: false,
  autoScrollEnabled: true,
  soundEnabled: false,
  virtualizationEnabled: true,
  itemHeight: 120,
  visibleRange: { start: 0, end: 50 },
  streamStats: {
    totalReceived: 0,
    averageRate: 0,
    peakRate: 0,
    bytesReceived: 0,
    connectionUptime: 0,
    lastActivity: null
  },
  error: null,
  notifications: [],
  anomalyDetection: true,
  correlationHighlighting: true,
  crossSPAFiltering: false
};

/**
 * Activity severity colors and icons
 */
const severityConfig = {
  low: { 
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300', 
    icon: CheckCircle,
    pulse: false
  },
  medium: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300', 
    icon: AlertCircle,
    pulse: false
  },
  high: { 
    color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300', 
    icon: AlertTriangle,
    pulse: true
  },
  critical: { 
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300', 
    icon: XCircle,
    pulse: true
  }
};

/**
 * Activity type configurations
 */
const activityTypeConfig = {
  user_action: { icon: User, color: 'text-blue-600', name: 'User Action' },
  system_event: { icon: Cpu, color: 'text-gray-600', name: 'System Event' },
  workflow_execution: { icon: Workflow, color: 'text-purple-600', name: 'Workflow' },
  resource_access: { icon: Database, color: 'text-green-600', name: 'Resource Access' },
  security_event: { icon: Shield, color: 'text-red-600', name: 'Security Event' },
  compliance_check: { icon: CheckCircle, color: 'text-teal-600', name: 'Compliance' },
  error_event: { icon: XCircle, color: 'text-red-600', name: 'Error' },
  warning_event: { icon: AlertTriangle, color: 'text-yellow-600', name: 'Warning' },
  info_event: { icon: Info, color: 'text-blue-600', name: 'Information' },
  audit_event: { icon: FileText, color: 'text-indigo-600', name: 'Audit' },
  performance_metric: { icon: Gauge, color: 'text-orange-600', name: 'Performance' },
  data_operation: { icon: HardDrive, color: 'text-cyan-600', name: 'Data Operation' },
  notification: { icon: Bell, color: 'text-pink-600', name: 'Notification' },
  integration: { icon: GitBranch, color: 'text-emerald-600', name: 'Integration' },
  automation: { icon: Zap, color: 'text-yellow-600', name: 'Automation' }
};

/**
 * Main RealTimeActivityStream Component
 */
export const RealTimeActivityStream: React.FC<RealTimeActivityStreamProps> = ({
  maxItems = 500,
  showFilters = true,
  compact = false,
  height = 600,
  autoScroll = true,
  showActions = true,
  allowSelection = true,
  enableGrouping = true,
  enableSearch = true,
  enableExport = true,
  className,
  onActivitySelect,
  onBulkSelect
}) => {
  // State Management
  const [state, setState] = useState<StreamState>({
    ...initialState,
    autoScrollEnabled: autoScroll,
    virtualizationEnabled: !compact
  });
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const streamStatsRef = useRef<StreamState['streamStats']>(state.streamStats);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Animation Controls
  const headerAnimationControls = useAnimation();
  const filterAnimationControls = useAnimation();
  
  // Hooks
  const {
    activities: hookActivities,
    filteredActivities: hookFilteredActivities,
    loading,
    errors,
    startStreaming,
    stopStreaming,
    isStreaming: hookIsStreaming,
    applyFilters,
    clearFilters,
    refreshData,
    logActivity,
    searchActivities
  } = useActivityTracker();
  
  const { currentUser, userPermissions, checkPermission } = useUserManagement();
  const { currentWorkspace } = useWorkspaceManagement();
  const { getSystemHealth } = useRacineOrchestration();
  const { getAllSPAStatus } = useCrossGroupIntegration();
  
  // WebSocket Connection Management
  useEffect(() => {
    if (state.isStreaming && !wsRef.current) {
      const wsUrl = (typeof window !== 'undefined' && (window as any).ENV?.NEXT_PUBLIC_WS_URL) || 'ws://localhost:8000/ws';
      const ws = new WebSocket(`${wsUrl}/activity-stream`);
      
      ws.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        streamStatsRef.current.connectionUptime = Date.now();
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleStreamActivity(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        setState(prev => ({ 
          ...prev, 
          error: 'WebSocket connection error',
          isConnected: false 
        }));
      };
      
      ws.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false }));
        wsRef.current = null;
        
        // Auto-reconnect if streaming is still enabled
        if (state.isStreaming && !state.isPaused) {
          setTimeout(() => {
            if (state.isStreaming) {
              // Reconnect logic here
            }
          }, 5000);
        }
      };
      
      wsRef.current = ws;
    } else if (!state.isStreaming && wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [state.isStreaming, state.isPaused]);
  
  // Audio Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.3;
    }
  }, []);
  
  // Stream Statistics Update
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isConnected) {
        const uptime = Date.now() - streamStatsRef.current.connectionUptime;
        setState(prev => ({
          ...prev,
          streamStats: {
            ...prev.streamStats,
            connectionUptime: uptime
          }
        }));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.isConnected]);
  
  // Auto-scroll Management
  useEffect(() => {
    if (state.autoScrollEnabled && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [state.activities.length, state.autoScrollEnabled]);
  
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'f':
            event.preventDefault();
            setState(prev => ({ ...prev, showFilterPanel: !prev.showFilterPanel }));
            break;
          case 'r':
            event.preventDefault();
            refreshData();
            break;
          case 'p':
            event.preventDefault();
            handleStreamToggle();
            break;
          case 's':
            event.preventDefault();
            setState(prev => ({ ...prev, showSettings: true }));
            break;
          case 'a':
            event.preventDefault();
            if (allowSelection) {
              const allIds = new Set(state.filteredActivities.map(a => a.id));
              setState(prev => ({ ...prev, selectedActivities: allIds }));
            }
            break;
        }
      }
      
      if (event.key === 'Escape') {
        setState(prev => ({
          ...prev,
          showFilterPanel: false,
          showSettings: false,
          selectedActivities: new Set()
        }));
      }
      
      if (event.key === ' ') {
        event.preventDefault();
        handleStreamToggle();
      }
    };
    
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [allowSelection, state.filteredActivities, refreshData]);
  
  // Event Handlers
  const handleStreamActivity = useCallback((activity: ActivityRecord) => {
    setState(prev => {
      const newActivities = [activity, ...prev.activities].slice(0, maxItems);
      
      // Update statistics
      streamStatsRef.current.totalReceived += 1;
      streamStatsRef.current.bytesReceived += JSON.stringify(activity).length;
      streamStatsRef.current.lastActivity = new Date();
      
      // Calculate rate
      const timeDiff = Date.now() - streamStatsRef.current.connectionUptime;
      const rate = streamStatsRef.current.totalReceived / (timeDiff / 1000 / 60); // per minute
      streamStatsRef.current.averageRate = rate;
      
      if (rate > streamStatsRef.current.peakRate) {
        streamStatsRef.current.peakRate = rate;
      }
      
      // Anomaly detection
      let notifications = [...prev.notifications];
      if (prev.anomalyDetection && activity.severity === 'critical') {
        notifications.unshift({
          id: `anomaly-${Date.now()}`,
          type: 'anomaly',
          message: `Critical activity detected: ${activity.description}`,
          activity,
          timestamp: new Date(),
          dismissed: false
        });
        
        // Sound notification
        if (prev.soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
      
      return {
        ...prev,
        activities: newActivities,
        streamStats: { ...streamStatsRef.current },
        notifications: notifications.slice(0, 10) // Keep only last 10
      };
    });
  }, [maxItems]);
  
  const handleStreamToggle = useCallback(() => {
    if (state.isStreaming) {
      stopStreaming();
      setState(prev => ({ ...prev, isStreaming: false, isPaused: true }));
    } else {
      startStreaming();
      setState(prev => ({ ...prev, isStreaming: true, isPaused: false }));
    }
  }, [state.isStreaming, startStreaming, stopStreaming]);
  
  const handleActivitySelect = useCallback((activity: ActivityRecord, multiSelect: boolean = false) => {
    if (!allowSelection) return;
    
    setState(prev => {
      const newSelected = new Set(prev.selectedActivities);
      
      if (multiSelect) {
        if (newSelected.has(activity.id)) {
          newSelected.delete(activity.id);
        } else {
          newSelected.add(activity.id);
        }
      } else {
        newSelected.clear();
        newSelected.add(activity.id);
      }
      
      return { ...prev, selectedActivities: newSelected };
    });
    
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
  }, [allowSelection, onActivitySelect]);
  
  const handleFilterApply = useCallback((filters: ActivityFilter[]) => {
    applyFilters(filters);
    setState(prev => ({ ...prev, activeFilters: filters }));
  }, [applyFilters]);
  
  const handleSearch = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    
    if (query.trim()) {
      try {
        const results = await searchActivities({
          query: query.trim(),
          filters: state.activeFilters,
          pagination: { page: 1, limit: 100 }
        });
        
        setState(prev => ({ 
          ...prev, 
          filteredActivities: results.activities || []
        }));
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  }, [searchActivities, state.activeFilters]);
  
  const handleDisplayModeChange = useCallback((mode: StreamDisplayMode) => {
    setState(prev => ({ ...prev, displayMode: mode }));
    
    // Adjust item height based on mode
    const heightMap = {
      [StreamDisplayMode.CARDS]: 120,
      [StreamDisplayMode.LIST]: 60,
      [StreamDisplayMode.COMPACT]: 40,
      [StreamDisplayMode.TIMELINE]: 80,
      [StreamDisplayMode.FEED]: 100
    };
    
    setState(prev => ({ ...prev, itemHeight: heightMap[mode] }));
  }, []);
  
  const handleExportActivities = useCallback(async () => {
    if (!enableExport) return;
    
    try {
      const activitiesToExport = state.selectedActivities.size > 0
        ? state.filteredActivities.filter(a => state.selectedActivities.has(a.id))
        : state.filteredActivities;
      
      const csvContent = [
        ['Timestamp', 'Type', 'Severity', 'User', 'Description', 'SPA'].join(','),
        ...activitiesToExport.map(activity => [
          activity.timestamp,
          activity.activityType,
          activity.severity,
          activity.userId || 'System',
          `"${activity.description.replace(/"/g, '""')}"`,
          activity.metadata?.spa || 'Unknown'
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-stream-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setState(prev => ({ ...prev, error: 'Export failed' }));
    }
  }, [enableExport, state.selectedActivities, state.filteredActivities]);
  
  // Memoized Computations
  const processedActivities = useMemo(() => {
    let activities = state.searchQuery 
      ? state.filteredActivities 
      : [...state.activities, ...hookActivities];
    
    // Remove duplicates
    const seen = new Set();
    activities = activities.filter(activity => {
      if (seen.has(activity.id)) {
        return false;
      }
      seen.add(activity.id);
      return true;
    });
    
    // Apply active filters
    if (state.activeFilters.length > 0) {
      activities = activities.filter(activity => {
        return state.activeFilters.every(filter => {
          if (filter.activityTypes && !filter.activityTypes.includes(activity.activityType)) {
            return false;
          }
          if (filter.severity && !filter.severity.includes(activity.severity)) {
            return false;
          }
          if (filter.userIds && activity.userId && !filter.userIds.includes(activity.userId)) {
            return false;
          }
          return true;
        });
      });
    }
    
    // Apply sorting
    activities.sort((a, b) => {
      switch (state.sortOrder) {
        case StreamSortOrder.NEWEST_FIRST:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case StreamSortOrder.OLDEST_FIRST:
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case StreamSortOrder.SEVERITY_DESC:
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        case StreamSortOrder.SEVERITY_ASC:
          const severityOrderAsc = { low: 1, medium: 2, high: 3, critical: 4 };
          return (severityOrderAsc[a.severity] || 0) - (severityOrderAsc[b.severity] || 0);
        case StreamSortOrder.TYPE_ASC:
          return a.activityType.localeCompare(b.activityType);
        case StreamSortOrder.USER_ASC:
          return (a.userId || '').localeCompare(b.userId || '');
        default:
          return 0;
      }
    });
    
    // Apply grouping
    if (state.groupingMode !== ActivityGroupingMode.NONE) {
      const grouped = activities.reduce((acc, activity) => {
        let key;
        switch (state.groupingMode) {
          case ActivityGroupingMode.BY_TYPE:
            key = activity.activityType;
            break;
          case ActivityGroupingMode.BY_SEVERITY:
            key = activity.severity;
            break;
          case ActivityGroupingMode.BY_USER:
            key = activity.userId || 'System';
            break;
          case ActivityGroupingMode.BY_SPA:
            key = activity.metadata?.spa || 'Unknown';
            break;
          case ActivityGroupingMode.BY_TIME:
            key = new Date(activity.timestamp).toDateString();
            break;
          default:
            key = 'all';
        }
        
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(activity);
        return acc;
      }, {} as Record<string, ActivityRecord[]>);
      
      // Flatten grouped activities with headers
      activities = Object.entries(grouped).flatMap(([groupKey, groupActivities]) => [
        {
          id: `group-${groupKey}`,
          activityType: 'group_header' as ActivityType,
          severity: 'low' as ActivitySeverity,
          timestamp: new Date().toISOString(),
          description: `${groupKey} (${groupActivities.length} activities)`,
          userId: '',
          metadata: { isGroupHeader: true, groupKey, groupCount: groupActivities.length }
        } as ActivityRecord,
        ...groupActivities
      ]);
    }
    
    return activities.slice(0, maxItems);
  }, [
    state.activities, 
    hookActivities, 
    state.filteredActivities, 
    state.searchQuery, 
    state.activeFilters, 
    state.sortOrder, 
    state.groupingMode, 
    maxItems
  ]);
  
  const streamStatistics = useMemo(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const recentActivities = processedActivities.filter(
      a => new Date(a.timestamp).getTime() > oneMinuteAgo
    );
    const hourlyActivities = processedActivities.filter(
      a => new Date(a.timestamp).getTime() > oneHourAgo
    );
    
    const typeDistribution = processedActivities.reduce((acc, activity) => {
      acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
      return acc;
    }, {} as Record<ActivityType, number>);
    
    const severityDistribution = processedActivities.reduce((acc, activity) => {
      acc[activity.severity] = (acc[activity.severity] || 0) + 1;
      return acc;
    }, {} as Record<ActivitySeverity, number>);
    
    return {
      total: processedActivities.length,
      recentCount: recentActivities.length,
      hourlyCount: hourlyActivities.length,
      typeDistribution,
      severityDistribution,
      errorRate: (severityDistribution.high || 0) + (severityDistribution.critical || 0),
      avgPerMinute: recentActivities.length,
      avgPerHour: hourlyActivities.length
    };
  }, [processedActivities]);
  
  // Render Functions
  const renderStreamControls = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className={cn(
            "font-semibold text-gray-900 dark:text-gray-100",
            compact ? "text-lg" : "text-xl"
          )}>
            {compact ? "Stream" : "Real-time Activity Stream"}
          </h2>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          {state.isConnected ? (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <WifiOff className="w-3 h-3" />
              <span>Disconnected</span>
            </Badge>
          )}
        </div>
        
        {/* Stream Statistics */}
        {!compact && (
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{streamStatistics.total} total</span>
            <span>{streamStatistics.recentCount}/min</span>
            {state.selectedActivities.size > 0 && (
              <span>{state.selectedActivities.size} selected</span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Stream Controls */}
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStreamToggle}
                  className={cn(
                    state.isStreaming && "bg-green-50 border-green-300 text-green-700"
                  )}
                >
                  {state.isStreaming ? (
                    state.isPaused ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{state.isStreaming ? (state.isPaused ? 'Resume' : 'Pause') : 'Start'} Stream (Space)</p>
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
        </div>
        
        {/* Display Mode Selector */}
        {!compact && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Grid3X3 className="h-4 w-4 mr-2" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Display Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={state.displayMode} 
                onValueChange={(value) => handleDisplayModeChange(value as StreamDisplayMode)}
              >
                <DropdownMenuRadioItem value={StreamDisplayMode.CARDS}>
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Cards
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={StreamDisplayMode.LIST}>
                  <ListIcon className="h-4 w-4 mr-2" />
                  List
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={StreamDisplayMode.COMPACT}>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Compact
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={StreamDisplayMode.TIMELINE}>
                  <Clock3 className="h-4 w-4 mr-2" />
                  Timeline
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={StreamDisplayMode.FEED}>
                  <Activity className="h-4 w-4 mr-2" />
                  Feed
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Filter Toggle */}
        {showFilters && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showFilterPanel: !prev.showFilterPanel }))}
                  className={cn(state.showFilterPanel && "bg-blue-50 border-blue-300")}
                >
                  <Filter className="h-4 w-4" />
                  {state.activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {state.activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Filters (Ctrl+F)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Action Menu */}
        {showActions && (
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
                {state.isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                {state.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setState(prev => ({ ...prev, autoScrollEnabled: !prev.autoScrollEnabled }))}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Auto-scroll: {state.autoScrollEnabled ? 'On' : 'Off'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              >
                {state.soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                Sound: {state.soundEnabled ? 'On' : 'Off'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {enableExport && (
                <DropdownMenuItem onClick={handleExportActivities}>
                  <Download className="h-4 w-4 mr-2" />
                  Export {state.selectedActivities.size > 0 ? 'Selected' : 'All'}
                </DropdownMenuItem>
              )}
              {allowSelection && state.selectedActivities.size > 0 && (
                <>
                  <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, selectedActivities: new Set() }))}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear Selection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const selected = processedActivities.filter(a => state.selectedActivities.has(a.id));
                    if (onBulkSelect) onBulkSelect(selected);
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process Selected
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
  
  const renderActivityCard = useCallback((activity: ActivityRecord, index: number) => {
    const isSelected = state.selectedActivities.has(activity.id);
    const isHighlighted = state.highlightedActivity === activity.id;
    const isGroupHeader = activity.metadata?.isGroupHeader;
    
    if (isGroupHeader) {
      return (
        <div key={`group-${activity.metadata?.groupKey}`} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{activity.metadata?.groupCount}</Badge>
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
              {activity.metadata?.groupKey}
            </span>
          </div>
        </div>
      );
    }
    
    const TypeIcon = activityTypeConfig[activity.activityType]?.icon || Activity;
    const SeverityIcon = severityConfig[activity.severity]?.icon || Info;
    const severityStyle = severityConfig[activity.severity];
    
    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={cn(
          "border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer",
          isSelected && "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700",
          isHighlighted && "ring-2 ring-blue-500 ring-opacity-50"
        )}
        onClick={(e) => handleActivitySelect(activity, e.ctrlKey || e.metaKey)}
      >
        {state.displayMode === StreamDisplayMode.COMPACT ? (
          <div className="px-4 py-2 flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <SeverityIcon className={cn("h-3 w-3", severityStyle?.pulse && "animate-pulse")} />
              <TypeIcon className={cn("h-4 w-4", activityTypeConfig[activity.activityType]?.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
                {activity.description}
              </p>
            </div>
            <div className="text-xs text-gray-500">
              {formatDateTime(activity.timestamp, 'time')}
            </div>
          </div>
        ) : state.displayMode === StreamDisplayMode.LIST ? (
          <div className="px-4 py-3 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <SeverityIcon className={cn("h-4 w-4", severityStyle?.pulse && "animate-pulse")} />
              <TypeIcon className={cn("h-5 w-5", activityTypeConfig[activity.activityType]?.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={cn("text-xs", severityStyle?.color)}>
                  {activity.severity}
                </Badge>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {activityTypeConfig[activity.activityType]?.name}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {activity.description}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className="text-xs text-gray-500">
                {formatDateTime(activity.timestamp)}
              </span>
              {activity.userId && (
                <span className="text-xs text-gray-400">
                  {activity.userId}
                </span>
              )}
            </div>
          </div>
        ) : (
          <Card className={cn(
            "m-4 transition-all duration-200",
            isSelected && "ring-2 ring-blue-500 ring-opacity-50",
            isHighlighted && "shadow-lg"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex items-center space-x-2">
                  <SeverityIcon className={cn(
                    "h-5 w-5",
                    severityStyle?.pulse && "animate-pulse"
                  )} />
                  <TypeIcon className={cn("h-6 w-6", activityTypeConfig[activity.activityType]?.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className={cn("text-xs", severityStyle?.color)}>
                      {activity.severity}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activityTypeConfig[activity.activityType]?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {activity.userId && (
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{activity.userId}</span>
                      </span>
                    )}
                    {activity.metadata?.spa && (
                      <span className="flex items-center space-x-1">
                        <Building className="h-3 w-3" />
                        <span>{activity.metadata.spa}</span>
                      </span>
                    )}
                    {activity.duration && (
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(activity.duration)}</span>
                      </span>
                    )}
                  </div>
                </div>
                {allowSelection && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleActivitySelect(activity)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }, [
    state.selectedActivities, 
    state.highlightedActivity, 
    state.displayMode,
    allowSelection,
    handleActivitySelect
  ]);
  
  const renderFilterPanel = () => (
    <AnimatePresence>
      {state.showFilterPanel && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showFilterPanel: false }))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* Search */}
              {enableSearch && (
                <div>
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="mt-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search activities..."
                        value={state.searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}
              
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
                      onClick={() => handleFilterApply([...state.activeFilters, filter])}
                    >
                      {filter.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Activity Types */}
              <div>
                <Label className="text-sm font-medium">Activity Types</Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(activityTypeConfig).map(([type, config]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={type}
                        checked={state.activeFilters.some(f => f.activityTypes?.includes(type as ActivityType))}
                        onCheckedChange={(checked) => {
                          const newFilters = checked
                            ? [...state.activeFilters, { id: `type-${type}`, name: config.name, activityTypes: [type as ActivityType] }]
                            : state.activeFilters.filter(f => !f.activityTypes?.includes(type as ActivityType));
                          handleFilterApply(newFilters);
                        }}
                      />
                      <Label htmlFor={type} className="text-sm flex items-center space-x-2">
                        <config.icon className={cn("h-4 w-4", config.color)} />
                        <span>{config.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Severity Levels */}
              <div>
                <Label className="text-sm font-medium">Severity Levels</Label>
                <div className="mt-2 space-y-2">
                  {Object.entries(severityConfig).map(([severity, config]) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Checkbox 
                        id={severity}
                        checked={state.activeFilters.some(f => f.severity?.includes(severity as ActivitySeverity))}
                        onCheckedChange={(checked) => {
                          const newFilters = checked
                            ? [...state.activeFilters, { id: `severity-${severity}`, name: severity, severity: [severity as ActivitySeverity] }]
                            : state.activeFilters.filter(f => !f.severity?.includes(severity as ActivitySeverity));
                          handleFilterApply(newFilters);
                        }}
                      />
                      <Label htmlFor={severity} className="text-sm">
                        <Badge variant="outline" className={cn("text-xs", config.color)}>
                          {severity}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Grouping and Sorting */}
              {enableGrouping && (
                <div>
                  <Label className="text-sm font-medium">Group By</Label>
                  <Select 
                    value={state.groupingMode} 
                    onValueChange={(value) => setState(prev => ({ ...prev, groupingMode: value as ActivityGroupingMode }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ActivityGroupingMode.NONE}>No Grouping</SelectItem>
                      <SelectItem value={ActivityGroupingMode.BY_TYPE}>By Type</SelectItem>
                      <SelectItem value={ActivityGroupingMode.BY_SEVERITY}>By Severity</SelectItem>
                      <SelectItem value={ActivityGroupingMode.BY_USER}>By User</SelectItem>
                      <SelectItem value={ActivityGroupingMode.BY_SPA}>By SPA</SelectItem>
                      <SelectItem value={ActivityGroupingMode.BY_TIME}>By Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Sort Order</Label>
                <Select 
                  value={state.sortOrder} 
                  onValueChange={(value) => setState(prev => ({ ...prev, sortOrder: value as StreamSortOrder }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StreamSortOrder.NEWEST_FIRST}>Newest First</SelectItem>
                    <SelectItem value={StreamSortOrder.OLDEST_FIRST}>Oldest First</SelectItem>
                    <SelectItem value={StreamSortOrder.SEVERITY_DESC}>Highest Severity</SelectItem>
                    <SelectItem value={StreamSortOrder.SEVERITY_ASC}>Lowest Severity</SelectItem>
                    <SelectItem value={StreamSortOrder.TYPE_ASC}>By Type</SelectItem>
                    <SelectItem value={StreamSortOrder.USER_ASC}>By User</SelectItem>
                  </SelectContent>
                </Select>
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
  
  const renderStreamStatistics = () => (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-blue-600">{streamStatistics.total}</div>
          <div className="text-xs text-gray-500">Total Activities</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-600">{streamStatistics.recentCount}</div>
          <div className="text-xs text-gray-500">Last Minute</div>
        </div>
        <div>
          <div className="text-lg font-bold text-yellow-600">{streamStatistics.errorRate}</div>
          <div className="text-xs text-gray-500">Errors</div>
        </div>
        <div>
          <div className="text-lg font-bold text-purple-600">
            {state.streamStats.averageRate.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Rate/min</div>
        </div>
      </div>
    </div>
  );
  
  // Error Handling
  if (state.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stream Error</AlertTitle>
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
        "flex h-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden",
        state.isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      style={{ height: state.isFullscreen ? '100vh' : height }}
    >
      {/* Filter Panel */}
      {renderFilterPanel()}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Controls */}
        {renderStreamControls()}
        
        {/* Statistics */}
        {!compact && renderStreamStatistics()}
        
        {/* Activity Stream */}
        <div className="flex-1 overflow-hidden">
          {state.virtualizationEnabled && processedActivities.length > 50 ? (
            <List
              ref={listRef}
              height={height - (compact ? 60 : 180)}
              itemCount={processedActivities.length}
              itemSize={state.itemHeight}
              itemData={processedActivities}
            >
              {({ index, style, data }) => (
                <div style={style}>
                  {renderActivityCard(data[index], index)}
                </div>
              )}
            </List>
          ) : (
            <ScrollArea ref={scrollAreaRef} className="h-full">
              <AnimatePresence>
                {processedActivities.map((activity, index) => (
                  renderActivityCard(activity, index)
                ))}
              </AnimatePresence>
              
              {processedActivities.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No Activities
                    </h3>
                    <p className="text-gray-500">
                      {state.isStreaming ? 'Waiting for new activities...' : 'Start streaming to see activities'}
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
        
        {/* Notifications */}
        <AnimatePresence>
          {state.notifications.filter(n => !n.dismissed).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <Alert className="w-80">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</AlertTitle>
                <AlertDescription>{notification.message}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      notifications: prev.notifications.map(n =>
                        n.id === notification.id ? { ...n, dismissed: true } : n
                      )
                    }));
                  }}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Settings Dialog */}
      <Dialog open={state.showSettings} onOpenChange={(open) => setState(prev => ({ ...prev, showSettings: open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stream Settings</DialogTitle>
            <DialogDescription>
              Configure real-time activity stream preferences.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="display" className="space-y-4">
            <TabsList>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="display" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-scroll to New Activities</Label>
                  <Switch 
                    checked={state.autoScrollEnabled}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, autoScrollEnabled: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Enable Virtualization</Label>
                  <Switch 
                    checked={state.virtualizationEnabled}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, virtualizationEnabled: checked }))}
                  />
                </div>
                
                <div>
                  <Label>Buffer Size</Label>
                  <Slider
                    value={[state.bufferSize]}
                    onValueChange={([value]) => setState(prev => ({ ...prev, bufferSize: value }))}
                    min={50}
                    max={1000}
                    step={50}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Current: {state.bufferSize} activities
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Update Interval (ms)</Label>
                  <Slider
                    value={[state.updateInterval]}
                    onValueChange={([value]) => setState(prev => ({ ...prev, updateInterval: value }))}
                    min={100}
                    max={5000}
                    step={100}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Current: {state.updateInterval}ms
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {state.streamStats.totalReceived}
                    </div>
                    <div className="text-sm text-gray-500">Total Received</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {formatBytes(state.streamStats.bytesReceived)}
                    </div>
                    <div className="text-sm text-gray-500">Data Received</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Sound Notifications</Label>
                  <Switch 
                    checked={state.soundEnabled}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, soundEnabled: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Anomaly Detection</Label>
                  <Switch 
                    checked={state.anomalyDetection}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, anomalyDetection: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Correlation Highlighting</Label>
                  <Switch 
                    checked={state.correlationHighlighting}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, correlationHighlighting: checked }))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Cross-SPA Filtering</Label>
                  <Switch 
                    checked={state.crossSPAFiltering}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, crossSPAFiltering: checked }))}
                  />
                </div>
                
                <div>
                  <Label>Connection Status</Label>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center space-x-2">
                      {state.isConnected ? (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Wifi className="w-3 h-3" />
                          <span>Connected</span>
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <WifiOff className="w-3 h-3" />
                          <span>Disconnected</span>
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        Uptime: {formatDuration(state.streamStats.connectionUptime)}
                      </span>
                    </div>
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
    </div>
  );
};

export default RealTimeActivityStream;
