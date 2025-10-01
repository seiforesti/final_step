'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BarChart3, PieChart, LineChart, TrendingUp, TrendingDown, Activity, Target, Shield, AlertTriangle, CheckCircle2, XCircle, Clock, Users, User as UserIcon, Database, Server, Globe, MapPin, Smartphone, Monitor, Key, Lock, Unlock, Settings, RefreshCw, Download, Share, Filter, Search, Calendar, Eye, EyeOff, MoreHorizontal, Maximize2, Minimize2, Grid, List, Layers, Zap, Brain, Lightbulb, Flag, Tag, Star, Bookmark, Bell, Mail, Phone, Building, Network, Wifi, Cpu, HardDrive, Archive, Package, Box, Truck, File, FileText, Image, Video, Music, Code, Terminal, Command, GitBranch, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, ArrowUpDown, SortAsc, SortDesc, ExternalLink, Link, Copy, Edit, Trash2, Save, Upload, Gauge, Radar, Crosshair, Compass, Navigation, Route } from 'lucide-react';
import { cn } from '@/lib copie/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useRBACWebSocket } from '../../hooks/useRBACWebSocket';
import { useNotifications } from '../../hooks/useNotifications';
import { format, formatDistanceToNow, parseISO, subDays, subHours, subMinutes, startOfHour, startOfDay, startOfWeek, startOfMonth, endOfDay, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import type { AuditLogFilters } from '../../types/audit.types';
import type { User } from '../../types/user.types';

// ===================== INTERFACES & TYPES =====================

interface AuditDashboardProps {
  className?: string;
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'custom';
  refreshInterval?: number;
  enableRealTime?: boolean;
  showPredictiveAnalytics?: boolean;
  showAnomalyDetection?: boolean;
  showComplianceMetrics?: boolean;
  showThreatIntelligence?: boolean;
  enableDrillDown?: boolean;
  enableExport?: boolean;
  customWidgets?: DashboardWidget[];
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'timeline' | 'gauge' | 'heatmap' | 'custom';
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  dataSource: string;
  refreshInterval?: number;
  isVisible: boolean;
  permissions?: string[];
}

interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'stable';
  format: 'number' | 'percentage' | 'currency' | 'duration' | 'bytes';
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  trend?: Array<{ timestamp: string; value: number }>;
  target?: number;
  threshold?: { warning: number; critical: number };
  description?: string;
  link?: string;
}

interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'funnel';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  colors?: string[];
  options?: Record<string, any>;
}

interface AnomalyAlert {
  id: string;
  type: 'statistical' | 'behavioral' | 'temporal' | 'volumetric' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  confidence: number;
  affectedMetric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  relatedEvents: string[];
  recommendations: string[];
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignee?: User;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata: Record<string, any>;
}

interface ThreatIndicator {
  id: string;
  type: 'ip' | 'user' | 'pattern' | 'signature' | 'behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  value: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  frequency: number;
  sources: string[];
  relatedIncidents: string[];
  mitigation: string[];
  iocType: 'hash' | 'ip' | 'domain' | 'url' | 'email' | 'user_agent' | 'file_path';
  tags: string[];
  status: 'active' | 'investigating' | 'mitigated' | 'false_positive';
}

interface ComplianceMetric {
  framework: string;
  score: number;
  maxScore: number;
  percentage: number;
  trend: 'improving' | 'stable' | 'declining';
  violations: Array<{
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    lastOccurrence: string;
  }>;
  requirements: Array<{
    id: string;
    name: string;
    status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
    coverage: number;
    lastAssessed: string;
  }>;
  recommendations: string[];
  deadline?: string;
  certification?: {
    status: 'certified' | 'pending' | 'expired' | 'failed';
    expiryDate?: string;
    auditor?: string;
  };
}

interface PredictiveInsight {
  id: string;
  type: 'trend' | 'forecast' | 'anomaly_prediction' | 'risk_assessment' | 'capacity_planning';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'performance' | 'compliance' | 'capacity' | 'cost';
  predictions: Array<{
    timestamp: string;
    value: number;
    confidence: number;
    factors: string[];
  }>;
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  modelInfo: {
    name: string;
    version: string;
    accuracy: number;
    lastTrained: string;
    features: string[];
  };
}

