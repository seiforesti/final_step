/**
 * 🎭 Behavioral Analyzer - Advanced Behavioral Analysis & User Profiling
 * =====================================================================
 * 
 * Enterprise-grade behavioral analysis system that provides deep insights into user behavior,
 * system interactions, and behavioral patterns for enhanced security and intelligence.
 * 
 * Features:
 * - Advanced behavioral pattern analysis
 * - Real-time user activity monitoring
 * - Behavioral anomaly detection
 * - User profiling and baseline establishment
 * - Risk-based behavioral scoring
 * - Predictive behavioral modeling
 * - Adaptive learning from user patterns
 * - Comprehensive behavioral reporting
 * 
 * @author Enterprise Data Governance Team
 * @version 2.0.0 - Production Enterprise Ready
 * @component BehavioralAnalyzer
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, User, Eye, Activity, TrendingUp, BarChart3, PieChart, LineChart, 
  Target, Brain, Shield, AlertTriangle, Clock, Calendar, Settings, RefreshCw,
  Download, Upload, Play, Pause, Square, CheckCircle, XCircle, Database,
  Server, Network, Cpu, HardDrive, Memory, Lock, Unlock, GitBranch, Box,
  Grid, List, MoreHorizontal, ChevronDown, ChevronRight, ChevronLeft,
  ExternalLink, Info, HelpCircle, Star, Bookmark, Share, Copy, Edit,
  Trash2, Plus, Minus, Maximize, Minimize, RotateCcw, Save, Send,
  MessageSquare, MapPin, Globe, Wifi, WifiOff, Signal, Battery, Bluetooth,
  Volume2, VolumeX, Camera, Video, Image, FileText, File, Folder,
  FolderOpen, Archive, Package, Layers3, Component, Puzzle, Zap, Filter,
  Search, Gauge, Radar, Compass, Map, Lightbulb, BookOpen, Code, Workflow,
  Link, Timer, Crosshair, Focus, UserCheck, UserX, UserPlus, MousePointer,
  Keyboard, Monitor, Smartphone, Layers
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { DataTable } from '@/components/ui/data-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Chart Components
import { 
  ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, 
  Pie, Cell, AreaChart, Area, ComposedChart, Scatter, ScatterChart, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Sankey, FunnelChart, Funnel, LabelList,
  ReferenceLine, ReferenceArea, Brush
} from 'recharts';

// Types and Interfaces
import { 
  BehavioralProfile, BehavioralPattern, BehavioralAnomaly, BehavioralMetric, BehavioralInsight,
  UserBehavior, SessionBehavior, ActivityPattern, InteractionPattern, AccessPattern,
  BehavioralRisk, BehavioralScore, BehavioralBaseline, BehavioralTrend, BehavioralAlert,
  BehavioralClassification, BehavioralSegment, BehavioralContext, BehavioralPrediction,
  BehavioralRule, BehavioralThreshold, BehavioralModel, BehavioralAnalysis, BehavioralReport,
  BehavioralConfiguration, BehavioralVisualization, BehavioralCorrelation, BehavioralEvent
} from '../../types/intelligence.types';

import { 
  SystemHealthStatus, PerformanceMetrics, ResourceAllocation, WorkflowExecution,
  AlertConfiguration, NotificationRule
} from '../../types/orchestration.types';

// Hooks and Services
import { useScanIntelligence } from '../../hooks/useScanIntelligence';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { useNotifications } from '@/hooks/useNotifications';
import { useWebSocket } from '@/hooks/useWebSocket';

// Utils and Constants
import { cn } from '@/lib/utils';
import { formatDate, formatDuration, formatBytes, formatNumber, formatPercentage } from '@/utils/formatters';
import { generateColor, getStatusColor, getSeverityColor, getRiskColor } from '@/utils/colors';
import { 
  BEHAVIORAL_PATTERNS, BEHAVIORAL_METRICS, BEHAVIORAL_CLASSIFICATIONS, BEHAVIORAL_RISK_LEVELS,
  BEHAVIORAL_THRESHOLDS, BEHAVIORAL_ALGORITHMS, BEHAVIORAL_MODELS, DEFAULT_BEHAVIORAL_SETTINGS
} from '../../constants/intelligence-constants';

// Component State Interface
interface BehavioralAnalyzerState {
  // Analysis Status
  isAnalyzing: boolean;
  isLearning: boolean;
  isModeling: boolean;
  lastUpdate: Date;
  
  // Behavioral Data
  profiles: BehavioralProfile[];
  patterns: BehavioralPattern[];
  anomalies: BehavioralAnomaly[];
  insights: BehavioralInsight[];
  behaviors: UserBehavior[];
  sessions: SessionBehavior[];
  
  // Analysis Results
  analyses: BehavioralAnalysis[];
  predictions: BehavioralPrediction[];
  correlations: BehavioralCorrelation[];
  trends: BehavioralTrend[];
  alerts: BehavioralAlert[];
  risks: BehavioralRisk[];
  
  // Models and Configuration
  models: BehavioralModel[];
  configurations: BehavioralConfiguration[];
  baselines: BehavioralBaseline[];
  thresholds: BehavioralThreshold[];
  rules: BehavioralRule[];
  segments: BehavioralSegment[];
  
  // Filtering and Views
  selectedUsers: string[];
  selectedPatterns: string[];
  selectedRiskLevels: string[];
  selectedTimeRange: string;
  selectedMetrics: string[];
  
  // UI State
  activeTab: string;
  selectedProfile: BehavioralProfile | null;
  selectedAnomaly: BehavioralAnomaly | null;
  selectedPattern: BehavioralPattern | null;
  showProfileDetails: boolean;
  showAdvancedSettings: boolean;
  showModelBuilder: boolean;
  showRiskMatrix: boolean;
  
  // Real-time State
  liveBehaviors: boolean;
  autoAnalysis: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Visualization State
  viewMode: 'profiles' | 'patterns' | 'timeline' | 'heatmap';
  chartType: string;
  showPredictions: boolean;
  showBaselines: boolean;
  timeGranularity: 'minute' | 'hour' | 'day' | 'week';
  focusUser: string | null;
  
  // Error Handling
  errors: any[];
  warnings: any[];
  status: 'idle' | 'loading' | 'success' | 'error';
}

// Reducer Actions
type BehavioralAnalyzerAction = 
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_LEARNING'; payload: boolean }
  | { type: 'SET_MODELING'; payload: boolean }
  | { type: 'SET_LAST_UPDATE'; payload: Date }
  | { type: 'SET_PROFILES'; payload: BehavioralProfile[] }
  | { type: 'ADD_PROFILE'; payload: BehavioralProfile }
  | { type: 'UPDATE_PROFILE'; payload: { id: string; updates: Partial<BehavioralProfile> } }
  | { type: 'SET_PATTERNS'; payload: BehavioralPattern[] }
  | { type: 'SET_ANOMALIES'; payload: BehavioralAnomaly[] }
  | { type: 'SET_INSIGHTS'; payload: BehavioralInsight[] }
  | { type: 'SET_BEHAVIORS'; payload: UserBehavior[] }
  | { type: 'SET_SESSIONS'; payload: SessionBehavior[] }
  | { type: 'SET_ANALYSES'; payload: BehavioralAnalysis[] }
  | { type: 'SET_PREDICTIONS'; payload: BehavioralPrediction[] }
  | { type: 'SET_CORRELATIONS'; payload: BehavioralCorrelation[] }
  | { type: 'SET_TRENDS'; payload: BehavioralTrend[] }
  | { type: 'SET_ALERTS'; payload: BehavioralAlert[] }
  | { type: 'SET_RISKS'; payload: BehavioralRisk[] }
  | { type: 'SET_MODELS'; payload: BehavioralModel[] }
  | { type: 'SET_CONFIGURATIONS'; payload: BehavioralConfiguration[] }
  | { type: 'SET_BASELINES'; payload: BehavioralBaseline[] }
  | { type: 'SET_THRESHOLDS'; payload: BehavioralThreshold[] }
  | { type: 'SET_RULES'; payload: BehavioralRule[] }
  | { type: 'SET_SEGMENTS'; payload: BehavioralSegment[] }
  | { type: 'SET_SELECTED_USERS'; payload: string[] }
  | { type: 'SET_SELECTED_PATTERNS'; payload: string[] }
  | { type: 'SET_SELECTED_RISK_LEVELS'; payload: string[] }
  | { type: 'SET_SELECTED_TIME_RANGE'; payload: string }
  | { type: 'SET_SELECTED_METRICS'; payload: string[] }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SELECTED_PROFILE'; payload: BehavioralProfile | null }
  | { type: 'SET_SELECTED_ANOMALY'; payload: BehavioralAnomaly | null }
  | { type: 'SET_SELECTED_PATTERN'; payload: BehavioralPattern | null }
  | { type: 'SET_SHOW_PROFILE_DETAILS'; payload: boolean }
  | { type: 'SET_SHOW_ADVANCED_SETTINGS'; payload: boolean }
  | { type: 'SET_SHOW_MODEL_BUILDER'; payload: boolean }
  | { type: 'SET_SHOW_RISK_MATRIX'; payload: boolean }
  | { type: 'SET_LIVE_BEHAVIORS'; payload: boolean }
  | { type: 'SET_AUTO_ANALYSIS'; payload: boolean }
  | { type: 'SET_AUTO_REFRESH'; payload: boolean }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'SET_VIEW_MODE'; payload: 'profiles' | 'patterns' | 'timeline' | 'heatmap' }
  | { type: 'SET_CHART_TYPE'; payload: string }
  | { type: 'SET_SHOW_PREDICTIONS'; payload: boolean }
  | { type: 'SET_SHOW_BASELINES'; payload: boolean }
  | { type: 'SET_TIME_GRANULARITY'; payload: 'minute' | 'hour' | 'day' | 'week' }
  | { type: 'SET_FOCUS_USER'; payload: string | null }
  | { type: 'ADD_ERROR'; payload: any }
  | { type: 'ADD_WARNING'; payload: any }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_WARNINGS' }
  | { type: 'SET_STATUS'; payload: 'idle' | 'loading' | 'success' | 'error' };

// Reducer
const behavioralAnalyzerReducer = (state: BehavioralAnalyzerState, action: BehavioralAnalyzerAction): BehavioralAnalyzerState => {
  switch (action.type) {
    case 'SET_ANALYZING': return { ...state, isAnalyzing: action.payload };
    case 'SET_LEARNING': return { ...state, isLearning: action.payload };
    case 'SET_MODELING': return { ...state, isModeling: action.payload };
    case 'SET_LAST_UPDATE': return { ...state, lastUpdate: action.payload };
    case 'SET_PROFILES': return { ...state, profiles: action.payload };
    case 'ADD_PROFILE': return { ...state, profiles: [action.payload, ...state.profiles] };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.map(profile => 
          profile.id === action.payload.id 
            ? { ...profile, ...action.payload.updates }
            : profile
        )
      };
    case 'SET_PATTERNS': return { ...state, patterns: action.payload };
    case 'SET_ANOMALIES': return { ...state, anomalies: action.payload };
    case 'SET_INSIGHTS': return { ...state, insights: action.payload };
    case 'SET_BEHAVIORS': return { ...state, behaviors: action.payload };
    case 'SET_SESSIONS': return { ...state, sessions: action.payload };
    case 'SET_ANALYSES': return { ...state, analyses: action.payload };
    case 'SET_PREDICTIONS': return { ...state, predictions: action.payload };
    case 'SET_CORRELATIONS': return { ...state, correlations: action.payload };
    case 'SET_TRENDS': return { ...state, trends: action.payload };
    case 'SET_ALERTS': return { ...state, alerts: action.payload };
    case 'SET_RISKS': return { ...state, risks: action.payload };
    case 'SET_MODELS': return { ...state, models: action.payload };
    case 'SET_CONFIGURATIONS': return { ...state, configurations: action.payload };
    case 'SET_BASELINES': return { ...state, baselines: action.payload };
    case 'SET_THRESHOLDS': return { ...state, thresholds: action.payload };
    case 'SET_RULES': return { ...state, rules: action.payload };
    case 'SET_SEGMENTS': return { ...state, segments: action.payload };
    case 'SET_SELECTED_USERS': return { ...state, selectedUsers: action.payload };
    case 'SET_SELECTED_PATTERNS': return { ...state, selectedPatterns: action.payload };
    case 'SET_SELECTED_RISK_LEVELS': return { ...state, selectedRiskLevels: action.payload };
    case 'SET_SELECTED_TIME_RANGE': return { ...state, selectedTimeRange: action.payload };
    case 'SET_SELECTED_METRICS': return { ...state, selectedMetrics: action.payload };
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload };
    case 'SET_SELECTED_PROFILE': return { ...state, selectedProfile: action.payload };
    case 'SET_SELECTED_ANOMALY': return { ...state, selectedAnomaly: action.payload };
    case 'SET_SELECTED_PATTERN': return { ...state, selectedPattern: action.payload };
    case 'SET_SHOW_PROFILE_DETAILS': return { ...state, showProfileDetails: action.payload };
    case 'SET_SHOW_ADVANCED_SETTINGS': return { ...state, showAdvancedSettings: action.payload };
    case 'SET_SHOW_MODEL_BUILDER': return { ...state, showModelBuilder: action.payload };
    case 'SET_SHOW_RISK_MATRIX': return { ...state, showRiskMatrix: action.payload };
    case 'SET_LIVE_BEHAVIORS': return { ...state, liveBehaviors: action.payload };
    case 'SET_AUTO_ANALYSIS': return { ...state, autoAnalysis: action.payload };
    case 'SET_AUTO_REFRESH': return { ...state, autoRefresh: action.payload };
    case 'SET_REFRESH_INTERVAL': return { ...state, refreshInterval: action.payload };
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.payload };
    case 'SET_CHART_TYPE': return { ...state, chartType: action.payload };
    case 'SET_SHOW_PREDICTIONS': return { ...state, showPredictions: action.payload };
    case 'SET_SHOW_BASELINES': return { ...state, showBaselines: action.payload };
    case 'SET_TIME_GRANULARITY': return { ...state, timeGranularity: action.payload };
    case 'SET_FOCUS_USER': return { ...state, focusUser: action.payload };
    case 'ADD_ERROR': return { ...state, errors: [...state.errors, action.payload] };
    case 'ADD_WARNING': return { ...state, warnings: [...state.warnings, action.payload] };
    case 'CLEAR_ERRORS': return { ...state, errors: [] };
    case 'CLEAR_WARNINGS': return { ...state, warnings: [] };
    case 'SET_STATUS': return { ...state, status: action.payload };
    default: return state;
  }
};

// Initial state
const initialState: BehavioralAnalyzerState = {
  isAnalyzing: false,
  isLearning: false,
  isModeling: false,
  lastUpdate: new Date(),
  profiles: [],
  patterns: [],
  anomalies: [],
  insights: [],
  behaviors: [],
  sessions: [],
  analyses: [],
  predictions: [],
  correlations: [],
  trends: [],
  alerts: [],
  risks: [],
  models: [],
  configurations: [],
  baselines: [],
  thresholds: [],
  rules: [],
  segments: [],
  selectedUsers: [],
  selectedPatterns: [],
  selectedRiskLevels: [],
  selectedTimeRange: '24h',
  selectedMetrics: [],
  activeTab: 'overview',
  selectedProfile: null,
  selectedAnomaly: null,
  selectedPattern: null,
  showProfileDetails: false,
  showAdvancedSettings: false,
  showModelBuilder: false,
  showRiskMatrix: false,
  liveBehaviors: false,
  autoAnalysis: true,
  autoRefresh: true,
  refreshInterval: 30000,
  viewMode: 'profiles',
  chartType: 'timeline',
  showPredictions: true,
  showBaselines: true,
  timeGranularity: 'hour',
  focusUser: null,
  errors: [],
  warnings: [],
  status: 'idle'
};

/**
 * BehavioralAnalyzer Component
 * Advanced behavioral analysis and user profiling system
 */
