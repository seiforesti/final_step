/**
 * 🧠 Contextual Intelligence - Advanced Context Awareness & Intelligence Engine
 * ===========================================================================
 * 
 * Enterprise-grade contextual intelligence system that provides deep context awareness,
 * environmental understanding, and intelligent contextual analysis for scanning operations.
 * 
 * Features:
 * - Advanced contextual analysis and understanding
 * - Real-time environmental awareness
 * - Intelligent context-driven recommendations
 * - Cross-system context correlation
 * - Behavioral context profiling
 * - Semantic context understanding
 * - Dynamic context adaptation
 * - Comprehensive contextual reporting
 * 
 * @author Enterprise Data Governance Team
 * @version 2.0.0 - Production Enterprise Ready
 * @component ContextualIntelligence
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, Layers, Network, Target, Activity, TrendingUp, BarChart3, PieChart, LineChart, Settings, RefreshCw, Download, Upload, Play, Pause, Square, CheckCircle, XCircle, Clock, Calendar, Database, Server, Cpu, HardDrive, Shield, Lock, Unlock, GitBranch, Box, Grid, List, MoreHorizontal, ChevronDown, ChevronRight, ChevronLeft, ExternalLink, Info, HelpCircle, Star, Bookmark, Share, Copy, Edit, Trash2, Plus, Minus, Maximize, Minimize, RotateCcw, Save, Send, MessageSquare, Users, User, MapPin, Globe, Wifi, WifiOff, Signal, Battery, Bluetooth, Volume2, VolumeX, Camera, Video, Image, FileText, File, Folder, FolderOpen, Archive, Package, Layers3, Component, Puzzle, Zap, AlertTriangle, Filter, Search, Gauge, Radar, Compass, Map, Lightbulb, BookOpen, Code, Workflow, Link, Timer, Crosshair, Focus } from 'lucide-react';

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
  PolarAngleAxis, PolarRadiusAxis, Treemap, Sankey, FunnelChart, Funnel, LabelList,
  ReferenceLine, ReferenceArea, Brush
} from 'recharts';

// Types and Interfaces
import { 
  ContextualInsight, ContextType, ContextualAnalysis, EnvironmentalContext, BehavioralContext,
  SemanticContext, TemporalContext, SystemContext, UserContext, DataContext, SecurityContext,
  ContextualRecommendation, ContextCorrelation, ContextualTrend, ContextualPattern,
  ContextualAnomaly, ContextualRule, ContextualAlert, ContextualMetric, ContextualScore,
  ContextualProfile, ContextualMapping, ContextualHierarchy, ContextualDependency,
  ContextualVisualization, ContextualReport, ContextualConfiguration, ContextualModel
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
import { cn } from '@/lib copie/utils';
import { formatDate, formatDuration, formatBytes, formatNumber, formatPercentage } from '@/utils/formatters';
import { generateColor, getStatusColor, getSeverityColor, getContextTypeColor } from '@/utils/colors';
import { 
  CONTEXT_TYPES, CONTEXT_CATEGORIES, CONTEXT_PRIORITIES, CONTEXT_SCOPES, CONTEXT_LEVELS,
  CONTEXTUAL_ALGORITHMS, SEMANTIC_MODELS, BEHAVIORAL_PATTERNS, DEFAULT_CONTEXT_SETTINGS
} from '../../constants/intelligence-constants';

// Component State Interface
interface ContextualIntelligenceState {
  // Analysis Status
  isAnalyzing: boolean;
  isLearning: boolean;
  isProcessing: boolean;
  lastUpdate: Date;
  
  // Contextual Data
  contexts: ContextualInsight[];
  activeContexts: ContextualInsight[];
  environmentalContexts: EnvironmentalContext[];
  behavioralContexts: BehavioralContext[];
  semanticContexts: SemanticContext[];
  temporalContexts: TemporalContext[];
  
  // Analysis Results
  contextualAnalyses: ContextualAnalysis[];
  recommendations: ContextualRecommendation[];
  correlations: ContextCorrelation[];
  trends: ContextualTrend[];
  patterns: ContextualPattern[];
  anomalies: ContextualAnomaly[];
  
  // Models and Configuration
  contextualModels: ContextualModel[];
  configurations: ContextualConfiguration[];
  profiles: ContextualProfile[];
  mappings: ContextualMapping[];
  hierarchies: ContextualHierarchy[];
  dependencies: ContextualDependency[];
  
  // Filtering and Views
  selectedContextTypes: ContextType[];
  selectedCategories: string[];
  selectedPriorities: string[];
  selectedScopes: string[];
  timeWindow: string;
  
  // UI State
  activeTab: string;
  selectedContext: ContextualInsight | null;
  selectedAnalysis: ContextualAnalysis | null;
  showContextDetails: boolean;
  showAdvancedSettings: boolean;
  showContextBuilder: boolean;
  showMappingView: boolean;
  
  // Real-time State
  liveContexts: boolean;
  autoAnalysis: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Visualization State
  viewMode: 'grid' | 'list' | 'network' | 'hierarchy';
  chartType: string;
  showRelationships: boolean;
  showHierarchy: boolean;
  zoomLevel: number;
  focusContext: string | null;
  
  // Error Handling
  errors: any[];
  warnings: any[];
  status: 'idle' | 'loading' | 'success' | 'error';
}

// Reducer Actions
type ContextualIntelligenceAction = 
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_LEARNING'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_LAST_UPDATE'; payload: Date }
  | { type: 'SET_CONTEXTS'; payload: ContextualInsight[] }
  | { type: 'ADD_CONTEXT'; payload: ContextualInsight }
  | { type: 'UPDATE_CONTEXT'; payload: { id: string; updates: Partial<ContextualInsight> } }
  | { type: 'SET_ACTIVE_CONTEXTS'; payload: ContextualInsight[] }
  | { type: 'SET_ENVIRONMENTAL_CONTEXTS'; payload: EnvironmentalContext[] }
  | { type: 'SET_BEHAVIORAL_CONTEXTS'; payload: BehavioralContext[] }
  | { type: 'SET_SEMANTIC_CONTEXTS'; payload: SemanticContext[] }
  | { type: 'SET_TEMPORAL_CONTEXTS'; payload: TemporalContext[] }
  | { type: 'SET_CONTEXTUAL_ANALYSES'; payload: ContextualAnalysis[] }
  | { type: 'SET_RECOMMENDATIONS'; payload: ContextualRecommendation[] }
  | { type: 'SET_CORRELATIONS'; payload: ContextCorrelation[] }
  | { type: 'SET_TRENDS'; payload: ContextualTrend[] }
  | { type: 'SET_PATTERNS'; payload: ContextualPattern[] }
  | { type: 'SET_ANOMALIES'; payload: ContextualAnomaly[] }
  | { type: 'SET_CONTEXTUAL_MODELS'; payload: ContextualModel[] }
  | { type: 'SET_CONFIGURATIONS'; payload: ContextualConfiguration[] }
  | { type: 'SET_PROFILES'; payload: ContextualProfile[] }
  | { type: 'SET_MAPPINGS'; payload: ContextualMapping[] }
  | { type: 'SET_HIERARCHIES'; payload: ContextualHierarchy[] }
  | { type: 'SET_DEPENDENCIES'; payload: ContextualDependency[] }
  | { type: 'SET_SELECTED_CONTEXT_TYPES'; payload: ContextType[] }
  | { type: 'SET_SELECTED_CATEGORIES'; payload: string[] }
  | { type: 'SET_SELECTED_PRIORITIES'; payload: string[] }
  | { type: 'SET_SELECTED_SCOPES'; payload: string[] }
  | { type: 'SET_TIME_WINDOW'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_SELECTED_CONTEXT'; payload: ContextualInsight | null }
  | { type: 'SET_SELECTED_ANALYSIS'; payload: ContextualAnalysis | null }
  | { type: 'SET_SHOW_CONTEXT_DETAILS'; payload: boolean }
  | { type: 'SET_SHOW_ADVANCED_SETTINGS'; payload: boolean }
  | { type: 'SET_SHOW_CONTEXT_BUILDER'; payload: boolean }
  | { type: 'SET_SHOW_MAPPING_VIEW'; payload: boolean }
  | { type: 'SET_LIVE_CONTEXTS'; payload: boolean }
  | { type: 'SET_AUTO_ANALYSIS'; payload: boolean }
  | { type: 'SET_AUTO_REFRESH'; payload: boolean }
  | { type: 'SET_REFRESH_INTERVAL'; payload: number }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' | 'network' | 'hierarchy' }
  | { type: 'SET_CHART_TYPE'; payload: string }
  | { type: 'SET_SHOW_RELATIONSHIPS'; payload: boolean }
  | { type: 'SET_SHOW_HIERARCHY'; payload: boolean }
  | { type: 'SET_ZOOM_LEVEL'; payload: number }
  | { type: 'SET_FOCUS_CONTEXT'; payload: string | null }
  | { type: 'ADD_ERROR'; payload: any }
  | { type: 'ADD_WARNING'; payload: any }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'CLEAR_WARNINGS' }
  | { type: 'SET_STATUS'; payload: 'idle' | 'loading' | 'success' | 'error' };

// Reducer
const contextualIntelligenceReducer = (state: ContextualIntelligenceState, action: ContextualIntelligenceAction): ContextualIntelligenceState => {
  switch (action.type) {
    case 'SET_ANALYZING': return { ...state, isAnalyzing: action.payload };
    case 'SET_LEARNING': return { ...state, isLearning: action.payload };
    case 'SET_PROCESSING': return { ...state, isProcessing: action.payload };
    case 'SET_LAST_UPDATE': return { ...state, lastUpdate: action.payload };
    case 'SET_CONTEXTS': return { ...state, contexts: action.payload };
    case 'ADD_CONTEXT': return { ...state, contexts: [action.payload, ...state.contexts] };
    case 'UPDATE_CONTEXT':
      return {
        ...state,
        contexts: state.contexts.map(context => 
          context.id === action.payload.id 
            ? { ...context, ...action.payload.updates }
            : context
        )
      };
    case 'SET_ACTIVE_CONTEXTS': return { ...state, activeContexts: action.payload };
    case 'SET_ENVIRONMENTAL_CONTEXTS': return { ...state, environmentalContexts: action.payload };
    case 'SET_BEHAVIORAL_CONTEXTS': return { ...state, behavioralContexts: action.payload };
    case 'SET_SEMANTIC_CONTEXTS': return { ...state, semanticContexts: action.payload };
    case 'SET_TEMPORAL_CONTEXTS': return { ...state, temporalContexts: action.payload };
    case 'SET_CONTEXTUAL_ANALYSES': return { ...state, contextualAnalyses: action.payload };
    case 'SET_RECOMMENDATIONS': return { ...state, recommendations: action.payload };
    case 'SET_CORRELATIONS': return { ...state, correlations: action.payload };
    case 'SET_TRENDS': return { ...state, trends: action.payload };
    case 'SET_PATTERNS': return { ...state, patterns: action.payload };
    case 'SET_ANOMALIES': return { ...state, anomalies: action.payload };
    case 'SET_CONTEXTUAL_MODELS': return { ...state, contextualModels: action.payload };
    case 'SET_CONFIGURATIONS': return { ...state, configurations: action.payload };
    case 'SET_PROFILES': return { ...state, profiles: action.payload };
    case 'SET_MAPPINGS': return { ...state, mappings: action.payload };
    case 'SET_HIERARCHIES': return { ...state, hierarchies: action.payload };
    case 'SET_DEPENDENCIES': return { ...state, dependencies: action.payload };
    case 'SET_SELECTED_CONTEXT_TYPES': return { ...state, selectedContextTypes: action.payload };
    case 'SET_SELECTED_CATEGORIES': return { ...state, selectedCategories: action.payload };
    case 'SET_SELECTED_PRIORITIES': return { ...state, selectedPriorities: action.payload };
    case 'SET_SELECTED_SCOPES': return { ...state, selectedScopes: action.payload };
    case 'SET_TIME_WINDOW': return { ...state, timeWindow: action.payload };
    case 'SET_ACTIVE_TAB': return { ...state, activeTab: action.payload };
    case 'SET_SELECTED_CONTEXT': return { ...state, selectedContext: action.payload };
    case 'SET_SELECTED_ANALYSIS': return { ...state, selectedAnalysis: action.payload };
    case 'SET_SHOW_CONTEXT_DETAILS': return { ...state, showContextDetails: action.payload };
    case 'SET_SHOW_ADVANCED_SETTINGS': return { ...state, showAdvancedSettings: action.payload };
    case 'SET_SHOW_CONTEXT_BUILDER': return { ...state, showContextBuilder: action.payload };
    case 'SET_SHOW_MAPPING_VIEW': return { ...state, showMappingView: action.payload };
    case 'SET_LIVE_CONTEXTS': return { ...state, liveContexts: action.payload };
    case 'SET_AUTO_ANALYSIS': return { ...state, autoAnalysis: action.payload };
    case 'SET_AUTO_REFRESH': return { ...state, autoRefresh: action.payload };
    case 'SET_REFRESH_INTERVAL': return { ...state, refreshInterval: action.payload };
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.payload };
    case 'SET_CHART_TYPE': return { ...state, chartType: action.payload };
    case 'SET_SHOW_RELATIONSHIPS': return { ...state, showRelationships: action.payload };
    case 'SET_SHOW_HIERARCHY': return { ...state, showHierarchy: action.payload };
    case 'SET_ZOOM_LEVEL': return { ...state, zoomLevel: action.payload };
    case 'SET_FOCUS_CONTEXT': return { ...state, focusContext: action.payload };
    case 'ADD_ERROR': return { ...state, errors: [...state.errors, action.payload] };
    case 'ADD_WARNING': return { ...state, warnings: [...state.warnings, action.payload] };
    case 'CLEAR_ERRORS': return { ...state, errors: [] };
    case 'CLEAR_WARNINGS': return { ...state, warnings: [] };
    case 'SET_STATUS': return { ...state, status: action.payload };
    default: return state;
  }
};

// Initial state
const initialState: ContextualIntelligenceState = {
  isAnalyzing: false,
  isLearning: false,
  isProcessing: false,
  lastUpdate: new Date(),
  contexts: [],
  activeContexts: [],
  environmentalContexts: [],
  behavioralContexts: [],
  semanticContexts: [],
  temporalContexts: [],
  contextualAnalyses: [],
  recommendations: [],
  correlations: [],
  trends: [],
  patterns: [],
  anomalies: [],
  contextualModels: [],
  configurations: [],
  profiles: [],
  mappings: [],
  hierarchies: [],
  dependencies: [],
  selectedContextTypes: [],
  selectedCategories: [],
  selectedPriorities: [],
  selectedScopes: [],
  timeWindow: '24h',
  activeTab: 'overview',
  selectedContext: null,
  selectedAnalysis: null,
  showContextDetails: false,
  showAdvancedSettings: false,
  showContextBuilder: false,
  showMappingView: false,
  liveContexts: false,
  autoAnalysis: true,
  autoRefresh: true,
  refreshInterval: 30000,
  viewMode: 'grid',
  chartType: 'network',
  showRelationships: true,
  showHierarchy: true,
  zoomLevel: 1,
  focusContext: null,
  errors: [],
  warnings: [],
  status: 'idle'
};

/**
 * ContextualIntelligence Component
 * Advanced context awareness and intelligent contextual analysis system
 */
export const ContextualIntelligence: React.FC = () => {
  // State Management
  const [state, dispatch] = useReducer(contextualIntelligenceReducer, initialState);
  
  // Hooks
  const { 
    getContextualInsights, getContextualAnalysis, generateContextualRecommendations,
    analyzeContextualPatterns, detectContextualAnomalies, trainContextualModel
  } = useScanIntelligence();
  
  const { 
    getContextualTrends, getContextualCorrelations, getSemanticAnalysis,
    getBehavioralAnalysis, getEnvironmentalAnalysis
  } = useAdvancedAnalytics();
  
  const { notify } = useNotifications();
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  
  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  
  // Memoized calculations
  const filteredContexts = useMemo(() => {
    let filtered = state.contexts;
    
    if (state.selectedContextTypes.length > 0) {
      filtered = filtered.filter(context => 
        state.selectedContextTypes.includes(context.type)
      );
    }
    
    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter(context => 
        state.selectedCategories.includes(context.category)
      );
    }
    
    if (state.selectedPriorities.length > 0) {
      filtered = filtered.filter(context => 
        state.selectedPriorities.includes(context.priority)
      );
    }
    
    if (state.selectedScopes.length > 0) {
      filtered = filtered.filter(context => 
        state.selectedScopes.includes(context.scope)
      );
    }
    
    return filtered;
  }, [state.contexts, state.selectedContextTypes, state.selectedCategories, state.selectedPriorities, state.selectedScopes]);
  
  const contextualStats = useMemo(() => {
    const total = filteredContexts.length;
    const active = filteredContexts.filter(c => c.status === 'active').length;
    const learning = filteredContexts.filter(c => c.isLearning).length;
    const processing = filteredContexts.filter(c => c.isProcessing).length;
    
    const byType = CONTEXT_TYPES.reduce((acc, type) => {
      acc[type] = filteredContexts.filter(c => c.type === type).length;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = CONTEXT_PRIORITIES.reduce((acc, priority) => {
      acc[priority] = filteredContexts.filter(c => c.priority === priority).length;
      return acc;
    }, {} as Record<string, number>);
    
    const averageConfidence = total > 0 
      ? filteredContexts.reduce((sum, c) => sum + c.confidence, 0) / total 
      : 0;
    
    const averageRelevance = total > 0 
      ? filteredContexts.reduce((sum, c) => sum + c.relevance, 0) / total 
      : 0;
    
    return {
      total,
      active,
      learning,
      processing,
      byType,
      byPriority,
      averageConfidence,
      averageRelevance,
      recommendations: state.recommendations.length,
      correlations: state.correlations.length,
      patterns: state.patterns.length,
      anomalies: state.anomalies.length
    };
  }, [filteredContexts, state.recommendations, state.correlations, state.patterns, state.anomalies]);
  
  const networkData = useMemo(() => {
    const nodes = filteredContexts.map(context => ({
      id: context.id,
      label: context.name,
      type: context.type,
      category: context.category,
      priority: context.priority,
      confidence: context.confidence,
      relevance: context.relevance,
      x: Math.random() * 800,
      y: Math.random() * 600
    }));
    
    const edges = state.correlations
      .filter(corr => 
        filteredContexts.some(c => c.id === corr.sourceContextId) &&
        filteredContexts.some(c => c.id === corr.targetContextId)
      )
      .map(corr => ({
        source: corr.sourceContextId,
        target: corr.targetContextId,
        strength: corr.strength,
        type: corr.type
      }));
    
    return { nodes, edges };
  }, [filteredContexts, state.correlations]);
  
  // Event Handlers
  const handleStartAnalysis = useCallback(async () => {
    try {
      dispatch({ type: 'SET_STATUS', payload: 'loading' });
      dispatch({ type: 'SET_ANALYZING', payload: true });
      
      await initializeContextualAnalysis();
      
      dispatch({ type: 'SET_STATUS', payload: 'success' });
      notify({
        title: 'Contextual Analysis Started',
        message: 'Advanced contextual intelligence analysis is now active',
        type: 'success'
      });
    } catch (error) {
      dispatch({ type: 'SET_STATUS', payload: 'error' });
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Analysis Start Failed',
        message: 'Failed to start contextual analysis',
        type: 'error'
      });
    }
  }, [notify]);
  
  const handleStopAnalysis = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ANALYZING', payload: false });
      dispatch({ type: 'SET_LIVE_CONTEXTS', payload: false });
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      notify({
        title: 'Contextual Analysis Stopped',
        message: 'Real-time contextual analysis has been stopped',
        type: 'info'
      });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [notify]);
  
  const handleAnalyzeContext = useCallback(async (contextId: string) => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const analysis = await getContextualAnalysis(contextId);
      
      if (analysis) {
        dispatch({ type: 'SET_CONTEXTUAL_ANALYSES', payload: [...state.contextualAnalyses, analysis] });
        
        notify({
          title: 'Context Analyzed',
          message: `Context analysis completed for ${contextId}`,
          type: 'success'
        });
      }
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Analysis Failed',
        message: 'Failed to analyze the selected context',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [getContextualAnalysis, state.contextualAnalyses, notify]);
  
  const handleGenerateRecommendations = useCallback(async () => {
    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      
      const recommendations = await generateContextualRecommendations({
        contexts: filteredContexts.map(c => c.id),
        timeWindow: state.timeWindow,
        includePatterns: true,
        includeAnomalies: true
      });
      
      dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
      
      notify({
        title: 'Recommendations Generated',
        message: `Generated ${recommendations.length} contextual recommendations`,
        type: 'success'
      });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Recommendation Failed',
        message: 'Failed to generate contextual recommendations',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [generateContextualRecommendations, filteredContexts, state.timeWindow, notify]);
  
  const handleTrainModel = useCallback(async (modelId: string, configuration: any) => {
    try {
      dispatch({ type: 'SET_LEARNING', payload: true });
      
      const result = await trainContextualModel(modelId, configuration);
      
      if (result.success) {
        await loadContextualModels();
        
        notify({
          title: 'Model Training Complete',
          message: `Contextual model ${modelId} has been successfully trained`,
          type: 'success'
        });
      }
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Model Training Failed',
        message: 'Failed to train the contextual model',
        type: 'error'
      });
    } finally {
      dispatch({ type: 'SET_LEARNING', payload: false });
    }
  }, [trainContextualModel, notify]);
  
  const handleExportContexts = useCallback(() => {
    try {
      const exportData = {
        contexts: filteredContexts,
        analyses: state.contextualAnalyses,
        recommendations: state.recommendations,
        correlations: state.correlations,
        trends: state.trends,
        patterns: state.patterns,
        anomalies: state.anomalies,
        statistics: contextualStats,
        models: state.contextualModels,
        exportedAt: new Date().toISOString(),
        configuration: {
          timeWindow: state.timeWindow,
          contextTypes: state.selectedContextTypes,
          categories: state.selectedCategories,
          priorities: state.selectedPriorities,
          scopes: state.selectedScopes
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contextual-intelligence-report-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      notify({
        title: 'Export Complete',
        message: 'Contextual intelligence report has been exported',
        type: 'success'
      });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      notify({
        title: 'Export Failed',
        message: 'Failed to export contextual data',
        type: 'error'
      });
    }
  }, [filteredContexts, state, contextualStats, notify]);
  
  // Data Loading Functions
  const loadContextualInsights = useCallback(async () => {
    try {
      const insights = await getContextualInsights({
        timeWindow: state.timeWindow,
        types: state.selectedContextTypes,
        categories: state.selectedCategories,
        includeInactive: false,
        limit: 1000
      });
      
      dispatch({ type: 'SET_CONTEXTS', payload: insights });
      
      const active = insights.filter(insight => insight.status === 'active');
      dispatch({ type: 'SET_ACTIVE_CONTEXTS', payload: active });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getContextualInsights, state.timeWindow, state.selectedContextTypes, state.selectedCategories]);
  
  const loadContextualModels = useCallback(async () => {
    try {
      // This would typically come from the intelligence service
      const models: ContextualModel[] = [];
      dispatch({ type: 'SET_CONTEXTUAL_MODELS', payload: models });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, []);
  
  const loadAnalytics = useCallback(async () => {
    try {
      const [trends, correlations, patterns, anomalies] = await Promise.all([
        getContextualTrends(state.timeWindow),
        getContextualCorrelations(),
        analyzeContextualPatterns(),
        detectContextualAnomalies()
      ]);
      
      dispatch({ type: 'SET_TRENDS', payload: trends });
      dispatch({ type: 'SET_CORRELATIONS', payload: correlations });
      dispatch({ type: 'SET_PATTERNS', payload: patterns });
      dispatch({ type: 'SET_ANOMALIES', payload: anomalies });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getContextualTrends, getContextualCorrelations, analyzeContextualPatterns, detectContextualAnomalies, state.timeWindow]);
  
  const loadSpecializedContexts = useCallback(async () => {
    try {
      const [environmental, behavioral, semantic] = await Promise.all([
        getEnvironmentalAnalysis(),
        getBehavioralAnalysis(),
        getSemanticAnalysis()
      ]);
      
      dispatch({ type: 'SET_ENVIRONMENTAL_CONTEXTS', payload: environmental });
      dispatch({ type: 'SET_BEHAVIORAL_CONTEXTS', payload: behavioral });
      dispatch({ type: 'SET_SEMANTIC_CONTEXTS', payload: semantic });
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
    }
  }, [getEnvironmentalAnalysis, getBehavioralAnalysis, getSemanticAnalysis]);
  
  const initializeContextualAnalysis = useCallback(async () => {
    try {
      await Promise.all([
        loadContextualInsights(),
        loadContextualModels(),
        loadAnalytics(),
        loadSpecializedContexts()
      ]);
      
      if (isConnected) {
        subscribe('context_detected', (data: ContextualInsight) => {
          dispatch({ type: 'ADD_CONTEXT', payload: data });
          
          if (data.priority === 'critical' || data.priority === 'high') {
            notify({
              title: 'High-Priority Context Detected',
              message: `${data.type}: ${data.name}`,
              type: 'warning'
            });
          }
        });
        
        subscribe('context_updated', (data: { id: string; updates: Partial<ContextualInsight> }) => {
          dispatch({ type: 'UPDATE_CONTEXT', payload: data });
        });
        
        subscribe('model_updated', () => {
          loadContextualModels();
        });
      }
      
      if (state.autoRefresh && !refreshIntervalRef.current) {
        refreshIntervalRef.current = setInterval(() => {
          loadContextualInsights();
          loadAnalytics();
          dispatch({ type: 'SET_LAST_UPDATE', payload: new Date() });
        }, state.refreshInterval);
      }
      
      dispatch({ type: 'SET_LIVE_CONTEXTS', payload: true });
      
    } catch (error) {
      dispatch({ type: 'ADD_ERROR', payload: error });
      throw error;
    }
  }, [
    isConnected, subscribe, loadContextualInsights, loadContextualModels, 
    loadAnalytics, loadSpecializedContexts, state.autoRefresh, state.refreshInterval, notify
  ]);
  
  // Effects
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      if (isConnected) {
        unsubscribe('context_detected');
        unsubscribe('context_updated');
        unsubscribe('model_updated');
      }
    };
  }, [isConnected, unsubscribe]);
  
  useEffect(() => {
    loadContextualInsights();
    loadContextualModels();
    loadAnalytics();
    loadSpecializedContexts();
  }, [loadContextualInsights, loadContextualModels, loadAnalytics, loadSpecializedContexts]);
  
  useEffect(() => {
    if (state.autoRefresh && state.isAnalyzing) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        loadContextualInsights();
        loadAnalytics();
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
  }, [state.autoRefresh, state.isAnalyzing, state.refreshInterval, loadContextualInsights, loadAnalytics]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900">
      {/* Header Section */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                {state.isAnalyzing && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Contextual Intelligence
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Advanced context awareness and intelligent contextual analysis
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
                  state.isAnalyzing && "bg-indigo-600 hover:bg-indigo-700"
                )}
              >
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  state.isAnalyzing ? "bg-indigo-200 animate-pulse" : "bg-slate-400"
                )} />
                <span>{state.isAnalyzing ? 'Analyzing' : 'Inactive'}</span>
              </Badge>
              
              {state.liveContexts && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Activity className="h-3 w-3" />
                  <span>Live</span>
                </Badge>
              )}
              
              {state.isLearning && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Lightbulb className="h-3 w-3 animate-pulse" />
                  <span>Learning</span>
                </Badge>
              )}
              
              {state.isProcessing && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Cpu className="h-3 w-3 animate-spin" />
                  <span>Processing</span>
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
                      onClick={() => dispatch({ type: 'SET_SHOW_MAPPING_VIEW', payload: !state.showMappingView })}
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Context Mapping</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateRecommendations}
                      disabled={state.isProcessing}
                    >
                      {state.isProcessing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lightbulb className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Generate Recommendations</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportContexts}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Contexts</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button
                onClick={state.isAnalyzing ? handleStopAnalysis : handleStartAnalysis}
                disabled={state.status === 'loading'}
                className={cn(
                  "min-w-[140px]",
                  state.isAnalyzing 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
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
            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Total Contexts</p>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{contextualStats.total}</p>
                  </div>
                  <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">Active Contexts</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{contextualStats.active}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Correlations</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{contextualStats.correlations}</p>
                  </div>
                  <Network className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Patterns</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{contextualStats.patterns}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Avg Confidence</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{(contextualStats.averageConfidence * 100).toFixed(1)}%</p>
                  </div>
                  <Gauge className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-800 dark:text-cyan-300">Recommendations</p>
                    <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{contextualStats.recommendations}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
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
                  <Label htmlFor="time-window">Time Window</Label>
                  <Select 
                    value={state.timeWindow} 
                    onValueChange={(value) => dispatch({ type: 'SET_TIME_WINDOW', payload: value })}
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
                  <Label>Context Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CONTEXT_TYPES.map((type) => (
                      <Badge
                        key={type}
                        variant={state.selectedContextTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const updated = state.selectedContextTypes.includes(type)
                            ? state.selectedContextTypes.filter(t => t !== type)
                            : [...state.selectedContextTypes, type];
                          dispatch({ type: 'SET_SELECTED_CONTEXT_TYPES', payload: updated });
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>View Mode</Label>
                  <Select 
                    value={state.viewMode} 
                    onValueChange={(value: 'grid' | 'list' | 'network' | 'hierarchy') => dispatch({ type: 'SET_VIEW_MODE', payload: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="network">Network View</SelectItem>
                      <SelectItem value="hierarchy">Hierarchy View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Display Options</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-relationships"
                        checked={state.showRelationships}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_SHOW_RELATIONSHIPS', payload: checked })}
                      />
                      <Label htmlFor="show-relationships" className="text-sm">
                        Show Relationships
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-hierarchy"
                        checked={state.showHierarchy}
                        onCheckedChange={(checked) => dispatch({ type: 'SET_SHOW_HIERARCHY', payload: checked })}
                      />
                      <Label htmlFor="show-hierarchy" className="text-sm">
                        Show Hierarchy
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
            <TabsTrigger value="contexts" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Contexts</span>
            </TabsTrigger>
            <TabsTrigger value="correlations" className="flex items-center space-x-2">
              <Network className="h-4 w-4" />
              <span>Correlations</span>
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
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
                {/* Context Network Visualization */}
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Network className="h-5 w-5" />
                      <span>Context Network</span>
                    </CardTitle>
                    <CardDescription>
                      Interactive visualization of contextual relationships and dependencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]" ref={networkRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart data={networkData.nodes}>
                          <CartesianGrid />
                          <XAxis type="number" dataKey="x" hide />
                          <YAxis type="number" dataKey="y" hide />
                          <RechartsTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white dark:bg-slate-800 p-3 border rounded-lg shadow-lg">
                                    <p className="font-medium">{data.label}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Type: {data.type}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Category: {data.category}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Confidence: {(data.confidence * 100).toFixed(1)}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter 
                            dataKey="confidence" 
                            fill="#8884d8"
                            onClick={(data) => {
                              if (data) {
                                dispatch({ type: 'SET_FOCUS_CONTEXT', payload: data.id });
                              }
                            }}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Context Insights Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Live Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Context Coverage</span>
                        <span className="text-sm font-bold">{((contextualStats.active / Math.max(contextualStats.total, 1)) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(contextualStats.active / Math.max(contextualStats.total, 1)) * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Avg Confidence</span>
                        <span className="text-sm font-bold">{(contextualStats.averageConfidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={contextualStats.averageConfidence * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Avg Relevance</span>
                        <span className="text-sm font-bold">{(contextualStats.averageRelevance * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={contextualStats.averageRelevance * 100} className="h-2" />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Learning Contexts</span>
                        <span className="text-sm font-bold">{contextualStats.learning}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Processing Contexts</span>
                        <span className="text-sm font-bold">{contextualStats.processing}</span>
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
                        onClick={handleGenerateRecommendations}
                        disabled={state.isProcessing}
                      >
                        {state.isProcessing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-4 w-4 mr-2" />
                            Generate Insights
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => dispatch({ type: 'SET_SHOW_CONTEXT_BUILDER', payload: true })}
                      >
                        <Focus className="h-4 w-4 mr-2" />
                        Build Context
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Contexts Tab */}
            <TabsContent value="contexts" className="h-full">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Contextual Insights</CardTitle>
                      <CardDescription>
                        Comprehensive view of all detected contexts
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search contexts..."
                          className="w-64"
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => dispatch({ type: 'SET_SHOW_CONTEXT_BUILDER', payload: true })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px]">
                    {state.viewMode === 'list' ? (
                      <DataTable
                        data={filteredContexts}
                        columns={[
                          {
                            accessorKey: 'type',
                            header: 'Type',
                            cell: ({ row }) => (
                              <Badge 
                                variant="outline"
                                className={getContextTypeColor(row.getValue('type'))}
                              >
                                {row.getValue('type')}
                              </Badge>
                            )
                          },
                          {
                            accessorKey: 'name',
                            header: 'Name'
                          },
                          {
                            accessorKey: 'category',
                            header: 'Category',
                            cell: ({ row }) => (
                              <Badge variant="secondary">
                                {row.getValue('category')}
                              </Badge>
                            )
                          },
                          {
                            accessorKey: 'priority',
                            header: 'Priority',
                            cell: ({ row }) => (
                              <Badge 
                                variant="outline"
                                className={getSeverityColor(row.getValue('priority'))}
                              >
                                {row.getValue('priority')}
                              </Badge>
                            )
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
                            accessorKey: 'detectedAt',
                            header: 'Detected',
                            cell: ({ row }) => formatDate(row.getValue('detectedAt'))
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
                                    onClick={() => dispatch({ type: 'SET_SELECTED_CONTEXT', payload: row.original })}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleAnalyzeContext(row.original.id)}
                                  >
                                    Analyze Context
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Export Context
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    Mark as Primary
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )
                          }
                        ]}
                      />
                    ) : (
                      <div className="grid grid-cols-3 gap-4 h-full overflow-auto">
                        {filteredContexts.map((context) => (
                          <Card 
                            key={context.id}
                            className={cn(
                              "cursor-pointer hover:shadow-md transition-shadow",
                              state.focusContext === context.id && "ring-2 ring-indigo-500"
                            )}
                            onClick={() => dispatch({ type: 'SET_SELECTED_CONTEXT', payload: context })}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant="outline"
                                    className={getContextTypeColor(context.type)}
                                  >
                                    {context.type}
                                  </Badge>
                                  <Badge 
                                    variant="outline"
                                    className={getSeverityColor(context.priority)}
                                  >
                                    {context.priority}
                                  </Badge>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem 
                                      onClick={() => handleAnalyzeContext(context.id)}
                                    >
                                      Analyze
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Export
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <h4 className="font-medium mb-2">{context.name}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                {context.description}
                              </p>
                              
                              <div className="space-y-2">
                                <div>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span>Confidence</span>
                                    <span>{(context.confidence * 100).toFixed(1)}%</span>
                                  </div>
                                  <Progress value={context.confidence * 100} className="h-1" />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span>Relevance</span>
                                    <span>{(context.relevance * 100).toFixed(1)}%</span>
                                  </div>
                                  <Progress value={context.relevance * 100} className="h-1" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Additional tabs would continue here... */}
          </div>
        </Tabs>
      </div>
      
      {/* Context Details Modal */}
      <Dialog 
        open={!!state.selectedContext} 
        onOpenChange={(open) => !open && dispatch({ type: 'SET_SELECTED_CONTEXT', payload: null })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {state.selectedContext && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Context Details</span>
                </DialogTitle>
                <DialogDescription>
                  Comprehensive analysis and details for the selected context
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Context Information */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Context Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Name</Label>
                        <p className="font-medium">{state.selectedContext.name}</p>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {state.selectedContext.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type</Label>
                          <Badge 
                            variant="outline"
                            className={getContextTypeColor(state.selectedContext.type)}
                          >
                            {state.selectedContext.type}
                          </Badge>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Badge variant="secondary">
                            {state.selectedContext.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Priority</Label>
                          <Badge 
                            variant="outline"
                            className={getSeverityColor(state.selectedContext.priority)}
                          >
                            {state.selectedContext.priority}
                          </Badge>
                        </div>
                        <div>
                          <Label>Scope</Label>
                          <Badge variant="outline">
                            {state.selectedContext.scope}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Analysis Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Confidence Score</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={state.selectedContext.confidence * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">
                            {(state.selectedContext.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label>Relevance Score</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={state.selectedContext.relevance * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">
                            {(state.selectedContext.relevance * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label>Detected At</Label>
                        <p className="text-sm">{formatDate(state.selectedContext.detectedAt)}</p>
                      </div>
                      <div>
                        <Label>Last Updated</Label>
                        <p className="text-sm">{formatDate(state.selectedContext.lastUpdated)}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge 
                          variant="outline"
                          className={getStatusColor(state.selectedContext.status)}
                        >
                          {state.selectedContext.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={() => handleAnalyzeContext(state.selectedContext!.id)}
                      disabled={state.isProcessing}
                    >
                      {state.isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Cpu className="h-4 w-4 mr-2" />
                          Analyze Context
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      Generate Insights
                    </Button>
                    <Button variant="outline">
                      View Correlations
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline">
                      Export Context
                    </Button>
                    <Button variant="outline">
                      Share Context
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

export default ContextualIntelligence;