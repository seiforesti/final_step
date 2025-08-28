/**
 * Compliance Activity Monitor Component
 * ====================================
 * 
 * Advanced compliance-focused activity monitoring system with automated risk detection,
 * real-time compliance tracking, violation alerts, and comprehensive audit trails.
 * Integrates with all existing SPAs to provide unified compliance oversight.
 * 
 * Features:
 * - Real-time compliance monitoring across all SPAs
 * - Automated risk detection and violation alerts
 * - Compliance score calculation and trending
 * - Advanced filtering and investigation tools
 * - Executive compliance dashboards
 * - Automated compliance reporting
 * - Integration with audit trail systems
 * - Cross-SPA compliance correlation
 * 
 * Backend Integration:
 * - Maps to: compliance-activity-apis.ts
 * - Uses: useActivityTracker hook for data management
 * - Integrates: All existing SPA compliance endpoints
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Icons
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Filter, Search, Download, RefreshCw, Eye, EyeOff, Settings, Bell, BellOff, Calendar as CalendarIcon, BarChart3, PieChart, LineChart, Activity, Users, Database, FileText, AlertCircle, Info, Zap, Target, Gauge, Timer, MapPin, Layers, Network, GitBranch, Lock, Unlock, Key, Flag, Star, Bookmark, Tag, Hash, Percent, DollarSign, TrendingDown as Risk, Shield as Security, CheckSquare, Square, PlayCircle, PauseCircle, StopCircle, SkipForward, RotateCcw, Archive, Trash2, Edit, Copy, Share, ExternalLink, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, Plus, Minus, X, Check, AlertOctagon, HelpCircle, MessageSquare, Mail, Phone, Link, Globe, Server, Cloud, Cpu, HardDrive, Monitor, Smartphone, Tablet, Watch, Camera, Mic, Volume2, VolumeX } from 'lucide-react';

// Charts
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  AreaChart,
  ScatterChart,
  RadarChart,
  TreeMap,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
  Area,
  Scatter,
  Radar,
  RadialBar,
  RadialBarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Pie
} from 'recharts';

// Hooks and Services
import { useActivityTracker } from '../hooks/optimized/useOptimizedActivityTracker';
import { complianceActivityAPI } from '../../services/compliance-activity-apis';

// Types
import {
  UUID,
  ISODateString,
  ComplianceViolation,
  ComplianceRule,
  ComplianceStatus,
  ComplianceRisk,
  RiskLevel,
  ComplianceFramework,
  AuditTrail,
  ComplianceMetrics,
  ComplianceAlert,
  ComplianceDashboard,
  ComplianceReport,
  ComplianceInvestigation,
  RacineActivity,
  ActivityFilter,
  UserRole,
  CrossGroupActivity,
  SystemActivity
} from '../../types/racine-core.types';

// ================================================================================
// INTERFACES & TYPES
// ================================================================================

interface ComplianceActivityMonitorProps {
  height?: number;
  showControls?: boolean;
  enableAlerts?: boolean;
  enableExport?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

interface ComplianceMonitorState {
  // Core Data
  violations: ComplianceViolation[];
  rules: ComplianceRule[];
  alerts: ComplianceAlert[];
  investigations: ComplianceInvestigation[];
  metrics: ComplianceMetrics | null;
  dashboard: ComplianceDashboard | null;
  
  // UI State
  currentView: ComplianceViewMode;
  selectedViolation: ComplianceViolation | null;
  selectedRule: ComplianceRule | null;
  selectedFramework: ComplianceFramework | null;
  
  // Filters
  activeFilters: ComplianceFilter[];
  filterPanelOpen: boolean;
  dateRange: DateRange;
  riskLevelFilter: RiskLevel[];
  frameworkFilter: ComplianceFramework[];
  statusFilter: ComplianceStatus[];
  
  // Search
  searchQuery: string;
  searchResults: ComplianceViolation[];
  isSearching: boolean;
  searchFilters: ComplianceSearchFilter[];
  
  // Real-time
  isRealTimeEnabled: boolean;
  alertsEnabled: boolean;
  alertThresholds: AlertThresholds;
  lastUpdate: ISODateString | null;
  
  // Layout
  layoutMode: ComplianceLayoutMode;
  panelSizes: PanelSizes;
  collapsedPanels: string[];
  
  // Loading States
  loading: {
    violations: boolean;
    rules: boolean;
    alerts: boolean;
    metrics: boolean;
    investigations: boolean;
    export: boolean;
  };
  
  // Error States
  errors: {
    violations: string | null;
    rules: string | null;
    alerts: string | null;
    metrics: string | null;
    investigations: string | null;
  };
  
  // Performance
  performanceMetrics: PerformanceMetrics;
  cacheStatus: CacheStatus;
}

type ComplianceViewMode = 
  | 'overview' 
  | 'violations' 
  | 'rules' 
  | 'investigations' 
  | 'alerts' 
  | 'metrics' 
  | 'reports' 
  | 'frameworks';

type ComplianceLayoutMode = 'grid' | 'list' | 'dashboard' | 'timeline' | 'investigation';

interface ComplianceFilter {
  id: string;
  name: string;
  type: 'risk_level' | 'framework' | 'status' | 'date_range' | 'spa' | 'user' | 'severity';
  value: any;
  active: boolean;
}

interface ComplianceSearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: string;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface AlertThresholds {
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  violationCount: number;
  complianceScore: number;
}

interface PanelSizes {
  sidebar: number;
  main: number;
  details: number;
}

interface PerformanceMetrics {
  renderTime: number;
  dataFetchTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

interface CacheStatus {
  violations: boolean;
  rules: boolean;
  metrics: boolean;
  lastCacheUpdate: ISODateString | null;
}

// ================================================================================
// CONSTANTS & CONFIGURATION
// ================================================================================

const COMPLIANCE_FRAMEWORKS = [
  'GDPR',
  'HIPAA',
  'SOX',
  'PCI-DSS',
  'ISO-27001',
  'NIST',
  'COBIT',
  'COSO',
  'SOC2',
  'Custom'
] as const;

const RISK_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

const COMPLIANCE_STATUSES = [
  'compliant',
  'non_compliant',
  'warning',
  'investigating',
  'remediated',
  'pending'
] as const;

const VIEW_MODES = [
  { value: 'overview', label: 'Overview', icon: BarChart3 },
  { value: 'violations', label: 'Violations', icon: AlertTriangle },
  { value: 'rules', label: 'Rules', icon: Shield },
  { value: 'investigations', label: 'Investigations', icon: Search },
  { value: 'alerts', label: 'Alerts', icon: Bell },
  { value: 'metrics', label: 'Metrics', icon: TrendingUp },
  { value: 'reports', label: 'Reports', icon: FileText },
  { value: 'frameworks', label: 'Frameworks', icon: Layers }
] as const;

const LAYOUT_MODES = [
  { value: 'grid', label: 'Grid View', icon: BarChart3 },
  { value: 'list', label: 'List View', icon: List },
  { value: 'dashboard', label: 'Dashboard', icon: Monitor },
  { value: 'timeline', label: 'Timeline', icon: Clock },
  { value: 'investigation', label: 'Investigation', icon: Search }
] as const;

const INITIAL_STATE: ComplianceMonitorState = {
  violations: [],
  rules: [],
  alerts: [],
  investigations: [],
  metrics: null,
  dashboard: null,
  currentView: 'overview',
  selectedViolation: null,
  selectedRule: null,
  selectedFramework: null,
  activeFilters: [],
  filterPanelOpen: false,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  },
  riskLevelFilter: [],
  frameworkFilter: [],
  statusFilter: [],
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchFilters: [],
  isRealTimeEnabled: true,
  alertsEnabled: true,
  alertThresholds: {
    criticalRisk: 90,
    highRisk: 75,
    mediumRisk: 50,
    violationCount: 10,
    complianceScore: 80
  },
  lastUpdate: null,
  layoutMode: 'dashboard',
  panelSizes: {
    sidebar: 25,
    main: 50,
    details: 25
  },
  collapsedPanels: [],
  loading: {
    violations: false,
    rules: false,
    alerts: false,
    metrics: false,
    investigations: false,
    export: false
  },
  errors: {
    violations: null,
    rules: null,
    alerts: null,
    metrics: null,
    investigations: null
  },
  performanceMetrics: {
    renderTime: 0,
    dataFetchTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  },
  cacheStatus: {
    violations: false,
    rules: false,
    metrics: false,
    lastCacheUpdate: null
  }
};

// ================================================================================
// MAIN COMPONENT
// ================================================================================

export const ComplianceActivityMonitor: React.FC<ComplianceActivityMonitorProps> = ({
  height = 800,
  showControls = true,
  enableAlerts = true,
  enableExport = true,
  autoRefresh = true,
  refreshInterval = 30000,
  className = ''
}) => {
  // ================================================================================
  // STATE & HOOKS
  // ================================================================================

  const [state, setState] = useState<ComplianceMonitorState>(INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);
  const [performanceStart, setPerformanceStart] = useState<number>(0);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const alertAudioRef = useRef<HTMLAudioElement>(null);
  
  // Animations
  const mainAnimationControls = useAnimation();
  const sidebarAnimationControls = useAnimation();
  const alertAnimationControls = useAnimation();
  
  // Hooks
  const {
    activities,
    filteredActivities,
    analytics,
    auditTrails,
    anomalies,
    loading: activityLoading,
    errors: activityErrors,
    searchActivities,
    applyFilters,
    exportActivities,
    getAnalytics,
    getAuditTrails,
    getAnomalies,
    refreshData
  } = useActivityTracker();

  // ================================================================================
  // EFFECTS
  // ================================================================================

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      setPerformanceStart(performance.now());
      
      try {
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, violations: true, rules: true, metrics: true }
        }));

        // Load initial data
        await Promise.all([
          loadComplianceViolations(),
          loadComplianceRules(),
          loadComplianceMetrics(),
          loadComplianceAlerts()
        ]);

        setIsInitialized(true);
        
        // Record performance
        const renderTime = performance.now() - performanceStart;
        setState(prev => ({
          ...prev,
          performanceMetrics: {
            ...prev.performanceMetrics,
            renderTime
          }
        }));
      } catch (error) {
        console.error('Failed to initialize compliance monitor:', error);
        setState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            violations: 'Failed to initialize compliance monitoring'
          }
        }));
      }
    };

    initialize();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !isInitialized) return;

    const interval = setInterval(() => {
      refreshComplianceData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isInitialized]);

  // Real-time updates
  useEffect(() => {
    if (!state.isRealTimeEnabled || !isInitialized) return;

    const handleComplianceUpdate = (event: any) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'violation_detected':
          handleNewViolation(data);
          break;
        case 'compliance_score_updated':
          handleComplianceScoreUpdate(data);
          break;
        case 'alert_triggered':
          handleComplianceAlert(data);
          break;
      }
    };

    window.addEventListener('complianceUpdate', handleComplianceUpdate);
    return () => window.removeEventListener('complianceUpdate', handleComplianceUpdate);
  }, [state.isRealTimeEnabled, isInitialized]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'f':
            event.preventDefault();
            searchInputRef.current?.focus();
            break;
          case 'r':
            event.preventDefault();
            refreshComplianceData();
            break;
          case 'e':
            if (enableExport) {
              event.preventDefault();
              handleExportCompliance();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [enableExport]);

  // ================================================================================
  // DATA LOADING FUNCTIONS
  // ================================================================================

  const loadComplianceViolations = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, violations: true } }));
      
      const response = await complianceActivityAPI.getViolations({
        dateRange: state.dateRange,
        riskLevels: state.riskLevelFilter,
        frameworks: state.frameworkFilter,
        statuses: state.statusFilter
      });
      
      setState(prev => ({
        ...prev,
        violations: response.violations,
        loading: { ...prev.loading, violations: false },
        errors: { ...prev.errors, violations: null }
      }));
    } catch (error) {
      console.error('Failed to load compliance violations:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, violations: false },
        errors: { ...prev.errors, violations: 'Failed to load violations' }
      }));
    }
  }, [state.dateRange, state.riskLevelFilter, state.frameworkFilter, state.statusFilter]);

  const loadComplianceRules = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, rules: true } }));
      
      const response = await complianceActivityAPI.getRules({
        frameworks: state.frameworkFilter,
        active: true
      });
      
      setState(prev => ({
        ...prev,
        rules: response.rules,
        loading: { ...prev.loading, rules: false },
        errors: { ...prev.errors, rules: null }
      }));
    } catch (error) {
      console.error('Failed to load compliance rules:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, rules: false },
        errors: { ...prev.errors, rules: 'Failed to load rules' }
      }));
    }
  }, [state.frameworkFilter]);

  const loadComplianceMetrics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, metrics: true } }));
      
      const response = await complianceActivityAPI.getMetrics({
        dateRange: state.dateRange,
        frameworks: state.frameworkFilter
      });
      
      setState(prev => ({
        ...prev,
        metrics: response.metrics,
        loading: { ...prev.loading, metrics: false },
        errors: { ...prev.errors, metrics: null }
      }));
    } catch (error) {
      console.error('Failed to load compliance metrics:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, metrics: false },
        errors: { ...prev.errors, metrics: 'Failed to load metrics' }
      }));
    }
  }, [state.dateRange, state.frameworkFilter]);

  const loadComplianceAlerts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, alerts: true } }));
      
      const response = await complianceActivityAPI.getAlerts({
        active: true,
        riskLevels: state.riskLevelFilter
      });
      
      setState(prev => ({
        ...prev,
        alerts: response.alerts,
        loading: { ...prev.loading, alerts: false },
        errors: { ...prev.errors, alerts: null }
      }));
    } catch (error) {
      console.error('Failed to load compliance alerts:', error);
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, alerts: false },
        errors: { ...prev.errors, alerts: 'Failed to load alerts' }
      }));
    }
  }, [state.riskLevelFilter]);

  // ================================================================================
  // EVENT HANDLERS
  // ================================================================================

  const handleViewChange = useCallback(async (view: ComplianceViewMode) => {
    setState(prev => ({ ...prev, currentView: view }));
    
    // Animate view transition
    await mainAnimationControls.start({
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    });
    
    await mainAnimationControls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    });
  }, [mainAnimationControls]);

  const handleLayoutChange = useCallback((layout: ComplianceLayoutMode) => {
    setState(prev => ({ ...prev, layoutMode: layout }));
  }, []);

  const handleFilterToggle = useCallback(async () => {
    const isOpening = !state.filterPanelOpen;
    setState(prev => ({ ...prev, filterPanelOpen: isOpening }));
    
    await sidebarAnimationControls.start({
      x: isOpening ? 0 : -320,
      transition: { duration: 0.3, ease: "easeInOut" }
    });
  }, [state.filterPanelOpen, sidebarAnimationControls]);

  const handleViolationSelect = useCallback((violation: ComplianceViolation | null) => {
    setState(prev => ({ ...prev, selectedViolation: violation }));
  }, []);

  const handleRuleSelect = useCallback((rule: ComplianceRule | null) => {
    setState(prev => ({ ...prev, selectedRule: rule }));
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setState(prev => ({ 
      ...prev, 
      searchQuery: query,
      isSearching: true 
    }));

    try {
      const results = await complianceActivityAPI.searchViolations({
        query,
        filters: state.searchFilters,
        dateRange: state.dateRange
      });

      setState(prev => ({
        ...prev,
        searchResults: results.violations,
        isSearching: false
      }));
    } catch (error) {
      console.error('Search failed:', error);
      setState(prev => ({ ...prev, isSearching: false }));
    }
  }, [state.searchFilters, state.dateRange]);

  const handleNewViolation = useCallback((violation: ComplianceViolation) => {
    setState(prev => ({
      ...prev,
      violations: [violation, ...prev.violations]
    }));

    // Trigger alert if enabled
    if (state.alertsEnabled && violation.riskLevel === 'critical') {
      triggerAlert('Critical compliance violation detected!');
    }
  }, [state.alertsEnabled]);

  const handleComplianceAlert = useCallback((alert: ComplianceAlert) => {
    setState(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts]
    }));

    if (state.alertsEnabled) {
      triggerAlert(alert.message);
    }
  }, [state.alertsEnabled]);

  const handleComplianceScoreUpdate = useCallback((metrics: ComplianceMetrics) => {
    setState(prev => ({ ...prev, metrics }));
  }, []);

  const refreshComplianceData = useCallback(async () => {
    await Promise.all([
      loadComplianceViolations(),
      loadComplianceRules(),
      loadComplianceMetrics(),
      loadComplianceAlerts()
    ]);
    
    setState(prev => ({ ...prev, lastUpdate: new Date().toISOString() }));
  }, [loadComplianceViolations, loadComplianceRules, loadComplianceMetrics, loadComplianceAlerts]);

  const handleExportCompliance = useCallback(async () => {
    if (!enableExport) return;

    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, export: true } }));

      const exportData = {
        violations: state.violations,
        rules: state.rules,
        metrics: state.metrics,
        alerts: state.alerts,
        dateRange: state.dateRange,
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, export: false } }));
    }
  }, [enableExport, state.violations, state.rules, state.metrics, state.alerts, state.dateRange]);

  const triggerAlert = useCallback((message: string) => {
    // Visual alert animation
    alertAnimationControls.start({
      scale: [1, 1.1, 1],
      backgroundColor: ['#ef4444', '#dc2626', '#ef4444'],
      transition: { duration: 0.5, ease: "easeInOut" }
    });

    // Audio alert if available
    if (alertAudioRef.current) {
      alertAudioRef.current.play().catch(() => {
        // Audio play failed, ignore
      });
    }

    // Browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Compliance Alert', {
        body: message,
        icon: '/icons/compliance-alert.png'
      });
    }
  }, [alertAnimationControls]);

  // ================================================================================
  // MEMOIZED COMPUTATIONS
  // ================================================================================

  const complianceStats = useMemo(() => {
    const totalViolations = state.violations.length;
    const criticalViolations = state.violations.filter(v => v.riskLevel === 'critical').length;
    const highRiskViolations = state.violations.filter(v => v.riskLevel === 'high').length;
    const resolvedViolations = state.violations.filter(v => v.status === 'remediated').length;
    
    const complianceScore = state.metrics?.overallScore || 0;
    const previousScore = state.metrics?.previousScore || 0;
    const scoreChange = complianceScore - previousScore;
    
    const activeAlerts = state.alerts.filter(a => a.status === 'active').length;
    const activeInvestigations = state.investigations.filter(i => i.status === 'active').length;
    
    return {
      totalViolations,
      criticalViolations,
      highRiskViolations,
      resolvedViolations,
      complianceScore,
      scoreChange,
      activeAlerts,
      activeInvestigations,
      resolutionRate: totalViolations > 0 ? (resolvedViolations / totalViolations) * 100 : 0
    };
  }, [state.violations, state.metrics, state.alerts, state.investigations]);

  const violationTrends = useMemo(() => {
    if (!state.metrics?.trends) return [];
    
    return state.metrics.trends.map(trend => ({
      date: trend.date,
      violations: trend.violationCount,
      score: trend.complianceScore,
      critical: trend.criticalCount,
      high: trend.highRiskCount,
      medium: trend.mediumRiskCount,
      low: trend.lowRiskCount
    }));
  }, [state.metrics]);

  const riskDistribution = useMemo(() => {
    const distribution = RISK_LEVELS.reduce((acc, level) => {
      acc[level] = state.violations.filter(v => v.riskLevel === level).length;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([level, count]) => ({
      name: level.charAt(0).toUpperCase() + level.slice(1),
      value: count,
      color: {
        critical: '#dc2626',
        high: '#ea580c',
        medium: '#ca8a04',
        low: '#16a34a'
      }[level] || '#6b7280'
    }));
  }, [state.violations]);

  const frameworkCompliance = useMemo(() => {
    if (!state.metrics?.frameworkScores) return [];
    
    return Object.entries(state.metrics.frameworkScores).map(([framework, score]) => ({
      framework,
      score: score.current,
      target: score.target,
      violations: state.violations.filter(v => v.frameworks.includes(framework as ComplianceFramework)).length
    }));
  }, [state.metrics, state.violations]);

  // ================================================================================
  // RENDER FUNCTIONS
  // ================================================================================

  const renderHeaderControls = () => (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Compliance Monitor</h2>
        </div>
        
        {state.lastUpdate && (
          <Badge variant="outline" className="text-xs">
            Last updated: {new Date(state.lastUpdate).toLocaleTimeString()}
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Real-time Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  isRealTimeEnabled: !prev.isRealTimeEnabled 
                }))}
                className={state.isRealTimeEnabled ? 'bg-green-100 border-green-300' : ''}
              >
                {state.isRealTimeEnabled ? (
                  <Activity className="h-4 w-4 text-green-600" />
                ) : (
                  <PauseCircle className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {state.isRealTimeEnabled ? 'Disable' : 'Enable'} real-time monitoring
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Alerts Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  alertsEnabled: !prev.alertsEnabled 
                }))}
                className={state.alertsEnabled ? 'bg-blue-100 border-blue-300' : ''}
              >
                {state.alertsEnabled ? (
                  <Bell className="h-4 w-4 text-blue-600" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {state.alertsEnabled ? 'Disable' : 'Enable'} alerts
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFilterToggle}
          className={state.filterPanelOpen ? 'bg-gray-100' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* View Mode Selector */}
        <Select value={state.currentView} onValueChange={handleViewChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VIEW_MODES.map(mode => (
              <SelectItem key={mode.value} value={mode.value}>
                <div className="flex items-center space-x-2">
                  <mode.icon className="h-4 w-4" />
                  <span>{mode.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={refreshComplianceData}
          disabled={Object.values(state.loading).some(Boolean)}
        >
          <RefreshCw className={`h-4 w-4 ${Object.values(state.loading).some(Boolean) ? 'animate-spin' : ''}`} />
        </Button>

        {/* Export Button */}
        {enableExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCompliance}
            disabled={state.loading.export}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );

  const renderStatCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {/* Compliance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {complianceStats.complianceScore.toFixed(1)}%
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {complianceStats.scoreChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={complianceStats.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {complianceStats.scoreChange > 0 ? '+' : ''}{complianceStats.scoreChange.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={complianceStats.complianceScore} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      {/* Total Violations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceStats.totalViolations}</div>
          <div className="text-xs text-muted-foreground">
            {complianceStats.criticalViolations} critical, {complianceStats.highRiskViolations} high risk
          </div>
          <div className="flex space-x-1 mt-2">
            <div className="h-2 bg-red-500 rounded" style={{ width: `${(complianceStats.criticalViolations / complianceStats.totalViolations) * 100}%` }} />
            <div className="h-2 bg-orange-500 rounded" style={{ width: `${(complianceStats.highRiskViolations / complianceStats.totalViolations) * 100}%` }} />
            <div className="h-2 bg-gray-300 rounded flex-1" />
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceStats.activeAlerts}</div>
          <div className="text-xs text-muted-foreground">
            {complianceStats.activeInvestigations} active investigations
          </div>
          {complianceStats.activeAlerts > 0 && (
            <motion.div
              animate={alertAnimationControls}
              className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800"
            >
              Immediate attention required
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Resolution Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {complianceStats.resolutionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {complianceStats.resolvedViolations} of {complianceStats.totalViolations} resolved
          </div>
          <Progress 
            value={complianceStats.resolutionRate} 
            className="mt-2"
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderMainContent = () => {
    const commonProps = {
      violations: state.violations,
      rules: state.rules,
      metrics: state.metrics,
      alerts: state.alerts,
      investigations: state.investigations,
      selectedViolation: state.selectedViolation,
      selectedRule: state.selectedRule,
      onViolationSelect: handleViolationSelect,
      onRuleSelect: handleRuleSelect,
      height: height - 200
    };

    switch (state.currentView) {
      case 'overview':
        return renderOverviewView(commonProps);
      case 'violations':
        return renderViolationsView(commonProps);
      case 'rules':
        return renderRulesView(commonProps);
      case 'investigations':
        return renderInvestigationsView(commonProps);
      case 'alerts':
        return renderAlertsView(commonProps);
      case 'metrics':
        return renderMetricsView(commonProps);
      case 'reports':
        return renderReportsView(commonProps);
      case 'frameworks':
        return renderFrameworksView(commonProps);
      default:
        return renderOverviewView(commonProps);
    }
  };

  const renderOverviewView = (props: any) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Compliance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Trends</CardTitle>
          <CardDescription>Score and violation trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={violationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="score" stroke="#16a34a" name="Compliance Score" />
              <Line yAxisId="right" type="monotone" dataKey="violations" stroke="#dc2626" name="Violations" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>Breakdown of violations by risk level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Framework Compliance */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Framework Compliance</CardTitle>
          <CardDescription>Compliance scores by framework</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={frameworkCompliance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="framework" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="score" fill="#16a34a" name="Current Score" />
              <Bar dataKey="target" fill="#94a3b8" name="Target Score" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderViolationsView = (props: any) => (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Compliance Violations</h3>
        <div className="flex items-center space-x-2">
          <Input
            ref={searchInputRef}
            placeholder="Search violations..."
            value={state.searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64"
          />
          <Select value={state.layoutMode} onValueChange={handleLayoutChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAYOUT_MODES.map(mode => (
                <SelectItem key={mode.value} value={mode.value}>
                  <div className="flex items-center space-x-2">
                    <mode.icon className="h-4 w-4" />
                    <span>{mode.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Violations List */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <ScrollArea style={{ height: props.height - 100 }}>
                {state.violations.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No compliance violations found</p>
                      <p className="text-sm">All systems are compliant</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {state.violations.map((violation, index) => (
                      <motion.div
                        key={violation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          state.selectedViolation?.id === violation.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleViolationSelect(violation)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge
                                variant={
                                  violation.riskLevel === 'critical' ? 'destructive' :
                                  violation.riskLevel === 'high' ? 'destructive' :
                                  violation.riskLevel === 'medium' ? 'default' : 'secondary'
                                }
                              >
                                {violation.riskLevel.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {violation.frameworks.join(', ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(violation.detectedAt).toLocaleString()}
                              </span>
                            </div>
                            
                            <h4 className="font-medium mb-1">{violation.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {violation.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Rule: {violation.ruleId}</span>
                              <span>Resource: {violation.resourceType}</span>
                              <span>SPA: {violation.sourceSystem}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {violation.riskLevel === 'critical' && (
                              <AlertOctagon className="h-5 w-5 text-red-500 mb-2" />
                            )}
                            {violation.riskLevel === 'high' && (
                              <AlertTriangle className="h-5 w-5 text-orange-500 mb-2" />
                            )}
                            {violation.riskLevel === 'medium' && (
                              <AlertCircle className="h-5 w-5 text-yellow-500 mb-2" />
                            )}
                            {violation.riskLevel === 'low' && (
                              <Info className="h-5 w-5 text-blue-500 mb-2" />
                            )}
                            
                            <Badge
                              variant={
                                violation.status === 'remediated' ? 'default' :
                                violation.status === 'investigating' ? 'secondary' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {violation.status}
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Violation Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Violation Details</CardTitle>
            </CardHeader>
            <CardContent>
              {state.selectedViolation ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <p className="text-sm mt-1">{state.selectedViolation.title}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {state.selectedViolation.description}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Risk Level</Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          state.selectedViolation.riskLevel === 'critical' ? 'destructive' :
                          state.selectedViolation.riskLevel === 'high' ? 'destructive' :
                          state.selectedViolation.riskLevel === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {state.selectedViolation.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Frameworks</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {state.selectedViolation.frameworks.map(framework => (
                        <Badge key={framework} variant="outline" className="text-xs">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Detection Details</Label>
                    <div className="mt-1 text-sm space-y-1">
                      <p>Detected: {new Date(state.selectedViolation.detectedAt).toLocaleString()}</p>
                      <p>Rule: {state.selectedViolation.ruleId}</p>
                      <p>Resource: {state.selectedViolation.resourceType}</p>
                      <p>System: {state.selectedViolation.sourceSystem}</p>
                    </div>
                  </div>
                  
                  {state.selectedViolation.remediationSteps && (
                    <div>
                      <Label className="text-sm font-medium">Remediation Steps</Label>
                      <div className="mt-1 space-y-2">
                        {state.selectedViolation.remediationSteps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <span className="text-muted-foreground">{index + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 pt-4">
                    <Button size="sm" variant="outline">
                      <Flag className="h-4 w-4 mr-2" />
                      Investigate
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a violation to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Additional render functions would continue here...
  const renderRulesView = (props: any) => (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Rules</CardTitle>
          <CardDescription>Active compliance rules and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Rules view implementation in progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInvestigationsView = (props: any) => (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Investigations</CardTitle>
          <CardDescription>Ongoing compliance investigations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Investigations view implementation in progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAlertsView = (props: any) => (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
          <CardDescription>Real-time compliance alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Alerts view implementation in progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetricsView = (props: any) => (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Metrics</CardTitle>
          <CardDescription>Detailed compliance metrics and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Metrics view implementation in progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportsView = (props: any) => (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
          <CardDescription>Generated compliance reports and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Reports view implementation in progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFrameworksView = (props: any) => (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Frameworks</CardTitle>
          <CardDescription>Supported compliance frameworks and standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Frameworks view implementation in progress</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFilterPanel = () => (
    <motion.div
      animate={sidebarAnimationControls}
      initial={{ x: -320 }}
      className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border shadow-lg z-50"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={handleFilterToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-full pb-20">
        <div className="p-4 space-y-6">
          {/* Date Range Filter */}
          <div>
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="mt-2 space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {state.dateRange.start ? state.dateRange.start.toLocaleDateString() : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={state.dateRange.start || undefined}
                    onSelect={(date) => setState(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: date || null }
                    }))}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {state.dateRange.end ? state.dateRange.end.toLocaleDateString() : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={state.dateRange.end || undefined}
                    onSelect={(date) => setState(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: date || null }
                    }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Risk Level Filter */}
          <div>
            <Label className="text-sm font-medium">Risk Levels</Label>
            <div className="mt-2 space-y-2">
              {RISK_LEVELS.map(level => (
                <div key={level} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`risk-${level}`}
                    checked={state.riskLevelFilter.includes(level)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setState(prev => ({
                          ...prev,
                          riskLevelFilter: [...prev.riskLevelFilter, level]
                        }));
                      } else {
                        setState(prev => ({
                          ...prev,
                          riskLevelFilter: prev.riskLevelFilter.filter(l => l !== level)
                        }));
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`risk-${level}`} className="text-sm capitalize">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Framework Filter */}
          <div>
            <Label className="text-sm font-medium">Frameworks</Label>
            <div className="mt-2 space-y-2">
              {COMPLIANCE_FRAMEWORKS.map(framework => (
                <div key={framework} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`framework-${framework}`}
                    checked={state.frameworkFilter.includes(framework)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setState(prev => ({
                          ...prev,
                          frameworkFilter: [...prev.frameworkFilter, framework]
                        }));
                      } else {
                        setState(prev => ({
                          ...prev,
                          frameworkFilter: prev.frameworkFilter.filter(f => f !== framework)
                        }));
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`framework-${framework}`} className="text-sm">
                    {framework}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <div className="mt-2 space-y-2">
              {COMPLIANCE_STATUSES.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`status-${status}`}
                    checked={state.statusFilter.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setState(prev => ({
                          ...prev,
                          statusFilter: [...prev.statusFilter, status]
                        }));
                      } else {
                        setState(prev => ({
                          ...prev,
                          statusFilter: prev.statusFilter.filter(s => s !== status)
                        }));
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor={`status-${status}`} className="text-sm capitalize">
                    {status.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Thresholds */}
          <div>
            <Label className="text-sm font-medium">Alert Thresholds</Label>
            <div className="mt-2 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Critical Risk Threshold: {state.alertThresholds.criticalRisk}%
                </Label>
                <Slider
                  value={[state.alertThresholds.criticalRisk]}
                  onValueChange={([value]) => setState(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, criticalRisk: value }
                  }))}
                  max={100}
                  step={5}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">
                  Compliance Score Threshold: {state.alertThresholds.complianceScore}%
                </Label>
                <Slider
                  value={[state.alertThresholds.complianceScore]}
                  onValueChange={([value]) => setState(prev => ({
                    ...prev,
                    alertThresholds: { ...prev.alertThresholds, complianceScore: value }
                  }))}
                  max={100}
                  step={5}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Apply Filters Button */}
          <Button onClick={loadComplianceViolations} className="w-full">
            Apply Filters
          </Button>
        </div>
      </ScrollArea>
    </motion.div>
  );

  // ================================================================================
  // ERROR HANDLING
  // ================================================================================

  if (Object.values(state.errors).some(error => error !== null)) {
    return (
      <Card className={className} style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Compliance Data</h3>
            <p className="text-muted-foreground mb-4">
              {Object.values(state.errors).find(error => error !== null)}
            </p>
            <Button onClick={refreshComplianceData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ================================================================================
  // MAIN RENDER
  // ================================================================================

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ height }}>
      {/* Hidden Audio Element for Alerts */}
      <audio ref={alertAudioRef} preload="auto">
        <source src="/sounds/alert.mp3" type="audio/mpeg" />
        <source src="/sounds/alert.wav" type="audio/wav" />
      </audio>

      {/* Filter Panel Overlay */}
      <AnimatePresence>
        {state.filterPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={handleFilterToggle}
          />
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {state.filterPanelOpen && renderFilterPanel()}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        animate={mainAnimationControls}
        initial={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col bg-background border border-border rounded-lg overflow-hidden"
      >
        {/* Header Controls */}
        {showControls && renderHeaderControls()}

        {/* Statistics Cards */}
        {renderStatCards()}

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </motion.div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {Object.values(state.loading).some(Boolean) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading compliance data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplianceActivityMonitor;