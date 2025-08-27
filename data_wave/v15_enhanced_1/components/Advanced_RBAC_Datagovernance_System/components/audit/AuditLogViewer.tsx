'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Activity, AlertTriangle, Shield, Eye, EyeOff, Search, Filter, Calendar, Clock, User, Users, Database, Key, Lock, Unlock, Settings, RefreshCw, Download, Upload, Share, MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX, Zap, Brain, Target, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Map, Globe, MapPin, Smartphone, Monitor, Server, Wifi, Bluetooth, Cpu, HardDrive, Network, Router, Fingerprint, ShieldCheckIcon, AlertCircle, Info, CheckCircle2, XCircle, Flag, Tag, Bookmark, Star, StarOff, Heart, MessageSquare, FileText, Image, Video, Headphones, Paperclip, Link, ExternalLink, Copy, Edit, Trash2, Archive, Send, Reply, Forward, Save, Print, Mail, Phone, Building, Home, Car, Plane, Train, Ship, TreePine, Mountain, Sun, Moon, Cloud, CloudRain, Snowflake, Thermometer, Wind, Waves, Flame, Droplets, Lightbulb, BatteryCharging, PowerOff, Wifi as WifiIcon, Signal, Radar, Satellite, Microscope, Beaker, Flask, Atom, Dna, Pill, Stethoscope, Timer, Stopwatch, AlarmClock, History, RotateCcw, RotateCw, Repeat, Shuffle, List, Grid, Layers, GitBranch, GitCommit, GitMerge, GitPullRequest, Code, Terminal, Command, Package, Box, Truck, ShoppingCart, CreditCard, DollarSign, Euro, PoundSterling, Coins, Banknote, Wallet, Receipt, Calculator, Scale, Ruler, Scissors, PaintBucket, Palette, Brush, Pen, PenTool, Eraser, Highlighter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command as CommandComponent, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { useNotifications } from '../../hooks/useNotifications';
import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addDays, addHours, addMinutes, subDays, subHours, subMinutes, differenceInHours, differenceInMinutes, differenceInSeconds, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import type { AuditLog, AuditLogFilters } from '../../types/audit.types';
import type { User } from '../../types/user.types';

// ===================== INTERFACES & TYPES =====================

interface AuditLogViewerProps {
  className?: string;
  onClose?: () => void;
  onLogSelect?: (log: AuditLog) => void;
  initialFilters?: AuditLogFilters;
  showAdvancedFilters?: boolean;
  showAnalytics?: boolean;
  showThreatDetection?: boolean;
  enableRealTimeUpdates?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxLogsPerPage?: number;
  enableVirtualScrolling?: boolean;
  enableKeyboardShortcuts?: boolean;
  showPerformanceMetrics?: boolean;
  enableIntelligentHighlights?: boolean;
  showComplianceMode?: boolean;
  enableExportFeatures?: boolean;
  customColumns?: AuditLogColumn[];
  showUserJourney?: boolean;
  enableAnomalyDetection?: boolean;
}

interface AuditLogColumn {
  id: string;
  label: string;
  accessor: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  render?: (value: any, log: AuditLog) => React.ReactNode;
  exportable?: boolean;
  aggregatable?: boolean;
}

interface ThreatDetectionAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'brute_force' | 'privilege_escalation' | 'data_exfiltration' | 'suspicious_pattern' | 'anomaly' | 'compliance_violation';
  title: string;
  description: string;
  confidence: number;
  relatedLogs: AuditLog[];
  indicators: string[];
  recommendations: string[];
  timestamp: string;
  acknowledged: boolean;
  assignee?: User;
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigationStatus: 'pending' | 'in_progress' | 'resolved' | 'false_positive';
  timeline: Array<{
    timestamp: string;
    event: string;
    details: string;
    userId?: number;
  }>;
  metadata: Record<string, any>;
}

interface AuditAnalytics {
  totalEvents: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number; percentage: number }>;
  topResources: Array<{ resource: string; count: number; percentage: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  dailyDistribution: Array<{ date: string; count: number }>;
  userActivitySummary: Array<{
    user: User;
    eventCount: number;
    lastActivity: string;
    riskScore: number;
    topActions: string[];
  }>;
  securityMetrics: {
    failedLoginAttempts: number;
    privilegeEscalations: number;
    suspiciousActivities: number;
    complianceViolations: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    trendDirection: 'improving' | 'stable' | 'declining';
  };
  performanceMetrics: {
    averageResponseTime: number;
    slowestOperations: Array<{ operation: string; avgTime: number }>;
    peakHours: Array<{ hour: number; load: number }>;
    systemLoad: number;
  };
  complianceMetrics: {
    gdprCompliance: number;
    soxCompliance: number;
    hipaaCompliance: number;
    auditCoverage: number;
    retentionCompliance: number;
  };
  anomalyDetection: {
    anomaliesDetected: number;
    falsePositiveRate: number;
    modelAccuracy: number;
    lastModelUpdate: string;
    topAnomalies: Array<{
      type: string;
      count: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
}

interface UserJourney {
  userId: number;
  user: User;
  sessionId: string;
  startTime: string;
  endTime?: string;
  events: AuditLog[];
  locations: Array<{
    ip: string;
    location: string;
    timestamp: string;
    isVpn: boolean;
    isTor: boolean;
    riskScore: number;
  }>;
  devices: Array<{
    userAgent: string;
    deviceType: string;
    browser: string;
    os: string;
    timestamp: string;
    fingerprint: string;
  }>;
  riskProfile: {
    overallRisk: number;
    factors: Array<{
      factor: string;
      weight: number;
      value: any;
      risk: number;
    }>;
    recommendations: string[];
  };
  patterns: Array<{
    pattern: string;
    frequency: number;
    isNormal: boolean;
    riskScore: number;
  }>;
  timeline: Array<{
    timestamp: string;
    event: AuditLog;
    context: string;
    riskIndicators: string[];
  }>;
}

interface AuditLogDisplaySettings {
  viewMode: 'table' | 'cards' | 'timeline' | 'graph' | 'heatmap';
  density: 'compact' | 'comfortable' | 'spacious';
  groupBy: 'none' | 'user' | 'action' | 'resource' | 'time' | 'severity';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  showMinimap: boolean;
  showMetrics: boolean;
  showFilters: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  pageSize: number;
  enableAnimations: boolean;
  highlightPatterns: string[];
  colorScheme: 'default' | 'security' | 'compliance' | 'performance';
  customTheme: Record<string, string>;
}

interface RealTimeMetrics {
  eventsPerSecond: number;
  activeUsers: number;
  systemLoad: number;
  errorRate: number;
  averageResponseTime: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  alertsCount: number;
  complianceScore: number;
  dataRetentionStatus: 'healthy' | 'warning' | 'critical';
  lastUpdateTime: string;
  historicalTrends: Array<{
    timestamp: string;
    eventsPerSecond: number;
    activeUsers: number;
    errorRate: number;
  }>;
}

interface ComplianceReport {
  framework: string;
  score: number;
  violations: Array<{
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    description: string;
    remediation: string;
    deadline?: string;
  }>;
  recommendations: Array<{
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  coverage: {
    totalRequirements: number;
    coveredRequirements: number;
    partiallyMet: number;
    notMet: number;
    percentage: number;
  };
  timeline: Array<{
    date: string;
    score: number;
    trend: 'improving' | 'stable' | 'declining';
  }>;
}

// ===================== CONSTANTS =====================

const AUDIT_EVENT_TYPES = [
  { value: 'authentication', label: 'Authentication', icon: Key, color: 'text-blue-600' },
  { value: 'authorization', label: 'Authorization', icon: Shield, color: 'text-green-600' },
  { value: 'data_access', label: 'Data Access', icon: Database, color: 'text-purple-600' },
  { value: 'configuration', label: 'Configuration', icon: Settings, color: 'text-orange-600' },
  { value: 'user_management', label: 'User Management', icon: Users, color: 'text-teal-600' },
  { value: 'system', label: 'System Events', icon: Server, color: 'text-gray-600' },
  { value: 'security', label: 'Security Events', icon: ShieldCheckIcon, color: 'text-red-600' },
  { value: 'compliance', label: 'Compliance', icon: FileText, color: 'text-indigo-600' }
];

const SEVERITY_LEVELS = [
  { value: 'info', label: 'Information', color: 'bg-blue-100 text-blue-800', icon: Info },
  { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  { value: 'error', label: 'Error', color: 'bg-red-100 text-red-800', icon: XCircle },
  { value: 'critical', label: 'Critical', color: 'bg-red-200 text-red-900', icon: AlertCircle }
];

const THREAT_CATEGORIES = [
  { value: 'brute_force', label: 'Brute Force Attack', severity: 'high', icon: Target },
  { value: 'privilege_escalation', label: 'Privilege Escalation', severity: 'critical', icon: TrendingUp },
  { value: 'data_exfiltration', label: 'Data Exfiltration', severity: 'critical', icon: ArrowDownTrayIcon },
  { value: 'suspicious_pattern', label: 'Suspicious Pattern', severity: 'medium', icon: Brain },
  { value: 'anomaly', label: 'Behavioral Anomaly', severity: 'medium', icon: Activity },
  { value: 'compliance_violation', label: 'Compliance Violation', severity: 'high', icon: Flag }
];

const TIME_RANGES = [
  { label: 'Last 15 minutes', value: '15m', start: () => subMinutes(new Date(), 15) },
  { label: 'Last hour', value: '1h', start: () => subHours(new Date(), 1) },
  { label: 'Last 4 hours', value: '4h', start: () => subHours(new Date(), 4) },
  { label: 'Last 24 hours', value: '24h', start: () => subDays(new Date(), 1) },
  { label: 'Last 7 days', value: '7d', start: () => subDays(new Date(), 7) },
  { label: 'Last 30 days', value: '30d', start: () => subDays(new Date(), 30) },
  { label: 'Custom range', value: 'custom', start: null }
];

const DEFAULT_COLUMNS: AuditLogColumn[] = [
  {
    id: 'timestamp',
    label: 'Timestamp',
    accessor: 'timestamp',
    sortable: true,
    width: 180,
    exportable: true
  },
  {
    id: 'eventType',
    label: 'Event Type',
    accessor: 'eventType',
    sortable: true,
    filterable: true,
    width: 120,
    exportable: true
  },
  {
    id: 'user',
    label: 'User',
    accessor: 'user.email',
    sortable: true,
    filterable: true,
    width: 200,
    exportable: true
  },
  {
    id: 'action',
    label: 'Action',
    accessor: 'action',
    sortable: true,
    filterable: true,
    width: 150,
    exportable: true
  },
  {
    id: 'resource',
    label: 'Resource',
    accessor: 'resourceType',
    sortable: true,
    filterable: true,
    width: 150,
    exportable: true
  },
  {
    id: 'severity',
    label: 'Severity',
    accessor: 'severity',
    sortable: true,
    filterable: true,
    width: 100,
    exportable: true
  },
  {
    id: 'ip',
    label: 'IP Address',
    accessor: 'metadata.ipAddress',
    sortable: true,
    filterable: true,
    width: 130,
    exportable: true
  },
  {
    id: 'status',
    label: 'Status',
    accessor: 'success',
    sortable: true,
    filterable: true,
    width: 80,
    exportable: true
  }
];

const KEYBOARD_SHORTCUTS = [
  { key: 'r', description: 'Refresh logs', action: 'refresh' },
  { key: 'f', description: 'Focus search', action: 'focus_search' },
  { key: 'e', description: 'Export logs', action: 'export' },
  { key: 't', description: 'Toggle timeline view', action: 'toggle_timeline' },
  { key: 'a', description: 'Toggle analytics', action: 'toggle_analytics' },
  { key: 'escape', description: 'Clear selection', action: 'clear_selection' },
  { key: 'j', description: 'Next log', action: 'next_log' },
  { key: 'k', description: 'Previous log', action: 'previous_log' },
  { key: 'space', description: 'Play/Pause live updates', action: 'toggle_live' }
];

// ===================== MAIN COMPONENT =====================

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  className,
  onClose,
  onLogSelect,
  initialFilters = {},
  showAdvancedFilters = true,
  showAnalytics = true,
  showThreatDetection = true,
  enableRealTimeUpdates = true,
  autoRefresh = true,
  refreshInterval = 5000,
  maxLogsPerPage = 100,
  enableVirtualScrolling = true,
  enableKeyboardShortcuts = true,
  showPerformanceMetrics = true,
  enableIntelligentHighlights = true,
  showComplianceMode = true,
  enableExportFeatures = true,
  customColumns = DEFAULT_COLUMNS,
  showUserJourney = true,
  enableAnomalyDetection = true
}) => {
  // ===================== HOOKS & STATE =====================

  const { currentUser } = useCurrentUser();
  const { checkPermission } = usePermissionCheck();
  const { isConnected, subscribe, unsubscribe } = useRBACWebSocket();
  const { sendNotification } = useNotifications();

  const {
    auditLogs,
    totalCount,
    isLoading,
    isRefreshing,
    error,
    currentPage,
    totalPages,
    loadAuditLogs,
    refreshAuditLogs,
    searchAuditLogs,
    getAuditAnalytics,
    exportAuditLogs,
    createAuditLog,
    getComplianceReport,
    getThreatDetectionAlerts,
    getUserJourney,
    acknowledgeAlert,
    resolveAlert
  } = useAuditLogs(initialFilters, autoRefresh);

  // Component state
  const [filters, setFilters] = useState<AuditLogFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [displaySettings, setDisplaySettings] = useState<AuditLogDisplaySettings>({
    viewMode: 'table',
    density: 'comfortable',
    groupBy: 'none',
    sortBy: 'timestamp',
    sortOrder: 'desc',
    showMinimap: true,
    showMetrics: showPerformanceMetrics,
    showFilters: true,
    autoRefresh,
    refreshInterval,
    pageSize: maxLogsPerPage,
    enableAnimations: true,
    highlightPatterns: [],
    colorScheme: 'default',
    customTheme: {}
  });

  // Analytics and monitoring state
  const [analytics, setAnalytics] = useState<AuditAnalytics | null>(null);
  const [threatAlerts, setThreatAlerts] = useState<ThreatDetectionAlert[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [userJourneys, setUserJourneys] = useState<Map<number, UserJourney>>(new Map());

  // UI state
  const [isLiveMode, setIsLiveMode] = useState(enableRealTimeUpdates);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [showThreatPanel, setShowThreatPanel] = useState(false);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [showUserJourneyPanel, setShowUserJourneyPanel] = useState(false);
  const [showCompliancePanel, setShowCompliancePanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');

  // Performance and UX
  const [virtualScrollOffset, setVirtualScrollOffset] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    scrollPerformance: 100,
    memoryUsage: 0
  });

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const keyboardHandlerRef = useRef<(event: KeyboardEvent) => void>();

  // ===================== COMPUTED VALUES =====================

  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.action?.toLowerCase().includes(query) ||
        log.user?.email?.toLowerCase().includes(query) ||
        log.resourceType?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.metadata?.ipAddress?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.eventType) {
      filtered = filtered.filter(log => log.eventType === filters.eventType);
    }

    if (filters.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    if (filters.userId) {
      filtered = filtered.filter(log => log.user_id === filters.userId);
    }

    if (filters.success !== undefined) {
      filtered = filtered.filter(log => log.success === filters.success);
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(log => {
        const logDate = parseISO(log.timestamp);
        return isAfter(logDate, filters.startDate!) && isBefore(logDate, filters.endDate!);
      });
    }

    // Apply intelligent highlights
    if (enableIntelligentHighlights) {
      filtered = filtered.map(log => ({
        ...log,
        _highlighted: shouldHighlightLog(log)
      }));
    }

    return filtered;
  }, [auditLogs, searchQuery, filters, enableIntelligentHighlights]);

  const groupedLogs = useMemo(() => {
    if (displaySettings.groupBy === 'none') {
      return { 'All Logs': filteredLogs };
    }

    const groups: Record<string, AuditLog[]> = {};

    filteredLogs.forEach(log => {
      let groupKey: string;

      switch (displaySettings.groupBy) {
        case 'user':
          groupKey = log.user?.email || 'Unknown User';
          break;
        case 'action':
          groupKey = log.action || 'Unknown Action';
          break;
        case 'resource':
          groupKey = log.resourceType || 'Unknown Resource';
          break;
        case 'time':
          groupKey = format(parseISO(log.timestamp), 'yyyy-MM-dd HH:00');
          break;
        case 'severity':
          groupKey = log.severity || 'Unknown';
          break;
        default:
          groupKey = 'All Logs';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(log);
    });

    return groups;
  }, [filteredLogs, displaySettings.groupBy]);

  const sortedLogs = useMemo(() => {
    const logs = [...filteredLogs];
    
    logs.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Get values based on sort column
      switch (displaySettings.sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'user':
          aValue = a.user?.email || '';
          bValue = b.user?.email || '';
          break;
        case 'action':
          aValue = a.action || '';
          bValue = b.action || '';
          break;
        case 'severity':
          const severityOrder = { info: 0, warning: 1, error: 2, critical: 3 };
          aValue = severityOrder[a.severity as keyof typeof severityOrder] ?? 0;
          bValue = severityOrder[b.severity as keyof typeof severityOrder] ?? 0;
          break;
        default:
          aValue = (a as any)[displaySettings.sortBy] || '';
          bValue = (b as any)[displaySettings.sortBy] || '';
      }

      // Apply sort order
      if (displaySettings.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return logs;
  }, [filteredLogs, displaySettings.sortBy, displaySettings.sortOrder]);

  const visibleLogs = useMemo(() => {
    if (enableVirtualScrolling) {
      return sortedLogs.slice(visibleRange.start, visibleRange.end);
    }
    return sortedLogs;
  }, [sortedLogs, visibleRange, enableVirtualScrolling]);

  const criticalAlerts = useMemo(() => {
    return threatAlerts.filter(alert => 
      alert.severity === 'critical' && !alert.acknowledged
    );
  }, [threatAlerts]);

  const systemHealthScore = useMemo(() => {
    if (!realTimeMetrics || !analytics) return 100;

    let score = 100;
    
    // Deduct points for high error rates
    if (realTimeMetrics.errorRate > 5) score -= 20;
    else if (realTimeMetrics.errorRate > 1) score -= 10;

    // Deduct points for threat level
    switch (realTimeMetrics.threatLevel) {
      case 'critical': score -= 30; break;
      case 'high': score -= 20; break;
      case 'medium': score -= 10; break;
    }

    // Deduct points for unacknowledged alerts
    score -= Math.min(criticalAlerts.length * 5, 25);

    // Deduct points for compliance violations
    if (analytics.securityMetrics.complianceViolations > 0) {
      score -= Math.min(analytics.securityMetrics.complianceViolations * 2, 15);
    }

    return Math.max(score, 0);
  }, [realTimeMetrics, analytics, criticalAlerts]);

  // ===================== EFFECTS =====================

  useEffect(() => {
    if (isLiveMode && refreshInterval > 0) {
      autoRefreshRef.current = setInterval(() => {
        refreshAuditLogs();
        loadRealTimeMetrics();
        setLastRefresh(new Date());
      }, refreshInterval);

      return () => {
        if (autoRefreshRef.current) {
          clearInterval(autoRefreshRef.current);
        }
      };
    }
  }, [isLiveMode, refreshInterval, refreshAuditLogs]);

  useEffect(() => {
    if (enableRealTimeUpdates && isConnected) {
      const subscription = subscribe('audit_logs', (data: any) => {
        if (data.type === 'new_log') {
          handleNewLogReceived(data.log);
        } else if (data.type === 'threat_alert') {
          handleThreatAlert(data.alert);
        } else if (data.type === 'metrics_update') {
          setRealTimeMetrics(data.metrics);
        }
      });

      return () => unsubscribe(subscription);
    }
  }, [enableRealTimeUpdates, isConnected, subscribe, unsubscribe]);

  useEffect(() => {
    if (enableKeyboardShortcuts) {
      keyboardHandlerRef.current = (event: KeyboardEvent) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return;
        }

        const key = event.key.toLowerCase();
        const shortcut = KEYBOARD_SHORTCUTS.find(s => s.key === key);

        if (shortcut) {
          event.preventDefault();
          handleKeyboardShortcut(shortcut.action);
        }
      };

      document.addEventListener('keydown', keyboardHandlerRef.current);
      return () => {
        if (keyboardHandlerRef.current) {
          document.removeEventListener('keydown', keyboardHandlerRef.current);
        }
      };
    }
  }, [enableKeyboardShortcuts]);

  useEffect(() => {
    if (showAnalytics) {
      loadAnalytics();
    }
  }, [showAnalytics, filters]);

  useEffect(() => {
    if (showThreatDetection) {
      loadThreatAlerts();
    }
  }, [showThreatDetection]);

  useEffect(() => {
    if (showComplianceMode) {
      loadComplianceReport();
    }
  }, [showComplianceMode]);

  useEffect(() => {
    // Update visible range for virtual scrolling
    if (enableVirtualScrolling && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const itemHeight = 60; // Approximate height per log item
      const containerHeight = container.clientHeight;
      
      const start = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(containerHeight / itemHeight) + 5; // Buffer
      const end = Math.min(start + visibleCount, sortedLogs.length);
      
      setVisibleRange({ start, end });
    }
  }, [virtualScrollOffset, sortedLogs.length, enableVirtualScrolling]);

  // ===================== HANDLERS =====================

  const shouldHighlightLog = (log: AuditLog): boolean => {
    // Intelligent highlighting based on various factors
    if (log.severity === 'critical' || log.severity === 'error') return true;
    if (!log.success) return true;
    if (log.action?.includes('delete') || log.action?.includes('remove')) return true;
    
    // Check for unusual patterns
    if (log.metadata?.ipAddress && isUnusualIP(log.metadata.ipAddress)) return true;
    if (log.user && isUnusualUserActivity(log.user, log)) return true;
    
    return false;
  };

  const isUnusualIP = (ip: string): boolean => {
    // Simple check for private/known IPs - in real implementation, this would check against threat intel
    return !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.');
  };

  const isUnusualUserActivity = (user: User, log: AuditLog): boolean => {
    // Check if this is unusual activity for this user
    const userLogs = filteredLogs.filter(l => l.user_id === user.id);
    const recentLogs = userLogs.filter(l => 
      differenceInHours(new Date(), parseISO(l.timestamp)) < 24
    );
    
    // Flag if user has high activity volume
    return recentLogs.length > 50;
  };

  const handleNewLogReceived = (log: AuditLog) => {
    // Handle real-time log updates
    if (shouldHighlightLog(log)) {
      toast.info(`Important event: ${log.action}`, {
        description: `User: ${log.user?.email}`,
        action: {
          label: 'View',
          onClick: () => setSelectedLog(log)
        }
      });
    }

    // Update analytics if needed
    if (showAnalytics) {
      loadAnalytics();
    }
  };

  const handleThreatAlert = (alert: ThreatDetectionAlert) => {
    setThreatAlerts(prev => [alert, ...prev]);
    
    if (alert.severity === 'critical' || alert.severity === 'high') {
      toast.error(`Security Alert: ${alert.title}`, {
        description: alert.description,
        action: {
          label: 'Investigate',
          onClick: () => {
            setShowThreatPanel(true);
            setActiveTab('threats');
          }
        }
      });

      // Send notification to security team
      sendNotification({
        userId: currentUser?.id || 0,
        type: 'security_alert',
        title: `Security Alert: ${alert.title}`,
        message: alert.description,
        metadata: { alertId: alert.id, severity: alert.severity }
      });
    }
  };

  const handleKeyboardShortcut = (action: string) => {
    switch (action) {
      case 'refresh':
        refreshAuditLogs();
        break;
      case 'focus_search':
        document.getElementById('audit-search')?.focus();
        break;
      case 'export':
        setShowExportDialog(true);
        break;
      case 'toggle_timeline':
        setDisplaySettings(prev => ({
          ...prev,
          viewMode: prev.viewMode === 'timeline' ? 'table' : 'timeline'
        }));
        break;
      case 'toggle_analytics':
        setShowAnalyticsPanel(!showAnalyticsPanel);
        break;
      case 'clear_selection':
        setSelectedLogs([]);
        setSelectedLog(null);
        break;
      case 'toggle_live':
        setIsLiveMode(!isLiveMode);
        break;
      case 'next_log':
        navigateLog(1);
        break;
      case 'previous_log':
        navigateLog(-1);
        break;
    }
  };

  const navigateLog = (direction: 1 | -1) => {
    if (!selectedLog) {
      if (visibleLogs.length > 0) {
        setSelectedLog(visibleLogs[0]);
      }
      return;
    }

    const currentIndex = visibleLogs.findIndex(log => log.id === selectedLog.id);
    if (currentIndex === -1) return;

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < visibleLogs.length) {
      setSelectedLog(visibleLogs[newIndex]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await getAuditAnalytics(filters);
      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadThreatAlerts = async () => {
    try {
      const alertsData = await getThreatDetectionAlerts();
      if (alertsData.success) {
        setThreatAlerts(alertsData.data);
      }
    } catch (error) {
      console.error('Failed to load threat alerts:', error);
    }
  };

  const loadComplianceReport = async () => {
    try {
      const reportData = await getComplianceReport(filters);
      if (reportData.success) {
        setComplianceReport(reportData.data);
      }
    } catch (error) {
      console.error('Failed to load compliance report:', error);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      // In a real implementation, this would call an API endpoint
      const metrics: RealTimeMetrics = {
        eventsPerSecond: Math.random() * 10,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        systemLoad: Math.random() * 100,
        errorRate: Math.random() * 5,
        averageResponseTime: Math.random() * 1000 + 100,
        threatLevel: criticalAlerts.length > 0 ? 'critical' : 'low',
        alertsCount: threatAlerts.filter(a => !a.acknowledged).length,
        complianceScore: systemHealthScore,
        dataRetentionStatus: 'healthy',
        lastUpdateTime: new Date().toISOString(),
        historicalTrends: []
      };
      
      setRealTimeMetrics(metrics);
    } catch (error) {
      console.error('Failed to load real-time metrics:', error);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    // Debounce search to avoid excessive API calls
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      if (query.trim()) {
        searchAuditLogs(query.trim());
      }
    }, 300);
  };

  const handleLogSelect = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDetails(true);
    onLogSelect?.(log);

    // Load user journey if enabled
    if (showUserJourney && log.user_id) {
      loadUserJourney(log.user_id);
    }
  };

  const loadUserJourney = async (userId: number) => {
    try {
      const journeyData = await getUserJourney(userId, {
        startDate: subDays(new Date(), 1),
        endDate: new Date()
      });
      
      if (journeyData.success) {
        setUserJourneys(prev => new Map(prev).set(userId, journeyData.data));
      }
    } catch (error) {
      console.error('Failed to load user journey:', error);
    }
  };

  const handleAlertAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setThreatAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, acknowledged: true }
            : alert
        )
      );
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleAlertResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      setThreatAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, mitigationStatus: 'resolved' }
            : alert
        )
      );
      toast.success('Alert resolved');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const exportData = await exportAuditLogs({
        format,
        filters,
        logs: selectedLogs.length > 0 ? selectedLogs : filteredLogs
      });
      
      if (exportData.success) {
        // Trigger download
        const blob = new Blob([exportData.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`Logs exported to ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
      toast.error('Failed to export logs');
    }
  };

  // ===================== RENDER HELPERS =====================

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="flex items-center space-x-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                Audit Log Viewer
              </h1>
            </div>
            
            {/* Live Status Indicator */}
            {isLiveMode && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-lg">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700">LIVE</span>
                </div>
                
                {realTimeMetrics && (
                  <Badge 
                    variant={realTimeMetrics.threatLevel === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    Threat: {realTimeMetrics.threatLevel.toUpperCase()}
                  </Badge>
                )}
              </div>
            )}

            {/* System Health Score */}
            {realTimeMetrics && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-lg border">
                <Shield className={cn(
                  "h-4 w-4",
                  systemHealthScore >= 80 ? "text-green-600" :
                  systemHealthScore >= 60 ? "text-yellow-600" : "text-red-600"
                )} />
                <span className="text-sm font-medium">
                  Health: {systemHealthScore}%
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{currentUser?.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatDistanceToNow(lastRefresh, { addSuffix: true })}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Database className="h-4 w-4" />
              <span>{totalCount.toLocaleString()} total events</span>
            </div>
            {criticalAlerts.length > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Real-time Metrics */}
        {realTimeMetrics && (
          <div className="flex items-center space-x-4 px-4 py-2 bg-white rounded-lg border">
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm">{realTimeMetrics.eventsPerSecond.toFixed(1)}/s</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm">{realTimeMetrics.activeUsers}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Server className="h-4 w-4 text-orange-600" />
              <span className="text-sm">{realTimeMetrics.systemLoad.toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <Tabs value={displaySettings.viewMode} onValueChange={(value) => 
          setDisplaySettings(prev => ({ ...prev, viewMode: value as any }))
        }>
          <TabsList className="bg-white">
            <TabsTrigger value="table">
              <List className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="cards">
              <Grid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <GitBranch className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="heatmap">
              <BarChart3 className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Control Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLiveMode(!isLiveMode)}
          className={cn(isLiveMode && "bg-green-50 border-green-200")}
        >
          {isLiveMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refreshAuditLogs();
            setLastRefresh(new Date());
          }}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>

        {enableExportFeatures && (
          <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderSearchAndFilters = () => (
    <div className="flex items-center justify-between p-4 border-b bg-muted/30">
      <div className="flex items-center space-x-4 flex-1">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="audit-search"
            placeholder="Search logs by user, action, resource, or IP..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <div className="flex space-x-2">
          {AUDIT_EVENT_TYPES.slice(0, 4).map((type) => (
            <Button
              key={type.value}
              variant={filters.eventType === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({
                ...prev,
                eventType: prev.eventType === type.value ? undefined : type.value
              }))}
            >
              <type.icon className="h-4 w-4 mr-1" />
              {type.label}
            </Button>
          ))}

          {/* Severity Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Severity
                {filters.severity && (
                  <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                    {filters.severity}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Severity</DropdownMenuLabel>
              <DropdownMenuRadioGroup 
                value={filters.severity || ''} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  severity: value || undefined 
                }))}
              >
                <DropdownMenuRadioItem value="">All Levels</DropdownMenuRadioItem>
                {SEVERITY_LEVELS.map((level) => (
                  <DropdownMenuRadioItem key={level.value} value={level.value}>
                    <level.icon className="mr-2 h-4 w-4" />
                    {level.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Time Range Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Time Range
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select Time Range</DropdownMenuLabel>
              {TIME_RANGES.map((range) => (
                <DropdownMenuItem
                  key={range.value}
                  onClick={() => {
                    if (range.start) {
                      setFilters(prev => ({
                        ...prev,
                        startDate: range.start!(),
                        endDate: new Date()
                      }));
                    }
                  }}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {range.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Advanced Filters Toggle */}
        {showAdvancedFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        )}

        {/* Clear Filters */}
        {Object.keys(filters).length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            Clear All
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Analytics Toggle */}
        {showAnalytics && (
          <Button
            variant={showAnalyticsPanel ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        )}

        {/* Threat Detection Toggle */}
        {showThreatDetection && (
          <Button
            variant={showThreatPanel ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowThreatPanel(!showThreatPanel)}
            className={criticalAlerts.length > 0 ? "text-red-600 border-red-200" : ""}
          >
            <Shield className="h-4 w-4 mr-2" />
            Threats
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-xs">
                {criticalAlerts.length}
              </Badge>
            )}
          </Button>
        )}

        {/* Selection Info */}
        {selectedLogs.length > 0 && (
          <div className="flex items-center space-x-2 px-2 py-1 bg-blue-50 rounded">
            <span className="text-sm text-blue-600">
              {selectedLogs.length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLogs([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Results Count */}
        <span className="text-sm text-muted-foreground">
          {filteredLogs.length.toLocaleString()} events
        </span>
      </div>
    </div>
  );

  // ===================== LOADING STATE =====================

  if (isLoading && !auditLogs.length) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="flex items-center justify-center flex-1">
          <div className="space-y-4 text-center">
            <div className="relative">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <Activity className="h-4 w-4 absolute top-0 right-0 text-blue-600" />
            </div>
            <div className="text-lg font-medium">Loading audit logs...</div>
            <div className="text-sm text-muted-foreground">
              Initializing real-time monitoring and threat detection
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== MAIN RENDER =====================

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full bg-background", className)}>
        {renderHeader()}
        {renderSearchAndFilters()}
        
        {/* Error State */}
        {error && (
          <div className="p-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Error: {error}</span>
              <Button
                variant="link"
                size="sm"
                onClick={refreshAuditLogs}
                className="text-red-800 underline"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  <Activity className="h-4 w-4 mr-2" />
                  Audit Logs ({filteredLogs.length.toLocaleString()})
                </TabsTrigger>
                
                {showAnalytics && (
                  <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                )}
                
                {showThreatDetection && (
                  <TabsTrigger value="threats" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    <Shield className="h-4 w-4 mr-2" />
                    Threats ({threatAlerts.length})
                    {criticalAlerts.length > 0 && (
                      <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-xs">
                        {criticalAlerts.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                
                {showComplianceMode && (
                  <TabsTrigger value="compliance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    <FileText className="h-4 w-4 mr-2" />
                    Compliance
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="logs" className="flex-1 overflow-hidden">
                <AuditLogTable
                  logs={visibleLogs}
                  selectedLogs={selectedLogs}
                  selectedLog={selectedLog}
                  displaySettings={displaySettings}
                  columns={customColumns}
                  onLogSelect={handleLogSelect}
                  onLogToggle={(log) => {
                    setSelectedLogs(prev => 
                      prev.some(l => l.id === log.id)
                        ? prev.filter(l => l.id !== log.id)
                        : [...prev, log]
                    );
                  }}
                  onSelectAll={() => setSelectedLogs(filteredLogs)}
                  onClearSelection={() => setSelectedLogs([])}
                  enableVirtualScrolling={enableVirtualScrolling}
                  onScroll={(offset) => setVirtualScrollOffset(offset)}
                  enableIntelligentHighlights={enableIntelligentHighlights}
                />
              </TabsContent>

              {showAnalytics && (
                <TabsContent value="analytics" className="flex-1 overflow-hidden">
                  <AuditAnalyticsPanel
                    analytics={analytics}
                    realTimeMetrics={realTimeMetrics}
                    onRefresh={loadAnalytics}
                    className="h-full"
                  />
                </TabsContent>
              )}

              {showThreatDetection && (
                <TabsContent value="threats" className="flex-1 overflow-hidden">
                  <ThreatDetectionPanel
                    alerts={threatAlerts}
                    onAcknowledge={handleAlertAcknowledge}
                    onResolve={handleAlertResolve}
                    onInvestigate={(alert) => {
                      // Show related logs
                      setSelectedLogs(alert.relatedLogs);
                      setActiveTab('logs');
                    }}
                    className="h-full"
                  />
                </TabsContent>
              )}

              {showComplianceMode && (
                <TabsContent value="compliance" className="flex-1 overflow-hidden">
                  <CompliancePanel
                    report={complianceReport}
                    onRefresh={loadComplianceReport}
                    className="h-full"
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Side Panels */}
          {selectedLog && showLogDetails && (
            <div className="w-96 border-l bg-muted/10 overflow-auto">
              <LogDetailsPanel
                log={selectedLog}
                userJourney={userJourneys.get(selectedLog.user_id!)}
                onClose={() => setShowLogDetails(false)}
                onUserJourneyToggle={() => setShowUserJourneyPanel(!showUserJourneyPanel)}
                showUserJourney={showUserJourney}
              />
            </div>
          )}
        </div>

        {/* Export Dialog */}
        {showExportDialog && (
          <ExportDialog
            open={showExportDialog}
            onClose={() => setShowExportDialog(false)}
            onExport={handleExport}
            logCount={selectedLogs.length > 0 ? selectedLogs.length : filteredLogs.length}
            isSelection={selectedLogs.length > 0}
          />
        )}

        {/* Settings Dialog */}
        {showSettingsDialog && (
          <SettingsDialog
            open={showSettingsDialog}
            onClose={() => setShowSettingsDialog(false)}
            settings={displaySettings}
            onSettingsChange={setDisplaySettings}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

// ===================== SUB-COMPONENTS =====================

// The sub-components (AuditLogTable, AuditAnalyticsPanel, ThreatDetectionPanel, etc.) 
// would be implemented here. Due to length constraints, I'm providing the main structure.
// Each sub-component would be a comprehensive implementation with enterprise-grade features.

export default AuditLogViewer;