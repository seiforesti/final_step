'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Progress 
} from "@/components/ui/progress";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { 
  Checkbox 
} from "@/components/ui/checkbox";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Calendar 
} from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  cn 
} from "@/lib copie/utils";
import { format, subDays, addDays, parseISO, differenceInDays } from "date-fns";
import { CalendarIcon, Download, FileText, Filter, MoreHorizontal, Plus, RefreshCw, Settings, Share, Upload, Clock, AlertTriangle, CheckCircle, XCircle, Eye, Edit3, Trash2, Copy, Search, TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Save, Send, Users, Mail, Printer, ExternalLink, Zap, Target, Layers, Activity, Database, Archive, Globe, Shield, Award, Bookmark, Info, HelpCircle, ChevronDown, ChevronRight, Maximize2, Minimize2, RotateCcw, PlayCircle, StopCircle, PauseCircle, Palette, Layout, Grid3X3, List, MapPin, Tag, Link, Star, Heart, MessageSquare, Bell, Lock, Unlock, Key, UserCheck, UserX, Briefcase, Building, Home, Folder, FolderOpen, File, FileType, Image, Video, Music, Code, Terminal, Cpu, HardDrive, Wifi, WifiOff, Power, PowerOff, BookOpen, GraduationCap, Brain, Network, GitBranch, Workflow, FileCheck, FileX, Clock3, Calendar as CalendarDays, Timer, Fingerprint, Hash, Type, BarChart2, Gauge, Percent, Shuffle, Repeat, SkipBack, SkipForward, Volume2, VolumeX, Mic, Camera, Smartphone, Monitor, Tablet, Watch, Navigation, Compass, Map, Route, Flag, Megaphone, Radio, Headphones, Speaker, Box, Package, Truck, Plane, Car, Bike, Ship, Train, Bus, Rocket, Satellite, CloudRain, Sun, Moon, CloudSnow, Waves, Wind, Snowflake, Thermometer, Droplets, Sunrise, Sunset, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart as RechartsLineChart, 
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart as RechartsScatterChart,
  Scatter,
  ComposedChart,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Brush
} from 'recharts';

// Import types and services
import { 
  TrendAnalysis,
  TrendDataPoint,
  ForecastResult,
  AnomalyDetection,
  SeasonalityPattern,
  TrendBreakdown,
  PatternRecognition,
  StatisticalSummary,
  CatalogApiResponse
} from '../../types';

import { catalogAnalyticsService, trendAnalysisService } from '../../services';
import { useCatalogAnalytics } from '../../hooks';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface TrendAnalysisDashboardProps {
  className?: string;
  embedded?: boolean;
  metricIds?: string[];
  timeRange?: string;
  onTrendAlert?: (alert: AnomalyDetection) => void;
  onError?: (error: Error) => void;
}

interface TrendConfiguration {
  metrics: string[];
  timeRange: 'last_7d' | 'last_30d' | 'last_90d' | 'last_1y' | 'last_2y' | 'custom';
  customDateRange?: {
    start: Date;
    end: Date;
  };
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  smoothing: 'none' | 'moving_average' | 'exponential' | 'polynomial';
  seasonalityDetection: boolean;
  anomalyDetection: boolean;
  forecastPeriods: number;
  confidenceInterval: number;
}

interface ForecastConfiguration {
  model: 'linear' | 'exponential' | 'arima' | 'seasonal' | 'ensemble';
  periods: number;
  confidenceLevel: 0.90 | 0.95 | 0.99;
  includeSeasonality: boolean;
  includeTrend: boolean;
  damping: boolean;
}

interface AnomalyConfiguration {
  method: 'statistical' | 'isolation_forest' | 'lstm' | 'ensemble';
  sensitivity: 'low' | 'medium' | 'high';
  threshold: number;
  seasonalAdjustment: boolean;
  minimumAnomalyDuration: number;
}

interface PatternAnalysisConfig {
  patternTypes: ('trend' | 'seasonal' | 'cyclical' | 'irregular')[];
  minPatternLength: number;
  maxPatternLength: number;
  similarityThreshold: number;
  correlationThreshold: number;
}

