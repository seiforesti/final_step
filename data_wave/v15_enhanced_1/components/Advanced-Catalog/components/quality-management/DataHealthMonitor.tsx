// ============================================================================
// DATA HEALTH MONITOR - ADVANCED CATALOG QUALITY MANAGEMENT
// ============================================================================
// Enterprise-grade data health monitoring with real-time alerts and AI analytics
// Integrates with: catalog_quality_service.py, data_profiling_service.py
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Progress,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui";
import { 
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Zap,
  Brain,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Download,
  Filter,
  Search,
  Target,
  Gauge,
  Thermometer,
  Battery,
  Wifi,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Monitor,
  Globe,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Radar,
  Satellite,
  Radio,
  Signal,
  Router,
  Antenna,
  Tower,
  Phone,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Camera,
  Microchip,
  CircuitBoard,
  Power,
  Battery as BatteryIcon,
  Fuel,
  Gauge as GaugeIcon,
  Speedometer,
  Compass,
  MapPin,
  Navigation,
  Route,
  Map,
  Globe2,
  Earth,
  Plane,
  Car,
  Bus,
  Train,
  Bike,
  Ship,
  Rocket,
  Satellite as SatelliteIcon
} from 'lucide-react';
import { format, subDays, subHours, subMinutes } from 'date-fns';
import { 
  LineChart as RechartsLineChart, 
  AreaChart, 
  BarChart as RechartsBarChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Line, 
  Area, 
  Bar,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar
} from 'recharts';

// Import services and types
import { 
  CatalogQualityService,
  DataProfilingService,
  CatalogAnalyticsService
} from '../../services';
import { 
  DataHealthMetric,
  DataHealthStatus,
  DataHealthAlert,
  DataHealthTrend,
  DataHealthInsight,
  DataHealthRecommendation,
  DataHealthThreshold,
  DataHealthDashboard,
  DataHealthMonitoringConfig,
  DataHealthReport,
  DataHealthIncident,
  DataHealthRecovery,
  TimePeriod,
  HealthMetricType,
  HealthSeverityLevel,
  HealthStatusType
} from '../../types';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface DataHealthMonitorProps {
  className?: string;
  assets?: string[];
  realTimeMonitoring?: boolean;
  alertThresholds?: DataHealthThreshold[];
  onHealthStatusChange?: (status: DataHealthStatus) => void;
  onAlertTriggered?: (alert: DataHealthAlert) => void;
  onIncidentDetected?: (incident: DataHealthIncident) => void;
}

interface HealthMonitoringState {
  loading: boolean;
  error: string | null;
  overallHealth: DataHealthStatus;
  metrics: DataHealthMetric[];
  trends: DataHealthTrend[];
  alerts: DataHealthAlert[];
  insights: DataHealthInsight[];
  recommendations: DataHealthRecommendation[];
  incidents: DataHealthIncident[];
  recoveries: DataHealthRecovery[];
  thresholds: DataHealthThreshold[];
  dashboards: DataHealthDashboard[];
  reports: DataHealthReport[];
}

interface HealthVisualization {
  id: string;
  type: 'gauge' | 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'heatmap';
  title: string;
  data: any[];
  config: any;
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface HealthMetricGroup {
  id: string;
  name: string;
  metrics: DataHealthMetric[];
  overallScore: number;
  status: HealthStatusType;
  trend: 'improving' | 'declining' | 'stable';
  lastChecked: Date;
}

interface AlertRule {
  id: string;
  name: string;
  metricType: HealthMetricType;
  condition: 'greater_than' | 'less_than' | 'equals' | 'between' | 'outside_range';
  value: number;
  upperBound?: number;
  severity: HealthSeverityLevel;
  enabled: boolean;
  cooldownMinutes: number;
  escalationRules: EscalationRule[];
}

interface EscalationRule {
  id: string;
  triggerAfterMinutes: number;
  severity: HealthSeverityLevel;
  notificationChannels: string[];
  autoActions: string[];
}

interface IncidentContext {
  incident: DataHealthIncident;
  relatedMetrics: DataHealthMetric[];
  historicalData: any[];
  similarIncidents: DataHealthIncident[];
  rootCauseAnalysis: {
    primaryCause: string;
    contributingFactors: string[];
    confidence: number;
    evidence: string[];
  };
  impactAssessment: {
    affectedAssets: string[];
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    estimatedDowntime: number;
    financialImpact: number;
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DataHealthMonitor: React.FC<DataHealthMonitorProps> = ({
  className,
  assets = [],
  realTimeMonitoring = true,
  alertThresholds = [],
  onHealthStatusChange,
  onAlertTriggered,
  onIncidentDetected
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<HealthMonitoringState>({
    loading: false,
    error: null,
    overallHealth: {
      status: 'healthy',
      score: 0,
      lastChecked: new Date(),
      summary: '',
      criticalIssues: 0,
      warnings: 0
    },
    metrics: [],
    trends: [],
    alerts: [],
    insights: [],
    recommendations: [],
    incidents: [],
    recoveries: [],
    thresholds: alertThresholds,
    dashboards: [],
    reports: []
  });

  const [visualizations, setVisualizations] = useState<HealthVisualization[]>([]);
  const [metricGroups, setMetricGroups] = useState<HealthMetricGroup[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [incidentContexts, setIncidentContexts] = useState<IncidentContext[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimePeriod>({
    start: subHours(new Date(), 24),
    end: new Date(),
    granularity: 'minute'
  });

  // UI State
  const [isMonitoring, setIsMonitoring] = useState(realTimeMonitoring);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<HealthMetricType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoRecovery, setAutoRecovery] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedIncident, setSelectedIncident] = useState<DataHealthIncident | null>(null);
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const alertSoundRef = useRef<HTMLAudioElement | null>(null);

  // ============================================================================
  // SERVICE INITIALIZATION
  // ============================================================================

  const qualityService = useMemo(() => new CatalogQualityService(), []);
  const profilingService = useMemo(() => new DataProfilingService(), []);
  const analyticsService = useMemo(() => new CatalogAnalyticsService(), []);

  // ============================================================================
  // DATA LOADING AND PROCESSING
  // ============================================================================

  const loadHealthData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Load current health status
      const healthResponse = await qualityService.getDataHealthStatus({
        assets,
        includeMetrics: true,
        includeAlerts: true,
        includeIncidents: true,
        timePeriod: selectedTimeRange
      });

      // Load health metrics
      const metricsResponse = await qualityService.getDataHealthMetrics({
        assets,
        metricTypes: selectedMetricType === 'all' ? undefined : [selectedMetricType],
        timePeriod: selectedTimeRange,
        includeHistorical: true,
        includePredictions: true
      });

      // Load health trends
      const trendsResponse = await qualityService.getDataHealthTrends({
        assets,
        timePeriod: selectedTimeRange,
        includeForecasts: true,
        includeAnomalies: true
      });

      // Load active alerts
      const alertsResponse = await qualityService.getDataHealthAlerts({
        assets,
        includeResolved: false,
        severity: showCriticalOnly ? ['critical', 'high'] : undefined,
        timePeriod: selectedTimeRange
      });

      // Load incidents
      const incidentsResponse = await qualityService.getDataHealthIncidents({
        assets,
        includeResolved: true,
        timePeriod: selectedTimeRange,
        includeContext: true
      });

      // Generate insights
      const insightsResponse = await qualityService.generateHealthInsights({
        metrics: metricsResponse.data,
        trends: trendsResponse.data,
        alerts: alertsResponse.data,
        incidents: incidentsResponse.data,
        includeRecommendations: true,
        includeRootCause: true
      });

      // Load recovery actions
      const recoveriesResponse = await qualityService.getDataHealthRecoveries({
        assets,
        timePeriod: selectedTimeRange,
        includeAutoRecoveries: true,
        includeManualRecoveries: true
      });

      // Update state
      setState(prev => ({
        ...prev,
        loading: false,
        overallHealth: healthResponse.data.overallHealth,
        metrics: metricsResponse.data,
        trends: trendsResponse.data,
        alerts: alertsResponse.data,
        insights: insightsResponse.data.insights,
        recommendations: insightsResponse.data.recommendations,
        incidents: incidentsResponse.data,
        recoveries: recoveriesResponse.data
      }));

      // Process metric groups
      const groups = processMetricGroups(metricsResponse.data);
      setMetricGroups(groups);

      // Generate visualizations
      await generateVisualizations(metricsResponse.data, trendsResponse.data);

      // Process incident contexts
      const contexts = await Promise.all(
        incidentsResponse.data.map(async (incident) => {
          const contextResponse = await qualityService.getIncidentContext(incident.id);
          return contextResponse.data;
        })
      );
      setIncidentContexts(contexts);

      // Trigger callbacks
      if (onHealthStatusChange) {
        onHealthStatusChange(healthResponse.data.overallHealth);
      }

      // Check for new alerts
      const newAlerts = alertsResponse.data.filter(alert => 
        !prev.alerts.find(existingAlert => existingAlert.id === alert.id)
      );

      newAlerts.forEach(alert => {
        if (onAlertTriggered) {
          onAlertTriggered(alert);
        }
        
        // Play alert sound if enabled
        if (alertsEnabled && alertSoundRef.current) {
          alertSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
      });

      // Check for new incidents
      const newIncidents = incidentsResponse.data.filter(incident => 
        !prev.incidents.find(existingIncident => existingIncident.id === incident.id)
      );

      newIncidents.forEach(incident => {
        if (onIncidentDetected) {
          onIncidentDetected(incident);
        }
      });

    } catch (error) {
      console.error('Error loading health data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load health data'
      }));
    }
  }, [
    qualityService,
    assets,
    selectedTimeRange,
    selectedMetricType,
    showCriticalOnly,
    alertsEnabled,
    onHealthStatusChange,
    onAlertTriggered,
    onIncidentDetected
  ]);

  const processMetricGroups = useCallback((metrics: DataHealthMetric[]): HealthMetricGroup[] => {
    const groupMap = new Map<string, DataHealthMetric[]>();

    // Group metrics by type
    metrics.forEach(metric => {
      const key = metric.type;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(metric);
    });

    // Create metric groups
    return Array.from(groupMap.entries()).map(([type, groupMetrics]) => {
      const scores = groupMetrics.map(m => m.currentValue);
      const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      let status: HealthStatusType = 'healthy';
      if (overallScore < 50) status = 'critical';
      else if (overallScore < 70) status = 'warning';
      else if (overallScore < 90) status = 'degraded';

      // Determine trend
      const latestMetrics = groupMetrics.filter(m => m.trend);
      const improvingCount = latestMetrics.filter(m => m.trend?.direction === 'improving').length;
      const decliningCount = latestMetrics.filter(m => m.trend?.direction === 'declining').length;
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (improvingCount > decliningCount) trend = 'improving';
      else if (decliningCount > improvingCount) trend = 'declining';

      return {
        id: type,
        name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        metrics: groupMetrics,
        overallScore,
        status,
        trend,
        lastChecked: new Date()
      };
    });
  }, []);

  const generateVisualizations = useCallback(async (
    metrics: DataHealthMetric[],
    trends: DataHealthTrend[]
  ) => {
    const visualizations: HealthVisualization[] = [];

    // Overall health gauge
    visualizations.push({
      id: 'health-gauge',
      type: 'gauge',
      title: 'Overall Health Score',
      data: [{ value: state.overallHealth.score, max: 100 }],
      config: {
        min: 0,
        max: 100,
        thresholds: [
          { value: 50, color: '#ef4444' },
          { value: 70, color: '#f59e0b' },
          { value: 90, color: '#eab308' },
          { value: 100, color: '#22c55e' }
        ]
      },
      visible: true,
      position: { x: 0, y: 0 },
      size: { width: 4, height: 4 }
    });

    // Metrics trend over time
    if (trends.length > 0) {
      visualizations.push({
        id: 'trends-line',
        type: 'line',
        title: 'Health Trends',
        data: trends,
        config: {
          xKey: 'timestamp',
          yKey: 'value',
          groupBy: 'metricType'
        },
        visible: true,
        position: { x: 4, y: 0 },
        size: { width: 8, height: 4 }
      });
    }

    // Metric type distribution
    const typeDistribution = metricGroups.map(group => ({
      name: group.name,
      value: group.overallScore,
      status: group.status,
      count: group.metrics.length
    }));

    visualizations.push({
      id: 'type-distribution',
      type: 'bar',
      title: 'Health by Metric Type',
      data: typeDistribution,
      config: {
        xKey: 'name',
        yKey: 'value',
        colorBy: 'status'
      },
      visible: true,
      position: { x: 0, y: 4 },
      size: { width: 6, height: 4 }
    });

    // Alert severity pie chart
    const alertSeverityData = [
      { name: 'Critical', value: state.alerts.filter(a => a.severity === 'critical').length, color: '#ef4444' },
      { name: 'High', value: state.alerts.filter(a => a.severity === 'high').length, color: '#f59e0b' },
      { name: 'Medium', value: state.alerts.filter(a => a.severity === 'medium').length, color: '#eab308' },
      { name: 'Low', value: state.alerts.filter(a => a.severity === 'low').length, color: '#22c55e' }
    ].filter(item => item.value > 0);

    if (alertSeverityData.length > 0) {
      visualizations.push({
        id: 'alert-severity',
        type: 'pie',
        title: 'Alert Distribution',
        data: alertSeverityData,
        config: {
          dataKey: 'value',
          nameKey: 'name'
        },
        visible: true,
        position: { x: 6, y: 4 },
        size: { width: 6, height: 4 }
      });
    }

    // Health radar chart
    const radarData = metricGroups.map(group => ({
      metric: group.name,
      score: group.overallScore,
      max: 100
    }));

    if (radarData.length > 2) {
      visualizations.push({
        id: 'health-radar',
        type: 'radar',
        title: 'Health Overview',
        data: radarData,
        config: {
          dataKey: 'score',
          categoryKey: 'metric'
        },
        visible: true,
        position: { x: 0, y: 8 },
        size: { width: 12, height: 4 }
      });
    }

    setVisualizations(visualizations);
  }, [state.overallHealth, state.alerts, metricGroups]);

  // ============================================================================
  // REAL-TIME MONITORING
  // ============================================================================

  const setupRealTimeMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    // Setup WebSocket connection
    const wsUrl = `ws://localhost:8000/ws/health-monitoring/${assets.join(',')}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'health_update') {
        setState(prev => ({
          ...prev,
          overallHealth: update.data.overallHealth,
          metrics: prev.metrics.map(metric => 
            metric.id === update.data.metric?.id ? { ...metric, ...update.data.metric } : metric
          )
        }));

        if (onHealthStatusChange) {
          onHealthStatusChange(update.data.overallHealth);
        }
      } else if (update.type === 'alert_triggered') {
        const alert = update.data;
        setState(prev => ({
          ...prev,
          alerts: [...prev.alerts, alert]
        }));

        if (onAlertTriggered) {
          onAlertTriggered(alert);
        }

        // Play alert sound
        if (alertsEnabled && alertSoundRef.current) {
          alertSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
      } else if (update.type === 'incident_detected') {
        const incident = update.data;
        setState(prev => ({
          ...prev,
          incidents: [...prev.incidents, incident]
        }));

        if (onIncidentDetected) {
          onIncidentDetected(incident);
        }
      } else if (update.type === 'recovery_completed') {
        const recovery = update.data;
        setState(prev => ({
          ...prev,
          recoveries: [...prev.recoveries, recovery],
          incidents: prev.incidents.map(incident => 
            incident.id === recovery.incidentId 
              ? { ...incident, status: 'resolved', resolvedAt: new Date() }
              : incident
          )
        }));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocketRef.current = ws;

    // Setup auto-refresh interval
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        loadHealthData();
      }, refreshInterval);
    }

    return () => {
      ws.close();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [
    isMonitoring,
    assets,
    refreshInterval,
    alertsEnabled,
    loadHealthData,
    onHealthStatusChange,
    onAlertTriggered,
    onIncidentDetected
  ]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleToggleMonitoring = useCallback(() => {
    setIsMonitoring(!isMonitoring);
  }, [isMonitoring]);

  const handleAcknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await qualityService.acknowledgeHealthAlert(alertId);
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true, acknowledgedAt: new Date() } : alert
        )
      }));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, [qualityService]);

  const handleResolveAlert = useCallback(async (alertId: string, resolution: string) => {
    try {
      await qualityService.resolveHealthAlert(alertId, { resolution });
      setState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true, resolvedAt: new Date(), resolution } : alert
        )
      }));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  }, [qualityService]);

  const handleTriggerRecovery = useCallback(async (incidentId: string, recoveryType: 'auto' | 'manual') => {
    try {
      const recoveryResponse = await qualityService.triggerHealthRecovery({
        incidentId,
        type: recoveryType,
        actions: autoRecovery ? ['restart_checks', 'clear_cache', 'reset_thresholds'] : []
      });

      setState(prev => ({
        ...prev,
        recoveries: [...prev.recoveries, recoveryResponse.data]
      }));
    } catch (error) {
      console.error('Failed to trigger recovery:', error);
    }
  }, [qualityService, autoRecovery]);

  const handleExportReport = useCallback(async () => {
    try {
      const reportResponse = await qualityService.generateHealthReport({
        assets,
        timePeriod: selectedTimeRange,
        includeMetrics: true,
        includeAlerts: true,
        includeIncidents: true,
        includeRecommendations: true,
        format: 'pdf'
      });

      // Download the report
      const blob = new Blob([reportResponse.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  }, [qualityService, assets, selectedTimeRange]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  useEffect(() => {
    const cleanup = setupRealTimeMonitoring();
    return cleanup;
  }, [setupRealTimeMonitoring]);

  useEffect(() => {
    // Initialize alert sound
    alertSoundRef.current = new Audio('/sounds/alert.mp3');
    alertSoundRef.current.volume = 0.5;
  }, []);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const filteredAlerts = useMemo(() => {
    let filtered = state.alerts;

    if (showCriticalOnly) {
      filtered = filtered.filter(alert => 
        alert.severity === 'critical' || alert.severity === 'high'
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(alert => 
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.metricName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [state.alerts, showCriticalOnly, searchTerm]);

  const healthSummary = useMemo(() => {
    const totalMetrics = state.metrics.length;
    const healthyMetrics = state.metrics.filter(m => m.status === 'healthy').length;
    const criticalAlerts = state.alerts.filter(a => a.severity === 'critical' && !a.resolved).length;
    const activeIncidents = state.incidents.filter(i => i.status === 'active').length;
    
    return {
      overallScore: state.overallHealth.score,
      healthyPercentage: totalMetrics > 0 ? (healthyMetrics / totalMetrics) * 100 : 0,
      totalAlerts: state.alerts.filter(a => !a.resolved).length,
      criticalAlerts,
      activeIncidents,
      lastUpdated: state.overallHealth.lastChecked,
      status: state.overallHealth.status
    };
  }, [state]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderHealthOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Health</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{healthSummary.overallScore.toFixed(1)}</p>
                <Badge variant={
                  healthSummary.status === 'healthy' ? 'default' :
                  healthSummary.status === 'warning' ? 'secondary' :
                  healthSummary.status === 'degraded' ? 'outline' : 'destructive'
                }>
                  {healthSummary.status}
                </Badge>
              </div>
            </div>
            <Heart className={`h-8 w-8 ${
              healthSummary.status === 'healthy' ? 'text-green-500' :
              healthSummary.status === 'warning' ? 'text-yellow-500' :
              healthSummary.status === 'degraded' ? 'text-orange-500' : 'text-red-500'
            }`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Healthy Metrics</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-green-600">
                  {healthSummary.healthyPercentage.toFixed(0)}%
                </p>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-red-600">{healthSummary.totalAlerts}</p>
                {healthSummary.criticalAlerts > 0 && (
                  <Badge variant="destructive">{healthSummary.criticalAlerts} critical</Badge>
                )}
              </div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Incidents</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{healthSummary.activeIncidents}</p>
                <span className="text-xs text-muted-foreground">active</span>
              </div>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVisualizationGrid = () => (
    <div className="grid grid-cols-12 gap-4 mb-6">
      {visualizations.filter(viz => viz.visible).map((viz) => (
        <Card key={viz.id} className={`col-span-${viz.size.width}`}>
          <CardHeader>
            <CardTitle className="text-lg">{viz.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: `${viz.size.height * 80}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                {viz.type === 'gauge' && (
                  <div className="flex items-center justify-center h-full">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold">{viz.data[0]?.value?.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">Health Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {viz.type === 'line' && (
                  <RechartsLineChart data={viz.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={viz.config.xKey}
                      tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                    />
                    <YAxis />
                    <RechartsTooltip
                      labelFormatter={(value) => format(new Date(value), 'PPP HH:mm')}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={viz.config.yKey} 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                )}
                {viz.type === 'bar' && (
                  <RechartsBarChart data={viz.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={viz.config.xKey} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey={viz.config.yKey} fill="#8884d8" />
                  </RechartsBarChart>
                )}
                {viz.type === 'pie' && (
                  <RechartsPieChart>
                    <RechartsTooltip />
                    <Legend />
                  </RechartsPieChart>
                )}
                {viz.type === 'radar' && (
                  <RadarChart data={viz.data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey={viz.config.categoryKey} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <RechartsRadar
                      name="Health Score"
                      dataKey={viz.config.dataKey}
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMetricGroups = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {metricGroups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  group.status === 'healthy' ? 'default' :
                  group.status === 'warning' ? 'secondary' :
                  group.status === 'degraded' ? 'outline' : 'destructive'
                }>
                  {group.status}
                </Badge>
                {group.trend === 'improving' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : group.trend === 'declining' ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <Activity className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Score</span>
                <span className="font-semibold text-lg">{group.overallScore.toFixed(1)}</span>
              </div>
              <Progress value={group.overallScore} className="w-full" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{group.metrics.length} metrics</span>
                <span className="text-muted-foreground">
                  Last checked: {format(group.lastChecked, 'HH:mm')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAlertsTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Active Alerts</span>
            <Badge variant="destructive">{filteredAlerts.length}</Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Switch
              checked={showCriticalOnly}
              onCheckedChange={setShowCriticalOnly}
            />
            <span className="text-sm">Critical only</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Alert</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Triggered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Badge variant={
                    alert.severity === 'critical' ? 'destructive' :
                    alert.severity === 'high' ? 'destructive' :
                    alert.severity === 'medium' ? 'secondary' : 'outline'
                  }>
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{alert.message}</div>
                    {alert.description && (
                      <div className="text-sm text-muted-foreground">{alert.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{alert.metricName}</TableCell>
                <TableCell>
                  {format(new Date(alert.triggeredAt), 'MMM dd, HH:mm')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {alert.acknowledged ? (
                      <Badge variant="outline">Acknowledged</Badge>
                    ) : (
                      <Badge variant="secondary">New</Badge>
                    )}
                    {alert.resolved && (
                      <Badge variant="default">Resolved</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {!alert.acknowledged && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Acknowledge</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {!alert.resolved && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleResolveAlert(alert.id, 'Manual resolution')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Resolve</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading health data...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Health Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and health analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isMonitoring ? "default" : "outline"}
            onClick={handleToggleMonitoring}
            className={isMonitoring ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Monitoring Active
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setAlertsEnabled(!alertsEnabled)}
          >
            {alertsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" onClick={() => loadHealthData()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {renderHealthOverview()}

      {/* Visualizations */}
      {renderVisualizationGrid()}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">
            Metrics
            <Badge variant="secondary" className="ml-2">
              {metricGroups.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {filteredAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {filteredAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="incidents">
            Incidents
            {state.incidents.filter(i => i.status === 'active').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {state.incidents.filter(i => i.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights">
            Insights
            {state.insights.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {state.insights.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderMetricGroups()}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {renderMetricGroups()}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {renderAlertsTable()}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Health Incidents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.incidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{incident.title}</h4>
                        <p className="text-sm text-muted-foreground">{incident.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          incident.severity === 'critical' ? 'destructive' :
                          incident.severity === 'high' ? 'destructive' :
                          incident.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {incident.severity}
                        </Badge>
                        <Badge variant={incident.status === 'active' ? 'destructive' : 'default'}>
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Started: {format(new Date(incident.startedAt), 'MMM dd, HH:mm')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setShowIncidentDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        {incident.status === 'active' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleTriggerRecovery(incident.id, 'manual')}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Recover
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Health Insights</span>
                <Badge variant="secondary">{state.insights.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {state.insights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            insight.type === 'positive' ? 'default' :
                            insight.type === 'warning' ? 'secondary' : 'destructive'
                          }>
                            {insight.type}
                          </Badge>
                          <Badge variant="outline">{insight.confidence.toFixed(0)}% confidence</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(insight.generatedAt), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-muted-foreground">{rec.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                  {state.insights.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No insights available</p>
                      <p className="text-sm text-muted-foreground">Insights will appear as data is analyzed</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Incident Details Dialog */}
      <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Incident Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedIncident.title}</div>
                    <div><strong>Status:</strong> {selectedIncident.status}</div>
                    <div><strong>Severity:</strong> {selectedIncident.severity}</div>
                    <div><strong>Started:</strong> {format(new Date(selectedIncident.startedAt), 'PPP HH:mm')}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Impact Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Assets Affected:</strong> {selectedIncident.affectedAssets?.length || 0}</div>
                    <div><strong>Business Impact:</strong> {selectedIncident.businessImpact || 'Unknown'}</div>
                    <div><strong>Duration:</strong> {selectedIncident.duration ? `${selectedIncident.duration} minutes` : 'Ongoing'}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataHealthMonitor;