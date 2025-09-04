import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
  ReferenceLine,
  ReferenceArea,
  Brush
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Target, Zap, Brain, Algorithm, Calculator, Clock, Calendar, Timer, Hourglass, ArrowUp, ArrowDown, Minus, Equal, Plus, Download, Upload, Search, Filter, RefreshCw, Settings, Share2, Bookmark, Star, Flag, Bell, Mail, Eye, Users, User, Database, Network, Server, Cpu, MemoryStick, HardDrive, Wifi, Globe, MapPin, Hash, Percent, DollarSign, Euro, Pound, AlertTriangle, CheckCircle, XCircle, Info, HelpCircle, FileText, Image, Video, Code, Link, Layers, GitBranch, History, Archive, Edit, Trash2, Copy, ExternalLink, Maximize, Minimize, MoreHorizontal, Play, Pause, Square, SkipForward, SkipBack, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib copie/utils';
import { useReporting } from '../../hooks/useReporting';
import { reportingApi } from '../../services/reporting-apis';

interface TrendAnalysisProps {
  className?: string;
  onTrendUpdate?: (trends: TrendData[]) => void;
  onForecastGenerated?: (forecast: ForecastData) => void;
  onAnomalyDetected?: (anomaly: TrendAnomaly) => void;
}

interface TrendData {
  id: string;
  metric: string;
  category: string;
  dataPoints: DataPoint[];
  trendLine: TrendLine;
  patterns: Pattern[];
  seasonality: SeasonalityData;
  anomalies: TrendAnomaly[];
  forecast: ForecastData;
  statistics: TrendStatistics;
  correlations: CorrelationData[];
  breakpoints: Breakpoint[];
  quality: TrendQuality;
  metadata: TrendMetadata;
}

interface DataPoint {
  timestamp: Date;
  value: number;
  confidence?: number;
  annotations?: string[];
  tags?: string[];
  source?: string;
}

interface TrendLine {
  type: 'linear' | 'exponential' | 'polynomial' | 'logarithmic' | 'power';
  equation: string;
  slope: number;
  intercept: number;
  rSquared: number;
  confidence: number;
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  significance: number;
}

interface Pattern {
  id: string;
  type: 'cyclic' | 'seasonal' | 'trend' | 'outlier' | 'change_point' | 'plateau';
  description: string;
  startDate: Date;
  endDate: Date;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  frequency?: number;
  amplitude?: number;
  phase?: number;
  parameters: Record<string, any>;
}

interface SeasonalityData {
  hasSeasonality: boolean;
  periods: SeasonalPeriod[];
  strength: number;
  decomposition: {
    trend: DataPoint[];
    seasonal: DataPoint[];
    residual: DataPoint[];
  };
  forecast: SeasonalForecast[];
}

interface SeasonalPeriod {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  period: number;
  amplitude: number;
  phase: number;
  confidence: number;
  peakTimes: Date[];
  troughTimes: Date[];
}

interface SeasonalForecast {
  period: string;
  expectedValue: number;
  confidence: number;
  range: { lower: number; upper: number };
}

interface TrendAnomaly {
  id: string;
  type: 'outlier' | 'level_shift' | 'trend_change' | 'seasonal_anomaly' | 'spike' | 'dip';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  zScore: number;
  confidence: number;
  description: string;
  possibleCauses: string[];
  impact: {
    duration: number;
    magnitude: number;
    affectedMetrics: string[];
  };
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
}

interface ForecastData {
  method: 'arima' | 'exponential_smoothing' | 'prophet' | 'neural_network' | 'ensemble';
  horizon: number;
  predictions: ForecastPoint[];
  accuracy: ForecastAccuracy;
  assumptions: string[];
  limitations: string[];
  updateFrequency: string;
  lastUpdated: Date;
  modelParameters: Record<string, any>;
}

interface ForecastPoint {
  timestamp: Date;
  predicted: number;
  confidence: number;
  intervals: {
    lower95: number;
    upper95: number;
    lower80: number;
    upper80: number;
    lower50: number;
    upper50: number;
  };
  factors: ForecastFactor[];
}

interface ForecastFactor {
  name: string;
  contribution: number;
  confidence: number;
  type: 'trend' | 'seasonal' | 'external' | 'cyclic';
}

interface ForecastAccuracy {
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  mase: number; // Mean Absolute Scaled Error
  smape: number; // Symmetric Mean Absolute Percentage Error
  aic: number; // Akaike Information Criterion
  bic: number; // Bayesian Information Criterion
  backtest: BacktestResult[];
}

interface BacktestResult {
  period: string;
  actualValues: number[];
  predictedValues: number[];
  accuracy: number;
  bias: number;
}

interface TrendStatistics {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  minimum: number;
  maximum: number;
  range: number;
  percentiles: Record<string, number>;
  autocorrelation: number[];
  stationarity: {
    isStationary: boolean;
    adfTest: number;
    kpssTest: number;
    pValue: number;
  };
}

interface CorrelationData {
  targetMetric: string;
  correlation: number;
  pValue: number;
  lag: number;
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  direction: 'positive' | 'negative';
  significance: 'not_significant' | 'significant' | 'highly_significant';
  causality: {
    grangerTest: number;
    direction: 'none' | 'unidirectional' | 'bidirectional';
    confidence: number;
  };
}

interface Breakpoint {
  timestamp: Date;
  type: 'mean_shift' | 'trend_change' | 'variance_change' | 'structural_break';
  confidence: number;
  impact: number;
  description: string;
  beforeStats: {
    mean: number;
    trend: number;
    variance: number;
  };
  afterStats: {
    mean: number;
    trend: number;
    variance: number;
  };
}

interface TrendQuality {
  score: number;
  completeness: number;
  consistency: number;
  accuracy: number;
  timeliness: number;
  relevance: number;
  issues: QualityIssue[];
  recommendations: string[];
}

interface QualityIssue {
  type: 'missing_data' | 'outliers' | 'inconsistency' | 'drift' | 'noise';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedPeriod: { start: Date; end: Date };
  impact: string;
  recommendation: string;
}

interface TrendMetadata {
  source: string;
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  aggregation: 'sum' | 'average' | 'count' | 'min' | 'max' | 'median';
  units: string;
  description: string;
  tags: string[];
  businessContext: string;
  lastUpdated: Date;
  dataRetention: number;
  owner: string;
  stakeholders: string[];
}

interface TrendComparison {
  baseTrend: string;
  compareTrends: string[];
  timeAlignment: 'absolute' | 'relative' | 'seasonal';
  metrics: ComparisonMetric[];
  insights: ComparisonInsight[];
}

interface ComparisonMetric {
  name: string;
  baseValue: number;
  compareValues: number[];
  differences: number[];
  percentChanges: number[];
  significance: number[];
}

interface ComparisonInsight {
  type: 'convergence' | 'divergence' | 'correlation' | 'phase_shift' | 'amplitude_diff';
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeframe: { start: Date; end: Date };
}

const TREND_TYPES = [
  { value: 'linear', label: 'Linear', description: 'Constant rate of change' },
  { value: 'exponential', label: 'Exponential', description: 'Accelerating growth or decay' },
  { value: 'polynomial', label: 'Polynomial', description: 'Curved trends with inflection points' },
  { value: 'logarithmic', label: 'Logarithmic', description: 'Diminishing rate of change' },
  { value: 'power', label: 'Power', description: 'Power law relationships' }
];

const FORECAST_METHODS = [
  { value: 'arima', label: 'ARIMA', description: 'Auto-regressive integrated moving average' },
  { value: 'exponential_smoothing', label: 'Exponential Smoothing', description: 'Weighted historical averages' },
  { value: 'prophet', label: 'Prophet', description: 'Facebook\'s time series forecasting' },
  { value: 'neural_network', label: 'Neural Network', description: 'Deep learning approach' },
  { value: 'ensemble', label: 'Ensemble', description: 'Combination of multiple methods' }
];

const TIME_HORIZONS = [
  { value: '1h', label: '1 Hour', days: 0.04 },
  { value: '6h', label: '6 Hours', days: 0.25 },
  { value: '1d', label: '1 Day', days: 1 },
  { value: '1w', label: '1 Week', days: 7 },
  { value: '1m', label: '1 Month', days: 30 },
  { value: '3m', label: '3 Months', days: 90 },
  { value: '6m', label: '6 Months', days: 180 },
  { value: '1y', label: '1 Year', days: 365 }
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  className,
  onTrendUpdate,
  onForecastGenerated,
  onAnomalyDetected
}) => {
  // Core state management
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'forecasts' | 'patterns' | 'correlations' | 'anomalies'>('overview');
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<TrendData | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<{ start: Date; end: Date } | null>(null);
  
  // Analysis configuration
  const [forecastHorizon, setForecastHorizon] = useState<string>('1m');
  const [forecastMethod, setForecastMethod] = useState<string>('ensemble');
  const [trendType, setTrendType] = useState<string>('auto');
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  const [includeSeasonality, setIncludeSeasonality] = useState<boolean>(true);
  const [detectAnomalies, setDetectAnomalies] = useState<boolean>(true);
  
  // UI states
  const [chartType, setChartType] = useState<'line' | 'area' | 'scatter' | 'decomposition'>('line');
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState<boolean>(true);
  const [showTrendLines, setShowTrendLines] = useState<boolean>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [zoomRange, setZoomRange] = useState<{ start?: number; end?: number }>({});
  
  // Dialog states
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const [showForecastDialog, setShowForecastDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Form states
  const [forecastForm, setForecastForm] = useState({
    metrics: [] as string[],
    horizon: '1m',
    method: 'ensemble',
    includeSeasonality: true,
    confidenceLevel: 95,
    externalFactors: [] as string[]
  });
  
  const [comparisonForm, setComparisonForm] = useState({
    baseTrend: '',
    compareTrends: [] as string[],
    timeAlignment: 'absolute' as 'absolute' | 'relative' | 'seasonal',
    normalization: 'none' as 'none' | 'z_score' | 'min_max' | 'percentage'
  });
  
  // Hooks
  const {
    getTrendAnalysis,
    generateForecast,
    detectTrendAnomalies,
    compareTrends,
    analyzeSeasonality,
    calculateCorrelations,
    exportTrendData,
    loading: reportingLoading,
    error: reportingError
  } = useReporting();

  // Initialize data
  useEffect(() => {
    loadTrendData();
  }, [selectedMetrics, timeRange]);

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedMetrics.length > 0) {
        loadTrendData();
      }
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [selectedMetrics]);

  // Data loading functions
  const loadTrendData = useCallback(async () => {
    if (selectedMetrics.length === 0) return;
    
    try {
      setLoading(true);
      const trendData = await getTrendAnalysis({
        metrics: selectedMetrics,
        timeRange: timeRange || {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          end: new Date()
        },
        includeSeasonality,
        detectAnomalies,
        forecastHorizon: parseInt(forecastHorizon.replace(/\D/g, '')) || 30
      });
      
      setTrends(trendData);
      
      // Detect and report anomalies
      trendData.forEach(trend => {
        trend.anomalies.forEach(anomaly => {
          if (anomaly.status === 'new' && onAnomalyDetected) {
            onAnomalyDetected(anomaly);
          }
        });
      });
      
      if (onTrendUpdate) {
        onTrendUpdate(trendData);
      }
    } catch (error) {
      console.error('Failed to load trend data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMetrics, timeRange, includeSeasonality, detectAnomalies, forecastHorizon, getTrendAnalysis, onTrendUpdate, onAnomalyDetected]);

  // Forecast generation
  const handleGenerateForecast = useCallback(async () => {
    try {
      setLoading(true);
      const forecast = await generateForecast({
        metrics: forecastForm.metrics,
        horizon: forecastForm.horizon,
        method: forecastForm.method as any,
        includeSeasonality: forecastForm.includeSeasonality,
        confidenceLevel: forecastForm.confidenceLevel,
        externalFactors: forecastForm.externalFactors
      });
      
      // Update trends with forecast data
      setTrends(prev => prev.map(trend => 
        forecastForm.metrics.includes(trend.metric) 
          ? { ...trend, forecast }
          : trend
      ));
      
      setShowForecastDialog(false);
      
      if (onForecastGenerated) {
        onForecastGenerated(forecast);
      }
    } catch (error) {
      console.error('Failed to generate forecast:', error);
    } finally {
      setLoading(false);
    }
  }, [forecastForm, generateForecast, onForecastGenerated]);

  // Trend comparison
  const handleCompareTrends = useCallback(async () => {
    try {
      setLoading(true);
      const comparison = await compareTrends({
        baseTrend: comparisonForm.baseTrend,
        compareTrends: comparisonForm.compareTrends,
        timeAlignment: comparisonForm.timeAlignment,
        normalization: comparisonForm.normalization
      });
      
      // Handle comparison results
      console.log('Trend comparison:', comparison);
      setShowComparisonDialog(false);
    } catch (error) {
      console.error('Failed to compare trends:', error);
    } finally {
      setLoading(false);
    }
  }, [comparisonForm, compareTrends]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!selectedTrend) return [];
    
    const data = selectedTrend.dataPoints.map(point => ({
      timestamp: point.timestamp.getTime(),
      date: point.timestamp.toISOString().split('T')[0],
      actual: point.value,
      confidence: point.confidence || 1
    }));
    
    // Add forecast data if available
    if (selectedTrend.forecast?.predictions) {
      selectedTrend.forecast.predictions.forEach(pred => {
        data.push({
          timestamp: pred.timestamp.getTime(),
          date: pred.timestamp.toISOString().split('T')[0],
          forecast: pred.predicted,
          lower95: pred.intervals.lower95,
          upper95: pred.intervals.upper95,
          lower80: pred.intervals.lower80,
          upper80: pred.intervals.upper80,
          confidence: pred.confidence
        });
      });
    }
    
    return data.sort((a, b) => a.timestamp - b.timestamp);
  }, [selectedTrend]);

  const trendLineData = useMemo(() => {
    if (!selectedTrend?.trendLine) return [];
    
    const { slope, intercept } = selectedTrend.trendLine;
    return chartData.map((point, index) => ({
      ...point,
      trendLine: slope * index + intercept
    }));
  }, [selectedTrend, chartData]);

  // Utility functions
  const formatNumber = (num: number, decimals: number = 2): string => {
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    }
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number, decimals: number = 1): string => {
    return `${num.toFixed(decimals)}%`;
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return TrendingUp;
      case 'decreasing': return TrendingDown;
      case 'stable': return Minus;
      default: return Activity;
    }
  };

  const getDirectionColor = (direction: string): string => {
    switch (direction) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getAnomalySeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStrengthBadgeColor = (strength: string): string => {
    switch (strength) {
      case 'very_strong': return 'bg-green-100 text-green-800';
      case 'strong': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'weak': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render functions
  const renderTrendCard = (trend: TrendData) => {
    const DirectionIcon = getDirectionIcon(trend.trendLine.direction);
    const directionColor = getDirectionColor(trend.trendLine.direction);
    
    return (
      <Card 
        key={trend.id} 
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          selectedTrend?.id === trend.id && "ring-2 ring-blue-500"
        )}
        onClick={() => setSelectedTrend(trend)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">{trend.metric}</CardTitle>
              <CardDescription>{trend.category}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStrengthBadgeColor(trend.trendLine.strength)}>
                {trend.trendLine.strength}
              </Badge>
              <div className={cn("flex items-center", directionColor)}>
                <DirectionIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">R²:</span>
                <span className="ml-2 font-medium">{trend.trendLine.rSquared.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Slope:</span>
                <span className="ml-2 font-medium">{formatNumber(trend.trendLine.slope, 4)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Data Points:</span>
                <span className="ml-2 font-medium">{trend.dataPoints.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Quality:</span>
                <span className="ml-2 font-medium">{formatPercentage(trend.quality.score)}</span>
              </div>
            </div>
            
            {trend.seasonality.hasSeasonality && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  Seasonal
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Strength: {formatPercentage(trend.seasonality.strength)}
                </span>
              </div>
            )}
            
            {trend.anomalies.length > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">
                  {trend.anomalies.filter(a => a.status === 'new').length} new anomalies
                </span>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Last updated: {trend.metadata.lastUpdated.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderChart = () => {
    if (!selectedTrend || chartData.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-muted-foreground">
          Select a trend to view the chart
        </div>
      );
    }

    const data = showTrendLines ? trendLineData : chartData;

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              {data.some(d => d.forecast !== undefined) && (
                <Area type="monotone" dataKey="forecast" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeDasharray="5 5" />
              )}
              {showConfidenceIntervals && data.some(d => d.lower95 !== undefined) && (
                <Area type="monotone" dataKey="upper95" stroke="none" fill="#e5e7eb" fillOpacity={0.3} />
              )}
              {showTrendLines && (
                <Line type="monotone" dataKey="trendLine" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" />
              )}
              <Brush dataKey="date" height={30} stroke="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} />
              <YAxis dataKey="actual" />
              <RechartsTooltip />
              <Scatter name="Data Points" dataKey="actual" fill="#3b82f6" />
              {showTrendLines && (
                <Line type="monotone" dataKey="trendLine" stroke="#ef4444" strokeWidth={2} />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'decomposition':
        if (!selectedTrend.seasonality.decomposition) {
          return (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              Decomposition data not available
            </div>
          );
        }
        
        const { trend: trendComp, seasonal, residual } = selectedTrend.seasonality.decomposition;
        const decompData = trendComp.map((point, index) => ({
          date: point.timestamp.toISOString().split('T')[0],
          trend: point.value,
          seasonal: seasonal[index]?.value || 0,
          residual: residual[index]?.value || 0,
          original: chartData[index]?.actual || 0
        }));
        
        return (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={decompData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="original" stroke="#3b82f6" strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={decompData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="trend" stroke="#10b981" strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={decompData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="seasonal" stroke="#f59e0b" strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={decompData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="residual" stroke="#ef4444" strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
              {data.some(d => d.forecast !== undefined) && (
                <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              )}
              {showConfidenceIntervals && data.some(d => d.lower95 !== undefined) && (
                <>
                  <Line type="monotone" dataKey="lower95" stroke="#e5e7eb" strokeWidth={1} strokeDasharray="2 2" />
                  <Line type="monotone" dataKey="upper95" stroke="#e5e7eb" strokeWidth={1} strokeDasharray="2 2" />
                </>
              )}
              {showTrendLines && (
                <Line type="monotone" dataKey="trendLine" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" />
              )}
              <Brush dataKey="date" height={30} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trend Analysis</h2>
          <p className="text-muted-foreground">
            Analyze patterns, forecast trends, and detect anomalies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadTrendData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowForecastDialog(true)}>
            <Brain className="h-4 w-4 mr-2" />
            Generate Forecast
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <Select value={forecastMethod} onValueChange={setForecastMethod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORECAST_METHODS.map(method => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={forecastHorizon} onValueChange={setForecastHorizon}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_HORIZONS.map(horizon => (
              <SelectItem key={horizon.value} value={horizon.value}>
                {horizon.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={includeSeasonality}
            onCheckedChange={setIncludeSeasonality}
          />
          <Label className="text-sm">Seasonality</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={detectAnomalies}
            onCheckedChange={setDetectAnomalies}
          />
          <Label className="text-sm">Anomaly Detection</Label>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Trend List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trends</CardTitle>
              <CardDescription>Available metrics for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {trends.map(renderTrendCard)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Analysis */}
        <div className="lg:col-span-3 space-y-6">
          {/* Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedTrend ? selectedTrend.metric : 'Trend Visualization'}
                  </CardTitle>
                  <CardDescription>
                    {selectedTrend ? selectedTrend.metadata.description : 'Select a trend to view analysis'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="scatter">Scatter</SelectItem>
                      <SelectItem value="decomposition">Decomposition</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-1 border rounded-lg p-1">
                    <Button 
                      size="sm" 
                      variant={showTrendLines ? 'default' : 'ghost'}
                      onClick={() => setShowTrendLines(!showTrendLines)}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={showConfidenceIntervals ? 'default' : 'ghost'}
                      onClick={() => setShowConfidenceIntervals(!showConfidenceIntervals)}
                    >
                      <Target className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={showAnnotations ? 'default' : 'ghost'}
                      onClick={() => setShowAnnotations(!showAnnotations)}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>

          {/* Trend Details */}
          {selectedTrend && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mean:</span>
                        <span className="ml-2 font-medium">{formatNumber(selectedTrend.statistics.mean)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Median:</span>
                        <span className="ml-2 font-medium">{formatNumber(selectedTrend.statistics.median)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Std Dev:</span>
                        <span className="ml-2 font-medium">{formatNumber(selectedTrend.statistics.standardDeviation)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Variance:</span>
                        <span className="ml-2 font-medium">{formatNumber(selectedTrend.statistics.variance)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Skewness:</span>
                        <span className="ml-2 font-medium">{formatNumber(selectedTrend.statistics.skewness, 3)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Kurtosis:</span>
                        <span className="ml-2 font-medium">{formatNumber(selectedTrend.statistics.kurtosis, 3)}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Stationarity Test</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={selectedTrend.statistics.stationarity.isStationary ? 'default' : 'secondary'}>
                          {selectedTrend.statistics.stationarity.isStationary ? 'Stationary' : 'Non-stationary'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          p-value: {selectedTrend.statistics.stationarity.pValue.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Forecast Accuracy */}
              {selectedTrend.forecast && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Forecast Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">MAE:</span>
                          <span className="ml-2 font-medium">{formatNumber(selectedTrend.forecast.accuracy.mae)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">MAPE:</span>
                          <span className="ml-2 font-medium">{formatPercentage(selectedTrend.forecast.accuracy.mape)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">RMSE:</span>
                          <span className="ml-2 font-medium">{formatNumber(selectedTrend.forecast.accuracy.rmse)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">MASE:</span>
                          <span className="ml-2 font-medium">{formatNumber(selectedTrend.forecast.accuracy.mase, 3)}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Model Information</h4>
                        <div className="space-y-1 text-xs">
                          <div>Method: {selectedTrend.forecast.method}</div>
                          <div>Horizon: {selectedTrend.forecast.horizon} periods</div>
                          <div>Updated: {selectedTrend.forecast.lastUpdated.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs for Additional Views */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="anomalies">
            Anomalies
            {trends.reduce((acc, trend) => acc + trend.anomalies.filter(a => a.status === 'new').length, 0) > 0 && (
              <Badge variant="destructive" className="ml-1">
                {trends.reduce((acc, trend) => acc + trend.anomalies.filter(a => a.status === 'new').length, 0)}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="patterns" className="space-y-6">
          {selectedTrend && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTrend.patterns.map(pattern => (
                <Card key={pattern.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base capitalize">{pattern.type.replace('_', ' ')}</CardTitle>
                        <CardDescription>{pattern.description}</CardDescription>
                      </div>
                      <Badge variant={pattern.impact === 'critical' ? 'destructive' : pattern.impact === 'high' ? 'secondary' : 'outline'}>
                        {pattern.impact}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Period:</span>
                        <span className="ml-2 font-medium">
                          {pattern.startDate.toLocaleDateString()} - {pattern.endDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="ml-2 font-medium">{formatPercentage(pattern.confidence)}</span>
                      </div>
                      {pattern.frequency && (
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>
                          <span className="ml-2 font-medium">{pattern.frequency}</span>
                        </div>
                      )}
                      {pattern.amplitude && (
                        <div>
                          <span className="text-muted-foreground">Amplitude:</span>
                          <span className="ml-2 font-medium">{formatNumber(pattern.amplitude)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="correlations" className="space-y-6">
          {selectedTrend && (
            <Card>
              <CardHeader>
                <CardTitle>Correlations</CardTitle>
                <CardDescription>Relationships with other metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Correlation</TableHead>
                      <TableHead>Strength</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Significance</TableHead>
                      <TableHead>Lag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTrend.correlations.map((corr, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{corr.targetMetric}</TableCell>
                        <TableCell>{corr.correlation.toFixed(3)}</TableCell>
                        <TableCell>
                          <Badge className={getStrengthBadgeColor(corr.strength)}>
                            {corr.strength}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={cn("flex items-center", corr.direction === 'positive' ? 'text-green-600' : 'text-red-600')}>
                            {corr.direction === 'positive' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                            {corr.direction}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={corr.significance === 'highly_significant' ? 'default' : corr.significance === 'significant' ? 'secondary' : 'outline'}>
                            {corr.significance.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{corr.lag}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="anomalies" className="space-y-6">
          <div className="space-y-4">
            {trends.flatMap(trend => 
              trend.anomalies.map(anomaly => (
                <Card key={anomaly.id} className={cn("border-l-4", 
                  anomaly.severity === 'critical' && "border-l-red-500",
                  anomaly.severity === 'high' && "border-l-orange-500",
                  anomaly.severity === 'medium' && "border-l-yellow-500",
                  anomaly.severity === 'low' && "border-l-blue-500"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-base">{trend.metric}</CardTitle>
                          <Badge className={getAnomalySeverityColor(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                          <Badge variant={anomaly.status === 'new' ? 'destructive' : 'outline'}>
                            {anomaly.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">{anomaly.description}</CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {anomaly.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Value:</span>
                          <span className="ml-2 font-medium">{formatNumber(anomaly.value)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Expected:</span>
                          <span className="ml-2 font-medium">{formatNumber(anomaly.expectedValue)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deviation:</span>
                          <span className="ml-2 font-medium">{formatNumber(anomaly.deviation)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Z-Score:</span>
                          <span className="ml-2 font-medium">{anomaly.zScore.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {anomaly.possibleCauses.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Possible Causes:</span>
                          <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                            {anomaly.possibleCauses.slice(0, 3).map((cause, index) => (
                              <li key={index}>{cause}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Confidence:</span>
                          <Progress value={anomaly.confidence * 100} className="w-20" />
                          <span className="text-sm font-medium">{formatPercentage(anomaly.confidence * 100)}</span>
                        </div>
                        
                        {anomaly.status === 'new' && (
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Forecast Dialog */}
      <Dialog open={showForecastDialog} onOpenChange={setShowForecastDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Forecast</DialogTitle>
            <DialogDescription>
              Configure forecast parameters for selected metrics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Metrics to Forecast</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {trends.map(trend => (
                  <div key={trend.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={forecastForm.metrics.includes(trend.metric)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setForecastForm(prev => ({ ...prev, metrics: [...prev.metrics, trend.metric] }));
                        } else {
                          setForecastForm(prev => ({ ...prev, metrics: prev.metrics.filter(m => m !== trend.metric) }));
                        }
                      }}
                    />
                    <Label className="text-sm">{trend.metric}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="forecast-horizon">Forecast Horizon</Label>
                <Select value={forecastForm.horizon} onValueChange={(value) => setForecastForm(prev => ({ ...prev, horizon: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_HORIZONS.map(horizon => (
                      <SelectItem key={horizon.value} value={horizon.value}>
                        {horizon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="forecast-method">Method</Label>
                <Select value={forecastForm.method} onValueChange={(value) => setForecastForm(prev => ({ ...prev, method: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORECAST_METHODS.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confidence-level">Confidence Level (%)</Label>
              <Input
                id="confidence-level"
                type="number"
                min="80"
                max="99"
                value={forecastForm.confidenceLevel}
                onChange={(e) => setForecastForm(prev => ({ ...prev, confidenceLevel: parseInt(e.target.value) || 95 }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={forecastForm.includeSeasonality}
                onCheckedChange={(checked) => setForecastForm(prev => ({ ...prev, includeSeasonality: !!checked }))}
              />
              <Label className="text-sm">Include seasonal patterns</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowForecastDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateForecast} disabled={loading || forecastForm.metrics.length === 0}>
              Generate Forecast
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrendAnalysis;