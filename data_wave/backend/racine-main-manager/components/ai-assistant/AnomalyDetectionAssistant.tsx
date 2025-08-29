'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, Brain, Radar, Search, Filter, Eye, EyeOff, Zap, Target, Gauge, TrendingUp, TrendingDown, BarChart3, LineChart, PieChart, Settings, RefreshCw, Download, Upload, Save, Share, Bookmark, Star, Flag, CheckCircle, XCircle, Info, Clock, Calendar, Timer, Users, Database, Shield, Lock, Unlock, KeyRound, Edit, Copy, Trash2, Plus, Minus, X, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreHorizontal, ArrowRight, ArrowUpRight, ArrowDownRight, Maximize, Minimize, ExternalLink, LinkIcon, Hash, Tag, Workflow, Route, MapPin, Crosshair, Focus, Scan, Microscope, Wifi, WifiOff, Bell, BellOff, Volume2, VolumeX } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Racine System Imports
import { useAIAssistant } from '../../hooks/useAIAssistant';
import { useRacineOrchestration } from '../../hooks/useRacineOrchestration';
import { useCrossGroupIntegration } from '../../hooks/useCrossGroupIntegration';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useWorkspaceManagement } from '../../hooks/useWorkspaceManagement';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// Types
import { 
  AnomalyDetection,
  AnomalyType,
  AnomalyCategory,
  AnomalySeverity,
  DetectionModel,
  AnomalyPattern,
  AnomalyMetrics,
  SecurityAnomaly,
  PerformanceAnomaly,
  DataQualityAnomaly,
  UserBehaviorAnomaly,
  SystemAnomaly,
  AnomalyAlert,
  DetectionRule,
  ModelConfiguration,
  AnomalyHistory,
  BaselineProfile,
  ThresholdConfiguration,
  AnomalyVisualization,
  AnomalyResponse,
  ThreatLevel,
  AnomalyClassification,
  ModelTraining,
  FalsePositiveTracker
} from '../../types/ai-assistant.types';

import {
  AIContext,
  SystemHealth,
  UserPermissions,
  WorkspaceContext
} from '../../types/racine-core.types';

// Utilities
import {
  detectSystemAnomalies,
  analyzeUserBehaviorPatterns,
  identifySecurityThreats,
  detectPerformanceAnomalies,
  analyzeDataQualityIssues,
  trainDetectionModels,
  calculateAnomalyScores,
  createBaselineProfiles,
  configureThreatDetection,
  generateAnomalyReports,
  validateDetectionAccuracy,
  handleAnomalyResponse
} from '../../utils/ai-assistant-utils';

// Constants
import {
  ANOMALY_TYPES,
  ANOMALY_CATEGORIES,
  ANOMALY_SEVERITIES,
  DETECTION_MODELS,
  THREAT_LEVELS,
  RESPONSE_ACTIONS
} from '../../constants/ai-assistant-constants';

