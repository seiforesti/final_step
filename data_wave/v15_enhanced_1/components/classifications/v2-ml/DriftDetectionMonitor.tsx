import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Badge,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Slider,
  Progress,
  ScrollArea,
  Separator,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  GitBranch,
  LineChart as LucideLineChart,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
  Gauge,
  MapPin,
  Target,
  Timer,
  Workflow,
  BarChart4,
  Layers,
  Search,
  Calendar,
  Archive,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  Mail,
  Smartphone,
  Slack,
  AlertCircle,
  Info,
  AlertTriangle,
  ShieldAlert,
  Rocket,
  Lightbulb,
  Binary,
  Code2,
  Monitor,
  HelpCircle,
  Star,
  Users,
  Lock,
  Unlock,
  RotateCcw,
  FastForward,
  StopCircle,
  Sparkles,
  Flame,
  Award,
  Share2,
  Save,
  Maximize2,
  Minimize2,
  TrendingUp as TrendUp,
  TrendingDown as TrendDown,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine,
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { useMLIntelligence } from '../core/hooks/useMLIntelligence';
import { useClassificationState } from '../core/hooks/useClassificationState';

// Enhanced interfaces for drift detection
interface DriftDetector {
  id: string;
  name: string;
  modelId: string;
  type: 'data_drift' | 'concept_drift' | 'performance_drift' | 'feature_drift';
  status: 'active' | 'paused' | 'stopped' | 'error';
  method: 'ks_test' | 'chi_square' | 'psi' | 'js_divergence' | 'wasserstein' | 'statistical_tests' | 'ml_based';
  configuration: {
    threshold: number;
    window_size: number;
    reference_period: string;
    monitoring_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    sensitivity: 'low' | 'medium' | 'high';
    features: string[];
    target_variable?: string;
  };
  alerts: {
    enabled: boolean;
    channels: Array<'email' | 'slack' | 'webhook' | 'sms'>;
    severity_levels: Array<'info' | 'warning' | 'critical'>;
    escalation_rules: Array<{
      condition: string;
      delay: number;
      action: string;
    }>;
  };
  remediation: {
    auto_retrain: boolean;
    auto_scale: boolean;
    fallback_model?: string;
    custom_actions: Array<{
      trigger: string;
      action: string;
      parameters: Record<string, any>;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  lastCheck: string;
  performance: {
    detections: number;
    falsePositives: number;
    accuracy: number;
    responsiveness: number;
  };
}

interface DriftIncident {
  id: string;
  detectorId: string;
  type: DriftDetector['type'];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'acknowledged';
  title: string;
  description: string;
  detectedAt: string;
  resolvedAt?: string;
  affectedFeatures: string[];
  impact: {
    scope: 'single_feature' | 'multiple_features' | 'model_wide' | 'system_wide';
    magnitude: number;
    business_impact: 'low' | 'medium' | 'high' | 'critical';
    affected_predictions: number;
  };
  metrics: {
    drift_score: number;
    statistical_significance: number;
    confidence_interval: [number, number];
    comparison_period: string;
  };
  remediation: {
    actions_taken: Array<{
      action: string;
      timestamp: string;
      result: 'success' | 'failed' | 'pending';
      details: string;
    }>;
    estimated_resolution_time?: string;
    manual_intervention_required: boolean;
  };
  assignee?: string;
  tags: string[];
  comments: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }>;
}

interface DriftAnalysis {
  feature: string;
  drift_type: 'data' | 'concept' | 'performance';
  drift_score: number;
  p_value: number;
  statistical_test: string;
  reference_distribution: number[];
  current_distribution: number[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  forecast: Array<{
    timestamp: string;
    predicted_drift: number;
    confidence: number;
  }>;
  recommendations: string[];
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  channels: Array<'email' | 'slack' | 'webhook' | 'sms'>;
  enabled: boolean;
  cooldown: number;
  escalation: {
    enabled: boolean;
    delay: number;
    target: string;
  };
}

const DriftDetectionMonitor: React.FC = () => {
  // State management
  const {
    mlModels,
    driftDetectors,
    driftIncidents,
    driftAnalyses,
    selectedModelId,
    loading,
    addNotification,
    fetchMLModels,
    createDriftDetector,
    updateDriftDetector,
    deleteDriftDetector,
    startDriftMonitoring,
    pauseDriftMonitoring,
    stopDriftMonitoring,
    fetchDriftAnalysis,
    resolveDriftIncident,
    acknowledgeDriftIncident,
    setSelectedModel,
  } = useMLIntelligence();

  const { realtimeData } = useClassificationState();

  // Local state
  const [activeTab, setActiveTab] = useState('detectors');
  const [selectedDetector, setSelectedDetector] = useState<DriftDetector | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<DriftIncident | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showIncidentDialog, setShowIncidentDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [detectorFilters, setDetectorFilters] = useState({
    status: 'all',
    type: 'all',
    model: 'all',
    method: 'all'
  });
  const [incidentFilters, setIncidentFilters] = useState({
    status: 'all',
    severity: 'all',
    type: 'all',
    assignee: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'severity' | 'status'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timeline'>('table');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoRemediation, setAutoRemediation] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [driftThreshold, setDriftThreshold] = useState(0.1);
  const [monitoringFrequency, setMonitoringFrequency] = useState<'realtime' | 'hourly' | 'daily'>('hourly');

  // Refs
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const alertSound = useRef<HTMLAudioElement | null>(null);

  // Mock data for demonstration
  const mockDriftDetectors: DriftDetector[] = useMemo(() => [
    {
      id: 'detector_1',
      name: 'Customer Behavior Drift Monitor',
      modelId: 'model_1',
      type: 'data_drift',
      status: 'active',
      method: 'ks_test',
      configuration: {
        threshold: 0.05,
        window_size: 1000,
        reference_period: '30d',
        monitoring_frequency: 'hourly',
        sensitivity: 'medium',
        features: ['age', 'income', 'purchase_history', 'location']
      },
      alerts: {
        enabled: true,
        channels: ['email', 'slack'],
        severity_levels: ['warning', 'critical'],
        escalation_rules: []
      },
      remediation: {
        auto_retrain: true,
        auto_scale: false,
        custom_actions: []
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      lastCheck: '2024-01-20T16:00:00Z',
      performance: {
        detections: 12,
        falsePositives: 2,
        accuracy: 0.92,
        responsiveness: 0.87
      }
    },
    {
      id: 'detector_2',
      name: 'Model Performance Monitor',
      modelId: 'model_1',
      type: 'performance_drift',
      status: 'active',
      method: 'statistical_tests',
      configuration: {
        threshold: 0.1,
        window_size: 500,
        reference_period: '7d',
        monitoring_frequency: 'realtime',
        sensitivity: 'high',
        features: ['accuracy', 'precision', 'recall', 'f1_score'],
        target_variable: 'prediction_accuracy'
      },
      alerts: {
        enabled: true,
        channels: ['email', 'webhook'],
        severity_levels: ['info', 'warning', 'critical'],
        escalation_rules: [
          {
            condition: 'severity=critical AND duration>30m',
            delay: 1800,
            action: 'escalate_to_manager'
          }
        ]
      },
      remediation: {
        auto_retrain: false,
        auto_scale: true,
        fallback_model: 'model_backup_1',
        custom_actions: [
          {
            trigger: 'drift_score>0.2',
            action: 'switch_to_fallback',
            parameters: { model_id: 'model_backup_1' }
          }
        ]
      },
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      lastCheck: '2024-01-20T16:05:00Z',
      performance: {
        detections: 8,
        falsePositives: 1,
        accuracy: 0.95,
        responsiveness: 0.93
      }
    }
  ], []);

  const mockIncidents: DriftIncident[] = useMemo(() => [
    {
      id: 'incident_1',
      detectorId: 'detector_1',
      type: 'data_drift',
      severity: 'high',
      status: 'investigating',
      title: 'Significant drift detected in customer age distribution',
      description: 'The age distribution of incoming customers has shifted significantly compared to the training data.',
      detectedAt: '2024-01-20T15:30:00Z',
      affectedFeatures: ['age', 'income'],
      impact: {
        scope: 'multiple_features',
        magnitude: 0.23,
        business_impact: 'medium',
        affected_predictions: 1500
      },
      metrics: {
        drift_score: 0.23,
        statistical_significance: 0.001,
        confidence_interval: [0.18, 0.28],
        comparison_period: '30d'
      },
      remediation: {
        actions_taken: [
          {
            action: 'Increased monitoring frequency',
            timestamp: '2024-01-20T15:35:00Z',
            result: 'success',
            details: 'Monitoring frequency increased to every 15 minutes'
          },
          {
            action: 'Initiated data analysis',
            timestamp: '2024-01-20T15:40:00Z',
            result: 'pending',
            details: 'Deep analysis of affected features in progress'
          }
        ],
        estimated_resolution_time: '2024-01-20T18:00:00Z',
        manual_intervention_required: true
      },
      assignee: 'john.doe@company.com',
      tags: ['urgent', 'customer_data'],
      comments: [
        {
          id: 'comment_1',
          author: 'john.doe@company.com',
          content: 'Investigating the root cause of age distribution shift.',
          timestamp: '2024-01-20T15:45:00Z'
        }
      ]
    },
    {
      id: 'incident_2',
      detectorId: 'detector_2',
      type: 'performance_drift',
      severity: 'critical',
      status: 'resolved',
      title: 'Model accuracy dropped below threshold',
      description: 'Model prediction accuracy has decreased from 94% to 87% over the past 6 hours.',
      detectedAt: '2024-01-20T10:00:00Z',
      resolvedAt: '2024-01-20T14:30:00Z',
      affectedFeatures: ['accuracy', 'precision'],
      impact: {
        scope: 'model_wide',
        magnitude: 0.07,
        business_impact: 'high',
        affected_predictions: 3200
      },
      metrics: {
        drift_score: 0.31,
        statistical_significance: 0.0001,
        confidence_interval: [0.26, 0.36],
        comparison_period: '24h'
      },
      remediation: {
        actions_taken: [
          {
            action: 'Automatic model retrain triggered',
            timestamp: '2024-01-20T10:05:00Z',
            result: 'success',
            details: 'Model retrained with latest data batch'
          },
          {
            action: 'Deployed updated model',
            timestamp: '2024-01-20T14:00:00Z',
            result: 'success',
            details: 'New model deployed with 92% accuracy'
          }
        ],
        manual_intervention_required: false
      },
      assignee: 'jane.smith@company.com',
      tags: ['resolved', 'auto_remediation'],
      comments: []
    }
  ], []);

  // Effects
  useEffect(() => {
    fetchMLModels();
  }, [fetchMLModels]);

  useEffect(() => {
    if (realTimeEnabled) {
      refreshInterval.current = setInterval(() => {
        // Refresh drift data in real-time
        if (selectedDetector) {
          fetchDriftAnalysis(selectedDetector.id);
        }
      }, 30000); // Refresh every 30 seconds

      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [realTimeEnabled, selectedDetector, fetchDriftAnalysis]);

  // Computed values
  const filteredDetectors = useMemo(() => {
    let filtered = mockDriftDetectors;

    if (detectorFilters.status !== 'all') {
      filtered = filtered.filter(d => d.status === detectorFilters.status);
    }
    if (detectorFilters.type !== 'all') {
      filtered = filtered.filter(d => d.type === detectorFilters.type);
    }
    if (detectorFilters.method !== 'all') {
      filtered = filtered.filter(d => d.method === detectorFilters.method);
    }
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [mockDriftDetectors, detectorFilters, searchQuery, sortBy, sortOrder]);

  const filteredIncidents = useMemo(() => {
    let filtered = mockIncidents;

    if (incidentFilters.status !== 'all') {
      filtered = filtered.filter(i => i.status === incidentFilters.status);
    }
    if (incidentFilters.severity !== 'all') {
      filtered = filtered.filter(i => i.severity === incidentFilters.severity);
    }
    if (incidentFilters.type !== 'all') {
      filtered = filtered.filter(i => i.type === incidentFilters.type);
    }

    return filtered.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  }, [mockIncidents, incidentFilters]);

  const driftStats = useMemo(() => {
    const totalDetectors = mockDriftDetectors.length;
    const activeDetectors = mockDriftDetectors.filter(d => d.status === 'active').length;
    const totalIncidents = mockIncidents.length;
    const openIncidents = mockIncidents.filter(i => i.status !== 'resolved').length;
    const criticalIncidents = mockIncidents.filter(i => i.severity === 'critical').length;

    return {
      totalDetectors,
      activeDetectors,
      totalIncidents,
      openIncidents,
      criticalIncidents
    };
  }, [mockDriftDetectors, mockIncidents]);

  // Mock real-time drift data
  const realtimeDriftData = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toISOString(),
        data_drift: Math.random() * 0.2,
        concept_drift: Math.random() * 0.15,
        performance_drift: Math.random() * 0.1,
        timestamp: time.getHours() + ':00'
      });
    }
    return data;
  }, []);

  const featureDriftData = useMemo(() => [
    { feature: 'age', drift_score: 0.23, status: 'high', trend: 'increasing' },
    { feature: 'income', drift_score: 0.12, status: 'medium', trend: 'stable' },
    { feature: 'location', drift_score: 0.05, status: 'low', trend: 'decreasing' },
    { feature: 'purchase_history', drift_score: 0.18, status: 'medium', trend: 'increasing' },
    { feature: 'preferences', drift_score: 0.08, status: 'low', trend: 'stable' }
  ], []);

  // Event handlers
  const handleCreateDetector = useCallback(async (detectorData: any) => {
    try {
      await createDriftDetector(detectorData);
      setShowCreateDialog(false);
      addNotification({
        type: 'success',
        title: 'Drift Detector Created',
        message: `Drift detector "${detectorData.name}" has been created successfully.`,
        category: 'drift_detection'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create drift detector.',
        category: 'drift_detection'
      });
    }
  }, [createDriftDetector, addNotification]);

  const handleStartMonitoring = useCallback(async (detectorId: string) => {
    try {
      await startDriftMonitoring(detectorId);
      addNotification({
        type: 'success',
        title: 'Monitoring Started',
        message: 'Drift monitoring has been started.',
        category: 'drift_detection'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Start Failed',
        message: 'Failed to start drift monitoring.',
        category: 'drift_detection'
      });
    }
  }, [startDriftMonitoring, addNotification]);

  const handlePauseMonitoring = useCallback(async (detectorId: string) => {
    try {
      await pauseDriftMonitoring(detectorId);
      addNotification({
        type: 'info',
        title: 'Monitoring Paused',
        message: 'Drift monitoring has been paused.',
        category: 'drift_detection'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Pause Failed',
        message: 'Failed to pause drift monitoring.',
        category: 'drift_detection'
      });
    }
  }, [pauseDriftMonitoring, addNotification]);

  const handleResolveIncident = useCallback(async (incidentId: string, resolution: string) => {
    try {
      await resolveDriftIncident(incidentId, resolution);
      addNotification({
        type: 'success',
        title: 'Incident Resolved',
        message: 'Drift incident has been resolved successfully.',
        category: 'drift_detection'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Resolution Failed',
        message: 'Failed to resolve drift incident.',
        category: 'drift_detection'
      });
    }
  }, [resolveDriftIncident, addNotification]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'stopped':
        return <StopCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDriftStatusColor = (driftScore: number) => {
    if (driftScore > 0.2) return 'text-red-600';
    if (driftScore > 0.1) return 'text-orange-600';
    if (driftScore > 0.05) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Render create detector dialog
  const renderCreateDetectorDialog = () => (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Create Drift Detector
          </DialogTitle>
          <DialogDescription>
            Configure a new drift detector to monitor your ML model for data, concept, or performance drift.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="detector-name">Detector Name</Label>
                  <Input
                    id="detector-name"
                    placeholder="Enter detector name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="detector-model">Target Model</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {mlModels?.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drift-type">Drift Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select drift type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_drift">Data Drift</SelectItem>
                      <SelectItem value="concept_drift">Concept Drift</SelectItem>
                      <SelectItem value="performance_drift">Performance Drift</SelectItem>
                      <SelectItem value="feature_drift">Feature Drift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="detection-method">Detection Method</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ks_test">Kolmogorov-Smirnov Test</SelectItem>
                      <SelectItem value="chi_square">Chi-Square Test</SelectItem>
                      <SelectItem value="psi">Population Stability Index</SelectItem>
                      <SelectItem value="js_divergence">Jensen-Shannon Divergence</SelectItem>
                      <SelectItem value="wasserstein">Wasserstein Distance</SelectItem>
                      <SelectItem value="statistical_tests">Statistical Tests</SelectItem>
                      <SelectItem value="ml_based">ML-Based Detection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detection Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detection Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="threshold">Drift Threshold</Label>
                  <div className="mt-1">
                    <Input
                      id="threshold"
                      type="number"
                      step="0.01"
                      value={driftThreshold}
                      onChange={(e) => setDriftThreshold(parseFloat(e.target.value))}
                    />
                    <Slider
                      value={[driftThreshold]}
                      onValueChange={([value]) => setDriftThreshold(value)}
                      max={1}
                      min={0.01}
                      step={0.01}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="window-size">Window Size</Label>
                  <Input
                    id="window-size"
                    type="number"
                    placeholder="1000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="monitoring-freq">Monitoring Frequency</Label>
                  <Select value={monitoringFrequency} onValueChange={(value: any) => setMonitoringFrequency(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Sensitivity Level</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button variant="outline" size="sm">Low</Button>
                  <Button variant="default" size="sm">Medium</Button>
                  <Button variant="outline" size="sm">High</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="alerts-enabled">Enable Alerts</Label>
                <Switch
                  id="alerts-enabled"
                  checked={alertsEnabled}
                  onCheckedChange={setAlertsEnabled}
                />
              </div>

              {alertsEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Alert Channels</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button variant="outline" size="sm" className="justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Slack className="h-4 w-4 mr-2" />
                        Slack
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <Smartphone className="h-4 w-4 mr-2" />
                        SMS
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Webhook
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Severity Levels</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="sm">Info</Button>
                      <Button variant="default" size="sm">Warning</Button>
                      <Button variant="default" size="sm">Critical</Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auto-Remediation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Auto-Remediation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-remediation">Enable Auto-Remediation</Label>
                <Switch
                  id="auto-remediation"
                  checked={autoRemediation}
                  onCheckedChange={setAutoRemediation}
                />
              </div>

              {autoRemediation && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-retrain">Auto-Retrain Model</Label>
                    <Switch id="auto-retrain" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-scale">Auto-Scale Resources</Label>
                    <Switch id="auto-scale" />
                  </div>

                  <div>
                    <Label htmlFor="fallback-model">Fallback Model</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select fallback model" />
                      </SelectTrigger>
                      <SelectContent>
                        {mlModels?.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} (Backup)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleCreateDetector({})}>
            Create Detector
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render incident details dialog
  const renderIncidentDialog = () => (
    <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Incident Details - {selectedIncident?.title}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the drift incident and remediation actions.
          </DialogDescription>
        </DialogHeader>

        {selectedIncident && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="remediation">Remediation</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(selectedIncident.severity)}
                      <span className="font-medium">Severity</span>
                    </div>
                    <Badge className={`mt-2 ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Drift Score</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedIncident.metrics.drift_score.toFixed(3)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Affected</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedIncident.impact.affected_predictions.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">predictions</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Detected</span>
                    </div>
                    <p className="text-sm font-semibold mt-1">
                      {formatTimeAgo(selectedIncident.detectedAt)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Impact Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Affected Features</h4>
                      <div className="space-y-2">
                        {selectedIncident.affectedFeatures.map(feature => (
                          <Badge key={feature} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Business Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Scope:</span>
                          <Badge variant="outline">{selectedIncident.impact.scope.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Magnitude:</span>
                          <span className="font-semibold">{(selectedIncident.impact.magnitude * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Business Impact:</span>
                          <Badge className={getSeverityColor(selectedIncident.impact.business_impact)}>
                            {selectedIncident.impact.business_impact}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistical Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Statistical Significance</Label>
                      <p className="text-lg font-semibold">{selectedIncident.metrics.statistical_significance}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Confidence Interval</Label>
                      <p className="text-lg font-semibold">
                        [{selectedIncident.metrics.confidence_interval[0].toFixed(3)}, {selectedIncident.metrics.confidence_interval[1].toFixed(3)}]
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Comparison Period</Label>
                      <p className="text-lg font-semibold">{selectedIncident.metrics.comparison_period}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Drift Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={realtimeDriftData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="data_drift"
                          stroke="#8884d8"
                          strokeWidth={2}
                          name="Data Drift"
                        />
                        <Line
                          type="monotone"
                          dataKey="concept_drift"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          name="Concept Drift"
                        />
                        <ReferenceLine y={driftThreshold} stroke="red" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feature-Level Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featureDriftData.map((feature) => (
                      <div key={feature.feature} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{feature.feature}</span>
                          <Badge variant="outline">{feature.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${getDriftStatusColor(feature.drift_score)}`}>
                            {feature.drift_score.toFixed(3)}
                          </span>
                          {feature.trend === 'increasing' ? (
                            <TrendUp className="h-4 w-4 text-red-500" />
                          ) : feature.trend === 'decreasing' ? (
                            <TrendDown className="h-4 w-4 text-green-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="remediation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Remediation Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedIncident.remediation.actions_taken.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="mt-1">
                          {action.result === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : action.result === 'failed' ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{action.action}</p>
                          <p className="text-sm text-gray-600 mt-1">{action.details}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(action.timestamp)}
                          </p>
                        </div>
                        <Badge variant="outline">{action.result}</Badge>
                      </div>
                    ))}
                  </div>

                  {selectedIncident.remediation.manual_intervention_required && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Manual Intervention Required</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        This incident requires manual review and intervention to fully resolve.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleResolveIncident(selectedIncident.id, 'Manual resolution')}
                  disabled={selectedIncident.status === 'resolved'}
                >
                  Mark as Resolved
                </Button>
                <Button variant="outline">
                  Assign to Team Member
                </Button>
                <Button variant="outline">
                  Add Comment
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Incident Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Drift Detected</p>
                        <p className="text-sm text-gray-600">
                          Significant drift detected in {selectedIncident.affectedFeatures.join(', ')}
                        </p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(selectedIncident.detectedAt)}</p>
                      </div>
                    </div>

                    {selectedIncident.remediation.actions_taken.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">{action.action}</p>
                          <p className="text-sm text-gray-600">{action.details}</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(action.timestamp)}</p>
                        </div>
                      </div>
                    ))}

                    {selectedIncident.resolvedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">Incident Resolved</p>
                          <p className="text-sm text-gray-600">Incident has been successfully resolved</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(selectedIncident.resolvedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowIncidentDialog(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              Drift Detection Monitor
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time monitoring and detection of data, concept, and performance drift in ML models
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={realTimeEnabled}
                onCheckedChange={setRealTimeEnabled}
                id="realtime-monitoring"
              />
              <Label htmlFor="realtime-monitoring" className="text-sm">Real-time</Label>
            </div>
            
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Detector
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Detectors</p>
                  <p className="text-2xl font-bold">{driftStats.totalDetectors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{driftStats.activeDetectors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Incidents</p>
                  <p className="text-2xl font-bold">{driftStats.openIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold">{driftStats.criticalIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">All Incidents</p>
                  <p className="text-2xl font-bold">{driftStats.totalIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Drift Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Drift Overview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="6h">6h</SelectItem>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="7d">7d</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realtimeDriftData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="data_drift"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Data Drift"
                  />
                  <Line
                    type="monotone"
                    dataKey="concept_drift"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Concept Drift"
                  />
                  <Line
                    type="monotone"
                    dataKey="performance_drift"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Performance Drift"
                  />
                  <ReferenceLine y={driftThreshold} stroke="#ef4444" strokeDasharray="5 5" label="Threshold" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="detectors">Detectors</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <BarChart4 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="detectors" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search detectors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={detectorFilters.status} onValueChange={(value) => 
                    setDetectorFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="stopped">Stopped</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={detectorFilters.type} onValueChange={(value) => 
                    setDetectorFilters(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="data_drift">Data Drift</SelectItem>
                      <SelectItem value="concept_drift">Concept Drift</SelectItem>
                      <SelectItem value="performance_drift">Performance Drift</SelectItem>
                      <SelectItem value="feature_drift">Feature Drift</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={detectorFilters.method} onValueChange={(value) => 
                    setDetectorFilters(prev => ({ ...prev, method: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="ks_test">KS Test</SelectItem>
                      <SelectItem value="chi_square">Chi-Square</SelectItem>
                      <SelectItem value="psi">PSI</SelectItem>
                      <SelectItem value="statistical_tests">Statistical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Detectors Table */}
            <Card>
              <CardHeader>
                <CardTitle>Drift Detectors</CardTitle>
                <CardDescription>
                  Monitor and manage your drift detection configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Last Check</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDetectors.map((detector) => {
                      const model = mlModels?.find(m => m.id === detector.modelId);
                      
                      return (
                        <TableRow 
                          key={detector.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedDetector(detector)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{detector.name}</p>
                              <p className="text-sm text-gray-500">
                                Created {new Date(detector.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {detector.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {detector.method.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(detector.status)}
                              <Badge className={getStatusColor(detector.status)}>
                                {detector.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BrainCircuit className="h-4 w-4 text-purple-500" />
                              {model?.name || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-medium">
                                {formatTimeAgo(detector.lastCheck)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {detector.configuration.monitoring_frequency}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <p className="font-semibold">
                                {(detector.performance.accuracy * 100).toFixed(1)}%
                              </p>
                              <p className="text-xs text-gray-500">
                                {detector.performance.detections} detections
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {detector.status === 'paused' || detector.status === 'stopped' ? (
                                  <DropdownMenuItem onClick={() => handleStartMonitoring(detector.id)}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handlePauseMonitoring(detector.id)}>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Configure
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export Data
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            {/* Incident Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Select value={incidentFilters.status} onValueChange={(value) => 
                    setIncidentFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={incidentFilters.severity} onValueChange={(value) => 
                    setIncidentFilters(prev => ({ ...prev, severity: value }))
                  }>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={incidentFilters.type} onValueChange={(value) => 
                    setIncidentFilters(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="data_drift">Data Drift</SelectItem>
                      <SelectItem value="concept_drift">Concept Drift</SelectItem>
                      <SelectItem value="performance_drift">Performance Drift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Incidents List */}
            <div className="space-y-4">
              {filteredIncidents.map((incident) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedIncident(incident);
                      setShowIncidentDialog(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getSeverityIcon(incident.severity)}
                            <h3 className="font-semibold">{incident.title}</h3>
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                            <Badge variant="outline">
                              {incident.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Drift Score: {incident.metrics.drift_score.toFixed(3)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {incident.impact.affected_predictions.toLocaleString()} affected
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(incident.detectedAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {incident.assignee && (
                            <Badge variant="outline">
                              Assigned to {incident.assignee.split('@')[0]}
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feature Drift Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featureDriftData.map((feature) => (
                      <div key={feature.feature} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{feature.feature}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${getDriftStatusColor(feature.drift_score)}`}>
                              {feature.drift_score.toFixed(3)}
                            </span>
                            {feature.trend === 'increasing' ? (
                              <TrendUp className="h-4 w-4 text-red-500" />
                            ) : feature.trend === 'decreasing' ? (
                              <TrendDown className="h-4 w-4 text-green-500" />
                            ) : (
                              <Activity className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <Progress 
                          value={(feature.drift_score / 0.3) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Drift Detection Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'KS Test', value: 35, color: '#3b82f6' },
                            { name: 'Chi-Square', value: 25, color: '#10b981' },
                            { name: 'PSI', value: 20, color: '#f59e0b' },
                            { name: 'JS Divergence', value: 15, color: '#ef4444' },
                            { name: 'ML-Based', value: 5, color: '#8b5cf6' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {[
                            { name: 'KS Test', value: 35, color: '#3b82f6' },
                            { name: 'Chi-Square', value: 25, color: '#10b981' },
                            { name: 'PSI', value: 20, color: '#f59e0b' },
                            { name: 'JS Divergence', value: 15, color: '#ef4444' },
                            { name: 'ML-Based', value: 5, color: '#8b5cf6' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Drift Detection Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { detector: 'Customer Behavior', accuracy: 92, responsiveness: 87, detections: 12 },
                      { detector: 'Model Performance', accuracy: 95, responsiveness: 93, detections: 8 },
                      { detector: 'Feature Quality', accuracy: 88, responsiveness: 82, detections: 15 },
                      { detector: 'Concept Evolution', accuracy: 90, responsiveness: 89, detections: 6 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="detector" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" />
                      <Bar dataKey="responsiveness" fill="#10b981" name="Responsiveness %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Global Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="global-alerts">Global Alerts</Label>
                      <p className="text-sm text-gray-600">Enable system-wide alert notifications</p>
                    </div>
                    <Switch
                      id="global-alerts"
                      checked={alertsEnabled}
                      onCheckedChange={setAlertsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-remediation-global">Auto-Remediation</Label>
                      <p className="text-sm text-gray-600">Automatically attempt to remediate detected drift</p>
                    </div>
                    <Switch
                      id="auto-remediation-global"
                      checked={autoRemediation}
                      onCheckedChange={setAutoRemediation}
                    />
                  </div>

                  <div>
                    <Label htmlFor="global-threshold">Default Drift Threshold</Label>
                    <div className="mt-2">
                      <Slider
                        value={[driftThreshold]}
                        onValueChange={([value]) => setDriftThreshold(value)}
                        max={1}
                        min={0.01}
                        step={0.01}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>0.01</span>
                        <span className="font-medium">{driftThreshold.toFixed(2)}</span>
                        <span>1.00</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="monitoring-frequency-global">Default Monitoring Frequency</Label>
                    <Select value={monitoringFrequency} onValueChange={(value: any) => setMonitoringFrequency(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alert Channels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-gray-600">admin@company.com</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Slack className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="font-medium">Slack</p>
                          <p className="text-sm text-gray-600">#ml-alerts</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="font-medium">Webhook</p>
                          <p className="text-sm text-gray-600">https://api.company.com/alerts</p>
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium">SMS</p>
                          <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Channel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {renderCreateDetectorDialog()}
        {renderIncidentDialog()}
      </div>
    </TooltipProvider>
  );
};

export default DriftDetectionMonitor;