interface TrendInsight {
  id: string;
  type: 'trend_change' | 'seasonal_pattern' | 'anomaly' | 'forecast_deviation' | 'correlation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  metric: string;
  startDate: Date;
  endDate?: Date;
  value: number;
  expectedValue?: number;
  recommendations: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_RANGES = [
  { value: 'last_7d', label: 'Last 7 Days' },
  { value: 'last_30d', label: 'Last 30 Days' },
  { value: 'last_90d', label: 'Last 90 Days' },
  { value: 'last_1y', label: 'Last Year' },
  { value: 'last_2y', label: 'Last 2 Years' },
  { value: 'custom', label: 'Custom Range' }
];

const GRANULARITIES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const SMOOTHING_METHODS = [
  { value: 'none', label: 'None' },
  { value: 'moving_average', label: 'Moving Average' },
  { value: 'exponential', label: 'Exponential Smoothing' },
  { value: 'polynomial', label: 'Polynomial Fit' }
];

const FORECAST_MODELS = [
  { value: 'linear', label: 'Linear Regression' },
  { value: 'exponential', label: 'Exponential Smoothing' },
  { value: 'arima', label: 'ARIMA' },
  { value: 'seasonal', label: 'Seasonal Decomposition' },
  { value: 'ensemble', label: 'Ensemble Model' }
];

const ANOMALY_METHODS = [
  { value: 'statistical', label: 'Statistical (Z-Score)' },
  { value: 'isolation_forest', label: 'Isolation Forest' },
  { value: 'lstm', label: 'LSTM Neural Network' },
  { value: 'ensemble', label: 'Ensemble Methods' }
];

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
];

const METRICS_OPTIONS = [
  { value: 'catalog_usage', label: 'Catalog Usage' },
  { value: 'data_quality_score', label: 'Data Quality Score' },
  { value: 'asset_count', label: 'Asset Count' },
  { value: 'user_activity', label: 'User Activity' },
  { value: 'search_queries', label: 'Search Queries' },
  { value: 'governance_compliance', label: 'Governance Compliance' },
  { value: 'data_volume', label: 'Data Volume' },
  { value: 'processing_time', label: 'Processing Time' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TrendAnalysisDashboard: React.FC<TrendAnalysisDashboardProps> = ({
  className,
  embedded = false,
  metricIds = ['catalog_usage', 'data_quality_score', 'asset_count'],
  timeRange = 'last_30d',
  onTrendAlert,
  onError
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<string>('trends');
  const [trendConfig, setTrendConfig] = useState<TrendConfiguration>({
    metrics: metricIds,
    timeRange: timeRange as any,
    granularity: 'daily',
    smoothing: 'moving_average',
    seasonalityDetection: true,
    anomalyDetection: true,
    forecastPeriods: 30,
    confidenceInterval: 95
  });
  const [forecastConfig, setForecastConfig] = useState<ForecastConfiguration>({
    model: 'ensemble',
    periods: 30,
    confidenceLevel: 0.95,
    includeSeasonality: true,
    includeTrend: true,
    damping: false
  });
  const [anomalyConfig, setAnomalyConfig] = useState<AnomalyConfiguration>({
    method: 'ensemble',
    sensitivity: 'medium',
    threshold: 2.5,
    seasonalAdjustment: true,
    minimumAnomalyDuration: 1
  });
  const [patternConfig, setPatternConfig] = useState<PatternAnalysisConfig>({
    patternTypes: ['trend', 'seasonal', 'cyclical'],
    minPatternLength: 7,
    maxPatternLength: 365,
    similarityThreshold: 0.8,
    correlationThreshold: 0.7
  });
  const [selectedMetric, setSelectedMetric] = useState<string>(metricIds[0]);
  const [showForecast, setShowForecast] = useState<boolean>(true);
  const [showAnomalies, setShowAnomalies] = useState<boolean>(true);
  const [showSeasonality, setShowSeasonality] = useState<boolean>(false);
  const [showConfidenceBands, setShowConfidenceBands] = useState<boolean>(true);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date }>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [zoomDomain, setZoomDomain] = useState<{ start?: number; end?: number }>({});
  const [selectedInsight, setSelectedInsight] = useState<TrendInsight | null>(null);
  const [showInsightsPanel, setShowInsightsPanel] = useState<boolean>(true);

  const queryClient = useQueryClient();

  // ============================================================================
  // HOOKS & API INTEGRATION
  // ============================================================================

  const {
    generateReport,
    exportData,
    isLoading: analyticsLoading
  } = useCatalogAnalytics();

  // Fetch trend analysis data
  const { 
    data: trendAnalysis, 
    isLoading: trendLoading,
    refetch: refetchTrends 
  } = useQuery({
    queryKey: ['trend-analysis', trendConfig],
    queryFn: async () => {
      const dateRange = trendConfig.timeRange === 'custom' 
        ? { start: customDateRange.start, end: customDateRange.end }
        : { range: trendConfig.timeRange };
      
      const response = await trendAnalysisService.getTrendAnalysis({
        metrics: trendConfig.metrics,
        ...dateRange,
        granularity: trendConfig.granularity,
        smoothing: trendConfig.smoothing,
        includeSeasonality: trendConfig.seasonalityDetection,
        includeAnomalies: trendConfig.anomalyDetection
      });
      return response.data;
    }
  });

  // Fetch forecast data
  const { 
    data: forecastData,
    isLoading: forecastLoading 
  } = useQuery({
    queryKey: ['trend-forecast', selectedMetric, forecastConfig],
    queryFn: async () => {
      const response = await trendAnalysisService.generateForecast({
        metric: selectedMetric,
        ...forecastConfig,
        historicalData: trendAnalysis?.metrics[selectedMetric]?.data || []
      });
      return response.data;
    },
    enabled: !!trendAnalysis && !!selectedMetric
  });

  // Fetch anomaly detection results
  const { 
    data: anomalyData,
    isLoading: anomalyLoading 
  } = useQuery({
    queryKey: ['anomaly-detection', selectedMetric, anomalyConfig],
    queryFn: async () => {
      const response = await trendAnalysisService.detectAnomalies({
        metric: selectedMetric,
        ...anomalyConfig,
        data: trendAnalysis?.metrics[selectedMetric]?.data || []
      });
      return response.data;
    },
    enabled: !!trendAnalysis && !!selectedMetric
  });

  // Fetch pattern analysis
  const { 
    data: patternAnalysis,
    isLoading: patternLoading 
  } = useQuery({
    queryKey: ['pattern-analysis', selectedMetric, patternConfig],
    queryFn: async () => {
      const response = await trendAnalysisService.analyzePatterns({
        metric: selectedMetric,
        ...patternConfig,
        data: trendAnalysis?.metrics[selectedMetric]?.data || []
      });
      return response.data;
    },
    enabled: !!trendAnalysis && !!selectedMetric
  });

  // Fetch trend insights
  const { 
    data: trendInsights = [],
    isLoading: insightsLoading 
  } = useQuery({
    queryKey: ['trend-insights', trendConfig.metrics],
    queryFn: async () => {
      const response = await trendAnalysisService.getTrendInsights({
        metrics: trendConfig.metrics,
        timeRange: trendConfig.timeRange,
        includeForecasts: showForecast,
        includeAnomalies: showAnomalies
      });
      return response.data || [];
    }
  });

  // Fetch correlation analysis
  const { 
    data: correlationData,
    isLoading: correlationLoading 
  } = useQuery({
    queryKey: ['correlation-analysis', trendConfig.metrics],
    queryFn: async () => {
      const response = await trendAnalysisService.getCorrelationAnalysis({
        metrics: trendConfig.metrics,
        timeRange: trendConfig.timeRange
      });
      return response.data;
    },
    enabled: trendConfig.metrics.length > 1
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedMetricData = useMemo(() => {
    if (!trendAnalysis || !selectedMetric) return null;
    return trendAnalysis.metrics[selectedMetric];
  }, [trendAnalysis, selectedMetric]);

  const combinedChartData = useMemo(() => {
    if (!selectedMetricData) return [];

    const historicalData = selectedMetricData.data.map(point => ({
      timestamp: point.timestamp,
      date: format(new Date(point.timestamp), 'MMM dd'),
      actual: point.value,
      smoothed: point.smoothedValue,
      trend: point.trendValue,
      seasonal: point.seasonalValue,
      isAnomaly: anomalyData?.anomalies.some(anomaly => 
        Math.abs(new Date(anomaly.timestamp).getTime() - new Date(point.timestamp).getTime()) < 86400000
      ) || false
    }));

    if (showForecast && forecastData) {
      const forecastPoints = forecastData.forecast.map(point => ({
        timestamp: point.timestamp,
        date: format(new Date(point.timestamp), 'MMM dd'),
        forecast: point.value,
        forecastUpper: point.upperBound,
        forecastLower: point.lowerBound,
        isForecast: true
      }));

      return [...historicalData, ...forecastPoints];
    }

    return historicalData;
  }, [selectedMetricData, forecastData, anomalyData, showForecast]);

  const trendStatistics = useMemo(() => {
    if (!selectedMetricData) return null;

    const data = selectedMetricData.data;
    const values = data.map(p => p.value);
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];

    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const totalChange = ((lastValue - firstValue) / firstValue) * 100;
    
    const trendDirection = selectedMetricData.trend?.direction || 'stable';
    const trendStrength = selectedMetricData.trend?.strength || 0;

    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      totalChange: totalChange.toFixed(1),
      trendDirection,
      trendStrength: (trendStrength * 100).toFixed(1),
      dataPoints: data.length
    };
  }, [selectedMetricData]);

  const isLoading = trendLoading || forecastLoading || anomalyLoading || patternLoading;

  // ============================================================================
  // EFFECT HOOKS
  // ============================================================================

  useEffect(() => {
    // Alert on new anomalies
    if (anomalyData?.anomalies) {
      anomalyData.anomalies.forEach(anomaly => {
        if (onTrendAlert) {
          onTrendAlert(anomaly);
        }
      });
    }
  }, [anomalyData, onTrendAlert]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleMetricChange = useCallback((metric: string) => {
    setSelectedMetric(metric);
  }, []);

  const handleTimeRangeChange = useCallback((range: string) => {
    setTrendConfig(prev => ({ ...prev, timeRange: range as any }));
  }, []);

  const handleGranularityChange = useCallback((granularity: string) => {
    setTrendConfig(prev => ({ ...prev, granularity: granularity as any }));
  }, []);

  const handleSmoothingChange = useCallback((smoothing: string) => {
    setTrendConfig(prev => ({ ...prev, smoothing: smoothing as any }));
  }, []);

  const handleZoom = useCallback((domain: any) => {
    if (domain) {
      setZoomDomain({ start: domain.startIndex, end: domain.endIndex });
    } else {
      setZoomDomain({});
    }
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomDomain({});
  }, []);

  const handleExportTrends = useCallback(async () => {
    try {
      const response = await trendAnalysisService.exportTrendAnalysis({
        metrics: trendConfig.metrics,
        timeRange: trendConfig.timeRange,
        includeForecasts: showForecast,
        includeAnomalies: showAnomalies,
        format: 'PDF'
      });
      
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
      
      toast.success('Trend analysis exported successfully');
    } catch (error) {
      toast.error('Failed to export trend analysis');
      onError?.(error as Error);
    }
  }, [trendConfig, showForecast, showAnomalies, onError]);

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderTrendChart = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Analysis: {METRICS_OPTIONS.find(m => m.value === selectedMetric)?.label}
            </CardTitle>
            <CardDescription>
              Historical trends with forecasting and anomaly detection
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Checkbox 
                id="forecast"
                checked={showForecast}
                onCheckedChange={setShowForecast}
              />
              <Label htmlFor="forecast" className="text-sm">Forecast</Label>
            </div>
            <div className="flex items-center space-x-1">
              <Checkbox 
                id="anomalies"
                checked={showAnomalies}
                onCheckedChange={setShowAnomalies}
              />
              <Label htmlFor="anomalies" className="text-sm">Anomalies</Label>
            </div>
            <div className="flex items-center space-x-1">
              <Checkbox 
                id="confidence"
                checked={showConfidenceBands}
                onCheckedChange={setShowConfidenceBands}
              />
              <Label htmlFor="confidence" className="text-sm">Confidence</Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Zoom
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedChartData} onMouseDown={handleZoom}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              
              {/* Historical Data */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={2}
                name="Actual"
                dot={(props) => {
                  if (props.payload?.isAnomaly && showAnomalies) {
                    return <circle cx={props.cx} cy={props.cy} r={4} fill="#ef4444" stroke="#ef4444" strokeWidth={2} />;
                  }
                  return null;
                }}
              />
              
              {/* Smoothed Trend */}
              <Line 
                type="monotone" 
                dataKey="smoothed" 
                stroke={CHART_COLORS[1]} 
                strokeWidth={2}
                strokeDasharray="5,5"
                name="Smoothed"
                dot={false}
              />
              
              {/* Forecast */}
              {showForecast && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke={CHART_COLORS[2]} 
                    strokeWidth={2}
                    strokeDasharray="10,5"
                    name="Forecast"
                    dot={false}
                  />
                  {showConfidenceBands && (
                    <>
                      <Area 
                        type="monotone" 
                        dataKey="forecastUpper" 
                        stroke="none"
                        fill={CHART_COLORS[2]}
                        fillOpacity={0.1}
                        name="Upper Bound"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="forecastLower" 
                        stroke="none"
                        fill={CHART_COLORS[2]}
                        fillOpacity={0.1}
                        name="Lower Bound"
                      />
                    </>
                  )}
                </>
              )}
              
              {/* Brush for zooming */}
              <Brush dataKey="date" height={30} stroke={CHART_COLORS[0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderStatisticsPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Statistical Summary
        </CardTitle>
        <CardDescription>Key statistics for the selected metric</CardDescription>
      </CardHeader>
      <CardContent>
        {trendStatistics && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Mean</Label>
              <p className="text-lg font-bold">{trendStatistics.mean}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Median</Label>
              <p className="text-lg font-bold">{trendStatistics.median}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Std Deviation</Label>
              <p className="text-lg font-bold">{trendStatistics.stdDev}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Range</Label>
              <p className="text-lg font-bold">{trendStatistics.min} - {trendStatistics.max}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Total Change</Label>
              <div className="flex items-center space-x-2">
                <p className={cn(
                  "text-lg font-bold",
                  parseFloat(trendStatistics.totalChange) > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {trendStatistics.totalChange}%
                </p>
                {parseFloat(trendStatistics.totalChange) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Trend Strength</Label>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-bold">{trendStatistics.trendStrength}%</p>
                <Badge variant={
                  trendStatistics.trendDirection === 'increasing' ? 'default' :
                  trendStatistics.trendDirection === 'decreasing' ? 'destructive' :
                  'secondary'
                }>
                  {trendStatistics.trendDirection}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSeasonalityAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-4 w-4" />
          Seasonality Analysis
        </CardTitle>
        <CardDescription>Detected seasonal patterns and cycles</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedMetricData?.seasonality && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Label className="text-sm font-medium">Daily Pattern</Label>
                <p className="text-lg font-bold">
                  {selectedMetricData.seasonality.daily ? 'Detected' : 'Not Found'}
                </p>
                <Progress 
                  value={selectedMetricData.seasonality.dailyStrength * 100} 
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <Label className="text-sm font-medium">Weekly Pattern</Label>
                <p className="text-lg font-bold">
                  {selectedMetricData.seasonality.weekly ? 'Detected' : 'Not Found'}
                </p>
                <Progress 
                  value={selectedMetricData.seasonality.weeklyStrength * 100} 
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <Label className="text-sm font-medium">Monthly Pattern</Label>
                <p className="text-lg font-bold">
                  {selectedMetricData.seasonality.monthly ? 'Detected' : 'Not Found'}
                </p>
                <Progress 
                  value={selectedMetricData.seasonality.monthlyStrength * 100} 
                  className="mt-2"
                />
              </div>
            </div>

            {selectedMetricData.seasonality.patterns && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Seasonal Decomposition</Label>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={selectedMetricData.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(value) => format(new Date(value), 'MMM dd')} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="seasonalValue" 
                        stroke={CHART_COLORS[3]} 
                        strokeWidth={2}
                        name="Seasonal Component"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderAnomalyDetection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Anomaly Detection
          {anomalyData?.anomalies && anomalyData.anomalies.length > 0 && (
            <Badge variant="destructive">{anomalyData.anomalies.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>Detected anomalies and outliers in the data</CardDescription>
      </CardHeader>
      <CardContent>
        {anomalyData?.anomalies && anomalyData.anomalies.length > 0 ? (
          <div className="space-y-3">
            {anomalyData.anomalies.map((anomaly, index) => (
              <div key={index} className={cn(
                "p-3 border rounded-lg",
                anomaly.severity === 'high' && "border-red-200 bg-red-50",
                anomaly.severity === 'medium' && "border-orange-200 bg-orange-50",
                anomaly.severity === 'low' && "border-yellow-200 bg-yellow-50"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        anomaly.severity === 'high' && "text-red-500",
                        anomaly.severity === 'medium' && "text-orange-500",
                        anomaly.severity === 'low' && "text-yellow-500"
                      )} />
                      <span className="font-medium">
                        {format(new Date(anomaly.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                      <Badge variant={
                        anomaly.severity === 'high' ? 'destructive' :
                        anomaly.severity === 'medium' ? 'outline' :
                        'secondary'
                      }>
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Value: {anomaly.value.toFixed(2)} | Expected: {anomaly.expectedValue?.toFixed(2)} | 
                      Deviation: {anomaly.deviationScore.toFixed(2)}σ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Confidence</p>
                    <p className="text-lg font-bold">{(anomaly.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Anomalies Detected</h3>
            <p className="text-muted-foreground">The data appears normal within expected parameters</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderInsightsPanel = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Trend Insights
            {trendInsights.length > 0 && (
              <Badge variant="secondary">{trendInsights.length}</Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInsightsPanel(!showInsightsPanel)}
          >
            {showInsightsPanel ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>AI-generated insights and recommendations</CardDescription>
      </CardHeader>
      {showInsightsPanel && (
        <CardContent>
          <div className="space-y-4">
            {trendInsights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                  insight.severity === 'critical' && "border-red-200 bg-red-50",
                  insight.severity === 'high' && "border-orange-200 bg-orange-50",
                  insight.severity === 'medium' && "border-yellow-200 bg-yellow-50",
                  insight.severity === 'low' && "border-blue-200 bg-blue-50",
                  selectedInsight?.id === insight.id && "ring-2 ring-blue-500"
                )}
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {insight.type === 'anomaly' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      {insight.type === 'trend_change' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                      {insight.type === 'seasonal_pattern' && <Waves className="h-4 w-4 text-purple-500" />}
                      {insight.type === 'forecast_deviation' && <Target className="h-4 w-4 text-red-500" />}
                      {insight.type === 'correlation' && <Network className="h-4 w-4 text-green-500" />}
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={
                        insight.severity === 'critical' ? 'destructive' :
                        insight.severity === 'high' ? 'destructive' :
                        insight.severity === 'medium' ? 'outline' :
                        'secondary'
                      }>
                        {insight.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>Metric: {insight.metric}</span>
                      <span>Confidence: {(insight.confidence * 100).toFixed(1)}%</span>
                      <span>{format(new Date(insight.startDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Progress value={insight.confidence * 100} className="w-16 h-2" />
                  </div>
                </div>
                
                {selectedInsight?.id === insight.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t"
                  >
                    <Label className="text-sm font-medium">Recommendations:</Label>
                    <ul className="mt-2 space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-blue-500">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            ))}
            
            {trendInsights.length === 0 && (
              <div className="text-center py-8">
                <Info className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
                <p className="text-muted-foreground">
                  Insights will appear as patterns and anomalies are detected in your data
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderControlPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Configuration</CardTitle>
        <CardDescription>Configure trend analysis parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Selected Metric</Label>
          <Select value={selectedMetric} onValueChange={handleMetricChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS_OPTIONS.map((metric) => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Time Range</Label>
          <Select value={trendConfig.timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Granularity</Label>
          <Select value={trendConfig.granularity} onValueChange={handleGranularityChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRANULARITIES.map((granularity) => (
                <SelectItem key={granularity.value} value={granularity.value}>
                  {granularity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Smoothing Method</Label>
          <Select value={trendConfig.smoothing} onValueChange={handleSmoothingChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SMOOTHING_METHODS.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Seasonality Detection</Label>
            <Switch
              checked={trendConfig.seasonalityDetection}
              onCheckedChange={(checked) => 
                setTrendConfig(prev => ({ ...prev, seasonalityDetection: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Anomaly Detection</Label>
            <Switch
              checked={trendConfig.anomalyDetection}
              onCheckedChange={(checked) => 
                setTrendConfig(prev => ({ ...prev, anomalyDetection: checked }))
              }
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-2">
          <Button onClick={() => refetchTrends()} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh Analysis
          </Button>
          <Button variant="outline" onClick={handleExportTrends}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <TooltipProvider>
      <div className={cn("w-full space-y-6", className)}>
        {/* Header */}
        {!embedded && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trend Analysis Dashboard</h1>
              <p className="text-muted-foreground">
                Advanced trend analysis, forecasting, and anomaly detection for catalog metrics
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1">
                {trendConfig.metrics.length} metrics analyzed
              </Badge>
              <Button variant="outline" onClick={() => setActiveTab('config')}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Analyzing trends and patterns...</p>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        {!isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  {renderTrendChart()}
                  {renderSeasonalityAnalysis()}
                </div>
                <div className="space-y-6">
                  {renderControlPanel()}
                  {renderStatisticsPanel()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forecast" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {renderTrendChart()}
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Forecast Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Model</Label>
                        <Select 
                          value={forecastConfig.model} 
                          onValueChange={(value) => 
                            setForecastConfig(prev => ({ ...prev, model: value as any }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FORECAST_MODELS.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Forecast Periods</Label>
                        <Slider
                          value={[forecastConfig.periods]}
                          onValueChange={([value]) => 
                            setForecastConfig(prev => ({ ...prev, periods: value }))
                          }
                          min={7}
                          max={365}
                          step={1}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {forecastConfig.periods} periods
                        </p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Confidence Level</Label>
                        <Select 
                          value={forecastConfig.confidenceLevel.toString()} 
                          onValueChange={(value) => 
                            setForecastConfig(prev => ({ ...prev, confidenceLevel: parseFloat(value) as any }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.90">90%</SelectItem>
                            <SelectItem value="0.95">95%</SelectItem>
                            <SelectItem value="0.99">99%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {forecastData && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Forecast Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Model Used</span>
                            <span className="text-sm">{forecastData.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Accuracy (MAPE)</span>
                            <span className="text-sm">{forecastData.accuracy?.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Next Period</span>
                            <span className="text-sm font-bold">
                              {forecastData.forecast[0]?.value.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Trend Direction</span>
                            <Badge variant={
                              forecastData.trendDirection === 'increasing' ? 'default' :
                              forecastData.trendDirection === 'decreasing' ? 'destructive' :
                              'secondary'
                            }>
                              {forecastData.trendDirection}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="anomalies" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {renderAnomalyDetection()}
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Detection Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Detection Method</Label>
                        <Select 
                          value={anomalyConfig.method} 
                          onValueChange={(value) => 
                            setAnomalyConfig(prev => ({ ...prev, method: value as any }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ANOMALY_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Sensitivity</Label>
                        <Select 
                          value={anomalyConfig.sensitivity} 
                          onValueChange={(value) => 
                            setAnomalyConfig(prev => ({ ...prev, sensitivity: value as any }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Threshold (σ)</Label>
                        <Slider
                          value={[anomalyConfig.threshold]}
                          onValueChange={([value]) => 
                            setAnomalyConfig(prev => ({ ...prev, threshold: value }))
                          }
                          min={1}
                          max={5}
                          step={0.1}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {anomalyConfig.threshold.toFixed(1)} standard deviations
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-6">
              {renderSeasonalityAnalysis()}
              
              {patternAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pattern Recognition Results</CardTitle>
                    <CardDescription>Discovered patterns and recurring behaviors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {patternAnalysis.patterns.map((pattern, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{pattern.type}</Badge>
                            <span className="text-sm font-medium">
                              Confidence: {(pattern.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{pattern.description}</p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Length: {pattern.length} periods | 
                            Frequency: {pattern.frequency}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {renderInsightsPanel()}
              
              {correlationData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Correlation Analysis</CardTitle>
                    <CardDescription>Relationships between different metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {correlationData.correlations.map((corr, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{corr.metric1} ↔ {corr.metric2}</p>
                            <p className="text-sm text-muted-foreground">{corr.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{corr.correlation.toFixed(3)}</p>
                            <p className="text-xs text-muted-foreground">correlation</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TrendAnalysisDashboard;