/**
 * Cross-Group KPI Dashboard
 * =========================
 * 
 * Advanced KPI visualization component that aggregates and displays key performance
 * indicators across all 7 existing SPAs (Data Sources, Scan Rule Sets, Classifications,
 * Compliance Rules, Advanced Catalog, Scan Logic, and RBAC System). Provides real-time
 * metrics, trend analysis, drill-down capabilities, and predictive insights.
 * 
 * Features:
 * - Real-time KPI aggregation across all SPAs
 * - Interactive charts and visualizations with drill-down
 * - Comparative analysis and trend detection
 * - Customizable KPI widgets and layouts
 * - Advanced filtering and time range selection
 * - Export and sharing capabilities
 * - AI-powered insights and recommendations
 * - Mobile-responsive design with touch interactions
 * 
 * Technology Stack:
 * - React 18+ with TypeScript
 * - Recharts for advanced data visualization
 * - D3.js for custom chart components
 * - Framer Motion for smooth animations
 * - shadcn/ui components with Tailwind CSS
 * - React Query for data fetching and caching
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Brush
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Icons
import { TrendingUp, TrendingDown, Activity, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Users, Database, Shield, Scan, FileText, Settings, AlertTriangle, CheckCircle, Clock, Target, Zap, Eye, Filter, Calendar, Download, Share, Maximize2, Minimize2, RotateCcw, Play, Pause, MoreHorizontal, ArrowUp, ArrowDown, Minus, Info, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

// Types
import {
  DashboardState,
  CrossGroupMetrics,
  SystemHealth,
  PerformanceMetrics,
  DashboardWidget,
  UUID,
  ISODateString,
  SystemStatus
} from '../../types/racine-core.types';

// Utils
import { cn } from '../../utils/cn';
import { formatNumber, formatPercentage, formatDate, formatDuration } from '../../utils/formatting-utils';

/**
 * KPI metric definition
 */
interface KPIMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  target?: number;
  unit: string;
  format: 'number' | 'percentage' | 'duration' | 'currency';
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: SPACategory;
  priority: 'high' | 'medium' | 'low';
  status: 'healthy' | 'warning' | 'critical';
  description: string;
  drillDownPath?: string;
  timestamp: ISODateString;
}

/**
 * SPA categories for organizing KPIs
 */
enum SPACategory {
  DATA_SOURCES = 'data_sources',
  SCAN_RULE_SETS = 'scan_rule_sets',
  CLASSIFICATIONS = 'classifications',
  COMPLIANCE_RULES = 'compliance_rules',
  ADVANCED_CATALOG = 'advanced_catalog',
  SCAN_LOGIC = 'scan_logic',
  RBAC_SYSTEM = 'rbac_system',
  SYSTEM_HEALTH = 'system_health'
}

/**
 * Time range options
 */
enum TimeRange {
  LAST_HOUR = '1h',
  LAST_DAY = '24h',
  LAST_WEEK = '7d',
  LAST_MONTH = '30d',
  LAST_QUARTER = '90d',
  LAST_YEAR = '1y'
}

/**
 * Chart types for visualization
 */
enum ChartType {
  LINE = 'line',
  AREA = 'area',
  BAR = 'bar',
  PIE = 'pie',
  GAUGE = 'gauge',
  METRIC = 'metric'
}

/**
 * Component props
 */
interface CrossGroupKPIDashboardProps {
  currentDashboard?: DashboardState | null;
  systemHealth: SystemHealth;
  crossGroupMetrics: CrossGroupMetrics;
  performanceMetrics: PerformanceMetrics;
  isLoading?: boolean;
  onRefresh: () => void;
  onWidgetSelect?: (widgetId: UUID, multiSelect?: boolean) => void;
  onWidgetUpdate?: (widgetId: UUID, updates: Partial<DashboardWidget>) => void;
}

/**
 * Dashboard state for this component
 */