export const BehavioralAnalyzer: React.FC = () => {
  // State Management
  const [state, dispatch] = useReducer(behavioralAnalyzerReducer, initialState);
  
  // Hooks
  const { 
    getBehavioralProfiles, getBehavioralPatterns, getBehavioralAnomalies, generateBehavioralInsights,
    analyzeBehavioralTrends, createBehavioralBaseline, trainBehavioralModel, getBehavioralRisks
  } = useScanIntelligence();
  
  const { 
    getBehavioralAnalytics, getBehavioralCorrelations, getUserActivityPatterns,
    getSessionAnalytics, getPredictiveBehaviorModels
  } = useAdvancedAnalytics();
  
  const { notify } = useNotifications();
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  
  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Memoized calculations
  const filteredProfiles = useMemo(() => {
    let filtered = state.profiles;
    
    if (state.selectedUsers.length > 0) {
      filtered = filtered.filter(profile => 
        state.selectedUsers.includes(profile.userId)
      );
    }
    
    if (state.selectedRiskLevels.length > 0) {
      filtered = filtered.filter(profile => 
        state.selectedRiskLevels.includes(profile.riskLevel)
      );
    }
    
    return filtered;
  }, [state.profiles, state.selectedUsers, state.selectedRiskLevels]);
  
  const behavioralStats = useMemo(() => {
    const total = filteredProfiles.length;
    const highRisk = filteredProfiles.filter(p => p.riskLevel === 'high').length;
    const mediumRisk = filteredProfiles.filter(p => p.riskLevel === 'medium').length;
    const lowRisk = filteredProfiles.filter(p => p.riskLevel === 'low').length;
    
    const activeProfiles = filteredProfiles.filter(p => p.status === 'active').length;
    const learningProfiles = filteredProfiles.filter(p => p.isLearning).length;
    
    const averageRiskScore = total > 0 
      ? filteredProfiles.reduce((sum, p) => sum + p.riskScore, 0) / total 
      : 0;
    
    const averageConfidence = total > 0 
      ? filteredProfiles.reduce((sum, p) => sum + p.confidence, 0) / total 
      : 0;
    
    return {
      total,
      active: activeProfiles,
      learning: learningProfiles,
      byRisk: { high: highRisk, medium: mediumRisk, low: lowRisk },
      averageRiskScore,
      averageConfidence,
      anomalies: state.anomalies.length,
      patterns: state.patterns.length,
      alerts: state.alerts.length,
      predictions: state.predictions.length
    };
  }, [filteredProfiles, state.anomalies, state.patterns, state.alerts, state.predictions]);
  
  const timelineData = useMemo(() => {
    // Transform behavioral data into timeline format
    const data = state.behaviors
      .filter(behavior => 
        !state.focusUser || behavior.userId === state.focusUser
      )
      .map(behavior => ({
        timestamp: behavior.timestamp,
        riskScore: behavior.riskScore,
        confidence: behavior.confidence,
        activityLevel: behavior.activityLevel,
        anomalyScore: behavior.anomalyScore,
        userId: behavior.userId,
        sessionId: behavior.sessionId
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return data;
  }, [state.behaviors, state.focusUser]);
  
  // Event Handlers
  const handleStartAnalysis = useCallback(async () => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      dispatch({ type: 'SET_ANALYZING', payload: true });
      
      await initializeBehavioralAnalysis();
      
      dispatch({ type: 'SET_STATUS', payload: 'success' });
      notify({
        title: 'Behavioral Analysis Started',
        message: 'Advanced behavioral analysis is now active',
        type: 'success'
      });
    } catch (error) {
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Analysis Start Failed',
        message: 'Failed to start behavioral analysis',
        type: 'error'
      });
    }
  }, [notify]);
  
  const handleStopAnalysis = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ANALYZING', payload: false });
      dispatch({ type: 'SET_LIVE_BEHAVIORS', payload: false });
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      notify({
        title: 'Behavioral Analysis Stopped',
        message: 'Real-time behavioral analysis has been stopped',
        type: 'info'
      });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [notify]);
  
  const handleAnalyzeProfile = useCallback(async (profileId: string) => {
    try {
      dispatch({ type: 'SET_ANALYZING', payload: true });
      
      const insights = await generateBehavioralInsights(profileId);
      
      if (insights) {
        dispatch({ type: 'SET_INSIGHTS', payload: [...state.insights, ...insights] });
        
        notify({
          title: 'Profile Analyzed',
          message: `Behavioral analysis completed for profile ${profileId}`,
          type: 'success'
        });
      }
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Analysis Failed',
        message: 'Failed to analyze the selected profile',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  }, [generateBehavioralInsights, state.insights, notify]);
  
  const handleCreateBaseline = useCallback(async (userId: string) => {
    try {
      dispatch({ type: 'SET_LEARNING', payload: true });
      
      const baseline = await createBehavioralBaseline(userId);
      
      if (baseline) {
        dispatch({ type: 'SET_BASELINES', payload: [...state.baselines, baseline] });
        
        notify({
          title: 'Baseline Created',
          message: `Behavioral baseline established for user ${userId}`,
          type: 'success'
        });
      }
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Baseline Creation Failed',
        message: 'Failed to create behavioral baseline',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_LEARNING', payload: false });
    }
  }, [createBehavioralBaseline, state.baselines, notify]);
  
  const handleTrainModel = useCallback(async (modelId: string, configuration: any) => {
    try {
      dispatch({ type: 'SET_MODELING', payload: true });
      
      const result = await trainBehavioralModel(modelId, configuration);
      
      if (result.success) {
        await loadBehavioralModels();
        
        notify({
          title: 'Model Training Complete',
          message: `Behavioral model ${modelId} has been successfully trained`,
          type: 'success'
        });
      }
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Model Training Failed',
        message: 'Failed to train the behavioral model',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_MODELING', payload: false });
    }
  }, [trainBehavioralModel, notify]);
  
  const handleExportProfiles = useCallback(() => {
    try {
      const exportData = {
        profiles: filteredProfiles,
        patterns: state.patterns,
        anomalies: state.anomalies,
        insights: state.insights,
        analyses: state.analyses,
        statistics: behavioralStats,
        models: state.models,
        baselines: state.baselines,
        exportedAt: new Date().toISOString(),
        configuration: {
          timeRange: state.selectedTimeRange,
          users: state.selectedUsers,
          patterns: state.selectedPatterns,
          riskLevels: state.selectedRiskLevels,
          metrics: state.selectedMetrics
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `behavioral-analysis-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      notify({
        title: 'Export Complete',
        message: 'Behavioral analysis report has been exported',
        type: 'success'
      });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Export Failed',
        message: 'Failed to export behavioral data',
        type: 'error'
      });
    }
  }, [filteredProfiles, state, behavioralStats, notify]);
  
  // Data Loading Functions
  const loadBehavioralProfiles = useCallback(async () => {
    try {
      const profiles = await getBehavioralProfiles({
        timeRange: state.selectedTimeRange,
        users: state.selectedUsers,
        includeInactive: false,
        limit: 1000
      });
      
      dispatch({ type: 'SET_PROFILES', payload: profiles });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getBehavioralProfiles, state.selectedTimeRange, state.selectedUsers]);
  
  const loadBehavioralPatterns = useCallback(async () => {
    try {
      const patterns = await getBehavioralPatterns({
        timeRange: state.selectedTimeRange,
        users: state.selectedUsers,
        includeInactive: false
      });
      
      dispatch({ type: 'SET_PATTERNS', payload: patterns });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getBehavioralPatterns, state.selectedTimeRange, state.selectedUsers]);
  
  const loadBehavioralAnomalies = useCallback(async () => {
    try {
      const anomalies = await getBehavioralAnomalies({
        timeRange: state.selectedTimeRange,
        users: state.selectedUsers
      });
      
      dispatch({ type: 'SET_ANOMALIES', payload: anomalies });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getBehavioralAnomalies, state.selectedTimeRange, state.selectedUsers]);
  
  const loadBehavioralModels = useCallback(async () => {
    try {
      // This would typically come from the intelligence service
      const models: BehavioralModel[] = [];
      dispatch({ type: 'SET_MODELS', payload: models });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, []);
  
  const loadAnalytics = useCallback(async () => {
    try {
      const [analytics, correlations, risks, trends] = await Promise.all([
        getBehavioralAnalytics(state.selectedTimeRange),
        getBehavioralCorrelations(),
        getBehavioralRisks(),
        analyzeBehavioralTrends(state.selectedTimeRange)
      ]);
      
      dispatch({ type: 'SET_CORRELATIONS', payload: correlations });
      dispatch({ type: 'SET_RISKS', payload: risks });
      dispatch({ type: 'SET_TRENDS', payload: trends });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getBehavioralAnalytics, getBehavioralCorrelations, getBehavioralRisks, analyzeBehavioralTrends, state.selectedTimeRange]);
  
  const loadUserBehaviors = useCallback(async () => {
    try {
      const [behaviors, sessions] = await Promise.all([
        getUserActivityPatterns(state.selectedTimeRange),
        getSessionAnalytics(state.selectedTimeRange)
      ]);
      
      dispatch({ type: 'SET_BEHAVIORS', payload: behaviors });
      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getUserActivityPatterns, getSessionAnalytics, state.selectedTimeRange]);
  
  const initializeBehavioralAnalysis = useCallback(async () => {
    try {
      await Promise.all([
        loadBehavioralProfiles(),
        loadBehavioralPatterns(),
        loadBehavioralAnomalies(),
        loadBehavioralModels(),
        loadAnalytics(),
        loadUserBehaviors()
      ]);
      
      if (isConnected) {
        subscribe('behavior_detected', (data: UserBehavior) => {
          dispatch({ type: 'SET_BEHAVIORS', payload: [...state.behaviors, data] });
        });
        
        subscribe('profile_updated', (data: { id: string; updates: Partial<BehavioralProfile> }) => {
          dispatch({ type: 'UPDATE_PROFILE', payload: data });
        });
        
        subscribe('anomaly_detected', (data: BehavioralAnomaly) => {
          dispatch({ type: 'SET_ANOMALIES', payload: [...state.anomalies, data] });
          
          if (data.severity === 'critical' || data.severity === 'high') {
            notify({
              title: 'High-Risk Behavioral Anomaly',
              message: `${data.type}: ${data.description}`,
              type: 'warning'
            });
          }
        });
        
        subscribe('model_updated', () => {
          loadBehavioralModels();
        });
      }
      
      if (state.autoRefresh && !refreshIntervalRef.current) {
        refreshIntervalRef.current = setInterval(() => {
          loadBehavioralProfiles();
          loadBehavioralPatterns();
          loadBehavioralAnomalies();
          loadUserBehaviors();
          dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });
        }, state.refreshInterval);
      }
      
      dispatch({ type: 'SET_LIVE_BEHAVIORS', payload: true });
      
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      throw error;
    }
  }, [
    isConnected, subscribe, loadBehavioralProfiles, loadBehavioralPatterns, 
    loadBehavioralAnomalies, loadBehavioralModels, loadAnalytics, loadUserBehaviors,
    state.autoRefresh, state.refreshInterval, state.behaviors, state.anomalies, notify
  ]);
  
  // Effects
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      if (isConnected) {
        unsubscribe('behavior_detected');
        unsubscribe('profile_updated');
        unsubscribe('anomaly_detected');
        unsubscribe('model_updated');
      }
    };
  }, [isConnected, unsubscribe]);
  
  useEffect(() => {
    loadBehavioralProfiles();
    loadBehavioralPatterns();
    loadBehavioralAnomalies();
    loadBehavioralModels();
    loadAnalytics();
    loadUserBehaviors();
  }, [loadBehavioralProfiles, loadBehavioralPatterns, loadBehavioralAnomalies, loadBehavioralModels, loadAnalytics, loadUserBehaviors]);
  
  useEffect(() => {
    if (state.autoRefresh && state.isAnalyzing) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        loadBehavioralProfiles();
        loadBehavioralPatterns();
        loadBehavioralAnomalies();
        loadUserBehaviors();
        dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });
      }, state.refreshInterval);
    } else if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [state.autoRefresh, state.isAnalyzing, state.refreshInterval, loadBehavioralProfiles, loadBehavioralPatterns, loadBehavioralAnomalies, loadUserBehaviors]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
      {/* Header Section */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                {state.isAnalyzing && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Behavioral Analyzer
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Advanced behavioral analysis and user profiling system
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Indicators */}
            <div className="flex items-center space-x-2">
              <Badge 
                variant={state.isAnalyzing ? 'default' : 'secondary'}
                className={cn(
                  "flex items-center space-x-1",
                  state.isAnalyzing && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  state.isAnalyzing ? "bg-blue-200 animate-pulse" : "bg-slate-400"
                )} />
                <span>{state.isAnalyzing ? 'Analyzing' : 'Inactive'}</span>
              </Badge>
              
              {state.liveBehaviors && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Activity className="h-3 w-3" />
                  <span>Live</span>
                </Badge>
              )}
              
              {state.isLearning && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Brain className="h-3 w-3 animate-pulse" />
                  <span>Learning</span>
                </Badge>
              )}
              
              {state.isModeling && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Target className="h-3 w-3 animate-spin" />
                  <span>Modeling</span>
                </Badge>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_SHOW_ADVANCED_SETTINGS', payload: !state.showAdvancedSettings })}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Advanced Settings</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_SHOW_RISK_MATRIX', payload: !state.showRiskMatrix })}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Risk Matrix</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_SHOW_MODEL_BUILDER', payload: !state.showModelBuilder })}
                    >
                      <Brain className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Model Builder</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportProfiles}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Profiles</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                onClick={state.isAnalyzing ? handleStopAnalysis : handleStartAnalysis}
                disabled={state.status === 'loading'}
                className={cn(
                  "min-w-[140px]",
                  state.isAnalyzing 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {state.status === 'loading' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : state.isAnalyzing ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Analysis
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-6 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Profiles</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{behavioralStats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">Active Profiles</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{behavioralStats.active}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">High Risk</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{behavioralStats.byRisk.high}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Patterns</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{behavioralStats.patterns}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Anomalies</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{behavioralStats.anomalies}</p>
                  </div>
                  <Eye className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-800 dark:text-cyan-300">Avg Risk Score</p>
                    <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{behavioralStats.averageRiskScore.toFixed(1)}</p>
                  </div>
                  <Gauge className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Advanced Settings Panel */}
      <AnimatePresence>
        {state.showAdvancedSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
          >
            <div className="p-4">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="time-range">Time Range</Label>
                  <Select 
                    value={state.selectedTimeRange} 
                    onValueChange={(value) => dispatch({ type: 'SET_SELECTED_TIME_RANGE', payload: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="6h">Last 6 Hours</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Risk Levels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {BEHAVIORAL_RISK_LEVELS.map((level) => (
                      <Badge
                        key={level}
                        variant={state.selectedRiskLevels.includes(level) ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer",
                          getRiskColor(level)
                        )}
                        onClick={() => {
                          const updated = state.selectedRiskLevels.includes(level)
                            ? state.selectedRiskLevels.filter(l => l !== level)
                            : [...state.selectedRiskLevels, level];
                          dispatch({ type: 'SET_SELECTED_RISK_LEVELS', payload: updated });
                        }}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>View Mode</Label>
                  <Select 
                    value={state.viewMode} 
                    onValueChange={(value: 'profiles' | 'patterns' | 'timeline' | 'heatmap') => dispatch({ type: 'SET_VIEW_MODE', payload: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profiles">Profiles View</SelectItem>
                      <SelectItem value="patterns">Patterns View</SelectItem>
                      <SelectItem value="timeline">Timeline View</SelectItem>
                      <SelectItem value="heatmap">Heatmap View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Display Options</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-predictions"
                        checked={state.showPredictions}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_SHOW_PREDICTIONS', payload: checked })}
                      />
                      <Label htmlFor="show-predictions" className="text-sm">
                        Show Predictions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-baselines"
                        checked={state.showBaselines}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_SHOW_BASELINES', payload: checked })}
                      />
                      <Label htmlFor="show-baselines" className="text-sm">
                        Show Baselines
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Auto Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-analysis"
                        checked={state.autoAnalysis}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_AUTO_ANALYSIS', payload: checked })}
                      />
                      <Label htmlFor="auto-analysis" className="text-sm">
                        Auto Analysis
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-refresh"
                        checked={state.autoRefresh}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_AUTO_REFRESH', payload: checked })}
                      />
                      <Label htmlFor="auto-refresh" className="text-sm">
                        Auto Refresh
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={state.activeTab} onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_TAB', payload: value })} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-6 mx-6 mt-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Profiles</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Anomalies</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Models</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-auto p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-full">
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* Behavioral Timeline */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Behavioral Timeline</span>
                    </CardTitle>
                    <CardDescription>
                      Real-time behavioral activity and risk analysis over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]" ref={chartRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(value) => formatDate(value)}
                          />
                          <YAxis />
                          <RechartsTooltip 
                            labelFormatter={(value) => formatDate(value)}
                            formatter={(value: number, name: string) => [
                              typeof value === 'number' ? value.toFixed(2) : value,
                              name
                            ]}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="riskScore" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Risk Score"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="confidence" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Confidence"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="activityLevel" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            name="Activity Level"
                          />
                          {state.showPredictions && (
                            <Line 
                              type="monotone" 
                              dataKey="anomalyScore" 
                              stroke="#f59e0b" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              name="Anomaly Score"
                            />
                          )}
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Risk Analysis Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Risk Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Risk Level</span>
                        <span className="text-sm font-bold">{behavioralStats.averageRiskScore.toFixed(1)}</span>
                      </div>
                      <Progress value={behavioralStats.averageRiskScore * 10} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Avg Confidence</span>
                        <span className="text-sm font-bold">{(behavioralStats.averageConfidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={behavioralStats.averageConfidence * 100} className="h-2" />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Learning Profiles</span>
                        <span className="text-sm font-bold">{behavioralStats.learning}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active Alerts</span>
                        <span className="text-sm font-bold">{behavioralStats.alerts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Predictions</span>
                        <span className="text-sm font-bold">{behavioralStats.predictions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Update</span>
                        <span className="text-sm">{formatDate(state.lastUpdate)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => dispatch({ type: 'SET_SHOW_RISK_MATRIX', payload: true })}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Risk Matrix
                      </Button>
                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => dispatch({ type: 'SET_SHOW_MODEL_BUILDER', payload: true })}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Build Model
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Profiles Tab */}
            <TabsContent value="profiles" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Behavioral Profiles</CardTitle>
                      <CardDescription>
                        Comprehensive view of all user behavioral profiles
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search profiles..."
                          className="w-64"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => dispatch({ type: 'SET_SHOW_MODEL_BUILDER', payload: true })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    <DataTable
                      data={filteredProfiles}
                      columns={[
                        {
                          accessorKey: 'userId',
                          header: 'User ID',
                          cell: ({ row }) => (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span className="font-mono text-sm">{row.getValue('userId')}</span>
                            </div>
                          )
                        },
                        {
                          accessorKey: 'riskLevel',
                          header: 'Risk Level',
                          cell: ({ row }) => (
                            <Badge 
                              variant="outline"
                              className={getRiskColor(row.getValue('riskLevel'))}
                            >
                              {row.getValue('riskLevel')}
                            </Badge>
                          )
                        },
                        {
                          accessorKey: 'riskScore',
                          header: 'Risk Score',
                          cell: ({ row }) => {
                            const score = row.getValue('riskScore') as number;
                            return (
                              <div className="flex items-center space-x-2">
                                <Progress value={score * 10} className="w-16 h-2" />
                                <span className="text-sm font-medium">
                                  {score.toFixed(1)}
                                </span>
                              </div>
                            );
                          }
                        },
                        {
                          accessorKey: 'confidence',
                          header: 'Confidence',
                          cell: ({ row }) => {
                            const confidence = row.getValue('confidence') as number;
                            return (
                              <div className="flex items-center space-x-2">
                                <Progress value={confidence * 100} className="w-16 h-2" />
                                <span className="text-sm font-medium">
                                  {(confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            );
                          }
                        },
                        {
                          accessorKey: 'lastActivity',
                          header: 'Last Activity',
                          cell: ({ row }) => formatDate(row.getValue('lastActivity'))
                        },
                        {
                          accessorKey: 'status',
                          header: 'Status',
                          cell: ({ row }) => (
                            <Badge 
                              variant="outline"
                              className={getStatusColor(row.getValue('status'))}
                            >
                              {row.getValue('status')}
                            </Badge>
                          )
                        },
                        {
                          id: 'actions',
                          header: 'Actions',
                          cell: ({ row }) => (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  onClick={() => dispatch({ type: 'SET_SELECTED_PROFILE', payload: row.original })}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleAnalyzeProfile(row.original.id)}
                                >
                                  Analyze Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleCreateBaseline(row.original.userId)}
                                >
                                  Create Baseline
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  Export Profile
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Additional tabs would continue here... */}
          </div>
        </Tabs>
      </div>
      
      {/* Profile Details Modal */}
      <Dialog 
        open={!!state.selectedProfile} 
        onOpenChange={(open) => !open && dispatch({ type: 'SET_SELECTED_PROFILE', payload: null })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {state.selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Behavioral Profile Details</span>
                </DialogTitle>
                <DialogDescription>
                  Comprehensive behavioral analysis for user {state.selectedProfile.userId}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Profile Information */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>User ID</Label>
                        <p className="font-mono text-sm">{state.selectedProfile.userId}</p>
                      </div>
                      <div>
                        <Label>Profile Type</Label>
                        <Badge variant="secondary">
                          {state.selectedProfile.profileType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Risk Level</Label>
                          <Badge 
                            variant="outline"
                            className={getRiskColor(state.selectedProfile.riskLevel)}
                          >
                            {state.selectedProfile.riskLevel}
                          </Badge>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Badge 
                            variant="outline"
                            className={getStatusColor(state.selectedProfile.status)}
                          >
                            {state.selectedProfile.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Created</Label>
                          <p className="text-sm">{formatDate(state.selectedProfile.createdAt)}</p>
                        </div>
                        <div>
                          <Label>Last Activity</Label>
                          <p className="text-sm">{formatDate(state.selectedProfile.lastActivity)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Risk Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Risk Score</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={state.selectedProfile.riskScore * 10} className="flex-1 h-2" />
                          <span className="text-sm font-medium">
                            {state.selectedProfile.riskScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label>Confidence</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={state.selectedProfile.confidence * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">
                            {(state.selectedProfile.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label>Activity Level</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={state.selectedProfile.activityLevel * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">
                            {(state.selectedProfile.activityLevel * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label>Anomaly Score</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={state.selectedProfile.anomalyScore * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">
                            {(state.selectedProfile.anomalyScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={() => handleAnalyzeProfile(state.selectedProfile!.id)}
                      disabled={state.isAnalyzing}
                    >
                      {state.isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Analyze Profile
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleCreateBaseline(state.selectedProfile!.userId)}
                      disabled={state.isLearning}
                    >
                      {state.isLearning ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Create Baseline
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      View Patterns
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      Export Profile
                    </Button>
                    <Button variant="outline">
                      Share Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BehavioralAnalyzer;