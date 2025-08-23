/**
 * 🔍 Pattern Recognition Center - Advanced AI Pattern Analysis
 * ===========================================================
 * 
 * Enterprise-grade AI-powered pattern recognition and analysis system that detects,
 * analyzes, and visualizes complex patterns across all data scanning operations.
 * 
 * Features:
 * - Advanced ML-based pattern detection algorithms
 * - Real-time pattern classification and scoring
 * - Interactive pattern visualization and exploration
 * - Cross-system pattern correlation analysis
 * - Predictive pattern evolution modeling
 * - Automated pattern significance assessment
 * - Pattern-based anomaly detection
 * - Comprehensive pattern reporting and insights
 * 
 * @author Enterprise Data Governance Team
 * @version 2.0.0 - Production Enterprise Ready
 * @component PatternRecognitionCenter
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, Eye, Activity, BarChart3, Target, AlertTriangle, CheckCircle, Clock, Brain, Zap, Network, GitBranch, Layers, RefreshCw, Download, Upload, Settings, MoreHorizontal, ChevronDown, ChevronRight, ExternalLink, Info, Star, Bookmark, Share, Copy, Edit, Trash2, Plus, Minus, Maximize, Play, Pause, Square, Database, Server, HardDrive, Shield, Lock, Grid, List, Timeline, Map, PieChart } from 'lucide-react';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Chart Components
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, TreemapChart, Treemap, Sankey, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Types and Interfaces
import { 
  PatternRecognitionResult,
  PatternType,
  PatternValidationStatus,
  PatternOccurrence,
  RelatedPattern,
  PatternBusinessImpact,
  PatternRecommendation,
  PatternMetadata,
  PatternAnalysisMetrics,
  PatternCorrelation,
  PatternTrend,
  PatternEvolution,
  PatternSignificance,
  PatternClassification,
  PatternVisualization
} from '../../types/intelligence.types';

// Hooks and Services
import { useScanIntelligence } from '../../hooks/useScanIntelligence';
import { useRealTimeMonitoring } from '../../hooks/useRealTimeMonitoring';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { useNotifications } from '@/hooks/useNotifications';

// Utils and Constants
import { cn } from '@/lib/utils';
import { formatDate, formatDuration, formatNumber, formatPercentage } from '@/utils/formatters';
import { generateColor, getPatternTypeColor, getSignificanceColor } from '@/utils/colors';
import { 
  PATTERN_TYPES,
  PATTERN_ALGORITHMS,
  PATTERN_SIGNIFICANCE_LEVELS,
  PATTERN_VISUALIZATION_TYPES,
  DEFAULT_PATTERN_FILTERS
} from '../../constants/intelligence-constants';

// ===================== INTERFACES & TYPES =====================

interface PatternRecognitionState {
  patterns: PatternRecognitionResult[];
  filteredPatterns: PatternRecognitionResult[];
  selectedPattern: PatternRecognitionResult | null;
  patternCorrelations: PatternCorrelation[];
  patternTrends: PatternTrend[];
  patternEvolutions: PatternEvolution[];
  analysisMetrics: PatternAnalysisMetrics;
  filterCriteria: PatternFilterCriteria;
  viewConfig: PatternViewConfig;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  notifications: PatternNotification[];
  selectedPatterns: Set<string>;
  comparisonMode: boolean;
  visualizationType: PatternVisualizationType;
  algorithmConfig: PatternAlgorithmConfig;
  realTimeEnabled: boolean;
  advancedMode: boolean;
}

interface PatternFilterCriteria {
  types: PatternType[];
  significanceLevels: PatternSignificance[];
  validationStatuses: PatternValidationStatus[];
  confidenceRange: [number, number];
  frequencyRange: [number, number];
  timeRange: TimeRange;
  searchQuery: string;
  dataSources: string[];
  tags: string[];
  businessImpact: string[];
  customFilters: Record<string, any>;
}

interface PatternViewConfig {
  layout: 'grid' | 'list' | 'timeline' | 'network' | 'hierarchy';
  sortBy: 'confidence' | 'frequency' | 'significance' | 'date' | 'impact';
  sortOrder: 'asc' | 'desc';
  groupBy: 'type' | 'significance' | 'source' | 'impact' | 'none';
  density: 'compact' | 'comfortable' | 'spacious';
  showMetrics: boolean;
  showVisualization: boolean;
  showRelatedPatterns: boolean;
  showBusinessImpact: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

interface PatternVisualizationType {
  primary: 'scatter' | 'network' | 'timeline' | 'heatmap' | 'treemap';
  secondary: 'distribution' | 'correlation' | 'trend' | 'evolution';
  interactive: boolean;
  animated: boolean;
  dimensions: '2d' | '3d';
}

interface PatternAlgorithmConfig {
  algorithm: 'ml_clustering' | 'statistical' | 'graph_based' | 'hybrid';
  sensitivity: number;
  minSupport: number;
  maxPatterns: number;
  correlationThreshold: number;
  adaptiveLearning: boolean;
  realTimeProcessing: boolean;
  customParameters: Record<string, any>;
}

interface PatternNotification {
  id: string;
  type: 'new_pattern' | 'pattern_update' | 'correlation_found' | 'anomaly_detected';
  title: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionable: boolean;
  patternId?: string;
}

interface TimeRange {
  start: Date;
  end: Date;
  preset: 'last_hour' | 'last_day' | 'last_week' | 'last_month' | 'custom';
}

// ===================== COMPONENT =====================

const PatternRecognitionCenter: React.FC = () => {
  const [state, setState] = useState<PatternRecognitionState>({
    patterns: [],
    filteredPatterns: [],
    selectedPattern: null,
    patternCorrelations: [],
    patternTrends: [],
    patternEvolutions: [],
    analysisMetrics: {
      totalPatterns: 0,
      significantPatterns: 0,
      averageConfidence: 0,
      patternDiversity: 0,
      correlationStrength: 0,
      evolutionRate: 0,
      businessImpactScore: 0,
      processingLatency: 0
    },
    filterCriteria: {
      types: [],
      significanceLevels: [],
      validationStatuses: [],
      confidenceRange: [0, 1],
      frequencyRange: [0, 1000],
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
        preset: 'last_day'
      },
      searchQuery: '',
      dataSources: [],
      tags: [],
      businessImpact: [],
      customFilters: {}
    },
    viewConfig: {
      layout: 'grid',
      sortBy: 'confidence',
      sortOrder: 'desc',
      groupBy: 'type',
      density: 'comfortable',
      showMetrics: true,
      showVisualization: true,
      showRelatedPatterns: true,
      showBusinessImpact: true,
      autoRefresh: true,
      refreshInterval: 30000
    },
    isLoading: false,
    isAnalyzing: false,
    error: null,
    notifications: [],
    selectedPatterns: new Set(),
    comparisonMode: false,
    visualizationType: {
      primary: 'network',
      secondary: 'correlation',
      interactive: true,
      animated: true,
      dimensions: '2d'
    },
    algorithmConfig: {
      algorithm: 'hybrid',
      sensitivity: 0.8,
      minSupport: 0.1,
      maxPatterns: 1000,
      correlationThreshold: 0.7,
      adaptiveLearning: true,
      realTimeProcessing: true,
      customParameters: {}
    },
    realTimeEnabled: true,
    advancedMode: false
  });

  const centerRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analysisWorkerRef = useRef<Worker | null>(null);

  // Hooks
  const {
    patterns,
    patternAnalysis,
    correlations,
    isLoading: intelligenceLoading,
    error: intelligenceError,
    getPatternsByType,
    analyzePatternCorrelations,
    getPatternTrends,
    getPatternEvolution,
    validatePatterns,
    classifyPatterns,
    optimizePatternDetection: optimizePatternDetectionAPI,
    exportPatternData,
    generatePatternReport
  } = useScanIntelligence();

  const {
    realTimeData,
    isConnected,
    subscribe,
    unsubscribe
  } = useRealTimeMonitoring();

  const {
    analytics,
    generateReport,
    exportData
  } = useAdvancedAnalytics();

  const { showNotification, showError, showSuccess } = useNotifications();

  // ===================== LIFECYCLE & INITIALIZATION =====================

  useEffect(() => {
    initializePatternRecognition();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (state.viewConfig.autoRefresh) {
      setupAutoRefresh();
    } else {
      clearAutoRefresh();
    }
  }, [state.viewConfig.autoRefresh, state.viewConfig.refreshInterval]);

  useEffect(() => {
    if (state.realTimeEnabled) {
      setupRealTimeUpdates();
    } else {
      teardownRealTimeUpdates();
    }
  }, [state.realTimeEnabled]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [state.patterns, state.filterCriteria, state.viewConfig]);

  const initializePatternRecognition = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Load initial pattern data
      await Promise.all([
        loadPatterns(),
        loadPatternCorrelations(),
        loadPatternTrends(),
        initializeAnalysisWorker()
      ]);
      
      showSuccess('Pattern Recognition Center initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize pattern recognition:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Initialization failed' 
      }));
      showError('Failed to initialize Pattern Recognition Center');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadPatterns = useCallback(async () => {
    try {
      const patternData = await getPatternsByType(PATTERN_TYPES);
      setState(prev => ({ 
        ...prev, 
        patterns: patternData || [],
        analysisMetrics: calculateAnalysisMetrics(patternData || [])
      }));
    } catch (error) {
      console.error('Failed to load patterns:', error);
      throw error;
    }
  }, []);

  const loadPatternCorrelations = useCallback(async () => {
    try {
      const correlationData = await analyzePatternCorrelations();
      setState(prev => ({ ...prev, patternCorrelations: correlationData || [] }));
    } catch (error) {
      console.error('Failed to load pattern correlations:', error);
    }
  }, []);

  const loadPatternTrends = useCallback(async () => {
    try {
      const trendData = await getPatternTrends();
      setState(prev => ({ ...prev, patternTrends: trendData || [] }));
    } catch (error) {
      console.error('Failed to load pattern trends:', error);
    }
  }, []);

  const initializeAnalysisWorker = useCallback(async () => {
    try {
      if (typeof Worker !== 'undefined') {
        analysisWorkerRef.current = new Worker('/workers/pattern-analysis-worker.js');
        analysisWorkerRef.current.onmessage = handleWorkerMessage;
        analysisWorkerRef.current.onerror = handleWorkerError;
      }
    } catch (error) {
      console.error('Failed to initialize analysis worker:', error);
    }
  }, []);

  // ===================== REAL-TIME UPDATES =====================

  const setupAutoRefresh = useCallback(() => {
    clearAutoRefresh();
    refreshIntervalRef.current = setInterval(() => {
      if (!state.isLoading && !state.isAnalyzing) {
        refreshPatternData();
      }
    }, state.viewConfig.refreshInterval);
  }, [state.viewConfig.refreshInterval]);

  const clearAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const setupRealTimeUpdates = useCallback(async () => {
    try {
      await subscribe([
        'pattern_detection',
        'pattern_updates',
        'pattern_correlations',
        'pattern_evolution'
      ]);
    } catch (error) {
      console.error('Failed to setup real-time updates:', error);
    }
  }, []);

  const teardownRealTimeUpdates = useCallback(async () => {
    try {
      await unsubscribe([
        'pattern_detection',
        'pattern_updates', 
        'pattern_correlations',
        'pattern_evolution'
      ]);
    } catch (error) {
      console.error('Failed to teardown real-time updates:', error);
    }
  }, []);

  const handleRealTimeUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'new_pattern':
        handleNewPattern(data.payload);
        break;
      case 'pattern_update':
        handlePatternUpdate(data.payload);
        break;
      case 'correlation_detected':
        handleCorrelationDetected(data.payload);
        break;
      case 'pattern_evolution':
        handlePatternEvolution(data.payload);
        break;
      default:
        console.log('Unknown real-time update type:', data.type);
    }
  }, []);

  const handleNewPattern = useCallback((pattern: PatternRecognitionResult) => {
    setState(prev => ({
      ...prev,
      patterns: [pattern, ...prev.patterns],
      notifications: [{
        id: Date.now().toString(),
        type: 'new_pattern',
        title: 'New Pattern Detected',
        message: `Pattern "${pattern.pattern_name}" discovered with ${(pattern.confidence_score * 100).toFixed(1)}% confidence`,
        timestamp: new Date(),
        severity: pattern.confidence_score > 0.9 ? 'high' : 'medium',
        read: false,
        actionable: true,
        patternId: pattern.id
      }, ...prev.notifications]
    }));

    if (pattern.confidence_score > 0.9) {
      showNotification({
        title: 'High-Confidence Pattern Detected',
        message: pattern.pattern_name,
        type: 'success'
      });
    }
  }, []);

  const handlePatternUpdate = useCallback((updatedPattern: PatternRecognitionResult) => {
    setState(prev => ({
      ...prev,
      patterns: prev.patterns.map(p => 
        p.id === updatedPattern.id ? updatedPattern : p
      )
    }));
  }, []);

  const handleCorrelationDetected = useCallback((correlation: PatternCorrelation) => {
    setState(prev => ({
      ...prev,
      patternCorrelations: [correlation, ...prev.patternCorrelations],
      notifications: [{
        id: Date.now().toString(),
        type: 'correlation_found',
        title: 'Pattern Correlation Found',
        message: `Strong correlation detected between patterns`,
        timestamp: new Date(),
        severity: 'medium',
        read: false,
        actionable: true
      }, ...prev.notifications]
    }));
  }, []);

  const handlePatternEvolution = useCallback((evolution: PatternEvolution) => {
    setState(prev => ({
      ...prev,
      patternEvolutions: [evolution, ...prev.patternEvolutions]
    }));
  }, []);

  // ===================== WORKER HANDLING =====================

  const handleWorkerMessage = useCallback((event: MessageEvent) => {
    const { type, payload, error } = event.data;
    
    if (error) {
      console.error('Worker error:', error);
      setState(prev => ({ ...prev, error, isAnalyzing: false }));
      return;
    }

    switch (type) {
      case 'analysis_complete':
        handleAnalysisComplete(payload);
        break;
      case 'progress_update':
        handleAnalysisProgress(payload);
        break;
      case 'correlation_result':
        handleCorrelationResult(payload);
        break;
      default:
        console.log('Unknown worker message type:', type);
    }
  }, []);

  const handleWorkerError = useCallback((error: ErrorEvent) => {
    console.error('Worker error:', error);
    setState(prev => ({ 
      ...prev, 
      error: 'Analysis worker error', 
      isAnalyzing: false 
    }));
  }, []);

  const handleAnalysisComplete = useCallback((result: any) => {
    setState(prev => ({
      ...prev,
      patterns: result.patterns || prev.patterns,
      patternCorrelations: result.correlations || prev.patternCorrelations,
      analysisMetrics: result.metrics || prev.analysisMetrics,
      isAnalyzing: false
    }));
    
    showSuccess('Pattern analysis completed successfully');
  }, []);

  const handleAnalysisProgress = useCallback((progress: number) => {
    // Update progress indicator if needed
  }, []);

  const handleCorrelationResult = useCallback((correlations: PatternCorrelation[]) => {
    setState(prev => ({
      ...prev,
      patternCorrelations: correlations
    }));
  }, []);

  // ===================== DATA OPERATIONS =====================

  const refreshPatternData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await Promise.all([
        loadPatterns(),
        loadPatternCorrelations(),
        loadPatternTrends()
      ]);
    } catch (error) {
      console.error('Failed to refresh pattern data:', error);
      showError('Failed to refresh pattern data');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadPatterns, loadPatternCorrelations, loadPatternTrends]);

  const analyzeSelectedPatterns = useCallback(async () => {
    if (state.selectedPatterns.size === 0) {
      showError('Please select patterns to analyze');
      return;
    }

    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      const selectedPatternData = state.patterns.filter(p => 
        state.selectedPatterns.has(p.id)
      );

      if (analysisWorkerRef.current) {
        analysisWorkerRef.current.postMessage({
          type: 'analyze_patterns',
          payload: {
            patterns: selectedPatternData,
            config: state.algorithmConfig
          }
        });
      } else {
        // Fallback to main thread analysis
        const correlations = await analyzePatternCorrelations();
        setState(prev => ({
          ...prev,
          patternCorrelations: correlations || [],
          isAnalyzing: false
        }));
      }
      
    } catch (error) {
      console.error('Pattern analysis failed:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      showError('Pattern analysis failed');
    }
  }, [state.selectedPatterns, state.patterns, state.algorithmConfig]);

  const validateSelectedPatterns = useCallback(async () => {
    if (state.selectedPatterns.size === 0) {
      showError('Please select patterns to validate');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const patternIds = Array.from(state.selectedPatterns);
      const validationResults = await validatePatterns(patternIds);
      
      setState(prev => ({
        ...prev,
        patterns: prev.patterns.map(pattern => {
          const validation = validationResults.find(v => v.patternId === pattern.id);
          if (validation) {
            return {
              ...pattern,
              validation_status: validation.status,
              metadata: {
                ...pattern.metadata,
                validation: validation
              }
            };
          }
          return pattern;
        })
      }));
      
      showSuccess('Pattern validation completed');
      
    } catch (error) {
      console.error('Pattern validation failed:', error);
      showError('Pattern validation failed');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.selectedPatterns]);

  const runOptimizePatternDetection = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      const optimizationResult = await optimizePatternDetectionAPI(state.algorithmConfig);
      
      setState(prev => ({
        ...prev,
        algorithmConfig: {
          ...prev.algorithmConfig,
          ...optimizationResult.optimizedConfig
        },
        analysisMetrics: {
          ...prev.analysisMetrics,
          ...optimizationResult.metrics
        }
      }));
      
      showSuccess('Pattern detection optimized successfully');
      
    } catch (error) {
      console.error('Pattern optimization failed:', error);
      showError('Pattern optimization failed');
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, [state.algorithmConfig]);

  // ===================== FILTERING & SORTING =====================

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...state.patterns];

    // Apply type filter
    if (state.filterCriteria.types.length > 0) {
      filtered = filtered.filter(pattern => 
        state.filterCriteria.types.includes(pattern.pattern_type)
      );
    }

    // Apply significance filter
    if (state.filterCriteria.significanceLevels.length > 0) {
      filtered = filtered.filter(pattern => 
        state.filterCriteria.significanceLevels.includes(
          pattern.statistical_significance > 0.9 ? 'high' :
          pattern.statistical_significance > 0.7 ? 'medium' : 'low'
        )
      );
    }

    // Apply validation status filter
    if (state.filterCriteria.validationStatuses.length > 0) {
      filtered = filtered.filter(pattern => 
        state.filterCriteria.validationStatuses.includes(pattern.validation_status)
      );
    }

    // Apply confidence range filter
    filtered = filtered.filter(pattern => 
      pattern.confidence_score >= state.filterCriteria.confidenceRange[0] &&
      pattern.confidence_score <= state.filterCriteria.confidenceRange[1]
    );

    // Apply frequency range filter
    filtered = filtered.filter(pattern => 
      pattern.frequency >= state.filterCriteria.frequencyRange[0] &&
      pattern.frequency <= state.filterCriteria.frequencyRange[1]
    );

    // Apply time range filter
    filtered = filtered.filter(pattern => {
      const patternDate = new Date(pattern.first_detected);
      return patternDate >= state.filterCriteria.timeRange.start &&
             patternDate <= state.filterCriteria.timeRange.end;
    });

    // Apply search query
    if (state.filterCriteria.searchQuery) {
      const query = state.filterCriteria.searchQuery.toLowerCase();
      filtered = filtered.filter(pattern => 
        pattern.pattern_name.toLowerCase().includes(query) ||
        pattern.pattern_description.toLowerCase().includes(query) ||
        pattern.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.viewConfig.sortBy) {
        case 'confidence':
          aValue = a.confidence_score;
          bValue = b.confidence_score;
          break;
        case 'frequency':
          aValue = a.frequency;
          bValue = b.frequency;
          break;
        case 'significance':
          aValue = a.statistical_significance;
          bValue = b.statistical_significance;
          break;
        case 'date':
          aValue = new Date(a.first_detected);
          bValue = new Date(b.first_detected);
          break;
        case 'impact':
          aValue = a.business_impact?.impact_score || 0;
          bValue = b.business_impact?.impact_score || 0;
          break;
        default:
          aValue = a.confidence_score;
          bValue = b.confidence_score;
      }

      if (state.viewConfig.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setState(prev => ({ ...prev, filteredPatterns: filtered }));
  }, [state.patterns, state.filterCriteria, state.viewConfig]);

  const updateFilter = useCallback((key: keyof PatternFilterCriteria, value: any) => {
    setState(prev => ({
      ...prev,
      filterCriteria: {
        ...prev.filterCriteria,
        [key]: value
      }
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filterCriteria: {
        types: [],
        significanceLevels: [],
        validationStatuses: [],
        confidenceRange: [0, 1],
        frequencyRange: [0, 1000],
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000),
          end: new Date(),
          preset: 'last_day'
        },
        searchQuery: '',
        dataSources: [],
        tags: [],
        businessImpact: [],
        customFilters: {}
      }
    }));
  }, []);

  // ===================== PATTERN SELECTION =====================

  const togglePatternSelection = useCallback((patternId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedPatterns);
      if (newSelected.has(patternId)) {
        newSelected.delete(patternId);
      } else {
        newSelected.add(patternId);
      }
      return { ...prev, selectedPatterns: newSelected };
    });
  }, []);

  const selectAllPatterns = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPatterns: new Set(prev.filteredPatterns.map(p => p.id))
    }));
  }, []);

  const clearPatternSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPatterns: new Set()
    }));
  }, []);

  const toggleComparisonMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      comparisonMode: !prev.comparisonMode,
      selectedPatterns: new Set()
    }));
  }, []);

  // ===================== EXPORT & REPORTING =====================

  const exportPatterns = useCallback(async (format: 'json' | 'csv' | 'excel') => {
    try {
      const patternsToExport = state.selectedPatterns.size > 0 
        ? state.filteredPatterns.filter(p => state.selectedPatterns.has(p.id))
        : state.filteredPatterns;

      const exportData = {
        patterns: patternsToExport,
        correlations: state.patternCorrelations,
        trends: state.patternTrends,
        metrics: state.analysisMetrics,
        exportTimestamp: new Date().toISOString(),
        filterCriteria: state.filterCriteria
      };

      await exportData(exportData, format);
      showSuccess(`Patterns exported as ${format.toUpperCase()}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export patterns');
    }
  }, [state.filteredPatterns, state.selectedPatterns, state.patternCorrelations, state.patternTrends, state.analysisMetrics, state.filterCriteria]);

  const generateDetailedReport = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const reportData = await generatePatternReport({
        patterns: state.filteredPatterns,
        correlations: state.patternCorrelations,
        trends: state.patternTrends,
        metrics: state.analysisMetrics,
        includeVisualizations: true,
        includeRecommendations: true
      });

      // ArrowDownTrayIcon the report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pattern-analysis-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showSuccess('Pattern analysis report generated successfully');
      
    } catch (error) {
      console.error('Report generation failed:', error);
      showError('Failed to generate report');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.filteredPatterns, state.patternCorrelations, state.patternTrends, state.analysisMetrics]);

  // ===================== UTILITY FUNCTIONS =====================

  const calculateAnalysisMetrics = useCallback((patterns: PatternRecognitionResult[]): PatternAnalysisMetrics => {
    if (patterns.length === 0) {
      return {
        totalPatterns: 0,
        significantPatterns: 0,
        averageConfidence: 0,
        patternDiversity: 0,
        correlationStrength: 0,
        evolutionRate: 0,
        businessImpactScore: 0,
        processingLatency: 0
      };
    }

    const significantPatterns = patterns.filter(p => p.statistical_significance > 0.7).length;
    const averageConfidence = patterns.reduce((sum, p) => sum + p.confidence_score, 0) / patterns.length;
    
    // Calculate pattern diversity (unique types / total patterns)
    const uniqueTypes = new Set(patterns.map(p => p.pattern_type)).size;
    const patternDiversity = uniqueTypes / Math.max(patterns.length, 1);
    
    // Calculate average business impact score
    const businessImpactScore = patterns
      .filter(p => p.business_impact?.impact_score)
      .reduce((sum, p) => sum + (p.business_impact?.impact_score || 0), 0) / 
      Math.max(patterns.filter(p => p.business_impact?.impact_score).length, 1);

    return {
      totalPatterns: patterns.length,
      significantPatterns,
      averageConfidence,
      patternDiversity,
      correlationStrength: state.patternCorrelations.length > 0 
        ? state.patternCorrelations.reduce((sum, c) => sum + (c.strength || 0), 0) / state.patternCorrelations.length 
        : 0,
      evolutionRate: state.patternEvolutions.length / Math.max(patterns.length, 1),
      businessImpactScore: businessImpactScore || 0,
      processingLatency: 0 // Would be calculated based on actual processing times
    };
  }, [state.patternCorrelations, state.patternEvolutions]);

  const cleanup = useCallback(() => {
    clearAutoRefresh();
    teardownRealTimeUpdates();
    if (analysisWorkerRef.current) {
      analysisWorkerRef.current.terminate();
      analysisWorkerRef.current = null;
    }
  }, [clearAutoRefresh, teardownRealTimeUpdates]);

  // ===================== COMPUTED VALUES =====================

  const groupedPatterns = useMemo(() => {
    if (state.viewConfig.groupBy === 'none') {
      return { 'All Patterns': state.filteredPatterns };
    }

    return state.filteredPatterns.reduce((groups, pattern) => {
      let groupKey: string;
      
      switch (state.viewConfig.groupBy) {
        case 'type':
          groupKey = pattern.pattern_type.replace('_', ' ').toUpperCase();
          break;
        case 'significance':
          groupKey = pattern.statistical_significance > 0.9 ? 'High' :
                    pattern.statistical_significance > 0.7 ? 'Medium' : 'Low';
          break;
        case 'source':
          groupKey = pattern.metadata?.data_source || 'Unknown';
          break;
        case 'impact':
          const score = pattern.business_impact?.impact_score || 0;
          groupKey = score > 0.8 ? 'High Impact' :
                    score > 0.5 ? 'Medium Impact' : 'Low Impact';
          break;
        default:
          groupKey = 'All Patterns';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(pattern);
      
      return groups;
    }, {} as Record<string, PatternRecognitionResult[]>);
  }, [state.filteredPatterns, state.viewConfig.groupBy]);

  const patternTypeDistribution = useMemo(() => {
    const distribution = state.filteredPatterns.reduce((acc, pattern) => {
      const type = pattern.pattern_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([type, count]) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: count,
      fill: getPatternTypeColor(type)
    }));
  }, [state.filteredPatterns]);

  const confidenceDistribution = useMemo(() => {
    const bins = [
      { range: '0-0.2', min: 0, max: 0.2, count: 0 },
      { range: '0.2-0.4', min: 0.2, max: 0.4, count: 0 },
      { range: '0.4-0.6', min: 0.4, max: 0.6, count: 0 },
      { range: '0.6-0.8', min: 0.6, max: 0.8, count: 0 },
      { range: '0.8-1.0', min: 0.8, max: 1.0, count: 0 }
    ];

    state.filteredPatterns.forEach(pattern => {
      const confidence = pattern.confidence_score;
      const bin = bins.find(b => confidence >= b.min && confidence <= b.max);
      if (bin) bin.count++;
    });

    return bins.map(bin => ({
      range: bin.range,
      count: bin.count,
      percentage: state.filteredPatterns.length > 0 
        ? (bin.count / state.filteredPatterns.length) * 100 
        : 0
    }));
  }, [state.filteredPatterns]);

  // ===================== RENDER HELPERS =====================

  const renderMetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Patterns
              </p>
              <p className="text-2xl font-bold">
                {formatNumber(state.analysisMetrics.totalPatterns)}
              </p>
            </div>
            <Network className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Significant Patterns
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(state.analysisMetrics.significantPatterns)}
              </p>
            </div>
            <Star className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg Confidence
              </p>
              <p className="text-2xl font-bold">
                {formatPercentage(state.analysisMetrics.averageConfidence)}
              </p>
            </div>
            <Target className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pattern Diversity
              </p>
              <p className="text-2xl font-bold">
                {formatPercentage(state.analysisMetrics.patternDiversity)}
              </p>
            </div>
            <GitBranch className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVisualizationCharts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pattern Type Distribution</CardTitle>
          <CardDescription>
            Distribution of detected patterns by type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={patternTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {patternTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confidence Distribution</CardTitle>
          <CardDescription>
            Distribution of pattern confidence scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderPatternCard = (pattern: PatternRecognitionResult) => (
    <motion.div
      key={pattern.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg",
          state.selectedPattern?.id === pattern.id && "ring-2 ring-primary",
          state.selectedPatterns.has(pattern.id) && "ring-1 ring-blue-500"
        )}
        onClick={() => setState(prev => ({ ...prev, selectedPattern: pattern }))}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {state.comparisonMode && (
                <Checkbox
                  checked={state.selectedPatterns.has(pattern.id)}
                  onCheckedChange={() => togglePatternSelection(pattern.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className="flex-1">
                <CardTitle className="text-base">{pattern.pattern_name}</CardTitle>
                <CardDescription className="mt-1 line-clamp-2">
                  {pattern.pattern_description}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge 
                variant={getPatternTypeColor(pattern.pattern_type)}
                className="text-xs"
              >
                {pattern.pattern_type.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge 
                variant={getSignificanceColor(pattern.statistical_significance)}
                className="text-xs"
              >
                {pattern.statistical_significance > 0.9 ? 'HIGH' :
                 pattern.statistical_significance > 0.7 ? 'MEDIUM' : 'LOW'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={pattern.confidence_score * 100} 
                  className="w-16"
                />
                <span className="font-medium">
                  {formatPercentage(pattern.confidence_score)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Frequency</span>
              <span className="font-medium">{formatNumber(pattern.frequency)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">First Detected</span>
              <span>{formatDate(pattern.first_detected)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Validation</span>
              <Badge 
                variant={pattern.validation_status === 'validated' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {pattern.validation_status.toUpperCase()}
              </Badge>
            </div>
            
            {pattern.business_impact && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Business Impact</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(pattern.business_impact.impact_score || 0) * 100} 
                    className="w-16"
                  />
                  <span className="font-medium">
                    {formatPercentage(pattern.business_impact.impact_score || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderFilterControls = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="search">Search Patterns</Label>
            <Input
              id="search"
              placeholder="Search by name or description..."
              value={state.filterCriteria.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
            />
          </div>
          
          <div>
            <Label>Pattern Type</Label>
            <Select
              onValueChange={(value) => {
                const types = value === 'all' ? [] : [value as PatternType];
                updateFilter('types', types);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PATTERN_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Significance</Label>
            <Select
              onValueChange={(value) => {
                const levels = value === 'all' ? [] : [value as PatternSignificance];
                updateFilter('significanceLevels', levels);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Confidence Range</Label>
            <div className="pt-2">
              <Slider
                value={[
                  state.filterCriteria.confidenceRange[0] * 100,
                  state.filterCriteria.confidenceRange[1] * 100
                ]}
                onValueChange={(value) => {
                  updateFilter('confidenceRange', [value[0] / 100, value[1] / 100]);
                }}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatPercentage(state.filterCriteria.confidenceRange[0])}</span>
                <span>{formatPercentage(state.filterCriteria.confidenceRange[1])}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex-1"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderToolbar = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          <h3 className="text-lg font-medium">Pattern Recognition</h3>
          <p className="text-muted-foreground">
            {state.filteredPatterns.length} of {state.patterns.length} patterns
          </p>
        </div>
        
        {state.selectedPatterns.size > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {state.selectedPatterns.size} selected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeSelectedPatterns}
              disabled={state.isAnalyzing}
            >
              <Brain className="h-4 w-4 mr-2" />
              Analyze
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={validateSelectedPatterns}
              disabled={state.isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleComparisonMode}
        >
          <Checkbox className="h-4 w-4 mr-2" />
          Compare
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshPatternData}
          disabled={state.isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", state.isLoading && "animate-spin")} />
          Refresh
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportPatterns('json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPatterns('csv')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportPatterns('excel')}>
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={generateDetailedReport}>
              Generate Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setState(prev => ({ ...prev, advancedMode: !prev.advancedMode }))}
        >
          <Settings className="h-4 w-4 mr-2" />
          {state.advancedMode ? 'Basic' : 'Advanced'}
        </Button>
      </div>
    </div>
  );

  // ===================== MAIN RENDER =====================

  if (state.isLoading && state.patterns.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading Pattern Recognition Center...</p>
          <p className="text-muted-foreground">Analyzing patterns and correlations</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div ref={centerRef} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pattern Recognition Center</h1>
            <p className="text-muted-foreground">
              Advanced AI-powered pattern detection and analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={state.realTimeEnabled}
              onCheckedChange={(checked) => setState(prev => ({ ...prev, realTimeEnabled: checked }))}
            />
            <Label className="text-sm">Real-time</Label>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Metrics Overview */}
        {renderMetricsOverview()}

        {/* Visualization Charts */}
        {state.viewConfig.showVisualization && renderVisualizationCharts()}

        {/* Toolbar */}
        {renderToolbar()}

        {/* Filter Controls */}
        {renderFilterControls()}

        {/* Pattern Content */}
        <Tabs defaultValue="patterns">
          <TabsList>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            {state.advancedMode && (
              <>
                <TabsTrigger value="evolution">Evolution</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="patterns" className="space-y-6">
            {/* Pattern Grid/List */}
            {Object.entries(groupedPatterns).map(([groupName, groupPatterns]) => (
              <div key={groupName}>
                {state.viewConfig.groupBy !== 'none' && (
                  <h3 className="text-lg font-medium mb-4">{groupName}</h3>
                )}
                
                <div className={cn(
                  "gap-4",
                  state.viewConfig.layout === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "space-y-4"
                )}>
                  <AnimatePresence>
                    {groupPatterns.map(renderPatternCard)}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {state.filteredPatterns.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Patterns Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or refresh the data to see more patterns.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Correlations</CardTitle>
                <CardDescription>
                  Detected correlations between different patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.patternCorrelations.map(correlation => (
                    <div key={correlation.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{correlation.correlation_type}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Strength: {formatPercentage(correlation.strength || 0)}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            {correlation.pattern_ids?.map(patternId => {
                              const pattern = state.patterns.find(p => p.id === patternId);
                              return pattern ? (
                                <Badge key={patternId} variant="outline">
                                  {pattern.pattern_name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pattern Trends</CardTitle>
                <CardDescription>
                  Trending patterns and their evolution over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.patternTrends.map(trend => (
                    <div key={trend.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{trend.pattern_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Trend: {trend.trend_direction} ({formatPercentage(trend.growth_rate || 0)} growth)
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <span>Period: {trend.time_period}</span>
                            <span>Confidence: {formatPercentage(trend.confidence || 0)}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={trend.trend_direction === 'increasing' ? 'default' : 'secondary'}
                        >
                          {trend.trend_direction?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {state.advancedMode && (
            <>
              <TabsContent value="evolution" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pattern Evolution</CardTitle>
                    <CardDescription>
                      How patterns have evolved and changed over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {state.patternEvolutions.map(evolution => (
                        <div key={evolution.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{evolution.pattern_name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Evolution: {evolution.evolution_type}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span>Stage: {evolution.current_stage}</span>
                                <span>Maturity: {formatPercentage(evolution.maturity_score || 0)}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Track Evolution
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Analysis</CardTitle>
                    <CardDescription>
                      Deep analytical insights and pattern intelligence
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Algorithm Configuration</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Detection Algorithm</Label>
                            <Select
                              value={state.algorithmConfig.algorithm}
                              onValueChange={(value) => setState(prev => ({
                                ...prev,
                                algorithmConfig: {
                                  ...prev.algorithmConfig,
                                  algorithm: value as any
                                }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ml_clustering">ML Clustering</SelectItem>
                                <SelectItem value="statistical">Statistical</SelectItem>
                                <SelectItem value="graph_based">Graph-based</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Sensitivity: {state.algorithmConfig.sensitivity}</Label>
                            <Slider
                              value={[state.algorithmConfig.sensitivity * 100]}
                              onValueChange={(value) => setState(prev => ({
                                ...prev,
                                algorithmConfig: {
                                  ...prev.algorithmConfig,
                                  sensitivity: value[0] / 100
                                }
                              }))}
                              max={100}
                              step={1}
                              className="mt-2"
                            />
                          </div>
                          
                          <div>
                            <Label>Correlation Threshold: {state.algorithmConfig.correlationThreshold}</Label>
                            <Slider
                              value={[state.algorithmConfig.correlationThreshold * 100]}
                              onValueChange={(value) => setState(prev => ({
                                ...prev,
                                algorithmConfig: {
                                  ...prev.algorithmConfig,
                                  correlationThreshold: value[0] / 100
                                }
                              }))}
                              max={100}
                              step={1}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Analysis Actions</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={optimizePatternDetection}
                            disabled={state.isAnalyzing}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Optimize Detection
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                              if (state.selectedPatterns.size > 0) {
                                analyzeSelectedPatterns();
                              } else {
                                showError('Please select patterns to analyze');
                              }
                            }}
                            disabled={state.isAnalyzing || state.selectedPatterns.size === 0}
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Deep Analysis
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={generateDetailedReport}
                            disabled={state.isLoading}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Pattern Details Sidebar */}
        <Sheet 
          open={!!state.selectedPattern} 
          onOpenChange={(open) => !open && setState(prev => ({ ...prev, selectedPattern: null }))}
        >
          <SheetContent className="w-full sm:w-96">
            {state.selectedPattern && (
              <>
                <SheetHeader>
                  <SheetTitle>{state.selectedPattern.pattern_name}</SheetTitle>
                  <SheetDescription>
                    Pattern Details and Analysis
                  </SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {state.selectedPattern.pattern_description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span>{formatPercentage(state.selectedPattern.confidence_score)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frequency:</span>
                        <span>{formatNumber(state.selectedPattern.frequency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Significance:</span>
                        <span>{formatPercentage(state.selectedPattern.statistical_significance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Correlation:</span>
                        <span>{formatPercentage(state.selectedPattern.correlation_strength)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {state.selectedPattern.business_impact && (
                    <div>
                      <h4 className="font-medium mb-2">Business Impact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Impact Score:</span>
                          <span>{formatPercentage(state.selectedPattern.business_impact.impact_score || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge variant="outline">
                            {state.selectedPattern.business_impact.priority?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {state.selectedPattern.related_patterns && state.selectedPattern.related_patterns.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Related Patterns</h4>
                      <div className="space-y-2">
                        {state.selectedPattern.related_patterns.map((related, index) => (
                          <div key={index} className="p-2 border rounded text-sm">
                            <div className="font-medium">{related.pattern_name}</div>
                            <div className="text-muted-foreground">
                              Similarity: {formatPercentage(related.similarity_score || 0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Track Pattern
                    </Button>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Analysis Status */}
        {state.isAnalyzing && (
          <motion.div
            className="fixed bottom-4 right-4 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="w-80">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Analyzing patterns...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take a few moments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default PatternRecognitionCenter;