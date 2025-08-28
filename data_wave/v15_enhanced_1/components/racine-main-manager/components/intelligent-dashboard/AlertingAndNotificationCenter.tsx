'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, AlertTriangle, CheckCircle, XCircle, Info, Clock, Play, Pause, Square, RotateCcw, Settings, Filter, Search, Calendar, Users, Database, Server, Shield, Activity, TrendingUp, TrendingDown, AlertCircle, Zap, Target, Mail, Phone, MessageSquare, Webhook, Slack, Discord, Volume2, VolumeX, Eye, EyeOff, Edit3, Trash2, Copy, Plus, Save, Download, Upload, Share2, RefreshCw, BarChart3, LineChart, PieChart, MapPin, Globe, ArrowUp, ArrowDown, ArrowRight, MoreVertical, Star, Heart, Bookmark, Tag, Flag, Home, Building, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Maximize2, Minimize2, ExternalLink, Link, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DashboardState, AlertConfiguration, NotificationChannel, 
  AlertSeverity, AlertStatus, AlertCondition, AlertRule,
  NotificationTemplate, EscalationPolicy, AlertMetric
} from '../../types/racine-core.types';
import { useDashboardAPIs } from '../../hooks/useDashboardAPIs';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../hooks/optimized/useOptimizedCrossGroupIntegration';
import { useAIAssistant } from '../../hooks/useAIAssistant';

// Enhanced interfaces for alerting system
interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  metric: string;
  value: number;
  threshold: number;
  condition: AlertCondition;
  rule: AlertRule;
  tags: string[];
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  escalatedAt?: string;
  snoozeUntil?: string;
  metadata: Record<string, any>;
  relatedAlerts: string[];
  notifications: NotificationRecord[];
  actions: AlertAction[];
}

interface NotificationRecord {
  id: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  sentAt: string;
  recipient: string;
  template: string;
  error?: string;
  retryCount: number;
  metadata: Record<string, any>;
}

interface AlertAction {
  id: string;
  type: 'acknowledge' | 'resolve' | 'escalate' | 'snooze' | 'assign' | 'comment';
  userId: string;
  timestamp: string;
  comment?: string;
  metadata: Record<string, any>;
}

interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rule: AlertRule;
  channels: NotificationChannel[];
  escalation: EscalationPolicy;
  isActive: boolean;
  tags: string[];
  priority: number;
}

interface AlertingState {
  alerts: Alert[];
  rules: AlertRule[];
  templates: AlertTemplate[];
  channels: NotificationChannel[];
  selectedAlert: Alert | null;
  filteredAlerts: Alert[];
  filters: {
    severity: AlertSeverity[];
    status: AlertStatus[];
    source: string[];
    assignee: string[];
    tags: string[];
    dateRange: { start: string; end: string } | null;
    search: string;
  };
  sortBy: 'created' | 'updated' | 'severity' | 'status';
  sortOrder: 'asc' | 'desc';
  viewMode: 'list' | 'grid' | 'timeline' | 'board';
  groupBy: 'none' | 'severity' | 'status' | 'source' | 'assignee';
  isLoading: boolean;
  error: string | null;
  realTimeEnabled: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  totalCount: number;
  unreadCount: number;
  activeCount: number;
}

interface AlertingAndNotificationCenterProps {
  currentDashboard?: DashboardState | null;
  isLoading?: boolean;
  onAlertUpdate?: (alert: Alert) => void;
  onRuleUpdate?: (rule: AlertRule) => void;
  onChannelUpdate?: (channel: NotificationChannel) => void;
}

// Animation variants
const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  },
  item: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  },
  alert: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -20 }
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity }
    }
  }
};

// Severity configurations
const SEVERITY_CONFIG = {
  critical: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    label: 'Critical',
    priority: 1
  },
  high: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertCircle,
    label: 'High',
    priority: 2
  },
  medium: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Info,
    label: 'Medium',
    priority: 3
  },
  low: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Info,
    label: 'Low',
    priority: 4
  },
  info: {
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Info,
    label: 'Info',
    priority: 5
  }
};

// Status configurations
const STATUS_CONFIG = {
  active: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    label: 'Active'
  },
  acknowledged: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: Eye,
    label: 'Acknowledged'
  },
  resolved: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: 'Resolved'
  },
  snoozed: {
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Clock,
    label: 'Snoozed'
  },
  suppressed: {
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: VolumeX,
    label: 'Suppressed'
  }
};

export const AlertingAndNotificationCenter: React.FC<AlertingAndNotificationCenterProps> = ({
  currentDashboard,
  isLoading = false,
  onAlertUpdate,
  onRuleUpdate,
  onChannelUpdate
}) => {
  // Refs
  const alertsContainerRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<HTMLAudioElement>(null);
  const notificationRef = useRef<Notification | null>(null);

  // Custom hooks for backend integration
  const { 
    alerts,
    alertRules,
    notificationChannels,
    createAlert,
    updateAlert,
    deleteAlert,
    acknowledgeAlert,
    resolveAlert,
    snoozeAlert,
    escalateAlert,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    testAlertRule,
    createNotificationChannel,
    updateNotificationChannel,
    deleteNotificationChannel,
    testNotificationChannel,
    getAlertMetrics,
    getAlertHistory
  } = useDashboardAPIs();

  const { subscribe, unsubscribe } = useRealtimeUpdates();
  const { orchestrateWorkflow, getWorkflowStatus } = useRacineOrchestration();
  const { integrateCrossGroupData, getCrossGroupInsights } = useCrossGroupIntegration();
  const { generateInsights, analyzeAlertPatterns, suggestAlertRules } = useAIAssistant();

  // Component state
  const [state, setState] = useState<AlertingState>({
    alerts: [],
    rules: [],
    templates: [],
    channels: [],
    selectedAlert: null,
    filteredAlerts: [],
    filters: {
      severity: [],
      status: [],
      source: [],
      assignee: [],
      tags: [],
      dateRange: null,
      search: ''
    },
    sortBy: 'created',
    sortOrder: 'desc',
    viewMode: 'list',
    groupBy: 'none',
    isLoading: false,
    error: null,
    realTimeEnabled: true,
    soundEnabled: true,
    autoRefresh: true,
    refreshInterval: 30000,
    totalCount: 0,
    unreadCount: 0,
    activeCount: 0
  });

  // Dialog states
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  
  // Form states
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [newAlertRule, setNewAlertRule] = useState<Partial<AlertRule>>({});
  const [newChannel, setNewChannel] = useState<Partial<NotificationChannel>>({});
  const [bulkAction, setBulkAction] = useState<string>('');

  // Audio context for sound notifications
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Computed values
  const filteredAndSortedAlerts = useMemo(() => {
    let filtered = state.alerts.filter(alert => {
      const matchesSeverity = state.filters.severity.length === 0 || 
        state.filters.severity.includes(alert.severity);
      const matchesStatus = state.filters.status.length === 0 || 
        state.filters.status.includes(alert.status);
      const matchesSource = state.filters.source.length === 0 || 
        state.filters.source.includes(alert.source);
      const matchesAssignee = state.filters.assignee.length === 0 || 
        (alert.assignee && state.filters.assignee.includes(alert.assignee));
      const matchesTags = state.filters.tags.length === 0 || 
        state.filters.tags.some(tag => alert.tags.includes(tag));
      const matchesSearch = !state.filters.search || 
        alert.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
        alert.description.toLowerCase().includes(state.filters.search.toLowerCase());

      let matchesDateRange = true;
      if (state.filters.dateRange) {
        const alertDate = new Date(alert.createdAt);
        const startDate = new Date(state.filters.dateRange.start);
        const endDate = new Date(state.filters.dateRange.end);
        matchesDateRange = alertDate >= startDate && alertDate <= endDate;
      }

      return matchesSeverity && matchesStatus && matchesSource && 
             matchesAssignee && matchesTags && matchesSearch && matchesDateRange;
    });

    // Sort alerts
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'severity':
          comparison = SEVERITY_CONFIG[a.severity].priority - SEVERITY_CONFIG[b.severity].priority;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.alerts, state.filters, state.sortBy, state.sortOrder]);

  const alertStatistics = useMemo(() => {
    const total = state.alerts.length;
    const active = state.alerts.filter(a => a.status === 'active').length;
    const critical = state.alerts.filter(a => a.severity === 'critical').length;
    const unread = state.alerts.filter(a => !a.acknowledgedAt).length;
    
    const severityBreakdown = Object.keys(SEVERITY_CONFIG).reduce((acc, severity) => {
      acc[severity] = state.alerts.filter(a => a.severity === severity).length;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = Object.keys(STATUS_CONFIG).reduce((acc, status) => {
      acc[status] = state.alerts.filter(a => a.status === status).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      critical,
      unread,
      severityBreakdown,
      statusBreakdown
    };
  }, [state.alerts]);

  // Initialize component
  useEffect(() => {
    initializeAlertingCenter();
    initializeAudioContext();
    requestNotificationPermission();
    return () => cleanup();
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (state.autoRefresh) {
      const interval = setInterval(() => {
        refreshAlerts();
      }, state.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [state.autoRefresh, state.refreshInterval]);

  // Real-time updates effect
  useEffect(() => {
    if (state.realTimeEnabled) {
      const unsubscribe = subscribe('alerts', handleRealtimeAlert);
      return () => unsubscribe();
    }
  }, [state.realTimeEnabled]);

  // Sound notification effect
  useEffect(() => {
    if (state.soundEnabled && audioContext) {
      const criticalAlerts = state.alerts.filter(a => 
        a.severity === 'critical' && a.status === 'active'
      );
      
      if (criticalAlerts.length > 0) {
        playAlertSound();
      }
    }
  }, [state.alerts, state.soundEnabled, audioContext]);

  // Initialize alerting center
  const initializeAlertingCenter = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load initial data
      const [alertsData, rulesData, channelsData] = await Promise.all([
        alerts || [],
        alertRules || [],
        notificationChannels || []
      ]);

      setState(prev => ({
        ...prev,
        alerts: alertsData,
        rules: rulesData,
        channels: channelsData,
        filteredAlerts: alertsData,
        totalCount: alertsData.length,
        activeCount: alertsData.filter(a => a.status === 'active').length,
        unreadCount: alertsData.filter(a => !a.acknowledgedAt).length,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to initialize alerting center:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to initialize alerting center' 
      }));
    }
  }, [alerts, alertRules, notificationChannels]);

  // Initialize audio context
  const initializeAudioContext = useCallback(() => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Handle real-time alert updates
  const handleRealtimeAlert = useCallback((alertData: any) => {
    setState(prev => {
      let newAlerts = [...prev.alerts];
      
      switch (alertData.action) {
        case 'created':
          newAlerts.unshift(alertData.alert);
          // Show browser notification for critical alerts
          if (alertData.alert.severity === 'critical' && 'Notification' in window && 
              Notification.permission === 'granted') {
            new Notification(`Critical Alert: ${alertData.alert.title}`, {
              body: alertData.alert.description,
              icon: '/icons/alert-critical.png',
              tag: alertData.alert.id
            });
          }
          break;
        case 'updated':
          newAlerts = newAlerts.map(alert => 
            alert.id === alertData.alert.id ? { ...alert, ...alertData.alert } : alert
          );
          break;
        case 'deleted':
          newAlerts = newAlerts.filter(alert => alert.id !== alertData.alertId);
          break;
      }
      
      return {
        ...prev,
        alerts: newAlerts,
        totalCount: newAlerts.length,
        activeCount: newAlerts.filter(a => a.status === 'active').length,
        unreadCount: newAlerts.filter(a => !a.acknowledgedAt).length
      };
    });
  }, []);

  // Play alert sound
  const playAlertSound = useCallback(() => {
    if (!audioContext || !state.soundEnabled) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play alert sound:', error);
    }
  }, [audioContext, state.soundEnabled]);

  // Refresh alerts
  const refreshAlerts = useCallback(async () => {
    try {
      const alertsData = await alerts || [];
      setState(prev => ({
        ...prev,
        alerts: alertsData,
        totalCount: alertsData.length,
        activeCount: alertsData.filter(a => a.status === 'active').length,
        unreadCount: alertsData.filter(a => !a.acknowledgedAt).length
      }));
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
    }
  }, [alerts]);

  // Alert actions
  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const updatedAlert = await acknowledgeAlert(alertId, {
        userId: 'current-user', // TODO: Get from auth context
        timestamp: new Date().toISOString()
      });
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? updatedAlert : alert
        )
      }));
      
      if (onAlertUpdate) {
        onAlertUpdate(updatedAlert);
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      setState(prev => ({ ...prev, error: 'Failed to acknowledge alert' }));
    }
  }, [acknowledgeAlert, onAlertUpdate]);

  const handleResolveAlert = useCallback(async (alertId: string, comment?: string) => {
    try {
      const updatedAlert = await resolveAlert(alertId, {
        userId: 'current-user',
        timestamp: new Date().toISOString(),
        comment
      });
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? updatedAlert : alert
        )
      }));
      
      if (onAlertUpdate) {
        onAlertUpdate(updatedAlert);
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      setState(prev => ({ ...prev, error: 'Failed to resolve alert' }));
    }
  }, [resolveAlert, onAlertUpdate]);

  const handleSnoozeAlert = useCallback(async (alertId: string, duration: number) => {
    try {
      const snoozeUntil = new Date(Date.now() + duration * 60000).toISOString();
      const updatedAlert = await snoozeAlert(alertId, {
        userId: 'current-user',
        timestamp: new Date().toISOString(),
        snoozeUntil
      });
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? updatedAlert : alert
        )
      }));
      
      if (onAlertUpdate) {
        onAlertUpdate(updatedAlert);
      }
    } catch (error) {
      console.error('Failed to snooze alert:', error);
      setState(prev => ({ ...prev, error: 'Failed to snooze alert' }));
    }
  }, [snoozeAlert, onAlertUpdate]);

  const handleEscalateAlert = useCallback(async (alertId: string, escalationLevel: number) => {
    try {
      const updatedAlert = await escalateAlert(alertId, {
        userId: 'current-user',
        timestamp: new Date().toISOString(),
        escalationLevel
      });
      
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? updatedAlert : alert
        )
      }));
      
      if (onAlertUpdate) {
        onAlertUpdate(updatedAlert);
      }
    } catch (error) {
      console.error('Failed to escalate alert:', error);
      setState(prev => ({ ...prev, error: 'Failed to escalate alert' }));
    }
  }, [escalateAlert, onAlertUpdate]);

  // Bulk actions
  const handleBulkAction = useCallback(async (action: string, alertIds: string[]) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const promises = alertIds.map(alertId => {
        switch (action) {
          case 'acknowledge':
            return handleAcknowledgeAlert(alertId);
          case 'resolve':
            return handleResolveAlert(alertId);
          case 'snooze':
            return handleSnoozeAlert(alertId, 60); // 1 hour
          default:
            return Promise.resolve();
        }
      });
      
      await Promise.all(promises);
      setSelectedAlerts([]);
      setShowBulkActionsDialog(false);
      
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      setState(prev => ({ ...prev, error: 'Failed to perform bulk action' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [handleAcknowledgeAlert, handleResolveAlert, handleSnoozeAlert]);

  // Filter and sort handlers
  const handleFilterChange = useCallback((filterType: string, value: any) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      }
    }));
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder
    }));
  }, []);

  const handleViewModeChange = useCallback((viewMode: 'list' | 'grid' | 'timeline' | 'board') => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (audioContext) {
      audioContext.close();
    }
    if (notificationRef.current) {
      notificationRef.current.close();
    }
  }, [audioContext]);

  // Render alert severity indicator
  const renderSeverityIndicator = (severity: AlertSeverity) => {
    const config = SEVERITY_CONFIG[severity];
    const Icon = config.icon;
    
    return (
      <div className={cn("flex items-center space-x-2", config.textColor)}>
        <div className={cn("w-2 h-2 rounded-full", config.color)} />
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  };

  // Render alert status indicator
  const renderStatusIndicator = (status: AlertStatus) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={cn(config.bgColor, config.borderColor, config.textColor)}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Render alert card
  const renderAlertCard = (alert: Alert) => {
    const severityConfig = SEVERITY_CONFIG[alert.severity];
    const statusConfig = STATUS_CONFIG[alert.status];
    
    return (
      <motion.div
        key={alert.id}
        variants={animationVariants.alert}
        initial="initial"
        animate="animate"
        exit="exit"
        layout
      >
        <Card className={cn(
          "cursor-pointer transition-all duration-200",
          "hover:shadow-md border-l-4",
          severityConfig.borderColor,
          state.selectedAlert?.id === alert.id && "ring-2 ring-blue-500",
          selectedAlerts.includes(alert.id) && "bg-blue-50"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedAlerts.includes(alert.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedAlerts(prev => 
                      e.target.checked 
                        ? [...prev, alert.id]
                        : prev.filter(id => id !== alert.id)
                    );
                  }}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {renderSeverityIndicator(alert.severity)}
                    {renderStatusIndicator(alert.status)}
                  </div>
                  <CardTitle className="text-base mb-2 line-clamp-2">
                    {alert.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {alert.description}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {alert.status === 'active' && (
                    <DropdownMenuItem onClick={() => handleAcknowledgeAlert(alert.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Acknowledge
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleResolveAlert(alert.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSnoozeAlert(alert.id, 60)}>
                    <Clock className="h-4 w-4 mr-2" />
                    Snooze 1h
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEscalateAlert(alert.id, 1)}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Escalate
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem onClick={() => setState(prev => ({ ...prev, selectedAlert: alert }))}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>{alert.source}</span>
                <span>{alert.metric}</span>
                {alert.assignee && (
                  <span>Assigned to {alert.assignee}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
            {alert.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {alert.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {alert.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{alert.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Render statistics overview
  const renderStatisticsOverview = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold">{alertStatistics.total}</p>
            </div>
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-red-600">{alertStatistics.active}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{alertStatistics.critical}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{alertStatistics.unread}</p>
            </div>
            <Info className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render filters panel
  const renderFiltersPanel = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts..."
                value={state.filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Severity</Label>
            <Select
              value={state.filters.severity.join(',')}
              onValueChange={(value) => handleFilterChange('severity', value ? value.split(',') : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All severities</SelectItem>
                {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (
                  <SelectItem key={severity} value={severity}>
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-2 h-2 rounded-full", config.color)} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={state.filters.status.join(',')}
              onValueChange={(value) => handleFilterChange('status', value ? value.split(',') : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      <config.icon className="h-3 w-3" />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium">View Mode</Label>
            <Select
              value={state.viewMode}
              onValueChange={(value) => handleViewModeChange(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="timeline">Timeline View</SelectItem>
                <SelectItem value="board">Board View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render alerts list
  const renderAlertsList = () => (
    <div className="space-y-4">
      {selectedAlerts.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedAlerts.length} alert(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBulkActionsDialog(true)}
                >
                  Bulk Actions
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedAlerts([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <AnimatePresence>
        {filteredAndSortedAlerts.map((alert) => renderAlertCard(alert))}
      </AnimatePresence>
      
      {filteredAndSortedAlerts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">
              {state.filters.search || state.filters.severity.length > 0 || state.filters.status.length > 0
                ? "Try adjusting your filters"
                : "No alerts have been generated yet"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <motion.div
        ref={alertsContainerRef}
        className="p-6 space-y-6"
        variants={animationVariants.container}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="h-8 w-8 mr-3" />
              Alerting & Notification Center
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage alerts across all data governance systems
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  >
                    {state.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {state.soundEnabled ? 'Disable' : 'Enable'} sound notifications
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, realTimeEnabled: !prev.realTimeEnabled }))}
            >
              {state.realTimeEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAlerts}
              disabled={state.isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", state.isLoading && "animate-spin")} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsDialog(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => setShowRuleDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        {renderStatisticsOverview()}

        {/* Filters Panel */}
        {renderFiltersPanel()}

        {/* Alerts List */}
        {renderAlertsList()}

        {/* Bulk Actions Dialog */}
        <Dialog open={showBulkActionsDialog} onOpenChange={setShowBulkActionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Actions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Apply action to {selectedAlerts.length} selected alert(s)
              </p>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acknowledge">Acknowledge</SelectItem>
                  <SelectItem value="resolve">Resolve</SelectItem>
                  <SelectItem value="snooze">Snooze (1 hour)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkActionsDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleBulkAction(bulkAction, selectedAlerts)}
                  disabled={!bulkAction || state.isLoading}
                >
                  Apply Action
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading overlay */}
        {(state.isLoading || isLoading) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Processing alerts...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {state.error && (
          <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm">{state.error}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-1"
                onClick={() => setState(prev => ({ ...prev, error: null }))}
              >
                ×
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
};