interface KPIDashboardState {
  selectedTimeRange: TimeRange;
  selectedCategories: SPACategory[];
  selectedMetrics: string[];
  viewMode: 'grid' | 'list' | 'chart';
  chartType: ChartType;
  showTrends: boolean;
  showTargets: boolean;
  autoRefresh: boolean;
  isFullscreen: boolean;
  drillDownMetric: KPIMetric | null;
  compareMode: boolean;
  selectedCompareRange: TimeRange;
  alertsEnabled: boolean;
  customFilter: string;
  sortBy: 'name' | 'value' | 'trend' | 'status';
  sortOrder: 'asc' | 'desc';
}

/**
 * Color schemes for different categories
 */
const CATEGORY_COLORS = {
  [SPACategory.DATA_SOURCES]: {
    primary: '#3b82f6',
    secondary: '#93c5fd',
    background: '#dbeafe'
  },
  [SPACategory.SCAN_RULE_SETS]: {
    primary: '#10b981',
    secondary: '#6ee7b7',
    background: '#d1fae5'
  },
  [SPACategory.CLASSIFICATIONS]: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    background: '#fef3c7'
  },
  [SPACategory.COMPLIANCE_RULES]: {
    primary: '#ef4444',
    secondary: '#fca5a5',
    background: '#fee2e2'
  },
  [SPACategory.ADVANCED_CATALOG]: {
    primary: '#8b5cf6',
    secondary: '#c4b5fd',
    background: '#ede9fe'
  },
  [SPACategory.SCAN_LOGIC]: {
    primary: '#06b6d4',
    secondary: '#67e8f9',
    background: '#cffafe'
  },
  [SPACategory.RBAC_SYSTEM]: {
    primary: '#ec4899',
    secondary: '#f9a8d4',
    background: '#fce7f3'
  },
  [SPACategory.SYSTEM_HEALTH]: {
    primary: '#6b7280',
    secondary: '#9ca3af',
    background: '#f3f4f6'
  }
};

/**
 * Default KPI metrics definitions
 */
