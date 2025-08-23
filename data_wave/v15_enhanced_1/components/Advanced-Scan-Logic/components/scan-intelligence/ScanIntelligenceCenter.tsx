/**
 * 🧠 Scan Intelligence Center - Advanced Scan Logic
 * =================================================
 * 
 * Enterprise-grade AI/ML-powered intelligence center for advanced data governance
 * with comprehensive pattern recognition, anomaly detection, and predictive analytics.
 * 
 * Features:
 * - Advanced AI/ML pattern recognition and analysis
 * - Real-time anomaly detection and classification
 * - Predictive analytics and forecasting models
 * - Intelligent threat detection and security analysis
 * - Behavioral profiling and contextual intelligence
 * - Advanced data insights and recommendations
 * - Machine learning model management and training
 * - Comprehensive intelligence reporting and visualization
 * 
 * @author Enterprise Data Governance Team
 * @version 1.0.0 - Production Ready
 * @component ScanIntelligenceCenter
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertTriangle, Eye, Target, Activity, BarChart3, PieChart, LineChart, Settings, RefreshCw, Filter, Search, Download, Upload, Play, Pause, Square, CheckCircle, XCircle, Clock, Database, Server, Network, Cpu, HardDrive, Shield, Lock, Unlock, Key, FileText, Image, Video, Music, Code, Globe, Mail, Phone, User, Users, MapPin, Calendar, Star, Bookmark, Tag, Hash, Layers, GitBranch, MoreHorizontal, Plus, Edit, Trash2, Copy, ExternalLink, Maximize2, Minimize2, Grid, List, Bell, BellOff, Info, Warning, AlertCircle, CheckCircle2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Advanced Scan Logic Imports
import { ScanIntelligenceAPIService } from '../../services/scan-intelligence-apis';
import { IntelligentScanningAPIService } from '../../services/intelligent-scanning-apis';
import { ScanAnalyticsAPIService } from '../../services/scan-analytics-apis';

// Types
import {
  ScanIntelligenceInsight,
  PatternRecognitionResult,
  AnomalyDetectionResult,
  PredictiveModel,
  BehavioralAnalysis,
  ThreatDetection,
  ContextualIntelligence,
  IntelligenceReport,
  IntelligenceAnalysisRequest,
  IntelligenceAnalysisResponse,
  IntelligenceMetrics,
  IntelligenceConfiguration,
  IntelligenceInsightType,
  IntelligenceCategory,
  IntelligenceSeverity
} from '../../types/intelligence.types';

// Constants
import { SCAN_LOGIC_UI, THEMES, ANIMATIONS } from '../../constants/ui-constants';

// Utilities
import { intelligenceProcessor } from '../../utils/intelligence-processor';
import { monitoringAggregator } from '../../utils/monitoring-aggregator';
import { analyticsProcessor } from '../../utils/analytics-processor';

// ========================================================================================
// INTERFACES AND TYPES
// ========================================================================================

interface IntelligenceConfig {
  aiModelsEnabled: boolean;
  patternRecognitionLevel: 'basic' | 'advanced' | 'expert';
  anomalyDetectionSensitivity: number;
  predictiveAnalyticsEnabled: boolean;
  behavioralProfilingEnabled: boolean;
  threatDetectionEnabled: boolean;
  contextualAnalysisEnabled: boolean;
  autoLearningEnabled: boolean;
  confidenceThreshold: number;
  realTimeProcessing: boolean;
}

interface IntelligenceMetricsData {
  totalInsights: number;
  activeModels: number;
  patternsDetected: number;
  anomaliesFound: number;
  threatsIdentified: number;
  accuracyScore: number;
  processingSpeed: number;
  confidenceLevel: number;
}

interface PatternData {
  id: string;
  type: string;
  category: string;
  confidence: number;
  frequency: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  firstDetected: Date;
  lastSeen: Date;
  occurrences: number;
  relatedPatterns: string[];
}

interface AnomalyData {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  detectedAt: Date;
  source: string;
  impact: string;
  recommendation: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
}

interface ThreatData {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  detectedAt: Date;
  source: string;
  indicators: string[];
  mitigation: string;
  status: 'active' | 'mitigated' | 'monitoring' | 'resolved';
}

interface MLModelData {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'nlp';
  status: 'training' | 'ready' | 'deployed' | 'updating' | 'error';
  accuracy: number;
  lastTrained: Date;
  version: string;
  features: number;
  predictions: number;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

interface IntelligenceAlert {
  id: string;
  type: 'pattern' | 'anomaly' | 'threat' | 'model' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
  data?: any;
}

// ========================================================================================
// MAIN COMPONENT
// ========================================================================================

export const ScanIntelligenceCenter: React.FC = () => {
  // ========================================================================================
  // STATE MANAGEMENT
  // ========================================================================================

  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intelligence configuration
  const [config, setConfig] = useState<IntelligenceConfig>({
    aiModelsEnabled: true,
    patternRecognitionLevel: 'advanced',
    anomalyDetectionSensitivity: 0.8,
    predictiveAnalyticsEnabled: true,
    behavioralProfilingEnabled: true,
    threatDetectionEnabled: true,
    contextualAnalysisEnabled: true,
    autoLearningEnabled: true,
    confidenceThreshold: 0.7,
    realTimeProcessing: true
  });

  // Intelligence data
  const [insights, setInsights] = useState<ScanIntelligenceInsight[]>([]);
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [mlModels, setMlModels] = useState<MLModelData[]>([]);

  // Metrics and analytics
  const [metrics, setMetrics] = useState<IntelligenceMetricsData>({
    totalInsights: 0,
    activeModels: 0,
    patternsDetected: 0,
    anomaliesFound: 0,
    threatsIdentified: 0,
    accuracyScore: 0,
    processingSpeed: 0,
    confidenceLevel: 0
  });

  // UI state
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedInsight, setSelectedInsight] = useState<ScanIntelligenceInsight | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PatternData | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyData | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);
  const [selectedModel, setSelectedModel] = useState<MLModelData | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);

  // Filtering and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

  // Real-time processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<number>(0);

  // ========================================================================================
  // SERVICE INSTANCES
  // ========================================================================================

  const intelligenceService = useMemo(() => new ScanIntelligenceAPIService(), []);
  const intelligentScanService = useMemo(() => new IntelligentScanningAPIService(), []);
  const analyticsService = useMemo(() => new ScanAnalyticsAPIService(), []);

  // ========================================================================================
  // REFS AND INTERVALS
  // ========================================================================================

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================================================================
  // DATA FETCHING AND MANAGEMENT
  // ========================================================================================

  const fetchIntelligenceData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch intelligence insights
      const insightsResponse = await intelligenceService.performIntelligenceAnalysis({
        analysisType: 'comprehensive',
        timeRange,
        confidenceThreshold: config.confidenceThreshold,
        categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
        includePredictions: config.predictiveAnalyticsEnabled,
        includeBehavioral: config.behavioralProfilingEnabled,
        includeThreats: config.threatDetectionEnabled
      });

      setInsights(insightsResponse.insights || []);

      // Fetch pattern recognition results
      const patternsResponse = await intelligenceService.detectPatterns({
        level: config.patternRecognitionLevel,
        timeRange,
        minConfidence: config.confidenceThreshold
      });

      setPatterns(patternsResponse.patterns?.map(p => ({
        id: p.id,
        type: p.type,
        category: p.category,
        confidence: p.confidence,
        frequency: p.frequency,
        impact: p.impact as 'low' | 'medium' | 'high' | 'critical',
        description: p.description,
        firstDetected: new Date(p.firstDetected),
        lastSeen: new Date(p.lastSeen),
        occurrences: p.occurrences,
        relatedPatterns: p.relatedPatterns || []
      })) || []);

      // Fetch anomaly detection results
      const anomaliesResponse = await intelligenceService.detectAnomalies({
        sensitivity: config.anomalyDetectionSensitivity,
        timeRange,
        includeContext: config.contextualAnalysisEnabled
      });

      setAnomalies(anomaliesResponse.anomalies?.map(a => ({
        id: a.id,
        type: a.type,
        severity: a.severity as 'low' | 'medium' | 'high' | 'critical',
        confidence: a.confidence,
        description: a.description,
        detectedAt: new Date(a.detectedAt),
        source: a.source,
        impact: a.impact,
        recommendation: a.recommendation,
        status: a.status as 'new' | 'investigating' | 'resolved' | 'false_positive'
      })) || []);

      // Fetch threat detection results
      if (config.threatDetectionEnabled) {
        const threatsResponse = await intelligenceService.detectThreats({
          timeRange,
          includeIndicators: true,
          includeMitigation: true
        });

        setThreats(threatsResponse.threats?.map(t => ({
          id: t.id,
          type: t.type,
          severity: t.severity as 'low' | 'medium' | 'high' | 'critical',
          confidence: t.confidence,
          description: t.description,
          detectedAt: new Date(t.detectedAt),
          source: t.source,
          indicators: t.indicators || [],
          mitigation: t.mitigation,
          status: t.status as 'active' | 'mitigated' | 'monitoring' | 'resolved'
        })) || []);
      }

      // Fetch ML models status
      const modelsResponse = await intelligenceService.getIntelligenceModels();
      setMlModels(modelsResponse.models?.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type as 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'nlp',
        status: m.status as 'training' | 'ready' | 'deployed' | 'updating' | 'error',
        accuracy: m.accuracy,
        lastTrained: new Date(m.lastTrained),
        version: m.version,
        features: m.features,
        predictions: m.predictions,
        performance: {
          precision: m.performance?.precision || 0,
          recall: m.performance?.recall || 0,
          f1Score: m.performance?.f1Score || 0
        }
      })) || []);

      // Calculate metrics
      setMetrics({
        totalInsights: insightsResponse.insights?.length || 0,
        activeModels: modelsResponse.models?.filter(m => m.status === 'deployed').length || 0,
        patternsDetected: patternsResponse.patterns?.length || 0,
        anomaliesFound: anomaliesResponse.anomalies?.length || 0,
        threatsIdentified: threatsResponse?.threats?.length || 0,
        accuracyScore: modelsResponse.models?.reduce((acc, m) => acc + m.accuracy, 0) / (modelsResponse.models?.length || 1),
        processingSpeed: insightsResponse.processingTime || 0,
        confidenceLevel: insightsResponse.averageConfidence || 0
      });

      setError(null);
    } catch (err) {
      console.error('Failed to fetch intelligence data:', err);
      setError('Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  }, [intelligenceService, config, timeRange, selectedCategory]);

  const processRealTimeIntelligence = useCallback(async () => {
    if (!config.realTimeProcessing || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Simulate real-time intelligence processing
      const processingResult = await intelligenceProcessor.processRealTimeData({
        enablePatternRecognition: config.patternRecognitionLevel !== 'basic',
        enableAnomalyDetection: true,
        enableThreatDetection: config.threatDetectionEnabled,
        confidenceThreshold: config.confidenceThreshold
      });

      // Update processing queue
      setProcessingQueue(processingResult.queueSize || 0);

      // Add new alerts if any critical findings
      if (processingResult.criticalFindings?.length > 0) {
        const newAlerts = processingResult.criticalFindings.map(finding => ({
          id: `alert-${Date.now()}-${Math.random()}`,
          type: finding.type as 'pattern' | 'anomaly' | 'threat' | 'model' | 'system',
          severity: finding.severity as 'info' | 'warning' | 'error' | 'critical',
          title: finding.title,
          message: finding.message,
          timestamp: new Date(),
          acknowledged: false,
          source: 'real-time-processor',
          data: finding.data
        }));

        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50 alerts
      }

    } catch (err) {
      console.error('Real-time processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [config, isProcessing]);

  // ========================================================================================
  // INTELLIGENCE OPERATIONS
  // ========================================================================================

  const trainModel = useCallback(async (modelId: string) => {
    try {
      setLoading(true);
      await intelligenceService.trainIntelligenceModels({
        modelIds: [modelId],
        trainingData: 'latest',
        autoValidate: true
      });

      // Refresh data
      await fetchIntelligenceData();

      // Add success alert
      setAlerts(prev => [...prev, {
        id: `alert-${Date.now()}`,
        type: 'model',
        severity: 'info',
        title: 'Model Training Started',
        message: `Training initiated for model ${modelId}`,
        timestamp: new Date(),
        acknowledged: false,
        source: 'intelligence-center'
      }]);

    } catch (err) {
      console.error('Failed to train model:', err);
      setError('Failed to start model training');
    } finally {
      setLoading(false);
    }
  }, [intelligenceService, fetchIntelligenceData]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const updateAnomalyStatus = useCallback(async (anomalyId: string, status: string) => {
    try {
      setAnomalies(prev => prev.map(anomaly => 
        anomaly.id === anomalyId 
          ? { ...anomaly, status: status as 'new' | 'investigating' | 'resolved' | 'false_positive' }
          : anomaly
      ));

      // Add alert
      setAlerts(prev => [...prev, {
        id: `alert-${Date.now()}`,
        type: 'anomaly',
        severity: 'info',
        title: 'Anomaly Status Updated',
        message: `Anomaly ${anomalyId} status changed to ${status}`,
        timestamp: new Date(),
        acknowledged: false,
        source: 'intelligence-center'
      }]);

    } catch (err) {
      console.error('Failed to update anomaly status:', err);
    }
  }, []);

  const updateThreatStatus = useCallback(async (threatId: string, status: string) => {
    try {
      setThreats(prev => prev.map(threat => 
        threat.id === threatId 
          ? { ...threat, status: status as 'active' | 'mitigated' | 'monitoring' | 'resolved' }
          : threat
      ));

      // Add alert
      setAlerts(prev => [...prev, {
        id: `alert-${Date.now()}`,
        type: 'threat',
        severity: 'info',
        title: 'Threat Status Updated',
        message: `Threat ${threatId} status changed to ${status}`,
        timestamp: new Date(),
        acknowledged: false,
        source: 'intelligence-center'
      }]);

    } catch (err) {
      console.error('Failed to update threat status:', err);
    }
  }, []);

  // ========================================================================================
  // FILTERING AND SEARCH
  // ========================================================================================

  const filteredInsights = useMemo(() => {
    let filtered = insights;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(insight => 
        insight.title?.toLowerCase().includes(query) ||
        insight.description?.toLowerCase().includes(query) ||
        insight.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(insight => insight.category === selectedCategory);
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(insight => insight.severity === selectedSeverity);
    }

    return filtered;
  }, [insights, searchQuery, selectedCategory, selectedSeverity]);

  const filteredPatterns = useMemo(() => {
    let filtered = patterns;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pattern => 
        pattern.type.toLowerCase().includes(query) ||
        pattern.description.toLowerCase().includes(query) ||
        pattern.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [patterns, searchQuery]);

  const filteredAnomalies = useMemo(() => {
    let filtered = anomalies;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(anomaly => 
        anomaly.type.toLowerCase().includes(query) ||
        anomaly.description.toLowerCase().includes(query) ||
        anomaly.source.toLowerCase().includes(query)
      );
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.severity === selectedSeverity);
    }

    return filtered;
  }, [anomalies, searchQuery, selectedSeverity]);

  const filteredThreats = useMemo(() => {
    let filtered = threats;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(threat => 
        threat.type.toLowerCase().includes(query) ||
        threat.description.toLowerCase().includes(query) ||
        threat.source.toLowerCase().includes(query)
      );
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(threat => threat.severity === selectedSeverity);
    }

    return filtered;
  }, [threats, searchQuery, selectedSeverity]);

  // ========================================================================================
  // UTILITY FUNCTIONS
  // ========================================================================================

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'deployed':
      case 'ready':
      case 'resolved':
      case 'mitigated': return 'text-green-600 bg-green-100';
      case 'training':
      case 'investigating':
      case 'monitoring': return 'text-blue-600 bg-blue-100';
      case 'error':
      case 'active':
      case 'new': return 'text-red-600 bg-red-100';
      case 'updating':
      case 'false_positive': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-blue-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  // ========================================================================================
  // EFFECTS
  // ========================================================================================

  useEffect(() => {
    // Initial data fetch
    fetchIntelligenceData();
  }, [fetchIntelligenceData]);

  useEffect(() => {
    // Setup real-time processing
    if (config.realTimeProcessing) {
      processingIntervalRef.current = setInterval(processRealTimeIntelligence, 5000);
    }

    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, [config.realTimeProcessing, processRealTimeIntelligence]);

  useEffect(() => {
    // Setup auto-refresh
    refreshIntervalRef.current = setInterval(fetchIntelligenceData, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchIntelligenceData]);

  // ========================================================================================
  // RENDER HELPERS
  // ========================================================================================

  const renderMetricsCard = (title: string, value: string | number, icon: React.ReactNode, trend?: 'up' | 'down' | 'stable') => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="flex items-center space-x-2">
            {trend && (
              <div className={`p-1 rounded-full ${
                trend === 'up' ? 'bg-green-100 text-green-600' :
                trend === 'down' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                 trend === 'down' ? <TrendingUp className="h-4 w-4 rotate-180" /> :
                 <Activity className="h-4 w-4" />}
              </div>
            )}
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderInsightCard = (insight: ScanIntelligenceInsight) => (
    <motion.div
      key={insight.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedInsight(insight)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold">{insight.title}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getSeverityColor(insight.severity || 'medium')}>
                {insight.severity}
              </Badge>
              <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence || 0)}`}>
                {Math.round((insight.confidence || 0) * 100)}%
              </span>
            </div>
          </div>
          <CardDescription className="text-sm text-gray-600">
            {insight.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Category:</span>
              <Badge variant="outline">{insight.category}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Type:</span>
              <span>{insight.type}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Generated:</span>
              <span>{formatTimestamp(new Date(insight.timestamp))}</span>
            </div>
            {insight.recommendations && insight.recommendations.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-1">Recommendations:</p>
                <ul className="text-sm space-y-1">
                  {insight.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-1">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPatternCard = (pattern: PatternData) => (
    <Card key={pattern.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPattern(pattern)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold">{pattern.type}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getSeverityColor(pattern.impact)}>
              {pattern.impact}
            </Badge>
            <span className={`text-sm font-medium ${getConfidenceColor(pattern.confidence)}`}>
              {Math.round(pattern.confidence * 100)}%
            </span>
          </div>
        </div>
        <CardDescription className="text-sm text-gray-600">
          {pattern.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Category:</span>
            <Badge variant="outline">{pattern.category}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Frequency:</span>
            <span>{pattern.frequency}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Occurrences:</span>
            <span>{pattern.occurrences}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">First Detected:</span>
            <span>{formatTimestamp(pattern.firstDetected)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Last Seen:</span>
            <span>{formatTimestamp(pattern.lastSeen)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnomalyCard = (anomaly: AnomalyData) => (
    <Card key={anomaly.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedAnomaly(anomaly)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg font-semibold">{anomaly.type}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getSeverityColor(anomaly.severity)}>
              {anomaly.severity}
            </Badge>
            <Badge className={getStatusColor(anomaly.status)}>
              {anomaly.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm text-gray-600">
          {anomaly.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Confidence:</span>
            <span className={getConfidenceColor(anomaly.confidence)}>
              {Math.round(anomaly.confidence * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Source:</span>
            <span>{anomaly.source}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Detected:</span>
            <span>{formatTimestamp(anomaly.detectedAt)}</span>
          </div>
          {anomaly.recommendation && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-1">Recommendation:</p>
              <p className="text-sm text-gray-700">{anomaly.recommendation}</p>
            </div>
          )}
          <div className="flex space-x-2 mt-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                updateAnomalyStatus(anomaly.id, 'investigating');
              }}
            >
              Investigate
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                updateAnomalyStatus(anomaly.id, 'resolved');
              }}
            >
              Resolve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderThreatCard = (threat: ThreatData) => (
    <Card key={threat.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedThreat(threat)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg font-semibold">{threat.type}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getSeverityColor(threat.severity)}>
              {threat.severity}
            </Badge>
            <Badge className={getStatusColor(threat.status)}>
              {threat.status}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm text-gray-600">
          {threat.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Confidence:</span>
            <span className={getConfidenceColor(threat.confidence)}>
              {Math.round(threat.confidence * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Source:</span>
            <span>{threat.source}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Detected:</span>
            <span>{formatTimestamp(threat.detectedAt)}</span>
          </div>
          {threat.indicators.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-1">Indicators:</p>
              <div className="flex flex-wrap gap-1">
                {threat.indicators.slice(0, 3).map((indicator, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {indicator}
                  </Badge>
                ))}
                {threat.indicators.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{threat.indicators.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          <div className="flex space-x-2 mt-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                updateThreatStatus(threat.id, 'monitoring');
              }}
            >
              Monitor
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                updateThreatStatus(threat.id, 'mitigated');
              }}
            >
              Mitigate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderModelCard = (model: MLModelData) => (
    <Card key={model.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedModel(model)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg font-semibold">{model.name}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(model.status)}>
              {model.status}
            </Badge>
            <span className="text-sm font-medium text-green-600">
              {Math.round(model.accuracy * 100)}%
            </span>
          </div>
        </div>
        <CardDescription className="text-sm text-gray-600">
          {model.type.replace('_', ' ').toUpperCase()} Model v{model.version}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Features:</span>
            <span>{model.features}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Predictions:</span>
            <span>{model.predictions.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Last Trained:</span>
            <span>{formatTimestamp(model.lastTrained)}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Precision:</span>
              <span>{Math.round(model.performance.precision * 100)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Recall:</span>
              <span>{Math.round(model.performance.recall * 100)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">F1 Score:</span>
              <span>{Math.round(model.performance.f1Score * 100)}%</span>
            </div>
          </div>
          <div className="flex space-x-2 mt-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                trainModel(model.id);
              }}
              disabled={model.status === 'training'}
            >
              {model.status === 'training' ? 'Training...' : 'Retrain'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ========================================================================================
  // MAIN RENDER
  // ========================================================================================

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Scan Intelligence Center
                  </h1>
                  <p className="text-sm text-gray-600">
                    AI-powered intelligence and analytics platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Real-time Processing Status */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  isProcessing ? 'bg-green-500 animate-pulse' : 
                  config.realTimeProcessing ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-gray-600">
                  {isProcessing ? 'Processing...' : 
                   config.realTimeProcessing ? 'Real-time Active' : 'Offline'}
                </span>
                {processingQueue > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {processingQueue} queued
                  </Badge>
                )}
              </div>

              {/* Alerts */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {alerts.filter(a => !a.acknowledged).length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                        {alerts.filter(a => !a.acknowledged).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Intelligence Alerts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-64">
                    {alerts.slice(0, 10).map(alert => (
                      <div key={alert.id} className="p-3 border-b">
                        <div className="flex items-start space-x-2">
                          <div className={`mt-1 w-2 h-2 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'error' ? 'bg-red-400' :
                            alert.severity === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {alert.timestamp.toLocaleTimeString()}
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => dismissAlert(alert.id)}
                              >
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchIntelligenceData}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh Intelligence Data</TooltipContent>
              </Tooltip>

              {/* Configuration */}
              <Sheet open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Intelligence Configuration</SheetTitle>
                    <SheetDescription>
                      Configure AI models and intelligence processing settings
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>AI Models</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={config.aiModelsEnabled}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, aiModelsEnabled: checked }))
                          }
                        />
                        <span className="text-sm text-gray-600">
                          {config.aiModelsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Pattern Recognition Level</Label>
                      <Select
                        value={config.patternRecognitionLevel}
                        onValueChange={(value: 'basic' | 'advanced' | 'expert') =>
                          setConfig(prev => ({ ...prev, patternRecognitionLevel: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Anomaly Detection Sensitivity</Label>
                      <Slider
                        value={[config.anomalyDetectionSensitivity]}
                        onValueChange={(value) =>
                          setConfig(prev => ({ ...prev, anomalyDetectionSensitivity: value[0] }))
                        }
                        min={0.1}
                        max={1.0}
                        step={0.1}
                      />
                      <div className="text-sm text-gray-600">
                        {config.anomalyDetectionSensitivity.toFixed(1)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Confidence Threshold</Label>
                      <Slider
                        value={[config.confidenceThreshold]}
                        onValueChange={(value) =>
                          setConfig(prev => ({ ...prev, confidenceThreshold: value[0] }))
                        }
                        min={0.1}
                        max={1.0}
                        step={0.1}
                      />
                      <div className="text-sm text-gray-600">
                        {config.confidenceThreshold.toFixed(1)}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Predictive Analytics</Label>
                        <Switch
                          checked={config.predictiveAnalyticsEnabled}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, predictiveAnalyticsEnabled: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Behavioral Profiling</Label>
                        <Switch
                          checked={config.behavioralProfilingEnabled}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, behavioralProfilingEnabled: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Threat Detection</Label>
                        <Switch
                          checked={config.threatDetectionEnabled}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, threatDetectionEnabled: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Contextual Analysis</Label>
                        <Switch
                          checked={config.contextualAnalysisEnabled}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, contextualAnalysisEnabled: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Auto Learning</Label>
                        <Switch
                          checked={config.autoLearningEnabled}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, autoLearningEnabled: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>Real-time Processing</Label>
                        <Switch
                          checked={config.realTimeProcessing}
                          onCheckedChange={(checked) =>
                            setConfig(prev => ({ ...prev, realTimeProcessing: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Fullscreen Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Fullscreen</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="threats">Threats</TabsTrigger>
              <TabsTrigger value="models">ML Models</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderMetricsCard(
                  'Total Insights',
                  metrics.totalInsights,
                  <Brain className="h-5 w-5" />,
                  'up'
                )}
                {renderMetricsCard(
                  'Active Models',
                  metrics.activeModels,
                  <Zap className="h-5 w-5" />,
                  'stable'
                )}
                {renderMetricsCard(
                  'Patterns Detected',
                  metrics.patternsDetected,
                  <Target className="h-5 w-5" />,
                  'up'
                )}
                {renderMetricsCard(
                  'Anomalies Found',
                  metrics.anomaliesFound,
                  <AlertTriangle className="h-5 w-5" />,
                  metrics.anomaliesFound > 10 ? 'up' : 'stable'
                )}
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderMetricsCard(
                  'Threats Identified',
                  metrics.threatsIdentified,
                  <Shield className="h-5 w-5" />,
                  metrics.threatsIdentified > 0 ? 'up' : 'stable'
                )}
                {renderMetricsCard(
                  'Accuracy Score',
                  `${Math.round(metrics.accuracyScore * 100)}%`,
                  <CheckCircle className="h-5 w-5" />,
                  metrics.accuracyScore > 0.9 ? 'up' : metrics.accuracyScore > 0.7 ? 'stable' : 'down'
                )}
                {renderMetricsCard(
                  'Processing Speed',
                  `${metrics.processingSpeed}ms`,
                  <Activity className="h-5 w-5" />,
                  metrics.processingSpeed < 1000 ? 'up' : 'down'
                )}
                {renderMetricsCard(
                  'Confidence Level',
                  `${Math.round(metrics.confidenceLevel * 100)}%`,
                  <TrendingUp className="h-5 w-5" />,
                  metrics.confidenceLevel > 0.8 ? 'up' : 'stable'
                )}
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Recent Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredInsights.slice(0, 5).map(insight => (
                        <div key={insight.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">{insight.title}</p>
                              <p className="text-xs text-gray-600">{insight.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getSeverityColor(insight.severity || 'medium')}>
                              {insight.severity}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatTimestamp(new Date(insight.timestamp))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Critical Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.filter(a => a.severity === 'critical' || a.severity === 'error').slice(0, 5).map(alert => (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <div>
                              <p className="text-sm font-medium">{alert.title}</p>
                              <p className="text-xs text-gray-600">{alert.message}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-1">
                              {formatTimestamp(alert.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Intelligence Insights</h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search insights..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="quality">Quality</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights Grid */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {filteredInsights.map(renderInsightCard)}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Patterns Tab */}
            <TabsContent value="patterns" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredPatterns.map(renderPatternCard)}
              </div>
            </TabsContent>

            {/* Anomalies Tab */}
            <TabsContent value="anomalies" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredAnomalies.map(renderAnomalyCard)}
              </div>
            </TabsContent>

            {/* Threats Tab */}
            <TabsContent value="threats" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredThreats.map(renderThreatCard)}
              </div>
            </TabsContent>

            {/* ML Models Tab */}
            <TabsContent value="models" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {mlModels.map(renderModelCard)}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="fixed bottom-4 right-4 z-50">
            <Alert className="w-96 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-red-600 hover:text-red-800"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ScanIntelligenceCenter;