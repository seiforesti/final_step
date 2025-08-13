import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Badge,
  Button,
  Input,
  Label,
  Progress,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Slider,
} from '@/components/ui';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Activity,
  Zap,
  Brain,
  Cpu,
  Network,
  Database,
  Monitor,
  Play,
  Pause,
  Stop,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  Share2,
  Copy,
  Save,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Award,
  Clock,
  Users,
  Globe,
  MapPin,
  Calendar,
  Flag,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  Lightbulb,
  Layers,
  Grid,
  List,
  Table,
  Plus,
  Minus,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Wifi,
  WifiOff,
  Signal,
  Rss,
  Radio,
  Waves,
} from 'lucide-react';
import { useClassificationState } from '../core/hooks/useClassificationState';
import { useAIIntelligence } from '../core/hooks/useAIIntelligence';
import { aiApi } from '../core/api/aiApi';
import { websocketApi } from '../core/api/websocketApi';

// Enhanced real-time intelligence streaming types
interface IntelligenceStreamState {
  activeStreams: IntelligenceStream[];
  dataChannels: DataChannel[];
  processors: StreamProcessor[];
  analytics: StreamAnalytics;
  monitoring: StreamMonitoring;
  optimization: StreamOptimization;
  quality: StreamQuality;
  performance: StreamPerformance;
  intelligence: StreamIntelligence;
  alerts: StreamAlert[];
  insights: StreamInsight[];
  patterns: StreamPattern[];
  anomalies: StreamAnomaly[];
  predictions: StreamPrediction[];
  recommendations: StreamRecommendation[];
}

interface IntelligenceStream {
  id: string;
  name: string;
  type: 'classification' | 'prediction' | 'analysis' | 'monitoring' | 'optimization' | 'intelligence';
  status: 'active' | 'paused' | 'stopped' | 'error' | 'connecting' | 'buffering';
  source: StreamSource;
  destination: StreamDestination;
  configuration: StreamConfiguration;
  metrics: StreamMetrics;
  quality: StreamQualityMetrics;
  performance: StreamPerformanceMetrics;
  processing: StreamProcessing;
  intelligence: StreamIntelligenceConfig;
  filters: StreamFilter[];
  transformations: StreamTransformation[];
  aggregations: StreamAggregation[];
  alerts: StreamAlertConfig[];
  visualization: StreamVisualization;
  storage: StreamStorage;
  security: StreamSecurity;
  compliance: StreamCompliance;
  metadata: StreamMetadata;
}

interface DataChannel {
  id: string;
  name: string;
  type: 'websocket' | 'sse' | 'polling' | 'push' | 'pull' | 'hybrid';
  protocol: 'ws' | 'wss' | 'http' | 'https' | 'tcp' | 'udp';
  endpoint: string;
  status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  latency: number;
  throughput: number;
  reliability: number;
  security: ChannelSecurity;
  compression: CompressionConfig;
  authentication: AuthenticationConfig;
  encryption: EncryptionConfig;
  retryPolicy: RetryPolicy;
  heartbeat: HeartbeatConfig;
  buffering: BufferingConfig;
  monitoring: ChannelMonitoring;
  analytics: ChannelAnalytics;
  optimization: ChannelOptimization;
}

interface StreamProcessor {
  id: string;
  name: string;
  type: 'filter' | 'transform' | 'aggregate' | 'analyze' | 'classify' | 'predict' | 'optimize';
  algorithm: ProcessingAlgorithm;
  configuration: ProcessorConfiguration;
  performance: ProcessorPerformance;
  quality: ProcessorQuality;
  intelligence: ProcessorIntelligence;
  resources: ProcessorResources;
  scaling: ProcessorScaling;
  monitoring: ProcessorMonitoring;
  optimization: ProcessorOptimization;
  errors: ProcessorError[];
  warnings: ProcessorWarning[];
  insights: ProcessorInsight[];
  recommendations: ProcessorRecommendation[];
}

interface StreamAnalytics {
  realTimeMetrics: RealTimeMetrics;
  historicalTrends: HistoricalTrend[];
  performanceAnalysis: PerformanceAnalysis;
  qualityAssessment: QualityAssessment;
  usagePatterns: UsagePattern[];
  behaviorAnalysis: BehaviorAnalysis;
  anomalyDetection: AnomalyDetection;
  predictiveAnalytics: PredictiveAnalytics;
  businessIntelligence: BusinessIntelligence;
  costAnalysis: CostAnalysis;
  complianceMetrics: ComplianceMetrics;
  securityAnalytics: SecurityAnalytics;
  operationalInsights: OperationalInsight[];
  strategicInsights: StrategicInsight[];
}