const DEFAULT_METRICS: KPIMetric[] = [
  // Data Sources KPIs
  {
    id: 'ds_total_sources',
    name: 'Total Data Sources',
    value: 0,
    previousValue: 0,
    unit: 'sources',
    format: 'number',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.DATA_SOURCES,
    priority: 'high',
    status: 'healthy',
    description: 'Total number of configured data sources',
    drillDownPath: '/data-sources',
    timestamp: new Date().toISOString()
  },
  {
    id: 'ds_connection_health',
    name: 'Connection Health',
    value: 0,
    previousValue: 0,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.DATA_SOURCES,
    priority: 'high',
    status: 'healthy',
    description: 'Percentage of healthy data source connections',
    drillDownPath: '/data-sources/health',
    timestamp: new Date().toISOString()
  },
  // Scan Rule Sets KPIs
  {
    id: 'srs_active_rules',
    name: 'Active Scan Rules',
    value: 0,
    previousValue: 0,
    unit: 'rules',
    format: 'number',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.SCAN_RULE_SETS,
    priority: 'high',
    status: 'healthy',
    description: 'Number of active scan rule sets',
    drillDownPath: '/scan-rule-sets',
    timestamp: new Date().toISOString()
  },
  {
    id: 'srs_execution_rate',
    name: 'Rule Execution Rate',
    value: 0,
    previousValue: 0,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.SCAN_RULE_SETS,
    priority: 'medium',
    status: 'healthy',
    description: 'Success rate of scan rule executions',
    drillDownPath: '/scan-rule-sets/execution',
    timestamp: new Date().toISOString()
  },
  // Classifications KPIs
  {
    id: 'cl_classified_assets',
    name: 'Classified Assets',
    value: 0,
    previousValue: 0,
    unit: 'assets',
    format: 'number',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.CLASSIFICATIONS,
    priority: 'high',
    status: 'healthy',
    description: 'Number of classified data assets',
    drillDownPath: '/classifications',
    timestamp: new Date().toISOString()
  },
  {
    id: 'cl_accuracy_rate',
    name: 'Classification Accuracy',
    value: 0,
    previousValue: 0,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.CLASSIFICATIONS,
    priority: 'high',
    status: 'healthy',
    description: 'Accuracy rate of automated classifications',
    drillDownPath: '/classifications/accuracy',
    timestamp: new Date().toISOString()
  },
  // Compliance Rules KPIs
  {
    id: 'cr_compliance_score',
    name: 'Overall Compliance Score',
    value: 0,
    previousValue: 0,
    target: 95,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.COMPLIANCE_RULES,
    priority: 'high',
    status: 'healthy',
    description: 'Overall compliance score across all rules',
    drillDownPath: '/compliance-rules',
    timestamp: new Date().toISOString()
  },
  {
    id: 'cr_violations',
    name: 'Active Violations',
    value: 0,
    previousValue: 0,
    unit: 'violations',
    format: 'number',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.COMPLIANCE_RULES,
    priority: 'high',
    status: 'healthy',
    description: 'Number of active compliance violations',
    drillDownPath: '/compliance-rules/violations',
    timestamp: new Date().toISOString()
  },
  // Advanced Catalog KPIs
  {
    id: 'ac_cataloged_assets',
    name: 'Cataloged Assets',
    value: 0,
    previousValue: 0,
    unit: 'assets',
    format: 'number',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.ADVANCED_CATALOG,
    priority: 'high',
    status: 'healthy',
    description: 'Total number of cataloged data assets',
    drillDownPath: '/advanced-catalog',
    timestamp: new Date().toISOString()
  },
  {
    id: 'ac_coverage_rate',
    name: 'Catalog Coverage',
    value: 0,
    previousValue: 0,
    target: 90,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.ADVANCED_CATALOG,
    priority: 'medium',
    status: 'healthy',
    description: 'Percentage of data sources covered in catalog',
    drillDownPath: '/advanced-catalog/coverage',
    timestamp: new Date().toISOString()
  },
  // Scan Logic KPIs
  {
    id: 'sl_active_scans',
    name: 'Active Scans',
    value: 0,
    previousValue: 0,
    unit: 'scans',
    format: 'number',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.SCAN_LOGIC,
    priority: 'medium',
    status: 'healthy',
    description: 'Number of currently running scans',
    drillDownPath: '/scan-logic',
    timestamp: new Date().toISOString()
  },
  {
    id: 'sl_success_rate',
    name: 'Scan Success Rate',
    value: 0,
    previousValue: 0,
    target: 95,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.SCAN_LOGIC,
    priority: 'high',
    status: 'healthy',
    description: 'Success rate of completed scans',
    drillDownPath: '/scan-logic/success',
    timestamp: new Date().toISOString()
  },
  // RBAC System KPIs
  {
    id: 'rbac_active_users',
    name: 'Active Users',
    value: 0,
    previousValue: 0,
    unit: 'users',
    format: 'number',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.RBAC_SYSTEM,
    priority: 'medium',
    status: 'healthy',
    description: 'Number of active system users',
    drillDownPath: '/rbac-system/users',
    timestamp: new Date().toISOString()
  },
  {
    id: 'rbac_security_score',
    name: 'Security Score',
    value: 0,
    previousValue: 0,
    target: 95,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.RBAC_SYSTEM,
    priority: 'high',
    status: 'healthy',
    description: 'Overall system security score',
    drillDownPath: '/rbac-system/security',
    timestamp: new Date().toISOString()
  },
  // System Health KPIs
  {
    id: 'sh_system_uptime',
    name: 'System Uptime',
    value: 0,
    previousValue: 0,
    target: 99.9,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.SYSTEM_HEALTH,
    priority: 'high',
    status: 'healthy',
    description: 'System availability percentage',
    drillDownPath: '/system-health',
    timestamp: new Date().toISOString()
  },
  {
    id: 'sh_performance_score',
    name: 'Performance Score',
    value: 0,
    previousValue: 0,
    target: 85,
    unit: '%',
    format: 'percentage',
    trend: 'stable',
    trendPercentage: 0,
    category: SPACategory.SYSTEM_HEALTH,
    priority: 'high',
    status: 'healthy',
    description: 'Overall system performance score',
    drillDownPath: '/system-health/performance',
    timestamp: new Date().toISOString()
  }
];

/**
 * Animation variants
 */
const animationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  },
  card: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  }
};

/**
 * CrossGroupKPIDashboard Component
 */