interface GeographicData {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  coordinates: { lat: number; lng: number };
  eventCount: number;
  riskScore: number;
  topEvents: Array<{ type: string; count: number }>;
  isBlocked: boolean;
  isSuspicious: boolean;
  lastActivity: string;
}

interface UserBehaviorProfile {
  userId: number;
  user: User;
  riskScore: number;
  baselineBehavior: {
    averageSessionDuration: number;
    commonLocations: string[];
    typicalHours: number[];
    frequentActions: string[];
    deviceFingerprints: string[];
  };
  recentBehavior: {
    sessionDuration: number;
    location: string;
    activeHours: number[];
    actions: string[];
    devices: string[];
    anomalies: string[];
  };
  riskFactors: Array<{
    factor: string;
    weight: number;
    value: any;
    risk: number;
    description: string;
  }>;
  alerts: AnomalyAlert[];
  recommendations: string[];
  lastAnalyzed: string;
}

// ===================== CONSTANTS =====================

const DEFAULT_METRICS: MetricCard[] = [
  {
    id: 'total_events',
    title: 'Total Events',
    value: 0,
    format: 'number',
    icon: <Activity className="h-5 w-5" />,
    color: 'blue',
    description: 'Total audit events in selected time range'
  },
  {
    id: 'security_incidents',
    title: 'Security Incidents',
    value: 0,
    format: 'number',
    icon: <Shield className="h-5 w-5" />,
    color: 'red',
    threshold: { warning: 5, critical: 10 },
    description: 'Critical security events requiring attention'
  },
  {
    id: 'failed_operations',
    title: 'Failed Operations',
    value: 0,
    format: 'number',
    icon: <XCircle className="h-5 w-5" />,
    color: 'yellow',
    threshold: { warning: 50, critical: 100 },
    description: 'Operations that resulted in errors or failures'
  },
  {
    id: 'active_users',
    title: 'Active Users',
    value: 0,
    format: 'number',
    icon: <Users className="h-5 w-5" />,
    color: 'green',
    description: 'Unique users with activity in selected time range'
  },
  {
    id: 'compliance_score',
    title: 'Compliance Score',
    value: 0,
    format: 'percentage',
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'green',
    target: 95,
    threshold: { warning: 85, critical: 75 },
    description: 'Overall compliance score across all frameworks'
  },
  {
    id: 'threat_level',
    title: 'Threat Level',
    value: 'Low',
    format: 'number',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'yellow',
    description: 'Current threat level based on security analysis'
  },
  {
    id: 'response_time',
    title: 'Avg Response Time',
    value: 0,
    format: 'duration',
    icon: <Clock className="h-5 w-5" />,
    color: 'purple',
    threshold: { warning: 1000, critical: 5000 },
    description: 'Average response time for audit operations'
  },
  {
    id: 'data_volume',
    title: 'Data Processed',
    value: 0,
    format: 'bytes',
    icon: <Database className="h-5 w-5" />,
    color: 'blue',
    description: 'Total volume of data processed'
  }
];

const TIME_RANGE_OPTIONS = [
  { value: 'hour', label: 'Last Hour', duration: 1 },
  { value: 'day', label: 'Last 24 Hours', duration: 24 },
  { value: 'week', label: 'Last 7 Days', duration: 168 },
  { value: 'month', label: 'Last 30 Days', duration: 720 },
  { value: 'custom', label: 'Custom Range', duration: 0 }
];

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

const COMPLIANCE_FRAMEWORKS = [
  { id: 'gdpr', name: 'GDPR', fullName: 'General Data Protection Regulation' },
  { id: 'sox', name: 'SOX', fullName: 'Sarbanes-Oxley Act' },
  { id: 'hipaa', name: 'HIPAA', fullName: 'Health Insurance Portability and Accountability Act' },
  { id: 'pci', name: 'PCI-DSS', fullName: 'Payment Card Industry Data Security Standard' },
  { id: 'iso27001', name: 'ISO 27001', fullName: 'Information Security Management' },
  { id: 'nist', name: 'NIST', fullName: 'National Institute of Standards and Technology' }
];

// ===================== MAIN COMPONENT =====================

export const AuditDashboard: React.FC<AuditDashboardProps> = ({
  className,
  timeRange = 'day',
  refreshInterval = 30000,
  enableRealTime = true,
  showPredictiveAnalytics = true,
  showAnomalyDetection = true,
  showComplianceMetrics = true,
  showThreatIntelligence = true,
  enableDrillDown = true,
  enableExport = true,
  customWidgets = []
}) => {
  // ===================== HOOKS & STATE =====================

  const { currentUser } = useCurrentUser();
  const { checkPermission } = usePermissionCheck();
  const { isConnected, subscribe, unsubscribe } = useRBACWebSocket();
  const { sendNotification } = useNotifications();
  const { getAuditAnalytics, getAuditLogStatistics } = useAuditLogs({}, false);

  // Dashboard state
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(enableRealTime);

  // Data state
  const [metrics, setMetrics] = useState<MetricCard[]>(DEFAULT_METRICS);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([]);
  const [threatIndicators, setThreatIndicators] = useState<ThreatIndicator[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [userBehaviorProfiles, setUserBehaviorProfiles] = useState<UserBehaviorProfile[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>({});

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    dataFreshness: 0,
    errorRate: 0
  });

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadStartTimeRef = useRef<number>(0);

  // ===================== COMPUTED VALUES =====================

  const dateRangeFilter = useMemo(() => {
    if (customDateRange) {
      return { startDate: customDateRange.start, endDate: customDateRange.end };
    }

    const now = new Date();
    switch (selectedTimeRange) {
      case 'hour':
        return { startDate: subHours(now, 1), endDate: now };
      case 'day':
        return { startDate: subDays(now, 1), endDate: now };
      case 'week':
        return { startDate: subDays(now, 7), endDate: now };
      case 'month':
        return { startDate: subDays(now, 30), endDate: now };
      default:
        return { startDate: subDays(now, 1), endDate: now };
    }
  }, [selectedTimeRange, customDateRange]);

  const criticalAlerts = useMemo(() => {
    return anomalyAlerts.filter(alert => 
      alert.severity === 'critical' && alert.status === 'new'
    );
  }, [anomalyAlerts]);

  const highThreatIndicators = useMemo(() => {
    return threatIndicators.filter(indicator => 
      (indicator.severity === 'high' || indicator.severity === 'critical') && 
      indicator.status === 'active'
    );
  }, [threatIndicators]);

  const overallComplianceScore = useMemo(() => {
    if (complianceMetrics.length === 0) return 0;
    return Math.round(
      complianceMetrics.reduce((sum, metric) => sum + metric.percentage, 0) / 
      complianceMetrics.length
    );
  }, [complianceMetrics]);

  const systemHealthScore = useMemo(() => {
    const securityIncidents = metrics.find(m => m.id === 'security_incidents')?.value as number || 0;
    const complianceScore = overallComplianceScore;
    const threatLevel = highThreatIndicators.length;
    const criticalAlertsCount = criticalAlerts.length;

    let score = 100;
    score -= Math.min(securityIncidents * 5, 30);
    score -= Math.min((100 - complianceScore) * 0.5, 20);
    score -= Math.min(threatLevel * 10, 25);
    score -= Math.min(criticalAlertsCount * 8, 25);

    return Math.max(score, 0);
  }, [metrics, overallComplianceScore, highThreatIndicators, criticalAlerts]);

  // ===================== EFFECTS =====================

  useEffect(() => {
    loadDashboardData();
  }, [dateRangeFilter]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        loadDashboardData();
        setLastRefresh(new Date());
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, dateRangeFilter]);

  useEffect(() => {
    if (enableRealTime && isConnected) {
      const subscription = subscribe('audit_dashboard', (data: any) => {
        if (data.type === 'metric_update') {
          updateMetric(data.metricId, data.value);
        } else if (data.type === 'anomaly_detected') {
          handleNewAnomaly(data.anomaly);
        } else if (data.type === 'threat_detected') {
          handleNewThreat(data.threat);
        }
      });

      return () => unsubscribe(subscription);
    }
  }, [enableRealTime, isConnected, subscribe, unsubscribe]);

  // ===================== HANDLERS =====================

  const loadDashboardData = async () => {
    try {
      loadStartTimeRef.current = Date.now();
      setIsLoading(true);

      const filters = {
        ...dateRangeFilter,
        ...filters
      };

      // Load all dashboard data in parallel
      await Promise.all([
        loadMetrics(filters),
        loadChartData(filters),
        loadAnomalyDetection(filters),
        loadThreatIntelligence(filters),
        loadComplianceData(filters),
        loadPredictiveAnalytics(filters),
        loadGeographicData(filters),
        loadUserBehaviorData(filters)
      ]);

      // Calculate performance metrics
      const loadTime = Date.now() - loadStartTimeRef.current;
      setPerformanceMetrics(prev => ({
        ...prev,
        loadTime,
        dataFreshness: Date.now()
      }));

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      
      setPerformanceMetrics(prev => ({
        ...prev,
        errorRate: prev.errorRate + 1
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async (filters: any) => {
    try {
      const analytics = await getAuditAnalytics(filters);
      if (analytics.success && analytics.data) {
        const updatedMetrics = DEFAULT_METRICS.map(metric => {
          let value = metric.value;
          let change = undefined;
          let changeType = undefined;

          switch (metric.id) {
            case 'total_events':
              value = analytics.data.totalEvents || 0;
              break;
            case 'security_incidents':
              value = analytics.data.securityIncidents || 0;
              break;
            case 'failed_operations':
              value = analytics.data.failedOperations || 0;
              break;
            case 'active_users':
              value = analytics.data.activeUsers || 0;
              break;
            case 'compliance_score':
              value = overallComplianceScore;
              break;
            case 'threat_level':
              value = highThreatIndicators.length > 0 ? 'High' : 
                     threatIndicators.length > 0 ? 'Medium' : 'Low';
              break;
            case 'response_time':
              value = analytics.data.averageResponseTime || 0;
              break;
            case 'data_volume':
              value = analytics.data.dataVolume || 0;
              break;
          }

          // Calculate change if previous value exists
          if (metric.previousValue !== undefined && typeof value === 'number' && typeof metric.previousValue === 'number') {
            change = ((value - metric.previousValue) / metric.previousValue) * 100;
            changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable';
          }

          return {
            ...metric,
            value,
            previousValue: metric.value,
            change,
            changeType
          };
        });

        setMetrics(updatedMetrics);
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadChartData = async (filters: any) => {
    try {
      // Generate sample chart data - in real implementation, this would fetch from API
      const charts: ChartData[] = [
        {
          id: 'events_timeline',
          type: 'line',
          title: 'Events Over Time',
          data: generateTimeSeriesData(24, 'hour'),
          xAxis: 'timestamp',
          yAxis: 'count',
          colors: [CHART_COLORS[0]]
        },
        {
          id: 'event_types',
          type: 'pie',
          title: 'Event Types Distribution',
          data: [
            { name: 'Authentication', value: 1234, color: CHART_COLORS[0] },
            { name: 'Authorization', value: 987, color: CHART_COLORS[1] },
            { name: 'Data Access', value: 654, color: CHART_COLORS[2] },
            { name: 'Configuration', value: 432, color: CHART_COLORS[3] },
            { name: 'System', value: 321, color: CHART_COLORS[4] }
          ]
        },
        {
          id: 'user_activity',
          type: 'bar',
          title: 'Top User Activity',
          data: generateUserActivityData(),
          xAxis: 'user',
          yAxis: 'events',
          colors: [CHART_COLORS[2]]
        },
        {
          id: 'security_events',
          type: 'area',
          title: 'Security Events Trend',
          data: generateTimeSeriesData(7, 'day'),
          xAxis: 'timestamp',
          yAxis: 'count',
          colors: [CHART_COLORS[1]]
        }
      ];

      setChartData(charts);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const loadAnomalyDetection = async (filters: any) => {
    if (!showAnomalyDetection) return;

    try {
      // Generate sample anomaly data
      const anomalies: AnomalyAlert[] = [
        {
          id: 'anomaly_1',
          type: 'statistical',
          severity: 'high',
          title: 'Unusual Login Volume',
          description: 'Login attempts are 300% above baseline',
          timestamp: new Date().toISOString(),
          confidence: 0.92,
          affectedMetric: 'login_attempts',
          expectedValue: 150,
          actualValue: 450,
          deviation: 300,
          relatedEvents: ['auth_001', 'auth_002'],
          recommendations: ['Monitor authentication patterns', 'Review security logs'],
          status: 'new',
          metadata: { source: 'ml_model_v2', threshold: 2.5 }
        },
        {
          id: 'anomaly_2',
          type: 'behavioral',
          severity: 'medium',
          title: 'Abnormal Data Access Pattern',
          description: 'User accessing unusual resources outside normal hours',
          timestamp: subHours(new Date(), 2).toISOString(),
          confidence: 0.78,
          affectedMetric: 'data_access',
          expectedValue: 0,
          actualValue: 25,
          deviation: 25,
          relatedEvents: ['data_001'],
          recommendations: ['Verify user identity', 'Check access permissions'],
          status: 'investigating',
          metadata: { userId: 12345, resources: ['sensitive_db'] }
        }
      ];

      setAnomalyAlerts(anomalies);
    } catch (error) {
      console.error('Failed to load anomaly detection data:', error);
    }
  };

  const loadThreatIntelligence = async (filters: any) => {
    if (!showThreatIntelligence) return;

    try {
      // Generate sample threat data
      const threats: ThreatIndicator[] = [
        {
          id: 'threat_1',
          type: 'ip',
          severity: 'high',
          title: 'Suspicious IP Address',
          description: 'Multiple failed login attempts from known malicious IP',
          value: '192.168.1.100',
          confidence: 0.89,
          firstSeen: subDays(new Date(), 2).toISOString(),
          lastSeen: new Date().toISOString(),
          frequency: 15,
          sources: ['threat_feed_1', 'internal_detection'],
          relatedIncidents: ['inc_001'],
          mitigation: ['Block IP address', 'Monitor for pattern changes'],
          iocType: 'ip',
          tags: ['brute_force', 'external'],
          status: 'active'
        }
      ];

      setThreatIndicators(threats);
    } catch (error) {
      console.error('Failed to load threat intelligence data:', error);
    }
  };

  const loadComplianceData = async (filters: any) => {
    if (!showComplianceMetrics) return;

    try {
      // Generate sample compliance data
      const compliance: ComplianceMetric[] = COMPLIANCE_FRAMEWORKS.map(framework => ({
        framework: framework.id,
        score: Math.floor(Math.random() * 20) + 80,
        maxScore: 100,
        percentage: Math.floor(Math.random() * 20) + 80,
        trend: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any,
        violations: [
          {
            rule: 'Data Encryption',
            severity: 'medium' as any,
            count: Math.floor(Math.random() * 5),
            lastOccurrence: subDays(new Date(), Math.floor(Math.random() * 7)).toISOString()
          }
        ],
        requirements: [
          {
            id: 'req_1',
            name: 'Access Controls',
            status: 'compliant' as any,
            coverage: 95,
            lastAssessed: subDays(new Date(), 30).toISOString()
          }
        ],
        recommendations: ['Improve data encryption', 'Update access policies']
      }));

      setComplianceMetrics(compliance);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    }
  };

  const loadPredictiveAnalytics = async (filters: any) => {
    if (!showPredictiveAnalytics) return;

    try {
      // Generate sample predictive insights
      const insights: PredictiveInsight[] = [
        {
          id: 'prediction_1',
          type: 'trend',
          title: 'Expected Security Incident Increase',
          description: 'Model predicts 25% increase in security incidents next week',
          confidence: 0.83,
          timeframe: 'Next 7 days',
          impact: 'medium',
          category: 'security',
          predictions: Array.from({ length: 7 }, (_, i) => ({
            timestamp: format(new Date(Date.now() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            value: Math.random() * 10 + 5,
            confidence: 0.8 + Math.random() * 0.15,
            factors: ['increased_login_attempts', 'new_threat_signatures']
          })),
          recommendations: [
            {
              action: 'Increase monitoring frequency',
              priority: 'high',
              effort: 'low',
              impact: 'medium',
              timeline: 'Immediate'
            }
          ],
          modelInfo: {
            name: 'Security Trend Predictor',
            version: '2.1.0',
            accuracy: 0.84,
            lastTrained: subDays(new Date(), 7).toISOString(),
            features: ['historical_incidents', 'threat_intel', 'user_behavior']
          }
        }
      ];

      setPredictiveInsights(insights);
    } catch (error) {
      console.error('Failed to load predictive analytics:', error);
    }
  };

  const loadGeographicData = async (filters: any) => {
    try {
      // Generate sample geographic data
      const geoData: GeographicData[] = [
        {
          country: 'United States',
          countryCode: 'US',
          city: 'New York',
          coordinates: { lat: 40.7128, lng: -74.0060 },
          eventCount: 1234,
          riskScore: 25,
          topEvents: [
            { type: 'login', count: 800 },
            { type: 'data_access', count: 300 },
            { type: 'config_change', count: 134 }
          ],
          isBlocked: false,
          isSuspicious: false,
          lastActivity: new Date().toISOString()
        },
        {
          country: 'China',
          countryCode: 'CN',
          coordinates: { lat: 39.9042, lng: 116.4074 },
          eventCount: 156,
          riskScore: 85,
          topEvents: [
            { type: 'failed_login', count: 120 },
            { type: 'blocked_access', count: 36 }
          ],
          isBlocked: true,
          isSuspicious: true,
          lastActivity: subHours(new Date(), 2).toISOString()
        }
      ];

      setGeographicData(geoData);
    } catch (error) {
      console.error('Failed to load geographic data:', error);
    }
  };

  const loadUserBehaviorData = async (filters: any) => {
    try {
      // Generate sample user behavior data
      const behaviorData: UserBehaviorProfile[] = [
        {
          userId: 1,
          user: { id: 1, email: 'john.doe@company.com', name: 'John Doe' } as User,
          riskScore: 35,
          baselineBehavior: {
            averageSessionDuration: 480,
            commonLocations: ['New York', 'Boston'],
            typicalHours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
            frequentActions: ['login', 'read_document', 'send_email'],
            deviceFingerprints: ['device_001', 'device_002']
          },
          recentBehavior: {
            sessionDuration: 720,
            location: 'London',
            activeHours: [22, 23, 0, 1, 2],
            actions: ['login', 'access_database', 'download_file'],
            devices: ['device_003'],
            anomalies: ['unusual_location', 'late_hours', 'new_device']
          },
          riskFactors: [
            {
              factor: 'Location Anomaly',
              weight: 0.3,
              value: 'London (unusual)',
              risk: 60,
              description: 'Access from unusual geographic location'
            },
            {
              factor: 'Time Anomaly',
              weight: 0.25,
              value: 'Late night hours',
              risk: 40,
              description: 'Activity outside normal business hours'
            }
          ],
          alerts: [],
          recommendations: ['Verify identity', 'Monitor activity patterns'],
          lastAnalyzed: new Date().toISOString()
        }
      ];

      setUserBehaviorProfiles(behaviorData);
    } catch (error) {
      console.error('Failed to load user behavior data:', error);
    }
  };

  // Helper functions for generating sample data
  const generateTimeSeriesData = (points: number, interval: 'hour' | 'day') => {
    return Array.from({ length: points }, (_, i) => {
      const timestamp = interval === 'hour' 
        ? subHours(new Date(), points - i - 1)
        : subDays(new Date(), points - i - 1);
      
      return {
        timestamp: format(timestamp, interval === 'hour' ? 'HH:mm' : 'MM/dd'),
        count: Math.floor(Math.random() * 100) + 50,
        date: timestamp.toISOString()
      };
    });
  };

  const generateUserActivityData = () => {
    const users = ['john.doe', 'jane.smith', 'mike.johnson', 'sarah.wilson', 'tom.brown'];
    return users.map(user => ({
      user,
      events: Math.floor(Math.random() * 200) + 50,
      risk: Math.floor(Math.random() * 100)
    }));
  };

  const updateMetric = (metricId: string, value: any) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === metricId 
        ? { ...metric, previousValue: metric.value, value }
        : metric
    ));
  };

  const handleNewAnomaly = (anomaly: AnomalyAlert) => {
    setAnomalyAlerts(prev => [anomaly, ...prev]);
    
    if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
      toast.error(`Anomaly Detected: ${anomaly.title}`, {
        description: anomaly.description,
        action: {
          label: 'Investigate',
          onClick: () => setActiveTab('anomalies')
        }
      });
    }
  };

  const handleNewThreat = (threat: ThreatIndicator) => {
    setThreatIndicators(prev => [threat, ...prev]);
    
    if (threat.severity === 'critical' || threat.severity === 'high') {
      toast.error(`Threat Detected: ${threat.title}`, {
        description: threat.description,
        action: {
          label: 'View Details',
          onClick: () => setActiveTab('threats')
        }
      });
    }
  };

  const handleExportDashboard = async () => {
    try {
      const dashboardData = {
        metrics,
        chartData,
        anomalyAlerts,
        threatIndicators,
        complianceMetrics,
        generatedAt: new Date().toISOString(),
        timeRange: selectedTimeRange,
        dateRange: dateRangeFilter
      };

      const blob = new Blob([JSON.stringify(dashboardData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-dashboard-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Dashboard data exported successfully');
    } catch (error) {
      console.error('Failed to export dashboard:', error);
      toast.error('Failed to export dashboard data');
    }
  };

  // ===================== RENDER HELPERS =====================

  const formatMetricValue = (value: number | string, format: string) => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'number':
        return value.toLocaleString();
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'duration':
        return `${value}ms`;
      case 'bytes':
        if (value < 1024) return `${value} B`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
        if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
        return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
      default:
        return value.toString();
    }
  };

  const getMetricColor = (metric: MetricCard) => {
    if (metric.threshold && typeof metric.value === 'number') {
      if (metric.value >= metric.threshold.critical) return 'red';
      if (metric.value >= metric.threshold.warning) return 'yellow';
    }
    return metric.color;
  };

  const renderMetricCard = (metric: MetricCard) => {
    const color = getMetricColor(metric);
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200'
    };

    return (
      <Card key={metric.id} className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={cn("p-2 rounded-lg", colorClasses[color])}>
                  {metric.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatMetricValue(metric.value, metric.format)}
                  </p>
                </div>
              </div>

              {metric.change !== undefined && (
                <div className="flex items-center space-x-1">
                  {metric.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : metric.changeType === 'decrease' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Target className="h-4 w-4 text-gray-600" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    metric.changeType === 'increase' ? "text-green-600" :
                    metric.changeType === 'decrease' ? "text-red-600" : "text-gray-600"
                  )}>
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">vs previous</span>
                </div>
              )}
            </div>

            {metric.target && typeof metric.value === 'number' && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-sm font-medium">
                  {formatMetricValue(metric.target, metric.format)}
                </p>
                <Progress 
                  value={(metric.value / metric.target) * 100} 
                  className="h-2 w-16 mt-1"
                />
              </div>
            )}
          </div>

          {metric.description && (
            <p className="text-xs text-muted-foreground mt-4">
              {metric.description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.slice(0, 8).map(renderMetricCard)}
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="h-5 w-5" />
            <span>System Health Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Health</span>
                  <span className="text-2xl font-bold">{systemHealthScore}%</span>
                </div>
                <Progress value={systemHealthScore} className="h-3" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Critical Alerts</span>
                  <span className="font-medium text-red-600">{criticalAlerts.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Threats</span>
                  <span className="font-medium text-orange-600">{highThreatIndicators.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Compliance Score</span>
                  <span className="font-medium text-green-600">{overallComplianceScore}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Recent Critical Events</h4>
              <div className="space-y-2 max-h-48 overflow-auto">
                {criticalAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-red-800">{alert.title}</p>
                      <p className="text-xs text-red-600">{alert.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(parseISO(alert.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                {criticalAlerts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No critical alerts</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Performance Metrics</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Load Time</span>
                    <span>{performanceMetrics.loadTime}ms</span>
                  </div>
                  <Progress value={Math.min((performanceMetrics.loadTime / 5000) * 100, 100)} className="h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Data Freshness</span>
                    <span>
                      {performanceMetrics.dataFreshness ? 
                        formatDistanceToNow(performanceMetrics.dataFreshness, { addSuffix: true }) :
                        'Unknown'
                      }
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Error Rate</span>
                    <span>{performanceMetrics.errorRate}%</span>
                  </div>
                  <Progress value={performanceMetrics.errorRate * 10} className="h-1" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.map(chart => (
          <Card key={chart.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{chart.title}</span>
                <Button variant="ghost" size="sm">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {chart.title} Chart
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chart.data.length} data points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ===================== MAIN RENDER =====================

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time monitoring and analytics for audit events
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <span className="text-sm text-muted-foreground">Auto-refresh</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDashboardData}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>

              {enableExport && (
                <Button variant="outline" size="sm" onClick={handleExportDashboard}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
              )} />
              <span className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : 'Live'}
              </span>
            </div>

            <div className="text-sm text-muted-foreground">
              Last updated: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
            </div>

            {enableRealTime && isConnected && (
              <div className="flex items-center space-x-1 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Health: {systemHealthScore}%</span>
            <span>•</span>
            <span>Alerts: {criticalAlerts.length}</span>
            <span>•</span>
            <span>Compliance: {overallComplianceScore}%</span>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="anomalies">
              Anomalies
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-xs">
                  {criticalAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="threats">
              Threats
              {highThreatIndicators.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-xs">
                  {highThreatIndicators.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsPanel 
              chartData={chartData}
              metrics={metrics}
              onDrillDown={enableDrillDown ? (data) => console.log('Drill down:', data) : undefined}
            />
          </TabsContent>

          <TabsContent value="anomalies" className="mt-6">
            <AnomalyDetectionPanel
              alerts={anomalyAlerts}
              onAcknowledge={(alertId) => {
                setAnomalyAlerts(prev => prev.map(alert => 
                  alert.id === alertId 
                    ? { ...alert, status: 'investigating', acknowledgedAt: new Date().toISOString() }
                    : alert
                ));
              }}
              onResolve={(alertId) => {
                setAnomalyAlerts(prev => prev.map(alert => 
                  alert.id === alertId 
                    ? { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() }
                    : alert
                ));
              }}
            />
          </TabsContent>

          <TabsContent value="threats" className="mt-6">
            <ThreatIntelligencePanel
              indicators={threatIndicators}
              onMitigate={(threatId) => {
                setThreatIndicators(prev => prev.map(threat => 
                  threat.id === threatId 
                    ? { ...threat, status: 'mitigated' }
                    : threat
                ));
              }}
            />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <CompliancePanel
              metrics={complianceMetrics}
              overallScore={overallComplianceScore}
            />
          </TabsContent>

          <TabsContent value="predictions" className="mt-6">
            <PredictiveAnalyticsPanel
              insights={predictiveInsights}
              showModelInfo={true}
            />
          </TabsContent>

          <TabsContent value="geography" className="mt-6">
            <GeographicPanel
              data={geographicData}
              onLocationClick={(location) => console.log('Location clicked:', location)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

// ===================== SUB-COMPONENTS =====================

// Additional sub-components would be implemented here...
// Due to length constraints, I'm providing the core structure.

export default AuditDashboard;