interface StreamVisualization {
  charts: VisualizationChart[];
  dashboards: VisualizationDashboard[];
  realTimeDisplays: RealTimeDisplay[];
  interactiveElements: InteractiveElement[];
  customizations: VisualizationCustomization[];
  themes: VisualizationTheme[];
  layouts: VisualizationLayout[];
  animations: VisualizationAnimation[];
  exports: VisualizationExport[];
  sharing: VisualizationSharing[];
}

// Constants for real-time intelligence streaming
const STREAM_TYPES = [
  { id: 'classification', name: 'Classification Stream', icon: Target, color: '#3B82F6', description: 'Real-time classification processing' },
  { id: 'prediction', name: 'Prediction Stream', icon: Brain, color: '#10B981', description: 'Predictive analytics streaming' },
  { id: 'analysis', name: 'Analysis Stream', icon: BarChart3, color: '#F59E0B', description: 'Real-time data analysis' },
  { id: 'monitoring', name: 'Monitoring Stream', icon: Monitor, color: '#EF4444', description: 'System monitoring streams' },
  { id: 'optimization', name: 'Optimization Stream', icon: Zap, color: '#8B5CF6', description: 'Performance optimization' },
  { id: 'intelligence', name: 'Intelligence Stream', icon: Lightbulb, color: '#EC4899, description: 'AI intelligence processing' },
];

const CHANNEL_TYPES = [
  { id: 'websocket', name: 'WebSocket', protocol: 'ws/wss', latency: 'ultra-low', reliability: 'high' },
  { id: 'sse', name: 'Server-Sent Events', protocol: 'http/https', latency: 'low', reliability: 'medium' },
  { id: 'polling', name: 'HTTP Polling', protocol: 'http/https', latency: 'medium', reliability: 'high' },
  { id: 'push', name: 'Push Notifications', protocol: 'various', latency: 'low', reliability: 'medium' },
  { id: 'hybrid', name: 'Hybrid Protocol', protocol: 'adaptive', latency: 'adaptive', reliability: 'very-high' },
];

const PROCESSOR_ALGORITHMS = [
  {
    id: 'real_time_classifier',
    name: 'Real-Time Classifier',
    type: 'classify',
    complexity: 'medium',
    performance: 0.92,
    latency: 'ultra-low',
    accuracy: 0.94,
  },
  {
    id: 'streaming_predictor',
    name: 'Streaming Predictor',
    type: 'predict',
    complexity: 'high',
    performance: 0.89,
    latency: 'low',
    accuracy: 0.91,
  },
  {
    id: 'adaptive_filter',
    name: 'Adaptive Filter',
    type: 'filter',
    complexity: 'low',
    performance: 0.96,
    latency: 'ultra-low',
    accuracy: 0.98,
  },
  {
    id: 'intelligent_aggregator',
    name: 'Intelligent Aggregator',
    type: 'aggregate',
    complexity: 'medium',
    performance: 0.88,
    latency: 'low',
    accuracy: 0.93,
  },
  {
    id: 'pattern_analyzer',
    name: 'Pattern Analyzer',
    type: 'analyze',
    complexity: 'high',
    performance: 0.85,
    latency: 'medium',
    accuracy: 0.87,
  },
];

const QUALITY_METRICS = [
  { id: 'accuracy', name: 'Accuracy', unit: '%', target: 95, threshold: 90 },
  { id: 'latency', name: 'Latency', unit: 'ms', target: 50, threshold: 100 },
  { id: 'throughput', name: 'Throughput', unit: 'msg/sec', target: 10000, threshold: 5000 },
  { id: 'reliability', name: 'Reliability', unit: '%', target: 99.9, threshold: 99.0 },
  { id: 'completeness', name: 'Completeness', unit: '%', target: 98, threshold: 95 },
  { id: 'consistency', name: 'Consistency', unit: '%', target: 97, threshold: 93 },
];

const RealTimeIntelligenceStream: React.FC = () => {
  const {
    streams: classificationStreams,
    realTimeData,
    isLoading,
    error,
    startStream,
    pauseStream,
    stopStream,
    optimizeStream,
    getStreamMetrics,
    analyzeStreamPerformance,
  } = useClassificationState();

  const {
    intelligenceStreaming,
    realTimeProcessing,
    streamAnalytics,
    streamOptimization,
    streamMonitoring,
    processRealTimeData,
    analyzeStreamPatterns,
    optimizeStreamPerformance,
    monitorStreamHealth,
    generateStreamInsights,
    predictStreamBehavior,
  } = useAIIntelligence();

  // Core state
  const [streamState, setStreamState] = useState<IntelligenceStreamState>({
    activeStreams: [],
    dataChannels: [],
    processors: [],
    analytics: {} as StreamAnalytics,
    monitoring: {} as StreamMonitoring,
    optimization: {} as StreamOptimization,
    quality: {} as StreamQuality,
    performance: {} as StreamPerformance,
    intelligence: {} as StreamIntelligence,
    alerts: [],
    insights: [],
    patterns: [],
    anomalies: [],
    predictions: [],
    recommendations: [],
  });

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline' | 'network'>('grid');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('performance');
  const [searchQuery, setSearchQuery] = useState('');

  // Configuration state
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [intelligentFiltering, setIntelligentFiltering] = useState(true);
  const [adaptiveProcessing, setAdaptiveProcessing] = useState(true);
  const [anomalyDetection, setAnomalyDetection] = useState(true);
  const [predictiveAnalytics, setPredictiveAnalytics] = useState(true);
  const [qualityMonitoring, setQualityMonitoring] = useState(true);
  const [performanceOptimization, setPerformanceOptimization] = useState(true);
  const [securityMode, setSecurityMode] = useState(true);
  const [complianceMode, setComplianceMode] = useState(false);

  // Advanced settings
  const [bufferSize, setBufferSize] = useState(1000);
  const [batchSize, setBatchSize] = useState(100);
  const [processingInterval, setProcessingInterval] = useState(100);
  const [retentionPeriod, setRetentionPeriod] = useState(86400);
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [encryptionLevel, setEncryptionLevel] = useState(256);

  // Refs for real-time updates
  const streamCanvasRef = useRef<HTMLCanvasElement>(null);
  const metricsUpdateRef = useRef<NodeJS.Timeout>();
  const dataBufferRef = useRef<any[]>([]);
  const processingQueueRef = useRef<any[]>([]);

  // Load data and initialize streaming
  useEffect(() => {
    loadStreamData();
    initializeRealTimeStreaming();
    initializeStreamProcessing();
    initializeStreamMonitoring();
    
    return () => {
      cleanup();
    };
  }, []);

  const loadStreamData = useCallback(async () => {
    try {
      const [
        streamsData,
        channelsData,
        processorsData,
        analyticsData,
        monitoringData,
        optimizationData,
        alertsData,
        insightsData,
      ] = await Promise.all([
        aiApi.getIntelligenceStreams({ includeMetrics: true, includeAnalytics: true }),
        aiApi.getDataChannels({ includePerformance: true, includeHealth: true }),
        aiApi.getStreamProcessors({ includeIntelligence: true, includeOptimization: true }),
        aiApi.getStreamAnalytics({ timeRange: '24h', includeRealTime: true }),
        aiApi.getStreamMonitoring({ includeAlerts: true, includeHealth: true }),
        aiApi.getStreamOptimization({ includeRecommendations: true }),
        aiApi.getStreamAlerts({ status: 'active', includeContext: true }),
        aiApi.getStreamInsights({ includePatterns: true, includePredictions: true }),
      ]);

      setStreamState(prev => ({
        ...prev,
        activeStreams: streamsData.data,
        dataChannels: channelsData.data,
        processors: processorsData.data,
        analytics: analyticsData.data,
        monitoring: monitoringData.data,
        optimization: optimizationData.data,
        alerts: alertsData.data,
        insights: insightsData.data,
      }));
    } catch (error) {
      console.error('Error loading stream data:', error);
    }
  }, []);

  const initializeRealTimeStreaming = useCallback(async () => {
    if (realTimeMode) {
      try {
        await websocketApi.connect('intelligence_stream');

        // Real-time data updates
        websocketApi.subscribe('stream_data_received', (data) => {
          dataBufferRef.current.push(data);
          if (dataBufferRef.current.length >= batchSize) {
            processBatch();
          }
        });

        websocketApi.subscribe('stream_metrics_updated', (data) => {
          setStreamState(prev => ({
            ...prev,
            analytics: { ...prev.analytics, realTimeMetrics: data },
          }));
        });

        websocketApi.subscribe('stream_alert_triggered', (data) => {
          setStreamState(prev => ({
            ...prev,
            alerts: [data.alert, ...prev.alerts.slice(0, 99)],
          }));
        });

        websocketApi.subscribe('stream_anomaly_detected', (data) => {
          setStreamState(prev => ({
            ...prev,
            anomalies: [data.anomaly, ...prev.anomalies.slice(0, 49)],
          }));
        });

        websocketApi.subscribe('stream_pattern_identified', (data) => {
          setStreamState(prev => ({
            ...prev,
            patterns: [data.pattern, ...prev.patterns.slice(0, 29)],
          }));
        });

        websocketApi.subscribe('stream_insight_generated', (data) => {
          setStreamState(prev => ({
            ...prev,
            insights: [data.insight, ...prev.insights.slice(0, 19)],
          }));
        });

      } catch (error) {
        console.error('Error initializing real-time streaming:', error);
      }
    }
  }, [realTimeMode, batchSize]);

  const initializeStreamProcessing = useCallback(async () => {
    try {
      await aiApi.initializeStreamProcessing({
        bufferSize,
        batchSize,
        processingInterval,
        intelligentFiltering,
        adaptiveProcessing,
        anomalyDetection,
        predictiveAnalytics,
        qualityMonitoring,
        performanceOptimization,
        realTimeMode,
      });
    } catch (error) {
      console.error('Error initializing stream processing:', error);
    }
  }, [bufferSize, batchSize, processingInterval, intelligentFiltering, adaptiveProcessing, anomalyDetection, predictiveAnalytics, qualityMonitoring, performanceOptimization, realTimeMode]);

  const initializeStreamMonitoring = useCallback(async () => {
    if (qualityMonitoring) {
      try {
        await aiApi.initializeStreamMonitoring({
          qualityMetrics: QUALITY_METRICS,
          alertThresholds: QUALITY_METRICS.map(m => ({ metric: m.id, threshold: m.threshold })),
          monitoringInterval: processingInterval,
          anomalyDetection,
          predictiveAnalytics,
          realTimeMode,
        });

        // Set up periodic metrics updates
        metricsUpdateRef.current = setInterval(() => {
          updateRealTimeMetrics();
        }, processingInterval);

      } catch (error) {
        console.error('Error initializing stream monitoring:', error);
      }
    }
  }, [qualityMonitoring, processingInterval, anomalyDetection, predictiveAnalytics, realTimeMode]);

  const processBatch = useCallback(async () => {
    if (dataBufferRef.current.length === 0) return;

    const batch = dataBufferRef.current.splice(0, batchSize);
    processingQueueRef.current.push(batch);

    try {
      const processedData = await processRealTimeData({
        batch,
        processors: streamState.processors,
        configuration: {
          intelligentFiltering,
          adaptiveProcessing,
          anomalyDetection,
          predictiveAnalytics,
        },
      });

      // Update stream state with processed data
      setStreamState(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          realTimeMetrics: {
            ...prev.analytics.realTimeMetrics,
            processedCount: (prev.analytics.realTimeMetrics?.processedCount || 0) + batch.length,
            lastProcessedAt: new Date(),
          },
        },
      }));

      // Generate insights if enabled
      if (predictiveAnalytics) {
        const insights = await generateStreamInsights(processedData);
        setStreamState(prev => ({
          ...prev,
          insights: [...insights, ...prev.insights.slice(0, 19 - insights.length)],
        }));
      }

    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }, [batchSize, streamState.processors, intelligentFiltering, adaptiveProcessing, anomalyDetection, predictiveAnalytics, processRealTimeData, generateStreamInsights]);

  const updateRealTimeMetrics = useCallback(async () => {
    try {
      const metrics = await getStreamMetrics({
        timeRange: '1m',
        includeQuality: true,
        includePerformance: true,
        includeHealth: true,
      });

      setStreamState(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          realTimeMetrics: metrics,
        },
      }));
    } catch (error) {
      console.error('Error updating real-time metrics:', error);
    }
  }, [getStreamMetrics]);

  const cleanup = useCallback(() => {
    if (metricsUpdateRef.current) {
      clearInterval(metricsUpdateRef.current);
    }
    
    dataBufferRef.current = [];
    processingQueueRef.current = [];
    
    if (realTimeMode) {
      websocketApi.disconnect('intelligence_stream');
    }
  }, [realTimeMode]);

  // Stream operations
  const handleStartStream = useCallback(async (streamId: string) => {
    try {
      await startStream({
        streamId,
        configuration: {
          realTimeMode,
          bufferSize,
          batchSize,
          processingInterval,
          intelligentFiltering,
          adaptiveProcessing,
          anomalyDetection,
          predictiveAnalytics,
        },
      });

      setStreamState(prev => ({
        ...prev,
        activeStreams: prev.activeStreams.map(stream =>
          stream.id === streamId ? { ...stream, status: 'active' } : stream
        ),
      }));
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  }, [realTimeMode, bufferSize, batchSize, processingInterval, intelligentFiltering, adaptiveProcessing, anomalyDetection, predictiveAnalytics, startStream]);

  const handlePauseStream = useCallback(async (streamId: string) => {
    try {
      await pauseStream(streamId);
      setStreamState(prev => ({
        ...prev,
        activeStreams: prev.activeStreams.map(stream =>
          stream.id === streamId ? { ...stream, status: 'paused' } : stream
        ),
      }));
    } catch (error) {
      console.error('Error pausing stream:', error);
    }
  }, [pauseStream]);

  const handleStopStream = useCallback(async (streamId: string) => {
    try {
      await stopStream(streamId);
      setStreamState(prev => ({
        ...prev,
        activeStreams: prev.activeStreams.map(stream =>
          stream.id === streamId ? { ...stream, status: 'stopped' } : stream
        ),
      }));
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  }, [stopStream]);

  const handleOptimizeStream = useCallback(async (streamId: string) => {
    try {
      const optimization = await optimizeStreamPerformance({
        streamId,
        objectives: ['latency', 'throughput', 'quality', 'cost'],
        constraints: {
          maxLatency: 100,
          minThroughput: 5000,
          minQuality: 0.9,
        },
      });

      setStreamState(prev => ({
        ...prev,
        optimization: { ...prev.optimization, ...optimization },
        recommendations: [...optimization.recommendations, ...prev.recommendations.slice(0, 9)],
      }));
    } catch (error) {
      console.error('Error optimizing stream:', error);
    }
  }, [optimizeStreamPerformance]);

  // Utility functions
  const getStreamStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'stopped': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'connecting': return 'text-blue-600 bg-blue-100';
      case 'buffering': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getChannelStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      case 'reconnecting': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const formatMetricValue = useCallback((value: number, unit: string) => {
    if (unit === '%') return `${Math.round(value)}%`;
    if (unit === 'ms') return `${Math.round(value)}ms`;
    if (unit === 'msg/sec') return `${Math.round(value)}/sec`;
    if (unit === 'MB/s') return `${Math.round(value * 100) / 100}MB/s`;
    return Math.round(value * 100) / 100;
  }, []);

  const getStreamTypeIcon = useCallback((type: string) => {
    const streamType = STREAM_TYPES.find(t => t.id === type);
    return streamType?.icon || Activity;
  }, []);

  const getStreamTypeColor = useCallback((type: string) => {
    const streamType = STREAM_TYPES.find(t => t.id === type);
    return streamType?.color || '#64748B';
  }, []);

  // Filtered streams
  const filteredStreams = useMemo(() => {
    let filtered = streamState.activeStreams;

    if (filterBy !== 'all') {
      filtered = filtered.filter(stream => {
        switch (filterBy) {
          case 'active': return stream.status === 'active';
          case 'paused': return stream.status === 'paused';
          case 'stopped': return stream.status === 'stopped';
          case 'error': return stream.status === 'error';
          case 'classification': return stream.type === 'classification';
          case 'prediction': return stream.type === 'prediction';
          case 'analysis': return stream.type === 'analysis';
          case 'monitoring': return stream.type === 'monitoring';
          case 'optimization': return stream.type === 'optimization';
          case 'intelligence': return stream.type === 'intelligence';
          default: return true;
        }
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(stream =>
        stream.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort streams
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return (b.performance?.efficiency || 0) - (a.performance?.efficiency || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'throughput':
          return (b.metrics?.throughput || 0) - (a.metrics?.throughput || 0);
        case 'latency':
          return (a.metrics?.latency || Infinity) - (b.metrics?.latency || Infinity);
        default:
          return 0;
      }
    });

    return filtered;
  }, [streamState.activeStreams, filterBy, searchQuery, sortBy]);

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const analytics = streamState.analytics;
    return {
      totalStreams: streamState.activeStreams.length,
      activeStreams: streamState.activeStreams.filter(s => s.status === 'active').length,
      totalThroughput: streamState.activeStreams.reduce((sum, s) => sum + (s.metrics?.throughput || 0), 0),
      averageLatency: streamState.activeStreams.reduce((sum, s) => sum + (s.metrics?.latency || 0), 0) / Math.max(streamState.activeStreams.length, 1),
      overallQuality: analytics.realTimeMetrics?.quality || 0,
      systemHealth: analytics.realTimeMetrics?.health || 0,
    };
  }, [streamState.activeStreams, streamState.analytics]);

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              Real-Time Intelligence Stream
            </h1>
            <p className="text-muted-foreground mt-2">
              Advanced real-time AI streaming with intelligent processing and adaptive optimization
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              <div className={`w-2 h-2 rounded-full ${realTimeMode ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">
                {realTimeMode ? 'Live' : 'Offline'}
              </span>
            </div>
            <Button variant="outline">
              <Monitor className="h-4 w-4 mr-2" />
              Monitor
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Stream
            </Button>
          </div>
        </div>

        {/* Real-time Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {overallMetrics.activeStreams}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                of {overallMetrics.totalStreams} total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Throughput</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatMetricValue(overallMetrics.totalThroughput, 'msg/sec')}
              </div>
              <Progress value={Math.min((overallMetrics.totalThroughput / 50000) * 100, 100)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatMetricValue(overallMetrics.averageLatency, 'ms')}
              </div>
              <Progress value={Math.max(100 - (overallMetrics.averageLatency / 500) * 100, 0)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatMetricValue(overallMetrics.systemHealth, '%')}
              </div>
              <Progress value={overallMetrics.systemHealth * 100} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Real-time Performance
                  </CardTitle>
                  <CardDescription>
                    Live performance metrics across all streams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={streamState.analytics?.realTimeMetrics?.performanceHistory || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="throughput" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="latency" stroke="#EF4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stream Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Stream Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution by type and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={STREAM_TYPES.map(type => ({
                      type: type.name,
                      count: streamState.activeStreams.filter(s => s.type === type.id).length,
                      active: streamState.activeStreams.filter(s => s.type === type.id && s.status === 'active').length,
                      performance: streamState.activeStreams
                        .filter(s => s.type === type.id)
                        .reduce((avg, s) => avg + (s.performance?.efficiency || 0), 0) / 
                        Math.max(streamState.activeStreams.filter(s => s.type === type.id).length, 1) * 100,
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="type" />
                      <PolarRadiusAxis />
                      <Radar name="Count" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Active" dataKey="active" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Radar name="Performance" dataKey="performance" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recent Alerts
                  </CardTitle>
                  <CardDescription>
                    Latest system alerts and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {streamState.alerts.slice(0, 5).map((alert, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <Badge className="bg-red-100 text-red-600">
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Intelligence Insights
                  </CardTitle>
                  <CardDescription>
                    AI-generated insights and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {streamState.insights.slice(0, 5).map((insight, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-blue-500" />
                            <Badge className="bg-blue-100 text-blue-600">
                              {insight.type}
                            </Badge>
                            <Badge className="bg-green-100 text-green-600">
                              {Math.round(insight.confidence * 100)}%
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Streams Tab */}
          <TabsContent value="streams" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search streams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Streams</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="prediction">Prediction</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="optimization">Optimization</SelectItem>
                    <SelectItem value="intelligence">Intelligence</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="throughput">Throughput</SelectItem>
                    <SelectItem value="latency">Latency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Stream
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStreams.map((stream) => {
                const IconComponent = getStreamTypeIcon(stream.type);
                
                return (
                  <Card key={stream.id} className={selectedStream === stream.id ? 'ring-2 ring-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5" style={{ color: getStreamTypeColor(stream.type) }} />
                          {stream.name}
                        </CardTitle>
                        <Badge className={getStreamStatusColor(stream.status)}>
                          {stream.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {STREAM_TYPES.find(t => t.id === stream.type)?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium capitalize">{stream.type}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Throughput</div>
                          <div className="font-medium">{formatMetricValue(stream.metrics?.throughput || 0, 'msg/sec')}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Latency</div>
                          <div className="font-medium">{formatMetricValue(stream.metrics?.latency || 0, 'ms')}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Quality</div>
                          <div className="font-medium">{formatMetricValue((stream.quality?.accuracy || 0) * 100, '%')}</div>
                        </div>
                      </div>
                      
                      {stream.performance && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Performance</span>
                            <span className="font-medium">{Math.round(stream.performance.efficiency * 100)}%</span>
                          </div>
                          <Progress value={stream.performance.efficiency * 100} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {stream.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => handlePauseStream(stream.id)} className="flex-1">
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                        )}
                        {(stream.status === 'paused' || stream.status === 'stopped') && (
                          <Button size="sm" onClick={() => handleStartStream(stream.id)} className="flex-1">
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {stream.status !== 'stopped' && (
                          <Button size="sm" variant="outline" onClick={() => handleStopStream(stream.id)}>
                            <Stop className="h-3 w-3 mr-1" />
                            Stop
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleOptimizeStream(stream.id)}>
                          <Zap className="h-3 w-3 mr-1" />
                          Optimize
                        </Button>
                        <Button size="sm" variant="ghost" className="px-2">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {streamState.dataChannels.map((channel) => (
                <Card key={channel.id} className={selectedChannel === channel.id ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        {channel.name}
                      </CardTitle>
                      <Badge className={getChannelStatusColor(channel.status)}>
                        {channel.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {channel.type} • {channel.protocol}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Latency</div>
                        <div className="font-medium">{formatMetricValue(channel.latency, 'ms')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Throughput</div>
                        <div className="font-medium">{formatMetricValue(channel.throughput, 'MB/s')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Reliability</div>
                        <div className="font-medium">{formatMetricValue(channel.reliability * 100, '%')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Protocol</div>
                        <div className="font-medium uppercase">{channel.protocol}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Connection Quality</span>
                        <span className="font-medium">{Math.round(channel.reliability * 100)}%</span>
                      </div>
                      <Progress value={channel.reliability * 100} className="h-2" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                      <Button size="sm" variant="ghost" className="px-2">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Processing Tab */}
          <TabsContent value="processing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Processing Algorithms
                  </CardTitle>
                  <CardDescription>
                    Available stream processing algorithms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {PROCESSOR_ALGORITHMS.map((algorithm) => (
                      <div key={algorithm.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{algorithm.name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className="text-green-600 bg-green-100">
                              {Math.round(algorithm.performance * 100)}%
                            </Badge>
                            <Badge variant="outline">{algorithm.type}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <div className="text-muted-foreground">Complexity</div>
                            <div className="font-medium capitalize">{algorithm.complexity}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Latency</div>
                            <div className="font-medium capitalize">{algorithm.latency}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Accuracy</div>
                            <div className="font-medium">{Math.round(algorithm.accuracy * 100)}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Processing Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure stream processing parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="real-time-mode">Real-time Mode</Label>
                      <Switch
                        id="real-time-mode"
                        checked={realTimeMode}
                        onCheckedChange={setRealTimeMode}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="intelligent-filtering">Intelligent Filtering</Label>
                      <Switch
                        id="intelligent-filtering"
                        checked={intelligentFiltering}
                        onCheckedChange={setIntelligentFiltering}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="adaptive-processing">Adaptive Processing</Label>
                      <Switch
                        id="adaptive-processing"
                        checked={adaptiveProcessing}
                        onCheckedChange={setAdaptiveProcessing}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="anomaly-detection">Anomaly Detection</Label>
                      <Switch
                        id="anomaly-detection"
                        checked={anomalyDetection}
                        onCheckedChange={setAnomalyDetection}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="predictive-analytics">Predictive Analytics</Label>
                      <Switch
                        id="predictive-analytics"
                        checked={predictiveAnalytics}
                        onCheckedChange={setPredictiveAnalytics}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Buffer Size</Label>
                      <Slider
                        value={[bufferSize]}
                        onValueChange={(value) => setBufferSize(value[0])}
                        max={10000}
                        min={100}
                        step={100}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {bufferSize} messages
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Batch Size</Label>
                      <Slider
                        value={[batchSize]}
                        onValueChange={(value) => setBatchSize(value[0])}
                        max={1000}
                        min={10}
                        step={10}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {batchSize} messages per batch
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Processing Interval (ms)</Label>
                      <Slider
                        value={[processingInterval]}
                        onValueChange={(value) => setProcessingInterval(value[0])}
                        max={1000}
                        min={10}
                        step={10}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground">
                        {processingInterval}ms
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Quality Metrics
                  </CardTitle>
                  <CardDescription>
                    Real-time quality assessment across all streams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {QUALITY_METRICS.map((metric) => {
                      const currentValue = streamState.analytics?.realTimeMetrics?.qualityMetrics?.[metric.id] || Math.random() * metric.target * 1.2;
                      const isGood = currentValue >= metric.target;
                      const isCritical = currentValue < metric.threshold;
                      
                      return (
                        <div key={metric.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <Badge className={
                              isCritical ? 'bg-red-100 text-red-600' :
                              isGood ? 'bg-green-100 text-green-600' :
                              'bg-yellow-100 text-yellow-600'
                            }>
                              {formatMetricValue(currentValue, metric.unit)}
                            </Badge>
                          </div>
                          <Progress 
                            value={Math.min((currentValue / (metric.target * 1.2)) * 100, 100)} 
                            className="h-2" 
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Target: {formatMetricValue(metric.target, metric.unit)}</span>
                            <span>Threshold: {formatMetricValue(metric.threshold, metric.unit)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed performance metrics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={streamState.analytics?.performanceTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="throughput" fill="#3B82F6" />
                      <Line type="monotone" dataKey="latency" stroke="#EF4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="quality" stroke="#10B981" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Patterns and Anomalies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Detected Patterns
                  </CardTitle>
                  <CardDescription>
                    AI-detected patterns in stream data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {streamState.patterns.slice(0, 5).map((pattern, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <Badge className="bg-blue-100 text-blue-600">
                              {pattern.type}
                            </Badge>
                            <Badge className="bg-green-100 text-green-600">
                              {Math.round(pattern.confidence * 100)}%
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{pattern.name}</h4>
                          <p className="text-xs text-muted-foreground">{pattern.description}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            Detected: {new Date(pattern.detectedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Anomalies
                  </CardTitle>
                  <CardDescription>
                    Detected anomalies and outliers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {streamState.anomalies.slice(0, 5).map((anomaly, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <Badge className="bg-red-100 text-red-600">
                              {anomaly.severity}
                            </Badge>
                            <Badge className="bg-orange-100 text-orange-600">
                              {Math.round(anomaly.score * 100)}%
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{anomaly.type}</h4>
                          <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            Detected: {new Date(anomaly.detectedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Predictive Analytics
                  </CardTitle>
                  <CardDescription>
                    AI-powered predictions and forecasts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {streamState.predictions.slice(0, 5).map((prediction, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-500" />
                            <Badge className="bg-purple-100 text-purple-600">
                              {prediction.type}
                            </Badge>
                            <Badge className="bg-green-100 text-green-600">
                              {Math.round(prediction.confidence * 100)}%
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{prediction.title}</h4>
                          <p className="text-xs text-muted-foreground">{prediction.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                            <span>Horizon: {prediction.timeHorizon}</span>
                            <span>Generated: {new Date(prediction.generatedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Intelligent Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-generated optimization recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {streamState.recommendations.slice(0, 5).map((recommendation, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                              <Badge className={
                                recommendation.priority === 'high' ? 'bg-red-100 text-red-600' :
                                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                              }>
                                {recommendation.priority} priority
                              </Badge>
                            </div>
                            <Badge variant="outline">{recommendation.category}</Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                          <p className="text-xs text-muted-foreground">{recommendation.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="sm" variant="outline" className="h-6 text-xs">
                              Apply
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 text-xs">
                              Learn More
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default RealTimeIntelligenceStream;