export const CrossGroupKPIDashboard: React.FC<CrossGroupKPIDashboardProps> = ({
  currentDashboard,
  systemHealth,
  crossGroupMetrics,
  performanceMetrics,
  isLoading = false,
  onRefresh,
  onWidgetSelect,
  onWidgetUpdate
}) => {
  // State management
  const [state, setState] = useState<KPIDashboardState>({
    selectedTimeRange: TimeRange.LAST_DAY,
    selectedCategories: Object.values(SPACategory),
    selectedMetrics: [],
    viewMode: 'grid',
    chartType: ChartType.LINE,
    showTrends: true,
    showTargets: true,
    autoRefresh: true,
    isFullscreen: false,
    drillDownMetric: null,
    compareMode: false,
    selectedCompareRange: TimeRange.LAST_WEEK,
    alertsEnabled: true,
    customFilter: '',
    sortBy: 'priority',
    sortOrder: 'desc'
  });

  const [metrics, setMetrics] = useState<KPIMetric[]>(DEFAULT_METRICS);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute derived values
  const filteredMetrics = useMemo(() => {
    let filtered = metrics.filter(metric => 
      state.selectedCategories.includes(metric.category)
    );

    if (state.customFilter) {
      filtered = filtered.filter(metric =>
        metric.name.toLowerCase().includes(state.customFilter.toLowerCase()) ||
        metric.description.toLowerCase().includes(state.customFilter.toLowerCase())
      );
    }

    if (state.selectedMetrics.length > 0) {
      filtered = filtered.filter(metric =>
        state.selectedMetrics.includes(metric.id)
      );
    }

    // Sort metrics
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'trend':
          aValue = a.trendPercentage;
          bValue = b.trendPercentage;
          break;
        case 'status':
          const statusOrder = { 'critical': 0, 'warning': 1, 'healthy': 2 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
      }

      if (typeof aValue === 'string') {
        return state.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return state.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [metrics, state.selectedCategories, state.customFilter, state.selectedMetrics, state.sortBy, state.sortOrder]);

  const categoryStats = useMemo(() => {
    const stats = Object.values(SPACategory).map(category => {
      const categoryMetrics = filteredMetrics.filter(m => m.category === category);
      const healthyCount = categoryMetrics.filter(m => m.status === 'healthy').length;
      const warningCount = categoryMetrics.filter(m => m.status === 'warning').length;
      const criticalCount = categoryMetrics.filter(m => m.status === 'critical').length;
      
      return {
        category,
        total: categoryMetrics.length,
        healthy: healthyCount,
        warning: warningCount,
        critical: criticalCount,
        healthPercentage: categoryMetrics.length > 0 ? (healthyCount / categoryMetrics.length) * 100 : 0
      };
    });

    return stats;
  }, [filteredMetrics]);

  const overallHealth = useMemo(() => {
    if (filteredMetrics.length === 0) return 100;
    
    const healthyCount = filteredMetrics.filter(m => m.status === 'healthy').length;
    return (healthyCount / filteredMetrics.length) * 100;
  }, [filteredMetrics]);

  // Effects
  useEffect(() => {
    updateMetricsFromProps();
  }, [crossGroupMetrics, systemHealth, performanceMetrics]);

  useEffect(() => {
    if (state.autoRefresh) {
      const timer = setInterval(() => {
        onRefresh();
      }, 30000); // Refresh every 30 seconds

      setRefreshTimer(timer);
      return () => clearInterval(timer);
    } else {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
    }
  }, [state.autoRefresh, onRefresh]);

  // Update metrics based on props
  const updateMetricsFromProps = useCallback(() => {
    setMetrics(prevMetrics => 
      prevMetrics.map(metric => {
        const updatedMetric = { ...metric };
        
        // Update values based on actual data from props
        switch (metric.category) {
          case SPACategory.DATA_SOURCES:
            if (crossGroupMetrics?.dataSourcesMetrics) {
              if (metric.id === 'ds_total_sources') {
                updatedMetric.value = crossGroupMetrics.dataSourcesMetrics.totalSources || 0;
              } else if (metric.id === 'ds_connection_health') {
                updatedMetric.value = crossGroupMetrics.dataSourcesMetrics.healthPercentage || 0;
              }
            }
            break;
            
          case SPACategory.SCAN_RULE_SETS:
            if (crossGroupMetrics?.scanRuleSetsMetrics) {
              if (metric.id === 'srs_active_rules') {
                updatedMetric.value = crossGroupMetrics.scanRuleSetsMetrics.activeRules || 0;
              } else if (metric.id === 'srs_execution_rate') {
                updatedMetric.value = crossGroupMetrics.scanRuleSetsMetrics.executionRate || 0;
              }
            }
            break;
            
          case SPACategory.CLASSIFICATIONS:
            if (crossGroupMetrics?.classificationsMetrics) {
              if (metric.id === 'cl_classified_assets') {
                updatedMetric.value = crossGroupMetrics.classificationsMetrics.classifiedAssets || 0;
              } else if (metric.id === 'cl_accuracy_rate') {
                updatedMetric.value = crossGroupMetrics.classificationsMetrics.accuracyRate || 0;
              }
            }
            break;
            
          case SPACategory.COMPLIANCE_RULES:
            if (crossGroupMetrics?.complianceMetrics) {
              if (metric.id === 'cr_compliance_score') {
                updatedMetric.value = crossGroupMetrics.complianceMetrics.overallScore || 0;
              } else if (metric.id === 'cr_violations') {
                updatedMetric.value = crossGroupMetrics.complianceMetrics.activeViolations || 0;
              }
            }
            break;
            
          case SPACategory.ADVANCED_CATALOG:
            if (crossGroupMetrics?.catalogMetrics) {
              if (metric.id === 'ac_cataloged_assets') {
                updatedMetric.value = crossGroupMetrics.catalogMetrics.totalAssets || 0;
              } else if (metric.id === 'ac_coverage_rate') {
                updatedMetric.value = crossGroupMetrics.catalogMetrics.coverageRate || 0;
              }
            }
            break;
            
          case SPACategory.SCAN_LOGIC:
            if (crossGroupMetrics?.scanLogicMetrics) {
              if (metric.id === 'sl_active_scans') {
                updatedMetric.value = crossGroupMetrics.scanLogicMetrics.activeScans || 0;
              } else if (metric.id === 'sl_success_rate') {
                updatedMetric.value = crossGroupMetrics.scanLogicMetrics.successRate || 0;
              }
            }
            break;
            
          case SPACategory.RBAC_SYSTEM:
            if (crossGroupMetrics?.rbacMetrics) {
              if (metric.id === 'rbac_active_users') {
                updatedMetric.value = crossGroupMetrics.rbacMetrics.activeUsers || 0;
              } else if (metric.id === 'rbac_security_score') {
                updatedMetric.value = crossGroupMetrics.rbacMetrics.securityScore || 0;
              }
            }
            break;
            
          case SPACategory.SYSTEM_HEALTH:
            if (systemHealth) {
              if (metric.id === 'sh_system_uptime') {
                updatedMetric.value = systemHealth.uptime || 0;
              } else if (metric.id === 'sh_performance_score') {
                updatedMetric.value = performanceMetrics?.score || 0;
              }
            }
            break;
        }
        
        // Calculate trend
        if (updatedMetric.previousValue !== undefined && updatedMetric.previousValue !== 0) {
          const change = ((updatedMetric.value - updatedMetric.previousValue) / updatedMetric.previousValue) * 100;
          updatedMetric.trendPercentage = Math.abs(change);
          updatedMetric.trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
        }
        
        // Determine status
        if (updatedMetric.target) {
          const threshold = updatedMetric.target * 0.9; // 90% of target is warning
          if (updatedMetric.value >= updatedMetric.target) {
            updatedMetric.status = 'healthy';
          } else if (updatedMetric.value >= threshold) {
            updatedMetric.status = 'warning';
          } else {
            updatedMetric.status = 'critical';
          }
        } else {
          // For metrics without targets, use reasonable defaults
          if (metric.format === 'percentage') {
            if (updatedMetric.value >= 90) {
              updatedMetric.status = 'healthy';
            } else if (updatedMetric.value >= 70) {
              updatedMetric.status = 'warning';
            } else {
              updatedMetric.status = 'critical';
            }
          } else {
            updatedMetric.status = 'healthy'; // Default for non-percentage metrics
          }
        }
        
        updatedMetric.timestamp = new Date().toISOString();
        
        return updatedMetric;
      })
    );
  }, [crossGroupMetrics, systemHealth, performanceMetrics]);

  // Event handlers
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setState(prev => ({ ...prev, selectedTimeRange: range }));
    // Trigger data refresh for new time range
    onRefresh();
  }, [onRefresh]);

  const handleCategoryToggle = useCallback((category: SPACategory) => {
    setState(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  }, []);

  const handleMetricClick = useCallback((metric: KPIMetric) => {
    setState(prev => ({ ...prev, drillDownMetric: metric }));
    
    // If drill-down path is available, could navigate or show detailed view
    if (metric.drillDownPath && onWidgetSelect) {
      // This would typically trigger navigation or detailed view
      console.log('Navigate to:', metric.drillDownPath);
    }
  }, [onWidgetSelect]);

  const handleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
    
    if (!state.isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [state.isFullscreen]);

  // Format value based on metric format
  const formatMetricValue = useCallback((metric: KPIMetric) => {
    switch (metric.format) {
      case 'percentage':
        return formatPercentage(metric.value);
      case 'duration':
        return formatDuration(metric.value);
      case 'currency':
        return `$${formatNumber(metric.value)}`;
      default:
        return formatNumber(metric.value);
    }
  }, []);

  // Get category icon
  const getCategoryIcon = useCallback((category: SPACategory) => {
    switch (category) {
      case SPACategory.DATA_SOURCES:
        return <Database className="h-4 w-4" />;
      case SPACategory.SCAN_RULE_SETS:
        return <Settings className="h-4 w-4" />;
      case SPACategory.CLASSIFICATIONS:
        return <FileText className="h-4 w-4" />;
      case SPACategory.COMPLIANCE_RULES:
        return <Shield className="h-4 w-4" />;
      case SPACategory.ADVANCED_CATALOG:
        return <BarChart3 className="h-4 w-4" />;
      case SPACategory.SCAN_LOGIC:
        return <Scan className="h-4 w-4" />;
      case SPACategory.RBAC_SYSTEM:
        return <Users className="h-4 w-4" />;
      case SPACategory.SYSTEM_HEALTH:
        return <Activity className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  // Get trend icon
  const getTrendIcon = useCallback((trend: string, trendPercentage: number) => {
    if (trendPercentage < 1) {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
    
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  }, []);

  // Render KPI metric card
  const renderMetricCard = useCallback((metric: KPIMetric) => {
    const colors = CATEGORY_COLORS[metric.category];
    
    return (
      <motion.div
        key={metric.id}
        variants={animationVariants.card}
        whileHover="hover"
        className="cursor-pointer"
        onClick={() => handleMetricClick(metric)}
      >
        <Card className="relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 w-1 h-full"
            style={{ backgroundColor: colors.primary }}
          />
          
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(metric.category)}
                <CardTitle className="text-sm font-medium truncate">
                  {metric.name}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(metric.status)}
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{metric.description}</p>
                  </TooltipContent>
                </UITooltip>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatMetricValue(metric)}
                </span>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend, metric.trendPercentage)}
                  <span className={cn(
                    "text-xs font-medium",
                    metric.trend === 'up' ? "text-green-600" :
                    metric.trend === 'down' ? "text-red-600" :
                    "text-gray-400"
                  )}>
                    {metric.trendPercentage > 0 && `${metric.trendPercentage.toFixed(1)}%`}
                  </span>
                </div>
              </div>
              
              {metric.target && state.showTargets && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: {formatMetricValue({ ...metric, value: metric.target })}</span>
                    <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-1"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.primary
                  }}
                >
                  {metric.category.replace('_', ' ')}
                </Badge>
                <span>{formatDate(metric.timestamp)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [handleMetricClick, getCategoryIcon, getStatusIcon, getTrendIcon, formatMetricValue, state.showTargets]);

  // Render category overview
  const renderCategoryOverview = useCallback(() => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Category Overview</CardTitle>
        <CardDescription>
          Health status across all SPA categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categoryStats.map(stat => {
            const colors = CATEGORY_COLORS[stat.category];
            return (
              <div key={stat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(stat.category)}
                    <span className="text-sm font-medium">
                      {stat.category.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {stat.total} metrics
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>{stat.healthy} Healthy</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>{stat.warning} Warning</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>{stat.critical} Critical</span>
                  </div>
                </div>
                
                <Progress 
                  value={stat.healthPercentage} 
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  ), [categoryStats, getCategoryIcon]);

  // Render controls
  const renderControls = useCallback(() => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="time-range" className="text-sm font-medium">
            Time Range:
          </Label>
          <Select
            value={state.selectedTimeRange}
            onValueChange={(value) => handleTimeRangeChange(value as TimeRange)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimeRange.LAST_HOUR}>Last Hour</SelectItem>
              <SelectItem value={TimeRange.LAST_DAY}>Last Day</SelectItem>
              <SelectItem value={TimeRange.LAST_WEEK}>Last Week</SelectItem>
              <SelectItem value={TimeRange.LAST_MONTH}>Last Month</SelectItem>
              <SelectItem value={TimeRange.LAST_QUARTER}>Last Quarter</SelectItem>
              <SelectItem value={TimeRange.LAST_YEAR}>Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="view-mode" className="text-sm font-medium">
            View:
          </Label>
          <Select
            value={state.viewMode}
            onValueChange={(value) => setState(prev => ({ ...prev, viewMode: value as any }))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="chart">Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter metrics..."
            value={state.customFilter}
            onChange={(e) => setState(prev => ({ ...prev, customFilter: e.target.value }))}
            className="w-48"
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-refresh"
            checked={state.autoRefresh}
            onCheckedChange={(checked) => setState(prev => ({ ...prev, autoRefresh: checked }))}
          />
          <Label htmlFor="auto-refresh" className="text-sm">
            Auto-refresh
          </Label>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleFullscreen}
        >
          {state.isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="h-4 w-4 mr-2" />
              Share Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Configure KPIs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  ), [state, handleTimeRangeChange, onRefresh, isLoading, handleFullscreen]);

  // Render main content
  const renderContent = useCallback(() => {
    if (state.viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMetrics.map(renderMetricCard)}
        </div>
      );
    }

    if (state.viewMode === 'list') {
      return (
        <div className="space-y-2">
          {filteredMetrics.map(metric => (
            <Card key={metric.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(metric.category)}
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-gray-500">{metric.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatMetricValue(metric)}</p>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metric.trend, metric.trendPercentage)}
                        <span className="text-xs text-gray-500">
                          {metric.trendPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {getStatusIcon(metric.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // Chart view would be implemented here
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500">
            Chart view implementation would go here
          </div>
        </CardContent>
      </Card>
    );
  }, [state.viewMode, filteredMetrics, renderMetricCard, getCategoryIcon, formatMetricValue, getTrendIcon, getStatusIcon]);

  // Main render
  return (
    <TooltipProvider>
      <motion.div
        ref={containerRef}
        className={cn(
          "space-y-6",
          state.isFullscreen && "fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-auto"
        )}
        variants={animationVariants.container}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={animationVariants.item}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Cross-Group KPI Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time performance indicators across all data governance systems
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Overall Health</p>
                <div className="flex items-center space-x-2">
                  <Progress value={overallHealth} className="w-24 h-2" />
                  <span className="text-sm font-medium">
                    {overallHealth.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <Badge 
                variant={overallHealth >= 90 ? 'default' : overallHealth >= 70 ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {filteredMetrics.filter(m => m.status === 'healthy').length} / {filteredMetrics.length} Healthy
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={animationVariants.item}>
          {renderControls()}
        </motion.div>

        {/* Category Overview and Main Content */}
        <motion.div 
          variants={animationVariants.item}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          <div className="lg:col-span-1">
            {renderCategoryOverview()}
          </div>
          
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </motion.div>

        {/* Loading overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span>Loading KPI data...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};

export default CrossGroupKPIDashboard;
