import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Eye, 
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Brain,
  Search,
  Filter,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Radar,
  Layers,
  Network,
  Database,
  Cpu,
  Memory,
  HardDrive,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Save,
  Copy,
  MoreHorizontal,
  ExternalLink,
  Bell,
  BellOff,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Minimize2,
  Maximize2,
  Gauge,
  Thermometer,
  Waves,
  Microscope
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Custom Hooks
import { useIntelligence } from '../../hooks/useIntelligence';
import { useScanRules } from '../../hooks/useScanRules';
import { useReporting } from '../../hooks/useReporting';

// API Services
import { intelligenceAPI } from '../../services/intelligence-apis';
import { scanRulesAPI } from '../../services/scan-rules-apis';

// Types
import type { 
  Anomaly,
  AnomalyDetection,
  AnomalyPattern,
  AnomalyMetrics,
  AnomalyAlert,
  AnomalyThreshold,
  DetectionModel,
  AnomalyScore,
  AnomalySeverity,
  AnomalyType,
  AnomalyCategory,
  StatisticalAnomaly,
  BehavioralAnomaly,
  PerformanceAnomaly,
  SecurityAnomaly,
  ModelConfig,
  TrainingData,
  AnomalyPrediction,
  BaselineMetrics,
  DeviationAnalysis,
  AnomalyReport,
  DetectionRule,
  AlertConfiguration
} from '../../types/intelligence.types';

import type { 
  ScanRule,
  RuleSet,
  RulePattern
} from '../../types/scan-rules.types';

// Utilities
import { aiHelpers } from '../../utils/ai-helpers';
import { performanceCalculator } from '../../utils/performance-calculator';
import { statisticalAnalyzer } from '../../utils/statistical-analyzer';

interface AnomalyDetectorProps {
  className?: string;
  onAnomalyDetected?: (anomaly: Anomaly) => void;
  onAlertTriggered?: (alert: AnomalyAlert) => void;
  onPatternIdentified?: (pattern: AnomalyPattern) => void;
}

interface AnomalyDetectorState {
  anomalies: Anomaly[];
  patterns: AnomalyPattern[];
  alerts: AnomalyAlert[];
  detections: AnomalyDetection[];
  metrics: AnomalyMetrics;
  models: DetectionModel[];
  thresholds: AnomalyThreshold[];
  baselines: BaselineMetrics[];
  rules: ScanRule[];
  predictions: AnomalyPrediction[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  totalAnomalies: number;
  criticalAnomalies: number;
  resolvedAnomalies: number;
  activeAlerts: number;
  detectionAccuracy: number;
  falsePositiveRate: number;
  averageResponseTime: number;
  modelsTraining: number;
  patternsIdentified: number;
  predictionsGenerated: number;
}

interface AnomalyViewState {
  currentView: 'overview' | 'detection' | 'patterns' | 'alerts' | 'models' | 'configuration';
  selectedAnomaly?: Anomaly;
  selectedPattern?: AnomalyPattern;
  selectedModel?: DetectionModel;
  detectionMode: 'real_time' | 'batch' | 'scheduled';
  anomalyType: AnomalyType;
  severityFilter: string;
  categoryFilter: string;
  autoDetection: boolean;
  realTimeMode: boolean;
  alertsEnabled: boolean;
  smartFiltering: boolean;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedTimeRange: 'hour' | 'day' | 'week' | 'month';
  confidenceThreshold: number;
  sensitivityLevel: number;
}

const DEFAULT_VIEW_STATE: AnomalyViewState = {
  currentView: 'overview',
  detectionMode: 'real_time',
  anomalyType: 'all',
  severityFilter: 'all',
  categoryFilter: 'all',
  autoDetection: true,
  realTimeMode: true,
  alertsEnabled: true,
  smartFiltering: true,
  searchQuery: '',
  sortBy: 'anomaly_score',
  sortOrder: 'desc',
  selectedTimeRange: 'day',
  confidenceThreshold: 0.8,
  sensitivityLevel: 0.7
};

const ANOMALY_TYPES = [
  { value: 'all', label: 'All Types', icon: Target, description: 'All anomaly types' },
  { value: 'statistical', label: 'Statistical', icon: BarChart3, description: 'Statistical deviations' },
  { value: 'behavioral', label: 'Behavioral', icon: Activity, description: 'Behavioral patterns' },
  { value: 'performance', label: 'Performance', icon: Gauge, description: 'Performance anomalies' },
  { value: 'security', label: 'Security', icon: AlertTriangle, description: 'Security threats' },
  { value: 'temporal', label: 'Temporal', icon: Clock, description: 'Time-based patterns' },
  { value: 'spatial', label: 'Spatial', icon: Network, description: 'Spatial distributions' }
];

const ANOMALY_SEVERITIES = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100', threshold: 0.3 },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100', threshold: 0.6 },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100', threshold: 0.8 },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100', threshold: 0.9 }
];

const ANOMALY_CATEGORIES = [
  { value: 'data_quality', label: 'Data Quality', icon: Database },
  { value: 'rule_performance', label: 'Rule Performance', icon: Gauge },
  { value: 'system_behavior', label: 'System Behavior', icon: Cpu },
  { value: 'user_activity', label: 'User Activity', icon: Activity },
  { value: 'resource_usage', label: 'Resource Usage', icon: Memory },
  { value: 'network_traffic', label: 'Network Traffic', icon: Network },
  { value: 'error_patterns', label: 'Error Patterns', icon: AlertTriangle },
  { value: 'compliance', label: 'Compliance', icon: CheckCircle2 }
];

const DETECTION_MODELS = [
  { id: 'isolation_forest', name: 'Isolation Forest', type: 'unsupervised', accuracy: 0.92 },
  { id: 'one_class_svm', name: 'One-Class SVM', type: 'unsupervised', accuracy: 0.88 },
  { id: 'lstm_autoencoder', name: 'LSTM Autoencoder', type: 'deep_learning', accuracy: 0.94 },
  { id: 'statistical_outlier', name: 'Statistical Outlier', type: 'statistical', accuracy: 0.85 },
  { id: 'ensemble_detector', name: 'Ensemble Detector', type: 'ensemble', accuracy: 0.96 },
  { id: 'transformer_anomaly', name: 'Transformer Anomaly', type: 'transformer', accuracy: 0.95 }
];

export const AnomalyDetector: React.FC<AnomalyDetectorProps> = ({
  className,
  onAnomalyDetected,
  onAlertTriggered,
  onPatternIdentified
}) => {
  // State Management
  const [viewState, setViewState] = useState<AnomalyViewState>(DEFAULT_VIEW_STATE);
  const [detectorState, setDetectorState] = useState<AnomalyDetectorState>({
    anomalies: [],
    patterns: [],
    alerts: [],
    detections: [],
    metrics: {} as AnomalyMetrics,
    models: [],
    thresholds: [],
    baselines: [],
    rules: [],
    predictions: [],
    loading: false,
    error: null,
    lastUpdated: new Date(),
    totalAnomalies: 0,
    criticalAnomalies: 0,
    resolvedAnomalies: 0,
    activeAlerts: 0,
    detectionAccuracy: 0,
    falsePositiveRate: 0,
    averageResponseTime: 0,
    modelsTraining: 0,
    patternsIdentified: 0,
    predictionsGenerated: 0
  });

  const [detectionDialogOpen, setDetectionDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Form States
  const [detectionForm, setDetectionForm] = useState({
    modelId: '',
    dataSource: 'scan_rules',
    timeWindow: '24h',
    confidenceThreshold: 0.8,
    sensitivity: 0.7,
    enableAlerts: true,
    autoResponse: false,
    categories: [] as string[]
  });

  const [alertForm, setAlertForm] = useState({
    name: '',
    conditions: [] as string[],
    severity: 'medium' as AnomalySeverity,
    recipients: [] as string[],
    channels: ['email', 'webhook'],
    throttle: 300, // seconds
    enabled: true
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout>();
  const streamingRef = useRef<boolean>(false);

  // Custom Hooks
  const {
    getInsights,
    analyzePerformance,
    generatePredictions,
    loading: intelligenceLoading
  } = useIntelligence();

  const {
    scanRules,
    ruleSets,
    getRules,
    loading: rulesLoading
  } = useScanRules();

  const {
    generateReport,
    getAnalytics,
    loading: reportingLoading
  } = useReporting();

  // Initialize WebSocket Connection
  useEffect(() => {
    if (viewState.realTimeMode) {
      wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/anomaly-detection`);
      
      wsRef.current.onopen = () => {
        console.log('Anomaly Detection WebSocket connected');
        streamingRef.current = true;
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Anomaly Detection WebSocket error:', error);
        streamingRef.current = false;
      };

      wsRef.current.onclose = () => {
        console.log('Anomaly Detection WebSocket disconnected');
        streamingRef.current = false;
      };
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        streamingRef.current = false;
      }
    };
  }, [viewState.realTimeMode]);

  // Handle WebSocket Messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'anomaly_detected':
        setDetectorState(prev => ({
          ...prev,
          anomalies: [...prev.anomalies, data.anomaly],
          totalAnomalies: prev.totalAnomalies + 1,
          criticalAnomalies: data.anomaly.severity === 'critical' 
            ? prev.criticalAnomalies + 1 
            : prev.criticalAnomalies
        }));
        if (onAnomalyDetected) onAnomalyDetected(data.anomaly);
        
        // Trigger alert if enabled and severity is high enough
        if (viewState.alertsEnabled && data.anomaly.score >= viewState.confidenceThreshold) {
          triggerAlert(data.anomaly);
        }
        break;
      case 'pattern_identified':
        setDetectorState(prev => ({
          ...prev,
          patterns: [...prev.patterns, data.pattern],
          patternsIdentified: prev.patternsIdentified + 1
        }));
        if (onPatternIdentified) onPatternIdentified(data.pattern);
        break;
      case 'alert_triggered':
        setDetectorState(prev => ({
          ...prev,
          alerts: [...prev.alerts, data.alert],
          activeAlerts: prev.activeAlerts + 1
        }));
        if (onAlertTriggered) onAlertTriggered(data.alert);
        break;
      case 'baseline_updated':
        setDetectorState(prev => ({
          ...prev,
          baselines: prev.baselines.map(baseline => 
            baseline.id === data.baseline.id ? data.baseline : baseline
          )
        }));
        break;
      case 'model_trained':
        setDetectorState(prev => ({
          ...prev,
          models: prev.models.map(model => 
            model.id === data.model.id ? data.model : model
          ),
          modelsTraining: prev.modelsTraining - 1
        }));
        break;
      case 'metrics_updated':
        setDetectorState(prev => ({
          ...prev,
          metrics: data.metrics,
          lastUpdated: new Date()
        }));
        break;
    }
  }, [viewState.alertsEnabled, viewState.confidenceThreshold, onAnomalyDetected, onPatternIdentified, onAlertTriggered]);

  // Real-time detection
  useEffect(() => {
    if (viewState.autoDetection && viewState.detectionMode === 'real_time') {
      detectionIntervalRef.current = setInterval(() => {
        performRealTimeDetection();
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [viewState.autoDetection, viewState.detectionMode]);

  // Data Loading
  const refreshData = useCallback(async () => {
    try {
      setDetectorState(prev => ({ ...prev, loading: true, error: null }));

      const [anomaliesData, patternsData, alertsData, modelsData, metricsData] = await Promise.all([
        intelligenceAPI.getAnomalies({ 
          type: viewState.anomalyType !== 'all' ? viewState.anomalyType : undefined,
          severity: viewState.severityFilter !== 'all' ? viewState.severityFilter : undefined,
          category: viewState.categoryFilter !== 'all' ? viewState.categoryFilter : undefined,
          timeRange: viewState.selectedTimeRange
        }),
        intelligenceAPI.getAnomalyPatterns(),
        intelligenceAPI.getAnomalyAlerts({ active: true }),
        intelligenceAPI.getDetectionModels(),
        intelligenceAPI.getAnomalyMetrics()
      ]);

      setDetectorState(prev => ({
        ...prev,
        anomalies: anomaliesData.anomalies,
        patterns: patternsData.patterns,
        alerts: alertsData.alerts,
        models: modelsData.models,
        metrics: metricsData,
        totalAnomalies: anomaliesData.total,
        activeAlerts: alertsData.alerts.filter(a => a.status === 'active').length,
        loading: false,
        lastUpdated: new Date()
      }));

      // Calculate derived metrics
      const criticalCount = anomaliesData.anomalies.filter(a => a.severity === 'critical').length;
      const resolvedCount = anomaliesData.anomalies.filter(a => a.status === 'resolved').length;
      const avgAccuracy = modelsData.models.length > 0
        ? modelsData.models.reduce((sum, model) => sum + (model.accuracy || 0), 0) / modelsData.models.length
        : 0;

      setDetectorState(prev => ({
        ...prev,
        criticalAnomalies: criticalCount,
        resolvedAnomalies: resolvedCount,
        detectionAccuracy: avgAccuracy,
        falsePositiveRate: metricsData.falsePositiveRate || 0,
        averageResponseTime: metricsData.averageResponseTime || 0,
        patternsIdentified: patternsData.total
      }));

    } catch (error) {
      console.error('Failed to refresh anomaly detection data:', error);
      setDetectorState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [viewState.anomalyType, viewState.severityFilter, viewState.categoryFilter, viewState.selectedTimeRange]);

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Detection Functions
  const performRealTimeDetection = useCallback(async () => {
    try {
      const detection = await intelligenceAPI.performAnomalyDetection({
        mode: 'real_time',
        models: detectorState.models.filter(m => m.enabled).map(m => m.id),
        dataSource: 'scan_rules',
        timeWindow: '1h',
        confidenceThreshold: viewState.confidenceThreshold,
        sensitivity: viewState.sensitivityLevel
      });

      if (detection.anomalies && detection.anomalies.length > 0) {
        setDetectorState(prev => ({
          ...prev,
          anomalies: [...prev.anomalies, ...detection.anomalies],
          totalAnomalies: prev.totalAnomalies + detection.anomalies.length
        }));

        // Process each detected anomaly
        detection.anomalies.forEach(anomaly => {
          if (onAnomalyDetected) onAnomalyDetected(anomaly);
          
          if (viewState.alertsEnabled && anomaly.score >= viewState.confidenceThreshold) {
            triggerAlert(anomaly);
          }
        });
      }
    } catch (error) {
      console.error('Real-time detection failed:', error);
    }
  }, [detectorState.models, viewState.confidenceThreshold, viewState.sensitivityLevel, viewState.alertsEnabled, onAnomalyDetected]);

  const performBatchDetection = useCallback(async () => {
    try {
      const detection = await intelligenceAPI.performAnomalyDetection({
        mode: 'batch',
        models: [detectionForm.modelId],
        dataSource: detectionForm.dataSource,
        timeWindow: detectionForm.timeWindow,
        confidenceThreshold: detectionForm.confidenceThreshold,
        sensitivity: detectionForm.sensitivity,
        categories: detectionForm.categories
      });

      setDetectorState(prev => ({
        ...prev,
        detections: [...prev.detections, detection]
      }));

      setDetectionDialogOpen(false);
    } catch (error) {
      console.error('Batch detection failed:', error);
    }
  }, [detectionForm]);

  const trainDetectionModel = useCallback(async (modelConfig: ModelConfig) => {
    try {
      setDetectorState(prev => ({ ...prev, modelsTraining: prev.modelsTraining + 1 }));
      
      const trainingJob = await intelligenceAPI.trainDetectionModel({
        modelType: modelConfig.type,
        algorithm: modelConfig.algorithm,
        trainingData: modelConfig.trainingData,
        hyperparameters: modelConfig.hyperparameters,
        validationSplit: 0.2
      });

      // Training will complete asynchronously and update via WebSocket
      return trainingJob;
    } catch (error) {
      console.error('Model training failed:', error);
      setDetectorState(prev => ({ ...prev, modelsTraining: prev.modelsTraining - 1 }));
    }
  }, []);

  const triggerAlert = useCallback(async (anomaly: Anomaly) => {
    try {
      const alert = await intelligenceAPI.triggerAnomalyAlert({
        anomalyId: anomaly.id,
        severity: anomaly.severity,
        message: `Anomaly detected: ${anomaly.description}`,
        metadata: {
          score: anomaly.score,
          type: anomaly.type,
          category: anomaly.category
        }
      });

      setDetectorState(prev => ({
        ...prev,
        alerts: [...prev.alerts, alert],
        activeAlerts: prev.activeAlerts + 1
      }));

      if (onAlertTriggered) onAlertTriggered(alert);
    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }, [onAlertTriggered]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await intelligenceAPI.acknowledgeAlert(alertId);
      
      setDetectorState(prev => ({
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged', acknowledgedAt: new Date() }
            : alert
        ),
        activeAlerts: prev.activeAlerts - 1
      }));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  }, []);

  const resolveAnomaly = useCallback(async (anomalyId: string, resolution: string) => {
    try {
      await intelligenceAPI.resolveAnomaly({
        anomalyId: anomalyId,
        resolution: resolution,
        resolvedBy: 'user' // or get from auth context
      });

      setDetectorState(prev => ({
        ...prev,
        anomalies: prev.anomalies.map(anomaly => 
          anomaly.id === anomalyId 
            ? { ...anomaly, status: 'resolved', resolvedAt: new Date(), resolution: resolution }
            : anomaly
        ),
        resolvedAnomalies: prev.resolvedAnomalies + 1
      }));
    } catch (error) {
      console.error('Failed to resolve anomaly:', error);
    }
  }, []);

  // Utility Functions
  const getSeverityColor = useCallback((severity: AnomalySeverity) => {
    const sev = ANOMALY_SEVERITIES.find(s => s.value === severity);
    return sev ? sev.color : 'text-gray-600 bg-gray-100';
  }, []);

  const getAnomalyTypeIcon = useCallback((type: AnomalyType) => {
    const typeConfig = ANOMALY_TYPES.find(t => t.value === type);
    if (typeConfig) {
      const IconComponent = typeConfig.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Target className="h-4 w-4" />;
  }, []);

  const getCategoryIcon = useCallback((category: AnomalyCategory) => {
    const cat = ANOMALY_CATEGORIES.find(c => c.value === category);
    if (cat) {
      const IconComponent = cat.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Database className="h-4 w-4" />;
  }, []);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 0.9) return 'text-red-600';
    if (score >= 0.7) return 'text-orange-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-green-600';
  }, []);

  // Filter and Search Functions
  const filteredAnomalies = useMemo(() => {
    let filtered = detectorState.anomalies;

    if (viewState.searchQuery) {
      filtered = filtered.filter(anomaly => 
        anomaly.description?.toLowerCase().includes(viewState.searchQuery.toLowerCase()) ||
        anomaly.type?.toLowerCase().includes(viewState.searchQuery.toLowerCase())
      );
    }

    if (viewState.severityFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.severity === viewState.severityFilter);
    }

    if (viewState.categoryFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.category === viewState.categoryFilter);
    }

    if (viewState.anomalyType !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.type === viewState.anomalyType);
    }

    // Smart filtering based on confidence threshold
    if (viewState.smartFiltering) {
      filtered = filtered.filter(anomaly => anomaly.score >= viewState.confidenceThreshold);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (viewState.sortBy) {
        case 'anomaly_score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'severity':
          aValue = ANOMALY_SEVERITIES.findIndex(s => s.value === a.severity);
          bValue = ANOMALY_SEVERITIES.findIndex(s => s.value === b.severity);
          break;
        case 'timestamp':
          aValue = new Date(a.detectedAt).getTime();
          bValue = new Date(b.detectedAt).getTime();
          break;
        default:
          aValue = a.score || 0;
          bValue = b.score || 0;
      }

      if (viewState.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [detectorState.anomalies, viewState.searchQuery, viewState.severityFilter, viewState.categoryFilter, viewState.anomalyType, viewState.smartFiltering, viewState.confidenceThreshold, viewState.sortBy, viewState.sortOrder]);

  // Render Functions
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Detection Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detectorState.totalAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              {detectorState.criticalAnomalies} critical
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              detectorState.detectionAccuracy >= 0.9 ? 'text-green-600' :
              detectorState.detectionAccuracy >= 0.8 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {(detectorState.detectionAccuracy * 100).toFixed(1)}%
            </div>
            <Progress value={detectorState.detectionAccuracy * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{detectorState.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              requiring attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positive Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              detectorState.falsePositiveRate <= 0.05 ? 'text-green-600' :
              detectorState.falsePositiveRate <= 0.1 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {(detectorState.falsePositiveRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Detection Status
            <Badge className={streamingRef.current ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {streamingRef.current ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{detectorState.modelsTraining}</div>
              <div className="text-sm text-gray-500">Models Training</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{detectorState.patternsIdentified}</div>
              <div className="text-sm text-gray-500">Patterns Identified</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{detectorState.predictionsGenerated}</div>
              <div className="text-sm text-gray-500">Predictions Generated</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {detectorState.averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-gray-500">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            Recent Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAnomalies.slice(0, 5).map(anomaly => (
              <div key={anomaly.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getAnomalyTypeIcon(anomaly.type)}
                  <div>
                    <div className="font-medium">{anomaly.description}</div>
                    <div className="text-sm text-gray-500">
                      {anomaly.type} • {anomaly.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getScoreColor(anomaly.score)}`}>
                    Score: {(anomaly.score * 100).toFixed(1)}%
                  </div>
                  <Badge className={getSeverityColor(anomaly.severity)}>
                    {anomaly.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              By Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ANOMALY_TYPES.slice(1).map(type => {
                const count = filteredAnomalies.filter(a => a.type === type.value).length;
                const percentage = detectorState.totalAnomalies > 0 
                  ? (count / detectorState.totalAnomalies) * 100 
                  : 0;
                
                return (
                  <div key={type.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAnomalyTypeIcon(type.value as AnomalyType)}
                      <span className="text-sm">{type.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <div className="w-16">
                        <Progress value={percentage} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              By Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ANOMALY_SEVERITIES.map(severity => {
                const count = filteredAnomalies.filter(a => a.severity === severity.value).length;
                const percentage = detectorState.totalAnomalies > 0 
                  ? (count / detectorState.totalAnomalies) * 100 
                  : 0;
                
                return (
                  <div key={severity.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={severity.color}>
                        {severity.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <div className="w-16">
                        <Progress value={percentage} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Main Render
  return (
    <TooltipProvider>
      <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radar className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Anomaly Detector</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  streamingRef.current ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {streamingRef.current ? 'Detecting' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={viewState.anomalyType}
                onValueChange={(value) => setViewState(prev => ({ ...prev, anomalyType: value as AnomalyType }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANOMALY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetectionDialogOpen(true)}
              >
                <Play className="h-4 w-4 mr-2" />
                Detect
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={detectorState.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${detectorState.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Switch
                checked={viewState.autoDetection}
                onCheckedChange={(checked) => setViewState(prev => ({ ...prev, autoDetection: checked }))}
              />
              <span className="text-sm text-gray-600">Auto-detect</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs value={viewState.currentView} onValueChange={(value) => setViewState(prev => ({ ...prev, currentView: value as any }))}>
            <div className="border-b bg-white">
              <TabsList className="h-12 p-1 bg-transparent">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="detection" className="flex items-center gap-2">
                  <Radar className="h-4 w-4" />
                  Detection
                </TabsTrigger>
                <TabsTrigger value="patterns" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Patterns
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Alerts
                </TabsTrigger>
                <TabsTrigger value="models" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Models
                </TabsTrigger>
                <TabsTrigger value="configuration" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuration
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview">
                {renderOverview()}
              </TabsContent>
              <TabsContent value="detection">
                <div>Anomaly Detection Management (To be implemented)</div>
              </TabsContent>
              <TabsContent value="patterns">
                <div>Pattern Analysis Dashboard (To be implemented)</div>
              </TabsContent>
              <TabsContent value="alerts">
                <div>Alert Management System (To be implemented)</div>
              </TabsContent>
              <TabsContent value="models">
                <div>Detection Models Configuration (To be implemented)</div>
              </TabsContent>
              <TabsContent value="configuration">
                <div>Anomaly Detection Configuration (To be implemented)</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Detection Dialog */}
        <Dialog open={detectionDialogOpen} onOpenChange={setDetectionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Run Anomaly Detection</DialogTitle>
              <DialogDescription>
                Configure and run anomaly detection analysis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="detection-model">Detection Model</Label>
                <Select 
                  value={detectionForm.modelId}
                  onValueChange={(value) => setDetectionForm(prev => ({ ...prev, modelId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {DETECTION_MODELS.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({(model.accuracy * 100).toFixed(1)}% accuracy)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="confidence-threshold">Confidence Threshold: {detectionForm.confidenceThreshold}</Label>
                <Slider
                  value={[detectionForm.confidenceThreshold]}
                  onValueChange={(value) => setDetectionForm(prev => ({ ...prev, confidenceThreshold: value[0] }))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetectionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={performBatchDetection}
                  disabled={!detectionForm.modelId}
                >
                  Run Detection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AnomalyDetector;