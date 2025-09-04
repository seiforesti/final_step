"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Brush, ComposedChart
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib copie/utils';
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity, Zap, Brain, Target, AlertTriangle, Info, Settings, Download, Maximize2, Minimize2, RefreshCw, Play, Pause, SkipForward, SkipBack, Filter, Search, Eye, EyeOff, Layers, Grid3X3, Calendar, Clock, Users, Database, Shield, CheckCircle2, XCircle, ArrowUp, ArrowDown, ArrowRight, MoreHorizontal, Lightbulb, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Types and Interfaces
export type ChartType = 
  | 'line' | 'area' | 'bar' | 'scatter' | 'pie' | 'radar' | 'composed' | 'heatmap';

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';

export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'p95' | 'p99';

export interface ChartDataPoint {
  timestamp: string | number;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
  prediction?: boolean;
  confidence?: number;
  anomaly?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartSeries {
  id: string;
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: ChartType;
  visible?: boolean;
  yAxisId?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  connectNulls?: boolean;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'correlation' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  data?: any;
  actionable?: boolean;
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'destructive';
    handler: () => void;
  }>;
}

export interface ChartAnnotation {
  id: string;
  type: 'point' | 'line' | 'area' | 'text';
  x?: number | string;
  y?: number;
  x1?: number | string;
  x2?: number | string;
  y1?: number;
  y2?: number;
  label?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface ChartConfig {
  title?: string;
  description?: string;
  type: ChartType;
  series: ChartSeries[];
  timeRange: TimeRange;
  aggregation: AggregationType;
  realTime?: boolean;
  refreshInterval?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showBrush?: boolean;
  showZoom?: boolean;
  showExport?: boolean;
  showFullscreen?: boolean;
  showInsights?: boolean;
  showPredictions?: boolean;
  showAnomalies?: boolean;
  annotations?: ChartAnnotation[];
  colors?: string[];
  height?: number;
  responsive?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface IntelligentChartProps {
  config: ChartConfig;
  data?: ChartDataPoint[];
  loading?: boolean;
  error?: string | null;
  insights?: AIInsight[];
  onConfigChange?: (config: ChartConfig) => void;
  onDataPointClick?: (point: ChartDataPoint, series: ChartSeries) => void;
  onInsightAction?: (insight: AIInsight, action: string) => void;
  onExport?: (format: 'png' | 'jpg' | 'svg' | 'pdf' | 'csv') => void;
  onRefresh?: () => void;
  className?: string;
}

export interface IntelligentChartRef {
  refresh: () => void;
  export: (format: 'png' | 'jpg' | 'svg' | 'pdf' | 'csv') => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleFullscreen: () => void;
  addAnnotation: (annotation: ChartAnnotation) => void;
  removeAnnotation: (id: string) => void;
  getInsights: () => AIInsight[];
  updateConfig: (config: Partial<ChartConfig>) => void;
}

// Default colors for chart series
const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

// Chart themes
const CHART_THEMES = {
  light: {
    background: '#ffffff',
    text: '#374151',
    grid: '#e5e7eb',
    tooltip: '#ffffff',
    border: '#d1d5db'
  },
  dark: {
    background: '#1f2937',
    text: '#f9fafb',
    grid: '#374151',
    tooltip: '#374151',
    border: '#4b5563'
  }
};

export const IntelligentChart = forwardRef<IntelligentChartRef, IntelligentChartProps>(({
  config,
  data = [],
  loading = false,
  error = null,
  insights = [],
  onConfigChange,
  onDataPointClick,
  onInsightAction,
  onExport,
  onRefresh,
  className
}, ref) => {
  // Advanced Enterprise State Management
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(config.realTime || false);
  const [selectedSeries, setSelectedSeries] = useState<string[]>(
    config.series.filter(s => s.visible !== false).map(s => s.id)
  );
  const [zoomDomain, setZoomDomain] = useState<{ x?: [number, number], y?: [number, number] } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [customTimeRange, setCustomTimeRange] = useState<{ start: string, end: string }>({
    start: '',
    end: ''
  });
  
  // Advanced enterprise analytics state
  const [advancedAnalytics, setAdvancedAnalytics] = useState({
    statisticalAnalysis: {
      enabled: true,
      metrics: {
        mean: 0,
        median: 0,
        standardDeviation: 0,
        variance: 0,
        skewness: 0,
        kurtosis: 0,
        quartiles: { q1: 0, q2: 0, q3: 0 },
        outliers: [] as ChartDataPoint[]
      }
    },
    trendAnalysis: {
      enabled: true,
      currentTrend: 'stable' as 'up' | 'down' | 'stable' | 'volatile',
      trendStrength: 0,
      seasonalityDetected: false,
      cyclicalPatterns: [] as Array<{
        period: number;
        amplitude: number;
        confidence: number;
      }>,
      changePoints: [] as Array<{
        timestamp: string;
        significance: number;
        description: string;
      }>
    },
    predictiveModeling: {
      enabled: true,
      forecastHorizon: 24, // hours
      confidenceInterval: 0.95,
      modelType: 'auto' as 'linear' | 'exponential' | 'arima' | 'lstm' | 'auto',
      predictions: [] as ChartDataPoint[],
      modelAccuracy: {
        mape: 0, // Mean Absolute Percentage Error
        rmse: 0, // Root Mean Square Error
        r2Score: 0 // R-squared
      }
    },
    anomalyDetection: {
      enabled: true,
      algorithm: 'isolation_forest' as 'isolation_forest' | 'one_class_svm' | 'local_outlier_factor',
      sensitivity: 0.1,
      detectedAnomalies: [] as Array<{
        dataPoint: ChartDataPoint;
        anomalyScore: number;
        explanation: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        suggestedAction: string;
        businessImpact: number;
      }>
    },
    businessIntelligence: {
      kpiTracking: {
        enabled: true,
        kpis: [] as Array<{
          name: string;
          currentValue: number;
          target: number;
          trend: 'improving' | 'declining' | 'stable';
          impact: 'high' | 'medium' | 'low';
          threshold: { warning: number; critical: number };
        }>
      },
      correlationAnalysis: {
        enabled: true,
        correlations: [] as Array<{
          series1: string;
          series2: string;
          correlation: number;
          pValue: number;
          significance: 'high' | 'medium' | 'low' | 'none';
          businessMeaning: string;
        }>
      },
      impactAnalysis: {
        enabled: true,
        businessMetrics: {
          revenueImpact: 0,
          costSavings: 0,
          efficiencyGains: 0,
          riskMitigation: 0,
          customerSatisfactionImpact: 0
        },
        recommendations: [] as Array<{
          priority: 'high' | 'medium' | 'low';
          category: 'optimization' | 'cost_reduction' | 'risk_management' | 'growth';
          description: string;
          expectedImpact: number;
          implementationEffort: 'low' | 'medium' | 'high';
          timeframe: string;
          dependencies: string[];
        }>
      }
    }
  });

  // Refs
  const chartRef = useRef<HTMLDivElement>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyticsWorkerRef = useRef<Worker | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Computed Values
  const currentTheme = useMemo(() => {
    const theme = config.theme === 'auto' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
      config.theme || 'light';
    return CHART_THEMES[theme];
  }, [config.theme]);

  const processedData = useMemo(() => {
    if (!data.length) return [];
    
    // Filter by selected series
    const filteredData = data.filter(point => 
      selectedSeries.some(seriesId => 
        config.series.find(s => s.id === seriesId)?.data.includes(point)
      )
    );

    // Apply time range filtering
    const now = new Date();
    let startTime: Date;
    
    switch (config.timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return filteredData;
    }

    return filteredData.filter(point => {
      const pointTime = typeof point.timestamp === 'string' ? 
        new Date(point.timestamp) : new Date(point.timestamp);
      return pointTime >= startTime;
    });
  }, [data, selectedSeries, config.timeRange, config.series]);

  const chartColors = useMemo(() => {
    return config.colors || DEFAULT_COLORS;
  }, [config.colors]);

  const visibleInsights = useMemo(() => {
    return insights.filter(insight => {
      if (!config.showInsights) return false;
      if (!config.showPredictions && insight.type === 'prediction') return false;
      if (!config.showAnomalies && insight.type === 'anomaly') return false;
      return true;
    });
  }, [insights, config.showInsights, config.showPredictions, config.showAnomalies]);

  // Effects
  useEffect(() => {
    if (config.realTime && config.refreshInterval && isPlaying) {
      refreshIntervalRef.current = setInterval(() => {
        onRefresh?.();
      }, config.refreshInterval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [config.realTime, config.refreshInterval, isPlaying, onRefresh]);

  // Handlers
  const handleConfigChange = useCallback((updates: Partial<ChartConfig>) => {
    const newConfig = { ...config, ...updates };
    onConfigChange?.(newConfig);
  }, [config, onConfigChange]);

  const handleSeriesToggle = useCallback((seriesId: string) => {
    const newSelected = selectedSeries.includes(seriesId) ?
      selectedSeries.filter(id => id !== seriesId) :
      [...selectedSeries, seriesId];
    setSelectedSeries(newSelected);
  }, [selectedSeries]);

  const handleDataPointClick = useCallback((data: any, index: number) => {
    const point = processedData[index];
    const series = config.series.find(s => s.data.includes(point));
    if (point && series) {
      onDataPointClick?.(point, series);
    }
  }, [processedData, config.series, onDataPointClick]);

  const handleExport = useCallback((format: 'png' | 'jpg' | 'svg' | 'pdf' | 'csv') => {
    onExport?.(format);
    toast.success(`Chart exported as ${format.toUpperCase()}`);
  }, [onExport]);

  const handleInsightAction = useCallback((insight: AIInsight, actionId: string) => {
    const action = insight.actions?.find(a => a.id === actionId);
    if (action) {
      action.handler();
      onInsightAction?.(insight, actionId);
    }
  }, [onInsightAction]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && chartRef.current) {
      chartRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  // Imperative Handle
  useImperativeHandle(ref, () => ({
    refresh: () => onRefresh?.(),
    export: handleExport,
    zoomIn: () => {
      // Implementation for zoom in
      toast.info('Zoom in functionality');
    },
    zoomOut: () => {
      // Implementation for zoom out
      toast.info('Zoom out functionality');
    },
    resetZoom: () => {
      setZoomDomain(null);
      toast.info('Zoom reset');
    },
    toggleFullscreen,
    addAnnotation: (annotation: ChartAnnotation) => {
      const newAnnotations = [...(config.annotations || []), annotation];
      handleConfigChange({ annotations: newAnnotations });
    },
    removeAnnotation: (id: string) => {
      const newAnnotations = config.annotations?.filter(a => a.id !== id) || [];
      handleConfigChange({ annotations: newAnnotations });
    },
    getInsights: () => visibleInsights,
    updateConfig: handleConfigChange
  }), [onRefresh, handleExport, toggleFullscreen, config.annotations, handleConfigChange, visibleInsights]);

  // Render Functions
  const renderChartHeader = () => (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {config.type === 'line' && <LineChartIcon className="h-5 w-5 text-primary" />}
          {config.type === 'bar' && <BarChart3 className="h-5 w-5 text-primary" />}
          {config.type === 'pie' && <PieChartIcon className="h-5 w-5 text-primary" />}
          {config.type === 'area' && <Activity className="h-5 w-5 text-primary" />}
          <h3 className="text-lg font-semibold">{config.title}</h3>
        </div>
        {config.description && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Real-time Controls */}
        {config.realTime && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Badge variant={isPlaying ? "default" : "secondary"}>
              {isPlaying ? "Live" : "Paused"}
            </Badge>
          </div>
        )}

        {/* Chart Type Selector */}
        <Select
          value={config.type}
          onValueChange={(value: ChartType) => handleConfigChange({ type: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="area">Area</SelectItem>
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="scatter">Scatter</SelectItem>
            <SelectItem value="pie">Pie</SelectItem>
            <SelectItem value="radar">Radar</SelectItem>
            <SelectItem value="composed">Composed</SelectItem>
          </SelectContent>
        </Select>

        {/* Time Range Selector */}
        <Select
          value={config.timeRange}
          onValueChange={(value: TimeRange) => handleConfigChange({ timeRange: value })}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1H</SelectItem>
            <SelectItem value="6h">6H</SelectItem>
            <SelectItem value="24h">24H</SelectItem>
            <SelectItem value="7d">7D</SelectItem>
            <SelectItem value="30d">30D</SelectItem>
            <SelectItem value="90d">90D</SelectItem>
            <SelectItem value="1y">1Y</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Chart Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {config.showExport && (
              <>
                <DropdownMenuItem onClick={() => handleExport('png')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('svg')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            <DropdownMenuItem onClick={() => onRefresh?.()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </DropdownMenuItem>
            
            {config.showFullscreen && (
              <DropdownMenuItem onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4 mr-2" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Fullscreen
                  </>
                )}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem onClick={() => setShowInsightsPanel(!showInsightsPanel)}>
              <Brain className="h-4 w-4 mr-2" />
              {showInsightsPanel ? 'Hide' : 'Show'} Insights
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => onRefresh?.()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (!processedData.length) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting the time range or data filters
            </p>
          </div>
        </div>
      );
    }

    const chartHeight = config.height || 400;
    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
      onClick: handleDataPointClick
    };

    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.grid} />}
              <XAxis 
                dataKey="timestamp" 
                stroke={currentTheme.text}
                fontSize={12}
              />
              <YAxis stroke={currentTheme.text} fontSize={12} />
              {config.showTooltip && (
                <Tooltip 
                  contentStyle={{
                    backgroundColor: currentTheme.tooltip,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    color: currentTheme.text
                  }}
                />
              )}
              {config.showLegend && <Legend />}
              {config.series.map((series, index) => (
                <Line
                  key={series.id}
                  dataKey="value"
                  stroke={series.color || chartColors[index % chartColors.length]}
                  strokeWidth={series.strokeWidth || 2}
                  connectNulls={series.connectNulls}
                  dot={{ fill: series.color || chartColors[index % chartColors.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: series.color || chartColors[index % chartColors.length], strokeWidth: 2 }}
                />
              ))}
              {config.annotations?.map(annotation => (
                annotation.type === 'line' && (
                  <ReferenceLine
                    key={annotation.id}
                    x={annotation.x}
                    y={annotation.y}
                    stroke={annotation.color || '#ef4444'}
                    strokeDasharray={annotation.style === 'dashed' ? '5 5' : undefined}
                    label={annotation.label}
                  />
                )
              ))}
              {config.showBrush && <Brush dataKey="timestamp" height={30} />}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.grid} />}
              <XAxis dataKey="timestamp" stroke={currentTheme.text} fontSize={12} />
              <YAxis stroke={currentTheme.text} fontSize={12} />
              {config.showTooltip && (
                <Tooltip 
                  contentStyle={{
                    backgroundColor: currentTheme.tooltip,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    color: currentTheme.text
                  }}
                />
              )}
              {config.showLegend && <Legend />}
              {config.series.map((series, index) => (
                <Area
                  key={series.id}
                  dataKey="value"
                  stroke={series.color || chartColors[index % chartColors.length]}
                  fill={series.color || chartColors[index % chartColors.length]}
                  fillOpacity={series.fillOpacity || 0.3}
                  strokeWidth={series.strokeWidth || 2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.grid} />}
              <XAxis dataKey="timestamp" stroke={currentTheme.text} fontSize={12} />
              <YAxis stroke={currentTheme.text} fontSize={12} />
              {config.showTooltip && (
                <Tooltip 
                  contentStyle={{
                    backgroundColor: currentTheme.tooltip,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    color: currentTheme.text
                  }}
                />
              )}
              {config.showLegend && <Legend />}
              {config.series.map((series, index) => (
                <Bar
                  key={series.id}
                  dataKey="value"
                  fill={series.color || chartColors[index % chartColors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={processedData}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => `${entry.category}: ${entry.value}`}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <RadarChart data={processedData}>
              <PolarGrid stroke={currentTheme.grid} />
              <PolarAngleAxis dataKey="category" tick={{ fill: currentTheme.text, fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: currentTheme.text, fontSize: 10 }} />
              {config.series.map((series, index) => (
                <Radar
                  key={series.id}
                  dataKey="value"
                  stroke={series.color || chartColors[index % chartColors.length]}
                  fill={series.color || chartColors[index % chartColors.length]}
                  fillOpacity={series.fillOpacity || 0.3}
                />
              ))}
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">
              Chart type "{config.type}" not supported
            </p>
          </div>
        );
    }
  };

  const renderInsightsPanel = () => (
    <AnimatePresence>
      {showInsightsPanel && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="absolute right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg z-10"
        >
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Insights
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInsightsPanel(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-full pb-16">
            <div className="p-4 space-y-4">
              {visibleInsights.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No insights available</p>
                </div>
              ) : (
                visibleInsights.map((insight) => (
                  <Card key={insight.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {insight.type === 'trend' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                          {insight.type === 'anomaly' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {insight.type === 'prediction' && <Sparkles className="h-4 w-4 text-purple-500" />}
                          {insight.type === 'correlation' && <Target className="h-4 w-4 text-green-500" />}
                          {insight.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-orange-500" />}
                          <CardTitle className="text-sm">{insight.title}</CardTitle>
                        </div>
                        <Badge 
                          variant={
                            insight.impact === 'critical' ? 'destructive' :
                            insight.impact === 'high' ? 'default' :
                            insight.impact === 'medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {insight.impact}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                        <span>{new Date(insight.timestamp).toLocaleString()}</span>
                      </div>
                      {insight.actionable && insight.actions && (
                        <div className="flex gap-1 flex-wrap">
                          {insight.actions.map((action) => (
                            <Button
                              key={action.id}
                              variant={action.type === 'primary' ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => handleInsightAction(insight, action.id)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <TooltipProvider>
      <div 
        ref={chartRef}
        className={cn(
          "relative bg-background border border-border rounded-lg overflow-hidden",
          isFullscreen && "fixed inset-0 z-50",
          className
        )}
      >
        {renderChartHeader()}
        
        <div className="relative">
          {renderChart()}
          {renderInsightsPanel()}
        </div>
        
        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{processedData.length} data points</span>
            <span>{selectedSeries.length} series visible</span>
            {hoveredPoint && (
              <span>Value: {hoveredPoint.value}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {config.realTime && (
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                <span>{isPlaying ? 'Live' : 'Paused'}</span>
              </div>
            )}
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});

IntelligentChart.displayName = 'IntelligentChart';

export default IntelligentChart;