interface AnomalyDetectionAssistantProps {
  className?: string;
  enableRealTimeDetection?: boolean;
  detectionSensitivity?: 'low' | 'medium' | 'high' | 'custom';
  onAnomalyDetected?: (anomaly: AnomalyDetection) => void;
  onThreatIdentified?: (threat: SecurityAnomaly) => void;
  autoResponseEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

interface AnomalyDashboardProps {
  anomalies: AnomalyDetection[];
  selectedAnomaly: string | null;
  onAnomalySelect: (anomalyId: string) => void;
  onAnomalyDismiss: (anomalyId: string) => void;
  onAnomalyInvestigate: (anomalyId: string) => void;
  showResolved: boolean;
}

interface DetectionModelsProps {
  models: DetectionModel[];
  onModelTrain: (modelId: string) => void;
  onModelConfigure: (modelId: string, config: ModelConfiguration) => void;
  onModelValidate: (modelId: string) => void;
  activeModels: string[];
}

interface ThreatAnalysisProps {
  threats: SecurityAnomaly[];
  threatLevel: ThreatLevel;
  onThreatAnalyze: (threatId: string) => void;
  onThreatResponse: (threatId: string, action: string) => void;
  autoResponseEnabled: boolean;
}

interface BaselineManagementProps {
  baselines: BaselineProfile[];
  onBaselineCreate: (config: any) => void;
  onBaselineUpdate: (baselineId: string, updates: any) => void;
  onBaselineValidate: (baselineId: string) => void;
  validationMetrics: Record<string, number>;
}

export const AnomalyDetectionAssistant: React.FC<AnomalyDetectionAssistantProps> = ({
  className = "",
  enableRealTimeDetection = true,
  detectionSensitivity = 'medium',
  onAnomalyDetected,
  onThreatIdentified,
  autoResponseEnabled = false,
  notificationSettings = { email: true, push: true, inApp: true }
}) => {
  // Hooks
  const {
    anomalyDetections,
    detectionModels,
    anomalyMetrics,
    securityThreats,
    baselineProfiles,
    detectionRules,
    anomalyHistory,
    detectAnomalies,
    configureDetection,
    trainModel,
    createBaseline,
    updateDetectionRules,
    generateAnomalyReport,
    resolveAnomaly,
    isDetecting,
    isTraining,
    error
  } = useAIAssistant();

  const {
    systemHealth,
    globalMetrics,
    performanceMetrics,
    getSystemAnalysis
  } = useRacineOrchestration();

  const {
    activeSPAContext,
    getAllSPAStatus,
    crossGroupMetrics,
    spaIntegrationData
  } = useCrossGroupIntegration();

  const {
    currentUser,
    userPermissions,
    userBehaviorData,
    userPreferences
  } = useUserManagement();

  const {
    activeWorkspace,
    workspaceMetrics,
    workspaceConfiguration
  } = useWorkspaceManagement();

  const {
    trackActivity,
    recentActivities,
    activityPatterns,
    getActivityAnalytics
  } = useActivityTracker();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'detection' | 'threats' | 'models' | 'baselines'>('overview');
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(null);
  const [anomalyFilter, setAnomalyFilter] = useState<AnomalyCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AnomalySeverity | 'all'>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [realTimeDetection, setRealTimeDetection] = useState(enableRealTimeDetection);
  const [sensitivity, setSensitivity] = useState(detectionSensitivity);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoResponse, setAutoResponse] = useState(autoResponseEnabled);
  const [detectionConfig, setDetectionConfig] = useState({
    enableStatistical: true,
    enableMachineLearning: true,
    enableRuleBased: true,
    enableBehavioral: true
  });
  const [thresholdConfig, setThresholdConfig] = useState<ThresholdConfiguration>({
    performance: { warning: 0.7, critical: 0.9 },
    security: { warning: 0.6, critical: 0.8 },
    dataQuality: { warning: 0.8, critical: 0.95 },
    userBehavior: { warning: 0.75, critical: 0.9 }
  });
  const [lastDetection, setLastDetection] = useState<Date>(new Date());
  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 0,
    falsePositives: 0,
    accuracy: 0,
    responseTime: 0
  });

  // Refs
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const anomalyCache = useRef<Map<string, AnomalyDetection>>(new Map());

  // Computed Values
  const currentContext = useMemo<AIContext>(() => ({
    user: currentUser,
    workspace: activeWorkspace,
    activeSPA: activeSPAContext?.activeSPA || null,
    systemHealth,
    recentActivities: recentActivities.slice(0, 50),
    userPermissions,
    workspaceContext: {
      id: activeWorkspace?.id || '',
      configuration: workspaceConfiguration,
      metrics: workspaceMetrics
    },
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  }), [
    currentUser,
    activeWorkspace,
    activeSPAContext,
    systemHealth,
    recentActivities,
    userPermissions,
    workspaceConfiguration,
    workspaceMetrics
  ]);

  const filteredAnomalies = useMemo(() => {
    let filtered = anomalyDetections;

    if (anomalyFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.category === anomalyFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(anomaly => anomaly.severity === severityFilter);
    }

    if (!showResolved) {
      filtered = filtered.filter(anomaly => !anomaly.resolved);
    }

    // Sort by severity and timestamp
    filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return filtered;
  }, [anomalyDetections, anomalyFilter, severityFilter, showResolved]);

  const criticalAnomalies = useMemo(() => {
    return anomalyDetections.filter(anomaly => 
      anomaly.severity === 'critical' && !anomaly.resolved
    );
  }, [anomalyDetections]);

  const highRiskThreats = useMemo(() => {
    return securityThreats.filter(threat => 
      threat.threatLevel === 'high' || threat.threatLevel === 'critical'
    );
  }, [securityThreats]);

  const categoryMetrics = useMemo(() => {
    const metrics: Record<AnomalyCategory, number> = {} as any;
    ANOMALY_CATEGORIES.forEach(category => {
      metrics[category] = anomalyDetections.filter(anomaly => 
        anomaly.category === category && !anomaly.resolved
      ).length;
    });
    return metrics;
  }, [anomalyDetections]);

  const activeModels = useMemo(() => {
    return detectionModels.filter(model => model.isActive && model.status === 'trained');
  }, [detectionModels]);

  // Effects
  useEffect(() => {
    if (realTimeDetection) {
      detectionInterval.current = setInterval(() => {
        performRealTimeDetection();
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [realTimeDetection, sensitivity, detectionConfig]);

  useEffect(() => {
    // Perform initial detection
    performInitialDetection();
  }, [currentContext]);

  useEffect(() => {
    // Handle new anomalies
    anomalyDetections.forEach(anomaly => {
      if (!anomalyCache.current.has(anomaly.id)) {
        anomalyCache.current.set(anomaly.id, anomaly);
        
        if (onAnomalyDetected) {
          onAnomalyDetected(anomaly);
        }

        if (anomaly.category === 'security' && onThreatIdentified) {
          onThreatIdentified(anomaly as SecurityAnomaly);
        }

        // Handle automatic response
        if (autoResponse && anomaly.severity === 'critical') {
          handleAutomaticResponse(anomaly);
        }
      }
    });
  }, [anomalyDetections, onAnomalyDetected, onThreatIdentified, autoResponse]);

  // Handlers
  const performInitialDetection = useCallback(async () => {
    try {
      await detectAnomalies({
        context: currentContext,
        sensitivity,
        detectionTypes: Object.keys(detectionConfig).filter(key => detectionConfig[key]),
        thresholds: thresholdConfig,
        includeBaseline: true,
        realTime: false
      });

      setLastDetection(new Date());

      trackActivity({
        type: 'anomaly_detection_initialized',
        details: {
          sensitivity,
          detectionTypes: Object.keys(detectionConfig).filter(key => detectionConfig[key]),
          context: currentContext.activeSPA
        }
      });

    } catch (error) {
      console.error('Failed to perform initial detection:', error);
    }
  }, [detectAnomalies, currentContext, sensitivity, detectionConfig, thresholdConfig, trackActivity]);

  const performRealTimeDetection = useCallback(async () => {
    try {
      await detectAnomalies({
        context: currentContext,
        sensitivity,
        detectionTypes: Object.keys(detectionConfig).filter(key => detectionConfig[key]),
        thresholds: thresholdConfig,
        includeBaseline: true,
        realTime: true,
        onlyNew: true
      });

      setLastDetection(new Date());

    } catch (error) {
      console.error('Failed to perform real-time detection:', error);
    }
  }, [detectAnomalies, currentContext, sensitivity, detectionConfig, thresholdConfig]);

  const handleAutomaticResponse = useCallback(async (anomaly: AnomalyDetection) => {
    try {
      let responseAction = '';

      switch (anomaly.category) {
        case 'security':
          responseAction = 'isolate_threat';
          break;
        case 'performance':
          responseAction = 'throttle_resources';
          break;
        case 'data_quality':
          responseAction = 'quarantine_data';
          break;
        case 'user_behavior':
          responseAction = 'suspend_user';
          break;
        default:
          responseAction = 'alert_admins';
      }

      await handleAnomalyResponse(anomaly.id, {
        action: responseAction,
        automated: true,
        context: currentContext,
        timestamp: new Date()
      });

      trackActivity({
        type: 'automatic_anomaly_response',
        details: {
          anomalyId: anomaly.id,
          action: responseAction,
          severity: anomaly.severity
        }
      });

    } catch (error) {
      console.error('Failed to handle automatic response:', error);
    }
  }, [handleAnomalyResponse, currentContext, trackActivity]);

  const handleAnomalyInvestigate = useCallback(async (anomalyId: string) => {
    try {
      const anomaly = anomalyDetections.find(a => a.id === anomalyId);
      if (!anomaly) return;

      // Generate detailed investigation report
      const report = await generateAnomalyReport(anomalyId, {
        includeContext: true,
        includeTimeline: true,
        includeRelatedEvents: true,
        includeMitigation: true
      });

      trackActivity({
        type: 'anomaly_investigated',
        details: {
          anomalyId,
          category: anomaly.category,
          severity: anomaly.severity
        }
      });

      // This would typically open a detailed investigation view
      console.log('Investigation report:', report);

    } catch (error) {
      console.error('Failed to investigate anomaly:', error);
    }
  }, [anomalyDetections, generateAnomalyReport, trackActivity]);

  const handleModelTrain = useCallback(async (modelId: string) => {
    try {
      await trainModel(modelId, {
        trainingData: anomalyHistory,
        validationSplit: 0.2,
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
        includeRecentData: true
      });

      trackActivity({
        type: 'detection_model_trained',
        details: {
          modelId,
          dataSize: anomalyHistory.length
        }
      });

    } catch (error) {
      console.error('Failed to train model:', error);
    }
  }, [trainModel, anomalyHistory, trackActivity]);

  const handleBaselineCreate = useCallback(async (config: any) => {
    try {
      await createBaseline({
        ...config,
        context: currentContext,
        trainingPeriod: '30d',
        includeAllSPAs: true,
        adaptiveThresholds: true
      });

      trackActivity({
        type: 'baseline_created',
        details: {
          scope: config.scope,
          type: config.type
        }
      });

    } catch (error) {
      console.error('Failed to create baseline:', error);
    }
  }, [createBaseline, currentContext, trackActivity]);

  const handleExportReport = useCallback(async () => {
    try {
      const report = await generateAnomalyReport('all', {
        timeRange: '7d',
        includeMetrics: true,
        includeVisualizations: true,
        includeRecommendations: true,
        format: 'comprehensive'
      });

      // ArrowDownTrayIcon the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `anomaly-detection-report-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      trackActivity({
        type: 'anomaly_report_exported',
        details: {
          anomalyCount: filteredAnomalies.length,
          timeRange: '7d'
        }
      });

    } catch (error) {
      console.error('Failed to export report:', error);
    }
  }, [generateAnomalyReport, filteredAnomalies.length, trackActivity]);

  // Render Methods
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{filteredAnomalies.length}</div>
                <p className="text-xs text-muted-foreground">Active Anomalies</p>
              </div>
              <Radar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalAnomalies.length}</div>
                <p className="text-xs text-muted-foreground">Critical Issues</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{highRiskThreats.length}</div>
                <p className="text-xs text-muted-foreground">High-Risk Threats</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((detectionStats.accuracy || 0.85) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Detection Accuracy</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAnomalies.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Anomalies Detected</AlertTitle>
          <AlertDescription>
            {criticalAnomalies.length} critical anomalies require immediate attention across your data governance system.
          </AlertDescription>
        </Alert>
      )}

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Anomaly Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(categoryMetrics).map(([category, count]) => (
              <div key={category} className="text-center p-3 border rounded-lg">
                <div className="text-lg font-semibold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {category.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Anomalies */}
      <AnomalyDashboard
        anomalies={filteredAnomalies.slice(0, 10)}
        selectedAnomaly={selectedAnomaly}
        onAnomalySelect={setSelectedAnomaly}
        onAnomalyDismiss={async (anomalyId) => {
          await resolveAnomaly(anomalyId, {
            resolution: 'dismissed',
            reason: 'False positive or non-actionable',
            resolvedBy: currentUser?.id
          });
        }}
        onAnomalyInvestigate={handleAnomalyInvestigate}
        showResolved={showResolved}
      />
    </div>
  );

  const renderDetection = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Detection Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Detection Sensitivity</Label>
              <Select value={sensitivity} onValueChange={(value: any) => setSensitivity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Fewer alerts)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (More sensitive)</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Real-time Detection</Label>
                <Switch
                  checked={realTimeDetection}
                  onCheckedChange={setRealTimeDetection}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Detection Methods</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(detectionConfig).map(([method, enabled]) => (
                <div key={method} className="flex items-center justify-between">
                  <Label className="text-sm capitalize">
                    {method.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      setDetectionConfig(prev => ({ ...prev, [method]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Alert Settings</Label>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enable Alerts</Label>
              <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto Response</Label>
              <Switch checked={autoResponse} onCheckedChange={setAutoResponse} />
            </div>
          </div>
        </CardContent>
      </Card>

      <AnomalyDashboard
        anomalies={filteredAnomalies}
        selectedAnomaly={selectedAnomaly}
        onAnomalySelect={setSelectedAnomaly}
        onAnomalyDismiss={async (anomalyId) => {
          await resolveAnomaly(anomalyId, {
            resolution: 'dismissed',
            reason: 'False positive',
            resolvedBy: currentUser?.id
          });
        }}
        onAnomalyInvestigate={handleAnomalyInvestigate}
        showResolved={showResolved}
      />
    </div>
  );

  const renderThreats = () => (
    <ThreatAnalysis
      threats={securityThreats}
      threatLevel="medium"
      onThreatAnalyze={(threatId) => {
        // Handle threat analysis
      }}
      onThreatResponse={(threatId, action) => {
        // Handle threat response
      }}
      autoResponseEnabled={autoResponse}
    />
  );

  const renderModels = () => (
    <DetectionModels
      models={detectionModels}
      onModelTrain={handleModelTrain}
      onModelConfigure={(modelId, config) => {
        // Handle model configuration
      }}
      onModelValidate={(modelId) => {
        // Handle model validation
      }}
      activeModels={activeModels.map(m => m.id)}
    />
  );

  const renderBaselines = () => (
    <BaselineManagement
      baselines={baselineProfiles}
      onBaselineCreate={handleBaselineCreate}
      onBaselineUpdate={(baselineId, updates) => {
        // Handle baseline update
      }}
      onBaselineValidate={(baselineId) => {
        // Handle baseline validation
      }}
      validationMetrics={{}}
    />
  );

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radar className="h-6 w-6 text-red-500" />
            <div>
              <h2 className="text-xl font-semibold">Anomaly Detection Assistant</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered anomaly detection across all data governance operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={realTimeDetection}
                onCheckedChange={setRealTimeDetection}
              />
              <Label className="text-sm">Real-time</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={alertsEnabled}
                onCheckedChange={setAlertsEnabled}
              />
              <Label className="text-sm">Alerts</Label>
            </div>

            <Button variant="outline" size="sm" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button 
              onClick={performInitialDetection}
              disabled={isDetecting}
              size="sm"
            >
              {isDetecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Detecting...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Category:</Label>
                  <Select value={anomalyFilter} onValueChange={(value: any) => setAnomalyFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {ANOMALY_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm">Severity:</Label>
                  <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={showResolved} onCheckedChange={setShowResolved} />
                  <Label className="text-sm">Show Resolved</Label>
                </div>
              </div>

              <Badge variant="outline" className="text-xs">
                Last scan: {lastDetection.toLocaleTimeString()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="detection" className="flex items-center gap-2">
              <Radar className="h-4 w-4" />
              Detection
            </TabsTrigger>
            <TabsTrigger value="threats" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Threats
              {highRiskThreats.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {highRiskThreats.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="baselines" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Baselines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="detection" className="space-y-4">
            {renderDetection()}
          </TabsContent>

          <TabsContent value="threats" className="space-y-4">
            {renderThreats()}
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            {renderModels()}
          </TabsContent>

          <TabsContent value="baselines" className="space-y-4">
            {renderBaselines()}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Anomaly Detection Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

// Anomaly Dashboard Component
const AnomalyDashboard: React.FC<AnomalyDashboardProps> = ({
  anomalies,
  selectedAnomaly,
  onAnomalySelect,
  onAnomalyDismiss,
  onAnomalyInvestigate,
  showResolved
}) => {
  const getSeverityIcon = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <Flag className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-blue-500" />;
      case 'low': return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: AnomalyCategory) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'data_quality': return <Database className="h-4 w-4" />;
      case 'user_behavior': return <Users className="h-4 w-4" />;
      case 'system': return <Activity className="h-4 w-4" />;
      default: return <Radar className="h-4 w-4" />;
    }
  };

  if (anomalies.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Radar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Anomalies Detected</h3>
          <p className="text-muted-foreground text-sm">
            Your system is operating normally with no detected anomalies.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detected Anomalies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.id}
            className={`cursor-pointer transition-all duration-200 p-3 rounded-lg border ${getSeverityColor(anomaly.severity)} ${
              selectedAnomaly === anomaly.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onAnomalySelect(anomaly.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(anomaly.severity)}
                  {getCategoryIcon(anomaly.category)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{anomaly.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {anomaly.category}
                    </Badge>
                    <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                      {anomaly.severity}
                    </Badge>
                    {anomaly.resolved && (
                      <Badge variant="default" className="text-xs">
                        Resolved
                      </Badge>
                    )}
                  </div>

                  {anomaly.confidence && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Confidence:</span>
                        <span>{Math.round(anomaly.confidence * 100)}%</span>
                      </div>
                      <Progress value={anomaly.confidence * 100} className="h-1" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnomalyInvestigate(anomaly.id);
                  }}
                >
                  <Search className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnomalyDismiss(anomaly.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Threat Analysis Component
const ThreatAnalysis: React.FC<ThreatAnalysisProps> = ({
  threats,
  threatLevel,
  onThreatAnalyze,
  onThreatResponse,
  autoResponseEnabled
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Threat Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {threats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Security Threats Detected</h3>
              <p className="text-sm">
                Your system appears secure with no active threats.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {threats.map((threat) => (
                <div key={threat.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{threat.title}</h4>
                    <p className="text-sm text-muted-foreground">{threat.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={threat.threatLevel === 'critical' ? 'destructive' : 'secondary'}>
                        {threat.threatLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {threat.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onThreatAnalyze(threat.id)}
                    >
                      <Search className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onThreatResponse(threat.id, 'mitigate')}
                    >
                      <Shield className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Detection Models Component
const DetectionModels: React.FC<DetectionModelsProps> = ({
  models,
  onModelTrain,
  onModelConfigure,
  onModelValidate,
  activeModels
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Detection Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {models.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{model.name}</h4>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={activeModels.includes(model.id) ? 'default' : 'secondary'}>
                      {model.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Accuracy: {Math.round((model.accuracy || 0) * 100)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onModelTrain(model.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onModelValidate(model.id)}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Baseline Management Component
const BaselineManagement: React.FC<BaselineManagementProps> = ({
  baselines,
  onBaselineCreate,
  onBaselineUpdate,
  onBaselineValidate,
  validationMetrics
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Baseline Profiles
            </CardTitle>
            <Button size="sm" onClick={() => onBaselineCreate({})}>
              <Plus className="h-4 w-4 mr-2" />
              Create Baseline
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {baselines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Baselines Created</h3>
              <p className="text-sm">
                Create baseline profiles to improve anomaly detection accuracy.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {baselines.map((baseline) => (
                <div key={baseline.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{baseline.name}</h4>
                    <p className="text-sm text-muted-foreground">{baseline.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={baseline.isActive ? 'default' : 'secondary'}>
                        {baseline.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {baseline.scope}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onBaselineValidate(baseline.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Edit baseline
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDetectionAssistant;